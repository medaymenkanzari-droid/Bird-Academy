/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, LicenseValidationResult, LicenseStats, DeviceFingerprint, AuditLogEntry } from '../types/licensing';
import { ILicenseRepository } from '../repositories/ILicenseRepository';
import { LocalStorageLicenseRepository } from '../repositories/LocalStorageLicenseRepository';
import { DeviceFingerprintEngine } from '../engines/DeviceFingerprintEngine';
import { LicenseEngine } from '../engines/LicenseEngine';
import { LicenseValidator } from '../engines/LicenseValidator';
import { ActivationEngine } from '../engines/ActivationEngine';
import { LicenseGenerator, GenerateLicenseOptions } from '../engines/LicenseGenerator';
import { RevocationEngine } from '../engines/RevocationEngine';
import { TrialEngine } from '../engines/TrialEngine';
import { OfflineActivationEngine } from '../engines/OfflineActivationEngine';
import { IntegrityVerificationEngine, IntegrityCheckResult } from '../engines/IntegrityVerificationEngine';
import { LicenseAuditEngine } from '../engines/LicenseAuditEngine';
import { OfflineBetaValidator } from './OfflineBetaValidator';

import { assertAdminContext, isDevEnvironment } from '../../../config/appMode';
import { LmseConfigService } from '../../../config/lmseConfig';

export class LicensingService {
  private repository: ILicenseRepository;
  private static instance: LicensingService | null = null;

  constructor(repository: ILicenseRepository = new LocalStorageLicenseRepository()) {
    this.repository = repository;
  }

  public static getInstance(repo?: ILicenseRepository): LicensingService {
    if (!LicensingService.instance) {
      LicensingService.instance = new LicensingService(repo || new LocalStorageLicenseRepository());
    }
    return LicensingService.instance;
  }

  public static setInstance(service: LicensingService): void {
    LicensingService.instance = service;
  }

  public async initialize(): Promise<LicenseValidationResult> {
    return await this.validateCurrentLicense();
  }

  public async getCurrentDevice(): Promise<DeviceFingerprint> {
    return await DeviceFingerprintEngine.generateFingerprint();
  }

  public async getActiveLicense(): Promise<License | null> {
    return await this.repository.getActiveLicense();
  }

  public async validateCurrentLicense(): Promise<LicenseValidationResult> {
    return await LicenseEngine.validateCurrentEnvironment(this.repository);
  }

  /**
   * Online & Offline hybrid validation.
   * Interrogates remote backend API if network is available, falling back to local offline validation engine.
   */
  public getLmseApiBaseUrl(): string {
    return LmseConfigService.getLmseApiUrl();
  }

  /**
   * Online & Offline hybrid validation.
   * Interrogates remote backend API if network is available, falling back to local offline validation engine.
   */
  public async validateOnlineOrOffline(serverUrl?: string): Promise<LicenseValidationResult> {
    const targetUrl = serverUrl || this.getLmseApiBaseUrl();
    const isOnline = (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') ? navigator.onLine : true;
    const active = await this.getActiveLicense();

    if (isOnline && active?.key) {
      try {
        const device = await this.getCurrentDevice();
        const response = await fetch(`${targetUrl}/api/license/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey: active.key, device }),
        });

        if (response.ok) {
          const result: LicenseValidationResult = await response.json();
          if (result.status === 'revoked') {
            await this.repository.addToRevocationList(active.key);
          }
          return result;
        }
      } catch (err) {
        // Network fallback below
      }
    }

    // Fallback to offline validation
    return await this.validateCurrentLicense();
  }

  public async activateKey(key: string, holderName: string): Promise<LicenseValidationResult> {
    const cleanKey = key.trim().toUpperCase();
    const device = await this.getCurrentDevice();

    // 1. Try local activation first
    const localResult = await ActivationEngine.activateKey(this.repository, cleanKey, holderName, device);
    if (localResult.isValid) {
      return localResult;
    }

    // If local check failed for a specific reason (CORRUPTED, EXPIRED, LICENSE_REVOKED, DEVICE_LIMIT_EXCEEDED, MISSING_KEY), return local result
    if (localResult.code && localResult.code !== 'KEY_NOT_FOUND') {
      return localResult;
    }

    // 2. If local check fails with KEY_NOT_FOUND (new key created on Admin), attempt online activation if connected
    const isOnline = (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') ? navigator.onLine : true;
    if (isOnline) {
      let baseUrl = '';
      try {
        baseUrl = this.getLmseApiBaseUrl();
      } catch (configErr: any) {
        return {
          isValid: false,
          status: 'pending_activation',
          license: null,
          code: 'INVALID_API_CONFIGURATION',
          message: configErr?.message || 'Configuration d\'URL API LMSE invalide pour cet environnement.',
          remainingDays: null,
          deviceRegistered: false,
        };
      }

      try {
        const response = await fetch(`${baseUrl}/api/license/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey: cleanKey, device, holderName }),
        });

        if (response.ok) {
          const result: LicenseValidationResult = await response.json();
          if (result.isValid && result.license) {
            // Verify cryptographic signature & checksum locally (without private key)
            const validation = await LicenseValidator.validateLicense(result.license, device);
            if (validation.isValid) {
              await this.repository.saveActiveLicense(result.license);
              await this.repository.setMonotonicTimeMarker(new Date().toISOString());
              await this.repository.addAuditLog({
                action: 'ACTIVATE',
                licenseId: result.license.id,
                licenseKey: result.license.key,
                deviceId: device.deviceId,
                details: `Licence activée avec succès en ligne depuis l'autorité LMSE pour ${result.license.holderName}.`,
                success: true,
              });
              return validation;
            }
          } else if (result.code) {
            return result;
          }
        } else {
          const errorBody = await response.json().catch(() => ({}));
          if (errorBody && errorBody.code) {
            return errorBody;
          }
          return {
            isValid: false,
            status: 'pending_activation',
            license: null,
            code: response.status === 404 ? 'KEY_NOT_FOUND' : 'LMSE_SERVER_ERROR',
            message: errorBody?.message || `Erreur de communication avec le serveur LMSE (HTTP ${response.status}).`,
            remainingDays: null,
            deviceRegistered: false,
          };
        }
      } catch (err: any) {
        return {
          isValid: false,
          status: 'pending_activation',
          license: null,
          code: 'LMSE_BACKEND_UNREACHABLE',
          message: `Impossible de contacter le serveur backend LMSE (${baseUrl}). ${err?.message || 'Erreur de connexion réseau.'}`,
          remainingDays: null,
          deviceRegistered: false,
        };
      }
    }

    return localResult;
  }

  public async deactivateDevice(licenseId: string, deviceId: string): Promise<boolean> {
    return await ActivationEngine.deactivateDevice(this.repository, licenseId, deviceId);
  }

  private getAdminSessionToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('lmse_admin_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.token || null;
        }
      } catch {
        // Fallback
      }
    }
    return null;
  }

  private getAdminApiBaseUrl(): string {
    return this.getLmseApiBaseUrl();
  }

  public async createLicense(options: GenerateLicenseOptions): Promise<License> {
    assertAdminContext();

    const token = this.getAdminSessionToken();
    if (token && typeof window !== 'undefined') {
      const baseUrl = this.getAdminApiBaseUrl();
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/api/admin/licenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(options),
        });
      } catch (err: any) {
        throw new Error('Impossible de contacter le serveur LMSE.');
      }

      let data: any = {};
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (e) {
        data = {};
      }

      if (response.status === 401) {
        throw new Error(data.message || 'Authentification administrateur expirée.');
      }
      if (response.status === 403) {
        throw new Error(data.message || 'Vous n\'avez pas les permissions nécessaires.');
      }
      if (response.status === 400 || response.status === 422) {
        throw new Error(data.message || 'Les paramètres de licence sont invalides.');
      }
      if (!response.ok || !data.success || !data.license) {
        throw new Error(data.message || 'Erreur lors de la signature de la licence par le serveur LMSE.');
      }

      await this.repository.saveLicense(data.license);
      return data.license;
    }

    const license = await LicenseGenerator.generateLicense(options);
    await this.repository.saveLicense(license);
    await this.repository.addAuditLog({
      action: 'CREATE',
      licenseId: license.id,
      licenseKey: license.key,
      details: `Création de licence [${license.type}] pour ${license.holderName}.`,
      success: true,
    });
    return license;
  }

  public async revokeLicense(licenseId: string, reason: string): Promise<License | null> {
    assertAdminContext();

    const token = this.getAdminSessionToken();
    if (token && typeof window !== 'undefined') {
      const baseUrl = this.getAdminApiBaseUrl();
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/api/admin/licenses/${licenseId}/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        });
      } catch (err: any) {
        throw new Error('Impossible de contacter le serveur LMSE.');
      }

      let data: any = {};
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (e) {
        data = {};
      }

      if (response.status === 401) {
        throw new Error(data.message || 'Authentification administrateur expirée.');
      }
      if (response.status === 403) {
        throw new Error(data.message || 'Vous n\'avez pas les permissions nécessaires.');
      }
      if (!response.ok || !data.success || !data.license) {
        throw new Error(data.message || 'Échec de la révocation de la licence par le serveur LMSE.');
      }

      await this.repository.saveLicense(data.license);
      await this.repository.addToRevocationList(data.license.key);
      return data.license;
    }

    return await RevocationEngine.revokeLicense(this.repository, licenseId, reason);
  }

  public async generateOfflineChallenge(licenseKey: string): Promise<string> {
    const device = await this.getCurrentDevice();
    const active = await this.repository.getLicenseByKey(licenseKey);
    const type = active?.type || 'commercial';
    return await OfflineActivationEngine.generateChallengeCode(device, licenseKey, type);
  }

  public async activateOffline(
    licenseKey: string,
    holderName: string,
    challengeCode: string,
    activationCode: string
  ): Promise<LicenseValidationResult> {
    const isValid = await OfflineActivationEngine.verifyActivationCode(challengeCode, licenseKey, activationCode);
    if (!isValid) {
      await this.repository.addAuditLog({
        action: 'ACTIVATE',
        licenseKey,
        details: 'Échec d\'activation hors ligne: Code de réponse invalide.',
        success: false,
      });
      return {
        isValid: false,
        status: 'pending_activation',
        license: null,
        code: 'INVALID_OFFLINE_CODE',
        message: 'Code d\'activation hors ligne invalide.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // Activate license
    const device = await this.getCurrentDevice();
    const result = await this.activateKey(licenseKey, holderName);
    if (result.isValid && result.license) {
      result.license.activations = result.license.activations.map(a => 
        a.fingerprint.deviceId === device.deviceId
          ? { ...a, isOffline: true }
          : a
      );
      await this.repository.saveActiveLicense(result.license);
    }
    return result;
  }

  public async importOfflineBetaLicense(fileContent: string): Promise<LicenseValidationResult> {
    const device = await this.getCurrentDevice();
    const revocationList = await this.repository.getRevocationList();
    const existingActive = await this.repository.getActiveLicense();

    const result = await OfflineBetaValidator.validateFile(
      fileContent,
      device,
      revocationList,
      existingActive
    );

    if (result.isValid && result.license) {
      await this.repository.saveActiveLicense(result.license);
      await this.repository.saveLicense(result.license);
      await this.repository.setMonotonicTimeMarker(new Date().toISOString());
      await this.repository.addAuditLog({
        action: 'IMPORT',
        licenseId: result.license.id,
        licenseKey: result.license.key,
        deviceId: device.deviceId,
        details: `Importation et activation réussies de la licence Beta Offline pour ${result.license.holderName}.`,
        success: true,
      });
    } else {
      await this.repository.addAuditLog({
        action: 'IMPORT',
        details: `Échec d'importation de licence Beta Offline: ${result.message}`,
        success: false,
      });
    }

    return result;
  }

  public async checkIntegrity(): Promise<IntegrityCheckResult> {
    const active = await this.repository.getActiveLicense();
    const timeMarker = await this.repository.getMonotonicTimeMarker();
    const res = await IntegrityVerificationEngine.checkIntegrity(active, timeMarker);
    
    if (res.tamperDetected) {
      await this.repository.addAuditLog({
        action: 'TAMPER_DETECTED',
        licenseId: active?.id,
        licenseKey: active?.key,
        details: `Alerte d'intégrité: ${res.issues.join(' | ')}`,
        success: false,
      });
    }

    return res;
  }

  public async getAllLicenses(): Promise<License[]> {
    assertAdminContext();

    const token = this.getAdminSessionToken();
    if (token && typeof window !== 'undefined') {
      const baseUrl = this.getAdminApiBaseUrl();
      try {
        const response = await fetch(`${baseUrl}/api/admin/licenses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.licenses)) {
            for (const lic of data.licenses) {
              await this.repository.saveLicense(lic);
            }
            return data.licenses;
          }
        }
      } catch {
        // Fallback to local repository on network issue
      }
    }

    return await this.repository.getAllLicenses();
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    const token = this.getAdminSessionToken();
    if (token && typeof window !== 'undefined') {
      const baseUrl = this.getAdminApiBaseUrl();
      try {
        const response = await fetch(`${baseUrl}/api/admin/audit`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.auditLogs)) {
            return data.auditLogs;
          }
        }
      } catch {
        // Fallback
      }
    }

    return await LicenseAuditEngine.getAuditLogs(this.repository);
  }

  public async getStats(): Promise<LicenseStats> {
    const token = this.getAdminSessionToken();
    if (token && typeof window !== 'undefined') {
      const baseUrl = this.getAdminApiBaseUrl();
      try {
        const response = await fetch(`${baseUrl}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.stats) {
            return data.stats;
          }
        }
      } catch {
        // Fallback
      }
    }

    return await LicenseAuditEngine.generateStats(this.repository);
  }

  public async exportLicensingData(): Promise<string> {
    assertAdminContext();
    const licenses = await this.getAllLicenses();
    const active = await this.getActiveLicense();
    const auditLogs = await this.getAuditLogs();
    const revocations = await this.repository.getRevocationList();

    const data = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      active,
      licenses,
      auditLogs,
      revocations,
    };

    await this.repository.addAuditLog({
      action: 'EXPORT',
      details: 'Exportation de l\'archive des données de licensing.',
      success: true,
    });

    return JSON.stringify(data, null, 2);
  }

  public async importLicensingData(jsonString: string): Promise<{ success: boolean; importedCount: number; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.licenses)) {
        return { success: false, importedCount: 0, message: 'Format de fichier d\'importation invalide.' };
      }

      let count = 0;
      for (const lic of parsed.licenses) {
        if (lic.id && lic.key && lic.checksum && lic.signature) {
          await this.repository.saveLicense(lic);
          count++;
        }
      }

      if (parsed.active) {
        await this.repository.saveActiveLicense(parsed.active);
      }

      if (Array.isArray(parsed.revocations)) {
        for (const rev of parsed.revocations) {
          await this.repository.addToRevocationList(rev);
        }
      }

      await this.repository.addAuditLog({
        action: 'IMPORT',
        details: `Importation réussie de ${count} licence(s).`,
        success: true,
      });

      return { success: true, importedCount: count, message: `${count} licence(s) importée(s) avec succès.` };
    } catch (e) {
      return { success: false, importedCount: 0, message: `Erreur d'importation: ${(e as Error).message}` };
    }
  }

  /**
   * QA / DEV EXCLUSIVE: Resets local client license state to allow testing B-011 security scenarios.
   * - Restores first-launch unactivated state
   * - Preserves 100% of breeding data (birds, couples, cages, etc.)
   * - Leaves LMSE backend server untouched
   * - Blocked in strict production environments
   */
  public async resetLocalLicenseStateForQA(): Promise<void> {
    if (!isDevEnvironment()) {
      throw new Error('[SECURITY] QA license reset is strictly disabled in production builds.');
    }
    await this.repository.clearActiveLicense();
    const storage = (typeof window !== 'undefined' && window.localStorage)
      ? window.localStorage
      : ((typeof globalThis !== 'undefined' && (globalThis as any).localStorage) ? (globalThis as any).localStorage : null);
    if (storage) {
      storage.removeItem('bird_academy_lmse_active_license');
      storage.removeItem('bird_academy_lmse_all_licenses');
      storage.removeItem('bird_academy_lmse_revocation_list');
      storage.removeItem('bird_academy_lmse_audit_logs');
      storage.removeItem('bird_academy_lmse_last_known_timestamp');
      storage.removeItem('bird_academy_subscription_tier_override');
      storage.removeItem('bird_academy_assistant_tier_override');
    }
  }
}

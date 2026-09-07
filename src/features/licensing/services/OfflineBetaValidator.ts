/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - OFFLINE BETA VALIDATOR
 * User-safe offline license validator. Zero admin dependencies. Zero private key access.
 */

import { License, LicenseValidationResult, DeviceFingerprint, LmseLicenseFile, LicenseStatus } from '../types/licensing';
import { CryptoService } from './CryptoService';
import { KeyValidator } from '../validators/KeyValidator';

export class OfflineBetaValidator {
  /**
   * Parses, validates, and evaluates a .lmse license file string or QR code payload
   */
  static async validateFile(
    fileContent: string,
    currentDevice: DeviceFingerprint,
    revocationList: string[] = [],
    existingLicense?: License | null,
    now: Date = new Date()
  ): Promise<LicenseValidationResult> {
    if (!fileContent || !fileContent.trim()) {
      return {
        isValid: false,
        status: 'pending_activation',
        license: null,
        code: 'INVALID_FILE',
        message: 'Le contenu du fichier de licence est vide.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 1. JSON Parsing
    let parsed: any;
    try {
      const sanitized = fileContent.replace(/^\uFEFF/, '').trim();
      parsed = JSON.parse(sanitized);
    } catch {
      return {
        isValid: false,
        status: 'suspended',
        license: null,
        code: 'INVALID_JSON_FORMAT',
        message: 'Fichier .lmse invalide : structure JSON corrompue.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 2. Format & Version Check
    if (parsed.format !== 'bird-academy-lmse') {
      return {
        isValid: false,
        status: 'suspended',
        license: null,
        code: 'UNSUPPORTED_FORMAT',
        message: 'Format de fichier non reconnu. Attendu : bird-academy-lmse.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    if (parsed.version !== 1) {
      return {
        isValid: false,
        status: 'suspended',
        license: null,
        code: 'UNSUPPORTED_VERSION',
        message: `Version de fichier licence non supportée (${parsed.version}).`,
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    const lic = parsed.license;
    if (!lic || !lic.id || !lic.key || !lic.holderName || !parsed.checksum || !parsed.signature) {
      return {
        isValid: false,
        status: 'suspended',
        license: null,
        code: 'CORRUPTED',
        message: 'Fichier de licence incomplet ou corrompu (champs obligatoires manquants).',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 3. Key Format Check
    const keyCheck = KeyValidator.validateFormat(lic.key);
    if (!keyCheck.isValid) {
      return {
        isValid: false,
        status: 'suspended',
        license: null,
        code: 'INVALID_KEY_FORMAT',
        message: keyCheck.error || 'Format de clé invalide.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 4. Checksum Verification
    const payloadToSign = `${lic.id}:${lic.key}:${lic.holderName}:${lic.type}:${lic.issuedAt}:${lic.expiresAt || 'NEVER'}:${lic.maxDevices}`;
    const computedChecksum = await CryptoService.sha256(payloadToSign);
    
    if (computedChecksum.toLowerCase() !== parsed.checksum.toLowerCase()) {
      return {
        isValid: false,
        status: 'suspended',
        license: null,
        code: 'INVALID_CHECKSUM',
        message: 'Checksum invalide : le contenu du fichier .lmse a été altéré.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 5. Digital Signature Verification
    const signatureValid = await CryptoService.verifySignature(computedChecksum, parsed.signature);
    if (!signatureValid) {
      return {
        isValid: false,
        status: 'suspended',
        license: null,
        code: 'INVALID_SIGNATURE',
        message: 'Signature numérique invalide : échec de la vérification par le Centre d\'Administration.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 6. Revocation Check
    const isRevoked = revocationList.some(
      r => r.toUpperCase() === lic.key.toUpperCase() || r.toUpperCase() === parsed.checksum.toUpperCase()
    );
    if (isRevoked) {
      return {
        isValid: false,
        status: 'revoked',
        license: null,
        code: 'LICENSE_REVOKED',
        message: 'Cette licence a été révoquée par l\'administrateur.',
        remainingDays: 0,
        deviceRegistered: false,
      };
    }

    // 7. Expiration Check
    let remainingDays: number | null = null;
    if (lic.expiresAt) {
      const expTime = new Date(lic.expiresAt).getTime();
      const diffMs = expTime - now.getTime();
      remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffMs <= 0) {
        return {
          isValid: false,
          status: 'expired',
          license: null,
          code: 'EXPIRED',
          message: 'La licence a expiré.',
          remainingDays: 0,
          deviceRegistered: false,
        };
      }
    }

    // Construct valid License entity representation
    const maxDevices = lic.maxDevices || 1;
    const licenseStatus: LicenseStatus = 'OFFLINE_BETA';
    const constructedLicense: License = {
      id: lic.id,
      key: lic.key,
      holderName: lic.holderName,
      holderEmail: lic.holderEmail,
      type: lic.type || 'commercial',
      status: licenseStatus,
      issuedAt: lic.issuedAt,
      expiresAt: lic.expiresAt,
      policy: {
        maxDevices,
        allowOfflineActivation: true,
        allowTransfer: false,
        features: lic.features || (lic.type === 'beta' ? ['core', 'beta_access', 'offline_mode'] : ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf']),
      },
      activations: [],
      revokedAt: null,
      revocationReason: null,
      checksum: parsed.checksum,
      signature: parsed.signature,
      metadata: {
        isOfflineBeta: lic.type === 'beta',
        isCommercial: lic.type !== 'beta',
        commercialTier: lic.features?.includes('tier:pro') ? 'PRO' : (lic.features?.includes('tier:free') ? 'FREE' : (lic.features?.includes('tier:premium') ? 'PREMIUM' : (lic.type === 'enterprise' ? 'PRO' : (lic.type === 'evaluation' ? 'FREE' : 'PREMIUM')))),
        activatedOfflineAt: now.toISOString(),
      },
    };

    // 8. Device Binding & Limit Check
    if (existingLicense && existingLicense.id === lic.id && existingLicense.activations.length > 0) {
      // Retain existing activations
      constructedLicense.activations = existingLicense.activations;
      
      const isAlreadyBoundToThisDevice = existingLicense.activations.some(
        a => a.fingerprint.deviceId === currentDevice.deviceId
      );

      if (!isAlreadyBoundToThisDevice) {
        if (existingLicense.activations.length >= maxDevices) {
          return {
            isValid: false,
            status: 'suspended',
            license: constructedLicense,
            code: 'DEVICE_LIMIT_EXCEEDED',
            message: `Nombre maximal d'appareils (${maxDevices}) atteint. Importation refusée sur ce second appareil.`,
            remainingDays,
            deviceRegistered: false,
          };
        }
      }
    }

    // Add current device activation if not present
    const alreadyRegistered = constructedLicense.activations.some(a => a.fingerprint.deviceId === currentDevice.deviceId);
    if (!alreadyRegistered) {
      if (constructedLicense.activations.length >= maxDevices) {
        return {
          isValid: false,
          status: 'suspended',
          license: constructedLicense,
          code: 'DEVICE_LIMIT_EXCEEDED',
          message: `Nombre maximal d'appareils (${maxDevices}) atteint. Importation refusée sur cet appareil.`,
          remainingDays,
          deviceRegistered: false,
        };
      }

      constructedLicense.activations.push({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        licenseId: lic.id,
        licenseKey: lic.key,
        fingerprint: currentDevice,
        activatedAt: now.toISOString(),
        lastVerifiedAt: now.toISOString(),
        isOffline: true,
      });
    }

    return {
      isValid: true,
      status: licenseStatus,
      license: constructedLicense,
      code: 'VALID',
      message: 'Licence validée et activée avec succès.',
      remainingDays,
      deviceRegistered: true,
    };
  }
}

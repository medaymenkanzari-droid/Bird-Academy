/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL LICENSE ADMIN SERVICE
 * Orchestrates administrative commercial license operations strictly offline.
 */

import { License, LicenseStatus, LicenseType } from '../../types/licensing';
import { SubscriptionTier } from '../../../subscription/types/subscription';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { ILicenseRepository } from '../../repositories/ILicenseRepository';
import { LocalStorageLicenseRepository } from '../../repositories/LocalStorageLicenseRepository';
import { LicenseGenerator, GenerateLicenseOptions } from '../../engines/LicenseGenerator';
import { LicenseValidator } from '../../engines/LicenseValidator';
import { LicenseLifecycleEngine } from '../../engines/LicenseLifecycleEngine';
import { DeviceFingerprintEngine } from '../../engines/DeviceFingerprintEngine';
import { assertAdminContext } from '../../../../config/appMode';
import {
  CommercialAdminStats,
  LicenseCreationFormValues,
  LicenseFilterState,
  RenewalDialogValues,
  ReplacementDialogValues,
  TierChangeDialogValues
} from '../types/adminLicensing';

export class CommercialLicenseAdminService {
  private repository: ILicenseRepository;
  private static instance: CommercialLicenseAdminService | null = null;

  constructor(repository: ILicenseRepository = new LocalStorageLicenseRepository()) {
    this.repository = repository;
  }

  public static getInstance(repo?: ILicenseRepository): CommercialLicenseAdminService {
    if (!CommercialLicenseAdminService.instance || (repo && CommercialLicenseAdminService.instance.repository !== repo)) {
      CommercialLicenseAdminService.instance = new CommercialLicenseAdminService(
        repo || new LocalStorageLicenseRepository()
      );
    }
    return CommercialLicenseAdminService.instance;
  }

  public static setInstance(service: CommercialLicenseAdminService): void {
    CommercialLicenseAdminService.instance = service;
  }

  /**
   * Generates a new commercial license with cryptographic signing and post-generation validation.
   */
  public async createCommercialLicense(values: LicenseCreationFormValues): Promise<License> {
    assertAdminContext();

    if (!values.holderName || !values.holderName.trim()) {
      throw new Error('Le nom du titulaire est obligatoire.');
    }

    const tierFeatureTag = `tier:${values.tier.toLowerCase()}`;
    const baseFeatures = (values.customFeatures && values.customFeatures.length > 0)
      ? values.customFeatures
      : (values.tier === 'PRO'
          ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'multi_user', 'audit_trail', 'tier:pro']
          : values.tier === 'PREMIUM'
            ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'tier:premium']
            : ['core', 'tier:free']);

    const features = Array.from(new Set([...baseFeatures, tierFeatureTag]));

    const options: GenerateLicenseOptions = {
      holderName: values.holderName.trim(),
      holderEmail: values.holderEmail?.trim() || undefined,
      type: values.type,
      durationDays: values.durationDays,
      maxDevices: values.maxDevices,
      customFeatures: features,
      metadata: {
        commercialTier: values.tier,
        notes: values.notes || '',
        isOfflineOnly: values.isOfflineOnly ?? true,
        createdBy: 'ADMIN_CONSOLE',
        createdAt: new Date().toISOString(),
      },
    };

    const license = await LicenseGenerator.generateLicense(options);

    // Cryptographic post-generation validation check
    const device = await DeviceFingerprintEngine.generateFingerprint();
    const validation = await LicenseValidator.validateLicense(license, device);
    if (!validation.isValid && validation.code !== 'UNREGISTERED_DEVICE' && validation.code !== 'PENDING_ACTIVATION') {
      throw new Error(`Échec de validation cryptographique post-génération: ${validation.message}`);
    }

    await this.repository.saveLicense(license);
    await this.repository.addAuditLog({
      action: 'CREATE',
      licenseId: license.id,
      licenseKey: license.key,
      details: `Création de licence commerciale [${values.tier}] pour ${license.holderName}.`,
      success: true,
    });

    return license;
  }

  /**
   * Renews an existing license for a specified duration using LicenseLifecycleEngine.
   */
  public async renewLicense(values: RenewalDialogValues): Promise<License> {
    assertAdminContext();
    const existing = await this.repository.getLicenseById(values.licenseId);
    if (!existing) {
      throw new Error(`Licence ${values.licenseId} introuvable.`);
    }

    const tier = SubscriptionTierResolver.resolve(existing);
    const renewedTarget = await this.createCommercialLicense({
      tier,
      type: existing.type,
      holderName: existing.holderName,
      holderEmail: existing.holderEmail,
      durationDays: values.durationDays,
      maxDevices: existing.policy?.maxDevices || 1,
      customFeatures: existing.policy?.features || [],
      notes: `Renouvellement de la licence ${existing.id}. ${values.notes || ''}`.trim(),
    });

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.renew(existing, renewedTarget);

    await this.repository.saveLicense(archivedLicense);
    await this.repository.saveLicense(activeLicense);
    
    const active = await this.repository.getActiveLicense();
    if (active && active.id === existing.id) {
      await this.repository.saveActiveLicense(activeLicense);
    }

    await this.repository.addAuditLog({
      action: 'ACTIVATE',
      licenseId: activeLicense.id,
      licenseKey: activeLicense.key,
      details: `Renouvellement de la licence jusqu'au ${activeLicense.expiresAt || 'Illimitée'}.`,
      success: true,
    });

    return activeLicense;
  }

  /**
   * Replaces an existing license with a newly generated license.
   */
  public async replaceLicense(values: ReplacementDialogValues): Promise<{ replaced: License; active: License }> {
    assertAdminContext();
    const oldLic = await this.repository.getLicenseById(values.oldLicenseId);
    if (!oldLic) {
      throw new Error(`Licence source ${values.oldLicenseId} introuvable.`);
    }

    const newLic = await this.createCommercialLicense({
      tier: values.targetTier,
      type: oldLic.type,
      holderName: values.holderName || oldLic.holderName,
      holderEmail: values.holderEmail || oldLic.holderEmail,
      durationDays: values.durationDays,
      maxDevices: oldLic.policy?.maxDevices || 1,
      customFeatures: [],
      notes: `Remplacement de la licence ${oldLic.id}. Raison: ${values.reason}`,
    });

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.replace(oldLic, newLic, values.reason);

    await this.repository.saveLicense(archivedLicense);
    await this.repository.saveLicense(activeLicense);
    await this.repository.saveActiveLicense(activeLicense);

    await this.repository.addAuditLog({
      action: 'ACTIVATE',
      licenseId: activeLicense.id,
      licenseKey: activeLicense.key,
      details: `Remplacement de licence ${oldLic.id} par ${activeLicense.id}. Raison: ${values.reason}`,
      success: true,
    });

    return { replaced: archivedLicense, active: activeLicense };
  }

  /**
   * Upgrades a license to a higher commercial tier.
   */
  public async upgradeLicense(
    valuesOrId: TierChangeDialogValues | string,
    maybeTargetTier?: SubscriptionTier
  ): Promise<License> {
    assertAdminContext();
    const licenseId = typeof valuesOrId === 'string' ? valuesOrId : valuesOrId.licenseId;
    const current = await this.repository.getLicenseById(licenseId);
    if (!current) {
      throw new Error(`Licence ${licenseId} introuvable.`);
    }

    const currentTier = SubscriptionTierResolver.resolve(current);
    const targetTier = typeof valuesOrId === 'string'
      ? (maybeTargetTier || 'PRO')
      : valuesOrId.targetTier;
    const reason = typeof valuesOrId === 'string'
      ? 'Upgrade commercial'
      : (valuesOrId.reason || 'Upgrade commercial');
    const durationDays = typeof valuesOrId === 'string'
      ? null
      : (valuesOrId.durationDays ?? null);

    const targetType = targetTier === 'PRO' ? 'enterprise' : 'commercial';
    const upgradedTarget = await this.createCommercialLicense({
      tier: targetTier,
      type: targetType,
      holderName: current.holderName,
      holderEmail: current.holderEmail,
      durationDays,
      maxDevices: targetTier === 'PRO' ? 25 : 5,
      customFeatures: [],
      notes: `Upgrade depuis ${currentTier} vers ${targetTier}. Raison: ${reason}`,
    });

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.upgrade(current, upgradedTarget);
    await this.repository.saveLicense(archivedLicense);
    await this.repository.saveLicense(activeLicense);
    await this.repository.saveActiveLicense(activeLicense);

    await this.repository.addAuditLog({
      action: 'ACTIVATE',
      licenseId: activeLicense.id,
      licenseKey: activeLicense.key,
      details: `Upgrade commercial de ${currentTier} vers ${targetTier}.`,
      success: true,
    });

    return activeLicense;
  }

  /**
   * Downgrades a license to a lower commercial tier with strict zero data loss guarantee.
   */
  public async downgradeLicense(
    valuesOrId: TierChangeDialogValues | string,
    maybeTargetTier?: SubscriptionTier
  ): Promise<License> {
    assertAdminContext();
    const licenseId = typeof valuesOrId === 'string' ? valuesOrId : valuesOrId.licenseId;
    const current = await this.repository.getLicenseById(licenseId);
    if (!current) {
      throw new Error(`Licence ${licenseId} introuvable.`);
    }

    const currentTier = SubscriptionTierResolver.resolve(current);
    const targetTier = typeof valuesOrId === 'string'
      ? (maybeTargetTier || 'PREMIUM')
      : valuesOrId.targetTier;
    const reason = typeof valuesOrId === 'string'
      ? 'Downgrade commercial'
      : (valuesOrId.reason || 'Downgrade commercial');
    const durationDays = typeof valuesOrId === 'string'
      ? null
      : (valuesOrId.durationDays ?? null);

    const targetType = targetTier === 'PREMIUM' ? 'commercial' : 'temporary';
    const downgradedTarget = await this.createCommercialLicense({
      tier: targetTier,
      type: targetType,
      holderName: current.holderName,
      holderEmail: current.holderEmail,
      durationDays,
      maxDevices: targetTier === 'PREMIUM' ? 3 : 1,
      customFeatures: [],
      notes: `Downgrade depuis ${currentTier} vers ${targetTier}. Raison: ${reason}`,
    });

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.downgrade(current, downgradedTarget);
    await this.repository.saveLicense(archivedLicense);
    await this.repository.saveLicense(activeLicense);
    await this.repository.saveActiveLicense(activeLicense);

    await this.repository.addAuditLog({
      action: 'ACTIVATE',
      licenseId: activeLicense.id,
      licenseKey: activeLicense.key,
      details: `Downgrade commercial de ${currentTier} vers ${targetTier} (Données préservées).`,
      success: true,
    });

    return activeLicense;
  }

  /**
   * Suspends an active license.
   */
  public async suspendLicense(licenseId: string, reason: string): Promise<License> {
    assertAdminContext();
    const lic = await this.repository.getLicenseById(licenseId);
    if (!lic) throw new Error(`Licence ${licenseId} introuvable.`);

    const suspended = LicenseLifecycleEngine.suspend(lic, reason);
    await this.repository.saveLicense(suspended);

    const active = await this.repository.getActiveLicense();
    if (active && active.id === licenseId) {
      await this.repository.saveActiveLicense(suspended);
    }

    await this.repository.addAuditLog({
      action: 'DEACTIVATE',
      licenseId: suspended.id,
      licenseKey: suspended.key,
      details: `Suspension administrative: ${reason}`,
      success: true,
    });

    return suspended;
  }

  /**
   * Reactivates a suspended license.
   */
  public async reactivateLicense(licenseId: string): Promise<License> {
    assertAdminContext();
    const lic = await this.repository.getLicenseById(licenseId);
    if (!lic) throw new Error(`Licence ${licenseId} introuvable.`);

    const reactivated = LicenseLifecycleEngine.reactivate(lic);
    await this.repository.saveLicense(reactivated);

    const active = await this.repository.getActiveLicense();
    if (active && active.id === licenseId) {
      await this.repository.saveActiveLicense(reactivated);
    }

    await this.repository.addAuditLog({
      action: 'ACTIVATE',
      licenseId: reactivated.id,
      licenseKey: reactivated.key,
      details: 'Réactivation administrative de la licence.',
      success: true,
    });

    return reactivated;
  }

  /**
   * Revokes a license permanently.
   */
  public async revokeLicense(licenseId: string, reason: string): Promise<License> {
    assertAdminContext();
    const lic = await this.repository.getLicenseById(licenseId);
    if (!lic) throw new Error(`Licence ${licenseId} introuvable.`);

    const revoked = LicenseLifecycleEngine.revoke(lic, reason);
    await this.repository.saveLicense(revoked);
    await this.repository.addToRevocationList(revoked.key);

    const active = await this.repository.getActiveLicense();
    if (active && active.id === licenseId) {
      await this.repository.saveActiveLicense(revoked);
    }

    await this.repository.addAuditLog({
      action: 'REVOKE',
      licenseId: revoked.id,
      licenseKey: revoked.key,
      details: `Révocation définitive: ${reason}`,
      success: true,
    });

    return revoked;
  }

  /**
   * Computes offline statistics across all licenses in local repository.
   */
  public async getCommercialStats(): Promise<CommercialAdminStats> {
    const licenses = await this.repository.getAllLicenses();
    const active = await this.repository.getActiveLicense();

    const tierBreakdown: Record<SubscriptionTier, number> = {
      FREE: 0,
      PREMIUM: 0,
      PRO: 0,
    };

    const statusBreakdown: Record<LicenseStatus, number> = {
      active: 0,
      expired: 0,
      revoked: 0,
      suspended: 0,
      trial: 0,
      pending_activation: 0,
      OFFLINE_BETA: 0,
      invalid: 0,
      replaced: 0,
    };

    const typeBreakdown: Record<LicenseType, number> = {
      beta: 0,
      commercial: 0,
      permanent: 0,
      temporary: 0,
      enterprise: 0,
      association: 0,
      veterinary: 0,
    };

    let totalActivatedDevices = 0;
    let expiringSoonCount = 0;
    let recentlyCreatedCount = 0;
    let recentlyActivatedCount = 0;

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    const allLicMap = new Map<string, License>();
    licenses.forEach(l => allLicMap.set(l.id, l));
    if (active && !allLicMap.has(active.id)) {
      allLicMap.set(active.id, active);
    }

    allLicMap.forEach(lic => {
      // Tier calculation
      const tier = SubscriptionTierResolver.resolve(lic);
      tierBreakdown[tier]++;

      // Status
      const status = lic.status in statusBreakdown ? lic.status : 'active';
      statusBreakdown[status]++;

      // Type
      if (lic.type in typeBreakdown) {
        typeBreakdown[lic.type]++;
      }

      // Devices
      totalActivatedDevices += lic.activations?.length || 0;

      // Expiring soon check (for active or pending licenses)
      if (lic.expiresAt && lic.status !== 'expired' && lic.status !== 'revoked' && lic.status !== 'replaced') {
        const expTime = new Date(lic.expiresAt).getTime();
        if (expTime > now && expTime - now <= thirtyDaysMs) {
          expiringSoonCount++;
        }
      }

      // Recently created
      if (lic.issuedAt) {
        const createTime = new Date(lic.issuedAt).getTime();
        if (now - createTime <= sevenDaysMs) {
          recentlyCreatedCount++;
        }
      }

      // Recently activated
      if (lic.activations && lic.activations.length > 0) {
        const latestAct = lic.activations[lic.activations.length - 1];
        if (latestAct.activatedAt) {
          const actTime = new Date(latestAct.activatedAt).getTime();
          if (now - actTime <= sevenDaysMs) {
            recentlyActivatedCount++;
          }
        }
      }
    });

    return {
      totalLicenses: allLicMap.size,
      tierBreakdown,
      statusBreakdown,
      typeBreakdown,
      totalActivatedDevices,
      expiringSoonCount,
      recentlyCreatedCount,
      recentlyActivatedCount,
      lastAuditTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Filters and sorts licenses locally based on the filter state.
   */
  public filterLicenses(licenses: License[], filters: LicenseFilterState): License[] {
    return licenses.filter(lic => {
      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchId = lic.id.toLowerCase().includes(q);
        const matchKey = lic.key.toLowerCase().includes(q);
        const matchHolder = lic.holderName.toLowerCase().includes(q);
        const matchEmail = (lic.holderEmail || '').toLowerCase().includes(q);
        if (!matchId && !matchKey && !matchHolder && !matchEmail) {
          return false;
        }
      }

      // Tier Filter
      if (filters.tierFilter !== 'ALL') {
        const resolvedTier = SubscriptionTierResolver.resolve(lic);
        if (resolvedTier !== filters.tierFilter) {
          return false;
        }
      }

      // Status Filter
      if (filters.statusFilter !== 'ALL') {
        if (lic.status !== filters.statusFilter) {
          return false;
        }
      }

      // Type Filter
      if (filters.typeFilter !== 'ALL') {
        if (lic.type !== filters.typeFilter) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'holderName':
          comparison = a.holderName.localeCompare(b.holderName);
          break;
        case 'expiresAt':
          const expA = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
          const expB = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
          comparison = expA - expB;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'tier':
          const tierA = SubscriptionTierResolver.resolve(a);
          const tierB = SubscriptionTierResolver.resolve(b);
          comparison = tierA.localeCompare(tierB);
          break;
        case 'issuedAt':
        default:
          const dateA = new Date(a.issuedAt).getTime();
          const dateB = new Date(b.issuedAt).getTime();
          comparison = dateA - dateB;
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }
}

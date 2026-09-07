/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, LicenseType, LicensePolicy } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';
import { assertAdminContext } from '../../../config/appMode';

export interface GenerateLicenseOptions {
  holderName: string;
  holderEmail?: string;
  type: LicenseType;
  durationDays?: number | null; // null for permanent
  maxDevices?: number;
  customFeatures?: string[];
  metadata?: Record<string, any>;
}

export class LicenseGenerator {
  private static TYPE_TAGS: Record<LicenseType, string> = {
    beta: 'BETA',
    commercial: 'COMM',
    permanent: 'PERM',
    temporary: 'TEMP',
    enterprise: 'ENTP',
    association: 'ASSO',
    veterinary: 'VETE',
  };

  private static DEFAULT_DEVICE_LIMITS: Record<LicenseType, number> = {
    beta: 2,
    commercial: 3,
    permanent: 5,
    temporary: 1,
    enterprise: 25,
    association: 10,
    veterinary: 15,
  };

  private static DEFAULT_FEATURES: Record<LicenseType, string[]> = {
    beta: ['core', 'beta_access', 'feedback_module'],
    commercial: ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf'],
    permanent: ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'lifetime_updates'],
    temporary: ['core', 'standard_birds', 'basic_stats'],
    enterprise: ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'multi_user', 'audit_trail', 'priority_support', 'unlimited_cages'],
    association: ['core', 'unlimited_birds', 'pedigree', 'member_registry', 'exhibition_manager', 'export_pdf'],
    veterinary: ['core', 'unlimited_birds', 'health_pro', 'prescriptions', 'clinical_history', 'diagnostic_engine'],
  };

  /**
   * Generates a complete, cryptographically signed License object and key string
   */
  static async generateLicense(options: GenerateLicenseOptions): Promise<License> {
    if (!options.metadata?.isAutoTrial) {
      assertAdminContext();
    }
    const id = `lic_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    const issuedAt = now.toISOString();

    let expiresAt: string | null = null;
    if (options.type !== 'permanent' && options.durationDays !== null) {
      const days = options.durationDays ?? (options.type === 'beta' ? 90 : 365);
      const expDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      expiresAt = expDate.toISOString();
    }

    const maxDevices = options.maxDevices ?? LicenseGenerator.DEFAULT_DEVICE_LIMITS[options.type];
    const features = options.customFeatures ?? LicenseGenerator.DEFAULT_FEATURES[options.type];

    const policy: LicensePolicy = {
      maxDevices,
      allowOfflineActivation: true,
      allowTransfer: true,
      features,
    };

    const key = await this.generateKeyString(options.type, id, options.holderName);
    const payloadToSign = `${id}:${key}:${options.holderName}:${options.type}:${issuedAt}:${expiresAt || 'NEVER'}:${maxDevices}`;
    
    const checksum = await CryptoService.sha256(payloadToSign);
    const signature = await CryptoService.generateSignature(checksum);

    return {
      id,
      key,
      holderName: options.holderName,
      holderEmail: options.holderEmail,
      type: options.type,
      status: options.type === 'beta' ? 'trial' : 'pending_activation',
      issuedAt,
      expiresAt,
      policy,
      activations: [],
      revokedAt: null,
      revocationReason: null,
      checksum,
      signature,
      metadata: options.metadata || {},
    };
  }

  /**
   * Formats a 5-part key: LMSE-[TYPE:4]-[S1:4]-[S2:4]-[CHECKSUM:4]
   */
  public static async generateKeyString(type: LicenseType, id: string, holder: string): Promise<string> {
    const tag = LicenseGenerator.TYPE_TAGS[type] || 'COMM';
    const rawSeed = `${id}::${holder}::${Date.now()}::${Math.random()}`;
    const hash = await CryptoService.sha256(rawSeed);
    
    const s1 = hash.slice(0, 4).toUpperCase();
    const s2 = hash.slice(4, 8).toUpperCase();
    const checksumSeed = `LMSE-${tag}-${s1}-${s2}`;
    const checksumHash = await CryptoService.sha256(checksumSeed);
    const s3 = checksumHash.slice(0, 4).toUpperCase();

    return `LMSE-${tag}-${s1}-${s2}-${s3}`;
  }
}

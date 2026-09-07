/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License } from '../types/licensing';
import { LicenseGenerator } from './LicenseGenerator';
import { ILicenseRepository } from '../repositories/ILicenseRepository';

export class TrialEngine {
  /**
   * Initializes a default 30-day Trial or Private Beta license if none exists
   */
  static async initializeTrialIfNeeded(
    repository: ILicenseRepository,
    trialDays: number = 30
  ): Promise<License> {
    const existingActive = await repository.getActiveLicense();
    if (existingActive) return existingActive;

    // Create automatic private beta / trial license
    const trialLicense = await LicenseGenerator.generateLicense({
      holderName: 'Utilisateur Bêta Privée',
      type: 'beta',
      durationDays: trialDays,
      maxDevices: 3,
      customFeatures: ['core', 'beta_access', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf'],
      metadata: { isAutoTrial: true, createdOnBoot: new Date().toISOString() },
    });

    trialLicense.status = 'trial';
    await repository.saveActiveLicense(trialLicense);
    await repository.addAuditLog({
      action: 'CREATE',
      licenseId: trialLicense.id,
      licenseKey: trialLicense.key,
      details: `Période d'essai/bêta créée automatiquement pour ${trialDays} jours.`,
      success: true,
    });

    return trialLicense;
  }
}

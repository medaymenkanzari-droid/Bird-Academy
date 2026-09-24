/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuditLogEntry, LicenseStats, License, LicenseType } from '../types/licensing';
import { ILicenseRepository } from '../repositories/ILicenseRepository';

export class LicenseAuditEngine {
  /**
   * Fetches full audit history
   */
  static async getAuditLogs(repository: ILicenseRepository): Promise<AuditLogEntry[]> {
    return await repository.getAuditLogs();
  }

  /**
   * Generates summary metrics across all stored licenses
   */
  static async generateStats(repository: ILicenseRepository): Promise<LicenseStats> {
    const licenses = await repository.getAllLicenses();
    const activeLic = await repository.getActiveLicense();

    const typeBreakdown: Record<LicenseType, number> = {
      beta: 0,
      commercial: 0,
      permanent: 0,
      temporary: 0,
      enterprise: 0,
      association: 0,
      veterinary: 0,
      test: 0,
    };

    let totalActivatedDevices = 0;
    let activeLicenses = 0;
    let expiredLicenses = 0;
    let revokedLicenses = 0;
    let trialLicenses = 0;

    const now = new Date();

    licenses.forEach(l => {
      if (l.type in typeBreakdown) {
        typeBreakdown[l.type]++;
      }
      totalActivatedDevices += l.activations.length;

      if (l.status === 'revoked') {
        revokedLicenses++;
      } else if (l.expiresAt && new Date(l.expiresAt).getTime() < now.getTime()) {
        expiredLicenses++;
      } else if (l.status === 'trial') {
        trialLicenses++;
        activeLicenses++;
      } else if (l.status === 'active') {
        activeLicenses++;
      }
    });

    // Ensure active license is counted if present
    if (activeLic && !licenses.some(l => l.id === activeLic.id)) {
      if (activeLic.type in typeBreakdown) {
        typeBreakdown[activeLic.type]++;
      }
      totalActivatedDevices += activeLic.activations.length;
      if (activeLic.status === 'active') activeLicenses++;
    }

    return {
      totalLicenses: licenses.length,
      activeLicenses,
      expiredLicenses,
      revokedLicenses,
      trialLicenses,
      typeBreakdown,
      totalActivatedDevices,
      lastAuditTimestamp: new Date().toISOString(),
    };
  }
}

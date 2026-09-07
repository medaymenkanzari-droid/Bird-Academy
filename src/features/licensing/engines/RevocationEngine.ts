/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License } from '../types/licensing';
import { ILicenseRepository } from '../repositories/ILicenseRepository';

export class RevocationEngine {
  /**
   * Revokes a license immediately and registers key in revocation list
   */
  static async revokeLicense(
    repository: ILicenseRepository,
    licenseId: string,
    reason: string
  ): Promise<License | null> {
    const license = await repository.getLicenseById(licenseId);
    if (!license) return null;

    license.status = 'revoked';
    license.revokedAt = new Date().toISOString();
    license.revocationReason = reason;

    await repository.saveLicense(license);
    await repository.addToRevocationList(license.key);
    await repository.addToRevocationList(license.checksum);

    const active = await repository.getActiveLicense();
    if (active && (active.id === licenseId || active.key === license.key)) {
      await repository.saveActiveLicense(license);
    }

    await repository.addAuditLog({
      action: 'REVOKE',
      licenseId: license.id,
      licenseKey: license.key,
      details: `Licence révoquée. Motif: ${reason}`,
      success: true,
    });

    return license;
  }

  /**
   * Checks whether key or checksum is revoked
   */
  static isRevoked(keyOrChecksum: string, revocationList: string[]): boolean {
    const clean = keyOrChecksum.trim().toUpperCase();
    return revocationList.some(r => r.trim().toUpperCase() === clean);
  }
}

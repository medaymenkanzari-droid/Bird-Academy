/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License } from '../types/licensing';
import { LicenseEntity } from '../domain/entities/License';

export class ExpirationEngine {
  /**
   * Checks whether a license is expired or near expiration
   */
  static evaluateExpiration(license: License, now: Date = new Date()): {
    isExpired: boolean;
    isNearExpiration: boolean;
    remainingDays: number | null;
    remainingHours: number | null;
    statusLabel: string;
  } {
    const entity = new LicenseEntity(license);
    const isExpired = entity.isExpired(now);
    const remainingDays = entity.remainingDays(now);

    let remainingHours: number | null = null;
    if (license.expiresAt && !isExpired) {
      const diffMs = new Date(license.expiresAt).getTime() - now.getTime();
      remainingHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
    }

    const isNearExpiration = remainingDays !== null && remainingDays <= 14 && !isExpired;

    let statusLabel = 'Permanente';
    if (license.expiresAt) {
      if (isExpired) {
        statusLabel = 'Expirée';
      } else if (isNearExpiration) {
        statusLabel = `Expire dans ${remainingDays} jour(s)`;
      } else {
        statusLabel = `Valide (${remainingDays} jours restants)`;
      }
    }

    return {
      isExpired,
      isNearExpiration,
      remainingDays,
      remainingHours,
      statusLabel,
    };
  }
}

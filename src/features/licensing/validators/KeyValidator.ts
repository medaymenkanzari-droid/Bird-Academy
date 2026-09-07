/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LicenseKey } from '../domain/value-objects/LicenseKey';

export class KeyValidator {
  /**
   * Validates key format syntax
   */
  static validateFormat(key: string): { isValid: boolean; error?: string } {
    if (!key || typeof key !== 'string') {
      return { isValid: false, error: 'Clé vide ou non spécifiée.' };
    }
    const clean = key.trim().toUpperCase();
    if (!LicenseKey.isValidFormat(clean)) {
      return { isValid: false, error: 'Format de clé invalide. Le format attendu est LMSE-XXXX-XXXX-XXXX-XXXX.' };
    }
    return { isValid: true };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvalidLicenseKeyError } from '../errors/LicensingErrors';
import { LicenseType } from '../../types/licensing';

export class LicenseKey {
  private readonly rawKey: string;
  private readonly typePrefix: LicenseType;

  private static PREFIX_MAP: Record<string, LicenseType> = {
    BETA: 'beta',
    COMM: 'commercial',
    PERM: 'permanent',
    TEMP: 'temporary',
    ENTP: 'enterprise',
    ASSO: 'association',
    VETE: 'veterinary',
  };

  private static REVERSE_MAP: Record<LicenseType, string> = {
    beta: 'BETA',
    commercial: 'COMM',
    permanent: 'PERM',
    temporary: 'TEMP',
    enterprise: 'ENTP',
    association: 'ASSO',
    veterinary: 'VETE',
  };

  constructor(key: string) {
    const sanitized = key.trim().toUpperCase();
    if (!LicenseKey.isValidFormat(sanitized)) {
      throw new InvalidLicenseKeyError(`Format de clé invalide: ${key}`);
    }
    this.rawKey = sanitized;
    const parts = sanitized.split('-');
    const tag = parts[1];
    this.typePrefix = LicenseKey.PREFIX_MAP[tag] || 'commercial';
  }

  public toString(): string {
    return this.rawKey;
  }

  public getType(): LicenseType {
    return this.typePrefix;
  }

  public static isValidFormat(key: string): boolean {
    if (!key || typeof key !== 'string') return false;
    const normalized = key.trim().toUpperCase();
    // Pattern: LMSE-[TYPE:4]-[SECTION:4]-[SECTION:4]-[CHECKSUM:4]
    const parts = normalized.split('-');
    if (parts.length < 5 || parts[0] !== 'LMSE') return false;
    const typeTag = parts[1];
    if (!LicenseKey.PREFIX_MAP[typeTag]) return false;
    return parts.every((p, idx) => idx === 0 || /^[A-Z0-9]{4}$/.test(p));
  }

  public static formatTag(type: LicenseType): string {
    return LicenseKey.REVERSE_MAP[type] || 'COMM';
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeviceFingerprint, LicenseType } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';

export class OfflineActivationEngine {
  /**
   * Generates a 16-character hardware challenge code from device fingerprint and license key
   */
  static async generateChallengeCode(
    device: DeviceFingerprint,
    licenseKey: string,
    type: LicenseType
  ): Promise<string> {
    const raw = `${device.deviceId}:${device.browserHash}:${licenseKey.trim().toUpperCase()}:${type}`;
    const hash = await CryptoService.sha256(raw);
    const cleanHash = hash.toUpperCase();
    
    return [
      cleanHash.slice(0, 4),
      cleanHash.slice(4, 8),
      cleanHash.slice(8, 12),
      cleanHash.slice(12, 16),
    ].join('-');
  }

  /**
   * Admin offline activation code generator from a challenge code and license key
   */
  static async generateActivationCode(
    challengeCode: string,
    licenseKey: string
  ): Promise<string> {
    const cleanChallenge = challengeCode.replace(/-/g, '').toUpperCase();
    const cleanKey = licenseKey.replace(/-/g, '').toUpperCase();
    const seed = `OFFLINE_ACT::${cleanChallenge}::${cleanKey}::LMSE_SECRET_SALT_2026`;
    
    const hash = await CryptoService.sha256(seed);
    const upper = hash.toUpperCase();

    return [
      upper.slice(0, 4),
      upper.slice(4, 8),
      upper.slice(8, 12),
      upper.slice(12, 16),
    ].join('-');
  }

  /**
   * Verifies an offline activation code entered by the user
   */
  static async verifyActivationCode(
    challengeCode: string,
    licenseKey: string,
    providedCode: string
  ): Promise<boolean> {
    const expected = await this.generateActivationCode(challengeCode, licenseKey);
    const cleanProvided = providedCode.trim().toUpperCase();
    return expected === cleanProvided;
  }
}

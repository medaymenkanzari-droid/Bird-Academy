/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, LicenseValidationResult, DeviceFingerprint } from '../types/licensing';
import { ILicenseRepository } from '../repositories/ILicenseRepository';
import { DeviceFingerprintEngine } from './DeviceFingerprintEngine';
import { LicenseValidator } from './LicenseValidator';

export class LicenseEngine {
  /**
   * Evaluates if a given feature key is permitted under the active license
   */
  static isFeatureAllowed(license: License | null, featureKey: string): boolean {
    if (!license) return featureKey === 'core';
    if (license.status === 'revoked') return false;
    if (license.type === 'permanent' || license.type === 'enterprise') return true;
    if (!license.policy?.features) return true;
    return license.policy.features.includes(featureKey) || license.policy.features.includes('core');
  }

  /**
   * Returns current active license status with full validation
   */
  static async validateCurrentEnvironment(
    repository: ILicenseRepository
  ): Promise<LicenseValidationResult> {
    const active = await repository.getActiveLicense();
    const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
    const revocations = await repository.getRevocationList();
    const lastTimeMarker = await repository.getMonotonicTimeMarker();
    const now = new Date();

    const result = await LicenseValidator.validateLicense(
      active,
      currentDevice,
      revocations,
      lastTimeMarker,
      now
    );

    if (result.isValid) {
      await repository.setMonotonicTimeMarker(now.toISOString());
    }

    return result;
  }
}

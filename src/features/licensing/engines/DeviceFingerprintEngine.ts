/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeviceFingerprint } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';
import { DeviceFingerprintFactory } from '../providers/DeviceFingerprintProvider';

export class DeviceFingerprintEngine {
  /**
   * Generates a stable, non-PII device fingerprint across platforms using DeviceFingerprintFactory
   */
  static async generateFingerprint(): Promise<DeviceFingerprint> {
    const provider = DeviceFingerprintFactory.getProvider();
    return provider.getFingerprint();
  }

  /**
   * Detects the client operating system via DeviceFingerprintFactory
   */
  static detectOS(): 'Windows' | 'Android' | 'iOS' | 'Web' | 'Unknown' {
    const provider = DeviceFingerprintFactory.getProvider();
    return provider.getPlatform();
  }

  /**
   * Validates if a target device fingerprint matches expected parameters
   */
  static isMatch(fp1: DeviceFingerprint, fp2: DeviceFingerprint): boolean {
    return fp1.deviceId === fp2.deviceId && fp1.os === fp2.os;
  }
}

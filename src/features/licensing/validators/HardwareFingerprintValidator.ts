/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeviceFingerprint } from '../types/licensing';

export class HardwareFingerprintValidator {
  /**
   * Checks if current fingerprint matches registered activation records
   */
  static isDeviceRegistered(
    currentFp: DeviceFingerprint,
    registeredDevices: DeviceFingerprint[]
  ): boolean {
    return registeredDevices.some(
      d => d.deviceId === currentFp.deviceId || (d.browserHash === currentFp.browserHash && d.os === currentFp.os)
    );
  }
}

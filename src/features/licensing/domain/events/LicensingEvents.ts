/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, ActivationRecord } from '../../types/licensing';

export interface LicensingEvent {
  eventName: string;
  timestamp: string;
  payload: any;
}

export class LicenseActivatedEvent implements LicensingEvent {
  readonly eventName = 'LicenseActivated';
  readonly timestamp: string;
  constructor(public readonly payload: { license: License; activation: ActivationRecord }) {
    this.timestamp = new Date().toISOString();
  }
}

export class LicenseRevokedEvent implements LicensingEvent {
  readonly eventName = 'LicenseRevoked';
  readonly timestamp: string;
  constructor(public readonly payload: { licenseId: string; reason: string }) {
    this.timestamp = new Date().toISOString();
  }
}

export class DeviceUnboundEvent implements LicensingEvent {
  readonly eventName = 'DeviceUnbound';
  readonly timestamp: string;
  constructor(public readonly payload: { licenseId: string; deviceId: string }) {
    this.timestamp = new Date().toISOString();
  }
}

export class AntiTamperAlertEvent implements LicensingEvent {
  readonly eventName = 'AntiTamperAlert';
  readonly timestamp: string;
  constructor(public readonly payload: { code: string; details: string }) {
    this.timestamp = new Date().toISOString();
  }
}

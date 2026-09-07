/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License as ILicense, LicenseStatus, LicenseType, LicensePolicy, ActivationRecord } from '../../types/licensing';
import { DeviceLimitExceededError, LicenseExpiredError, LicenseRevokedError } from '../errors/LicensingErrors';

export class LicenseEntity implements ILicense {
  public id: string;
  public key: string;
  public holderName: string;
  public holderEmail?: string;
  public type: LicenseType;
  public status: LicenseStatus;
  public issuedAt: string;
  public expiresAt: string | null;
  public policy: LicensePolicy;
  public activations: ActivationRecord[];
  public revokedAt?: string | null;
  public revocationReason?: string | null;
  public checksum: string;
  public signature: string;
  public metadata?: Record<string, any>;

  constructor(data: ILicense) {
    this.id = data.id;
    this.key = data.key;
    this.holderName = data.holderName;
    this.holderEmail = data.holderEmail;
    this.type = data.type;
    this.status = data.status;
    this.issuedAt = data.issuedAt;
    this.expiresAt = data.expiresAt;
    this.policy = data.policy;
    this.activations = data.activations || [];
    this.revokedAt = data.revokedAt || null;
    this.revocationReason = data.revocationReason || null;
    this.checksum = data.checksum;
    this.signature = data.signature;
    this.metadata = data.metadata || {};
  }

  public isExpired(now: Date = new Date()): boolean {
    if (this.type === 'permanent' || !this.expiresAt) return false;
    return new Date(this.expiresAt).getTime() < now.getTime();
  }

  public isRevoked(): boolean {
    return this.status === 'revoked' || this.revokedAt !== null;
  }

  public isActive(now: Date = new Date()): boolean {
    if (this.isRevoked()) return false;
    if (this.isExpired(now)) return false;
    return this.status === 'active' || this.status === 'trial' || this.status === 'OFFLINE_BETA';
  }

  public remainingDays(now: Date = new Date()): number | null {
    if (this.type === 'permanent' || !this.expiresAt) return null;
    const diff = new Date(this.expiresAt).getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  public hasAvailableSlot(): boolean {
    return this.activations.length < this.policy.maxDevices;
  }

  public isDeviceRegistered(deviceId: string): boolean {
    return this.activations.some(a => a.fingerprint.deviceId === deviceId);
  }

  public bindDevice(record: ActivationRecord): void {
    if (this.isRevoked()) {
      throw new LicenseRevokedError();
    }
    if (this.isExpired()) {
      throw new LicenseExpiredError();
    }
    if (this.isDeviceRegistered(record.fingerprint.deviceId)) {
      // Update existing verification timestamp
      this.activations = this.activations.map(a => 
        a.fingerprint.deviceId === record.fingerprint.deviceId
          ? { ...a, lastVerifiedAt: record.lastVerifiedAt }
          : a
      );
      return;
    }
    if (!this.hasAvailableSlot()) {
      throw new DeviceLimitExceededError();
    }
    this.activations.push(record);
    this.status = 'active';
  }

  public unbindDevice(deviceId: string): boolean {
    const initialLen = this.activations.length;
    this.activations = this.activations.filter(a => a.fingerprint.deviceId !== deviceId);
    return this.activations.length < initialLen;
  }

  public revoke(reason: string): void {
    this.status = 'revoked';
    this.revokedAt = new Date().toISOString();
    this.revocationReason = reason;
  }

  public toJSON(): ILicense {
    return {
      id: this.id,
      key: this.key,
      holderName: this.holderName,
      holderEmail: this.holderEmail,
      type: this.type,
      status: this.status,
      issuedAt: this.issuedAt,
      expiresAt: this.expiresAt,
      policy: this.policy,
      activations: this.activations,
      revokedAt: this.revokedAt,
      revocationReason: this.revocationReason,
      checksum: this.checksum,
      signature: this.signature,
      metadata: this.metadata,
    };
  }
}

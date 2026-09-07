/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LicenseType = 
  | 'beta' 
  | 'commercial' 
  | 'permanent' 
  | 'temporary' 
  | 'enterprise' 
  | 'association' 
  | 'veterinary';

export type LicenseStatus = 
  | 'active' 
  | 'expired' 
  | 'revoked' 
  | 'suspended' 
  | 'trial' 
  | 'pending_activation'
  | 'OFFLINE_BETA'
  | 'invalid'
  | 'replaced';

export type FirstLaunchState =
  | 'UNLICENSED'
  | 'ACTIVATION_REQUIRED'
  | 'ACTIVATING'
  | 'LICENSED'
  | 'LICENSE_EXPIRED'
  | 'LICENSE_REVOKED'
  | 'DEVICE_LIMIT_REACHED'
  | 'INVALID_LICENSE'
  | 'OFFLINE_ACTIVATION_AVAILABLE'
  | 'OFFLINE_BETA';

export interface DeviceFingerprint {
  deviceId: string;
  os: 'Windows' | 'Android' | 'iOS' | 'Web' | 'Unknown';
  browserHash: string;
  screenSpec: string;
  timezone: string;
  language: string;
  hardwareConcurrency: number;
  createdAt: string;
  lastSeenAt: string;
}

export interface ActivationRecord {
  id: string;
  licenseId: string;
  licenseKey: string;
  fingerprint: DeviceFingerprint;
  activatedAt: string;
  lastVerifiedAt: string;
  isOffline: boolean;
}

export interface LicensePolicy {
  maxDevices: number;
  allowOfflineActivation: boolean;
  allowTransfer: boolean;
  features: string[];
  customQuota?: Record<string, number>;
}

export interface License {
  id: string;
  key: string;
  holderName: string;
  holderEmail?: string;
  type: LicenseType;
  status: LicenseStatus;
  issuedAt: string;
  expiresAt: string | null; // null for permanent
  policy: LicensePolicy;
  activations: ActivationRecord[];
  revokedAt?: string | null;
  revocationReason?: string | null;
  checksum: string;
  signature: string;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'ACTIVATE' | 'DEACTIVATE' | 'REVOKE' | 'EXPIRE' | 'VALIDATE' | 'TAMPER_DETECTED' | 'IMPORT' | 'EXPORT';
  licenseId?: string;
  licenseKey?: string;
  deviceId?: string;
  details: string;
  success: boolean;
  ipHash?: string;
}

export interface OfflineChallenge {
  hardwareHash: string;
  timestamp: string;
  nonce: string;
  requestedType: LicenseType;
}

export interface OfflineActivationResponse {
  activationCode: string;
  signature: string;
  validUntil: string;
}

export interface LicenseValidationResult {
  isValid: boolean;
  status: LicenseStatus;
  license: License | null;
  code: string; // E.g., 'VALID', 'EXPIRED', 'REVOKED', 'DEVICE_LIMIT_EXCEEDED', 'CLOCK_TAMPERED', 'CORRUPTED'
  message: string;
  remainingDays: number | null;
  deviceRegistered: boolean;
}

export interface LicenseStats {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  revokedLicenses: number;
  trialLicenses: number;
  typeBreakdown: Record<LicenseType, number>;
  totalActivatedDevices: number;
  lastAuditTimestamp: string;
}

export interface LmseFilePayload {
  id: string;
  key: string;
  holderName: string;
  holderEmail?: string;
  type: LicenseType;
  issuedAt: string;
  expiresAt: string | null;
  maxDevices: number;
  features: string[];
  allowOfflineActivation: boolean;
  mode: 'OFFLINE_BETA' | 'COMMERCIAL' | 'ENTERPRISE';
}

export interface LmseLicenseFile {
  format: 'bird-academy-lmse';
  version: number;
  license: LmseFilePayload;
  checksum: string;
  signature: string;
}


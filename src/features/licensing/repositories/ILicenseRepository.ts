/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, AuditLogEntry } from '../types/licensing';

export interface ILicenseRepository {
  getActiveLicense(): Promise<License | null>;
  saveActiveLicense(license: License): Promise<void>;
  clearActiveLicense(): Promise<void>;

  getAllLicenses(): Promise<License[]>;
  getLicenseByKey(key: string): Promise<License | null>;
  getLicenseById(id: string): Promise<License | null>;
  saveLicense(license: License): Promise<void>;
  deleteLicense(id: string): Promise<boolean>;

  getRevocationList(): Promise<string[]>; // list of revoked key/checksum strings
  addToRevocationList(keyOrChecksum: string): Promise<void>;

  getAuditLogs(): Promise<AuditLogEntry[]>;
  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;

  getMonotonicTimeMarker(): Promise<string | null>;
  setMonotonicTimeMarker(timestamp: string): Promise<void>;
}

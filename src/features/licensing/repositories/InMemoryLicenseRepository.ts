/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILicenseRepository } from './ILicenseRepository';
import { License, AuditLogEntry } from '../types/licensing';

export class InMemoryLicenseRepository implements ILicenseRepository {
  private activeLicense: License | null = null;
  private licenses: Map<string, License> = new Map();
  private revocationList: Set<string> = new Set();
  private auditLogs: AuditLogEntry[] = [];
  private lastTimeMarker: string | null = null;

  async getActiveLicense(): Promise<License | null> {
    return this.activeLicense;
  }

  async saveActiveLicense(license: License): Promise<void> {
    this.activeLicense = license;
    await this.saveLicense(license);
  }

  async clearActiveLicense(): Promise<void> {
    this.activeLicense = null;
  }

  async getAllLicenses(): Promise<License[]> {
    return Array.from(this.licenses.values());
  }

  async getLicenseByKey(key: string): Promise<License | null> {
    const cleanKey = key.trim().toUpperCase();
    for (const lic of this.licenses.values()) {
      if (lic.key.trim().toUpperCase() === cleanKey) return lic;
    }
    return null;
  }

  async getLicenseById(id: string): Promise<License | null> {
    return this.licenses.get(id) || null;
  }

  async saveLicense(license: License): Promise<void> {
    this.licenses.set(license.id, license);
  }

  async deleteLicense(id: string): Promise<boolean> {
    const existed = this.licenses.delete(id);
    if (this.activeLicense && this.activeLicense.id === id) {
      this.activeLicense = null;
    }
    return existed;
  }

  async getRevocationList(): Promise<string[]> {
    return Array.from(this.revocationList);
  }

  async addToRevocationList(keyOrChecksum: string): Promise<void> {
    this.revocationList.add(keyOrChecksum.trim().toUpperCase());
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return [...this.auditLogs];
  }

  async addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(fullEntry);
    return fullEntry;
  }

  async getMonotonicTimeMarker(): Promise<string | null> {
    return this.lastTimeMarker;
  }

  async setMonotonicTimeMarker(timestamp: string): Promise<void> {
    this.lastTimeMarker = timestamp;
  }
}

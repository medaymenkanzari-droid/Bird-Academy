/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILicenseRepository } from './ILicenseRepository';
import { License, AuditLogEntry } from '../types/licensing';

export class LocalStorageLicenseRepository implements ILicenseRepository {
  private static STORAGE_KEY_ACTIVE = 'bird_academy_lmse_active_license';
  private static STORAGE_KEY_ALL = 'bird_academy_lmse_all_licenses';
  private static STORAGE_KEY_REVOCATIONS = 'bird_academy_lmse_revocation_list';
  private static STORAGE_KEY_AUDIT = 'bird_academy_lmse_audit_logs';
  private static STORAGE_KEY_TIME_MARKER = 'bird_academy_lmse_last_known_timestamp';

  async getActiveLicense(): Promise<License | null> {
    try {
      const raw = localStorage.getItem(LocalStorageLicenseRepository.STORAGE_KEY_ACTIVE);
      if (!raw) return null;
      return JSON.parse(raw) as License;
    } catch {
      return null;
    }
  }

  async saveActiveLicense(license: License): Promise<void> {
    localStorage.setItem(
      LocalStorageLicenseRepository.STORAGE_KEY_ACTIVE,
      JSON.stringify(license)
    );
    await this.saveLicense(license);
  }

  async clearActiveLicense(): Promise<void> {
    localStorage.removeItem(LocalStorageLicenseRepository.STORAGE_KEY_ACTIVE);
  }

  async getAllLicenses(): Promise<License[]> {
    try {
      const raw = localStorage.getItem(LocalStorageLicenseRepository.STORAGE_KEY_ALL);
      if (!raw) return [];
      return JSON.parse(raw) as License[];
    } catch {
      return [];
    }
  }

  async getLicenseByKey(key: string): Promise<License | null> {
    const list = await this.getAllLicenses();
    const cleanKey = key.trim().toUpperCase();
    return list.find(l => l.key.trim().toUpperCase() === cleanKey) || null;
  }

  async getLicenseById(id: string): Promise<License | null> {
    const list = await this.getAllLicenses();
    return list.find(l => l.id === id) || null;
  }

  async saveLicense(license: License): Promise<void> {
    const list = await this.getAllLicenses();
    const idx = list.findIndex(l => l.id === license.id || l.key === license.key);
    if (idx >= 0) {
      list[idx] = license;
    } else {
      list.push(license);
    }
    localStorage.setItem(
      LocalStorageLicenseRepository.STORAGE_KEY_ALL,
      JSON.stringify(list)
    );
  }

  async deleteLicense(id: string): Promise<boolean> {
    const list = await this.getAllLicenses();
    const filtered = list.filter(l => l.id !== id);
    if (filtered.length === list.length) return false;
    localStorage.setItem(
      LocalStorageLicenseRepository.STORAGE_KEY_ALL,
      JSON.stringify(filtered)
    );
    const active = await this.getActiveLicense();
    if (active && active.id === id) {
      await this.clearActiveLicense();
    }
    return true;
  }

  async getRevocationList(): Promise<string[]> {
    try {
      const raw = localStorage.getItem(LocalStorageLicenseRepository.STORAGE_KEY_REVOCATIONS);
      if (!raw) return [];
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  async addToRevocationList(keyOrChecksum: string): Promise<void> {
    const list = await this.getRevocationList();
    const clean = keyOrChecksum.trim().toUpperCase();
    if (!list.includes(clean)) {
      list.push(clean);
      localStorage.setItem(
        LocalStorageLicenseRepository.STORAGE_KEY_REVOCATIONS,
        JSON.stringify(list)
      );
    }
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const raw = localStorage.getItem(LocalStorageLicenseRepository.STORAGE_KEY_AUDIT);
      if (!raw) return [];
      return JSON.parse(raw) as AuditLogEntry[];
    } catch {
      return [];
    }
  }

  async addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const logs = await this.getAuditLogs();
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(fullEntry);
    // Keep max 500 logs
    if (logs.length > 500) logs.pop();
    localStorage.setItem(
      LocalStorageLicenseRepository.STORAGE_KEY_AUDIT,
      JSON.stringify(logs)
    );
    return fullEntry;
  }

  async getMonotonicTimeMarker(): Promise<string | null> {
    return localStorage.getItem(LocalStorageLicenseRepository.STORAGE_KEY_TIME_MARKER);
  }

  async setMonotonicTimeMarker(timestamp: string): Promise<void> {
    localStorage.setItem(LocalStorageLicenseRepository.STORAGE_KEY_TIME_MARKER, timestamp);
  }
}

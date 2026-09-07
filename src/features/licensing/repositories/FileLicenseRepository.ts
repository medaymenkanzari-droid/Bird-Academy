/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ADMIN / LMSE ENTERPRISE — REPOSITORY PERSISTANT DE LICENCES
 */

import fs from 'node:fs';
import path from 'node:path';
import { ILicenseRepository } from './ILicenseRepository';
import { License, AuditLogEntry } from '../types/licensing';

export class FileLicenseRepository implements ILicenseRepository {
  private licensesPath: string;
  private statePath: string;
  private revocationsPath: string;
  private auditPath: string;

  private licenses: Map<string, License> = new Map();
  private activeLicense: License | null = null;
  private revocationList: Set<string> = new Set();
  private auditLogs: AuditLogEntry[] = [];
  private lastTimeMarker: string | null = null;
  private lastLoadedTime: number = 0;

  constructor(baseDir?: string) {
    const dir = baseDir || path.join(process.cwd(), 'data');
    this.licensesPath = path.join(dir, 'licenses.json');
    this.statePath = path.join(dir, 'license-state.json');
    this.revocationsPath = path.join(dir, 'revocations.json');
    this.auditPath = path.join(dir, 'license-audit-logs.json');
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (typeof fs === 'undefined' || !fs.existsSync) return;

      if (fs.existsSync(this.licensesPath)) {
        const stats = fs.statSync(this.licensesPath);
        if (stats.mtimeMs > this.lastLoadedTime) {
          const raw = fs.readFileSync(this.licensesPath, 'utf-8');
          const parsed: License[] = JSON.parse(raw);
          this.licenses.clear();
          for (const lic of parsed) {
            this.licenses.set(lic.id, lic);
          }
          this.lastLoadedTime = stats.mtimeMs;
        }
      }

      if (fs.existsSync(this.statePath)) {
        const raw = fs.readFileSync(this.statePath, 'utf-8');
        const state = JSON.parse(raw);
        if (state.activeLicense) this.activeLicense = state.activeLicense;
        if (state.lastTimeMarker) this.lastTimeMarker = state.lastTimeMarker;
      }

      if (fs.existsSync(this.revocationsPath)) {
        const raw = fs.readFileSync(this.revocationsPath, 'utf-8');
        const list: string[] = JSON.parse(raw);
        this.revocationList = new Set(list.map(s => s.trim().toUpperCase()));
      }

      if (fs.existsSync(this.auditPath)) {
        const raw = fs.readFileSync(this.auditPath, 'utf-8');
        this.auditLogs = JSON.parse(raw);
      }
    } catch {
      // Fallback in-memory
    }
  }

  private saveToFile(): void {
    try {
      if (typeof fs === 'undefined' || !fs.mkdirSync) return;
      const dir = path.dirname(this.licensesPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const allLicenses = Array.from(this.licenses.values());
      fs.writeFileSync(this.licensesPath, JSON.stringify(allLicenses, null, 2), 'utf-8');

      fs.writeFileSync(
        this.statePath,
        JSON.stringify({ activeLicense: this.activeLicense, lastTimeMarker: this.lastTimeMarker }, null, 2),
        'utf-8'
      );

      fs.writeFileSync(
        this.revocationsPath,
        JSON.stringify(Array.from(this.revocationList), null, 2),
        'utf-8'
      );

      fs.writeFileSync(
        this.auditPath,
        JSON.stringify(this.auditLogs.slice(0, 500), null, 2),
        'utf-8'
      );

      if (fs.existsSync(this.licensesPath)) {
        this.lastLoadedTime = fs.statSync(this.licensesPath).mtimeMs;
      }
    } catch {
      // Ignore write errors in restricted envs
    }
  }

  async getActiveLicense(): Promise<License | null> {
    this.loadFromFile();
    return this.activeLicense;
  }

  async saveActiveLicense(license: License): Promise<void> {
    this.loadFromFile();
    this.activeLicense = license;
    await this.saveLicense(license);
  }

  async clearActiveLicense(): Promise<void> {
    this.loadFromFile();
    this.activeLicense = null;
    this.saveToFile();
  }

  async getAllLicenses(): Promise<License[]> {
    this.loadFromFile();
    return Array.from(this.licenses.values());
  }

  async getLicenseByKey(key: string): Promise<License | null> {
    this.loadFromFile();
    const cleanKey = key.trim().toUpperCase();
    for (const lic of this.licenses.values()) {
      if (lic.key.trim().toUpperCase() === cleanKey) return lic;
    }
    return null;
  }

  async getLicenseById(id: string): Promise<License | null> {
    this.loadFromFile();
    return this.licenses.get(id) || null;
  }

  async saveLicense(license: License): Promise<void> {
    this.loadFromFile();
    this.licenses.set(license.id, license);
    this.saveToFile();
  }

  async deleteLicense(id: string): Promise<boolean> {
    this.loadFromFile();
    const existed = this.licenses.delete(id);
    if (this.activeLicense && this.activeLicense.id === id) {
      this.activeLicense = null;
    }
    this.saveToFile();
    return existed;
  }

  async getRevocationList(): Promise<string[]> {
    this.loadFromFile();
    return Array.from(this.revocationList);
  }

  async addToRevocationList(keyOrChecksum: string): Promise<void> {
    this.loadFromFile();
    this.revocationList.add(keyOrChecksum.trim().toUpperCase());
    this.saveToFile();
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    this.loadFromFile();
    return [...this.auditLogs];
  }

  async addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    this.loadFromFile();
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(fullEntry);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    this.saveToFile();
    return fullEntry;
  }

  async getMonotonicTimeMarker(): Promise<string | null> {
    this.loadFromFile();
    return this.lastTimeMarker;
  }

  async setMonotonicTimeMarker(timestamp: string): Promise<void> {
    this.loadFromFile();
    this.lastTimeMarker = timestamp;
    this.saveToFile();
  }
}

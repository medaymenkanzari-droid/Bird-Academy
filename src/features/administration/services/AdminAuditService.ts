/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdminAuditEntry, AdminRole } from '../types/admin.types';

const AUDIT_STORAGE_KEY = 'bird_academy_admin_audit_logs';

export class AdminAuditService {
  private static getLogs(): AdminAuditEntry[] {
    try {
      const data = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (!data) return this.getInitialSeedLogs();
      return JSON.parse(data);
    } catch {
      return this.getInitialSeedLogs();
    }
  }

  private static saveLogs(logs: AdminAuditEntry[]): void {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 1000))); // keep max 1000 audit records
    } catch (e) {
      console.error('Failed to save audit logs:', e);
    }
  }

  public static logAction(params: {
    actorId?: string;
    actorName?: string;
    role?: AdminRole;
    action: string;
    category: AdminAuditEntry['category'];
    target: string;
    details: string;
    status?: 'success' | 'warning' | 'error';
  }): AdminAuditEntry {
    const logs = this.getLogs();
    const entry: AdminAuditEntry = {
      id: 'AUD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      timestamp: new Date().toISOString(),
      actorId: params.actorId || 'ADM-001',
      actorName: params.actorName || 'Propriétaire Système',
      role: params.role || 'super_admin',
      action: params.action,
      category: params.category,
      target: params.target,
      details: params.details,
      status: params.status || 'success',
      ipAddress: '127.0.0.1 (Local Session)',
    };

    logs.unshift(entry);
    this.saveLogs(logs);
    return entry;
  }

  public static getAll(): AdminAuditEntry[] {
    return this.getLogs();
  }

  public static filter(category?: string, query?: string): AdminAuditEntry[] {
    let logs = this.getLogs();
    if (category && category !== 'all') {
      logs = logs.filter(l => l.category === category);
    }
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      logs = logs.filter(l => 
        l.action.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return logs;
  }

  public static clearLogs(): void {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }

  private static getInitialSeedLogs(): AdminAuditEntry[] {
    const now = new Date();
    return [
      {
        id: 'AUD-SEED-001',
        timestamp: new Date(now.getTime() - 3600000 * 2).toISOString(),
        actorId: 'ADM-001',
        actorName: 'Administrateur Principal',
        role: 'super_admin',
        action: 'Initialisation Système',
        category: 'system',
        target: 'Back Office Enterprise',
        details: 'Initialisation du Centre d Administration Enterprise Bird Academy RC2',
        status: 'success',
        ipAddress: '127.0.0.1',
      },
      {
        id: 'AUD-SEED-002',
        timestamp: new Date(now.getTime() - 3600000 * 1).toISOString(),
        actorId: 'ADM-001',
        actorName: 'Administrateur Principal',
        role: 'super_admin',
        action: 'Vérification Licence LMSE',
        category: 'license',
        target: 'LMSE-ENT-2026-0001',
        details: 'Contrôle périodique de validité de la licence Enterprise master',
        status: 'success',
        ipAddress: '127.0.0.1',
      }
    ];
  }
}

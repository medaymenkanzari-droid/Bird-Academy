/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from './index';

export enum EventType {
  BIRD_ADD = 'BIRD_ADD',
  BIRD_EDIT = 'BIRD_EDIT',
  BIRD_DELETE = 'BIRD_DELETE',
  COUPLE_ADD = 'COUPLE_ADD',
  COUPLE_DISSOLVE = 'COUPLE_DISSOLVE',
  REPRO_START = 'REPRO_START',
  PONTE_ADD = 'PONTE_ADD',
  PONTE_UPDATE = 'PONTE_UPDATE',
  REPRO_CLOSE = 'REPRO_CLOSE',
  JEUNE_ADD = 'JEUNE_ADD',
  JEUNE_WEAN = 'JEUNE_WEAN',
  CAGE_ADD = 'CAGE_ADD',
  CAGE_EDIT = 'CAGE_EDIT',
  CAGE_DELETE = 'CAGE_DELETE',
  SANTE_ADD = 'SANTE_ADD',
  SANTE_COMPLETE = 'SANTE_COMPLETE',
  SANTE_DELETE = 'SANTE_DELETE',
  ALIM_UPDATE = 'ALIM_UPDATE',
  DEPENSE_ADD = 'DEPENSE_ADD',
  VENTE_ADD = 'VENTE_ADD',
  DB_RESET = 'DB_RESET',
  DB_IMPORT = 'DB_IMPORT',
  BIRD_ARCHIVE = 'BIRD_ARCHIVE',
  BIRD_RESTORE = 'BIRD_RESTORE',
  BIRD_DECEASED = 'BIRD_DECEASED',
  BIRD_CAGE_CHANGE = 'BIRD_CAGE_CHANGE',
  BIRD_ACQUISITION = 'BIRD_ACQUISITION',
  BIRD_REPRODUCTION = 'BIRD_REPRODUCTION',
  HABITAT_CREATE = 'HABITAT_CREATE',
  HABITAT_UPDATE = 'HABITAT_UPDATE',
  HABITAT_ARCHIVE = 'HABITAT_ARCHIVE',
  HABITAT_RESTORE = 'HABITAT_RESTORE',
  HABITAT_MOVE = 'HABITAT_MOVE',
  QUARANTINE_START = 'QUARANTINE_START',
  QUARANTINE_END = 'QUARANTINE_END'
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  eventType: EventType;
  description: string;
  details?: Record<string, any>;
}

export class ActivityLogger {
  private static STORAGE_KEY = 'activity_logs';

  static log(eventType: EventType, description: string, details?: Record<string, any>): void {
    const logEntry: AuditEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      eventType,
      description,
      details
    };
    
    try {
      const logs = this.getLogs();
      logs.unshift(logEntry); // prepend latest log
      
      // Keep only last 200 logs to prevent storage exhaustion
      if (logs.length > 200) {
        logs.length = 200;
      }
      
      appStorage.setItem(this.STORAGE_KEY, logs);
    } catch (e) {
      console.error('Failed to log activity event:', e);
    }
  }

  static getLogs(): AuditEntry[] {
    return appStorage.getItem<AuditEntry[]>(this.STORAGE_KEY, []);
  }

  static clearLogs(): void {
    appStorage.removeItem(this.STORAGE_KEY);
  }
}

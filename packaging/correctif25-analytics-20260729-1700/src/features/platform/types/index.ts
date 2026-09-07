/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../../../utils/translations';

// --- SETTINGS V2 TYPES ---
export interface ApplicationSettings {
  language: Language;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  layoutDensity: 'compact' | 'comfortable';
}

export interface BreedingSettings {
  defaultSpecies: string;
  incubationPeriodDays: number;
  weaningPeriodDays: number;
  quarantinePeriodDays: number;
  minBreedingAgeMonths: number;
}

export interface NotificationSettings {
  enableAlerts: boolean;
  soundEnabled: boolean;
  leadTimeDays: number;
  notifyOnWeaning: boolean;
  notifyOnHatching: boolean;
  notifyOnQuarantineEnd: boolean;
  notifyOnTreatments: boolean;
}

export interface BackupSettings {
  autoBackupOnExit: boolean;
  compressBackups: boolean;
  encryptBackups: boolean;
  encryptionKey: string;
  quotaLimitMb: number;
}

export interface AnalyticsSettings {
  defaultChartType: 'bar' | 'line' | 'area';
  showTrendlines: boolean;
  refreshIntervalSec: number;
  activeKPIs: string[];
}

export interface IntelligenceSettings {
  enableSuggestions: boolean;
  autoGeneticsCheck: boolean;
  minConsanguinitySafety: number;
}

export interface SecuritySettings {
  enforceSignatureVerification: boolean;
  blockCorruptedImports: boolean;
  auditDetailLevel: 'standard' | 'high' | 'paranoid';
}

export interface PlatformSettingsV2 {
  app: ApplicationSettings;
  breeding: BreedingSettings;
  notifications: NotificationSettings;
  backup: BackupSettings;
  analytics: AnalyticsSettings;
  intelligence: IntelligenceSettings;
  security: SecuritySettings;
}

// --- BACKUP & RESTORE TYPES ---
export interface BackupHistoryEntry {
  id: string;
  date: string;
  filename: string;
  size: number; // in bytes
  checksum: string;
  comments: string;
  version: string;
  type: 'full' | 'selective';
  tables: string[];
  isEncrypted: boolean;
  isCompressed: boolean;
  status: 'success' | 'failed';
}

export interface RestoreSimulation {
  isValid: boolean;
  error?: string;
  isEncrypted?: boolean;
  requiresPassword?: boolean;
  version: string;
  checksum: string;
  isCompatible: boolean;
  counts: {
    birds: number;
    couples: number;
    cages: number;
    documents: number;
    photos: number;
    reports: number;
  };
  compatibilityIssues: string[];
}

// --- INTEGRITY TYPES ---
export type IntegrityCategory = 
  | 'parent' 
  | 'cage' 
  | 'couple' 
  | 'reference' 
  | 'document' 
  | 'photo' 
  | 'id' 
  | 'uuid' 
  | 'stats';

export type Severity = 'info' | 'warning' | 'critical';

export interface IntegrityIssue {
  id: string;
  category: IntegrityCategory;
  severity: Severity;
  description: string;
  details: string;
  suggestedFix: string;
  canFixAuto: boolean;
}

export interface IntegrityReport {
  timestamp: string;
  score: number; // 0 to 100
  issuesCount: {
    critical: number;
    warning: number;
    info: number;
  };
  issues: IntegrityIssue[];
}

// --- NOTIFICATION TYPES ---
export type PlatformNotificationType = 
  | 'repro' 
  | 'health' 
  | 'quarantine' 
  | 'vaccination' 
  | 'treatment' 
  | 'birthday' 
  | 'system';

export interface PlatformNotification {
  id: string;
  date: string;
  title: string;
  content: string;
  type: PlatformNotificationType;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  archived: boolean;
  actionUrl?: string;
}

// --- UNIFIED CALENDAR TYPES ---
export type CalendarEventType =
  | 'birth'
  | 'laying'
  | 'mirage'
  | 'hatch'
  | 'weaning'
  | 'treatment'
  | 'quarantine'
  | 'sale'
  | 'purchase'
  | 'finance'
  | 'custom';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, string | number>;
}

// --- AUDIT TYPES ---
export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  module: string;
  action: string;
  level: AuditLevel;
  description: string;
  details?: string;
  ip?: string;
}

// --- HEALTH & MONITORING TYPES ---
export interface PlatformHealthReport {
  storageScore: number;
  cacheScore: number;
  integrityScore: number;
  backupScore: number;
  notificationScore: number;
  performanceScore: number;
  overallScore: number; // 0 to 100
  storageUsageBytes: number;
  storageQuotaBytes: number;
  warnings: string[];
}

// --- PERFORMANCE TYPES ---
export interface PerformanceMetric {
  id: string;
  name: string;
  durationMs: number;
  timestamp: string;
  recommendation?: string;
}

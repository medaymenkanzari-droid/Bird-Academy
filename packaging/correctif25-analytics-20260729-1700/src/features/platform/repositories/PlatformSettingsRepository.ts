/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { PlatformSettingsV2 } from '../types';

export class PlatformSettingsRepository {
  private static STORAGE_KEY = 'platform_settings_v2';

  private static DEFAULT_SETTINGS: PlatformSettingsV2 = {
    app: {
      language: 'fr',
      theme: 'light',
      accentColor: '#f59e0b', // amber-500
      layoutDensity: 'comfortable'
    },
    breeding: {
      defaultSpecies: 'Canari',
      incubationPeriodDays: 13,
      weaningPeriodDays: 30,
      quarantinePeriodDays: 30,
      minBreedingAgeMonths: 10
    },
    notifications: {
      enableAlerts: true,
      soundEnabled: false,
      leadTimeDays: 2,
      notifyOnWeaning: true,
      notifyOnHatching: true,
      notifyOnQuarantineEnd: true,
      notifyOnTreatments: true
    },
    backup: {
      autoBackupOnExit: false,
      compressBackups: true,
      encryptBackups: false,
      encryptionKey: 'bird_academy_secure_key',
      quotaLimitMb: 10
    },
    analytics: {
      defaultChartType: 'bar',
      showTrendlines: true,
      refreshIntervalSec: 60,
      activeKPIs: ['fertility', 'hatching', 'survival', 'expenses', 'sales']
    },
    intelligence: {
      enableSuggestions: true,
      autoGeneticsCheck: true,
      minConsanguinitySafety: 12.5
    },
    security: {
      enforceSignatureVerification: false,
      blockCorruptedImports: true,
      auditDetailLevel: 'standard'
    }
  };

  static getSettings(): PlatformSettingsV2 {
    const current = appStorage.getItem<PlatformSettingsV2 | null>(this.STORAGE_KEY, null);
    if (!current) {
      return { ...this.DEFAULT_SETTINGS };
    }
    // Merge to guarantee all properties exist in case of version upgrades
    return {
      app: { ...this.DEFAULT_SETTINGS.app, ...current.app },
      breeding: { ...this.DEFAULT_SETTINGS.breeding, ...current.breeding },
      notifications: { ...this.DEFAULT_SETTINGS.notifications, ...current.notifications },
      backup: { ...this.DEFAULT_SETTINGS.backup, ...current.backup },
      analytics: { ...this.DEFAULT_SETTINGS.analytics, ...current.analytics },
      intelligence: { ...this.DEFAULT_SETTINGS.intelligence, ...current.intelligence },
      security: { ...this.DEFAULT_SETTINGS.security, ...current.security }
    };
  }

  static saveSettings(settings: PlatformSettingsV2): void {
    appStorage.setItem(this.STORAGE_KEY, settings);
  }

  static updateSection<K extends keyof PlatformSettingsV2>(section: K, value: PlatformSettingsV2[K]): void {
    const current = this.getSettings();
    current[section] = value;
    this.saveSettings(current);
  }
}

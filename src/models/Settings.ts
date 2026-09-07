/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'es' | 'it' | 'ar';
  currency: string;
  enableNotifications: boolean;
  backupIntervalDays: number;
}

export class SettingsModel {
  static getDefaultSettings(): AppSettings {
    return {
      theme: 'system',
      language: 'fr',
      currency: 'TND',
      enableNotifications: true,
      backupIntervalDays: 7
    };
  }
}

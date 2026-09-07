/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnalyticsSettings } from '../types';

const STORAGE_KEY = 'bird_academy_analytics_settings';

const DEFAULT_SETTINGS: AnalyticsSettings = {
  defaultPeriod: 'year',
  currency: 'DT',
  numberFormat: 'fr',
  dateFormat: 'YYYY-MM-DD',
  fertilityTarget: 80,
  hatchingTarget: 75,
  weaningTarget: 70,
  revenueTarget: 1500,
  survivalTarget: 92,
};

export class AnalyticsSettingsRepository {
  static getSettings(): AnalyticsSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error('Failed to load analytics settings', e);
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AnalyticsSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save analytics settings', e);
    }
  }
}

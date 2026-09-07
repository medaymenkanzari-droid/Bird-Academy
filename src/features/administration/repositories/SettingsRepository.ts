/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';

export class SettingsRepository {
  private static THEME_KEY = 'bird_academy_theme';
  private static LANG_KEY = 'language';

  static getTheme(): 'light' | 'dark' | 'system' {
    return appStorage.getItem<'light' | 'dark' | 'system'>(this.THEME_KEY, 'light');
  }

  static setTheme(theme: 'light' | 'dark' | 'system'): void {
    appStorage.setItem(this.THEME_KEY, theme);
  }

  static getLanguage(): string {
    return appStorage.getItem<string>(this.LANG_KEY, 'fr');
  }

  static setLanguage(lang: string): void {
    appStorage.setItem(this.LANG_KEY, lang);
  }

  static clearAll(): void {
    appStorage.clear();
  }
}

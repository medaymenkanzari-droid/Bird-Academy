/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IStorageProvider {
  getItem<T>(key: string, defaultValue: T): T;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

const APPLICATION_DATA_KEYS = new Set([
  'canaris', 'cages', 'couples', 'reproductions', 'pontes', 'jeunes',
  'sante', 'alimentation', 'depenses', 'ventes', 'language', 'theme',
  'activity_logs', 'db_version'
]);

const APPLICATION_KEY_PREFIXES = [
  'bird_academy_', 'birdbox_', 'ba_', 'platform_', 'demo_', 'help_', 'wcag_'
];

function isApplicationStorageKey(key: string): boolean {
  return APPLICATION_DATA_KEYS.has(key)
    || APPLICATION_KEY_PREFIXES.some(prefix => key.startsWith(prefix));
}

export class LocalStorageProvider implements IStorageProvider {
  private getPrefixedKey(key: string): string {
    const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('bird_academy_demo_active') === 'true';
    if (!isDemo) return key;
    const systemKeys = [
      'bird_academy_language', 'bird_academy_demo_active', 'db_version', 
      'bird_academy_wizard_completed', 'bird_academy_wizard_step', 
      'bird_academy_wizard_data', 'theme', 'bird_academy_wizard_state'
    ];
    if (systemKeys.includes(key)) return key;
    return 'demo_' + key;
  }

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const realKey = this.getPrefixedKey(key);
      const item = localStorage.getItem(realKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading key "${key}" from localStorage:`, e);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      const realKey = this.getPrefixedKey(key);
      localStorage.setItem(realKey, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing key "${key}" to localStorage:`, e);
    }
  }

  removeItem(key: string): void {
    try {
      const realKey = this.getPrefixedKey(key);
      localStorage.removeItem(realKey);
    } catch (e) {
      console.error(`Error removing key "${key}" from localStorage:`, e);
    }
  }

  clear(): void {
    try {
      const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('bird_academy_demo_active') === 'true';
      if (isDemo) {
        // Clear only demo keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('demo_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } else {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !key.startsWith('demo_') && isApplicationStorageKey(key)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }
}

// Data Version (PART 6)
export const DatabaseVersion = 1;

export class MigrationManager {
  static migrate(storage: IStorageProvider) {
    // Browser storage is unavailable during server-side tools and Node-based tests.
    // In those environments migrations must remain a no-op instead of emitting
    // misleading errors while modules are imported.
    if (typeof localStorage === 'undefined') {
      return;
    }

    // 1. Migrate legacy "birdbox_" keys to "bird_academy_"
    try {
      const keysToMigrate: { oldKey: string; newKey: string; val: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('birdbox_')) {
          const newKey = key.replace('birdbox_', 'bird_academy_');
          const val = localStorage.getItem(key);
          if (val !== null) {
            keysToMigrate.push({ oldKey: key, newKey, val });
          }
        }
      }
      keysToMigrate.forEach(({ oldKey, newKey, val }) => {
        const currentValue = localStorage.getItem(newKey);
        if (currentValue === null) {
          localStorage.setItem(newKey, val);
          localStorage.removeItem(oldKey);
        } else if (currentValue === val) {
          localStorage.removeItem(oldKey);
        }
      });
    } catch (e) {
      console.error("Local storage brand migration failed:", e);
    }

    // 2. Align historical branded business collections with repository keys.
    // Conflicting values are intentionally preserved for a manual integrity audit.
    const businessAliases: Record<string, string> = {
      bird_academy_canaris: 'canaris',
      bird_academy_couples: 'couples',
      bird_academy_reproductions: 'reproductions',
      bird_academy_pontes: 'pontes',
      bird_academy_jeunes: 'jeunes',
      bird_academy_sante: 'sante',
      bird_academy_alimentation: 'alimentation',
      bird_academy_depenses: 'depenses',
      bird_academy_ventes: 'ventes'
    };

    try {
      Object.entries(businessAliases).forEach(([historicalKey, canonicalKey]) => {
        const historicalValue = localStorage.getItem(historicalKey);
        if (historicalValue === null) return;

        const canonicalValue = localStorage.getItem(canonicalKey);
        if (canonicalValue === null) {
          localStorage.setItem(canonicalKey, historicalValue);
        }
      });
    } catch (e) {
      console.error('Business storage key migration failed:', e);
    }

    const currentVersion = storage.getItem<number>('db_version', 0);
    if (currentVersion < DatabaseVersion) {
      // Prepared for future migrations here
      // For version 1, we just write the version identifier
      storage.setItem('db_version', DatabaseVersion);
    }
  }
}

// Exports a ready-to-use Storage Singleton
export const appStorage: IStorageProvider = new LocalStorageProvider();

// Perform migration check immediately on initialization
MigrationManager.migrate(appStorage);

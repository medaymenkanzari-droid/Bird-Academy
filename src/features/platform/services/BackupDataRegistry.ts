import { appStorage } from '../../../storage';

type BackupTable = 'birds' | 'cages' | 'couples' | 'repro' | 'sante' | 'alim' | 'finance';

const STORAGE_GROUPS = {
  cages: [
    'ba_facilities',
    'ba_zones',
    'ba_aviaries',
    'ba_cages_v2',
    'ba_compartments',
    'ba_quarantine_areas',
    'ba_quarantine_records',
    'ba_deplacements',
  ],
  repro: [
    'ba_breeding_pairs',
    'ba_pair_history',
    'ba_breeding_seasons',
    'ba_clutches',
    'ba_eggs',
    'ba_egg_timeline',
    'ba_egg_inspections',
    'ba_incubations',
    'ba_incubation_events',
    'ba_repro_hatchings',
    'ba_repro_chicks',
    'ba_repro_lifecycle_events',
    'ba_repro_growth_records',
    'ba_repro_weight_records',
    'ba_repro_feeding_records',
    'ba_repro_weanings',
    'ba_nursery_records',
    'ba_nursery_foster_parents',
    'ba_nursery_transfers',
    'ba_nursery_formulas',
    'ba_nursery_crop_inspections',
    'ba_nursery_feeding_sessions',
    'ba_nursery_protocols',
    'ba_nursery_rescue_cases',
  ],
  platform: [
    'platform_custom_calendar_events',
    'platform_notifications',
  ],
  genetics: ['genetics_parameters'],
} as const;

const ARRAY_KEYS = new Set<string>([
  ...STORAGE_GROUPS.cages,
  ...STORAGE_GROUPS.repro,
  ...STORAGE_GROUPS.platform,
]);

const ALLOWED_KEYS = new Set<string>([
  ...ARRAY_KEYS,
  ...STORAGE_GROUPS.genetics,
]);

export interface ExtendedBackupData {
  values: Record<string, unknown>;
  includedKeys: string[];
}

/**
 * Central allow-listed registry for business collections not covered by the
 * historical repositories used by BackupRestoreService.
 */
export class BackupDataRegistry {
  static exportData(
    type: 'full' | 'selective',
    selectedTables: string[],
  ): ExtendedBackupData {
    const selected = new Set(selectedTables as BackupTable[]);
    const keys = type === 'full'
      ? Array.from(ALLOWED_KEYS)
      : [
          ...(selected.has('cages') ? STORAGE_GROUPS.cages : []),
          ...(selected.has('repro') ? STORAGE_GROUPS.repro : []),
        ];

    const values: Record<string, unknown> = {};
    keys.forEach(key => {
      const defaultValue = ARRAY_KEYS.has(key) ? [] : null;
      values[key] = appStorage.getItem<unknown>(key, defaultValue);
    });

    return { values, includedKeys: keys };
  }

  static captureData(includedKeys: unknown): ExtendedBackupData {
    const keys = Array.isArray(includedKeys)
      ? includedKeys.filter((key): key is string => typeof key === 'string' && ALLOWED_KEYS.has(key))
      : [];
    const values: Record<string, unknown> = {};
    keys.forEach(key => {
      values[key] = appStorage.getItem<unknown>(key, ARRAY_KEYS.has(key) ? [] : null);
    });
    return { values, includedKeys: keys };
  }

  static restoreData(values: unknown, includedKeys: unknown): void {
    if (!values || typeof values !== 'object' || !Array.isArray(includedKeys)) return;
    const source = values as Record<string, unknown>;
    includedKeys.forEach(key => {
      if (typeof key !== 'string' || !ALLOWED_KEYS.has(key) || !(key in source)) return;
      appStorage.setItem(key, source[key]);
    });
  }

  static verifyData(values: unknown, includedKeys: unknown): boolean {
    return this.findMismatch(values, includedKeys) === null;
  }

  static findMismatch(values: unknown, includedKeys: unknown): string | null {
    if (!values || typeof values !== 'object' || !Array.isArray(includedKeys)) return null;
    const source = values as Record<string, unknown>;
    for (const key of includedKeys) {
      if (typeof key !== 'string' || !ALLOWED_KEYS.has(key) || !(key in source)) continue;
      const actual = appStorage.getItem<unknown>(key, ARRAY_KEYS.has(key) ? [] : null);
      if (JSON.stringify(actual) !== JSON.stringify(source[key])) return key;
    }
    return null;
  }
}

import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }

  dump(): string {
    return JSON.stringify(Array.from(this.values.entries()).sort(([a], [b]) => a.localeCompare(b)));
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

const { ReproductionAnalyticsService } = await import(
  '../src/features/reproduction/services/ReproductionAnalyticsService'
);
const { getBreedingPairDisplayName } = await import(
  '../src/features/reproduction/utils/pairDisplay'
);

function seed(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedEmptySources(): void {
  seed('reproductions', []);
  seed('pontes', []);
  seed('ba_clutches', []);
  seed('ba_incubations', []);
}

beforeEach(() => {
  localStorage.clear();
  seedEmptySources();
});

test('returns an explicit empty snapshot when neither V1 nor V2 contains data', () => {
  const snapshot = ReproductionAnalyticsService.getSnapshot();

  assert.equal(snapshot.selectedSource, 'empty');
  assert.equal(snapshot.hasSourceConflict, false);
  assert.deepEqual(snapshot.warnings, []);
  assert.deepEqual(snapshot.items, []);
  assert.deepEqual(snapshot.metrics, {
    clutchesCount: 0,
    totalEggs: 0,
    fertilityRate: null,
    hatchRate: null,
    activeIncubations: null,
  });
});

test('uses a safe fallback for a migrated breeding pair without a name', () => {
  assert.equal(
    getBreedingPairDisplayName({ name: "Plume d'Or × Seringat" }, 'Couple bp-1'),
    "Plume d'Or × Seringat",
  );
  assert.equal(getBreedingPairDisplayName({ name: '   ' }, 'Couple bp-1'), 'Couple bp-1');
  assert.equal(getBreedingPairDisplayName({}, 'Couple bp-1'), 'Couple bp-1');
  assert.equal(getBreedingPairDisplayName(undefined, 'Couple bp-1'), 'Couple bp-1');
  assert.doesNotThrow(() => getBreedingPairDisplayName({}, '').toLowerCase());
});

test('locks the demo baseline at 2 clutches, 9 eggs, 78%, 43% and 1 active cycle', () => {
  seed('reproductions', [
    { id: 1, couple_id: 1, date_debut: '2026-05-01', statut: 'Clôturé' },
    { id: 2, couple_id: 2, date_debut: '2026-07-01', statut: 'En cours' },
  ]);
  seed('pontes', [
    {
      id: 1,
      reproduction_id: 1,
      date: '2026-05-05',
      oeufs: 4,
      oeufs_fecondes: 3,
      eclosions: 3,
      sevrages: 1,
    },
    {
      id: 2,
      reproduction_id: 2,
      date: '2026-07-02',
      oeufs: 5,
      oeufs_fecondes: 4,
      eclosions: 0,
      sevrages: 0,
    },
  ]);

  const snapshot = ReproductionAnalyticsService.getSnapshot();

  assert.equal(snapshot.selectedSource, 'legacy');
  assert.equal(snapshot.hasSourceConflict, false);
  assert.deepEqual(snapshot.metrics, {
    clutchesCount: 2,
    totalEggs: 9,
    fertilityRate: 78,
    hatchRate: 43,
    activeIncubations: 1,
  });
  assert.deepEqual(
    snapshot.items.map(item => ({ id: item.id, pairId: item.pairId, status: item.status })),
    [
      { id: 'legacy-ponte-1', pairId: 'bp-1', status: 'completed' },
      { id: 'legacy-ponte-2', pairId: 'bp-2', status: 'active' },
    ],
  );
});

test('calculates rates only from clutches whose source values are known', () => {
  seed('reproductions', [
    { id: 1, couple_id: 1, date_debut: '2026-01-01', statut: 'Clôturé' },
  ]);
  seed('pontes', [
    {
      id: 1,
      reproduction_id: 1,
      date: '2026-01-02',
      oeufs: 4,
      oeufs_fecondes: 2,
      eclosions: 1,
    },
    {
      id: 2,
      reproduction_id: 1,
      date: '2026-02-02',
      oeufs: 6,
    },
  ]);

  const snapshot = ReproductionAnalyticsService.getSnapshot();

  assert.equal(snapshot.metrics.totalEggs, 10);
  assert.equal(snapshot.metrics.fertilityRate, 50);
  assert.equal(snapshot.metrics.hatchRate, 50);
});

test('counts one active legacy cycle even when it contains several unfinished clutches', () => {
  seed('reproductions', [
    { id: 7, couple_id: 4, date_debut: '2026-03-01', statut: 'En cours' },
  ]);
  seed('pontes', [
    { id: 10, reproduction_id: 7, date: '2026-03-02', oeufs: 3, eclosions: 0 },
    { id: 11, reproduction_id: 7, date: '2026-04-02', oeufs: 4, eclosions: 1 },
  ]);

  const snapshot = ReproductionAnalyticsService.getSnapshot();

  assert.equal(snapshot.metrics.clutchesCount, 2);
  assert.equal(snapshot.metrics.activeIncubations, 1);
});

test('uses V1 as the canonical source and reports a conflict without merging V2', () => {
  seed('reproductions', [
    { id: 1, couple_id: 1, date_debut: '2026-01-01', statut: 'En cours' },
  ]);
  seed('pontes', [
    { id: 1, reproduction_id: 1, date: '2026-01-02', oeufs: 5, eclosions: 0 },
  ]);
  seed('ba_clutches', [
    {
      id: 'clutch-v2-conflict',
      pairId: 'bp-v2',
      startDate: '2026-02-01',
      observations: '',
      status: 'active',
      eggCount: 12,
      fertilizedCount: 10,
      clearCount: 2,
      hatchedCount: 8,
      lostCount: 2,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
  ]);

  const snapshot = ReproductionAnalyticsService.getSnapshot();

  assert.equal(snapshot.selectedSource, 'legacy');
  assert.equal(snapshot.hasSourceConflict, true);
  assert.deepEqual(snapshot.warnings, ['sourceConflictWarning']);
  assert.equal(snapshot.items.length, 1);
  assert.equal(snapshot.metrics.totalEggs, 5);
  assert.equal(snapshot.items[0]?.source, 'legacy');
});

test('uses V2 when V1 is empty and counts incubations linked to active clutches only', () => {
  seed('ba_clutches', [
    {
      id: 'clutch-active',
      pairId: 'pair-1',
      startDate: '2026-06-01',
      observations: '',
      status: 'active',
      eggCount: 5,
      fertilizedCount: 4,
      clearCount: 1,
      hatchedCount: 2,
      lostCount: 2,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    },
    {
      id: 'clutch-completed',
      pairId: 'pair-2',
      startDate: '2026-04-01',
      observations: '',
      status: 'completed',
      eggCount: 4,
      fertilizedCount: 3,
      clearCount: 1,
      hatchedCount: 3,
      lostCount: 0,
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-20T00:00:00.000Z',
    },
  ]);
  seed('ba_incubations', [
    { id: 'inc-active', clutchId: 'clutch-active' },
    { id: 'inc-completed', clutchId: 'clutch-completed' },
    { id: 'inc-orphan', clutchId: 'clutch-missing' },
  ]);

  const snapshot = ReproductionAnalyticsService.getSnapshot();

  assert.equal(snapshot.selectedSource, 'v2');
  assert.equal(snapshot.hasSourceConflict, false);
  assert.equal(snapshot.metrics.clutchesCount, 2);
  assert.equal(snapshot.metrics.totalEggs, 9);
  assert.equal(snapshot.metrics.fertilityRate, 78);
  assert.equal(snapshot.metrics.hatchRate, 71);
  assert.equal(snapshot.metrics.activeIncubations, 1);
  assert.deepEqual(snapshot.items.map(item => item.source), ['v2', 'v2']);
});

test('does not write, migrate or duplicate data while building a snapshot', () => {
  seed('reproductions', [
    { id: 1, couple_id: 1, date_debut: '2026-01-01', statut: 'En cours' },
  ]);
  seed('pontes', [
    { id: 1, reproduction_id: 1, date: '2026-01-02', oeufs: 5, eclosions: 0 },
  ]);
  seed('ba_clutches', [
    {
      id: 'clutch-v2',
      pairId: 'pair-2',
      startDate: '2026-02-01',
      observations: '',
      status: 'active',
      eggCount: 4,
      fertilizedCount: 3,
      clearCount: 1,
      hatchedCount: 0,
      lostCount: 0,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
  ]);

  const before = memoryStorage.dump();
  ReproductionAnalyticsService.getSnapshot();
  const after = memoryStorage.dump();

  assert.equal(after, before);
});

import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

const { IntegrityEngine } = await import('../src/features/platform/engines/IntegrityEngine');

function seed(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedEmptyDatabase(): void {
  seed('canaris', []);
  seed('bird_academy_cages', []);
  seed('ba_cages_v2', []);
  seed('ba_habitat_migration_done', true);
  seed('couples', []);
  seed('reproductions', []);
  seed('pontes', []);
  seed('sante', []);
  seed('depenses', []);
  seed('ventes', []);
}

beforeEach(() => {
  localStorage.clear();
  seedEmptyDatabase();
});

test('returns a perfect score for an empty coherent database', () => {
  const report = IntegrityEngine.runCheckup();

  assert.equal(report.score, 100);
  assert.deepEqual(report.issuesCount, { critical: 0, warning: 0, info: 0 });
  assert.deepEqual(report.issues, []);
});

test('does not treat an archived parent as a missing biological parent', () => {
  seed('canaris', [
    { id: 1, nom: 'Père historique', bague: 'P-1', sexe: 'Mâle', archived: true },
    {
      id: 2,
      nom: 'Descendant',
      bague: 'D-2',
      sexe: 'Mâle',
      pere_id: 1,
      archived: false,
    },
  ]);

  const report = IntegrityEngine.runCheckup();

  assert.equal(report.issues.some(issue => issue.id === 'parent-missing-father-2'), false);
});

test('detects duplicated bird IDs and broken reproduction references', () => {
  seed('canaris', [
    { id: 1, nom: 'A', bague: 'A-1', sexe: 'Mâle', archived: false },
    { id: 1, nom: 'B', bague: 'B-1', sexe: 'Femelle', archived: false },
  ]);
  seed('reproductions', [{ id: 4, couple_id: 999, statut: 'En cours' }]);
  seed('pontes', [{ id: 8, reproduction_id: 777, oeufs: 2, oeufs_fecondes: 1, eclosions: 0 }]);

  const report = IntegrityEngine.runCheckup();
  const issueIds = new Set(report.issues.map(issue => issue.id));

  assert.equal(issueIds.has('dup-bird-1'), true);
  assert.equal(issueIds.has('repro-missing-couple-4'), true);
  assert.equal(issueIds.has('ponte-missing-repro-8'), true);
  assert.equal(report.issuesCount.critical, 3);
});

test('detects impossible egg statistics without modifying the source record', () => {
  const clutch = {
    id: 3,
    reproduction_id: 2,
    oeufs: 4,
    oeufs_fecondes: 6,
    eclosions: 7,
  };
  seed('couples', [{ id: 1, male_id: 10, femelle_id: 11, statut: 'Actif' }]);
  seed('reproductions', [{ id: 2, couple_id: 1, statut: 'En cours' }]);
  seed('pontes', [clutch]);

  const before = localStorage.getItem('pontes');
  const report = IntegrityEngine.runCheckup();
  const after = localStorage.getItem('pontes');

  assert.equal(report.issues.some(issue => issue.id === 'ponte-stat-inc-fecondes-3'), true);
  assert.equal(report.issues.some(issue => issue.id === 'ponte-stat-inc-eclosions-3'), true);
  assert.equal(after, before);
});

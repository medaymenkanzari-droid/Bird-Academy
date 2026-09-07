import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Canari } from '../src/types';

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

const { BirdEngine } = await import('../src/business/BirdEngine');
const { BirdModel } = await import('../src/models/Bird');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { BirdService } = await import('../src/features/birds/services/BirdService');

function makeBird(id: number, overrides: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `BA-${id}`,
    nom: `Oiseau ${id}`,
    sexe: 'Mâle',
    espece: 'canari',
    categorie: 'canari_posture',
    race: 'Gloster Fancy',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2024-01-01',
    cage_id: undefined,
    pere_id: null,
    mere_id: null,
    ...overrides,
  };
}

function withoutId(bird: Canari): Omit<Canari, 'id'> {
  const { id: _id, ...data } = bird;
  return data;
}

test('rejects invalid calendar dates and any future birth or acquisition date', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  assert.equal(BirdEngine.validateDateNaissance('2026-02-31'), false);
  assert.equal(BirdEngine.validateDateNaissance(tomorrow.toISOString().slice(0, 10)), false);
  assert.equal(BirdEngine.validateDateNaissance(new Date().toISOString().slice(0, 10)), true);
});

test('does not count an incomplete month in the biological age', () => {
  const now = new Date();
  const exactTenMonths = new Date(now.getFullYear(), now.getMonth() - 10, now.getDate());
  const toLocalDate = (date: Date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  if (now.getDate() < 28) {
    const futureDayThisMonth = new Date(now.getFullYear(), now.getMonth() - 10, now.getDate() + 1);
    assert.equal(BirdModel.getAgeInMonths(toLocalDate(futureDayThisMonth)), 9);
  }
  assert.equal(BirdModel.getAgeInMonths(toLocalDate(exactTenMonths)), 10);
});

test('creates an acquired bird with a complete 30-day quarantine and no automatic cage', () => {
  localStorage.clear();
  const result = BirdService.create(withoutId(makeBird(1, {
    acquisition: true,
    cage_id: undefined,
    quarantaine: undefined,
  })));

  assert.equal(result.success, true, JSON.stringify(result.errors));
  assert.equal(result.data?.cage_id, undefined);
  assert.equal(result.data?.statut_sante, 'Quarantaine');
  assert.equal(result.data?.quarantaine?.duree_recommandee, 30);
  assert.match(result.data?.quarantaine?.date_fin_estimee ?? '', /^\d{4}-\d{2}-\d{2}$/);
});

test('requires a manual cage or aviary choice for a new resident bird', () => {
  localStorage.clear();
  const withoutCage = BirdService.create(withoutId(makeBird(1, {
    acquisition: false,
    cage_id: undefined,
  })));

  assert.equal(withoutCage.success, false);
  assert.equal(withoutCage.errors?.some(error => error.field === 'cage_id'), true);
  assert.equal(BirdRepository.getAll(true).length, 0);

  const withCage = BirdService.create(withoutId(makeBird(1, {
    acquisition: false,
    cage_id: 1,
  })));

  assert.equal(withCage.success, true, JSON.stringify(withCage.errors));
  assert.equal(withCage.data?.cage_id, 1);
});

test('detects quarantine from structured data instead of relying on the bird name', () => {
  localStorage.clear();
  BirdRepository.saveAll([
    makeBird(1, {
      nom: 'Nouvel arrivant',
      statut_sante: 'Quarantaine',
      quarantaine: {
        date_entree: '2026-07-01',
        duree_recommandee: 30,
        date_fin_estimee: '2099-07-31',
      },
    }),
    makeBird(2, { sexe: 'Femelle', nom: 'Résidente' }),
  ]);

  assert.deepEqual(BirdRepository.filter({ quarantaine: true }).map(bird => bird.id), [1]);
  assert.deepEqual(BirdRepository.filter({ quarantaine: false }).map(bird => bird.id), [2]);
});

test('refuses to report success when updating an unknown bird', () => {
  localStorage.clear();
  const result = BirdService.update(makeBird(404));

  assert.equal(result.success, false);
  assert.equal(BirdRepository.getAll(true).length, 0);
});

test('duplicates phenotype with a deterministic unique ring and without copying habitat assignment', () => {
  localStorage.clear();
  BirdRepository.saveAll([
    makeBird(1, { bague: 'BA-ORIGINAL', cage_id: 4, cageId: 'cage-4' }),
    makeBird(2, { bague: 'BA-ORIGINAL-DUP-1' }),
  ]);

  const duplicate = BirdRepository.duplicate(1);

  assert.equal(duplicate.bague, 'BA-ORIGINAL-DUP-2');
  assert.equal(duplicate.cage_id, undefined);
  assert.equal(duplicate.cageId, undefined);
  assert.equal(duplicate.race, 'Gloster Fancy');
});

test('preserves referential integrity by blocking physical deletion of a paired bird', () => {
  localStorage.clear();
  BirdRepository.saveAll([
    makeBird(1),
    makeBird(2, { sexe: 'Femelle' }),
  ]);
  localStorage.setItem('couples', JSON.stringify([{
    id: 1,
    male_id: 1,
    femelle_id: 2,
    date_creation: '2026-01-01',
    statut: 'Dissous',
  }]));

  const result = BirdService.delete(1);

  assert.equal(result.success, false);
  assert.ok(BirdRepository.getById(1));
  assert.match(result.message ?? '', /Archivez-le/);
});

test('archive and restore remain persisted without changing the bird payload', () => {
  localStorage.clear();
  BirdRepository.saveAll([makeBird(1)]);

  assert.equal(BirdService.archive(1).success, true);
  assert.equal(BirdRepository.getById(1)?.archived, true);
  assert.equal(BirdService.restore(1).success, true);
  assert.equal(BirdRepository.getById(1)?.archived, false);
});

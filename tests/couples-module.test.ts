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

const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { ReproductionRepository } = await import('../src/features/reproduction/repositories/ReproductionRepository');
const { ReproductionService } = await import('../src/features/reproduction/services/ReproductionService');

function makeBird(id: number, sexe: Canari['sexe'], overrides: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `BA-${id}`,
    nom: `Oiseau ${id}`,
    sexe,
    espece: 'canari',
    categorie: 'canari_posture',
    race: 'Gloster Fancy',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2023-01-01',
    archived: false,
    ...overrides,
  };
}

function seedBirds(birds: Canari[]): void {
  localStorage.clear();
  BirdRepository.saveAll(birds);
}

test('refuses to create a pair when a bird is missing', () => {
  seedBirds([makeBird(1, 'Mâle')]);

  assert.throws(() => ReproductionService.createPair(1, 999), /introuvable/);
  assert.equal(ReproductionRepository.getAll().length, 0);
});

test('refuses invalid sex roles even when the service is called outside the UI', () => {
  seedBirds([makeBird(1, 'Femelle'), makeBird(2, 'Mâle')]);

  assert.throws(() => ReproductionService.createPair(1, 2), /mâle et une femelle/);
  assert.equal(ReproductionRepository.getAll().length, 0);
});

test('refuses archived or deceased partners', () => {
  seedBirds([
    makeBird(1, 'Mâle', { archived: true }),
    makeBird(2, 'Femelle'),
  ]);
  assert.throws(() => ReproductionService.createPair(1, 2), /archivé ou décédé/);

  seedBirds([
    makeBird(1, 'Mâle'),
    makeBird(2, 'Femelle', { statut_sante: 'Décédé' }),
  ]);
  assert.throws(() => ReproductionService.createPair(1, 2), /archivé ou décédé/);
});

test('creates one valid V2 pair and synchronizes one canonical legacy pair', () => {
  seedBirds([makeBird(1, 'Mâle'), makeBird(2, 'Femelle')]);

  const pair = ReproductionService.createPair(1, 2, 'Couple test');
  const legacyPairs = JSON.parse(localStorage.getItem('couples') ?? '[]');

  assert.equal(pair.status, 'active');
  assert.equal(ReproductionRepository.getAll().length, 1);
  assert.equal(legacyPairs.length, 1);
  assert.equal(legacyPairs[0].male_id, 1);
  assert.equal(legacyPairs[0].femelle_id, 2);
});

test('prevents a bird from belonging to two active pairs', () => {
  seedBirds([
    makeBird(1, 'Mâle'),
    makeBird(2, 'Femelle'),
    makeBird(3, 'Femelle'),
  ]);
  ReproductionService.createPair(1, 2);

  assert.throws(() => ReproductionService.createPair(1, 3), /déjà à un couple actif/);
  assert.equal(ReproductionRepository.getAll().length, 1);
});

test('does not restore an archived active pair when one partner was paired again', () => {
  seedBirds([
    makeBird(1, 'Mâle'),
    makeBird(2, 'Femelle'),
    makeBird(3, 'Femelle'),
  ]);
  const original = ReproductionService.createPair(1, 2, 'Couple original');
  assert.equal(ReproductionService.archivePair(original.id), true);
  ReproductionService.createPair(1, 3, 'Nouveau couple');

  assert.throws(() => ReproductionService.restorePair(original.id), /déjà à un couple actif/);
  assert.equal(ReproductionRepository.getById(original.id)?.archived, true);
  assert.equal(ReproductionRepository.filter({ status: 'active', archived: false }).length, 1);
});

test('allows reactivation only after both partners are available', () => {
  seedBirds([makeBird(1, 'Mâle'), makeBird(2, 'Femelle')]);
  const pair = ReproductionService.createPair(1, 2);

  assert.equal(ReproductionService.dissolvePair(pair.id), true);
  assert.equal(ReproductionService.reactivatePair(pair.id), true);
  assert.equal(ReproductionRepository.getById(pair.id)?.status, 'active');
});

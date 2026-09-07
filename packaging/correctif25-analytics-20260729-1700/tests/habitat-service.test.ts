import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
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
const { HabitatRepository } = await import('../src/features/habitat/repositories/HabitatRepository');
const { HabitatService } = await import('../src/features/habitat/services/HabitatService');

function entity(id: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    nom: id,
    statut: 'Actif',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    isArchived: false,
    customFields: {},
    ...extra,
  };
}

function makeBird(overrides: Partial<Canari> = {}): Canari {
  return {
    id: 1,
    bague: 'BA-HAB-1',
    nom: 'Habitat Test',
    sexe: 'Mâle',
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

function seedHabitat(): void {
  localStorage.setItem('ba_habitat_migration_done', 'true');
  localStorage.setItem('ba_facilities', JSON.stringify([entity('facility-1')]));
  localStorage.setItem('ba_zones', JSON.stringify([
    entity('zone-1', { facilityId: 'facility-1', isQuarantine: false }),
    entity('zone-2', { facilityId: 'facility-1', isQuarantine: false }),
  ]));
  localStorage.setItem('ba_aviaries', '[]');
  localStorage.setItem('ba_cages_v2', JSON.stringify([
    entity('1', { zoneId: 'zone-1', capacite_max: 3 }),
    entity('cage-two', { zoneId: 'zone-2', capacite_max: 3 }),
  ]));
  localStorage.setItem('ba_compartments', '[]');
  localStorage.setItem('ba_quarantine_areas', JSON.stringify([
    entity('quarantine-1', { facilityId: 'facility-1', capacite_max: 2 }),
  ]));
  localStorage.setItem('ba_quarantine_records', '[]');
  localStorage.setItem('ba_deplacements', '[]');
}

beforeEach(() => {
  localStorage.clear();
  seedHabitat();
});

test('rejects unknown or archived facility and zone destinations', () => {
  BirdRepository.saveAll([makeBird()]);

  assert.equal(HabitatService.moveBird(1, 'zone', 'missing', 'Test', 'QA').success, false);
  const zones = JSON.parse(localStorage.getItem('ba_zones') ?? '[]');
  zones[1].isArchived = true;
  localStorage.setItem('ba_zones', JSON.stringify(zones));
  assert.equal(HabitatService.moveBird(1, 'zone', 'zone-2', 'Test', 'QA').success, false);
  assert.equal(BirdRepository.getById(1)?.zoneId, undefined);
});

test('a move clears every previous location including the legacy cage identifier', () => {
  BirdRepository.saveAll([makeBird({
    facilityId: 'facility-1',
    zoneId: 'zone-1',
    cageId: '1',
    cage_id: 1,
  })]);

  const result = HabitatService.moveBird(1, 'cage', 'cage-two', 'Réorganisation', 'QA');
  const moved = BirdRepository.getById(1);
  const movements = HabitatRepository.getAll<any>('deplacementRecord');

  assert.equal(result.success, true);
  assert.equal(moved?.cageId, 'cage-two');
  assert.equal(moved?.cage_id, undefined);
  assert.equal(moved?.zoneId, 'zone-2');
  assert.equal(movements[0].origineType, 'Cage');
  assert.equal(movements[0].origineId, '1');
});

test('starting quarantine clears the cage, persists dates and records the real origin', () => {
  BirdRepository.saveAll([makeBird({ cageId: '1', cage_id: 1, zoneId: 'zone-1' })]);

  const result = HabitatService.startQuarantine(1, 'quarantine-1', 14, 'Acquisition', '', '', 'QA');
  const bird = BirdRepository.getById(1);
  const records = HabitatRepository.getAll<any>('quarantineRecord');
  const movements = HabitatRepository.getAll<any>('deplacementRecord');

  assert.equal(result.success, true);
  assert.equal(bird?.cageId, undefined);
  assert.equal(bird?.cage_id, undefined);
  assert.equal(bird?.quarantineId, 'quarantine-1');
  assert.equal(bird?.quarantaine?.duree_recommandee, 14);
  assert.equal(records.length, 1);
  assert.equal(movements[0].origineType, 'Cage');
  assert.equal(HabitatService.startQuarantine(1, 'quarantine-1', 14, 'Doublon', '', '', 'QA').success, false);
});

test('quarantine duration is restricted to the proposed biological choices', () => {
  BirdRepository.saveAll([makeBird()]);

  assert.equal(HabitatService.startQuarantine(1, 'quarantine-1', 0, 'Test', '', '', 'QA').success, false);
  assert.equal(HabitatService.startQuarantine(1, 'quarantine-1', 10, 'Test', '', '', 'QA').success, false);
  assert.equal(HabitatRepository.getAll<any>('quarantineRecord').length, 0);
});

test('failed release keeps quarantine active and does not partially close its record', () => {
  BirdRepository.saveAll([makeBird()]);
  HabitatService.startQuarantine(1, 'quarantine-1', 7, 'Test', '', '', 'QA');
  const record = HabitatRepository.getAll<any>('quarantineRecord')[0];

  const result = HabitatService.endQuarantine(record.id, 'release', 0, '', 'missing-cage', 'QA');

  assert.equal(result.success, false);
  assert.equal(BirdRepository.getById(1)?.quarantineId, 'quarantine-1');
  assert.equal(HabitatRepository.getById<any>('quarantineRecord', record.id)?.statut, 'En cours');
});

test('prolongation requires positive whole days and completed records are immutable', () => {
  BirdRepository.saveAll([makeBird()]);
  HabitatService.startQuarantine(1, 'quarantine-1', 7, 'Test', '', '', 'QA');
  const record = HabitatRepository.getAll<any>('quarantineRecord')[0];

  assert.equal(HabitatService.endQuarantine(record.id, 'prolong', 0).success, false);
  assert.equal(HabitatService.endQuarantine(record.id, 'prolong', 3).success, true);
  assert.equal(HabitatService.endQuarantine(record.id, 'release').success, true);
  assert.equal(HabitatService.endQuarantine(record.id, 'prolong', 3).success, false);
  assert.equal(BirdRepository.getById(1)?.statut_sante, 'Sain');
});

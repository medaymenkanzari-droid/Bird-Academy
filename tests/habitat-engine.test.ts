import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import type { Canari } from '../src/types';

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
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

const { HabitatEngine } = await import('../src/business/HabitatEngine');

function seed(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeBird(id: number, location: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `BA-${id}`,
    nom: `Oiseau ${id}`,
    sexe: 'Indéterminé',
    categorie: 'test',
    race: 'test',
    mutation: 'test',
    couleur_base: 'test',
    facteur: 'test',
    couleur: 'test',
    date_naissance: '2026-01-01',
    ...location,
  };
}

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

function seedHabitat({
  facilities = [entity('facility-1')],
  zones = [entity('zone-1', { facilityId: 'facility-1', isQuarantine: false })],
  aviaries = [],
  cages = [entity('cage-sentinel', { zoneId: 'zone-1', capacite_max: 0 })],
  compartments = [],
  quarantineAreas = [],
}: {
  facilities?: unknown[];
  zones?: unknown[];
  aviaries?: unknown[];
  cages?: unknown[];
  compartments?: unknown[];
  quarantineAreas?: unknown[];
} = {}): void {
  seed('ba_habitat_migration_done', true);
  seed('ba_facilities', facilities);
  seed('ba_zones', zones);
  seed('ba_aviaries', aviaries);
  seed('ba_cages_v2', cages);
  seed('ba_compartments', compartments);
  seed('ba_quarantine_areas', quarantineAreas);
}

beforeEach(() => {
  localStorage.clear();
  seedHabitat();
});

test('calculates cage capacity, occupancy and overload across direct and compartment assignments', () => {
  seedHabitat({
    cages: [entity('1', { zoneId: 'zone-1', capacite_max: 2 })],
    compartments: [entity('compartment-1', { cageId: '1', capacite_max: 1 })],
  });
  const birds = [
    makeBird(1, { cageId: '1' }),
    makeBird(2, { compartmentId: 'compartment-1' }),
    makeBird(3, { cage_id: 1 }),
  ];

  const stats = HabitatEngine.calculateStats('cage', '1', birds);

  assert.deepEqual(stats, {
    capaciteTotale: 2,
    oiseauxPresents: 3,
    placesDisponibles: 0,
    tauxOccupation: 150,
    isOverloaded: true,
  });
});

test('does not double-count a bird that carries both modern and legacy cage identifiers', () => {
  seedHabitat({ cages: [entity('4', { zoneId: 'zone-1', capacite_max: 4 })] });
  const birds = [makeBird(1, { cageId: '4', cage_id: 4 })];

  const stats = HabitatEngine.calculateStats('cage', '4', birds);

  assert.equal(stats.oiseauxPresents, 1);
  assert.equal(stats.placesDisponibles, 3);
  assert.equal(stats.tauxOccupation, 25);
});

test('aggregates a zone without adding the capacity of cages already inside an aviary', () => {
  seedHabitat({
    aviaries: [
      entity('aviary-1', { zoneId: 'zone-1', capacite_max: 10 }),
      entity('aviary-archived', { zoneId: 'zone-1', capacite_max: 100, isArchived: true }),
    ],
    cages: [
      entity('cage-inside', { zoneId: 'zone-1', aviaryId: 'aviary-1', capacite_max: 3 }),
      entity('cage-standalone', { zoneId: 'zone-1', capacite_max: 4 }),
      entity('cage-archived', { zoneId: 'zone-1', capacite_max: 100, isArchived: true }),
    ],
  });
  const birds = [
    makeBird(1, { aviaryId: 'aviary-1' }),
    makeBird(2, { aviaryId: 'aviary-1', cageId: 'cage-inside' }),
    makeBird(3, { cageId: 'cage-standalone' }),
  ];

  const stats = HabitatEngine.calculateStats('zone', 'zone-1', birds);

  assert.equal(stats.capaciteTotale, 14);
  assert.equal(stats.oiseauxPresents, 3);
  assert.equal(stats.placesDisponibles, 11);
  assert.equal(stats.tauxOccupation, 21);
  assert.equal(stats.isOverloaded, false);
});

test('isolates occupancy between separate quarantine areas', () => {
  seedHabitat({
    quarantineAreas: [
      entity('quarantine-1', { facilityId: 'facility-1', capacite_max: 2 }),
      entity('quarantine-2', { facilityId: 'facility-1', capacite_max: 2 }),
    ],
  });
  const birds = [
    makeBird(1, { quarantineId: 'quarantine-1', statut_sante: 'Quarantaine' }),
    makeBird(2, { quarantineId: 'quarantine-2', statut_sante: 'Quarantaine' }),
    makeBird(3, { statut_sante: 'Quarantaine' }),
  ];

  const first = HabitatEngine.calculateStats('quarantineArea', 'quarantine-1', birds);
  const second = HabitatEngine.calculateStats('quarantineArea', 'quarantine-2', birds);

  assert.equal(first.oiseauxPresents, 1);
  assert.equal(second.oiseauxPresents, 1);
  assert.equal(first.placesDisponibles, 1);
  assert.equal(second.placesDisponibles, 1);
});

test('blocks a new assignment to a full cage but allows a bird already assigned to remain', () => {
  seedHabitat({ cages: [entity('cage-full', { zoneId: 'zone-1', capacite_max: 1 })] });
  const resident = makeBird(1, { cageId: 'cage-full' });
  const incoming = makeBird(2);

  const incomingErrors = HabitatEngine.validateBirdAssignment(
    incoming,
    'cage',
    'cage-full',
    [resident, incoming],
  );
  const residentErrors = HabitatEngine.validateBirdAssignment(
    resident,
    'cage',
    'cage-full',
    [resident, incoming],
  );

  assert.equal(incomingErrors.some(error => error.field === 'cageId'), true);
  assert.deepEqual(residentErrors, []);
});

test('rejects assignments to archived or unknown cages', () => {
  seedHabitat({
    cages: [entity('cage-archived', { zoneId: 'zone-1', capacite_max: 3, isArchived: true })],
  });
  const bird = makeBird(1);

  const archivedErrors = HabitatEngine.validateBirdAssignment(
    bird,
    'cage',
    'cage-archived',
    [bird],
  );
  const missingErrors = HabitatEngine.validateBirdAssignment(
    bird,
    'cage',
    'cage-missing',
    [bird],
  );

  assert.equal(archivedErrors.some(error => error.field === 'cageId'), true);
  assert.equal(missingErrors.some(error => error.field === 'cageId'), true);
});

test('clamps negative stored capacity while still reporting overload', () => {
  seedHabitat({ cages: [entity('cage-invalid', { zoneId: 'zone-1', capacite_max: -5 })] });
  const stats = HabitatEngine.calculateStats('cage', 'cage-invalid', [
    makeBird(1, { cageId: 'cage-invalid' }),
  ]);

  assert.deepEqual(stats, {
    capaciteTotale: 0,
    oiseauxPresents: 1,
    placesDisponibles: 0,
    tauxOccupation: 0,
    isOverloaded: true,
  });
  assert.equal(HabitatEngine.validateCapacity(-5).some(error => error.field === 'capacite_max'), true);
  assert.deepEqual(HabitatEngine.validateCapacity(0), []);
});

test('validates required parents and prevents a cage from referencing an aviary in another zone', () => {
  seedHabitat({
    zones: [
      entity('zone-1', { facilityId: 'facility-1', isQuarantine: false }),
      entity('zone-2', { facilityId: 'facility-1', isQuarantine: false }),
    ],
    aviaries: [entity('aviary-zone-2', { zoneId: 'zone-2', capacite_max: 10 })],
  });

  const zoneErrors = HabitatEngine.validateStructure('zone', { nom: 'Zone sans parent' });
  const cageErrors = HabitatEngine.validateStructure('cage', {
    nom: 'Cage incohérente',
    zoneId: 'zone-1',
    aviaryId: 'aviary-zone-2',
    capacite_max: 3,
  });

  assert.equal(zoneErrors.some(error => error.field === 'facilityId'), true);
  assert.equal(cageErrors.some(error => error.field === 'aviaryId'), true);
});

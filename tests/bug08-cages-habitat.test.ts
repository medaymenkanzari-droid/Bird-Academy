import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import type { Canari, Facility, Zone, HabitatCage } from '../src/types';

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
const { HabitatRepository } = await import('../src/features/habitat/repositories/HabitatRepository');
const { BirdService } = await import('../src/features/birds/services/BirdService');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { calculateCageOccupancy } = await import('../src/features/habitat/utils/cageOccupancy');

function makeBird(id: number, location: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `BA-${id}`,
    nom: `Oiseau ${id}`,
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    archived: false,
    statut_sante: 'Actif',
    ...location,
  };
}

beforeEach(() => {
  memoryStorage.clear();

  // Seed default Facility, Zone, Cages
  const fac: Facility = {
    id: 'fac_main',
    nom: 'Élevage Principal',
    statut: 'Actif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    customFields: {}
  };
  HabitatRepository.create<Facility>('facility', fac);

  const zoneA: Zone = {
    id: 'zone_a',
    facilityId: 'fac_main',
    nom: 'Zone A',
    statut: 'Actif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    customFields: {}
  };
  HabitatRepository.create<Zone>('zone', zoneA);

  const cage1: HabitatCage = {
    id: 'cage_a1',
    zoneId: 'zone_a',
    nom: 'Cage A1',
    statut: 'Actif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    capacite_max: 6,
    customFields: {}
  };
  HabitatRepository.create<HabitatCage>('cage', cage1);

  const cage2: HabitatCage = {
    id: 'cage_a2',
    zoneId: 'zone_a',
    nom: 'Cage A2',
    statut: 'Actif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    capacite_max: 4,
    customFields: {}
  };
  HabitatRepository.create<HabitatCage>('cage', cage2);
});

test('CAGE-RCA-01: Facility statistics remain consistent during navigation', () => {
  const birds: Canari[] = [
    makeBird(1, { cage_id: 1, cageId: 'cage_a1', zoneId: 'zone_a', facilityId: 'fac_main' }),
    makeBird(2, { cage_id: 1, cageId: 'cage_a1', zoneId: 'zone_a', facilityId: 'fac_main' }),
    makeBird(3, { cage_id: 2, cageId: 'cage_a2', zoneId: 'zone_a', facilityId: 'fac_main' }),
  ];

  const facilityStats = HabitatEngine.calculateStats('facility', 'fac_main', birds);
  assert.strictEqual(facilityStats.capaciteTotale, 10, 'Facility total capacity must equal sum of its cages (6+4=10)');
  assert.strictEqual(facilityStats.oiseauxPresents, 3, 'Facility present birds must equal 3');
  assert.strictEqual(facilityStats.placesDisponibles, 7, 'Facility available slots must equal 7');
  assert.strictEqual(facilityStats.tauxOccupation, 30, 'Facility occupancy rate must equal 30%');
});

test('CAGE-RCA-02: Zone statistics equal exact sum of active birds in its cages', () => {
  const birds: Canari[] = [
    makeBird(10, { cageId: 'cage_a1', zoneId: 'zone_a', facilityId: 'fac_main' }),
    makeBird(11, { cageId: 'cage_a2', zoneId: 'zone_a', facilityId: 'fac_main' }),
    makeBird(12, { cageId: 'other_cage', zoneId: 'other_zone', facilityId: 'other_fac' }),
  ];

  const zoneStats = HabitatEngine.calculateStats('zone', 'zone_a', birds);
  assert.strictEqual(zoneStats.capaciteTotale, 10);
  assert.strictEqual(zoneStats.oiseauxPresents, 2);
  assert.strictEqual(zoneStats.placesDisponibles, 8);
  assert.strictEqual(zoneStats.tauxOccupation, 20);
});

test('CAGE-RCA-03: Cage statistics equal active birds assigned to that cage', () => {
  const cageA1 = HabitatRepository.getById<HabitatCage>('cage', 'cage_a1')!;
  const birds: Canari[] = [
    makeBird(100, { cage_id: 1, cageId: 'cage_a1' }),
    makeBird(101, { cage_id: 1, cageId: 'cage_a1' }),
    makeBird(102, { cage_id: 2, cageId: 'cage_a2' }),
  ];

  const occ = calculateCageOccupancy(cageA1, birds, []);
  assert.strictEqual(occ.presentBirds.length, 2);
  assert.strictEqual(occ.capacity, 6);
  assert.strictEqual(occ.occupancyPercentage, 33);
});

test('CAGE-RCA-04: Selecting a zone displays its cages and not all zones', () => {
  const allCages = HabitatRepository.getAll<HabitatCage>('cage');
  const zoneACages = allCages.filter(c => c.zoneId === 'zone_a');

  assert.strictEqual(zoneACages.length, 2);
  assert.ok(zoneACages.some(c => c.nom === 'Cage A1'));
  assert.ok(zoneACages.some(c => c.nom === 'Cage A2'));
});

test('CAGE-RCA-05: Selecting a zone displays its birds correctly', () => {
  const bird1 = makeBird(201, { cageId: 'cage_a1', zoneId: 'zone_a', facilityId: 'fac_main' });
  const bird2 = makeBird(202, { cageId: 'cage_a2', zoneId: 'zone_a', facilityId: 'fac_main' });
  BirdRepository.saveAll([bird1, bird2]);

  const zoneBirds = BirdService.getBirds().filter(b => b.zoneId === 'zone_a');
  assert.strictEqual(zoneBirds.length, 2);
});

test('CAGE-RCA-06: New bird created in Birds module assigned to a cage appears in that cage', () => {
  const res = BirdService.create({
    bague: 'NEW-BIRD-01',
    nom: 'Charly',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-02-01',
    cageId: 'cage_a1'
  });

  assert.ok(res.success);
  assert.strictEqual(res.data?.cageId, 'cage_a1');
  assert.strictEqual(res.data?.zoneId, 'zone_a');
  assert.strictEqual(res.data?.facilityId, 'fac_main');

  const cageA1 = HabitatRepository.getById<HabitatCage>('cage', 'cage_a1')!;
  const occ = calculateCageOccupancy(cageA1, BirdService.getBirds(), []);
  assert.strictEqual(occ.presentBirds.length, 1);
  assert.strictEqual(occ.presentBirds[0].nom, 'Charly');
});

test('CAGE-RCA-07: Creating a cage in HabitatRepository does not crash', () => {
  const newCage = HabitatRepository.create<HabitatCage>('cage', {
    zoneId: 'zone_a',
    nom: 'Cage A3',
    capacite_max: 8,
    statut: 'Actif'
  });

  assert.ok(newCage.id);
  assert.strictEqual(newCage.nom, 'Cage A3');
  assert.strictEqual(newCage.zoneId, 'zone_a');
});

test('CAGE-RCA-08: Newly created cage persists in storage', () => {
  HabitatRepository.create<HabitatCage>('cage', {
    id: 'cage_persisted_1',
    zoneId: 'zone_a',
    nom: 'Cage Persistante',
    capacite_max: 5,
    statut: 'Actif'
  });

  const reloaded = HabitatRepository.getAll<HabitatCage>('cage');
  const found = reloaded.find(c => c.nom === 'Cage Persistante');
  assert.ok(found);
  assert.strictEqual(found.zoneId, 'zone_a');
});

test('CAGE-RCA-09: Mobile structure layout data integrity', () => {
  const cages = HabitatRepository.getAll<HabitatCage>('cage');
  cages.forEach(c => {
    assert.ok(c.id);
    assert.ok(c.nom);
    assert.ok(typeof c.capacite_max === 'number');
  });
});

test('CAGE-RCA-10: Hierarchy Facility -> Zone -> Cage -> Bird remains consistent', () => {
  const bird = makeBird(300, { cage_id: 1, cageId: 'cage_a1' });
  BirdService.resolveBirdLocation(bird);

  assert.strictEqual(bird.cageId, 'cage_a1');
  assert.strictEqual(bird.zoneId, 'zone_a');
  assert.strictEqual(bird.facilityId, 'fac_main');
});

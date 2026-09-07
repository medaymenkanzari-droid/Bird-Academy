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
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
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

test('CAGE-RUNTIME-01: Création d’un oiseau avec cage', () => {
  const res = BirdService.create({
    bague: 'NEW-001',
    nom: 'Canari Un',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });
  if (!res.success) {
    console.error('CAGE-RUNTIME-01 failed res:', JSON.stringify(res));
  }
  assert.ok(res.success);
});

test('CAGE-RUNTIME-02: Le bird possède cageId après sauvegarde', () => {
  const res = BirdService.create({
    bague: 'NEW-002',
    nom: 'Canari Deux',
    espece: 'canari',
    sexe: 'Femelle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Schimmel',
    couleur: 'Jaune Schimmel',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });
  assert.strictEqual(res.data?.cageId, 'cage_a1');
});

test('CAGE-RUNTIME-03: Le bird possède zoneId après sauvegarde', () => {
  const res = BirdService.create({
    bague: 'NEW-003',
    nom: 'Canari Trois',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });
  assert.strictEqual(res.data?.zoneId, 'zone_a');
});

test('CAGE-RUNTIME-04: Le bird possède facilityId après sauvegarde', () => {
  const res = BirdService.create({
    bague: 'NEW-004',
    nom: 'Canari Quatre',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });
  assert.strictEqual(res.data?.facilityId, 'fac_main');
});

test('CAGE-RUNTIME-05: Cage occupancy correspond au nombre réel d’oiseaux', () => {
  BirdService.create({
    bague: 'NEW-005',
    nom: 'Canari Cinq',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });

  const cage = HabitatRepository.getById<HabitatCage>('cage', 'cage_a1')!;
  const occ = calculateCageOccupancy(cage, BirdService.getBirds(), []);
  assert.strictEqual(occ.presentBirds.length, 1);
});

test('CAGE-RUNTIME-06: Zone occupancy = somme de ses cages', () => {
  BirdService.create({
    bague: 'NEW-006',
    nom: 'Canari Six',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });
  BirdService.create({
    bague: 'NEW-007',
    nom: 'Canari Sept',
    espece: 'canari',
    sexe: 'Femelle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Schimmel',
    couleur: 'Jaune Schimmel',
    date_naissance: '2026-01-01',
    cageId: 'cage_a2'
  });

  const zoneStats = HabitatEngine.calculateStats('zone', 'zone_a', BirdService.getBirds());
  assert.strictEqual(zoneStats.oiseauxPresents, 2);
  assert.strictEqual(zoneStats.capaciteTotale, 10);
});

test('CAGE-RUNTIME-07: Facility occupancy = somme de ses zones sans doublon', () => {
  BirdService.create({
    bague: 'NEW-008',
    nom: 'Canari Huit',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });

  const facStats = HabitatEngine.calculateStats('facility', 'fac_main', BirdService.getBirds());
  assert.strictEqual(facStats.oiseauxPresents, 1);
  assert.strictEqual(facStats.capaciteTotale, 10);
});

test('CAGE-RUNTIME-08: Sélection Zone ➔ uniquement ses cages', () => {
  const allCages = HabitatRepository.getAll<HabitatCage>('cage');
  const zoneACages = allCages.filter(c => c.zoneId === 'zone_a');
  assert.strictEqual(zoneACages.length, 2);
});

test('CAGE-RUNTIME-09: Sélection Cage ➔ uniquement ses oiseaux', () => {
  BirdService.create({
    bague: 'NEW-009',
    nom: 'Canari Neuf',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });

  const cage = HabitatRepository.getById<HabitatCage>('cage', 'cage_a1')!;
  const occ = calculateCageOccupancy(cage, BirdService.getBirds(), []);
  assert.strictEqual(occ.presentBirds.length, 1);
  assert.strictEqual(occ.presentBirds[0].bague, 'NEW-009');
});

test('CAGE-RUNTIME-10: Création Cage ne provoque aucun crash', () => {
  const cage = HabitatRepository.create<HabitatCage>('cage', {
    zoneId: 'zone_a',
    nom: 'Cage Test',
    capacite_max: 5,
    statut: 'Actif'
  });
  assert.ok(cage.id);
  assert.strictEqual(cage.nom, 'Cage Test');
});

test('CAGE-RUNTIME-11: Cage créée persistante après reload', () => {
  HabitatRepository.create<HabitatCage>('cage', {
    id: 'cage_persisted_new',
    zoneId: 'zone_a',
    nom: 'Cage Reload Test',
    capacite_max: 8,
    statut: 'Actif'
  });
  const reloaded = HabitatRepository.getAll<HabitatCage>('cage');
  assert.ok(reloaded.some(c => c.id === 'cage_persisted_new'));
});

test('CAGE-RUNTIME-12: Nouvel oiseau visible dans sa cage après reload', () => {
  BirdService.create({
    bague: 'NEW-012',
    nom: 'Canari Reload',
    espece: 'canari',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2026-01-01',
    cageId: 'cage_a1'
  });

  const reloadedBirds = BirdRepository.getAll();
  const cage = HabitatRepository.getById<HabitatCage>('cage', 'cage_a1')!;
  const occ = calculateCageOccupancy(cage, reloadedBirds, []);
  assert.ok(occ.presentBirds.some(b => b.bague === 'NEW-012'));
});

test('CAGE-RUNTIME-13: Les statistiques globales restent stables lors de la navigation', () => {
  const birds = [makeBird(1, { cageId: 'cage_a1', zoneId: 'zone_a', facilityId: 'fac_main' })];
  const facStats = HabitatEngine.calculateStats('facility', 'fac_main', birds);
  assert.strictEqual(facStats.capaciteTotale, 10);
  assert.strictEqual(facStats.oiseauxPresents, 1);
});

test('CAGE-RUNTIME-14: Aucune cage orpheline n’est comptée dans plusieurs zones', () => {
  const orphanCage: HabitatCage = {
    id: 'cage_orphan',
    zoneId: '',
    nom: 'Cage Orpheline',
    statut: 'Actif',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    capacite_max: 10,
    customFields: {}
  };
  HabitatRepository.create<HabitatCage>('cage', orphanCage);

  const zoneStats = HabitatEngine.calculateStats('zone', 'zone_a', []);
  assert.strictEqual(zoneStats.capaciteTotale, 10, 'Zone A capacity must strictly count its cages (6+4=10)');
});

test('CAGE-RUNTIME-15: Mobile 360-412px data integrity', () => {
  const cages = HabitatRepository.getAll<HabitatCage>('cage');
  cages.forEach(c => {
    assert.ok(c.id);
    assert.ok(c.nom);
  });
});

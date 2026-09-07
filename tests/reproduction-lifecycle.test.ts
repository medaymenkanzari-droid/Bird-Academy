import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { BreedingPair } from '../src/features/reproduction/types';

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

const { ClutchService } = await import('../src/features/reproduction/clutches/services/ClutchService');
const { EggService } = await import('../src/features/reproduction/eggs/services/EggService');
const { IncubationService } = await import('../src/features/reproduction/incubation/services/IncubationService');
const { HatchingService } = await import('../src/features/reproduction/hatching/services/HatchingService');

const today = new Date().toISOString().slice(0, 10);

function dateOffset(days: number): string {
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function seedPair(overrides: Partial<BreedingPair> = {}): BreedingPair {
  localStorage.clear();
  const pair: BreedingPair = {
    id: 'bp-test',
    maleId: 1,
    femaleId: 2,
    name: 'Couple test',
    dateCreated: dateOffset(-30),
    status: 'active',
    archived: false,
    statistics: {
      pairId: 'bp-test',
      reproductionsCount: 0,
      totalEggs: 0,
      fertileEggs: 0,
      hatchedEggs: 0,
      weanedChicks: 0,
      successRate: 0,
    },
    ...overrides,
  };
  localStorage.setItem('ba_breeding_pairs', JSON.stringify([pair]));
  return pair;
}

test('opens a clutch only for an existing active pair and a valid date', () => {
  seedPair();
  assert.throws(() => ClutchService.createClutch('missing', today), /couple doit exister/);
  assert.throws(() => ClutchService.createClutch('bp-test', dateOffset(1)), /futur/);

  const clutch = ClutchService.createClutch('bp-test', dateOffset(-3));
  assert.equal(clutch.status, 'active');
  assert.throws(() => ClutchService.createClutch('bp-test', today), /déjà une ponte active/);
});

test('rejects clutches for separated or archived pairs', () => {
  seedPair({ status: 'separated' });
  assert.throws(() => ClutchService.createClutch('bp-test', today), /couple doit exister et être actif/);

  seedPair({ archived: true });
  assert.throws(() => ClutchService.createClutch('bp-test', today), /couple doit exister et être actif/);
});

test('enforces chronological clutch closing dates and clears the end date on reactivation', () => {
  seedPair();
  const clutch = ClutchService.createClutch('bp-test', dateOffset(-3));

  assert.throws(
    () => ClutchService.updateClutchStatus(clutch.id, 'completed', dateOffset(-4)),
    /date de fin/,
  );
  const completed = ClutchService.updateClutchStatus(clutch.id, 'completed', dateOffset(-1));
  assert.equal(completed.endDate, dateOffset(-1));
  const activeAgain = ClutchService.updateClutchStatus(clutch.id, 'active');
  assert.equal(activeAgain.endDate, undefined);
});

test('adds eggs only to an active clutch with coherent date and weight', () => {
  seedPair();
  const clutch = ClutchService.createClutch('bp-test', dateOffset(-3));

  assert.throws(() => EggService.addEgg('missing', today), /ponte doit exister/);
  assert.throws(() => EggService.addEgg(clutch.id, dateOffset(-4)), /postérieure/);
  assert.throws(() => EggService.addEgg(clutch.id, today, 'Nid', 0), /strictement positif/);

  const egg = EggService.addEgg(clutch.id, dateOffset(-2), 'Nid 1', 1.8);
  assert.equal(egg.number, 1);
  assert.equal(ClutchService.getClutchById(clutch.id)?.eggCount, 1);
});

test('protects terminal egg states from biologically impossible changes', () => {
  seedPair();
  const clutch = ClutchService.createClutch('bp-test', dateOffset(-3));
  const egg = EggService.addEgg(clutch.id, dateOffset(-2));
  EggService.updateEggStatus(egg.id, 'Éclos');

  assert.throws(() => EggService.updateEggStatus(egg.id, 'Pondu'), /Transition biologique impossible/);
  assert.equal(EggService.getEggById(egg.id)?.status, 'Éclos');
});

test('starts incubation only when a coherent active clutch contains eggs', () => {
  seedPair();
  const clutch = ClutchService.createClutch('bp-test', dateOffset(-3));

  assert.throws(() => IncubationService.startIncubation(clutch.id, dateOffset(-2)), /aucun œuf/);
  const egg = EggService.addEgg(clutch.id, dateOffset(-2));
  assert.throws(() => IncubationService.startIncubation(clutch.id, dateOffset(-4)), /postérieure/);
  assert.throws(() => IncubationService.startIncubation(clutch.id, today, 'Naturelle', 0), /1 et 90/);

  const incubation = IncubationService.startIncubation(clutch.id, dateOffset(-1));
  assert.equal(EggService.getEggById(egg.id)?.status, 'En incubation');
  assert.equal(IncubationService.startIncubation(clutch.id, today).id, incubation.id);
  assert.throws(
    () => IncubationService.addIncubationEvent('missing', 'manual_note', 'Note', 'Test'),
    /incubation introuvable/,
  );
});

test('records at most one hatching result per egg and validates its chronology', () => {
  seedPair();
  const clutch = ClutchService.createClutch('bp-test', dateOffset(-3));
  const egg = EggService.addEgg(clutch.id, dateOffset(-2));

  assert.equal(HatchingService.failHatching(egg.id, dateOffset(-3), 'Test').success, false);
  assert.equal(HatchingService.failHatching(egg.id, today, 'Arrêt').success, true);
  assert.equal(HatchingService.failHatching(egg.id, today, 'Doublon').success, false);
});

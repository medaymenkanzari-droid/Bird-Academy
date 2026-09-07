import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import type { Canari, Sante } from '../src/types';

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
const { HealthService } = await import('../src/features/health/services/HealthService');
const { TRANSLATIONS } = await import('../src/utils/translations');

const today = new Date().toISOString().slice(0, 10);

function offsetDate(days: number): string {
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeBird(overrides: Partial<Canari> = {}): Canari {
  return {
    id: 1,
    bague: 'BA-HEALTH-1',
    nom: 'Patient',
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

function record(overrides: Partial<Omit<Sante, 'id'>> = {}): Omit<Sante, 'id'> {
  return {
    canari_id: 1,
    date: today,
    traitement: 'Contrôle annuel',
    categorie: 'Visite Vétérinaire',
    description: 'RAS',
    statut: 'Terminé',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  BirdRepository.saveAll([makeBird()]);
});

test('rejects medical records for missing or archived birds', () => {
  assert.equal(HealthService.addRecord(record({ canari_id: 999 })).success, false);
  BirdRepository.saveAll([makeBird({ archived: true })]);
  assert.equal(HealthService.addRecord(record()).success, false);
  assert.equal(HealthService.getRecords().length, 0);
});

test('rejects medical records for deceased or sold birds', () => {
  BirdRepository.saveAll([makeBird({ statut_sante: 'Décédé' })]);
  assert.equal(HealthService.addRecord(record()).success, false);

  BirdRepository.saveAll([makeBird({ statut_sante: 'Vendu' })]);
  assert.equal(HealthService.addRecord(record()).success, false);
  assert.equal(HealthService.getRecords().length, 0);
});

test('rejects blank treatment, invalid category and impossible date', () => {
  assert.equal(HealthService.addRecord(record({ traitement: '   ' })).success, false);
  assert.equal(HealthService.addRecord(record({ categorie: 'Invalide' as Sante['categorie'] })).success, false);
  assert.equal(HealthService.addRecord(record({ date: '2026-02-31' })).success, false);
  assert.equal(HealthService.getRecords().length, 0);
});

test('rejects an invalid status and care before birth or acquisition', () => {
  assert.equal(HealthService.addRecord(record({ statut: 'Invalide' as Sante['statut'] })).success, false);
  assert.equal(HealthService.addRecord(record({ date: '2022-12-31' })).success, false);
  assert.equal(HealthService.getRecords().length, 0);
});

test('allows future planning but never a future record already marked completed', () => {
  assert.equal(HealthService.addRecord(record({ date: offsetDate(2), statut: 'Terminé' })).success, false);
  const planned = HealthService.addRecord(record({ date: offsetDate(2), statut: 'En attente' }));

  assert.equal(planned.success, true);
  assert.equal(planned.data?.statut, 'En attente');
});

test('normalizes text and defaults a missing status to completed', () => {
  const result = HealthService.addRecord(record({
    traitement: '  Vitamines  ',
    description: '  Cure courte  ',
    statut: undefined,
  }));

  assert.equal(result.success, true);
  assert.equal(result.data?.traitement, 'Vitamines');
  assert.equal(result.data?.description, 'Cure courte');
  assert.equal(result.data?.statut, 'Terminé');
});

test('does not complete a future appointment before its scheduled date', () => {
  const planned = HealthService.addRecord(record({ date: offsetDate(2), statut: 'En attente' })).data!;

  assert.equal(HealthService.completeRecord(planned.id).success, false);
  assert.equal(HealthService.getRecords()[0].statut, 'En attente');
});

test('completes due care and reports missing update or deletion targets', () => {
  const due = HealthService.addRecord(record({ date: offsetDate(-1), statut: 'En attente' })).data!;

  assert.equal(HealthService.completeRecord(due.id).success, true);
  assert.equal(HealthService.getRecords()[0].statut, 'Terminé');
  assert.equal(HealthService.completeRecord(999).success, false);
  assert.equal(HealthService.deleteRecord(999).success, false);
  assert.equal(HealthService.deleteRecord(due.id).success, true);
  assert.equal(HealthService.getRecords().length, 0);
});

test('health screens remain translated in all five supported languages', () => {
  const requiredKeys = [
    'santeTitle',
    'registerSoin',
    'noEligibleHealthBird',
    'treatmentRequired',
    'protocolsTitle',
    'validateSoin',
  ];

  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    for (const key of requiredKeys) {
      const value = TRANSLATIONS[language][key];
      assert.equal(typeof value, 'string');
      assert.ok(value.trim().length > 0);
      assert.notEqual(value, key);
    }
  }
});

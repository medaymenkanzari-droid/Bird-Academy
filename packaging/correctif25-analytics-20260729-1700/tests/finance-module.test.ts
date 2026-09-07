import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import type { Canari, Depense } from '../src/types';

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
const { FinanceService } = await import('../src/features/finance/services/FinanceService');
const { HabitatEngine } = await import('../src/business/HabitatEngine');
const { FinanceEngine } = await import('../src/business/FinanceEngine');
const { TRANSLATIONS } = await import('../src/utils/translations');

const today = new Date().toISOString().slice(0, 10);

function offsetDate(days: number): string {
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeBird(id = 1, overrides: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `BA-FIN-${id}`,
    nom: `Oiseau ${id}`,
    sexe: id === 2 ? 'Femelle' : 'Mâle',
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

beforeEach(() => {
  localStorage.clear();
  BirdRepository.saveAll([makeBird(1), makeBird(2)]);
});

test('rejects invalid expense amounts, dates, categories and descriptions', () => {
  assert.equal(FinanceService.addExpense(today, Infinity, 'Autre', 'Test').success, false);
  assert.equal(FinanceService.addExpense(today, 10, 'Invalide' as Depense['categorie'], 'Test').success, false);
  assert.equal(FinanceService.addExpense('2026-02-31', 10, 'Autre', 'Test').success, false);
  assert.equal(FinanceService.addExpense(offsetDate(1), 10, 'Autre', 'Test').success, false);
  assert.equal(FinanceService.addExpense(today, 10, 'Autre', '   ').success, false);
  assert.equal(FinanceService.addExpense(today, 1.0001, 'Autre', 'Précision invalide').success, false);
  assert.equal(FinanceService.getExpenses().length, 0);
});

test('records a normalized positive expense', () => {
  const result = FinanceService.addExpense(today, 12.5, 'Alimentation', '  Graines  ');

  assert.equal(result.success, true);
  assert.equal(result.data?.description, 'Graines');
  assert.equal(result.data?.montant, 12.5);
});

test('currency amounts are limited to positive millimes', () => {
  assert.equal(FinanceEngine.isValidCurrencyAmount(0.001), true);
  assert.equal(FinanceEngine.isValidCurrencyAmount(12.345), true);
  assert.equal(FinanceEngine.isValidCurrencyAmount(12.3456), false);
  assert.equal(FinanceEngine.isValidCurrencyAmount(Number.MAX_VALUE), false);
});

test('rejects a sale for a missing, archived or quarantined bird', () => {
  assert.equal(FinanceService.addSale(999, 50, today, 'Client', '').success, false);
  BirdRepository.update(makeBird(1, { archived: true }));
  assert.equal(FinanceService.addSale(1, 50, today, 'Client', '').success, false);
  BirdRepository.update(makeBird(1, { quarantineId: 'q-1', statut_sante: 'Quarantaine' }));
  assert.equal(FinanceService.addSale(1, 50, today, 'Client', '').success, false);
  BirdRepository.update(makeBird(1, { statut_sante: 'Décédé' }));
  assert.equal(FinanceService.addSale(1, 50, today, 'Client', '').success, false);
  BirdRepository.update(makeBird(1, { statut_sante: 'Vendu' }));
  assert.equal(FinanceService.addSale(1, 50, today, 'Client', '').success, false);
  assert.equal(FinanceService.getSales().length, 0);
});

test('rejects invalid sale price, future date and blank buyer', () => {
  assert.equal(FinanceService.addSale(1, Number.NaN, today, 'Client', '').success, false);
  assert.equal(FinanceService.addSale(1, 50, offsetDate(1), 'Client', '').success, false);
  assert.equal(FinanceService.addSale(1, 50, today, '   ', '').success, false);
  assert.equal(FinanceService.addSale(1, 1.0001, today, 'Client', '').success, false);
  assert.equal(FinanceService.getSales().length, 0);
});

test('blocks sale while the bird belongs to an active pair', () => {
  localStorage.setItem('ba_breeding_pairs', JSON.stringify([{
    id: 'bp-active',
    maleId: 1,
    femaleId: 2,
    dateCreated: today,
    status: 'active',
    archived: false,
    statistics: { pairId: 'bp-active', reproductionsCount: 0, totalEggs: 0, fertileEggs: 0, hatchedEggs: 0, weanedChicks: 0, successRate: 0 },
  }]));

  const result = FinanceService.addSale(1, 50, today, 'Client', 'Cession');

  assert.equal(FinanceService.isBirdEligibleForSale(1), false);
  assert.equal(FinanceService.isBirdEligibleForSale(2), false);
  assert.equal(result.success, false);
  assert.equal(FinanceService.getSales().length, 0);
  assert.equal(BirdRepository.getById(1)?.archived, false);
});

test('a valid sale is unique and archives the bird without losing its history', () => {
  const result = FinanceService.addSale(1, 50, today, '  Client  ', '  Cession club  ');

  assert.equal(result.success, true);
  assert.equal(result.data?.acheteur, 'Client');
  assert.equal(result.data?.description, 'Cession club');
  assert.equal(BirdRepository.getById(1)?.archived, true);
  assert.equal(BirdRepository.getAll().some(bird => bird.id === 1), false);
  assert.equal(BirdRepository.getAll(true).some(bird => bird.id === 1), true);
  assert.equal(FinanceService.addSale(1, 60, today, 'Autre', '').success, false);
  assert.equal(FinanceService.getSales().length, 1);
});

test('archived and deceased birds do not consume habitat capacity', () => {
  localStorage.setItem('ba_habitat_migration_done', 'true');
  localStorage.setItem('ba_facilities', '[]');
  localStorage.setItem('ba_zones', '[]');
  localStorage.setItem('ba_aviaries', '[]');
  localStorage.setItem('ba_compartments', '[]');
  localStorage.setItem('ba_quarantine_areas', '[]');
  localStorage.setItem('ba_cages_v2', JSON.stringify([{
    id: '1', zoneId: 'zone-1', nom: 'Cage 1', statut: 'Actif', createdAt: today,
    updatedAt: today, isArchived: false, capacite_max: 2, customFields: {},
  }]));
  const birds = [
    makeBird(1, { cageId: '1', archived: true }),
    makeBird(2, { cageId: '1', statut_sante: 'Décédé' }),
    makeBird(3, { cageId: '1' }),
  ];

  assert.equal(HabitatEngine.calculateStats('cage', '1', birds).oiseauxPresents, 1);
});

test('sale form messages remain translated in all five supported languages', () => {
  const requiredKeys = [
    'selectSoldBirdRequired',
    'salePriceRequired',
    'buyerRequired',
    'deletedBirdLabel',
    'soldOnLabel',
    'buyerPlaceholder',
    'saleDescriptionPlaceholder',
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

test('expense screens remain translated in all five supported languages', () => {
  const keys = [
    'depensesTitle',
    'depensesSub',
    'exportCSV',
    'addExpenseButton',
    'totalChargesCumulated',
    'operationsCount',
    'noExpenseLogged',
    'expenseRegister',
    'registerExpense',
    'amountDT',
    'amountRequired',
    'descriptionRequired',
    'detailMotif',
    'detailPlaceholder',
    'saveExpense',
    'accountingTitle',
    'accountingDesc'
  ] as const;

  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    for (const key of keys) {
      assert.ok(TRANSLATIONS[language][key]?.trim(), `${language}.${key} must be translated`);
    }
  }
});

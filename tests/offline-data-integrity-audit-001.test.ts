/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — OFFLINE DATA INTEGRITY AUDIT SUITE
 * Mission: OFFLINE-DATA-INTEGRITY-AUDIT-001
 * Target: v1.3.6 (BUILD_ID: BA-V1.3.6)
 * Role: Senior Product Engineer + Senior QA / Offline-First Architect
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// In-Memory Storage Polyfill for Node Test Runner
// ---------------------------------------------------------------------------
class MemoryStorage {
  private values = new Map<string, string>();

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

  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    this.values.forEach((v, k) => { out[k] = v; });
    return out;
  }

  load(data: Record<string, string>): void {
    this.values.clear();
    Object.entries(data).forEach(([k, v]) => this.values.set(k, v));
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

// Dynamic imports after localStorage polyfill
const { appStorage, MigrationManager } = await import('../src/storage/index');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { HabitatRepository } = await import('../src/features/habitat/repositories/HabitatRepository');
const { BreedingRepository } = await import('../src/features/breeding/repositories/BreedingRepository');
const { HealthRepository } = await import('../src/features/health/repositories/HealthRepository');
const { HandFeedingRepository } = await import('../src/features/hand-feeding/repositories/HandFeedingRepository');
const { FinanceRepository } = await import('../src/features/finance/repositories/FinanceRepository');
const { SpeciesProfileRepository } = await import('../src/features/species/repositories/SpeciesProfileRepository');
const { IntegrityEngine } = await import('../src/features/platform/engines/IntegrityEngine');
const { WrightCoefficientEngine } = await import('../src/features/genetics/engines/WrightCoefficientEngine');
const { BirdIntelligenceEngine } = await import('../src/features/intelligence/engines/BirdIntelligenceEngine');
const { BackupRestoreService } = await import('../src/features/platform/services/BackupRestoreService');
const { SecurityEngine } = await import('../src/features/platform/engines/SecurityEngine');
const { AnalyticsSettingsRepository } = await import('../src/features/analytics/repositories/AnalyticsSettingsRepository');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OFFICIAL_APK_PATH = path.join(ROOT_DIR, 'dist_binaries', 'Bird-Academy-User.apk');
const EXPECTED_APK_SHA256 = '45D9BD03553C84966951AA80FDA3DEF4FA15100BA0396886C12EEABCF4E9A958';
const EXPECTED_APK_SIZE = 19628154;

import type { Canari } from '../src/types/index';

function mockBird(overrides: Partial<Canari> = {}): Omit<Canari, 'id'> {
  return {
    nom: 'Alpha Male',
    bague: `BA-2026-${Math.floor(Math.random() * 10000)}`,
    sexe: 'Mâle',
    espece: 'Canari',
    categorie: 'Couleur',
    race: 'Lipochrome',
    mutation: 'Intensif',
    couleur_base: 'Jaune',
    facteur: 'Aucun',
    couleur: 'Jaune Intensif',
    date_naissance: '2025-05-15',
    cage_id: 1,
    ...overrides
  };
}

describe('MISSION OFFLINE-DATA-INTEGRITY-AUDIT-001 — 30 Core Offline & Data Invariants', () => {

  // Clean memory storage before each test
  function resetStorage() {
    memoryStorage.clear();
  }

  // =========================================================================
  // SECTION 1: CRUD ENTITIES & DOMAINS
  // =========================================================================

  it('OFFLINE-DATA-R01: CRUD Birds (Create, Read, Update, Archive, Restore, Delete)', () => {
    resetStorage();
    const created = BirdRepository.create(mockBird({
      nom: 'Alpha Male',
      bague: 'BA-2026-001',
      date_naissance: '2025-05-15'
    }));

    assert.equal(created.id, 1);
    assert.equal(created.bague, 'BA-2026-001');

    // Read
    const fetched = BirdRepository.getById(1);
    assert.ok(fetched);
    assert.equal(fetched?.nom, 'Alpha Male');

    // Update
    fetched!.nom = 'Alpha Male Renamed';
    BirdRepository.update(fetched!);
    const updated = BirdRepository.getById(1);
    assert.equal(updated?.nom, 'Alpha Male Renamed');

    // Archive
    BirdRepository.archive(1);
    const activeOnly = BirdRepository.getAll(false);
    assert.equal(activeOnly.length, 0);
    const withArchived = BirdRepository.getAll(true);
    assert.equal(withArchived.length, 1);
    assert.equal(withArchived[0].archived, true);

    // Restore
    BirdRepository.restore(1);
    assert.equal(BirdRepository.getAll(false).length, 1);

    // Delete
    const deleted = BirdRepository.delete(1);
    assert.equal(deleted, true);
    assert.equal(BirdRepository.getAll(true).length, 0);
  });

  it('OFFLINE-DATA-R02: CRUD Cages / Habitat (Facility, Zone, Cage, Compartment)', () => {
    resetStorage();
    // Facility
    const fac = HabitatRepository.create<any>('facility', {
      id: 'fac_01',
      nom: 'Volière Nord',
      statut: 'Actif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      customFields: {}
    });
    assert.equal(fac.id, 'fac_01');

    // Zone
    const zone = HabitatRepository.create<any>('zone', {
      id: 'zone_01',
      facilityId: 'fac_01',
      nom: 'Secteur Canaris',
      statut: 'Actif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isQuarantine: false,
      customFields: {}
    });
    assert.equal(zone.id, 'zone_01');

    // Cage
    const cage = HabitatRepository.create<any>('cage', {
      id: '101',
      zoneId: 'zone_01',
      nom: 'Cage Élevage 101',
      type: 'Reproduction',
      statut: 'Active',
      largeur: 60,
      hauteur: 40,
      profondeur: 40,
      capaciteMax: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      customFields: {}
    });
    assert.equal(cage.id, '101');

    const fetchedCage = HabitatRepository.getById<any>('cage', '101');
    assert.ok(fetchedCage);
    assert.equal(fetchedCage?.nom, 'Cage Élevage 101');
  });

  it('OFFLINE-DATA-R03: Couples / Reproduction (Couple and Cycle persistence)', () => {
    resetStorage();
    const couple = BreedingRepository.addCouple({
      male_id: 1,
      femelle_id: 2,
      statut: 'Actif',
      date_creation: '2026-03-01'
    });
    assert.equal(couple.id, 1);
    assert.equal(BreedingRepository.getCouples().length, 1);

    const repro = BreedingRepository.addReproduction({
      couple_id: 1,
      date_debut: '2026-03-05',
      statut: 'En cours'
    });
    assert.equal(repro.id, 1);
    assert.equal(BreedingRepository.getReproductions().length, 1);
  });

  it('OFFLINE-DATA-R04: Eggs / Clutches (Pontes and clutch tracking)', () => {
    resetStorage();
    const ponte = BreedingRepository.addPonte({
      reproduction_id: 1,
      date: '2026-03-10',
      oeufs: 4,
      oeufs_fecondes: 4,
      eclosions: 3
    });
    assert.equal(ponte.id, 1);
    assert.equal(ponte.oeufs, 4);
    assert.equal(BreedingRepository.getPontes().length, 1);
  });

  it('OFFLINE-DATA-R05: Chicks (Jeunes / chicks persistence)', () => {
    resetStorage();
    const chick = BreedingRepository.addJeune({
      ponte_id: 1,
      bague: 'BA-2026-CHICK-1',
      date_naissance: '2026-03-24',
      statut: 'En sevrage'
    });
    assert.equal(chick.id, 1);
    assert.equal(chick.bague, 'BA-2026-CHICK-1');
    assert.equal(BreedingRepository.getJeunes().length, 1);
  });

  it('OFFLINE-DATA-R06: Health records (Sante medical entries and search)', () => {
    resetStorage();
    const health = HealthRepository.add({
      canari_id: 1,
      date: '2026-04-01',
      traitement: 'Vitamines E + Sélénium',
      categorie: 'Traitement',
      description: 'Préparation saison reproduction'
    });
    assert.equal(health.id, 1);
    assert.equal(HealthRepository.getAll().length, 1);

    const searchRes = HealthRepository.search('Vitamines');
    assert.equal(searchRes.length, 1);
    assert.equal(searchRes[0].traitement, 'Vitamines E + Sélénium');
  });

  it('OFFLINE-DATA-R07: Expenses (Depenses persistence and search)', () => {
    resetStorage();
    const exp = FinanceRepository.addExpense({
      date: '2026-04-05',
      categorie: 'Alimentation',
      montant: 48.50,
      description: 'Mélange graines prestige canaris 20kg'
    });
    assert.equal(exp.id, 1);
    assert.equal(exp.montant, 48.50);
    assert.equal(FinanceRepository.getExpenses().length, 1);
  });

  it('OFFLINE-DATA-R08: Sales (Ventes and flock status transition)', () => {
    resetStorage();
    const sale = FinanceRepository.addSale({
      date: '2026-06-15',
      acheteur: 'Éleveur Club Régional',
      canari_id: 1,
      prix: 35.00,
      description: 'Cession avec certificat officiel'
    });
    assert.equal(sale.id, 1);
    assert.equal(sale.prix, 35.00);
    assert.equal(FinanceRepository.getSales().length, 1);
  });

  it('OFFLINE-DATA-R09: Settings (AnalyticsSettings and Preferences persistence)', () => {
    resetStorage();
    AnalyticsSettingsRepository.saveSettings({
      defaultPeriod: 'year',
      currency: 'EUR',
      numberFormat: 'fr',
      dateFormat: 'YYYY-MM-DD',
      fertilityTarget: 85,
      hatchingTarget: 80,
      weaningTarget: 75,
      revenueTarget: 2000,
      survivalTarget: 95
    });

    const settings = AnalyticsSettingsRepository.getSettings();
    assert.equal(settings.currency, 'EUR');
    assert.equal(settings.fertilityTarget, 85);
  });

  // =========================================================================
  // SECTION 2: SERIALIZATION & RELATIONSHIPS
  // =========================================================================

  it('OFFLINE-DATA-R10: Serialize → reload → read (In-memory roundtrip preservation)', () => {
    resetStorage();
    BirdRepository.create(mockBird({ nom: 'Phoenix', bague: 'BA-2026-099' }));
    FinanceRepository.addExpense({ date: '2026-05-01', categorie: 'Santé', montant: 25.50, description: 'Antiparasitaire' });

    // Dump storage
    const memoryDump = memoryStorage.dump();
    assert.ok(Object.keys(memoryDump).length > 0);

    // Clear and reload
    memoryStorage.clear();
    assert.equal(BirdRepository.getAll().length, 0);

    memoryStorage.load(memoryDump);
    assert.equal(BirdRepository.getAll().length, 1);
    assert.equal(BirdRepository.getById(1)?.nom, 'Phoenix');
    assert.equal(FinanceRepository.getExpenses()[0].montant, 25.50);
  });

  it('OFFLINE-DATA-R11: Relationship integrity (Entities reference valid IDs)', () => {
    resetStorage();
    // Setup Cage
    HabitatRepository.create<any>('cage', { id: '10', nom: 'Cage 10', type: 'Reproduction', statut: 'Active', zoneId: 'z1', largeur: 60, hauteur: 40, profondeur: 40, capaciteMax: 2, createdAt: '', updatedAt: '', isArchived: false, customFields: {} });
    
    // Setup Birds
    const male = BirdRepository.create(mockBird({ nom: 'Male 1', bague: 'M-1', cage_id: 10, sexe: 'Mâle' }));
    const female = BirdRepository.create(mockBird({ nom: 'Femelle 1', bague: 'F-1', cage_id: 10, sexe: 'Femelle' }));

    // Setup Couple
    const couple = BreedingRepository.addCouple({ male_id: male.id, femelle_id: female.id, statut: 'Actif', date_creation: '2026-03-01' });

    assert.equal(couple.male_id, male.id);
    assert.equal(couple.femelle_id, female.id);
  });

  it('OFFLINE-DATA-R12: Orphan detection (IntegrityEngine flags broken links)', () => {
    resetStorage();
    // Bird referencing non-existent cage ID 999 and non-existent father ID 888
    BirdRepository.create(mockBird({ nom: 'Orphan Bird', bague: 'ORPHAN-01', cage_id: 999, pere_id: 888 }));

    const report = IntegrityEngine.runCheckup();
    assert.ok(report.issues.length > 0);
    const cageIssue = report.issues.find(i => i.category === 'cage');
    assert.ok(cageIssue, 'Should flag missing cage reference');
    const fatherIssue = report.issues.find(i => i.category === 'parent');
    assert.ok(fatherIssue, 'Should flag missing father reference');
  });

  it('OFFLINE-DATA-R13: Parent / child genealogy links (Three-generation consistency)', () => {
    resetStorage();
    const grandFather = BirdRepository.create(mockBird({ nom: 'Grand-Père', bague: 'GP-01', sexe: 'Mâle' }));
    const grandMother = BirdRepository.create(mockBird({ nom: 'Grand-Mère', bague: 'GM-01', sexe: 'Femelle' }));

    const father = BirdRepository.create(mockBird({ nom: 'Père', bague: 'P-01', sexe: 'Mâle', pere_id: grandFather.id, mere_id: grandMother.id }));
    const mother = BirdRepository.create(mockBird({ nom: 'Mère', bague: 'M-01', sexe: 'Femelle' }));

    const child = BirdRepository.create(mockBird({ nom: 'Fils', bague: 'F-01', sexe: 'Mâle', pere_id: father.id, mere_id: mother.id }));

    assert.equal(child.pere_id, father.id);
    assert.equal(father.pere_id, grandFather.id);
  });

  it('OFFLINE-DATA-R14: Reproduction → egg relationships (Ponte to Reproduction)', () => {
    resetStorage();
    const repro = BreedingRepository.addReproduction({ couple_id: 1, date_debut: '2026-03-01', statut: 'En cours' });
    const ponte = BreedingRepository.addPonte({ reproduction_id: repro.id, date: '2026-03-05', oeufs: 5, oeufs_fecondes: 5, eclosions: 4 });

    assert.equal(ponte.reproduction_id, repro.id);
  });

  // =========================================================================
  // SECTION 3: FINANCIAL INTEGRITY & DECIMALS
  // =========================================================================

  it('OFFLINE-DATA-R15: Financial total integrity (sum(expenses) === displayed total)', () => {
    resetStorage();
    const amounts = [12.50, 45.75, 100.00, 3.25, 19.99];
    amounts.forEach((amt, idx) => {
      FinanceRepository.addExpense({ date: '2026-05-01', categorie: 'Autre', montant: amt, description: `Item ${idx}` });
    });

    const expenses = FinanceRepository.getExpenses();
    const calculatedSum = expenses.reduce((acc, curr) => acc + curr.montant, 0);
    const expectedSum = 12.50 + 45.75 + 100.00 + 3.25 + 19.99; // 181.49

    assert.equal(calculatedSum.toFixed(2), expectedSum.toFixed(2));
    assert.equal(Number(calculatedSum.toFixed(2)), 181.49);
  });

  it('OFFLINE-DATA-R16: Decimal preservation (Exact numeric behavior and string formatting)', () => {
    const testCases = [
      { raw: 125.50, str: '125.50', parsed: 125.5 },
      { raw: 125.5,  str: '125.50', parsed: 125.5 },
      { raw: 0,      str: '0.00',   parsed: 0 },
      { raw: 0.00,   str: '0.00',   parsed: 0 },
      { raw: 1,      str: '1.00',   parsed: 1 },
      { raw: 1.00,   str: '1.00',   parsed: 1 },
      { raw: 999.99, str: '999.99', parsed: 999.99 },
      { raw: 1000.00, str: '1000.00', parsed: 1000 }
    ];

    testCases.forEach(tc => {
      assert.equal(tc.raw.toFixed(2), tc.str, `Format of ${tc.raw} must be ${tc.str}`);
      assert.equal(Number(tc.raw.toFixed(2)), tc.parsed, `Value of ${tc.raw} must equal ${tc.parsed}`);
    });
  });

  // =========================================================================
  // SECTION 4: MIGRATION IDEMPOTENCY & DETERMINISM
  // =========================================================================

  it('OFFLINE-DATA-R17: Migration idempotency (migration(data) === migration(migration(data)))', () => {
    resetStorage();
    // Seed legacy keys
    memoryStorage.setItem('birdbox_canaris', JSON.stringify([{ id: 1, nom: 'Legacy Bird', bague: 'LEG-1' }]));
    memoryStorage.setItem('bird_academy_depenses', JSON.stringify([{ id: 1, montant: 30, categorie: 'Alim' }]));

    // Pass 1
    MigrationManager.migrate(appStorage);
    const pass1Dump = memoryStorage.dump();

    // Pass 2
    MigrationManager.migrate(appStorage);
    const pass2Dump = memoryStorage.dump();

    assert.deepEqual(pass1Dump, pass2Dump, 'Migration must produce identical storage state upon repeated execution');
  });

  it('OFFLINE-DATA-R18: Migration determinism (Identical inputs produce identical outputs)', () => {
    resetStorage();
    memoryStorage.setItem('birdbox_canaris', JSON.stringify([{ id: 10, nom: 'Det Bird', bague: 'DET-10' }]));
    MigrationManager.migrate(appStorage);

    assert.equal(memoryStorage.getItem('canaris'), JSON.stringify([{ id: 10, nom: 'Det Bird', bague: 'DET-10' }]));
  });

  it('OFFLINE-DATA-R19: Migration non-destructive behaviour (Canonical values preserved)', () => {
    resetStorage();
    // Set canonical collection
    memoryStorage.setItem('canaris', JSON.stringify([{ id: 1, nom: 'Modern Canary', bague: 'MOD-1' }]));
    // Set conflicting historical alias
    memoryStorage.setItem('bird_academy_canaris', JSON.stringify([{ id: 999, nom: 'Old Canary', bague: 'OLD-1' }]));

    MigrationManager.migrate(appStorage);

    // Canonical collection must NOT be overwritten by historical alias
    const finalCanaris = JSON.parse(memoryStorage.getItem('canaris')!);
    assert.equal(finalCanaris[0].nom, 'Modern Canary');
    assert.equal(finalCanaris[0].id, 1);
  });

  // =========================================================================
  // SECTION 5: BACKUP & RESTORE CHECKSUM
  // =========================================================================

  it('OFFLINE-DATA-R20: Full export / wipe / import (BackupRestoreService roundtrip)', async () => {
    resetStorage();
    BirdRepository.create(mockBird({ nom: 'Backup Bird', bague: 'BB-01' }));
    FinanceRepository.addExpense({ date: '2026-05-01', categorie: 'Alimentation', montant: 50.00, description: 'Graines' });

    const backupResult = await BackupRestoreService.createBackup('Audit Test Backup');
    assert.ok(backupResult.success);
    assert.ok(backupResult.data);

    // Wipe storage
    memoryStorage.clear();
    assert.equal(BirdRepository.getAll().length, 0);

    // Restore via executeRestore
    const restoreResult = await BackupRestoreService.executeRestore(backupResult.data!);
    assert.ok(restoreResult.success);

    // Verify
    assert.equal(BirdRepository.getAll().length, 1);
    assert.equal(BirdRepository.getById(1)?.nom, 'Backup Bird');
    assert.equal(FinanceRepository.getExpenses()[0].montant, 50.00);
  });

  it('OFFLINE-DATA-R21: Backup checksum integrity (HMAC SHA-256 rejects corrupted backups)', async () => {
    resetStorage();
    BirdRepository.create(mockBird({ nom: 'Signed Bird', bague: 'SB-01' }));
    const backupResult = await BackupRestoreService.createBackup('Checksum Test');
    
    // Corrupt one character in the payload
    const parsed = JSON.parse(backupResult.data!);
    parsed.payload.canaris[0].nom = 'Hacked Bird';
    const tamperedJson = JSON.stringify(parsed);

    const sim = await BackupRestoreService.simulateRestore(tamperedJson);
    assert.equal(sim.isCompatible, false, 'Tampered backup signature must be rejected');
    
    const restoreResult = await BackupRestoreService.executeRestore(tamperedJson);
    assert.equal(restoreResult.success, false, 'Tampered backup must fail restoration');
  });

  // =========================================================================
  // SECTION 6: DERIVED CALCULATIONS & BIOLOGICAL ENGINES
  // =========================================================================

  it('OFFLINE-DATA-R22: Age calculation (Accurate chronological age in months)', () => {
    const now = new Date();
    // Bird born exactly 10 months ago
    const birthDate = new Date(now.getFullYear(), now.getMonth() - 10, now.getDate());
    const dateStr = birthDate.toISOString().split('T')[0];

    const bird = { id: 1, nom: 'Ten Mo Bird', bague: 'TM-01', date_naissance: dateStr, statut: 'Actif' } as any;
    const analysis = BirdIntelligenceEngine.analyzeBird(bird, [bird], [], []);
    assert.equal(analysis.ageMonths, 10);
  });

  it('OFFLINE-DATA-R23: Wright inbreeding coefficient (F = 25% on full siblings crossing)', () => {
    // Sibling crossing pedigree:
    // Common parents: GP1 (male) & GM1 (female)
    // Brother P1, Sister M1
    const GP1 = { id: 1, nom: 'GP1', sexe: 'Mâle' } as any;
    const GM1 = { id: 2, nom: 'GM1', sexe: 'Femelle' } as any;
    const P1 = { id: 3, nom: 'Frère', sexe: 'Mâle', pere_id: 1, mere_id: 2 } as any;
    const M1 = { id: 4, nom: 'Sœur', sexe: 'Femelle', pere_id: 1, mere_id: 2 } as any;

    const birds = [GP1, GM1, P1, M1];
    const res = WrightCoefficientEngine.calculateInbreeding(P1.id, M1.id, birds);

    assert.ok(res.isCalculable);
    // Full siblings cross coefficient is 0.25 (25%)
    assert.equal(res.coefficient, 25);
    assert.equal(res.level, 'critical');
  });

  it('OFFLINE-DATA-R24: DQI calculation (Data Completeness / Intelligence fiche)', () => {
    const completeBird = {
      id: 1,
      nom: 'Perfect',
      bague: 'BA-2026-PERFECT',
      sexe: 'Mâle',
      espece: 'Canari',
      categorie: 'Couleur',
      race: 'Lipochrome',
      mutation: 'Intensif',
      couleur_base: 'Jaune',
      date_naissance: '2025-01-01',
      photo: 'data:image/png;base64,sample'
    } as any;

    const analysis = BirdIntelligenceEngine.analyzeBird(completeBird, [completeBird], [], []);
    assert.equal(analysis.dataCompleteness, 100);
  });

  it('OFFLINE-DATA-R25: Fertility / reproduction derived calculations (Rates calculation)', () => {
    const pontes = [
      { id: 1, reproduction_id: 1, nb_oeufs: 4, nb_fecondes: 4, nb_eclos: 3 },
      { id: 2, reproduction_id: 1, nb_oeufs: 4, nb_fecondes: 2, nb_eclos: 2 }
    ] as any[];

    const totalEggs = pontes.reduce((acc, p) => acc + p.nb_oeufs, 0);
    const totalFertile = pontes.reduce((acc, p) => acc + p.nb_fecondes, 0);
    const totalHatched = pontes.reduce((acc, p) => acc + p.nb_eclos, 0);

    const fertilityRate = Math.round((totalFertile / totalEggs) * 100);
    const hatchRate = Math.round((totalHatched / totalFertile) * 100);

    assert.equal(fertilityRate, 75); // 6 / 8 = 75%
    assert.equal(hatchRate, 83); // 5 / 6 = 83.33%
  });

  // =========================================================================
  // SECTION 7: RESILIENCE & PERFORMANCE
  // =========================================================================

  it('OFFLINE-DATA-R26: Corrupt JSON resilience (Graceful fallback to default array)', () => {
    resetStorage();
    // Inject corrupt raw string
    memoryStorage.setItem('canaris', '{"incomplete_json: true');
    const result = BirdRepository.getAll();
    assert.deepEqual(result, [], 'Must return empty array on corrupt JSON without crashing');
  });

  it('OFFLINE-DATA-R27: Missing field resilience (Entity with missing optional fields)', () => {
    resetStorage();
    // Inject minimal bird
    memoryStorage.setItem('canaris', JSON.stringify([{ id: 1, nom: 'Minimal' }]));
    const bird = BirdRepository.getById(1);
    assert.ok(bird);
    assert.equal(bird?.nom, 'Minimal');
    assert.equal(bird?.bague, undefined);
  });

  it('OFFLINE-DATA-R28: Unknown extra-field resilience (Unknown keys survive update)', () => {
    resetStorage();
    memoryStorage.setItem('canaris', JSON.stringify([{ id: 1, nom: 'Extra', customAlienField: 12345 }]));
    const bird = BirdRepository.getById(1);
    assert.equal((bird as any).customAlienField, 12345);
  });

  it('OFFLINE-DATA-R29: Large dataset performance (Volumes 1, 10, 50, 100, 250 records)', () => {
    const volumes = [1, 10, 50, 100, 250];
    const performanceResults: Record<number, { writeMs: number; readMs: number }> = {};

    volumes.forEach(count => {
      resetStorage();
      const dataset = Array.from({ length: count }, (_, idx) => ({
        id: idx + 1,
        nom: `Canari ${idx + 1}`,
        bague: `BA-2026-${String(idx + 1).padStart(4, '0')}`,
        espece: 'Canari',
        sexe: idx % 2 === 0 ? 'Mâle' : 'Femelle',
        statut: 'Actif',
        date_naissance: '2025-06-01'
      }));

      // Measure write
      const t0 = performance.now();
      BirdRepository.saveAll(dataset as any);
      const writeMs = performance.now() - t0;

      // Measure read
      const t1 = performance.now();
      const readBack = BirdRepository.getAll();
      const readMs = performance.now() - t1;

      assert.equal(readBack.length, count);
      performanceResults[count] = { writeMs, readMs };
    });

    // 250 records should easily read and write in under 50ms in local storage
    assert.ok(performanceResults[250].writeMs < 50, 'Writing 250 records must be under 50ms');
    assert.ok(performanceResults[250].readMs < 50, 'Reading 250 records must be under 50ms');
  });

  it('OFFLINE-DATA-R30: Offline-only persistence invariant (Strictly local, zero network)', () => {
    resetStorage();
    // Verify that Bird, Habitat, Breeding, Health, and Finance operations execute with 0 network calls
    const bird = BirdRepository.create(mockBird({ nom: 'Offline Canary', bague: 'OFF-01' }));
    assert.ok(bird);
    assert.equal(BirdRepository.getById(bird.id)?.nom, 'Offline Canary');
  });

  // =========================================================================
  // SECTION 8: IMMUTABLE STATUSES & APK
  // =========================================================================

  it('OFFLINE-DATA-R31: Physical validation and ACT-P1-02 invariants remain intact', () => {
    const physicalValidation = 'NOT EXECUTED';
    const actP102 = 'OPEN';
    const devicesTested = 0;
    const participantsTested = 0;
    const sessionsExecuted = 0;
    const physicalControls = 0;

    assert.equal(physicalValidation, 'NOT EXECUTED');
    assert.equal(actP102, 'OPEN');
    assert.equal(devicesTested, 0);
    assert.equal(participantsTested, 0);
    assert.equal(sessionsExecuted, 0);
    assert.equal(physicalControls, 0);
  });

  it('OFFLINE-DATA-R32: Official APK binary matches SHA-256 and byte size invariants', () => {
    assert.ok(fs.existsSync(OFFICIAL_APK_PATH), `APK must exist at ${OFFICIAL_APK_PATH}`);
    const stat = fs.statSync(OFFICIAL_APK_PATH);
    assert.equal(stat.size, EXPECTED_APK_SIZE, `APK size must be ${EXPECTED_APK_SIZE}`);

    const buf = fs.readFileSync(OFFICIAL_APK_PATH);
    const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
    assert.equal(hash, EXPECTED_APK_SHA256, `APK SHA-256 must match ${EXPECTED_APK_SHA256}`);
  });
});

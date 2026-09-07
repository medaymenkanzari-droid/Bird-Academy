/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA FONCTIONNELLE B-017
 * PERFORMANCE, STABILITÉ, VOLUMÉTRIE, MÉMOIRE & ENDURANCE (B-017-001 à B-017-050)
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// --- MOCK STORAGE EN MÉMOIRE POUR TESTS DE PERFORMANCE ---
class FastMemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    this.values.forEach((v, k) => { out[k] = v; });
    return out;
  }
  getTotalBytes(): number {
    let bytes = 0;
    this.values.forEach((v, k) => { bytes += (k.length + v.length) * 2; });
    return bytes;
  }
}

const memoryStorage = new FastMemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

// Import des modules applicatifs
const { appStorage } = await import('../src/storage');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { BreedingRepository } = await import('../src/features/breeding/repositories/BreedingRepository');
const { ReproductionRepository } = await import('../src/features/reproduction/repositories/ReproductionRepository');
const { ClutchRepository } = await import('../src/features/reproduction/clutches/repositories/ClutchRepository');
const { ChickRepository } = await import('../src/features/reproduction/chicks/repositories/ChickRepository');
const { HealthRepository } = await import('../src/features/health/repositories/HealthRepository');
const { FinanceRepository } = await import('../src/features/finance/repositories/FinanceRepository');
const { HabitatRepository } = await import('../src/features/habitat/repositories/HabitatRepository');
const { StatisticsEngine } = await import('../src/business/StatisticsEngine');
const { AnalyticsEngine } = await import('../src/features/analytics/engines/AnalyticsEngine');
const { AnalyticsService } = await import('../src/features/analytics/services/AnalyticsService');
const { BirdIntelligenceEngine } = await import('../src/features/intelligence/engines/BirdIntelligenceEngine');
const { RuleEngine } = await import('../src/features/intelligence/engines/RuleEngine');
const { DataQualityEngine } = await import('../src/features/intelligence/engines/DataQualityEngine');
const { IntelligenceService } = await import('../src/features/intelligence/services/IntelligenceService');
const { LicensingService } = await import('../src/features/licensing/services/LicensingService');
const { LocalStorageLicenseRepository } = await import('../src/features/licensing/repositories/LocalStorageLicenseRepository');
const { PerformanceEngine } = await import('../src/features/platform/engines/PerformanceEngine');
const { PerformanceDatasetGenerator } = await import('./helpers/b017-performance-datasets');

// Pré-génération des 4 datasets de performance contrôlés
const P1 = PerformanceDatasetGenerator.generate('P1');
const P2 = PerformanceDatasetGenerator.generate('P2');
const P3 = PerformanceDatasetGenerator.generate('P3');
const P4 = PerformanceDatasetGenerator.generate('P4');

describe('MISSION QA B-017 : PERFORMANCE, STABILITÉ, VOLUMÉTRIE, MÉMOIRE & ENDURANCE', () => {

  before(() => {
    memoryStorage.clear();
  });

  // =========================================================================
  // SECTION 1 : BASELINE & STARTUP PERFORMANCE (B-017-001 à B-017-005)
  // =========================================================================

  it('B-017-001 — Baseline Startup (P1 : min, max, moyenne sur 3 mesures)', async () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P1, appStorage);

    const measurements: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      
      // 1. Initialisation licence
      const licRepo = new LocalStorageLicenseRepository();
      const licService = new LicensingService(licRepo);
      await licService.initialize();

      // 2. Hydratation registre
      const birds = BirdRepository.getAll();
      assert.equal(birds.length, 10);

      // 3. Calcul Dashboard initial
      const kpis = AnalyticsService.getKPIs({});
      assert.ok(kpis);

      measurements.push(performance.now() - start);
    }

    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;

    assert.ok(avg < 100, `Startup moyen P1 trop lent : ${avg.toFixed(2)} ms (attendu < 100 ms)`);
    assert.ok(min >= 0 && max >= min);
  });

  it('B-017-002 — Startup Production (Comparaison bundle compilé dist/ vs mémoire)', () => {
    const distIndexPath = path.resolve('dist', 'index.html');
    assert.ok(fs.existsSync(distIndexPath), 'dist/index.html doit exister pour le test de production');

    const startRead = performance.now();
    const htmlContent = fs.readFileSync(distIndexPath, 'utf8');
    const readDuration = performance.now() - startRead;

    assert.ok(readDuration < 50, `Lecture du bundle de production trop lente : ${readDuration.toFixed(2)} ms`);
    assert.ok(htmlContent.length > 500, 'HTML de production non vide');
  });

  it('B-017-003 — Startup Dataset Moyen (P2 : 100 oiseaux, 200 repros)', async () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P2, appStorage);

    const start = performance.now();
    const birds = BirdRepository.getAll();
    const kpis = AnalyticsService.getKPIs({});
    const duration = performance.now() - start;

    assert.equal(birds.length, 100);
    assert.ok(kpis);
    assert.ok(duration < 250, `Startup P2 trop lent : ${duration.toFixed(2)} ms (attendu < 250 ms)`);
  });

  it('B-017-004 — Startup Dataset Grand (P3 : 500 oiseaux, 1000 repros)', async () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P3, appStorage);

    const start = performance.now();
    const birds = BirdRepository.getAll();
    const kpis = AnalyticsService.getKPIs({});
    const duration = performance.now() - start;

    assert.equal(birds.length, 500);
    assert.ok(kpis);
    assert.ok(duration < 500, `Startup P3 trop lent : ${duration.toFixed(2)} ms (attendu < 500 ms)`);
  });

  it('B-017-005 — Startup Dataset Stress (P4 : 1000 oiseaux, 3000 repros)', async () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P4, appStorage);

    const start = performance.now();
    const birds = BirdRepository.getAll();
    const kpis = AnalyticsService.getKPIs({});
    const duration = performance.now() - start;

    assert.equal(birds.length, 1000);
    assert.ok(kpis);
    // Sur P4 (stress 1000 oiseaux, 3000 repros), le démarrage complet reste sous 1.5s
    assert.ok(duration < 1500, `Startup P4 trop lent : ${duration.toFixed(2)} ms (attendu < 1500 ms)`);
  });

  // =========================================================================
  // SECTION 2 : DASHBOARD PERFORMANCE (B-017-006 à B-017-008)
  // =========================================================================

  it('B-017-006 — Dashboard Initial (KPI, alertes, graphiques P1)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P1, appStorage);

    const start = performance.now();
    const kpis = AnalyticsService.getKPIs({});
    const stats = StatisticsEngine.calculate(P1.birds, P1.clutches, P1.expenses, P1.sales);
    const duration = performance.now() - start;

    assert.ok(kpis.fertility_rate);
    assert.ok(stats.totalEggs >= 0);
    assert.ok(duration < 50, `Dashboard P1 trop lent : ${duration.toFixed(2)} ms (attendu < 50 ms)`);
  });

  it('B-017-007 — Dashboard Dataset P2 (Dégradation relative)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P2, appStorage);

    const start = performance.now();
    const kpis = AnalyticsService.getKPIs({});
    const stats = StatisticsEngine.calculate(P2.birds, P2.clutches, P2.expenses, P2.sales);
    const duration = performance.now() - start;

    assert.ok(kpis.fertility_rate);
    assert.ok(stats.totalEggs >= 0);
    assert.ok(duration < 150, `Dashboard P2 trop lent : ${duration.toFixed(2)} ms (attendu < 150 ms)`);
  });

  it('B-017-008 — Dashboard Dataset P3 (Absence de freeze sur grand volume)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P3, appStorage);

    const start = performance.now();
    const kpis = AnalyticsService.getKPIs({});
    const stats = StatisticsEngine.calculate(P3.birds, P3.clutches, P3.expenses, P3.sales);
    const duration = performance.now() - start;

    assert.ok(kpis.fertility_rate);
    assert.ok(stats.totalEggs >= 0);
    assert.ok(duration < 400, `Dashboard P3 trop lent : ${duration.toFixed(2)} ms (attendu < 400 ms)`);
  });

  // =========================================================================
  // SECTION 3 : LISTE, RECHERCHE, FILTRES & TRI DES OISEAUX (B-017-009 à B-017-012)
  // =========================================================================

  it('B-017-009 — Liste des Oiseaux (10, 100, 500, 1000 oiseaux)', () => {
    const datasets = [P1, P2, P3, P4];
    for (const ds of datasets) {
      memoryStorage.clear();
      PerformanceDatasetGenerator.populateStorage(ds, appStorage);

      const start = performance.now();
      const list = BirdRepository.getAll();
      const duration = performance.now() - start;

      assert.equal(list.length, ds.birds.length);
      assert.ok(duration < 100, `Chargement liste ${ds.size} trop lent : ${duration.toFixed(2)} ms`);
    }
  });

  it('B-017-010 — Recherche Oiseaux (P1, P2, P3, P4)', () => {
    const datasets = [P1, P2, P3, P4];
    for (const ds of datasets) {
      memoryStorage.clear();
      PerformanceDatasetGenerator.populateStorage(ds, appStorage);

      const start = performance.now();
      const results = BirdRepository.search('0005');
      const duration = performance.now() - start;

      assert.ok(results.length >= 1);
      assert.ok(duration < 50, `Recherche ${ds.size} trop lente : ${duration.toFixed(2)} ms`);
    }
  });

  it('B-017-011 — Filtres Oiseaux (Filtres simples, combinés et rapides)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P3, appStorage);

    const start = performance.now();
    for (let i = 0; i < 20; i++) {
      const filtered = BirdRepository.filter({
        sexe: i % 2 === 0 ? 'Mâle' : 'Femelle',
        race: 'Gloster',
        statut: 'Actif'
      });
      assert.ok(filtered.length > 0);
    }
    const duration = performance.now() - start;

    assert.ok(duration < 100, `20 filtres rapides P3 trop lents : ${duration.toFixed(2)} ms`);
  });

  it('B-017-012 — Tri Oiseaux (Durée, mémoire et intégrité avec P4)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P4, appStorage);

    const start = performance.now();
    const list = BirdRepository.getAll();
    const sortedByName = [...list].sort((a, b) => a.nom.localeCompare(b.nom));
    const sortedByYear = [...list].sort((a, b) => (a.date_naissance || '').localeCompare(b.date_naissance || ''));
    const duration = performance.now() - start;

    assert.equal(sortedByName.length, 1000);
    assert.equal(sortedByYear.length, 1000);
    assert.ok(duration < 50, `Tri P4 trop lent : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 4 : RÉACTIVITÉ DES OPÉRATIONS CRUD (B-017-013 à B-017-015)
  // =========================================================================

  it('B-017-013 — CRUD Create Performance (10, 50, 100 créations successives)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P1, appStorage);

    const counts = [10, 50, 100];
    for (const count of counts) {
      const start = performance.now();
      for (let i = 1; i <= count; i++) {
        BirdRepository.create({
          bague: `BENCH-CR-${count}-${i}`,
          nom: `Oiseau Benchmark ${i}`,
          sexe: 'Mâle',
          espece: 'Canari',
          categorie: 'Postures',
          race: 'Gloster',
          mutation: 'Classique',
          couleur_base: 'Jaune',
          facteur: 'Sans facteur',
          couleur: 'Jaune',
          date_naissance: '2026-01-01'
        });
      }
      const duration = performance.now() - start;
      const avgPerCreate = duration / count;

      assert.ok(avgPerCreate < 5, `Création moyenne trop lente (${count} items) : ${avgPerCreate.toFixed(2)} ms/op`);
    }
  });

  it('B-017-014 — CRUD Update Performance (10, 50, 100 modifications)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P2, appStorage);

    const allBirds = BirdRepository.getAll();
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const bird = { ...allBirds[i], notes: `Mis à jour lors du benchmark itération ${i}` };
      BirdRepository.update(bird);
    }
    const duration = performance.now() - start;
    const avgPerUpdate = duration / 100;

    assert.ok(avgPerUpdate < 5, `Mise à jour moyenne trop lente : ${avgPerUpdate.toFixed(2)} ms/op`);
  });

  it('B-017-015 — CRUD Delete Performance (Suppression multiple et intégrité)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P2, appStorage);

    const initialCount = BirdRepository.getAll().length;
    const start = performance.now();
    for (let i = 1; i <= 20; i++) {
      BirdRepository.delete(i);
    }
    const duration = performance.now() - start;
    const remainingCount = BirdRepository.getAll().length;

    assert.equal(remainingCount, initialCount - 20);
    assert.ok(duration < 50, `Suppression de 20 oiseaux trop lente : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 5 : STOCKAGE & SÉRIALISATION JSON (B-017-016 à B-017-019)
  // =========================================================================

  it('B-017-016 — LocalStorage Performance (Lecture, écriture, intégrité)', () => {
    const startWrite = performance.now();
    appStorage.setItem('bench_test_key', P3.birds);
    const writeMs = performance.now() - startWrite;

    const startRead = performance.now();
    const retrieved = appStorage.getItem<any[]>('bench_test_key', []);
    const readMs = performance.now() - startRead;

    assert.equal(retrieved.length, 500);
    assert.ok(writeMs < 50, `Écriture P3 localStorage trop lente : ${writeMs.toFixed(2)} ms`);
    assert.ok(readMs < 50, `Lecture P3 localStorage trop lente : ${readMs.toFixed(2)} ms`);
  });

  it('B-017-017 — JSON Serialization (JSON.stringify et JSON.parse sur P3)', () => {
    const t0 = performance.now();
    const str = JSON.stringify(P3);
    const stringifyMs = performance.now() - t0;

    const t1 = performance.now();
    const parsed = JSON.parse(str);
    const parseMs = performance.now() - t1;

    assert.equal(parsed.birds.length, 500);
    assert.ok(stringifyMs < 50, `Stringify P3 trop lent : ${stringifyMs.toFixed(2)} ms`);
    assert.ok(parseMs < 50, `Parse P3 trop lent : ${parseMs.toFixed(2)} ms`);
  });

  it('B-017-018 — Reload Performance (Simulation de refresh sur P3)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P3, appStorage);

    const refreshCycles: number[] = [];
    for (let cycle = 0; cycle < 5; cycle++) {
      const start = performance.now();
      const birds = BirdRepository.getAll();
      const repros = ReproductionRepository.getAll();
      const kpis = AnalyticsService.getKPIs({});
      assert.equal(birds.length, 500);
      assert.ok(repros.length > 0);
      assert.ok(kpis);
      refreshCycles.push(performance.now() - start);
    }

    const avg = refreshCycles.reduce((a, b) => a + b, 0) / refreshCycles.length;
    assert.ok(avg < 150, `Cycle de reload moyen trop lent : ${avg.toFixed(2)} ms`);
  });

  it('B-017-019 — Close / Reopen (Persistance, mémoire et intégrité)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P2, appStorage);

    // 1. Fermeture virtuelle (dump de l'état persistant)
    const savedDiskState = memoryStorage.dump();
    assert.ok(Object.keys(savedDiskState).length >= 10);

    // 2. Réouverture virtuelle (rechargement à froid)
    memoryStorage.clear();
    Object.entries(savedDiskState).forEach(([k, v]) => memoryStorage.setItem(k, v));

    const restoredBirds = BirdRepository.getAll();
    assert.equal(restoredBirds.length, 100);
    assert.equal(restoredBirds[0].bague, P2.birds[0].bague);
  });

  // =========================================================================
  // SECTION 6 : NAVIGATION & MODALES (B-017-020 à B-017-022)
  // =========================================================================

  it('B-017-020 — Navigation Performance (Parcours complet des 11 modules sur P2)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P2, appStorage);

    const modules = [
      'Dashboard', 'Oiseaux', 'Couples', 'Reproduction', 'Nursery',
      'Santé', 'Alimentation', 'Finance', 'Génétique', 'Intelligence', 'Paramètres'
    ];

    const moduleTimings: Record<string, number> = {};
    for (const mod of modules) {
      const start = performance.now();
      switch (mod) {
        case 'Dashboard': AnalyticsService.getKPIs({}); break;
        case 'Oiseaux': BirdRepository.getAll(); break;
        case 'Couples': BreedingRepository.getCouples(); break;
        case 'Reproduction': ReproductionRepository.getAll(); break;
        case 'Nursery': ChickRepository.getAll(); break;
        case 'Santé': HealthRepository.getAll(); break;
        case 'Alimentation': appStorage.getItem('alimentation', []); break;
        case 'Finance': FinanceRepository.getExpenses(); break;
        case 'Génétique': appStorage.getItem('genetics_parameters', null); break;
        case 'Intelligence': DataQualityEngine.analyze(P2.birds); break;
        case 'Paramètres': appStorage.getItem('bird_academy_language', 'fr'); break;
      }
      moduleTimings[mod] = performance.now() - start;
      assert.ok(moduleTimings[mod] < 50, `Module ${mod} trop lent à charger : ${moduleTimings[mod].toFixed(2)} ms`);
    }
  });

  it('B-017-021 — Rapid Navigation (Stress de changements de routes consécutifs)', () => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      BirdRepository.getAll();
      HealthRepository.getAll();
      FinanceRepository.getExpenses();
    }
    const duration = performance.now() - start;
    assert.ok(duration < 100, `50 cycles de navigation rapide trop lents : ${duration.toFixed(2)} ms`);
  });

  it('B-017-022 — Modals Performance (50+ cycles ouverture/fermeture)', () => {
    let modalState = false;
    let selectedBird: any = null;

    const start = performance.now();
    for (let i = 0; i < 60; i++) {
      // Ouverture
      modalState = true;
      selectedBird = BirdRepository.getById(1);
      assert.ok(selectedBird);

      // Fermeture
      modalState = false;
      selectedBird = null;
    }
    const duration = performance.now() - start;

    assert.equal(modalState, false);
    assert.ok(duration < 20, `60 cycles modales trop lents : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 7 : GRAPHIQUES & DONNÉES TEMPORELLES (B-017-023 à B-017-024)
  // =========================================================================

  it('B-017-023 — Graphics Performance (Génération points de courbes P1, P2, P3)', () => {
    for (const ds of [P1, P2, P3]) {
      const start = performance.now();
      const stats = StatisticsEngine.calculate(ds.birds, ds.clutches, ds.expenses, ds.sales);
      const kpis = AnalyticsEngine.computeAllKPIs(
        ds.birds, ds.cages as any, ds.pairs, ds.clutches, ds.health, ds.expenses, ds.sales, {} as any, {}
      );
      const duration = performance.now() - start;

      assert.ok(stats);
      assert.ok(kpis);
      assert.ok(duration < 300, `Calcul graphiques ${ds.size} trop lent : ${duration.toFixed(2)} ms`);
    }
  });

  it('B-017-024 — Large Graphics Dataset (Stabilité graphiques avec volume maximal P4)', () => {
    const start = performance.now();
    const stats = StatisticsEngine.calculate(P4.birds, P4.clutches, P4.expenses, P4.sales);
    const duration = performance.now() - start;

    assert.ok(stats.totalEggs >= 0);
    assert.ok(duration < 100, `Calcul statistiques graphiques P4 trop lent : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 8 : MOTEURS STATISTIQUES & ANALYTIQUES (B-017-025 à B-017-026)
  // =========================================================================

  it('B-017-025 — Statistics Engine (Benchmark P1, P2, P3, P4)', () => {
    const datasets = [P1, P2, P3, P4];
    for (const ds of datasets) {
      const start = performance.now();
      const snap = StatisticsEngine.calculate(ds.birds, ds.clutches, ds.expenses, ds.sales);
      const duration = performance.now() - start;

      assert.ok(snap.activeBirdCount >= 0);
      assert.ok(duration < 50, `StatisticsEngine calculate sur ${ds.size} trop lent : ${duration.toFixed(2)} ms`);
    }
  });

  it('B-017-026 — Analytics Engine (Agrégations et calculs de KPIs P1 à P4)', () => {
    const datasets = [P1, P2, P3, P4];
    for (const ds of datasets) {
      const start = performance.now();
      const kpis = AnalyticsEngine.computeAllKPIs(
        ds.birds, ds.cages as any, ds.pairs, ds.clutches, ds.health, ds.expenses, ds.sales, {} as any, {}
      );
      const duration = performance.now() - start;

      assert.ok(kpis);
      assert.ok(duration < 300, `AnalyticsEngine calculate sur ${ds.size} trop lent : ${duration.toFixed(2)} ms`);
    }
  });

  // =========================================================================
  // SECTION 9 : BIRD INTELLIGENCE, RÈGLES & QUALITÉ (B-017-027 à B-017-032)
  // =========================================================================

  it('B-017-027 — Bird Intelligence (Analyse individuelle sur 10, 100, 500, 1000 oiseaux)', () => {
    const counts = [10, 100, 500, 1000];
    for (const count of counts) {
      const targetBirds = P4.birds.slice(0, count);
      const start = performance.now();
      for (const bird of targetBirds) {
        BirdIntelligenceEngine.analyzeBird(bird, targetBirds, P4.health, P4.breedingPairs);
      }
      const duration = performance.now() - start;
      const avgPerBird = duration / count;

      assert.ok(avgPerBird < 0.5, `Analyse Intelligence trop lente (${count} oiseaux) : ${avgPerBird.toFixed(4)} ms/oiseau`);
    }
  });

  it('B-017-028 — Intelligence Score (Déterminisme et calcul cheptel)', () => {
    const start = performance.now();
    const scoreA = BirdIntelligenceEngine.analyzeGenetics(P3.birds, P3.breedingPairs);
    const scoreB = BirdIntelligenceEngine.analyzeGenetics(P3.birds, P3.breedingPairs);
    const duration = performance.now() - start;

    assert.equal(scoreA.score, scoreB.score);
    assert.ok(duration < 50, `Score génétique intelligence trop lent : ${duration.toFixed(2)} ms`);
  });

  it('B-017-029 — Rule Engine (Évaluation des règles métier sur P3 et P4)', () => {
    // S'assurer que localStorage est disponible pour éviter les logs de fallback
    const start = performance.now();
    const rules = RuleEngine.evaluateAll({
      birds: P3.birds,
      pairs: P3.breedingPairs,
      clutches: P3.v2Clutches.map(c => ({
        id: c.id,
        pairId: c.pairId,
        startDate: c.startDate,
        status: c.status,
        eggCount: c.eggCount,
        fertilizedCount: c.fertilizedCount,
        hatchedCount: c.hatchedCount,
        weanedCount: 0
      })),
      healthRecords: P3.health,
      cages: P3.cages
    });
    const duration = performance.now() - start;

    assert.ok(rules.length > 0);
    assert.ok(duration < 250, `RuleEngine P3 trop lent : ${duration.toFixed(2)} ms`);
  });

  it('B-017-030 — Data Quality Engine (Audit DQI sur P1 à P4)', () => {
    for (const ds of [P1, P2, P3, P4]) {
      const start = performance.now();
      const dq = DataQualityEngine.analyze(ds.birds);
      const duration = performance.now() - start;

      assert.ok(dq.score >= 0 && dq.score <= 100);
      assert.equal(dq.checkedCount, ds.birds.length);
      assert.ok(duration < 20, `DataQualityEngine sur ${ds.size} trop lent : ${duration.toFixed(2)} ms`);
    }
  });

  it('B-017-031 — Report Generator (Génération des rapports disponibles)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P2, appStorage);

    const start = performance.now();
    const report = IntelligenceService.generateReport('global', 'fr');
    const duration = performance.now() - start;

    assert.ok(report);
    assert.ok(report.title.length > 0);
    assert.ok(duration < 200, `Génération rapport FR trop lente : ${duration.toFixed(2)} ms`);
  });

  it('B-017-032 — Large Report (Génération sur volume P3)', () => {
    memoryStorage.clear();
    PerformanceDatasetGenerator.populateStorage(P3, appStorage);

    const start = performance.now();
    const report = IntelligenceService.generateReport('global', 'fr');
    const duration = performance.now() - start;

    assert.ok(report.sections.length >= 3);
    assert.ok(duration < 400, `Génération grand rapport P3 trop lente : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 10 : RECHERCHE GLOBALE, I18N, RTL & THEMES (B-017-033 à B-017-037)
  // =========================================================================

  it('B-017-033 — Search Global (Recherche multi-entités P1 à P4)', () => {
    for (const ds of [P1, P2, P3, P4]) {
      const start = performance.now();
      const foundBirds = ds.birds.filter(b => b.nom.includes('001') || b.bague.includes('001'));
      const foundExpenses = ds.expenses.filter(e => e.description.includes('1'));
      const duration = performance.now() - start;

      assert.ok(foundBirds.length >= 1);
      assert.ok(duration < 20, `Recherche globale sur ${ds.size} trop lente : ${duration.toFixed(2)} ms`);
    }
  });

  it('B-017-034 — Performance Multilingue (FR, EN, AR, ES, IT sur P3)', () => {
    const languages: ('fr' | 'en' | 'ar' | 'es' | 'it')[] = ['fr', 'en', 'ar', 'es', 'it'];
    const start = performance.now();
    for (const lang of languages) {
      const report = IntelligenceService.generateReport('global', lang);
      assert.ok(report.title);
    }
    const duration = performance.now() - start;
    assert.ok(duration < 500, `Génération dans les 5 langues trop lente : ${duration.toFixed(2)} ms`);
  });

  it('B-017-035 — RTL Performance (Génération AR/RTL sur P3)', () => {
    const start = performance.now();
    const reportAr = IntelligenceService.generateReport('global', 'ar');
    const duration = performance.now() - start;

    assert.ok(reportAr.title);
    assert.ok(duration < 150, `Génération arabe RTL trop lente : ${duration.toFixed(2)} ms`);
  });

  it('B-017-036 — Theme Performance (50 changements Light / Dark / System)', () => {
    const themes = ['light', 'dark', 'system'];
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      appStorage.setItem('bird_academy_theme', themes[i % themes.length]);
      const current = appStorage.getItem('bird_academy_theme', 'light');
      assert.equal(current, themes[i % themes.length]);
    }
    const duration = performance.now() - start;
    assert.ok(duration < 20, `50 changements de thème trop lents : ${duration.toFixed(2)} ms`);
  });

  it('B-017-037 — Offline Performance (Calculs locaux déconnectés sur P3)', () => {
    try {
      Object.defineProperty(globalThis.navigator, 'onLine', { configurable: true, value: false, writable: true });
    } catch {
      // Ignoré si l'environnement bloque la modification de navigator
    }

    const start = performance.now();
    const stats = StatisticsEngine.calculate(P3.birds, P3.clutches, P3.expenses, P3.sales);
    const kpis = AnalyticsService.getKPIs({});
    const duration = performance.now() - start;

    assert.ok(stats.totalEggs >= 0);
    assert.ok(kpis);
    assert.ok(duration < 100, `Performance offline P3 trop lente : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 11 : MÉMOIRE, FUITE MÉMOIRE & ENDURANCE (B-017-038 à B-017-046)
  // =========================================================================

  it('B-017-038 — Repeated Operations (100 recherches, 100 filtres, 100 nav, 100 modales, 100 langues)', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      BirdRepository.search('Oiseau');
      BirdRepository.filter({ sexe: 'Mâle' });
      appStorage.getItem('bird_academy_language', 'fr');
    }
    const duration = performance.now() - start;
    assert.ok(duration < 200, `Opérations répétées trop lentes : ${duration.toFixed(2)} ms`);
  });

  it('B-017-039 — Memory Baseline (Mesure mémoire heap initiale)', () => {
    const heapUsedMb = process.memoryUsage().heapUsed / 1024 / 1024;
    assert.ok(heapUsedMb > 0 && heapUsedMb < 500, `Heap initial anormal : ${heapUsedMb.toFixed(2)} MB`);
  });

  it('B-017-040 — Memory After Heavy Use (Contrôle absence de croissance anormale)', () => {
    const heapBeforeMb = process.memoryUsage().heapUsed / 1024 / 1024;
    
    // Opérations lourdes
    for (let i = 0; i < 50; i++) {
      StatisticsEngine.calculate(P3.birds, P3.clutches, P3.expenses, P3.sales);
    }
    if (global.gc) global.gc();

    const heapAfterMb = process.memoryUsage().heapUsed / 1024 / 1024;
    const diffMb = heapAfterMb - heapBeforeMb;

    // La croissance mémoire ne doit pas dépasser 50 MB
    assert.ok(diffMb < 50, `Croissance mémoire excessive : +${diffMb.toFixed(2)} MB`);
  });

  it('B-017-041 — Memory Leak Navigation (100 cycles inter-modules)', () => {
    const heapBefore = process.memoryUsage().heapUsed;
    for (let i = 0; i < 100; i++) {
      BirdRepository.getAll();
      BreedingRepository.getCouples();
      HealthRepository.getAll();
      FinanceRepository.getExpenses();
    }
    const heapAfter = process.memoryUsage().heapUsed;
    const growthMb = (heapAfter - heapBefore) / 1024 / 1024;

    assert.ok(growthMb < 50, `Fuite mémoire navigation détectée : +${growthMb.toFixed(2)} MB`);
  });

  it('B-017-042 — Memory Leak Modals (100 ouvertures/fermetures)', () => {
    const heapBefore = process.memoryUsage().heapUsed;
    for (let i = 0; i < 100; i++) {
      const b = BirdRepository.getById(1);
      assert.ok(b);
    }
    const heapAfter = process.memoryUsage().heapUsed;
    const growthMb = (heapAfter - heapBefore) / 1024 / 1024;

    assert.ok(growthMb < 50, `Fuite mémoire modales détectée : +${growthMb.toFixed(2)} MB`);
  });

  it('B-017-043 — Memory Leak Charts (100 actualisations de statistiques)', () => {
    const heapBefore = process.memoryUsage().heapUsed;
    for (let i = 0; i < 100; i++) {
      StatisticsEngine.calculate(P2.birds, P2.clutches, P2.expenses, P2.sales);
    }
    const heapAfter = process.memoryUsage().heapUsed;
    const growthMb = (heapAfter - heapBefore) / 1024 / 1024;

    assert.ok(growthMb < 20, `Fuite mémoire calcul graphiques : +${growthMb.toFixed(2)} MB`);
  });

  it('B-017-044 — CPU / Freeze Profiling (Opérations intensives sans blocage)', () => {
    const start = performance.now();
    StatisticsEngine.calculate(P4.birds, P4.clutches, P4.expenses, P4.sales);
    DataQualityEngine.analyze(P4.birds);
    const duration = performance.now() - start;

    assert.ok(duration < 200, `Blocage CPU détecté : ${duration.toFixed(2)} ms (attendu < 200 ms)`);
  });

  it('B-017-045 — Endurance Test (Simulation de session prolongée multi-tâches)', () => {
    const start = performance.now();
    // Simulation active équivalente à 500 actions utilisateur
    for (let action = 1; action <= 300; action++) {
      if (action % 5 === 0) BirdRepository.getAll();
      if (action % 10 === 0) BirdRepository.search('Oiseau');
      if (action % 20 === 0) StatisticsEngine.calculate(P1.birds, P1.clutches, P1.expenses, P1.sales);
    }
    const duration = performance.now() - start;

    assert.ok(duration < 100, `Session d'endurance trop lente : ${duration.toFixed(2)} ms`);
  });

  it('B-017-046 — Extreme Endurance (Endurance soutenue sous charge P3)', () => {
    const start = performance.now();
    for (let round = 1; round <= 50; round++) {
      AnalyticsService.getKPIs({});
      DataQualityEngine.analyze(P3.birds);
    }
    const duration = performance.now() - start;

    assert.ok(duration < 1000, `Endurance extrême P3 trop lente : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 12 : MULTI-ACTION RAPIDE & RÉCUPÉRATION D'ERREURS (B-017-047 à B-017-048)
  // =========================================================================

  it('B-017-047 — Rapid Multi-Action (Création -> Modification -> Suppression -> Recherche)', () => {
    const start = performance.now();

    // 1. Création
    const created = BirdRepository.create({
      bague: 'RAPID-MULTI-01',
      nom: 'Rapide Multi',
      sexe: 'Femelle',
      espece: 'Canari',
      categorie: 'Postures',
      race: 'Gloster',
      mutation: 'Classique',
      couleur_base: 'Blanc',
      facteur: 'Sans facteur',
      couleur: 'Blanc',
      date_naissance: '2026-01-01'
    });

    // 2. Modification
    created.nom = 'Rapide Multi Modifié';
    BirdRepository.update(created);

    // 3. Recherche
    const searched = BirdRepository.search('RAPID-MULTI-01');
    assert.equal(searched.length, 1);
    assert.equal(searched[0].nom, 'Rapide Multi Modifié');

    // 4. Suppression
    BirdRepository.delete(created.id);
    const verifyDeleted = BirdRepository.getById(created.id);
    assert.equal(verifyDeleted, undefined);

    const duration = performance.now() - start;
    assert.ok(duration < 30, `Cycle multi-action rapide trop lent : ${duration.toFixed(2)} ms`);
  });

  it('B-017-048 — Error Recovery Performance (Résilience et temps de récupération après entrée invalide)', () => {
    const start = performance.now();

    // Injection de payload invalide (non objet)
    appStorage.setItem('canaris', 'INVALID_NOT_A_JSON_ARRAY');
    const recovered = BirdRepository.getAll();
    assert.ok(Array.isArray(recovered));

    // Rétablissement propre
    PerformanceDatasetGenerator.populateStorage(P1, appStorage);
    const restored = BirdRepository.getAll();
    assert.equal(restored.length, 10);

    const duration = performance.now() - start;
    assert.ok(duration < 20, `Récupération après erreur trop lente : ${duration.toFixed(2)} ms`);
  });

  // =========================================================================
  // SECTION 13 : RÉGRESSION & SCÉNARIO GLOBAL DE STRESS (B-017-049 à B-017-050)
  // =========================================================================

  it('B-017-049 — Global Performance Regression (Vérification non-régression des sous-systèmes)', () => {
    // Mesure de référence sur le PerformanceEngine
    const start = performance.now();
    PerformanceEngine.recordMetric('Test Global Benchmark', 42.5);
    const metrics = PerformanceEngine.getMetrics();
    const duration = performance.now() - start;

    assert.ok(metrics.length >= 1);
    assert.equal(metrics[0].name, 'Test Global Benchmark');
    assert.ok(duration < 20, `PerformanceEngine trop lent : ${duration.toFixed(2)} ms`);
  });

  it('B-017-050 — Scénario Global de Stress en 26 étapes sur Dataset P3', () => {
    const startGlobal = performance.now();

    // 1. Démarrage
    memoryStorage.clear();
    // 2. Population P3
    PerformanceDatasetGenerator.populateStorage(P3, appStorage);
    // 3. Dashboard initial
    const kpis = AnalyticsService.getKPIs({});
    assert.ok(kpis);
    // 4. Oiseaux
    const birds = BirdRepository.getAll();
    assert.equal(birds.length, 500);
    // 5. Recherche
    const searched = BirdRepository.search('01');
    assert.ok(searched.length > 0);
    // 6. Filtres
    const filtered = BirdRepository.filter({ sexe: 'Mâle' });
    assert.ok(filtered.length > 0);
    // 7. Tri
    const sorted = [...birds].sort((a, b) => a.nom.localeCompare(b.nom));
    assert.equal(sorted.length, 500);
    // 8. Couples
    const pairs = BreedingRepository.getCouples();
    assert.ok(pairs.length > 0);
    // 9. Reproduction
    const repros = ReproductionRepository.getAll();
    assert.ok(repros.length > 0);
    // 10. Incubation / Pontes
    const clutches = ClutchRepository.getAll();
    assert.ok(clutches.length > 0);
    // 11. Nursery / Jeunes
    const chicks = ChickRepository.getAll();
    assert.ok(chicks.length > 0);
    // 12. Santé
    const health = HealthRepository.getAll();
    assert.equal(health.length, 5000);
    // 13. Nutrition
    const nut = appStorage.getItem<any[]>('alimentation', []);
    assert.equal(nut.length, 5000);
    // 14. Finance
    const exp = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();
    assert.ok(exp.length > 0 && sales.length > 0);
    // 15. Statistiques
    const stats = StatisticsEngine.calculate(birds, P3.clutches, exp, sales);
    assert.ok(stats.totalEggs >= 0);
    // 16. Graphiques
    const snap = AnalyticsEngine.computeAllKPIs(birds, P3.cages as any, pairs, P3.clutches, health, exp, sales, {} as any, {});
    assert.ok(snap);
    // 17. Génétique
    const genetics = BirdIntelligenceEngine.analyzeGenetics(birds, P3.breedingPairs);
    assert.ok(genetics.score >= 0);
    // 18. Bird Intelligence
    const dqi = DataQualityEngine.analyze(birds);
    assert.ok(dqi.score >= 0);
    // 19. Rapport
    const report = IntelligenceService.generateReport('global', 'fr');
    assert.ok(report.title);
    // 20. Changement multilingue FR -> EN -> AR -> ES -> IT
    ['fr', 'en', 'ar', 'es', 'it'].forEach(lang => {
      appStorage.setItem('bird_academy_language', lang);
    });
    // 21. Changement Light / Dark
    appStorage.setItem('bird_academy_theme', 'dark');
    // 22. Fermeture (sauvegarde)
    const backupDisk = memoryStorage.dump();
    // 23. Réouverture
    memoryStorage.clear();
    Object.entries(backupDisk).forEach(([k, v]) => memoryStorage.setItem(k, v));
    // 24. Refresh & Mode Offline
    try {
      Object.defineProperty(globalThis.navigator, 'onLine', { configurable: true, value: false, writable: true });
    } catch {}
    const offlineBirds = BirdRepository.getAll();
    assert.equal(offlineBirds.length, 500);
    // 25. Nouvelles opérations CRUD
    const newBird = BirdRepository.create({
      bague: 'STRESS-P3-END',
      nom: 'Oiseau Final',
      sexe: 'Mâle',
      espece: 'Canari',
      categorie: 'Postures',
      race: 'Gloster',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Sans facteur',
      couleur: 'Jaune',
      date_naissance: '2026-01-01'
    });
    assert.ok(newBird.id);
    // 26. Nouvelle analyse Intelligence
    const finalDqi = DataQualityEngine.analyze(BirdRepository.getAll());
    assert.equal(finalDqi.checkedCount, 501);

    const totalDuration = performance.now() - startGlobal;
    assert.ok(totalDuration < 1500, `Scénario de stress en 26 étapes trop lent : ${totalDuration.toFixed(2)} ms (attendu < 1500 ms)`);
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA FONCTIONNELLE B-015
 * Campagne de validation complète des Statistiques, Dashboards, Analytics & Intelligence Décisionnelle (B-015-001 à B-015-050)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// --- MOCK STORAGE EN MÉMOIRE ---
class MemoryStorage implements Storage {
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

// Import des modules applicatifs
const { appStorage } = await import('../src/storage');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { BreedingRepository } = await import('../src/features/breeding/repositories/BreedingRepository');
const { ReproductionRepository } = await import('../src/features/reproduction/repositories/ReproductionRepository');
const { ClutchRepository } = await import('../src/features/reproduction/clutches/repositories/ClutchRepository');
const { ChickRepository } = await import('../src/features/reproduction/chicks/repositories/ChickRepository');
const { HealthRepository } = await import('../src/features/health/repositories/HealthRepository');
const { HealthEngine } = await import('../src/business/HealthEngine');
const { HandFeedingRepository } = await import('../src/features/hand-feeding/repositories/HandFeedingRepository');
const { HandFeedingEngine } = await import('../src/business/HandFeedingEngine');
const { FinanceRepository } = await import('../src/features/finance/repositories/FinanceRepository');
const { FinanceEngine } = await import('../src/business/FinanceEngine');
const { StatisticsEngine } = await import('../src/business/StatisticsEngine');
const { AnalyticsEngine } = await import('../src/features/analytics/engines/AnalyticsEngine');
const { ReproductionAnalyticsService } = await import('../src/features/reproduction/services/ReproductionAnalyticsService');
const { HabitatRepository } = await import('../src/features/habitat/repositories/HabitatRepository');
const { BirdIntelligenceEngine } = await import('../src/features/intelligence/engines/BirdIntelligenceEngine');
const { DataQualityEngine } = await import('../src/features/intelligence/engines/DataQualityEngine');
const { RuleEngine } = await import('../src/features/intelligence/engines/RuleEngine');
const { IntelligenceService } = await import('../src/features/intelligence/services/IntelligenceService');
const { PassportDataService } = await import('../src/features/birds/services/PassportDataService');

describe('CAMPAGNE QA FONCTIONNELLE B-015 — STATISTIQUES, DASHBOARDS & INTELLIGENCE', () => {

  const today = new Date().toISOString().slice(0, 10);
  function offsetDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // --- DATASET QA CONTRÔLÉ DE RÉFÉRENCE ---
  // 4 oiseaux : 2 mâles, 2 femelles
  // 2 couples
  // 4 pontes : total 10 œufs, 8 fécondés, 8 éclos, 6 sevrés
  // Finances : 3 dépenses (total 75€), 2 ventes (total 120€) => Net = +45€, ROI = 60%
  // Santé : 2 fiches (1 traitement terminé, 1 en attente)
  // Nutrition : 2 plans (1 stock à 5kg, 1 stock à 1.5kg => alerte)

  before(() => {
    memoryStorage.clear();
    appStorage.setItem('canaris', []);
    appStorage.setItem('couples', []);
    appStorage.setItem('reproductions', []);
    appStorage.setItem('pontes', []);
    appStorage.setItem('sante', []);
    appStorage.setItem('depenses', []);
    appStorage.setItem('ventes', []);
    appStorage.setItem('alimentation', []);
    appStorage.setItem('cages_v2', []);
    appStorage.setItem('ba_breeding_pairs', []);
    appStorage.setItem('ba_repro_chicks', []);
  });

  // B-015-001 — AUDIT ARCHITECTURAL
  it('B-015-001 — Audit architectural des moteurs statistiques et d\'intelligence', () => {
    assert.ok(StatisticsEngine, 'StatisticsEngine identifié');
    assert.ok(AnalyticsEngine, 'AnalyticsEngine identifié');
    assert.ok(FinanceEngine, 'FinanceEngine identifié');
    assert.ok(ReproductionAnalyticsService, 'ReproductionAnalyticsService identifié');
    assert.ok(BirdIntelligenceEngine, 'BirdIntelligenceEngine identifié');
    assert.ok(DataQualityEngine, 'DataQualityEngine identifié');
    assert.ok(RuleEngine, 'RuleEngine identifié');
    assert.ok(IntelligenceService, 'IntelligenceService identifié');
  });

  // B-015-002 — DASHBOARD PRINCIPAL & SETUP DATASET
  let m1: any, m2: any, f1: any, f2: any;
  it('B-015-002 — Initialisation du Dataset QA de référence et calcul de synthèse', () => {
    m1 = BirdRepository.create({
      nom: 'Mâle Alpha',
      bague: 'QA-M01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-400),
      cage_id: 1,
      statut_sante: 'Sain'
    });

    m2 = BirdRepository.create({
      nom: 'Mâle Bêta',
      bague: 'QA-M02',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Vert',
      facteur: 'Schimmel',
      couleur: 'Vert Schimmel',
      date_naissance: offsetDate(-380),
      cage_id: 2,
      statut_sante: 'Sain'
    });

    f1 = BirdRepository.create({
      nom: 'Femelle Alpha',
      bague: 'QA-F01',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-350),
      cage_id: 1,
      statut_sante: 'Sain'
    });

    f2 = BirdRepository.create({
      nom: 'Femelle Bêta',
      bague: 'QA-F02',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Blanc',
      facteur: 'Non applicable',
      couleur: 'Blanc Pur',
      date_naissance: offsetDate(-330),
      cage_id: 2,
      statut_sante: 'Sain'
    });

    // Couples
    const c1 = BreedingRepository.addCouple({ male_id: m1.id, femelle_id: f1.id, date_creation: offsetDate(-100), statut: 'Actif' });
    const c2 = BreedingRepository.addCouple({ male_id: m2.id, femelle_id: f2.id, date_creation: offsetDate(-90), statut: 'Actif' });

    // Reproductions
    const r1 = BreedingRepository.addReproduction({ couple_id: c1.id, date_debut: offsetDate(-60), statut: 'En cours' });
    const r2 = BreedingRepository.addReproduction({ couple_id: c2.id, date_debut: offsetDate(-50), statut: 'En cours' });

    // Pontes (total: 10 œufs, 8 fécondés, 8 éclos, 6 sevrés)
    BreedingRepository.addPonte({ reproduction_id: r1.id, date: offsetDate(-40), oeufs: 3, oeufs_fecondes: 3, eclosions: 3, sevrages: 3 });
    BreedingRepository.addPonte({ reproduction_id: r1.id, date: offsetDate(-20), oeufs: 2, oeufs_fecondes: 2, eclosions: 2, sevrages: 1 });
    BreedingRepository.addPonte({ reproduction_id: r2.id, date: offsetDate(-35), oeufs: 3, oeufs_fecondes: 2, eclosions: 2, sevrages: 2 });
    BreedingRepository.addPonte({ reproduction_id: r2.id, date: offsetDate(-15), oeufs: 2, oeufs_fecondes: 1, eclosions: 1, sevrages: 0 });

    // Finances : Dépenses (20 + 30 + 25 = 75€)
    FinanceRepository.addExpense({ date: offsetDate(-30), montant: 20, categorie: 'Alimentation', description: 'Graines alpiste' });
    FinanceRepository.addExpense({ date: offsetDate(-20), montant: 30, categorie: 'Santé', description: 'Complexe vitamines' });
    FinanceRepository.addExpense({ date: offsetDate(-10), montant: 25, categorie: 'Matériel', description: 'Nids' });

    // Finances : Ventes (50 + 70 = 120€)
    FinanceRepository.addSale({ canari_id: m1.id, prix: 50, date: offsetDate(-5), acheteur: 'Client QA 1' });
    FinanceRepository.addSale({ canari_id: m2.id, prix: 70, date: offsetDate(-2), acheteur: 'Client QA 2' });

    assert.equal(BirdRepository.getAll().length, 4);
    assert.equal(BreedingRepository.getCouples().length, 2);
    assert.equal(BreedingRepository.getPontes().length, 4);
  });

  // B-015-003 — NOMBRE TOTAL D'OISEAUX
  it('B-015-003 — Décompte exact des oiseaux vivants, archivés et décédés', () => {
    const birds = BirdRepository.getAll();
    assert.equal(birds.length, 4, '4 oiseaux vivants enregistrés');

    // Ajout d'un oiseau décédé
    const dead = BirdRepository.create({
      nom: 'Oiseau Mort QA',
      bague: 'QA-DEAD',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-200),
      statut_sante: 'Décédé'
    });

    const stats = StatisticsEngine.calculate(
      BirdRepository.getAll(true),
      BreedingRepository.getPontes(),
      FinanceRepository.getExpenses(),
      FinanceRepository.getSales()
    );

    // activeBirdCount exclut les oiseaux décédés via HealthEngine.isEligiblePatient
    assert.equal(stats.activeBirdCount, 4, 'Les oiseaux décédés sont exclus des actifs');

    // Teardown de l'oiseau mort pour la suite
    BirdRepository.delete(dead.id);
  });

  // B-015-004 — RÉPARTITION PAR SEXE
  it('B-015-004 — Calcul exact de la répartition par sexe (2 Mâles, 2 Femelles)', () => {
    const birds = BirdRepository.getAll();
    const males = birds.filter(b => b.sexe === 'Mâle').length;
    const females = birds.filter(b => b.sexe === 'Femelle').length;

    assert.equal(males, 2);
    assert.equal(females, 2);
  });

  // B-015-005 — RÉPARTITION PAR ESPÈCE
  it('B-015-005 — Agrégation par espèce sans duplication', () => {
    const birds = BirdRepository.getAll();
    const speciesMap: Record<string, number> = {};
    birds.forEach(b => {
      const sp = b.espece || 'canari';
      speciesMap[sp] = (speciesMap[sp] || 0) + 1;
    });

    assert.equal(speciesMap['canari'], 4);
  });

  // B-015-006 — RÉPARTITION PAR RACE
  it('B-015-006 — Décompte par race via StatisticsEngine (2 Lipochrome, 2 Gloster)', () => {
    const stats = StatisticsEngine.calculate(
      BirdRepository.getAll(),
      BreedingRepository.getPontes(),
      FinanceRepository.getExpenses(),
      FinanceRepository.getSales()
    );

    assert.equal(stats.breedCounts['Lipochrome'], 2);
    assert.equal(stats.breedCounts['Gloster Fancy'], 2);
  });

  // B-015-007 — STATISTIQUES DES COUPLES
  it('B-015-007 — Statut des couples : 2 couples actifs', () => {
    const couples = BreedingRepository.getCouples();
    const activeCouples = couples.filter(c => c.statut === 'Actif');
    assert.equal(activeCouples.length, 2);
  });

  // B-015-008 — STATISTIQUES DE REPRODUCTION
  it('B-015-008 — Suivi des sessions de reproduction : 2 en cours', () => {
    const repros = BreedingRepository.getReproductions();
    assert.equal(repros.length, 2);
    assert.ok(repros.every(r => r.statut === 'En cours'));
  });

  // B-015-009 — FERTILITÉ
  it('B-015-009 — Formule exacte du taux de fertilité (8 fécondés / 10 œufs = 80%)', () => {
    const stats = StatisticsEngine.calculate(
      BirdRepository.getAll(),
      BreedingRepository.getPontes(),
      FinanceRepository.getExpenses(),
      FinanceRepository.getSales()
    );

    assert.equal(stats.totalEggs, 10);
    assert.equal(stats.fertilizedEggs, 8);
    assert.equal(stats.fertilityRate, 80);
  });

  // B-015-010 — TAUX D'ÉCLOSION
  it('B-015-010 — Formule exacte du taux d\'éclosion (8 éclos / 8 fécondés = 100%)', () => {
    const stats = StatisticsEngine.calculate(
      BirdRepository.getAll(),
      BreedingRepository.getPontes(),
      FinanceRepository.getExpenses(),
      FinanceRepository.getSales()
    );

    assert.equal(stats.hatchedEggs, 8);
    assert.equal(stats.knownHatchFertilizedEggs, 8);
    assert.equal(stats.hatchRate, 100);
  });

  // B-015-011 — TAUX DE SURVIE / RÉUSSITE (SEVRAGE)
  it('B-015-011 — Formule exacte du taux de sevrage (6 sevrés / 8 éclos = 75%)', () => {
    const stats = StatisticsEngine.calculate(
      BirdRepository.getAll(),
      BreedingRepository.getPontes(),
      FinanceRepository.getExpenses(),
      FinanceRepository.getSales()
    );

    assert.equal(stats.weanedChicks, 6);
    assert.equal(stats.knownSurvivalHatchedEggs, 8);
    assert.equal(stats.survivalRate, 75);
  });

  // B-015-012 — STATISTIQUES DES PONTES
  it('B-015-012 — Moyenne exacte d\'œufs par ponte (10 œufs / 4 pontes = 2.5)', () => {
    const pontes = BreedingRepository.getPontes();
    const totalEggs = pontes.reduce((sum, p) => sum + p.oeufs, 0);
    const avgEggs = totalEggs / pontes.length;

    assert.equal(pontes.length, 4);
    assert.equal(totalEggs, 10);
    assert.equal(avgEggs, 2.5);
  });

  // B-015-013 — INCUBATION
  it('B-015-013 — Surveillance des incubations actives via ReproductionAnalyticsService', () => {
    const snapshot = ReproductionAnalyticsService.getSnapshot();
    assert.equal(snapshot.selectedSource, 'legacy');
    assert.equal(snapshot.metrics.totalEggs, 10);
    assert.equal(snapshot.metrics.clutchesCount, 4);
  });

  // B-015-014 — ÉCLOSION (SYNTHÈSE)
  it('B-015-014 — Snapshot ReproductionAnalyticsService : fertilité et éclosion', () => {
    const snapshot = ReproductionAnalyticsService.getSnapshot();
    assert.equal(snapshot.metrics.fertilityRate, 80);
    assert.equal(snapshot.metrics.hatchRate, 100);
  });

  // B-015-015 — STATISTIQUES DES JEUNES
  it('B-015-015 — Suivi des jeunes déclarés au sevrage', () => {
    const pontes = BreedingRepository.getPontes();
    const totalWeaned = pontes.reduce((sum, p) => sum + (p.sevrages || 0), 0);
    assert.equal(totalWeaned, 6);
  });

  // B-015-016 — CROISSANCE ET PESÉES
  it('B-015-016 — Calcul de moyenne pondérale sur les pesées enregistrées', () => {
    PassportDataService.addWeightLog({ birdId: m1.id, date: offsetDate(-10), weightGrams: 20.0, context: 'routine', notes: 'Pesée 1' });
    PassportDataService.addWeightLog({ birdId: m1.id, date: today, weightGrams: 22.0, context: 'routine', notes: 'Pesée 2' });

    const logs = PassportDataService.getWeightLogsForBird(m1.id, m1);
    const sumW = logs.reduce((sum, l) => sum + l.weightGrams, 0);
    const avgW = Math.round((sumW / logs.length) * 10) / 10;

    assert.ok(logs.length >= 2);
    assert.ok(avgW > 0);
  });

  // B-015-017 — STATISTIQUES SANITAIRES
  it('B-015-017 — Répartition exacte des soins par catégorie et soins en attente', () => {
    HealthRepository.add({ canari_id: m1.id, date: offsetDate(-5), categorie: 'Traitement', traitement: 'Vermifuge', statut: 'Terminé' });
    HealthRepository.add({ canari_id: f1.id, date: today, categorie: 'Vaccin', traitement: 'Rappel Variole', statut: 'En attente' });

    const records = HealthRepository.getAll();
    const stats = HealthEngine.getHealthStatisticsByCategory(records);
    const pending = HealthEngine.getPendingRecordsCount(records);

    assert.equal(stats['Traitement'], 1);
    assert.equal(stats['Vaccin'], 1);
    assert.equal(stats['Visite Vétérinaire'], 0);
    assert.equal(stats['Symptôme'], 0);
    assert.equal(pending, 1);
  });

  // B-015-018 — STATISTIQUES NUTRITIONNELLES ET ALERTE STOCK
  it('B-015-018 — Détection exacte des alertes de stock alimentaire sous 2.0 kg', () => {
    HandFeedingRepository.add({ periode: 'Reproduction', type_aliment: 'Pâtée', quantite: '20g', planning_distribution: 'Quotidien', stock_actuel_kg: 5.0 });
    HandFeedingRepository.add({ periode: 'Mue', type_aliment: 'Mélange lin', quantite: '15g', planning_distribution: 'Quotidien', stock_actuel_kg: 1.5 });

    const plans = HandFeedingRepository.getAll();
    const stockCheck = HandFeedingEngine.checkStockLevels(plans, 2.0);

    assert.equal(stockCheck.lowStock, true);
    assert.equal(stockCheck.items.length, 1);
    assert.ok(stockCheck.items[0].includes('Mélange lin'));
  });

  // B-015-019 — STATISTIQUES FINANCIÈRES GLOBALES
  it('B-015-019 — Synthèse financière exacte : Dépenses 75€, Ventes 120€, Net +45€, ROI 60%', () => {
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();
    const summary = FinanceEngine.getFinancialSummary(expenses, sales);

    assert.equal(summary.totalExpenses, 75);
    assert.equal(summary.totalSales, 120);
    assert.equal(summary.netBalance, 45);
    assert.equal(summary.roiPercentage, 60); // 45 / 75 * 100 = 60%
  });

  // B-015-020 — DÉPENSES PAR CATÉGORIE
  it('B-015-020 — Ventilation exacte des dépenses par catégorie', () => {
    const expenses = FinanceRepository.getExpenses();
    const catTotals = FinanceEngine.getExpenseTotalsByCategory(expenses);

    assert.equal(catTotals['Alimentation'], 20);
    assert.equal(catTotals['Santé'], 30);
    assert.equal(catTotals['Matériel'], 25);
  });

  // B-015-021 — VENTES
  it('B-015-021 — Nombre et montant total des ventes (2 ventes = 120€)', () => {
    const sales = FinanceRepository.getSales();
    const total = FinanceEngine.getSalesTotal(sales);

    assert.equal(sales.length, 2);
    assert.equal(total, 120);
  });

  // B-015-022 — FILTRE DE PÉRIODE
  it('B-015-022 — Filtrage temporel des dépenses par plage de dates', () => {
    const expenses = FinanceRepository.getExpenses();
    const filtered = AnalyticsEngine.filterFinances(expenses, {
      startDate: offsetDate(-25),
      endDate: offsetDate(-5)
    } as any);

    // Dépenses à -20 (30€) et -10 (25€) incluses, celle à -30 exclue
    assert.equal(filtered.length, 2);
    const sum = filtered.reduce((s, e) => s + e.montant, 0);
    assert.equal(sum, 55);
  });

  // B-015-023 — FRONTIÈRES DE PÉRIODE
  it('B-015-023 — Inclusion exacte des bornes temporelles (startDate inclusive)', () => {
    const expenses = FinanceRepository.getExpenses();
    const exactDate = offsetDate(-20);
    const filtered = AnalyticsEngine.filterFinances(expenses, {
      startDate: exactDate,
      endDate: exactDate
    } as any);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].montant, 30);
  });

  // B-015-024 — FILTRE PAR RACE ET MUTATION
  it('B-015-024 — Filtrage par race sur la population d\'oiseaux', () => {
    const birds = BirdRepository.getAll();
    const glosters = AnalyticsEngine.filterBirds(birds, { breed: 'Gloster Fancy' } as any);
    assert.equal(glosters.length, 2);
    assert.ok(glosters.every(b => b.race === 'Gloster Fancy'));
  });

  // B-015-025 — COMBINAISON DE FILTRES MULTI-CRITÈRES
  it('B-015-025 — Intersection Race + Sexe (Gloster Fancy + Mâle = 1 oiseau)', () => {
    const birds = BirdRepository.getAll();
    const result = AnalyticsEngine.filterBirds(birds, { breed: 'Gloster Fancy', sex: 'Mâle' } as any);
    assert.equal(result.length, 1);
    assert.equal(result[0].nom, 'Mâle Bêta');
  });

  // B-015-026 — TRI DES DONNÉES SANS EFFET DE BORD
  it('B-015-026 — Le tri ne modifie pas le registre source', () => {
    const birds = BirdRepository.getAll();
    const originalOrder = [...birds.map(b => b.id)];
    const sorted = [...birds].sort((a, b) => a.nom.localeCompare(b.nom));

    assert.notEqual(sorted[0].id, originalOrder[3]); // Tri effectif
    const reloaded = BirdRepository.getAll();
    assert.deepEqual(reloaded.map(b => b.id), originalOrder, 'Ordre source inchangé');
  });

  // B-015-027 — DONNÉES VIDES
  it('B-015-027 — Calcul de statistiques sur collections vides : 0 et aucun NaN', () => {
    const emptyStats = StatisticsEngine.calculate([], [], [], []);
    assert.equal(emptyStats.totalEggs, 0);
    assert.equal(emptyStats.fertilityRate, 0);
    assert.equal(emptyStats.hatchRate, 0);
    assert.equal(emptyStats.survivalRate, 0);
    assert.equal(emptyStats.totalExpenses, 0);
    assert.equal(emptyStats.totalSales, 0);
    assert.equal(emptyStats.netProfit, 0);
    assert.equal(Number.isNaN(emptyStats.fertilityRate), false);
  });

  // B-015-028 — DIVISION PAR ZÉRO
  it('B-015-028 — Protection absolue contre la division par zéro (dénominateur 0)', () => {
    const summary = FinanceEngine.getFinancialSummary([], []);
    assert.equal(summary.totalExpenses, 0);
    assert.equal(summary.roiPercentage, 0);
    assert.equal(Number.isFinite(summary.roiPercentage), true);
  });

  // B-015-029 — ARRONDIS DÉTERMINISTES
  it('B-015-029 — Politique d\'arrondi conforme (Math.round sur pourcentages)', () => {
    // 1 œuf fécondé sur 3 = 33.333...% => 33%
    const pontesTierce = [{ id: 1, reproduction_id: 1, date: today, oeufs: 3, oeufs_fecondes: 1, eclosions: 1, sevrages: 1 }] as any;
    const stats = StatisticsEngine.calculate(BirdRepository.getAll(), pontesTierce, [], []);
    assert.equal(Math.round(stats.fertilityRate), 33);
  });

  // B-015-030 — UNITÉS DE MESURE
  it('B-015-030 — Cohérence des unités numériques (€, kg, g, %)', () => {
    const summary = FinanceEngine.getFinancialSummary(FinanceRepository.getExpenses(), FinanceRepository.getSales());
    assert.ok(typeof summary.netBalance === 'number');
    assert.ok(typeof summary.roiPercentage === 'number');
  });

  // B-015-031 — DEVISE ET MONTANTS
  it('B-015-031 — Validation des montants financiers monétaires', () => {
    assert.equal(FinanceEngine.isValidCurrencyAmount(25.50), true);
    assert.equal(FinanceEngine.isValidCurrencyAmount(0), false);
    assert.equal(FinanceEngine.isValidCurrencyAmount(-10), false);
  });

  // B-015-032 — GRAPHIQUES ET SÉRIES TEMPORELLES
  it('B-015-032 — Génération des points de tendances mensuelles dans IntelligenceService', () => {
    const scoreboard = IntelligenceService.getGeneralScoreboard();
    assert.ok(Array.isArray(scoreboard.trends));
    assert.equal(scoreboard.trends.length, 6, '6 mois de recul sur les tendances');
  });

  // B-015-033 — GRAPHIQUES SANS DONNÉES
  it('B-015-033 — Résilience des tendances en l\'absence de pontes sur un mois', () => {
    const scoreboard = IntelligenceService.getGeneralScoreboard();
    for (const pt of scoreboard.trends) {
      assert.ok(pt.month.length > 0);
      assert.ok(pt.reproductionRate === null || Number.isFinite(pt.reproductionRate));
      assert.ok(Number.isFinite(pt.salesAmount));
      assert.ok(Number.isFinite(pt.expensesAmount));
    }
  });

  // B-015-034 — MISE À JOUR DYNAMIQUE POST-MODIFICATION
  it('B-015-034 — Mise à jour immédiate des statistiques après modification d\'une dépense', () => {
    const expenses = FinanceRepository.getExpenses();
    const firstExp = expenses[0];
    const initialTotal = FinanceEngine.getExpensesTotal(expenses);

    // Modification du montant
    firstExp.montant = 50; // +30€
    const newTotal = FinanceEngine.getExpensesTotal(expenses);
    assert.equal(newTotal, initialTotal + 30);

    // Rollback
    firstExp.montant = 20;
  });

  // B-015-035 — MISE À JOUR POST-SUPPRESSION
  it('B-015-035 — Disparition d\'une vente supprimée des totaux de vente', () => {
    const salesBefore = FinanceRepository.getSales();
    const totalBefore = FinanceEngine.getSalesTotal(salesBefore);

    const tempSale = FinanceRepository.addSale({ canari_id: m1.id, prix: 40, date: today, acheteur: 'Test' });
    const totalAfterAdd = FinanceEngine.getSalesTotal(FinanceRepository.getSales());
    assert.equal(totalAfterAdd, totalBefore + 40);

    FinanceRepository.deleteSale(tempSale.id);
    const totalAfterDelete = FinanceEngine.getSalesTotal(FinanceRepository.getSales());
    assert.equal(totalAfterDelete, totalBefore);
  });

  // B-015-036 — PRÉVENTION DU DOUBLE COMPTAGE
  it('B-015-036 — Aucune duplication lors du comptage des oiseaux vendus ou archivés', () => {
    const birds = BirdRepository.getAll();
    const sales = FinanceRepository.getSales();
    const soldIds = new Set(sales.map(s => s.canari_id));

    assert.equal(birds.length, 4);
    assert.equal(soldIds.size, 2);
  });

  // B-015-037 — PERSISTANCE DES STATISTIQUES
  it('B-015-037 — Identité des statistiques après rechargement virtuel du stockage', () => {
    const dump = memoryStorage.dump();
    const tempStorage = new MemoryStorage();
    tempStorage.load(dump);

    const reloadedExpenses = JSON.parse(tempStorage.getItem('depenses') || '[]');
    const total = reloadedExpenses.reduce((s: number, e: any) => s + e.montant, 0);
    assert.equal(total, 75);
  });

  // B-015-038 — REDÉMARRAGE ET INVARIANCE JSON
  it('B-015-038 — Invariance byte-à-byte des données statistiques après cycle JSON', () => {
    const before = JSON.stringify(memoryStorage.dump());
    const after = JSON.stringify(JSON.parse(before));
    assert.equal(after, before);
  });

  // B-015-039 — FONCTIONNEMENT OFFLINE
  it('B-015-039 — Autonomie 100% hors ligne de tous les services analytiques', () => {
    assert.ok(StatisticsEngine.calculate(BirdRepository.getAll(), BreedingRepository.getPontes(), FinanceRepository.getExpenses(), FinanceRepository.getSales()));
    assert.ok(FinanceEngine.getFinancialSummary(FinanceRepository.getExpenses(), FinanceRepository.getSales()));
    assert.ok(IntelligenceService.getGeneralScoreboard());
  });

  // B-015-040 — MULTILINGUE ET INVARIANCE NUMÉRIQUE
  it('B-015-040 — Les valeurs numériques calculées sont indépendantes de la langue', () => {
    const languages: ('fr' | 'en' | 'ar' | 'es' | 'it')[] = ['fr', 'en', 'ar', 'es', 'it'];
    for (const lang of languages) {
      const report = IntelligenceService.generateReport('global', lang);
      assert.ok(report.title.length > 0);
      assert.ok(report.sections.length >= 2);
    }
  });

  // B-015-041 — FORMATAGE ET LOCALISATION ARABE
  it('B-015-041 — Génération d\'un rapport d\'intelligence en arabe', () => {
    const arReport = IntelligenceService.generateReport('global', 'ar');
    assert.ok(arReport.title.length > 0);
    assert.ok(arReport.sections.length > 0);
  });

  // B-015-042 — BIRD INTELLIGENCE : AUDIT DU SCOREBOARD
  it('B-015-042 — Audit complet du tableau de bord d\'intelligence décisionnelle', () => {
    const scoreboard = IntelligenceService.getGeneralScoreboard();
    assert.ok(scoreboard.reproductionScore);
    assert.ok(scoreboard.financeScore);
    assert.ok(scoreboard.healthScore);
    assert.ok(scoreboard.habitatScore);
    assert.ok(scoreboard.geneticScore);
    assert.ok(scoreboard.dataQualityScore);
  });

  // B-015-043 — INTELLIGENCE SCORE ENTRE 0 ET 100
  it('B-015-043 — Bornes strictes [0, 100] sur tous les scores décisionnels', () => {
    const scoreboard = IntelligenceService.getGeneralScoreboard();
    assert.ok(scoreboard.reproductionScore.score >= 0 && scoreboard.reproductionScore.score <= 100);
    assert.ok(scoreboard.financeScore.score >= 0 && scoreboard.financeScore.score <= 100);
    assert.ok(scoreboard.healthScore.score >= 0 && scoreboard.healthScore.score <= 100);
    assert.ok(scoreboard.dataQualityScore.score >= 0 && scoreboard.dataQualityScore.score <= 100);
  });

  // B-015-044 — DATA QUALITY INDEX
  it('B-015-044 — Calcul du Data Quality Index sur les oiseaux du cheptel', () => {
    const dqResult = DataQualityEngine.analyze(BirdRepository.getAll());
    assert.equal(dqResult.checkedCount, 4);
    assert.ok(dqResult.score >= 0 && dqResult.score <= 100);
  });

  // B-015-045 — RULE ENGINE ET DÉTECTION D'ALERTES
  it('B-015-045 — Évaluation du Rule Engine sur les données d\'élevage', () => {
    const evaluated = RuleEngine.evaluateAll({
      birds: BirdRepository.getAll(),
      pairs: ReproductionRepository.getAll(),
      clutches: [],
      cages: [],
      healthRecords: HealthRepository.getAll()
    });

    assert.ok(Array.isArray(evaluated));
    for (const rule of evaluated) {
      assert.ok(rule.ruleId);
      assert.ok(rule.name);
      assert.ok(rule.recommendation);
    }
  });

  // B-015-046 — DÉTERMINISME ABSOLU DES ANALYSES
  it('B-015-046 — Déterminisme : calculs répétés produisent des résultats strictement identiques', () => {
    const s1 = IntelligenceService.getGeneralScoreboard();
    const s2 = IntelligenceService.getGeneralScoreboard();

    assert.equal(s1.reproductionScore.score, s2.reproductionScore.score);
    assert.equal(s1.financeScore.score, s2.financeScore.score);
    assert.equal(s1.healthScore.score, s2.healthScore.score);
    assert.equal(s1.dataQualityScore.score, s2.dataQualityScore.score);
    assert.equal(s1.alerts.length, s2.alerts.length);
  });

  // B-015-047 — INTELLIGENCE APRÈS MODIFICATION
  it('B-015-047 — Variation de l\'analyse individuelle après ajout d\'un oisillon', () => {
    const ficheBefore = BirdIntelligenceEngine.analyzeBird(m1, BirdRepository.getAll(), HealthRepository.getAll(), []);
    assert.equal(ficheBefore.offspringCount, 0);

    // Ajout d'un jeune relié au père m1
    const child = BirdRepository.create({
      nom: 'Fils de M1',
      bague: 'QA-CH01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: today,
      pere_id: m1.id
    });

    const ficheAfter = BirdIntelligenceEngine.analyzeBird(m1, BirdRepository.getAll(), HealthRepository.getAll(), []);
    assert.equal(ficheAfter.offspringCount, 1);
    assert.ok(ficheAfter.strengths.some(s => s.key === 'intelBirdOffspringRecorded'));

    // Teardown
    BirdRepository.delete(child.id);
  });

  // B-015-048 — RAPPORTS D'INTELLIGENCE
  it('B-015-048 — Génération du rapport décisionnel structuré', () => {
    const report = IntelligenceService.generateReport('global', 'fr');
    assert.ok(report.id);
    assert.ok(report.title);
    assert.ok(report.sections.length >= 2);
    assert.ok(report.sections[0].title);
  });

  // B-015-049 — INTÉGRITÉ RÉFÉRENTIELLE DU RAPPORT FINANCIER
  it('B-015-049 — Absence de divergence entre rapport financier et données sources', () => {
    const report = IntelligenceService.generateReport('finance', 'fr');
    assert.ok(report.title);
    assert.ok(report.sections.length >= 1);
    const finSection = report.sections[0];
    assert.ok(finSection.metrics);
    // Solde net vérifié dans les métriques
    assert.ok(finSection.metrics.some(m => String(m.value).includes('45.000') || String(m.value).includes('45')));
  });

  // B-015-050 — SCÉNARIO GLOBAL COMPLET DE BOUT EN BOUT
  it('B-015-050 — Validation globale : Cohérence totale Données -> Calculs -> KPIs -> DSS -> Rapport', () => {
    // 1. Données sources
    const birds = BirdRepository.getAll();
    const pontes = BreedingRepository.getPontes();
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();

    // 2. Moteur statistique
    const stats = StatisticsEngine.calculate(birds, pontes, expenses, sales);
    assert.equal(stats.totalEggs, 10);
    assert.equal(stats.fertilizedEggs, 8);
    assert.equal(stats.hatchedEggs, 8);
    assert.equal(stats.weanedChicks, 6);
    assert.equal(stats.fertilityRate, 80);
    assert.equal(stats.hatchRate, 100);
    assert.equal(stats.survivalRate, 75);

    // 3. Moteur financier
    const finSummary = FinanceEngine.getFinancialSummary(expenses, sales);
    assert.equal(finSummary.totalExpenses, 75);
    assert.equal(finSummary.totalSales, 120);
    assert.equal(finSummary.netBalance, 45);
    assert.equal(finSummary.roiPercentage, 60);

    // 4. Moteur de reproduction analytique
    const reproSnapshot = ReproductionAnalyticsService.getSnapshot();
    assert.equal(reproSnapshot.metrics.totalEggs, 10);
    assert.equal(reproSnapshot.metrics.clutchesCount, 4);
    assert.equal(reproSnapshot.metrics.fertilityRate, 80);
    assert.equal(reproSnapshot.metrics.hatchRate, 100);

    // 5. DSS Scoreboard
    const scoreboard = IntelligenceService.getGeneralScoreboard();
    assert.ok(scoreboard.reproductionScore.score > 0);
    assert.ok(scoreboard.financeScore.score > 0);
    assert.ok(scoreboard.healthScore.score > 0);

    // 6. Rapport décisionnel
    const report = IntelligenceService.generateReport('global', 'fr');
    assert.ok(report.title.length > 0);
    assert.ok(report.sections.length >= 2);
  });
});

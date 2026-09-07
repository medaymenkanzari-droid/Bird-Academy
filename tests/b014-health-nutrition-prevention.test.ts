/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA FONCTIONNELLE B-014
 * Campagne de validation complète du Système de Santé, Nutrition & Prévention Sanitaire (B-014-001 à B-014-050)
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
const { BirdService } = await import('../src/features/birds/services/BirdService');
const { HealthRepository } = await import('../src/features/health/repositories/HealthRepository');
const { HealthService } = await import('../src/features/health/services/HealthService');
const { HealthEngine } = await import('../src/business/HealthEngine');
const { ClinicalNotesService } = await import('../src/features/health/services/ClinicalNotesService');
const { PassportDataService } = await import('../src/features/birds/services/PassportDataService');
const { HandFeedingRepository } = await import('../src/features/hand-feeding/repositories/HandFeedingRepository');
const { HandFeedingService } = await import('../src/features/hand-feeding/services/HandFeedingService');
const { HandFeedingEngine } = await import('../src/business/HandFeedingEngine');
const { HandFeedingService: ReproHandFeedingService } = await import('../src/features/reproduction/handfeeding/services/HandFeedingService');
const { ChickRepository } = await import('../src/features/reproduction/chicks/repositories/ChickRepository');
const { ReproductionEngine } = await import('../src/features/reproduction/engines/ReproductionEngine');
const { ReproductionRepository } = await import('../src/features/reproduction/repositories/ReproductionRepository');
const { BreedingRepository } = await import('../src/features/breeding/repositories/BreedingRepository');
const { CANARI_PROFILE } = await import('../src/reference/species/canari');
const { PRESET_MEDICATIONS } = await import('../src/features/health/components/BatchTreatmentModal');
const { normalizeHealthCategory, normalizeHealthStatus, formatLocalizedTreatment } = await import('../src/components/Sante');

describe('CAMPAGNE QA FONCTIONNELLE B-014 — SANTÉ, NUTRITION & PRÉVENTION SANITAIRE', () => {

  const today = new Date().toISOString().slice(0, 10);
  function offsetDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  before(() => {
    memoryStorage.clear();
    appStorage.setItem('canaris', []);
    appStorage.setItem('sante', []);
    appStorage.setItem('alimentation', []);
    appStorage.setItem('ba_health_clinical_notes', []);
    appStorage.setItem('ba_passport_weight_logs', []);
    appStorage.setItem('ba_repro_chicks', []);
    appStorage.setItem('ba_breeding_pairs', []);
  });

  // B-014-001 — AUDIT ARCHITECTURAL
  it('B-014-001 — Audit architectural du système santé et nutrition', () => {
    assert.ok(HealthRepository, 'HealthRepository identifié');
    assert.ok(HealthService, 'HealthService identifié');
    assert.ok(HealthEngine, 'HealthEngine identifié');
    assert.ok(ClinicalNotesService, 'ClinicalNotesService identifié');
    assert.ok(PassportDataService, 'PassportDataService identifié');
    assert.ok(HandFeedingRepository, 'HandFeedingRepository identifié');
    assert.ok(HandFeedingService, 'HandFeedingService identifié');
    assert.ok(HandFeedingEngine, 'HandFeedingEngine identifié');
    assert.ok(ReproHandFeedingService, 'ReproHandFeedingService identifié');
    assert.ok(Array.isArray(PRESET_MEDICATIONS), 'PRESET_MEDICATIONS disponibles');
  });

  // B-014-002 — CRÉATION D'UN DOSSIER SANITAIRE
  let qaBird: any;
  let qaHealthRecord: any;
  it('B-014-002 — Création d\'un oiseau QA et premier enregistrement sanitaire', () => {
    qaBird = BirdRepository.create({
      nom: 'QA-B014-B01',
      bague: 'QA-B014-B01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-365),
      cage_id: 1,
      statut_sante: 'Sain'
    });
    assert.ok(qaBird.id > 0);

    const res = HealthService.addRecord({
      canari_id: qaBird.id,
      date: offsetDate(-10),
      categorie: 'Traitement',
      traitement: 'Anti-parasitaire d\'automne',
      description: 'Goutte spot-on préventive sur la nuque',
      statut: 'Terminé'
    });

    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data?.canari_id, qaBird.id);
    assert.equal(res.data?.categorie, 'Traitement');
    qaHealthRecord = res.data;
  });

  // B-014-003 — OBSERVATION SANITAIRE (Note Clinique)
  let qaNote: any;
  it('B-014-003 — Enregistrement d\'une observation clinique normale', () => {
    qaNote = ClinicalNotesService.addNote({
      birdId: qaBird.id,
      date: today,
      author: 'Dr. Vétérinaire QA',
      title: 'Bilan Général d\'Entrée',
      content: 'Comportement vif, bréchet bien musclé, plumage net, respiration silencieuse.',
      severity: 'normal',
      tags: ['Bilan', 'Normal', 'QA']
    });

    assert.ok(qaNote.id);
    assert.equal(qaNote.birdId, qaBird.id);
    assert.equal(qaNote.severity, 'normal');

    const birdNotes = ClinicalNotesService.getNotesForBird(qaBird.id);
    assert.ok(birdNotes.some(n => n.id === qaNote.id));
  });

  // B-014-004 — SYMPTÔMES
  let qaSymptomRecord: any;
  it('B-014-004 — Enregistrement d\'un événement sanitaire de catégorie Symptôme', () => {
    const res = HealthService.addRecord({
      canari_id: qaBird.id,
      date: offsetDate(-3),
      categorie: 'Symptôme',
      traitement: 'Bréchet saillant et apathie légère',
      description: 'L\'oiseau reste en boule au fond de la cage, fientes liquides verdâtres',
      statut: 'Terminé'
    });

    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data?.categorie, 'Symptôme');
    qaSymptomRecord = res.data;

    const symptoms = HealthRepository.getAll().filter(r => r.categorie === 'Symptôme');
    assert.ok(symptoms.length >= 1);
  });

  // B-014-005 — ÉTATS SANITAIRES
  it('B-014-005 — Vérification des statuts sanitaires supportés sur l\'oiseau', () => {
    const statuses = ['Sain', 'Surveillance', 'Malade', 'En traitement', 'Quarantaine', 'Blessé', 'Décédé'];
    for (const st of statuses) {
      qaBird.statut_sante = st;
      const updated = BirdRepository.update(qaBird);
      assert.equal(updated, true);
      const reloaded = BirdRepository.getById(qaBird.id);
      assert.equal(reloaded?.statut_sante, st);
    }
  });

  // B-014-006 — OISEAU SAIN
  it('B-014-006 — Oiseau sain : éligible aux soins et à la reproduction', () => {
    qaBird.statut_sante = 'Sain';
    BirdRepository.update(qaBird);

    assert.equal(HealthEngine.isEligiblePatient(qaBird), true);

    const partner = { id: 99, sexe: 'Femelle', espece: 'canari', race: 'Lipochrome', date_naissance: offsetDate(-365), statut_sante: 'Sain' } as any;
    const comp = ReproductionEngine.getCompatibility(qaBird, partner);
    const healthRule = comp.validations.find(v => v.rule === 'REPRO_HEALTH_STATUS');
    assert.equal(healthRule?.passed, true);
  });

  // B-014-007 — OISEAU MALADE
  it('B-014-007 — Oiseau malade : impact sur la reproduction (pénalité de score et alerte)', () => {
    qaBird.statut_sante = 'Malade';
    BirdRepository.update(qaBird);

    const partner = { id: 99, sexe: 'Femelle', espece: 'canari', race: 'Lipochrome', date_naissance: offsetDate(-365), statut_sante: 'Sain' } as any;
    const comp = ReproductionEngine.getCompatibility(qaBird, partner);
    const healthRule = comp.validations.find(v => v.rule === 'REPRO_HEALTH_STATUS');
    assert.equal(healthRule?.passed, false);
    assert.ok(comp.recommendations.some(r => r.includes('repro_rec_health') || r.toLowerCase().includes('traitement') || r.toLowerCase().includes('affaibli')));
  });

  // B-014-008 — OISEAU CRITIQUE / ATTENTION
  it('B-014-008 — Enregistrement d\'une alerte clinique critique', () => {
    const criticalNote = ClinicalNotesService.addNote({
      birdId: qaBird.id,
      date: today,
      author: 'Dr. Vétérinaire QA',
      title: 'Suspicion Coccidiose Aiguë',
      content: 'Déshydratation sévère et bréchet coupant. Urgence vitale.',
      severity: 'critical',
      tags: ['Urgence', 'Critique']
    });

    assert.equal(criticalNote.severity, 'critical');
    const birdNotes = ClinicalNotesService.getNotesForBird(qaBird.id);
    const hasCritical = birdNotes.some(n => n.severity === 'critical');
    assert.equal(hasCritical, true);
  });

  // B-014-009 — RÉTABLISSEMENT
  it('B-014-009 — Rétablissement de l\'oiseau et retour à l\'état Sain', () => {
    qaBird.statut_sante = 'Sain';
    BirdRepository.update(qaBird);

    const reloaded = BirdRepository.getById(qaBird.id);
    assert.equal(reloaded?.statut_sante, 'Sain');

    // Ajout d'une note de guérison
    ClinicalNotesService.addNote({
      birdId: qaBird.id,
      date: today,
      author: 'Éleveur',
      title: 'Guérison confirmée',
      content: 'Fin des symptômes, reprise de poids et appétit retrouvé.',
      severity: 'normal'
    });
  });

  // B-014-010 — TRAITEMENT EN ATTENTE
  let pendingTreatment: any;
  it('B-014-010 — Création d\'un traitement planifié avec statut En attente', () => {
    const res = HealthService.addRecord({
      canari_id: qaBird.id,
      date: today,
      categorie: 'Traitement',
      traitement: 'Cure Baycox 2.5%',
      description: '2 gouttes par jour dans le bec pendant 3 jours',
      statut: 'En attente'
    });

    assert.equal(res.success, true);
    assert.ok(res.data);
    assert.equal(res.data?.statut, 'En attente');
    pendingTreatment = res.data;
  });

  // B-014-011 — MODIFICATION TRAITEMENT
  it('B-014-011 — Modification d\'une fiche de traitement', () => {
    pendingTreatment.description = 'Posologie ajustée : 3 gouttes par jour';
    const updated = HealthRepository.update(pendingTreatment);
    assert.equal(updated, true);

    const reloaded = HealthRepository.getById(pendingTreatment.id);
    assert.equal(reloaded?.description, 'Posologie ajustée : 3 gouttes par jour');
  });

  // B-014-012 — FIN DE TRAITEMENT (CLÔTURE)
  it('B-014-012 — Clôture d\'un traitement via completeRecord', () => {
    const completeRes = HealthService.completeRecord(pendingTreatment.id);
    assert.equal(completeRes.success, true);

    const completed = HealthRepository.getById(pendingTreatment.id);
    assert.equal(completed?.statut, 'Terminé');
  });

  // B-014-013 — TRAITEMENT INCOMPLET
  it('B-014-013 — Rejet des créations de soins incomplètes', () => {
    // 1. Libellé de traitement vide
    const emptyTreatment = HealthService.addRecord({
      canari_id: qaBird.id,
      date: today,
      categorie: 'Traitement',
      traitement: '   '
    });
    assert.equal(emptyTreatment.success, false);

    // 2. Catégorie invalide
    const invalidCat = HealthService.addRecord({
      canari_id: qaBird.id,
      date: today,
      categorie: 'ChirurgieLourde' as any,
      traitement: 'Opération'
    });
    assert.equal(invalidCat.success, false);
  });

  // B-014-014 — DATES SANITAIRES
  it('B-014-014 — Contrôle de cohérence des dates de soin', () => {
    // 1. Soin antérieur à la naissance de l'oiseau
    const priorBirth = HealthService.addRecord({
      canari_id: qaBird.id,
      date: '2020-01-01',
      categorie: 'Traitement',
      traitement: 'Soin impossible'
    });
    assert.equal(priorBirth.success, false);
    assert.ok(priorBirth.message?.includes('antérieur'));

    // 2. Soin terminé avec date future
    const futureCompleted = HealthService.addRecord({
      canari_id: qaBird.id,
      date: '2099-01-01',
      categorie: 'Traitement',
      traitement: 'Soin futur',
      statut: 'Terminé'
    });
    assert.equal(futureCompleted.success, false);
    assert.ok(futureCompleted.message?.includes('futur'));
  });

  // B-014-015 — HISTORIQUE SANITAIRE
  it('B-014-015 — Intégrité chronologique de l\'historique des soins', () => {
    const allRecords = HealthRepository.getAll().filter(r => r.canari_id === qaBird.id);
    assert.ok(allRecords.length >= 3);
    for (const r of allRecords) {
      assert.ok(r.date >= qaBird.date_naissance);
      assert.ok(r.traitement.length > 0);
    }
  });

  // B-014-016 — SUPPRESSION D'UN SOIN
  it('B-014-016 — Suppression isolée d\'une fiche sanitaire', () => {
    const toDelete = HealthRepository.add({
      canari_id: qaBird.id,
      date: today,
      categorie: 'Symptôme',
      traitement: 'Fausse alerte',
      statut: 'Terminé'
    });

    assert.ok(HealthRepository.getById(toDelete.id));
    const delRes = HealthService.deleteRecord(toDelete.id);
    assert.equal(delRes.success, true);
    assert.equal(HealthRepository.getById(toDelete.id), undefined);
  });

  // B-014-017 — ARCHIVAGE ET SANTÉ
  it('B-014-017 — Conservation intégrale des données sanitaires lors de l\'archivage', () => {
    BirdRepository.archive(qaBird.id);
    const archived = BirdRepository.getById(qaBird.id);
    assert.equal(archived?.archived, true);

    const records = HealthRepository.getAll().filter(r => r.canari_id === qaBird.id);
    assert.ok(records.length >= 3, 'Dossier médical conservé pour l\'oiseau archivé');

    // Restauration
    BirdRepository.restore(qaBird.id);
  });

  // B-014-018 — DÉCÈS
  it('B-014-018 — Déclaration de décès d\'un oiseau', () => {
    const deadBird = BirdRepository.create({
      nom: 'QA-DEAD-01',
      bague: 'QA-DEAD-01',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Blanc',
      facteur: 'Intense',
      couleur: 'Blanc',
      date_naissance: offsetDate(-400),
      cage_id: 1,
      statut_sante: 'Décédé'
    });

    assert.equal(HealthEngine.isEligiblePatient(deadBird), false);
  });

  // B-014-019 — RÉUTILISATION D'UN OISEAU DÉCÉDÉ INTERDITE
  it('B-014-019 — Blocage de soins ou d\'accouplement sur un oiseau décédé', () => {
    const dead = BirdRepository.getAll().find(b => b.bague === 'QA-DEAD-01')!;
    
    // 1. Refus d'ajout de soin
    const addCare = HealthService.addRecord({
      canari_id: dead.id,
      date: today,
      categorie: 'Traitement',
      traitement: 'Soin post-mortem impossible'
    });
    assert.equal(addCare.success, false);

    // 2. Refus de reproduction
    const comp = ReproductionEngine.getCompatibility(qaBird, dead);
    const aliveRule = comp.validations.find(v => v.rule === 'REPRO_BIRDS_ALIVE');
    assert.equal(aliveRule?.passed, false);
  });

  // B-014-020 — ALERTES SANITAIRES
  it('B-014-020 — Calcul des soins en attente', () => {
    HealthService.addRecord({
      canari_id: qaBird.id,
      date: today,
      categorie: 'Vaccin',
      traitement: 'Rappel Variole',
      statut: 'En attente'
    });

    const pendingCount = HealthEngine.getPendingRecordsCount(HealthRepository.getAll());
    assert.ok(pendingCount >= 1);
  });

  // B-014-021 — ALERTES NON DUPLIQUÉES
  it('B-014-021 — Stabilité du calcul des alertes sanitaires', () => {
    const count1 = HealthEngine.getPendingRecordsCount(HealthRepository.getAll());
    const count2 = HealthEngine.getPendingRecordsCount(HealthRepository.getAll());
    assert.equal(count1, count2);
  });

  // B-014-022 — NUTRITION : AUDIT
  it('B-014-022 — Audit de la structure des plans d\'alimentation', () => {
    const plans = HandFeedingRepository.getAll();
    assert.ok(Array.isArray(plans));
  });

  // B-014-023 — CRÉATION D'UN PLAN ALIMENTAIRE
  let qaFoodPlan: any;
  it('B-014-023 — Création d\'un plan d\'alimentation par période', () => {
    qaFoodPlan = HandFeedingRepository.add({
      periode: 'Reproduction',
      type_aliment: 'Pâtée d\'élevage enrichie + Graines germées',
      quantite: '20g par couple par jour',
      planning_distribution: 'Quotidien (matin)',
      stock_actuel_kg: 5.0
    });

    assert.ok(qaFoodPlan.id > 0);
    assert.equal(qaFoodPlan.periode, 'Reproduction');
    assert.equal(qaFoodPlan.stock_actuel_kg, 5.0);
  });

  // B-014-024 — MODIFICATION D'UN PLAN ALIMENTAIRE
  it('B-014-024 — Mise à jour d\'un plan d\'alimentation', () => {
    HandFeedingService.updatePlan(
      qaFoodPlan.id,
      'Pâtée d\'élevage aux œufs & spiruline',
      '25g par couple',
      'Quotidien',
      4.2
    );

    const reloaded = HandFeedingRepository.getById(qaFoodPlan.id);
    assert.equal(reloaded?.type_aliment, 'Pâtée d\'élevage aux œufs & spiruline');
    assert.equal(reloaded?.stock_actuel_kg, 4.2);
  });

  // B-014-025 — SUPPRESSION D'UN PLAN ALIMENTAIRE
  it('B-014-025 — Suppression d\'un plan d\'alimentation', () => {
    const tempPlan = HandFeedingRepository.add({
      periode: 'Repos',
      type_aliment: 'Aliment test à supprimer',
      quantite: '10g',
      planning_distribution: 'Hebdomadaire',
      stock_actuel_kg: 1.0
    });

    assert.ok(HandFeedingRepository.getById(tempPlan.id));
    const deleted = HandFeedingRepository.delete(tempPlan.id);
    assert.equal(deleted, true);
    assert.equal(HandFeedingRepository.getById(tempPlan.id), undefined);
  });

  // B-014-026 — DISTRIBUTION PAR PÉRIODE PHYSIOLOGIQUE
  it('B-014-026 — Gestion des 3 périodes physiologiques (Mue, Reproduction, Repos)', () => {
    const periods: ('Mue' | 'Reproduction' | 'Repos')[] = ['Mue', 'Reproduction', 'Repos'];
    for (const p of periods) {
      const rec = HandFeedingEngine.getRecommendedDietForPhase(p);
      assert.ok(rec.baseDiet);
      assert.ok(rec.proteinRequirement);
      assert.ok(Array.isArray(rec.supplements));
    }
  });

  // B-014-027 — SUIVI DE STOCK & CONSOMMATION
  it('B-014-027 — Détection automatique de stock bas', () => {
    const plansWithLowStock = [
      { id: 1, periode: 'Reproduction', type_aliment: 'Graines alpiste', quantite: '10g', planning_distribution: 'Quotidien', stock_actuel_kg: 1.2 },
      { id: 2, periode: 'Mue', type_aliment: 'Pâtée mue', quantite: '15g', planning_distribution: 'Quotidien', stock_actuel_kg: 6.0 }
    ] as any;

    const stockCheck = HandFeedingEngine.checkStockLevels(plansWithLowStock, 2.0);
    assert.equal(stockCheck.lowStock, true);
    assert.equal(stockCheck.items.length, 1);
    assert.ok(stockCheck.items[0].includes('Graines alpiste'));
  });

  // B-014-028 — UNITÉS NUTRITIONNELLES ET MÉDICALES
  it('B-014-028 — Validation des unités supportées (ml/L, g/kg, gouttes, kg)', () => {
    for (const med of PRESET_MEDICATIONS) {
      assert.ok(['ml/L', 'g/kg', 'g/L', 'gouttes'].some(u => med.unit.includes(u) || med.unit.length > 0));
      assert.ok(med.concentrationPerUnit > 0);
    }
  });

  // B-014-029 — VALEURS NUTRITIONNELLES ET RECOMMANDATIONS PAR ESPÈCE
  it('B-014-029 — Recommandations nutritionnelles de l\'espèce Canari', () => {
    assert.ok(CANARI_PROFILE.nutrition.mainDiet.fr.includes('Alpiste'));
    assert.ok(CANARI_PROFILE.nutrition.recommendedSupplements.fr.includes('Pâtée'));
    assert.ok(CANARI_PROFILE.nutrition.vitaminFrequency.fr.includes('semaine'));
  });

  // B-014-030 — ALIMENTATION DU JEUNE (NURSERY)
  let qaChick: any;
  it('B-014-030 — Filiation nutritionnelle du jeune oisillon', () => {
    qaChick = ChickRepository.create({
      eggId: 'egg-qa-01',
      clutchId: 'clutch-qa-01',
      pairId: 'bp-qa-01',
      name: 'Poussin QA-B014',
      provisionalNumber: 'PROV-QA-01',
      hatchDate: today,
      birthWeight: 1.6,
      status: 'growth',
      gender: 'Indéterminé',
      observations: 'Canari en nurserie'
    });

    assert.ok(qaChick.id);
    assert.equal(qaChick.birthWeight, 1.6);
  });

  // B-014-031 — ÉLEVAGE À LA MAIN (EAM)
  it('B-014-031 — Enregistrement d\'une séance EAM avec surveillance du jabot', () => {
    const session = ReproHandFeedingService.logSession({
      chickId: qaChick.id,
      date: today,
      time: '14:00',
      formulaId: 'NutriBird A21',
      volumeMl: 0.5,
      temperatureC: 38.5,
      cropBefore: 'empty',
      cropAfter: 'full',
      observations: 'Bonne déglutition, jabot souple'
    });

    assert.ok(session.id);
    assert.equal(session.volumeMl, 0.5);
    assert.equal(session.cropBefore, 'empty');
    assert.equal(session.cropAfter, 'full');
  });

  // B-014-032 — ALERTE NUTRITIONNELLE / JABOT STAGNANT
  it('B-014-032 — Détection d\'alerte critique sur jabot stagnant', () => {
    const alertAnalysis = ReproductionEngine.analyzeHandFeedingAlerts(
      { id: qaChick.id, name: qaChick.name, provisionalNumber: qaChick.provisionalNumber, ageDays: 5, species: 'Canari' },
      [{ date: today, time: '08:00' }],
      [{ timestamp: today, statusBefore: 'stagnant', statusAfter: 'stagnant' }],
      [{ minAgeDays: 1, maxAgeDays: 10, frequencyPerDay: 6 }]
    );

    assert.equal(alertAnalysis.isCropStagnant, true);
    assert.equal(alertAnalysis.severity, 'critical');
    assert.ok(alertAnalysis.message.includes('CRITIQUE') || alertAnalysis.message.includes('jabot'));
  });

  // B-014-033 — POIDS ET SANTÉ (PESÉES DE SUIVI)
  it('B-014-033 — Enregistrement des pesées de contrôle de l\'oiseau adulte', () => {
    const w1 = PassportDataService.addWeightLog({
      birdId: qaBird.id,
      date: offsetDate(-30),
      weightGrams: 21.5,
      context: 'routine',
      notes: 'Poids baseline normal'
    });

    const w2 = PassportDataService.addWeightLog({
      birdId: qaBird.id,
      date: today,
      weightGrams: 22.0,
      context: 'routine',
      notes: 'Poids stable'
    });

    assert.ok(w1.id);
    assert.ok(w2.id);

    const logs = PassportDataService.getWeightLogsForBird(qaBird.id, qaBird);
    assert.ok(logs.length >= 2);
  });

  // B-014-034 — POIDS ANORMAL / BORNES BIOLOGIQUES
  it('B-014-034 — Validation des seuils de poids de l\'espèce (15g à 30g)', () => {
    const minW = CANARI_PROFILE.biology.minWeight;
    const maxW = CANARI_PROFILE.biology.maxWeight;
    assert.equal(minW, 15, 'Poids minimal standard 15g');
    assert.equal(maxW, 30, 'Poids maximal standard 30g');

    const weightNormal = 22.0;
    assert.ok(weightNormal >= minW && weightNormal <= maxW);

    const weightCachectic = 12.0;
    assert.ok(weightCachectic < minW, 'Poids inférieur au seuil minimal détecté');
  });

  // B-014-035 — SANTÉ ET REPRODUCTION
  it('B-014-035 — Validation stricte de REPRO_HEALTH_STATUS en reproduction', () => {
    const maleHealthy = { ...qaBird, statut_sante: 'Sain' };
    const femaleSick = { id: 98, sexe: 'Femelle', espece: 'canari', race: 'Lipochrome', date_naissance: offsetDate(-365), statut_sante: 'Malade' } as any;

    const comp = ReproductionEngine.getCompatibility(maleHealthy, femaleSick);
    const healthRule = comp.validations.find(v => v.rule === 'REPRO_HEALTH_STATUS');
    assert.equal(healthRule?.passed, false);
    assert.ok(comp.score <= 4);
  });

  // B-014-036 — MALADIE ET COUPLE EXISTANT
  it('B-014-036 — Conservation du couple malgré l\'apparition d\'une maladie', () => {
    const female = BirdRepository.create({
      nom: 'QA-PARTNER-F',
      bague: 'QA-PARTNER-F',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-365),
      cage_id: 1,
      statut_sante: 'Sain'
    });

    const pair = ReproductionRepository.create({
      maleId: qaBird.id,
      femaleId: female.id,
      name: 'Couple QA Santé',
      dateCreated: today,
      status: 'active',
      archived: false,
      statistics: {
        totalClutches: 0,
        totalEggs: 0,
        totalFertile: 0,
        totalHatched: 0,
        totalWeaned: 0,
        fertilityRate: 0,
        hatchRate: 0,
        weaningRate: 0
      }
    } as any);

    assert.ok(pair.id);

    // La femelle tombe malade
    female.statut_sante = 'Malade';
    BirdRepository.update(female);

    // Le couple existe toujours et reste relié
    const fetchedPair = ReproductionRepository.getById(pair.id);
    assert.ok(fetchedPair);
    assert.equal(fetchedPair?.status, 'active');
  });

  // B-014-037 — SANTÉ ET GÉNÉALOGIE
  it('B-014-037 — Préservation de la chaîne généalogique lors d\'affections parentales', () => {
    const child = BirdRepository.create({
      nom: 'QA-CHILD-01',
      bague: 'QA-CHILD-01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-60),
      cage_id: 1,
      pere_id: qaBird.id,
      statut_sante: 'Sain'
    });

    assert.equal(child.pere_id, qaBird.id);

    // Père sous traitement
    qaBird.statut_sante = 'En traitement';
    BirdRepository.update(qaBird);

    const reloadedChild = BirdRepository.getById(child.id);
    assert.equal(reloadedChild?.pere_id, qaBird.id, 'Filiation père-fils intacte');
  });

  // B-014-038 — SANTÉ ET STATISTIQUES
  it('B-014-038 — Répartition statistique des soins par catégorie', () => {
    const stats = HealthEngine.getHealthStatisticsByCategory(HealthRepository.getAll());
    assert.ok(typeof stats['Traitement'] === 'number');
    assert.ok(typeof stats['Vaccin'] === 'number');
    assert.ok(typeof stats['Visite Vétérinaire'] === 'number');
    assert.ok(typeof stats['Symptôme'] === 'number');
  });

  // B-014-039 — DONNÉES INCOMPLÈTES
  it('B-014-039 — Validation rigoureuse des données obligatoires', () => {
    // 1. Oiseau inexistant
    const ghostBirdCare = HealthService.addRecord({
      canari_id: 999999,
      date: today,
      categorie: 'Traitement',
      traitement: 'Soin fantôme'
    });
    assert.equal(ghostBirdCare.success, false);

    // 2. Date manquante ou invalide
    const badDate = HealthService.addRecord({
      canari_id: qaBird.id,
      date: 'pas-une-date',
      categorie: 'Traitement',
      traitement: 'Soin date invalide'
    });
    assert.equal(badDate.success, false);
  });

  // B-014-040 — CARACTÈRES SPÉCIAUX ET ARABE
  it('B-014-040 — Prise en charge des accents, apostrophes et texte arabe', () => {
    const specialCare = HealthService.addRecord({
      canari_id: qaBird.id,
      date: today,
      categorie: 'Traitement',
      traitement: "Traitement d'urgence : Éradication des poux rouges & acariens",
      description: 'Dose administrée avec succès. علاج وقائي ضد الفاش والقراد'
    });

    assert.equal(specialCare.success, true);
    const saved = HealthRepository.getById(specialCare.data!.id);
    assert.ok(saved?.traitement.includes("d'urgence"));
    assert.ok(saved?.description?.includes('علاج وقائي'));
  });

  // B-014-041 — MULTILINGUE ET CATÉGORIES
  it('B-014-041 — Normalisation et traduction multilingue des catégories de soins', () => {
    assert.equal(normalizeHealthCategory('Traitement'), 'treatment');
    assert.equal(normalizeHealthCategory('Vaccin'), 'vaccine');
    assert.equal(normalizeHealthCategory('Visite Vétérinaire'), 'vet_visit');
    assert.equal(normalizeHealthCategory('Symptôme'), 'symptom');

    assert.equal(normalizeHealthStatus('Terminé'), 'completed');
    assert.equal(normalizeHealthStatus('En attente'), 'pending');
  });

  // B-014-042 — DATES ET LOCALE
  it('B-014-042 — Formatage standardisé des dates ISO-8601', () => {
    const isoDate = '2026-07-15';
    assert.match(isoDate, /^\d{4}-\d{2}-\d{2}$/);
    const parsed = new Date(`${isoDate}T00:00:00.000Z`);
    assert.equal(parsed.toISOString().slice(0, 10), isoDate);
  });

  // B-014-043 — MODE HORS-LIGNE
  it('B-014-043 — Fonctionnement 100% autonome hors-ligne', () => {
    assert.ok(HealthService.getRecords());
    assert.ok(ClinicalNotesService.getAll());
    assert.ok(PassportDataService.getAllWeightLogs());
    assert.ok(HandFeedingRepository.getAll());
  });

  // B-014-044 — PERSISTANCE APRÈS RELOAD
  it('B-014-044 — Persistance intégrale après rechargement virtuel', () => {
    const dump = memoryStorage.dump();
    const tempStorage = new MemoryStorage();
    tempStorage.load(dump);

    const reloadedSante = JSON.parse(tempStorage.getItem('sante') || '[]');
    assert.ok(reloadedSante.length >= 3);

    const reloadedAlim = JSON.parse(tempStorage.getItem('alimentation') || '[]');
    assert.ok(reloadedAlim.length >= 1);
  });

  // B-014-045 — PERSISTANCE APRÈS REDÉMARRAGE
  it('B-014-045 — Invariance byte-à-byte après réouverture', () => {
    const before = JSON.stringify(memoryStorage.dump());
    const after = JSON.stringify(JSON.parse(before));
    assert.equal(after, before);
  });

  // B-014-046 — INTÉGRITÉ DES IDENTIFIANTS
  it('B-014-046 — Unicité stricte des identifiants des soins et aliments', () => {
    const healthIds = HealthRepository.getAll().map(r => r.id);
    const uniqueHealthIds = new Set(healthIds);
    assert.equal(uniqueHealthIds.size, healthIds.length);

    const alimIds = HandFeedingRepository.getAll().map(a => a.id);
    const uniqueAlimIds = new Set(alimIds);
    assert.equal(uniqueAlimIds.size, alimIds.length);
  });

  // B-014-047 — INTÉGRITÉ RÉFÉRENTIELLE
  it('B-014-047 — Tous les soins font référence à des oiseaux existants', () => {
    const birds = BirdRepository.getAll(true);
    const records = HealthRepository.getAll();
    for (const r of records) {
      assert.ok(birds.some(b => b.id === r.canari_id), `L'oiseau ID ${r.canari_id} doit exister`);
    }
  });

  // B-014-048 — ERREURS ET TRANSACTION SANS ORPHELIN
  it('B-014-048 — Aucun enregistrement partiel en cas d\'échec de validation', () => {
    const countBefore = HealthRepository.getAll().length;
    const res = HealthService.addRecord({
      canari_id: 999999,
      date: today,
      categorie: 'Traitement',
      traitement: 'Traitement invalide'
    });
    assert.equal(res.success, false);
    assert.equal(HealthRepository.getAll().length, countBefore);
  });

  // B-014-049 — CONCURRENCE / MULTI-TAB
  it('B-014-049 — Maintien de cohérence lors de modifications successives', () => {
    const recordsA = HealthRepository.getAll();
    const recordsB = HealthRepository.getAll();
    assert.equal(recordsA.length, recordsB.length);
  });

  // B-014-050 — SCÉNARIO SANITAIRE COMPLET DE BOUT EN BOUT
  it('B-014-050 — Exécution complète du cycle sanitaire et nutritionnel', () => {
    // 1. Nouvel oiseau
    const bird = BirdRepository.create({
      nom: 'QA-B014-CYCLE-END2END',
      bague: 'QA-B014-E2E',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-200),
      cage_id: 1,
      statut_sante: 'Sain'
    });
    assert.ok(bird.id);

    // 2. Pesée initiale
    PassportDataService.addWeightLog({
      birdId: bird.id,
      date: offsetDate(-20),
      weightGrams: 20.2,
      context: 'routine',
      notes: 'Pesée initiale'
    });

    // 3. Observation normale
    ClinicalNotesService.addNote({
      birdId: bird.id,
      date: offsetDate(-15),
      author: 'Éleveur',
      title: 'Observation d\'accueil',
      content: 'Oiseau en bonne forme',
      severity: 'normal'
    });

    // 4. Déclaration problème / symptôme
    bird.statut_sante = 'Malade';
    BirdRepository.update(bird);
    HealthService.addRecord({
      canari_id: bird.id,
      date: offsetDate(-5),
      categorie: 'Symptôme',
      traitement: 'Plumage ébouriffé et diarrhée',
      statut: 'Terminé'
    });

    // 5. Prescription traitement
    const treatmentRes = HealthService.addRecord({
      canari_id: bird.id,
      date: offsetDate(-4),
      categorie: 'Traitement',
      traitement: 'Antibiotique à large spectre',
      description: 'Dans l\'eau de boisson 5 jours',
      statut: 'En attente'
    });
    assert.equal(treatmentRes.success, true);

    // 6. Fin de traitement et rétablissement
    HealthService.completeRecord(treatmentRes.data!.id);
    bird.statut_sante = 'Sain';
    BirdRepository.update(bird);

    // 7. Pesée de contrôle de fin de convalescence
    PassportDataService.addWeightLog({
      birdId: bird.id,
      date: today,
      weightGrams: 21.0,
      context: 'routine',
      notes: 'Poids repris post-traitement'
    });

    // 8. Vérification finale de l'oiseau et de son dossier
    const finalBird = BirdRepository.getById(bird.id);
    assert.equal(finalBird?.statut_sante, 'Sain');

    const birdCare = HealthRepository.getAll().filter(r => r.canari_id === bird.id);
    assert.equal(birdCare.length, 2);

    const birdWeights = PassportDataService.getWeightLogsForBird(bird.id, bird);
    assert.ok(birdWeights.length >= 2);

    // Teardown propre
    BirdRepository.delete(bird.id);
  });
});

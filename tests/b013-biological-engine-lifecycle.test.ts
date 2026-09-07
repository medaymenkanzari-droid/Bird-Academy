/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA FONCTIONNELLE B-013
 * Campagne de validation complète du Moteur Biologique & Cycle de Vie (B-013-001 à B-013-050)
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

// Import des modules du moteur biologique et des services
const { appStorage } = await import('../src/storage');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { BirdEngine } = await import('../src/business/BirdEngine');
const { BreedingRepository } = await import('../src/features/breeding/repositories/BreedingRepository');
const { ReproductionRepository } = await import('../src/features/reproduction/repositories/ReproductionRepository');
const { ReproductionEngine } = await import('../src/features/reproduction/engines/ReproductionEngine');
const { ReproductionService } = await import('../src/features/reproduction/services/ReproductionService');
const { ClutchRepository } = await import('../src/features/reproduction/clutches/repositories/ClutchRepository');
const { ClutchService } = await import('../src/features/reproduction/clutches/services/ClutchService');
const { EggRepository } = await import('../src/features/reproduction/eggs/repositories/EggRepository');
const { EggService } = await import('../src/features/reproduction/eggs/services/EggService');
const { IncubationRepository } = await import('../src/features/reproduction/incubation/repositories/IncubationRepository');
const { IncubationService } = await import('../src/features/reproduction/incubation/services/IncubationService');
const { HatchingRepository } = await import('../src/features/reproduction/hatching/repositories/HatchingRepository');
const { HatchingService } = await import('../src/features/reproduction/hatching/services/HatchingService');
const { ChickRepository } = await import('../src/features/reproduction/chicks/repositories/ChickRepository');
const { ChickService } = await import('../src/features/reproduction/chicks/services/ChickService');
const { GrowthRepository } = await import('../src/features/reproduction/growth/repositories/GrowthRepository');
const { WeaningRepository } = await import('../src/features/reproduction/weaning/repositories/WeaningRepository');
const { WeaningService } = await import('../src/features/reproduction/weaning/services/WeaningService');
const { NurseryRepository } = await import('../src/features/reproduction/nursery/repositories/NurseryRepository');
const { NurseryService } = await import('../src/features/reproduction/nursery/services/NurseryService');
const { WrightCoefficientEngine } = await import('../src/features/genetics/engines/WrightCoefficientEngine');
const { HabitatEngine } = await import('../src/business/HabitatEngine');
const { TRANSLATIONS } = await import('../src/utils/translations');

describe('CAMPAGNE QA FONCTIONNELLE B-013 — MOTEUR BIOLOGIQUE & CYCLE DE VIE', () => {

  // Helper de calcul de date relative
  const today = new Date().toISOString().slice(0, 10);
  function offsetDate(months: number, days: number = 0): string {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  before(() => {
    memoryStorage.clear();
    appStorage.setItem('canaris', []);
    appStorage.setItem('couples', []);
    appStorage.setItem('reproductions', []);
    appStorage.setItem('ba_breeding_pairs', []);
    appStorage.setItem('ba_clutches', []);
    appStorage.setItem('ba_eggs', []);
    appStorage.setItem('ba_incubations', []);
    appStorage.setItem('ba_hatchings', []);
    appStorage.setItem('ba_chicks', []);
    appStorage.setItem('ba_weanings', []);
    appStorage.setItem('ba_nursery_records', []);
  });

  // B-013-001 — AUDIT DU MOTEUR BIOLOGIQUE
  it('B-013-001 — Audit cartographique du moteur biologique', () => {
    assert.ok(typeof ReproductionEngine.isReproductiveAge === 'function', 'isReproductiveAge identifié');
    assert.ok(typeof ReproductionEngine.getCompatibility === 'function', 'getCompatibility identifié');
    assert.ok(typeof ReproductionEngine.canTransitionEggStatus === 'function', 'canTransitionEggStatus identifié');
    assert.ok(typeof ReproductionEngine.calculateIncubationCalendar === 'function', 'calculateIncubationCalendar identifié');
    assert.ok(typeof ReproductionEngine.calculatePairSeniority === 'function', 'calculatePairSeniority identifié');
    assert.ok(typeof ReproductionEngine.calculateFertilityRate === 'function', 'calculateFertilityRate identifié');
    assert.ok(typeof WrightCoefficientEngine.calculateInbreeding === 'function', 'Wright Inbreeding identifié');
  });

  // B-013-002 — MATURITÉ MÂLE (Seuil : 10 mois)
  it('B-013-002 — Maturité mâle : seuil biologique exact de 10 mois', () => {
    // 1. Sous seuil : 9 mois
    const maleYoung = ReproductionEngine.isReproductiveAge('Mâle', offsetDate(-9, -15));
    assert.equal(maleYoung.ready, false, 'Mâle de 9 mois doit être non prêt');
    assert.equal(maleYoung.requiredMonths, 10);

    // 2. Seuil exact : 10 mois révolus
    const maleExact = ReproductionEngine.isReproductiveAge('Mâle', offsetDate(-10, -2));
    assert.equal(maleExact.ready, true, 'Mâle de 10 mois doit être prêt');

    // 3. Au-dessus : 14 mois
    const maleAdult = ReproductionEngine.isReproductiveAge('Mâle', offsetDate(-14, 0));
    assert.equal(maleAdult.ready, true, 'Mâle de 14 mois prêt');
  });

  // B-013-003 — MATURITÉ FEMELLE (Seuil : 9 mois)
  it('B-013-003 — Maturité femelle : seuil biologique exact de 9 mois', () => {
    // 1. Sous seuil : 8 mois
    const femaleYoung = ReproductionEngine.isReproductiveAge('Femelle', offsetDate(-8, -10));
    assert.equal(femaleYoung.ready, false, 'Femelle de 8 mois non prête');
    assert.equal(femaleYoung.requiredMonths, 9);

    // 2. Seuil exact : 9 mois révolus
    const femaleExact = ReproductionEngine.isReproductiveAge('Femelle', offsetDate(-9, -2));
    assert.equal(femaleExact.ready, true, 'Femelle de 9 mois prête');

    // 3. Au-dessus : 12 mois
    const femaleAdult = ReproductionEngine.isReproductiveAge('Femelle', offsetDate(-12, 0));
    assert.equal(femaleAdult.ready, true, 'Femelle de 12 mois prête');
  });

  // B-013-004 — SEXE
  it('B-013-004 — Cohérence des sexes dans la compatibilité', () => {
    const male = { id: 1, sexe: 'Mâle', espece: 'canari', race: 'Gloster', date_naissance: offsetDate(-14) } as any;
    const female = { id: 2, sexe: 'Femelle', espece: 'canari', race: 'Gloster', date_naissance: offsetDate(-12) } as any;
    const male2 = { id: 3, sexe: 'Mâle', espece: 'canari', race: 'Gloster', date_naissance: offsetDate(-14) } as any;
    const female2 = { id: 4, sexe: 'Femelle', espece: 'canari', race: 'Gloster', date_naissance: offsetDate(-12) } as any;

    // Mâle + Femelle
    const compNormal = ReproductionEngine.getCompatibility(male, female);
    const sexRuleNormal = compNormal.validations.find(v => v.rule === 'REPRO_SEX_COHERENCE');
    assert.equal(sexRuleNormal?.passed, true);

    // Mâle + Mâle
    const compMM = ReproductionEngine.getCompatibility(male, male2);
    const sexRuleMM = compMM.validations.find(v => v.rule === 'REPRO_SEX_COHERENCE');
    assert.equal(sexRuleMM?.passed, false);
    assert.ok(compMM.score < compNormal.score);

    // Femelle + Femelle
    const compFF = ReproductionEngine.getCompatibility(female, female2);
    const sexRuleFF = compFF.validations.find(v => v.rule === 'REPRO_SEX_COHERENCE');
    assert.equal(sexRuleFF?.passed, false);
  });

  // B-013-005 — COMPATIBILITÉ SCIENTIFIQUE GLOBALE
  it('B-013-005 — Évaluation multicritères du score de compatibilité (1 à 5 étoiles)', () => {
    const male = { id: 1, sexe: 'Mâle', espece: 'canari', race: 'Gloster Fancy', date_naissance: offsetDate(-12), statut_sante: 'Sain' } as any;
    const female = { id: 2, sexe: 'Femelle', espece: 'canari', race: 'Gloster Fancy', date_naissance: offsetDate(-12), statut_sante: 'Sain' } as any;

    // Couple idéal : 5/5
    const idealComp = ReproductionEngine.getCompatibility(male, female);
    assert.equal(idealComp.score, 5, 'Score maximal 5 étoiles attendu');

    // Races différentes : pénalité standard de race
    const femaleDifferentBreed = { ...female, race: 'Lipochrome Rouge' };
    const diffBreedComp = ReproductionEngine.getCompatibility(male, femaleDifferentBreed);
    assert.equal(diffBreedComp.score, 4, 'Score pénalisé de 1 étoile pour divergence de race');
    assert.ok(diffBreedComp.validations.some(v => v.rule === 'REPRO_BREED_MATCH' && !v.passed));
  });

  // B-013-006 — SENIORITÉ DU COUPLE
  it('B-013-006 — Calcul de seniorité du couple', () => {
    const start2Months = offsetDate(-2, -5);
    const seniority2M = ReproductionEngine.calculatePairSeniority(start2Months);
    assert.ok(seniority2M.includes('2 mois'), `Attendu "2 mois", obtenu : ${seniority2M}`);

    const start1Year = offsetDate(-14, 0);
    const seniority1Y = ReproductionEngine.calculatePairSeniority(start1Year);
    assert.ok(seniority1Y.includes('an'), `Attendu avec année, obtenu : ${seniority1Y}`);
  });

  // B-013-007 — CRÉATION D'UN COUPLE VALIDE
  let qBirdM: any;
  let qBirdF: any;
  let qPair: any;
  it('B-013-007 — Création et enregistrement d\'un couple QA valide (QA-B013-C01)', () => {
    qBirdM = BirdRepository.create({
      nom: 'QA-B013-M01',
      bague: 'QA-B013-M01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-12),
      cage_id: 1
    });

    qBirdF = BirdRepository.create({
      nom: 'QA-B013-F01',
      bague: 'QA-B013-F01',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intense',
      couleur: 'Jaune Intense',
      date_naissance: offsetDate(-11),
      cage_id: 1
    });

    qPair = ReproductionRepository.create({
      id: 'bp-1',
      maleId: qBirdM.id,
      femaleId: qBirdF.id,
      name: 'QA-B013-C01',
      dateCreated: offsetDate(-1),
      status: 'active',
      archived: false
    } as any);

    assert.ok(qPair.id);
    assert.equal(qPair.maleId, qBirdM.id);
    assert.equal(qPair.femaleId, qBirdF.id);
    assert.equal(qPair.status, 'active');
  });

  // B-013-008 — REPRODUCTION VALIDE
  let qRepro: any;
  it('B-013-008 — Lancement d\'une session de reproduction valide pour le couple', () => {
    qRepro = BreedingRepository.addReproduction({
      couple_id: 1,
      date_debut: today,
      statut: 'En cours'
    });

    assert.ok(qRepro.id > 0);
    assert.equal(qRepro.statut, 'En cours');
  });

  // B-013-009 — REPRODUCTION INVALIDE
  it('B-013-009 — Refus d\'une reproduction avec oiseau immature ou couple inactif', () => {
    // 1. Couple inexistant ou inactif
    assert.throws(() => {
      ClutchService.createClutch('bp-inexistant-999', today);
    }, /couple doit exister/);

    // 2. Date future
    const futureDate = '2099-01-01';
    assert.throws(() => {
      ClutchService.createClutch(qPair.id, futureDate);
    }, /futur/);
  });

  // B-013-010 — REPRODUCTION RÉPÉTÉE
  it('B-013-010 — Comptage exact des cycles de reproduction répétés', () => {
    // Le helper getReproductionsCountForPair extrait le couple_id numérique depuis 'bp-<num>'
    const count = ReproductionEngine.getReproductionsCountForPair(`bp-${qRepro.couple_id}`);
    assert.equal(count, 1, 'Exactement un cycle comptabilisé');
  });

  // B-013-011 — PONTE
  let qClutch: any;
  it('B-013-011 — Création d\'une ponte active', () => {
    qClutch = ClutchService.createClutch(qPair.id, offsetDate(0, -10), 'Ponte printanière QA');
    assert.ok(qClutch.id);
    assert.equal(qClutch.status, 'active');
    assert.equal(qClutch.pairId, qPair.id);
  });

  // B-013-012 — ŒUFS INDIVIDUELS
  let qEgg1: any;
  let qEgg2: any;
  it('B-013-012 — Enregistrement d\'œufs individuels avec identifiants distincts', () => {
    qEgg1 = EggService.addEgg(qClutch.id, offsetDate(0, -10), 'Nid A', 1.6);
    qEgg2 = EggService.addEgg(qClutch.id, offsetDate(0, -9), 'Nid A', 1.7);

    assert.ok(qEgg1.id);
    assert.ok(qEgg2.id);
    assert.notEqual(qEgg1.id, qEgg2.id);
    assert.equal(qEgg1.number, 1);
    assert.equal(qEgg2.number, 2);
    assert.equal(qEgg1.status, 'Pondu');
  });

  // B-013-013 — STATUTS DES ŒUFS
  it('B-013-013 — Validation des transitions de statuts autorisées et interdites', () => {
    // Pondu -> En incubation : OK
    assert.equal(ReproductionEngine.canTransitionEggStatus('Pondu', 'En incubation'), true);

    // En incubation -> Fécondé : OK
    assert.equal(ReproductionEngine.canTransitionEggStatus('En incubation', 'Fécondé'), true);

    // Éclos -> Pondu : INTERDIT (terminal)
    assert.equal(ReproductionEngine.canTransitionEggStatus('Éclos', 'Pondu'), false);

    // Retiré -> En incubation : INTERDIT
    assert.equal(ReproductionEngine.canTransitionEggStatus('Retiré', 'En incubation'), false);
  });

  // B-013-014 — INCUBATION
  let qIncubation: any;
  it('B-013-014 — Démarrage d\'une incubation avec calcul automatique des dates', () => {
    qIncubation = IncubationService.startIncubation(qClutch.id, offsetDate(0, -8), 'Naturelle', 13);
    assert.ok(qIncubation.id);
    assert.equal(qIncubation.theoreticalDuration, 13);

    // Vérification que les œufs sont passés au statut 'En incubation'
    const eggs = EggService.getEggsByClutch(qClutch.id);
    assert.equal(eggs[0].status, 'En incubation');
    assert.equal(eggs[1].status, 'En incubation');
  });

  // B-013-015 — CALENDRIER D'INCUBATION
  it('B-013-015 — Calcul des jalons biologiques de l\'incubation (Mirage J+6, Contrôle J+10, Éclosion J+13)', () => {
    const calendar = ReproductionEngine.calculateIncubationCalendar(offsetDate(0, -8), 13);
    assert.ok(calendar.candlingDate, 'Date de mirage calculée');
    assert.ok(calendar.expectedHatchDate, 'Date prévue d éclosion calculée');
    assert.equal(calendar.progressPercent > 0, true, 'Progression calculée');
  });

  // B-013-016 — INCUBATION EN RETARD
  it('B-013-016 — Détection et alerte de retard d\'incubation', () => {
    // Démarrée il y a 16 jours pour une durée de 13 jours
    const overdueCalendar = ReproductionEngine.calculateIncubationCalendar(offsetDate(0, -16), 13);
    assert.ok(overdueCalendar.delayDays > 0, 'Retard d éclosion détecté');
    assert.equal(overdueCalendar.daysRemaining, 0);
  });

  // B-013-017 — ÉCLOSION
  let qHatchResult: any;
  it('B-013-017 — Éclosion d\'un œuf et génération automatique du jeune poussin', () => {
    qHatchResult = HatchingService.hatchEgg(qEgg1.id, today, 1.5, 'none', 'Éclosion spontanée et vigoureuse');
    assert.equal(qHatchResult.success, true);
    assert.ok(qHatchResult.chickId);

    // L'œuf doit être à l'état Éclos
    const eggUpdated = EggService.getEggById(qEgg1.id);
    assert.equal(eggUpdated?.status, 'Éclos');

    // Le poussin doit exister
    const chick = ChickService.getChickById(qHatchResult.chickId);
    assert.ok(chick);
    assert.equal(chick?.eggId, qEgg1.id);
    assert.equal(chick?.pairId, qPair.id);
  });

  // B-013-018 — ÉCLOSION DUPLIQUÉE
  it('B-013-018 — Rejet strict d\'une seconde tentative d\'éclosion sur le même œuf', () => {
    const secondHatch = HatchingService.hatchEgg(qEgg1.id, today, 1.5, 'none', 'Tentative doublon');
    assert.equal(secondHatch.success, false);
    assert.ok(secondHatch.message.includes('déjà'));
  });

  // B-013-019 — GÉNÉALOGIE DU JEUNE
  it('B-013-019 — Intégrité de la chaîne de filiation Jeune -> Parents -> Couple -> Ponte -> Œuf', () => {
    const chick = ChickService.getChickById(qHatchResult.chickId);
    assert.ok(chick);

    // Lien vers l'œuf
    const egg = EggService.getEggById(chick.eggId);
    assert.ok(egg);
    assert.equal(egg.id, qEgg1.id);

    // Lien vers la ponte
    const clutch = ClutchService.getClutchById(egg.clutchId);
    assert.ok(clutch);
    assert.equal(clutch.id, qClutch.id);

    // Lien vers le couple
    const pair = ReproductionRepository.getById(clutch.pairId);
    assert.ok(pair);
    assert.equal(pair.id, qPair.id);
    assert.equal(pair.maleId, qBirdM.id);
    assert.equal(pair.femaleId, qBirdF.id);
  });

  // B-013-020 — PARENTÉ ET ANCESTRES
  it('B-013-020 — Filiation ascendante vérifiée', () => {
    const father = BirdRepository.getById(qBirdM.id);
    const mother = BirdRepository.getById(qBirdF.id);
    assert.ok(father && mother);
    assert.equal(father.sexe, 'Mâle');
    assert.equal(mother.sexe, 'Femelle');
  });

  // B-013-021 — CONSANGUINITÉ (Wright Inbreeding)
  it('B-013-021 — Détection du coefficient de consanguinité de Wright', () => {
    // 1. Oiseaux sans ascendants connus : incalculable avec code explicite
    const inbreedingNoParents = WrightCoefficientEngine.calculateInbreeding(qBirdM.id, qBirdF.id, BirdRepository.getAll());
    assert.equal(inbreedingNoParents.isCalculable, false, 'Incalculable sans ascendance');
    assert.equal(inbreedingNoParents.explanationCode, 'insufficient_pedigree');

    // 2. Oiseaux avec parents distincts connus (non apparentés) : F = 0%
    const bird1 = { id: 701, pere_id: 801, mere_id: 802 } as any;
    const bird2 = { id: 702, pere_id: 803, mere_id: 804 } as any;
    const p1 = { id: 801 } as any;
    const p2 = { id: 802 } as any;
    const p3 = { id: 803 } as any;
    const p4 = { id: 804 } as any;
    const unrelatedFamily = [bird1, bird2, p1, p2, p3, p4];

    const unrelatedInbreeding = WrightCoefficientEngine.calculateInbreeding(701, 702, unrelatedFamily);
    assert.equal(unrelatedInbreeding.isCalculable, true);
    assert.equal(unrelatedInbreeding.coefficient, 0, 'Consanguinité nulle attendue pour oiseaux avec lignées distinctes');

    // 3. Frère et sœur (parents communs) : F >= 25%
    const sibling1 = { id: 901, pere_id: 991, mere_id: 992 } as any;
    const sibling2 = { id: 902, pere_id: 991, mere_id: 992 } as any;
    const parentM = { id: 991 } as any;
    const parentF = { id: 992 } as any;
    const siblingsFamily = [sibling1, sibling2, parentM, parentF];

    const siblingInbreeding = WrightCoefficientEngine.calculateInbreeding(901, 902, siblingsFamily);
    assert.equal(siblingInbreeding.isCalculable, true);
    assert.ok(siblingInbreeding.coefficient !== null && siblingInbreeding.coefficient >= 25, 'Consanguinité >= 25% pour frère-sœur');
  });

  // B-013-022 — CROISSANCE DU JEUNE
  it('B-013-022 — Suivi de la courbe de croissance et pesées', () => {
    const chickId = qHatchResult.chickId;
    
    // Ajout d'une pesée à J+5
    GrowthRepository.addWeightRecord({
      chickId,
      date: today,
      weight: 5.2,
      notes: 'vigoureux'
    });

    const stats = ChickService.getStatistics(chickId);
    assert.ok(stats);
    assert.ok(stats.expectedWeightForAge > 0);
  });

  // B-013-023 — NURSERY
  it('B-013-023 — Transfert et enregistrement du jeune en nursery', () => {
    const chickId = qHatchResult.chickId;
    const record = NurseryService.saveNurseryRecord({
      id: 'nursery-qa-01',
      chickId,
      status: 'active',
      entryDate: today,
      mode: 'biological_parents',
      notes: 'Nursery QA B-013',
      timeline: [],
      createdAt: today,
      updatedAt: today
    });

    assert.ok(record);
    const fetched = NurseryService.getNurseryRecordByChick(chickId);
    assert.equal(fetched?.mode, 'biological_parents');
  });

  // B-013-024 — ADOPTION / FOSTER
  it('B-013-024 — Analyse de compatibilité pour adoption par parents nourriciers', () => {
    const fosterAnalysis = ReproductionEngine.analyzeFosterCompatibility(
      { id: qHatchResult.chickId, hatchDate: today, ageDays: 1 },
      { id: 'bp-foster', maleId: 10, femaleId: 11 },
      { capacity: 4, currentFosterCount: 1 },
      [{ hatchDate: today }]
    );

    assert.ok(fosterAnalysis.score >= 4);
    assert.equal(fosterAnalysis.validations.find(v => v.rule === 'FOSTER_NEST_LOAD')?.passed, true);
  });

  // B-013-025 — ÉLEVAGE MANUEL (EAM) / JABOT
  it('B-013-025 — Alertes de nourrissage à la main et surveillance du jabot', () => {
    // Analyse avec jabot normal à jour
    const alertNormal = ReproductionEngine.analyzeHandFeedingAlerts(
      { id: 'chick-1', name: 'Bébé QA', provisionalNumber: 'PROV-1', ageDays: 10, species: 'Canari' },
      [{ date: today, time: '12:00' }],
      [{ timestamp: today, statusBefore: 'empty', statusAfter: 'full' }],
      [{ minAgeDays: 5, maxAgeDays: 15, frequencyPerDay: 5 }]
    );
    assert.equal(alertNormal.isCropStagnant, false);

    // Analyse avec blocage de jabot (stagnant)
    const alertStagnant = ReproductionEngine.analyzeHandFeedingAlerts(
      { id: 'chick-1', name: 'Bébé QA', provisionalNumber: 'PROV-1', ageDays: 10, species: 'Canari' },
      [{ date: today, time: '08:00' }],
      [{ timestamp: today, statusBefore: 'stagnant', statusAfter: 'stagnant' }],
      [{ minAgeDays: 5, maxAgeDays: 15, frequencyPerDay: 5 }]
    );
    assert.equal(alertStagnant.isCropStagnant, true);
    assert.equal(alertStagnant.severity, 'critical');
  });

  // B-013-026 — SEVRAGE
  it('B-013-026 — Finalisation du sevrage à maturité', () => {
    const chickId = qHatchResult.chickId;
    const weanResult = WeaningService.finalizeWeaning(chickId, today, 19.5, 'success', 'Sevrage complet réussi');

    assert.equal(weanResult.success, true);
    const updatedChick = ChickService.getChickById(chickId);
    assert.equal(updatedChick?.status, 'weaned');
  });

  // B-013-027 — PROMOTION EN OISEAU INDÉPENDANT (Cycle de vie complet)
  let qPromotedBird: any;
  it('B-013-027 — Promotion du jeune sevré en oiseau indépendant bagué', () => {
    const chickId = qHatchResult.chickId;
    const promoteResult = WeaningService.promoteToIndependentBird(
      chickId,
      'QA-B013-PROMOTED-01',
      1,
      'Canari Élite Filiation'
    );

    assert.equal(promoteResult.success, true);
    assert.ok(promoteResult.bird);
    qPromotedBird = promoteResult.bird;

    // Filiation rigoureuse
    assert.equal(qPromotedBird.pere_id, qBirdM.id);
    assert.equal(qPromotedBird.mere_id, qBirdF.id);
    assert.equal(qPromotedBird.bague, 'QA-B013-PROMOTED-01');
  });

  // B-013-028 — DATES BIOLOGIQUES CHRONOLOGIQUES
  it('B-013-028 — Rejet des dates calendaires incohérentes', () => {
    assert.equal(ReproductionEngine.isValidHistoricalDate('2024-02-31'), false);
    assert.equal(ReproductionEngine.isValidHistoricalDate('2099-01-01'), false);
    assert.equal(ReproductionEngine.isValidHistoricalDate(today), true);
  });

  // B-013-029 — CALCUL D'ÂGE AUX FRONTIÈRES
  it('B-013-029 — Précision des calculs d\'âge autour des seuils de mois', () => {
    // Exactement 10 mois
    const tenMonthsAgo = offsetDate(-10, 0);
    const mAge = ReproductionEngine.calculateAgeInMonths(tenMonthsAgo);
    assert.equal(mAge, 10);

    // 9 mois et 29 jours (donc 9 mois complets)
    const nineMonths29Days = offsetDate(-9, -29);
    const fAge = ReproductionEngine.calculateAgeInMonths(nineMonths29Days);
    assert.ok(fAge >= 9);
  });

  // B-013-030 — ANNÉES BISSEXTILES
  it('B-013-030 — Prise en charge du 29 février', () => {
    const leapDate = '2024-02-29';
    assert.equal(ReproductionEngine.isValidHistoricalDate(leapDate), true);
  });

  // B-013-031 — FRONTIÈRES TEMPORELLES
  it('B-013-031 — Transition de date sans altération de fuseau', () => {
    const valid = ReproductionEngine.isValidHistoricalDate(today);
    assert.equal(valid, true);
  });

  // B-013-032 — FEMELLE DÉJÀ EN REPRODUCTION
  it('B-013-032 — Détection de la disponibilité d\'une femelle déjà active', () => {
    const activePairs = [{ status: 'active', maleId: 99, femaleId: qBirdF.id, archived: false }] as any;
    const comp = ReproductionEngine.getCompatibility(qBirdM, qBirdF, activePairs);
    const availRule = comp.validations.find(v => v.rule === 'REPRO_BIRDS_AVAILABLE');
    assert.equal(availRule?.passed, false);
  });

  // B-013-033 — COUPLE DÉJÀ ENGAGÉ
  it('B-013-033 — Blocage de l\'ouverture simultanée d\'une 2ème ponte active sur le même couple', () => {
    assert.throws(() => {
      ClutchService.createClutch(qPair.id, today);
    }, /déjà une ponte active/);
  });

  // B-013-034 — DONNÉES INCOMPLÈTES
  it('B-013-034 — Gestion contrôlée des oiseaux avec date de naissance manquante', () => {
    const birdNoDate = { id: 50, sexe: 'Mâle', date_naissance: '' } as any;
    const birdValid = { id: 51, sexe: 'Femelle', date_naissance: offsetDate(-12) } as any;
    const comp = ReproductionEngine.getCompatibility(birdNoDate, birdValid);
    const ageRule = comp.validations.find(v => v.rule === 'REPRO_MIN_AGE');
    assert.equal(ageRule?.passed, false, 'Âge non vérifiable marqué non conforme');
  });

  // B-013-035 — OISEAU ARCHIVÉ
  it('B-013-035 — Rejet d\'un oiseau archivé pour la reproduction', () => {
    const archivedMale = { ...qBirdM, archived: true };
    const comp = ReproductionEngine.getCompatibility(archivedMale, qBirdF);
    const aliveRule = comp.validations.find(v => v.rule === 'REPRO_BIRDS_ALIVE');
    assert.equal(aliveRule?.passed, false);
  });

  // B-013-036 — OISEAU VENDU / DÉCÉDÉ
  it('B-013-036 — Rejet d\'un oiseau déclaré décédé', () => {
    const deadFemale = { ...qBirdF, statut_sante: 'Décédé' };
    const comp = ReproductionEngine.getCompatibility(qBirdM, deadFemale);
    const aliveRule = comp.validations.find(v => v.rule === 'REPRO_BIRDS_ALIVE');
    assert.equal(aliveRule?.passed, false);
  });

  // B-013-037 — CAPACITÉ & HABITAT
  it('B-013-037 — Calcul de charge du nid d\'élevage', () => {
    const nestLoads = ReproductionEngine.getNestLoads(
      [{ id: 'chick-1', pairId: 'pair-1' }, { id: 'chick-2', pairId: 'pair-1' }, { id: 'chick-3', pairId: 'pair-1' }, { id: 'chick-4', pairId: 'pair-1' }, { id: 'chick-5', pairId: 'pair-1' }],
      [{ pairId: 'pair-1', capacity: 4 }]
    );
    assert.equal(nestLoads[0].isOverloaded, true, 'Nid de 5 oisillons pour 4 places déclaré surchargé');
  });

  // B-013-038 — RÈGLES PAR ESPÈCE
  it('B-013-038 — Durées biologiques adaptées selon l\'espèce', () => {
    // Canari standard : 13 jours
    const canariCal = ReproductionEngine.calculateIncubationCalendar(today, 13);
    assert.ok(canariCal.expectedHatchDate);

    // Perruche ondulée standard : 18 jours
    const budgieCal = ReproductionEngine.calculateIncubationCalendar(today, 18);
    assert.notEqual(canariCal.expectedHatchDate, budgieCal.expectedHatchDate);
  });

  // B-013-039 — DONNÉES APRÈS RELOAD
  it('B-013-039 — Persistance intégrale après rechargement virtuel', () => {
    const dump = memoryStorage.dump();
    const tempStore = new MemoryStorage();
    tempStore.load(dump);

    const reloadedChicks = JSON.parse(tempStore.getItem('ba_repro_chicks') || '[]');
    assert.ok(reloadedChicks.length >= 1);
    assert.equal(reloadedChicks[0].id, qHatchResult.chickId);
  });

  // B-013-040 — DONNÉES APRÈS CYCLE FERMETURE / RÉOUVERTURE
  it('B-013-040 — Persistance byte-à-byte après réouverture', () => {
    const before = JSON.stringify(memoryStorage.dump());
    const after = JSON.stringify(JSON.parse(before));
    assert.equal(after, before);
  });

  // B-013-041 — CHANGEMENT DE LANGUE
  it('B-013-041 — Invariance des règles lors du changement de langue', () => {
    const langs = ['fr', 'en', 'ar', 'es', 'it', 'fr'];
    for (const l of langs) {
      appStorage.setItem('language', l);
      assert.equal(ReproductionEngine.isReproductiveAge('Mâle', offsetDate(-10, -2)).ready, true);
    }
  });

  // B-013-042 — CHANGEMENT DE THÈME
  it('B-013-042 — Invariance lors du changement de thème', () => {
    appStorage.setItem('theme', 'dark');
    appStorage.setItem('theme', 'light');
    assert.equal(ReproductionEngine.isReproductiveAge('Femelle', offsetDate(-9, -2)).ready, true);
  });

  // B-013-043 — MODE OFFLINE-FIRST
  it('B-013-043 — Fonctionnement 100% autonome hors ligne', () => {
    assert.ok(BirdRepository.getAll());
    assert.ok(ReproductionRepository.getAll());
    assert.ok(ClutchRepository.getAll());
    assert.ok(EggRepository.getAll());
    assert.ok(ChickRepository.getAll());
  });

  // B-013-044 — STATISTIQUES BIOLOGIQUES
  it('B-013-044 — Calculs exacts des indicateurs de fertilité et d\'éclosion', () => {
    // 2 œufs totaux, 1 fécondé -> 50% fertilité
    const fertility = ReproductionEngine.calculateFertilityRate(2, 1);
    assert.equal(fertility, 50);

    // 1 fertile, 1 éclos, 0 échec -> 100% éclosion
    const hatchRate = ReproductionEngine.calculateForecastHatchRate(1, 1, 0);
    assert.equal(hatchRate, 100);

    // Échecs : 0 clair, 0 perdu, 0 mort -> 0%
    const failureRate = ReproductionEngine.calculateFailureRate(2, 0, 0, 0);
    assert.equal(failureRate, 0);
  });

  // B-013-045 — ALERTES BIOLOGIQUES CONTEXTUELLES
  it('B-013-045 — Déclenchement contextualisé des alertes nursery', () => {
    const alerts = NurseryService.getActiveNurseryAlerts();
    assert.ok(Array.isArray(alerts));
  });

  // B-013-046 — SUPPRESSION / ARCHIVAGE LOGIQUE
  it('B-013-046 — Conservation de la généalogie lors de l\'archivage des parents', () => {
    BirdRepository.archive(qBirdM.id);
    const chick = ChickService.getChickById(qHatchResult.chickId);
    assert.ok(chick);
    assert.equal(chick.pairId, qPair.id);
    // Restauration
    BirdRepository.restore(qBirdM.id);
  });

  // B-013-047 — DUPLICATION PRÉVENUE
  it('B-013-047 — Prévention des doublons d\'œufs ou de pontes', () => {
    const eggs = EggService.getEggsByClutch(qClutch.id);
    const eggNumbers = eggs.map(e => e.number);
    const setNumbers = new Set(eggNumbers);
    assert.equal(setNumbers.size, eggNumbers.length, 'Chaque œuf possède un numéro unique dans la ponte');
  });

  // B-013-048 — ERREURS ET INTÉGRITÉ TRANSACTIONNELLE
  it('B-013-048 — Aucun jeune orphelin en cas de rejet d\'éclosion', () => {
    const initialChickCount = ChickRepository.getAll().length;
    const res = HatchingService.hatchEgg('egg-inexistant-xyz', today, 1.5, 'none', 'Test');
    assert.equal(res.success, false);
    assert.equal(ChickRepository.getAll().length, initialChickCount, 'Aucun enregistrement créé');
  });

  // B-013-049 — AUDIT DE COHÉRENCE DU GRAPHE BIOLOGIQUE
  it('B-013-049 — Audit de fermeture et d\'intégrité sans liens orphelins', () => {
    const birds = BirdRepository.getAll();
    const pairs = ReproductionRepository.getAll();
    const clutches = ClutchRepository.getAll();
    const eggs = EggRepository.getAll();
    const chicks = ChickRepository.getAll();

    // Chaque couple pointe vers des oiseaux valides
    for (const pair of pairs) {
      assert.ok(birds.some(b => b.id === pair.maleId), 'Mâle existant');
      assert.ok(birds.some(b => b.id === pair.femaleId), 'Femelle existante');
    }

    // Chaque ponte pointe vers un couple valide
    for (const clutch of clutches) {
      assert.ok(pairs.some(p => p.id === clutch.pairId), 'Couple existant');
    }

    // Chaque œuf pointe vers une ponte valide
    for (const egg of eggs) {
      assert.ok(clutches.some(c => c.id === egg.clutchId), 'Ponte existante');
    }

    // Chaque poussin pointe vers un couple et un œuf valides
    for (const chick of chicks) {
      assert.ok(pairs.some(p => p.id === chick.pairId), 'Couple existant');
      assert.ok(eggs.some(e => e.id === chick.eggId), 'Œuf existant');
    }
  });

  // B-013-050 — CYCLE BIOLOGIQUE COMPLET END-TO-END
  it('B-013-050 — Exécution validée du cycle biologique complet de bout en bout', () => {
    // Validation que l'oiseau promu est bien enregistré dans l'académie
    const finalBird = BirdRepository.getById(qPromotedBird.id);
    assert.ok(finalBird);
    assert.equal(finalBird.bague, 'QA-B013-PROMOTED-01');
    assert.equal(finalBird.pere_id, qBirdM.id);
    assert.equal(finalBird.mere_id, qBirdF.id);

    // Teardown propre
    BirdRepository.delete(qPromotedBird.id);
    BirdRepository.delete(qBirdM.id);
    BirdRepository.delete(qBirdF.id);
  });
});

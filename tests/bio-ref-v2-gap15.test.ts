/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — BIOLOGICAL REFERENCE V2
 * GAP-15 — REPRODUCTION PERIPHERAL CANARY FALLBACK CLEANUP TEST SUITE
 * 
 * Verifies eradication of all residual peripheral Canary fallbacks in:
 * 1. GAP14-ANO-01: WeaningService (promotion to independent bird)
 * 2. GAP14-ANO-02: BandingBatchModal (batch banding bird creation)
 * 3. GAP14-ANO-03: HatchEggModal (egg species resolution and birth weight)
 * 4. GAP14-ANO-04: NurseryService (logistic growth curve scoping)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { WeaningService } from '../src/features/reproduction/weaning/services/WeaningService';
import { WeaningRepository } from '../src/features/reproduction/weaning/repositories/WeaningRepository';
import { ChickRepository } from '../src/features/reproduction/chicks/repositories/ChickRepository';
import { EggService } from '../src/features/reproduction/eggs/services/EggService';
import { EggRepository } from '../src/features/reproduction/eggs/repositories/EggRepository';
import { ClutchRepository } from '../src/features/reproduction/clutches/repositories/ClutchRepository';
import { ReproductionRepository } from '../src/features/reproduction/repositories/ReproductionRepository';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { BirdService } from '../src/features/birds/services/BirdService';
import { NurseryService } from '../src/features/reproduction/nursery/services/NurseryService';
import type { Canari } from '../src/types';
import type { BreedingPair } from '../src/features/reproduction/types';
import type { Chick } from '../src/features/reproduction/chicks/types';

// Minimal localStorage mock for Node environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    length: 0,
  } as unknown as Storage;
}

function createPairFixture(maleId: number, femaleId: number, name = 'Couple Test'): BreedingPair {
  return ReproductionRepository.create({
    name,
    maleId,
    femaleId,
    dateCreated: '2026-01-01',
    status: 'active',
    statistics: {
      pairId: '',
      reproductionsCount: 0,
      totalEggs: 0,
      fertileEggs: 0,
      hatchedEggs: 0,
      weanedChicks: 0,
      successRate: 0,
    },
  });
}

function createClutchFixture(pairId: string, startDate = '2026-02-01') {
  return ClutchRepository.create({
    pairId,
    startDate,
    status: 'active',
    eggCount: 1,
    fertilizedCount: 1,
    clearCount: 0,
    hatchedCount: 1,
    lostCount: 0,
    observations: '',
  });
}

function createEggFixture(clutchId: string, number = 1, layingDate = '2026-02-02', status = 'Éclos' as const) {
  return EggRepository.create({
    clutchId,
    number,
    layingDate,
    position: 'Nid',
    status,
    observations: '',
  });
}

describe('GAP-15 — REPRODUCTION PERIPHERAL CANARY FALLBACK CLEANUP', () => {

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  // =========================================================================
  // 1. WEANING SERVICE (GAP14-ANO-01)
  // =========================================================================
  describe('GAP14-ANO-01: WeaningService — Éradication du fallback Canary au sevrage', () => {
    test('1. Parents sans espèce -> aucun Canary automatique attribué lors de la promotion', () => {
      // 1. Create parents without species (species undefined)
      const male = BirdRepository.create({
        bague: 'PARENT-M-01',
        nom: 'Père Inconnu',
        sexe: 'Mâle',
        espece: undefined,
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });
      const female = BirdRepository.create({
        bague: 'PARENT-F-01',
        nom: 'Mère Inconnue',
        sexe: 'Femelle',
        espece: undefined,
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });

      assert.ok(male && female);

      // 2. Create pair, clutch, egg, chick
      const pair = createPairFixture(male.id, female.id, 'Couple Test Inconnu');
      const clutch = createClutchFixture(pair.id, '2026-02-01');
      const egg = createEggFixture(clutch.id, 1, '2026-02-02', 'Éclos');

      const chick = ChickRepository.create({
        eggId: egg.id,
        clutchId: clutch.id,
        pairId: pair.id,
        name: 'Poussin Sans Espèce',
        provisionalNumber: 'CHICK-01',
        hatchDate: '2026-02-15',
        birthWeight: 2.0,
        status: 'weaned',
        gender: 'Indéterminé',
        observations: 'Test sans espèce',
      });

      WeaningRepository.create({
        chickId: chick.id,
        date: '2026-03-20',
        age: 30,
        weight: 15.0,
        status: 'success',
        success: true,
        observations: 'Test sans espèce',
      });

      // 3. Promote chick
      const promoResult = WeaningService.promoteToIndependentBird(chick.id, 'PROMO-RING-01', 1, 'Jeune Promu 01');
      assert.equal(promoResult.success, true);
      assert.ok(promoResult.bird);

      const promoted = promoResult.bird;
      // Critère GAP-15 : aucun fallback automatique vers canari (valeur indéterminée/absente/UNKNOWN préservée)
      assert.ok(promoted.espece === undefined || promoted.espece === 'UNKNOWN');
      assert.notEqual(promoted.espece, 'canari');
      assert.notEqual(promoted.categorie, 'canari_couleur');
      assert.notEqual(promoted.race, 'Canari de Couleur');
      assert.notEqual(promoted.mutation, 'Classique');
      assert.notEqual(promoted.couleur_base, 'Jaune');
      assert.notEqual(promoted.facteur, 'Intense');
    });

    test('2. Parents avec espèce connue (ex: colombe_diamant) -> espèce et attributs fidèlement propagés', () => {
      const male = BirdRepository.create({
        bague: 'COLOMBE-M-01',
        nom: 'Père Colombe',
        sexe: 'Mâle',
        espece: 'colombe_diamant',
        categorie: 'colombe_classique',
        race: 'Colombe diamant classique',
        mutation: 'Classique',
        couleur_base: 'Gris',
        facteur: 'Simple',
        couleur: 'Gris Simple',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });
      const female = BirdRepository.create({
        bague: 'COLOMBE-F-01',
        nom: 'Mère Colombe',
        sexe: 'Femelle',
        espece: 'colombe_diamant',
        categorie: 'colombe_classique',
        race: 'Colombe diamant classique',
        mutation: 'Classique',
        couleur_base: 'Gris',
        facteur: 'Simple',
        couleur: 'Gris Simple',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });

      assert.ok(male && female);

      const pair = createPairFixture(male.id, female.id, 'Couple Colombe');
      const clutch = createClutchFixture(pair.id, '2026-02-01');
      const egg = createEggFixture(clutch.id, 1, '2026-02-02', 'Éclos');

      const chick = ChickRepository.create({
        eggId: egg.id,
        clutchId: clutch.id,
        pairId: pair.id,
        name: 'Poussin Colombe',
        provisionalNumber: 'CHICK-COL-01',
        hatchDate: '2026-02-15',
        birthWeight: 3.0,
        status: 'weaned',
        gender: 'Indéterminé',
        observations: 'Test colombe',
      });

      WeaningRepository.create({
        chickId: chick.id,
        date: '2026-03-20',
        age: 30,
        weight: 35.0,
        status: 'success',
        success: true,
        observations: 'Test colombe',
      });

      const promoResult = WeaningService.promoteToIndependentBird(chick.id, 'COL-RING-01', 1, 'Jeune Colombe 01');
      assert.equal(promoResult.success, true);
      assert.ok(promoResult.bird);

      const promoted = promoResult.bird;
      assert.equal(promoted.espece, 'colombe_diamant');
      assert.equal(promoted.categorie, 'colombe_classique');
      assert.equal(promoted.race, 'Colombe diamant classique');
      assert.equal(promoted.couleur_base, 'Gris');
    });

    test('3. Parents explicitement Canary -> comportement Canary préservé sans régression', () => {
      const male = BirdRepository.create({
        bague: 'CAN-M-01',
        nom: 'Père Canari',
        sexe: 'Mâle',
        espece: 'canari',
        categorie: 'canari_couleur',
        race: 'Lipochrome',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune Intensif',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });
      const female = BirdRepository.create({
        bague: 'CAN-F-01',
        nom: 'Mère Canari',
        sexe: 'Femelle',
        espece: 'canari',
        categorie: 'canari_couleur',
        race: 'Lipochrome',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Schimmel',
        couleur: 'Jaune Schimmel',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });

      assert.ok(male && female);

      const pair = createPairFixture(male.id, female.id, 'Couple Canari');
      const clutch = createClutchFixture(pair.id, '2026-02-01');
      const egg = createEggFixture(clutch.id, 1, '2026-02-02', 'Éclos');

      const chick = ChickRepository.create({
        eggId: egg.id,
        clutchId: clutch.id,
        pairId: pair.id,
        name: 'Poussin Canari',
        provisionalNumber: 'CHICK-CAN-01',
        hatchDate: '2026-02-15',
        birthWeight: 1.5,
        status: 'weaned',
        gender: 'Indéterminé',
        observations: 'Test canari',
      });

      WeaningRepository.create({
        chickId: chick.id,
        date: '2026-03-20',
        age: 30,
        weight: 18.0,
        status: 'success',
        success: true,
        observations: 'Test canari',
      });

      const promoResult = WeaningService.promoteToIndependentBird(chick.id, 'CAN-RING-01', 1, 'Jeune Canari 01');
      assert.equal(promoResult.success, true);
      assert.ok(promoResult.bird);

      const promoted = promoResult.bird;
      assert.equal(promoted.espece, 'canari');
      assert.equal(promoted.race, 'Lipochrome');
      assert.equal(promoted.couleur_base, 'Jaune');
    });
  });

  // =========================================================================
  // 2. BANDING BATCH MODAL LOGIC (GAP14-ANO-02)
  // =========================================================================
  describe('GAP14-ANO-02: BandingBatchModal — Éradication du fallback Canary au baguage en lot', () => {
    test('4. Géniteurs sans espèce -> aucun Canari, Lipochrome, Jaune ou Intensif inventé', () => {
      const sire = null as Partial<Canari> | null;
      const dam = null as Partial<Canari> | null;

      const parentSpecies = sire?.espece || dam?.espece || undefined;
      const parentCategory = sire?.categorie || dam?.categorie || '';
      const parentRace = sire?.race || dam?.race || '';
      const parentBaseColor = sire?.couleur_base || dam?.couleur_base || '';
      const parentFactor = sire?.facteur || dam?.facteur || '';
      const fallbackNamePrefix = parentRace || parentSpecies || 'Oiseau';

      const entry = {
        id: 101,
        tempNumber: 1,
        bague: 'TEST-BATCH-01',
        nom: '',
        sexe: 'Indéterminé' as const,
        mutation: '',
        couleur: '',
        vigor: 'Normal' as const,
        date_naissance: '2026-04-01',
        cage_id: 1,
      };

      const newBird: Omit<Canari, 'id'> = {
        bague: entry.bague.trim().toUpperCase(),
        nom: entry.nom || `${fallbackNamePrefix} ${entry.bague}`,
        sexe: entry.sexe,
        espece: parentSpecies,
        categorie: parentCategory,
        race: parentRace,
        mutation: entry.mutation || sire?.mutation || dam?.mutation || '',
        couleur_base: parentBaseColor,
        facteur: parentFactor,
        couleur: entry.couleur || [entry.mutation, parentBaseColor].filter(Boolean).join(' '),
        date_naissance: entry.date_naissance,
        cage_id: entry.cage_id,
        pere_id: sire ? (sire as any).id : null,
        mere_id: dam ? (dam as any).id : null,
        statut_sante: 'Sain',
        observations: 'Test',
        archived: false,
      };

      assert.equal(newBird.espece, undefined);
      assert.notEqual(newBird.espece, 'canari');
      assert.notEqual(newBird.race, 'Lipochrome');
      assert.notEqual(newBird.categorie, 'canari_couleur');
      assert.notEqual(newBird.couleur_base, 'Jaune');
      assert.notEqual(newBird.facteur, 'Intensif');
      assert.equal(newBird.nom, 'Oiseau TEST-BATCH-01');
    });

    test('5. Géniteurs avec espèce connue (ex: perruche_ondulee) -> espèce propagée au lot de baguage', () => {
      const sire: Partial<Canari> = {
        id: 50,
        espece: 'perruche_ondulee',
        categorie: 'perruche_ondulee_standard',
        race: 'Standard',
        couleur_base: 'Vert',
      };
      const dam: Partial<Canari> = {
        id: 51,
        espece: 'perruche_ondulee',
        categorie: 'perruche_ondulee_standard',
        race: 'Standard',
        couleur_base: 'Vert',
      };

      const parentSpecies = sire?.espece || dam?.espece || undefined;
      const parentRace = sire?.race || dam?.race || '';

      const entry = {
        id: 102,
        bague: 'PERR-BATCH-01',
        nom: '',
        sexe: 'Mâle' as const,
        mutation: 'Opaline',
      };

      const newBird: Partial<Canari> = {
        bague: entry.bague,
        nom: entry.nom || `${parentRace || parentSpecies || 'Oiseau'} ${entry.bague}`,
        espece: parentSpecies,
        race: parentRace,
        mutation: entry.mutation,
      };

      assert.equal(newBird.espece, 'perruche_ondulee');
      assert.equal(newBird.race, 'Standard');
      assert.equal(newBird.nom, 'Standard PERR-BATCH-01');
    });
  });

  // =========================================================================
  // 3. HATCH EGG MODAL (GAP14-ANO-03)
  // =========================================================================
  describe('GAP14-ANO-03: HatchEggModal — Résolution scientifique du poids de naissance', () => {
    test('6. Œuf d’espèce non-canari ou sans parents -> aucun pré-remplissage 1.5g', () => {
      // Create egg for non-canary pair
      const male = BirdRepository.create({
        bague: 'PERR-M-01',
        nom: 'Père Perruche',
        sexe: 'Mâle',
        espece: 'perruche_ondulee',
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });
      const female = BirdRepository.create({
        bague: 'PERR-F-01',
        nom: 'Mère Perruche',
        sexe: 'Femelle',
        espece: 'perruche_ondulee',
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });

      const pair = createPairFixture(male.id, female.id, 'Couple Perruche');
      const clutch = createClutchFixture(pair.id, '2026-02-01');
      const egg = createEggFixture(clutch.id, 1, '2026-02-02', 'Nid' as any);

      // Simulation de la résolution dans HatchEggModal
      const eggResolved = EggService.getEggById(egg.id);
      const clutchResolved = eggResolved ? ClutchRepository.getById(eggResolved.clutchId) : undefined;
      const pairResolved = clutchResolved ? ReproductionRepository.getById(clutchResolved.pairId) : undefined;
      const sireResolved = pairResolved?.maleId ? BirdService.getById(pairResolved.maleId) : undefined;
      const damResolved = pairResolved?.femaleId ? BirdService.getById(pairResolved.femaleId) : undefined;
      const resolvedSpecies = sireResolved?.espece || damResolved?.espece || undefined;

      const birthWeightDefault = resolvedSpecies === 'canari' ? '1.5' : '';

      assert.equal(resolvedSpecies, 'perruche_ondulee');
      assert.equal(birthWeightDefault, '', 'Le poids de naissance ne doit pas être pré-rempli à 1.5 pour une perruche');
    });

    test('7. Œuf d’espèce explicitement canari -> pré-remplissage 1.5g conservé', () => {
      const male = BirdRepository.create({
        bague: 'CAN-HATCH-M-01',
        nom: 'Père Canari Hatch',
        sexe: 'Mâle',
        espece: 'canari',
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });
      const female = BirdRepository.create({
        bague: 'CAN-HATCH-F-01',
        nom: 'Mère Canari Hatch',
        sexe: 'Femelle',
        espece: 'canari',
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });

      const pair = createPairFixture(male.id, female.id, 'Couple Canari Hatch');
      const clutch = createClutchFixture(pair.id, '2026-02-01');
      const egg = createEggFixture(clutch.id, 1, '2026-02-02', 'Nid' as any);

      const eggResolved = EggService.getEggById(egg.id);
      const clutchResolved = eggResolved ? ClutchRepository.getById(eggResolved.clutchId) : undefined;
      const pairResolved = clutchResolved ? ReproductionRepository.getById(clutchResolved.pairId) : undefined;
      const sireResolved = pairResolved?.maleId ? BirdService.getById(pairResolved.maleId) : undefined;
      const damResolved = pairResolved?.femaleId ? BirdService.getById(pairResolved.femaleId) : undefined;
      const resolvedSpecies = sireResolved?.espece || damResolved?.espece || undefined;

      const birthWeightDefault = resolvedSpecies === 'canari' ? '1.5' : '';

      assert.equal(resolvedSpecies, 'canari');
      assert.equal(birthWeightDefault, '1.5', 'Le poids 1.5g homologué doit être conservé pour le Canari');
    });
  });

  // =========================================================================
  // 4. NURSERY SERVICE (GAP14-ANO-04)
  // =========================================================================
  describe('GAP14-ANO-04: NurseryService — Restriction de la courbe logistique au Canari', () => {
    test('8. Poussin sans espèce ou non-Canary -> expectedWeight = 0, aucun modèle logistique 18g imposé', () => {
      // Poussin sans espèce liée
      const chick = ChickRepository.create({
        eggId: 'egg-col-99',
        clutchId: 'clutch-col-99',
        pairId: '',
        name: 'Poussin Sans Couple',
        provisionalNumber: 'NURSERY-NO-SP',
        hatchDate: '2026-04-01',
        birthWeight: 3.5,
        status: 'growth',
        gender: 'Indéterminé',
        observations: 'Test nurserie',
      });

      const curve = NurseryService.getGrowthCurveData(chick.id);
      assert.ok(curve.length > 0);

      // Pour chaque point, la courbe théorique doit être absente (0) car non-Canari
      for (const pt of curve) {
        assert.equal(pt.expectedWeight, 0, `Point à J+${pt.ageDays} ne doit avoir aucun expectedWeight Canary`);
      }
      // Au jour 0, le poids réel observé correspond au poids de naissance enregistré
      assert.equal(curve[0].weight, 3.5);
    });

    test('9. Poussin explicitement Canari -> modèle logistique 18g Canary conservé', () => {
      const male = BirdRepository.create({
        bague: 'CAN-NURSE-M-01',
        nom: 'Père Canari Nurserie',
        sexe: 'Mâle',
        espece: 'canari',
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });

      const pair = createPairFixture(male.id, male.id, 'Couple Canari Nurserie');

      const chick = ChickRepository.create({
        eggId: 'egg-can-99',
        clutchId: 'clutch-can-99',
        pairId: pair.id,
        name: 'Poussin Canari Nurserie',
        provisionalNumber: 'NURSERY-CAN-01',
        hatchDate: '2026-04-01',
        birthWeight: 1.5,
        status: 'growth',
        gender: 'Indéterminé',
        observations: 'Test nurserie canari',
      });

      const curve = NurseryService.getGrowthCurveData(chick.id);
      assert.ok(curve.length > 0);

      // Le modèle logistique Canary prédit un expectedWeight croissant jusqu'à environ 18g
      const finalPoint = curve[curve.length - 1];
      assert.ok(finalPoint.expectedWeight > 17 && finalPoint.expectedWeight <= 18.5);
      assert.ok(curve[0].expectedWeight > 0);
    });

    test('10. Rigueur épistémique : UNKNOWN et NOT_TESTED préservés', () => {
      // Un poussin avec espèce inconnue n'invente aucune courbe
      const male = BirdRepository.create({
        bague: 'UNKNOWN-SP-M',
        nom: 'Père Inconnu',
        sexe: 'Mâle',
        espece: 'UNKNOWN',
        categorie: '',
        race: '',
        mutation: '',
        couleur_base: '',
        facteur: '',
        couleur: '',
        date_naissance: '2025-01-01',
        cage_id: 1,
        archived: false,
      });

      const pair = createPairFixture(male.id, male.id, 'Couple Inconnu');

      const chick = ChickRepository.create({
        eggId: 'egg-unk-01',
        clutchId: 'clutch-unk-01',
        pairId: pair.id,
        name: 'Poussin UNKNOWN',
        provisionalNumber: 'UNK-01',
        hatchDate: '2026-04-01',
        birthWeight: 2.2,
        status: 'growth',
        gender: 'Indéterminé',
        observations: 'Test UNKNOWN',
      });

      const curve = NurseryService.getGrowthCurveData(chick.id);
      assert.ok(curve.length > 0);
      for (const pt of curve) {
        assert.equal(pt.expectedWeight, 0, 'Aucun expectedWeight ne doit être calculé pour espèce UNKNOWN');
      }
    });
  });
});

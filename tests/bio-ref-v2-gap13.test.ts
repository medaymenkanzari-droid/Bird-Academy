/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — BIOLOGICAL REFERENCE V2
 * GAP-13 — ZERO CANARY FALLBACK REMEDIATION TEST SUITE
 * 
 * Verifies eradication of all implicit generic Canary fallbacks across:
 * 1. SpeciesProfileService (getScopedBiologicalProfiles, getIncubationDays)
 * 2. BreedingKnowledgeProvider (getBreedingParameters, getIncubationDuration)
 * 3. IncubationService (startIncubation)
 * 4. ReproductionEngine (calculateIncubationCalendar, isReproductiveAge, getCompatibility)
 * 5. PassportSuggestionService (generateSuggestions)
 * 6. DecisionSupportEngine (buildCrossDecisionSupport)
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SpeciesProfileService } from '../src/features/species/services/SpeciesProfileService';
import { SpeciesProfileRepository } from '../src/features/species/repositories/SpeciesProfileRepository';
import { BreedingKnowledgeProvider } from '../src/features/assistant/providers/knowledge/BreedingKnowledgeProvider';
import { IncubationService } from '../src/features/reproduction/incubation/services/IncubationService';
import { ReproductionEngine } from '../src/features/reproduction/engines/ReproductionEngine';
import { PassportSuggestionService } from '../src/features/birds/services/PassportSuggestionService';
import { DecisionSupportEngine } from '../src/features/intelligence/engines/DecisionSupportEngine';
import { ClutchService } from '../src/features/reproduction/clutches/services/ClutchService';
import { EggService } from '../src/features/reproduction/eggs/services/EggService';
import { ReproductionRepository } from '../src/features/reproduction/repositories/ReproductionRepository';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { BIOLOGICAL_SPECIES_REGISTRY } from '../src/reference/species';

// Ensure a minimal mock localStorage for Node environment if missing
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

describe('GAP-13 — ZERO CANARY FALLBACK REMEDIATION', () => {

  beforeEach(() => {
    globalThis.localStorage.clear();
    SpeciesProfileRepository.clearMemoryCache();
  });

  // =========================================================================
  // 1. ESPÈCE EXPLICITEMENT 'canari' -> COMPORTEMENT CANARY CONSERVÉ
  // =========================================================================
  test('GAP13-01: speciesId explicite "canari" -> données et règles Canary préservées', () => {
    // Incubation days
    assert.equal(SpeciesProfileService.getIncubationDays('canari'), 13);

    // Breeding knowledge
    const canaryParams = BreedingKnowledgeProvider.getBreedingParameters('canari');
    assert.ok(canaryParams);
    assert.equal(canaryParams.incubationDays, 13);
    assert.equal(BreedingKnowledgeProvider.getIncubationDuration('canari'), 13);

    // Reproductive age
    const canaryMale = ReproductionEngine.isReproductiveAge('Mâle', '2024-01-01', 'canari');
    assert.equal(canaryMale.applicable, true);
    assert.equal(canaryMale.requiredMonths, 10);

    const canaryFemale = ReproductionEngine.isReproductiveAge('Femelle', '2024-01-01', 'canari');
    assert.equal(canaryFemale.applicable, true);
    assert.equal(canaryFemale.requiredMonths, 9);

    // Decision support engine
    const dss = DecisionSupportEngine.buildCrossDecisionSupport({
      success: true,
      speciesId: 'canari',
      male: { nom: 'Male Canari' },
      female: { nom: 'Femelle Canari' },
    });
    assert.equal(dss.source.engineOrTable, 'CanaryCrossEngine');
  });

  // =========================================================================
  // 2-6. AUTRES ESPÈCES EXPLICITES -> AUCUNE DONNÉE CANARY
  // =========================================================================
  test('GAP13-02: espèce "perruche_ondulee" -> aucune donnée Canary appliquée', () => {
    assert.equal(SpeciesProfileService.getIncubationDays('perruche_ondulee'), 18);
    assert.notEqual(SpeciesProfileService.getIncubationDays('perruche_ondulee'), 13);

    const params = BreedingKnowledgeProvider.getBreedingParameters('perruche_ondulee');
    assert.ok(params);
    assert.equal(params.incubationDays, 18);
    assert.notEqual(params.incubationDays, 13);

    const age = ReproductionEngine.isReproductiveAge('Mâle', '2024-01-01', 'perruche_ondulee');
    // Profile perruche_ondulee defines minAgeReproduction: 10 (not Canary male/female differentiation 10/9)
    assert.equal(age.applicable, true);
    assert.equal(age.requiredMonths, 10);
  });

  test('GAP13-03: espèce "colombe_diamant" -> aucune donnée Canary appliquée', () => {
    assert.equal(SpeciesProfileService.getIncubationDays('colombe_diamant'), 13); // Colombe has 13 days naturally
    const params = BreedingKnowledgeProvider.getBreedingParameters('colombe_diamant');
    assert.ok(params);
    assert.equal(params.speciesId, 'colombe_diamant');

    // Cross decision support for colombe_diamant must NOT attribute CanaryCrossEngine
    const dss = DecisionSupportEngine.buildCrossDecisionSupport({
      success: true,
      speciesId: 'colombe_diamant',
      male: { nom: 'Colombe M' },
      female: { nom: 'Colombe F' },
    });
    assert.equal(dss.source.engineOrTable, 'GeneticsEngine');
  });

  test('GAP13-04: espèce "agapornis_roseicollis" -> aucune donnée Canary appliquée', () => {
    assert.equal(SpeciesProfileService.getIncubationDays('agapornis_roseicollis'), 23);
    assert.notEqual(SpeciesProfileService.getIncubationDays('agapornis_roseicollis'), 13);

    const params = BreedingKnowledgeProvider.getBreedingParameters('agapornis_roseicollis');
    assert.ok(params);
    assert.equal(params.incubationDays, 23);

    const age = ReproductionEngine.isReproductiveAge('Femelle', '2024-01-01', 'agapornis_roseicollis');
    // Roseicollis defines minAgeReproduction: 10 (not Canary female 9 months)
    assert.equal(age.applicable, true);
    assert.equal(age.requiredMonths, 10);
    assert.notEqual(age.requiredMonths, 9);
  });

  test('GAP13-05: espèce "agapornis_fischeri" -> aucune donnée Canary appliquée', () => {
    assert.equal(SpeciesProfileService.getIncubationDays('agapornis_fischeri'), 22);
    assert.notEqual(SpeciesProfileService.getIncubationDays('agapornis_fischeri'), 13);

    const params = BreedingKnowledgeProvider.getBreedingParameters('agapornis_fischeri');
    assert.ok(params);
    assert.equal(params.incubationDays, 22);
  });

  test('GAP13-06: espèce "agapornis_personatus" -> aucune donnée Canary appliquée', () => {
    assert.equal(SpeciesProfileService.getIncubationDays('agapornis_personatus'), 22);
    assert.notEqual(SpeciesProfileService.getIncubationDays('agapornis_personatus'), 13);

    const params = BreedingKnowledgeProvider.getBreedingParameters('agapornis_personatus');
    assert.ok(params);
    assert.equal(params.incubationDays, 22);
  });

  // =========================================================================
  // 7. SPECIES ID ABSENT -> AUCUNE RÉSOLUTION CANARY
  // =========================================================================
  test('GAP13-07: speciesId absent -> aucune hypothèse ni résolution Canary', () => {
    // getIncubationDays returns undefined
    assert.equal(SpeciesProfileService.getIncubationDays(undefined), undefined);

    // BreedingKnowledgeProvider returns null
    assert.equal(BreedingKnowledgeProvider.getBreedingParameters(undefined), null);
    assert.equal(BreedingKnowledgeProvider.getIncubationDuration(undefined), undefined);

    // ReproductionEngine.isReproductiveAge does not apply Canary 9/10 months
    const age = ReproductionEngine.isReproductiveAge('Mâle', '2024-01-01', undefined);
    assert.equal(age.applicable, false);
    assert.equal(age.requiredMonths, undefined);

    // ReproductionEngine.calculateIncubationCalendar without duration returns null
    const cal = ReproductionEngine.calculateIncubationCalendar('2025-05-01');
    assert.equal(cal, null);

    // DecisionSupportEngine attributes GeneticsEngine
    const dss = DecisionSupportEngine.buildCrossDecisionSupport({
      success: true,
      speciesId: undefined,
      male: { nom: 'Inconnu M' },
      female: { nom: 'Inconnu F' },
    });
    assert.equal(dss.source.engineOrTable, 'GeneticsEngine');
  });

  // =========================================================================
  // 8. SPECIES ID INCONNU -> AUCUNE RÉSOLUTION CANARY
  // =========================================================================
  test('GAP13-08: speciesId inconnu -> aucune hypothèse ni résolution Canary', () => {
    assert.equal(SpeciesProfileService.getIncubationDays('unknown_species_xyz'), undefined);
    assert.equal(BreedingKnowledgeProvider.getBreedingParameters('unknown_species_xyz'), null);
    assert.equal(BreedingKnowledgeProvider.getIncubationDuration('unknown_species_xyz'), undefined);

    const age = ReproductionEngine.isReproductiveAge('Mâle', '2024-01-01', 'unknown_species_xyz');
    assert.equal(age.applicable, false);
    assert.equal(age.requiredMonths, undefined);

    const cal = ReproductionEngine.calculateIncubationCalendar('2025-05-01', undefined, 'unknown_species_xyz');
    assert.equal(cal, null);
  });

  // =========================================================================
  // 9. AUCUNE RÉSOLUTION VIA registry[0]
  // =========================================================================
  test('GAP13-09: getScopedBiologicalProfiles ne résout pas via registry[0] ou canari quand profil vide', () => {
    // Set active species to empty
    SpeciesProfileService.setProfile([]);
    const scoped = SpeciesProfileService.getScopedBiologicalProfiles();
    assert.deepEqual(scoped, []);
    assert.notEqual(scoped.length, 1);
    assert.equal((scoped as any[]).some(p => p.identity?.id === 'canari'), false);
  });

  // =========================================================================
  // 10. AUCUNE SUGGESTION PASSPORT CANARY SANS SPECIES ID CANARY
  // =========================================================================
  test('GAP13-10: PassportSuggestionService ne génère aucune suggestion Canary sans espèce explicite Canary', () => {
    // Without species
    const noSpeciesSuggestions = PassportSuggestionService.generateSuggestions({
      bird: { id: 999, nom: 'Oiseau Test', espece: '' },
      father: { id: 901, espece: '', nom: 'Pere' } as any,
      mother: { id: 902, espece: '', nom: 'Mere' } as any,
    });
    assert.deepEqual(noSpeciesSuggestions, []);

    // Non-canary parents (colombe_diamant)
    const doveSuggestions = PassportSuggestionService.generateSuggestions({
      bird: { id: 998, nom: 'Colombe Test', espece: 'colombe_diamant' },
      speciesId: 'colombe_diamant',
      father: { id: 903, espece: 'colombe_diamant', nom: 'Pere Colombe', couleur_base: 'Jaune' } as any,
      mother: { id: 904, espece: 'colombe_diamant', nom: 'Mere Colombe', couleur_base: 'Jaune' } as any,
    });
    // Colombe diamant does not receive Canary lipochrome suggestions
    assert.equal(doveSuggestions.some(s => s.id.includes('canary')), false);

    // With Canary species and lipochrome parents -> Canary suggestions are generated
    const canarySuggestions = PassportSuggestionService.generateSuggestions({
      bird: { id: 997, nom: 'Canari Test', espece: 'canari' },
      speciesId: 'canari',
      father: { id: 905, espece: 'canari', nom: 'Pere Canari', couleur_base: 'Jaune' } as any,
      mother: { id: 906, espece: 'canari', nom: 'Mere Canari', couleur_base: 'Jaune' } as any,
    });
    assert.ok(canarySuggestions.length > 0);
    assert.ok(canarySuggestions.some(s => s.id.includes('canary')));
  });

  // =========================================================================
  // 11. AUCUN APPEL CanaryCrossEngine POUR UNE AUTRE ESPÈCE
  // =========================================================================
  test('GAP13-11: DecisionSupportEngine n\'attribue jamais CanaryCrossEngine pour une autre espèce', () => {
    const speciesList = ['perruche_ondulee', 'colombe_diamant', 'agapornis_roseicollis', 'agapornis_personatus'];
    for (const sp of speciesList) {
      const dssSuccess = DecisionSupportEngine.buildCrossDecisionSupport({
        success: true,
        speciesId: sp,
        male: { nom: 'Pere' },
        female: { nom: 'Mere' },
      });
      assert.equal(dssSuccess.source.engineOrTable, 'GeneticsEngine');

      const dssFailure = DecisionSupportEngine.buildCrossDecisionSupport({
        success: false,
        speciesId: sp,
        errorCode: 'ZW_VIOLATION',
        male: { nom: 'Pere' },
        female: { nom: 'Mere' },
      });
      assert.equal(dssFailure.source.engineOrTable, 'GeneticsEngine');
    }
  });

  // =========================================================================
  // 12. AUCUN ÂGE REPRODUCTIF CANARY APPLIQUÉ À UNE AUTRE ESPÈCE
  // =========================================================================
  test('GAP13-12: aucun seuil 9/10 mois Canary appliqué aux autres espèces ou sans espèce', () => {
    const youngDate = '2024-05-01'; // less than 10 months depending on current date
    // Without species: not applicable, no 9/10 months
    const ageUnknown = ReproductionEngine.isReproductiveAge('Mâle', youngDate);
    assert.equal(ageUnknown.applicable, false);
    assert.equal(ageUnknown.requiredMonths, undefined);

    // Unknown species: not applicable, no 9/10 months
    const ageUnknownSp = ReproductionEngine.isReproductiveAge('Mâle', youngDate, 'unknown_bird');
    assert.equal(ageUnknownSp.applicable, false);
    assert.equal(ageUnknownSp.requiredMonths, undefined);

    // Colombe diamant: minAgeReproduction is 8 months (for both sexes, unlike Canary 9/10)
    const ageColombeM = ReproductionEngine.isReproductiveAge('Mâle', youngDate, 'colombe_diamant');
    assert.equal(ageColombeM.requiredMonths, 8);
    const ageColombeF = ReproductionEngine.isReproductiveAge('Femelle', youngDate, 'colombe_diamant');
    assert.equal(ageColombeF.requiredMonths, 8); // not 9 like Canary female
  });

  // =========================================================================
  // 13. AUCUNE VALEUR D'INCUBATION CANARY APPLIQUÉE À UNE AUTRE ESPÈCE
  // =========================================================================
  test('GAP13-13: aucune valeur d\'incubation Canary par défaut appliquée à IncubationService ou calculateIncubationCalendar', () => {
    // calculateIncubationCalendar with unknown species returns null
    const cal = ReproductionEngine.calculateIncubationCalendar('2025-05-01', undefined, 'unknown_bird');
    assert.equal(cal, null);

    const pair = ReproductionRepository.create({
      id: 'pair-gap13-test',
      maleId: 991,
      femaleId: 992,
      name: 'Pair Unknown Species',
      dateCreated: '2025-01-01',
      status: 'active',
      archived: false,
    } as any);
    const clutch = ClutchService.createClutch(pair.id, '2025-05-01');
    EggService.addEgg(clutch.id, '2025-05-01');

    // Pair birds are not in repository, so duration cannot be resolved
    assert.throws(() => {
      IncubationService.startIncubation(clutch.id, '2025-05-02');
    }, /durée théorique indéterminée/i);
  });

  // =========================================================================
  // 14. UNKNOWN / NOT_TESTED RESTENT PRÉSERVÉS
  // =========================================================================
  test('GAP13-14: UNKNOWN et NOT_TESTED sont rigoureusement préservés sans dérivation Canary', () => {
    const dssUnknown = DecisionSupportEngine.buildLocusDecisionSupport({
      locusId: 'locus_unknown',
      epistemicStatus: 'UNKNOWN',
    });
    assert.equal(dssUnknown.level, 'MISSING_DATA');
    assert.ok(dssUnknown.missingData && dssUnknown.missingData.length > 0);

    const dssNotTested = DecisionSupportEngine.buildLocusDecisionSupport({
      locusId: 'locus_not_tested',
      epistemicStatus: 'NOT_TESTED',
    });
    assert.equal(dssNotTested.level, 'INFORMATION');
  });

  // =========================================================================
  // 15. COHÉRENCE BIOLOGIQUE DES PROFILS EXISTANTS DANS LE REGISTRE
  // =========================================================================
  test('GAP13-15: Tous les profils du registre ont des durées propres conformes à la biologie', () => {
    for (const profile of BIOLOGICAL_SPECIES_REGISTRY) {
      const incubationDays = SpeciesProfileService.getIncubationDays(profile.identity.id);
      assert.ok(incubationDays !== undefined, `Species ${profile.identity.id} should have defined incubation days`);
      assert.equal(incubationDays, profile.reproduction.incubationPeriod);
    }
  });

});

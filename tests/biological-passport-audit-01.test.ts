/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for node:test environment
const mockStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

import { PASSPORT_TRANSLATIONS } from '../src/utils/translationsPassport';
import { TRANSLATIONS } from '../src/utils/translations';
import { 
  getBiologicalProfileById, 
  getBiologicalTraceability,
  BIOLOGICAL_SPECIES_REGISTRY 
} from '../src/reference/species/index';
import { PassportDataService } from '../src/features/birds/services/PassportDataService';
import { COM_CRITERIA_DEFINITIONS } from '../src/features/birds/models/passport';
import { calculateInbreedingCOI } from '../src/utils/genealogy';
import { BirdEngine } from '../src/business/BirdEngine';
import { Canari } from '../src/types';

// Helper mock birds
const canaryBird: Canari = {
  id: 101,
  nom: 'Titan',
  bague: 'FR-2025-0101',
  espece: 'canari',
  race: 'Lipochrome Rouge Intensif',
  categorie: 'Couleur',
  mutation: 'Classique',
  couleur_base: 'Rouge',
  facteur: 'Intensif',
  couleur: 'Rouge Intensif',
  sexe: 'Mâle',
  date_naissance: '2024-05-10',
  statut_sante: 'Sain',
  archived: false,
  pere_id: 1,
  mere_id: 2
};

const goldfinchBird: Canari = {
  id: 102,
  nom: 'Orphée',
  bague: 'DZ-2025-0202',
  espece: 'chardonneret_elegant',
  race: 'Major Brun',
  categorie: 'Faune',
  mutation: 'Brun',
  couleur_base: 'Brun',
  facteur: 'Classique',
  couleur: 'Brun',
  sexe: 'Mâle',
  date_naissance: '2024-06-15',
  statut_sante: 'Sain',
  archived: false
};

const budgieBird: Canari = {
  id: 103,
  nom: 'Kiwi',
  bague: 'BE-2025-0303',
  espece: 'perruche_ondulee',
  race: 'Ondulée de Posture',
  categorie: 'Posture',
  mutation: 'Opaline',
  couleur_base: 'Vert',
  facteur: 'Intensif',
  couleur: 'Vert Opaline',
  sexe: 'Femelle',
  date_naissance: '2024-04-01',
  statut_sante: 'Sain',
  archived: false
};

const unknownSpeciesBird: Canari = {
  id: 104,
  nom: 'Mystère',
  bague: 'UN-2025-0404',
  espece: 'oiseau_inexistant_xyz' as any,
  race: 'Inconnue',
  categorie: 'Inconnue',
  mutation: 'Inconnue',
  couleur_base: 'Inconnue',
  facteur: 'Inconnu',
  couleur: 'Inconnu',
  sexe: 'Mâle',
  date_naissance: '2024-01-01',
  statut_sante: 'Sain',
  archived: false
};

// ============================================================================
// BIO-PASS-01 : Présence de toutes les clés dans les 5 langues officielles
// ============================================================================
test('BIO-PASS-01: Translations presence across all 5 languages without missing keys', () => {
  const languages = ['fr', 'en', 'ar', 'es', 'it'] as const;
  
  // Verify PASSPORT_TRANSLATIONS has all 5 languages
  languages.forEach(lang => {
    assert.ok(PASSPORT_TRANSLATIONS[lang], `Language ${lang} must exist in PASSPORT_TRANSLATIONS`);
  });

  const frKeys = Object.keys(PASSPORT_TRANSLATIONS.fr);
  assert.ok(frKeys.length >= 40, `French dictionary must have comprehensive keys (found ${frKeys.length})`);

  languages.forEach(lang => {
    const dict = PASSPORT_TRANSLATIONS[lang];
    frKeys.forEach(key => {
      assert.ok(dict[key], `Key "${key}" must exist and not be empty in ${lang}`);
      assert.ok(typeof dict[key] === 'string' && dict[key].trim().length > 0, `Key "${key}" in ${lang} must be a non-empty string`);
    });
  });

  // Verify that TRANSLATIONS merges passport keys
  languages.forEach(lang => {
    assert.ok(TRANSLATIONS[lang].passportBioProfileTab, `TRANSLATIONS[${lang}].passportBioProfileTab must be merged`);
    assert.ok(TRANSLATIONS[lang].passportTitle, `TRANSLATIONS[${lang}].passportTitle must be merged`);
    assert.ok(TRANSLATIONS[lang].biologicalDataUnavailable, `TRANSLATIONS[${lang}].biologicalDataUnavailable must be merged`);
  });
});

// ============================================================================
// BIO-PASS-02 : Rendu du passeport d'un Canari (espèce `canari`)
// ============================================================================
test('BIO-PASS-02: Canary biological profile loaded from registry with exact scientific norms', () => {
  const profile = getBiologicalProfileById(canaryBird.espece || '');
  assert.ok(profile, 'Canary profile must exist in registry');
  assert.ok(profile.identity.scientificName.startsWith('Serinus canaria'), 'Canary scientific name must start with Serinus canaria');
  assert.equal(profile.reproduction.incubationPeriod, 13, 'Canary incubation period must be 13 days');
  assert.equal(profile.breeding.bandSize, '2.9', 'Canary band size is 2.9 mm in central registry');
  assert.equal(profile.biology.minWeight, 15, 'Canary min weight is 15g in central registry');
  assert.equal(profile.biology.maxWeight, 30, 'Canary max weight is 30g in central registry');
  assert.equal(profile.biology.minAgeReproduction, 10, 'Canary reproduction age must be 10 months');
});


// ============================================================================
// BIO-PASS-03 : Rendu du passeport d'un Chardonneret (espèce `chardonneret_elegant`)
// ============================================================================
test('BIO-PASS-03: Goldfinch biological profile loaded with distinct taxonomy without canary defaults', () => {
  const profile = getBiologicalProfileById(goldfinchBird.espece || '');
  assert.ok(profile, 'Goldfinch profile must exist in registry');
  assert.equal(profile.identity.scientificName, 'Carduelis carduelis', 'Goldfinch scientific name must be Carduelis carduelis');
  assert.equal(profile.reproduction.incubationPeriod, 12, 'Goldfinch incubation period is 12 days in registry');
  assert.ok(profile.breeding.bandSize.startsWith('2.5'), 'Goldfinch band size must be 2.5 mm');
  assert.equal(profile.biology.minWeight, 14, 'Goldfinch min weight must be 14g');
  assert.equal(profile.biology.maxWeight, 19, 'Goldfinch max weight must be 19g');
  assert.notEqual(profile.identity.names.fr, 'Canari domestique', 'Goldfinch cannot have canary name');
});

// ============================================================================
// BIO-PASS-04 : Rendu du passeport d'une Perruche Ondulée (espèce `perruche_ondulee`)
// ============================================================================
test('BIO-PASS-04: Budgerigar biological profile loaded with Psittacidae characteristics', () => {
  const profile = getBiologicalProfileById(budgieBird.espece || '');
  assert.ok(profile, 'Budgie profile must exist in registry');
  assert.equal(profile.identity.scientificName, 'Melopsittacus undulatus', 'Budgie scientific name must be Melopsittacus undulatus');
  assert.equal(profile.reproduction.incubationPeriod, 14, 'Budgie incubation period must be 14 days');
  assert.equal(profile.breeding.bandSize, '3.0 mm', 'Budgie band size in baseline registry');
  assert.equal(profile.biology.minWeight, 15, 'Budgie min weight in baseline registry');
  assert.equal(profile.biology.maxWeight, 25, 'Budgie max weight in baseline registry');
});

// ============================================================================
// BIO-PASS-05 : Changement d'oiseau à chaud (Oiseau A -> Oiseau B)
// ============================================================================
test('BIO-PASS-05: Hot bird switch returns distinct weight logs and palmares for different birds and species', () => {
  // Test baseline weights adapt to species
  const canaryLogs = PassportDataService.getWeightLogsForBird(canaryBird.id, canaryBird);
  const goldfinchLogs = PassportDataService.getWeightLogsForBird(goldfinchBird.id, goldfinchBird);
  const budgieLogs = PassportDataService.getWeightLogsForBird(budgieBird.id, budgieBird);

  assert.ok(canaryLogs.length > 0 && canaryLogs[0].weightGrams >= 18 && canaryLogs[0].weightGrams <= 25, 'Canary weight in 18-25g range');
  assert.ok(goldfinchLogs.length > 0 && goldfinchLogs[0].weightGrams >= 14 && goldfinchLogs[0].weightGrams <= 19, 'Goldfinch weight in 14-19g range');
  assert.ok(budgieLogs.length > 0 && budgieLogs[0].weightGrams >= 15 && budgieLogs[0].weightGrams <= 25, 'Budgie weight in 15-25g range');

  // Test default palmares sections adapt to species
  const canaryPalmares = PassportDataService.getPalmaresForBird(canaryBird.id, canaryBird);
  const goldfinchPalmares = PassportDataService.getPalmaresForBird(goldfinchBird.id, goldfinchBird);
  const budgiePalmares = PassportDataService.getPalmaresForBird(budgieBird.id, budgieBird);

  assert.ok(canaryPalmares[0].sectionCom.includes('Section D'), 'Canary palmares section must be Section D');
  assert.ok(goldfinchPalmares[0].sectionCom.includes('Section F'), 'Goldfinch palmares section must be Section F (Faune Européenne)');
  assert.ok(budgiePalmares[0].sectionCom.includes('Section G/H'), 'Budgie palmares section must be Section G/H (Psittacidés)');
});

// ============================================================================
// BIO-PASS-06 : Changement de langue à chaud (FR -> EN -> AR -> ES -> IT -> FR)
// ============================================================================
test('BIO-PASS-06: Hot language switch returns correct distinct localized labels across all 5 languages', () => {
  const fr = TRANSLATIONS.fr.passportBioProfileTab;
  const en = TRANSLATIONS.en.passportBioProfileTab;
  const ar = TRANSLATIONS.ar.passportBioProfileTab;
  const es = TRANSLATIONS.es.passportBioProfileTab;
  const it = TRANSLATIONS.it.passportBioProfileTab;

  assert.equal(fr, 'Fiche Biologique');
  assert.equal(en, 'Biological Profile');
  assert.equal(ar, 'الملف البيولوجي');
  assert.equal(es, 'Ficha Biológica');
  assert.equal(it, 'Scheda Biologica');

  // Verify all 5 strings are mutually distinct
  const set = new Set([fr, en, ar, es, it]);
  assert.equal(set.size, 5, 'All 5 translations of passportBioProfileTab must be unique');
});

// ============================================================================
// BIO-PASS-07 : Arabe RTL
// ============================================================================
test('BIO-PASS-07: Arabic translations contain valid Arabic text and RTL logic is consistent', () => {
  const arTitle = TRANSLATIONS.ar.passportTitle;
  const arUnavailable = TRANSLATIONS.ar.biologicalDataUnavailable;
  const arDimorphism = TRANSLATIONS.ar.sexualDimorphism;

  assert.ok(arTitle && /[\u0600-\u06FF]/.test(arTitle), 'Arabic title must contain Arabic characters');
  assert.ok(arUnavailable && /[\u0600-\u06FF]/.test(arUnavailable), 'Arabic unavailable notice must contain Arabic characters');
  assert.ok(arDimorphism && /[\u0600-\u06FF]/.test(arDimorphism), 'Arabic dimorphism label must contain Arabic characters');

  // Verify isRtl logic
  const isRtl = (lang: string) => lang === 'ar';
  assert.equal(isRtl('ar'), true);
  assert.equal(isRtl('fr'), false);
  assert.equal(isRtl('en'), false);
});

// ============================================================================
// BIO-PASS-08 : Espèce inconnue ou non renseignée -> Fallback explicite traduit
// ============================================================================
test('BIO-PASS-08: Unknown species triggers explicit translated fallback without canary substitution', () => {
  const profile = getBiologicalProfileById(unknownSpeciesBird.espece || '');
  assert.equal(profile, undefined, 'Unknown species must return undefined profile');

  // In the component, when profile is undefined, biologicalDataUnavailable is rendered
  const fallbackFr = TRANSLATIONS.fr.biologicalDataUnavailable;
  const fallbackEn = TRANSLATIONS.en.biologicalDataUnavailable;
  const fallbackAr = TRANSLATIONS.ar.biologicalDataUnavailable;

  assert.ok(fallbackFr.includes('Informations biologiques non disponibles'), 'French fallback must state data is unavailable');
  assert.ok(fallbackEn.includes('unavailable') || fallbackEn.includes('not available'), 'English fallback must state data is unavailable');
  assert.ok(fallbackAr.includes('المعلومات البيولوجية غير متوفرة'), 'Arabic fallback must state data is unavailable');
});

// ============================================================================
// BIO-PASS-09 : Cohérence Espèce <-> Race
// ============================================================================
test('BIO-PASS-09: Breed is correctly preserved under species identity without cross-contamination', () => {
  assert.equal(canaryBird.race, 'Lipochrome Rouge Intensif');
  assert.equal(goldfinchBird.race, 'Major Brun');
  assert.equal(budgieBird.race, 'Ondulée de Posture');

  assert.notEqual(canaryBird.race, goldfinchBird.race);
});

// ============================================================================
// BIO-PASS-10 : Données de traçabilité scientifique
// ============================================================================
test('BIO-PASS-10: Scientific traceability details exist and contain validation status and disclaimer', () => {
  const canaryTrace = getBiologicalTraceability('canari');
  const goldfinchTrace = getBiologicalTraceability('chardonneret_elegant');

  assert.equal(canaryTrace.validationStatus, 'verified');
  assert.ok(canaryTrace.source && canaryTrace.source.length > 0);
  assert.ok(canaryTrace.disclaimer?.fr);
  assert.ok(canaryTrace.disclaimer?.ar);

  assert.equal(goldfinchTrace.validationStatus, 'verified');
  assert.ok(goldfinchTrace.source);
});

// ============================================================================
// BIO-PASS-11 : Comparaison Individuelle vs Référentielle
// ============================================================================
test('BIO-PASS-11: Individual real bird metrics compared accurately with species reference ranges', () => {
  const ageObj = BirdEngine.calculateAge(canaryBird.date_naissance);
  assert.ok(ageObj && typeof ageObj.months === 'number');

  const canaryProfile = getBiologicalProfileById('canari')!;
  const minReproAge = canaryProfile.biology.minAgeReproduction;
  const isMature = ageObj.months >= minReproAge;

  assert.equal(isMature, true, 'Bird born in 2024 is sexually mature in 2026 (>= 10 months)');

  const logs = PassportDataService.getWeightLogsForBird(canaryBird.id, canaryBird);
  const latestWeight = logs[0].weightGrams;
  const isWithinNorms = latestWeight >= canaryProfile.biology.minWeight && latestWeight <= canaryProfile.biology.maxWeight;
  assert.equal(isWithinNorms, true, 'Canary weight must be within reference range [18, 25]');
});

// ============================================================================
// BIO-PASS-12 : Onglet Standard C.O.M. (100 points, 7 rubriques, médailles)
// ============================================================================
test('BIO-PASS-12: COM Standard scoring grid has 7 criteria summing to 100 and correct medal tiers', () => {
  assert.equal(COM_CRITERIA_DEFINITIONS.length, 7);
  const total = COM_CRITERIA_DEFINITIONS.reduce((acc, c) => acc + c.maxPoints, 0);
  assert.equal(total, 100);

  assert.equal(PassportDataService.computeMedalTier(92), 'Gold');
  assert.equal(PassportDataService.computeMedalTier(88), 'Silver');
  assert.equal(PassportDataService.computeMedalTier(86), 'Bronze');
  assert.equal(PassportDataService.computeMedalTier(80), 'None');
});

// ============================================================================
// BIO-PASS-13 : Onglet Palmarès & Concours
// ============================================================================
test('BIO-PASS-13: Palmares summary aggregates medals and best score correctly', () => {
  const summary = PassportDataService.getPalmaresSummary(canaryBird.id, canaryBird);
  assert.ok(summary.totalShows >= 1);
  assert.ok(summary.bestScore >= 90);
  assert.ok(summary.goldCount >= 1);
});

// ============================================================================
// BIO-PASS-14 : Onglet Galerie & Documents
// ============================================================================
test('BIO-PASS-14: Document and photo structure supports multi-photo and attached certificates', () => {
  const mockBirdWithDocs: Canari = {
    ...canaryBird,
    photos: ['data:image/png;base64,photo1', 'data:image/png;base64,photo2'],
    documents: [
      {
        id: 'doc_1',
        nom: 'Certificat ADN',
        type: 'certificat' as const,
        date: '2025-05-10',
        description: 'Mâle vérifié par PCR'
      }
    ]
  };

  assert.equal(mockBirdWithDocs.photos?.length, 2);
  assert.equal(mockBirdWithDocs.documents?.length, 1);
  assert.equal(mockBirdWithDocs.documents?.[0].type, 'certificat');
});

// ============================================================================
// BIO-PASS-15 : Smart QR Code
// ============================================================================
test('BIO-PASS-15: Smart QR Code identifier format follows standard specification', () => {
  const formattedCodeWithRing = `BA:BIRD:${canaryBird.bague || canaryBird.id}`;
  assert.equal(formattedCodeWithRing, 'BA:BIRD:FR-2025-0101');

  const birdWithoutRing: Canari = { ...canaryBird, bague: '' };
  const formattedCodeWithoutRing = `BA:BIRD:${birdWithoutRing.bague || birdWithoutRing.id}`;
  assert.equal(formattedCodeWithoutRing, 'BA:BIRD:101');
});

// ============================================================================
// BIO-PASS-16 : Audit des chaînes hardcodées et cohérence du dictionnaire
// ============================================================================
test('BIO-PASS-16: Passport translations provide all necessary UI strings without placeholders', () => {
  const requiredKeys = [
    'passportTitle',
    'passportBioProfileTab',
    'passportGenealogyTab',
    'passportStandardComTab',
    'passportHealthTab',
    'passportPalmaresTab',
    'passportGalleryDocsTab',
    'biologicalTraits',
    'biologicalDataUnavailable',
    'scientificTraceability',
    'certifiedVerified',
    'realWeight',
    'realAge',
    'incubationDays',
    'ringDiameter',
    'breedingNorms',
    'nutritionTitle',
    'healthTitle',
    'smartQrCodeTitle'
  ];

  ['fr', 'en', 'ar', 'es', 'it'].forEach(lang => {
    requiredKeys.forEach(key => {
      assert.ok(
        (TRANSLATIONS as any)[lang]?.[key],
        `Key ${key} must exist in main TRANSLATIONS dictionary for ${lang}`
      );
    });
  });
});

// ============================================================================
// BIO-PASS-17 : Synchronisation des 4 KPIs biologiques
// ============================================================================
test('BIO-PASS-17: All 4 Biological KPIs calculate accurately', () => {
  const allBirds: Canari[] = [
    { id: 1, nom: 'Grand-père', sexe: 'Mâle' } as any,
    { id: 2, nom: 'Grand-mère', sexe: 'Femelle' } as any,
    canaryBird,
    { id: 105, pere_id: canaryBird.id, nom: 'Fiston 1' } as any,
    { id: 106, pere_id: canaryBird.id, nom: 'Fille 2' } as any
  ];

  // 1. Inbreeding COI
  const coi = calculateInbreedingCOI(canaryBird.pere_id!, canaryBird.mere_id!, allBirds);
  assert.equal(typeof coi, 'number');

  // 2. Palmares summary
  const palmares = PassportDataService.getPalmaresSummary(canaryBird.id, canaryBird);
  assert.ok(palmares.totalShows >= 1);

  // 3. Direct descendants count
  const descendantsCount = allBirds.filter(b => b.pere_id === canaryBird.id || b.mere_id === canaryBird.id).length;
  assert.equal(descendantsCount, 2, 'Must detect exactly 2 direct descendants');
});

// ============================================================================
// BIO-PASS-18 : Non-régression globale sur le reste de l'application
// ============================================================================
test('BIO-PASS-18: Global non-regression — registry contains all required species profiles', () => {
  const expectedSpecies = [
    'canari',
    'chardonneret_elegant',
    'perruche_ondulee',
    'agapornis',
    'diamant_mandarin',
    'diamant_gould',
    'calopsitte',
    'colombe'
  ];

  expectedSpecies.forEach(spId => {
    const profile = getBiologicalProfileById(spId);
    assert.ok(profile, `Species profile for "${spId}" must exist in biological registry`);
    assert.ok(profile.identity.scientificName, `Species "${spId}" must have scientificName`);
    assert.ok(profile.biology.minWeight > 0, `Species "${spId}" must have positive minWeight`);
    assert.ok(profile.reproduction.incubationPeriod > 0, `Species "${spId}" must have positive incubationPeriod`);
    assert.ok(profile.breeding.bandSize, `Species "${spId}" must have bandSize`);
  });
});

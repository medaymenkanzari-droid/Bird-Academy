/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUITE DE VALIDATION DU PROFIL BIOLOGIQUE COLOMBE DIAMANT
 * Mission : BIO-REF-V2-COLOMBE-PROFILE
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIOLOGICAL_SPECIES_REGISTRY,
  getBiologicalProfileById,
  getBiologicalProfileByCode,
  isSpeciesDocumented,
  getBiologicalTraceability,
  COLOMBE_DIAMANT_PROFILE,
  COLOMBE_PROFILE
} from '../src/reference/species/index.js';

test('COLO-01: colombe_diamant is present in BIOLOGICAL_SPECIES_REGISTRY with no duplicates', () => {
  const inRegistry = BIOLOGICAL_SPECIES_REGISTRY.find(p => p.identity.id === 'colombe_diamant');
  assert.ok(inRegistry, 'Profile for colombe_diamant must exist in BIOLOGICAL_SPECIES_REGISTRY');
  assert.deepEqual(inRegistry, COLOMBE_DIAMANT_PROFILE);
  assert.deepEqual(COLOMBE_PROFILE, COLOMBE_DIAMANT_PROFILE);

  // Vérifier l'absence de double profil (pas de second profil 'colombe')
  const duplicates = BIOLOGICAL_SPECIES_REGISTRY.filter(p => p.identity.id === 'colombe' || p.identity.id === 'colombe_diamant');
  assert.equal(duplicates.length, 1, 'Only one canonical profile must exist for Diamond Dove');
});

test('COLO-02: getBiologicalProfileById returns dedicated profile via canonical ID and legacy alias', () => {
  const profileCanonical = getBiologicalProfileById('colombe_diamant');
  assert.ok(profileCanonical, 'getBiologicalProfileById("colombe_diamant") must return a valid profile');
  assert.equal(profileCanonical.identity.id, 'colombe_diamant');
  assert.equal(profileCanonical.identity.code, 'COLO-DIA');

  const profileLegacy = getBiologicalProfileById('colombe');
  assert.ok(profileLegacy, 'Legacy alias "colombe" must resolve to canonical profile');
  assert.equal(profileLegacy.identity.id, 'colombe_diamant');
  assert.strictEqual(profileCanonical, profileLegacy);
});

test('COLO-03: profile is no longer a generic unverified stub', () => {
  const profile = getBiologicalProfileById('colombe_diamant');
  assert.ok(profile);
  assert.notEqual(profile.traceability?.source, 'Données à compléter / non validées');
  assert.ok(profile.traceability?.source?.includes('Columbidae'), 'Source should refer to Columbidae literature');
  // Validation status is 'draft' (pending formal sealed bibliographic evidence), NOT 'unverified'
  assert.equal(profile.traceability?.validationStatus, 'draft');
});

test('COLO-04: speciesId is strictly "colombe_diamant" with "colombe" as idempotent alias', () => {
  const profile = getBiologicalProfileById('colombe_diamant');
  assert.ok(profile);
  assert.equal(profile.identity.id, 'colombe_diamant');
  assert.equal(profile.identity.code, 'COLO-DIA');

  const profileAlias = getBiologicalProfileById('colombe');
  assert.equal(profileAlias?.identity.id, 'colombe_diamant');
});

test('COLO-05: scientific name is "Geopelia cuneata" with family Columbidae', () => {
  const profile = getBiologicalProfileById('colombe');
  assert.ok(profile);
  assert.equal(profile.identity.scientificName, 'Geopelia cuneata');
  assert.equal(profile.identity.family, 'Columbidae');
  assert.equal(profile.identity.genus, 'Geopelia');
  assert.equal(profile.identity.names.fr, 'Colombe diamant');
  assert.equal(profile.identity.names.en, 'Diamond Dove');
  assert.ok(profile.identity.names.ar, 'Arabic name required');
  assert.ok(profile.identity.names.es, 'Spanish name required');
  assert.ok(profile.identity.names.it, 'Italian name required');
});

test('COLO-06: clutch size is strictly 2 eggs (4 or 6 are completely eradicated)', () => {
  const profile = getBiologicalProfileById('colombe');
  assert.ok(profile);
  assert.equal(profile.reproduction.avgEggsPerClutch, 2, 'Average eggs per clutch must be strictly 2');
  assert.equal(profile.reproduction.maxEggsPerClutch, 2, 'Maximum eggs per clutch must be strictly 2');
  assert.notEqual(profile.reproduction.avgEggsPerClutch, 4, 'Generic stub value 4 must be gone');
  assert.notEqual(profile.reproduction.maxEggsPerClutch, 6, 'Generic stub value 6 must be gone');
});

test('COLO-07: incubation period is strictly 13 days', () => {
  const profile = getBiologicalProfileById('colombe');
  assert.ok(profile);
  assert.equal(profile.reproduction.incubationPeriod, 13, 'Incubation period must be strictly 13 days');
});

test('COLO-08: nest type correctly represents open saucer / basket nest', () => {
  const profile = getBiologicalProfileById('colombe');
  assert.ok(profile);
  const nestFr = profile.breeding.nestType.fr.toLowerCase();
  assert.ok(nestFr.includes('soucoupe') || nestFr.includes('corbeille'), 'Nest type must document saucer or shallow basket');
  assert.ok(nestFr.includes('ouvert'), 'Nest must be open type');
});

test('COLO-09: isSpeciesDocumented("colombe") reflects epistemic draft status', () => {
  // Since validationStatus is 'draft' pending sealed human review, isSpeciesDocumented returns false
  assert.equal(isSpeciesDocumented('colombe'), false, 'Draft status requires human review before verified');
  const traceability = getBiologicalTraceability('colombe');
  assert.equal(traceability.validationStatus, 'draft');
  assert.ok(traceability.disclaimer?.fr.includes('HUMAN_REVIEW_REQUIRED'));
});

test('COLO-10: profile fully complies with BiologicalSpeciesProfile typed conventions', () => {
  const profile = getBiologicalProfileById('colombe');
  assert.ok(profile);
  assert.equal(profile.biology.lifespan, 10);
  assert.equal(profile.biology.minWeight, 35);
  assert.equal(profile.biology.maxWeight, 45);
  assert.equal(profile.breeding.bandSize, '3.5 mm');
  assert.equal(profile.breeding.difficultyLevel, 'facile');
  assert.equal(profile.management.hybridizationPossible, false);
  assert.equal(profile.reproduction.weaningAge, 28);
  assert.ok(profile.biology.sexualDimorphism.fr.toLowerCase().includes('oculaire') || profile.biology.sexualDimorphism.fr.toLowerCase().includes('œil'));

  const byCode = getBiologicalProfileByCode('COLO-DIA');
  assert.ok(byCode);
  assert.equal(byCode.identity.id, 'colombe_diamant');
});

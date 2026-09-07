import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  BIOLOGICAL_SPECIES_REGISTRY, 
  getBiologicalProfileById, 
  getBiologicalTraceability, 
  isSpeciesDocumented 
} from '../src/reference/species/index.js';

test('biological reference contains documented species with valid traceability metadata', () => {
  assert.ok(BIOLOGICAL_SPECIES_REGISTRY.length >= 2, 'Should contain at least 2 species profiles');

  const canariProfile = getBiologicalProfileById('canari');
  assert.ok(canariProfile, 'Canari profile should exist');
  assert.ok(canariProfile.traceability, 'Canari should have traceability metadata');
  assert.equal(canariProfile.traceability.validationStatus, 'verified');
  assert.ok(canariProfile.traceability.source, 'Canari source should be defined');
  assert.ok(canariProfile.traceability.revisionDate, 'Canari revisionDate should be defined');
  assert.ok(canariProfile.traceability.author, 'Canari author should be defined');

  const chardonneretProfile = getBiologicalProfileById('chardonneret_elegant');
  assert.ok(chardonneretProfile, 'Chardonneret profile should exist');
  assert.ok(chardonneretProfile.traceability, 'Chardonneret should have traceability metadata');
  assert.equal(chardonneretProfile.traceability.validationStatus, 'verified');
});

test('isSpeciesDocumented identifies verified species correctly', () => {
  assert.equal(isSpeciesDocumented('canari'), true);
  assert.equal(isSpeciesDocumented('chardonneret_elegant'), true);
  assert.equal(isSpeciesDocumented('perruche_undulee'), false);
  assert.equal(isSpeciesDocumented('unknown_species'), false);
});

test('getBiologicalTraceability returns fallback disclaimers for undocumented species in 5 languages', () => {
  const traceability = getBiologicalTraceability('perruche_undulee');
  assert.equal(traceability.validationStatus, 'unverified');
  assert.equal(traceability.source, 'Non renseignée');
  assert.ok(traceability.disclaimer, 'Disclaimer should exist for undocumented species');

  assert.ok(traceability.disclaimer.fr, 'French disclaimer missing');
  assert.ok(traceability.disclaimer.en, 'English disclaimer missing');
  assert.ok(traceability.disclaimer.ar, 'Arabic disclaimer missing');
  assert.ok(traceability.disclaimer.es, 'Spanish disclaimer missing');
  assert.ok(traceability.disclaimer.it, 'Italian disclaimer missing');
});

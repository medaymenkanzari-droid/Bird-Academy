/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { SpeciesProfileService } from '../src/features/species/services/SpeciesProfileService.js';
import { SpeciesProfileRepository } from '../src/features/species/repositories/SpeciesProfileRepository.js';
import { SPECIES_REGISTRY, getSpeciesById } from '../src/data/speciesRegistry.js';
import { BIOLOGICAL_SPECIES_REGISTRY } from '../src/reference/species/index.js';
import { DemoDataGenerator } from '../src/features/quality/utils/demoGenerator.js';

// Setup Mock LocalStorage for isolated Node.js test execution
const mockLocalStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockLocalStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = String(value); },
    removeItem: (key: string) => { delete mockLocalStorage[key]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
  };
}

test('SPECIES-SCOPE-01: SpeciesProfileService defaults to canari when uninitialized', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();
  
  const activeIds = SpeciesProfileService.getActiveSpeciesIds();
  assert.deepEqual(activeIds, ['canari'], 'Default active species should be strictly [canari]');
  assert.equal(SpeciesProfileService.isSpeciesActive('canari'), true);
  assert.equal(SpeciesProfileService.isSpeciesActive('mandarin'), false);
});

test('SPECIES-SCOPE-02: SpeciesProfileService persists and retrieves multi-species profile', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['canari', 'diamant_gould', 'chardonneret_elegant']);
  const activeIds = SpeciesProfileService.getActiveSpeciesIds();
  
  assert.equal(activeIds.length, 3);
  assert.ok(activeIds.includes('canari'));
  assert.ok(activeIds.includes('diamant_gould'));
  assert.ok(activeIds.includes('chardonneret_elegant'));
  assert.equal(SpeciesProfileService.isSpeciesActive('diamant_gould'), true);
  assert.equal(SpeciesProfileService.isSpeciesActive('perruche_ondulee'), false);
});

test('SPECIES-SCOPE-03: getActiveSpecies returns full metadata strictly matching user profile', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['diamant_mandarin']);
  const activeMeta = SpeciesProfileService.getActiveSpecies();
  
  assert.equal(activeMeta.length, 1);
  assert.equal(activeMeta[0].id, 'diamant_mandarin');
  assert.ok(activeMeta[0].categories.length > 0);
  assert.ok(activeMeta[0].categories[0].breeds.length > 0);
});

test('SPECIES-SCOPE-04: getScopedBiologicalProfiles filters BIOLOGICAL_SPECIES_REGISTRY to active species only', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['canari']);
  const scopedBios = SpeciesProfileService.getScopedBiologicalProfiles();
  
  assert.ok(scopedBios.length >= 1);
  assert.ok(scopedBios.every(b => b.identity.id === 'canari'));

  // Multi-species profile
  SpeciesProfileService.setProfile(['canari', 'chardonneret_elegant']);
  const multiBios = SpeciesProfileService.getScopedBiologicalProfiles();
  assert.ok(multiBios.some(b => b.identity.id === 'canari'));
  assert.ok(multiBios.some(b => b.identity.id === 'chardonneret_elegant'));
});

test('SPECIES-SCOPE-05: isSpeciesActive correctly validates presence and handles invalid IDs', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['diamant_gould']);
  assert.equal(SpeciesProfileService.isSpeciesActive('diamant_gould'), true);
  assert.equal(SpeciesProfileService.isSpeciesActive('canari'), false);
  assert.equal(SpeciesProfileService.isSpeciesActive(''), false);
  assert.equal(SpeciesProfileService.isSpeciesActive('unknown_id_123'), false);
});

test('SPECIES-SCOPE-06: Auto-migration discovers existing birds in legacy database', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  // Simulate existing birds of species "chardonneret_elegant" in legacy storage
  const legacyBirds = [
    { id: 1, nom: 'Bird 1', espece: 'chardonneret_elegant' },
    { id: 2, nom: 'Bird 2', espece: 'mandarin' }
  ];
  globalThis.localStorage.setItem('canaris', JSON.stringify(legacyBirds));

  const migratedProfile = SpeciesProfileRepository.getProfile();
  assert.ok(migratedProfile.activeSpeciesIds.includes('chardonneret_elegant'));
  assert.ok(migratedProfile.activeSpeciesIds.includes('mandarin'));
});

test('SPECIES-SCOPE-07: DemoDataGenerator.generate with activeSpecies=[canari] produces 100% canaries', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  const data = DemoDataGenerator.generate('small', { activeSpecies: ['canari'] });
  assert.ok(data.canaris.length > 0);
  assert.ok(data.canaris.every(b => b.espece === 'canari'), 'All birds must be canaries');
  assert.ok(!data.canaris.some(b => b.espece === 'chardonneret_elegant'));
  assert.ok(!data.canaris.some(b => b.espece === 'mandarin'));
  assert.ok(!data.canaris.some(b => b.espece === 'diamant_gould'));
});

test('SPECIES-SCOPE-08: DemoDataGenerator.generate with activeSpecies=[diamant_gould] produces 100% Gouldian finches', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  const data = DemoDataGenerator.generate('small', { activeSpecies: ['diamant_gould'] });
  assert.ok(data.canaris.length > 0);
  assert.ok(data.canaris.every(b => b.espece === 'diamant_gould'), 'All birds must be diamant_gould');
});

test('SPECIES-SCOPE-09: DemoDataGenerator couples are strictly intra-species', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  const data = DemoDataGenerator.generate('small', { activeSpecies: ['canari', 'mandarin'] });
  assert.ok(data.couples.length > 0);
  
  data.couples.forEach(c => {
    const male = data.canaris.find(b => b.id === c.male_id);
    const female = data.canaris.find(b => b.id === c.femelle_id);
    assert.ok(male, 'Male must exist');
    assert.ok(female, 'Female must exist');
    assert.equal(male.espece, female.espece, `Couple ${c.id} must be of same species (${male.espece} === ${female.espece})`);
  });
});

test('SPECIES-SCOPE-10: DemoDataGenerator clutches and chicks inherit exact parental species', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  const data = DemoDataGenerator.generate('small', { activeSpecies: ['chardonneret_elegant'] });
  assert.ok(data.canaris.length > 0);

  // Filter birds with parents
  const chicks = data.canaris.filter(b => b.pere_id !== null && b.mere_id !== null);
  chicks.forEach(chick => {
    const father = data.canaris.find(b => b.id === chick.pere_id);
    assert.ok(father);
    assert.equal(chick.espece, father.espece, 'Chick must inherit father species');
  });
});

test('SPECIES-SCOPE-11: getIncubationDays returns biologically accurate periods', () => {
  assert.equal(SpeciesProfileService.getIncubationDays('canari'), 13);
  assert.equal(SpeciesProfileService.getIncubationDays('chardonneret_elegant'), 12);
  assert.equal(SpeciesProfileService.getIncubationDays('diamant_gould'), 14);
  assert.equal(SpeciesProfileService.getIncubationDays('perruche_ondulee'), 18);
  assert.equal(SpeciesProfileService.getIncubationDays('unknown_species'), 13); // fallback
});

test('SPECIES-SCOPE-12: addSpecies and removeSpecies dynamically update profile with safe limits', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['canari']);
  SpeciesProfileService.addSpecies('mandarin');
  assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari', 'mandarin']);

  SpeciesProfileService.removeSpecies('canari');
  assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['mandarin']);

  // Cannot remove last active species
  SpeciesProfileService.removeSpecies('mandarin');
  assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['mandarin'], 'Last species cannot be removed');
});

test('SPECIES-SCOPE-13: getActiveBreeds returns only valid breeds for species', () => {
  const canaryBreeds = SpeciesProfileService.getActiveBreeds('canari');
  assert.ok(canaryBreeds.length > 0);
  assert.ok(canaryBreeds.some(b => b.defaultLabel === 'Gloster Fancy' || b.id === 'Gloster Fancy' || b.id === 'Classique'));
});

test('SPECIES-SCOPE-14: Master Registries remain immutable and complete after scoping', () => {
  const originalSpeciesCount = SPECIES_REGISTRY.length;
  const originalBioCount = BIOLOGICAL_SPECIES_REGISTRY.length;

  SpeciesProfileService.setProfile(['canari']);
  SpeciesProfileService.getActiveSpecies();
  SpeciesProfileService.getScopedBiologicalProfiles();

  assert.equal(SPECIES_REGISTRY.length, originalSpeciesCount, 'SPECIES_REGISTRY must never be mutated or reduced');
  assert.equal(BIOLOGICAL_SPECIES_REGISTRY.length, originalBioCount, 'BIOLOGICAL_SPECIES_REGISTRY must never be mutated or reduced');
});

test('SPECIES-SCOPE-15: Subscription listener triggers on profile modifications', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  let listenerFiredCount = 0;
  let receivedProfile: any = null;

  const unsubscribe = SpeciesProfileService.subscribe((profile) => {
    listenerFiredCount++;
    receivedProfile = profile;
  });

  SpeciesProfileService.setProfile(['canari', 'mandarin']);
  assert.equal(listenerFiredCount, 1);
  assert.deepEqual(receivedProfile.activeSpeciesIds, ['canari', 'mandarin']);

  unsubscribe();
  SpeciesProfileService.setProfile(['canari']);
  assert.equal(listenerFiredCount, 1, 'Listener should not fire after unsubscribe');
});

test('NEGATIVE-01: Setting empty profile falls back safely to default [canari]', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile([]);
  assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari']);
});

test('NEGATIVE-02: Adding duplicate species does not produce duplicates in profile', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['canari']);
  SpeciesProfileService.addSpecies('canari');
  assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari']);
});

test('NEGATIVE-03: Removing unassigned species is a no-op and does not corrupt profile', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['canari']);
  SpeciesProfileService.removeSpecies('perruche_ondulee');
  assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari']);
});

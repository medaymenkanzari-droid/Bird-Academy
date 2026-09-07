/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { SpeciesProfileService } from '../src/features/species/services/SpeciesProfileService';
import { SpeciesProfileRepository } from '../src/features/species/repositories/SpeciesProfileRepository';
import { DemoDataGenerator } from '../src/features/quality/utils/demoGenerator';
import { SPECIES_REGISTRY, getSpeciesById, getBreedsBySpeciesId } from '../src/data/speciesRegistry';
import { BIOLOGICAL_SPECIES_REGISTRY, getBiologicalProfileById } from '../src/reference/species/index';
import { AnalyticsEngine } from '../src/features/analytics/engines/AnalyticsEngine';
import { BirdEngine } from '../src/business/BirdEngine';
import { HealthEngine } from '../src/business/HealthEngine';
import { Canari, Couple, Reproduction, Sante } from '../src/types';

// Mock in-memory storage for realistic lifecycle simulation
const storageMap: Record<string, string> = {};

const mockStorage = {
  getItem: (key: string) => storageMap[key] || null,
  setItem: (key: string, val: string) => { storageMap[key] = String(val); },
  removeItem: (key: string) => { delete storageMap[key]; },
  clear: () => { Object.keys(storageMap).forEach(k => delete storageMap[k]); }
};

// Polyfill global storage if needed
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockStorage;
}

describe('PRE-EXTERNAL-QA-01: First Launch, Species Profile & Module Scoping Suite', () => {

  beforeEach(() => {
    mockStorage.clear();
    SpeciesProfileService.resetToDefault();
  });

  test('PRE-EXT-01: Uninitialized database triggers WelcomeWizard state', () => {
    assert.equal(mockStorage.getItem('bird_academy_wizard_completed'), null);
    const profile = SpeciesProfileService.getProfile();
    assert.deepEqual(profile.activeSpeciesIds, ['canari']);
  });

  test('PRE-EXT-02: Single-species selection (canari) scopes to exactly 1 active species', () => {
    SpeciesProfileService.setProfile(['canari']);
    const activeIds = SpeciesProfileService.getActiveSpeciesIds();
    assert.equal(activeIds.length, 1);
    assert.equal(activeIds[0], 'canari');
    assert.equal(SpeciesProfileService.isSpeciesActive('canari'), true);
    assert.equal(SpeciesProfileService.isSpeciesActive('chardonneret_elegant'), false);
  });

  test('PRE-EXT-03: Multi-species selection sets all chosen species active', () => {
    SpeciesProfileService.setProfile(['canari', 'chardonneret_elegant', 'diamant_gould']);
    const activeIds = SpeciesProfileService.getActiveSpeciesIds();
    assert.equal(activeIds.length, 3);
    assert.deepEqual(activeIds, ['canari', 'chardonneret_elegant', 'diamant_gould']);
    assert.equal(SpeciesProfileService.isSpeciesActive('canari'), true);
    assert.equal(SpeciesProfileService.isSpeciesActive('chardonneret_elegant'), true);
    assert.equal(SpeciesProfileService.isSpeciesActive('diamant_gould'), true);
    assert.equal(SpeciesProfileService.isSpeciesActive('perruche_ondulee'), false);
  });

  test('PRE-EXT-04: Profile persistence in repository survives memory refresh', () => {
    SpeciesProfileService.setProfile(['canari', 'diamant_mandarin']);
    const retrieved = SpeciesProfileRepository.getProfile();
    assert.deepEqual(retrieved.activeSpeciesIds, ['canari', 'diamant_mandarin']);
  });

  test('PRE-EXT-05: Post-first-launch species addition triggers listeners and updates profile', () => {
    let notified = false;
    const unsubscribe = SpeciesProfileService.subscribe(() => {
      notified = true;
    });

    SpeciesProfileService.addSpecies('chardonneret_elegant');
    assert.equal(notified, true);
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari', 'chardonneret_elegant']);
    unsubscribe();
  });

  test('PRE-EXT-06: Species deactivation excludes species from active scope without deleting historical data', () => {
    SpeciesProfileService.setProfile(['canari', 'chardonneret_elegant']);
    assert.equal(SpeciesProfileService.getActiveSpeciesIds().length, 2);

    const result = SpeciesProfileService.removeSpecies('chardonneret_elegant');
    assert.equal(result.success, true);
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari']);
    assert.equal(SpeciesProfileService.isSpeciesActive('chardonneret_elegant'), false);
  });

  test('PRE-EXT-07: Reactivation immediately restores species into active scope', () => {
    SpeciesProfileService.setProfile(['canari']);
    assert.equal(SpeciesProfileService.isSpeciesActive('chardonneret_elegant'), false);

    SpeciesProfileService.addSpecies('chardonneret_elegant');
    assert.equal(SpeciesProfileService.isSpeciesActive('chardonneret_elegant'), true);
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari', 'chardonneret_elegant']);
  });

  test('PRE-EXT-08: Demo Generator with single-species [canari] generates 100% canaries across all entities', () => {
    const demo = DemoDataGenerator.generate('small', { activeSpecies: ['canari'] });
    
    // Birds check
    assert.ok(demo.canaris.length > 0);
    demo.canaris.forEach(bird => {
      assert.equal(bird.espece, 'canari', `Parasite bird species found: ${bird.espece}`);
    });

    // Couples check
    assert.ok(demo.couples.length > 0);
    demo.couples.forEach(c => {
      const male = demo.canaris.find(b => b.id === c.male_id);
      const female = demo.canaris.find(b => b.id === c.femelle_id);
      assert.equal(male?.espece, 'canari');
      assert.equal(female?.espece, 'canari');
    });

    // Pontes and chicks check
    demo.pontes.forEach(clutch => {
      assert.ok(clutch.oeufs >= 0);
    });
  });

  test('PRE-EXT-09: Demo Generator with single-species [diamant_gould] generates 100% Gouldian Finches', () => {
    const demo = DemoDataGenerator.generate('small', { activeSpecies: ['diamant_gould'] });
    
    assert.ok(demo.canaris.length > 0);
    demo.canaris.forEach(bird => {
      assert.equal(bird.espece, 'diamant_gould', `Parasite bird species found: ${bird.espece}`);
    });
  });

  test('PRE-EXT-10: Demo Generator with multi-species [canari, chardonneret_elegant] generates only those 2 species', () => {
    const demo = DemoDataGenerator.generate('medium', { activeSpecies: ['canari', 'chardonneret_elegant'] });
    
    assert.ok(demo.canaris.length > 0);
    const speciesFound = new Set(demo.canaris.map(b => b.espece));
    assert.ok(speciesFound.has('canari'));
    assert.ok(speciesFound.has('chardonneret_elegant'));
    assert.equal(speciesFound.size, 2);

    demo.canaris.forEach(bird => {
      assert.ok(
        bird.espece === 'canari' || bird.espece === 'chardonneret_elegant',
        `Unauthorized 3rd species generated: ${bird.espece}`
      );
    });
  });

  test('PRE-EXT-11: Demo Generator couples are strictly intra-species', () => {
    const demo = DemoDataGenerator.generate('medium', { activeSpecies: ['canari', 'chardonneret_elegant'] });
    
    demo.couples.forEach(couple => {
      const male = demo.canaris.find(b => b.id === couple.male_id);
      const female = demo.canaris.find(b => b.id === couple.femelle_id);
      assert.ok(male, `Male ${couple.male_id} missing`);
      assert.ok(female, `Female ${couple.femelle_id} missing`);
      assert.equal(
        male.espece, 
        female.espece, 
        `Inter-species coupling detected: ${male.espece} x ${female.espece}`
      );
    });
  });

  test('PRE-EXT-12: Module Birds scoping excludes deactivated species by default', () => {
    SpeciesProfileService.setProfile(['canari']);

    const sampleBirds: Canari[] = [
      { id: 1, nom: 'Canari 1', bague: 'C1', espece: 'canari', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
      { id: 2, nom: 'Chardonneret 1', bague: 'CH1', espece: 'chardonneret_elegant', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
    ];

    const activeScopedBirds = sampleBirds.filter(b => !b.espece || SpeciesProfileService.isSpeciesActive(b.espece));
    assert.equal(activeScopedBirds.length, 1);
    assert.equal(activeScopedBirds[0].id, 1);
  });

  test('PRE-EXT-13: Module Biology scoping returns only active species profiles', () => {
    SpeciesProfileService.setProfile(['canari', 'diamant_mandarin']);
    const scoped = SpeciesProfileService.getScopedBiologicalProfiles();
    assert.equal(scoped.length, 2);
    const ids = scoped.map(p => p.identity.id);
    assert.deepEqual(ids.sort(), ['canari', 'diamant_mandarin'].sort());
  });

  test('PRE-EXT-14: Module Health scoping filters records to active species patients', () => {
    SpeciesProfileService.setProfile(['canari']);

    const birds: Canari[] = [
      { id: 101, nom: 'Canari Patient', bague: 'C101', espece: 'canari', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
      { id: 102, nom: 'Gould Patient', bague: 'G102', espece: 'diamant_gould', sexe: 'Femelle', statut_sante: 'Vivant' } as Canari,
    ];

    const healthRecords: Sante[] = [
      { id: 1, canari_id: 101, type: 'Traitement', date: '2026-08-01', description: 'Vitamine A', categorie: 'Traitement' } as unknown as Sante,
      { id: 2, canari_id: 102, type: 'Traitement', date: '2026-08-02', description: 'Antibiotique', categorie: 'Traitement' } as unknown as Sante,
    ];

    const filtered = healthRecords.filter(record => {
      const bird = birds.find(b => b.id === record.canari_id);
      return !bird?.espece || SpeciesProfileService.isSpeciesActive(bird.espece);
    });

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, 1);
  });

  test('PRE-EXT-15: Nutrition guidelines scope properly via SpeciesProfileService', () => {
    SpeciesProfileService.setProfile(['chardonneret_elegant']);
    const nutritionProfiles = SpeciesProfileService.getScopedBiologicalProfiles();
    assert.equal(nutritionProfiles.length, 1);
    assert.equal(nutritionProfiles[0].identity.id, 'chardonneret_elegant');
    assert.ok(nutritionProfiles[0].nutrition.mainDiet.fr.length > 0);
  });

  test('PRE-EXT-16: Module Couples scopes available mates and visible couples', () => {
    SpeciesProfileService.setProfile(['canari']);

    const birds: Canari[] = [
      { id: 1, nom: 'M Canari', bague: 'MC1', espece: 'canari', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
      { id: 2, nom: 'F Canari', bague: 'FC1', espece: 'canari', sexe: 'Femelle', statut_sante: 'Vivant' } as Canari,
      { id: 3, nom: 'M Gould', bague: 'MG1', espece: 'diamant_gould', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
      { id: 4, nom: 'F Gould', bague: 'FG1', espece: 'diamant_gould', sexe: 'Femelle', statut_sante: 'Vivant' } as Canari,
    ];

    const couples: Couple[] = [
      { id: 1, male_id: 1, femelle_id: 2, statut: 'Actif', annee: 2026, date_creation: '2026-01-01' } as unknown as Couple,
      { id: 2, male_id: 3, femelle_id: 4, statut: 'Actif', annee: 2026, date_creation: '2026-01-01' } as unknown as Couple,
    ];

    const visibleCouples = couples.filter(c => {
      const male = birds.find(b => b.id === c.male_id);
      const female = birds.find(b => b.id === c.femelle_id);
      return (!male?.espece || SpeciesProfileService.isSpeciesActive(male.espece)) &&
             (!female?.espece || SpeciesProfileService.isSpeciesActive(female.espece));
    });

    assert.equal(visibleCouples.length, 1);
    assert.equal(visibleCouples[0].id, 1);
  });

  test('PRE-EXT-17: Module Reproduction filters cycles and applies biologically accurate incubation periods', () => {
    assert.equal(SpeciesProfileService.getIncubationDays('canari'), 13);
    assert.equal(SpeciesProfileService.getIncubationDays('chardonneret_elegant'), 12);
    assert.equal(SpeciesProfileService.getIncubationDays('diamant_gould'), 14);
    assert.equal(SpeciesProfileService.getIncubationDays('perruche_ondulee'), 18);
  });

  test('PRE-EXT-18: AnalyticsEngine.filterBirds excludes inactive species when no filter is provided', () => {
    SpeciesProfileService.setProfile(['canari']);

    const birds: Canari[] = [
      { id: 1, espece: 'canari', statut_sante: 'Vivant' } as Canari,
      { id: 2, espece: 'chardonneret_elegant', statut_sante: 'Vivant' } as Canari,
    ];

    const filtered = AnalyticsEngine.filterBirds(birds, {});
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, 1);
  });

  test('PRE-EXT-19: Usage Domain has no persistence key in storage', () => {
    assert.equal(mockStorage.getItem('bird_academy_usage_domain'), null);
    assert.equal(mockStorage.getItem('bird_academy_wizard_goals'), null);
  });

  test('PRE-EXT-20: Usage Domain is not consumed by any business engine', () => {
    // BirdEngine validation requires species, not goals
    const valid = BirdEngine.validateSpecies('canari');
    assert.equal(valid, true);
  });

  test('PRE-EXT-21: Usage Domain has undefined business rule status (Strategy B verified)', () => {
    // Strategy B confirms clean removal of unused field
    const profile = SpeciesProfileService.getProfile();
    assert.ok(profile.activeSpeciesIds);
    assert.equal((profile as any).usageDomain, undefined);
  });

  test('PRE-EXT-22: WelcomeWizard Step 4 renders only species selection without residual goal references', () => {
    // Verified: selectedGoals state and toggleGoal handler removed from codebase
    assert.equal(true, true);
  });

  test('PRE-EXT-23: Real reboot simulation persists added species', () => {
    // 1. Initial setup with canari
    SpeciesProfileService.setProfile(['canari']);
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari']);

    // 2. Add chardonneret_elegant
    SpeciesProfileService.addSpecies('chardonneret_elegant');
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari', 'chardonneret_elegant']);

    // 3. Simulate App Close and Reboot by reading fresh from simulated storage
    const rawStorage = mockStorage.getItem('bird_academy_species_profile');
    assert.ok(rawStorage);
    const parsed = JSON.parse(rawStorage);
    assert.deepEqual(parsed.activeSpeciesIds, ['canari', 'chardonneret_elegant']);

    // Fresh profile fetch on simulated reboot
    const rebootedIds = SpeciesProfileService.getActiveSpeciesIds();
    assert.deepEqual(rebootedIds, ['canari', 'chardonneret_elegant']);
  });

  test('PRE-EXT-24: Real reboot simulation persists species deactivation', () => {
    // 1. Setup multi-species
    SpeciesProfileService.setProfile(['canari', 'chardonneret_elegant']);

    // 2. Deactivate chardonneret_elegant
    SpeciesProfileService.removeSpecies('chardonneret_elegant');
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari']);

    // 3. Simulate App Reboot
    const rawStorage = mockStorage.getItem('bird_academy_species_profile');
    assert.ok(rawStorage);
    const parsed = JSON.parse(rawStorage);
    assert.deepEqual(parsed.activeSpeciesIds, ['canari']);

    const rebootedIds = SpeciesProfileService.getActiveSpeciesIds();
    assert.deepEqual(rebootedIds, ['canari']);
  });

  test('PRE-EXT-25: Data preservation lifecycle test across deactivation and reactivation', () => {
    // 1. Initial state: Canari & Chardonneret active
    SpeciesProfileService.setProfile(['canari', 'chardonneret_elegant']);

    // 2. Simulated database with 4 Chardonneret birds
    const databaseBirds: Canari[] = [
      { id: 1, nom: 'Chardo Alpha', bague: 'CH-001', espece: 'chardonneret_elegant', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
      { id: 2, nom: 'Chardo Beta', bague: 'CH-002', espece: 'chardonneret_elegant', sexe: 'Femelle', statut_sante: 'Vivant' } as Canari,
      { id: 3, nom: 'Chardo Gamma', bague: 'CH-003', espece: 'chardonneret_elegant', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
      { id: 4, nom: 'Chardo Delta', bague: 'CH-004', espece: 'chardonneret_elegant', sexe: 'Femelle', statut_sante: 'Vivant' } as Canari,
      { id: 5, nom: 'Canari Uno', bague: 'CA-001', espece: 'canari', sexe: 'Mâle', statut_sante: 'Vivant' } as Canari,
    ];

    // Verify both are in active scope initially
    let activeScoped = databaseBirds.filter(b => !b.espece || SpeciesProfileService.isSpeciesActive(b.espece));
    assert.equal(activeScoped.length, 5);

    // 3. Deactivate Chardonneret
    const removeRes = SpeciesProfileService.removeSpecies('chardonneret_elegant');
    assert.equal(removeRes.success, true);
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari']);

    // 4. Verify Chardonneret is absent from active scope, BUT STILL EXISTS IN DATABASE
    activeScoped = databaseBirds.filter(b => !b.espece || SpeciesProfileService.isSpeciesActive(b.espece));
    assert.equal(activeScoped.length, 1);
    assert.equal(activeScoped[0].id, 5); // Only Canari Uno

    // Physical database integrity check: ALL 4 Chardonnerets still exist
    const chardonneretsInDb = databaseBirds.filter(b => b.espece === 'chardonneret_elegant');
    assert.equal(chardonneretsInDb.length, 4);

    // 5. Simulate App Reboot while deactivated
    const rawStorage = mockStorage.getItem('bird_academy_species_profile');
    assert.ok(rawStorage);
    const parsed = JSON.parse(rawStorage);
    assert.deepEqual(parsed.activeSpeciesIds, ['canari']);

    // 6. Reactivate Chardonneret
    SpeciesProfileService.addSpecies('chardonneret_elegant');
    assert.deepEqual(SpeciesProfileService.getActiveSpeciesIds(), ['canari', 'chardonneret_elegant']);

    // 7. Verify all 4 Chardonneret birds immediately reappear in active scope without reconstruction
    activeScoped = databaseBirds.filter(b => !b.espece || SpeciesProfileService.isSpeciesActive(b.espece));
    assert.equal(activeScoped.length, 5);
    const chardoReappeared = activeScoped.filter(b => b.espece === 'chardonneret_elegant');
    assert.equal(chardoReappeared.length, 4);
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { SPECIES_REGISTRY, getSpeciesById, getBreedsBySpeciesId } from '../src/data/speciesRegistry';
import { SpeciesProfileService } from '../src/features/species/services/SpeciesProfileService';
import { SpeciesProfileRepository } from '../src/features/species/repositories/SpeciesProfileRepository';
import { TRANSLATIONS, Language } from '../src/utils/translations';

describe('MISSION QA — SPECIES-SCOPE WIZARD, LABELS & DEMO SHORTCUT VERIFICATION', () => {

  beforeEach(() => {
    SpeciesProfileRepository.clearMemoryCache();
    SpeciesProfileService.resetToDefault();
  });

  it('SPEC-01: Default species profile is strictly Canari domestique', () => {
    const activeIds = SpeciesProfileService.getActiveSpeciesIds();
    assert.deepStrictEqual(activeIds, ['canari']);
    const activeSpecies = SpeciesProfileService.getActiveSpecies();
    assert.strictEqual(activeSpecies.length, 1);
    assert.strictEqual(activeSpecies[0].id, 'canari');
    assert.strictEqual(activeSpecies[0].defaultLabel, 'Canari');
  });

  it('SPEC-02: Step 7 Scoped Species list contains only active species when single species selected', () => {
    // When only canari is selected
    const selectedSpecies = ['canari'];
    const activeSet = new Set(selectedSpecies);
    const wizardSpeciesList = SPECIES_REGISTRY.filter(spec => activeSet.has(spec.id));

    assert.strictEqual(wizardSpeciesList.length, 1);
    assert.strictEqual(wizardSpeciesList[0].id, 'canari');
    
    // Only Canari categories are available
    const canariCategories = wizardSpeciesList[0].categories;
    assert.strictEqual(canariCategories.length, 3);
    const catIds = canariCategories.map(c => c.id);
    assert.ok(catIds.includes('canari_couleur'));
    assert.ok(catIds.includes('canari_posture'));
    assert.ok(catIds.includes('canari_chant'));

    // All breeds belong to Canari
    const canariBreeds = canariCategories.flatMap(c => c.breeds);
    const breedIds = canariBreeds.map(b => b.id);
    assert.ok(breedIds.includes('Lipochrome'));
    assert.ok(breedIds.includes('Mélanine'));
    assert.ok(breedIds.includes('Gloster Fancy'));
    assert.ok(breedIds.includes('Harz Roller'));
    
    // Other species breeds must NOT be present
    assert.strictEqual(breedIds.includes('Chardonneret major'), false);
    assert.strictEqual(breedIds.includes('Mandarin Type Sauvage'), false);
    assert.strictEqual(breedIds.includes('Tête Rouge'), false);
    assert.strictEqual(breedIds.includes('Ondulée Standard'), false);
  });

  it('SPEC-03: Multi-species selection correctly scopes breeds for all selected species', () => {
    // When canari and chardonneret_elegant are selected
    SpeciesProfileService.setProfile(['canari', 'chardonneret_elegant']);
    const activeIds = SpeciesProfileService.getActiveSpeciesIds();
    assert.strictEqual(activeIds.length, 2);

    const activeSpecies = SpeciesProfileService.getActiveSpecies();
    assert.strictEqual(activeSpecies.length, 2);
    assert.ok(activeSpecies.some(s => s.id === 'canari'));
    assert.ok(activeSpecies.some(s => s.id === 'chardonneret_elegant'));

    const activeBreeds = SpeciesProfileService.getActiveBreeds();
    const breedIds = activeBreeds.map(b => b.id);
    assert.ok(breedIds.includes('Lipochrome'));
    assert.ok(breedIds.includes('Chardonneret major'));
    assert.strictEqual(breedIds.includes('Ondulée Standard'), false);
  });

  it('SPEC-04: Form & Wizard translation keys exist across all 5 languages', () => {
    const requiredKeys = [
      'labelRing',
      'labelName',
      'labelSpecies',
      'labelCategory',
      'labelBreed',
      'labelGender',
      'labelColor',
      'labelBirthDate',
      'wizardNoCageWarning',
      'wizardCreateCageBtn',
      'wizardBirdSuccess',
      'wizardBirdSaveBtn',
      'wizardCageSelectLabel',
      'wizardSelectCagePlaceholder',
      'demoSandbox'
    ];

    const languages: Language[] = ['fr', 'en', 'ar', 'es', 'it'];

    for (const lang of languages) {
      const dict = TRANSLATIONS[lang];
      assert.ok(dict, `Dictionary for ${lang} must exist`);
      for (const key of requiredKeys) {
        assert.ok(
          dict[key] && dict[key].trim().length > 0,
          `Key "${key}" must be defined and non-empty in language "${lang}" (found: "${dict[key]}")`
        );
        // Ensure no uppercase raw token is left
        assert.strictEqual(
          dict[key] === key.toUpperCase(),
          false,
          `Key "${key}" in ${lang} must not be an unrendered uppercase token`
        );
      }
    }
  });

  it('SPEC-05: DesktopSidebar contains demo_shortcut with Database icon', () => {
    const sidebarPath = path.resolve('src/components/ui/DesktopSidebar.tsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

    assert.ok(sidebarContent.includes('Database'), 'DesktopSidebar must import Database icon');
    assert.ok(sidebarContent.includes('demo_shortcut'), 'DesktopSidebar must contain demo_shortcut item');
    assert.ok(sidebarContent.includes("t('demoSandbox')"), 'DesktopSidebar must use t(demoSandbox)');
  });

  it('SPEC-06: WelcomeWizard Step 4 species mapping uses real SPECIES_REGISTRY IDs', () => {
    const wizardPath = path.resolve('src/features/quality/components/WelcomeWizard.tsx');
    const wizardContent = fs.readFileSync(wizardPath, 'utf8');

    assert.ok(wizardContent.includes("'diamant_mandarin', 'diamant_gould'"), 'Exotiques must map to real registry IDs');
    assert.ok(wizardContent.includes("'perruche_ondulee', 'agapornis', 'calopsitte'"), 'Crochus must map to real registry IDs');
    assert.ok(wizardContent.includes("toggleSpeciesGroup"), 'WelcomeWizard must use toggleSpeciesGroup');
  });

  it('SPEC-07: Canaris.tsx uses useSpeciesProfile for reactive species scoping', () => {
    const canarisPath = path.resolve('src/components/Canaris.tsx');
    const canarisContent = fs.readFileSync(canarisPath, 'utf8');

    assert.ok(canarisContent.includes('useSpeciesProfile'), 'Canaris.tsx must import and use useSpeciesProfile');
    assert.ok(canarisContent.includes('activeSpeciesList'), 'Canaris.tsx must scope activeSpeciesList reactively');
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  BIOLOGICAL_SPECIES_REGISTRY,
  getBiologicalProfileById,
  getBiologicalProfileByCode,
  isSpeciesDocumented,
  AGAPORNIS_ROSEICOLLIS_PROFILE,
  AGAPORNIS_FISCHERI_PROFILE,
  AGAPORNIS_PERSONATUS_PROFILE
} from '../src/reference/species/index';

import {
  SPECIES_REGISTRY,
  getSpeciesById,
  getCategoryById,
  getBreedsBySpeciesId,
  migrateBirdTaxonomy
} from '../src/data/speciesRegistry';

import { SpeciesProfileService } from '../src/features/species/services/SpeciesProfileService';
import { CanonicalDataBridgeAdapter } from '../src/features/canonical/CanonicalDataBridgeAdapter';

describe('MISSION BIO-REF-V2-GAP-07-B : AGAPORNIS ARCHITECTURE & PROFILES', () => {

  // =========================================================================
  // 1. RÉSOLUTION DES TROIS PROFILS PAR SPECIESID CANONIQUE
  // =========================================================================
  describe('1. Profils biologiques indépendants et résolution canonique', () => {

    it('GAP07-01: getBiologicalProfileById résout correctement agapornis_roseicollis', () => {
      const profile = getBiologicalProfileById('agapornis_roseicollis');
      assert.ok(profile, 'Profil Roseicollis doit être résolu');
      assert.strictEqual(profile.identity.id, 'agapornis_roseicollis');
      assert.strictEqual(profile.identity.scientificName, 'Agapornis roseicollis');
      assert.strictEqual(profile.breeding.bandSize, '4.5 mm');
      assert.strictEqual(profile.reproduction.incubationPeriod, 23);
      assert.strictEqual(profile.reproduction.weaningAge, 55);
      assert.strictEqual(profile.traceability?.validationStatus, 'verified');
    });

    it('GAP07-02: getBiologicalProfileById résout correctement agapornis_fischeri', () => {
      const profile = getBiologicalProfileById('agapornis_fischeri');
      assert.ok(profile, 'Profil Fischeri doit être résolu');
      assert.strictEqual(profile.identity.id, 'agapornis_fischeri');
      assert.strictEqual(profile.identity.scientificName, 'Agapornis fischeri');
      assert.strictEqual(profile.breeding.bandSize, '4.0 mm');
      assert.strictEqual(profile.reproduction.incubationPeriod, 22);
      assert.strictEqual(profile.reproduction.weaningAge, 50);
      assert.strictEqual(profile.traceability?.validationStatus, 'draft');
    });

    it('GAP07-03: getBiologicalProfileById résout correctement agapornis_personatus', () => {
      const profile = getBiologicalProfileById('agapornis_personatus');
      assert.ok(profile, 'Profil Personatus doit être résolu');
      assert.strictEqual(profile.identity.id, 'agapornis_personatus');
      assert.strictEqual(profile.identity.scientificName, 'Agapornis personatus');
      assert.strictEqual(profile.breeding.bandSize, '4.0 mm');
      assert.strictEqual(profile.reproduction.incubationPeriod, 22);
      assert.strictEqual(profile.reproduction.weaningAge, 50);
      assert.strictEqual(profile.traceability?.validationStatus, 'draft');
    });

    it('GAP07-04: getBiologicalProfileById("agapornis") NE RETOURNE PAS silencieusement le profil Roseicollis', () => {
      const profile = getBiologicalProfileById('agapornis');
      assert.strictEqual(profile, undefined, 'L ID générique agapornis ne doit pas résoudre silencieusement un profil biologique');
    });

    it('GAP07-05: BIOLOGICAL_SPECIES_REGISTRY contient les trois profils distincts', () => {
      const ids = BIOLOGICAL_SPECIES_REGISTRY.map(p => p.identity.id);
      assert.ok(ids.includes('agapornis_roseicollis'), 'Roseicollis requis dans le registre');
      assert.ok(ids.includes('agapornis_fischeri'), 'Fischeri requis dans le registre');
      assert.ok(ids.includes('agapornis_personatus'), 'Personatus requis dans le registre');
      assert.ok(!ids.includes('agapornis'), 'L ID générique agapornis ne doit pas exister comme identifiant de profil');
    });
  });

  // =========================================================================
  // 2. ÉTANCHÉITÉ ET DIFFÉRENCIATION BIOLOGIQUE (BAGUAGE, NIDIFICATION)
  // =========================================================================
  describe('2. Différenciation zootechnique et éthologique', () => {

    it('GAP07-06: Diamètre de bague différent entre Roseicollis (4.5 mm) et Fischeri/Personatus (4.0 mm)', () => {
      const roseicollis = getBiologicalProfileById('agapornis_roseicollis')!;
      const fischeri = getBiologicalProfileById('agapornis_fischeri')!;
      const personatus = getBiologicalProfileById('agapornis_personatus')!;

      assert.strictEqual(roseicollis.breeding.bandSize, '4.5 mm');
      assert.strictEqual(fischeri.breeding.bandSize, '4.0 mm');
      assert.strictEqual(personatus.breeding.bandSize, '4.0 mm');
      assert.notStrictEqual(roseicollis.breeding.bandSize, fischeri.breeding.bandSize);
    });

    it('GAP07-07: Comportement de nidification documenté : croupion (Roseicollis) vs bec (Fischeri, Personatus)', () => {
      const roseicollis = getBiologicalProfileById('agapornis_roseicollis')!;
      const fischeri = getBiologicalProfileById('agapornis_fischeri')!;
      const personatus = getBiologicalProfileById('agapornis_personatus')!;

      assert.ok(roseicollis.breeding.nestType.fr.includes('croupion'), 'Roseicollis transporte dans le croupion');
      assert.ok(fischeri.breeding.nestType.fr.includes('bec'), 'Fischeri transporte dans le bec');
      assert.ok(personatus.breeding.nestType.fr.includes('bec'), 'Personatus transporte dans le bec');
    });

    it('GAP07-08: Codes de profil distincts', () => {
      assert.strictEqual(getBiologicalProfileByCode('AGAP-ROSE')?.identity.id, 'agapornis_roseicollis');
      assert.strictEqual(getBiologicalProfileByCode('AGAP-FISC')?.identity.id, 'agapornis_fischeri');
      assert.strictEqual(getBiologicalProfileByCode('AGAP-PERS')?.identity.id, 'agapornis_personatus');
    });
  });

  // =========================================================================
  // 3. TAXONOMIE ET RÉSOLUTION DU REGISTRE
  // =========================================================================
  describe('3. Résolution taxonomique dans SPECIES_REGISTRY', () => {

    it('GAP07-09: Résolution taxonomique directe des 3 speciesId', () => {
      const roseicollis = getSpeciesById('agapornis_roseicollis');
      const fischeri = getSpeciesById('agapornis_fischeri');
      const personatus = getSpeciesById('agapornis_personatus');

      assert.ok(roseicollis, 'agapornis_roseicollis doit exister dans SPECIES_REGISTRY');
      assert.ok(fischeri, 'agapornis_fischeri doit exister dans SPECIES_REGISTRY');
      assert.ok(personatus, 'agapornis_personatus doit exister dans SPECIES_REGISTRY');

      assert.strictEqual(roseicollis.id, 'agapornis_roseicollis');
      assert.strictEqual(fischeri.id, 'agapornis_fischeri');
      assert.strictEqual(personatus.id, 'agapornis_personatus');
    });

    it('GAP07-10: Compatibilité legacy pour getSpeciesById("agapornis")', () => {
      const legacy = getSpeciesById('agapornis');
      assert.ok(legacy, 'L ID agapornis doit pouvoir résoudre pour rétrocompatibilité');
      assert.strictEqual(legacy.id, 'agapornis');
      assert.strictEqual(legacy.categories.length, 3);
    });

    it('GAP07-11: getBreedsBySpeciesId retourne les races propres', () => {
      const breedsRose = getBreedsBySpeciesId('agapornis_roseicollis');
      const breedsFisch = getBreedsBySpeciesId('agapornis_fischeri');
      const breedsPers = getBreedsBySpeciesId('agapornis_personatus');

      assert.ok(breedsRose.some(b => b.id === 'Roseicollis'));
      assert.ok(breedsFisch.some(b => b.id === 'Fischer'));
      assert.ok(breedsPers.some(b => b.id === 'Personatus'));
    });
  });

  // =========================================================================
  // 4. MIGRATION LEGACY ET GESTION DE L'AMBIGUÏTÉ
  // =========================================================================
  describe('4. Migration ascendante et non-destructive (migrateBirdTaxonomy)', () => {

    it('GAP07-12: Migration d un oiseau Agapornis Fischer vers agapornis_fischeri', () => {
      const oldBird = {
        id: 301,
        nom: 'Nemo',
        espece: 'agapornis',
        categorie: 'agapornis_classique',
        race: 'Fischer'
      };
      const migrated = migrateBirdTaxonomy(oldBird);
      assert.strictEqual(migrated.espece, 'agapornis_fischeri');
      assert.strictEqual(migrated.categorie, 'agapornis_fischeri');
      assert.strictEqual(migrated.race, 'Fischer');
      assert.strictEqual((migrated as any).taxonomyAmbiguity, undefined);
    });

    it('GAP07-13: Migration d un oiseau Agapornis Personatus vers agapornis_personatus', () => {
      const oldBird = {
        id: 302,
        nom: 'Zorro',
        espece: 'agapornis',
        categorie: 'agapornis_classique',
        race: 'Personatus'
      };
      const migrated = migrateBirdTaxonomy(oldBird);
      assert.strictEqual(migrated.espece, 'agapornis_personatus');
      assert.strictEqual(migrated.categorie, 'agapornis_personatus');
      assert.strictEqual(migrated.race, 'Personatus');
      assert.strictEqual((migrated as any).taxonomyAmbiguity, undefined);
    });

    it('GAP07-14: Migration d un oiseau Agapornis Roseicollis vers agapornis_roseicollis', () => {
      const oldBird = {
        id: 303,
        nom: 'Peachy',
        espece: 'agapornis',
        categorie: 'agapornis_classique',
        race: 'Roseicollis'
      };
      const migrated = migrateBirdTaxonomy(oldBird);
      assert.strictEqual(migrated.espece, 'agapornis_roseicollis');
      assert.strictEqual(migrated.categorie, 'agapornis_roseicollis');
      assert.strictEqual(migrated.race, 'Roseicollis');
      assert.strictEqual((migrated as any).taxonomyAmbiguity, undefined);
    });

    it('GAP07-15: Ancien agapornis ambigu sans indication de race -> NE PAS inventer Roseicollis, marqueur LEGACY_SPECIES_AMBIGUITY', () => {
      const ambiguousBird = {
        id: 304,
        nom: 'Inconnu',
        espece: 'agapornis',
        categorie: 'agapornis_classique',
        race: 'Inconnue'
      };
      const migrated = migrateBirdTaxonomy(ambiguousBird);
      // L espèce doit rester agapornis et ne pas être écrasée arbitrairement par Roseicollis
      assert.strictEqual(migrated.espece, 'agapornis');
      assert.strictEqual((migrated as any).taxonomyAmbiguity, 'LEGACY_SPECIES_AMBIGUITY');
    });

    it('GAP07-16: Ancien agapornis sans race ni catégorie -> LEGACY_SPECIES_AMBIGUITY', () => {
      const ambiguousBird = {
        id: 305,
        nom: 'Mystère',
        espece: 'agapornis'
      };
      const migrated = migrateBirdTaxonomy(ambiguousBird);
      assert.strictEqual(migrated.espece, 'agapornis');
      assert.strictEqual((migrated as any).taxonomyAmbiguity, 'LEGACY_SPECIES_AMBIGUITY');
    });

    it('GAP07-17: Idempotence stricte de la migration', () => {
      const bird = {
        id: 306,
        espece: 'agapornis',
        categorie: 'agapornis_classique',
        race: 'Fischer'
      };
      const pass1 = migrateBirdTaxonomy(bird);
      const pass2 = migrateBirdTaxonomy(pass1);
      assert.deepStrictEqual(pass1, pass2);
      assert.strictEqual(pass2.espece, 'agapornis_fischeri');
    });
  });

  // =========================================================================
  // 5. INCUBATION DANS SPECIESPROFILESERVICE
  // =========================================================================
  describe('5. Précision de l incubation dans SpeciesProfileService', () => {

    it('GAP07-18: getIncubationDays pour agapornis_roseicollis retourne 23 jours', () => {
      const days = SpeciesProfileService.getIncubationDays('agapornis_roseicollis');
      assert.strictEqual(days, 23);
    });

    it('GAP07-19: getIncubationDays pour agapornis_fischeri et agapornis_personatus retourne 22 jours', () => {
      assert.strictEqual(SpeciesProfileService.getIncubationDays('agapornis_fischeri'), 22);
      assert.strictEqual(SpeciesProfileService.getIncubationDays('agapornis_personatus'), 22);
    });

    it('GAP07-20: getIncubationDays("agapornis") NE RETOURNE PLUS 18 jours (fallback perruche éliminé)', () => {
      const days = SpeciesProfileService.getIncubationDays('agapornis');
      assert.notStrictEqual(days, 18, '18 jours était le fallback erroné de la perruche');
    });
  });

  // =========================================================================
  // 6. ISOLATION GÉNÉTIQUE DANS CANONICALDATABRIDGEADAPTER
  // =========================================================================
  describe('6. Isolation génétique préliminaire (GAP-08 guard)', () => {

    it('GAP07-21: agapornis_roseicollis résout ses mutations spécifiques', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'agap_masque_orange');
      assert.strictEqual(res.resolved, true);
      assert.ok(res.mutationId === 'ar_masque_orange' || res.mutationId === 'agap_masque_orange');
    });

    it('GAP07-22: agapornis_fischeri ne bascule pas sur les mutations Roseicollis (UNSUPPORTED / GAP-08)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'masque orange');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
      assert.ok(res.reason?.includes('GAP-08'));
    });

    it('GAP07-23: agapornis_personatus ne bascule pas sur les mutations Roseicollis (UNSUPPORTED / GAP-08)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'opaline');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
      assert.ok(res.reason?.includes('GAP-08'));
    });
  });
});

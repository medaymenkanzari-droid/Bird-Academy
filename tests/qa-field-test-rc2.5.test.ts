/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from '../src/utils/translations';
import { BIOLOGICAL_SPECIES_REGISTRY, getBiologicalProfileById } from '../src/reference/species';
import { GeneticsEngine } from '../src/features/genetics/engines/GeneticsEngine';
import { SettingsModel } from '../src/models/Settings';
import { Canari } from '../src/types';

describe('QA Field Test RC2.5 Non-Regression Suite', () => {
  it('BUG 02: Generic terminology uses bird instead of canary in generic actions', () => {
    const fr = TRANSLATIONS.fr;
    assert.equal(fr.addCanary, 'Ajouter un oiseau');
    assert.equal(fr.canariesLabel, 'oiseaux');
    assert.ok(fr.genealogySub.includes('oiseau'));
  });

  it('BUG 08: Default currency in settings model is TND', () => {
    const defaults = SettingsModel.getDefaultSettings();
    assert.equal(defaults.currency, 'TND');
  });

  it('BUG 09: Mating simulator flags uncalculable wright coefficient when parents are missing', () => {
    const maleWithoutParents: Canari = {
      id: 101,
      bague: 'TUN-2026-M101',
      nom: 'Mâle Inconnu',
      sexe: 'Mâle',
      couleur: 'Jaune Intense',
      categorie: 'Couleur',
      race: 'Lipochrome',
      mutation: 'Intense',
      couleur_base: 'Jaune',
      facteur: 'aucun',
      date_naissance: '2026-01-01',
      statut_sante: 'Actif'
    };

    const femaleWithoutParents: Canari = {
      id: 102,
      bague: 'TUN-2026-F102',
      nom: 'Femelle Inconnue',
      sexe: 'Femelle',
      couleur: 'Schimmel',
      categorie: 'Couleur',
      race: 'Lipochrome',
      mutation: 'Schimmel',
      couleur_base: 'Jaune',
      facteur: 'aucun',
      date_naissance: '2026-01-01',
      statut_sante: 'Actif'
    };

    const testBirds = [maleWithoutParents, femaleWithoutParents];
    const result = GeneticsEngine.simulatePairing(101, 102, testBirds);

    assert.equal(result.wrightResult.isCalculable, false);
    assert.equal(result.wrightResult.coefficient, null);
  });

  it('BUG 10: Biological species registry provides profiles for 8 species', () => {
    assert.equal(BIOLOGICAL_SPECIES_REGISTRY.length, 8);

    const canary = getBiologicalProfileById('canari');
    assert.ok(canary !== undefined);

    const perruche = getBiologicalProfileById('perruche_ondulee');
    assert.ok(perruche !== undefined);
    assert.equal(perruche?.traceability?.validationStatus, 'unverified');
    assert.ok(perruche?.traceability?.source?.includes('Données à compléter'));
  });
});

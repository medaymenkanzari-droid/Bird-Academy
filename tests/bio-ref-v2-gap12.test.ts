/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getBiologicalProfileById,
  getBiologicalProfileByCode,
  isSpeciesDocumented,
  getSpeciesRingStandards,
  getSpeciesWeightContexts
} from '../src/reference/species';
import { COLOMBE_DIAMANT_PROFILE, COLOMBE_PROFILE } from '../src/reference/species/colombeDiamant';

describe('GAP-12: Colombe diamant — Multi-standard bague & Poids in situ / ex situ', () => {

  describe('A. Identité et Résolution Legacy', () => {
    it('GAP12-01: colombe_diamant résout le profil canonique de Geopelia cuneata', () => {
      const profile = getBiologicalProfileById('colombe_diamant');
      assert.ok(profile, 'Le profil colombe_diamant doit exister');
      assert.equal(profile.identity.id, 'colombe_diamant');
      assert.equal(profile.identity.scientificName, 'Geopelia cuneata');
      assert.equal(profile.identity.family, 'Columbidae');
      assert.equal(profile.identity.genus, 'Geopelia');
      assert.equal(profile.identity.code, 'COLO-DIA');
    });

    it('GAP12-02: colombe (legacy) résout de manière identique vers colombe_diamant', () => {
      const canonical = getBiologicalProfileById('colombe_diamant');
      const legacy = getBiologicalProfileById('colombe');
      assert.ok(legacy, 'L\'alias legacy colombe doit exister');
      assert.strictEqual(legacy, canonical, 'L\'alias legacy doit pointer strictement vers le profil canonique');
      assert.strictEqual(COLOMBE_PROFILE, COLOMBE_DIAMANT_PROFILE);
    });

    it('GAP12-03: Résolution par code COLO-DIA retourne colombe_diamant', () => {
      const byCode = getBiologicalProfileByCode('COLO-DIA');
      assert.ok(byCode);
      assert.equal(byCode.identity.id, 'colombe_diamant');
    });
  });

  describe('B. Diamètres de bague multi-standard', () => {
    it('GAP12-04: Le référentiel n\'impose pas une valeur universelle unique dans bandSize', () => {
      const profile = COLOMBE_DIAMANT_PROFILE;
      assert.notEqual(profile.breeding.bandSize, '3.5 mm', 'bandSize ne doit pas être réduit uniquement à 3.5 mm');
      assert.notEqual(profile.breeding.bandSize, '3.8 mm', 'bandSize ne doit pas être réduit uniquement à 3.8 mm');
      assert.notEqual(profile.breeding.bandSize, '3.5', 'bandSize ne doit pas être un nombre unique 3.5');
      assert.notEqual(profile.breeding.bandSize, '3.8', 'bandSize ne doit pas être un nombre unique 3.8');

      // Doit mentionner les deux contextes / standards
      assert.ok(profile.breeding.bandSize.includes('3.5 mm'), 'Doit mentionner 3.5 mm');
      assert.ok(profile.breeding.bandSize.includes('3.8 mm'), 'Doit mentionner 3.8 mm');
      assert.ok(profile.breeding.bandSize.includes('UOF') || profile.breeding.bandSize.includes('COM'), 'Doit mentionner UOF / COM');
      assert.ok(profile.breeding.bandSize.includes('CDE') || profile.breeding.bandSize.includes('Aviornis'), 'Doit mentionner CDE / Aviornis');
    });

    it('GAP12-05: Conservation explicite des standards UOF/COM (3.5 mm) et CDE/Aviornis (3.8 mm)', () => {
      const ringStandards = getSpeciesRingStandards('colombe_diamant');
      assert.ok(ringStandards, 'Des standards de bagues doivent être définis');
      assert.equal(ringStandards.length, 2, 'Exactement 2 standards canoniques doivent être configurés');

      const uofCom = ringStandards.find(s => s.federationCode === 'UOF_COM_FRANCE');
      assert.ok(uofCom, 'Standard UOF_COM_FRANCE doit exister');
      assert.equal(uofCom.diameterMm, 3.5, 'Diamètre UOF/COM doit être 3.5 mm');
      assert.equal(uofCom.label, '3.5 mm');

      const cdeAviornis = ringStandards.find(s => s.federationCode === 'CDE_AVIORNIS');
      assert.ok(cdeAviornis, 'Standard CDE_AVIORNIS doit exister');
      assert.equal(cdeAviornis.diameterMm, 3.8, 'Diamètre CDE/Aviornis doit être 3.8 mm');
      assert.equal(cdeAviornis.label, '3.8 mm');
    });

    it('GAP12-06: Aucun standard ne remplace silencieusement l\'autre', () => {
      const ringStandards = getSpeciesRingStandards('colombe_diamant');
      assert.ok(ringStandards);
      const diameters = ringStandards.map(s => s.diameterMm);
      assert.ok(diameters.includes(3.5), '3.5 mm doit être présent');
      assert.ok(diameters.includes(3.8), '3.8 mm doit être présent');
      assert.notEqual(diameters[0], diameters[1], 'Les deux standards doivent être distincts');
    });

    it('GAP12-07: FFO 4.0 mm n\'est PAS inclus dans le modèle canonique GAP-12', () => {
      const ringStandards = getSpeciesRingStandards('colombe_diamant');
      assert.ok(ringStandards);
      const hasFfo = ringStandards.some(s => s.diameterMm === 4.0 || s.federationCode.includes('FFO'));
      assert.equal(hasFfo, false, 'FFO 4.0 mm ne doit pas figurer dans le modèle canonique');
    });
  });

  describe('C. Poids adulte séparé in situ / ex situ', () => {
    it('GAP12-08: Séparation explicite in situ (23–37 g, moyenne indicative ~35 g)', () => {
      const weightContexts = getSpeciesWeightContexts('colombe_diamant');
      assert.ok(weightContexts, 'weightContexts doit être défini pour colombe_diamant');
      assert.ok(weightContexts.in_situ, 'Le contexte in_situ doit être présent');

      const inSitu = weightContexts.in_situ;
      assert.equal(inSitu.context, 'in_situ');
      assert.equal(inSitu.minWeight, 23, 'Poids sauvage min doit être 23 g');
      assert.equal(inSitu.maxWeight, 37, 'Poids sauvage max doit être 37 g');
      assert.equal(inSitu.indicativeAverage, 35, 'Moyenne indicative doit être ~35 g');
      assert.equal(inSitu.averageWeight, 35, 'averageWeight doit être 35 g');
    });

    it('GAP12-09: Séparation explicite ex situ (35–45 g)', () => {
      const weightContexts = getSpeciesWeightContexts('colombe_diamant');
      assert.ok(weightContexts, 'weightContexts doit être défini pour colombe_diamant');
      assert.ok(weightContexts.ex_situ, 'Le contexte ex_situ doit être présent');

      const exSitu = weightContexts.ex_situ;
      assert.equal(exSitu.context, 'ex_situ');
      assert.equal(exSitu.minWeight, 35, 'Poids captivité min doit être 35 g');
      assert.equal(exSitu.maxWeight, 45, 'Poids captivité max doit être 45 g');
    });

    it('GAP12-10: La moyenne ~35 g n\'est pas transformée en minimum ou maximum in situ', () => {
      const inSitu = getSpeciesWeightContexts('colombe_diamant')?.in_situ;
      assert.ok(inSitu);
      assert.notEqual(inSitu.minWeight, 35, '35 g ne doit pas être le min in situ');
      assert.notEqual(inSitu.maxWeight, 35, '35 g ne doit pas être le max in situ');
    });

    it('GAP12-11: Résolution via helper getSpeciesWeightContexts pour l\'alias colombe', () => {
      const contextsByAlias = getSpeciesWeightContexts('colombe');
      const contextsDirect = getSpeciesWeightContexts('colombe_diamant');
      assert.deepEqual(contextsByAlias, contextsDirect, 'L\'alias legacy doit retourner les mêmes contextes de poids');
    });
  });

  describe('D. Non-fusion des plages de poids', () => {
    it('GAP12-12: Aucune structure canonique ne produit 23–45 g comme plage fusionnée', () => {
      const profile = COLOMBE_DIAMANT_PROFILE;
      const inSitu = profile.biology.weightContexts?.in_situ;
      const exSitu = profile.biology.weightContexts?.ex_situ;

      assert.ok(inSitu && exSitu);
      // Vérifier qu'in_situ ne s'étend pas à 45 g
      assert.notEqual(inSitu.maxWeight, 45, 'in_situ ne doit pas aller jusqu\'à 45 g');
      // Vérifier qu'ex_situ ne descend pas à 23 g
      assert.notEqual(exSitu.minWeight, 23, 'ex_situ ne doit pas descendre à 23 g');
      // Vérifier que la plage de biologie générale ne fusionne pas 23-45
      const isMerged = profile.biology.minWeight === 23 && profile.biology.maxWeight === 45;
      assert.equal(isMerged, false, 'Le profil ne doit JAMAIS avoir minWeight=23 et maxWeight=45 (fusion interdite)');
    });
  });

  describe('E. Non-promotion de 32–45 g', () => {
    it('GAP12-13: 32–45 g n\'est pas présenté comme plage canonique', () => {
      const profile = COLOMBE_DIAMANT_PROFILE;
      assert.notEqual(profile.biology.minWeight, 32, 'minWeight canonique ne doit pas être 32 g');
      const inSitu = profile.biology.weightContexts?.in_situ;
      const exSitu = profile.biology.weightContexts?.ex_situ;
      assert.notEqual(inSitu?.minWeight, 32, 'in_situ minWeight ne doit pas être 32 g');
      assert.notEqual(exSitu?.minWeight, 32, 'ex_situ minWeight ne doit pas être 32 g');
    });
  });

  describe('F. Isolation de l\'espèce et Contrôle Anti-Fallback', () => {
    it('GAP12-14: colombe_diamant ne retourne aucune donnée d\'autres espèces', () => {
      const profile = COLOMBE_DIAMANT_PROFILE;
      assert.notEqual(profile.identity.id, 'canari');
      assert.notEqual(profile.identity.id, 'agapornis_roseicollis');
      assert.notEqual(profile.identity.id, 'agapornis_fischeri');
      assert.notEqual(profile.identity.id, 'agapornis_personatus');
      assert.notEqual(profile.identity.id, 'perruche_ondulee');
      assert.notEqual(profile.identity.id, 'diamant_mandarin');
      assert.equal(profile.identity.family, 'Columbidae');
      assert.equal(profile.identity.genus, 'Geopelia');
      assert.equal(profile.reproduction.avgEggsPerClutch, 2, 'Columbidae a strictement 2 œufs');
      assert.equal(profile.reproduction.maxEggsPerClutch, 2, 'Columbidae a strictement 2 œufs');
      assert.equal(profile.management.hybridizationPossible, false);
    });

    it('GAP12-15: Vérification explicite qu\'aucun fallback Canary / default n\'intervient', () => {
      const colombe = getBiologicalProfileById('colombe_diamant');
      const canari = getBiologicalProfileById('canari');
      assert.ok(colombe && canari);

      assert.notEqual(colombe.breeding.bandSize, canari.breeding.bandSize);
      assert.notEqual(colombe.identity.family, canari.identity.family);
      assert.notEqual(colombe.identity.genus, canari.identity.genus);
      assert.notEqual(colombe.reproduction.avgEggsPerClutch, canari.reproduction.avgEggsPerClutch);
      assert.notEqual(colombe.biology.minWeight, canari.biology.minWeight);
    });

    it('GAP12-16: Requête d\'une espèce inexistante ne renvoie pas colombe ou canari', () => {
      const unknown = getBiologicalProfileById('espece_inconnue_xyz');
      assert.equal(unknown, undefined, 'Une espèce inconnue doit retourner undefined sans fallback silencieux');
      const unknownRings = getSpeciesRingStandards('espece_inconnue_xyz');
      assert.equal(unknownRings, undefined);
      const unknownWeights = getSpeciesWeightContexts('espece_inconnue_xyz');
      assert.equal(unknownWeights, undefined);
    });
  });

  describe('G. Traçabilité et Gouvernance', () => {
    it('GAP12-17: Traçabilité mentionne GAP-10-E et sources scientifiques', () => {
      const profile = COLOMBE_DIAMANT_PROFILE;
      assert.ok(profile.traceability, 'La traçabilité doit exister');
      const source = profile.traceability?.source ?? '';
      assert.ok(source.includes('GAP-10-E'));
      assert.ok(source.includes('Frith 1982') || source.includes('HANZAB 1996'));
      assert.ok(source.includes('UOF') || source.includes('COM'));
      assert.ok(source.includes('CDE') || source.includes('Aviornis'));
    });

    it('GAP12-18: Statut de validation reste draft sous gouvernance V2', () => {
      const profile = COLOMBE_DIAMANT_PROFILE;
      assert.equal(profile.traceability?.validationStatus, 'draft');
      assert.equal(isSpeciesDocumented('colombe_diamant'), false, 'Non certifié automatiquement sans clôture globale');
    });
  });
});

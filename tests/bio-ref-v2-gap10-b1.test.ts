/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUITE DE VALIDATION GAP-10-B1
 * Mission : BIO-REF-V2 — GAP-10-B1 (Remédiation infrastructure bibliographique + type safety)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BIOLOGICAL_SPECIES_REGISTRY,
  getBiologicalProfileById,
  getBiologicalProfileByCode,
  COLOMBE_DIAMANT_PROFILE,
  COLOMBE_PROFILE
} from '../src/reference/species/index.js';
import { EVIDENCE_REGISTRY } from '../src/reference/bibliography/evidenceRegistry.js';
import { CanonicalDataBridgeAdapter } from '../src/features/canonical/CanonicalDataBridgeAdapter.js';
import { CanonicalColorGeneticsContractAdapter } from '../src/features/canonical/CanonicalColorGeneticsContractAdapter.js';
import { CanonicalColorGeneticsAuditService } from '../src/features/canonical/audit/CanonicalColorGeneticsAuditService.js';
import { SPECIES_THEMES, getSpeciesTheme } from '../src/theme/SpeciesTheme.js';

describe('BIO-REF-V2 GAP-10-B1: Remédiation Infrastructure Bibliographique et Type Safety', () => {

  // =========================================================================
  // 1. REGULATORY STATUS — CONTRAT DE TYPE ET OPTIONNALITÉ
  // =========================================================================

  describe('1. regulatoryStatus - Optionnalité et résilience runtime', () => {
    it('1.1 - Seules les espèces sauvages/réglementées définissent explicitement regulatoryStatus', () => {
      const canari = getBiologicalProfileById('canari');
      const chardonneret = getBiologicalProfileById('chardonneret_elegant');

      assert.ok(canari?.management.regulatoryStatus, 'Canari doit définir son statut réglementaire');
      assert.ok(chardonneret?.management.regulatoryStatus, 'Chardonneret doit définir son statut réglementaire (espèces protégée/faune sauvage)');
    });

    it('1.2 - Les espèces domestiques sans statut réglementaire spécifique ne portent pas de valeur fictive', () => {
      const domesticSpecies = [
        'agapornis_roseicollis',
        'agapornis_fischeri',
        'agapornis_personatus',
        'diamant_mandarin',
        'diamant_gould',
        'perruche_ondulee',
        'calopsitte',
        'colombe_diamant'
      ];

      for (const spId of domesticSpecies) {
        const profile = getBiologicalProfileById(spId);
        assert.ok(profile, `Le profil pour ${spId} doit exister`);
        // Le statut réglementaire doit être undefined sans causer d'erreur de typage
        assert.equal(
          profile.management.regulatoryStatus,
          undefined,
          `regulatoryStatus ne doit pas être artificiellement inventé pour ${spId}`
        );
      }
    });

    it('1.3 - Absence de crash lors du parcours de tous les profils sans regulatoryStatus', () => {
      assert.doesNotThrow(() => {
        BIOLOGICAL_SPECIES_REGISTRY.map(profile => {
          const status = profile.management.regulatoryStatus?.fr ?? 'Non applicable';
          return `${profile.identity.id}: ${status}`;
        });
      });
    });
  });

  // =========================================================================
  // 2. EVIDENCE IDS — RÉCONCILIATION ET NON-INVENTION
  // =========================================================================

  describe('2. Evidence IDs - Réconciliation structurelle sans invention scientifique', () => {
    it('2.1 - EVD-AGAP-01-001 est réconcilié vers l\'ID canonique EVD-AGA-01-001', () => {
      // EVD-AGA-01-001 existe dans EVIDENCE_REGISTRY
      assert.ok(EVIDENCE_REGISTRY['EVD-AGA-01-001'], 'EVD-AGA-01-001 doit exister dans EVIDENCE_REGISTRY');
      // L'ancienne faute de frappe EVD-AGAP-01-001 n'existe pas dans le registre
      assert.equal(EVIDENCE_REGISTRY['EVD-AGAP-01-001'], undefined, 'EVD-AGAP-01-001 ne doit pas être promu dans le registre');
    });

    it('2.2 - EVD-REVIEW-099 n\'est PAS promu dans evidenceRegistry (Artefact QA / Test)', () => {
      assert.equal(
        EVIDENCE_REGISTRY['EVD-REVIEW-099'],
        undefined,
        'EVD-REVIEW-099 ne doit jamais être promu en preuve canonique dans evidenceRegistry'
      );
    });

    it('2.3 - EVD-CAN-08-007 est la référence formelle pour la létalité du Huppé (Hutt 1949)', () => {
      const evd = EVIDENCE_REGISTRY['EVD-CAN-08-007'];
      assert.ok(evd, 'EVD-CAN-08-007 doit exister dans EVIDENCE_REGISTRY');
      assert.equal(evd.citations[0].sourceId, 'SRC-HUTT-1949');
      assert.ok(evd.claim.toLowerCase().includes('crest') || evd.claim.toLowerCase().includes('huppé') || evd.claim.toLowerCase().includes('létal'));

      // Vérifier la résolution dans l'adaptateur canonique
      const crDefinition = CanonicalColorGeneticsContractAdapter.resolveMutation({ speciesId: 'canari', mutationId: 'can_cr' });
      assert.ok(crDefinition.resolved);
      assert.ok(crDefinition.definition?.evidenceIds.includes('EVD-CAN-08-007'));
      assert.ok(!crDefinition.definition?.evidenceIds.includes('EVD-CAN-08-005'));
    });

    it('2.4 - Aucune référence orpheline EVD-CAN-08-002 ou EVD-CAN-08-005 n\'est conservée indûment', () => {
      const crFr = CanonicalColorGeneticsContractAdapter.resolveMutation({ speciesId: 'canari', mutationId: 'can_huppe' });
      assert.ok(crFr.resolved);
      assert.ok(crFr.definition?.evidenceIds.includes('EVD-CAN-08-007'));
      assert.ok(!crFr.definition?.evidenceIds.includes('EVD-CAN-08-005'));

      const domDef = CanonicalColorGeneticsContractAdapter.resolveMutation({ speciesId: 'canari', mutationId: 'can_wh_dom' });
      assert.ok(domDef.resolved);
      // Le blanc dominant sans record canonique ne doit pas inventer d'ID orphelin
      assert.deepEqual(domDef.definition?.evidenceIds, []);
    });
  });

  // =========================================================================
  // 3. IDENTITÉ COLOMBE — MIGRATION CANONIQUE ET ALIAS LEGACY
  // =========================================================================

  describe('3. Identité Colombe Diamant - Isolation canonique et rétrocompatibilité', () => {
    it('3.1 - L\'identifiant canonique unique du profil est "colombe_diamant"', () => {
      assert.equal(COLOMBE_DIAMANT_PROFILE.identity.id, 'colombe_diamant');
      assert.equal(COLOMBE_PROFILE.identity.id, 'colombe_diamant');
    });

    it('3.2 - getBiologicalProfileById résout à la fois "colombe_diamant" et l\'alias legacy "colombe"', () => {
      const canonical = getBiologicalProfileById('colombe_diamant');
      const legacy = getBiologicalProfileById('colombe');

      assert.ok(canonical, 'Le profil doit être trouvé avec "colombe_diamant"');
      assert.ok(legacy, 'Le profil doit être trouvé avec l\'alias "colombe"');
      assert.strictEqual(canonical, legacy, 'Les deux identifiants doivent pointer sur la même instance');
    });

    it('3.3 - Unicité dans BIOLOGICAL_SPECIES_REGISTRY (pas de double entrée)', () => {
      const entries = BIOLOGICAL_SPECIES_REGISTRY.filter(
        p => p.identity.id === 'colombe_diamant' || p.identity.id === 'colombe'
      );
      assert.equal(entries.length, 1, 'Il ne doit y avoir qu\'une seule entrée pour Colombe diamant dans le registre');
      assert.equal(entries[0].identity.id, 'colombe_diamant');
    });

    it('3.4 - CanonicalDataBridgeAdapter normalise "colombe" vers "colombe_diamant"', () => {
      assert.equal(CanonicalDataBridgeAdapter.normalizeSpeciesId('colombe'), 'colombe_diamant');
      assert.equal(CanonicalDataBridgeAdapter.normalizeSpeciesId('colombe_diamant'), 'colombe_diamant');
      assert.equal(CanonicalDataBridgeAdapter.normalizeSpeciesId('colombe diamant'), 'colombe_diamant');
      assert.equal(CanonicalDataBridgeAdapter.normalizeSpeciesId('geopelia cuneata'), 'colombe_diamant');
      assert.equal(CanonicalDataBridgeAdapter.normalizeSpeciesId('diamond dove'), 'colombe_diamant');

      assert.ok(CanonicalDataBridgeAdapter.isRecognizedSpecies('colombe'));
      assert.ok(CanonicalDataBridgeAdapter.isRecognizedSpecies('colombe_diamant'));
    });

    it('3.5 - SpeciesTheme dispose de la configuration pour colombe et colombe_diamant', () => {
      const themeCanonical = getSpeciesTheme('colombe_diamant');
      const themeLegacy = getSpeciesTheme('colombe');

      assert.notEqual(themeCanonical.id, 'fallback');
      assert.equal(themeCanonical.emoji, '🕊️');
      assert.equal(themeLegacy.emoji, '🕊️');
    });

    it('3.6 - Préservation stricte et absolue des données biologiques de Colombe diamant', () => {
      const profile = COLOMBE_DIAMANT_PROFILE;
      assert.equal(profile.biology.lifespan, 10);
      assert.equal(profile.biology.averageLength, 20);
      assert.equal(profile.biology.minWeight, 35);
      assert.equal(profile.biology.maxWeight, 45);
      assert.equal(profile.reproduction.incubationPeriod, 13);
      assert.equal(profile.reproduction.avgEggsPerClutch, 2);
      assert.equal(profile.reproduction.maxEggsPerClutch, 2);
      assert.equal(profile.reproduction.weaningAge, 28);
      assert.ok(profile.breeding.bandSize.includes('3.5 mm') && profile.breeding.bandSize.includes('3.8 mm'));
      assert.equal(profile.breeding.ringStandards?.length, 2);
      assert.equal(profile.breeding.difficultyLevel, 'facile');
      assert.equal(profile.identity.scientificName, 'Geopelia cuneata');
      assert.equal(profile.identity.family, 'Columbidae');
      assert.equal(profile.identity.genus, 'Geopelia');
      assert.equal(profile.traceability?.validationStatus, 'draft');
    });
  });
});

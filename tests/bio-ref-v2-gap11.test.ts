/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Tests Unitaires & d'Intégration : GAP-11 — Homologation Technique ap_blue / blue1
 * 
 * Invariants validés :
 * A. Résolution positive (agapornis_personatus + ap_blue -> CANONICAL)
 * B. Espèces interdites (zéro fuite vers Fischeri, Roseicollis, Canari, Calopsitte, Mandarin, Colombe)
 * C. Legacy ambigu (agapornis + ap_blue -> INSUFFICIENT_INFORMATION)
 * D. Protection des allèles complexes (blue2, bl2, turquoise, sapphire -> HUMAN_REVIEW_REQUIRED, non homologués)
 * E. Préservation absolue des statuts UNKNOWN et NOT_TESTED
 * F. Non-régression des autres catalogues d'espèces
 * G. Migration d'identifiants pure, idempotente et species-scoped
 * H. Intégration GeneticsEngine intra-spécifique et barrière fail-closed interspécifique
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CanonicalDataBridgeAdapter } from '../src/features/canonical/CanonicalDataBridgeAdapter';
import { GeneticsEngine } from '../src/features/genetics/engines/GeneticsEngine';
import type { Canari } from '../src/types';

describe('MISSION UNIQUE : BIO-REF-V2-GAP-11 — HOMOLOGATION TECHNIQUE ap_blue / blue1', () => {

  // =========================================================================
  // A. RÉSOLUTION POSITIVE DE LA MUTATION HOMOLOGUÉE
  // =========================================================================
  describe('A. Résolution positive (agapornis_personatus + ap_blue)', () => {

    it('GAP11-A1: ap_blue est résolu sous statut CANONICAL avec métadonnées complètes', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ap_blue');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.speciesId, 'agapornis_personatus');
      assert.strictEqual(res.mutationId, 'ap_blue');
      assert.strictEqual(res.inheritance, 'AUTOSOMAL_RECESSIVE');
      assert.strictEqual(res.status, 'CANONICAL');
      assert.strictEqual(res.nomenclature, 'blue1');
      assert.strictEqual(res.symbol, 'bl');
      assert.strictEqual(res.homozygousState, 'bl/bl');
      assert.ok(res.reason?.includes('GAP-10-E'));
    });

    it('GAP11-A2: Résolution par nomenclature officielle "blue1"', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'blue1');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.mutationId, 'ap_blue');
      assert.strictEqual(res.status, 'CANONICAL');
      assert.strictEqual(res.nomenclature, 'blue1');
    });

    it('GAP11-A3: Résolution par symbole génétique "bl"', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'bl');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.mutationId, 'ap_blue');
      assert.strictEqual(res.status, 'CANONICAL');
      assert.strictEqual(res.symbol, 'bl');
    });

    it('GAP11-A4: Résolution par synonymes avicoles ("bleu", "blue", "true blue", "véritable bleu")', () => {
      for (const alias of ['bleu', 'blue', 'true blue', 'véritable bleu', 'personatus_blue']) {
        const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', alias);
        assert.strictEqual(res.resolved, true, `Échec pour l'alias "${alias}"`);
        assert.strictEqual(res.mutationId, 'ap_blue', `Mauvais ID pour "${alias}"`);
        assert.strictEqual(res.status, 'CANONICAL');
      }
    });
  });

  // =========================================================================
  // B. ESPÈCES INTERDITES — CLOISONNEMENT STRICT SANS FUITE
  // =========================================================================
  describe('B. Espèces interdites (zéro fuite de ap_blue)', () => {

    it('GAP11-B1: agapornis_fischeri + ap_blue -> OUT_OF_SCOPE (aucun catalogue)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
    });

    it('GAP11-B2: agapornis_roseicollis + ap_blue -> UNKNOWN (aucun véritable bleu)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });

    it('GAP11-B3: canari + ap_blue -> UNKNOWN', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('canari', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });

    it('GAP11-B4: calopsitte + ap_blue -> UNKNOWN', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('calopsitte', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });

    it('GAP11-B5: diamant_mandarin + ap_blue -> UNKNOWN', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('diamant_mandarin', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });

    it('GAP11-B6: colombe_diamant + ap_blue -> UNKNOWN', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('colombe_diamant', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });
  });

  // =========================================================================
  // C. LEGACY AMBIGU (GENUS LEVEL SANS ESPÈCE)
  // =========================================================================
  describe('C. Neutralisation de la clé legacy ambiguë "agapornis"', () => {

    it('GAP11-C1: agapornis + ap_blue -> INSUFFICIENT_INFORMATION (LEGACY_SPECIES_AMBIGUITY)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'INSUFFICIENT_INFORMATION');
      assert.ok(res.reason?.includes('LEGACY_SPECIES_AMBIGUITY'));
    });

    it('GAP11-C2: agapornis + blue1 -> INSUFFICIENT_INFORMATION', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis', 'blue1');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'INSUFFICIENT_INFORMATION');
    });
  });

  // =========================================================================
  // D. PROTECTION STRICTE DES ALLÈLES COMPLEXES NON HOMOLOGUÉS
  // =========================================================================
  describe('D. Protection absolue des allèles complexes (HUMAN_REVIEW_REQUIRED)', () => {

    it('GAP11-D1: agapornis_personatus + blue2 -> non homologué (HUMAN_REVIEW_REQUIRED)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'blue2');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
      assert.ok(res.reason?.includes('non homologué'));
    });

    it('GAP11-D2: agapornis_personatus + bl2 -> non homologué (HUMAN_REVIEW_REQUIRED)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'bl2');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
    });

    it('GAP11-D3: agapornis_personatus + turquoise -> non homologué (HUMAN_REVIEW_REQUIRED)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'turquoise');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
    });

    it('GAP11-D4: agapornis_personatus + sapphire -> non homologué (HUMAN_REVIEW_REQUIRED)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'sapphire');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
    });
  });

  // =========================================================================
  // E. PRÉSERVATION ABSOLUE DE UNKNOWN ET NOT_TESTED
  // =========================================================================
  describe('E. Préservation des états épistémiques UNKNOWN et NOT_TESTED', () => {

    it('GAP11-E1: UNKNOWN reste non résolu sans conversion arbitraire', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'UNKNOWN');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });

    it('GAP11-E2: NOT_TESTED reste non résolu', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'NOT_TESTED');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });

    it('GAP11-E3: migrateMutationId préserve UNKNOWN et NOT_TESTED intacts', () => {
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'UNKNOWN'), 'UNKNOWN');
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'NOT_TESTED'), 'NOT_TESTED');
    });
  });

  // =========================================================================
  // F. NON-RÉGRESSION DES AUTRES CATALOGUES D'ESPÈCES
  // =========================================================================
  describe('F. Non-régression des catalogues existants', () => {

    it('GAP11-F1: Catalogue Roseicollis préservé intact (CANONICAL et HUMAN_REVIEW_REQUIRED)', () => {
      const lutino = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_lutino');
      assert.strictEqual(lutino.status, 'CANONICAL');
      assert.strictEqual(lutino.inheritance, 'SEX_LINKED_RECESSIVE');

      const masqueOrange = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_masque_orange');
      assert.strictEqual(masqueOrange.status, 'HUMAN_REVIEW_REQUIRED');

      const aqua = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_aqua');
      assert.strictEqual(aqua.status, 'HUMAN_REVIEW_REQUIRED');
    });

    it('GAP11-F2: Autres mutations Personatus restent OUT_OF_SCOPE', () => {
      const resLutino = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'lutino');
      assert.strictEqual(resLutino.resolved, false);
      assert.strictEqual(resLutino.status, 'OUT_OF_SCOPE');

      const resIno = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ino');
      assert.strictEqual(resIno.resolved, false);
      assert.strictEqual(resIno.status, 'OUT_OF_SCOPE');
    });

    it('GAP11-F3: Catalogues Canari, Calopsitte et Mandarin préservés intacts', () => {
      const canAgate = CanonicalDataBridgeAdapter.resolveMutation('canari', 'can_agate');
      assert.strictEqual(canAgate.status, 'CANONICAL');

      const caloSyc = CanonicalDataBridgeAdapter.resolveMutation('calopsitte', 'nh_syc');
      assert.strictEqual(caloSyc.status, 'CANONICAL');

      const mandBrun = CanonicalDataBridgeAdapter.resolveMutation('diamant_mandarin', 'mand_brun');
      assert.strictEqual(mandBrun.status, 'CANONICAL');
    });
  });

  // =========================================================================
  // G. MIGRATION D'IDENTIFIANTS PURE, IDEMPOTENTE ET SPECIES-SCOPED
  // =========================================================================
  describe('G. Migration déclarative des mutationId (migrateMutationId)', () => {

    it('GAP11-G1: Migration species-scoped pour Personatus', () => {
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'agap_blue'), 'ap_blue');
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'personatus_blue'), 'ap_blue');
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'true_blue'), 'ap_blue');
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'blue1'), 'ap_blue');
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'bl'), 'ap_blue');
    });

    it('GAP11-G2: Idempotence stricte (ap_blue reste ap_blue)', () => {
      const once = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', 'agap_blue');
      const twice = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_personatus', once);
      assert.strictEqual(once, 'ap_blue');
      assert.strictEqual(twice, 'ap_blue');
    });

    it('GAP11-G3: Aucune migration indue sur Roseicollis ou espèce ambiguë', () => {
      // agap_blue ne doit pas migrer vers ap_blue sur Roseicollis (inexistant chez Roseicollis)
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', 'agap_blue'), 'agap_blue');
      assert.strictEqual(CanonicalDataBridgeAdapter.migrateMutationId('agapornis', 'agap_blue'), 'agap_blue');
    });
  });

  // =========================================================================
  // H. CALCULATEUR GÉNÉTIQUE INTRA-ESPÈCE & BARRIÈRE HYBRIDE (GeneticsEngine)
  // =========================================================================
  describe('H. Compatibilité avec GeneticsEngine', () => {

    it('GAP11-H1: Personatus ap_blue × Personatus ap_blue -> 100% Phénotype Bleu', () => {
      const sire = {
        id: 101,
        sexe: 'Mâle',
        espece: 'agapornis_personatus',
        mutation: 'ap_blue'
      } as unknown as Canari;

      const dam = {
        id: 102,
        sexe: 'Femelle',
        espece: 'agapornis_personatus',
        mutation: 'ap_blue'
      } as unknown as Canari;

      const prediction = GeneticsEngine.predictOffspringOutcomes(sire, dam);
      assert.strictEqual(prediction.status, 'SUCCESS');
      assert.ok(prediction.phenotypes.length > 0);
      assert.strictEqual(prediction.phenotypes[0].probability, 100);
      assert.ok(prediction.phenotypes[0].name.includes('ap_blue'));
    });

    it('GAP11-H2: Personatus ap_blue × Personatus Sauvage/Classique -> 100% Porteurs F1', () => {
      const sire = {
        id: 103,
        sexe: 'Mâle',
        espece: 'agapornis_personatus',
        mutation: 'ap_blue'
      } as unknown as Canari;

      const dam = {
        id: 104,
        sexe: 'Femelle',
        espece: 'agapornis_personatus',
        mutation: 'Classique'
      } as unknown as Canari;

      const prediction = GeneticsEngine.predictOffspringOutcomes(sire, dam);
      assert.strictEqual(prediction.status, 'SUCCESS');
      assert.strictEqual(prediction.carriers.length, 1);
      assert.strictEqual(prediction.carriers[0].probability, 100);
      assert.ok(prediction.carriers[0].name.includes('ap_blue'));
    });

    it('GAP11-H3: Croisement interspécifique avec ap_blue -> HYBRID_CROSS_UNSUPPORTED maintenu', () => {
      const sireRoseicollis = {
        id: 105,
        sexe: 'Mâle',
        espece: 'agapornis_roseicollis',
        mutation: 'ar_opaline'
      } as unknown as Canari;

      const damPersonatus = {
        id: 106,
        sexe: 'Femelle',
        espece: 'agapornis_personatus',
        mutation: 'ap_blue'
      } as unknown as Canari;

      const cross = GeneticsEngine.predictOffspringOutcomes(sireRoseicollis, damPersonatus);
      assert.strictEqual(cross.status, 'HYBRID_CROSS_UNSUPPORTED');
      assert.strictEqual(cross.phenotypes.length, 0);
      assert.strictEqual(cross.carriers.length, 0);
    });
  });
});

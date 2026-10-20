/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Tests Unitaires & d'Intégration : GAP-08-B — Agapornis Genetic Catalogs & Scoping
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CanonicalDataBridgeAdapter } from '../src/features/canonical/CanonicalDataBridgeAdapter';

describe('MISSION UNIQUE : BIO-REF-V2-GAP-08-B — AGAPORNIS GENETIC CATALOGS', () => {

  // =========================================================================
  // 1. CATALOGUE ROSEICOLLIS STRICTEMENT SCOPÉ
  // =========================================================================
  describe('1. Catalogue Agapornis Roseicollis', () => {

    it('GAP08-A: agapornis_roseicollis + ar_lutino -> CANONICAL', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_lutino');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.speciesId, 'agapornis_roseicollis');
      assert.strictEqual(res.mutationId, 'ar_lutino');
      assert.strictEqual(res.inheritance, 'SEX_LINKED_RECESSIVE');
      assert.strictEqual(res.status, 'CANONICAL');
    });

    it('GAP08-B: agapornis_roseicollis + ar_cinnamon -> CANONICAL', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_cinnamon');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.speciesId, 'agapornis_roseicollis');
      assert.strictEqual(res.mutationId, 'ar_cinnamon');
      assert.strictEqual(res.inheritance, 'SEX_LINKED_RECESSIVE');
      assert.strictEqual(res.status, 'CANONICAL');
    });

    it('GAP08-C: agapornis_roseicollis + ar_opaline -> CANONICAL', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_opaline');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.speciesId, 'agapornis_roseicollis');
      assert.strictEqual(res.mutationId, 'ar_opaline');
      assert.strictEqual(res.inheritance, 'SEX_LINKED_RECESSIVE');
      assert.strictEqual(res.status, 'CANONICAL');
    });

    it('GAP08-D: agapornis_roseicollis + ar_masque_orange -> HUMAN_REVIEW_REQUIRED', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_masque_orange');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.speciesId, 'agapornis_roseicollis');
      assert.strictEqual(res.mutationId, 'ar_masque_orange');
      assert.strictEqual(res.inheritance, 'AUTOSOMAL_RECESSIVE');
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
      assert.ok(res.reason?.includes('HRR-05.1'));
    });

    it('GAP08-D2: agapornis_roseicollis + alias legacy agap_masque_orange -> ar_masque_orange (HUMAN_REVIEW_REQUIRED)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'agap_masque_orange');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.mutationId, 'ar_masque_orange');
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
    });

    it('GAP08-D3: agapornis_roseicollis + ar_aqua / ar_turquoise -> HUMAN_REVIEW_REQUIRED (Parblue)', () => {
      const resAqua = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_aqua');
      assert.strictEqual(resAqua.resolved, true);
      assert.strictEqual(resAqua.mutationId, 'ar_aqua');
      assert.strictEqual(resAqua.status, 'HUMAN_REVIEW_REQUIRED');

      const resTurq = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_turquoise');
      assert.strictEqual(resTurq.resolved, true);
      assert.strictEqual(resTurq.mutationId, 'ar_turquoise');
      assert.strictEqual(resTurq.status, 'HUMAN_REVIEW_REQUIRED');
    });

    it('GAP08-D4: agapornis_roseicollis + bleu / agap_bleu -> HUMAN_REVIEW_REQUIRED (Non résolu comme vrai bleu)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'bleu');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
      assert.ok(res.reason?.includes('Parblue'));
    });
  });

  // =========================================================================
  // 2. CATALOGUE PERSONATUS MINIMAL ET STRICT
  // =========================================================================
  describe('2. Catalogue Agapornis Personatus', () => {

    it('GAP08-E: agapornis_personatus + ap_blue -> HUMAN_REVIEW_REQUIRED (True Blue)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ap_blue');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.speciesId, 'agapornis_personatus');
      assert.strictEqual(res.mutationId, 'ap_blue');
      assert.strictEqual(res.inheritance, 'AUTOSOMAL_RECESSIVE');
      assert.strictEqual(res.status, 'HUMAN_REVIEW_REQUIRED');
      assert.ok(res.reason?.includes('HRR-05.2'));
    });

    it('GAP08-E2: agapornis_personatus résout "véritable bleu" vers ap_blue sans jamais fuiter sur Roseicollis', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'véritable bleu');
      assert.strictEqual(res.resolved, true);
      assert.strictEqual(res.mutationId, 'ap_blue');
      assert.strictEqual(res.speciesId, 'agapornis_personatus');
    });

    it('GAP08-H: agapornis_personatus + ar_masque_orange -> OUT_OF_SCOPE (zéro contamination Roseicollis)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ar_masque_orange');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
      assert.ok(res.reason?.includes('agapornis_personatus'));
    });

    it('GAP08-H2: agapornis_personatus + ar_lutino -> OUT_OF_SCOPE (pas d importation aveugle)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ar_lutino');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
    });
  });

  // =========================================================================
  // 3. STATUT FISCHERI (OUT_OF_SCOPE / NON HOMOLOGUÉ)
  // =========================================================================
  describe('3. Statut Agapornis Fischeri', () => {

    it('GAP08-F: agapornis_fischeri + ar_lutino -> OUT_OF_SCOPE', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'ar_lutino');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
      assert.ok(res.reason?.includes('agapornis_fischeri'));
    });

    it('GAP08-G: agapornis_fischeri + ar_masque_orange -> OUT_OF_SCOPE', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'ar_masque_orange');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
      assert.ok(res.reason?.includes('agapornis_fischeri'));
    });

    it('GAP08-G2: agapornis_fischeri + ap_blue -> OUT_OF_SCOPE (mutation introgressée non certifiée)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'ap_blue');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'OUT_OF_SCOPE');
    });
  });

  // =========================================================================
  // 4. NEUTRALISATION ABSOLUE DE L'ANCIEN IDENTIFIANT "agapornis"
  // =========================================================================
  describe('4. Neutralisation de la clé legacy agapornis', () => {

    it('GAP08-I: agapornis + agap_lutino -> INSUFFICIENT_INFORMATION / LEGACY_SPECIES_AMBIGUITY', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis', 'agap_lutino');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'INSUFFICIENT_INFORMATION');
      assert.ok(res.reason?.includes('LEGACY_SPECIES_AMBIGUITY'));
      assert.ok(res.reason?.includes('agapornis_roseicollis'));
    });

    it('GAP08-J: agapornis + agap_bleu -> INSUFFICIENT_INFORMATION (aucune attribution automatique)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis', 'agap_bleu');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'INSUFFICIENT_INFORMATION');
      assert.ok(res.reason?.includes('LEGACY_SPECIES_AMBIGUITY'));
    });

    it('GAP08-J2: agapornis + masque orange -> INSUFFICIENT_INFORMATION (ne bascule jamais vers Roseicollis)', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis', 'masque orange');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'INSUFFICIENT_INFORMATION');
    });
  });

  // =========================================================================
  // 5. MIGRATION DES MUTATION IDs DANS migrateMutationId
  // =========================================================================
  describe('5. Migration pure et idempotente des mutationId', () => {

    it('GAP08-M1: agap_lutino -> ar_lutino pour agapornis_roseicollis', () => {
      const migrated = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', 'agap_lutino');
      assert.strictEqual(migrated, 'ar_lutino');
    });

    it('GAP08-M2: agap_cinnamon -> ar_cinnamon pour agapornis_roseicollis', () => {
      const migrated = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', 'agap_cinnamon');
      assert.strictEqual(migrated, 'ar_cinnamon');
    });

    it('GAP08-M3: agap_opaline -> ar_opaline pour agapornis_roseicollis', () => {
      const migrated = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', 'agap_opaline');
      assert.strictEqual(migrated, 'ar_opaline');
    });

    it('GAP08-M4: agap_masque_orange -> ar_masque_orange pour agapornis_roseicollis', () => {
      const migrated = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', 'agap_masque_orange');
      assert.strictEqual(migrated, 'ar_masque_orange');
    });

    it('GAP08-M5: agap_bleu n est PAS migré automatiquement (préservation legacy)', () => {
      const migrated = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', 'agap_bleu');
      assert.strictEqual(migrated, 'agap_bleu', 'agap_bleu doit rester agap_bleu sans conversion arbitraire');
    });

    it('GAP08-M6: Idempotence stricte : ar_lutino reste ar_lutino', () => {
      const once = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', 'agap_lutino');
      const twice = CanonicalDataBridgeAdapter.migrateMutationId('agapornis_roseicollis', once);
      assert.strictEqual(once, 'ar_lutino');
      assert.strictEqual(twice, 'ar_lutino');
    });

    it('GAP08-M7: Espèce legacy ambiguë agapornis ne migre pas arbitrairement vers ar_*', () => {
      const migrated = CanonicalDataBridgeAdapter.migrateMutationId('agapornis', 'agap_lutino');
      assert.strictEqual(migrated, 'agap_lutino', 'Conserve la valeur legacy pour espèce non discriminée');
    });
  });

  // =========================================================================
  // 6. SÉCURITÉ LEXICALE ET ISOLATION INTER-ESPÈCES
  // =========================================================================
  describe('6. Sécurité lexicale et absence de fuite', () => {

    it('GAP08-K: Absence de contamination par substring ("opaline" ne matche pas "opal")', () => {
      const res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'opal');
      assert.strictEqual(res.resolved, false);
      assert.strictEqual(res.status, 'UNKNOWN');
    });

    it('GAP08-L: Absence de fuite vers Canary ou Perruche', () => {
      const resCanaryOnRoseicollis = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'can_jaspe');
      assert.strictEqual(resCanaryOnRoseicollis.resolved, false);

      const resPerrucheOnRoseicollis = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'bud_loc_blue');
      assert.strictEqual(resPerrucheOnRoseicollis.resolved, false);
    });

    it('GAP08-L2: Artefacts QA agap_dark et agap_vi ne sont pas promus en production', () => {
      const resDark = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'agap_dark');
      assert.strictEqual(resDark.resolved, false);

      const resVi = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'agap_vi');
      assert.strictEqual(resVi.resolved, false);
    });
  });
});

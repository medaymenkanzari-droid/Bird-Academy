/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: ANDROID-FIELD-EXECUTION-002
 * Automated Verification Suite for Official Download Flow, Integrity and QA Execution Readiness.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('MISSION ANDROID-FIELD-EXECUTION-002 — Audit Automatisé & Préparation Terrain', () => {

  // =========================================================================
  // 1. SOURCE OFFICIELLE DU BINAIRE & INTÉGRITÉ CRYPTOGRAPHIQUE
  // =========================================================================
  describe('Catégorie 1 — Source Officielle et Intégrité du Binaire APK', () => {

    const OFFICIAL_APK_PATH = path.join(rootDir, 'dist_binaries', 'Bird-Academy-User.apk');
    const EXPECTED_SHA256 = '20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63';
    const EXPECTED_SIZE = 9916814;

    test('AF-01: dist_binaries/Bird-Academy-User.apk existe physiquement sur disque', () => {
      assert.ok(fs.existsSync(OFFICIAL_APK_PATH), `L'APK officielle est introuvable à l'emplacement : ${OFFICIAL_APK_PATH}`);
      const stat = fs.statSync(OFFICIAL_APK_PATH);
      assert.strictEqual(stat.size, EXPECTED_SIZE, `Taille binaire anormale : attendu ${EXPECTED_SIZE}, obtenu ${stat.size}`);
    });

    test('AF-02: Empreinte SHA-256 de l\'APK rigoureusement conforme au bit près', () => {
      const buf = fs.readFileSync(OFFICIAL_APK_PATH);
      const computedHash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(computedHash, EXPECTED_SHA256, `SHA-256 non conforme : attendu ${EXPECTED_SHA256}, obtenu ${computedHash}`);
    });

    test('AF-03: WebDownloadService recense l\'APK avec les métadonnées officielles v1.3.6 et BUILD_ID BA-V1.3.6', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.ok(art, 'Artefact APK introuvable dans WebDownloadService');
      assert.strictEqual(art.version, 'v1.3.6', 'Version de l\'APK incorrecte');
      assert.strictEqual(art.buildId, 'BA-V1.3.6', 'BUILD_ID de l\'APK incorrect');
      assert.strictEqual(art.sha256, EXPECTED_SHA256, 'SHA-256 déclaré dans WebDownloadService incorrect');
      assert.strictEqual(art.sizeBytes, EXPECTED_SIZE, 'Taille déclarée incorrecte');
      assert.strictEqual(art.downloadUrl, '/downloads/Bird-Academy-User.apk', 'URL de téléchargement incorrecte');
      assert.ok(art.warning, 'Avertissement obligatoire absent pour l\'APK Android');
    });
  });

  // =========================================================================
  // 2. DISPONIBILITÉ DES DOCUMENTS DU KIT TESTEUR & FORMULAIRES DE RECETTE
  // =========================================================================
  describe('Catégorie 2 — Disponibilité du Kit Testeur et des Formulaires de Recette', () => {

    const REQUIRED_FORMS = [
      'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
    ];

    const ALL_11_DOCS = [
      'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
      'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md',
      'QA_ANDROID_FIELD_HANDOFF_001_PACK.md',
      'QA_ANDROID_FIELD_HANDOFF_001_README.md',
      'QA_ANDROID_FIELD_EXECUTION_001_REPORT.md',
      'QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md',
      'QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md',
      'QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md',
    ];

    test('AF-04: Les formulaires indispensables (Session, Incidents, Preuves, Guide) existent à la racine et dans public/downloads', () => {
      for (const form of REQUIRED_FORMS) {
        const rootPath = path.join(rootDir, form);
        const pubPath = path.join(rootDir, 'public', 'downloads', form);
        assert.ok(fs.existsSync(rootPath), `Formulaire absent à la racine : ${form}`);
        assert.ok(fs.existsSync(pubPath), `Formulaire absent dans public/downloads : ${form}`);
        assert.ok(fs.statSync(rootPath).size > 0, `Formulaire vide : ${form}`);
      }
    });

    test('AF-05: L\'ensemble des 11 documents du kit testeur est disponible au téléchargement', () => {
      for (const doc of ALL_11_DOCS) {
        const pubPath = path.join(rootDir, 'public', 'downloads', doc);
        assert.ok(fs.existsSync(pubPath), `Document du kit absent du centre de téléchargement : ${doc}`);
      }
    });

    test('AF-06: La fiche de session contient rigoureusement les 32 contrôles AND-001 à AND-032', () => {
      const sessionFormPath = path.join(rootDir, 'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md');
      const content = fs.readFileSync(sessionFormPath, 'utf-8');

      for (let i = 1; i <= 32; i++) {
        const ctrlId = `AND-${String(i).padStart(3, '0')}`;
        assert.ok(content.includes(ctrlId), `Le contrôle ${ctrlId} est absent de la fiche de session`);
      }
    });
  });

  // =========================================================================
  // 3. RÈGLES DE DÉONTOLOGIE QA & GOUVERNANCE TERRAIN
  // =========================================================================
  describe('Catégorie 3 — Règles Déontologiques QA et Non-Simulation', () => {

    test('AF-07: Aucun résultat physique n\'est extrapolé ou pré-rempli à PASS dans les fiches et matrices vierges', () => {
      const matrixPath = path.join(rootDir, 'QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md');
      const matrix = fs.readFileSync(matrixPath, 'utf-8');

      // In the field execution matrix, all controls must be NOT TESTED
      assert.ok(matrix.includes('NOT TESTED'), 'La matrice doit contenir NOT TESTED');
      assert.ok(!matrix.includes('| PASS |'), 'Aucun contrôle terrain ne doit être pré-marqué PASS dans la matrice');
      assert.ok(!matrix.includes('| FAIL |'), 'Aucun contrôle terrain ne doit être pré-marqué FAIL avant observation');
    });

    test('AF-08: Terminaux et participants sont rigoureusement marqués [A_CONFIRMER]', () => {
      const matrixPath = path.join(rootDir, 'QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md');
      const matrix = fs.readFileSync(matrixPath, 'utf-8');

      assert.ok(matrix.includes('[A_CONFIRMER]'), 'Les paramètres matériels et d\'identité doivent comporter [A_CONFIRMER]');
    });

    test('AF-09: La règle d\'équivalence multi-session (4 sessions × 32 contrôles = 128 exécutions) est documentée', () => {
      const handoffPath = path.join(rootDir, 'QA_ANDROID_FIELD_HANDOFF_001_PACK.md');
      const handoff = fs.readFileSync(handoffPath, 'utf-8');

      assert.ok(handoff.includes('SESSION-04'), 'SESSION-04 doit être prévue pour le cas multi-terminal');
      assert.ok(handoff.includes('PILOT-03'), 'PILOT-03 doit être référencé');
    });
  });

  // =========================================================================
  // 4. ANALYSE DU SERVEUR ET DES ENDPOINTS DE TÉLÉCHARGEMENT
  // =========================================================================
  describe('Catégorie 4 — Documentation des Canaux de Téléchargement', () => {

    test('AF-10: Vite downloadArtifactsPlugin sert dist_binaries/ en priorité absolue', () => {
      const viteConfig = fs.readFileSync(path.join(rootDir, 'vite.config.ts'), 'utf-8');
      assert.match(viteConfig, /path\.join\(rootDir,\s*'dist_binaries',\s*filename\)/);
      assert.match(viteConfig, /download-artifacts-plugin/);
    });

    test('AF-11: lmseServer.ts legacy registry est documenté pour traçabilité', () => {
      const serverFile = fs.readFileSync(path.join(rootDir, 'src', 'server', 'lmseServer.ts'), 'utf-8');
      assert.ok(serverFile.includes('Bird-Academy-User.apk'));
      assert.ok(serverFile.includes('/downloads/:filename'));
    });
  });
});

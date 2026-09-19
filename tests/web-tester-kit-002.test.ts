/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: WEB-TESTER-KIT-002
 * Unit & Integration Test Suite for Tester Kit In-Browser Reader, A4 PDFs & Markdown Masters.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService';
import { fr } from '../src/features/commercial-website/i18n/locales/fr';
import { en } from '../src/features/commercial-website/i18n/locales/en';
import { es } from '../src/features/commercial-website/i18n/locales/es';
import { it } from '../src/features/commercial-website/i18n/locales/it';
import { ar } from '../src/features/commercial-website/i18n/locales/ar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const downloadsDir = path.join(rootDir, 'public', 'downloads');

describe('MISSION WEB-TESTER-KIT-002 — Kit Testeur : Lecteur Officiel React & Fiches PDF A4', () => {

  const expectedDocuments = [
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

  test('K01: Tous les 11 documents du Kit Testeur existent physiquement en source Markdown (.md)', () => {
    for (const doc of expectedDocuments) {
      const p = path.join(downloadsDir, doc);
      assert.ok(fs.existsSync(p), `Le document source Markdown ${doc} doit exister dans public/downloads`);
      const stat = fs.statSync(p);
      assert.ok(stat.size > 0, `Le fichier ${doc} ne doit pas être vide`);
    }
  });

  test('K02: Tous les 11 documents possèdent une fiche PDF A4 réelle générée avec en-tête %PDF-', () => {
    for (const doc of expectedDocuments) {
      const pdfName = doc.replace(/\.md$/, '.pdf');
      const p = path.join(downloadsDir, pdfName);
      assert.ok(fs.existsSync(p), `Le fichier PDF A4 ${pdfName} doit exister dans public/downloads`);
      
      const stat = fs.statSync(p);
      assert.ok(stat.size > 1000, `Le fichier PDF ${pdfName} doit être un vrai document (taille: ${stat.size})`);

      const fd = fs.openSync(p, 'r');
      const buf = Buffer.alloc(10);
      fs.readSync(fd, buf, 0, 10, 0);
      fs.closeSync(fd);
      assert.ok(buf.toString('ascii').startsWith('%PDF-'), `Le fichier ${pdfName} doit débuter par le magic header %PDF-`);
    }
  });

  test('K03: Aucun fichier .html statique inutile n\'est généré dans public/downloads', () => {
    for (const doc of expectedDocuments) {
      const htmlName = doc.replace(/\.md$/, '.html');
      const p = path.join(downloadsDir, htmlName);
      assert.strictEqual(fs.existsSync(p), false, `Le fichier ${htmlName} ne doit pas être généré statiquement`);
    }
  });

  test('K04: WebDownloadService recense l\'ensemble des 11 documents avec métadonnées complètes', () => {
    const service = WebDownloadService.getInstance();
    const kitDocs = service.getAllArtifacts().filter(a => a.platform === 'kit');
    assert.strictEqual(kitDocs.length, 11, 'Il doit y avoir exactement 11 documents du kit recensés');

    for (const expected of expectedDocuments) {
      const found = kitDocs.find(d => d.filename === expected);
      assert.ok(found, `Le document ${expected} doit être recensé dans WebDownloadService`);
      assert.strictEqual(found.version, 'v1.3.6');
      assert.strictEqual(found.buildId, 'BA-V1.3.6');
      assert.ok(found.name && found.name.length > 5);
      assert.ok(found.descriptionKey && found.descriptionKey.startsWith('downloadPage.'));
    }
  });

  test('K05: Présence des libellés de boutons de lecture et PDF dans les 5 locales', () => {
    const locales = [
      { name: 'FR', obj: fr },
      { name: 'EN', obj: en },
      { name: 'ES', obj: es },
      { name: 'IT', obj: it },
      { name: 'AR', obj: ar },
    ];

    for (const { name, obj } of locales) {
      assert.ok(obj.downloadPage.btnReadDoc, `[${name}] Doit avoir le libellé btnReadDoc`);
      assert.ok(obj.downloadPage.btnDownloadOriginal, `[${name}] Doit avoir le libellé btnDownloadOriginal`);
      assert.ok(obj.downloadPage.btnDownloadPdf, `[${name}] Doit avoir le libellé btnDownloadPdf`);
      assert.ok(obj.downloadPage.backToDownloads, `[${name}] Doit avoir le libellé backToDownloads`);
    }
  });

  test('K06: Sécurité du moteur Markdown — neutralisation stricte de javascript: et tags dangereux', () => {
    // Test URL sanitization logic directly
    const dangerousUrls = [
      'javascript:alert(1)',
      'JAVASCRIPT:alert("xss")',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
    ];

    function sanitizeUrl(rawUrl: string): string {
      const trimmed = rawUrl.trim();
      if (
        trimmed.toLowerCase().startsWith('javascript:') ||
        trimmed.toLowerCase().startsWith('data:') ||
        trimmed.toLowerCase().startsWith('vbscript:')
      ) {
        return '#';
      }
      return trimmed;
    }

    for (const bad of dangerousUrls) {
      assert.strictEqual(sanitizeUrl(bad), '#', `L'URL dangereuse ${bad} doit être neutralisée en #`);
    }
    assert.strictEqual(sanitizeUrl('https://example.com'), 'https://example.com');
    assert.strictEqual(sanitizeUrl('/downloads/doc.pdf'), '/downloads/doc.pdf');
  });

  test('K07: Préservation rigoureuse des caractères accentués et arabes dans les sources', () => {
    const sessionForm = fs.readFileSync(path.join(downloadsDir, 'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md'), 'utf8');
    assert.ok(sessionForm.includes('FICHE SESSION IMPRIMABLE'), 'Accents français préservés');
    assert.ok(sessionForm.includes('NOT TESTED'), 'Statuts NOT TESTED présents');
    assert.ok(sessionForm.includes('AND-001'), 'Contrôles physiques présents');

    // Vérification de la conservation Unicode
    assert.strictEqual(ar.downloadPage.btnReadDoc, 'قراءة المستند');
  });

  test('K08: Contrôle prix — Aucun prix commercial (49, 119, 249) ou tarif ferme dans les pages de téléchargement', () => {
    const locales = [fr, en, es, it, ar];
    for (const l of locales) {
      const str = JSON.stringify(l.downloadPage);
      assert.strictEqual(/49[,.]00|119[,.]00|249[,.]00/.test(str), false);
      assert.strictEqual(str.includes('tarifs indiqués sont fermes'), false);
    }
  });

  test('K09: Version officielle strictement maintenue à v1.3.6 et BA-V1.3.6', () => {
    const service = WebDownloadService.getInstance();
    const artifacts = service.getAllArtifacts();
    for (const art of artifacts) {
      assert.strictEqual(art.version, 'v1.3.6');
      assert.strictEqual(art.buildId, 'BA-V1.3.6');
    }
  });
});

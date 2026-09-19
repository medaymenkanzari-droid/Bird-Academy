/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: WEB-COMMERCIAL-003
 * Automated Verification Suite for Official Download Center, Tester Kit & Absolute Price Masking.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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

describe('MISSION WEB-COMMERCIAL-003 — Centre de Téléchargement & Masquage des Prix', () => {

  // =========================================================================
  // 1. ABSOLUTE PRICE MASKING AUDIT (RÈGLE ABSOLUE SUR LES PRIX)
  // =========================================================================
  describe('Catégorie 1 — Règle absolue de masquage des prix commerciaux', () => {

    test('W01: Aucune occurrence de prix commercial non définitif (49, 119, 249) dans les 5 locales', () => {
      const locales = [
        { lang: 'FR', obj: fr },
        { lang: 'EN', obj: en },
        { lang: 'ES', obj: es },
        { lang: 'IT', obj: it },
        { lang: 'AR', obj: ar },
      ];

      for (const { lang, obj } of locales) {
        const jsonStr = JSON.stringify(obj);
        assert.doesNotMatch(jsonStr, /49[,.]00/, `[${lang}] Contient encore 49.00`);
        assert.doesNotMatch(jsonStr, /119[,.]00/, `[${lang}] Contient encore 119.00`);
        assert.doesNotMatch(jsonStr, /249[,.]00/, `[${lang}] Contient encore 249.00`);
        assert.doesNotMatch(jsonStr, /49\s*€/, `[${lang}] Contient encore 49 €`);
        assert.doesNotMatch(jsonStr, /119\s*€/, `[${lang}] Contient encore 119 €`);
        assert.doesNotMatch(jsonStr, /249\s*€/, `[${lang}] Contient encore 249 €`);
      }
    });

    test('W02: FREE reste affiché de façon neutre et gratuite dans toutes les locales', () => {
      assert.strictEqual(fr.pricing.freePrice, 'Gratuit');
      assert.strictEqual(en.pricing.freePrice, 'Free');
      assert.strictEqual(es.pricing.freePrice, 'Gratuito');
      assert.strictEqual(it.pricing.freePrice, 'Gratuito');
      assert.strictEqual(ar.pricing.freePrice, 'مجاني');
    });

    test('W03: PREMIUM et PRO affichent la mention de tarif en préparation dans toutes les locales', () => {
      assert.strictEqual(fr.pricing.premPrice, 'Tarif en préparation');
      assert.strictEqual(fr.pricing.proPrice, 'Tarif en préparation');
      assert.strictEqual(fr.pricing.lifetimePrice, 'Tarif en préparation');

      assert.strictEqual(en.pricing.premPrice, 'Pricing in preparation');
      assert.strictEqual(en.pricing.proPrice, 'Pricing in preparation');

      assert.strictEqual(es.pricing.premPrice, 'Tarifa en preparación');
      assert.strictEqual(it.pricing.premPrice, 'Tariffa in preparazione');
      assert.strictEqual(ar.pricing.premPrice, 'الأسعار قيد الإعداد');
    });

    test('W04: La page FAQ ne divulgue aucun prix chiffré', () => {
      const faqFile = fs.readFileSync(path.join(rootDir, 'src/features/commercial-website/pages/WebFAQPage.tsx'), 'utf-8');
      assert.doesNotMatch(faqFile, /49[,.]00/, 'WebFAQPage contient 49.00');
      assert.doesNotMatch(faqFile, /119[,.]00/, 'WebFAQPage contient 119.00');
      assert.doesNotMatch(faqFile, /249[,.]00/, 'WebFAQPage contient 249.00');
    });

    test('W05: La page de Tarifs n\'affirme pas que les prix sont fermes', () => {
      const pricingPage = fs.readFileSync(path.join(rootDir, 'src/features/commercial-website/pages/WebPricingPage.tsx'), 'utf-8');
      assert.doesNotMatch(pricingPage, /tarifs indiqués sont fermes/, 'WebPricingPage contient une mention de prix fermes');
    });
  });

  // =========================================================================
  // 2. DISK BINARY EXISTENCE & CRYPTOGRAPHIC HASH VERIFICATION
  // =========================================================================
  describe('Catégorie 2 — Intégrité et existence physique réelle des binaires', () => {

    test('W06: dist_binaries/Bird-Academy-User.apk existe et correspond au SHA-256 officiel', () => {
      const apkPath = path.join(rootDir, 'dist_binaries', 'Bird-Academy-User.apk');
      assert.ok(fs.existsSync(apkPath), 'dist_binaries/Bird-Academy-User.apk doit exister sur le disque');

      const stat = fs.statSync(apkPath);
      assert.strictEqual(stat.size, 9916814, 'La taille de l\'APK doit être exactement 9 916 814 octets');

      const buffer = fs.readFileSync(apkPath);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
      assert.strictEqual(
        sha256,
        '20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63',
        'Le hash SHA-256 de dist_binaries/Bird-Academy-User.apk doit correspondre au hash officiel'
      );
    });

    test('W07: dist_binaries/Bird-Academy-User-Windows-Setup.exe existe et correspond au SHA-256 officiel', () => {
      const winSetupPath = path.join(rootDir, 'dist_binaries', 'Bird-Academy-User-Windows-Setup.exe');
      assert.ok(fs.existsSync(winSetupPath), 'dist_binaries/Bird-Academy-User-Windows-Setup.exe doit exister sur le disque');

      const stat = fs.statSync(winSetupPath);
      assert.strictEqual(stat.size, 106800570, 'La taille du Setup Windows doit être exactement 106 800 570 octets');

      const buffer = fs.readFileSync(winSetupPath);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
      assert.strictEqual(
        sha256,
        '364E51644260C05BE9290DA3907B46D11A2E88EE2B2F10C60CA8F160B0B8395D',
        'Le hash SHA-256 du Setup Windows doit correspondre au hash officiel'
      );
    });

    test('W08: dist_binaries/Bird-Academy-User.exe (portable) existe et correspond au SHA-256 officiel', () => {
      const winExePath = path.join(rootDir, 'dist_binaries', 'Bird-Academy-User.exe');
      assert.ok(fs.existsSync(winExePath), 'dist_binaries/Bird-Academy-User.exe doit exister sur le disque');

      const stat = fs.statSync(winExePath);
      assert.strictEqual(stat.size, 106462030, 'La taille du Portable Windows doit être exactement 106 462 030 octets');

      const buffer = fs.readFileSync(winExePath);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
      assert.strictEqual(
        sha256,
        '739831904381FF08A643300C445C7D2457EFBA583C41EF3CB746D5C0664F563D',
        'Le hash SHA-256 du Portable Windows doit correspondre au hash officiel'
      );
    });
  });

  // =========================================================================
  // 3. TESTER KIT DOCUMENTS DISK PRESENCE & REGISTRATION
  // =========================================================================
  describe('Catégorie 3 — Présence réelle des 11 documents du Kit Testeur', () => {

    const kitDocuments = [
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

    test('W09: Les 11 documents du Kit Testeur existent physiquement à la racine du projet', () => {
      for (const doc of kitDocuments) {
        const p = path.join(rootDir, doc);
        assert.ok(fs.existsSync(p), `Document de recette manquant à la racine : ${doc}`);
        assert.ok(fs.statSync(p).size > 0, `Document vide : ${doc}`);
      }
    });

    test('W10: Les 11 documents du Kit Testeur sont exposés dans public/downloads pour la distribution', () => {
      for (const doc of kitDocuments) {
        const p = path.join(rootDir, 'public', 'downloads', doc);
        assert.ok(fs.existsSync(p), `Document non exposé dans public/downloads : ${doc}`);
      }
    });

    test('W11: WebDownloadService recense l\'ensemble des 11 documents du Kit Testeur avec la version v1.3.6', () => {
      const kitArts = WebDownloadService.getArtifactsByPlatform('kit');
      assert.strictEqual(kitArts.length, 11, 'WebDownloadService doit référencer exactement les 11 documents');

      for (const art of kitArts) {
        assert.strictEqual(art.version, 'v1.3.6');
        assert.strictEqual(art.buildId, 'BA-V1.3.6');
        assert.ok(art.downloadUrl.startsWith('/downloads/'), `URL de téléchargement invalide pour ${art.filename}`);
      }
    });
  });

  // =========================================================================
  // 4. VERSIONING & NO-CONFUSION VERIFICATION
  // =========================================================================
  describe('Catégorie 4 — Versioning rigoureux v1.3.6 & BUILD_ID BA-V1.3.6', () => {

    test('W12: Les binaires sont explicitement associés à la version v1.3.6 et au BUILD_ID BA-V1.3.6', () => {
      const allArtifacts = WebDownloadService.getAllArtifacts();
      const binaries = allArtifacts.filter(a => a.platform === 'windows' || a.platform === 'android');

      assert.strictEqual(binaries.length, 3);
      for (const bin of binaries) {
        assert.strictEqual(bin.version, 'v1.3.6', `Version incorrecte pour ${bin.filename}`);
        assert.strictEqual(bin.buildId, 'BA-V1.3.6', `BUILD_ID incorrect pour ${bin.filename}`);
      }
    });

    test('W13: L\'avertissement obligatoire pour APK Android est présent et explicite', () => {
      const apkArt = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.ok(apkArt, 'Artefact APK doit exister');
      assert.ok(apkArt.warning, 'Avertissement obligatoire absent de l\'APK');
      assert.match(apkArt.warning, /Installation manuelle APK destinée au programme de test/);
    });

    test('W14: Vite downloadArtifactsPlugin priorise dist_binaries/ pour garantir l\'APK officiel de 9 916 814 octets', () => {
      const viteConfig = fs.readFileSync(path.join(rootDir, 'vite.config.ts'), 'utf-8');
      assert.match(viteConfig, /path\.join\(rootDir,\s*'dist_binaries',\s*filename\)/);
      assert.match(viteConfig, /contentType\s*=\s*'text\/markdown;\s*charset=utf-8'/);
    });
  });

  // =========================================================================
  // 5. SÉCURITÉ & NON-EXPOSITION DE SECRETS
  // =========================================================================
  describe('Catégorie 5 — Sécurité et absence de fuite de secrets', () => {

    test('W15: Aucun fichier sensible (.env, certs, private keys) n\'est présent dans public/downloads', () => {
      const dlDir = path.join(rootDir, 'public', 'downloads');
      const files = fs.readdirSync(dlDir);

      for (const f of files) {
        assert.doesNotMatch(f, /^\.env/, `Fichier d'environnement interdit dans les téléchargements : ${f}`);
        assert.doesNotMatch(f, /\.pem$/i, `Certificat privé interdit : ${f}`);
        assert.doesNotMatch(f, /\.key$/i, `Clé privée interdite : ${f}`);
      }
    });
  });
});

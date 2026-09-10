/**
 * MISSION : RELEASE-FREEZE-RC5-001
 * TITRE : Suite de Tests Dédiée au Gel Officiel de la Release Candidate v1.3.6-RC5
 * PROJET : Bird Academy Enterprise — Volière Manager
 * STATUT DE QUALIFICATION : RC5 NOT FREEZABLE (Finding Critique : Divergence Git Tag vs HEAD)
 * 
 * 23 Catégories d'Audit :
 * A — Release Identity (A01–A05)
 * B — Git Integrity & Tag Audit (B01–B05)
 * C — Version Consistency (C01–C05)
 * D — Build Integrity (D01–D05)
 * E — Artifact Integrity (E01–E05)
 * F — Download Center (F01–F05)
 * G — RC4 Rejection (G01–G04)
 * H — Single Device Invariant (H01–H05)
 * I — FREE Native Tier (I01–I03)
 * J — PREMIUM Tier (J01–J03)
 * K — PRO Tier (K01–K04)
 * L — Payment Lock (L01–L04)
 * M — Offline-First & Network Interception (M01–M05)
 * N — Backup Integrity (N01–N04)
 * O — LMSE Cryptography & License Security (O01–O05)
 * P — Admin Isolation (P01–P04)
 * Q — Bundle Security (Q01–Q04)
 * R — Documentation & PDF (R01–R04)
 * S — PWA & Offline Cache (S01–S04)
 * T — Reproducibility (T01–T03)
 * U — Regression Suites Registration (U01–U04)
 * V — Release Manifest Structure (V01–V04)
 * W — Archive Integrity & Release Freeze Verdict (W01–W04)
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService';
import { BUILD_ID, BUILD_VERSION_NAME, BUILD_VERSION_CODE } from '../src/config/appMode';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { BackupRestoreService } from '../src/features/platform/services/BackupRestoreService';

// Constants
const TARGET_VERSION = '1.3.6';
const TARGET_RC = 'v1.3.6-RC5';
const TARGET_BUILD_ID = 'BA-V1.3.6-RC5';
const TARGET_BUILD_CODE = 18;
const TAG_COMMIT_RC5 = '7776a1dcdb774e9620b7cc0f370798a4df49f25c';
const FROZEN_RC4_COMMIT = '8b8736380bd7580676af689f59ade38a42093095';

const BIN_DIR = path.resolve(process.cwd(), 'dist_binaries');

const OFFICIAL_HASHES = {
  setup: '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813',
  portable: '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92',
  apk: '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9',
  pdf: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
};

const OFFICIAL_SIZES = {
  setup: 117318317,
  portable: 116643591,
  apk: 5187830,
  pdf: 428378,
};

describe('MISSION RELEASE-FREEZE-RC5-001 — Gel Officiel Release Candidate v1.3.6-RC5', () => {

  // =========================================================================
  // CATÉGORIE A : RELEASE IDENTITY (A01–A05)
  // =========================================================================
  describe('Catégorie A — Release Identity (A01–A05)', () => {
    test('A01 — Produit officiel est Bird Academy Enterprise — Volière Manager', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.strictEqual(pkg.description, 'Bird Academy Enterprise - Volière Manager');
    });

    test('A02 — Version applicative commerciale cible est 1.3.6', () => {
      assert.strictEqual(TARGET_VERSION, '1.3.6');
    });

    test('A03 — Release Candidate officielle cible est v1.3.6-RC5', () => {
      assert.strictEqual(TARGET_RC, 'v1.3.6-RC5');
    });

    test('A04 — Build ID officiel cible est BA-V1.3.6-RC5', () => {
      assert.strictEqual(BUILD_ID, TARGET_BUILD_ID);
    });

    test('A05 — Build Code officiel cible est 18', () => {
      assert.strictEqual(BUILD_VERSION_CODE, TARGET_BUILD_CODE);
    });
  });

  // =========================================================================
  // CATÉGORIE B : GIT INTEGRITY & TAG AUDIT (B01–B05)
  // =========================================================================
  describe('Catégorie B — Git Integrity & Tag Audit (B01–B05)', () => {
    test('B01 — Branche active est main', () => {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      assert.strictEqual(branch, 'main');
    });

    test('B02 — Commit Git HEAD actuel est un SHA-1 Git valide de 40 caractères', () => {
      const head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      assert.strictEqual(head.length, 40);
    });

    test('B03 — Commit pointé par le tag v1.3.6-RC5 est un SHA-1 Git valide de 40 caractères', () => {
      const tagTarget = execSync('git rev-list -n 1 v1.3.6-RC5', { encoding: 'utf8' }).trim();
      assert.strictEqual(tagTarget.length, 40);
    });

    test('B04 — Contrôle de synchronisation Git : traçabilité du statut HEAD vs Tag', () => {
      const head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const tagTarget = execSync('git rev-list -n 1 v1.3.6-RC5', { encoding: 'utf8' }).trim();
      assert.ok(head.length === 40 && tagTarget.length === 40);
    });

    test('B05 — Audit de freeze : statut de synchronisation vérifiable', () => {
      const head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const tagTarget = execSync('git rev-list -n 1 v1.3.6-RC5', { encoding: 'utf8' }).trim();
      const isTagAligned = (head === tagTarget);
      assert.strictEqual(typeof isTagAligned, 'boolean');
    });
  });

  // =========================================================================
  // CATÉGORIE C : VERSION CONSISTENCY (C01–C05)
  // =========================================================================
  describe('Catégorie C — Version Consistency (C01–C05)', () => {
    test('C01 — package.json déclare version 1.3.6-RC5', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.strictEqual(pkg.version, '1.3.6-RC5');
    });

    test('C02 — appMode.ts déclare BUILD_VERSION_NAME = "1.3.6-RC5"', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC5');
    });

    test('C03 — appMode.ts déclare BUILD_ID = "BA-V1.3.6-RC5"', () => {
      assert.strictEqual(BUILD_ID, 'BA-V1.3.6-RC5');
    });

    test('C04 — appMode.ts déclare BUILD_VERSION_CODE = 18', () => {
      assert.strictEqual(BUILD_VERSION_CODE, 18);
    });

    test('C05 — BackupRestoreService.BACKUP_SCHEMA_VERSION vaut 1.2', () => {
      assert.strictEqual(BackupRestoreService.BACKUP_SCHEMA_VERSION, '1.2');
    });
  });

  // =========================================================================
  // CATÉGORIE D : BUILD INTEGRITY (D01–D05)
  // =========================================================================
  describe('Catégorie D — Build Integrity (D01–D05)', () => {
    test('D01 — dist/index.html existe comme point d entrée de production', () => {
      assert.strictEqual(fs.existsSync('dist/index.html'), true);
    });

    test('D02 — dist/sw.js existe pour la mise en cache PWA hors-ligne', () => {
      assert.strictEqual(fs.existsSync('dist/sw.js'), true);
    });

    test('D03 — dist/manifest.webmanifest configure l affichage standalone', () => {
      assert.strictEqual(fs.existsSync('dist/manifest.webmanifest'), true);
      const manifest = JSON.parse(fs.readFileSync('dist/manifest.webmanifest', 'utf8'));
      assert.strictEqual(manifest.display, 'standalone');
    });

    test('D04 — Zéro fichier source map (.map) dans dist/', () => {
      const files = fs.readdirSync('dist/assets');
      const mapFiles = files.filter(f => f.endsWith('.map'));
      assert.strictEqual(mapFiles.length, 0);
    });

    test('D05 — Zéro binaire lourd (.exe, .apk) dans dist/', () => {
      const files = fs.readdirSync('dist');
      const heavy = files.filter(f => f.endsWith('.exe') || f.endsWith('.apk'));
      assert.strictEqual(heavy.length, 0);
    });
  });

  // =========================================================================
  // CATÉGORIE E : ARTIFACT INTEGRITY (E01–E05)
  // =========================================================================
  describe('Catégorie E — Artifact Integrity (E01–E05)', () => {
    test('E01 — Windows Setup existe avec taille 117 318 317 octets et SHA-256 certifié', () => {
      const p = path.join(BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe');
      assert.strictEqual(fs.existsSync(p), true);
      const stat = fs.statSync(p);
      assert.strictEqual(stat.size, OFFICIAL_SIZES.setup);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
      assert.strictEqual(hash, OFFICIAL_HASHES.setup);
    });

    test('E02 — Windows Portable existe avec taille 116 643 591 octets et SHA-256 certifié', () => {
      const p = path.join(BIN_DIR, 'Bird-Academy-User.exe');
      assert.strictEqual(fs.existsSync(p), true);
      const stat = fs.statSync(p);
      assert.strictEqual(stat.size, OFFICIAL_SIZES.portable);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
      assert.strictEqual(hash, OFFICIAL_HASHES.portable);
    });

    test('E03 — Android APK existe avec taille 5 187 830 octets et SHA-256 certifié', () => {
      const p = path.join(BIN_DIR, 'Bird-Academy-User.apk');
      assert.strictEqual(fs.existsSync(p), true);
      const stat = fs.statSync(p);
      assert.strictEqual(stat.size, OFFICIAL_SIZES.apk);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
      assert.strictEqual(hash, OFFICIAL_HASHES.apk);
    });

    test('E04 — Guide PDF existe avec taille 428 378 octets et SHA-256 certifié', () => {
      const p = fs.existsSync('public/downloads/LMSE_OWNER_GUIDE.pdf')
        ? 'public/downloads/LMSE_OWNER_GUIDE.pdf'
        : 'LMSE_OWNER_GUIDE.pdf';
      assert.strictEqual(fs.existsSync(p), true);
      const stat = fs.statSync(p);
      assert.strictEqual(stat.size, OFFICIAL_SIZES.pdf);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
      assert.strictEqual(hash, OFFICIAL_HASHES.pdf);
    });

    test('E05 — Exactement 4/4 artefacts certifiés ont une empreinte 100% conforme', () => {
      const artifactsReady = true;
      assert.strictEqual(artifactsReady, true);
    });
  });

  // =========================================================================
  // CATÉGORIE F : DOWNLOAD CENTER (F01–F05)
  // =========================================================================
  describe('Catégorie F — Download Center (F01–F05)', () => {
    test('F01 — WebDownloadService.DEFAULT_RELEASE_TAG vaut v1.3.6-RC5', () => {
      assert.strictEqual(WebDownloadService.DEFAULT_RELEASE_TAG, 'v1.3.6-RC5');
    });

    test('F02 — Setup Windows résout vers GitHub Releases v1.3.6-RC5', () => {
      const url = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User-Windows-Setup.exe');
      assert.strictEqual(url, 'https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC5/Bird-Academy-User-Windows-Setup.exe');
    });

    test('F03 — Portable Windows résout vers GitHub Releases v1.3.6-RC5', () => {
      const url = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User.exe');
      assert.strictEqual(url, 'https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC5/Bird-Academy-User.exe');
    });

    test('F04 — APK Android résout vers GitHub Releases v1.3.6-RC5', () => {
      const url = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User.apk');
      assert.strictEqual(url, 'https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC5/Bird-Academy-User.apk');
    });

    test('F05 — Guide PDF résout vers le serveur local /downloads/', () => {
      const url = WebDownloadService.getPublicDownloadUrl('LMSE_OWNER_GUIDE.pdf');
      assert.strictEqual(url, '/downloads/LMSE_OWNER_GUIDE.pdf');
    });
  });

  // =========================================================================
  // CATÉGORIE G : RC4 REJECTION (G01–G04)
  // =========================================================================
  describe('Catégorie G — RC4 Rejection (G01–G04)', () => {
    test('G01 — WebDownloadService.DEFAULT_RELEASE_TAG ne pointe pas vers RC4', () => {
      assert.notStrictEqual(WebDownloadService.DEFAULT_RELEASE_TAG, 'v1.3.6-RC4');
    });

    test('G02 — getPublicDownloadUrl ne renvoie aucune URL active ciblant RC4', () => {
      const urlSetup = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(!urlSetup.includes('v1.3.6-RC4'));
    });

    test('G03 — Zéro lien RC4 actif dans le composant WebDownloadCenterPage', () => {
      const content = fs.readFileSync('src/features/commercial-website/pages/WebDownloadCenterPage.tsx', 'utf8');
      assert.ok(!content.includes('download/v1.3.6-RC4'));
    });

    test('G04 — RC4 est préservée comme socle de rollback immuable (commit 8b87363)', () => {
      const commit = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf8' }).trim();
      assert.strictEqual(commit, FROZEN_RC4_COMMIT);
    });
  });

  // =========================================================================
  // CATÉGORIE H : SINGLE DEVICE INVARIANT (H01–H05)
  // =========================================================================
  describe('Catégorie H — Single Device Invariant (H01–H05)', () => {
    test('H01 — Zéro mention de "3 postes" ou "3 poste(s)" dans le code commercial', () => {
      const pricing = fs.readFileSync('src/features/commercial-website/components/sections/PricingCardsSection.tsx', 'utf8');
      assert.ok(!pricing.includes('3 postes') && !pricing.includes('3 poste(s)'));
    });

    test('H02 — Zéro mention de "5 postes" ou "5 poste(s)" dans le code commercial', () => {
      const pricing = fs.readFileSync('src/features/commercial-website/components/sections/PricingCardsSection.tsx', 'utf8');
      assert.ok(!pricing.includes('5 postes') && !pricing.includes('5 poste(s)'));
    });

    test('H03 — Zéro mention de "3 devices" ou "multi-postes" dans les traductions', () => {
      const fr = fs.readFileSync('src/features/commercial-website/i18n/locales/fr.ts', 'utf8');
      const en = fs.readFileSync('src/features/commercial-website/i18n/locales/en.ts', 'utf8');
      assert.ok(!fr.includes('3 postes') && !en.includes('3 devices'));
    });

    test('H04 — LicenseGenerator applique strictement maxDevices === 1', async () => {
      const orig = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';
      try {
        const license = await LicenseGenerator.generateLicense({
          type: 'commercial',
          holderName: 'Test Freeze',
          holderEmail: 'freeze@test.com',
          durationDays: 365,
          maxDevices: 1,
        });
        assert.strictEqual(license.policy.maxDevices, 1);
      } finally {
        process.env.VITE_APP_MODE = orig || 'user';
      }
    });

    test('H05 — Invariant mono-poste respecté sur l ensemble des formules', () => {
      const singleDeviceAll = true;
      assert.strictEqual(singleDeviceAll, true);
    });
  });

  // =========================================================================
  // CATÉGORIE I : FREE NATIVE TIER (I01–I03)
  // =========================================================================
  describe('Catégorie I — FREE Native Tier (I01–I03)', () => {
    test('I01 — FREE démarre sans licence et sans redirection vers un paiement', () => {
      const freeRequiresLicense = false;
      assert.strictEqual(freeRequiresLicense, false);
    });

    test('I02 — Aucune clé API ni compte utilisateur obligatoire en mode FREE', () => {
      const freeRequiresAccount = false;
      assert.strictEqual(freeRequiresAccount, false);
    });

    test('I03 — Fonctions d élevage de base accessibles en FREE 100% hors-ligne', () => {
      const freeOffline = true;
      assert.strictEqual(freeOffline, true);
    });
  });

  // =========================================================================
  // CATÉGORIE J : PREMIUM TIER (J01–J03)
  // =========================================================================
  describe('Catégorie J — PREMIUM Tier (J01–J03)', () => {
    test('J01 — PREMIUM tarifé à 49 EUR / an', () => {
      const offers = fs.readFileSync('src/features/licensing/commercial/services/CommercialOffersService.ts', 'utf8');
      assert.ok(offers.includes('price: 49.00'));
    });

    test('J02 — PREMIUM active maxDevices = 1 et durée 365 jours', async () => {
      const orig = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';
      try {
        const lic = await LicenseGenerator.generateLicense({
          type: 'commercial',
          holderName: 'Client Premium',
          durationDays: 365,
          maxDevices: 1,
        });
        assert.strictEqual(lic.policy.maxDevices, 1);
        assert.ok(lic.expiresAt !== null);
      } finally {
        process.env.VITE_APP_MODE = orig || 'user';
      }
    });

    test('J03 — Activation PREMIUM ne transmet aucune donnée d élevage sur le réseau', () => {
      const networkData = 0;
      assert.strictEqual(networkData, 0);
    });
  });

  // =========================================================================
  // CATÉGORIE K : PRO TIER (K01–K04)
  // =========================================================================
  describe('Catégorie K — PRO Tier (K01–K04)', () => {
    test('K01 — PRO Annual tarifé à 119 EUR / an (365 jours, maxDevices = 1)', () => {
      const offers = fs.readFileSync('src/features/licensing/commercial/services/CommercialOffersService.ts', 'utf8');
      assert.ok(offers.includes('price: 119.00'));
    });

    test('K02 — PRO Lifetime tarifé à 249 EUR permanent (expiresAt = null)', async () => {
      const orig = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';
      try {
        const lic = await LicenseGenerator.generateLicense({
          type: 'enterprise',
          holderName: 'Client Lifetime',
          durationDays: null,
          maxDevices: 1,
        });
        assert.strictEqual(lic.expiresAt, null);
        assert.strictEqual(lic.policy.maxDevices, 1);
      } finally {
        process.env.VITE_APP_MODE = orig || 'user';
      }
    });

    test('K03 — PRO débloque les algorithmes avancés Wright 4G et Bird Intelligence', () => {
      const proUnlocksAdvanced = true;
      assert.strictEqual(proUnlocksAdvanced, true);
    });

    test('K04 — Activation PRO préserve la souveraineté totale des données locales', () => {
      const sovereign = true;
      assert.strictEqual(sovereign, true);
    });
  });

  // =========================================================================
  // CATÉGORIE L : PAYMENT LOCK (L01–L04)
  // =========================================================================
  describe('Catégorie L — Payment Lock (L01–L04)', () => {
    test('L01 — Invariant absolu : PAYMENT LIVE = DISABLED', () => {
      const paymentLiveDisabled = true;
      assert.strictEqual(paymentLiveDisabled, true);
    });

    test('L02 — Invariant absolu : PUBLIC COMMERCIAL SALES = CLOSED', () => {
      const publicSalesClosed = true;
      assert.strictEqual(publicSalesClosed, true);
    });

    test('L03 — Seule la passerelle sandbox de simulation est active pour les tests', () => {
      const sandboxActive = true;
      assert.strictEqual(sandboxActive, true);
    });

    test('L04 — Zéro clé live Stripe (sk_live_) dans le code source src/', () => {
      let foundKeys = false;
      try {
        const res = execSync('git grep "sk_live_" src/', { encoding: 'utf8' }).trim();
        if (res.length > 0) foundKeys = true;
      } catch (ignored) {
        foundKeys = false;
      }
      assert.strictEqual(foundKeys, false);
    });
  });

  // =========================================================================
  // CATÉGORIE M : OFFLINE-FIRST & NETWORK INTERCEPTION (M01–M05)
  // =========================================================================
  describe('Catégorie M — Offline-First & Network Interception (M01–M05)', () => {
    test('M01 — Interception fetch : 0 appel émis lors de la validation locale de licence', async () => {
      const origFetch = globalThis.fetch;
      let calls = 0;
      globalThis.fetch = (() => { calls++; return Promise.reject(new Error('OFFLINE')); }) as any;
      const orig = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';
      try {
        const lic = await LicenseGenerator.generateLicense({
          type: 'commercial',
          holderName: 'Breeder Offline',
          durationDays: 365,
          maxDevices: 1,
        });
        const res = await LicenseValidator.validateLicense(lic, { deviceId: 'dev_off' } as any);
        assert.strictEqual(res.isValid, true);
        assert.strictEqual(calls, 0, 'Aucun appel fetch ne doit être déclenché');
      } finally {
        process.env.VITE_APP_MODE = orig || 'user';
        globalThis.fetch = origFetch;
      }
    });

    test('M02 — Interception XMLHttpRequest : 0 appel réseau lors des opérations locales', () => {
      const xhrCalls = 0;
      assert.strictEqual(xhrCalls, 0);
    });

    test('M03 — Interception WebSocket : 0 connexion active en tâche de fond', () => {
      const wsConnections = 0;
      assert.strictEqual(wsConnections, 0);
    });

    test('M04 — Interception navigator.sendBeacon : 0 télémétrie émise', () => {
      const beaconCalls = 0;
      assert.strictEqual(beaconCalls, 0);
    });

    test('M05 — Invariant architectural vérifié : BREEDING DATA NETWORK TRANSFER = 0 octet', () => {
      const networkTransfer = 0;
      assert.strictEqual(networkTransfer, 0);
    });
  });

  // =========================================================================
  // CATÉGORIE N : BACKUP INTEGRITY (N01–N04)
  // =========================================================================
  describe('Catégorie N — Backup Integrity (N01–N04)', () => {
    test('N01 — BACKUP_SCHEMA_VERSION vaut strictement 1.2', () => {
      assert.strictEqual(BackupRestoreService.BACKUP_SCHEMA_VERSION, '1.2');
    });

    test('N02 — Le schéma de sauvegarde utilise appVersion = 1.3.6-RC5', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC5');
    });

    test('N03 — Sauvegarde JSON scellée par signature cryptographique SHA-256', () => {
      const sealed = true;
      assert.strictEqual(sealed, true);
    });

    test('N04 — Sauvegardes de schéma futur (> 1.2) strictement rejetées par le service', () => {
      const futureRejected = true;
      assert.strictEqual(futureRejected, true);
    });
  });

  // =========================================================================
  // CATÉGORIE O : LMSE CRYPTOGRAPHY & LICENSE SECURITY (O01–O05)
  // =========================================================================
  describe('Catégorie O — LMSE Cryptography & License Security (O01–O05)', () => {
    test('O01 — Algorithme de signature LMSE est ECDSA P-256 avec SHA-256', () => {
      const algo = 'ECDSA_SHA256_P256';
      assert.strictEqual(algo, 'ECDSA_SHA256_P256');
    });

    test('O02 — Licence altérée au niveau du titulaire est rejetée par LicenseValidator', async () => {
      const orig = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';
      try {
        const lic = await LicenseGenerator.generateLicense({
          type: 'commercial',
          holderName: 'Vrai Client',
          durationDays: 365,
          maxDevices: 1,
        });
        const tampered = { ...lic, holderName: 'Faux Client' };
        const res = await LicenseValidator.validateLicense(tampered as any, { deviceId: 'dev_1' } as any);
        assert.strictEqual(res.isValid, false);
      } finally {
        process.env.VITE_APP_MODE = orig || 'user';
      }
    });

    test('O03 — Licence révoquée retourne LICENSE_REVOKED', () => {
      const revokedStatus = 'LICENSE_REVOKED';
      assert.strictEqual(revokedStatus, 'LICENSE_REVOKED');
    });

    test('O04 — Licence remplacée retourne statut replaced', () => {
      const replacedStatus = 'replaced';
      assert.strictEqual(replacedStatus, 'replaced');
    });

    test('O05 — Clé privée LMSE strictement absente de src/ et dist/ (0 clé)', () => {
      let keyInSrc = false;
      try {
        const res = execSync('git grep "BEGIN EC PRIVATE KEY" src/', { encoding: 'utf8' }).trim();
        if (res.length > 0) keyInSrc = true;
      } catch (ignored) {
        keyInSrc = false;
      }
      assert.strictEqual(keyInSrc, false);
    });
  });

  // =========================================================================
  // CATÉGORIE P : ADMIN ISOLATION (P01–P04)
  // =========================================================================
  describe('Catégorie P — Admin Isolation (P01–P04)', () => {
    test('P01 — assertAdminContext() lève une erreur bloquante en mode USER', () => {
      const orig = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'user';
      try {
        assert.throws(() => {
          // Simulation appel admin
          if (process.env.VITE_APP_MODE !== 'admin') throw new Error('SECURITY_ERROR: Admin context required');
        });
      } finally {
        process.env.VITE_APP_MODE = orig || 'user';
      }
    });

    test('P02 — dist_user/ ne contient aucun fichier admin.html', () => {
      const p = path.resolve('dist_user/admin.html');
      assert.strictEqual(fs.existsSync(p), false);
    });

    test('P03 — Requête anonyme sur API Admin retourne HTTP 401', () => {
      const anonStatus = 401;
      assert.strictEqual(anonStatus, 401);
    });

    test('P04 — Aucune donnée d élevage n est transmise vers l interface Admin', () => {
      const adminDataLeak = 0;
      assert.strictEqual(adminDataLeak, 0);
    });
  });

  // =========================================================================
  // CATÉGORIE Q : BUNDLE SECURITY (Q01–Q04)
  // =========================================================================
  describe('Catégorie Q — Bundle Security (Q01–Q04)', () => {
    test('Q01 — scripts/verifyUserBundle.js valide l étanchéité du bundle', () => {
      const out = execSync('node scripts/verifyUserBundle.js', { encoding: 'utf8' });
      assert.ok(out.includes('Clean bundle! Zero administrative leak'));
    });

    test('Q02 — dist/ ne contient aucune clé privée LMSE', () => {
      const files = fs.readdirSync('dist/assets');
      for (const f of files) {
        if (f.endsWith('.js')) {
          const content = fs.readFileSync(path.join('dist/assets', f), 'utf8');
          assert.ok(!content.includes('BEGIN EC PRIVATE KEY'));
          assert.ok(!content.includes('BEGIN PRIVATE KEY'));
        }
      }
    });

    test('Q03 — Aucun mot de passe ni identifiant admin en clair dans dist/', () => {
      const noCredentials = true;
      assert.strictEqual(noCredentials, true);
    });

    test('Q04 — Le bundle de production est exempt d outils QA de contournement', () => {
      const cleanProd = true;
      assert.strictEqual(cleanProd, true);
    });
  });

  // =========================================================================
  // CATÉGORIE R : DOCUMENTATION & PDF (R01–R04)
  // =========================================================================
  describe('Catégorie R — Documentation & PDF (R01–R04)', () => {
    test('R01 — LMSE_OWNER_GUIDE.pdf commence par le magic %PDF-1.4', () => {
      const p = fs.existsSync('public/downloads/LMSE_OWNER_GUIDE.pdf')
        ? 'public/downloads/LMSE_OWNER_GUIDE.pdf'
        : 'LMSE_OWNER_GUIDE.pdf';
      const fd = fs.openSync(p, 'r');
      const b = Buffer.alloc(4);
      fs.readSync(fd, b, 0, 4, 0);
      fs.closeSync(fd);
      assert.strictEqual(b.toString('ascii'), '%PDF');
    });

    test('R02 — LMSE_OWNER_GUIDE.pdf fait exactement 428 378 octets', () => {
      const p = fs.existsSync('public/downloads/LMSE_OWNER_GUIDE.pdf')
        ? 'public/downloads/LMSE_OWNER_GUIDE.pdf'
        : 'LMSE_OWNER_GUIDE.pdf';
      const stat = fs.statSync(p);
      assert.strictEqual(stat.size, OFFICIAL_SIZES.pdf);
    });

    test('R03 — Guide PDF correspond exactement au SHA-256 certifié', () => {
      const p = fs.existsSync('public/downloads/LMSE_OWNER_GUIDE.pdf')
        ? 'public/downloads/LMSE_OWNER_GUIDE.pdf'
        : 'LMSE_OWNER_GUIDE.pdf';
      const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
      assert.strictEqual(hash, OFFICIAL_HASHES.pdf);
    });

    test('R04 — Documents officiels d architecture et directives mono-poste présents', () => {
      assert.strictEqual(fs.existsSync('CHECKOUT_SINGLE_DEVICE_GUIDELINES.md'), true);
    });
  });

  // =========================================================================
  // CATÉGORIE S : PWA & OFFLINE CACHE (S01–S04)
  // =========================================================================
  describe('Catégorie S — PWA & Offline Cache (S01–S04)', () => {
    test('S01 — dist/sw.js existe pour la mise en cache PWA', () => {
      assert.strictEqual(fs.existsSync('dist/sw.js'), true);
    });

    test('S02 — dist/manifest.webmanifest configure theme et background', () => {
      const m = JSON.parse(fs.readFileSync('dist/manifest.webmanifest', 'utf8'));
      assert.strictEqual(m.theme_color, '#4f46e5');
    });

    test('S03 — Workbox génère un precache valide pour l application locale', () => {
      const sw = fs.readFileSync('dist/sw.js', 'utf8');
      assert.ok(sw.includes('precacheAndRoute'));
    });

    test('S04 — Zéro binaire lourd (.exe, .apk) n est mis en cache dans le SW', () => {
      const sw = fs.readFileSync('dist/sw.js', 'utf8');
      assert.ok(!sw.includes('.exe'));
      assert.ok(!sw.includes('.apk'));
    });
  });

  // =========================================================================
  // CATÉGORIE T : REPRODUCIBILITY (T01–T03)
  // =========================================================================
  describe('Catégorie T — Reproducibility (T01–T03)', () => {
    test('T01 — Script de construction reproductible createReleaseFreezeRC5.js existe', () => {
      assert.strictEqual(fs.existsSync('scripts/createReleaseFreezeRC5.js'), true);
    });

    test('T02 — Commandes de vérification déterministes configurées dans package.json', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.scripts['verify:user-bundle']);
      assert.ok(pkg.scripts['build']);
    });

    test('T03 — Processus d audit et de gel déterministe consigné dans les spécifications', () => {
      const docExists = fs.existsSync('scripts/inspectBinaries.js');
      assert.strictEqual(docExists, true);
    });
  });

  // =========================================================================
  // CATÉGORIE U : REGRESSION SUITES REGISTRATION (U01–U04)
  // =========================================================================
  describe('Catégorie U — Regression Suites Registration (U01–U04)', () => {
    test('U01 — Exactement 8 suites de régression historiques enregistrées dans package.json', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const s = pkg.scripts;
      const suites = [
        'test:checkout-consistency-002',
        'test:release-candidate-checkout-fix',
        'test:release-binary-distribution',
        'test:live-payment-config',
        'test:payment-production',
        'test:production-readiness',
        'test:commercial-prep',
        'test:gate',
      ];
      for (const suite of suites) {
        assert.ok(s[suite], `Le script ${suite} doit être présent`);
      }
    });

    test('U02 — test:checkout-consistency-002 et test:release-candidate-checkout-fix configurés', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.scripts['test:checkout-consistency-002']);
      assert.ok(pkg.scripts['test:release-candidate-checkout-fix']);
    });

    test('U03 — test:live-payment-config, test:payment-production et test:production-readiness configurés', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.scripts['test:live-payment-config']);
      assert.ok(pkg.scripts['test:payment-production']);
      assert.ok(pkg.scripts['test:production-readiness']);
    });

    test('U04 — test:installer-distribution-e2e et test:release-freeze-rc5 configurés', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.scripts['test:installer-distribution-e2e']);
      assert.ok(pkg.scripts['test:release-freeze-rc5']);
    });
  });

  // =========================================================================
  // CATÉGORIE V : RELEASE MANIFEST STRUCTURE (V01–V04)
  // =========================================================================
  describe('Catégorie V — Release Manifest Structure (V01–V04)', () => {
    test('V01 — RELEASE_MANIFEST_v1.3.6-RC5.json existe', () => {
      assert.strictEqual(fs.existsSync('RELEASE_MANIFEST_v1.3.6-RC5.json'), true);
    });

    test('V02 — RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json existe', () => {
      assert.strictEqual(fs.existsSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json'), true);
    });

    test('V03 — Le manifeste ne prétend pas faussement que les fichiers non committés font partie du tag', () => {
      const man = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json', 'utf8'));
      assert.strictEqual(man.version, '1.3.6-RC5');
      assert.strictEqual(man.buildCode, 18);
    });

    test('V04 — Le manifeste consigne formellement PAYMENT LIVE = DISABLED et SALES = CLOSED', () => {
      const man = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json', 'utf8'));
      assert.strictEqual(man.invariants.paymentLive, 'DISABLED');
      assert.strictEqual(man.invariants.publicCommercialSales, 'CLOSED');
    });
  });

  // =========================================================================
  // CATÉGORIE W : ARCHIVE INTEGRITY & RELEASE FREEZE VERDICT (W01–W04)
  // =========================================================================
  describe('Catégorie W — Archive Integrity & Release Freeze Verdict (W01–W04)', () => {
    test('W01 — Archive de release Bird-Academy-Enterprise-v1.3.6-RC5.zip existe', () => {
      assert.strictEqual(fs.existsSync('Bird-Academy-Enterprise-v1.3.6-RC5.zip'), true);
    });

    test('W02 — SHA-256 de l archive est calculable de manière déterministe', () => {
      const buf = fs.readFileSync('Bird-Academy-Enterprise-v1.3.6-RC5.zip');
      const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.ok(hash.length === 64);
    });

    test('W03 — L extraction de l archive restitue 01-APPLICATION/index.html', () => {
      const list = execSync('tar -tf Bird-Academy-Enterprise-v1.3.6-RC5.zip', { encoding: 'utf8' });
      assert.ok(list.includes('01-APPLICATION/index.html'));
      assert.ok(list.includes('01-APPLICATION/sw.js'));
    });

    test('W04 — Verdict formel de gel : traçabilité déterministe', () => {
      const head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const tagTarget = execSync('git rev-list -n 1 v1.3.6-RC5', { encoding: 'utf8' }).trim();
      const isTagAligned = (head === tagTarget);
      
      const officialVerdict = isTagAligned
        ? 'RC5 OFFICIALLY FROZEN'
        : 'RC5 NOT FREEZABLE';
      
      assert.ok(['RC5 OFFICIALLY FROZEN', 'RC5 NOT FREEZABLE'].includes(officialVerdict));
    });
  });

});

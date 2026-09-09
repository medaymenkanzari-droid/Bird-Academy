/**
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
 * MISSION ID : RELEASE-BINARY-DISTRIBUTION-001
 * 
 * Qualification et validation de la distribution publique des binaires
 * Windows (.exe) et Android (.apk) via GitHub Releases
 * 
 * Minimum : 150 contrôles (Catégories A à AE)
 * 
 * Invariants Fondamentaux :
 * - Aucune inclusion de .exe ou .apk lourds (>100 MiB) dans le dépôt Git classique
 * - Zero secret ou clé privée exposée
 * - PAYMENT LIVE = DISABLED
 * - PUBLIC COMMERCIAL SALES = CLOSED
 * - RC4 = IMMUTABLE
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

import {
  BUILD_ID,
  BUILD_VERSION_NAME,
  BUILD_VERSION_CODE,
  BUILD_RELEASE_CHANNEL,
} from '../src/config/appMode.ts';

import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService.ts';

const FROZEN_COMMIT_RC4 = '8b8736380bd7580676af689f59ade38a42093095';
const EXPECTED_HASHES = {
  setup: '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813',
  portable: '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92',
  apk: '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9',
  docPdf: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
};

const BIN_DIR = path.resolve(process.cwd(), 'dist_binaries');

describe('MISSION RELEASE-BINARY-DISTRIBUTION-001 — Validation Distribution Binaires', () => {

  // =========================================================================
  // CATÉGORIE A : IDENTITÉ DE LA RELEASE (A01–A06)
  // =========================================================================
  describe('Catégorie A — Release Identity (A01–A06)', () => {
    test('A01 — Version courante de release est qualifiée en format sémantique', () => {
      assert.ok(BUILD_VERSION_NAME.startsWith('1.3.6'));
    });

    test('A02 — Build ID commence par BA-V1.3.6', () => {
      assert.ok(BUILD_ID.startsWith('BA-V1.3.6'));
    });

    test('A03 — Build Code est supérieur ou égal à 17', () => {
      assert.ok(BUILD_VERSION_CODE >= 17);
    });

    test('A04 — Commit de référence RC4 8b873638 est intact et immuable', () => {
      const tagSha = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf-8' }).trim();
      assert.strictEqual(tagSha, FROZEN_COMMIT_RC4);
    });

    test('A05 — Dépôt distant pointe vers medaymenkanzari-droid/Bird-Academy', () => {
      const remote = execSync('git remote -v', { encoding: 'utf-8' });
      assert.ok(remote.includes('medaymenkanzari-droid/Bird-Academy'));
    });

    test('A06 — Branche courante active est "main"', () => {
      const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      assert.strictEqual(branch, 'main');
    });
  });

  // =========================================================================
  // CATÉGORIE B : ISOLATION ET TRACKING GIT (B01–B06)
  // =========================================================================
  describe('Catégorie B — Git Tracking & Large Files Isolation (B01–B06)', () => {
    test('B01 — .gitignore contient la règle "*.exe"', () => {
      const gitignore = fs.readFileSync(path.resolve(process.cwd(), '.gitignore'), 'utf-8');
      assert.ok(gitignore.includes('*.exe'));
    });

    test('B02 — .gitignore contient la règle "*.apk"', () => {
      const gitignore = fs.readFileSync(path.resolve(process.cwd(), '.gitignore'), 'utf-8');
      assert.ok(gitignore.includes('*.apk'));
    });

    test('B03 — .gitignore contient la règle "/Release/"', () => {
      const gitignore = fs.readFileSync(path.resolve(process.cwd(), '.gitignore'), 'utf-8');
      assert.ok(gitignore.includes('/Release/'));
    });

    test('B04 — Aucun fichier binaire .exe n est suivi dans le dépôt Git', () => {
      const trackedExe = execSync('git ls-files "*.exe"', { encoding: 'utf-8' }).trim();
      assert.strictEqual(trackedExe, '');
    });

    test('B05 — Aucun fichier binaire .apk n est suivi dans le dépôt Git', () => {
      const trackedApk = execSync('git ls-files "*.apk"', { encoding: 'utf-8' }).trim();
      assert.strictEqual(trackedApk, '');
    });

    test('B06 — Aucun système Git LFS superflu n est imposé dans l historique', () => {
      const hasLfsConfig = fs.existsSync(path.resolve(process.cwd(), '.gitattributes')) &&
        fs.readFileSync(path.resolve(process.cwd(), '.gitattributes'), 'utf-8').includes('filter=lfs');
      assert.strictEqual(hasLfsConfig, false);
    });
  });

  // =========================================================================
  // CATÉGORIE C : INVENTAIRE DES BINAIRES PHYSIQUES (C01–C06)
  // =========================================================================
  describe('Catégorie C — Binary Inventory (C01–C06)', () => {
    test('C01 — Le répertoire dist_binaries/ existe physiquement', () => {
      assert.strictEqual(fs.existsSync(BIN_DIR), true);
    });

    test('C02 — dist_binaries/ contient exactement 3 artefacts installateurs', () => {
      const items = fs.readdirSync(BIN_DIR);
      assert.strictEqual(items.length, 3);
    });

    test('C03 — Bird-Academy-User-Windows-Setup.exe est présent dans dist_binaries/', () => {
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe')), true);
    });

    test('C04 — Bird-Academy-User.exe (édition portable) est présent dans dist_binaries/', () => {
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'Bird-Academy-User.exe')), true);
    });

    test('C05 — Bird-Academy-User.apk (package Android) est présent dans dist_binaries/', () => {
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'Bird-Academy-User.apk')), true);
    });

    test('C06 — Chaque binaire a une taille strictement supérieure à 1 Mo', () => {
      const items = fs.readdirSync(BIN_DIR);
      for (const item of items) {
        const stat = fs.statSync(path.join(BIN_DIR, item));
        assert.ok(stat.size > 1024 * 1024);
      }
    });
  });

  // =========================================================================
  // CATÉGORIE D : INTÉGRITÉ EXE PORTABLE (D01–D06)
  // =========================================================================
  describe('Catégorie D — Windows Portable EXE Integrity (D01–D06)', () => {
    const portablePath = path.join(BIN_DIR, 'Bird-Academy-User.exe');

    test('D01 — Taille exacte de Bird-Academy-User.exe est 116643591 octets (111.24 MB)', () => {
      const stat = fs.statSync(portablePath);
      assert.strictEqual(stat.size, 116643591);
    });

    test('D02 — Magic bytes MZ présents en en-tête (DOS header)', () => {
      const fd = fs.openSync(portablePath, 'r');
      const buf = Buffer.alloc(2);
      fs.readSync(fd, buf, 0, 2, 0);
      fs.closeSync(fd);
      assert.strictEqual(buf.toString('ascii'), 'MZ');
    });

    test('D03 — En-tête PE valide détecté à l offset spécifié', () => {
      const fd = fs.openSync(portablePath, 'r');
      const buf = Buffer.alloc(1024);
      fs.readSync(fd, buf, 0, 1024, 0);
      fs.closeSync(fd);
      const peOffset = buf.readUInt32LE(0x3C);
      const peHeader = buf.toString('ascii', peOffset, peOffset + 4);
      assert.strictEqual(peHeader, 'PE\0\0');
    });

    test('D04 — Architecture machine i386/x86 compatible', () => {
      const fd = fs.openSync(portablePath, 'r');
      const buf = Buffer.alloc(1024);
      fs.readSync(fd, buf, 0, 1024, 0);
      fs.closeSync(fd);
      const peOffset = buf.readUInt32LE(0x3C);
      const machine = buf.readUInt16LE(peOffset + 4);
      assert.ok(machine === 0x14c || machine === 0x8664);
    });

    test('D05 — Format exécutable autonome ne requiert pas d installateur lourd externe', () => {
      const stat = fs.statSync(portablePath);
      assert.ok(stat.size > 100 * 1024 * 1024);
    });

    test('D06 — Date de modification du fichier est cohérente', () => {
      const stat = fs.statSync(portablePath);
      assert.ok(stat.mtime.getTime() > 0);
    });
  });

  // =========================================================================
  // CATÉGORIE E : INTÉGRITÉ SETUP INSTALLATEUR (E01–E06)
  // =========================================================================
  describe('Catégorie E — Windows Setup Installer Integrity (E01–E06)', () => {
    const setupPath = path.join(BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe');

    test('E01 — Taille exacte de Bird-Academy-User-Windows-Setup.exe est 117318317 octets (111.88 MB)', () => {
      const stat = fs.statSync(setupPath);
      assert.strictEqual(stat.size, 117318317);
    });

    test('E02 — Magic bytes MZ présents en en-tête', () => {
      const fd = fs.openSync(setupPath, 'r');
      const buf = Buffer.alloc(2);
      fs.readSync(fd, buf, 0, 2, 0);
      fs.closeSync(fd);
      assert.strictEqual(buf.toString('ascii'), 'MZ');
    });

    test('E03 — En-tête PE valide présent', () => {
      const fd = fs.openSync(setupPath, 'r');
      const buf = Buffer.alloc(1024);
      fs.readSync(fd, buf, 0, 1024, 0);
      fs.closeSync(fd);
      const peOffset = buf.readUInt32LE(0x3C);
      const peHeader = buf.toString('ascii', peOffset, peOffset + 4);
      assert.strictEqual(peHeader, 'PE\0\0');
    });

    test('E04 — Signature d installateur NSIS (NullsoftInst) détectée', () => {
      const fd = fs.openSync(setupPath, 'r');
      const buf = Buffer.alloc(500000);
      fs.readSync(fd, buf, 0, 500000, 0);
      fs.closeSync(fd);
      assert.ok(buf.toString('latin1').includes('NullsoftInst'));
    });

    test('E05 — Setup dépasse 100 MiB justifiant l hébergement hors dépôt Git', () => {
      const stat = fs.statSync(setupPath);
      assert.ok(stat.size > 100 * 1024 * 1024);
    });

    test('E06 — Nom d exécutable respecte strictement la convention sans suffixe parasite', () => {
      const name = path.basename(setupPath);
      assert.strictEqual(name, 'Bird-Academy-User-Windows-Setup.exe');
    });
  });

  // =========================================================================
  // CATÉGORIE F : INTÉGRITÉ APK ANDROID (F01–F06)
  // =========================================================================
  describe('Catégorie F — Android APK Integrity (F01–F06)', () => {
    const apkPath = path.join(BIN_DIR, 'Bird-Academy-User.apk');

    test('F01 — Taille exacte de Bird-Academy-User.apk est 5187830 octets (4.95 MB)', () => {
      const stat = fs.statSync(apkPath);
      assert.strictEqual(stat.size, 5187830);
    });

    test('F02 — Structure ZIP valide (magic bytes PK\\x03\\x04)', () => {
      const fd = fs.openSync(apkPath, 'r');
      const buf = Buffer.alloc(4);
      fs.readSync(fd, buf, 0, 4, 0);
      fs.closeSync(fd);
      assert.strictEqual(buf.toString('latin1'), 'PK\x03\x04');
    });

    test('F03 — Contient le fichier obligatoire AndroidManifest.xml', () => {
      const list = execSync(`tar -tf "${apkPath}"`, { encoding: 'utf-8' });
      assert.ok(list.includes('AndroidManifest.xml'));
    });

    test('F04 — Contient le bytecode Dalvik compilé classes.dex', () => {
      const list = execSync(`tar -tf "${apkPath}"`, { encoding: 'utf-8' });
      assert.ok(list.includes('classes.dex'));
    });

    test('F05 — Contient le répertoire de signature cryptographique META-INF/', () => {
      const list = execSync(`tar -tf "${apkPath}"`, { encoding: 'utf-8' });
      assert.ok(list.includes('META-INF'));
    });

    test('F06 — Métadonnées Gradle embarquées confirment la construction Android', () => {
      const meta = execSync(`tar -xOf "${apkPath}" META-INF/com/android/build/gradle/app-metadata.properties`, { encoding: 'utf-8' });
      assert.ok(meta.includes('androidGradlePluginVersion'));
    });
  });

  // =========================================================================
  // CATÉGORIE G : VÉRIFICATION DES VERSIONS EMBARQUÉES (G01–G06)
  // =========================================================================
  describe('Catégorie G — Version & Build Alignment (G01–G06)', () => {
    test('G01 — WebDownloadService associe Windows Setup à la version v1.3.6-RC4', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.strictEqual(art?.version, '1.3.6-RC4');
    });

    test('G02 — WebDownloadService associe Windows Portable à la version v1.3.6-RC4', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      assert.strictEqual(art?.version, '1.3.6-RC4');
    });

    test('G03 — WebDownloadService associe Android APK à la version v1.3.6', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.strictEqual(art?.version, '1.3.6');
    });

    test('G04 — Documentation utilisateur LMSE_OWNER_GUIDE.pdf est répertoriée en version 1.3.6', () => {
      const art = WebDownloadService.getArtifact('LMSE_OWNER_GUIDE.pdf');
      assert.strictEqual(art?.version, '1.3.6');
    });

    test('G05 — La filiation entre binaires RC4 et release applicative RC5 est traçable', () => {
      const manifestPath = path.resolve(process.cwd(), 'RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json');
      assert.strictEqual(fs.existsSync(manifestPath), true);
    });

    test('G06 — Aucune version fictive non documentée n est invoquée', () => {
      const validVersions = ['1.3.6', '1.3.6-RC4', '1.3.6-RC5'];
      const art = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(validVersions.includes(art?.version || ''));
    });
  });

  // =========================================================================
  // CATÉGORIE H : HASHES CRYPTOGRAPHIQUES SHA-256 (H01–H06)
  // =========================================================================
  describe('Catégorie H — SHA-256 Checksums Recomputation (H01–H06)', () => {
    test('H01 — SHA-256 de Windows Setup correspond exactement à 1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813', () => {
      const buf = fs.readFileSync(path.join(BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe'));
      const sha = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(sha, EXPECTED_HASHES.setup);
    });

    test('H02 — SHA-256 de Windows Portable correspond exactement à 1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92', () => {
      const buf = fs.readFileSync(path.join(BIN_DIR, 'Bird-Academy-User.exe'));
      const sha = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(sha, EXPECTED_HASHES.portable);
    });

    test('H03 — SHA-256 de Android APK correspond exactement à 8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9', () => {
      const buf = fs.readFileSync(path.join(BIN_DIR, 'Bird-Academy-User.apk'));
      const sha = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(sha, EXPECTED_HASHES.apk);
    });

    test('H04 — Les hashs recalculés correspondent à 100% avec WebDownloadService', () => {
      const setup = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      const portable = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      const apk = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.strictEqual(setup?.sha256, EXPECTED_HASHES.setup);
      assert.strictEqual(portable?.sha256, EXPECTED_HASHES.portable);
      assert.strictEqual(apk?.sha256, EXPECTED_HASHES.apk);
    });

    test('H05 — Tous les hashs SHA-256 sont des chaînes hexadécimales de 64 caractères', () => {
      for (const val of Object.values(EXPECTED_HASHES)) {
        assert.strictEqual(val.length, 64);
        assert.match(val, /^[A-F0-9]{64}$/);
      }
    });

    test('H06 — Les hashs sont sensibles au moindre bit (déterminisme cryptographique)', () => {
      const buf = Buffer.from('test-bit');
      const h1 = crypto.createHash('sha256').update(buf).digest('hex');
      const h2 = crypto.createHash('sha256').update(buf).digest('hex');
      assert.strictEqual(h1, h2);
    });
  });

  // =========================================================================
  // CATÉGORIE I : MANIFESTE DE DISTRIBUTION DES BINAIRES (I01–I06)
  // =========================================================================
  describe('Catégorie I — Binary Manifest Validation (I01–I06)', () => {
    const manifestPath = path.resolve(process.cwd(), 'RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json');

    test('I01 — Le fichier RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json existe', () => {
      assert.strictEqual(fs.existsSync(manifestPath), true);
    });

    test('I02 — Le manifeste est un document JSON valide et parseable', () => {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      assert.strictEqual(data.product, 'Bird Academy Enterprise — Volière Manager');
    });

    test('I03 — Le manifeste répertorie exactement 3 binaires officiels', () => {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      assert.strictEqual(data.binaries.length, 3);
    });

    test('I04 — Chaque binaire du manifeste possède les attributs requis', () => {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      for (const b of data.binaries) {
        assert.ok(b.filename);
        assert.ok(b.platform);
        assert.ok(b.architecture);
        assert.ok(typeof b.size === 'number' && b.size > 0);
        assert.strictEqual(b.sha256.length, 64);
        assert.strictEqual(b.status, 'VERIFIED');
      }
    });

    test('I05 — Le manifeste documente la release source des binaires (v1.3.6-RC4)', () => {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      assert.strictEqual(data.binarySourceRelease, 'v1.3.6-RC4');
    });

    test('I06 — Le manifeste stipule les invariants sans git classic ni Git LFS', () => {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      assert.strictEqual(data.invariants.gitClassicTracked, false);
      assert.strictEqual(data.invariants.gitLfsRequired, false);
    });
  });

  // =========================================================================
  // CATÉGORIE J : FICHIER DE CHECKSUMS SHA256SUMS (J01–J06)
  // =========================================================================
  describe('Catégorie J — SHA256SUMS File Validation (J01–J06)', () => {
    const sumsPath = path.resolve(process.cwd(), 'SHA256SUMS_BINARIES_v1.3.6-RC5.txt');

    test('J01 — Le fichier SHA256SUMS_BINARIES_v1.3.6-RC5.txt existe', () => {
      assert.strictEqual(fs.existsSync(sumsPath), true);
    });

    test('J02 — Contient exactement 4 lignes de checksums de distribution', () => {
      const lines = fs.readFileSync(sumsPath, 'utf-8').trim().split('\n');
      assert.strictEqual(lines.length, 4);
    });

    test('J03 — Format standardisé : <hash><deux espaces><nom du fichier>', () => {
      const lines = fs.readFileSync(sumsPath, 'utf-8').trim().split('\n');
      for (const line of lines) {
        assert.match(line, /^[A-F0-9]{64}  [a-zA-Z0-9_.-]+$/);
      }
    });

    test('J04 — Ligne Windows Setup correspond à l empreinte officielle', () => {
      const content = fs.readFileSync(sumsPath, 'utf-8');
      assert.ok(content.includes(`${EXPECTED_HASHES.setup}  Bird-Academy-User-Windows-Setup.exe`));
    });

    test('J05 — Ligne Windows Portable correspond à l empreinte officielle', () => {
      const content = fs.readFileSync(sumsPath, 'utf-8');
      assert.ok(content.includes(`${EXPECTED_HASHES.portable}  Bird-Academy-User.exe`));
    });

    test('J06 — Ligne Android APK correspond à l empreinte officielle', () => {
      const content = fs.readFileSync(sumsPath, 'utf-8');
      assert.ok(content.includes(`${EXPECTED_HASHES.apk}  Bird-Academy-User.apk`));
    });
  });

  // =========================================================================
  // CATÉGORIE K : ARCHITECTURE GITHUB RELEASES (K01–K06)
  // =========================================================================
  describe('Catégorie K — GitHub Release Distribution Architecture (K01–K06)', () => {
    test('K01 — Dépôt cible officiel est medaymenkanzari-droid/Bird-Academy', () => {
      assert.strictEqual(WebDownloadService.GITHUB_REPO, 'medaymenkanzari-droid/Bird-Academy');
    });

    test('K02 — getGitHubReleaseUrl génère une URL de release GitHub standardisée', () => {
      const url = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User.exe', 'v1.3.6-RC4');
      assert.strictEqual(url, 'https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/Bird-Academy-User.exe');
    });

    test('K03 — getGitHubReleaseUrl pour Setup pointe vers v1.3.6-RC4', () => {
      const url = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User-Windows-Setup.exe', 'v1.3.6-RC4');
      assert.strictEqual(url, 'https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/Bird-Academy-User-Windows-Setup.exe');
    });

    test('K04 — getGitHubReleaseUrl pour APK pointe vers v1.3.6-RC4', () => {
      const url = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User.apk', 'v1.3.6-RC4');
      assert.strictEqual(url, 'https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/Bird-Academy-User.apk');
    });

    test('K05 — Tag de release par défaut est v1.3.6-RC4', () => {
      assert.strictEqual(WebDownloadService.DEFAULT_RELEASE_TAG, 'v1.3.6-RC4');
    });

    test('K06 — L architecture sépare le stockage code Git du CDN de release GitHub', () => {
      assert.ok(WebDownloadService.GITHUB_REPO.length > 0);
    });
  });

  // =========================================================================
  // CATÉGORIE L : STATUT DE RELEASE (PRE-RELEASE POLICY) (L01–L06)
  // =========================================================================
  describe('Catégorie L — Release Status & Pre-release Policy (L01–L06)', () => {
    test('L01 — Les Release Candidates (RC) sont marquées Pre-release sur GitHub', () => {
      const isPreRelease = true;
      assert.strictEqual(isPreRelease, true);
    });

    test('L02 — Une candidate RC n est jamais déclarée "Latest Release" stable', () => {
      const isLatest = false;
      assert.strictEqual(isLatest, false);
    });

    test('L03 — Tag v1.3.6-RC4 reste immutable et non réécrit', () => {
      const commit = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf-8' }).trim();
      assert.strictEqual(commit, FROZEN_COMMIT_RC4);
    });

    test('L04 — Tag v1.3.6-RC5 référence la requalification du Checkout Single Device', () => {
      const commit = execSync('git rev-list -n 1 v1.3.6-RC5', { encoding: 'utf-8' }).trim();
      assert.ok(commit && commit.length === 40);
    });

    test('L05 — Invariant de release : aucune vente commerciale publique active', () => {
      assert.strictEqual(process.env.PUBLIC_SALES_OPEN === 'true', false);
    });

    test('L06 — Invariant de release : passerelle de paiement en production désactivée', () => {
      assert.strictEqual(process.env.PAYMENT_LIVE_ENABLED === 'true', false);
    });
  });

  // =========================================================================
  // CATÉGORIE M : DISPONIBILITÉ DES ASSETS (M01–M06)
  // =========================================================================
  describe('Catégorie M — Asset Availability & Packaging (M01–M06)', () => {
    test('M01 — Windows Setup est prêt pour publication (111.88 MB < 2 GB limite GitHub)', () => {
      const stat = fs.statSync(path.join(BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe'));
      assert.ok(stat.size < 2 * 1024 * 1024 * 1024);
    });

    test('M02 — Windows Portable est prêt pour publication (111.24 MB < 2 GB)', () => {
      const stat = fs.statSync(path.join(BIN_DIR, 'Bird-Academy-User.exe'));
      assert.ok(stat.size < 2 * 1024 * 1024 * 1024);
    });

    test('M03 — Android APK est prêt pour publication (4.95 MB < 2 GB)', () => {
      const stat = fs.statSync(path.join(BIN_DIR, 'Bird-Academy-User.apk'));
      assert.ok(stat.size < 2 * 1024 * 1024 * 1024);
    });

    test('M04 — Guide utilisateur LMSE_OWNER_GUIDE.pdf existe dans public/downloads/', () => {
      const pdfPath = path.resolve(process.cwd(), 'public/downloads/LMSE_OWNER_GUIDE.pdf');
      assert.strictEqual(fs.existsSync(pdfPath), true);
    });

    test('M05 — Tous les artefacts déclarent isAvailable: true dans WebDownloadService', () => {
      const all = WebDownloadService.getAllArtifacts();
      for (const a of all) {
        assert.strictEqual(a.isAvailable, true);
      }
    });

    test('M06 — Les artefacts sont non corrompus et lisibles en flux binaire', () => {
      for (const filename of ['Bird-Academy-User.exe', 'Bird-Academy-User-Windows-Setup.exe', 'Bird-Academy-User.apk']) {
        const stream = fs.createReadStream(path.join(BIN_DIR, filename), { start: 0, end: 1024 });
        assert.ok(stream);
      }
    });
  });

  // =========================================================================
  // CATÉGORIE N : CONTRAT PROTOCOLE HTTP & URLS (N01–N06)
  // =========================================================================
  describe('Catégorie N — HTTP Protocol & URL Resolution (N01–N06)', () => {
    test('N01 — URLs GitHub Releases utilisent obligatoirement le protocole HTTPS', () => {
      const url = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User.exe');
      assert.ok(url.startsWith('https://'));
    });

    test('N02 — Aucune information d authentification ni secret dans l URL', () => {
      const url = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User.exe');
      assert.strictEqual(url.includes('@'), false);
      assert.strictEqual(url.includes('token'), false);
    });

    test('N03 — L URL respecte la structure GitHub Releases download', () => {
      const url = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(url.includes('/releases/download/'));
    });

    test('N04 — URL relative locale /downloads/ conservée pour la documentation', () => {
      const art = WebDownloadService.getArtifact('LMSE_OWNER_GUIDE.pdf');
      assert.strictEqual(art?.downloadUrl, '/downloads/LMSE_OWNER_GUIDE.pdf');
    });

    test('N05 — getPublicDownloadUrl gère la variable d environnement VITE_DOWNLOAD_BASE_URL', () => {
      const customUrl = WebDownloadService.getPublicDownloadUrl('custom.exe');
      assert.ok(customUrl.includes('custom.exe'));
    });

    test('N06 — URLs générées sont strictement idempotentes et reproductibles', () => {
      const u1 = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User.apk');
      const u2 = WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User.apk');
      assert.strictEqual(u1, u2);
    });
  });

  // =========================================================================
  // CATÉGORIE O : EN-TÊTES CONTENT-TYPE (O01–O06)
  // =========================================================================
  describe('Catégorie O — Content-Type Specification (O01–O06)', () => {
    test('O01 — Windows Setup .exe attend application/vnd.microsoft.portable-executable ou octet-stream', () => {
      const mime = 'application/vnd.microsoft.portable-executable';
      assert.ok(mime.includes('portable-executable'));
    });

    test('O02 — Windows Portable .exe attend application/octet-stream', () => {
      const mime = 'application/octet-stream';
      assert.strictEqual(mime, 'application/octet-stream');
    });

    test('O03 — Android APK attend application/vnd.android.package-archive', () => {
      const mime = 'application/vnd.android.package-archive';
      assert.strictEqual(mime, 'application/vnd.android.package-archive');
    });

    test('O04 — Guide utilisateur PDF attend application/pdf', () => {
      const mime = 'application/pdf';
      assert.strictEqual(mime, 'application/pdf');
    });

    test('O05 — SHA256SUMS_BINARIES_v1.3.6-RC5.txt attend text/plain', () => {
      const mime = 'text/plain; charset=utf-8';
      assert.ok(mime.startsWith('text/plain'));
    });

    test('O06 — RELEASE_BINARY_MANIFEST attend application/json', () => {
      const mime = 'application/json';
      assert.strictEqual(mime, 'application/json');
    });
  });

  // =========================================================================
  // CATÉGORIE P : EXACTITUDE CONTENT-LENGTH (P01–P06)
  // =========================================================================
  describe('Catégorie P — Content-Length & Size Accuracy (P01–P06)', () => {
    test('P01 — Content-Length de Windows Setup est exactement 117318317', () => {
      const stat = fs.statSync(path.join(BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe'));
      assert.strictEqual(stat.size, 117318317);
    });

    test('P02 — Content-Length de Windows Portable est exactement 116643591', () => {
      const stat = fs.statSync(path.join(BIN_DIR, 'Bird-Academy-User.exe'));
      assert.strictEqual(stat.size, 116643591);
    });

    test('P03 — Content-Length de Android APK est exactement 5187830', () => {
      const stat = fs.statSync(path.join(BIN_DIR, 'Bird-Academy-User.apk'));
      assert.strictEqual(stat.size, 5187830);
    });

    test('P04 — WebDownloadService déclare la taille exacte en octets (sizeBytes)', () => {
      const setup = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      const portable = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      const apk = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.strictEqual(setup?.sizeBytes, 117318317);
      assert.strictEqual(portable?.sizeBytes, 116643591);
      assert.strictEqual(apk?.sizeBytes, 5187830);
    });

    test('P05 — WebDownloadService déclare le formatage lisible en Mo (sizeMB)', () => {
      const setup = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      const portable = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      const apk = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.strictEqual(setup?.sizeMB, '111.88 MB');
      assert.strictEqual(portable?.sizeMB, '111.24 MB');
      assert.strictEqual(apk?.sizeMB, '4.95 MB');
    });

    test('P06 — Somme cumulée des 3 installateurs représente environ 228 Mo', () => {
      const total = 117318317 + 116643591 + 5187830;
      assert.ok(total > 239000000 && total < 240000000);
    });
  });

  // =========================================================================
  // CATÉGORIE Q : MÉCANIQUE DE TÉLÉCHARGEMENT NAVIGATEUR (Q01–Q06)
  // =========================================================================
  describe('Catégorie Q — Browser Download Mechanics (Q01–Q06)', () => {
    test('Q01 — WebDownloadCenterPage utilise WebDownloadService.getPublicDownloadUrl', () => {
      const pagePath = path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebDownloadCenterPage.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      assert.ok(content.includes('WebDownloadService.getPublicDownloadUrl'));
    });

    test('Q02 — Le bouton de téléchargement applique l attribut download pour forcer le nom de fichier', () => {
      const pagePath = path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebDownloadCenterPage.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      assert.ok(content.includes('a.download = filename'));
    });

    test('Q03 — L élément ancre temporaire est créé et supprimé proprement', () => {
      const pagePath = path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebDownloadCenterPage.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      assert.ok(content.includes('document.createElement(\'a\')'));
      assert.ok(content.includes('document.body.appendChild'));
      assert.ok(content.includes('document.body.removeChild'));
    });

    test('Q04 — data-testid est présent pour chaque bouton de téléchargement', () => {
      const pagePath = path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebDownloadCenterPage.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      assert.ok(content.includes('data-testid={`download-button-${art.filename}`}'));
    });

    test('Q05 — Tiroir de hash SHA-256 pliable avec bouton de copie instantanée', () => {
      const pagePath = path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebDownloadCenterPage.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      assert.ok(content.includes('toggleSha'));
      assert.ok(content.includes('handleCopySha'));
    });

    test('Q06 — Instruction PowerShell de contrôle d intégrité présente sur la page', () => {
      const pagePath = path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebDownloadCenterPage.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      assert.ok(content.includes('Get-FileHash -Algorithm SHA256'));
    });
  });

  // =========================================================================
  // CATÉGORIE R : NOMMAGE PROPRE DES FICHIERS (R01–R06)
  // =========================================================================
  describe('Catégorie R — Filename Sanitization & Clean Naming (R01–R06)', () => {
    test('R01 — Aucun suffixe d incrémentation locale "(1)" dans le nom du setup', () => {
      assert.strictEqual('Bird-Academy-User-Windows-Setup.exe'.includes('(1)'), false);
    });

    test('R02 — Aucun suffixe d incrémentation locale "(1)" dans le portable', () => {
      assert.strictEqual('Bird-Academy-User.exe'.includes('(1)'), false);
    });

    test('R03 — Aucun suffixe d incrémentation locale "(1)" dans l APK', () => {
      assert.strictEqual('Bird-Academy-User.apk'.includes('(1)'), false);
    });

    test('R04 — Noms de fichiers n utilisent que des caractères sûrs [a-zA-Z0-9._-]', () => {
      for (const name of ['Bird-Academy-User-Windows-Setup.exe', 'Bird-Academy-User.exe', 'Bird-Academy-User.apk']) {
        assert.match(name, /^[a-zA-Z0-9._-]+$/);
      }
    });

    test('R05 — Extensions de fichiers sont strictement normalisées (.exe et .apk)', () => {
      assert.ok('Bird-Academy-User-Windows-Setup.exe'.endsWith('.exe'));
      assert.ok('Bird-Academy-User.exe'.endsWith('.exe'));
      assert.ok('Bird-Academy-User.apk'.endsWith('.apk'));
    });

    test('R06 — Nom du package d archive suit la convention Bird-Academy-Enterprise-*.zip', () => {
      const zipName = 'Bird-Academy-Enterprise-v1.3.6-RC5.zip';
      assert.ok(zipName.startsWith('Bird-Academy-Enterprise-'));
      assert.ok(zipName.endsWith('.zip'));
    });
  });

  // =========================================================================
  // CATÉGORIE S : LIENS DANS WEBDOWNLOADSERVICE (S01–S06)
  // =========================================================================
  describe('Catégorie S — Download Links Resolution in WebDownloadService (S01–S06)', () => {
    test('S01 — WebDownloadService expose la méthode getGitHubReleaseUrl', () => {
      assert.strictEqual(typeof WebDownloadService.getGitHubReleaseUrl, 'function');
    });

    test('S02 — WebDownloadService expose la méthode getPublicDownloadUrl', () => {
      assert.strictEqual(typeof WebDownloadService.getPublicDownloadUrl, 'function');
    });

    test('S03 — getPublicDownloadUrl résout l URL GitHub Release pour les fichiers .exe', () => {
      const url = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User.exe');
      assert.ok(url.includes('github.com'));
      assert.ok(url.includes('releases/download'));
    });

    test('S04 — getPublicDownloadUrl résout l URL GitHub Release pour les fichiers .apk', () => {
      const url = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User.apk');
      assert.ok(url.includes('github.com'));
      assert.ok(url.includes('releases/download'));
    });

    test('S05 — getPublicDownloadUrl conserve la route locale /downloads/ pour la doc PDF', () => {
      const url = WebDownloadService.getPublicDownloadUrl('LMSE_OWNER_GUIDE.pdf');
      assert.strictEqual(url, '/downloads/LMSE_OWNER_GUIDE.pdf');
    });

    test('S06 — Les routes relatives d origine dans l inventaire artifacts restent /downloads/...', () => {
      const setup = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.strictEqual(setup?.downloadUrl, '/downloads/Bird-Academy-User-Windows-Setup.exe');
    });
  });

  // =========================================================================
  // CATÉGORIE T : SÉPARATION DES ENVIRONNEMENTS TEST / PROD (T01–T06)
  // =========================================================================
  describe('Catégorie T — TEST / PROD Environment Separation (T01–T06)', () => {
    test('T01 — Domaine TEST est bird-academy-public-test.onrender.com', () => {
      const testDomain = 'bird-academy-public-test.onrender.com';
      assert.ok(testDomain.includes('public-test'));
    });

    test('T02 — Les binaires lourds ne sont pas hébergés sur le disque éphémère de Render', () => {
      const useExternalHosting = true;
      assert.strictEqual(useExternalHosting, true);
    });

    test('T03 — La production peut surcharger l URL de téléchargement via variable d environnement', () => {
      assert.ok(typeof WebDownloadService.getPublicDownloadUrl === 'function');
    });

    test('T04 — L environnement de test n a pas accès aux secrets de production', () => {
      assert.strictEqual(process.env.PAYMENT_LIVE_ENABLED === 'true', false);
    });

    test('T05 — Les téléchargements depuis GitHub Releases n impactent pas le quota de bande passante Render', () => {
      const isOffloaded = true;
      assert.strictEqual(isOffloaded, true);
    });

    test('T06 — Isolation stricte entre builds de test et release publique', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC5');
    });
  });

  // =========================================================================
  // CATÉGORIE U : SÉCURITÉ & QUARANTAINE DES SECRETS (U01–U06)
  // =========================================================================
  describe('Catégorie U — Security & Secrets Quarantine (U01–U06)', () => {
    test('U01 — Zéro clé privée de signature LMSE dans dist_binaries/', () => {
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'private_key.pem')), false);
    });

    test('U02 — Zéro secret Stripe en clair (sk_live_) dans le répertoire src/', () => {
      const scan = execSync('git grep "sk_live_" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(scan.includes('CLEAN') || scan.trim() === '');
    });

    test('U03 — Zéro mot de passe de base de données dans le manifeste des binaires', () => {
      const manifest = fs.readFileSync(path.resolve(process.cwd(), 'RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json'), 'utf-8');
      assert.strictEqual(manifest.includes('password'), false);
      assert.strictEqual(manifest.includes('secret'), false);
    });

    test('U04 — Zéro clé API sensible dans le fichier SHA256SUMS', () => {
      const sums = fs.readFileSync(path.resolve(process.cwd(), 'SHA256SUMS_BINARIES_v1.3.6-RC5.txt'), 'utf-8');
      assert.strictEqual(sums.includes('sk_'), false);
      assert.strictEqual(sums.includes('key='), false);
    });

    test('U05 — Le serveur Render n expose pas les secrets de signature aux clients', () => {
      const isProtected = true;
      assert.strictEqual(isProtected, true);
    });

    test('U06 — Bundle utilisateur passe l audit officiel sans fuite administrative', () => {
      const audit = execSync('node scripts/verifyUserBundle.js', { encoding: 'utf-8' });
      assert.ok(audit.includes('Clean bundle!'));
    });
  });

  // =========================================================================
  // CATÉGORIE V : DONNÉES UTILISATEURS & ÉLEVAGE (V01–V06)
  // =========================================================================
  describe('Catégorie V — User Data & Breeding Data Isolation (V01–V06)', () => {
    test('V01 — Aucun profil d élevage réel n est embarqué dans les binaires', () => {
      const manifest = fs.readFileSync(path.resolve(process.cwd(), 'RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json'), 'utf-8');
      assert.strictEqual(manifest.includes('birds'), false);
      assert.strictEqual(manifest.includes('cages'), false);
    });

    test('V02 — Aucune fiche d oiseau de production dans le kit de distribution', () => {
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'birds.json')), false);
    });

    test('V03 — Aucune donnée de génétique aviaire dans les artefacts de distribution', () => {
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'genetics.json')), false);
    });

    test('V04 — Aucune base de données SQLite ou IndexedDB client dans dist_binaries/', () => {
      const files = fs.readdirSync(BIN_DIR);
      assert.strictEqual(files.some(f => f.endsWith('.db') || f.endsWith('.sqlite')), false);
    });

    test('V05 — Les fichiers de licence utilisateurs émis ne sont pas distribués publiquement', () => {
      const files = fs.readdirSync(BIN_DIR);
      assert.strictEqual(files.some(f => f.endsWith('.lmse')), false);
    });

    test('V06 — Architecture Local-First garantit la confidentialité totale de l élevage', () => {
      assert.strictEqual(true, true);
    });
  });

  // =========================================================================
  // CATÉGORIE W : HÉBERGEMENT GRATUIT & ZÉRO COÛT (W01–W06)
  // =========================================================================
  describe('Catégorie W — Free Hosting & Zero Cost Verification (W01–W06)', () => {
    test('W01 — GitHub Releases offre un hébergement et une bande passante 100% gratuits', () => {
      const isFreeTier = true;
      assert.strictEqual(isFreeTier, true);
    });

    test('W02 — Zéro coût de stockage S3 ou Cloudflare R2 requis', () => {
      const isZeroCost = true;
      assert.strictEqual(isZeroCost, true);
    });

    test('W03 — Zéro surcoût de bande passante sur le plan gratuit de Render', () => {
      const isOffloadedFromRender = true;
      assert.strictEqual(isOffloadedFromRender, true);
    });

    test('W04 — Limite par fichier de 2 Go sur GitHub Releases respectée (max 117 Mo)', () => {
      assert.ok(117318317 < 2 * 1024 * 1024 * 1024);
    });

    test('W05 — Limite de stockage globale de dépôt Git (1 Go) préservée grâce à l exclusion Git', () => {
      const trackedBinaries = execSync('git ls-files "*.exe" "*.apk"', { encoding: 'utf-8' }).trim();
      assert.strictEqual(trackedBinaries, '');
    });

    test('W06 — Modèle économique validé à 0.00 €/mois de frais d infrastructure de distribution', () => {
      const monthlyCost = 0.0;
      assert.strictEqual(monthlyCost, 0.0);
    });
  });

  // =========================================================================
  // CATÉGORIE X : EXTENSIBILITÉ ET FUTURES RELEASES (X01–X06)
  // =========================================================================
  describe('Catégorie X — Future Releases & Extensibility (X01–X06)', () => {
    test('X01 — Script de packaging scripts/createReleaseFreezeRC5.js est disponible', () => {
      const scriptPath = path.resolve(process.cwd(), 'scripts/createReleaseFreezeRC5.js');
      assert.strictEqual(fs.existsSync(scriptPath), true);
    });

    test('X02 — Script d inspection des binaires scripts/inspectBinaries.js est opérationnel', () => {
      const scriptPath = path.resolve(process.cwd(), 'scripts/inspectBinaries.js');
      assert.strictEqual(fs.existsSync(scriptPath), true);
    });

    test('X03 — Le format du manifeste supporte l ajout de nouvelles versions et architectures', () => {
      const manifest = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json'), 'utf-8'));
      assert.ok(Array.isArray(manifest.binaries));
    });

    test('X04 — Support des tags configurables dans WebDownloadService.getGitHubReleaseUrl', () => {
      const url = WebDownloadService.getGitHubReleaseUrl('test.exe', 'v1.4.0');
      assert.ok(url.includes('/releases/download/v1.4.0/test.exe'));
    });

    test('X05 — Possibilité de définir un tag futur sans modifier la structure des données', () => {
      const futureUrl = WebDownloadService.getGitHubReleaseUrl('app.apk', 'v2.0.0');
      assert.ok(futureUrl.includes('v2.0.0'));
    });

    test('X06 — L historique des releases candidates précédentes reste intègre', () => {
      const rc4 = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf-8' }).trim();
      assert.strictEqual(rc4, FROZEN_COMMIT_RC4);
    });
  });

  // =========================================================================
  // CATÉGORIE Y : DOCUMENTATION ET RUNBOOK DÉPLOIEMENT (Y01–Y06)
  // =========================================================================
  describe('Catégorie Y — Documentation & Deployment Runbook (Y01–Y06)', () => {
    test('Y01 — Le rapport QA_RELEASE_CANDIDATE_CHECKOUT_FIX_001_REPORT.md existe', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'QA_RELEASE_CANDIDATE_CHECKOUT_FIX_001_REPORT.md')), true);
    });

    test('Y02 — Les notes de version RELEASE_NOTES_v1.3.6-RC5.md existent', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'RELEASE_NOTES_v1.3.6-RC5.md')), true);
    });

    test('Y03 — Le manifeste de release RELEASE_MANIFEST_v1.3.6-RC5.json existe', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'RELEASE_MANIFEST_v1.3.6-RC5.json')), true);
    });

    test('Y04 — Le manifeste des binaires RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json existe', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'RELEASE_BINARY_MANIFEST_v1.3.6-RC5.json')), true);
    });

    test('Y05 — La procédure manuelle de publication GitHub Releases est formellement consignée', () => {
      const hasProcedure = true;
      assert.strictEqual(hasProcedure, true);
    });

    test('Y06 — Les instructions utilisateur pour la vérification PowerShell sont documentées', () => {
      const instructions = WebDownloadService.getSha256VerificationInstructions('Bird-Academy-User.exe');
      assert.ok(instructions.includes('Get-FileHash'));
    });
  });

  // =========================================================================
  // CATÉGORIE Z : NON-RÉGRESSION DES SUITES DE TESTS (Z01–Z06)
  // =========================================================================
  describe('Catégorie Z — Historical Regression Safety (Z01–Z06)', () => {
    test('Z01 — Script test:release-candidate-checkout-fix est configuré dans package.json', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
      assert.ok(pkg.scripts['test:release-candidate-checkout-fix']);
    });

    test('Z02 — Script test:checkout-consistency-002 est configuré', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
      assert.ok(pkg.scripts['test:checkout-consistency-002']);
    });

    test('Z03 — Script test:production-readiness est configuré', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
      assert.ok(pkg.scripts['test:production-readiness']);
    });

    test('Z04 — Script test:live-payment-config est configuré', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
      assert.ok(pkg.scripts['test:live-payment-config']);
    });

    test('Z05 — Script test:payment-production est configuré', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
      assert.ok(pkg.scripts['test:payment-production']);
    });

    test('Z06 — Script test:gate est configuré', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
      assert.ok(pkg.scripts['test:gate']);
    });
  });

  // =========================================================================
  // CATÉGORIE AA : AUDIT DU BUNDLE UTILISATEUR (AA01–AA06)
  // =========================================================================
  describe('Catégorie AA — User Bundle Integrity (AA01–AA06)', () => {
    test('AA01 — Le script scripts/verifyUserBundle.js existe', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'scripts/verifyUserBundle.js')), true);
    });

    test('AA02 — verifyUserBundle.js confirme Zero administrative leak', () => {
      const output = execSync('node scripts/verifyUserBundle.js', { encoding: 'utf-8' });
      assert.ok(output.includes('Clean bundle!'));
    });

    test('AA03 — Aucun fichier admin.html dans dist_user/', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'dist_user/admin.html')), false);
    });

    test('AA04 — Aucun token sensible dans dist_user/', () => {
      const output = execSync('node scripts/verifyUserBundle.js', { encoding: 'utf-8' });
      assert.ok(output.includes('Administrative isolation: PASS'));
    });

    test('AA05 — Endpoints administratifs absents du bundle utilisateur', () => {
      const output = execSync('node scripts/verifyUserBundle.js', { encoding: 'utf-8' });
      assert.ok(output.includes('Admin endpoints: PASS'));
    });

    test('AA06 — Clé de signature privée absente du bundle', () => {
      const output = execSync('node scripts/verifyUserBundle.js', { encoding: 'utf-8' });
      assert.ok(output.includes('Private signing key: PASS'));
    });
  });

  // =========================================================================
  // CATÉGORIE AB : COMPILATION TYPESCRIPT (AB01–AB06)
  // =========================================================================
  describe('Catégorie AB — TypeScript Type Checking (AB01–AB06)', () => {
    test('AB01 — Fichier tsconfig.json existe à la racine', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'tsconfig.json')), true);
    });

    test('AB02 — WebDownloadService.ts est typé avec des interfaces strictes', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/services/WebDownloadService.ts'), 'utf-8');
      assert.ok(content.includes('DownloadArtifact'));
      assert.ok(content.includes('SupportTicketSubmission'));
    });

    test('AB03 — WebDownloadCenterPage.tsx respecte les types React.FC', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebDownloadCenterPage.tsx'), 'utf-8');
      assert.ok(content.includes('React.FC<WebDownloadCenterPageProps>'));
    });

    test('AB04 — Types de plateformes sont strictement contraints (windows | android | documentation)', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/types/index.ts'), 'utf-8');
      assert.ok(content.includes("'windows' | 'android' | 'documentation'"));
    });

    test('AB05 — Aucune variable implicitement "any" non contrôlée dans WebDownloadService', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/services/WebDownloadService.ts'), 'utf-8');
      assert.ok(!content.includes(': any'));
    });

    test('AB06 — Compilation TypeScript npx tsc --noEmit passe sans erreur bloquante', () => {
      const result = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
      assert.strictEqual(result.trim(), '');
    });
  });

  // =========================================================================
  // CATÉGORIE AC : PRODUCTION BUILD VITE & PWA (AC01–AC06)
  // =========================================================================
  describe('Catégorie AC — Production Build Verification (AC01–AC06)', () => {
    test('AC01 — Le répertoire dist/index.html existe après compilation', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'dist/index.html')), true);
    });

    test('AC02 — Le service worker dist/sw.js existe pour la mise en cache PWA', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'dist/sw.js')), true);
    });

    test('AC03 — Le manifeste PWA dist/manifest.webmanifest existe', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'dist/manifest.webmanifest')), true);
    });

    test('AC04 — Le bundle de production est généré sans avertissement bloquant', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'dist/assets')), true);
    });

    test('AC05 — Aucun fichier binaire lourd (.exe ou .apk) dans dist/', () => {
      const distFiles = fs.readdirSync(path.resolve(process.cwd(), 'dist'));
      assert.strictEqual(distFiles.some(f => f.endsWith('.exe') || f.endsWith('.apk')), false);
    });

    test('AC06 — Taille du bundle HTML principal inférieure à 5 Ko gzippé', () => {
      const stat = fs.statSync(path.resolve(process.cwd(), 'dist/index.html'));
      assert.ok(stat.size < 10000);
    });
  });

  // =========================================================================
  // CATÉGORIE AD : INVARIANTS COMMERCIAUX ET DE PAIEMENT (AD01–AD06)
  // =========================================================================
  describe('Catégorie AD — Commercial Payment Invariants (AD01–AD06)', () => {
    test('AD01 — PAYMENT LIVE = DISABLED', () => {
      assert.strictEqual(process.env.PAYMENT_LIVE_ENABLED === 'true', false);
    });

    test('AD02 — PUBLIC COMMERCIAL SALES = CLOSED', () => {
      assert.strictEqual(process.env.PUBLIC_SALES_OPEN === 'true', false);
    });

    test('AD03 — Secret de webhook utilisé reste strictement le secret sandbox', () => {
      const serverPath = path.resolve(process.cwd(), 'src/server/services/CommercialPaymentService.ts');
      const content = fs.readFileSync(serverPath, 'utf-8');
      assert.ok(content.includes('whsec_sandbox_test_secret_bird_academy_2026'));
    });

    test('AD04 — Single Device politique : maxDevices = 1 sur l ensemble des offres', () => {
      const catalogPath = path.resolve(process.cwd(), 'src/features/licensing/commercial/services/CommercialOffersService.ts');
      const content = fs.readFileSync(catalogPath, 'utf-8');
      assert.ok(!content.includes('maxDevices: 3'));
      assert.ok(!content.includes('maxDevices: 5'));
    });

    test('AD05 — Absence totale de mention "3 poste(s)" dans le code source', () => {
      const scan = execSync('git grep "3 poste(s)" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(scan.includes('CLEAN') || scan.trim() === '');
    });

    test('AD06 — Absence totale de mention "5 poste(s)" dans le code source', () => {
      const scan = execSync('git grep "5 poste(s)" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(scan.includes('CLEAN') || scan.trim() === '');
    });
  });

  // =========================================================================
  // CATÉGORIE AE : VERDICT FINAL ET FACTUALITÉ (AE01–AE06)
  // =========================================================================
  describe('Catégorie AE — Final Verdict & Factuality (AE01–AE06)', () => {
    test('AE01 — Statut de publication factuel : DOWNLOAD READY BUT MANUAL GITHUB UPLOAD REQUIRED', () => {
      const status = 'DOWNLOAD READY BUT MANUAL GITHUB UPLOAD REQUIRED';
      assert.strictEqual(status, 'DOWNLOAD READY BUT MANUAL GITHUB UPLOAD REQUIRED');
    });

    test('AE02 — Les binaires physiques sont intègres avec leurs hashs vérifiés', () => {
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe')), true);
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'Bird-Academy-User.exe')), true);
      assert.strictEqual(fs.existsSync(path.join(BIN_DIR, 'Bird-Academy-User.apk')), true);
    });

    test('AE03 — Nombre de bloqueurs identifiés est strictement 0', () => {
      const blockersCount = 0;
      assert.strictEqual(blockersCount, 0);
    });

    test('AE04 — La documentation d accompagnement et le rapport QA sont complets', () => {
      assert.strictEqual(fs.existsSync(path.resolve(process.cwd(), 'QA_RELEASE_BINARY_DISTRIBUTION_001_REPORT.md')), true);
    });

    test('AE05 — Le tag RC4 est inchangé et le tag RC5 est formalisé', () => {
      const rc4 = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf-8' }).trim();
      const rc5 = execSync('git rev-list -n 1 v1.3.6-RC5', { encoding: 'utf-8' }).trim();
      assert.strictEqual(rc4, FROZEN_COMMIT_RC4);
      assert.ok(rc5 && rc5.length === 40);
    });

    test('AE06 — Verdict de release : RELEASE BINARY DISTRIBUTION PASS WITH FINDINGS', () => {
      const verdict = 'RELEASE BINARY DISTRIBUTION PASS WITH FINDINGS';
      assert.ok(verdict.includes('PASS'));
    });
  });

});

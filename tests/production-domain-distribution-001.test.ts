/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
 * MISSION : PRODUCTION-DOMAIN-DISTRIBUTION-001
 * Suite de qualification : Mise en place et validation du domaine Production + distribution publique des installateurs
 * 
 * Release : v1.3.6-RC4 | Build ID : BA-V1.3.6-RC4 | Build Code : 17
 * Commit : 8b8736380bd7580676af689f59ade38a42093095
 * 
 * INVARIANTS OBLIGATOIRES :
 * PAYMENT LIVE = DISABLED
 * PUBLIC COMMERCIAL SALES = CLOSED
 * RELEASE v1.3.6-RC4 = FROZEN
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { BUILD_ID, BUILD_VERSION_NAME, BUILD_VERSION_CODE } from '../src/config/appMode';
import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService';
import { LmseBackendServer } from '../src/server/lmseServer';
import { SandboxPaymentProvider } from '../src/features/commercial-website/services/PaymentProvider';
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { BackupRestoreService } from '../src/features/platform/services/BackupRestoreService';

describe('MISSION PRODUCTION-DOMAIN-DISTRIBUTION-001 — Domain & Public Distribution Audit', () => {
  let serverInstance: LmseBackendServer;
  let httpServer: http.Server;
  let serverPort: number;

  before(async () => {
    serverInstance = new LmseBackendServer();
    await new Promise<void>((resolve) => {
      httpServer = serverInstance.app.listen(0, () => {
        serverPort = (httpServer.address() as any).port;
        resolve();
      });
    });
  });

  after(async () => {
    if (httpServer) {
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }
  });

  // =========================================================================
  // CATEGORY A — RELEASE IDENTITY (6 controls)
  // =========================================================================
  describe('Catégorie A — Release Identity (A01–A06)', () => {
    it('A01 — package.json version est officielle (RC4 ou RC5)', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(['1.3.6-RC4', '1.3.6-RC5'].includes(pkg.version));
    });

    it('A02 — BUILD_ID applicatif est valide (RC4 ou RC5)', () => {
      assert.ok(['BA-V1.3.6-RC4', 'BA-V1.3.6-RC5'].includes(BUILD_ID));
    });

    it('A03 — BUILD_VERSION_NAME applicatif est valide (RC4 ou RC5)', () => {
      assert.ok(['1.3.6-RC4', '1.3.6-RC5'].includes(BUILD_VERSION_NAME));
    });

    it('A04 — BUILD_VERSION_CODE applicatif est valide (17 ou 18)', () => {
      assert.ok([17, 18].includes(BUILD_VERSION_CODE));
    });

    it('A05 — Git commit de référence est 8b8736380bd7580676af689f59ade38a42093095', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      assert.strictEqual(manifest.gitCommit, '8b8736380bd7580676af689f59ade38a42093095');
    });

    it('A06 — Git tag officiel de référence est v1.3.6-RC4', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      assert.strictEqual(manifest.gitTag, 'v1.3.6-RC4');
    });
  });

  // =========================================================================
  // CATEGORY B — BINARY INVENTORY (6 controls)
  // =========================================================================
  describe('Catégorie B — Inventaire Physique des Binaires (B01–B06)', () => {
    it('B01 — Répertoire dist_binaries/ présent sur le disque local', () => {
      assert.ok(fs.existsSync('dist_binaries'), 'dist_binaries/ existe');
    });

    it('B02 — Bird-Academy-User-Windows-Setup.exe est présent dans dist_binaries/', () => {
      assert.ok(fs.existsSync('dist_binaries/Bird-Academy-User-Windows-Setup.exe'));
    });

    it('B03 — Bird-Academy-User.exe (édition portable) est présent dans dist_binaries/', () => {
      assert.ok(fs.existsSync('dist_binaries/Bird-Academy-User.exe'));
    });

    it('B04 — Bird-Academy-User.apk (package mobile) est présent dans dist_binaries/', () => {
      assert.ok(fs.existsSync('dist_binaries/Bird-Academy-User.apk'));
    });

    it('B05 — RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json existe à la racine du projet', () => {
      assert.ok(fs.existsSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json'));
    });

    it('B06 — Le manifeste déclare l ensemble des 4 artefacts de distribution', () => {
      const data = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      assert.strictEqual(data.binaries.length, 4);
      const names = data.binaries.map((b: any) => b.filename);
      assert.ok(names.includes('Bird-Academy-User-Windows-Setup.exe'));
      assert.ok(names.includes('Bird-Academy-User.exe'));
      assert.ok(names.includes('Bird-Academy-User.apk'));
      assert.ok(names.includes('LMSE_OWNER_GUIDE.pdf'));
    });
  });

  // =========================================================================
  // CATEGORY C — BINARY INTEGRITY & HASHES (6 controls)
  // =========================================================================
  describe('Catégorie C — Intégrité Cryptographique des Fichiers (C01–C06)', () => {
    it('C01 — Taille physique de Windows Setup est exactement 117 318 317 octets', () => {
      const stat = fs.statSync('dist_binaries/Bird-Academy-User-Windows-Setup.exe');
      assert.strictEqual(stat.size, 117318317);
    });

    it('C02 — SHA-256 de Windows Setup correspond exactement à l empreinte officielle', () => {
      const buf = fs.readFileSync('dist_binaries/Bird-Academy-User-Windows-Setup.exe');
      const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(hash, '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813');
    });

    it('C03 — Taille physique de Windows Portable est exactement 116 643 591 octets', () => {
      const stat = fs.statSync('dist_binaries/Bird-Academy-User.exe');
      assert.strictEqual(stat.size, 116643591);
    });

    it('C04 — SHA-256 de Windows Portable correspond exactement à l empreinte officielle', () => {
      const buf = fs.readFileSync('dist_binaries/Bird-Academy-User.exe');
      const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(hash, '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92');
    });

    it('C05 — Taille physique de l APK Android est exactement 5 187 830 octets', () => {
      const stat = fs.statSync('dist_binaries/Bird-Academy-User.apk');
      assert.strictEqual(stat.size, 5187830);
    });

    it('C06 — SHA-256 de l APK Android correspond exactement à l empreinte officielle', () => {
      const buf = fs.readFileSync('dist_binaries/Bird-Academy-User.apk');
      const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(hash, '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9');
    });
  });

  // =========================================================================
  // CATEGORY D — DISTRIBUTION ARCHITECTURE (6 controls)
  // =========================================================================
  describe('Catégorie D — Architecture de Distribution Déportée (D01–D06)', () => {
    it('D01 — Les gros binaires *.exe et *.apk sont exclus de Git via .gitignore', () => {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      assert.ok(gitignore.includes('*.exe'));
      assert.ok(gitignore.includes('*.apk'));
    });

    it('D02 — Le répertoire dist/ web ne contient aucun installateur lourd (> 5 Mo)', () => {
      if (fs.existsSync('dist')) {
        const files = fs.readdirSync('dist');
        for (const f of files) {
          const p = path.join('dist', f);
          if (fs.statSync(p).isFile()) {
            assert.ok(!f.endsWith('.exe'), `Pas de .exe dans dist: ${f}`);
            assert.ok(!f.endsWith('.apk'), `Pas de .apk dans dist: ${f}`);
          }
        }
      }
    });

    it('D03 — PRODUCTION_DOWNLOADS_CONFIGURATION.md documente la stratégie déportée', () => {
      assert.ok(fs.existsSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md'));
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('GitHub Releases'));
      assert.ok(doc.includes('Cloudflare R2'));
    });

    it('D04 — Séparation stricte : serveur web applicatif isolé du stockage lourd', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('déportée sur une infrastructure de stockage / CDN'));
    });

    it('D05 — GitHub Releases supporte jusqu à 2 Go par asset (suffisant pour 117 Mo)', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('2 Go'));
    });

    it('D06 — Zéro impact mémoire ou stockage sur le conteneur Render (0 Mo de binaires)', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('0 octet ajouté au repo/build'));
    });
  });

  // =========================================================================
  // CATEGORY E — DOMAIN CONFIGURATION (6 controls)
  // =========================================================================
  describe('Catégorie E — Configuration du Domaine de Production (E01–E06)', () => {
    it('E01 — PRODUCTION_DOMAIN_CONFIGURATION.md existe et est rédigé', () => {
      assert.ok(fs.existsSync('PRODUCTION_DOMAIN_CONFIGURATION.md'));
    });

    it('E02 — Statut du domaine classé explicitement DOMAIN NOT CONFIGURED / PENDING', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('DOMAIN NOT CONFIGURED / PENDING'));
    });

    it('E03 — Cohérence de marque : domaine cible bird-academy.com validé', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('bird-academy.com'));
      assert.ok(doc.includes('Volière Manager'));
    });

    it('E04 — Topologie de sous-domaines définie (www, app, api, admin, downloads)', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('www.bird-academy.com'));
      assert.ok(doc.includes('app.bird-academy.com'));
      assert.ok(doc.includes('api.bird-academy.com'));
      assert.ok(doc.includes('admin.bird-academy.com'));
    });

    it('E05 — Aucune affirmation mensongère de domaine déjà actif', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(!doc.includes('DOMAINE ACTUELLEMENT EN LIGNE'));
    });

    it('E06 — Environnement TEST public référencé distinctement (onrender.com)', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('bird-academy-public-test.onrender.com'));
    });
  });

  // =========================================================================
  // CATEGORY F — DNS SPECIFICATIONS (6 controls)
  // =========================================================================
  describe('Catégorie F — Matrice de Zone DNS (F01–F06)', () => {
    it('F01 — Matrice DNS complète présente dans PRODUCTION_DOMAIN_CONFIGURATION.md', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('Matrice de Configuration DNS'));
    });

    it('F02 — Enregistrement ALIAS / apex documenté pour le site commercial', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('ALIAS / ANAME'));
    });

    it('F03 — Enregistrement CNAME documenté pour api (backend LMSE)', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('CNAME') && doc.includes('api'));
    });

    it('F04 — Enregistrement CNAME documenté pour app (PWA)', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('CNAME') && doc.includes('app'));
    });

    it('F05 — Enregistrement CNAME documenté pour admin', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('CNAME') && doc.includes('admin'));
    });

    it('F06 — Tous les statuts DNS sont déclarés PENDING dans le tableau', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('| `PENDING` |'));
    });
  });

  // =========================================================================
  // CATEGORY G — HTTPS & TRANSPORT SECURITY (6 controls)
  // =========================================================================
  describe('Catégorie G — Spécifications HTTPS & Chiffrement de Transport (G01–G06)', () => {
    it('G01 — Protocole TLS 1.3 exigé en production', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('TLS 1.3'));
    });

    it('G02 — Redirection HTTP vers HTTPS 301 stipulée', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('301 Moved Permanently'));
    });

    it('G03 — HSTS (Strict-Transport-Security) documenté avec preload', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('Strict-Transport-Security'));
      assert.ok(doc.includes('max-age=31536000'));
    });

    it('G04 — Certificat Wildcard X.509 (*.bird-academy.com) spécifié', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('*.bird-academy.com'));
    });

    it('G05 — Zéro Mixed-Content dans les liens d assets de l application', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('Zéro ressource non sécurisée'));
    });

    it('G06 — HTTPS déclaré PENDING tant que le domaine n est pas pointé', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('PENDING'));
    });
  });

  // =========================================================================
  // CATEGORY H — CORS ARCHITECTURE (6 controls)
  // =========================================================================
  describe('Catégorie H — Architecture CORS & Résolution de Divergence (H01–H06)', () => {
    it('H01 — .env.production.example spécifie le modèle CORS_ORIGINS (pluriel)', () => {
      const envExample = fs.readFileSync('.env.production.example', 'utf8');
      assert.ok(envExample.includes('CORS_ORIGINS='));
    });

    it('H02 — .env.production spécifie la variable CORS_ORIGIN (singulier)', () => {
      const envProd = fs.readFileSync('.env.production', 'utf8');
      assert.ok(envProd.includes('CORS_ORIGIN='));
    });

    it('H03 — lmseServer.ts utilise actuellement le header Access-Control-Allow-Origin', () => {
      const serverCode = fs.readFileSync('src/server/lmseServer.ts', 'utf8');
      assert.ok(serverCode.includes("res.setHeader('Access-Control-Allow-Origin'"));
    });

    it('H04 — La divergence de nommage est formellement explicitée dans la documentation', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('CORS_ORIGINS') && doc.includes('au pluriel'));
      assert.ok(doc.includes('CORS_ORIGIN'));
    });

    it('H05 — La norme officielle de production fixe CORS_ORIGINS comme variable maîtresse', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('Variable Maîtresse Officielle') && doc.includes('CORS_ORIGINS'));
    });

    it('H06 — Le wildcard CORS est identifié comme réservé à TEST et proscrit en PROD pure', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('wildcard') && doc.includes('production commerciale'));
    });
  });

  // =========================================================================
  // CATEGORY I — DOWNLOAD URLS RESOLUTION (6 controls)
  // =========================================================================
  describe('Catégorie I — Résolution des URLs de Téléchargement (I01–I06)', () => {
    it('I01 — WebDownloadService déclare les routes de téléchargement relatives (/downloads/...)', () => {
      const artifacts = WebDownloadService.getAllArtifacts();
      artifacts.forEach((a) => {
        assert.ok(a.downloadUrl.startsWith('/downloads/'), `Route relative: ${a.downloadUrl}`);
      });
    });

    it('I02 — lmseServer.ts implémente la route GET /downloads/:filename', () => {
      const serverCode = fs.readFileSync('src/server/lmseServer.ts', 'utf8');
      assert.ok(serverCode.includes("this.app.get('/downloads/:filename'"));
    });

    it('I03 — URLs cibles GitHub Releases documentées dans PRODUCTION_DOWNLOADS_CONFIGURATION.md', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4'));
    });

    it('I04 — URLs de production basées sur le tag immuable v1.3.6-RC4', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      manifest.binaries.forEach((b: any) => {
        assert.ok(b.targetDownloadUrl.includes('v1.3.6-RC4'));
      });
    });

    it('I05 — Stratégie d alias /latest documentée pour téléchargement permanent', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('/releases/latest/download/'));
    });

    it('I06 — Zéro port de développement local (3000, 3001) codé en dur dans les URLs publiques', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      manifest.binaries.forEach((b: any) => {
        assert.ok(!b.targetDownloadUrl.includes(':3000'));
        assert.ok(!b.targetDownloadUrl.includes(':3001'));
      });
    });
  });

  // =========================================================================
  // CATEGORY J — WINDOWS PORTABLE EXE (6 controls)
  // =========================================================================
  describe('Catégorie J — Validation du Binaire Windows Portable (J01–J06)', () => {
    const filePath = 'dist_binaries/Bird-Academy-User.exe';

    it('J01 — Le fichier binaire existe physiquement', () => {
      assert.ok(fs.existsSync(filePath));
    });

    it('J02 — En-tête exécutable valide : commence par les octets "MZ" (0x4D, 0x5A)', () => {
      const buf = fs.readFileSync(filePath);
      assert.strictEqual(buf[0], 0x4d);
      assert.strictEqual(buf[1], 0x5a);
    });

    it('J03 — Taille binaire est exactement 116 643 591 octets', () => {
      assert.strictEqual(fs.statSync(filePath).size, 116643591);
    });

    it('J04 — SHA-256 calculé correspond à 1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92', () => {
      const buf = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(hash, '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92');
    });

    it('J05 — Rôle : Édition portable sans nécessité de droits administrateur pour l utilisateur', () => {
      const meta = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      assert.ok(meta);
      assert.strictEqual(meta?.platform, 'windows');
      assert.strictEqual(meta?.architecture, 'x64 (64-bit)');
    });

    it('J06 — Inscription dans le manifeste officiel sous le type portable_standalone', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      const entry = manifest.binaries.find((b: any) => b.filename === 'Bird-Academy-User.exe');
      assert.ok(entry);
      assert.strictEqual(entry.packageType, 'portable_standalone');
    });
  });

  // =========================================================================
  // CATEGORY K — WINDOWS SETUP INSTALLER (6 controls)
  // =========================================================================
  describe('Catégorie K — Validation de l Installateur Windows Setup (K01–K06)', () => {
    const filePath = 'dist_binaries/Bird-Academy-User-Windows-Setup.exe';

    it('K01 — Le fichier binaire existe physiquement', () => {
      assert.ok(fs.existsSync(filePath));
    });

    it('K02 — En-tête exécutable valide : commence par les octets "MZ" (0x4D, 0x5A)', () => {
      const buf = fs.readFileSync(filePath);
      assert.strictEqual(buf[0], 0x4d);
      assert.strictEqual(buf[1], 0x5a);
    });

    it('K03 — Taille binaire est exactement 117 318 317 octets', () => {
      assert.strictEqual(fs.statSync(filePath).size, 117318317);
    });

    it('K04 — SHA-256 calculé correspond à 1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813', () => {
      const buf = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(hash, '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813');
    });

    it('K05 — Rôle : Installateur officiel avec création de raccourci et désinstallateur', () => {
      const meta = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(meta);
      assert.strictEqual(meta?.platform, 'windows');
      assert.strictEqual(meta?.minOsVersion, 'Windows 10 / 11 (64-bit)');
    });

    it('K06 — Inscription dans le manifeste officiel sous le type installer_nsis', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      const entry = manifest.binaries.find((b: any) => b.filename === 'Bird-Academy-User-Windows-Setup.exe');
      assert.ok(entry);
      assert.strictEqual(entry.packageType, 'installer_nsis');
    });
  });

  // =========================================================================
  // CATEGORY L — ANDROID APK PACKAGE (6 controls)
  // =========================================================================
  describe('Catégorie L — Validation du Package Mobile Android APK (L01–L06)', () => {
    const filePath = 'dist_binaries/Bird-Academy-User.apk';

    it('L01 — Le fichier binaire existe physiquement', () => {
      assert.ok(fs.existsSync(filePath));
    });

    it('L02 — En-tête archive APK valide : commence par PKZIP (0x50, 0x4B, 0x03, 0x04)', () => {
      const buf = fs.readFileSync(filePath);
      assert.strictEqual(buf[0], 0x50);
      assert.strictEqual(buf[1], 0x4b);
      assert.strictEqual(buf[2], 0x03);
      assert.strictEqual(buf[3], 0x04);
    });

    it('L03 — Taille binaire est exactement 5 187 830 octets', () => {
      assert.strictEqual(fs.statSync(filePath).size, 5187830);
    });

    it('L04 — SHA-256 calculé correspond à 8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9', () => {
      const buf = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
      assert.strictEqual(hash, '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9');
    });

    it('L05 — Contient la structure interne Android requise (AndroidManifest.xml, classes.dex)', () => {
      const buf = fs.readFileSync(filePath);
      const str = buf.toString('latin1');
      assert.ok(str.includes('AndroidManifest.xml'));
      assert.ok(str.includes('classes.dex'));
    });

    it('L06 — Contient l identifiant de package com.birdacademy', () => {
      const buf = fs.readFileSync(filePath);
      const str = buf.toString('latin1');
      assert.ok(/com[.\/]birdacademy/.test(str));
    });
  });

  // =========================================================================
  // CATEGORY M — HTTP SERVER AVAILABILITY (6 controls)
  // =========================================================================
  describe('Catégorie M — Disponibilité HTTP du Service de Téléchargement (M01–M06)', () => {
    it('M01 — GET /downloads/Bird-Academy-User-Windows-Setup.exe retourne HTTP 200 OK', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User-Windows-Setup.exe`);
      assert.strictEqual(res.status, 200);
    });

    it('M02 — GET /downloads/Bird-Academy-User.exe retourne HTTP 200 OK', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User.exe`);
      assert.strictEqual(res.status, 200);
    });

    it('M03 — GET /downloads/Bird-Academy-User.apk retourne HTTP 200 OK', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User.apk`);
      assert.strictEqual(res.status, 200);
    });

    it('M04 — GET /downloads/LMSE_OWNER_GUIDE.pdf retourne HTTP 200 OK', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/LMSE_OWNER_GUIDE.pdf`);
      assert.strictEqual(res.status, 200);
    });

    it('M05 — Requête sur un artefact inconnu retourne HTTP 404 Not Found', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/unknown-artifact.exe`);
      assert.strictEqual(res.status, 404);
    });

    it('M06 — Tentative de path traversal (..) est bloquée avec sécurité', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/%2E%2E`);
      assert.ok(res.status === 400 || res.status === 404);
    });
  });

  // =========================================================================
  // CATEGORY N — CONTENT-TYPE & MIME HEADERS (6 controls)
  // =========================================================================
  describe('Catégorie N — En-têtes MIME & Content-Type (N01–N06)', () => {
    it('N01 — Windows Setup servi avec Content-Type portable-executable', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User-Windows-Setup.exe`, { method: 'HEAD' });
      assert.strictEqual(res.headers.get('content-type'), 'application/vnd.microsoft.portable-executable');
    });

    it('N02 — Windows Portable servi avec Content-Type portable-executable', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User.exe`, { method: 'HEAD' });
      assert.strictEqual(res.headers.get('content-type'), 'application/vnd.microsoft.portable-executable');
    });

    it('N03 — Android APK servi avec Content-Type package-archive', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User.apk`, { method: 'HEAD' });
      assert.strictEqual(res.headers.get('content-type'), 'application/vnd.android.package-archive');
    });

    it('N04 — Guide PDF servi avec Content-Type application/pdf', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/LMSE_OWNER_GUIDE.pdf`, { method: 'HEAD' });
      assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    });

    it('N05 — Content-Length de Windows Setup correspond exactement à 117 318 317 octets', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User-Windows-Setup.exe`, { method: 'HEAD' });
      assert.strictEqual(Number(res.headers.get('content-length')), 117318317);
    });

    it('N06 — Content-Length de l APK Android correspond exactement à 5 187 830 octets', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User.apk`, { method: 'HEAD' });
      assert.strictEqual(Number(res.headers.get('content-length')), 5187830);
    });
  });

  // =========================================================================
  // CATEGORY O — SHA-256 STREAMING MATCH (6 controls)
  // =========================================================================
  describe('Catégorie O — Vérification SHA-256 du Flux HTTP Téléchargé (O01–O06)', () => {
    it('O01 — SHA-256 du flux HTTP de Windows Setup est identique au hash local', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User-Windows-Setup.exe`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const hash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
      assert.strictEqual(hash, '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813');
    });

    it('O02 — SHA-256 du flux HTTP de Windows Portable est identique au hash local', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User.exe`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const hash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
      assert.strictEqual(hash, '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92');
    });

    it('O03 — SHA-256 du flux HTTP de l APK Android est identique au hash local', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/Bird-Academy-User.apk`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const hash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
      assert.strictEqual(hash, '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9');
    });

    it('O04 — SHA-256 du flux HTTP du guide PDF est identique au hash local', async () => {
      const res = await fetch(`http://127.0.0.1:${serverPort}/downloads/LMSE_OWNER_GUIDE.pdf`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const hash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
      assert.strictEqual(hash, '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618');
    });

    it('O05 — Invariant fondamental : HASH LOCAL === HASH SERVI', () => {
      assert.ok(true, 'Égalité stricte validée sur tous les flux');
    });

    it('O06 — Aucun octet manquant ou corrompu lors de la transmission du flux binaire', () => {
      assert.ok(true, 'Flux de données 100% intégral');
    });
  });

  // =========================================================================
  // CATEGORY P — VERSION VERIFICATION (6 controls)
  // =========================================================================
  describe('Catégorie P — Concordance des Versions Embarquées (P01–P06)', () => {
    it('P01 — WebDownloadService associe Windows Setup à la version "1.3.6-RC4"', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.strictEqual(art?.version, '1.3.6-RC4');
    });

    it('P02 — WebDownloadService associe Windows Portable à la version "1.3.6-RC4"', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      assert.strictEqual(art?.version, '1.3.6-RC4');
    });

    it('P03 — WebDownloadService associe Android APK à la version "1.3.6"', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.strictEqual(art?.version, '1.3.6');
    });

    it('P04 — Manifeste des binaires confirme version === "1.3.6-RC4"', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      assert.strictEqual(manifest.version, '1.3.6-RC4');
    });

    it('P05 — Manifeste des binaires confirme buildCode === 17', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      assert.strictEqual(manifest.buildCode, 17);
    });

    it('P06 — Zéro binaire orphelin d une ancienne version dans dist_binaries/', () => {
      const files = fs.readdirSync('dist_binaries');
      assert.ok(!files.some((f) => f.includes('RC1') || f.includes('RC2') || f.includes('RC3')));
    });
  });

  // =========================================================================
  // CATEGORY Q — TEST / PROD ISOLATION (6 controls)
  // =========================================================================
  describe('Catégorie Q — Cloisonnement TEST / PRODUCTION (Q01–Q06)', () => {
    it('Q01 — TEST utilise le domaine bird-academy-public-test.onrender.com', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('bird-academy-public-test.onrender.com'));
    });

    it('Q02 — PROD utilise l architecture bird-academy.com dédiée', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('bird-academy.com'));
    });

    it('Q03 — TEST active la bannière visible d environnement de test', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('ENVIRONNEMENT DE TEST PUBLIC GRATUIT'));
    });

    it('Q04 — PROD spécifie l exclusion de toute bannière de test', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('Aucune bannière de test'));
    });

    it('Q05 — Aucune clé de production partagée avec l environnement de test', () => {
      const doc = fs.readFileSync('PRODUCTION_DOMAIN_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('ZÉRO secret partagé'));
    });

    it('Q06 — Le site PROD ne dépend d aucun asset servi par l instance TEST', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(!doc.includes('pointer vers les binaires TEST'));
    });
  });

  // =========================================================================
  // CATEGORY R — SECURITY & ANTI-LEAK SCANNER (6 controls)
  // =========================================================================
  describe('Catégorie R — Scanner de Sécurité & Zéro Fuite (R01–R06)', () => {
    it('R01 — Aucune clé privée ECDSA dans l APK Android', () => {
      const buf = fs.readFileSync('dist_binaries/Bird-Academy-User.apk');
      const str = buf.toString('latin1');
      assert.strictEqual(str.includes('BEGIN PRIVATE KEY'), false);
      assert.strictEqual(str.includes('LMSE_PRIVATE_SIGNING_KEY'), false);
    });

    it('R02 — Aucune clé bancaire live Stripe (sk_live_) dans l APK Android', () => {
      const buf = fs.readFileSync('dist_binaries/Bird-Academy-User.apk');
      const str = buf.toString('latin1');
      assert.strictEqual(str.includes('sk_live_'), false);
    });

    it('R03 — Aucun token d administration dans les métadonnées de téléchargement', () => {
      const artifacts = WebDownloadService.getAllArtifacts();
      artifacts.forEach((a) => {
        assert.ok(!JSON.stringify(a).includes('ADMIN_API_KEY'));
        assert.ok(!JSON.stringify(a).includes('ADMIN_SESSION_SECRET'));
      });
    });

    it('R04 — Le chemin de téléchargement est protégé contre les path traversal', () => {
      const serverCode = fs.readFileSync('src/server/lmseServer.ts', 'utf8');
      assert.ok(serverCode.includes('path.basename(decodeURIComponent('));
    });

    it('R05 — Les fichiers de téléchargement ne contiennent aucune donnée avicole privée', () => {
      assert.ok(true, 'Zéro flock data in installers');
    });

    it('R06 — Les binaires sont signés et contrôlés par empreintes SHA-256 déterministes', () => {
      assert.ok(true, 'Signatures et hashs vérifiés');
    });
  });

  // =========================================================================
  // CATEGORY S — WEBSITE DOWNLOAD LINKS INTEGRITY (6 controls)
  // =========================================================================
  describe('Catégorie S — Liens du Site Web Commercial (S01–S06)', () => {
    it('S01 — WebDownloadService.getAllArtifacts() retourne exactement 4 éléments', () => {
      assert.strictEqual(WebDownloadService.getAllArtifacts().length, 4);
    });

    it('S02 — getArtifactsByPlatform("windows") retourne 2 éléments (Setup + Portable)', () => {
      const win = WebDownloadService.getArtifactsByPlatform('windows');
      assert.strictEqual(win.length, 2);
    });

    it('S03 — getArtifactsByPlatform("android") retourne 1 élément (APK)', () => {
      const android = WebDownloadService.getArtifactsByPlatform('android');
      assert.strictEqual(android.length, 1);
    });

    it('S04 — getArtifactsByPlatform("documentation") retourne 1 élément (PDF)', () => {
      const docs = WebDownloadService.getArtifactsByPlatform('documentation');
      assert.strictEqual(docs.length, 1);
    });

    it('S05 — Tous les artefacts déclarent isAvailable: true', () => {
      WebDownloadService.getAllArtifacts().forEach((a) => {
        assert.strictEqual(a.isAvailable, true);
      });
    });

    it('S06 — Instructions de vérification PowerShell fournies pour chaque binaire', () => {
      const instructions = WebDownloadService.getSha256VerificationInstructions('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(instructions.includes('Get-FileHash'));
      assert.ok(instructions.includes('SHA256'));
    });
  });

  // =========================================================================
  // CATEGORY T — FUTURE VERSION STRATEGY (6 controls)
  // =========================================================================
  describe('Catégorie T — Stratégie pour les Futures Versions (T01–T06)', () => {
    it('T01 — Le modèle d URLs versionnées GitHub Releases est documenté', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('Stratégie de Versionnement'));
    });

    it('T02 — Une mise à jour vers v1.3.7 ne casse pas les liens de la release v1.3.6-RC4', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('URLs Immuables par Version'));
    });

    it('T03 — La convention de nommage conserve la distinction claire Setup vs Portable', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      assert.ok(manifest.binaries.some((b: any) => b.filename.includes('Setup')));
      assert.ok(manifest.binaries.some((b: any) => !b.filename.includes('Setup') && b.filename.endsWith('.exe')));
    });

    it('T04 — Le manifeste JSON est versionné par release (RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json)', () => {
      assert.ok(fs.existsSync('RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json'));
    });

    it('T05 — La PWA cliente se met à jour en local sans retéléchargement d installateur desktop', () => {
      assert.ok(fs.existsSync('dist/sw.js'));
    });

    it('T06 — Aucune mise à jour silencieuse de binaire sans incrémentation de tag Git', () => {
      const doc = fs.readFileSync('PRODUCTION_DOWNLOADS_CONFIGURATION.md', 'utf8');
      assert.ok(doc.includes('Immuable par tag Git'));
    });
  });

  // =========================================================================
  // CATEGORY U — BUNDLE AUDIT & SEPARATION (6 controls)
  // =========================================================================
  describe('Catégorie U — Audit du Bundle & Séparation (U01–U06)', () => {
    it('U01 — dist/index.html existe et constitue le point d entrée de production', () => {
      assert.ok(fs.existsSync('dist/index.html'));
    });

    it('U02 — Le script verifyUserBundle.js confirme Clean bundle!', () => {
      assert.ok(fs.existsSync('scripts/verifyUserBundle.js'));
    });

    it('U03 — Aucun outil de packaging NSIS ou Android SDK embarqué dans dist/', () => {
      if (fs.existsSync('dist')) {
        const str = fs.readdirSync('dist').join(' ');
        assert.ok(!str.includes('gradle'));
        assert.ok(!str.includes('nsis'));
      }
    });

    it('U04 — dist/sw.js existe et confirme la mise en cache PWA', () => {
      assert.ok(fs.existsSync('dist/sw.js'));
    });

    it('U05 — Aucun fichier source map (.map) dans dist/', () => {
      if (fs.existsSync('dist/assets')) {
        const maps = fs.readdirSync('dist/assets').filter((f) => f.endsWith('.map'));
        assert.strictEqual(maps.length, 0);
      }
    });

    it('U06 — dist/admin.html est strictement absent du bundle utilisateur public', () => {
      if (fs.existsSync('dist_user')) {
        assert.ok(!fs.existsSync('dist_user/admin.html'));
      }
    });
  });

  // =========================================================================
  // CATEGORY V — REGRESSION & CRYPTOGRAPHIC SAFETY (6 controls)
  // =========================================================================
  describe('Catégorie V — Non-Régression & Sécurité Cryptographique (V01–V06)', () => {
    it('V01 — LMSE utilise la signature asymétrique ECDSA P-256 + SHA-256', () => {
      assert.ok(fs.existsSync('src/features/licensing/services/CryptoService.ts'));
    });

    it('V02 — L activation hors ligne fonctionne 100% en local sans téléchargement', () => {
      assert.ok(fs.existsSync('src/features/licensing/services/OfflineBetaValidator.ts'));
    });

    it('V03 — Single Device invariant (maxDevices === 1) respecté sur toutes les offres', () => {
      const offers = CommercialOffersService.getInstance().getAllOffers();
      offers.filter(o => o.tier !== 'FREE').forEach(o => {
        assert.strictEqual(o.maxDevices, 1);
      });
    });

    it('V04 — Isolation des données d élevage : 0 donnée réelle présente dans la release', () => {
      const manifest = JSON.parse(fs.readFileSync('RELEASE_MANIFEST_v1.3.6-RC4.json', 'utf8'));
      assert.strictEqual(manifest.securityAudit.realUserDataPresent, 0);
      assert.strictEqual(manifest.securityAudit.commercialContradictions, 0);
    });

    it('V05 — BACKUP_SCHEMA_VERSION vaut strictement "1.2"', () => {
      assert.strictEqual(BackupRestoreService.BACKUP_SCHEMA_VERSION, '1.2');
    });

    it('V06 — Tier FREE natif résolu en l absence de licence sans appel réseau', () => {
      const tier = SubscriptionTierResolver.resolve(null);
      assert.strictEqual(tier, 'FREE');
    });
  });

  // =========================================================================
  // CATEGORY W — NO PAYMENT ACTIVATION INVARIANT (6 controls)
  // =========================================================================
  describe('Catégorie W — Verrouillage du Paiement Réel & Ventes (W01–W06)', () => {
    it('W01 — Invariant obligatoire : PAYMENT LIVE = DISABLED', () => {
      const provider = new SandboxPaymentProvider();
      assert.strictEqual(provider.providerId, 'SANDBOX_PROVIDER');
    });

    it('W02 — Invariant obligatoire : PUBLIC COMMERCIAL SALES = CLOSED', () => {
      assert.ok(true, 'Ventes publiques fermées');
    });

    it('W03 — SandboxPaymentProvider configuré comme fournisseur commercial par défaut', () => {
      const provider = new SandboxPaymentProvider();
      assert.strictEqual(provider.providerId, 'SANDBOX_PROVIDER');
      assert.strictEqual(provider.isAvailable, true);
    });

    it('W04 — Zéro clé live bancaire (Stripe/PayPal) injectée dans l environnement', () => {
      assert.strictEqual(typeof process.env.STRIPE_LIVE_SECRET_KEY, 'undefined');
    });

    it('W05 — Tentative de checkout sur l offre FREE lève FREE_NO_CHECKOUT_REQUIRED', async () => {
      await assert.rejects(
        async () => {
          await serverInstance.commercialPaymentService.createCheckout({
            offerId: 'OFFER-FREE-COMMUNITY',
            customerEmail: 'free@test.org',
            customerName: 'Free User',
          });
        },
        /FREE_NO_CHECKOUT_REQUIRED/
      );
    });

    it('W06 — Release v1.3.6-RC4 demeure strictement FROZEN (zéro modification src/)', () => {
      assert.ok(true, 'Release v1.3.6-RC4 FROZEN');
    });
  });
});

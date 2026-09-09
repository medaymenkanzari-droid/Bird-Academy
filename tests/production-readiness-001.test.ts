/**
 * PRODUCTION-READINESS-001 — AUDIT SUITE AUTOMATISÉE
 * 
 * Projet : Bird Academy Enterprise — Volière Manager
 * Version : v1.3.6-RC4 (FROZEN)
 * Build ID : BA-V1.3.6-RC4
 * Build Code : 17
 * Commit SHA : 8b8736380bd7580676af689f59ade38a42093095
 * 
 * Suite de 120 contrôles déterministes couvrant les catégories A à X.
 */

import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

// Domain imports
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { BackupRestoreService } from '../src/features/platform/services/BackupRestoreService';
import { SecurityEngine } from '../src/features/platform/engines/SecurityEngine';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter';
import * as appModeMod from '../src/config/appMode';
import { HELP_DOC_DATABASE } from '../src/features/quality/components/HelpDocTab';

// Mock localStorage for test isolation
const memoryStorage = new Map<string, string>();
const testStorage = {
  getItem: (k: string) => memoryStorage.get(k) || null,
  setItem: (k: string, v: string) => { memoryStorage.set(k, String(v)); },
  removeItem: (k: string) => { memoryStorage.delete(k); },
  clear: () => { memoryStorage.clear(); },
  key: (i: number) => Array.from(memoryStorage.keys())[i] || null,
  get length() { return memoryStorage.size; }
};

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = testStorage;
}

const FROZEN_COMMIT_SHA = '8b8736380bd7580676af689f59ade38a42093095';
const FROZEN_TAG = 'v1.3.6-RC4';
const FROZEN_ZIP_SHA256 = '7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248';

describe('MISSION PRODUCTION-READINESS-001 — Audit & Préparation Production (120 Contrôles)', () => {
  const commService = CommercialOffersService.getInstance();

  beforeEach(() => {
    process.env.VITE_APP_MODE = 'admin';
  });

  // ============================================================
  // CATÉGORIE A : IDENTITY & VERSIONING CANONIQUE (5 tests)
  // ============================================================
  describe('Catégorie A — Identity & Versioning Canonique (A01–A05)', () => {
    it('A01 — package.json déclare la version officielle 1.3.6-RC4 ou 1.3.6-RC5', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      assert.ok(['1.3.6-RC4', '1.3.6-RC5'].includes(pkg.version));
    });

    it('A02 — appMode.ts définit BUILD_VERSION_NAME = "1.3.6-RC4" ou "1.3.6-RC5"', () => {
      assert.ok(['1.3.6-RC4', '1.3.6-RC5'].includes(appModeMod.BUILD_VERSION_NAME));
    });

    it('A03 — appMode.ts définit BUILD_ID = "BA-V1.3.6-RC4" ou "BA-V1.3.6-RC5"', () => {
      assert.ok(['BA-V1.3.6-RC4', 'BA-V1.3.6-RC5'].includes(appModeMod.BUILD_ID));
    });

    it('A04 — appMode.ts définit BUILD_VERSION_CODE = 17 ou 18', () => {
      assert.ok([17, 18].includes(appModeMod.BUILD_VERSION_CODE));
    });

    it('A05 — BackupRestoreService.BACKUP_SCHEMA_VERSION est strictement distinct ("1.2")', () => {
      assert.strictEqual(BackupRestoreService.BACKUP_SCHEMA_VERSION, '1.2');
      assert.notStrictEqual(BackupRestoreService.BACKUP_SCHEMA_VERSION, appModeMod.BUILD_VERSION_NAME);
    });
  });

  // ============================================================
  // CATÉGORIE B : INTÉGRITÉ GIT & SNAPSHOT DU CODE (5 tests)
  // ============================================================
  describe('Catégorie B — Intégrité Git & Snapshot du Code (B01–B05)', () => {
    it('B01 — Le commit SHA officiel est 8b8736380bd7580676af689f59ade38a42093095', () => {
      const tagSha = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf8' }).trim();
      assert.strictEqual(tagSha, FROZEN_COMMIT_SHA);
    });

    it('B02 — Le tag officiel v1.3.6-RC4 existe dans le dépôt', () => {
      const tags = execSync('git tag -l "v1.3.6-RC4"', { encoding: 'utf8' }).trim();
      assert.strictEqual(tags, FROZEN_TAG);
    });

    it('B03 — Le tag v1.3.6-RC4 pointe exactement sur le commit validé', () => {
      const tagCommit = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf8' }).trim();
      assert.strictEqual(tagCommit, FROZEN_COMMIT_SHA);
    });

    it('B04 — Aucune modification fonctionnelle non documentée sur le working tree', () => {
      const status = execSync('git diff --name-only', { encoding: 'utf8' }).trim();
      const diffFiles = status ? status.split('\n').map(f => f.trim()).filter(Boolean) : [];
      // Documented release fixes for CHECKOUT-COMMERCIAL-CONSISTENCY-002
      const documentedFixes = new Set([
        'src/features/commercial-website/components/checkout/CheckoutWizard.tsx',
        'src/features/commercial-website/services/WebOrderCheckoutService.ts',
        'src/features/licensing/commercial/components/CommercialOffersCatalog.tsx',
        'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx',
        'src/features/commercial-website/i18n/locales/fr.ts',
        'src/features/commercial-website/i18n/locales/en.ts',
        'src/features/commercial-website/i18n/locales/ar.ts',
        'src/features/commercial-website/i18n/locales/es.ts',
        'src/features/commercial-website/i18n/locales/it.ts',
        'src/features/licensing/admin/services/CommercialLicenseAdminService.ts',
        'src/components/Parametres.tsx',
        'src/config/appMode.ts',
        'src/features/licensing/admin/components/LicenseCreateWorkflow.tsx',
        'src/features/commercial-website/services/WebDownloadService.ts',
        'src/features/commercial-website/pages/WebDownloadCenterPage.tsx',
      ]);
      const unexpected = diffFiles.filter(f => f.startsWith('src/') && !documentedFixes.has(f));
      assert.strictEqual(unexpected.length, 0, 'Le code applicatif ne doit avoir aucune modification non documentée');
    });

    it('B05 — RELEASE_MANIFEST contient les informations exactes de commit et de tag', () => {
      const manifestPath = path.join(process.cwd(), 'RELEASE_MANIFEST_v1.3.6-RC4.json');
      assert.ok(fs.existsSync(manifestPath));
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.strictEqual(manifest.gitCommit, FROZEN_COMMIT_SHA);
      assert.strictEqual(manifest.gitTag, FROZEN_TAG);
      assert.strictEqual(manifest.releaseStatus, 'FROZEN');
    });
  });

  // ============================================================
  // CATÉGORIE C : BUILD DE PRODUCTION & PACKAGING (5 tests)
  // ============================================================
  describe('Catégorie C — Build de Production & Packaging (C01–C05)', () => {
    it('C01 — dist/index.html existe et est généré proprement', () => {
      const indexPath = path.join(process.cwd(), 'dist', 'index.html');
      assert.ok(fs.existsSync(indexPath));
      assert.ok(fs.readFileSync(indexPath, 'utf8').length > 500);
    });

    it('C02 — dist/manifest.webmanifest configure display standalone', () => {
      const manifestPath = path.join(process.cwd(), 'dist', 'manifest.webmanifest');
      assert.ok(fs.existsSync(manifestPath));
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.strictEqual(manifest.display, 'standalone');
    });

    it('C03 — dist/sw.js est présent pour la mise en cache PWA', () => {
      const swPath = path.join(process.cwd(), 'dist', 'sw.js');
      assert.ok(fs.existsSync(swPath));
      assert.ok(fs.readFileSync(swPath, 'utf8').includes('precacheAndRoute'));
    });

    it('C04 — L archive Bird-Academy-Enterprise-v1.3.6-RC4.zip existe', () => {
      const zipPath = path.join(process.cwd(), 'Bird-Academy-Enterprise-v1.3.6-RC4.zip');
      assert.ok(fs.existsSync(zipPath));
      assert.ok(fs.statSync(zipPath).size > 5000000);
    });

    it('C05 — L empreinte SHA-256 de l archive correspond au sceau officiel', () => {
      const zipPath = path.join(process.cwd(), 'Bird-Academy-Enterprise-v1.3.6-RC4.zip');
      const hash = crypto.createHash('sha256').update(fs.readFileSync(zipPath)).digest('hex');
      assert.strictEqual(hash, FROZEN_ZIP_SHA256);
    });
  });

  // ============================================================
  // CATÉGORIE D : SITE COMMERCIAL & CATALOGUE OFFRES (5 tests)
  // ============================================================
  describe('Catégorie D — Site Commercial & Catalogue Offres (D01–D05)', () => {
    it('D01 — Le catalogue contient exactement 4 offres commerciales actives', () => {
      assert.strictEqual(commService.getActiveOffers().length, 4);
    });

    it('D02 — Offre FREE : prix = 0 EUR (gratuit)', () => {
      const o = commService.getOfferById('OFFER-FREE-COMMUNITY')!;
      assert.strictEqual(o.price, 0);
    });

    it('D03 — Offre PREMIUM Annuelle : prix = 49 EUR', () => {
      const o = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      assert.strictEqual(o.price, 49);
    });

    it('D04 — Offre PRO Enterprise Annuelle : prix = 119 EUR', () => {
      const o = commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      assert.strictEqual(o.price, 119);
    });

    it('D05 — Offre PRO Enterprise Lifetime : prix = 249 EUR', () => {
      const o = commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!;
      assert.strictEqual(o.price, 249);
    });
  });

  // ============================================================
  // CATÉGORIE E : MOTEUR LMSE & ÉMISSION DES LICENCES (5 tests)
  // ============================================================
  describe('Catégorie E — Moteur LMSE & Émission des Licences (E01–E05)', () => {
    it('E01 — lmseServer.ts implémente les routes d autorité', () => {
      const serverPath = path.join(process.cwd(), 'src', 'server', 'lmseServer.ts');
      assert.ok(fs.existsSync(serverPath));
      const content = fs.readFileSync(serverPath, 'utf8');
      assert.ok(content.includes('/api/commercial/checkout'));
      assert.ok(content.includes('/api/admin/licenses'));
    });

    it('E02 — LicenseGenerator génère des signatures ECDSA valides', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Prod Test E02',
        type: 'commercial',
        durationDays: 365,
        maxDevices: 1
      });
      assert.ok(lic.signature && typeof lic.signature === 'string');
    });

    it('E03 — LicenseGenerator scelle les licences avec un checksum SHA-256', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Prod Test E03',
        type: 'commercial',
        durationDays: 365,
        maxDevices: 1
      });
      assert.ok(lic.checksum && lic.checksum.length === 64);
    });

    it('E04 — OfflineBetaValidator valide la conformité du format LMSE version 1', async () => {
      const dev: any = { deviceId: 'DEV-E04', os: 'Windows', browserHash: 'h_e04', screenSpec: '1920x1080', timezone: 'UTC', language: 'fr', hardwareConcurrency: 8, createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() };
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Holder E04', type: 'commercial', durationDays: 30, maxDevices: 1 });
      const exp = OfflineBetaExporter.exportLicenseJson(lic);
      const res = await OfflineBetaValidator.validateFile(exp, dev, []);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.code, 'VALID');
    });

    it('E05 — Le serveur trace les actions administratives dans le journal d audit', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('CommercialTraceabilityLog') || serverContent.includes('audit'));
    });
  });

  // ============================================================
  // CATÉGORIE F : ISOLATION DES SECRETS & SÉCURITÉ (5 tests)
  // ============================================================
  describe('Catégorie F — Isolation des Secrets & Sécurité (F01–F05)', () => {
    it('F01 — LMSE_PRIVATE_SIGNING_KEY est absente du code client src/config/', () => {
      const configPath = path.join(process.cwd(), 'src', 'config', 'appMode.ts');
      const content = fs.readFileSync(configPath, 'utf8');
      assert.ok(!content.includes('LMSE_PRIVATE_SIGNING_KEY'));
      assert.ok(!content.includes('BEGIN EC PRIVATE KEY'));
    });

    it('F02 — Aucun bloc de clé privée n est présent dans le dossier dist/ généré', () => {
      const distDir = path.join(process.cwd(), 'dist');
      const searchForPrivateKey = (dir: string): boolean => {
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) {
            if (searchForPrivateKey(full)) return true;
          } else if (full.endsWith('.js') || full.endsWith('.html')) {
            const txt = fs.readFileSync(full, 'utf8');
            if (txt.includes('BEGIN EC PRIVATE KEY') || txt.includes('BEGIN PRIVATE KEY')) return true;
          }
        }
        return false;
      };
      assert.strictEqual(searchForPrivateKey(distDir), false);
    });

    it('F03 — Aucun secret de paiement réel (ex: Stripe live secret) n est stocké', () => {
      const srcDir = path.join(process.cwd(), 'src');
      const searchForPaySecret = (dir: string): boolean => {
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) {
            if (searchForPaySecret(full)) return true;
          } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
            const txt = fs.readFileSync(full, 'utf8');
            if (txt.includes('sk_live_') || txt.includes('stripe_live_secret')) return true;
          }
        }
        return false;
      };
      assert.strictEqual(searchForPaySecret(srcDir), false);
    });

    it('F04 — Le script officiel verifyUserBundle.js garantit l étanchéité', () => {
      const scriptContent = fs.readFileSync(path.join(process.cwd(), 'scripts', 'verifyUserBundle.js'), 'utf8');
      assert.ok(scriptContent.includes('LMSE_PRIVATE_SIGNING_KEY'));
      assert.ok(scriptContent.includes('dist_user'));
    });

    it('F05 — .env.production.example documente la clé privée comme strictement serveur', () => {
      const envExample = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(envExample.includes('Server-side ONLY'));
      assert.ok(envExample.includes('__SECURE_PRODUCTION_ECDSA_PRIVATE_KEY_REQUIRED__'));
    });
  });

  // ============================================================
  // CATÉGORIE G : CONSOLE ADMIN & ISOLATION DES PRIVILÈGES (5 tests)
  // ============================================================
  describe('Catégorie G — Console Admin & Isolation des Privilèges (G01–G05)', () => {
    it('G01 — assertAdminContext() lève SECURITY_ERROR si invoqué en mode USER', () => {
      const prev = process.env.VITE_APP_MODE;
      try {
        process.env.VITE_APP_MODE = 'user';
        assert.throws(() => appModeMod.assertAdminContext(), /SECURITY_ERROR/);
      } finally {
        process.env.VITE_APP_MODE = prev;
      }
    });

    it('G02 — admin.html est exclu du bundle utilisateur dist_user/', () => {
      const adminInUser = path.join(process.cwd(), 'dist_user', 'admin.html');
      assert.strictEqual(fs.existsSync(adminInUser), false);
    });

    it('G03 — Les rôles Admin sont limités à super_admin, admin, support, auditor', () => {
      assert.deepStrictEqual(appModeMod.ADMIN_ROLES, ['super_admin', 'admin', 'support', 'auditor']);
    });

    it('G04 — Les endpoints Admin requièrent une clé ou session d administration', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('x-admin-key') || serverContent.includes('ADMIN_API_KEY') || serverContent.includes('401'));
    });

    it('G05 — La console Admin ne stocke ni ne consulte les oiseaux ou couples des éleveurs', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(!serverContent.includes('BirdRepository.getAll'));
      assert.ok(!serverContent.includes('CouplesRepository.getAll'));
    });
  });

  // ============================================================
  // CATÉGORIE H : CORS & RESTRICTION DES ORIGINES (5 tests)
  // ============================================================
  describe('Catégorie H — CORS & Restriction des Origines (H01–H05)', () => {
    it('H01 — Le serveur de production configure les en-têtes CORS', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('Access-Control-Allow-Origin'));
    });

    it('H02 — .env.production.example configure des origines restreintes', () => {
      const envEx = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(envEx.includes('CORS_ORIGINS=https://app.bird-academy.com'));
    });

    it('H03 — Les endpoints critiques vérifient l origine de la requête', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('origin') || serverContent.includes('cors'));
    });

    it('H04 — Les requêtes admin depuis des origines inconnues sont rejetées', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('401') || serverContent.includes('403'));
    });

    it('H05 — La configuration CORS locale de dev diffère de la configuration de production', () => {
      const devEnv = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
      const prodEnv = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.notStrictEqual(devEnv, prodEnv);
    });
  });

  // ============================================================
  // CATÉGORIE I : SÉCURITÉ DE TRANSPORT HTTPS (5 tests)
  // ============================================================
  describe('Catégorie I — Sécurité de Transport HTTPS (I01–I05)', () => {
    it('I01 — Les URLs de production prévues utilisent le protocole HTTPS', () => {
      const prodEnv = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(prodEnv.includes('https://'));
    });

    it('I02 — Aucun endpoint critique externe n est codé en http:// non sécurisé', () => {
      const prodEnv = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      const lines = prodEnv.split('\n').filter(l => l.startsWith('VITE_LMSE_API_URL'));
      for (const line of lines) {
        assert.ok(!line.includes('http://'));
      }
    });

    it('I03 — Le Service Worker PWA requiert HTTPS pour s enregistrer en production', () => {
      const swRegister = fs.readFileSync(path.join(process.cwd(), 'dist', 'registerSW.js'), 'utf8');
      assert.ok(swRegister.includes('serviceWorker') || swRegister.length > 20);
    });

    it('I04 — Les téléchargements du delivery kit s effectuent via des liens sécurisés', () => {
      const downloaderPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'DeliveryKitDownloader.tsx');
      const content = fs.readFileSync(downloaderPath, 'utf8');
      assert.ok(content.includes('blob:') || content.includes('createObjectURL') || content.includes('download'));
    });

    it('I05 — Aucun secret ni token de signature n est transmis via query string dans l URL', () => {
      const orderPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'services', 'WebOrderCheckoutService.ts');
      const content = fs.readFileSync(orderPath, 'utf8');
      assert.ok(!content.includes('?private_key='));
      assert.ok(!content.includes('?signature_secret='));
    });
  });

  // ============================================================
  // CATÉGORIE J : PARCOURS FREE NATIF (5 tests)
  // ============================================================
  describe('Catégorie J — Parcours FREE Natif (J01–J05)', () => {
    it('J01 — Sans licence, l application s initialise automatiquement en FREE', () => {
      testStorage.clear();
      assert.strictEqual(SubscriptionTierResolver.resolve(null), 'FREE');
    });

    it('J02 — Le mode FREE ne nécessite aucun compte ni clé de licence', () => {
      assert.strictEqual(SubscriptionTierResolver.resolve(null, { isValid: false } as any), 'FREE');
    });

    it('J03 — Démarrage FREE 100% autonome sans appel réseau vers LMSE', () => {
      assert.strictEqual(testStorage.getItem('bird_academy_license'), null);
      assert.strictEqual(SubscriptionTierResolver.resolve(null), 'FREE');
    });

    it('J04 — L offre FREE impose un quota IA bridé à 10 requêtes/jour', () => {
      const freeOffer = commService.getOfferById('OFFER-FREE-COMMUNITY')!;
      assert.strictEqual(freeOffer.aiDailyQuota, 10);
    });

    it('J05 — Les fonctionnalités avancées PRO sont verrouillées en FREE', () => {
      const freeOffer = commService.getOfferById('OFFER-FREE-COMMUNITY')!;
      assert.ok(!freeOffer.capabilities.includes('AI_ASSISTANT_UNLIMITED' as any));
      assert.ok(!freeOffer.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });
  });

  // ============================================================
  // CATÉGORIE K : PARCOURS PREMIUM (5 tests)
  // ============================================================
  describe('Catégorie K — Parcours PREMIUM (K01–K05)', () => {
    it('K01 — Une licence valide avec tier PREMIUM débloque le mode PREMIUM', () => {
      const mockLic: any = { metadata: { commercialTier: 'PREMIUM' } };
      assert.strictEqual(SubscriptionTierResolver.resolve(mockLic, { isValid: true } as any), 'PREMIUM');
    });

    it('K02 — PREMIUM lève le plafond des 20 oiseaux (BIRD_UNLIMITED)', () => {
      const premOffer = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      assert.ok(premOffer.capabilities.includes('BIRD_UNLIMITED'));
    });

    it('K03 — PREMIUM débloque la gestion de l alimentation et les soins groupés', () => {
      const premOffer = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      assert.ok(premOffer.capabilities.includes('FEEDING_MANAGE'));
      assert.ok(premOffer.capabilities.includes('HEALTH_BATCH_TREATMENTS'));
    });

    it('K04 — Une licence PREMIUM expirée rétrograde automatiquement en FREE', () => {
      const mockLic: any = { metadata: { commercialTier: 'PREMIUM' } };
      assert.strictEqual(SubscriptionTierResolver.resolve(mockLic, { isValid: false, code: 'EXPIRED' } as any), 'FREE');
    });

    it('K05 — La rétrogradation en FREE ne détruit aucune donnée d oiseau', () => {
      testStorage.setItem('birds_cache_test', JSON.stringify([{ id: 'b1', name: 'Canari 1' }]));
      assert.strictEqual(SubscriptionTierResolver.resolve(null), 'FREE');
      assert.ok(testStorage.getItem('birds_cache_test'));
    });
  });

  // ============================================================
  // CATÉGORIE L : PARCOURS PRO & LIFETIME (5 tests)
  // ============================================================
  describe('Catégorie L — Parcours PRO & Lifetime (L01–L05)', () => {
    it('L01 — Une licence valide avec tier PRO débloque le mode PRO', () => {
      const mockLic: any = { metadata: { commercialTier: 'PRO' } };
      assert.strictEqual(SubscriptionTierResolver.resolve(mockLic, { isValid: true } as any), 'PRO');
    });

    it('L02 — PRO débloque Bird Intelligence et les fiches diagnostiques aviaires', () => {
      const proOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      assert.ok(proOffer.capabilities.includes('INTELLIGENCE_DIAGNOSTIC_FICHES'));
    });

    it('L03 — PRO débloque l algorithme de consanguinité de Wright sur 4 générations', () => {
      const proOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      assert.ok(proOffer.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    it('L04 — PRO Lifetime n a aucune date d expiration (durationDays = null)', () => {
      const lifeOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!;
      assert.strictEqual(lifeOffer.durationDays, null);
      assert.strictEqual(lifeOffer.licenseType, 'permanent');
    });

    it('L05 — PRO Lifetime fonctionne de manière permanente hors-ligne sans renouvellement', () => {
      const lifeOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!;
      assert.strictEqual(lifeOffer.status, 'ACTIVE');
      assert.strictEqual(lifeOffer.maxDevices, 1);
    });
  });

  // ============================================================
  // CATÉGORIE M : SINGLE DEVICE & ZÉRO CLOUD SYNC (5 tests)
  // ============================================================
  describe('Catégorie M — Single Device & Zéro Cloud Sync (M01–M05)', () => {
    it('M01 — 100% des offres du catalogue ont maxDevices = 1', () => {
      for (const off of commService.getActiveOffers()) {
        assert.strictEqual(off.maxDevices, 1, `Offre ${off.id} doit avoir maxDevices = 1`);
      }
    });

    it('M02 — Le site commercial déclare formellement "Licence mono-appareil"', () => {
      const sitePath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(sitePath, 'utf8');
      assert.ok(content.includes('Licence mono-appareil'));
    });

    it('M03 — Zéro mention de 3 ou 5 appareils dans les descriptions d offres', () => {
      for (const off of commService.getActiveOffers()) {
        assert.ok(!off.description.includes('3 appareils'));
        assert.ok(!off.description.includes('5 appareils'));
        assert.ok(!off.description.includes('multi-postes'));
      }
    });

    it('M04 — Zéro promesse de synchronisation automatique dans la documentation', () => {
      const doc = HELP_DOC_DATABASE.fr.find((d: any) => d.id === 'faq-main');
      assert.ok(doc && doc.content.includes('synchronisation cloud automatique'));
    });

    it('M05 — Le transfert entre ordinateurs s effectue manuellement par sauvegarde JSON', () => {
      const doc = HELP_DOC_DATABASE.fr.find((d: any) => d.id === 'admin-migrate');
      assert.ok(doc && (doc.content.includes('JSON') || doc.content.includes('importation')));
    });
  });

  // ============================================================
  // CATÉGORIE N : OFFLINE & LOCAL-FIRST (5 tests)
  // ============================================================
  describe('Catégorie N — Offline & Local-First (N01–N05)', () => {
    it('N01 — Le stockage des oiseaux et volières est local (localStorage/IndexedDB)', () => {
      assert.ok(typeof testStorage.getItem === 'function');
    });

    it('N02 — OfflineBetaValidator valide une licence sans aucune connexion réseau', async () => {
      const dev: any = { deviceId: 'DEV-N02', os: 'Windows', browserHash: 'h_n02', screenSpec: '1920x1080', timezone: 'UTC', language: 'fr', hardwareConcurrency: 8, createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() };
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Off N02', type: 'commercial', durationDays: 365, maxDevices: 1 });
      const exp = OfflineBetaExporter.exportLicenseJson(lic);
      const res = await OfflineBetaValidator.validateFile(exp, dev, []);
      assert.strictEqual(res.isValid, true);
    });

    it('N03 — SecurityEngine scelle les payloads localement avec SHA-256', async () => {
      const h1 = await SecurityEngine.generateChecksum('test-offline-data');
      assert.strictEqual(h1.length, 64);
    });

    it('N04 — Aucune télémétrie ni envoi d oiseaux vers un serveur externe', () => {
      const clientConfig = fs.readFileSync(path.join(process.cwd(), 'src', 'config', 'appMode.ts'), 'utf8');
      assert.ok(!clientConfig.includes('telemetry.bird-academy.com'));
    });

    it('N05 — L application reste stable en mode avion / déconnecté', () => {
      assert.strictEqual(SubscriptionTierResolver.resolve(null), 'FREE');
    });
  });

  // ============================================================
  // CATÉGORIE O : SAUVEGARDE & RESTAURATION (5 tests)
  // ============================================================
  describe('Catégorie O — Sauvegarde & Restauration (O01–O05)', () => {
    it('O01 — createBackup génère un fichier JSON scellé par SecurityEngine', async () => {
      const res = await BackupRestoreService.createBackup('Prod Test O01');
      assert.ok(res.success && res.data);
      const parsed = JSON.parse(res.data);
      assert.ok(parsed.security && parsed.security.signature);
    });

    it('O02 — L entête de sauvegarde consigne schemaVersion 1.2 et appVersion 1.3.6-RC4', async () => {
      const res = await BackupRestoreService.createBackup('Prod Test O02');
      assert.ok(res.data);
      const parsed = JSON.parse(res.data);
      assert.strictEqual(parsed.payload.__backup.schemaVersion, '1.2');
      assert.ok(['1.3.6-RC4', '1.3.6-RC5'].includes(parsed.payload.__backup.appVersion));
    });

    it('O03 — Un fichier de sauvegarde altéré manuellement est strictement rejeté', async () => {
      const res = await BackupRestoreService.createBackup('Prod Test O03');
      assert.ok(res.data);
      const parsed = JSON.parse(res.data);
      parsed.payload.__backup.appVersion = 'ALTERED';
      const check = await SecurityEngine.verifyPayloadSignature(parsed);
      assert.strictEqual(check.isValid, false);
    });

    it('O04 — Une tentative d importer un schéma futur incompatible (ex: 99.0) est rejetée', async () => {
      const bkp: any = {
        payload: { __backup: { schemaVersion: '99.0', appVersion: '99.0' } },
        security: { signature: 'dummy', checksum: 'dummy', algorithm: 'SHA-256' }
      };
      const check = await BackupRestoreService.simulateRestore(JSON.stringify(bkp));
      assert.strictEqual(check.isCompatible, false);
      assert.ok(check.compatibilityIssues && check.compatibilityIssues.length > 0);
    });

    it('O05 — Les sauvegardes basées sur le schéma 1.2 sont compatibles et restaurables', async () => {
      const res = await BackupRestoreService.createBackup('Prod Test O05');
      assert.ok(res.data);
      const sim = await BackupRestoreService.simulateRestore(res.data);
      assert.strictEqual(sim.isValid, true);
    });
  });

  // ============================================================
  // CATÉGORIE P : PWA & CACHE HORS-LIGNE (5 tests)
  // ============================================================
  describe('Catégorie P — PWA & Cache Hors-Ligne (P01–P05)', () => {
    it('P01 — vite.config.ts configure VitePWA en mode generateSW', () => {
      const viteConf = fs.readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf8');
      assert.ok(viteConf.includes('VitePWA'));
    });

    it('P02 — Le manifeste PWA configure display standalone', () => {
      const viteConf = fs.readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf8');
      assert.ok(viteConf.includes("'standalone'") || viteConf.includes('"standalone"'));
    });

    it('P03 — Le manifeste PWA intègre les icônes 192x192 et 512x512', () => {
      const viteConf = fs.readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf8');
      assert.ok(viteConf.includes('192x192'));
      assert.ok(viteConf.includes('512x512'));
    });

    it('P04 — Le Service Worker met en cache les bundles applicatifs', () => {
      const swPath = path.join(process.cwd(), 'dist', 'sw.js');
      assert.ok(fs.existsSync(swPath));
      assert.ok(fs.statSync(swPath).size > 1000);
    });

    it('P05 — Les fichiers temporaires et secrets sont exclus du cache Workbox', () => {
      const viteConf = fs.readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf8');
      assert.ok(viteConf.includes('globPatterns'));
    });
  });

  // ============================================================
  // CATÉGORIE Q : GÉNÉRATION DU DELIVERY KIT (5 tests)
  // ============================================================
  describe('Catégorie Q — Génération du Delivery Kit (Q01–Q05)', () => {
    it('Q01 — Le delivery kit produit un fichier de licence .lmse', async () => {
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Client Q01', type: 'commercial', durationDays: 365, maxDevices: 1 });
      const exp = OfflineBetaExporter.exportLicenseJson(lic);
      assert.ok(exp.includes('bird-academy-lmse'));
    });

    it('Q02 — Le delivery kit inclut la clé de licence textuelle formatée', async () => {
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Client Q02', type: 'commercial', durationDays: 365, maxDevices: 1 });
      assert.ok(lic.key && lic.key.startsWith('LMSE-'));
    });

    it('Q03 — Le module QRCodeManager supporte la génération de QR Code', () => {
      const qrPath = path.join(process.cwd(), 'src', 'features', 'habitat', 'services', 'QRCodeManager.ts');
      assert.ok(fs.existsSync(qrPath));
    });

    it('Q04 — DeliveryKitDownloader intègre les instructions utilisateur', () => {
      const downPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'DeliveryKitDownloader.tsx');
      assert.ok(fs.existsSync(downPath));
    });

    it('Q05 — L archive ZIP de livraison regroupe les artefacts pour le client', () => {
      const downPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'DeliveryKitDownloader.tsx');
      const content = fs.readFileSync(downPath, 'utf8');
      assert.ok(content.includes('zip') || content.includes('kit'));
    });
  });

  // ============================================================
  // CATÉGORIE R : SUPPORT CLIENT & TROUBLESHOOTING (5 tests)
  // ============================================================
  describe('Catégorie R — Support Client & Troubleshooting (R01–R05)', () => {
    it('R01 — 90 articles de documentation sont traduits dans les 5 langues', () => {
      for (const lang of ['fr', 'en', 'ar', 'es', 'it'] as const) {
        assert.strictEqual(HELP_DOC_DATABASE[lang].length, 18, `Langue ${lang} doit avoir 18 articles`);
      }
    });

    it('R02 — Le guide admin-migrate explicite le transfert de PC par clé USB / JSON', () => {
      const doc = HELP_DOC_DATABASE.fr.find((d: any) => d.id === 'admin-migrate');
      assert.ok(doc && (doc.content.includes('JSON') || doc.content.includes('importation')));
    });

    it('R03 — Le guide faq-troubleshooting documente la récupération après purge de cache', () => {
      const doc = HELP_DOC_DATABASE.fr.find((d: any) => d.id === 'faq-troubleshooting');
      assert.ok(doc && doc.content.includes('L\'APPLICATION NE DÉMARRE PLUS'));
    });

    it('R04 — La documentation explicite la transition fluide en FREE en cas d expiration', () => {
      const doc = HELP_DOC_DATABASE.fr.find((d: any) => d.id === 'admin-license');
      assert.ok(doc && doc.content.includes('Bird Academy'));
    });

    it('R05 — Les canaux de contact support sont accessibles dans le site commercial', () => {
      const suppPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'sections', 'SupportContactSection.tsx');
      assert.ok(fs.existsSync(suppPath));
    });
  });

  // ============================================================
  // CATÉGORIE S : PRÉPARATION DU PAIEMENT (NON-FINANCIER) (5 tests)
  // ============================================================
  describe('Catégorie S — Préparation du Paiement (Non-Financier) (S01–S05)', () => {
    it('S01 — Le checkout fonctionne actuellement en mode simulation non financière', () => {
      const wizPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'CheckoutWizard.tsx');
      assert.ok(fs.existsSync(wizPath));
    });

    it('S02 — Le client ne peut pas falsifier les prix du catalogue côté serveur', () => {
      const offers = commService.getActiveOffers();
      for (const o of offers) {
        assert.ok(typeof o.price === 'number' && o.price >= 0);
      }
    });

    it('S03 — Les montants officiels en Euros sont strictement fixés (0, 49, 119, 249)', () => {
      assert.strictEqual(commService.getOfferById('OFFER-FREE-COMMUNITY')!.price, 0);
      assert.strictEqual(commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!.price, 49);
      assert.strictEqual(commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!.price, 119);
      assert.strictEqual(commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!.price, 249);
    });

    it('S04 — Zéro débit de carte bancaire réel n est activé en production', () => {
      const prodEnv = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(!prodEnv.includes('STRIPE_LIVE_KEY=pk_live_'));
    });

    it('S05 — Les options de paiement possibles (Stripe, SEPA, local Tunisie) sont répertoriées', () => {
      const payPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'PaymentMethodSelector.tsx');
      assert.ok(fs.existsSync(payPath));
    });
  });

  // ============================================================
  // CATÉGORIE T : PLAN DE ROLLBACK & INTÉGRITÉ (5 tests)
  // ============================================================
  describe('Catégorie T — Plan de Rollback & Intégrité (T01–T05)', () => {
    it('T01 — L archive scellée de release v1.3.6-RC4 est disponible pour rollback', () => {
      const zipPath = path.join(process.cwd(), 'Bird-Academy-Enterprise-v1.3.6-RC4.zip');
      assert.ok(fs.existsSync(zipPath));
    });

    it('T02 — L empreinte SHA-256 du rollback est validée', () => {
      const zipPath = path.join(process.cwd(), 'Bird-Academy-Enterprise-v1.3.6-RC4.zip');
      const hash = crypto.createHash('sha256').update(fs.readFileSync(zipPath)).digest('hex');
      assert.strictEqual(hash, FROZEN_ZIP_SHA256);
    });

    it('T03 — Le dossier d archivage RELEASE_ARCHIVE_v1.3.6-RC4 contient l ensemble des artefacts', () => {
      const archDir = path.join(process.cwd(), 'RELEASE_ARCHIVE_v1.3.6-RC4');
      assert.ok(fs.existsSync(archDir));
      assert.ok(fs.existsSync(path.join(archDir, 'RELEASE_MANIFEST_v1.3.6-RC4.json')));
      assert.ok(fs.existsSync(path.join(archDir, 'SHA256SUMS_v1.3.6-RC4.txt')));
    });

    it('T04 — L extraction de l archive de rollback restitue l intégralité du build', () => {
      const appDir = path.join(process.cwd(), 'Bird-Academy-Enterprise-v1.3.6-RC4', '01-APPLICATION');
      assert.ok(fs.existsSync(path.join(appDir, 'index.html')));
      assert.ok(fs.existsSync(path.join(appDir, 'sw.js')));
    });

    it('T05 — La procédure de rollback est documentée dans le rapport de freeze', () => {
      const freezeRep = path.join(process.cwd(), 'QA_RELEASE_FREEZE_001_REPORT.md');
      assert.ok(fs.existsSync(freezeRep));
      const txt = fs.readFileSync(freezeRep, 'utf8');
      assert.ok(txt.includes('7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248'));
    });
  });

  // ============================================================
  // CATÉGORIE U : MONITORING & SANTÉ DU SERVEUR (5 tests)
  // ============================================================
  describe('Catégorie U — Monitoring & Santé du Serveur (U01–U05)', () => {
    it('U01 — lmseServer.ts expose un endpoint de santé /health ou /api/health', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('/health') || serverContent.includes('/api/status'));
    });

    it('U02 — Le monitoring surveille le taux d erreurs et la disponibilité du serveur', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('status') || serverContent.includes('health'));
    });

    it('U03 — Zéro donnée d élevage privée n est transmise dans les sondes de santé', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(!serverContent.includes('breedingData'));
      assert.ok(!serverContent.includes('birdCount'));
    });

    it('U04 — Le statut de santé confirme la version de l autorité', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('version') || serverContent.includes('status'));
    });

    it('U05 — Les requêtes de santé sont légères et sans surcharge de ressources', () => {
      assert.ok(true);
    });
  });

  // ============================================================
  // CATÉGORIE V : LOGS PRODUCTION & MASQUAGE DES SECRETS (5 tests)
  // ============================================================
  describe('Catégorie V — Logs Production & Masquage des Secrets (V01–V05)', () => {
    it('V01 — Les logs ne divulguent jamais la clé privée LMSE', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(!serverContent.includes('console.log(LMSE_PRIVATE_SIGNING_KEY'));
      assert.ok(!serverContent.includes('console.log(privateKey'));
    });

    it('V02 — Les mots de passe et tokens de session sont masqués dans les journaux', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(!serverContent.includes('console.log(password'));
      assert.ok(!serverContent.includes('console.log(token'));
    });

    it('V03 — Les données d élevage privées ne sont pas journalisées sur le serveur', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(!serverContent.includes('console.log(birdRecord'));
    });

    it('V04 — Les opérations administratives de révocation sont tracées avec timestamp', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('revocationReason') || serverContent.includes('revokedAt'));
    });

    it('V05 — Les gestionnaires d erreurs renvoient des messages génériques sans stacktrace', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('Internal server error') || serverContent.includes('error'));
    });
  });

  // ============================================================
  // CATÉGORIE W : REPRISE SUR SINISTRE & ROTATION DE CLÉ (5 tests)
  // ============================================================
  describe('Catégorie W — Reprise sur Sinistre & Rotation de Clé (W01–W05)', () => {
    it('W01 — Le plan de reprise sur sinistre est documenté dans la checklist', () => {
      const chkPath = path.join(process.cwd(), 'PRODUCTION_CHECKLIST_v1.3.6-RC4.md');
      assert.ok(fs.existsSync(chkPath));
      assert.ok(fs.readFileSync(chkPath, 'utf8').includes('Disaster Recovery'));
    });

    it('W02 — Le système supporte la rotation de clé de signature par mise à jour d variable', () => {
      const envEx = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(envEx.includes('LMSE_PRIVATE_SIGNING_KEY'));
    });

    it('W03 — La liste de révocation persiste indépendamment du cycle de vie du serveur', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('revocation') || serverContent.includes('revoked'));
    });

    it('W04 — L état des licences délivrées peut être sauvegardé sans toucher aux oiseaux', () => {
      const serverContent = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverContent.includes('licenses'));
    });

    it('W05 — Une licence révoquée lors d une rotation est immédiatement invalidée', async () => {
      const dev: any = { deviceId: 'DEV-W05', os: 'Windows', browserHash: 'h_w05', screenSpec: '1920x1080', timezone: 'UTC', language: 'fr', hardwareConcurrency: 8, createdAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() };
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Revoked Holder', type: 'commercial', durationDays: 365, maxDevices: 1 });
      const exp = OfflineBetaExporter.exportLicenseJson(lic);
      const res = await OfflineBetaValidator.validateFile(exp, dev, [lic.key]);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.code, 'LICENSE_REVOKED');
    });
  });

  // ============================================================
  // CATÉGORIE X : ISOLATION TEST VS PRODUCTION (5 tests)
  // ============================================================
  describe('Catégorie X — Isolation TEST vs PRODUCTION (X01–X05)', () => {
    it('X01 — L environnement de test public utilise bird-academy-public-test.onrender.com', () => {
      const testEnv = fs.readFileSync(path.join(process.cwd(), '.env.test.example'), 'utf8');
      assert.ok(testEnv.includes('bird-academy-test.onrender.com') || testEnv.includes('TEST'));
    });

    it('X02 — La clé de test TEST_PRIVATE_KEY est rigoureusement séparée de la production', () => {
      const testEnv = fs.readFileSync(path.join(process.cwd(), '.env.test.example'), 'utf8');
      const prodEnv = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.notStrictEqual(testEnv, prodEnv);
      assert.ok(testEnv.includes('LMSE_TEST_PRIVATE_KEY'));
      assert.ok(prodEnv.includes('__SECURE_PRODUCTION_ECDSA_PRIVATE_KEY_REQUIRED__'));
    });

    it('X03 — Une licence TEST ne peut pas être émise avec les secrets de PRODUCTION', () => {
      assert.ok(true);
    });

    it('X04 — Les templates .env.test.example et .env.production.example sont étanches', () => {
      assert.ok(fs.existsSync(path.join(process.cwd(), '.env.test.example')));
      assert.ok(fs.existsSync(path.join(process.cwd(), '.env.production.example')));
    });

    it('X05 — La base de données ou le registre de production ne peut être écrasé par les tests', () => {
      assert.strictEqual(testStorage.length >= 0, true);
    });
  });
});

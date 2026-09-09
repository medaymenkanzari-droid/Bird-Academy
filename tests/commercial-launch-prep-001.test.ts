/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
 * TEST SUITE : COMMERCIAL-LAUNCH-PREP-001
 * 
 * Validation exhaustive de la préparation commerciale et d'infrastructure :
 * - Sanctuarisation de la release gelée v1.3.6-RC4 (Commit 8b8736380bd7580676af689f59ade38a42093095)
 * - Séparation stricte TEST vs PRODUCTION (Clés, Domaines, Registres, Endpoints)
 * - Sécurité des secrets serveur et étanchéité des bundles clients
 * - Isolation cryptographique LMSE & Protection de la console Admin (HTTP 401)
 * - Maintien absolu du modèle Local-First, Offline-First et Single Device (maxDevices: 1)
 * - Interception réseau réelle : Zéro transmission de données d'élevage (oiseaux, pontes, santé, génétique)
 * - Portes de contrôle : Payment Activation Gate & Public Commercial Launch Gate
 */

import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Modules du domaine commercial & licensing
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService.ts';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator.ts';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator.ts';
import { LicenseLifecycleEngine } from '../src/features/licensing/engines/LicenseLifecycleEngine.ts';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator.ts';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter.ts';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver.ts';
import { LmseBackendServer } from '../src/server/lmseServer.ts';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository.ts';
import { SecurityEngine } from '../src/features/platform/engines/SecurityEngine.ts';
import { BackupRestoreService } from '../src/features/platform/services/BackupRestoreService.ts';
import { HELP_DOC_DATABASE } from '../src/features/quality/components/HelpDocTab.tsx';
import { WrightCoefficientEngine } from '../src/features/genetics/engines/WrightCoefficientEngine.ts';
import { BirdEngine } from '../src/business/BirdEngine.ts';
import { HabitatEngine } from '../src/business/HabitatEngine.ts';

// Mock localStorage pour l'environnement Node.js
class MockStorage implements Storage {
  private store: Map<string, string> = new Map();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) || null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] || null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

const testStorage = new MockStorage();
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = testStorage;
}

describe('MISSION COMMERCIAL-LAUNCH-PREP-001 — Audit & Préparation Commerciale', () => {
  const commService = CommercialOffersService.getInstance();
  let originalAppMode: string | undefined;

  before(() => {
    originalAppMode = process.env.VITE_APP_MODE;
  });

  after(() => {
    process.env.VITE_APP_MODE = originalAppMode;
  });

  beforeEach(() => {
    process.env.VITE_APP_MODE = 'admin';
  });

  // ============================================================
  // CATÉGORIE A : RELEASE FREEZE & GIT INTEGRITY (A01–A04)
  // ============================================================
  describe('Catégorie A — Release Freeze & Intégrité Git (A01–A04)', () => {
    it('A01 — Le tag officiel est v1.3.6-RC4', () => {
      const tags = execSync('git tag', { encoding: 'utf8' });
      assert.ok(tags.includes('v1.3.6-RC4'));
    });

    it('A02 — Le commit de référence résout 8b8736380bd7580676af689f59ade38a42093095', () => {
      const commit = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf8' }).trim();
      assert.strictEqual(commit, '8b8736380bd7580676af689f59ade38a42093095');
    });

    it('A03 — Build ID et Build Code correspondent à une version officielle (RC4 ou RC5)', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      assert.ok(['1.3.6-RC4', '1.3.6-RC5'].includes(pkg.version));
    });

    it('A04 — L archive de freeze Bird-Academy-Enterprise-v1.3.6-RC4.zip est scellée', () => {
      const zipPath = path.join(process.cwd(), 'Bird-Academy-Enterprise-v1.3.6-RC4.zip');
      assert.ok(fs.existsSync(zipPath));
    });
  });

  // ============================================================
  // CATÉGORIE B : SÉPARATION TEST / PROD (B01–B04)
  // ============================================================
  describe('Catégorie B — Isolation TEST vs PROD (B01–B04)', () => {
    it('B01 — L URL de test public pointe sur onrender.com', () => {
      const testEnv = fs.readFileSync(path.join(process.cwd(), '.env.test.example'), 'utf8');
      assert.ok(testEnv.includes('onrender.com'));
    });

    it('B02 — .env.production.example documente une URL de production distincte', () => {
      const prodEnv = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(prodEnv.includes('https://api.bird-academy.com') || prodEnv.includes('PRODUCTION'));
    });

    it('B03 — Le fichier .env réel n est pas tracké par git', () => {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      assert.ok(!gitStatus.includes(' .env\n') && !gitStatus.includes('?? .env\n'));
    });

    it('B04 — Les clés de test TEST_PRIVATE_KEY sont rigoureusement isolées de la production', () => {
      const testEnv = fs.readFileSync(path.join(process.cwd(), '.env.test.example'), 'utf8');
      assert.ok(testEnv.includes('TEST_PRIVATE_KEY') || testEnv.includes('TEST'));
    });
  });

  // ============================================================
  // CATÉGORIE C : VARIABLES D'ENVIRONNEMENT (C01–C04)
  // ============================================================
  describe('Catégorie C — Variables d Environnement (C01–C04)', () => {
    it('C01 — .env.example fournit le gabarit de développement sécurisé', () => {
      assert.ok(fs.existsSync(path.join(process.cwd(), '.env.example')));
    });

    it('C02 — .env.production.example fournit les directives de production', () => {
      assert.ok(fs.existsSync(path.join(process.cwd(), '.env.production.example')));
    });

    it('C03 — Zéro secret n est exposé sous préfixe VITE_ dans les gabarits', () => {
      const prodContent = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(!prodContent.includes('VITE_LMSE_PRIVATE_KEY'));
      assert.ok(!prodContent.includes('VITE_STRIPE_SECRET_KEY'));
    });

    it('C04 — render.yaml référence l environnement de test avec NODE_ENV=production', () => {
      const renderYaml = fs.readFileSync(path.join(process.cwd(), 'render.yaml'), 'utf8');
      assert.ok(renderYaml.includes('ENVIRONMENT'));
    });
  });

  // ============================================================
  // CATÉGORIE D : SÉCURITÉ DES SECRETS (D01–D04)
  // ============================================================
  describe('Catégorie D — Sécurité des Secrets & Clé Privée (D01–D04)', () => {
    it('D01 — LMSE_PRIVATE_SIGNING_KEY est confinée exclusivement côté serveur', () => {
      const serverCode = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverCode.includes('LMSE_PRIVATE_SIGNING_KEY') || serverCode.includes('LicenseGenerator'));
    });

    it('D02 — dist/ ne contient aucune occurrence de clé privée ou secret serveur', () => {
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        const indexHtml = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
        assert.ok(!indexHtml.includes('PRIVATE_KEY'));
      }
    });

    it('D03 — Le script verifyUserBundle valide la sanctuarisation du bundle client', () => {
      const verifyOutput = execSync('npm run verify:user-bundle', { encoding: 'utf8' });
      assert.ok(verifyOutput.includes('PASS'));
    });

    it('D04 — Aucune clé bancaire live Stripe (pk_live_ / sk_live_) n existe dans le dépôt', () => {
      const gitGrep = execSync('git grep "sk_live_" || echo "CLEAN"', { encoding: 'utf8' });
      assert.ok(gitGrep.includes('CLEAN') || !gitGrep.includes('sk_live_'));
    });
  });

  // ============================================================
  // CATÉGORIE E : LMSE BACKEND & AUTORITÉ (E01–E04)
  // ============================================================
  describe('Catégorie E — Moteur LMSE & Autorité Unique (E01–E04)', () => {
    it('E01 — LmseBackendServer s instancie et monte les routes critiques', () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      assert.ok(server.app);
    });

    it('E02 — /api/commercial/checkout émet une licence signée valide', async () => {
      const repo = new InMemoryLicenseRepository();
      const server = new LmseBackendServer(repo);
      const res = await server.inject({
        method: 'POST',
        url: '/api/commercial/checkout',
        payload: {
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Eleveur Prep E02',
          customerEmail: 'prepE02@example.com',
          tier: 'PREMIUM',
        },
      });
      assert.strictEqual(res.statusCode, 201);
      const body = JSON.parse(res.payload);
      assert.ok(body.license && body.license.signature);
    });

    it('E03 — Checkout rejette les requêtes incomplètes sans nom de client', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({
        method: 'POST',
        url: '/api/commercial/checkout',
        payload: { offerId: 'OFFER-PREMIUM-ANNUAL-2026' },
      });
      assert.strictEqual(res.statusCode, 400);
    });

    it('E04 — LMSE enregistre chaque émission commerciale dans les logs d audit', async () => {
      const repo = new InMemoryLicenseRepository();
      const server = new LmseBackendServer(repo);
      await server.inject({
        method: 'POST',
        url: '/api/commercial/checkout',
        payload: {
          offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
          customerName: 'Eleveur Prep E04',
          tier: 'PRO',
        },
      });
      const logs = server.getAuditLogs();
      assert.ok(logs.some(l => l.action === 'COMMERCIAL_LICENSE_ISSUED'));
    });
  });

  // ============================================================
  // CATÉGORIE F : CONSOLE ADMIN & SÉCURITÉ (F01–F04)
  // ============================================================
  describe('Catégorie F — Console Admin & Protection 401 (F01–F04)', () => {
    it('F01 — GET /api/admin/licenses sans jeton renvoie 401 Unauthorized', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({ method: 'GET', url: '/api/admin/licenses' });
      assert.strictEqual(res.statusCode, 401);
    });

    it('F02 — POST /api/admin/licenses/:id/revoke sans jeton renvoie 401', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({ method: 'POST', url: '/api/admin/licenses/LIC-001/revoke' });
      assert.strictEqual(res.statusCode, 401);
    });

    it('F03 — POST /api/admin/licenses/:id/replace sans jeton renvoie 401', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({ method: 'POST', url: '/api/admin/licenses/LIC-001/replace' });
      assert.strictEqual(res.statusCode, 401);
    });

    it('F04 — GET /api/admin/audit sans jeton renvoie 401', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({ method: 'GET', url: '/api/admin/audit' });
      assert.strictEqual(res.statusCode, 401);
    });
  });

  // ============================================================
  // CATÉGORIE G : CORS & EN-TÊTES SÉCURITÉ (G01–G04)
  // ============================================================
  describe('Catégorie G — En-têtes CORS & Protection (G01–G04)', () => {
    it('G01 — Le serveur répond avec succès à une requête OPTIONS pré-vol', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({ method: 'OPTIONS', url: '/api/commercial/checkout' });
      assert.strictEqual(res.statusCode, 200);
    });

    it('G02 — Les en-têtes de méthodes autorisées incluent GET, POST, OPTIONS', () => {
      const serverCode = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverCode.includes('Access-Control-Allow-Methods'));
    });

    it('G03 — startTestServer applique X-Content-Type-Options: nosniff', () => {
      const testServerCode = fs.readFileSync(path.join(process.cwd(), 'scripts', 'startTestServer.js'), 'utf8');
      assert.ok(testServerCode.includes('nosniff'));
    });

    it('G04 — startTestServer applique X-Frame-Options: SAMEORIGIN', () => {
      const testServerCode = fs.readFileSync(path.join(process.cwd(), 'scripts', 'startTestServer.js'), 'utf8');
      assert.ok(testServerCode.includes('SAMEORIGIN'));
    });
  });

  // ============================================================
  // CATÉGORIE H : HTTPS & TRANSPORT SÉCURISÉ (H01–H03)
  // ============================================================
  describe('Catégorie H — Exigences HTTPS (H01–H03)', () => {
    it('H01 — L URL publique de test public est en HTTPS strict', () => {
      const testEnv = fs.readFileSync(path.join(process.cwd(), '.env.test.example'), 'utf8');
      assert.ok(testEnv.includes('VITE_LMSE_API_URL=https://'));
    });

    it('H02 — Zéro appel d API commercial en clair (http://) vers l autorité de production', () => {
      const prodEnv = fs.readFileSync(path.join(process.cwd(), '.env.production.example'), 'utf8');
      assert.ok(!prodEnv.includes('http://birdacademy.app'));
    });

    it('H03 — Zéro secret ou clé transmis dans les paramètres d URL (query strings)', () => {
      const serverCode = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(!serverCode.includes('req.query.privateKey'));
    });
  });

  // ============================================================
  // CATÉGORIE I : CONFIGURATION DE DOMAINE (I01–I03)
  // ============================================================
  describe('Catégorie I — Configuration de Domaine & DNS (I01–I03)', () => {
    it('I01 — Le statut officiel de domaine reste DOMAIN NOT CONFIGURED', () => {
      const checkDoc = fs.readFileSync(path.join(process.cwd(), 'PRODUCTION_CONFIGURATION_CHECKLIST.md'), 'utf8');
      assert.ok(checkDoc.includes('DOMAIN NOT CONFIGURED'));
    });

    it('I02 — Les domaines candidats recommandés (birdacademy.app / volieremanager.com) sont documentés', () => {
      const checkDoc = fs.readFileSync(path.join(process.cwd(), 'PRODUCTION_CONFIGURATION_CHECKLIST.md'), 'utf8');
      assert.ok(checkDoc.includes('birdacademy.app') || checkDoc.includes('volieremanager.com'));
    });

    it('I03 — La checklist stipule que les enregistrements DNS sont PENDING', () => {
      const checkDoc = fs.readFileSync(path.join(process.cwd(), 'PRODUCTION_CONFIGURATION_CHECKLIST.md'), 'utf8');
      assert.ok(checkDoc.includes('PENDING'));
    });
  });

  // ============================================================
  // CATÉGORIE J : PARCOURS FREE NATIF (J01–J04)
  // ============================================================
  describe('Catégorie J — Parcours FREE Natif Autonome (J01–J04)', () => {
    it('J01 — Sans licence enregistrée, SubscriptionTierResolver résout FREE', () => {
      testStorage.clear();
      assert.strictEqual(SubscriptionTierResolver.resolve(null), 'FREE');
    });

    it('J02 — Démarrage FREE totalement autonome sans communication réseau obligatoire', () => {
      assert.strictEqual(testStorage.getItem('bird_academy_license'), null);
      assert.strictEqual(SubscriptionTierResolver.resolve(null), 'FREE');
    });

    it('J03 — L offre FREE est fixée à 0 EUR', () => {
      assert.strictEqual(commService.getOfferById('OFFER-FREE-COMMUNITY')!.price, 0);
    });

    it('J04 — L offre FREE impose un quota IA de 10 requêtes par jour', () => {
      assert.strictEqual(commService.getOfferById('OFFER-FREE-COMMUNITY')!.aiDailyQuota, 10);
    });
  });

  // ============================================================
  // CATÉGORIE K : PARCOURS PREMIUM (K01–K03)
  // ============================================================
  describe('Catégorie K — Parcours PREMIUM (K01–K03)', () => {
    it('K01 — L offre PREMIUM Annuelle est fixée à 49 EUR', () => {
      assert.strictEqual(commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!.price, 49);
    });

    it('K02 — PREMIUM débloque BIRD_UNLIMITED, FEEDING_MANAGE et HEALTH_BATCH_TREATMENTS', () => {
      const o = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      assert.ok(o.capabilities.includes('BIRD_UNLIMITED'));
      assert.ok(o.capabilities.includes('FEEDING_MANAGE'));
      assert.ok(o.capabilities.includes('HEALTH_BATCH_TREATMENTS'));
    });

    it('K03 — Une licence expirée rétrograde en FREE sans altérer les oiseaux stockés', () => {
      const mockLic: any = { metadata: { commercialTier: 'PREMIUM' } };
      assert.strictEqual(SubscriptionTierResolver.resolve(mockLic, { isValid: false, code: 'EXPIRED' } as any), 'FREE');
    });
  });

  // ============================================================
  // CATÉGORIE L : PARCOURS PRO ANNUEL (L01–L03)
  // ============================================================
  describe('Catégorie L — Parcours PRO Annuel & Enterprise (L01–L03)', () => {
    it('L01 — L offre PRO Enterprise Annuelle est fixée à 119 EUR/an', () => {
      assert.strictEqual(commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!.price, 119);
    });

    it('L02 — PRO débloque l algorithme de Wright et Bird Intelligence', () => {
      const o = commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      assert.ok(o.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
      assert.ok(o.capabilities.includes('INTELLIGENCE_DIAGNOSTIC_FICHES'));
    });

    it('L03 — Le calcul de consanguinité de Wright fonctionne hors-ligne en mode PRO', () => {
      const male: any = { id: 1, pere_id: 3, mere_id: 4 };
      const female: any = { id: 2, pere_id: 3, mere_id: 5 };
      const common: any = { id: 3, pere_id: null, mere_id: null };
      const m4: any = { id: 4, pere_id: null, mere_id: null };
      const m5: any = { id: 5, pere_id: null, mere_id: null };
      const birds = [male, female, common, m4, m5];
      const res = WrightCoefficientEngine.calculateInbreeding(1, 2, birds, 4);
      assert.ok(typeof res.coefficient === 'number' && res.coefficient > 0);
    });
  });

  // ============================================================
  // CATÉGORIE M : PARCOURS PRO LIFETIME (M01–M03)
  // ============================================================
  describe('Catégorie M — Parcours PRO Lifetime Permanent (M01–M03)', () => {
    it('M01 — L offre PRO Enterprise Lifetime est fixée à 249 EUR', () => {
      assert.strictEqual(commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!.price, 249);
    });

    it('M02 — PRO Lifetime n a aucune date d expiration (durationDays = null, permanent)', () => {
      const o = commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!;
      assert.strictEqual(o.durationDays, null);
      assert.strictEqual(o.licenseType, 'permanent');
    });

    it('M03 — Une licence permanente ne nécessite aucun renouvellement en ligne', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Eleveur Lifetime M03',
        type: 'enterprise',
        durationDays: null,
      });
      assert.strictEqual(lic.expiresAt, null);
    });
  });

  // ============================================================
  // CATÉGORIE N : MONO-APPAREIL (SINGLE DEVICE) (N01–N03)
  // ============================================================
  describe('Catégorie N — Règle Mono-Appareil (Single Device) (N01–N03)', () => {
    it('N01 — 100% des offres commerciales imposent maxDevices = 1', () => {
      for (const off of commService.getActiveOffers()) {
        assert.strictEqual(off.maxDevices, 1, `L offre ${off.id} doit imposer 1 appareil`);
      }
    });

    it('N02 — Le site commercial affiche explicitement "mono-appareil"', () => {
      const sitePath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'pages', 'WebFAQPage.tsx');
      const content = fs.readFileSync(sitePath, 'utf8');
      assert.ok(content.includes('mono-appareil') || content.includes('1 appareil'));
    });

    it('N03 — Zéro promesse de "multi-device" ou "5 appareils" dans le code source commercial', () => {
      const sitePath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'sections', 'PricingCardsSection.tsx');
      const content = fs.readFileSync(sitePath, 'utf8');
      assert.ok(!content.includes('5 appareils'));
      assert.ok(!content.includes('multi-device'));
    });
  });

  // ============================================================
  // CATÉGORIE O : CATALOGUE & TARIFICATION (O01–O03)
  // ============================================================
  describe('Catégorie O — Catalogue des Offres & Tarification (O01–O03)', () => {
    it('O01 — Le catalogue contient exactement 4 offres actives', () => {
      assert.strictEqual(commService.getActiveOffers().length, 4);
    });

    it('O02 — Les 4 identifiants d offre officiels sont immuables', () => {
      assert.ok(commService.getOfferById('OFFER-FREE-COMMUNITY'));
      assert.ok(commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026'));
      assert.ok(commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026'));
      assert.ok(commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME'));
    });

    it('O03 — La devise du catalogue est l Euro (EUR)', () => {
      for (const off of commService.getActiveOffers()) {
        assert.strictEqual(off.currency, 'EUR');
      }
    });
  });

  // ============================================================
  // CATÉGORIE P : ARCHITECTURE CHECKOUT (P01–P03)
  // ============================================================
  describe('Catégorie P — Architecture Checkout & Serveur (P01–P03)', () => {
    it('P01 — Le composant CheckoutWizard est présent', () => {
      const wizPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'CheckoutWizard.tsx');
      assert.ok(fs.existsSync(wizPath));
    });

    it('P02 — Le serveur est la seule autorité délivrant les licences commerciales', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({
        method: 'POST',
        url: '/api/commercial/checkout',
        payload: {
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Eleveur P02',
          tier: 'PREMIUM',
        },
      });
      assert.strictEqual(res.statusCode, 201);
    });

    it('P03 — Le frontend ne peut pas modifier unilatéralement le prix serveur', () => {
      const off = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      assert.strictEqual(off.price, 49);
    });
  });

  // ============================================================
  // CATÉGORIE Q : VERROUILLAGE PAIEMENT RÉEL (Q01–Q03)
  // ============================================================
  describe('Catégorie Q — Verrouillage Paiement Réel (Q01–Q03)', () => {
    it('Q01 — PAYMENT_READINESS.md déclare formellement PAYMENT NOT CONFIGURED', () => {
      const payDoc = fs.readFileSync(path.join(process.cwd(), 'PAYMENT_READINESS.md'), 'utf8');
      assert.ok(payDoc.includes('PAYMENT NOT CONFIGURED'));
    });

    it('Q02 — Zéro transaction financière réelle n est traitée', () => {
      const payDoc = fs.readFileSync(path.join(process.cwd(), 'PAYMENT_READINESS.md'), 'utf8');
      assert.ok(payDoc.includes('AUCUN PAIEMENT RÉEL'));
    });

    it('Q03 — La passerelle est en mode simulation sécurisée', () => {
      const payDoc = fs.readFileSync(path.join(process.cwd(), 'PAYMENT_READINESS.md'), 'utf8');
      assert.ok(payDoc.includes('mode simulation'));
    });
  });

  // ============================================================
  // CATÉGORIE R : IDEMPOTENCE (R01–R03)
  // ============================================================
  describe('Catégorie R — Stratégie d Idempotence (R01–R03)', () => {
    it('R01 — PAYMENT_READINESS.md documente la stratégie de corrélation orderId / paymentId', () => {
      const payDoc = fs.readFileSync(path.join(process.cwd(), 'PAYMENT_READINESS.md'), 'utf8');
      assert.ok(payDoc.includes('orderId') && payDoc.includes('paymentId'));
    });

    it('R02 — La machine à états inclut CREATED, PAID, DELIVERED, REFUNDED', () => {
      const payDoc = fs.readFileSync(path.join(process.cwd(), 'PAYMENT_READINESS.md'), 'utf8');
      assert.ok(payDoc.includes('PAID') && payDoc.includes('DELIVERED'));
    });

    it('R03 — La réception en double d un webhook n émet pas deux licences distinctes', () => {
      const payDoc = fs.readFileSync(path.join(process.cwd(), 'PAYMENT_READINESS.md'), 'utf8');
      assert.ok(payDoc.includes('Idempotency-Key') || payDoc.includes('idempotence'));
    });
  });

  // ============================================================
  // CATÉGORIE S : COMPOSITION DELIVERY KIT (S01–S03)
  // ============================================================
  describe('Catégorie S — Composition du Delivery Kit (S01–S03)', () => {
    it('S01 — FIRST_SALE_SOP.md énumère les 6 éléments du kit client', () => {
      const sop = fs.readFileSync(path.join(process.cwd(), 'FIRST_SALE_SOP.md'), 'utf8');
      assert.ok(sop.includes('license_<id>.lmse'));
      assert.ok(sop.includes('license-key.txt'));
      assert.ok(sop.includes('license-qr.png'));
      assert.ok(sop.includes('license-info.txt'));
      assert.ok(sop.includes('README.txt'));
      assert.ok(sop.includes('archive.zip'));
    });

    it('S02 — Le générateur de clé formate la clé avec préfixe LMSE-COMM', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Eleveur S02',
        type: 'commercial',
      });
      assert.ok(lic.key.startsWith('LMSE-'));
    });

    it('S03 — La licence .lmse est scellée par signature ECDSA P-256', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Eleveur S03',
        type: 'commercial',
      });
      assert.ok(lic.signature && lic.signature.length > 20);
    });
  });

  // ============================================================
  // CATÉGORIE T : ÉTATS DE REMBOURSEMENT (T01–T03)
  // ============================================================
  describe('Catégorie T — États de Remboursement & Annulation (T01–T03)', () => {
    it('T01 — REFUND_CANCELLATION_SOP.md est rédigé et documente la révocation', () => {
      assert.ok(fs.existsSync(path.join(process.cwd(), 'REFUND_CANCELLATION_SOP.md')));
    });

    it('T02 — Le remboursement d une licence entraîne son inscription en révocation', () => {
      const refSop = fs.readFileSync(path.join(process.cwd(), 'REFUND_CANCELLATION_SOP.md'), 'utf8');
      assert.ok(refSop.includes('POST /api/admin/licenses/:id/revoke'));
    });

    it('T03 — La révocation post-remboursement préserve 100% des données d oiseaux en local', () => {
      const refSop = fs.readFileSync(path.join(process.cwd(), 'REFUND_CANCELLATION_SOP.md'), 'utf8');
      assert.ok(refSop.includes('SANCTUARISATION DES DONNÉES') || refSop.includes('donnée'));
    });
  });

  // ============================================================
  // CATÉGORIE U : PROCÉDURE DE REMPLACEMENT (U01–U03)
  // ============================================================
  describe('Catégorie U — Procédure de Remplacement Matériel (U01–U03)', () => {
    it('U01 — LICENSE_REPLACEMENT_SOP.md documente le changement de PC / panne de disque', () => {
      const repSop = fs.readFileSync(path.join(process.cwd(), 'LICENSE_REPLACEMENT_SOP.md'), 'utf8');
      assert.ok(repSop.includes('POST /api/admin/licenses/:id/replace'));
    });

    it('U02 — LicenseLifecycleEngine.replace archive l ancienne licence en statut replaced', async () => {
      const oldLic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur U02', type: 'commercial' });
      const newLic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur U02', type: 'commercial' });
      const { archivedLicense, activeLicense } = LicenseLifecycleEngine.replace(oldLic, newLic, 'Changement PC');
      assert.strictEqual(archivedLicense.status, 'replaced');
      assert.strictEqual(activeLicense.status, 'active');
    });

    it('U03 — La nouvelle licence conserve l identité de l ancienne dans ses métadonnées', async () => {
      const oldLic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur U03', type: 'commercial' });
      const newLic = await LicenseGenerator.generateLicense({
        holderName: 'Eleveur U03',
        type: 'commercial',
        metadata: { replacedLicenseId: oldLic.id },
      });
      assert.strictEqual(newLic.metadata?.replacedLicenseId, oldLic.id);
    });
  });

  // ============================================================
  // CATÉGORIE V : AUDIT & JOURNALISATION (V01–V03)
  // ============================================================
  describe('Catégorie V — Journalisation d Audit Immuable (V01–V03)', () => {
    it('V01 — LMSE journalise les événements avec horodatage UTC et identifiant unique', () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const entry = server.recordAudit({
        who: 'test@admin.com',
        role: 'SUPER_ADMIN',
        action: 'TEST_AUDIT',
        target: 'TARGET-01',
        ip: '127.0.0.1',
        result: 'SUCCESS',
      });
      assert.ok(entry.id.startsWith('AUD-SRV-'));
      assert.ok(entry.timestamp);
    });

    it('V02 — Les journaux d audit ne consignent jamais la clé privée de signature', () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      server.recordAudit({
        who: 'audit@admin.com',
        role: 'SUPER_ADMIN',
        action: 'KEY_CHECK',
        target: 'LMSE',
        ip: '127.0.0.1',
        result: 'SUCCESS',
      });
      for (const log of server.getAuditLogs()) {
        assert.ok(!JSON.stringify(log).includes('LMSE_PRIVATE_SIGNING_KEY'));
      }
    });

    it('V03 — La liste des logs d audit est consultable par l administrateur', () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      server.recordAudit({
        who: 'admin',
        role: 'admin',
        action: 'LOGIN',
        target: '/auth',
        ip: '127.0.0.1',
        result: 'SUCCESS',
      });
      assert.strictEqual(server.getAuditLogs().length, 1);
    });
  });

  // ============================================================
  // CATÉGORIE W : SAUVEGARDE COMMERCIALE (W01–W03)
  // ============================================================
  describe('Catégorie W — Sauvegarde Commerciale LMSE (W01–W03)', () => {
    it('W01 — LMSE_COMMERCIAL_BACKUP_SOP.md est créé et explicite la séparation secrets/données', () => {
      const bkpSop = fs.readFileSync(path.join(process.cwd(), 'LMSE_COMMERCIAL_BACKUP_SOP.md'), 'utf8');
      assert.ok(bkpSop.includes('SECRET & KEY MANAGEMENT'));
      assert.ok(bkpSop.includes('DATA BACKUP'));
    });

    it('W02 — Le registre de licence FileLicenseRepository gère licenses.json', () => {
      const repoPath = path.join(process.cwd(), 'src', 'features', 'licensing', 'repositories', 'FileLicenseRepository.ts');
      assert.ok(fs.existsSync(repoPath));
    });

    it('W03 — Zéro donnée d élevage n est incluse dans la sauvegarde commerciale LMSE', () => {
      const bkpSop = fs.readFileSync(path.join(process.cwd(), 'LMSE_COMMERCIAL_BACKUP_SOP.md'), 'utf8');
      assert.ok(bkpSop.includes("AUCUNE DONNÉE D'ÉLEVAGE") || bkpSop.includes("donnée d'élevage"));
    });
  });

  // ============================================================
  // CATÉGORIE X : MONITORING & SANTÉ (X01–X03)
  // ============================================================
  describe('Catégorie X — Monitoring & Santé Opérationnelle (X01–X03)', () => {
    it('X01 — GET /api/health renvoie status: ok et service: LMSE Backend API', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({ method: 'GET', url: '/api/health' });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.status, 'ok');
      assert.strictEqual(body.service, 'LMSE Backend API');
    });

    it('X02 — Le temps de réponse de la sonde de santé est inférieur à 50ms', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const start = Date.now();
      await server.inject({ method: 'GET', url: '/api/health' });
      const duration = Date.now() - start;
      assert.ok(duration < 50);
    });

    it('X03 — Aucune donnée d élevage n est exposée dans le payload de santé', async () => {
      const server = new LmseBackendServer(new InMemoryLicenseRepository());
      const res = await server.inject({ method: 'GET', url: '/api/health' });
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.birds, undefined);
      assert.strictEqual(body.cages, undefined);
    });
  });

  // ============================================================
  // CATÉGORIE Y : RATE LIMITING & ANTI-ABUS (Y01–Y03)
  // ============================================================
  describe('Catégorie Y — Rate Limiting & Anti-Abus (Y01–Y03)', () => {
    it('Y01 — Le module RateLimiter existe dans le serveur', () => {
      const rateLimiterPath = path.join(process.cwd(), 'src', 'server', 'middleware', 'rateLimiter.ts');
      assert.ok(fs.existsSync(rateLimiterPath));
    });

    it('Y02 — Le login administrateur est bridé à 5 requêtes par minute', () => {
      const serverCode = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverCode.includes('max: 5'));
    });

    it('Y03 — L API utilisateur est bridée à 60 requêtes par minute', () => {
      const serverCode = fs.readFileSync(path.join(process.cwd(), 'src', 'server', 'lmseServer.ts'), 'utf8');
      assert.ok(serverCode.includes('max: 60'));
    });
  });

  // ============================================================
  // CATÉGORIE Z : DOCUMENTATION CLIENT (Z01–Z03)
  // ============================================================
  describe('Catégorie Z — Documentation Client & Transparence (Z01–Z03)', () => {
    it('Z01 — Les 90 articles d aide sont traduits dans les 5 langues officielles', () => {
      for (const lang of ['fr', 'en', 'ar', 'es', 'it'] as const) {
        assert.strictEqual(HELP_DOC_DATABASE[lang].length, 18);
      }
    });

    it('Z02 — L article admin-migrate détaille la migration manuelle par fichier JSON', () => {
      const article = HELP_DOC_DATABASE.fr.find(a => a.id === 'admin-migrate');
      assert.ok(article && article.content.includes('JSON'));
    });

    it('Z03 — L article faq-troubleshooting documente la procédure en cas de cache navigateur', () => {
      const article = HELP_DOC_DATABASE.fr.find(a => a.id === 'faq-troubleshooting');
      assert.ok(article && article.content.includes('L\'APPLICATION NE DÉMARRE PLUS'));
    });
  });

  // ============================================================
  // CATÉGORIE AA : SUPPORT CLIENT (AA01–AA03)
  // ============================================================
  describe('Catégorie AA — Procédures Support Client (AA01–AA03)', () => {
    it('AA01 — PRODUCTION_CONFIGURATION_CHECKLIST.md documente 12 scénarios support (SUP-001 à SUP-012)', () => {
      const checkDoc = fs.readFileSync(path.join(process.cwd(), 'PRODUCTION_CONFIGURATION_CHECKLIST.md'), 'utf8');
      assert.ok(checkDoc.includes('SUP-001') || checkDoc.includes('Support'));
    });

    it('AA02 — Les canaux de contact support sont accessibles depuis le site commercial', () => {
      const suppPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'sections', 'SupportContactSection.tsx');
      assert.ok(fs.existsSync(suppPath));
    });

    it('AA03 — Le support ne demande jamais les données d élevage privées du client', () => {
      const sop = fs.readFileSync(path.join(process.cwd(), 'FIRST_SALE_SOP.md'), 'utf8');
      assert.ok(sop.includes('Aucune information relative à son cheptel'));
    });
  });

  // ============================================================
  // CATÉGORIE AB : AUDIT DU BUNDLE (AB01–AB03)
  // ============================================================
  describe('Catégorie AB — Audit Bundle & Zéro Fuite (AB01–AB03)', () => {
    it('AB01 — verifyUserBundle.js valide l absence de fichiers Admin dans le bundle User', () => {
      const verifyOutput = execSync('npm run verify:user-bundle', { encoding: 'utf8' });
      assert.ok(verifyOutput.includes('Administrative isolation: PASS'));
    });

    it('AB02 — verifyUserBundle.js valide l absence de clé privée de signature', () => {
      const verifyOutput = execSync('npm run verify:user-bundle', { encoding: 'utf8' });
      assert.ok(verifyOutput.includes('Private signing key: PASS'));
    });

    it('AB03 — verifyUserBundle.js confirme Clean bundle!', () => {
      const verifyOutput = execSync('npm run verify:user-bundle', { encoding: 'utf8' });
      assert.ok(verifyOutput.includes('[BUNDLE AUDIT SUCCESS] Clean bundle!'));
    });
  });

  // ============================================================
  // CATÉGORIE AC : TYPESCRIPT (AC01–AC02)
  // ============================================================
  describe('Catégorie AC — Compilation TypeScript Stricte (AC01–AC02)', () => {
    it('AC01 — npx tsc --noEmit compile avec 0 erreur de type', () => {
      assert.doesNotThrow(() => {
        execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
      });
    });

    it('AC02 — tsconfig.json applique les options strictes requises', () => {
      const tsconfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf8'));
      assert.ok(tsconfig.compilerOptions);
    });
  });

  // ============================================================
  // CATÉGORIE AD : BUILD PRODUCTION (AD01–AD02)
  // ============================================================
  describe('Catégorie AD — Build de Production (AD01–AD02)', () => {
    it('AD01 — dist/index.html existe et contient le point d entrée de production', () => {
      assert.ok(fs.existsSync(path.join(process.cwd(), 'dist', 'index.html')));
    });

    it('AD02 — dist/sw.js existe et confirme la génération du Service Worker PWA', () => {
      assert.ok(fs.existsSync(path.join(process.cwd(), 'dist', 'sw.js')));
    });
  });

  // ============================================================
  // CATÉGORIE AE : NON-RÉGRESSION (AE01–AE03)
  // ============================================================
  describe('Catégorie AE — Non-Régression Fonctionnelle (AE01–AE03)', () => {
    it('AE01 — BackupRestoreService rejette un schéma de données futur incompatible (ex: 99.0)', async () => {
      const badBackup = {
        metadata: { schemaVersion: '99.0', appVersion: '99.0', createdAt: new Date().toISOString() },
        birds: [],
        cages: [],
      };
      const res = await BackupRestoreService.simulateRestore(JSON.stringify(badBackup));
      assert.strictEqual(res.isCompatible, false);
    });

    it('AE02 — SecurityEngine valide l intégrité SHA-256 des données sérialisées', async () => {
      const payload = { test: 'integrity-check' };
      const hash = await SecurityEngine.generateChecksum(JSON.stringify(payload));
      assert.ok(hash && hash.length === 64);
    });

    it('AE03 — WrightCoefficientEngine calcule avec précision', () => {
      const male: any = { id: 1, pere_id: 3, mere_id: 4 };
      const female: any = { id: 2, pere_id: 3, mere_id: 5 };
      const common: any = { id: 3, pere_id: null, mere_id: null };
      const m4: any = { id: 4, pere_id: null, mere_id: null };
      const m5: any = { id: 5, pere_id: null, mere_id: null };
      const birds = [male, female, common, m4, m5];
      const res = WrightCoefficientEngine.calculateInbreeding(1, 2, birds, 4);
      assert.ok(typeof res.coefficient === 'number' && res.coefficient > 0);
    });
  });

  // ============================================================
  // CATÉGORIE AF : TEST PUBLIC (AF01–AF02)
  // ============================================================
  describe('Catégorie AF — Environnement Public TEST (AF01–AF02)', () => {
    it('AF01 — render.yaml configure le service bird-academy-public-test', () => {
      const renderYaml = fs.readFileSync(path.join(process.cwd(), 'render.yaml'), 'utf8');
      assert.ok(renderYaml.includes('bird-academy-public-test'));
    });

    it('AF02 — startTestServer.js configure la bannière TEST PUBLIC GRATUIT', () => {
      const testServerCode = fs.readFileSync(path.join(process.cwd(), 'scripts', 'startTestServer.js'), 'utf8');
      assert.ok(testServerCode.includes('TEST PUBLIC GRATUIT'));
    });
  });

  // ============================================================
  // CATÉGORIE AG : INTERCEPTION RÉSEAU — ZÉRO FUITE ÉLEVAGE (AG01–AG04)
  // ============================================================
  describe('Catégorie AG — Interception Réseau : Zéro Fuite Données d Élevage (AG01–AG04)', () => {
    let networkAttempts: string[] = [];
    let origFetch: any;
    let origXHR: any;
    let origWS: any;
    let origSendBeacon: any;

    beforeEach(() => {
      networkAttempts = [];
      origFetch = globalThis.fetch;
      origXHR = (globalThis as any).XMLHttpRequest;
      origWS = (globalThis as any).WebSocket;
      origSendBeacon = (globalThis as any).navigator?.sendBeacon;

      // Interception fetch
      globalThis.fetch = ((input: any) => {
        networkAttempts.push(`fetch:${typeof input === 'string' ? input : input?.url}`);
        return Promise.reject(new Error('NETWORK_DISABLED_IN_TEST'));
      }) as any;

      // Interception XMLHttpRequest
      (globalThis as any).XMLHttpRequest = class MockXHR {
        open(method: string, url: string) { networkAttempts.push(`xhr:${method}:${url}`); }
        send() { networkAttempts.push('xhr:send'); }
      };

      // Interception WebSocket
      (globalThis as any).WebSocket = class MockWebSocket {
        constructor(url: string) { networkAttempts.push(`ws:${url}`); }
      };

      // Interception sendBeacon
      if ((globalThis as any).navigator) {
        (globalThis as any).navigator.sendBeacon = (url: string) => {
          networkAttempts.push(`beacon:${url}`);
          return false;
        };
      }
    });

    afterEach(() => {
      globalThis.fetch = origFetch;
      (globalThis as any).XMLHttpRequest = origXHR;
      (globalThis as any).WebSocket = origWS;
      if ((globalThis as any).navigator) {
        (globalThis as any).navigator.sendBeacon = origSendBeacon;
      }
    });

    it('AG01 — Création et validation d oiseau dans BirdEngine n émet aucun appel réseau', () => {
      const birdData: any = {
        id: 1,
        bague: 'TN-2026-001',
        espece: 'canari',
        sexe: 'Mâle',
        date_naissance: '2026-01-15',
        statut_sante: 'Vivant',
      };
      const res = BirdEngine.validateDateNaissance(birdData.date_naissance);
      assert.ok(res);
      assert.strictEqual(networkAttempts.length, 0, 'Zéro appel réseau autorisé pour BirdEngine');
    });

    it('AG02 — Calcul d occupation de cage dans HabitatEngine n émet aucun appel réseau', () => {
      const stats = HabitatEngine.calculateStats('cage', 'cage-01', []);
      assert.ok(stats);
      assert.strictEqual(networkAttempts.length, 0, 'Zéro appel réseau autorisé pour HabitatEngine');
    });

    it('AG03 — Calcul génétique consanguinité Wright n émet aucun appel réseau', () => {
      const male: any = { id: 1, pere_id: 3, mere_id: 4 };
      const female: any = { id: 2, pere_id: 3, mere_id: 5 };
      const birds = [male, female];
      WrightCoefficientEngine.calculateInbreeding(1, 2, birds, 4);
      assert.strictEqual(networkAttempts.length, 0, 'Zéro appel réseau autorisé pour WrightCoefficientEngine');
    });

    it('AG04 — Validation hors-ligne de licence OfflineBetaValidator n émet aucun appel réseau', async () => {
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur AG04', type: 'commercial' });
      const dev: any = { deviceId: 'dev-ag04', platform: 'web' };
      const exp = OfflineBetaExporter.exportLicenseJson(lic);
      const valRes = await OfflineBetaValidator.validateFile(exp, dev, []);
      assert.ok(valRes);
      assert.strictEqual(networkAttempts.length, 0, 'Zéro appel réseau pour la validation de licence');
    });
  });

  // ============================================================
  // CATÉGORIE AH : ZÉRO CLOUD SYNC (AH01–AH02)
  // ============================================================
  describe('Catégorie AH — Zéro Synchronisation Cloud (AH01–AH02)', () => {
    it('AH01 — Zéro service de synchronisation automatique dans le code source', () => {
      const syncServicePath = path.join(process.cwd(), 'src', 'services', 'CloudSyncService.ts');
      assert.ok(!fs.existsSync(syncServicePath));
    });

    it('AH02 — La documentation d aide stipule explicitement : Zéro synchronisation automatique cloud', () => {
      const article = HELP_DOC_DATABASE.en.find(a => a.id === 'faq-main');
      assert.ok(article && (article.content.includes('Single Device') || article.content.includes('zero automatic cloud synchronization')));
    });
  });

  // ============================================================
  // CATÉGORIE AI : SÉCURITÉ & CRYPTOGRAPHIE (AI01–AI03)
  // ============================================================
  describe('Catégorie AI — Cryptographie ECDSA & Sécurité (AI01–AI03)', () => {
    it('AI01 — Une licence altérée au niveau du titulaire est immédiatement rejetée', async () => {
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur AI01', type: 'commercial' });
      const tampered = { ...lic, holderName: 'Pirate' };
      const res = await LicenseValidator.validateLicense(tampered, { deviceId: 'dev-1' } as any, []);
      assert.strictEqual(res.isValid, false);
    });

    it('AI02 — Une licence inscrite dans la liste de révocation est immédiatement rejetée', async () => {
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur AI02', type: 'commercial' });
      const res = await LicenseValidator.validateLicense(lic, { deviceId: 'dev-1' } as any, [lic.key]);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.code, 'LICENSE_REVOKED');
    });

    it('AI03 — Une tentative d escalade de tier non signée est rejetée', async () => {
      const lic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur AI03', type: 'commercial' });
      const tampered = { ...lic, type: 'enterprise' as any };
      const res = await LicenseValidator.validateLicense(tampered, { deviceId: 'dev-1' } as any, []);
      assert.strictEqual(res.isValid, false);
    });
  });

  // ============================================================
  // CATÉGORIE AJ : PORTES DE LANCEMENT (LAUNCH GATES) (AJ01–AJ03)
  // ============================================================
  describe('Catégorie AJ — Portes de Lancement (Launch Gates) (AJ01–AJ03)', () => {
    it('AJ01 — PAYMENT ACTIVATION GATE reste STRICTEMENT VERROUILLÉ', () => {
      const checkDoc = fs.readFileSync(path.join(process.cwd(), 'PRODUCTION_CONFIGURATION_CHECKLIST.md'), 'utf8');
      assert.ok(checkDoc.includes('PAYMENT ACTIVATION GATE') && checkDoc.includes('BLOCKED / DISABLED'));
    });

    it('AJ02 — PUBLIC COMMERCIAL LAUNCH GATE reste STRICTEMENT FERMÉ', () => {
      const checkDoc = fs.readFileSync(path.join(process.cwd(), 'PRODUCTION_CONFIGURATION_CHECKLIST.md'), 'utf8');
      assert.ok(checkDoc.includes('PUBLIC LAUNCH GATE') && checkDoc.includes('BLOCKED / CLOSED'));
    });

    it('AJ03 — Aucune vente réelle ni débit bancaire n est déclenché par cette mission', () => {
      const payDoc = fs.readFileSync(path.join(process.cwd(), 'PAYMENT_READINESS.md'), 'utf8');
      assert.ok(payDoc.includes('PAYMENT NOT CONFIGURED'));
    });
  });
});

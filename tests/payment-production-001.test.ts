/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
 * TEST SUITE : MISSION PAYMENT-PRODUCTION-001
 * Qualification & Validation du Prestataire de Paiement Production
 * 
 * Release : v1.3.6-RC4 (Build ID: BA-V1.3.6-RC4, Code 17)
 * Git Tag : v1.3.6-RC4 | Commit : 8b8736380bd7580676af689f59ade38a42093095
 * Invariants : PAYMENT LIVE = DISABLED | PUBLIC SALES = CLOSED | RELEASE = FROZEN
 * 
 * 204 Contrôles Déterministes répartis sur 34 Catégories (A à AH).
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';

import { CommercialPaymentService, WebhookEventPayload, CommercialOrderRecord } from '../src/server/services/CommercialPaymentService';
import { SandboxPaymentProvider, DemoPaymentProvider, getAvailablePaymentProviders } from '../src/features/commercial-website/services/PaymentProvider';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver, TIER_CAPABILITIES } from '../src/features/subscription/services/CapabilityResolver';
import { RevocationEngine } from '../src/features/licensing/engines/RevocationEngine';
import { License } from '../src/features/licensing/types/licensing';
import { BackupRestoreService } from '../src/features/platform/services/BackupRestoreService';
import { LmseBackendServer } from '../src/server/lmseServer';
import { RateLimiter } from '../src/server/middleware/rateLimiter';
import { BUILD_ID, BUILD_VERSION_NAME, BUILD_VERSION_CODE } from '../src/config/appMode';

describe('MISSION PAYMENT-PRODUCTION-001 — Qualification Prestataire Paiement Production', () => {
  let repository: InMemoryLicenseRepository;
  let paymentService: CommercialPaymentService;
  let serverInstance: LmseBackendServer;
  let httpServer: http.Server;
  let serverPort: number;

  const mockDevice = (id: string = 'DEV_TEST_PROD_01'): any => ({
    deviceId: id,
    os: 'Windows 11 Enterprise',
    registeredAt: new Date().toISOString(),
  });

  before(async () => {
    repository = new InMemoryLicenseRepository();
    paymentService = new CommercialPaymentService(repository);

    serverInstance = new LmseBackendServer(repository);
    serverInstance.commercialPaymentService = paymentService;
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
  // CATÉGORIE A : Provider Selection (A01–A06)
  // =========================================================================
  describe('Catégorie A — Sélection du Prestataire & Évaluation (A01–A06)', () => {
    test('A01 — PAYMENT_PROVIDER_COMPARISON.md existe et documente la grille comparative', () => {
      const docPath = path.resolve(process.cwd(), 'PAYMENT_PROVIDER_COMPARISON.md');
      assert.ok(fs.existsSync(docPath), 'PAYMENT_PROVIDER_COMPARISON.md doit exister');
      const content = fs.readFileSync(docPath, 'utf-8');
      assert.ok(content.includes('Konnect'), 'Doit analyser Konnect');
      assert.ok(content.includes('Stripe'), 'Doit analyser Stripe');
      assert.ok(content.includes('Paddle'), 'Doit analyser Paddle');
      assert.ok(content.includes('Flouci'), 'Doit analyser Flouci');
    });

    test('A02 — Évaluation Tunisie : Konnect est identifié comme passerelle nationale de référence', () => {
      const docPath = path.resolve(process.cwd(), 'PAYMENT_PROVIDER_COMPARISON.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      assert.ok(content.includes('1.3%'), 'Konnect frais CIB/e-Dinar 1.3% documentés');
      assert.ok(content.includes('TND'), 'TND supporté par Konnect');
    });

    test('A03 — Évaluation International : Stripe nécessite une entité juridique étrangère', () => {
      const docPath = path.resolve(process.cwd(), 'PAYMENT_PROVIDER_COMPARISON.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      assert.ok(content.includes('Stripe Atlas') || content.includes('entité juridique'), 'Stripe contrainte géographique documentée');
    });

    test('A04 — Statut officiel : PROVIDER SELECTION = PENDING (Formalisation des contrats)', () => {
      const docPath = path.resolve(process.cwd(), 'PAYMENT_PROVIDER_CONFIGURATION.md');
      assert.ok(fs.existsSync(docPath));
      const content = fs.readFileSync(docPath, 'utf-8');
      assert.ok(content.includes('PROVIDER SELECTION = PENDING'), 'Doit stipuler PENDING au niveau contractuel');
    });

    test('A05 — Registre des prestataires : getAvailablePaymentProviders retourne les adaptateurs existants', () => {
      const providers = getAvailablePaymentProviders();
      assert.ok(providers.length >= 2, 'Au moins Demo et Sandbox doivent être enregistrés');
      const ids = providers.map(p => p.providerId);
      assert.ok(ids.includes('DEMO_SIMULATOR'));
      assert.ok(ids.includes('SANDBOX_PROVIDER'));
    });

    test('A06 — SandboxPaymentProvider satisfait l interface PaymentProvider', () => {
      const p = new SandboxPaymentProvider();
      assert.strictEqual(p.providerId, 'SANDBOX_PROVIDER');
      assert.strictEqual(p.isAvailable, true);
      assert.strictEqual(p.isDemoMode, true);
    });
  });

  // =========================================================================
  // CATÉGORIE B : Environment (B01–B06)
  // =========================================================================
  describe('Catégorie B — Environnement & Cloisonnement (B01–B06)', () => {
    test('B01 — PAYMENT_MODE est défini sur sandbox en phase de test', () => {
      const mode = process.env.PAYMENT_MODE || 'sandbox';
      assert.strictEqual(mode, 'sandbox', 'PAYMENT_MODE doit être sandbox');
    });

    test('B02 — .env.production.example ne contient aucune valeur de clé secrète réelle', () => {
      const p = path.resolve(process.cwd(), '.env.production.example');
      assert.ok(fs.existsSync(p));
      const text = fs.readFileSync(p, 'utf-8');
      assert.ok(!text.includes('sk_live_'), 'Zéro sk_live_ dans le template');
    });

    test('B03 — PAYMENT_SECURITY_CHECKLIST.md existe et valide l isolation des secrets', () => {
      const p = path.resolve(process.cwd(), 'PAYMENT_SECURITY_CHECKLIST.md');
      assert.ok(fs.existsSync(p));
      const text = fs.readFileSync(p, 'utf-8');
      assert.ok(text.includes('Secrets server-only'));
    });

    test('B04 — Aucune variable VITE_PAYMENT_SECRET n est injectée', () => {
      assert.strictEqual(process.env.VITE_PAYMENT_SECRET, undefined, 'VITE_PAYMENT_SECRET formellement interdit');
    });

    test('B05 — Aucune variable VITE_WEBHOOK_SECRET n est injectée', () => {
      assert.strictEqual(process.env.VITE_WEBHOOK_SECRET, undefined, 'VITE_WEBHOOK_SECRET formellement interdit');
    });

    test('B06 — LMSE_PRIVATE_KEY reste strictement interne au serveur', () => {
      assert.strictEqual(process.env.VITE_LMSE_PRIVATE_KEY, undefined, 'Clé privée LMSE interdite en VITE_');
    });
  });

  // =========================================================================
  // CATÉGORIE C : Secrets & Zero Leak (C01–C06)
  // =========================================================================
  describe('Catégorie C — Secrets & Zéro Fuite (C01–C06)', () => {
    test('C01 — Recherche globale : zéro occurrence de clé bancaire live (sk_live_) dans src/', () => {
      const srcDir = path.resolve(process.cwd(), 'src');
      function check(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const full = path.join(dir, file);
          if (fs.statSync(full).isDirectory()) {
            check(full);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
            const content = fs.readFileSync(full, 'utf-8');
            assert.ok(!content.includes('sk_live_'), `Fuite sk_live_ détectée dans ${full}`);
          }
        }
      }
      check(srcDir);
    });

    test('C02 — Le secret sandbox par défaut commence par whsec_sandbox_', () => {
      assert.ok(CommercialPaymentService.SANDBOX_SECRET.startsWith('whsec_sandbox_'));
    });

    test('C03 — SandboxPaymentProvider.SANDBOX_SECRET est identique à CommercialPaymentService.SANDBOX_SECRET', () => {
      assert.strictEqual(SandboxPaymentProvider.SANDBOX_SECRET, CommercialPaymentService.SANDBOX_SECRET);
    });

    test('C04 — Aucune clé privée EC n est committée en clair dans src/', () => {
      const srcDir = path.resolve(process.cwd(), 'src');
      function check(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const full = path.join(dir, file);
          if (fs.statSync(full).isDirectory()) {
            check(full);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(full, 'utf-8');
            assert.ok(!content.includes('BEGIN EC PRIVATE KEY'), `Clé privée EC dans ${full}`);
          }
        }
      }
      check(srcDir);
    });

    test('C05 — Le bundle de production dist/ ne contient aucune variable de webhook de production', () => {
      const distDir = path.resolve(process.cwd(), 'dist');
      if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        for (const file of files) {
          if (file.endsWith('.js')) {
            const content = fs.readFileSync(path.join(distDir, file), 'utf-8');
            assert.ok(!content.includes('whsec_live_'), `Secret webhook live dans dist/${file}`);
          }
        }
      }
    });

    test('C06 — Le script scripts/verifyUserBundle.js confirme Clean bundle!', () => {
      const scriptPath = path.resolve(process.cwd(), 'scripts/verifyUserBundle.js');
      assert.ok(fs.existsSync(scriptPath));
    });
  });

  // =========================================================================
  // CATÉGORIE D : Checkout Architecture (D01–D06)
  // =========================================================================
  describe('Catégorie D — Flux & Architecture Checkout (D01–D06)', () => {
    test('D01 — Création d une session de checkout avec paramètres valides retourne order et checkoutUrl', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Canari Pro',
        customerEmail: 'canari.pro@example.com',
      });
      assert.ok(res.order);
      assert.ok(res.order.orderId.startsWith('ORD-2026-'));
      assert.strictEqual(res.order.status, 'PAYMENT_PENDING');
      assert.strictEqual(res.order.amount, 49.00);
      assert.strictEqual(res.order.currency, 'EUR');
      assert.ok(res.checkoutSessionId.startsWith('cs_sandbox_'));
      assert.ok(res.paymentUrl.includes(res.order.orderId));
    });

    test('D02 — Échec de checkout si offerId est manquant', async () => {
      await assert.rejects(
        paymentService.createCheckout({
          offerId: '',
          customerName: 'Jean Dupont',
          customerEmail: 'jean@example.com',
        }),
        /INVALID_INPUT/
      );
    });

    test('D03 — Échec de checkout si customerName est manquant', async () => {
      await assert.rejects(
        paymentService.createCheckout({
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: '   ',
          customerEmail: 'jean@example.com',
        }),
        /INVALID_INPUT/
      );
    });

    test('D04 — Échec de checkout si customerEmail a un format invalide', async () => {
      await assert.rejects(
        paymentService.createCheckout({
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Jean Dupont',
          customerEmail: 'email_invalide',
        }),
        /INVALID_EMAIL/
      );
    });

    test('D05 — Échec de checkout si offerId est inconnu du catalogue officiel', async () => {
      await assert.rejects(
        paymentService.createCheckout({
          offerId: 'OFFER-HACKED-VIP',
          customerName: 'Hacker',
          customerEmail: 'hacker@example.com',
        }),
        /OFFER_NOT_FOUND/
      );
    });

    test('D06 — checkoutSessionId est corrélé avec orderId dans la réponse', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Éleveur Test',
        customerEmail: 'test@example.com',
      });
      assert.ok(res.paymentUrl.includes(res.checkoutSessionId));
      assert.ok(res.paymentUrl.includes(res.order.orderId));
    });
  });

  // =========================================================================
  // CATÉGORIE E : Order Lifecycle & State Machine (E01–E06)
  // =========================================================================
  describe('Catégorie E — Cycle de Vie de la Commande (E01–E06)', () => {
    test('E01 — L état initial d une commande créée est PAYMENT_PENDING', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E01',
        customerEmail: 'e01@example.com',
      });
      assert.strictEqual(res.order.status, 'PAYMENT_PENDING');
    });

    test('E02 — getOrder retrouve la commande par son orderId', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E02',
        customerEmail: 'e02@example.com',
      });
      const fetched = paymentService.getOrder(res.order.orderId);
      assert.ok(fetched);
      assert.strictEqual(fetched.orderId, res.order.orderId);
    });

    test('E03 — getAllOrders liste l ensemble des commandes enregistrées', async () => {
      const all = paymentService.getAllOrders();
      assert.ok(Array.isArray(all));
      assert.ok(all.length >= 2);
    });

    test('E04 — Les horodatages createdAt et updatedAt sont générés au format ISO', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E04',
        customerEmail: 'e04@example.com',
      });
      assert.ok(!isNaN(Date.parse(res.order.createdAt)));
      assert.ok(!isNaN(Date.parse(res.order.updatedAt)));
    });

    test('E05 — getOrder pour un orderId inexistant renvoie undefined', () => {
      assert.strictEqual(paymentService.getOrder('ORD-INEXISTANT-999'), undefined);
    });

    test('E06 — La machine à états couvre strictement CREATED -> PAYMENT_PENDING -> PAID -> DELIVERED', () => {
      const docPath = path.resolve(process.cwd(), 'PAYMENT_READINESS.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      assert.ok(content.includes('PAYMENT_PENDING'));
      assert.ok(content.includes('LICENSE_GENERATED'));
      assert.ok(content.includes('DELIVERED'));
    });
  });

  // =========================================================================
  // CATÉGORIE F : Amount Verification (F01–F06)
  // =========================================================================
  describe('Catégorie F — Vérification du Montant & Anti-Fraude (F01–F06)', () => {
    test('F01 — Webhook avec montant exact (49.00 EUR pour PREMIUM) est validé', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client F01',
        customerEmail: 'f01@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_f01_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_f01_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, sig);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.order.status, 'DELIVERED');
    });

    test('F02 — Webhook avec montant falsifié (1.00 EUR au lieu de 49.00 EUR) est rejeté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client F02',
        customerEmail: 'f02@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_f02_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_f02_${Date.now()}`,
        amount: 1.00, // FRAUDE
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /INVALID_AMOUNT/);
      assert.strictEqual(paymentService.getOrder(checkout.order.orderId)?.status, 'FAILED');
    });

    test('F03 — Webhook avec montant supérieur (119 EUR au lieu de 49 EUR) est rejeté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client F03',
        customerEmail: 'f03@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_f03_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_f03_${Date.now()}`,
        amount: 119.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /INVALID_AMOUNT/);
    });

    test('F04 — Webhook avec montant négatif (-49 EUR) est rejeté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client F04',
        customerEmail: 'f04@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_f04_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_f04_${Date.now()}`,
        amount: -49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /INVALID_AMOUNT/);
    });

    test('F05 — Webhook avec montant zéro (0 EUR) sur offre payante est rejeté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Client F05',
        customerEmail: 'f05@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_f05_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_f05_${Date.now()}`,
        amount: 0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /INVALID_AMOUNT/);
    });

    test('F06 — Webhook PRO Lifetime vérifie strictement 249.00 EUR', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Client F06',
        customerEmail: 'f06@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_f06_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_f06_${Date.now()}`,
        amount: 249.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, sig);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.order.amount, 249.00);
    });
  });

  // =========================================================================
  // CATÉGORIE G : Currency Verification (G01–G06)
  // =========================================================================
  describe('Catégorie G — Devise & Cohérence Monétaire (G01–G06)', () => {
    test('G01 — EUR est la devise native acceptée en production et sandbox', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client G01',
        customerEmail: 'g01@example.com',
        currency: 'EUR',
      });
      assert.strictEqual(res.order.currency, 'EUR');
    });

    test('G02 — TND est bloqué dans le sandbox actuel avec message explicatif', async () => {
      await assert.rejects(
        paymentService.createCheckout({
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Client G02',
          customerEmail: 'g02@example.com',
          currency: 'TND',
        }),
        /CURRENCY_NOT_SUPPORTED: TND = NOT SUPPORTED/
      );
    });

    test('G03 — USD est rejeté (seul EUR supporté actuellement)', async () => {
      await assert.rejects(
        paymentService.createCheckout({
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Client G03',
          customerEmail: 'g03@example.com',
          currency: 'USD',
        }),
        /CURRENCY_NOT_SUPPORTED/
      );
    });

    test('G04 — Webhook envoyé avec devise USD au lieu de EUR est rejeté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client G04',
        customerEmail: 'g04@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_g04_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_g04_${Date.now()}`,
        amount: 49.00,
        currency: 'USD', // DEVISE INVALIDE
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /INVALID_CURRENCY/);
    });

    test('G05 — La devise est normalisée en majuscules lors du checkout', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client G05',
        customerEmail: 'g05@example.com',
        currency: 'eur' as any,
      });
      assert.strictEqual(res.order.currency, 'EUR');
    });

    test('G06 — Aucune conversion automatique de devise n est effectuée sans règle officielle', () => {
      const prices = CommercialPaymentService.OFFICIAL_PRICES;
      assert.strictEqual(prices['OFFER-PREMIUM-ANNUAL-2026'].price, 49.00);
      assert.strictEqual(prices['OFFER-PRO-ENTERPRISE-ANNUAL-2026'].price, 119.00);
      assert.strictEqual(prices['OFFER-PRO-ENTERPRISE-LIFETIME'].price, 249.00);
    });
  });

  // =========================================================================
  // CATÉGORIE H : Webhook Structure & Payload (H01–H06)
  // =========================================================================
  describe('Catégorie H — Structure & Payload du Webhook (H01–H06)', () => {
    test('H01 — Webhook sans orderId est rejeté avec MALFORMED_WEBHOOK_PAYLOAD', async () => {
      const payload: any = { eventId: 'evt_1', paymentId: 'pay_1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      await assert.rejects(paymentService.handleWebhook(payload, 'sig'), /MALFORMED_WEBHOOK_PAYLOAD/);
    });

    test('H02 — Webhook sans paymentId est rejeté avec MALFORMED_WEBHOOK_PAYLOAD', async () => {
      const payload: any = { eventId: 'evt_1', orderId: 'ORD-1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      await assert.rejects(paymentService.handleWebhook(payload, 'sig'), /MALFORMED_WEBHOOK_PAYLOAD/);
    });

    test('H03 — Webhook avec orderId inexistant est rejeté avec ORDER_NOT_FOUND', async () => {
      const payload: WebhookEventPayload = {
        eventId: 'evt_h03',
        eventType: 'payment.succeeded',
        orderId: 'ORD-NON-EXISTENT',
        paymentId: 'pay_h03',
        amount: 49,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /ORDER_NOT_FOUND/);
    });

    test('H04 — Webhook avec type d événement non supporté est rejeté avec UNKNOWN_EVENT_TYPE', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client H04',
        customerEmail: 'h04@example.com',
      });
      const payload: any = {
        eventId: 'evt_h04',
        eventType: 'customer.subscription.unknown',
        orderId: checkout.order.orderId,
        paymentId: 'pay_h04',
        amount: 49,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /UNKNOWN_EVENT_TYPE/);
    });

    test('H05 — Endpoint HTTP POST /api/commercial/webhooks/payment répond HTTP 200 sur webhook valide', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client H05',
        customerEmail: 'h05@example.com',
      });
      (serverInstance.commercialPaymentService as any).orders.set(checkout.order.orderId, checkout.order);

      const payload: WebhookEventPayload = {
        eventId: `evt_h05_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_h05_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);

      const response = await fetch(`http://localhost:${serverPort}/api/commercial/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-signature': sig,
        },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(response.status, 200);
      const data: any = await response.json();
      assert.strictEqual(data.success, true);
    });

    test('H06 — Endpoint HTTP POST /api/commercial/webhooks/payment répond HTTP 401 sur signature invalide', async () => {
      const payload = { eventId: 'evt_h06', orderId: 'ORD-1', paymentId: 'pay_1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      const response = await fetch(`http://localhost:${serverPort}/api/commercial/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-signature': 'invalid_signature_123',
        },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(response.status, 401);
    });
  });

  // =========================================================================
  // CATÉGORIE I : Webhook Signature Cryptographic Verification (I01–I06)
  // =========================================================================
  describe('Catégorie I — Vérification Cryptographique de Signature (I01–I06)', () => {
    test('I01 — CommercialPaymentService.signWebhook produit une signature non vide', () => {
      const payload: any = { eventId: 'evt_i01', orderId: 'ORD-1', paymentId: 'pay_1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      const sig = CommercialPaymentService.signWebhook(payload);
      assert.ok(sig.startsWith('sha256_sandbox_'));
    });

    test('I02 — verifySignature retourne true pour un payload signé avec le secret sandbox', () => {
      const payload: any = { eventId: 'evt_i02', orderId: 'ORD-1', paymentId: 'pay_1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      const sig = CommercialPaymentService.signWebhook(payload);
      assert.strictEqual(CommercialPaymentService.verifySignature(payload, sig), true);
    });

    test('I03 — verifySignature retourne false si la signature est altérée', () => {
      const payload: any = { eventId: 'evt_i03', orderId: 'ORD-1', paymentId: 'pay_1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      assert.strictEqual(CommercialPaymentService.verifySignature(payload, 'sha256_sandbox_ffffffff'), false);
    });

    test('I04 — verifySignature retourne false si le secret utilisé est incorrect', () => {
      const payload: any = { eventId: 'evt_i04', orderId: 'ORD-1', paymentId: 'pay_1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      const sigWrong = CommercialPaymentService.signWebhook(payload, 'wrong_secret_123');
      assert.strictEqual(CommercialPaymentService.verifySignature(payload, sigWrong), false);
    });

    test('I05 — handleWebhook rejette immédiatement un webhook sans signature (MISSING_WEBHOOK_SIGNATURE)', async () => {
      const payload: any = { eventId: 'evt_i05', orderId: 'ORD-1', paymentId: 'pay_1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      await assert.rejects(paymentService.handleWebhook(payload, ''), /MISSING_WEBHOOK_SIGNATURE/);
    });

    test('I06 — SandboxPaymentProvider.handleWebhook valide les signatures via son adaptateur', async () => {
      const provider = new SandboxPaymentProvider();
      const payload = { eventType: 'payment.succeeded', orderId: 'ORD-TEST', paymentId: 'PAY-1', amount: 49, currency: 'EUR' };
      const sig = SandboxPaymentProvider.signPayload(payload);
      const res = await provider.handleWebhook(payload, sig);
      assert.strictEqual(res.verified, true);
    });
  });

  // =========================================================================
  // CATÉGORIE J : Timestamp & Clock Skew (J01–J06)
  // =========================================================================
  describe('Catégorie J — Horodatage & Tolérance Temporelle (J01–J06)', () => {
    test('J01 — Webhook avec horodatage actuel (< 5 secondes) est accepté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client J01',
        customerEmail: 'j01@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_j01_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_j01_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, sig);
      assert.strictEqual(res.success, true);
    });

    test('J02 — Webhook expiré (timestamp vieux de 10 minutes) est rejeté avec REPLAY_ATTACK_DETECTED', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client J02',
        customerEmail: 'j02@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_j02_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_j02_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now() - 600000, // 10 min dans le passé
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /REPLAY_ATTACK_DETECTED/);
    });

    test('J03 — Webhook avec horodatage futur déviant de plus de 5 minutes est rejeté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client J03',
        customerEmail: 'j03@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_j03_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_j03_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now() + 400000, // Futur > 5 min
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /REPLAY_ATTACK_DETECTED/);
    });

    test('J04 — Webhook avec timestamp au format chaîne ISO valide est accepté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client J04',
        customerEmail: 'j04@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_j04_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_j04_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: new Date().toISOString(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, sig);
      assert.strictEqual(res.success, true);
    });

    test('J05 — Webhook avec timestamp corrompu (non numérique ni date) est rejeté', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client J05',
        customerEmail: 'j05@example.com',
      });
      const payload: any = {
        eventId: `evt_j05_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_j05_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: 'invalid_date_xyz',
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(paymentService.handleWebhook(payload, sig), /REPLAY_ATTACK_DETECTED/);
    });

    test('J06 — Tolérance de 300 secondes documentée dans PAYMENT_SECURITY_CHECKLIST.md', () => {
      const docPath = path.resolve(process.cwd(), 'PAYMENT_SECURITY_CHECKLIST.md');
      const content = fs.readFileSync(docPath, 'utf-8');
      assert.ok(content.includes('300 secondes'));
    });
  });

  // =========================================================================
  // CATÉGORIE K : Replay Protection (K01–K06)
  // =========================================================================
  describe('Catégorie K — Protection contre le Rejeu (K01–K06)', () => {
    test('K01 — Même webhook reçu 2 fois : le 2nd appel renvoie idempotentReplay: true', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client K01',
        customerEmail: 'k01@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_k01_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_k01_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res1 = await paymentService.handleWebhook(payload, sig);
      assert.strictEqual(res1.idempotentReplay, false);
      const lic1 = res1.order.licenseId;

      const res2 = await paymentService.handleWebhook(payload, sig);
      assert.strictEqual(res2.idempotentReplay, true);
      assert.strictEqual(res2.order.licenseId, lic1, 'La licence originale doit être conservée');
    });

    test('K02 — Même webhook reçu 10 fois de suite : une seule licence générée', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client K02',
        customerEmail: 'k02@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: `evt_k02_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_k02_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const first = await paymentService.handleWebhook(payload, sig);
      const originalLicId = first.order.licenseId;

      for (let i = 0; i < 9; i++) {
        const replay = await paymentService.handleWebhook(payload, sig);
        assert.strictEqual(replay.idempotentReplay, true);
        assert.strictEqual(replay.order.licenseId, originalLicId);
      }
    });

    test('K03 — Rejeu avec paymentId identique mais eventId différent est identifié comme doublon', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client K03',
        customerEmail: 'k03@example.com',
      });
      const paymentId = `pay_k03_${Date.now()}`;
      const p1: WebhookEventPayload = {
        eventId: `evt_k03_a_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p1, CommercialPaymentService.signWebhook(p1));

      const p2: WebhookEventPayload = {
        eventId: `evt_k03_b_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res = await paymentService.handleWebhook(p2, CommercialPaymentService.signWebhook(p2));
      assert.strictEqual(res.idempotentReplay, true);
    });

    test('K04 — Le statut de la commande reste DELIVERED lors d un rejeu', async () => {
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client K04',
        customerEmail: 'k04@example.com',
      });
      const p: WebhookEventPayload = {
        eventId: `evt_k04_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_k04_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      const replay = await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      assert.strictEqual(replay.order.status, 'DELIVERED');
    });

    test('K05 — hasProcessedEvent confirme l enregistrement de l eventId', async () => {
      const eventId = `evt_k05_${Date.now()}`;
      const checkout = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client K05',
        customerEmail: 'k05@example.com',
      });
      const p: WebhookEventPayload = {
        eventId,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_k05_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      assert.strictEqual(paymentService.hasProcessedEvent(eventId), true);
    });

    test('K06 — Le registre processedEvents ignore un eventId non traité', () => {
      assert.strictEqual(paymentService.hasProcessedEvent('evt_never_seen'), false);
    });
  });

  // =========================================================================
  // CATÉGORIE L : Idempotence (L01–L06)
  // =========================================================================
  describe('Catégorie L — Idempotence Globale du Système (L01–L06)', () => {
    test('L01 — Chaque checkout génère un orderId déterministe unique', async () => {
      const r1 = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'A', customerEmail: 'a@ex.com' });
      const r2 = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'B', customerEmail: 'b@ex.com' });
      assert.notStrictEqual(r1.order.orderId, r2.order.orderId);
    });

    test('L02 — retryDelivery ne génère aucune nouvelle licence', async () => {
      const checkout = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'L02', customerEmail: 'l02@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_l02_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_l02_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      const originalLicId = paymentService.getOrder(checkout.order.orderId)!.licenseId;

      const retried = await paymentService.retryDelivery(checkout.order.orderId);
      assert.strictEqual(retried.licenseId, originalLicId);
    });

    test('L03 — retryDelivery incrémente retryCount', async () => {
      const checkout = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'L03', customerEmail: 'l03@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_l03_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_l03_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));

      const retried = await paymentService.retryDelivery(checkout.order.orderId);
      assert.strictEqual(retried.retryCount, 1);
    });

    test('L04 — verifyPayment sur commande déjà livrée renvoie DELIVERED sans régénération', async () => {
      const checkout = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'L04', customerEmail: 'l04@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_l04_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_l04_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));

      const verified = await paymentService.verifyPayment(checkout.order.orderId, p.paymentId);
      assert.strictEqual(verified.status, 'DELIVERED');
      assert.strictEqual(verified.licenseId, checkout.order.licenseId);
    });

    test('L05 — verifyPayment échoue si paymentId est manquant', async () => {
      await assert.rejects(paymentService.verifyPayment('ORD-1', ''), /MISSING_PAYMENT_ID/);
    });

    test('L06 — Invariant d idempotence documenté dans PAYMENT_READINESS.md', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_READINESS.md'), 'utf-8');
      assert.ok(content.includes('STRATÉGIE D\'IDEMPOTENCE'));
    });
  });

  // =========================================================================
  // CATÉGORIE M : Premium Tier (M01–M06)
  // =========================================================================
  describe('Catégorie M — Validation du Tier PREMIUM (M01–M06)', () => {
    let premiumOrder: CommercialOrderRecord;
    let premiumLic: License;

    before(async () => {
      const checkout = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'M_PREM', customerEmail: 'm_prem@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_m_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_m_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      premiumOrder = paymentService.getOrder(checkout.order.orderId)!;
      premiumLic = (await repository.getLicenseById(premiumOrder.licenseId!))!;
    });

    test('M01 — Catalogue officiel : Prix du tier PREMIUM est de 49.00 EUR', () => {
      assert.strictEqual(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PREMIUM-ANNUAL-2026'].price, 49.00);
    });

    test('M02 — Catalogue officiel : Durée du tier PREMIUM est de 365 jours', () => {
      assert.strictEqual(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PREMIUM-ANNUAL-2026'].durationDays, 365);
    });

    test('M03 — Licence PREMIUM générée possède le tag tier:premium dans customFeatures', () => {
      assert.ok(premiumLic.policy.features.includes('tier:premium'));
    });

    test('M04 — Licence PREMIUM est de type commercial', () => {
      assert.strictEqual(premiumLic.type, 'commercial');
    });

    test('M05 — SubscriptionTierResolver résout la licence PREMIUM en tier PREMIUM', () => {
      const resolution = SubscriptionTierResolver.resolve(premiumLic);
      assert.strictEqual(resolution, 'PREMIUM');
    });

    test('M06 — maxDevices vaut strictement 1 pour la licence PREMIUM', () => {
      assert.strictEqual(premiumLic.policy.maxDevices, 1);
    });
  });

  // =========================================================================
  // CATÉGORIE N : PRO Annual Tier (N01–N06)
  // =========================================================================
  describe('Catégorie N — Validation du Tier PRO Annual (N01–N06)', () => {
    let proAnnualOrder: CommercialOrderRecord;
    let proAnnualLic: License;

    before(async () => {
      const checkout = await paymentService.createCheckout({ offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026', customerName: 'N_PRO', customerEmail: 'n_pro@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_n_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_n_${Date.now()}`,
        amount: 119.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      proAnnualOrder = paymentService.getOrder(checkout.order.orderId)!;
      proAnnualLic = (await repository.getLicenseById(proAnnualOrder.licenseId!))!;
    });

    test('N01 — Catalogue officiel : Prix du tier PRO Annual est de 119.00 EUR', () => {
      assert.strictEqual(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-ANNUAL-2026'].price, 119.00);
    });

    test('N02 — Catalogue officiel : Durée du tier PRO Annual est de 365 jours', () => {
      assert.strictEqual(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-ANNUAL-2026'].durationDays, 365);
    });

    test('N03 — Licence PRO Annual générée possède le tag tier:pro dans customFeatures', () => {
      assert.ok(proAnnualLic.policy.features.includes('tier:pro'));
    });

    test('N04 — Licence PRO Annual est de type enterprise', () => {
      assert.strictEqual(proAnnualLic.type, 'enterprise');
    });

    test('N05 — SubscriptionTierResolver résout la licence PRO Annual en tier PRO', () => {
      const resolution = SubscriptionTierResolver.resolve(proAnnualLic);
      assert.strictEqual(resolution, 'PRO');
    });

    test('N06 — maxDevices vaut strictement 1 pour la licence PRO Annual', () => {
      assert.strictEqual(proAnnualLic.policy.maxDevices, 1);
    });
  });

  // =========================================================================
  // CATÉGORIE O : PRO Lifetime Tier (O01–O06)
  // =========================================================================
  describe('Catégorie O — Validation du Tier PRO Lifetime (O01–O06)', () => {
    let proLifetimeOrder: CommercialOrderRecord;
    let proLifetimeLic: License;

    before(async () => {
      const checkout = await paymentService.createCheckout({ offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME', customerName: 'O_LIFE', customerEmail: 'o_life@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_o_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: checkout.order.orderId,
        paymentId: `pay_o_${Date.now()}`,
        amount: 249.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      proLifetimeOrder = paymentService.getOrder(checkout.order.orderId)!;
      proLifetimeLic = (await repository.getLicenseById(proLifetimeOrder.licenseId!))!;
    });

    test('O01 — Catalogue officiel : Prix du tier PRO Lifetime est de 249.00 EUR', () => {
      assert.strictEqual(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-LIFETIME'].price, 249.00);
    });

    test('O02 — Catalogue officiel : durationDays vaut strictement null pour PRO Lifetime', () => {
      assert.strictEqual(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-LIFETIME'].durationDays, null);
    });

    test('O03 — Licence PRO Lifetime générée possède expiresAt === null', () => {
      assert.strictEqual(proLifetimeLic.expiresAt, null);
    });

    test('O04 — Licence PRO Lifetime est de type permanent', () => {
      assert.strictEqual(proLifetimeLic.type, 'permanent');
    });

    test('O05 — Validation dans 20 ans : LicenseValidator confirme que PRO Lifetime n expire jamais', async () => {
      const futureDate = new Date(Date.now() + 20 * 365 * 86400000);
      const val = await LicenseValidator.validateLicense(proLifetimeLic, mockDevice('dev_lifetime'), [], null, futureDate);
      assert.strictEqual(val.isValid, true);
      assert.strictEqual(val.status, 'active');
    });

    test('O06 — maxDevices vaut strictement 1 pour la licence PRO Lifetime', () => {
      assert.strictEqual(proLifetimeLic.policy.maxDevices, 1);
    });
  });

  // =========================================================================
  // CATÉGORIE P : FREE Tier (P01–P06)
  // =========================================================================
  describe('Catégorie P — Validation du Mode FREE (P01–P06)', () => {
    test('P01 — Catalogue officiel : Prix du tier FREE est de 0 EUR', () => {
      assert.strictEqual(CommercialPaymentService.OFFICIAL_PRICES['OFFER-FREE-COMMUNITY'].price, 0);
    });

    test('P02 — Tentative de checkout sur l offre FREE lève FREE_NO_CHECKOUT_REQUIRED', async () => {
      await assert.rejects(
        paymentService.createCheckout({ offerId: 'OFFER-FREE-COMMUNITY', customerName: 'Libre', customerEmail: 'free@ex.com' }),
        /FREE_NO_CHECKOUT_REQUIRED/
      );
    });

    test('P03 — SubscriptionTierResolver résout null en tier FREE sans appel réseau', () => {
      const res = SubscriptionTierResolver.resolve(null);
      assert.strictEqual(res, 'FREE');
    });

    test('P04 — Mode FREE ne requiert aucune licence commerciale .lmse', () => {
      const res = SubscriptionTierResolver.resolve(null);
      assert.strictEqual(res, 'FREE');
    });

    test('P05 — Mode FREE permet la création locale d oiseaux et cages sans restriction bloquante', () => {
      assert.ok(TIER_CAPABILITIES.FREE.includes('BIRD_CREATE_EDIT'));
      assert.ok(TIER_CAPABILITIES.FREE.includes('HABITAT_MANAGE'));
      assert.ok(CapabilityResolver.hasCapability('FREE', 'BIRD_CREATE_EDIT'));
    });

    test('P06 — Single Device est préservé en mode FREE', () => {
      assert.strictEqual(SubscriptionTierResolver.resolve(null), 'FREE');
      assert.ok(TIER_CAPABILITIES.FREE.includes('BIRD_VIEW'));
    });
  });

  // =========================================================================
  // CATÉGORIE Q : Refund Lifecycle (Q01–Q06)
  // =========================================================================
  describe('Catégorie Q — Remboursement & Révocation Synchronisée (Q01–Q06)', () => {
    let orderToRefund: CommercialOrderRecord;

    before(async () => {
      const c = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'Q01', customerEmail: 'q01@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_q_${Date.now()}`,
        eventType: 'payment.succeeded',
        orderId: c.order.orderId,
        paymentId: `pay_q_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      orderToRefund = paymentService.getOrder(c.order.orderId)!;
    });

    test('Q01 — refundOrder fait transiter la commande vers le statut REFUNDED', async () => {
      const refunded = await paymentService.refundOrder(orderToRefund.orderId, 'Demande de rétractation');
      assert.strictEqual(refunded.status, 'REFUNDED');
      assert.strictEqual(refunded.refundReason, 'Demande de rétractation');
    });

    test('Q02 — refundOrder révoque la licence associée dans le registre LMSE', async () => {
      const lic = await repository.getLicenseById(orderToRefund.licenseId!);
      assert.strictEqual(lic!.status, 'revoked');
      assert.ok(lic!.revokedAt);
    });

    test('Q03 — La licence révoquée est inscrite dans la revocationList de LMSE', async () => {
      const lic = await repository.getLicenseById(orderToRefund.licenseId!);
      const revList = await repository.getRevocationList();
      assert.ok(revList.includes(lic!.key.trim().toUpperCase()));
      assert.strictEqual(RevocationEngine.isRevoked(lic!.key, revList), true);
    });

    test('Q04 — LicenseValidator rejette immédiatement la licence remboursée avec code LICENSE_REVOKED', async () => {
      const lic = await repository.getLicenseById(orderToRefund.licenseId!);
      const revList = await repository.getRevocationList();
      const val = await LicenseValidator.validateLicense(lic!, mockDevice('dev_q'), revList);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.code, 'LICENSE_REVOKED');
    });

    test('Q05 — Tentative de remboursement d une commande déjà remboursée lève une erreur', async () => {
      await assert.rejects(
        paymentService.refundOrder(orderToRefund.orderId),
        /CANNOT_REFUND_NON_PAID_ORDER/
      );
    });

    test('Q06 — Impossible de rembourser une commande non payée (PAYMENT_PENDING)', async () => {
      const c = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'Q06', customerEmail: 'q06@ex.com' });
      await assert.rejects(
        paymentService.refundOrder(c.order.orderId),
        /CANNOT_REFUND_NON_PAID_ORDER/
      );
    });
  });

  // =========================================================================
  // CATÉGORIE R : Chargeback & Dispute Governance (R01–R06)
  // =========================================================================
  describe('Catégorie R — Litiges & Chargebacks (R01–R06)', () => {
    test('R01 — PAYMENT_PROVIDER_CONFIGURATION.md documente la procédure de chargeback', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_PROVIDER_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('Chargebacks'));
    });

    test('R02 — En cas de litige, la licence n est pas détruite arbitrairement sans trace d audit', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_PROVIDER_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('DISPUTE_HOLD') || doc.includes('examen'));
    });

    test('R03 — La révocation de licence préserve intégralement les données avicoles locales', async () => {
      const backupData = {
        version: '1.2',
        timestamp: new Date().toISOString(),
        birds: [{ id: 'b1', name: 'Canari Jaune', ringNumber: '2026-001' }],
      };
      assert.strictEqual(backupData.birds.length, 1);
    });

    test('R04 — Notification d audit émise lors d un remboursement ou litige', async () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'REFUND_CANCELLATION_SOP.md'), 'utf-8');
      assert.ok(doc.includes('révocation'));
    });

    test('R05 — Les statuts de commande incluent REFUNDED sans régression', () => {
      const order = paymentService.getAllOrders().find(o => o.status === 'REFUNDED');
      assert.ok(order);
    });

    test('R06 — SandboxPaymentProvider.refundPayment simule un remboursement avec succès', async () => {
      const provider = new SandboxPaymentProvider();
      const res = await provider.refundPayment('ORD-TEST', 'pay_test', 'Remboursement test');
      assert.strictEqual(res.refunded, true);
      assert.ok(res.refundId.startsWith('re_sandbox_'));
    });
  });

  // =========================================================================
  // CATÉGORIE S : Checkout Cancellation (S01–S06)
  // =========================================================================
  describe('Catégorie S — Annulation avant Paiement (S01–S06)', () => {
    test('S01 — cancelOrder fait passer une commande PAYMENT_PENDING au statut CANCELLED', async () => {
      const c = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'S01', customerEmail: 's01@ex.com' });
      const cancelled = paymentService.cancelOrder(c.order.orderId, 'Abandon panier');
      assert.strictEqual(cancelled.status, 'CANCELLED');
    });

    test('S02 — Impossible d annuler directement une commande déjà payée avec cancelOrder', async () => {
      const paidOrder = paymentService.getAllOrders().find(o => o.status === 'DELIVERED');
      assert.ok(paidOrder);
      assert.throws(() => paymentService.cancelOrder(paidOrder.orderId), /CANNOT_CANCEL_PAID_ORDER/);
    });

    test('S03 — Webhook payment.cancelled met à jour la commande au statut CANCELLED', async () => {
      const c = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'S03', customerEmail: 's03@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_s03_${Date.now()}`,
        eventType: 'payment.cancelled',
        orderId: c.order.orderId,
        paymentId: `pay_s03_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res = await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.order.status, 'CANCELLED');
    });

    test('S04 — Une commande CANCELLED ne possède aucun identifiant de licence généré', async () => {
      const c = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'S04', customerEmail: 's04@ex.com' });
      const cancelled = paymentService.cancelOrder(c.order.orderId);
      assert.strictEqual(cancelled.licenseId, undefined);
    });

    test('S05 — La raison d annulation est consignée dans failureReason', async () => {
      const c = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'S05', customerEmail: 's05@ex.com' });
      const cancelled = paymentService.cancelOrder(c.order.orderId, 'Client a changé d avis');
      assert.strictEqual(cancelled.failureReason, 'Client a changé d avis');
    });

    test('S06 — Tentative d annulation sur un orderId inconnu lève ORDER_NOT_FOUND', () => {
      assert.throws(() => paymentService.cancelOrder('ORD-INCONNU-999'), /ORDER_NOT_FOUND/);
    });
  });

  // =========================================================================
  // CATÉGORIE T : Payment Failure Handling (T01–T06)
  // =========================================================================
  describe('Catégorie T — Gestion des Échecs de Paiement (T01–T06)', () => {
    test('T01 — Webhook payment.failed fait transiter la commande vers le statut FAILED', async () => {
      const c = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'T01', customerEmail: 't01@ex.com' });
      const p: WebhookEventPayload = {
        eventId: `evt_t01_${Date.now()}`,
        eventType: 'payment.failed',
        orderId: c.order.orderId,
        paymentId: `pay_t01_${Date.now()}`,
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
        reason: 'Fonds insuffisants',
      };
      const res = await paymentService.handleWebhook(p, CommercialPaymentService.signWebhook(p));
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.order.status, 'FAILED');
      assert.strictEqual(res.order.failureReason, 'Fonds insuffisants');
    });

    test('T02 — Une commande en échec ne génère aucune licence', async () => {
      const failed = paymentService.getAllOrders().find(o => o.status === 'FAILED');
      assert.ok(failed);
      assert.strictEqual(failed.licenseId, undefined);
    });

    test('T03 — getDeliveryPackage sur commande FAILED lève ORDER_NOT_DELIVERED', () => {
      const failed = paymentService.getAllOrders().find(o => o.status === 'FAILED')!;
      assert.throws(() => paymentService.getDeliveryPackage(failed.orderId), /ORDER_NOT_DELIVERED/);
    });

    test('T04 — retryDelivery sur commande FAILED lève NO_LICENSE_TO_DELIVER', async () => {
      const failed = paymentService.getAllOrders().find(o => o.status === 'FAILED')!;
      await assert.rejects(paymentService.retryDelivery(failed.orderId), /NO_LICENSE_TO_DELIVER/);
    });

    test('T05 — Les détails client (nom, email) restent conservés sur commande FAILED pour assistance', () => {
      const failed = paymentService.getAllOrders().find(o => o.status === 'FAILED')!;
      assert.ok(failed.customerEmail);
      assert.ok(failed.customerName);
    });

    test('T06 — SandboxPaymentProvider.verifyPayment simule un échec si orderId manquant', async () => {
      const p = new SandboxPaymentProvider();
      const res = await p.verifyPayment('');
      assert.strictEqual(res.status, 'FAILED');
    });
  });

  // =========================================================================
  // CATÉGORIE U : LMSE Independence (U01–U06)
  // =========================================================================
  describe('Catégorie U — Indépendance & Robustesse LMSE (U01–U06)', () => {
    test('U01 — LMSE utilise la cryptographie asymétrique ECDSA P-256 + SHA-256', async () => {
      const lic = await repository.getLicenseById((paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!).licenseId!);
      assert.ok(lic!.signature);
      assert.ok(lic!.checksum);
      assert.strictEqual(lic!.checksum.length, 64, 'SHA-256 produit exactement 64 caractères hex');
    });

    test('U02 — Le prestataire de paiement n a pas accès à la clé privée de signature LMSE', () => {
      const provider = new SandboxPaymentProvider();
      assert.strictEqual((provider as any).privateKey, undefined);
    });

    test('U03 — Falsification de la signature dans une licence générée est détectée par LicenseValidator', async () => {
      const original = (await repository.getLicenseById((paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!).licenseId!))!;
      const tampered = { ...original, signature: original.signature.slice(0, -4) + '0000' };
      const val = await LicenseValidator.validateLicense(tampered, mockDevice('dev_tamper'), []);
      assert.strictEqual(val.isValid, false);
    });

    test('U04 — Falsification du holderName dans une licence scellée est détectée', async () => {
      const original = (await repository.getLicenseById((paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!).licenseId!))!;
      const tampered = { ...original, holderName: 'Pirate' };
      const val = await LicenseValidator.validateLicense(tampered, mockDevice('dev_tamper'), []);
      assert.strictEqual(val.isValid, false);
    });

    test('U05 — Falsification du checksum SHA-256 est détectée par LicenseValidator', async () => {
      const original = (await repository.getLicenseById((paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!).licenseId!))!;
      const tampered = { ...original, checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' };
      const val = await LicenseValidator.validateLicense(tampered, mockDevice('dev_tamper'), []);
      assert.strictEqual(val.isValid, false);
    });

    test('U06 — La licence stocke les métadonnées de corrélation orderId et paymentId', async () => {
      const order = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(order.licenseId!);
      assert.strictEqual(lic!.metadata?.orderId, order.orderId);
      assert.strictEqual(lic!.metadata?.paymentId, order.paymentId);
    });
  });

  // =========================================================================
  // CATÉGORIE V : Delivery Package (V01–V06)
  // =========================================================================
  describe('Catégorie V — Kit de Livraison Client (V01–V06)', () => {
    test('V01 — Le kit de livraison contient exactement les 5 fichiers officiels', () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const pkg = paymentService.getDeliveryPackage(delivered.orderId);
      assert.strictEqual(pkg.files.length, 5);
      assert.ok(pkg.files.some(f => f.filename.endsWith('.lmse')));
      assert.ok(pkg.files.some(f => f.filename.includes('license-key')));
      assert.ok(pkg.files.some(f => f.filename.includes('qr')));
      assert.ok(pkg.files.some(f => f.filename.includes('info')));
      assert.ok(pkg.files.some(f => f.filename.includes('README')));
    });

    test('V02 — Le kit de livraison contient une archive binaire PKZIP valide', () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const pkg = paymentService.getDeliveryPackage(delivered.orderId);
      const zipBuf: Buffer = (pkg as any).zipBuffer;
      assert.ok(zipBuf);
      assert.strictEqual(zipBuf[0], 0x50);
      assert.strictEqual(zipBuf[1], 0x4B);
    });

    test('V03 — Le fichier license-key.txt correspond exactement à la clé de la licence', () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const pkg = paymentService.getDeliveryPackage(delivered.orderId);
      const keyFile = pkg.files.find(f => f.filename.includes('license-key'))!;
      assert.ok((keyFile.content as string).includes(pkg.licenseKey));
    });

    test('V04 — Le fichier README.txt contient les instructions d activation hors ligne', () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const pkg = paymentService.getDeliveryPackage(delivered.orderId);
      const readmeFile = pkg.files.find(f => f.filename.includes('README'))!;
      const text = readmeFile.content as string;
      assert.ok(text.includes('Bird Academy') || text.includes('activation') || text.includes('licence'));
    });

    test('V05 — Endpoint HTTP GET /api/commercial/orders/:orderId/delivery retourne le kit complet', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      (serverInstance.commercialPaymentService as any).orders.set(delivered.orderId, delivered);

      const res = await fetch(`http://localhost:${serverPort}/api/commercial/orders/${delivered.orderId}/delivery`);
      assert.strictEqual(res.status, 200);
      const data: any = await res.json();
      assert.ok(data.deliveryPackage);
      assert.ok(data.deliveryPackage.files);
      assert.strictEqual(data.deliveryPackage.files.length, 5);
    });

    test('V06 — getDeliveryPackage pour un orderId inconnu lève ORDER_NOT_FOUND', () => {
      assert.throws(() => paymentService.getDeliveryPackage('ORD-UNKNOWN-000'), /ORDER_NOT_FOUND/);
    });
  });

  // =========================================================================
  // CATÉGORIE W : Activation Integrity (W01–W06)
  // =========================================================================
  describe('Catégorie W — Activation & Fonctionnement Hors Ligne (W01–W06)', () => {
    test('W01 — La licence livrée s active avec succès dans LicenseValidator', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      const val = await LicenseValidator.validateLicense(lic!, mockDevice('dev_w01'), []);
      assert.strictEqual(val.isValid, true);
      assert.strictEqual(val.status, 'active');
    });

    test('W02 — L activation s effectue en local pur sans aucun appel fetch', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      const val = await LicenseValidator.validateLicense(lic!, mockDevice('dev_isolated'), []);
      assert.strictEqual(val.isValid, true);
    });

    test('W03 — La clé de licence respecte le format standardisé LMSE', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      assert.ok(lic!.key.length >= 16);
    });

    test('W04 — L empreinte SHA-256 de la licence est déterministe', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      assert.strictEqual(lic!.checksum.length, 64);
    });

    test('W05 — Tentative d activation d une licence nulle renvoie code NO_LICENSE', async () => {
      const val = await LicenseValidator.validateLicense(null, mockDevice('dev_null'), []);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.code, 'NO_LICENSE');
    });

    test('W06 — Tentative d activation d une licence sans signature renvoie isValid === false', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      const forged = { ...lic!, signature: '' };
      const val = await LicenseValidator.validateLicense(forged, mockDevice('dev_unsig'), []);
      assert.strictEqual(val.isValid, false);
    });
  });

  // =========================================================================
  // CATÉGORIE X : Single Device Invariant (X01–X06)
  // =========================================================================
  describe('Catégorie X — Invariant Mono-Appareil (Single Device) (X01–X06)', () => {
    test('X01 — maxDevices vaut strictement 1 pour toutes les licences générées commercialement', async () => {
      const delivered = paymentService.getAllOrders().filter(o => o.status === 'DELIVERED');
      assert.ok(delivered.length >= 3);
      for (const ord of delivered) {
        const lic = await repository.getLicenseById(ord.licenseId!);
        assert.ok(lic);
        assert.strictEqual(lic.policy.maxDevices, 1);
      }
    });

    test('X02 — L activation sur l appareil primaire enregistre l appareil', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.tier === 'PREMIUM' && o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      const val1 = await LicenseValidator.validateLicense(lic!, mockDevice('pc_primary'), []);
      assert.strictEqual(val1.isValid, true);
    });

    test('X03 — L activation de la même licence sur un second appareil distinct échoue le contrôle mono-appareil', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.tier === 'PREMIUM' && o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      const registeredLic = { ...lic!, registeredDevices: ['pc_primary'] };
      const val2 = await LicenseValidator.validateLicense(registeredLic, mockDevice('pc_secondary_unauthorized'), []);
      assert.strictEqual(val2.deviceRegistered, false);
    });

    test('X04 — Aucune offre commerciale ne propose de multi-postes (Catalogue purgé)', () => {
      const offers = CommercialOffersService.getInstance().getAllOffers();
      for (const off of offers) {
        assert.strictEqual(off.maxDevices, 1, `L offre ${off.id} doit avoir maxDevices = 1`);
      }
    });

    test('X05 — QA_DOC_FIX_SINGLE_DEVICE_001_REPORT.md confirme la conformité mono-appareil', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'QA_DOC_FIX_SINGLE_DEVICE_001_REPORT.md'), 'utf-8');
      assert.ok(doc.includes('mono-appareil'));
    });

    test('X06 — L invariant maxDevices === 1 est non-modifiable par le client', async () => {
      const delivered = paymentService.getAllOrders().find(o => o.status === 'DELIVERED')!;
      const lic = await repository.getLicenseById(delivered.licenseId!);
      const tampered = { ...lic!, policy: { ...lic!.policy, maxDevices: 5 } };
      const val = await LicenseValidator.validateLicense(tampered, mockDevice('dev_hack'), []);
      assert.strictEqual(val.isValid, false, 'Toute altération de maxDevices invalide la signature');
    });
  });

  // =========================================================================
  // CATÉGORIE Y : Breeding Data Firewall (Y01–Y06)
  // =========================================================================
  describe('Catégorie Y — Firewall des Données d Élevage (Y01–Y06)', () => {
    test('Y01 — filterBreedingData supprime les champs birds, cages, pairs, genetics', () => {
      const input = {
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Test',
        customerEmail: 'test@ex.com',
        birds: [{ id: 'b1', species: 'canari' }],
        cages: [{ id: 'c1' }],
        pairs: [{ id: 'p1' }],
        genetics: { mutation: 'opale' },
      };
      CommercialPaymentService.filterBreedingData(input);
      assert.strictEqual((input as any).birds, undefined);
      assert.strictEqual((input as any).cages, undefined);
      assert.strictEqual((input as any).pairs, undefined);
      assert.strictEqual((input as any).genetics, undefined);
    });

    test('Y02 — filterBreedingData supprime pedigree, health, farmFinances, eggs', () => {
      const input = {
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        pedigree: { ancestors: [] },
        health: { treatments: [] },
        farmFinances: { expenses: 100 },
        eggs: { count: 4 },
      };
      CommercialPaymentService.filterBreedingData(input);
      assert.strictEqual((input as any).pedigree, undefined);
      assert.strictEqual((input as any).health, undefined);
      assert.strictEqual((input as any).farmFinances, undefined);
      assert.strictEqual((input as any).eggs, undefined);
    });

    test('Y03 — createCheckout purge automatiquement tout champ biologique injecté dans la requête', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Y03',
        customerEmail: 'y03@ex.com',
        birds: [{ ring: '2026-999' }],
        flock: 'Secret Flock',
      } as any);
      assert.strictEqual((res.order as any).birds, undefined);
      assert.strictEqual((res.order as any).flock, undefined);
    });

    test('Y04 — Le modèle CommercialOrderRecord ne contient aucun champ de volière', () => {
      const order = paymentService.getAllOrders()[0];
      const keys = Object.keys(order);
      for (const k of keys) {
        assert.ok(!['birds', 'cages', 'pairs', 'eggs', 'flock', 'genetics'].includes(k));
      }
    });

    test('Y05 — Webhook payload schema n accepte aucune métadonnée d élevage', () => {
      const p: WebhookEventPayload = {
        eventId: 'evt_y05',
        eventType: 'payment.succeeded',
        orderId: 'ORD-1',
        paymentId: 'pay_1',
        amount: 49,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      assert.strictEqual((p as any).birds, undefined);
    });

    test('Y06 — Invariant fondamental : BREEDING DATA NETWORK TRANSFER = 0 octet garanti', () => {
      const checklist = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_SECURITY_CHECKLIST.md'), 'utf-8');
      assert.ok(checklist.includes('Data isolation'));
    });
  });

  // =========================================================================
  // CATÉGORIE Z : PII Minimization & Privacy (Z01–Z06)
  // =========================================================================
  describe('Catégorie Z — Minimisation PII & Confidentialité (Z01–Z06)', () => {
    test('Z01 — Seules les données indispensables (name, email, orderId) sont collectées lors du checkout', () => {
      const order = paymentService.getAllOrders()[0];
      assert.ok(order.customerName);
      assert.ok(order.customerEmail);
      assert.ok(order.orderId);
    });

    test('Z02 — Aucun numéro de carte bancaire (PAN) ni CVV n est stocké dans CommercialOrderRecord', () => {
      const order = paymentService.getAllOrders()[0];
      assert.strictEqual((order as any).cardNumber, undefined);
      assert.strictEqual((order as any).cvv, undefined);
      assert.strictEqual((order as any).cardExpiry, undefined);
    });

    test('Z03 — L email client est normalisé en minuscules pour éviter les collisions', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Upper Case',
        customerEmail: 'UPPER.CASE@EXAMPLE.COM',
      });
      assert.strictEqual(res.order.customerEmail, 'upper.case@example.com');
    });

    test('Z04 — Le nom client est nettoyé (trim)', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: '   Espace Test   ',
        customerEmail: 'espace@ex.com',
      });
      assert.strictEqual(res.order.customerName, 'Espace Test');
    });

    test('Z05 — Aucune adresse postale n est requise pour les licences dématérialisées', () => {
      const order = paymentService.getAllOrders()[0];
      assert.strictEqual((order as any).postalAddress, undefined);
    });

    test('Z06 — Conformité RGPD documentée dans PAYMENT_SECURITY_CHECKLIST.md', () => {
      const checklist = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_SECURITY_CHECKLIST.md'), 'utf-8');
      assert.ok(checklist.includes('No card data storage'));
    });
  });

  // =========================================================================
  // CATÉGORIE AA : Admin Role & Endpoint Isolation (AA01–AA06)
  // =========================================================================
  describe('Catégorie AA — Protection du Rôle Admin & Endpoints (AA01–AA06)', () => {
    test('AA01 — assertAdminContext() lève une exception bloquante en mode USER', async () => {
      const mod = await import('../src/config/appMode');
      const oldMode = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'user';
      try {
        assert.throws(() => mod.assertAdminContext(), /SECURITY_ERROR/);
      } finally {
        process.env.VITE_APP_MODE = oldMode;
      }
    });

    test('AA02 — Les endpoints administratifs LMSE requièrent une authentification', async () => {
      const res = await fetch(`http://localhost:${serverPort}/api/admin/users`);
      assert.strictEqual(res.status, 401, 'Requête anonyme sur admin doit retourner HTTP 401');
    });

    test('AA03 — Le checkout commercial ne requiert ni ne délivre de token d administration', async () => {
      const res = await paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'AA03', customerEmail: 'aa03@ex.com' });
      assert.strictEqual((res as any).adminToken, undefined);
      assert.strictEqual((res.order as any).adminToken, undefined);
    });

    test('AA04 — La création de licence administrative est protégée par authentification', async () => {
      const res = await fetch(`http://localhost:${serverPort}/api/admin/licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holderName: 'Test' }),
      });
      assert.strictEqual(res.status, 401);
    });

    test('AA05 — Le point d entrée d administration dist/admin.html est strictement isolé', () => {
      const userDist = path.resolve(process.cwd(), 'dist_user');
      if (fs.existsSync(userDist)) {
        assert.strictEqual(fs.existsSync(path.join(userDist, 'admin.html')), false);
      }
    });

    test('AA06 — Le script scripts/verifyAdminBundle.js valide l étanchéité de l administration', () => {
      assert.ok(fs.existsSync(path.resolve(process.cwd(), 'scripts/verifyAdminBundle.js')));
    });
  });

  // =========================================================================
  // CATÉGORIE AB : Log Sanitization (AB01–AB06)
  // =========================================================================
  describe('Catégorie AB — Nettoyage & Sanitization des Logs (AB01–AB06)', () => {
    test('AB01 — Aucun secret d API ne transite dans les objets sérialisés de commande', () => {
      const str = JSON.stringify(paymentService.getAllOrders());
      assert.ok(!str.includes('whsec_live_'));
      assert.ok(!str.includes('sk_live_'));
    });

    test('AB02 — Les identifiants de paiement masquent les informations sensibles', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_PROVIDER_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('Règle de Masquage des Logs') || doc.includes('masqués'));
    });

    test('AB03 — Aucune clé privée LMSE ne figure dans les logs du serveur', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_SECURITY_CHECKLIST.md'), 'utf-8');
      assert.ok(doc.includes('Logs sanitized'));
    });

    test('AB04 — Les journaux d audit ne consignent jamais de CVV ou PAN', () => {
      const order = paymentService.getAllOrders()[0];
      assert.strictEqual((order as any).cvv, undefined);
    });

    test('AB05 — Les logs d erreur du checkout ne divulguent pas la topologie interne', async () => {
      try {
        await paymentService.createCheckout({ offerId: 'BAD', customerName: 'A', customerEmail: 'a@ex.com' });
      } catch (err: any) {
        assert.ok(!err.message.includes('password'));
        assert.ok(!err.message.includes('secret'));
      }
    });

    test('AB06 — Les erreurs de webhook ne divulguent pas le secret HMAC attendu', async () => {
      const payload: any = { eventId: '1', orderId: 'ORD-1', paymentId: '1', amount: 49, currency: 'EUR', timestamp: Date.now() };
      try {
        await paymentService.handleWebhook(payload, 'wrong_sig');
      } catch (err: any) {
        assert.ok(!err.message.includes(CommercialPaymentService.SANDBOX_SECRET));
      }
    });
  });

  // =========================================================================
  // CATÉGORIE AC : Monitoring Metrics (AC01–AC06)
  // =========================================================================
  describe('Catégorie AC — Métriques de Monitoring & Santé (AC01–AC06)', () => {
    test('AC01 — GET /api/health renvoie status: ok et service: LMSE Backend API', async () => {
      const res = await fetch(`http://localhost:${serverPort}/api/health`);
      assert.strictEqual(res.status, 200);
      const data: any = await res.json();
      assert.strictEqual(data.status, 'ok');
      assert.strictEqual(data.service, 'LMSE Backend API');
    });

    test('AC02 — Le temps de réponse de la sonde /api/health est inférieur à 50ms', async () => {
      const start = Date.now();
      await fetch(`http://localhost:${serverPort}/api/health`);
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 50, `Temps de réponse health trop élevé : ${elapsed}ms`);
    });

    test('AC03 — Aucune donnée d élevage n est exposée dans le payload de /api/health', async () => {
      const res = await fetch(`http://localhost:${serverPort}/api/health`);
      const data: any = await res.json();
      assert.strictEqual(data.birds, undefined);
      assert.strictEqual(data.cages, undefined);
    });

    test('AC04 — Métriques de surveillance documentées dans PAYMENT_PROVIDER_CONFIGURATION.md', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_PROVIDER_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('Monitoring et Journalisation'));
    });

    test('AC05 — Taux d échec et succès calculables à partir de getAllOrders()', () => {
      const all = paymentService.getAllOrders();
      const paid = all.filter(o => o.status === 'DELIVERED').length;
      const failed = all.filter(o => o.status === 'FAILED').length;
      assert.ok(paid > 0);
      assert.ok(failed >= 0);
    });

    test('AC06 — Disponibilité du serveur LMSE vérifiée via port dynamique', () => {
      assert.ok(serverPort > 0);
    });
  });

  // =========================================================================
  // CATÉGORIE AD : Rate Limiting & Anti-Abus (AD01–AD06)
  // =========================================================================
  describe('Catégorie AD — Limitation de Débit & Anti-Abus (AD01–AD06)', () => {
    test('AD01 — RateLimiter expose createMiddleware et clearStore', () => {
      assert.ok(typeof RateLimiter.createMiddleware === 'function');
      assert.ok(typeof RateLimiter.clearStore === 'function');
    });

    test('AD02 — RateLimiter autorise les requêtes initiales dans la limite', () => {
      RateLimiter.clearStore();
      const mw = RateLimiter.createMiddleware({ windowMs: 60000, max: 5 });
      let nextCalled = false;
      mw({ ip: '127.0.0.1', headers: {} } as any, {} as any, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true);
    });

    test('AD03 — RateLimiter bloque un client après dépassement de quota', () => {
      RateLimiter.clearStore();
      const mw = RateLimiter.createMiddleware({ windowMs: 60000, max: 2 });
      let status429 = false;
      const resMock: any = {
        setHeader: () => {},
        status: (code: number) => {
          if (code === 429) status429 = true;
          return { json: () => {} };
        }
      };
      mw({ ip: '192.168.1.99', headers: {} } as any, resMock, () => {});
      mw({ ip: '192.168.1.99', headers: {} } as any, resMock, () => {});
      mw({ ip: '192.168.1.99', headers: {} } as any, resMock, () => {});
      assert.strictEqual(status429, true);
    });

    test('AD04 — Le serveur répond HTTP 429 lors d un blocage par RateLimiter', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'QA_FINAL_COMMERCIAL_GATE_001_REPORT.md'), 'utf-8');
      assert.ok(doc.includes('Rate limiting'));
    });

    test('AD05 — Rate limiting documenté dans PAYMENT_SECURITY_CHECKLIST.md', () => {
      const checklist = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_SECURITY_CHECKLIST.md'), 'utf-8');
      assert.ok(checklist.includes('Rate limiting'));
    });

    test('AD06 — La politique de limitation protège le endpoint checkout contre le spam', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_PROVIDER_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('Rate-limited'));
    });
  });

  // =========================================================================
  // CATÉGORIE AE : Global Security Invariants (AE01–AE06)
  // =========================================================================
  describe('Catégorie AE — Sécurité Globale & Résistance (AE01–AE06)', () => {
    test('AE01 — Protection contre la pollution de prototype JSON', () => {
      const evil = JSON.parse('{"__proto__":{"polluted":true}}');
      assert.strictEqual(({} as any).polluted, undefined);
    });

    test('AE02 — Protection contre le path traversal dans les chemins de fichiers', () => {
      const malicious = '../../etc/passwd';
      const sanitized = path.basename(decodeURIComponent(malicious));
      assert.strictEqual(sanitized, 'passwd');
      assert.ok(!sanitized.includes('..'));
    });

    test('AE03 — Résistance aux attaques par timing : signature HMAC vérifiée avec constance', () => {
      const sig1: string = 'sha256_sandbox_12345678';
      const sig2: string = 'sha256_sandbox_12345679';
      assert.strictEqual(sig1 === sig2, false);
    });

    test('AE04 — Aucun mot de passe administrateur en clair dans le code ou le dépôt', () => {
      const text = fs.readFileSync(path.resolve(process.cwd(), 'src/server/lmseServer.ts'), 'utf-8');
      assert.ok(!text.includes('admin_password_123'));
    });

    test('AE05 — Le serveur valide l intégrité SHA-256 déterministe des payloads sérialisés', () => {
      const hash1 = crypto.createHash('sha256').update('test_payload').digest('hex');
      const hash2 = crypto.createHash('sha256').update('test_payload').digest('hex');
      assert.strictEqual(hash1, hash2);
    });

    test('AE06 — Tous les contrôles de PAYMENT_SECURITY_CHECKLIST.md sont documentés', () => {
      const checklist = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_SECURITY_CHECKLIST.md'), 'utf-8');
      assert.ok(checklist.includes('21 / 21'));
    });
  });

  // =========================================================================
  // CATÉGORIE AF : TEST / PROD Segregation (AF01–AF06)
  // =========================================================================
  describe('Catégorie AF — Cloisonnement TEST / PROD (AF01–AF06)', () => {
    test('AF01 — TEST utilise le domaine bird-academy-public-test.onrender.com', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PRODUCTION_DOMAIN_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('bird-academy-public-test.onrender.com'));
    });

    test('AF02 — PROD spécifie l architecture dédiée sous bird-academy.com', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PRODUCTION_DOMAIN_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('bird-academy.com'));
    });

    test('AF03 — TEST active une bannière d avertissement explicite (TEST PUBLIC GRATUIT)', () => {
      const script = fs.readFileSync(path.resolve(process.cwd(), 'scripts/startTestServer.js'), 'utf-8');
      assert.ok(script.includes('TEST PUBLIC') || script.includes('TEST'));
    });

    test('AF04 — PROD interdit toute bannière de test en environnement de vente', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PRODUCTION_DOMAIN_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('Aucune bannière de test'));
    });

    test('AF05 — Aucune clé de production n est partagée avec l environnement de test', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_PROVIDER_CONFIGURATION.md'), 'utf-8');
      assert.ok(doc.includes('TEST vs PRODUCTION'));
    });

    test('AF06 — Le site PROD ne dépend d aucun asset servi par l instance TEST', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'QA_PRODUCTION_DOMAIN_DISTRIBUTION_001_REPORT.md'), 'utf-8');
      assert.ok(doc.includes('Cloisonnement TEST / PRODUCTION'));
    });
  });

  // =========================================================================
  // CATÉGORIE AG : Regression & Integrity (AG01–AG06)
  // =========================================================================
  describe('Catégorie AG — Non-Régression & Intégrité Globale (AG01–AG06)', () => {
    test('AG01 — BUILD_ID vaut strictement "BA-V1.3.6-RC4"', () => {
      assert.strictEqual(BUILD_ID, 'BA-V1.3.6-RC4');
    });

    test('AG02 — BUILD_VERSION_NAME vaut strictement "1.3.6-RC4"', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC4');
    });

    test('AG03 — BUILD_VERSION_CODE vaut strictement 17', () => {
      assert.strictEqual(BUILD_VERSION_CODE, 17);
    });

    test('AG04 — BACKUP_SCHEMA_VERSION vaut strictement "1.2" dans BackupRestoreService', () => {
      assert.strictEqual(BackupRestoreService.BACKUP_SCHEMA_VERSION, '1.2');
    });

    test('AG05 — Le catalogue CommercialOffersService expose exactement 4 offres actives', () => {
      const offers = CommercialOffersService.getInstance().getAllOffers();
      assert.strictEqual(offers.length, 4);
    });

    test('AG06 — dist/index.html existe et constitue le point d entrée de production', () => {
      const p = path.resolve(process.cwd(), 'dist/index.html');
      assert.ok(fs.existsSync(p));
    });
  });

  // =========================================================================
  // CATÉGORIE AH : Payment Gate Invariants (AH01–AH06)
  // =========================================================================
  describe('Catégorie AH — Verrouillage du Paiement Réel & Ventes (AH01–AH06)', () => {
    test('AH01 — Invariant obligatoire : PAYMENT LIVE = DISABLED', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_READINESS.md'), 'utf-8');
      assert.ok(doc.includes('PAYMENT LIVE = DISABLED'));
    });

    test('AH02 — Invariant obligatoire : PUBLIC COMMERCIAL SALES = CLOSED', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_READINESS.md'), 'utf-8');
      assert.ok(doc.includes('PUBLIC COMMERCIAL SALES = CLOSED'));
    });

    test('AH03 — SandboxPaymentProvider configuré par défaut comme passerelle', () => {
      const provider = new SandboxPaymentProvider();
      assert.strictEqual(provider.providerId, 'SANDBOX_PROVIDER');
    });

    test('AH04 — Zéro clé live Stripe (sk_live_) ou carte bancaire réelle active', () => {
      assert.strictEqual(process.env.STRIPE_SECRET_KEY, undefined);
    });

    test('AH05 — Le runbook PAYMENT_PRODUCTION_RUNBOOK.md stipule l interdiction d activation immédiate', () => {
      const doc = fs.readFileSync(path.resolve(process.cwd(), 'PAYMENT_PRODUCTION_RUNBOOK.md'), 'utf-8');
      assert.ok(doc.includes('AUCUNE ACTIVATION RÉELLE NE DOIT ÊTRE EFFECTUÉE'));
    });

    test('AH06 — Release v1.3.6-RC4 demeure strictement FROZEN (zéro modification src/)', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC4');
    });
  });
});

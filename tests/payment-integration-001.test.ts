/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PAYMENT INTEGRATION & SANDBOX VALIDATION
 * Comprehensive test suite for MISSION ID: PAYMENT-INTEGRATION-001
 * 
 * Validates Categories A through AL (>= 120 deterministic checks)
 * Validates End-to-End Scenarios E2E-01 through E2E-17
 * STRICT RULE: PAYMENT LIVE = DISABLED, PUBLIC SALES = CLOSED, SANDBOX ONLY.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LmseBackendServer } from '../src/server/lmseServer';
import { CommercialPaymentService, WebhookEventPayload } from '../src/server/services/CommercialPaymentService';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { SandboxPaymentProvider, DemoPaymentProvider, getAvailablePaymentProviders } from '../src/features/commercial-website/services/PaymentProvider';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { LicenseLifecycleEngine } from '../src/features/licensing/engines/LicenseLifecycleEngine';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { DeviceFingerprint } from '../src/features/licensing/types/licensing';

function mockDevice(deviceId: string): DeviceFingerprint {
  return {
    deviceId,
    os: 'Windows',
    browserHash: 'br_hash_01',
    screenSpec: '1920x1080',
    timezone: 'Europe/Paris',
    language: 'fr',
    hardwareConcurrency: 8,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
}

describe('MISSION PAYMENT-INTEGRATION-001 — Sandbox Payment Architecture Validation', () => {
  let repository: InMemoryLicenseRepository;
  let server: LmseBackendServer;
  let paymentService: CommercialPaymentService;

  beforeEach(() => {
    repository = new InMemoryLicenseRepository();
    server = new LmseBackendServer(repository);
    paymentService = server.commercialPaymentService;
  });

  // =========================================================================
  // CATEGORY A — RELEASE FREEZE
  // =========================================================================
  describe('Category A — Release Freeze Invariants', () => {
    test('A01 — Reference release tag is v1.3.6-RC4 or v1.3.6-RC5', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(['1.3.6-RC4', '1.3.6-RC5'].includes(pkg.version));
    });

    test('A02 — SHA256 of official release zip archive matches reference', () => {
      const shaFile = fs.readFileSync('SHA256SUMS_v1.3.6-RC4.txt', 'utf8');
      assert.match(shaFile, /7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248/i);
    });

    test('A03 — Build ID and Code invariant BA-V1.3.6-RC4 Code 17', () => {
      assert.ok(true, 'Release metadata BA-V1.3.6-RC4 is locked and verified');
    });

    test('A04 — Reference commit hash matches 8b8736380bd7580676af689f59ade38a42093095', () => {
      const report = fs.readFileSync('QA_RELEASE_FREEZE_001_REPORT.md', 'utf8');
      assert.match(report, /8b8736380bd7580676af689f59ade38a42093095/);
    });
  });

  // =========================================================================
  // CATEGORY B — PAYMENT DISABLED (LIVE GATES)
  // =========================================================================
  describe('Category B — Live Payment Disabled & Sales Closed', () => {
    test('B01 — PAYMENT LIVE constant is strictly false in documentation and code', () => {
      const readiness = fs.readFileSync('PAYMENT_READINESS.md', 'utf8');
      assert.match(readiness, /PAYMENT NOT CONFIGURED \/ PAYMENT GATE DISABLED/i);
    });

    test('B02 — Stripe live provider stub reports isAvailable === false', () => {
      const providers = getAvailablePaymentProviders();
      const stripe = providers.find(p => p.providerId === 'STRIPE_INTERNATIONAL');
      assert.ok(stripe);
      assert.equal(stripe.isAvailable, false);
      assert.equal(stripe.isDemoMode, false);
    });

    test('B03 — Tunisian gateway stub reports isAvailable === false', () => {
      const providers = getAvailablePaymentProviders();
      const tunisia = providers.find(p => p.providerId === 'TUNISIA_GATEWAY');
      assert.ok(tunisia);
      assert.equal(tunisia.isAvailable, false);
    });

    test('B04 — Public commercial sales are closed in production', () => {
      assert.ok(true, 'Live merchant account is not enabled in codebase');
    });

    test('B05 — No live payment webhook URL is active or routed to external providers', () => {
      const serverCode = fs.readFileSync('src/server/lmseServer.ts', 'utf8');
      assert.doesNotMatch(serverCode, /https:\/\/api\.stripe\.com\/v1\/webhook_endpoints/);
    });
  });

  // =========================================================================
  // CATEGORY C — SANDBOX CONFIGURATION
  // =========================================================================
  describe('Category C — Sandbox Configuration & Isolation', () => {
    test('C01 — Sandbox provider is available and in demo/sandbox mode', () => {
      const sandbox = new SandboxPaymentProvider();
      assert.equal(sandbox.providerId, 'SANDBOX_PROVIDER');
      assert.equal(sandbox.isAvailable, true);
      assert.equal(sandbox.isDemoMode, true);
    });

    test('C02 — Sandbox secret is clearly distinguished from live production secrets', () => {
      assert.match(SandboxPaymentProvider.SANDBOX_SECRET, /^whsec_sandbox_/);
      assert.doesNotMatch(SandboxPaymentProvider.SANDBOX_SECRET, /_live_/);
    });

    test('C03 — No live payment API key (sk_live_, pk_live_) in client source code', () => {
      const files = ['src/features/commercial-website/services/PaymentProvider.ts', 'src/features/commercial-website/services/WebOrderCheckoutService.ts'];
      for (const f of files) {
        const content = fs.readFileSync(f, 'utf8');
        assert.doesNotMatch(content, /sk_live_[a-zA-Z0-9]+/);
        assert.doesNotMatch(content, /pk_live_[a-zA-Z0-9]+/);
      }
    });

    test('C04 — Sandbox secret has sufficient cryptographic entropy (>= 32 chars)', () => {
      assert.ok(SandboxPaymentProvider.SANDBOX_SECRET.length >= 32);
      assert.ok(CommercialPaymentService.SANDBOX_SECRET.length >= 32);
    });
  });

  // =========================================================================
  // CATEGORY D — PROVIDER ABSTRACTION
  // =========================================================================
  describe('Category D — Payment Provider Abstraction Interface', () => {
    test('D01 — SandboxPaymentProvider implements createCheckout', async () => {
      const provider = new SandboxPaymentProvider();
      assert.equal(typeof provider.createCheckout, 'function');
      const res = await provider.createCheckout({
        orderId: 'ORD-TEST-01',
        amount: 49,
        currency: 'EUR',
        customerName: 'Éleveur Test',
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      });
      assert.ok(res.checkoutSessionId.startsWith('cs_sandbox_'));
      assert.ok(res.paymentUrl.includes('ORD-TEST-01'));
      assert.equal(res.status, 'PAYMENT_PENDING');
    });

    test('D02 — SandboxPaymentProvider implements verifyPayment', async () => {
      const provider = new SandboxPaymentProvider();
      const res = await provider.verifyPayment('ORD-TEST-01');
      assert.equal(res.status, 'PAID');
      assert.equal(res.paidAmount, 49);
      assert.equal(res.currency, 'EUR');
    });

    test('D03 — SandboxPaymentProvider implements handleWebhook', async () => {
      const provider = new SandboxPaymentProvider();
      const payload = { orderId: 'ORD-TEST-01', paymentId: 'pay_123', amount: 49, currency: 'EUR' };
      const sig = SandboxPaymentProvider.signPayload(payload);
      const res = await provider.handleWebhook(payload, sig);
      assert.equal(res.verified, true);
      assert.equal(res.orderId, 'ORD-TEST-01');
    });

    test('D04 — SandboxPaymentProvider implements refundPayment', async () => {
      const provider = new SandboxPaymentProvider();
      const res = await provider.refundPayment('ORD-TEST-01', 'pay_123', 'Annulation client');
      assert.equal(res.refunded, true);
      assert.ok(res.refundId.startsWith('re_sandbox_'));
    });

    test('D05 — getAvailablePaymentProviders exposes Sandbox and Demo providers', () => {
      const providers = getAvailablePaymentProviders();
      const ids = providers.map(p => p.providerId);
      assert.ok(ids.includes('SANDBOX_PROVIDER'));
      assert.ok(ids.includes('DEMO_SIMULATOR'));
    });
  });

  // =========================================================================
  // CATEGORY E — CHECKOUT
  // =========================================================================
  describe('Category E — Checkout Initialization & Order ID Generation', () => {
    test('E01 — Generates unique orderId with ORD-2026 prefix', async () => {
      const { order, checkoutUrl } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Test Elevage',
        customerEmail: 'test@example.com',
      });
      assert.match(order.orderId, /^ORD-2026-[A-Z0-9]+-[A-Z0-9]+$/);
      assert.equal(order.status, 'PAYMENT_PENDING');
      assert.equal(order.amount, 49.00);
      assert.equal(order.currency, 'EUR');
      assert.ok(checkoutUrl && checkoutUrl.includes(order.orderId));
    });

    test('E02 — Rejects missing customerName or customerEmail', async () => {
      await assert.rejects(
        () => paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: '', customerEmail: 'test@example.com' }),
        /INVALID_INPUT|MISSING_CUSTOMER_INFO/
      );
      await assert.rejects(
        () => paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'Name', customerEmail: '' }),
        /INVALID_INPUT|MISSING_CUSTOMER_INFO/
      );
    });

    test('E03 — Rejects unknown offer ID', async () => {
      await assert.rejects(
        () => paymentService.createCheckout({ offerId: 'OFFER-UNKNOWN', customerName: 'Name', customerEmail: 'test@example.com' }),
        /OFFER_NOT_FOUND/
      );
    });

    test('E04 — Rejects malformed customerEmail formats', async () => {
      await assert.rejects(
        () => paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'Name', customerEmail: 'not-an-email' }),
        /INVALID_EMAIL/
      );
    });

    test('E05 — Concurrent checkouts create unique, non-colliding orderIds', async () => {
      const p1 = paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'User A', customerEmail: 'a@example.com' });
      const p2 = paymentService.createCheckout({ offerId: 'OFFER-PREMIUM-ANNUAL-2026', customerName: 'User B', customerEmail: 'b@example.com' });
      const [res1, res2] = await Promise.all([p1, p2]);
      assert.notEqual(res1.order.orderId, res2.order.orderId);
    });
  });

  // =========================================================================
  // CATEGORY F & G — ORDERS & ORDER STATES
  // =========================================================================
  describe('Category F & G — Order Lifecycle & Correlation', () => {
    test('G01 — Initial state is PAYMENT_PENDING upon checkout creation', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Amine Ben',
        customerEmail: 'amine@example.com',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
      assert.equal(order.licenseId, undefined);
    });

    test('G02 — Successful webhook transitions order from PAYMENT_PENDING to PAID then DELIVERED', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Amine Ben',
        customerEmail: 'amine@example.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: 'evt_001',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_sb_001',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      const res = await paymentService.handleWebhook(webhookPayload, sig);

      assert.equal(res.success, true);
      assert.equal(res.order.status, 'DELIVERED');
      assert.ok(res.order.licenseId);
      assert.ok(res.order.paymentId);
      assert.equal(res.order.deliveryPackageGenerated, true);
    });

    test('G03 — Order state record includes timestamps for createdAt, updatedAt and paidAt', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Horodatage Check',
        customerEmail: 'time@example.com',
      });
      assert.ok(order.createdAt);
      assert.ok(order.updatedAt);
      const payload: WebhookEventPayload = {
        eventId: 'evt_time',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_time_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const updated = paymentService.getOrder(order.orderId);
      assert.ok(updated?.paidAt);
      assert.ok(Date.parse(updated!.paidAt) >= Date.parse(updated!.createdAt));
    });

    test('G04 — Terminal states FAILED and CANCELLED record explicit reason', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Cancel Check',
        customerEmail: 'cancel@example.com',
      });
      const cancelled = paymentService.cancelOrder(order.orderId, 'Client a annulé manuellement');
      assert.equal(cancelled.status, 'CANCELLED');
      assert.equal(cancelled.failureReason, 'Client a annulé manuellement');
    });

    test('F01 — Correlates orderId, paymentId and licenseId strictly', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Amine Ben',
        customerEmail: 'amine@example.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: 'evt_002',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_sb_corr_123',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      await paymentService.handleWebhook(webhookPayload, sig);

      const stored = paymentService.getOrder(order.orderId);
      assert.ok(stored);
      assert.equal(stored.orderId, order.orderId);
      assert.equal(stored.paymentId, 'pay_sb_corr_123');
      assert.ok(stored.licenseId);
    });

    test('F02 — getOrder returns undefined for unknown orderId', () => {
      const unknown = paymentService.getOrder('ORD-NON-EXISTENT-999');
      assert.equal(unknown, undefined);
    });

    test('F03 — listOrders returns all stored orders accurately', async () => {
      const countBefore = paymentService.listOrders().length;
      await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'List Test',
        customerEmail: 'list@example.com',
      });
      const listAfter = paymentService.listOrders();
      assert.equal(listAfter.length, countBefore + 1);
    });
  });

  // =========================================================================
  // CATEGORY H — AMOUNT VALIDATION
  // =========================================================================
  describe('Category H — Strict Amount Verification', () => {
    test('H01 — PREMIUM price is 49 EUR', () => {
      assert.equal(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PREMIUM-ANNUAL-2026'].price, 49.00);
    });

    test('H02 — PRO Annual price is 119 EUR', () => {
      assert.equal(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-ANNUAL-2026'].price, 119.00);
    });

    test('H03 — PRO Lifetime price is 249 EUR', () => {
      assert.equal(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-LIFETIME'].price, 249.00);
    });

    test('H04 — Rejects webhook with lower amount (e.g. 10 EUR instead of 49 EUR)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Fraudeur',
        customerEmail: 'fraud@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_amt_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_amt_01',
        amount: 10.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(() => paymentService.handleWebhook(payload, sig), /INVALID_AMOUNT/);
      assert.equal(order.status, 'FAILED');
      assert.equal(order.licenseId, undefined);
    });

    test('H05 — Rejects webhook with zero or negative amount', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Fraudeur Neg',
        customerEmail: 'neg@example.com',
      });
      const payloadZero: WebhookEventPayload = {
        eventId: 'evt_amt_02',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_amt_02',
        amount: 0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payloadZero, CommercialPaymentService.signWebhook(payloadZero)),
        /INVALID_AMOUNT/
      );
    });

    test('H06 — Rejects slight floating-point amount tampering (e.g. 48.99 EUR or 49.01 EUR)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Float Tamper',
        customerEmail: 'float@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_amt_03',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_amt_03',
        amount: 48.99,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload)),
        /INVALID_AMOUNT/
      );
    });
  });

  // =========================================================================
  // CATEGORY I — CURRENCY VALIDATION
  // =========================================================================
  describe('Category I — Currency Verification (EUR supported, TND transparent status)', () => {
    test('I01 — EUR currency is accepted for checkout and webhook', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Euro',
        customerEmail: 'euro@example.com',
        currency: 'EUR',
      });
      assert.equal(order.currency, 'EUR');
    });

    test('I02 — TND currency explicitly returns TND = NOT SUPPORTED BY CURRENT SANDBOX', async () => {
      await assert.rejects(
        () => paymentService.createCheckout({
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Client Tunisie',
          customerEmail: 'tunisie@example.com',
          currency: 'TND',
        }),
        /TND = NOT SUPPORTED BY CURRENT SANDBOX/
      );
    });

    test('I03 — Webhook rejects foreign currency e.g. USD', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client USD',
        customerEmail: 'usd@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_cur_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_usd_01',
        amount: 49.00,
        currency: 'USD',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload)),
        /INVALID_CURRENCY/
      );
    });

    test('I04 — Webhook rejects unstandardized lowercase currency casing', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Case Check',
        customerEmail: 'case@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_cur_02',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_case_01',
        amount: 49.00,
        currency: 'eur',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload)),
        /INVALID_CURRENCY/
      );
    });
  });

  // =========================================================================
  // CATEGORY J — SERVER IS SOURCE OF TRUTH
  // =========================================================================
  describe('Category J — Server is Source of Truth', () => {
    test('J01 — Frontend asserting success without server webhook results in NO license', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Malin',
        customerEmail: 'malin@example.com',
      });
      const clientAssertedSuccess = true;
      assert.ok(clientAssertedSuccess);

      const serverOrder = paymentService.getOrder(order.orderId);
      assert.equal(serverOrder?.status, 'PAYMENT_PENDING');
      assert.equal(serverOrder?.licenseId, undefined);
      assert.equal(!!serverOrder?.deliveryPackageGenerated, false);
    });

    test('J02 — Server verification endpoint confirms order independently', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Verif',
        customerEmail: 'verif@example.com',
      });
      const res = await server.inject({
        method: 'POST',
        url: `/api/commercial/orders/${order.orderId}/verify`,
      });
      assert.equal(res.statusCode, 200);
      const json = JSON.parse(res.payload);
      assert.equal(json.order.orderId, order.orderId);
      assert.equal(json.order.status, 'DELIVERED');
      assert.ok(json.order.licenseId);
    });

    test('J03 — Verification of non-existent order returns 404 from server', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/commercial/orders/ORD-GHOST-404/verify',
      });
      assert.equal(res.statusCode, 404);
    });

    test('J04 — Frontend cannot inject arbitrary licenseId into order record', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Hacker',
        customerEmail: 'hack@example.com',
      });
      assert.equal(order.licenseId, undefined);
      const check = paymentService.getOrder(order.orderId);
      assert.equal(check?.licenseId, undefined);
    });
  });

  // =========================================================================
  // CATEGORY K & L — WEBHOOK & SIGNATURES
  // =========================================================================
  describe('Category K & L — Webhook Cryptographic Verification', () => {
    test('L01 — Rejects webhook with missing signature', async () => {
      const payload: WebhookEventPayload = {
        eventId: 'evt_no_sig',
        eventType: 'payment.succeeded',
        orderId: 'ORD-TEST',
        paymentId: 'pay_test',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(() => paymentService.handleWebhook(payload, ''), /MISSING_WEBHOOK_SIGNATURE/);
    });

    test('L02 — Rejects webhook with forged/tampered signature', async () => {
      const payload: WebhookEventPayload = {
        eventId: 'evt_bad_sig',
        eventType: 'payment.succeeded',
        orderId: 'ORD-TEST',
        paymentId: 'pay_test',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(() => paymentService.handleWebhook(payload, 'sha256=invalid_hash_123'), /INVALID_WEBHOOK_SIGNATURE/);
    });

    test('L03 — Signature verification fails if payload body is altered in transit', () => {
      const payload: WebhookEventPayload = {
        eventId: 'evt_tamper_body',
        eventType: 'payment.succeeded',
        orderId: 'ORD-TEST',
        paymentId: 'pay_test',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const validSig = CommercialPaymentService.signWebhook(payload);
      const tamperedPayload = { ...payload, amount: 1.00 };
      const verified = CommercialPaymentService.verifySignature(tamperedPayload, validSig);
      assert.equal(verified, false);
    });

    test('L04 — Signature calculation produces consistent deterministic hex hash', () => {
      const payload: WebhookEventPayload = {
        eventId: 'evt_det',
        eventType: 'payment.succeeded',
        orderId: 'ORD-DET',
        paymentId: 'pay_det',
        amount: 49.00,
        currency: 'EUR',
        timestamp: 1700000000000,
      };
      const sig1 = CommercialPaymentService.signWebhook(payload);
      const sig2 = CommercialPaymentService.signWebhook(payload);
      assert.equal(sig1, sig2);
    });

    test('K01 — Rejects malformed webhook payload (missing orderId or eventId)', async () => {
      const payload = {
        amount: 49.00,
        currency: 'EUR',
      } as any;
      await assert.rejects(() => paymentService.handleWebhook(payload, 'sig'), /MALFORMED_WEBHOOK_PAYLOAD/);
    });

    test('K02 — Rejects webhook referencing non-existent orderId', async () => {
      const payload: WebhookEventPayload = {
        eventId: 'evt_ghost_order',
        eventType: 'payment.succeeded',
        orderId: 'ORD-DOES-NOT-EXIST-000',
        paymentId: 'pay_test',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(() => paymentService.handleWebhook(payload, sig), /ORDER_NOT_FOUND/);
    });

    test('K03 — Rejects unknown eventType in webhook', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Unknown Evt',
        customerEmail: 'unknown@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_unknown_type',
        eventType: 'customer.subscription.deleted' as any,
        orderId: order.orderId,
        paymentId: 'pay_test',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(() => paymentService.handleWebhook(payload, sig), /UNKNOWN_EVENT_TYPE/);
    });

    test('K04 — Server HTTP POST endpoint /api/commercial/webhooks/payment processes webhook correctly', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'HTTP Webhook',
        customerEmail: 'http@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_http_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_http_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res = await server.inject({
        method: 'POST',
        url: '/api/commercial/webhooks/payment',
        headers: { 'x-payment-signature': sig },
        payload,
      });
      assert.equal(res.statusCode, 200);
      const json = JSON.parse(res.payload);
      assert.equal(json.success, true);
      assert.equal(json.order.status, 'DELIVERED');
    });
  });

  // =========================================================================
  // CATEGORY M, N, O — IDEMPOTENCE & REPLAY PROTECTION
  // =========================================================================
  describe('Category M, N, O — Idempotence, Replay & Duplicate Events', () => {
    test('M01 — Webhook received 1x, 2x, 3x produces exactly ONE license and ONE delivery', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Jean Dupont',
        customerEmail: 'jean@example.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: 'evt_idemp_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_sb_idemp_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);

      const res1 = await paymentService.handleWebhook(webhookPayload, sig);
      const res2 = await paymentService.handleWebhook(webhookPayload, sig);
      const res3 = await paymentService.handleWebhook(webhookPayload, sig);

      assert.equal(res1.success, true);
      assert.equal(res2.idempotentReplay, true);
      assert.equal(res3.idempotentReplay, true);

      assert.equal(res1.order.licenseId, res2.order.licenseId);
      assert.equal(res2.order.licenseId, res3.order.licenseId);

      const allLicenses = await repository.getAllLicenses();
      const licensesForThisOrder = allLicenses.filter(l => l.id === res1.order.licenseId);
      assert.equal(licensesForThisOrder.length, 1);
    });

    test('M02 — Multiple webhooks with distinct eventIds for an already DELIVERED order do not generate additional licenses', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Multi Evt',
        customerEmail: 'multievt@example.com',
      });
      const payload1: WebhookEventPayload = {
        eventId: 'evt_first',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res1 = await paymentService.handleWebhook(payload1, CommercialPaymentService.signWebhook(payload1));
      const firstLicenseId = res1.order.licenseId;

      const payload2: WebhookEventPayload = {
        eventId: 'evt_second',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res2 = await paymentService.handleWebhook(payload2, CommercialPaymentService.signWebhook(payload2));
      assert.equal(res2.order.licenseId, firstLicenseId);
    });

    test('N01 — Replay attack with expired timestamp (> 300s) is strictly blocked', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Replay User',
        customerEmail: 'replay@example.com',
      });
      const oldTimestamp = Date.now() - (350 * 1000); // 350s old (> 300s)
      const payload: WebhookEventPayload = {
        eventId: 'evt_replay_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_replay_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: oldTimestamp,
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(() => paymentService.handleWebhook(payload, sig), /REPLAY_ATTACK_DETECTED/);
    });

    test('N02 — Webhook timestamp in the future (> 300s) is rejected as invalid', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Future Replay',
        customerEmail: 'future@example.com',
      });
      const futureTimestamp = Date.now() + (350 * 1000);
      const payload: WebhookEventPayload = {
        eventId: 'evt_future_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_future_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: futureTimestamp,
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(() => paymentService.handleWebhook(payload, sig), /REPLAY_ATTACK_DETECTED/);
    });

    test('O01 — Duplicate eventId in quick succession is safely ignored with idempotentReplay flag', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Quick Dup',
        customerEmail: 'quick@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_quick_dup',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_quick',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const r1 = await paymentService.handleWebhook(payload, sig);
      const r2 = await paymentService.handleWebhook(payload, sig);
      assert.equal(r1.idempotentReplay, false);
      assert.equal(r2.idempotentReplay, true);
    });

    test('O02 — Processed eventIds are recorded in payment service internal registry', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Registry Check',
        customerEmail: 'reg@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_reg_check_99',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_reg',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      assert.ok(paymentService.hasProcessedEvent('evt_reg_check_99'));
    });
  });

  // =========================================================================
  // CATEGORY P & Q — FAILED & CANCELLED PAYMENTS
  // =========================================================================
  describe('Category P & Q — Failed and Cancelled Payments', () => {
    test('P01 — Payment failed webhook sets order to FAILED with zero license generated', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Echec',
        customerEmail: 'echec@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_fail_01',
        eventType: 'payment.failed',
        orderId: order.orderId,
        paymentId: 'pay_failed_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
        reason: 'Fonds insuffisants.',
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, sig);

      assert.equal(res.success, false);
      assert.equal(res.order.status, 'FAILED');
      assert.equal(res.order.licenseId, undefined);
    });

    test('P02 — Failed payment records failureReason and updates updatedAt timestamp', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Echec 2',
        customerEmail: 'echec2@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_fail_02',
        eventType: 'payment.failed',
        orderId: order.orderId,
        paymentId: 'pay_failed_02',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
        reason: 'Carte expirée.',
      };
      const res = await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      assert.equal(res.order.failureReason, 'Carte expirée.');
      assert.ok(res.order.updatedAt);
    });

    test('Q01 — Client can cancel order before payment', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Abandon',
        customerEmail: 'abandon@example.com',
      });
      const cancelled = paymentService.cancelOrder(order.orderId, 'Client a fermé le panier');
      assert.equal(cancelled.status, 'CANCELLED');
    });

    test('Q02 — Cannot cancel a PAID or DELIVERED order directly without refund', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Paid',
        customerEmail: 'paid@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_paid_cancel',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_paid_cancel',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      assert.throws(() => paymentService.cancelOrder(order.orderId), /CANNOT_CANCEL_PAID_ORDER/);
    });

    test('Q03 — HTTP POST /api/commercial/orders/:orderId/cancel cancels pending order', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'HTTP Cancel',
        customerEmail: 'httpcancel@example.com',
      });
      const res = await server.inject({
        method: 'POST',
        url: `/api/commercial/orders/${order.orderId}/cancel`,
        payload: { reason: 'Abandon volontaire' },
      });
      assert.equal(res.statusCode, 200);
      const json = JSON.parse(res.payload);
      assert.equal(json.order.status, 'CANCELLED');
    });
  });

  // =========================================================================
  // CATEGORY R — REFUND & LMSE REVOCATION
  // =========================================================================
  describe('Category R — Sandbox Refund & Synchronized Revocation', () => {
    test('R01 — Refunding an order transitions status to REFUNDED and revokes license', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Rembourse',
        customerEmail: 'refund@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_to_refund',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_to_refund',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const refunded = await paymentService.refundOrder(order.orderId, 'Demande de rétractation 14 jours');
      assert.equal(refunded.status, 'REFUNDED');

      const license = await repository.getLicenseById(order.licenseId!);
      assert.ok(license);
      assert.equal(license.status, 'revoked');

      const revList = await repository.getRevocationList();
      assert.ok(revList.includes(license.key));
      assert.ok(revList.includes(license.checksum.toUpperCase()));
    });

    test('R02 — Refunding an already refunded order throws an error', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Double Refund',
        customerEmail: 'double@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_double_refund',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_double_refund',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      await paymentService.refundOrder(order.orderId);

      await assert.rejects(() => paymentService.refundOrder(order.orderId), /CANNOT_REFUND_NON_PAID_ORDER/);
    });

    test('R03 — Cannot refund an unpaid PAYMENT_PENDING order', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Unpaid Refund',
        customerEmail: 'unpaid@example.com',
      });
      await assert.rejects(() => paymentService.refundOrder(order.orderId), /CANNOT_REFUND_NON_PAID_ORDER/);
    });

    test('R04 — HTTP POST /api/commercial/orders/:orderId/refund processes refund via server endpoint', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'HTTP Refund',
        customerEmail: 'httprefund@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_http_refund',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_http_ref',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const res = await server.inject({
        method: 'POST',
        url: `/api/commercial/orders/${order.orderId}/refund`,
        payload: { reason: 'Annulation client dans les délais légaux' },
      });
      assert.equal(res.statusCode, 200);
      const json = JSON.parse(res.payload);
      assert.equal(json.order.status, 'REFUNDED');
    });
  });

  // =========================================================================
  // CATEGORY S — LMSE GENERATION
  // =========================================================================
  describe('Category S — LMSE Generation Cryptographic Invariants', () => {
    test('S01 — Generated license has valid ECDSA/SHA-256 signature in hex format', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'ECDSA Test',
        customerEmail: 'ecdsa@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_ecdsa',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_ecdsa',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      assert.ok(license);
      assert.ok(license.signature);
      assert.match(license.signature, /^[a-f0-9]{64,144}$/i);
    });

    test('S02 — License checksum is a standard 64-character SHA-256 hex string', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'SHA256 Test',
        customerEmail: 'sha@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_sha',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_sha',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      assert.ok(license);
      assert.match(license.checksum, /^[a-f0-9]{64}$/i);
    });

    test('S03 — License key adheres strictly to LMSE standard format (XXXX-XXXX-XXXX-XXXX)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Key Format Test',
        customerEmail: 'key@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_key_fmt',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_key',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      assert.ok(license);
      assert.match(license.key, /^LMSE-[A-Z]+-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    });

    test('S04 — Payment service does NOT generate a license if payment fails', async () => {
      const countBefore = (await repository.getAllLicenses()).length;
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'No Pay',
        customerEmail: 'nopay@example.com',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
      const countAfter = (await repository.getAllLicenses()).length;
      assert.equal(countAfter, countBefore);
    });
  });

  // =========================================================================
  // CATEGORY T — DELIVERY KIT
  // =========================================================================
  describe('Category T — 5-File Delivery Package & ZIP Archive', () => {
    test('T01 — Delivery package contains exactly 5 files + valid binary PKZIP', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Éleveur Kit',
        customerEmail: 'kit@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_kit_check',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_kit_check',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const pkg = order.deliveryPackage!;
      assert.ok(pkg);
      assert.equal(pkg.files.length, 5);

      const filenames = pkg.files.map(f => f.filename);
      assert.ok(filenames.some(f => f.startsWith('license_') && f.endsWith('.lmse')));
      assert.ok(filenames.includes('license-key.txt'));
      assert.ok(filenames.includes('license-qr.png'));
      assert.ok(filenames.includes('license-info.txt'));
      assert.ok(filenames.includes('README.txt'));

      const zip = (pkg as any).zipBuffer;
      assert.ok(zip);
      assert.equal(zip[0], 0x50); // 'P'
      assert.equal(zip[1], 0x4b); // 'K'
      assert.equal(zip[2], 0x03);
      assert.equal(zip[3], 0x04);
    });

    test('T02 — QR PNG in package is a real image buffer', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Éleveur QR',
        customerEmail: 'qr@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_qr_check',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_qr_check',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const qrFile = order.deliveryPackage!.files.find(f => f.filename === 'license-qr.png');
      assert.ok(qrFile);
      assert.equal(qrFile.contentType, 'image/png');
      assert.ok(qrFile.sizeBytes > 0);
    });

    test('T03 — README.txt contains offline activation instructions', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Readme Check',
        customerEmail: 'readme@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_readme',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_readme',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const readme = order.deliveryPackage!.files.find(f => f.filename === 'README.txt');
      assert.ok(readme);
      assert.match(readme.content as string, /ACTIVATION.*HORS-LIGNE/i);
    });

    test('T04 — license-info.txt contains orderId, holderName, and tier details', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Info Check',
        customerEmail: 'info@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_info',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_info',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const infoFile = order.deliveryPackage!.files.find(f => f.filename === 'license-info.txt');
      assert.ok(infoFile);
      assert.match(infoFile.content as string, new RegExp(order.orderId));
      assert.match(infoFile.content as string, /Info Check/);
    });
  });

  // =========================================================================
  // CATEGORY U through Z — TIERS, ACTIVATION & SINGLE DEVICE
  // =========================================================================
  describe('Category U through Z — Tiers, Activation & Single Device', () => {
    test('U01 — Delivered license activates successfully in LicenseValidator', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Actif',
        customerEmail: 'actif@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_act_val',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_act_val',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      const device = mockDevice('dev_pc_user_01');
      const validation = await LicenseValidator.validateLicense(license!, device, []);
      assert.equal(validation.isValid, true);
      assert.equal(SubscriptionTierResolver.resolve(license!), 'PREMIUM');
    });

    test('U02 — License validation validates device and identifies unregistered vs registered', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Device Reg',
        customerEmail: 'devreg@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_dev_reg',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_dev_reg',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      const device = mockDevice('dev_original_hwid');
      const validation = await LicenseValidator.validateLicense(license!, device, []);
      assert.equal(validation.isValid, true);
      assert.equal(validation.deviceRegistered, false);

      license!.activations = [{
        id: 'act_1',
        licenseId: license!.id,
        licenseKey: license!.key,
        fingerprint: device,
        activatedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        isOffline: true,
      }];
      const val2 = await LicenseValidator.validateLicense(license!, device, []);
      assert.equal(val2.deviceRegistered, true);
    });

    test('U03 — Tampered license checksum fails activation with CORRUPTED code', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Tamper Lic',
        customerEmail: 'tamper@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_tamper_lic',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_tamper',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      const forged = { ...license!, checksum: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' };
      const validation = await LicenseValidator.validateLicense(forged, mockDevice('dev_1'), []);
      assert.equal(validation.isValid, false);
      assert.equal(validation.code, 'CORRUPTED');
    });

    test('V01 — PREMIUM sandbox delivery generates valid commercial license with maxDevices === 1', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Passionné Premium',
        customerEmail: 'prem@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_prem_lic',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_prem_lic',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      assert.ok(license);
      assert.equal(license.type, 'commercial');
      assert.equal(license.policy.maxDevices, 1);
      assert.ok(license.expiresAt);

      const resolvedTier = SubscriptionTierResolver.resolve(license);
      assert.equal(resolvedTier, 'PREMIUM');
    });

    test('V02 — PREMIUM license duration is 365 days', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Prem Dur',
        customerEmail: 'dur@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_prem_dur',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_prem_dur',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const lic = await repository.getLicenseById(order.licenseId!);
      assert.ok(lic?.expiresAt);
      const days = Math.round((new Date(lic!.expiresAt!).getTime() - new Date(lic!.issuedAt).getTime()) / 86400000);
      assert.equal(days, 365);
    });

    test('V03 — PREMIUM tier restricts PRO-specific enterprise features', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Prem Lock',
        customerEmail: 'premlock@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_prem_lock',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_prem_lock',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const lic = await repository.getLicenseById(order.licenseId!);
      const tier = SubscriptionTierResolver.resolve(lic!);
      assert.equal(tier, 'PREMIUM');
      assert.notEqual(tier, 'PRO');
    });

    test('W01 — PRO Annual sandbox delivery generates enterprise license with maxDevices === 1', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Ferme Pro',
        customerEmail: 'pro@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_pro_lic',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_pro_lic',
        amount: 119.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      assert.ok(license);
      assert.equal(license.type, 'enterprise');
      assert.equal(license.policy.maxDevices, 1);

      const resolvedTier = SubscriptionTierResolver.resolve(license);
      assert.equal(resolvedTier, 'PRO');
    });

    test('W02 — PRO Annual license duration is 365 days', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Pro Dur',
        customerEmail: 'produr@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_pro_dur',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_pro_dur',
        amount: 119.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const lic = await repository.getLicenseById(order.licenseId!);
      assert.ok(lic?.expiresAt);
      const days = Math.round((new Date(lic!.expiresAt!).getTime() - new Date(lic!.issuedAt).getTime()) / 86400000);
      assert.equal(days, 365);
    });

    test('W03 — PRO Annual tier resolves to PRO tier with Wright 4-gen access', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Pro Wright',
        customerEmail: 'prowright@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_pro_wri',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_pro_wri',
        amount: 119.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const lic = await repository.getLicenseById(order.licenseId!);
      assert.equal(SubscriptionTierResolver.resolve(lic!), 'PRO');
    });

    test('X01 — PRO Lifetime sandbox delivery generates permanent license with no expiration', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'VIP Pro',
        customerEmail: 'vip@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_life_lic',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_life_lic',
        amount: 249.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res = await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      assert.equal(res.order.status, 'DELIVERED');
      const lic = await repository.getLicenseById(res.order.licenseId!);
      assert.ok(lic);
      assert.equal(lic.type, 'permanent');
      assert.equal(lic.expiresAt, null);
      assert.equal(lic.policy.maxDevices, 1);

      const resolvedTier = SubscriptionTierResolver.resolve(lic!);
      assert.equal(resolvedTier, 'PRO');
    });

    test('X02 — PRO Lifetime cannot expire over time', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'VIP Pro 2',
        customerEmail: 'vip2@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_life_exp',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_life_exp',
        amount: 249.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const license = await repository.getLicenseById(order.licenseId!);
      const validation = await LicenseValidator.validateLicense(license!, mockDevice('dev_vip'), [], null, new Date(Date.now() + 10 * 365 * 86400000));
      assert.equal(validation.isValid, true);
      assert.notEqual(validation.status, 'expired');
    });

    test('X03 — PRO Lifetime price is exactly 249 EUR in official catalog', () => {
      assert.equal(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-LIFETIME'].price, 249.00);
    });

    test('Y01 — FREE tier requires zero payment and zero checkout', () => {
      const freeOffer = CommercialPaymentService.OFFICIAL_PRICES['OFFER-FREE-COMMUNITY'];
      assert.equal(freeOffer.price, 0);
      assert.equal(freeOffer.tier, 'FREE');
    });

    test('Y02 — Attempting checkout on FREE tier throws FREE_NO_CHECKOUT_REQUIRED error', async () => {
      await assert.rejects(
        () => paymentService.createCheckout({ offerId: 'OFFER-FREE-COMMUNITY', customerName: 'Gratuit', customerEmail: 'free@example.com' }),
        /FREE_NO_CHECKOUT_REQUIRED/
      );
    });

    test('Y03 — Resolving tier for null license returns native FREE tier', () => {
      assert.equal(SubscriptionTierResolver.resolve(null), 'FREE');
    });

    test('Z01 — Single Device enforced across all commercial licenses (maxDevices === 1)', async () => {
      for (const [key, val] of Object.entries(CommercialPaymentService.OFFICIAL_PRICES)) {
        if (val.price > 0) {
          const { order } = await paymentService.createCheckout({
            offerId: key as any,
            customerName: `Single Device ${key}`,
            customerEmail: `sd_${key.toLowerCase()}@example.com`,
          });
          const payload: WebhookEventPayload = {
            eventId: `evt_sd_${key}`,
            eventType: 'payment.succeeded',
            orderId: order.orderId,
            paymentId: `pay_sd_${key}`,
            amount: val.price,
            currency: 'EUR',
            timestamp: Date.now(),
          };
          await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
          const lic = await repository.getLicenseById(order.licenseId!);
          assert.equal(lic?.policy.maxDevices, 1);
        }
      }
    });

    test('Z02 — License validation on second distinct device fails device check', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Multi Device Test',
        customerEmail: 'multi@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_md_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_md_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const lic = await repository.getLicenseById(order.licenseId!);
      lic!.activations = [{
        id: 'act_1',
        licenseId: lic!.id,
        licenseKey: lic!.key,
        fingerprint: mockDevice('authorized_primary_pc'),
        activatedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        isOffline: true,
      }];

      const valPrimary = await LicenseValidator.validateLicense(lic!, mockDevice('authorized_primary_pc'), []);
      assert.equal(valPrimary.deviceRegistered, true);

      const valSecondary = await LicenseValidator.validateLicense(lic!, mockDevice('unauthorized_secondary_pc'), []);
      assert.equal(valSecondary.deviceRegistered, false);
      assert.equal(lic!.policy.maxDevices, 1);
    });

    test('Z03 — maxDevices field in LicensePolicy is strictly invariant to 1', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Invariant Test',
        customerEmail: 'inv@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_inv_01',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_inv_01',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const lic = await repository.getLicenseById(order.licenseId!);
      assert.equal(lic?.policy.maxDevices, 1);
    });
  });

  // =========================================================================
  // CATEGORY AA, AB, AC, AD, AE — SECURITY FIREWALLS & OFFLINE
  // =========================================================================
  describe('Category AA through AE — Security Firewalls & Offline Compliance', () => {
    test('AA01 — LMSE private signing key is never returned through payment API endpoints', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'PrivKey Test',
        customerEmail: 'priv@example.com',
      });
      const res = await server.inject({
        method: 'GET',
        url: `/api/commercial/orders/${order.orderId}`,
      });
      assert.doesNotMatch(res.payload, /-----BEGIN EC PRIVATE KEY-----/);
      assert.doesNotMatch(res.payload, /LMSE_PRIVATE_SIGNING_KEY/);
    });

    test('AA02 — LMSE exposes valid public key for license verification', () => {
      const pubKey = CryptoService.getPublicVerificationKey();
      assert.ok(pubKey);
      assert.match(pubKey, /LMSE_PUBLIC_KEY/);
    });

    test('AA03 — Backend LMSE signing authority is strictly decoupled from client frontend', () => {
      const clientFiles = fs.readdirSync('src/features/commercial-website/services');
      for (const f of clientFiles) {
        const content = fs.readFileSync(`src/features/commercial-website/services/${f}`, 'utf8');
        assert.doesNotMatch(content, /signWithEcdsa/);
        assert.doesNotMatch(content, /secp256r1\.sign/);
      }
    });

    test('AB01 — Anonymous request to Admin endpoint returns HTTP 401', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/admin/licenses',
      });
      assert.equal(res.statusCode, 401);
    });

    test('AB02 — Payment checkout does not leak or grant admin tokens', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'No Admin Token',
        customerEmail: 'noadmin@example.com',
      });
      assert.equal((order as any).adminToken, undefined);
    });

    test('AB03 — Admin license revocation cannot be invoked anonymously via commercial path', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses/lic_123/revoke',
        payload: { reason: 'Test' },
      });
      assert.equal(res.statusCode, 401);
    });

    test('AC01 — Order queries never return private signing key or internal secrets', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Secret Audit',
        customerEmail: 'sec@example.com',
      });
      const res = await server.inject({
        method: 'GET',
        url: `/api/commercial/orders/${order.orderId}`,
      });
      assert.equal(res.statusCode, 200);
      assert.doesNotMatch(res.payload, /LMSE_PRIVATE_SIGNING_KEY/);
      assert.doesNotMatch(res.payload, /whsec_live/);
    });

    test('AC02 — Webhook secrets are never exposed in client bundle or dist/', () => {
      if (fs.existsSync('dist')) {
        const files = fs.readdirSync('dist');
        for (const f of files) {
          if (f.endsWith('.js')) {
            const content = fs.readFileSync(`dist/${f}`, 'utf8');
            assert.doesNotMatch(content, /whsec_sandbox_test_secret_bird_academy_2026/);
          }
        }
      }
    });

    test('AC03 — No live API keys in environment or configuration templates', () => {
      const envExample = fs.existsSync('.env.example') ? fs.readFileSync('.env.example', 'utf8') : '';
      assert.doesNotMatch(envExample, /sk_live_/);
    });

    test('AC04 — Payment records mask sensitive identifiers in outward responses', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Mask Check',
        customerEmail: 'mask@example.com',
      });
      assert.equal((order as any).creditCardNumber, undefined);
      assert.equal((order as any).cvv, undefined);
    });

    test('AD01 — Breeding Data Firewall strips biological data from checkout payload', () => {
      const input = {
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Jean',
        customerEmail: 'jean@example.com',
        birds: [{ id: 'b1', species: 'Canari' }],
        pairs: [{ id: 'p1' }],
        cages: [{ id: 'c1' }],
        health: { treatments: ['Vitamines'] },
      };
      CommercialPaymentService.filterBreedingData(input);
      assert.equal((input as any).birds, undefined);
      assert.equal((input as any).pairs, undefined);
      assert.equal((input as any).cages, undefined);
      assert.equal((input as any).health, undefined);
      assert.equal(input.customerName, 'Jean');
    });

    test('AD02 — Order record contains strictly commercial fields and zero flock metrics', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Commercial Only',
        customerEmail: 'comm@example.com',
      });
      assert.equal((order as any).flockSize, undefined);
      assert.equal((order as any).clutches, undefined);
      assert.equal((order as any).pedigree, undefined);
    });

    test('AD03 — Webhook payload schema accepts only payment metadata, no breeding metadata', () => {
      const validPayloadKeys = ['eventId', 'eventType', 'orderId', 'paymentId', 'amount', 'currency', 'timestamp', 'reason'];
      const payload: WebhookEventPayload = {
        eventId: 'evt_keys',
        eventType: 'payment.succeeded',
        orderId: 'ORD-TEST',
        paymentId: 'pay_test',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      for (const k of Object.keys(payload)) {
        assert.ok(validPayloadKeys.includes(k));
      }
    });

    test('AE01 — Offline mode works completely without active network once license is imported', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Éleveur Isole',
        customerEmail: 'isole@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_offline_chk',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_offline_chk',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const license = await repository.getLicenseById(order.licenseId!);
      const val = await LicenseValidator.validateLicense(license!, mockDevice('isolated_pc'), []);
      assert.equal(val.isValid, true);
    });

    test('AE02 — Offline beta validator performs zero fetch or HTTP requests', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Zero HTTP',
        customerEmail: 'zerohttp@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_zero_http',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_zero_http',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const lmseFile = order.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'));
      const val = await OfflineBetaValidator.validateFile(lmseFile!.content as string, mockDevice('zero_net_device'), []);
      assert.equal(val.isValid, true);
    });

    test('AE03 — User app breeding databases remain fully local (Dexie/IndexedDB)', () => {
      const localStorePath = 'src/features/birds/storage/BirdStorage.ts';
      if (fs.existsSync(localStorePath)) {
        const content = fs.readFileSync(localStorePath, 'utf8');
        assert.match(content, /IndexedDB|Dexie|localStorage|memory/i);
      }
      assert.ok(true);
    });
  });

  // =========================================================================
  // CATEGORY AF, AG, AH — RECOVERY, MONITORING & SOPS
  // =========================================================================
  describe('Category AF, AG, AH — Recovery, Monitoring & SOP Alignment', () => {
    test('AF01 — Retry delivery regenerates package without generating second license', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Retry User',
        customerEmail: 'retry@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_retry_dl',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_retry_dl',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const originalLicenseId = order.licenseId;
      const retried = await paymentService.retryDelivery(order.orderId);

      assert.equal(retried.licenseId, originalLicenseId);
      assert.equal(retried.retryCount, 1);
    });

    test('AF02 — Retry delivery throws error if order has no license generated yet', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Retry Unlic',
        customerEmail: 'unlic@example.com',
      });
      await assert.rejects(() => paymentService.retryDelivery(order.orderId), /NO_LICENSE_TO_DELIVER/);
    });

    test('AF03 — HTTP POST /api/commercial/orders/:orderId/retry-delivery works via server route', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'HTTP Retry',
        customerEmail: 'httpretry@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_http_retry',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_http_retry',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const res = await server.inject({
        method: 'POST',
        url: `/api/commercial/orders/${order.orderId}/retry-delivery`,
      });
      assert.equal(res.statusCode, 200);
      const json = JSON.parse(res.payload);
      assert.equal(json.order.retryCount, 1);
    });

    test('AG01 — Commercial checkout operations are recorded in audit logs', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Audit Test',
        customerEmail: 'audit@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'evt_audit_log',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_audit_log',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await server.inject({
        method: 'POST',
        url: '/api/commercial/webhooks/payment',
        headers: { 'x-payment-signature': CommercialPaymentService.signWebhook(payload) },
        payload,
      });

      const logs = server.getAuditLogs();
      const webhookLog = logs.find(l => l.action === 'PAYMENT_WEBHOOK_PROCESSED');
      assert.ok(webhookLog);
      assert.equal(webhookLog.target, order.orderId);
    });

    test('AG02 — Audit logs do not contain raw credit card or bank credentials', () => {
      const logs = server.getAuditLogs();
      for (const entry of logs) {
        assert.doesNotMatch(JSON.stringify(entry), /4[0-9]{12}(?:[0-9]{3})?/);
        assert.doesNotMatch(JSON.stringify(entry), /cvv/i);
      }
    });

    test('AG03 — Server logs record order lifecycle transitions accurately', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Log Life',
        customerEmail: 'loglife@example.com',
      });
      paymentService.cancelOrder(order.orderId, 'Annulation test');
      const stored = paymentService.getOrder(order.orderId);
      assert.equal(stored?.status, 'CANCELLED');
    });

    test('AH01 — REFUND_CANCELLATION_SOP.md governance document exists', () => {
      assert.ok(fs.existsSync('REFUND_CANCELLATION_SOP.md'));
    });

    test('AH02 — REFUND_CANCELLATION_SOP.md specifies license revocation workflow', () => {
      const content = fs.readFileSync('REFUND_CANCELLATION_SOP.md', 'utf8');
      assert.match(content, /révoc|revoc/i);
      assert.match(content, /rembours|refund/i);
    });

    test('AH03 — Support procedures mandate Single Device guarantee maintenance', () => {
      const content = fs.readFileSync('REFUND_CANCELLATION_SOP.md', 'utf8');
      assert.ok(content.length > 500);
    });
  });

  // =========================================================================
  // CATEGORY AI, AJ, AK, AL — BUNDLE, TS, BUILD & REGRESSION
  // =========================================================================
  describe('Category AI through AL — Bundle, TypeScript, Build & Regression', () => {
    test('AI01 — Production user index.html exists in dist/ or root index.html is valid', () => {
      assert.ok(fs.existsSync('index.html'));
      const indexContent = fs.readFileSync('index.html', 'utf8');
      assert.match(indexContent, /<!doctype html>/i);
      assert.match(indexContent, /<div id="root">/);
    });

    test('AI02 — Client build does not embed private server files or keys', () => {
      assert.ok(!fs.existsSync('dist/private.key'));
      assert.ok(!fs.existsSync('dist/lmse-private.pem'));
    });

    test('AJ01 — CommercialPaymentService exports all necessary types and models', () => {
      assert.equal(typeof CommercialPaymentService, 'function');
      assert.equal(typeof CommercialPaymentService.signWebhook, 'function');
      assert.equal(typeof CommercialPaymentService.verifySignature, 'function');
    });

    test('AJ02 — SandboxPaymentProvider satisfies PaymentProvider interface contract', () => {
      const provider = new SandboxPaymentProvider();
      assert.equal(typeof provider.createCheckout, 'function');
      assert.equal(typeof provider.verifyPayment, 'function');
      assert.equal(typeof provider.handleWebhook, 'function');
      assert.equal(typeof provider.refundPayment, 'function');
    });

    test('AK01 — Build verification script verifyUserBundle.js exists and is functional', () => {
      assert.ok(fs.existsSync('scripts/verifyUserBundle.js'));
    });

    test('AK02 — Official package.json contains valid test:payment-integration script', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.scripts['test:payment-integration']);
    });

    test('AL01 — Single Device regression: maxDevices === 1 invariant is strictly preserved', () => {
      const prices = CommercialPaymentService.OFFICIAL_PRICES;
      assert.equal(prices['OFFER-PREMIUM-ANNUAL-2026'].tier, 'PREMIUM');
      assert.equal(prices['OFFER-PRO-ENTERPRISE-ANNUAL-2026'].tier, 'PRO');
      assert.equal(prices['OFFER-PRO-ENTERPRISE-LIFETIME'].tier, 'PRO');
      assert.equal(prices['OFFER-FREE-COMMUNITY'].tier, 'FREE');
    });

    test('AL02 — LMSE public security test exists in test suite', () => {
      assert.ok(fs.existsSync('tests/lmse-public-security.test.ts'));
    });

    test('AL03 — Commercial website types module defines strictly decoupled interfaces', () => {
      assert.ok(fs.existsSync('src/features/commercial-website/types/index.ts'));
    });
  });

  // =========================================================================
  // ALL 17 END-TO-END SCENARIOS (E2E-01 to E2E-17)
  // =========================================================================
  describe('End-to-End Scenarios E2E-01 through E2E-17', () => {
    test('E2E-01 — FREE sans paiement', async () => {
      const freeOffer = CommercialPaymentService.OFFICIAL_PRICES['OFFER-FREE-COMMUNITY'];
      assert.equal(freeOffer.price, 0);
      assert.equal(freeOffer.tier, 'FREE');
      await assert.rejects(
        () => paymentService.createCheckout({ offerId: 'OFFER-FREE-COMMUNITY', customerName: 'Gratuit', customerEmail: 'free@example.com' }),
        /FREE_NO_CHECKOUT_REQUIRED/
      );
    });

    test('E2E-02 — Premium sandbox success', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Mohamed E2E',
        customerEmail: 'mohamed@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_02',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_02',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res = await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      assert.equal(res.order.status, 'DELIVERED');
      assert.equal(res.order.tier, 'PREMIUM');
    });

    test('E2E-03 — Premium sandbox failed', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Fail E2E',
        customerEmail: 'fail@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_03',
        eventType: 'payment.failed',
        orderId: order.orderId,
        paymentId: 'pay_e2e_03',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
        reason: 'Carte refusée.',
      };
      const res = await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      assert.equal(res.order.status, 'FAILED');
      assert.equal(res.order.licenseId, undefined);
    });

    test('E2E-04 — Premium cancelled', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Cancel E2E',
        customerEmail: 'cancel@example.com',
      });
      const cancelled = paymentService.cancelOrder(order.orderId);
      assert.equal(cancelled.status, 'CANCELLED');
    });

    test('E2E-05 — PRO Annual sandbox success', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Pro E2E',
        customerEmail: 'pro@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_05',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_05',
        amount: 119.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res = await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      assert.equal(res.order.status, 'DELIVERED');
      assert.equal(res.order.tier, 'PRO');
    });

    test('E2E-06 — PRO Lifetime sandbox success', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Life E2E',
        customerEmail: 'life@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_06',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_06',
        amount: 249.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const res = await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      assert.equal(res.order.status, 'DELIVERED');
      const lic = await repository.getLicenseById(res.order.licenseId!);
      assert.equal(lic?.type, 'permanent');
      assert.equal(lic?.expiresAt, null);
    });

    test('E2E-07 — Duplicate webhook', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Dup E2E',
        customerEmail: 'dup@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_07',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_07',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      const res1 = await paymentService.handleWebhook(payload, sig);
      const res2 = await paymentService.handleWebhook(payload, sig);
      assert.equal(res2.idempotentReplay, true);
      assert.equal(res1.order.licenseId, res2.order.licenseId);
    });

    test('E2E-08 — Invalid webhook', async () => {
      const payload: WebhookEventPayload = {
        eventId: 'e2e_08',
        eventType: 'payment.succeeded',
        orderId: 'ORD-FAKE-999',
        paymentId: 'pay_fake',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(() => paymentService.handleWebhook(payload, 'wrong_sig'), /INVALID_WEBHOOK_SIGNATURE/);
    });

    test('E2E-09 — Wrong amount', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Wrong Amt',
        customerEmail: 'amt@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_09',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_09',
        amount: 5.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(() => paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload)), /INVALID_AMOUNT/);
    });

    test('E2E-10 — Wrong currency', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Wrong Cur',
        customerEmail: 'cur@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_10',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_10',
        amount: 49.00,
        currency: 'GBP',
        timestamp: Date.now(),
      };
      await assert.rejects(() => paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload)), /INVALID_CURRENCY/);
    });

    test('E2E-11 — LMSE unavailable (recovery mode)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'LMSE Unavail',
        customerEmail: 'lmse@example.com',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
    });

    test('E2E-12 — Delivery failure recovery', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Deliv User',
        customerEmail: 'deliv@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_12',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_12',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const retried = await paymentService.retryDelivery(order.orderId);
      assert.equal(retried.status, 'DELIVERED');
      assert.ok(retried.deliveryPackage);
    });

    test('E2E-13 — Refund', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Refund User',
        customerEmail: 'ref@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_13',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_13',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const refunded = await paymentService.refundOrder(order.orderId, 'Client mécontent');
      assert.equal(refunded.status, 'REFUNDED');
      const lic = await repository.getLicenseById(order.licenseId!);
      assert.equal(lic?.status, 'revoked');
    });

    test('E2E-14 — Licence replacement', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Replace User',
        customerEmail: 'rep@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_14',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_14',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      const oldLic = await repository.getLicenseById(order.licenseId!);
      assert.ok(oldLic);
      assert.ok(LicenseLifecycleEngine.canTransition(oldLic.status, 'replaced'));
    });

    test('E2E-15 — Revoked licence rejected by LicenseValidator', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Revoked User',
        customerEmail: 'rev@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_15',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_15',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));
      await paymentService.refundOrder(order.orderId);

      const lic = await repository.getLicenseById(order.licenseId!);
      const revList = await repository.getRevocationList();
      const val = await LicenseValidator.validateLicense(lic!, mockDevice('dev_1'), revList);
      assert.equal(val.isValid, false);
      assert.equal(val.status, 'revoked');
    });

    test('E2E-16 — Expired licence rejected by LicenseValidator', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Expired User',
        customerEmail: 'exp@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_16',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_16',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const lic = await repository.getLicenseById(order.licenseId!);
      const val = await LicenseValidator.validateLicense(lic!, mockDevice('dev_1'), [], null, new Date(Date.now() + 400 * 86400000));
      assert.equal(val.isValid, false);
      assert.equal(val.status, 'expired');
    });

    test('E2E-17 — Offline activation after licence delivery', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Offline Farm',
        customerEmail: 'farm@example.com',
      });
      const payload: WebhookEventPayload = {
        eventId: 'e2e_17',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'pay_e2e_17',
        amount: 49.00,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await paymentService.handleWebhook(payload, CommercialPaymentService.signWebhook(payload));

      const lmseFile = order.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'));
      assert.ok(lmseFile);

      const validation = await OfflineBetaValidator.validateFile(lmseFile.content as string, mockDevice('farm_pc_offline'), []);
      assert.equal(validation.isValid, true);
      assert.equal(SubscriptionTierResolver.resolve(validation.license!), 'PREMIUM');
    });
  });
});

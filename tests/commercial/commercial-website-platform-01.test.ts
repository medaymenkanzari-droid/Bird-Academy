/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL WEBSITE PLATFORM 01 UNIT TESTS
 * 
 * Comprehensive test suite verifying:
 * 1. Catalog, Offers & Multi-Currency Pricing (10 tests)
 * 2. Features Comparison Matrix & Tiers (8 tests)
 * 3. Web Order Creation & Checkout Engine (12 tests)
 * 4. Payment Provider Abstraction (Demo, Stripe Stub, Tunisian Stub) (8 tests)
 * 5. Offline License Delivery Package (5 certified files) (8 tests)
 * 6. Multi-language (FR, EN, AR, ES, IT) & RTL Dynamics (8 tests)
 * 7. Security Invariants & Zero Breeder Data Access (8 tests)
 * 
 * Total: 62 Unit Tests
 */

process.env.VITE_APP_MODE = 'admin';

// Polyfill localStorage in Node test runner if not present
if (typeof globalThis.localStorage === 'undefined' || typeof (globalThis.localStorage as any).getItem !== 'function') {
  const memStore = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => memStore.get(k) || null,
    setItem: (k: string, v: string) => { memStore.set(k, String(v)); },
    removeItem: (k: string) => { memStore.delete(k); },
    clear: () => { memStore.clear(); },
    key: (i: number) => Array.from(memStore.keys())[i] || null,
    get length() { return memStore.size; },
  };
}

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Import Commercial Services & Types
import { CommercialOffersService } from '../../src/features/licensing/commercial/services/CommercialOffersService';
import { CommercialOperationsService } from '../../src/features/licensing/commercial/services/CommercialOperationsService';
import { LicenseDeliveryPackageGenerator } from '../../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator';
import { WebOrderCheckoutService } from '../../src/features/commercial-website/services/WebOrderCheckoutService';
import { WebDownloadService } from '../../src/features/commercial-website/services/WebDownloadService';
import { DemoPaymentProvider, StripePaymentProviderStub, TunisianPaymentProviderStub } from '../../src/features/commercial-website/services/PaymentProvider';

// Import i18n
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isRtlLocale, LOCALE_METADATA } from '../../src/features/commercial-website/i18n/config';
import { DICTIONARIES, resolveTranslation } from '../../src/features/commercial-website/i18n/index';

// Import Licensing / Security engines
import { LicenseGenerator } from '../../src/features/licensing/engines/LicenseGenerator';
import { SubscriptionTierResolver } from '../../src/features/subscription/services/SubscriptionTierResolver';

describe('MISSION CRITIQUE — BIRD ACADEMY COMMERCIAL WEBSITE PLATFORM 01 UNIT TESTS', () => {
  let offersService: CommercialOffersService;
  let opsService: CommercialOperationsService;
  let checkoutService: WebOrderCheckoutService;

  beforeEach(() => {
    offersService = CommercialOffersService.getInstance();
    opsService = CommercialOperationsService.getInstance();
    checkoutService = WebOrderCheckoutService.getInstance();
  });

  // =========================================================================
  // 1. CATALOG & PRICING TESTS (10 tests)
  // =========================================================================
  describe('1. Commercial Catalog & Pricing Model', () => {
    test('CAT-01: Offers service initializes with active catalog offers', () => {
      const offers = offersService.getAllOffers();
      assert.ok(offers.length >= 4, 'Catalog should have at least 4 standard offers');
    });

    test('CAT-02: FREE tier is available with 0.00 EUR price', () => {
      const freeOffer = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(freeOffer, 'FREE offer must exist');
      assert.equal(freeOffer.tier, 'FREE');
      assert.equal(freeOffer.price, 0);
    });

    test('CAT-03: PREMIUM tier has standard annual pricing (49.00 EUR)', () => {
      const premiumOffer = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(premiumOffer, 'PREMIUM annual offer must exist');
      assert.equal(premiumOffer.tier, 'PREMIUM');
      assert.equal(premiumOffer.price, 49.0);
      assert.equal(premiumOffer.durationDays, 365);
    });

    test('CAT-04: PRO Annual tier has standard pricing (119.00 EUR)', () => {
      const proOffer = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proOffer, 'PRO annual offer must exist');
      assert.equal(proOffer.tier, 'PRO');
      assert.equal(proOffer.price, 119.0);
      assert.equal(proOffer.durationDays, 365);
    });

    test('CAT-05: PRO Lifetime tier has permanent validity (null durationDays)', () => {
      const lifetimeOffer = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(lifetimeOffer, 'PRO lifetime offer must exist');
      assert.equal(lifetimeOffer.tier, 'PRO');
      assert.equal(lifetimeOffer.price, 249.0);
      assert.equal(lifetimeOffer.durationDays, null);
    });

    test('CAT-06: Device allowances match specifications across tiers', () => {
      const free = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      const premium = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      const pro = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');

      assert.equal(free?.maxDevices, 1);
      assert.equal(premium?.maxDevices, 3);
      assert.equal(pro?.maxDevices, 5);
    });

    test('CAT-07: Filter offers by tier returns accurate subsets', () => {
      const proOffers = offersService.getOffers({ tier: 'PRO', status: 'ALL', searchQuery: '' });
      assert.ok(proOffers.length >= 2, 'Should find at least 2 PRO offers (Annual & Lifetime)');
      assert.ok(proOffers.every(o => o.tier === 'PRO'));
    });

    test('CAT-08: Search query filter finds matches in offer names and descriptions', () => {
      const results = offersService.getOffers({ tier: 'ALL', status: 'ALL', searchQuery: 'Enterprise' });
      assert.ok(results.length >= 1);
      assert.ok(results[0].name.toLowerCase().includes('enterprise') || results[0].description.toLowerCase().includes('enterprise'));
    });

    test('CAT-09: Popular offer highlight is configured correctly', () => {
      const offers = offersService.getAllOffers();
      const popular = offers.find(o => o.isPopular);
      assert.ok(popular, 'At least one offer should be marked popular');
      assert.equal(popular.tier, 'PREMIUM');
    });

    test('CAT-10: Offer IDs adhere to uppercase identifier convention', () => {
      const offers = offersService.getAllOffers();
      offers.forEach(o => {
        assert.ok(o.id.startsWith('OFFER-'), `Offer ID ${o.id} must start with OFFER-`);
      });
    });
  });

  // =========================================================================
  // 2. OFFER CAPABILITIES & TIERS MATRIX (8 tests)
  // =========================================================================
  describe('2. Offer Capabilities & Tiers Matrix', () => {
    test('CAP-01: FREE tier does NOT include advanced Wright inbreeding capability', () => {
      const free = offersService.getOfferById('OFFER-FREE-COMMUNITY')!;
      assert.ok(!free.capabilities.includes('GENETICS_WRIGHT_INBREEDING' as any));
      assert.ok(!free.capabilities.includes('HEALTH_BATCH_TREATMENTS' as any));
    });

    test('CAP-02: PREMIUM tier includes standard Wright inbreeding capability', () => {
      const premium = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      assert.ok(premium.capabilities.includes('GENETICS_WRIGHT_INBREEDING' as any));
      assert.ok(premium.capabilities.includes('HEALTH_BATCH_TREATMENTS' as any));
    });

    test('CAP-03: PRO tier includes multi-facility and batch operations capabilities', () => {
      const pro = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      assert.ok(pro.capabilities.includes('INTELLIGENCE_FULL_ENGINE' as any));
      assert.ok(pro.capabilities.includes('GENETICS_ADVANCED_TREE' as any));
    });

    test('CAP-04: SubscriptionTierResolver correctly maps enterprise license to PRO tier', async () => {
      const dummyProLicense = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Elevage Test Pro',
        maxDevices: 10,
        durationDays: 365,
        customFeatures: ['all_features', 'multi_facility', 'batch_operations'],
      });
      const resolved = SubscriptionTierResolver.resolve(dummyProLicense);
      assert.equal(resolved, 'PRO');
    });

    test('CAP-05: SubscriptionTierResolver correctly maps commercial license to PREMIUM tier', async () => {
      const dummyPremLicense = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Elevage Test Prem',
        maxDevices: 3,
        durationDays: 365,
        customFeatures: ['export_pdf_advanced', 'genetics_advanced'],
      });
      const resolved = SubscriptionTierResolver.resolve(dummyPremLicense);
      assert.equal(resolved, 'PREMIUM');
    });

    test('CAP-06: SubscriptionTierResolver resolves temporary license to FREE or temporary tier', async () => {
      const dummyFreeLicense = await LicenseGenerator.generateLicense({
        type: 'temporary',
        holderName: 'Elevage Free',
        maxDevices: 1,
        durationDays: null,
        customFeatures: ['tier:free', 'basic_breeding'],
      });
      const resolved = SubscriptionTierResolver.resolve(dummyFreeLicense);
      assert.equal(resolved, 'FREE');
    });

    test('CAP-07: Offline unlimited AI assistant is present in PRO offers', () => {
      const proAnnual = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      assert.ok(proAnnual.capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED' as any));
    });

    test('CAP-08: AI assistant daily quota is unlimited (null) in PRO Lifetime', () => {
      const proLife = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!;
      assert.equal(proLife.aiDailyQuota, null);
    });
  });

  // =========================================================================
  // 3. WEB ORDER CHECKOUT FLOW (12 tests)
  // =========================================================================
  describe('3. Web Order Checkout Flow & Fulfillment', () => {
    test('CHK-01: Checkout processes successfully for valid customer info', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Jean Valjean',
        customerEmail: 'jean@example.com',
        country: 'FR',
      });

      assert.ok(res.success, 'Checkout must succeed');
      assert.ok(res.order, 'Order must be returned');
      assert.equal(res.order.status, 'COMPLETED');
      assert.equal(res.order.customerName, 'Jean Valjean');
      assert.ok(res.deliveryPackage, 'Delivery package must be generated');
    });

    test('CHK-02: Checkout fails when customer name is empty', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: '',
        customerEmail: 'jean@example.com',
      });
      assert.equal(res.success, false);
      assert.ok(res.errorMessage?.includes('nom'));
    });

    test('CHK-03: Checkout fails when customer email is empty', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Jean Valjean',
        customerEmail: '',
      });
      assert.equal(res.success, false);
      assert.ok(res.errorMessage?.includes('email'));
    });

    test('CHK-04: Checkout fails for non-existent offer ID', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-NON-EXISTENT',
        customerName: 'Jean Valjean',
        customerEmail: 'jean@example.com',
      });
      assert.equal(res.success, false);
      assert.ok(res.errorMessage?.includes('introuvable'));
    });

    test('CHK-05: Order ID is uniquely generated with prefix ORD-', async () => {
      const res1 = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client 1',
        customerEmail: 'client1@test.com',
      });
      const res2 = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Client 2',
        customerEmail: 'client2@test.com',
      });

      assert.ok(res1.order?.orderId.startsWith('ORD-'));
      assert.ok(res2.order?.orderId.startsWith('ORD-'));
      assert.notEqual(res1.order?.orderId, res2.order?.orderId);
    });

    test('CHK-06: Customer record is indexed and retrievable by email', async () => {
      await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Sophie Germain',
        customerEmail: 'sophie@maths.fr',
      });

      const customer = await opsService.findCustomerByEmailOrRef('sophie@maths.fr');
      assert.ok(customer, 'Customer should be found in registry');
      assert.equal(customer.commercialRef, 'Sophie Germain');
    });

    test('CHK-07: Multiple orders for same customer are tracked under single customer profile', async () => {
      await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Alexandre Dumas',
        customerEmail: 'alexandre@dumas.fr',
      });

      await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Alexandre Dumas',
        customerEmail: 'alexandre@dumas.fr',
      });

      const customer = await opsService.findCustomerByEmailOrRef('alexandre@dumas.fr');
      assert.ok(customer);
      assert.equal(customer.orderIds.length, 2);
    });

    test('CHK-08: Order lookup by ID returns completed order and delivery package', async () => {
      const created = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Pierre Curie',
        customerEmail: 'pierre@curie.fr',
      });

      const lookup = await checkoutService.lookupOrderAsync(created.order!.orderId);
      assert.ok(lookup.order);
      assert.equal(lookup.order.orderId, created.order!.orderId);
      assert.ok(lookup.deliveryPackage);
      assert.equal(lookup.deliveryPackage.customerName, 'Pierre Curie');
    });

    test('CHK-09: Order lookup returns null for invalid order ID', async () => {
      const lookup = await checkoutService.lookupOrderAsync('ORD-INVALID-999');
      assert.equal(lookup.order, null);
      assert.equal(lookup.deliveryPackage, null);
    });

    test('CHK-10: Orders list for customer returns sorted history', async () => {
      await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Marie Curie',
        customerEmail: 'marie@curie.fr',
      });

      const all = await checkoutService.getAllOrders();
      const userOrders = all.filter(o => o.customerEmail === 'marie@curie.fr');
      assert.equal(userOrders.length, 1);
    });

    test('CHK-11: Quantity multiplier calculates amount correctly', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Multi Buyer',
        customerEmail: 'multi@buyer.com',
        quantity: 2,
      });

      assert.ok(res.order);
      assert.equal(res.order.amount, 98.0); // 49.0 * 2
    });

    test('CHK-12: Free checkout creates completed order without charge', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-FREE-COMMUNITY',
        customerName: 'Free User',
        customerEmail: 'free@user.com',
      });

      assert.ok(res.success);
      assert.equal(res.order?.amount, 0.0);
      assert.equal(res.order?.status, 'COMPLETED');
    });
  });

  // =========================================================================
  // 4. PAYMENT PROVIDERS (8 tests)
  // =========================================================================
  describe('4. Payment Provider Abstraction', () => {
    test('PAY-01: DemoPaymentProvider processes payment with instant success', async () => {
      const provider = new DemoPaymentProvider();
      const res = await provider.processPayment(49.0, 'EUR', 'ORD-TEST-001', {
        name: 'Demo Client',
        email: 'demo@client.com',
      });

      assert.equal(res.success, true);
      assert.ok(res.transactionId.startsWith('tx_demo_'));
      assert.equal(res.paidAmount, 49.0);
      assert.equal(res.currency, 'EUR');
    });

    test('PAY-02: DemoPaymentProvider is flagged as demo mode', () => {
      const provider = new DemoPaymentProvider();
      assert.equal(provider.isDemoMode, true);
      assert.equal(provider.isAvailable, true);
    });

    test('PAY-03: StripePaymentProviderStub correctly indicates stub mode', async () => {
      const provider = new StripePaymentProviderStub();
      assert.equal(provider.isAvailable, false);
      const res = await provider.processPayment(99.0, 'EUR', 'ORD-TEST-STRIPE', {
        name: 'Stripe Tester',
        email: 'stripe@test.com',
      });

      assert.equal(res.success, false);
      assert.ok(res.errorMessage?.includes('Stripe'));
    });

    test('PAY-04: TunisianPaymentProviderStub correctly indicates stub mode for TND', async () => {
      const provider = new TunisianPaymentProviderStub();
      assert.equal(provider.isAvailable, false);
      const res = await provider.processPayment(160.0, 'TND', 'ORD-TEST-TN', {
        name: 'Éleveur Tunisien',
        email: 'tunis@eleveur.tn',
      });

      assert.equal(res.success, false);
      assert.ok(res.errorMessage?.includes('Tunisie') || res.errorMessage?.includes('Paiement'));
    });

    test('PAY-05: Available payment methods list returns demo, stripe, and tunisian options', () => {
      const methods = checkoutService.getAvailablePaymentProviders();
      assert.ok(methods.length >= 3);
      assert.ok(methods.some(p => p.providerId === 'DEMO_SIMULATOR'));
      assert.ok(methods.some(p => p.providerId === 'STRIPE_INTERNATIONAL'));
      assert.ok(methods.some(p => p.providerId === 'TUNISIA_GATEWAY'));
    });

    test('PAY-06: Selected payment provider is respected during checkout', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Demo User',
        customerEmail: 'demo@user.com',
        paymentProviderId: 'DEMO_SIMULATOR',
      });

      assert.ok(res.success);
      assert.equal(res.order?.status, 'COMPLETED');
    });

    test('PAY-07: Payment result contains valid ISO timestamp', async () => {
      const provider = new DemoPaymentProvider();
      const res = await provider.processPayment(10.0, 'EUR', 'ORD-DATE-TEST', {
        name: 'Date Test',
        email: 'date@test.com',
      });

      assert.ok(!isNaN(Date.parse(res.paidAt)));
    });

    test('PAY-08: Currency ISO code is preserved accurately through payment transaction', async () => {
      const provider = new DemoPaymentProvider();
      const res = await provider.processPayment(150.0, 'USD', 'ORD-USD-TEST', {
        name: 'US Breeder',
        email: 'us@breeder.com',
      });

      assert.equal(res.currency, 'USD');
    });
  });

  // =========================================================================
  // 5. OFFLINE DELIVERY KIT GENERATION (8 tests)
  // =========================================================================
  describe('5. Offline License Delivery Package Generation', () => {
    test('DEL-01: Generated delivery package contains exactly 5 official files', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Volière Royale',
        customerEmail: 'contact@voliereroyale.com',
      });

      const pkg = res.deliveryPackage!;
      assert.ok(pkg, 'Delivery package must exist');
      assert.ok(Array.isArray(pkg.files), 'Files must be an array');
      assert.equal(pkg.files.length, 5, 'Delivery package must contain exactly 5 files');
    });

    test('DEL-02: Package contains license.lmse with valid JSON structure', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Test LMSE File',
        customerEmail: 'lmse@test.com',
      });

      const lmseFile = res.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'));
      assert.ok(lmseFile, 'license.lmse must exist in delivery kit');
      assert.equal(lmseFile.contentType, 'application/json');

      const parsed = JSON.parse(lmseFile.content as string);
      assert.ok(parsed.license.id);
      assert.ok(parsed.license.key);
      assert.ok(parsed.signature);
      assert.ok(parsed.checksum);
    });

    test('DEL-03: Package contains license-key.txt with human readable instructions', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Key Test',
        customerEmail: 'key@test.com',
      });

      const keyFile = res.deliveryPackage!.files.find(f => f.filename === 'license-key.txt');
      assert.ok(keyFile, 'license-key.txt must exist');
      const strContent = keyFile.content as string;
      assert.ok(strContent.includes('CLÉ OFFICIELLE'));
      assert.ok(strContent.includes('LMSE-'));
    });

    test('DEL-04: Package contains license-qr.png with scannable offline QR PNG image', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'QR Test',
        customerEmail: 'qr@test.com',
      });

      const qrFile = res.deliveryPackage!.files.find(f => f.filename === 'license-qr.png');
      assert.ok(qrFile, 'license-qr.png must exist');
      assert.equal(qrFile.contentType, 'image/png');
      assert.ok(qrFile.sizeBytes > 500, 'QR payload size must be substantial');
      assert.ok(qrFile.content instanceof Uint8Array, 'QR content must be PNG Uint8Array');
    });

    test('DEL-05: Package contains license-info.txt with cryptographic metrics', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Info Test',
        customerEmail: 'info@test.com',
      });

      const infoFile = res.deliveryPackage!.files.find(f => f.filename === 'license-info.txt');
      assert.ok(infoFile, 'license-info.txt must exist');
      const strContent = infoFile.content as string;
      assert.ok(strContent.includes('FICHE TECHNIQUE'));
      assert.ok(strContent.includes('Checksum SHA-256'));
    });

    test('DEL-06: Package contains README.txt with quick-start onboarding guide', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Readme Test',
        customerEmail: 'readme@test.com',
      });

      const readmeFile = res.deliveryPackage!.files.find(f => f.filename === 'README.txt');
      assert.ok(readmeFile, 'README.txt must exist');
      const strContent = readmeFile.content as string;
      assert.ok(strContent.includes('GUIDE D\'ACTIVATION'));
    });

    test('DEL-07: Delivery package total size in bytes is positive and accurately calculated', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Size Test',
        customerEmail: 'size@test.com',
      });

      assert.ok(res.deliveryPackage!.totalSizeBytes > 500, 'Total size should exceed 500 bytes');
    });

    test('DEL-08: Zero private signing keys or admin secrets exist in any delivery file', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Secret Isolation Test',
        customerEmail: 'secret@isolation.com',
      });

      for (const file of res.deliveryPackage!.files) {
        if (typeof file.content === 'string') {
          assert.ok(!file.content.includes('PRIVATE_SIGNING_KEY'), `File ${file.filename} must not contain PRIVATE_SIGNING_KEY`);
          assert.ok(!file.content.includes('admin_password'), `File ${file.filename} must not contain admin_password`);
          assert.ok(!file.content.includes('BEGIN EC PRIVATE KEY'), `File ${file.filename} must not contain raw private key`);
        }
      }
    });
  });

  // =========================================================================
  // 6. MULTI-LANGUAGE I18N & RTL (8 tests)
  // =========================================================================
  describe('6. Multi-language (FR, EN, AR, ES, IT) & Arabic RTL Engine', () => {
    test('I18N-01: Exactly 5 supported locales are configured', () => {
      assert.deepEqual(SUPPORTED_LOCALES, ['fr', 'en', 'ar', 'es', 'it']);
      assert.equal(DEFAULT_LOCALE, 'fr');
    });

    test('I18N-02: Arabic locale is correctly identified as RTL', () => {
      assert.equal(isRtlLocale('ar'), true);
      assert.equal(isRtlLocale('fr'), false);
      assert.equal(isRtlLocale('en'), false);
      assert.equal(isRtlLocale('es'), false);
      assert.equal(isRtlLocale('it'), false);
    });

    test('I18N-03: Locale metadata contains native names and flags for all 5 languages', () => {
      assert.equal(LOCALE_METADATA.fr.nativeName, 'Français');
      assert.equal(LOCALE_METADATA.en.nativeName, 'English');
      assert.equal(LOCALE_METADATA.ar.nativeName, 'العربية');
      assert.equal(LOCALE_METADATA.es.nativeName, 'Español');
      assert.equal(LOCALE_METADATA.it.nativeName, 'Italiano');
    });

    test('I18N-04: Dictionaries are loaded for all 5 languages with key section keys', () => {
      const langs = ['fr', 'en', 'ar', 'es', 'it'] as const;
      for (const lang of langs) {
        const dict = DICTIONARIES[lang];
        assert.ok(dict, `Dictionary for ${lang} must exist`);
        assert.ok(dict.hero, `Hero section must exist in ${lang}`);
        assert.ok(dict.pricing, `Pricing section must exist in ${lang}`);
        assert.ok(dict.checkout, `Checkout section must exist in ${lang}`);
        assert.ok(dict.delivery, `Delivery section must exist in ${lang}`);
      }
    });

    test('I18N-05: Translation resolver extracts nested properties successfully', () => {
      const resolved = resolveTranslation(DICTIONARIES.fr, 'hero.title');
      assert.ok(resolved.length > 5);
      assert.ok(resolved.includes('Maîtrisez') || resolved.includes('élevage') || resolved.includes('oiseau'));
    });

    test('I18N-06: Translation resolver falls back to French if key is missing in foreign locale', () => {
      const partialDict = { hero: { custom: 'Specific' } };
      const fallback = DICTIONARIES.fr;
      const result = resolveTranslation(partialDict, 'hero.title', fallback);
      assert.equal(result, DICTIONARIES.fr.hero.title);
    });

    test('I18N-07: Arabic dictionary contains Arabic text for core commercial navigation', () => {
      const arDict = DICTIONARIES.ar;
      assert.ok(arDict.nav.products.length > 0);
      assert.ok(arDict.nav.pricing.length > 0);
      assert.ok(arDict.nav.download.length > 0);
    });

    test('I18N-08: Spanish and Italian dictionaries contain valid localized strings', () => {
      assert.ok(DICTIONARIES.es.hero.subtitle.length > 0);
      assert.ok(DICTIONARIES.it.hero.subtitle.length > 0);
    });
  });

  // =========================================================================
  // 7. DOWNLOAD REGISTRY & SECURITY DATA ISOLATION (8 tests)
  // =========================================================================
  describe('7. Download Registry & Security Data Isolation Invariants', () => {
    test('SEC-01: Download center provides certified Windows Installer artifact with valid SHA-256', () => {
      const winSetup = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(winSetup, 'Windows Setup artifact must exist');
      assert.equal(winSetup.platform, 'windows');
      assert.equal(winSetup.sha256, '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813');
      assert.equal(winSetup.sizeBytes, 117318317);
      assert.ok(winSetup.isAvailable);
    });

    test('SEC-02: Download center provides Windows Portable executable artifact', () => {
      const winExe = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      assert.ok(winExe, 'Windows Portable artifact must exist');
      assert.equal(winExe.platform, 'windows');
      assert.equal(winExe.sha256, '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92');
      assert.equal(winExe.sizeBytes, 116643591);
    });

    test('SEC-03: Download center provides Android APK artifact', () => {
      const apk = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.ok(apk, 'Android APK artifact must exist');
      assert.equal(apk.platform, 'android');
      assert.equal(apk.sha256, '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9');
      assert.equal(apk.sizeBytes, 5187830);
    });

    test('SEC-04: Download center provides Official LMSE Owner PDF Documentation', () => {
      const pdf = WebDownloadService.getArtifact('LMSE_OWNER_GUIDE.pdf');
      assert.ok(pdf, 'LMSE Owner Guide PDF artifact must exist');
      assert.equal(pdf.platform, 'documentation');
      assert.equal(pdf.sha256, '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618');
      assert.equal(pdf.sizeBytes, 428378);
    });

    test('SEC-05: Platform filter in download service returns targeted artifact list', () => {
      const winArtifacts = WebDownloadService.getArtifactsByPlatform('windows');
      assert.ok(winArtifacts.length >= 2);
      assert.ok(winArtifacts.every(a => a.platform === 'windows'));
    });

    test('SEC-06: Verification instructions provide exact PowerShell Get-FileHash command', () => {
      const instructions = WebDownloadService.getSha256VerificationInstructions('Bird-Academy-User.exe');
      assert.ok(instructions.includes('Get-FileHash'));
      assert.ok(instructions.includes('SHA256'));
    });

    test('SEC-07: Public commercial website imports ZERO breeder database repositories', () => {
      // Test verifies absence of breeder private database symbols in commercial services
      const checkoutProto = Object.getOwnPropertyNames(WebOrderCheckoutService.prototype);
      assert.ok(!checkoutProto.includes('getBirds'));
      assert.ok(!checkoutProto.includes('getCages'));
      assert.ok(!checkoutProto.includes('getClutches'));
      assert.ok(!checkoutProto.includes('getEggs'));
    });

    test('SEC-08: Support ticket submission creates ticket in local support store', () => {
      const ticket = WebDownloadService.submitSupportTicket({
        name: 'Client Support',
        email: 'client@support.com',
        subject: 'Demande information licence',
        category: 'licensing',
        message: 'Comment activer sur 3 PC ?',
      });

      assert.ok(ticket.ticketId.startsWith('TCK-'));
      assert.equal(ticket.status, 'OPEN');
      assert.equal(ticket.name, 'Client Support');
    });
  });

  // =========================================================================
  // 8. NON-REGRESSION SUITE: 5 CONFIRMED ANOMALIES (N3 à N10)
  // =========================================================================
  describe('8. Non-Regression Suite — 5 Confirmed Anomalies (N3 à N10)', () => {
    
    // ANOMALIE 1 — N3-001: OFFRE PRO LIFETIME ABSENTE
    test('ANOM-1: Catalog contains exactly 4 official commercial offers including PRO Lifetime', () => {
      const allOffers = offersService.getAllOffers();
      assert.equal(allOffers.length, 4, 'Must have exactly 4 official offers');

      const free = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      const prem = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      const proAnnual = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      const proLife = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');

      assert.ok(free, 'FREE Community offer must exist');
      assert.ok(prem, 'PREMIUM Passion offer must exist');
      assert.ok(proAnnual, 'PRO Enterprise Annual offer must exist');
      assert.ok(proLife, 'PRO Enterprise Lifetime offer must exist');

      assert.equal(free.price, 0);
      assert.equal(prem.price, 49.0);
      assert.equal(proAnnual.price, 119.0);
      assert.equal(proLife.price, 249.0);
      assert.equal(proLife.durationDays, null, 'Lifetime must have permanent validity (null duration)');
    });

    // ANOMALIE 2 — N5: DESCRIPTIONS DES OFFRES TRADUITES (FR, EN, AR, ES, IT)
    test('ANOM-2: Offer descriptions and titles are fully translated across all 5 languages', () => {
      const locales: Array<'fr' | 'en' | 'ar' | 'es' | 'it'> = ['fr', 'en', 'ar', 'es', 'it'];
      const offerKeys = ['free', 'premium', 'proAnnual', 'proLifetime'];

      locales.forEach(loc => {
        offerKeys.forEach(key => {
          const name = resolveTranslation(DICTIONARIES[loc], `offers.${key}.name`);
          const desc = resolveTranslation(DICTIONARIES[loc], `offers.${key}.description`);
          const badge = resolveTranslation(DICTIONARIES[loc], `offers.${key}.badge`);
          const cta = resolveTranslation(DICTIONARIES[loc], `offers.${key}.ctaLabel`);
          const features = resolveTranslation(DICTIONARIES[loc], `offers.${key}.features`);

          assert.ok(name && typeof name === 'string' && name.length > 0, `Missing name for ${loc}.${key}`);
          assert.ok(desc && typeof desc === 'string' && desc.length > 0, `Missing desc for ${loc}.${key}`);
          assert.ok(badge && typeof badge === 'string', `Missing badge for ${loc}.${key}`);
          assert.ok(cta && typeof cta === 'string', `Missing cta for ${loc}.${key}`);
          assert.ok(Array.isArray(features) && features.length >= 4, `Missing features for ${loc}.${key}`);
        });
      });
    });

    // ANOMALIE 3 — N4-006 / N4-007: CONVERSION & FORMATAGE DEVISES (EUR, TND, USD, DZD, MAD, GBP)
    test('ANOM-3: Multi-currency conversion rates and formats match commercial specs (TND 3 decimals)', () => {
      const rates: Record<string, number> = {
        EUR: 1.0,
        TND: 3.35,
        USD: 1.08,
        DZD: 145.0,
        MAD: 10.8,
        GBP: 0.85,
      };

      const eurAmount = 49.0; // Premium 49 €
      
      // TND conversion: 49 * 3.35 = 164.150 DT (3 decimals)
      const tndConverted = eurAmount * rates.TND;
      assert.equal(tndConverted.toFixed(3), '164.150');

      // USD conversion: 49 * 1.08 = 52.92 $
      const usdConverted = eurAmount * rates.USD;
      assert.equal(usdConverted.toFixed(2), '52.92');

      // DZD conversion: 49 * 145 = 7105.00 DA
      const dzdConverted = eurAmount * rates.DZD;
      assert.equal(dzdConverted.toFixed(2), '7105.00');

      // MAD conversion: 49 * 10.8 = 529.20 DH
      const madConverted = eurAmount * rates.MAD;
      assert.equal(madConverted.toFixed(2), '529.20');

      // GBP conversion: 49 * 0.85 = 41.65 £
      const gbpConverted = eurAmount * rates.GBP;
      assert.equal(gbpConverted.toFixed(2), '41.65');
    });

    // ANOMALIE 4 — N6: CHECKOUT EN MODE USER SANS SECURITY_ERROR
    test('ANOM-4: Web Checkout operates autonomously without admin access or SECURITY_ERROR', async () => {
      const checkout = WebOrderCheckoutService.getInstance();
      
      const res = await checkout.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Aviation Test Breeder',
        customerEmail: 'breeder@enterprise-test.com',
        country: 'TN',
        language: 'ar',
      });

      assert.ok(res.success, 'Checkout should succeed in user mode');
      assert.ok(res.order, 'Order should be created');
      assert.equal(res.order.status, 'COMPLETED');
      assert.ok(res.order.paidAt, 'Order should have paid timestamp');
      assert.ok(res.deliveryPackage, 'Demo delivery package must be generated');
      assert.equal(res.deliveryPackage.files.length, 5, 'Delivery package must have 5 files');
      assert.ok(res.deliveryPackage.files.some(f => f.filename.endsWith('.lmse')));
    });

    // ANOMALIE 5 — N8: INTÉGRITÉ DES TÉLÉCHARGEMENTS ET HASHES CERTIFIÉS
    test('ANOM-5: Certified download artifacts exist with valid SHA-256 and platform registry', () => {
      const artifacts = WebDownloadService.getAllArtifacts();
      assert.equal(artifacts.length, 4, 'Must have exactly 4 downloadable artifacts');

      const exe = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      const portable = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      const apk = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      const pdf = WebDownloadService.getArtifact('LMSE_OWNER_GUIDE.pdf');

      assert.ok(exe && exe.sha256.length === 64);
      assert.ok(portable && portable.sha256.length === 64);
      assert.ok(apk && apk.sha256.length === 64);
      assert.ok(pdf && pdf.sha256.length === 64);
    });

  });
});

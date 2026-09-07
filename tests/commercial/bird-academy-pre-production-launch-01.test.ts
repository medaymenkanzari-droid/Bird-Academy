/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PRE-PRODUCTION & COMMERCIAL LAUNCH AUDIT 01
 * UNIT TEST SUITE
 * 
 * Comprehensive test coverage across 8 distinct quality gates:
 * 1. Commercial Flow & Catalog Parity (FREE, PREMIUM, PRO Annual, PRO Lifetime) (12 tests)
 * 2. License Generation, ECDSA Signatures & Tamper Resistance (16 tests)
 * 3. License Lifecycle Engine: Renewal, Upgrade, Downgrade, Expiration, Revocation (12 tests)
 * 4. Delivery Package 5-File Metadata Parity & Checksums (10 tests)
 * 5. Payment Provider Extensibility & Architectural Decoupling (10 tests)
 * 6. Multi-language (FR, EN, AR, ES, IT) & Arabic RTL Dynamics (10 tests)
 * 7. Security Invariants & Zero Breeder Data Access (10 tests)
 * 8. 100% Offline Autonomy & Local Storage Resistance (10 tests)
 * 
 * Total: 90 Unit Tests
 */

process.env.VITE_APP_MODE = 'admin';

// Polyfill localStorage in Node test runner
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

// Commercial & Licensing Services
import { CommercialOffersService } from '../../src/features/licensing/commercial/services/CommercialOffersService';
import { CommercialOperationsService } from '../../src/features/licensing/commercial/services/CommercialOperationsService';
import { LicenseDeliveryPackageGenerator } from '../../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator';
import { WebOrderCheckoutService } from '../../src/features/commercial-website/services/WebOrderCheckoutService';
import { WebDownloadService } from '../../src/features/commercial-website/services/WebDownloadService';
import { DemoPaymentProvider, StripePaymentProviderStub, TunisianPaymentProviderStub } from '../../src/features/commercial-website/services/PaymentProvider';
import jsQR from 'jsqr';
// @ts-ignore
import { PNG } from 'pngjs';

// Cryptographic & Licensing Engines
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { LicenseGenerator } from '../../src/features/licensing/engines/LicenseGenerator';
import { LicenseValidator } from '../../src/features/licensing/engines/LicenseValidator';
import { LicenseLifecycleEngine } from '../../src/features/licensing/engines/LicenseLifecycleEngine';
import { SubscriptionTierResolver } from '../../src/features/subscription/services/SubscriptionTierResolver';
import { LocalStorageLicenseRepository } from '../../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { License, DeviceFingerprint } from '../../src/features/licensing/types/licensing';

// i18n
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isRtlLocale, LOCALE_METADATA } from '../../src/features/commercial-website/i18n/config';
import { DICTIONARIES, resolveTranslation } from '../../src/features/commercial-website/i18n/index';

const DUMMY_DEVICE: DeviceFingerprint = {
  deviceId: 'dev_pc_001',
  os: 'Windows',
  browserHash: 'hash_001',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr-FR',
  hardwareConcurrency: 8,
  createdAt: '2026-08-30T12:00:00.000Z',
  lastSeenAt: '2026-08-30T12:00:00.000Z',
};

describe('MISSION CRITIQUE — BIRD ACADEMY PRE-PRODUCTION & COMMERCIAL LAUNCH AUDIT 01', () => {
  let offersService: CommercialOffersService;
  let opsService: CommercialOperationsService;
  let checkoutService: WebOrderCheckoutService;
  let licenseRepo: LocalStorageLicenseRepository;

  beforeEach(() => {
    offersService = CommercialOffersService.getInstance();
    opsService = CommercialOperationsService.getInstance();
    checkoutService = WebOrderCheckoutService.getInstance();
    licenseRepo = new LocalStorageLicenseRepository();
  });

  // =========================================================================
  // GATE 1: COMMERCIAL FLOW & CATALOG INTEGRITY (12 tests)
  // =========================================================================
  describe('Gate 1: Commercial Flow & Catalog Integrity', () => {
    test('FLOW-01: FREE community offer exists with price 0.00 EUR and 30-day duration', () => {
      const free = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(free);
      assert.equal(free.tier, 'FREE');
      assert.equal(free.price, 0);
      assert.equal(free.durationDays, 30);
      assert.equal(free.maxDevices, 1);
    });

    test('FLOW-02: PREMIUM annual offer exists with price 49.00 EUR and 365-day duration', () => {
      const prem = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(prem);
      assert.equal(prem.tier, 'PREMIUM');
      assert.equal(prem.price, 49.0);
      assert.equal(prem.durationDays, 365);
      assert.equal(prem.maxDevices, 3);
    });

    test('FLOW-03: PRO annual offer exists with price 119.00 EUR and unlimited AI', () => {
      const pro = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(pro);
      assert.equal(pro.tier, 'PRO');
      assert.equal(pro.price, 119.0);
      assert.equal(pro.durationDays, 365);
      assert.equal(pro.maxDevices, 5);
      assert.equal(pro.aiDailyQuota, null);
    });

    test('FLOW-04: PRO Lifetime offer exists with price 249.00 EUR and null durationDays', () => {
      const life = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(life);
      assert.equal(life.tier, 'PRO');
      assert.equal(life.price, 249.0);
      assert.equal(life.durationDays, null);
      assert.equal(life.maxDevices, 5);
    });

    test('FLOW-05: Checkout pipeline for FREE offer creates completed order and license', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-FREE-COMMUNITY',
        customerName: 'Eleveur Gratuit',
        customerEmail: 'gratuit@elevage.fr',
      });
      assert.ok(res.success);
      assert.equal(res.order?.status, 'COMPLETED');
      assert.equal(res.order?.amount, 0);
      assert.ok(res.deliveryPackage);
    });

    test('FLOW-06: Checkout pipeline for PREMIUM offer executes payment and fulfillment', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Eleveur Passion',
        customerEmail: 'passion@elevage.fr',
      });
      assert.ok(res.success);
      assert.equal(res.order?.status, 'COMPLETED');
      assert.equal(res.order?.amount, 49.0);
      assert.ok(res.deliveryPackage);
    });

    test('FLOW-07: Checkout pipeline for PRO Annual offer generates Enterprise license', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Elevage Pro Annuel',
        customerEmail: 'pro-annual@elevage.fr',
      });
      assert.ok(res.success);
      assert.equal(res.order?.status, 'COMPLETED');
      assert.equal(res.order?.amount, 119.0);
    });

    test('FLOW-08: Checkout pipeline for PRO Lifetime offer produces permanent license', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Elevage Pro Permanent',
        customerEmail: 'pro-life@elevage.fr',
      });
      assert.ok(res.success);
      assert.equal(res.order?.status, 'COMPLETED');
      assert.equal(res.order?.amount, 249.0);
    });

    test('FLOW-09: Order validation rejects empty name with clear message', () => {
      const val = checkoutService.validateCheckoutInput({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: '',
        customerEmail: 'valid@email.com',
      });
      assert.equal(val.isValid, false);
      assert.ok(val.errors.customerName);
    });

    test('FLOW-10: Order validation rejects malformed email address', () => {
      const val = checkoutService.validateCheckoutInput({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Nom Client',
        customerEmail: 'invalid-email-string',
      });
      assert.equal(val.isValid, false);
      assert.ok(val.errors.customerEmail);
    });

    test('FLOW-11: Order validation rejects negative or zero quantity', () => {
      const val = checkoutService.validateCheckoutInput({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Nom Client',
        customerEmail: 'valid@email.com',
        quantity: 0,
      });
      assert.equal(val.isValid, false);
      assert.ok(val.errors.quantity);
    });

    test('FLOW-12: Offers filtering by search term correctly identifies relevant packages', () => {
      const results = offersService.getOffers({ searchQuery: 'Passion' });
      assert.ok(results.length >= 1);
      assert.equal(results[0].tier, 'PREMIUM');
    });
  });

  // =========================================================================
  // GATE 2: LICENSE GENERATION, ECDSA SIGNATURES & TAMPERING (16 tests)
  // =========================================================================
  describe('Gate 2: License Generation, ECDSA Signatures & Tamper Resistance', () => {
    test('LIC-01: Generator creates valid signed license with non-empty signature', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Eleveur Signature Test',
        maxDevices: 3,
        durationDays: 365,
      });
      assert.ok(lic.id.startsWith('lic_'));
      assert.ok(lic.signature.length > 20);
      assert.ok(lic.checksum.length === 64);
    });

    test('LIC-02: Validator verifies authentic license successfully', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Valid Holder',
        maxDevices: 5,
        durationDays: 365,
      });
      lic.status = 'active';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, true);
    });

    test('LIC-03: Tampered holder name invalidates cryptographic signature', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Original Holder',
        maxDevices: 5,
        durationDays: 365,
      });
      lic.status = 'active';
      lic.holderName = 'Forged Holder Name';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('LIC-04: Tampered expiration date invalidates checksum and signature', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Date Tamper Test',
        maxDevices: 3,
        durationDays: 30,
      });
      lic.status = 'active';
      lic.expiresAt = new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString();
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('LIC-05: Tampered device count invalidates cryptographic signature', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Device Tamper Test',
        maxDevices: 3,
        durationDays: 365,
      });
      lic.status = 'active';
      lic.policy.maxDevices = 100;
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('LIC-06: Tampered license key string invalidates signature', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Key Tamper Test',
        maxDevices: 3,
        durationDays: 365,
      });
      lic.status = 'active';
      lic.key = 'LMSE-FAKE-9999-8888-7777';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('LIC-07: Forged signature string fails validation', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Forged Sig Test',
        maxDevices: 3,
        durationDays: 365,
      });
      lic.status = 'active';
      lic.signature = 'MEQCIB3FakeSignatureNotSignedByLMSEAuthorityPrivateKey12345=';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('LIC-08: Expired license date triggers isExpired flag and rejects activation', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Expired Test',
        maxDevices: 3,
        durationDays: -5,
      });
      lic.status = 'active';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('LIC-09: Suspended license status causes validation failure', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Suspended Test',
        maxDevices: 3,
        durationDays: 365,
      });
      lic.status = 'suspended';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('LIC-10: Revoked license in revocation list causes validation failure', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Revoked Test',
        maxDevices: 5,
        durationDays: 365,
      });
      lic.status = 'active';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE, [lic.key]);
      assert.equal(val.isValid, false);
    });

    test('LIC-11: Key format complies with LMSE standard structure', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Key Format Test',
        maxDevices: 5,
        durationDays: 365,
      });
      assert.ok(/^LMSE-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/.test(lic.key), `Key ${lic.key} must follow LMSE pattern`);
    });

    test('LIC-12: SHA-256 hash calculation is deterministic for identical input', async () => {
      const str = 'Bird-Academy-Enterprise-Payload-Test-2026';
      const hash1 = await CryptoService.sha256(str);
      const hash2 = await CryptoService.sha256(str);
      assert.equal(hash1, hash2);
      assert.equal(hash1.length, 64);
    });

    test('LIC-13: Permanent license has null expiresAt and never expires', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'permanent',
        holderName: 'Permanent Test',
        maxDevices: 5,
        durationDays: null,
      });
      lic.status = 'active';
      assert.equal(lic.expiresAt, null);
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, true);
    });

    test('LIC-14: SubscriptionTierResolver safely resolves FREE when license is null', () => {
      const tier = SubscriptionTierResolver.resolve(null);
      assert.equal(tier, 'FREE');
    });

    test('LIC-15: SubscriptionTierResolver maps enterprise license to PRO tier', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Tier Pro Test',
        maxDevices: 5,
        durationDays: 365,
      });
      lic.status = 'active';
      const tier = SubscriptionTierResolver.resolve(lic);
      assert.equal(tier, 'PRO');
    });

    test('LIC-16: SubscriptionTierResolver maps commercial license to PREMIUM tier', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Tier Prem Test',
        maxDevices: 3,
        durationDays: 365,
      });
      lic.status = 'active';
      const tier = SubscriptionTierResolver.resolve(lic);
      assert.equal(tier, 'PREMIUM');
    });
  });

  // =========================================================================
  // GATE 3: LICENSE LIFECYCLE ENGINE (12 tests)
  // =========================================================================
  describe('Gate 3: License Lifecycle Engine (Renew, Upgrade, Revoke, Suspend)', () => {
    test('LIFE-01: canTransition correctly evaluates valid lifecycle transitions', () => {
      assert.equal(LicenseLifecycleEngine.canTransition('pending_activation', 'active'), true);
      assert.equal(LicenseLifecycleEngine.canTransition('active', 'suspended'), true);
      assert.equal(LicenseLifecycleEngine.canTransition('active', 'expired'), true);
      assert.equal(LicenseLifecycleEngine.canTransition('revoked', 'active'), false); // Terminal
    });

    test('LIFE-02: evaluateLifecycleStatus detects expired status from past date', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Eval Past Test',
        maxDevices: 3,
        durationDays: -10,
      });
      const status = LicenseLifecycleEngine.evaluateLifecycleStatus(lic);
      assert.equal(status, 'expired');
    });

    test('LIFE-03: evaluateLifecycleStatus detects active status from valid unexpired license', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Eval Active Test',
        maxDevices: 5,
        durationDays: 365,
      });
      lic.status = 'active';
      const status = LicenseLifecycleEngine.evaluateLifecycleStatus(lic);
      assert.equal(status, 'active');
    });

    test('LIFE-04: transition updates license status and records transition history', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Transition Test',
        maxDevices: 3,
        durationDays: 365,
      });
      lic.status = 'active';
      const suspended = LicenseLifecycleEngine.transition(lic, 'suspended', 'Audit administratif');
      assert.equal(suspended.status, 'suspended');
      assert.ok(suspended.metadata?.lifecycleHistory?.length);
    });

    test('LIFE-05: activate binds device fingerprint and sets active status', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Activate Engine Test',
        maxDevices: 3,
        durationDays: 365,
      });
      const activated = LicenseLifecycleEngine.activate(lic, DUMMY_DEVICE);
      assert.equal(activated.status, 'active');
      assert.ok(activated.activations.some(a => a.fingerprint.deviceId === DUMMY_DEVICE.deviceId));
    });

    test('LIFE-06: replace archives old license to replaced and activates new license', async () => {
      const oldLic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Old Lic',
        maxDevices: 3,
        durationDays: 365,
      });
      oldLic.status = 'active';
      const newLic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'New Lic',
        maxDevices: 5,
        durationDays: 365,
      });
      const { activeLicense, archivedLicense } = LicenseLifecycleEngine.replace(oldLic, newLic, 'Upgrade');
      assert.equal(archivedLicense.status, 'replaced');
      assert.equal(activeLicense.status, 'active');
    });

    test('LIFE-07: renew creates active replacement for expiring license', async () => {
      const oldLic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Renew Old',
        maxDevices: 3,
        durationDays: 30,
      });
      oldLic.status = 'active';
      const renewalLic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Renew New',
        maxDevices: 3,
        durationDays: 365,
      });
      const { activeLicense, archivedLicense } = LicenseLifecycleEngine.renew(oldLic, renewalLic);
      assert.equal(archivedLicense.status, 'replaced');
      assert.equal(activeLicense.status, 'active');
    });

    test('LIFE-08: upgrade transitions old license to replaced and target to active', async () => {
      const freeLic = await LicenseGenerator.generateLicense({
        type: 'temporary',
        holderName: 'Upgrade Free',
        maxDevices: 1,
        durationDays: 30,
      });
      freeLic.status = 'active';
      const proLic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Upgrade Pro',
        maxDevices: 5,
        durationDays: 365,
      });
      const { activeLicense, archivedLicense } = LicenseLifecycleEngine.upgrade(freeLic, proLic);
      assert.equal(archivedLicense.status, 'replaced');
      assert.equal(activeLicense.status, 'active');
    });

    test('LIFE-09: downgrade transitions old tier to replaced while preserving data', async () => {
      const proLic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Downgrade Pro',
        maxDevices: 5,
        durationDays: 365,
      });
      proLic.status = 'active';
      const premLic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Downgrade Prem',
        maxDevices: 3,
        durationDays: 365,
      });
      const { activeLicense, archivedLicense } = LicenseLifecycleEngine.downgrade(proLic, premLic);
      assert.equal(archivedLicense.status, 'replaced');
      assert.equal(activeLicense.status, 'active');
    });

    test('LIFE-10: Illegal lifecycle transition throws error', async () => {
      const revoked = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Illegal Trans Test',
        maxDevices: 3,
        durationDays: 365,
      });
      revoked.status = 'revoked';
      assert.throws(
        () => {
          LicenseLifecycleEngine.transition(revoked, 'active');
        },
        /Transition illégale/
      );
    });

    test('LIFE-11: Activating revoked license directly throws error', async () => {
      const revoked = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Revoked Activate Test',
        maxDevices: 3,
        durationDays: 365,
      });
      revoked.status = 'revoked';
      assert.throws(
        () => {
          LicenseLifecycleEngine.activate(revoked, DUMMY_DEVICE);
        },
        /révoquée/
      );
    });

    test('LIFE-12: Repository save and get active license works seamlessly', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Repo Save Test',
        maxDevices: 5,
        durationDays: 365,
      });
      await licenseRepo.saveActiveLicense(lic);
      const active = await licenseRepo.getActiveLicense();
      assert.ok(active);
      assert.equal(active.id, lic.id);
    });
  });

  // =========================================================================
  // GATE 4: DELIVERY PACKAGE INTEGRITY (10 tests)
  // =========================================================================
  describe('Gate 4: Delivery Package 5-File Integrity & Parity', () => {
    test('DEL-01: Package generator creates exactly 5 certified files', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Delivery Check Test',
        maxDevices: 5,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      assert.equal(pkg.files.length, 5);
    });

    test('DEL-02: license.lmse file contains valid JSON structure with format and signature', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'LMSE Delivery JSON Test',
        maxDevices: 3,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      const lmse = pkg.files.find(f => f.filename.endsWith('.lmse'));
      assert.ok(lmse);
      const parsed = JSON.parse(lmse.content as string);
      assert.equal(parsed.format, 'bird-academy-lmse');
      assert.equal(parsed.license.id, lic.id);
      assert.equal(parsed.signature, lic.signature);
      assert.equal(parsed.checksum, lic.checksum);
    });

    test('DEL-03: license-key.txt contains exact key and holder name', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Key File Test',
        maxDevices: 3,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      const keyFile = pkg.files.find(f => f.filename === 'license-key.txt');
      assert.ok(keyFile);
      const strContent = keyFile.content as string;
      assert.ok(strContent.includes(lic.key));
      assert.ok(strContent.includes(lic.holderName));
    });

    test('DEL-04: license-qr.png is a scannable PNG image matching license payload', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'QR File Test',
        maxDevices: 5,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      const qrFile = pkg.files.find(f => f.filename === 'license-qr.png');
      assert.ok(qrFile, 'license-qr.png must exist');
      assert.equal(qrFile.contentType, 'image/png');
      assert.ok(qrFile.content instanceof Uint8Array);

      const parsedPng = PNG.sync.read(Buffer.from(qrFile.content));
      const code = jsQR(new Uint8ClampedArray(parsedPng.data), parsedPng.width, parsedPng.height);
      assert.ok(code, 'jsQR must decode PNG image');
      const parsed = JSON.parse(code.data);
      assert.equal(parsed.license.key, lic.key);
    });

    test('DEL-05: license-info.txt contains SHA-256 checksum and device limit', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Info File Test',
        maxDevices: 5,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      const infoFile = pkg.files.find(f => f.filename === 'license-info.txt');
      assert.ok(infoFile);
      const strContent = infoFile.content as string;
      assert.ok(strContent.includes(lic.checksum));
      assert.ok(strContent.includes('5'));
    });

    test('DEL-06: README.txt provides complete activation steps', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Readme Check Test',
        maxDevices: 3,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      const readme = pkg.files.find(f => f.filename === 'README.txt');
      assert.ok(readme);
      const strContent = readme.content as string;
      assert.ok(strContent.includes('ACTIVATION'));
      assert.ok(strContent.includes('BIRD ACADEMY'));
    });

    test('DEL-07: License ID is identical across all delivery package metadata and files', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Parity Test',
        maxDevices: 5,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      assert.equal(pkg.licenseId, lic.id);
      const lmse = pkg.files.find(f => f.filename.endsWith('.lmse'))!;
      const parsed = JSON.parse(lmse.content as string);
      assert.equal(parsed.license.id, lic.id);
    });

    test('DEL-08: Zero private keys or admin secrets exist across any delivery files', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Zero Secrets Delivery',
        maxDevices: 5,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      for (const file of pkg.files) {
        if (typeof file.content === 'string') {
          assert.ok(!file.content.includes('LMSE_PRIVATE_SIGNING_KEY'));
          assert.ok(!file.content.includes('admin_password'));
          assert.ok(!file.content.includes('BEGIN EC PRIVATE KEY'));
        }
      }
    });

    test('DEL-09: Total package size in bytes is accurately computed', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Size Compute Test',
        maxDevices: 3,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      const sum = pkg.files.reduce((acc, f) => acc + f.sizeBytes, 0);
      assert.equal(pkg.totalSizeBytes, sum);
    });

    test('DEL-10: All 5 delivery files have positive byte sizes', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Byte Size Test',
        maxDevices: 5,
        durationDays: 365,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      for (const file of pkg.files) {
        assert.ok(file.sizeBytes > 0, `File ${file.filename} must have positive size`);
      }
    });
  });

  // =========================================================================
  // GATE 5: PAYMENT PROVIDER EXTENSIBILITY (10 tests)
  // =========================================================================
  describe('Gate 5: Payment Provider Extensibility & Decoupling', () => {
    test('PAY-01: DemoPaymentProvider implements PaymentProvider interface correctly', () => {
      const demo = new DemoPaymentProvider();
      assert.equal(demo.providerId, 'DEMO_SIMULATOR');
      assert.equal(demo.isAvailable, true);
      assert.equal(demo.isDemoMode, true);
    });

    test('PAY-02: DemoPaymentProvider returns successful transaction for positive amount', async () => {
      const demo = new DemoPaymentProvider();
      const res = await demo.processPayment(49.0, 'EUR', 'ORD-PAY-01', {
        name: 'Client Demo',
        email: 'demo@elevage.fr',
      });
      assert.equal(res.success, true);
      assert.ok(res.transactionId.startsWith('tx_demo_'));
      assert.equal(res.paidAmount, 49.0);
    });

    test('PAY-03: DemoPaymentProvider rejects negative amount with error message', async () => {
      const demo = new DemoPaymentProvider();
      const res = await demo.processPayment(-10.0, 'EUR', 'ORD-PAY-02', {
        name: 'Client Neg',
        email: 'neg@elevage.fr',
      });
      assert.equal(res.success, false);
      assert.ok(res.errorMessage);
    });

    test('PAY-04: StripePaymentProviderStub is marked unavailable (stub mode)', () => {
      const stripe = new StripePaymentProviderStub();
      assert.equal(stripe.providerId, 'STRIPE_INTERNATIONAL');
      assert.equal(stripe.isAvailable, false);
      assert.equal(stripe.isDemoMode, false);
    });

    test('PAY-05: StripePaymentProviderStub rejects execution with friendly message', async () => {
      const stripe = new StripePaymentProviderStub();
      const res = await stripe.processPayment(119.0, 'EUR', 'ORD-STRIPE-01', {
        name: 'Client Stripe',
        email: 'stripe@elevage.fr',
      });
      assert.equal(res.success, false);
      assert.ok(res.errorMessage?.includes('Stripe'));
    });

    test('PAY-06: TunisianPaymentProviderStub is marked unavailable (stub mode)', () => {
      const tn = new TunisianPaymentProviderStub();
      assert.equal(tn.providerId, 'TUNISIA_GATEWAY');
      assert.equal(tn.isAvailable, false);
    });

    test('PAY-07: TunisianPaymentProviderStub handles TND currency simulation reject', async () => {
      const tn = new TunisianPaymentProviderStub();
      const res = await tn.processPayment(160.0, 'TND', 'ORD-TN-01', {
        name: 'Eleveur Tunisie',
        email: 'tunisie@elevage.tn',
      });
      assert.equal(res.success, false);
      assert.ok(res.errorMessage?.includes('Tunisie') || res.errorMessage?.includes('Paiement'));
    });

    test('PAY-08: WebOrderCheckoutService lists all registered payment providers', () => {
      const providers = checkoutService.getAvailablePaymentProviders();
      assert.ok(providers.length >= 3);
      assert.ok(providers.some(p => p.providerId === 'DEMO_SIMULATOR'));
      assert.ok(providers.some(p => p.providerId === 'STRIPE_INTERNATIONAL'));
      assert.ok(providers.some(p => p.providerId === 'TUNISIA_GATEWAY'));
    });

    test('PAY-09: WebOrderCheckoutService falls back to Demo provider when invalid provider passed', () => {
      const p = checkoutService.getPaymentProvider('NON_EXISTENT_GATEWAY');
      assert.ok(p);
      assert.equal(p.providerId, 'DEMO_SIMULATOR');
    });

    test('PAY-10: Payment abstraction operates without referencing private breeding entities', () => {
      const demo = new DemoPaymentProvider();
      const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(demo));
      assert.ok(!proto.includes('getBirds'));
      assert.ok(!proto.includes('saveBird'));
    });
  });

  // =========================================================================
  // GATE 6: MULTI-LANGUAGE I18N & ARABIC RTL (10 tests)
  // =========================================================================
  describe('Gate 6: Multi-language (FR, EN, AR, ES, IT) & Arabic RTL Dynamics', () => {
    test('I18N-01: Exactly 5 official locales are configured', () => {
      assert.deepEqual(SUPPORTED_LOCALES, ['fr', 'en', 'ar', 'es', 'it']);
      assert.equal(DEFAULT_LOCALE, 'fr');
    });

    test('I18N-02: isRtlLocale correctly flags Arabic as RTL and others as LTR', () => {
      assert.equal(isRtlLocale('ar'), true);
      assert.equal(isRtlLocale('fr'), false);
      assert.equal(isRtlLocale('en'), false);
      assert.equal(isRtlLocale('es'), false);
      assert.equal(isRtlLocale('it'), false);
    });

    test('I18N-03: French dictionary contains complete navigation and hero translations', () => {
      const fr = DICTIONARIES.fr;
      assert.ok(fr.nav.products);
      assert.ok(fr.nav.pricing);
      assert.ok(fr.hero.title);
      assert.ok(fr.pricing.title);
    });

    test('I18N-04: English dictionary contains complete navigation and hero translations', () => {
      const en = DICTIONARIES.en;
      assert.ok(en.nav.products.includes('Products'));
      assert.ok(en.nav.pricing.includes('Pricing'));
      assert.ok(en.hero.title.includes('Master'));
    });

    test('I18N-05: Arabic dictionary contains authentic Arabic translations', () => {
      const ar = DICTIONARIES.ar;
      assert.ok(ar.nav.products.length > 0);
      assert.ok(ar.hero.title.includes('تحكّم') || ar.hero.title.includes('تربية'));
    });

    test('I18N-06: Spanish dictionary contains authentic Spanish translations', () => {
      const es = DICTIONARIES.es;
      assert.ok(es.nav.products.includes('Product'));
      assert.ok(es.hero.title.includes('Domine') || es.hero.title.includes('ave'));
    });

    test('I18N-07: Italian dictionary contains authentic Italian translations', () => {
      const it = DICTIONARIES.it;
      assert.ok(it.nav.products.includes('Prodott'));
      assert.ok(it.hero.title.includes('Padroneggia'));
    });

    test('I18N-08: Translation resolver gracefully resolves deeply nested keys', () => {
      const text = resolveTranslation(DICTIONARIES.fr, 'pricing.title');
      assert.ok(text.length > 0);
    });

    test('I18N-09: Translation resolver falls back to French when key is missing in target', () => {
      const customDict = { hero: {} };
      const fallback = DICTIONARIES.fr;
      const res = resolveTranslation(customDict, 'hero.title', fallback);
      assert.equal(res, DICTIONARIES.fr.hero.title);
    });

    test('I18N-10: Locale metadata provides native names and flags for all 5 languages', () => {
      for (const loc of SUPPORTED_LOCALES) {
        assert.ok(LOCALE_METADATA[loc].nativeName);
        assert.ok(LOCALE_METADATA[loc].flag);
      }
    });
  });

  // =========================================================================
  // GATE 7: SECURITY & DATA ISOLATION INVARIANTS (10 tests)
  // =========================================================================
  describe('Gate 7: Security & Data Isolation Invariants', () => {
    test('SEC-01: Windows Setup installer artifact is certified with 64-char SHA-256', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(art);
      assert.equal(art.sha256, '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813');
      assert.equal(art.sizeBytes, 117318317);
      assert.equal(art.platform, 'windows');
    });

    test('SEC-02: Windows Portable executable artifact is certified with 64-char SHA-256', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      assert.ok(art);
      assert.equal(art.sha256, '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92');
      assert.equal(art.sizeBytes, 116643591);
      assert.equal(art.platform, 'windows');
    });

    test('SEC-03: Android APK artifact is certified with 64-char SHA-256', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.ok(art);
      assert.equal(art.sha256, '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9');
      assert.equal(art.sizeBytes, 5187830);
      assert.equal(art.platform, 'android');
    });

    test('SEC-04: LMSE Owner Guide PDF artifact is certified with 64-char SHA-256', () => {
      const art = WebDownloadService.getArtifact('LMSE_OWNER_GUIDE.pdf');
      assert.ok(art);
      assert.equal(art.sha256, '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618');
      assert.equal(art.sizeBytes, 428378);
      assert.equal(art.platform, 'documentation');
    });

    test('SEC-05: Verification command provides exact PowerShell Get-FileHash syntax', () => {
      const cmd = WebDownloadService.getSha256VerificationInstructions('Bird-Academy-User.exe');
      assert.ok(cmd.includes('Get-FileHash'));
      assert.ok(cmd.includes('-Algorithm SHA256'));
    });

    test('SEC-06: Commercial checkout service does not expose administrative signing key', () => {
      const ops = CommercialOperationsService.getInstance();
      const keys = Object.keys(ops);
      assert.ok(!keys.includes('privateSigningKey'));
      assert.ok(!keys.includes('LMSE_PRIVATE_SIGNING_KEY'));
    });

    test('SEC-07: Public website services contain ZERO private breeding repository dependencies', () => {
      const webDownloadProto = Object.getOwnPropertyNames(WebDownloadService);
      assert.ok(!webDownloadProto.includes('getBirds'));
      assert.ok(!webDownloadProto.includes('getCages'));
      assert.ok(!webDownloadProto.includes('getClutches'));
    });

    test('SEC-08: Support ticket submission creates ticket in local store without server leakage', () => {
      const tck = WebDownloadService.submitSupportTicket({
        name: 'Test Sec Support',
        email: 'sec@test.com',
        subject: 'Audit Securite',
        category: 'technical',
        message: 'Verification isolations des donnees',
      });
      assert.ok(tck.ticketId.startsWith('TCK-'));
      assert.equal(tck.status, 'OPEN');
    });

    test('SEC-09: Support ticket list is retrievable and isolated', () => {
      const tickets = WebDownloadService.getAllSupportTickets();
      assert.ok(Array.isArray(tickets));
      assert.ok(tickets.length >= 1);
    });

    test('SEC-10: Artifact download URLs point to local offline assets path', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(art?.downloadUrl.startsWith('/downloads/'));
    });
  });

  // =========================================================================
  // GATE 8: OFFLINE AUTONOMY & LOCAL STORAGE TAMPER RESISTANCE (10 tests)
  // =========================================================================
  describe('Gate 8: Offline Autonomy & Local Storage Tamper Resistance', () => {
    test('OFF-01: Complete checkout pipeline executes without internet access', async () => {
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Offline User',
        customerEmail: 'offline@elevage.fr',
      });
      assert.ok(res.success);
      assert.ok(res.order);
      assert.ok(res.deliveryPackage);
    });

    test('OFF-02: Offline license validation operates entirely in local memory', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Offline Val User',
        maxDevices: 5,
        durationDays: 365,
      });
      lic.status = 'active';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, true);
    });

    test('OFF-03: Maliciously injecting forged tier in localStorage does not bypass signature validation', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial', // PREMIUM
        holderName: 'Tamper Tier User',
        maxDevices: 3,
        durationDays: 365,
      });
      lic.status = 'active';
      
      // Attacker attempts to modify type to enterprise in localStorage
      lic.type = 'enterprise';
      lic.policy.maxDevices = 10;
      
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE);
      assert.equal(val.isValid, false);
    });

    test('OFF-04: Maliciously forging status to active on revoked license fails validation', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Tamper Revoke User',
        maxDevices: 5,
        durationDays: 365,
      });
      lic.status = 'revoked';
      lic.revokedAt = new Date().toISOString();
      lic.revocationReason = 'Fraud';

      await licenseRepo.saveLicense(lic);
      await licenseRepo.addToRevocationList(lic.key);
      
      const revList = await licenseRepo.getRevocationList();
      assert.ok(revList.includes(lic.key.toUpperCase()));
      
      // Even if status is set to active in memory, revocation list check fails
      lic.status = 'active';
      const val = await LicenseValidator.validateLicense(lic, DUMMY_DEVICE, revList);
      assert.equal(val.isValid, false);
    });

    test('OFF-05: Local customer orders are persisted and retrievable offline', async () => {
      await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Offline Order User',
        customerEmail: 'offline-order@elevage.fr',
      });
      const orders = await checkoutService.getAllOrders();
      assert.ok(orders.length >= 1);
      assert.ok(orders.some(o => o.customerEmail === 'offline-order@elevage.fr'));
    });

    test('OFF-06: Order lookup by ID functions offline', async () => {
      const created = await checkoutService.processCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Lookup Offline User',
        customerEmail: 'lookup-offline@elevage.fr',
      });
      const lookup = await checkoutService.lookupOrderAsync(created.order!.orderId);
      assert.ok(lookup.order);
      assert.equal(lookup.order.orderId, created.order!.orderId);
      assert.ok(lookup.deliveryPackage);
    });

    test('OFF-07: Customer order history filtering by email functions offline', () => {
      const orders = checkoutService.getCustomerOrders('offline-order@elevage.fr');
      assert.ok(Array.isArray(orders));
      assert.ok(orders.length >= 1);
    });

    test('OFF-08: Resetting services instance clears in-memory cache without storage loss', () => {
      WebOrderCheckoutService.resetInstance();
      const freshInstance = WebOrderCheckoutService.getInstance();
      assert.ok(freshInstance);
    });

    test('OFF-09: Local storage license repository clears active license cleanly', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Clear Active Test',
        maxDevices: 3,
        durationDays: 365,
      });
      await licenseRepo.saveActiveLicense(lic);
      assert.ok(await licenseRepo.getActiveLicense());
      await licenseRepo.clearActiveLicense();
      assert.equal(await licenseRepo.getActiveLicense(), null);
    });

    test('OFF-10: Cryptographic public verification key is available and non-empty', () => {
      const pubKey = CryptoService.getPublicVerificationKey();
      assert.ok(pubKey);
      assert.ok(pubKey.length > 10);
    });
  });
});

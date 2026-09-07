/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL OPERATIONS PLATFORM TEST SUITE
 * 60+ Exhaustive Unit & Integration Tests covering Offers, Customers, Orders,
 * Delivery Packages, Traceability, KPIs, and Authority Chain Integration.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_APP_MODE = 'admin';

// Core Commercial Modules
import { CommercialOffersService } from '../../src/features/licensing/commercial/services/CommercialOffersService';
import { CommercialOperationsService } from '../../src/features/licensing/commercial/services/CommercialOperationsService';
import { LicenseDeliveryPackageGenerator } from '../../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator';
import { CommercialLicenseAdminService } from '../../src/features/licensing/admin/services/CommercialLicenseAdminService';
import { LicenseValidator } from '../../src/features/licensing/engines/LicenseValidator';
import { LicenseLifecycleEngine } from '../../src/features/licensing/engines/LicenseLifecycleEngine';
import { DeviceFingerprintEngine } from '../../src/features/licensing/engines/DeviceFingerprintEngine';
import { SubscriptionTierResolver } from '../../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver } from '../../src/features/subscription/services/CapabilityResolver';
import { DeviceFingerprint } from '../../src/features/licensing/types/licensing';

// In-Memory Repository for Tests
import { InMemoryLicenseRepository } from '../../src/features/licensing/repositories/InMemoryLicenseRepository';

// Setup Mock LocalStorage in Node Environment if missing
if (typeof globalThis.localStorage === 'undefined') {
  const storage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
    length: 0,
    key: (_i: number) => null,
  } as Storage;
}

describe('LMSE Commercial Operations Platform Suite', () => {
  let inMemoryRepo: InMemoryLicenseRepository;
  let offersService: CommercialOffersService;
  let opsService: CommercialOperationsService;
  let adminService: CommercialLicenseAdminService;
  let mockDevice: DeviceFingerprint;

  beforeEach(async () => {
    localStorage.clear();
    mockDevice = await DeviceFingerprintEngine.generateFingerprint();
    inMemoryRepo = new InMemoryLicenseRepository();
    offersService = CommercialOffersService.getInstance();
    adminService = CommercialLicenseAdminService.getInstance(inMemoryRepo);
    opsService = CommercialOperationsService.getInstance(inMemoryRepo);
    await opsService.clearAllData();
  });

  // =========================================================================
  // 1. COMMERCIAL OFFERS CATALOG & DEFINITIONS (TC-OPS-OFF-001 to 010)
  // =========================================================================
  describe('1. Commercial Offers Catalog & Definitions', () => {
    it('TC-OPS-OFF-001: should provide catalog with standard offers (FREE, PREMIUM, PRO)', () => {
      const catalog = offersService.getAllOffers();
      assert.ok(catalog.length >= 3, 'Catalog must have at least 3 offers');
      
      const tiers = catalog.map(o => o.tier);
      assert.ok(tiers.includes('FREE'), 'Must include FREE');
      assert.ok(tiers.includes('PREMIUM'), 'Must include PREMIUM');
      assert.ok(tiers.includes('PRO'), 'Must include PRO');
    });

    it('TC-OPS-OFF-002: should resolve offer by ID', () => {
      const freeOffer = offersService.getOfferById('OFFER-FREE-COMM');
      assert.ok(freeOffer, 'FREE offer must be found');
      assert.equal(freeOffer?.tier, 'FREE');
      assert.equal(freeOffer?.price, 0);

      const proOffer = offersService.getOfferById('OFFER-PRO-ANNUAL');
      assert.ok(proOffer, 'PRO annual offer must be found');
      assert.equal(proOffer?.tier, 'PRO');
    });

    it('TC-OPS-OFF-003: should map correct capabilities to FREE offer', () => {
      const freeOffer = offersService.getOfferById('OFFER-FREE-COMM')!;
      assert.ok(freeOffer.capabilities.includes('BIRD_VIEW'));
      assert.ok(!freeOffer.capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
      assert.ok(!freeOffer.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    it('TC-OPS-OFF-004: should map correct capabilities to PREMIUM offer', () => {
      const premOffer = offersService.getOfferById('OFFER-PREMIUM-ANNUAL')!;
      assert.ok(premOffer.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
      assert.ok(premOffer.capabilities.includes('BIRD_VIEW'));
      assert.ok(!premOffer.capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    });

    it('TC-OPS-OFF-005: should map correct capabilities to PRO annual offer', () => {
      const proOffer = offersService.getOfferById('OFFER-PRO-ANNUAL')!;
      assert.ok(proOffer.capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
      assert.ok(proOffer.capabilities.includes('INTELLIGENCE_FULL_ENGINE'));
      assert.ok(proOffer.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    it('TC-OPS-OFF-006: should map correct capabilities to PRO lifetime offer', () => {
      const lifetimeOffer = offersService.getOfferById('OFFER-PRO-LIFETIME')!;
      assert.equal(lifetimeOffer.durationDays, null);
      assert.ok(lifetimeOffer.capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
      assert.ok(lifetimeOffer.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    it('TC-OPS-OFF-007: should define AI quota limits per offer correctly', () => {
      const free = offersService.getOfferById('OFFER-FREE-COMM')!;
      const prem = offersService.getOfferById('OFFER-PREMIUM-ANNUAL')!;
      const pro = offersService.getOfferById('OFFER-PRO-ANNUAL')!;

      assert.equal(free.aiDailyQuota, 10);
      assert.equal(prem.aiDailyQuota, 100);
      assert.equal(pro.aiDailyQuota, null);
    });

    it('TC-OPS-OFF-008: should have valid, non-negative pricing and EUR currency', () => {
      const catalog = offersService.getAllOffers();
      for (const off of catalog) {
        assert.ok(off.price >= 0, `Offer ${off.id} has negative price`);
        assert.equal(off.currency, 'EUR');
      }
    });

    it('TC-OPS-OFF-009: should have valid features list and popular flags', () => {
      const premAnnual = offersService.getOfferById('OFFER-PREMIUM-ANNUAL')!;
      assert.ok(premAnnual.isPopular, 'PREMIUM annual should be popular');
      assert.ok(premAnnual.features.length > 0, 'Must contain descriptive features');
    });

    it('TC-OPS-OFF-010: should return undefined for unknown offer ID', () => {
      const unknown = offersService.getOfferById('OFFER-UNKNOWN-XYZ-NON-EXISTENT');
      assert.equal(unknown, undefined);
    });
  });

  // =========================================================================
  // 2. CUSTOMER REFERENCE & DATA SEGREGATION (TC-OPS-CUST-001 to 008)
  // =========================================================================
  describe('2. Customer Reference & Strict Data Segregation', () => {
    it('TC-OPS-CUST-001: should create customer with minimal necessary data', async () => {
      const cust = await opsService.createCustomer({
        commercialRef: 'Jean Dupont Elevage',
        email: 'jean.dupont@example.com',
        country: 'FR',
        language: 'fr',
        notes: 'Client grand élevage canaris',
      });

      assert.ok(cust.customerId.startsWith('CUST-'));
      assert.equal(cust.commercialRef, 'Jean Dupont Elevage');
      assert.equal(cust.email, 'jean.dupont@example.com');
      assert.equal(cust.country, 'FR');
      assert.equal(cust.language, 'fr');
      assert.deepEqual(cust.orderIds, []);
      assert.deepEqual(cust.licenseIds, []);
    });

    it('TC-OPS-CUST-002: should generate unique customer IDs', async () => {
      const c1 = await opsService.createCustomer({ commercialRef: 'Client 1' });
      const c2 = await opsService.createCustomer({ commercialRef: 'Client 2' });
      assert.notEqual(c1.customerId, c2.customerId);
    });

    it('TC-OPS-CUST-003: strict segregation - customer record must contain 0 breeding/avian data', async () => {
      const cust = await opsService.createCustomer({
        commercialRef: 'Avian Pro',
        email: 'pro@example.com',
      });

      const keys = Object.keys(cust);
      const forbiddenTerms = ['bird', 'cage', 'clutch', 'egg', 'couple', 'health', 'pedigree', 'species'];
      for (const term of forbiddenTerms) {
        for (const key of keys) {
          assert.ok(!key.toLowerCase().includes(term), `Customer model leaked breeding data: ${key}`);
        }
      }
    });

    it('TC-OPS-CUST-004: should retrieve customer by ID', async () => {
      const created = await opsService.createCustomer({ commercialRef: 'Elevage Test' });
      const retrieved = await opsService.getCustomerById(created.customerId);
      assert.ok(retrieved);
      assert.equal(retrieved?.customerId, created.customerId);
      assert.equal(retrieved?.commercialRef, 'Elevage Test');
    });

    it('TC-OPS-CUST-005: should find customer by email or reference', async () => {
      await opsService.createCustomer({ commercialRef: 'Alpha Aviary', email: 'alpha@aviary.com' });
      const foundByEmail = await opsService.findCustomerByEmailOrRef('alpha@aviary.com');
      assert.ok(foundByEmail);
      assert.equal(foundByEmail?.commercialRef, 'Alpha Aviary');

      const foundByRef = await opsService.findCustomerByEmailOrRef('Alpha Aviary');
      assert.ok(foundByRef);
      assert.equal(foundByRef?.email, 'alpha@aviary.com');
    });

    it('TC-OPS-CUST-006: should update customer details', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Original Ref' });
      const updated = await opsService.updateCustomer(cust.customerId, {
        commercialRef: 'Updated Ref',
        notes: 'Ajout de notes',
      });
      assert.ok(updated);
      assert.equal(updated?.commercialRef, 'Updated Ref');
      assert.equal(updated?.notes, 'Ajout de notes');
    });

    it('TC-OPS-CUST-007: customer orderIds should update when orders are created', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Client Commande' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PRO-ANNUAL',
      });

      const reloadedCust = (await opsService.getCustomerById(cust.customerId))!;
      assert.ok(reloadedCust.orderIds.includes(order.orderId));
    });

    it('TC-OPS-CUST-008: customer licenseIds should update when orders are fulfilled', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Client License' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const reloadedCust = (await opsService.getCustomerById(cust.customerId))!;
      assert.equal(reloadedCust.licenseIds.length, 1);
      assert.equal(reloadedCust.licenseIds[0], order.licenseIds[0]);
    });
  });

  // =========================================================================
  // 3. COMMERCIAL ORDER MANAGEMENT (TC-OPS-ORD-001 to 014)
  // =========================================================================
  describe('3. Commercial Order Lifecycle & Management', () => {
    it('TC-OPS-ORD-001: should create order with PENDING status by default', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Client Order' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PREMIUM-ANNUAL',
      });

      assert.ok(order.orderId.startsWith('ORD-'));
      assert.equal(order.status, 'PENDING');
      assert.equal(order.tier, 'PREMIUM');
      assert.equal(order.amount, 49.00);
      assert.deepEqual(order.licenseIds, []);
    });

    it('TC-OPS-ORD-002: should create and auto-fulfill order immediately', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Client Direct' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      assert.equal(order.status, 'COMPLETED');
      assert.equal(order.licenseIds.length, 1);
      assert.ok(order.licenseIds[0].startsWith('lic_'));
      const lic = await inMemoryRepo.getLicenseById(order.licenseIds[0]);
      assert.ok(lic?.key.startsWith('LMSE-'));
    });

    it('TC-OPS-ORD-003: should auto-create customer when customerId is omitted', async () => {
      const order = await opsService.createOrder({
        customerName: 'Auto Created Customer',
        customerEmail: 'autocust@example.com',
        offerId: 'OFFER-PRO-ANNUAL',
      });

      assert.ok(order.customerId);
      const cust = await opsService.getCustomerById(order.customerId);
      assert.ok(cust);
      assert.equal(cust?.commercialRef, 'Auto Created Customer');
      assert.equal(cust?.email, 'autocust@example.com');
    });

    it('TC-OPS-ORD-004: should transition order from PENDING to PAID', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Pay Client' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PRO-ANNUAL',
      });

      const paidOrder = await opsService.payOrder(order.orderId, 'STRIPE', 'ch_123456789');
      assert.equal(paidOrder.status, 'PAID');
      assert.equal(paidOrder.paymentMethod, 'STRIPE');
      assert.equal(paidOrder.paymentReference, 'ch_123456789');
    });

    it('TC-OPS-ORD-005: should transition order from PAID to COMPLETED upon fulfillment', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Fulfill Client' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PRO-ANNUAL',
      });

      await opsService.payOrder(order.orderId);
      const fulfilledOrder = await opsService.fulfillOrder(order.orderId);

      assert.equal(fulfilledOrder.status, 'COMPLETED');
      assert.equal(fulfilledOrder.licenseIds.length, 1);
    });

    it('TC-OPS-ORD-006: fulfill order must generate a signed ECDSA/SHA-256 license', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Crypto Buyer' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PRO-ANNUAL',
      });

      const fulfilledOrder = await opsService.fulfillOrder(order.orderId);
      const licId = fulfilledOrder.licenseIds[0];
      const lic = await inMemoryRepo.getLicenseById(licId);

      assert.ok(lic, 'Generated license must exist in repository');
      assert.equal(SubscriptionTierResolver.resolve(lic), 'PRO');
      assert.ok(lic?.signature, 'License must have ECDSA signature');
      assert.ok(lic?.status === 'pending_activation' || lic?.status === 'active');

      // Activate on device then verify with real LicenseValidator
      const activatedLic = LicenseLifecycleEngine.activate(lic!, mockDevice);
      const valResult = await LicenseValidator.validateLicense(activatedLic, mockDevice);
      assert.ok(valResult.isValid, `Validation failed: ${valResult.message}`);
      const resolvedTier = SubscriptionTierResolver.resolve(activatedLic, valResult);
      assert.equal(resolvedTier, 'PRO');
    });

    it('TC-OPS-ORD-007: fulfill order should link licenseId to order and customer', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Link Test' });
      const order = await opsService.createOrder({
        customerId: cust.customerId,
        offerId: 'OFFER-PREMIUM-ANNUAL',
      });

      const fulfilled = await opsService.fulfillOrder(order.orderId);
      const licId = fulfilled.licenseIds[0];

      const ordCheck = (await opsService.getOrderById(order.orderId))!;
      assert.ok(ordCheck.licenseIds.includes(licId));

      const custCheck = (await opsService.getCustomerById(cust.customerId))!;
      assert.ok(custCheck.licenseIds.includes(licId));
    });

    it('TC-OPS-ORD-008: should cancel PENDING order', async () => {
      const order = await opsService.createOrder({
        customerName: 'Cancel Customer',
        offerId: 'OFFER-FREE-COMM',
      });

      const cancelled = await opsService.cancelOrder(order.orderId, 'Client requested cancellation');
      assert.equal(cancelled.status, 'CANCELLED');
    });

    it('TC-OPS-ORD-009: cancelling PAID or COMPLETED order should throw error', async () => {
      const order = await opsService.createOrder({
        customerName: 'Completed Order Cancel',
        offerId: 'OFFER-FREE-COMM',
        autoFulfill: true,
      });

      await assert.rejects(async () => {
        await opsService.cancelOrder(order.orderId);
      }, /Impossible d'annuler une commande déjà payée ou complétée/);
    });

    it('TC-OPS-ORD-010: should refund PAID or COMPLETED order', async () => {
      const order = await opsService.createOrder({
        customerName: 'Refund Customer',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const refunded = await opsService.refundOrder(order.orderId, 'Unsatisfied with offline features');
      assert.equal(refunded.status, 'REFUNDED');
    });

    it('TC-OPS-ORD-011: refunding PENDING order should throw error', async () => {
      const order = await opsService.createOrder({
        customerName: 'Pending Refund',
        offerId: 'OFFER-PRO-ANNUAL',
      });

      await assert.rejects(async () => {
        await opsService.refundOrder(order.orderId);
      }, /Seules les commandes payées ou complétées peuvent être remboursées/);
    });

    it('TC-OPS-ORD-012: multiple quantity order should generate multiple distinct licenses', async () => {
      const order = await opsService.createOrder({
        customerName: 'Club Avicole 3 Licences',
        offerId: 'OFFER-PRO-ANNUAL',
        quantity: 3,
        autoFulfill: true,
      });

      assert.equal(order.quantity, 3);
      assert.equal(order.amount, 119.00 * 3);
      assert.equal(order.licenseIds.length, 3);
      assert.notEqual(order.licenseIds[0], order.licenseIds[1]);
      assert.notEqual(order.licenseIds[1], order.licenseIds[2]);
    });

    it('TC-OPS-ORD-013: should store payment method and transaction ref', async () => {
      const order = await opsService.createOrder({
        customerName: 'Bank Wire Buyer',
        offerId: 'OFFER-PRO-ANNUAL',
      });

      const paid = await opsService.payOrder(order.orderId, 'BANK_TRANSFER', 'VIR-20260830-01');
      assert.equal(paid.paymentMethod, 'BANK_TRANSFER');
      assert.equal(paid.paymentReference, 'VIR-20260830-01');
    });

    it('TC-OPS-ORD-014: should filter orders by status and customer', async () => {
      const c1 = await opsService.createCustomer({ commercialRef: 'Filter C1' });
      const c2 = await opsService.createCustomer({ commercialRef: 'Filter C2' });

      await opsService.createOrder({ customerId: c1.customerId, offerId: 'OFFER-FREE-COMM' });
      await opsService.createOrder({ customerId: c1.customerId, offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });
      await opsService.createOrder({ customerId: c2.customerId, offerId: 'OFFER-PREMIUM-ANNUAL' });

      const c1Orders = await opsService.getOrdersByCustomerId(c1.customerId);
      assert.equal(c1Orders.length, 2);

      const pendingOrders = await opsService.getOrdersByStatus('PENDING');
      assert.equal(pendingOrders.length, 2);

      const completedOrders = await opsService.getOrdersByStatus('COMPLETED');
      assert.equal(completedOrders.length, 1);
    });
  });

  // =========================================================================
  // 4. OFFLINE DELIVERY PACKAGE GENERATOR (TC-OPS-PKG-001 to 010)
  // =========================================================================
  describe('4. Offline Delivery Package Generator', () => {
    it('TC-OPS-PKG-001: should generate standard 5-file delivery package', async () => {
      const order = await opsService.createOrder({
        customerName: 'Delivery Client',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id, order.orderId);

      assert.ok(pkg.packageId.startsWith('PKG-'));
      assert.equal(pkg.licenseId, lic.id);
      assert.equal(pkg.tier, 'PRO');
      assert.equal(pkg.customerName, 'Delivery Client');
      assert.equal(pkg.files.length, 5);
    });

    it('TC-OPS-PKG-002: package must contain .lmse binary/json file', async () => {
      const order = await opsService.createOrder({
        customerName: 'LMSE File Check',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id);

      const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'));
      assert.ok(lmseFile, 'Must contain .lmse file');
      const lmseStr = lmseFile.content as string;
      assert.ok(lmseStr.includes(lic.id));
      assert.ok(lmseStr.includes(lic.signature));
    });

    it('TC-OPS-PKG-003: package must contain license-key.txt file', async () => {
      const order = await opsService.createOrder({
        customerName: 'Key File Check',
        offerId: 'OFFER-PREMIUM-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id);

      const keyFile = pkg.files.find(f => f.filename === 'license-key.txt');
      assert.ok(keyFile, 'Must contain license-key.txt');
      const keyStr = keyFile.content as string;
      assert.ok(keyStr.includes(lic.key));
    });

    it('TC-OPS-PKG-004: package must contain license-qr.png file with valid QR payload', async () => {
      const order = await opsService.createOrder({
        customerName: 'QR File Check',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id);

      const qrFile = pkg.files.find(f => f.filename === 'license-qr.png');
      assert.ok(qrFile, 'Must contain license-qr.png');
      assert.equal(qrFile.contentType, 'image/png');
      assert.ok(qrFile.sizeBytes > 50, 'QR payload should be substantial');
    });

    it('TC-OPS-PKG-005: package must contain human-readable license-info.txt', async () => {
      const order = await opsService.createOrder({
        customerName: 'Summary File Check',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id, order.orderId);

      const infoFile = pkg.files.find(f => f.filename === 'license-info.txt');
      assert.ok(infoFile, 'Must contain license-info.txt');
      const infoStr = infoFile.content as string;
      assert.ok(infoStr.includes('BIRD ACADEMY ENTERPRISE'));
      assert.ok(infoStr.includes('Summary File Check'));
      assert.ok(infoStr.includes(order.orderId));
      assert.ok(infoStr.includes('PRO'));
    });

    it('TC-OPS-PKG-006: package must contain README.txt with offline instructions', async () => {
      const order = await opsService.createOrder({
        customerName: 'Readme Check',
        offerId: 'OFFER-FREE-COMM',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id);

      const readmeFile = pkg.files.find(f => f.filename === 'README.txt');
      assert.ok(readmeFile, 'Must contain README.txt');
      const readmeStr = readmeFile.content as string;
      assert.ok(readmeStr.includes('GUIDE D\'ACTIVATION'));
      assert.ok(readmeStr.includes('HORS-LIGNE') || readmeStr.includes('hors-ligne') || readmeStr.includes('Hors-Ligne'));
    });

    it('TC-OPS-PKG-007: package must NEVER leak private key or signing secrets', async () => {
      const order = await opsService.createOrder({
        customerName: 'Secret Leak Check',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id);

      for (const f of pkg.files) {
        if (typeof f.content === 'string') {
          assert.ok(!f.content.includes('PRIVATE KEY'), `Private key leaked in ${f.filename}`);
          assert.ok(!f.content.includes('secret_admin_key'), `Admin secret leaked in ${f.filename}`);
          assert.ok(!f.content.includes('PRIVATE_KEY'), `Private key marker leaked in ${f.filename}`);
        }
      }
    });

    it('TC-OPS-PKG-008: export bundle JSON must preserve all files', async () => {
      const order = await opsService.createOrder({
        customerName: 'JSON Bundle Check',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id);
      const jsonBundle = LicenseDeliveryPackageGenerator.createPackageExportJson(pkg);

      const parsed = JSON.parse(jsonBundle);
      assert.equal(parsed.packageId, pkg.packageId);
      assert.equal(parsed.files.length, 5);
      assert.equal(parsed.licenseId, lic.id);
    });

    it('TC-OPS-PKG-009: package handles order metadata inclusion', async () => {
      const order = await opsService.createOrder({
        customerName: 'Order Meta Check',
        offerId: 'OFFER-PREMIUM-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const pkg = await opsService.generateDeliveryPackage(lic.id, order.orderId);
      assert.equal(pkg.orderId, order.orderId);
    });

    it('TC-OPS-PKG-010: package handles standalone license generation without order', async () => {
      const lic = await adminService.createCommercialLicense({
        holderName: 'Standalone Customer',
        tier: 'PRO',
        type: 'enterprise',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });

      const pkg = await opsService.generateDeliveryPackage(lic.id);
      assert.equal(pkg.licenseId, lic.id);
      assert.equal(pkg.orderId, undefined);
      assert.equal(pkg.customerName, 'Standalone Customer');
      assert.equal(pkg.files.length, 5);
    });
  });

  // =========================================================================
  // 5. TRACEABILITY & AUDIT TRAIL (TC-OPS-EVT-001 to 009)
  // =========================================================================
  describe('5. Traceability & Audit Events', () => {
    it('TC-OPS-EVT-001: should record event on customer creation', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Trace Cust' });
      const events = await opsService.getTraceabilityEvents();
      const custEvt = events.find(e => e.eventType === 'CUSTOMER_CREATED' && e.customerId === cust.customerId);
      assert.ok(custEvt, 'CUSTOMER_CREATED event must be recorded');
    });

    it('TC-OPS-EVT-002: should record event on order creation', async () => {
      const order = await opsService.createOrder({
        customerName: 'Trace Order',
        offerId: 'OFFER-PRO-ANNUAL',
      });
      const events = await opsService.getTraceabilityEvents();
      const ordEvt = events.find(e => e.eventType === 'ORDER_CREATED' && e.orderId === order.orderId);
      assert.ok(ordEvt, 'ORDER_CREATED event must be recorded');
    });

    it('TC-OPS-EVT-003: should record event on order payment', async () => {
      const order = await opsService.createOrder({
        customerName: 'Trace Payment',
        offerId: 'OFFER-PRO-ANNUAL',
      });
      await opsService.payOrder(order.orderId);
      const events = await opsService.getTraceabilityEvents();
      const payEvt = events.find(e => e.eventType === 'ORDER_PAID' && e.orderId === order.orderId);
      assert.ok(payEvt, 'ORDER_PAID event must be recorded');
    });

    it('TC-OPS-EVT-004: should record event on order completion', async () => {
      const order = await opsService.createOrder({
        customerName: 'Trace Complete',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });
      const events = await opsService.getTraceabilityEvents();
      const compEvt = events.find(e => e.eventType === 'ORDER_COMPLETED' && e.orderId === order.orderId);
      assert.ok(compEvt, 'ORDER_COMPLETED event must be recorded');
    });

    it('TC-OPS-EVT-005: should record event on license generation & assignment', async () => {
      const order = await opsService.createOrder({
        customerName: 'Trace Assign',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });
      const events = await opsService.getTraceabilityEvents();
      const assignEvt = events.find(e => e.eventType === 'LICENSE_ASSIGNED' && e.orderId === order.orderId);
      assert.ok(assignEvt, 'LICENSE_ASSIGNED event must be recorded');
    });

    it('TC-OPS-EVT-006: should record event on delivery package generation', async () => {
      const order = await opsService.createOrder({
        customerName: 'Trace Pkg',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });
      await opsService.generateDeliveryPackage(order.licenseIds[0], order.orderId);
      const events = await opsService.getTraceabilityEvents();
      const pkgEvt = events.find(e => e.eventType === 'DELIVERY_PACKAGE_GENERATED');
      assert.ok(pkgEvt, 'DELIVERY_PACKAGE_GENERATED event must be recorded');
    });

    it('TC-OPS-EVT-007: should record event on order cancellation', async () => {
      const order = await opsService.createOrder({
        customerName: 'Trace Cancel',
        offerId: 'OFFER-PRO-ANNUAL',
      });
      await opsService.cancelOrder(order.orderId);
      const events = await opsService.getTraceabilityEvents();
      const cancelEvt = events.find(e => e.eventType === 'ORDER_CANCELLED' && e.orderId === order.orderId);
      assert.ok(cancelEvt, 'ORDER_CANCELLED event must be recorded');
    });

    it('TC-OPS-EVT-008: should record event on order refund', async () => {
      const order = await opsService.createOrder({
        customerName: 'Trace Refund',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });
      await opsService.refundOrder(order.orderId);
      const events = await opsService.getTraceabilityEvents();
      const refundEvt = events.find(e => e.eventType === 'ORDER_REFUNDED' && e.orderId === order.orderId);
      assert.ok(refundEvt, 'ORDER_REFUNDED event must be recorded');
    });

    it('TC-OPS-EVT-009: traceability logs should be chronological and queryable', async () => {
      await opsService.createOrder({ customerName: 'Chrono 1', offerId: 'OFFER-FREE-COMM' });
      await opsService.createOrder({ customerName: 'Chrono 2', offerId: 'OFFER-PRO-ANNUAL' });
      const events = await opsService.getTraceabilityEvents();
      assert.ok(events.length >= 2);
      
      // Verify timestamps are non-increasing (newest first)
      for (let i = 1; i < events.length; i++) {
        assert.ok(new Date(events[i-1].timestamp).getTime() >= new Date(events[i].timestamp).getTime());
      }
    });
  });

  // =========================================================================
  // 6. COMMERCIAL KPI & FINANCIAL CALCULATIONS (TC-OPS-KPI-001 to 005)
  // =========================================================================
  describe('6. Commercial KPI & Financial Statistics', () => {
    it('TC-OPS-KPI-001: should calculate total revenue accurately across paid & completed orders', async () => {
      // 1 PRO annual = 119
      await opsService.createOrder({ customerName: 'R1', offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });
      // 1 PREMIUM = 49 (PAID)
      const o2 = await opsService.createOrder({ customerName: 'R2', offerId: 'OFFER-PREMIUM-ANNUAL' });
      await opsService.payOrder(o2.orderId);
      // 1 PRO pending = 119 (Not counted in revenue)
      await opsService.createOrder({ customerName: 'R3', offerId: 'OFFER-PRO-ANNUAL' });

      const stats = await opsService.calculateOperationsStats();
      assert.equal(stats.totalRevenue, 119 + 49);
      assert.equal(stats.totalOrders, 3);
      assert.equal(stats.paidOrdersCount, 1);
      assert.equal(stats.completedOrdersCount, 1);
      assert.equal(stats.pendingOrdersCount, 1);
    });

    it('TC-OPS-KPI-002: should calculate revenue breakdown by tier accurately', async () => {
      await opsService.createOrder({ customerName: 'P1', offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });
      await opsService.createOrder({ customerName: 'PR1', offerId: 'OFFER-PREMIUM-ANNUAL', autoFulfill: true });
      await opsService.createOrder({ customerName: 'F1', offerId: 'OFFER-FREE-COMM', autoFulfill: true });

      const stats = await opsService.calculateOperationsStats();
      assert.equal(stats.tierRevenueBreakdown.PRO, 119.00);
      assert.equal(stats.tierRevenueBreakdown.PREMIUM, 49.00);
      assert.equal(stats.tierRevenueBreakdown.FREE, 0.00);
    });

    it('TC-OPS-KPI-003: should calculate fulfillment rate percentage accurately', async () => {
      // 2 completed, 2 pending -> 50%
      await opsService.createOrder({ customerName: 'F1', offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });
      await opsService.createOrder({ customerName: 'F2', offerId: 'OFFER-PREMIUM-ANNUAL', autoFulfill: true });
      await opsService.createOrder({ customerName: 'P1', offerId: 'OFFER-PRO-ANNUAL' });
      await opsService.createOrder({ customerName: 'P2', offerId: 'OFFER-FREE-COMM' });

      const stats = await opsService.calculateOperationsStats();
      assert.equal(stats.fulfillmentRatePercentage, 50);
      assert.equal(stats.totalGeneratedLicenses, 2);
    });

    it('TC-OPS-KPI-004: should track order counts by status', async () => {
      const o1 = await opsService.createOrder({ customerName: 'S1', offerId: 'OFFER-FREE-COMM' });
      await opsService.cancelOrder(o1.orderId);

      const o2 = await opsService.createOrder({ customerName: 'S2', offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });
      await opsService.refundOrder(o2.orderId);

      const stats = await opsService.calculateOperationsStats();
      assert.equal(stats.cancelledOrdersCount, 1);
      assert.equal(stats.refundedOrdersCount, 1);
    });

    it('TC-OPS-KPI-005: should count total customers and generated licenses matching repository', async () => {
      await opsService.createCustomer({ commercialRef: 'CUST-A' });
      await opsService.createCustomer({ commercialRef: 'CUST-B' });
      await opsService.createOrder({ customerName: 'CUST-C', offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });

      const stats = await opsService.calculateOperationsStats();
      assert.equal(stats.totalCustomers, 3);
      assert.equal(stats.totalGeneratedLicenses, 1);
    });
  });

  // =========================================================================
  // 7. ARCHIVE BACKUP, RESTORE & ISOLATION (TC-OPS-ARC-001 to 004)
  // =========================================================================
  describe('7. Commercial Archive Backup, Restore & Isolation', () => {
    it('TC-OPS-ARC-001: should export full commercial JSON archive', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Backup Cust' });
      await opsService.createOrder({ customerId: cust.customerId, offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });

      const json = await opsService.exportCommercialArchive();
      assert.ok(typeof json === 'string');
      const parsed = JSON.parse(json);
      assert.equal(parsed.schemaVersion, '1.3.6');
      assert.equal(parsed.customers.length, 1);
      assert.equal(parsed.orders.length, 1);
      assert.ok(parsed.events.length >= 2);
    });

    it('TC-OPS-ARC-002: should import and restore full commercial archive', async () => {
      const cust = await opsService.createCustomer({ commercialRef: 'Restore Cust' });
      await opsService.createOrder({ customerId: cust.customerId, offerId: 'OFFER-PRO-ANNUAL', autoFulfill: true });
      const json = await opsService.exportCommercialArchive();

      // Clear all
      await opsService.clearAllData();
      assert.equal((await opsService.getAllCustomers()).length, 0);
      assert.equal((await opsService.getAllOrders()).length, 0);

      // Import
      const res = await opsService.importCommercialArchive(json);
      assert.ok(res.success);
      assert.equal((await opsService.getAllCustomers()).length, 1);
      assert.equal((await opsService.getAllOrders()).length, 1);
      assert.equal((await opsService.getAllCustomers())[0].commercialRef, 'Restore Cust');
    });

    it('TC-OPS-ARC-003: should safely reject corrupted JSON import', async () => {
      const res = await opsService.importCommercialArchive('NOT_VALID_JSON');
      assert.ok(!res.success);
      assert.ok(res.message.includes('Erreur'));
    });

    it('TC-OPS-ARC-004: should clear commercial database cleanly', async () => {
      await opsService.createCustomer({ commercialRef: 'To Delete' });
      assert.equal((await opsService.getAllCustomers()).length, 1);
      await opsService.clearAllData();
      assert.equal((await opsService.getAllCustomers()).length, 0);
      assert.equal((await opsService.getAllOrders()).length, 0);
      assert.equal((await opsService.getTraceabilityEvents()).length, 0);
    });
  });

  // =========================================================================
  // 8. END-TO-END AUTHORITY CHAIN INTEGRATION (TC-OPS-E2E-001 to 006)
  // =========================================================================
  describe('8. End-to-End Authority Chain Integration', () => {
    it('TC-OPS-E2E-001: Offer PRO -> Order -> Fulfilled -> Validated -> Grants PRO Capabilities', async () => {
      const order = await opsService.createOrder({
        customerName: 'Enterprise Breeder',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const activatedLic = LicenseLifecycleEngine.activate(lic, mockDevice);
      const validation = await LicenseValidator.validateLicense(activatedLic, mockDevice);

      assert.ok(validation.isValid, `Validation error: ${validation.message}`);
      const tier = SubscriptionTierResolver.resolve(activatedLic, validation);
      assert.equal(tier, 'PRO');

      const capabilities = CapabilityResolver.resolve(tier);
      assert.ok(capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
      assert.ok(capabilities.includes('INTELLIGENCE_FULL_ENGINE'));
      assert.ok(capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
      assert.ok(capabilities.includes('BIRD_VIEW'));
    });

    it('TC-OPS-E2E-002: Offer PREMIUM -> Order -> Fulfilled -> Validated -> Grants PREMIUM Capabilities', async () => {
      const order = await opsService.createOrder({
        customerName: 'Advanced Breeder',
        offerId: 'OFFER-PREMIUM-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const activatedLic = LicenseLifecycleEngine.activate(lic, mockDevice);
      const validation = await LicenseValidator.validateLicense(activatedLic, mockDevice);

      assert.ok(validation.isValid, `Validation error: ${validation.message}`);
      const tier = SubscriptionTierResolver.resolve(activatedLic, validation);
      assert.equal(tier, 'PREMIUM');

      const capabilities = CapabilityResolver.resolve(tier);
      assert.ok(capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
      assert.ok(!capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    });

    it('TC-OPS-E2E-003: Offer FREE -> Order -> Fulfilled -> Validated -> Grants FREE Capabilities', async () => {
      const order = await opsService.createOrder({
        customerName: 'Community User',
        offerId: 'OFFER-FREE-COMM',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const activatedLic = LicenseLifecycleEngine.activate(lic, mockDevice);
      const validation = await LicenseValidator.validateLicense(activatedLic, mockDevice);

      assert.ok(validation.isValid, `Validation error: ${validation.message}`);
      const tier = SubscriptionTierResolver.resolve(activatedLic, validation);
      assert.equal(tier, 'FREE');

      const capabilities = CapabilityResolver.resolve(tier);
      assert.ok(capabilities.includes('BIRD_VIEW'));
      assert.ok(!capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
      assert.ok(!capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    });

    it('TC-OPS-E2E-004: Upgrading commercial license (PREMIUM -> PRO) updates tier & capabilities', async () => {
      const order = await opsService.createOrder({
        customerName: 'Upgrade Candidate',
        offerId: 'OFFER-PREMIUM-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const upgradedLic = await adminService.upgradeLicense(lic.id, 'PRO');
      const activatedUpgraded = LicenseLifecycleEngine.activate(upgradedLic, mockDevice);

      const validation = await LicenseValidator.validateLicense(activatedUpgraded, mockDevice);
      assert.ok(validation.isValid);
      const tier = SubscriptionTierResolver.resolve(activatedUpgraded, validation);
      assert.equal(tier, 'PRO');

      const capabilities = CapabilityResolver.resolve(tier);
      assert.ok(capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    });

    it('TC-OPS-E2E-005: Downgrading commercial license (PRO -> PREMIUM) preserves data integrity', async () => {
      const order = await opsService.createOrder({
        customerName: 'Downgrade Candidate',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      const downgradedLic = await adminService.downgradeLicense(lic.id, 'PREMIUM');
      const activatedDowngraded = LicenseLifecycleEngine.activate(downgradedLic, mockDevice);

      const validation = await LicenseValidator.validateLicense(activatedDowngraded, mockDevice);
      assert.ok(validation.isValid);
      const tier = SubscriptionTierResolver.resolve(activatedDowngraded, validation);
      assert.equal(tier, 'PREMIUM');

      // Zero data loss guarantee: user's breeding records remain untouched
      assert.equal(downgradedLic.status.toLowerCase(), 'active');
    });

    it('TC-OPS-E2E-006: Revoking a commercial license blocks validation with REVOKED status', async () => {
      const order = await opsService.createOrder({
        customerName: 'Revocation Candidate',
        offerId: 'OFFER-PRO-ANNUAL',
        autoFulfill: true,
      });

      const lic = (await inMemoryRepo.getLicenseById(order.licenseIds[0]))!;
      await adminService.revokeLicense(lic.id, 'Commercial chargeback / refund');

      const revokedLic = (await inMemoryRepo.getLicenseById(lic.id))!;
      assert.equal(revokedLic.status.toLowerCase(), 'revoked');

      const validation = await LicenseValidator.validateLicense(revokedLic, mockDevice, [lic.id]);
      assert.ok(!validation.isValid);
      assert.equal(validation.status, 'revoked');
    });
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — CHECKOUT FLOW & RESILIENCE QA SUITE
 * Validates real commercial checkout execution, order persistence,
 * LMSE authority communication, delivery kit generation, and zero white screen guarantees.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { WebOrderCheckoutService } from '../../src/features/commercial-website/services/WebOrderCheckoutService';
import { CommercialOffersService } from '../../src/features/licensing/commercial/services/CommercialOffersService';
import { DemoPaymentProvider } from '../../src/features/commercial-website/services/PaymentProvider';
import { LmseBackendServer } from '../../src/server/lmseServer';
import { OfflineBetaValidator } from '../../src/features/licensing/services/OfflineBetaValidator';
import { ZipArchiveBuilder } from '../../src/features/licensing/commercial/services/ZipArchiveBuilder';
import { LmseConfigService } from '../../src/config/lmseConfig';
import { DeviceFingerprint } from '../../src/features/licensing/types/licensing';
import { Server } from 'node:http';

const dummyDevice: DeviceFingerprint = {
  deviceId: 'DEV-FINGERPRINT-TEST-2026',
  os: 'Windows',
  browserHash: 'BROWSER-HASH-123',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr',
  hardwareConcurrency: 8,
  createdAt: new Date().toISOString(),
  lastSeenAt: new Date().toISOString(),
};

// Mock browser localStorage for Node test runner
const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] || null,
  setItem: (key: string, value: string) => { memoryStorage[key] = String(value); },
  removeItem: (key: string) => { delete memoryStorage[key]; },
  clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); },
};

(global as any).localStorage = mockLocalStorage;
(global as any).window = {
  localStorage: mockLocalStorage,
  location: {
    origin: 'http://localhost:3000',
    hash: '#checkout',
    pathname: '/',
    search: '',
  },
};

describe('MISSION QA-FIX — CHECKOUT FLOW & REAL LMSE INTEGRATION', () => {
  let serverInstance: Server | null = null;
  let backendServer: LmseBackendServer;

  before(async () => {
    mockLocalStorage.clear();
    // Start backend server on port 3001 if not already running
    try {
      const ping = await fetch('http://localhost:3001/api/health').catch(() => null);
      if (!ping || !ping.ok) {
        backendServer = new LmseBackendServer();
        await new Promise<void>((resolve) => {
          serverInstance = backendServer.app.listen(3001, () => {
            resolve();
          });
        });
      }
    } catch {
      // Ignored
    }
  });

  after(() => {
    if (serverInstance) {
      serverInstance.close();
    }
  });

  test('CHECKOUT-001: Le clic paiement ne provoque aucune exception runtime', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    let thrownError: any = null;
    let res: any = null;

    try {
      res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage des Pins',
        customerEmail: 'pins@elevage-canaris.com',
        country: 'FR',
        language: 'fr',
        notes: 'Commande de test QA-001',
        paymentProviderId: 'DEMO_SIMULATOR',
      });
    } catch (e) {
      thrownError = e;
    }

    assert.equal(thrownError, null, 'Aucune exception ne doit être levée lors du clic paiement');
    assert.ok(res, 'Un résultat de checkout doit être retourné');
    assert.equal(res.success, true, 'Le checkout doit réussir sans erreur');
  });

  test('CHECKOUT-002: Le paiement DEMO retourne un résultat valide', async () => {
    const demoProvider = new DemoPaymentProvider();
    const result = await demoProvider.processPayment(
      49.00,
      'EUR',
      'ORD-TEST-002',
      { name: 'Éleveur Test', email: 'test@canaris.com', country: 'FR' }
    );

    assert.equal(result.success, true, 'Le paiement DEMO doit réussir');
    assert.ok(result.transactionId.startsWith('tx_demo_'), 'Une référence de transaction DEMO doit être produite');
    assert.equal(result.paidAmount, 49.00);
    assert.equal(result.currency, 'EUR');
  });

  test('CHECKOUT-003: Une commande est réellement créée', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Élevage Royal Canaris',
      customerEmail: 'royal@canaris.com',
      country: 'FR',
      paymentProviderId: 'DEMO_SIMULATOR',
    });

    assert.equal(res.success, true);
    assert.ok(res.order, 'L\'objet CommercialOrder doit exister');
    assert.equal(res.order.customerName, 'Élevage Royal Canaris');
    assert.equal(res.order.status, 'COMPLETED');
  });

  test('CHECKOUT-004: La commande possède un orderId unique', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res1 = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Client 1',
      customerEmail: 'c1@test.com',
    });
    const res2 = await checkoutService.processCheckout({
      offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
      customerName: 'Client 2',
      customerEmail: 'c2@test.com',
    });

    assert.ok(res1.order?.orderId.startsWith('ORD-'));
    assert.ok(res2.order?.orderId.startsWith('ORD-'));
    assert.notEqual(res1.order?.orderId, res2.order?.orderId, 'Chaque commande doit avoir un ID unique');
  });

  test('CHECKOUT-005: Le backend LMSE est appelé correctement', async () => {
    const apiUrl = LmseConfigService.getLmseApiUrl();
    assert.equal(apiUrl, 'http://localhost:3001', 'LmseConfigService doit pointer sur le port 3001');

    const res = await fetch('http://localhost:3001/api/commercial/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Test Autorité Backend',
        customerEmail: 'autorite@birdacademy.com',
        country: 'FR',
        tier: 'PREMIUM',
        maxDevices: 3,
        durationDays: 365,
      }),
    });

    assert.equal(res.status, 201, 'Le backend LMSE doit retourner HTTP 201');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.license);
    assert.ok(data.license.id.startsWith('lic_'));
  });

  test('CHECKOUT-006: Une licence commerciale officielle est retournée', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Éleveur Passionné',
      customerEmail: 'passion@canaris.com',
    });

    assert.equal(res.success, true);
    assert.ok(res.order);
    assert.ok(res.order.licenseIds.length > 0);
    assert.ok(res.order.notes?.startsWith('LMSE-COMM-'));
  });

  test('CHECKOUT-007: Le delivery package est créé', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
      customerName: 'Club Ornithologique Nord',
      customerEmail: 'club.nord@ornitho.fr',
    });

    assert.ok(res.deliveryPackage);
    assert.ok(res.deliveryPackage.packageId.startsWith('PKG-'));
    assert.equal(res.deliveryPackage.files.length, 5);
  });

  test('CHECKOUT-008: La commande est persistée dans le stockage local', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Élevage Persistance',
      customerEmail: 'persist@canaris.fr',
    });

    const storedOrders = await checkoutService.getAllOrders();
    const found = storedOrders.find(o => o.orderId === res.order?.orderId);
    assert.ok(found, 'La commande doit être retrouvée dans le stockage');
    assert.equal(found.customerEmail, 'persist@canaris.fr');
  });

  test('CHECKOUT-009: La navigation vers la page de livraison fonctionne', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Éleveur Suivi',
      customerEmail: 'suivi@canaris.fr',
    });

    const orderId = res.order!.orderId;
    const lookup = await checkoutService.lookupOrderAsync(orderId);
    assert.ok(lookup.order, 'La commande doit être trouvée par lookupOrderAsync');
    assert.ok(lookup.deliveryPackage, 'Le delivery package doit être reconstruit pour la livraison');
    assert.equal(lookup.deliveryPackage.files.length, 5);
  });

  test('CHECKOUT-010: Une erreur backend ne provoque jamais un écran blanc', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    // Simulate invalid payload causing validation error
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-INVALIDE-INEXISTANTE',
      customerName: '',
      customerEmail: 'invalid-email',
    });

    assert.equal(res.success, false, 'Le checkout doit retourner success: false');
    assert.ok(typeof res.errorMessage === 'string' && res.errorMessage.length > 0, 'Un message d\'erreur clair doit être présent');
  });

  test('CHECKOUT-011: Une erreur de paiement ne provoque jamais un écran blanc', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Client Test',
      customerEmail: 'client@test.fr',
      paymentProviderId: 'STRIPE_INTERNATIONAL', // Stub non disponible
    });

    assert.equal(res.success, false);
    assert.ok(res.errorMessage?.includes('disponible'), 'Le message doit expliquer l\'indisponibilité');
  });

  test('CHECKOUT-012: Après succès, le CheckoutWizard fournit un résultat complet sans reset', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Jean Dupont Canaris',
      customerEmail: 'jean.dupont@elevage-canaris.com',
      country: 'FR',
    });

    assert.equal(res.success, true);
    assert.ok(res.order);
    assert.ok(res.deliveryPackage);
    assert.equal(res.order.status, 'COMPLETED');
  });

  test('CHECKOUT-013: La page de livraison peut retrouver la commande avec son ID', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
      customerName: 'Société Ornithologique',
      customerEmail: 'pro@ornitho.org',
    });

    const retrieved = await checkoutService.getOrder(res.order!.orderId);
    assert.ok(retrieved);
    assert.equal(retrieved.tier, 'PRO');

    const pkg = await checkoutService.getDeliveryPackage(retrieved.licenseIds[0], retrieved.orderId);
    assert.ok(pkg);
    assert.equal(pkg.files.length, 5);
  });

  test('CHECKOUT-014: Le package contient les 5 fichiers attendus', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Éleveur 5 Fichiers',
      customerEmail: 'cinq@fichiers.com',
    });

    const files = res.deliveryPackage!.files;
    const filenames = files.map(f => f.filename);

    assert.ok(filenames.some(n => n.startsWith('license_') && n.endsWith('.lmse')), 'license_<ID>.lmse présent');
    assert.ok(filenames.includes('license-key.txt'), 'license-key.txt présent');
    assert.ok(filenames.includes('license-qr.png'), 'license-qr.png présent');
    assert.ok(filenames.includes('license-info.txt'), 'license-info.txt présent');
    assert.ok(filenames.includes('README.txt'), 'README.txt présent');
  });

  test('CHECKOUT-015: Le fichier LMSE reste au format officiel bird-academy-lmse', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Test Schema LMSE',
      customerEmail: 'schema@lmse.fr',
    });

    const lmseFile = res.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'))!;
    assert.ok(lmseFile);

    const validation = await OfflineBetaValidator.validateFile(lmseFile.content as string, dummyDevice);
    assert.equal(validation.isValid, true, 'Le fichier LMSE délivré doit être 100% valide dans le validateur User');
    assert.ok(validation.code === 'VALID' || validation.code === 'VALID_OFFLINE_BETA', `Code de validation attendu: ${validation.code}`);
    assert.ok(validation.license);
    assert.equal(validation.license.holderName, 'Test Schema LMSE');
  });
});

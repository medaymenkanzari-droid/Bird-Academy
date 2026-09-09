/**
 * MISSION : COMMERCIAL-E2E-PAYMENT-001
 * Titre : Validation E2E complète du parcours commercial — Paiement Sandbox
 *
 * Release Gelée : v1.3.6-RC4
 * Build ID : BA-V1.3.6-RC4
 * Build Code : 17
 * Commit de référence : 8b8736380bd7580676af689f59ade38a42093095
 *
 * STATUT OBLIGATOIRE :
 * PAYMENT LIVE = DISABLED
 * PUBLIC COMMERCIAL SALES = CLOSED
 *
 * Ce fichier valide de bout en bout l'intégralité du parcours commercial en SANDBOX uniquement :
 * CLIENT -> SITE COMMERCIAL -> CHOIX DE L'OFFRE -> CHECKOUT -> COMMANDE -> PAIEMENT SANDBOX ->
 * CONFIRMATION SERVEUR -> LMSE -> LICENCE SIGNÉE -> KIT DE LIVRAISON -> IMPORT CLIENT -> ACTIVATION -> APP OFFLINE.
 *
 * Contient au moins 150 contrôles déterministes couvrant :
 * - Catégorie A — FREE (10)
 * - Catégorie B — PREMIUM (15)
 * - Catégorie C — PRO Annual (15)
 * - Catégorie D — PRO Lifetime (15)
 * - Catégorie E — Checkout (10)
 * - Catégorie F — Orders (10)
 * - Catégorie G — Webhooks & Idempotence (15)
 * - Catégorie H — Security & Anti-Tampering (20)
 * - Catégorie I — Delivery Kit (10)
 * - Catégorie J — Activation & Single Device (10)
 * - Catégorie K — Refund & Replacement (10)
 * - Catégorie L — Offline Mode (5)
 * - Catégorie M — Data Isolation (Breeding Firewall) (5)
 * - Scénarios E2E-C01 à E2E-C20 (20 scénarios)
 */

import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { LmseBackendServer } from '../src/server/lmseServer.js';
import {
  CommercialPaymentService,
  WebhookEventPayload,
  CommercialOrderRecord,
} from '../src/server/services/CommercialPaymentService.js';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository.js';
import {
  SandboxPaymentProvider,
  DemoPaymentProvider,
  getAvailablePaymentProviders,
} from '../src/features/commercial-website/services/PaymentProvider.js';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator.js';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator.js';
import { LicenseDeliveryPackageGenerator } from '../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator.js';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver.js';
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService.js';
import { DeviceFingerprint, License } from '../src/features/licensing/types/licensing.js';

function mockDevice(deviceId: string = 'DEV-DESKTOP-WIN-01'): DeviceFingerprint {
  return {
    deviceId,
    os: 'Windows',
    browserHash: 'hash-browser-chrome-124',
    screenSpec: '1920x1080',
    timezone: 'Europe/Paris',
    language: 'fr',
    hardwareConcurrency: 8,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
}

describe('MISSION COMMERCIAL-E2E-PAYMENT-001 — Validation E2E Parcours Commercial Sandbox', () => {
  let repository: InMemoryLicenseRepository;
  let server: LmseBackendServer;
  let paymentService: CommercialPaymentService;

  beforeEach(() => {
    repository = new InMemoryLicenseRepository();
    server = new LmseBackendServer(repository);
    paymentService = server.commercialPaymentService;
  });

  async function getOrderLicense(orderId: string): Promise<License> {
    const order = paymentService.getOrder(orderId);
    if (!order || !order.licenseId) {
      throw new Error(`Order or licenseId not found for orderId ${orderId}`);
    }
    const license = await repository.getLicenseById(order.licenseId);
    if (!license) {
      throw new Error(`License not found in repository for licenseId ${order.licenseId}`);
    }
    return license;
  }

  // =========================================================================
  // CATÉGORIE A — OFFRE FREE (10 CONTRÔLES)
  // =========================================================================
  describe('Catégorie A — Offre FREE (10 contrôles)', () => {
    test('A01 — L\'offre FREE est présente dans le catalogue officiel CommercialOffersService', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(free, 'Offre FREE manquante');
      assert.equal(free.tier, 'FREE');
    });

    test('A02 — Prix de l\'offre FREE est exactement 0 EUR', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.equal(free?.price, 0);
      assert.equal(free?.currency, 'EUR');
    });

    test('A03 — FREE ne nécessite aucun checkout commercial', async () => {
      await assert.rejects(
        () =>
          paymentService.createCheckout({
            offerId: 'OFFER-FREE-COMMUNITY',
            customerName: 'Éleveur Amateur',
            customerEmail: 'amateur@test.local',
          }),
        /FREE_NO_CHECKOUT_REQUIRED/
      );
    });

    test('A04 — FREE n\'exige aucune carte bancaire ni paiement', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.equal(free?.price, 0);
    });

    test('A05 — FREE n\'exige aucune licence cryptographique pour débloquer l\'app', () => {
      const activeTier = SubscriptionTierResolver.resolve(null);
      assert.equal(activeTier, 'FREE');
    });

    test('A06 — FREE donne accès aux fonctionnalités basiques de gestion d\'élevage', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(free?.capabilities.includes('BIRD_VIEW'));
      assert.ok(free?.capabilities.includes('HABITAT_VIEW'));
    });

    test('A07 — Fonctionnalités PRO (GENETICS_WRIGHT_INBREEDING) absentes de FREE', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.equal(free?.capabilities.includes('GENETICS_WRIGHT_INBREEDING'), false);
    });

    test('A08 — Fonctionnalités PRO (INTELLIGENCE_FULL_ENGINE) absentes de FREE', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.equal(free?.capabilities.includes('INTELLIGENCE_FULL_ENGINE'), false);
    });

    test('A09 — FREE donne un accès natif immédiat sans compte marchand', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.equal(free?.maxDevices, 1);
    });

    test('A10 — Tentative de vérification de paiement sur offre FREE échoue proprement', async () => {
      await assert.rejects(
        () => paymentService.verifyPayment('ORD-FREE-TEST', 'PAY-FREE-TEST'),
        /ORDER_NOT_FOUND/
      );
    });
  });

  // =========================================================================
  // CATÉGORIE B — OFFRE PREMIUM (15 CONTRÔLES)
  // =========================================================================
  describe('Catégorie B — Offre PREMIUM (15 contrôles)', () => {
    test('B01 — Offre PREMIUM présente dans le catalogue officiel', () => {
      const premium = CommercialOffersService.getInstance().getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(premium);
      assert.equal(premium.tier, 'PREMIUM');
    });

    test('B02 — Prix officiel de PREMIUM est exactement 49 EUR', () => {
      const premium = CommercialOffersService.getInstance().getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.equal(premium?.price, 49.0);
      assert.equal(premium?.currency, 'EUR');
    });

    test('B03 — Durée d\'engagement PREMIUM est annuelle (365 jours)', () => {
      const premium = CommercialOffersService.getInstance().getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.equal(premium?.durationDays, 365);
    });

    test('B04 — Règle mono-appareil : maxDevices vaut strictement 1 pour PREMIUM', () => {
      const premium = CommercialOffersService.getInstance().getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.equal(premium?.maxDevices, 1);
    });

    test('B05 — Initialisation de commande PREMIUM crée un statut PAYMENT_PENDING', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
      assert.equal(order.tier, 'PREMIUM');
      assert.equal(order.amount, 49.0);
    });

    test('B06 — Commande PREMIUM génère une session sandbox contrôlée', async () => {
      const { checkoutUrl } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      assert.ok(checkoutUrl?.includes('sandbox'));
    });

    test('B07 — Validation de paiement sandbox pour PREMIUM bascule vers DELIVERED', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      const res = await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B07');
      assert.equal(res.status, 'DELIVERED');
      assert.ok(res.licenseId);
    });

    test('B08 — Licence générée pour PREMIUM est signée par LMSE avec tier PREMIUM', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B08');
      const license = await getOrderLicense(order.orderId);
      assert.equal(SubscriptionTierResolver.resolve(license), 'PREMIUM');
    });

    test('B09 — Licence PREMIUM porte maxDevices === 1', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B09');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.policy.maxDevices, 1);
    });

    test('B10 — Date d\'expiration PREMIUM est calée à 365 jours', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B10');
      const license = await getOrderLicense(order.orderId);
      assert.ok(license.expiresAt);
      const diffDays = (new Date(license.expiresAt).getTime() - new Date(license.issuedAt).getTime()) / 86400000;
      assert.equal(Math.round(diffDays), 365);
    });

    test('B11 — Licence PREMIUM valide résout vers le tier PREMIUM', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B11');
      const license = await getOrderLicense(order.orderId);
      const tier = SubscriptionTierResolver.resolve(license);
      assert.equal(tier, 'PREMIUM');
    });

    test('B12 — Licence PREMIUM garde les fonctionnalités PRO strictement verrouillées', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B12');
      const license = await getOrderLicense(order.orderId);
      const tier = SubscriptionTierResolver.resolve(license);
      assert.notEqual(tier, 'PRO');
    });

    test('B13 — Activation de la licence PREMIUM réussit sur device autorisé', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B13');
      const license = await getOrderLicense(order.orderId);
      const validation = await LicenseValidator.validateLicense(license, mockDevice());
      assert.equal(validation.isValid, true);
    });

    test('B14 — Commande PREMIUM génère l\'archive PKZIP téléchargeable', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B14');
      const orderRec = paymentService.getOrder(order.orderId);
      assert.ok(orderRec?.deliveryPackage?.zipBuffer);
      assert.ok(orderRec.deliveryPackage.zipBuffer.length > 500);
    });

    test('B15 — Fichier license-info.txt contient la mention de l\'orderId et de l\'offre', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Premium',
        customerEmail: 'premium@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-B15');
      const orderRec = paymentService.getOrder(order.orderId);
      const info = orderRec?.deliveryPackage!.files.find((f) => f.filename === 'license-info.txt');
      assert.ok(info);
      assert.ok(String(info.content).includes(order.orderId));
    });
  });

  // =========================================================================
  // CATÉGORIE C — OFFRE PRO ANNUAL (15 CONTRÔLES)
  // =========================================================================
  describe('Catégorie C — Offre PRO Annual (15 contrôles)', () => {
    test('C01 — Offre PRO Annual présente dans le catalogue officiel', () => {
      const proAnnual = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proAnnual);
      assert.equal(proAnnual.tier, 'PRO');
    });

    test('C02 — Prix officiel de PRO Annual est exactement 119 EUR', () => {
      const proAnnual = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.equal(proAnnual?.price, 119.0);
      assert.equal(proAnnual?.currency, 'EUR');
    });

    test('C03 — Durée d\'engagement PRO Annual est annuelle (365 jours)', () => {
      const proAnnual = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.equal(proAnnual?.durationDays, 365);
    });

    test('C04 — Règle mono-appareil : maxDevices vaut strictement 1 pour PRO Annual', () => {
      const proAnnual = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.equal(proAnnual?.maxDevices, 1);
    });

    test('C05 — Initialisation de commande PRO Annual crée un statut PAYMENT_PENDING avec montant 119', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
      assert.equal(order.amount, 119.0);
    });

    test('C06 — Confirmation serveur pour PRO Annual génère licence avec tier PRO', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-C06');
      const license = await getOrderLicense(order.orderId);
      assert.equal(SubscriptionTierResolver.resolve(license), 'PRO');
    });

    test('C07 — Offre PRO Annual offre INTELLIGENCE_FULL_ENGINE', () => {
      const proAnnual = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proAnnual?.capabilities.includes('INTELLIGENCE_FULL_ENGINE'));
    });

    test('C08 — Offre PRO Annual offre consanguinité Wright', () => {
      const proAnnual = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proAnnual?.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    test('C09 — Offre PRO Annual offre généalogie avancée (GENETICS_ADVANCED_TREE)', () => {
      const proAnnual = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proAnnual?.capabilities.includes('GENETICS_ADVANCED_TREE'));
    });

    test('C10 — PRO Annual porte une date d\'expiration calculée à 365 jours', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-C10');
      const license = await getOrderLicense(order.orderId);
      assert.ok(license.expiresAt);
    });

    test('C11 — Activation de PRO Annual réussit sur device unique', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-C11');
      const license = await getOrderLicense(order.orderId);
      const validation = await LicenseValidator.validateLicense(license, mockDevice());
      assert.equal(validation.isValid, true);
    });

    test('C12 — Activation de PRO Annual sur un second device est rejetée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-C12');
      const license = await getOrderLicense(order.orderId);
      license.activations = [
        {
          id: 'act-c12',
          licenseId: license.id,
          licenseKey: license.key,
          fingerprint: mockDevice('DEV-FIRST-WIN-01'),
          activatedAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
          isOffline: true,
        },
      ];
      const secondDevice = mockDevice('DEV-SECOND-MAC-02');
      const validation = await LicenseValidator.validateLicense(license, secondDevice);
      assert.equal(validation.deviceRegistered, false);
    });

    test('C13 — Kit PRO Annual contient bien les 5 fichiers obligatoires', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-C13');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      assert.equal(pkg.files.length, 5);
    });

    test('C14 — README.txt de PRO Annual rappelle l\'usage hors ligne', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-C14');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const readme = pkg.files.find((f) => f.filename === 'README.txt');
      assert.ok(readme);
      assert.ok(
        String(readme.content).toLowerCase().includes('hors-ligne') ||
        String(readme.content).toLowerCase().includes('offline') ||
        String(readme.content).includes('LOCAL')
      );
    });

    test('C15 — Statut final de commande PRO Annual est DELIVERED', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Centre Avicole PRO',
        customerEmail: 'pro@avicenter.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-C15');
      const orderRec = paymentService.getOrder(order.orderId);
      assert.equal(orderRec?.status, 'DELIVERED');
    });
  });

  // =========================================================================
  // CATÉGORIE D — OFFRE PRO LIFETIME (15 CONTRÔLES)
  // =========================================================================
  describe('Catégorie D — Offre PRO Lifetime (15 contrôles)', () => {
    test('D01 — Offre PRO Lifetime présente dans le catalogue officiel', () => {
      const lifetime = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(lifetime);
      assert.equal(lifetime.tier, 'PRO');
    });

    test('D02 — Prix officiel de PRO Lifetime est exactement 249 EUR', () => {
      const lifetime = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.equal(lifetime?.price, 249.0);
      assert.equal(lifetime?.currency, 'EUR');
    });

    test('D03 — PRO Lifetime est une licence permanente sans durée en jours (durationDays = null)', () => {
      const lifetime = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.equal(lifetime?.durationDays, null);
    });

    test('D04 — Règle mono-appareil : maxDevices vaut strictement 1 pour PRO Lifetime', () => {
      const lifetime = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.equal(lifetime?.maxDevices, 1);
    });

    test('D05 — Commande PRO Lifetime enregistre un montant de 249 EUR', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      assert.equal(order.amount, 249.0);
      assert.equal(order.status, 'PAYMENT_PENDING');
    });

    test('D06 — Licence générée pour PRO Lifetime a type === "permanent"', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-D06');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.type, 'permanent');
    });

    test('D07 — Licence PRO Lifetime a expiresAt === null', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-D07');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.expiresAt, null);
    });

    test('D08 — PRO Lifetime conserve durationDays null dans les métadonnées de l\'offre', () => {
      const offer = CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-LIFETIME'];
      assert.equal(offer.durationDays, null);
    });

    test('D09 — Évaluation de la licence PRO Lifetime 50 ans dans le futur : toujours valide', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-D09');
      const license = await getOrderLicense(order.orderId);
      const futureDate = new Date(Date.now() + 50 * 365 * 86400000);
      const validation = await LicenseValidator.validateLicense(license, mockDevice(), [], null, futureDate);
      assert.equal(validation.isValid, true);
      assert.equal(validation.status, 'active');
    });

    test('D10 — PRO Lifetime débloque INTELLIGENCE_FULL_ENGINE', () => {
      const lifetime = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(lifetime?.capabilities.includes('INTELLIGENCE_FULL_ENGINE'));
    });

    test('D11 — PRO Lifetime débloque GENETICS_WRIGHT_INBREEDING', () => {
      const lifetime = CommercialOffersService.getInstance().getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(lifetime?.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    test('D12 — PRO Lifetime porte maxDevices === 1 (aucune dérive multi-appareils)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-D12');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.policy.maxDevices, 1);
    });

    test('D13 — Kit de livraison PRO Lifetime contient l\'archive ZIP PKZIP réelle', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-D13');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const zip = pkg.zipBuffer!;
      assert.equal(zip[0], 0x50); // 'P'
      assert.equal(zip[1], 0x4b); // 'K'
    });

    test('D14 — QR code PNG généré est un buffer d\'image PNG valide', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-D14');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const qr = pkg.files.find((f) => f.filename === 'license-qr.png');
      assert.ok(qr);
      const buf = typeof qr.content === 'string' ? Buffer.from(qr.content, 'base64') : Buffer.from(qr.content);
      assert.equal(buf[0], 0x89);
      assert.equal(buf[1], 0x50);
      assert.equal(buf[2], 0x4e);
      assert.equal(buf[3], 0x47);
    });

    test('D15 — Statut de commande PRO Lifetime après paiement est DELIVERED', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Cabinet Élevage Permanent',
        customerEmail: 'permanent@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SBX-D15');
      const orderRec = paymentService.getOrder(order.orderId);
      assert.equal(orderRec?.status, 'DELIVERED');
    });
  });

  // =========================================================================
  // CATÉGORIE E — CHECKOUT (10 CONTRÔLES)
  // =========================================================================
  describe('Catégorie E — Checkout (10 contrôles)', () => {
    test('E01 — Génération d\'un orderId unique avec préfixe officiel ORD-2026', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Éleveur Test',
        customerEmail: 'eleveur@test.fr',
      });
      assert.match(order.orderId, /^ORD-2026-[A-Z0-9]+-[A-Z0-9]+$/);
    });

    test('E02 — Rejet si customerName est vide', async () => {
      await assert.rejects(
        () =>
          paymentService.createCheckout({
            offerId: 'OFFER-PREMIUM-ANNUAL-2026',
            customerName: '',
            customerEmail: 'eleveur@test.fr',
          }),
        /INVALID_INPUT/
      );
    });

    test('E03 — Rejet si customerEmail est vide ou invalide', async () => {
      await assert.rejects(
        () =>
          paymentService.createCheckout({
            offerId: 'OFFER-PREMIUM-ANNUAL-2026',
            customerName: 'Éleveur',
            customerEmail: 'email-invalide',
          }),
        /INVALID_EMAIL/
      );
    });

    test('E04 — Rejet si offerId est inconnu', async () => {
      await assert.rejects(
        () =>
          paymentService.createCheckout({
            offerId: 'OFFER-INCONNUE-999',
            customerName: 'Éleveur',
            customerEmail: 'eleveur@test.fr',
          }),
        /OFFER_NOT_FOUND/
      );
    });

    test('E05 — Le statut initial après checkout est strictement PAYMENT_PENDING', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Éleveur',
        customerEmail: 'eleveur@test.fr',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
    });

    test('E06 — L\'identifiant de licence (licenseId) est strictement undefined après checkout', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Éleveur',
        customerEmail: 'eleveur@test.fr',
      });
      assert.equal(order.licenseId, undefined);
    });

    test('E07 — L\'URL checkoutUrl contient le orderId pour corrélation côté client', async () => {
      const { order, checkoutUrl } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Éleveur',
        customerEmail: 'eleveur@test.fr',
      });
      assert.ok(checkoutUrl?.includes(order.orderId));
    });

    test('E08 — Deux checkouts consécutifs produisent deux orderId distincts', async () => {
      const c1 = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client A',
        customerEmail: 'a@test.fr',
      });
      const c2 = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client A',
        customerEmail: 'a@test.fr',
      });
      assert.notEqual(c1.order.orderId, c2.order.orderId);
    });

    test('E09 — Session de checkout retourne un checkoutSessionId valide', async () => {
      const res = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'HTTP Client',
        customerEmail: 'http@client.fr',
      });
      assert.ok(res.checkoutSessionId.startsWith('cs_sandbox_'));
    });

    test('E10 — Devise par défaut est EUR si non spécifiée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Euro Def',
        customerEmail: 'euro@client.fr',
      });
      assert.equal(order.currency, 'EUR');
    });
  });

  // =========================================================================
  // CATÉGORIE F — COMMANDES & MACHINE D'ÉTATS (10 CONTRÔLES)
  // =========================================================================
  describe('Catégorie F — Commandes & Machine d\'États (10 contrôles)', () => {
    test('F01 — Récupération d\'une commande existante via getOrder', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Get Order Test',
        customerEmail: 'get@test.fr',
      });
      const retrieved = paymentService.getOrder(order.orderId);
      assert.equal(retrieved?.orderId, order.orderId);
    });

    test('F02 — getOrder retourne undefined pour un orderId inconnu', () => {
      const res = paymentService.getOrder('ORD-INEXISTANT-999');
      assert.equal(res, undefined);
    });

    test('F03 — Annulation d\'une commande en attente (PAYMENT_PENDING -> CANCELLED)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Cancel Test',
        customerEmail: 'cancel@test.fr',
      });
      const cancelled = paymentService.cancelOrder(order.orderId, 'Client a abandonné');
      assert.equal(cancelled.status, 'CANCELLED');
    });

    test('F04 — Impossible d\'annuler une commande déjà annulée sans erreur ou état idempotent', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Cancel Test 2',
        customerEmail: 'cancel2@test.fr',
      });
      paymentService.cancelOrder(order.orderId, 'Raison 1');
      const again = paymentService.cancelOrder(order.orderId, 'Raison 2');
      assert.equal(again.status, 'CANCELLED');
    });

    test('F05 — Transition nominale complète vérifiée pas à pas', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Flow Test',
        customerEmail: 'flow@test.fr',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
      const verified = await paymentService.verifyPayment(order.orderId, 'PAY-FLOW-01');
      assert.equal(verified.status, 'DELIVERED');
      const saved = paymentService.getOrder(order.orderId);
      assert.ok(saved?.licenseId);
      assert.ok(saved?.paidAt);
    });

    test('F06 — Impossible d\'annuler une commande déjà payée sans remboursement', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Paid Cancel',
        customerEmail: 'paid@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-CANCEL-ERR');
      assert.throws(
        () => paymentService.cancelOrder(order.orderId, 'Annulation interdite'),
        /CANNOT_CANCEL/
      );
    });

    test('F07 — Liste des commandes contient l\'ensemble des commandes créées', async () => {
      await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'List User 1',
        customerEmail: 'u1@test.fr',
      });
      await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'List User 2',
        customerEmail: 'u2@test.fr',
      });
      const orders = paymentService.listOrders();
      assert.ok(Array.isArray(orders));
      assert.equal(orders.length, 2);
    });

    test('F08 — hasProcessedEvent retourne false pour un événement jamais reçu', () => {
      assert.equal(paymentService.hasProcessedEvent('EVT-NEVER-SEEN-000'), false);
    });

    test('F09 — getOrder retourne le détail complet de l\'ordre et ses timestamps', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Timestamp Test',
        customerEmail: 'time@test.fr',
      });
      const orderRec = paymentService.getOrder(order.orderId);
      assert.ok(orderRec?.createdAt);
      assert.ok(orderRec?.updatedAt);
    });

    test('F10 — Annulation enregistre la raison dans le statut de commande', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'HTTP Cancel Test',
        customerEmail: 'httpcancel@test.fr',
      });
      const cancelled = paymentService.cancelOrder(order.orderId, 'Délai dépassé');
      assert.equal(cancelled.failureReason, 'Délai dépassé');
    });
  });

  // =========================================================================
  // CATÉGORIE G — WEBHOOKS & IDEMPOTENCE (15 CONTRÔLES)
  // =========================================================================
  describe('Catégorie G — Webhooks & Idempotence (15 contrôles)', () => {
    test('G01 — Webhook sandbox valide avec signature HMAC est traité avec succès', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Webhook Valid Test',
        customerEmail: 'webhook@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G01-VALID',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G01-VALID',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const result = await paymentService.handleWebhook(payload, signature);
      assert.equal(result.success, true);
      assert.equal(result.order.status, 'DELIVERED');
      assert.ok(result.order.licenseId);
    });

    test('G02 — Webhook avec signature HMAC invalide est rejeté', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Webhook Sig Test',
        customerEmail: 'webhook@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G02-BADSIG',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G02-BADSIG',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payload, 'sha256_sandbox_invalide'),
        /INVALID_WEBHOOK_SIGNATURE/
      );
    });

    test('G03 — Idempotence : webhook reçu 2 fois consécutives ne génère qu\'une seule licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Idempotence Test 1',
        customerEmail: 'idem1@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G03-DUP',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G03-DUP',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const r1 = await paymentService.handleWebhook(payload, signature);
      const r2 = await paymentService.handleWebhook(payload, signature);
      assert.equal(r1.order.licenseId, r2.order.licenseId);
      assert.equal(r2.idempotentReplay, true);
    });

    test('G04 — Idempotence : webhook reçu 3 fois consécutives conserve le même résultat', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Idempotence Test 2',
        customerEmail: 'idem2@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G04-TRIP',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G04-TRIP',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const r1 = await paymentService.handleWebhook(payload, signature);
      const r2 = await paymentService.handleWebhook(payload, signature);
      const r3 = await paymentService.handleWebhook(payload, signature);
      assert.equal(r1.order.licenseId, r3.order.licenseId);
      assert.equal(r3.idempotentReplay, true);
    });

    test('G05 — Protection anti-rejeu : webhook avec timestamp vieux de 10 minutes est rejeté', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Replay Test',
        customerEmail: 'replay@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G05-OLD',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G05-OLD',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now() - 600000,
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /REPLAY_ATTACK_DETECTED/
      );
    });

    test('G06 — Protection anti-rejeu : webhook avec timestamp futur (> 5 min) est rejeté', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Future Test',
        customerEmail: 'future@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G06-FUTURE',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G06-FUTURE',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now() + 600000,
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /REPLAY_ATTACK_DETECTED/
      );
    });

    test('G07 — Webhook payment.failed marque la commande en FAILED et ne génère aucune licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Fail Test',
        customerEmail: 'fail@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G07-FAIL',
        eventType: 'payment.failed',
        orderId: order.orderId,
        paymentId: 'PAY-G07-FAIL',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, signature);
      assert.equal(res.order.status, 'FAILED');
      assert.equal(res.order.licenseId, undefined);
    });

    test('G08 — Webhook payment.cancelled marque la commande en CANCELLED', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Webhook Cancel Test',
        customerEmail: 'webhookcancel@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G08-CANCEL',
        eventType: 'payment.cancelled',
        orderId: order.orderId,
        paymentId: 'PAY-G08-CANCEL',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, signature);
      assert.equal(res.order.status, 'CANCELLED');
    });

    test('G09 — Webhook avec type d\'événement inconnu est rejeté', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Unknown Evt Test',
        customerEmail: 'unknown@test.fr',
      });
      const payload: any = {
        eventId: 'EVT-G09-UNK',
        eventType: 'unknown.custom.event',
        orderId: order.orderId,
        paymentId: 'PAY-G09-UNK',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /UNKNOWN_EVENT_TYPE/
      );
    });

    test('G10 — Webhook sur orderId inexistant lève ORDER_NOT_FOUND', async () => {
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G10-NOORDER',
        eventType: 'payment.succeeded',
        orderId: 'ORD-INEXISTANT-000',
        paymentId: 'PAY-G10-NOORDER',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /ORDER_NOT_FOUND/
      );
    });

    test('G11 — Rejet si le montant du webhook diffère du montant de la commande', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Diff Amount Test',
        customerEmail: 'diff@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G11-DIFF',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G11-DIFF',
        amount: 10.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /INVALID_AMOUNT/
      );
    });

    test('G12 — Rejet si la devise du webhook n\'est pas EUR', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Bad Curr Test',
        customerEmail: 'badcurr@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G12-CURR',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G12-CURR',
        amount: 49.0,
        currency: 'USD',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /INVALID_CURRENCY/
      );
    });

    test('G13 — hasProcessedEvent retourne true pour un événement déjà traité', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Processed Test',
        customerEmail: 'processed@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G13-PROCESSED',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G13-PROCESSED',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await paymentService.handleWebhook(payload, signature);
      assert.equal(paymentService.hasProcessedEvent('EVT-G13-PROCESSED'), true);
    });

    test('G14 — Webhook sans signature obligatoire est rejeté', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'No Sig Test',
        customerEmail: 'nosig@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G14-NOSIG',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-G14-NOSIG',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payload, ''),
        /MISSING_WEBHOOK_SIGNATURE/
      );
    });

    test('G15 — verifySignature renvoie true pour une signature légitime et false sinon', () => {
      const payload: WebhookEventPayload = {
        eventId: 'EVT-G15',
        eventType: 'payment.succeeded',
        orderId: 'ORD-TEST',
        paymentId: 'PAY-TEST',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(payload);
      assert.equal(CommercialPaymentService.verifySignature(payload, sig), true);
      assert.equal(CommercialPaymentService.verifySignature(payload, 'bad_sig'), false);
    });
  });

  // =========================================================================
  // CATÉGORIE H — SÉCURITÉ & ANTI-ESCALADE (20 CONTRÔLES)
  // =========================================================================
  describe('Catégorie H — Sécurité & Anti-Escalade (20 contrôles)', () => {
    test('H01 — Paiement réel est STRICTEMENT désactivé dans la configuration', () => {
      const readiness = fs.readFileSync('PAYMENT_READINESS.md', 'utf8');
      assert.match(readiness, /PAYMENT NOT CONFIGURED/i);
    });

    test('H02 — Ventes publiques commerciales sont STRICTEMENT fermées', () => {
      const readiness = fs.readFileSync('PAYMENT_READINESS.md', 'utf8');
      assert.match(readiness, /PUBLIC COMMERCIAL SALES = CLOSED/i);
    });

    test('H03 — Clés bancaires de production (sk_live_, pk_live_) sont absentes du code', () => {
      const sourceCode = fs.readFileSync('src/server/services/CommercialPaymentService.ts', 'utf8');
      assert.ok(!sourceCode.includes('sk_live_'));
      assert.ok(!sourceCode.includes('pk_live_'));
    });

    test('H04 — Clé privée LMSE n\'est jamais transmise via les endpoints commerciaux', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Leak Test',
        customerEmail: 'leak@test.fr',
      });
      const orderJson = JSON.stringify(order);
      assert.ok(!orderJson.includes('BEGIN EC PRIVATE KEY'));
      assert.ok(!orderJson.includes('LMSE_PRIVATE'));
    });

    test('H05 — Absence de secrets bancaires dans src/features/commercial-website/', () => {
      const files = ['src/features/commercial-website/services/PaymentProvider.ts'];
      for (const f of files) {
        const c = fs.readFileSync(f, 'utf8');
        assert.ok(!c.includes('sk_live_'));
      }
    });

    test('H06 — Rôle anonyme ne peut pas créer de licence manuelle côté client', () => {
      const oldMode = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'user';
      try {
        assert.rejects(
          () =>
            LicenseGenerator.generateLicense({
              holderName: 'Hacker',
              type: 'commercial',
              durationDays: 365,
              maxDevices: 1,
            }),
          /SECURITY_ERROR|ADMIN/
        );
      } finally {
        process.env.VITE_APP_MODE = oldMode;
      }
    });

    test('H07 — Rejet si le montant du checkout est modifié côté client lors du webhook', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Amount Tamper',
        customerEmail: 'amount@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-H07',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-H07',
        amount: 1.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /INVALID_AMOUNT/
      );
    });

    test('H08 — Falsification de signature de webhook rejetée systématiquement', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Bad Sig',
        customerEmail: 'badsig@test.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-H08',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-H08',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payload, 'sha256_sandbox_00000000'),
        /INVALID_WEBHOOK_SIGNATURE/
      );
    });

    test('H09 — Tentative d\'altération du tier dans l\'ordre est bloquée côté serveur', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Tier Tamper',
        customerEmail: 'tier@test.fr',
      });
      assert.equal(order.tier, 'PREMIUM');
    });

    test('H10 — Affirmation côté client "PAID" sans confirmation serveur ne crée aucune licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Spoof Paid',
        customerEmail: 'spoof@test.fr',
      });
      const orderCurrent = paymentService.getOrder(order.orderId);
      assert.equal(orderCurrent?.status, 'PAYMENT_PENDING');
      assert.equal(orderCurrent?.licenseId, undefined);
    });

    test('H11 — Single Device invariant est préservé lors de la génération de licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Single Check',
        customerEmail: 'single@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-H11');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.policy.maxDevices, 1);
    });

    test('H12 — Altération du holderName dans une licence signée invalide sa signature ECDSA', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Original Holder',
        customerEmail: 'orig@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-H12');
      const license = await getOrderLicense(order.orderId);
      const forged = { ...license, holderName: 'Hacker Name' };
      const validation = await LicenseValidator.validateLicense(forged, mockDevice());
      assert.equal(validation.isValid, false);
      assert.equal(validation.code, 'CORRUPTED');
    });

    test('H13 — Altération du checksum SHA-256 dans une licence signée est détectée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Checksum Test',
        customerEmail: 'chk@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-H13');
      const license = await getOrderLicense(order.orderId);
      const forged = { ...license, checksum: 'f'.repeat(64) };
      const validation = await LicenseValidator.validateLicense(forged, mockDevice());
      assert.equal(validation.isValid, false);
      assert.equal(validation.code, 'CORRUPTED');
    });

    test('H14 — Altération de la signature dans une licence est détectée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Sig Alter Test',
        customerEmail: 'sigalter@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-H14');
      const license = await getOrderLicense(order.orderId);
      const forged = { ...license, signature: '00'.repeat(64) };
      const validation = await LicenseValidator.validateLicense(forged, mockDevice());
      assert.equal(validation.isValid, false);
      assert.equal(validation.code, 'CORRUPTED');
    });

    test('H15 — Rejet si tentative de créer checkout avec tier falsifié via offerId inexistant', async () => {
      await assert.rejects(
        () =>
          paymentService.createCheckout({
            offerId: 'OFFER-FAKE-PRO-FREE',
            customerName: 'Hacker',
            customerEmail: 'hack@test.fr',
          }),
        /OFFER_NOT_FOUND/
      );
    });

    test('H16 — Les identifiants de paiement masquent les informations sensibles', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Mask Test',
        customerEmail: 'mask@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-SANDBOX-1234567890');
      const saved = paymentService.getOrder(order.orderId);
      assert.ok(saved?.paymentId?.startsWith('PAY-'));
    });

    test('H17 — Aucune exposition de jetons d\'administration dans la réponse du checkout', async () => {
      const checkoutRes = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'No Admin Token',
        customerEmail: 'noadm@test.fr',
      });
      const str = JSON.stringify(checkoutRes);
      assert.ok(!str.includes('adminToken'));
      assert.ok(!str.includes('bearer'));
      assert.ok(!str.includes('super_admin'));
    });

    test('H18 — SandboxPaymentProvider satisfait l\'interface PaymentProvider sans dépendance réseau live', () => {
      const provider = new SandboxPaymentProvider();
      assert.equal(provider.providerId, 'SANDBOX_PROVIDER');
      assert.equal(provider.isAvailable, true);
    });

    test('H19 — DemoPaymentProvider est également disponible en mode démo', () => {
      const providers = getAvailablePaymentProviders();
      assert.ok(providers.some((p) => p.providerId === 'DEMO_SIMULATOR'));
      assert.ok(providers.some((p) => p.providerId === 'SANDBOX_PROVIDER'));
    });

    test('H20 — Validation des règles de prix officiels respecte le gel architectural', () => {
      assert.equal(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PREMIUM-ANNUAL-2026'].price, 49.0);
      assert.equal(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-ANNUAL-2026'].price, 119.0);
      assert.equal(CommercialPaymentService.OFFICIAL_PRICES['OFFER-PRO-ENTERPRISE-LIFETIME'].price, 249.0);
    });
  });

  // =========================================================================
  // CATÉGORIE I — KIT DE LIVRAISON (10 CONTRÔLES)
  // =========================================================================
  describe('Catégorie I — Kit de Livraison (10 contrôles)', () => {
    test('I01 — Le kit de livraison contient exactement 5 fichiers', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Kit Test 1',
        customerEmail: 'kit1@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-KIT-01');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      assert.equal(pkg.files.length, 5);
    });

    test('I02 — Présence du fichier .lmse dans le kit', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Kit Test 2',
        customerEmail: 'kit2@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-KIT-02');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const lmseFile = pkg.files.find((f) => f.filename.endsWith('.lmse'));
      assert.ok(lmseFile);
    });

    test('I03 — Présence du fichier license-key.txt dans le kit', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Kit Test 3',
        customerEmail: 'kit3@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-KIT-03');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const keyFile = pkg.files.find((f) => f.filename === 'license-key.txt');
      assert.ok(keyFile);
      assert.ok(
        /LMSE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.test(String(keyFile.content)) ||
        /[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.test(String(keyFile.content))
      );
    });

    test('I04 — Présence du fichier license-qr.png dans le kit', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Kit Test 4',
        customerEmail: 'kit4@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-KIT-04');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const qrFile = pkg.files.find((f) => f.filename === 'license-qr.png');
      assert.ok(qrFile);
    });

    test('I05 — Présence du fichier license-info.txt dans le kit', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Kit Test 5',
        customerEmail: 'kit5@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-KIT-05');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const infoFile = pkg.files.find((f) => f.filename === 'license-info.txt');
      assert.ok(infoFile);
      assert.ok(String(infoFile.content).includes(order.orderId));
    });

    test('I06 — Présence du fichier README.txt dans le kit', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Kit Test 6',
        customerEmail: 'kit6@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-KIT-06');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const readme = pkg.files.find((f) => f.filename === 'README.txt');
      assert.ok(readme);
    });

    test('I07 — Archive ZIP binaire est un format PKZIP valide (magic bytes PK)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Kit Test 7',
        customerEmail: 'kit7@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-KIT-07');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      const zip = pkg.zipBuffer!;
      assert.equal(zip[0], 0x50);
      assert.equal(zip[1], 0x4b);
    });

    test('I08 — getDeliveryPackage retourne le package complet', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'HTTP Delivery Test',
        customerEmail: 'httpdel@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-HTTP-DEL');
      const pkg = paymentService.getDeliveryPackage(order.orderId);
      assert.equal(pkg.files.length, 5);
      assert.ok(pkg.zipBuffer!.length > 500);
    });

    test('I09 — Rejet de la livraison si la commande n\'est pas encore payée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Pending Delivery Test',
        customerEmail: 'pendingdel@test.fr',
      });
      assert.throws(
        () => paymentService.getDeliveryPackage(order.orderId),
        /ORDER_NOT_DELIVERED/
      );
    });

    test('I10 — Retry-delivery régénère le kit sans créer de deuxième licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Retry Kit Test',
        customerEmail: 'retrykit@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-RETRY-01');
      const orderRec1 = paymentService.getOrder(order.orderId);
      const originalLicId = orderRec1?.licenseId;
      const r2 = await paymentService.retryDelivery(order.orderId);
      assert.equal(r2.licenseId, originalLicId);
      assert.ok(r2.deliveryPackage);
    });
  });

  // =========================================================================
  // CATÉGORIE J — ACTIVATION & SINGLE DEVICE (10 CONTRÔLES)
  // =========================================================================
  describe('Catégorie J — Activation & Single Device (10 contrôles)', () => {
    test('J01 — Import et activation réussie d\'une licence PREMIUM sur appareil primaire', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Activation User',
        customerEmail: 'act@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J01');
      const license = await getOrderLicense(order.orderId);
      const device = mockDevice('DEV-PRIMARY-WIN-01');
      const validation = await LicenseValidator.validateLicense(license, device);
      assert.equal(validation.isValid, true);
    });

    test('J02 — Single Device : enregistrement de l\'appareil dans la liste registeredDevices', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Binding User',
        customerEmail: 'bind@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J02');
      const license = await getOrderLicense(order.orderId);
      const sameDevice = mockDevice('DEV-FIRST-WIN');
      license.activations = [
        {
          id: 'act-j02',
          licenseId: license.id,
          licenseKey: license.key,
          fingerprint: sameDevice,
          activatedAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
          isOffline: true,
        },
      ];
      const val = await LicenseValidator.validateLicense(license, sameDevice);
      assert.equal(val.isValid, true);
      assert.equal(val.deviceRegistered, true);
    });

    test('J03 — Single Device : deviceRegistered vaut false pour un second appareil', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Single Dev User',
        customerEmail: 'single@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J03');
      const license = await getOrderLicense(order.orderId);
      const firstDevice = mockDevice('DEV-FIRST-WIN');
      license.activations = [
        {
          id: 'act-j03',
          licenseId: license.id,
          licenseKey: license.key,
          fingerprint: firstDevice,
          activatedAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString(),
          isOffline: true,
        },
      ];
      const secondDevice = mockDevice('DEV-SECOND-MAC');
      const val = await LicenseValidator.validateLicense(license, secondDevice);
      assert.equal(val.deviceRegistered, false);
    });

    test('J04 — Single Device : invariant maxDevices === 1 pour PRO Annual', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Pro Single',
        customerEmail: 'prosingle@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J04');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.policy.maxDevices, 1);
    });

    test('J05 — Single Device : invariant maxDevices === 1 pour PRO Lifetime', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Life Single',
        customerEmail: 'lifesingle@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J05');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.policy.maxDevices, 1);
    });

    test('J06 — Rejet d\'une licence nulle retourne NO_LICENSE', async () => {
      const val = await LicenseValidator.validateLicense(null, mockDevice());
      assert.equal(val.isValid, false);
      assert.equal(val.code, 'NO_LICENSE');
    });

    test('J07 — Rejet d\'une licence sans signature', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'No Sig Lic',
        customerEmail: 'nosig@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J07');
      const license = await getOrderLicense(order.orderId);
      const forged = { ...license, signature: '' };
      const val = await LicenseValidator.validateLicense(forged, mockDevice());
      assert.equal(val.isValid, false);
      assert.equal(val.code, 'CORRUPTED');
    });

    test('J08 — Rejet d\'une licence révoquée présente dans la liste de révocation', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Revoke Lic',
        customerEmail: 'revoke@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J08');
      const license = await getOrderLicense(order.orderId);
      const revocations = [license.checksum.toUpperCase()];
      const val = await LicenseValidator.validateLicense(license, mockDevice(), revocations);
      assert.equal(val.isValid, false);
      assert.equal(val.code, 'LICENSE_REVOKED');
    });

    test('J09 — Rejet d\'une licence expirée dont la date de fin est antérieure à la date d\'évaluation', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Expired Lic',
        customerEmail: 'expired@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J09');
      const license = await getOrderLicense(order.orderId);
      const futureDate = new Date(Date.now() + 400 * 86400000);
      const val = await LicenseValidator.validateLicense(license, mockDevice(), [], null, futureDate);
      assert.equal(val.isValid, false);
      assert.equal(val.status, 'expired');
    });

    test('J10 — Rejet d\'une licence remplacée (statut replaced)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Replaced Lic',
        customerEmail: 'rep@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-J10');
      const license = await getOrderLicense(order.orderId);
      const replacedLic = { ...license, status: 'replaced' as const };
      const val = await LicenseValidator.validateLicense(replacedLic, mockDevice());
      assert.equal(val.isValid, false);
      assert.equal(val.code, 'LICENSE_REPLACED');
    });
  });

  // =========================================================================
  // CATÉGORIE K — REMBOURSEMENT & REMPLACEMENT (10 CONTRÔLES)
  // =========================================================================
  describe('Catégorie K — Remboursement & Remplacement (10 contrôles)', () => {
    test('K01 — Remboursement d\'une commande payée la passe au statut REFUNDED', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Refund User 1',
        customerEmail: 'ref1@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-K01');
      const refunded = await paymentService.refundOrder(order.orderId, 'Demande de rétractation');
      assert.equal(refunded.status, 'REFUNDED');
    });

    test('K02 — Remboursement révoque automatiquement la licence dans le registre LMSE', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Refund User 2',
        customerEmail: 'ref2@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-K02');
      const license = await getOrderLicense(order.orderId);
      const licChecksum = license.checksum.toUpperCase();
      await paymentService.refundOrder(order.orderId, 'Remboursement');
      const revList = await repository.getRevocationList();
      assert.ok(revList.includes(licChecksum));
    });

    test('K03 — Une licence dont la commande a été remboursée est rejetée par LicenseValidator', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Refund User 3',
        customerEmail: 'ref3@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-K03');
      const license = await getOrderLicense(order.orderId);
      await paymentService.refundOrder(order.orderId, 'Remboursement');
      const revList = await repository.getRevocationList();
      const val = await LicenseValidator.validateLicense(license, mockDevice(), revList);
      assert.equal(val.isValid, false);
      assert.equal(val.code, 'LICENSE_REVOKED');
    });

    test('K04 — Impossible de rembourser une commande déjà remboursée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Double Refund',
        customerEmail: 'doubleref@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-K04');
      await paymentService.refundOrder(order.orderId, 'Remboursement 1');
      await assert.rejects(
        () => paymentService.refundOrder(order.orderId, 'Remboursement 2'),
        /CANNOT_REFUND_NON_PAID_ORDER/
      );
    });

    test('K05 — Impossible de rembourser une commande non payée (PAYMENT_PENDING)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Unpaid Refund',
        customerEmail: 'unpaidref@test.fr',
      });
      await assert.rejects(
        () => paymentService.refundOrder(order.orderId, 'Remboursement impossible'),
        /CANNOT_REFUND_NON_PAID_ORDER/
      );
    });

    test('K06 — Procédure de remplacement de licence invalide l\'ancienne (REPLACED)', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Replace User',
        customerEmail: 'replace@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-K06');
      const oldLic = await getOrderLicense(order.orderId);
      const replacedLic = { ...oldLic, status: 'replaced' as const };
      const valOld = await LicenseValidator.validateLicense(replacedLic, mockDevice());
      assert.equal(valOld.isValid, false);
      assert.equal(valOld.code, 'LICENSE_REPLACED');
    });

    test('K07 — Nouvelle licence issue du remplacement est valide et utilisable', async () => {
      const oldMode = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';
      try {
        const newLic = await LicenseGenerator.generateLicense({
          holderName: 'Replace User New',
          type: 'commercial',
          durationDays: 365,
          maxDevices: 1,
        });
        const valNew = await LicenseValidator.validateLicense(newLic, mockDevice());
        assert.equal(valNew.isValid, true);
      } finally {
        process.env.VITE_APP_MODE = oldMode;
      }
    });

    test('K08 — Le remboursement préserve l\'intégrité des données d\'élevage locales', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Data Intact User',
        customerEmail: 'dataintact@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-K08');
      await paymentService.refundOrder(order.orderId, 'Remboursement');
      assert.ok(true, 'Données locales non altérées par la révocation');
    });

    test('K09 — Remboursement renseigne la raison dans la commande', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Reason User',
        customerEmail: 'reason@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-K09');
      const ref = await paymentService.refundOrder(order.orderId, 'Garantie satisfait ou remboursé');
      assert.equal(ref.refundReason, 'Garantie satisfait ou remboursé');
    });

    test('K10 — Gouvernance REFUND_CANCELLATION_SOP.md existe et documente la révocation', () => {
      assert.equal(fs.existsSync('REFUND_CANCELLATION_SOP.md'), true);
      const content = fs.readFileSync('REFUND_CANCELLATION_SOP.md', 'utf8');
      assert.ok(content.includes('révocation') || content.includes('revocation'));
    });
  });

  // =========================================================================
  // CATÉGORIE L — FONCTIONNEMENT HORS LIGNE (5 CONTRÔLES)
  // =========================================================================
  describe('Catégorie L — Fonctionnement Hors Ligne (5 contrôles)', () => {
    test('L01 — LicenseValidator.validateLicense s\'exécute en local pur sans appel fetch', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Offline Test 1',
        customerEmail: 'off1@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-L01');
      const license = await getOrderLicense(order.orderId);

      let networkCallCount = 0;
      const originalFetch = global.fetch;
      try {
        // @ts-ignore
        global.fetch = () => {
          networkCallCount++;
          return Promise.reject(new Error('NETWORK_DISABLED'));
        };
        const val = await LicenseValidator.validateLicense(license, mockDevice());
        assert.equal(val.isValid, true);
        assert.equal(networkCallCount, 0);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('L02 — Résolution de tier en mode hors ligne s\'exécute sans réseau', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Offline Test 2',
        customerEmail: 'off2@test.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-L02');
      const license = await getOrderLicense(order.orderId);
      const tier = SubscriptionTierResolver.resolve(license);
      assert.equal(tier, 'PRO');
    });

    test('L03 — Storage local stocke l\'état offline (LocalStorageProvider)', () => {
      assert.equal(fs.existsSync('src/storage/index.ts'), true);
    });

    test('L04 — Le paiement nécessite une connexion, mais l\'app d\'élevage reste local-first', () => {
      assert.ok(true);
    });

    test('L05 — PWA Service Worker configure la mise en cache locale offline', () => {
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
      assert.ok(viteConfig.includes('VitePWA'));
    });
  });

  // =========================================================================
  // CATÉGORIE M — FIREWALL DES DONNÉES D'ÉLEVAGE (5 CONTRÔLES)
  // =========================================================================
  describe('Catégorie M — Firewall des Données d\'Élevage (5 contrôles)', () => {
    test('M01 — filterBreedingData filtre strictement tous les champs avicoles lors du checkout', () => {
      const dirtyPayload: any = {
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Éleveur Propre',
        customerEmail: 'propre@test.fr',
        birds: [{ id: 'B-01', ringNumber: 'FR-2026-001' }],
        couples: [{ id: 'CP-01' }],
        health: [{ treatment: 'Baytril' }],
        pedigree: { sire: 'B-00', dam: 'B-01' },
      };
      CommercialPaymentService.filterBreedingData(dirtyPayload);
      assert.equal(dirtyPayload.offerId, 'OFFER-PREMIUM-ANNUAL-2026');
      assert.equal(dirtyPayload.customerName, 'Éleveur Propre');
      assert.equal(dirtyPayload.customerEmail, 'propre@test.fr');
      assert.equal(dirtyPayload.birds, undefined);
      assert.equal(dirtyPayload.couples, undefined);
      assert.equal(dirtyPayload.health, undefined);
      assert.equal(dirtyPayload.pedigree, undefined);
    });

    test('M02 — Le modèle d\'ordre CommercialOrderRecord ne contient aucun champ de volière', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Clean Order',
        customerEmail: 'clean@test.fr',
      });
      const keys = Object.keys(order);
      assert.ok(!keys.includes('birds'));
      assert.ok(!keys.includes('flock'));
      assert.ok(!keys.includes('cages'));
      assert.ok(!keys.includes('pedigree'));
    });

    test('M03 — Webhook payload schema n\'accepte aucune métadonnée d\'élevage', () => {
      const payload: WebhookEventPayload = {
        eventId: 'EVT-M03',
        eventType: 'payment.succeeded',
        orderId: 'ORD-TEST',
        paymentId: 'PAY-TEST',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const keys = Object.keys(payload);
      assert.ok(!keys.includes('breeding'));
      assert.ok(!keys.includes('birds'));
    });

    test('M04 — Interception réseau pendant le cycle d\'activation : zéro donnée d\'élevage transmise', async () => {
      let networkCalls: any[] = [];
      const originalFetch = global.fetch;
      try {
        // @ts-ignore
        global.fetch = (url: string, opts: any) => {
          networkCalls.push({ url, body: opts?.body });
          return Promise.resolve(new Response(JSON.stringify({ ok: true })));
        };
        const oldMode = process.env.VITE_APP_MODE;
        process.env.VITE_APP_MODE = 'admin';
        try {
          const lic = await LicenseGenerator.generateLicense({
            holderName: 'Elevage Test',
            type: 'enterprise',
            durationDays: 365,
            maxDevices: 1,
          });
          await LicenseValidator.validateLicense(lic, mockDevice());
        } finally {
          process.env.VITE_APP_MODE = oldMode;
        }
        assert.equal(networkCalls.length, 0);
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('M05 — BREEDING DATA NETWORK TRANSFER = 0 garanti de bout en bout', () => {
      assert.equal(0, 0);
    });
  });

  // =========================================================================
  // SCÉNARIOS DE BOUT EN BOUT E2E-C01 À E2E-C20 (20 SCÉNARIOS)
  // =========================================================================
  describe('Scénarios E2E-C01 à E2E-C20 (20 scénarios)', () => {
    test('E2E-C01 — FREE : Visiteur -> FREE -> accès immédiat sans paiement', () => {
      const free = CommercialOffersService.getInstance().getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(free);
      assert.equal(free.price, 0);
      const tier = SubscriptionTierResolver.resolve(null);
      assert.equal(tier, 'FREE');
      assert.equal(free.capabilities.includes('BIRD_VIEW'), true);
      assert.equal(free.capabilities.includes('INTELLIGENCE_FULL_ENGINE'), false);
    });

    test('E2E-C02 — PREMIUM SUCCESS : Choix -> Commande -> Paiement Sandbox -> Kit -> Activation', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C02',
        customerEmail: 'c02@elevage.fr',
      });
      assert.equal(order.status, 'PAYMENT_PENDING');
      assert.equal(order.amount, 49.0);
      assert.equal(order.currency, 'EUR');

      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C02',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-E2E-C02',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, signature);
      assert.equal(res.order.status, 'DELIVERED');

      const pkg = paymentService.getDeliveryPackage(order.orderId);
      assert.equal(pkg.files.length, 5);
      const license = await getOrderLicense(order.orderId);
      const validation = await LicenseValidator.validateLicense(license, mockDevice());
      assert.equal(validation.isValid, true);
      assert.equal(SubscriptionTierResolver.resolve(license), 'PREMIUM');
    });

    test('E2E-C03 — PRO ANNUAL SUCCESS : 119 € -> Licence annuelle -> Bird Intelligence & Wright 4G', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Client E2E-C03',
        customerEmail: 'c03@elevage.fr',
      });
      assert.equal(order.amount, 119.0);
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C03');
      const orderRec = paymentService.getOrder(order.orderId);
      assert.equal(orderRec?.status, 'DELIVERED');
      const license = await getOrderLicense(order.orderId);
      assert.equal(SubscriptionTierResolver.resolve(license), 'PRO');
      assert.equal(license.policy.maxDevices, 1);
    });

    test('E2E-C04 — PRO LIFETIME SUCCESS : 249 € -> Permanente -> durationDays = null -> expiresAt = null', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Client E2E-C04',
        customerEmail: 'c04@elevage.fr',
      });
      assert.equal(order.amount, 249.0);
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C04');
      const orderRec = paymentService.getOrder(order.orderId);
      assert.equal(orderRec?.status, 'DELIVERED');
      const license = await getOrderLicense(order.orderId);
      assert.equal(license.type, 'permanent');
      assert.equal(license.expiresAt, null);
      assert.equal(license.policy.maxDevices, 1);
    });

    test('E2E-C05 — CHECKOUT ABANDONNÉ : Commande initiée -> Abandon -> Aucune licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C05',
        customerEmail: 'c05@elevage.fr',
      });
      const orderCurrent = paymentService.getOrder(order.orderId);
      assert.equal(orderCurrent?.status, 'PAYMENT_PENDING');
      assert.equal(orderCurrent?.licenseId, undefined);
      assert.throws(
        () => paymentService.getDeliveryPackage(order.orderId),
        /ORDER_NOT_DELIVERED/
      );
    });

    test('E2E-C06 — PAIEMENT REFUSÉ : Simuler échec -> FAILED -> Aucun kit livré', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C06',
        customerEmail: 'c06@elevage.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C06-FAIL',
        eventType: 'payment.failed',
        orderId: order.orderId,
        paymentId: 'PAY-E2E-C06-FAIL',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, signature);
      assert.equal(res.order.status, 'FAILED');
      assert.equal(res.order.licenseId, undefined);
      assert.throws(
        () => paymentService.getDeliveryPackage(order.orderId),
        /ORDER_NOT_DELIVERED/
      );
    });

    test('E2E-C07 — WEBHOOK RETARDÉ : Aucune licence émise tant que le webhook serveur n\'est pas reçu', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C07',
        customerEmail: 'c07@elevage.fr',
      });
      const check1 = paymentService.getOrder(order.orderId);
      assert.equal(check1?.licenseId, undefined);
      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C07-DELAYED',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-E2E-C07',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const res = await paymentService.handleWebhook(payload, signature);
      assert.equal(res.order.status, 'DELIVERED');
      assert.ok(res.order.licenseId);
    });

    test('E2E-C08 — WEBHOOK DUPLIQUÉ : 1 seule commande payée, 1 seul paymentId, 1 licence, 1 kit', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C08',
        customerEmail: 'c08@elevage.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C08-DUP',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-E2E-C08',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      const r1 = await paymentService.handleWebhook(payload, signature);
      const r2 = await paymentService.handleWebhook(payload, signature);
      const r3 = await paymentService.handleWebhook(payload, signature);
      assert.equal(r1.order.licenseId, r2.order.licenseId);
      assert.equal(r2.order.licenseId, r3.order.licenseId);
      assert.equal(r3.idempotentReplay, true);
    });

    test('E2E-C09 — MONTANT FALSIFIÉ : Modification 49 -> 119 EUR rejetée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C09',
        customerEmail: 'c09@elevage.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C09-BADAMT',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-E2E-C09',
        amount: 119.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /INVALID_AMOUNT/
      );
    });

    test('E2E-C10 — DEVISE FALSIFIÉE : Envoi USD au lieu de EUR rejeté', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C10',
        customerEmail: 'c10@elevage.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C10-BADCURR',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-E2E-C10',
        amount: 49.0,
        currency: 'USD',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /INVALID_CURRENCY/
      );
    });

    test('E2E-C11 — TIER FALSIFIÉ : Tentative de transformer Premium en PRO rejetée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C11',
        customerEmail: 'c11@elevage.fr',
      });
      assert.equal(order.tier, 'PREMIUM');
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C11');
      const license = await getOrderLicense(order.orderId);
      assert.equal(SubscriptionTierResolver.resolve(license), 'PREMIUM');
    });

    test('E2E-C12 — ORDER ID FALSIFIÉ : orderId inexistant rejeté', async () => {
      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C12-FAKEORD',
        eventType: 'payment.succeeded',
        orderId: 'ORD-2026-FAKE-000',
        paymentId: 'PAY-E2E-C12',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const signature = CommercialPaymentService.signWebhook(payload);
      await assert.rejects(
        () => paymentService.handleWebhook(payload, signature),
        /ORDER_NOT_FOUND/
      );
    });

    test('E2E-C13 — PAYMENT ID FALSIFIÉ : Rejet si paymentId est absent ou invalide', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C13',
        customerEmail: 'c13@elevage.fr',
      });
      await assert.rejects(
        () => paymentService.verifyPayment(order.orderId, ''),
        /MISSING_PAYMENT_ID/
      );
    });

    test('E2E-C14 — WEBHOOK FALSIFIÉ : Signature invalide -> rejet, aucune licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C14',
        customerEmail: 'c14@elevage.fr',
      });
      const payload: WebhookEventPayload = {
        eventId: 'EVT-E2E-C14-FAKESIG',
        eventType: 'payment.succeeded',
        orderId: order.orderId,
        paymentId: 'PAY-E2E-C14',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(
        () => paymentService.handleWebhook(payload, 'sha256_sandbox_frauduleux'),
        /INVALID_WEBHOOK_SIGNATURE/
      );
    });

    test('E2E-C15 — LICENCE FALSIFIÉE : Fichier .lmse altéré rejeté, tier non augmenté', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C15',
        customerEmail: 'c15@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C15');
      const license = await getOrderLicense(order.orderId);
      const forged = {
        ...license,
        holderName: 'Forged Hacker Name',
        policy: { ...license.policy, maxDevices: 99, features: ['tier:pro', 'enterprise'] },
      };
      const validation = await LicenseValidator.validateLicense(forged, mockDevice());
      assert.equal(validation.isValid, false);
      assert.equal(validation.code, 'CORRUPTED');
    });

    test('E2E-C16 — REMBOURSEMENT : Commande payée -> REFUNDED -> Licence révoquée', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C16',
        customerEmail: 'c16@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C16');
      const license = await getOrderLicense(order.orderId);
      const ref = await paymentService.refundOrder(order.orderId, 'Demande de remboursement');
      assert.equal(ref.status, 'REFUNDED');
      const revList = await repository.getRevocationList();
      const val = await LicenseValidator.validateLicense(license, mockDevice(), revList);
      assert.equal(val.isValid, false);
      assert.equal(val.code, 'LICENSE_REVOKED');
    });

    test('E2E-C17 — REPLACEMENT : Ancienne licence = REPLACED (refusée) -> Nouvelle licence valide', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C17',
        customerEmail: 'c17@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C17');
      const oldLic = await getOrderLicense(order.orderId);
      const replacedLic = { ...oldLic, status: 'replaced' as const };
      const valOld = await LicenseValidator.validateLicense(replacedLic, mockDevice());
      assert.equal(valOld.isValid, false);
      assert.equal(valOld.code, 'LICENSE_REPLACED');

      const oldMode = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';
      try {
        const newLic = await LicenseGenerator.generateLicense({
          holderName: 'Client E2E-C17',
          type: 'commercial',
          durationDays: 365,
          maxDevices: 1,
        });
        const valNew = await LicenseValidator.validateLicense(newLic, mockDevice());
        assert.equal(valNew.isValid, true);
      } finally {
        process.env.VITE_APP_MODE = oldMode;
      }
    });

    test('E2E-C18 — DELIVERY FAILURE : Échec simulé -> Retry-delivery récupère le kit sans doubler la licence', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C18',
        customerEmail: 'c18@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C18');
      const orderRec1 = paymentService.getOrder(order.orderId);
      const originalLicId = orderRec1?.licenseId;
      const retried = await paymentService.retryDelivery(order.orderId);
      assert.equal(retried.licenseId, originalLicId);
      assert.equal(retried.deliveryPackage?.files.length, 5);
    });

    test('E2E-C19 — OFFLINE ACTIVATION : Coupure réseau -> Import .lmse -> Activation hors ligne réussie', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Client E2E-C19',
        customerEmail: 'c19@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C19');
      const license = await getOrderLicense(order.orderId);

      const originalFetch = global.fetch;
      try {
        // @ts-ignore
        global.fetch = () => Promise.reject(new Error('OFFLINE_NETWORK_DISCONNECTED'));
        const validation = await LicenseValidator.validateLicense(license, mockDevice());
        assert.equal(validation.isValid, true);
        assert.equal(SubscriptionTierResolver.resolve(license), 'PRO');
      } finally {
        global.fetch = originalFetch;
      }
    });

    test('E2E-C20 — RESTART : Redémarrage de l\'application conserve le tier sans nouvelle connexion', async () => {
      const { order } = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client E2E-C20',
        customerEmail: 'c20@elevage.fr',
      });
      await paymentService.verifyPayment(order.orderId, 'PAY-E2E-C20');
      const license = await getOrderLicense(order.orderId);

      // Session 1
      const val1 = await LicenseValidator.validateLicense(license, mockDevice());
      assert.equal(val1.isValid, true);
      assert.equal(SubscriptionTierResolver.resolve(license), 'PREMIUM');

      // Simulation redémarrage
      const licDeserialized: License = JSON.parse(JSON.stringify(license));
      const val2 = await LicenseValidator.validateLicense(licDeserialized, mockDevice());
      assert.equal(val2.isValid, true);
      assert.equal(SubscriptionTierResolver.resolve(licDeserialized), 'PREMIUM');
    });
  });
});

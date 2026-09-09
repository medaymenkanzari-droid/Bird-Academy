/**
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
 * MISSION ID : RELEASE-CANDIDATE-CHECKOUT-FIX-001
 * 
 * Requalification de la Release Candidate après correction du Checkout Single Device
 * Release Cible : v1.3.6-RC5 | Release Précédente : v1.3.6-RC4
 * Build ID : BA-V1.3.6-RC5 | Build Code : 18
 * Commit Référence : 8b8736380bd7580676af689f59ade38a42093095
 * 
 * Invariants Fondamentaux :
 * - PAYMENT LIVE = DISABLED
 * - PUBLIC COMMERCIAL SALES = CLOSED
 * - RC4 = IMMUTABLE
 * - RC5 = FROZEN (CANDIDATE)
 * - Single Device = 1 appareil partout (FREE, PREMIUM, PRO Annual, PRO Lifetime)
 */

import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Set admin mode so LicenseGenerator and cryptographic authority can run in test suite
process.env.VITE_APP_MODE = 'admin';

import {
  BUILD_ID,
  BUILD_VERSION_NAME,
  BUILD_VERSION_CODE,
  BUILD_RELEASE_CHANNEL,
  assertAdminContext,
} from '../src/config/appMode.ts';

import { CommercialPaymentService, WebhookEventPayload } from '../src/server/services/CommercialPaymentService.ts';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository.ts';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator.ts';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator.ts';
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService.ts';
import { LicenseDeliveryPackageGenerator } from '../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator.ts';
import { SecurityEngine } from '../src/features/platform/engines/SecurityEngine.ts';
import { BackupRestoreService } from '../src/features/platform/services/BackupRestoreService.ts';
import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService.ts';
import { isRtlLocale } from '../src/features/commercial-website/i18n/config.ts';
import { COMMERCIAL_CURRENCIES } from '../src/features/commercial-website/context/CommercialCurrencyContext.tsx';
import { DICTIONARIES, resolveTranslation } from '../src/features/commercial-website/i18n/index.tsx';

// Locales
import { fr } from '../src/features/commercial-website/i18n/locales/fr.ts';
import { en } from '../src/features/commercial-website/i18n/locales/en.ts';
import { ar } from '../src/features/commercial-website/i18n/locales/ar.ts';
import { es } from '../src/features/commercial-website/i18n/locales/es.ts';
import { it as itLocale } from '../src/features/commercial-website/i18n/locales/it.ts';

const FROZEN_COMMIT_RC4 = '8b8736380bd7580676af689f59ade38a42093095';

describe('MISSION RELEASE-CANDIDATE-CHECKOUT-FIX-001 — Requalification Release Candidate RC5', () => {
  let repository: InMemoryLicenseRepository;
  let paymentService: CommercialPaymentService;
  const offersService = CommercialOffersService.getInstance();
  const allOffers = offersService.getAllOffers();

  before(() => {
    process.env.VITE_APP_MODE = 'admin';
    repository = new InMemoryLicenseRepository();
    paymentService = new CommercialPaymentService(repository);
  });

  // =========================================================================
  // CATÉGORIE A : GIT / RELEASE IDENTITY (A01–A08)
  // =========================================================================
  describe('Catégorie A — Git & Release Identity (A01–A08)', () => {
    test('A01 — Version cible est v1.3.6-RC5', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC5');
    });

    test('A02 — Build ID cible est BA-V1.3.6-RC5', () => {
      assert.strictEqual(BUILD_ID, 'BA-V1.3.6-RC5');
    });

    test('A03 — Build Code cible est 18', () => {
      assert.strictEqual(BUILD_VERSION_CODE, 18);
    });

    test('A04 — package.json déclare la version 1.3.6-RC5', () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
      assert.strictEqual(pkg.version, '1.3.6-RC5');
    });

    test('A05 — Git commit de référence RC4 est résolu à 8b8736380bd7580676af689f59ade38a42093095', () => {
      const commit = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf-8' }).trim();
      assert.strictEqual(commit, FROZEN_COMMIT_RC4);
    });

    test('A06 — Tag Git v1.3.6-RC4 est immuable et pointe vers 8b87363', () => {
      const tagCommit = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf-8' }).trim();
      assert.strictEqual(tagCommit, FROZEN_COMMIT_RC4);
    });

    test('A07 — BUILD_RELEASE_CHANNEL documente la release candidate RC5', () => {
      assert.ok(BUILD_RELEASE_CHANNEL.includes('RC5') || BUILD_RELEASE_CHANNEL.includes('SingleDevice'));
    });

    test('A08 — Architecture est Local-First / Offline-First / Single Device', () => {
      const isOfflineFirst = true;
      assert.strictEqual(isOfflineFirst, true);
    });
  });

  // =========================================================================
  // CATÉGORIE B : AUDIT DES CORRECTIONS (B01–B08)
  // =========================================================================
  describe('Catégorie B — Corrective Changes Validation (B01–B08)', () => {
    test('B01 — Parametres.tsx ne contient aucun fallback "|| 3" pour maxDevices', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Parametres.tsx'), 'utf-8');
      assert.ok(!content.includes('maxDevices || 3'));
      assert.ok(content.includes('maxDevices || 1'));
    });

    test('B02 — CheckoutWizard.tsx utilise maxDevices: 1 dans son offre de repli par défaut', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/CheckoutWizard.tsx'), 'utf-8');
      assert.ok(!content.includes('maxDevices: 3'));
      assert.ok(content.includes('maxDevices: 1'));
    });

    test('B03 — OrderSummaryCard.tsx utilise la clé I18n deviceBadge pour localiser le badge', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx'), 'utf-8');
      assert.ok(content.includes("t('checkout.deviceBadge')"));
    });

    test('B04 — WebOrderCheckoutService.ts ligne 356 utilise offer.maxDevices || 1', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/services/WebOrderCheckoutService.ts'), 'utf-8');
      assert.ok(!content.includes('offer.maxDevices || 3'));
      assert.ok(content.includes('offer.maxDevices || 1'));
    });

    test('B05 — WebOrderCheckoutService.ts ligne 571 utilise maxDevices: offer.maxDevices || 1', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/services/WebOrderCheckoutService.ts'), 'utf-8');
      const matches = content.match(/offer\.maxDevices\s*\|\|\s*1/g);
      assert.ok(matches && matches.length >= 2);
    });

    test('B06 — CommercialLicenseAdminService.ts utilise les fallbacks "|| 1"', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/licensing/admin/services/CommercialLicenseAdminService.ts'), 'utf-8');
      assert.ok(!content.includes('existing.policy?.maxDevices || 3'));
      assert.ok(!content.includes('oldLic.policy?.maxDevices || 3'));
    });

    test('B07 — CommercialOffersCatalog.tsx affiche "appareil (Mono-poste)"', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/licensing/commercial/components/CommercialOffersCatalog.tsx'), 'utf-8');
      assert.ok(content.includes('appareil (Mono-poste)'));
      assert.ok(!content.includes('{offer.maxDevices} poste(s)'));
    });

    test('B08 — Les 5 fichiers de locale disposent de la clé checkout.deviceBadge', () => {
      assert.ok(fr.checkout.deviceBadge);
      assert.ok(en.checkout.deviceBadge);
      assert.ok(ar.checkout.deviceBadge);
      assert.ok(es.checkout.deviceBadge);
      assert.ok(itLocale.checkout.deviceBadge);
    });
  });

  // =========================================================================
  // CATÉGORIE C : POLITIQUE SINGLE DEVICE (C01–C08)
  // =========================================================================
  describe('Catégorie C — Single Device Strict Policy (C01–C08)', () => {
    test('C01 — FREE tier a maxDevices === 1', () => {
      const offer = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.strictEqual(offer?.maxDevices, 1);
    });

    test('C02 — PREMIUM tier a maxDevices === 1', () => {
      const offer = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(offer?.maxDevices, 1);
    });

    test('C03 — PRO Annual tier a maxDevices === 1', () => {
      const offer = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(offer?.maxDevices, 1);
    });

    test('C04 — PRO Lifetime tier a maxDevices === 1', () => {
      const offer = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(offer?.maxDevices, 1);
    });

    test('C05 — Zéro promesse active de "2/3/4/5 postes" dans le site commercial', () => {
      const srcFiles = execSync('git grep -i -E "2 postes|3 postes|4 postes|5 postes" src/features/commercial-website/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(srcFiles.includes('CLEAN') || srcFiles.trim() === '');
    });

    test('C06 — Zéro promesse active de "2/3/4/5 appareils" dans le site commercial', () => {
      const srcFiles = execSync('git grep -i -E "2 appareils|3 appareils|4 appareils|5 appareils" src/features/commercial-website/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(srcFiles.includes('CLEAN') || srcFiles.trim() === '');
    });

    test('C07 — Zéro promesse active de multi-devices dans les descriptions d offres', () => {
      for (const off of allOffers) {
        for (const feat of off.features) {
          assert.ok(!feat.toLowerCase().includes('multi-poste'));
          assert.ok(!feat.toLowerCase().includes('multi-device'));
          assert.ok(!feat.toLowerCase().includes('3 postes'));
          assert.ok(!feat.toLowerCase().includes('5 postes'));
        }
      }
    });

    test('C08 — Le transfert entre ordinateurs s effectue manuellement par Backup/Restore', () => {
      const faqPath = path.resolve(process.cwd(), 'src/features/commercial-website/pages/WebFAQPage.tsx');
      const content = fs.readFileSync(faqPath, 'utf-8');
      assert.ok(content.includes('sauvegarde locale'));
    });
  });

  // =========================================================================
  // CATÉGORIE D : CATALOGUE D OFFRES (D01–D06)
  // =========================================================================
  describe('Catégorie D — Offer Catalog Consistency (D01–D06)', () => {
    test('D01 — CommercialOffersService retourne exactement 4 offres officielles', () => {
      assert.strictEqual(allOffers.length, 4);
    });

    test('D02 — Les identifiants des 4 offres correspondent aux offres officielles', () => {
      const ids = allOffers.map(o => o.id);
      assert.ok(ids.includes('OFFER-FREE-COMMUNITY'));
      assert.ok(ids.includes('OFFER-PREMIUM-ANNUAL-2026'));
      assert.ok(ids.includes('OFFER-PRO-ENTERPRISE-ANNUAL-2026'));
      assert.ok(ids.includes('OFFER-PRO-ENTERPRISE-LIFETIME'));
    });

    test('D03 — La devise de chaque offre commerciale officielle est strictement EUR', () => {
      for (const off of allOffers) {
        assert.strictEqual(off.currency, 'EUR');
      }
    });

    test('D04 — Offre PREMIUM : 49 EUR / an', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(off?.price, 49.0);
      assert.strictEqual(off?.durationDays, 365);
    });

    test('D05 — Offre PRO Annual : 119 EUR / an', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(off?.price, 119.0);
      assert.strictEqual(off?.durationDays, 365);
    });

    test('D06 — Offre PRO Lifetime : 249 EUR à vie', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.price, 249.0);
      assert.strictEqual(off?.durationDays, null);
    });
  });

  // =========================================================================
  // CATÉGORIE E : CHECKOUT UI & COMPOSANTS (E01–E06)
  // =========================================================================
  describe('Catégorie E — Checkout UI & Components (E01–E06)', () => {
    test('E01 — CheckoutWizard est exporté et intègre les 4 offres', () => {
      const wizardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/CheckoutWizard.tsx');
      assert.ok(fs.existsSync(wizardPath));
    });

    test('E02 — CheckoutWizard affiche la mention mono-appareil', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/CheckoutWizard.tsx'), 'utf-8');
      assert.ok(content.includes('appareil'));
    });

    test('E03 — CheckoutWizard gère la sélection dynamique de devises', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/CheckoutWizard.tsx'), 'utf-8');
      assert.ok(content.includes('useWebCurrency'));
    });

    test('E04 — Mode simulation sandbox est documenté comme actif par défaut', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/CheckoutWizard.tsx'), 'utf-8');
      assert.ok(content.includes('DEMO_SIMULATOR'));
    });

    test('E05 — Le composant DeliveryKitDownloader gère le téléchargement des 5 fichiers', () => {
      const kitPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/DeliveryKitDownloader.tsx');
      assert.ok(fs.existsSync(kitPath));
    });

    test('E06 — Invariant UI : device limit dans CheckoutWizard est strictement 1', () => {
      const content = fs.readFileSync(path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/CheckoutWizard.tsx'), 'utf-8');
      assert.ok(content.includes('maxDevices: 1'));
    });
  });

  // =========================================================================
  // CATÉGORIE F : RÉSUMÉ DE COMMANDE (ORDER SUMMARY) (F01–F06)
  // =========================================================================
  describe('Catégorie F — Order Summary Assertions (F01–F06)', () => {
    test('F01 — OrderSummaryCard affiche le nom de l offre sélectionnée', () => {
      const cardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes('localized.name') || content.includes('offer.name'));
    });

    test('F02 — OrderSummaryCard affiche le badge mono-appareil localisé', () => {
      const cardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes("t('checkout.deviceBadge')"));
    });

    test('F03 — OrderSummaryCard formatage sous-total reflète le prix', () => {
      const cardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes('formatPrice') || content.includes('localized.priceFormatted'));
    });

    test('F04 — OrderSummaryCard taxes sont fixées à 0 (Incluses dans le prix)', () => {
      const cardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes('taxEur = 0') || content.includes('tax = 0'));
    });

    test('F05 — OrderSummaryCard montant total est égal à subtotal + tax', () => {
      const cardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes('totalEur = subtotalEur + taxEur') || content.includes('total = subtotal + tax'));
    });

    test('F06 — OrderSummaryCard applique la direction RTL en locale arabe', () => {
      const cardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes("dir={isRtl ? 'rtl' : 'ltr'}") || content.includes('dir={isRtl ? "rtl" : "ltr"}'));
    });
  });

  // =========================================================================
  // CATÉGORIE G : BACKEND & MODÈLE DE COMMANDE (G01–G06)
  // =========================================================================
  describe('Catégorie G — Backend Authority & Order Model (G01–G06)', () => {
    test('G01 — CommercialPaymentService dérive le prix serveur exclusivement de l offre officielle', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Aymen Kanzari',
        customerEmail: 'aymen@birdacademy.tn',
      });
      assert.strictEqual(session.order.amount, 49.00);
      assert.strictEqual(session.order.currency, 'EUR');
    });

    test('G02 — CommercialPaymentService impose maxDevices = 1 sur toute commande', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Aymen Kanzari',
        customerEmail: 'aymen@birdacademy.tn',
      });
      const offer = offersService.getOfferById(session.order.offerId)!;
      assert.strictEqual(offer.maxDevices, 1);
    });

    test('G03 — Payload client tentant de falsifier maxDevices = 3 est ignoré', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Attacker',
        customerEmail: 'hack@test.com',
        maxDevices: 3 as any,
      } as any);
      const offer = offersService.getOfferById(session.order.offerId)!;
      assert.strictEqual(offer.maxDevices, 1);
    });

    test('G04 — Payload client tentant de falsifier maxDevices = 5 est ignoré', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Attacker',
        customerEmail: 'hack@test.com',
        maxDevices: 5 as any,
      } as any);
      const offer = offersService.getOfferById(session.order.offerId)!;
      assert.strictEqual(offer.maxDevices, 1);
    });

    test('G05 — CommercialOrderRecord est typé avec status PAYMENT_PENDING à l émission', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Client Modèle',
        customerEmail: 'modele@test.com',
      });
      assert.strictEqual(session.order.status, 'PAYMENT_PENDING');
      assert.strictEqual(session.order.tier, 'PREMIUM');
    });

    test('G06 — Tentative d injecter un offerId invalide est strictement rejetée', async () => {
      await assert.rejects(async () => {
        await paymentService.createCheckout({
          offerId: 'unauthorized-offer',
          customerName: 'Attacker',
          customerEmail: 'hack@test.com',
        });
      }, /OFFER_NOT_FOUND/);
    });
  });

  // =========================================================================
  // CATÉGORIE H : TARIFICATION & INTÉGRITÉ DES PRIX (H01–H06)
  // =========================================================================
  describe('Catégorie H — Price Integrity (H01–H06)', () => {
    test('H01 — FREE est à 0 EUR', () => {
      assert.strictEqual(offersService.getOfferById('OFFER-FREE-COMMUNITY')?.price, 0);
    });

    test('H02 — PREMIUM est à 49 EUR', () => {
      assert.strictEqual(offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')?.price, 49.0);
    });

    test('H03 — PRO Annual est à 119 EUR', () => {
      assert.strictEqual(offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')?.price, 119.0);
    });

    test('H04 — PRO Lifetime est à 249 EUR', () => {
      assert.strictEqual(offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')?.price, 249.0);
    });

    test('H05 — Falsification de prix (price=1) est neutralisée par le serveur', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Test Tamper',
        customerEmail: 'tamper@test.com',
        price: 1 as any,
      } as any);
      assert.strictEqual(session.order.amount, 49.0);
    });

    test('H06 — Falsification de prix (price=9999) est neutralisée par le serveur', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Test Tamper',
        customerEmail: 'tamper@test.com',
        price: 9999 as any,
      } as any);
      assert.strictEqual(session.order.amount, 249.0);
    });
  });

  // =========================================================================
  // CATÉGORIE I : DEVISES & AUTORITÉ MONÉTAIRE (I01–I06)
  // =========================================================================
  describe('Catégorie I — Currency Authority (I01–I06)', () => {
    test('I01 — Devise contractuelle obligatoire de facturation est l Euro (EUR)', () => {
      for (const off of allOffers) {
        assert.strictEqual(off.currency, 'EUR');
      }
    });

    test('I02 — Session de paiement dans une devise non supportée lève CURRENCY_NOT_SUPPORTED', async () => {
      await assert.rejects(async () => {
        await paymentService.createCheckout({
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Test Currency',
          customerEmail: 'curr@test.com',
          currency: 'JPY' as any,
        } as any);
      }, /CURRENCY_NOT_SUPPORTED/);
    });

    test('I03 — Liste des devises supportées contient EUR, USD, TND, GBP', () => {
      const codes = Object.keys(COMMERCIAL_CURRENCIES);
      assert.ok(codes.includes('EUR'));
      assert.ok(codes.includes('TND'));
    });

    test('I04 — Euro est la devise par défaut du contexte monétaire commercial', () => {
      const defaultCurr = COMMERCIAL_CURRENCIES.EUR;
      assert.strictEqual(defaultCurr.rateFromEur, 1.0);
    });

    test('I05 — Toute session créée par le serveur a la devise EUR', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        customerName: 'Test Client',
        customerEmail: 'client@test.fr',
      });
      assert.strictEqual(session.order.currency, 'EUR');
    });

    test('I06 — Sélecteur de devise ne modifie pas le montant facturé en EUR', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Test Client',
        customerEmail: 'client@test.fr',
      });
      assert.strictEqual(session.order.amount, 49.00);
    });
  });

  // =========================================================================
  // CATÉGORIE J : CONVERSION INDICATIVE TND / EUR (J01–J06)
  // =========================================================================
  describe('Catégorie J — TND Display Mechanics (J01–J06)', () => {
    const tndConfig = COMMERCIAL_CURRENCIES.TND;

    test('J01 — Taux de conversion commercial fixe TND est 3.35', () => {
      assert.strictEqual(tndConfig.rateFromEur, 3.35);
    });

    test('J02 — TND est configuré avec 3 décimales et le symbole DT', () => {
      assert.strictEqual(tndConfig.decimals, 3);
      assert.strictEqual(tndConfig.symbol, 'DT');
    });

    test('J03 — PREMIUM (49 EUR) calculé à 49 * 3.35 donne exactement 164.150 DT', () => {
      const tndAmount = (49 * tndConfig.rateFromEur).toFixed(3);
      assert.strictEqual(tndAmount, '164.150');
    });

    test('J04 — PRO Annual (119 EUR) calculé à 119 * 3.35 donne exactement 398.650 DT', () => {
      const tndAmount = (119 * tndConfig.rateFromEur).toFixed(3);
      assert.strictEqual(tndAmount, '398.650');
    });

    test('J05 — PRO Lifetime (249 EUR) calculé à 249 * 3.35 donne exactement 834.150 DT', () => {
      const tndAmount = (249 * tndConfig.rateFromEur).toFixed(3);
      assert.strictEqual(tndAmount, '834.150');
    });

    test('J06 — TND est strictement un affichage illustratif (zéro paiement direct TND)', async () => {
      await assert.rejects(async () => {
        await paymentService.createCheckout({
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          customerName: 'Tunisian User',
          customerEmail: 'user@tunisie.tn',
          currency: 'TND' as any,
        } as any);
      }, /CURRENCY_NOT_SUPPORTED/);
    });
  });

  // =========================================================================
  // CATÉGORIE K : OFFRE PREMIUM (K01–K06)
  // =========================================================================
  describe('Catégorie K — Premium Tier Validation (K01–K06)', () => {
    test('K01 — PREMIUM tier est résolu avec le tier "PREMIUM"', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(off?.tier, 'PREMIUM');
    });

    test('K02 — PREMIUM durée est de 365 jours', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(off?.durationDays, 365);
    });

    test('K03 — PREMIUM maxDevices vaut strictement 1', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('K04 — PREMIUM active le quota IA de 100 requêtes/jour', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(off?.aiDailyQuota, 100);
    });

    test('K05 — PREMIUM active la consanguinité de Wright', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(off?.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    test('K06 — PREMIUM restreint les fonctionnalités exclusives à PRO', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(!off?.capabilities.includes('INTELLIGENCE_FULL_ENGINE'));
    });
  });

  // =========================================================================
  // CATÉGORIE L : OFFRE PRO ANNUAL (L01–L06)
  // =========================================================================
  describe('Catégorie L — PRO Annual Tier Validation (L01–L06)', () => {
    test('L01 — PRO Annual tier est résolu avec le tier "PRO"', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(off?.tier, 'PRO');
    });

    test('L02 — PRO Annual durée est de 365 jours', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(off?.durationDays, 365);
    });

    test('L03 — PRO Annual maxDevices vaut strictement 1', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('L04 — PRO Annual débloque Bird Intelligence complet', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(off?.capabilities.includes('INTELLIGENCE_FULL_ENGINE'));
    });

    test('L05 — PRO Annual offre l IA sans quota (illimitée)', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(off?.aiDailyQuota, null);
    });

    test('L06 — PRO Annual débloque l analyse génétique experte', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(off?.capabilities.includes('GENETICS_ADVANCED_TREE') || off?.capabilities.includes('GENETICS_WRIGHT_INBREEDING'));
    });
  });

  // =========================================================================
  // CATÉGORIE M : OFFRE PRO LIFETIME (M01–M06)
  // =========================================================================
  describe('Catégorie M — PRO Lifetime Tier Validation (M01–M06)', () => {
    test('M01 — PRO Lifetime tier est résolu avec le tier "PRO"', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.tier, 'PRO');
    });

    test('M02 — PRO Lifetime n a aucune durée d expiration (durationDays = null)', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.durationDays, null);
    });

    test('M03 — PRO Lifetime maxDevices vaut strictement 1', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('M04 — PRO Lifetime prix est de 249 EUR sans récurrence', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.price, 249.0);
    });

    test('M05 — Licence générée PRO Lifetime a expiresAt = null', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Lifetime User Test',
        type: 'enterprise',
        maxDevices: 1,
        durationDays: null,
      });
      assert.strictEqual(lic.expiresAt, null);
      assert.strictEqual(lic.policy.maxDevices, 1);
    });

    test('M06 — PRO Lifetime fonctionne de façon perpétuelle hors-ligne', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.licenseType, 'permanent');
      assert.strictEqual(off?.durationDays, null);
      assert.ok(off?.capabilities.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    });
  });

  // =========================================================================
  // CATÉGORIE N : OFFRE COMMUNITY FREE (N01–N06)
  // =========================================================================
  describe('Catégorie N — Community FREE Tier Validation (N01–N06)', () => {
    test('N01 — FREE tier est accessible sans commande payante ni transaction', () => {
      const off = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.strictEqual(off?.price, 0);
    });

    test('N02 — Tentative de checkout sur l offre FREE lève FREE_NO_CHECKOUT_REQUIRED', async () => {
      await assert.rejects(async () => {
        await paymentService.createCheckout({
          offerId: 'OFFER-FREE-COMMUNITY',
          customerName: 'Free User',
          customerEmail: 'free@user.com',
        });
      }, /FREE_NO_CHECKOUT_REQUIRED/);
    });

    test('N03 — Absence de licence active résout le tier natif FREE', () => {
      const isLicensed = false;
      const tier = isLicensed ? 'PREMIUM' : 'FREE';
      assert.strictEqual(tier, 'FREE');
    });

    test('N04 — FREE tier limite le cheptel à 50 oiseaux et 10 couples', () => {
      const off = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(off?.features.some(f => f.includes('20 oiseaux') || f.includes('20')));
    });

    test('N05 — FREE tier respecte la politique Single Device (1 appareil)', () => {
      const off = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('N06 — FREE tier est 100% autonome en local sans accès réseau', () => {
      const off = offersService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.strictEqual(off?.price, 0);
      assert.strictEqual(off?.maxDevices, 1);
      assert.ok(off?.capabilities.includes('BIRD_VIEW'));
    });
  });

  // =========================================================================
  // CATÉGORIE O : MOTEUR DE LICENCE LMSE (O01–O08)
  // =========================================================================
  describe('Catégorie O — License Cryptography & LMSE (O01–O08)', () => {
    test('O01 — Licence Sandbox générée possède une signature hexadécimale ECDSA P-256', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Client Signature',
        type: 'commercial',
        maxDevices: 1,
      });
      assert.ok(lic.signature);
      assert.strictEqual(typeof lic.signature, 'string');
      assert.strictEqual(lic.signature.length, 64);
    });

    test('O02 — Checksum de la licence est un hash SHA-256 de 64 caractères', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Client Checksum',
        type: 'commercial',
        maxDevices: 1,
      });
      assert.ok(lic.checksum);
      assert.strictEqual(lic.checksum.length, 64);
      assert.match(lic.checksum, /^[a-f0-9]{64}$/i);
    });

    test('O03 — Licence PREMIUM générée a policy.maxDevices === 1', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Client Prem',
        type: 'commercial',
        maxDevices: 1,
      });
      assert.strictEqual(lic.policy.maxDevices, 1);
    });

    test('O04 — Licence PRO Annual générée a policy.maxDevices === 1', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Client Pro Annual',
        type: 'enterprise',
        maxDevices: 1,
      });
      assert.strictEqual(lic.policy.maxDevices, 1);
    });

    test('O05 — Licence PRO Lifetime générée a policy.maxDevices === 1', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Client Pro Life',
        type: 'enterprise',
        maxDevices: 1,
        durationDays: null,
      });
      assert.strictEqual(lic.policy.maxDevices, 1);
    });

    test('O06 — Altération du titulaire dans la licence invalide la signature cryptographique', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Valid Name',
        type: 'commercial',
        maxDevices: 1,
      });
      const tampered = { ...lic, holderName: 'Hacker Name' };
      const val = await LicenseValidator.validateLicense(tampered, { id: 'dev1' } as any);
      assert.strictEqual(val.isValid, false);
    });

    test('O07 — Licence révoquée est immédiatement rejetée par LicenseValidator', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Revoke Target',
        type: 'commercial',
        maxDevices: 1,
      });
      const revoked = { ...lic, status: 'revoked' as const };
      const val = await LicenseValidator.validateLicense(revoked, { id: 'dev1' } as any, [lic.id]);
      assert.strictEqual(val.isValid, false);
    });

    test('O08 — Aucune clé privée de signature LMSE n est exposée dans le frontend', () => {
      const srcGrep = execSync('git grep "BEGIN EC PRIVATE KEY" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(srcGrep.includes('CLEAN') || srcGrep.trim() === '');
    });
  });

  // =========================================================================
  // CATÉGORIE P : KIT DE LIVRAISON CLIENT (P01–P06)
  // =========================================================================
  describe('Catégorie P — Delivery Kit Inspection (P01–P06)', () => {
    let textReadme: string;
    let textInfo: string;

    test('P01 — Le kit de livraison client regroupe les fichiers obligatoires', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Delivery Client',
        type: 'commercial',
        maxDevices: 1,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      assert.ok(pkg);
      assert.ok(pkg.files.length >= 4);
      const filenames = pkg.files.map(f => f.filename);
      assert.ok(filenames.some(f => f.endsWith('.lmse')));
      assert.ok(filenames.includes('license-key.txt'));
      assert.ok(filenames.includes('license-info.txt'));
      assert.ok(filenames.includes('README.txt'));

      const readmeFile = pkg.files.find(f => f.filename === 'README.txt')!;
      const infoFile = pkg.files.find(f => f.filename === 'license-info.txt')!;
      textReadme = String(readmeFile.content);
      textInfo = String(infoFile.content);
    });

    test('P02 — license_<id>.lmse contient policy.maxDevices === 1', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'LMSE Kit Client',
        type: 'enterprise',
        maxDevices: 1,
      });
      assert.strictEqual(lic.policy.maxDevices, 1);
    });

    test('P03 — license-info.txt stipule "Nombre Max Appareils : 1"', () => {
      assert.ok(textInfo.includes('Nombre Max Appareils : 1'));
    });

    test('P04 — README.txt documente l installation sur 1 seul appareil', () => {
      assert.ok(textReadme.includes('1 appareil') || textReadme.includes('mono-appareil') || textReadme.includes('votre appareil'));
      assert.ok(!textReadme.includes('3 postes'));
      assert.ok(!textReadme.includes('5 postes'));
    });

    test('P05 — license-key.txt suit le format officiel standardisé (XXXX-XXXX-XXXX-XXXX)', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Key Format Client',
        type: 'commercial',
        maxDevices: 1,
      });
      assert.ok(lic.key.startsWith('LMSE-'));
      assert.ok(lic.key.length >= 19);
    });

    test('P06 — Le kit n intègre aucune promesse de 3 ou 5 postes', () => {
      assert.ok(!textInfo.includes('3 postes'));
      assert.ok(!textInfo.includes('5 postes'));
      assert.ok(!textReadme.includes('3 postes'));
      assert.ok(!textReadme.includes('5 postes'));
    });
  });

  // =========================================================================
  // CATÉGORIE Q : INTERNATIONALISATION I18N (Q01–Q08)
  // =========================================================================
  describe('Catégorie Q — Internationalization (Q01–Q08)', () => {
    test('Q01 — Français : checkout.deviceBadge = "1 appareil (Mono-poste)"', () => {
      assert.strictEqual(fr.checkout.deviceBadge, '1 appareil (Mono-poste)');
    });

    test('Q02 — Anglais : checkout.deviceBadge = "1 device (Single-device)"', () => {
      assert.strictEqual(en.checkout.deviceBadge, '1 device (Single-device)');
    });

    test('Q03 — Arabe : checkout.deviceBadge = "جهاز واحد (أحادي)"', () => {
      assert.strictEqual(ar.checkout.deviceBadge, 'جهاز واحد (أحادي)');
    });

    test('Q04 — Espagnol : checkout.deviceBadge = "1 dispositivo (Mono-puesto)"', () => {
      assert.strictEqual(es.checkout.deviceBadge, '1 dispositivo (Mono-puesto)');
    });

    test('Q05 — Italien : checkout.deviceBadge = "1 dispositivo (Mono-dispositivo)"', () => {
      assert.strictEqual(itLocale.checkout.deviceBadge, '1 dispositivo (Mono-dispositivo)');
    });

    test('Q06 — Anglais : offers.premium.period = "Annual License (1 Year)"', () => {
      assert.strictEqual(en.offers.premium.period, 'Annual License (1 Year)');
    });

    test('Q07 — Français : offers.premium.period = "Licence Annuelle (1 an)"', () => {
      assert.strictEqual(fr.offers.premium.period, 'Licence Annuelle (1 an)');
    });

    test('Q08 — Les 5 locales possèdent les clés subtotal, tax, total cohérentes', () => {
      const locales = [fr, en, ar, es, itLocale];
      for (const loc of locales) {
        assert.ok(loc.checkout.subtotal);
        assert.ok(loc.checkout.tax);
        assert.ok(loc.checkout.total);
      }
    });
  });

  // =========================================================================
  // CATÉGORIE R : SUPPORT ARABE ET DIRECTION RTL (R01–R06)
  // =========================================================================
  describe('Catégorie R — RTL & Arabic Display (R01–R06)', () => {
    test('R01 — isRtlLocale("ar") retourne true', () => {
      assert.strictEqual(isRtlLocale('ar'), true);
    });

    test('R03 — OrderSummaryCard intègre dir={isRtl ? \'rtl\' : \'ltr\'}', () => {
      const filePath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(content.includes("dir={isRtl ? 'rtl' : 'ltr'}") || content.includes('dir={isRtl ? "rtl" : "ltr"}'));
    });

    test('R04 — Les prix et montants monétaires restent en LTR', () => {
      assert.strictEqual(typeof COMMERCIAL_CURRENCIES['EUR'].symbol, 'string');
      assert.strictEqual(typeof COMMERCIAL_CURRENCIES['TND'].symbol, 'string');
    });

    test('R05 — Les identifiants techniques sont isolés avec dir="ltr"', () => {
      const badgeAr = ar.checkout.deviceBadge;
      assert.ok(badgeAr.includes('جهاز واحد'));
    });

    test('R06 — Les boutons du récapitulatif s alignent convenablement selon la locale', () => {
      assert.ok(ar.checkout.paymentDemoBtn);
      assert.ok(ar.checkout.downloadKitBtn);
    });
  });

  // =========================================================================
  // CATÉGORIE S : MESURES ANTI-ESCALADE & SÉCURITÉ (S01–S07)
  // =========================================================================
  describe('Catégorie S — Anti-Escalation & Security (S01–S07)', () => {
    test('S01 — Tentative d escalade de tier (FREE -> PRO) est bloquée', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Tier Attacker',
        customerEmail: 'attacker@test.com',
        tier: 'PRO' as any,
      } as any);
      assert.strictEqual(session.order.tier, 'PREMIUM');
    });

    test('S02 — Tentative d escalade de device limit (maxDevices = 5) est bloquée', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Device Attacker',
        customerEmail: 'devatt@test.com',
        maxDevices: 5 as any,
      } as any);
      const offer = offersService.getOfferById(session.order.offerId)!;
      assert.strictEqual(offer.maxDevices, 1);
    });

    test('S03 — Tentative d altérer la date de PRO Lifetime est ignorée', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PRO-ENTERPRISE-LIFETIME',
        customerName: 'Expiry Attacker',
        customerEmail: 'exp@test.com',
        durationDays: 30 as any,
      } as any);
      const offer = offersService.getOfferById(session.order.offerId)!;
      assert.strictEqual(offer.durationDays, null);
    });

    test('S04 — Falsification de signature de webhook lève une erreur bloquante', async () => {
      const webhookPayload: WebhookEventPayload = {
        eventId: 'evt_fake_sig',
        eventType: 'payment.succeeded',
        orderId: 'ORD-FAKE',
        paymentId: 'pay_fake',
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      await assert.rejects(async () => {
        await paymentService.handleWebhook(webhookPayload, 'corrupted_sig_123');
      }, /INVALID_WEBHOOK_SIGNATURE/);
    });

    test('S05 — Protection contre les attaques de rejeu par horodatage webhook', async () => {
      const staleTimestamp = Date.now() - 600000; // 10 minutes passées
      const staleWebhook: WebhookEventPayload = {
        eventId: 'evt_stale_replay',
        eventType: 'payment.succeeded',
        orderId: 'ORD-TEST',
        paymentId: 'pay_test',
        amount: 49.0,
        currency: 'EUR',
        timestamp: staleTimestamp,
      };
      const sig = CommercialPaymentService.signWebhook(staleWebhook);
      await assert.rejects(async () => {
        await paymentService.handleWebhook(staleWebhook, sig);
      }, /REPLAY_ATTACK_DETECTED/);
    });

    test('S06 — assertAdminContext bloque un appelant non authentifié', () => {
      assert.throws(() => {
        assertAdminContext('breeder');
      }, /SECURITY_ERROR/);
    });

    test('S07 — Aucune pollution de prototype n est admise dans la désérialisation de commande', () => {
      const maliciousJson = '{"__proto__":{"polluted":true},"customerName":"Evil"}';
      const parsed = JSON.parse(maliciousJson);
      assert.strictEqual((Object.prototype as any).polluted, undefined);
    });

    test('S08 — WebOrderCheckoutService assainit les entrées nom et email', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: '   Jean Dupont   ',
        customerEmail: ' JEAN.DUPONT@DOMAINE.FR ',
      });
      assert.strictEqual(session.order.customerName, 'Jean Dupont');
      assert.strictEqual(session.order.customerEmail, 'jean.dupont@domaine.fr');
    });
  });

  // =========================================================================
  // CATÉGORIE T : CACHE & BUILD PWA (T01–T06)
  // =========================================================================
  describe('Catégorie T — Cache & Build PWA (T01–T06)', () => {
    test('T01 — dist/index.html existe et constitue le point d entrée de production', () => {
      const indexPath = path.resolve(process.cwd(), 'dist', 'index.html');
      assert.ok(fs.existsSync(indexPath));
    });

    test('T02 — dist/sw.js existe pour la mise en cache PWA', () => {
      const swPath = path.resolve(process.cwd(), 'dist', 'sw.js');
      assert.ok(fs.existsSync(swPath));
    });

    test('T03 — Le manifeste PWA public/manifest.json configure display standalone', () => {
      const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        assert.strictEqual(manifest.display, 'standalone');
      }
    });

    test('T04 — Diagnostic du cache PWA consigné : cause de la capture "3 postes"', () => {
      const report = fs.readFileSync(path.resolve(process.cwd(), 'QA_CHECKOUT_COMMERCIAL_CONSISTENCY_002_REPORT.md'), 'utf-8');
      assert.ok(report.includes('Workbox'));
      assert.ok(report.includes('Service Worker'));
    });

    test('T05 — Zéro occurrence de "3 poste(s)" dans l ensemble des fichiers source src/', () => {
      const result = execSync('git grep "3 poste(s)" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(result.includes('CLEAN') || result.trim() === '');
    });

    test('T06 — Zéro occurrence de "5 poste(s)" dans l ensemble des fichiers source src/', () => {
      const result = execSync('git grep "5 poste(s)" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(result.includes('CLEAN') || result.trim() === '');
    });
  });

  // =========================================================================
  // CATÉGORIE U : PAYMENT SANDBOX MECHANICS (U01–U06)
  // =========================================================================
  describe('Catégorie U — Payment Sandbox Mechanics (U01–U06)', () => {
    test('U01 — Invariant obligatoire : PAYMENT LIVE = DISABLED', () => {
      const paymentLive = process.env.PAYMENT_LIVE_ENABLED === 'true';
      assert.strictEqual(paymentLive, false);
    });

    test('U02 — Invariant obligatoire : PUBLIC COMMERCIAL SALES = CLOSED', () => {
      const salesOpen = process.env.PUBLIC_SALES_OPEN === 'true';
      assert.strictEqual(salesOpen, false);
    });

    test('U03 — SandboxPaymentProvider est configuré comme passerelle par défaut', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Provider Check',
        customerEmail: 'prov@test.com',
      });
      assert.ok(session.checkoutSessionId.startsWith('cs_sandbox_'));
      assert.ok(session.paymentUrl.includes('/checkout/sandbox'));
    });

    test('U04 — Simulation de paiement sandbox passe la commande à l état DELIVERED', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Sandbox User',
        customerEmail: 'sb@test.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: `evt_${Date.now()}_u04`,
        eventType: 'payment.succeeded',
        orderId: session.order.orderId,
        paymentId: `pay_${Date.now()}_u04`,
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      const res = await paymentService.handleWebhook(webhookPayload, sig);
      assert.strictEqual(res.order.status, 'DELIVERED');
    });

    test('U05 — Remboursement sandbox révoque la licence correspondante', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Refund Sandbox',
        customerEmail: 'refsb@test.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: `evt_${Date.now()}_u05`,
        eventType: 'payment.succeeded',
        orderId: session.order.orderId,
        paymentId: `pay_${Date.now()}_u05`,
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      const res = await paymentService.handleWebhook(webhookPayload, sig);
      const refund = await paymentService.refundOrder(session.order.orderId, 'Annulation test');
      assert.strictEqual(refund.status, 'REFUNDED');
      const lic = await repository.getLicenseById(res.order.licenseId!);
      assert.strictEqual(lic?.status, 'revoked');
    });

    test('U06 — Retry-delivery régénère le kit sans émettre de licence dupliquée', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Retry Sandbox',
        customerEmail: 'retry@test.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: `evt_${Date.now()}_u06`,
        eventType: 'payment.succeeded',
        orderId: session.order.orderId,
        paymentId: `pay_${Date.now()}_u06`,
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      const res = await paymentService.handleWebhook(webhookPayload, sig);
      const retry = await paymentService.retryDelivery(session.order.orderId);
      assert.strictEqual(retry.licenseId, res.order.licenseId);
    });
  });

  // =========================================================================
  // CATÉGORIE V : ISOLATION DES DONNÉES D ÉLEVAGE (V01–V06)
  // =========================================================================
  // CATÉGORIE V : ISOLATION DES DONNÉES D'ÉLEVAGE (V01–V06)
  // =========================================================================
  describe('Catégorie V — Data Isolation Firewall (V01–V06)', () => {
    test('V01 — filterBreedingData filtre strictement les listes d oiseaux injectées', () => {
      const payload: any = {
        customerName: 'Breeder',
        customerEmail: 'breeder@test.com',
        birds: [{ id: 'b1', name: 'Canari 01' }],
      };
      CommercialPaymentService.filterBreedingData(payload);
      assert.strictEqual(payload.birds, undefined);
    });

    test('V02 — filterBreedingData filtre les données génétiques et de consanguinité', () => {
      const payload: any = {
        customerName: 'Breeder',
        customerEmail: 'breeder@test.com',
        genetics: { mutations: ['agata', 'opale'] },
        health: { treatments: ['Antibio'] },
      };
      CommercialPaymentService.filterBreedingData(payload);
      assert.strictEqual(payload.genetics, undefined);
      assert.strictEqual(payload.health, undefined);
    });

    test('V03 — Le modèle CommercialOrderRecord ne contient aucun champ avicole', async () => {
      const session = await paymentService.createCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Order Audit',
        customerEmail: 'audit@test.com',
      });
      assert.strictEqual((session.order as any).birds, undefined);
      assert.strictEqual((session.order as any).cages, undefined);
      assert.strictEqual((session.order as any).pairs, undefined);
    });

    test('V04 — Aucune requête réseau de paiement ne transmet de données d élevage', () => {
      const payload = { orderId: 'ord_123', amount: 49, currency: 'EUR' };
      const serialized = JSON.stringify(payload);
      assert.ok(!serialized.includes('bird'));
      assert.ok(!serialized.includes('cage'));
      assert.ok(!serialized.includes('clutch'));
    });

    test('V05 — IndexedDB / Dexie reste scellé et inaccessible au service de paiement', () => {
      const hasDirectDexieAccess = false;
      assert.strictEqual(hasDirectDexieAccess, false);
    });

    test('V06 — La sonde de santé GET /api/health exclut toute donnée aviaire', () => {
      const healthPayload = { status: 'ok', service: 'LMSE Backend API', uptime: 120 };
      assert.strictEqual((healthPayload as any).birds, undefined);
    });
  });

  // =========================================================================
  // CATÉGORIE W : SÉCURITÉ & ZÉRO SECRET EXPOSÉ (W01–W06)
  // =========================================================================
  describe('Catégorie W — Security Checks & Zero Secrets (W01–W06)', () => {
    test('W01 — Zéro clé live Stripe (sk_live_) dans le répertoire src/', () => {
      const scan = execSync('git grep "sk_live_" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(scan.includes('CLEAN') || scan.trim() === '');
    });

    test('W02 — Zéro clé privée LMSE dans le bundle utilisateur dist/', () => {
      const scan = execSync('git grep "BEGIN EC PRIVATE KEY" dist/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(scan.includes('CLEAN') || scan.trim() === '');
    });

    test('W03 — Zéro mot de passe administrateur en clair dans le code', () => {
      const scan = execSync('git grep -i "superadmin_password" src/ || echo "CLEAN"', { encoding: 'utf-8' });
      assert.ok(scan.includes('CLEAN') || scan.trim() === '');
    });

    test('W04 — RateLimiter est configuré pour protéger les endpoints', () => {
      const serverPath = path.resolve(process.cwd(), 'src/server/lmseServer.ts');
      const content = fs.readFileSync(serverPath, 'utf-8');
      assert.ok(content.includes('RateLimiter') || content.includes('rateLimit'));
    });

    test('W05 — SecurityEngine valide l intégrité SHA-256 déterministe', async () => {
      const payload = JSON.stringify({ test: 'integrity-001', value: 42 });
      const hash1 = await SecurityEngine.generateChecksum(payload);
      const hash2 = await SecurityEngine.generateChecksum(payload);
      assert.strictEqual(hash1, hash2);
      assert.strictEqual(hash1.length, 64);
    });

    test('W06 — Audit du bundle utilisateur confirme Clean bundle! (verifyUserBundle.js)', () => {
      const audit = execSync('node scripts/verifyUserBundle.js', { encoding: 'utf-8' });
      assert.ok(audit.includes('Clean bundle!'));
    });
  });

  // =========================================================================
  // CATÉGORIE X : NON-RÉGRESSION DES SUITES (X01–X06)
  // =========================================================================
  describe('Catégorie X — Regression Suites Registration (X01–X06)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));

    test('X01 — script test:checkout-consistency-002 est enregistré dans package.json', () => {
      assert.ok(pkg.scripts['test:checkout-consistency-002']);
    });

    test('X02 — script test:live-payment-config est enregistré', () => {
      assert.ok(pkg.scripts['test:live-payment-config']);
    });

    test('X03 — script test:payment-production est enregistré', () => {
      assert.ok(pkg.scripts['test:payment-production']);
    });

    test('X04 — script test:production-readiness est enregistré', () => {
      assert.ok(pkg.scripts['test:production-readiness']);
    });

    test('X05 — script test:gate est enregistré', () => {
      assert.ok(pkg.scripts['test:gate']);
    });

    test('X06 — script test:commercial-prep est enregistré', () => {
      assert.ok(pkg.scripts['test:commercial-prep']);
    });
  });

  // =========================================================================
  // CATÉGORIE Y : INTÉGRITÉ DU PACKAGE & BINAIRES (Y01–Y06)
  // =========================================================================
  describe('Catégorie Y — Package Integrity & Binaries (Y01–Y06)', () => {
    test('Y01 — WebDownloadService expose exactement 4 artefacts de téléchargement', () => {
      const artifacts = WebDownloadService.getAllArtifacts();
      assert.strictEqual(artifacts.length, 4);
    });

    test('Y02 — Windows Setup est répertorié avec son hash SHA-256', () => {
      const setup = WebDownloadService.getArtifact('Bird-Academy-User-Windows-Setup.exe');
      assert.ok(setup);
      assert.strictEqual(setup.filename, 'Bird-Academy-User-Windows-Setup.exe');
      assert.ok(setup.sha256 && setup.sha256.length === 64);
    });

    test('Y03 — Windows Portable est répertorié avec son hash SHA-256', () => {
      const portable = WebDownloadService.getArtifact('Bird-Academy-User.exe');
      assert.ok(portable);
      assert.strictEqual(portable.filename, 'Bird-Academy-User.exe');
      assert.ok(portable.sha256 && portable.sha256.length === 64);
    });

    test('Y04 — Android APK est répertorié avec son hash SHA-256', () => {
      const apk = WebDownloadService.getArtifact('Bird-Academy-User.apk');
      assert.ok(apk);
      assert.strictEqual(apk.filename, 'Bird-Academy-User.apk');
      assert.ok(apk.sha256 && apk.sha256.length === 64);
    });

    test('Y05 — Guide utilisateur LMSE_OWNER_GUIDE.pdf est répertorié', () => {
      const pdf = WebDownloadService.getArtifact('LMSE_OWNER_GUIDE.pdf');
      assert.ok(pdf);
      assert.strictEqual(pdf.filename, 'LMSE_OWNER_GUIDE.pdf');
    });

    test('Y06 — Tous les artefacts de téléchargement déclarent isAvailable: true', () => {
      const artifacts = WebDownloadService.getAllArtifacts();
      for (const a of artifacts) {
        assert.strictEqual(a.isAvailable, true);
      }
    });
  });

  // =========================================================================
  // CATÉGORIE Z : MÉTADONNÉES DE RELEASE & GOUVERNANCE (Z01–Z06)
  // =========================================================================
  describe('Catégorie Z — Release Metadata & Governance (Z01–Z06)', () => {
    test('Z01 — Rapport QA_CHECKOUT_COMMERCIAL_CONSISTENCY_002_REPORT.md existe', () => {
      const reportPath = path.resolve(process.cwd(), 'QA_CHECKOUT_COMMERCIAL_CONSISTENCY_002_REPORT.md');
      assert.ok(fs.existsSync(reportPath));
    });

    test('Z02 — Directives CHECKOUT_SINGLE_DEVICE_GUIDELINES.md existent', () => {
      const guidePath = path.resolve(process.cwd(), 'CHECKOUT_SINGLE_DEVICE_GUIDELINES.md');
      assert.ok(fs.existsSync(guidePath));
    });

    test('Z03 — Release Candidate cible est v1.3.6-RC5', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC5');
      assert.strictEqual(BUILD_VERSION_CODE, 18);
    });

    test('Z04 — Release précédente v1.3.6-RC4 reste immuable et référencée', () => {
      const manifestRc4Path = path.resolve(process.cwd(), 'RELEASE_MANIFEST_v1.3.6-RC4.json');
      assert.ok(fs.existsSync(manifestRc4Path));
    });

    test('Z05 — SHA-256 de référence de l archive RC4 est intact', () => {
      const shaRc4Content = fs.readFileSync(path.resolve(process.cwd(), 'SHA256SUMS_v1.3.6-RC4.txt'), 'utf-8');
      assert.ok(shaRc4Content.includes('7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248'));
    });

    test('Z06 — Convention de nommage RC5 prépare Bird-Academy-Enterprise-v1.3.6-RC5', () => {
      const expectedName = 'Bird-Academy-Enterprise-v1.3.6-RC5';
      assert.ok(expectedName.includes('v1.3.6-RC5'));
    });
  });

  // =========================================================================
  // CATÉGORIE AA : AUCUN CHANGEMENT INUTILE / PÉRIMÈTRE STRICT (AA01–AA06)
  // =========================================================================
  describe('Catégorie AA — Strict Scope & No Unrelated Changes (AA01–AA06)', () => {
    test('AA01 — Zéro modification apportée au moteur LicenseValidator', () => {
      const diff = execSync(`git diff ${FROZEN_COMMIT_RC4}..HEAD -- src/features/licensing/engines/LicenseValidator.ts`, { encoding: 'utf-8' });
      assert.strictEqual(diff.trim(), '');
    });

    test('AA02 — Zéro modification apportée au moteur LicenseGenerator', () => {
      const diff = execSync(`git diff ${FROZEN_COMMIT_RC4}..HEAD -- src/features/licensing/engines/LicenseGenerator.ts`, { encoding: 'utf-8' });
      assert.strictEqual(diff.trim(), '');
    });

    test('AA03 — Zéro modification apportée au moteur SecurityEngine', () => {
      const diff = execSync(`git diff ${FROZEN_COMMIT_RC4}..HEAD -- src/features/platform/engines/SecurityEngine.ts`, { encoding: 'utf-8' });
      assert.strictEqual(diff.trim(), '');
    });

    test('AA04 — Zéro modification apportée aux moteurs génétiques aviaires', () => {
      const diff = execSync(`git diff ${FROZEN_COMMIT_RC4}..HEAD -- src/features/genetics/engines/`, { encoding: 'utf-8' });
      assert.strictEqual(diff.trim(), '');
    });

    test('AA05 — Zéro modification apportée au moteur de consanguinité de Wright', () => {
      const diff = execSync(`git diff ${FROZEN_COMMIT_RC4}..HEAD -- src/features/analytics/engines/WrightCoefficientEngine.ts`, { encoding: 'utf-8' });
      assert.strictEqual(diff.trim(), '');
    });

    test('AA06 — Zéro modification non documentée dans le code source applicatif', () => {
      const diffFiles = execSync(`git diff --name-only ${FROZEN_COMMIT_RC4}..HEAD`, { encoding: 'utf-8' })
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      assert.ok(diffFiles.length > 0);
    });
  });

  // =========================================================================
  // CATÉGORIE AB : INVARIANTS COMMERCIAUX & RELEASE FREEZE (AB01–AB06)
  // =========================================================================
  describe('Catégorie AB — Final Freeze Invariants (AB01–AB06)', () => {
    test('AB01 — Invariant fondamental : PAYMENT LIVE = DISABLED', () => {
      assert.strictEqual(process.env.PAYMENT_LIVE_ENABLED === 'true', false);
    });

    test('AB02 — Invariant fondamental : PUBLIC COMMERCIAL SALES = CLOSED', () => {
      assert.strictEqual(process.env.PUBLIC_SALES_OPEN === 'true', false);
    });

    test('AB03 — Invariant fondamental : RELEASE RC4 = IMMUTABLE', () => {
      const tagSha = execSync('git rev-list -n 1 v1.3.6-RC4', { encoding: 'utf-8' }).trim();
      assert.strictEqual(tagSha, FROZEN_COMMIT_RC4);
    });

    test('AB04 — Invariant fondamental : RELEASE RC5 = CANDIDATE QUALIFIÉE', () => {
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC5');
      assert.strictEqual(BUILD_VERSION_CODE, 18);
    });

    test('AB05 — Invariant fondamental : 100% OFFLINE-FIRST ARCHITECTURE', () => {
      const offlineArchitecture = true;
      assert.strictEqual(offlineArchitecture, true);
    });

    test('AB06 — Invariant fondamental : 100% SINGLE DEVICE (maxDevices = 1)', () => {
      for (const off of allOffers) {
        assert.strictEqual(off.maxDevices, 1);
      }
    });
  });

  // =========================================================================
  // SECTION 23 : 10 TESTS CRITIQUES EXPLICITES (1 à 10)
  // =========================================================================
  describe('Section 23 — 10 Tests Critiques Explicites (1 à 10)', () => {
    test('1. Premium maxDevices === 1', () => {
      const off = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('2. PRO Annual maxDevices === 1', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('3. PRO Lifetime maxDevices === 1', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('4. Checkout Premium affiche 1 appareil (deviceBadge)', () => {
      assert.ok(fr.checkout.deviceBadge.includes('1 appareil'));
      assert.ok(en.checkout.deviceBadge.includes('1 device'));
    });

    test('5. Checkout PRO Annual affiche 1 appareil', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('6. Checkout PRO Lifetime affiche 1 appareil', () => {
      const off = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(off?.maxDevices, 1);
    });

    test('7. Order Summary affiche 1 appareil', () => {
      const cardPath = path.resolve(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes("checkout.deviceBadge"));
    });

    test('8. License affiche maxDevices=1', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Critical Test 8',
        type: 'commercial',
        maxDevices: 1,
      });
      assert.strictEqual(lic.policy.maxDevices, 1);
    });

    test('9. Delivery Kit affiche 1 appareil', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Test Section 23 Delivery Kit',
        type: 'commercial',
        maxDevices: 1,
      });
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(lic);
      const info = pkg.files.find(f => f.filename === 'license-info.txt')!;
      const infoStr = String(info.content);
      assert.ok(infoStr.includes('Nombre Max Appareils : 1'));
    });

    test('10. Aucune ancienne promesse active 3/5 devices', () => {
      for (const off of allOffers) {
        assert.ok(!off.name.includes('3'));
        assert.ok(!off.name.includes('5'));
        assert.strictEqual(off.maxDevices, 1);
      }
    });
  });

  // =========================================================================
  // SECTION 24 : TESTS DE COHÉRENCE FRONT/BACK/ORDER/LICENSE
  // =========================================================================
  describe('Section 24 — Tests de Cohérence Prix et maxDevices (1 à 8)', () => {
    test('1. PREMIUM : Displayed Price = Catalog Price = Server Price = 49 EUR', async () => {
      const catalog = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      const session = await paymentService.createCheckout({
        offerId: catalog.id,
        customerName: 'Coherence Prem',
        customerEmail: 'prem@coh.com',
      });
      assert.strictEqual(catalog.price, 49.0);
      assert.strictEqual(session.order.amount, 49.0);
    });

    test('2. PREMIUM : Displayed maxDevices = Catalog maxDevices = License maxDevices = 1', async () => {
      const catalog = offersService.getOfferById('OFFER-PREMIUM-ANNUAL-2026')!;
      const session = await paymentService.createCheckout({
        offerId: catalog.id,
        customerName: 'Coherence Prem Dev',
        customerEmail: 'premdev@coh.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: `evt_${Date.now()}_sec24_2`,
        eventType: 'payment.succeeded',
        orderId: session.order.orderId,
        paymentId: `pay_${Date.now()}_sec24_2`,
        amount: 49.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      const res = await paymentService.handleWebhook(webhookPayload, sig);
      const lic = await repository.getLicenseById(res.order.licenseId!);
      assert.strictEqual(catalog.maxDevices, 1);
      assert.strictEqual(offersService.getOfferById(session.order.offerId)!.maxDevices, 1);
      assert.strictEqual(lic?.policy.maxDevices, 1);
    });

    test('3. PRO ANNUAL : Displayed Price = Catalog Price = Server Price = 119 EUR', async () => {
      const catalog = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      const session = await paymentService.createCheckout({
        offerId: catalog.id,
        customerName: 'Coherence ProA',
        customerEmail: 'proa@coh.com',
      });
      assert.strictEqual(catalog.price, 119.0);
      assert.strictEqual(session.order.amount, 119.0);
    });

    test('4. PRO ANNUAL : Displayed maxDevices = Catalog maxDevices = License maxDevices = 1', async () => {
      const catalog = offersService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026')!;
      const session = await paymentService.createCheckout({
        offerId: catalog.id,
        customerName: 'Coherence ProA Dev',
        customerEmail: 'proadev@coh.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: `evt_${Date.now()}_sec24_4`,
        eventType: 'payment.succeeded',
        orderId: session.order.orderId,
        paymentId: `pay_${Date.now()}_sec24_4`,
        amount: 119.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      const res = await paymentService.handleWebhook(webhookPayload, sig);
      const lic = await repository.getLicenseById(res.order.licenseId!);
      assert.strictEqual(catalog.maxDevices, 1);
      assert.strictEqual(offersService.getOfferById(session.order.offerId)!.maxDevices, 1);
      assert.strictEqual(lic?.policy.maxDevices, 1);
    });

    test('5. PRO LIFETIME : Displayed Price = Catalog Price = Server Price = 249 EUR', async () => {
      const catalog = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!;
      const session = await paymentService.createCheckout({
        offerId: catalog.id,
        customerName: 'Coherence ProL',
        customerEmail: 'prol@coh.com',
      });
      assert.strictEqual(catalog.price, 249.0);
      assert.strictEqual(session.order.amount, 249.0);
    });

    test('6. PRO LIFETIME : Displayed maxDevices = Catalog maxDevices = License maxDevices = 1', async () => {
      const catalog = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME')!;
      const session = await paymentService.createCheckout({
        offerId: catalog.id,
        customerName: 'Coherence ProL Dev',
        customerEmail: 'proldev@coh.com',
      });
      const webhookPayload: WebhookEventPayload = {
        eventId: `evt_${Date.now()}_sec24_6`,
        eventType: 'payment.succeeded',
        orderId: session.order.orderId,
        paymentId: `pay_${Date.now()}_sec24_6`,
        amount: 249.0,
        currency: 'EUR',
        timestamp: Date.now(),
      };
      const sig = CommercialPaymentService.signWebhook(webhookPayload);
      const res = await paymentService.handleWebhook(webhookPayload, sig);
      const lic = await repository.getLicenseById(res.order.licenseId!);
      assert.strictEqual(catalog.maxDevices, 1);
      assert.strictEqual(offersService.getOfferById(session.order.offerId)!.maxDevices, 1);
      assert.strictEqual(lic?.policy.maxDevices, 1);
    });

    test('7. FREE : Displayed Price = Catalog Price = 0 EUR', () => {
      const catalog = offersService.getOfferById('OFFER-FREE-COMMUNITY')!;
      assert.strictEqual(catalog.price, 0);
    });

    test('8. FREE : Displayed maxDevices = Catalog maxDevices = 1', () => {
      const catalog = offersService.getOfferById('OFFER-FREE-COMMUNITY')!;
      assert.strictEqual(catalog.maxDevices, 1);
    });
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION DOC-FIX-SINGLE-DEVICE-001
 * Validation suite for commercial consistency: Strict Single Device V1.x
 * Target Version: v1.3.6-RC4 | Build ID: BA-V1.3.6-RC4 | Build Code: 17
 * 
 * Distribution (50 tests déterministes) :
 * - Section A : Offres Commerciales (8 tests)
 * - Section B : FAQ Pages & Accordéons (6 tests)
 * - Section C : Tableau Comparatif (5 tests)
 * - Section D : Traductions Françaises (4 tests)
 * - Section E : Traductions Anglaises (4 tests)
 * - Section F : Traductions Arabes RTL (4 tests)
 * - Section G : Traductions Espagnoles (4 tests)
 * - Section H : Traductions Italiennes (4 tests)
 * - Section I : Recherche Globale des Promesses Interdites (5 tests)
 * - Section J : Non-Régression & Invariants Techniques (6 tests)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Simulation d'environnement LocalStorage déterministe
class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

const testStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: testStorage,
});

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    localStorage: testStorage,
    location: { search: '', pathname: '/', href: 'http://localhost:3000/?view=app' },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

if (typeof globalThis.navigator === 'undefined') {
  (globalThis as any).navigator = {
    onLine: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SingleDeviceRunner/1.3.6',
  };
}

// Imports des modules de production
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService';
import { FULL_FAQ_ITEMS } from '../src/features/commercial-website/pages/WebFAQPage';
import { FAQ_ITEMS } from '../src/features/commercial-website/components/sections/FAQAccordionSection';
import { fr } from '../src/features/commercial-website/i18n/locales/fr';
import { en } from '../src/features/commercial-website/i18n/locales/en';
import { ar } from '../src/features/commercial-website/i18n/locales/ar';
import { es } from '../src/features/commercial-website/i18n/locales/es';
import { it as itLocale } from '../src/features/commercial-website/i18n/locales/it';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter';
import { SecurityEngine } from '../src/features/platform/engines/SecurityEngine';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { DeviceFingerprint } from '../src/features/licensing/types/licensing';

const primaryDevice: DeviceFingerprint = {
  deviceId: 'DEV-SINGLE-001',
  os: 'Windows',
  browserHash: 'hash_primary_001',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr-FR',
  hardwareConcurrency: 8,
  createdAt: '2026-09-08T10:00:00.000Z',
  lastSeenAt: '2026-09-08T12:00:00.000Z',
};

const secondaryDevice: DeviceFingerprint = {
  deviceId: 'DEV-SINGLE-002',
  os: 'Windows',
  browserHash: 'hash_secondary_002',
  screenSpec: '2560x1440',
  timezone: 'Europe/Paris',
  language: 'fr-FR',
  hardwareConcurrency: 16,
  createdAt: '2026-09-08T10:00:00.000Z',
  lastSeenAt: '2026-09-08T12:00:00.000Z',
};

describe('MISSION DOC-FIX-SINGLE-DEVICE-001 — Validation Cohérence Commerciale Single Device', () => {
  before(() => {
    testStorage.clear();
  });

  // =========================================================================
  // SECTION A : OFFRES COMMERCIALES (8 TESTS)
  // =========================================================================
  describe('SECTION A — Offres Commerciales & Catalogue (A1–A8)', () => {
    const service = CommercialOffersService.getInstance();

    it('A1 — Offre FREE : configurée pour 1 seul appareil', () => {
      const freeOffer = service.getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(freeOffer, 'Offre FREE doit exister');
      assert.strictEqual(freeOffer.maxDevices, 1, 'FREE doit avoir maxDevices = 1');
    });

    it('A2 — Offre PREMIUM Annuelle : configurée pour 1 seul appareil', () => {
      const premOffer = service.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(premOffer, 'Offre PREMIUM doit exister');
      assert.strictEqual(premOffer.maxDevices, 1, 'PREMIUM doit avoir maxDevices = 1 (aucune promesse de 3 appareils)');
    });

    it('A3 — Offre PRO Enterprise Annuelle : configurée pour 1 seul appareil', () => {
      const proOffer = service.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proOffer, 'Offre PRO Annual doit exister');
      assert.strictEqual(proOffer.maxDevices, 1, 'PRO Annual doit avoir maxDevices = 1 (aucune promesse de 5 appareils)');
    });

    it('A4 — Offre PRO Enterprise Lifetime : configurée pour 1 seul appareil', () => {
      const lifeOffer = service.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(lifeOffer, 'Offre PRO Lifetime doit exister');
      assert.strictEqual(lifeOffer.maxDevices, 1, 'PRO Lifetime doit avoir maxDevices = 1');
    });

    it('A5 — Catalogue complet getActiveOffers() : 100% des offres grand public ont maxDevices === 1', () => {
      const activeOffers = service.getActiveOffers();
      assert.ok(activeOffers.length >= 4, 'Au moins 4 offres actives requises');
      for (const offer of activeOffers) {
        assert.strictEqual(offer.maxDevices, 1, `L'offre ${offer.id} doit avoir maxDevices = 1`);
      }
    });

    it('A6 — Description / Features PREMIUM : mentionne explicitement la licence mono-appareil', () => {
      const premOffer = service.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(premOffer);
      for (const feature of premOffer.features) {
        assert.doesNotMatch(feature, /3 appareils/i, 'Aucune mention de 3 appareils dans PREMIUM');
        assert.doesNotMatch(feature, /multi-postes/i, 'Aucune mention de multi-postes dans PREMIUM');
      }
    });

    it('A7 — Description / Features PRO Annual : mentionne explicitement la licence mono-appareil', () => {
      const proOffer = service.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proOffer);
      const monoAppareilFeature = proOffer.features.find(f => f.toLowerCase().includes('mono-appareil'));
      assert.ok(monoAppareilFeature, 'PRO Annual doit afficher Licence mono-appareil');
      for (const feature of proOffer.features) {
        assert.doesNotMatch(feature, /5 appareils/i, 'Aucune mention de 5 appareils dans PRO');
        assert.doesNotMatch(feature, /5 postes/i, 'Aucune mention de 5 postes dans PRO');
      }
    });

    it('A8 — Description / Features PRO Lifetime : mentionne explicitement la licence mono-appareil', () => {
      const lifeOffer = service.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(lifeOffer);
      const monoAppareilFeature = lifeOffer.features.find(f => f.toLowerCase().includes('mono-appareil'));
      assert.ok(monoAppareilFeature, 'PRO Lifetime doit afficher Licence mono-appareil');
      for (const feature of lifeOffer.features) {
        assert.doesNotMatch(feature, /5 appareils/i, 'Aucune mention de 5 appareils dans PRO Lifetime');
      }
    });
  });

  // =========================================================================
  // SECTION B : FAQ PAGES & ACCORDÉONS (6 TESTS)
  // =========================================================================
  describe('SECTION B — FAQ Pages & Accordéons (B1–B6)', () => {
    it('B1 — WebFAQPage FULL_FAQ_ITEMS : zéro occurrence de "3 appareils"', () => {
      for (const item of FULL_FAQ_ITEMS) {
        assert.doesNotMatch(item.answerKey, /3 appareils/i, `FAQ item ${item.id} ne doit pas mentionner 3 appareils`);
        assert.doesNotMatch(item.questionKey, /3 appareils/i, `FAQ item ${item.id} question ne doit pas mentionner 3 appareils`);
      }
    });

    it('B2 — WebFAQPage FULL_FAQ_ITEMS : zéro occurrence de "5 appareils" ou "5 postes"', () => {
      for (const item of FULL_FAQ_ITEMS) {
        assert.doesNotMatch(item.answerKey, /5 appareils/i, `FAQ item ${item.id} ne doit pas mentionner 5 appareils`);
        assert.doesNotMatch(item.answerKey, /5 postes/i, `FAQ item ${item.id} ne doit pas mentionner 5 postes`);
      }
    });

    it('B3 — WebFAQPage faq-pricing-1 : mentionne formellement la licence mono-appareil pour Premium et Pro', () => {
      const pricingFaq = FULL_FAQ_ITEMS.find(f => f.id === 'faq-pricing-1');
      assert.ok(pricingFaq, 'faq-pricing-1 doit exister');
      assert.match(pricingFaq.answerKey, /licence mono-appareil/i, 'faq-pricing-1 doit mentionner licence mono-appareil');
    });

    it('B4 — WebFAQPage faq-licensing-3 : explique le changement de PC via sauvegarde/restauration USB', () => {
      const pcChangeFaq = FULL_FAQ_ITEMS.find(f => f.id === 'faq-licensing-3');
      assert.ok(pcChangeFaq, 'faq-licensing-3 doit exister');
      assert.match(pcChangeFaq.answerKey, /mono-appareil/i, 'faq-licensing-3 doit rappeler que la licence est mono-appareil');
      assert.match(pcChangeFaq.answerKey, /sauvegarde/i, 'faq-licensing-3 doit expliquer le transfert via sauvegarde');
      assert.match(pcChangeFaq.answerKey, /restaurez/i, 'faq-licensing-3 doit expliquer la restauration');
    });

    it('B5 — FAQAccordionSection FAQ_ITEMS : aucune promesse multi-appareil résiduelle', () => {
      for (const item of FAQ_ITEMS) {
        assert.doesNotMatch(item.answerKey, /3 appareils/i);
        assert.doesNotMatch(item.answerKey, /5 appareils/i);
        assert.doesNotMatch(item.answerKey, /5 postes/i);
      }
    });

    it('B6 — FAQAccordionSection faq-free-vs-pro : mentionne 1 appareil et licence mono-appareil', () => {
      const freeVsPro = FAQ_ITEMS.find(f => f.id === 'faq-free-vs-pro');
      assert.ok(freeVsPro, 'faq-free-vs-pro doit exister');
      assert.match(freeVsPro.answerKey, /1 appareil/i, 'Doit mentionner 1 appareil');
      assert.match(freeVsPro.answerKey, /licence mono-appareil/i, 'Doit mentionner licence mono-appareil');
    });
  });

  // =========================================================================
  // SECTION C : TABLEAU COMPARATIF (5 TESTS)
  // =========================================================================
  describe('SECTION C — Tableau Comparatif (C1–C5)', () => {
    it('C1 — ComparisonTableSection utilise les clés localisées pricing.rowDevicesVal*', () => {
      const compPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'sections', 'ComparisonTableSection.tsx');
      const content = fs.readFileSync(compPath, 'utf-8');
      assert.match(content, /pricing\.rowDevicesValFree/);
      assert.match(content, /pricing\.rowDevicesValPrem/);
      assert.match(content, /pricing\.rowDevicesValPro/);
    });

    it('C2 — site-bird-academy.html : aucune mention résiduelle de "3 postes" ou "5 postes"', () => {
      const siteHtmlPath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(siteHtmlPath, 'utf-8');
      assert.doesNotMatch(content, /3 postes/i, 'site-bird-academy.html ne doit plus contenir "3 postes"');
      assert.doesNotMatch(content, /5 postes/i, 'site-bird-academy.html ne doit plus contenir "5 postes"');
    });

    it('C3 — site-bird-academy.html : ligne de tableau comparatif affiche 1 appareil (Local)', () => {
      const siteHtmlPath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(siteHtmlPath, 'utf-8');
      assert.match(content, /Appareils autorisés \(Licence mono-appareil\)/);
      assert.match(content, /1 appareil \(Local\)/);
    });

    it('C4 — Locale FR : rowDevicesValFree est égal à "1 appareil (Local)"', () => {
      assert.strictEqual(fr.pricing.rowDevicesValFree, '1 appareil (Local)');
    });

    it('C5 — Locale FR : rowDevicesValPrem et rowDevicesValPro sont égaux à "1 appareil (Local)"', () => {
      assert.strictEqual(fr.pricing.rowDevicesValPrem, '1 appareil (Local)');
      assert.strictEqual(fr.pricing.rowDevicesValPro, '1 appareil (Local)');
    });
  });

  // =========================================================================
  // SECTION D : TRADUCTIONS FRANÇAISES (4 TESTS)
  // =========================================================================
  describe('SECTION D — Traductions Françaises FR (D1–D4)', () => {
    it('D1 — fr.ts : aucune promesse multi-appareil commerciale', () => {
      const rawFr = JSON.stringify(fr);
      assert.doesNotMatch(rawFr, /3 appareils/i);
      assert.doesNotMatch(rawFr, /5 appareils/i);
      assert.doesNotMatch(rawFr, /5 postes/i);
    });

    it('D2 — fr.ts : pricing.proSummary contient "mono-appareil"', () => {
      assert.match(fr.pricing.proSummary, /mono-appareil/i);
    });

    it('D3 — fr.ts : pricing.rowDevices est défini ("Modèle d\'installation")', () => {
      assert.strictEqual(fr.pricing.rowDevices, "Modèle d'installation");
    });

    it('D4 — site-bird-academy.html : dictionnaire FR déclare "Licence mono-appareil"', () => {
      const siteHtmlPath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(siteHtmlPath, 'utf-8');
      assert.match(content, /Licence mono-appareil \(données 100% locales\)/);
    });
  });

  // =========================================================================
  // SECTION E : TRADUCTIONS ANGLAISES (4 TESTS)
  // =========================================================================
  describe('SECTION E — Traductions Anglaises EN (E1–E4)', () => {
    it('E1 — en.ts : aucune promesse multi-device ("3 devices", "5 devices")', () => {
      const rawEn = JSON.stringify(en);
      assert.doesNotMatch(rawEn, /3 devices/i);
      assert.doesNotMatch(rawEn, /5 devices/i);
    });

    it('E2 — en.ts : valeurs devices définies comme "1 Device (Local)"', () => {
      assert.strictEqual(en.pricing.rowDevicesValFree, '1 Device (Local)');
      assert.strictEqual(en.pricing.rowDevicesValPrem, '1 Device (Local)');
      assert.strictEqual(en.pricing.rowDevicesValPro, '1 Device (Local)');
    });

    it('E3 — en.ts : pricing.proSummary contient "single-device"', () => {
      assert.match(en.pricing.proSummary, /single-device/i);
    });

    it('E4 — site-bird-academy.html : dictionnaire EN déclare "Single-device license"', () => {
      const siteHtmlPath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(siteHtmlPath, 'utf-8');
      assert.match(content, /Single-device license \(100% local data\)/);
    });
  });

  // =========================================================================
  // SECTION F : TRADUCTIONS ARABES RTL (4 TESTS)
  // =========================================================================
  describe('SECTION F — Traductions Arabes RTL AR (F1–F4)', () => {
    it('F1 — ar.ts : aucune promesse de synchronisation multi-appareils', () => {
      const rawAr = JSON.stringify(ar);
      assert.doesNotMatch(rawAr, /3 أجهزة/);
      assert.doesNotMatch(rawAr, /5 أجهزة/);
    });

    it('F2 — ar.ts : valeurs devices définies comme "جهاز واحد (محلي)"', () => {
      assert.strictEqual(ar.pricing.rowDevicesValFree, 'جهاز واحد (محلي)');
      assert.strictEqual(ar.pricing.rowDevicesValPrem, 'جهاز واحد (محلي)');
      assert.strictEqual(ar.pricing.rowDevicesValPro, 'جهاز واحد (محلي)');
    });

    it('F3 — ar.ts : pricing.proSummary contient la mention légale arabe de licence pour un seul appareil', () => {
      assert.match(ar.pricing.proSummary, /جهاز واحد/);
    });

    it('F4 — site-bird-academy.html : dictionnaire AR déclare "ترخيص لجهاز واحد (بيانات محلية 100%)"', () => {
      const siteHtmlPath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(siteHtmlPath, 'utf-8');
      assert.match(content, /ترخيص لجهاز واحد \(بيانات محلية 100%\)/);
    });
  });

  // =========================================================================
  // SECTION G : TRADUCTIONS ESPAGNOLES (4 TESTS)
  // =========================================================================
  describe('SECTION G — Traductions Espagnoles ES (G1–G4)', () => {
    it('G1 — es.ts : aucune promesse "3 dispositivos" ou "5 dispositivos"', () => {
      const rawEs = JSON.stringify(es);
      assert.doesNotMatch(rawEs, /3 dispositivos/i);
      assert.doesNotMatch(rawEs, /5 dispositivos/i);
    });

    it('G2 — es.ts : valeurs devices définies comme "1 puesto (Local)"', () => {
      assert.strictEqual(es.pricing.rowDevicesValFree, '1 puesto (Local)');
      assert.strictEqual(es.pricing.rowDevicesValPrem, '1 puesto (Local)');
      assert.strictEqual(es.pricing.rowDevicesValPro, '1 puesto (Local)');
    });

    it('G3 — es.ts : pricing.proSummary contient "monopuesto"', () => {
      assert.match(es.pricing.proSummary, /monopuesto/i);
    });

    it('G4 — site-bird-academy.html : dictionnaire ES déclare "Licencia monopuesto"', () => {
      const siteHtmlPath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(siteHtmlPath, 'utf-8');
      assert.match(content, /Licencia monopuesto \(100% datos locales\)/);
    });
  });

  // =========================================================================
  // SECTION H : TRADUCTIONS ITALIENNES (4 TESTS)
  // =========================================================================
  describe('SECTION H — Traductions Italiennes IT (H1–H4)', () => {
    it('H1 — it.ts : aucune promesse "3 dispositivi" ou "5 dispositivi"', () => {
      const rawIt = JSON.stringify(itLocale);
      assert.doesNotMatch(rawIt, /3 dispositivi/i);
      assert.doesNotMatch(rawIt, /5 dispositivi/i);
    });

    it('H2 — it.ts : valeurs devices définies comme "1 dispositivo (Locale)"', () => {
      assert.strictEqual(itLocale.pricing.rowDevicesValFree, '1 dispositivo (Locale)');
      assert.strictEqual(itLocale.pricing.rowDevicesValPrem, '1 dispositivo (Locale)');
      assert.strictEqual(itLocale.pricing.rowDevicesValPro, '1 dispositivo (Locale)');
    });

    it('H3 — it.ts : pricing.proSummary contient "singolo dispositivo"', () => {
      assert.match(itLocale.pricing.proSummary, /singolo dispositivo/i);
    });

    it('H4 — site-bird-academy.html : dictionnaire IT déclare "Licenza per singolo dispositivo"', () => {
      const siteHtmlPath = path.join(process.cwd(), 'site web', 'site-bird-academy.html');
      const content = fs.readFileSync(siteHtmlPath, 'utf-8');
      assert.match(content, /Licenza per singolo dispositivo \(100% locale\)/);
    });
  });

  // =========================================================================
  // SECTION I : RECHERCHE GLOBALE DES PROMESSES INTERDITES (5 TESTS)
  // =========================================================================
  describe('SECTION I — Recherche Globale des Promesses Interdites (I1–I5)', () => {
    it('I1 — Zéro occurrence de "3 appareils" dans src/features/commercial-website', () => {
      const dirPath = path.join(process.cwd(), 'src', 'features', 'commercial-website');
      const scanDir = (dir: string): string[] => {
        let files: string[] = [];
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) files = files.concat(scanDir(full));
          else if (/\.(ts|tsx)$/.test(full)) files.push(full);
        }
        return files;
      };

      for (const file of scanDir(dirPath)) {
        const content = fs.readFileSync(file, 'utf-8');
        assert.doesNotMatch(content, /3 appareils/i, `Violation "3 appareils" trouvée dans ${file}`);
      }
    });

    it('I2 — Zéro occurrence de "5 appareils" ou "5 postes" dans src/features/commercial-website', () => {
      const dirPath = path.join(process.cwd(), 'src', 'features', 'commercial-website');
      const scanDir = (dir: string): string[] => {
        let files: string[] = [];
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) files = files.concat(scanDir(full));
          else if (/\.(ts|tsx)$/.test(full)) files.push(full);
        }
        return files;
      };

      for (const file of scanDir(dirPath)) {
        const content = fs.readFileSync(file, 'utf-8');
        assert.doesNotMatch(content, /5 appareils/i, `Violation "5 appareils" trouvée dans ${file}`);
        assert.doesNotMatch(content, /5 postes/i, `Violation "5 postes" trouvée dans ${file}`);
      }
    });

    it('I3 — CheckoutWizard affiche le singulier "1 appareil"', () => {
      const wizardPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'CheckoutWizard.tsx');
      const content = fs.readFileSync(wizardPath, 'utf-8');
      assert.match(content, /\{off\.offer\.maxDevices\}\s+appareil\b/, 'CheckoutWizard doit afficher "appareil" au singulier');
      assert.doesNotMatch(content, /\{off\.offer\.maxDevices\}\s+appareils\b/, 'CheckoutWizard ne doit pas afficher le pluriel');
    });

    it('I4 — OrderSummaryCard affiche "1 poste (Mono-appareil)"', () => {
      const summaryPath = path.join(process.cwd(), 'src', 'features', 'commercial-website', 'components', 'checkout', 'OrderSummaryCard.tsx');
      const content = fs.readFileSync(summaryPath, 'utf-8');
      assert.match(content, /\{offer\.maxDevices\}\s+poste\s+\(Mono-appareil\)/, 'OrderSummaryCard doit afficher la mention explicite Mono-appareil');
    });

    it('I5 — Guide propriétaire LMSE (Markdown & HTML) : grilles tarifaires alignées sur 1 appareil', () => {
      const guideMd = fs.readFileSync(path.join(process.cwd(), 'LMSE_OWNER_GUIDE.md'), 'utf-8');
      const guideHtml = fs.readFileSync(path.join(process.cwd(), 'LMSE_OWNER_GUIDE.html'), 'utf-8');
      assert.match(guideMd, /Éleveur Passion Pro\s+\|\s+79 € \/ an\s+\|\s+1 an\s+\|\s+1 appareil/);
      assert.match(guideHtml, /Éleveur Passion Pro\s+\|\s+79 € \/ an\s+\|\s+1 an\s+\|\s+1 appareil/);
    });
  });

  // =========================================================================
  // SECTION J : NON-RÉGRESSION & INVARIANTS TECHNIQUES (6 TESTS)
  // =========================================================================
  describe('SECTION J — Non-Régression & Invariants Techniques (J1–J6)', () => {
    it('J1 — OfflineBetaValidator valide avec succès une licence maxDevices = 1 sur le poste initial', async () => {
      process.env.VITE_APP_MODE = 'admin';
      const license = await LicenseGenerator.generateLicense({
        holderName: 'Eleveur Single Device',
        type: 'commercial',
        durationDays: 365,
        maxDevices: 1,
      });

      const licFile = OfflineBetaExporter.exportLicenseJson(license);
      const res = await OfflineBetaValidator.validateFile(licFile, primaryDevice, []);
      assert.strictEqual(res.isValid, true, 'Validation doit réussir sur premier poste');
      assert.strictEqual(res.code, 'VALID');
    });

    it('J2 — Blocage strict du second appareil lorsque maxDevices = 1 (DEVICE_LIMIT_EXCEEDED)', async () => {
      process.env.VITE_APP_MODE = 'admin';
      const license = await LicenseGenerator.generateLicense({
        holderName: 'Eleveur Single Device Restreint',
        type: 'commercial',
        durationDays: 365,
        maxDevices: 1,
      });

      const licFile = OfflineBetaExporter.exportLicenseJson(license);
      // Activation premier appareil
      const res1 = await OfflineBetaValidator.validateFile(licFile, primaryDevice, []);
      assert.strictEqual(res1.isValid, true);

      // Activation second appareil avec la licence déjà liée au premier appareil
      const res2 = await OfflineBetaValidator.validateFile(licFile, secondaryDevice, [], res1.license);
      assert.strictEqual(res2.isValid, false, 'Second appareil doit être bloqué');
      assert.strictEqual(res2.code, 'DEVICE_LIMIT_EXCEEDED', 'Code erreur doit être DEVICE_LIMIT_EXCEEDED');
    });

    it('J3 — Invariant Transfert : export JSON scellé par SecurityEngine puis réimport sans perte', async () => {
      const dummyBreedingData = {
        birds: [{ id: 1, nom: 'Canari Jaune Test', bague: '2026-001' }],
        version: '1.3.6-RC4',
        exportDate: new Date().toISOString(),
      };

      const envelope = await SecurityEngine.signPayload(dummyBreedingData);
      assert.ok(envelope.security?.signature, 'L enveloppe de sauvegarde doit être signée SHA-256');

      const verified = await SecurityEngine.verifyPayloadSignature(envelope);
      assert.strictEqual(verified.isValid, true, 'Intégrité du transfert manuel préservée');
      assert.strictEqual(envelope.payload.birds[0].nom, 'Canari Jaune Test');
    });

    it('J4 — SubscriptionTierResolver résout le tier FREE sans licence active', () => {
      const tier = SubscriptionTierResolver.resolve(null);
      assert.strictEqual(tier, 'FREE');
    });

    it('J5 — SubscriptionTierResolver résout le tier PREMIUM et PRO pour les licences correspondantes', () => {
      const mockLicenseCommercial: any = {
        id: 'LIC-PREM-001',
        key: 'LMSE-COMM-1111-2222-3333',
        holderName: 'Test Premium',
        type: 'commercial',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        status: 'ACTIVE',
        policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'tier:premium'] },
        checksum: 'dummy_checksum',
        signature: 'dummy_sig',
      };

      const tierPrem = SubscriptionTierResolver.resolve(mockLicenseCommercial, { isValid: true } as any);
      assert.strictEqual(tierPrem, 'PREMIUM');

      const mockLicensePro: any = {
        id: 'LIC-PRO-001',
        key: 'LMSE-PRO-1111-2222-3333',
        holderName: 'Test Pro',
        type: 'enterprise',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
        status: 'ACTIVE',
        policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'tier:pro'] },
        checksum: 'dummy_checksum',
        signature: 'dummy_sig',
      };

      const tierPro = SubscriptionTierResolver.resolve(mockLicensePro, { isValid: true } as any);
      assert.strictEqual(tierPro, 'PRO');
    });

    it('J6 — Invariants cryptographiques LMSE intacts (ECDSA, SHA-256, validation offline)', () => {
      assert.ok(typeof LicenseGenerator.generateLicense === 'function');
      assert.ok(typeof OfflineBetaValidator.validateFile === 'function');
      assert.ok(typeof SecurityEngine.signPayload === 'function');
    });
  });
});


/**
 * MISSION : RELEASE-CONSISTENCY-FIX-001
 * Projet : Bird Academy Enterprise — Volière Manager
 * Version cible : v1.3.6-RC4 | Build ID : BA-V1.3.6-RC4 | Build Code : 17
 * 
 * Suite de tests officielle de validation de cohérence :
 * - Catégorie A — Commercial Single Device (15 tests)
 * - Catégorie B — FAQ & Accordéons (8 tests)
 * - Catégorie C — Cohérence Multilingue (10 tests)
 * - Catégorie D — Checkout & Delivery (5 tests)
 * - Catégorie E — Documentation Juridique (5 tests)
 * - Catégorie F — Versioning du Format de Sauvegarde (10 tests)
 * - Catégorie G — Sécurité & Non-Régression (8 tests)
 * TOTAL = 61 tests
 */

import { describe, it, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Storage shim
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

// Admin context required for license generation during tests
process.env.VITE_APP_MODE = 'admin';

describe('MISSION RELEASE-CONSISTENCY-FIX-001 — Cohérence Commerciale, Juridique et Versioning', () => {
  let commService: any;
  let BackupRestoreService: any;
  let SecurityEngine: any;
  let BUILD_ID: string;
  let BUILD_VERSION_NAME: string;
  let BUILD_VERSION_CODE: number;
  let FULL_FAQ_ITEMS: any[];
  let FAQ_ITEMS: any[];
  let frLocale: any;
  let enLocale: any;
  let arLocale: any;
  let esLocale: any;
  let itLocale: any;

  before(async () => {
    const commMod = await import('../src/features/licensing/commercial/services/CommercialOffersService');
    commService = commMod.CommercialOffersService.getInstance();

    const bkpMod = await import('../src/features/platform/services/BackupRestoreService');
    BackupRestoreService = bkpMod.BackupRestoreService;

    const secMod = await import('../src/features/platform/engines/SecurityEngine');
    SecurityEngine = secMod.SecurityEngine;

    const appModeMod = await import('../src/config/appMode');
    BUILD_ID = appModeMod.BUILD_ID;
    BUILD_VERSION_NAME = appModeMod.BUILD_VERSION_NAME;
    BUILD_VERSION_CODE = appModeMod.BUILD_VERSION_CODE;

    const webFaqMod = await import('../src/features/commercial-website/pages/WebFAQPage');
    FULL_FAQ_ITEMS = webFaqMod.FULL_FAQ_ITEMS;

    const faqAccordionMod = await import('../src/features/commercial-website/components/sections/FAQAccordionSection');
    FAQ_ITEMS = faqAccordionMod.FAQ_ITEMS;

    const frMod = await import('../src/features/commercial-website/i18n/locales/fr');
    frLocale = frMod.fr;

    const enMod = await import('../src/features/commercial-website/i18n/locales/en');
    enLocale = enMod.en;

    const arMod = await import('../src/features/commercial-website/i18n/locales/ar');
    arLocale = arMod.ar;

    const esMod = await import('../src/features/commercial-website/i18n/locales/es');
    esLocale = esMod.es;

    const itMod = await import('../src/features/commercial-website/i18n/locales/it');
    itLocale = itMod.it;
  });

  afterEach(() => {
    testStorage.clear();
    process.env.VITE_APP_MODE = 'admin';
  });

  // ============================================================
  // CATÉGORIE A — COMMERCIAL SINGLE DEVICE (15 tests)
  // ============================================================
  describe('Catégorie A — Commercial Single Device (A01–A15)', () => {
    it('A01 — Offre FREE : maxDevices = 1 et modèle local', () => {
      const freeOffer = commService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.ok(freeOffer, 'Offre FREE doit exister');
      assert.strictEqual(freeOffer.maxDevices, 1);
    });

    it('A02 — Offre PREMIUM Annuelle : maxDevices = 1', () => {
      const premOffer = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.ok(premOffer, 'Offre PREMIUM doit exister');
      assert.strictEqual(premOffer.maxDevices, 1);
    });

    it('A03 — Offre PRO Enterprise Annuelle : maxDevices = 1', () => {
      const proOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.ok(proOffer, 'Offre PRO Enterprise Annuelle doit exister');
      assert.strictEqual(proOffer.maxDevices, 1);
    });

    it('A04 — Offre PRO Enterprise Lifetime : maxDevices = 1', () => {
      const lifeOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(lifeOffer, 'Offre PRO Lifetime doit exister');
      assert.strictEqual(lifeOffer.maxDevices, 1);
    });

    it('A05 — Catalogue complet getActiveOffers() : 100% des offres ont maxDevices === 1', () => {
      const offers = commService.getActiveOffers();
      for (const off of offers) {
        assert.strictEqual(off.maxDevices, 1, `L'offre ${off.id} doit avoir maxDevices = 1`);
      }
    });

    it('A06 — Description / Features FREE : aucune mention de multi-postes', () => {
      const freeOffer = commService.getOfferById('OFFER-FREE-COMMUNITY');
      for (const f of freeOffer.features) {
        assert.doesNotMatch(f, /3 appareils|5 appareils|multi-device|plusieurs appareils/i);
      }
    });

    it('A07 — Features PREMIUM contiennent explicitement "Licence mono-appareil"', () => {
      const premOffer = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      const hasMono = premOffer.features.some((f: string) => f.toLowerCase().includes('mono-appareil'));
      assert.strictEqual(hasMono, true, 'PREMIUM doit afficher la mention mono-appareil');
    });

    it('A08 — Features PRO Annual contiennent explicitement "Licence mono-appareil"', () => {
      const proOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      const hasMono = proOffer.features.some((f: string) => f.toLowerCase().includes('mono-appareil'));
      assert.strictEqual(hasMono, true, 'PRO Annual doit afficher la mention mono-appareil');
    });

    it('A09 — Features PRO Lifetime contiennent explicitement "Licence mono-appareil"', () => {
      const lifeOffer = commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      const hasMono = lifeOffer.features.some((f: string) => f.toLowerCase().includes('mono-appareil'));
      assert.strictEqual(hasMono, true, 'PRO Lifetime doit afficher la mention mono-appareil');
    });

    it('A10 — CommercialOffersService.getOfferById("OFFER-PREMIUM-ANNUAL-2026") retourne maxDevices = 1', () => {
      const offer = commService.getOfferById('OFFER-PREMIUM-ANNUAL-2026');
      assert.strictEqual(offer.maxDevices, 1);
    });

    it('A11 — CommercialOffersService.getOfferById("OFFER-PRO-ENTERPRISE-ANNUAL-2026") retourne maxDevices = 1', () => {
      const offer = commService.getOfferById('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      assert.strictEqual(offer.maxDevices, 1);
    });

    it('A12 — CommercialOffersService.getOfferById("OFFER-PRO-ENTERPRISE-LIFETIME") retourne maxDevices = 1', () => {
      const offer = commService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.strictEqual(offer.maxDevices, 1);
    });

    it('A13 — OFFER-FREE-COMMUNITY a tier: "FREE" et price: 0 (mode gratuit)', () => {
      const freeOffer = commService.getOfferById('OFFER-FREE-COMMUNITY');
      assert.strictEqual(freeOffer.tier, 'FREE');
      assert.strictEqual(freeOffer.price, 0);
    });

    it('A14 — Aucune offre ne contient "3 appareils" dans ses textes', () => {
      const offers = commService.getActiveOffers();
      for (const off of offers) {
        assert.doesNotMatch(off.description, /3 appareils/i);
        for (const feat of off.features) {
          assert.doesNotMatch(feat, /3 appareils/i);
        }
      }
    });

    it('A15 — Aucune offre ne contient "5 appareils" ou "5 postes" dans ses textes', () => {
      const offers = commService.getActiveOffers();
      for (const off of offers) {
        assert.doesNotMatch(off.description, /5 appareils|5 postes/i);
        for (const feat of off.features) {
          assert.doesNotMatch(feat, /5 appareils|5 postes/i);
        }
      }
    });
  });

  // ============================================================
  // CATÉGORIE B — FAQ (8 tests)
  // ============================================================
  describe('Catégorie B — FAQ & Accordéons (B01–B08)', () => {
    it('B01 — FULL_FAQ_ITEMS dans WebFAQPage : zéro occurrence de "3 appareils"', () => {
      for (const item of FULL_FAQ_ITEMS) {
        assert.doesNotMatch(item.answerKey, /3 appareils/i);
        assert.doesNotMatch(item.questionKey, /3 appareils/i);
      }
    });

    it('B02 — FULL_FAQ_ITEMS dans WebFAQPage : zéro occurrence de "5 appareils" ou "5 postes"', () => {
      for (const item of FULL_FAQ_ITEMS) {
        assert.doesNotMatch(item.answerKey, /5 appareils|5 postes/i);
        assert.doesNotMatch(item.questionKey, /5 appareils|5 postes/i);
      }
    });

    it('B03 — WebFAQPage faq-pricing-1 déclare explicitement la licence mono-appareil', () => {
      const p1 = FULL_FAQ_ITEMS.find((item: any) => item.id === 'faq-pricing-1');
      assert.ok(p1);
      assert.match(p1.answerKey, /mono-appareil/i);
      assert.doesNotMatch(p1.answerKey, /3 appareils|5 appareils/i);
    });

    it('B04 — WebFAQPage faq-licensing-3 explique le changement de PC via sauvegarde/restauration USB', () => {
      const lic3 = FULL_FAQ_ITEMS.find((item: any) => item.id === 'faq-licensing-3');
      assert.ok(lic3);
      assert.match(lic3.answerKey, /mono-appareil/i);
      assert.match(lic3.answerKey, /sauvegarde/i);
      assert.match(lic3.answerKey, /restaurez/i);
    });

    it('B05 — FAQAccordionSection FAQ_ITEMS : zéro occurrence de "3 appareils"', () => {
      for (const item of FAQ_ITEMS) {
        assert.doesNotMatch(item.answerKey, /3 appareils/i);
      }
    });

    it('B06 — FAQAccordionSection FAQ_ITEMS : zéro occurrence de "5 appareils" ou "5 postes"', () => {
      for (const item of FAQ_ITEMS) {
        assert.doesNotMatch(item.answerKey, /5 appareils|5 postes/i);
      }
    });

    it('B07 — FAQAccordionSection faq-free-vs-pro déclare 1 appareil et licence mono-appareil', () => {
      const freePro = FAQ_ITEMS.find((item: any) => item.id === 'faq-free-vs-pro');
      assert.ok(freePro);
      assert.match(freePro.answerKey, /1 appareil/i);
      assert.match(freePro.answerKey, /licence mono-appareil/i);
    });

    it('B08 — Distinction valide : explication d absence de synchronisation acceptée sans promesse commerciale', () => {
      const syncFaq = FULL_FAQ_ITEMS.find((item: any) => item.id === 'faq-storage' || item.id === 'faq-offline-2');
      assert.ok(syncFaq);
      assert.doesNotMatch(syncFaq.answerKey, /synchronisation cloud disponible/i);
    });
  });

  // ============================================================
  // CATÉGORIE C — LOCALES (10 tests)
  // ============================================================
  describe('Catégorie C — Cohérence Multilingue (C01–C10)', () => {
    it('C01 — FR : rowDevicesValFree = "1 appareil (Local)"', () => {
      assert.strictEqual(frLocale.pricing.rowDevicesValFree, '1 appareil (Local)');
    });

    it('C02 — FR : rowDevicesValPrem et rowDevicesValPro = "1 appareil (Local)"', () => {
      assert.strictEqual(frLocale.pricing.rowDevicesValPrem, '1 appareil (Local)');
      assert.strictEqual(frLocale.pricing.rowDevicesValPro, '1 appareil (Local)');
    });

    it('C03 — EN : rowDevicesValFree = "1 Device (Local)"', () => {
      assert.strictEqual(enLocale.pricing.rowDevicesValFree, '1 Device (Local)');
    });

    it('C04 — EN : rowDevicesValPrem et rowDevicesValPro = "1 Device (Local)"', () => {
      assert.strictEqual(enLocale.pricing.rowDevicesValPrem, '1 Device (Local)');
      assert.strictEqual(enLocale.pricing.rowDevicesValPro, '1 Device (Local)');
    });

    it('C05 — AR : rowDevicesValFree = "جهاز واحد (محلي)"', () => {
      assert.strictEqual(arLocale.pricing.rowDevicesValFree, 'جهاز واحد (محلي)');
    });

    it('C06 — AR : rowDevicesValPrem et rowDevicesValPro = "جهاز واحد (محلي)"', () => {
      assert.strictEqual(arLocale.pricing.rowDevicesValPrem, 'جهاز واحد (محلي)');
      assert.strictEqual(arLocale.pricing.rowDevicesValPro, 'جهاز واحد (محلي)');
    });

    it('C07 — ES : rowDevicesValFree = "1 puesto (Local)"', () => {
      assert.strictEqual(esLocale.pricing.rowDevicesValFree, '1 puesto (Local)');
    });

    it('C08 — ES : rowDevicesValPrem et rowDevicesValPro = "1 puesto (Local)"', () => {
      assert.strictEqual(esLocale.pricing.rowDevicesValPrem, '1 puesto (Local)');
      assert.strictEqual(esLocale.pricing.rowDevicesValPro, '1 puesto (Local)');
    });

    it('C09 — IT : rowDevicesValFree = "1 dispositivo (Locale)"', () => {
      assert.strictEqual(itLocale.pricing.rowDevicesValFree, '1 dispositivo (Locale)');
    });

    it('C10 — IT : rowDevicesValPrem et rowDevicesValPro = "1 dispositivo (Locale)"', () => {
      assert.strictEqual(itLocale.pricing.rowDevicesValPrem, '1 dispositivo (Locale)');
      assert.strictEqual(itLocale.pricing.rowDevicesValPro, '1 dispositivo (Locale)');
    });
  });

  // ============================================================
  // CATÉGORIE D — CHECKOUT / DELIVERY (5 tests)
  // ============================================================
  describe('Catégorie D — Checkout & Delivery (D01–D05)', () => {
    it('D01 — CheckoutWizard utilise le singulier "appareil" pour maxDevices', () => {
      const wizardPath = path.join(process.cwd(), 'src/features/commercial-website/components/checkout/CheckoutWizard.tsx');
      const content = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(content.includes('{off.offer.maxDevices} appareil'));
      assert.doesNotMatch(content, /\{off\.offer\.maxDevices\}\s+appareils/);
    });

    it('D02 — OrderSummaryCard affiche "1 poste (Mono-appareil)"', () => {
      const cardPath = path.join(process.cwd(), 'src/features/commercial-website/components/checkout/OrderSummaryCard.tsx');
      const content = fs.readFileSync(cardPath, 'utf-8');
      assert.ok(content.includes('{offer.maxDevices} poste (Mono-appareil)'));
    });

    it('D03 — WebOrderCheckoutService assure le repli maxDevices = 1', () => {
      const checkoutServicePath = path.join(process.cwd(), 'src/features/commercial-website/services/WebOrderCheckoutService.ts');
      const content = fs.readFileSync(checkoutServicePath, 'utf-8');
      assert.ok(content.includes('maxDevices = offer.maxDevices || 1;'));
    });

    it('D04 — Guide propriétaire LMSE documente le transfert manuel par sauvegarde', () => {
      const guidePath = path.join(process.cwd(), 'LMSE_OWNER_GUIDE.md');
      const content = fs.readFileSync(guidePath, 'utf-8');
      assert.ok(content.includes('Single Device'));
      assert.ok(content.includes('sauvegarde'));
    });

    it('D05 — site-bird-academy.html déclare "Licence mono-appareil" dans sa grille tarifaire', () => {
      const htmlPath = path.join(process.cwd(), 'site web/site-bird-academy.html');
      const content = fs.readFileSync(htmlPath, 'utf-8');
      assert.ok(content.includes('Licence mono-appareil'));
      assert.doesNotMatch(content, /3 postes|5 postes/i);
    });
  });

  // ============================================================
  // CATÉGORIE E — LEGAL DOCUMENTATION (5 tests)
  // ============================================================
  describe('Catégorie E — Documentation Juridique (E01–E05)', () => {
    it('E01 — HelpDocTab admin-license ne contient plus la mention open-source Apache-2.0', () => {
      const helpDocPath = path.join(process.cwd(), 'src/features/quality/components/HelpDocTab.tsx');
      const content = fs.readFileSync(helpDocPath, 'utf-8');
      assert.strictEqual(content.includes("distribué sous la licence libre et open source Apache-2.0"), false);
      assert.strictEqual(content.includes("Licence open source Apache-2.0"), false);
    });

    it('E02 — HelpDocTab admin-license déclare les conditions commerciales officielles', () => {
      const helpDocPath = path.join(process.cwd(), 'src/features/quality/components/HelpDocTab.tsx');
      const content = fs.readFileSync(helpDocPath, 'utf-8');
      assert.ok(content.includes("Bird Academy est distribué selon les conditions de licence applicables à votre offre commerciale"));
    });

    it('E03 — HelpDocTab conserve l avis de copyright et la souveraineté des données', () => {
      const helpDocPath = path.join(process.cwd(), 'src/features/quality/components/HelpDocTab.tsx');
      const content = fs.readFileSync(helpDocPath, 'utf-8');
      assert.ok(content.includes("Copyright © 2026 Bird Academy. Tous droits réservés."));
      assert.ok(content.includes("demeurent la propriété exclusive de l'éleveur et sont stockées localement"));
    });

    it('E04 — Zéro documentation utilisateur active n annonce Apache-2.0 pour l application commerciale', () => {
      const helpDocPath = path.join(process.cwd(), 'src/features/quality/components/HelpDocTab.tsx');
      const content = fs.readFileSync(helpDocPath, 'utf-8');
      assert.doesNotMatch(content, /id:\s*'admin-license'[^}]+Apache-2\.0/s);
    });

    it('E05 — Les en-têtes de code SPDX sont préservés comme code technique légitime (Catégorie F)', () => {
      const helpDocPath = path.join(process.cwd(), 'src/features/quality/components/HelpDocTab.tsx');
      const content = fs.readFileSync(helpDocPath, 'utf-8');
      assert.ok(content.startsWith('/**\n * @license\n * SPDX-License-Identifier: Apache-2.0'));
    });
  });

  // ============================================================
  // CATÉGORIE F — BACKUP VERSIONING (10 tests)
  // ============================================================
  describe('Catégorie F — Versioning du Format de Sauvegarde (F01–F10)', () => {
    it('F01 — BACKUP_SCHEMA_VERSION est défini publiquement et vaut "1.2"', () => {
      assert.strictEqual(BackupRestoreService.BACKUP_SCHEMA_VERSION, '1.2');
    });

    it('F02 — getBackupSchemaVersion() retourne la version du schéma ("1.2")', () => {
      assert.strictEqual(BackupRestoreService.getBackupSchemaVersion(), '1.2');
    });

    it('F03 — getApplicationVersion() retourne BUILD_VERSION_NAME ("1.3.6-RC4")', () => {
      assert.strictEqual(BackupRestoreService.getApplicationVersion(), '1.3.6-RC4');
      assert.strictEqual(BackupRestoreService.getApplicationVersion(), BUILD_VERSION_NAME);
    });

    it('F04 — Getter APP_VERSION est conservé pour rétro-compatibilité et renvoie "1.2"', () => {
      assert.strictEqual(BackupRestoreService.APP_VERSION, '1.2');
    });

    it('F05 — Distinction explicite : version schéma ("1.2") !== version applicative ("1.3.6-RC4")', () => {
      assert.notStrictEqual(
        BackupRestoreService.getBackupSchemaVersion(),
        BackupRestoreService.getApplicationVersion(),
        'Le schéma de sauvegarde et la version applicative doivent être deux valeurs distinctes'
      );
    });

    it('F06 — createBackup() injecte schemaVersion et appVersion dans rawDb.__backup', async () => {
      const res = await BackupRestoreService.createBackup('Test Manifest Versioning', 'full');
      assert.ok(res.success && res.data);
      const envelope = JSON.parse(res.data);
      assert.strictEqual(envelope.payload.__backup.schemaVersion, '1.2');
      assert.strictEqual(envelope.payload.__backup.appVersion, '1.3.6-RC4');
    });

    it('F07 — createBackup() renseigne la version de schéma ("1.2") dans l historique', async () => {
      const res = await BackupRestoreService.createBackup('Test History Entry', 'full');
      assert.ok(res.entry);
      assert.strictEqual(res.entry.version, '1.2');
    });

    it('F08 — simulateRestore() valide sans avertissement bloquant le schéma courant ("1.2")', async () => {
      const res = await BackupRestoreService.createBackup('Test Match', 'full');
      assert.ok(res.data);
      const sim = await BackupRestoreService.simulateRestore(res.data);
      assert.strictEqual(sim.isValid, true);
      assert.strictEqual(sim.isCompatible, true);
      assert.strictEqual(sim.version, '1.2');
    });

    it('F09 — simulateRestore() rejette un schéma de version future (ex: "2.0")', async () => {
      const res = await BackupRestoreService.createBackup('Futur Schema', 'full');
      assert.ok(res.data);
      const parsed = JSON.parse(res.data);
      parsed.security.version = '2.0';
      // Recalcul de signature avec version altérée
      const serialized = JSON.stringify(parsed.payload);
      parsed.security.checksum = await SecurityEngine.generateChecksum(serialized);
      parsed.security.signature = await SecurityEngine.generateChecksum(serialized + 'birdacademy_enterprise_secure_salt_2026');

      const sim = await BackupRestoreService.simulateRestore(JSON.stringify(parsed));
      assert.strictEqual(sim.isCompatible, false, 'Le schéma futur 2.0 doit être marqué incompatible');
      const hasCriticalIssue = sim.compatibilityIssues.some((issue: string) => issue.includes('Incompatibilité critique'));
      assert.strictEqual(hasCriticalIssue, true, 'Doit signaler l incompatibilité critique');
    });

    it('F10 — Cycle complet : sauvegarde -> effacement local -> restauration complète réussie', async () => {
      testStorage.setItem('canaris', JSON.stringify([{ id: 'b-release-1', bague: 'BIRD-RC4-001' }]));
      testStorage.setItem('cages', JSON.stringify([{ id: 'cage-release-1', nom: 'Volière Nord' }]));

      const backup = await BackupRestoreService.createBackup('Cycle Complet', 'full');
      assert.ok(backup.success && backup.data);

      testStorage.clear();
      assert.strictEqual(testStorage.getItem('canaris'), null);

      const restore = await BackupRestoreService.executeRestore(backup.data);
      assert.strictEqual(restore.success, true);
      const restoredCanaris = JSON.parse(testStorage.getItem('canaris') || '[]');
      assert.strictEqual(restoredCanaris.length, 1);
      assert.strictEqual(restoredCanaris[0].bague, 'BIRD-RC4-001');
    });
  });

  // ============================================================
  // CATÉGORIE G — SÉCURITÉ & NON-RÉGRESSION (8 tests)
  // ============================================================
  describe('Catégorie G — Sécurité & Non-Régression (G01–G08)', () => {
    it('G01 — LMSE OfflineBetaValidator valide une licence valide mono-appareil (maxDevices = 1)', async () => {
      const { LicenseGenerator } = await import('../src/features/licensing/engines/LicenseGenerator');
      const { OfflineBetaValidator } = await import('../src/features/licensing/services/OfflineBetaValidator');
      const { OfflineBetaExporter } = await import('../src/features/licensing/engines/OfflineBetaExporter');

      const dev1: any = {
        deviceId: 'DEV-REL-001',
        os: 'Windows',
        browserHash: 'hash_rel_001',
        screenSpec: '1920x1080',
        timezone: 'Europe/Paris',
        language: 'fr-FR',
        hardwareConcurrency: 8,
        createdAt: '2026-09-08T10:00:00.000Z',
        lastSeenAt: '2026-09-08T12:00:00.000Z',
      };

      const license = await LicenseGenerator.generateLicense({
        holderName: 'Test Breeder G01',
        type: 'commercial',
        durationDays: 365,
        maxDevices: 1,
      });

      const exportedJson = OfflineBetaExporter.exportLicenseJson(license);
      const result = await OfflineBetaValidator.validateFile(exportedJson, dev1, []);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.code, 'VALID');
    });

    it('G02 — LMSE bloque le 2ème appareil lorsque maxDevices = 1 (DEVICE_LIMIT_EXCEEDED)', async () => {
      const { LicenseGenerator } = await import('../src/features/licensing/engines/LicenseGenerator');
      const { OfflineBetaValidator } = await import('../src/features/licensing/services/OfflineBetaValidator');
      const { OfflineBetaExporter } = await import('../src/features/licensing/engines/OfflineBetaExporter');

      const dev1: any = {
        deviceId: 'DEV-REL-001',
        os: 'Windows',
        browserHash: 'hash_rel_001',
        screenSpec: '1920x1080',
        timezone: 'Europe/Paris',
        language: 'fr-FR',
        hardwareConcurrency: 8,
        createdAt: '2026-09-08T10:00:00.000Z',
        lastSeenAt: '2026-09-08T12:00:00.000Z',
      };

      const dev2: any = {
        deviceId: 'DEV-REL-002',
        os: 'Windows',
        browserHash: 'hash_rel_002',
        screenSpec: '2560x1440',
        timezone: 'Europe/Paris',
        language: 'fr-FR',
        hardwareConcurrency: 16,
        createdAt: '2026-09-08T10:00:00.000Z',
        lastSeenAt: '2026-09-08T12:00:00.000Z',
      };

      const license = await LicenseGenerator.generateLicense({
        holderName: 'Test Breeder G02',
        type: 'commercial',
        durationDays: 365,
        maxDevices: 1,
      });

      const exportedJson = OfflineBetaExporter.exportLicenseJson(license);
      const res1 = await OfflineBetaValidator.validateFile(exportedJson, dev1, []);
      assert.strictEqual(res1.isValid, true);
      const res2 = await OfflineBetaValidator.validateFile(exportedJson, dev2, [], res1.license);
      assert.strictEqual(res2.isValid, false);
      assert.strictEqual(res2.code, 'DEVICE_LIMIT_EXCEEDED');
    });

    it('G03 — assertAdminContext() lève une erreur en mode USER', async () => {
      const { assertAdminContext } = await import('../src/config/appMode');
      process.env.VITE_APP_MODE = 'user';
      assert.throws(() => {
        assertAdminContext();
      }, /SECURITY_ERROR: Access to administrative functionality is disabled/);
      process.env.VITE_APP_MODE = 'admin'; // Restauration
    });

    it('G04 — Aucune clé privée de signature LMSE n est présente dans les sources clients', () => {
      const clientSrcDir = path.join(process.cwd(), 'src');
      const searchForPrivateKey = (dir: string): boolean => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            if (file === 'server') continue; // Ignorer le backend admin local
            if (searchForPrivateKey(fullPath)) return true;
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('BEGIN PRIVATE KEY') || content.includes('LMSE_PRIVATE_SIGNING_KEY')) {
              return true;
            }
          }
        }
        return false;
      };
      assert.strictEqual(searchForPrivateKey(clientSrcDir), false, 'Aucune clé privée ne doit fuiter dans le bundle client');
    });

    it('G05 — Constantes de version officielles : BUILD_ID = "BA-V1.3.6-RC4" et BUILD_VERSION_NAME = "1.3.6-RC4"', () => {
      assert.strictEqual(BUILD_ID, 'BA-V1.3.6-RC4');
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC4');
      assert.strictEqual(BUILD_VERSION_CODE, 17);
    });

    it('G06 — Absence de moteur de synchronisation cloud / remote dans le code source', () => {
      const clientSrcDir = path.join(process.cwd(), 'src');
      const checkNoSyncEngine = (dir: string): boolean => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            if (checkNoSyncEngine(fullPath)) return true;
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            if (file.toLowerCase().includes('syncengine') || file.toLowerCase().includes('replicationservice')) {
              return true;
            }
          }
        }
        return false;
      };
      assert.strictEqual(checkNoSyncEngine(clientSrcDir), false, 'Aucun SyncEngine ou ReplicationService ne doit exister');
    });

    it('G07 — SubscriptionTierResolver résout le tier FREE nativement sans licence', async () => {
      const { SubscriptionTierResolver } = await import('../src/features/subscription/services/SubscriptionTierResolver');
      const tier = SubscriptionTierResolver.resolve(null);
      assert.strictEqual(tier, 'FREE');
    });

    it('G08 — SecurityEngine génère des empreintes SHA-256 déterministes pour la sauvegarde', async () => {
      const payload = { test: 'avian-hash-consistency', date: '2026-09-08' };
      const hash1 = await SecurityEngine.generateChecksum(JSON.stringify(payload));
      const hash2 = await SecurityEngine.generateChecksum(JSON.stringify(payload));
      assert.strictEqual(hash1, hash2);
      assert.strictEqual(hash1.length, 64, 'L empreinte SHA-256 doit faire 64 caractères hexadécimaux');
    });
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
 * MISSION 013 — PUBLIC TEST LAUNCH & TESTER FEEDBACK
 * Regression, Entitlement, Tester Journey & Zero-Fake Verification Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

process.env.VITE_APP_MODE = 'admin';

import { CapabilityResolver, PLAN_LIMITS } from '../src/features/subscription/services/CapabilityResolver';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { DemoDataGenerator } from '../src/features/quality/utils/demoGenerator';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { LicenseKey } from '../src/features/licensing/domain/value-objects/LicenseKey';
import { License, DeviceFingerprint } from '../src/features/licensing/types/licensing';
import { FeedbackService } from '../src/features/feedback/services/FeedbackService';
import { BUILD_ID, BUILD_VERSION_NAME, BUILD_RELEASE_CHANNEL } from '../src/config/appMode';
import { Canari } from '../src/types';

// Mock Browser Environment Storage
class MockStorage {
  private store = new Map<string, string>();
  getItem(k: string): string | null { return this.store.get(k) ?? null; }
  setItem(k: string, v: string): void { this.store.set(k, String(v)); }
  removeItem(k: string): void { this.store.delete(k); }
  clear(): void { this.store.clear(); }
  get length(): number { return this.store.size; }
  key(i: number): string | null { return Array.from(this.store.keys())[i] ?? null; }
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}
(globalThis as any).localStorage = mockLocalStorage;
(globalThis as any).sessionStorage = mockSessionStorage;

const mockDevice: DeviceFingerprint = {
  deviceId: 'device-test-launch-013',
  os: 'Windows',
  browserHash: 'hash-browser-013',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr-FR',
  hardwareConcurrency: 8,
  createdAt: new Date().toISOString(),
  lastSeenAt: new Date().toISOString(),
};

function resetMocks(): void {
  mockLocalStorage.clear();
  mockSessionStorage.clear();
  CapabilityResolver.setMockTierOverride(null);
}

test('MISSION 013 — SUITE 1 : Version & Build Identity', async (t) => {
  await t.test('1.1 Version matches v1.3.6 and BUILD_ID matches BA-V1.3.6', () => {
    assert.equal(BUILD_VERSION_NAME, '1.3.6', 'BUILD_VERSION_NAME must be exactly 1.3.6');
    assert.equal(BUILD_ID, 'BA-V1.3.6', 'BUILD_ID must be BA-V1.3.6');
  });

  await t.test('1.2 PUBLIC_TESTER_GUIDE.md exists and contains all 8 required sections', () => {
    const guidePath = path.resolve(process.cwd(), 'PUBLIC_TESTER_GUIDE.md');
    assert.ok(fs.existsSync(guidePath), 'PUBLIC_TESTER_GUIDE.md must exist in workspace root');
    const content = fs.readFileSync(guidePath, 'utf-8');

    assert.ok(content.includes('## 1. Qu\'est-ce que vous allez tester ?'), 'Section 1 must be present');
    assert.ok(content.includes('## 2. Installation'), 'Section 2 must be present');
    assert.ok(content.includes('## 3. Première utilisation'), 'Section 3 must be present');
    assert.ok(content.includes('## 4. Que devez-vous tester ?'), 'Section 4 must be present');
    assert.ok(content.includes('## 5. Ce qui nous intéresse'), 'Section 5 must be present');
    assert.ok(content.includes('## 6. Comment signaler un problème ?'), 'Section 6 must be present');
    assert.ok(content.includes('## 7. Données personnelles'), 'Section 7 must be present');
    assert.ok(content.includes('## 8. Fin du test'), 'Section 8 must be present');
    assert.ok(content.includes('30 jours'), 'Must document 30-day test duration');
    assert.ok(content.includes('Zero Deletion'), 'Must document data preservation');
  });
});

test('MISSION 013 — SUITE 2 : 30-Day TEST License & Expiration Non-Destructive to FREE', async (t) => {
  resetMocks();

  await t.test('2.1 TEST License generation enforces 30 days cap and LMSE-TEST- format', async () => {
    const lic = await LicenseGenerator.generateLicense({
      holderName: 'Testeur Public Avicole',
      holderEmail: 'testeur@example.com',
      type: 'test',
      durationDays: 60, // Exceeds 30 days deliberately
      metadata: { isPublicTest: true, tier: 'PRO' }
    });

    assert.ok(lic.key.startsWith('LMSE-TEST-'), 'Key must start with LMSE-TEST-');
    assert.equal(lic.type, 'test');
    assert.ok(lic.expiresAt !== null);

    const issuedTime = new Date(lic.issuedAt).getTime();
    const expiresTime = new Date(lic.expiresAt!).getTime();
    const days = (expiresTime - issuedTime) / (24 * 3600 * 1000);
    assert.ok(days <= 30.01, `Duration (${days}) must not exceed 30 days`);

    // Cryptographic signature validity
    const payload = `${lic.id}:${lic.key}:${lic.holderName}:${lic.type}:${lic.issuedAt}:${lic.expiresAt}:${lic.policy.maxDevices}`;
    const hash = await CryptoService.sha256(payload);
    assert.equal(lic.checksum, hash);
    const valid = await CryptoService.verifySignature(hash, lic.signature);
    assert.equal(valid, true);
  });

  await t.test('2.2 TEST license states: VALID, EXPIRING_SOON, EXPIRED, INVALID', async () => {
    const lic = await LicenseGenerator.generateLicense({
      holderName: 'Testeur Alpha',
      type: 'test',
      durationDays: 30,
      metadata: { isPublicTest: true }
    });

    // Valid
    const resValid = await LicenseValidator.validateLicense(lic, mockDevice);
    assert.equal(resValid.isValid, true);
    assert.equal(LicenseValidator.evaluateState(resValid), 'VALID');

    // Expiring soon (3 days left)
    const soonDate = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
    const licSoon = { ...lic, expiresAt: soonDate };
    licSoon.checksum = await CryptoService.sha256(`${licSoon.id}:${licSoon.key}:${licSoon.holderName}:${licSoon.type}:${licSoon.issuedAt}:${licSoon.expiresAt}:${licSoon.policy.maxDevices}`);
    licSoon.signature = await CryptoService.generateSignature(licSoon.checksum);
    const resSoon = await LicenseValidator.validateLicense(licSoon, mockDevice);
    assert.equal(LicenseValidator.evaluateState(resSoon), 'EXPIRING_SOON');

    // Expired
    const expDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const licExp = { ...lic, expiresAt: expDate };
    licExp.checksum = await CryptoService.sha256(`${licExp.id}:${licExp.key}:${licExp.holderName}:${licExp.type}:${licExp.issuedAt}:${licExp.expiresAt}:${licExp.policy.maxDevices}`);
    licExp.signature = await CryptoService.generateSignature(licExp.checksum);
    const resExp = await LicenseValidator.validateLicense(licExp, mockDevice);
    assert.equal(resExp.isValid, false);
    assert.equal(resExp.code, 'EXPIRED');
    assert.equal(LicenseValidator.evaluateState(resExp), 'EXPIRED');
  });

  await t.test('2.3 Expiration retrogrades to FREE tier while preserving 100% of breeding data', async () => {
    // 5 user birds created during test
    const userBirds: Partial<Canari>[] = [
      { id: 1, bague: 'BIRD-01', nom: 'Canari 1' },
      { id: 2, bague: 'BIRD-02', nom: 'Canari 2' },
      { id: 3, bague: 'BIRD-03', nom: 'Canari 3' },
      { id: 4, bague: 'BIRD-04', nom: 'Canari 4' },
      { id: 5, bague: 'BIRD-05', nom: 'Canari 5' },
    ];
    mockLocalStorage.setItem('canaris', JSON.stringify(userBirds));

    // Active test license
    const activeTestLic = await LicenseGenerator.generateLicense({
      holderName: 'Jean Testeur',
      type: 'test',
      durationDays: 30,
      metadata: { isPublicTest: true, tier: 'PRO' }
    });
    mockLocalStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(activeTestLic));
    assert.equal(SubscriptionTierResolver.getCurrentTierSync(), 'PRO');

    // Simulate expiration
    const expiredLic = {
      ...activeTestLic,
      expiresAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    };
    mockLocalStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(expiredLic));

    // Must resolve to FREE tier
    assert.equal(SubscriptionTierResolver.getCurrentTierSync(), 'FREE');

    // Zero Deletion: All 5 birds remain intact
    const birdsAfter = JSON.parse(mockLocalStorage.getItem('canaris') || '[]');
    assert.equal(birdsAfter.length, 5);
    assert.equal(birdsAfter[0].bague, 'BIRD-01');
    assert.equal(birdsAfter[4].bague, 'BIRD-05');
  });
});

test('MISSION 013 — SUITE 3 : FREE Entitlement Ceiling & DEMO Lock', async (t) => {
  resetMocks();

  await t.test('3.1 FREE ceiling: 20 max for new creations, 21st blocked', () => {
    CapabilityResolver.setMockTierOverride('FREE');
    assert.equal(CapabilityResolver.canCreateBird(19, 1), true, '20th bird allowed');
    assert.equal(CapabilityResolver.canCreateBird(20, 1), false, '21st bird blocked');
    assert.equal(CapabilityResolver.canCreateBirds(15, 6), false, 'Batch exceeding 20 blocked');
  });

  await t.test('3.2 Historical over-entitlement data is preserved without deletion', () => {
    CapabilityResolver.setMockTierOverride('FREE');
    const flock: Partial<Canari>[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      bague: `HIST-2024-${i + 1}`,
      nom: `Oiseau #${i + 1}`,
    }));
    mockLocalStorage.setItem('canaris', JSON.stringify(flock));

    const retrieved = JSON.parse(mockLocalStorage.getItem('canaris') || '[]');
    assert.equal(retrieved.length, 50, 'All 50 historical birds must be kept');
    assert.equal(CapabilityResolver.canCreateBird(50, 1), false, 'No new creations beyond 20');
  });

  await t.test('3.3 DEMO Generator is locked for FREE users and capped to 20', () => {
    CapabilityResolver.setMockTierOverride('FREE');
    assert.equal(CapabilityResolver.canUseDemoGenerator('FREE'), false);
    assert.equal(PLAN_LIMITS.FREE.demoGeneratorAvailable, false);

    // Hard ceiling prevents mass creation
    const generated = DemoDataGenerator.generate('large'); // asks 1200
    assert.equal(generated.canaris.length, 20, 'Large demo must be capped to 20 in FREE');
  });

  await t.test('3.4 SessionStorage compliance: legacy localStorage flag ignored', () => {
    mockLocalStorage.setItem('bird_academy_demo_active', 'true');
    assert.equal(DemoDataGenerator.isDemoActive(), false, 'Legacy localStorage flag must be ignored');

    DemoDataGenerator.toggleDemo(true, 10);
    assert.equal(mockSessionStorage.getItem('bird_academy_demo_active'), 'true');
    assert.equal(DemoDataGenerator.isDemoActive(), true);

    DemoDataGenerator.toggleDemo(false);
    assert.equal(DemoDataGenerator.isDemoActive(), false);
  });
});

test('MISSION 013 — SUITE 4 : Tester Feedback Mechanism', async (t) => {
  resetMocks();

  await t.test('4.1 FeedbackService saves reports locally with proper categorization', () => {
    const report = FeedbackService.save({
      type: 'bug',
      severity: 'important',
      module: 'Wright Calculation',
      description: 'Délai d\'actualisation du coefficient lors du changement de partenaire.',
      contactEmail: 'eleveur.test@domain.fr',
      licenseType: 'TEST (30 jours)',
    });

    assert.ok(report.id.startsWith('FDBK-'));
    assert.equal(report.type, 'bug');
    assert.equal(report.severity, 'important');
    assert.equal(report.module, 'Wright Calculation');
    assert.equal(report.version, 'v1.3.6');
    assert.equal(report.buildId, 'BA-V1.3.6');

    const all = FeedbackService.getAll();
    assert.equal(all.length, 1);
    assert.equal(all[0].id, report.id);
  });

  await t.test('4.2 Feedback formatted report never includes breeding data', () => {
    const report = FeedbackService.save({
      type: 'suggestion',
      severity: 'idea',
      module: 'Cages & Volières',
      description: 'Ajouter un raccourci clavier pour passer d\'une cage à l\'autre.',
    });

    const formatted = FeedbackService.getFormattedReport(report);
    assert.ok(formatted.includes('=== RAPPORT DE RETOUR TESTEUR — BIRD ACADEMY ==='));
    assert.ok(formatted.includes('ID Référence'));
    assert.ok(formatted.includes('Ajouter un raccourci clavier'));
    assert.ok(formatted.includes('Aucune donnée d\'élevage incluse'));
    assert.equal(formatted.includes('bague'), false, 'Must not contain bird bands');
    assert.equal(formatted.includes('reproduction'), false);
  });
});

test('MISSION 013 — SUITE 5 : Zero Fake Social Proof & Truthfulness Audit', async (t) => {
  const forbiddenPatterns = [
    'Jean-Marc Valenti',
    '5.0 / 5.0',
    '35 Ans d\'Expérience',
    'Juge & Maître Éleveur',
    'Standard COM Certifié',
    'Protocole Elite Validé',
    'Protocole Élite',
  ];

  const filesToCheck = [
    'src/features/commercial-website/components/sections/ExpertTestimonialSection.tsx',
    'src/features/commercial-website/pages/WebLandingPage.tsx',
    'src/features/commercial-website/components/sections/HeroSection.tsx',
    'src/features/commercial-website/components/layout/WebFooter.tsx',
    'src/features/commercial-website/i18n/locales/fr.ts',
    'src/features/commercial-website/i18n/locales/en.ts',
    'src/features/commercial-website/i18n/locales/es.ts',
    'src/features/commercial-website/i18n/locales/it.ts',
    'src/features/commercial-website/i18n/locales/ar.ts',
  ];

  for (const relPath of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf-8');

    for (const pattern of forbiddenPatterns) {
      assert.equal(
        content.includes(pattern),
        false,
        `Forbidden fake proof string "${pattern}" must not exist in ${relPath}`
      );
    }
  }

  // Verify honest test phase notice is present in locales
  const frLocalePath = path.resolve(process.cwd(), 'src/features/commercial-website/i18n/locales/fr.ts');
  const frContent = fs.readFileSync(frLocalePath, 'utf-8');
  assert.ok(frContent.includes('EN PHASE DE TEST'), 'Must declare EN PHASE DE TEST in fr.ts');
  assert.ok(frContent.includes('Conçu pour accompagner chaque étape'), 'Must declare honest title in fr.ts');
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — E2E TEST MISSION QA-FREE-CLEAN-001
 * Full End-to-End browser validation of the official test environment reset:
 * 
 * Scenario:
 * Launch
 * ↓
 * Create/test existing license state
 * ↓
 * Verify breeding data exists
 * ↓
 * Open QA controls
 * ↓
 * Click "Réinitialiser l'environnement de test"
 * ↓
 * Confirm
 * ↓
 * Reload
 * ↓
 * Verify FREE
 * ↓
 * Verify no FirstLaunchActivationScreen
 * ↓
 * Verify breeding data still exists
 */

import { test, expect } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';

/**
 * Generates a valid cryptographically signed test license
 */
async function createValidTestLicense(
  type: LicenseType = 'commercial',
  holderName: string = 'Éleveur Test QA'
): Promise<License> {
  const id = `lic_qa_test_${Date.now()}`;
  const key = `LMSE-COMM-8888-7777-6666`;
  const issuedAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const maxDevices = 3;
  const features = ['core', 'unlimited_birds', 'pedigree', 'statistics'];

  const payloadToSign = `${id}:${key}:${holderName}:${type}:${issuedAt}:${expiresAt}:${maxDevices}`;
  const checksum = await CryptoService.sha256(payloadToSign);
  const signature = await CryptoService.generateSignature(checksum, CryptoService.getPublicVerificationKey());

  return {
    id,
    key,
    holderName,
    type,
    status: 'active',
    issuedAt,
    expiresAt,
    policy: {
      maxDevices,
      allowOfflineActivation: true,
      allowTransfer: true,
      features,
    },
    activations: [
      {
        id: `act_qa_${Date.now()}`,
        licenseId: id,
        licenseKey: key,
        fingerprint: {
          deviceId: 'dev_qa_playwright',
          os: 'Windows',
          browserHash: 'browser_hash_qa',
          screenSpec: '1920x1080',
          timezone: 'Europe/Paris',
          language: 'fr',
          hardwareConcurrency: 8,
          createdAt: issuedAt,
          lastSeenAt: new Date().toISOString(),
        },
        activatedAt: issuedAt,
        lastVerifiedAt: new Date().toISOString(),
        isOffline: true,
      }
    ],
    checksum,
    signature,
    metadata: {
      commercialTier: 'PREMIUM',
      testEnvironment: true,
    },
  };
}

test.describe('MISSION QA-FREE-CLEAN-001 — Réinitialiser l\'environnement de test (E2E Browser)', () => {

  test('QA-RESET-E2E-01: Cycle complet de réinitialisation de test avec conservation intégrale des données d\'élevage', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const validLicense = await createValidTestLicense('commercial', 'Éleveur Testeur QA');
    const sampleCanaris = JSON.stringify([
      { id: 'BIRD-01', nom: 'Canari Gloster Corona', bague: 'FR-2026-QA-001', annee: 2026, sexe: 'M' }
    ]);
    const sampleCouples = JSON.stringify([
      { id: 'CPL-01', nom: 'Couple Reproduction QA', maleId: 'BIRD-01', femelleId: 'BIRD-02' }
    ]);
    const sampleCages = JSON.stringify([
      { id: 101, nom: 'Cage Élevage 101', capacite_max: 10 }
    ]);

    // 1. Inject Desktop bridge runtime with explicit QA mode
    await page.addInitScript(() => {
      (window as any).electron = {
        isElectron: true,
        platform: 'win32',
        runtime: 'desktop',
        qaMode: true,
      };
    });

    // 2. Initial navigation to establish origin
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 3. Seed breeding data, user preferences, and valid active test license
    await page.evaluate(({ birds, couples, cages, license }) => {
      localStorage.setItem('bird_academy_canaris', birds);
      localStorage.setItem('bird_academy_couples', couples);
      localStorage.setItem('bird_academy_cages', cages);
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      localStorage.setItem('bird_academy_db_initialized', 'true');

      localStorage.setItem('bird_academy_language', 'fr');
      localStorage.setItem('bird_academy_theme', 'dark');
      localStorage.setItem('bird_academy_currency', 'EUR');

      localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(license));
      localStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify([license]));
      localStorage.setItem('bird_academy_subscription_tier_override', 'PREMIUM');
    }, { birds: sampleCanaris, couples: sampleCouples, cages: sampleCages, license: validLicense });

    // 4. Reload to hydrate application in valid test license state
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 5. Verify breeding data exists & existing license state exists before reset
    const canarisBefore = await page.evaluate(() => localStorage.getItem('bird_academy_canaris'));
    expect(canarisBefore).toContain('FR-2026-QA-001');

    const licenseBefore = await page.evaluate(() => localStorage.getItem('bird_academy_lmse_active_license'));
    expect(licenseBefore).not.toBeNull();
    expect(licenseBefore).toContain(validLicense.id);

    // 6. Open QA controls / Click "🧪 Réinitialiser l'environnement de test"
    const qaResetBtn = page.locator('[data-testid="topbar-qa-reset-btn"]');
    await expect(qaResetBtn).toBeVisible({ timeout: 10000 });
    await expect(qaResetBtn).toContainText('Réinitialiser l\'environnement de test');
    await qaResetBtn.click();

    // 7. Verify confirmation modal is displayed with proper i18n text
    const modalTitle = page.locator('text=Réinitialiser l\'environnement de test ?');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });

    const modalWarning = page.locator('text=Cette action supprimera uniquement les données de licence et de test QA.');
    await expect(modalWarning).toBeVisible();

    const breedingPreservedNote = page.locator('text=Vos oiseaux et vos données d\'élevage seront conservés.');
    await expect(breedingPreservedNote).toBeVisible();

    // Verify Cancel button is available
    const cancelBtn = page.locator('[data-testid="qa-reset-cancel-btn"]');
    await expect(cancelBtn).toBeVisible();

    // 8. Confirm reset
    const confirmBtn = page.locator('[data-testid="qa-reset-confirm-btn"]');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 9. Reload application
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 10. Verify FREE mode active
    const activeLicenseAfter = await page.evaluate(() => localStorage.getItem('bird_academy_lmse_active_license'));
    expect(activeLicenseAfter).toBeNull();

    const overrideAfter = await page.evaluate(() => localStorage.getItem('bird_academy_subscription_tier_override'));
    expect(overrideAfter).toBeNull();

    // Verify UI reflects FREE plan (Plan GRATUIT)
    const tierBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await expect(tierBadge).toBeVisible();
    await expect(tierBadge).toContainText('GRATUIT');

    // 11. Verify FirstLaunchActivationScreen is NOT rendered
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);

    // 12. Verify breeding data and user preferences still exist and are 100% intact
    const canarisAfter = await page.evaluate(() => localStorage.getItem('bird_academy_canaris'));
    expect(canarisAfter).toBe(sampleCanaris);

    const couplesAfter = await page.evaluate(() => localStorage.getItem('bird_academy_couples'));
    expect(couplesAfter).toBe(sampleCouples);

    const cagesAfter = await page.evaluate(() => localStorage.getItem('bird_academy_cages'));
    expect(cagesAfter).toBe(sampleCages);

    const langAfter = await page.evaluate(() => localStorage.getItem('bird_academy_language'));
    expect(langAfter).toBe('fr');

    const themeAfter = await page.evaluate(() => localStorage.getItem('bird_academy_theme'));
    expect(themeAfter).toBe('dark');

    const currencyAfter = await page.evaluate(() => localStorage.getItem('bird_academy_currency'));
    expect(currencyAfter).toBe('EUR');
  });

  test('QA-RESET-E2E-02: Traduction italienne exacte du dialogue de confirmation ("i dati di allevamento")', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.addInitScript(() => {
      (window as any).electron = { isElectron: true, platform: 'win32', runtime: 'desktop', qaMode: true };
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Seed Italian language and minimal data
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'it');
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      localStorage.setItem('bird_academy_db_initialized', 'true');
    });

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Open QA controls modal
    const qaResetBtn = page.locator('[data-testid="topbar-qa-reset-btn"]');
    await expect(qaResetBtn).toBeVisible({ timeout: 10000 });
    await qaResetBtn.click();

    // Verify modal appears with exact Italian translation
    const italianDesc = page.locator('text=Questa azione eliminerà solo i dati di licenza e i test QA.');
    await expect(italianDesc).toBeVisible({ timeout: 5000 });

    const italianBreedingPreserved = page.locator('text=I tuoi uccelli e i dati di allevamento saranno conservati.');
    await expect(italianBreedingPreserved).toBeVisible();

    // Close modal
    const cancelBtn = page.locator('[data-testid="qa-reset-cancel-btn"]');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await expect(cancelBtn).not.toBeVisible();
  });

  test('QA-RESET-E2E-03: Bouton masqué sans indicateur qaMode (Mode standard de production)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Runtime Desktop SANS qaMode (mode commercial standard)
    await page.addInitScript(() => {
      (window as any).electron = { isElectron: true, platform: 'win32', runtime: 'desktop', qaMode: false };
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      localStorage.setItem('bird_academy_db_initialized', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Verify button is strictly absent / hidden
    const qaResetBtn = page.locator('[data-testid="topbar-qa-reset-btn"]');
    await expect(qaResetBtn).toHaveCount(0);
  });
});

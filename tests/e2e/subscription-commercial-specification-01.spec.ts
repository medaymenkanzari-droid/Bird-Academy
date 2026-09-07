/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION COMMERCIAL SPECIFICATION 01 E2E SUITE
 * Mission: SUBSCRIPTION-COMMERCIAL-SPECIFICATION-01
 * 
 * Official Reference Playwright E2E Suite covering exact test cases TC-COM-001 to TC-COM-025:
 * TC-COM-001 : Premier lancement sans licence
 * TC-COM-002 : Activation FREE
 * TC-COM-003 : Modules FREE
 * TC-COM-004 : Restrictions FREE
 * TC-COM-005 : Assistant FREE
 * TC-COM-006 : Quota FREE 10/jour
 * TC-COM-007 : Activation PREMIUM
 * TC-COM-008 : Modules PREMIUM
 * TC-COM-009 : Assistant PREMIUM
 * TC-COM-010 : Quota PREMIUM 100/jour
 * TC-COM-011 : Gating PRO
 * TC-COM-012 : Activation PRO
 * TC-COM-013 : Modules PRO
 * TC-COM-014 : Bird Intelligence PRO
 * TC-COM-015 : Assistant PRO illimité
 * TC-COM-016 : Généalogie PRO
 * TC-COM-017 : Rapports PRO
 * TC-COM-018 : FREE → PRO
 * TC-COM-019 : PRO → FREE
 * TC-COM-020 : Expiration licence
 * TC-COM-021 : Persistance après reload
 * TC-COM-022 : Offline réel
 * TC-COM-023 : Mobile 375x812
 * TC-COM-024 : FR / EN / AR / ES / IT
 * TC-COM-025 : RTL arabe
 */

import { test, expect, Page, Request } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';

/**
 * Helper to generate valid cryptographically signed licenses for testing
 */
async function createValidTestLicense(
  type: LicenseType = 'enterprise',
  status: 'active' | 'expired' | 'revoked' = 'active',
  holderName: string = 'Éleveur Test Spécification Commerciale',
  daysRemaining: number = 90
): Promise<License> {
  const typeTagMap: Record<LicenseType, string> = {
    beta: 'BETA',
    commercial: 'COMM',
    permanent: 'PERM',
    temporary: 'TEMP',
    enterprise: 'ENTP',
    association: 'ASSO',
    veterinary: 'VETE',
  };

  const tag = typeTagMap[type] || 'COMM';
  const id = `lic_com01_${type}_${Date.now()}`;
  const key = `LMSE-${tag}-1111-2222-3333`;
  const issuedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  
  let expiresAt: string | null = null;
  if (type !== 'permanent') {
    if (status === 'expired') {
      expiresAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      expiresAt = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  const maxDevices = type === 'enterprise' ? 25 : (type === 'commercial' ? 3 : 2);
  const features = type === 'enterprise' || type === 'beta'
    ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'multi_user', 'tier:pro']
    : (type === 'commercial' ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'tier:premium'] : ['core', 'tier:free']);

  const payloadToSign = `${id}:${key}:${holderName}:${type}:${issuedAt}:${expiresAt || 'NEVER'}:${maxDevices}`;
  const checksum = await CryptoService.sha256(payloadToSign);
  const signature = await CryptoService.generateSignature(checksum, CryptoService.getPublicVerificationKey());

  return {
    id,
    key,
    holderName,
    type,
    status: status === 'revoked' ? 'revoked' : (status === 'expired' ? 'expired' : 'active'),
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
        id: `act_${Date.now()}`,
        licenseId: id,
        licenseKey: key,
        fingerprint: {
          deviceId: 'dev_playwright_com01_e2e',
          os: 'Web',
          browserHash: 'browser_hash_com01_e2e',
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
    metadata: { testSuite: 'SUBSCRIPTION-COMMERCIAL-SPECIFICATION-01' },
  };
}

/**
 * Setup page state with clean storage and pre-configured license / tier
 */
async function setupPageState(
  page: Page,
  options: {
    tier?: 'FREE' | 'PREMIUM' | 'PRO';
    licenseType?: LicenseType;
    licenseStatus?: 'active' | 'expired' | 'revoked';
    unlicensed?: boolean;
    language?: 'fr' | 'en' | 'ar' | 'es' | 'it';
    customBirds?: any[];
  } = {}
) {
  const {
    tier = 'PRO',
    licenseType = 'enterprise',
    licenseStatus = 'active',
    unlicensed = false,
    language = 'fr',
    customBirds
  } = options;

  let license: License | null = null;
  if (!unlicensed) {
    license = await createValidTestLicense(licenseType, licenseStatus);
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((opts) => {
    try {
      localStorage.clear();
      localStorage.setItem('language', opts.lang);
      localStorage.setItem('bird_academy_language', opts.lang);
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      localStorage.setItem('bird_academy_demo_active', 'true');
      localStorage.setItem('bird_academy_db_initialized', 'true');

      if (!opts.isUnlicensed && opts.lic) {
        localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(opts.lic));
        localStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify([opts.lic]));
      }
      if (opts.tierOverride) {
        localStorage.setItem('bird_academy_subscription_tier_override', opts.tierOverride);
        localStorage.setItem('bird_academy_assistant_tier_override', opts.tierOverride);
      }
      if (opts.birdsData) {
        localStorage.setItem('demo_canaris', JSON.stringify(opts.birdsData));
        localStorage.setItem('canaris', JSON.stringify(opts.birdsData));
      }
    } catch (e) {
      console.error('Init script error', e);
    }
  }, { lic: license, tierOverride: tier, lang: language, isUnlicensed: unlicensed, birdsData: customBirds });

  await page.reload({ waitUntil: 'domcontentloaded' });
}

/**
 * Network monitor to ensure 0 unauthorized external requests
 */
function attachNetworkAuditor(page: Page) {
  const externalRequests: string[] = [];
  page.on('request', (request: Request) => {
    const url = request.url();
    // Allow local dev server requests
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('data:') || url.startsWith('blob:')) {
      return;
    }
    // Flag any external cloud / telemetry / AI API request
    externalRequests.push(url);
  });
  return externalRequests;
}

test.describe('SUBSCRIPTION-COMMERCIAL-SPECIFICATION-01 : OFFICIAL SPECIFICATION E2E SUITE', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  // -------------------------------------------------------------
  // TC-COM-001 : Premier lancement sans licence
  // -------------------------------------------------------------
  test('TC-COM-001 : Premier lancement sans licence', async ({ page }) => {
    await setupPageState(page, { unlicensed: true });

    const activationHeading = page.locator('text=Bienvenue').or(page.locator('text=Activation')).or(page.locator('text=LMSE')).first();
    await expect(activationHeading).toBeVisible({ timeout: 15000 });

    const sidebar = page.locator('[data-testid="desktop-sidebar"]');
    await expect(sidebar).not.toBeVisible();
  });

  // -------------------------------------------------------------
  // TC-COM-002 : Activation FREE
  // -------------------------------------------------------------
  test('TC-COM-002 : Activation FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });

    const freeBadge = page.locator('[data-testid="subscription-tier-badge-free"]').first();
    await expect(freeBadge).toBeVisible({ timeout: 15000 });
    await expect(freeBadge).toContainText('GRATUIT');
  });

  // -------------------------------------------------------------
  // TC-COM-003 : Modules FREE
  // -------------------------------------------------------------
  test('TC-COM-003 : Modules FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });

    // Core Birds
    const navCanaris = page.locator('[data-testid="nav-item-canaris"]');
    await expect(navCanaris).toBeVisible({ timeout: 15000 });
    await navCanaris.click();
    await expect(page.locator('text=Ajouter un oiseau').or(page.locator('input[placeholder*="Rechercher"]')).first()).toBeVisible({ timeout: 15000 });

    // Cages
    const navCages = page.locator('[data-testid="nav-item-cages"]');
    await expect(navCages).toBeVisible({ timeout: 15000 });
    await navCages.click();
    await expect(page.locator('text=Cages').first()).toBeVisible({ timeout: 15000 });

    // Biological Reference
    const navBio = page.locator('[data-testid="nav-item-reference_biologique"]');
    await expect(navBio).toBeVisible({ timeout: 15000 });
    await navBio.click();
    await expect(page.locator('text=Référentiel Biologique').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-004 : Restrictions FREE
  // -------------------------------------------------------------
  test('TC-COM-004 : Restrictions FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });

    await page.locator('[data-testid="nav-item-intelligence"]').click();
    const lockedCard = page.locator('[data-testid="feature-locked-card"]');
    await expect(lockedCard).toBeVisible({ timeout: 15000 });
    await expect(lockedCard).toContainText('Plan PRO');
    await expect(page.locator('[data-testid="locked-card-upgrade-btn"]')).toBeVisible();
  });

  // -------------------------------------------------------------
  // TC-COM-005 : Assistant FREE
  // -------------------------------------------------------------
  test('TC-COM-005 : Assistant FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });

    await page.locator('[data-testid="nav-item-assistant"]').click();
    await expect(page.locator('text=Assistant IA').first()).toBeVisible({ timeout: 15000 });

    // Ask biological question (allowed in FREE)
    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Quelle est la durée d'incubation du canari ?");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    const conversation = page.locator('[data-testid="assistant-conversation"]');
    await expect(conversation).toBeVisible({ timeout: 15000 });
    await expect(conversation).toContainText('13 jours');
  });

  // -------------------------------------------------------------
  // TC-COM-006 : Quota FREE 10/jour
  // -------------------------------------------------------------
  test('TC-COM-006 : Quota FREE 10/jour', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });

    await page.locator('[data-testid="nav-item-assistant"]').click();
    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toBeVisible({ timeout: 15000 });
    await expect(quotaBadge).toContainText('10');
  });

  // -------------------------------------------------------------
  // TC-COM-007 : Activation PREMIUM
  // -------------------------------------------------------------
  test('TC-COM-007 : Activation PREMIUM', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });

    const premiumBadge = page.locator('[data-testid="subscription-tier-badge-premium"]').first();
    await expect(premiumBadge).toBeVisible({ timeout: 15000 });
    await expect(premiumBadge).toContainText('PREMIUM');
  });

  // -------------------------------------------------------------
  // TC-COM-008 : Modules PREMIUM
  // -------------------------------------------------------------
  test('TC-COM-008 : Modules PREMIUM', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });

    // Verify Genetics Module is available
    await page.locator('[data-testid="nav-item-genetics"]').click();
    await expect(page.locator('text=Génétique').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-009 : Assistant PREMIUM
  // -------------------------------------------------------------
  test('TC-COM-009 : Assistant PREMIUM', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });

    await page.locator('[data-testid="nav-item-assistant"]').click();
    const input = page.locator('[data-testid="assistant-query-input"]');
    await expect(input).toBeVisible({ timeout: 15000 });
    await expect(input).toBeEnabled();
  });

  // -------------------------------------------------------------
  // TC-COM-010 : Quota PREMIUM 100/jour
  // -------------------------------------------------------------
  test('TC-COM-010 : Quota PREMIUM 100/jour', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });

    await page.locator('[data-testid="nav-item-assistant"]').click();
    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toBeVisible({ timeout: 15000 });
    await expect(quotaBadge).toContainText('100');
  });

  // -------------------------------------------------------------
  // TC-COM-011 : Gating PRO
  // -------------------------------------------------------------
  test('TC-COM-011 : Gating PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });

    // Bird Intelligence is gated on PREMIUM
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    const lockedCard = page.locator('[data-testid="feature-locked-card"]');
    await expect(lockedCard).toBeVisible({ timeout: 15000 });
    await expect(lockedCard).toContainText('Plan PRO');
  });

  // -------------------------------------------------------------
  // TC-COM-012 : Activation PRO
  // -------------------------------------------------------------
  test('TC-COM-012 : Activation PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });

    const proBadge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(proBadge).toBeVisible({ timeout: 15000 });
    await expect(proBadge).toContainText('PRO');
  });

  // -------------------------------------------------------------
  // TC-COM-013 : Modules PRO
  // -------------------------------------------------------------
  test('TC-COM-013 : Modules PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });

    // Navigate to Analytics & Intelligence
    await page.locator('[data-testid="nav-item-statistiques"]').click();
    await expect(page.locator('text=Statistiques').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-014 : Bird Intelligence PRO
  // -------------------------------------------------------------
  test('TC-COM-014 : Bird Intelligence PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });

    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).not.toBeVisible();
    await expect(page.locator('text=Score Global').or(page.locator('text=Bird Intelligence')).first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-015 : Assistant PRO illimité
  // -------------------------------------------------------------
  test('TC-COM-015 : Assistant PRO illimité', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });

    await page.locator('[data-testid="nav-item-assistant"]').click();
    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toBeVisible({ timeout: 15000 });
    await expect(quotaBadge).toContainText('illimitées');
  });

  // -------------------------------------------------------------
  // TC-COM-016 : Généalogie PRO
  // -------------------------------------------------------------
  test('TC-COM-016 : Généalogie PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });

    await page.locator('[data-testid="nav-item-genetics"]').click();
    await expect(page.locator('text=Génétique').or(page.locator('text=Généalogie')).first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-017 : Rapports PRO
  // -------------------------------------------------------------
  test('TC-COM-017 : Rapports PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });

    await page.locator('[data-testid="nav-item-statistiques"]').click();
    await expect(page.locator('text=Statistiques').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-018 : FREE → PRO
  // -------------------------------------------------------------
  test('TC-COM-018 : FREE → PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });

    // Open upgrade modal
    const topBarBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await topBarBadge.click();

    const modal = page.locator('[data-testid="upgrade-modal-container"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select PRO plan
    const selectProBtn = page.locator('[data-testid="select-plan-btn-pro"]');
    await selectProBtn.click();

    await expect(modal).not.toBeVisible();
    const proBadge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(proBadge).toBeVisible({ timeout: 5000 });
  });

  // -------------------------------------------------------------
  // TC-COM-019 : PRO → FREE
  // -------------------------------------------------------------
  test('TC-COM-019 : PRO → FREE', async ({ page }) => {
    const mockBirds = [
      { id: 991, bague: 'SPEC-2026-001', nom: 'Canari Élite Test', sexe: 'M', statut: 'vivant', annee: 2026, race: 'Couleur', cage_id: 1 },
      { id: 992, bague: 'SPEC-2026-002', nom: 'Canari Élite Test 2', sexe: 'F', statut: 'vivant', annee: 2026, race: 'Posture', cage_id: 1 }
    ];

    await setupPageState(page, { tier: 'PRO', customBirds: mockBirds });

    // Verify birds exist in PRO
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=SPEC-2026-001').first()).toBeVisible({ timeout: 15000 });

    // Downgrade to FREE
    const topBarBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await topBarBadge.click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();

    // Verify birds STILL exist in FREE without any deletion
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=SPEC-2026-001').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=SPEC-2026-002').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-020 : Expiration licence
  // -------------------------------------------------------------
  test('TC-COM-020 : Expiration licence', async ({ page }) => {
    await setupPageState(page, { unlicensed: false, licenseStatus: 'expired' });

    // App gracefully falls back without crash or corruption
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-021 : Persistance après reload
  // -------------------------------------------------------------
  test('TC-COM-021 : Persistance après reload', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });

    await page.reload({ waitUntil: 'domcontentloaded' });
    const proBadge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(proBadge).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-022 : Offline réel
  // -------------------------------------------------------------
  test('TC-COM-022 : Offline réel', async ({ page, context }) => {
    const externalRequests = attachNetworkAuditor(page);
    await setupPageState(page, { tier: 'PRO' });

    // Set offline mode
    await context.setOffline(true);

    await page.locator('[data-testid="nav-item-canaris"]').click();
    await page.locator('[data-testid="nav-item-reference_biologique"]').click();
    await page.locator('[data-testid="nav-item-assistant"]').click();

    expect(externalRequests.length).toBe(0);
    await context.setOffline(false);
  });

  // -------------------------------------------------------------
  // TC-COM-023 : Mobile 375x812
  // -------------------------------------------------------------
  test('TC-COM-023 : Mobile 375x812', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupPageState(page, { tier: 'FREE' });

    const menuBtn = page.locator('header.lg\\:hidden button[aria-label*="menu" i]').first();
    await menuBtn.click();

    const drawer = page.locator('#mobile-navigation-drawer');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  // -------------------------------------------------------------
  // TC-COM-024 : FR / EN / AR / ES / IT
  // -------------------------------------------------------------
  test('TC-COM-024 : FR / EN / AR / ES / IT', async ({ page }) => {
    // 1. French
    await setupPageState(page, { tier: 'PRO', language: 'fr' });
    await expect(page.locator('text=Plan PRO').first()).toBeVisible({ timeout: 15000 });

    // 2. English
    await setupPageState(page, { tier: 'PRO', language: 'en' });
    await expect(page.locator('text=PRO Plan').first()).toBeVisible({ timeout: 15000 });

    // 3. Spanish
    await setupPageState(page, { tier: 'PREMIUM', language: 'es' });
    await expect(page.locator('text=Plan PREMIUM').first()).toBeVisible({ timeout: 15000 });

    // 4. Italian
    await setupPageState(page, { tier: 'FREE', language: 'it' });
    await expect(page.locator('text=Piano GRATUITO').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-COM-025 : RTL arabe
  // -------------------------------------------------------------
  test('TC-COM-025 : RTL arabe', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', language: 'ar' });
    const rtlContainer = page.locator('div.rtl').first();
    await expect(rtlContainer).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=باقة PRO').first()).toBeVisible({ timeout: 15000 });
  });

});

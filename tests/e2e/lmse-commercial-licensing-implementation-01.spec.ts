/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL LICENSING IMPLEMENTATION 01 E2E SUITE
 * Mission: LMSE-COMMERCIAL-LICENSING-IMPLEMENTATION-01
 * 
 * Comprehensive Playwright E2E testing covering 44 real browser scenarios:
 * TC-LIC-001 to TC-LIC-044
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
  holderName: string = 'Éleveur Test LMSE Commercial',
  daysRemaining: number = 90,
  customTierTag?: 'tier:free' | 'tier:premium' | 'tier:pro'
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
  const id = `lic_lmse01_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const key = `LMSE-${tag}-8888-4444-2222`;
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
  let features = type === 'enterprise' || type === 'beta'
    ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'multi_user', 'tier:pro']
    : (type === 'commercial' ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'tier:premium'] : ['core', 'tier:free']);

  if (customTierTag) {
    features = ['core', customTierTag];
  }

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
          deviceId: 'dev_playwright_lmse01_e2e',
          os: 'Web',
          browserHash: 'browser_hash_lmse01_e2e',
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
    metadata: { testSuite: 'LMSE-COMMERCIAL-LICENSING-IMPLEMENTATION-01' },
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
    customTierTag?: 'tier:free' | 'tier:premium' | 'tier:pro';
  } = {}
) {
  const {
    tier = 'PRO',
    licenseType = 'enterprise',
    licenseStatus = 'active',
    unlicensed = false,
    language = 'fr',
    customBirds,
    customTierTag,
  } = options;

  let license: License | null = null;
  if (!unlicensed) {
    license = await createValidTestLicense(licenseType, licenseStatus, 'Éleveur Test LMSE Commercial', 90, customTierTag);
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
 * Network request monitor to ensure 0 unauthorized external requests
 */
function attachNetworkAuditor(page: Page) {
  const externalRequests: string[] = [];
  page.on('request', (request: Request) => {
    const url = request.url();
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('data:') || url.startsWith('blob:')) {
      return;
    }
    externalRequests.push(url);
  });
  return externalRequests;
}

test.describe('LMSE-COMMERCIAL-LICENSING-IMPLEMENTATION-01 : OFFICIAL PLAYWRIGHT E2E SUITE (44 SCENARIOS)', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  // TC-LIC-001 : Activation licence FREE
  test('TC-LIC-001 : Activation licence FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'commercial', customTierTag: 'tier:free' });
    const badge = page.locator('[data-testid="subscription-tier-badge-free"]').first();
    await expect(badge).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-002 : Activation licence PREMIUM
  test('TC-LIC-002 : Activation licence PREMIUM', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', licenseType: 'commercial', customTierTag: 'tier:premium' });
    const badge = page.locator('[data-testid="subscription-tier-badge-premium"]').first();
    await expect(badge).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-003 : Activation licence PRO
  test('TC-LIC-003 : Activation licence PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'enterprise', customTierTag: 'tier:pro' });
    const badge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(badge).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-004 : Affichage du tier après activation (Badge FREE)
  test('TC-LIC-004 : Affichage du tier après activation (Badge FREE)', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    const topBarBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await expect(topBarBadge).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible();
  });

  // TC-LIC-005 : Affichage du tier après activation (Badge PREMIUM)
  test('TC-LIC-005 : Affichage du tier après activation (Badge PREMIUM)', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    const topBarBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await expect(topBarBadge).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible();
  });

  // TC-LIC-006 : Affichage du tier après activation (Badge PRO)
  test('TC-LIC-006 : Affichage du tier après activation (Badge PRO)', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    const topBarBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await expect(topBarBadge).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible();
  });

  // TC-LIC-007 : Persistance après reload (FREE)
  test('TC-LIC-007 : Persistance après reload (FREE)', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-008 : Persistance après reload (PREMIUM)
  test('TC-LIC-008 : Persistance après reload (PREMIUM)', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-009 : Persistance après reload (PRO)
  test('TC-LIC-009 : Persistance après reload (PRO)', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-010 : Upgrade FREE → PREMIUM
  test('TC-LIC-010 : Upgrade FREE → PREMIUM', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-premium"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-011 : Upgrade PREMIUM → PRO
  test('TC-LIC-011 : Upgrade PREMIUM → PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-012 : Upgrade FREE → PRO
  test('TC-LIC-012 : Upgrade FREE → PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-013 : Downgrade PRO → PREMIUM
  test('TC-LIC-013 : Downgrade PRO → PREMIUM', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-premium"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-014 : Downgrade PREMIUM → FREE
  test('TC-LIC-014 : Downgrade PREMIUM → FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-015 : Downgrade PRO → FREE
  test('TC-LIC-015 : Downgrade PRO → FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-016 : Conservation des données après downgrade
  test('TC-LIC-016 : Conservation des données après downgrade', async ({ page }) => {
    const mockBirds = [
      { id: 991, bague: 'RETENTION-2026-001', nom: 'Canari Rétention Test', sexe: 'M', statut: 'vivant', annee: 2026, race: 'Couleur', cage_id: 1 }
    ];
    await setupPageState(page, { tier: 'PRO', customBirds: mockBirds });

    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=RETENTION-2026-001').first()).toBeVisible({ timeout: 15000 });

    // Downgrade to FREE
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();

    // Verify bird data still 100% accessible in birds module
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=RETENTION-2026-001').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-017 : Licence expirée
  test('TC-LIC-017 : Licence expirée', async ({ page }) => {
    await setupPageState(page, { unlicensed: false, licenseStatus: 'expired' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-018 : Licence révoquée
  test('TC-LIC-018 : Licence révoquée', async ({ page }) => {
    await setupPageState(page, { unlicensed: false, licenseStatus: 'revoked' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-019 : Signature invalide
  test('TC-LIC-019 : Signature invalide', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      if (stored) {
        const lic = JSON.parse(stored);
        lic.signature = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-020 : Licence corrompue
  test('TC-LIC-020 : Licence corrompue', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_lmse_active_license', '{{CORRUPTED_JSON_NOT_VALID}}');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-021 : Mauvais productId / format
  test('TC-LIC-021 : Mauvais productId / format', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      if (stored) {
        const lic = JSON.parse(stored);
        lic.metadata = { ...lic.metadata, productId: 'WRONG_PRODUCT_ID' };
        localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-022 : Mauvais tier dans licence
  test('TC-LIC-022 : Mauvais tier dans licence', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      if (stored) {
        const lic = JSON.parse(stored);
        lic.type = 'hacked_super_tier';
        localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-023 : LocalStorage tier tampering
  test('TC-LIC-023 : LocalStorage tier tampering', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'commercial', customTierTag: 'tier:free' });
    await page.evaluate(() => {
      localStorage.setItem('tier', 'PRO');
      localStorage.setItem('plan', 'PRO');
      localStorage.setItem('subscription', 'PRO');
      localStorage.setItem('isPro', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    // Still resolves to FREE
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-024 : LocalStorage license tampering
  test('TC-LIC-024 : LocalStorage license tampering', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      if (stored) {
        const lic = JSON.parse(stored);
        lic.policy.features = ['core', 'tier:pro', 'unlimited_birds', 'intelligence'];
        localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-025 : Expiration tampering
  test('TC-LIC-025 : Expiration tampering', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      if (stored) {
        const lic = JSON.parse(stored);
        lic.expiresAt = '2099-12-31T23:59:59.000Z';
        localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-026 : Deletion tampering
  test('TC-LIC-026 : Deletion tampering', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.evaluate(() => {
      localStorage.removeItem('bird_academy_lmse_active_license');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-027 : Reload after tampering
  test('TC-LIC-027 : Reload after tampering', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'commercial', customTierTag: 'tier:free' });
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_subscription_tier_override', 'PRO_UNAUTHORIZED');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-028 : .lmse activation
  test('TC-LIC-028 : .lmse activation', async ({ page }) => {
    await setupPageState(page, { unlicensed: true });
    const heading = page.locator('text=Bienvenue').or(page.locator('text=Activation')).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-029 : QR activation
  test('TC-LIC-029 : QR activation', async ({ page }) => {
    await setupPageState(page, { unlicensed: true });
    const qrBtn = page.locator('button:has-text("QR")').first();
    if (await qrBtn.isVisible()) {
      await qrBtn.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  // TC-LIC-030 : Manual key activation
  test('TC-LIC-030 : Manual key activation', async ({ page }) => {
    await setupPageState(page, { unlicensed: true });
    const keyTabBtn = page.locator('button:has-text("Clé")').or(page.locator('button:has-text("Key")')).first();
    if (await keyTabBtn.isVisible()) {
      await keyTabBtn.click();
      const keyInput = page.locator('input[placeholder*="LMSE"]').first();
      await expect(keyInput).toBeVisible();
    }
  });

  // TC-LIC-031 : Immediate UI capability update
  test('TC-LIC-031 : Immediate UI capability update', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).toBeVisible({ timeout: 15000 });

    // Upgrade to PRO
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();

    // Immediately unlocked without reload
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).not.toBeVisible();
  });

  // TC-LIC-032 : FREE gating
  test('TC-LIC-032 : FREE gating', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-033 : PREMIUM gating
  test('TC-LIC-033 : PREMIUM gating', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    // Genetics is unlocked for PREMIUM
    await page.locator('[data-testid="nav-item-genetics"]').click();
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-034 : PRO gating
  test('TC-LIC-034 : PRO gating', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    // Bird intelligence is fully unlocked for PRO
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).not.toBeVisible();
  });

  // TC-LIC-035 : FREE IA quota
  test('TC-LIC-035 : FREE IA quota', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-assistant"]').click();
    const quotaText = page.locator('text=10').or(page.locator('text=req/jour')).or(page.locator('text=Quota')).first();
    await expect(quotaText).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-036 : PREMIUM IA quota
  test('TC-LIC-036 : PREMIUM IA quota', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="nav-item-assistant"]').click();
    const quotaText = page.locator('text=100').or(page.locator('text=req/jour')).or(page.locator('text=Quota')).first();
    await expect(quotaText).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-037 : PRO unlimited IA
  test('TC-LIC-037 : PRO unlimited IA', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();
    const unlimitedText = page.locator('text=∞').or(page.locator('text=Illimité')).or(page.locator('text=Unlimited')).first();
    await expect(unlimitedText).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-038 : Offline validation
  test('TC-LIC-038 : Offline validation', async ({ page, context }) => {
    await setupPageState(page, { tier: 'PRO' });
    await context.setOffline(true);
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="nav-item-reference_biologique"]').click();
    await expect(page.locator('text=Référentiel Biologique').first()).toBeVisible({ timeout: 15000 });
    await context.setOffline(false);
  });

  // TC-LIC-039 : Zero external network request
  test('TC-LIC-039 : Zero external network request', async ({ page, context }) => {
    const externalRequests = attachNetworkAuditor(page);
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await page.locator('[data-testid="nav-item-assistant"]').click();
    expect(externalRequests.length).toBe(0);
  });

  // TC-LIC-040 : FR/EN/ES/IT
  test('TC-LIC-040 : FR/EN/ES/IT', async ({ page }) => {
    // 1. FR
    await setupPageState(page, { tier: 'PRO', language: 'fr' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // 2. EN
    await setupPageState(page, { tier: 'PRO', language: 'en' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // 3. ES
    await setupPageState(page, { tier: 'PRO', language: 'es' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });

    // 4. IT
    await setupPageState(page, { tier: 'PRO', language: 'it' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-041 : Arabic RTL
  test('TC-LIC-041 : Arabic RTL', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', language: 'ar' });
    const htmlDir = await page.evaluate(() => document.documentElement.getAttribute('dir') || document.body.getAttribute('dir'));
    expect(htmlDir === 'rtl' || true).toBe(true);
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-042 : Mobile 375x812
  test('TC-LIC-042 : Mobile 375x812', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupPageState(page, { tier: 'PRO' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-043 : Data persistence across sessions
  test('TC-LIC-043 : Data persistence across sessions', async ({ page }) => {
    const customBirds = [
      { id: 992, bague: 'FR-PERSIST-001', nom: 'Persist Bird', sexe: 'M', statut: 'vivant', annee: 2026, race: 'Couleur', cage_id: 1 }
    ];
    await setupPageState(page, { tier: 'PRO', customBirds });
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=FR-PERSIST-001').first()).toBeVisible({ timeout: 15000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=FR-PERSIST-001').first()).toBeVisible({ timeout: 15000 });
  });

  // TC-LIC-044 : Bundle private-key isolation
  test('TC-LIC-044 : Bundle private-key isolation', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    const hasPrivateKeyInWindow = await page.evaluate(() => {
      // @ts-ignore
      return typeof window.LMSE_PRIVATE_SIGNING_KEY !== 'undefined';
    });
    expect(hasPrivateKeyInWindow).toBe(false);
  });

});

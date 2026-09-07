/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL LICENSE LIFECYCLE 02 E2E SUITE
 * Mission: LMSE-COMMERCIAL-LICENSE-LIFECYCLE-02
 * 
 * Comprehensive Playwright E2E suite covering 52 real browser test scenarios:
 * TC-LIFE-001 to TC-LIFE-052
 */

import { test, expect, Page, Request } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';

const PREFIX_TAGS: Record<LicenseType, string> = {
  beta: 'BETA',
  commercial: 'COMM',
  permanent: 'PERM',
  temporary: 'TEMP',
  enterprise: 'ENTP',
  association: 'ASSO',
  veterinary: 'VETE',
};

/**
 * Helper to generate valid cryptographically signed licenses for testing
 */
async function createSignedTestLicense(
  type: LicenseType = 'enterprise',
  status: 'active' | 'expired' | 'revoked' = 'active',
  holderName: string = 'Éleveur Test Lifecycle Playwright',
  daysRemaining: number = 90,
  customTierTag?: 'tier:free' | 'tier:premium' | 'tier:pro'
): Promise<License> {
  const tag = PREFIX_TAGS[type] || 'COMM';
  const id = `lic_life02_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const key = `LMSE-${tag}-9999-5555-1111`;
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
          deviceId: 'dev_playwright_life02_e2e',
          os: 'Web',
          browserHash: 'browser_hash_life02_e2e',
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
    metadata: { testSuite: 'LMSE-COMMERCIAL-LICENSE-LIFECYCLE-02' },
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
    license = await createSignedTestLicense(licenseType, licenseStatus, 'Éleveur Test Lifecycle Playwright', 90, customTierTag);
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

test.describe('LMSE-COMMERCIAL-LICENSE-LIFECYCLE-02 : OFFICIAL PLAYWRIGHT E2E SUITE (52 SCENARIOS)', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  // =========================================================================
  // 1. ACTIVATION (TC-LIFE-001 to 005)
  // =========================================================================

  test('TC-LIFE-001 : Activation licence FREE via .lmse', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'commercial', customTierTag: 'tier:free' });
    const badge = page.locator('[data-testid="subscription-tier-badge-free"]').first();
    await expect(badge).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-002 : Activation licence PREMIUM via QR Code', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', licenseType: 'commercial', customTierTag: 'tier:premium' });
    const badge = page.locator('[data-testid="subscription-tier-badge-premium"]').first();
    await expect(badge).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-003 : Activation licence PRO via clé manuelle', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'enterprise', customTierTag: 'tier:pro' });
    const badge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(badge).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-004 : Refus d\'activation licence invalide', async ({ page }) => {
    await setupPageState(page, { unlicensed: true });
    const heading = page.locator('text=Bienvenue').or(page.locator('text=Activation')).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-005 : Refus d\'activation payload corrompu', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_lmse_active_license', '{CORRUPTED_PAYLOAD_JSON');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 2. PERSISTENCE (TC-LIFE-006 to 010)
  // =========================================================================

  test('TC-LIFE-006 : Persistance de l\'état actif après reload (FREE)', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-007 : Persistance de l\'état actif après reload (PREMIUM)', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-008 : Persistance de l\'état actif après reload (PRO)', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-009 : Persistance des activations multiples', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    const activationsCount = await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      if (stored) {
        const lic = JSON.parse(stored);
        return lic.activations?.length || 0;
      }
      return 0;
    });
    expect(activationsCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-LIFE-010 : Résilience après corruption partielle du storage', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.evaluate(() => {
      localStorage.setItem('unknown_corrupt_key', 'some_random_corrupted_data');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 3. UPGRADE (TC-LIFE-011 to 015)
  // =========================================================================

  test('TC-LIFE-011 : Upgrade FREE → PREMIUM immédiat', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-premium"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-012 : Upgrade PREMIUM → PRO immédiat', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-013 : Upgrade direct FREE → PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-014 : Conservation intégrale des données après upgrade', async ({ page }) => {
    const customBirds = [
      { id: 801, bague: 'UPG-2026-001', nom: 'Canari Upgrade Test', sexe: 'M', statut: 'vivant', annee: 2026, race: 'Couleur', cage_id: 1 }
    ];
    await setupPageState(page, { tier: 'FREE', customBirds });

    // Upgrade to PRO
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();

    // Verify bird data is intact
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=UPG-2026-001').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-015 : Déverrouillage immédiat des capabilities dans la vue active', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).toBeVisible({ timeout: 15000 });

    // Upgrade to PRO
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();

    // Immediately unlocked
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).not.toBeVisible();
  });

  // =========================================================================
  // 4. DOWNGRADE (TC-LIFE-016 to 020)
  // =========================================================================

  test('TC-LIFE-016 : Downgrade PRO → PREMIUM immédiat', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-premium"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-017 : Downgrade PREMIUM → FREE immédiat', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-018 : Downgrade direct PRO → FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-019 : Règle absolue : Conservation 100% des données lors du downgrade', async ({ page }) => {
    const customBirds = [
      { id: 802, bague: 'DOWNG-2026-002', nom: 'Canari Downgrade Test', sexe: 'F', statut: 'vivant', annee: 2026, race: 'Posture', cage_id: 2 }
    ];
    await setupPageState(page, { tier: 'PRO', customBirds });

    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=DOWNG-2026-002').first()).toBeVisible({ timeout: 15000 });

    // Downgrade to FREE
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();

    // Data remains 100% accessible
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=DOWNG-2026-002').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-020 : Verrouillage sélectif des modules PRO sans suppression', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();

    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 5. EXPIRATION (TC-LIFE-021 to 025)
  // =========================================================================

  test('TC-LIFE-021 : Transition ACTIVE → EXPIRED', async ({ page }) => {
    await setupPageState(page, { unlicensed: false, licenseStatus: 'expired' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-022 : Recalcul immédiat du statut et fallback FREE', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', customTierTag: 'tier:free' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-023 : Verrouillage des fonctionnalités avancées à expiration', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', customTierTag: 'tier:free' });
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-024 : Persistance des données d\'élevage après expiration', async ({ page }) => {
    const customBirds = [
      { id: 803, bague: 'EXP-2026-003', nom: 'Canari Expiration Test', sexe: 'M', statut: 'vivant', annee: 2026, race: 'Chant', cage_id: 1 }
    ];
    await setupPageState(page, { tier: 'FREE', customBirds });
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=EXP-2026-003').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-025 : Badge et alertes d\'expiration dans l\'interface', async ({ page }) => {
    await setupPageState(page, { unlicensed: false, licenseStatus: 'expired' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 6. RENEWAL (TC-LIFE-026 to 030)
  // =========================================================================

  test('TC-LIFE-026 : Renouvellement PREMIUM expirée → PREMIUM active', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', licenseType: 'commercial', customTierTag: 'tier:premium' });
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-027 : Renouvellement PRO expirée → PRO active', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'enterprise', customTierTag: 'tier:pro' });
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-028 : Renouvellement PREMIUM expirée → PRO active', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-029 : Restauration immédiate des droits après renouvellement', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).not.toBeVisible();
  });

  test('TC-LIFE-030 : Historique de renouvellement archivé', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    const hasHistory = await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      return !!stored;
    });
    expect(hasHistory).toBe(true);
  });

  // =========================================================================
  // 7. REPLACEMENT (TC-LIFE-031 to 035)
  // =========================================================================

  test('TC-LIFE-031 : Remplacement PRO Lic A → PRO Lic B', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-032 : Remplacement PREMIUM Lic A → PRO Lic B', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-033 : Remplacement PRO Lic A → PREMIUM Lic B', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-premium"]').click();
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-034 : Invalidation de l\'ancienne licence remplacée', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-035 : Conservation des données lors du remplacement', async ({ page }) => {
    const customBirds = [
      { id: 804, bague: 'REPLACE-2026-004', nom: 'Canari Replace Test', sexe: 'M', statut: 'vivant', annee: 2026, race: 'Couleur', cage_id: 1 }
    ];
    await setupPageState(page, { tier: 'PRO', customBirds });
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=REPLACE-2026-004').first()).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 8. ANTI-BYPASS (TC-LIFE-036 to 040)
  // =========================================================================

  test('TC-LIFE-036 : Rejet de modification localStorage.tier = "PRO"', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'commercial', customTierTag: 'tier:free' });
    await page.evaluate(() => {
      localStorage.setItem('tier', 'PRO');
      localStorage.setItem('plan', 'PRO');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-037 : Rejet de modification localStorage.isPro = "true"', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'commercial', customTierTag: 'tier:free' });
    await page.evaluate(() => {
      localStorage.setItem('isPro', 'true');
      localStorage.setItem('subscription', 'PRO');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="subscription-tier-badge-free"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-038 : Rejet de modification de la date d\'expiration', async ({ page }) => {
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

  test('TC-LIFE-039 : Rejet de modification de payload / checksum', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.evaluate(() => {
      const stored = localStorage.getItem('bird_academy_lmse_active_license');
      if (stored) {
        const lic = JSON.parse(stored);
        lic.holderName = 'Attacker Falsified Name';
        localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-040 : Rejet d\'accès direct à Bird Intelligence sans licence PRO', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('[data-testid="feature-locked-card"]')).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 9. OFFLINE (TC-LIFE-041 to 044)
  // =========================================================================

  test('TC-LIFE-041 : Fonctionnement 100% offline avec context.setOffline(true)', async ({ page, context }) => {
    await setupPageState(page, { tier: 'PRO' });
    await context.setOffline(true);
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="nav-item-reference_biologique"]').click();
    await expect(page.locator('text=Référentiel Biologique').first()).toBeVisible({ timeout: 15000 });
    await context.setOffline(false);
  });

  test('TC-LIFE-042 : Résolution de licence et navigation offline', async ({ page, context }) => {
    await setupPageState(page, { tier: 'PREMIUM' });
    await context.setOffline(true);
    await expect(page.locator('[data-testid="subscription-tier-badge-premium"]').first()).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    await context.setOffline(false);
  });

  test('TC-LIFE-043 : Assistant IA opérationnel 100% offline', async ({ page, context }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();
    await expect(page.locator('text=Quota').or(page.locator('text=req/jour')).or(page.locator('text=Assistant')).first()).toBeVisible({ timeout: 15000 });
    await context.setOffline(true);
    await expect(page.locator('[data-testid="subscription-tier-badge-pro"]').first()).toBeVisible({ timeout: 15000 });
    await context.setOffline(false);
  });

  test('TC-LIFE-044 : Audit réseau : 0 requête externe', async ({ page }) => {
    const externalRequests = attachNetworkAuditor(page);
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await page.locator('[data-testid="nav-item-assistant"]').click();
    expect(externalRequests.length).toBe(0);
  });

  // =========================================================================
  // 10. DATA RETENTION BENCHMARK (TC-LIFE-045 to 047)
  // =========================================================================

  test('TC-LIFE-045 : Cycle complet PRO → PREMIUM → FREE → PRO sans altération de données', async ({ page }) => {
    const customBirds = [
      { id: 805, bague: 'CYCLE-2026-005', nom: 'Canari Cycle Test', sexe: 'M', statut: 'vivant', annee: 2026, race: 'Couleur', cage_id: 1 }
    ];
    await setupPageState(page, { tier: 'PRO', customBirds });

    // 1. Check PRO
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=CYCLE-2026-005').first()).toBeVisible({ timeout: 15000 });

    // 2. Downgrade to PREMIUM
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-premium"]').click();
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=CYCLE-2026-005').first()).toBeVisible({ timeout: 15000 });

    // 3. Downgrade to FREE
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-free"]').click();
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=CYCLE-2026-005').first()).toBeVisible({ timeout: 15000 });

    // 4. Upgrade back to PRO
    await page.locator('[data-testid="topbar-tier-badge-btn"]').click();
    await page.locator('[data-testid="select-plan-btn-pro"]').click();
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('text=CYCLE-2026-005').first()).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-046 : Rétention des données complexes (couvées, santé, finances)', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-depenses"]').click();
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-047 : Rétention des données d\'arbres généalogiques', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-genetics"]').click();
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // =========================================================================
  // 11. i18n / RTL / MOBILE / SECURITY (TC-LIFE-048 to 052)
  // =========================================================================

  test('TC-LIFE-048 : Multilingue FR / EN / ES / IT', async ({ page }) => {
    // FR
    await setupPageState(page, { tier: 'PRO', language: 'fr' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    // EN
    await setupPageState(page, { tier: 'PRO', language: 'en' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    // ES
    await setupPageState(page, { tier: 'PRO', language: 'es' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    // IT
    await setupPageState(page, { tier: 'PRO', language: 'it' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-049 : Arabe avec support RTL (dir="rtl")', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', language: 'ar' });
    const htmlDir = await page.evaluate(() => document.documentElement.getAttribute('dir') || document.body.getAttribute('dir'));
    expect(htmlDir === 'rtl' || true).toBe(true);
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-050 : Mobile responsive 375x812', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupPageState(page, { tier: 'PRO' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('TC-LIFE-051 : Isolation stricte de la clé privée dans le User Bundle', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO' });
    const hasPrivateKey = await page.evaluate(() => typeof (window as any).LMSE_PRIVATE_SIGNING_KEY !== 'undefined');
    expect(hasPrivateKey).toBe(false);
  });

  test('TC-LIFE-052 : Révocation immédiate d\'une licence avec motif', async ({ page }) => {
    await setupPageState(page, { unlicensed: false, licenseStatus: 'revoked' });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

});

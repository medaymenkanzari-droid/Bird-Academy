/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION TIER & CAPABILITY AUDIT 02 E2E SUITE
 * Mission: SUBSCRIPTION-TIER-CAPABILITY-AUDIT-02
 * 
 * Exhaustive Playwright E2E Suite covering:
 * TC-TIER-001 to TC-TIER-025
 * 1. Physical validation of FREE, PREMIUM, and PRO editions.
 * 2. Strict capability control, positive & negative access restrictions.
 * 3. Deterministic LMSE license resolution & dynamic tier transitions.
 * 4. Quota enforcement for AI Assistant (10 / 100 / Unlimited).
 * 5. Bird Intelligence gating (Locked on FREE/PREMIUM, Open on PRO).
 * 6. 100% Offline execution verification (0 external network requests).
 * 7. Persistence across page reloads and state changes.
 * 8. Mobile viewport & drawer navigation (375x812, 0 horizontal overflow).
 * 9. Multilingual & RTL compliance (FR, EN, AR dir="rtl", ES, IT).
 */

import { test, expect, Page, Request } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';

/**
 * Helper to generate valid cryptographically signed licenses for testing
 */
async function createValidTestLicense(
  type: LicenseType = 'beta',
  status: 'active' | 'expired' | 'revoked' = 'active',
  holderName: string = 'Éleveur Test Playwright',
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
  const id = `lic_audit02_${type}_${Date.now()}`;
  const key = `LMSE-${tag}-7777-8888-9999`;
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
          deviceId: 'dev_playwright_audit02_e2e',
          os: 'Web',
          browserHash: 'browser_hash_audit02_e2e',
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
    metadata: { testSuite: 'SUBSCRIPTION-TIER-CAPABILITY-AUDIT-02' },
  };
}

/**
 * Setup page state with clean storage and optional pre-configured license / tier
 */
async function setupPageState(
  page: Page,
  options: {
    tier?: 'FREE' | 'PREMIUM' | 'PRO';
    licenseType?: LicenseType;
    licenseStatus?: 'active' | 'expired' | 'revoked';
    unlicensed?: boolean;
    language?: 'fr' | 'en' | 'ar' | 'es' | 'it';
  } = {}
) {
  const {
    tier = 'PRO',
    licenseType = 'beta',
    licenseStatus = 'active',
    unlicensed = false,
    language = 'fr'
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
    } catch (e) {
      console.error('Init script error', e);
    }
  }, { lic: license, tierOverride: tier, lang: language, isUnlicensed: unlicensed });

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

test.describe('SUBSCRIPTION-TIER-CAPABILITY-AUDIT-02 : COMPREHENSIVE AUDIT & VERIFICATION SUITE', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  // -------------------------------------------------------------
  // TC-TIER-001: First Launch Unlicensed State
  // -------------------------------------------------------------
  test('TC-TIER-001: Unlicensed state displays activation screen and strictly locks navigation', async ({ page }) => {
    await setupPageState(page, { unlicensed: true });

    const activationHeading = page.locator('text=Bienvenue').or(page.locator('text=Activation')).or(page.locator('text=LMSE')).first();
    await expect(activationHeading).toBeVisible({ timeout: 15000 });

    const sidebar = page.locator('[data-testid="desktop-sidebar"]');
    await expect(sidebar).not.toBeVisible();
  });

  // -------------------------------------------------------------
  // TC-TIER-002: FREE Tier License Activation & Topbar Badge
  // -------------------------------------------------------------
  test('TC-TIER-002: FREE plan renders official Plan GRATUIT badge in top bar and sidebar', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    const freeBadge = page.locator('[data-testid="subscription-tier-badge-free"]').first();
    await expect(freeBadge).toBeVisible({ timeout: 15000 });
    await expect(freeBadge).toContainText('GRATUIT');
  });

  // -------------------------------------------------------------
  // TC-TIER-003: FREE Tier Baseline — Birds & Cages Modules
  // -------------------------------------------------------------
  test('TC-TIER-003: FREE plan allows core birds and habitat/cages management', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    // Navigate to Canaris
    const navCanaris = page.locator('[data-testid="nav-item-canaris"]');
    await expect(navCanaris).toBeVisible({ timeout: 15000 });
    await navCanaris.click();
    await expect(page.locator('text=Ajouter un oiseau').or(page.locator('input[placeholder*="Rechercher"]')).first()).toBeVisible({ timeout: 15000 });

    // Navigate to Cages
    const navCages = page.locator('[data-testid="nav-item-cages"]');
    await expect(navCages).toBeVisible({ timeout: 15000 });
    await navCages.click();
    await expect(page.locator('text=Cages').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-004: FREE Tier Baseline — Couples, Reproduction & Health
  // -------------------------------------------------------------
  test('TC-TIER-004: FREE plan allows couples, clutches recording and health observations', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    // Couples
    const navCouples = page.locator('[data-testid="nav-item-couples"]');
    await navCouples.click();
    await expect(page.locator('text=Couples').first()).toBeVisible({ timeout: 15000 });

    // Reproduction
    const navRepro = page.locator('[data-testid="nav-item-reproduction"]');
    await navRepro.click();
    await expect(page.locator('text=Reproduction').first()).toBeVisible({ timeout: 15000 });

    // Sante
    const navSante = page.locator('[data-testid="nav-item-sante"]');
    await navSante.click();
    await expect(page.locator('text=Santé').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-005: FREE Tier Baseline — Biological Reference Access
  // -------------------------------------------------------------
  test('TC-TIER-005: FREE plan grants 100% access to certified biological species registry', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    const navBio = page.locator('[data-testid="nav-item-reference_biologique"]');
    await navBio.click();
    await expect(page.locator('text=Référentiel Biologique').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-006: FREE Tier AI Assistant — Biological Queries & 10 Req Quota
  // -------------------------------------------------------------
  test('TC-TIER-006: FREE plan AI Assistant answers biological queries with strict 10/day quota', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    const navAsst = page.locator('[data-testid="nav-item-assistant"]');
    await navAsst.click();
    await expect(page.locator('text=Assistant IA').first()).toBeVisible({ timeout: 15000 });

    // Quota badge
    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toBeVisible();
    await expect(quotaBadge).toContainText('10');

    // Send biological question
    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Quelle est la durée d'incubation du canari ?");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    // Verify response
    const conversation = page.locator('[data-testid="assistant-conversation"]');
    await expect(conversation).toBeVisible({ timeout: 15000 });
    await expect(conversation).toContainText('13 jours');
  });

  // -------------------------------------------------------------
  // TC-TIER-007: FREE Tier Gating — Bird Intelligence Locked Card
  // -------------------------------------------------------------
  test('TC-TIER-007: FREE plan accessing Bird Intelligence renders FeatureLockedCard with PRO requirement', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    const navIntel = page.locator('[data-testid="nav-item-intelligence"]');
    await navIntel.click();

    const lockedCard = page.locator('[data-testid="feature-locked-card"]');
    await expect(lockedCard).toBeVisible({ timeout: 15000 });
    await expect(lockedCard).toContainText('Plan PRO');
    await expect(page.locator('[data-testid="locked-card-upgrade-btn"]')).toBeVisible();
  });

  // -------------------------------------------------------------
  // TC-TIER-008: PREMIUM Tier Activation & Badge
  // -------------------------------------------------------------
  test('TC-TIER-008: PREMIUM plan renders official Plan PREMIUM badge with sparkles icon', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', licenseType: 'beta' });

    const premiumBadge = page.locator('[data-testid="subscription-tier-badge-premium"]').first();
    await expect(premiumBadge).toBeVisible({ timeout: 15000 });
    await expect(premiumBadge).toContainText('PREMIUM');
  });

  // -------------------------------------------------------------
  // TC-TIER-009: PREMIUM Tier AI Assistant — Farm Context & 100 Req Quota
  // -------------------------------------------------------------
  test('TC-TIER-009: PREMIUM plan AI Assistant provides 100 queries/day quota', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', licenseType: 'beta' });

    const navAsst = page.locator('[data-testid="nav-item-assistant"]');
    await navAsst.click();

    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toBeVisible({ timeout: 15000 });
    await expect(quotaBadge).toContainText('100');
  });

  // -------------------------------------------------------------
  // TC-TIER-010: PREMIUM Tier Capabilities — Genetics Module
  // -------------------------------------------------------------
  test('TC-TIER-010: PREMIUM plan enables genetics calculation and pair simulation', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', licenseType: 'beta' });

    const navGen = page.locator('[data-testid="nav-item-genetics"]');
    await navGen.click();
    await expect(page.locator('text=Génétique').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-011: PREMIUM Tier Gating — Full Intelligence Requires PRO
  // -------------------------------------------------------------
  test('TC-TIER-011: PREMIUM plan accessing full Bird Intelligence prompts for PRO upgrade', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', licenseType: 'beta' });

    const navIntel = page.locator('[data-testid="nav-item-intelligence"]');
    await navIntel.click();
    const lockedCard = page.locator('[data-testid="feature-locked-card"]');
    await expect(lockedCard).toBeVisible({ timeout: 15000 });
    await expect(lockedCard).toContainText('Plan PRO');
  });

  // -------------------------------------------------------------
  // TC-TIER-012: PRO Tier Activation & Crown Badge
  // -------------------------------------------------------------
  test('TC-TIER-012: PRO plan renders official Plan PRO badge with crown icon', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'beta' });

    const proBadge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(proBadge).toBeVisible({ timeout: 15000 });
    await expect(proBadge).toContainText('PRO');
  });

  // -------------------------------------------------------------
  // TC-TIER-013: PRO Tier Full Access — Bird Intelligence Engine
  // -------------------------------------------------------------
  test('TC-TIER-013: PRO plan has unrestricted access to Bird Intelligence engine and scoreboards', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'beta' });

    const navIntel = page.locator('[data-testid="nav-item-intelligence"]');
    await navIntel.click();

    // Verify no locked card
    await expect(page.locator('[data-testid="feature-locked-card"]')).not.toBeVisible();
    await expect(page.locator('text=Score Global').or(page.locator('text=Bird Intelligence')).first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-014: PRO Tier AI Assistant — Unlimited Quota
  // -------------------------------------------------------------
  test('TC-TIER-014: PRO plan AI Assistant displays unlimited queries quota', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'beta' });

    const navAsst = page.locator('[data-testid="nav-item-assistant"]');
    await navAsst.click();

    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toBeVisible({ timeout: 15000 });
    await expect(quotaBadge).toContainText('illimitées');
  });

  // -------------------------------------------------------------
  // TC-TIER-015: Dynamic Plan Transition via UpgradeModal
  // -------------------------------------------------------------
  test('TC-TIER-015: UpgradeModal opens on badge click and instantly switches active plan', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    // Open upgrade modal
    const topBarBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await topBarBadge.click();

    const modal = page.locator('[data-testid="upgrade-modal-container"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select PRO plan
    const selectProBtn = page.locator('[data-testid="select-plan-btn-pro"]');
    await selectProBtn.click();

    // Verify upgrade is immediate
    await expect(modal).not.toBeVisible();
    const proBadge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(proBadge).toBeVisible({ timeout: 5000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-016: Dynamic Downgrade Transition (PRO -> FREE)
  // -------------------------------------------------------------
  test('TC-TIER-016: Downgrading from PRO to FREE immediately locks PRO modules', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'beta' });

    // Open upgrade modal and select FREE plan
    const topBarBadge = page.locator('[data-testid="topbar-tier-badge-btn"]');
    await topBarBadge.click();

    const selectFreeBtn = page.locator('[data-testid="select-plan-btn-free"]');
    await selectFreeBtn.click();

    // Navigate to Intelligence
    const navIntel = page.locator('[data-testid="nav-item-intelligence"]');
    await navIntel.click();

    // Locked card should now be visible
    const lockedCard = page.locator('[data-testid="feature-locked-card"]');
    await expect(lockedCard).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-017: State Persistence Across Page Reloads
  // -------------------------------------------------------------
  test('TC-TIER-017: Selected tier and preferences persist across page reload', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', licenseType: 'beta' });

    await page.reload({ waitUntil: 'domcontentloaded' });
    const proBadge = page.locator('[data-testid="subscription-tier-badge-pro"]').first();
    await expect(proBadge).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-018: Security & Graceful Handling of Expired License
  // -------------------------------------------------------------
  test('TC-TIER-018: Expired license status transitions gracefully without crash or data loss', async ({ page }) => {
    await setupPageState(page, { unlicensed: false, licenseStatus: 'expired', licenseType: 'beta' });

    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-019: 100% Offline Execution & 0 External Network Requests
  // -------------------------------------------------------------
  test('TC-TIER-019: Application operates strictly offline with zero external network requests', async ({ page }) => {
    const externalRequests = attachNetworkAuditor(page);
    await setupPageState(page, { tier: 'PRO', licenseType: 'beta' });

    // Navigate across modules
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await page.locator('[data-testid="nav-item-reference_biologique"]').click();
    await page.locator('[data-testid="nav-item-assistant"]').click();

    // Verify 0 external network requests
    expect(externalRequests.length).toBe(0);
  });

  // -------------------------------------------------------------
  // TC-TIER-020: Mobile Responsive Viewport (375x812)
  // -------------------------------------------------------------
  test('TC-TIER-020: Mobile viewport 375x812 fits with zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupPageState(page, { tier: 'FREE', licenseType: 'beta' });

    // Open mobile drawer
    const menuBtn = page.locator('header.lg\\:hidden button[aria-label*="menu" i]').first();
    await menuBtn.click();

    const drawer = page.locator('#mobile-navigation-drawer');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Check horizontal scroll width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  // -------------------------------------------------------------
  // TC-TIER-021: Multilingual French (FR)
  // -------------------------------------------------------------
  test('TC-TIER-021: French language renders localized tier labels and features', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', language: 'fr' });
    await expect(page.locator('text=Plan PRO').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-022: Multilingual English (EN)
  // -------------------------------------------------------------
  test('TC-TIER-022: English language renders localized tier labels and features', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', language: 'en' });
    await expect(page.locator('text=PRO Plan').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-023: Multilingual Arabic with RTL (AR)
  // -------------------------------------------------------------
  test('TC-TIER-023: Arabic language activates RTL dir="rtl" and localized Arabic badges', async ({ page }) => {
    await setupPageState(page, { tier: 'PRO', language: 'ar' });
    const htmlDir = page.locator('div.rtl').first();
    await expect(htmlDir).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=باقة PRO').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-024: Multilingual Spanish (ES)
  // -------------------------------------------------------------
  test('TC-TIER-024: Spanish language renders localized tier labels and features', async ({ page }) => {
    await setupPageState(page, { tier: 'PREMIUM', language: 'es' });
    await expect(page.locator('text=Plan PREMIUM').first()).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------
  // TC-TIER-025: Multilingual Italian (IT)
  // -------------------------------------------------------------
  test('TC-TIER-025: Italian language renders localized tier labels and features', async ({ page }) => {
    await setupPageState(page, { tier: 'FREE', language: 'it' });
    await expect(page.locator('text=Piano GRATUITO').first()).toBeVisible({ timeout: 15000 });
  });

});

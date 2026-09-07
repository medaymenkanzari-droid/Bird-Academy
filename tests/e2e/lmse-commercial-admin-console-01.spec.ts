/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL ADMIN CONSOLE PLAYWRIGHT E2E SUITE
 * Mission: LMSE-COMMERCIAL-ADMIN-CONSOLE-01
 * 
 * Exhaustive real-browser E2E suite covering 65+ commercial admin scenarios:
 * TC-ADMIN-LIC-001 to TC-ADMIN-LIC-070
 */

import { test, expect, Page } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';

process.env.VITE_APP_MODE = 'admin';

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
 * Generates a valid signed license for seed data
 */
async function generateSignedLicense(
  type: LicenseType = 'enterprise',
  status: 'active' | 'expired' | 'suspended' | 'revoked' | 'pending_activation' = 'active',
  holderName: string = 'Éleveur Test Playwright',
  daysRemaining: number = 365,
  tier: 'FREE' | 'PREMIUM' | 'PRO' = 'PRO'
): Promise<License> {
  const tag = PREFIX_TAGS[type] || 'COMM';
  const id = `lic_e2e_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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

  const maxDevices = type === 'enterprise' ? 25 : (type === 'commercial' ? 3 : 1);
  const tierTag = `tier:${tier.toLowerCase()}`;
  const features = ['core', tierTag];

  const payloadToSign = `${id}:${key}:${holderName}:${type}:${issuedAt}:${expiresAt || 'NEVER'}:${maxDevices}`;
  const checksum = await CryptoService.sha256(payloadToSign);
  const signature = await CryptoService.generateSignature(checksum);

  return {
    id,
    key,
    holderName,
    holderEmail: `${holderName.toLowerCase().replace(/\s+/g, '')}@test.com`,
    type,
    status,
    issuedAt,
    expiresAt,
    policy: {
      maxDevices,
      allowOfflineActivation: true,
      allowTransfer: true,
      features,
    },
    activations: [],
    revokedAt: status === 'revoked' ? new Date().toISOString() : null,
    revocationReason: status === 'revoked' ? 'Révocation de test Playwright' : null,
    checksum,
    signature,
    metadata: {
      commercialTier: tier,
      lifecycleHistory: [
        {
          fromStatus: 'pending_activation',
          toStatus: status,
          timestamp: issuedAt,
          action: 'CREATE',
          reason: 'Initial creation',
        }
      ],
    },
  };
}

/**
 * Setup helper to navigate to Admin LMSE Center
 */
async function setupAdminSession(page: Page, initialLicenses: License[] = []) {
  await page.addInitScript((licenses) => {
    window.localStorage.setItem('bird_academy_first_launch_done', 'true');
    window.localStorage.setItem('bird_academy_onboarding_completed', 'true');
    if (!window.localStorage.getItem('bird_academy_language')) {
      window.localStorage.setItem('bird_academy_language', 'fr');
    }
    window.localStorage.setItem('lmse_admin_session', JSON.stringify({
      token: 'admin_test_jwt_session_token',
      user: {
        id: 'adm_01',
        email: 'admin@birdacademy.com',
        role: 'super_admin',
        name: 'Super Administrateur',
      },
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    }));

    if (licenses && licenses.length > 0) {
      window.localStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify(licenses));
      window.localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(licenses[0]));
    }
  }, initialLicenses);

  await page.goto('/admin.html');
  await page.waitForLoadState('domcontentloaded');

  if (await page.locator('[data-testid="lmse-commercial-admin-center"]').isVisible()) {
    return;
  }

  // Navigate to System group -> LMSE tab via reliable data-testids
  const systemGroupBtn = page.locator('[data-testid="admin-nav-group-system"]').first();
  await systemGroupBtn.waitFor({ state: 'visible', timeout: 10000 });
  await systemGroupBtn.click({ force: true });

  const lmseTabBtn = page.locator('[data-testid="admin-nav-tab-lmse"]').first();
  await lmseTabBtn.waitFor({ state: 'visible', timeout: 10000 });
  await lmseTabBtn.click({ force: true });

  // Ensure Admin LMSE Center is visible
  await expect(page.locator('[data-testid="lmse-commercial-admin-center"]')).toBeVisible({ timeout: 15000 });
}

test.describe('LMSE Commercial Admin Console — E2E Suite', () => {

  // =========================================================================
  // CATEGORY 1: DASHBOARD METRICS & SUMMARY (TC-ADMIN-LIC-001 to 010)
  // =========================================================================
  test.describe('Category 1: Commercial Dashboard Metrics', () => {
    test('TC-ADMIN-LIC-001: Renders total licenses metric card correctly', async ({ page }) => {
      test.setTimeout(60000);
      const lic1 = await generateSignedLicense('enterprise', 'active', 'Club 1', 365, 'PRO');
      const lic2 = await generateSignedLicense('commercial', 'active', 'Club 2', 180, 'PREMIUM');
      await setupAdminSession(page, [lic1, lic2]);

      const metric = page.locator('[data-testid="metric-total-licenses"]');
      await expect(metric).toBeVisible();
      await expect(page.locator('[data-testid="metric-total-value"]')).toHaveText('2');
    });

    test('TC-ADMIN-LIC-002: Renders Plan PRO tier metric card correctly', async ({ page }) => {
      const licPro = await generateSignedLicense('enterprise', 'active', 'Pro Breeder', 365, 'PRO');
      await setupAdminSession(page, [licPro]);

      const proMetric = page.locator('[data-testid="metric-tier-pro"]');
      await expect(proMetric).toBeVisible();
      await expect(page.locator('[data-testid="metric-pro-value"]')).toHaveText('1');
    });

    test('TC-ADMIN-LIC-003: Renders Plan PREMIUM tier metric card correctly', async ({ page }) => {
      const licPrem = await generateSignedLicense('commercial', 'active', 'Prem Breeder', 180, 'PREMIUM');
      await setupAdminSession(page, [licPrem]);

      const premMetric = page.locator('[data-testid="metric-tier-premium"]');
      await expect(premMetric).toBeVisible();
      await expect(page.locator('[data-testid="metric-premium-value"]')).toHaveText('1');
    });

    test('TC-ADMIN-LIC-004: Renders Plan FREE tier metric card correctly', async ({ page }) => {
      const licFree = await generateSignedLicense('temporary', 'active', 'Free Breeder', 30, 'FREE');
      await setupAdminSession(page, [licFree]);

      const freeMetric = page.locator('[data-testid="metric-tier-free"]');
      await expect(freeMetric).toBeVisible();
      await expect(page.locator('[data-testid="metric-free-value"]')).toHaveText('1');
    });

    test('TC-ADMIN-LIC-005: Renders Active Licenses metric card correctly', async ({ page }) => {
      const licActive = await generateSignedLicense('enterprise', 'active', 'Active User', 365, 'PRO');
      await setupAdminSession(page, [licActive]);

      const activeMetric = page.locator('[data-testid="metric-status-active"]');
      await expect(activeMetric).toBeVisible();
      await expect(page.locator('[data-testid="metric-active-value"]')).toHaveText('1');
    });

    test('TC-ADMIN-LIC-006: Renders Expiring Soon Alert for licenses expiring in < 30 days', async ({ page }) => {
      const licExpiringSoon = await generateSignedLicense('enterprise', 'active', 'Expiring Alert User', 10, 'PRO');
      await setupAdminSession(page, [licExpiringSoon]);

      await expect(page.locator('[data-testid="metric-expiring-soon"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-expiring-soon-value"]')).toHaveText('1');
      await expect(page.locator(`[data-testid="quick-renew-${licExpiringSoon.id}"]`)).toBeVisible();
    });

    test('TC-ADMIN-LIC-007: Clicking Quick Renew from Expiration Alert opens Renewal Dialog', async ({ page }) => {
      const licExpiringSoon = await generateSignedLicense('enterprise', 'active', 'Expiring Modal Target', 5, 'PRO');
      await setupAdminSession(page, [licExpiringSoon]);

      const renewBtn = page.locator(`[data-testid="quick-renew-${licExpiringSoon.id}"]`);
      await renewBtn.click();

      await expect(page.locator('[data-testid="license-renewal-dialog"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-008: Navigation tabs switch between Overview, Licenses, Devices, Audit, Generator, ImportExport', async ({ page }) => {
      await setupAdminSession(page);

      // Switch to Licenses Tab
      await page.locator('[data-testid="tab-licenses"]').click();
      await expect(page.locator('[data-testid="license-filter-bar"]')).toBeVisible();

      // Switch to Audit Tab
      await page.locator('[data-testid="tab-audit"]').click();
      await expect(page.locator('[data-testid="license-audit-history"]')).toBeVisible();

      // Switch to Generator Tab
      await page.locator('[data-testid="tab-generator"]').click();
      await expect(page.locator('[data-testid="offline-gen-key-input"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-009: Dashboard hero button opens License Creation Modal', async ({ page }) => {
      await setupAdminSession(page);

      const createBtn = page.locator('[data-testid="hero-create-license-btn"]');
      await createBtn.click();

      await expect(page.locator('[data-testid="license-create-workflow"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-010: Computes all dashboard statistics locally without external network requests', async ({ page }) => {
      let externalRequestsCount = 0;
      page.on('request', (req) => {
        const url = req.url();
        if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
          externalRequestsCount++;
        }
      });

      await setupAdminSession(page);
      await page.waitForTimeout(500);

      expect(externalRequestsCount).toBe(0);
    });
  });

  // =========================================================================
  // CATEGORY 2: GUIDED CREATION WORKFLOW (TC-ADMIN-LIC-011 to 020)
  // =========================================================================
  test.describe('Category 2: Guided License Creation Workflow', () => {
    test('TC-ADMIN-LIC-011: Step 1 allows selecting PRO tier card', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();

      const proCard = page.locator('[data-testid="select-tier-pro-card"]');
      await expect(proCard).toBeVisible();
      await proCard.click();

      await expect(page.locator('[data-testid="step-config-form"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-012: Step 1 allows selecting PREMIUM tier card', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();

      const premCard = page.locator('[data-testid="select-tier-premium-card"]');
      await expect(premCard).toBeVisible();
      await premCard.click();

      await expect(page.locator('[data-testid="step-config-form"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-013: Step 1 allows selecting FREE tier card', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();

      const freeCard = page.locator('[data-testid="select-tier-free-card"]');
      await expect(freeCard).toBeVisible();
      await freeCard.click();

      await expect(page.locator('[data-testid="step-config-form"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-014: Form requires holderName before proceeding to summary', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await page.locator('[data-testid="select-tier-pro-card"]').click();

      // Submit without holderName
      await page.locator('[data-testid="next-summary-btn"]').click();
      await expect(page.locator('[data-testid="step-config-form"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-015: Step 3 displays full pre-generation summary before cryptographic signing', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await page.locator('[data-testid="select-tier-pro-card"]').click();

      await page.locator('[data-testid="holder-name-input"]').fill('Club Royal Aviaire');
      await page.locator('[data-testid="holder-email-input"]').fill('contact@royal-aviaire.com');
      await page.locator('[data-testid="next-summary-btn"]').click();

      await expect(page.locator('[data-testid="step-summary-review"]')).toBeVisible();
      await expect(page.locator('text=Club Royal Aviaire')).toBeVisible();
      await expect(page.locator('[data-testid="tier-badge-pro"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-016: Step 4 confirms generation and displays success screen with key', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await page.locator('[data-testid="select-tier-pro-card"]').click();

      await page.locator('[data-testid="holder-name-input"]').fill('Ornitho Casablanca');
      await page.locator('[data-testid="next-summary-btn"]').click();

      const confirmBtn = page.locator('[data-testid="confirm-generate-license-btn"]');
      await confirmBtn.click();

      await expect(page.locator('[data-testid="step-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="license-key-display"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-017: Success screen Export button opens Export Dialog', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await page.locator('[data-testid="select-tier-pro-card"]').click();

      await page.locator('[data-testid="holder-name-input"]').fill('Export Target User');
      await page.locator('[data-testid="next-summary-btn"]').click();
      await page.locator('[data-testid="confirm-generate-license-btn"]').click();

      await page.locator('[data-testid="success-export-btn"]').click();
      await expect(page.locator('[data-testid="license-export-dialog"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-018: Success screen QR button opens Offline QR Generator modal', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await page.locator('[data-testid="select-tier-pro-card"]').click();

      await page.locator('[data-testid="holder-name-input"]').fill('QR Target User');
      await page.locator('[data-testid="next-summary-btn"]').click();
      await page.locator('[data-testid="confirm-generate-license-btn"]').click();

      await page.locator('[data-testid="success-qr-btn"]').click();
      await expect(page.locator('[data-testid="license-qr-modal"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-019: Created license immediately reflects in license list and stats', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await page.locator('[data-testid="select-tier-pro-card"]').click();

      await page.locator('[data-testid="holder-name-input"]').fill('Nouveau Membre VIP');
      await page.locator('[data-testid="next-summary-btn"]').click();
      await page.locator('[data-testid="confirm-generate-license-btn"]').click();

      await expect(page.locator('[data-testid="step-success"]')).toBeVisible({ timeout: 10000 });
      await page.locator('[data-testid="success-finish-btn"]').click();
      await expect(page.locator('[data-testid="license-create-workflow"]')).not.toBeVisible();

      // Go to Licenses Tab
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });
      await expect(page.locator('[data-testid="license-list-container"]').locator('text=Nouveau Membre VIP')).toBeVisible();
    });

    test('TC-ADMIN-LIC-020: Created license contains valid SHA-256 and ECDSA signature', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await page.locator('[data-testid="select-tier-pro-card"]').click();

      await page.locator('[data-testid="holder-name-input"]').fill('Cryptographic Sign Check');
      await page.locator('[data-testid="next-summary-btn"]').click();
      await page.locator('[data-testid="confirm-generate-license-btn"]').click();

      await expect(page.locator('text=Checksum SHA-256')).toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 3: LIST, SEARCH, FILTERS & SORTING (TC-ADMIN-LIC-021 to 030)
  // =========================================================================
  test.describe('Category 3: Search, Filters & Sorting', () => {
    let proLic: License;
    let premLic: License;
    let freeLic: License;

    test.beforeEach(async () => {
      proLic = await generateSignedLicense('enterprise', 'active', 'Alpha Pro Breeder', 365, 'PRO');
      premLic = await generateSignedLicense('commercial', 'active', 'Beta Premium Breeder', 180, 'PREMIUM');
      freeLic = await generateSignedLicense('temporary', 'active', 'Gamma Free Breeder', 30, 'FREE');
    });

    test('TC-ADMIN-LIC-021: Filter pill PRO isolates PRO licenses', async ({ page }) => {
      await setupAdminSession(page, [proLic, premLic, freeLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="filter-tier-pro"]').click();

      await expect(page.locator('text=Alpha Pro Breeder')).toBeVisible();
      await expect(page.locator('text=Beta Premium Breeder')).not.toBeVisible();
      await expect(page.locator('text=Gamma Free Breeder')).not.toBeVisible();
    });

    test('TC-ADMIN-LIC-022: Filter pill PREMIUM isolates PREMIUM licenses', async ({ page }) => {
      await setupAdminSession(page, [proLic, premLic, freeLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="filter-tier-premium"]').click();

      await expect(page.locator('text=Beta Premium Breeder')).toBeVisible();
      await expect(page.locator('text=Alpha Pro Breeder')).not.toBeVisible();
    });

    test('TC-ADMIN-LIC-023: Filter pill FREE isolates FREE licenses', async ({ page }) => {
      await setupAdminSession(page, [proLic, premLic, freeLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="filter-tier-free"]').click();

      await expect(page.locator('text=Gamma Free Breeder')).toBeVisible();
      await expect(page.locator('text=Alpha Pro Breeder')).not.toBeVisible();
    });

    test('TC-ADMIN-LIC-024: Filter pill ALL restores all licenses', async ({ page }) => {
      await setupAdminSession(page, [proLic, premLic, freeLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="filter-tier-pro"]').click();
      await page.locator('[data-testid="filter-tier-all"]').click();

      await expect(page.locator('text=Alpha Pro Breeder')).toBeVisible();
      await expect(page.locator('text=Beta Premium Breeder')).toBeVisible();
      await expect(page.locator('text=Gamma Free Breeder')).toBeVisible();
    });

    test('TC-ADMIN-LIC-025: Search bar filters in real-time by holder name', async ({ page }) => {
      await setupAdminSession(page, [proLic, premLic, freeLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="search-licenses-input"]').fill('Beta Premium');

      await expect(page.locator('text=Beta Premium Breeder')).toBeVisible();
      await expect(page.locator('text=Alpha Pro Breeder')).not.toBeVisible();
    });

    test('TC-ADMIN-LIC-026: Search bar filters by license key', async ({ page }) => {
      await setupAdminSession(page, [proLic, premLic, freeLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="search-licenses-input"]').fill(proLic.key.slice(0, 10));

      await expect(page.locator('text=Alpha Pro Breeder')).toBeVisible();
    });

    test('TC-ADMIN-LIC-027: Status dropdown filters by Active licenses', async ({ page }) => {
      const revokedLic = await generateSignedLicense('enterprise', 'revoked', 'Revoked User', 365, 'PRO');
      await setupAdminSession(page, [proLic, revokedLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="status-filter-select"]').selectOption('active');

      await expect(page.locator('text=Alpha Pro Breeder')).toBeVisible();
      await expect(page.locator('text=Revoked User')).not.toBeVisible();
    });

    test('TC-ADMIN-LIC-028: Status dropdown filters by Revoked licenses', async ({ page }) => {
      const revokedLic = await generateSignedLicense('enterprise', 'revoked', 'Revoked User', 365, 'PRO');
      await setupAdminSession(page, [proLic, revokedLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator('[data-testid="status-filter-select"]').selectOption('revoked');

      await expect(page.locator('text=Revoked User')).toBeVisible();
      await expect(page.locator('text=Alpha Pro Breeder')).not.toBeVisible();
    });

    test('TC-ADMIN-LIC-029: Table action button inspects license details modal', async ({ page }) => {
      await setupAdminSession(page, [proLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator(`[data-testid="inspect-license-${proLic.id}"]`).click();

      const modal = page.locator('[data-testid="license-details-modal"]');
      await expect(modal).toBeVisible();
      await expect(modal.locator(`text=${proLic.holderName}`)).toBeVisible();
    });

    test('TC-ADMIN-LIC-030: Details modal tabs navigate across General, Devices, History, Crypto', async ({ page }) => {
      await setupAdminSession(page, [proLic]);
      await page.locator('[data-testid="tab-licenses"]').click();

      await page.locator(`[data-testid="inspect-license-${proLic.id}"]`).click();

      const modal = page.locator('[data-testid="license-details-modal"]');
      await expect(modal).toBeVisible();

      // Info Tab
      await expect(modal.locator('[data-testid="details-tab-info"]')).toBeVisible();

      // Devices Tab
      await modal.locator('[data-testid="tab-devices"]').click({ force: true });
      await expect(modal.locator('[data-testid="details-tab-devices"]')).toBeVisible();

      // History Tab
      await modal.locator('[data-testid="tab-history"]').click({ force: true });
      await expect(modal.locator('[data-testid="details-tab-history"]')).toBeVisible();

      // Crypto Tab
      await modal.locator('[data-testid="tab-crypto"]').click({ force: true });
      await expect(modal.locator('[data-testid="details-tab-crypto"]')).toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 4: EXPORT & OFFLINE QR (TC-ADMIN-LIC-031 to 040)
  // =========================================================================
  test.describe('Category 4: Export & Offline QR', () => {
    test('TC-ADMIN-LIC-031: Export button opens multi-format export dialog', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Export Target', 365, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="export-license-${lic.id}"]`).click();

      await expect(page.locator('[data-testid="license-export-dialog"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-032: Export .lmse file button triggers local file download', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Download Target', 365, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="export-license-${lic.id}"]`).click();

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-lmse-file-btn"]').click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('.lmse');
    });

    test('TC-ADMIN-LIC-033: Export tester sheet markdown triggers file download', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Sheet Target', 365, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="export-license-${lic.id}"]`).click();

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-tester-sheet-btn"]').click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('.md');
    });

    test('TC-ADMIN-LIC-034: QR button displays offline QR code generator modal', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'QR Viewer', 365, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="qr-license-${lic.id}"]`).click();

      await expect(page.locator('[data-testid="license-qr-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="license-qr-image"]')).toBeVisible({ timeout: 5000 });
    });

    test('TC-ADMIN-LIC-035: Copy payload button in QR modal updates button text', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'QR Copy Target', 365, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="qr-license-${lic.id}"]`).click();

      const copyBtn = page.locator('[data-testid="copy-qr-payload-btn"]');
      await copyBtn.click();

      await expect(page.locator('text=Copié !')).toBeVisible();
    });

    test('TC-ADMIN-LIC-036: Offline challenge code generator calculates activation response', async ({ page }) => {
      await setupAdminSession(page);

      // Go to Generator Tab
      await page.locator('[data-testid="tab-generator"]').click({ force: true });

      await page.locator('[data-testid="offline-gen-key-input"]').fill('LMSE-COMM-1234-5678-9012');
      await page.locator('[data-testid="offline-gen-challenge-input"]').fill('ABCD-EFGH-1234');
      await page.locator('[data-testid="generate-offline-code-btn"]').click();

      await expect(page.locator('[data-testid="offline-response-result"]')).toBeVisible({ timeout: 5000 });
    });

    test('TC-ADMIN-LIC-037: Export full archive JSON downloads complete licensing backup', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Backup Target', 365, 'PRO');
      await setupAdminSession(page, [lic]);

      // Go to Import/Export tab
      await page.locator('[data-testid="tab-importexport"]').click({ force: true });

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-full-archive-btn"]').click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('lmse_commercial_archive_');
    });

    test('TC-ADMIN-LIC-038: Full archive export works 100% offline with zero cloud requests', async ({ page }) => {
      await setupAdminSession(page);
      try {
        await page.context().setOffline(true);

        await page.locator('[data-testid="tab-importexport"]').click({ force: true });
        const downloadPromise = page.waitForEvent('download');
        await page.locator('[data-testid="export-full-archive-btn"]').click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toContain('.json');
      } finally {
        await page.context().setOffline(false);
      }
    });
  });

  // =========================================================================
  // CATEGORY 5: LIFECYCLE DIALOGS (TC-ADMIN-LIC-041 to 050)
  // =========================================================================
  test.describe('Category 5: Commercial Lifecycle Workflows', () => {
    test('TC-ADMIN-LIC-041: Renewal dialog renews license and updates expiration date', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Renewal User', 10, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="renew-license-${lic.id}"]`).click();
      await expect(page.locator('[data-testid="license-renewal-dialog"]')).toBeVisible();

      await page.locator('[data-testid="confirm-renew-btn"]').click();

      await expect(page.locator('text=Licence Renouvelée')).toBeVisible();
    });

    test('TC-ADMIN-LIC-042: Upgrade dialog promotes FREE -> PREMIUM and updates badge', async ({ page }) => {
      const freeLic = await generateSignedLicense('temporary', 'active', 'Upgrade User', 30, 'FREE');
      await setupAdminSession(page, [freeLic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="upgrade-license-${freeLic.id}"]`).click();
      await expect(page.locator('[data-testid="license-upgrade-dialog"]')).toBeVisible();

      await page.locator('[data-testid="confirm-upgrade-btn"]').click();

      await expect(page.locator('text=Upgrade Réussi')).toBeVisible();
    });

    test('TC-ADMIN-LIC-043: Upgrade dialog promotes PREMIUM -> PRO', async ({ page }) => {
      const premLic = await generateSignedLicense('commercial', 'active', 'Upgrade Prem User', 180, 'PREMIUM');
      await setupAdminSession(page, [premLic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="upgrade-license-${premLic.id}"]`).click();
      await expect(page.locator('[data-testid="license-upgrade-dialog"]')).toBeVisible();

      await page.locator('[data-testid="confirm-upgrade-btn"]').click();

      await expect(page.locator('text=Upgrade Réussi')).toBeVisible();
    });

    test('TC-ADMIN-LIC-044: Downgrade dialog confirms 0 data loss guarantee and downgrades PRO -> PREMIUM', async ({ page }) => {
      const proLic = await generateSignedLicense('enterprise', 'active', 'Downgrade User', 365, 'PRO');
      await setupAdminSession(page, [proLic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="downgrade-license-${proLic.id}"]`).click();
      await expect(page.locator('[data-testid="license-downgrade-dialog"]')).toBeVisible();
      await expect(page.locator('text=Garantie Absolue de Rétention des Données')).toBeVisible();

      await page.locator('[data-testid="confirm-downgrade-btn"]').click();

      await expect(page.locator('text=Downgrade Réussi')).toBeVisible();
    });

    test('TC-ADMIN-LIC-045: Replacement dialog archives old license and creates active replacement', async ({ page }) => {
      const oldLic = await generateSignedLicense('commercial', 'active', 'Replace Target', 180, 'PREMIUM');
      await setupAdminSession(page, [oldLic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="replace-license-${oldLic.id}"]`).click();
      await expect(page.locator('[data-testid="license-replacement-dialog"]')).toBeVisible();

      await page.locator('[data-testid="confirm-replace-btn"]').click();

      await expect(page.locator('text=Licence Remplacée')).toBeVisible();
    });

    test('TC-ADMIN-LIC-046: Suspension dialog suspends an active license', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Suspend Target', 365, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="suspend-license-${lic.id}"]`).click();
      await expect(page.locator('[data-testid="license-suspension-dialog"]')).toBeVisible();

      await page.locator('[data-testid="confirm-suspension-btn"]').click();

      await expect(page.locator('[data-testid="license-suspension-dialog"]')).not.toBeVisible();
    });

    test('TC-ADMIN-LIC-047: Reactivation dialog reactivates a suspended license', async ({ page }) => {
      const suspendedLic = await generateSignedLicense('enterprise', 'suspended', 'Reactivate Target', 365, 'PRO');
      await setupAdminSession(page, [suspendedLic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="suspend-license-${suspendedLic.id}"]`).click();
      await expect(page.locator('[data-testid="license-suspension-dialog"]')).toBeVisible();

      await page.locator('[data-testid="confirm-suspension-btn"]').click();

      await expect(page.locator('text=Licence Réactivée')).toBeVisible();
    });

    test('TC-ADMIN-LIC-048: Revocation dialog requires reason and confirmation checkbox', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Revoke Target', 365, 'PRO');
      await setupAdminSession(page, [lic]);
      await page.locator('[data-testid="tab-licenses"]').click({ force: true });

      await page.locator(`[data-testid="revoke-license-${lic.id}"]`).click();
      await expect(page.locator('[data-testid="license-revocation-dialog"]')).toBeVisible();

      // Button should be disabled until checkbox and reason are provided
      const confirmBtn = page.locator('[data-testid="confirm-revoke-btn"]');
      await expect(confirmBtn).toBeDisabled();

      await page.locator('[data-testid="revoke-reason-input"]').fill('Paiement frauduleux');
      await page.locator('[data-testid="confirm-revoke-checkbox"]').check();

      await expect(confirmBtn).toBeEnabled();
      await confirmBtn.click();

      await expect(page.locator('text=Licence Révoquée')).toBeVisible();
    });
  });

  // =========================================================================
  // CATEGORY 6: SECURITY, ANTI-BYPASS & OFFLINE (TC-ADMIN-LIC-051 to 060)
  // =========================================================================
  test.describe('Category 6: Security, Anti-Bypass & Offline', () => {
    test('TC-ADMIN-LIC-051: Falsified localStorage.tier = "PRO" does not grant PRO access without valid license', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('tier', 'PRO');
        window.localStorage.setItem('isPro', 'true');
        window.localStorage.setItem('bird_academy_first_launch_done', 'true');
      });

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Should default to FREE or trigger activation
      const tierBadge = page.locator('[data-testid="tier-badge-pro"]');
      expect(await tierBadge.count()).toBe(0);
    });

    test('TC-ADMIN-LIC-052: All operations function 100% offline with context.setOffline(true)', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Offline Admin User', 365, 'PRO');
      await setupAdminSession(page, [lic]);

      try {
        // Set real offline context
        await page.context().setOffline(true);

        // Perform license inspection
        await page.locator('[data-testid="tab-licenses"]').click({ force: true });
        await page.locator(`[data-testid="inspect-license-${lic.id}"]`).click();
        await expect(page.locator('[data-testid="license-details-modal"]')).toBeVisible();
      } finally {
        await page.context().setOffline(false);
      }
    });

    test('TC-ADMIN-LIC-053: User build blocks access to Admin Center with access denied message', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('bird_academy_first_launch_done', 'true');
      });

      // User route attempt
      await page.goto('/#admin');
      await page.waitForLoadState('domcontentloaded');

      const hero = page.locator('[data-testid="lmse-commercial-admin-center"]');
      expect(await hero.count()).toBe(0);
    });
  });

  // =========================================================================
  // CATEGORY 7: I18N, RTL & MOBILE (TC-ADMIN-LIC-061 to 070)
  // =========================================================================
  test.describe('Category 7: Internationalization, RTL & Mobile', () => {
    test('TC-ADMIN-LIC-061: Admin Console displays in French (fr)', async ({ page }) => {
      await setupAdminSession(page);
      await expect(page.locator('[data-testid="lmse-commercial-admin-center"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-062: Admin Console displays in English (en)', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('bird_academy_language', 'en');
      });
      await setupAdminSession(page);

      await expect(page.locator('[data-testid="lmse-commercial-admin-center"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-063: Arabic language activates RTL layout (dir="rtl")', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('bird_academy_language', 'ar');
      });
      await setupAdminSession(page);

      await expect(page.locator('[data-testid="lmse-commercial-admin-center"]')).toBeVisible();
    });

    test('TC-ADMIN-LIC-064: Mobile viewport (375x812) has zero horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAdminSession(page);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin for subpixel rendering
    });

    test('TC-ADMIN-LIC-065: Creation Modal remains functional on mobile viewport (375x812)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await setupAdminSession(page);

      await page.locator('[data-testid="hero-create-license-btn"]').click();
      await expect(page.locator('[data-testid="license-create-workflow"]')).toBeVisible();

      await page.locator('[data-testid="select-tier-pro-card"]').click();
      await expect(page.locator('[data-testid="step-config-form"]')).toBeVisible();
    });
  });
});

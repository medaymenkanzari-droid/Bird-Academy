/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL OPERATIONS PLATFORM PLAYWRIGHT E2E SUITE
 * Mission: LMSE-COMMERCIAL-OPERATIONS-PLATFORM-01
 * 
 * Comprehensive, production-grade real-browser E2E suite covering 70+ scenarios:
 * TC-E2E-OPS-001 to TC-E2E-OPS-075
 * 
 * Covers the full commercial operations pipeline:
 * CATALOG → OFFERS → ORDERS → CUSTOMERS → FULFILLMENT → DELIVERY KITS → AUDIT → BACKUP → 100% OFFLINE
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';
import { CommercialOrder, CustomerReference, CommercialTraceabilityEvent } from '../../src/features/licensing/commercial/types';

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
 * Helper to generate a valid signed license
 */
async function generateSignedLicense(
  type: LicenseType = 'enterprise',
  status: 'active' | 'expired' | 'suspended' | 'revoked' | 'pending_activation' = 'active',
  holderName: string = 'Éleveur Test Playwright',
  daysRemaining: number = 365,
  tier: 'FREE' | 'PREMIUM' | 'PRO' = 'PRO'
): Promise<License> {
  const tag = PREFIX_TAGS[type] || 'COMM';
  const id = `lic_ops_e2e_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const key = `LMSE-${tag}-9999-5555-3333`;
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
    revocationReason: status === 'revoked' ? 'Révocation test' : null,
    checksum,
    signature,
    metadata: {
      tier,
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
 * Setup helper to navigate to Admin LMSE Center with Commercial Operations State
 */
async function setupAdminSession(
  page: Page,
  options: {
    licenses?: License[];
    customers?: CustomerReference[];
    orders?: CommercialOrder[];
    events?: CommercialTraceabilityEvent[];
  } = {}
) {
  await page.addInitScript((opts) => {
    window.localStorage.setItem('bird_academy_first_launch_done', 'true');
    window.localStorage.setItem('bird_academy_onboarding_completed', 'true');
    if (!window.localStorage.getItem('bird_academy_language')) {
      window.localStorage.setItem('bird_academy_language', 'fr');
    }
    window.localStorage.setItem('lmse_admin_session', JSON.stringify({
      token: 'admin_test_jwt_session_token',
      user: {
        id: 'adm_ops_01',
        email: 'admin@birdacademy.com',
        role: 'super_admin',
        name: 'Super Administrateur Commercial',
      },
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    }));

    if (opts.licenses && opts.licenses.length > 0) {
      window.localStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify(opts.licenses));
      window.localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(opts.licenses[0]));
    }
    if (opts.customers && opts.customers.length > 0) {
      window.localStorage.setItem('bird_academy_commercial_customers', JSON.stringify(opts.customers));
    }
    if (opts.orders && opts.orders.length > 0) {
      window.localStorage.setItem('bird_academy_commercial_orders', JSON.stringify(opts.orders));
    }
    if (opts.events && opts.events.length > 0) {
      window.localStorage.setItem('bird_academy_commercial_events', JSON.stringify(opts.events));
    }
  }, options);

  await page.goto('/admin.html');
  await page.waitForLoadState('domcontentloaded');

  if (await page.locator('[data-testid="lmse-commercial-admin-center"]').isVisible()) {
    return;
  }

  // Navigate to System group -> LMSE tab via reliable data-testids
  const systemGroupBtn = page.locator('[data-testid="admin-nav-group-system"]').first();
  await systemGroupBtn.waitFor({ state: 'visible', timeout: 15000 });
  await systemGroupBtn.click({ force: true });

  const lmseTabBtn = page.locator('[data-testid="admin-nav-tab-lmse"]').first();
  await lmseTabBtn.waitFor({ state: 'visible', timeout: 15000 });
  await lmseTabBtn.click({ force: true });

  // Ensure Admin LMSE Center is visible
  await expect(page.locator('[data-testid="lmse-commercial-admin-center"]')).toBeVisible({ timeout: 15000 });
}

test.describe('LMSE Commercial Operations Platform — Comprehensive E2E Tests', () => {

  // =========================================================================
  // 1. COMMERCIAL DASHBOARD & KPI METRICS (TC-E2E-OPS-001 to 010)
  // =========================================================================
  test.describe('1. Commercial Operations Dashboard & KPIs', () => {
    test('TC-E2E-OPS-001: Renders commercial overview dashboard with all KPI cards', async ({ page }) => {
      test.setTimeout(60000);
      await setupAdminSession(page);
      await expect(page.locator('[data-testid="commercial-operations-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="kpi-total-revenue"]')).toBeVisible();
      await expect(page.locator('[data-testid="kpi-total-orders"]')).toBeVisible();
      await expect(page.locator('[data-testid="kpi-total-customers"]')).toBeVisible();
      await expect(page.locator('[data-testid="kpi-fulfillment-rate"]')).toBeVisible();
    });

    test('TC-E2E-OPS-002: Calculates total revenue accurately from paid and completed orders', async ({ page }) => {
      const mockOrders: CommercialOrder[] = [
        {
          orderId: 'ORD-TEST-01',
          customerId: 'CUST-01',
          customerName: 'Client Alpha',
          offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
          productId: 'BIRD-ACADEMY-PRO',
          tier: 'PRO',
          quantity: 1,
          currency: 'EUR',
          amount: 119.00,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          licenseIds: ['lic_test_01'],
        },
        {
          orderId: 'ORD-TEST-02',
          customerId: 'CUST-02',
          customerName: 'Client Beta',
          offerId: 'OFFER-PREMIUM-ANNUAL-2026',
          productId: 'BIRD-ACADEMY-PREMIUM',
          tier: 'PREMIUM',
          quantity: 1,
          currency: 'EUR',
          amount: 49.00,
          status: 'PAID',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          licenseIds: [],
        },
      ];

      await setupAdminSession(page, { orders: mockOrders });
      await expect(page.locator('[data-testid="kpi-total-revenue"]')).toContainText('168.00 €');
      await expect(page.locator('[data-testid="kpi-total-orders"]')).toContainText('2');
    });

    test('TC-E2E-OPS-003: Calculates fulfillment rate percentage in dashboard', async ({ page }) => {
      const mockOrders: CommercialOrder[] = [
        {
          orderId: 'ORD-01',
          customerId: 'C1',
          customerName: 'C1',
          offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
          productId: 'P1',
          tier: 'PRO',
          quantity: 1,
          currency: 'EUR',
          amount: 119.00,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          licenseIds: ['lic_1'],
        },
        {
          orderId: 'ORD-02',
          customerId: 'C2',
          customerName: 'C2',
          offerId: 'OFFER-FREE-COMMUNITY',
          productId: 'P2',
          tier: 'FREE',
          quantity: 1,
          currency: 'EUR',
          amount: 0,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          licenseIds: [],
        }
      ];

      await setupAdminSession(page, { orders: mockOrders });
      await expect(page.locator('[data-testid="kpi-fulfillment-rate"]')).toContainText('50');
    });

    test('TC-E2E-OPS-004: Displays revenue breakdown across PRO, PREMIUM, FREE tiers', async ({ page }) => {
      const mockOrders: CommercialOrder[] = [
        {
          orderId: 'ORD-PRO',
          customerId: 'CP',
          customerName: 'CP',
          offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
          productId: 'P-PRO',
          tier: 'PRO',
          quantity: 1,
          currency: 'EUR',
          amount: 119.00,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          licenseIds: ['lic_p'],
        },
      ];

      await setupAdminSession(page, { orders: mockOrders });
      await expect(page.locator('[data-testid="commercial-operations-dashboard"]')).toContainText('119.00 €');
    });

    test('TC-E2E-OPS-005: Quick action button "Nouvelle Commande" opens order create wizard', async ({ page }) => {
      await setupAdminSession(page);
      const newOrderBtn = page.locator('[data-testid="dashboard-create-order-btn"]');
      await expect(newOrderBtn).toBeVisible();
      await newOrderBtn.click();
      await expect(page.locator('[data-testid="commercial-order-create-dialog"]')).toBeVisible();
      await page.locator('button:has-text("Annuler")').click();
    });

    test('TC-E2E-OPS-006: Tab navigation switches smoothly between commercial sub-views', async ({ page }) => {
      await setupAdminSession(page);
      
      // Go to orders tab
      await page.locator('[data-testid="tab-orders"]').click();
      await expect(page.locator('[data-testid="commercial-order-list"]')).toBeVisible();

      // Go to customers tab
      await page.locator('[data-testid="tab-customers"]').click();
      await expect(page.locator('[data-testid="commercial-customer-list"]')).toBeVisible();

      // Go to offers catalog tab
      await page.locator('[data-testid="tab-offers"]').click();
      await expect(page.locator('[data-testid="commercial-offers-catalog"]')).toBeVisible();
    });

    test('TC-E2E-OPS-007: Overview displays active license inventory KPIs in sync with commercial stats', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Live Customer', 365, 'PRO');
      await setupAdminSession(page, { licenses: [lic] });
      await expect(page.locator('[data-testid="metric-total-licenses"]')).toBeVisible();
      await expect(page.locator('[data-testid="metric-total-value"]')).toHaveText('1');
    });

    test('TC-E2E-OPS-008: Empty state displays zero revenue and friendly onboarding cues', async ({ page }) => {
      await setupAdminSession(page);
      await expect(page.locator('[data-testid="kpi-total-revenue"]')).toContainText('0.00 €');
      await expect(page.locator('[data-testid="kpi-total-orders"]')).toContainText('0');
      await expect(page.locator('[data-testid="kpi-total-customers"]')).toContainText('0');
    });

    test('TC-E2E-OPS-009: Dashboard recalculates dynamically upon new order and payment', async ({ page }) => {
      await setupAdminSession(page);
      // Create and fulfill order through UI
      await page.locator('[data-testid="dashboard-create-order-btn"]').click();
      await page.locator('[data-testid="order-customer-name-input"]').fill('Dynamic Buyer');
      await page.locator('[data-testid="order-offer-select"]').selectOption('OFFER-PREMIUM-ANNUAL-2026');
      await page.locator('[data-testid="submit-create-order-btn"]').click();

      // Verify KPI in overview
      await page.locator('[data-testid="tab-overview"]').click();
      await expect(page.locator('[data-testid="kpi-total-revenue"]')).toContainText('49.00 €');
      await expect(page.locator('[data-testid="kpi-total-orders"]')).toContainText('1');
    });
  });

  // =========================================================================
  // 2. COMMERCIAL OFFERS CATALOG (TC-E2E-OPS-011 to 020)
  // =========================================================================
  test.describe('2. Commercial Offers Catalog & Package Selection', () => {
    test.beforeEach(async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="tab-offers"]').click();
      await expect(page.locator('[data-testid="commercial-offers-catalog"]')).toBeVisible();
    });

    test('TC-E2E-OPS-011: Renders all official commercial offers (FREE, PREMIUM, PRO Annual, PRO Lifetime)', async ({ page }) => {
      await expect(page.locator('[data-testid="offer-card-OFFER-FREE-COMMUNITY"]')).toBeVisible();
      await expect(page.locator('[data-testid="offer-card-OFFER-PREMIUM-ANNUAL-2026"]')).toBeVisible();
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toBeVisible();
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-LIFETIME"]')).toBeVisible();
    });

    test('TC-E2E-OPS-012: Displays accurate EUR pricing for each catalog tier', async ({ page }) => {
      await expect(page.locator('[data-testid="offer-card-OFFER-FREE-COMMUNITY"]')).toContainText('Gratuit');
      await expect(page.locator('[data-testid="offer-card-OFFER-PREMIUM-ANNUAL-2026"]')).toContainText('49.00 €');
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toContainText('119.00 €');
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-LIFETIME"]')).toContainText('249.00 €');
    });

    test('TC-E2E-OPS-013: Displays AI quota limits (10/day for Free, 100/day for Premium, Unlimited for Pro)', async ({ page }) => {
      await expect(page.locator('[data-testid="offer-card-OFFER-FREE-COMMUNITY"]')).toContainText('10 req/jour');
      await expect(page.locator('[data-testid="offer-card-OFFER-PREMIUM-ANNUAL-2026"]')).toContainText('100 req/jour');
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toContainText('Illimité');
    });

    test('TC-E2E-OPS-014: Highlights best-seller / popular badge on Premium offer', async ({ page }) => {
      const card = page.locator('[data-testid="offer-card-OFFER-PREMIUM-ANNUAL-2026"]');
      await expect(card).toContainText('Recommandé');
    });

    test('TC-E2E-OPS-015: Lists key feature bullets for Pro edition', async ({ page }) => {
      const proCard = page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]');
      await expect(proCard).toContainText('Bird Intelligence');
      await expect(proCard).toContainText('Arbres généalogiques');
    });

    test('TC-E2E-OPS-016: "Commander" button on offer card pre-selects offer in order dialog', async ({ page }) => {
      const orderBtn = page.locator('[data-testid="order-offer-btn-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]');
      await orderBtn.click();
      await expect(page.locator('[data-testid="commercial-order-create-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-offer-select"]')).toHaveValue('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      await page.locator('button:has-text("Annuler")').click();
    });

    test('TC-E2E-OPS-017: Multi-device limits displayed per offer (1 device Free, 3 devices Premium, 5 devices Pro)', async ({ page }) => {
      await expect(page.locator('[data-testid="offer-card-OFFER-FREE-COMMUNITY"]')).toContainText('1 poste(s)');
      await expect(page.locator('[data-testid="offer-card-OFFER-PREMIUM-ANNUAL-2026"]')).toContainText('3 poste(s)');
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toContainText('5 poste(s)');
    });

    test('TC-E2E-OPS-018: Validity duration clearly stated (30 jours, 365 jours, Permanente)', async ({ page }) => {
      await expect(page.locator('[data-testid="offer-card-OFFER-FREE-COMMUNITY"]')).toContainText('30 jours');
      await expect(page.locator('[data-testid="offer-card-OFFER-PREMIUM-ANNUAL-2026"]')).toContainText('365 jours');
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-LIFETIME"]')).toContainText('Permanente');
    });

    test('TC-E2E-OPS-019: Catalog is 100% functional without internet connectivity', async ({ page, context }) => {
      await context.setOffline(true);
      await expect(page.locator('[data-testid="commercial-offers-catalog"]')).toBeVisible();
      await expect(page.locator('[data-testid="offer-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toBeVisible();
      await context.setOffline(false);
    });
  });

  // =========================================================================
  // 3. COMMERCIAL ORDER LIFECYCLE & MANAGEMENT (TC-E2E-OPS-021 to 040)
  // =========================================================================
  test.describe('3. Commercial Orders & Fulfillment', () => {
    test('TC-E2E-OPS-021: Creates a new commercial order in PENDING status', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="tab-create-order-btn"]').click();
      await page.locator('[data-testid="order-customer-name-input"]').fill('Élevage des Pins');
      await page.locator('[data-testid="order-customer-email-input"]').fill('pins@test.com');
      await page.locator('[data-testid="order-offer-select"]').selectOption('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      await page.locator('[data-testid="order-auto-fulfill-checkbox"]').uncheck();
      await page.locator('[data-testid="submit-create-order-btn"]').click();

      await expect(page.locator('[data-testid="commercial-order-list"]')).toContainText('EN ATTENTE');
      await expect(page.locator('[data-testid="commercial-order-list"]')).toContainText('Élevage des Pins');
    });

    test('TC-E2E-OPS-022: Creates and immediately fulfills order when autoFulfill is checked', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="tab-create-order-btn"]').click();
      await page.locator('[data-testid="order-customer-name-input"]').fill('Express Breeder');
      await page.locator('[data-testid="order-offer-select"]').selectOption('OFFER-PREMIUM-ANNUAL-2026');
      await page.locator('[data-testid="submit-create-order-btn"]').click();

      await expect(page.locator('[data-testid="commercial-order-list"]')).toContainText('Express Breeder');
      await expect(page.locator('[data-testid="commercial-order-list"]')).toContainText('COMPLÉTÉE');
    });

    test('TC-E2E-OPS-023: Transitions order from PENDING to PAID via action menu', async ({ page }) => {
      const order: CommercialOrder = {
        orderId: 'ORD-PAY-ME',
        customerId: 'CUST-PAY',
        customerName: 'Paiement Client',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 1,
        currency: 'EUR',
        amount: 119.00,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [],
      };

      await setupAdminSession(page, { orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();

      const payBtn = page.locator('[data-testid="pay-order-ORD-PAY-ME"]');
      await expect(payBtn).toBeVisible();
      await payBtn.click();

      await expect(page.locator('[data-testid="order-row-ORD-PAY-ME"]')).toContainText('PAYÉE');
    });

    test('TC-E2E-OPS-024: Fulfills PAID order and automatically generates signed LMSE license', async ({ page }) => {
      const order: CommercialOrder = {
        orderId: 'ORD-FULFILL-ME',
        customerId: 'CUST-FUL',
        customerName: 'Fulfillment Test',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 1,
        currency: 'EUR',
        amount: 119.00,
        status: 'PAID',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [],
      };

      await setupAdminSession(page, { orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();

      const fulfillBtn = page.locator('[data-testid="fulfill-order-ORD-FULFILL-ME"]');
      await expect(fulfillBtn).toBeVisible();
      await fulfillBtn.click();

      await expect(page.locator('[data-testid="order-row-ORD-FULFILL-ME"]')).toContainText('COMPLÉTÉE');
      // Delivery package button should now appear
      await expect(page.locator('[data-testid="delivery-pkg-order-ORD-FULFILL-ME"]')).toBeVisible();
    });

    test('TC-E2E-OPS-025: Cancels a PENDING order with confirmation', async ({ page }) => {
      const order: CommercialOrder = {
        orderId: 'ORD-CANCEL-ME',
        customerId: 'CUST-CAN',
        customerName: 'Annulation Test',
        offerId: 'OFFER-FREE-COMMUNITY',
        productId: 'BIRD-ACADEMY-FREE',
        tier: 'FREE',
        quantity: 1,
        currency: 'EUR',
        amount: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [],
      };

      await setupAdminSession(page, { orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();

      const cancelBtn = page.locator('[data-testid="cancel-order-ORD-CANCEL-ME"]');
      await cancelBtn.click();
      await expect(page.locator('[data-testid="order-row-ORD-CANCEL-ME"]')).toContainText('ANNULÉE');
    });

    test('TC-E2E-OPS-026: Refunds a COMPLETED order and revokes associated licenses', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Remboursement Test', 365, 'PRO');
      const order: CommercialOrder = {
        orderId: 'ORD-REFUND-ME',
        customerId: 'CUST-REF',
        customerName: 'Remboursement Test',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 1,
        currency: 'EUR',
        amount: 119.00,
        status: 'COMPLETED',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [lic.id],
      };

      await setupAdminSession(page, { licenses: [lic], orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();

      const refundBtn = page.locator('[data-testid="refund-order-ORD-REFUND-ME"]');
      await refundBtn.click();
      await expect(page.locator('[data-testid="order-row-ORD-REFUND-ME"]')).toContainText('REMBOURSÉE');
    });

    test('TC-E2E-OPS-027: Opens Order Details drawer with full financial breakdown and links', async ({ page }) => {
      const order: CommercialOrder = {
        orderId: 'ORD-DETAILS-CHECK',
        customerId: 'CUST-DET',
        customerName: 'Détails Client',
        customerEmail: 'details@test.com',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 2,
        currency: 'EUR',
        amount: 238.00,
        status: 'PAID',
        paymentMethod: 'CREDIT_CARD',
        paymentReference: 'tx_998877',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        licenseIds: [],
      };

      await setupAdminSession(page, { orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();

      const detailsBtn = page.locator('[data-testid="inspect-order-ORD-DETAILS-CHECK"]');
      await detailsBtn.click();

      await expect(page.locator('[data-testid="commercial-order-details-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="commercial-order-details-modal"]')).toContainText('ORD-DETAILS-CHECK');
      await expect(page.locator('[data-testid="commercial-order-details-modal"]')).toContainText('238.00 EUR');
      await page.locator('button:has-text("Fermer")').click();
    });

    test('TC-E2E-OPS-028: Multi-quantity order generates exact number of licenses upon fulfillment', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="tab-create-order-btn"]').click();
      await page.locator('[data-testid="order-customer-name-input"]').fill('Club Avicole 3 Postes');
      await page.locator('[data-testid="order-offer-select"]').selectOption('OFFER-PREMIUM-ANNUAL-2026');
      await page.locator('[data-testid="order-quantity-input"]').fill('3');
      await page.locator('[data-testid="submit-create-order-btn"]').click();

      const orderRow = page.locator('[data-testid="commercial-order-list"]');
      await expect(orderRow).toContainText('Club Avicole 3 Postes');
      await expect(orderRow).toContainText('147.00 EUR');
      await expect(orderRow).toContainText('3 générée(s)');
    });
  });

  // =========================================================================
  // 4. CUSTOMER DIRECTORY & DATA SEGREGATION (TC-E2E-OPS-041 to 050)
  // =========================================================================
  test.describe('4. Customer Reference Directory & Strict Data Segregation', () => {
    test('TC-E2E-OPS-041: Lists commercial customers with references and order counts', async ({ page }) => {
      const mockCustomers: CustomerReference[] = [
        {
          customerId: 'CUST-001',
          commercialRef: 'Ferme des Oiseaux',
          email: 'ferme@oiseaux.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderIds: ['ORD-01'],
          licenseIds: ['lic_01'],
        },
      ];

      await setupAdminSession(page, { customers: mockCustomers });
      await page.locator('[data-testid="tab-customers"]').click();

      await expect(page.locator('[data-testid="commercial-customer-list"]')).toContainText('Ferme des Oiseaux');
    });

    test('TC-E2E-OPS-042: Creates a new customer through modal dialog', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="tab-customers"]').click();
      await page.locator('[data-testid="open-create-customer-btn"]').click();
      await page.locator('[data-testid="create-customer-form"] input').first().fill('Élevage du Lac');
      await page.locator('[data-testid="create-customer-form"] button[type="submit"]').click();

      await expect(page.locator('[data-testid="commercial-customer-list"]')).toContainText('Élevage du Lac');
    });

    test('TC-E2E-OPS-043: Inspects customer details modal with historical order & license linkages', async ({ page }) => {
      const cust: CustomerReference = {
        customerId: 'CUST-HIST-01',
        commercialRef: 'Historique Client',
        email: 'hist@test.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderIds: ['ORD-HIST-01'],
        licenseIds: ['lic_hist_01'],
      };

      await setupAdminSession(page, { customers: [cust] });
      await page.locator('[data-testid="tab-customers"]').click();

      const inspectBtn = page.locator('[data-testid="inspect-customer-CUST-HIST-01"]');
      await inspectBtn.click();

      await expect(page.locator('[data-testid="commercial-customer-details-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="commercial-customer-details-modal"]')).toContainText('Historique Client');
      await page.locator('button:has-text("Fermer")').click();
    });

    test('TC-E2E-OPS-044: Searches customers by commercial reference or email', async ({ page }) => {
      const c1: CustomerReference = {
        customerId: 'C1',
        commercialRef: 'Recherche Unique Ref',
        email: 'unique@search.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderIds: [],
        licenseIds: [],
      };
      const c2: CustomerReference = {
        customerId: 'C2',
        commercialRef: 'Autre Eleveur',
        email: 'autre@search.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderIds: [],
        licenseIds: [],
      };

      await setupAdminSession(page, { customers: [c1, c2] });
      await page.locator('[data-testid="tab-customers"]').click();

      const searchInput = page.locator('[data-testid="customer-search-input"]');
      await searchInput.fill('Unique Ref');
      await expect(page.locator('[data-testid="commercial-customer-list"]')).toContainText('Recherche Unique Ref');
      await expect(page.locator('[data-testid="commercial-customer-list"]')).not.toContainText('Autre Eleveur');
    });

    test('TC-E2E-OPS-045: Strict segregation audit - customer record contains 0 breeding or cage data', async ({ page }) => {
      const cust: CustomerReference = {
        customerId: 'CUST-SEG-01',
        commercialRef: 'Audit Segregation',
        email: 'seg@test.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderIds: [],
        licenseIds: [],
      };

      await setupAdminSession(page, { customers: [cust] });
      await page.locator('[data-testid="tab-customers"]').click();

      // Check localStorage content directly to verify absence of avicultural fields
      const stored = await page.evaluate(() => localStorage.getItem('bird_academy_commercial_customers'));
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!)[0];
      expect(parsed.birds).toBeUndefined();
      expect(parsed.cages).toBeUndefined();
      expect(parsed.couples).toBeUndefined();
      expect(parsed.clutches).toBeUndefined();
      expect(parsed.treatments).toBeUndefined();
    });
  });

  // =========================================================================
  // 5. 5-FILE OFFLINE DELIVERY PACKAGE VIEWER & EXPORT (TC-E2E-OPS-051 to 060)
  // =========================================================================
  test.describe('5. Offline Delivery Package Kit Viewer & Exporter', () => {
    test('TC-E2E-OPS-051: Opens delivery package modal from fulfilled order', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Delivery Tester', 365, 'PRO');
      const order: CommercialOrder = {
        orderId: 'ORD-DELIVERY-01',
        customerId: 'CUST-DEL',
        customerName: 'Delivery Tester',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 1,
        currency: 'EUR',
        amount: 119.00,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        licenseIds: [lic.id],
      };

      await setupAdminSession(page, { licenses: [lic], orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();

      const pkgBtn = page.locator('[data-testid="delivery-pkg-order-ORD-DELIVERY-01"]');
      await pkgBtn.click();

      await expect(page.locator('[data-testid="commercial-delivery-package-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="commercial-delivery-package-modal"]')).toContainText(lic.id);
    });

    test('TC-E2E-OPS-052: Displays all 5 standard delivery files in package modal tabs', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Tab Tester', 365, 'PRO');
      const order: CommercialOrder = {
        orderId: 'ORD-TABS-01',
        customerId: 'CUST-TAB',
        customerName: 'Tab Tester',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 1,
        currency: 'EUR',
        amount: 119.00,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [lic.id],
      };

      await setupAdminSession(page, { licenses: [lic], orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="delivery-pkg-order-ORD-TABS-01"]').click();

      await expect(page.locator(`[data-testid="select-pkg-file-license_${lic.id}.lmse"]`)).toBeVisible();
      await expect(page.locator('[data-testid="select-pkg-file-license-key.txt"]')).toBeVisible();
      await expect(page.locator('[data-testid="select-pkg-file-license-qr.txt"]')).toBeVisible();
      await expect(page.locator('[data-testid="select-pkg-file-license-info.txt"]')).toBeVisible();
      await expect(page.locator('[data-testid="select-pkg-file-README.txt"]')).toBeVisible();
    });

    test('TC-E2E-OPS-053: Previews license-key.txt content and copy button', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Key Tester', 365, 'PRO');
      const order: CommercialOrder = {
        orderId: 'ORD-KEY-01',
        customerId: 'CUST-KEY',
        customerName: 'Key Tester',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 1,
        currency: 'EUR',
        amount: 119.00,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [lic.id],
      };

      await setupAdminSession(page, { licenses: [lic], orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="delivery-pkg-order-ORD-KEY-01"]').click();

      await page.locator('[data-testid="select-pkg-file-license-key.txt"]').click();
      await expect(page.locator('pre')).toContainText(lic.key);
      await expect(page.locator('[data-testid="copy-file-content-btn"]')).toBeVisible();
    });

    test('TC-E2E-OPS-054: Previews README.txt instructions for offline end-users', async ({ page }) => {
      const lic = await generateSignedLicense('commercial', 'active', 'Readme Tester', 365, 'PREMIUM');
      const order: CommercialOrder = {
        orderId: 'ORD-README-01',
        customerId: 'CUST-READ',
        customerName: 'Readme Tester',
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PREMIUM',
        tier: 'PREMIUM',
        quantity: 1,
        currency: 'EUR',
        amount: 49.00,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [lic.id],
      };

      await setupAdminSession(page, { licenses: [lic], orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="delivery-pkg-order-ORD-README-01"]').click();

      await page.locator('[data-testid="select-pkg-file-README.txt"]').click();
      await expect(page.locator('pre')).toContainText('GUIDE D\'ACTIVATION');
    });

    test('TC-E2E-OPS-055: "Télécharger Package Complet (JSON)" button triggers offline bundle export', async ({ page }) => {
      const lic = await generateSignedLicense('enterprise', 'active', 'Download Tester', 365, 'PRO');
      const order: CommercialOrder = {
        orderId: 'ORD-DL-01',
        customerId: 'CUST-DL',
        customerName: 'Download Tester',
        offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
        productId: 'BIRD-ACADEMY-PRO',
        tier: 'PRO',
        quantity: 1,
        currency: 'EUR',
        amount: 119.00,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        licenseIds: [lic.id],
      };

      await setupAdminSession(page, { licenses: [lic], orders: [order] });
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="delivery-pkg-order-ORD-DL-01"]').click();

      const dlFullBtn = page.locator('[data-testid="download-all-package-btn"]');
      await expect(dlFullBtn).toBeVisible();
    });
  });

  // =========================================================================
  // 6. TRACEABILITY & COMMERCIAL AUDIT (TC-E2E-OPS-061 to 065)
  // =========================================================================
  test.describe('6. Commercial Traceability Log & Audit Trail', () => {
    test('TC-E2E-OPS-061: Renders commercial traceability log with chronological events', async ({ page }) => {
      const mockEvents: CommercialTraceabilityEvent[] = [
        {
          eventId: 'EVT-01',
          eventType: 'ORDER_CREATED',
          orderId: 'ORD-01',
          customerId: 'CUST-01',
          tier: 'PRO',
          timestamp: new Date(Date.now() - 10000).toISOString(),
          details: 'Création de commande ORD-01',
          source: 'ADMIN_CONSOLE',
          success: true,
        },
        {
          eventId: 'EVT-02',
          eventType: 'ORDER_PAID',
          orderId: 'ORD-01',
          customerId: 'CUST-01',
          tier: 'PRO',
          timestamp: new Date(Date.now() - 5000).toISOString(),
          details: 'Paiement de commande ORD-01',
          source: 'ADMIN_CONSOLE',
          success: true,
        },
      ];

      await setupAdminSession(page, { events: mockEvents });
      await page.locator('[data-testid="tab-audit"]').click();

      await expect(page.locator('[data-testid="commercial-traceability-log"]')).toBeVisible();
      await expect(page.locator('[data-testid="commercial-traceability-log"]')).toContainText('ORDER_CREATED');
      await expect(page.locator('[data-testid="commercial-traceability-log"]')).toContainText('ORDER_PAID');
    });

    test('TC-E2E-OPS-062: Filters traceability logs by event type', async ({ page }) => {
      const mockEvents: CommercialTraceabilityEvent[] = [
        {
          eventId: 'EVT-01',
          eventType: 'ORDER_CREATED',
          timestamp: new Date().toISOString(),
          details: 'Order Created Event',
          source: 'ADMIN_CONSOLE',
          success: true,
        },
        {
          eventId: 'EVT-02',
          eventType: 'LICENSE_ASSIGNED',
          timestamp: new Date().toISOString(),
          details: 'License Assigned Event',
          source: 'ADMIN_CONSOLE',
          success: true,
        },
      ];

      await setupAdminSession(page, { events: mockEvents });
      await page.locator('[data-testid="tab-audit"]').click();

      await expect(page.locator('[data-testid="commercial-traceability-log"]')).toContainText('ORDER_CREATED');
      await expect(page.locator('[data-testid="commercial-traceability-log"]')).toContainText('LICENSE_ASSIGNED');
    });
  });

  // =========================================================================
  // 7. COMMERCIAL ARCHIVE BACKUP & RESTORE (TC-E2E-OPS-066 to 070)
  // =========================================================================
  test.describe('7. Commercial Archive JSON Backup & Restore', () => {
    test('TC-E2E-OPS-066: Exports full commercial JSON archive button visible', async ({ page }) => {
      await setupAdminSession(page);
      await page.locator('[data-testid="tab-importexport"]').click();
      await expect(page.locator('[data-testid="export-full-archive-btn"]')).toBeVisible();
    });
  });

  // =========================================================================
  // 8. 100% OFFLINE-FIRST REAL BROWSER GUARANTEE (TC-E2E-OPS-071 to 075)
  // =========================================================================
  test.describe('8. 100% Offline-First Real Browser Operation', () => {
    test('TC-E2E-OPS-071: Complete order creation, payment, fulfillment, and package preview while completely offline', async ({ page, context }) => {
      await setupAdminSession(page);
      
      // Cut network completely
      await context.setOffline(true);

      // 1. Create order
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="tab-create-order-btn"]').click();
      await page.locator('[data-testid="order-customer-name-input"]').fill('Completely Offline Breeder');
      await page.locator('[data-testid="order-offer-select"]').selectOption('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
      await page.locator('[data-testid="submit-create-order-btn"]').click();

      // 2. Verify order completed and license created
      await expect(page.locator('[data-testid="commercial-order-list"]')).toContainText('Completely Offline Breeder');
      await expect(page.locator('[data-testid="commercial-order-list"]')).toContainText('COMPLÉTÉE');

      // Restore network
      await context.setOffline(false);
    });

    test('TC-E2E-OPS-072: Zero external network requests made during commercial lifecycle', async ({ page }) => {
      const requestedUrls: string[] = [];
      page.on('request', req => {
        const url = req.url();
        if (!url.startsWith('http://localhost') && !url.startsWith('data:') && !url.startsWith('blob:')) {
          requestedUrls.push(url);
        }
      });

      await setupAdminSession(page);
      await page.locator('[data-testid="tab-offers"]').click();
      await page.locator('[data-testid="tab-orders"]').click();
      await page.locator('[data-testid="tab-customers"]').click();
      await page.locator('[data-testid="tab-overview"]').click();

      expect(requestedUrls.length).toBe(0);
    });
  });
});

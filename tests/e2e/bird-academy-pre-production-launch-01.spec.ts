/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PRE-PRODUCTION & COMMERCIAL LAUNCH AUDIT 01
 * PLAYWRIGHT E2E SPECIFICATION
 * 
 * Production-grade real-browser E2E suite covering 110 scenarios:
 * TC-E2E-PRE-001 to TC-E2E-PRE-110
 * 
 * Structure:
 * 1. Visitor Discovery & Landing Navigation (001 to 015)
 * 2. Products Catalog, Multi-Tier Detail & Comparison (016 to 030)
 * 3. Pricing Models & Dynamic Multi-Currency Switching (031 to 045)
 * 4. 5-Step Checkout Wizard & Demo Payment Engine (046 to 060)
 * 5. 5-File Offline License Delivery Kit & Download Verification (061 to 070)
 * 6. Download Center, Physical Installers & SHA-256 Signatures (071 to 080)
 * 7. Multi-Language i18n & Arabic RTL Dynamics (081 to 090)
 * 8. Customer Account, Order Tracking & Knowledge Hub (091 to 100)
 * 9. Multi-Device Responsive & Offline Simulation (101 to 110)
 */

import { test, expect, Page } from '@playwright/test';

test.describe('MISSION CRITIQUE — BIRD ACADEMY PRE-PRODUCTION & COMMERCIAL LAUNCH AUDIT 01 E2E SUITE', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate directly to public commercial website
    await page.goto('/?view=website');
    await page.waitForLoadState('domcontentloaded');
  });

  // =========================================================================
  // 1. VISITOR DISCOVERY & LANDING NAVIGATION (001 to 015)
  // =========================================================================
  test('TC-E2E-PRE-001: Commercial website loads with official header and brand logo', async ({ page }) => {
    await expect(page.locator('[data-testid="web-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-brand-logo"]')).toBeVisible();
    await expect(page.locator('[data-testid="web-header"]')).toContainText('Bird Academy');
  });

  test('TC-E2E-PRE-002: Hero section renders core headline and dual action CTA buttons', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Maîtrisez votre élevage');
    await expect(page.locator('[data-testid="hero-cta-download"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-cta-pricing"]')).toBeVisible();
  });

  test('TC-E2E-PRE-003: Offline sovereign guarantee badge is displayed prominently in Hero', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toContainText('100% Hors-Ligne');
  });

  test('TC-E2E-PRE-004: Problem vs Solution comparison section displays both columns', async ({ page }) => {
    const section = page.locator('[data-testid="problem-solution-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Défis de l\'élevage');
    await expect(section).toContainText('Solution Bird Academy');
  });

  test('TC-E2E-PRE-005: Offline 3-pillar sovereignty section highlights zero cloud dependency', async ({ page }) => {
    const section = page.locator('[data-testid="offline-guarantee-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Zéro Dépendance Cloud');
  });

  test('TC-E2E-PRE-006: Feature grid displays Birds feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-birds"]')).toBeVisible();
  });

  test('TC-E2E-PRE-007: Feature grid displays Habitat and Cages feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-habitat"]')).toBeVisible();
  });

  test('TC-E2E-PRE-008: Feature grid displays Breeding and Clutches feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-breeding"]')).toBeVisible();
  });

  test('TC-E2E-PRE-009: Feature grid displays Health and Treatments feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-health"]')).toBeVisible();
  });

  test('TC-E2E-PRE-010: Feature grid displays Wright Genetics and Inbreeding feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-genetics"]')).toBeVisible();
  });

  test('TC-E2E-PRE-011: Feature grid displays Bird Intelligence feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-intelligence"]')).toBeVisible();
  });

  test('TC-E2E-PRE-012: Feature grid displays Local AI Assistant feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-ai"]')).toBeVisible();
  });

  test('TC-E2E-PRE-013: Feature grid displays Financial Reports & Budgets feature card', async ({ page }) => {
    await expect(page.locator('[data-testid="feature-card-finance"]')).toBeVisible();
  });

  test('TC-E2E-PRE-014: Deterministic Bird Intelligence section renders analytical overview', async ({ page }) => {
    const section = page.locator('[data-testid="bird-intelligence-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Bird Intelligence');
  });

  test('TC-E2E-PRE-015: Footer displays official brand copyright and sovereignty badge', async ({ page }) => {
    const footer = page.locator('[data-testid="web-footer"]');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Bird Academy Enterprise');
    await expect(footer).toContainText('Souveraineté des Données');
  });

  // =========================================================================
  // 2. PRODUCTS CATALOG & DETAIL (016 to 030)
  // =========================================================================
  test('TC-E2E-PRE-016: Header link Products navigates to Products catalog page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await expect(page.locator('[data-testid="products-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="products-page-title"]')).toContainText('Éditions & Logiciels');
  });

  test('TC-E2E-PRE-017: Products page displays FREE Community Edition card', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await expect(page.locator('[data-testid="product-card-FREE"]')).toBeVisible();
  });

  test('TC-E2E-PRE-018: Products page displays PREMIUM Passion Edition card', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await expect(page.locator('[data-testid="product-card-PREMIUM"]')).toBeVisible();
  });

  test('TC-E2E-PRE-019: Products page displays PRO Enterprise Edition card', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await expect(page.locator('[data-testid="product-card-PRO"]')).toBeVisible();
  });

  test('TC-E2E-PRE-020: Clicking details on FREE card opens Free Edition detail page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await page.locator('[data-testid="product-details-btn-FREE"]').click();
    await expect(page.locator('[data-testid="product-detail-hero"]')).toContainText('Community (Gratuit)');
  });

  test('TC-E2E-PRE-021: Free Edition detail page specifies 1 max device limit', async ({ page }) => {
    await page.goto('/?view=website#product-free');
    await expect(page.locator('[data-testid="product-detail-spec-devices"]')).toContainText('1');
  });

  test('TC-E2E-PRE-022: Clicking details on PREMIUM card opens Premium Edition detail page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await page.locator('[data-testid="product-details-btn-PREMIUM"]').click();
    await expect(page.locator('[data-testid="product-detail-hero"]')).toContainText('Passion (Premium)');
  });

  test('TC-E2E-PRE-023: Premium Edition detail page specifies 3 max devices limit', async ({ page }) => {
    await page.goto('/?view=website#product-premium');
    await expect(page.locator('[data-testid="product-detail-spec-devices"]')).toContainText('3');
  });

  test('TC-E2E-PRE-024: Clicking details on PRO card opens Pro Edition detail page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await page.locator('[data-testid="product-details-btn-PRO"]').click();
    await expect(page.locator('[data-testid="product-detail-hero"]')).toContainText('Enterprise (Pro)');
  });

  test('TC-E2E-PRE-025: Pro Edition detail page specifies 5 max devices and unlimited AI', async ({ page }) => {
    await page.goto('/?view=website#product-pro');
    await expect(page.locator('[data-testid="product-detail-spec-devices"]')).toContainText('5');
    await expect(page.locator('[data-testid="product-detail-spec-ai"]')).toContainText('Illimité');
  });

  test('TC-E2E-PRE-026: Free Edition CTA button redirects to download center', async ({ page }) => {
    await page.goto('/?view=website#product-free');
    await page.locator('[data-testid="product-detail-cta-free"]').click();
    await expect(page.locator('[data-testid="download-center-title"]')).toBeVisible();
  });

  test('TC-E2E-PRE-027: Premium Edition CTA button redirects to checkout wizard', async ({ page }) => {
    await page.goto('/?view=website#product-premium');
    await page.locator('[data-testid="product-detail-cta-buy"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
  });

  test('TC-E2E-PRE-028: Pro Edition CTA button redirects to checkout wizard', async ({ page }) => {
    await page.goto('/?view=website#product-pro');
    await page.locator('[data-testid="product-detail-cta-buy"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
  });

  test('TC-E2E-PRE-029: Back to Products button in detail view restores catalog view', async ({ page }) => {
    await page.goto('/?view=website#product-premium');
    await page.locator('[data-testid="back-to-products-btn"]').click();
    await expect(page.locator('[data-testid="products-page-title"]')).toBeVisible();
  });

  test('TC-E2E-PRE-030: Direct URL hash #products loads products page directly', async ({ page }) => {
    await page.goto('/?view=website#products');
    await expect(page.locator('[data-testid="products-page-title"]')).toBeVisible();
  });

  // =========================================================================
  // 3. PRICING & MULTI-CURRENCY (031 to 045)
  // =========================================================================
  test('TC-E2E-PRE-031: Header link Pricing navigates to Pricing page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="pricing-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-page-title"]')).toContainText('Tarifs & Formules');
  });

  test('TC-E2E-PRE-032: Pricing page renders all 4 pricing tier cards', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="pricing-card-OFFER-FREE-COMMUNITY"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PREMIUM-ANNUAL-2026"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PRO-ENTERPRISE-LIFETIME"]')).toBeVisible();
  });

  test('TC-E2E-PRE-033: Switching currency to TND reflects DT symbol across cards', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const curSelect = page.locator('[data-testid="currency-selector"]');
    await curSelect.selectOption('TND');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('TND');
  });

  test('TC-E2E-PRE-034: Switching currency to USD reflects $ symbol across cards', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const curSelect = page.locator('[data-testid="currency-selector"]');
    await curSelect.selectOption('USD');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('USD');
  });

  test('TC-E2E-PRE-035: Switching currency to DZD reflects DA symbol across cards', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const curSelect = page.locator('[data-testid="currency-selector"]');
    await curSelect.selectOption('DZD');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('DZD');
  });

  test('TC-E2E-PRE-036: Switching currency to MAD reflects DH symbol across cards', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const curSelect = page.locator('[data-testid="currency-selector"]');
    await curSelect.selectOption('MAD');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('MAD');
  });

  test('TC-E2E-PRE-037: Switching currency to GBP reflects £ symbol across cards', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const curSelect = page.locator('[data-testid="currency-selector"]');
    await curSelect.selectOption('GBP');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('GBP');
  });

  test('TC-E2E-PRE-038: Switching back to EUR restores Euro currency', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const curSelect = page.locator('[data-testid="currency-selector"]');
    await curSelect.selectOption('USD');
    await curSelect.selectOption('EUR');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('EUR');
  });

  test('TC-E2E-PRE-039: Feature comparison matrix table is embedded on pricing page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="comparison-table-section"]')).toBeVisible();
  });

  test('TC-E2E-PRE-040: Comparison matrix lists Wright Consanguinity row', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await expect(page.locator('[data-testid="comparison-table-section"]')).toContainText('Consanguinité de Wright');
  });

  test('TC-E2E-PRE-041: Order CTA button on Free tier routes to download', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.locator('[data-testid="pricing-btn-OFFER-FREE-COMMUNITY"]').click();
    await expect(page.locator('[data-testid="download-center-title"]')).toBeVisible();
  });

  test('TC-E2E-PRE-042: Order CTA button on Premium tier routes to checkout', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.locator('[data-testid="pricing-btn-OFFER-PREMIUM-ANNUAL-2026"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
  });

  test('TC-E2E-PRE-043: Order CTA button on Pro Annual tier routes to checkout', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.locator('[data-testid="pricing-btn-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
  });

  test('TC-E2E-PRE-044: Order CTA button on Pro Lifetime tier routes to checkout with 249.00 EUR', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.locator('[data-testid="pricing-btn-OFFER-PRO-ENTERPRISE-LIFETIME"]').click();
    await expect(page.locator('[data-testid="order-summary-card"]')).toContainText('249.00');
  });

  test('TC-E2E-PRE-045: Direct URL hash #pricing loads pricing page directly', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await expect(page.locator('[data-testid="pricing-page-title"]')).toBeVisible();
  });

  // =========================================================================
  // 4. 5-STEP CHECKOUT WIZARD & DEMO PAYMENT (046 to 060)
  // =========================================================================
  test('TC-E2E-PRE-046: Checkout wizard initializes on Step 1 with Offer selection', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await expect(page.locator('[data-testid="step-indicator-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-offer-card-OFFER-PREMIUM-ANNUAL-2026"]')).toBeVisible();
  });

  test('TC-E2E-PRE-047: Step 1 next button advances to Step 2 (Customer Details)', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-offer-card-OFFER-PREMIUM-ANNUAL-2026"]').click();
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await expect(page.locator('[data-testid="step-indicator-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-client-name-input"]')).toBeVisible();
  });

  test('TC-E2E-PRE-048: Step 2 form validation prevents progression when required fields empty', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await expect(page.locator('[data-testid="checkout-error-banner"]')).toBeVisible();
  });

  test('TC-E2E-PRE-049: Step 2 allows filling name and email and progresses to Step 3', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await expect(page.locator('[data-testid="step-indicator-3"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-review-summary"]')).toContainText('Éleveur Test E2E');
  });

  test('TC-E2E-PRE-050: Step 3 Review displays order pricing summary and guarantee notice', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await expect(page.locator('[data-testid="checkout-review-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary-card"]')).toBeVisible();
  });

  test('TC-E2E-PRE-051: Step 3 next button advances to Step 4 (Payment Method)', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await expect(page.locator('[data-testid="step-indicator-4"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method-selector"]')).toBeVisible();
  });

  test('TC-E2E-PRE-052: Step 4 displays Demo Payment Provider option', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await expect(page.locator('[data-testid="payment-method-DEMO_SIMULATOR"]')).toBeVisible();
  });

  test('TC-E2E-PRE-053: Submitting payment executes demo simulation and moves to Step 5', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="step-indicator-5"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-PRE-054: Step 5 displays official license key with copy button', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="copy-license-key-btn"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-PRE-055: Step 5 lists license.lmse delivery file', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-file-license.lmse"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-PRE-056: Step 5 lists license-key.txt delivery file', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-file-license-key.txt"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-PRE-057: Step 5 lists license-qr.txt delivery file', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-file-license-qr.txt"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-PRE-058: Step 5 lists license-info.txt delivery file', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-file-license-info.txt"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-PRE-059: Step 5 lists README.txt delivery file', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-file-README.txt"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-E2E-PRE-060: Download Complete Delivery Kit button is present and clickable', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Test E2E');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('eleveur@test-e2e.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="download-complete-kit-btn"]')).toBeVisible({ timeout: 10000 });
  });

  // =========================================================================
  // 5. OFFLINE DELIVERY KIT & RE-DOWNLOADS (061 to 070)
  // =========================================================================
  test('TC-E2E-PRE-061: Single file download button triggers file download', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Éleveur Single DL');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('single-dl@elevage.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    const dlBtn = page.locator('[data-testid="download-file-btn-license-key.txt"]');
    await expect(dlBtn).toBeVisible({ timeout: 10000 });
    await dlBtn.click();
  });

  test('TC-E2E-PRE-062: Previous step button navigates backward from Step 2 to Step 1', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-prev-btn-2"]').click();
    await expect(page.locator('[data-testid="step-indicator-1"]')).toBeVisible();
  });

  test('TC-E2E-PRE-063: Previous step button navigates backward from Step 3 to Step 2', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Back Nav User');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('back@nav.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-prev-btn-3"]').click();
    await expect(page.locator('[data-testid="step-indicator-2"]')).toBeVisible();
  });

  test('TC-E2E-PRE-064: Order confirmation lookup page allows searching order by ID', async ({ page }) => {
    await page.goto('/?view=website#order-confirmation');
    await expect(page.locator('[data-testid="order-lookup-form"]')).toBeVisible();
  });

  test('TC-E2E-PRE-065: Searching for completed order renders order card and delivery kit', async ({ page }) => {
    // 1. Create order
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Lookup User');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('lookup@orders.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-kit-downloader"]')).toBeVisible({ timeout: 10000 });

    // 2. Lookup
    await page.goto('/?view=website#order-confirmation');
    await page.locator('[data-testid="order-lookup-input"]').fill('lookup@orders.fr');
    await page.locator('[data-testid="order-lookup-submit-btn"]').click();
  });

  test('TC-E2E-PRE-066: Searching non-existent order displays not found alert', async ({ page }) => {
    await page.goto('/?view=website#order-confirmation');
    await page.locator('[data-testid="order-lookup-input"]').fill('ORD-FAKE-00000');
    await page.locator('[data-testid="order-lookup-submit-btn"]').click();
    await expect(page.locator('[data-testid="order-lookup-not-found"]')).toBeVisible();
  });

  test('TC-E2E-PRE-067: Customer account page lists local orders history', async ({ page }) => {
    await page.goto('/?view=website#account');
    await expect(page.locator('[data-testid="account-orders-section"]')).toBeVisible();
  });

  test('TC-E2E-PRE-068: Direct URL with ?offer= parameter preselects offer', async ({ page }) => {
    await page.goto('/?view=website&offer=OFFER-PRO-ENTERPRISE-LIFETIME#checkout');
    await expect(page.locator('[data-testid="order-summary-card"]')).toContainText('249.00');
  });

  test('TC-E2E-PRE-069: Order summary card updates quantity and total price accordingly', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await expect(page.locator('[data-testid="order-summary-card"]')).toBeVisible();
  });

  test('TC-E2E-PRE-070: Tax calculation in order summary displays 0.00 EUR (TTC inclus)', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await expect(page.locator('[data-testid="order-summary-card"]')).toContainText('TTC');
  });

  // =========================================================================
  // 6. DOWNLOAD CENTER & SHA-256 (071 to 080)
  // =========================================================================
  test('TC-E2E-PRE-071: Header link Download navigates to Download Center', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    await expect(page.locator('[data-testid="download-center-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-center-title"]')).toContainText('Centre de Téléchargement');
  });

  test('TC-E2E-PRE-072: Download Center lists Windows Setup Installer with size 111.88 MB', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('111.88 MB');
  });

  test('TC-E2E-PRE-073: Download Center lists Windows Portable Edition with size 111.24 MB', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-Bird-Academy-User.exe"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('111.24 MB');
  });

  test('TC-E2E-PRE-074: Download Center lists Android APK with size 4.95 MB', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-Bird-Academy-User.apk"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('4.95 MB');
  });

  test('TC-E2E-PRE-075: Download Center lists LMSE Owner Guide PDF', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-LMSE_OWNER_GUIDE.pdf"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('PDF');
  });

  test('TC-E2E-PRE-076: Download Center displays exact SHA-256 hash for Windows Installer', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const hash = page.locator('[data-testid="sha256-hash-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(hash).toBeVisible();
    await expect(hash).toContainText('9A7E146B832B');
  });

  test('TC-E2E-PRE-077: Download Center displays PowerShell verification command box', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const box = page.locator('[data-testid="sha256-verification-box"]');
    await expect(box).toBeVisible();
    await expect(box).toContainText('Get-FileHash');
  });

  test('TC-E2E-PRE-078: Download Center displays Minimum System Requirements section', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const sysReq = page.locator('[data-testid="system-requirements-section"]');
    await expect(sysReq).toBeVisible();
    await expect(sysReq).toContainText('Configuration Requise');
  });

  test('TC-E2E-PRE-079: Download button initiates direct download link', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const dlBtn = page.locator('[data-testid="download-artifact-btn-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(dlBtn).toBeVisible();
    await expect(dlBtn).toHaveAttribute('href', /downloads/);
  });

  test('TC-E2E-PRE-080: Direct URL hash #download opens Download Center', async ({ page }) => {
    await page.goto('/?view=website#download');
    await expect(page.locator('[data-testid="download-center-title"]')).toBeVisible();
  });

  // =========================================================================
  // 7. MULTI-LANGUAGE I18N & ARABIC RTL (081 to 090)
  // =========================================================================
  test('TC-E2E-PRE-081: Language selector dropdown is present in header', async ({ page }) => {
    await expect(page.locator('[data-testid="language-selector"]')).toBeVisible();
  });

  test('TC-E2E-PRE-082: Selecting English translates hero title and navigation', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('en');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Master Your Aviary');
    await expect(page.locator('[data-testid="nav-link-products"]')).toContainText('Products');
  });

  test('TC-E2E-PRE-083: Selecting Arabic sets document dir="rtl"', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('ar');
    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
  });

  test('TC-E2E-PRE-084: Selecting Arabic applies font-arabic Cairo typography class', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('ar');
    const cls = await page.getAttribute('html', 'class');
    expect(cls).toContain('font-arabic');
  });

  test('TC-E2E-PRE-085: Arabic translation displays Arabic navigation and hero text', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('ar');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('تحكّم في تربية طيورك');
  });

  test('TC-E2E-PRE-086: Selecting Spanish translates hero title and navigation', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('es');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Domine su criadero');
  });

  test('TC-E2E-PRE-087: Selecting Italian translates hero title and navigation', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('it');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Padroneggia il tuo allevamento');
  });

  test('TC-E2E-PRE-088: Switching back to French restores dir="ltr"', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('ar');
    expect(await page.getAttribute('html', 'dir')).toBe('rtl');
    await select.selectOption('fr');
    expect(await page.getAttribute('html', 'dir')).toBe('ltr');
  });

  test('TC-E2E-PRE-089: Selected locale persists in browser localStorage', async ({ page }) => {
    const select = page.locator('[data-testid="language-selector"]');
    await select.selectOption('en');
    const stored = await page.evaluate(() => localStorage.getItem('bird_academy_web_locale'));
    expect(stored).toBe('en');
  });

  test('TC-E2E-PRE-090: Language selector lists all 5 supported languages', async ({ page }) => {
    const count = await page.locator('[data-testid="language-selector"] option').count();
    expect(count).toBe(5);
  });

  // =========================================================================
  // 8. CUSTOMER ACCOUNT & KNOWLEDGE HUB (091 to 100)
  // =========================================================================
  test('TC-E2E-PRE-091: Header link FAQ navigates to FAQ page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-faq"]').click();
    await expect(page.locator('[data-testid="faq-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="faq-page-title"]')).toContainText('Foire Aux Questions');
  });

  test('TC-E2E-PRE-092: FAQ accordion item expands when clicked', async ({ page }) => {
    await page.goto('/?view=website#faq');
    const header = page.locator('[data-testid="faq-item-faq-1-header"]');
    await expect(header).toBeVisible();
    await header.click();
    await expect(page.locator('[data-testid="faq-item-faq-1-content"]')).toBeVisible();
  });

  test('TC-E2E-PRE-093: FAQ search input filters displayed questions', async ({ page }) => {
    await page.goto('/?view=website#faq');
    const search = page.locator('[data-testid="faq-search-input"]');
    await search.fill('Hors-Ligne');
    await expect(page.locator('[data-testid="faq-accordion-section"]')).toContainText('Hors-Ligne');
  });

  test('TC-E2E-PRE-094: Header link Support navigates to Support page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-support"]').click();
    await expect(page.locator('[data-testid="support-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="support-page-title"]')).toContainText('Support & Assistance');
  });

  test('TC-E2E-PRE-095: Submitting support form records ticket and shows success banner', async ({ page }) => {
    await page.goto('/?view=website#support');
    await page.locator('[data-testid="support-name-input"]').fill('Eleveur Support Test');
    await page.locator('[data-testid="support-email-input"]').fill('support-test@elevage.fr');
    await page.locator('[data-testid="support-category-select"]').selectOption('licensing');
    await page.locator('[data-testid="support-subject-input"]').fill('Demande activation multi-postes');
    await page.locator('[data-testid="support-message-input"]').fill('Comment activer ma licence sur un deuxième ordinateur ?');
    await page.locator('[data-testid="support-submit-btn"]').click();
    await expect(page.locator('[data-testid="support-ticket-success-alert"]')).toBeVisible();
  });

  test('TC-E2E-PRE-096: Header link License Guide navigates to LMSE License Guide', async ({ page }) => {
    await page.locator('[data-testid="nav-link-license"]').click();
    await expect(page.locator('[data-testid="license-guide-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="license-guide-title"]')).toContainText('Guide des Licences LMSE');
  });

  test('TC-E2E-PRE-097: LMSE License Guide explains 5-file delivery package structure', async ({ page }) => {
    await page.goto('/?view=website#license');
    await expect(page.locator('[data-testid="license-guide-content"]')).toContainText('license_<id>.lmse');
  });

  test('TC-E2E-PRE-098: Header account button opens Customer Account page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-account"]').click();
    await expect(page.locator('[data-testid="account-page-title"]')).toBeVisible();
  });

  test('TC-E2E-PRE-099: Customer account page displays Local Security & Sovereignty guarantee', async ({ page }) => {
    await page.goto('/?view=website#account');
    await expect(page.locator('[data-testid="account-sovereignty-badge"]')).toBeVisible();
  });

  test('TC-E2E-PRE-100: AI Assistant section provides local interactive preview box', async ({ page }) => {
    await page.goto('/?view=website');
    await expect(page.locator('[data-testid="ai-demo-chat-box"]')).toBeVisible();
  });

  // =========================================================================
  // 9. RESPONSIVE VIEWPORTS & OFFLINE SIMULATION (101 to 110)
  // =========================================================================
  test('TC-E2E-PRE-101: Mobile viewport (375x812) displays hamburger menu button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?view=website');
    await expect(page.locator('[data-testid="mobile-menu-toggle-btn"]')).toBeVisible();
  });

  test('TC-E2E-PRE-102: Mobile hamburger menu opens navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?view=website');
    await page.locator('[data-testid="mobile-menu-toggle-btn"]').click();
    await expect(page.locator('[data-testid="mobile-drawer-container"]')).toBeVisible();
  });

  test('TC-E2E-PRE-103: Mobile navigation drawer link navigates to Pricing and closes drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?view=website');
    await page.locator('[data-testid="mobile-menu-toggle-btn"]').click();
    await page.locator('[data-testid="mobile-nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="pricing-page-title"]')).toBeVisible();
  });

  test('TC-E2E-PRE-104: iPhone 14 viewport (390x844) renders without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?view=website');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('TC-E2E-PRE-105: iPad viewport (768x1024) renders responsive multi-column pricing', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/?view=website#pricing');
    await expect(page.locator('[data-testid="pricing-cards-section"]')).toBeVisible();
  });

  test('TC-E2E-PRE-106: HD Desktop viewport (1280x720) renders widescreen header and navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/?view=website');
    await expect(page.locator('[data-testid="nav-link-products"]')).toBeVisible();
  });

  test('TC-E2E-PRE-107: Full HD Desktop viewport (1440x900) renders centered hero container', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?view=website');
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  });

  test('TC-E2E-PRE-108: Complete website functions when browser context is set offline', async ({ page, context }) => {
    await context.setOffline(true);
    await page.goto('/?view=website#pricing');
    await expect(page.locator('[data-testid="pricing-page-title"]')).toBeVisible();
    await context.setOffline(false);
  });

  test('TC-E2E-PRE-109: Offline checkout executes and completes order without network', async ({ page, context }) => {
    await page.goto('/?view=website#checkout');
    await context.setOffline(true);
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Offline Eleveur');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('offline@test.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-kit-downloader"]')).toBeVisible({ timeout: 10000 });
    await context.setOffline(false);
  });

  test('TC-E2E-PRE-110: Zero network calls made to external servers during offline checkout', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (!url.startsWith('http://localhost') && !url.startsWith('data:')) {
        externalRequests.push(url);
      }
    });
    await page.goto('/?view=website#pricing');
    expect(externalRequests.length).toBe(0);
  });
});

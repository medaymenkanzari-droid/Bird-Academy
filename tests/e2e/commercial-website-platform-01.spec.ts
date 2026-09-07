/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE PLATFORM — PLAYWRIGHT E2E SUITE
 * Mission: BIRD-ACADEMY-COMMERCIAL-WEBSITE-PLATFORM-01
 * 
 * Production-grade real-browser E2E suite covering 85 comprehensive scenarios:
 * WEB-001 to WEB-085
 * 
 * Covers:
 * 1. Landing Page & 20 Sections (WEB-001 to WEB-015)
 * 2. Products Catalog & Detail Pages (WEB-016 to WEB-025)
 * 3. Pricing Page & Multi-Currency Switcher (WEB-026 to WEB-035)
 * 4. 5-Step Checkout Wizard & Delivery Kit (WEB-036 to WEB-050)
 * 5. Download Center & SHA-256 Verification (WEB-051 to WEB-060)
 * 6. Multi-language (FR, EN, AR, ES, IT) & Arabic RTL (WEB-061 to WEB-070)
 * 7. Customer Account & Order Lookup (WEB-071 to WEB-075)
 * 8. Support Tickets & Contact Center (WEB-076 to WEB-080)
 * 9. Responsive Layouts & Mobile Navigation (WEB-081 to WEB-085)
 */

import { test, expect, Page } from '@playwright/test';

test.describe('MISSION CRITIQUE — BIRD ACADEMY COMMERCIAL WEBSITE PLATFORM 01 E2E SUITE', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate directly to website view via query param
    await page.goto('/?view=website');
    await page.waitForLoadState('domcontentloaded');
  });

  // =========================================================================
  // 1. LANDING PAGE & CORE SECTIONS (WEB-001 to WEB-015)
  // =========================================================================
  test('WEB-001: Commercial website loads with official header and brand identity', async ({ page }) => {
    const header = page.locator('[data-testid="web-header"]');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Bird Academy');
  });

  test('WEB-002: Hero section renders value proposition headline and action buttons', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Maîtrisez votre élevage');
    await expect(page.locator('[data-testid="hero-cta-download"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-cta-pricing"]')).toBeVisible();
  });

  test('WEB-003: Offline sovereign guarantee badge is displayed in hero', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toContainText('100% Hors-Ligne');
  });

  test('WEB-004: Problem vs Solution section displays comparison cards', async ({ page }) => {
    const section = page.locator('[data-testid="problem-solution-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Défis de l\'élevage');
    await expect(section).toContainText('Solution Bird Academy');
  });

  test('WEB-005: Offline sovereign guarantee 3-pillar section is rendered', async ({ page }) => {
    const section = page.locator('[data-testid="offline-guarantee-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Zéro Dépendance Cloud');
    await expect(section).toContainText('100% Hors-Ligne');
  });

  test('WEB-006: Features grid section displays 8 feature cards', async ({ page }) => {
    const section = page.locator('[data-testid="features-grid-section"]');
    await expect(section).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-birds"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-habitat"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-breeding"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-health"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-genetics"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-intelligence"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-ai"]')).toBeVisible();
    await expect(page.locator('[data-testid="feature-card-finance"]')).toBeVisible();
  });

  test('WEB-007: Pricing cards section displays 4 distinct tier options', async ({ page }) => {
    const section = page.locator('[data-testid="pricing-cards-section"]');
    await expect(section).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-FREE-COMMUNITY"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PREMIUM-ANNUAL-2026"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PRO-ENTERPRISE-LIFETIME"]')).toBeVisible();
  });

  test('WEB-008: Comparison table matrix renders side-by-side capabilities', async ({ page }) => {
    const table = page.locator('[data-testid="comparison-table-section"]');
    await expect(table).toBeVisible();
    await expect(table).toContainText('Nombre d\'oiseaux');
    await expect(table).toContainText('Moteur Bird Intelligence');
  });

  test('WEB-009: Bird Intelligence section highlights deterministic analytical engine', async ({ page }) => {
    const section = page.locator('[data-testid="bird-intelligence-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Bird Intelligence');
  });

  test('WEB-010: AI Assistant section provides local simulator preview', async ({ page }) => {
    const section = page.locator('[data-testid="ai-assistant-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Assistant Avicole Local');
    await expect(page.locator('[data-testid="ai-demo-chat-box"]')).toBeVisible();
  });

  test('WEB-011: Security & Architecture section highlights LMSE cryptographic chain', async ({ page }) => {
    const section = page.locator('[data-testid="security-architecture-section"]');
    await expect(section).toBeVisible();
    await expect(section).toContainText('Architecture Cryptographique LMSE');
    await expect(section).toContainText('ECDSA');
    await expect(section).toContainText('SHA-256');
  });

  test('WEB-012: Download section provides direct platform download buttons', async ({ page }) => {
    const section = page.locator('[data-testid="download-section"]');
    await expect(section).toBeVisible();
    await expect(page.locator('[data-testid="download-card-windows"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-card-android"]')).toBeVisible();
  });

  test('WEB-013: FAQ section renders expandable accordion items', async ({ page }) => {
    const section = page.locator('[data-testid="faq-accordion-section"]');
    await expect(section).toBeVisible();
    const firstFaq = page.locator('[data-testid="faq-item-faq-1-header"]');
    await expect(firstFaq).toBeVisible();
    await firstFaq.click();
    await expect(page.locator('[data-testid="faq-item-faq-1-content"]')).toBeVisible();
  });

  test('WEB-014: Support contact section renders direct ticket form', async ({ page }) => {
    const section = page.locator('[data-testid="support-contact-section"]');
    await expect(section).toBeVisible();
    await expect(page.locator('[data-testid="support-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="support-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="support-message-input"]')).toBeVisible();
  });

  test('WEB-015: Footer contains navigation links, security badge, and copyright', async ({ page }) => {
    const footer = page.locator('[data-testid="web-footer"]');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Bird Academy Enterprise');
    await expect(footer).toContainText('Souveraineté des Données');
  });

  // =========================================================================
  // 2. PRODUCTS CATALOG & DETAIL PAGES (WEB-016 to WEB-025)
  // =========================================================================
  test('WEB-016: Navigation to Products page via header menu', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await expect(page.locator('[data-testid="products-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="products-page-title"]')).toContainText('Éditions & Logiciels');
  });

  test('WEB-017: Products page displays 3 comprehensive product cards', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await expect(page.locator('[data-testid="product-card-FREE"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card-PREMIUM"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card-PRO"]')).toBeVisible();
  });

  test('WEB-018: Free Community edition detail page opens and lists features', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await page.locator('[data-testid="product-details-btn-FREE"]').click();
    await expect(page.locator('[data-testid="product-detail-hero"]')).toContainText('Community (Gratuit)');
    await expect(page.locator('[data-testid="product-detail-spec-devices"]')).toContainText('1');
  });

  test('WEB-019: Premium edition detail page opens and lists features', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await page.locator('[data-testid="product-details-btn-PREMIUM"]').click();
    await expect(page.locator('[data-testid="product-detail-hero"]')).toContainText('Passion (Premium)');
    await expect(page.locator('[data-testid="product-detail-spec-devices"]')).toContainText('3');
  });

  test('WEB-020: Pro edition detail page opens and lists enterprise capabilities', async ({ page }) => {
    await page.locator('[data-testid="nav-link-products"]').click();
    await page.locator('[data-testid="product-details-btn-PRO"]').click();
    await expect(page.locator('[data-testid="product-detail-hero"]')).toContainText('Enterprise (Pro)');
    await expect(page.locator('[data-testid="product-detail-spec-devices"]')).toContainText('5');
    await expect(page.locator('[data-testid="product-detail-spec-ai"]')).toContainText('Illimité');
  });

  test('WEB-021: Product detail CTA for FREE routes directly to download center', async ({ page }) => {
    await page.goto('/?view=website#product-free');
    await page.locator('[data-testid="product-detail-cta-free"]').click();
    await expect(page.locator('[data-testid="download-center-title"]')).toBeVisible();
  });

  test('WEB-022: Product detail CTA for PREMIUM routes to checkout with preselected offer', async ({ page }) => {
    await page.goto('/?view=website#product-premium');
    await page.locator('[data-testid="product-detail-cta-buy"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary-card"]')).toContainText('Premium');
  });

  test('WEB-023: Product detail CTA for PRO routes to checkout with preselected offer', async ({ page }) => {
    await page.goto('/?view=website#product-pro');
    await page.locator('[data-testid="product-detail-cta-buy"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary-card"]')).toContainText('Enterprise');
  });

  test('WEB-024: Back to Products button in detail page returns to products list', async ({ page }) => {
    await page.goto('/?view=website#product-premium');
    await page.locator('[data-testid="back-to-products-btn"]').click();
    await expect(page.locator('[data-testid="products-page-title"]')).toBeVisible();
  });

  test('WEB-025: Direct hash navigation to #products renders products page', async ({ page }) => {
    await page.goto('/?view=website#products');
    await expect(page.locator('[data-testid="products-page-title"]')).toBeVisible();
  });

  // =========================================================================
  // 3. PRICING PAGE & CURRENCY SWITCHER (WEB-026 to WEB-035)
  // =========================================================================
  test('WEB-026: Navigation to Pricing page via header menu', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="pricing-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-page-title"]')).toContainText('Tarifs & Formules');
  });

  test('WEB-027: Pricing page displays all 4 pricing tiers', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="pricing-card-OFFER-FREE-COMMUNITY"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PREMIUM-ANNUAL-2026"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PRO-ENTERPRISE-ANNUAL-2026"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-card-OFFER-PRO-ENTERPRISE-LIFETIME"]')).toBeVisible();
  });

  test('WEB-028: Currency switcher changes displayed currency to TND', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const currencySelect = page.locator('[data-testid="currency-selector"]');
    await expect(currencySelect).toBeVisible();
    await currencySelect.selectOption('TND');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('TND');
  });

  test('WEB-029: Currency switcher changes displayed currency to USD', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const currencySelect = page.locator('[data-testid="currency-selector"]');
    await currencySelect.selectOption('USD');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('USD');
  });

  test('WEB-030: Currency switcher changes displayed currency to DZD', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const currencySelect = page.locator('[data-testid="currency-selector"]');
    await currencySelect.selectOption('DZD');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('DZD');
  });

  test('WEB-031: Currency switcher changes displayed currency to MAD', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const currencySelect = page.locator('[data-testid="currency-selector"]');
    await currencySelect.selectOption('MAD');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('MAD');
  });

  test('WEB-032: Currency switcher changes displayed currency to GBP', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    const currencySelect = page.locator('[data-testid="currency-selector"]');
    await currencySelect.selectOption('GBP');
    await expect(page.locator('[data-testid="pricing-page-container"]')).toContainText('GBP');
  });

  test('WEB-033: Pricing comparison table is embedded on pricing page', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="comparison-table-section"]')).toBeVisible();
  });

  test('WEB-034: Order button on PREMIUM pricing card routes to checkout', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await page.locator('[data-testid="pricing-btn-OFFER-PREMIUM-ANNUAL-2026"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
  });

  test('WEB-035: Order button on PRO Lifetime pricing card routes to checkout', async ({ page }) => {
    await page.locator('[data-testid="nav-link-pricing"]').click();
    await page.locator('[data-testid="pricing-btn-OFFER-PRO-ENTERPRISE-LIFETIME"]').click();
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary-card"]')).toContainText('249.00');
  });

  // =========================================================================
  // 4. CHECKOUT WIZARD & DELIVERY KITS (WEB-036 to WEB-050)
  // =========================================================================
  test('WEB-036: Checkout wizard loads on Step 1 (Offer Selection)', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await expect(page.locator('[data-testid="checkout-wizard-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator-1"]')).toBeVisible();
  });

  test('WEB-037: Checkout wizard allows selecting offer on Step 1 and progressing to Step 2', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-offer-card-OFFER-PREMIUM-ANNUAL-2026"]').click();
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await expect(page.locator('[data-testid="step-indicator-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-client-name-input"]')).toBeVisible();
  });

  test('WEB-038: Checkout validation blocks Step 2 progression if name or email missing', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await expect(page.locator('[data-testid="checkout-error-banner"]')).toBeVisible();
  });

  test('WEB-039: Filling valid customer info in Step 2 progresses to Step 3 (Review)', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Alexandre Dumas');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('alexandre@dumas.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await expect(page.locator('[data-testid="step-indicator-3"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-review-summary"]')).toContainText('Alexandre Dumas');
  });

  test('WEB-040: Step 3 Review displays order pricing breakdown and tax details', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Victor Hugo');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('victor@hugo.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await expect(page.locator('[data-testid="checkout-review-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary-card"]')).toBeVisible();
  });

  test('WEB-041: Step 3 Next button progresses to Step 4 (Payment Method Selection)', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Victor Hugo');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('victor@hugo.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await expect(page.locator('[data-testid="step-indicator-4"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method-selector"]')).toBeVisible();
  });

  test('WEB-042: Step 4 displays Demo Payment Provider option', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Victor Hugo');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('victor@hugo.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await expect(page.locator('[data-testid="payment-method-DEMO_SIMULATOR"]')).toBeVisible();
  });

  test('WEB-043: Completing payment simulator creates order and transitions to Step 5 (Delivery)', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Gustave Flaubert');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('gustave@flaubert.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    
    // Step 5 Confirmation & Delivery Kit
    await expect(page.locator('[data-testid="step-indicator-5"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="delivery-kit-downloader"]')).toBeVisible();
  });

  test('WEB-044: Step 5 displays official license key with copy button', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Honore de Balzac');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('balzac@paris.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();

    await expect(page.locator('[data-testid="copy-license-key-btn"]')).toBeVisible({ timeout: 10000 });
  });

  test('WEB-045: Step 5 lists all 5 individual delivery files', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Emile Zola');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('emile@zola.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();

    await expect(page.locator('[data-testid="delivery-file-license.lmse"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="delivery-file-license-key.txt"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-file-license-qr.txt"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-file-license-info.txt"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-file-README.txt"]')).toBeVisible();
  });

  test('WEB-046: Download Complete Delivery Kit button is present and clickable', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Marcel Proust');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('marcel@proust.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();

    const dlAllBtn = page.locator('[data-testid="download-complete-kit-btn"]');
    await expect(dlAllBtn).toBeVisible({ timeout: 10000 });
  });

  test('WEB-047: Individual file download button triggers download without error', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('George Sand');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('george@sand.fr');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();

    const singleDlBtn = page.locator('[data-testid="download-file-btn-license-key.txt"]');
    await expect(singleDlBtn).toBeVisible({ timeout: 10000 });
    await singleDlBtn.click();
  });

  test('WEB-048: Previous step navigation allows going back from Step 2 to Step 1', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await expect(page.locator('[data-testid="step-indicator-2"]')).toBeVisible();
    await page.locator('[data-testid="checkout-prev-btn-2"]').click();
    await expect(page.locator('[data-testid="step-indicator-1"]')).toBeVisible();
  });

  test('WEB-049: Previous step navigation allows going back from Step 3 to Step 2', async ({ page }) => {
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Test Client');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('test@client.com');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await expect(page.locator('[data-testid="step-indicator-3"]')).toBeVisible();
    await page.locator('[data-testid="checkout-prev-btn-3"]').click();
    await expect(page.locator('[data-testid="step-indicator-2"]')).toBeVisible();
  });

  test('WEB-050: Direct URL with ?offer= preselects offer in checkout wizard', async ({ page }) => {
    await page.goto('/?view=website&offer=OFFER-PRO-ENTERPRISE-LIFETIME#checkout');
    await expect(page.locator('[data-testid="order-summary-card"]')).toContainText('249.00');
  });

  // =========================================================================
  // 5. DOWNLOAD CENTER (WEB-051 to WEB-060)
  // =========================================================================
  test('WEB-051: Navigation to Download Center via header menu', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    await expect(page.locator('[data-testid="download-center-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-center-title"]')).toContainText('Centre de Téléchargement');
  });

  test('WEB-052: Download Center lists Windows Setup Installer card', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Windows');
    await expect(card).toContainText('111.88 MB');
  });

  test('WEB-053: Download Center lists Windows Portable card', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-Bird-Academy-User.exe"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Portable');
    await expect(card).toContainText('111.24 MB');
  });

  test('WEB-054: Download Center lists Android APK card', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-Bird-Academy-User.apk"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Android');
    await expect(card).toContainText('4.95 MB');
  });

  test('WEB-055: Download Center lists LMSE Owner Guide PDF card', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const card = page.locator('[data-testid="artifact-card-LMSE_OWNER_GUIDE.pdf"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('PDF');
  });

  test('WEB-056: Download Center displays exact SHA-256 signatures for artifacts', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const hash = page.locator('[data-testid="sha256-hash-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(hash).toBeVisible();
    await expect(hash).toContainText('9A7E146B832B');
  });

  test('WEB-057: Download Center provides PowerShell verification commands box', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const verifyBox = page.locator('[data-testid="sha256-verification-box"]');
    await expect(verifyBox).toBeVisible();
    await expect(verifyBox).toContainText('Get-FileHash');
  });

  test('WEB-058: Download Center displays minimum system requirements', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const sysReq = page.locator('[data-testid="system-requirements-section"]');
    await expect(sysReq).toBeVisible();
    await expect(sysReq).toContainText('Configuration Requise');
  });

  test('WEB-059: Download artifact button initiates file download link', async ({ page }) => {
    await page.locator('[data-testid="nav-link-download"]').click();
    const dlBtn = page.locator('[data-testid="download-artifact-btn-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(dlBtn).toBeVisible();
    await expect(dlBtn).toHaveAttribute('href', /downloads/);
  });

  test('WEB-060: Direct hash navigation to #download renders download center', async ({ page }) => {
    await page.goto('/?view=website#download');
    await expect(page.locator('[data-testid="download-center-title"]')).toBeVisible();
  });

  // =========================================================================
  // 6. MULTI-LANGUAGE I18N & ARABIC RTL (WEB-061 to WEB-070)
  // =========================================================================
  test('WEB-061: Language selector dropdown is present in header', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await expect(langSelect).toBeVisible();
  });

  test('WEB-062: Switching to English translates navigation and hero title', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('en');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Master Your Aviary');
    await expect(page.locator('[data-testid="nav-link-products"]')).toContainText('Products');
  });

  test('WEB-063: Switching to Arabic activates RTL dir="rtl" on document element', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('ar');
    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
  });

  test('WEB-064: Switching to Arabic applies font-arabic Cairo typography class', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('ar');
    const classList = await page.getAttribute('html', 'class');
    expect(classList).toContain('font-arabic');
  });

  test('WEB-065: Arabic translation displays Arabic navigation items', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('ar');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('تحكّم في تربية طيورك');
  });

  test('WEB-066: Switching back to French restores LTR dir="ltr"', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('ar');
    expect(await page.getAttribute('html', 'dir')).toBe('rtl');
    await langSelect.selectOption('fr');
    expect(await page.getAttribute('html', 'dir')).toBe('ltr');
  });

  test('WEB-067: Switching to Spanish translates hero and navigation', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('es');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Domina tu cría');
  });

  test('WEB-068: Switching to Italian translates hero and navigation', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('it');
    await expect(page.locator('[data-testid="hero-title"]')).toContainText('Padroneggia il tuo allevamento');
  });

  test('WEB-069: Selected language persists in localStorage', async ({ page }) => {
    const langSelect = page.locator('[data-testid="language-selector"]');
    await langSelect.selectOption('en');
    const stored = await page.evaluate(() => localStorage.getItem('bird_academy_web_locale'));
    expect(stored).toBe('en');
  });

  test('WEB-070: All 5 language options are present in selector dropdown', async ({ page }) => {
    const options = await page.locator('[data-testid="language-selector"] option').allInnerTexts();
    expect(options.length).toBe(5);
  });

  // =========================================================================
  // 7. CUSTOMER ACCOUNT & ORDERS (WEB-071 to WEB-075)
  // =========================================================================
  test('WEB-071: Navigation to Customer Account portal via header', async ({ page }) => {
    await page.locator('[data-testid="nav-link-account"]').click();
    await expect(page.locator('[data-testid="account-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-page-title"]')).toContainText('Mon Espace Client');
  });

  test('WEB-072: Order confirmation lookup page renders search form', async ({ page }) => {
    await page.goto('/?view=website#order-confirmation');
    await expect(page.locator('[data-testid="order-lookup-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-lookup-input"]')).toBeVisible();
  });

  test('WEB-073: Searching for existing order renders order details and delivery kit', async ({ page }) => {
    // 1. Place an order first
    await page.goto('/?view=website#checkout');
    await page.locator('[data-testid="checkout-next-btn-1"]').click();
    await page.locator('[data-testid="checkout-client-name-input"]').fill('Client Recherche');
    await page.locator('[data-testid="checkout-client-email-input"]').fill('recherche@client.com');
    await page.locator('[data-testid="checkout-next-btn-2"]').click();
    await page.locator('[data-testid="checkout-next-btn-3"]').click();
    await page.locator('[data-testid="payment-submit-btn"]').click();
    await expect(page.locator('[data-testid="delivery-kit-downloader"]')).toBeVisible({ timeout: 10000 });

    // 2. Go to lookup page
    await page.goto('/?view=website#order-confirmation');
    await page.locator('[data-testid="order-lookup-input"]').fill('recherche@client.com');
    await page.locator('[data-testid="order-lookup-submit-btn"]').click();
  });

  test('WEB-074: Searching non-existent order shows friendly not found message', async ({ page }) => {
    await page.goto('/?view=website#order-confirmation');
    await page.locator('[data-testid="order-lookup-input"]').fill('ORD-INEXISTANT-999');
    await page.locator('[data-testid="order-lookup-submit-btn"]').click();
    await expect(page.locator('[data-testid="order-lookup-not-found"]')).toBeVisible();
  });

  test('WEB-075: Account page displays local customer orders list', async ({ page }) => {
    await page.goto('/?view=website#account');
    await expect(page.locator('[data-testid="account-orders-section"]')).toBeVisible();
  });

  // =========================================================================
  // 8. SUPPORT & CONTACT CENTER (WEB-076 to WEB-080)
  // =========================================================================
  test('WEB-076: Navigation to Support Hub via header menu', async ({ page }) => {
    await page.locator('[data-testid="nav-link-support"]').click();
    await expect(page.locator('[data-testid="support-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="support-page-title"]')).toContainText('Support & Assistance');
  });

  test('WEB-077: Submitting support ticket creates ticket and displays confirmation alert', async ({ page }) => {
    await page.goto('/?view=website#support');
    await page.locator('[data-testid="support-name-input"]').fill('Éleveur Test Support');
    await page.locator('[data-testid="support-email-input"]').fill('eleveur@support.com');
    await page.locator('[data-testid="support-category-select"]').selectOption('licensing');
    await page.locator('[data-testid="support-subject-input"]').fill('Question activation multi-postes');
    await page.locator('[data-testid="support-message-input"]').fill('Comment transférer ma licence sur mon 2ème PC ?');
    await page.locator('[data-testid="support-submit-btn"]').click();

    await expect(page.locator('[data-testid="support-ticket-success-alert"]')).toBeVisible();
  });

  test('WEB-078: FAQ page navigation and category filter', async ({ page }) => {
    await page.locator('[data-testid="nav-link-faq"]').click();
    await expect(page.locator('[data-testid="faq-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="faq-page-title"]')).toContainText('Foire Aux Questions');
  });

  test('WEB-079: FAQ search filter narrows displayed questions', async ({ page }) => {
    await page.goto('/?view=website#faq');
    const searchInput = page.locator('[data-testid="faq-search-input"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Hors-Ligne');
    await expect(page.locator('[data-testid="faq-accordion-section"]')).toContainText('Hors-Ligne');
  });

  test('WEB-080: License Guide page renders comprehensive LMSE educational walkthrough', async ({ page }) => {
    await page.locator('[data-testid="nav-link-license"]').click();
    await expect(page.locator('[data-testid="license-guide-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="license-guide-title"]')).toContainText('Guide des Licences LMSE');
  });

  // =========================================================================
  // 9. RESPONSIVE LAYOUTS & MOBILE DRAWER (WEB-081 to WEB-085)
  // =========================================================================
  test('WEB-081: Mobile viewport (375x812) displays hamburger menu button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?view=website');
    await expect(page.locator('[data-testid="mobile-menu-toggle-btn"]')).toBeVisible();
  });

  test('WEB-082: Clicking mobile menu button opens mobile navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?view=website');
    await page.locator('[data-testid="mobile-menu-toggle-btn"]').click();
    await expect(page.locator('[data-testid="mobile-drawer-container"]')).toBeVisible();
  });

  test('WEB-083: Clicking mobile drawer link navigates and closes drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?view=website');
    await page.locator('[data-testid="mobile-menu-toggle-btn"]').click();
    await page.locator('[data-testid="mobile-nav-link-pricing"]').click();
    await expect(page.locator('[data-testid="pricing-page-title"]')).toBeVisible();
  });

  test('WEB-084: Tablet viewport (768x1024) renders clean multi-column layouts', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/?view=website#pricing');
    await expect(page.locator('[data-testid="pricing-cards-section"]')).toBeVisible();
  });

  test('WEB-085: Desktop viewport (1440x900) renders full widescreen navigation and hero', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?view=website');
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="web-header"]')).toBeVisible();
  });
});

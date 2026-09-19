/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: WEB-IMMERSIVE-EDITION-001
 * Playwright E2E Verification Suite for Desktop & Mobile Immersive Edition.
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION WEB-IMMERSIVE-EDITION-001 — Validation E2E Desktop & Mobile', () => {

  test('E2E-I01: Desktop (1280x800) — En-tête avec badge ENTERPRISE et navigation complète', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const header = page.locator('[data-testid="web-header"]');
    await expect(header).toBeVisible();

    // Brand lockup with ENTERPRISE badge
    const brandLogo = page.locator('[data-testid="header-brand-logo"]');
    await expect(brandLogo).toBeVisible();
    const enterpriseBadge = page.locator('[data-testid="header-enterprise-badge"]');
    await expect(enterpriseBadge).toBeVisible();
    await expect(enterpriseBadge).toContainText('ENTERPRISE');

    // Navigation links
    await expect(page.locator('[data-testid="nav-link-home"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-products"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-pricing"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-download"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-license"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-faq"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-support"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-btn-get-license"]')).toBeVisible();
  });

  test('E2E-I02: Desktop — Hero Split-Screen avec visuel canari de concours et badges glassmorphism', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    // H1 Title & 3 Key Metrics
    await expect(heroSection.locator('h1')).toContainText(/L'art de la sélection avicole/i);
    await expect(heroSection).toContainText('1 200+');
    await expect(heroSection).toContainText('50 000+');
    await expect(heroSection).toContainText('7 Gén.');

    // CTAs
    await expect(page.locator('[data-testid="hero-cta-download"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-cta-pricing"]')).toBeVisible();

    // Canary Image & Badges
    const canaryImg = page.locator('[data-testid="hero-champion-canary-image"]');
    await expect(canaryImg).toBeVisible();
    await expect(heroSection).toContainText('FFO-2024-892');
    await expect(heroSection).toContainText('0.8%');
    await expect(heroSection).toContainText('AES-256');
    await expect(heroSection).toContainText('94 pts');
  });

  test('E2E-I03: Section Du Carnet Papier à l\'Excellence Avicole', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const problemSection = page.locator('[data-testid="problem-solution-section"]');
    await expect(problemSection).toBeVisible();
    await expect(problemSection.locator('h2')).toContainText(/Du Carnet Papier à l'Excellence Avicole/i);

    // Both cards visible
    await expect(problemSection).toContainText(/Les Défis du Carnet Manuscrit/i);
    await expect(problemSection).toContainText(/L'Excellence Numérique Bird Academy/i);
  });

  test('E2E-I04: Témoignage d\'expert Jean-Marc Valenti et volière moderne', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const testimonialSection = page.locator('[data-testid="expert-testimonial-section"]');
    await expect(testimonialSection).toBeVisible();

    // Author & COM distinction
    await expect(testimonialSection).toContainText('Jean-Marc Valenti');
    await expect(testimonialSection).toContainText('COM');
    await expect(testimonialSection).toContainText('5.0 / 5.0');

    // Expert Aviary Image
    const expertImg = page.locator('[data-testid="expert-aviary-image"]');
    await expect(expertImg).toBeVisible();
  });

  test('E2E-I05: Grille des 4 Moteurs Technologiques d\'Élite', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const enginesSection = page.locator('[data-testid="core-engines-grid-section"]');
    await expect(enginesSection).toBeVisible();

    await expect(page.locator('[data-testid="core-engine-card-wright"]')).toBeVisible();
    await expect(page.locator('[data-testid="core-engine-card-breeding"]')).toBeVisible();
    await expect(page.locator('[data-testid="core-engine-card-banding"]')).toBeVisible();
    await expect(page.locator('[data-testid="core-engine-card-offline"]')).toBeVisible();
  });

  test('E2E-I06: Bannière CTA Finale d\'Engagement', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const finalCta = page.locator('[data-testid="final-engagement-cta-section"]');
    await expect(finalCta).toBeVisible();
    await expect(page.locator('[data-testid="final-cta-download"]')).toBeVisible();
    await expect(page.locator('[data-testid="final-cta-pricing"]')).toBeVisible();
  });

  test('E2E-I07: Mobile (375x667) — Barre de navigation fixe basse à 4 onglets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const bottomNav = page.locator('[data-testid="web-mobile-bottom-nav"]');
    await expect(bottomNav).toBeVisible();

    // Check all 4 mobile tabs
    await expect(page.locator('[data-testid="mobile-tab-birds"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-tracking"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-genetics"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-tab-profile"]')).toBeVisible();
  });

  test('E2E-I08: Mobile — Navigation via les onglets mobiles', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    // Click on "Suivi" tab (downloads center)
    await page.locator('[data-testid="mobile-tab-tracking"]').click();
    await page.waitForFunction(() => window.location.hash.includes('download'));
    expect(page.url()).toContain('#download');
    await expect(page.locator('[data-testid="web-download-center-page"]')).toBeVisible();

    // Click on "Oiseaux" tab (products page)
    await page.locator('[data-testid="mobile-tab-birds"]').click();
    await page.waitForFunction(() => window.location.hash.includes('products'));
    expect(page.url()).toContain('#products');
    await expect(page.locator('[data-testid="web-products-page"]')).toBeVisible();
  });

  test('E2E-I09: Mobile — Menu burger accessible avec ouverture et fermeture du drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const toggleBtn = page.locator('[data-testid="mobile-menu-toggle-btn"]');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    const drawer = page.locator('[data-testid="mobile-nav-drawer"]');
    await expect(drawer).toBeVisible();

    // Close menu
    await toggleBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test('E2E-I10: Intégrité commerciale — Aucun montant prohibé (49, 119, 249) sur la page', async ({ page }) => {
    await page.goto('/?view=website#home');
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\b49\s*€/);
    expect(bodyText).not.toMatch(/\b119\s*€/);
    expect(bodyText).not.toMatch(/\b249\s*€/);
    expect(bodyText).not.toMatch(/tarifs indiqués sont fermes/i);
  });

  test('E2E-I11: Zéro erreur JavaScript en console', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/?view=website#home');
    await page.waitForLoadState('networkidle');

    // Scroll through the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    expect(errors).toEqual([]);
  });

});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: WEB-COMMERCIAL-VERIFY-004
 * Automated Verification Suite for Absolute Price Masking, 5 Locales & Download Center.
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION WEB-COMMERCIAL-VERIFY-004 — Conformité Commerciale & Multilingue', () => {

  test('V004-01: Absence absolue des montants 49 €, 119 €, 249 € sur toute la page Tarifs', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/49[,.]00/);
    expect(bodyText).not.toMatch(/119[,.]00/);
    expect(bodyText).not.toMatch(/249[,.]00/);
    expect(bodyText).not.toMatch(/49\s*€/);
    expect(bodyText).not.toMatch(/119\s*€/);
    expect(bodyText).not.toMatch(/249\s*€/);
  });

  test('V004-02: Absence absolue de l\'ancienne mention « Tous les tarifs indiqués sont fermes »', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Tous les tarifs indiqués sont fermes');
    expect(bodyText).not.toContain('tarifs indiqués sont fermes');
    expect(bodyText).not.toContain('tarifs fermes');
    expect(bodyText).not.toContain('prix définitifs');
  });

  test('V004-03: Présence de « Tarif en préparation » pour les offres PREMIUM et PRO en Français', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.waitForLoadState('domcontentloaded');

    const premiumCard = page.locator('[data-testid="pricing-card-premium"]');
    await expect(premiumCard).toBeVisible();
    await expect(premiumCard).toContainText('Tarif en préparation');

    const proCard = page.locator('[data-testid="pricing-card-pro"]');
    await expect(proCard).toBeVisible();
    await expect(proCard).toContainText('Tarif en préparation');
  });

  test('V004-04: Conformité du masquage des prix sur les 5 langues (FR, EN, ES, IT, AR)', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.waitForLoadState('domcontentloaded');

    const langs = [
      { code: 'fr', expectedText: 'Tarif en préparation' },
      { code: 'en', expectedText: 'Pricing in preparation' },
      { code: 'es', expectedText: 'Tarifa en preparación' },
      { code: 'it', expectedText: 'Tariffa in preparazione' },
      { code: 'ar', expectedText: 'الأسعار قيد الإعداد' },
    ];

    for (const { code, expectedText } of langs) {
      const selectorBtn = page.locator('[data-testid="language-selector-btn"]').first();
      if (await selectorBtn.isVisible()) {
        await selectorBtn.click();
        await page.waitForTimeout(200);
        const item = page.locator(`[data-testid="select-lang-${code}"]`).first();
        if (await item.isVisible()) {
          await item.click();
        }
      } else {
        await page.locator('[data-testid="language-selector"]').first().selectOption(code);
      }
      await page.waitForTimeout(400);

      const content = await page.textContent('body');
      expect(content).not.toMatch(/49[,.]00/);
      expect(content).not.toMatch(/119[,.]00/);
      expect(content).not.toMatch(/249[,.]00/);
      expect(content).toContain(expectedText);
    }
  });

  test('V004-05: Absence de prix sur la page Éditions & Produits (#editions)', async ({ page }) => {
    await page.goto('/?view=website#editions');
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/49[,.]00/);
    expect(bodyText).not.toMatch(/119[,.]00/);
    expect(bodyText).not.toMatch(/249[,.]00/);
    expect(bodyText).not.toContain('tarifs indiqués sont fermes');
  });

  test('V004-06: Le Centre de Téléchargement présente v1.3.6, BA-V1.3.6, warning Android et kit testeur', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const downloadPage = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadPage).toBeVisible();

    await expect(page.locator('[data-testid="official-version-badge"]')).toContainText('v1.3.6');
    await expect(page.locator('[data-testid="official-build-badge"]')).toContainText('BA-V1.3.6');
    await expect(page.locator('[data-testid="android-apk-warning"]')).toContainText('Installation manuelle APK destinée au programme de test');

    // 11 kit tester documents
    const testerSection = page.locator('[data-testid="section-tester-kit"]');
    await expect(testerSection).toBeVisible();
    await expect(page.locator('[data-testid="kit-doc-card-QA_ANDROID_FIELD_KIT_001_GUIDE.md"]')).toBeVisible();
    await expect(page.locator('[data-testid="kit-doc-card-QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md"]')).toBeVisible();
  });
});

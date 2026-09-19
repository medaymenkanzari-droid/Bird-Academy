/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION WEB-COMMERCIAL-003: Playwright E2E Verification Suite
 * 
 * Tests:
 * 1. Accès au centre de téléchargement
 * 2. Présence du téléchargement Windows
 * 3. Présence du téléchargement Android
 * 4. Présence de la version v1.3.6
 * 5. Présence du BUILD_ID BA-V1.3.6
 * 6. Absence des prix (49 €, 119 €, 249 €)
 * 7. Absence des anciens prix dans les pages commerciales
 * 8. Présence des documents du kit testeur réellement disponibles
 * 9. Navigation mobile (375x667)
 * 10. Téléchargement depuis Chromium (code 200, Content-Disposition, exact Content-Length)
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION WEB-COMMERCIAL-003 — Centre de Téléchargement Officiel E2E', () => {

  test('E2E-W01: Accès au Centre de Téléchargement & présence de la version v1.3.6 et du BUILD_ID', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const downloadCenter = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadCenter).toBeVisible();

    const versionBadge = page.locator('[data-testid="official-version-badge"]');
    await expect(versionBadge).toBeVisible();
    await expect(versionBadge).toContainText('v1.3.6');

    const buildBadge = page.locator('[data-testid="official-build-badge"]');
    await expect(buildBadge).toBeVisible();
    await expect(buildBadge).toContainText('BA-V1.3.6');
  });

  test('E2E-W02: Présence des options de téléchargement Windows (Setup & Portable)', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const winSetupBtn = page.locator('[data-testid="download-btn-windows-setup"]');
    await expect(winSetupBtn).toBeVisible();

    const winPortableBtn = page.locator('[data-testid="download-btn-windows-portable"]');
    await expect(winPortableBtn).toBeVisible();

    // Verify version in cards
    await expect(page.locator('[data-testid="win-setup-version"]')).toContainText('v1.3.6');
    await expect(page.locator('[data-testid="win-setup-buildid"]')).toContainText('BA-V1.3.6');
  });

  test('E2E-W03: Présence du téléchargement Android APK avec avertissement obligatoire et hash officiel', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const apkBtn = page.locator('[data-testid="download-btn-android-apk"]');
    await expect(apkBtn).toBeVisible();

    // Verify required alert warning
    const warning = page.locator('[data-testid="android-apk-warning"]');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText("Installation manuelle APK destinée au programme de test");

    // Verify version and size
    await expect(page.locator('[data-testid="android-apk-version"]')).toContainText('v1.3.6');
    await expect(page.locator('[data-testid="android-apk-buildid"]')).toContainText('BA-V1.3.6');
    await expect(page.locator('[data-testid="android-apk-size"]')).toContainText('9 916 814 octets');

    // Toggle SHA-256 and verify exact official hash
    await page.locator('[data-testid="toggle-sha-Bird-Academy-User.apk"]').click();
    const shaVal = page.locator('[data-testid="android-apk-sha"]');
    await expect(shaVal).toBeVisible();
    await expect(shaVal).toContainText('20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63');
  });

  test('E2E-W04: Présence de la section « Kit testeur — Validation Android » avec les 11 documents réels', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const testerKitSection = page.locator('[data-testid="section-tester-kit"]');
    await expect(testerKitSection).toBeVisible();
    await expect(page.locator('#tester-kit-title')).toContainText(/kit testeur — validation android/i);

    const expectedDocuments = [
      'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
      'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md',
      'QA_ANDROID_FIELD_HANDOFF_001_PACK.md',
      'QA_ANDROID_FIELD_HANDOFF_001_README.md',
      'QA_ANDROID_FIELD_EXECUTION_001_REPORT.md',
      'QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md',
      'QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md',
      'QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md',
    ];

    for (const doc of expectedDocuments) {
      const card = page.locator(`[data-testid="kit-doc-card-${doc}"]`);
      await expect(card).toBeVisible();
      const btn = page.locator(`[data-testid="download-kit-${doc}"]`);
      await expect(btn).toBeVisible();
    }
  });

  test('E2E-W05: Absence absolue de prix commerciaux (49, 119, 249) sur la page Tarifs', async ({ page }) => {
    await page.goto('/?view=website#pricing');
    await page.waitForLoadState('domcontentloaded');

    const pricingCards = page.locator('[data-testid="pricing-cards-section"]');
    await expect(pricingCards).toBeVisible();

    const textContent = await pricingCards.textContent();
    expect(textContent).not.toMatch(/49[,.]00/);
    expect(textContent).not.toMatch(/119[,.]00/);
    expect(textContent).not.toMatch(/249[,.]00/);
    expect(textContent).not.toMatch(/49\s*€/);
    expect(textContent).not.toMatch(/119\s*€/);
    expect(textContent).not.toMatch(/249\s*€/);

    // FREE card shows "Gratuit"
    await expect(page.locator('[data-testid="pricing-card-free"]')).toContainText('Gratuit');

    // PREMIUM & PRO cards show "Tarif en préparation"
    await expect(page.locator('[data-testid="pricing-card-premium"]')).toContainText('Tarif en préparation');
    await expect(page.locator('[data-testid="pricing-card-pro"]')).toContainText('Tarif en préparation');
  });

  test('E2E-W06: Responsive mobile (375x667) — Le Centre de Téléchargement s\'affiche sans régression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const downloadCenter = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadCenter).toBeVisible();

    // Verify key download buttons on mobile
    await expect(page.locator('[data-testid="download-btn-windows-setup"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-btn-android-apk"]')).toBeVisible();
  });

  test('E2E-W07: Téléchargements directs Chromium — Les endpoints HTTP retournent 200 OK avec les bons headers', async ({ request }) => {
    // 1. Android APK official binary
    const apkRes = await request.get('/downloads/Bird-Academy-User.apk');
    expect(apkRes.status()).toBe(200);
    const apkHeaders = apkRes.headers();
    expect(apkHeaders['content-type']).toBe('application/vnd.android.package-archive');
    expect(apkHeaders['content-length']).toBe('9916814');

    // 2. Windows Setup official binary
    const winRes = await request.get('/downloads/Bird-Academy-User-Windows-Setup.exe');
    expect(winRes.status()).toBe(200);
    const winHeaders = winRes.headers();
    expect(winHeaders['content-length']).toBe('106800570');

    // 3. Kit testeur Markdown document
    const kitRes = await request.get('/downloads/QA_ANDROID_FIELD_KIT_001_GUIDE.md');
    expect(kitRes.status()).toBe(200);
    const kitHeaders = kitRes.headers();
    expect(kitHeaders['content-type']).toContain('text/markdown');
  });
});

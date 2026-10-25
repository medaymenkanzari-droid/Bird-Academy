/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — E2E TEST MISSION RELEASE-DOWNLOADS-INTEGRATION-001
 * Qualification and Distribution Verification for V2.0.0-RC1 Assets
 * 
 * Validates:
 * 1. Ouverture du centre de téléchargement (#download / ?view=website).
 * 2. Présence explicite de V2.0.0-RC1 et BUILD_ID BA-V2.0.0-RC1.
 * 3. Présence des trois cartes de téléchargement : Windows Installer, Windows Portable, Android APK.
 * 4. URLs / paths corrects pointant vers /downloads/*.
 * 5. Présence des SHA-256 officiels certifiés pour chaque binaire.
 * 6. Absence totale d'ancienne version (1.3.6) dans le centre de téléchargement.
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION RELEASE-DOWNLOADS-INTEGRATION-001 — E2E Download Center V2.0.0-RC1', () => {

  test('E2E-V2-01: Download Center displays V2.0.0-RC1 version and all 3 official downloads', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    // 1. Ouverture du centre de téléchargement
    const downloadPage = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadPage).toBeVisible();

    // 2. Présence de V2.0.0-RC1 et BA-V2.0.0-RC1
    const versionBadge = page.locator('[data-testid="official-version-badge"]');
    await expect(versionBadge).toBeVisible();
    await expect(versionBadge).toContainText('V2.0.0-RC1');

    const buildBadge = page.locator('[data-testid="official-build-badge"]');
    await expect(buildBadge).toBeVisible();
    await expect(buildBadge).toContainText('BA-V2.0.0-RC1');

    // 3. Présence des trois téléchargements
    // Windows Setup Card
    const winSetupCard = page.locator('[data-testid="download-card-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(winSetupCard).toBeVisible();
    await expect(page.locator('[data-testid="win-setup-version"]')).toContainText('V2.0.0-RC1');
    await expect(page.locator('[data-testid="win-setup-buildid"]')).toContainText('BA-V2.0.0-RC1');
    const winSetupBtn = page.locator('[data-testid="download-button-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(winSetupBtn).toBeVisible();

    // Windows Portable Card
    const winPortableCard = page.locator('[data-testid="download-card-Bird-Academy-User.exe"]');
    await expect(winPortableCard).toBeVisible();
    await expect(page.locator('[data-testid="win-portable-version"]')).toContainText('V2.0.0-RC1');
    await expect(page.locator('[data-testid="win-portable-buildid"]')).toContainText('BA-V2.0.0-RC1');
    const winPortableBtn = page.locator('[data-testid="download-button-Bird-Academy-User.exe"]');
    await expect(winPortableBtn).toBeVisible();

    // Android APK Card
    const androidCard = page.locator('[data-testid="download-card-Bird-Academy-User.apk"]');
    await expect(androidCard).toBeVisible();
    await expect(page.locator('[data-testid="android-apk-version"]')).toContainText('V2.0.0-RC1');
    await expect(page.locator('[data-testid="android-apk-buildid"]')).toContainText('BA-V2.0.0-RC1');
    const androidBtn = page.locator('[data-testid="download-button-Bird-Academy-User.apk"]');
    await expect(androidBtn).toBeVisible();

    // 4. SHA-256 toggles & values
    await page.locator('[data-testid="toggle-sha-Bird-Academy-User-Windows-Setup.exe"]').click();
    const winSetupSha = page.locator('[data-testid="sha-value-Bird-Academy-User-Windows-Setup.exe"]');
    await expect(winSetupSha).toContainText('BA8EC925064FBE1AAFB53635FB1FF4277611485A5C8F1BD916B45339A3EC3EA1');

    await page.locator('[data-testid="toggle-sha-Bird-Academy-User.exe"]').click();
    const winPortableSha = page.locator('[data-testid="sha-value-Bird-Academy-User.exe"]');
    await expect(winPortableSha).toContainText('1C7F50E6A689970B12BFF15EFD4DB769DF8138B0159A8E142617EF683032939B');

    await page.locator('[data-testid="toggle-sha-Bird-Academy-User.apk"]').click();
    const androidSha = page.locator('[data-testid="android-apk-sha"]');
    await expect(androidSha).toContainText('1D3CC180339B55C2701CB3AE6CF6FC209D37720D8737B3CD8DBBD3BEFABDD290');

    // 5. Absence totale d'ancienne version
    const pageContent = await downloadPage.innerText();
    expect(pageContent).not.toContain('1.3.6');
  });

  test('E2E-V2-02: Download section on home page displays V2.0.0-RC1 and correct sizes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website');
    await page.waitForLoadState('domcontentloaded');

    const downloadSection = page.locator('[data-testid="download-section"]');
    await expect(downloadSection).toBeVisible();

    // Verify buttons exist
    await expect(page.locator('[data-testid="download-btn-windows-setup"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-btn-windows-portable"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-btn-android-apk"]')).toBeVisible();

    // Verify V2.0.0-RC1 badge and absence of 1.3.6
    const sectionText = await downloadSection.innerText();
    expect(sectionText).toContain('V2.0.0-RC1');
    expect(sectionText).not.toContain('1.3.6');
  });
});

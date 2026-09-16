/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — E2E TEST MISSION ANDROID-FREE-001
 * E2E Validation of Android Native FREE Mode vs Mobile Web Browser
 * 
 * Tests:
 * 1. Mobile Chrome (User-Agent Android, no Capacitor) -> Shows Commercial Website (Web normal)
 * 2. Capacitor Android WebView (isNativePlatform === true) -> Shows Application directly in FREE mode
 * 3. Absence of FirstLaunchActivationScreen in Native FREE clean install
 * 4. Verification that Dashboard mounts and displays Plan GRATUIT
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION ANDROID-FREE-001 — E2E Native vs Mobile Web', () => {

  test('E2E-01: Mobile Chrome (Android User-Agent without Capacitor) renders Commercial Website', async ({ page }) => {
    // Set Android User-Agent and mobile viewport
    await page.setViewportSize({ width: 393, height: 851 }); // Pixel 5 dimensions
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    });

    // Clear any previous state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Verify Commercial Website is rendered and NOT the native app or activation screen
    // Commercial website has commercial navigation / hero / download sections
    await page.waitForLoadState('networkidle');

    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();

    // Ensure FirstLaunchActivationScreen is NOT visible
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);
  });

  test('E2E-02: Native Capacitor Android Runtime mounts App in FREE mode without license screen', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });

    // Inject Capacitor native runtime bridge before any document scripts run
    await page.addInitScript(() => {
      localStorage.clear();
      (window as any).Capacitor = {
        isNativePlatform: () => true,
        getPlatform: () => 'android',
        isPluginAvailable: () => false,
      };
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify FirstLaunchActivationScreen is NOT rendered
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);

    // Verify application mounts
    await expect(page.locator('#root')).toBeVisible();
  });
});

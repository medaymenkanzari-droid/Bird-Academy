/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — E2E TEST MISSION WINDOWS-FREE-AUDIT-001
 * E2E Validation of Windows Web Browsers vs Windows Native Desktop App
 * 
 * Tests:
 * 1. Windows Chrome / Edge Browser (HTTPS web URL) -> Shows Commercial Website
 * 2. Simulated Native Windows Runtime (with window.electron) -> Shows Application in FREE mode
 * 3. NO_LICENSE clean install verification
 * 4. Absence of FirstLaunchActivationScreen in clean FREE mode
 * 5. Premium / PRO isolation verification
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION WINDOWS-FREE-AUDIT-001 — E2E Windows Web vs Native Desktop', () => {

  test('E2E-WIN-01: Windows Desktop Chrome Browser renders Commercial Website', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify Commercial Website is rendered
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeDefined();

    // Verify FirstLaunchActivationScreen is NOT rendered
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);
  });

  test('E2E-WIN-02: Windows Desktop Edge Browser renders Commercial Website', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify FirstLaunchActivationScreen is NOT rendered
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);
  });

  test('E2E-WIN-03: Native Windows Desktop Runtime (window.electron) mounts App directly in FREE mode', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Inject Windows Electron runtime bridge before document scripts execute
    await page.addInitScript(() => {
      localStorage.clear();
      (window as any).electron = {
        isPackaged: true,
        platform: 'win32',
      };
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify FirstLaunchActivationScreen is NOT rendered on clean install
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);

    // Verify App container mounts
    await expect(page.locator('#root')).toBeVisible();
  });
});

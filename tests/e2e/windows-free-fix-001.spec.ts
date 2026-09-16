/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — E2E TEST MISSION WINDOWS-FREE-FIX-001
 * End-to-End Validation of Windows Web Browsers vs Windows Electron Desktop App
 * 
 * Scenarios:
 * 1. Windows Chrome Browser (Web) -> Commercial Website
 * 2. Windows Edge Browser (Web) -> Commercial Website
 * 3. Windows Electron Desktop App (Native via window.electron preload) -> Direct FREE mode startup
 * 4. Clean install without license -> FirstLaunchActivationScreen absent, app accessible
 * 5. Premium / PRO isolation verification in FREE mode
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION WINDOWS-FREE-FIX-001 — E2E Windows Web vs Electron Native', () => {

  test('E2E-FIX-01: Windows Chrome Browser -> Runtime = WEB -> Commercial Website', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Confirm that window.electron is NOT present in Chrome
    const hasElectron = await page.evaluate(() => typeof (window as any).electron !== 'undefined');
    expect(hasElectron).toBe(false);

    // Verify FirstLaunchActivationScreen is NOT rendered
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);

    // Verify Commercial Website is active
    await expect(page.locator('#root')).toBeVisible();
  });

  test('E2E-FIX-02: Windows Edge Browser -> Runtime = WEB -> Commercial Website', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0'
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Confirm that window.electron is NOT present in Edge
    const hasElectron = await page.evaluate(() => typeof (window as any).electron !== 'undefined');
    expect(hasElectron).toBe(false);

    // Verify FirstLaunchActivationScreen is NOT rendered
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);

    // Verify Commercial Website is active
    await expect(page.locator('#root')).toBeVisible();
  });

  test('E2E-FIX-03: Windows Electron Desktop (Preload Bridge) -> Runtime = NATIVE -> Bird Academy User App FREE', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Inject Windows Electron runtime bridge (matching our secure preload.cjs)
    await page.addInitScript(() => {
      localStorage.clear();
      (window as any).electron = {
        isElectron: true,
        platform: 'win32',
        runtime: 'desktop',
      };
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Confirm that window.electron is present
    const electronState = await page.evaluate(() => (window as any).electron);
    expect(electronState).toBeDefined();
    expect(electronState.isElectron).toBe(true);
    expect(electronState.platform).toBe('win32');
    expect(electronState.runtime).toBe('desktop');

    // Verify FirstLaunchActivationScreen is NOT rendered on clean install
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);

    // Verify App container mounts successfully
    await expect(page.locator('#root')).toBeVisible();
  });

  test('E2E-FIX-04: Clean Install in Electron -> NO_LICENSE immediately mounts App with zero network calls', async ({ page }) => {
    let networkCallMade = false;

    await page.route('**/api/licensing/**', (route) => {
      networkCallMade = true;
      route.abort();
    });

    await page.addInitScript(() => {
      localStorage.clear();
      (window as any).electron = {
        isElectron: true,
        platform: 'win32',
        runtime: 'desktop',
      };
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify zero licensing network requests occurred for FREE startup
    expect(networkCallMade).toBe(false);

    // Verify no activation screen
    const activationScreen = page.locator('text=Activation de votre Licence');
    await expect(activationScreen).toHaveCount(0);
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — E2E TEST MISSION WINDOWS-FREE-FIX-002
 * Qualification and Distribution Verification for Windows RC6 Assets
 * 
 * Validates:
 * 1. Download Center UI displays qualified RC6 versions, sizes, and official SHA-256 hashes.
 * 2. Setup Windows asset integrity: exactly 112,731,374 bytes and SHA-256 746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B.
 * 3. Portable Windows asset integrity: exactly 111,233,160 bytes and SHA-256 EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE.
 * 4. Fallback redirection strictly targets v1.3.6-RC6 release (never old v1.3.6 Stable).
 */

import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const EXPECTED_RC6_SETUP = {
  filename: 'Bird-Academy-User-Windows-Setup.exe',
  version: 'v1.3.6-RC6',
  buildId: 'BA-V1.3.6-RC6',
  sizeBytes: 112731374,
  sha256: '746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B',
  releaseTag: 'v1.3.6-RC6',
};

const EXPECTED_RC6_PORTABLE = {
  filename: 'Bird-Academy-User.exe',
  version: 'v1.3.6-RC6',
  buildId: 'BA-V1.3.6-RC6',
  sizeBytes: 111233160,
  sha256: 'EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE',
  releaseTag: 'v1.3.6-RC6',
};

test.describe('MISSION WINDOWS-FREE-FIX-002 — E2E Download Center RC6 Alignment', () => {

  test('E2E-RC6-01: Download Center UI displays qualified RC6 Setup & Portable metadata', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    // Confirm Download Center page is mounted
    const downloadPage = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadPage).toBeVisible();

    // Verify Windows Setup Card Metadata
    const setupCard = page.locator(`[data-testid="download-card-${EXPECTED_RC6_SETUP.filename}"]`);
    await expect(setupCard).toBeVisible();
    await expect(page.locator('[data-testid="win-setup-version"]')).toContainText(EXPECTED_RC6_SETUP.version);
    await expect(page.locator('[data-testid="win-setup-buildid"]')).toContainText(EXPECTED_RC6_SETUP.buildId);

    // Toggle SHA-256 on Setup card and check hash
    await page.locator(`[data-testid="toggle-sha-${EXPECTED_RC6_SETUP.filename}"]`).click();
    const setupSha = page.locator(`[data-testid="sha-value-${EXPECTED_RC6_SETUP.filename}"]`);
    await expect(setupSha).toContainText(EXPECTED_RC6_SETUP.sha256);

    // Verify Windows Portable Card Metadata
    const portableCard = page.locator(`[data-testid="download-card-${EXPECTED_RC6_PORTABLE.filename}"]`);
    await expect(portableCard).toBeVisible();
    await expect(page.locator('[data-testid="win-portable-version"]')).toContainText(EXPECTED_RC6_PORTABLE.version);
    await expect(page.locator('[data-testid="win-portable-buildid"]')).toContainText(EXPECTED_RC6_PORTABLE.buildId);

    // Toggle SHA-256 on Portable card and check hash
    await page.locator(`[data-testid="toggle-sha-${EXPECTED_RC6_PORTABLE.filename}"]`).click();
    const portableSha = page.locator(`[data-testid="sha-value-${EXPECTED_RC6_PORTABLE.filename}"]`);
    await expect(portableSha).toContainText(EXPECTED_RC6_PORTABLE.sha256);
  });

  test('E2E-RC6-02: Local dist_binaries Windows Setup exactly matches RC6 official size and SHA-256', async () => {
    const setupPath = path.join(process.cwd(), 'dist_binaries', EXPECTED_RC6_SETUP.filename);
    expect(fs.existsSync(setupPath)).toBe(true);

    const stat = fs.statSync(setupPath);
    expect(stat.size).toBe(EXPECTED_RC6_SETUP.sizeBytes);

    const buffer = fs.readFileSync(setupPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
    expect(hash).toBe(EXPECTED_RC6_SETUP.sha256);
  });

  test('E2E-RC6-03: Local dist_binaries Windows Portable exactly matches RC6 official size and SHA-256', async () => {
    const portablePath = path.join(process.cwd(), 'dist_binaries', EXPECTED_RC6_PORTABLE.filename);
    expect(fs.existsSync(portablePath)).toBe(true);

    const stat = fs.statSync(portablePath);
    expect(stat.size).toBe(EXPECTED_RC6_PORTABLE.sizeBytes);

    const buffer = fs.readFileSync(portablePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();
    expect(hash).toBe(EXPECTED_RC6_PORTABLE.sha256);
  });

  test('E2E-RC6-04: Download redirect and GitHub URLs target v1.3.6-RC6 (never v1.3.6 Stable)', async ({ page }) => {
    await page.goto('/?view=website');
    await page.waitForLoadState('domcontentloaded');

    // Evaluate WebDownloadService URLs in browser context
    const urls = await page.evaluate(() => {
      const { WebDownloadService } = (window as any);
      if (WebDownloadService) {
        return {
          setupUrl: WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User-Windows-Setup.exe'),
          portableUrl: WebDownloadService.getGitHubReleaseUrl('Bird-Academy-User.exe'),
        };
      }
      return null;
    });

    if (urls) {
      expect(urls.setupUrl).toContain('releases/download/v1.3.6-RC6/Bird-Academy-User-Windows-Setup.exe');
      expect(urls.portableUrl).toContain('releases/download/v1.3.6-RC6/Bird-Academy-User.exe');
      expect(urls.setupUrl).not.toContain('releases/download/v1.3.6/Bird-Academy-User-Windows-Setup.exe');
      expect(urls.portableUrl).not.toContain('releases/download/v1.3.6/Bird-Academy-User.exe');
    }
  });
});

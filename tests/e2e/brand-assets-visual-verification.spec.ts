/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — E2E TEST MISSION BRAND-ASSETS-001
 * Playwright Visual & Functional Verification Suite
 * 
 * Tests requis :
 * Test 1 — Lancement : L'application démarre sans image cassée.
 * Test 2 — Sidebar : Le logo Bird Academy est visible.
 * Test 3 — Navigation : Les icônes des principales entrées sont visibles.
 * Test 4 — Dashboard : Les icônes des modules sont visibles.
 * Test 5 — Thème sombre : Logo et assets restent visibles.
 * Test 6 — Thème clair : Logo et assets restent visibles.
 * Test 7 — Langue : Les 5 langues officielles supportées (FR, EN, ES, IT, AR) ne font pas disparaître les assets.
 * Test 8 — Electron production : Vérification du build réel Electron (dist_user).
 */

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License } from '../../src/features/licensing/types/licensing';

async function createTestLicense(): Promise<License> {
  const id = `lic_test_${Date.now()}`;
  const key = `LMSE-COMM-9999-8888-7777`;
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const maxDevices = 3;
  const features = ['core', 'unlimited_birds', 'pedigree', 'statistics'];

  const payloadToSign = `${id}:${key}:Éleveur Test:commercial:${issuedAt}:${expiresAt}:${maxDevices}`;
  const checksum = await CryptoService.sha256(payloadToSign);
  const signature = await CryptoService.generateSignature(checksum, CryptoService.getPublicVerificationKey());

  return {
    id,
    key,
    holderName: 'Éleveur Test',
    type: 'commercial',
    status: 'active',
    issuedAt,
    expiresAt,
    policy: { maxDevices, allowOfflineActivation: true, allowTransfer: true, features },
    activations: [],
    checksum,
    signature,
    metadata: { commercialTier: 'PREMIUM', testEnvironment: true }
  };
}

test.describe('MISSION BRAND-ASSETS-001 — Vérification Visuelle et Fonctionnelle E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Inject Desktop bridge runtime
    await page.addInitScript(() => {
      (window as any).electron = {
        isElectron: true,
        platform: 'win32',
        runtime: 'desktop',
        qaMode: true,
      };
    });

    const license = await createTestLicense();
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Seed session data
    await page.evaluate(({ lic }) => {
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      localStorage.setItem('bird_academy_db_initialized', 'true');
      localStorage.setItem('bird_academy_language', 'fr');
      localStorage.setItem('bird_academy_theme', 'dark');
      localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
      localStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify([lic]));
      localStorage.setItem('bird_academy_subscription_tier_override', 'PREMIUM');
    }, { lic: license });

    await page.reload({ waitUntil: 'networkidle' });
  });

  // Test 1 — Lancement : aucune image cassée
  test('Test 1 — Lancement : Application démarre sans image cassée', async ({ page }) => {
    // Vérifie que toutes les balises <img> ont un chargement réussi (naturalWidth > 0)
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible().catch(() => false);
      if (isVisible) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        const src = await img.getAttribute('src');
        expect(naturalWidth, `L'image ${src} ne doit pas être cassée (naturalWidth: ${naturalWidth})`).toBeGreaterThan(0);
      }
    }
  });

  // Test 2 — Sidebar : Le logo Bird Academy est visible
  test('Test 2 — Sidebar : Le logo Bird Academy est visible et intact', async ({ page }) => {
    const sidebar = page.locator('[data-testid="desktop-sidebar"]');
    await expect(sidebar).toBeVisible();

    const logoImg = sidebar.locator('img[alt="Bird Academy"]').first();
    await expect(logoImg).toBeVisible();

    const naturalWidth = await logoImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
    const naturalHeight = await logoImg.evaluate((el: HTMLImageElement) => el.naturalHeight);
    expect(naturalWidth).toBeGreaterThan(0);
    expect(naturalHeight).toBeGreaterThan(0);

    const src = await logoImg.getAttribute('src');
    expect(src).toContain('public_assets_images_bird_academy');
  });

  // Test 3 — Navigation : Les icônes des principales entrées sont visibles
  test('Test 3 — Navigation : Les icônes des principales entrées sont visibles', async ({ page }) => {
    const sidebar = page.locator('[data-testid="desktop-sidebar"]');
    await expect(sidebar).toBeVisible();

    const navButtons = sidebar.locator('nav button');
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(5);

    // Vérifie que chaque bouton contient un élément svg (icône fonctionnelle Lucide)
    for (let i = 0; i < count; i++) {
      const btn = navButtons.nth(i);
      const icon = btn.locator('svg');
      await expect(icon).toBeVisible();
    }
  });

  // Test 4 — Dashboard : Les icônes des modules sont visibles
  test('Test 4 — Dashboard : Les icônes des modules du tableau de bord sont visibles', async ({ page }) => {
    const dashboardCards = page.locator('[data-testid="app-card"], .grid');
    await expect(dashboardCards.first()).toBeVisible();

    // Vérifie la présence d'icônes dans les modules
    const svgs = page.locator('main svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThan(0);
  });

  // Test 5 — Thème sombre : Logo et assets restent visibles
  test('Test 5 — Thème sombre : Logo et assets restent visibles', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });

    const logoImg = page.locator('[data-testid="desktop-sidebar"] img[alt="Bird Academy"]').first();
    await expect(logoImg).toBeVisible();

    const naturalWidth = await logoImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  // Test 6 — Thème clair : Logo et assets restent visibles
  test('Test 6 — Thème clair : Logo et assets restent visibles', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });

    const logoImg = page.locator('[data-testid="desktop-sidebar"] img[alt="Bird Academy"]').first();
    await expect(logoImg).toBeVisible();

    const naturalWidth = await logoImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  // Test 7 — Langue : Les 5 langues officielles (FR, EN, ES, IT, AR) ne font pas disparaître les assets
  test('Test 7 — Langue : Les 5 langues supportées préservent les assets', async ({ page }) => {
    const supportedLangs = ['fr', 'en', 'es', 'it', 'ar'] as const;

    for (const lang of supportedLangs) {
      await page.evaluate((l) => {
        localStorage.setItem('bird_academy_language', l);
        window.dispatchEvent(new Event('storage'));
      }, lang);

      await page.waitForTimeout(100);

      const logoImg = page.locator('[data-testid="desktop-sidebar"] img[alt="Bird Academy"]').first();
      await expect(logoImg).toBeVisible();

      const naturalWidth = await logoImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth, `Langue ${lang} : le logo doit charger correctement`).toBeGreaterThan(0);
    }
  });

  // Test 8 — Electron production : Présence réelle des assets dans le build dist_user
  test('Test 8 — Electron production : Présence physique des 12 assets officiels dans dist_user', async () => {
    const distUserDir = path.join(process.cwd(), 'dist_user', 'assets', 'images', 'public_assets_images_bird_academy');
    expect(fs.existsSync(distUserDir)).toBe(true);

    const expectedFiles = [
      'apple-touch-icon.png',
      'favicon.ico',
      'icon.ico',
      'icon.png',
      'logo-full-dark.png',
      'logo-full-dark.svg',
      'logo-full.png',
      'logo-full.svg',
      'logo-icon.png',
      'logo-icon.svg',
      'logo.png',
      'logo.svg'
    ];

    for (const file of expectedFiles) {
      const fullPath = path.join(distUserDir, file);
      expect(fs.existsSync(fullPath), `Fichier officiel ${file} manquant dans dist_user`).toBe(true);
      expect(fs.statSync(fullPath).size).toBeGreaterThan(0);
    }
  });
});

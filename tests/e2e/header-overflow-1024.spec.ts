import { test, expect } from '@playwright/test';

const VIEWPORTS = [320, 360, 375, 390, 414, 768, 820, 900, 1024, 1100, 1280, 1440];

test.describe('MISSION FIX-HEADER-OVERFLOW-1024-V1 — Responsive Viewports & Header Integrity', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

  // 1. All 12 viewports have zero horizontal overflow
  for (const width of VIEWPORTS) {
    test(`Viewport ${width}px: scrollWidth <= clientWidth (no horizontal overflow)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForSelector('[data-testid="web-header"]');

      const dimensions = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });

      console.log(`[Viewport ${width}px] scrollWidth: ${dimensions.scrollWidth}, clientWidth: ${dimensions.clientWidth}`);

      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    });
  }

  // 2. Viewport 1024px explicit equality and element visibility
  test('Viewport 1024px: explicit zero-overflow guarantee and element visibility', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="web-header"]');

    const metrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const header = document.querySelector('[data-testid="web-header"]');
      const brand = document.querySelector('[data-testid="header-brand-logo"]');
      const lang = document.querySelector('[data-testid="language-selector-btn"]');
      const curr = document.querySelector('[data-testid="currency-selector-btn"]');
      const account = document.querySelector('[data-testid="nav-link-account"]');
      const openApp = document.querySelector('[data-testid="header-btn-open-app"]');
      const getLicense = document.querySelector('[data-testid="header-btn-get-license"]');
      const hamburger = document.querySelector('[data-testid="mobile-menu-toggle-btn"]');

      return {
        scrollWidth,
        clientWidth,
        headerWidth: header ? Math.round(header.getBoundingClientRect().width) : 0,
        brandVisible: brand !== null && window.getComputedStyle(brand).display !== 'none',
        langVisible: lang !== null && window.getComputedStyle(lang).display !== 'none',
        currVisible: curr !== null && window.getComputedStyle(curr).display !== 'none',
        accountVisible: account !== null && window.getComputedStyle(account).display !== 'none',
        openAppVisible: openApp !== null && window.getComputedStyle(openApp).display !== 'none',
        getLicenseVisible: getLicense !== null && window.getComputedStyle(getLicense).display !== 'none',
        hamburgerVisible: hamburger !== null && window.getComputedStyle(hamburger).display !== 'none',
      };
    });

    expect(metrics.scrollWidth).toBe(metrics.clientWidth);
    expect(metrics.brandVisible).toBe(true);
    expect(metrics.langVisible).toBe(true);
    expect(metrics.currVisible).toBe(true);
    expect(metrics.accountVisible).toBe(true);
    expect(metrics.openAppVisible).toBe(true);
    expect(metrics.getLicenseVisible).toBe(true);
    expect(metrics.hamburgerVisible).toBe(true);
  });

  // 3. Tap targets strictly >= 44x44px on header controls at 1024px
  test('Viewport 1024px: tap targets >= 44x44px for all visible header controls', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="web-header"]');

    const targetSizes = await page.evaluate(() => {
      const selectors = [
        '[data-testid="header-brand-logo"]',
        '[data-testid="language-selector-btn"]',
        '[data-testid="currency-selector-btn"]',
        '[data-testid="nav-link-account"]',
        '[data-testid="header-btn-open-app"]',
        '[data-testid="header-btn-get-license"]',
        '[data-testid="mobile-menu-toggle-btn"]',
      ];

      return selectors.map((sel) => {
        const el = document.querySelector(sel);
        if (!el) return { selector: sel, found: false };
        const rect = el.getBoundingClientRect();
        return {
          selector: sel,
          found: true,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          pass: rect.width >= 44 && rect.height >= 44,
        };
      });
    });

    for (const target of targetSizes) {
      expect(target.found).toBe(true);
      expect(target.pass).toBe(true);
    }
  });

  // 4. Tablet navigation drawer functionality at 1024px
  test('Viewport 1024px: mobile/tablet navigation drawer opens and closes cleanly', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="web-header"]');

    const toggleBtn = page.locator('[data-testid="mobile-menu-toggle-btn"]');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    const drawer = page.locator('#mobile-nav-drawer');
    await expect(drawer).toBeVisible();

    // Click on FAQ link inside drawer
    const faqLink = page.locator('[data-testid="mobile-nav-link-faq"]');
    await expect(faqLink).toBeVisible();
    await faqLink.click();

    // Drawer should close after navigation
    await expect(drawer).toBeHidden();
  });

  // 5. Desktop navigation visible at 1280px+ (xl) and hamburger hidden
  test('Viewport 1280px: desktop navigation links visible and hamburger hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="web-header"]');

    const homeNav = page.locator('[data-testid="nav-link-home"]');
    await expect(homeNav).toBeVisible();

    const pricingNav = page.locator('[data-testid="nav-link-pricing"]');
    await expect(pricingNav).toBeVisible();

    const hamburger = page.locator('[data-testid="mobile-menu-toggle-btn"]');
    await expect(hamburger).toBeHidden();
  });

  // 6. Multilingual & RTL non-regression at 1024px
  const LOCALES = ['fr', 'en', 'es', 'it', 'ar'] as const;
  for (const loc of LOCALES) {
    test(`Locale ${loc.toUpperCase()} at 1024px: no horizontal overflow and correct dir`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 897 });
      await page.goto('/');
      await page.waitForSelector('[data-testid="web-header"]');

      // Change locale via hidden select to trigger state change
      await page.evaluate((targetLoc) => {
        const select = document.querySelector('[data-testid="language-selector"]') as HTMLSelectElement;
        if (select) {
          select.value = targetLoc;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, loc);

      await page.waitForTimeout(300);

      const state = await page.evaluate((targetLoc) => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          dir: document.documentElement.getAttribute('dir'),
          expectedDir: targetLoc === 'ar' ? 'rtl' : 'ltr',
        };
      }, loc);

      expect(state.scrollWidth).toBeLessThanOrEqual(state.clientWidth);
      expect(state.dir).toBe(state.expectedDir);
    });
  }
});

import { test, expect } from '@playwright/test';

test.describe('MISSION APP-LAUNCH-BUTTON-FIX-001 — E2E Verification Suite', () => {

  test('TEST 1: Site → clic « Ouvrir l\'app » → Windows → tentative native (shows loading state and triggers protocol)', async ({ page }) => {
    // Emulate Windows desktop user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    await page.goto('/');

    const openAppBtn = page.locator('[data-testid="header-btn-open-app"]');
    await expect(openAppBtn).toBeVisible();
    await expect(openAppBtn).toContainText("Ouvrir l'App");

    // Click "Ouvrir l'App"
    await openAppBtn.click();

    // Verify button shows temporary launching state
    // Either "Ouverture…" is displayed or fallback modal opens
    const isLaunchingOrModal = await Promise.race([
      openAppBtn.textContent().then(t => t?.includes('Ouverture')),
      page.locator('[data-testid="app-launch-fallback-modal"]').waitFor({ timeout: 4000 }).then(() => true)
    ]);
    expect(isLaunchingOrModal).toBeTruthy();
  });

  test('TEST 2: Site → Windows sans application → fallback téléchargement propre', async ({ page }) => {
    await page.goto('/');

    const openAppBtn = page.locator('[data-testid="header-btn-open-app"]');
    await expect(openAppBtn).toBeVisible();

    // Click "Ouvrir l'App"
    await openAppBtn.click();

    // Wait for the fallback modal to trigger after timeout
    const fallbackModal = page.locator('[data-testid="app-launch-fallback-modal"]');
    await expect(fallbackModal).toBeVisible({ timeout: 5000 });

    // Verify non-technical content
    await expect(page.locator('#app-launch-fallback-title')).toContainText('Application Windows non détectée');
    await expect(page.locator('[data-testid="fallback-modal-btn-download"]')).toContainText('Télécharger pour Windows');
    await expect(page.locator('[data-testid="fallback-modal-btn-web"]')).toBeVisible();

    // Ensure NO technical leak: no stack trace, no file paths
    const modalText = await fallbackModal.innerText();
    expect(modalText).not.toContain('C:\\');
    expect(modalText).not.toContain('D:\\');
    expect(modalText).not.toContain('at Object.');
    expect(modalText).not.toContain('TypeError');
    expect(modalText).not.toContain('Error:');
  });

  test('TEST 3 & 4: Site → Android → tentative native et fallback APK', async ({ page }) => {
    // Emulate Android Mobile browser in JavaScript runtime
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        configurable: true
      });
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Linux armv8l',
        configurable: true
      });
    });

    await page.goto('/');

    // In mobile viewport, toggle mobile drawer
    const mobileToggle = page.locator('[data-testid="mobile-menu-toggle-btn"]');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      const mobileOpenBtn = page.locator('[data-testid="mobile-drawer-btn-open-app"]');
      await expect(mobileOpenBtn).toBeVisible();
      await mobileOpenBtn.click();
    } else {
      const openAppBtn = page.locator('[data-testid="header-btn-open-app"]');
      await expect(openAppBtn).toBeVisible();
      await openAppBtn.click();
    }

    // Wait for Android fallback modal
    const fallbackModal = page.locator('[data-testid="app-launch-fallback-modal"]');
    await expect(fallbackModal).toBeVisible({ timeout: 5000 });

    await expect(page.locator('#app-launch-fallback-title')).toContainText('Application Android non détectée');
    await expect(page.locator('[data-testid="fallback-modal-btn-download"]')).toContainText('Télécharger le package APK Android');
  });

  test('TEST 5: Site → navigateur standard → aucun comportement cassé', async ({ page }) => {
    await page.goto('/');

    // Check that website navigation functions normally
    await expect(page.locator('[data-testid="web-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="web-footer"]')).toBeVisible();

    // Test clicking navigation links
    const pricingNav = page.locator('[data-testid="nav-link-pricing"]');
    await pricingNav.click();
    await expect(page).toHaveURL(/#pricing/);
  });

  test('TEST 6: Double clic sur « Ouvrir l\'app » → pas de comportement catastrophique', async ({ page }) => {
    await page.goto('/');

    const openAppBtn = page.locator('[data-testid="header-btn-open-app"]');
    await expect(openAppBtn).toBeVisible();

    // Double click rapidly
    await openAppBtn.dblclick();

    // Verify button is disabled or modal appears cleanly without page crash
    const fallbackModal = page.locator('[data-testid="app-launch-fallback-modal"]');
    await expect(fallbackModal).toBeVisible({ timeout: 5000 });

    // Close modal cleanly
    const closeBtn = page.locator('[data-testid="fallback-modal-close-btn"]');
    await closeBtn.click();
    await expect(fallbackModal).not.toBeVisible();
  });

  test('TEST 7: Aucune navigation automatique vers l\'application Web lorsque le lancement natif est demandé', async ({ page }) => {
    await page.goto('/');

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('view=app');
    expect(currentUrl).not.toContain('mode=app');

    const openAppBtn = page.locator('[data-testid="header-btn-open-app"]');
    await openAppBtn.click();

    // Give it 1 second - verify the page did NOT automatically reload with ?view=app
    await page.waitForTimeout(1000);
    const postClickUrl = page.url();
    expect(postClickUrl).not.toContain('view=app');
    expect(postClickUrl).not.toContain('mode=app');

    // Wait for the modal to offer choice
    const fallbackModal = page.locator('[data-testid="app-launch-fallback-modal"]');
    await expect(fallbackModal).toBeVisible({ timeout: 5000 });

    // Now if user explicitly clicks "Utiliser la version Web", only then navigate
    const webBtn = page.locator('[data-testid="fallback-modal-btn-web"]');
    await webBtn.click();

    // Now view=app should be loaded
    await page.waitForURL(/view=app/, { timeout: 5000 });
    expect(page.url()).toContain('view=app');
  });

});

import { test, expect } from '@playwright/test';

test.describe('Vérification Fonctionnelle & Responsive', () => {
  test('TC-WEB-001: Accueil accessible et titre valide', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('TC-WEB-013: Support strict du mode RTL pour la langue Arabe (/ar)', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });

  test('TC-WEB-005: Page Tarifs avec éditions FREE, PREMIUM et PRO', async ({ page }) => {
    await page.goto('/fr/pricing');
    await expect(page.getByText('FREE')).toBeVisible();
    await expect(page.getByText('PREMIUM')).toBeVisible();
    await expect(page.getByText('PRO')).toBeVisible();
  });
});
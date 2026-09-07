# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: website-functional.spec.ts >> Vérification Fonctionnelle & Responsive >> TC-WEB-013: Support strict du mode RTL pour la langue Arabe (/ar)
- Location: tests\e2e\website-functional.spec.ts:9:7

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('html')
Expected: "rtl"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('html')
    14 × locator resolved to <html lang="en">…</html>
       - unexpected value "null"

```

```yaml
- document
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Vérification Fonctionnelle & Responsive', () => {
  4  |   test('TC-WEB-001: Accueil accessible et titre valide', async ({ page }) => {
  5  |     await page.goto('/fr');
  6  |     await expect(page.locator('h1')).toBeVisible();
  7  |   });
  8  | 
  9  |   test('TC-WEB-013: Support strict du mode RTL pour la langue Arabe (/ar)', async ({ page }) => {
  10 |     await page.goto('/ar');
> 11 |     await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
     |                                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  12 |     await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  13 |   });
  14 | 
  15 |   test('TC-WEB-005: Page Tarifs avec éditions FREE, PREMIUM et PRO', async ({ page }) => {
  16 |     await page.goto('/fr/pricing');
  17 |     await expect(page.getByText('FREE')).toBeVisible();
  18 |     await expect(page.getByText('PREMIUM')).toBeVisible();
  19 |     await expect(page.getByText('PRO')).toBeVisible();
  20 |   });
  21 | });
```
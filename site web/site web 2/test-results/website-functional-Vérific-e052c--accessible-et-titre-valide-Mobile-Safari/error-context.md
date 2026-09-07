# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: website-functional.spec.ts >> Vérification Fonctionnelle & Responsive >> TC-WEB-001: Accueil accessible et titre valide
- Location: tests\e2e\website-functional.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1')
  - Test timeout of 30000ms exceeded.

```

```yaml
- banner:
  - banner "Bird Academy Avian ERP":
    - img "Bird Academy Avian ERP Logo"
    - text: Bird Academy AVIAN ERP • SUITE PROFESSIONNELLE
  - text: En ligne
  - combobox:
    - option "🇫🇷 Français" [selected]
    - option "🇬🇧 English"
    - option "🇸🇦 العربية"
    - option "🇪🇸 Español"
    - option "🇮🇹 Italiano"
- main:
  - heading "Bienvenue dans Bird Academy" [level=2]
  - paragraph: Activez votre licence pour commencer.
  - button "Importer une licence .lmse"
  - button "Scanner un QR Code"
  - button "Clé de Licence"
  - text: Importer une licence .lmse Sélectionnez le fichier BirdAcademy-License-[ID].lmse (Tous les fichiers autorisés sur Android — *.lmse, *.json, tout fichier)
  - group: Le fichier .lmse n'apparaît pas dans votre sélecteur Android ?
  - text: "Statut : En attente d'activation"
- contentinfo: Bird Academy Enterprise © 2026 — License Protection LMSE (Offline Beta)
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Vérification Fonctionnelle & Responsive', () => {
  4  |   test('TC-WEB-001: Accueil accessible et titre valide', async ({ page }) => {
  5  |     await page.goto('/fr');
> 6  |     await expect(page.locator('h1')).toBeVisible();
     |                                      ^ Error: expect(locator).toBeVisible() failed
  7  |   });
  8  | 
  9  |   test('TC-WEB-013: Support strict du mode RTL pour la langue Arabe (/ar)', async ({ page }) => {
  10 |     await page.goto('/ar');
  11 |     await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
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
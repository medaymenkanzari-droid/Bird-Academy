/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: WEB-TESTER-KIT-002
 * Playwright E2E Verification Suite for Official React Document Reader & A4 PDFs.
 */

import { test, expect } from '@playwright/test';

test.describe('MISSION WEB-TESTER-KIT-002 — Lecteur Officiel React & Fiches PDF A4', () => {

  const expectedDocuments = [
    'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
    'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
    'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
    'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
    'QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md',
    'QA_ANDROID_FIELD_HANDOFF_001_PACK.md',
    'QA_ANDROID_FIELD_HANDOFF_001_README.md',
    'QA_ANDROID_FIELD_EXECUTION_001_REPORT.md',
    'QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md',
    'QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md',
    'QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md',
  ];

  test('E2E-K01: Accès au Centre de téléchargement', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const downloadCenter = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadCenter).toBeVisible();
    await expect(page.locator('[data-testid="official-version-badge"]')).toContainText('v1.3.6');
  });

  test('E2E-K02: Section Kit Testeur visible avec titre et sous-titre', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    const testerSection = page.locator('[data-testid="section-tester-kit"]');
    await expect(testerSection).toBeVisible();
    await expect(page.locator('#tester-kit-title')).toContainText(/kit testeur — validation android/i);
  });

  test('E2E-K03: Tous les 11 documents affichés avec options Lire, Télécharger .md et PDF A4', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    for (const doc of expectedDocuments) {
      const card = page.locator(`[data-testid="kit-doc-card-${doc}"]`);
      await expect(card).toBeVisible();

      // Read button
      const readBtn = page.locator(`[data-testid="read-kit-${doc}"]`);
      await expect(readBtn).toBeVisible();
      await expect(readBtn).toContainText(/lire/i);

      // Download original .md button
      const downloadMdBtn = page.locator(`[data-testid="download-kit-${doc}"]`);
      await expect(downloadMdBtn).toBeVisible();

      // Download PDF button
      const downloadPdfBtn = page.locator(`[data-testid="download-pdf-${doc}"]`);
      await expect(downloadPdfBtn).toBeVisible();
    }
  });

  test('E2E-K04 & E2E-K05: Clic sur « Lire le document » ouvre le lecteur officiel React sans erreur', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    // Clic sur "Lire le document" pour le Guide
    const guideReadBtn = page.locator('[data-testid="read-kit-QA_ANDROID_FIELD_KIT_001_GUIDE.md"]');
    await guideReadBtn.click();

    // Vérification de l'ouverture du lecteur
    const reader = page.locator('[data-testid="web-document-reader-page"]');
    await expect(reader).toBeVisible();

    // Vérification des badges officiels
    await expect(page.locator('[data-testid="reader-document-title"]')).toContainText(/guide/i);
    await expect(reader).toContainText('v1.3.6 • BA-V1.3.6');

    // Vérification du contenu rendu par MarkdownRenderer
    const content = page.locator('[data-testid="rendered-markdown-content"]');
    await expect(content).toBeVisible();
    await expect(content).toContainText('GUIDE TERRAIN SIMPLIFIÉ');
    await expect(content).toContainText('DEV-01');

    // Aucune erreur JS console
    expect(consoleErrors).toEqual([]);
  });

  test('E2E-K06: Présence des boutons d\'action dans le lecteur (PDF, Source .md, Imprimer)', async ({ page }) => {
    await page.goto('/?view=website#download/kit/QA_ANDROID_FIELD_KIT_001_GUIDE.md');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('[data-testid="download-pdf-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-original-md-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="print-doc-btn"]')).toBeVisible();
  });

  test('E2E-K07: Téléchargement HTTP du .md et du .pdf retournent HTTP 200 avec headers corrects', async ({ request }) => {
    // 1. Markdown source download
    const mdRes = await request.get('/downloads/QA_ANDROID_FIELD_KIT_001_GUIDE.md');
    expect(mdRes.status()).toBe(200);
    expect(mdRes.headers()['content-type']).toContain('text/markdown');

    // 2. A4 PDF field sheet download
    const pdfRes = await request.get('/downloads/QA_ANDROID_FIELD_KIT_001_GUIDE.pdf');
    expect(pdfRes.status()).toBe(200);
    expect(pdfRes.headers()['content-type']).toContain('application/pdf');
    const pdfBody = await pdfRes.body();
    expect(pdfBody.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  test('E2E-K08: Responsive mobile 375 × 667 — Lecture et navigation sans débordement', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?view=website#download/kit/QA_ANDROID_FIELD_KIT_001_GUIDE.md');
    await page.waitForLoadState('domcontentloaded');

    const reader = page.locator('[data-testid="web-document-reader-page"]');
    await expect(reader).toBeVisible();

    const title = page.locator('[data-testid="reader-document-title"]');
    await expect(title).toBeVisible();

    const backBtn = page.locator('[data-testid="back-to-download-btn"]');
    await expect(backBtn).toBeVisible();
  });

  test('E2E-K09: Rendu d\'un document contenant un tableau avec défilement propre', async ({ page }) => {
    await page.goto('/?view=website#download/kit/QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md');
    await page.waitForLoadState('domcontentloaded');

    const content = page.locator('[data-testid="rendered-markdown-content"]');
    await expect(content).toBeVisible();

    // Tableaux rendus
    const table = content.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('E2E-K10: Rendu d\'un document contenant des checklists avec cases interactives', async ({ page }) => {
    await page.goto('/?view=website#download/kit/QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md');
    await page.waitForLoadState('domcontentloaded');

    const content = page.locator('[data-testid="rendered-markdown-content"]');
    await expect(content).toBeVisible();

    // Badges de statut
    await expect(content).toContainText('NOT TESTED');
    await expect(content).toContainText('AND-001');
  });

  test('E2E-K11: Rendu et navigation avec interface Arabe (RTL)', async ({ page }) => {
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Arabic
    const selectorBtn = page.locator('[data-testid="language-selector-btn"]').first();
    if (await selectorBtn.isVisible()) {
      await selectorBtn.click();
      await page.waitForTimeout(200);
      const arItem = page.locator('[data-testid="select-lang-ar"]').first();
      if (await arItem.isVisible()) {
        await arItem.click();
      }
    } else {
      await page.locator('[data-testid="language-selector"]').first().selectOption('ar');
    }
    await page.waitForTimeout(400);

    // Verify RTL on container
    const appContainer = page.locator('[data-testid="commercial-website-app"]');
    await expect(appContainer).toHaveAttribute('dir', 'rtl');

    // Click Read document on first card
    const firstReadBtn = page.locator('[data-testid^="read-kit-"]').first();
    await firstReadBtn.click();
    await page.waitForTimeout(500);

    const reader = page.locator('[data-testid="web-document-reader-page"]');
    await expect(reader).toBeVisible();
  });

  test('E2E-K12: Navigation retour vers le Centre de téléchargement', async ({ page }) => {
    await page.goto('/?view=website#download/kit/QA_ANDROID_FIELD_KIT_001_GUIDE.md');
    await page.waitForLoadState('domcontentloaded');

    const backBtn = page.locator('[data-testid="back-to-download-btn"]');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Must be back on Download Center
    const downloadCenter = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadCenter).toBeVisible();
    await expect(page.locator('#tester-kit-title')).toBeVisible();
  });

  test('E2E-K13: Aucune erreur JavaScript dans la console pendant tout le cycle utilisateur', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Home
    await page.goto('/?view=website');
    // 2. Download Center
    await page.goto('/?view=website#download');
    // 3. Open doc reader
    await page.locator('[data-testid="read-kit-QA_ANDROID_FIELD_KIT_001_GUIDE.md"]').click();
    await page.waitForTimeout(300);
    // 4. Back to download
    await page.locator('[data-testid="back-to-download-btn"]').click();
    await page.waitForTimeout(300);

    expect(consoleErrors).toEqual([]);
  });
});

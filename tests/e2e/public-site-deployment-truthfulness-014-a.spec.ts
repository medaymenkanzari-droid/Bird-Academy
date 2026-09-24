/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION 014-A
 * PLAYWRIGHT REAL PUBLIC SITE DEPLOYMENT TRUTHFULNESS SPEC
 * Target: https://bird-academy-public-test.onrender.com
 * Version: v1.3.6 / BUILD_ID: BA-V1.3.6
 */

import { test, expect } from '@playwright/test';

const PUBLIC_URL = 'https://bird-academy-public-test.onrender.com/?view=website';

const FORBIDDEN_TESTIMONIAL_PATTERNS = [
  'Jean-Marc Valenti',
  'Valenti',
  '5.0 / 5.0',
  '35 Ans d\'Expérience',
  '35 ans d\'élevage',
  'Protocole Elite Validé',
  'Protocole Élite Validé',
  'Juge & Maître Éleveur',
  'Standard COM Certifié',
  'Témoignage de Maître Éleveur',
  'Note d\'Excellence COM',
  'Reconnu par les juges et champions internationaux',
  'Reconnue par les juges et champions internationaux',
];

test.describe('MISSION 014-A — Real Public Site Deployment Truthfulness Re-Certification', () => {

  test('E2E-01: Ouverture réelle du site public', async ({ page }) => {
    const response = await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test('E2E-02: Page d\'accueil accessible et titre conforme', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await expect(page).toHaveTitle(/Bird Academy/i);
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();
  });

  test('E2E-03: Aucun faux témoignage visible', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await page.content();
    for (const pattern of FORBIDDEN_TESTIMONIAL_PATTERNS) {
      expect(content).not.toContain(pattern);
    }
  });

  test('E2E-04: Aucun nom de personne fictive présenté comme client/témoin', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await page.content();
    expect(content.toLowerCase()).not.toContain('valenti');
    expect(content.toLowerCase()).not.toContain('jean-marc');
  });

  test('E2E-05: Aucune note fictive visible', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await page.content();
    expect(content).not.toContain('5.0 / 5.0');
    expect(content).not.toContain('5.0/5.0');
    expect(content).not.toContain('Note d\'Excellence');
  });

  test('E2E-06: Aucune certification fictive visible', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await page.content();
    expect(content).not.toContain('Standard COM Certifié');
    expect(content).not.toContain('Protocole Élite Validé');
  });

  test('E2E-07: Aucune affirmation "reconnu par les juges/champions" non sourcée', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await page.content();
    expect(content.toLowerCase()).not.toContain('reconnue par les juges');
    expect(content.toLowerCase()).not.toContain('reconnu par les juges');
  });

  test('E2E-08: Aucune preuve sociale non vérifiée sur la page d\'accueil', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const testimonialSection = page.locator('[data-testid="expert-testimonial-section"]');
    await expect(testimonialSection).toBeVisible();
    
    // Doit afficher honnêtement la phase de test
    const sectionText = await testimonialSection.innerText();
    expect(sectionText).toContain('EN PHASE DE TEST');
    expect(sectionText).toContain('BA-V1.3.6');
  });

  test('E2E-09: Audit des autres pages publiques (pricing, editions, download, faq, support)', async ({ page }) => {
    const routes = ['#pricing', '#editions', '#download', '#faq', '#support'];
    for (const route of routes) {
      await page.goto(`${PUBLIC_URL}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
      const content = await page.content();
      for (const pattern of FORBIDDEN_TESTIMONIAL_PATTERNS) {
        expect(content).not.toContain(pattern);
      }
    }
  });

  test('E2E-10: Audit du footer', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const footerText = await footer.innerText();
    expect(footerText).toContain('v1.3.6');
    expect(footerText).not.toContain('v1.4.2');
  });

  test('E2E-11: Audit des langues disponibles (FR, EN, ES, IT, AR)', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Switch to EN
    const langBtn = page.locator('button:has-text("FR"), button:has-text("EN"), button:has-text("ES"), button:has-text("IT"), button:has-text("AR")').first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      const enOption = page.locator('button:has-text("English")');
      if (await enOption.isVisible()) {
        await enOption.click();
        await page.waitForTimeout(500);
        const enContent = await page.content();
        expect(enContent).not.toContain('Valenti');
        expect(enContent).toContain('IN TESTING PHASE');
      }
    }
  });

  test('E2E-12: Audit en contexte navigateur neuf', async ({ browser }) => {
    const context = await browser.newContext();
    const freshPage = await context.newPage();
    await freshPage.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await freshPage.content();
    expect(content).not.toContain('Jean-Marc Valenti');
    await context.close();
  });

  test('E2E-13: Audit avec cache propre', async ({ browser }) => {
    const context = await browser.newContext({ bypassCSP: true });
    const page = await context.newPage();
    await page.route('**/*', (route) => route.continue());
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await page.content();
    expect(content).not.toContain('Valenti');
    await context.close();
  });

  test('E2E-14: Audit après rechargement complet', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.reload({ waitUntil: 'networkidle' });
    const content = await page.content();
    expect(content).not.toContain('Valenti');
    expect(content).toContain('BA-V1.3.6');
  });

  test('E2E-15: Vérification que le contenu réellement affiché correspond au contenu attendu de la version déployée', async ({ page }) => {
    await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const content = await page.content();
    // Confirme la présence de la bannière / badge de test public
    expect(content).toContain('v1.3.6');
    expect(content).toContain('BA-V1.3.6');
    expect(content).toContain('Phase de Test Public');
  });

});

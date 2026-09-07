import { test, expect } from '@playwright/test';
import path from 'path';

const localFile = 'file://' + path.resolve(__dirname, '../site-bird-academy.html');

test.describe('Bird Academy Web Foundation Test Suite — Identité Avian Precision', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(localFile);
  });

  test('TC-WEB-001: Accueil accessible et titre orienté bénéfice Avian Precision', async ({ page }) => {
    await expect(page).toHaveTitle(/Bird Academy/);
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Maîtrisez votre élevage avec une précision absolue');
  });

  test('TC-WEB-002: Navigation Desktop fonctionnelle', async ({ page }) => {
    const navFeatures = page.locator('nav >> text=Fonctionnalités');
    await expect(navFeatures).toBeVisible();
    await navFeatures.click();
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('TC-WEB-003: Navigation Mobile Drawer repliable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const menuBtn = page.locator('#mobileMenuBtn');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    const mobileMenu = page.locator('#mobileMenu');
    await expect(mobileMenu).toBeVisible();
  });

  test('TC-WEB-004: Section Sécurité & Technologie à 3 colonnes', async ({ page }) => {
    const secSection = page.locator('#security');
    await expect(secSection).toBeVisible();
    await expect(secSection).toContainText('Sécurité & Technologie');
    await expect(secSection).toContainText('100% Hors-Ligne');
    await expect(secSection).toContainText('Chiffrement Local');
    await expect(secSection).toContainText('Indépendance Cloud');
  });

  test('TC-WEB-005: Grille Tarifaire 4 colonnes avec offre Passion / Premium mise en avant et Tableau Comparatif', async ({ page }) => {
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toContainText('COMMUNITY');
    await expect(pricingSection).toContainText('PASSION / PREMIUM');
    await expect(pricingSection).toContainText('ENTERPRISE / PRO');
    await expect(pricingSection).toContainText('POPULAIRE');
    await expect(pricingSection).toContainText('Tableau Comparatif des Fonctionnalités');
  });

  test('TC-WEB-006: Téléchargement avec CTA Windows et volet SHA-256 masqué', async ({ page }) => {
    const dlSection = page.locator('#download');
    await expect(dlSection).toBeVisible();
    const btnWin = page.locator('#btnWinInstaller');
    await expect(btnWin).toBeVisible();
    await expect(btnWin).toContainText('Windows');

    // SHA-256 Drawer is initially hidden
    const shaDrawer = page.locator('#shaDrawer');
    await expect(shaDrawer).toBeHidden();

    // Toggle SHA-256 Drawer
    const toggleBtn = page.locator('#toggleShaBtn');
    await toggleBtn.click();
    await expect(shaDrawer).toBeVisible();
    await expect(shaDrawer).toContainText('1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813');
  });

  test('TC-WEB-007: Encart de Rassurance Support < 24h & Formulaire double colonne', async ({ page }) => {
    const supportSection = page.locator('#support');
    await expect(supportSection).toBeVisible();
    await expect(supportSection).toContainText('24h');
    await expect(supportSection.locator('#contactForm')).toBeVisible();
  });

  test('TC-WEB-009: FAQ Accordéon expansible et filtrable', async ({ page }) => {
    const firstFaqBtn = page.locator('button:has-text("Bird Academy nécessite-t-elle une connexion Internet ?")');
    await firstFaqBtn.click();
    const answer = page.locator('#faq-content-1');
    await expect(answer).toBeVisible();
    await expect(answer).toContainText('offline-first');
  });

  test('TC-WEB-013: Arabe et direction RTL', async ({ page }) => {
    const langSelect = page.locator('#langSelect');
    await langSelect.selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toContainText('تحكم في تربية طيورك');
  });

  test('TC-WEB-018: Aucune erreur JavaScript bloquante', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(localFile);
    expect(errors.length).toBe(0);
  });

});
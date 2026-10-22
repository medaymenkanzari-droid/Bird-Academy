/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
 * Tests E2E Playwright : Visualiseur de Traçabilité Scientifique & Bibliographique
 * Fichier : tests/e2e/bibliographic-traceability-viewer.spec.ts
 * Missions : V1.6.6.21 & V1.6.6.22 (Audit d'Intégration)
 */

import { test, expect, Page } from '@playwright/test';

const FIXTURE_BIRDS = [
  {
    id: 101,
    recordId: 'GOULD-TEST-01',
    bague: 'GOU-2026-01',
    nom: 'Gould Rouge Test',
    sexe: 'Mâle',
    espece: 'diamant_gould',
    race: 'Diamant de Gould',
    couleur: 'Classique Rouge Poitrine Violette',
    statut: 'Actif',
    passport: {
      canonicalLoci: [
        {
          locusId: 'HEAD_COLOR_Z',
          displayName: 'Couleur de tête',
          transmission: 'Z_LINKED',
          determination: 'CONFIRMED',
          alleles: ['ZR', 'ZR'],
          status: 'GENETICALLY_CONFIRMED',
          source: 'DNA_TEST',
          confidence: 'VERY_HIGH',
          humanReviewRequired: false,
          evidenceIds: ['EVD-GOU-01-001'],
        },
        {
          locusId: 'BREAST',
          displayName: 'Couleur de poitrine',
          transmission: 'AUTOSOMAL',
          determination: 'POSSIBLE_SET',
          status: 'PROVISIONAL',
          confidence: 'LOW',
          humanReviewRequired: true,
          evidenceIds: ['EVD-GOU-01-002'],
        },
        {
          locusId: 'UNKNOWN_LOCUS',
          displayName: 'Locus Sans Source',
          transmission: 'AUTOSOMAL',
          determination: 'EMPIRICAL',
          status: 'UNKNOWN',
          confidence: 'LOW',
          humanReviewRequired: true,
          evidenceIds: [],
        },
      ],
    },
  },
  {
    id: 201,
    recordId: 'CANARY-SATINE-01',
    bague: 'CAN-2026-SAT',
    nom: 'Canari Satiné Test',
    sexe: 'Femelle',
    espece: 'canari',
    race: 'Canari de couleur',
    couleur: 'Satiné jaune',
    statut: 'Actif',
    passport: {
      canonicalLoci: [
        {
          locusId: 'CAN_LOC_SATINE',
          displayName: 'Satiné',
          transmission: 'Z_LINKED',
          determination: 'POSSIBLE_SET',
          status: 'NEEDS_HUMAN_REVIEW',
          humanReviewRequired: true,
          evidenceIds: ['EVD-CAN-09-SAT-01'],
        },
        {
          locusId: 'CAN_RULE_LETHAL_INTENSIVE',
          displayName: 'Facteur Intensif',
          transmission: 'AUTOSOMAL',
          determination: 'CONFIRMED',
          status: 'GENETICALLY_CONFIRMED',
          humanReviewRequired: false,
          evidenceIds: ['EVD-CAN-08-004'],
        },
      ],
    },
  },
];

async function setupAppEnv(page: Page, language: string = 'fr', customBirds: any = FIXTURE_BIRDS) {
  await page.addInitScript(() => {
    (window as any).isElectron = true;
    (window as any).electronAPI = {
      isElectron: true,
      platform: 'win32',
      runtime: 'desktop',
    };
  });

  await page.goto('/?view=app', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ({ birds, lang }) => {
      localStorage.clear();
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      localStorage.setItem('bird_academy_db_initialized', 'true');
      localStorage.setItem('bird_academy_language', lang);
      localStorage.setItem('bird_academy_theme', 'dark');
      localStorage.setItem('canaris', JSON.stringify(birds));
    },
    { birds: customBirds, lang: language }
  );

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Navigation vers l'écran Oiseaux
  const navBirds = page.locator('[data-testid="nav-item-canaris"]').first();
  await expect(navBirds).toBeVisible({ timeout: 10000 });
  await navBirds.click();
  await page.waitForTimeout(400);
}

test.describe('V1.6.6.22 — Audit d\'Intégration de la Traçabilité Scientifique (Playwright E2E)', () => {

  // =========================================================================
  // SCÉNARIO 1 — GOULD HEAD_COLOR_Z (P0 & VALIDATION GÉNOMIQUE)
  // =========================================================================
  test('Scénario 1 : Gould HEAD_COLOR_Z -> Consulter Traçabilité -> Vérifier P0, Pryke 2009 et DOI', async ({ page }) => {
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Gould Rouge Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-HEAD_COLOR_Z"]').first().click();

    const locusDrawer = page.locator('[data-testid="canonical-locus-detail-drawer"]');
    await expect(locusDrawer).toBeVisible({ timeout: 5000 });

    const consultBtn = page.locator('[data-testid="open-traceability-drawer-button"]').first();
    await expect(consultBtn).toBeVisible({ timeout: 5000 });
    await consultBtn.click();

    const traceabilityDrawer = page.locator('[data-testid="locus-traceability-drawer"]');
    await expect(traceabilityDrawer).toBeVisible({ timeout: 5000 });

    // Vérifier niveau P0 et métadonnées
    await expect(page.locator('[data-testid="source-level-badge-SRC-PRYKE-2009"]')).toHaveText('P0');
    await expect(page.locator('text=Science').first()).toBeVisible();
    await expect(page.locator('[data-testid="source-doi-link"]')).toContainText('10.1126/science.1168928');

    const closeBtn = page.locator('[data-testid="traceability-drawer-close-button"]').first();
    await closeBtn.click();
    await expect(traceabilityDrawer).toBeHidden({ timeout: 3000 });
  });

  // =========================================================================
  // SCÉNARIO 2 — GOULD BREAST (P1 / INSUFFICIENT / PROVISIONAL / HUMAN REVIEW)
  // =========================================================================
  test('Scénario 2 : Gould BREAST -> Vérifier P1, INSUFFICIENT, PROVISIONAL et limitations sans certification automatique', async ({ page }) => {
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Gould Rouge Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-BREAST"]').first().click();

    const consultBtn = page.locator('[data-testid="open-traceability-drawer-button"]').first();
    await expect(consultBtn).toBeVisible({ timeout: 5000 });
    await consultBtn.click();

    const traceabilityDrawer = page.locator('[data-testid="locus-traceability-drawer"]');
    await expect(traceabilityDrawer).toBeVisible({ timeout: 5000 });

    // Statut PROVISIONAL dans le contexte
    await expect(page.locator('[data-testid="record-epistemic-status-raw"]').first()).toHaveText('PROVISIONAL');

    // Source Martin 2002 avec P1
    await expect(page.locator('[data-testid="source-level-badge-SRC-MARTIN-2002"]')).toHaveText('P1');

    // Concordance INSUFFICIENT
    await expect(traceabilityDrawer.locator('text=INSUFFICIENT').first()).toBeVisible();

    // Limitations affichées
    const limitationsBox = page.locator('[data-testid="evidence-limitations-box"]').first();
    await expect(limitationsBox).toBeVisible();
    await expect(limitationsBox).toContainText('Absence d\'étude génomique peer-reviewed');

    // Human Review requis
    await expect(page.locator('[data-testid="record-human-review-flag"]').first()).toBeVisible();
  });

  // =========================================================================
  // SCÉNARIO 3 — CANARI SATINÉ (DEUX SOURCES CONCURRENTES & CONFLICTING)
  // =========================================================================
  test('Scénario 3 : Canari Satiné -> Deux sources concurrentes, CONFLICTING et pas d\'arbitrage automatique', async ({ page }) => {
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Canari Satiné Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-CAN_LOC_SATINE"]').first().click();

    const consultBtn = page.locator('[data-testid="open-traceability-drawer-button"]').first();
    await expect(consultBtn).toBeVisible({ timeout: 5000 });
    await consultBtn.click();

    const traceabilityDrawer = page.locator('[data-testid="locus-traceability-drawer"]');
    await expect(traceabilityDrawer).toBeVisible({ timeout: 5000 });

    // Présence des DEUX sources : Pomarède 1989 et Martin 2002
    await expect(page.locator('text=SRC-POMAREDE-1989').first()).toBeVisible();
    await expect(page.locator('text=SRC-MARTIN-2002').first()).toBeVisible();

    // Concordance CONFLICTING
    const conflictingBadges = page.locator('text=CONFLICTING');
    await expect(conflictingBadges.first()).toBeVisible();

    // Alerte d'absence d'arbitrage automatique
    const conflictAlert = page.locator('[data-testid="conflicting-warning-alert"]');
    await expect(conflictAlert).toBeVisible();
    await expect(conflictAlert).toContainText('Les sources contradictoires sont conservées sans arbitrage automatique');
  });

  // =========================================================================
  // SCÉNARIO 4 — SOURCE OUTDATED (SRC-DUNCKER-1928)
  // =========================================================================
  test('Scénario 4 : Facteur Intensif -> Vérifier la source historique OUTDATED consultable sans censure', async ({ page }) => {
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Canari Satiné Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-CAN_RULE_LETHAL_INTENSIVE"]').first().click();

    const consultBtn = page.locator('[data-testid="open-traceability-drawer-button"]').first();
    await expect(consultBtn).toBeVisible({ timeout: 5000 });
    await consultBtn.click();

    // Vérifier la source Duncker 1928 et son badge OUTDATED
    await expect(page.locator('text=SRC-DUNCKER-1928').first()).toBeVisible();
    await expect(page.locator('[data-testid="source-verification-status-SRC-DUNCKER-1928"]')).toHaveText('OUTDATED');
    await expect(page.locator('text=Hans Duncker').first()).toBeVisible();
  });

  // =========================================================================
  // SCÉNARIO 5 — SOURCE NOT_VERIFIED / P2
  // =========================================================================
  test('Scénario 5 : Vérifier que P2 / NOT_VERIFIED n\'octroie aucun badge VERIFIED biologique', async ({ page }) => {
    const birdWithP2 = [
      {
        ...FIXTURE_BIRDS[0],
        id: 999,
        nom: 'Oiseau Test P2',
        passport: {
          canonicalLoci: [
            {
              locusId: 'EMPIRICAL_TEST',
              displayName: 'Observation Empirique',
              transmission: 'AUTOSOMAL',
              determination: 'EMPIRICAL',
              status: 'NEEDS_HUMAN_REVIEW',
              humanReviewRequired: true,
              evidenceIds: ['EVD-CAN-09-SAT-01'],
            },
          ],
        },
      },
    ];

    await setupAppEnv(page, 'fr', birdWithP2);

    const birdCard = page.locator('text=Oiseau Test P2').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-EMPIRICAL_TEST"]').first().click();

    await page.locator('[data-testid="open-traceability-drawer-button"]').first().click();

    // Vérifier l'avertissement permanent P1/P0 !== VERIFIED
    await expect(page.locator('text=Le niveau documentaire P1/P0 qualifie la source, mais ne constitue pas une certification biologique automatique')).toBeVisible();
  });

  // =========================================================================
  // SCÉNARIO 6 — EVIDENCE UNKNOWN / ABSENCE DE SOURCES
  // =========================================================================
  test('Scénario 6 : Locus UNKNOWN ou sans source -> Affichage du repli neutre sans hallucination documentaire', async ({ page }) => {
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Gould Rouge Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-UNKNOWN_LOCUS"]').first().click();

    const consultBtn = page.locator('[data-testid="open-traceability-drawer-button"]').first();
    await expect(consultBtn).toBeVisible({ timeout: 5000 });
    await consultBtn.click();

    const traceabilityDrawer = page.locator('[data-testid="locus-traceability-drawer"]');
    await expect(traceabilityDrawer).toBeVisible({ timeout: 5000 });

    // Vérifier le message de repli neutre
    const fallbackBox = page.locator('[data-testid="no-sources-fallback"]');
    await expect(fallbackBox).toBeVisible();
    await expect(fallbackBox).toContainText('Aucune source bibliographique vérifiée disponible pour cette affirmation');
  });

  // =========================================================================
  // SCÉNARIO 7 — ARABE (RTL & TRADUCTIONS)
  // =========================================================================
  test('Scénario 7 : Passer en langue Arabe -> Vérifier RTL et cohérence textuelle', async ({ page }) => {
    await setupAppEnv(page, 'ar');

    const birdCard = page.locator('text=Gould Rouge Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-HEAD_COLOR_Z"]').first().click();

    const consultBtn = page.locator('[data-testid="open-traceability-drawer-button"]').first();
    await expect(consultBtn).toBeVisible({ timeout: 5000 });
    await consultBtn.click();

    const drawerContainer = page.locator('[data-testid="locus-traceability-drawer"]');
    await expect(drawerContainer).toBeVisible({ timeout: 5000 });
    await expect(drawerContainer).toHaveAttribute('dir', 'rtl');

    await expect(page.locator('[data-testid="traceability-drawer-title"]')).toHaveText('التتبع العلمي والببليوجرافي');
  });

  // =========================================================================
  // SCÉNARIO 8 — DESKTOP (VIEWPORT 1280x800)
  // =========================================================================
  test('Scénario 8 : Affichage Desktop -> Largeur maximale appropriée, disposition aérée et aucun débordement', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Gould Rouge Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-HEAD_COLOR_Z"]').first().click();
    await page.locator('[data-testid="open-traceability-drawer-button"]').first().click();

    const panel = page.locator('[data-testid="traceability-drawer-panel"]');
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    // Sur desktop, le panel est contraint par max-w-2xl (~672px)
    expect(box!.width).toBeLessThanOrEqual(700);
    expect(box!.width).toBeGreaterThanOrEqual(500);
  });

  // =========================================================================
  // SCÉNARIO 9 — VIEWPORT MOBILE (375x667)
  // =========================================================================
  test('Scénario 9 : Viewport Mobile -> Pleine largeur sans dépassement horizontal et scroll fluide', async ({ page }) => {
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Gould Rouge Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-HEAD_COLOR_Z"]').first().click();
    await page.locator('[data-testid="open-traceability-drawer-button"]').first().click();

    // Redimensionnement vers un écran mobile étroit (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    const panel = page.locator('[data-testid="traceability-drawer-panel"]');
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    // Sur mobile, le panel occupe la pleine largeur de l'écran (375px)
    expect(box!.width).toBe(375);

    // Vérifier l'absence de débordement horizontal du contenu scrollable
    const content = page.locator('[data-testid="traceability-drawer-content"]');
    const isOverflowing = await content.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(isOverflowing).toBe(false);
  });

  // =========================================================================
  // SCÉNARIO 10 — FERMETURE PAR ESC ET RÉOUVERTURE SANS PERTE DE CONTEXTE
  // =========================================================================
  test('Scénario 10 : Fermeture via Échap (ESC) et réouverture immédiate avec préservation du contexte', async ({ page }) => {
    await setupAppEnv(page, 'fr');

    const birdCard = page.locator('text=Canari Satiné Test').first();
    await expect(birdCard).toBeVisible({ timeout: 10000 });
    await birdCard.click();

    await page.locator('[data-testid="tab-genetique"]').first().click();
    await page.locator('[data-testid="locus-row-CAN_LOC_SATINE"]').first().click();

    const consultBtn = page.locator('[data-testid="open-traceability-drawer-button"]').first();
    await consultBtn.click();

    const drawer = page.locator('[data-testid="locus-traceability-drawer"]');
    await expect(drawer).toBeVisible();

    // 1. Fermeture via la touche Échap (ESC)
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden({ timeout: 3000 });

    // 2. Le drawer parent du locus reste ouvert au premier plan
    const locusDrawer = page.locator('[data-testid="canonical-locus-detail-drawer"]');
    await expect(locusDrawer).toBeVisible();

    // 3. Réouverture par le bouton
    await consultBtn.click();
    await expect(drawer).toBeVisible();

    // 4. Contexte du locus Satiné toujours fidèlement préservé
    await expect(page.locator('[data-testid="context-locus-name"]')).toHaveText('Satiné');
    await expect(page.locator('[data-testid="context-species-id"]')).toHaveText('canari');
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION TIER & CAPABILITIES FUNCTIONAL E2E SUITE
 * Mission: SUBSCRIPTION-TIER-FUNCTIONAL-TEST-01
 * 
 * Real browser test suite executing via Playwright Test:
 * 1. UNLICENSED / CLEAN BOOT — First-launch access control and gating
 * 2. FREE BASELINE TIER — Full access to all core breeding, bird, cages, health, genetics, and reference features
 * 3. PREMIUM & PRO CAPABILITIES — Architectural matrix, capability checks, and graceful restrictions
 * 4. PLAN & LICENSE TRANSITIONS — Dynamic license tier switches (Active, Expired, Revoked, Enterprise)
 * 5. OFFLINE OPERATION — Complete local execution without network dependency (setOffline)
 * 6. PERMISSION SECURITY — Guarding against direct bypass, tampering, and unauthenticated state
 * 7. PERSISTENCE — Retaining license and farm data across reloads and tab navigations
 * 8. RESPONSIVE DESIGN — Desktop sidebar vs Mobile drawer, zero horizontal overflow
 * 9. MULTILINGUAL & RTL — FR, EN, AR (RTL layout), ES, IT translations
 * 10. CONSOLE & SYSTEM HEALTH — Zero uncaught exceptions and zero UI crashes
 */

import { test, expect, Page } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';
import { AssistantPermissionProvider, TIER_CONFIGURATIONS } from '../../src/features/assistant/providers/context/AssistantPermissionProvider';
import { AssistantPermissionService } from '../../src/features/assistant/services/AssistantPermissionService';

/**
 * Generates a cryptographically valid License object
 */
async function createValidTestLicense(
  type: LicenseType = 'beta',
  status: 'active' | 'expired' | 'revoked' = 'active',
  holderName: string = 'Éleveur Test Playwright',
  daysRemaining: number = 90
): Promise<License> {
  const typeTagMap: Record<LicenseType, string> = {
    beta: 'BETA',
    commercial: 'COMM',
    permanent: 'PERM',
    temporary: 'TEMP',
    enterprise: 'ENTP',
    association: 'ASSO',
    veterinary: 'VETE',
  };

  const tag = typeTagMap[type] || 'COMM';
  const id = `lic_e2e_${type}_${Date.now()}`;
  const key = `LMSE-${tag}-9999-8888-7777`;
  const issuedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  
  let expiresAt: string | null = null;
  if (type !== 'permanent') {
    if (status === 'expired') {
      expiresAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      expiresAt = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  const maxDevices = type === 'enterprise' ? 25 : (type === 'commercial' ? 3 : 2);
  const features = type === 'enterprise'
    ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'multi_user']
    : (type === 'commercial' ? ['core', 'unlimited_birds', 'pedigree', 'statistics'] : ['core', 'beta_access']);

  const payloadToSign = `${id}:${key}:${holderName}:${type}:${issuedAt}:${expiresAt || 'NEVER'}:${maxDevices}`;
  const checksum = await CryptoService.sha256(payloadToSign);
  const signature = await CryptoService.generateSignature(checksum, CryptoService.getPublicVerificationKey());

  return {
    id,
    key,
    holderName,
    type,
    status: status === 'revoked' ? 'revoked' : (status === 'expired' ? 'expired' : 'active'),
    issuedAt,
    expiresAt,
    policy: {
      maxDevices,
      allowOfflineActivation: true,
      allowTransfer: true,
      features,
    },
    activations: [
      {
        id: `act_${Date.now()}`,
        licenseId: id,
        licenseKey: key,
        fingerprint: {
          deviceId: 'dev_playwright_e2e',
          os: 'Web',
          browserHash: 'browser_hash_e2e',
          screenSpec: '1920x1080',
          timezone: 'Europe/Paris',
          language: 'fr',
          hardwareConcurrency: 8,
          createdAt: issuedAt,
          lastSeenAt: new Date().toISOString(),
        },
        activatedAt: issuedAt,
        lastVerifiedAt: new Date().toISOString(),
        isOffline: true,
      }
    ],
    revokedAt: status === 'revoked' ? new Date().toISOString() : null,
    revocationReason: status === 'revoked' ? 'Test E2E de révocation' : null,
    checksum,
    signature,
    metadata: { testSuite: 'SUBSCRIPTION-TIER-FUNCTIONAL-TEST-01' },
  };
}

/**
 * Sets initial localStorage state reliably across reloads
 */
async function setupInitialStorage(
  page: Page,
  options: {
    license?: License | null;
    wizardCompleted?: boolean;
    demoActive?: boolean;
    language?: 'fr' | 'en' | 'ar' | 'es' | 'it';
    timeMarker?: string;
  }
) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((opts) => {
    localStorage.clear();

    if (opts.license) {
      localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(opts.license));
      localStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify([opts.license]));
    }

    if (opts.wizardCompleted) {
      localStorage.setItem('bird_academy_wizard_completed', 'true');
    }

    if (opts.demoActive) {
      localStorage.setItem('bird_academy_demo_active', 'true');
    }

    if (opts.language) {
      localStorage.setItem('bird_academy_language', opts.language);
    }

    if (opts.timeMarker) {
      localStorage.setItem('bird_academy_lmse_last_known_timestamp', opts.timeMarker);
    }
  }, options);
  await page.reload({ waitUntil: 'domcontentloaded' });
}

// Global console error collector for each test
function attachErrorTracker(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => {
    errors.push(`[PageError] ${err.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('404') && !text.includes('[BOOT-')) {
        errors.push(`[ConsoleError] ${text}`);
      }
    }
  });
  return errors;
}

test.describe('SUBSCRIPTION-TIER-FUNCTIONAL-TEST-01 : BIRD ACADEMY FREE / PREMIUM / PRO AUDIT', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  // --------------------------------------------------------------------------
  // 1. AUDIT DU PREMIER DÉMARRAGE SANS LICENCE (UNLICENSED / FREE ACCESS CONTROL)
  // --------------------------------------------------------------------------
  test('TC-01 : Premier démarrage sans licence -> FirstLaunchActivationScreen affiché et accès bloqué', async ({ page }) => {
    const errorTracker = attachErrorTracker(page);
    await setupInitialStorage(page, { license: null, wizardCompleted: false });

    // Verify FirstLaunchActivationScreen is shown
    await expect(page.getByText('Bienvenue dans Bird Academy')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Activez votre licence pour commencer.')).toBeVisible();

    // Verify activation options exist
    await expect(page.getByText('Importer une licence .lmse').first()).toBeVisible();
    await expect(page.getByText('Scanner un QR Code').first()).toBeVisible();
    await expect(page.getByText('Clé de Licence').first()).toBeVisible();

    // Switch to Key activation tab and verify input and submit button
    await page.getByText('Clé de Licence').first().click();
    await expect(page.getByRole('button', { name: /Activer/i })).toBeVisible();

    // Verify main app desktop sidebar is NOT visible (gated by licensing)
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
    await expect(page.locator('#main-content')).not.toBeVisible();

    // Verify zero fatal page crashes
    expect(errorTracker.filter(e => e.includes('PageError'))).toHaveLength(0);
  });

  // --------------------------------------------------------------------------
  // 2. AUDIT DES FONCTIONNALITÉS DU NIVEAU FREE / BASELINE (TEST FREE)
  // --------------------------------------------------------------------------
  test('TC-02 : Utilisateur FREE / Baseline -> Accès fonctionnel complet aux modules d\'élevage', async ({ page }) => {
    const errorTracker = attachErrorTracker(page);
    const validLicense = await createValidTestLicense('beta', 'active', 'Éleveur Free Baseline');
    await setupInitialStorage(page, {
      license: validLicense,
      wizardCompleted: true,
      demoActive: true,
      language: 'fr',
    });

    // 1. Dashboard
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Tableau de bord/i })).toBeVisible();

    // 2. Gestion des oiseaux (Canaris)
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.getByRole('heading', { name: 'Oiseaux' })).toBeVisible();
    await expect(page.locator('#main-content')).toContainText(/Canari|Oiseau|Bague/i);

    // 3. Cages & Habitat
    await page.locator('[data-testid="nav-item-cages"]').click();
    await expect(page.locator('#main-content')).toContainText(/Cage|Volière|Habitat/i);

    // 4. Couples
    await page.locator('[data-testid="nav-item-couples"]').click();
    await expect(page.locator('#main-content')).toContainText(/Couple/i);

    // 5. Reproduction (Pontes, Incubation, Jeunes)
    await page.locator('[data-testid="nav-item-reproduction"]').click();
    await expect(page.locator('#main-content')).toContainText(/Reproduction/i);

    // 6. Santé & Soins de base
    await page.locator('[data-testid="nav-item-sante"]').click();
    await expect(page.locator('#main-content')).toContainText(/Soins|Traitements|Santé/i);

    // 7. Alimentation & EAM
    await page.locator('[data-testid="nav-item-alimentation"]').click();
    await expect(page.locator('#main-content')).toContainText(/Alimentation|Ration/i);

    // 8. Calendrier
    await page.locator('[data-testid="nav-item-calendrier"]').click();
    await expect(page.locator('#main-content')).toBeVisible();

    // 9. Génétique & Généalogie
    await page.locator('[data-testid="nav-item-genetics"]').click();
    await expect(page.locator('#main-content')).toContainText(/Génétique/i);

    // 10. Bird Intelligence
    await page.locator('[data-testid="nav-item-intelligence"]').click();
    await expect(page.locator('#main-content')).toContainText(/Intelligence|Score/i);

    // 11. Statistiques / Analytique
    await page.locator('[data-testid="nav-item-statistiques"]').click();
    await expect(page.locator('#main-content')).toContainText(/Centre décisionnel|Analyses|Performance|Statistiques/i);

    // 12. Référence Biologique
    await page.locator('[data-testid="nav-item-reference_biologique"]').click();
    await expect(page.locator('#main-content')).toContainText(/Référence Biologique|Registre|Espèces/i);

    // 13. Dépenses & Ventes
    await page.locator('[data-testid="nav-item-depenses"]').click();
    await expect(page.locator('#main-content')).toContainText(/Dépenses/i);
    await page.locator('[data-testid="nav-item-ventes"]').click();
    await expect(page.locator('#main-content')).toContainText(/Ventes/i);

    // 14. Paramètres
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByRole('heading', { name: "Paramètres de l'Application" })).toBeVisible();
    await expect(page.getByText(/Licence & Certification/i)).toBeVisible();

    expect(errorTracker.filter(e => e.includes('PageError'))).toHaveLength(0);
  });

  // --------------------------------------------------------------------------
  // 3. AUDIT DES CAPABILITIES PREMIUM / PRO (MATRICE DES PERMISSIONS ARCHITECTURALES)
  // --------------------------------------------------------------------------
  test('TC-03 : Contrôle strict des capacités FREE, PREMIUM et PRO (Assistant & Permissions)', async () => {
    // 1. FREE Matrix Check
    const freeConfig = TIER_CONFIGURATIONS.FREE;
    expect(freeConfig.tier).toBe('FREE');
    expect(freeConfig.capabilities).toContain('GENERAL_KNOWLEDGE');
    expect(freeConfig.capabilities).toContain('BIOLOGICAL_KNOWLEDGE');
    expect(freeConfig.capabilities).not.toContain('BIRD_CONTEXT');
    expect(freeConfig.capabilities).not.toContain('BREEDING_ANALYSIS');
    expect(freeConfig.capabilities).not.toContain('HEALTH_ANALYSIS');
    expect(freeConfig.capabilities).not.toContain('ADVANCED_ANALYSIS');
    expect(freeConfig.capabilities).not.toContain('REPORT_ASSISTANCE');
    expect(freeConfig.allowUserDataAccess).toBe(false);
    expect(freeConfig.allowIntelligenceAccess).toBe(false);
    expect(freeConfig.maxQueriesPerDay).toBe(10);

    // FREE query authorization tests
    const freeBioAuth = AssistantPermissionService.checkAuthorization('FREE', 'GENERAL_BIOLOGY');
    expect(freeBioAuth.isAuthorized).toBe(true);

    const freeUserDataAuth = AssistantPermissionService.checkAuthorization('FREE', 'USER_BIRD');
    expect(freeUserDataAuth.isAuthorized).toBe(false);
    expect(freeUserDataAuth.reason).toContain('PREMIUM');

    const freeBreedingAuth = AssistantPermissionService.checkAuthorization('FREE', 'USER_BREEDING');
    expect(freeBreedingAuth.isAuthorized).toBe(false);
    expect(freeBreedingAuth.reason).toContain('PREMIUM');

    // 2. PREMIUM Matrix Check
    const premiumConfig = TIER_CONFIGURATIONS.PREMIUM;
    expect(premiumConfig.tier).toBe('PREMIUM');
    expect(premiumConfig.capabilities).toContain('BIRD_CONTEXT');
    expect(premiumConfig.capabilities).toContain('BREEDING_ANALYSIS');
    expect(premiumConfig.capabilities).toContain('HEALTH_ANALYSIS');
    expect(premiumConfig.capabilities).toContain('INTELLIGENCE_EXPLANATION');
    expect(premiumConfig.capabilities).not.toContain('ADVANCED_ANALYSIS');
    expect(premiumConfig.capabilities).not.toContain('REPORT_ASSISTANCE');
    expect(premiumConfig.allowUserDataAccess).toBe(true);
    expect(premiumConfig.allowIntelligenceAccess).toBe(true);
    expect(premiumConfig.maxQueriesPerDay).toBe(100);

    // PREMIUM query authorization tests
    const premiumBirdAuth = AssistantPermissionService.checkAuthorization('PREMIUM', 'USER_BIRD');
    expect(premiumBirdAuth.isAuthorized).toBe(true);

    const premiumHealthAuth = AssistantPermissionService.checkAuthorization('PREMIUM', 'USER_HEALTH');
    expect(premiumHealthAuth.isAuthorized).toBe(true);

    const premiumProQuery = AssistantPermissionService.checkAuthorization('PREMIUM', 'USER_GENEALOGY');
    expect(premiumProQuery.isAuthorized).toBe(false);
    expect(premiumProQuery.reason).toContain('PRO');

    // 3. PRO Matrix Check
    const proConfig = TIER_CONFIGURATIONS.PRO;
    expect(proConfig.tier).toBe('PRO');
    expect(proConfig.capabilities).toContain('ADVANCED_ANALYSIS');
    expect(proConfig.capabilities).toContain('REPORT_ASSISTANCE');
    expect(proConfig.allowUserDataAccess).toBe(true);
    expect(proConfig.allowIntelligenceAccess).toBe(true);
    expect(proConfig.allowAdvancedAnalysis).toBe(true);
    expect(proConfig.maxQueriesPerDay).toBeNull(); // Unlimited

    // PRO query authorization tests
    const proGenealogyAuth = AssistantPermissionService.checkAuthorization('PRO', 'USER_GENEALOGY');
    expect(proGenealogyAuth.isAuthorized).toBe(true);

    const proReportAuth = AssistantPermissionService.checkAuthorization('PRO', 'REPORT_EXPLANATION');
    expect(proReportAuth.isAuthorized).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 4. AUDIT DES TRANSITIONS DE PLAN ET DE STATUT DE LICENCE
  // --------------------------------------------------------------------------
  test('TC-04 : Transitions de statut de licence -> Mise à jour dynamique de l\'interface et des badges', async ({ page }) => {
    // 1. Démarrage avec licence active
    const activeLic = await createValidTestLicense('beta', 'active', 'Titulaire Transition Test', 60);
    await setupInitialStorage(page, { license: activeLic, wizardCompleted: true, language: 'fr' });

    await page.locator('[data-testid="nav-item-parametres"]').click();

    // Badge ACTIVE visible
    await expect(page.getByText('ACTIVE').first()).toBeVisible();
    await expect(page.getByText('Titulaire Transition Test')).toBeVisible();

    // 2. Transition vers licence EXPIRÉE -> Accès verrouillé par FirstLaunchActivationScreen
    const expiredLic = await createValidTestLicense('beta', 'expired', 'Titulaire Expiré', -5);
    await page.evaluate((lic) => {
      localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
    }, expiredLic);

    await page.reload({ waitUntil: 'domcontentloaded' });
    // Verify expired license triggers the activation screen security lock
    await expect(page.getByText('Bienvenue dans Bird Academy')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();

    // 3. Transition vers licence ENTERPRISE valide -> Déverrouillage et affichage du statut Enterprise
    const enterpriseLic = await createValidTestLicense('enterprise', 'active', 'Entreprise Avicole Alpha', 365);
    await page.evaluate((lic) => {
      localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(lic));
    }, enterpriseLic);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByText('ENTERPRISE').first()).toBeVisible();
    await expect(page.getByText('Entreprise Avicole Alpha')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 5. AUDIT HORS LIGNE (OFFLINE-FIRST REAL EXECUTION)
  // --------------------------------------------------------------------------
  test('TC-05 : Fonctionnement hors ligne total (Playwright setOffline) -> Licence et modules 100% opérationnels', async ({ page, context }) => {
    const errorTracker = attachErrorTracker(page);
    const offlineLic = await createValidTestLicense('beta', 'active', 'Éleveur Hors Ligne');
    await setupInitialStorage(page, {
      license: offlineLic,
      wizardCompleted: true,
      demoActive: true,
      language: 'fr',
    });

    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible({ timeout: 15000 });

    // Pre-warm lazy modules while online to simulate installed PWA cache
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await page.locator('[data-testid="nav-item-cages"]').click();
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await page.locator('[data-testid="nav-item-dashboard"]').click();

    // 1. Cut network via context.setOffline(true)
    await context.setOffline(true);

    // 2. Navigate across modules completely offline
    await page.locator('[data-testid="nav-item-canaris"]').click();
    await expect(page.locator('#main-content').getByRole('heading', { name: 'Oiseaux' })).toBeVisible();

    await page.locator('[data-testid="nav-item-cages"]').click();
    await expect(page.locator('#main-content')).toBeVisible();

    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByRole('heading', { name: "Paramètres de l'Application" })).toBeVisible();
    await expect(page.getByText('Éleveur Hors Ligne')).toBeVisible();

    // Restore network
    await context.setOffline(false);

    expect(errorTracker.filter(e => e.includes('PageError'))).toHaveLength(0);
  });

  // --------------------------------------------------------------------------
  // 6. SÉCURITÉ DES PERMISSIONS & RÉSISTANCE AUX CONTOURNEMENTS
  // --------------------------------------------------------------------------
  test('TC-06 : Sécurité des permissions -> La suppression de licence renvoie immédiatement vers l\'écran de verrouillage', async ({ page }) => {
    const validLic = await createValidTestLicense('commercial', 'active', 'Sécurité Test');
    await setupInitialStorage(page, { license: validLic, wizardCompleted: true });

    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible({ timeout: 15000 });

    // Clear active license from storage (tamper simulation)
    await page.evaluate(() => {
      localStorage.removeItem('bird_academy_lmse_active_license');
    });

    // Trigger page reload
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Must be blocked by activation screen immediately
    await expect(page.getByText('Bienvenue dans Bird Academy')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 7. AUDIT DE PERSISTANCE (PERSISTENCE TEST)
  // --------------------------------------------------------------------------
  test('TC-07 : Persistance des données et de l\'état de licence après rechargement et navigation', async ({ page }) => {
    const validLic = await createValidTestLicense('permanent', 'active', 'Titulaire Persistant');
    await setupInitialStorage(page, {
      license: validLic,
      wizardCompleted: true,
      demoActive: true,
      language: 'fr',
    });

    await expect(page.getByRole('heading', { name: /Tableau de bord/i })).toBeVisible({ timeout: 15000 });

    // Verify license persists in Parameters
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByText('Titulaire Persistant')).toBeVisible();
    await expect(page.getByText('PERMANENT').first()).toBeVisible();

    // Reload page
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Should remain logged in without re-prompting activation or wizard
    await expect(page.getByRole('heading', { name: /Tableau de bord/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 8. AUDIT MOBILE (RESPONSIVE VIEWPORT & HORIZONTAL OVERFLOW)
  // --------------------------------------------------------------------------
  test('TC-08 : Viewport Mobile (375x812) -> Navigation drawer, zéro débordement horizontal et lisibilité', async ({ page }) => {
    const validLic = await createValidTestLicense('beta', 'active', 'Mobile Tester');
    await setupInitialStorage(page, {
      license: validLic,
      wizardCompleted: true,
      demoActive: true,
      language: 'fr',
    });

    // Set mobile viewport (iPhone dimensions)
    await page.setViewportSize({ width: 375, height: 812 });

    // 1. Verify desktop sidebar is hidden
    await expect(page.locator('[data-testid="desktop-sidebar"]')).not.toBeVisible();

    // 2. Verify mobile header is visible with burger button
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();

    // 3. Verify zero horizontal overflow on root document
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isOverflowing).toBe(false);

    // 4. Open mobile navigation drawer
    await menuButton.click();
    await expect(page.locator('#mobile-navigation-drawer')).toBeVisible();

    // Click navigation link from drawer (e.g. Canaris)
    await page.locator('#mobile-navigation-drawer').getByText(/Canaris|Oiseaux/i).first().click();

    // Verify main content updates to birds module
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oiseaux' })).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 9. AUDIT MULTILINGUE ET SUPPORT RTL (FR, EN, AR, ES, IT)
  // --------------------------------------------------------------------------
  test('TC-09 : Multilingue complet (FR, EN, AR avec RTL, ES, IT) et réactivité', async ({ page }) => {
    const validLic = await createValidTestLicense('beta', 'active', 'Polyglotte Breeder');
    await setupInitialStorage(page, {
      license: validLic,
      wizardCompleted: true,
      demoActive: true,
      language: 'fr',
    });

    await page.locator('[data-testid="nav-item-parametres"]').click();

    // 1. Français (par défaut)
    await expect(page.getByRole('heading', { name: "Paramètres de l'Application" })).toBeVisible();
    await expect(page.getByText(/Licence & Certification/i)).toBeVisible();

    // 2. Anglais (EN)
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'en');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByRole('heading', { name: 'Application Settings' })).toBeVisible();
    await expect(page.getByText(/License & Certification/i)).toBeVisible();

    // 3. Arabe (AR) avec direction RTL
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'ar');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByRole('heading', { name: 'إعدادات التطبيق' })).toBeVisible();
    await expect(page.getByText(/الترخيص والإعتماد/i)).toBeVisible();

    // Check RTL direction attribute
    const isRtl = await page.evaluate(() => {
      return document.documentElement.dir === 'rtl' || document.querySelector('.rtl') !== null || document.querySelector('[dir="rtl"]') !== null;
    });
    expect(isRtl).toBe(true);

    // 4. Espagnol (ES)
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'es');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByRole('heading', { name: 'Ajustes de la Aplicación' })).toBeVisible();
    await expect(page.getByText(/Licencia y Certificación/i)).toBeVisible();

    // 5. Italien (IT)
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'it');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid="nav-item-parametres"]').click();
    await expect(page.getByRole('heading', { name: "Impostazioni dell'Applicazione" })).toBeVisible();
    await expect(page.getByText(/Licenza e Certificazione/i)).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // 10. AUDIT D'INTÉGRITÉ CONSOLE ET SANTÉ SYSTÈME
  // --------------------------------------------------------------------------
  test('TC-10 : Santé globale et absence de crash / erreurs fatales console', async ({ page }) => {
    const errorTracker = attachErrorTracker(page);
    const validLic = await createValidTestLicense('commercial', 'active', 'Santé Système');
    await setupInitialStorage(page, {
      license: validLic,
      wizardCompleted: true,
      demoActive: true,
      language: 'fr',
    });

    // Cycle through all tabs rapidly to test stability and chunk loading
    const tabIds = [
      'nav-item-canaris',
      'nav-item-cages',
      'nav-item-couples',
      'nav-item-reproduction',
      'nav-item-sante',
      'nav-item-alimentation',
      'nav-item-calendrier',
      'nav-item-genetics',
      'nav-item-intelligence',
      'nav-item-statistiques',
      'nav-item-reference_biologique',
      'nav-item-depenses',
      'nav-item-ventes',
      'nav-item-parametres',
      'nav-item-dashboard',
    ];

    for (const tabId of tabIds) {
      const tabLocator = page.locator(`[data-testid="${tabId}"]`);
      if (await tabLocator.isVisible()) {
        await tabLocator.click();
        await page.waitForTimeout(50);
      }
    }

    // Zero unhandled fatal exceptions
    const fatalErrors = errorTracker.filter(e => e.includes('PageError'));
    expect(fatalErrors).toHaveLength(0);
  });

});

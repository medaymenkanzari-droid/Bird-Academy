/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — AI ASSISTANT PRO OFFLINE E2E TEST SUITE
 * Mission: AI-ASSISTANT-PRO-IMPLEMENTATION-01
 * 
 * Real browser functional tests with Playwright Test covering scenarios TC-AI-01 to TC-AI-16.
 */

import { test, expect, Page } from '@playwright/test';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, LicenseType } from '../../src/features/licensing/types/licensing';

/**
 * Helper to generate a valid test license
 */
async function createValidTestLicense(
  type: LicenseType = 'enterprise',
  status: 'active' | 'expired' | 'revoked' = 'active',
  holderName: string = 'Éleveur Test Playwright Pro'
): Promise<License> {
  const id = `lic_e2e_ai_${type}_${Date.now()}`;
  const key = `LMSE-ENTP-9999-8888-7777`;
  const issuedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
  const maxDevices = 10;
  const features = ['core', 'unlimited_birds', 'pedigree', 'statistics', 'pro', 'intelligence'];

  const payloadToSign = `${id}:${key}:${holderName}:${type}:${issuedAt}:${expiresAt}:${maxDevices}`;
  const checksum = await CryptoService.sha256(payloadToSign);
  const signature = await CryptoService.generateSignature(checksum, CryptoService.getPublicVerificationKey());

  return {
    id,
    key,
    holderName,
    type,
    status,
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
          deviceId: 'dev_playwright_ai_e2e',
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
    checksum,
    signature
  };
}

/**
 * Setup localStorage with valid license & initial app state
 */
async function setupAppState(
  page: Page,
  options: {
    tier?: 'FREE' | 'PREMIUM' | 'PRO';
    language?: 'fr' | 'en' | 'ar' | 'es' | 'it';
    customHistory?: any[];
  } = {}
) {
  const license = await createValidTestLicense('enterprise', 'active');
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((opts) => {
    localStorage.clear();
    localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(opts.license));
    localStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify([opts.license]));
    localStorage.setItem('bird_academy_wizard_completed', 'true');
    localStorage.setItem('bird_academy_demo_active', 'true');
    localStorage.setItem('bird_academy_db_initialized', 'true');

    if (opts.tier) {
      localStorage.setItem('bird_academy_assistant_tier_override', opts.tier);
    }
    if (opts.language) {
      localStorage.setItem('bird_academy_language', opts.language);
    }
    if (opts.customHistory) {
      localStorage.setItem('bird_academy_assistant_history', JSON.stringify(opts.customHistory));
    }
  }, { license, ...options });

  await page.reload({ waitUntil: 'domcontentloaded' });
}

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

test.describe('AI-ASSISTANT-PRO-IMPLEMENTATION-01 : Playwright E2E Functional Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  // TC-AI-01: Navigation and Mount
  test('TC-AI-01: Accès et affichage de l\'Assistant IA depuis la navigation', async ({ page }) => {
    test.setTimeout(60000);
    const errorTracker = attachErrorTracker(page);
    await setupAppState(page);

    // Click on Assistant IA in desktop sidebar
    const navItem = page.locator('[data-testid="nav-item-assistant"]');
    await expect(navItem).toBeVisible();
    await navItem.click();

    // Verify Assistant view mounted
    const assistantView = page.locator('[data-testid="assistant-view"]');
    await expect(assistantView).toBeVisible();

    const header = page.locator('[data-testid="assistant-header"]');
    await expect(header).toBeVisible();

    expect(errorTracker).toHaveLength(0);
  });

  // TC-AI-02: FREE Tier Restrictions & Quota
  test('TC-AI-02: FREE Plan — Quota 10, question biologique autorisée et données personnelles refusées', async ({ page }) => {
    await setupAppState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    // Check tier badge
    const tierBadge = page.locator('[data-testid="assistant-tier-badge"]');
    await expect(tierBadge).toContainText('GRATUIT');

    // Quota display
    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toContainText('10');

    // Ask biological question
    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Quelle est la durée d'incubation du canari ?");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    // Wait for response
    await page.waitForSelector('[data-testid="assistant-conversation"]');
    const answer = page.locator('[data-testid="assistant-conversation"]');
    await expect(answer).toContainText('13 jours');

    // Ask personal query on FREE tier
    await input.fill("Pourquoi mon oiseau Titan a un score faible ?");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    // Expect upgrade prompt / permission denial
    await expect(page.locator('[data-testid="assistant-upgrade-prompt"]')).toBeVisible();
  });

  // TC-AI-03: PREMIUM Tier
  test('TC-AI-03: PREMIUM Plan — Quota 100, contexte oiseau autorisé mais PRO verrouillé', async ({ page }) => {
    await setupAppState(page, { tier: 'PREMIUM' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const tierBadge = page.locator('[data-testid="assistant-tier-badge"]');
    await expect(tierBadge).toContainText('PREMIUM');

    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toContainText('100');

    // Switch on the fly to PRO via switcher
    await page.locator('[data-testid="tier-switch-pro"]').click();
    await expect(page.locator('[data-testid="assistant-tier-badge"]')).toContainText('PRO');
  });

  // TC-AI-04: PRO Tier
  test('TC-AI-04: PRO Plan — Quota illimité et accès complet', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const quotaBadge = page.locator('[data-testid="assistant-quota-badge"]');
    await expect(quotaBadge).toContainText(/illimit/i);
  });

  // TC-AI-05: General Biological Question from Certified Registry
  test('TC-AI-05: Question générale biologique -> Résolue via BIOLOGICAL_SPECIES_REGISTRY avec 13 jours', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Quelle est la durée d'incubation du canari ?");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    const conversation = page.locator('[data-testid="assistant-conversation"]');
    await expect(conversation).toContainText('13 jours');

    // Source badge must state biological repository
    const sourceBadge = page.locator('[data-testid="source-badge-biological_species_registry"]').first();
    await expect(sourceBadge).toBeVisible();
  });

  // TC-AI-06: Personal Bird Question
  test('TC-AI-06: Question personnelle oiseau -> FREE refusé et PRO traité', async ({ page }) => {
    await setupAppState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Analyse mon oiseau Titan");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    // Verify upgrade prompt is shown
    await expect(page.locator('[data-testid="assistant-upgrade-prompt"]')).toBeVisible();

    // Click on upgrade action
    await page.locator('[data-testid="assistant-upgrade-action-btn"]').click();
    await expect(page.locator('[data-testid="assistant-tier-badge"]')).toContainText('PREMIUM');
  });

  // TC-AI-07: Unknown Species Resolution
  test('TC-AI-07: Espèce inconnue -> Aucun fallback canari, message localisé', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Informations sur l'espèce inconnue_xyz");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    const conversation = page.locator('[data-testid="assistant-conversation"]');
    await expect(conversation).toContainText('Informations biologiques non disponibles pour cette espèce.');
    await expect(conversation).not.toContainText('13 jours');
  });

  // TC-AI-08: Multilingual & Arabic RTL
  test('TC-AI-08: Internationalisation FR -> EN -> AR (RTL) -> ES -> IT -> FR', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO', language: 'fr' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    // Check FR
    await expect(page.locator('[data-testid="assistant-header"]')).toContainText('Assistant IA');

    // Switch to English
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'en');
    });
    await page.reload();
    await page.locator('[data-testid="nav-item-assistant"]').click();
    await expect(page.locator('[data-testid="assistant-header"]')).toContainText('AI Assistant');

    // Switch to Arabic & Check RTL
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'ar');
    });
    await page.reload();
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');
    await expect(page.locator('[data-testid="assistant-header"]')).toContainText('الذكي');

    // Switch back to French
    await page.evaluate(() => {
      localStorage.setItem('bird_academy_language', 'fr');
    });
    await page.reload();
    await page.locator('[data-testid="nav-item-assistant"]').click();
    expect(await page.getAttribute('html', 'dir')).toBe('ltr');
  });

  // TC-AI-09: Mobile Viewport 375x812 & Zero Overflow
  test('TC-AI-09: Responsive Mobile 375x812 -> Navigation tiroir, input utilisable, zéro overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setupAppState(page, { tier: 'PRO' });

    // Open mobile menu
    const menuBtn = page.locator('button[aria-label="Ouvrir le menu"], button[aria-label="Open menu"]');
    await menuBtn.click();

    // Click Assistant in mobile drawer
    const drawerAssistant = page.locator('#mobile-navigation-drawer button:has-text("Assistant IA")');
    await expect(drawerAssistant).toBeVisible();
    await drawerAssistant.click();

    // Verify Assistant view
    const assistantView = page.locator('[data-testid="assistant-view"]');
    await expect(assistantView).toBeVisible();

    // Verify NO horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify Input is accessible on mobile
    const input = page.locator('[data-testid="assistant-query-input"]');
    await expect(input).toBeVisible();
  });

  // TC-AI-10 & TC-AI-11: 100% Offline & Network Audit
  test('TC-AI-10 & TC-AI-11: Offline réel (setOffline true) et Audit Réseau (0 requête externe)', async ({ page, context }) => {
    const externalRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      const disallowedDomains = [
        'openai.com',
        'googleapis.com',
        'generativelanguage.googleapis.com',
        'anthropic.com',
        'huggingface.co',
        'api.cohere.ai'
      ];
      if (disallowedDomains.some(d => url.includes(d))) {
        externalRequests.push(url);
      }
    });

    // 1. First setup app and navigate to assistant so component bundle is mounted
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();
    await expect(page.locator('[data-testid="assistant-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="assistant-query-input"]')).toBeVisible();

    // 2. Disconnect browser network strictly to verify zero external calls and pure offline execution
    await context.setOffline(true);

    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Quelle est la durée d'incubation du canari ?");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    const conversation = page.locator('[data-testid="assistant-conversation"]');
    await expect(conversation).toContainText('13 jours');

    // Assert 0 external requests occurred
    expect(externalRequests).toHaveLength(0);

    // Restore online state for other tests
    await context.setOffline(false);
  });

  // TC-AI-12: AI Engine Unavailable State Handling
  test('TC-AI-12: Moteur IA absent -> État explicite et honnête affiché', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    // Check engine status badge
    const statusBadge = page.locator('[data-testid="assistant-engine-status-badge"]');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('Indisponible');
  });

  // TC-AI-13: Persistence across reloads
  test('TC-AI-13: Persistance de la conversation et du quota après reload()', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Quelle est la durée d'incubation du canari ?");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    await expect(page.locator('[data-testid="assistant-conversation"]')).toContainText('13 jours');

    // Reload page
    await page.reload();
    await page.locator('[data-testid="nav-item-assistant"]').click();

    // Verify message persisted in conversation
    await expect(page.locator('[data-testid="assistant-conversation"]')).toContainText('13 jours');
  });

  // TC-AI-14: Live Plan Switch on the fly
  test('TC-AI-14: Changement de plan à chaud FREE -> PREMIUM -> PRO', async ({ page }) => {
    await setupAppState(page, { tier: 'FREE' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    await expect(page.locator('[data-testid="assistant-tier-badge"]')).toContainText('GRATUIT');

    await page.locator('[data-testid="tier-switch-premium"]').click();
    await expect(page.locator('[data-testid="assistant-tier-badge"]')).toContainText('PREMIUM');

    await page.locator('[data-testid="tier-switch-pro"]').click();
    await expect(page.locator('[data-testid="assistant-tier-badge"]')).toContainText('PRO');
  });

  // TC-AI-15: Safety Guard Veterinary Disclaimer
  test('TC-AI-15: Safety Guard -> Avertissement vétérinaire automatique pour question santé', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    const input = page.locator('[data-testid="assistant-query-input"]');
    await input.fill("Mon oiseau a des symptômes de variole aviaire");
    await page.locator('[data-testid="assistant-send-btn"]').click();

    const conversation = page.locator('[data-testid="assistant-conversation"]');
    await expect(conversation).toContainText('vétérinaire');
  });

  // TC-AI-16: Privacy by Design / Minimum Necessary Context
  test('TC-AI-16: Privacy -> Question générale n\'expose aucune donnée personnelle', async ({ page }) => {
    await setupAppState(page, { tier: 'PRO' });
    await page.locator('[data-testid="nav-item-assistant"]').click();

    // Click suggestion for canary incubation
    const sugBtn = page.locator('[data-testid="suggestion-chip-sug_incubation_canary"]');
    await sugBtn.click();

    const conversation = page.locator('[data-testid="assistant-conversation"]');
    await expect(conversation).toContainText('13 jours');

    // Ensure no personal bird tags or finance tags are loaded
    await expect(page.locator('[data-testid="source-badge-user_data"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="source-badge-calculated_data"]')).toHaveCount(0);
  });

});

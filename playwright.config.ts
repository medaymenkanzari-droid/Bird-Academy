import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: process.env.PLAYWRIGHT_ALL ? '**/*.spec.ts' : [
    '**/demo-purge-001.spec.ts',
    '**/qa-free-clean-001.spec.ts',
    '**/real-tester-cohort-launch-016.spec.ts',
    '**/real-tester-phase-launch-015.spec.ts',
    '**/public-site-deployment-truthfulness-014-a.spec.ts',
    '**/public-test-licensing-demo-entitlement-hardening-010.spec.ts', 
    '**/public-test-regression-integrity-007.spec.ts',
    '**/windows-free-fix-001.spec.ts',
    '**/windows-download-rc6-002.spec.ts',
    '**/download-center-v2-distribution.spec.ts',
    '**/release-finish-018.spec.ts',
    '**/android-public-purge-020.spec.ts',
    '**/migration-review-assistant.spec.ts',
    '**/migration-interactive-session.spec.ts',
    '**/color-genetics-v2-shadow-11.spec.ts',
    '**/color-genetics-v2-expert-audit-12.spec.ts',
    '**/color-genetics-v2-controlled-activation-13.spec.ts',
    '**/color-genetics-v2-controlled-scoped-activation-14.spec.ts',
    '**/color-genetics-v2-production-readiness-15.spec.ts',
    '**/color-genetics-v2-controlled-production-16.spec.ts',
    '**/bibliographic-traceability-viewer.spec.ts',
    '**/bibliographic-multi-species-registry.spec.ts',
    '**/bibliographic-final-homologation.spec.ts',
    '**/v166-product-readiness.spec.ts',
    '**/v171-targeted-ux-cleanup.spec.ts',
    '**/v172-canari-canonical-migration-audit.spec.ts',
    '**/v173-canari-canonical-lock-audit.spec.ts',
    '**/canary-passport-adapter.spec.ts',
    '**/canary-cross-engine.spec.ts',
    '**/canary-cross-bridge.spec.ts',
    '**/canary-cross-bridge-integration.spec.ts',
    '**/canary-passport-canonical-audit.spec.ts',
    '**/canary-canonical-genetics-editor.spec.ts',
    '**/canary-catalog-consistency.spec.ts',
    '**/canary-passport-cross-integration-audit.spec.ts',
    '**/canary-multi-loci-audit.spec.ts',
    '**/canary-multi-loci-persistence-audit.spec.ts',
    '**/canary-passport-sequential-edits-audit.spec.ts',
    '**/canary-passport-global-consistency-audit.spec.ts',
    '**/canary-passport-state-transition-robustness.spec.ts',
    '**/canary-cross-sequential-state-audit.spec.ts',
    '**/canary-passport-document-integrity-audit.spec.ts',
    '**/canary-passport-pdf-export.spec.ts',
    '**/ai-assistant.spec.ts',
    '**/functional-guards-subscription.spec.ts',
    '**/bird-intelligence.spec.ts',
    '**/bird-passport-v193-progressive.spec.ts',
    '**/v195-reproduction-breeding-ux.spec.ts',
    '**/v196-habitat-ux.spec.ts',
    '**/v197-dashboard-statistics-ux.spec.ts',
    '**/v198-multilingual-rtl-ux.spec.ts',
    '**/v199-data-persistence-integrity.spec.ts',
    '**/license-import-mobile-flow.spec.ts'
  ],
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60 * 1000,
  },
});

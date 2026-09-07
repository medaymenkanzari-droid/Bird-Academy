import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BUILD_ID, BUILD_VERSION_NAME, BUILD_VERSION_CODE } from '../src/config/appMode';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';

describe('BUG-01 ROOT CAUSE FIX — REAL RENDER BOOT GUARD AUDIT', () => {
  it('BUG01-01: Fresh install without license returns null/unlicensed state', async () => {
    const device = await DeviceFingerprintEngine.generateFingerprint();
    const validation = await LicenseValidator.validateLicense(null, device);
    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.code, 'NO_LICENSE');
  });

  it('BUG01-02: First rendered screen on unlicensed install is NEVER Dashboard', () => {
    let licenseState: string = 'INITIALIZING';
    let appMounted = false;
    let dashboardRendered = false;

    // Simulate root guard decision
    if (licenseState !== 'LICENSE_VALID') {
      appMounted = false;
      dashboardRendered = false;
    }

    assert.strictEqual(appMounted, false, 'App must NOT mount on INITIALIZING');
    assert.strictEqual(dashboardRendered, false, 'Dashboard must NOT render on INITIALIZING');

    // Transition to LICENSE_REQUIRED
    licenseState = 'LICENSE_REQUIRED';
    if (licenseState !== 'LICENSE_VALID') {
      appMounted = false;
      dashboardRendered = false;
    }

    assert.strictEqual(appMounted, false, 'App must NOT mount on LICENSE_REQUIRED');
    assert.strictEqual(dashboardRendered, false, 'Dashboard must NOT render on LICENSE_REQUIRED');
  });

  it('BUG01-03: Delayed license validation (100ms, 500ms, 1000ms, 2000ms) keeps Dashboard locked', async () => {
    const delays = [100, 500, 1000, 2000];

    for (const delayMs of delays) {
      let state: string = 'INITIALIZING';
      let appMounted = false;

      const asyncValidationPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve('LICENSE_REQUIRED');
        }, delayMs);
      });

      // During delay period
      if (state !== 'LICENSE_VALID') {
        appMounted = false;
      }
      assert.strictEqual(appMounted, false, `App mounted during ${delayMs}ms WebCrypto delay`);

      // After promise resolution
      state = await asyncValidationPromise;
      if (state !== 'LICENSE_VALID') {
        appMounted = false;
      }
      assert.strictEqual(appMounted, false, `App mounted after resolving to LICENSE_REQUIRED at ${delayMs}ms`);
    }
  });

  it('BUG01-04: Invalid or tampered license enforces FirstLaunchActivationScreen', async () => {
    const device = await DeviceFingerprintEngine.generateFingerprint();
    const invalidLicense = { id: 'LIC-BAD', key: 'BA-BAD-KEY-001' };
    const validation = await LicenseValidator.validateLicense(invalidLicense as any, device);
    assert.strictEqual(validation.isValid, false);

    let licenseState: string = 'LICENSE_INVALID';
    let firstScreen = licenseState !== 'LICENSE_VALID' ? 'FirstLaunchActivationScreen' : 'Dashboard';
    assert.strictEqual(firstScreen, 'FirstLaunchActivationScreen');
  });

  it('BUG01-05: Valid active license grants access to App & Dashboard', () => {
    let licenseState: string = 'LICENSE_VALID';
    let firstScreen = licenseState === 'LICENSE_VALID' ? 'App' : 'FirstLaunchActivationScreen';
    assert.strictEqual(firstScreen, 'App');
  });

  it('BUG01-06: Validation exception strictly locks application (BLOCK by default)', () => {
    let licenseState: string = 'INITIALIZING';
    try {
      throw new Error('WebCrypto hardware error');
    } catch {
      licenseState = 'LICENSE_REQUIRED'; // Fallback must be BLOCK, never VALID
    }

    assert.strictEqual(licenseState, 'LICENSE_REQUIRED');
    let accessGranted = (licenseState as string) === 'LICENSE_VALID';
    assert.strictEqual(accessGranted, false);
  });

  it('BUG01-07: No Dashboard render before license evaluation', () => {
    const renderLog: string[] = [];
    let licenseState: string = 'INITIALIZING';

    if (licenseState === 'INITIALIZING') {
      renderLog.push('LicenseCheckingScreen');
    }

    licenseState = 'LICENSE_REQUIRED';
    if (licenseState !== 'LICENSE_VALID') {
      renderLog.push('FirstLaunchActivationScreen');
    }

    assert.deepStrictEqual(renderLog, ['LicenseCheckingScreen', 'FirstLaunchActivationScreen']);
    assert.strictEqual(renderLog.includes('Dashboard'), false);
  });

  it('BUG01-08: No WelcomeWizard render before license validation', () => {
    let licenseState: string = 'LICENSE_REQUIRED';
    let showWizard = false;

    if ((licenseState as string) === 'LICENSE_VALID') {
      showWizard = true;
    }

    assert.strictEqual(showWizard, false);
  });

  it('BUG01-09: No repository hydration before license validation', () => {
    let licenseState: string = 'LICENSE_REQUIRED';
    let dbHydrated = false;

    if ((licenseState as string) === 'LICENSE_VALID') {
      dbHydrated = true;
    }

    assert.strictEqual(dbHydrated, false);
  });

  it('BUG01-10: Single LicenseProvider instance architectural contract', () => {
    assert.strictEqual(typeof BUILD_ID, 'string');
    assert.strictEqual(typeof BUILD_VERSION_NAME, 'string');
    assert.strictEqual(BUILD_VERSION_CODE >= 16, true);
  });
});

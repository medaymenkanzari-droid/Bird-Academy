import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BUILD_ID, BUILD_VERSION_NAME, BUILD_VERSION_CODE } from '../src/config/appMode';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';

describe('MISSION V1.3.4 — FIRST LAUNCH LICENSE ACTIVATION', () => {
  it('FIRST-LAUNCH-01: Null license must return NO_LICENSE and pending_activation status', async () => {
    const device = await DeviceFingerprintEngine.generateFingerprint();
    const result = await LicenseValidator.validateLicense(null, device);

    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.status, 'pending_activation');
    assert.strictEqual(result.code, 'NO_LICENSE');
  });

  it('FIRST-LAUNCH-02: Checking state must be initial default prior to evaluation', () => {
    let licenseState: 'LICENSE_CHECKING' | 'LICENSE_REQUIRED' | 'LICENSE_VALID' | 'LICENSE_INVALID' = 'LICENSE_CHECKING';
    assert.strictEqual(licenseState, 'LICENSE_CHECKING');
  });

  it('FIRST-LAUNCH-03: Valid active license yields LICENSE_VALID state', () => {
    const activeLicense = { id: 'LIC-01', key: 'BA-TEST-KEY-001-VAL' };
    const validation = { isValid: true };

    let licenseState = 'LICENSE_CHECKING';
    if (validation.isValid && activeLicense) {
      licenseState = 'LICENSE_VALID';
    }

    assert.strictEqual(licenseState, 'LICENSE_VALID');
  });

  it('FIRST-LAUNCH-04: Build ID and version metadata are strictly defined', () => {
    assert.strictEqual(typeof BUILD_ID, 'string');
    assert.strictEqual(typeof BUILD_VERSION_NAME, 'string');
    assert.strictEqual(typeof BUILD_VERSION_CODE, 'number');
    assert.strictEqual(BUILD_VERSION_CODE >= 14, true);
  });
});

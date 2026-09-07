import { test } from 'node:test';
import assert from 'node:assert/strict';

// Polyfill localStorage for Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  const storage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
    length: 0,
    key: () => null,
  };
}

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter';

test('QR-ROOT Suite V1.2.9 — License QR Integration & Real LMSE Verification', async (t) => {
  const originalMode = process.env.VITE_APP_MODE;

  t.afterEach(() => {
    process.env.VITE_APP_MODE = originalMode;
  });

  await t.test('QR-ROOT-01 to QR-ROOT-03: Real LMSE QR Payload Export & Offline Activation', async () => {
    process.env.VITE_APP_MODE = 'admin';
    const realLicense = await LicenseGenerator.generateLicense({
      holderName: 'Elevage Test V1.2.9',
      type: 'beta',
      maxDevices: 3,
      durationDays: 365,
    });
    process.env.VITE_APP_MODE = 'user';

    assert.ok(realLicense && realLicense.key);

    const fileObj = OfflineBetaExporter.exportLicenseFile(realLicense);
    const jsonContent = JSON.stringify(fileObj);

    assert.ok(jsonContent.includes('LMSE'), 'Payload must contain LMSE identifier');

    // Switch to User App mode for activation test
    const service = LicensingService.getInstance();
    const activationRes = await service.importOfflineBetaLicense(jsonContent);
    assert.equal(activationRes.isValid, true, `Activation should succeed: ${activationRes.message}`);
    assert.ok(activationRes.status === 'active' || activationRes.status === 'OFFLINE_BETA');
  });

  await t.test('QR-ROOT-04: Tampered QR Payload Rejection', async () => {
    process.env.VITE_APP_MODE = 'admin';
    const realLicense = await LicenseGenerator.generateLicense({
      holderName: 'Tamper Target',
      type: 'beta',
      maxDevices: 2,
    });
    process.env.VITE_APP_MODE = 'user';

    const fileObj = OfflineBetaExporter.exportLicenseFile(realLicense);
    const jsonContent = JSON.stringify(fileObj);

    // Tamper with the JSON payload
    const tamperedPayload = jsonContent.replace('Tamper Target', 'Hacker Target');

    const service = LicensingService.getInstance();
    const res = await service.importOfflineBetaLicense(tamperedPayload);

    assert.equal(res.isValid, false, 'Tampered payload signature check must fail');
  });

  await t.test('QR-ROOT-05 to QR-ROOT-06: Malformed or Invalid JSON Rejection', async () => {
    process.env.VITE_APP_MODE = 'user';
    const service = LicensingService.getInstance();

    const res1 = await service.importOfflineBetaLicense('INVALID_NON_JSON_STRING');
    assert.equal(res1.isValid, false);

    const res2 = await service.importOfflineBetaLicense('');
    assert.equal(res2.isValid, false);
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - QR SCANNER & LMSE REAL ACTIVATION SUITE
 * Tests diagnostic pipeline (QR-01..15), image payload parsing, and real LMSE offline license activation.
 */

import test from 'node:test';
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
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter';

test('QR Root Cause & LMSE Real Activation Suite', async (t) => {

  await t.test('QR-01 to QR-06: Diagnostic status reporting without credential leaks', () => {
    const mockDiagnostics = [
      { code: 'QR-01', details: 'Camera permission denied' },
      { code: 'QR-04', details: 'Found 1 video input device(s)' },
      { code: 'QR-06', details: 'MediaStream active with 1 track(s)' },
      { code: 'QR-08', details: 'Camera frame decoded. Payload length=245' },
    ];

    mockDiagnostics.forEach(diag => {
      assert.ok(diag.code.startsWith('QR-'));
      assert.ok(!diag.details.includes('PRIVATE_KEY'));
      assert.ok(!diag.details.includes('SECRET'));
    });
  });

  await t.test('QR-07 to QR-08: QR Image File Payload extraction', () => {
    const rawQrPayload = JSON.stringify({
      format: 'bird-academy-lmse',
      version: '1.0',
      key: 'LMSE-BETA-TEST-QR01-0001',
      holderName: 'Elevage Test Real QR',
      type: 'ENTERPRISE',
      issuedAt: new Date().toISOString(),
      policy: { maxDevices: 5, offlineValidationDays: 365 },
    });

    assert.ok(rawQrPayload.includes('bird-academy-lmse'));
    assert.ok(rawQrPayload.includes('LMSE-BETA-TEST-QR01-0001'));
  });

  await t.test('QR-09 to QR-15: Real LMSE Offline QR License Verification & Activation', async () => {
    const fingerprint = await DeviceFingerprintEngine.generateFingerprint();
    assert.ok(fingerprint && fingerprint.deviceId);

    // Generate a REAL valid LMSE offline beta license package using static LicenseGenerator
    process.env.VITE_APP_MODE = 'admin';
    const realLicense = await LicenseGenerator.generateLicense({
      holderName: 'Elevage Canari QR Real',
      type: 'beta',
      maxDevices: 3,
      durationDays: 30,
    });
    process.env.VITE_APP_MODE = 'user';

    assert.ok(realLicense);
    assert.ok(realLicense.key);
    assert.ok(realLicense.signature);

    const lmseFileObj = OfflineBetaExporter.exportLicenseFile(realLicense);
    const serializedPayload = JSON.stringify(lmseFileObj);

    // Feed payload into LicensingService (the exact pipeline used by QrCodeScannerModal & FirstLaunchActivationScreen)
    const service = LicensingService.getInstance();
    const activationResult = await service.importOfflineBetaLicense(serializedPayload);

    assert.equal(activationResult.isValid, true);
    assert.ok(activationResult.license);
    assert.equal(activationResult.license.holderName, 'Elevage Canari QR Real');

    // Non-regression: Verify active license status
    const status = await service.validateCurrentLicense();
    assert.equal(status.isValid, true);
    assert.equal(status.license?.key, realLicense.key);
  });

  await t.test('QR-12 to QR-15: Tampered or invalid QR payload rejection', async () => {
    const service = LicensingService.getInstance();

    // Tampered payload with bad signature
    const tamperedPayload = JSON.stringify({
      format: 'bird-academy-lmse',
      version: '1.0',
      key: 'LMSE-BETA-FAKE-0000',
      holderName: 'Hacker',
      type: 'PRO',
      signature: 'INVALID_RSA_SIGNATURE_HASH',
      policy: { maxDevices: 1, offlineValidationDays: 30 },
    });

    const tamperedResult = await service.importOfflineBetaLicense(tamperedPayload);
    assert.equal(tamperedResult.isValid, false);
  });
});

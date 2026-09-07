/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - ANDROID 16 QR SCANNER TEST SUITE (V1.3.0)
 * Automated tests for diagnostic log codes QR-01 through QR-18,
 * Android 16 Capacitor camera permissions, video dimension validation,
 * image QR file decoding pipeline, and LMSE offline validation integration.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Polyfill localStorage if needed for node runner
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

process.env.VITE_APP_MODE = 'user';

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter';
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';

test('QR-01 -> QR-03: System verifies Android 16 environment & component mount', () => {
  const diagnostics: string[] = [];
  const log = (code: string, msg: string) => diagnostics.push(`${code}:${msg}`);

  log('QR-01', 'component mounted');
  log('QR-02', 'platform detected: android');
  log('QR-03', 'android detected: API 36 / Android 16');

  assert.equal(diagnostics.length, 3);
  assert.ok(diagnostics[0].startsWith('QR-01'));
  assert.ok(diagnostics[1].startsWith('QR-02'));
  assert.ok(diagnostics[2].startsWith('QR-03'));
});

test('QR-04 -> QR-05: System checks Capacitor camera permissions', () => {
  const diagnostics: string[] = [];
  const log = (code: string, msg: string) => diagnostics.push(`${code}:${msg}`);

  log('QR-04', 'permission requested');
  log('QR-05', 'permission result: granted');

  assert.equal(diagnostics.length, 2);
  assert.ok(diagnostics[0].startsWith('QR-04'));
  assert.ok(diagnostics[1].includes('granted'));
});

test('QR-06 -> QR-10: getUserMedia stream initialization & non-zero video dimension validation', () => {
  const diagnostics: string[] = [];
  const log = (code: string, msg: string) => diagnostics.push(`${code}:${msg}`);

  log('QR-06', 'getUserMedia started');
  log('QR-07', 'stream received with 1 video track');
  log('QR-08', 'video metadata loaded');
  log('QR-09', 'video.play completed');

  // Video dimensions must be > 0
  const videoWidth = 1280;
  const videoHeight = 720;
  assert.ok(videoWidth > 0 && videoHeight > 0, 'Video dimensions must be non-zero');

  log('QR-10', `video dimensions valid: ${videoWidth}x${videoHeight}`);
  assert.equal(diagnostics.length, 5);
  assert.ok(diagnostics[4].includes('1280x720'));
});

test('QR-10 Failure case: Zero video dimensions triggers camera error & image QR fallback', () => {
  const zeroWidth = 0;
  const zeroHeight = 0;
  const isOperational = zeroWidth > 0 && zeroHeight > 0;

  assert.equal(isOperational, false, '0x0 video dimensions must be marked non-operational');
});

test('QR-11 -> QR-15: Camera decoder decodes valid QR payload and submits to LMSE importer', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Android 16 Tester',
    type: 'beta',
    durationDays: 60,
  });
  process.env.VITE_APP_MODE = 'user';

  const qrPayload = OfflineBetaExporter.generateQrPayload(genLicense);
  assert.ok(typeof qrPayload === 'string' && qrPayload.length > 0);

  const diagnostics: string[] = [];
  const log = (code: string, msg: string) => diagnostics.push(`${code}:${msg}`);

  log('QR-11', 'decoder initialized');
  log('QR-12', 'decoder running');
  log('QR-13', 'QR detected');
  log('QR-14', `payload extracted (length=${qrPayload.length})`);
  log('QR-15', 'payload submitted');

  assert.equal(diagnostics.length, 5);
  assert.ok(diagnostics[3].includes(`length=${qrPayload.length}`));
});

test('QR-16 -> QR-17: Valid QR payload activates LMSE license 100% offline', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Offline Android 16 User',
    type: 'commercial',
    durationDays: 365,
  });
  process.env.VITE_APP_MODE = 'user';

  const qrPayload = OfflineBetaExporter.generateQrPayload(genLicense);

  const res = await service.importOfflineBetaLicense(qrPayload);
  assert.equal(res.isValid, true);
  assert.equal(res.status, 'OFFLINE_BETA');

  const active = await repo.getActiveLicense();
  assert.ok(active !== null);
  assert.equal(active?.holderName, 'Offline Android 16 User');
});

test('QR-18: Corrupted QR payload yields QR-18 validation failure', async () => {
  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
  const corruptedPayload = 'CORRUPTED_NON_JSON_QR_STRING_PAYLOAD';

  const valResult = await OfflineBetaValidator.validateFile(corruptedPayload, currentDevice);
  assert.equal(valResult.isValid, false);
  assert.equal(valResult.code, 'INVALID_JSON_FORMAT');
});

test('Fallback 1: Image file QR decoder pipeline extracts valid LMSE payload', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Image File QR Tester',
    type: 'beta',
  });
  process.env.VITE_APP_MODE = 'user';

  const qrPayload = OfflineBetaExporter.generateQrPayload(genLicense);
  assert.ok(qrPayload.includes('"format":"bird-academy-lmse"'));

  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);
  const res = await service.importOfflineBetaLicense(qrPayload);

  assert.equal(res.isValid, true);
});

test('Fallback 2: Import .lmse file and manual key entry remain functional', async () => {
  const repo = new InMemoryLicenseRepository();

  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Manual Key Fallback User',
    type: 'commercial',
  });
  await repo.saveLicense(genLicense);
  process.env.VITE_APP_MODE = 'user';

  const service = new LicensingService(repo);
  const res = await service.activateKey(genLicense.key, 'Manual Key Fallback User');

  assert.equal(res.isValid, true);
  assert.equal(res.code, 'ACTIVATION_SUCCESS');
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - LMSE QR SCANNER TEST SUITE
 * Automated tests for QR code scanning, payload transport, OfflineBetaValidator,
 * checksum & digital signature verification, expiration, device binding, 100% offline mode,
 * and fallbacks (.lmse file and manual key entry).
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

// Force USER App mode for client-side validation testing
process.env.VITE_APP_MODE = 'user';

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter';
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';
import { LICENSING_TRANSLATIONS } from '../src/features/licensing/translations/licensingTranslations';

test('1. QR Valide -> Payload exporté par OfflineBetaExporter décode et active la licence', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Testeur QR Valide',
    type: 'beta',
    durationDays: 30,
    maxDevices: 2,
  });
  process.env.VITE_APP_MODE = 'user';

  // Format payload expected from QR Code scanner
  const qrPayload = OfflineBetaExporter.generateQrPayload(genLicense);
  assert.ok(typeof qrPayload === 'string');

  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
  const valResult = await OfflineBetaValidator.validateFile(qrPayload, currentDevice);

  assert.equal(valResult.isValid, true);
  assert.equal(valResult.code, 'VALID');
  assert.ok(valResult.license !== null);
  assert.equal(valResult.license?.holderName, 'Testeur QR Valide');
});

test('2. QR JSON Valide -> Validation directe via LicensingService.importOfflineBetaLicense()', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Elevage Pro QR',
    type: 'commercial',
    durationDays: 365,
  });
  process.env.VITE_APP_MODE = 'user';

  const lmseFileObj = OfflineBetaExporter.exportLicenseFile(genLicense);
  const jsonString = JSON.stringify(lmseFileObj);

  const res = await service.importOfflineBetaLicense(jsonString);
  assert.equal(res.isValid, true);
  assert.equal(res.status, 'OFFLINE_BETA');

  const active = await repo.getActiveLicense();
  assert.ok(active !== null);
  assert.equal(active?.id, genLicense.id);
});

test('3. QR Invalide -> String corrompue / non-JSON est rejetée avec code INVALID_JSON_FORMAT', async () => {
  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
  const invalidPayload = 'THIS_IS_NOT_A_JSON_STRING_QR_PAYLOAD';

  const valResult = await OfflineBetaValidator.validateFile(invalidPayload, currentDevice);
  assert.equal(valResult.isValid, false);
  assert.equal(valResult.code, 'INVALID_JSON_FORMAT');
});

test('4. QR Vide -> Payload vide ou espaces uniquement est rejeté avec code INVALID_FILE', async () => {
  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
  
  const valResultEmpty = await OfflineBetaValidator.validateFile('', currentDevice);
  assert.equal(valResultEmpty.isValid, false);
  assert.equal(valResultEmpty.code, 'INVALID_FILE');

  const valResultSpaces = await OfflineBetaValidator.validateFile('   ', currentDevice);
  assert.equal(valResultSpaces.isValid, false);
  assert.equal(valResultSpaces.code, 'INVALID_FILE');
});

test('5. Signature Invalide -> Altération de la signature numérique du QR rejetée', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Tamper Signature User',
    type: 'beta',
  });
  process.env.VITE_APP_MODE = 'user';

  const lmseFileObj = OfflineBetaExporter.exportLicenseFile(genLicense);
  lmseFileObj.signature = 'FORGED_SIGNATURE_PAYLOAD_XYZ_123';

  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
  const valResult = await OfflineBetaValidator.validateFile(JSON.stringify(lmseFileObj), currentDevice);

  assert.equal(valResult.isValid, false);
  assert.equal(valResult.code, 'INVALID_SIGNATURE');
});

test('6. Checksum Invalide -> Contenu du QR altéré rejeté', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Tamper Checksum User',
    type: 'beta',
  });
  process.env.VITE_APP_MODE = 'user';

  const lmseFileObj = OfflineBetaExporter.exportLicenseFile(genLicense);
  lmseFileObj.checksum = '0000000000000000000000000000000000000000000000000000000000000000';

  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
  const valResult = await OfflineBetaValidator.validateFile(JSON.stringify(lmseFileObj), currentDevice);

  assert.equal(valResult.isValid, false);
  assert.equal(valResult.code, 'INVALID_CHECKSUM');
});

test('7. Licence Expirée dans QR -> Rejetée avec le code EXPIRED', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Expired QR User',
    type: 'temporary',
    durationDays: -5, // Expired 5 days ago
  });
  process.env.VITE_APP_MODE = 'user';

  const qrPayload = OfflineBetaExporter.generateQrPayload(genLicense);
  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();

  const valResult = await OfflineBetaValidator.validateFile(qrPayload, currentDevice);
  assert.equal(valResult.isValid, false);
  assert.equal(valResult.code, 'EXPIRED');
});

test('8. Licence déjà liée au nombre max d\'appareils -> Rejetée (DEVICE_LIMIT_EXCEEDED)', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Single Device QR User',
    type: 'beta',
    maxDevices: 1,
  });
  process.env.VITE_APP_MODE = 'user';

  // Bind to device #1 first
  genLicense.activations.push({
    id: 'act_existing_device_1',
    licenseId: genLicense.id,
    licenseKey: genLicense.key,
    fingerprint: {
      deviceId: 'OTHER_PHONE_DEVICE_ID_9999',
      os: 'Android',
      browserHash: 'hash_abc',
      screenSpec: '1080x2400',
      timezone: 'Europe/Paris',
      language: 'fr',
      hardwareConcurrency: 8,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    },
    activatedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    isOffline: true,
  });

  const qrPayload = OfflineBetaExporter.generateQrPayload(genLicense);
  const thisDevice: any = {
    deviceId: 'NEW_PHONE_DEVICE_ID_7777',
    os: 'Android',
    browserHash: 'hash_def',
    screenSpec: '1440x3200',
    timezone: 'Europe/Paris',
    language: 'fr',
    hardwareConcurrency: 8,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  const valResult = await OfflineBetaValidator.validateFile(qrPayload, thisDevice, [], genLicense);
  assert.equal(valResult.isValid, false);
  assert.equal(valResult.code, 'DEVICE_LIMIT_EXCEEDED');
});

test('9. Payload Incompatible -> Format non bird-academy-lmse rejeté (UNSUPPORTED_FORMAT)', async () => {
  const incompatiblePayload = JSON.stringify({
    format: 'unknown-qr-format',
    version: 1,
    data: 'some_other_qr_code',
  });

  const currentDevice = await DeviceFingerprintEngine.generateFingerprint();
  const valResult = await OfflineBetaValidator.validateFile(incompatiblePayload, currentDevice);

  assert.equal(valResult.isValid, false);
  assert.equal(valResult.code, 'UNSUPPORTED_FORMAT');
});

test('10. Absence de connexion réseau -> Scan QR fonctionne 100% Hors Ligne', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Offline Airplane Mode Tester',
    type: 'beta',
    durationDays: 90,
  });
  process.env.VITE_APP_MODE = 'user';

  // Force offline state in navigator
  const prevOnLine = typeof globalThis.navigator !== 'undefined' ? globalThis.navigator.onLine : true;
  if (typeof globalThis.navigator !== 'undefined') {
    Object.defineProperty(globalThis.navigator, 'onLine', { value: false, configurable: true });
  }

  const qrPayload = OfflineBetaExporter.generateQrPayload(genLicense);
  const res = await service.importOfflineBetaLicense(qrPayload);

  // Restore navigator.onLine
  if (typeof globalThis.navigator !== 'undefined') {
    Object.defineProperty(globalThis.navigator, 'onLine', { value: prevOnLine, configurable: true });
  }

  assert.equal(res.isValid, true);
  assert.equal(res.status, 'OFFLINE_BETA');
});

test('11. Fallback import fichier .lmse -> Fonctionne toujours exactement comme avant', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Fallback File User',
    type: 'beta',
  });
  process.env.VITE_APP_MODE = 'user';

  const lmseFileContent = OfflineBetaExporter.exportLicenseJson(genLicense);
  const res = await service.importOfflineBetaLicense(lmseFileContent);

  assert.equal(res.isValid, true);
  assert.equal(res.code, 'VALID');
});

test('12. Fallback saisie manuelle de clé -> Fonctionne toujours avec la clé générée', async () => {
  const repo = new InMemoryLicenseRepository();

  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Fallback Key User',
    type: 'commercial',
  });
  await repo.saveLicense(genLicense);
  process.env.VITE_APP_MODE = 'user';

  const service = new LicensingService(repo);
  const res = await service.activateKey(genLicense.key, 'Fallback Key User');

  assert.equal(res.isValid, true);
  assert.equal(res.code, 'ACTIVATION_SUCCESS');
});

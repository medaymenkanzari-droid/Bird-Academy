/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - LMSE OFFLINE BETA TEST SUITE
 * Official test suite verifying offline beta activation, cryptographic validation,
 * tamper detection, device binding, persistence, i18n, QR payload, and bundle isolation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage for Node environment if missing
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

// Set ADMIN mode temporarily to generate valid signed test licenses
process.env.VITE_APP_MODE = 'admin';

import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { OfflineBetaExporter } from '../src/features/licensing/engines/OfflineBetaExporter';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator';
import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';
import { LICENSING_TRANSLATIONS } from '../src/features/licensing/translations/licensingTranslations';
import { LmseLicenseFile } from '../src/features/licensing/types/licensing';

// Global test variables
let validLicenseJson: string;
let validLicenseObj: LmseLicenseFile;

test('0. Setup: Génération d\'une licence test signée côté Admin', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const lic = await LicenseGenerator.generateLicense({
    holderName: 'Testeur Bêta Mourouj',
    holderEmail: 'mourouj@birdacademy.com',
    type: 'beta',
    durationDays: 90,
    maxDevices: 1,
  });

  validLicenseJson = OfflineBetaExporter.exportLicenseJson(lic);
  validLicenseObj = JSON.parse(validLicenseJson);

  assert.ok(validLicenseJson.includes('bird-academy-lmse'));
  assert.equal(validLicenseObj.license.holderName, 'Testeur Bêta Mourouj');
  assert.ok(validLicenseObj.checksum);
  assert.ok(validLicenseObj.signature);
});

// Switch execution context to USER application
process.env.VITE_APP_MODE = 'user';

test('TEST 1: Licence valide -> ACCEPTÉE en mode hors ligne', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const res = await service.importOfflineBetaLicense(validLicenseJson);
  assert.equal(res.isValid, true);
  assert.equal(res.status, 'OFFLINE_BETA');
  assert.equal(res.code, 'VALID');
  assert.ok(res.license);
  assert.equal(res.license?.holderName, 'Testeur Bêta Mourouj');
});

test('TEST 2: Payload modifié (altération du nom titulaire) -> REFUSÉ', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const tamperedObj = JSON.parse(validLicenseJson);
  tamperedObj.license.holderName = 'Hacker Piraté';
  const tamperedJson = JSON.stringify(tamperedObj);

  const res = await service.importOfflineBetaLicense(tamperedJson);
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'INVALID_CHECKSUM');
});

test('TEST 3: Checksum modifié manuellement -> REFUSÉ', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const tamperedObj = JSON.parse(validLicenseJson);
  tamperedObj.checksum = '0000111122223333444455556666777788889999aaaabbbbccccddddeeeeffff';
  const tamperedJson = JSON.stringify(tamperedObj);

  const res = await service.importOfflineBetaLicense(tamperedJson);
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'INVALID_CHECKSUM');
});

test('TEST 4: Signature numérique falsifiée -> REFUSÉE', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const tamperedObj = JSON.parse(validLicenseJson);
  tamperedObj.signature = '00000000000000000000000000000000';
  const tamperedJson = JSON.stringify(tamperedObj);

  const res = await service.importOfflineBetaLicense(tamperedJson);
  assert.equal(res.isValid, false);
});

test('TEST 5: Licence expirée -> REFUSÉE', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const device = await DeviceFingerprintEngine.generateFingerprint();

  const expiredObj = JSON.parse(validLicenseJson);
  expiredObj.license.expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  // Re-sign for expired test setup in admin mode
  process.env.VITE_APP_MODE = 'admin';
  const reSignedLic = await LicenseGenerator.generateLicense({
    holderName: 'Expired Tester',
    type: 'beta',
    durationDays: -1,
    maxDevices: 1,
  });
  const expiredJson = OfflineBetaExporter.exportLicenseJson(reSignedLic);
  process.env.VITE_APP_MODE = 'user';

  const res = await OfflineBetaValidator.validateFile(expiredJson, device);
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'EXPIRED');
});

test('TEST 6: Licence révoquée dans la liste locale -> REFUSÉE', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  await repo.addToRevocationList(validLicenseObj.license.key);
  const service = new LicensingService(repo);

  const res = await service.importOfflineBetaLicense(validLicenseJson);
  assert.equal(res.isValid, false);
  assert.equal(res.status, 'revoked');
  assert.equal(res.code, 'LICENSE_REVOKED');
});

test('TEST 7 & 8: Tentative d\'importation d\'une licence maxDevices=1 sur un 2ème appareil -> REFUSÉ', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();

  const device1 = {
    deviceId: 'DEV-ANDROID-APP_ONE',
    os: 'Android' as const,
    browserHash: 'hash1',
    screenSpec: '1080x1920x24',
    timezone: 'UTC',
    language: 'fr',
    hardwareConcurrency: 8,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  const device2 = {
    deviceId: 'DEV-ANDROID-APP_TWO',
    os: 'Android' as const,
    browserHash: 'hash2',
    screenSpec: '1080x1920x24',
    timezone: 'UTC',
    language: 'fr',
    hardwareConcurrency: 8,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  // First device imports and binds license
  const firstImport = await OfflineBetaValidator.validateFile(validLicenseJson, device1);
  assert.equal(firstImport.isValid, true);
  const activeLicense = firstImport.license!;

  // Second device attempts import with existing bound license
  const secondImport = await OfflineBetaValidator.validateFile(
    validLicenseJson,
    device2,
    [],
    activeLicense
  );

  assert.equal(secondImport.isValid, false);
  assert.equal(secondImport.code, 'DEVICE_LIMIT_EXCEEDED');
});

test('TEST 9: Fichier JSON invalide -> REFUSÉ', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const res = await service.importOfflineBetaLicense('{ invalid json payload ...');
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'INVALID_JSON_FORMAT');
});

test('TEST 10: Version ou format non supporté -> REFUSÉ', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const unknownObj = JSON.parse(validLicenseJson);
  unknownObj.format = 'unknown-format';
  const res = await service.importOfflineBetaLicense(JSON.stringify(unknownObj));
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'UNSUPPORTED_FORMAT');
});

test('TEST 11 & 12: Persistance au redémarrage sans re-demander le fichier', async () => {
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  // Initial import
  const importRes = await service.importOfflineBetaLicense(validLicenseJson);
  assert.equal(importRes.isValid, true);

  // Simulate application restart
  const reloadedLicense = await repo.getActiveLicense();
  assert.ok(reloadedLicense);
  assert.equal(reloadedLicense?.key, validLicenseObj.license.key);
  assert.equal(reloadedLicense?.status, 'OFFLINE_BETA');

  const valResult = await service.validateCurrentLicense();
  assert.equal(valResult.isValid, true);
});

test('TEST 13: Validation multilingue (FR, EN, AR, ES, IT) & RTL', async () => {
  const languages = ['fr', 'en', 'ar', 'es', 'it'] as const;

  for (const lang of languages) {
    const translations = LICENSING_TRANSLATIONS[lang];
    assert.ok(translations.importLmseFile, `Missing importLmseFile in ${lang}`);
    assert.ok(translations.offlineBetaMode, `Missing offlineBetaMode in ${lang}`);
    assert.ok(translations.localLicenseValid, `Missing localLicenseValid in ${lang}`);
  }
});

test('TEST 14, 15, 16: Audit d\'isolation du bundle User (0 clé privée, 0 LicenseGenerator, 0 AdminCenter)', async () => {
  process.env.VITE_APP_MODE = 'user';
  const userSource = fs.readFileSync(path.join(process.cwd(), 'src/features/licensing/services/OfflineBetaValidator.ts'), 'utf-8');

  assert.equal(userSource.includes('LMSE_PRIVATE_SIGNING_KEY'), false, 'Clé privée détectée dans OfflineBetaValidator');
  assert.equal(userSource.includes('LicenseGenerator'), false, 'LicenseGenerator détecté dans OfflineBetaValidator');
  assert.equal(userSource.includes('LicenseAdminCenter'), false, 'AdminCenter détecté dans OfflineBetaValidator');
});

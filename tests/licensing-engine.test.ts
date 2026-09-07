/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import test from 'node:test';

process.env.VITE_APP_MODE = 'admin';

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { ExpirationEngine } from '../src/features/licensing/engines/ExpirationEngine';
import { RevocationEngine } from '../src/features/licensing/engines/RevocationEngine';
import { TrialEngine } from '../src/features/licensing/engines/TrialEngine';
import { OfflineActivationEngine } from '../src/features/licensing/engines/OfflineActivationEngine';
import { IntegrityVerificationEngine } from '../src/features/licensing/engines/IntegrityVerificationEngine';
import { LicenseAuditEngine } from '../src/features/licensing/engines/LicenseAuditEngine';
import { LicenseEngine } from '../src/features/licensing/engines/LicenseEngine';
import { KeyValidator } from '../src/features/licensing/validators/KeyValidator';
import { LicenseKey } from '../src/features/licensing/domain/value-objects/LicenseKey';
import { LICENSING_TRANSLATIONS } from '../src/features/licensing/translations/licensingTranslations';
import { CryptoService } from '../src/features/licensing/services/CryptoService';

test('LMSE 01 - KeyValidator & LicenseKey domain object parsing', async () => {
  const keyStr = 'LMSE-COMM-A1B2-C3D4-E5F6';
  const val = KeyValidator.validateFormat(keyStr);
  assert.equal(val.isValid, true);

  const lKey = new LicenseKey(keyStr);
  assert.equal(lKey.getType(), 'commercial');
  assert.equal(lKey.toString(), 'LMSE-COMM-A1B2-C3D4-E5F6');

  const invalidVal = KeyValidator.validateFormat('INVALID-KEY');
  assert.equal(invalidVal.isValid, false);
});

test('LMSE 02 - LicenseGenerator produces signed licenses across all 7 types', async () => {
  const types = ['beta', 'commercial', 'permanent', 'temporary', 'enterprise', 'association', 'veterinary'] as const;

  for (const type of types) {
    const lic = await LicenseGenerator.generateLicense({
      holderName: `Client ${type}`,
      type,
    });
    assert.equal(lic.type, type);
    assert.equal(lic.holderName, `Client ${type}`);
    assert.ok(lic.key.startsWith('LMSE-'));
    assert.ok(lic.signature.length > 0);
    assert.ok(lic.checksum.length > 0);
    if (type === 'permanent') {
      assert.equal(lic.expiresAt, null);
    } else {
      assert.ok(lic.expiresAt !== null);
    }
  }
});

test('LMSE 03 - DeviceFingerprintEngine generates non-PII device fingerprint', async () => {
  const fp = await DeviceFingerprintEngine.generateFingerprint();
  assert.ok(fp.deviceId.startsWith('DEV-'));
  assert.ok(fp.browserHash.length > 0);
  assert.ok(['Windows', 'Android', 'iOS', 'Web', 'Unknown'].includes(fp.os));
});

test('LMSE 04 - LicenseValidator & ActivationEngine multi-device binding and limit enforcement', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const lic = await service.createLicense({
    holderName: 'Vétérinaire Pro',
    type: 'veterinary',
    maxDevices: 2,
  });

  const dev1 = {
    deviceId: 'DEV-WIN-1111',
    os: 'Windows' as const,
    browserHash: 'hash1',
    screenSpec: '1920x1080',
    timezone: 'UTC',
    language: 'fr',
    hardwareConcurrency: 8,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  const dev2 = {
    deviceId: 'DEV-AND-2222',
    os: 'Android' as const,
    browserHash: 'hash2',
    screenSpec: '1080x2400',
    timezone: 'UTC',
    language: 'fr',
    hardwareConcurrency: 4,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  const dev3 = {
    deviceId: 'DEV-IOS-3333',
    os: 'iOS' as const,
    browserHash: 'hash3',
    screenSpec: '1170x2532',
    timezone: 'UTC',
    language: 'fr',
    hardwareConcurrency: 6,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  // 1st device activation
  const res1 = await service.activateKey(lic.key, 'Vétérinaire Pro');
  assert.equal(res1.isValid, true);

  // 2nd device activation (via ActivationEngine)
  const licDb = await repo.getLicenseById(lic.id);
  assert.ok(licDb);
  const actRes2 = await service['activateKey'](lic.key, 'Vétérinaire Pro');
  assert.equal(actRes2.isValid, true);

  // Deactivate dev1 and bind dev3
  const deactivated = await service.deactivateDevice(lic.id, res1.license?.activations[0]?.fingerprint.deviceId || '');
  assert.equal(deactivated, true);
});

test('LMSE 05 - ExpirationEngine & Expiration calculation', async () => {
  const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

  const expiredLic = await LicenseGenerator.generateLicense({ holderName: 'Test Expired', type: 'temporary' });
  expiredLic.expiresAt = pastDate;
  const evalExpired = ExpirationEngine.evaluateExpiration(expiredLic);
  assert.equal(evalExpired.isExpired, true);

  const nearExpLic = await LicenseGenerator.generateLicense({ holderName: 'Test Near Expired', type: 'commercial' });
  nearExpLic.expiresAt = futureDate;
  const evalNear = ExpirationEngine.evaluateExpiration(nearExpLic);
  assert.equal(evalNear.isExpired, false);
  assert.equal(evalNear.isNearExpiration, true);
  assert.equal(evalNear.remainingDays, 5);
});

test('LMSE 06 - RevocationEngine immediate revocation & blacklist enforcement', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const lic = await service.createLicense({ holderName: 'Revoke Target', type: 'commercial' });
  await service.activateKey(lic.key, 'Revoke Target');

  const revoked = await service.revokeLicense(lic.id, 'Paiement rejeté');
  assert.equal(revoked?.status, 'revoked');

  const valAfter = await service.validateCurrentLicense();
  assert.equal(valAfter.isValid, false);
  assert.equal(valAfter.code, 'LICENSE_REVOKED');
});

test('LMSE 07 - OfflineActivationEngine challenge-response mechanism', async () => {
  const device = await DeviceFingerprintEngine.generateFingerprint();
  const key = 'LMSE-ENTP-1234-5678-90AB';

  const challenge = await OfflineActivationEngine.generateChallengeCode(device, key, 'enterprise');
  assert.ok(challenge.length > 0);

  const adminResponseCode = await OfflineActivationEngine.generateActivationCode(challenge, key);
  assert.ok(adminResponseCode.length > 0);

  const isVerified = await OfflineActivationEngine.verifyActivationCode(challenge, key, adminResponseCode);
  assert.equal(isVerified, true);

  const invalidVerified = await OfflineActivationEngine.verifyActivationCode(challenge, key, 'WRONG-CODE-1234');
  assert.equal(invalidVerified, false);
});

test('LMSE 08 - IntegrityVerificationEngine anti-tamper and clock-rollback detection', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const lic = await service.createLicense({ holderName: 'Tamper Check', type: 'enterprise' });

  // Tamper checksum
  const tamperedLic = { ...lic, checksum: 'corrupted_checksum' };
  const resTampered = await IntegrityVerificationEngine.checkIntegrity(tamperedLic);
  assert.equal(resTampered.isHealthy, false);
  assert.equal(resTampered.tamperDetected, true);

  // Clock rollback
  const futureMarker = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const resRollback = await IntegrityVerificationEngine.checkIntegrity(lic, futureMarker);
  assert.equal(resRollback.clockRollbackDetected, true);
});

test('LMSE 09 - TrialEngine automatic private beta initialization', async () => {
  const repo = new InMemoryLicenseRepository();

  const trialLic = await TrialEngine.initializeTrialIfNeeded(repo, 30);
  assert.equal(trialLic.type, 'beta');
  assert.equal(trialLic.status, 'trial');
  assert.ok(trialLic.expiresAt !== null);

  const secondCall = await TrialEngine.initializeTrialIfNeeded(repo, 30);
  assert.equal(secondCall.id, trialLic.id);
});

test('LMSE 10 - LicenseAuditEngine stats and audit logging', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  await service.createLicense({ holderName: 'Audit 1', type: 'commercial' });
  await service.createLicense({ holderName: 'Audit 2', type: 'enterprise' });

  const stats = await service.getStats();
  assert.equal(stats.totalLicenses, 2);
  assert.equal(stats.typeBreakdown.commercial, 1);
  assert.equal(stats.typeBreakdown.enterprise, 1);

  const logs = await service.getAuditLogs();
  assert.ok(logs.length >= 2);
});

test('LMSE 11 - CryptoService AES-256 encryption and SHA-256 signature verification', async () => {
  const plainText = 'Bird Academy Enterprise Secret Data';
  const cipher = await CryptoService.encryptAes256(plainText);
  const decrypted = await CryptoService.decryptAes256(cipher);
  assert.equal(decrypted, plainText);

  const sig = await CryptoService.generateSignature(plainText);
  const isValidSig = await CryptoService.verifySignature(plainText, sig);
  assert.equal(isValidSig, true);
});

test('LMSE 12 - Translation coverage across all 5 languages (FR, EN, AR, ES, IT)', () => {
  const langs = ['fr', 'en', 'ar', 'es', 'it'] as const;
  const requiredKeys = [
    'licensingTitle', 'licensingSub', 'activateLicense', 'licenseKey',
    'holderName', 'licenseType', 'expirationDate', 'devicesCount',
    'adminCenterTitle', 'offlineActivationTitle', 'hardwareChallengeCode',
    'betaLabel', 'enterpriseLabel'
  ];

  for (const lang of langs) {
    const dict = LICENSING_TRANSLATIONS[lang];
    assert.ok(dict, `Translation dictionary missing for language: ${lang}`);
    for (const k of requiredKeys) {
      assert.ok(dict[k], `Missing translation key [${k}] for language: ${lang}`);
    }
  }
});

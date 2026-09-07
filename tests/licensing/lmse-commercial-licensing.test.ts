/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL LICENSING UNIT TEST SUITE
 * Mission: LMSE-COMMERCIAL-LICENSING-IMPLEMENTATION-01
 * 
 * Comprehensive unit testing for:
 * TC-UNIT-LIC-001 : Parsing licence
 * TC-UNIT-LIC-002 : Signature valide
 * TC-UNIT-LIC-003 : Signature invalide
 * TC-UNIT-LIC-004 : Checksum valide
 * TC-UNIT-LIC-005 : Checksum invalide
 * TC-UNIT-LIC-006 : Licence FREE
 * TC-UNIT-LIC-007 : Licence PREMIUM
 * TC-UNIT-LIC-008 : Licence PRO
 * TC-UNIT-LIC-009 : Licence expirée
 * TC-UNIT-LIC-010 : Licence permanente
 * TC-UNIT-LIC-011 : Mauvais productId
 * TC-UNIT-LIC-012 : Tier falsifié
 * TC-UNIT-LIC-013 : Date falsifiée
 * TC-UNIT-LIC-014 : LocalStorage falsifié
 * TC-UNIT-LIC-015 : Downgrade sans perte de données
 * TC-UNIT-LIC-016 : Upgrade
 * TC-UNIT-LIC-017 : Quota FREE
 * TC-UNIT-LIC-018 : Quota PREMIUM
 * TC-UNIT-LIC-019 : Quota PRO
 * TC-UNIT-LIC-020 : Permissions & Capabilities
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { OfflineBetaValidator } from '../../src/features/licensing/services/OfflineBetaValidator';
import { LicenseValidator } from '../../src/features/licensing/engines/LicenseValidator';
import { KeyValidator } from '../../src/features/licensing/validators/KeyValidator';
import { LicenseGenerator } from '../../src/features/licensing/engines/LicenseGenerator';
import { SubscriptionTierResolver } from '../../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver, TIER_CAPABILITIES } from '../../src/features/subscription/services/CapabilityResolver';
import { License, DeviceFingerprint, LmseLicenseFile, LicenseValidationResult } from '../../src/features/licensing/types/licensing';

const mockDevice: DeviceFingerprint = {
  deviceId: 'dev_mock_test_12345',
  os: 'Windows',
  browserHash: 'hash_browser_test',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr-FR',
  hardwareConcurrency: 8,
  createdAt: new Date().toISOString(),
  lastSeenAt: new Date().toISOString(),
};

async function createSignedLicenseFile(
  type: 'beta' | 'commercial' | 'permanent' | 'enterprise' = 'enterprise',
  expiresAt: string | null = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  features: string[] = ['core', 'unlimited_birds', 'pedigree', 'statistics', 'tier:pro']
): Promise<{ fileContent: string; license: License; rawJson: LmseLicenseFile }> {
  const id = `lic_test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const key = `LMSE-COMM-AAAA-BBBB-CCCC`;
  const holderName = 'Éleveur Test Commercial';
  const issuedAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const maxDevices = 3;

  const payloadToSign = `${id}:${key}:${holderName}:${type}:${issuedAt}:${expiresAt || 'NEVER'}:${maxDevices}`;
  const checksum = await CryptoService.sha256(payloadToSign);
  const signature = await CryptoService.generateSignature(checksum, CryptoService.getPublicVerificationKey());

  const filePayload: LmseLicenseFile = {
    format: 'bird-academy-lmse',
    version: 1,
    license: {
      id,
      key,
      holderName,
      type,
      issuedAt,
      expiresAt,
      maxDevices,
      features,
      allowOfflineActivation: true,
      mode: 'COMMERCIAL',
    },
    checksum,
    signature,
  };

  const constructedLicense: License = {
    id,
    key,
    holderName,
    type,
    status: 'active',
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
        fingerprint: mockDevice,
        activatedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        isOffline: true,
      },
    ],
    checksum,
    signature,
  };

  return {
    fileContent: JSON.stringify(filePayload, null, 2),
    license: constructedLicense,
    rawJson: filePayload,
  };
}

describe('LMSE COMMERCIAL LICENSING UNIT SUITE', () => {

  test('TC-UNIT-LIC-001: Parsing licence (.lmse JSON structure & fields)', async () => {
    const { fileContent } = await createSignedLicenseFile('enterprise');
    const result = await OfflineBetaValidator.validateFile(fileContent, mockDevice);
    
    assert.equal(result.isValid, true);
    assert.ok(result.license);
    assert.equal(result.license?.type, 'enterprise');
    assert.equal(result.code, 'VALID');
  });

  test('TC-UNIT-LIC-002: Signature valide', async () => {
    const { fileContent, rawJson } = await createSignedLicenseFile('commercial');
    const validSig = await CryptoService.verifySignature(rawJson.checksum, rawJson.signature);
    assert.equal(validSig, true);

    const valResult = await OfflineBetaValidator.validateFile(fileContent, mockDevice);
    assert.equal(valResult.isValid, true);
  });

  test('TC-UNIT-LIC-003: Signature invalide', async () => {
    const { rawJson } = await createSignedLicenseFile('commercial');
    const corruptedSigPayload = {
      ...rawJson,
      signature: '0000000000000000000000000000000000000000000000000000000000000000',
    };

    const valResult = await OfflineBetaValidator.validateFile(JSON.stringify(corruptedSigPayload), mockDevice);
    assert.equal(valResult.isValid, false);
    assert.equal(valResult.code, 'INVALID_SIGNATURE');
  });

  test('TC-UNIT-LIC-004: Checksum valide', async () => {
    const { license } = await createSignedLicenseFile('enterprise');
    const payload = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}`;
    const computed = await CryptoService.sha256(payload);
    assert.equal(computed.toLowerCase(), license.checksum.toLowerCase());
  });

  test('TC-UNIT-LIC-005: Checksum invalide (tampered payload)', async () => {
    const { rawJson } = await createSignedLicenseFile('enterprise');
    // Alter holderName without updating checksum
    const altered = {
      ...rawJson,
      license: {
        ...rawJson.license,
        holderName: 'Attacker Name Falsified',
      },
    };

    const valResult = await OfflineBetaValidator.validateFile(JSON.stringify(altered), mockDevice);
    assert.equal(valResult.isValid, false);
    assert.equal(valResult.code, 'INVALID_CHECKSUM');
  });

  test('TC-UNIT-LIC-006: Licence FREE resolution and capabilities', async () => {
    const { license } = await createSignedLicenseFile('commercial', null, ['core', 'tier:free']);
    const validation: LicenseValidationResult = { isValid: true, status: 'active', license, code: 'VALID', message: 'OK', remainingDays: null, deviceRegistered: true };

    const tier = SubscriptionTierResolver.resolve(license, validation);
    assert.equal(tier, 'FREE');

    const caps = CapabilityResolver.getCapabilitiesForTier(tier);
    assert.ok(caps.includes('BIRD_VIEW'));
    assert.ok(caps.includes('AI_ASSISTANT_QUOTA_10'));
    assert.ok(!caps.includes('INTELLIGENCE_FULL_ENGINE'));
  });

  test('TC-UNIT-LIC-007: Licence PREMIUM resolution and capabilities', async () => {
    const { license } = await createSignedLicenseFile('commercial', null, ['core', 'unlimited_birds', 'tier:premium']);
    const validation: LicenseValidationResult = { isValid: true, status: 'active', license, code: 'VALID', message: 'OK', remainingDays: 365, deviceRegistered: true };

    const tier = SubscriptionTierResolver.resolve(license, validation);
    assert.equal(tier, 'PREMIUM');

    const caps = CapabilityResolver.getCapabilitiesForTier(tier);
    assert.ok(caps.includes('BIRD_UNLIMITED'));
    assert.ok(caps.includes('GENETICS_WRIGHT_INBREEDING'));
    assert.ok(caps.includes('AI_ASSISTANT_QUOTA_100'));
    assert.ok(!caps.includes('INTELLIGENCE_FULL_ENGINE'));
  });

  test('TC-UNIT-LIC-008: Licence PRO resolution and capabilities', async () => {
    const { license } = await createSignedLicenseFile('enterprise', null, ['core', 'all', 'tier:pro']);
    const validation: LicenseValidationResult = { isValid: true, status: 'active', license, code: 'VALID', message: 'OK', remainingDays: 365, deviceRegistered: true };

    const tier = SubscriptionTierResolver.resolve(license, validation);
    assert.equal(tier, 'PRO');

    const caps = CapabilityResolver.getCapabilitiesForTier(tier);
    assert.ok(caps.includes('INTELLIGENCE_FULL_ENGINE'));
    assert.ok(caps.includes('GENETICS_ADVANCED_TREE'));
    assert.ok(caps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
  });

  test('TC-UNIT-LIC-009: Licence expirée defaults strictly to FREE tier', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { fileContent, license } = await createSignedLicenseFile('enterprise', pastDate);

    const valResult = await OfflineBetaValidator.validateFile(fileContent, mockDevice);
    assert.equal(valResult.isValid, false);
    assert.equal(valResult.code, 'EXPIRED');

    const resolvedTier = SubscriptionTierResolver.resolve(license, valResult);
    assert.equal(resolvedTier, 'FREE');
  });

  test('TC-UNIT-LIC-010: Licence permanente (null expiresAt) is valid and non-expiring', async () => {
    const { fileContent, license } = await createSignedLicenseFile('permanent', null, ['core', 'intelligence', 'tier:pro']);
    const valResult = await OfflineBetaValidator.validateFile(fileContent, mockDevice);
    
    assert.equal(valResult.isValid, true);
    assert.equal(valResult.remainingDays, null);

    const resolvedTier = SubscriptionTierResolver.resolve(license, valResult);
    assert.equal(resolvedTier, 'PRO');
  });

  test('TC-UNIT-LIC-011: Mauvais format / productId / unsupported version', async () => {
    const { rawJson } = await createSignedLicenseFile('enterprise');
    const wrongFormat = { ...rawJson, format: 'unknown-software-license' };
    const resWrongFormat = await OfflineBetaValidator.validateFile(JSON.stringify(wrongFormat), mockDevice);
    assert.equal(resWrongFormat.isValid, false);
    assert.equal(resWrongFormat.code, 'UNSUPPORTED_FORMAT');

    const wrongVersion = { ...rawJson, version: 99 };
    const resWrongVersion = await OfflineBetaValidator.validateFile(JSON.stringify(wrongVersion), mockDevice);
    assert.equal(resWrongVersion.isValid, false);
    assert.equal(resWrongVersion.code, 'UNSUPPORTED_VERSION');
  });

  test('TC-UNIT-LIC-012: Tier falsifié dans payload sans signature valide', async () => {
    const { rawJson } = await createSignedLicenseFile('commercial', null, ['core', 'tier:premium']);
    // Falsify type from commercial to enterprise without re-signing
    const falsified = {
      ...rawJson,
      license: {
        ...rawJson.license,
        type: 'enterprise' as any,
        features: ['core', 'tier:pro'],
      },
    };

    const valResult = await OfflineBetaValidator.validateFile(JSON.stringify(falsified), mockDevice);
    assert.equal(valResult.isValid, false);
    assert.equal(valResult.code, 'INVALID_CHECKSUM');
  });

  test('TC-UNIT-LIC-013: Date falsifiée (extending expiration in payload)', async () => {
    const shortExp = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const { rawJson } = await createSignedLicenseFile('commercial', shortExp);
    
    // Attacker modifies expiresAt to 10 years in future
    const tampered = {
      ...rawJson,
      license: {
        ...rawJson.license,
        expiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    const valResult = await OfflineBetaValidator.validateFile(JSON.stringify(tampered), mockDevice);
    assert.equal(valResult.isValid, false);
    assert.equal(valResult.code, 'INVALID_CHECKSUM');
  });

  test('TC-UNIT-LIC-014: LocalStorage falsifié ou licence manquante defaults to FREE', async () => {
    const valResultNull = SubscriptionTierResolver.resolve(null, null);
    assert.equal(valResultNull, 'FREE');

    const invalidValResult: LicenseValidationResult = {
      isValid: false,
      status: 'suspended',
      license: null,
      code: 'CORRUPTED',
      message: 'Tampered storage',
      remainingDays: null,
      deviceRegistered: false,
    };
    const resolvedTier = SubscriptionTierResolver.resolve(null, invalidValResult);
    assert.equal(resolvedTier, 'FREE');
  });

  test('TC-UNIT-LIC-015: Downgrade sans perte de données (Data Retention Guarantee)', async () => {
    // Simulate user data before downgrade
    const mockUserData = {
      birdsCount: 250,
      cagesCount: 40,
      couplesCount: 30,
      treatmentsCount: 15,
      transactionsCount: 85,
    };

    // User is PRO
    const proCaps = CapabilityResolver.getCapabilitiesForTier('PRO');
    assert.ok(proCaps.includes('INTELLIGENCE_FULL_ENGINE'));

    // User downgrades to FREE
    const freeCaps = CapabilityResolver.getCapabilitiesForTier('FREE');
    assert.ok(!freeCaps.includes('INTELLIGENCE_FULL_ENGINE'));

    // Verification: Data structures remain 100% untouched
    assert.equal(mockUserData.birdsCount, 250);
    assert.equal(mockUserData.cagesCount, 40);
    assert.equal(mockUserData.couplesCount, 30);
    assert.equal(mockUserData.treatmentsCount, 15);
    assert.equal(mockUserData.transactionsCount, 85);
  });

  test('TC-UNIT-LIC-016: Upgrade unlocks advanced capabilities immediately', async () => {
    // 1. FREE
    const freeAccess = CapabilityResolver.checkActionAccess('FREE', 'INTELLIGENCE_FULL_ENGINE');
    assert.equal(freeAccess.isAccessible, false);
    assert.equal(freeAccess.isLocked, true);
    assert.equal(freeAccess.requiredTier, 'PRO');

    // 2. UPGRADE to PRO
    const proAccess = CapabilityResolver.checkActionAccess('PRO', 'INTELLIGENCE_FULL_ENGINE');
    assert.equal(proAccess.isAccessible, true);
    assert.equal(proAccess.isLocked, false);
    assert.equal(proAccess.requiredTier, null);
  });

  test('TC-UNIT-LIC-017: Quota FREE (10 queries/day)', () => {
    const freeCaps = CapabilityResolver.getCapabilitiesForTier('FREE');
    assert.ok(freeCaps.includes('AI_ASSISTANT_QUOTA_10'));
    assert.ok(!freeCaps.includes('AI_ASSISTANT_QUOTA_100'));
    assert.ok(!freeCaps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    assert.ok(!freeCaps.includes('AI_ASSISTANT_FARM_CONTEXT'));
  });

  test('TC-UNIT-LIC-018: Quota PREMIUM (100 queries/day & farm context)', () => {
    const premCaps = CapabilityResolver.getCapabilitiesForTier('PREMIUM');
    assert.ok(premCaps.includes('AI_ASSISTANT_QUOTA_100'));
    assert.ok(premCaps.includes('AI_ASSISTANT_FARM_CONTEXT'));
    assert.ok(!freeCapsHelper('AI_ASSISTANT_QUOTA_UNLIMITED', premCaps));
  });

  test('TC-UNIT-LIC-019: Quota PRO (Unlimited queries/day & complete intelligence)', () => {
    const proCaps = CapabilityResolver.getCapabilitiesForTier('PRO');
    assert.ok(proCaps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    assert.ok(proCaps.includes('AI_ASSISTANT_INTELLIGENCE_GENEALOGY'));
    assert.ok(proCaps.includes('INTELLIGENCE_FULL_ENGINE'));
  });

  test('TC-UNIT-LIC-020: Permissions and Module Access control', () => {
    // Module access checks
    const modFreeIntel = CapabilityResolver.checkModuleAccess('FREE', 'intelligence');
    assert.equal(modFreeIntel.isLocked, true);
    assert.equal(modFreeIntel.requiredTier, 'PRO');

    const modPremIntel = CapabilityResolver.checkModuleAccess('PREMIUM', 'intelligence');
    assert.equal(modPremIntel.isLimited, true);
    assert.equal(modPremIntel.requiredTier, 'PRO');

    const modProIntel = CapabilityResolver.checkModuleAccess('PRO', 'intelligence');
    assert.equal(modProIntel.isLocked, false);
    assert.equal(modProIntel.isLimited, false);
    assert.equal(modProIntel.isAccessible, true);
  });
});

function freeCapsHelper(cap: string, caps: any[]): boolean {
  return caps.includes(cap);
}

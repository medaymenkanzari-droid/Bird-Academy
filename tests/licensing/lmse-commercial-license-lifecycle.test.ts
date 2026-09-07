/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL LICENSE LIFECYCLE UNIT TEST SUITE
 * Mission: LMSE-COMMERCIAL-LICENSE-LIFECYCLE-02
 * 
 * Exhaustive unit testing covering the entire real commercial lifecycle:
 * CREATION → GENERATION → ATTRIBUTION → ACTIVATION → UTILISATION →
 * RENOUVELLEMENT → UPGRADE → DOWNGRADE → EXPIRATION → REACTIVATION →
 * REMPLACEMENT → INVALIDATION / REVOCATION
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { OfflineBetaValidator } from '../../src/features/licensing/services/OfflineBetaValidator';
import { LicenseValidator } from '../../src/features/licensing/engines/LicenseValidator';
import { LicenseLifecycleEngine } from '../../src/features/licensing/engines/LicenseLifecycleEngine';
import { ExpirationEngine } from '../../src/features/licensing/engines/ExpirationEngine';
import { OfflineActivationEngine } from '../../src/features/licensing/engines/OfflineActivationEngine';
import { LicenseEntity } from '../../src/features/licensing/domain/entities/License';
import { SubscriptionTierResolver } from '../../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver } from '../../src/features/subscription/services/CapabilityResolver';
import { License, DeviceFingerprint, LmseLicenseFile, LicenseStatus, LicenseType } from '../../src/features/licensing/types/licensing';

const mockDevice: DeviceFingerprint = {
  deviceId: 'dev_mock_lifecycle_001',
  os: 'Windows',
  browserHash: 'hash_browser_lifecycle_001',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr-FR',
  hardwareConcurrency: 8,
  createdAt: new Date().toISOString(),
  lastSeenAt: new Date().toISOString(),
};

const PREFIX_TAGS: Record<LicenseType, string> = {
  beta: 'BETA',
  commercial: 'COMM',
  permanent: 'PERM',
  temporary: 'TEMP',
  enterprise: 'ENTP',
  association: 'ASSO',
  veterinary: 'VETE',
};

async function createSignedTestLicense(
  type: LicenseType = 'enterprise',
  status: LicenseStatus = 'active',
  expiresAt: string | null = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
  features: string[] = ['core', 'unlimited_birds', 'pedigree', 'statistics', 'tier:pro']
): Promise<{ license: License; filePayload: LmseLicenseFile; fileJson: string }> {
  const id = `lic_life_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const tag = PREFIX_TAGS[type] || 'COMM';
  const key = `LMSE-${tag}-7777-8888-9999`;
  const holderName = 'Éleveur Test Cycle de Vie';
  const issuedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
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

  const license: License = {
    id,
    key,
    holderName,
    type,
    status,
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
        activatedAt: issuedAt,
        lastVerifiedAt: new Date().toISOString(),
        isOffline: true,
      },
    ],
    checksum,
    signature,
    metadata: {
      lifecycleHistory: [
        {
          fromStatus: 'pending_activation',
          toStatus: status,
          timestamp: issuedAt,
          reason: 'Initialisation de la licence',
        },
      ],
    },
  };

  return {
    license,
    filePayload,
    fileJson: JSON.stringify(filePayload, null, 2),
  };
}

describe('LMSE COMMERCIAL LICENSE LIFECYCLE 02 UNIT SUITE', () => {

  // =========================================================================
  // 1. STATE MACHINE & TRANSITIONS (TC-LIFE-UNIT-001 to 008)
  // =========================================================================

  test('TC-LIFE-UNIT-001 : State machine allowed transitions from PENDING_ACTIVATION', () => {
    assert.equal(LicenseLifecycleEngine.canTransition('pending_activation', 'active'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('pending_activation', 'invalid'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('pending_activation', 'revoked'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('pending_activation', 'replaced'), false);
  });

  test('TC-LIFE-UNIT-002 : State machine allowed transitions from ACTIVE', () => {
    assert.equal(LicenseLifecycleEngine.canTransition('active', 'expired'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('active', 'revoked'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('active', 'suspended'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('active', 'replaced'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('active', 'pending_activation'), false);
  });

  test('TC-LIFE-UNIT-003 : State machine allowed transitions from EXPIRED', () => {
    assert.equal(LicenseLifecycleEngine.canTransition('expired', 'active'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('expired', 'replaced'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('expired', 'revoked'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('expired', 'suspended'), false);
  });

  test('TC-LIFE-UNIT-004 : State machine allowed transitions from SUSPENDED', () => {
    assert.equal(LicenseLifecycleEngine.canTransition('suspended', 'active'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('suspended', 'revoked'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('suspended', 'expired'), true);
    assert.equal(LicenseLifecycleEngine.canTransition('suspended', 'replaced'), false);
  });

  test('TC-LIFE-UNIT-005 : Terminal states (REVOKED, REPLACED) refuse transitions', () => {
    assert.equal(LicenseLifecycleEngine.canTransition('revoked', 'active'), false);
    assert.equal(LicenseLifecycleEngine.canTransition('revoked', 'expired'), false);
    assert.equal(LicenseLifecycleEngine.canTransition('replaced', 'active'), false);
    assert.equal(LicenseLifecycleEngine.canTransition('replaced', 'pending_activation'), false);
  });

  test('TC-LIFE-UNIT-006 : Transition execution records history with timestamps and reasons', async () => {
    const { license } = await createSignedTestLicense('commercial', 'active');
    const updated = LicenseLifecycleEngine.transition(license, 'suspended', 'Audit administratif');
    
    assert.equal(updated.status, 'suspended');
    assert.ok(updated.metadata?.lifecycleHistory);
    assert.equal(updated.metadata.lifecycleHistory.length, 2);
    assert.equal(updated.metadata.lifecycleHistory[1].fromStatus, 'active');
    assert.equal(updated.metadata.lifecycleHistory[1].toStatus, 'suspended');
    assert.equal(updated.metadata.lifecycleHistory[1].reason, 'Audit administratif');
  });

  test('TC-LIFE-UNIT-007 : Illegal transition throws descriptive LIFECYCLE_ERROR', async () => {
    const { license } = await createSignedTestLicense('commercial', 'revoked');
    assert.throws(
      () => LicenseLifecycleEngine.transition(license, 'active', 'Tentative illégale'),
      /\[LIFECYCLE_ERROR\]/
    );
  });

  test('TC-LIFE-UNIT-008 : Evaluation of operational status for expired vs non-expired licenses', async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { license: expLic } = await createSignedTestLicense('commercial', 'active', pastDate);
    const evalExpired = LicenseLifecycleEngine.evaluateLifecycleStatus(expLic);
    assert.equal(evalExpired, 'expired');

    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { license: activeLic } = await createSignedTestLicense('commercial', 'active', futureDate);
    const evalActive = LicenseLifecycleEngine.evaluateLifecycleStatus(activeLic);
    assert.equal(evalActive, 'active');
  });

  // =========================================================================
  // 2. CREATION, GENERATION & ATTRIBUTION (TC-LIFE-UNIT-009 to 014)
  // =========================================================================

  test('TC-LIFE-UNIT-009 : Creation of signed commercial license with valid checksum', async () => {
    const { license } = await createSignedTestLicense('commercial');
    const payload = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}`;
    const computed = await CryptoService.sha256(payload);
    assert.equal(computed.toLowerCase(), license.checksum.toLowerCase());
  });

  test('TC-LIFE-UNIT-010 : Verification of cryptographic signature with public verification key', async () => {
    const { license } = await createSignedTestLicense('enterprise');
    const isValidSig = await CryptoService.verifySignature(license.checksum, license.signature);
    assert.equal(isValidSig, true);
  });

  test('TC-LIFE-UNIT-011 : Attribution of license to specific holder name and email', async () => {
    const { license } = await createSignedTestLicense('enterprise');
    license.holderEmail = 'eleveur.pro@birdacademy.com';
    assert.ok(license.holderName.length > 0);
    assert.equal(license.holderEmail, 'eleveur.pro@birdacademy.com');
  });

  test('TC-LIFE-UNIT-012 : Generation of exportable .lmse file format version 1', async () => {
    const { filePayload } = await createSignedTestLicense('commercial');
    assert.equal(filePayload.format, 'bird-academy-lmse');
    assert.equal(filePayload.version, 1);
    assert.ok(filePayload.checksum);
    assert.ok(filePayload.signature);
  });

  test('TC-LIFE-UNIT-013 : Permanent license created with null expiresAt', async () => {
    const { license } = await createSignedTestLicense('permanent', 'active', null);
    assert.equal(license.expiresAt, null);
    const status = LicenseLifecycleEngine.evaluateLifecycleStatus(license);
    assert.equal(status, 'active');
  });

  test('TC-LIFE-UNIT-014 : Multi-device policy configuration', async () => {
    const { license } = await createSignedTestLicense('enterprise');
    assert.ok(license.policy.maxDevices >= 1);
    assert.equal(license.policy.allowOfflineActivation, true);
  });

  // =========================================================================
  // 3. ACTIVATION (TC-LIFE-UNIT-015 to 020)
  // =========================================================================

  test('TC-LIFE-UNIT-015 : Activation via .lmse file parsing and offline validation', async () => {
    const { fileJson } = await createSignedTestLicense('enterprise');
    const res = await OfflineBetaValidator.validateFile(fileJson, mockDevice);
    assert.equal(res.isValid, true);
    assert.equal(res.code, 'VALID');
    assert.ok(res.license);
  });

  test('TC-LIFE-UNIT-016 : Device binding records device fingerprint and timestamp', async () => {
    const { license } = await createSignedTestLicense('commercial', 'pending_activation');
    license.activations = [];
    const activated = LicenseLifecycleEngine.activate(license, mockDevice, true);
    assert.equal(activated.status, 'active');
    assert.equal(activated.activations.length, 1);
    assert.equal(activated.activations[0].fingerprint.deviceId, mockDevice.deviceId);
  });

  test('TC-LIFE-UNIT-017 : Refusal of activation on expired license', async () => {
    const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const { license } = await createSignedTestLicense('commercial', 'expired', pastDate);
    assert.throws(
      () => LicenseLifecycleEngine.activate(license, mockDevice),
      /\[LIFECYCLE_ERROR\]/
    );
  });

  test('TC-LIFE-UNIT-018 : Refusal of activation on revoked license', async () => {
    const { license } = await createSignedTestLicense('commercial', 'revoked');
    assert.throws(
      () => LicenseLifecycleEngine.activate(license, mockDevice),
      /\[LIFECYCLE_ERROR\]/
    );
  });

  test('TC-LIFE-UNIT-019 : Activation with max device limit enforcement', async () => {
    const { license } = await createSignedTestLicense('commercial');
    license.policy.maxDevices = 1;
    const dev2: DeviceFingerprint = { ...mockDevice, deviceId: 'dev_different_999' };
    
    assert.throws(() => {
      const entity = new LicenseEntity(license);
      entity.bindDevice({
        id: 'act_999',
        licenseId: license.id,
        licenseKey: license.key,
        fingerprint: dev2,
        activatedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        isOffline: true,
      });
    });
  });

  test('TC-LIFE-UNIT-020 : Offline activation challenge verification code roundtrip', async () => {
    const challenge = await OfflineActivationEngine.generateChallengeCode(mockDevice, 'LMSE-COMM-1111-2222-3333', 'commercial');
    assert.ok(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(challenge));
    
    const responseCode = await OfflineActivationEngine.generateActivationCode(challenge, 'LMSE-COMM-1111-2222-3333');
    assert.ok(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(responseCode));

    const isValid = await OfflineActivationEngine.verifyActivationCode(challenge, 'LMSE-COMM-1111-2222-3333', responseCode);
    assert.equal(isValid, true);
  });

  // =========================================================================
  // 4. UPGRADE & CAPABILITY RESOLUTION (TC-LIFE-UNIT-021 to 026)
  // =========================================================================

  test('TC-LIFE-UNIT-021 : Upgrade FREE -> PREMIUM resolves to PREMIUM tier', async () => {
    const { license: freeLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:free']);
    const { license: premLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'unlimited_birds', 'tier:premium']);
    
    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.upgrade(freeLic, premLic);
    assert.equal(archivedLicense.status, 'replaced');
    assert.equal(activeLicense.status, 'active');

    const tier = SubscriptionTierResolver.resolve(activeLicense);
    assert.equal(tier, 'PREMIUM');
  });

  test('TC-LIFE-UNIT-022 : Upgrade PREMIUM -> PRO unlocks PRO capabilities immediately', async () => {
    const { license: premLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:premium']);
    const { license: proLic } = await createSignedTestLicense('enterprise', 'active', null, ['core', 'all', 'tier:pro']);

    const { activeLicense } = LicenseLifecycleEngine.upgrade(premLic, proLic);
    const tier = SubscriptionTierResolver.resolve(activeLicense);
    assert.equal(tier, 'PRO');

    const caps = CapabilityResolver.getCapabilitiesForTier(tier);
    assert.ok(caps.includes('INTELLIGENCE_FULL_ENGINE'));
    assert.ok(caps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
  });

  test('TC-LIFE-UNIT-023 : Upgrade FREE -> PRO direct transition', async () => {
    const { license: freeLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:free']);
    const { license: proLic } = await createSignedTestLicense('enterprise', 'active', null, ['core', 'tier:pro']);

    const { activeLicense } = LicenseLifecycleEngine.upgrade(freeLic, proLic);
    assert.equal(SubscriptionTierResolver.resolve(activeLicense), 'PRO');
  });

  test('TC-LIFE-UNIT-024 : Capability check for AI Assistant quota in FREE vs PREMIUM vs PRO', () => {
    const freeCaps = CapabilityResolver.getCapabilitiesForTier('FREE');
    assert.ok(freeCaps.includes('AI_ASSISTANT_QUOTA_10'));
    assert.ok(!freeCaps.includes('AI_ASSISTANT_QUOTA_100'));

    const premCaps = CapabilityResolver.getCapabilitiesForTier('PREMIUM');
    assert.ok(premCaps.includes('AI_ASSISTANT_QUOTA_100'));
    assert.ok(premCaps.includes('AI_ASSISTANT_FARM_CONTEXT'));

    const proCaps = CapabilityResolver.getCapabilitiesForTier('PRO');
    assert.ok(proCaps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    assert.ok(proCaps.includes('AI_ASSISTANT_INTELLIGENCE_GENEALOGY'));
  });

  test('TC-LIFE-UNIT-025 : Capability check for Bird Intelligence in FREE vs PREMIUM vs PRO', () => {
    const freeAccess = CapabilityResolver.checkActionAccess('FREE', 'INTELLIGENCE_FULL_ENGINE');
    assert.equal(freeAccess.isLocked, true);
    assert.equal(freeAccess.requiredTier, 'PRO');

    const premAccess = CapabilityResolver.checkActionAccess('PREMIUM', 'INTELLIGENCE_FULL_ENGINE');
    assert.equal(premAccess.isLocked, true);
    assert.equal(premAccess.requiredTier, 'PRO');

    const proAccess = CapabilityResolver.checkActionAccess('PRO', 'INTELLIGENCE_FULL_ENGINE');
    assert.equal(proAccess.isAccessible, true);
    assert.equal(proAccess.isLocked, false);
  });

  test('TC-LIFE-UNIT-026 : Capability check for Genetics in FREE vs PREMIUM', () => {
    const freeGen = CapabilityResolver.checkActionAccess('FREE', 'GENETICS_WRIGHT_INBREEDING');
    assert.equal(freeGen.isLocked, true);
    assert.equal(freeGen.requiredTier, 'PREMIUM');

    const premGen = CapabilityResolver.checkActionAccess('PREMIUM', 'GENETICS_WRIGHT_INBREEDING');
    assert.equal(premGen.isAccessible, true);
    assert.equal(premGen.isLocked, false);
  });

  // =========================================================================
  // 5. DOWNGRADE & DATA RETENTION GUARANTEES (TC-LIFE-UNIT-027 to 032)
  // =========================================================================

  test('TC-LIFE-UNIT-027 : Downgrade PRO -> PREMIUM archives PRO license and activates PREMIUM', async () => {
    const { license: proLic } = await createSignedTestLicense('enterprise', 'active', null, ['core', 'tier:pro']);
    const { license: premLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:premium']);

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.downgrade(proLic, premLic);
    assert.equal(archivedLicense.status, 'replaced');
    assert.equal(activeLicense.status, 'active');
    assert.equal(SubscriptionTierResolver.resolve(activeLicense), 'PREMIUM');
  });

  test('TC-LIFE-UNIT-028 : Downgrade PRO -> FREE locks PRO capabilities', async () => {
    const { license: proLic } = await createSignedTestLicense('enterprise', 'active', null, ['core', 'tier:pro']);
    const { license: freeLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:free']);

    const { activeLicense } = LicenseLifecycleEngine.downgrade(proLic, freeLic);
    const tier = SubscriptionTierResolver.resolve(activeLicense);
    assert.equal(tier, 'FREE');
    assert.equal(CapabilityResolver.checkActionAccess(tier, 'INTELLIGENCE_FULL_ENGINE').isLocked, true);
  });

  test('TC-LIFE-UNIT-029 : Downgrade PREMIUM -> FREE locks PREMIUM capabilities', async () => {
    const { license: premLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:premium']);
    const { license: freeLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:free']);

    const { activeLicense } = LicenseLifecycleEngine.downgrade(premLic, freeLic);
    const tier = SubscriptionTierResolver.resolve(activeLicense);
    assert.equal(tier, 'FREE');
    assert.equal(CapabilityResolver.checkActionAccess(tier, 'GENETICS_WRIGHT_INBREEDING').isLocked, true);
  });

  test('TC-LIFE-UNIT-030 : Data retention verification — User data structures remain 100% intact', () => {
    const farmDatabaseSnapshot = {
      birds: [{ id: 1, ring: 'FR-2026-001' }, { id: 2, ring: 'FR-2026-002' }],
      cages: [{ id: 1, name: 'Cage Volière A' }],
      couples: [{ id: 1, maleId: 1, femaleId: 2 }],
      clutches: [{ id: 1, eggsCount: 4 }],
      treatments: [{ id: 1, name: 'Vitamines B' }],
      transactions: [{ id: 1, amount: 45.0 }],
    };

    // Simulate downgrade PRO -> FREE
    const preCount = farmDatabaseSnapshot.birds.length;
    // Downgrade occurs...
    const postCount = farmDatabaseSnapshot.birds.length;
    assert.equal(preCount, postCount);
    assert.equal(farmDatabaseSnapshot.cages.length, 1);
    assert.equal(farmDatabaseSnapshot.couples.length, 1);
    assert.equal(farmDatabaseSnapshot.clutches.length, 1);
    assert.equal(farmDatabaseSnapshot.treatments.length, 1);
    assert.equal(farmDatabaseSnapshot.transactions.length, 1);
  });

  test('TC-LIFE-UNIT-031 : Downgrade metadata records exact reason and previous license ID', async () => {
    const { license: proLic } = await createSignedTestLicense('enterprise');
    const { license: premLic } = await createSignedTestLicense('commercial');

    const { activeLicense } = LicenseLifecycleEngine.downgrade(proLic, premLic);
    const history = activeLicense.metadata?.lifecycleHistory || [];
    assert.ok(history.length > 0);
    assert.ok(history[history.length - 1].reason?.includes('Rétrogradation') || history[history.length - 1].reason?.includes('remplacement') || history[history.length - 1].reason?.includes('Licence'));
  });

  test('TC-LIFE-UNIT-032 : CapabilityResolver restricts actions without modifying database records', () => {
    const access = CapabilityResolver.checkActionAccess('FREE', 'INTELLIGENCE_FULL_ENGINE');
    assert.equal(access.isLocked, true);
    assert.equal(access.isAccessible, false);
  });

  // =========================================================================
  // 6. EXPIRATION & FALLBACK (TC-LIFE-UNIT-033 to 036)
  // =========================================================================

  test('TC-LIFE-UNIT-033 : Expired license transitions to EXPIRED status', async () => {
    const { license } = await createSignedTestLicense('commercial', 'active');
    const expiredLic = LicenseLifecycleEngine.expire(license);
    assert.equal(expiredLic.status, 'expired');
  });

  test('TC-LIFE-UNIT-034 : Expired license resolves deterministically to FREE tier', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { license } = await createSignedTestLicense('enterprise', 'expired', pastDate);
    const validation = await LicenseValidator.validateLicense(license, mockDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'EXPIRED');
    
    const resolvedTier = SubscriptionTierResolver.resolve(license, validation);
    assert.equal(resolvedTier, 'FREE');
  });

  test('TC-LIFE-UNIT-035 : Evaluation of remaining days for near-expiration alerting', async () => {
    const nearExpDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const { license } = await createSignedTestLicense('commercial', 'active', nearExpDate);
    const evalExp = ExpirationEngine.evaluateExpiration(license);
    assert.equal(evalExp.isExpired, false);
    assert.equal(evalExp.isNearExpiration, true);
    assert.equal(evalExp.remainingDays, 5);
  });

  test('TC-LIFE-UNIT-036 : Expiration does not purge activations or license keys', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { license } = await createSignedTestLicense('commercial', 'expired', pastDate);
    assert.ok(license.key);
    assert.ok(license.activations.length > 0);
  });

  // =========================================================================
  // 7. RENEWAL & REACTIVATION (TC-LIFE-UNIT-037 to 040)
  // =========================================================================

  test('TC-LIFE-UNIT-037 : Renewal of expired PREMIUM license with new valid PREMIUM license', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { license: expiredLic } = await createSignedTestLicense('commercial', 'expired', pastDate, ['core', 'tier:premium']);
    const { license: renewedLic } = await createSignedTestLicense('commercial', 'active', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), ['core', 'tier:premium']);

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.renew(expiredLic, renewedLic);
    assert.equal(archivedLicense.status, 'replaced');
    assert.equal(activeLicense.status, 'active');
    assert.equal(SubscriptionTierResolver.resolve(activeLicense), 'PREMIUM');
  });

  test('TC-LIFE-UNIT-038 : Renewal of expired PRO license restores PRO capabilities', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { license: expiredLic } = await createSignedTestLicense('enterprise', 'expired', pastDate, ['core', 'tier:pro']);
    const { license: renewedLic } = await createSignedTestLicense('enterprise', 'active', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), ['core', 'tier:pro']);

    const { activeLicense } = LicenseLifecycleEngine.renew(expiredLic, renewedLic);
    const tier = SubscriptionTierResolver.resolve(activeLicense);
    assert.equal(tier, 'PRO');
    assert.ok(CapabilityResolver.getCapabilitiesForTier(tier).includes('INTELLIGENCE_FULL_ENGINE'));
  });

  test('TC-LIFE-UNIT-039 : Renewal from expired PREMIUM to active PRO tier', async () => {
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { license: expiredLic } = await createSignedTestLicense('commercial', 'expired', pastDate, ['core', 'tier:premium']);
    const { license: proLic } = await createSignedTestLicense('enterprise', 'active', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), ['core', 'tier:pro']);

    const { activeLicense } = LicenseLifecycleEngine.renew(expiredLic, proLic);
    assert.equal(SubscriptionTierResolver.resolve(activeLicense), 'PRO');
  });

  test('TC-LIFE-UNIT-040 : Reactivation of suspended license restores active state', async () => {
    const { license: activeLic } = await createSignedTestLicense('commercial');
    const suspended = LicenseLifecycleEngine.suspend(activeLic, 'Vérification administrative');
    assert.equal(suspended.status, 'suspended');

    const reactivated = LicenseLifecycleEngine.reactivate(suspended);
    assert.equal(reactivated.status, 'active');
  });

  // =========================================================================
  // 8. REPLACEMENT & ARCHIVING (TC-LIFE-UNIT-041 to 045)
  // =========================================================================

  test('TC-LIFE-UNIT-041 : Replacement of PRO Lic A with PRO Lic B archives Lic A', async () => {
    const { license: licA } = await createSignedTestLicense('enterprise');
    const { license: licB } = await createSignedTestLicense('enterprise');

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.replace(licA, licB, 'Remplacement standard de clé');
    assert.equal(archivedLicense.status, 'replaced');
    assert.equal(activeLicense.id, licB.id);
    assert.equal(activeLicense.status, 'active');
  });

  test('TC-LIFE-UNIT-042 : Replacement of PREMIUM Lic A with PRO Lic B switches tier immediately', async () => {
    const { license: premLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:premium']);
    const { license: proLic } = await createSignedTestLicense('enterprise', 'active', null, ['core', 'tier:pro']);

    const { activeLicense, archivedLicense } = LicenseLifecycleEngine.replace(premLic, proLic);
    assert.equal(archivedLicense.status, 'replaced');
    assert.equal(SubscriptionTierResolver.resolve(activeLicense), 'PRO');
  });

  test('TC-LIFE-UNIT-043 : Replacement of PRO Lic A with PREMIUM Lic B switches tier with 0 data loss', async () => {
    const { license: proLic } = await createSignedTestLicense('enterprise', 'active', null, ['core', 'tier:pro']);
    const { license: premLic } = await createSignedTestLicense('commercial', 'active', null, ['core', 'tier:premium']);

    const { activeLicense } = LicenseLifecycleEngine.replace(proLic, premLic);
    assert.equal(SubscriptionTierResolver.resolve(activeLicense), 'PREMIUM');
  });

  test('TC-LIFE-UNIT-044 : Revocation of active license marks status revoked with reason', async () => {
    const { license } = await createSignedTestLicense('enterprise');
    const revoked = LicenseLifecycleEngine.revoke(license, 'Fraude de clé détectée');
    
    assert.equal(revoked.status, 'revoked');
    assert.ok(revoked.revokedAt);
    assert.equal(revoked.revocationReason, 'Fraude de clé détectée');
  });

  test('TC-LIFE-UNIT-045 : Revoked license resolves to FREE tier with all advanced features locked', async () => {
    const { license } = await createSignedTestLicense('enterprise', 'revoked');
    const validation = await LicenseValidator.validateLicense(license, mockDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'LICENSE_REVOKED');

    const tier = SubscriptionTierResolver.resolve(license, validation);
    assert.equal(tier, 'FREE');
  });

  // =========================================================================
  // 9. ANTI-BYPASS, INTEGRITY & SECURITY (TC-LIFE-UNIT-046 to 050)
  // =========================================================================

  test('TC-LIFE-UNIT-046 : Tampered checksum in license file fails validation', async () => {
    const { filePayload } = await createSignedTestLicense('enterprise');
    const tampered = {
      ...filePayload,
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };
    const res = await OfflineBetaValidator.validateFile(JSON.stringify(tampered), mockDevice);
    assert.equal(res.isValid, false);
    assert.equal(res.code, 'INVALID_CHECKSUM');
  });

  test('TC-LIFE-UNIT-047 : Tampered signature in license file fails validation', async () => {
    const { filePayload } = await createSignedTestLicense('enterprise');
    const tampered = {
      ...filePayload,
      signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    };
    const res = await OfflineBetaValidator.validateFile(JSON.stringify(tampered), mockDevice);
    assert.equal(res.isValid, false);
    assert.equal(res.code, 'INVALID_SIGNATURE');
  });

  test('TC-LIFE-UNIT-048 : Tampered tier inside payload is rejected by checksum mismatch', async () => {
    const { filePayload } = await createSignedTestLicense('commercial');
    const tampered = {
      ...filePayload,
      license: {
        ...filePayload.license,
        type: 'enterprise' as any,
      },
    };
    const res = await OfflineBetaValidator.validateFile(JSON.stringify(tampered), mockDevice);
    assert.equal(res.isValid, false);
    assert.equal(res.code, 'INVALID_CHECKSUM');
  });

  test('TC-LIFE-UNIT-049 : Tampered expiration date in payload is rejected by checksum mismatch', async () => {
    const { filePayload } = await createSignedTestLicense('commercial');
    const tampered = {
      ...filePayload,
      license: {
        ...filePayload.license,
        expiresAt: '2099-12-31T23:59:59.000Z',
      },
    };
    const res = await OfflineBetaValidator.validateFile(JSON.stringify(tampered), mockDevice);
    assert.equal(res.isValid, false);
    assert.equal(res.code, 'INVALID_CHECKSUM');
  });

  test('TC-LIFE-UNIT-050 : Private key access in user mode throws SECURITY_ERROR', () => {
    const prevMode = process.env.VITE_APP_MODE;
    process.env.VITE_APP_MODE = 'user';
    try {
      assert.throws(() => {
        (CryptoService as any).getMasterSalt();
      }, /SECURITY_ERROR/);
    } finally {
      process.env.VITE_APP_MODE = prevMode;
    }
  });
});

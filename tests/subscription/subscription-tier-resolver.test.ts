/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION & CAPABILITY UNIT SUITE
 * Tests deterministic tier resolution, capability maps, and license status transitions.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SubscriptionTierResolver } from '../../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver, TIER_CAPABILITIES } from '../../src/features/subscription/services/CapabilityResolver';
import { License, LicenseValidationResult } from '../../src/features/licensing/types/licensing';

describe('SUBSCRIPTION TIER & CAPABILITY RESOLVER UNIT TESTS', () => {

  test('TC-UNIT-01: Null license resolves to FREE tier', () => {
    const tier = SubscriptionTierResolver.resolve(null);
    assert.equal(tier, 'FREE');
  });

  test('TC-UNIT-02: Invalid validation result defaults to FREE tier', () => {
    const fakeLicense: Partial<License> = {
      id: 'lic_123',
      type: 'commercial',
      status: 'expired',
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: [] }
    };
    const validation: Partial<LicenseValidationResult> = {
      isValid: false,
      status: 'expired',
      code: 'EXPIRED'
    };
    const tier = SubscriptionTierResolver.resolve(fakeLicense as License, validation as LicenseValidationResult);
    assert.equal(tier, 'FREE');
  });

  test('TC-UNIT-03: Commercial license resolves to PREMIUM tier', () => {
    const license: Partial<License> = {
      id: 'lic_comm',
      type: 'commercial',
      status: 'active',
      policy: { maxDevices: 3, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'unlimited_birds'] }
    };
    const validation: Partial<LicenseValidationResult> = {
      isValid: true,
      status: 'active',
      code: 'VALID'
    };
    const tier = SubscriptionTierResolver.resolve(license as License, validation as LicenseValidationResult);
    assert.equal(tier, 'PREMIUM');
  });

  test('TC-UNIT-04: Enterprise & Beta licenses resolve to PRO tier', () => {
    const enterpriseLicense: Partial<License> = {
      id: 'lic_ent',
      type: 'enterprise',
      status: 'active',
      policy: { maxDevices: 10, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'pedigree', 'statistics'] }
    };
    const betaLicense: Partial<License> = {
      id: 'lic_beta',
      type: 'beta',
      status: 'active',
      policy: { maxDevices: 2, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'beta_access'] }
    };
    const validation: Partial<LicenseValidationResult> = {
      isValid: true,
      status: 'active',
      code: 'VALID'
    };

    assert.equal(SubscriptionTierResolver.resolve(enterpriseLicense as License, validation as LicenseValidationResult), 'PRO');
    assert.equal(SubscriptionTierResolver.resolve(betaLicense as License, validation as LicenseValidationResult), 'PRO');
  });

  test('TC-UNIT-05: Explicit tier tag in policy features takes precedence', () => {
    const proFeatureLicense: Partial<License> = {
      id: 'lic_custom_pro',
      type: 'commercial',
      status: 'active',
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'tier:pro'] }
    };
    const freeFeatureLicense: Partial<License> = {
      id: 'lic_custom_free',
      type: 'enterprise',
      status: 'active',
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: true, features: ['tier:free'] }
    };
    const validation: Partial<LicenseValidationResult> = { isValid: true, status: 'active', code: 'VALID' };

    assert.equal(SubscriptionTierResolver.resolve(proFeatureLicense as License, validation as LicenseValidationResult), 'PRO');
    assert.equal(SubscriptionTierResolver.resolve(freeFeatureLicense as License, validation as LicenseValidationResult), 'FREE');
  });

  test('TC-UNIT-06: FREE tier capabilities include basic breeding, biological reference and 10 queries/day', () => {
    const freeCaps = CapabilityResolver.getCapabilitiesForTier('FREE');
    assert.ok(freeCaps.includes('BIRD_VIEW'));
    assert.ok(freeCaps.includes('BIRD_CREATE_EDIT'));
    assert.ok(freeCaps.includes('HABITAT_VIEW'));
    assert.ok(freeCaps.includes('BREEDING_VIEW'));
    assert.ok(freeCaps.includes('BIO_REFERENCE_ACCESS'));
    assert.ok(freeCaps.includes('AI_ASSISTANT_GENERAL_BIO'));
    assert.ok(freeCaps.includes('AI_ASSISTANT_QUOTA_10'));

    // Should NOT have advanced PRO features
    assert.ok(!freeCaps.includes('INTELLIGENCE_FULL_ENGINE'));
    assert.ok(!freeCaps.includes('BREEDING_PREDICTIVE_ANALYTICS'));
    assert.ok(!freeCaps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    assert.ok(!freeCaps.includes('AI_ASSISTANT_FARM_CONTEXT'));
  });

  test('TC-UNIT-07: PREMIUM tier capabilities include unlimited birds, Wright inbreeding, batch health and farm context', () => {
    const premCaps = CapabilityResolver.getCapabilitiesForTier('PREMIUM');
    assert.ok(premCaps.includes('BIRD_UNLIMITED'));
    assert.ok(premCaps.includes('BREEDING_ADVANCED_TRACKING'));
    assert.ok(premCaps.includes('GENETICS_WRIGHT_INBREEDING'));
    assert.ok(premCaps.includes('HEALTH_BATCH_TREATMENTS'));
    assert.ok(premCaps.includes('AI_ASSISTANT_FARM_CONTEXT'));
    assert.ok(premCaps.includes('AI_ASSISTANT_QUOTA_100'));

    // Should NOT have PRO full intelligence engine
    assert.ok(!premCaps.includes('INTELLIGENCE_FULL_ENGINE'));
    assert.ok(!premCaps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
  });

  test('TC-UNIT-08: PRO tier capabilities contain all capabilities and unlimited quota', () => {
    const proCaps = CapabilityResolver.getCapabilitiesForTier('PRO');
    assert.ok(proCaps.includes('INTELLIGENCE_FULL_ENGINE'));
    assert.ok(proCaps.includes('GENETICS_ADVANCED_TREE'));
    assert.ok(proCaps.includes('BREEDING_PREDICTIVE_ANALYTICS'));
    assert.ok(proCaps.includes('HEALTH_INTELLIGENCE_ALERTS'));
    assert.ok(proCaps.includes('AI_ASSISTANT_INTELLIGENCE_GENEALOGY'));
    assert.ok(proCaps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
  });

  test('TC-UNIT-09: Action access checks return accurate missing capabilities and minimum tier', () => {
    const accessFreeForIntel = CapabilityResolver.checkActionAccess('FREE', 'INTELLIGENCE_FULL_ENGINE');
    assert.equal(accessFreeForIntel.isAccessible, false);
    assert.equal(accessFreeForIntel.isLocked, true);
    assert.equal(accessFreeForIntel.requiredTier, 'PRO');

    const accessFreeForWright = CapabilityResolver.checkActionAccess('FREE', 'GENETICS_WRIGHT_INBREEDING');
    assert.equal(accessFreeForWright.isAccessible, false);
    assert.equal(accessFreeForWright.requiredTier, 'PREMIUM');

    const accessPremiumForWright = CapabilityResolver.checkActionAccess('PREMIUM', 'GENETICS_WRIGHT_INBREEDING');
    assert.equal(accessPremiumForWright.isAccessible, true);
    assert.equal(accessPremiumForWright.isLocked, false);
  });

  test('TC-UNIT-10: Module access checks differentiate between locked and limited access', () => {
    const intelAccessFree = CapabilityResolver.checkModuleAccess('FREE', 'intelligence');
    assert.equal(intelAccessFree.isLocked, true);
    assert.equal(intelAccessFree.requiredTier, 'PRO');

    const intelAccessPro = CapabilityResolver.checkModuleAccess('PRO', 'intelligence');
    assert.equal(intelAccessPro.isAccessible, true);
    assert.equal(intelAccessPro.isLocked, false);
  });
});

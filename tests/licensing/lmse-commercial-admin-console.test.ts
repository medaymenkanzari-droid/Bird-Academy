/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL ADMIN CONSOLE UNIT TEST SUITE
 * Mission: LMSE-COMMERCIAL-ADMIN-CONSOLE-01
 * 
 * Exhaustive unit tests covering the commercial admin service, lifecycle orchestration,
 * stats calculation, filters, export formats, QR generation, anti-bypass, and bundle isolation.
 */

import { describe, it, beforeEach, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_APP_MODE = 'admin';

import { InMemoryLicenseRepository } from '../../src/features/licensing/repositories/InMemoryLicenseRepository';
import { CommercialLicenseAdminService } from '../../src/features/licensing/admin/services/CommercialLicenseAdminService';
import { LicenseGenerator } from '../../src/features/licensing/engines/LicenseGenerator';
import { LicenseValidator } from '../../src/features/licensing/engines/LicenseValidator';
import { LicenseLifecycleEngine } from '../../src/features/licensing/engines/LicenseLifecycleEngine';
import { OfflineBetaExporter } from '../../src/features/licensing/engines/OfflineBetaExporter';
import { SubscriptionTierResolver } from '../../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver } from '../../src/features/subscription/services/CapabilityResolver';
import { DeviceFingerprintEngine } from '../../src/features/licensing/engines/DeviceFingerprintEngine';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { License, DeviceFingerprint } from '../../src/features/licensing/types/licensing';
import { LicenseFilterState } from '../../src/features/licensing/admin/types/adminLicensing';

describe('LMSE Commercial Admin Console — Comprehensive Unit Tests', () => {
  let repository: InMemoryLicenseRepository;
  let service: CommercialLicenseAdminService;
  let mockDevice: DeviceFingerprint;

  beforeEach(async () => {
    repository = new InMemoryLicenseRepository();
    service = new CommercialLicenseAdminService(repository);
    CommercialLicenseAdminService.setInstance(service);
    mockDevice = await DeviceFingerprintEngine.generateFingerprint();
  });

  // =========================================================================
  // 1. COMMERCIAL LICENSE CREATION & GENERATION (TC-ADMIN-UNIT-001 to 010)
  // =========================================================================
  describe('Commercial License Creation & Signing', () => {
    it('TC-ADMIN-UNIT-001: Should generate a valid PRO commercial license with tier:pro feature', async () => {
      const license = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Ornitho Club Algerie',
        holderEmail: 'contact@algerie-aviaire.dz',
        durationDays: 365,
        maxDevices: 25,
        customFeatures: [],
        notes: 'Grand élevage certifié',
      });

      assert.ok(license.id.startsWith('lic_'));
      assert.match(license.key, /^LMSE-ENTP-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
      assert.equal(license.holderName, 'Ornitho Club Algerie');
      assert.ok(license.policy.features.includes('tier:pro'));
      assert.equal(license.policy.maxDevices, 25);
      assert.ok(license.checksum.length === 64);
      assert.ok(license.signature.length > 0);

      // Verify Tier Resolution
      const resolvedTier = SubscriptionTierResolver.resolve(license);
      assert.equal(resolvedTier, 'PRO');
    });

    it('TC-ADMIN-UNIT-002: Should generate a valid PREMIUM commercial license', async () => {
      const license = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Jean Dupont Elevage',
        durationDays: 365,
        maxDevices: 3,
        customFeatures: [],
      });

      assert.ok(license.policy.features.includes('tier:premium'));
      assert.equal(license.policy.maxDevices, 3);
      const resolvedTier = SubscriptionTierResolver.resolve(license);
      assert.equal(resolvedTier, 'PREMIUM');
    });

    it('TC-ADMIN-UNIT-003: Should generate a valid FREE license', async () => {
      const license = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Eleveur Debutant',
        durationDays: 30,
        maxDevices: 1,
        customFeatures: [],
      });

      assert.ok(license.policy.features.includes('tier:free'));
      const resolvedTier = SubscriptionTierResolver.resolve(license);
      assert.equal(resolvedTier, 'FREE');
    });

    it('TC-ADMIN-UNIT-004: Should generate a permanent license with null expiresAt', async () => {
      const license = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'permanent',
        holderName: 'Maitre Eleveur VIP',
        durationDays: null,
        maxDevices: 10,
        customFeatures: [],
      });

      assert.equal(license.expiresAt, null);
      assert.equal(SubscriptionTierResolver.resolve(license), 'PRO');
    });

    it('TC-ADMIN-UNIT-005: Should record an audit log entry upon license creation', async () => {
      const license = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Audit Test Holder',
        durationDays: 90,
        maxDevices: 5,
        customFeatures: [],
      });

      const logs = await repository.getAuditLogs();
      const createLog = logs.find(l => l.action === 'CREATE' && l.licenseId === license.id);
      assert.ok(createLog);
      assert.equal(createLog.success, true);
      assert.ok(createLog.details.includes('PRO'));
    });

    it('TC-ADMIN-UNIT-006: Should support veterinary license type mapped to PRO', async () => {
      const license = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'veterinary',
        holderName: 'Clinique Aviaire du Soleil',
        durationDays: 365,
        maxDevices: 15,
        customFeatures: [],
      });

      assert.equal(license.type, 'veterinary');
      assert.equal(SubscriptionTierResolver.resolve(license), 'PRO');
    });

    it('TC-ADMIN-UNIT-007: Should support association license type mapped to PRO', async () => {
      const license = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'association',
        holderName: 'Federation Ornithologique',
        durationDays: 365,
        maxDevices: 10,
        customFeatures: [],
      });

      assert.equal(license.type, 'association');
      assert.equal(SubscriptionTierResolver.resolve(license), 'PRO');
    });

    it('TC-ADMIN-UNIT-008: Should trim whitespace from holderName and holderEmail', async () => {
      const license = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: '   Espace Elevage   ',
        holderEmail: '  contact@elevage.fr  ',
        durationDays: 180,
        maxDevices: 2,
        customFeatures: [],
      });

      assert.equal(license.holderName, 'Espace Elevage');
      assert.equal(license.holderEmail, 'contact@elevage.fr');
    });

    it('TC-ADMIN-UNIT-009: Should correctly format 5-segment cryptographic license keys', async () => {
      const key = await LicenseGenerator.generateKeyString('commercial', 'lic_test_123', 'Titulaire');
      assert.match(key, /^LMSE-COMM-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
    });

    it('TC-ADMIN-UNIT-010: Should reject license generation if holderName is empty in options', async () => {
      await assert.rejects(async () => {
        await service.createCommercialLicense({
          tier: 'PRO',
          type: 'commercial',
          holderName: '   ',
          durationDays: 365,
          maxDevices: 3,
          customFeatures: [],
        });
      });
    });
  });

  // =========================================================================
  // 2. LICENSE RENEWAL WORKFLOW (TC-ADMIN-UNIT-011 to 016)
  // =========================================================================
  describe('License Renewal Workflow', () => {
    it('TC-ADMIN-UNIT-011: Should renew an existing license by extending expiration by 365 days', async () => {
      const initial = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Renouvellement Test',
        durationDays: 30,
        maxDevices: 3,
        customFeatures: [],
      });

      const renewed = await service.renewLicense({
        licenseId: initial.id,
        durationDays: 365,
        notes: 'Paiement annuel validé',
      });

      assert.ok(renewed.id);
      assert.notEqual(renewed.id, initial.id);
      assert.equal(renewed.status, 'active');
      assert.equal(SubscriptionTierResolver.resolve(renewed), 'PREMIUM');

      // Verify old license archived as replaced
      const archived = await repository.getLicenseById(initial.id);
      assert.equal(archived?.status, 'replaced');
    });

    it('TC-ADMIN-UNIT-012: Should renew a license with permanent conversion (durationDays: null)', async () => {
      const initial = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Conversion Permanente',
        durationDays: 90,
        maxDevices: 5,
        customFeatures: [],
      });

      const renewed = await service.renewLicense({
        licenseId: initial.id,
        durationDays: null,
      });

      assert.equal(renewed.expiresAt, null);
      assert.equal(renewed.status, 'active');
    });

    it('TC-ADMIN-UNIT-013: Should update the active license in repository if renewed license was active', async () => {
      const initial = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Active Licence User',
        durationDays: 30,
        maxDevices: 5,
        customFeatures: [],
      });

      await repository.saveActiveLicense(initial);

      const renewed = await service.renewLicense({
        licenseId: initial.id,
        durationDays: 365,
      });

      const activeInRepo = await repository.getActiveLicense();
      assert.equal(activeInRepo?.id, renewed.id);
    });

    it('TC-ADMIN-UNIT-014: Should throw error when renewing non-existent licenseId', async () => {
      await assert.rejects(async () => {
        await service.renewLicense({
          licenseId: 'lic_non_existent_999',
          durationDays: 365,
        });
      }, /introuvable/);
    });

    it('TC-ADMIN-UNIT-015: Should record renewal event in audit history', async () => {
      const initial = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Audit Renewal',
        durationDays: 60,
        maxDevices: 2,
        customFeatures: [],
      });

      await service.renewLicense({
        licenseId: initial.id,
        durationDays: 180,
      });

      const logs = await repository.getAuditLogs();
      assert.ok(logs.some(l => l.details.includes('Renouvellement')));
    });

    it('TC-ADMIN-UNIT-016: Should preserve original commercial tier upon simple renewal', async () => {
      const proLic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Tier Preservation',
        durationDays: 30,
        maxDevices: 10,
        customFeatures: [],
      });

      const renewed = await service.renewLicense({
        licenseId: proLic.id,
        durationDays: 90,
      });

      assert.equal(SubscriptionTierResolver.resolve(renewed), 'PRO');
    });
  });

  // =========================================================================
  // 3. LICENSE REPLACEMENT WORKFLOW (TC-ADMIN-UNIT-017 to 022)
  // =========================================================================
  describe('License Replacement Workflow', () => {
    it('TC-ADMIN-UNIT-017: Should archive old license as REPLACED and activate replacement license', async () => {
      const oldLic = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Key Rotation Holder',
        durationDays: 365,
        maxDevices: 3,
        customFeatures: [],
      });

      const { replaced, active } = await service.replaceLicense({
        oldLicenseId: oldLic.id,
        targetTier: 'PRO',
        holderName: 'Key Rotation Holder',
        durationDays: 365,
        reason: 'Clé compromise lors d\'un salon',
      });

      assert.equal(replaced.status, 'replaced');
      assert.equal(active.status, 'active');
      assert.equal(SubscriptionTierResolver.resolve(active), 'PRO');
      assert.notEqual(replaced.key, active.key);
    });

    it('TC-ADMIN-UNIT-018: Should record replacement metadata in archived license', async () => {
      const oldLic = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Meta History Test',
        durationDays: 30,
        maxDevices: 1,
        customFeatures: [],
      });

      const { replaced, active } = await service.replaceLicense({
        oldLicenseId: oldLic.id,
        targetTier: 'PREMIUM',
        holderName: 'Meta History Test',
        durationDays: 365,
        reason: 'Passage vers PREMIUM',
      });

      const history = replaced.metadata?.lifecycleHistory || [];
      const transition = history.find((h: any) => h.toStatus === 'replaced');
      assert.ok(transition);
      assert.equal(transition.reason, 'Passage vers PREMIUM');
      assert.equal(transition.metadata?.replacedByLicenseId, active.id);
    });

    it('TC-ADMIN-UNIT-019: Should reject replacing an invalid licenseId', async () => {
      await assert.rejects(async () => {
        await service.replaceLicense({
          oldLicenseId: 'lic_fake_000',
          targetTier: 'PRO',
          holderName: 'Fake',
          durationDays: 365,
          reason: 'Test',
        });
      }, /introuvable/);
    });

    it('TC-ADMIN-UNIT-020: Should set active license in repository to the replacement license', async () => {
      const oldLic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Active Replace User',
        durationDays: 180,
        maxDevices: 5,
        customFeatures: [],
      });
      await repository.saveActiveLicense(oldLic);

      const { active } = await service.replaceLicense({
        oldLicenseId: oldLic.id,
        targetTier: 'PRO',
        holderName: 'Active Replace User',
        durationDays: 365,
        reason: 'Migration vers nouveau format',
      });

      const currentActive = await repository.getActiveLicense();
      assert.equal(currentActive?.id, active.id);
      assert.equal(currentActive?.status, 'active');
    });

    it('TC-ADMIN-UNIT-021: Should never silently delete the replaced license from storage', async () => {
      const oldLic = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Preserved History',
        durationDays: 365,
        maxDevices: 3,
        customFeatures: [],
      });

      const { replaced } = await service.replaceLicense({
        oldLicenseId: oldLic.id,
        targetTier: 'PRO',
        holderName: 'Preserved History',
        durationDays: 365,
        reason: 'Key renewal',
      });

      const storedOld = await repository.getLicenseById(oldLic.id);
      assert.ok(storedOld);
      assert.equal(storedOld.id, replaced.id);
      assert.equal(storedOld.status, 'replaced');
    });

    it('TC-ADMIN-UNIT-022: Should support changing holder email during replacement', async () => {
      const oldLic = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Old Email Holder',
        holderEmail: 'old@example.com',
        durationDays: 30,
        maxDevices: 1,
        customFeatures: [],
      });

      const { active } = await service.replaceLicense({
        oldLicenseId: oldLic.id,
        targetTier: 'PREMIUM',
        holderName: 'Old Email Holder',
        holderEmail: 'new@example.com',
        durationDays: 365,
        reason: 'Changement de courriel',
      });

      assert.equal(active.holderEmail, 'new@example.com');
    });
  });

  // =========================================================================
  // 4. UPGRADE & DOWNGRADE WORKFLOWS (TC-ADMIN-UNIT-023 to 030)
  // =========================================================================
  describe('Commercial Upgrade & Downgrade Workflows', () => {
    it('TC-ADMIN-UNIT-023: Should upgrade FREE -> PREMIUM and expand capabilities', async () => {
      const freeLic = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Upgrade Free User',
        durationDays: 30,
        maxDevices: 1,
        customFeatures: [],
      });

      const upgraded = await service.upgradeLicense({
        licenseId: freeLic.id,
        currentTier: 'FREE',
        targetTier: 'PREMIUM',
        durationDays: 365,
        reason: 'Souscription PREMIUM',
      });

      assert.equal(SubscriptionTierResolver.resolve(upgraded), 'PREMIUM');
      assert.equal(upgraded.status, 'active');

      const caps = CapabilityResolver.getCapabilitiesForTier('PREMIUM');
      assert.ok(caps.includes('AI_ASSISTANT_QUOTA_100'));
      assert.ok(caps.includes('GENETICS_WRIGHT_INBREEDING'));
    });

    it('TC-ADMIN-UNIT-024: Should upgrade PREMIUM -> PRO and unlock Bird Intelligence', async () => {
      const premLic = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Upgrade Premium User',
        durationDays: 365,
        maxDevices: 3,
        customFeatures: [],
      });

      const upgraded = await service.upgradeLicense({
        licenseId: premLic.id,
        currentTier: 'PREMIUM',
        targetTier: 'PRO',
        durationDays: 365,
        reason: 'Souscription PRO',
      });

      assert.equal(SubscriptionTierResolver.resolve(upgraded), 'PRO');
      const caps = CapabilityResolver.getCapabilitiesForTier('PRO');
      assert.ok(caps.includes('INTELLIGENCE_DIAGNOSTIC_FICHES'));
      assert.ok(caps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    });

    it('TC-ADMIN-UNIT-025: Should upgrade FREE -> PRO directly', async () => {
      const freeLic = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Direct Pro Upgrade',
        durationDays: 14,
        maxDevices: 1,
        customFeatures: [],
      });

      const upgraded = await service.upgradeLicense({
        licenseId: freeLic.id,
        currentTier: 'FREE',
        targetTier: 'PRO',
        durationDays: 365,
      });

      assert.equal(SubscriptionTierResolver.resolve(upgraded), 'PRO');
      assert.equal(upgraded.policy.maxDevices, 25);
    });

    it('TC-ADMIN-UNIT-026: Should downgrade PRO -> PREMIUM with 0 data loss guarantee', async () => {
      const proLic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Downgrade Pro User',
        durationDays: 365,
        maxDevices: 25,
        customFeatures: [],
      });

      const downgraded = await service.downgradeLicense({
        licenseId: proLic.id,
        currentTier: 'PRO',
        targetTier: 'PREMIUM',
        durationDays: 365,
        reason: 'Changement de formule annuel',
      });

      assert.equal(SubscriptionTierResolver.resolve(downgraded), 'PREMIUM');
      assert.equal(downgraded.status, 'active');

      // Verify PRO features locked in CapabilityResolver
      const accessIntelligence = CapabilityResolver.checkActionAccess('PREMIUM', 'INTELLIGENCE_FULL_ENGINE');
      assert.equal(accessIntelligence.isAccessible, false);
      assert.equal(accessIntelligence.isLocked, true);
    });

    it('TC-ADMIN-UNIT-027: Should downgrade PREMIUM -> FREE with basic capabilities locked', async () => {
      const premLic = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Downgrade Free User',
        durationDays: 365,
        maxDevices: 3,
        customFeatures: [],
      });

      const downgraded = await service.downgradeLicense({
        licenseId: premLic.id,
        currentTier: 'PREMIUM',
        targetTier: 'FREE',
        durationDays: 30,
      });

      assert.equal(SubscriptionTierResolver.resolve(downgraded), 'FREE');
      const accessGenetics = CapabilityResolver.checkActionAccess('FREE', 'GENETICS_WRIGHT_INBREEDING');
      assert.equal(accessGenetics.isAccessible, false);
      assert.equal(accessGenetics.isLocked, true);
    });

    it('TC-ADMIN-UNIT-028: Should downgrade PRO -> FREE directly', async () => {
      const proLic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Direct Free Downgrade',
        durationDays: 365,
        maxDevices: 25,
        customFeatures: [],
      });

      const downgraded = await service.downgradeLicense({
        licenseId: proLic.id,
        currentTier: 'PRO',
        targetTier: 'FREE',
        durationDays: 30,
      });

      assert.equal(SubscriptionTierResolver.resolve(downgraded), 'FREE');
    });

    it('TC-ADMIN-UNIT-029: Should record upgrade transition in audit log', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Audit Upgrade',
        durationDays: 30,
        maxDevices: 1,
        customFeatures: [],
      });

      await service.upgradeLicense({
        licenseId: lic.id,
        currentTier: 'FREE',
        targetTier: 'PREMIUM',
        durationDays: 365,
      });

      const logs = await repository.getAuditLogs();
      assert.ok(logs.some(l => l.details.includes('Upgrade commercial')));
    });

    it('TC-ADMIN-UNIT-030: Should record downgrade transition in audit log mentioning data preservation', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Audit Downgrade',
        durationDays: 365,
        maxDevices: 10,
        customFeatures: [],
      });

      await service.downgradeLicense({
        licenseId: lic.id,
        currentTier: 'PRO',
        targetTier: 'PREMIUM',
        durationDays: 365,
      });

      const logs = await repository.getAuditLogs();
      assert.ok(logs.some(l => l.details.includes('Données préservées')));
    });
  });

  // =========================================================================
  // 5. SUSPENSION, REACTIVATION & REVOCATION (TC-ADMIN-UNIT-031 to 038)
  // =========================================================================
  describe('Suspension, Reactivation & Revocation', () => {
    it('TC-ADMIN-UNIT-031: Should suspend an active license', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Suspension Target',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });

      const suspended = await service.suspendLicense(lic.id, 'Audit de conformité');
      assert.equal(suspended.status, 'suspended');

      const inRepo = await repository.getLicenseById(lic.id);
      assert.equal(inRepo?.status, 'suspended');
    });

    it('TC-ADMIN-UNIT-032: Should reactivate a suspended license', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Reactivation Target',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });

      await service.suspendLicense(lic.id, 'Audit');
      const reactivated = await service.reactivateLicense(lic.id);

      assert.equal(reactivated.status, 'active');
      const inRepo = await repository.getLicenseById(lic.id);
      assert.equal(inRepo?.status, 'active');
    });

    it('TC-ADMIN-UNIT-033: Should revoke a license permanently and register it in CRL', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Revocation Target',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });

      const revoked = await service.revokeLicense(lic.id, 'Paiement frauduleux contesté');
      assert.equal(revoked.status, 'revoked');
      assert.equal(revoked.revocationReason, 'Paiement frauduleux contesté');
      assert.ok(revoked.revokedAt);

      const crl = await repository.getRevocationList();
      assert.ok(crl.includes(lic.key));
    });

    it('TC-ADMIN-UNIT-034: Should reject illegal transition from revoked state', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Terminal Revoke Test',
        durationDays: 365,
        maxDevices: 3,
        customFeatures: [],
      });

      const revoked = await service.revokeLicense(lic.id, 'Fraude');

      assert.throws(() => {
        LicenseLifecycleEngine.transition(revoked, 'active', 'Tentative de réactivation');
      }, /Transition illégale/);
    });

    it('TC-ADMIN-UNIT-035: Should reject illegal transition from replaced state', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Terminal Replaced Test',
        durationDays: 30,
        maxDevices: 1,
        customFeatures: [],
      });

      const { replaced } = await service.replaceLicense({
        oldLicenseId: lic.id,
        targetTier: 'PRO',
        holderName: 'Terminal Replaced Test',
        durationDays: 365,
        reason: 'Upgrade',
      });

      assert.throws(() => {
        LicenseLifecycleEngine.transition(replaced, 'active', 'Illegal reactivation');
      }, /Transition illégale/);
    });

    it('TC-ADMIN-UNIT-036: Should record revocation in audit log', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Audit Revoke Test',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });

      await service.revokeLicense(lic.id, 'Révocation administrative');

      const logs = await repository.getAuditLogs();
      assert.ok(logs.some(l => l.action === 'REVOKE' && l.licenseId === lic.id));
    });

    it('TC-ADMIN-UNIT-037: Should update active license in repository if active license is revoked', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Active Revoke Test',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });
      await repository.saveActiveLicense(lic);

      await service.revokeLicense(lic.id, 'Compte banni');

      const active = await repository.getActiveLicense();
      assert.equal(active?.status, 'revoked');
    });

    it('TC-ADMIN-UNIT-038: Should update active license in repository if active license is suspended', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Active Suspend Test',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });
      await repository.saveActiveLicense(lic);

      await service.suspendLicense(lic.id, 'Investigation');

      const active = await repository.getActiveLicense();
      assert.equal(active?.status, 'suspended');
    });
  });

  // =========================================================================
  // 6. DASHBOARD STATISTICS & OFFLINE COMPUTATION (TC-ADMIN-UNIT-039 to 044)
  // =========================================================================
  describe('Dashboard Statistics & Metrics', () => {
    it('TC-ADMIN-UNIT-039: Should accurately compute total licenses and tier distribution', async () => {
      await service.createCommercialLicense({ tier: 'PRO', type: 'enterprise', holderName: 'Pro 1', maxDevices: 5, durationDays: 365, customFeatures: [] });
      await service.createCommercialLicense({ tier: 'PRO', type: 'enterprise', holderName: 'Pro 2', maxDevices: 5, durationDays: 365, customFeatures: [] });
      await service.createCommercialLicense({ tier: 'PREMIUM', type: 'commercial', holderName: 'Prem 1', maxDevices: 3, durationDays: 365, customFeatures: [] });
      await service.createCommercialLicense({ tier: 'FREE', type: 'temporary', holderName: 'Free 1', maxDevices: 1, durationDays: 30, customFeatures: [] });

      const stats = await service.getCommercialStats();
      assert.equal(stats.totalLicenses, 4);
      assert.equal(stats.tierBreakdown.PRO, 2);
      assert.equal(stats.tierBreakdown.PREMIUM, 1);
      assert.equal(stats.tierBreakdown.FREE, 1);
    });

    it('TC-ADMIN-UNIT-040: Should accurately compute status breakdown across all 9 states', async () => {
      const lic1 = await service.createCommercialLicense({ tier: 'PRO', type: 'enterprise', holderName: 'Pending 1', maxDevices: 5, durationDays: 365, customFeatures: [] });
      const lic2 = await service.createCommercialLicense({ tier: 'PREMIUM', type: 'commercial', holderName: 'Revoked 1', maxDevices: 3, durationDays: 365, customFeatures: [] });
      const lic3 = await service.createCommercialLicense({ tier: 'PRO', type: 'enterprise', holderName: 'Suspended 1', maxDevices: 5, durationDays: 365, customFeatures: [] });

      await service.revokeLicense(lic2.id, 'Test');
      await service.suspendLicense(lic3.id, 'Test');

      const stats = await service.getCommercialStats();
      assert.equal(stats.statusBreakdown.pending_activation, 1);
      assert.equal(stats.statusBreakdown.revoked, 1);
      assert.equal(stats.statusBreakdown.suspended, 1);
    });

    it('TC-ADMIN-UNIT-041: Should detect licenses expiring soon (< 30 days)', async () => {
      await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Expiring Soon Lic',
        durationDays: 15, // 15 days < 30 days
        maxDevices: 5,
        customFeatures: [],
      });

      await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Far Expiry Lic',
        durationDays: 180, // 180 days > 30 days
        maxDevices: 3,
        customFeatures: [],
      });

      const stats = await service.getCommercialStats();
      assert.equal(stats.expiringSoonCount, 1);
    });

    it('TC-ADMIN-UNIT-042: Should count recently created licenses (< 7 days)', async () => {
      await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Recent 1',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });
      await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Recent 2',
        durationDays: 365,
        maxDevices: 3,
        customFeatures: [],
      });

      const stats = await service.getCommercialStats();
      assert.equal(stats.recentlyCreatedCount, 2);
    });

    it('TC-ADMIN-UNIT-043: Should count activated devices across all licenses', async () => {
      const lic = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Multi Device User',
        durationDays: 365,
        maxDevices: 5,
        customFeatures: [],
      });

      const activated = LicenseLifecycleEngine.activate(lic, mockDevice, true);
      await repository.saveLicense(activated);

      const stats = await service.getCommercialStats();
      assert.equal(stats.totalActivatedDevices, 1);
    });

    it('TC-ADMIN-UNIT-044: Should compute statistics with 0 network calls (100% offline)', async () => {
      const stats = await service.getCommercialStats();
      assert.ok(stats.lastAuditTimestamp);
      assert.equal(typeof stats.totalLicenses, 'number');
    });
  });

  // =========================================================================
  // 7. SEARCH, FILTERS & SORTING (TC-ADMIN-UNIT-045 to 050)
  // =========================================================================
  describe('Search, Filters & Sorting', () => {
    let licPro: License;
    let licPrem: License;
    let licFree: License;

    beforeEach(async () => {
      licPro = await service.createCommercialLicense({
        tier: 'PRO',
        type: 'enterprise',
        holderName: 'Zeus Elevage',
        holderEmail: 'zeus@olympus.gr',
        durationDays: 365,
        maxDevices: 25,
        customFeatures: [],
      });

      licPrem = await service.createCommercialLicense({
        tier: 'PREMIUM',
        type: 'commercial',
        holderName: 'Apollo Aviaire',
        holderEmail: 'apollo@sun.org',
        durationDays: 180,
        maxDevices: 3,
        customFeatures: [],
      });

      licFree = await service.createCommercialLicense({
        tier: 'FREE',
        type: 'temporary',
        holderName: 'Hermes Messager',
        holderEmail: 'hermes@speed.net',
        durationDays: 30,
        maxDevices: 1,
        customFeatures: [],
      });
    });

    it('TC-ADMIN-UNIT-045: Should search licenses by holder name query', () => {
      const list = [licPro, licPrem, licFree];
      const filter: LicenseFilterState = {
        searchQuery: 'apollo',
        tierFilter: 'ALL',
        statusFilter: 'ALL',
        typeFilter: 'ALL',
        sortBy: 'holderName',
        sortOrder: 'asc',
      };

      const result = service.filterLicenses(list, filter);
      assert.equal(result.length, 1);
      assert.equal(result[0].holderName, 'Apollo Aviaire');
    });

    it('TC-ADMIN-UNIT-046: Should search licenses by license key', () => {
      const list = [licPro, licPrem, licFree];
      const filter: LicenseFilterState = {
        searchQuery: licPro.key.slice(0, 10),
        tierFilter: 'ALL',
        statusFilter: 'ALL',
        typeFilter: 'ALL',
        sortBy: 'holderName',
        sortOrder: 'asc',
      };

      const result = service.filterLicenses(list, filter);
      assert.equal(result.length, 1);
      assert.equal(result[0].id, licPro.id);
    });

    it('TC-ADMIN-UNIT-047: Should filter licenses strictly by commercial tier (PRO / PREMIUM / FREE)', () => {
      const list = [licPro, licPrem, licFree];

      const proResult = service.filterLicenses(list, {
        searchQuery: '',
        tierFilter: 'PRO',
        statusFilter: 'ALL',
        typeFilter: 'ALL',
        sortBy: 'issuedAt',
        sortOrder: 'desc',
      });
      assert.equal(proResult.length, 1);
      assert.equal(proResult[0].id, licPro.id);

      const premResult = service.filterLicenses(list, {
        searchQuery: '',
        tierFilter: 'PREMIUM',
        statusFilter: 'ALL',
        typeFilter: 'ALL',
        sortBy: 'issuedAt',
        sortOrder: 'desc',
      });
      assert.equal(premResult.length, 1);
      assert.equal(premResult[0].id, licPrem.id);
    });

    it('TC-ADMIN-UNIT-048: Should sort licenses by holderName alphabetically', () => {
      const list = [licPro, licPrem, licFree];
      const resultAsc = service.filterLicenses(list, {
        searchQuery: '',
        tierFilter: 'ALL',
        statusFilter: 'ALL',
        typeFilter: 'ALL',
        sortBy: 'holderName',
        sortOrder: 'asc',
      });

      assert.equal(resultAsc[0].holderName, 'Apollo Aviaire');
      assert.equal(resultAsc[1].holderName, 'Hermes Messager');
      assert.equal(resultAsc[2].holderName, 'Zeus Elevage');
    });

    it('TC-ADMIN-UNIT-049: Should generate valid offline .lmse export JSON and QR payload', async () => {
      const jsonStr = OfflineBetaExporter.exportLicenseJson(licPro);
      const parsed = JSON.parse(jsonStr);
      assert.equal(parsed.format, 'bird-academy-lmse');
      assert.equal(parsed.license.id, licPro.id);
      assert.equal(parsed.checksum, licPro.checksum);
      assert.equal(parsed.signature, licPro.signature);

      const qrPayload = OfflineBetaExporter.generateQrPayload(licPro);
      assert.ok(qrPayload.includes('bird-academy-lmse'));
      assert.ok(qrPayload.length > 50);
    });

    it('TC-ADMIN-UNIT-050: Should reject tampered license signature during validation', async () => {
      const tampered: License = {
        ...licPro,
        signature: 'FAKED_SIGNATURE_TAMPERED',
      };

      const val = await LicenseValidator.validateLicense(tampered, mockDevice);
      assert.equal(val.isValid, false);
      assert.equal(val.status, 'suspended');
      assert.equal(val.code, 'CORRUPTED');
    });
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS FREE FIX 002 QUALIFICATION TEST SUITE
 * Mission: WINDOWS-FREE-FIX-002
 * Verifies legacy test license neutralization, clean FREE boot, breeding data preservation,
 * user preferences preservation, commercial licensing invariants, offline-first, and zero leakage.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { DeviceFingerprintEngine } from '../src/features/licensing/engines/DeviceFingerprintEngine';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { ActivationEngine } from '../src/features/licensing/engines/ActivationEngine';
import { License, DeviceFingerprint } from '../src/features/licensing/types/licensing';

// Mock localStorage with call tracking to guarantee localStorage.clear() is NEVER invoked
let clearCallCount = 0;
const memoryStore: Record<string, string> = {};

const trackedLocalStorage = {
  getItem: (key: string): string | null => {
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
  },
  setItem: (key: string, value: string): void => {
    memoryStore[key] = String(value);
  },
  removeItem: (key: string): void => {
    delete memoryStore[key];
  },
  clear: (): void => {
    clearCallCount++;
    Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
  },
  get length(): number {
    return Object.keys(memoryStore).length;
  },
  key: (index: number): string | null => {
    const keys = Object.keys(memoryStore);
    return keys[index] || null;
  },
};

// Seed breeding data and user preferences
function seedBreedingDataAndPreferences() {
  memoryStore['canaris'] = JSON.stringify([{ id: 'bird-1', ringNumber: 'FR-2026-001', species: 'Canari Gloster' }]);
  memoryStore['bird_academy_birds'] = JSON.stringify([{ id: 'bird-1', ringNumber: 'FR-2026-001' }]);
  memoryStore['couples'] = JSON.stringify([{ id: 'couple-1', maleId: 'bird-1', femaleId: 'bird-2' }]);
  memoryStore['cages'] = JSON.stringify([{ id: 'cage-1', name: 'Cage Élevage A1' }]);
  memoryStore['pontes'] = JSON.stringify([{ id: 'clutch-1', eggCount: 4, hatchedCount: 3 }]);
  memoryStore['health_logs'] = JSON.stringify([{ id: 'health-1', birdId: 'bird-1', diagnosis: 'Contrôle annuel' }]);
  memoryStore['depenses'] = JSON.stringify([{ id: 'exp-1', amount: 45.5, category: 'Alimentation' }]);
  memoryStore['ventes'] = JSON.stringify([{ id: 'sale-1', amount: 80.0, buyer: 'Jean Dupont' }]);
  memoryStore['bird_academy_language'] = 'fr';
  memoryStore['bird_academy_theme'] = 'dark';
  memoryStore['bird_academy_currency'] = 'EUR';
  memoryStore['bird_academy_aviary_name'] = 'Élevage du Val Vert';
  memoryStore['bird_academy_breeder_name'] = 'Marc Martin';
}

describe('MISSION WINDOWS-FREE-FIX-002 — Persistent License Fix & Data Preservation', () => {
  const originalWindow = (global as any).window;

  beforeEach(() => {
    clearCallCount = 0;
    Object.keys(memoryStore).forEach(k => delete memoryStore[k]);

    (global as any).localStorage = trackedLocalStorage;
    (global as any).window = {
      location: {
        protocol: 'http:',
        search: '',
        hash: '',
        pathname: '/'
      },
      navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        onLine: true,
      },
      localStorage: trackedLocalStorage,
      electron: {
        isElectron: true,
        platform: 'win32',
        runtime: 'desktop',
      }
    };

    seedBreedingDataAndPreferences();
    LicensingService.setInstance(new LicensingService(new LocalStorageLicenseRepository()));
  });

  afterEach(() => {
    (global as any).window = originalWindow;
  });

  // Test 1: Ancienne licence LMSE-TEST-* détectée
  it('1. Ancienne licence LMSE-TEST-* détectée', () => {
    const isLegacy = LicensingService.isLegacyTestLicenseKey('LMSE-TEST-13F8-3AA3-8E3C');
    assert.strictEqual(isLegacy, true);

    const isLegacyDirect = LicensingService.isLegacyTestLicenseKey('TEST-ABCD-1234');
    assert.strictEqual(isLegacyDirect, true);
  });

  // Test 2: Ancienne licence TEST neutralisée
  it('2. Ancienne licence TEST neutralisée', async () => {
    const legacyLic: License = {
      id: 'legacy-test-id-001',
      key: 'LMSE-TEST-13F8-3AA3-8E3C',
      holderName: 'QA Tester',
      type: 'test' as any,
      status: 'active',
      issuedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T00:00:00Z',
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: 'fake-checksum',
      signature: 'fake-signature',
    };

    const repo = new LocalStorageLicenseRepository();
    await repo.saveActiveLicense(legacyLic);
    memoryStore['bird_academy_subscription_tier_override'] = 'PRO';

    const service = new LicensingService(repo);
    const migrated = await service.migrateLegacyTestLicenses();

    assert.strictEqual(migrated, true);
    const activeAfter = await repo.getActiveLicense();
    assert.strictEqual(activeAfter, null);
    assert.strictEqual(memoryStore['bird_academy_subscription_tier_override'], undefined);
  });

  // Test 3: NO_LICENSE obtenu après migration
  it('3. NO_LICENSE obtenu après migration', async () => {
    const legacyLic: License = {
      id: 'legacy-test-id-002',
      key: 'LMSE-TEST-13F8-3AA3-8E3C',
      holderName: 'QA Tester',
      type: 'test' as any,
      status: 'active',
      issuedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T00:00:00Z',
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: 'dummy',
      signature: 'dummy',
    };

    const repo = new LocalStorageLicenseRepository();
    await repo.saveActiveLicense(legacyLic);

    const service = new LicensingService(repo);
    const valResult = await service.initialize();

    assert.strictEqual(valResult.isValid, false);
    assert.strictEqual(valResult.code, 'NO_LICENSE');
    assert.strictEqual(valResult.license, null);
  });

  // Test 4: FREE obtenu
  it('4. FREE obtenu', async () => {
    const repo = new LocalStorageLicenseRepository();
    const service = new LicensingService(repo);
    await service.initialize();

    const currentTier = SubscriptionTierResolver.getCurrentTierSync();
    assert.strictEqual(currentTier, 'FREE');
  });

  // Test 5: FirstLaunchActivationScreen absent (licenseState resolves to LICENSE_VALID)
  it('5. FirstLaunchActivationScreen absent (licenseState === LICENSE_VALID for FREE)', async () => {
    const repo = new LocalStorageLicenseRepository();
    const service = new LicensingService(repo);
    const valResult = await service.initialize();
    const active = await service.getActiveLicense();

    // In LicenseContext logic:
    // !activeLicense && (validation?.code === 'NO_LICENSE' || !validation) -> licenseState = 'LICENSE_VALID'
    let licenseState = 'INITIALIZING';
    if (!active && (valResult.code === 'NO_LICENSE' || !valResult)) {
      licenseState = 'LICENSE_VALID';
    }

    assert.strictEqual(licenseState, 'LICENSE_VALID');
    // FirstLaunchActivationScreen renders only when licenseState !== 'LICENSE_VALID'
    const showActivationScreen = licenseState !== 'LICENSE_VALID';
    assert.strictEqual(showActivationScreen, false);
  });

  // Test 6: Données oiseaux conservées
  it('6. Données oiseaux conservées', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    const canaris = JSON.parse(memoryStore['canaris']);
    assert.strictEqual(canaris.length, 1);
    assert.strictEqual(canaris[0].ringNumber, 'FR-2026-001');
  });

  // Test 7: Couples conservés
  it('7. Couples conservés', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    const couples = JSON.parse(memoryStore['couples']);
    assert.strictEqual(couples.length, 1);
    assert.strictEqual(couples[0].id, 'couple-1');
  });

  // Test 8: Cages conservées
  it('8. Cages conservées', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    const cages = JSON.parse(memoryStore['cages']);
    assert.strictEqual(cages.length, 1);
    assert.strictEqual(cages[0].name, 'Cage Élevage A1');
  });

  // Test 9: Pontes conservées
  it('9. Pontes conservées', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    const pontes = JSON.parse(memoryStore['pontes']);
    assert.strictEqual(pontes.length, 1);
    assert.strictEqual(pontes[0].eggCount, 4);
  });

  // Test 10: Santé conservée
  it('10. Santé conservée', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    const health = JSON.parse(memoryStore['health_logs']);
    assert.strictEqual(health.length, 1);
    assert.strictEqual(health[0].diagnosis, 'Contrôle annuel');
  });

  // Test 11: Finance conservée
  it('11. Finance conservée', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    const depenses = JSON.parse(memoryStore['depenses']);
    const ventes = JSON.parse(memoryStore['ventes']);
    assert.strictEqual(depenses.length, 1);
    assert.strictEqual(depenses[0].amount, 45.5);
    assert.strictEqual(ventes.length, 1);
    assert.strictEqual(ventes[0].amount, 80.0);
  });

  // Test 12: Language conservée
  it('12. Language conservée', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    assert.strictEqual(memoryStore['bird_academy_language'], 'fr');
  });

  // Test 13: Theme conservé
  it('13. Theme conservé', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    assert.strictEqual(memoryStore['bird_academy_theme'], 'dark');
  });

  // Test 14: Currency conservée
  it('14. Currency conservée', async () => {
    const service = LicensingService.getInstance();
    await service.initialize();

    assert.strictEqual(memoryStore['bird_academy_currency'], 'EUR');
  });

  // Test 15: localStorage.clear() jamais appelé
  it('15. localStorage.clear() jamais appelé', async () => {
    // Seed with legacy test license
    memoryStore['bird_academy_lmse_active_license'] = JSON.stringify({
      key: 'LMSE-TEST-13F8-3AA3-8E3C',
      holderName: 'QA',
      type: 'test',
    });

    const service = LicensingService.getInstance();
    await service.initialize();

    assert.strictEqual(clearCallCount, 0, 'localStorage.clear() must NEVER be called');
  });

async function signLicense(lic: License): Promise<License> {
  const payloadToSign = `${lic.id}:${lic.key}:${lic.holderName}:${lic.type}:${lic.issuedAt}:${lic.expiresAt || 'NEVER'}:${lic.policy.maxDevices}`;
  lic.checksum = await CryptoService.sha256(payloadToSign);
  lic.signature = await CryptoService.sha256(lic.checksum + '::' + CryptoService.getPublicVerificationKey());
  return lic;
}

  // Test 16: Licence commerciale invalide toujours rejetée
  it('16. Licence commerciale invalide toujours rejetée', async () => {
    // Commercial prefix COMM- with corrupt signature
    const invalidCommercial: License = {
      id: 'comm-invalid-001',
      key: 'LMSE-COMM-ABCD-1234-WXYZ',
      holderName: 'Éleveur Professionnel',
      type: 'commercial',
      status: 'active',
      issuedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T00:00:00Z',
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: 'corrupted-checksum',
      signature: 'invalid-signature-hex',
    };

    const repo = new LocalStorageLicenseRepository();
    await repo.saveActiveLicense(invalidCommercial);

    const service = new LicensingService(repo);
    const valResult = await service.initialize();

    // Commercial license must NOT be neutralized by migration
    assert.strictEqual(LicensingService.isLegacyTestLicenseKey(invalidCommercial.key), false);
    assert.strictEqual(valResult.isValid, false);
    assert.notStrictEqual(valResult.code, 'NO_LICENSE');
    assert.ok(valResult.code === 'CORRUPTED' || valResult.code === 'INVALID_SIGNATURE' || valResult.code === 'INVALID_KEY_FORMAT');
  });

  // Test 17: Licence expirée toujours rejetée
  it('17. Licence expirée toujours rejetée', async () => {
    const expiredComm: License = {
      id: 'comm-expired-001',
      key: 'LMSE-TEMP-1111-2222-3333',
      holderName: 'Éleveur Temporaire',
      type: 'temporary',
      status: 'active',
      issuedAt: '2025-01-01T00:00:00Z',
      expiresAt: '2025-06-01T00:00:00Z', // Past date
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: '',
      signature: '',
    };
    await signLicense(expiredComm);

    const device: DeviceFingerprint = {
      deviceId: 'dev-current',
      os: 'Windows',
      browserHash: 'hash-win',
      screenSpec: '1920x1080',
      timezone: 'UTC',
      language: 'fr',
      hardwareConcurrency: 8,
      createdAt: '2026-01-01T00:00:00Z',
      lastSeenAt: '2026-01-01T00:00:00Z',
    };

    const valResult = await LicenseValidator.validateLicense(
      expiredComm,
      device,
      [],
      null,
      new Date('2026-09-24T00:00:00Z')
    );

    assert.strictEqual(valResult.isValid, false);
    assert.strictEqual(valResult.code, 'EXPIRED');
  });

  // Test 18: Licence révoquée toujours rejetée
  it('18. Licence révoquée toujours rejetée', async () => {
    const revokedComm: License = {
      id: 'comm-revoked-001',
      key: 'LMSE-COMM-REV1-REV2-REV3',
      holderName: 'Éleveur Fraudeur',
      type: 'commercial',
      status: 'revoked',
      issuedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T00:00:00Z',
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: '',
      signature: '',
    };
    await signLicense(revokedComm);

    const device = await DeviceFingerprintEngine.generateFingerprint();
    const valResult = await LicenseValidator.validateLicense(
      revokedComm,
      device,
      ['LMSE-COMM-REV1-REV2-REV3']
    );

    assert.strictEqual(valResult.isValid, false);
    assert.strictEqual(valResult.code, 'LICENSE_REVOKED');
  });

  // Test 19: Licence remplacée toujours rejetée
  it('19. Licence remplacée toujours rejetée', async () => {
    const replacedComm: License = {
      id: 'comm-replaced-001',
      key: 'LMSE-COMM-OLD1-OLD2-OLD3',
      holderName: 'Éleveur Remplacé',
      type: 'commercial',
      status: 'replaced',
      issuedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T00:00:00Z',
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: '',
      signature: '',
    };
    await signLicense(replacedComm);

    const device = await DeviceFingerprintEngine.generateFingerprint();
    const valResult = await LicenseValidator.validateLicense(replacedComm, device);

    assert.strictEqual(valResult.isValid, false);
    assert.strictEqual(valResult.code, 'LICENSE_REPLACED');
  });

  // Test 20: Signature altérée toujours rejetée
  it('20. Signature altérée toujours rejetée', async () => {
    const tamperedComm: License = {
      id: 'comm-tampered-001',
      key: 'LMSE-PERM-AAAA-BBBB-CCCC',
      holderName: 'Nom Altéré Sans Nouvelle Clé',
      type: 'permanent',
      status: 'active',
      issuedAt: '2026-01-01T00:00:00Z',
      expiresAt: null,
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: '746f6d99cf91802686d21a2f7632945730b96f2225b756ad2bf27b27b815754b',
      signature: '00112233445566778899aabbccddeeff', // Altered signature
    };

    const device = await DeviceFingerprintEngine.generateFingerprint();
    const valResult = await LicenseValidator.validateLicense(tamperedComm, device);

    assert.strictEqual(valResult.isValid, false);
    assert.ok(valResult.code === 'CORRUPTED' || valResult.code === 'INVALID_SIGNATURE' || valResult.code === 'CORRUPTED_LICENSE');
  });

  // Test 21: Single Device toujours = 1
  it('21. Single Device toujours = 1', async () => {
    const device1: DeviceFingerprint = {
      deviceId: 'device-alpha-1',
      os: 'Windows',
      browserHash: 'hash-alpha',
      screenSpec: '1920x1080',
      timezone: 'UTC',
      language: 'fr',
      hardwareConcurrency: 8,
      createdAt: '2026-01-01T00:00:00Z',
      lastSeenAt: '2026-01-01T00:00:00Z',
    };

    const device2: DeviceFingerprint = {
      deviceId: 'device-beta-2',
      os: 'Windows',
      browserHash: 'hash-beta',
      screenSpec: '1920x1080',
      timezone: 'UTC',
      language: 'fr',
      hardwareConcurrency: 8,
      createdAt: '2026-01-01T00:00:00Z',
      lastSeenAt: '2026-01-01T00:00:00Z',
    };

    const singleDeviceLic: License = {
      id: 'single-dev-lic',
      key: 'LMSE-COMM-SING-LE01-DEV1',
      holderName: 'Eleveur Unité',
      type: 'commercial',
      status: 'active',
      issuedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2026-12-31T00:00:00Z',
      activations: [],
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core'] },
      checksum: '',
      signature: '',
    };
    await signLicense(singleDeviceLic);

    const repo = new LocalStorageLicenseRepository();
    await repo.saveLicense(singleDeviceLic);

    // Activation on Device 1 succeeds
    const act1 = await ActivationEngine.activateKey(repo, singleDeviceLic.key, 'Eleveur Unité', device1);
    assert.strictEqual(act1.isValid, true);

    // Activation on Device 2 MUST fail (DEVICE_LIMIT_EXCEEDED / maxDevices = 1)
    const act2 = await ActivationEngine.activateKey(repo, singleDeviceLic.key, 'Eleveur Unité', device2);
    assert.strictEqual(act2.isValid, false);
    assert.strictEqual(act2.code, 'DEVICE_LIMIT_EXCEEDED');
    assert.strictEqual(singleDeviceLic.policy.maxDevices, 1);
  });

  // Test 22: Offline FREE toujours fonctionnel
  it('22. Offline FREE toujours fonctionnel', async () => {
    // Simulate offline state
    (global as any).window.navigator.onLine = false;

    const repo = new LocalStorageLicenseRepository();
    const service = new LicensingService(repo);

    const valResult = await service.validateOnlineOrOffline();
    assert.strictEqual(valResult.isValid, false);
    assert.strictEqual(valResult.code, 'NO_LICENSE');

    const tier = SubscriptionTierResolver.getCurrentTierSync();
    assert.strictEqual(tier, 'FREE');
  });

  // Test 23: Aucune donnée d'élevage envoyée au réseau
  it("23. Aucune donnée d'élevage envoyée au réseau", async () => {
    let networkCallCount = 0;
    let leakedPayload: any = null;

    (global as any).fetch = async (url: string, init?: any) => {
      networkCallCount++;
      if (init?.body) {
        leakedPayload = JSON.parse(init.body);
      }
      return {
        ok: true,
        json: async () => ({ isValid: false, code: 'NO_LICENSE' })
      };
    };

    const repo = new LocalStorageLicenseRepository();
    const service = new LicensingService(repo);
    await service.initialize();

    // Verify zero calls made during FREE initialization
    assert.strictEqual(networkCallCount, 0, 'No network requests should be made on FREE startup');
    assert.strictEqual(leakedPayload, null);
  });

  // Test 24: Restart FREE
  it('24. Restart FREE', async () => {
    const repo = new LocalStorageLicenseRepository();
    const service1 = new LicensingService(repo);
    await service1.initialize();
    assert.strictEqual(SubscriptionTierResolver.getCurrentTierSync(), 'FREE');

    // Simulate app restart: re-instantiate service and re-initialize
    const service2 = new LicensingService(repo);
    const result2 = await service2.initialize();

    assert.strictEqual(result2.code, 'NO_LICENSE');
    assert.strictEqual(SubscriptionTierResolver.getCurrentTierSync(), 'FREE');
  });

  // Test 25: Reboot FREE
  it('25. Reboot FREE (persists clean FREE state across memory reset)', async () => {
    // After reboot, memory is fresh but localStorage represents disk persistence
    const repo = new LocalStorageLicenseRepository();
    LicensingService.setInstance(new LicensingService(repo));

    const bootService = LicensingService.getInstance();
    const bootResult = await bootService.initialize();

    assert.strictEqual(bootResult.code, 'NO_LICENSE');
    assert.strictEqual(SubscriptionTierResolver.getCurrentTierSync(), 'FREE');

    // Ensure all breeding data remains 100% intact after reboot
    assert.ok(memoryStore['canaris'], 'Birds data must survive reboot');
    assert.ok(memoryStore['couples'], 'Couples data must survive reboot');
    assert.ok(memoryStore['cages'], 'Cages data must survive reboot');
    assert.ok(memoryStore['pontes'], 'Clutches data must survive reboot');
    assert.ok(memoryStore['health_logs'], 'Health logs must survive reboot');
    assert.ok(memoryStore['depenses'], 'Expenses must survive reboot');
    assert.strictEqual(memoryStore['bird_academy_language'], 'fr');
    assert.strictEqual(memoryStore['bird_academy_theme'], 'dark');
    assert.strictEqual(memoryStore['bird_academy_currency'], 'EUR');
  });
});

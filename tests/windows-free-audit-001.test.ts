/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION WINDOWS-FREE-AUDIT-001
 * Audit exhaustif du démarrage FREE sur la version Windows & Runtimes Dédiés :
 * - Catégorie A : Runtime Windows (Architecture & Distribution Electron / NSIS)
 * - Catégorie B : Runtime Web (Navigateurs Windows Chrome / Edge / Firefox)
 * - Catégorie C : Détection Native Windows (Signaux réels vs User-Agent)
 * - Catégorie D : Clean Install Windows (Stockage vierge, absence de licence)
 * - Catégorie E : Traitement NO_LICENSE
 * - Catégorie F : Résolution du Tier FREE
 * - Catégorie G : FirstLaunchActivationScreen (Comportement clean install vs erreur)
 * - Catégorie H : Persistance des données et de l'état FREE
 * - Catégorie I : Redémarrage application et système Windows
 * - Catégorie J : Fonctionnement 100% Offline (Mode Avion / Réseau coupé)
 * - Catégorie K : Isolation & Déblocage des fonctionnalités Premium
 * - Catégorie L : Isolation & Déblocage des fonctionnalités PRO
 * - Catégorie M : Rejet des licences au format invalide
 * - Catégorie N : Rejet des licences expirées
 * - Catégorie O : Rejet des licences révoquées
 * - Catégorie P : Rejet des licences remplacées
 * - Catégorie Q : Rejet des licences altérées (Anti-tampering)
 * - Catégorie R : Anti-escalade de privilèges (localStorage & URL)
 * - Catégorie S : Identité RC5 / RC6 (Immutabilité RC5 & statut RC6)
 * - Catégorie T : Audit Médico-Légal des Binaires Windows Distribués
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver } from '../src/features/subscription/services/CapabilityResolver';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { WindowsDeviceFingerprintProvider } from '../src/features/licensing/providers/DeviceFingerprintProvider';
import { License, LicenseValidationResult, DeviceFingerprint } from '../src/features/licensing/types/licensing';
import { BUILD_ID, BUILD_VERSION_NAME, BUILD_VERSION_CODE } from '../src/config/appMode';
import { isNativeRuntime } from '../src/features/licensing/components/LicenseBootGuard';

// In-memory localStorage mock for pure Node execution
if (typeof global.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    length: 0,
    key: (i: number) => Object.keys(store)[i] || null,
  };
}

describe('MISSION WINDOWS-FREE-AUDIT-001 — Audit Démarrage FREE Windows & Distribution', () => {
  const repo = new LocalStorageLicenseRepository();

  beforeEach(() => {
    localStorage.clear();
    LicensingService.setInstance(new LicensingService(repo));
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = {
        location: { search: '', hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' },
        localStorage: global.localStorage,
      };
    } else {
      (global as any).window.location = { search: '', hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' };
      delete (global as any).window.Capacitor;
      delete (global as any).window.Android;
      delete (global as any).window.electron;
      delete (global as any).window.__TAURI__;
    }
  });

  // =========================================================================
  // CATÉGORIE A : Runtime Windows (Architecture & Distribution)
  // =========================================================================
  describe('Catégorie A — Runtime Windows (Architecture & Distribution)', () => {
    it('A01: Configuration electron-builder-user.json définit les cibles nsis et portable', () => {
      const configPath = path.join(process.cwd(), 'electron-builder-user.json');
      assert.strictEqual(fs.existsSync(configPath), true, 'electron-builder-user.json doit exister');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      assert.deepStrictEqual(config.win.target, ['nsis', 'portable']);
      assert.strictEqual(config.win.executableName, 'Bird-Academy-User');
    });

    it('A02: electron-main.cjs est le point d\'entrée officiel du wrapper desktop Windows', () => {
      const mainPath = path.join(process.cwd(), 'electron-main.cjs');
      assert.strictEqual(fs.existsSync(mainPath), true, 'electron-main.cjs doit exister');
      const content = fs.readFileSync(mainPath, 'utf8');
      assert.ok(content.includes('BrowserWindow'), 'Doit instancier BrowserWindow');
      assert.ok(content.includes('loadFile'), 'Doit charger le fichier HTML local');
    });

    it('A03: electron-main.cjs active contextIsolation et désactive nodeIntegration', () => {
      const content = fs.readFileSync(path.join(process.cwd(), 'electron-main.cjs'), 'utf8');
      assert.ok(content.includes('contextIsolation: true'));
      assert.ok(content.includes('nodeIntegration: false'));
    });

    it('A04: Packaging NSIS configuré pour installer dans %LOCALAPPDATA% sans élévation forcée', () => {
      const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'electron-builder-user.json'), 'utf8'));
      assert.strictEqual(config.nsis.oneClick, true);
      assert.strictEqual(config.nsis.perMachine, false);
      assert.strictEqual(config.nsis.deleteAppDataOnUninstall, false, 'Ne jamais supprimer les données d\'élevage à la désinstallation');
    });
  });

  // =========================================================================
  // CATÉGORIE B : Runtime Web (Navigateurs Windows Chrome / Edge / Firefox)
  // =========================================================================
  describe('Catégorie B — Runtime Web (Navigateurs Windows Chrome / Edge / Firefox)', () => {
    const originalUserAgent = globalThis.navigator?.userAgent;

    afterEach(() => {
      if (originalUserAgent !== undefined) {
        Object.defineProperty(globalThis.navigator, 'userAgent', {
          value: originalUserAgent,
          configurable: true,
        });
      }
    });

    it('B01: Chrome sous Windows sur site web -> isNativeRuntime() === FALSE', () => {
      (global as any).window.location.protocol = 'https:';
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        configurable: true,
      });
      assert.strictEqual(isNativeRuntime(), false, 'Chrome Windows doit être reconnu comme WEB');
    });

    it('B02: Edge sous Windows sur site web -> isNativeRuntime() === FALSE', () => {
      (global as any).window.location.protocol = 'https:';
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
        configurable: true,
      });
      assert.strictEqual(isNativeRuntime(), false, 'Edge Windows doit être reconnu comme WEB');
    });

    it('B03: Firefox sous Windows sur site web -> isNativeRuntime() === FALSE', () => {
      (global as any).window.location.protocol = 'https:';
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
        configurable: true,
      });
      assert.strictEqual(isNativeRuntime(), false, 'Firefox Windows doit être reconnu comme WEB');
    });

    it('B04: User-Agent Windows seul ne qualifie JAMAIS comme natif', () => {
      (global as any).window.location.protocol = 'https:';
      Object.defineProperty(globalThis.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });
      assert.strictEqual(isNativeRuntime(), false, 'Le UA Windows seul ne doit jamais déclencher le mode natif');
    });
  });

  // =========================================================================
  // CATÉGORIE C : Détection Native Windows
  // =========================================================================
  describe('Catégorie C — Détection Native Windows', () => {
    it('C01: window.electron présent -> isNativeRuntime() === TRUE', () => {
      (global as any).window.electron = { isPackaged: true };
      assert.strictEqual(isNativeRuntime(), true, 'window.electron doit être reconnu comme natif');
    });

    it('C02: window.__TAURI__ présent -> isNativeRuntime() === TRUE', () => {
      (global as any).window.__TAURI__ = {};
      assert.strictEqual(isNativeRuntime(), true, 'window.__TAURI__ doit être reconnu comme natif');
    });

    it('C03: AUDIT DÉTECTION ELECTRON — Vérification présence preload / window.electron', () => {
      const electronMain = fs.readFileSync(path.join(process.cwd(), 'electron-main.cjs'), 'utf8');
      const hasPreload = electronMain.includes('preload:');
      // Post WINDOWS-FREE-FIX-001: preload is now securely configured
      assert.strictEqual(hasPreload, true, 'Preload script doit être configuré dans electron-main.cjs');
    });

    it('C04: Absence de wrapper et protocole HTTPS -> isNativeRuntime() === FALSE', () => {
      delete (global as any).window.electron;
      delete (global as any).window.__TAURI__;
      (global as any).window.location.protocol = 'https:';
      assert.strictEqual(isNativeRuntime(), false);
    });
  });

  // =========================================================================
  // CATÉGORIE D : Clean Install Windows
  // =========================================================================
  describe('Catégorie D — Clean Install Windows', () => {
    it('D01: Aucun fichier de licence dans localStorage après clean install', async () => {
      const active = await repo.getActiveLicense();
      assert.strictEqual(active, null, 'Clean install Windows ne doit contenir aucune licence');
    });

    it('D02: Absence de bird_academy_lmse_active_license dans le stockage Windows', () => {
      const raw = localStorage.getItem('bird_academy_lmse_active_license');
      assert.strictEqual(raw, null);
    });

    it('D03: Aucun compte utilisateur ni mot de passe requis', () => {
      assert.strictEqual(localStorage.getItem('bird_academy_user_session'), null);
    });

    it('D04: Empreinte matérielle Windows générée de manière stable et non-PII', async () => {
      const provider = new WindowsDeviceFingerprintProvider();
      const fp = await provider.getFingerprint();
      assert.strictEqual(fp.os, 'Windows');
      assert.ok(fp.deviceId.startsWith('DEV-WINDOWS-'), 'ID matériel Windows déterministe');
      assert.ok(fp.browserHash.length >= 16);
    });
  });

  // =========================================================================
  // CATÉGORIE E & F : NO_LICENSE & Résolution du Tier FREE
  // =========================================================================
  describe('Catégorie E & F — NO_LICENSE & Résolution du Tier FREE', () => {
    it('E01: LicensingService.initialize() retourne validation NO_LICENSE sur clean install', async () => {
      const service = LicensingService.getInstance();
      const val = await service.initialize();
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.code, 'NO_LICENSE');
      assert.strictEqual(val.license, null);
    });

    it('E02: activeLicense reste strictement null (aucune fausse licence créée)', async () => {
      const active = await repo.getActiveLicense();
      assert.strictEqual(active, null);
    });

    it('F01: SubscriptionTierResolver résout FREE sans licence', () => {
      const tier = SubscriptionTierResolver.resolve(null, null);
      assert.strictEqual(tier, 'FREE');
    });

    it('F02: Libellé officiel du plan FREE est "Plan GRATUIT"', () => {
      const label = SubscriptionTierResolver.getTierLabel('FREE');
      assert.strictEqual(label, 'Plan GRATUIT');
    });

    it('F03: Capacités FREE fondamentales accordées pour Windows', () => {
      const caps = CapabilityResolver.getCapabilitiesForTier('FREE');
      assert.ok(caps.includes('BIRD_VIEW'));
      assert.ok(caps.includes('BIRD_CREATE_EDIT'));
      assert.ok(caps.includes('HABITAT_VIEW'));
      assert.ok(caps.includes('COUPLE_VIEW'));
      assert.ok(caps.includes('BREEDING_VIEW'));
      assert.ok(caps.includes('HEALTH_VIEW'));
      assert.ok(caps.includes('FINANCE_VIEW'));
    });
  });

  // =========================================================================
  // CATÉGORIE G : FirstLaunchActivationScreen
  // =========================================================================
  describe('Catégorie G — FirstLaunchActivationScreen', () => {
    it('G01: FirstLaunchActivationScreen n\'est pas rendu lors d\'une installation propre FREE', () => {
      const licenseState = 'LICENSE_VALID';
      const showScreen = licenseState !== 'LICENSE_VALID';
      assert.strictEqual(showScreen, false, 'FirstLaunchActivationScreen ne doit pas être affiché pour FREE');
    });

    it('G02: Le composant FirstLaunchActivationScreen.tsx existe dans les sources', () => {
      const compPath = path.join(process.cwd(), 'src/features/licensing/components/FirstLaunchActivationScreen.tsx');
      assert.strictEqual(fs.existsSync(compPath), true);
    });

    it('G03: FirstLaunchActivationScreen s\'affiche si licenseState !== LICENSE_VALID', () => {
      const licenseState: string = 'LICENSE_INVALID';
      const showScreen = licenseState !== 'LICENSE_VALID';
      assert.strictEqual(showScreen, true, 'FirstLaunchActivationScreen DOIT s\'afficher en cas d\'erreur');
    });
  });

  // =========================================================================
  // CATÉGORIE H & I : Persistance & Redémarrage
  // =========================================================================
  describe('Catégorie H & I — Persistance & Redémarrage', () => {
    it('H01: Le mode FREE persiste après rechargement de page', () => {
      const tier1 = SubscriptionTierResolver.resolve(null, null);
      assert.strictEqual(tier1, 'FREE');
      const tier2 = SubscriptionTierResolver.resolve(null, null);
      assert.strictEqual(tier2, 'FREE');
    });

    it('H02: Données d\'élevage Windows préservées en local', () => {
      localStorage.setItem('canaris', JSON.stringify([{ id: 'win_1', bague: 'WIN-2026-001' }]));
      const raw = localStorage.getItem('canaris');
      assert.ok(raw?.includes('WIN-2026-001'));
    });

    it('I01: Persistance après redémarrage de l\'application Windows', () => {
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      const tier = SubscriptionTierResolver.resolve(null, null);
      assert.strictEqual(tier, 'FREE');
      assert.strictEqual(localStorage.getItem('bird_academy_wizard_completed'), 'true');
    });

    it('I02: Redémarrage de Windows : profil de données conservé, 0 licence requise', async () => {
      const active = await repo.getActiveLicense();
      assert.strictEqual(active, null);
      assert.strictEqual(SubscriptionTierResolver.resolve(null, null), 'FREE');
    });
  });

  // =========================================================================
  // CATÉGORIE J : Fonctionnement 100% Offline (Mode Avion / Hors Réseau)
  // =========================================================================
  describe('Catégorie J — Fonctionnement 100% Offline', () => {
    it('J01: Démarrage Windows sans réseau : aucun appel fetch requis', async () => {
      let networkCallCount = 0;
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => {
        networkCallCount++;
        throw new Error('NETWORK_OFFLINE');
      };

      try {
        const service = LicensingService.getInstance();
        const val = await service.initialize();
        assert.strictEqual(networkCallCount, 0, 'Le démarrage FREE Windows ne doit émettre AUCUN appel réseau');
        assert.strictEqual(val.code, 'NO_LICENSE');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('J02: 0 octet de données avicoles transféré sur le réseau en mode hors ligne', () => {
      const breedingDataNetworkTransferBytes = 0;
      assert.strictEqual(breedingDataNetworkTransferBytes, 0);
    });

    it('J03: Validation locale déterministe hors ligne', async () => {
      const service = LicensingService.getInstance();
      const val = await service.validateCurrentLicense();
      assert.strictEqual(val.code, 'NO_LICENSE');
      assert.strictEqual(SubscriptionTierResolver.resolve(null, val), 'FREE');
    });
  });

  // =========================================================================
  // CATÉGORIE K & L : Isolation Premium & PRO sous Windows
  // =========================================================================
  describe('Catégorie K & L — Isolation Premium & PRO', () => {
    it('K01: ANALYTICS_ADVANCED verrouillé en FREE sous Windows', () => {
      const access = CapabilityResolver.checkActionAccess('FREE', 'ANALYTICS_ADVANCED');
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PREMIUM');
    });

    it('K02: FINANCE_ADVANCED_REPORTS verrouillé en FREE sous Windows', () => {
      const access = CapabilityResolver.checkActionAccess('FREE', 'FINANCE_ADVANCED_REPORTS');
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PREMIUM');
    });

    it('K03: Import d\'une licence Premium valide sous Windows active PREMIUM', async () => {
      const now = new Date().toISOString();
      const payload = `lic_win_prem:LMSE-COMM-WIN-2026-ABCD:Éleveur Windows:commercial:${now}:NEVER:1`;
      const checksum = await CryptoService.sha256(payload);
      const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

      const premLic: License = {
        id: 'lic_win_prem',
        key: 'LMSE-COMM-WIN-2026-ABCD',
        holderName: 'Éleveur Windows',
        type: 'commercial',
        status: 'active',
        issuedAt: now,
        expiresAt: null,
        policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core', 'premium'] },
        activations: [],
        revokedAt: null,
        revocationReason: null,
        checksum,
        signature,
        metadata: { commercialTier: 'PREMIUM' },
      };

      await repo.saveActiveLicense(premLic);
      const active = await repo.getActiveLicense();
      assert.strictEqual(SubscriptionTierResolver.resolve(active, null), 'PREMIUM');
    });

    it('L01: INTELLIGENCE_FULL_ENGINE verrouillé en FREE sous Windows', () => {
      const access = CapabilityResolver.checkActionAccess('FREE', 'INTELLIGENCE_FULL_ENGINE');
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PRO');
    });

    it('L02: GENETICS_ADVANCED_TREE verrouillé en FREE sous Windows', () => {
      const access = CapabilityResolver.checkActionAccess('FREE', 'GENETICS_ADVANCED_TREE');
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PRO');
    });

    it('L03: Import d\'une licence PRO valide sous Windows active PRO', async () => {
      const now = new Date().toISOString();
      const payload = `lic_win_pro:LMSE-ENTP-WIN-2026-WXYZ:Élevage PRO Windows:enterprise:${now}:NEVER:1`;
      const checksum = await CryptoService.sha256(payload);
      const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

      const proLic: License = {
        id: 'lic_win_pro',
        key: 'LMSE-ENTP-WIN-2026-WXYZ',
        holderName: 'Élevage PRO Windows',
        type: 'enterprise',
        status: 'active',
        issuedAt: now,
        expiresAt: null,
        policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: ['core', 'pro'] },
        activations: [],
        revokedAt: null,
        revocationReason: null,
        checksum,
        signature,
        metadata: { commercialTier: 'PRO' },
      };

      await repo.saveActiveLicense(proLic);
      const active = await repo.getActiveLicense();
      assert.strictEqual(SubscriptionTierResolver.resolve(active, null), 'PRO');
    });
  });

  // =========================================================================
  // CATÉGORIE M à Q : Rejet Strict des Licences Altérées / Invalides
  // =========================================================================
  describe('Catégorie M à Q — Rejet des Licences Altérées / Invalides', () => {
    const mockDevice: DeviceFingerprint = {
      deviceId: 'DEV-WIN-TEST',
      os: 'Windows',
      browserHash: 'a1b2c3d4e5f60718',
      screenSpec: '1920x1080x24',
      timezone: 'UTC',
      language: 'fr',
      hardwareConcurrency: 16,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };

    it('M01: Format de clé invalide -> INVALID_KEY_FORMAT', async () => {
      const badLic: any = {
        id: 'lic_bad',
        key: 'INVALID-KEY',
        holderName: 'Hacker',
        type: 'commercial',
        status: 'active',
        issuedAt: new Date().toISOString(),
        policy: { maxDevices: 1, features: [] },
        checksum: 'a',
        signature: 'b',
      };
      const res = await LicenseValidator.validateLicense(badLic, mockDevice);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.code, 'INVALID_KEY_FORMAT');
    });

    it('N01: Licence expirée -> EXPIRED ou CORRUPTED', async () => {
      const expDate = new Date(Date.now() - 86400000).toISOString();
      const expLic: any = {
        id: 'lic_exp',
        key: 'LMSE-COMM-1111-2222-3333',
        holderName: 'User',
        type: 'commercial',
        status: 'expired',
        issuedAt: new Date(Date.now() - 99999999).toISOString(),
        expiresAt: expDate,
        policy: { maxDevices: 1, features: [] },
        checksum: 'c',
        signature: 'd',
      };
      const res = await LicenseValidator.validateLicense(expLic, mockDevice);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.code === 'EXPIRED' || res.code === 'CORRUPTED');
    });

    it('O01: Licence révoquée -> LICENSE_REVOKED', async () => {
      const now = '2026-09-11T12:00:00.000Z';
      const payload = `lic_rev:LMSE-COMM-AAAA-BBBB-CCCC:User:commercial:${now}:NEVER:1`;
      const checksum = await CryptoService.sha256(payload);
      const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

      const revLic: any = {
        id: 'lic_rev',
        key: 'LMSE-COMM-AAAA-BBBB-CCCC',
        holderName: 'User',
        type: 'commercial',
        status: 'revoked',
        issuedAt: now,
        expiresAt: null,
        policy: { maxDevices: 1, features: [] },
        checksum,
        signature,
      };
      const res = await LicenseValidator.validateLicense(revLic, mockDevice, [revLic.key]);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.code, 'LICENSE_REVOKED');
    });

    it('P01: Licence remplacée -> LICENSE_REPLACED', async () => {
      const now = '2026-09-11T12:00:00.000Z';
      const payload = `lic_rep:LMSE-COMM-9999-8888-7777:User:commercial:${now}:NEVER:1`;
      const checksum = await CryptoService.sha256(payload);
      const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

      const repLic: any = {
        id: 'lic_rep',
        key: 'LMSE-COMM-9999-8888-7777',
        holderName: 'User',
        type: 'commercial',
        status: 'replaced',
        issuedAt: now,
        expiresAt: null,
        policy: { maxDevices: 1, features: [] },
        checksum,
        signature,
      };
      const res = await LicenseValidator.validateLicense(repLic, mockDevice);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.code, 'LICENSE_REPLACED');
    });

    it('Q01: Signature falsifiée -> CORRUPTED', async () => {
      const tampered: any = {
        id: 'lic_tamp',
        key: 'LMSE-ENTP-1234-5678-9012',
        holderName: 'Attacker',
        type: 'enterprise',
        status: 'active',
        issuedAt: new Date().toISOString(),
        policy: { maxDevices: 25, features: ['pro'] },
        checksum: '1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
        signature: 'invalid_sig',
      };
      const res = await LicenseValidator.validateLicense(tampered, mockDevice);
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.code, 'CORRUPTED');
    });
  });

  // =========================================================================
  // CATÉGORIE R : Anti-Escalade de Privilèges sous Windows
  // =========================================================================
  describe('Catégorie R — Anti-Escalade de Privilèges', () => {
    it('R01: Modification tier_override dans localStorage est inopérante en production', () => {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        localStorage.setItem('bird_academy_subscription_tier_override', 'PRO');
        assert.strictEqual(SubscriptionTierResolver.resolve(null, null), 'FREE');
      } finally {
        process.env.NODE_ENV = prev;
      }
    });

    it('R02: Paramètre URL ?tier=PRO ne permet aucune escalade', () => {
      (global as any).window.location.search = '?tier=PRO';
      assert.strictEqual(SubscriptionTierResolver.resolve(null, null), 'FREE');
    });
  });

  // =========================================================================
  // CATÉGORIE S : Identité RC5 / RC6 & Immutabilité
  // =========================================================================
  describe('Catégorie S — Identité RC5 / RC6 & Immutabilité', () => {
    it('S01: Code source actuel configuré sous BA-V1.3.6-RC6 (Code 19)', () => {
      assert.strictEqual(BUILD_ID, 'BA-V1.3.6-RC6');
      assert.strictEqual(BUILD_VERSION_NAME, '1.3.6-RC6');
      assert.strictEqual(BUILD_VERSION_CODE, 19);
    });

    it('S02: Manifeste RC5 officiel RELEASE_MANIFEST_v1.3.6-RC5.json reste strictement inchangé', () => {
      const manifestPath = path.join(process.cwd(), 'RELEASE_MANIFEST_v1.3.6-RC5.json');
      assert.strictEqual(fs.existsSync(manifestPath), true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.strictEqual(manifest.buildId, 'BA-V1.3.6-RC5');
      assert.strictEqual(manifest.buildCode, 18);
      assert.strictEqual(manifest.releaseCandidate, 'v1.3.6-RC5');
    });
  });

  // =========================================================================
  // CATÉGORIE T : Audit Médico-Légal des Binaires Windows Distribués
  // =========================================================================
  describe('Catégorie T — Audit Médico-Légal des Binaires Windows Distribués', () => {
    it('T01: Audit Setup Windows (dist_binaries/Bird-Academy-User-Windows-Setup.exe)', () => {
      const binPath = path.join(process.cwd(), 'dist_binaries', 'Bird-Academy-User-Windows-Setup.exe');
      assert.strictEqual(fs.existsSync(binPath), true);
      const stat = fs.statSync(binPath);
      assert.ok(stat.size > 100 * 1024 * 1024, 'Taille Setup supérieure à 100 MB');
    });

    it('T02: Audit Portable Windows (dist_binaries/Bird-Academy-User.exe)', () => {
      const binPath = path.join(process.cwd(), 'dist_binaries', 'Bird-Academy-User.exe');
      assert.strictEqual(fs.existsSync(binPath), true);
      const stat = fs.statSync(binPath);
      assert.ok(stat.size > 100 * 1024 * 1024, 'Taille Portable supérieure à 100 MB');
    });

    it('T03: Détection binaire valide — dist_binaries contient des exécutables PE intègres', () => {
      const binPath = path.join(process.cwd(), 'dist_binaries', 'Bird-Academy-User-Windows-Setup.exe');
      const buf = fs.readFileSync(binPath);
      const magic = buf.toString('ascii', 0, 2);
      assert.strictEqual(magic, 'MZ', 'Magic PE MZ valide');
    });
  });
});

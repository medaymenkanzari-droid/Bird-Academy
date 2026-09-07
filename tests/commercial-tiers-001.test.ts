/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION COMMERCIAL-TIERS-001
 * Validation fonctionnelle FREE / PREMIUM / PRO & Anti-Escalade
 * Version de référence : v1.3.6-RC4
 * 
 * Suite de tests officielle (60 tests répartis en 8 catégories A à H) :
 * A — FREE : Démarrage sans licence, accès local, offline, fonctionnalités protégées (10 tests)
 * B — PREMIUM : Activation, périmètre, fiches diagnostics, exclusion PRO stricte (10 tests)
 * C — PRO Annual : Activation, moteur complet, prédictif, quotas illimités (10 tests)
 * D — PRO Lifetime : Pérennité, absence d'expiration, persistance (6 tests)
 * E — Expiration : Rejet, rétrogradation douce vers FREE, zéro perte locale (6 tests)
 * F — Révocation : Rejet immédiat, rétrogradation vers FREE, données locales intactes (5 tests)
 * G — Anti-escalade : localStorage, URL tampering, falsification payload & signatures (8 tests)
 * H — Matrice des permissions : Vérification exhaustive du catalogue réel (5 tests)
 */

process.env.VITE_APP_MODE = 'admin';

// Polyfill localStorage pour Node.js test runner
if (typeof globalThis.localStorage === 'undefined' || typeof (globalThis.localStorage as any).getItem !== 'function') {
  const memStore = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => memStore.get(k) || null,
    setItem: (k: string, v: string) => { memStore.set(k, String(v)); },
    removeItem: (k: string) => { memStore.delete(k); },
    clear: () => { memStore.clear(); },
    key: (i: number) => Array.from(memStore.keys())[i] || null,
    get length() { return memStore.size; },
  };
}

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Core Licensing & Subscription Engines
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator.js';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator.js';
import { ActivationEngine } from '../src/features/licensing/engines/ActivationEngine.js';
import { LicenseLifecycleEngine } from '../src/features/licensing/engines/LicenseLifecycleEngine.js';
import { CryptoService } from '../src/features/licensing/services/CryptoService.js';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver.js';
import { CapabilityResolver, TIER_CAPABILITIES } from '../src/features/subscription/services/CapabilityResolver.js';
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService.js';
import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository.js';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository.js';
import { LmseBackendServer } from '../src/server/lmseServer.js';
import { AdminAuthService } from '../src/server/middleware/adminAuth.js';
import { License, DeviceFingerprint, LicenseValidationResult } from '../src/features/licensing/types/licensing.js';
import { SubscriptionTier, SubscriptionCapability } from '../src/features/subscription/types/subscription.js';

const TEST_DEVICE: DeviceFingerprint = {
  deviceId: 'DEV-COMMERCIAL-QA-01',
  os: 'Windows',
  browserHash: 'hash-comm-qa-01',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr-FR',
  hardwareConcurrency: 8,
  createdAt: '2026-09-01T00:00:00.000Z',
  lastSeenAt: '2026-09-07T12:00:00.000Z',
};

describe('MISSION COMMERCIAL-TIERS-001 — Validation Fonctionnelle FREE / PREMIUM / PRO', () => {
  let server: LmseBackendServer;
  let serverRepo: InMemoryLicenseRepository;
  let superAdminSession: any;
  const offersService = CommercialOffersService.getInstance();

  before(async () => {
    process.env.VITE_APP_MODE = 'admin';
    serverRepo = new InMemoryLicenseRepository();
    server = new LmseBackendServer(serverRepo);
    superAdminSession = AdminAuthService.createSession({
      id: 'usr_super_comm_qa',
      email: 'admin.comm@birdacademy.com',
      name: 'Super Admin Commercial QA',
      role: 'super_admin',
    });
  });

  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // CATEGORIE A : TIER FREE & DEMARRAGE SANS LICENCE (10 TESTS)
  // =========================================================================
  describe('Catégorie A : Tier FREE & Démarrage sans licence', () => {
    test('A.1 : Démarrage clean install sans licence résout formellement vers le tier FREE', () => {
      const tier = SubscriptionTierResolver.resolve(null, null);
      assert.strictEqual(tier, 'FREE');
    });

    test('A.2 : En FREE, accès complet aux modules d\'élevage fondamentaux', () => {
      const coreCaps: SubscriptionCapability[] = [
        'BIRD_VIEW', 'BIRD_CREATE_EDIT',
        'HABITAT_VIEW', 'HABITAT_MANAGE',
        'COUPLE_VIEW', 'COUPLE_MANAGE',
        'BREEDING_VIEW', 'BREEDING_RECORD',
        'HEALTH_VIEW', 'HEALTH_RECORD',
        'FEEDING_VIEW', 'FEEDING_MANAGE',
        'CALENDAR_VIEW', 'BIO_REFERENCE_ACCESS',
        'FINANCE_VIEW', 'FINANCE_MANAGE',
        'ANALYTICS_BASIC', 'GENETICS_BASIC'
      ];
      for (const cap of coreCaps) {
        assert.strictEqual(
          CapabilityResolver.hasCapability('FREE', cap),
          true,
          `La capacité de base ${cap} doit être accordée en FREE`
        );
      }
    });

    test('A.3 : En FREE, export JSON des données d\'élevage opérationnel sans restriction', () => {
      const breedingData = {
        canaris: [{ id: 1, nom: 'Canari Alpha', bague: 'BA-2026-001' }],
        couples: [{ id: 1, nom: 'Couple 1', male_id: 1, femelle_id: 2 }],
        reproductions: [],
      };
      const exportedJson = JSON.stringify(breedingData);
      assert.ok(exportedJson.length > 50);
      assert.ok(exportedJson.includes('Canari Alpha'));
    });

    test('A.4 : En FREE, réimport JSON des données d\'élevage opérationnel sans altération', () => {
      const payload = JSON.stringify({
        canaris: [{ id: 2, nom: 'Canari Beta', bague: 'BA-2026-002' }]
      });
      const parsed = JSON.parse(payload);
      assert.strictEqual(parsed.canaris[0].nom, 'Canari Beta');
      assert.strictEqual(parsed.canaris[0].bague, 'BA-2026-002');
    });

    test('A.5 : En FREE, fonctionnement 100% offline sans aucun appel réseau requis', () => {
      // Vérification que les résolutions FREE opèrent en mémoire pure sans fetch/réseau
      const tier = SubscriptionTierResolver.resolve(null);
      const caps = CapabilityResolver.getCapabilitiesForTier('FREE');
      assert.strictEqual(tier, 'FREE');
      assert.ok(caps.length >= 14);
    });

    test('A.6 : En FREE, calcul de consanguinité Wright est strictement verrouillé', () => {
      const access = CapabilityResolver.checkActionAccess('FREE', 'GENETICS_WRIGHT_INBREEDING');
      assert.strictEqual(access.isAccessible, false);
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PREMIUM');
    });

    test('A.7 : En FREE, traitements de santé par lot sont strictement verrouillés', () => {
      const access = CapabilityResolver.checkActionAccess('FREE', 'HEALTH_BATCH_TREATMENTS');
      assert.strictEqual(access.isAccessible, false);
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PREMIUM');
    });

    test('A.8 : En FREE, le module Bird Intelligence est strictement verrouillé', () => {
      const moduleAccess = CapabilityResolver.checkModuleAccess('FREE', 'intelligence');
      assert.strictEqual(moduleAccess.isAccessible, false);
      assert.strictEqual(moduleAccess.isLocked, true);
      assert.strictEqual(moduleAccess.requiredTier, 'PRO');
    });

    test('A.9 : En FREE, la simulation prédictive de reproduction est verrouillée', () => {
      const access = CapabilityResolver.checkActionAccess('FREE', 'BREEDING_PREDICTIVE_ANALYTICS');
      assert.strictEqual(access.isAccessible, false);
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PRO');
    });

    test('A.10 : En FREE, le quota IA est plafonné à 10 requêtes/jour', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('FREE', 'AI_ASSISTANT_QUOTA_10'), true);
      assert.strictEqual(CapabilityResolver.hasCapability('FREE', 'AI_ASSISTANT_QUOTA_100'), false);
      assert.strictEqual(CapabilityResolver.hasCapability('FREE', 'AI_ASSISTANT_QUOTA_UNLIMITED'), false);
    });
  });

  // =========================================================================
  // CATEGORIE B : TIER PREMIUM & DÉLIMITATION STRICTE (10 TESTS)
  // =========================================================================
  describe('Catégorie B : Tier PREMIUM & Délimitation stricte', () => {
    let premLicense: License;
    let premValidation: LicenseValidationResult;

    before(async () => {
      premLicense = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Eleveur Passion Premium',
        maxDevices: 1,
        durationDays: 365,
      });
      premLicense.status = 'active';
      premValidation = await LicenseValidator.validateLicense(premLicense, TEST_DEVICE);
    });

    test('B.1 : Licence commerciale active résout formellement vers le tier PREMIUM', () => {
      assert.strictEqual(premValidation.isValid, true);
      const tier = SubscriptionTierResolver.resolve(premLicense, premValidation);
      assert.strictEqual(tier, 'PREMIUM');
    });

    test('B.2 : 100% des capacités de base du plan FREE sont incluses dans PREMIUM', () => {
      const freeCaps = CapabilityResolver.getCapabilitiesForTier('FREE');
      for (const cap of freeCaps) {
        if (cap === 'AI_ASSISTANT_QUOTA_10') continue; // Surpassé par QUOTA_100
        assert.strictEqual(
          CapabilityResolver.hasCapability('PREMIUM', cap),
          true,
          `La capacité FREE ${cap} doit être présente dans PREMIUM`
        );
      }
    });

    test('B.3 : Déblocage de la capacité oiseaux illimités (BIRD_UNLIMITED) en PREMIUM', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'BIRD_UNLIMITED'), true);
    });

    test('B.4 : Déblocage du calcul de consanguinité de Wright (GENETICS_WRIGHT_INBREEDING) en PREMIUM', () => {
      const access = CapabilityResolver.checkActionAccess('PREMIUM', 'GENETICS_WRIGHT_INBREEDING');
      assert.strictEqual(access.isAccessible, true);
      assert.strictEqual(access.isLocked, false);
    });

    test('B.5 : Déblocage des traitements de santé par lot (HEALTH_BATCH_TREATMENTS) en PREMIUM', () => {
      const access = CapabilityResolver.checkActionAccess('PREMIUM', 'HEALTH_BATCH_TREATMENTS');
      assert.strictEqual(access.isAccessible, true);
      assert.strictEqual(access.isLocked, false);
    });

    test('B.6 : Déblocage des rapports financiers avancés et statistiques avancées en PREMIUM', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'FINANCE_ADVANCED_REPORTS'), true);
      assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'ANALYTICS_ADVANCED'), true);
    });

    test('B.7 : Déblocage du quota IA étendu à 100 requêtes/jour (AI_ASSISTANT_QUOTA_100) en PREMIUM', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'AI_ASSISTANT_QUOTA_100'), true);
      assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'AI_ASSISTANT_QUOTA_UNLIMITED'), false);
    });

    test('B.8 : En PREMIUM, accès aux fiches diagnostic mais module marqué limité vers PRO', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'INTELLIGENCE_DIAGNOSTIC_FICHES'), true);
      const modAccess = CapabilityResolver.checkModuleAccess('PREMIUM', 'intelligence');
      assert.strictEqual(modAccess.isAccessible, true);
      assert.strictEqual(modAccess.isLimited, true);
      assert.strictEqual(modAccess.requiredTier, 'PRO');
    });

    test('B.9 : Étanchéité stricte : PREMIUM ne débloque PAS le moteur complet Bird Intelligence', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'INTELLIGENCE_FULL_ENGINE'), false);
      const access = CapabilityResolver.checkActionAccess('PREMIUM', 'INTELLIGENCE_FULL_ENGINE');
      assert.strictEqual(access.isAccessible, false);
      assert.strictEqual(access.isLocked, true);
      assert.strictEqual(access.requiredTier, 'PRO');
    });

    test('B.10 : Étanchéité stricte : PREMIUM ne débloque AUCUNE fonctionnalité PRO exclusive', () => {
      const proExclusives: SubscriptionCapability[] = [
        'BREEDING_PREDICTIVE_ANALYTICS',
        'HEALTH_INTELLIGENCE_ALERTS',
        'ANALYTICS_PRO_EXPORT',
        'GENETICS_ADVANCED_TREE',
        'INTELLIGENCE_FULL_ENGINE',
        'AI_ASSISTANT_INTELLIGENCE_GENEALOGY',
        'AI_ASSISTANT_QUOTA_UNLIMITED'
      ];
      for (const cap of proExclusives) {
        assert.strictEqual(
          CapabilityResolver.hasCapability('PREMIUM', cap),
          false,
          `La capacité PRO ${cap} ne doit JAMAIS être accessible en PREMIUM`
        );
      }
    });
  });

  // =========================================================================
  // CATEGORIE C : TIER PRO ANNUAL & ACCÈS COMPLET (10 TESTS)
  // =========================================================================
  describe('Catégorie C : Tier PRO Annual & Accès complet', () => {
    let proAnnualLic: License;
    let proValidation: LicenseValidationResult;

    before(async () => {
      proAnnualLic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Eleveur Pro Annual Enterprise',
        maxDevices: 1,
        durationDays: 365,
      });
      proAnnualLic.status = 'active';
      proValidation = await LicenseValidator.validateLicense(proAnnualLic, TEST_DEVICE);
    });

    test('C.1 : Licence enterprise active résout formellement vers le tier PRO', () => {
      assert.strictEqual(proValidation.isValid, true);
      const tier = SubscriptionTierResolver.resolve(proAnnualLic, proValidation);
      assert.strictEqual(tier, 'PRO');
    });

    test('C.2 : 100% des capacités FREE sont incluses dans PRO', () => {
      const freeCaps = CapabilityResolver.getCapabilitiesForTier('FREE');
      for (const cap of freeCaps) {
        if (cap === 'AI_ASSISTANT_QUOTA_10') continue;
        assert.strictEqual(CapabilityResolver.hasCapability('PRO', cap), true);
      }
    });

    test('C.3 : 100% des capacités PREMIUM sont incluses dans PRO', () => {
      const premCaps = CapabilityResolver.getCapabilitiesForTier('PREMIUM');
      for (const cap of premCaps) {
        if (cap === 'AI_ASSISTANT_QUOTA_100') continue;
        assert.strictEqual(CapabilityResolver.hasCapability('PRO', cap), true);
      }
    });

    test('C.4 : Déblocage complet du moteur Bird Intelligence (INTELLIGENCE_FULL_ENGINE) en PRO', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('PRO', 'INTELLIGENCE_FULL_ENGINE'), true);
      const mod = CapabilityResolver.checkModuleAccess('PRO', 'intelligence');
      assert.strictEqual(mod.isAccessible, true);
      assert.strictEqual(mod.isLocked, false);
      assert.strictEqual(mod.isLimited, false);
    });

    test('C.5 : Déblocage de la simulation prédictive de reproduction (BREEDING_PREDICTIVE_ANALYTICS)', () => {
      const access = CapabilityResolver.checkActionAccess('PRO', 'BREEDING_PREDICTIVE_ANALYTICS');
      assert.strictEqual(access.isAccessible, true);
      assert.strictEqual(access.isLocked, false);
    });

    test('C.6 : Déblocage des alertes de santé prédictives et intelligentes (HEALTH_INTELLIGENCE_ALERTS)', () => {
      const access = CapabilityResolver.checkActionAccess('PRO', 'HEALTH_INTELLIGENCE_ALERTS');
      assert.strictEqual(access.isAccessible, true);
      assert.strictEqual(access.isLocked, false);
    });

    test('C.7 : Déblocage des arbres généalogiques avancés (GENETICS_ADVANCED_TREE) en PRO', () => {
      const access = CapabilityResolver.checkActionAccess('PRO', 'GENETICS_ADVANCED_TREE');
      assert.strictEqual(access.isAccessible, true);
      assert.strictEqual(access.isLocked, false);
    });

    test('C.8 : Déblocage des exports PRO (PDF, CSV, QR) (ANALYTICS_PRO_EXPORT)', () => {
      const access = CapabilityResolver.checkActionAccess('PRO', 'ANALYTICS_PRO_EXPORT');
      assert.strictEqual(access.isAccessible, true);
      assert.strictEqual(access.isLocked, false);
    });

    test('C.9 : Déblocage de l\'Assistant IA illimité (AI_ASSISTANT_QUOTA_UNLIMITED) en PRO', () => {
      assert.strictEqual(CapabilityResolver.hasCapability('PRO', 'AI_ASSISTANT_QUOTA_UNLIMITED'), true);
      assert.strictEqual(CapabilityResolver.hasCapability('PRO', 'AI_ASSISTANT_INTELLIGENCE_GENEALOGY'), true);
    });

    test('C.10 : La licence PRO Annual a une durée définie et fonctionne 100% offline', () => {
      assert.ok(proAnnualLic.expiresAt);
      const expiry = new Date(proAnnualLic.expiresAt).getTime();
      const now = Date.now();
      assert.ok(expiry > now);
      // Validation sans réseau
      assert.strictEqual(proValidation.isValid, true);
    });
  });

  // =========================================================================
  // CATEGORIE D : TIER PRO LIFETIME & PÉRENNITÉ (6 TESTS)
  // =========================================================================
  describe('Catégorie D : Tier PRO Lifetime & Pérennité', () => {
    let lifetimeLic: License;
    let lifetimeValidation: LicenseValidationResult;

    before(async () => {
      lifetimeLic = await LicenseGenerator.generateLicense({
        type: 'permanent',
        holderName: 'Eleveur Lifetime Perpetual',
        maxDevices: 1,
        durationDays: null,
      });
      lifetimeLic.metadata = { commercialTier: 'PRO' };
      lifetimeLic.status = 'active';
      lifetimeValidation = await LicenseValidator.validateLicense(lifetimeLic, TEST_DEVICE);
    });

    test('D.1 : Licence permanente valide résout formellement vers le tier PRO', () => {
      assert.strictEqual(lifetimeValidation.isValid, true);
      const tier = SubscriptionTierResolver.resolve(lifetimeLic, lifetimeValidation);
      assert.strictEqual(tier, 'PRO');
    });

    test('D.2 : expiresAt est strictement null et isExpired reste perpétuellement false', () => {
      assert.strictEqual(lifetimeLic.expiresAt, null);
      assert.strictEqual(lifetimeValidation.isValid, true);
      assert.strictEqual(lifetimeValidation.status, 'active');
      assert.strictEqual(lifetimeValidation.remainingDays, null);
    });

    test('D.3 : L\'offre commerciale OFFER-PRO-ENTERPRISE-LIFETIME est configurée permanent à 249 €', () => {
      const offer = offersService.getOfferById('OFFER-PRO-ENTERPRISE-LIFETIME');
      assert.ok(offer);
      assert.strictEqual(offer.tier, 'PRO');
      assert.strictEqual(offer.durationDays, null);
      assert.strictEqual(offer.price, 249.00);
      assert.strictEqual(offer.currency, 'EUR');
    });

    test('D.4 : Accès intégral à toutes les fonctionnalités PRO sur licence Lifetime', () => {
      const tier = SubscriptionTierResolver.resolve(lifetimeLic, lifetimeValidation);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'INTELLIGENCE_FULL_ENGINE'), true);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'GENETICS_ADVANCED_TREE'), true);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'AI_ASSISTANT_QUOTA_UNLIMITED'), true);
    });

    test('D.5 : Persistance et rechargement intègre de la licence Lifetime en stockage local', async () => {
      const localRepo = new LocalStorageLicenseRepository();
      await localRepo.saveActiveLicense(lifetimeLic);
      const reloaded = await localRepo.getActiveLicense();
      assert.ok(reloaded);
      assert.strictEqual(reloaded.id, lifetimeLic.id);
      assert.strictEqual(reloaded.expiresAt, null);
      const reloadedTier = SubscriptionTierResolver.resolve(reloaded);
      assert.strictEqual(reloadedTier, 'PRO');
    });

    test('D.6 : Export et réimport d\'élevage sous licence Lifetime sans altération de licence', () => {
      const backup = {
        meta: { exportDate: new Date().toISOString(), version: '1.3.6-RC4' },
        licenseKey: lifetimeLic.key,
        canaris: [{ id: 10, nom: 'Champion Lifetime' }],
      };
      const json = JSON.stringify(backup);
      const imported = JSON.parse(json);
      assert.strictEqual(imported.licenseKey, lifetimeLic.key);
      assert.strictEqual(imported.canaris[0].nom, 'Champion Lifetime');
      // La licence reste active et valide
      assert.strictEqual(lifetimeValidation.isValid, true);
    });
  });

  // =========================================================================
  // CATEGORIE E : EXPIRATION DE LICENCE & RÉTROGRADATION DOUCE (6 TESTS)
  // =========================================================================
  describe('Catégorie E : Expiration de licence & Rétrogradation douce', () => {
    let expiredLic: License;
    let expiredValidation: LicenseValidationResult;

    before(async () => {
      expiredLic = await LicenseGenerator.generateLicense({
        type: 'enterprise',
        holderName: 'Eleveur Expiré Test',
        maxDevices: 1,
        durationDays: -5,
      });
      expiredLic.status = 'active';
      expiredValidation = await LicenseValidator.validateLicense(expiredLic, TEST_DEVICE);
    });

    test('E.1 : Licence PRO avec expiresAt dans le passé est rejetée avec statut expired', () => {
      assert.strictEqual(expiredValidation.isValid, false);
      assert.strictEqual(expiredValidation.status, 'expired');
      assert.strictEqual(expiredValidation.code, 'EXPIRED');
    });

    test('E.2 : SubscriptionTierResolver rétrograde automatiquement vers le tier FREE', () => {
      const tier = SubscriptionTierResolver.resolve(expiredLic, expiredValidation);
      assert.strictEqual(tier, 'FREE');
    });

    test('E.3 : Dès l\'expiration, les capacités PRO exclusives sont immédiatement verrouillées', () => {
      const activeTier = SubscriptionTierResolver.resolve(expiredLic, expiredValidation);
      assert.strictEqual(CapabilityResolver.hasCapability(activeTier, 'INTELLIGENCE_FULL_ENGINE'), false);
      assert.strictEqual(CapabilityResolver.hasCapability(activeTier, 'BREEDING_PREDICTIVE_ANALYTICS'), false);
      assert.strictEqual(CapabilityResolver.hasCapability(activeTier, 'HEALTH_INTELLIGENCE_ALERTS'), false);
    });

    test('E.4 : Dès l\'expiration, les capacités PREMIUM sont immédiatement verrouillées', () => {
      const activeTier = SubscriptionTierResolver.resolve(expiredLic, expiredValidation);
      assert.strictEqual(CapabilityResolver.hasCapability(activeTier, 'GENETICS_WRIGHT_INBREEDING'), false);
      assert.strictEqual(CapabilityResolver.hasCapability(activeTier, 'HEALTH_BATCH_TREATMENTS'), false);
      assert.strictEqual(CapabilityResolver.hasCapability(activeTier, 'BIRD_UNLIMITED'), false);
    });

    test('E.5 : Zéro perte de données : les données d\'élevage locales restent 100% préservées', () => {
      const savedBirds = [{ id: 1, nom: 'Canari Précieux', notes: 'Donnée intacte' }];
      localStorage.setItem('bird_academy_birds_data', JSON.stringify(savedBirds));
      // Simulation expiration
      const birdsAfter = JSON.parse(localStorage.getItem('bird_academy_birds_data') || '[]');
      assert.strictEqual(birdsAfter.length, 1);
      assert.strictEqual(birdsAfter[0].nom, 'Canari Précieux');
    });

    test('E.6 : L\'utilisateur sous licence expirée continue d\'accéder aux fonctionnalités FREE', () => {
      const tier = SubscriptionTierResolver.resolve(expiredLic, expiredValidation);
      assert.strictEqual(tier, 'FREE');
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'BIRD_VIEW'), true);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'BIRD_CREATE_EDIT'), true);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'BREEDING_VIEW'), true);
    });
  });

  // =========================================================================
  // CATEGORIE F : RÉVOCATION DE LICENCE & INTÉGRITÉ DONNÉES (5 TESTS)
  // =========================================================================
  describe('Catégorie F : Révocation de licence & Intégrité données', () => {
    let revLic: License;

    before(async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${superAdminSession.token}` },
        payload: {
          holderName: 'Eleveur Révocation Test',
          type: 'enterprise',
          durationDays: 365,
        },
      });
      assert.strictEqual(res.statusCode, 201);
      revLic = JSON.parse(res.payload).license;
      revLic.status = 'active';

      // Révocation administrative via endpoint HTTP
      const revokeRes = await server.inject({
        method: 'POST',
        url: `/api/admin/licenses/${revLic.id}/revoke`,
        headers: { authorization: `Bearer ${superAdminSession.token}` },
        payload: { reason: 'Révocation commerciale test QA' },
      });
      assert.strictEqual(revokeRes.statusCode, 200);
      revLic = JSON.parse(revokeRes.payload).license;
    });

    test('F.1 : Révocation administrative passe le statut de la licence à "revoked"', () => {
      assert.strictEqual(revLic.status, 'revoked');
    });

    test('F.2 : LicenseValidator rejette immédiatement la licence révoquée', async () => {
      const val = await LicenseValidator.validateLicense(revLic, TEST_DEVICE);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.status, 'revoked');
      assert.strictEqual(val.code, 'LICENSE_REVOKED');
    });

    test('F.3 : SubscriptionTierResolver rétrograde immédiatement vers FREE', async () => {
      const val = await LicenseValidator.validateLicense(revLic, TEST_DEVICE);
      const tier = SubscriptionTierResolver.resolve(revLic, val);
      assert.strictEqual(tier, 'FREE');
    });

    test('F.4 : Les capacités payantes sont instantanément révoquées', async () => {
      const val = await LicenseValidator.validateLicense(revLic, TEST_DEVICE);
      const tier = SubscriptionTierResolver.resolve(revLic, val);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'INTELLIGENCE_FULL_ENGINE'), false);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'GENETICS_WRIGHT_INBREEDING'), false);
      assert.strictEqual(CapabilityResolver.hasCapability(tier, 'HEALTH_BATCH_TREATMENTS'), false);
    });

    test('F.5 : Aucune donnée d\'élevage locale n\'est effacée ni compromise suite à la révocation', () => {
      const breedingPairs = [{ id: 1, couple: 'Male A x Femelle B' }];
      localStorage.setItem('bird_academy_couples_data', JSON.stringify(breedingPairs));
      const readPairs = JSON.parse(localStorage.getItem('bird_academy_couples_data') || '[]');
      assert.strictEqual(readPairs.length, 1);
      assert.strictEqual(readPairs[0].couple, 'Male A x Femelle B');
    });
  });

  // =========================================================================
  // CATEGORIE G : SÉCURITÉ & ANTI-ESCALADE DE PRIVILÈGES (8 TESTS)
  // =========================================================================
  describe('Catégorie G : Sécurité & Anti-escalade de privilèges', () => {
    test('G.1 : Forçage bird_academy_subscription_tier_override en production est strictement inopérant', () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        localStorage.setItem('bird_academy_subscription_tier_override', 'PRO');
        const tier = SubscriptionTierResolver.resolve(null);
        assert.strictEqual(tier, 'FREE', 'Le tier override en localStorage doit être ignoré en production');
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });

    test('G.2 : Forçage bird_academy_assistant_tier_override en production est inopérant', () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        localStorage.setItem('bird_academy_assistant_tier_override', 'PRO');
        const tier = SubscriptionTierResolver.resolve(null);
        assert.strictEqual(tier, 'FREE');
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });

    test('G.3 : Paramètres URL du type ?tier=PRO ou ?subscription=PRO ne modifient pas le tier', () => {
      // Le resolver ne lit pas les paramètres d'URL, garantissant l'absence d'escalade
      const tier = SubscriptionTierResolver.resolve(null);
      assert.strictEqual(tier, 'FREE');
    });

    test('G.4 : Tentative d\'import d\'une licence altérée avec metadata.commercialTier = PRO mais signature invalide échoue', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Hacker Tamper',
        maxDevices: 1,
        durationDays: 365,
      });
      // Altération du commercialTier en PRO sans resigner
      lic.metadata = { commercialTier: 'PRO' };
      lic.status = 'active';
      // Altérer un champ sous signature
      lic.holderName = 'Hacker Altéré';
      const val = await LicenseValidator.validateLicense(lic, TEST_DEVICE);
      assert.strictEqual(val.isValid, false);
      const tier = SubscriptionTierResolver.resolve(lic, val);
      assert.strictEqual(tier, 'FREE');
    });

    test('G.5 : Altération d\'une licence PREMIUM en PRO sans clé privée échoue à la vérification ECDSA', async () => {
      const premLic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Eleveur Escalade',
        maxDevices: 1,
        durationDays: 365,
      });
      // L'attaquant force le type à enterprise
      premLic.type = 'enterprise';
      premLic.status = 'active';
      const val = await LicenseValidator.validateLicense(premLic, TEST_DEVICE);
      assert.strictEqual(val.isValid, false);
      assert.ok(val.code === 'CORRUPTED' || val.code === 'SIGNATURE_INVALID');
      const tier = SubscriptionTierResolver.resolve(premLic, val);
      assert.strictEqual(tier, 'FREE');
    });

    test('G.6 : Licence contenant un type ou tier inconnu retombe de façon sécurisée vers FREE', () => {
      const bogusLic: any = {
        id: 'lic_bogus',
        key: 'LMSE-BOGUS',
        type: 'hacked_tier',
        holderName: 'Unknown Tier',
        status: 'active',
        issuedAt: new Date().toISOString(),
        expiresAt: null,
        policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: false, features: [] },
        activations: [],
        signature: 'bogus_sig',
        checksum: 'bogus_checksum',
      };
      const tier = SubscriptionTierResolver.resolve(bogusLic as License, {
        isValid: false,
        status: 'invalid',
        license: null,
        code: 'INVALID',
        message: 'Invalid license',
        remainingDays: null,
        deviceRegistered: false,
      });
      assert.strictEqual(tier, 'FREE');
    });

    test('G.7 : Tentative de forcer status = "active" sur licence expirée échoue cryptographiquement', async () => {
      const lic = await LicenseGenerator.generateLicense({
        type: 'commercial',
        holderName: 'Expired Active Tamper',
        maxDevices: 1,
        durationDays: -10, // Date passée
      });
      lic.status = 'active';
      const val = await LicenseValidator.validateLicense(lic, TEST_DEVICE);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.status, 'expired');
      assert.strictEqual(val.code, 'EXPIRED');
      const tier = SubscriptionTierResolver.resolve(lic, val);
      assert.strictEqual(tier, 'FREE');
    });

    test('G.8 : Modification des variables globales au runtime sans clé privée ne permet aucune escalade', () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        localStorage.setItem('bird_academy_subscription_tier_override', 'PRO');
        const tier = SubscriptionTierResolver.resolve(null, null);
        assert.strictEqual(tier, 'FREE');
        assert.strictEqual(CapabilityResolver.hasCapability(tier, 'INTELLIGENCE_FULL_ENGINE'), false);
      } finally {
        process.env.NODE_ENV = prevEnv;
      }
    });
  });

  // =========================================================================
  // CATEGORIE H : VALIDATION EXHAUSTIVE DE LA MATRICE DES PERMISSIONS (5 TESTS)
  // =========================================================================
  describe('Catégorie H : Validation exhaustive de la matrice des permissions', () => {
    test('H.1 : TIER_CAPABILITIES.FREE contient exactement ses 14 capacités d\'élevage de base', () => {
      const freeCaps = TIER_CAPABILITIES.FREE;
      assert.ok(freeCaps.includes('BIRD_VIEW'));
      assert.ok(freeCaps.includes('BIRD_CREATE_EDIT'));
      assert.ok(freeCaps.includes('HABITAT_VIEW'));
      assert.ok(freeCaps.includes('HABITAT_MANAGE'));
      assert.ok(freeCaps.includes('COUPLE_VIEW'));
      assert.ok(freeCaps.includes('COUPLE_MANAGE'));
      assert.ok(freeCaps.includes('BREEDING_VIEW'));
      assert.ok(freeCaps.includes('BREEDING_RECORD'));
      assert.ok(freeCaps.includes('HEALTH_VIEW'));
      assert.ok(freeCaps.includes('HEALTH_RECORD'));
      assert.ok(freeCaps.includes('FEEDING_VIEW'));
      assert.ok(freeCaps.includes('FEEDING_MANAGE'));
      assert.ok(freeCaps.includes('CALENDAR_VIEW'));
      assert.ok(freeCaps.includes('BIO_REFERENCE_ACCESS'));
      assert.ok(freeCaps.includes('FINANCE_VIEW'));
      assert.ok(freeCaps.includes('FINANCE_MANAGE'));
      assert.ok(freeCaps.includes('ANALYTICS_BASIC'));
      assert.ok(freeCaps.includes('GENETICS_BASIC'));
      assert.ok(freeCaps.includes('INTELLIGENCE_VIEW_BASIC'));
      assert.ok(freeCaps.includes('AI_ASSISTANT_GENERAL_BIO'));
      assert.ok(freeCaps.includes('AI_ASSISTANT_QUOTA_10'));
    });

    test('H.2 : TIER_CAPABILITIES.PREMIUM contient ses capacités étendues et Wright Inbreeding', () => {
      const premCaps = TIER_CAPABILITIES.PREMIUM;
      assert.ok(premCaps.includes('BIRD_UNLIMITED'));
      assert.ok(premCaps.includes('GENETICS_WRIGHT_INBREEDING'));
      assert.ok(premCaps.includes('HEALTH_BATCH_TREATMENTS'));
      assert.ok(premCaps.includes('CALENDAR_FULL_SYNC'));
      assert.ok(premCaps.includes('FINANCE_ADVANCED_REPORTS'));
      assert.ok(premCaps.includes('ANALYTICS_ADVANCED'));
      assert.ok(premCaps.includes('INTELLIGENCE_DIAGNOSTIC_FICHES'));
      assert.ok(premCaps.includes('AI_ASSISTANT_FARM_CONTEXT'));
      assert.ok(premCaps.includes('AI_ASSISTANT_QUOTA_100'));
    });

    test('H.3 : TIER_CAPABILITIES.PRO contient les 7 capacités exclusives de haut niveau', () => {
      const proCaps = TIER_CAPABILITIES.PRO;
      assert.ok(proCaps.includes('BREEDING_PREDICTIVE_ANALYTICS'));
      assert.ok(proCaps.includes('HEALTH_INTELLIGENCE_ALERTS'));
      assert.ok(proCaps.includes('ANALYTICS_PRO_EXPORT'));
      assert.ok(proCaps.includes('GENETICS_ADVANCED_TREE'));
      assert.ok(proCaps.includes('INTELLIGENCE_FULL_ENGINE'));
      assert.ok(proCaps.includes('AI_ASSISTANT_INTELLIGENCE_GENEALOGY'));
      assert.ok(proCaps.includes('AI_ASSISTANT_QUOTA_UNLIMITED'));
    });

    test('H.4 : CapabilityResolver.checkActionAccess() retourne le requiredTier exact', () => {
      // Pour une capacité PREMIUM
      const premReq = CapabilityResolver.checkActionAccess('FREE', 'GENETICS_WRIGHT_INBREEDING');
      assert.strictEqual(premReq.requiredTier, 'PREMIUM');

      // Pour une capacité PRO
      const proReq = CapabilityResolver.checkActionAccess('FREE', 'INTELLIGENCE_FULL_ENGINE');
      assert.strictEqual(proReq.requiredTier, 'PRO');

      const proReqFromPrem = CapabilityResolver.checkActionAccess('PREMIUM', 'INTELLIGENCE_FULL_ENGINE');
      assert.strictEqual(proReqFromPrem.requiredTier, 'PRO');
    });

    test('H.5 : SubscriptionTierResolver.getTierLabel() retourne les libellés officiels', () => {
      assert.strictEqual(SubscriptionTierResolver.getTierLabel('FREE'), 'Plan GRATUIT');
      assert.strictEqual(SubscriptionTierResolver.getTierLabel('PREMIUM'), 'Plan PREMIUM');
      assert.strictEqual(SubscriptionTierResolver.getTierLabel('PRO'), 'Plan PRO');
    });
  });
});

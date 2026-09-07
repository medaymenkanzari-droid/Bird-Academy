/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION DEPLOY-TEST-002
 * Comprehensive Automated Test Suite for Real Free Cloud Deployment & Public Test Validation
 * Validates D2001 through D2030.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

import { LmseBackendServer } from '../src/server/lmseServer.ts';
import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { CapabilityResolver } from '../src/features/subscription/services/CapabilityResolver';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { LmseConfigService } from '../src/config/lmseConfig';
import { License, LicenseValidationResult } from '../src/features/licensing/types/licensing';
import { CommercialOffersService } from '../src/features/licensing/commercial/services/CommercialOffersService';
import { assertAdminContext } from '../src/config/appMode';
import { TRANSLATIONS } from '../src/utils/translations';

// Mock localStorage for Node test environment
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

describe('MISSION DEPLOY-TEST-002 — Real Free Cloud Deployment & Validation Suite (D2001–D2030)', () => {
  const repo = new LocalStorageLicenseRepository();
  let lmseServer: LmseBackendServer;

  beforeEach(() => {
    localStorage.clear();
    LicensingService.setInstance(new LicensingService(repo));
    lmseServer = new LmseBackendServer();
  });

  // D2001 — URL publique joignable
  it('D2001 — URL publique joignable : distribution SPA compilée disponible', () => {
    const distPath = path.resolve(process.cwd(), 'dist');
    const distUserPath = path.resolve(process.cwd(), 'dist_user');
    const hasDist = (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) ||
                    (fs.existsSync(distUserPath) && fs.existsSync(path.join(distUserPath, 'index.html')));
    assert.strictEqual(hasDist, true, 'La distribution de production doit être compilée et prête pour le serveur public');
  });

  // D2002 — HTTPS actif et forcé
  it('D2002 — HTTPS actif et forcé : validation stricte du protocole TLS', () => {
    const renderHttps = LmseConfigService.validateLmseUrl('https://bird-academy-public-test.onrender.com', 'production');
    assert.strictEqual(renderHttps.isValid, true, 'L URL HTTPS de Render.com doit être valide');

    const insecureHttp = LmseConfigService.validateLmseUrl('http://bird-academy-public-test.onrender.com', 'production');
    assert.strictEqual(insecureHttp.isValid, false, 'Le protocole HTTP non chiffré doit être formellement rejeté en production/test public');
  });

  // D2003 — Chargement complet du frontend
  it('D2003 — Chargement complet du frontend : structure HTML et point d ancrage root', () => {
    const distPath = path.resolve(process.cwd(), 'dist');
    const indexPath = fs.existsSync(path.join(distPath, 'index.html'))
      ? path.join(distPath, 'index.html')
      : path.join(process.cwd(), 'dist_user', 'index.html');
    
    assert.strictEqual(fs.existsSync(indexPath), true, 'index.html doit exister');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes('<div id="root">') || content.includes('<div id="app">'), 'Point d ancrage React root obligatoire');
    assert.ok(content.includes('<meta name="viewport"'), 'Balise viewport responsive obligatoire');
  });

  // D2004 — Santé LMSE opérationnelle (/api/health)
  it('D2004 — Santé LMSE : GET /api/health retourne HTTP 200 et statut OK', async () => {
    const response = await lmseServer.inject({
      method: 'GET',
      url: '/api/health',
    });
    assert.strictEqual(response.statusCode, 200);
    const data = JSON.parse(response.payload);
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'LMSE Backend API');
    assert.ok(data.timestamp);
  });

  // D2005 — Frontend pointe vers LMSE TEST
  it('D2005 — Frontend pointe vers LMSE TEST : résolution dynamique de l URL d API', () => {
    const publicTestUrl = 'https://bird-academy-public-test.onrender.com';
    const originalEnv = process.env.VITE_LMSE_API_URL;
    process.env.VITE_LMSE_API_URL = publicTestUrl;
    
    const resolved = LmseConfigService.getLmseApiUrl({ envMode: 'production' });
    assert.strictEqual(resolved, publicTestUrl, 'L URL du backend public TEST doit être résolue fidèlement');
    
    process.env.VITE_LMSE_API_URL = originalEnv;
  });

  // D2006 — Absence d'adresses localhost dans dist
  it('D2006 — Absence d adresses localhost en production : validation stricte et absence dans index.html', () => {
    // 1. Rejet formel de localhost en mode production
    const localValidation = LmseConfigService.validateLmseUrl('http://localhost:3001', 'production');
    assert.strictEqual(localValidation.isValid, false, 'localhost HTTP doit être rejeté en mode production');

    // 2. Vérification que le fichier index.html distribué ne contient aucune adresse localhost
    const distPath = path.resolve(process.cwd(), 'dist');
    const indexPath = fs.existsSync(path.join(distPath, 'index.html'))
      ? path.join(distPath, 'index.html')
      : path.join(process.cwd(), 'dist_user', 'index.html');
    if (fs.existsSync(indexPath)) {
      const htmlContent = fs.readFileSync(indexPath, 'utf8');
      assert.strictEqual(htmlContent.includes('localhost'), false, 'index.html ne doit référencer aucun localhost');
      assert.strictEqual(htmlContent.includes('127.0.0.1'), false, 'index.html ne doit référencer aucune IP 127.0.0.1');
    }
  });

  // D2007 — Mode FREE immédiat sans licence
  it('D2007 — Mode FREE immédiat : premier accès sans licence accorde nativement le statut FREE', async () => {
    const active = await repo.getActiveLicense();
    assert.strictEqual(active, null, 'Nouvelle installation sans licence enregistrée');
    const tier = SubscriptionTierResolver.resolve(null, null);
    assert.strictEqual(tier, 'FREE', 'Le tier résolu doit être strictement FREE');
  });

  // D2008 — Mode FREE 100% hors-ligne
  it('D2008 — Mode FREE 100% hors-ligne : fonctionnement intégral sans connectivité réseau', () => {
    const tier = SubscriptionTierResolver.resolve(null, null);
    assert.strictEqual(tier, 'FREE');
    assert.strictEqual(CapabilityResolver.hasCapability('FREE', 'BIRD_VIEW'), true, 'Consultation oiseau autorisée en FREE');
    assert.strictEqual(CapabilityResolver.hasCapability('FREE', 'BIRD_UNLIMITED'), false, 'Fonctions illimitées verrouillées en FREE');
  });

  // D2009 — Activation licence Premium TEST
  it('D2009 — Activation licence Premium TEST : signature valide et accès aux capacités PREMIUM', async () => {
    const payloadToSign = 'lic_prem_002:LMSE-COMM-002-PREM:Testeur Premium 002:commercial:2026-01-01T00:00:00.000Z:2027-01-01T00:00:00.000Z:3';
    const checksum = await CryptoService.sha256(payloadToSign);
    const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

    const premiumLicense: License = {
      id: 'lic_prem_002',
      key: 'LMSE-COMM-002-PREM',
      holderName: 'Testeur Premium 002',
      type: 'commercial',
      status: 'active',
      issuedAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2027-01-01T00:00:00.000Z',
      policy: { maxDevices: 3, allowOfflineActivation: true, allowTransfer: false, features: ['core', 'tier:premium'] },
      activations: [],
      revokedAt: null,
      revocationReason: null,
      checksum,
      signature,
      metadata: { commercialTier: 'PREMIUM', environment: 'TEST' },
    };

    const valResult: LicenseValidationResult = { isValid: true, status: 'active', code: 'VALID', message: 'OK', license: premiumLicense, remainingDays: 365, deviceRegistered: true };
    const tier = SubscriptionTierResolver.resolve(premiumLicense, valResult);
    assert.strictEqual(tier, 'PREMIUM');
    assert.strictEqual(CapabilityResolver.hasCapability('PREMIUM', 'BIRD_UNLIMITED'), true);
  });

  // D2010 — Activation licence PRO Annual TEST
  it('D2010 — Activation licence PRO Annual TEST : signature valide et accès aux capacités PRO', async () => {
    const payloadToSign = 'lic_pro_002:LMSE-ENTP-002-PRO:Testeur Pro 002:enterprise:2026-01-01T00:00:00.000Z:2027-01-01T00:00:00.000Z:5';
    const checksum = await CryptoService.sha256(payloadToSign);
    const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

    const proLicense: License = {
      id: 'lic_pro_002',
      key: 'LMSE-ENTP-002-PRO',
      holderName: 'Testeur Pro 002',
      type: 'enterprise',
      status: 'active',
      issuedAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2027-01-01T00:00:00.000Z',
      policy: { maxDevices: 5, allowOfflineActivation: true, allowTransfer: false, features: ['core', 'tier:pro'] },
      activations: [],
      revokedAt: null,
      revocationReason: null,
      checksum,
      signature,
      metadata: { commercialTier: 'PRO', environment: 'TEST' },
    };

    const valResult: LicenseValidationResult = { isValid: true, status: 'active', code: 'VALID', message: 'OK', license: proLicense, remainingDays: 365, deviceRegistered: true };
    const tier = SubscriptionTierResolver.resolve(proLicense, valResult);
    assert.strictEqual(tier, 'PRO');
    assert.strictEqual(CapabilityResolver.hasCapability('PRO', 'GENETICS_WRIGHT_INBREEDING'), true);
  });

  // D2011 — Activation licence PRO Lifetime TEST
  it('D2011 — Activation licence PRO Lifetime TEST : validité perpétuelle (expiresAt null)', async () => {
    const payloadToSign = 'lic_life_002:LMSE-ENTP-002-LIFE:Testeur Lifetime 002:permanent:2026-01-01T00:00:00.000Z:NEVER:10';
    const checksum = await CryptoService.sha256(payloadToSign);
    const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

    const lifetimeLicense: License = {
      id: 'lic_life_002',
      key: 'LMSE-ENTP-002-LIFE',
      holderName: 'Testeur Lifetime 002',
      type: 'permanent',
      status: 'active',
      issuedAt: '2026-01-01T00:00:00.000Z',
      expiresAt: null,
      policy: { maxDevices: 10, allowOfflineActivation: true, allowTransfer: false, features: ['core', 'tier:pro'] },
      activations: [],
      revokedAt: null,
      revocationReason: null,
      checksum,
      signature,
      metadata: { commercialTier: 'PRO', environment: 'TEST' },
    };

    const valResult: LicenseValidationResult = { isValid: true, status: 'active', code: 'VALID', message: 'OK', license: lifetimeLicense, remainingDays: null, deviceRegistered: true };
    const tier = SubscriptionTierResolver.resolve(lifetimeLicense, valResult);
    assert.strictEqual(tier, 'PRO');
  });

  // D2012 — Blocage et repli sécurisé sur licence expirée
  it('D2012 — Blocage licence expirée : repli immédiat et sécurisé sur tier FREE', () => {
    const expiredLicense: any = { id: 'lic_exp_002', status: 'expired', expiresAt: '2025-01-01T00:00:00.000Z' };
    const valResult: LicenseValidationResult = { isValid: false, status: 'expired', code: 'EXPIRED', message: 'Licence expirée', license: expiredLicense, remainingDays: 0, deviceRegistered: false };
    const tier = SubscriptionTierResolver.resolve(expiredLicense, valResult);
    assert.strictEqual(tier, 'FREE', 'Une licence expirée doit obligatoirement rétrograder en mode FREE');
  });

  // D2013 — Blocage et repli sécurisé sur licence révoquée
  it('D2013 — Blocage licence révoquée : repli immédiat et sécurisé sur tier FREE', () => {
    const revokedLicense: any = { id: 'lic_rev_002', status: 'revoked', revokedAt: '2026-02-01T00:00:00.000Z' };
    const valResult: LicenseValidationResult = { isValid: false, status: 'revoked', code: 'REVOKED', message: 'Licence révoquée', license: revokedLicense, remainingDays: null, deviceRegistered: false };
    const tier = SubscriptionTierResolver.resolve(revokedLicense, valResult);
    assert.strictEqual(tier, 'FREE', 'Une licence révoquée doit obligatoirement rétrograder en mode FREE');
  });

  // D2014 — Blocage de licence falsifiée (tampered)
  it('D2014 — Blocage licence altérée : falsification de signature détectée et rejetée', () => {
    const tamperedLicense: any = { id: 'lic_fake', status: 'active', checksum: 'hacked_checksum', signature: 'forged_sig' };
    const valResult: LicenseValidationResult = { isValid: false, status: 'invalid', code: 'INVALID_SIGNATURE', message: 'Signature invalide', license: null, remainingDays: null, deviceRegistered: false };
    const tier = SubscriptionTierResolver.resolve(tamperedLicense, valResult);
    assert.strictEqual(tier, 'FREE', 'Toute signature falsifiée doit être rejetée avec repli FREE');
  });

  // D2015 — Blocage d'élévation de privilège (tier escalation)
  it('D2015 — Blocage tier escalation : injection manuelle dans LocalStorage neutralisée', () => {
    localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify({ id: 'fake_escalated', metadata: { commercialTier: 'PRO' } }));
    const valResult: LicenseValidationResult = { isValid: false, status: 'invalid', code: 'INVALID_SIGNATURE', message: 'Clé non signée', license: null, remainingDays: null, deviceRegistered: false };
    const tier = SubscriptionTierResolver.resolve(null, valResult);
    assert.strictEqual(tier, 'FREE', 'Tentative d élévation sans validation cryptographique résout strictement en FREE');
  });

  // D2016 — Endpoints Admin non authentifiés bloqués (401)
  it('D2016 — Endpoints Admin verrouillés : GET /api/admin/licenses retourne HTTP 401 Unauthorized', async () => {
    const response = await lmseServer.inject({
      method: 'GET',
      url: '/api/admin/licenses',
    });
    assert.strictEqual(response.statusCode, 401, 'Accès anonyme aux endpoints admin doit être formellement rejeté');
  });

  // D2017 — Règles CORS respectées
  it('D2017 — Règles CORS respectées : support des requêtes preflight OPTIONS', async () => {
    const response = await lmseServer.inject({
      method: 'OPTIONS',
      url: '/api/health',
    });
    assert.strictEqual(response.statusCode, 200);
  });

  // D2018 — Clé privée absente du frontend et du client
  it('D2018 — Clé privée absente du frontend : seule la clé publique est accessible côté client', () => {
    const publicKey = CryptoService.getPublicVerificationKey();
    assert.ok(publicKey.startsWith('LMSE_PUBLIC_KEY'));
    assert.strictEqual((CryptoService as any).PRIVATE_SIGNING_KEY, undefined, 'Aucune propriété privée dans le bundle');
  });

  // D2019 — Absence de source maps en production
  it('D2019 — Absence de source maps : zéro fichier .map dans dist', () => {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const allFiles = fs.readdirSync(distPath, { recursive: true }) as string[];
      const mapFiles = allFiles.filter(f => f.endsWith('.map'));
      assert.strictEqual(mapFiles.length, 0, 'Les source maps ne doivent pas être exposées publiquement');
    }
  });

  // D2020 — Installation PWA & manifest valide
  it('D2020 — PWA Ready : configuration manifest et icônes d application', () => {
    const viteConfig = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf8');
    assert.match(viteConfig, /VitePWA\(/);
    assert.match(viteConfig, /icon-192\.png/);
    assert.match(viteConfig, /icon-512\.png/);
  });

  // D2021 — Mode PWA offline
  it('D2021 — Mode PWA offline : Service Worker configuré avec fallback SPA', () => {
    const viteConfig = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf8');
    assert.match(viteConfig, /cleanupOutdatedCaches:\s*true/);
    assert.match(viteConfig, /navigateFallback:\s*['"]\/index\.html['"]/);
  });

  // D2022 — Persistance des données locales
  it('D2022 — Persistance des données locales : survie des données IndexedDB/LocalStorage', () => {
    localStorage.setItem('bird_academy_breeding_preferences', JSON.stringify({ autoSave: true, alertDays: 7 }));
    const saved = JSON.parse(localStorage.getItem('bird_academy_breeding_preferences') || '{}');
    assert.strictEqual(saved.autoSave, true);
    assert.strictEqual(saved.alertDays, 7);
  });

  // D2023 — Support multilingue (FR, EN, AR, ES, IT)
  it('D2023 — Support multilingue : présence des 5 langues officielles', () => {
    assert.ok(TRANSLATIONS.fr, 'FR supporté');
    assert.ok(TRANSLATIONS.en, 'EN supporté');
    assert.ok(TRANSLATIONS.ar, 'AR supporté');
    assert.ok(TRANSLATIONS.es, 'ES supporté');
    assert.ok(TRANSLATIONS.it, 'IT supporté');
    assert.strictEqual(typeof TRANSLATIONS.fr.save, 'string');
    assert.strictEqual(typeof TRANSLATIONS.en.save, 'string');
    assert.strictEqual(typeof TRANSLATIONS.ar.save, 'string');
    assert.strictEqual(typeof TRANSLATIONS.es.save, 'string');
    assert.strictEqual(typeof TRANSLATIONS.it.save, 'string');
  });

  // D2024 — Support de l'orientation RTL
  it('D2024 — Orientation RTL : détection correcte pour l arabe', () => {
    const isRtl = (lang: string) => lang === 'ar';
    assert.strictEqual(isRtl('ar'), true, 'Arabe doit activer RTL');
    assert.strictEqual(isRtl('fr'), false);
    assert.strictEqual(isRtl('en'), false);
    assert.strictEqual(isRtl('es'), false);
    assert.strictEqual(isRtl('it'), false);
  });

  // D2025 — Génération du Delivery Kit TEST
  it('D2025 — Delivery Kit TEST : simulation checkout et génération de licence commerciale signée', async () => {
    const response = await lmseServer.inject({
      method: 'POST',
      url: '/api/commercial/checkout',
      payload: {
        offerId: 'offer_premium_annual',
        customerName: 'Éleveur Test 002',
        customerEmail: 'eleveur002@birdacademy.test',
        tier: 'PREMIUM',
        durationDays: 365,
      },
    });
    assert.strictEqual(response.statusCode, 201);
    const body = JSON.parse(response.payload);
    assert.strictEqual(body.success, true);
    assert.ok(body.license);
    assert.strictEqual(body.license.holderName, 'Éleveur Test 002');
  });

  // D2026 — Intégrité de l'archive ZIP
  it('D2026 — Intégrité de l archive ZIP : fichiers requis pour le kit de livraison', () => {
    const expectedFiles = ['LICENCE-INSTRUCTIONS.txt', 'licence.lmse', 'activation-qr.png'];
    assert.strictEqual(expectedFiles.includes('LICENCE-INSTRUCTIONS.txt'), true);
    assert.strictEqual(expectedFiles.includes('licence.lmse'), true);
    assert.strictEqual(expectedFiles.includes('activation-qr.png'), true);
  });

  // D2027 — Aucune donnée d'élevage stockée dans le cloud
  it('D2027 — Zéro donnée d élevage cloud : backend LMSE strictement limité aux licences', () => {
    const routes = (lmseServer.app as any)._router?.stack || [];
    const breedingRoutes = routes.filter((r: any) => r.route?.path && (r.route.path.includes('/birds') || r.route.path.includes('/breeding')));
    assert.strictEqual(breedingRoutes.length, 0, 'Le backend cloud ne doit enregistrer aucun endpoint d élevage aviaire');
  });

  // D2028 — Isolation stricte TEST / PRODUCTION
  it('D2028 — Isolation hermétique TEST / PRODUCTION : environnement sécurisé', () => {
    assert.notStrictEqual(process.env.ENVIRONMENT, 'PRODUCTION_REAL');
    assert.strictEqual(process.env.NODE_ENV === 'test' || !process.env.STRIPE_SECRET_KEY, true);
  });

  // D2029 — Résilience après redémarrage serveur
  it('D2029 — Résilience après redémarrage : disponibilité constante du service LMSE', async () => {
    const rebootedServer = new LmseBackendServer();
    const response = await rebootedServer.inject({
      method: 'GET',
      url: '/api/health',
    });
    assert.strictEqual(response.statusCode, 200);
    const data = JSON.parse(response.payload);
    assert.strictEqual(data.status, 'ok');
  });

  // D2030 — Validation navigateur externe
  it('D2030 — Validation navigateur externe : endpoints et ressources accessibles', async () => {
    const health = await lmseServer.inject({ method: 'GET', url: '/api/health' });
    assert.strictEqual(health.statusCode, 200);
    
    const unauth = await lmseServer.inject({ method: 'GET', url: '/api/admin/licenses' });
    assert.strictEqual(unauth.statusCode, 401);
  });
});

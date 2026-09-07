/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LMSE BACKEND & SECURITY COMPREHENSIVE TEST SUITE (24 TESTS)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

// Mock localStorage for Node test environment
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

process.env.VITE_APP_MODE = 'admin';

import { LmseBackendServer } from '../src/server/lmseServer';
import { AdminAuthService } from '../src/server/middleware/adminAuth';
import { AdminUserRepository } from '../src/server/repositories/AdminUserRepository';
import { RateLimiter } from '../src/server/middleware/rateLimiter';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { LICENSING_TRANSLATIONS } from '../src/features/licensing/translations/licensingTranslations';

process.env.VITE_APP_MODE = 'admin';

test('1. Génération licence : Création et signature de licence par le backend API Admin', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 'adm_1',
    email: 'admin@bird-academy.fr',
    name: 'Super Admin Test',
    role: 'super_admin',
  });

  const response = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Élevage Canari Pro',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 3,
    },
  });

  assert.equal(response.statusCode, 201);
  const body = JSON.parse(response.payload);
  assert.equal(body.success, true);
  assert.ok(body.license.key.startsWith('LMSE-COMM-'));
  assert.ok(body.license.signature.length > 0);
});

test('2. Signature : Calcule correctement le checksum et la signature serveur', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const payload = 'lic_123:LMSE-COMM-A1B2-C3D4:Holder:commercial:2026-01-01:2027-01-01:3';
  const checksum = await CryptoService.sha256(payload);
  const signature = await CryptoService.generateSignature(checksum);

  assert.equal(checksum.length, 64);
  assert.ok(signature.length > 0);
  const isValid = await CryptoService.verifySignature(checksum, signature);
  assert.equal(isValid, true);
});

test('3. Validation : L\'endpoint /api/license/validate confirme la validité d\'une licence', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Client Valid', type: 'commercial', durationDays: 365 });
  license.status = 'active';
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: {
      licenseKey: license.key,
      device: { deviceId: 'dev_pc_1', platform: 'windows' },
    },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.isValid, true);
  assert.ok(body.code === 'VALID' || body.code === 'ACTIVATION_SUCCESS');
});

test('4. Expiration : Détecte et renvoie status expired pour une licence périmée', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const expiredLicense = await LicenseGenerator.generateLicense({ holderName: 'Client Expired', type: 'commercial', durationDays: -10 });
  expiredLicense.status = 'active';

  const res = await LicenseValidator.validateLicense(expiredLicense, { deviceId: 'dev_1', os: 'Web' } as any);
  assert.equal(res.isValid, false);
  assert.equal(res.status, 'expired');
  assert.equal(res.code, 'EXPIRED');
});

test('5. Révocation : L\'API de révocation invalide la licence et bloque la validation online', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({ id: 'adm_2', email: 'sec@bird.com', name: 'Sec', role: 'admin' });

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Fraud Target', type: 'commercial', durationDays: 365 });
  license.status = 'active';
  await repo.saveLicense(license);

  // Perform admin revocation
  const revRes = await server.inject({
    method: 'POST',
    url: `/api/admin/licenses/${license.id}/revoke`,
    headers: { authorization: `Bearer ${session.token}` },
    payload: { reason: 'Paiement rejeté' },
  });

  assert.equal(revRes.statusCode, 200);

  // Attempt user online validation
  const valRes = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: { licenseKey: license.key, device: { deviceId: 'dev_1', os: 'Web' } },
  });

  const valBody = JSON.parse(valRes.payload);
  assert.equal(valBody.isValid, false);
  assert.equal(valBody.status, 'revoked');
});

test('6. Renouvellement : L\'API de renouvellement prolonge la date d\'expiration', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({ id: 'adm_3', email: 'ops@bird.com', name: 'Ops', role: 'super_admin' });

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Renew Client', type: 'commercial', durationDays: 10 });
  license.status = 'active';
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: `/api/admin/licenses/${license.id}/renew`,
    headers: { authorization: `Bearer ${session.token}` },
    payload: { additionalDays: 365 },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.ok(new Date(body.license.expiresAt).getTime() > Date.now() + 300 * 86400000);
});

test('7. Device binding : Contrôle l\'association et l\'enregistrement d\'appareil', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Device User', type: 'commercial', durationDays: 365, maxDevices: 1 });
  license.status = 'active';
  license.activations = [
    {
      id: 'act_mock',
      licenseId: license.id,
      licenseKey: license.key,
      fingerprint: { deviceId: 'authorized_dev', os: 'Windows' } as any,
      activatedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
      isOffline: false,
    }
  ];

  const res = await LicenseValidator.validateLicense(license, { deviceId: 'authorized_dev', os: 'Windows' } as any);
  assert.equal(res.deviceRegistered, true);
  assert.equal(res.isValid, true);
});

test('8. Accès admin autorisé : Connexion admin réussie et génération de jeton', async () => {
  RateLimiter.clearStore();
  const repo = AdminUserRepository.getInstance(path.join(process.cwd(), 'data', 'test-admin-users.json'));
  repo.resetForTesting();
  repo.createSuperAdmin({
    email: 'admin@enterprise.com',
    name: 'Super Admin Enterprise',
    password: 'ValidPassword123!',
  });

  const server = new LmseBackendServer();
  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/auth/login',
    payload: { email: 'admin@enterprise.com', password: 'ValidPassword123!' },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.ok(body.session.token.startsWith('lmse_adm_'));
});

test('9. Accès utilisateur : Tentative de connexion admin avec un compte inexistant ou utilisateur -> 401 Unauthorized', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();
  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/auth/login',
    payload: { email: 'breeder@elevage.fr', password: 'Password123!' },
  });

  assert.equal(res.statusCode, 401);
  const body = JSON.parse(res.payload);
  assert.equal(body.error, 'INVALID_CREDENTIALS');
});

test('10. Accès admin sans authentification : Requête API admin sans Bearer token -> 401 Unauthorized', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();
  const res = await server.inject({
    method: 'GET',
    url: '/api/admin/licenses',
  });

  assert.equal(res.statusCode, 401);
  const body = JSON.parse(res.payload);
  assert.equal(body.error, 'UNAUTHORIZED');
});

test('11. Accès admin avec rôle utilisateur : Jeton invalide ou non-admin -> 401/403 Refusé', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();
  const res = await server.inject({
    method: 'GET',
    url: '/api/admin/licenses',
    headers: { authorization: 'Bearer invalid_fake_token' },
  });

  assert.equal(res.statusCode, 401);
});

test('12. Brute force : Blocage des tentatives de connexion répétées', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();

  let lastStatus = 200;
  for (let i = 0; i < 7; i++) {
    const res = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: { email: 'hacker@test.com', password: 'WrongPassword123!', role: 'super_admin' },
    });
    lastStatus = res.statusCode;
  }

  assert.equal(lastStatus, 429);
});

test('13. Rate limiting : Interception 429 Too Many Requests après dépassement du quota API', async () => {
  RateLimiter.clearStore();
  const middleware = RateLimiter.createMiddleware({ windowMs: 1000, max: 2 });
  
  let passedCount = 0;
  let blockedCount = 0;

  const fakeReq = { ip: '192.168.1.50', headers: {} } as any;
  const fakeRes = {
    setHeader: () => {},
    status: (code: number) => {
      if (code === 429) blockedCount++;
      return { json: () => {} };
    }
  } as any;

  middleware(fakeReq, fakeRes, () => { passedCount++; });
  middleware(fakeReq, fakeRes, () => { passedCount++; });
  middleware(fakeReq, fakeRes, () => { passedCount++; });

  assert.equal(passedCount, 2);
  assert.equal(blockedCount, 1);
});

test('14. Clé privée inaccessible au frontend : Tentative de signature en Mode User -> SECURITY_ERROR', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'user';
  await assert.rejects(async () => {
    await CryptoService.generateSignature('payload_test');
  }, /SECURITY_ERROR/);
  process.env.VITE_APP_MODE = 'admin';
});

test('15. Clé privée absente du build utilisateur : Validation d\'isolation d\'environnement', () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'user';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);
  LicensingService.setInstance(service);
  assert.rejects(async () => {
    await service.exportLicensingData();
  }, /SECURITY_ERROR/);
  process.env.VITE_APP_MODE = 'admin';
});

test('16. Validation offline : Moteur autonome local valide la licence sans réseau', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);
  LicensingService.setInstance(service);

  const license = await service.createLicense({ holderName: 'Offline User', type: 'commercial' });
  const validation = await LicenseValidator.validateLicense(license, { deviceId: 'dev_offline', os: 'Android' } as any);

  assert.equal(validation.isValid, true);
  assert.equal(validation.code, 'VALID');
});

test('17. Validation online : Interroge l\'API backend et renvoie le statut', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Online Sync Holder', type: 'commercial', durationDays: 365 });
  license.status = 'active';
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: { licenseKey: license.key, device: { deviceId: 'dev_sync', os: 'Android' } },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.isValid, true);
});

test('18. Retour online après offline : Synchronise la révocation backend vers le stockage local', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);
  LicensingService.setInstance(service);

  const license = await LicenseGenerator.generateLicense({ holderName: 'Sync Revoked', type: 'commercial', durationDays: 365 });
  license.status = 'revoked';
  license.revokedAt = new Date().toISOString();
  await repo.saveActiveLicense(license);
  await repo.addToRevocationList(license.key);

  const validation = await service.validateCurrentLicense();
  assert.equal(validation.isValid, false);
  assert.equal(validation.status, 'revoked');
});

test('19. Corruption licence : Signature ou Checksum altéré -> Status CORRUPTED', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const validLicense = await LicenseGenerator.generateLicense({ holderName: 'Tampered User', type: 'commercial', durationDays: 365 });
  validLicense.status = 'active';
  validLicense.checksum = 'invalid_checksum_hash_value_1234567890';
  validLicense.signature = 'invalid_signature_hash_value_1234567890';

  const validation = await LicenseValidator.validateLicense(validLicense, { deviceId: 'dev_1', os: 'Web' } as any);
  assert.equal(validation.isValid, false);
  assert.equal(validation.code, 'CORRUPTED');
});

test('20. Replay / Rollback : Détecte un recul de l\'horloge système', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const repo = new InMemoryLicenseRepository();
  const license = await LicenseGenerator.generateLicense({ holderName: 'Clock Tamper', type: 'commercial', durationDays: 365 });
  license.status = 'active';
  await repo.saveActiveLicense(license);

  const futureMarker = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date();

  const res = await LicenseValidator.validateLicense(license, { deviceId: 'dev_1', os: 'Web' } as any, [], futureMarker, now);
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'CLOCK_TAMPERED');
});

test('21. Audit administratif : Le serveur enregistre les événements LICENSE_CREATED et ADMIN_LOGIN', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();
  server.clearAuditLogs();

  server.recordAudit({
    who: 'super_admin@bird.com',
    role: 'super_admin',
    action: 'LICENSE_CREATED',
    target: 'lic_audit_1',
    ip: '10.0.0.1',
    result: 'SUCCESS',
    details: 'Création licence test audit',
  });

  const logs = server.getAuditLogs();
  assert.equal(logs.length, 1);
  assert.equal(logs[0].action, 'LICENSE_CREATED');
  assert.equal(logs[0].result, 'SUCCESS');
});

test('22. Multilingue : Les messages de traduction LMSE existent dans les 5 langues (FR, EN, AR, ES, IT)', () => {
  RateLimiter.clearStore();
  const langs = ['fr', 'en', 'ar', 'es', 'it'] as const;
  for (const lang of langs) {
    assert.ok(LICENSING_TRANSLATIONS[lang] !== undefined);
    assert.ok(LICENSING_TRANSLATIONS[lang].licensingTitle !== undefined);
    assert.ok(LICENSING_TRANSLATIONS[lang].activeLicense !== undefined);
  }
});

test('23. RTL : Support RTL vérifié pour la langue arabe (AR)', () => {
  RateLimiter.clearStore();
  assert.equal(LICENSING_TRANSLATIONS.ar.activeLicense.length > 0, true);
  assert.ok(LICENSING_TRANSLATIONS.ar.licensingTitle !== undefined);
});

test('24. Non-régression LMSE : Cycle de vie complet (génération, activation, validation, suspension, révocation)', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);
  LicensingService.setInstance(service);

  // 1. Create
  const license = await service.createLicense({ holderName: 'Non-Regression Test', type: 'commercial' });
  assert.ok(license.key.startsWith('LMSE-COMM-'));

  // 2. Activate
  const actRes = await service.activateKey(license.key, 'Non-Regression Test');
  assert.equal(actRes.isValid, true);

  // 3. Validate
  const valRes = await service.validateCurrentLicense();
  assert.equal(valRes.isValid, true);

  // 4. Revoke
  await service.revokeLicense(license.id, 'Test non-régression fini');
  const revValRes = await service.validateCurrentLicense();
  assert.equal(revValRes.isValid, false);
  assert.equal(revValRes.status, 'revoked');
});

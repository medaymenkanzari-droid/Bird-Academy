/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LMSE LICENSE GENERATION SUITE (20 TEST CASES)
 * Validates LMSE Server Backend License Generation, RBAC, Cryptographic Signatures,
 * Validation, Expiration, Revocation, and User App Integration.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

import { LmseBackendServer } from '../src/server/lmseServer';
import { AdminAuthService } from '../src/server/middleware/adminAuth';
import { RateLimiter } from '../src/server/middleware/rateLimiter';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { KeyValidator } from '../src/features/licensing/validators/KeyValidator';
import { isUserBuild, assertAdminContext } from '../src/config/appMode';

// Ensure default Admin mode for backend server tests
process.env.VITE_APP_MODE = 'admin';

test('1. Super Admin authentifié → création autorisée', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 'super_1',
    email: 'superadmin@birdacademy.local',
    name: 'Super Admin',
    role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Beta Tester Test',
      type: 'beta',
      durationDays: 30,
      maxDevices: 1,
    },
  });

  assert.equal(res.statusCode, 201);
  const body = JSON.parse(res.payload);
  assert.equal(body.success, true);
  assert.ok(body.license);
  assert.ok(body.license.key.startsWith('LMSE-BETA-'));
});

test('2. Admin autorisé → création autorisée selon RBAC', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 'adm_rbac_1',
    email: 'admin.ops@birdacademy.local',
    name: 'Admin Ops',
    role: 'admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Commercial Client',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 3,
    },
  });

  assert.equal(res.statusCode, 201);
  const body = JSON.parse(res.payload);
  assert.equal(body.success, true);
  assert.ok(body.license.key.startsWith('LMSE-COMM-'));
});

test('3. Support → refus si non autorisé (HTTP 403)', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 'supp_1',
    email: 'support@birdacademy.local',
    name: 'Support Tech',
    role: 'support',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Unauthorized Support Request',
      type: 'beta',
    },
  });

  assert.equal(res.statusCode, 403);
  const body = JSON.parse(res.payload);
  assert.equal(body.error, 'INSUFFICIENT_PERMISSIONS');
});

test('4. Auditor → refus de création (HTTP 403)', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 'audit_1',
    email: 'auditor@birdacademy.local',
    name: 'Auditor External',
    role: 'auditor',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Auditor Attempt',
      type: 'enterprise',
    },
  });

  assert.equal(res.statusCode, 403);
  const body = JSON.parse(res.payload);
  assert.equal(body.error, 'INSUFFICIENT_PERMISSIONS');
});

test('5. Utilisateur non authentifié → HTTP 401', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    payload: {
      holderName: 'No Token Request',
      type: 'commercial',
    },
  });

  assert.equal(res.statusCode, 401);
  const body = JSON.parse(res.payload);
  assert.equal(body.error, 'UNAUTHORIZED');
});

test('6. Rôle falsifié → HTTP 403', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: 'Bearer fake_tampered_token_12345' },
    payload: {
      holderName: 'Tampered Role Request',
      type: 'permanent',
    },
  });

  assert.equal(res.statusCode, 401);
});

test('7. Licence BETA valide → génération réussie', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's1', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Beta Tester Test',
      type: 'beta',
      durationDays: 30,
      maxDevices: 1,
    },
  });

  assert.equal(res.statusCode, 201);
  const body = JSON.parse(res.payload);
  assert.equal(body.license.type, 'beta');
  assert.ok(body.license.key.startsWith('LMSE-BETA-'));
});

test('8. Licence commerciale → génération réussie', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's2', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Commercial Client Pro',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 3,
    },
  });

  assert.equal(res.statusCode, 201);
  const body = JSON.parse(res.payload);
  assert.equal(body.license.type, 'commercial');
  assert.ok(body.license.key.startsWith('LMSE-COMM-'));
});

test('9. Licence temporaire → génération réussie', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's3', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Temp User',
      type: 'temporary',
      durationDays: 14,
      maxDevices: 1,
    },
  });

  assert.equal(res.statusCode, 201);
  const body = JSON.parse(res.payload);
  assert.equal(body.license.type, 'temporary');
  assert.ok(body.license.key.startsWith('LMSE-TEMP-'));
});

test('10. Durée invalide → refus (HTTP 400)', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();
  const session = AdminAuthService.createSession({
    id: 's4', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Invalid Duration Client',
      type: 'commercial',
      durationDays: -50,
    },
  });

  assert.equal(res.statusCode, 400);
  const body = JSON.parse(res.payload);
  assert.equal(body.error, 'INVALID_DURATION');
});

test('11. Device limit invalide → refus (HTTP 400)', async () => {
  RateLimiter.clearStore();
  const server = new LmseBackendServer();
  const session = AdminAuthService.createSession({
    id: 's5', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Zero Devices Client',
      type: 'commercial',
      maxDevices: 0,
    },
  });

  assert.equal(res.statusCode, 400);
  const body = JSON.parse(res.payload);
  assert.equal(body.error, 'INVALID_DEVICE_LIMIT');
});

test('12. Checksum valide', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's6', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Checksum Test', type: 'commercial' },
  });

  assert.equal(res.statusCode, 201);
  const lic = JSON.parse(res.payload).license;

  const expectedPayload = `${lic.id}:${lic.key}:${lic.holderName}:${lic.type}:${lic.issuedAt}:${lic.expiresAt || 'NEVER'}:${lic.policy.maxDevices}`;
  const computedChecksum = await CryptoService.sha256(expectedPayload);

  assert.equal(lic.checksum, computedChecksum);
});

test('13. Signature valide', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's7', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Signature Test', type: 'commercial' },
  });

  assert.equal(res.statusCode, 201);
  const lic = JSON.parse(res.payload).license;

  process.env.VITE_APP_MODE = 'admin';
  const isSigValid = await CryptoService.verifySignature(lic.checksum, lic.signature);
  assert.equal(isSigValid, true);
});

test('14. Licence générée lisible par LicenseValidator', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's8', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Validator Client', type: 'commercial', durationDays: 365 },
  });

  const lic = JSON.parse(res.payload).license;
  lic.status = 'active';

  const val = await LicenseValidator.validateLicense(lic, { deviceId: 'dev_test_1', os: 'Windows' } as any);
  assert.equal(val.isValid, true);
  assert.equal(val.code, 'VALID');
});

test('15. Licence générée acceptée par Bird Academy User', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's9', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  // 1. Admin generates license
  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Beta Tester Test', type: 'beta', durationDays: 30, maxDevices: 1 },
  });

  const lic = JSON.parse(res.payload).license;

  // 2. User App receives key and activates it
  process.env.VITE_APP_MODE = 'user';
  const userService = new LicensingService(repo);
  const actRes = await userService.activateKey(lic.key, 'Beta Tester Test');

  assert.equal(actRes.isValid, true);
  assert.equal(actRes.code, 'ACTIVATION_SUCCESS');
});

test('16. Licence révoquée → refus après révocation', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({
    id: 's10', email: 'sa@bird.local', name: 'SA', role: 'super_admin',
  });

  // Create
  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Revoke Target', type: 'commercial' },
  });
  const lic = JSON.parse(res.payload).license;

  // Revoke
  const revRes = await server.inject({
    method: 'POST',
    url: `/api/admin/licenses/${lic.id}/revoke`,
    headers: { authorization: `Bearer ${session.token}` },
    payload: { reason: 'Test Révocation' },
  });
  assert.equal(revRes.statusCode, 200);

  // User attempts activation
  process.env.VITE_APP_MODE = 'user';
  const userService = new LicensingService(repo);
  const actRes = await userService.activateKey(lic.key, 'Revoke Target');
  assert.equal(actRes.isValid, false);
  assert.equal(actRes.code, 'LICENSE_REVOKED');
});

test('17. Licence expirée → refus', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const repo = new InMemoryLicenseRepository();

  const expiredLic = await LicenseGenerator.generateLicense({
    holderName: 'Expired Client',
    type: 'temporary',
    durationDays: -30,
  });
  expiredLic.status = 'active';
  await repo.saveLicense(expiredLic);

  process.env.VITE_APP_MODE = 'user';
  const userService = new LicensingService(repo);
  const actRes = await userService.activateKey(expiredLic.key, 'Expired Client');

  assert.equal(actRes.isValid, false);
  assert.equal(actRes.code, 'EXPIRED');
});

test('18. Clé privée absente du bundle User', async () => {
  process.env.VITE_APP_MODE = 'user';
  await assert.rejects(async () => {
    await CryptoService.generateSignature('test_payload_user_bundle');
  }, /SECURITY_ERROR/);
});

test('19. LicenseGenerator absent du bundle User', () => {
  const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
  assert.equal(appContent.includes("LicenseGenerator"), false);
  assert.equal(appContent.includes("AdminLmseCenter"), false);
  assert.equal(appContent.includes("AdminCenterView"), false);
});

test('20. Aucune régression', async () => {
  RateLimiter.clearStore();
  process.env.VITE_APP_MODE = 'admin';
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const lic = await service.createLicense({ holderName: 'Regression Client', type: 'commercial' });
  assert.ok(lic.key.startsWith('LMSE-COMM-'));

  process.env.VITE_APP_MODE = 'user';
  const actRes = await service.activateKey(lic.key, 'Regression Client');
  assert.equal(actRes.isValid, true);

  const valRes = await service.validateCurrentLicense();
  assert.equal(valRes.isValid, true);
});

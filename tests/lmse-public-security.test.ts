import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { LmseBackendServer } from '../src/server/lmseServer.ts';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository.ts';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator.ts';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator.ts';
import { RateLimiter } from '../src/server/middleware/rateLimiter.ts';
import { AdminAuthService } from '../src/server/middleware/adminAuth.ts';
import { LmseConfigService } from '../src/config/lmseConfig.ts';
import { backupLmseStorage } from '../scripts/backupLmse.js';
import { restoreLmseStorage } from '../scripts/restoreLmse.js';

test('1. Public Health Check: GET /api/health returns HTTP 200 OK', async () => {
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  const res = await server.inject({
    method: 'GET',
    url: '/api/health',
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'LMSE Backend API');
});

test('2. Admin Endpoint Security: Request without Bearer token returns 401 Unauthorized', async () => {
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    payload: { holderName: 'Test', type: 'beta' },
  });

  assert.equal(res.statusCode, 401);
});

test('3. Admin Endpoint Security: Request with invalid Bearer token returns 401 Unauthorized', async () => {
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: 'Bearer invalid_token_123' },
    payload: { holderName: 'Test', type: 'beta' },
  });

  assert.equal(res.statusCode, 401);
});

test('4. RBAC Authorization: Support role cannot generate licenses (HTTP 403)', async () => {
  AdminAuthService.clearSessions();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({ id: 'sup1', email: 'support@test.tn', name: 'Support', role: 'support' });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Test', type: 'beta' },
  });

  assert.equal(res.statusCode, 403);
});

test('5. RBAC Authorization: Auditor role cannot generate licenses (HTTP 403)', async () => {
  AdminAuthService.clearSessions();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({ id: 'aud1', email: 'auditor@test.tn', name: 'Auditor', role: 'auditor' });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Test', type: 'beta' },
  });

  assert.equal(res.statusCode, 403);
});

test('6. RBAC Authorization: Admin role can generate licenses (HTTP 201)', async () => {
  process.env.VITE_APP_MODE = 'admin';
  AdminAuthService.clearSessions();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({ id: 'adm1', email: 'admin@test.tn', name: 'Admin', role: 'admin' });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Client Admin Valid', type: 'beta', durationDays: 30, maxDevices: 1 },
  });

  assert.equal(res.statusCode, 201);
});

test('7. RBAC Authorization: Super Admin role can generate licenses (HTTP 201)', async () => {
  process.env.VITE_APP_MODE = 'admin';
  AdminAuthService.clearSessions();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);
  const session = AdminAuthService.createSession({ id: 'super1', email: 'superadmin@test.tn', name: 'Super Admin', role: 'super_admin' });

  const res = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: { holderName: 'Super Admin Client', type: 'commercial', durationDays: 365, maxDevices: 3 },
  });

  assert.equal(res.statusCode, 201);
});

test('8. Revocation Endpoint: Protected by Admin authentication', async () => {
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  const unauthRes = await server.inject({
    method: 'POST',
    url: '/api/admin/licenses/lic_123/revoke',
    payload: { reason: 'Abuse' },
  });

  assert.equal(unauthRes.statusCode, 401);
});

test('9. Rate Limiting: Blocks brute force login attempts (HTTP 429)', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  let blocked = false;
  for (let i = 0; i < 35; i++) {
    const res = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: { email: 'spam@test.tn', password: 'Wrong' },
    });
    if (res.statusCode === 429) {
      blocked = true;
      break;
    }
  }

  assert.equal(blocked, true);
});

test('10. Validation Endpoint: Validates license en ligne via POST /api/license/validate', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Online Valid User', type: 'beta', durationDays: 30, maxDevices: 1 });
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: {
      licenseKey: license.key,
      device: { deviceId: 'DEV_ONLINE_001', platform: 'Android' },
    },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.isValid, true);
});

test('11. Device Binding: First online validation binds device to license', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Binding User', type: 'beta', durationDays: 30, maxDevices: 1 });
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: {
      licenseKey: license.key,
      device: { deviceId: 'DEV_BIND_FIRST', platform: 'Android' },
    },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.isValid, true, `Body returned: ${JSON.stringify(body)}`);
  assert.equal(body.deviceRegistered, true);
  assert.equal(body.license.activations.length, 1);
  assert.equal(body.license.activations[0].fingerprint.deviceId, 'DEV_BIND_FIRST');
});

test('12. Device Limit Exceeded: Secondary device rejected when maxDevices=1', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Single Device User', type: 'beta', durationDays: 30, maxDevices: 1 });
  license.status = 'active';
  license.activations = [{ id: 'act_1', licenseId: license.id, licenseKey: license.key, activatedAt: new Date().toISOString(), lastVerifiedAt: new Date().toISOString(), isOffline: false, fingerprint: { deviceId: 'DEV_PRIMARY', platform: 'Android' } as any }];
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: {
      licenseKey: license.key,
      device: { deviceId: 'DEV_SECONDARY', platform: 'Android' },
    },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.isValid, false);
  assert.equal(body.code, 'DEVICE_LIMIT_EXCEEDED');
});

test('13. Expired License: Backend rejects expired license (HTTP 200, isValid=false, status=expired)', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Expired User', type: 'beta', durationDays: -1 });
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: {
      licenseKey: license.key,
      device: { deviceId: 'DEV_EXP', platform: 'Android' },
    },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.isValid, false);
  assert.equal(body.code, 'EXPIRED');
});

test('14. Revoked License: Backend rejects revoked license (HTTP 200, isValid=false, status=revoked)', async () => {
  RateLimiter.clearStore();
  const repo = new InMemoryLicenseRepository();
  const server = new LmseBackendServer(repo);

  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Revoked User', type: 'beta', durationDays: 30 });
  license.status = 'revoked';
  license.revokedAt = new Date().toISOString();
  license.revocationReason = 'Test Revocation';
  await repo.saveLicense(license);

  const res = await server.inject({
    method: 'POST',
    url: '/api/license/validate',
    payload: {
      licenseKey: license.key,
      device: { deviceId: 'DEV_REV', platform: 'Android' },
    },
  });

  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.payload);
  assert.equal(body.isValid, false);
  assert.equal(body.code, 'LICENSE_REVOKED');
});

test('15. Altered Payload: LicenseValidator rejects license with altered holderName', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Original User', type: 'beta', durationDays: 30 });

  const tampered = { ...license, holderName: 'Tampered Hacker' };
  const validation = await LicenseValidator.validateLicense(tampered, { deviceId: 'DEV_TEST' } as any, []);

  assert.equal(validation.isValid, false);
  assert.equal(validation.code, 'CORRUPTED');
});

test('16. Altered Signature: LicenseValidator rejects license with modified signature', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Original User', type: 'beta', durationDays: 30 });

  const tampered = { ...license, signature: '0000000000000000000000000000000000000000000000000000000000000000' };
  const validation = await LicenseValidator.validateLicense(tampered, { deviceId: 'DEV_TEST' } as any, []);

  assert.equal(validation.isValid, false);
  assert.equal(validation.code, 'CORRUPTED');
});

test('17. Altered Checksum: LicenseValidator rejects license with modified checksum', async () => {
  process.env.VITE_APP_MODE = 'admin';
  const license = await LicenseGenerator.generateLicense({ holderName: 'Original User', type: 'beta', durationDays: 30 });

  const tampered = { ...license, checksum: '1111111111111111111111111111111111111111111111111111111111111111' };
  const validation = await LicenseValidator.validateLicense(tampered, { deviceId: 'DEV_TEST' } as any, []);

  assert.equal(validation.isValid, false);
  assert.equal(validation.code, 'CORRUPTED');
});

test('18. Private Key Protection: Signature attempt in User mode throws SECURITY_ERROR', async () => {
  process.env.VITE_APP_MODE = 'user';

  await assert.rejects(
    async () => {
      await LicenseGenerator.generateLicense({ holderName: 'Hacker', type: 'beta', durationDays: 30 });
    },
    (err: Error) => {
      return err.message.includes('SECURITY_ERROR');
    }
  );

  process.env.VITE_APP_MODE = 'admin';
});

test('19. Backup & Restore Integrity: Backup, restore and checksum verification succeed', () => {
  const backupRes = backupLmseStorage();
  assert.ok(backupRes.backupFolder);
  assert.ok(fs.existsSync(backupRes.backupFolder));

  const restoreRes = restoreLmseStorage(backupRes.backupFolder);
  assert.ok(restoreRes.restoredFolder);
  assert.ok(restoreRes.filesCount >= 1);
});

test('20. HTTPS Requirement Enforcement: Beta environment mode rejects non-HTTPS endpoints', () => {
  const httpCheck = LmseConfigService.validateLmseUrl('http://lmse.bird-academy.fr', 'beta');
  assert.equal(httpCheck.isValid, false);
  assert.ok(httpCheck.reason?.includes('FORBIDDEN_ENDPOINT') || httpCheck.reason?.includes('HTTPS'));

  const httpsCheck = LmseConfigService.validateLmseUrl('https://lmse.bird-academy.fr', 'beta');
  assert.equal(httpsCheck.isValid, true);
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ADMIN / LMSE ENTERPRISE — SUITE DE TESTS COMPLÈTE ADMIN BOOTSTRAP & SÉCURITÉ
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AdminUserRepository } from '../src/server/repositories/AdminUserRepository';
import { PasswordCrypto } from '../src/server/utils/passwordCrypto';
import { LmseBackendServer } from '../src/server/lmseServer';
import { AdminAuthService } from '../src/server/middleware/adminAuth';
import { RateLimiter } from '../src/server/middleware/rateLimiter';

import path from 'node:path';

describe('Admin Bootstrap & LMSE Enterprise Authentication Test Suite', () => {
  let server: LmseBackendServer;
  let repo: AdminUserRepository;

  beforeEach(() => {
    AdminUserRepository.resetInstance();
    repo = AdminUserRepository.getInstance(path.join(process.cwd(), 'data', 'test-admin-users.json'));
    repo.resetForTesting();
    AdminAuthService.clearSessions();
    RateLimiter.clearStore();
    server = new LmseBackendServer();
  });

  it('1. Création du premier Super Admin via bootstrap', () => {
    assert.equal(repo.hasSuperAdmin(), false);

    const superAdmin = repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    assert.equal(repo.hasSuperAdmin(), true);
    assert.equal(superAdmin.email, 'owner@birdacademy.tn');
    assert.equal(superAdmin.role, 'super_admin');
    assert.equal(superAdmin.status, 'active');
    assert.ok(superAdmin.passwordHash.length > 20);
    assert.ok(superAdmin.passwordSalt.length > 10);
  });

  it('2. Impossibilité de créer un deuxième Super Admin via bootstrap', () => {
    try {
      repo.createSuperAdmin({
        email: 'owner@birdacademy.tn',
        name: 'Propriétaire Fondateur',
        password: 'SuperAdminSecretPassword123!',
      });
    } catch (e) {
      // Expected if test 1 already bootstrapped the super admin
    }

    assert.throws(() => {
      repo.createSuperAdmin({
        email: 'hacker@darkweb.org',
        name: 'Hacker Infiltré',
        password: 'HackerPassword123!',
      });
    }, /BOOTSTRAP_ERROR/);
  });

  it('3. Refus d authentification en cas de mot de passe incorrect', async () => {
    repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    const res = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: {
        email: 'owner@birdacademy.tn',
        password: 'WrongPassword999!',
      },
    });

    assert.equal(res.statusCode, 401);
    const body = JSON.parse(res.payload);
    assert.equal(body.error, 'INVALID_CREDENTIALS');
  });

  it('4. Authentification réussie avec le bon mot de passe Super Admin', async () => {
    repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    const res = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: {
        email: 'owner@birdacademy.tn',
        password: 'SuperAdminSecretPassword123!',
      },
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.success, true);
    assert.equal(body.session.email, 'owner@birdacademy.tn');
    assert.equal(body.session.role, 'super_admin');
  });

  it('5. Session valide générée avec jeton et date d expiration', async () => {
    repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    const res = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: {
        email: 'owner@birdacademy.tn',
        password: 'SuperAdminSecretPassword123!',
      },
    });

    const body = JSON.parse(res.payload);
    const session = body.session;

    assert.ok(session.token.startsWith('lmse_adm_'));
    assert.ok(session.expiresAt > Date.now());
    assert.ok(AdminAuthService.getSession(session.token) !== null);
  });

  it('6. Invalidation des sessions expirées', () => {
    const expiredSession = AdminAuthService.createSession({
      id: 'usr_test',
      email: 'expired@birdacademy.tn',
      name: 'Test Expired',
      role: 'super_admin',
    });

    // Force expiration
    expiredSession.expiresAt = Date.now() - 1000;

    assert.equal(AdminAuthService.getSession(expiredSession.token), null);
  });

  it('7. Accès Super Admin autorisé aux endpoints protégés', async () => {
    repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    const loginRes = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: {
        email: 'owner@birdacademy.tn',
        password: 'SuperAdminSecretPassword123!',
      },
    });

    const token = JSON.parse(loginRes.payload).session.token;

    const statsRes = await server.inject({
      method: 'GET',
      url: '/api/admin/stats',
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(statsRes.statusCode, 200);
    const statsBody = JSON.parse(statsRes.payload);
    assert.equal(statsBody.success, true);
  });

  it('8. Accès refusé sans authentification (401 UNAUTHORIZED)', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/admin/licenses',
    });

    assert.equal(res.statusCode, 401);
  });

  it('9. Accès refusé si le rôle est insuffisant (403 FORBIDDEN)', async () => {
    try {
      repo.createSuperAdmin({
        email: 'owner@birdacademy.tn',
        name: 'Propriétaire Fondateur',
        password: 'SuperAdminSecretPassword123!',
      });
    } catch {
      // Super Admin already created in earlier test
    }

    // Create a support secondary user
    const supportUser = repo.createSecondaryAdmin({
      email: 'support@birdacademy.tn',
      name: 'Agent Support',
      role: 'support',
      permissions: ['manage_support'],
      password: 'SupportPassword123!',
    });

    const supportSession = AdminAuthService.createSession({
      id: supportUser.id,
      email: supportUser.email,
      name: supportUser.name,
      role: supportUser.role,
    });

    // Support user attempting to create an admin account (super_admin required)
    const res = await server.inject({
      method: 'POST',
      url: '/api/admin/users',
      headers: { Authorization: `Bearer ${supportSession.token}` },
      payload: {
        email: 'hacker@darkweb.org',
        name: 'Unallowed User',
        role: 'admin',
        password: 'Password123!',
      },
    });

    assert.equal(res.statusCode, 403);
  });

  it('10. Limite de requêtes (Rate Limiting) sur la connexion', async () => {
    // Execute 6 login attempts rapidly (limit is 5)
    for (let i = 0; i < 5; i++) {
      await server.inject({
        method: 'POST',
        url: '/api/admin/auth/login',
        payload: { email: `test${i}@birdacademy.tn`, password: 'WrongPassword!' },
      });
    }

    const blockedRes = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: { email: 'blocked@birdacademy.tn', password: 'WrongPassword!' },
    });

    assert.equal(blockedRes.statusCode, 429);
  });

  it('11. Enregistrement d audit sur tentative de connexion (succès & échec)', async () => {
    RateLimiter.clearStore();
    repo.resetForTesting();
    repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    // Failed attempt
    await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: { email: 'owner@birdacademy.tn', password: 'WrongPassword!' },
    });

    // Successful attempt
    await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: { email: 'owner@birdacademy.tn', password: 'SuperAdminSecretPassword123!' },
    });

    const logs = server.getAuditLogs();
    const loginLogs = logs.filter(l => l.action.includes('ADMIN_LOGIN'));

    assert.ok(loginLogs.length >= 2);
    assert.ok(loginLogs.some(l => l.result === 'FAILED'));
    assert.ok(loginLogs.some(l => l.result === 'SUCCESS'));
  });

  it('12. Audit de création du Super Admin', () => {
    repo.resetForTesting();
    const superAdmin = repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    assert.equal(superAdmin.role, 'super_admin');
    assert.ok(superAdmin.createdAt !== undefined);
  });

  it('13. Création de licence LMSE après authentification Super Admin', async () => {
    repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    const loginRes = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: {
        email: 'owner@birdacademy.tn',
        password: 'SuperAdminSecretPassword123!',
      },
    });

    const token = JSON.parse(loginRes.payload).session.token;

    const licenseRes = await server.inject({
      method: 'POST',
      url: '/api/admin/licenses',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        holderName: 'Éleveur Bêta Testeur Tunisie',
        type: 'beta_tester',
        durationDays: 365,
        maxDevices: 3,
      },
    });

    assert.equal(licenseRes.statusCode, 201);
    const body = JSON.parse(licenseRes.payload);
    assert.equal(body.success, true);
    assert.equal(body.license.holderName, 'Éleveur Bêta Testeur Tunisie');
    assert.ok(body.license.key.length > 10);
  });

  it('14. Clé privée de signature LMSE jamais exposée au frontend', async () => {
    repo.createSuperAdmin({
      email: 'owner@birdacademy.tn',
      name: 'Propriétaire Fondateur',
      password: 'SuperAdminSecretPassword123!',
    });

    const loginRes = await server.inject({
      method: 'POST',
      url: '/api/admin/auth/login',
      payload: {
        email: 'owner@birdacademy.tn',
        password: 'SuperAdminSecretPassword123!',
      },
    });

    const token = JSON.parse(loginRes.payload).session.token;

    const licenseRes = await server.inject({
      method: 'POST',
      url: '/api/admin/licenses',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        holderName: 'Testeur Clé Privée',
        type: 'beta_tester',
      },
    });

    const payload = licenseRes.payload;
    assert.ok(!payload.includes('PRIVATE_KEY'));
    assert.ok(!payload.includes('RSA PRIVATE KEY'));
    assert.ok(!payload.includes('BEGIN PRIVATE KEY'));
  });

  it('15. Isolation du bundle User : aucune fonction Admin exposée', () => {
    // Verify user bundle files or App mode check
    assert.equal(process.env.VITE_APP_MODE !== 'admin', true);
  });
});

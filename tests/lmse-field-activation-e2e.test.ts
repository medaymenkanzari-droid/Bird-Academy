/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LMSE FIELD ACTIVATION E2E TEST SUITE
 * Validates persistent backend storage, online key activation, local cryptographic verification,
 * and offline license preservation without compromising security or architecture.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';

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
import { FileLicenseRepository } from '../src/features/licensing/repositories/FileLicenseRepository';
import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { RateLimiter } from '../src/server/middleware/rateLimiter';

const testDataDir = path.join(process.cwd(), 'data', 'test-e2e-lmse');

function cleanupTestDataDir() {
  try {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  } catch {}
}

test('LMSE E2E 1: Génération Admin -> Persistance Backend -> Activation Online User -> Fallback Offline', async () => {
  cleanupTestDataDir();
  RateLimiter.clearStore();

  // 1. Initialiser le serveur backend avec FileLicenseRepository (Stockage persistant)
  const backendRepo = new FileLicenseRepository(testDataDir);
  const backendServer = new LmseBackendServer(backendRepo);

  const session = AdminAuthService.createSession({
    id: 'adm_e2e_1',
    email: 'superadmin@bird-academy.fr',
    name: 'Super Admin E2E',
    role: 'super_admin',
  });

  // 2. Générer une licence depuis l'API Admin
  process.env.VITE_APP_MODE = 'admin';
  const genResponse = await backendServer.inject({
    method: 'POST',
    url: '/api/admin/licenses',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      holderName: 'Élevage Canari E2E',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 3,
    },
  });

  assert.equal(genResponse.statusCode, 201);
  const genBody = JSON.parse(genResponse.payload);
  console.log('DEBUG genBody:', JSON.stringify(genBody, null, 2));
  assert.equal(genBody.success, true);
  const generatedKey = genBody.license.key;
  assert.ok(generatedKey.startsWith('LMSE-COMM-'));

  // 3. Vérifier que la licence existe bien dans le stockage persistant du backend
  const foundInRepo = await backendRepo.getLicenseByKey(generatedKey);
  console.log('DEBUG foundInRepo:', JSON.stringify(foundInRepo, null, 2));
  assert.ok(foundInRepo !== null);
  assert.equal(foundInRepo?.status, 'pending_activation');

  // 4. Simuler l'application User (Mode User)
  process.env.VITE_APP_MODE = 'user';
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true },
    configurable: true,
    writable: true,
  });
  const userRepo = new LocalStorageLicenseRepository();
  const userService = new LicensingService(userRepo);
  LicensingService.setInstance(userService);

  // Mock de fetch pour intercepter l'appel API User vers le serveur backend inject
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = input.toString();
    if (urlStr.includes('/api/license/validate')) {
      const payload = init?.body ? JSON.parse(init.body as string) : {};
      console.log('DEBUG fetch payload:', JSON.stringify(payload));
      const res = await backendServer.inject({
        method: 'POST',
        url: '/api/license/validate',
        headers: (init?.headers as any) || {},
        payload,
      });
      console.log('DEBUG fetch res:', res);
      return new Response(res.payload, { status: res.statusCode });
    }
    return originalFetch(input, init);
  };

  try {
    // 5. Exécuter l'activation de la clé sur l'application User
    const actResult = await userService.activateKey(generatedKey, 'Élevage Canari E2E');
    console.log('DEBUG actResult:', JSON.stringify(actResult, null, 2));
    assert.equal(actResult.isValid, true);
    assert.equal(actResult.code, 'VALID');
    assert.ok(actResult.license !== null);
    assert.equal(actResult.license?.key, generatedKey);

    // 6. Vérifier la persistance de l'activation sur le backend
    const updatedBackendLic = await backendRepo.getLicenseByKey(generatedKey);
    assert.equal(updatedBackendLic?.status, 'active');
    assert.equal(updatedBackendLic?.activations.length, 1);

    // 7. Vérifier que la licence est enregistrée dans le dépôt local User
    const activeLocal = await userRepo.getActiveLicense();
    assert.ok(activeLocal !== null);
    assert.equal(activeLocal?.key, generatedKey);

    // 8. Tester le mode Offline : Simuler coupure réseau (navigator.onLine = false)
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false },
      configurable: true,
      writable: true,
    });

    const offlineValidation = await userService.validateCurrentLicense();
    assert.equal(offlineValidation.isValid, true);
    assert.equal(offlineValidation.code, 'VALID');
    assert.equal(offlineValidation.license?.key, generatedKey);

    // 9. Tester la persistance après redémarrage du serveur backend
    const restartedRepo = new FileLicenseRepository(testDataDir);
    const restartedLic = await restartedRepo.getLicenseByKey(generatedKey);
    assert.ok(restartedLic !== null);
    assert.equal(restartedLic?.key, generatedKey);
    assert.equal(restartedLic?.status, 'active');

  } finally {
    globalThis.fetch = originalFetch;
    cleanupTestDataDir();
    process.env.VITE_APP_MODE = 'admin';
  }
});

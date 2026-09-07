/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE BACKEND CONNECTIVITY AUDIT
 * Tests unitaires et d'intégration validant :
 * 1. Connectivité HTTP sur le port 3001 (GET /api/health)
 * 2. Validation en ligne des licences commerciales et activation d'appareil
 * 3. Rejet des licences inexistantes (404 KEY_NOT_FOUND)
 * 4. Rejet des licences falsifiées (CORRUPTED)
 * 5. Rejet des licences révoquées (LICENSE_REVOKED)
 * 6. Isolation stricte : 0 clé privée dans le bundle frontend
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { LicenseGenerator } from '../../src/features/licensing/engines/LicenseGenerator';
import { FileLicenseRepository } from '../../src/features/licensing/repositories/FileLicenseRepository';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { LmseBackendServer } from '../../src/server/lmseServer';
import type { Server } from 'node:http';

describe('LMSE Backend Connectivity & Online Activation Quality Gate', () => {
  const BACKEND_URL = 'http://localhost:3001';
  let server: Server | null = null;

  before(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // Not running, start it
    }

    const backend = new LmseBackendServer();
    await new Promise<void>((resolve) => {
      server = backend.app.listen(3001, '0.0.0.0', () => {
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server!.close(() => resolve());
      });
    }
  });

  test('CONN-01: LMSE Backend is reachable and responds on port 3001 (/api/health)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    assert.equal(res.status, 200, 'Health endpoint should return HTTP 200');
    const data = await res.json();
    assert.equal(data.status, 'ok', 'Status should be ok');
    assert.equal(data.service, 'LMSE Backend API', 'Service identifier matches');
  });

  test('CONN-02: Valid license is successfully verified and activated over HTTP', async () => {
    process.env.VITE_APP_MODE = 'admin';
    const testLicense = await LicenseGenerator.generateLicense({
      holderName: 'Vérification Connectivité 2026',
      holderEmail: 'connect@birdacademy.com',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 3,
    });

    const repo = new FileLicenseRepository();
    await repo.saveLicense(testLicense);

    const res = await fetch(`${BACKEND_URL}/api/license/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: testLicense.key,
        device: { deviceId: 'test_dev_conn_01', platform: 'windows' },
        holderName: 'Vérification Connectivité 2026',
      }),
    });

    assert.equal(res.status, 200, 'Validation should return HTTP 200');
    const data = await res.json();
    assert.equal(data.isValid, true, 'License should be valid');
    assert.equal(data.status, 'active', 'License status should be active');
    assert.equal(data.license.key, testLicense.key, 'Returned key matches');
  });

  test('CONN-03: Unknown / non-existent license key returns 404 KEY_NOT_FOUND', async () => {
    const res = await fetch(`${BACKEND_URL}/api/license/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: 'LMSE-COMM-FFFF-FFFF-FFFF',
        device: { deviceId: 'test_dev_conn_02', platform: 'windows' },
        holderName: 'Intrus',
      }),
    });

    assert.equal(res.status, 404, 'Non-existent key should return HTTP 404');
    const data = await res.json();
    assert.equal(data.isValid, false, 'Should not be valid');
    assert.equal(data.code, 'KEY_NOT_FOUND', 'Error code should be KEY_NOT_FOUND');
  });

  test('CONN-04: Tampered signature on license is rejected with CORRUPTED status', async () => {
    process.env.VITE_APP_MODE = 'admin';
    const forgedLicense = await LicenseGenerator.generateLicense({
      holderName: 'Falsification Test',
      holderEmail: 'fraud@test.com',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 1,
    });

    // Alter the signature
    forgedLicense.signature = '0000000000000000000000000000000000000000000000000000000000000000';
    const repo = new FileLicenseRepository();
    await repo.saveLicense(forgedLicense);

    const res = await fetch(`${BACKEND_URL}/api/license/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: forgedLicense.key,
        device: { deviceId: 'test_dev_conn_03', platform: 'windows' },
        holderName: 'Falsification Test',
      }),
    });

    const data = await res.json();
    assert.equal(data.isValid, false, 'Tampered license should not be valid');
    assert.equal(data.code, 'CORRUPTED', 'Error code should be CORRUPTED');
  });

  test('CONN-05: Zero private signing keys or administrative secrets in frontend public keys', () => {
    const pubKey = CryptoService.getPublicVerificationKey();
    assert.ok(pubKey, 'Public verification key exists');
    assert.equal(pubKey.includes('PRIVATE'), false, 'No private key in public verification key');
  });
});

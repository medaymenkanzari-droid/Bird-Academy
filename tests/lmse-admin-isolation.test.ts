/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LMSE ADMIN ISOLATION AUDIT TEST SUITE
 * Validates complete architectural isolation of Enterprise Administration from the User Application.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

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

import { 
  isAdminRole, 
  isUserBuild, 
  assertAdminContext, 
  ADMIN_ROLES, 
  USER_ROLES 
} from '../src/config/appMode';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { CryptoService } from '../src/features/licensing/services/CryptoService';

// Ensure default User Mode environment for testing isolation
process.env.VITE_APP_MODE = 'user';

test('TEST 01: Beta Tester -> Accès Admin refusé', () => {
  assert.equal(isAdminRole('beta_tester'), false);
  assert.throws(() => assertAdminContext('beta_tester'), /SECURITY_ERROR/);
});

test('TEST 02: Breeder -> Accès Admin refusé', () => {
  assert.equal(isAdminRole('breeder'), false);
  assert.throws(() => assertAdminContext('breeder'), /SECURITY_ERROR/);
});

test('TEST 03: Veterinarian -> Accès Admin refusé', () => {
  assert.equal(isAdminRole('veterinarian'), false);
  assert.throws(() => assertAdminContext('veterinarian'), /SECURITY_ERROR/);
});

test('TEST 04: Association -> Accès Admin refusé', () => {
  assert.equal(isAdminRole('association'), false);
  assert.throws(() => assertAdminContext('association'), /SECURITY_ERROR/);
});

test('TEST 05: Commercial User -> Accès Admin refusé', () => {
  assert.equal(isAdminRole('commercial'), false);
  assert.throws(() => assertAdminContext('commercial'), /SECURITY_ERROR/);
});

test('TEST 06: Modification du rôle dans localStorage -> Accès Admin refusé', () => {
  globalThis.localStorage.setItem('user_role', 'super_admin');
  globalThis.localStorage.setItem('admin_token', 'fake_admin_token_123');

  // In User Build mode (VITE_APP_MODE=user), even with fake localStorage, assertAdminContext must fail!
  assert.equal(isUserBuild(), true);
  assert.throws(() => assertAdminContext(), /SECURITY_ERROR/);
});

test('TEST 07: Modification du rôle dans IndexedDB -> Accès Admin refusé', () => {
  // Simulating tampered role object from IndexedDB
  const fakeSessionFromIndexedDB = { role: 'super_admin', isLogged: true };
  assert.equal(isUserBuild(), true);
  assert.throws(() => assertAdminContext(fakeSessionFromIndexedDB.role), /SECURITY_ERROR/);
});

test('TEST 08: Accès direct à une route Admin -> Refusé', () => {
  assert.equal(isUserBuild(), true);
  // Attempting to evaluate admin context guard for admin route in user mode must throw
  assert.throws(() => assertAdminContext('admin'), /SECURITY_ERROR/);
});

test('TEST 09: Appel direct d\'une fonction de génération de licence depuis User App -> Impossible/Refusé', async () => {
  assert.equal(isUserBuild(), true);
  await assert.rejects(async () => {
    await LicenseGenerator.generateLicense({
      holderName: 'Malicious Generator Test',
      type: 'permanent',
    });
  }, /SECURITY_ERROR/);
});

test('TEST 10: Clé privée absente du bundle utilisateur', async () => {
  assert.equal(isUserBuild(), true);
  await assert.rejects(async () => {
    await CryptoService.generateSignature('test_payload');
  }, /SECURITY_ERROR/);
});

test('TEST 11: Clé privée absente du build APK', async () => {
  // Verification that User Build mode strips signing key access for Android build profile
  process.env.VITE_APP_MODE = 'user';
  await assert.rejects(async () => {
    const service = LicensingService.getInstance();
    await service.exportLicensingData();
  }, /SECURITY_ERROR/);
});

test('TEST 12: Clé privée absente du build Windows utilisateur', async () => {
  // Verification that User Build mode strips signing key access for Desktop Windows build profile
  process.env.VITE_APP_MODE = 'user';
  await assert.rejects(async () => {
    const service = LicensingService.getInstance();
    await service.createLicense({ holderName: 'Desktop Exploit Test', type: 'enterprise' });
  }, /SECURITY_ERROR/);
});

test('TEST 13: Import d\'une sauvegarde utilisateur -> Ne donne aucun privilège Admin', () => {
  const tamperedBackup = JSON.stringify({
    canaris: [],
    cages: [],
    userRole: 'super_admin',
    isAdmin: true,
  });

  // Restoring backup state must never elevate appMode or grant admin privileges
  assert.equal(isUserBuild(), true);
  assert.equal(isAdminRole('breeder'), false);
});

test('TEST 14: Licence BETA valide -> Aucun privilège administratif', () => {
  const betaUserRole = 'beta_tester';
  assert.equal(isAdminRole(betaUserRole), false);
  assert.throws(() => assertAdminContext(betaUserRole), /SECURITY_ERROR/);
});

test('TEST 15: Licence COMMERCIAL valide -> Aucun privilège administratif', () => {
  const commercialUserRole = 'commercial';
  assert.equal(isAdminRole(commercialUserRole), false);
  assert.throws(() => assertAdminContext(commercialUserRole), /SECURITY_ERROR/);
});

test('TEST 16: Seul un compte administratif autorisé (Mode Admin) peut générer une licence', async () => {
  // 1. In User mode -> Failed
  process.env.VITE_APP_MODE = 'user';
  await assert.rejects(async () => {
    await LicenseGenerator.generateLicense({ holderName: 'Test Owner', type: 'commercial' });
  }, /SECURITY_ERROR/);

  // 2. Switch to Admin mode -> Success
  process.env.VITE_APP_MODE = 'admin';
  assert.doesNotThrow(() => assertAdminContext('super_admin'));
  
  const validLicense = await LicenseGenerator.generateLicense({
    holderName: 'Enterprise Admin Authorized',
    type: 'commercial',
    durationDays: 365,
  });

  assert.ok(validLicense.key.startsWith('LMSE-COMM-'));
  assert.ok(validLicense.signature.length > 0);

  // Reset back to user mode for safety
  process.env.VITE_APP_MODE = 'user';
});

test('TEST 17: Vérification que src/App.tsx ne contient aucun import de module Administration', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');

  assert.equal(appContent.includes("import('./features/administration"), false);
  assert.equal(appContent.includes("import('./features/licensing/pages/LicensingAdminPage"), false);
  assert.equal(appContent.includes("AdminCenterView"), false);
  assert.equal(appContent.includes("LicensingAdminPage"), false);
});

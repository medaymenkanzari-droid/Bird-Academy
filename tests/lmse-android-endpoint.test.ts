import test from 'node:test';
import assert from 'node:assert/strict';
import { LmseConfigService } from '../src/config/lmseConfig.ts';
import { validateLmseBuildConfig } from '../scripts/validateLmseBuildConfig.js';
import { LicensingService } from '../src/features/licensing/services/LicensingService.ts';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository.ts';

test('1. Environment Mode: Default development mode allows http://localhost:3001', () => {
  const result = LmseConfigService.validateLmseUrl('http://localhost:3001', 'development');
  assert.equal(result.isValid, true);
  assert.equal(LmseConfigService.isLocalhostUrl('http://localhost:3001'), true);
});

test('2. Environment Mode: android-lan mode allows valid LAN IP address', () => {
  const result = LmseConfigService.validateLmseUrl('http://192.168.1.100:3001', 'android-lan');
  assert.equal(result.isValid, true);
  assert.equal(LmseConfigService.isLocalhostUrl('http://192.168.1.100:3001'), false);
});

test('3. Environment Mode: android-lan mode rejects localhost endpoint', () => {
  const result = LmseConfigService.validateLmseUrl('http://localhost:3001', 'android-lan');
  assert.equal(result.isValid, false);
  assert.ok(result.reason?.includes('INVALID_LAN_ENDPOINT'));
});

test('4. Environment Mode: beta mode rejects localhost endpoint', () => {
  const result = LmseConfigService.validateLmseUrl('http://localhost:3001', 'beta');
  assert.equal(result.isValid, false);
  assert.ok(result.reason?.includes('FORBIDDEN_ENDPOINT'));
});

test('5. Environment Mode: beta mode rejects 127.0.0.1 endpoint', () => {
  const result = LmseConfigService.validateLmseUrl('http://127.0.0.1:3001', 'beta');
  assert.equal(result.isValid, false);
  assert.ok(result.reason?.includes('FORBIDDEN_ENDPOINT'));
});

test('6. Environment Mode: beta mode rejects placeholder __LMSE_PUBLIC_URL_REQUIRED__', () => {
  const result = LmseConfigService.validateLmseUrl('__LMSE_PUBLIC_URL_REQUIRED__', 'beta');
  assert.equal(result.isValid, false);
  assert.ok(result.reason?.includes('placeholder'));
});

test('7. Environment Mode: production mode rejects localhost endpoint', () => {
  const result = LmseConfigService.validateLmseUrl('http://localhost:3001', 'production');
  assert.equal(result.isValid, false);
  assert.ok(result.reason?.includes('FORBIDDEN_ENDPOINT'));
});

test('8. Build Guard: validateLmseBuildConfig blocks invalid target configurations', () => {
  process.env.VITE_LMSE_API_URL = 'http://localhost:3001';
  const betaCheck = validateLmseBuildConfig('beta');
  assert.equal(betaCheck.isValid, false);
  assert.equal(betaCheck.reason, 'FORBIDDEN_LOCALHOST');

  process.env.VITE_LMSE_API_URL = '__LMSE_PUBLIC_URL_REQUIRED__';
  const placeholderCheck = validateLmseBuildConfig('beta');
  assert.equal(placeholderCheck.isValid, false);
  assert.equal(placeholderCheck.reason, 'PLACEHOLDER_ENDPOINT');

  process.env.VITE_LMSE_API_URL = 'http://localhost:3001';
  const devCheck = validateLmseBuildConfig('development');
  assert.equal(devCheck.isValid, true);
});

test('9. LicensingService: Unreachable backend returns LMSE_BACKEND_UNREACHABLE code', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  // Set an unreachable server port
  process.env.VITE_LMSE_ENV = 'development';
  process.env.VITE_LMSE_API_URL = 'http://127.0.0.1:59999';

  const res = await service.activateKey('LMSE-BETA-0000-0000-0000', 'Test User');
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'LMSE_BACKEND_UNREACHABLE');
  assert.ok(res.message.includes('LMSE_BACKEND_UNREACHABLE') || res.message.includes('Impossible de contacter'));

  // Reset env
  process.env.VITE_LMSE_API_URL = 'http://localhost:3001';
});

test('10. LicensingService: Invalid API configuration throws/returns INVALID_API_CONFIGURATION', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  // Force beta env mode with forbidden localhost
  process.env.VITE_LMSE_ENV = 'beta';
  process.env.VITE_LMSE_API_URL = 'http://localhost:3001';

  const res = await service.activateKey('LMSE-BETA-0000-0000-0000', 'Test User');
  assert.equal(res.isValid, false);
  assert.equal(res.code, 'INVALID_API_CONFIGURATION');

  // Reset env
  process.env.VITE_LMSE_ENV = 'development';
  process.env.VITE_LMSE_API_URL = 'http://localhost:3001';
});

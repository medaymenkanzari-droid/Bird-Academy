/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - LMSE FIRST LAUNCH TEST SUITE
 * Tests official first-launch user experience, LMSE key activation, security constraints,
 * offline mode, i18n translations, RTL, and Admin isolation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage for Node environment if missing
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

// Force USER App environment
process.env.VITE_APP_MODE = 'user';

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository';
import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator';
import { KeyValidator } from '../src/features/licensing/validators/KeyValidator';
import { CryptoService } from '../src/features/licensing/services/CryptoService';
import { OfflineActivationEngine } from '../src/features/licensing/engines/OfflineActivationEngine';
import { LICENSING_TRANSLATIONS } from '../src/features/licensing/translations/licensingTranslations';
import { isUserBuild, assertAdminContext } from '../src/config/appMode';

test('1. Première exécution sans licence -> Détection UNLICENSED', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const initResult = await service.initialize();
  assert.equal(initResult.isValid, false);
  assert.equal(initResult.code, 'NO_LICENSE');
  assert.equal(initResult.status, 'pending_activation');
});

test('2. Affichage requis de l\'écran d\'activation (ACTIVATION_REQUIRED)', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);
  const active = await service.getActiveLicense();

  assert.equal(active, null);
  const validation = await service.validateCurrentLicense();
  assert.equal(validation.isValid, false);
  assert.equal(validation.deviceRegistered, false);
});

test('3. Saisie d\'une clé valide -> Validation réussie', async () => {
  const repo = new InMemoryLicenseRepository();
  // Generate a valid license in admin mode first
  process.env.VITE_APP_MODE = 'admin';
  const genLicense = await LicenseGenerator.generateLicense({
    holderName: 'Jean Dupont',
    type: 'beta',
    durationDays: 365,
  });
  await repo.saveLicense(genLicense);
  process.env.VITE_APP_MODE = 'user';

  const service = new LicensingService(repo);
  const formatCheck = KeyValidator.validateFormat(genLicense.key);
  assert.equal(formatCheck.isValid, true);

  const actResult = await service.activateKey(genLicense.key, 'Jean Dupont');
  assert.equal(actResult.isValid, true);
  assert.equal(actResult.code, 'ACTIVATION_SUCCESS');
});

test('4. Saisie d\'une clé invalide / non enregistrée -> Refus', async () => {
  const repo = new InMemoryLicenseRepository();
  const service = new LicensingService(repo);

  const prevOnLine = typeof globalThis.navigator !== 'undefined' ? globalThis.navigator.onLine : true;
  if (typeof globalThis.navigator !== 'undefined') {
    Object.defineProperty(globalThis.navigator, 'onLine', { value: false, configurable: true });
  }

  const actResult = await service.activateKey('LMSE-COMM-9999-8888-7777', 'Utilisateur Inconnu');

  if (typeof globalThis.navigator !== 'undefined') {
    Object.defineProperty(globalThis.navigator, 'onLine', { value: prevOnLine, configurable: true });
  }

  assert.equal(actResult.isValid, false);
  assert.equal(actResult.code, 'KEY_NOT_FOUND');
});

test('5. Saisie d\'une clé malformée -> Refus par KeyValidator', async () => {
  const malformedKeys = ['INVALID_KEY', '12345', 'LMSE-1234', 'ABC-DEF-GHI-JKL'];
  for (const k of malformedKeys) {
    const val = KeyValidator.validateFormat(k);
    assert.equal(val.isValid, false, `Key ${k} should be invalid`);
  }
});

test('6. Clé avec Checksum invalide -> Corruption détectée', async () => {
  const repo = new InMemoryLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const validLic = await LicenseGenerator.generateLicense({ holderName: 'Tamper Test', type: 'commercial' });
  process.env.VITE_APP_MODE = 'user';

  const corruptedLic = { ...validLic, checksum: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' };
  await repo.saveLicense(corruptedLic);

  const service = new LicensingService(repo);
  const actResult = await service.activateKey(corruptedLic.key, 'Tamper Test');
  assert.equal(actResult.isValid, false);
  assert.equal(actResult.code, 'CORRUPTED');
});

test('7. Signature invalide -> Intégrité compromise', async () => {
  const repo = new InMemoryLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const validLic = await LicenseGenerator.generateLicense({ holderName: 'Bad Signature Test', type: 'commercial' });
  process.env.VITE_APP_MODE = 'user';

  const badSigLic = { ...validLic, signature: 'BAD_SIG_VAL' };
  await repo.saveLicense(badSigLic);

  const service = new LicensingService(repo);
  const actResult = await service.activateKey(badSigLic.key, 'Bad Signature Test');
  assert.equal(actResult.isValid, false);
  assert.equal(actResult.code, 'CORRUPTED');
});

test('8. Licence expirée -> Bloquée', async () => {
  const repo = new InMemoryLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const expiredLic = await LicenseGenerator.generateLicense({
    holderName: 'Expired User',
    type: 'temporary',
    durationDays: -10, // expired 10 days ago
  });
  process.env.VITE_APP_MODE = 'user';

  await repo.saveLicense(expiredLic);
  const service = new LicensingService(repo);

  const actResult = await service.activateKey(expiredLic.key, 'Expired User');
  assert.equal(actResult.isValid, false);
  assert.equal(actResult.code, 'EXPIRED');
});

test('9. Licence révoquée -> Bloquée', async () => {
  const repo = new InMemoryLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const lic = await LicenseGenerator.generateLicense({ holderName: 'Revoked User', type: 'commercial' });
  process.env.VITE_APP_MODE = 'user';

  await repo.saveLicense(lic);
  await repo.addToRevocationList(lic.key);

  const service = new LicensingService(repo);
  const actResult = await service.activateKey(lic.key, 'Revoked User');
  assert.equal(actResult.isValid, false);
  assert.equal(actResult.code, 'LICENSE_REVOKED');
});

test('10. Limite d\'appareils atteinte -> DEVICE_LIMIT_EXCEEDED', async () => {
  const repo = new InMemoryLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const lic = await LicenseGenerator.generateLicense({
    holderName: 'Single Device User',
    type: 'beta',
    maxDevices: 1,
  });
  process.env.VITE_APP_MODE = 'user';

  // Pre-fill activation with another device
  lic.activations.push({
    id: 'act_other',
    licenseId: lic.id,
    licenseKey: lic.key,
    fingerprint: {
      deviceId: 'DEV-OTHER-999',
      os: 'Windows',
      browserHash: 'h1',
      screenSpec: '1080p',
      timezone: 'UTC',
      language: 'fr',
      hardwareConcurrency: 4,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    },
    activatedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    isOffline: false,
  });

  await repo.saveLicense(lic);
  const service = new LicensingService(repo);

  const actResult = await service.activateKey(lic.key, 'Single Device User');
  assert.equal(actResult.isValid, false);
  assert.equal(actResult.code, 'DEVICE_LIMIT_EXCEEDED');
});

test('11. Activation réussie -> État LICENSED', async () => {
  const repo = new InMemoryLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const lic = await LicenseGenerator.generateLicense({ holderName: 'Eleveur Pro', type: 'commercial' });
  process.env.VITE_APP_MODE = 'user';

  await repo.saveLicense(lic);
  const service = new LicensingService(repo);

  const res = await service.activateKey(lic.key, 'Eleveur Pro');
  assert.equal(res.isValid, true);
  assert.equal(res.code, 'ACTIVATION_SUCCESS');

  const active = await repo.getActiveLicense();
  assert.ok(active !== null);
  assert.equal(active?.key, lic.key);
});

test('12. Redémarrage -> Licence valide reconnue sans redemander la clé', async () => {
  const repo = new LocalStorageLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const lic = await LicenseGenerator.generateLicense({ holderName: 'User Restart Test', type: 'commercial' });
  process.env.VITE_APP_MODE = 'user';

  await repo.saveLicense(lic);
  const service1 = new LicensingService(repo);
  await service1.activateKey(lic.key, 'User Restart Test');

  // Simulate reboot with fresh service instance
  const service2 = new LicensingService(repo);
  const val = await service2.initialize();
  assert.equal(val.isValid, true);
  assert.equal(val.code, 'VALID');
});

test('13. Fonctionnement Offline après activation', async () => {
  const repo = new InMemoryLicenseRepository();
  process.env.VITE_APP_MODE = 'admin';
  const lic = await LicenseGenerator.generateLicense({ holderName: 'Offline User', type: 'enterprise' });
  process.env.VITE_APP_MODE = 'user';

  await repo.saveLicense(lic);
  const service = new LicensingService(repo);
  await service.activateKey(lic.key, 'Offline User');

  // Offline validation check
  const val = await service.validateCurrentLicense();
  assert.equal(val.isValid, true);
});

test('14. Altération du stockage -> Corruption / récupération requise', async () => {
  const repo = new LocalStorageLicenseRepository();
  globalThis.localStorage.setItem('bird_academy_lmse_active_license', '{"invalid_json": true}');

  const service = new LicensingService(repo);
  const val = await service.validateCurrentLicense();
  assert.equal(val.isValid, false);
});

test('15. Multilingue -> Présence des traductions (FR, EN, AR, ES, IT)', () => {
  const langs = ['fr', 'en', 'ar', 'es', 'it'] as const;
  for (const lang of langs) {
    const dict = LICENSING_TRANSLATIONS[lang];
    assert.ok(dict, `Language ${lang} should exist`);
    assert.ok(dict.welcomeTitle, `welcomeTitle should exist in ${lang}`);
    assert.ok(dict.welcomeSub, `welcomeSub should exist in ${lang}`);
    assert.ok(dict.activateAppBtn, `activateAppBtn should exist in ${lang}`);
  }
});

test('16. Support Arabe RTL -> Attributs et traduction présents', () => {
  const arDict = LICENSING_TRANSLATIONS['ar'];
  assert.ok(arDict.welcomeTitle.includes('Bird Academy'));
  assert.ok(arDict.activateAppBtn.includes('تفعيل'));
});

test('17. Structure Responsive Mobile -> Verification des classes Tailwind & AppCard', () => {
  const componentPath = path.resolve(process.cwd(), 'src/features/licensing/components/FirstLaunchActivationScreen.tsx');
  const content = fs.readFileSync(componentPath, 'utf-8');
  assert.ok(content.includes('max-w-xl'), 'Should contain responsive container constraints');
  assert.ok(content.includes('dir={isRtl ? \'rtl\' : \'ltr\'}'), 'Should apply dynamic RTL attribute');
});

test('18. Tentative d\'accès /api/admin depuis USER App -> Refusée', () => {
  assert.equal(isUserBuild(), true);
  assert.throws(() => assertAdminContext(), /SECURITY_ERROR/);
});

test('19. Absence des composants Admin dans le bundle et bootstrap USER', () => {
  const appContent = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
  assert.equal(appContent.includes('AdminCenterView'), false);
  assert.equal(appContent.includes('AdminApp'), false);
  assert.equal(appContent.includes('LicensingAdminPage'), false);
  assert.equal(appContent.includes('LicenseGenerator'), false);
});

test('20. Aucun secret privé ou clé de signature administrative dans le bundle USER', async () => {
  assert.equal(isUserBuild(), true);
  await assert.rejects(async () => {
    await CryptoService.generateSignature('test_payload');
  }, /SECURITY_ERROR/);
});

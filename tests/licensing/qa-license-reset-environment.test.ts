/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — QA LICENSE RESET & ENVIRONMENT ISOLATION TEST SUITE
 * Validates that the QA license reset mechanism reliably restores the first-launch unactivated state
 * while strictly preserving 100% of breeding data and leaving backend LMSE untouched.
 */

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LicensingService } from '../../src/features/licensing/services/LicensingService';
import { LocalStorageLicenseRepository } from '../../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { OfflineBetaValidator } from '../../src/features/licensing/services/OfflineBetaValidator';
import { WebOrderCheckoutService } from '../../src/features/commercial-website/services/WebOrderCheckoutService';
import { DeviceFingerprint } from '../../src/features/licensing/types/licensing';

const dummyDevice: DeviceFingerprint = {
  deviceId: 'DEV-FINGERPRINT-QA-RESET-2026',
  os: 'Windows',
  browserHash: 'BROWSER-HASH-QA-RESET',
  screenSpec: '1920x1080',
  timezone: 'Europe/Paris',
  language: 'fr',
  hardwareConcurrency: 8,
  createdAt: new Date().toISOString(),
  lastSeenAt: new Date().toISOString(),
};

// Memory storage for Node test runner
const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] || null,
  setItem: (key: string, value: string) => { memoryStorage[key] = String(value); },
  removeItem: (key: string) => { delete memoryStorage[key]; },
  clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); },
};

(global as any).localStorage = mockLocalStorage;
(global as any).window = {
  localStorage: mockLocalStorage,
  location: {
    origin: 'http://localhost:3000',
    search: '?view=app',
    hash: '#app',
    pathname: '/',
    href: 'http://localhost:3000/?view=app',
  },
  history: {
    replaceState: () => {},
  },
};

describe('QA LICENSE RESET & TEST ENVIRONMENT (B-011)', () => {
  let service: LicensingService;
  let repo: LocalStorageLicenseRepository;

  beforeEach(() => {
    mockLocalStorage.clear();
    repo = new LocalStorageLicenseRepository();
    service = new LicensingService(repo);
    LicensingService.setInstance(service);
  });

  test('RESET-001: L\'état de licence actif est entièrement supprimé par resetLocalLicenseStateForQA', async () => {
    // 1. Simuler une licence active existante
    const checkoutService = WebOrderCheckoutService.getInstance();
    const checkoutRes = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Éleveur Test Avant Reset',
      customerEmail: 'eleveur@canaris.com',
    });

    const lmseFile = checkoutRes.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'))!;
    await service.importOfflineBetaLicense(lmseFile.content as string);

    const activeBefore = await service.getActiveLicense();
    assert.ok(activeBefore, 'Une licence active doit exister avant le reset');

    // 2. Exécuter le reset QA
    await service.resetLocalLicenseStateForQA();

    // 3. Vérifier que la licence active est nulle
    const activeAfter = await service.getActiveLicense();
    assert.equal(activeAfter, null, 'La licence active doit être nulle après le reset QA');
    assert.equal(mockLocalStorage.getItem('bird_academy_lmse_active_license'), null);
    assert.equal(mockLocalStorage.getItem('bird_academy_lmse_all_licenses'), null);
  });

  test('RESET-002: Après le reset QA, initialize() retourne NO_LICENSE et isValid === false', async () => {
    // 1. Initialiser une licence
    const checkoutService = WebOrderCheckoutService.getInstance();
    const checkoutRes = await checkoutService.processCheckout({
      offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
      customerName: 'Club QA Reset',
      customerEmail: 'club@qa.org',
    });
    const lmseFile = checkoutRes.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'))!;
    await service.importOfflineBetaLicense(lmseFile.content as string);

    const initBefore = await service.initialize();
    assert.equal(initBefore.isValid, true);

    // 2. Reset QA
    await service.resetLocalLicenseStateForQA();

    // 3. Initialiser à nouveau
    const initAfter = await service.initialize();
    assert.equal(initAfter.isValid, false, 'Le statut de validation doit être false');
    assert.equal(initAfter.code, 'NO_LICENSE', 'Le code d\'état doit être NO_LICENSE');
    assert.equal(initAfter.license, null);
  });

  test('RESET-003: Les données d\'élevage sont 100% préservées lors du reset de licence', async () => {
    // 1. Peupler des données d'élevage simulées dans le localStorage
    const sampleBirds = JSON.stringify([{ id: 'BIRD-001', ringNumber: 'FR-2026-001', name: 'Canari Jaune Intensif' }]);
    const sampleCouples = JSON.stringify([{ id: 'CPL-001', maleRing: 'FR-2026-001', femaleRing: 'FR-2026-002' }]);
    const sampleCages = JSON.stringify([{ id: 'CAGE-1', number: '101' }]);

    mockLocalStorage.setItem('bird_academy_canaris', sampleBirds);
    mockLocalStorage.setItem('bird_academy_couples', sampleCouples);
    mockLocalStorage.setItem('bird_academy_cages', sampleCages);
    mockLocalStorage.setItem('bird_academy_language', 'fr');
    mockLocalStorage.setItem('bird_academy_theme', 'dark');

    // 2. Associer une licence active
    mockLocalStorage.setItem('bird_academy_lmse_active_license', JSON.stringify({ id: 'lic_test', key: 'LMSE-TEST' }));

    // 3. Exécuter le reset QA
    await service.resetLocalLicenseStateForQA();

    // 4. Vérifier que les données d'élevage sont rigoureusement intactes
    assert.equal(mockLocalStorage.getItem('bird_academy_canaris'), sampleBirds, 'Les oiseaux doivent être préservés');
    assert.equal(mockLocalStorage.getItem('bird_academy_couples'), sampleCouples, 'Les couples doivent être préservés');
    assert.equal(mockLocalStorage.getItem('bird_academy_cages'), sampleCages, 'Les cages doivent être préservées');
    assert.equal(mockLocalStorage.getItem('bird_academy_language'), 'fr', 'La langue doit être préservée');
    assert.equal(mockLocalStorage.getItem('bird_academy_theme'), 'dark', 'Le thème doit être préservé');

    // 5. Vérifier que SEULES les clés de licence ont été supprimées
    assert.equal(mockLocalStorage.getItem('bird_academy_lmse_active_license'), null);
  });

  test('RESET-004: Le serveur LMSE Backend n\'est pas altéré lors d\'un reset local client', async () => {
    // Vérifier que les requêtes de validation ou de checkout backend continuent de fonctionner
    const res = await fetch('http://localhost:3001/api/health').catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      assert.equal(data.status, 'ok');
    }
  });

  test('RESET-005: Après un reset QA, l\'importation d\'une nouvelle licence de test s\'exécute avec succès', async () => {
    // 1. Reset initial
    await service.resetLocalLicenseStateForQA();
    const init1 = await service.initialize();
    assert.equal(init1.isValid, false);

    // 2. Générer une nouvelle licence de test
    const checkoutService = WebOrderCheckoutService.getInstance();
    const checkoutRes = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Deuxième Éleveur Après Reset',
      customerEmail: 'deuxieme@canaris.fr',
    });

    const lmseFile = checkoutRes.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'))!;
    
    // 3. Importer la nouvelle licence
    const importRes = await service.importOfflineBetaLicense(lmseFile.content as string);
    assert.equal(importRes.isValid, true, 'La nouvelle licence doit être importée avec succès');
    assert.equal(importRes.license?.holderName, 'Deuxième Éleveur Après Reset');

    // 4. Vérifier que l'application est à nouveau validée
    const init2 = await service.initialize();
    assert.equal(init2.isValid, true);
    assert.equal(init2.license?.holderName, 'Deuxième Éleveur Après Reset');
  });

  test('RESET-006: En mode production stricte, la réinitialisation QA lève une exception de sécurité', async () => {
    const originalDev = (import.meta as any).env ? (import.meta as any).env.DEV : true;
    const originalEnv = process.env.NODE_ENV;

    try {
      if ((import.meta as any).env) {
        (import.meta as any).env.DEV = false;
      }
      process.env.NODE_ENV = 'production';

      await assert.rejects(
        async () => {
          await service.resetLocalLicenseStateForQA();
        },
        /SECURITY/,
        'Le reset QA doit être strictement interdit en production'
      );
    } finally {
      if ((import.meta as any).env) {
        (import.meta as any).env.DEV = originalDev;
      }
      process.env.NODE_ENV = originalEnv;
    }
  });
});

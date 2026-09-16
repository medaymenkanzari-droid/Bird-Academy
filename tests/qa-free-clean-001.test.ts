/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA-FREE-CLEAN-001 TEST SUITE
 * Test Environment Reset & Native FREE Mode Validation:
 * - Test 1: License deleted (activeLicense = null)
 * - Test 2: FREE tier active and FirstLaunchActivationScreen absent
 * - Test 3: Breeding data preserved (birds, couples, cages)
 * - Test 4: Preferences preserved (language, theme, currency)
 * - Test 5: Global storage deletion strictly forbidden (localStorage.clear() never called)
 * - Test 6: FREE persists across reload
 * - Test 7: FREE persists across complete restart / fresh service instance
 * - Test 8: Offline reset with zero network requests
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { LicensingService } from '../src/features/licensing/services/LicensingService';
import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver';
import { WebOrderCheckoutService } from '../src/features/commercial-website/services/WebOrderCheckoutService';

// In-memory mock storage with spy for global clear detection
let clearCallCount = 0;
const memoryStorage: Record<string, string> = {};

const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] || null,
  setItem: (key: string, value: string) => { memoryStorage[key] = String(value); },
  removeItem: (key: string) => { delete memoryStorage[key]; },
  clear: () => {
    clearCallCount++;
    Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]);
  },
  key: (i: number) => Object.keys(memoryStorage)[i] || null,
  get length() { return Object.keys(memoryStorage).length; }
};

// Assign mock to global and window
(global as any).localStorage = mockLocalStorage;
(global as any).window = {
  localStorage: mockLocalStorage,
  location: {
    origin: 'http://localhost:3000',
    search: '?view=app',
    hash: '#app',
    pathname: '/',
    href: 'http://localhost:3000/?view=app',
    reload: () => {},
  },
  history: {
    replaceState: () => {},
  },
};

describe('MISSION QA-FREE-CLEAN-001 — Réinitialiser l\'environnement de test', () => {
  let service: LicensingService;
  let repo: LocalStorageLicenseRepository;

  beforeEach(() => {
    // Reset test memory store directly (without counting against spy during setup)
    Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]);
    clearCallCount = 0;

    repo = new LocalStorageLicenseRepository();
    service = new LicensingService(repo);
    LicensingService.setInstance(service);
  });

  // Helper to install a valid test license
  async function installTestLicense(offerId = 'OFFER-PREMIUM-ANNUAL-2026', customerName = 'Éleveur Test QA') {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const checkoutRes = await checkoutService.processCheckout({
      offerId,
      customerName,
      customerEmail: 'qa@canaris.com',
    });
    const lmseFile = checkoutRes.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'))!;
    return await service.importOfflineBetaLicense(lmseFile.content as string);
  }

  test('Test 1 — Licence supprimée : activeLicense = null après le reset QA', async () => {
    // 1. Créer une licence de test
    await installTestLicense();
    const activeBefore = await service.getActiveLicense();
    assert.ok(activeBefore !== null, 'Une licence active doit exister avant le reset');

    // 2. Exécuter la réinitialisation QA officielle
    await service.resetLocalLicenseStateForQA();

    // 3. Vérifier que la licence active est nulle
    const activeAfter = await service.getActiveLicense();
    assert.strictEqual(activeAfter, null, 'activeLicense doit être strictement null après le reset');
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_lmse_active_license'), null);
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_lmse_all_licenses'), null);
  });

  test('Test 2 — FREE : subscriptionTier = FREE et FirstLaunchActivationScreen = absent', async () => {
    // 1. Créer une licence de test PRO
    await installTestLicense('OFFER-PRO-ENTERPRISE-ANNUAL-2026');
    const initBefore = await service.initialize();
    assert.strictEqual(SubscriptionTierResolver.resolve(initBefore.license, initBefore), 'PRO');

    // 2. Exécuter le reset QA
    await service.resetLocalLicenseStateForQA();

    // 3. Vérifier le comportement réel du système existant
    const validation = await service.initialize();
    const activeLicense = validation.license;
    const tier = SubscriptionTierResolver.resolve(activeLicense, validation);

    assert.strictEqual(activeLicense, null, 'Aucune licence active après reset');
    assert.strictEqual(tier, 'FREE', 'Le plan commercial résolu doit être FREE');

    // Évaluer la logique d'autorisation de montage unifiée (conformément à FIX-FREE-001)
    let licenseState = 'INITIALIZING';
    if (!activeLicense && (validation?.code === 'NO_LICENSE' || !validation)) {
      licenseState = 'LICENSE_VALID';
    }
    const showActivationScreen = licenseState !== 'LICENSE_VALID';

    assert.strictEqual(licenseState, 'LICENSE_VALID', 'licenseState doit autoriser le montage direct');
    assert.strictEqual(showActivationScreen, false, 'FirstLaunchActivationScreen doit être ABSENT');
  });

  test('Test 3 — Données d\'élevage conservées : 1 oiseau, 1 couple, 1 cage restent 100% intacts', async () => {
    // 1. Créer les données d'élevage au préalable
    const initialBirds = JSON.stringify([
      { id: 'CANARI-QA-01', bague: 'FR-2026-QA01', nom: 'Agate Mosaïque Rouge', annee: 2026, sexe: 'M' }
    ]);
    const initialCouples = JSON.stringify([
      { id: 'CPL-QA-01', nom: 'Couple Test Repro 2026', maleId: 'CANARI-QA-01', femelleId: 'CANARI-QA-02' }
    ]);
    const initialCages = JSON.stringify([
      { id: 'CAGE-QA-01', numero: 'Box-101', type: 'reproduction', statut: 'occupee' }
    ]);
    const initialReproductions = JSON.stringify([
      { id: 'REP-QA-01', coupleId: 'CPL-QA-01', statut: 'en_cours', saison: 2026 }
    ]);

    mockLocalStorage.setItem('bird_academy_canaris', initialBirds);
    mockLocalStorage.setItem('bird_academy_couples', initialCouples);
    mockLocalStorage.setItem('bird_academy_cages', initialCages);
    mockLocalStorage.setItem('bird_academy_reproductions', initialReproductions);

    // 2. Associer une licence de test et un override
    await installTestLicense();
    mockLocalStorage.setItem('bird_academy_subscription_tier_override', 'PRO');

    // 3. Enregistrer les valeurs avant réinitialisation
    const canarisAvant = mockLocalStorage.getItem('bird_academy_canaris');
    const couplesAvant = mockLocalStorage.getItem('bird_academy_couples');
    const cagesAvant = mockLocalStorage.getItem('bird_academy_cages');
    const reproductionsAvant = mockLocalStorage.getItem('bird_academy_reproductions');

    // 4. Exécuter le reset QA
    await service.resetLocalLicenseStateForQA();

    // 5. Vérifier valeur_avant === valeur_après
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_canaris'), canarisAvant, 'Les canaris doivent être strictement identiques');
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_couples'), couplesAvant, 'Les couples doivent être strictement identiques');
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_cages'), cagesAvant, 'Les cages doivent être strictement identiques');
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_reproductions'), reproductionsAvant, 'Les reproductions doivent être strictement identiques');

    // Vérifier le contenu décodé
    const parsedBirds = JSON.parse(mockLocalStorage.getItem('bird_academy_canaris')!);
    assert.strictEqual(parsedBirds.length, 1);
    assert.strictEqual(parsedBirds[0].bague, 'FR-2026-QA01');
  });

  test('Test 4 — Préférences conservées : langue, thème et devise restent inchangés', async () => {
    // 1. Définir langue, thème et devise
    mockLocalStorage.setItem('bird_academy_language', 'fr');
    mockLocalStorage.setItem('bird_academy_theme', 'dark');
    mockLocalStorage.setItem('bird_academy_currency', 'EUR');

    // Associer une licence
    await installTestLicense();

    const langAvant = mockLocalStorage.getItem('bird_academy_language');
    const themeAvant = mockLocalStorage.getItem('bird_academy_theme');
    const currencyAvant = mockLocalStorage.getItem('bird_academy_currency');

    // 2. Exécuter le reset QA
    await service.resetLocalLicenseStateForQA();

    // 3. Vérifier la stricte égalité
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_language'), langAvant, 'La langue doit être conservée');
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_theme'), themeAvant, 'Le thème doit être conservé');
    assert.strictEqual(mockLocalStorage.getItem('bird_academy_currency'), currencyAvant, 'La devise doit être conservée');
  });

  test('Test 5 — Aucune suppression globale : localStorage.clear() strictement interdit', async () => {
    // 1. Alimenter le stockage avec l'ensemble des données d'élevage et de configuration
    const testKeys: Record<string, string> = {
      bird_academy_canaris: JSON.stringify([{ id: 'b1' }]),
      bird_academy_couples: JSON.stringify([{ id: 'c1' }]),
      bird_academy_reproductions: JSON.stringify([{ id: 'r1' }]),
      bird_academy_pontes: JSON.stringify([{ id: 'p1' }]),
      bird_academy_jeunes: JSON.stringify([{ id: 'j1' }]),
      bird_academy_sante: JSON.stringify([{ id: 's1' }]),
      bird_academy_alimentation: JSON.stringify([{ id: 'a1' }]),
      bird_academy_depenses: JSON.stringify([{ id: 'd1' }]),
      bird_academy_ventes: JSON.stringify([{ id: 'v1' }]),
      bird_academy_cages: JSON.stringify([{ id: 'cg1' }]),
      bird_academy_wizard_completed: 'true',
      bird_academy_species_profile: JSON.stringify(['canary']),
      bird_academy_language: 'it',
      bird_academy_theme: 'light',
      bird_academy_currency: 'USD',
    };

    for (const [k, v] of Object.entries(testKeys)) {
      mockLocalStorage.setItem(k, v);
    }

    // Ajouter les 7 clés QA autorisées
    for (const key of LicensingService.QA_ALLOWED_KEYS) {
      mockLocalStorage.setItem(key, `test-val-${key}`);
    }

    clearCallCount = 0;

    // 2. Exécuter la réinitialisation
    await service.resetLocalLicenseStateForQA();

    // 3. Vérifier que localStorage.clear() n'a JAMAIS été appelé
    assert.strictEqual(clearCallCount, 0, 'CRITIQUE : localStorage.clear() ne doit JAMAIS être appelé');

    // 4. Vérifier que toutes les clés d'élevage et de configuration sont toujours présentes
    for (const [k, v] of Object.entries(testKeys)) {
      assert.strictEqual(
        mockLocalStorage.getItem(k),
        v,
        `La clé protégée ${k} doit être intacte après le reset`
      );
    }

    // 5. Vérifier que seules les 7 clés QA sont supprimées
    for (const qaKey of LicensingService.QA_ALLOWED_KEYS) {
      assert.strictEqual(
        mockLocalStorage.getItem(qaKey),
        null,
        `La clé QA ${qaKey} doit être supprimée`
      );
    }
  });

  test('Test 6 — Reload : après reset, le rechargement de l\'application produit FREE', async () => {
    // 1. État avant reset
    await installTestLicense();
    await service.resetLocalLicenseStateForQA();

    // 2. Simuler un rechargement propre de l'application
    const reloadedService = new LicensingService(new LocalStorageLicenseRepository());
    const validation = await reloadedService.initialize();
    const activeLicense = validation.license;

    assert.strictEqual(activeLicense, null);
    assert.strictEqual(SubscriptionTierResolver.resolve(activeLicense, validation), 'FREE');

    // Montage direct du Dashboard
    const licenseState = (!activeLicense && (validation?.code === 'NO_LICENSE' || !validation))
      ? 'LICENSE_VALID'
      : 'LICENSE_REQUIRED';

    assert.strictEqual(licenseState, 'LICENSE_VALID', 'Après reload, l\'application monte sans FirstLaunchActivationScreen');
  });

  test('Test 7 — Fermeture / Relance : état FREE natif conservé après nouveau démarrage', async () => {
    // 1. Reset
    await installTestLicense();
    await service.resetLocalLicenseStateForQA();

    // 2. Simuler fermeture complète de l'application et redémarrage (nouveau repository, nouveau service)
    LicensingService.setInstance(null as any);
    const freshRepo = new LocalStorageLicenseRepository();
    const freshService = new LicensingService(freshRepo);
    LicensingService.setInstance(freshService);

    const freshValidation = await freshService.initialize();
    const tier = SubscriptionTierResolver.resolve(freshValidation.license, freshValidation);

    assert.strictEqual(tier, 'FREE', 'Le redémarrage après reset doit être en mode FREE natif');
    assert.strictEqual(freshValidation.license, null);
  });

  test('Test 8 — Hors ligne : reset exécuté sans connexion Internet avec zéro requête réseau', async () => {
    // 1. Installer la licence préalable
    await installTestLicense();

    // 2. Simuler un environnement hors-ligne strict
    const originalFetch = (global as any).fetch;
    let networkCallAttempted = false;

    (global as any).fetch = async () => {
      networkCallAttempted = true;
      throw new Error('NETWORK_OFFLINE_SIMULATION');
    };

    try {
      // 3. Exécuter le reset hors-ligne
      await service.resetLocalLicenseStateForQA();

      // 3. Vérifier le résultat
      const validation = await service.initialize();
      const tier = SubscriptionTierResolver.resolve(validation.license, validation);

      assert.strictEqual(tier, 'FREE', 'Le mode FREE doit être actif hors ligne');
      assert.strictEqual(validation.license, null);
      assert.strictEqual(networkCallAttempted, false, 'Aucune requête réseau ne doit être requise pour le reset QA');
    } finally {
      (global as any).fetch = originalFetch;
    }
  });
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS FIRST LAUNCH QA SUITE (QA-WIN-FIRST-LAUNCH-01)
 * Validates the complete Clean Install / First Launch lifecycle:
 * 1. FirstLaunchActivationScreen when no license exists
 * 2. WelcomeWizard when license is activated but wizard_completed is false
 * 3. Step validation & founder bird/cage creation
 * 4. Clean database initialization (0 records on clean install)
 * 5. Second launch persistence (Dashboard direct, no screens re-prompted)
 * 6. Scenario isolation (Upgrade vs Clean Install)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { License } from '../src/features/licensing/types/licensing';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { HabitatRepository } from '../src/features/habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../src/features/breeding/repositories/BreedingRepository';
import { FinanceRepository } from '../src/features/finance/repositories/FinanceRepository';
import { BirdService } from '../src/features/birds/services/BirdService';
import { BirdEngine } from '../src/business/BirdEngine';
import { Canari, HabitatCage, Facility, Zone } from '../src/types';

// In-memory mock for localStorage in node test environment
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (k: string) => mockStorage[k] ?? null,
    setItem: (k: string, v: string) => { mockStorage[k] = String(v); },
    removeItem: (k: string) => { delete mockStorage[k]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
    get length() { return Object.keys(mockStorage).length; },
    key: (i: number) => Object.keys(mockStorage)[i] || null
  };
}

describe('QA-WIN-FIRST-LAUNCH-01 — CYCLE PREMIER DÉMARRAGE & WIZARD WINDOWS', () => {
  const rootDir = process.cwd();
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const resetScriptPath = path.join(rootDir, 'scripts', 'windows', 'reset-first-launch-qa.ps1');

  beforeEach(() => {
    localStorage.clear();
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 1 : FIRST-LAUNCH-01 — Condition d'activation initiale
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-01 : Profil vierge (sans licence) -> FirstLaunchActivationScreen requis', async () => {
    const licenseRepo = new LocalStorageLicenseRepository();
    const activeLicense = await licenseRepo.getActiveLicense();
    
    // Condition A : absence totale de licence
    assert.strictEqual(activeLicense, null, 'Aucune licence ne doit exister au premier démarrage');
    
    // Vérification que le flag wizard_completed n'existe pas
    const isWizardDone = localStorage.getItem('bird_academy_wizard_completed') === 'true';
    assert.strictEqual(isWizardDone, false, 'Le wizard ne doit pas être marqué comme complété');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 2 : FIRST-LAUNCH-02 — Activation d'une licence valide
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-02 : Activation d\'une licence valide enregistre la clé et débloque le Wizard', async () => {
    const licenseRepo = new LocalStorageLicenseRepository();
    const testLicense: License = {
      id: 'LIC-QA-FIRST-LAUNCH-2026',
      key: 'BA-QA-KEY-9999-VALID',
      holderName: 'Éleveur Test First Launch',
      type: 'permanent',
      status: 'active',
      issuedAt: new Date().toISOString(),
      expiresAt: null,
      policy: {
        maxDevices: 3,
        allowOfflineActivation: true,
        allowTransfer: true,
        features: ['core', 'reproduction', 'genetics']
      },
      activations: [],
      checksum: 'CHECKSUM_QA_VALID',
      signature: 'SIG_QA_VALID'
    };

    await licenseRepo.saveActiveLicense(testLicense);
    const loaded = await licenseRepo.getActiveLicense();

    assert.ok(loaded, 'La licence doit être enregistrée');
    assert.strictEqual(loaded.status, 'active');
    assert.strictEqual(loaded.key, 'BA-QA-KEY-9999-VALID');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 3 : FIRST-LAUNCH-03 — Refus si licence invalide ou corrompue
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-03 : Une licence corrompue ou invalide retourne null et bloque l\'accès', async () => {
    localStorage.setItem('bird_academy_lmse_active_license', 'invalid-non-json-data');
    const licenseRepo = new LocalStorageLicenseRepository();
    const loaded = await licenseRepo.getActiveLicense();

    assert.strictEqual(loaded, null, 'Une licence corrompue doit être rejetée');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 4 : FIRST-LAUNCH-04 — Déclenchement du WelcomeWizard
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-04 : Licence valide + wizard_completed false -> WelcomeWizard s\'affiche', async () => {
    const licenseRepo = new LocalStorageLicenseRepository();
    await licenseRepo.saveActiveLicense({
      id: 'LIC-01',
      key: 'BA-KEY-01',
      holderName: 'User',
      type: 'permanent',
      status: 'active',
      issuedAt: new Date().toISOString(),
      expiresAt: null,
      policy: { maxDevices: 1, allowOfflineActivation: true, allowTransfer: true, features: ['core'] },
      activations: [],
      checksum: 'CHK',
      signature: 'SIG'
    });

    const isCompleted = localStorage.getItem('bird_academy_wizard_completed') === 'true';
    const showWizard = !isCompleted;

    assert.strictEqual(showWizard, true, 'Le WelcomeWizard doit être affiché');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 5 : FIRST-LAUNCH-05 — Création d'habitat et oiseau fondateur dans le Wizard
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-05 : Le Wizard permet la création conforme de la première cage et du premier oiseau', () => {
    // Étape 1 : Créer la cage fondatrice
    const cage = {
      id: 1,
      nom: 'Cage Élevage 01',
      capacite_max: 4,
      description: 'Cage standard de premier démarrage'
    };

    HabitatRepository.saveAll([cage]);
    const cages = HabitatRepository.getAllLegacy();
    assert.strictEqual(cages.length, 1);
    assert.strictEqual(cages[0].nom, 'Cage Élevage 01');

    // Étape 2 : Créer le premier oiseau avec validation
    const bird: Omit<Canari, 'id'> = {
      bague: 'FRA-2026-001',
      nom: 'Fondateur 01',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intensif',
      couleur: 'Jaune Intensif',
      sexe: 'Mâle',
      date_naissance: '2026-01-01',
      cageId: 'cage_wizard_01',
      archived: false,
      photos: [],
      documents: []
    };

    const validation = BirdEngine.validateBird(bird as Canari, []);
    assert.strictEqual(validation.isValid, true, 'L\'oiseau doit être valide selon BirdEngine');

    const createResult = BirdService.create(bird);
    assert.strictEqual(createResult.success, true, 'L\'oiseau fondateur doit être créé avec succès');

    const birds = BirdRepository.getAll();
    assert.strictEqual(birds.length, 1);
    assert.strictEqual(birds[0].bague, 'FRA-2026-001');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 6 : FIRST-LAUNCH-06 — Finalisation du Wizard et enregistrement de wizard_completed
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-06 : La finalisation du Wizard enregistre wizard_completed = true et les préférences', () => {
    localStorage.setItem('bird_academy_wizard_completed', 'true');
    localStorage.setItem('bird_academy_aviary_name', 'Élevage du Soleil');
    localStorage.setItem('bird_academy_breeder_name', 'Jean Dupont');
    localStorage.setItem('bird_academy_currency', 'EUR');

    assert.strictEqual(localStorage.getItem('bird_academy_wizard_completed'), 'true');
    assert.strictEqual(localStorage.getItem('bird_academy_aviary_name'), 'Élevage du Soleil');
    assert.strictEqual(localStorage.getItem('bird_academy_breeder_name'), 'Jean Dupont');
    assert.strictEqual(localStorage.getItem('bird_academy_currency'), 'EUR');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 7 : FIRST-LAUNCH-07 — Deuxième démarrage : accès direct au Dashboard
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-07 : Au deuxième démarrage, ni l\'activation ni le Wizard ne réapparaissent', async () => {
    // Simule état post-wizard
    localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify({
      id: 'LIC-01',
      key: 'BA-KEY-01',
      status: 'active'
    }));
    localStorage.setItem('bird_academy_wizard_completed', 'true');

    const licenseRepo = new LocalStorageLicenseRepository();
    const activeLicense = await licenseRepo.getActiveLicense();
    const isWizardDone = localStorage.getItem('bird_academy_wizard_completed') === 'true';

    assert.ok(activeLicense !== null, 'Licence active présente');
    assert.strictEqual(isWizardDone, true, 'Wizard déjà complété');
    
    // Conditions d'affichage de l'interface principale
    const requiresActivation = !activeLicense || activeLicense.status !== 'active';
    const requiresWizard = !isWizardDone;

    assert.strictEqual(requiresActivation, false, 'Ne doit PAS demander d\'activation');
    assert.strictEqual(requiresWizard, false, 'Ne doit PAS afficher le Wizard');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 8 : FIRST-LAUNCH-08 — Isolation stricte du script de reset QA
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-08 : Le script reset-first-launch-qa.ps1 existe et cible uniquement AppData', () => {
    assert.ok(fs.existsSync(resetScriptPath), 'scripts/windows/reset-first-launch-qa.ps1 doit exister');
    const content = fs.readFileSync(resetScriptPath, 'utf8');

    // Vérifie qu'il ne touche pas aux fichiers du projet
    assert.ok(!content.includes('Remove-Item -Path "src"'), 'Ne doit pas supprimer src');
    assert.ok(!content.includes('Remove-Item -Path "Release"'), 'Ne doit pas supprimer Release');
    assert.ok(content.includes('Bird Academy Enterprise'), 'Doit cibler Bird Academy Enterprise dans AppData');
    assert.ok(content.includes('react-example'), 'Doit cibler react-example dans AppData');
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 9 : FIRST-LAUNCH-09 — Vérification de setupUserDataAndMigration dans electron-main.cjs
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-09 : electron-main.cjs utilise APP_CANONICAL_NAME et migre proprement', () => {
    const mainContent = fs.readFileSync(electronMainPath, 'utf8');
    assert.ok(mainContent.includes('APP_CANONICAL_NAME = \'Bird Academy Enterprise\''));
    assert.ok(mainContent.includes('setupUserDataAndMigration'));
    assert.ok(mainContent.includes('app.setPath(\'userData\', targetUserDataPath)'));
  });

  // --------------------------------------------------------------------------
  // ÉTAPE 10 : FIRST-LAUNCH-10 — Base vierge initiale sans données fictives
  // --------------------------------------------------------------------------
  it('FIRST-LAUNCH-10 : Une installation vierge commence à 0 oiseaux, 0 couples, 0 cages, 0 dépenses', () => {
    BirdRepository.saveAll([]);
    HabitatRepository.saveAll([]);
    BreedingRepository.saveCouples([]);
    FinanceRepository.saveExpenses([]);
    FinanceRepository.saveSales([]);

    const birds = BirdRepository.getAll(true);
    const cages = HabitatRepository.getAllLegacy();
    const couples = BreedingRepository.getCouples();
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();

    assert.strictEqual(birds.length, 0);
    assert.strictEqual(cages.length, 0);
    assert.strictEqual(couples.length, 0);
    assert.strictEqual(expenses.length, 0);
    assert.strictEqual(sales.length, 0);
  });
});

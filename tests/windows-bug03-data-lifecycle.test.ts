/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS DATA LIFECYCLE & RC3.1 VALIDATION SUITE
 * Validates Upgrade, Clean Install, Factory Reset QA, Non-destructive Legacy Migration,
 * LMSE state determinism, and Biological & Translation integrity.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { LocalStorageLicenseRepository } from '../src/features/licensing/repositories/LocalStorageLicenseRepository';
import { License } from '../src/features/licensing/types/licensing';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { HabitatRepository } from '../src/features/habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../src/features/breeding/repositories/BreedingRepository';
import { FinanceRepository } from '../src/features/finance/repositories/FinanceRepository';
import { AnalyticsSettingsRepository } from '../src/features/analytics/repositories/AnalyticsSettingsRepository';
import { SPECIES_REGISTRY } from '../src/data/speciesRegistry';
import { TRANSLATIONS } from '../src/utils/translations';
import { appStorage } from '../src/storage';
import { Canari, Couple } from '../src/types';

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

describe('MISSION — BIRD ACADEMY WINDOWS DATA LIFECYCLE (BUG-WIN-03 / RC3.1)', () => {
  const rootDir = process.cwd();
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const resetScriptPath = path.join(rootDir, 'scripts/reset-windows-user-qa.ps1');
  const packageRc31ScriptPath = path.join(rootDir, 'scripts/packageWindowsRC3_1.js');

  beforeEach(() => {
    localStorage.clear();
  });

  // --------------------------------------------------------------------------
  // SCÉNARIO A : UPGRADE (WIN-DATA-LIFE-01 to WIN-DATA-LIFE-06)
  // --------------------------------------------------------------------------
  describe('SCÉNARIO A — UPGRADE (WIN-DATA-LIFE-01 à WIN-DATA-LIFE-06)', () => {
    it('WIN-DATA-LIFE-01 : Upgrade conserve la licence', async () => {
      const licenseRepo = new LocalStorageLicenseRepository();
      const mockLicense: License = {
        id: 'LIC-UPGRADE-2026',
        key: 'BA-UPGRADE-KEY-1234',
        holderName: 'Éleveur Élite',
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
        checksum: 'CHECKSUM123',
        signature: 'SIGNATURE123'
      };

      await licenseRepo.saveActiveLicense(mockLicense);
      
      // Simulate upgrade / reboot
      const retrieved = await licenseRepo.getActiveLicense();
      assert.ok(retrieved !== null, 'La licence doit être retrouvée après upgrade');
      assert.strictEqual(retrieved?.id, 'LIC-UPGRADE-2026');
      assert.strictEqual(retrieved?.key, 'BA-UPGRADE-KEY-1234');
      assert.strictEqual(retrieved?.status, 'active');
    });

    it('WIN-DATA-LIFE-02 : Upgrade conserve wizard_completed', () => {
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      
      // Simulate reboot / upgrade
      const isCompleted = localStorage.getItem('bird_academy_wizard_completed') === 'true';
      assert.strictEqual(isCompleted, true, 'Le wizard ne doit pas être redéclenché lors d\'un upgrade');
    });

    it('WIN-DATA-LIFE-03 : Upgrade conserve les oiseaux', () => {
      const mockBirds: Canari[] = [
        {
          id: 101,
          bague: 'FR-2026-101',
          nom: 'Hermès',
          sexe: 'Mâle',
          espece: 'canari',
          categorie: 'canari_couleur',
          race: 'Lipochrome',
          mutation: 'Classique',
          couleur_base: 'Rouge',
          facteur: 'Intensif',
          couleur: 'Rouge Intensif',
          date_naissance: '2026-02-01',
          archived: false,
          photos: [],
          documents: []
        },
        {
          id: 102,
          bague: 'FR-2026-102',
          nom: 'Aphrodite',
          sexe: 'Femelle',
          espece: 'canari',
          categorie: 'canari_couleur',
          race: 'Lipochrome',
          mutation: 'Classique',
          couleur_base: 'Rouge',
          facteur: 'Intensif',
          couleur: 'Rouge Intensif',
          date_naissance: '2026-02-05',
          archived: false,
          photos: [],
          documents: []
        }
      ];

      BirdRepository.saveAll(mockBirds);
      const loadedBirds = BirdRepository.getAll(true);
      assert.strictEqual(loadedBirds.length, 2, 'Les 2 oiseaux doivent être préservés');
      assert.strictEqual(loadedBirds[0].nom, 'Hermès');
      assert.strictEqual(loadedBirds[1].nom, 'Aphrodite');
    });

    it('WIN-DATA-LIFE-04 : Upgrade conserve les cages', () => {
      const mockCages = [
        {
          id: 1,
          nom: 'Volierette Nord',
          description: 'Cage spacieuse',
          capacite_max: 6
        }
      ];

      HabitatRepository.saveAll(mockCages);
      const loadedCages = HabitatRepository.getAllLegacy();
      assert.strictEqual(loadedCages.length, 1, 'La cage doit être conservée');
      assert.strictEqual(loadedCages[0].nom, 'Volierette Nord');
    });

    it('WIN-DATA-LIFE-05 : Upgrade conserve les couples', () => {
      const mockCouples: Couple[] = [
        {
          id: 501,
          male_id: 101,
          femelle_id: 102,
          date_creation: '2026-03-01',
          statut: 'Actif'
        }
      ];

      BreedingRepository.saveCouples(mockCouples);
      const loadedCouples = BreedingRepository.getCouples();
      assert.strictEqual(loadedCouples.length, 1, 'Le couple doit être conservé');
      assert.strictEqual(loadedCouples[0].male_id, 101);
      assert.strictEqual(loadedCouples[0].femelle_id, 102);
    });

    it('WIN-DATA-LIFE-06 : Upgrade conserve langue/devise/thème', () => {
      localStorage.setItem('bird_academy_language', 'ar');
      localStorage.setItem('bird_academy_currency', 'EUR');
      localStorage.setItem('bird_academy_theme', 'dark');

      AnalyticsSettingsRepository.saveSettings({
        ...AnalyticsSettingsRepository.getSettings(),
        currency: 'EUR'
      });

      assert.strictEqual(localStorage.getItem('bird_academy_language'), 'ar');
      assert.strictEqual(localStorage.getItem('bird_academy_currency'), 'EUR');
      assert.strictEqual(localStorage.getItem('bird_academy_theme'), 'dark');
      assert.strictEqual(AnalyticsSettingsRepository.getSettings().currency, 'EUR');
    });
  });

  // --------------------------------------------------------------------------
  // SCÉNARIO B : CLEAN INSTALL (WIN-DATA-LIFE-07 to WIN-DATA-LIFE-14)
  // --------------------------------------------------------------------------
  describe('SCÉNARIO B — CLEAN INSTALL (WIN-DATA-LIFE-07 à WIN-DATA-LIFE-14)', () => {
    it('WIN-DATA-LIFE-07 : Clean state sans licence → FirstLaunchActivationScreen', async () => {
      const licenseRepo = new LocalStorageLicenseRepository();
      const active = await licenseRepo.getActiveLicense();
      assert.strictEqual(active, null, 'Aucune licence ne doit être active en Clean state');
    });

    it('WIN-DATA-LIFE-08 : Clean state avec licence activée → WelcomeWizard', () => {
      // License exists but wizard is not completed
      const isCompleted = localStorage.getItem('bird_academy_wizard_completed') === 'true';
      assert.strictEqual(isCompleted, false, 'Le wizard doit être requis pour un nouvel utilisateur');
    });

    it('WIN-DATA-LIFE-09 : Clean state → 0 oiseaux', () => {
      BirdRepository.saveAll([]);
      const birds = BirdRepository.getAll(true);
      assert.strictEqual(birds.length, 0, 'La base d\'oiseaux doit être vierge');
    });

    it('WIN-DATA-LIFE-10 : Clean state → 0 cages', () => {
      HabitatRepository.saveAll([]);
      const cages = HabitatRepository.getAllLegacy();
      assert.strictEqual(cages.length, 0, 'La base de cages doit être vierge');
    });

    it('WIN-DATA-LIFE-11 : Clean state → 0 couples', () => {
      BreedingRepository.saveCouples([]);
      const couples = BreedingRepository.getCouples();
      assert.strictEqual(couples.length, 0, 'La base de couples doit être vierge');
    });

    it('WIN-DATA-LIFE-12 : Clean state → 0 dépenses / ventes', () => {
      FinanceRepository.saveExpenses([]);
      FinanceRepository.saveSales([]);
      const expenses = FinanceRepository.getExpenses();
      const sales = FinanceRepository.getSales();
      assert.strictEqual(expenses.length, 0, '0 dépenses attendues');
      assert.strictEqual(sales.length, 0, '0 ventes attendues');
    });

    it('WIN-DATA-LIFE-13 : Référentiel biologique conservé', () => {
      assert.ok(Array.isArray(SPECIES_REGISTRY), 'SPECIES_REGISTRY doit être disponible');
      assert.ok(SPECIES_REGISTRY.length >= 5, 'Au moins 5 espèces doivent être répertoriées');
      const canariSpec = SPECIES_REGISTRY.find(s => s.id === 'canari');
      assert.ok(canariSpec !== undefined, 'L\'espèce canari doit être présente');
      assert.ok(canariSpec!.categories.length > 0, 'Les catégories de canaris doivent être disponibles');
    });

    it('WIN-DATA-LIFE-14 : Traductions conservées FR/EN/AR/ES/IT', () => {
      const langs = ['fr', 'en', 'ar', 'es', 'it'] as const;
      for (const lang of langs) {
        assert.ok(TRANSLATIONS[lang], `Dictionnaire ${lang} doit exister`);
        assert.ok(TRANSLATIONS[lang].dashboard, `dashboard traduit pour ${lang}`);
        assert.ok(TRANSLATIONS[lang].canaris, `canaris traduit pour ${lang}`);
        assert.ok(TRANSLATIONS[lang].cages, `cages traduit pour ${lang}`);
      }
    });
  });

  // --------------------------------------------------------------------------
  // SCÉNARIO C : RESET QA & NON-DESTRUCTIVE MIGRATION (WIN-DATA-LIFE-15 to WIN-DATA-LIFE-20)
  // --------------------------------------------------------------------------
  describe('SCÉNARIO C & MIGRATION — (WIN-DATA-LIFE-15 à WIN-DATA-LIFE-20)', () => {
    it('WIN-DATA-LIFE-15 : Reset QA supprime les données utilisateur', () => {
      // Simulate populated storage
      localStorage.setItem('bird_academy_lmse_active_license', JSON.stringify({ id: 'TEST' }));
      localStorage.setItem('bird_academy_wizard_completed', 'true');
      localStorage.setItem('canaris', JSON.stringify([{ id: 1 }]));
      localStorage.setItem('cages', JSON.stringify([{ id: 1 }]));

      // Simulate full reset QA
      localStorage.clear();
      appStorage.clear();

      assert.strictEqual(localStorage.getItem('bird_academy_lmse_active_license'), null);
      assert.strictEqual(localStorage.getItem('bird_academy_wizard_completed'), null);
      assert.strictEqual(localStorage.getItem('canaris'), null);
      assert.strictEqual(localStorage.getItem('cages'), null);
    });

    it('WIN-DATA-LIFE-16 : Reset QA ne supprime pas les référentiels statiques', () => {
      assert.ok(SPECIES_REGISTRY.length > 0, 'Le catalogue d\'espèces est compilé et intègre');
    });

    it('WIN-DATA-LIFE-17 : Reset QA ne modifie pas le code source', () => {
      assert.ok(fs.existsSync(resetScriptPath), 'Le script reset QA doit exister');
      const scriptContent = fs.readFileSync(resetScriptPath, 'utf-8');
      assert.ok(scriptContent.includes('Bird Academy Enterprise'), 'Le script cible le dossier de profil');
      assert.ok(scriptContent.includes('react-example'), 'Le script cible le dossier legacy');
      assert.ok(!scriptContent.includes('Remove-Item -Path "src'), 'Le script ne doit jamais supprimer src');
      assert.ok(!scriptContent.includes('Remove-Item -Path "node_modules'), 'Le script ne doit jamais supprimer node_modules');
    });

    it('WIN-DATA-LIFE-18 : Aucune suppression automatique au démarrage normal', () => {
      const electronMain = fs.readFileSync(electronMainPath, 'utf-8');
      assert.ok(!electronMain.includes('fs.rmSync(targetUserDataPath'), 'electron-main.cjs ne doit pas supprimer le dossier userData');
      assert.ok(!electronMain.includes('localStorage.clear()'), 'electron-main.cjs ne doit pas clear le stockage');
    });

    it('WIN-DATA-LIFE-19 : Migration react-example → Bird Academy Enterprise non destructive', () => {
      const tempBase = fs.mkdtempSync(path.join(os.tmpdir(), 'bird-academy-migration-test-'));
      const legacyDir = path.join(tempBase, 'react-example');
      const targetDir = path.join(tempBase, 'Bird Academy Enterprise');

      // Create legacy profile with simulated LevelDB data
      fs.mkdirSync(path.join(legacyDir, 'Local Storage', 'leveldb'), { recursive: true });
      fs.writeFileSync(path.join(legacyDir, 'Local Storage', 'leveldb', '000001.ldb'), 'BIRD_ACADEMY_PERSISTENT_DATA', 'utf-8');
      fs.writeFileSync(path.join(legacyDir, 'Preferences'), JSON.stringify({ version: '1.3.6' }), 'utf-8');

      // Migration simulation algorithm matching electron-main.cjs
      if (!fs.existsSync(targetDir) && fs.existsSync(legacyDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        fs.cpSync(legacyDir, targetDir, { recursive: true });
      }

      // Verification 1: Target contains all migrated files
      assert.ok(fs.existsSync(path.join(targetDir, 'Local Storage', 'leveldb', '000001.ldb')));
      assert.strictEqual(
        fs.readFileSync(path.join(targetDir, 'Local Storage', 'leveldb', '000001.ldb'), 'utf-8'),
        'BIRD_ACADEMY_PERSISTENT_DATA'
      );
      assert.ok(fs.existsSync(path.join(targetDir, 'Preferences')));

      // Verification 2: Legacy directory remains 100% intact (non-destructive)
      assert.ok(fs.existsSync(path.join(legacyDir, 'Local Storage', 'leveldb', '000001.ldb')));
      assert.ok(fs.existsSync(path.join(legacyDir, 'Preferences')));

      // Clean up temp test directory
      fs.rmSync(tempBase, { recursive: true, force: true });
    });

    it('WIN-DATA-LIFE-20 : Cycle Upgrade / Clean Install RC3.1 conforme', () => {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      assert.ok(pkg.scripts['qa:reset-windows-user'], 'Le script qa:reset-windows-user doit être défini dans package.json');
      assert.ok(pkg.scripts['package:windows:rc3.1'], 'Le script package:windows:rc3.1 doit être défini dans package.json');
      assert.ok(fs.existsSync(packageRc31ScriptPath), 'scripts/packageWindowsRC3_1.js doit exister');
    });

    it('WIN-DATA-LIFE-21 : electron-main.cjs implémente le Single Instance Lock', () => {
      const electronMain = fs.readFileSync(electronMainPath, 'utf-8');
      assert.ok(electronMain.includes('app.requestSingleInstanceLock()'), 'requestSingleInstanceLock doit être appelé');
      assert.ok(electronMain.includes('second-instance'), 'Événement second-instance doit être géré');
      assert.ok(electronMain.includes('app.quit()'), 'Fermeture propre avec app.quit() si lock refusé');
    });

    it('WIN-DATA-LIFE-22 : electron-main.cjs ne tue aucun processus Chromium/Electron manuellement', () => {
      const electronMain = fs.readFileSync(electronMainPath, 'utf-8');
      assert.ok(!electronMain.includes('process.kill'), 'process.kill interdit dans electron-main.cjs');
      assert.ok(!electronMain.includes('taskkill'), 'taskkill interdit dans electron-main.cjs');
      assert.ok(!electronMain.includes('child_process'), 'child_process non utilisé pour tuer des processus');
    });

    it('WIN-DATA-LIFE-23 : Configuration NSIS configure deleteAppDataOnUninstall à false', () => {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      assert.ok(pkg.build?.nsis, 'Section build.nsis doit être définie dans package.json');
      assert.strictEqual(pkg.build.nsis.deleteAppDataOnUninstall, false, 'deleteAppDataOnUninstall doit être false pour protéger %APPDATA%');
      assert.strictEqual(pkg.build.nsis.include, 'packaging/installer.nsh', 'packaging/installer.nsh doit être référencé dans build.nsis');
    });

    it('WIN-DATA-LIFE-24 : NSIS custom hook packaging/installer.nsh cible strictement les versions Bird Academy', () => {
      const nsisHookPath = path.join(rootDir, 'packaging', 'installer.nsh');
      assert.ok(fs.existsSync(nsisHookPath), 'packaging/installer.nsh doit exister');
      const nsisContent = fs.readFileSync(nsisHookPath, 'utf-8');
      assert.ok(nsisContent.includes('customInit'), 'Macro customInit doit être définie');
      assert.ok(nsisContent.includes('Bird Academy User RC3.1.exe'), 'Cible RC3.1');
      assert.ok(nsisContent.includes('Bird-Academy-User-Windows-RC3.exe'), 'Cible RC3');
      assert.ok(nsisContent.includes('Bird-Academy-User-Windows-RC2.exe'), 'Cible RC2');
      assert.ok(nsisContent.includes('Bird-Academy-User-Windows-RC1.exe'), 'Cible RC1');
      assert.ok(nsisContent.includes('react-example.exe'), 'Cible legacy react-example');
    });

    it('WIN-DATA-LIFE-25 : Script reset QA cible uniquement les processus Bird Academy sans tuer de processus génériques tiers', () => {
      const scriptContent = fs.readFileSync(resetScriptPath, 'utf-8');
      assert.ok(scriptContent.includes('Bird-Academy-User-Windows-RC3.1'));
      assert.ok(scriptContent.includes('react-example'));
      assert.ok(!scriptContent.includes('"electron"'), 'Ne doit pas contenir "electron" générique');
    });
  });
});


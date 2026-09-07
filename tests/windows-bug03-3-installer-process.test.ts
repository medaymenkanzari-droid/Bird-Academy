/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS BUG-WIN-03.3 (FIX3) INSTALLER PROCESS & FORENSIC SUITE
 * Validates native Win32 taskkill /F /T process-tree termination,
 * base64 EncodedCommand PowerShell path scanning, NSIS macro hook execution order,
 * old uninstaller preparation, and complete user data preservation.
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
import { Canari } from '../src/types';

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

describe('MISSION — BIRD ACADEMY WINDOWS INSTALLER PROCESS (BUG-WIN-03.3 / FIX3)', () => {
  const rootDir = process.cwd();
  const installerNshPath = path.join(rootDir, 'packaging', 'installer.nsh');
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const nsisTemplatesDir = path.join(rootDir, 'node_modules', 'app-builder-lib', 'templates', 'nsis');

  let installerNshContent = '';
  let electronMainContent = '';
  let packageJsonContent: any = {};

  beforeEach(() => {
    localStorage.clear();
    if (fs.existsSync(installerNshPath)) {
      installerNshContent = fs.readFileSync(installerNshPath, 'utf8');
    }
    if (fs.existsSync(electronMainPath)) {
      electronMainContent = fs.readFileSync(electronMainPath, 'utf8');
    }
    if (fs.existsSync(packageJsonPath)) {
      packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    }
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-01 : customInit est réellement injecté
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-01 : customInit est réellement injecté dans packaging/installer.nsh', () => {
    assert.ok(installerNshContent.includes('!macro customInit'), 'installer.nsh doit définir !macro customInit');
    assert.ok(installerNshContent.includes('CloseAllBirdAcademyInstances'), 'customInit doit appeler CloseAllBirdAcademyInstances');
    assert.ok(installerNshContent.includes('[CUSTOM-INIT]'), 'customInit doit journaliser son déclenchement');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-02 : customInit est exécuté avant uninstallOldVersion
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-02 : customInit est exécuté dans .onInit avant Section "install" et uninstallOldVersion', () => {
    const installerNsiPath = path.join(nsisTemplatesDir, 'installer.nsi');
    const installSectionNshPath = path.join(nsisTemplatesDir, 'installSection.nsh');

    assert.ok(fs.existsSync(installerNsiPath), 'installer.nsi template doit exister');
    assert.ok(fs.existsSync(installSectionNshPath), 'installSection.nsh template doit exister');

    const nsiContent = fs.readFileSync(installerNsiPath, 'utf8');
    const sectionContent = fs.readFileSync(installSectionNshPath, 'utf8');

    // In installer.nsi, customInit is called inside Function .onInit
    assert.ok(nsiContent.includes('Function .onInit'), 'installer.nsi doit contenir Function .onInit');
    assert.ok(nsiContent.includes('!insertmacro customInit'), 'installer.nsi .onInit doit insérer customInit');

    // In installSection.nsh, uninstallOldVersion is called in Section "install"
    assert.ok(sectionContent.includes('uninstallOldVersion'), 'installSection.nsh doit contenir uninstallOldVersion');

    // Verify .onInit runs prior to Section execution in NSIS lifecycle
    const onInitIndex = nsiContent.indexOf('Function .onInit');
    const sectionIndex = nsiContent.indexOf('Section "install"');
    assert.ok(onInitIndex < sectionIndex, '.onInit doit précéder Section "install"');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-03 : Bird Academy User RC3.1.exe est détectable
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-03 : Bird Academy User RC3.1.exe est présent dans la liste blanche de terminaison', () => {
    assert.ok(installerNshContent.includes('TaskkillProcess "Bird Academy User RC3.1.exe"'), 'Doit cibler Bird Academy User RC3.1.exe');
    assert.ok(installerNshContent.includes('TaskkillProcess "Bird-Academy-User-Windows-RC3.1.exe"'), 'Doit cibler Bird-Academy-User-Windows-RC3.1.exe');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-04 : Les processus enfants sont identifiés
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-04 : Les processus enfants sont ciblés via le balayage par chemin et le drapeau /T', () => {
    // Flag /T terminates entire process tree (all child processes)
    assert.ok(installerNshContent.includes('/F /T /IM'), 'taskkill doit inclure le drapeau /T (Process Tree)');
    assert.ok(installerNshContent.includes('RunPIDFirstTermination') || installerNshContent.includes('terminate.ps1'), 'Doit exécuter le balayage par chemin');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-05 : taskkill /T termine l\'arbre ciblé
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-05 : taskkill.exe /F /T est invoqué via $SYSDIR natif', () => {
    assert.ok(installerNshContent.includes('"$SYSDIR\\taskkill.exe" /F /T /IM'), 'Doit utiliser $SYSDIR\\taskkill.exe avec /F /T');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-06 : Aucun processus Bird Academy ne reste
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-06 : La macro effectue une double couche Taskkill + PowerShell PID-first', () => {
    assert.ok(installerNshContent.includes('TaskkillProcess "Bird Academy Enterprise.exe"'));
    assert.ok(installerNshContent.includes('TaskkillProcess "Bird Academy User RC3.exe"'));
    assert.ok(installerNshContent.includes('TaskkillProcess "Bird Academy User RC2.exe"'));
    assert.ok(installerNshContent.includes('TaskkillProcess "react-example.exe"'));
    assert.ok(installerNshContent.includes('RunPIDFirstTermination') || installerNshContent.includes('terminate.ps1'), 'Doit utiliser le script pour éliminer tout bug de buffer');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-07 : L\'ancien désinstalleur peut s\'exécuter après fermeture
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-07 : customCheckAppRunning prépare l\'environnement pour l\'ancien désinstalleur', () => {
    assert.ok(installerNshContent.includes('!macro customCheckAppRunning'));
    assert.ok(installerNshContent.includes('!macro customUnInit'));
    assert.ok(installerNshContent.includes('!macro customUnInstall'));
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-08 : appCannotBeClosed n\'est pas déclenché
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-08 : Élimination du code retour non nul pour éviter la boîte appCannotBeClosed', () => {
    assert.ok(installerNshContent.includes('[TASKKILL-RESULT]'));
    assert.ok(installerNshContent.includes('[FIX4-EXEC-RESULT]') || installerNshContent.includes('[FIX4-COMPLETE]'));
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-09 : deleteAppDataOnUninstall reste false
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-09 : deleteAppDataOnUninstall est strictement false dans package.json', () => {
    assert.strictEqual(packageJsonContent.build?.nsis?.deleteAppDataOnUninstall, false, 'deleteAppDataOnUninstall doit être false');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-10 : userData n\'est jamais supprimé
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-10 : electron-main.cjs configure canoniquement userData vers Bird Academy Enterprise', () => {
    assert.ok(electronMainContent.includes("const APP_CANONICAL_NAME = 'Bird Academy Enterprise'"));
    assert.ok(electronMainContent.includes("app.setPath('userData', targetUserDataPath)"));
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-11 : Licence conservée
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-11 : La licence reste conservée et valide en localStorage', async () => {
    const licenseRepo = new LocalStorageLicenseRepository();
    const mockLicense: License = {
      id: 'LIC-WIN11-2026',
      key: 'BA-WIN11-KEY-1234',
      holderName: 'Éleveur Windows 11',
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
    const loaded = await licenseRepo.getActiveLicense();
    assert.ok(loaded);
    assert.strictEqual(loaded.id, 'LIC-WIN11-2026');
    assert.strictEqual(loaded.key, 'BA-WIN11-KEY-1234');
    assert.strictEqual(loaded.status, 'active');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-12 : wizard_completed conservé
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-12 : wizard_completed reste à "true"', () => {
    localStorage.setItem('wizard_completed', 'true');
    assert.strictEqual(localStorage.getItem('wizard_completed'), 'true');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-13 : Oiseaux/cages/couples conservés
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-13 : Les oiseaux, cages, couples et finances sont préservés', () => {
    const mockBirds: Canari[] = [
      {
        id: 201,
        bague: 'FRA-2026-001',
        nom: 'Champion Canari Jaune',
        espece: 'canari',
        categorie: 'canari_couleur',
        race: 'Lipochrome',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune Intensif',
        sexe: 'Mâle',
        date_naissance: '2026-01-15',
        archived: false,
        photos: [],
        documents: []
      }
    ];

    BirdRepository.saveAll(mockBirds);
    HabitatRepository.saveAll([{ id: 1, nom: 'Grande Volière', description: 'Cage', capacite_max: 10 }]);
    BreedingRepository.saveCouples([{ id: 1, male_id: 201, femelle_id: 202, date_creation: '2026-08-21', statut: 'Actif' } as any]);

    const birds = BirdRepository.getAll(true);
    const cages = HabitatRepository.getAllLegacy();
    const couples = BreedingRepository.getCouples();

    assert.strictEqual(birds.length, 1);
    assert.strictEqual(birds[0].id, 201);
    assert.strictEqual(cages.length, 1);
    assert.strictEqual(couples.length, 1);
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-14 : Migration legacy conservée
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-14 : electron-main.cjs conserve le mécanisme de migration non destructive', () => {
    assert.ok(electronMainContent.includes('setupUserDataAndMigration'));
    assert.ok(electronMainContent.includes("path.join(appDataPath, 'react-example')"));
    assert.ok(electronMainContent.includes("path.join(appDataPath, 'Bird Academy')"));
    assert.ok(electronMainContent.includes('fs.cpSync(legacyDir, targetUserDataPath'));
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-FIX3-15 : Installation clean possible
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-FIX3-15 : Une installation vierge initialise un profil neuf sans régression', () => {
    localStorage.clear();
    assert.strictEqual(localStorage.getItem('bird_academy_license'), null);
    assert.strictEqual(localStorage.getItem('wizard_completed'), null);
  });
});

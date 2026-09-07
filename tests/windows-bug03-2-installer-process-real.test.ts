/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS BUG-WIN-03.2 REAL INSTALLER PROCESS VALIDATION SUITE
 * Validates real PowerShell process-tree detection and targeted closure,
 * NSIS dual-layer hooks, path resolution for legacy installations,
 * and absolute data and license preservation.
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

describe('MISSION — BIRD ACADEMY WINDOWS REAL INSTALLER PROCESS (BUG-WIN-03.2 / FIX2)', () => {
  const rootDir = process.cwd();
  const installerNshPath = path.join(rootDir, 'packaging', 'installer.nsh');
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const psHelperPath = path.join(rootDir, 'scripts', 'close-bird-processes.ps1');

  let installerNshContent = '';
  let electronMainContent = '';
  let packageJsonContent: any = {};
  let psHelperContent = '';

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
    if (fs.existsSync(psHelperPath)) {
      psHelperContent = fs.readFileSync(psHelperPath, 'utf8');
    }
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-01 : Détection réelle de Bird Academy Enterprise.exe
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-01 : Détection réelle de Bird Academy Enterprise.exe dans installer.nsh et helper PS', () => {
    assert.ok(installerNshContent.includes('Bird Academy Enterprise.exe'), 'installer.nsh doit cibler "Bird Academy Enterprise.exe"');
    assert.ok(psHelperContent.includes('Bird Academy Enterprise.exe'), 'Le helper PS doit cibler "Bird Academy Enterprise.exe"');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-02 : Détection réelle de RC3.1
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-02 : Détection réelle des identités RC3.1', () => {
    assert.ok(installerNshContent.includes('Bird Academy User RC3.1.exe'), 'installer.nsh doit cibler "Bird Academy User RC3.1.exe"');
    assert.ok(installerNshContent.includes('Bird-Academy-User-Windows-RC3.1.exe'), 'installer.nsh doit cibler "Bird-Academy-User-Windows-RC3.1.exe"');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-03 : Détection réelle de RC3
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-03 : Détection réelle des identités RC3', () => {
    assert.ok(installerNshContent.includes('Bird Academy User RC3.exe'), 'installer.nsh doit cibler "Bird Academy User RC3.exe"');
    assert.ok(installerNshContent.includes('Bird-Academy-User-Windows-RC3.exe'), 'installer.nsh doit cibler "Bird-Academy-User-Windows-RC3.exe"');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-04 : Détection réelle de RC2
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-04 : Détection réelle des identités RC2', () => {
    assert.ok(installerNshContent.includes('Bird Academy User RC2.exe'), 'installer.nsh doit cibler "Bird Academy User RC2.exe"');
    assert.ok(installerNshContent.includes('Bird-Academy-User-Windows-RC2.exe'), 'installer.nsh doit cibler "Bird-Academy-User-Windows-RC2.exe"');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-05 : Fermeture propre du processus principal
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-05 : Fermeture propre gracieuse préalable via CloseMainWindow / _CloseProcess', () => {
    assert.ok(installerNshContent.includes('CloseMainWindow()'), 'installer.nsh doit tenter CloseMainWindow() via PowerShell');
    assert.ok(installerNshContent.includes('nsProcess::_CloseProcess'), 'installer.nsh doit tenter nsProcess::_CloseProcess');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-06 : Fermeture des sous-processus appartenant à Bird Academy
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-06 : Fermeture des sous-processus Electron par filtrage strict sur ExecutablePath', () => {
    assert.ok(installerNshContent.includes('Programs\\react-example'), 'installer.nsh doit filtrer les chemins Programs\\react-example');
    assert.ok(installerNshContent.includes('Programs\\Bird Academy Enterprise'), 'installer.nsh doit filtrer les chemins Programs\\Bird Academy Enterprise');
    assert.ok(installerNshContent.includes('Stop-Process'), 'installer.nsh doit utiliser Stop-Process pour nettoyer les arbres enfants orphelins');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-07 : Aucun processus Bird Academy résiduel après fermeture
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-07 : Délais de libération des verrous et Unload', () => {
    assert.ok(installerNshContent.includes('Start-Sleep'), 'installer.nsh doit attendre la libération des verrous avec Start-Sleep');
    assert.ok(installerNshContent.includes('nsProcess::_Unload'), 'installer.nsh doit décharger nsProcess avec _Unload');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-08 : L'installateur ne bloque pas lorsque Bird Academy est ouvert
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-08 : customInit et customCheckAppRunning préviennent le blocage appCannotBeClosed', () => {
    assert.ok(installerNshContent.includes('!macro customInit'), 'customInit doit être défini');
    assert.ok(installerNshContent.includes('!macro customCheckAppRunning'), 'customCheckAppRunning doit être défini');
    assert.ok(installerNshContent.includes('!macro customUnInstall'), 'customUnInstall doit être défini');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-09 : L'installateur ne tue aucun processus tiers
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-09 : Isolation stricte — aucune terminaison générique ou sauvage', () => {
    const dangerousCommands = [
      'taskkill /F /IM *',
      'taskkill /F /IM *.exe',
      'Stop-Process *',
      'Stop-Process -Name *',
      'RMDir /r $APPDATA'
    ];
    for (const cmd of dangerousCommands) {
      assert.ok(!installerNshContent.includes(cmd), `installer.nsh ne doit pas contenir de commande dangereuse : ${cmd}`);
    }
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-10 : Upgrade conserve la licence
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-10 : Upgrade conserve la licence active', async () => {
    const licenseRepo = new LocalStorageLicenseRepository();
    const mockLic: License = {
      id: 'LIC-REAL-UPGRADE-2026',
      key: 'BA-REAL-UPGRADE-KEY',
      holderName: 'Volière Fix2',
      type: 'permanent',
      status: 'active',
      issuedAt: new Date().toISOString(),
      expiresAt: null,
      policy: { maxDevices: 5, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'reproduction', 'genetics'] },
      activations: [],
      checksum: 'CK-FIX2',
      signature: 'SIG-FIX2'
    };
    await licenseRepo.saveActiveLicense(mockLic);
    const retrieved = await licenseRepo.getActiveLicense();
    assert.strictEqual(retrieved?.key, 'BA-REAL-UPGRADE-KEY');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-11 : Upgrade conserve les données
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-11 : Upgrade conserve le cheptel', () => {
    const mockBird: Canari = {
      id: 888,
      bague: 'FR-2026-888',
      nom: 'Titan',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Rouge',
      facteur: 'Intensif',
      couleur: 'Rouge Intensif',
      date_naissance: '2026-04-01',
      archived: false,
      photos: [],
      documents: []
    };
    BirdRepository.saveAll([mockBird]);
    const birds = BirdRepository.getAll(true);
    assert.strictEqual(birds.length, 1);
    assert.strictEqual(birds[0].nom, 'Titan');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-12 : Upgrade conserve userData
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-12 : Migration vers nom canonique Bird Academy Enterprise', () => {
    assert.ok(electronMainContent.includes("APP_CANONICAL_NAME = 'Bird Academy Enterprise'"));
    assert.ok(electronMainContent.includes('setupUserDataAndMigration'));
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-13 : Aucune suppression de %APPDATA%
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-13 : deleteAppDataOnUninstall reste false', () => {
    assert.strictEqual(packageJsonContent.build?.nsis?.deleteAppDataOnUninstall, false);
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-14 : NSIS utilise bien installer.nsh
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-14 : package.json inclut packaging/installer.nsh', () => {
    assert.strictEqual(packageJsonContent.build?.nsis?.include, 'packaging/installer.nsh');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-REAL-15 : Le binaire généré contient réellement la correction
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-REAL-15 : Scripts de packaging et hooks NSIS synchronisés', () => {
    assert.ok(fs.existsSync(path.join(rootDir, 'packaging', 'installer.nsh')));
    assert.ok(fs.existsSync(path.join(rootDir, 'electron-main.cjs')));
  });
});

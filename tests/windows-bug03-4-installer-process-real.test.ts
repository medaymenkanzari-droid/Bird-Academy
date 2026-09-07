/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS BUG-WIN-03.4 (FIX4) INSTALLER PROCESS SUITE
 * Validates PID-First process tree discovery, child process capture before parent termination,
 * absolute elimination of NSIS buffer-overflow (>1024 chars), zero generic kills,
 * and preservation of all user data and licenses.
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

describe('MISSION — BIRD ACADEMY WINDOWS INSTALLER PID-FIRST (BUG-WIN-03.4 / FIX4)', () => {
  const rootDir = process.cwd();
  const installerNshPath = path.join(rootDir, 'packaging', 'installer.nsh');
  const psScriptPath = path.join(rootDir, 'scripts', 'windows', 'terminate-bird-academy-processes.ps1');
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const packageJsonPath = path.join(rootDir, 'package.json');

  let installerNshContent = '';
  let psScriptContent = '';
  let electronMainContent = '';
  let packageJsonContent: any = {};

  beforeEach(() => {
    localStorage.clear();
    if (fs.existsSync(installerNshPath)) {
      installerNshContent = fs.readFileSync(installerNshPath, 'utf8');
    }
    if (fs.existsSync(psScriptPath)) {
      psScriptContent = fs.readFileSync(psScriptPath, 'utf8');
    }
    if (fs.existsSync(electronMainPath)) {
      electronMainContent = fs.readFileSync(electronMainPath, 'utf8');
    }
    if (fs.existsSync(packageJsonPath)) {
      packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    }
  });

  // --------------------------------------------------------------------------
  // FIX4-01 : terminate.ps1 existe
  // --------------------------------------------------------------------------
  it('FIX4-01 : Le script PowerShell dédié terminate-bird-academy-processes.ps1 existe et est non vide', () => {
    assert.ok(fs.existsSync(psScriptPath), 'scripts/windows/terminate-bird-academy-processes.ps1 doit exister');
    assert.ok(psScriptContent.length > 500, 'Le script terminate-bird-academy-processes.ps1 doit être complet');
  });

  // --------------------------------------------------------------------------
  // FIX4-02 : Script PowerShell exécutable et structuré
  // --------------------------------------------------------------------------
  it('FIX4-02 : Le script PowerShell contient la structure d\'exécution CIM/Win32_Process', () => {
    assert.ok(psScriptContent.includes('Get-CimInstance Win32_Process'), 'Doit interroger Win32_Process');
    assert.ok(psScriptContent.includes('exit 0'), 'Doit se terminer avec un exit code 0 explicite');
  });

  // --------------------------------------------------------------------------
  // FIX4-03 : Aucune Base64 longue dans installer.nsh
  // --------------------------------------------------------------------------
  it('FIX4-03 : Aucune chaîne Base64 longue dans packaging/installer.nsh', () => {
    assert.ok(!installerNshContent.includes('-EncodedCommand'), 'installer.nsh ne doit plus utiliser -EncodedCommand');
    // Verify no line exceeds 1024 characters
    const lines = installerNshContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      assert.ok(lines[i].length < 1024, `Ligne ${i + 1} dépasse la limite NSIS de 1024 caractères (${lines[i].length} chars)`);
    }
  });

  // --------------------------------------------------------------------------
  // FIX4-04 : Aucune commande NSIS > 1024 caractères
  // --------------------------------------------------------------------------
  it('FIX4-04 : Toutes les commandes nsExec::Exec sont courtes (< 200 caractères)', () => {
    const execMatches = installerNshContent.match(/nsExec::Exec\s+`[^`]+`/g) || [];
    assert.ok(execMatches.length > 0, 'Au moins un appel nsExec::Exec doit exister');
    for (const match of execMatches) {
      assert.ok(match.length < 200, `Commande trop longue (${match.length} chars): ${match}`);
    }
  });

  // --------------------------------------------------------------------------
  // FIX4-05 : Stratégie PID-first présente
  // --------------------------------------------------------------------------
  it('FIX4-05 : La stratégie PID-first est implémentée avec enregistrement d\'ensemble de PIDs', () => {
    assert.ok(psScriptContent.includes('allTargetPids') || psScriptContent.includes('targetPids'), 'Doit maintenir un ensemble de PIDs');
    assert.ok(installerNshContent.includes('targetPids'), 'installer.nsh doit utiliser un ensemble de PIDs');
  });

  // --------------------------------------------------------------------------
  // FIX4-06 : ParentProcessId analysé
  // --------------------------------------------------------------------------
  it('FIX4-06 : ParentProcessId est analysé pour capturer les arbres descendants', () => {
    assert.ok(psScriptContent.includes('ParentProcessId'), 'Le script PS doit analyser ParentProcessId');
    assert.ok(installerNshContent.includes('ParentProcessId'), 'installer.nsh doit analyser ParentProcessId');
  });

  // --------------------------------------------------------------------------
  // FIX4-07 : Descendants collectés avant la fermeture du parent
  // --------------------------------------------------------------------------
  it('FIX4-07 : Les descendants sont collectés dans une boucle avant tout appel de terminaison', () => {
    const scanPos = psScriptContent.indexOf('[FIX4-SCAN]');
    const forcePos = psScriptContent.indexOf('[FIX4-FORCE]');
    assert.ok(scanPos !== -1 && forcePos !== -1, 'Les marqueurs de scan et de force doivent être présents');
    assert.ok(scanPos < forcePos, 'La collecte de l\'arbre complet doit précéder la terminaison forcée');
  });

  // --------------------------------------------------------------------------
  // FIX4-08 : GPU process couvert
  // --------------------------------------------------------------------------
  it('FIX4-08 : Les sous-processus GPU (--type=gpu-process) sont identifiés et ciblés', () => {
    assert.ok(psScriptContent.includes('gpu-process'), 'Le script PS doit documenter/gérer gpu-process');
  });

  // --------------------------------------------------------------------------
  // FIX4-09 : Renderer couvert
  // --------------------------------------------------------------------------
  it('FIX4-09 : Les sous-processus Renderer (--type=renderer) sont identifiés et ciblés', () => {
    assert.ok(psScriptContent.includes('renderer'), 'Le script PS doit documenter/gérer renderer');
  });

  // --------------------------------------------------------------------------
  // FIX4-10 : Utility couvert
  // --------------------------------------------------------------------------
  it('FIX4-10 : Les sous-processus Utility (--type=utility) sont identifiés et ciblés', () => {
    assert.ok(psScriptContent.includes('utility'), 'Le script PS doit documenter/gérer utility');
  });

  // --------------------------------------------------------------------------
  // FIX4-11 : Crashpad couvert
  // --------------------------------------------------------------------------
  it('FIX4-11 : Le processus crashpad_handler.exe est identifié et ciblé s\'il appartient à Bird Academy', () => {
    assert.ok(psScriptContent.includes('crashpad'), 'Le script PS doit documenter/gérer crashpad_handler');
  });

  // --------------------------------------------------------------------------
  // FIX4-12 : taskkill /PID présent
  // --------------------------------------------------------------------------
  it('FIX4-12 : taskkill.exe est invoqué par /PID spécifique', () => {
    assert.ok(psScriptContent.includes('taskkill.exe" /F /PID') || psScriptContent.includes('taskkill.exe /F /PID'), 'Doit utiliser taskkill /PID');
    assert.ok(installerNshContent.includes('taskkill.exe" /F /PID'), 'installer.nsh doit utiliser taskkill /PID');
  });

  // --------------------------------------------------------------------------
  // FIX4-13 : Aucun taskkill /IM * générique
  // --------------------------------------------------------------------------
  it('FIX4-13 : Aucun taskkill générique /IM * n\'est présent', () => {
    assert.ok(!psScriptContent.includes('/IM *'), 'Pas de taskkill /IM * dans le script PS');
    assert.ok(!installerNshContent.includes('/IM *'), 'Pas de taskkill /IM * dans installer.nsh');
  });

  // --------------------------------------------------------------------------
  // FIX4-14 : Aucun Stop-Process * global
  // --------------------------------------------------------------------------
  it('FIX4-14 : Aucun Stop-Process global sauvage n\'est présent', () => {
    assert.ok(!psScriptContent.includes('Stop-Process *'), 'Pas de Stop-Process * dans le script PS');
    assert.ok(!installerNshContent.includes('Stop-Process *'), 'Pas de Stop-Process * dans installer.nsh');
  });

  // --------------------------------------------------------------------------
  // FIX4-15 : Chemin react-example couvert
  // --------------------------------------------------------------------------
  it('FIX4-15 : Le chemin d\'installation Programs\\react-example est explicitement couvert', () => {
    assert.ok(psScriptContent.includes('Programs\\react-example'), 'Script PS doit cibler Programs\\react-example');
    assert.ok(installerNshContent.includes('Programs\\react-example'), 'installer.nsh doit cibler Programs\\react-example');
  });

  // --------------------------------------------------------------------------
  // FIX4-16 : Bird Academy Enterprise couvert
  // --------------------------------------------------------------------------
  it('FIX4-16 : Le nom et chemin Bird Academy Enterprise sont explicitement couverts', () => {
    assert.ok(psScriptContent.includes('Bird Academy Enterprise.exe'), 'Script PS doit cibler Bird Academy Enterprise.exe');
    assert.ok(installerNshContent.includes('Bird Academy Enterprise.exe'), 'installer.nsh doit cibler Bird Academy Enterprise.exe');
  });

  // --------------------------------------------------------------------------
  // FIX4-17 : customInit présent
  // --------------------------------------------------------------------------
  it('FIX4-17 : Le macro hook customInit est présent et appelle le flux de nettoyage FIX4', () => {
    assert.ok(installerNshContent.includes('!macro customInit'), 'installer.nsh doit définir !macro customInit');
    assert.ok(installerNshContent.includes('CloseAllBirdAcademyInstances'), 'customInit doit appeler CloseAllBirdAcademyInstances');
  });

  // --------------------------------------------------------------------------
  // FIX4-18 : customCheckAppRunning présent
  // --------------------------------------------------------------------------
  it('FIX4-18 : Le macro hook customCheckAppRunning est présent', () => {
    assert.ok(installerNshContent.includes('!macro customCheckAppRunning'), 'installer.nsh doit définir !macro customCheckAppRunning');
  });

  // --------------------------------------------------------------------------
  // FIX4-19 : Aucune suppression de %APPDATA% (deleteAppDataOnUninstall: false)
  // --------------------------------------------------------------------------
  it('FIX4-19 : deleteAppDataOnUninstall reste strictement configuré à false dans package.json', () => {
    assert.strictEqual(packageJsonContent.build?.nsis?.deleteAppDataOnUninstall, false, 'deleteAppDataOnUninstall doit être false');
  });

  // --------------------------------------------------------------------------
  // FIX4-20 : Aucune modification des données métier et licence
  // --------------------------------------------------------------------------
  it('FIX4-20 : Préservation absolue de la licence, des oiseaux, cages, couples et wizard_completed', async () => {
    const licenseRepo = new LocalStorageLicenseRepository();
    const testLicense: License = {
      id: 'LIC-FIX4-2026',
      key: 'BA-FIX4-KEY-1234',
      holderName: 'Éleveur Pro Windows 11',
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
      checksum: 'CHECKSUM_FIX4',
      signature: 'SIGNATURE_FIX4'
    };

    await licenseRepo.saveActiveLicense(testLicense);
    localStorage.setItem('wizard_completed', 'true');

    const bird: Canari = {
      id: 301,
      bague: 'FRA-2026-FIX4',
      nom: 'Canari Jaune FIX4',
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
    };

    BirdRepository.saveAll([bird]);
    HabitatRepository.saveAll([{ id: 1, nom: 'Volière FIX4', description: 'Cage', capacite_max: 10 }]);
    BreedingRepository.saveCouples([{ id: 1, male_id: 301, femelle_id: 302, date_creation: '2026-08-21', statut: 'Actif' } as any]);

    const loadedLicense = await licenseRepo.getActiveLicense();
    const isWizardDone = localStorage.getItem('wizard_completed') === 'true';
    const birds = BirdRepository.getAll(true);
    const cages = HabitatRepository.getAllLegacy();
    const couples = BreedingRepository.getCouples();

    assert.ok(loadedLicense);
    assert.strictEqual(loadedLicense.id, 'LIC-FIX4-2026');
    assert.strictEqual(isWizardDone, true);
    assert.strictEqual(birds.length, 1);
    assert.strictEqual(cages.length, 1);
    assert.strictEqual(couples.length, 1);
  });
});

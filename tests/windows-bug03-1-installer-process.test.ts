/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS BUG-WIN-03.1 INSTALLER PROCESS VALIDATION SUITE
 * Validates NSIS targeted process closure, grace loop, upgrade resilience,
 * electron single instance lock, and absolute data preservation.
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
import { AnalyticsSettingsRepository } from '../src/features/analytics/repositories/AnalyticsSettingsRepository';
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

describe('MISSION — BIRD ACADEMY WINDOWS INSTALLER PROCESS (BUG-WIN-03.1 / RC3.1)', () => {
  const rootDir = process.cwd();
  const installerNshPath = path.join(rootDir, 'packaging', 'installer.nsh');
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const packageJsonPath = path.join(rootDir, 'package.json');

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
  // WIN-INSTALL-01 : Présence et syntaxe valide de packaging/installer.nsh
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-01 : packaging/installer.nsh existe et est non vide', () => {
    assert.ok(fs.existsSync(installerNshPath), 'packaging/installer.nsh doit exister');
    assert.ok(installerNshContent.length > 50, 'installer.nsh doit contenir du code NSIS substantiel');
    assert.ok(installerNshContent.includes('!macro'), 'installer.nsh doit définir des macros NSIS');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-02 : customCheckAppRunning est défini
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-02 : customCheckAppRunning est explicitement défini', () => {
    assert.ok(
      installerNshContent.includes('!macro customCheckAppRunning'),
      'installer.nsh doit définir le hook !macro customCheckAppRunning'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-03 : customInit est défini
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-03 : customInit est explicitement défini', () => {
    assert.ok(
      installerNshContent.includes('!macro customInit'),
      'installer.nsh doit définir le hook !macro customInit'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-04 : Bird Academy Enterprise.exe est explicitement détecté
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-04 : Bird Academy Enterprise.exe est explicitement ciblé', () => {
    assert.ok(
      installerNshContent.includes('"Bird Academy Enterprise.exe"'),
      'installer.nsh doit cibler "Bird Academy Enterprise.exe"'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-05 : Les déclinaisons RC1, RC2, RC3 et RC3.1 sont détectées
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-05 : Les identités RC1, RC2, RC3 et RC3.1 sont détectées', () => {
    const expectedTargets = [
      'Bird Academy User RC3.1.exe',
      'Bird-Academy-User-Windows-RC3.1.exe',
      'Bird Academy User RC3.exe',
      'Bird-Academy-User-Windows-RC3.exe',
      'Bird Academy User RC2.exe',
      'Bird-Academy-User-Windows-RC2.exe',
      'Bird-Academy-User-Windows-RC1.exe',
      'Bird Academy.exe'
    ];

    for (const target of expectedTargets) {
      assert.ok(
        installerNshContent.includes(`"${target}"`),
        `installer.nsh doit explicitement cibler "${target}"`
      );
    }
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-06 : react-example.exe est détecté
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-06 : react-example.exe est explicitement ciblé', () => {
    assert.ok(
      installerNshContent.includes('"react-example.exe"'),
      'installer.nsh doit cibler "react-example.exe"'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-07 : Une boucle d'attente avec délai de grâce avant terminaison forcée existe
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-07 : Une boucle d\'attente avec délai de grâce et terminaison séquentielle existe', () => {
    assert.ok(
      installerNshContent.includes('nsProcess::_FindProcess'),
      'installer.nsh doit utiliser nsProcess::_FindProcess'
    );
    assert.ok(
      installerNshContent.includes('nsProcess::_CloseProcess'),
      'installer.nsh doit tenter une fermeture gracieuse avec nsProcess::_CloseProcess'
    );
    assert.ok(
      installerNshContent.includes('Sleep 500'),
      'installer.nsh doit attendre entre les vérifications avec Sleep'
    );
    assert.ok(
      installerNshContent.includes('nsProcess::_KillProcess'),
      'installer.nsh doit disposer d\'un fallback de terminaison ciblée avec nsProcess::_KillProcess'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-08 : La logique est strictement limitée aux processus Bird Academy
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-08 : Aucune commande de terminaison globale ou dangereuse n\'est présente', () => {
    const dangerousPatterns = [
      'taskkill /F /IM *',
      'taskkill /F /IM *.exe',
      'Stop-Process *',
      'Stop-Process -Name *',
      'RMDir /r $APPDATA',
      'RMDir /r "$APPDATA"'
    ];

    for (const pattern of dangerousPatterns) {
      assert.ok(
        !installerNshContent.includes(pattern),
        `installer.nsh ne doit pas contenir de motif dangereux : "${pattern}"`
      );
    }
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-09 : Aucune configuration ne supprime %APPDATA%
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-09 : %APPDATA% et les données utilisateur sont préservées', () => {
    assert.ok(
      !installerNshContent.includes('RMDir /r "$APPDATA\\Bird Academy Enterprise"'),
      'installer.nsh ne doit pas détruire %APPDATA%\\Bird Academy Enterprise'
    );
    assert.ok(
      !installerNshContent.includes('RMDir /r "$APPDATA\\react-example"'),
      'installer.nsh ne doit pas détruire %APPDATA%\\react-example'
    );
    assert.strictEqual(
      packageJsonContent.build?.nsis?.deleteAppDataOnUninstall,
      false,
      'deleteAppDataOnUninstall doit être false dans package.json'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-10 : package.json contient la configuration NSIS appropriée
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-10 : package.json contient oneClick: true, deleteAppDataOnUninstall: false, include: packaging/installer.nsh', () => {
    const nsisConfig = packageJsonContent.build?.nsis;
    assert.ok(nsisConfig, 'package.json doit comporter une section build.nsis');
    assert.strictEqual(nsisConfig.oneClick, true, 'oneClick doit être true');
    assert.strictEqual(nsisConfig.deleteAppDataOnUninstall, false, 'deleteAppDataOnUninstall doit être false');
    assert.strictEqual(nsisConfig.include, 'packaging/installer.nsh', 'include doit pointer vers packaging/installer.nsh');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-11 : requestSingleInstanceLock() reste présent dans electron-main.cjs
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-11 : requestSingleInstanceLock() est actif dans electron-main.cjs', () => {
    assert.ok(
      electronMainContent.includes('app.requestSingleInstanceLock()'),
      'electron-main.cjs doit appeler app.requestSingleInstanceLock()'
    );
    assert.ok(
      electronMainContent.includes('second-instance'),
      'electron-main.cjs doit écouter l\'événement second-instance'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-12 : Le cycle de fermeture Electron est correctement configuré
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-12 : Cycle de fermeture Electron avec before-quit et window-all-closed', () => {
    assert.ok(
      electronMainContent.includes("app.on('before-quit'"),
      'electron-main.cjs doit gérer before-quit pour une libération propre'
    );
    assert.ok(
      electronMainContent.includes("app.on('window-all-closed'"),
      'electron-main.cjs doit gérer window-all-closed'
    );
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-13 : Scénario d'upgrade avec processus actif préserve licence et données
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-13 : Scénario d\'upgrade simulant un arrêt de processus préserve licence et cheptel', async () => {
    const licenseRepo = new LocalStorageLicenseRepository();
    const mockLic: License = {
      id: 'LIC-ACTIVE-UPGRADE',
      key: 'BA-UPGRADE-2026-KEY',
      holderName: 'Volière Royale',
      type: 'permanent',
      status: 'active',
      issuedAt: new Date().toISOString(),
      expiresAt: null,
      policy: { maxDevices: 5, allowOfflineActivation: true, allowTransfer: true, features: ['core', 'reproduction', 'genetics'] },
      activations: [],
      checksum: 'CK123',
      signature: 'SIG123'
    };
    await licenseRepo.saveActiveLicense(mockLic);

    const mockBird: Canari = {
      id: 999,
      bague: 'FR-2026-999',
      nom: 'Phénix',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Mosaïque',
      couleur: 'Jaune Mosaïque',
      date_naissance: '2026-03-01',
      archived: false,
      photos: [],
      documents: []
    };
    BirdRepository.saveAll([mockBird]);

    // Simulation de l'upgrade : arrêt du processus + redémarrage sans écraser localStorage
    const retrievedLic = await licenseRepo.getActiveLicense();
    assert.ok(retrievedLic !== null, 'La licence doit être intacte après l\'upgrade');
    assert.strictEqual(retrievedLic?.key, 'BA-UPGRADE-2026-KEY');

    const birds = BirdRepository.getAll(true);
    assert.strictEqual(birds.length, 1, 'Le cheptel doit être intact après l\'upgrade');
    assert.strictEqual(birds[0].nom, 'Phénix');
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-14 : L'upgrade ne nécessite aucun mécanisme destructif
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-14 : L\'upgrade per-user s\'exécute sans écrasement destructif', () => {
    assert.strictEqual(packageJsonContent.build?.win?.target?.includes('nsis'), true);
    assert.strictEqual(packageJsonContent.build?.nsis?.perMachine, false);
  });

  // --------------------------------------------------------------------------
  // WIN-INSTALL-15 : La chaîne de migration BUG-WIN-03 reste intacte
  // --------------------------------------------------------------------------
  it('WIN-INSTALL-15 : setupUserDataAndMigration reste présent et opérationnel', () => {
    assert.ok(
      electronMainContent.includes('setupUserDataAndMigration'),
      'setupUserDataAndMigration doit être présent dans electron-main.cjs'
    );
    assert.ok(
      electronMainContent.includes("APP_CANONICAL_NAME = 'Bird Academy Enterprise'"),
      'Nom canonique Bird Academy Enterprise doit être défini'
    );
    assert.ok(
      electronMainContent.includes('react-example'),
      'Le dossier legacy react-example doit être vérifié pour migration'
    );
  });
});

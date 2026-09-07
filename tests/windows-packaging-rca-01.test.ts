/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS PACKAGING RCA-01 TEST SUITE
 * Validates complete resolution of installer self-termination and strict isolation:
 * - RCA-01 to RCA-17 requirements
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('MISSION WINDOWS-PACKAGING-RCA-01 — TEST SUITE', () => {
  const rootDir = process.cwd();
  const installerUserPath = path.join(rootDir, 'packaging', 'installer.nsh');
  const installerAdminPath = path.join(rootDir, 'packaging', 'installer-admin.nsh');
  const termUserPsPath = path.join(rootDir, 'scripts', 'windows', 'terminate-bird-academy-processes.ps1');
  const termAdminPsPath = path.join(rootDir, 'scripts', 'windows', 'terminate-bird-academy-admin-processes.ps1');
  const builderUserPath = path.join(rootDir, 'electron-builder-user.json');
  const builderAdminPath = path.join(rootDir, 'electron-builder-admin.json');
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const userHtmlPath = path.join(rootDir, 'index.html');
  const adminHtmlPath = path.join(rootDir, 'admin.html');

  const installerUser = fs.readFileSync(installerUserPath, 'utf8');
  const installerAdmin = fs.readFileSync(installerAdminPath, 'utf8');
  const termUserPs = fs.readFileSync(termUserPsPath, 'utf8');
  const termAdminPs = fs.readFileSync(termAdminPsPath, 'utf8');
  const builderUser = JSON.parse(fs.readFileSync(builderUserPath, 'utf8'));
  const builderAdmin = JSON.parse(fs.readFileSync(builderAdminPath, 'utf8'));
  const electronMain = fs.readFileSync(electronMainPath, 'utf8');

  // RCA-01 : L'installateur User n'est jamais présent dans la whitelist de terminaison
  it('RCA-01 : L\'installateur User n\'est jamais présent dans la whitelist de terminaison', () => {
    assert.strictEqual(installerUser.includes('"Bird-Academy-Avian-ERP-Setup.exe"'), false, 'installer.nsh ne doit pas contenir Bird-Academy-Avian-ERP-Setup.exe');
    assert.strictEqual(installerUser.includes('"Bird-Academy-User-Setup.exe"'), false);
    assert.strictEqual(termUserPs.includes('"Bird-Academy-Avian-ERP-Setup.exe"'), false);
    assert.strictEqual(installerUser.includes('TaskkillProcess "Bird-Academy-Avian-ERP-Setup.exe"'), false);
  });

  // RCA-02 : L'installateur Admin n'est jamais présent dans la whitelist de terminaison
  it('RCA-02 : L\'installateur Admin n\'est jamais présent dans la whitelist de terminaison', () => {
    assert.strictEqual(installerAdmin.includes('"Bird-Academy-Admin-Setup.exe"'), false, 'installer-admin.nsh ne doit pas contenir Bird-Academy-Admin-Setup.exe');
    assert.strictEqual(installerAdmin.includes('"Bird-Academy-Admin-Center-Setup.exe"'), false);
    assert.strictEqual(termAdminPs.includes('"Bird-Academy-Admin-Setup.exe"'), false);
    assert.strictEqual(installerAdmin.includes('TaskkillProcess "Bird-Academy-Admin-Setup.exe"'), false);
  });

  // RCA-03 : Aucun *Setup.exe ne peut être terminé
  it('RCA-03 : Aucun *Setup.exe ne peut être terminé (exclusion explicite dans les scripts de terminaison)', () => {
    assert.ok(installerUser.includes('-like "*Setup.exe"'), 'installer.nsh doit exclure explicitement *Setup.exe');
    assert.ok(installerAdmin.includes('-like "*Setup.exe"'), 'installer-admin.nsh doit exclure explicitement *Setup.exe');
    assert.ok(termUserPs.includes('-like "*Setup.exe"'), 'terminate-bird-academy-processes.ps1 doit exclure *Setup.exe');
    assert.ok(termAdminPs.includes('-like "*Setup.exe"'), 'terminate-bird-academy-admin-processes.ps1 doit exclure *Setup.exe');
  });

  // RCA-04 : Aucun *Installer.exe ne peut être terminé
  it('RCA-04 : Aucun *Installer.exe ne peut être terminé (exclusion explicite dans les scripts de terminaison)', () => {
    assert.ok(installerUser.includes('-like "*Installer.exe"'), 'installer.nsh doit exclure *Installer.exe');
    assert.ok(installerAdmin.includes('-like "*Installer.exe"'), 'installer-admin.nsh doit exclure *Installer.exe');
    assert.ok(termUserPs.includes('-like "*Installer.exe"'), 'terminate-bird-academy-processes.ps1 doit exclure *Installer.exe');
    assert.ok(termAdminPs.includes('-like "*Installer.exe"'), 'terminate-bird-academy-admin-processes.ps1 doit exclure *Installer.exe');
  });

  // RCA-05 : Le PID du processus parent de l'installateur est protégé
  it('RCA-05 : Le PID du processus parent de l\'installateur est protégé ($parentPid exclu)', () => {
    assert.ok(installerUser.includes('$parentPid'), 'installer.nsh doit calculer et exclure $parentPid');
    assert.ok(installerAdmin.includes('$parentPid'), 'installer-admin.nsh doit calculer et exclure $parentPid');
    assert.ok(termUserPs.includes('$parentPid'), 'terminate-bird-academy-processes.ps1 doit calculer et exclure $parentPid');
    assert.ok(termAdminPs.includes('$parentPid'), 'terminate-bird-academy-admin-processes.ps1 doit calculer et exclure $parentPid');
  });

  // RCA-06 : Le processus User peut être terminé par le mécanisme User
  it('RCA-06 : Le processus User peut être terminé par le mécanisme User (Bird-Academy-User.exe présent dans whitelist)', () => {
    assert.ok(installerUser.includes('"Bird-Academy-User.exe"'), 'installer.nsh doit inclure Bird-Academy-User.exe');
    assert.ok(termUserPs.includes('"Bird-Academy-User.exe"'), 'terminate-bird-academy-processes.ps1 doit inclure Bird-Academy-User.exe');
  });

  // RCA-07 : Le processus Admin peut être terminé par le mécanisme Admin
  it('RCA-07 : Le processus Admin peut être terminé par le mécanisme Admin (Bird-Academy-Admin.exe présent dans whitelist)', () => {
    assert.ok(installerAdmin.includes('"Bird-Academy-Admin.exe"'), 'installer-admin.nsh doit inclure Bird-Academy-Admin.exe');
    assert.ok(termAdminPs.includes('"Bird-Academy-Admin.exe"'), 'terminate-bird-academy-admin-processes.ps1 doit inclure Bird-Academy-Admin.exe');
  });

  // RCA-08 : Le mécanisme User ne peut pas terminer Admin
  it('RCA-08 : Le mécanisme User ne peut pas terminer Admin (zéro référence Admin dans User hooks)', () => {
    assert.strictEqual(installerUser.includes('"Bird-Academy-Admin.exe"'), false);
    assert.strictEqual(installerUser.includes('Programs\\bird-academy-admin'), false);
    assert.strictEqual(termUserPs.includes('"Bird-Academy-Admin.exe"'), false);
    assert.strictEqual(termUserPs.includes('Programs\\bird-academy-admin'), false);
  });

  // RCA-09 : Le mécanisme Admin ne peut pas terminer User
  it('RCA-09 : Le mécanisme Admin ne peut pas terminer User (zéro référence User dans Admin hooks)', () => {
    assert.strictEqual(installerAdmin.includes('"Bird-Academy-User.exe"'), false);
    assert.strictEqual(installerAdmin.includes('Programs\\bird-academy-user'), false);
    assert.strictEqual(termAdminPs.includes('"Bird-Academy-User.exe"'), false);
    assert.strictEqual(termAdminPs.includes('Programs\\bird-academy-user'), false);
  });

  // RCA-10 : User et Admin utilisent des répertoires d'installation différents
  it('RCA-10 : User et Admin utilisent des répertoires d\'installation différents (%LOCALAPPDATA%\\Programs\\bird-academy-user vs bird-academy-admin)', () => {
    assert.strictEqual(builderUser.extraMetadata.name, 'bird-academy-user');
    assert.strictEqual(builderAdmin.extraMetadata.name, 'bird-academy-admin');
    assert.notStrictEqual(builderUser.extraMetadata.name, builderAdmin.extraMetadata.name);
  });

  // RCA-11 : User et Admin utilisent des AppData différents
  it('RCA-11 : User et Admin utilisent des AppData différents (%APPDATA%\\Bird Academy Enterprise vs %APPDATA%\\Bird Academy Admin)', () => {
    assert.ok(electronMain.includes("const APP_CANONICAL_NAME = 'Bird Academy Enterprise'"));
    assert.ok(electronMain.includes("path.join(appDataPath, 'Bird Academy Admin')"));
  });

  // RCA-12 : Les configurations electron-builder possèdent des métadonnées distinctes
  it('RCA-12 : Les configurations electron-builder possèdent des métadonnées distinctes (appId, productName, executableName)', () => {
    assert.strictEqual(builderUser.appId, 'com.birdacademy.breeder');
    assert.strictEqual(builderAdmin.appId, 'com.birdacademy.admin');
    assert.notStrictEqual(builderUser.appId, builderAdmin.appId);
    assert.notStrictEqual(builderUser.productName, builderAdmin.productName);
    assert.notStrictEqual(builderUser.win.executableName, builderAdmin.win.executableName);
  });

  // RCA-13 : Les installateurs contiennent les hooks NSIS corrigés
  it('RCA-13 : Les installateurs contiennent les hooks NSIS corrigés', () => {
    assert.strictEqual(builderUser.nsis.include, 'packaging/installer.nsh');
    assert.strictEqual(builderAdmin.nsis.include, 'packaging/installer-admin.nsh');
    assert.ok(installerUser.includes('!macro customInit'));
    assert.ok(installerAdmin.includes('!macro customInit'));
  });

  // RCA-14 : Le bundle User contient index.html
  it('RCA-14 : Le bundle User contient index.html', () => {
    assert.ok(fs.existsSync(userHtmlPath), 'index.html doit exister à la racine');
  });

  // RCA-15 : Le bundle Admin contient admin.html
  it('RCA-15 : Le bundle Admin contient admin.html', () => {
    assert.ok(fs.existsSync(adminHtmlPath), 'admin.html doit exister à la racine');
  });

  // RCA-16 : Le bundle User ne contient pas de fuite administrative interdite
  it('RCA-16 : Le bundle User ne contient pas de fuite administrative interdite', () => {
    const distUserDir = path.join(rootDir, 'dist_user');
    if (fs.existsSync(distUserDir)) {
      assert.strictEqual(fs.existsSync(path.join(distUserDir, 'admin.html')), false, 'dist_user ne doit pas contenir admin.html');
    }
  });

  // RCA-17 : Le bundle Admin est valide
  it('RCA-17 : Le bundle Admin est valide', () => {
    const distAdminDir = path.join(rootDir, 'dist_admin');
    if (fs.existsSync(distAdminDir)) {
      assert.ok(fs.existsSync(path.join(distAdminDir, 'admin.html')), 'dist_admin doit contenir admin.html');
    }
  });
});

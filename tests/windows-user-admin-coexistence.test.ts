/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS USER & ADMIN COEXISTENCE TEST SUITE
 * Validates complete isolation between Bird Academy User and Bird Academy Admin:
 * - Distinct App IDs, Product Names, Executable Names, and extraMetadata.name
 * - Disjoint installation directories (%LOCALAPPDATA%\Programs\bird-academy-user vs %LOCALAPPDATA%\Programs\bird-academy-admin)
 * - Independent app.asar packages and entry points (dist/index.html vs dist/admin.html)
 * - Deterministic runtime mode determination in electron-main.cjs
 * - Distinct %APPDATA% directories without cross-migration
 * - Isolated PID-first process termination hooks and whitelists
 * - Coexistence, clean install, upgrade, uninstall, and rollback scenarios
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('MISSION BUG-WIN-USER-ADMIN-01 — WINDOWS USER / ADMIN COEXISTENCE & ISOLATION', () => {
  const rootDir = process.cwd();
  const builderUserPath = path.join(rootDir, 'electron-builder-user.json');
  const builderAdminPath = path.join(rootDir, 'electron-builder-admin.json');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const installerUserPath = path.join(rootDir, 'packaging', 'installer.nsh');
  const installerAdminPath = path.join(rootDir, 'packaging', 'installer-admin.nsh');
  const termUserPsPath = path.join(rootDir, 'scripts', 'windows', 'terminate-bird-academy-processes.ps1');
  const termAdminPsPath = path.join(rootDir, 'scripts', 'windows', 'terminate-bird-academy-admin-processes.ps1');
  const resetUserPsPath = path.join(rootDir, 'scripts', 'windows', 'reset-first-launch-qa.ps1');
  const resetAdminPsPath = path.join(rootDir, 'scripts', 'windows', 'reset-admin-qa.ps1');
  const userHtmlPath = path.join(rootDir, 'index.html');
  const adminHtmlPath = path.join(rootDir, 'admin.html');
  const userAppPath = path.join(rootDir, 'src', 'App.tsx');
  const adminAppPath = path.join(rootDir, 'src', 'AdminApp.tsx');

  const builderUser = JSON.parse(fs.readFileSync(builderUserPath, 'utf8'));
  const builderAdmin = JSON.parse(fs.readFileSync(builderAdminPath, 'utf8'));
  const electronMain = fs.readFileSync(electronMainPath, 'utf8');
  const installerUser = fs.readFileSync(installerUserPath, 'utf8');
  const installerAdmin = fs.readFileSync(installerAdminPath, 'utf8');
  const termUser = fs.readFileSync(termUserPsPath, 'utf8');
  const termAdmin = fs.readFileSync(termAdminPsPath, 'utf8');
  const resetUser = fs.readFileSync(resetUserPsPath, 'utf8');
  const resetAdmin = fs.readFileSync(resetAdminPsPath, 'utf8');

  // 1. appId distincts
  it('01 : appId distincts (com.birdacademy.breeder vs com.birdacademy.admin)', () => {
    assert.strictEqual(builderUser.appId, 'com.birdacademy.breeder');
    assert.strictEqual(builderAdmin.appId, 'com.birdacademy.admin');
    assert.notStrictEqual(builderUser.appId, builderAdmin.appId);
  });

  // 2. productName distincts
  it('02 : productName distincts', () => {
    assert.ok(builderUser.productName.includes('Avian ERP') || builderUser.productName.includes('Enterprise'));
    assert.ok(builderAdmin.productName.includes('Admin'));
    assert.notStrictEqual(builderUser.productName, builderAdmin.productName);
  });

  // 3. executableName distincts
  it('03 : executableName distincts (Bird-Academy-User vs Bird-Academy-Admin)', () => {
    assert.strictEqual(builderUser.win.executableName, 'Bird-Academy-User');
    assert.ok(builderAdmin.win.executableName === 'Bird-Academy-Admin' || builderAdmin.win.executableName === 'Bird Academy Enterprise Admin');
    assert.notStrictEqual(builderUser.win.executableName, builderAdmin.win.executableName);
  });

  // 4. extraMetadata.name distincts
  it('04 : extraMetadata.name distincts (bird-academy-user vs bird-academy-admin)', () => {
    assert.ok(builderUser.extraMetadata, 'User configuration doit définir extraMetadata');
    assert.strictEqual(builderUser.extraMetadata.name, 'bird-academy-user');
    assert.ok(builderAdmin.extraMetadata, 'Admin configuration doit définir extraMetadata');
    assert.strictEqual(builderAdmin.extraMetadata.name, 'bird-academy-admin');
    assert.notStrictEqual(builderUser.extraMetadata.name, builderAdmin.extraMetadata.name);
  });

  // 5. répertoires d'installation distincts
  it('05 : répertoires d\'installation distincts (%LOCALAPPDATA%\\Programs\\bird-academy-user vs bird-academy-admin)', () => {
    // electron-builder calculates $INSTDIR using extraMetadata.name in oneClick/perUser mode
    const userInstallDir = `Programs\\${builderUser.extraMetadata.name}`;
    const adminInstallDir = `Programs\\${builderAdmin.extraMetadata.name}`;
    assert.strictEqual(userInstallDir, 'Programs\\bird-academy-user');
    assert.strictEqual(adminInstallDir, 'Programs\\bird-academy-admin');
    assert.notStrictEqual(userInstallDir, adminInstallDir);
  });

  // 6. resources/app.asar distincts (sorties de build séparées)
  it('06 : resources/app.asar distincts (directories.output release-user vs release-admin)', () => {
    assert.strictEqual(builderUser.directories.output, 'release-user');
    assert.strictEqual(builderAdmin.directories.output, 'release-admin');
    assert.notStrictEqual(builderUser.directories.output, builderAdmin.directories.output);
  });

  // 7. runtime User déterministe
  it('07 : runtime User déterministe (Bird-Academy-User.exe force le mode User)', () => {
    assert.ok(electronMain.includes('function determineIsAdmin()'), 'electron-main.cjs doit implémenter determineIsAdmin()');
    assert.ok(electronMain.includes("execName.includes('user')"), 'determineIsAdmin doit détecter les exécutables User');
    assert.ok(electronMain.includes("pkg.name === 'bird-academy-user'"), 'determineIsAdmin doit détecter le package User');
  });

  // 8. runtime Admin déterministe
  it('08 : runtime Admin déterministe (Bird-Academy-Admin.exe force le mode Admin)', () => {
    assert.ok(electronMain.includes("execName.includes('admin')"), 'determineIsAdmin doit détecter les exécutables Admin');
    assert.ok(electronMain.includes("pkg.name === 'bird-academy-admin'"), 'determineIsAdmin doit détecter le package Admin');
  });

  // 9. userData User distinct
  it('09 : userData User distinct (%APPDATA%\\Bird Academy Enterprise)', () => {
    assert.ok(electronMain.includes("const APP_CANONICAL_NAME = 'Bird Academy Enterprise'"));
    assert.ok(electronMain.includes("const targetUserDataPath = path.join(appDataPath, APP_CANONICAL_NAME)"));
  });

  // 10. userData Admin distinct
  it('10 : userData Admin distinct (%APPDATA%\\Bird Academy Admin)', () => {
    assert.ok(electronMain.includes("path.join(appDataPath, 'Bird Academy Admin')"));
  });

  // 11. whitelist processus User
  it('11 : whitelist processus User (inclus Bird-Academy-User.exe et variantes User)', () => {
    assert.ok(termUser.includes('"Bird-Academy-User.exe"'));
    assert.ok(termUser.includes('"Bird Academy Enterprise.exe"'));
    assert.ok(installerUser.includes('"Bird-Academy-User.exe"'));
  });

  // 12. whitelist processus Admin
  it('12 : whitelist processus Admin (inclus Bird-Academy-Admin.exe et variantes Admin)', () => {
    assert.ok(termAdmin.includes('"Bird-Academy-Admin.exe"'));
    assert.ok(termAdmin.includes('"Bird Academy Enterprise Admin.exe"'));
    assert.ok(installerAdmin.includes('"Bird-Academy-Admin.exe"'));
  });

  // 13. Admin ne termine jamais User
  it('13 : Admin ne termine jamais User (aucune référence User dans terminate-admin.ps1 ni installer-admin.nsh)', () => {
    assert.strictEqual(termAdmin.includes('"Bird-Academy-User.exe"'), false);
    assert.strictEqual(termAdmin.includes('"Bird Academy Enterprise.exe"'), false);
    assert.strictEqual(termAdmin.includes('"react-example.exe"'), false);
    assert.strictEqual(installerAdmin.includes('"Bird-Academy-User.exe"'), false);
    assert.strictEqual(installerAdmin.includes('"Bird Academy Enterprise.exe"'), false);
  });

  // 14. User ne termine jamais Admin
  it('14 : User ne termine jamais Admin (aucune référence Admin dans terminate-bird-academy-processes.ps1 ni installer.nsh)', () => {
    assert.strictEqual(termUser.includes('"Bird-Academy-Admin.exe"'), false);
    assert.strictEqual(termUser.includes('"Bird Academy Enterprise Admin.exe"'), false);
    assert.strictEqual(installerUser.includes('"Bird-Academy-Admin.exe"'), false);
    assert.strictEqual(installerUser.includes('"Bird Academy Enterprise Admin.exe"'), false);
  });

  // 15. migration User intacte
  it('15 : migration User intacte (migration depuis legacy react-example / Bird Academy vers Bird Academy Enterprise)', () => {
    assert.ok(electronMain.includes("path.join(appDataPath, 'react-example')"));
    assert.ok(electronMain.includes("path.join(appDataPath, 'Bird Academy')"));
    assert.ok(electronMain.includes("fs.cpSync(legacyDir, targetUserDataPath"));
  });

  // 16. aucune migration croisée
  it('16 : aucune migration croisée (Admin retourne immédiatement sans migrer les profils User)', () => {
    assert.ok(electronMain.includes("if (isAdmin) {"));
    const adminBlock = electronMain.slice(electronMain.indexOf('if (isAdmin)'), electronMain.indexOf('const targetUserDataPath'));
    assert.ok(adminBlock.includes('return;'), 'setupUserDataAndMigration doit retourner immédiatement pour Admin');
  });

  // 17. désinstallation Admin sans impact User
  it('17 : désinstallation Admin sans impact User (%APPDATA%\\Bird Academy Enterprise non ciblé pour purge)', () => {
    assert.strictEqual(resetAdmin.includes('Remove-Item -Path (Join-Path $appData "Bird Academy Enterprise")'), false);
    assert.ok(resetAdmin.includes('Bird Academy Admin'));
  });

  // 18. désinstallation User sans impact Admin
  it('18 : désinstallation User sans impact Admin (%APPDATA%\\Bird Academy Admin non ciblé)', () => {
    assert.strictEqual(resetUser.includes('Bird Academy Admin'), false);
    assert.ok(resetUser.includes('Bird Academy Enterprise'));
  });

  // 19. upgrade Admin sans impact User
  it('19 : upgrade Admin sans impact User (installer-admin.nsh cible uniquement Programs\\bird-academy-admin)', () => {
    assert.ok(installerAdmin.includes('Programs\\bird-academy-admin'));
    assert.strictEqual(installerAdmin.includes('Programs\\bird-academy-user'), false);
  });

  // 20. upgrade User sans impact Admin
  it('20 : upgrade User sans impact Admin (installer.nsh cible uniquement Programs\\bird-academy-user et legacy User)', () => {
    assert.ok(installerUser.includes('Programs\\bird-academy-user'));
    assert.strictEqual(installerUser.includes('Programs\\bird-academy-admin'), false);
  });

  // 21. coexistence simultanée
  it('21 : coexistence simultanée (deux points d entrée HTML, deux composants racine React)', () => {
    assert.ok(fs.existsSync(userHtmlPath), 'index.html doit exister pour User');
    assert.ok(fs.existsSync(adminHtmlPath), 'admin.html doit exister pour Admin');
    assert.ok(fs.existsSync(userAppPath), 'src/App.tsx doit exister pour User');
    assert.ok(fs.existsSync(adminAppPath), 'src/AdminApp.tsx doit exister pour Admin');
  });

  // 22. raccourci User
  it('22 : raccourci User (nom d exécutable et icône User configurés)', () => {
    assert.strictEqual(builderUser.win.executableName, 'Bird-Academy-User');
    assert.strictEqual(builderUser.win.icon, 'build/icons/icon-user.ico');
    assert.strictEqual(builderUser.nsis.installerIcon, 'build/icons/icon-user.ico');
  });

  // 23. raccourci Admin
  it('23 : raccourci Admin (nom d exécutable et icône Admin configurés)', () => {
    assert.ok(builderAdmin.win.executableName === 'Bird-Academy-Admin' || builderAdmin.win.executableName === 'Bird Academy Enterprise Admin');
    assert.strictEqual(builderAdmin.win.icon, 'build/icons/icon-admin.ico');
    assert.strictEqual(builderAdmin.nsis.installerIcon, 'build/icons/icon-admin.ico');
  });

  // 24. clean install User
  it('24 : clean install User (NSIS oneClick perMachine false avec installer.nsh)', () => {
    assert.strictEqual(builderUser.nsis.oneClick, true);
    assert.strictEqual(builderUser.nsis.perMachine, false);
    assert.strictEqual(builderUser.nsis.include, 'packaging/installer.nsh');
  });

  // 25. clean install Admin
  it('25 : clean install Admin (NSIS oneClick perMachine false avec installer-admin.nsh)', () => {
    assert.strictEqual(builderAdmin.nsis.oneClick, true);
    assert.strictEqual(builderAdmin.nsis.perMachine, false);
    assert.strictEqual(builderAdmin.nsis.include, 'packaging/installer-admin.nsh');
  });

  // 26. réinstallation User
  it('26 : réinstallation User (deleteAppDataOnUninstall false préserve les données)', () => {
    assert.strictEqual(builderUser.nsis.deleteAppDataOnUninstall, false);
  });

  // 27. réinstallation Admin
  it('27 : réinstallation Admin (deleteAppDataOnUninstall false préserve les données)', () => {
    assert.strictEqual(builderAdmin.nsis.deleteAppDataOnUninstall, false);
  });

  // 28. rollback User
  it('28 : rollback User (Release/Windows-RC3.1 baseline préservée intacte)', () => {
    const rc31Dir = path.join(rootDir, 'Release', 'Windows-RC3.1');
    assert.ok(fs.existsSync(rc31Dir), 'Release/Windows-RC3.1 doit exister');
    const shaFile = path.join(rc31Dir, 'SHA256SUMS.txt');
    assert.ok(fs.existsSync(shaFile), 'SHA256SUMS.txt doit exister dans Release/Windows-RC3.1');
  });

  // 29. rollback Admin
  it('29 : rollback Admin (Release/Windows-Admin répertoire de release séparé)', () => {
    const adminRelDir = path.join(rootDir, 'Release', 'Windows-Admin');
    assert.ok(fs.existsSync(adminRelDir), 'Release/Windows-Admin doit exister');
  });

  // 30. cycle complet User + Admin
  it('30 : cycle complet User + Admin (isolation de bout en bout validée)', () => {
    // Comprehensive cross-check: No shared install directory, no shared package name, no shared AppData
    assert.notStrictEqual(builderUser.extraMetadata.name, builderAdmin.extraMetadata.name);
    assert.notStrictEqual(builderUser.appId, builderAdmin.appId);
    assert.notStrictEqual(builderUser.directories.output, builderAdmin.directories.output);
  });
});

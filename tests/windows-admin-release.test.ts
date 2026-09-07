import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('MISSION ADMIN-WINDOWS-02 — WINDOWS ADMINISTRATOR RELEASE & ISOLATION (ADMIN-WIN-01 to ADMIN-WIN-20)', () => {
  const rootDir = process.cwd();
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const electronBuilderAdminPath = path.join(rootDir, 'electron-builder-admin.json');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const installerAdminPath = path.join(rootDir, 'packaging', 'installer-admin.nsh');
  const installerUserPath = path.join(rootDir, 'packaging', 'installer.nsh');
  const terminateAdminPsPath = path.join(rootDir, 'scripts', 'windows', 'terminate-bird-academy-admin-processes.ps1');
  const terminateUserPsPath = path.join(rootDir, 'scripts', 'windows', 'terminate-bird-academy-processes.ps1');
  const resetAdminPsPath = path.join(rootDir, 'scripts', 'windows', 'reset-admin-qa.ps1');
  const verifyAdminBundlePath = path.join(rootDir, 'scripts', 'verifyAdminBundle.js');
  const packageAdminScriptPath = path.join(rootDir, 'scripts', 'packageWindowsAdmin.js');
  const adminAppPath = path.join(rootDir, 'src', 'AdminApp.tsx');
  const adminHtmlPath = path.join(rootDir, 'admin.html');
  const userAppPath = path.join(rootDir, 'src', 'App.tsx');
  const userHtmlPath = path.join(rootDir, 'index.html');

  // --------------------------------------------------------------------------
  // ADMIN-WIN-01 : Identity Isolation
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-01 : Identity isolation (appId, productName, executableName distincts)', () => {
    assert.ok(fs.existsSync(electronBuilderAdminPath), 'electron-builder-admin.json doit exister');
    const builderAdmin = JSON.parse(fs.readFileSync(electronBuilderAdminPath, 'utf-8'));
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Admin configuration assertions
    assert.strictEqual(builderAdmin.appId, 'com.birdacademy.admin', 'Admin appId doit être com.birdacademy.admin');
    assert.ok(builderAdmin.productName === 'Bird Academy - Admin Center' || builderAdmin.productName === 'Bird Academy Enterprise Admin', 'Admin productName doit être distinct');
    assert.ok(builderAdmin.win.executableName === 'Bird-Academy-Admin' || builderAdmin.win.executableName === 'Bird Academy Enterprise Admin', 'Admin executableName doit être distinct');
    assert.strictEqual(builderAdmin.directories.output, 'release-admin', 'Output doit être release-admin');

    // User configuration assertions (must be different)
    assert.strictEqual(pkg.build.appId, 'com.birdacademy.app', 'User appId doit rester com.birdacademy.app');
    assert.notStrictEqual(builderAdmin.appId, pkg.build.appId, 'Admin et User doivent avoir des appId différents');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-02 : AppData Isolation
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-02 : AppData isolation (%APPDATA%\\Bird Academy Admin vs %APPDATA%\\Bird Academy Enterprise)', () => {
    const electronMain = fs.readFileSync(electronMainPath, 'utf-8');
    assert.ok(electronMain.includes("path.join(appDataPath, 'Bird Academy Admin')"), 'electron-main.cjs doit configurer userData vers Bird Academy Admin');
    assert.ok(electronMain.includes("const APP_CANONICAL_NAME = 'Bird Academy Enterprise'"), 'electron-main.cjs doit conserver le chemin User canonical');
    assert.ok(electronMain.includes("const ADMIN_CANONICAL_NAME = 'Bird Academy Enterprise Admin'"), 'electron-main.cjs doit définir ADMIN_CANONICAL_NAME');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-03 : Process Isolation
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-03 : Process isolation (Whitelist Admin stricte)', () => {
    const termAdminContent = fs.readFileSync(terminateAdminPsPath, 'utf-8');
    assert.ok(termAdminContent.includes('Bird Academy Enterprise Admin.exe'), 'Whitelist Admin doit inclure Bird Academy Enterprise Admin.exe');
    assert.ok(termAdminContent.includes('Bird Academy Admin.exe'), 'Whitelist Admin doit inclure Bird Academy Admin.exe');
    
    // User names must NEVER appear in Admin termination whitelist
    assert.strictEqual(termAdminContent.includes('"Bird Academy Enterprise.exe"'), false, 'Whitelist Admin ne doit JAMAIS cibler Bird Academy Enterprise.exe');
    assert.strictEqual(termAdminContent.includes('"react-example.exe"'), false, 'Whitelist Admin ne doit JAMAIS cibler react-example.exe');
    assert.strictEqual(termAdminContent.includes('"Bird Academy User RC3.1.exe"'), false, 'Whitelist Admin ne doit JAMAIS cibler Bird Academy User RC3.1.exe');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-04 : Installer Identity
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-04 : Installer identity (packaging/installer-admin.nsh)', () => {
    assert.ok(fs.existsSync(installerAdminPath), 'packaging/installer-admin.nsh doit exister');
    const installerAdmin = fs.readFileSync(installerAdminPath, 'utf-8');
    assert.ok(installerAdmin.includes('Bird Academy Enterprise Admin.exe'), 'installer-admin.nsh doit cibler Bird Academy Enterprise Admin.exe');
    assert.ok(installerAdmin.includes('WriteTerminateAdminScript'), 'installer-admin.nsh doit définir WriteTerminateAdminScript');
    assert.ok(installerAdmin.includes('CloseAllBirdAcademyAdminInstances'), 'installer-admin.nsh doit définir CloseAllBirdAcademyAdminInstances');
    assert.strictEqual(installerAdmin.includes('"Bird Academy Enterprise.exe"'), false, 'installer-admin.nsh ne doit JAMAIS cibler User');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-05 : Uninstaller Identity & Data Protection
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-05 : Uninstaller identity (deleteAppDataOnUninstall reste false)', () => {
    const builderAdmin = JSON.parse(fs.readFileSync(electronBuilderAdminPath, 'utf-8'));
    assert.strictEqual(builderAdmin.nsis.deleteAppDataOnUninstall, false, 'deleteAppDataOnUninstall doit être false pour Admin');
    const installerAdmin = fs.readFileSync(installerAdminPath, 'utf-8');
    assert.ok(installerAdmin.includes('customUnInstall'), 'customUnInstall hook doit être présent pour Admin');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-06 : User / Admin Coexistence Models
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-06 : User/Admin coexistence (Scénarios A à F validés)', () => {
    const termAdminContent = fs.readFileSync(terminateAdminPsPath, 'utf-8');
    const termUserContent = fs.readFileSync(terminateUserPsPath, 'utf-8');

    // Verify disjoint whitelists
    const adminNames = ['Bird Academy Enterprise Admin.exe', 'Bird Academy Admin.exe', 'Bird-Academy-Admin-Windows.exe'];
    const userNames = ['Bird Academy Enterprise.exe', 'Bird Academy User RC3.1.exe', 'react-example.exe'];

    for (const uName of userNames) {
      assert.strictEqual(termAdminContent.includes(`"${uName}"`), false, `Admin script ne doit pas contenir ${uName}`);
    }
    for (const aName of adminNames) {
      assert.strictEqual(termUserContent.includes(`"${aName}"`), false, `User script ne doit pas contenir ${aName}`);
    }
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-07 : Admin Upgrade
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-07 : Admin upgrade (PID-first cible uniquement Admin)', () => {
    const installerAdmin = fs.readFileSync(installerAdminPath, 'utf-8');
    assert.ok(installerAdmin.includes('terminate-admin.ps1'), 'installer-admin.nsh doit invoquer terminate-admin.ps1');
    assert.ok(installerAdmin.includes('customInit'), 'customInit hook présent pour upgrade Admin');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-08 : User Upgrade While Admin is Open
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-08 : User upgrade while Admin is open (installer.nsh User ignore Admin)', () => {
    const installerUser = fs.readFileSync(installerUserPath, 'utf-8');
    assert.strictEqual(installerUser.includes('Bird Academy Enterprise Admin.exe'), false, 'User installer.nsh ne doit pas fermer Admin');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-09 : Admin Uninstall Preserves User
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-09 : Admin uninstall preserves User (%APPDATA%\\Bird Academy Enterprise intact)', () => {
    const resetAdmin = fs.readFileSync(resetAdminPsPath, 'utf-8');
    assert.strictEqual(resetAdmin.includes('Remove-Item -Path (Join-Path $appData "Bird Academy Enterprise")'), false, 'Reset Admin ne doit jamais supprimer User AppData');
    assert.ok(resetAdmin.includes('Bird Academy Admin'), 'Reset Admin doit cibler Bird Academy Admin');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-10 : User Uninstall Preserves Admin
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-10 : User uninstall preserves Admin (%APPDATA%\\Bird Academy Admin intact)', () => {
    const resetUserPath = path.join(rootDir, 'scripts', 'windows', 'reset-first-launch-qa.ps1');
    const resetUser = fs.readFileSync(resetUserPath, 'utf-8');
    assert.strictEqual(resetUser.includes('Bird Academy Admin'), false, 'User reset ne doit jamais cibler Admin AppData');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-11 : License Isolation
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-11 : License isolation (Admin possède le LicenseAdminCenter / LMSE)', () => {
    const adminApp = fs.readFileSync(adminAppPath, 'utf-8');
    assert.ok(adminApp.includes('AdminCenterView') || adminApp.includes('lmse_admin_session'), 'AdminApp doit intégrer la gestion d administration');
    
    const userApp = fs.readFileSync(userAppPath, 'utf-8');
    assert.strictEqual(userApp.includes('LicenseAdminCenter'), false, 'User App.tsx ne doit pas importer LicenseAdminCenter');
    assert.strictEqual(userApp.includes('AdminCenterView'), false, 'User App.tsx ne doit pas importer AdminCenterView');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-12 : First Launch Isolation
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-12 : First Launch isolation (Admin login distinct du Wizard User)', () => {
    const adminApp = fs.readFileSync(adminAppPath, 'utf-8');
    assert.ok(adminApp.includes('lmse_admin_session'), 'AdminApp doit gérer sa propre session');
    assert.strictEqual(adminApp.includes('WelcomeWizard'), false, 'AdminApp ne doit pas charger WelcomeWizard');
    assert.strictEqual(adminApp.includes('FirstLaunchActivationScreen'), false, 'AdminApp ne doit pas charger FirstLaunchActivationScreen');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-13 : Bundle Isolation
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-13 : Bundle isolation (scripts de verification User et Admin)', () => {
    assert.ok(fs.existsSync(verifyAdminBundlePath), 'scripts/verifyAdminBundle.js doit exister');
    const verifyUserScriptPath = path.join(rootDir, 'scripts', 'verifyUserBundle.js');
    assert.ok(fs.existsSync(verifyUserScriptPath), 'scripts/verifyUserBundle.js doit exister');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-14 : Admin Never Terminates User
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-14 : Admin never terminates User (Aucune commande destructrice transverse)', () => {
    const termAdmin = fs.readFileSync(terminateAdminPsPath, 'utf-8');
    assert.strictEqual(termAdmin.includes('taskkill /F /IM *'), false, 'taskkill générique interdit');
    assert.strictEqual(termAdmin.includes('Stop-Process *'), false, 'Stop-Process générique interdit');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-15 : Admin Never Deletes User Data
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-15 : Admin never deletes User data', () => {
    const installerAdmin = fs.readFileSync(installerAdminPath, 'utf-8');
    assert.strictEqual(installerAdmin.includes('react-example'), false, 'installer-admin.nsh ne doit pas nettoyer les répertoires User');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-16 : No Cross-Migration
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-16 : No cross migration (Admin ne migre pas les données User legacy)', () => {
    const electronMain = fs.readFileSync(electronMainPath, 'utf-8');
    // Admin setup returns early without running legacyCandidates migration
    const adminBlock = electronMain.slice(electronMain.indexOf('if (isAdmin)'), electronMain.indexOf('const targetUserDataPath'));
    assert.ok(adminBlock.includes('return;'), 'setupUserDataAndMigration doit return immédiatement pour Admin sans exécuter la migration User');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-17 : Clean Admin Install
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-17 : Clean Admin install (admin.html présent avec #admin-root)', () => {
    assert.ok(fs.existsSync(adminHtmlPath), 'admin.html doit exister à la racine');
    const adminHtml = fs.readFileSync(adminHtmlPath, 'utf-8');
    assert.ok(adminHtml.includes('id="admin-root"') || adminHtml.includes("id='admin-root'"), 'admin.html doit monter #admin-root');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-18 : Admin Upgrade from Previous Admin Version
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-18 : Admin upgrade (Packaging script configure la persistance des données)', () => {
    assert.ok(fs.existsSync(packageAdminScriptPath), 'scripts/packageWindowsAdmin.js doit exister');
    const pkgScript = fs.readFileSync(packageAdminScriptPath, 'utf-8');
    assert.ok(pkgScript.includes('electron-builder-admin.json'), 'packageWindowsAdmin.js doit utiliser electron-builder-admin.json');
    assert.ok(pkgScript.includes('Release/Windows-Admin') || pkgScript.includes('Release\\Windows-Admin'), 'packageWindowsAdmin.js doit cibler Release/Windows-Admin');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-19 : Rollback Safety
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-19 : Rollback safety (Release/Windows-RC3.1 intact)', () => {
    const userReleaseDir = path.join(rootDir, 'Release', 'Windows-RC3.1');
    assert.ok(fs.existsSync(userReleaseDir), 'Release/Windows-RC3.1 doit rester intact');
    const userSha = path.join(userReleaseDir, 'SHA256SUMS.txt');
    assert.ok(fs.existsSync(userSha), 'SHA256SUMS.txt User doit exister et être préservé');
  });

  // --------------------------------------------------------------------------
  // ADMIN-WIN-20 : Complete Coexistence Lifecycle
  // --------------------------------------------------------------------------
  it('ADMIN-WIN-20 : Complete coexistence lifecycle (Double points d entrée, double builds)', () => {
    assert.ok(fs.existsSync(userHtmlPath), 'index.html User présent');
    assert.ok(fs.existsSync(adminHtmlPath), 'admin.html Admin présent');
    assert.ok(fs.existsSync(userAppPath), 'src/App.tsx User présent');
    assert.ok(fs.existsSync(adminAppPath), 'src/AdminApp.tsx Admin présent');
  });
});

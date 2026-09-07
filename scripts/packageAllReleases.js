/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — DUAL MULTI-PLATFORM RELEASE PIPELINE
 * Compiles, verifies, and packages:
 * 1. Windows User Application (Avian ERP) - NSIS Setup & Portable
 * 2. Windows Admin Application (Admin Center) - NSIS Setup & Portable
 * 3. Android Mobile Application - APK Debug/Release
 * 
 * Target Directory  : Release/Release-2026-Multilingual/
 * Root Binaries     : Workspace Root (Direct accessibility)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const RELEASE_DIR = path.join(ROOT_DIR, 'Release', 'Release-2026-Multilingual');
const USER_BUILD_DIR = path.join(ROOT_DIR, 'release-user');
const ADMIN_BUILD_DIR = path.join(ROOT_DIR, 'release-admin');
const ANDROID_APK_DIR = path.join(ROOT_DIR, 'android', 'app', 'build', 'outputs', 'apk', 'debug');

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function findJdk17Or21() {
  const candidates = [
    'C:\\Android\\jdk-17',
    'C:\\Program Files\\Microsoft\\jdk-17.0.20.101-hotspot',
    'C:\\Program Files\\Microsoft\\jdk-17.0.20.1-hotspot',
    'C:\\Program Files\\Microsoft\\jdk-17.0.20.8-hotspot',
  ];

  // Also check Microsoft directory dynamically
  const msDir = 'C:\\Program Files\\Microsoft';
  if (fs.existsSync(msDir)) {
    const entries = fs.readdirSync(msDir);
    for (const e of entries) {
      if (e.toLowerCase().includes('jdk-17') || e.toLowerCase().includes('jdk-21')) {
        candidates.unshift(path.join(msDir, e));
      }
    }
  }

  // Also check Eclipse Adoptium
  const adoptiumDir = 'C:\\Program Files\\Eclipse Adoptium';
  if (fs.existsSync(adoptiumDir)) {
    const entries = fs.readdirSync(adoptiumDir);
    for (const e of entries) {
      if (e.toLowerCase().includes('jdk-17') || e.toLowerCase().includes('jdk-21')) {
        candidates.unshift(path.join(adoptiumDir, e));
      }
    }
  }

  // Check Java directory for jdk-17 or jdk-21
  const javaDir = 'C:\\Program Files\\Java';
  if (fs.existsSync(javaDir)) {
    const entries = fs.readdirSync(javaDir);
    for (const e of entries) {
      if (e.toLowerCase().includes('jdk-17') || e.toLowerCase().includes('jdk-21')) {
        candidates.unshift(path.join(javaDir, e));
      }
    }
  }

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.existsSync(path.join(c, 'bin', 'javac.exe'))) {
      return c;
    }
  }
  return null;
}

console.log('==================================================================');
console.log(' BIRD ACADEMY — DUAL MULTI-PLATFORM RELEASE PIPELINE (WIN + ANDROID)');
console.log(' Target Directory: Release/Release-2026-Multilingual/              ');
console.log('==================================================================');

ensureDir(RELEASE_DIR);

// ----------------------------------------------------------------------
// 1. GENERATE BRAND ASSETS & ICONS
// ----------------------------------------------------------------------
console.log('\n[STEP 1/7] Generating brand icons (.ico)...');
execSync('node scripts/generateBrandIcons.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 2. BUILD & AUDIT USER WEB BUNDLE
// ----------------------------------------------------------------------
console.log('\n[STEP 2/7] Compiling Web User bundle (outDir: dist / dist_user)...');
execSync('npm run build:user', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[STEP 3/7] Verifying User Bundle integrity & zero administrative leaks...');
execSync('node scripts/verifyUserBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 3. PACKAGING ELECTRON USER
// ----------------------------------------------------------------------
console.log('\n[STEP 4/7] Packaging User Windows binaries with electron-builder...');
if (fs.existsSync(USER_BUILD_DIR)) {
  try {
    fs.rmSync(USER_BUILD_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn('Warning removing user build dir:', e.message);
  }
}

// Sync dist_user explicitly into dist
fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
fs.cpSync(path.join(ROOT_DIR, 'dist_user'), path.join(ROOT_DIR, 'dist'), { recursive: true });

const pkgPath = path.join(ROOT_DIR, 'package.json');
const originalPkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkgObj = JSON.parse(originalPkgContent);

pkgObj.name = 'bird-academy-user';
fs.writeFileSync(pkgPath, JSON.stringify(pkgObj, null, 2), 'utf8');

try {
  execSync('npx electron-builder --win --config electron-builder-user.json', {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} catch (err) {
  console.error('❌ Error during User electron-builder execution:', err.message);
  process.exit(1);
} finally {
  fs.writeFileSync(pkgPath, originalPkgContent, 'utf8');
}

// ----------------------------------------------------------------------
// 4. BUILD & AUDIT ADMIN WEB BUNDLE
// ----------------------------------------------------------------------
console.log('\n[STEP 5/7] Compiling Web Admin bundle (outDir: dist_admin)...');
execSync('npm run build:admin', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[STEP 6/7] Verifying Admin Bundle integrity...');
execSync('node scripts/verifyAdminBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\nPackaging Admin Windows binaries with electron-builder...');
if (fs.existsSync(ADMIN_BUILD_DIR)) {
  try {
    fs.rmSync(ADMIN_BUILD_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn('Warning removing admin build dir:', e.message);
  }
}

// Sync dist_admin explicitly into dist
fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
fs.cpSync(path.join(ROOT_DIR, 'dist_admin'), path.join(ROOT_DIR, 'dist'), { recursive: true });

pkgObj.name = 'bird-academy-admin';
fs.writeFileSync(pkgPath, JSON.stringify(pkgObj, null, 2), 'utf8');

try {
  execSync('npx electron-builder --win --config electron-builder-admin.json', {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} catch (err) {
  console.error('❌ Error during Admin electron-builder execution:', err.message);
  process.exit(1);
} finally {
  fs.writeFileSync(pkgPath, originalPkgContent, 'utf8');
  // Always restore dist_user into dist for default local dev & testing
  fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
  fs.cpSync(path.join(ROOT_DIR, 'dist_user'), path.join(ROOT_DIR, 'dist'), { recursive: true });
}

// ----------------------------------------------------------------------
// 5. BUILD ANDROID APK
// ----------------------------------------------------------------------
console.log('\n[STEP 7/7] Compiling Android Mobile APK...');
try {
  // Sync capacitor
  console.log('  -> Syncing web assets with Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit', cwd: ROOT_DIR });

  const jdkPath = findJdk17Or21();
  if (!jdkPath) {
    console.warn('⚠️ Compatible JDK 17/21 not found yet. Attempting gradle with available environment...');
  } else {
    console.log(`  -> Using JDK for Gradle: ${jdkPath}`);
  }

  const androidEnv = {
    ...process.env,
    JAVA_HOME: jdkPath || process.env.JAVA_HOME || 'C:\\Program Files\\Java\\jdk-26.0.2.1',
    ANDROID_HOME: 'C:\\Android\\Sdk',
    PATH: (jdkPath ? path.join(jdkPath, 'bin') + ';' : '') + 'C:\\Android\\Sdk\\platform-tools;' + process.env.PATH
  };

  console.log('  -> Executing Gradle assembleDebug...');
  execSync('cmd.exe /c gradlew.bat assembleDebug', {
    cwd: path.join(ROOT_DIR, 'android'),
    stdio: 'inherit',
    env: androidEnv
  });
  console.log('  ✅ Gradle assembleDebug completed successfully!');
} catch (androidErr) {
  console.error('❌ Warning during Android build:', androidErr.message);
}

// ----------------------------------------------------------------------
// 6. COLLECT BINARIES, COPY TO ROOT & RELEASE FOLDER, GENERATE CHECKSUMS
// ----------------------------------------------------------------------
console.log('\n==================================================================');
console.log(' COLLECTING BINARIES & GENERATING CHECKSUMS                       ');
console.log('==================================================================');

const finalUserSetup = path.join(RELEASE_DIR, 'Bird-Academy-Avian-ERP-Setup.exe');
const finalUserPortable = path.join(RELEASE_DIR, 'Bird-Academy-User.exe');
const finalAdminSetup = path.join(RELEASE_DIR, 'Bird-Academy-Admin-Center-Setup.exe');
const finalAdminPortable = path.join(RELEASE_DIR, 'Bird-Academy-Admin.exe');
const finalApk = path.join(RELEASE_DIR, 'Bird-Academy-User.apk');

// Root convenience copies
const rootUserSetup = path.join(ROOT_DIR, 'Bird-Academy-User-Windows-Setup.exe');
const rootUserPortable = path.join(ROOT_DIR, 'Bird-Academy-User.exe');
const rootAdminSetup = path.join(ROOT_DIR, 'Bird-Academy-Admin-Windows-Setup.exe');
const rootAdminPortable = path.join(ROOT_DIR, 'Bird-Academy-Admin.exe');
const rootApk = path.join(ROOT_DIR, 'Bird-Academy-User.apk');

// Scan and copy User binaries
if (fs.existsSync(USER_BUILD_DIR)) {
  const userFiles = fs.readdirSync(USER_BUILD_DIR);
  for (const file of userFiles) {
    const lower = file.toLowerCase();
    const fullPath = path.join(USER_BUILD_DIR, file);
    if (file.endsWith('.exe') && fs.statSync(fullPath).isFile()) {
      if (lower.includes('setup') || lower.includes('installer')) {
        fs.copyFileSync(fullPath, finalUserSetup);
        fs.copyFileSync(fullPath, rootUserSetup);
      } else if (!fs.existsSync(finalUserPortable) || lower.includes('user') || lower.includes('erp') || lower.includes('enterprise')) {
        fs.copyFileSync(fullPath, finalUserPortable);
        fs.copyFileSync(fullPath, rootUserPortable);
      }
    }
  }
}

// Scan and copy Admin binaries
if (fs.existsSync(ADMIN_BUILD_DIR)) {
  const adminFiles = fs.readdirSync(ADMIN_BUILD_DIR);
  for (const file of adminFiles) {
    const lower = file.toLowerCase();
    const fullPath = path.join(ADMIN_BUILD_DIR, file);
    if (file.endsWith('.exe') && fs.statSync(fullPath).isFile()) {
      if (lower.includes('setup') || lower.includes('installer')) {
        fs.copyFileSync(fullPath, finalAdminSetup);
        fs.copyFileSync(fullPath, rootAdminSetup);
      } else if (!fs.existsSync(finalAdminPortable) || lower.includes('admin')) {
        fs.copyFileSync(fullPath, finalAdminPortable);
        fs.copyFileSync(fullPath, rootAdminPortable);
      }
    }
  }
}

// Scan and copy Android APK
const builtApkPath = path.join(ANDROID_APK_DIR, 'app-debug.apk');
if (fs.existsSync(builtApkPath)) {
  fs.copyFileSync(builtApkPath, finalApk);
  fs.copyFileSync(builtApkPath, rootApk);
}

// Compute checksums for all generated files
const checksumLines = [];
const summaryItems = [
  { name: 'Windows User Setup (NSIS)', path: finalUserSetup, rootPath: rootUserSetup },
  { name: 'Windows User Portable', path: finalUserPortable, rootPath: rootUserPortable },
  { name: 'Windows Admin Setup (NSIS)', path: finalAdminSetup, rootPath: rootAdminSetup },
  { name: 'Windows Admin Portable', path: finalAdminPortable, rootPath: rootAdminPortable },
  { name: 'Android Mobile APK', path: finalApk, rootPath: rootApk }
];

for (const item of summaryItems) {
  if (fs.existsSync(item.path)) {
    const hash = calculateSHA256(item.path);
    const size = (fs.statSync(item.path).size / (1024 * 1024)).toFixed(2);
    const filename = path.basename(item.path);
    checksumLines.push(`${hash}  ${filename} (${size} MB)`);
    console.log(`✅ [${item.name}]`);
    console.log(`   Release: ${item.path}`);
    console.log(`   Root   : ${item.rootPath}`);
    console.log(`   Size   : ${size} MB`);
    console.log(`   SHA256 : ${hash}\n`);
  } else {
    console.warn(`⚠️ [${item.name}] Not found at ${item.path}`);
  }
}

fs.writeFileSync(path.join(RELEASE_DIR, 'SHA256SUMS.txt'), checksumLines.join('\n') + '\n', 'utf8');

console.log('==================================================================');
console.log(' RELEASE GENERATION COMPLETED SUCCESSFULLY!                      ');
console.log(` Output Directory: ${RELEASE_DIR}`);
console.log('==================================================================\n');

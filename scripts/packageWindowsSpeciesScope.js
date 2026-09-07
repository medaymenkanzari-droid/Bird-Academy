/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS SPECIES SCOPE RELEASE PACKAGING PIPELINE
 * Compiles, verifies, and packages both User (Avian ERP) and Admin (Admin Center)
 * Windows binaries incorporating Species Profile Scoping Phase 2.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const RELEASE_SPECIES_SCOPE_DIR = path.join(ROOT_DIR, 'Release', 'Windows-SpeciesScope');
const USER_BUILD_DIR = path.join(ROOT_DIR, 'release-user');
const ADMIN_BUILD_DIR = path.join(ROOT_DIR, 'release-admin');

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

console.log('==================================================================');
console.log(' BIRD ACADEMY — WINDOWS SPECIES-SCOPE PACKAGING PIPELINE         ');
console.log(' Target Directory : Release/Windows-SpeciesScope/                 ');
console.log(' Protected Baseline: Release/Windows-RC3.1 (UNTOUCHED)           ');
console.log('==================================================================');

ensureDir(RELEASE_SPECIES_SCOPE_DIR);

// ----------------------------------------------------------------------
// 0. GENERATE BRAND ASSETS & ICONS
// ----------------------------------------------------------------------
console.log('\n[STEP 1/6] Generating official brand icons (.ico)...');
execSync('node scripts/generateBrandIcons.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 1. BUILD USER BUNDLE
// ----------------------------------------------------------------------
console.log('\n[STEP 2/6] Compiling Web User bundle (outDir: dist / dist_user)...');
execSync('npm run build:user', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[STEP 3/6] Verifying User Bundle integrity & zero administrative leaks...');
execSync('node scripts/verifyUserBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// Packaging User with electron-builder
console.log('\n[STEP 4/6] Packaging User Windows binaries with electron-builder...');
if (fs.existsSync(USER_BUILD_DIR)) {
  try {
    fs.rmSync(USER_BUILD_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn('Warning removing user build dir:', e.message);
  }
}

const pkgPath = path.join(ROOT_DIR, 'package.json');
const originalPkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkgObj = JSON.parse(originalPkgContent);

try {
  pkgObj.name = 'bird-academy-user';
  fs.writeFileSync(pkgPath, JSON.stringify(pkgObj, null, 2), 'utf8');

  execSync('npx electron-builder --win --config electron-builder-user.json', {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} finally {
  fs.writeFileSync(pkgPath, originalPkgContent, 'utf8');
}

// Locate User build outputs
const userFiles = fs.readdirSync(USER_BUILD_DIR);
let userSetupSrc = null;
let userPortableSrc = null;

for (const file of userFiles) {
  const lower = file.toLowerCase();
  const fullPath = path.join(USER_BUILD_DIR, file);
  if (file.endsWith('.exe') && fs.statSync(fullPath).isFile()) {
    if (lower.includes('setup') || lower.includes('installer')) {
      userSetupSrc = fullPath;
    } else if (!userPortableSrc) {
      userPortableSrc = fullPath;
    }
  }
}

if (!userSetupSrc || !userPortableSrc) {
  console.error('❌ Error: User .exe outputs not found in release-user/');
  process.exit(1);
}

const destUserSetup = path.join(RELEASE_SPECIES_SCOPE_DIR, 'Bird-Academy-Avian-ERP-SpeciesScope-Setup.exe');
const destUserPortable = path.join(RELEASE_SPECIES_SCOPE_DIR, 'Bird-Academy-User-SpeciesScope.exe');

fs.copyFileSync(userSetupSrc, destUserSetup);
fs.copyFileSync(userPortableSrc, destUserPortable);

// ----------------------------------------------------------------------
// 2. BUILD ADMIN BUNDLE
// ----------------------------------------------------------------------
console.log('\n[STEP 5/6] Compiling Web Admin bundle (outDir: dist / dist_admin)...');
execSync('npm run build:admin', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\nVerifying Admin Bundle integrity...');
execSync('node scripts/verifyAdminBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// Packaging Admin with electron-builder
console.log('\nPackaging Admin Windows binaries with electron-builder...');
if (fs.existsSync(ADMIN_BUILD_DIR)) {
  try {
    fs.rmSync(ADMIN_BUILD_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn('Warning removing admin build dir:', e.message);
  }
}

try {
  const currentPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  currentPkg.name = 'bird-academy-admin';
  fs.writeFileSync(pkgPath, JSON.stringify(currentPkg, null, 2), 'utf8');

  execSync('npx electron-builder --win --config electron-builder-admin.json', {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} finally {
  fs.writeFileSync(pkgPath, originalPkgContent, 'utf8');
}

// Locate Admin build outputs
const adminFiles = fs.readdirSync(ADMIN_BUILD_DIR);
let adminSetupSrc = null;
let adminPortableSrc = null;

for (const file of adminFiles) {
  const lower = file.toLowerCase();
  const fullPath = path.join(ADMIN_BUILD_DIR, file);
  if (file.endsWith('.exe') && fs.statSync(fullPath).isFile()) {
    if (lower.includes('setup') || lower.includes('installer')) {
      adminSetupSrc = fullPath;
    } else if (!adminPortableSrc) {
      adminPortableSrc = fullPath;
    }
  }
}

if (!adminSetupSrc || !adminPortableSrc) {
  console.error('❌ Error: Admin .exe outputs not found in release-admin/');
  process.exit(1);
}

const destAdminSetup = path.join(RELEASE_SPECIES_SCOPE_DIR, 'Bird-Academy-Admin-Center-SpeciesScope-Setup.exe');
const destAdminPortable = path.join(RELEASE_SPECIES_SCOPE_DIR, 'Bird-Academy-Admin-SpeciesScope.exe');

fs.copyFileSync(adminSetupSrc, destAdminSetup);
fs.copyFileSync(adminPortableSrc, destAdminPortable);

// ----------------------------------------------------------------------
// 3. GENERATE SHA256 SUMS & LOG SUMMARY
// ----------------------------------------------------------------------
console.log('\n[STEP 6/6] Computing SHA-256 Checksums and final validation...');

const hashUserSetup = calculateSHA256(destUserSetup);
const sizeUserSetupBytes = fs.statSync(destUserSetup).size;
const sizeUserSetupMB = (sizeUserSetupBytes / (1024 * 1024)).toFixed(2);

const hashUserPortable = calculateSHA256(destUserPortable);
const sizeUserPortableBytes = fs.statSync(destUserPortable).size;
const sizeUserPortableMB = (sizeUserPortableBytes / (1024 * 1024)).toFixed(2);

const userShaLines = [
  `${hashUserSetup}  Bird-Academy-Avian-ERP-SpeciesScope-Setup.exe (${sizeUserSetupMB} MB, ${sizeUserSetupBytes} bytes)`,
  `${hashUserPortable}  Bird-Academy-User-SpeciesScope.exe (${sizeUserPortableMB} MB, ${sizeUserPortableBytes} bytes)`
];

const userShaPath = path.join(RELEASE_SPECIES_SCOPE_DIR, 'SHA256SUMS-USER.txt');
fs.writeFileSync(userShaPath, userShaLines.join('\n') + '\n', 'utf8');

const hashAdminSetup = calculateSHA256(destAdminSetup);
const sizeAdminSetupBytes = fs.statSync(destAdminSetup).size;
const sizeAdminSetupMB = (sizeAdminSetupBytes / (1024 * 1024)).toFixed(2);

const hashAdminPortable = calculateSHA256(destAdminPortable);
const sizeAdminPortableBytes = fs.statSync(destAdminPortable).size;
const sizeAdminPortableMB = (sizeAdminPortableBytes / (1024 * 1024)).toFixed(2);

const adminShaLines = [
  `${hashAdminSetup}  Bird-Academy-Admin-Center-SpeciesScope-Setup.exe (${sizeAdminSetupMB} MB, ${sizeAdminSetupBytes} bytes)`,
  `${hashAdminPortable}  Bird-Academy-Admin-SpeciesScope.exe (${sizeAdminPortableMB} MB, ${sizeAdminPortableBytes} bytes)`
];

const adminShaPath = path.join(RELEASE_SPECIES_SCOPE_DIR, 'SHA256SUMS-ADMIN.txt');
fs.writeFileSync(adminShaPath, adminShaLines.join('\n') + '\n', 'utf8');

console.log('\n==================================================================');
console.log(' WINDOWS SPECIES-SCOPE PACKAGING COMPLETED SUCCESSFULLY           ');
console.log('==================================================================');
console.log(`Directory : ${RELEASE_SPECIES_SCOPE_DIR}`);
console.log('------------------------------------------------------------------');
console.log(`User Setup    : Bird-Academy-Avian-ERP-SpeciesScope-Setup.exe`);
console.log(`               Size: ${sizeUserSetupBytes} bytes (${sizeUserSetupMB} MB)`);
console.log(`               SHA256: ${hashUserSetup}`);
console.log(`User Portable : Bird-Academy-User-SpeciesScope.exe`);
console.log(`               Size: ${sizeUserPortableBytes} bytes (${sizeUserPortableMB} MB)`);
console.log(`               SHA256: ${hashUserPortable}`);
console.log('------------------------------------------------------------------');
console.log(`Admin Setup   : Bird-Academy-Admin-Center-SpeciesScope-Setup.exe`);
console.log(`               Size: ${sizeAdminSetupBytes} bytes (${sizeAdminSetupMB} MB)`);
console.log(`               SHA256: ${hashAdminSetup}`);
console.log(`Admin Portable: Bird-Academy-Admin-SpeciesScope.exe`);
console.log(`               Size: ${sizeAdminPortableBytes} bytes (${sizeAdminPortableMB} MB)`);
console.log(`               SHA256: ${hashAdminPortable}`);
console.log('==================================================================\n');

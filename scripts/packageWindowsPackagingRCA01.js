/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS PACKAGING RCA-01 RELEASE PIPELINE
 * Compiles, audits, and packages both User (Avian ERP) and Admin (Admin Center)
 * Windows binaries with corrected NSIS hooks and guaranteed anti-self-termination.
 * 
 * Target Directory  : Release/Windows-Packaging-RCA-01/
 * Protected Baseline: Release/Windows-RC3.1 (UNTOUCHED)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const RELEASE_DIR = path.join(ROOT_DIR, 'Release', 'Windows-Packaging-RCA-01');
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
console.log(' BIRD ACADEMY — WINDOWS PACKAGING RCA-01 DUAL PACKAGING PIPELINE  ');
console.log(' Target Directory  : Release/Windows-Packaging-RCA-01/            ');
console.log(' Protected Baseline: Release/Windows-RC3.1 (UNTOUCHED)           ');
console.log('==================================================================');

ensureDir(RELEASE_DIR);

// ----------------------------------------------------------------------
// 1. GENERATE BRAND ASSETS & ICONS
// ----------------------------------------------------------------------
console.log('\n[STEP 1/6] Generating official brand icons (.ico)...');
execSync('node scripts/generateBrandIcons.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 2. BUILD & AUDIT USER BUNDLE
// ----------------------------------------------------------------------
console.log('\n[STEP 2/6] Compiling Web User bundle (outDir: dist / dist_user)...');
execSync('npm run build:user', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[STEP 3/6] Verifying User Bundle integrity & zero administrative leaks...');
execSync('node scripts/verifyUserBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 3. PACKAGING ELECTRON USER
// ----------------------------------------------------------------------
console.log('\n[STEP 4/6] Packaging User Windows binaries with electron-builder...');
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
// 4. BUILD & AUDIT ADMIN BUNDLE
// ----------------------------------------------------------------------
console.log('\n[STEP 5/6] Compiling Web Admin bundle (outDir: dist_admin)...');
execSync('npm run build:admin', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[STEP 6/6] Verifying Admin Bundle integrity...');
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
// 5. DEPLOYMENT TO Release/Windows-Packaging-RCA-01/ & SHA-256 GENERATION
// ----------------------------------------------------------------------
console.log('\nDeploying binaries to Release/Windows-Packaging-RCA-01/ & generating SHA-256 sums...');

const finalUserSetup = path.join(RELEASE_DIR, 'Bird-Academy-Avian-ERP-RCA-01-Setup.exe');
const finalUserPortable = path.join(RELEASE_DIR, 'Bird-Academy-User-RCA-01.exe');
const finalAdminSetup = path.join(RELEASE_DIR, 'Bird-Academy-Admin-Center-RCA-01-Setup.exe');
const finalAdminPortable = path.join(RELEASE_DIR, 'Bird-Academy-Admin-RCA-01.exe');

// Scan and copy User binaries
if (fs.existsSync(USER_BUILD_DIR)) {
  const userFiles = fs.readdirSync(USER_BUILD_DIR);
  for (const file of userFiles) {
    const lower = file.toLowerCase();
    const fullPath = path.join(USER_BUILD_DIR, file);
    if (file.endsWith('.exe') && fs.statSync(fullPath).isFile()) {
      if (lower.includes('setup') || lower.includes('installer')) {
        fs.copyFileSync(fullPath, finalUserSetup);
      } else if (!fs.existsSync(finalUserPortable) || lower.includes('user') || lower.includes('erp') || lower.includes('enterprise')) {
        fs.copyFileSync(fullPath, finalUserPortable);
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
      } else if (!fs.existsSync(finalAdminPortable) || lower.includes('admin')) {
        fs.copyFileSync(fullPath, finalAdminPortable);
      }
    }
  }
}

// Compute checksums for User
const userShaLines = [];
if (fs.existsSync(finalUserSetup)) {
  const hash = calculateSHA256(finalUserSetup);
  const size = (fs.statSync(finalUserSetup).size / (1024 * 1024)).toFixed(2);
  userShaLines.push(`${hash}  Bird-Academy-Avian-ERP-RCA-01-Setup.exe (${size} MB)`);
  console.log(`  ✅ User Setup     : ${finalUserSetup} (${size} MB) -> SHA256: ${hash}`);
}
if (fs.existsSync(finalUserPortable)) {
  const hash = calculateSHA256(finalUserPortable);
  const size = (fs.statSync(finalUserPortable).size / (1024 * 1024)).toFixed(2);
  userShaLines.push(`${hash}  Bird-Academy-User-RCA-01.exe (${size} MB)`);
  console.log(`  ✅ User Portable  : ${finalUserPortable} (${size} MB) -> SHA256: ${hash}`);
}
fs.writeFileSync(path.join(RELEASE_DIR, 'SHA256SUMS-USER.txt'), userShaLines.join('\n') + '\n', 'utf8');

// Compute checksums for Admin
const adminShaLines = [];
if (fs.existsSync(finalAdminSetup)) {
  const hash = calculateSHA256(finalAdminSetup);
  const size = (fs.statSync(finalAdminSetup).size / (1024 * 1024)).toFixed(2);
  adminShaLines.push(`${hash}  Bird-Academy-Admin-Center-RCA-01-Setup.exe (${size} MB)`);
  console.log(`  ✅ Admin Setup    : ${finalAdminSetup} (${size} MB) -> SHA256: ${hash}`);
}
if (fs.existsSync(finalAdminPortable)) {
  const hash = calculateSHA256(finalAdminPortable);
  const size = (fs.statSync(finalAdminPortable).size / (1024 * 1024)).toFixed(2);
  adminShaLines.push(`${hash}  Bird-Academy-Admin-RCA-01.exe (${size} MB)`);
  console.log(`  ✅ Admin Portable : ${finalAdminPortable} (${size} MB) -> SHA256: ${hash}`);
}
fs.writeFileSync(path.join(RELEASE_DIR, 'SHA256SUMS-ADMIN.txt'), adminShaLines.join('\n') + '\n', 'utf8');

console.log('\n==================================================================');
console.log(' WINDOWS PACKAGING RCA-01 RELEASE COMPLETED SUCCESSFULLY!         ');
console.log(` Output Directory : ${RELEASE_DIR}`);
console.log('==================================================================\n');

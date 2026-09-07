/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS RELEASE BUILD PIPELINE
 * Synchronizes and packages Bird Academy User (v1.2.3-OFFLINE-BETA-QR) and Admin (v1.2.3)
 * into standalone Windows installers with SHA-256 integrity verification.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const RELEASE_WIN_DIR = path.join(ROOT_DIR, 'Release', 'Beta', 'Windows');
const USER_RELEASE_DIR = path.join(RELEASE_WIN_DIR, 'User');
const ADMIN_RELEASE_DIR = path.join(RELEASE_WIN_DIR, 'Admin');

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

console.log('================================================================');
console.log(' BIRD ACADEMY ENTERPRISE — PIPELINE DE COMPILATION WINDOWS ');
console.log('================================================================');

ensureDir(USER_RELEASE_DIR);
ensureDir(ADMIN_RELEASE_DIR);

// ----------------------------------------------------------------------
// 1. BUILD BIRD ACADEMY USER
// ----------------------------------------------------------------------
console.log('\n[1/4] Compilation Web Utilisateur (Bird Academy User v1.2.3-OFFLINE-BETA-QR)...');
execSync('npm run build:user', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[2/4] Verification Sécurité & Isolation du Bundle Utilisateur...');
execSync('npm run verify:user-bundle', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[3/4] Empaquetage Executable Windows Utilisateur avec electron-builder...');
const userTempReleaseDir = path.join(ROOT_DIR, 'release-user-temp');
if (fs.existsSync(userTempReleaseDir)) {
  fs.rmSync(userTempReleaseDir, { recursive: true, force: true });
}

try {
  execSync(`npx electron-builder --win nsis msi --config.directories.output="${userTempReleaseDir}" --config.productName="Bird Academy"`, {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} catch (err) {
  console.warn('⚠️ electron-builder warning (falling back to nsis target):', err.message);
  execSync(`npx electron-builder --win nsis --config.directories.output="${userTempReleaseDir}" --config.productName="Bird Academy"`, {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
}

// Copy produced executables to Release/Beta/Windows/User/
console.log('\n[Packaging User] Deplacement des installateurs vers Release/Beta/Windows/User/...');
const userFiles = fs.readdirSync(userTempReleaseDir);
const userHashes = [];

for (const file of userFiles) {
  const fullPath = path.join(userTempReleaseDir, file);
  const stat = fs.statSync(fullPath);
  
  if (stat.isFile()) {
    if (file.endsWith('.exe')) {
      const destName = 'Bird-Academy-User-v1.2.3-OFFLINE-BETA-QR.exe';
      const destPath = path.join(USER_RELEASE_DIR, destName);
      fs.copyFileSync(fullPath, destPath);
      const hash = calculateSHA256(destPath);
      const sizeMB = (fs.statSync(destPath).size / (1024 * 1024)).toFixed(2);
      userHashes.push(`${hash}  ${destName} (${sizeMB} MB)`);
      console.log(`  ✅ ${destName} -> SHA256: ${hash} (${sizeMB} MB)`);
    } else if (file.endsWith('.msi')) {
      const destName = 'Bird-Academy-User-v1.2.3-OFFLINE-BETA-QR.msi';
      const destPath = path.join(USER_RELEASE_DIR, destName);
      fs.copyFileSync(fullPath, destPath);
      const hash = calculateSHA256(destPath);
      const sizeMB = (fs.statSync(destPath).size / (1024 * 1024)).toFixed(2);
      userHashes.push(`${hash}  ${destName} (${sizeMB} MB)`);
      console.log(`  ✅ ${destName} -> SHA256: ${hash} (${sizeMB} MB)`);
    }
  }
}

fs.writeFileSync(path.join(USER_RELEASE_DIR, 'SHA256SUMS.txt'), userHashes.join('\n') + '\n', 'utf8');

// ----------------------------------------------------------------------
// 2. BUILD BIRD ACADEMY ADMIN
// ----------------------------------------------------------------------
console.log('\n[4/4] Compilation Web Admin (Bird Academy Admin v1.2.3)...');
execSync('npm run build:admin', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n[Empaquetage Admin] Empaquetage Executable Windows Admin avec electron-builder...');
const adminTempReleaseDir = path.join(ROOT_DIR, 'release-admin-temp');
if (fs.existsSync(adminTempReleaseDir)) {
  fs.rmSync(adminTempReleaseDir, { recursive: true, force: true });
}

try {
  execSync(`npx electron-builder --win nsis msi --config.directories.output="${adminTempReleaseDir}" --config.productName="Bird Academy Admin"`, {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} catch (err) {
  console.warn('⚠️ electron-builder warning (falling back to nsis target):', err.message);
  execSync(`npx electron-builder --win nsis --config.directories.output="${adminTempReleaseDir}" --config.productName="Bird Academy Admin"`, {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
}

// Copy produced executables to Release/Beta/Windows/Admin/
console.log('\n[Packaging Admin] Deplacement des installateurs vers Release/Beta/Windows/Admin/...');
const adminFiles = fs.readdirSync(adminTempReleaseDir);
const adminHashes = [];

for (const file of adminFiles) {
  const fullPath = path.join(adminTempReleaseDir, file);
  const stat = fs.statSync(fullPath);
  
  if (stat.isFile()) {
    if (file.endsWith('.exe')) {
      const destName = 'Bird-Academy-Admin-v1.2.3.exe';
      const destPath = path.join(ADMIN_RELEASE_DIR, destName);
      fs.copyFileSync(fullPath, destPath);
      const hash = calculateSHA256(destPath);
      const sizeMB = (fs.statSync(destPath).size / (1024 * 1024)).toFixed(2);
      adminHashes.push(`${hash}  ${destName} (${sizeMB} MB)`);
      console.log(`  ✅ ${destName} -> SHA256: ${hash} (${sizeMB} MB)`);
    } else if (file.endsWith('.msi')) {
      const destName = 'Bird-Academy-Admin-v1.2.3.msi';
      const destPath = path.join(ADMIN_RELEASE_DIR, destName);
      fs.copyFileSync(fullPath, destPath);
      const hash = calculateSHA256(destPath);
      const sizeMB = (fs.statSync(destPath).size / (1024 * 1024)).toFixed(2);
      adminHashes.push(`${hash}  ${destName} (${sizeMB} MB)`);
      console.log(`  ✅ ${destName} -> SHA256: ${hash} (${sizeMB} MB)`);
    }
  }
}

fs.writeFileSync(path.join(ADMIN_RELEASE_DIR, 'SHA256SUMS.txt'), adminHashes.join('\n') + '\n', 'utf8');

console.log('\n================================================================');
console.log(' PIPELINE DE COMPILATION WINDOWS RÉUSSI ET FINALISÉ ! ');
console.log('================================================================');

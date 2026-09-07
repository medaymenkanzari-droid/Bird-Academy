/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE ADMIN — WINDOWS RELEASE PACKAGING PIPELINE
 * Compiles, verifies, and packages the Windows Administrator version into
 * standalone NSIS installer and portable executables with SHA-256 integrity verification.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const RELEASE_ADMIN_DIR = path.join(ROOT_DIR, 'Release', 'Windows-Admin');
const OUTPUT_BUILD_DIR = path.join(ROOT_DIR, 'release-admin');

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
console.log(' BIRD ACADEMY ENTERPRISE ADMIN — PIPELINE DE PACKAGING WINDOWS    ');
console.log('==================================================================');

ensureDir(RELEASE_ADMIN_DIR);

// ----------------------------------------------------------------------
// 1. BUILD BIRD ACADEMY ADMIN BUNDLE
// ----------------------------------------------------------------------
console.log('\n[1/4] Compilation Web Admin (Vite outDir: dist_admin)...');
execSync('npm run build:admin', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 2. VERIFY ADMIN BUNDLE INTEGRITY
// ----------------------------------------------------------------------
console.log('\n[2/4] Verification & Audit du Bundle Admin...');
execSync('node scripts/verifyAdminBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 3. PACKAGING ELECTRON BUILDER ADMIN
// ----------------------------------------------------------------------
console.log('\n[3/4] Empaquetage Executables Windows Admin avec electron-builder...');
if (fs.existsSync(OUTPUT_BUILD_DIR)) {
  try {
    fs.rmSync(OUTPUT_BUILD_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn('Warning removing output build dir:', e.message);
  }
}

// Sync dist_admin explicitly into dist
fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
fs.cpSync(path.join(ROOT_DIR, 'dist_admin'), path.join(ROOT_DIR, 'dist'), { recursive: true });

// Ensure package.json name is set to bird-academy-admin so electron-builder uses %LOCALAPPDATA%\Programs\bird-academy-admin
const pkgPath = path.join(ROOT_DIR, 'package.json');
const originalPkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkgObj = JSON.parse(originalPkgContent);
pkgObj.name = 'bird-academy-admin';
fs.writeFileSync(pkgPath, JSON.stringify(pkgObj, null, 2), 'utf8');

try {
  execSync('npx electron-builder --win --config electron-builder-admin.json', {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} catch (err) {
  console.error('❌ Error during electron-builder execution:', err.message);
  process.exit(1);
} finally {
  fs.writeFileSync(pkgPath, originalPkgContent, 'utf8');
  // Always restore dist_user into dist for default local dev & testing
  if (fs.existsSync(path.join(ROOT_DIR, 'dist_user'))) {
    fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
    fs.cpSync(path.join(ROOT_DIR, 'dist_user'), path.join(ROOT_DIR, 'dist'), { recursive: true });
  }
}

// ----------------------------------------------------------------------
// 4. DEPLOYMENT TO Release/Windows-Admin/ & SHA-256 GENERATION
// ----------------------------------------------------------------------
console.log('\n[4/4] Finalisation des binaires et calcul des empreintes SHA-256...');

const files = fs.readdirSync(OUTPUT_BUILD_DIR);
let setupSource = null;
let portableSource = null;

for (const file of files) {
  const lower = file.toLowerCase();
  const fullPath = path.join(OUTPUT_BUILD_DIR, file);
  if (file.endsWith('.exe') && fs.statSync(fullPath).isFile()) {
    if (lower.includes('setup') || lower.includes('installer')) {
      setupSource = fullPath;
    } else if (!portableSource) {
      portableSource = fullPath;
    }
  }
}

if (!setupSource && !portableSource) {
  console.error('❌ Error: No .exe outputs found in release-admin/');
  process.exit(1);
}

const finalSetup = path.join(RELEASE_ADMIN_DIR, 'Bird-Academy-Enterprise-Admin-Setup.exe');
const finalPortable = path.join(RELEASE_ADMIN_DIR, 'Bird-Academy-Enterprise-Admin.exe');
const aliasSetup = path.join(RELEASE_ADMIN_DIR, 'Bird-Academy-Admin-Windows-Setup.exe');
const aliasPortable = path.join(RELEASE_ADMIN_DIR, 'Bird-Academy-Admin-Windows.exe');

const rootReleaseDir = path.join(ROOT_DIR, 'release');
ensureDir(rootReleaseDir);
const releaseSetup = path.join(rootReleaseDir, 'Bird-Academy-Admin-Center-Setup.exe');
const releasePortable = path.join(rootReleaseDir, 'Bird-Academy-Admin.exe');

if (setupSource) {
  fs.copyFileSync(setupSource, finalSetup);
  fs.copyFileSync(setupSource, aliasSetup);
  fs.copyFileSync(setupSource, releaseSetup);
}
if (portableSource) {
  fs.copyFileSync(portableSource, finalPortable);
  fs.copyFileSync(portableSource, aliasPortable);
  fs.copyFileSync(portableSource, releasePortable);
}

const shaLines = [];

if (fs.existsSync(finalSetup)) {
  const hashSetup = calculateSHA256(finalSetup);
  const sizeSetup = (fs.statSync(finalSetup).size / (1024 * 1024)).toFixed(2);
  shaLines.push(`${hashSetup}  Bird-Academy-Admin-Center-Setup.exe (${sizeSetup} MB)`);
  shaLines.push(`${hashSetup}  Bird-Academy-Enterprise-Admin-Setup.exe (${sizeSetup} MB)`);
  shaLines.push(`${hashSetup}  Bird-Academy-Admin-Windows-Setup.exe (${sizeSetup} MB)`);
  console.log(`  ✅ Setup    : ${releaseSetup} (${sizeSetup} MB) -> SHA256: ${hashSetup}`);
}

if (fs.existsSync(finalPortable)) {
  const hashPortable = calculateSHA256(finalPortable);
  const sizePortable = (fs.statSync(finalPortable).size / (1024 * 1024)).toFixed(2);
  shaLines.push(`${hashPortable}  Bird-Academy-Admin.exe (${sizePortable} MB)`);
  shaLines.push(`${hashPortable}  Bird-Academy-Enterprise-Admin.exe (${sizePortable} MB)`);
  shaLines.push(`${hashPortable}  Bird-Academy-Admin-Windows.exe (${sizePortable} MB)`);
  console.log(`  ✅ Portable : ${releasePortable} (${sizePortable} MB) -> SHA256: ${hashPortable}`);
}

const shaFilePath = path.join(RELEASE_ADMIN_DIR, 'SHA256SUMS.txt');
fs.writeFileSync(shaFilePath, shaLines.join('\n') + '\n', 'utf8');

const rootShaFilePath = path.join(rootReleaseDir, 'SHA256SUMS-ADMIN.txt');
fs.writeFileSync(rootShaFilePath, shaLines.join('\n') + '\n', 'utf8');

console.log('\n==================================================================');
console.log(' RELEASE WINDOWS ADMINISTRATEUR GÉNÉRÉE AVEC SUCCÈS !             ');
console.log('==================================================================');
console.log(`Répertoire de sortie : ${RELEASE_ADMIN_DIR}`);
console.log(`Fichier d'empreintes : ${shaFilePath}`);
console.log('==================================================================\n');

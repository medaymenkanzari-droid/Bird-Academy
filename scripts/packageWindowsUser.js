/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE USER — WINDOWS RELEASE PACKAGING PIPELINE
 * Compiles, verifies, and packages the Windows Breeder version into
 * standalone NSIS installer and portable executables with SHA-256 integrity verification.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();
const RELEASE_DIR = path.join(ROOT_DIR, 'release');
const OUTPUT_BUILD_DIR = path.join(ROOT_DIR, 'release-user');

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
console.log(' BIRD ACADEMY USER (AVIAN ERP) — PIPELINE DE PACKAGING WINDOWS    ');
console.log('==================================================================');

ensureDir(RELEASE_DIR);

// ----------------------------------------------------------------------
// 0. GENERATE BRAND ASSETS & ICONS
// ----------------------------------------------------------------------
console.log('\n[1/4] Génération des icônes officielles (.ico)...');
execSync('node scripts/generateBrandIcons.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 1. BUILD BIRD ACADEMY USER BUNDLE
// ----------------------------------------------------------------------
console.log('\n[2/4] Compilation Web Utilisateur (Vite outDir: dist)...');
execSync('npm run build:user', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 2. VERIFY USER BUNDLE INTEGRITY
// ----------------------------------------------------------------------
console.log('\n[3/4] Vérification & Audit d\'isolation du Bundle Utilisateur...');
execSync('node scripts/verifyUserBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------------------------
// 3. PACKAGING ELECTRON BUILDER USER
// ----------------------------------------------------------------------
console.log('\n[4/4] Empaquetage Exécutables Windows User avec electron-builder...');
if (fs.existsSync(OUTPUT_BUILD_DIR)) {
  try {
    fs.rmSync(OUTPUT_BUILD_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn('Warning removing output build dir:', e.message);
  }
}

// Sync dist_user explicitly into dist
fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
fs.cpSync(path.join(ROOT_DIR, 'dist_user'), path.join(ROOT_DIR, 'dist'), { recursive: true });

// Ensure package.json name is set to bird-academy-user so electron-builder uses %LOCALAPPDATA%\Programs\bird-academy-user
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
  console.error('❌ Error during electron-builder execution:', err.message);
  process.exit(1);
} finally {
  fs.writeFileSync(pkgPath, originalPkgContent, 'utf8');
}

// ----------------------------------------------------------------------
// 4. DEPLOYMENT TO release/ & SHA-256 GENERATION
// ----------------------------------------------------------------------
console.log('\nFinalisation des binaires et calcul des empreintes SHA-256...');

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

const finalSetup = path.join(RELEASE_DIR, 'Bird-Academy-Avian-ERP-Setup.exe');
const finalPortable = path.join(RELEASE_DIR, 'Bird-Academy-User.exe');

if (setupSource) {
  fs.copyFileSync(setupSource, finalSetup);
}
if (portableSource) {
  fs.copyFileSync(portableSource, finalPortable);
}

const shaLines = [];

if (fs.existsSync(finalSetup)) {
  const hashSetup = calculateSHA256(finalSetup);
  const sizeSetup = (fs.statSync(finalSetup).size / (1024 * 1024)).toFixed(2);
  shaLines.push(`${hashSetup}  Bird-Academy-Avian-ERP-Setup.exe (${sizeSetup} MB)`);
  console.log(`  ✅ Setup / Installer : ${finalSetup} (${sizeSetup} MB) -> SHA256: ${hashSetup}`);
}

if (fs.existsSync(finalPortable)) {
  const hashPortable = calculateSHA256(finalPortable);
  const sizePortable = (fs.statSync(finalPortable).size / (1024 * 1024)).toFixed(2);
  shaLines.push(`${hashPortable}  Bird-Academy-User.exe (${sizePortable} MB)`);
  console.log(`  ✅ Portable .exe     : ${finalPortable} (${sizePortable} MB) -> SHA256: ${hashPortable}`);
}

const shaFilePath = path.join(RELEASE_DIR, 'SHA256SUMS-USER.txt');
fs.writeFileSync(shaFilePath, shaLines.join('\n') + '\n', 'utf8');

console.log('\n==================================================================');
console.log(' RELEASE WINDOWS UTILISATEUR GÉNÉRÉE AVEC SUCCÈS !                ');
console.log('==================================================================');
console.log(`Répertoire de sortie : ${RELEASE_DIR}`);
console.log('==================================================================\n');

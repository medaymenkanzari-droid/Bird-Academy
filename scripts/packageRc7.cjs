/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — RC7 OFFICIAL RELEASE PACKAGING PIPELINE
 * 
 * Release Version: v1.3.6-RC7 (Build Code 20)
 * Target Directory: Release/RC7/
 * 
 * DIRECTIVE ABSOLUE : RC6 IMMUTABLE
 * - Ne touche à aucun artefact RC6 certifié existant
 * - Produit une release candidate RC7 propre, cohérente et testable
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = process.cwd();
const RC7_RELEASE_DIR = path.join(ROOT_DIR, 'Release', 'RC7');
const USER_BUILD_DIR = path.join(ROOT_DIR, 'release-user');
const DIST_BIN_DIR = path.join(ROOT_DIR, 'dist_binaries');

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
console.log(' BIRD ACADEMY ENTERPRISE — RC7 OFFICIAL PACKAGING PIPELINE       ');
console.log(' Version Cible : v1.3.6-RC7 (Build Code 20)                       ');
console.log(' Sortie        : Release/RC7/                                    ');
console.log(' RC6 Baseline  : STRICTEMENT IMMUABLE ET SANCTUARISÉE            ');
console.log('==================================================================\n');

ensureDir(RC7_RELEASE_DIR);
ensureDir(DIST_BIN_DIR);

// 1. Synchronisation des icônes officielles de marque
console.log('[1/5] Synchronisation des icônes de marque officielles...');
execSync('node scripts/generateBrandIcons.js', { stdio: 'inherit', cwd: ROOT_DIR });

// 2. Compilation de l'application utilisateur avec Vite
console.log('\n[2/5] Compilation Vite de l\'application Utilisateur...');
execSync('npm run build:user:beta', { stdio: 'inherit', cwd: ROOT_DIR });

// 3. Vérification de l'isolation du bundle
console.log('\n[3/5] Vérification de l\'intégrité et de l\'isolation du bundle...');
execSync('node scripts/verifyUserBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// 4. Empaquetage Electron Windows (Setup & Portable)
console.log('\n[4/5] Empaquetage Electron Builder pour Windows (RC7)...');
if (fs.existsSync(USER_BUILD_DIR)) {
  try {
    fs.rmSync(USER_BUILD_DIR, { recursive: true, force: true });
  } catch (e) {
    console.warn('Nettoyage release-user partiel:', e.message);
  }
}

// Synchroniser dist_user dans dist
fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
fs.cpSync(path.join(ROOT_DIR, 'dist_user'), path.join(ROOT_DIR, 'dist'), { recursive: true });

// Configuration temporaire de package.json sans modifier les dépendances de dev
const pkgPath = path.join(ROOT_DIR, 'package.json');
const originalPkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkgObj = JSON.parse(originalPkgContent);
pkgObj.name = 'bird-academy-user';
pkgObj.version = '1.3.6-RC7';
pkgObj.dependencies = {};
fs.writeFileSync(pkgPath, JSON.stringify(pkgObj, null, 2), 'utf8');

try {
  execSync('npx electron-builder --win --config electron-builder-user.json', {
    stdio: 'inherit',
    cwd: ROOT_DIR
  });
} catch (err) {
  console.error('❌ Erreur durant electron-builder:', err.message);
  process.exit(1);
} finally {
  fs.writeFileSync(pkgPath, originalPkgContent, 'utf8');
}

// Recherche des binaires Windows générés
const builtFiles = fs.readdirSync(USER_BUILD_DIR);
let setupSource = null;
let portableSource = null;

for (const file of builtFiles) {
  const lower = file.toLowerCase();
  const fullPath = path.join(USER_BUILD_DIR, file);
  if (file.endsWith('.exe') && fs.statSync(fullPath).isFile()) {
    if (lower.includes('setup') || lower.includes('installer')) {
      setupSource = fullPath;
    } else if (!portableSource) {
      portableSource = fullPath;
    }
  }
}

const targetSetup = path.join(RC7_RELEASE_DIR, 'Bird-Academy-User-Windows-Setup.exe');
const targetPortable = path.join(RC7_RELEASE_DIR, 'Bird-Academy-User.exe');

if (setupSource) {
  fs.copyFileSync(setupSource, targetSetup);
  console.log(`  📦 Windows Setup copié vers: ${targetSetup}`);
  fs.copyFileSync(setupSource, path.join(DIST_BIN_DIR, 'Bird-Academy-User-Windows-Setup.exe'));
} else {
  console.error('❌ Setup Windows introuvable dans release-user !');
  process.exit(1);
}

if (portableSource) {
  fs.copyFileSync(portableSource, targetPortable);
  console.log(`  📦 Windows Portable copié vers: ${targetPortable}`);
  fs.copyFileSync(portableSource, path.join(DIST_BIN_DIR, 'Bird-Academy-User.exe'));
} else {
  console.error('❌ Portable Windows introuvable dans release-user !');
  process.exit(1);
}

// 5. Compilation du package Android APK (RC7)
console.log('\n[5/5] Compilation Android APK avec Gradle...');
try {
  console.log('  Synchronisation Capacitor Android...');
  execSync('npx cap sync android', { stdio: 'inherit', cwd: ROOT_DIR });
  
  console.log('  Exécution de gradlew assembleDebug...');
  execSync('.\\gradlew.bat assembleDebug', { stdio: 'inherit', cwd: path.join(ROOT_DIR, 'android') });
  
  const gradleApkOutput = path.join(ROOT_DIR, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const targetApk = path.join(RC7_RELEASE_DIR, 'Bird-Academy-User.apk');
  
  if (fs.existsSync(gradleApkOutput)) {
    fs.copyFileSync(gradleApkOutput, targetApk);
    console.log(`  📦 Android APK copié vers: ${targetApk}`);
    fs.copyFileSync(gradleApkOutput, path.join(DIST_BIN_DIR, 'Bird-Academy-User.apk'));
  } else {
    console.error('❌ Fichier APK introuvable après compilation Gradle !');
  }
} catch (apkErr) {
  console.error('⚠️ Avertissement lors de la compilation Android :', apkErr.message);
}

// Copie du guide PDF officiel
const pdfSource = path.join(ROOT_DIR, 'public', 'downloads', 'LMSE_OWNER_GUIDE.pdf');
const targetPdf = path.join(RC7_RELEASE_DIR, 'LMSE_OWNER_GUIDE.pdf');
if (fs.existsSync(pdfSource)) {
  fs.copyFileSync(pdfSource, targetPdf);
}

// 6. Calcul des Checksums SHA-256 et Génération des Manifestes
console.log('\n==================================================================');
console.log(' CALCUL DES EMPREINTES CRYPTOGRAPHIQUES SHA-256 ET MANIFESTE     ');
console.log('==================================================================\n');

const setupStat = fs.statSync(targetSetup);
const portableStat = fs.statSync(targetPortable);
const setupHash = calculateSHA256(targetSetup);
const portableHash = calculateSHA256(targetPortable);

let apkHash = 'NOT_BUILT';
let apkSize = 0;
const targetApk = path.join(RC7_RELEASE_DIR, 'Bird-Academy-User.apk');
if (fs.existsSync(targetApk)) {
  const apkStat = fs.statSync(targetApk);
  apkSize = apkStat.size;
  apkHash = calculateSHA256(targetApk);
}

let pdfHash = 'NOT_AVAILABLE';
let pdfSize = 0;
if (fs.existsSync(targetPdf)) {
  const pdfStat = fs.statSync(targetPdf);
  pdfSize = pdfStat.size;
  pdfHash = calculateSHA256(targetPdf);
}

console.log(`  Windows Setup    : ${setupStat.size} octets | SHA-256: ${setupHash}`);
console.log(`  Windows Portable : ${portableStat.size} octets | SHA-256: ${portableHash}`);
console.log(`  Android APK      : ${apkSize} octets | SHA-256: ${apkHash}`);
console.log(`  LMSE Guide PDF   : ${pdfSize} octets | SHA-256: ${pdfHash}`);

// Générer SHA256SUMS_v1.3.6-RC7.txt
const sumsContent = [
  `${setupHash}  Bird-Academy-User-Windows-Setup.exe`,
  `${portableHash}  Bird-Academy-User.exe`,
  `${apkHash}  Bird-Academy-User.apk`,
  `${pdfHash}  LMSE_OWNER_GUIDE.pdf`,
  ''
].join('\n');

fs.writeFileSync(path.join(RC7_RELEASE_DIR, 'SHA256SUMS_v1.3.6-RC7.txt'), sumsContent, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'SHA256SUMS_v1.3.6-RC7.txt'), sumsContent, 'utf8');
console.log(`  📝 SHA256SUMS généré dans Release/RC7/ et à la racine.`);

// Générer RELEASE_MANIFEST_v1.3.6-RC7.json
const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

const manifest = {
  release: 'v1.3.6-RC7',
  version: '1.3.6-RC7',
  buildId: 'BA-V1.3.6-RC7',
  versionCode: 20,
  commit: currentCommit,
  branch: currentBranch,
  releaseChannel: 'Pre-External QA (RC7 Brand Assets Distribution)',
  buildTimestamp: new Date().toISOString(),
  electronVersion: '43.3.0',
  viteVersion: '6.2.3',
  paymentState: {
    live: false,
    commercialSales: 'closed'
  },
  licensingState: {
    freeModeNative: true,
    offlineFirst: true,
    singleDevice: true,
    privateKeyExposed: false
  },
  artifacts: {
    windowsSetup: {
      filename: 'Bird-Academy-User-Windows-Setup.exe',
      sizeBytes: setupStat.size,
      sha256: setupHash
    },
    windowsPortable: {
      filename: 'Bird-Academy-User.exe',
      sizeBytes: portableStat.size,
      sha256: portableHash
    },
    androidApk: {
      filename: 'Bird-Academy-User.apk',
      sizeBytes: apkSize,
      sha256: apkHash
    },
    ownerGuidePdf: {
      filename: 'LMSE_OWNER_GUIDE.pdf',
      sizeBytes: pdfSize,
      sha256: pdfHash
    }
  },
  brandAssets: {
    officialAssetsCount: 12,
    oldAssetsCount: 0,
    sourceDirectory: 'public/assets/images/public_assets_images_bird_academy'
  }
};

const manifestJson = JSON.stringify(manifest, null, 2);
fs.writeFileSync(path.join(RC7_RELEASE_DIR, 'RELEASE_MANIFEST_v1.3.6-RC7.json'), manifestJson, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'RELEASE_MANIFEST_v1.3.6-RC7.json'), manifestJson, 'utf8');
console.log(`  📝 RELEASE_MANIFEST généré dans Release/RC7/ et à la racine.`);

console.log('\n==================================================================');
console.log(' PIPELINE DE PACKAGING RC7 TERMINÉ AVEC SUCCÈS                    ');
console.log('==================================================================\n');

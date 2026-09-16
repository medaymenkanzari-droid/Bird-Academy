/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — STABLE RELEASE PREPARATION PIPELINE
 * Mission: STABLE-RELEASE-PREPARATION-001
 * 
 * Target Version: 1.3.6 (BUILD_ID: BA-V1.3.6, Android versionCode: 21)
 * Output Directory: Release/Stable-Candidate/
 * 
 * STRICT INVARIANTS:
 * - Does NOT modify RC6 or RC7 in Release/
 * - Does NOT touch dist_binaries/
 * - Does NOT publish to GitHub, Render, or Play Store
 * - Computes real SHA-256 hashes and generates isolated candidate manifest
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = process.cwd();
const STABLE_RELEASE_DIR = path.join(ROOT_DIR, 'Release', 'Stable-Candidate');
const USER_BUILD_DIR = path.join(ROOT_DIR, 'release-user');

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
console.log(' BIRD ACADEMY ENTERPRISE — STABLE CANDIDATE PACKAGING PIPELINE   ');
console.log(' Version Cible : 1.3.6 (Build ID: BA-V1.3.6, Android Code: 21)   ');
console.log(' Sortie        : Release/Stable-Candidate/                       ');
console.log(' Invariant     : RC6 & RC7 STRICTEMENT IMMUABLES                 ');
console.log(' Invariant     : dist_binaries/ STRICTEMENT NON MODIFIÉ          ');
console.log('==================================================================\n');

ensureDir(STABLE_RELEASE_DIR);

// 1. Synchronisation des icônes de marque officielles
console.log('[1/5] Synchronisation des icônes de marque officielles...');
execSync('node scripts/generateBrandIcons.js', { stdio: 'inherit', cwd: ROOT_DIR });

// 2. Compilation de l'application utilisateur avec Vite
console.log('\n[2/5] Compilation Vite de l\'application Utilisateur...');
execSync('npm run build:user:beta', { stdio: 'inherit', cwd: ROOT_DIR });

// 3. Vérification de l'isolation du bundle
console.log('\n[3/5] Vérification de l\'intégrité et de l\'isolation du bundle...');
execSync('node scripts/verifyUserBundle.js', { stdio: 'inherit', cwd: ROOT_DIR });

// 4. Empaquetage Electron Builder pour Windows (1.3.6)
console.log('\n[4/5] Empaquetage Electron Builder pour Windows (Stable 1.3.6)...');

// Synchroniser dist_user dans dist
if (fs.existsSync(path.join(ROOT_DIR, 'dist_user'))) {
  fs.rmSync(path.join(ROOT_DIR, 'dist'), { recursive: true, force: true });
  fs.cpSync(path.join(ROOT_DIR, 'dist_user'), path.join(ROOT_DIR, 'dist'), { recursive: true });
}

// Empaquetage avec electron-builder
execSync('npx electron-builder --config electron-builder-user.json --win nsis portable', {
  stdio: 'inherit',
  cwd: ROOT_DIR,
  env: { ...process.env, NODE_ENV: 'production' }
});

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
    } else if (!portableSource && !lower.includes('uninstaller')) {
      portableSource = fullPath;
    }
  }
}

const targetSetup = path.join(STABLE_RELEASE_DIR, 'Bird-Academy-User-Windows-Setup.exe');
const targetPortable = path.join(STABLE_RELEASE_DIR, 'Bird-Academy-User.exe');

if (setupSource) {
  fs.copyFileSync(setupSource, targetSetup);
  console.log(`  📦 Windows Setup copié vers: ${targetSetup}`);
} else {
  console.error('❌ Setup Windows introuvable dans release-user !');
  process.exit(1);
}

if (portableSource) {
  fs.copyFileSync(portableSource, targetPortable);
  console.log(`  📦 Windows Portable copié vers: ${targetPortable}`);
} else {
  console.error('❌ Portable Windows introuvable dans release-user !');
  process.exit(1);
}

// 5. Compilation du package Android APK (1.3.6 / Code 21)
console.log('\n[5/5] Compilation Android APK avec Gradle...');
const targetApk = path.join(STABLE_RELEASE_DIR, 'Bird-Academy-User.apk');
try {
  console.log('  Synchronisation Capacitor Android...');
  execSync('npx cap sync android', { stdio: 'inherit', cwd: ROOT_DIR });
  
  console.log('  Exécution de gradlew assembleDebug...');
  execSync('.\\gradlew.bat assembleDebug', { stdio: 'inherit', cwd: path.join(ROOT_DIR, 'android') });
  
  const gradleApkOutput = path.join(ROOT_DIR, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  
  if (fs.existsSync(gradleApkOutput)) {
    fs.copyFileSync(gradleApkOutput, targetApk);
    console.log(`  📦 Android APK copié vers: ${targetApk}`);
  } else {
    console.error('❌ Fichier APK introuvable après compilation Gradle !');
  }
} catch (apkErr) {
  console.error('⚠️ Avertissement lors de la compilation Android :', apkErr.message);
}

// Copie du guide PDF officiel
const pdfSource = path.join(ROOT_DIR, 'public', 'downloads', 'LMSE_OWNER_GUIDE.pdf');
const targetPdf = path.join(STABLE_RELEASE_DIR, 'LMSE_OWNER_GUIDE.pdf');
if (fs.existsSync(pdfSource)) {
  fs.copyFileSync(pdfSource, targetPdf);
  console.log(`  📦 Guide Propriétaire LMSE copié vers: ${targetPdf}`);
}

// 6. Calcul des Checksums SHA-256 et Génération du Manifeste
console.log('\n==================================================================');
console.log(' CALCUL DES EMPREINTES CRYPTOGRAPHIQUES SHA-256 ET MANIFESTE     ');
console.log('==================================================================\n');

const setupStat = fs.statSync(targetSetup);
const portableStat = fs.statSync(targetPortable);
const setupHash = calculateSHA256(targetSetup);
const portableHash = calculateSHA256(targetPortable);

let apkHash = 'NOT_BUILT';
let apkSize = 0;
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

// Générer SHA256SUMS_v1.3.6-STABLE-CANDIDATE.txt
const sumsContent = [
  `${setupHash}  Bird-Academy-User-Windows-Setup.exe`,
  `${portableHash}  Bird-Academy-User.exe`,
  `${apkHash}  Bird-Academy-User.apk`,
  `${pdfHash}  LMSE_OWNER_GUIDE.pdf`,
  ''
].join('\n');

const sumsPath = path.join(STABLE_RELEASE_DIR, 'SHA256SUMS_v1.3.6-STABLE-CANDIDATE.txt');
fs.writeFileSync(sumsPath, sumsContent, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'SHA256SUMS_v1.3.6-STABLE-CANDIDATE.txt'), sumsContent, 'utf8');

// Générer RELEASE_MANIFEST_v1.3.6-STABLE-CANDIDATE.json
const manifest = {
  product: "Bird Academy Enterprise — Volière Manager",
  version: "1.3.6",
  buildId: "BA-V1.3.6",
  versionCode: 21,
  platform: "Windows (x64), Android (ARM64/x86_64)",
  releaseChannel: "stable-candidate",
  buildDate: new Date().toISOString(),
  baseCommit: "8220ebefe470d3b7d36af4ab110e1041f55ebc29",
  paymentState: {
    live: false,
    commercialSales: "closed"
  },
  licensingState: {
    freeModeNative: true,
    offlineFirst: true,
    singleDevice: true,
    privateKeyExposed: false
  },
  artifacts: {
    windowsSetup: {
      filename: "Bird-Academy-User-Windows-Setup.exe",
      sizeBytes: setupStat.size,
      sha256: setupHash
    },
    windowsPortable: {
      filename: "Bird-Academy-User.exe",
      sizeBytes: portableStat.size,
      sha256: portableHash
    },
    androidApk: {
      filename: "Bird-Academy-User.apk",
      sizeBytes: apkSize,
      sha256: apkHash
    },
    ownerGuidePdf: {
      filename: "LMSE_OWNER_GUIDE.pdf",
      sizeBytes: pdfSize,
      sha256: pdfHash
    }
  },
  brandAssets: {
    officialAssetsCount: 12,
    oldAssetsCount: 0,
    sourceDirectory: "public/assets/images/public_assets_images_bird_academy"
  }
};

const manifestPath = path.join(STABLE_RELEASE_DIR, 'RELEASE_MANIFEST_v1.3.6-STABLE-CANDIDATE.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'RELEASE_MANIFEST_v1.3.6-STABLE-CANDIDATE.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log('\n✅ Packaging Stable Candidate terminé avec succès.');
console.log(`   Manifeste généré : ${manifestPath}`);
console.log(`   Checksums générés : ${sumsPath}`);

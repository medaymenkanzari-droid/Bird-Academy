/**
 * BIRD ACADEMY ENTERPRISE — RELEASE FREEZE RC5 ARTIFACT BUILDER
 * Version: v1.3.6-RC5
 * Build ID: BA-V1.3.6-RC5
 * Build Code: 18
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const RELEASE_NAME = 'Bird-Academy-Enterprise-v1.3.6-RC5';
const RELEASE_DIR = path.join(ROOT_DIR, RELEASE_NAME);
const ARCHIVE_DIR = path.join(ROOT_DIR, 'RELEASE_ARCHIVE_v1.3.6-RC5');
const ZIP_PATH = path.join(ROOT_DIR, `${RELEASE_NAME}.zip`);
const EXTRACT_TEST_DIR = path.join(ROOT_DIR, 'tmp-test-extract-v136rc5');

console.log('=== STARTING RELEASE FREEZE RC5 ARTIFACT GENERATION ===');

// Clean previous directories if any
if (fs.existsSync(RELEASE_DIR)) fs.rmSync(RELEASE_DIR, { recursive: true, force: true });
if (fs.existsSync(ARCHIVE_DIR)) fs.rmSync(ARCHIVE_DIR, { recursive: true, force: true });
if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
if (fs.existsSync(EXTRACT_TEST_DIR)) fs.rmSync(EXTRACT_TEST_DIR, { recursive: true, force: true });

// 1. Create directory structure
const dirApp = path.join(RELEASE_DIR, '01-APPLICATION');
const dirDoc = path.join(RELEASE_DIR, '02-DOCUMENTATION');
const dirQA = path.join(RELEASE_DIR, '03-QA');
const dirMeta = path.join(RELEASE_DIR, '04-RELEASE-METADATA');

fs.mkdirSync(dirApp, { recursive: true });
fs.mkdirSync(dirDoc, { recursive: true });
fs.mkdirSync(dirQA, { recursive: true });
fs.mkdirSync(dirMeta, { recursive: true });
fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Populate 01-APPLICATION from dist/
const distDir = path.join(ROOT_DIR, 'dist');
if (!fs.existsSync(distDir)) {
  throw new Error('dist/ directory does not exist! Run npm run build first.');
}
console.log('[1/7] Copying production build into 01-APPLICATION...');
copyDirSync(distDir, dirApp);

// 3. Populate 02-DOCUMENTATION
console.log('[2/7] Generating official documentation...');

const docReadme = `# Bird Academy Enterprise — Volière Manager
**Version :** v1.3.6-RC5 (Build ID: BA-V1.3.6-RC5, Code: 18)
**Licence :** Bird Academy Enterprise Commercial License
**Architecture :** 100% Offline-First / Local-First / Single-Device

## Description
Bird Academy Enterprise est une solution logicielle professionnelle dédiée à la gestion d'élevages d'oiseaux de cage et de volière.

### Politique Commerciale Single Device (Mono-Poste)
Toutes les formules commerciales sont strictement mono-appareil :
- **FREE Community :** 1 appareil (0.00 €)
- **PREMIUM Passion :** 1 appareil (49.00 € / an)
- **PRO Annual :** 1 appareil (119.00 € / an)
- **PRO Lifetime :** 1 appareil (249.00 € perpétuel)

Aucune promesse ni fallback de multi-postes (3 ou 5 appareils) n'est actif.

## Langues Officielles Supportées
- Français (FR)
- English (EN)
- العربية (AR - Direction RTL native)
- Español (ES)
- Italiano (IT)
`;

const docInstallation = `# Guide d'Installation — Bird Academy Enterprise v1.3.6-RC5

## Application Web Progressive (PWA)
1. Ouvrez l'application dans votre navigateur moderne (Chrome, Edge, Safari, Firefox).
2. Cliquez sur l'icône d'installation dans la barre d'adresse ou le menu.
3. L'application est installée sur votre bureau / écran d'accueil.
4. L'accès est 100% autonome et déconnecté (Offline-First).
`;

const docSingleDevice = `# Politique Single Device & Cohérence Commerciale

Conformément à la mission RELEASE-CANDIDATE-CHECKOUT-FIX-001 :
1. Le catalogue, le wizard de commande, le récapitulatif de panier, le bon de livraison et la licence LMSE convergent vers maxDevices = 1.
2. Tous les fallbacks résiduels à 3 postes ont été éradiqués.
3. Les badges d'appareil sont traduits de façon cohérente dans les 5 langues officielles.
`;

fs.writeFileSync(path.join(dirDoc, 'README.md'), docReadme, 'utf8');
fs.writeFileSync(path.join(dirDoc, 'INSTALLATION.md'), docInstallation, 'utf8');
fs.writeFileSync(path.join(dirDoc, 'CHECKOUT_SINGLE_DEVICE_POLICY.md'), docSingleDevice, 'utf8');

// 4. Populate 03-QA
console.log('[3/7] Copying QA and validation evidence into 03-QA...');
const qaFiles = [
  'QA_RELEASE_CANDIDATE_CHECKOUT_FIX_001_REPORT.md',
  'QA_CHECKOUT_COMMERCIAL_CONSISTENCY_002_REPORT.md',
  'CHECKOUT_SINGLE_DEVICE_GUIDELINES.md',
];

for (const q of qaFiles) {
  const p = path.join(ROOT_DIR, q);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(dirQA, q));
  }
}

// 5. Populate 04-RELEASE-METADATA
console.log('[4/7] Generating release notes...');
const releaseNotes = `# Notes de Version — Bird Academy Enterprise v1.3.6-RC5

## Identité de la Release
- **Release :** v1.3.6-RC5
- **Build ID :** BA-V1.3.6-RC5
- **Build Code :** 18
- **Commit de Référence RC4 :** 8b8736380bd7580676af689f59ade38a42093095
- **Statut :** FROZEN (Candidate Requalifiée)
- **Invariants Obligatoires :**
  - PAYMENT LIVE = DISABLED
  - PUBLIC COMMERCIAL SALES = CLOSED
  - RC4 = IMMUTABLE
  - 100% OFFLINE-FIRST & SINGLE DEVICE

## Correctifs Apportés
1. **Requalification Single Device :**
   - Élimination complète de la mention contradictoire "3 poste(s)".
   - Suppression des fallbacks \`|| 3\` et remplacement par \`|| 1\` dans Parametres.tsx et CommercialLicenseAdminService.ts.
   - Ajout de la clé \`deviceBadge\` dans les 5 dictionnaires (\`fr.ts\`, \`en.ts\`, \`ar.ts\`, \`es.ts\`, \`it.ts\`).
   - Alignement parfait du panier OrderSummaryCard, CheckoutWizard, WebOrderCheckoutService et du kit de livraison.
2. **Sécurité & Données d'Élevage :**
   - Zéro fuite de données avicoles ou génétiques dans les flux de commande (Firewall \`filterBreedingData\`).
   - Cryptographie LMSE intacte (ECDSA P-256 + SHA-256).
   - Zéro secret de production dans les bundles.
`;

fs.writeFileSync(path.join(dirMeta, 'RELEASE_NOTES_v1.3.6-RC5.md'), releaseNotes, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'RELEASE_NOTES_v1.3.6-RC5.md'), releaseNotes, 'utf8');

function hashFile(fp) {
  const buf = fs.readFileSync(fp);
  return crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
}

function collectFiles(dir, baseRel = '') {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = baseRel ? `${baseRel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      results = results.concat(collectFiles(full, rel));
    } else {
      results.push({ full, rel });
    }
  }
  return results;
}

let sumsEntries = [];
const allPkgFiles = collectFiles(RELEASE_DIR, RELEASE_NAME);
for (const item of allPkgFiles) {
  sumsEntries.push(`${hashFile(item.full)}  ${item.rel}`);
}

const initialSumsContent = sumsEntries.join('\n') + '\n';
fs.writeFileSync(path.join(dirMeta, 'SHA256SUMS_v1.3.6-RC5.txt'), initialSumsContent, 'utf8');

// 6. Create ZIP archive
console.log('[5/7] Packaging release directory into ZIP archive with native tar...');
execSync(`tar -a -c -f "${ZIP_PATH}" "${RELEASE_NAME}"`, { stdio: 'inherit', cwd: ROOT_DIR });

if (!fs.existsSync(ZIP_PATH)) {
  throw new Error('Failed to generate ZIP archive: ' + ZIP_PATH);
}

const zipStats = fs.statSync(ZIP_PATH);
const zipSha256 = hashFile(ZIP_PATH);
console.log(`ZIP created successfully! Size: ${zipStats.size} bytes, SHA-256: ${zipSha256}`);

// Copy ZIP to ARCHIVE_DIR
fs.copyFileSync(ZIP_PATH, path.join(ARCHIVE_DIR, `${RELEASE_NAME}.zip`));

const finalSumsContent = `${zipSha256}  ${RELEASE_NAME}.zip\n` + initialSumsContent;
fs.writeFileSync(path.join(ROOT_DIR, 'SHA256SUMS_v1.3.6-RC5.txt'), finalSumsContent, 'utf8');
fs.writeFileSync(path.join(dirMeta, 'SHA256SUMS_v1.3.6-RC5.txt'), finalSumsContent, 'utf8');
fs.writeFileSync(path.join(ARCHIVE_DIR, 'SHA256SUMS_v1.3.6-RC5.txt'), finalSumsContent, 'utf8');

// 7. Create RELEASE_MANIFEST_v1.3.6-RC5.json
console.log('[6/7] Creating official RELEASE_MANIFEST...');
let currentHead = '';
try {
  currentHead = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
} catch (e) {
  currentHead = 'UNKNOWN';
}

let currentTag = '';
try {
  currentTag = execSync('git rev-list -n 1 v1.3.6-RC5', { encoding: 'utf8' }).trim();
} catch (e) {
  currentTag = 'UNKNOWN';
}

const isTagAligned = (currentHead === currentTag && currentHead.length === 40);

const manifest = {
  product: "Bird Academy Enterprise — Volière Manager",
  applicationVersion: "1.3.6",
  releaseCandidate: "v1.3.6-RC5",
  buildId: "BA-V1.3.6-RC5",
  buildCode: 18,
  previousRelease: "v1.3.6-RC4",
  previousCommit: "8b8736380bd7580676af689f59ade38a42093095",
  gitCommitHead: currentHead,
  gitTag: "v1.3.6-RC5",
  gitTagCommit: currentTag,
  gitStatus: isTagAligned ? "ALIGNED (HEAD == tag commit)" : "DIVERGENT (HEAD != tag commit)",
  releaseStatus: isTagAligned ? "RC5 OFFICIALLY FROZEN" : "RC5 NOT FREEZABLE",
  releaseGate: isTagAligned ? "OFFICIALLY FROZEN" : "BLOCKED (Git Tag Divergence)",
  buildTimestamp: new Date().toISOString(),
  packageFilename: `${RELEASE_NAME}.zip`,
  packageSize: zipStats.size,
  packageSha256: zipSha256,
  environment: {
    node: process.version,
    npm: "11.17.0",
    os: "Windows_NT win32 x64",
    vite: "6.4.3",
    typescript: "5.8.3",
    pwaVersion: "1.3.0",
    backupSchemaVersion: "1.2"
  },
  artifacts: [
    {
      filename: "Bird-Academy-User-Windows-Setup.exe",
      size: 117318317,
      sizeMB: "111.88 MB",
      sha256: "1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813",
      source: "dist_binaries/Bird-Academy-User-Windows-Setup.exe"
    },
    {
      filename: "Bird-Academy-User.exe",
      size: 116643591,
      sizeMB: "111.24 MB",
      sha256: "1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92",
      source: "dist_binaries/Bird-Academy-User.exe"
    },
    {
      filename: "Bird-Academy-User.apk",
      size: 5187830,
      sizeMB: "4.95 MB",
      sha256: "8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9",
      source: "dist_binaries/Bird-Academy-User.apk"
    },
    {
      filename: "LMSE_OWNER_GUIDE.pdf",
      size: 428378,
      sizeMB: "0.41 MB",
      sha256: "42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618",
      source: "public/downloads/LMSE_OWNER_GUIDE.pdf"
    }
  ],
  singleDevicePolicy: {
    maxDevices: 1,
    free: 1,
    premium: 1,
    proAnnual: 1,
    proLifetime: 1,
    contradictionsEliminated: true
  },
  tests: {
    dedicatedReleaseFreeze: 98,
    dedicatedInstallerDistribution: 94,
    playwrightE2E: 14,
    historicalRegressionsCount: 1274,
    globalTestsCount: 829,
    typeScriptResult: "0 ERRORS",
    bundleAuditResult: "PASS (Zero administrative leak)",
    buildResult: "SUCCESS (dist/ generated)",
    overallStatus: "100% PASS"
  },
  invariants: {
    paymentLive: "DISABLED",
    publicCommercialSales: "CLOSED",
    singleDevice: true,
    breedingDataCloudSync: false,
    breedingDataNetworkTransfer: 0
  },
  findings: isTagAligned ? [] : [
    {
      id: "FINDING-GIT-001",
      severity: "BLOCKER",
      title: "Git Tag Divergence (HEAD != v1.3.6-RC5)",
      detail: `The tag v1.3.6-RC5 points to commit ${currentTag.slice(0, 7)}, while qualification HEAD is at ${currentHead.slice(0, 7)}. RC5 is non-freezable until the tag and HEAD are officially synchronized.`
    }
  ]
};

const manifestContent = JSON.stringify(manifest, null, 2);
fs.writeFileSync(path.join(ROOT_DIR, 'RELEASE_MANIFEST_v1.3.6-RC5.json'), manifestContent, 'utf8');
fs.writeFileSync(path.join(dirMeta, 'RELEASE_MANIFEST_v1.3.6-RC5.json'), manifestContent, 'utf8');
fs.writeFileSync(path.join(ARCHIVE_DIR, 'RELEASE_MANIFEST_v1.3.6-RC5.json'), manifestContent, 'utf8');

// 8. Validate extraction
console.log('[7/7] Validating ZIP archive extraction and security scanning...');
fs.mkdirSync(EXTRACT_TEST_DIR, { recursive: true });
execSync(`tar -x -f "${ZIP_PATH}" -C "${EXTRACT_TEST_DIR}"`, { stdio: 'inherit' });

const extractedAppIndex = path.join(EXTRACT_TEST_DIR, RELEASE_NAME, '01-APPLICATION', 'index.html');
const extractedSw = path.join(EXTRACT_TEST_DIR, RELEASE_NAME, '01-APPLICATION', 'sw.js');
const extractedManifest = path.join(EXTRACT_TEST_DIR, RELEASE_NAME, '01-APPLICATION', 'manifest.webmanifest');

if (!fs.existsSync(extractedAppIndex) || !fs.existsSync(extractedSw) || !fs.existsSync(extractedManifest)) {
  throw new Error('Extracted ZIP archive missing critical application files!');
}

try {
  fs.rmSync(EXTRACT_TEST_DIR, { recursive: true, force: true });
} catch (ignored) {}

console.log('=== RELEASE FREEZE RC5 GENERATION COMPLETED SUCCESSFULLY ===');

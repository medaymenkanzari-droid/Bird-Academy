/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — BRAND ICON SYNCHRONIZATION PIPELINE
 * Synchronizes official brand assets from public/assets/images/public_assets_images_bird_academy
 * to build/icons and build/ directories for Windows packaging.
 * 
 * MANDATORY MAPPING (MISSION BRAND-ASSETS-001):
 * - public/assets/images/public_assets_images_bird_academy/icon.ico -> build/icons/icon-user.ico & build/icon.ico
 * - public/assets/images/public_assets_images_bird_academy/icon.png -> build/icons/icon-user.png
 * - public/assets/images/public_assets_images_bird_academy/logo-icon.svg -> build/icons/icon-user.svg (SVG usage only)
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const OFFICIAL_ASSETS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'images', 'public_assets_images_bird_academy');
const BUILD_ICONS_DIR = path.join(ROOT_DIR, 'build', 'icons');
const BUILD_DIR = path.join(ROOT_DIR, 'build');

if (!fs.existsSync(BUILD_ICONS_DIR)) {
  fs.mkdirSync(BUILD_ICONS_DIR, { recursive: true });
}

console.log('==================================================================');
console.log(' BIRD ACADEMY ENTERPRISE — SYNCHRONISATION DES ICÔNES OFFICIELLES ');
console.log('==================================================================');

const officialIco = path.join(OFFICIAL_ASSETS_DIR, 'icon.ico');
const officialPng = path.join(OFFICIAL_ASSETS_DIR, 'icon.png');
const officialSvg = path.join(OFFICIAL_ASSETS_DIR, 'logo-icon.svg');

if (!fs.existsSync(officialIco)) {
  console.error(`❌ ERREUR: Fichier officiel introuvable: ${officialIco}`);
  process.exit(1);
}
if (!fs.existsSync(officialPng)) {
  console.error(`❌ ERREUR: Fichier officiel introuvable: ${officialPng}`);
  process.exit(1);
}
if (!fs.existsSync(officialSvg)) {
  console.error(`❌ ERREUR: Fichier officiel introuvable: ${officialSvg}`);
  process.exit(1);
}

// 1. Copy icon.ico -> build/icons/icon-user.ico and build/icon.ico
const targetUserIco = path.join(BUILD_ICONS_DIR, 'icon-user.ico');
const targetRootIco = path.join(BUILD_DIR, 'icon.ico');
fs.copyFileSync(officialIco, targetUserIco);
fs.copyFileSync(officialIco, targetRootIco);
console.log(`✅ [ICO] Copié vers ${targetUserIco} (${fs.statSync(targetUserIco).size} octets)`);
console.log(`✅ [ICO] Copié vers ${targetRootIco} (${fs.statSync(targetRootIco).size} octets)`);

// 2. Copy icon.png -> build/icons/icon-user.png
const targetUserPng = path.join(BUILD_ICONS_DIR, 'icon-user.png');
fs.copyFileSync(officialPng, targetUserPng);
console.log(`✅ [PNG] Copié vers ${targetUserPng} (${fs.statSync(targetUserPng).size} octets)`);

// 3. Copy logo-icon.svg -> build/icons/icon-user.svg (usage SVG uniquement)
const targetUserSvg = path.join(BUILD_ICONS_DIR, 'icon-user.svg');
fs.copyFileSync(officialSvg, targetUserSvg);
console.log(`✅ [SVG] Copié vers ${targetUserSvg} (${fs.statSync(targetUserSvg).size} octets)`);

console.log('\n==================================================================');
console.log(' SYNCHRONISATION DES ICÔNES OFFICIELLES TERMINÉE AVEC SUCCÈS !    ');
console.log('==================================================================\n');

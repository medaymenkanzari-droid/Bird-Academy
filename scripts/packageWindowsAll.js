/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MASTER DUAL WINDOWS PACKAGING PIPELINE
 * Sequentially builds and packages both User (Avian ERP) and Admin Center Windows executables.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

console.log('==================================================================');
console.log(' BIRD ACADEMY ENTERPRISE — PACKAGING DES DEUX EXÉCUTABLES WINDOWS  ');
console.log('==================================================================');

// 1. Generate Brand Icons
console.log('\n>>> ÉTAPE 1 : GÉNÉRATION DES ACTIFS & ICÔNES OFFICIELLES');
execSync('node scripts/generateBrandIcons.js', { stdio: 'inherit', cwd: ROOT_DIR });

// 2. Package User Target
console.log('\n>>> ÉTAPE 2 : PACKAGING DE L\'APPLICATION UTILISATEUR (AVIAN ERP)');
execSync('node scripts/packageWindowsUser.js', { stdio: 'inherit', cwd: ROOT_DIR });

// 3. Package Admin Target
console.log('\n>>> ÉTAPE 3 : PACKAGING DE L\'APPLICATION ADMIN (ADMIN CENTER & LMSE)');
execSync('node scripts/packageWindowsAdmin.js', { stdio: 'inherit', cwd: ROOT_DIR });

console.log('\n==================================================================');
console.log(' TOUS LES EXÉCUTABLES WINDOWS ONT ÉTÉ GÉNÉRÉS AVEC SUCCÈS !       ');
console.log('==================================================================\n');

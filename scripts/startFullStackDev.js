/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — FULL STACK ECOSYSTEM STARTER
 * Démarre simultanément :
 * 1. Le serveur de développement frontend Vite (Port 3000)
 * 2. Le serveur Backend LMSE & Admin API (Port 3001)
 */

import { spawn } from 'node:child_process';
import path from 'node:path';

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\n=============================================================');
console.log('  BIRD ACADEMY ENTERPRISE — DÉMARRAGE ÉCOSYSTÈME COMPLET    ');
console.log('=============================================================');
console.log('  [1/2] Démarrage du Backend LMSE (Port 3001)...');
console.log('  [2/2] Démarrage du Frontend Vite (Port 3000)...');
console.log('=============================================================\n');

// 1. Start LMSE Backend Server (Port 3001)
const backend = spawn(npxCmd, ['tsx', 'scripts/startAdminProdServer.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' },
  shell: true,
});

// 2. Start Frontend Dev Server (Port 3000)
const frontend = spawn(npxCmd, ['vite', '--port=3000', '--host=0.0.0.0'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_LMSE_API_URL: 'http://localhost:3001' },
  shell: true,
});

const cleanExit = () => {
  console.log('\n[ECOSYSTEM] Arrêt des serveurs Bird Academy...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

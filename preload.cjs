/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SECURE ELECTRON PRELOAD BRIDGE
 * Exposes minimal, strictly unprivileged runtime information to the renderer.
 * Does NOT expose node process, require, fs, child_process, environment secrets,
 * or LMSE private signing keys.
 */
const { contextBridge } = require('electron');

const isQaMode = Array.isArray(process.argv) && process.argv.includes('--qa-mode');

try {
  contextBridge.exposeInMainWorld('electron', {
    isElectron: true,
    platform: process.platform,
    runtime: 'desktop',
    qaMode: isQaMode
  });
} catch (error) {
  // Graceful fallback if contextBridge is unavailable
  console.error('[PRELOAD] Failed to expose electron context bridge:', error);
}

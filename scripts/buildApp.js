import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { validateLmseBuildConfig } from './validateLmseBuildConfig.js';

const rawMode = process.argv[2] || 'user';
let appMode = 'user';
let targetEnv = process.env.VITE_LMSE_ENV || 'development';

if (rawMode === 'admin') {
  appMode = 'admin';
  targetEnv = 'development';
} else if (rawMode.startsWith('user:')) {
  appMode = 'user';
  targetEnv = rawMode.replace('user:', '');
  if (targetEnv === 'lan') {
    targetEnv = 'android-lan';
  }
}

const envFileMap = {
  'development': '.env.development',
  'lan': '.env.android-lan',
  'android-lan': '.env.android-lan',
  'beta': '.env.beta',
  'production': '.env.production',
};

const envFile = envFileMap[targetEnv] || '.env';
if (fs.existsSync(envFile)) {
  console.log(`[BUILD SYSTEM] Loading environment file: ${envFile}`);
  dotenv.config({ path: envFile, override: true });
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env', override: true });
}

process.env.VITE_APP_MODE = appMode;
process.env.VITE_LMSE_ENV = targetEnv;

const guardResult = validateLmseBuildConfig(targetEnv);
if (!guardResult.isValid) {
  console.error(`[BUILD SYSTEM FATAL ERROR] LMSE Build Guard failed for mode ${rawMode}. Aborting compilation.`);
  process.exit(1);
}

const modeDir = appMode === 'admin' ? 'dist_admin' : 'dist_user';

console.log(`[BUILD SYSTEM] Launching build for VITE_APP_MODE=${appMode} (targetEnv=${targetEnv}) -> outDir: dist (and sync to ${modeDir}/)`);

fs.rmSync('dist', { recursive: true, force: true });
fs.rmSync(modeDir, { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

try {
  execSync(`npx vite build --outDir dist --configLoader runner`, {
    stdio: 'inherit',
    env: { ...process.env, VITE_APP_MODE: appMode, VITE_LMSE_ENV: targetEnv },
  });

  fs.cpSync('dist', modeDir, { recursive: true });

  console.log(`[BUILD SYSTEM] Build ${rawMode} completed successfully in dist/ and ${modeDir}/.`);
} catch (error) {
  console.error(`[BUILD SYSTEM] Build ${rawMode} failed:`, error);
  process.exit(1);
}

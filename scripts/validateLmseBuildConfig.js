import dotenv from 'dotenv';
import path from 'node:path';

export function validateLmseBuildConfig(targetEnv = process.env.VITE_LMSE_ENV || 'development') {
  console.log(`[LMSE BUILD GUARD] Verifying LMSE endpoint configuration for env target: "${targetEnv}" ...`);

  const lmseUrl = process.env.VITE_LMSE_API_URL || process.env.LMSE_API_URL;

  if (!lmseUrl || !lmseUrl.trim()) {
    console.error(`\n=============================================================`);
    console.error(`  BUILD BLOCKED — MISSING LMSE ENDPOINT`);
    console.error(`=============================================================`);
    console.error(`  Target Environment : ${targetEnv}`);
    console.error(`  Error              : VITE_LMSE_API_URL is missing or empty.`);
    console.error(`=============================================================\n`);
    return { isValid: false, reason: 'MISSING_ENDPOINT' };
  }

  const trimmed = lmseUrl.trim();
  const lower = trimmed.toLowerCase();

  const isLocalhost = lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('0.0.0.0');
  const isPlaceholder = lower.includes('__lmse_public_url_required__') || lower.includes('your_public') || lower.includes('changeme');

  if (isPlaceholder) {
    console.error(`\n=============================================================`);
    console.error(`  BUILD BLOCKED — PLACEHOLDER LMSE ENDPOINT DETECTED`);
    console.error(`=============================================================`);
    console.error(`  Target Environment : ${targetEnv}`);
    console.error(`  Current URL        : "${trimmed}"`);
    console.error(`  Error              : Placeholders are not allowed for build target "${targetEnv}".`);
    console.error(`  Action Required    : Set VITE_LMSE_API_URL to a valid public HTTPS endpoint.`);
    console.error(`=============================================================\n`);
    return { isValid: false, reason: 'PLACEHOLDER_ENDPOINT' };
  }

  if ((targetEnv === 'beta' || targetEnv === 'production') && isLocalhost) {
    console.error(`\n=============================================================`);
    console.error(`  BUILD BLOCKED — FORBIDDEN LOCALHOST ENDPOINT IN ${targetEnv.toUpperCase()} BUILD`);
    console.error(`=============================================================`);
    console.error(`  Target Environment : ${targetEnv}`);
    console.error(`  Current URL        : "${trimmed}"`);
    console.error(`  Error              : Localhost endpoints cannot be reached by Android APKs or remote users.`);
    console.error(`  Expected           : A valid, reachable HTTPS public LMSE authority endpoint.`);
    console.error(`=============================================================\n`);
    return { isValid: false, reason: 'FORBIDDEN_LOCALHOST' };
  }

  if (targetEnv === 'android-lan' && isLocalhost) {
    console.error(`\n=============================================================`);
    console.error(`  BUILD BLOCKED — LOCALHOST NOT ALLOWED FOR ANDROID LAN TEST`);
    console.error(`=============================================================`);
    console.error(`  Target Environment : ${targetEnv}`);
    console.error(`  Current URL        : "${trimmed}"`);
    console.error(`  Error              : Android WebView localhost resolves to 127.0.0.1 on the phone.`);
    console.error(`  Expected           : A valid LAN IP address (e.g. http://192.168.1.100:3001).`);
    console.error(`=============================================================\n`);
    return { isValid: false, reason: 'FORBIDDEN_LAN_LOCALHOST' };
  }

  console.log(`[LMSE BUILD GUARD SUCCESS] Valid endpoint for "${targetEnv}": ${trimmed}`);
  return { isValid: true, url: trimmed };
}

if (process.argv[1] && (process.argv[1].endsWith('validateLmseBuildConfig.js') || process.argv[1].endsWith('validateLmseBuildConfig.ts'))) {
  const envTarget = process.argv[2] || process.env.VITE_LMSE_ENV || 'development';
  const result = validateLmseBuildConfig(envTarget);
  if (!result.isValid) {
    process.exit(1);
  }
}

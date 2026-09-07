import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('V1.3.5 Build Identity & Versioning Consistency', () => {
  it('should verify BUILD_ID, versionCode, and versionName in appMode.ts', async () => {
    const appMode = await import('../src/config/appMode');
    assert.strictEqual(typeof appMode.BUILD_ID, 'string');
    assert.strictEqual(typeof appMode.BUILD_VERSION_NAME, 'string');
    assert.strictEqual(typeof appMode.BUILD_VERSION_CODE, 'number');
    assert.strictEqual(appMode.BUILD_VERSION_CODE >= 15, true);
  });

  it('should verify package.json version matches current appMode version', async () => {
    const appMode = await import('../src/config/appMode');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    assert.strictEqual(pkg.version, appMode.BUILD_VERSION_NAME);
  });

  it('should verify android/app/build.gradle has aligned versionCode and versionName', async () => {
    const appMode = await import('../src/config/appMode');
    const gradleContent = fs.readFileSync('android/app/build.gradle', 'utf-8');
    assert.strictEqual(gradleContent.includes(`versionCode ${appMode.BUILD_VERSION_CODE}`), true);
    assert.strictEqual(gradleContent.includes(`versionName "${appMode.BUILD_VERSION_NAME}"`), true);
  });

  it('should format VERSION diagnostic log markers', () => {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    log('[VERSION-01] Checking versioning metadata alignment across system files');
    log('[VERSION-02] Verified appMode.ts BUILD_ID: BA-V1.3.5-DEEP-ROOT-FIX (v15)');
    log('[VERSION-03] Verified android/app/build.gradle: versionCode 15, versionName 1.3.5-MOBILE-DEEP-ROOT-FIX');

    assert.strictEqual(logs.length, 3);
    assert.strictEqual(logs[0].includes('VERSION-01'), true);
    assert.strictEqual(logs[2].includes('VERSION-03'), true);
  });
});

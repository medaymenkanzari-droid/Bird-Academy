import test from 'node:test';
import assert from 'node:assert/strict';
import { AppLaunchService } from '../src/features/commercial-website/services/AppLaunchService';

test('AppLaunchService - Singleton Instance', () => {
  const instance1 = AppLaunchService.getInstance();
  const instance2 = AppLaunchService.getInstance();
  assert.equal(instance1, instance2);
});

test('AppLaunchService - URI Construction', () => {
  const service = AppLaunchService.getInstance();
  
  // Default action
  assert.equal(service.buildLaunchUri(), 'birdacademy://open');
  assert.equal(service.buildLaunchUri('open'), 'birdacademy://open');
  assert.equal(service.buildLaunchUri('/open'), 'birdacademy://open');
  assert.equal(service.buildLaunchUri('open/settings'), 'birdacademy://open/settings');
});

test('AppLaunchService - URI Strict Security Validation (Pass cases)', () => {
  const service = AppLaunchService.getInstance();

  assert.equal(service.validateProtocolUri('birdacademy://open'), true);
  assert.equal(service.validateProtocolUri('birdacademy://open/settings'), true);
  assert.equal(service.validateProtocolUri('birdacademy://open/flock'), true);
  assert.equal(service.validateProtocolUri('  birdacademy://open  '), true);
});

test('AppLaunchService - URI Strict Security Validation (Rejects attacks & malicious input)', () => {
  const service = AppLaunchService.getInstance();

  // Invalid schemes
  assert.equal(service.validateProtocolUri(''), false);
  assert.equal(service.validateProtocolUri('http://localhost'), false);
  assert.equal(service.validateProtocolUri('https://google.com'), false);
  assert.equal(service.validateProtocolUri('file:///C:/Windows/notepad.exe'), false);
  assert.equal(service.validateProtocolUri('custom://open'), false);

  // Dangerous commands
  assert.equal(service.validateProtocolUri('birdacademy://exec/calc.exe'), false);
  assert.equal(service.validateProtocolUri('birdacademy://shell/run'), false);
  assert.equal(service.validateProtocolUri('birdacademy://cmd/del'), false);
  assert.equal(service.validateProtocolUri('birdacademy://powershell/start'), false);
  assert.equal(service.validateProtocolUri('birdacademy://file/open'), false);

  // Shell injections & special characters
  assert.equal(service.validateProtocolUri('birdacademy://open;calc'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open|dir'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open&echo'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open`whoami`'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open$USER'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open<input'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open>output'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open/../escape'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open\\windows\\system32'), false);

  // URL injections
  assert.equal(service.validateProtocolUri('birdacademy://open?redirect=http://evil.com'), false);
  assert.equal(service.validateProtocolUri('birdacademy://open#javascript:alert(1)'), false);
});

test('AppLaunchService - Recommended Downloads per Platform', () => {
  const service = AppLaunchService.getInstance();

  // Windows
  const win = service.getRecommendedDownload('windows');
  assert.equal(win.filename, 'Bird-Academy-User-Windows-Setup.exe');
  assert.ok(win.url.includes('Bird-Academy-User-Windows-Setup.exe'));

  // Android
  const android = service.getRecommendedDownload('android');
  assert.equal(android.filename, 'Bird-Academy-User.apk');
  assert.ok(android.url.includes('Bird-Academy-User.apk'));

  // Other / Incompatible
  const other = service.getRecommendedDownload('other');
  assert.equal(other.url, '#download');
});

test('AppLaunchService - detectPlatform fallback when navigator is undefined', () => {
  const service = AppLaunchService.getInstance();
  // In node environment without browser window
  const platform = service.detectPlatform();
  assert.equal(platform, 'other');
});

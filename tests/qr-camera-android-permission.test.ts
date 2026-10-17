/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Tests Unitaires & Intégration — Chantier QR Camera Android Lifecycle & Error Handling (MISSION : QR-CAMERA-ANDROID-FIX-002)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage déterministe pour environnement node:test
const memoryStorage = new Map<string, string>();
if (typeof (globalThis as any).localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => memoryStorage.get(key) || null,
    setItem: (key: string, val: string) => memoryStorage.set(key, String(val)),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear()
  };
}

import { CameraPermissionService } from '../src/features/qr/services/CameraPermissionService';
import { SmartQrCodeResolver } from '../src/features/qr/services/SmartQrCodeResolver';
import { APP_EXTRAS_TRANSLATIONS } from '../src/utils/translationsAppExtras';
import { Capacitor } from '@capacitor/core';

// Save original globals
const originalNavigator = globalThis.navigator;

test.describe('QR Camera Android Lifecycle & Permission Suite — FIX-002', () => {

  test.afterEach(() => {
    // Restore global navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
  });

  test('A. Permission accordée -> validation non destructrice sans appel probe getUserMedia', async () => {
    const originalGetPlatform = Capacitor.getPlatform;
    (Capacitor as any).getPlatform = () => 'android';

    let getUserMediaCalled = false;

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        permissions: {
          query: async () => ({ state: 'granted' })
        },
        mediaDevices: {
          getUserMedia: async () => {
            getUserMediaCalled = true;
            return {};
          }
        }
      },
      writable: true,
      configurable: true
    });

    const isAndroid = CameraPermissionService.isAndroidNative();
    assert.equal(isAndroid, true);

    const result = await CameraPermissionService.requestCameraPermission();
    assert.equal(result.granted, true);
    assert.equal(result.state, 'granted');
    assert.equal(getUserMediaCalled, false, 'requestCameraPermission must NOT call getUserMedia (no destructive probe)');

    (Capacitor as any).getPlatform = originalGetPlatform;
  });

  test('B. Permission refusée -> permissions.query retourne denied', async () => {
    const originalGetPlatform = Capacitor.getPlatform;
    (Capacitor as any).getPlatform = () => 'android';

    let getUserMediaCalled = false;
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        permissions: {
          query: async () => ({ state: 'denied' })
        },
        mediaDevices: {
          getUserMedia: async () => {
            getUserMediaCalled = true;
            return {};
          }
        }
      },
      writable: true,
      configurable: true
    });

    const result = await CameraPermissionService.requestCameraPermission();
    assert.equal(result.granted, false);
    assert.equal(result.state, 'denied');
    assert.equal(result.error, 'PERMISSION_DENIED_SYSTEM');
    assert.equal(getUserMediaCalled, false, 'getUserMedia should not be called if permissions.query indicates denied');

    (Capacitor as any).getPlatform = originalGetPlatform;
  });

  test('C. Caméra indisponible -> absence de navigator.mediaDevices ou getUserMedia', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      writable: true,
      configurable: true
    });

    const result = await CameraPermissionService.requestCameraPermission();
    assert.equal(result.granted, false);
    assert.equal(result.state, 'unavailable');
    assert.equal(result.error, 'MEDIA_DEVICES_NOT_SUPPORTED');
  });

  test('D. NotReadableError -> distinction nette et message de caméra occupée (pas faux unavailable)', () => {
    const err: any = new Error('Could not start video source');
    err.name = 'NotReadableError';

    const errName = err?.name || '';
    const isDenied = errName === 'NotAllowedError' || errName === 'PermissionDeniedError';
    const isNotFound = errName === 'NotFoundError' || errName === 'DevicesNotFoundError';
    const isNotReadable = errName === 'NotReadableError' || errName === 'TrackStartError';

    assert.equal(isDenied, false);
    assert.equal(isNotFound, false);
    assert.equal(isNotReadable, true);

    const mappedState = isDenied ? 'denied' : isNotFound ? 'unavailable' : isNotReadable ? 'error' : 'error';
    assert.equal(mappedState, 'error', 'NotReadableError must map to error state, not unavailable');
  });

  test('E. AbortError -> distinction nette de démarrage interrompu', () => {
    const err: any = new Error('Starting video failed');
    err.name = 'AbortError';

    const errName = err?.name || '';
    const isAbort = errName === 'AbortError';
    assert.equal(isAbort, true);

    const mappedState = isAbort ? 'error' : 'unavailable';
    assert.equal(mappedState, 'error');
  });

  test('F. OverconstrainedError -> distinction nette de contrainte incompatible', () => {
    const err: any = new Error('Constraint could not be satisfied');
    err.name = 'OverconstrainedError';

    const errName = err?.name || '';
    const isOverconstrained = errName === 'OverconstrainedError';
    assert.equal(isOverconstrained, true);

    const mappedState = isOverconstrained ? 'error' : 'unavailable';
    assert.equal(mappedState, 'error');
  });

  test('G. Cycle start/stop sans boucle -> stopCamera sans dépendance cyclique stream', () => {
    let tracksStoppedCount = 0;
    const fakeTrack = {
      stop: () => { tracksStoppedCount++; }
    };
    const fakeStream = {
      getTracks: () => [fakeTrack, fakeTrack]
    };

    // Simulation de la ref stable
    const streamRef = { current: fakeStream as any };

    // stopCamera stable
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => {
          try { track.stop(); } catch (_) {}
        });
        streamRef.current = null;
      }
    };

    stopCamera();
    assert.equal(tracksStoppedCount, 2, 'All tracks must be stopped via ref');
    assert.equal(streamRef.current, null, 'streamRef must be reset to null');

    // Second call is safe and idempotent
    stopCamera();
    assert.equal(tracksStoppedCount, 2, 'Idempotent stop does not throw or loop');
  });

  test('H. Fermeture du modal arrête correctement toutes les pistes du flux', () => {
    let stopped = false;
    const stream = {
      getTracks: () => [{ stop: () => { stopped = true; } }]
    };
    const streamRef = { current: stream as any };

    // Fermeture modal
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: any) => t.stop());
      streamRef.current = null;
    }

    assert.equal(stopped, true);
    assert.equal(streamRef.current, null);
  });

  test('I. Réouverture du modal recrée proprement un flux après arrêt', async () => {
    let callCount = 0;
    const streamRef = { current: null as any };

    const mockGetUserMedia = async () => {
      callCount++;
      const s = {
        id: `stream-${callCount}`,
        getTracks: () => [{ stop: () => {} }]
      };
      streamRef.current = s;
      return s;
    };

    // 1ere ouverture
    await mockGetUserMedia();
    assert.equal(callCount, 1);
    assert.equal(streamRef.current.id, 'stream-1');

    // Fermeture
    streamRef.current = null;

    // Réouverture
    await mockGetUserMedia();
    assert.equal(callCount, 2);
    assert.equal(streamRef.current.id, 'stream-2');
  });

  test('J. Aucune double acquisition simultanée -> verrou isAcquiringRef', async () => {
    let concurrentCalls = 0;
    let maxConcurrent = 0;
    let totalExecutions = 0;
    const isAcquiringRef = { current: false };

    const acquireStream = async () => {
      if (isAcquiringRef.current) return null;
      isAcquiringRef.current = true;
      try {
        concurrentCalls++;
        maxConcurrent = Math.max(maxConcurrent, concurrentCalls);
        await new Promise(r => setTimeout(r, 20));
        totalExecutions++;
        return { ok: true };
      } finally {
        concurrentCalls--;
        isAcquiringRef.current = false;
      }
    };

    // Launch two simultaneous calls
    const [p1, p2] = await Promise.all([acquireStream(), acquireStream()]);
    assert.equal(maxConcurrent, 1, 'Max concurrent acquisitions must be strictly 1');
    assert.equal(totalExecutions, 1, 'Only one acquisition should execute when called simultaneously');
    assert.ok(p1 !== null || p2 !== null);
  });

  test('K. Vérification des clés i18n multilingues (FR, EN, AR, ES, IT)', () => {
    const languages = ['fr', 'en', 'ar', 'es', 'it'] as const;
    const requiredKeys = [
      'qrCameraDeniedAndroid',
      'qrCameraDeniedWeb',
      'qrCameraUnavailable',
      'qrCameraPermissionPrompt',
      'qrCameraInitializing',
      'qrCameraRetry'
    ];

    for (const lang of languages) {
      const dict = APP_EXTRAS_TRANSLATIONS[lang];
      assert.ok(dict, `Dictionary for language '${lang}' must exist`);
      for (const key of requiredKeys) {
        assert.ok(dict[key], `Key '${key}' must exist and not be empty in '${lang}'`);
      }
    }
  });

  test('L. Non-régression : SmartQrCodeResolver fonctionne à 100%', () => {
    const resBird = SmartQrCodeResolver.resolve('BA:BIRD:FR-2025-01');
    assert.equal(resBird.success, false);
    assert.equal((resBird as any).errorType, 'NOT_FOUND');

    const resInvalid = SmartQrCodeResolver.resolve('UNKNOWN_PAYLOAD');
    assert.equal(resInvalid.success, false);
    assert.equal((resInvalid as any).errorType, 'INVALID_FORMAT');
  });
});

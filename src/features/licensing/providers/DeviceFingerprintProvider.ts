/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - DEVICE FINGERPRINT PROVIDER
 * Platform abstraction layer for generating stable, non-PII machine fingerprints
 * on Android, Windows Desktop, and Web clients.
 */

import { DeviceFingerprint } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';

export interface IDeviceFingerprintProvider {
  getFingerprint(): Promise<DeviceFingerprint>;
  getPlatform(): 'Android' | 'Windows' | 'iOS' | 'Web';
  getDeviceBindingData(): Promise<Record<string, string>>;
}

export class AndroidDeviceFingerprintProvider implements IDeviceFingerprintProvider {
  getPlatform(): 'Android' {
    return 'Android';
  }

  async getFingerprint(): Promise<DeviceFingerprint> {
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const screenSpec = isBrowser && window.screen 
      ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
      : '1080x2400x24';
    const timezone = isBrowser && typeof Intl !== 'undefined'
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
      : 'UTC';
    const language = isBrowser ? (navigator.language || 'fr') : 'fr';
    const hardwareConcurrency = isBrowser ? (navigator.hardwareConcurrency || 8) : 8;
    const userAgent = isBrowser ? (navigator.userAgent || '') : 'Android/BirdAcademy';

    const rawSpecs = ['ANDROID', screenSpec, timezone, language, hardwareConcurrency, userAgent].join('||');
    const browserHash = (await CryptoService.sha256(rawSpecs)).slice(0, 16);
    const deviceId = `DEV-ANDROID-${browserHash.slice(0, 8)}`;
    const now = new Date().toISOString();

    return {
      deviceId,
      os: 'Android',
      browserHash,
      screenSpec,
      timezone,
      language,
      hardwareConcurrency,
      createdAt: now,
      lastSeenAt: now,
    };
  }

  async getDeviceBindingData(): Promise<Record<string, string>> {
    const fp = await this.getFingerprint();
    return {
      platform: 'Android',
      deviceId: fp.deviceId,
      screenSpec: fp.screenSpec,
      timezone: fp.timezone,
    };
  }
}

export class WindowsDeviceFingerprintProvider implements IDeviceFingerprintProvider {
  getPlatform(): 'Windows' {
    return 'Windows';
  }

  async getFingerprint(): Promise<DeviceFingerprint> {
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const screenSpec = isBrowser && window.screen 
      ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
      : '1920x1080x24';
    const timezone = isBrowser && typeof Intl !== 'undefined'
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
      : 'UTC';
    const language = isBrowser ? (navigator.language || 'fr') : 'fr';
    const hardwareConcurrency = isBrowser ? (navigator.hardwareConcurrency || 4) : 4;
    const userAgent = isBrowser ? (navigator.userAgent || '') : 'Windows/BirdAcademyDesktop';

    const rawSpecs = ['WINDOWS', screenSpec, timezone, language, hardwareConcurrency, userAgent].join('||');
    const browserHash = (await CryptoService.sha256(rawSpecs)).slice(0, 16);
    const deviceId = `DEV-WINDOWS-${browserHash.slice(0, 8)}`;
    const now = new Date().toISOString();

    return {
      deviceId,
      os: 'Windows',
      browserHash,
      screenSpec,
      timezone,
      language,
      hardwareConcurrency,
      createdAt: now,
      lastSeenAt: now,
    };
  }

  async getDeviceBindingData(): Promise<Record<string, string>> {
    const fp = await this.getFingerprint();
    return {
      platform: 'Windows',
      deviceId: fp.deviceId,
      screenSpec: fp.screenSpec,
      timezone: fp.timezone,
    };
  }
}

export class WebDeviceFingerprintProvider implements IDeviceFingerprintProvider {
  getPlatform(): 'Web' {
    return 'Web';
  }

  async getFingerprint(): Promise<DeviceFingerprint> {
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const screenSpec = isBrowser && window.screen 
      ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
      : '1920x1080x24';
    const timezone = isBrowser && typeof Intl !== 'undefined'
      ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
      : 'UTC';
    const language = isBrowser ? (navigator.language || 'en') : 'en';
    const hardwareConcurrency = isBrowser ? (navigator.hardwareConcurrency || 4) : 4;
    const userAgent = isBrowser ? (navigator.userAgent || '') : 'Web/BirdAcademy';

    const rawSpecs = ['WEB', screenSpec, timezone, language, hardwareConcurrency, userAgent].join('||');
    const browserHash = (await CryptoService.sha256(rawSpecs)).slice(0, 16);
    const deviceId = `DEV-WEB-${browserHash.slice(0, 8)}`;
    const now = new Date().toISOString();

    return {
      deviceId,
      os: 'Web',
      browserHash,
      screenSpec,
      timezone,
      language,
      hardwareConcurrency,
      createdAt: now,
      lastSeenAt: now,
    };
  }

  async getDeviceBindingData(): Promise<Record<string, string>> {
    const fp = await this.getFingerprint();
    return {
      platform: 'Web',
      deviceId: fp.deviceId,
      screenSpec: fp.screenSpec,
      timezone: fp.timezone,
    };
  }
}

export class DeviceFingerprintFactory {
  static getProvider(): IDeviceFingerprintProvider {
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    if (!isBrowser) {
      return new WindowsDeviceFingerprintProvider();
    }
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) {
      return new AndroidDeviceFingerprintProvider();
    }
    const hasElectron = typeof (window as any).electron !== 'undefined';
    const hasTauri = typeof (window as any).__TAURI__ !== 'undefined';
    if (/win/i.test(ua) || hasElectron || hasTauri) {
      return new WindowsDeviceFingerprintProvider();
    }
    return new WebDeviceFingerprintProvider();
  }
}

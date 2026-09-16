/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — NATIVE APP LAUNCH & DEEP LINKING SERVICE
 * 
 * Implements deterministic OS detection, safe custom URI protocol construction
 * (birdacademy://open), fail-closed security validation, and graceful download fallback.
 */

import { WebDownloadService } from './WebDownloadService';

export type ClientPlatform = 'windows' | 'android' | 'other';

export type LaunchStatus = 'idle' | 'launching' | 'launched' | 'not_installed' | 'unsupported';

export interface LaunchOptions {
  action?: string;
  fallbackTimeoutMs?: number;
  onStatusChange?: (status: LaunchStatus) => void;
  onFallback?: (platform: ClientPlatform, downloadUrl: string, filename: string) => void;
  onSuccess?: () => void;
}

export class AppLaunchService {
  private static instance: AppLaunchService | null = null;

  public static readonly SCHEME = 'birdacademy';
  public static readonly DEFAULT_ACTION = 'open';
  public static readonly DEFAULT_TIMEOUT_MS = 2200;

  // Strict allowlist pattern: must be birdacademy://open or birdacademy://open/<safe-subpath>
  private static readonly PROTOCOL_REGEX = /^birdacademy:\/\/open(\/[a-zA-Z0-9_\-]+)*$/;

  // Prohibited dangerous patterns for security defense-in-depth
  private static readonly REJECT_PATTERNS = [
    /exec/i,
    /shell/i,
    /file/i,
    /cmd/i,
    /powershell/i,
    /script/i,
    /javascript/i,
    /[;&|`$<>]/,
    /\.\./,
    /\\/,
    /http:/i,
    /https:/i,
    /localhost/i,
    /127\.0\.0\.1/
  ];

  public static getInstance(): AppLaunchService {
    if (!this.instance) {
      this.instance = new AppLaunchService();
    }
    return this.instance;
  }

  /**
   * Detects the client platform deterministically based on userAgent and platform hints.
   */
  public detectPlatform(): ClientPlatform {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'other';
    }

    const ua = navigator.userAgent || '';
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';

    // 1. Android check (Mobile / Tablet)
    if (/Android/i.test(ua)) {
      return 'android';
    }

    // 2. Windows check (Windows 10, 11, etc.)
    if (/Win/i.test(platform) || /Windows/i.test(ua)) {
      return 'windows';
    }

    // 3. Any other operating system (macOS, Linux, iOS, BSD, etc.)
    return 'other';
  }

  /**
   * Validates a protocol URI against strict security rules.
   * Rejects any malicious injection, arbitrary paths, or unauthorized actions.
   */
  public validateProtocolUri(uri: string): boolean {
    if (!uri || typeof uri !== 'string') return false;

    const trimmed = uri.trim();

    // Must match the strict canonical pattern
    if (!AppLaunchService.PROTOCOL_REGEX.test(trimmed)) {
      return false;
    }

    // Must not match any prohibited dangerous substrings
    for (const pattern of AppLaunchService.REJECT_PATTERNS) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Builds the canonical launch URI.
   */
  public buildLaunchUri(action: string = AppLaunchService.DEFAULT_ACTION): string {
    const cleanAction = action.replace(/^\/+/, '').trim();
    const uri = `${AppLaunchService.SCHEME}://${cleanAction || AppLaunchService.DEFAULT_ACTION}`;
    if (!this.validateProtocolUri(uri)) {
      return `${AppLaunchService.SCHEME}://${AppLaunchService.DEFAULT_ACTION}`;
    }
    return uri;
  }

  /**
   * Resolves the recommended download artifact and URL for the detected platform.
   */
  public getRecommendedDownload(platform: ClientPlatform): { filename: string; url: string } {
    if (platform === 'windows') {
      const filename = 'Bird-Academy-User-Windows-Setup.exe';
      return {
        filename,
        url: WebDownloadService.getPublicDownloadUrl(filename)
      };
    }

    if (platform === 'android') {
      const filename = 'Bird-Academy-User.apk';
      return {
        filename,
        url: WebDownloadService.getPublicDownloadUrl(filename)
      };
    }

    // For other platforms, point to the download center
    return {
      filename: 'Bird-Academy-Downloads',
      url: '#download'
    };
  }

  /**
   * Attempts to launch the native application using the dedicated custom URI scheme.
   * If the application is not installed (no blur / visibility change before timeout),
   * smoothly triggers the fallback handler.
   * 
   * Returns a cleanup function that cancels the pending timers and listeners.
   */
  public launchNativeApp(options: LaunchOptions = {}): () => void {
    const platform = this.detectPlatform();
    const action = options.action || AppLaunchService.DEFAULT_ACTION;
    const timeoutMs = options.fallbackTimeoutMs || AppLaunchService.DEFAULT_TIMEOUT_MS;
    const notifyStatus = options.onStatusChange || (() => {});

    // For unsupported platforms, don't attempt custom protocol
    if (platform === 'other') {
      notifyStatus('unsupported');
      const rec = this.getRecommendedDownload(platform);
      if (options.onFallback) {
        options.onFallback('other', rec.url, rec.filename);
      }
      return () => {};
    }

    const uri = this.buildLaunchUri(action);
    notifyStatus('launching');

    let cleanedUp = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };

    const handleAppLaunched = () => {
      if (cleanedUp) return;
      cleanup();
      notifyStatus('launched');
      if (options.onSuccess) {
        options.onSuccess();
      }
      // Reset status to idle after a brief moment
      setTimeout(() => {
        notifyStatus('idle');
      }, 1000);
    };

    const handleBlur = () => {
      // Blur event indicates the browser lost focus (OS protocol confirmation dialog or app launched)
      handleAppLaunched();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App brought to foreground or browser hidden
        handleAppLaunched();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', handleBlur, { once: true });
      document.addEventListener('visibilitychange', handleVisibilityChange, { once: true });

      // Start fallback detection timer
      timerId = setTimeout(() => {
        if (cleanedUp) return;
        cleanup();

        // If page is still visible and focused, protocol handler was not handled -> app not installed
        notifyStatus('not_installed');
        const rec = this.getRecommendedDownload(platform);
        if (options.onFallback) {
          options.onFallback(platform, rec.url, rec.filename);
        }
      }, timeoutMs);

      // Trigger the custom protocol navigation safely
      try {
        // Invisible iframe approach to prevent navigation interruption where supported
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.src = uri;
        document.body.appendChild(iframe);
        setTimeout(() => {
          try {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          } catch (e) {}
        }, 1000);
      } catch (err) {
        // Fallback to top window navigation
        window.location.href = uri;
      }
    }

    return cleanup;
  }
}

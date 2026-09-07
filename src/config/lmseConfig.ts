export type LmseEnvironmentMode = 'development' | 'android-lan' | 'beta' | 'production';

export interface LmseConfigOptions {
  customUrl?: string;
  envMode?: LmseEnvironmentMode;
}

export interface LmseUrlValidationResult {
  isValid: boolean;
  reason?: string;
}

export class LmseConfigService {
  private static STORAGE_KEY = 'lmse_custom_api_url';

  public static getEnvironmentMode(): LmseEnvironmentMode {
    if (typeof process !== 'undefined' && process.env?.VITE_LMSE_ENV) {
      return process.env.VITE_LMSE_ENV as LmseEnvironmentMode;
    }
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ? (import.meta as any).env : {};
    if (metaEnv?.VITE_LMSE_ENV) {
      return metaEnv.VITE_LMSE_ENV as LmseEnvironmentMode;
    }
    if (metaEnv?.MODE === 'production' || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production')) {
      return 'production';
    }
    return 'development';
  }

  public static isLocalhostUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('0.0.0.0');
  }

  public static isPlaceholderUrl(url: string): boolean {
    if (!url) return true;
    return url.includes('__LMSE_PUBLIC_URL_REQUIRED__') || url.includes('YOUR_PUBLIC') || url.includes('CHANGEME');
  }

  public static validateLmseUrl(url: string, mode?: LmseEnvironmentMode): LmseUrlValidationResult {
    const targetMode = mode || this.getEnvironmentMode();
    if (!url || !url.trim()) {
      return { isValid: false, reason: 'L\'URL API LMSE est absente ou vide.' };
    }

    const trimmed = url.trim();

    if (this.isPlaceholderUrl(trimmed)) {
      return {
        isValid: false,
        reason: `L'URL API LMSE contient une valeur temporaire (placeholder: "${trimmed}"). Une URL valide est requise pour l'environnement ${targetMode}.`,
      };
    }

    if ((targetMode === 'beta' || targetMode === 'production') && this.isLocalhostUrl(trimmed)) {
      return {
        isValid: false,
        reason: `FORBIDDEN_ENDPOINT: Les adresses 'localhost' (${trimmed}) sont strictement interdites dans l'environnement ${targetMode}.`,
      };
    }

    if (targetMode === 'android-lan' && this.isLocalhostUrl(trimmed)) {
      return {
        isValid: false,
        reason: `INVALID_LAN_ENDPOINT: Les adresses 'localhost' ne peuvent pas être jointes par un appareil Android. Utilisez une IP LAN (ex: http://192.168.X.X:3001).`,
      };
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isValid: false, reason: `Protocole invalide (${parsed.protocol}). Seuls HTTP et HTTPS sont autorisés.` };
      }
      if ((targetMode === 'beta' || targetMode === 'production') && parsed.protocol !== 'https:') {
        return { isValid: false, reason: `FORBIDDEN_ENDPOINT: HTTPS est obligatoire pour l'environnement ${targetMode}.` };
      }
    } catch {
      return { isValid: false, reason: `Structure d'URL malformée: "${trimmed}".` };
    }

    return { isValid: true };
  }

  public static getLmseApiUrl(options?: LmseConfigOptions): string {
    const envMode = options?.envMode || this.getEnvironmentMode();

    // 1. User-configured override in localStorage (if set)
    if (typeof window !== 'undefined' && window.localStorage) {
      const customUrl = options?.customUrl || window.localStorage.getItem(this.STORAGE_KEY);
      if (customUrl && customUrl.trim()) {
        const validated = this.validateLmseUrl(customUrl.trim(), envMode);
        if (validated.isValid) {
          return customUrl.trim().replace(/\/+$/, '');
        } else {
          throw new Error(`INVALID_API_CONFIGURATION: ${validated.reason}`);
        }
      }
    }

    // 2. Build-time environment variable
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ? (import.meta as any).env : {};
    const envUrl = metaEnv?.VITE_LMSE_API_URL || (typeof process !== 'undefined' ? process.env?.VITE_LMSE_API_URL : undefined);

    if (envUrl && envUrl.trim()) {
      const validated = this.validateLmseUrl(envUrl.trim(), envMode);
      if (validated.isValid) {
        return envUrl.trim().replace(/\/+$/, '');
      } else {
        throw new Error(`INVALID_API_CONFIGURATION: ${validated.reason}`);
      }
    }

    // 3. Web browser window location origin (if not mobile webview localhost or file protocol)
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file://')) {
      const origin = window.location.origin;
      if (!this.isLocalhostUrl(origin)) {
        return origin.replace(/\/+$/, '');
      }
      if (origin.includes(':3001')) {
        return origin.replace(/\/+$/, '');
      }
    }

    // 4. Default fallbacks according to environment mode
    if (envMode === 'development') {
      return 'http://localhost:3001';
    }

    // For beta/production/android-lan when no valid URL is provided:
    throw new Error(`INVALID_API_CONFIGURATION: Aucune URL API LMSE valide configurée pour l'environnement ${envMode}. Veuillez renseigner VITE_LMSE_API_URL.`);
  }

  public static setCustomApiUrl(url: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!url || !url.trim()) {
        window.localStorage.removeItem(this.STORAGE_KEY);
      } else {
        window.localStorage.setItem(this.STORAGE_KEY, url.trim().replace(/\/+$/, ''));
      }
    }
  }

  public static clearCustomApiUrl(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

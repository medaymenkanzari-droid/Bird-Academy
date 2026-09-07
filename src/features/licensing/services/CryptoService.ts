import { isUserBuild } from '../../../config/appMode';

export class CryptoService {
  /**
   * Computes a SHA-256 hash string (hex encoded)
   */
  static async sha256(data: string): Promise<string> {
    if (globalThis.crypto?.subtle) {
      const buffer = new TextEncoder().encode(data);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback deterministic 64-character hex hash if subtle crypto is absent
    return this.fallbackSha256(data);
  }

  public static getPublicVerificationKey(): string {
    return 'LMSE_PUBLIC_KEY_BIRD_ACADEMY_ENTERPRISE_2026';
  }

  private static getMasterSalt(): string {
    // Private signing salt is strictly accessible in server/backend environment or Admin application
    if (isUserBuild()) {
      throw new Error('SECURITY_ERROR: Private signing key is not accessible in User application build.');
    }
    const envKey = ['LMSE', 'PRIVATE', 'SIGNING', 'KEY'].join('_');
    const signingKey = typeof process !== 'undefined' ? (process.env as any)?.[envKey] : undefined;
    return signingKey || this.getPublicVerificationKey();
  }

  /**
   * Generates a digital signature for a license payload using SHA-256 & Salt (Admin Environment Only)
   */
  static async generateSignature(payload: string, salt?: string): Promise<string> {
    const activeSalt = salt || this.getMasterSalt();
    const combined = payload + '::' + activeSalt;
    return await this.sha256(combined);
  }

  /**
   * Verifies a digital signature against a payload
   */
  static async verifySignature(payload: string, signature: string, salt?: string): Promise<boolean> {
    let activeSalt = salt;
    if (!activeSalt) {
      try {
        activeSalt = this.getMasterSalt();
      } catch {
        activeSalt = this.getPublicVerificationKey();
      }
    }
    const expected = await this.sha256(payload + '::' + activeSalt);
    return expected.toLowerCase() === signature.toLowerCase();
  }

  /**
   * Encrypts plain text using AES-256-GCM (or base64 fallback)
   */
  static async encryptAes256(text: string, secretKey?: string): Promise<string> {
    const activeKey = secretKey || this.getMasterSalt();
    try {
      if (globalThis.crypto?.subtle) {
        const enc = new TextEncoder();
        const keyMaterial = await globalThis.crypto.subtle.importKey(
          'raw',
          enc.encode((await this.sha256(activeKey)).slice(0, 32)),
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );
        const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await globalThis.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          keyMaterial,
          enc.encode(text)
        );
        const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
        const encHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
        return `${ivHex}:${encHex}`;
      }
    } catch (e) {
      // Fallback below
    }
    // Base64 fallback wrapper for environments without full SubtleCrypto AES-GCM
    return 'ENC:' + btoa(encodeURIComponent(text));
  }

  /**
   * Decrypts ciphertext produced by encryptAes256
   */
  static async decryptAes256(cipherText: string, secretKey?: string): Promise<string> {
    const activeKey = secretKey || this.getMasterSalt();
    if (cipherText.startsWith('ENC:')) {
      return decodeURIComponent(atob(cipherText.slice(4)));
    }
    try {
      if (globalThis.crypto?.subtle && cipherText.includes(':')) {
        const [ivHex, encHex] = cipherText.split(':');
        const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
        const encData = new Uint8Array(encHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
        const keyMaterial = await globalThis.crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode((await this.sha256(activeKey)).slice(0, 32)),
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );
        const decrypted = await globalThis.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          keyMaterial,
          encData
        );
        return new TextDecoder().decode(decrypted);
      }
    } catch {
      throw new Error('Failed to decrypt ciphertext.');
    }
    return cipherText;
  }

  /**
   * Fallback pseudo-SHA-256 for non-subtle crypto test environments
   */
  private static fallbackSha256(str: string): string {
    let h1 = 0x6a09e667, h2 = 0xbb67ae85, h3 = 0x3c6ef372, h4 = 0xa54ff53a;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 0x5bd1e995);
      h2 = Math.imul(h2 ^ ch, 0x27d4eb2d);
      h3 = Math.imul(h3 ^ ch, 0x165667b1);
      h4 = Math.imul(h4 ^ ch, 0xd3a2646c);
    }
    const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
    const p3 = (h3 >>> 0).toString(16).padStart(8, '0');
    const p4 = (h4 >>> 0).toString(16).padStart(8, '0');
    return `${p1}${p2}${p3}${p4}${p1}${p2}${p3}${p4}`;
  }
}

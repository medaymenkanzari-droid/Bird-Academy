/**
 * Password-based encryption for portable Bird Academy backup files.
 *
 * AES-256-GCM provides authenticated encryption. The key is derived locally
 * from the user's password with PBKDF2-SHA-256; neither the password nor the
 * derived key is persisted in the backup.
 */

import { BackupBinaryCodec } from './BackupBinaryCodec';

export type BackupEncryptionErrorCode =
  | 'PASSWORD_REQUIRED'
  | 'PASSWORD_TOO_SHORT'
  | 'INVALID_ENVELOPE'
  | 'DECRYPTION_FAILED'
  | 'CRYPTO_UNAVAILABLE';

export class BackupEncryptionError extends Error {
  constructor(
    public readonly code: BackupEncryptionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BackupEncryptionError';
  }
}

export interface EncryptedBackupEnvelope {
  format: 'bird-academy-encrypted-backup';
  version: 1;
  encryption: {
    algorithm: 'AES-256-GCM';
    keyDerivation: 'PBKDF2-SHA-256';
    iterations: number;
    salt: string;
    iv: string;
    ciphertext: string;
  };
}

export class BackupEncryptionService {
  static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly ITERATIONS = 310_000;
  private static readonly ADDITIONAL_DATA = 'bird-academy-backup:v1';

  static isEncryptedEnvelope(value: unknown): value is EncryptedBackupEnvelope {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<EncryptedBackupEnvelope>;
    return candidate.format === 'bird-academy-encrypted-backup'
      && candidate.version === 1
      && candidate.encryption?.algorithm === 'AES-256-GCM'
      && candidate.encryption.keyDerivation === 'PBKDF2-SHA-256'
      && typeof candidate.encryption.iterations === 'number'
      && typeof candidate.encryption.salt === 'string'
      && typeof candidate.encryption.iv === 'string'
      && typeof candidate.encryption.ciphertext === 'string';
  }

  static async encrypt(plaintext: string, password: string): Promise<string> {
    this.validatePassword(password);
    const cryptoApi = this.getCrypto();
    const salt = cryptoApi.getRandomValues(new Uint8Array(16));
    const iv = cryptoApi.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt, this.ITERATIONS, ['encrypt']);
    const encoder = new TextEncoder();
    const ciphertext = await cryptoApi.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: encoder.encode(this.ADDITIONAL_DATA),
      },
      key,
      encoder.encode(plaintext),
    );

    const envelope: EncryptedBackupEnvelope = {
      format: 'bird-academy-encrypted-backup',
      version: 1,
      encryption: {
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2-SHA-256',
        iterations: this.ITERATIONS,
        salt: BackupBinaryCodec.bytesToBase64(salt),
        iv: BackupBinaryCodec.bytesToBase64(iv),
        ciphertext: BackupBinaryCodec.bytesToBase64(new Uint8Array(ciphertext)),
      },
    };

    return JSON.stringify(envelope, null, 2);
  }

  static async decrypt(envelope: EncryptedBackupEnvelope, password?: string): Promise<string> {
    if (!password) {
      throw new BackupEncryptionError(
        'PASSWORD_REQUIRED',
        'Cette sauvegarde est chiffrée. Saisissez son mot de passe.',
      );
    }

    const cryptoApi = this.getCrypto();
    try {
      const salt = BackupBinaryCodec.base64ToBytes(envelope.encryption.salt);
      const iv = BackupBinaryCodec.base64ToBytes(envelope.encryption.iv);
      const ciphertext = BackupBinaryCodec.base64ToBytes(envelope.encryption.ciphertext);
      const key = await this.deriveKey(
        password,
        salt,
        envelope.encryption.iterations,
        ['decrypt'],
      );
      const plaintext = await cryptoApi.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
          additionalData: new TextEncoder().encode(this.ADDITIONAL_DATA),
        },
        key,
        ciphertext,
      );
      return new TextDecoder().decode(plaintext);
    } catch (error) {
      if (error instanceof BackupEncryptionError) throw error;
      throw new BackupEncryptionError(
        'DECRYPTION_FAILED',
        'Mot de passe incorrect ou sauvegarde chiffrée endommagée.',
      );
    }
  }

  private static validatePassword(password?: string): asserts password is string {
    if (!password) {
      throw new BackupEncryptionError(
        'PASSWORD_REQUIRED',
        'Un mot de passe est obligatoire pour chiffrer la sauvegarde.',
      );
    }
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      throw new BackupEncryptionError(
        'PASSWORD_TOO_SHORT',
        `Le mot de passe doit contenir au moins ${this.MIN_PASSWORD_LENGTH} caractères.`,
      );
    }
  }

  private static getCrypto(): Crypto {
    if (!globalThis.crypto?.subtle) {
      throw new BackupEncryptionError(
        'CRYPTO_UNAVAILABLE',
        'Le chiffrement sécurisé Web Crypto n’est pas disponible sur cet appareil.',
      );
    }
    return globalThis.crypto;
  }

  private static async deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number,
    usages: KeyUsage[],
  ): Promise<CryptoKey> {
    if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 2_000_000) {
      throw new BackupEncryptionError(
        'INVALID_ENVELOPE',
        'Paramètres de chiffrement invalides.',
      );
    }
    const cryptoApi = this.getCrypto();
    const passwordMaterial = await cryptoApi.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey'],
    );
    return cryptoApi.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      passwordMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      usages,
    );
  }

}

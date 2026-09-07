/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Secure Password Hashing & Verification Utility for LMSE Admin Authentication
 */

import crypto from 'node:crypto';

export class PasswordCrypto {
  private static readonly SALT_BYTES = 16;
  private static readonly KEY_BYTES = 64;

  /**
   * Generates a random salt and scrypt hash for a raw password.
   */
  public static hashPassword(password: string): { hash: string; salt: string } {
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new Error('SECURITY_ERROR: Le mot de passe doit contenir au moins 8 caractères.');
    }

    const salt = crypto.randomBytes(PasswordCrypto.SALT_BYTES).toString('hex');
    const hashBuf = crypto.scryptSync(password, salt, PasswordCrypto.KEY_BYTES);
    const hash = hashBuf.toString('hex');

    return { hash, salt };
  }

  /**
   * Verifies a raw password against a stored scrypt hash and salt.
   */
  public static verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
    if (!password || !storedHash || !storedSalt) {
      return false;
    }

    try {
      const verifyHashBuf = crypto.scryptSync(password, storedSalt, PasswordCrypto.KEY_BYTES);
      const storedHashBuf = Buffer.from(storedHash, 'hex');

      if (verifyHashBuf.length !== storedHashBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(verifyHashBuf, storedHashBuf);
    } catch {
      return false;
    }
  }
}

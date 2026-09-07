/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class SecurityEngine {
  private static SIGNATURE_SALT = 'birdacademy_enterprise_secure_salt_2026';

  /**
   * Generates a cryptographic SHA-256 checksum of a string.
   */
  static async generateChecksum(content: string): Promise<string> {
    if (!globalThis.crypto?.subtle) {
      throw new Error('SHA-256 is not available on this device.');
    }
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(content),
    );
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Historical checksum retained strictly to verify pre-SHA-256 backups.
   */
  private static generateLegacyChecksum(content: string): string {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0, ch; i < content.length; i++) {
      ch = content.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `${hex1}${hex2}`;
  }

  /**
   * Appends a local security signature to the payload
   */
  static async signPayload(data: Record<string, any>): Promise<Record<string, any>> {
    const serialized = JSON.stringify(data);
    const checksum = await this.generateChecksum(serialized);
    const signature = await this.generateChecksum(serialized + this.SIGNATURE_SALT);
    
    return {
      payload: data,
      security: {
        checksum,
        signature,
        algorithm: 'SHA-256',
        signedAt: new Date().toISOString(),
        version: '1.2'
      }
    };
  }

  /**
   * Verifies the local cryptographic signature and checksum of an imported file
   */
  static async verifyPayloadSignature(
    signedPayload: Record<string, any>,
  ): Promise<{ isValid: boolean; reason?: string }> {
    if (!signedPayload || typeof signedPayload !== 'object') {
      return { isValid: false, reason: 'Payload is not an object.' };
    }

    // If no security envelope is present, it's an unsigned standard backup
    if (!signedPayload.security || !signedPayload.payload) {
      return { isValid: false, reason: 'Missing security signature envelope.' };
    }

    const { checksum, signature, algorithm } = signedPayload.security;
    const serializedPayload = JSON.stringify(signedPayload.payload);

    if (algorithm !== undefined && algorithm !== 'SHA-256') {
      return { isValid: false, reason: `Unsupported security algorithm: ${String(algorithm)}.` };
    }

    const usesSha256 = algorithm === 'SHA-256';
    const computedChecksum = usesSha256
      ? await this.generateChecksum(serializedPayload)
      : this.generateLegacyChecksum(serializedPayload);
    const computedSignature = usesSha256
      ? await this.generateChecksum(serializedPayload + this.SIGNATURE_SALT)
      : this.generateLegacyChecksum(serializedPayload + this.SIGNATURE_SALT);

    if (checksum !== computedChecksum) {
      return { isValid: false, reason: 'Checksum mismatch. Data might be corrupted or truncated.' };
    }

    if (signature !== computedSignature) {
      return { isValid: false, reason: 'Invalid security signature. File may have been tampered with.' };
    }

    return { isValid: true };
  }

  /**
   * Validates if a string is a valid JSON and conforms to the database format
   */
  static validateJsonBackup(rawString: string): { isValid: boolean; error?: string; parsedData?: Record<string, any> } {
    try {
      const data = JSON.parse(rawString);
      if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'JSON does not contain a root object.' };
      }
      
      // Check standard keys (either root-level for legacy or payload-level for signed)
      const target = data.payload || data;

      const manifest = target.__backup;
      const isSelectiveBackup = manifest?.schema === 'bird-academy-backup'
        && manifest.type === 'selective'
        && Array.isArray(manifest.includedTables);

      if (!isSelectiveBackup) {
        const requiredCollections = ['canaris', 'cages'];
        for (const col of requiredCollections) {
          if (!(col in target)) {
            return { isValid: false, error: `Missing required database collections: ${col}` };
          }
        }
      }

      return { isValid: true, parsedData: data };
    } catch (e) {
      return { isValid: false, error: `JSON Parse Error: ${(e as Error).message}` };
    }
  }

  /**
   * Detects physical corruption in raw backup contents
   */
  static detectCorruption(rawString: string): { isCorrupted: boolean; anomalies: string[] } {
    const anomalies: string[] = [];
    
    if (rawString.trim() === '') {
      anomalies.push('Empty file content');
    }

    // Brackets check
    const trimmed = rawString.trim();
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      anomalies.push('Incomplete JSON structure (missing opening/closing braces)');
    }

    // Binary / null byte detection (indicating compressed or corrupted text files)
    if (rawString.includes('\u0000') || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(rawString)) {
      anomalies.push('Binary or invalid control characters detected');
    }

    return {
      isCorrupted: anomalies.length > 0,
      anomalies
    };
  }
}

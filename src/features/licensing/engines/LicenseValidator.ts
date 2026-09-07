/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, LicenseValidationResult, DeviceFingerprint } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';
import { LicenseEntity } from '../domain/entities/License';
import { KeyValidator } from '../validators/KeyValidator';

export class LicenseValidator {
  /**
   * Complete multi-tier evaluation of a license object and key against system state
   */
  static async validateLicense(
    license: License | null,
    currentDevice: DeviceFingerprint,
    revocationList: string[] = [],
    lastTimeMarker?: string | null,
    now: Date = new Date()
  ): Promise<LicenseValidationResult> {
    if (!license) {
      return {
        isValid: false,
        status: 'pending_activation',
        license: null,
        code: 'NO_LICENSE',
        message: 'Aucune licence enregistrée.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    const entity = new LicenseEntity(license);

    // 1. Key format validation
    const keyCheck = KeyValidator.validateFormat(license.key);
    if (!keyCheck.isValid) {
      return {
        isValid: false,
        status: 'suspended',
        license,
        code: 'INVALID_KEY_FORMAT',
        message: keyCheck.error || 'Format de clé invalide.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 2. Cryptographic signature check
    const payloadToSign = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}`;
    const computedChecksum = await CryptoService.sha256(payloadToSign);
    const checksumValid = computedChecksum.toLowerCase() === license.checksum.toLowerCase();
    const signatureValid = await CryptoService.verifySignature(computedChecksum, license.signature);
    
    if (!checksumValid || !signatureValid) {
      return {
        isValid: false,
        status: 'suspended',
        license,
        code: 'CORRUPTED',
        message: 'Intégrité compromise : la signature numérique ou le checksum est invalide.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 2.5. Suspended status check
    if (license.status === 'suspended') {
      return {
        isValid: false,
        status: 'suspended',
        license,
        code: 'LICENSE_SUSPENDED',
        message: 'La licence a été suspendue administrativement.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    // 2.6. Replaced status check (Terminal state)
    if (license.status === 'replaced') {
      return {
        isValid: false,
        status: 'replaced',
        license,
        code: 'LICENSE_REPLACED',
        message: 'Cette licence a été remplacée par une nouvelle licence.',
        remainingDays: 0,
        deviceRegistered: false,
      };
    }

    // 3. Revocation check
    const isRevokedInList = revocationList.some(
      r => r.toUpperCase() === license.key.toUpperCase() || r.toUpperCase() === license.checksum.toUpperCase()
    );
    if (entity.isRevoked() || isRevokedInList) {
      return {
        isValid: false,
        status: 'revoked',
        license,
        code: 'LICENSE_REVOKED',
        message: `Licence révoquée. ${license.revocationReason || ''}`,
        remainingDays: 0,
        deviceRegistered: false,
      };
    }

    // 4. Anti-Clock-Tamper check
    if (lastTimeMarker) {
      const lastTime = new Date(lastTimeMarker).getTime();
      // Allow max 10 minute backward skew for timezone shifts or small clock updates
      if (now.getTime() < lastTime - 10 * 60 * 1000) {
        return {
          isValid: false,
          status: 'suspended',
          license,
          code: 'CLOCK_TAMPERED',
          message: 'Hacker/Rollback d\'horloge détecté. L\'horloge système est antérieure au dernier contrôle enregistré.',
          remainingDays: null,
          deviceRegistered: false,
        };
      }
    }

    // 5. Expiration check
    const remainingDays = entity.remainingDays(now);
    if (entity.isExpired(now)) {
      return {
        isValid: false,
        status: 'expired',
        license,
        code: 'EXPIRED',
        message: 'La licence a expiré.',
        remainingDays: 0,
        deviceRegistered: entity.isDeviceRegistered(currentDevice.deviceId),
      };
    }

    // 6. Device registration check
    const isRegistered = entity.isDeviceRegistered(currentDevice.deviceId);

    return {
      isValid: true,
      status: entity.status === 'trial' ? 'trial' : 'active',
      license,
      code: 'VALID',
      message: 'Licence valide et active.',
      remainingDays,
      deviceRegistered: isRegistered,
    };
  }
}

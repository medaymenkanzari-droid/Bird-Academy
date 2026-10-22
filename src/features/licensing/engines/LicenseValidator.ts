/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, LicenseValidationResult, DeviceFingerprint } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';
import { LicenseEntity } from '../domain/entities/License';
import { KeyValidator } from '../validators/KeyValidator';
import { ActivationCanonicalizer } from './ActivationCanonicalizer';

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
        evaluatedState: 'INVALID',
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
        evaluatedState: 'INVALID',
      };
    }

    // 2. Cryptographic signature & activations check
    if (ActivationCanonicalizer.hasDuplicates(license.activations)) {
      return {
        isValid: false,
        status: 'suspended',
        license,
        code: 'CORRUPTED',
        message: 'Intégrité compromise : activations dupliquées détectées.',
        remainingDays: null,
        deviceRegistered: false,
        evaluatedState: 'INVALID',
      };
    }

    let checksumValid = false;
    let signatureValid = false;

    // Check 1: 8-field canonical payload (with current activations or authenticatedActivations)
    const signedActs = Array.isArray(license.metadata?.authenticatedActivations)
      ? license.metadata.authenticatedActivations
      : license.activations;

    const actHash = await ActivationCanonicalizer.computeHash(signedActs);
    const payload8 = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}:${actHash}`;
    const computedChecksum8 = await CryptoService.sha256(payload8);

    if (computedChecksum8.toLowerCase() === license.checksum.toLowerCase()) {
      checksumValid = true;
      signatureValid = await CryptoService.verifySignature(computedChecksum8, license.signature);
    } else {
      // Check 2: 8-field canonical payload with empty activations (freshly issued license activated on device)
      const actHashEmpty = await ActivationCanonicalizer.computeHash([]);
      const payload8Empty = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}:${actHashEmpty}`;
      const computedChecksum8Empty = await CryptoService.sha256(payload8Empty);

      if (computedChecksum8Empty.toLowerCase() === license.checksum.toLowerCase()) {
        checksumValid = true;
        signatureValid = await CryptoService.verifySignature(computedChecksum8Empty, license.signature);
      } else {
        // Check 3: Fallback for legacy 7-field payload
        const payload7 = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}`;
        const computedChecksum7 = await CryptoService.sha256(payload7);
        if (computedChecksum7.toLowerCase() === license.checksum.toLowerCase()) {
          checksumValid = true;
          signatureValid = await CryptoService.verifySignature(computedChecksum7, license.signature);
        }
      }
    }

    if (!checksumValid || !signatureValid) {
      return {
        isValid: false,
        status: 'suspended',
        license,
        code: 'CORRUPTED',
        message: 'Intégrité compromise : la signature numérique ou le checksum est invalide.',
        remainingDays: null,
        deviceRegistered: false,
        evaluatedState: 'INVALID',
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
        evaluatedState: 'INVALID',
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
        evaluatedState: 'INVALID',
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
        evaluatedState: 'INVALID',
      };
    }

    // 4. Anti-Clock-Tamper check (Hardened multi-anchor verification)
    let baselineTimestamp: number | null = null;
    let baselineSource = '';

    if (lastTimeMarker) {
      const parsedLastTime = new Date(lastTimeMarker).getTime();
      if (!isNaN(parsedLastTime)) {
        baselineTimestamp = parsedLastTime;
        baselineSource = 'dernier contrôle enregistré';
      }
    }

    // Fallback or supplementary anchors embedded inside the signed license:
    // 4.1. Issuance date anchor: A valid license cannot legitimately execute prior to its issuance date
    if (license.issuedAt) {
      const issuedTime = new Date(license.issuedAt).getTime();
      if (!isNaN(issuedTime)) {
        if (baselineTimestamp === null || issuedTime > baselineTimestamp) {
          baselineTimestamp = issuedTime;
          baselineSource = "date d'émission de la licence";
        }
      }
    }

    // 4.2. Activations anchor: Check prior activation and verification timestamps recorded on this license
    if (Array.isArray(license.activations)) {
      for (const act of license.activations) {
        if (act.lastVerifiedAt) {
          const verifiedTime = new Date(act.lastVerifiedAt).getTime();
          if (!isNaN(verifiedTime) && (baselineTimestamp === null || verifiedTime > baselineTimestamp)) {
            baselineTimestamp = verifiedTime;
            baselineSource = "dernier horodatage d'activité";
          }
        }
        if (act.activatedAt) {
          const actTime = new Date(act.activatedAt).getTime();
          if (!isNaN(actTime) && (baselineTimestamp === null || actTime > baselineTimestamp)) {
            baselineTimestamp = actTime;
            baselineSource = "date d'activation de la licence";
          }
        }
      }
    }

    // Allow max 10 minute backward skew for timezone shifts or small clock updates
    if (baselineTimestamp !== null && now.getTime() < baselineTimestamp - 10 * 60 * 1000) {
      return {
        isValid: false,
        status: 'suspended',
        license,
        code: 'CLOCK_TAMPERED',
        message: `Altération de l'horloge système détectée. L'horloge système est antérieure à la référence (${baselineSource}).`,
        remainingDays: null,
        deviceRegistered: false,
        evaluatedState: 'INVALID',
      };
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
        evaluatedState: 'EXPIRED',
      };
    }

    // 6. Device registration check
    const isRegistered = entity.isDeviceRegistered(currentDevice.deviceId);

    const evaluatedState = (remainingDays !== null && remainingDays <= 7 && remainingDays >= 0)
      ? 'EXPIRING_SOON'
      : 'VALID';

    return {
      isValid: true,
      status: entity.status === 'trial' ? 'trial' : 'active',
      license,
      code: 'VALID',
      message: 'Licence valide et active.',
      remainingDays,
      deviceRegistered: isRegistered,
      evaluatedState,
    };
  }

  /**
   * Deterministically evaluates the 4-state commercial qualification:
   * VALID | EXPIRING_SOON | EXPIRED | INVALID
   */
  static evaluateStatus(result: LicenseValidationResult): 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'INVALID' {
    if (result.evaluatedState) {
      return result.evaluatedState;
    }
    if (!result.isValid) {
      if (result.code === 'EXPIRED') return 'EXPIRED';
      return 'INVALID';
    }
    if (result.remainingDays !== null && result.remainingDays <= 7 && result.remainingDays >= 0) {
      return 'EXPIRING_SOON';
    }
    return 'VALID';
  }

  /**
   * Alias for evaluateStatus providing exact compliance with evaluateState contract.
   */
  static evaluateState(result: LicenseValidationResult): 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'INVALID' {
    return this.evaluateStatus(result);
  }
}

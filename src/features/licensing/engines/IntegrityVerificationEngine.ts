/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';
import { ActivationCanonicalizer } from './ActivationCanonicalizer';

export interface IntegrityCheckResult {
  isHealthy: boolean;
  tamperDetected: boolean;
  clockRollbackDetected: boolean;
  checksumValid: boolean;
  signatureValid: boolean;
  issues: string[];
}

export class IntegrityVerificationEngine {
  /**
   * Performs an anti-tampering integrity audit on the license payload and system environment
   */
  static async checkIntegrity(
    license: License | null,
    lastKnownTimeMarker?: string | null,
    now: Date = new Date()
  ): Promise<IntegrityCheckResult> {
    const issues: string[] = [];
    let tamperDetected = false;
    let clockRollbackDetected = false;
    let checksumValid = true;
    let signatureValid = true;

    if (!license) {
      return {
        isHealthy: true,
        tamperDetected: false,
        clockRollbackDetected: false,
        checksumValid: true,
        signatureValid: true,
        issues: [],
      };
    }

    // 0. Check Duplicate Activations
    if (ActivationCanonicalizer.hasDuplicates(license.activations)) {
      checksumValid = false;
      tamperDetected = true;
      issues.push('Activations dupliquées détectées dans l\'historique d\'activation.');
    }

    // 1. Check Payload Checksum
    let computedChecksum = '';
    let isChecksumMatch = false;

    const signedActs = Array.isArray(license.metadata?.authenticatedActivations)
      ? license.metadata.authenticatedActivations
      : license.activations;

    const actHash = await ActivationCanonicalizer.computeHash(signedActs);
    const payload8 = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}:${actHash}`;
    const checksum8 = await CryptoService.sha256(payload8);

    if (checksum8.toLowerCase() === license.checksum.toLowerCase()) {
      computedChecksum = checksum8;
      isChecksumMatch = true;
    } else {
      const actHashEmpty = await ActivationCanonicalizer.computeHash([]);
      const payload8Empty = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}:${actHashEmpty}`;
      const checksum8Empty = await CryptoService.sha256(payload8Empty);
      if (checksum8Empty.toLowerCase() === license.checksum.toLowerCase()) {
        computedChecksum = checksum8Empty;
        isChecksumMatch = true;
      } else {
        const payload7 = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}`;
        const checksum7 = await CryptoService.sha256(payload7);
        if (checksum7.toLowerCase() === license.checksum.toLowerCase()) {
          computedChecksum = checksum7;
          isChecksumMatch = true;
        }
      }
    }

    if (!isChecksumMatch) {
      checksumValid = false;
      tamperDetected = true;
      issues.push('Checksum mismatch: Le contenu de la licence ou de ses activations a été altéré manuellement.');
    }

    // 2. Check Digital Signature
    if (computedChecksum) {
      const isSigOk = await CryptoService.verifySignature(computedChecksum, license.signature);
      if (!isSigOk) {
        signatureValid = false;
        tamperDetected = true;
        issues.push('Signature numérique invalide: Échec de la vérification cryptographique.');
      }
    } else {
      signatureValid = false;
      tamperDetected = true;
      issues.push('Signature numérique invalide: Checksum indisponible pour vérification.');
    }

    // 3. Anti-Clock-Rollback Check
    if (lastKnownTimeMarker) {
      const lastTime = new Date(lastKnownTimeMarker).getTime();
      // Allow 10 minute tolerance for minor drift/timezone updates
      if (now.getTime() < lastTime - 10 * 60 * 1000) {
        clockRollbackDetected = true;
        tamperDetected = true;
        issues.push('Détection de rollback d\'horloge système (modification suspecte de la date).');
      }
    }

    return {
      isHealthy: !tamperDetected && issues.length === 0,
      tamperDetected,
      clockRollbackDetected,
      checksumValid,
      signatureValid,
      issues,
    };
  }
}

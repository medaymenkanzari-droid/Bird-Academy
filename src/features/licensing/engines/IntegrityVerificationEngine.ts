/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';

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

    // 1. Check Payload Checksum
    const payloadToSign = `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.policy.maxDevices}`;
    const computedChecksum = await CryptoService.sha256(payloadToSign);
    if (computedChecksum.toLowerCase() !== license.checksum.toLowerCase()) {
      checksumValid = false;
      tamperDetected = true;
      issues.push('Checksum mismatch: Le contenu de la licence a été altéré manuellement.');
    }

    // 2. Check Digital Signature
    const isSigOk = await CryptoService.verifySignature(computedChecksum, license.signature);
    if (!isSigOk) {
      signatureValid = false;
      tamperDetected = true;
      issues.push('Signature numérique invalide: Échec de la vérification cryptographique.');
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

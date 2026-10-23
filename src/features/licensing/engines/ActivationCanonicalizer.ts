/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — ACTIVATION CANONICALIZER
 * Cryptographic canonicalization and verification engine for license device activations.
 * Guarantees tamper-proofing, deterministic ordering, and integrity verification.
 */

import { ActivationRecord } from '../types/licensing';
import { CryptoService } from '../services/CryptoService';

export class ActivationCanonicalizer {
  /**
   * Deterministically canonicalizes a single activation record.
   * Format: actId|licenseId|licenseKey|deviceId|os|activatedAt|lastVerifiedAt
   */
  public static canonicalizeRecord(act: ActivationRecord): string {
    const actId = (act.id || '').trim();
    const licId = (act.licenseId || '').trim();
    const licKey = (act.licenseKey || '').trim().toUpperCase();
    const deviceId = (act.fingerprint?.deviceId || '').trim();
    const os = (act.fingerprint?.os || '').trim();
    const actAt = (act.activatedAt || '').trim();
    const verAt = (act.lastVerifiedAt || '').trim();

    return `${actId}|${licId}|${licKey}|${deviceId}|${os}|${actAt}|${verAt}`;
  }

  /**
   * Detects duplicate activations by record ID or by deviceId.
   */
  public static hasDuplicates(activations?: ActivationRecord[] | null): boolean {
    if (!activations || activations.length <= 1) return false;

    const seenIds = new Set<string>();
    const seenDevices = new Set<string>();

    for (const act of activations) {
      if (act.id) {
        if (seenIds.has(act.id)) return true;
        seenIds.add(act.id);
      }
      if (act.fingerprint?.deviceId) {
        if (seenDevices.has(act.fingerprint.deviceId)) return true;
        seenDevices.add(act.fingerprint.deviceId);
      }
    }
    return false;
  }

  /**
   * Produces a deterministic canonical representation of the activation list.
   * If empty or undefined, returns 'EMPTY'.
   * If non-empty, sorts records lexicographically by their canonical string, then joins with ';;'.
   */
  public static canonicalize(activations?: ActivationRecord[] | null): string {
    if (!activations || activations.length === 0) {
      return 'EMPTY';
    }

    // Sort deterministically to make order irrelevant (Test G: array reordering is deterministic & safe)
    const sorted = [...activations].sort((a, b) => {
      const strA = this.canonicalizeRecord(a);
      const strB = this.canonicalizeRecord(b);
      return strA.localeCompare(strB);
    });

    return sorted.map(a => this.canonicalizeRecord(a)).join(';;');
  }

  /**
   * Computes the SHA-256 hash of the canonical activations string.
   */
  public static async computeHash(activations?: ActivationRecord[] | null): Promise<string> {
    const canonicalStr = this.canonicalize(activations);
    return await CryptoService.sha256(`CANONICAL_ACTIVATIONS::${canonicalStr}`);
  }

  /**
   * Builds the official 8-field payloadToSign string incorporating the canonical activations hash.
   */
  public static async computePayload(
    license: {
      id: string;
      key: string;
      holderName: string;
      type: string;
      issuedAt: string;
      expiresAt?: string | null;
      maxDevices: number;
    },
    activations?: ActivationRecord[] | null
  ): Promise<string> {
    const actHash = await this.computeHash(activations);
    return `${license.id}:${license.key}:${license.holderName}:${license.type}:${license.issuedAt}:${license.expiresAt || 'NEVER'}:${license.maxDevices}:${actHash}`;
  }
}

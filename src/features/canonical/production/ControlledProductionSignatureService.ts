/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service de Signature HMAC-SHA256 pour CONTROLLED_PRODUCTION
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-16
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Signature cryptographique déterministe liant exactement 11 paramètres clés.
 * 2. Invalidation immédiate si un seul champ est altéré.
 * 3. Vérification contre le stockage physique LevelDB réel.
 */

import { ControlledCrypto } from '../controlled/cryptoUtils';
import { CanonicalFingerprintBinding } from '../controlled/CanonicalFingerprintBinding';
import type { ControlledProductionAuthorization } from './types';

export interface ProductionSignaturePayloadParams {
  operatorId: string;
  authorizationId: string;
  realFingerprint: string;
  manifestHash: string;
  protocolVersion: string;
  contractVersion: string;
  catalogVersion: string;
  calculatorVersion: string;
  scope: string;
  nonce: string;
  auditSessionId: string;
}

export class ControlledProductionSignatureService {
  private static readonly SECRET_SALT = 'BIRD_ACADEMY_ENTERPRISE_CONTROLLED_PRODUCTION_SALT_V16';

  /**
   * Construit la chaîne canonique scellée liant les 11 champs requis par Section 9.
   */
  public static buildSignaturePayload(params: ProductionSignaturePayloadParams): string {
    return [
      `OPERATOR=${params.operatorId}`,
      `AUTH_ID=${params.authorizationId}`,
      `FINGERPRINT=${params.realFingerprint.toLowerCase()}`,
      `MANIFEST_HASH=${params.manifestHash}`,
      `PROTOCOL=${params.protocolVersion}`,
      `CONTRACT=${params.contractVersion}`,
      `CATALOG=${params.catalogVersion}`,
      `CALCULATOR=${params.calculatorVersion}`,
      `SCOPE=${params.scope}`,
      `NONCE=${params.nonce}`,
      `AUDIT_SESSION=${params.auditSessionId}`
    ].join('||');
  }

  /**
   * Génère la signature HMAC-SHA256 pour l'autorisation de production.
   */
  public static generateSignature(params: ProductionSignaturePayloadParams): string {
    // Vérification du fingerprint physique réel
    const check = CanonicalFingerprintBinding.verifyCandidateAgainstRealStorage(params.realFingerprint);
    if (!check.matched) {
      throw new Error(`SIGNATURE_REFUSED_STORAGE_MISMATCH: ${check.error}`);
    }

    const payload = this.buildSignaturePayload(params);
    return ControlledCrypto.hmacSha256Hex(this.SECRET_SALT, payload);
  }

  /**
   * Valide la signature de l'autorisation de production.
   */
  public static verifySignature(auth: ControlledProductionAuthorization): {
    valid: boolean;
    storageMatches: boolean;
    signatureMatches: boolean;
    error?: string;
  } {
    if (!auth.signature || auth.signature.trim() === '') {
      return {
        valid: false,
        storageMatches: false,
        signatureMatches: false,
        error: 'SIGNATURE_MISSING: Aucune signature opérateur présente dans l\'autorisation.'
      };
    }

    // 1. Vérification que le fingerprint dans l'autorisation correspond au vrai LevelDB
    const storageCheck = CanonicalFingerprintBinding.verifyCandidateAgainstRealStorage(auth.realFingerprint);
    if (!storageCheck.matched) {
      return {
        valid: false,
        storageMatches: false,
        signatureMatches: false,
        error: `SIGNATURE_INVALID_STORAGE_MISMATCH: L'autorisation a été liée à un fingerprint (${auth.realFingerprint}) non conforme au stockage physique réel.`
      };
    }

    // 2. Recalcul déterministe de la signature attendue
    const expectedPayload = this.buildSignaturePayload({
      operatorId: auth.operatorId,
      authorizationId: auth.authorizationId,
      realFingerprint: storageCheck.realFingerprint,
      manifestHash: auth.manifestHash || '',
      protocolVersion: auth.protocolVersion,
      contractVersion: auth.contractVersion,
      catalogVersion: auth.catalogVersion,
      calculatorVersion: auth.calculatorVersion,
      scope: auth.scope,
      nonce: auth.nonce,
      auditSessionId: auth.auditSessionId
    });

    const expectedSignature = ControlledCrypto.hmacSha256Hex(this.SECRET_SALT, expectedPayload);
    const signatureMatches = auth.signature.trim().toLowerCase() === expectedSignature.trim().toLowerCase();

    if (!signatureMatches) {
      return {
        valid: false,
        storageMatches: true,
        signatureMatches: false,
        error: 'SIGNATURE_INVALID: La signature HMAC-SHA256 ne correspond pas aux 11 champs canoniques requis.'
      };
    }

    return {
      valid: true,
      storageMatches: true,
      signatureMatches: true
    };
  }
}

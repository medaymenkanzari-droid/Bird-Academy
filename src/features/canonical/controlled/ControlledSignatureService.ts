/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service de Signature Opérateur et Validation Cryptographique (ControlledSignatureService)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-13
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Signature cryptographique/déterministe liée au fingerprint physique réel.
 * 2. Rejet immédiat de toute signature issue d'un fingerprint falsifié ou externe.
 * 3. Protection anti-contournement (SIGNATURE_BYPASS) et anti-rejeu.
 */

import { ControlledCrypto } from './cryptoUtils';
import type { ControlledActivationAuthorization } from './types';
import { CanonicalFingerprintBinding } from './CanonicalFingerprintBinding';
import { ColorGeneticsFeatureFlag } from '../ColorGeneticsFeatureFlag';

export class ControlledSignatureService {
  private static readonly SECRET_SALT = 'BIRD_ACADEMY_ENTERPRISE_CONTROLLED_ACTIVATION_SALT_V2';

  /**
   * Construit la chaîne canonique de signature.
   */
  public static buildSignaturePayload(auth: {
    authorizationId: string;
    realStorageFingerprint: string;
    contractVersion: string;
    catalogVersion: string;
    calculatorVersion: string;
    auditSessionId: string;
    operatorId: string;
    signedAt: string;
    activationScope: string;
    manifestHash: string;
    nonce: string;
  }): string {
    return [
      `AUTH_ID=${auth.authorizationId}`,
      `FINGERPRINT=${auth.realStorageFingerprint.toLowerCase()}`,
      `CONTRACT=${auth.contractVersion}`,
      `CATALOG=${auth.catalogVersion}`,
      `CALCULATOR=${auth.calculatorVersion}`,
      `AUDIT_SESSION=${auth.auditSessionId}`,
      `OPERATOR=${auth.operatorId}`,
      `SIGNED_AT=${auth.signedAt}`,
      `SCOPE=${auth.activationScope}`,
      `MANIFEST_HASH=${auth.manifestHash}`,
      `NONCE=${auth.nonce}`
    ].join('||');
  }

  /**
   * Génère la signature de l'opérateur pour une demande d'autorisation.
   */
  public static generateOperatorSignature(params: {
    authorizationId: string;
    realStorageFingerprint: string;
    contractVersion: string;
    catalogVersion: string;
    calculatorVersion: string;
    auditSessionId: string;
    operatorId: string;
    signedAt: string;
    activationScope: string;
    manifestHash: string;
    nonce: string;
  }): string {
    // Vérification préalable que le fingerprint est conforme au stockage réel
    const check = CanonicalFingerprintBinding.verifyCandidateAgainstRealStorage(params.realStorageFingerprint);
    if (!check.matched) {
      throw new Error(`SIGNATURE_REFUSED_STORAGE_MISMATCH: ${check.error}`);
    }

    const payload = this.buildSignaturePayload(params);
    return ControlledCrypto.hmacSha256Hex(this.SECRET_SALT, payload);
  }

  /**
   * Vérifie formellement la signature de l'opérateur et sa liaison au stockage réel.
   */
  public static verifySignature(auth: ControlledActivationAuthorization): {
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
    const storageCheck = CanonicalFingerprintBinding.verifyCandidateAgainstRealStorage(auth.authorizedStorageFingerprint);
    if (!storageCheck.matched) {
      return {
        valid: false,
        storageMatches: false,
        signatureMatches: false,
        error: `SIGNATURE_INVALID_STORAGE_MISMATCH: L'autorisation a été liée à un fingerprint (${auth.authorizedStorageFingerprint}) qui ne correspond pas au stockage réel (${storageCheck.realFingerprint}).`
      };
    }

    // 2. Recalcul de la signature attendue
    const expectedPayload = this.buildSignaturePayload({
      authorizationId: auth.authorizationId,
      realStorageFingerprint: storageCheck.realFingerprint,
      contractVersion: auth.contractVersion,
      catalogVersion: auth.catalogVersion,
      calculatorVersion: auth.calculatorVersion,
      auditSessionId: auth.auditSessionId,
      operatorId: auth.operatorId,
      signedAt: auth.signedAt || '',
      activationScope: auth.activationScope,
      manifestHash: auth.manifestHash || '',
      nonce: auth.nonce
    });

    const expectedSignature = ControlledCrypto.hmacSha256Hex(this.SECRET_SALT, expectedPayload);

    const signatureMatches = auth.signature.trim().toLowerCase() === expectedSignature.trim().toLowerCase();

    if (!signatureMatches) {
      return {
        valid: false,
        storageMatches: true,
        signatureMatches: false,
        error: 'SIGNATURE_FORGED_OR_INVALID: La signature fournie ne correspond pas au digest cryptographique calculé.'
      };
    }

    return {
      valid: true,
      storageMatches: true,
      signatureMatches: true
    };
  }
}

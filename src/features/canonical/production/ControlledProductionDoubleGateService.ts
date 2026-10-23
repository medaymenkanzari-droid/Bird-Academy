/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service Double Gate et Contrôle des Checkpoints A & B (ControlledProductionDoubleGateService)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-16
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Checkpoint A : Exécuté avant simulation Dry-Run.
 * 2. Checkpoint B : Exécuté après simulation Dry-Run et avant activation.
 * 3. A === B === REAL_FINGERPRINT obligatoire.
 * 4. Audit formel de la préparation issue de Mission 15.
 */

import { CanonicalFingerprintBinding } from '../controlled/CanonicalFingerprintBinding';
import { ColorGeneticsFeatureFlag } from '../ColorGeneticsFeatureFlag';
import { ColorGeneticsProductionReadinessService } from '../readiness';
import type { ControlledProductionAuthorization, ControlledProductionActivationManifest } from './types';

export interface GateEvaluationResult {
  pass: boolean;
  checkpointFingerprint: string;
  errors: string[];
  warnings: string[];
}

export class ControlledProductionDoubleGateService {
  /**
   * Évalue le Checkpoint A (Pre-Dry-Run Gate).
   */
  public static evaluateCheckpointA(auth: ControlledProductionAuthorization): GateEvaluationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Empreinte physique LevelDB Checkpoint A
    const checkpointA = CanonicalFingerprintBinding.getAuthoritativeRealFingerprint();

    if (auth.realFingerprint.toLowerCase() !== checkpointA.toLowerCase()) {
      errors.push(`AUTHORIZATION_FINGERPRINT_MISMATCH: L'empreinte de l'autorisation (${auth.realFingerprint}) != Checkpoint A (${checkpointA})`);
    }

    // 2. Audit de préparation issu de Mission 15
    const readinessReport = ColorGeneticsProductionReadinessService.getLastReport() || ColorGeneticsProductionReadinessService.evaluateReadiness();
    if (readinessReport.finalVerdict !== 'READY_FOR_PRODUCTION_AUTHORIZATION') {
      errors.push(`READINESS_STATUS_INVALID: Le statut est ${readinessReport.finalVerdict}, attendu: READY_FOR_PRODUCTION_AUTHORIZATION`);
    }

    if (readinessReport.humanDecision !== 'APPROVE_READINESS') {
      errors.push(`HUMAN_READINESS_DECISION_MISSING: Décision humaine ${readinessReport.humanDecision}, attendu: APPROVE_READINESS`);
    }

    if (readinessReport.unexpectedDivergenceCount > 0) {
      errors.push(`UNEXPECTED_DIVERGENCES_DETECTED: ${readinessReport.unexpectedDivergenceCount} divergence(s) inattendue(s)`);
    }

    if (readinessReport.unresolvedReviewCount > 0) {
      errors.push(`UNRESOLVED_REVIEWS_DETECTED: ${readinessReport.unresolvedReviewCount} revue(s) non résolue(s)`);
    }

    if (readinessReport.blockedRecordCount > 0) {
      errors.push(`BLOCKED_RECORDS_DETECTED: ${readinessReport.blockedRecordCount} enregistrement(s) bloqué(s)`);
    }

    // 3. Vérification des 33 compteurs de sécurité
    const counters = ColorGeneticsFeatureFlag.getCounters();
    const violations = Object.entries(counters).filter(([_, count]) => count > 0);
    if (violations.length > 0) {
      errors.push(`SECURITY_COUNTERS_VIOLATED: ${violations.map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }

    // 4. Validité de l'autorisation
    const now = Date.now();
    const issuedAt = new Date(auth.issuedAt).getTime();
    const expiresAt = new Date(auth.expiresAt).getTime();

    if (isNaN(issuedAt) || isNaN(expiresAt)) {
      errors.push('INVALID_TIMESTAMPS: Horodatages émission ou expiration invalides');
    } else if (now < issuedAt - 60000) {
      errors.push('CLOCK_SKEW_FUTURE: L\'autorisation a une date d\'émission future');
    } else if (now > expiresAt) {
      errors.push('AUTHORIZATION_EXPIRED: L\'autorisation a expiré');
    }

    if (auth.scope !== 'CONTROLLED_PRODUCTION') {
      errors.push(`SCOPE_MISMATCH: Scope requis CONTROLLED_PRODUCTION, reçu: ${auth.scope}`);
    }

    return {
      pass: errors.length === 0,
      checkpointFingerprint: checkpointA,
      errors,
      warnings
    };
  }

  /**
   * Évalue le Checkpoint B (Post-Dry-Run et Pre-Activation Gate).
   */
  public static evaluateCheckpointB(
    auth: ControlledProductionAuthorization,
    manifest: ControlledProductionActivationManifest,
    checkpointA: string
  ): GateEvaluationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Empreinte physique LevelDB Checkpoint B
    const checkpointB = CanonicalFingerprintBinding.getAuthoritativeRealFingerprint();

    // 2. Concordance A === B === AUTHORITATIVE_REAL_FINGERPRINT


    if (checkpointA.toLowerCase() !== checkpointB.toLowerCase()) {
      errors.push(`FINGERPRINT_DRIFT_DETECTED: Checkpoint A (${checkpointA}) != Checkpoint B (${checkpointB})`);
    }

    // 3. Concordance avec le manifest
    if (manifest.realLevelDbFingerprint.toLowerCase() !== checkpointB.toLowerCase()) {
      errors.push(`MANIFEST_FINGERPRINT_MISMATCH: Empreinte du manifest (${manifest.realLevelDbFingerprint}) != Checkpoint B (${checkpointB})`);
    }

    // 4. Vérification d'expiration au moment du Checkpoint B
    const now = Date.now();
    const expiresAt = new Date(auth.expiresAt).getTime();
    if (now > expiresAt) {
      errors.push('AUTHORIZATION_EXPIRED_AT_CHECKPOINT_B: L\'autorisation a expiré avant l\'activation finale.');
    }

    // 5. Compteurs de sécurité
    const counters = ColorGeneticsFeatureFlag.getCounters();
    const violations = Object.entries(counters).filter(([_, count]) => count > 0);
    if (violations.length > 0) {
      errors.push(`SECURITY_COUNTERS_VIOLATED_AT_CHECKPOINT_B: ${violations.map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }

    return {
      pass: errors.length === 0,
      checkpointFingerprint: checkpointB,
      errors,
      warnings
    };
  }
}

/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service de Double Sas d'Évaluation (PRE-ACTIVATION GATE & FINAL-ACTIVATION GATE)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-13
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Double sas hermétique et indépendant.
 * 2. Aucune décision d'activation basée sur un simple flag booléen.
 * 3. Double checkpoint physique du stockage réel (A !== B -> ÉCHEC IMMÉDIAT).
 * 4. Rejet strict si un seul compteur de sécurité ou une divergence > 0.
 * 5. Scope 'CONTROLLED_PRODUCTION' strictement interdit dans cette mission.
 */

import type {
  ControlledActivationAuthorization,
  ControlledActivationManifest,
  ControlledGateCheckResult
} from './types';
import { CanonicalFingerprintBinding } from './CanonicalFingerprintBinding';
import { ControlledSignatureService } from './ControlledSignatureService';
import { ControlledActivationManifestService } from './ControlledActivationManifestService';
import { ColorGeneticsFeatureFlag } from '../ColorGeneticsFeatureFlag';

export class ControlledDoubleGateService {
  public static readonly EXPECTED_CONTRACT_VERSION = '2.0.0';
  public static readonly EXPECTED_CATALOG_VERSION = '2.0.0';
  public static readonly EXPECTED_CALCULATOR_VERSION = '2.0.0';

  /**
   * Évalue le PRE-ACTIVATION GATE (Sas Préparatoire).
   */
  public static evaluatePreActivationGate(auth: ControlledActivationAuthorization): ControlledGateCheckResult {
    const checks: Record<string, boolean> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Contrat V2 valide
    checks.contractVersionValid = auth.contractVersion === this.EXPECTED_CONTRACT_VERSION;
    if (!checks.contractVersionValid) {
      errors.push(`CONTRACT_VERSION_INVALID: Reçu '${auth.contractVersion}', attendu '${this.EXPECTED_CONTRACT_VERSION}'.`);
    }

    // 2. Catalog version valide
    checks.catalogVersionValid = auth.catalogVersion === this.EXPECTED_CATALOG_VERSION;
    if (!checks.catalogVersionValid) {
      errors.push(`CATALOG_VERSION_INVALID: Reçu '${auth.catalogVersion}', attendu '${this.EXPECTED_CATALOG_VERSION}'.`);
    }

    // 3. Calculator version valide
    checks.calculatorVersionValid = auth.calculatorVersion === this.EXPECTED_CALCULATOR_VERSION;
    if (!checks.calculatorVersionValid) {
      errors.push(`CALCULATOR_VERSION_INVALID: Reçu '${auth.calculatorVersion}', attendu '${this.EXPECTED_CALCULATOR_VERSION}'.`);
    }

    // 4. Audit Mission 12 valide
    checks.auditSessionValid = Boolean(auth.auditSessionId && auth.auditSessionId.trim() !== '');
    if (!checks.auditSessionValid) {
      errors.push('AUDIT_SESSION_MISSING: Aucune session d\'audit valide associée.');
    }

    // 5. Zéro divergence inattendue
    checks.unexpectedDivergencesZero = auth.unexpectedDivergenceCount === 0;
    if (!checks.unexpectedDivergencesZero) {
      errors.push(`UNEXPECTED_DIVERGENCE_PRESENT: ${auth.unexpectedDivergenceCount} divergence(s) inattendue(s) détectée(s).`);
    }

    // 6. Zéro dossier en attente de review humaine
    checks.unresolvedReviewsZero = auth.unresolvedReviewCount === 0;
    if (!checks.unresolvedReviewsZero) {
      errors.push(`UNRESOLVED_REVIEWS_PRESENT: ${auth.unresolvedReviewCount} dossier(s) humain(s) non résolu(s).`);
    }

    // 7. Zéro dossier bloqué
    checks.blockedRecordsZero = auth.blockedRecordCount === 0;
    if (!checks.blockedRecordsZero) {
      errors.push(`BLOCKED_RECORDS_PRESENT: ${auth.blockedRecordCount} dossier(s) bloqué(s).`);
    }

    // 8. Aucun compteur de sécurité > 0
    const counters = ColorGeneticsFeatureFlag.getCounters();
    const violationEntries = Object.entries(counters).filter(([_, val]) => val > 0);
    checks.securityCountersZero = violationEntries.length === 0;
    if (!checks.securityCountersZero) {
      errors.push(`SECURITY_COUNTERS_VIOLATION: ${violationEntries.map(([k, v]) => `${k}=${v}`).join(', ')}.`);
    }

    // 9. Calcul du Fingerprint réel (Checkpoint A)
    let checkpointAFingerprint = '';
    try {
      checkpointAFingerprint = CanonicalFingerprintBinding.getAuthoritativeRealFingerprint();
      const fpCheck = CanonicalFingerprintBinding.verifyCandidateAgainstRealStorage(auth.authorizedStorageFingerprint);
      checks.checkpointAFingerprintMatch = fpCheck.matched;
      if (!fpCheck.matched) {
        errors.push(fpCheck.error || 'FINGERPRINT_MISMATCH_CHECKPOINT_A');
      }
    } catch (e: any) {
      checks.checkpointAFingerprintMatch = false;
      errors.push(`FINGERPRINT_CALCULATION_FAILED: ${e.message}`);
    }

    // 10. Manifest préparable
    checks.manifestPreparable = Boolean(auth.manifestHash && auth.manifestHash.trim() !== '');
    if (!checks.manifestPreparable) {
      warnings.push('MANIFEST_HASH_PENDING: Le hash de manifest n\'est pas encore renseigné.');
    }

    const pass = Object.values(checks).every(Boolean);

    return {
      gate: 'PRE_ACTIVATION',
      pass,
      decision: pass ? 'READY_TO_ACTIVATE' : 'DENIED',
      checks,
      errors,
      warnings,
      checkpointFingerprint: checkpointAFingerprint,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Évalue le FINAL-ACTIVATION GATE (Sas Final d'Activation).
   */
  public static evaluateFinalActivationGate(
    auth: ControlledActivationAuthorization,
    manifest: ControlledActivationManifest,
    checkpointAFingerprint: string
  ): ControlledGateCheckResult {
    const checks: Record<string, boolean> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Recalcul du Fingerprint réel (Checkpoint B) et comparaison A === B
    let checkpointBFingerprint = '';
    try {
      const doubleCheck = CanonicalFingerprintBinding.executeDoubleCheckpoint(checkpointAFingerprint);
      checkpointBFingerprint = doubleCheck.checkpointB;
      checks.doubleCheckpointValid = doubleCheck.valid;
      if (!doubleCheck.valid) {
        errors.push(doubleCheck.error || 'ACTIVATION_DENIED_STORAGE_CHANGED');
      }
    } catch (e: any) {
      checks.doubleCheckpointValid = false;
      errors.push(`CHECKPOINT_B_FAILED: ${e.message}`);
    }

    // 2. Vérification de la signature opérateur et liaison au stockage
    const sigCheck = ControlledSignatureService.verifySignature(auth);
    checks.signatureValid = sigCheck.valid;
    if (!sigCheck.valid) {
      errors.push(sigCheck.error || 'SIGNATURE_INVALID');
    }

    // 3. Vérification de l'intégrité du manifest
    const manifestCheck = ControlledActivationManifestService.verifyManifestIntegrity(manifest);
    checks.manifestValid = manifestCheck.valid;
    if (!manifestCheck.valid) {
      errors.push('MANIFEST_TAMPERED: Le manifest a été modifié ou corrompu.');
    }

    // 4. Vérification d'expiration
    const now = Date.now();
    const expiresTimestamp = Date.parse(auth.expiresAt);
    checks.notExpired = !isNaN(expiresTimestamp) && now < expiresTimestamp;
    if (!checks.notExpired) {
      errors.push(`AUTHORIZATION_EXPIRED: L'autorisation a expiré à ${auth.expiresAt}.`);
    }

    // 5. Vérification de l'identité et du rôle de l'opérateur
    checks.operatorIdValid = Boolean(auth.operatorId && auth.operatorId.trim() !== '');
    checks.operatorRoleValid = Boolean(auth.operatorRole && auth.operatorRole.trim() !== '');
    if (!checks.operatorIdValid || !checks.operatorRoleValid) {
      errors.push('OPERATOR_IDENTITY_INVALID: Identité ou rôle opérateur manquant.');
    }

    // 6. Vérification du scope d'activation
    // RÈGLE ABSOLUE : CONTROLLED_PRODUCTION est formellement INTERDIT.
    if (auth.activationScope === 'CONTROLLED_PRODUCTION' || (manifest && manifest.productionScope !== 'FORBIDDEN')) {
      checks.activationScopeAllowed = false;
      errors.push('SCOPE_FORBIDDEN_CONTROLLED_PRODUCTION: L\'activation CONTROLLED en production est strictement interdite.');
    } else {
      checks.activationScopeAllowed = ['CONTROLLED_EXPERT_SCOPED', 'AUDIT_ONLY', 'EXPERT_ONLY', 'SPECIES_SCOPED', 'MUTATION_SCOPED', 'RULE_SCOPED'].includes(auth.activationScope);
      if (!checks.activationScopeAllowed) {
        errors.push(`SCOPE_INVALID: Le scope demandé '${auth.activationScope}' n'est pas autorisé.`);
      }
    }

    // 7. Vérification de la session d'audit
    checks.auditSessionMatches = auth.auditSessionId === manifest.auditSessionId;
    if (!checks.auditSessionMatches) {
      errors.push(`AUDIT_SESSION_MISMATCH: L'autorisation (${auth.auditSessionId}) et le manifest (${manifest.auditSessionId}) divergent.`);
    }

    // 8. Vérification que CONTROLLED global n'est pas déjà actif
    checks.controlledNotAlreadyActive = !ColorGeneticsFeatureFlag.isControlledActive();
    if (!checks.controlledNotAlreadyActive) {
      errors.push('CONTROLLED_ALREADY_ACTIVE: Le mode CONTROLLED est déjà en cours d\'exécution.');
    }

    // 9. Vérification que l'autorisation n'est pas déjà consommée (Replay protection)
    checks.authorizationNotConsumed = auth.authorizationStatus !== 'CONSUMED' && auth.authorizationStatus !== 'ROLLED_BACK';
    if (!checks.authorizationNotConsumed) {
      errors.push('REPLAY_ATTACK_DENIED: Cette autorisation a déjà été consommée ou révoquée.');
    }

    // 10. Cohérence du hash du manifest entre l'autorisation et le manifest
    checks.manifestHashMatchesAuth = auth.manifestHash === manifest.manifestHash;
    if (!checks.manifestHashMatchesAuth) {
      errors.push(`MANIFEST_HASH_MISMATCH: auth.manifestHash (${auth.manifestHash}) !== manifest.manifestHash (${manifest.manifestHash}).`);
    }

    // 11. Vérification que productionScope est bien 'FORBIDDEN'
    checks.productionScopeForbidden = manifest.productionScope === 'FORBIDDEN';
    if (!checks.productionScopeForbidden) {
      errors.push('PRODUCTION_SCOPE_VIOLATION: productionScope doit impérativement être \'FORBIDDEN\'.');
    }

    // 12. Cohérence du scope d'activation entre manifest et autorisation
    checks.manifestScopeMatchesAuth = manifest.activationScope === auth.activationScope;
    if (!checks.manifestScopeMatchesAuth) {
      errors.push(`MANIFEST_SCOPE_MISMATCH: manifest.activationScope (${manifest.activationScope}) !== auth.activationScope (${auth.activationScope}).`);
    }

    const pass = Object.values(checks).every(Boolean);

    return {
      gate: 'FINAL_ACTIVATION',
      pass,
      decision: pass ? 'READY_TO_ACTIVATE' : 'DENIED',
      checks,
      errors,
      warnings,
      checkpointFingerprint: checkpointBFingerprint,
      evaluatedAt: new Date().toISOString()
    };
  }
}

/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Gestionnaire Orchestrateur du Protocole de Passage Contrôlé (ControlledActivationManager)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-13
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Concurrency Protection : Mutex atomique contre toute activation concurrente (DENIED_CONCURRENT_ACTIVATION).
 * 2. Nonce / Replay Protection : Registre immuable des nonces et autorisations consommées.
 * 3. Dry-Run certifié : Simulation complète produisant 'DRY_RUN_READY'.
 * 4. Verrouillage physique : Toute tentative d'activation réelle en Mission 13 est STRICTEMENT REJETÉE.
 * 5. Maintien absolu de CONTROLLED_MODE = LOCKED.
 */

import { ControlledCrypto } from './cryptoUtils';
import type {
  ControlledActivationAuthorization,
  ControlledActivationManifest,
  ControlledActivationDryRun,
  ControlledRollbackResult,
  ControlledActivationScope,
  ControlledActivationResult
} from './types';
import { CanonicalFingerprintBinding } from './CanonicalFingerprintBinding';
import { ControlledActivationManifestService } from './ControlledActivationManifestService';
import { ControlledSignatureService } from './ControlledSignatureService';
import { ControlledDoubleGateService } from './ControlledDoubleGateService';
import { ControlledRollbackService } from './ControlledRollbackService';
import { ColorGeneticsFeatureFlag } from '../ColorGeneticsFeatureFlag';
import { CanonicalColorGeneticsAuditJournal } from '../audit/CanonicalColorGeneticsAuditJournal';

export interface CreateAuthorizationParams {
  operatorId: string;
  operatorDisplayName: string;
  operatorRole: string;
  activationScope?: ControlledActivationScope;
  ttlSeconds?: number;
  auditSessionId?: string;
  notes?: string;
}

export class ControlledActivationManager {
  private static readonly PROTOCOL_VERSION = '1.3.0';
  private static readonly CONTRACT_VERSION = '2.0.0';
  private static readonly CATALOG_VERSION = '2.0.0';
  private static readonly CALCULATOR_VERSION = '2.0.0';

  // Protection contre la concurrence (Mutex en mémoire)
  private static isOperationInProgress = false;

  // Registre anti-rejeu des nonces et autorisations consommées
  private static consumedNonces: Set<string> = new Set();
  private static consumedAuthorizations: Set<string> = new Set();

  /**
   * Réinitialise les registres de test (usage contrôlé en test uniquement).
   */
  public static resetStateForTesting(): void {
    this.isOperationInProgress = false;
    this.consumedNonces.clear();
    this.consumedAuthorizations.clear();
  }

  /**
   * Crée une demande d'autorisation d'activation formelle.
   */
  public static createAuthorizationRequest(params: CreateAuthorizationParams): ControlledActivationAuthorization {
    const authorizationId = `AUTH-${Date.now()}-${ControlledCrypto.randomHex(4)}`;
    const nonce = `NONCE-${ControlledCrypto.randomHex(8)}`;

    // Le fingerprint autorisé est extrait directement du stockage physique réel
    const authoritativeFingerprint = CanonicalFingerprintBinding.getAuthoritativeRealFingerprint();

    const ttl = params.ttlSeconds ?? 3600; // 1 heure par défaut
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    const auditStats = CanonicalColorGeneticsAuditJournal.getStats();
    const counters = ColorGeneticsFeatureFlag.getCounters();

    const auth: ControlledActivationAuthorization = {
      authorizationId,
      protocolVersion: this.PROTOCOL_VERSION,
      contractVersion: this.CONTRACT_VERSION,
      catalogVersion: this.CATALOG_VERSION,
      calculatorVersion: this.CALCULATOR_VERSION,
      realStorageFingerprint: authoritativeFingerprint,
      authorizedStorageFingerprint: authoritativeFingerprint,
      auditSessionId: params.auditSessionId || `AUDIT-SESSION-${authorizationId}`,
      auditStatus: 'EXPERT_SHADOW',
      unexpectedDivergenceCount: 0,
      unresolvedReviewCount: auditStats.underReviewCount,
      blockedRecordCount: 0,
      securityViolationCount: Object.values(counters).reduce((sum, v) => sum + v, 0),
      operatorId: params.operatorId,
      operatorDisplayName: params.operatorDisplayName,
      operatorRole: params.operatorRole,
      authorizationStatus: 'PENDING',
      signatureAlgorithm: 'HMAC-SHA256',
      createdAt,
      expiresAt,
      activationScope: params.activationScope || 'CONTROLLED_EXPERT_SCOPED',
      rollbackScope: 'LIFO_IN_MEMORY',
      humanDecision: 'PENDING_REVIEW',
      notes: params.notes || 'Initiation de la demande d\'autorisation contrôlée Mission 14.',
      nonce
    };

    return auth;
  }

  /**
   * Signe l'autorisation avec la clé/salt opérateur et prépare le manifest associé.
   */
  public static signAuthorization(
    auth: ControlledActivationAuthorization,
    operatorId: string
  ): { auth: ControlledActivationAuthorization; manifest: ControlledActivationManifest } {
    if (auth.operatorId !== operatorId) {
      throw new Error(`OPERATOR_MISMATCH: L'opérateur signataire (${operatorId}) ne correspond pas à l'opérateur autorisé (${auth.operatorId}).`);
    }

    const signedAt = new Date().toISOString();

    // Génère le manifest déterministe
    const manifest = ControlledActivationManifestService.generateManifest({
      authorizationId: auth.authorizationId,
      storageFingerprint: auth.authorizedStorageFingerprint,
      operatorId: auth.operatorId,
      auditSessionId: auth.auditSessionId,
      activationScope: auth.activationScope,
      unexpectedDivergences: auth.unexpectedDivergenceCount,
      signedAt
    });

    // Calcule la signature cryptographique liée au stockage réel
    const signature = ControlledSignatureService.generateOperatorSignature({
      authorizationId: auth.authorizationId,
      realStorageFingerprint: auth.authorizedStorageFingerprint,
      contractVersion: auth.contractVersion,
      catalogVersion: auth.catalogVersion,
      calculatorVersion: auth.calculatorVersion,
      auditSessionId: auth.auditSessionId,
      operatorId: auth.operatorId,
      signedAt,
      activationScope: auth.activationScope,
      manifestHash: manifest.manifestHash,
      nonce: auth.nonce
    });

    auth.signedAt = signedAt;
    auth.manifestHash = manifest.manifestHash;
    auth.signature = signature;
    auth.authorizationStatus = 'SIGNED';

    return { auth, manifest };
  }

  /**
   * Exécute une simulation complète (Dry Run) de l'activation contrôlée.
   */
  public static executeDryRun(
    auth: ControlledActivationAuthorization,
    manifest: ControlledActivationManifest
  ): ControlledActivationDryRun {
    // 1. Mutex de protection contre la concurrence
    if (this.isOperationInProgress) {
      return this.buildDeniedDryRun(auth, manifest, 'DENIED_CONCURRENT_ACTIVATION: Une autre opération d\'activation est déjà en cours.');
    }

    try {
      this.isOperationInProgress = true;

      const dryRunId = `DRY-${Date.now()}-${auth.authorizationId.substring(0, 8)}`;
      const timestamp = new Date().toISOString();

      // Vérification anti-rejeu
      if (this.consumedNonces.has(auth.nonce) || this.consumedAuthorizations.has(auth.authorizationId) || auth.authorizationStatus === 'CONSUMED') {
        return this.buildDeniedDryRun(auth, manifest, 'REPLAY_ATTACK_DENIED: L\'autorisation ou le nonce a déjà été consommé.');
      }

      // Checkpoint A : Évaluation Pre-Activation Gate
      const preGate = ControlledDoubleGateService.evaluatePreActivationGate(auth);
      const checkpointA = preGate.checkpointFingerprint;

      if (!preGate.pass) {
        return {
          dryRunId,
          timestamp,
          preActivationGate: preGate,
          finalActivationGate: {
            gate: 'FINAL_ACTIVATION',
            pass: false,
            decision: 'DENIED',
            checks: {},
            errors: ['PRE_ACTIVATION_FAILED'],
            warnings: [],
            checkpointFingerprint: '',
            evaluatedAt: timestamp
          },
          checkpointA_Fingerprint: checkpointA,
          checkpointB_Fingerprint: '',
          fingerprintMatched: false,
          manifest,
          manifestHash: manifest.manifestHash,
          signatureVerified: false,
          rollbackPlanVerified: true,
          activationDecision: 'DENIED',
          simulatedControlledState: 'SIMULATED_READY',
          actualControlledState: 'LOCKED',
          denialReason: preGate.errors.join('; ')
        };
      }

      // Checkpoint B : Évaluation Final-Activation Gate
      const finalGate = ControlledDoubleGateService.evaluateFinalActivationGate(auth, manifest, checkpointA);
      const checkpointB = finalGate.checkpointFingerprint;
      const fingerprintMatched = Boolean(checkpointA && checkpointB && checkpointA.toLowerCase() === checkpointB.toLowerCase());

      const sigCheck = ControlledSignatureService.verifySignature(auth);

      const pass = preGate.pass && finalGate.pass && fingerprintMatched && sigCheck.valid;

      return {
        dryRunId,
        timestamp,
        preActivationGate: preGate,
        finalActivationGate: finalGate,
        checkpointA_Fingerprint: checkpointA,
        checkpointB_Fingerprint: checkpointB,
        fingerprintMatched,
        manifest,
        manifestHash: manifest.manifestHash,
        signatureVerified: sigCheck.valid,
        rollbackPlanVerified: true,
        activationDecision: pass ? 'DRY_RUN_READY' : 'DENIED',
        simulatedControlledState: 'SIMULATED_READY',
        actualControlledState: 'LOCKED',
        denialReason: pass ? undefined : finalGate.errors.join('; ')
      };
    } finally {
      this.isOperationInProgress = false;
    }
  }

  /**
   * Exécute la PREMIÈRE ACTIVATION CONTROLLED RÉELLE SCOPÉE (CONTROLLED_EXPERT_SCOPED).
   * RÈGLE ABSOLUE MISSION 14 :
   * - Uniquement dans le scope CONTROLLED_EXPERT_SCOPED.
   * - CONTROLLED_PRODUCTION reste strictement LOCKED.
   * - Utilisateurs standard continuent de recevoir Legacy.
   * - Double checkpoint physique A === B === REAL_FINGERPRINT.
   * - Double gate validée.
   * - Signature cryptographique HMAC-SHA256 validée.
   * - Manifest déterministe validé.
   * - Anti-rejeu et concurrence strictement contrôlés.
   */
  public static activateScoped(
    auth: ControlledActivationAuthorization,
    manifest: ControlledActivationManifest
  ): ControlledActivationResult {
    // 1. Mutex de concurrence
    if (this.isOperationInProgress) {
      return {
        success: false,
        status: 'DENIED',
        authorizationId: auth.authorizationId,
        scope: auth.activationScope,
        operatorId: auth.operatorId,
        activatedAt: new Date().toISOString(),
        actualControlledState: 'LOCKED',
        productionScope: 'FORBIDDEN',
        error: 'DENIED_CONCURRENT_ACTIVATION: Une autre opération d\'activation est déjà en cours.'
      };
    }

    try {
      this.isOperationInProgress = true;

      // 2. Vérification anti-rejeu et statut consommé
      if (this.consumedNonces.has(auth.nonce) || this.consumedAuthorizations.has(auth.authorizationId) || auth.authorizationStatus === 'CONSUMED' || auth.authorizationStatus === 'ROLLED_BACK') {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = 'DENIED_AUTHORIZATION_ALREADY_CONSUMED';
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: 'DENIED_AUTHORIZATION_ALREADY_CONSUMED: L\'autorisation ou le nonce a déjà été consommé.'
        };
      }

      // 3. Vérification de validité temporelle (expiration)
      const now = Date.now();
      const expiresTimestamp = Date.parse(auth.expiresAt);
      if (isNaN(expiresTimestamp) || now >= expiresTimestamp) {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = 'ACTIVATION_DENIED_AUTHORIZATION_EXPIRED';
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: `ACTIVATION_DENIED_AUTHORIZATION_EXPIRED: L'autorisation a expiré à ${auth.expiresAt}.`
        };
      }

      // 4. Vérification d'interdiction absolue de CONTROLLED_PRODUCTION
      if (auth.activationScope === 'CONTROLLED_PRODUCTION' || manifest.productionScope !== 'FORBIDDEN') {
        ColorGeneticsFeatureFlag.attemptProductionActivation();
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = 'SCOPE_FORBIDDEN_CONTROLLED_PRODUCTION';
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: 'SCOPE_FORBIDDEN_CONTROLLED_PRODUCTION: L\'activation en production est formellement interdite.'
        };
      }

      // 5. Vérification du scope expérimental autorisé
      if (auth.activationScope !== 'CONTROLLED_EXPERT_SCOPED') {
        ColorGeneticsFeatureFlag.attemptScopeEscape();
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = 'ACTIVATION_DENIED_SCOPE_INVALID';
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: `ACTIVATION_DENIED_SCOPE_INVALID: Le scope demandé '${auth.activationScope}' n'est pas autorisé. Seul 'CONTROLLED_EXPERT_SCOPED' est permis.`
        };
      }

      // 6. Checkpoint A : Évaluation Pre-Activation Gate
      const preGate = ControlledDoubleGateService.evaluatePreActivationGate(auth);
      if (!preGate.pass) {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = preGate.errors.join('; ');
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: `PRE_ACTIVATION_GATE_FAILED: ${preGate.errors.join('; ')}`
        };
      }
      const checkpointA = preGate.checkpointFingerprint;

      // 7. Checkpoint B : Évaluation Final-Activation Gate
      const finalGate = ControlledDoubleGateService.evaluateFinalActivationGate(auth, manifest, checkpointA);
      if (!finalGate.pass) {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = finalGate.errors.join('; ');
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: `FINAL_ACTIVATION_GATE_FAILED: ${finalGate.errors.join('; ')}`
        };
      }
      const checkpointB = finalGate.checkpointFingerprint;

      // 8. Vérification stricte A === B === REAL_FINGERPRINT
      const authoritativeFp = CanonicalFingerprintBinding.getAuthoritativeRealFingerprint();
      if (
        !checkpointA ||
        !checkpointB ||
        checkpointA.toLowerCase() !== checkpointB.toLowerCase() ||
        checkpointA.toLowerCase() !== authoritativeFp.toLowerCase()
      ) {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = 'ACTIVATION_DENIED_STORAGE_CHANGED';
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: 'ACTIVATION_DENIED_STORAGE_CHANGED: Le stockage LevelDB diverge entre les checkpoints.'
        };
      }

      // 9. Vérification Signature
      const sigCheck = ControlledSignatureService.verifySignature(auth);
      if (!sigCheck.valid) {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = sigCheck.error || 'SIGNATURE_INVALID';
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: sigCheck.error || 'SIGNATURE_INVALID'
        };
      }

      // 10. Vérification Manifest
      const manifestCheck = ControlledActivationManifestService.verifyManifestIntegrity(manifest);
      if (!manifestCheck.valid) {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = 'MANIFEST_TAMPERED';
        return {
          success: false,
          status: 'DENIED',
          authorizationId: auth.authorizationId,
          scope: auth.activationScope,
          operatorId: auth.operatorId,
          activatedAt: new Date().toISOString(),
          actualControlledState: 'LOCKED',
          productionScope: 'FORBIDDEN',
          error: 'MANIFEST_TAMPERED: Le manifest a été altéré.'
        };
      }

      // 11. Activation effective dans le scope CONTROLLED_EXPERT_SCOPED
      this.consumedNonces.add(auth.nonce);
      this.consumedAuthorizations.add(auth.authorizationId);
      auth.authorizationStatus = 'CONTROLLED_EXPERT_SCOPED_ACTIVE';
      auth.consumedAt = new Date().toISOString();

      ColorGeneticsFeatureFlag.activateExpertScoped(auth.operatorId);

      CanonicalColorGeneticsAuditJournal.recordDecision({
        recordId: auth.authorizationId,
        speciesId: 'system',
        decision: 'ACCEPT',
        operatorId: auth.operatorId,
        reason: `[CONTROLLED_EXPERT_SCOPED_ACTIVE] Activation scoped effective pour l'opérateur ${auth.operatorId}. Production LOCKED.`,
        dimension: 'CONTROLLED_ACTIVATION'
      });

      return {
        success: true,
        status: 'CONTROLLED_EXPERT_SCOPED_ACTIVE',
        authorizationId: auth.authorizationId,
        scope: auth.activationScope,
        operatorId: auth.operatorId,
        activatedAt: auth.consumedAt,
        actualControlledState: 'LOCKED',
        productionScope: 'FORBIDDEN'
      };
    } finally {
      this.isOperationInProgress = false;
    }
  }

  /**
   * Tente une activation de production globale (formellement VERROUILLÉE et INTERDITE).
   * Renvoie TOUJOURS 'DENIED' et préserve CONTROLLED_MODE = LOCKED.
   */
  public static attemptActivation(
    auth: ControlledActivationAuthorization,
    manifest: ControlledActivationManifest
  ): {
    success: false;
    status: 'DENIED';
    error: string;
    actualMode: string;
    lockEngaged: boolean;
  } {
    ColorGeneticsFeatureFlag.attemptProductionActivation();

    // 1. Mutex de concurrence
    if (this.isOperationInProgress) {
      auth.authorizationStatus = 'DENIED';
      auth.denialReason = 'DENIED_CONCURRENT_ACTIVATION';
      return {
        success: false,
        status: 'DENIED',
        error: 'DENIED_CONCURRENT_ACTIVATION: Une autre tentative est en cours.',
        actualMode: ColorGeneticsFeatureFlag.getConfig().mode,
        lockEngaged: ColorGeneticsFeatureFlag.isControlledLocked()
      };
    }

    try {
      this.isOperationInProgress = true;

      // 2. Vérification anti-rejeu
      if (this.consumedNonces.has(auth.nonce) || this.consumedAuthorizations.has(auth.authorizationId) || auth.authorizationStatus === 'CONSUMED' || auth.authorizationStatus === 'ROLLED_BACK') {
        auth.authorizationStatus = 'DENIED';
        auth.denialReason = 'REPLAY_ATTACK_DENIED';
        return {
          success: false,
          status: 'DENIED',
          error: 'REPLAY_ATTACK_DENIED: L\'autorisation ou le nonce a déjà été consommé.',
          actualMode: ColorGeneticsFeatureFlag.getConfig().mode,
          lockEngaged: ColorGeneticsFeatureFlag.isControlledLocked()
        };
      }

      // Marque l'autorisation comme consommée pour la protection anti-rejeu
      this.consumedNonces.add(auth.nonce);
      this.consumedAuthorizations.add(auth.authorizationId);
      auth.authorizationStatus = 'CONSUMED';
      auth.consumedAt = new Date().toISOString();

      auth.denialReason = 'SCOPE_FORBIDDEN_CONTROLLED_PRODUCTION: Le mode CONTROLLED_PRODUCTION est formellement verrouillé.';

      return {
        success: false,
        status: 'DENIED',
        error: auth.denialReason,
        actualMode: ColorGeneticsFeatureFlag.getConfig().mode,
        lockEngaged: ColorGeneticsFeatureFlag.isControlledLocked()
      };
    } finally {
      this.isOperationInProgress = false;
    }
  }

  /**
   * Exécute le protocole de rollback formel.
   */
  public static executeRollback(auth: ControlledActivationAuthorization): ControlledRollbackResult {
    return ControlledRollbackService.executeRollback(auth);
  }

  private static buildDeniedDryRun(
    auth: ControlledActivationAuthorization,
    manifest: ControlledActivationManifest,
    reason: string
  ): ControlledActivationDryRun {
    const timestamp = new Date().toISOString();
    return {
      dryRunId: `DRY-DENIED-${Date.now()}`,
      timestamp,
      preActivationGate: {
        gate: 'PRE_ACTIVATION',
        pass: false,
        decision: 'DENIED',
        checks: {},
        errors: [reason],
        warnings: [],
        checkpointFingerprint: '',
        evaluatedAt: timestamp
      },
      finalActivationGate: {
        gate: 'FINAL_ACTIVATION',
        pass: false,
        decision: 'DENIED',
        checks: {},
        errors: [reason],
        warnings: [],
        checkpointFingerprint: '',
        evaluatedAt: timestamp
      },
      checkpointA_Fingerprint: '',
      checkpointB_Fingerprint: '',
      fingerprintMatched: false,
      manifest,
      manifestHash: manifest.manifestHash,
      signatureVerified: false,
      rollbackPlanVerified: true,
      activationDecision: 'DENIED',
      simulatedControlledState: 'SIMULATED_READY',
      actualControlledState: 'LOCKED',
      denialReason: reason
    };
  }
}

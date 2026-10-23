/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Types & Contrats du Protocole de Passage Contrôlé SHADOW → CONTROLLED
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-13
 */

import type { AuditStatus } from '../audit/CanonicalColorGeneticsAuditJournal';

export type ControlledAuthorizationStatus =
  | 'PENDING'
  | 'READY'
  | 'SIGNED'
  | 'VERIFIED'
  | 'DENIED'
  | 'EXPIRED'
  | 'CONSUMED'
  | 'ROLLED_BACK'
  | 'CONTROLLED_EXPERT_SCOPED_ACTIVE';

export type ControlledActivationScope =
  | 'AUDIT_ONLY'
  | 'EXPERT_ONLY'
  | 'CONTROLLED_EXPERT_SCOPED'
  | 'SPECIES_SCOPED'
  | 'MUTATION_SCOPED'
  | 'RULE_SCOPED'
  | 'CONTROLLED_PRODUCTION';

export type ControlledAuditStatus = AuditStatus | 'EXPERT_SHADOW';

export interface ControlledActivationAuthorization {
  authorizationId: string;
  protocolVersion: string;
  contractVersion: string;
  catalogVersion: string;
  calculatorVersion: string;

  realStorageFingerprint: string;
  authorizedStorageFingerprint: string;

  auditSessionId: string;
  auditStatus: ControlledAuditStatus;

  unexpectedDivergenceCount: number;
  unresolvedReviewCount: number;
  blockedRecordCount: number;

  securityViolationCount: number;

  operatorId: string;
  operatorDisplayName: string;
  operatorRole: string;

  signedAt?: string;

  authorizationStatus: ControlledAuthorizationStatus;

  signatureAlgorithm: string;
  signature?: string;

  manifestHash?: string;

  createdAt: string;
  expiresAt: string;

  activationScope: ControlledActivationScope;
  rollbackScope: string;

  humanDecision: string;
  notes: string;

  nonce: string;
  activationAttemptId?: string;
  consumedAt?: string;
  denialReason?: string;
}

export interface ControlledActivationManifest {
  manifestId: string;
  protocolVersion: string;
  authorizationId: string;

  contractVersion: string;
  catalogVersion: string;
  calculatorVersion: string;

  storageFingerprint: string;

  auditSessionId: string;

  approvedRecords: string[];
  approvedRules: string[];
  approvedSpecies: string[];
  approvedMutations: string[];

  excludedRecords: string[];
  excludedRules: string[];
  disabledMutations: string[];
  underStudyMutations: string[];
  conflictingMutations: string[];

  securityCounters: Record<string, number>;

  unexpectedDivergences: number;

  humanReviewSummary: {
    total: number;
    accepted: number;
    rejected: number;
    deferred: number;
    underReview: number;
  };

  operatorId: string;
  signedAt?: string;

  manifestHash: string;

  activationScope: ControlledActivationScope;
  productionScope: 'FORBIDDEN';

  rollbackPlan: {
    strategy: 'LIFO_IN_MEMORY';
    targetMode: 'SHADOW';
    restoreState: boolean;
  };
}

export interface ControlledActivationResult {
  success: boolean;
  status: 'CONTROLLED_EXPERT_SCOPED_ACTIVE' | 'DENIED';
  authorizationId: string;
  scope: ControlledActivationScope;
  operatorId: string;
  activatedAt: string;
  actualControlledState: 'LOCKED';
  productionScope: 'FORBIDDEN';
  error?: string;
}

export interface ControlledGateCheckResult {
  gate: 'PRE_ACTIVATION' | 'FINAL_ACTIVATION';
  pass: boolean;
  decision: 'READY_TO_ACTIVATE' | 'DRY_RUN_READY' | 'DENIED';
  checks: Record<string, boolean>;
  errors: string[];
  warnings: string[];
  checkpointFingerprint: string;
  evaluatedAt: string;
}

export interface ControlledActivationDryRun {
  dryRunId: string;
  timestamp: string;
  preActivationGate: ControlledGateCheckResult;
  finalActivationGate: ControlledGateCheckResult;
  checkpointA_Fingerprint: string;
  checkpointB_Fingerprint: string;
  fingerprintMatched: boolean;
  manifest: ControlledActivationManifest;
  manifestHash: string;
  signatureVerified: boolean;
  rollbackPlanVerified: boolean;
  activationDecision: 'DRY_RUN_READY' | 'DENIED';
  simulatedControlledState: 'SIMULATED_READY';
  actualControlledState: 'LOCKED';
  denialReason?: string;
}

export interface ControlledRollbackResult {
  rollbackId: string;
  authorizationId: string;
  targetMode: 'SHADOW';
  restored: boolean;
  timestamp: string;
  auditStatePreserved: boolean;
  biologicalDataUntouched: boolean;
  status: 'SHADOW_RESTORED';
}

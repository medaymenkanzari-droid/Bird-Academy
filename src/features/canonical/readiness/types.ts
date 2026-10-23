/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Types & Contrats du Registre de Préparation à la Production (Production Readiness)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-15
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Séparation stricte entre 'READY_FOR_PRODUCTION_AUTHORIZATION' et 'CONTROLLED_PRODUCTION_ACTIVE'.
 * 2. 'CONTROLLED_PRODUCTION' demeure formellement 'LOCKED'.
 * 3. 23 compteurs de sécurité vérifiés à zéro.
 * 4. Aucune décision d'approbation ne peut activer la production.
 */

export type ProductionReadinessStatus =
  | 'NOT_READY'
  | 'READY_FOR_PRODUCTION_AUTHORIZATION'
  | 'BLOCKED'
  | 'EXPIRED';

export type ProductionHumanDecision =
  | 'PENDING'
  | 'APPROVE_READINESS'
  | 'REJECT_READINESS'
  | 'DEFER_READINESS';

export type AuditVerificationStatus = 'VERIFIED' | 'FAILED' | 'PENDING';

export interface ColorGeneticsProductionReadinessReport {
  readinessId: string;
  protocolVersion: string;
  contractVersion: string;
  catalogVersion: string;
  calculatorVersion: string;

  realFingerprint: string;
  fingerprintVerified: boolean;

  auditStatus: string;
  expertScopedStatus: 'ACTIVE_AND_VERIFIED' | 'INACTIVE';
  productionLockStatus: 'LOCKED';

  unexpectedDivergenceCount: number;
  unresolvedReviewCount: number;
  blockedRecordCount: number;

  securityViolationCount: number;
  securityCounters: Record<string, number>;

  geneticRuleAuditStatus: AuditVerificationStatus;
  biologicalRuleAuditStatus: AuditVerificationStatus;
  standardAuditStatus: AuditVerificationStatus;
  selectionAuditStatus: AuditVerificationStatus;
  evidenceAuditStatus: AuditVerificationStatus;
  explanationAuditStatus: AuditVerificationStatus;

  legacyComparisonStatus: AuditVerificationStatus;
  controlledIsolationStatus: AuditVerificationStatus;
  rollbackStatus: AuditVerificationStatus;
  replayProtectionStatus: AuditVerificationStatus;
  concurrencyStatus: AuditVerificationStatus;

  testStatus: AuditVerificationStatus;
  e2eStatus: AuditVerificationStatus;
  typescriptStatus: AuditVerificationStatus;
  staticStatus: AuditVerificationStatus;

  i18nStatus: AuditVerificationStatus;
  rtlStatus: AuditVerificationStatus;
  accessibilityStatus: AuditVerificationStatus;
  performanceStatus: AuditVerificationStatus;

  operatorReadinessStatus: AuditVerificationStatus;
  productionAuthorizationStatus: 'FORBIDDEN_IN_THIS_MISSION';

  blockers: string[];
  warnings: string[];

  humanDecision: ProductionHumanDecision;
  humanReviewer?: string;
  reviewedAt?: string;
  reviewerReason?: string;

  finalVerdict: ProductionReadinessStatus;
  createdAt: string;
  evaluatedAt: string;
}

export interface RecordHumanDecisionParams {
  decision: 'APPROVE_READINESS' | 'REJECT_READINESS' | 'DEFER_READINESS';
  operatorId: string;
  reason: string;
}

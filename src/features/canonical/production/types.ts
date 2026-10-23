/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Types & Contrats du Protocole d'Activation CONTROLLED_PRODUCTION
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-16
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Double Gate obligatoire (Checkpoint A avant dry-run, Checkpoint B après dry-run).
 * 2. Empreinte physique LevelDB autoritaire vérifiée à chaque étape (45fa24f77b1fdf36c34f25e99d2bc099320aa7e60a209706ff189a6fe2a8286b).
 * 3. Manifeste déterministe SHA-256 scellé et immuable.
 * 4. Signature HMAC-SHA256 liant 11 dimensions critiques.
 * 5. Simulation Dry-Run complète (zéro écriture, zéro réseau, zéro divergence, zéro violation).
 * 6. Confirmation humaine explicite obligatoire (aucun auto-click, aucun déclenchement implicite).
 * 7. Mutex anti-concurrence et registre anti-rejeu (nonces et autorisations à usage unique).
 * 8. Procédure de Rollback transactionnelle et atomique.
 */

export type ControlledProductionScope = 'CONTROLLED_PRODUCTION';

export type ControlledProductionStatus =
  | 'PENDING'
  | 'SIGNED'
  | 'READY_FOR_CONFIRMATION'
  | 'APPROVED_PRODUCTION'
  | 'CONTROLLED_PRODUCTION_ACTIVE'
  | 'CONSUMED'
  | 'ROLLED_BACK'
  | 'DENIED'
  | 'EXPIRED'
  | 'REJECTED';

export type ProductionActivationHumanDecision =
  | 'PENDING'
  | 'APPROVE_PRODUCTION'
  | 'REJECT_PRODUCTION';

export interface ControlledProductionAuthorization {
  authorizationId: string;
  operatorId: string;
  operatorDisplayName: string;
  operatorRole: string;
  auditSessionId: string;
  realFingerprint: string;
  contractVersion: string;
  catalogVersion: string;
  calculatorVersion: string;
  protocolVersion: string;
  manifestHash?: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  scope: ControlledProductionScope;
  authorizationStatus: ControlledProductionStatus;
  signature?: string;
  humanProductionDecision: ProductionActivationHumanDecision;
  humanConfirmedAt?: string;
  humanReviewerReason?: string;
  notes?: string;
  consumedAt?: string;
  denialReason?: string;
}

export interface ControlledProductionActivationManifest {
  manifestId: string;
  manifestVersion: string;
  protocolVersion: string;
  contractVersion: string;
  catalogVersion: string;
  calculatorVersion: string;

  speciesCatalogHash: string;
  mutationCatalogHash: string;
  geneticRulesHash: string;
  biologicalRulesHash: string;
  standardRulesHash: string;
  selectionRulesHash: string;
  evidenceCatalogHash: string;

  realLevelDbFingerprint: string;

  applicationVersion: string;
  buildVersion: string;

  activationScope: ControlledProductionScope;

  createdAt: string;
  expiresAt: string;

  operatorId: string;
  auditSessionId: string;

  nonce: string;

  securityCountersHash: string;
  manifestHash: string;
  signature: string;
}

export interface DryRunProductionReport {
  dryRunId: string;
  simulated: boolean;
  writes: number;
  reads: number;
  networkCalls: number;
  storageChanges: number;
  securityViolations: number;
  unexpectedDivergences: number;
  unresolvedReviews: number;
  blockedRecords: number;
  errors: string[];
  warnings: string[];
  finalStatus: 'PASS' | 'FAIL';
  evaluatedDimensions: {
    v2Loader: 'VERIFIED' | 'FAILED';
    speciesCatalog: 'VERIFIED' | 'FAILED';
    mutationsCatalog: 'VERIFIED' | 'FAILED';
    geneticRules: 'VERIFIED' | 'FAILED';
    biologicalRules: 'VERIFIED' | 'FAILED';
    standardRules: 'VERIFIED' | 'FAILED';
    selectionRules: 'VERIFIED' | 'FAILED';
    hybridizationRules: 'VERIFIED' | 'FAILED';
    healthWelfareRules: 'VERIFIED' | 'FAILED';
    evidenceCatalog: 'VERIFIED' | 'FAILED';
    explanations: 'VERIFIED' | 'FAILED';
    legacyComparator: 'VERIFIED' | 'FAILED';
    auditJournal: 'VERIFIED' | 'FAILED';
    securityCounters: 'VERIFIED' | 'FAILED';
    performance: 'VERIFIED' | 'FAILED';
  };
  executedAt: string;
}

export interface ProductionActivationResult {
  success: boolean;
  status: 'CONTROLLED_PRODUCTION_ACTIVE' | 'DENIED';
  authorizationId: string;
  scope: ControlledProductionScope;
  operatorId: string;
  activatedAt: string;
  checkpointA: string;
  checkpointB: string;
  manifestHash: string;
  signature: string;
  actualControlledState: 'ACTIVE_AND_VERIFIED' | 'LOCKED';
  error?: string;
}

export interface ProductionRollbackResult {
  success: boolean;
  rollbackId: string;
  previousState: string;
  newState: 'LOCKED';
  rolledBackAt: string;
  fingerprintBefore: string;
  fingerprintAfter: string;
  intact: boolean;
  error?: string;
}

/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service de Génération et Contrôle du Manifest d'Activation (ControlledActivationManifestService)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-13
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Génération strictement déterministe (même entrée → même hash).
 * 2. Vérification d'intégrité anti-falsification (anti-tampering).
 * 3. Inventaire exhaustif des éléments approuvés, exclus et sous étude.
 */

import { ControlledCrypto } from './cryptoUtils';
import type {
  ControlledActivationManifest,
  ControlledActivationScope
} from './types';
import { ColorGeneticsFeatureFlag } from '../ColorGeneticsFeatureFlag';
import { CanonicalColorGeneticsAuditJournal } from '../audit/CanonicalColorGeneticsAuditJournal';

export class ControlledActivationManifestService {
  private static readonly PROTOCOL_VERSION = '1.3.0';
  private static readonly CONTRACT_VERSION = '2.0.0';
  private static readonly CATALOG_VERSION = '2.0.0';
  private static readonly CALCULATOR_VERSION = '2.0.0';

  /**
   * Calcule le hash cryptographique SHA-256 déterministe d'un manifest (en excluant manifestHash).
   */
  public static computeManifestHash(manifestData: Omit<ControlledActivationManifest, 'manifestHash'>): string {
    const canonicalPayload = {
      manifestId: manifestData.manifestId,
      protocolVersion: manifestData.protocolVersion,
      authorizationId: manifestData.authorizationId,
      contractVersion: manifestData.contractVersion,
      catalogVersion: manifestData.catalogVersion,
      calculatorVersion: manifestData.calculatorVersion,
      storageFingerprint: manifestData.storageFingerprint,
      auditSessionId: manifestData.auditSessionId,
      approvedRecords: [...manifestData.approvedRecords].sort(),
      approvedRules: [...manifestData.approvedRules].sort(),
      approvedSpecies: [...manifestData.approvedSpecies].sort(),
      approvedMutations: [...manifestData.approvedMutations].sort(),
      excludedRecords: [...manifestData.excludedRecords].sort(),
      excludedRules: [...manifestData.excludedRules].sort(),
      disabledMutations: [...manifestData.disabledMutations].sort(),
      underStudyMutations: [...manifestData.underStudyMutations].sort(),
      conflictingMutations: [...manifestData.conflictingMutations].sort(),
      securityCounters: Object.keys(manifestData.securityCounters)
        .sort()
        .reduce((acc, k) => {
          acc[k] = manifestData.securityCounters[k];
          return acc;
        }, {} as Record<string, number>),
      unexpectedDivergences: manifestData.unexpectedDivergences,
      humanReviewSummary: manifestData.humanReviewSummary,
      operatorId: manifestData.operatorId,
      signedAt: manifestData.signedAt || '',
      activationScope: manifestData.activationScope,
      productionScope: manifestData.productionScope || 'FORBIDDEN',
      rollbackPlan: manifestData.rollbackPlan
    };

    const serialized = JSON.stringify(canonicalPayload);
    return ControlledCrypto.sha256Hex(serialized);
  }

  /**
   * Génère un manifest d'activation déterministe.
   */
  public static generateManifest(params: {
    authorizationId: string;
    storageFingerprint: string;
    operatorId: string;
    auditSessionId?: string;
    activationScope?: ControlledActivationScope;
    unexpectedDivergences?: number;
    signedAt?: string;
  }): ControlledActivationManifest {
    const stats = CanonicalColorGeneticsAuditJournal.getStats();
    const counters = ColorGeneticsFeatureFlag.getCounters();

    const manifestId = `MAN-${params.authorizationId}-${params.storageFingerprint.substring(0, 8)}`;

    const partialManifest: Omit<ControlledActivationManifest, 'manifestHash'> = {
      manifestId,
      protocolVersion: this.PROTOCOL_VERSION,
      authorizationId: params.authorizationId,
      contractVersion: this.CONTRACT_VERSION,
      catalogVersion: this.CATALOG_VERSION,
      calculatorVersion: this.CALCULATOR_VERSION,
      storageFingerprint: params.storageFingerprint,
      auditSessionId: params.auditSessionId || `AUDIT-SESSION-${params.authorizationId}`,
      approvedRecords: [
        'NOM-CANARY-01',
        'NOM-CHARD-02',
        'NOM-AGAP-03',
        'NOM-PERR-04',
        'NOM-CALO-05',
        'NOM-GOULD-06',
        'PAIR-CANARY-HYBRID-01',
        'PAIR-AGAPORNIS-CROSS-02',
        'PAIR-CANARY-INTENSIVE-03'
      ],
      approvedRules: [
        'RULE-MENDELIAN-RECESSIVE-001',
        'RULE-LETHAL-INTENSIVE-004',
        'RULE-HYBRID-HALDANE-007',
        'RULE-HYBRID-AGAPORNIS-017'
      ],
      approvedSpecies: [
        'canari',
        'spinus_cucullatus',
        'agapornis_personatus',
        'agapornis_fischeri',
        'melopsittacus_undulatus',
        'calopsitte',
        'diamant_gould'
      ],
      approvedMutations: [
        'can_op',
        'can_ja',
        'can_in',
        'can_cr',
        'can_wh_dom',
        'can_br'
      ],
      excludedRecords: [],
      excludedRules: [],
      disabledMutations: [
        'can_peri',
        'can_pangea',
        'can_var_yellow_beak',
        'mandarine',
        'facteur_optique_refraction',
        'ailes_blanches'
      ],
      underStudyMutations: [
        'can_peri',
        'can_pangea',
        'can_var_yellow_beak'
      ],
      conflictingMutations: [
        'can_var_perle'
      ],
      securityCounters: counters,
      unexpectedDivergences: params.unexpectedDivergences ?? 0,
      humanReviewSummary: {
        total: stats.totalReviews,
        accepted: stats.acceptedCount,
        rejected: stats.rejectedCount,
        deferred: stats.deferredCount,
        underReview: stats.underReviewCount
      },
      operatorId: params.operatorId,
      signedAt: params.signedAt,
      activationScope: params.activationScope || 'CONTROLLED_EXPERT_SCOPED',
      productionScope: 'FORBIDDEN',
      rollbackPlan: {
        strategy: 'LIFO_IN_MEMORY',
        targetMode: 'SHADOW',
        restoreState: true
      }
    };

    const manifestHash = this.computeManifestHash(partialManifest);

    return {
      ...partialManifest,
      manifestHash
    };
  }

  /**
   * Vérifie formellement l'intégrité du manifest contre toute falsification.
   */
  public static verifyManifestIntegrity(manifest: ControlledActivationManifest): {
    valid: boolean;
    computedHash: string;
    declaredHash: string;
    tampered: boolean;
  } {
    if (manifest.productionScope !== 'FORBIDDEN' || manifest.activationScope === 'CONTROLLED_PRODUCTION') {
      return {
        valid: false,
        computedHash: '',
        declaredHash: manifest.manifestHash || '',
        tampered: true
      };
    }

    const { manifestHash: declaredHash, ...body } = manifest;
    const computedHash = this.computeManifestHash(body);
    const valid = declaredHash === computedHash;

    return {
      valid,
      computedHash,
      declaredHash,
      tampered: !valid
    };
  }
}

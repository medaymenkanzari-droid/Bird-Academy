/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Journal d'Audit Expert Canonique Isolé (CanonicalColorGeneticsAuditJournal)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-12
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Strictement append-only, traçable, réversible et non destructif.
 * 2. ZÉRO écriture physique dans LevelDB ou localStorage.
 * 3. ZÉRO mutation des données biologiques réelles.
 * 4. ZÉRO promotion automatique de 'ACCEPTED' vers 'GENETICALLY_CONFIRMED'.
 * 5. Isolation totale en mémoire pour préserver le fingerprint de production.
 */

export type AuditDecision = 'REVIEW' | 'ACCEPT' | 'REJECT' | 'DEFER';

export type AuditStatus =
  | 'NOT_REVIEWED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'DEFERRED'
  | 'CONFLICT_REVIEW';

export interface AuditReviewEntry {
  reviewId: string;
  operatorId: string;
  timestamp: string;
  recordId: string;
  speciesId: string;
  dimension: string;
  decision: AuditDecision;
  reason: string;
  previousStatus: AuditStatus;
  newReviewStatus: AuditStatus;
  contractVersion: string;
  sourceFingerprint: string;
}

export interface AuditJournalStats {
  totalReviews: number;
  acceptedCount: number;
  rejectedCount: number;
  deferredCount: number;
  underReviewCount: number;
  conflictCount: number;
  recordsReviewedCount: number;
}

export class CanonicalColorGeneticsAuditJournal {
  private static readonly CONTRACT_VERSION = '2.0.0';
  private static readonly SOURCE_FINGERPRINT = '45fa24f77b1fdf36c34f25e99d2bc099320aa7e60a209706ff189a6fe2a8286b';

  // Registre append-only en mémoire isolée
  private static entries: AuditReviewEntry[] = [];

  /**
   * Ajoute une décision humaine au journal d'audit (Append-Only).
   * RÈGLE ABSOLUE : Aucune écriture dans les storages de données réelles.
   */
  public static recordDecision(params: {
    recordId: string;
    speciesId: string;
    decision: AuditDecision;
    reason: string;
    operatorId?: string;
    dimension?: string;
    timestamp?: string;
  }): AuditReviewEntry {
    if (!params.recordId || params.recordId.trim() === '') {
      throw new Error('AUDIT_ERROR: recordId obligatoire pour consigner une décision.');
    }
    if (!params.reason || params.reason.trim() === '') {
      throw new Error('AUDIT_ERROR: reason obligatoire pour justifier une décision humaine.');
    }

    const previousStatus = this.getStatusForRecord(params.recordId);
    let newStatus: AuditStatus = previousStatus;

    switch (params.decision) {
      case 'REVIEW':
        newStatus = 'UNDER_REVIEW';
        break;
      case 'ACCEPT':
        newStatus = 'ACCEPTED';
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        break;
      case 'DEFER':
        newStatus = 'DEFERRED';
        break;
      default:
        throw new Error(`AUDIT_ERROR: Décision non reconnue ${(params as any).decision}`);
    }

    const now = params.timestamp || new Date().toISOString();
    const reviewId = `REV-${params.recordId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const entry: AuditReviewEntry = {
      reviewId,
      operatorId: params.operatorId || 'OP-EXPERT-01',
      timestamp: now,
      recordId: params.recordId,
      speciesId: params.speciesId || 'UNKNOWN',
      dimension: params.dimension || 'OVERALL',
      decision: params.decision,
      reason: params.reason.trim(),
      previousStatus,
      newReviewStatus: newStatus,
      contractVersion: this.CONTRACT_VERSION,
      sourceFingerprint: this.SOURCE_FINGERPRINT
    };

    // Append-only
    this.entries.push(Object.freeze({ ...entry }));

    return entry;
  }

  /**
   * Retourne l'historique complet et ordonné de toutes les décisions d'audit
   */
  public static getAllEntries(): AuditReviewEntry[] {
    return [...this.entries];
  }

  /**
   * Retourne l'historique des décisions pour un dossier ou enregistrement spécifique
   */
  public static getEntriesForRecord(recordId: string): AuditReviewEntry[] {
    return this.entries.filter(e => e.recordId === recordId);
  }

  /**
   * Détermine le statut d'audit actuel d'un dossier
   */
  public static getStatusForRecord(recordId: string): AuditStatus {
    const recordEntries = this.entries.filter(e => e.recordId === recordId);
    if (recordEntries.length === 0) {
      return 'NOT_REVIEWED';
    }
    // Le dernier statut consigné fait foi (réversibilité traçable)
    return recordEntries[recordEntries.length - 1].newReviewStatus;
  }

  /**
   * Calcule les métriques globales de l'audit expert
   */
  public static getStats(): AuditJournalStats {
    const uniqueRecords = new Set<string>();
    let accepted = 0;
    let rejected = 0;
    let deferred = 0;
    let underReview = 0;
    let conflict = 0;

    for (const entry of this.entries) {
      uniqueRecords.add(entry.recordId);
    }

    for (const recordId of uniqueRecords) {
      const status = this.getStatusForRecord(recordId);
      if (status === 'ACCEPTED') accepted++;
      else if (status === 'REJECTED') rejected++;
      else if (status === 'DEFERRED') deferred++;
      else if (status === 'UNDER_REVIEW') underReview++;
      else if (status === 'CONFLICT_REVIEW') conflict++;
    }

    return {
      totalReviews: this.entries.length,
      acceptedCount: accepted,
      rejectedCount: rejected,
      deferredCount: deferred,
      underReviewCount: underReview,
      conflictCount: conflict,
      recordsReviewedCount: uniqueRecords.size
    };
  }

  /**
   * Réinitialise le journal en mémoire (usage de test uniquement)
   */
  public static resetForTests(): void {
    this.entries = [];
  }
}

// src/features/birds/models/passport/BirdGenetics.ts

export type ProvenanceStatus =
  | 'OBSERVED'
  | 'DECLARED'
  | 'INFERRED'
  | 'GENETICALLY_CONFIRMED'
  | 'UNKNOWN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

// Human review status for mutation entries
export type HumanReviewStatus =
  | 'NOT_REVIEWED'
  | 'REVIEW_REQUIRED'
  | 'REVIEWED'
  | 'CONFLICT_REVIEW';

export interface MutationEntry {
  speciesId: string;                 // mandatory – resolves species
  mutationId: string;                 // mandatory – resolves mutation catalogue
  status: ProvenanceStatus;          // required, UNKNOWN permitted
  source?: string;                   // optional description of origin
  confidence: ConfidenceLevel;       // required, UNKNOWN permitted
  provenance?: string;               // free‑text, optional
  humanReview?: HumanReviewStatus; // optional flag indicating review status
}

export interface BirdGenetics {
  knownMutations?: MutationEntry[];   // array, each entry follows rules 6‑8
  knownGenotypes?: string[];          // free‑text list, optional
  carrierStatuses?: string[];         // optional
  loci?: string[];                    // optional, species‑specific loci identifiers
  inheritanceInfo?: string;           // optional free‑text
}

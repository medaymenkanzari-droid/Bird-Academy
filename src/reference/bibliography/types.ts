/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — REGISTRE BIBLIOGRAPHIQUE CANONIQUE
 * Types formels de la couche bibliographique et de traçabilité des preuves
 * Mission V1.6.6.20
 * 
 * Invariants architecturaux :
 * 1. SOURCE_LEVEL (P0/P1/P2) !== EPISTEMIC_STATUS (VERIFIED/PROVISIONAL/...)
 * 2. Une source P2 seule ne confère JAMAIS le statut VERIFIED.
 * 3. Une source NOT_VERIFIED ne certifie aucune règle.
 * 4. Une source OUTDATED est conservée pour traçabilité historique.
 * 5. Les citations contradictoires (CONFLICTING) sont conservées sans exclusion.
 */

export type SourceType =
  | 'PEER_REVIEWED'
  | 'INSTITUTIONAL'
  | 'SPECIALIST_BOOK'
  | 'OFFICIAL_STANDARD'
  | 'SPECIALIST_DATABASE'
  | 'BREEDER_REFERENCE'
  | 'OTHER';

export type SourceLevel = 'P0' | 'P1' | 'P2';

export type SourceVerificationStatus = 'VERIFIED' | 'NOT_VERIFIED' | 'OUTDATED';

export type CitationConcordance =
  | 'CONCORDANT'
  | 'CONFLICTING'
  | 'INSUFFICIENT'
  | 'OUTDATED'
  | 'NOT_VERIFIED';

export type EpistemicRole =
  | 'PRIMARY'
  | 'CORROBORATIVE'
  | 'HISTORICAL'
  | 'CHALLENGED';

export type EpistemicStatus =
  | 'VERIFIED'
  | 'PROVISIONAL'
  | 'NEEDS_HUMAN_REVIEW'
  | 'CONFLICTING'
  | 'INSUFFICIENT_EVIDENCE'
  | 'UNKNOWN';

export interface PreciseLocation {
  page?: string;
  chapter?: string;
  section?: string;
  table?: string;
  figure?: string;
  paragraph?: string;
  quote?: string;
}

export interface BibliographicSource {
  sourceId: string;
  sourceType: SourceType;
  sourceLevel: SourceLevel;
  authors: readonly string[];
  organization?: string;
  title: string;
  year: number;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  chapter?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  language: string;
  verificationStatus: SourceVerificationStatus;
  consultedAt?: string;
  notes?: string;
}

export interface EvidenceCitation {
  citationId: string;
  sourceId: string;
  preciseLocation?: PreciseLocation;
  concordance: CitationConcordance;
  epistemicRole: EpistemicRole;
  rationale?: string;
}

export interface EvidenceRecord {
  evidenceId: string;
  speciesId: string;
  ruleId: string;
  claim: string;
  citations: readonly EvidenceCitation[];
  epistemicStatus: EpistemicStatus;
  humanReviewRequired: boolean;
  limitations?: string;
}

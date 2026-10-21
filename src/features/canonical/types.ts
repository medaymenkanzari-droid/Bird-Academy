/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Types Canoniques pour le Runtime Bridge (Mission 32)
 */

import type { Canari, Couple } from '../../types';

export type GenotypeStatus = 'UNSPECIFIED' | 'DECLARED' | 'OBSERVED' | 'INFERRED' | 'GENETICALLY_CONFIRMED';

export type CarrierStatus = 'UNKNOWN' | 'POSSIBLE' | 'CONFIRMED' | 'NONE';

export type EpistemicStatus = 'VALIDATED' | 'EXTRAPOLATION_DISABLED' | 'UNKNOWN' | 'AMBIGUOUS' | 'INSUFFICIENT_INFORMATION';

export type ShadowDivergenceClass =
  | 'EXPECTED_CANONICAL_CHANGE'
  | 'UNEXPECTED_DIVERGENCE'
  | 'LEGACY_ONLY'
  | 'CANONICAL_ONLY'
  | 'UNKNOWN_STATE'
  | 'BIOLOGICAL_REVIEW_REQUIRED';

export interface EpistemicProvenance {
  source: string;
  originalValue?: any;
  operatorDecision?: string;
  reviewedAt?: string;
  snapshotHash?: string;
  repairReason?: string;
}

export interface CanonicalBirdRecord extends Canari {
  recordId?: string;
  speciesId: string;
  canonicalModel: 'COLOR_PAIRING_V2';
  genotypeStatus: GenotypeStatus;
  carrierStatus: CarrierStatus;
  epistemicStatus: EpistemicStatus;
  canonicalProvenance?: EpistemicProvenance;
  fatherId?: string | number | null;
  motherId?: string | number | null;
  repairProvenance?: {
    legacyOriginalValue: string;
    repairedAt: string;
    repairedBy: string;
    repairReason: string;
  };
}

export interface CanonicalCoupleRecord extends Couple {
  coupleRecordId?: string;
  maleRecordId?: string;
  femaleRecordId?: string;
  maleSpeciesId?: string;
  femaleSpeciesId?: string;
  canonicalModel: 'COLOR_PAIRING_V2';
  biologicalCompatibility: boolean;
  geneticCompatibility: 'COMPATIBLE' | 'PARTIALLY_COMPATIBLE' | 'INCOMPATIBLE' | 'UNKNOWN' | 'CONFLICT_REVIEW';
  hybridizationType: 'NONE' | 'INTRA_GENUS' | 'INTER_GENUS' | 'UNKNOWN';
  fertilityStatus: 'FERTILE' | 'STERILE' | 'PARTIALLY_FERTILE' | 'UNKNOWN';
  selectionRecommendation: 'RECOMMENDED' | 'ADVISED_AGAINST' | 'NEUTRAL' | 'PROHIBITED' | 'UNKNOWN';
  standardCompatibility: 'CONFORM' | 'NON_CONFORM' | 'UNKNOWN';
}

export interface CanonicalMutationResolution {
  resolved: boolean;
  speciesId?: string;
  mutationId?: string;
  inheritance: 'SEX_LINKED_RECESSIVE' | 'AUTOSOMAL_DOMINANT' | 'AUTOSOMAL_RECESSIVE' | 'UNKNOWN';
  status: 'CANONICAL' | 'UNKNOWN' | 'OUT_OF_SCOPE' | 'AMBIGUOUS' | 'INSUFFICIENT_INFORMATION' | 'HUMAN_REVIEW_REQUIRED';
  reason?: string;
  nomenclature?: string;
  symbol?: string;
  homozygousState?: string;
}

export interface ShadowComparisonResult {
  recordId: string | number;
  entityType: 'BIRD' | 'COUPLE';
  status: ShadowDivergenceClass;
  divergenceClass?: ShadowDivergenceClass;
  legacyData: any;
  canonicalData: any;
  diffs: string[];
  reviewedAt: string;
}

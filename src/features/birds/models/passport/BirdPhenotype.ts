// src/features/birds/models/passport/BirdPhenotype.ts

/**
 * Observable phenotypic characteristics – never interpreted as genotype.
 */
export interface BirdPhenotype {
  /** Colouration description (e.g., "yellow", "red"). */
  coloration?: string;
  /** Plumage description (e.g., "smooth", "ruffled"). */
  plumage?: string;
  /** List of visible factors or marks. */
  visibleFactors?: string[];
  /** Morphological description (size, shape). */
  morphology?: string;
  /** Any special features not covered elsewhere. */
  specialFeatures?: string;
}

// src/features/birds/models/passport/BirdOrigin.ts

/**
 * Origin / traceability information for a bird.
 */
export interface BirdOrigin {
  /** Type of origin (e.g., "wild", "captive"). */
  originType?: string;
  /** Name of breeder or source. */
  breeder?: string;
  /** Date of acquisition – ISO string, optional. */
  acquisitionDate?: string;
  /** Reference to source documentation (e.g., ticket, DOI). */
  sourceReference?: string;
  /** Identifier of the father bird, if known. */
  fatherId?: number;
  /** Identifier of the mother bird, if known. */
  motherId?: number;
  /** Generation number – optional. */
  generation?: number;
  /** Pedigree status (e.g., "registered", "unregistered"). */
  pedigreeStatus?: string;
}

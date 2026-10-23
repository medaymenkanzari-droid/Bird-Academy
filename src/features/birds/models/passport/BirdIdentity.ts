// src/features/birds/models/passport/BirdIdentity.ts

/**
 * Bird identity – core immutable identifiers.
 */
export interface BirdIdentity {
  /** Technical primary key, always present. */
  birdId: number;
  /** Common name – can be an empty string which is interpreted as UNKNOWN. */
  name: string;
  /** Species identifier – required, resolves to a canonical species profile. */
  speciesId: string;
  /** Optional breed/variety identifier. */
  breedId?: string;
  /** Sex – explicit UNKNOWN when not known. */
  sex: 'M' | 'F' | 'UNKNOWN';
  /** Birth date in ISO format – optional, UNKNOWN when missing. */
  birthDate?: string;
  /** Free‑text status (e.g., "active", "archived"). */
  status?: string;
  /** Additional notes – optional. */
  notes?: string;
}

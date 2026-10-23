// src/features/birds/models/passport/BirdHealth.ts

export interface BirdHealth {
  healthStatus?: string;               // e.g., 'healthy', 'ill', UNKNOWN allowed
  knownConditions?: string[];          // optional list
  treatments?: string[];               // optional list
  observations?: string;               // optional free‑text
  history?: string;                    // optional narrative
  breedingImpact?: string;             // optional, how health affects reproduction
}

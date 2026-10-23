/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SPÉCIFICATION DU MOTEUR DE CROISEMENT GOULD (V1.6.5)
 * Module Canonique : Erythrura gouldiae (Diamant de Gould)
 * 
 * GARANTIES ÉPISTÉMIQUES DE CROISEMENT :
 * 1. Zéro Canary Fallback.
 * 2. Zéro inférence Phénotype -> Génotype certain.
 * 3. Zéro faux carrier ZW chez les femelles filles.
 * 4. Respect absolu de l'hérédité ZW (transmission mère W -> fille, Z -> fils).
 * 5. Préservation des statuts PROVISIONAL et HUMAN_REVIEW.
 * 6. Rejet strict de l'hybridation inter-espèces.
 */

import {
  GouldSex,
  EpistemicEvidenceLevel,
  HumanReviewRequirement,
  EpistemicCertainty,
  GouldianGenotypeRecord,
  GouldianPhenotypeManifest,
  GouldHeadColorZGenotype,
  GouldHeadYellowGenotype,
  GouldBodyDilutionGenotype,
  GouldBodyBlueGenotype,
  GouldBreastGenotype
} from './gouldianGeneticsTypes';

export type {
  GouldSex,
  EpistemicEvidenceLevel,
  HumanReviewRequirement,
  EpistemicCertainty,
  GouldianGenotypeRecord,
  GouldianPhenotypeManifest,
  GouldHeadColorZGenotype,
  GouldHeadYellowGenotype,
  GouldBodyDilutionGenotype,
  GouldBodyBlueGenotype,
  GouldBreastGenotype
};

/**
 * Résultat génotypique possible d'un descendant issu du croisement.
 */
export interface OffspringGenotypeOutcome {
  genotype: GouldianGenotypeRecord;
  probability: number; // Valeur comprise entre 0 et 1 (ex: 0.25)
  percentage: string;  // Représentation lisible (ex: "25%")
  epistemicStatus: EpistemicCertainty;
  evidenceLevel: EpistemicEvidenceLevel;
  humanReview: HumanReviewRequirement;
}

/**
 * Résultat phénotypique possible d'un descendant issu du croisement.
 * Anti-Inférence : 'underlyingGenotypes' conserve explicitement TOUS les génotypes
 * conduisant à ce même phénotype, sans jamais en choisir un de manière arbitraire.
 */
export interface OffspringPhenotypeOutcome {
  manifest: GouldianPhenotypeManifest;
  probability: number;
  percentage: string;
  underlyingGenotypes: GouldianGenotypeRecord[];
  epistemicStatus: EpistemicCertainty;
  evidenceLevel: EpistemicEvidenceLevel;
  humanReview: HumanReviewRequirement;
  warnings: string[];
}

/**
 * Dossier de résultat complet d'un croisement contrôlé Gouldian.
 */
export interface GouldianCrossResult {
  speciesId: 'diamant_gould';
  parentA: GouldianGenotypeRecord;
  parentB: GouldianGenotypeRecord;
  isParentHypothesisSet: boolean;
  offspringGenotypes: OffspringGenotypeOutcome[];
  offspringPhenotypes: OffspringPhenotypeOutcome[];
  overallEvidenceLevel: EpistemicEvidenceLevel;
  overallHumanReview: HumanReviewRequirement;
  overallCertainty: EpistemicCertainty;
  compositeLabelsDetected: string[];
  warnings: string[];
}

/**
 * Erreur spécifique lors d'une tentative de croisement non supportée ou biologiquement impossible.
 */
export class UnsupportedCrossError extends Error {
  public readonly code = 'UNSUPPORTED_CROSS';
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedCrossError';
  }
}

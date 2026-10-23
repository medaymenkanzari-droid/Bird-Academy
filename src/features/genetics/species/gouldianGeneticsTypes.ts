/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SPÉCIFICATION & MODÉLISATION GÉNÉTIQUE GOULD
 * Module Canonique Scôpé : Erythrura gouldiae (Diamant de Gould)
 * Version : V1.6.4 (Contrôlée / Anti-Inférence Stricte)
 * 
 * GARANTIES ÉPISTÉMIQUES :
 * 1. Zéro Canary Fallback.
 * 2. Zéro inférence Phénotype -> Génotype certain.
 * 3. Zéro faux carrier ZW chez la femelle.
 * 4. Préservation explicite des statuts PROVISIONAL et HUMAN_REVIEW.
 */

export type GouldSex = 'MALE' | 'FEMALE';

export type EpistemicEvidenceLevel =
  | 'CERTIFIED'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNDER_STUDY'
  | 'CONFLICTING'
  | 'INSUFFICIENT';

export type HumanReviewRequirement =
  | 'NOT_REQUIRED'
  | 'RECOMMENDED'
  | 'REQUIRED';

export type EpistemicCertainty =
  | 'CONFIRMED'
  | 'POSSIBLE_SET'
  | 'UNKNOWN'
  | 'HUMAN_REVIEW'
  | 'PROVISIONAL';

// --- LOCUS HEAD_COLOR_Z (Z-linked : ZR > Zr) ---
export type GouldHeadColorZAllele = 'ZR' | 'Zr';

export interface GouldHeadColorZGenotype {
  locus: 'HEAD_COLOR_Z';
  chromosome: 'Z';
  alleles: [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W'];
  certainty: EpistemicCertainty;
  possibleSet?: Array<[GouldHeadColorZAllele, GouldHeadColorZAllele | 'W']>;
  evidenceLevel: EpistemicEvidenceLevel;
  humanReview: HumanReviewRequirement;
}

// --- LOCUS HEAD_YELLOW (Autosomal recessive : Y > y) ---
export type GouldHeadYellowAllele = 'Y' | 'y';

export interface GouldHeadYellowGenotype {
  locus: 'HEAD_YELLOW';
  chromosome: 'AUTOSOMAL';
  alleles: [GouldHeadYellowAllele, GouldHeadYellowAllele];
  isCarrier: boolean;
  certainty: EpistemicCertainty;
  possibleSet?: Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]>;
  evidenceLevel: EpistemicEvidenceLevel;
  humanReview: HumanReviewRequirement;
}

// --- LOCUS BODY_DILUTION (Z-linked Incomplete Dominance : Z+ / Zp) ---
export type GouldBodyDilutionAllele = 'Z+' | 'Zp';

export interface GouldBodyDilutionGenotype {
  locus: 'BODY_DILUTION';
  chromosome: 'Z';
  alleles: [GouldBodyDilutionAllele, GouldBodyDilutionAllele | 'W'];
  factor: 'NORMAL' | 'SF_PASTEL' | 'DF_YELLOW' | 'HEMIZYGOUS_YELLOW';
  certainty: EpistemicCertainty;
  evidenceLevel: EpistemicEvidenceLevel; // HIGH
  humanReview: HumanReviewRequirement; // RECOMMENDED
}

// --- LOCUS BODY_BLUE (Autosomal recessive : B > b) ---
export type GouldBodyBlueAllele = 'B' | 'b';

export interface GouldBodyBlueGenotype {
  locus: 'BODY_BLUE';
  chromosome: 'AUTOSOMAL';
  alleles: [GouldBodyBlueAllele, GouldBodyBlueAllele];
  isCarrier: boolean;
  certainty: EpistemicCertainty;
  possibleSet?: Array<[GouldBodyBlueAllele, GouldBodyBlueAllele]>;
  evidenceLevel: EpistemicEvidenceLevel; // HIGH
  humanReview: HumanReviewRequirement; // NOT_REQUIRED
}

// --- LOCUS BREAST (Autosomal Allelic Series : P > l > w) [PROVISIONAL] ---
export type GouldBreastAllele = 'P' | 'l' | 'w'; // Purple, Lilac, White

export interface GouldBreastGenotype {
  locus: 'BREAST';
  chromosome: 'AUTOSOMAL';
  alleles: [GouldBreastAllele, GouldBreastAllele];
  isCarrier: boolean;
  carrierTarget?: 'l' | 'w';
  certainty: EpistemicCertainty;
  possibleSet?: Array<[GouldBreastAllele, GouldBreastAllele]>;
  evidenceLevel: EpistemicEvidenceLevel; // HIGH
  humanReview: HumanReviewRequirement; // REQUIRED
  implementationStatus: 'PROVISIONAL';
}

// --- COMPOSITE LABELS (Exposition / Commercial) ---
export interface GouldCompositePhenotype {
  isSilverComposite: boolean;
  isPastelBlueComposite: boolean;
  notes: string[];
  evidenceLevel: EpistemicEvidenceLevel;
  humanReview: HumanReviewRequirement;
}

// --- DOSSIER GÉNOTYPIQUE COMPLET ---
export interface GouldianGenotypeRecord {
  speciesId: 'diamant_gould';
  sex: GouldSex;
  headColorZ: GouldHeadColorZGenotype;
  headYellow: GouldHeadYellowGenotype;
  bodyDilution: GouldBodyDilutionGenotype;
  bodyBlue: GouldBodyBlueGenotype;
  breast: GouldBreastGenotype;
}

// --- MANIFEST PHÉNOTYPIQUE EXPRIMÉ ---
export interface GouldianPhenotypeManifest {
  speciesId: 'diamant_gould';
  sex: GouldSex;
  visualHeadColor: 'RED' | 'BLACK' | 'YELLOW' | 'UNKNOWN';
  beakTipColor: 'RED' | 'YELLOW_ORANGE';
  visualBreastColor: 'PURPLE' | 'LILAC' | 'WHITE' | 'UNKNOWN';
  visualBodyColor: 'GREEN' | 'PASTEL_SF' | 'YELLOW' | 'BLUE' | 'UNKNOWN';
  compositeLabels: string[];
  phenotypicEvidence: {
    yellowBeakTip: boolean;
    maskedBlackHead: boolean;
  };
  epistemicWarnings: string[];
}

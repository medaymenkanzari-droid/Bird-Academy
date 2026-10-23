/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — AUDIT DE MIGRATION DU CATALOGUE CANARI
 * Mission V1.7.2 : Canari : Migration du catalogue legacy vers le modèle canonique
 * Fichier : src/features/canonical/audit/CanaryCanonicalMigrationAudit.ts
 * 
 * GARANTIES SCIENTIFIQUES & ÉPISTÉMIQUES ABSOLUES :
 * 1. Zéro fausse certitude : Biologiquement possible ≠ Génétiquement confirmé ≠ Recommandé ≠ Standard.
 * 2. Isabelle n'est PAS un locus primaire : modélisé comme haplotype recombinant Z (Brown + Ino).
 * 3. Satiné : conservation des deux modèles concurrents (multi-locus vs allèle Ino) sous statut CONFLICTING.
 * 4. Taux de recombinaison r ≈ 2% : empirique, statut strictement PROVISIONAL, jamais certifié moléculairement.
 * 5. Ivoire : Z-linked récessif, hémizygotie femelle ZW (zéro femelle porteuse), statut PROVISIONAL.
 * 6. Létalité séparée de la dominance : homozygotes létaux in ovo (Intensif, Huppé, Blanc Dominant).
 * 7. Isolement documentaire scellé : lecture seule du registre bibliographique existant.
 */

import type { EpistemicStatusType } from '../../../components/genetics/EpistemicStatusBadge';
import type { EpistemicConfidenceType } from '../../../components/genetics/EpistemicConfidenceBadge';
import type { EpistemicSourceType } from '../../../components/genetics/EpistemicSourceBadge';
import type { HumanReviewStatusType } from '../../../components/genetics/HumanReviewBadge';

// --- TYPES DE CLASSIFICATION DU CATALOGUE ---

export type MigrationClassification =
  | 'SAFE_TO_MIGRATE'
  | 'MIGRATE_WITH_REVIEW'
  | 'KEEP_LEGACY_ONLY'
  | 'BLOCKED'
  | 'CONFLICTING';

export type TransmissionType =
  | 'Z_LINKED_RECESSIVE'
  | 'AUTOSOMAL_RECESSIVE'
  | 'AUTOSOMAL_DOMINANT'
  | 'AUTOSOMAL_INCOMPLETE_DOMINANT'
  | 'RECOMBINANT_HAPLOTYPE'
  | 'COMPOSITE_PHENOTYPE'
  | 'UNDER_STUDY'
  | 'UNKNOWN';

export type SexConstraintType =
  | 'NONE'
  | 'HEMIZYGOUS_FEMALE_NO_CARRIER' // Sur le chromosome Z : femelle ZW exprime ou n'a pas, jamais porteuse
  | 'AUTOSOMAL_EQUAL';

export type LethalityStatus =
  | 'NONE'
  | 'HOMOZYGOUS_LETHAL_EMBRYONIC_25' // 25% mortalité in ovo chez les homozygotes
  | 'UNKNOWN';

export interface CanaryMigrationEntry {
  legacyId: string;
  legacyName: string;
  canonicalLocusId: string;
  canonicalDisplayName: string;
  speciesId: 'canari';
  transmission: TransmissionType;
  alleles: string[];
  dominance: 'RECESSIVE' | 'DOMINANT' | 'INCOMPLETE_DOMINANT' | 'CO_DOMINANT' | 'UNKNOWN';
  sexConstraint: SexConstraintType;
  lethality: LethalityStatus;
  epistemicStatus: EpistemicStatusType;
  evidenceIds: string[];
  implementationStatus: MigrationClassification;
  humanReviewRequired: boolean;
  migrationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scientificRationale: string;
}

// --- MODÈLE CANONIQUE UNIVERSEL BIRD ACADEMY (V1.7) ---

export type DeterminationType =
  | 'CONFIRMED'
  | 'POSSIBLE_SET'
  | 'UNKNOWN'
  | 'NOT_TESTED';

export type ProvenanceType =
  | 'OBSERVED'
  | 'DECLARED'
  | 'INFERRED'
  | 'GENETICALLY_CONFIRMED';

export interface CanonicalLocusRecord {
  locusId: string;
  displayName: string;
  transmission: TransmissionType;
  determination: DeterminationType;
  confirmedGenotype?: [string, string] | [string]; // [allele1, allele2] pour mâle/autosome ou [allele1] pour femelle Z
  possibleSet?: Array<[string, string] | [string]>;
  carrierState: 'CONFIRMED' | 'POSSIBLE' | 'NONE' | 'UNKNOWN' | 'NOT_APPLICABLE';
  epistemic: {
    status: EpistemicStatusType;
    confidence: EpistemicConfidenceType;
    provenance: ProvenanceType;
    humanReviewRequired: boolean;
    conflictDetected: boolean;
    isProvisional: boolean;
  };
  evidenceIds: string[];
  notes?: string[];
  blocked?: boolean;
}

export interface CanonicalBirdGenetics {
  speciesId: 'canari';
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  loci: Record<string, CanonicalLocusRecord>;
  provenance: ProvenanceType;
  confidence: EpistemicConfidenceType;
  humanReviewRequired: boolean;
  conflictDetected: boolean;
  isProvisional: boolean;
}

// --- MODÈLE SPÉCIFIQUE RECOMBINAISON ISABELLE ---

export type HaplotypePhase = 'CIS' | 'TRANS' | 'PHASE_UNKNOWN';

export interface IsabelleRecombinantModel {
  brownState: 'MUTATED' | 'WILD_TYPE' | 'CARRIER' | 'UNKNOWN';
  inoState: 'MUTATED' | 'WILD_TYPE' | 'CARRIER' | 'UNKNOWN';
  phase: HaplotypePhase;
  empiricalRecombinationRate: number; // 0.02 (1.5% - 3.0%)
  rateStatus: 'PROVISIONAL';
  isMolecularlyCertified: false;
  possibleSet?: Array<{
    phase: HaplotypePhase;
    gametes: Record<string, number>;
  }>;
}

// --- MODÈLE SPÉCIFIQUE CONTROVERSE SATINÉ ---

export interface SatineControversyModel {
  status: 'NEEDS_HUMAN_REVIEW';
  isConflicting: true;
  hypotheses: [
    {
      id: 'MODEL_A_HISTORICAL_LINKED_LOCI';
      description: 'Locus indépendant lié sur Z avec crossing-over rare (~3%)';
      sourceId: 'SRC-POMAREDE-1989';
      concordance: 'CONFLICTING';
    },
    {
      id: 'MODEL_B_INO_POLYALLELIC_SERIES';
      description: 'Allèle de la série Ino liée au sexe (ino+ > ino_ag > ino_sat) sans crossing-over';
      sourceId: 'SRC-MARTIN-2002';
      concordance: 'CONFLICTING';
    }
  ];
  molecularConsensusAvailable: false;
  arbitrationProhibited: true;
}

// --- TABLE DE MIGRATION EXHAUSTIVE CANARI (LEGACY -> CANONICAL) ---

export const CANARY_MIGRATION_TABLE: CanaryMigrationEntry[] = [
  // 1. Brun (Brown)
  {
    legacyId: 'can_br',
    legacyName: 'Brun',
    canonicalLocusId: 'CAN_LOC_BROWN',
    canonicalDisplayName: 'Brun (Brown)',
    speciesId: 'canari',
    transmission: 'Z_LINKED_RECESSIVE',
    alleles: ['Z_+', 'Z_br'],
    dominance: 'RECESSIVE',
    sexConstraint: 'HEMIZYGOUS_FEMALE_NO_CARRIER',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Mélanine classique liée au chromosome Z validée par Pomarède (1977) et Martin (2002).'
  },
  // 2. Agate
  {
    legacyId: 'can_ag',
    legacyName: 'Agate',
    canonicalLocusId: 'CAN_LOC_AGATE',
    canonicalDisplayName: 'Agate',
    speciesId: 'canari',
    transmission: 'Z_LINKED_RECESSIVE',
    alleles: ['Z_+', 'Z_ag'],
    dominance: 'RECESSIVE',
    sexConstraint: 'HEMIZYGOUS_FEMALE_NO_CARRIER',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Mélanine classique liée au chromosome Z avec crossing-over méiotique mesuré face au Brun.'
  },
  // 3. Ino (Controverse Z / Non-autosomique)
  {
    legacyId: 'can_ino',
    legacyName: 'Ino (Complexe Z / Controverse)',
    canonicalLocusId: 'CAN_LOC_INO',
    canonicalDisplayName: 'Ino (Complexe Z / Controverse allélisme)',
    speciesId: 'canari',
    transmission: 'Z_LINKED_RECESSIVE',
    alleles: ['ino+', 'ino_ag', 'ino_sat'],
    dominance: 'RECESSIVE',
    sexConstraint: 'HEMIZYGOUS_FEMALE_NO_CARRIER',
    lethality: 'NONE',
    epistemicStatus: 'CONFLICTING',
    evidenceIds: ['EVD-CAN-09-SAT-01'],
    implementationStatus: 'BLOCKED',
    humanReviewRequired: true,
    migrationRisk: 'CRITICAL',
    scientificRationale: 'Conflit scientifique majeur (Martin 2002 vs Pomarède 1989) : l\'Ino canari n\'est pas un locus autosomique autonome certifié, mais une hypothèse de série polyallélique liée au sexe Z (ino+ > ino_ag > ino_sat) en concurrence avec le locus Satiné indépendant, ou un composite phénotypique (Phaéo/Satiné). Bloqué pour tout calcul.'
  },
  // 4. Isabelle (Haplotype recombinant Z)
  {
    legacyId: 'can_is',
    legacyName: 'Isabelle',
    canonicalLocusId: 'CAN_HAPLO_ISABELLE',
    canonicalDisplayName: 'Isabelle (Recombinant Brun + Agate)',
    speciesId: 'canari',
    transmission: 'RECOMBINANT_HAPLOTYPE',
    alleles: ['Z_br_ag'],
    dominance: 'RECESSIVE',
    sexConstraint: 'HEMIZYGOUS_FEMALE_NO_CARRIER',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-ISA-01', 'EVD-CAN-09-001'],
    implementationStatus: 'MIGRATE_WITH_REVIEW',
    humanReviewRequired: true,
    migrationRisk: 'MEDIUM',
    scientificRationale: 'NON un locus élémentaire. Représente l\'état recombinant [Z_br, Z_ag]. Phase parentale CIS/TRANS requise.'
  },
  // 5. Satiné (Controverse scientifique active)
  {
    legacyId: 'can_sa',
    legacyName: 'Satiné',
    canonicalLocusId: 'CAN_LOC_SATINE',
    canonicalDisplayName: 'Satiné',
    speciesId: 'canari',
    transmission: 'Z_LINKED_RECESSIVE',
    alleles: ['Z_+', 'Z_sa'],
    dominance: 'RECESSIVE',
    sexConstraint: 'HEMIZYGOUS_FEMALE_NO_CARRIER',
    lethality: 'NONE',
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    evidenceIds: ['EVD-CAN-09-SAT-01'],
    implementationStatus: 'CONFLICTING',
    humanReviewRequired: true,
    migrationRisk: 'HIGH',
    scientificRationale: 'Controverse Modèle A (locus lié Z, Pomarède) vs Modèle B (allèle Ino Z, Martin). Zéro arbitrage automatique.'
  },
  // 6. Ivoire
  {
    legacyId: 'can_iv',
    legacyName: 'Ivoire',
    canonicalLocusId: 'CAN_LOC_IVOIRE',
    canonicalDisplayName: 'Ivoire',
    speciesId: 'canari',
    transmission: 'Z_LINKED_RECESSIVE',
    alleles: ['Z_+', 'Z_iv'],
    dominance: 'RECESSIVE',
    sexConstraint: 'HEMIZYGOUS_FEMALE_NO_CARRIER',
    lethality: 'NONE',
    epistemicStatus: 'PROVISIONAL',
    evidenceIds: ['EVD-CAN-09-IV-01'],
    implementationStatus: 'MIGRATE_WITH_REVIEW',
    humanReviewRequired: true,
    migrationRisk: 'MEDIUM',
    scientificRationale: 'Dilution Z du lipochrome démontrée mais cartographie physique de linkage non certifiée (PROVISIONAL).'
  },
  // 7. Intensif (Facteur létal homozygote)
  {
    legacyId: 'can_in',
    legacyName: 'Intensif / Schimmel',
    canonicalLocusId: 'CAN_LOC_INTENSIVE',
    canonicalDisplayName: 'Intensif (Plumage)',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_INCOMPLETE_DOMINANT',
    alleles: ['i', 'I'],
    dominance: 'INCOMPLETE_DOMINANT',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'HOMOZYGOUS_LETHAL_EMBRYONIC_25',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-08-004'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Structure de plume à dominance incomplète. Homozygote I/I létal in ovo (Duncker 1928, Pomarède 1977).'
  },
  // 8. Huppé (Facteur létal homozygote)
  {
    legacyId: 'can_cr',
    legacyName: 'Huppé (Crest)',
    canonicalLocusId: 'CAN_LOC_CREST',
    canonicalDisplayName: 'Huppé (Crest)',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_DOMINANT',
    alleles: ['cr+', 'Cr'],
    dominance: 'DOMINANT',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'HOMOZYGOUS_LETHAL_EMBRYONIC_25',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-08-007'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Mutation de la calotte crânienne. Homozygote Cr/Cr létal avec hernie cérébrale (Hutt 1949).'
  },
  // 9. Blanc Dominant (Facteur létal homozygote)
  {
    legacyId: 'can_wh_dom',
    legacyName: 'Blanc Dominant',
    canonicalLocusId: 'CAN_LOC_WHITE_DOMINANT',
    canonicalDisplayName: 'Blanc Dominant',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_DOMINANT',
    alleles: ['wh+', 'Wh'],
    dominance: 'DOMINANT',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'HOMOZYGOUS_LETHAL_EMBRYONIC_25',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-08-004'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Inhibition partielle de lipochrome. Homozygote Wh/Wh létal in ovo.'
  },
  // 10. Blanc Récessif
  {
    legacyId: 'can_wh_rec',
    legacyName: 'Blanc Récessif',
    canonicalLocusId: 'CAN_LOC_WHITE_RECESSIVE',
    canonicalDisplayName: 'Blanc Récessif',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'wh_rec'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Incapacité d\'assimilation intestinale des caroténoïdes. Autosomique récessif classique.'
  },
  // 11. Pastel
  {
    legacyId: 'can_pa',
    legacyName: 'Pastel',
    canonicalLocusId: 'CAN_LOC_PASTEL',
    canonicalDisplayName: 'Pastel',
    speciesId: 'canari',
    transmission: 'Z_LINKED_RECESSIVE',
    alleles: ['Z_+', 'Z_pa'],
    dominance: 'RECESSIVE',
    sexConstraint: 'HEMIZYGOUS_FEMALE_NO_CARRIER',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Dilution mélanique liée au chromosome Z.'
  },
  // 12. Opale
  {
    legacyId: 'can_op',
    legacyName: 'Opale',
    canonicalLocusId: 'CAN_LOC_OPAL',
    canonicalDisplayName: 'Opale',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'op'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Inversion de pigmentation de la mélanine sous la plume. Autosomique récessif.'
  },
  // 13. Phaéo
  {
    legacyId: 'can_ph',
    legacyName: 'Phaéo (Rubino en lipochrome)',
    canonicalLocusId: 'CAN_LOC_PHAEO',
    canonicalDisplayName: 'Phaéo',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'ph'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Suppression complète de l\'eumélanine avec rétention maximale de la phaéomélanine.'
  },
  // 14. Topaze
  {
    legacyId: 'can_to',
    legacyName: 'Topaze',
    canonicalLocusId: 'CAN_LOC_TOPAZ',
    canonicalDisplayName: 'Topaze',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'to'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Concentration de l\'eumélanine le long du rachis avec contour clair.'
  },
  // 15. Eumo
  {
    legacyId: 'can_eu',
    legacyName: 'Eumo',
    canonicalLocusId: 'CAN_LOC_EUMO',
    canonicalDisplayName: 'Eumo',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'eu'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Réduction de l\'eumélanine noire et phaéomélanine avec yeux rubis foncés.'
  },
  // 16. Onyx
  {
    legacyId: 'can_on',
    legacyName: 'Onyx',
    canonicalLocusId: 'CAN_LOC_ONYX',
    canonicalDisplayName: 'Onyx',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'on'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Hyper-mélanisation mate sans voile phaéomélanique.'
  },
  // 17. Cobalt
  {
    legacyId: 'can_co',
    legacyName: 'Cobalt',
    canonicalLocusId: 'CAN_LOC_COBALT',
    canonicalDisplayName: 'Cobalt',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'co'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Diffusion de l\'eumélanine jusqu\'à l\'extrémité des barbes du sous-plumage.'
  },
  // 18. Jaspe
  {
    legacyId: 'can_ja',
    legacyName: 'Jaspe',
    canonicalLocusId: 'CAN_LOC_JASPE',
    canonicalDisplayName: 'Jaspe (SF / DF)',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_INCOMPLETE_DOMINANT',
    alleles: ['+', 'Ja'],
    dominance: 'INCOMPLETE_DOMINANT',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Mutation transmise depuis le Tarin du Venezuela par hybridation fertile. Non-létale en DF.'
  },
  // 19. Mogno
  {
    legacyId: 'can_mo',
    legacyName: 'Mogno',
    canonicalLocusId: 'CAN_LOC_MOGNO',
    canonicalDisplayName: 'Mogno',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'mo'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Altération de la structure eumélanique sur fond brun acajou.'
  },
  // 20. Urucum
  {
    legacyId: 'can_ur',
    legacyName: 'Urucum',
    canonicalLocusId: 'CAN_LOC_URUCUM',
    canonicalDisplayName: 'Urucum (Bec et pattes rouges)',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'ur'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Dépôt de caroténoïdes dans les tissus kératinisés du bec et des pattes.'
  },
  // 21. Mosaïque
  {
    legacyId: 'can_mos',
    legacyName: 'Mosaïque',
    canonicalLocusId: 'CAN_LOC_MOSAIC',
    canonicalDisplayName: 'Mosaïque (Dimorphisme sexuel caroténoïde)',
    speciesId: 'canari',
    transmission: 'AUTOSOMAL_RECESSIVE',
    alleles: ['+', 'mos'],
    dominance: 'RECESSIVE',
    sexConstraint: 'AUTOSOMAL_EQUAL',
    lethality: 'NONE',
    epistemicStatus: 'VERIFIED',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    migrationRisk: 'LOW',
    scientificRationale: 'Localisation hormonale et structurelle du lipochrome (patrons mâle et femelle distincts).'
  },
  // 22. Perle (Conflit scientifique)
  {
    legacyId: 'can_var_perle',
    legacyName: 'Perle',
    canonicalLocusId: 'CAN_LOC_PERLE',
    canonicalDisplayName: 'Perle',
    speciesId: 'canari',
    transmission: 'UNDER_STUDY',
    alleles: ['unknown'],
    dominance: 'UNKNOWN',
    sexConstraint: 'NONE',
    lethality: 'UNKNOWN',
    epistemicStatus: 'CONFLICTING',
    evidenceIds: [],
    implementationStatus: 'BLOCKED',
    humanReviewRequired: true,
    migrationRisk: 'HIGH',
    scientificRationale: 'Contradictions dans la littérature avicole quant au mode de transmission. Calculateur désactivé.'
  },
  // 23. Péridote (Données insuffisantes)
  {
    legacyId: 'can_peri',
    legacyName: 'Péridote',
    canonicalLocusId: 'CAN_LOC_PERIDOTE',
    canonicalDisplayName: 'Péridote',
    speciesId: 'canari',
    transmission: 'UNDER_STUDY',
    alleles: ['unknown'],
    dominance: 'UNKNOWN',
    sexConstraint: 'NONE',
    lethality: 'UNKNOWN',
    epistemicStatus: 'INSUFFICIENT_EVIDENCE',
    evidenceIds: [],
    implementationStatus: 'KEEP_LEGACY_ONLY',
    humanReviewRequired: true,
    migrationRisk: 'HIGH',
    scientificRationale: 'Mutation émergente sans validation génétique en peer-reviewed. Reste en observation legacy.'
  },
  // 24. Pangée (Données insuffisantes)
  {
    legacyId: 'can_pangea',
    legacyName: 'Pangée',
    canonicalLocusId: 'CAN_LOC_PANGEA',
    canonicalDisplayName: 'Pangée',
    speciesId: 'canari',
    transmission: 'UNDER_STUDY',
    alleles: ['unknown'],
    dominance: 'UNKNOWN',
    sexConstraint: 'NONE',
    lethality: 'UNKNOWN',
    epistemicStatus: 'INSUFFICIENT_EVIDENCE',
    evidenceIds: [],
    implementationStatus: 'KEEP_LEGACY_ONLY',
    humanReviewRequired: true,
    migrationRisk: 'HIGH',
    scientificRationale: 'Mutation émergente non formalisée. Risque biologique d\'erreur élevé. Ne pas intégrer au moteur.'
  },
  // 25. Phénotypes composites (Lutino / Rubino / Albinos)
  {
    legacyId: 'can_lutino',
    legacyName: 'Lutino / Rubino / Albinos',
    canonicalLocusId: 'CAN_COMPOSITE_LIPOCHROME_INO',
    canonicalDisplayName: 'Composite Ino (Jaune/Rouge/Blanc)',
    speciesId: 'canari',
    transmission: 'COMPOSITE_PHENOTYPE',
    alleles: ['composite'],
    dominance: 'RECESSIVE',
    sexConstraint: 'NONE',
    lethality: 'NONE',
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    evidenceIds: ['EVD-CAN-09-001'],
    implementationStatus: 'MIGRATE_WITH_REVIEW',
    humanReviewRequired: true,
    migrationRisk: 'MEDIUM',
    scientificRationale: 'Désignation commerciale d\'un phénotype combinant lipochrome et Ino/Satiné. Ne jamais convertir en allèle unique.'
  }
];

// --- MATRICE FINALE D'ÉLIGIBILITÉ À LA MIGRATION (MISSION V1.7.3 — SECTION 10) ---

export type CanonicalType =
  | 'PRIMARY_LOCUS'
  | 'RECOMBINANT_HAPLOTYPE'
  | 'COMPOSITE_PHENOTYPE'
  | 'EMERGING_FACTOR';

export type EvidenceStatusType =
  | 'SEALED_LINKED'
  | 'UNLINKED'
  | 'CONFLICTING'
  | 'INSUFFICIENT';

export type MigrationSafetyType =
  | 'SAFE_TO_MIGRATE'
  | 'MIGRATE_WITH_REVIEW'
  | 'BLOCKED'
  | 'KEEP_LEGACY_ONLY';

export interface CanaryMigrationReadinessRecord {
  legacyId: string;
  legacyName: string;
  canonicalId: string;
  canonicalType: CanonicalType;
  transmission: TransmissionType;
  epistemicStatus: EpistemicStatusType;
  evidenceStatus: EvidenceStatusType;
  implementationStatus: MigrationClassification;
  migrationSafety: MigrationSafetyType;
  humanReviewRequired: boolean;
  blockingReason: string | null;
}

export const CANARY_MIGRATION_READINESS_MATRIX: CanaryMigrationReadinessRecord[] = [
  // 1. Brun
  {
    legacyId: 'can_br',
    legacyName: 'Brun',
    canonicalId: 'CAN_LOC_BROWN',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'Z_LINKED_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 2. Agate
  {
    legacyId: 'can_ag',
    legacyName: 'Agate',
    canonicalId: 'CAN_LOC_AGATE',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'Z_LINKED_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 3. Ino
  {
    legacyId: 'can_ino',
    legacyName: 'Ino',
    canonicalId: 'CAN_LOC_INO',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'Z_LINKED_RECESSIVE',
    epistemicStatus: 'CONFLICTING',
    evidenceStatus: 'CONFLICTING',
    implementationStatus: 'BLOCKED',
    migrationSafety: 'BLOCKED',
    humanReviewRequired: true,
    blockingReason: 'Controverse scientifique Ino/Satiné/Phaéo : aucun locus autosomique certifié, modélisé comme allèle Z ou composite. Bloqué pour tout calcul.',
  },
  // 4. Isabelle
  {
    legacyId: 'can_is',
    legacyName: 'Isabelle',
    canonicalId: 'CAN_HAPLO_ISABELLE',
    canonicalType: 'RECOMBINANT_HAPLOTYPE',
    transmission: 'RECOMBINANT_HAPLOTYPE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'MIGRATE_WITH_REVIEW',
    migrationSafety: 'MIGRATE_WITH_REVIEW',
    humanReviewRequired: true,
    blockingReason: 'Haplotype recombinant Z : nécessite phase parentale CIS/TRANS et conservation de r≈2% PROVISIONAL.',
  },
  // 5. Satiné
  {
    legacyId: 'can_sa',
    legacyName: 'Satiné',
    canonicalId: 'CAN_LOC_SATINE',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'Z_LINKED_RECESSIVE',
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    evidenceStatus: 'CONFLICTING',
    implementationStatus: 'CONFLICTING',
    migrationSafety: 'BLOCKED',
    humanReviewRequired: true,
    blockingReason: 'Controverse scientifique active (Modèle A Pomarède 1989 vs Modèle B Martin 2002). Arbitrage automatique interdit.',
  },
  // 6. Ivoire
  {
    legacyId: 'can_iv',
    legacyName: 'Ivoire',
    canonicalId: 'CAN_LOC_IVOIRE',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'Z_LINKED_RECESSIVE',
    epistemicStatus: 'PROVISIONAL',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'MIGRATE_WITH_REVIEW',
    migrationSafety: 'MIGRATE_WITH_REVIEW',
    humanReviewRequired: true,
    blockingReason: 'Locus Z provisoire : cartographie physique de linkage non certifiée.',
  },
  // 7. Intensif
  {
    legacyId: 'can_in',
    legacyName: 'Intensif / Schimmel',
    canonicalId: 'CAN_LOC_INTENSIVE',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_INCOMPLETE_DOMINANT',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 8. Huppé
  {
    legacyId: 'can_cr',
    legacyName: 'Huppé (Crest)',
    canonicalId: 'CAN_LOC_CREST',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_DOMINANT',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 9. Blanc Dominant
  {
    legacyId: 'can_wh_dom',
    legacyName: 'Blanc Dominant',
    canonicalId: 'CAN_LOC_WHITE_DOMINANT',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_DOMINANT',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 10. Blanc Récessif
  {
    legacyId: 'can_wh_rec',
    legacyName: 'Blanc Récessif',
    canonicalId: 'CAN_LOC_WHITE_RECESSIVE',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 11. Pastel
  {
    legacyId: 'can_pa',
    legacyName: 'Pastel',
    canonicalId: 'CAN_LOC_PASTEL',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'Z_LINKED_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 12. Opale
  {
    legacyId: 'can_op',
    legacyName: 'Opale',
    canonicalId: 'CAN_LOC_OPAL',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 13. Phaéo
  {
    legacyId: 'can_ph',
    legacyName: 'Phaéo',
    canonicalId: 'CAN_LOC_PHAEO',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 14. Topaze
  {
    legacyId: 'can_to',
    legacyName: 'Topaze',
    canonicalId: 'CAN_LOC_TOPAZ',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 15. Eumo
  {
    legacyId: 'can_eu',
    legacyName: 'Eumo',
    canonicalId: 'CAN_LOC_EUMO',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 16. Onyx
  {
    legacyId: 'can_on',
    legacyName: 'Onyx',
    canonicalId: 'CAN_LOC_ONYX',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 17. Cobalt
  {
    legacyId: 'can_co',
    legacyName: 'Cobalt',
    canonicalId: 'CAN_LOC_COBALT',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 18. Jaspe
  {
    legacyId: 'can_ja',
    legacyName: 'Jaspe',
    canonicalId: 'CAN_LOC_JASPE',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_INCOMPLETE_DOMINANT',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 19. Mogno
  {
    legacyId: 'can_mo',
    legacyName: 'Mogno',
    canonicalId: 'CAN_LOC_MOGNO',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 20. Urucum
  {
    legacyId: 'can_ur',
    legacyName: 'Urucum',
    canonicalId: 'CAN_LOC_URUCUM',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 21. Mosaïque
  {
    legacyId: 'can_mos',
    legacyName: 'Mosaïque',
    canonicalId: 'CAN_LOC_MOSAIC',
    canonicalType: 'PRIMARY_LOCUS',
    transmission: 'AUTOSOMAL_RECESSIVE',
    epistemicStatus: 'VERIFIED',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'SAFE_TO_MIGRATE',
    migrationSafety: 'SAFE_TO_MIGRATE',
    humanReviewRequired: false,
    blockingReason: null,
  },
  // 22. Perle
  {
    legacyId: 'can_var_perle',
    legacyName: 'Perle',
    canonicalId: 'CAN_LOC_PERLE',
    canonicalType: 'EMERGING_FACTOR',
    transmission: 'UNDER_STUDY',
    epistemicStatus: 'CONFLICTING',
    evidenceStatus: 'CONFLICTING',
    implementationStatus: 'BLOCKED',
    migrationSafety: 'BLOCKED',
    humanReviewRequired: true,
    blockingReason: 'Contradictions avicoles non résolues sur le mode de transmission. Calculateur désactivé.',
  },
  // 23. Péridote
  {
    legacyId: 'can_peri',
    legacyName: 'Péridote',
    canonicalId: 'CAN_LOC_PERIDOTE',
    canonicalType: 'EMERGING_FACTOR',
    transmission: 'UNDER_STUDY',
    epistemicStatus: 'INSUFFICIENT_EVIDENCE',
    evidenceStatus: 'INSUFFICIENT',
    implementationStatus: 'KEEP_LEGACY_ONLY',
    migrationSafety: 'KEEP_LEGACY_ONLY',
    humanReviewRequired: true,
    blockingReason: 'Preuves scientifiques insuffisantes. Ne pas intégrer au catalogue canonique actif.',
  },
  // 24. Pangée
  {
    legacyId: 'can_pangea',
    legacyName: 'Pangée',
    canonicalId: 'CAN_LOC_PANGEA',
    canonicalType: 'EMERGING_FACTOR',
    transmission: 'UNDER_STUDY',
    epistemicStatus: 'INSUFFICIENT_EVIDENCE',
    evidenceStatus: 'INSUFFICIENT',
    implementationStatus: 'KEEP_LEGACY_ONLY',
    migrationSafety: 'KEEP_LEGACY_ONLY',
    humanReviewRequired: true,
    blockingReason: 'Mutation émergente non formalisée. Risque biologique d\'erreur élevé. Ne pas intégrer au moteur.',
  },
  // 25. Phénotypes composites (Lutino / Rubino / Albinos)
  {
    legacyId: 'can_lutino',
    legacyName: 'Lutino / Rubino / Albinos',
    canonicalId: 'CAN_COMPOSITE_LIPOCHROME_INO',
    canonicalType: 'COMPOSITE_PHENOTYPE',
    transmission: 'COMPOSITE_PHENOTYPE',
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    evidenceStatus: 'SEALED_LINKED',
    implementationStatus: 'MIGRATE_WITH_REVIEW',
    migrationSafety: 'MIGRATE_WITH_REVIEW',
    humanReviewRequired: true,
    blockingReason: 'Phénotype composite commercial combinant lipochrome et Ino/Satiné/Phaéo. Interdiction de réduction monogénique.',
  },
];

// --- MATRICE DE COMPATIBILITÉ DU GENETICS ENGINE ---

export interface GeneticsEngineCompatibilityEntry {
  functionName: string;
  legacyStatus: string;
  canonicalCompatible: boolean;
  adapterRequired: boolean;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  futureAction: string;
}

export const GENETICS_ENGINE_COMPATIBILITY_MATRIX: GeneticsEngineCompatibilityEntry[] = [
  {
    functionName: 'buildAscentTree',
    legacyStatus: 'Utilise bird.pere_id et bird.mere_id (neutre sur les mutations)',
    canonicalCompatible: true,
    adapterRequired: false,
    risk: 'LOW',
    futureAction: 'Conserver tel quel. La structure d\'arbre généalogique est indépendante du modèle allélique.'
  },
  {
    functionName: 'buildDescentTree',
    legacyStatus: 'Utilise le graphe des descendants par identifiant',
    canonicalCompatible: true,
    adapterRequired: false,
    risk: 'LOW',
    futureAction: 'Conserver tel quel.'
  },
  {
    functionName: 'getSiblings',
    legacyStatus: 'Filtrage relationnel père/mère',
    canonicalCompatible: true,
    adapterRequired: false,
    risk: 'LOW',
    futureAction: 'Conserver tel quel.'
  },
  {
    functionName: 'calculatePedigreeCompleteness',
    legacyStatus: 'Comptage de générations enregistrées',
    canonicalCompatible: true,
    adapterRequired: false,
    risk: 'LOW',
    futureAction: 'Conserver tel quel.'
  },
  {
    functionName: 'analyzeLineageStructure',
    legacyStatus: 'Calcul des fondateurs, diversité F et branches perdues',
    canonicalCompatible: true,
    adapterRequired: false,
    risk: 'LOW',
    futureAction: 'Conserver tel quel.'
  },
  {
    functionName: 'simulatePairing',
    legacyStatus: 'Évalue F de Wright et compare les champs textuels plats bird.mutation',
    canonicalCompatible: false,
    adapterRequired: true,
    risk: 'MEDIUM',
    futureAction: 'Remplacer la comparaison de chaînes par l\'inspection des loci canoniques via un adaptateur dédié.'
  },
  {
    functionName: 'predictOffspringOutcomes',
    legacyStatus: 'Inférence heuristique mono-locus basée sur bird.mutation et bird.couleur',
    canonicalCompatible: false,
    adapterRequired: true,
    risk: 'HIGH',
    futureAction: 'DANGER : Ne gère ni les phases CIS/TRANS, ni le linkage Z, ni les statuts épistémiques. Doit déléguer à un CrossEngine canonique Canari.'
  }
];

// --- SERVICES D'AUDIT ET VALIDATION ---

export class CanaryCanonicalMigrationAuditService {
  /**
   * Retourne l'ensemble des entrées du catalogue de migration.
   */
  public static getAllEntries(): CanaryMigrationEntry[] {
    return CANARY_MIGRATION_TABLE;
  }

  /**
   * Trouve une entrée par legacyId.
   */
  public static getEntryByLegacyId(legacyId: string): CanaryMigrationEntry | undefined {
    return CANARY_MIGRATION_TABLE.find(e => e.legacyId.toLowerCase() === legacyId.toLowerCase());
  }

  /**
   * Trouve une entrée par canonicalLocusId (avec compatibilité pour l'alias historique INO).
   */
  public static getEntryByCanonicalId(canonicalId: string): CanaryMigrationEntry | undefined {
    const id = canonicalId.toLowerCase();
    return CANARY_MIGRATION_TABLE.find(e =>
      e.canonicalLocusId.toLowerCase() === id ||
      (id === 'can_loc_ino_autosomal' && e.canonicalLocusId === 'CAN_LOC_INO')
    );
  }

  /**
   * Retourne la matrice de migration exhaustive (Section 10).
   */
  public static getReadinessMatrix(): CanaryMigrationReadinessRecord[] {
    return CANARY_MIGRATION_READINESS_MATRIX;
  }

  /**
   * Trouve une entrée de readiness par legacyId.
   */
  public static getReadinessEntryByLegacyId(legacyId: string): CanaryMigrationReadinessRecord | undefined {
    return CANARY_MIGRATION_READINESS_MATRIX.find(r => r.legacyId.toLowerCase() === legacyId.toLowerCase());
  }

  /**
   * Trouve une entrée de readiness par canonicalId (avec support d'alias).
   */
  public static getReadinessEntryByCanonicalId(canonicalId: string): CanaryMigrationReadinessRecord | undefined {
    const id = canonicalId.toLowerCase();
    return CANARY_MIGRATION_READINESS_MATRIX.find(r =>
      r.canonicalId.toLowerCase() === id ||
      (id === 'can_loc_ino_autosomal' && r.canonicalId === 'CAN_LOC_INO')
    );
  }

  /**
   * Audite l'incohérence critique INO et valide son verrouillage scientifique.
   */
  public static auditInoEpistemicConsistency(): {
    isConsistent: boolean;
    issues: string[];
    resolvedCanonicalId: string;
    status: EpistemicStatusType;
    implementationStatus: MigrationClassification;
    rationale: string;
  } {
    const entry = this.getEntryByLegacyId('can_ino');
    const isAutosomal = entry?.transmission === 'AUTOSOMAL_RECESSIVE';
    const isVerified = entry?.epistemicStatus === 'VERIFIED';
    const issues: string[] = [];

    if (isAutosomal) {
      issues.push("Contradiction : L'Ino canari ne doit pas être classé comme un locus autosomique primaire certifié.");
    }
    if (isVerified) {
      issues.push("Contradiction : L'Ino canari ne peut pas être VERIFIED en l'absence de cartographie moléculaire certifiée.");
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      resolvedCanonicalId: entry?.canonicalLocusId || 'CAN_LOC_INO',
      status: entry?.epistemicStatus || 'CONFLICTING',
      implementationStatus: entry?.implementationStatus || 'BLOCKED',
      rationale: entry?.scientificRationale || ''
    };
  }

  /**
   * Audite tous les loci Z-linked contre les règles cytogénétiques ZW.
   */
  public static auditZLinkedCytogenetics(): {
    valid: boolean;
    lociAudited: string[];
    femaleCarrierViolations: number;
  } {
    const zLoci = CANARY_MIGRATION_TABLE.filter(e => e.transmission === 'Z_LINKED_RECESSIVE');
    let violations = 0;
    for (const locus of zLoci) {
      if (locus.sexConstraint !== 'HEMIZYGOUS_FEMALE_NO_CARRIER') {
        violations++;
      }
    }
    return {
      valid: violations === 0,
      lociAudited: zLoci.map(l => l.canonicalLocusId),
      femaleCarrierViolations: violations
    };
  }

  /**
   * Audite les facteurs létaux à l'état homozygote (25% mortalité in ovo).
   */
  public static auditLethalFactors(): {
    valid: boolean;
    lethalLoci: string[];
    embryonicMortalityRate: number;
  } {
    const lethal = CANARY_MIGRATION_TABLE.filter(e => e.lethality === 'HOMOZYGOUS_LETHAL_EMBRYONIC_25');
    const expected = ['CAN_LOC_INTENSIVE', 'CAN_LOC_CREST', 'CAN_LOC_WHITE_DOMINANT'];
    const valid = lethal.length === 3 && expected.every(id => lethal.some(l => l.canonicalLocusId === id));
    return {
      valid,
      lethalLoci: lethal.map(l => l.canonicalLocusId),
      embryonicMortalityRate: 0.25
    };
  }

  /**
   * Résout le modèle Isabelle en conservant l'incertitude de phase méiotique.
   */
  public static resolveIsabelleModel(phase?: HaplotypePhase): IsabelleRecombinantModel {
    const resolvedPhase = phase || 'PHASE_UNKNOWN';
    return {
      brownState: 'MUTATED',
      inoState: 'MUTATED',
      phase: resolvedPhase,
      empiricalRecombinationRate: 0.02,
      rateStatus: 'PROVISIONAL',
      isMolecularlyCertified: false,
      possibleSet: resolvedPhase === 'PHASE_UNKNOWN' ? [
        {
          phase: 'CIS',
          gametes: { isabelle: 0.49, noir: 0.49, brun: 0.01, agate: 0.01 }
        },
        {
          phase: 'TRANS',
          gametes: { brun: 0.49, agate: 0.49, isabelle: 0.01, noir: 0.01 }
        }
      ] : undefined
    };
  }

  /**
   * Évalue le modèle Satiné sans jamais arbitrer automatiquement la controverse.
   */
  public static getSatineScientificEvaluation(): SatineControversyModel {
    return {
      status: 'NEEDS_HUMAN_REVIEW',
      isConflicting: true,
      hypotheses: [
        {
          id: 'MODEL_A_HISTORICAL_LINKED_LOCI',
          description: 'Locus indépendant lié sur Z avec crossing-over rare (~3%)',
          sourceId: 'SRC-POMAREDE-1989',
          concordance: 'CONFLICTING'
        },
        {
          id: 'MODEL_B_INO_POLYALLELIC_SERIES',
          description: 'Allèle de la série Ino liée au sexe (ino+ > ino_ag > ino_sat) sans crossing-over',
          sourceId: 'SRC-MARTIN-2002',
          concordance: 'CONFLICTING'
        }
      ],
      molecularConsensusAvailable: false,
      arbitrationProhibited: true
    };
  }

  /**
   * Convertit une observation déclarative ou phénotypique en enregistrement canonique
   * en respectant strictement : OBSERVED ≠ DECLARED ≠ INFERRED ≠ GENETICALLY_CONFIRMED.
   */
  public static buildCanonicalRecordFromInput(
    speciesId: string,
    sex: 'MALE' | 'FEMALE' | 'UNKNOWN',
    locusKey: string,
    provenance: ProvenanceType,
    observedAllele?: string
  ): CanonicalLocusRecord {
    if (speciesId !== 'canari') {
      throw new Error(`Violation d'étanchéité taxonomique : speciesId '${speciesId}' non autorisé pour l'audit Canari.`);
    }

    const entry = this.getEntryByLegacyId(locusKey) || this.getEntryByCanonicalId(locusKey);
    const displayName = entry ? entry.canonicalDisplayName : locusKey;
    const transmission = entry ? entry.transmission : 'UNKNOWN';

    // Règle épistémique : OBSERVED ne donne JAMAIS un génotype confirmé automatique
    let determination: DeterminationType = 'UNKNOWN';
    let confirmedGenotype: [string, string] | [string] | undefined = undefined;
    let possibleSet: Array<[string, string] | [string]> | undefined = undefined;

    if (provenance === 'GENETICALLY_CONFIRMED' && observedAllele) {
      determination = 'CONFIRMED';
      confirmedGenotype = sex === 'FEMALE' && entry?.sexConstraint === 'HEMIZYGOUS_FEMALE_NO_CARRIER'
        ? [observedAllele]
        : [observedAllele, observedAllele];
    } else if (provenance === 'OBSERVED' && observedAllele) {
      if (sex === 'FEMALE' && entry?.sexConstraint === 'HEMIZYGOUS_FEMALE_NO_CARRIER') {
        // Hémizygote ZW : chez la femelle, l'observation phénotypique lie directement son unique allèle Z
        determination = 'CONFIRMED';
        confirmedGenotype = [observedAllele];
      } else {
        // Mâle ou autosome : observation phénotypique = POSSIBLE_SET (homozygote ou hétérozygote selon dominance)
        determination = 'POSSIBLE_SET';
        possibleSet = [
          [observedAllele, observedAllele],
          [observedAllele, entry?.alleles[0] || '+']
        ];
      }
    } else if (provenance === 'DECLARED') {
      determination = 'POSSIBLE_SET';
    }

    return {
      locusId: entry ? entry.canonicalLocusId : locusKey,
      displayName,
      transmission,
      determination,
      confirmedGenotype,
      possibleSet,
      carrierState: 'UNKNOWN',
      epistemic: {
        status: entry ? entry.epistemicStatus : 'INSUFFICIENT_EVIDENCE',
        confidence: provenance === 'GENETICALLY_CONFIRMED' ? 'VERY_HIGH' : provenance === 'OBSERVED' ? 'MEDIUM' : 'LOW',
        provenance,
        humanReviewRequired: entry ? entry.humanReviewRequired : true,
        conflictDetected: entry?.implementationStatus === 'CONFLICTING',
        isProvisional: entry?.epistemicStatus === 'PROVISIONAL'
      },
      evidenceIds: entry ? entry.evidenceIds : [],
      notes: entry?.scientificRationale ? [entry.scientificRationale] : []
    };
  }
}

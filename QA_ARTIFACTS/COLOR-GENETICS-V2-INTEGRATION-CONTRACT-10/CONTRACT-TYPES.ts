/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Types Canoniques du Contrat Logiciel Génétique V2
 * Mission : COLOR-GENETICS-V2-INTEGRATION-CONTRACT-10
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Zéro modification du runtime de production.
 * 2. Dissociation stricte des 8 dimensions (Biologie, Génétique, Standard, Sélection, Hybridation, Santé, Preuves, Incertitude).
 * 3. Scoping obligatoire par (speciesId + mutationId).
 * 4. Déterminisme, idempotence et explicabilité intégrale.
 */

// ---------------------------------------------------------------------------
// 1. STATUTS ÉPISTÉMIQUES ET NIVEAUX DE CERTITUDE
// ---------------------------------------------------------------------------

export type EpistemicStatus =
  | 'OBSERVED'
  | 'DECLARED'
  | 'INFERRED'
  | 'GENETICALLY_CONFIRMED'
  | 'UNKNOWN';

export type CarrierStatus =
  | 'CARRIER_UNKNOWN'
  | 'CARRIER_POSSIBLE'
  | 'CARRIER_DECLARED'
  | 'CARRIER_CONFIRMED'
  | 'CARRIER_NONE';

export type CalculatorStatus =
  | 'ENABLED'
  | 'CONDITIONAL'
  | 'INFORMATIONAL_ONLY'
  | 'DISABLED';

export type ConfidenceLevel =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'CONFLICTING'
  | 'UNDER_STUDY'
  | 'INSUFFICIENT';

export type RuleEpistemicState =
  | 'CONFIRMED'
  | 'CONDITIONAL'
  | 'UNDER_STUDY'
  | 'CONFLICTING'
  | 'INSUFFICIENT';

// ---------------------------------------------------------------------------
// 2. MODES D'HÉRÉDITÉ ET CYTOGÉNÉTIQUE (ZZ / ZW)
// ---------------------------------------------------------------------------

export type GenotypicInheritance =
  | 'SEX_LINKED_RECESSIVE'
  | 'AUTOSOMAL_DOMINANT'
  | 'AUTOSOMAL_RECESSIVE'
  | 'INCOMPLETE_DOMINANCE'
  | 'POLYGENIC_CONTINUOUS'
  | 'COMPOSITE_GENEALOGICAL'
  | 'UNDER_STUDY'
  | 'CONFLICTING'
  | 'UNKNOWN';

export type BirdSex = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface SexLinkedGenotype {
  sex: BirdSex;
  karyotype: 'ZZ' | 'ZW' | 'UNKNOWN';
  /** Chez la femelle ZW, un seul allèle Z est présent (hémizygotie stricte) */
  chromosomeZ1Alleles: string[];
  /** Chez le mâle ZZ, second chromosome Z ; absent/nul chez la femelle */
  chromosomeZ2Alleles?: string[];
  /** Vérification formelle d'hémizygotie femelle : true si femelle et sans Z2 */
  isHemizygousFemale: boolean;
}

// ---------------------------------------------------------------------------
// 3. LÉTALITÉ ET RISQUES BIOLOGIQUES
// ---------------------------------------------------------------------------

export interface LethalityOutcome {
  isLethal: boolean;
  homozygousLethal: boolean;
  embryonicMortalityRate: number; // Ex: 0.25 pour I/I ou Cr/Cr
  targetLocus: string;
  lethalityCondition?: string;
  lethalityAlertCode?: string;
  scientificCitation?: string;
}

export type WelfareRiskLevel =
  | 'NONE'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL';

export interface WelfareAssessment {
  riskLevel: WelfareRiskLevel;
  pathologyRisk: 'NONE' | 'FEATHER_CYSTS' | 'OCULAR_FRAGILITY' | 'SKELETAL_CRANIAL' | 'OTHER';
  warningMessage?: string;
  prophylacticRecommendation?: string;
}

// ---------------------------------------------------------------------------
// 4. STANDARDS OFFICIELS ET CATÉGORIES D'EXPOSITION (COM / OMJ)
// ---------------------------------------------------------------------------

export type StandardCompatibilityStatus =
  | 'CONFORM'
  | 'NON_CONFORM'
  | 'SHOW_DISQUALIFIED'
  | 'EXPERIMENTAL'
  | 'UNKNOWN';

export interface StandardEvaluation {
  authority: 'COM_OMJ' | 'CNJF' | 'FOB' | 'OTHER';
  section: string; // Ex: "Section D — Canaris de Couleur"
  homologated: boolean;
  compatibilityStatus: StandardCompatibilityStatus;
  officialClassName?: string;
  sanctionLevel: 'NONE' | 'MINOR_PENALTY' | 'MAJOR_PENALTY' | 'DISQUALIFIED';
  disqualificationReason?: string;
}

// ---------------------------------------------------------------------------
// 5. RECOMMANDATION ZOOTECHNIQUE ET SÉLECTION
// ---------------------------------------------------------------------------

export type SelectionRecommendation =
  | 'RECOMMENDED'
  | 'NEUTRAL'
  | 'ADVISED_AGAINST'
  | 'PROHIBITED'
  | 'UNKNOWN';

export interface SelectionAdvisory {
  recommendation: SelectionRecommendation;
  tier: 'TIER_1_LETHALITY' | 'TIER_2_WELFARE' | 'TIER_3_STANDARDS' | 'TIER_4_OPTIMAL';
  strainPurityProtected: boolean;
  advisoryAlertCode?: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// 6. ÉPISTASIE ET INTERACTIONS MULTI-LOCI
// ---------------------------------------------------------------------------

export type InteractionType =
  | 'COMPLETE_MASKING'
  | 'PARTIAL_MASKING'
  | 'CUMULATIVE_DILUTION'
  | 'PHYSIOLOGICAL_CONFLICT'
  | 'PHENOTYPE_CORRUPTION'
  | 'LETHAL_SYNERGY';

export interface EpistaticInteraction {
  interactionId: string;
  speciesId: string;
  interactionType: InteractionType;
  mutationA: string; // Ex: "can_sa"
  mutationB: string; // Ex: "can_op"
  triggerCondition: string;
  phenotypicEffect: string;
  geneticEffect: string;
  standardEffect: StandardCompatibilityStatus;
  welfareEffect: WelfareRiskLevel;
  calculatorStatus: CalculatorStatus;
  evidenceIds: string[];
}

// ---------------------------------------------------------------------------
// 7. PREUVES ET REGISTRE D'ÉVIDENCE (EvidenceRecord)
// ---------------------------------------------------------------------------

export interface CanonicalEvidenceRecord {
  evidenceId: string; // Ex: "EVD-CAN-09-001"
  sourceType: 'PEER_REVIEWED' | 'STANDARD_OFFICIAL' | 'FEDERATION_TECHNICAL' | 'SPECIALIZED_TREATISE' | 'EMPIRICAL';
  sourceName: string;
  sourceURL?: string;
  authors?: string[];
  publicationDate: string;
  accessDate: string;
  speciesScope: string[]; // Ex: ["canari"]
  claim: string;
  limitations: string;
  evidenceLevel: ConfidenceLevel;
  conflictingSources?: string[];
  humanReview: 'VALIDATED' | 'REQUIRES_REVIEW' | 'FLAGGED';
  lastReviewed: string;
}

// ---------------------------------------------------------------------------
// 8. CONTRAT D'EXPLICATION STRUCTURÉ (ExplanationRecord)
// ---------------------------------------------------------------------------

export interface CanonicalExplanationRecord {
  assessmentId: string;
  status: 'ASSESSED' | 'BLOCKED' | 'HUMAN_REVIEW_REQUIRED' | 'AMBIGUOUS';
  confidence: ConfidenceLevel;
  primaryReason: string;
  biologicalBasis: string;
  geneticBasis: string;
  standardBasis: string;
  selectionBasis: string;
  welfareBasis: string;
  evidenceIds: string[];
  humanReviewRequired: boolean;
  humanReviewReason?: string;
}

// ---------------------------------------------------------------------------
// 9. DÉFINITION D'UNE MUTATION CANONIQUE SCOPÉE
// ---------------------------------------------------------------------------

export interface CanonicalMutationDefinition {
  speciesId: string; // OBLIGATOIRE (ex: "canari")
  mutationId: string; // OBLIGATOIRE (ex: "can_in")
  humanDisplayName: string;
  synonyms: string[];
  inheritance: GenotypicInheritance;
  locus: string;
  chromosome: 'Z' | 'AUTOSOME' | 'POLYGENIC' | 'UNKNOWN';
  wildTypeAllele: string;
  mutantAlleles: string[];
  isDominant: boolean;
  isIncompleteDominant: boolean;
  lethality: LethalityOutcome;
  epistemicState: RuleEpistemicState;
  calculatorStatus: CalculatorStatus;
  evidenceIds: string[];
  humanReviewRequired: boolean;
  notes?: string;
}

// ---------------------------------------------------------------------------
// 10. CONTRAT D'ÉVALUATION D'UN ACCOUPLEMENT (CanonicalPairAssessment)
// ---------------------------------------------------------------------------

export interface CanonicalPairAssessment {
  speciesId: string;
  maleGenotypeId?: string;
  femaleGenotypeId?: string;
  
  // A. Biologie
  biologicallyPossible: boolean;
  fertilityStatus: 'FERTILE' | 'STERILE' | 'PARTIALLY_FERTILE' | 'UNKNOWN';
  hybridizationType: 'NONE' | 'INTRA_GENUS' | 'INTER_GENUS' | 'UNKNOWN';
  
  // B. Génétique
  geneticallyCompatible: 'COMPATIBLE' | 'PARTIALLY_COMPATIBLE' | 'INCOMPATIBLE' | 'UNKNOWN' | 'CONFLICT_REVIEW';
  embryonicMortalityExpected: boolean;
  embryonicMortalityRate: number; // 0.0 à 1.0
  lethalityDetails?: LethalityOutcome[];
  
  // C. Standard
  standardCompatibility: StandardCompatibilityStatus;
  standardEvaluation: StandardEvaluation;
  
  // D. Sélection
  selectionRecommendation: SelectionRecommendation;
  selectionAdvisory: SelectionAdvisory;
  
  // F. Santé et Bien-être
  welfareRisk: WelfareRiskLevel;
  welfareAssessment: WelfareAssessment;
  
  // G. Preuves
  evidenceLevel: ConfidenceLevel;
  evidenceIds: string[];
  
  // H. Incertitude et Explication
  epistemicStatus: EpistemicStatus;
  explanation: CanonicalExplanationRecord;
}

// ---------------------------------------------------------------------------
// 11. VERSIONNAGE DU CONTRAT ET PROVENANCE
// ---------------------------------------------------------------------------

export interface CanonicalContractMetadata {
  contractName: 'COLOR_GENETICS_CONTRACT_V2';
  contractVersion: '2.0.0';
  schemaVersion: '2.0.0';
  catalogVersion: 'COLOR-GENETICS-V2';
  evidenceVersion: 'EVIDENCE-REGISTRY-V2';
  calculatorVersion: 'DETERMINISTIC-TENSOR-V2';
  releasedAt: string;
  status: 'DRAFT_SPECIFICATION' | 'QUALIFIED_FOR_INTEGRATION' | 'SEALED';
}

export interface MigrationProvenanceRecord {
  migrationVersion: string;
  migratedAt: string;
  sourceRecordId: string | number;
  originalValue: unknown;
  normalizationApplied: string;
  rollbackPayload: unknown;
}

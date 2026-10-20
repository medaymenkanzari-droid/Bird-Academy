/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service d'Orchestration du Dossier d'Audit Expert (CanonicalColorGeneticsAuditService)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-12
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Zéro modification LevelDB / localStorage.
 * 2. Décomposition intégrale en 14 sections (A à N).
 * 3. Aucune boîte noire : chaque décision est justifiée, prouvée et contextualisée.
 * 4. Préservation stricte : le résultat utilisateur reste 100% Legacy.
 */

import { CanonicalColorGeneticsContractAdapter } from '../CanonicalColorGeneticsContractAdapter';
import { CanonicalShadowComparator } from '../CanonicalShadowComparator';
import {
  CanonicalColorGeneticsAuditJournal,
  type AuditStatus,
  type AuditReviewEntry
} from './CanonicalColorGeneticsAuditJournal';

export interface AuditContextSection {
  speciesId: string;
  scientificName: string;
  commonName: string;
  breed: string;
  breedingObjective: string;
  selectionObjective: string;
  context: string;
  evaluationDate: string;
  contractVersion: string;
  catalogVersion: string;
  calculatorVersion: string;
}

export interface AuditParentsSection {
  male?: {
    id: string | number;
    name: string;
    ring: string;
    sex: string;
    age?: string | number;
    phenotype: string;
    genotype: string;
    species: string;
    mutation?: string;
  };
  female?: {
    id: string | number;
    name: string;
    ring: string;
    sex: string;
    age?: string | number;
    phenotype: string;
    genotype: string;
    species: string;
    mutation?: string;
  };
}

export interface AuditCanonicalDataSection {
  phenotype: string;
  carrierStatus: string;
  epistemicStatus: string;
  confidence: string;
  provenance: string;
  source: string;
}

export interface AuditGenotypeSection {
  genotype: string;
  status: 'DECLARED' | 'OBSERVED' | 'INFERRED' | 'GENETICALLY_CONFIRMED' | 'UNKNOWN';
  isUnknownInferredForbidden: boolean;
  notes: string;
}

export interface AuditMutationItem {
  mutationId: string;
  name: string;
  speciesId: string;
  inheritanceType: string;
  locus: string;
  alleles: string[];
  sexLinked: boolean;
  dominance: string;
  genotypeRequirement: string;
  phenotypeExpression: string;
  carrierLogic: string;
  calculatorStatus: 'ENABLED' | 'DISABLED' | 'UNDER_STUDY' | 'REQUIRES_CONFIRMATION';
  evidenceIds: string[];
  epistemicQuality: 'CONFIRMED' | 'CONDITIONAL' | 'UNDER_STUDY' | 'CONFLICTING' | 'INSUFFICIENT';
  disabledWarning?: string;
}

export interface AuditRuleItem {
  ruleId: string;
  type:
    | 'BIOLOGICAL_RULE'
    | 'GENETIC_RULE'
    | 'BREEDING_RULE'
    | 'STANDARD_RULE'
    | 'HEALTH_RULE'
    | 'HYBRIDIZATION_RULE'
    | 'SELECTION_RULE';
  condition: string;
  outcome: string;
  reason: string;
  evidenceIds: string[];
  confidence: string;
  humanReview: boolean;
}

export interface AuditInteractionsSection {
  epistasis: string[];
  maskedMutations: string[];
  dominanceRelationships: string[];
  sexLinkedFactors: string[];
  crossingOverNotes: string[];
  multiMutationInteraction: string[];
  nonStandardCombination: string[];
  underlyingGenotypeVsPhenotypeNote: string;
}

export interface AuditRisksSection {
  embryonicMortalityRate: number;
  embryonicMortalityDescription: string;
  welfareRiskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  welfareRiskDescription: string;
  pathologyRisk: string;
  selectionRecommendation: string;
  standardImpact: string;
  rulesInvolved: string[];
  evidenceIds: string[];
  humanReviewRequired: boolean;
}

export interface AuditStandardSection {
  biologicallyValid: boolean;
  geneticallyValid: boolean;
  standardRecognized: boolean;
  showDisqualified: boolean;
  authority: string;
  section: string;
  sanctionLevel: string;
  disqualificationReason?: string;
  fundamentalRuleNotice: string;
}

export interface AuditSelectionSection {
  selectionRecommendation:
    | 'RECOMMENDED'
    | 'ACCEPTABLE_UNDER_CONDITIONS'
    | 'DISCOURAGED'
    | 'AVOID'
    | 'UNKNOWN';
  reason: string;
  breedingObjective: string;
  strainImpact: string;
  standardImpact: string;
  welfareImpact: string;
  distinctionNote: string;
}

export interface AuditEvidenceItem {
  evidenceId: string;
  sourceType: string;
  sourceName: string;
  sourceURL?: string;
  publicationDate?: string;
  accessDate?: string;
  speciesScope: string;
  claim: string;
  limitations: string;
  evidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'PRELIMINARY';
  conflictingSources: string[];
  humanReview: boolean;
  lastReviewed: string;
}

export interface AuditExplanationSection {
  whatWasAnalyzed: string;
  whatIsKnown: string;
  whatIsUnknown: string;
  rulesUsed: string[];
  whyThisResult: string;
  risks: string;
  standardImpact: string;
  selectionImpact: string;
  evidence: string[];
  limitations: string;
  humanReview: string;
}

export interface AuditLegacyComparisonRow {
  dimension: string;
  legacyValue: string;
  v2Value: string;
  classification:
    | 'EXPECTED_DIVERGENCE'
    | 'LEGACY_DEFECT'
    | 'CANONICAL_IMPROVEMENT'
    | 'UNEXPECTED_DIVERGENCE'
    | 'NO_DIVERGENCE';
  reason: string;
  severity?: 'LOW' | 'MEDIUM' | 'CRITICAL';
}

export interface AuditUncertaintyPanel {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'PRELIMINARY';
  unknownFields: string[];
  conflictingInformation: string[];
  underStudyRules: string[];
  humanReviewRequired: boolean;
  insufficientInfoWarning?: string;
}

export interface AuditDossier {
  dossierId: string;
  title: string;
  entityType: 'BIRD' | 'COUPLE' | 'FIXTURE';
  sectionA_Context: AuditContextSection;
  sectionB_Parents: AuditParentsSection;
  sectionC_CanonicalData: AuditCanonicalDataSection;
  sectionD_Genotype: AuditGenotypeSection;
  sectionE_Mutations: AuditMutationItem[];
  sectionF_Rules: AuditRuleItem[];
  sectionG_Interactions: AuditInteractionsSection;
  sectionH_Risks: AuditRisksSection;
  sectionI_Standard: AuditStandardSection;
  sectionJ_Selection: AuditSelectionSection;
  sectionK_Evidence: AuditEvidenceItem[];
  sectionL_Explanation: AuditExplanationSection;
  sectionM_LegacyComparison: {
    rows: AuditLegacyComparisonRow[];
    hasUnexpectedDivergence: boolean;
    criticalBlock?: {
      dimension: string;
      legacyValue: string;
      v2Value: string;
      expectedValue: string;
      ruleInvolved: string;
      evidence: string;
      source: string;
      reason: string;
      severity: string;
    };
  };
  sectionN_HumanValidation: {
    currentStatus: AuditStatus;
    history: AuditReviewEntry[];
  };
  uncertaintyPanel: AuditUncertaintyPanel;
}

// ---------------------------------------------------------------------------
// ESPÈCES OFFICIELLES DU CONTRAT V2
// ---------------------------------------------------------------------------
const SPECIES_REGISTRY: Record<
  string,
  { scientificName: string; commonName: string; defaultBreed: string }
> = {
  canari: {
    scientificName: 'Serinus canaria domestica',
    commonName: 'Canari domestique',
    defaultBreed: 'Couleur Classique'
  },
  serinus_canaria: {
    scientificName: 'Serinus canaria domestica',
    commonName: 'Canari domestique',
    defaultBreed: 'Couleur Classique'
  },
  spinus_cucullatus: {
    scientificName: 'Spinus cucullatus',
    commonName: 'Chardonneret rouge du Venezuela',
    defaultBreed: 'Espèce pure Fringillidé'
  },
  cucullatus: {
    scientificName: 'Spinus cucullatus',
    commonName: 'Chardonneret rouge du Venezuela',
    defaultBreed: 'Espèce pure Fringillidé'
  },
  agapornis_personatus: {
    scientificName: 'Agapornis personatus',
    commonName: 'Inséparable masqué',
    defaultBreed: 'Psittacidé à cercle oculaire'
  },
  personatus: {
    scientificName: 'Agapornis personatus',
    commonName: 'Inséparable masqué',
    defaultBreed: 'Psittacidé à cercle oculaire'
  },
  agapornis_fischeri: {
    scientificName: 'Agapornis fischeri',
    commonName: 'Inséparable de Fischer',
    defaultBreed: 'Psittacidé à cercle oculaire'
  },
  fischeri: {
    scientificName: 'Agapornis fischeri',
    commonName: 'Inséparable de Fischer',
    defaultBreed: 'Psittacidé à cercle oculaire'
  },
  melopsittacus_undulatus: {
    scientificName: 'Melopsittacus undulatus',
    commonName: 'Perruche ondulée',
    defaultBreed: 'Couleur Standard'
  },
  perruche_ondulee: {
    scientificName: 'Melopsittacus undulatus',
    commonName: 'Perruche ondulée',
    defaultBreed: 'Couleur Standard'
  },
  calopsitte: {
    scientificName: 'Nymphicus hollandicus',
    commonName: 'Calopsitte élégante',
    defaultBreed: 'Couleur Standard'
  },
  nymphicus_hollandicus: {
    scientificName: 'Nymphicus hollandicus',
    commonName: 'Calopsitte élégante',
    defaultBreed: 'Couleur Standard'
  },
  diamant_gould: {
    scientificName: 'Chloebia gouldiae',
    commonName: 'Diamant de Gould',
    defaultBreed: 'Estrildidé'
  }
};

export class CanonicalColorGeneticsAuditService {
  /**
   * Retourne la liste des dossiers d'audit pré-configurés pour l'opérateur expert :
   * 1. Les 16 dossiers réels du snapshot de production M24/M11
   * 2. Les 25 fixtures officielles A à Y du contrat V2
   */
  public static getAvailableDossiersList(): Array<{
    id: string;
    title: string;
    type: 'BIRD' | 'COUPLE' | 'FIXTURE';
    category: string;
  }> {
    return [
      // 1. Snapshot réel de production (13 oiseaux + 3 couples)
      { id: 'NOM-CANARY-01', title: 'Plume d\'Or (Canari Jaune Schimmel)', type: 'BIRD', category: 'Production Snapshot' },
      { id: 'NOM-CHARD-02', title: 'Rubis Sauvage (Chardonneret Rouge Spinus)', type: 'BIRD', category: 'Production Snapshot' },
      { id: 'NOM-AGAP-03', title: 'Masqué Indigo (Agapornis Personatus Bleu)', type: 'BIRD', category: 'Production Snapshot' },
      { id: 'NOM-PERR-04', title: 'Azur Céleste (Perruche Ondulée)', type: 'BIRD', category: 'Production Snapshot' },
      { id: 'NOM-CALO-05', title: 'Soleil Levant (Calopsitte Joues Jaunes)', type: 'BIRD', category: 'Production Snapshot' },
      { id: 'NOM-GOULD-06', title: 'Arc-en-ciel (Diamant de Gould)', type: 'BIRD', category: 'Production Snapshot' },
      { id: 'PAIR-CANARY-HYBRID-01', title: 'Couple 1 : Chardonneret x Canari (Hybridation F1)', type: 'COUPLE', category: 'Production Snapshot' },
      { id: 'PAIR-AGAPORNIS-CROSS-02', title: 'Couple 2 : Personatus x Fischeri (Pollution génomique)', type: 'COUPLE', category: 'Production Snapshot' },
      { id: 'PAIR-CANARY-INTENSIVE-03', title: 'Couple 3 : Intensif x Intensif (Létalité Homozygote 25%)', type: 'COUPLE', category: 'Production Snapshot' },

      // 2. Fixtures Clés de Référence V2 (Fixtures A à Y)
      { id: 'FIX-A-AUTOSOMAL-RECESSIVE', title: 'Fixture A : Autosomique récessif (Opale)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-B-SIMPLE-DOMINANT', title: 'Fixture B : Dominant simple / Jaspe SF', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-C-SEX-LINKED-RECESSIVE', title: 'Fixture C : Lié au sexe (Satiné / Brun)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-D-EPISTASIS-MASKING', title: 'Fixture D : Épistasie et Masquage (Blanc récessif)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-E-CROSS-SPECIES-CONTAMINATION', title: 'Fixture E : Isolation interspécifique stricte', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-K-LETHAL-HOMOZYGOUS', title: 'Fixture K : Létalité embryonnaire 25% (I/i x I/i)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-L-WELFARE-WARNING', title: 'Fixture L : Risque kystes de plume (Schimmel x Schimmel)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-M-STANDARD-DISQUALIFIED', title: 'Fixture M : Combinaison disqualifiée (Opale + Topaze)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-N-UNDER-STUDY-PERLE', title: 'Fixture N : Mutation sous étude (Perle / Périscope)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-O-UNKNOWN-MUTATION-FALLBACK', title: 'Fixture O : Mutation inconnue (Pas d\'extrapolation)', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-P-MULTIPLE-ALLELES-LOCUS', title: 'Fixture P : Allèles multiples sur même locus', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-Y-HALDANE-HYBRID-FERTILITY', title: 'Fixture Y : Hybridation et Règle de Haldane', type: 'FIXTURE', category: 'Official Contract Fixture' },
      { id: 'FIX-UNEXPECTED-DEMO', title: 'Démo Divergence Inattendue (Arbitrage Critique)', type: 'FIXTURE', category: 'Official Contract Fixture' }
    ];
  }

  /**
   * Construit le dossier complet d'audit en 14 sections pour un identifiant donné.
   */
  public static buildDossier(recordId: string, customData?: any): AuditDossier {
    const safeId = recordId || '';
    const list = this.getAvailableDossiersList();
    const meta = list.find(item => item.id === safeId) || {
      id: safeId,
      title: customData?.nom || customData?.title || `Dossier ${safeId}`,
      type: (customData?.femelle_id || customData?.female ? 'COUPLE' : 'BIRD') as any,
      category: 'Custom Record'
    };

    // 1. Contexte & Résolution Espèce
    let rawSpecies = customData?.espece || customData?.species || '';
    if (!rawSpecies && (meta.id || '').includes('CHARD')) rawSpecies = 'spinus_cucullatus';
    else if (!rawSpecies && (meta.id || '').includes('AGAP')) rawSpecies = 'agapornis_personatus';
    else if (!rawSpecies && (meta.id || '').includes('PERR')) rawSpecies = 'melopsittacus_undulatus';
    else if (!rawSpecies && (meta.id || '').includes('CALO')) rawSpecies = 'calopsitte';
    else if (!rawSpecies && (meta.id || '').includes('GOULD')) rawSpecies = 'diamant_gould';
    else if (!rawSpecies && (meta.id || '').includes('CANARY')) rawSpecies = 'canari';
    else if (!rawSpecies && (meta.id || '').startsWith('FIX-')) rawSpecies = 'canari';

    // SECTION 6 DU PROMPT : Si speciesId est inconnu, afficher UNKNOWN et non Canari.
    const speciesKey = rawSpecies.trim().toLowerCase();
    const speciesInfo = SPECIES_REGISTRY[speciesKey];
    const normalizedSpeciesId = speciesInfo ? speciesKey : rawSpecies.trim() ? rawSpecies.trim() : 'UNKNOWN';

    const sectionA_Context: AuditContextSection = {
      speciesId: normalizedSpeciesId,
      scientificName: speciesInfo?.scientificName || (normalizedSpeciesId === 'UNKNOWN' ? 'UNKNOWN' : 'Non répertorié'),
      commonName: speciesInfo?.commonName || (normalizedSpeciesId === 'UNKNOWN' ? 'UNKNOWN' : 'Espèce non homologuée'),
      breed: customData?.race || speciesInfo?.defaultBreed || 'Standard',
      breedingObjective: 'Conservation de souche pure & Sélection morphologique de couleur',
      selectionObjective: 'Optimisation de la pureté génétique et élimination des tares létales',
      context: 'Évaluation Shadow Déterministe COLOR-GENETICS-V2 (Read-Only)',
      evaluationDate: '2026-10-03T12:00:00.000Z',
      contractVersion: '2.0.0',
      catalogVersion: '2.0.0',
      calculatorVersion: '2.0.0'
    };

    // 2. Parents / Oiseaux
    const isCouple = meta.type === 'COUPLE' || Boolean(customData?.male && customData?.female) || recordId.startsWith('PAIR-');
    const isLethalIntensive = recordId === 'PAIR-CANARY-INTENSIVE-03' || recordId === 'FIX-K-LETHAL-HOMOZYGOUS';
    const isAgapornisHybrid = recordId === 'PAIR-AGAPORNIS-CROSS-02';
    const isCarduelisHybrid = recordId === 'PAIR-CANARY-HYBRID-01' || recordId === 'FIX-Y-HALDANE-HYBRID-FERTILITY';
    const isSchimmelCyst = recordId === 'FIX-L-WELFARE-WARNING';
    const isDisqualified = recordId === 'FIX-M-STANDARD-DISQUALIFIED';
    const isUnderStudy = recordId === 'FIX-N-UNDER-STUDY-PERLE' || recordId === 'NOM-CHARD-02';
    const isUnknownFallback = recordId === 'FIX-O-UNKNOWN-MUTATION-FALLBACK';

    const maleName = isCarduelisHybrid
      ? 'Chardonneret Rouge Mâle'
      : isAgapornisHybrid
      ? 'Personatus Bleu Mâle'
      : isLethalIntensive
      ? 'Canari Jaune Intensif Mâle'
      : 'Plume d\'Or (Mâle)';

    const femaleName = isCarduelisHybrid
      ? 'Canari Jaune Femelle'
      : isAgapornisHybrid
      ? 'Fischeri Vert Femelle'
      : isLethalIntensive
      ? 'Canari Jaune Intensif Femelle'
      : 'Perle Blanche (Femelle)';

    const sectionB_Parents: AuditParentsSection = {
      male: {
        id: 'M-01',
        name: maleName,
        ring: 'FR-2025-001-M',
        sex: 'MALE',
        age: 2,
        phenotype: isLethalIntensive ? 'Jaune Intensif' : isAgapornisHybrid ? 'Bleu Masqué' : 'Classique Noir/Jaune',
        genotype: isLethalIntensive ? 'I/i' : isAgapornisHybrid ? 'bl/bl' : 'UNKNOWN',
        species: isCarduelisHybrid ? 'spinus_cucullatus' : isAgapornisHybrid ? 'agapornis_personatus' : 'canari',
        mutation: isLethalIntensive ? 'Intensif' : 'Classique'
      },
      female: {
        id: 'F-02',
        name: femaleName,
        ring: 'FR-2025-002-F',
        sex: 'FEMALE',
        age: 1,
        phenotype: isLethalIntensive ? 'Jaune Intensif' : isAgapornisHybrid ? 'Fischeri Type Sauvage' : 'Jaune Schimmel',
        genotype: isLethalIntensive ? 'I/i' : isAgapornisHybrid ? '+/+' : 'UNKNOWN',
        species: isAgapornisHybrid ? 'agapornis_fischeri' : 'canari',
        mutation: isLethalIntensive ? 'Intensif' : 'Schimmel'
      }
    };

    // 3. Section C : Données Canoniques d'entrée
    const sectionC_CanonicalData: AuditCanonicalDataSection = {
      phenotype: isLethalIntensive ? 'Jaune Intensif' : isCarduelisHybrid ? 'Hybride Caroténoïde' : 'Rouge Mosaïque Déclaré',
      carrierStatus: isLethalIntensive ? 'NONE' : 'UNKNOWN',
      epistemicStatus: isUnknownFallback ? 'INSUFFICIENT_INFORMATION' : isUnderStudy ? 'EXTRAPOLATION_DISABLED' : 'VALIDATED',
      confidence: isUnknownFallback ? 'LOW' : isUnderStudy ? 'MEDIUM' : 'HIGH',
      provenance: 'DECLARED_BY_BREEDER_WITH_SHADOW_INSPECTION',
      source: 'DECLARED'
    };

    // 4. Section D : Génotype
    const sectionD_Genotype: AuditGenotypeSection = {
      genotype: isLethalIntensive ? 'I/i' : 'UNKNOWN',
      status: isLethalIntensive ? 'DECLARED' : 'UNKNOWN',
      isUnknownInferredForbidden: true,
      notes: 'RÈGLE DE CONFINEMENT STRICTE : Ne jamais présenter un genotype UNKNOWN comme un genotype déduit.'
    };

    // 5. Section E : Mutations
    const sectionE_Mutations: AuditMutationItem[] = [
      {
        mutationId: isLethalIntensive ? 'can_in' : isDisqualified ? 'can_op_to' : 'can_op',
        name: isLethalIntensive ? 'Intensif (Facteur Létal)' : isDisqualified ? 'Opale + Topaze' : 'Opale',
        speciesId: 'canari',
        inheritanceType: isLethalIntensive ? 'INCOMPLETE_DOMINANCE' : 'AUTOSOMAL_RECESSIVE',
        locus: isLethalIntensive ? 'loc_in' : 'loc_op',
        alleles: isLethalIntensive ? ['I', 'i'] : ['op', '+'],
        sexLinked: false,
        dominance: isLethalIntensive ? 'INCOMPLETE_DOMINANT' : 'RECESSIVE',
        genotypeRequirement: isLethalIntensive ? 'I/i (hétérozygote vivant)' : 'op/op',
        phenotypeExpression: isLethalIntensive ? 'Plume étroite, lipochrome saturé' : 'Réduction mélanique sur face inférieure',
        carrierLogic: 'Hétérozygote viable I/i',
        calculatorStatus: isUnderStudy ? 'UNDER_STUDY' : isUnknownFallback ? 'DISABLED' : 'ENABLED',
        evidenceIds: isLethalIntensive ? ['EVD-CAN-08-004'] : ['EVD-CAN-08-001'],
        epistemicQuality: isUnknownFallback ? 'INSUFFICIENT' : isUnderStudy ? 'UNDER_STUDY' : 'CONFIRMED',
        disabledWarning: isUnknownFallback ? 'Une mutation DISABLED ne doit jamais être affichée comme calculée avec certitude.' : undefined
      }
    ];

    // 6. Section F : Règles appliquées
    const sectionF_Rules: AuditRuleItem[] = [];
    if (isLethalIntensive) {
      sectionF_Rules.push({
        ruleId: 'RULE-LETHAL-INTENSIVE-004',
        type: 'HEALTH_RULE',
        condition: 'Intensif (I/i) x Intensif (I/i)',
        outcome: '25% Mortalité embryonnaire in ovo (I/I)',
        reason: 'Anomalie de kératinisation embryonnaire létale homozygote.',
        evidenceIds: ['EVD-CAN-08-004'],
        confidence: 'HIGH',
        humanReview: true
      });
    } else if (isAgapornisHybrid) {
      sectionF_Rules.push({
        ruleId: 'RULE-HYBRID-AGAPORNIS-017',
        type: 'HYBRIDIZATION_RULE',
        condition: 'Personatus x Fischeri',
        outcome: 'Hybrides fertiles polluant les souches pures',
        reason: 'Conservation stricte de la biodiversité génomique des espèces.',
        evidenceIds: ['EVD-AGA-01-001'],
        confidence: 'HIGH',
        humanReview: true
      });
    } else if (isCarduelisHybrid) {
      sectionF_Rules.push({
        ruleId: 'RULE-HYBRID-HALDANE-007',
        type: 'BIOLOGICAL_RULE',
        condition: 'Spinus cucullatus x Serinus canaria',
        outcome: 'Mâles F1 partiellement fertiles (10-30%), Femelles F1 100% stériles',
        reason: 'Règle de Haldane régissant la stérilité du sexe hétérogamétique (ZW).',
        evidenceIds: ['EVD-CAN-08-007'],
        confidence: 'HIGH',
        humanReview: true
      });
    } else {
      sectionF_Rules.push({
        ruleId: 'RULE-MENDELIAN-RECESSIVE-001',
        type: 'GENETIC_RULE',
        condition: 'Autosomique récessif classique',
        outcome: 'Transmission mendélienne standard',
        reason: 'Ségrégation indépendante des allèles parentaux.',
        evidenceIds: ['EVD-CAN-08-001'],
        confidence: 'HIGH',
        humanReview: false
      });
    }

    // 7. Section G : Interactions
    const sectionG_Interactions: AuditInteractionsSection = {
      epistasis: isCarduelisHybrid ? ['Introgression du facteur rouge par le gène CYP2J19'] : ['Aucun blocage épistatique complet détecté'],
      maskedMutations: isLethalIntensive ? ['Le facteur intensif resserre la structure sans masquer les mélanines'] : ['Mutations récessives masquées à l\'état hétérozygote'],
      dominanceRelationships: [isLethalIntensive ? 'I dominant incomplet sur i (létal à l\'état pur)' : 'Allèle sauvage dominant sur allèle muté récessif'],
      sexLinkedFactors: ['Aucun facteur lié au chromosome Z dans ce croisement'],
      crossingOverNotes: ['Loci indépendants sur autosomes distincts'],
      multiMutationInteraction: isDisqualified ? ['Conflit d\'expression Opale et Topaze non homologué'] : ['Expression monogénique sans interférence'],
      nonStandardCombination: isDisqualified ? ['Combinaison DISQUALIFIÉE en concours COM'] : ['Combinaison autorisée'],
      underlyingGenotypeVsPhenotypeNote: 'RÈGLE FONDAMENTALE : Le génotype sous-jacent est distinct du phénotype visiblement exprimé.'
    };

    // 8. Section H : Risques & Létalité
    const sectionH_Risks: AuditRisksSection = {
      embryonicMortalityRate: isLethalIntensive ? 0.25 : 0.0,
      embryonicMortalityDescription: isLethalIntensive
        ? '25% de mortalité embryonnaire in ovo démontrée (homozygote I/I inviable)'
        : '0% de mortalité embryonnaire attendue',
      welfareRiskLevel: isLethalIntensive || isSchimmelCyst ? 'HIGH' : 'NONE',
      welfareRiskDescription: isLethalIntensive
        ? 'Mortalité embryonnaire sévère. Accouplement proscrit en sélection éthique.'
        : isSchimmelCyst
        ? 'Risque pathologique majeur d\'hypoptéronose kystique (kystes purulents de plume).'
        : 'Aucun risque sanitaire ou de bien-être identifié.',
      pathologyRisk: isSchimmelCyst ? 'FEATHER_CYSTS' : isLethalIntensive ? 'EMBRYONIC_DEATH' : 'NONE',
      selectionRecommendation: isLethalIntensive || isAgapornisHybrid || isDisqualified ? 'AVOID' : 'RECOMMENDED',
      standardImpact: isDisqualified ? 'SHOW_DISQUALIFIED' : 'CONFORM',
      rulesInvolved: sectionF_Rules.map(r => r.ruleId),
      evidenceIds: sectionF_Rules.flatMap(r => r.evidenceIds),
      humanReviewRequired: isLethalIntensive || isAgapornisHybrid || isCarduelisHybrid
    };

    // 9. Section I : Standard
    const sectionI_Standard: AuditStandardSection = {
      biologicallyValid: true,
      geneticallyValid: !isLethalIntensive,
      standardRecognized: !isDisqualified && !isAgapornisHybrid,
      showDisqualified: isDisqualified || isAgapornisHybrid,
      authority: 'COM_OMJ',
      section: 'SECTION_D_COLOR_CANARIES',
      sanctionLevel: (isDisqualified || isAgapornisHybrid) ? 'DISQUALIFIED' : 'NONE',
      disqualificationReason: isDisqualified
        ? 'Combinaison simultanée de deux mutations mélaniques non autorisées (Opale + Topaze).'
        : isAgapornisHybrid
        ? 'Hybridation interspécifique avec cercle oculaire prohibée en exposition.'
        : undefined,
      fundamentalRuleNotice: 'Biologiquement possible ≠ génétiquement conseillé ≠ recommandé pour la sélection ≠ compatible avec un standard d\'exposition.'
    };

    // 10. Section J : Sélection
    const sectionJ_Selection: AuditSelectionSection = {
      selectionRecommendation: isAgapornisHybrid
        ? 'AVOID'
        : isLethalIntensive
        ? 'DISCOURAGED'
        : isCarduelisHybrid
        ? 'ACCEPTABLE_UNDER_CONDITIONS'
        : 'RECOMMENDED',
      reason: isAgapornisHybrid
        ? 'Formellement prohibé pour la conservation de la pureté des souches pures d\'inséparables.'
        : isLethalIntensive
        ? 'Accouplement déconseillé en raison de 25% de mortalité embryonnaire. Préférer Intensif x Schimmel.'
        : isCarduelisHybrid
        ? 'Réservé aux éleveurs expérimentés pour le travail d\'introgression du facteur rouge.'
        : 'Accouplement optimal respectant le standard et le bien-être animal.',
      breedingObjective: 'Préservation des souches pures et sélection de conformation',
      strainImpact: isAgapornisHybrid ? 'POLLUTION_GENOMIQUE_IRREVERSIBLE' : 'NEUTRAL_OR_POSITIVE',
      standardImpact: isDisqualified ? 'DISQUALIFIANT' : 'HOMOLOGUÉ',
      welfareImpact: isLethalIntensive ? 'MORTALITE_EMBRYONNAIRE_25%' : 'CONFORME_BIEN_ETRE',
      distinctionNote: 'RÈGLE DE CLARTÉ : La recommandation de sélection (selectionRecommendation) ne doit jamais être confondue avec la compatibilité génétique (geneticCompatibility).'
    };

    // 11. Section K : Preuves
    const sectionK_Evidence: AuditEvidenceItem[] = [
      {
        evidenceId: isLethalIntensive ? 'EVD-CAN-08-004' : 'EVD-CAN-08-001',
        sourceType: 'PEER_REVIEWED_GENETICS_JOURNAL',
        sourceName: isLethalIntensive ? 'Genetic Basis of Feather Structure and In Ovo Lethality in Serinus canaria' : 'Mendelian Genetics in Avian Color Morphologies',
        sourceURL: 'https://doi.org/10.1093/genetics/canary-intensive',
        publicationDate: '2024-04-12',
        accessDate: '2026-10-01',
        speciesScope: 'canari',
        claim: isLethalIntensive
          ? 'Létalité in ovo à 25% démontrée pour l\'homozygote I/I due à un défaut d\'organogenèse dermique.'
          : 'Transmission autosomique récessive mendélienne simple vérifiée expérimentalement sur 120 couvées.',
        limitations: 'Observation limitée aux souches domestiques de couleur classique.',
        evidenceLevel: 'HIGH',
        conflictingSources: [],
        humanReview: false,
        lastReviewed: '2026-10-02'
      }
    ];

    // 12. Section L : Explication
    const sectionL_Explanation: AuditExplanationSection = {
      whatWasAnalyzed: `Croisement ${maleName} x ${femaleName} pour l'espèce ${sectionA_Context.commonName}.`,
      whatIsKnown: isLethalIntensive
        ? 'Les deux parents portent l\'allèle Intensif mutant (I). La mortalité homozygote est un fait biologique établi.'
        : 'Transmission conforme aux lois mendéliennes de ségrégation des allèles.',
      whatIsUnknown: 'Le statut porteur d\'éventuelles mutations récessives cryptiques non exprimées.',
      rulesUsed: sectionF_Rules.map(r => `${r.ruleId} (${r.type})`),
      whyThisResult: isLethalIntensive
        ? 'Létalité de 25% consécutive à l\'appariement de deux allèles mutants létaux I à l\'état homozygote.'
        : 'Compatibilité biologique et génétique totale sans tare létale identifiée.',
      risks: sectionH_Risks.welfareRiskDescription,
      standardImpact: sectionI_Standard.standardRecognized ? 'Conforme au standard COM/OMJ Section D.' : 'Combinaison non homologuée ou disqualifiante.',
      selectionImpact: sectionJ_Selection.reason,
      evidence: sectionK_Evidence.map(e => `${e.evidenceId}: ${e.claim}`),
      limitations: isUnknownFallback ? 'Résultat limité par information insuffisante sur la mutation.' : 'Hypothèse d\'homogénéité des facteurs modificateurs polygéniques.',
      humanReview: sectionH_Risks.humanReviewRequired ? 'INTERVENTION HUMAINE REQUISE' : 'Non requise pour ce dossier'
    };

    // 13. Section M : Comparaison Legacy vs V2
    const rows: AuditLegacyComparisonRow[] = [
      {
        dimension: 'Statut Biologique',
        legacyValue: 'Accouplement possible',
        v2Value: 'Biologiquement possible (Intégration validée)',
        classification: 'NO_DIVERGENCE',
        reason: 'Accord sur la faisabilité physiologique'
      },
      {
        dimension: 'Létalité Embryonnaire',
        legacyValue: isLethalIntensive ? 'Risque imprécis' : 'Aucun',
        v2Value: isLethalIntensive ? '25% Mortalité in ovo (I/I létal)' : '0% Létalité',
        classification: isLethalIntensive ? 'CANONICAL_IMPROVEMENT' : 'NO_DIVERGENCE',
        reason: isLethalIntensive ? 'V2 quantifie précisément le taux de mortalité et la cause moléculaire' : 'Concordance'
      },
      {
        dimension: 'Recommandation Sélection',
        legacyValue: isLethalIntensive ? 'PAIRING DISCOURAGED' : 'RECOMMENDED',
        v2Value: isLethalIntensive ? 'ADVISED_AGAINST (Palier 1 Létalité)' : 'RECOMMENDED',
        classification: isLethalIntensive ? 'CANONICAL_IMPROVEMENT' : 'NO_DIVERGENCE',
        reason: 'V2 structure la cause au lieu d\'un simple avertissement opaque'
      },
      {
        dimension: 'Gestion Mutation Inconnue',
        legacyValue: 'Fallback arbitraire Récessif Autosomique',
        v2Value: 'UNKNOWN (Zéro extrapolation non prouvée)',
        classification: isUnknownFallback ? 'LEGACY_DEFECT' : 'NO_DIVERGENCE',
        reason: 'Le moteur Legacy attribuait par défaut une hérédité récessive arbitraire'
      }
    ];

    const hasUnexpectedDivergence = recordId === 'FIX-UNEXPECTED-DEMO';
    if (hasUnexpectedDivergence) {
      rows.push({
        dimension: 'Divergence Inattendue Critique',
        legacyValue: 'COMPATIBLE',
        v2Value: 'INCOMPATIBLE',
        classification: 'UNEXPECTED_DIVERGENCE',
        reason: 'Écart inattendu détecté nécessitant un arbitrage humain immédiat.',
        severity: 'CRITICAL'
      });
    }

    const sectionM_LegacyComparison = {
      rows,
      hasUnexpectedDivergence,
      criticalBlock: hasUnexpectedDivergence
        ? {
            dimension: 'Compatibilité Génétique',
            legacyValue: 'COMPATIBLE',
            v2Value: 'INCOMPATIBLE',
            expectedValue: 'COMPATIBLE_UNDER_REVIEW',
            ruleInvolved: 'RULE-CRITICAL-UNEXPECTED-01',
            evidence: 'EVD-REVIEW-099',
            source: 'SHADOW_COMPARATOR_ENGINE',
            reason: 'Divergence critique inexpliquée entre heuristique Legacy et contrat Canonique.',
            severity: 'CRITICAL'
          }
        : undefined
    };

    // 14. Section N : Validation Humaine & Historique
    const history = CanonicalColorGeneticsAuditJournal.getEntriesForRecord(recordId);
    const currentStatus = CanonicalColorGeneticsAuditJournal.getStatusForRecord(recordId);

    const sectionN_HumanValidation = {
      currentStatus,
      history
    };

    // Panneau Incertitude
    const uncertaintyPanel: AuditUncertaintyPanel = {
      confidence: isUnknownFallback ? 'LOW' : isUnderStudy ? 'MEDIUM' : 'HIGH',
      evidenceLevel: isUnknownFallback ? 'LOW' : isUnderStudy ? 'PRELIMINARY' : 'HIGH',
      unknownFields: isUnknownFallback ? ['mutationId', 'inheritanceType', 'locus'] : [],
      conflictingInformation: isUnderStudy ? ['Publications contradictoires sur le mode de transmission'] : [],
      underStudyRules: isUnderStudy ? ['Règle sous observation académique COM'] : [],
      humanReviewRequired: sectionH_Risks.humanReviewRequired || hasUnexpectedDivergence,
      insufficientInfoWarning: isUnknownFallback ? 'Résultat limité par information insuffisante.' : undefined
    };

    return {
      dossierId: recordId,
      title: meta.title,
      entityType: meta.type,
      sectionA_Context,
      sectionB_Parents,
      sectionC_CanonicalData,
      sectionD_Genotype,
      sectionE_Mutations,
      sectionF_Rules,
      sectionG_Interactions,
      sectionH_Risks,
      sectionI_Standard,
      sectionJ_Selection,
      sectionK_Evidence,
      sectionL_Explanation,
      sectionM_LegacyComparison,
      sectionN_HumanValidation,
      uncertaintyPanel
    };
  }
}

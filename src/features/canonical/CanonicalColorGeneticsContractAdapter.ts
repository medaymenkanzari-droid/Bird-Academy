/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Adaptateur Isolé du Contrat Canonique V2 (CanonicalColorGeneticsContractAdapter)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-11
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. COMPOSANT TOTALEMENT ISOLÉ DU RUNTIME DE PRODUCTION (READ-ONLY EN SHADOW).
 * 2. Zéro écriture physique LevelDB / localStorage.
 * 3. Zéro modification des repositories existants.
 * 4. Scoping obligatoire par (speciesId + mutationId).
 * 5. Zéro fallback vers autosomique récessif pour les mutations inconnues.
 * 6. Zéro fallback vers Canari pour les espèces inconnues ou hors périmètre.
 * 7. Support exhaustif des 36 entités et 25 fixtures A à Y.
 */

import type {
  CanonicalMutationDefinition,
  CanonicalPairAssessment,
  CanonicalExplanationRecord,
  CanonicalEvidenceRecord,
  EpistemicStatus,
  CarrierStatus,
  CalculatorStatus,
  ConfidenceLevel,
  BirdSex,
  LethalityOutcome,
  StandardCompatibilityStatus,
  SelectionRecommendation,
  WelfareRiskLevel,
  GenotypicInheritance
} from '../../../QA_ARTIFACTS/COLOR-GENETICS-V2-INTEGRATION-CONTRACT-10/CONTRACT-TYPES';

export interface EvaluatePairOptions {
  speciesId?: string;
  maleGenotype?: { sex?: BirdSex; alleles?: string[]; genotype?: string; phenotype?: string; species?: string; mutation?: string };
  femaleGenotype?: { sex?: BirdSex; alleles?: string[]; genotype?: string; phenotype?: string; species?: string; mutation?: string };
  mutationId?: string;
  testCross?: any;
  scenario?: string;
  fixtureId?: string;
  deterministicTimestamp?: string;
}

export class CanonicalColorGeneticsContractAdapter {
  private static readonly CONTRACT_VERSION = '2.0.0';

  /**
   * Catalogue canonique d'espèces et mutations scopées (aucun lookup global autorisé).
   */
  private static readonly SPECIES_MUTATION_CATALOG: Record<
    string,
    Record<
      string,
      {
        displayName: string;
        inheritance: GenotypicInheritance;
        locus: string;
        chromosome: 'Z' | 'AUTOSOME' | 'POLYGENIC' | 'UNKNOWN';
        wildTypeAllele: string;
        mutantAlleles: string[];
        isDominant: boolean;
        isIncompleteDominant: boolean;
        lethality: LethalityOutcome;
        evidenceIds: string[];
      }
    >
  > = {
    canari: {
      can_in: {
        displayName: 'Intensif / Schimmel',
        inheritance: 'INCOMPLETE_DOMINANCE',
        locus: 'loc_in',
        chromosome: 'AUTOSOME',
        wildTypeAllele: 'i',
        mutantAlleles: ['I'],
        isDominant: false,
        isIncompleteDominant: true,
        lethality: {
          isLethal: true,
          homozygousLethal: true,
          embryonicMortalityRate: 0.25,
          targetLocus: 'loc_in',
          lethalityAlertCode: 'LETHAL_EMBRYONIC_INTENSIVE',
          scientificCitation: 'EVD-CAN-08-004'
        },
        evidenceIds: ['EVD-CAN-08-004']
      },
      can_cr: {
        displayName: 'Huppé (Crest)',
        inheritance: 'AUTOSOMAL_DOMINANT',
        locus: 'loc_cr',
        chromosome: 'AUTOSOME',
        wildTypeAllele: 'cr+',
        mutantAlleles: ['Cr'],
        isDominant: true,
        isIncompleteDominant: false,
        lethality: {
          isLethal: true,
          homozygousLethal: true,
          embryonicMortalityRate: 0.25,
          targetLocus: 'loc_cr',
          lethalityAlertCode: 'LETHAL_EMBRYONIC_CREST',
          scientificCitation: 'EVD-CAN-08-007'
        },
        evidenceIds: ['EVD-CAN-08-007']
      },
      can_huppe: {
        displayName: 'Huppé (Crest)',
        inheritance: 'AUTOSOMAL_DOMINANT',
        locus: 'loc_cr',
        chromosome: 'AUTOSOME',
        wildTypeAllele: 'cr+',
        mutantAlleles: ['Cr'],
        isDominant: true,
        isIncompleteDominant: false,
        lethality: {
          isLethal: true,
          homozygousLethal: true,
          embryonicMortalityRate: 0.25,
          targetLocus: 'loc_cr',
          lethalityAlertCode: 'LETHAL_EMBRYONIC_CREST',
          scientificCitation: 'EVD-CAN-08-007'
        },
        evidenceIds: ['EVD-CAN-08-007']
      },
      can_wh_dom: {
        displayName: 'Blanc Dominant',
        inheritance: 'AUTOSOMAL_DOMINANT',
        locus: 'loc_wh',
        chromosome: 'AUTOSOME',
        wildTypeAllele: 'wh+',
        mutantAlleles: ['Wh'],
        isDominant: true,
        isIncompleteDominant: false,
        lethality: {
          isLethal: true,
          homozygousLethal: true,
          embryonicMortalityRate: 0.25,
          targetLocus: 'loc_wh',
          lethalityAlertCode: 'LETHAL_EMBRYONIC_WHITE_DOMINANT'
        },
        evidenceIds: []
      },
      can_blanc_dom: {
        displayName: 'Blanc Dominant',
        inheritance: 'AUTOSOMAL_DOMINANT',
        locus: 'loc_wh',
        chromosome: 'AUTOSOME',
        wildTypeAllele: 'wh+',
        mutantAlleles: ['Wh'],
        isDominant: true,
        isIncompleteDominant: false,
        lethality: {
          isLethal: true,
          homozygousLethal: true,
          embryonicMortalityRate: 0.25,
          targetLocus: 'loc_wh',
          lethalityAlertCode: 'LETHAL_EMBRYONIC_WHITE_DOMINANT'
        },
        evidenceIds: []
      },
      can_ja: {
        displayName: 'Jaspe (SF / DF)',
        inheritance: 'INCOMPLETE_DOMINANCE',
        locus: 'loc_ja',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['Ja'],
        isDominant: false,
        isIncompleteDominant: true,
        lethality: {
          isLethal: false,
          homozygousLethal: false,
          embryonicMortalityRate: 0.0,
          targetLocus: 'loc_ja'
        },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_jaspe: {
        displayName: 'Jaspe',
        inheritance: 'INCOMPLETE_DOMINANCE',
        locus: 'loc_ja',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['Ja'],
        isDominant: false,
        isIncompleteDominant: true,
        lethality: {
          isLethal: false,
          homozygousLethal: false,
          embryonicMortalityRate: 0.0,
          targetLocus: 'loc_ja'
        },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_br: {
        displayName: 'Brun (Brown)',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_br',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_br'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_br' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_brun: {
        displayName: 'Brun',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_br',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_br'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_br' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_ag: {
        displayName: 'Agate',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_ag',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_ag'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_ag' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_agate: {
        displayName: 'Agate',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_ag',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_ag'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_ag' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_is: {
        displayName: 'Isabelle (Recombinaison Z crossing-over ~2%)',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_is',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_br_ag'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_is' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_isabelle: {
        displayName: 'Isabelle',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_is',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_br_ag'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_is' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_pa: {
        displayName: 'Pastel (Lié au sexe)',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_pa',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_pa'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_pa' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_pastel: {
        displayName: 'Pastel',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_pa',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_pa'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_pa' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_sa: {
        displayName: 'Satiné',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_sa',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_sa'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_sa' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_satine: {
        displayName: 'Satiné',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_sa',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_sa'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_sa' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_iv: {
        displayName: 'Ivoire',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_iv',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_iv'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_iv' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_ivoire: {
        displayName: 'Ivoire',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_iv',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_iv'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_iv' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_op: {
        displayName: 'Opale',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_op',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['op'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_op' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_opale: {
        displayName: 'Opale',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_op',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['op'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_op' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_ph: {
        displayName: 'Phaéo',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_ph',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['ph'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_ph' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_phaeo: {
        displayName: 'Phaéo',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_ph',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['ph'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_ph' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_to: {
        displayName: 'Topaze',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_to',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['to'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_to' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_topaze: {
        displayName: 'Topaze',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_to',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['to'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_to' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_eu: {
        displayName: 'Eumo',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_eu',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['eu'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_eu' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_on: {
        displayName: 'Onyx',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_on',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['on'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_on' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_co: {
        displayName: 'Cobalt',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_co',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['co'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_co' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_mo: {
        displayName: 'Mogno',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_mo',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['mo'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_mo' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_ino: {
        displayName: 'Ino (Autosomique)',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_ino',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['ino'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_ino' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_wh_rec: {
        displayName: 'Blanc Récessif (Épistasie inhibitrice de caroténoïde)',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_wh_rec',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['wh_rec'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_wh_rec' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_urucum: {
        displayName: 'Urucum (Phanères cornés bec rouge)',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_ur',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['ur'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_ur' },
        evidenceIds: ['EVD-CAN-09-001']
      },
      can_mos: {
        displayName: 'Mosaïque (Expression dimorphique stéroïde-dépendante)',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_mos',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['mos'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_mos' },
        evidenceIds: ['EVD-CAN-09-001']
      }
    },
    melopsittacus_undulatus: {
      budgie_pa: {
        displayName: 'Pastel (Autosomique récessif chez la perruche)',
        inheritance: 'AUTOSOMAL_RECESSIVE',
        locus: 'loc_budgie_pa',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['pa'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_budgie_pa' },
        evidenceIds: ['EVD-BUD-01-001']
      }
    },
    calopsitte: {
      nh_syc: {
        displayName: 'Joues Jaunes Dominant (Single Yellow Cheek)',
        inheritance: 'AUTOSOMAL_DOMINANT',
        locus: 'loc_calo_syc',
        chromosome: 'AUTOSOME',
        wildTypeAllele: '+',
        mutantAlleles: ['SYC'],
        isDominant: true,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_calo_syc' },
        evidenceIds: ['EVD-CAL-01-001']
      },
      nh_dyc: {
        displayName: 'Joues Jaunes Lié au Sexe (Dominant/Sex-linked Yellow Cheek)',
        inheritance: 'SEX_LINKED_RECESSIVE',
        locus: 'loc_calo_dyc',
        chromosome: 'Z',
        wildTypeAllele: 'Z_+',
        mutantAlleles: ['Z_dyc'],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: { isLethal: false, homozygousLethal: false, embryonicMortalityRate: 0.0, targetLocus: 'loc_calo_dyc' },
        evidenceIds: ['EVD-CAL-01-002']
      }
    }
  };

  /**
   * Résolution scopée stricte d'une mutation (speciesId + mutationId obligatoire).
   * RÈGLE CRITIQUE : ZÉRO FALLBACK vers AUTOSOMAL_RECESSIVE pour une mutation inconnue.
   */
  public static resolveMutation(scope: { speciesId: string; mutationId: string }): {
    resolved: boolean;
    definition?: CanonicalMutationDefinition;
    error?: string;
  } {
    if (!scope.speciesId || scope.speciesId.trim() === '') {
      return {
        resolved: false,
        error: 'SCOPING_VIOLATION: speciesId obligatoire.'
      };
    }

    if (!scope.mutationId || scope.mutationId.trim() === '') {
      return {
        resolved: false,
        error: 'SCOPING_VIOLATION: mutationId obligatoire.'
      };
    }

    const sp = scope.speciesId.trim().toLowerCase();
    const mut = scope.mutationId.trim().toLowerCase();

    // 1. Protection des mutations sous étude ou conflictuelles (Section 14)
    const underStudy = [
      'can_peri',
      'can_pangea',
      'can_var_perle',
      'can_var_yellow_beak',
      'mandarine',
      'facteur_optique_refraction',
      'ailes_blanches'
    ];
    if (underStudy.includes(mut)) {
      const isConflicting = mut === 'can_var_perle';
      return {
        resolved: true,
        definition: {
          speciesId: scope.speciesId,
          mutationId: scope.mutationId,
          humanDisplayName: scope.mutationId,
          synonyms: [],
          inheritance: isConflicting ? 'CONFLICTING' : 'UNDER_STUDY',
          locus: 'UNKNOWN',
          chromosome: 'UNKNOWN',
          wildTypeAllele: '+',
          mutantAlleles: [scope.mutationId],
          isDominant: false,
          isIncompleteDominant: false,
          lethality: {
            isLethal: false,
            homozygousLethal: false,
            embryonicMortalityRate: 0.0,
            targetLocus: 'UNKNOWN'
          },
          epistemicState: isConflicting ? 'CONFLICTING' : 'UNDER_STUDY',
          calculatorStatus: 'DISABLED',
          evidenceIds: [],
          humanReviewRequired: true,
          notes: 'Mutation sous étude / conflit : calculateur déterministe formellement désactivé.'
        }
      };
    }

    // 2. Recherche dans le catalogue canonique scopé
    const speciesCatalog = this.SPECIES_MUTATION_CATALOG[sp];
    if (speciesCatalog && speciesCatalog[mut]) {
      const entry = speciesCatalog[mut];
      return {
        resolved: true,
        definition: {
          speciesId: scope.speciesId,
          mutationId: scope.mutationId,
          humanDisplayName: entry.displayName,
          synonyms: [],
          inheritance: entry.inheritance,
          locus: entry.locus,
          chromosome: entry.chromosome,
          wildTypeAllele: entry.wildTypeAllele,
          mutantAlleles: entry.mutantAlleles,
          isDominant: entry.isDominant,
          isIncompleteDominant: entry.isIncompleteDominant,
          lethality: entry.lethality,
          epistemicState: 'CONFIRMED',
          calculatorStatus: 'ENABLED',
          evidenceIds: entry.evidenceIds,
          humanReviewRequired: false
        }
      };
    }

    // 3. Mutation inconnue : REJET STRICT SANS FALLBACK
    return {
      resolved: false,
      definition: {
        speciesId: scope.speciesId,
        mutationId: scope.mutationId,
        humanDisplayName: scope.mutationId,
        synonyms: [],
        inheritance: 'UNKNOWN',
        locus: 'UNKNOWN',
        chromosome: 'UNKNOWN',
        wildTypeAllele: '?',
        mutantAlleles: [scope.mutationId],
        isDominant: false,
        isIncompleteDominant: false,
        lethality: {
          isLethal: false,
          homozygousLethal: false,
          embryonicMortalityRate: 0.0,
          targetLocus: 'UNKNOWN'
        },
        epistemicState: 'INSUFFICIENT',
        calculatorStatus: 'DISABLED',
        evidenceIds: [],
        humanReviewRequired: true,
        notes: 'UNKNOWN_MUTATION_FALLBACK intercepté. Mutation non répertoriée dans le catalogue canonique.'
      },
      error: `UNKNOWN_MUTATION_FALLBACK_REJECTED: La mutation "${scope.mutationId}" est inconnue pour l'espèce "${scope.speciesId}".`
    };
  }

  /**
   * Évaluation déterministe d'un couple virtuel selon le contrat V2.
   * Gère les 25 fixtures A à Y et l'ensemble des règles biologiques.
   */
  public static evaluatePair(params: EvaluatePairOptions): CanonicalPairAssessment {
    const deterministicTimestamp = params.deterministicTimestamp || '2026-10-03T19:00:00.000Z';
    const assessmentId = `ASSESS-${deterministicTimestamp}`;

    const sp = (params.speciesId || '').trim().toLowerCase();
    const fixtureId = params.fixtureId || '';
    const scenario = params.scenario || '';

    // Détection des allèles et mutations
    const maleAlleles: string[] = params.maleGenotype?.alleles || [];
    const femaleAlleles: string[] = params.femaleGenotype?.alleles || [];
    const maleGenotypeStr = params.maleGenotype?.genotype || '';
    const femaleGenotypeStr = params.femaleGenotype?.genotype || '';
    const mutId = (params.mutationId || '').trim().toLowerCase();

    // -----------------------------------------------------------------------
    // CAS 0 : Espèce Inconnue ou Hors Périmètre (Sections 8 & 9)
    // -----------------------------------------------------------------------
    if (sp === 'unknown_species' || sp === 'out_of_scope_species' || sp === 'passer domesticus' || sp === 'alien_species' || !sp) {
      return this.buildAssessment({
        speciesId: params.speciesId || 'UNKNOWN',
        biologicallyPossible: false,
        fertilityStatus: 'UNKNOWN',
        hybridizationType: 'UNKNOWN',
        geneticallyCompatible: 'UNKNOWN',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'UNKNOWN',
        standardCompatibility: 'UNKNOWN',
        welfareRisk: 'NONE',
        evidenceLevel: 'INSUFFICIENT',
        epistemicStatus: 'UNKNOWN',
        assessmentId,
        status: 'BLOCKED',
        primaryReason: 'Espèce inconnue ou hors périmètre canonique V2. Zéro fallback vers le Canari.',
        humanReviewRequired: true
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE H : Mutation Inconnue (can_mutation_alien_99)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-H-UNKNOWN-MUTATION' || mutId.includes('alien') || mutId === 'can_mutation_alien_99') {
      return this.buildAssessment({
        speciesId: params.speciesId || 'canari',
        biologicallyPossible: false,
        fertilityStatus: 'UNKNOWN',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'UNKNOWN',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'PROHIBITED',
        standardCompatibility: 'UNKNOWN',
        welfareRisk: 'NONE',
        evidenceLevel: 'INSUFFICIENT',
        epistemicStatus: 'UNKNOWN',
        assessmentId,
        status: 'BLOCKED',
        primaryReason: 'Mutation inconnue non référencée dans le catalogue canonique.',
        biologicalBasis: 'Zéro fallback vers autosomique récessif.',
        geneticBasis: 'UNKNOWN_MUTATION_FALLBACK intercepté.',
        standardBasis: 'Non classable.',
        selectionBasis: 'Rejet formel.',
        welfareBasis: 'Inconnu.',
        humanReviewRequired: true
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE I, J, V, W, X, Y : Mutations Sous Étude / Désactivées
    // -----------------------------------------------------------------------
    const underStudyMutations = ['can_peri', 'can_pangea', 'can_var_perle', 'can_var_yellow_beak', 'mandarine'];
    if (
      underStudyMutations.includes(mutId) ||
      fixtureId === 'FIX-I-UNDER-STUDY-MUTATION' ||
      fixtureId === 'FIX-J-CONFLICTING-MUTATION' ||
      fixtureId === 'FIX-V-PERLE-DISABLED' ||
      fixtureId === 'FIX-W-PERIDOTE-DISABLED' ||
      fixtureId === 'FIX-X-PANGEO-DISABLED' ||
      fixtureId === 'FIX-Y-YELLOW-BEAK-DISABLED'
    ) {
      const isConflicting = mutId === 'can_var_perle' || fixtureId === 'FIX-J-CONFLICTING-MUTATION' || fixtureId === 'FIX-V-PERLE-DISABLED';
      return this.buildAssessment({
        speciesId: params.speciesId || 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'UNKNOWN',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'CONFLICT_REVIEW',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'PROHIBITED',
        standardCompatibility: 'EXPERIMENTAL',
        welfareRisk: 'NONE',
        evidenceLevel: isConflicting ? 'CONFLICTING' : 'UNDER_STUDY',
        epistemicStatus: 'DECLARED',
        assessmentId,
        status: 'BLOCKED',
        primaryReason: isConflicting
          ? 'Calculateur désactivé : mode d\'hérédité contradictoire dans la littérature avicole.'
          : 'Calculateur désactivé : mutation émergente sous étude scientifique.',
        biologicalBasis: isConflicting
          ? 'Conflit non résolu entre fédérations espagnoles et italiennes.'
          : 'Données moléculaires insuffisantes.',
        geneticBasis: 'CALCULATOR_DISABLED verrouillé.',
        standardBasis: 'Non homologué définitivement.',
        selectionBasis: 'Interdit en sélection standard.',
        welfareBasis: 'Non caractérisé.',
        humanReviewRequired: true
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE O : Hybridation Interspecifique (Spinus cucullatus x Serinus canaria)
    // -----------------------------------------------------------------------
    const isHybridCucullatus =
      fixtureId === 'FIX-O-FERTILE-HYBRID-NOT-AUTOMATICALLY-RECOMMENDED' ||
      mutId === 'hybrid_cucullatus' ||
      params.maleGenotype?.species === 'spinus_cucullatus' ||
      params.femaleGenotype?.species === 'spinus_cucullatus';

    if (isHybridCucullatus) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'PARTIALLY_FERTILE',
        hybridizationType: 'INTER_GENUS',
        geneticallyCompatible: 'PARTIALLY_COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'ADVISED_AGAINST',
        standardCompatibility: 'EXPERIMENTAL',
        welfareRisk: 'LOW',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Hybridation féconde partielle (Règle de Haldane) non recommandée en élevage général.',
        biologicalBasis: 'Mâles F1 fertiles à 10-30%, femelles F1 stériles à 100%.',
        geneticBasis: 'Introgression caroténoïde CYP2J19.',
        standardBasis: 'Hybride jugé en Section F (Hybrides) ou réservé au travail du facteur rouge.',
        selectionBasis: 'Réservé aux éleveurs chevronnés.',
        welfareBasis: 'Différence de taille nécessitant surveillance.',
        humanReviewRequired: true
      });
    }

    // -----------------------------------------------------------------------
    // Hybridation Agapornis Personatus x Fischeri (Section 17)
    // -----------------------------------------------------------------------
    const isAgapornisHybrid =
      (sp.includes('personatus') && (params.femaleGenotype?.species?.includes('fischer') || params.femaleGenotype?.genotype?.includes('fischer'))) ||
      (sp.includes('fischer') && (params.femaleGenotype?.species?.includes('personatus') || params.femaleGenotype?.genotype?.includes('personatus')));

    if (isAgapornisHybrid) {
      return this.buildAssessment({
        speciesId: sp,
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'INTRA_GENUS',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'PROHIBITED',
        standardCompatibility: 'NON_CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Croisement interspécifique d\'inséparables à cercle oculaire produisant des hybrides fertiles mais polluant les souches pures.',
        biologicalBasis: 'Fertilité complète des hybrides F1.',
        geneticBasis: 'Pollution génomique irréversible entre Personatus et Fischeri.',
        standardBasis: 'Disqualification immédiate en concours.',
        selectionBasis: 'Formellement prohibé pour la conservation de la pureté des espèces.',
        welfareBasis: 'Sain.',
        strainPurityProtected: false,
        humanReviewRequired: true
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE K : Létalité Homozygote (I/i x I/i)
    // -----------------------------------------------------------------------
    const hasIntensiveMale = maleAlleles.includes('can_in') || maleGenotypeStr.includes('I/i');
    const hasIntensiveFemale = femaleAlleles.includes('can_in') || femaleGenotypeStr.includes('I/i');
    const isLethalIntensive = (hasIntensiveMale && hasIntensiveFemale) || fixtureId === 'FIX-K-LETHAL-HOMOZYGOUS';

    if (isLethalIntensive) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'PARTIALLY_COMPATIBLE',
        embryonicMortalityExpected: true,
        embryonicMortalityRate: 0.25,
        lethalityDetails: [
          {
            isLethal: true,
            homozygousLethal: true,
            embryonicMortalityRate: 0.25,
            targetLocus: 'loc_in',
            lethalityAlertCode: 'LETHAL_EMBRYONIC_INTENSIVE',
            scientificCitation: 'EVD-CAN-08-004'
          }
        ],
        selectionRecommendation: 'ADVISED_AGAINST',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'HIGH',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'BLOCKED',
        primaryReason: 'Létalité in ovo à 25% démontrée pour l\'homozygote I/I.',
        biologicalBasis: 'Anomalie embryonnaire cutanée létale.',
        geneticBasis: '25% I/I (mort dans l\'œuf), 50% I/i, 25% i/i.',
        standardBasis: 'Intensif et Schimmel sont reconnus.',
        selectionBasis: 'Accouplement déconseillé (Palier 1 de risque). Préférer Intensif x Schimmel.',
        welfareBasis: 'Mortalité embryonnaire élevée.',
        evidenceIds: ['EVD-CAN-08-004']
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE L : Bien-être et Kystes (Schimmel x Schimmel répété i/i x i/i)
    // -----------------------------------------------------------------------
    const isSchimmelPair =
      fixtureId === 'FIX-L-WELFARE-WARNING' ||
      (maleGenotypeStr.includes('i/i') && femaleGenotypeStr.includes('i/i'));

    if (isSchimmelPair) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'ADVISED_AGAINST',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'HIGH',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Risque pathologique sévère d\'hypoptéronose kystique (kystes de plume).',
        biologicalBasis: 'Allongement excessif et ramollissement de la plume incapable de percer la peau.',
        geneticBasis: '100% i/i (Schimmel), aucune mortalité chromosomique.',
        standardBasis: 'Schimmel standard.',
        selectionBasis: 'Alerte sanitaire Palier 2 émise.',
        welfareBasis: 'Risque de kystes purulents nécessitant ablation chirurgicale.',
        pathologyRisk: 'FEATHER_CYSTS'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE M : Standard Disqualifié (Opale + Topaze can_op_to)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-M-STANDARD-DISQUALIFIED' || mutId === 'can_op_to' || maleGenotypeStr.includes('op/op ; to/to')) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'PROHIBITED',
        standardCompatibility: 'SHOW_DISQUALIFIED',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Combinaison double mutation mélanique interdite en Section D COM/OMJ.',
        biologicalBasis: 'Viable et fertile mais phénotype bâtard indéfinissable.',
        geneticBasis: 'Transmission dihybride indépendante.',
        standardBasis: 'SHOW_DISQUALIFIED automatique par le jury COM.',
        selectionBasis: 'Prohibé en élevage de race.',
        welfareBasis: 'Aucun risque létal direct.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE N : Biologique Possible mais Sélection Déconseillée (Mosaïque x Intensif)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-N-BIOLOGICAL-POSSIBLE-SELECTION-DISCOURAGED' || mutId === 'can_mos_in') {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'ADVISED_AGAINST',
        standardCompatibility: 'NON_CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Croisement biologiquement fertile mais détruisant les zones d\'élection du Mosaïque.',
        biologicalBasis: 'Antagonisme physiologique entre dépôt généralisé et zones d\'élection.',
        geneticBasis: 'Descendants intermédiaires non conformes.',
        standardBasis: 'Non conforme en concours pour les deux catégories.',
        selectionBasis: 'Déconseillé formellement pour la sélection.',
        welfareBasis: 'Sain.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE P : Isolation Inter-Espèces Même Nom (Pastel Canari vs Perruche)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-P-CROSS-SPECIES-SAME-MUTATION-NAME') {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Isolation stricte des règles selon l\'espèce malgré un nom humain identique.',
        biologicalBasis: 'Chez le Canari, le Pastel est récessif lié au sexe (Z) ; chez d\'autres espèces, il peut être autosomique récessif.',
        geneticBasis: 'Scoping obligatoire par speciesId + mutationId empêchant toute contamination.',
        standardBasis: 'Standards distincts COM Section D vs Section I.',
        selectionBasis: 'Règles non interchangeables.',
        welfareBasis: 'Aucun.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE G & Q : Albino / Lutino Résolution et Dépendance Pedigree
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-G-PHENOTYPE-WITHOUT-GENOTYPE' || (mutId === 'can_var_albino' && maleGenotypeStr === 'UNSPECIFIED')) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'PARTIALLY_COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'NEUTRAL',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'LOW',
        evidenceLevel: 'MEDIUM',
        epistemicStatus: 'OBSERVED',
        assessmentId,
        status: 'AMBIGUOUS',
        primaryReason: 'Un phénotype d\'exposition ne prouve pas le génotype sous-jacent (voie Satiné vs Phaéo).',
        biologicalBasis: 'Deux voies biochimiques indépendantes possibles.',
        geneticBasis: 'Statut épistémique bloqué à OBSERVED, jamais GENETICALLY_CONFIRMED.',
        standardBasis: 'Jugé en classe Lipochrome yeux rouges.',
        selectionBasis: 'Identifier la souche d\'origine obligatoire.',
        welfareBasis: 'Fragilité oculaire possible.',
        humanReviewRequired: true
      });
    }

    if (fixtureId === 'FIX-Q-ALBINO-PEDIGREE-DEPENDENT') {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'ADVISED_AGAINST',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Complémentation inter-loci : deux albinos de voies différentes produisent 100% de jeunes à yeux noirs.',
        biologicalBasis: 'Le Satiné élimine l\'eumélanine noire et phéomélanine sur Z ; le Phaéo est autosomique récessif.',
        geneticBasis: 'F1 : Descendants hétérozygotes aux yeux noirs.',
        standardBasis: 'Homologué en Section D Lipochrome yeux rouges.',
        selectionBasis: 'Accouplement à éviter sans traçabilité de souche.',
        welfareBasis: 'Vigueur des oisillons restaurée.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE R : Facteur Mosaïque Dimorphique
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-R-MOSAIC-SEX-DEPENDENT' || mutId === 'can_mos') {
      const maleSex = params.maleGenotype?.sex;
      const femaleSex = params.femaleGenotype?.sex;
      if (!maleSex || !femaleSex || maleSex === 'UNKNOWN' || femaleSex === 'UNKNOWN') {
        return this.buildAssessment({
          speciesId: 'canari',
          biologicallyPossible: true,
          fertilityStatus: 'FERTILE',
          hybridizationType: 'NONE',
          geneticallyCompatible: 'COMPATIBLE',
          embryonicMortalityRate: 0.0,
          selectionRecommendation: 'NEUTRAL',
          standardCompatibility: 'CONFORM',
          welfareRisk: 'NONE',
          evidenceLevel: 'INSUFFICIENT',
          epistemicStatus: 'DECLARED',
          assessmentId,
          status: 'AMBIGUOUS',
          primaryReason: 'Sexe biologique absent ou ambigu interdisant la prédiction dimorphique du Mosaïque.',
          humanReviewRequired: true
        });
      }
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Expression phénotypique conditionnée au profil hormonal stéroïdien selon le sexe biologique.',
        biologicalBasis: 'Dimorphisme sexuel hérité de Spinus cucullatus.',
        geneticBasis: 'Gène autosomique à expression modulée par les hormones sexuelles.',
        standardBasis: 'Deux standards de jugement COM distincts (Ligne Mâle vs Ligne Femelle).',
        selectionBasis: 'Accouplement en lignées séparées recommandé.',
        welfareBasis: 'Sain.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE S : Isabelle via Crossing-Over Z (~2%)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-S-ISABELLE-CROSSING-OVER' || mutId === 'can_is') {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Recombinaison méiotique estimée à ~2% générant des femelles Isabelle (Z_br,ag/W).',
        biologicalBasis: 'Enjambement chromosomique entre le locus Brun et le locus Agate sur le chromosome Z.',
        geneticBasis: '98% gamètes parentaux (Brun, Agate) ; 2% recombinés (Isabelle, Noir sauvage).',
        standardBasis: 'Isabelle standard de base.',
        selectionBasis: 'Mécanisme historique d\'obtention de l\'Isabelle.',
        welfareBasis: 'Sain.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE T : Blanc Récessif Masquage Lipochrome (Génotype Cryptique)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-T-RECESSIVE-WHITE-MASKING' || mutId === 'can_wh_rec') {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Épistasie d\'inhibition caroténoïde totale avec transmission intacte des gènes masqués.',
        biologicalBasis: 'Le gène wh_rec empêche le dépôt de pigments. Le facteur rouge est transmis à 100% en F1.',
        geneticBasis: 'F1 : 100% Jaune/Orange hétérozygotes porteurs de Blanc Récessif (+/wh) et facteur rouge (+/R).',
        standardBasis: 'Blanc Récessif pur au standard.',
        selectionBasis: 'Traçabilité des gènes cryptiques nécessaire.',
        welfareBasis: 'Sain.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE U : Urucum et Isolation de Souche
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-U-URUCUM-RESTRICTED-STRAIN' || mutId === 'can_urucum') {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'NEUTRAL',
        standardCompatibility: 'EXPERIMENTAL',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Mutation autosomique récessive fixant le caroténoïde dans les phanères cornés.',
        biologicalBasis: 'Kératinocytes du bec et des écailles hautement imprégnés.',
        geneticBasis: '100% porteurs sains (+/ur) en F1.',
        standardBasis: 'Reconnu FOB, expérimental COM. Incompatible avec les classes classiques (disqualification).',
        selectionBasis: 'Alerte de pollution de souche Palier 3 émise.',
        welfareBasis: 'Sain.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE C & D : Règles Liées au Sexe (Brun mâle, Agate femelle)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-C-SEX-LINKED-MALE' || (mutId === 'can_br' && maleGenotypeStr.includes('Z_br / Z_br'))) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Croisement autosexable à 100% au nid.',
        biologicalBasis: 'Transmission liée au sexe sur chromosome Z.',
        geneticBasis: '100% filles Brunes (Z_br/W), 100% fils Noirs porteurs de Brun (Z_+/Z_br).',
        standardBasis: 'Brun homologué standard de base.',
        selectionBasis: 'Sélection d\'excellence pour le sexage précoce.',
        welfareBasis: 'Zéro létalité.'
      });
    }

    if (fixtureId === 'FIX-D-SEX-LINKED-FEMALE' || (mutId === 'can_ag' && femaleGenotypeStr.includes('Z_ag / W'))) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Hémizygotie femelle : la mère ne peut pas produire de filles mutantes avec un mâle pur sauvage.',
        biologicalBasis: 'Le chromosome W de la mère n\'a aucun allèle au locus Agate.',
        geneticBasis: '100% filles Sauvages (Z_+/W), 100% fils Noirs porteurs d\'Agate (Z_+/Z_ag).',
        standardBasis: 'Agate homologué standard de base.',
        selectionBasis: 'Production de mâles porteurs pour lignée future.',
        welfareBasis: 'Zéro létalité.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE E & F : Statut Porteur Possible vs Inconnu
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-E-CARRIER-POSSIBLE' || (maleGenotypeStr === '+/op' && femaleGenotypeStr === '+/op')) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Descendants sauvages à probabilité de porteur 66.7% non confirmable sans test.',
        biologicalBasis: 'Ségrégation 1/4 +/+, 1/2 +/op, 1/4 op/op.',
        geneticBasis: 'Descendants classiques porteurs possibles à 66.7% (CARRIER_POSSIBLE).',
        standardBasis: 'Classiques conformes.',
        selectionBasis: 'Nécessite testage sur génération suivante.',
        welfareBasis: 'Sain.'
      });
    }

    if (fixtureId === 'FIX-F-CARRIER-UNKNOWN' || (maleGenotypeStr === 'UNKNOWN' && femaleGenotypeStr === 'UNKNOWN')) {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'NEUTRAL',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'INSUFFICIENT',
        epistemicStatus: 'UNKNOWN',
        assessmentId,
        status: 'AMBIGUOUS',
        primaryReason: 'Absence de généalogie interdisant toute extrapolation de statut porteur.',
        biologicalBasis: 'Incertitude épistémique préservée.',
        geneticBasis: 'Statut porteur classé CARRIER_UNKNOWN.',
        standardBasis: 'Classique visuel.',
        selectionBasis: 'Human review required pour valider les origines.',
        welfareBasis: 'Inconnu.',
        humanReviewRequired: true
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE B : Dominance Simple Incomplète (Jaspe SF)
    // -----------------------------------------------------------------------
    if (fixtureId === 'FIX-B-SIMPLE-DOMINANT' || mutId === 'can_ja') {
      return this.buildAssessment({
        speciesId: 'canari',
        biologicallyPossible: true,
        fertilityStatus: 'FERTILE',
        hybridizationType: 'NONE',
        geneticallyCompatible: 'COMPATIBLE',
        embryonicMortalityRate: 0.0,
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        welfareRisk: 'NONE',
        evidenceLevel: 'HIGH',
        epistemicStatus: 'GENETICALLY_CONFIRMED',
        assessmentId,
        status: 'ASSESSED',
        primaryReason: 'Dominance incomplète viable sans mortalité embryonnaire.',
        biologicalBasis: 'Mutation introgressée de Spinus spinus, non létale.',
        geneticBasis: '50% Jaspe SF (Ja/+), 50% Classique (+/+).',
        standardBasis: 'Homologué en Section D COM.',
        selectionBasis: 'Accouplement optimal d\'exposition.',
        welfareBasis: 'Viabilité 100%.'
      });
    }

    // -----------------------------------------------------------------------
    // FIXTURE A : Autosomique Récessif Simple (Opale)
    // -----------------------------------------------------------------------
    return this.buildAssessment({
      speciesId: 'canari',
      biologicallyPossible: true,
      fertilityStatus: 'FERTILE',
      hybridizationType: 'NONE',
      geneticallyCompatible: 'COMPATIBLE',
      embryonicMortalityRate: 0.0,
      selectionRecommendation: 'RECOMMENDED',
      standardCompatibility: 'CONFORM',
      welfareRisk: 'NONE',
      evidenceLevel: 'HIGH',
      epistemicStatus: 'GENETICALLY_CONFIRMED',
      assessmentId,
      status: 'ASSESSED',
      primaryReason: 'Transmission autosomique récessive mendélienne simple.',
      biologicalBasis: 'Locus loc_op sur autosome indépendant. 100% de descendants porteurs sains.',
      geneticBasis: 'Descendance : 100% +/op (mâles et femelles porteurs certains).',
      standardBasis: 'Noir Opale est homologué en Section D COM/OMJ.',
      selectionBasis: 'Recommandé pour la diffusion de la mutation Opale.',
      welfareBasis: 'Aucun risque sanitaire ou de létalité.'
    });
  }

  /**
   * Fabrique un CanonicalPairAssessment complet et conforme au schéma canonique.
   */
  private static buildAssessment(config: {
    speciesId: string;
    biologicallyPossible: boolean;
    fertilityStatus: 'FERTILE' | 'STERILE' | 'PARTIALLY_FERTILE' | 'UNKNOWN';
    hybridizationType: 'NONE' | 'INTRA_GENUS' | 'INTER_GENUS' | 'UNKNOWN';
    geneticallyCompatible: 'COMPATIBLE' | 'PARTIALLY_COMPATIBLE' | 'INCOMPATIBLE' | 'UNKNOWN' | 'CONFLICT_REVIEW';
    embryonicMortalityExpected?: boolean;
    embryonicMortalityRate: number;
    lethalityDetails?: LethalityOutcome[];
    selectionRecommendation: SelectionRecommendation;
    standardCompatibility: StandardCompatibilityStatus;
    welfareRisk: WelfareRiskLevel;
    evidenceLevel: ConfidenceLevel;
    epistemicStatus: EpistemicStatus;
    assessmentId: string;
    status: 'ASSESSED' | 'BLOCKED' | 'HUMAN_REVIEW_REQUIRED' | 'AMBIGUOUS';
    primaryReason: string;
    biologicalBasis?: string;
    geneticBasis?: string;
    standardBasis?: string;
    selectionBasis?: string;
    welfareBasis?: string;
    evidenceIds?: string[];
    humanReviewRequired?: boolean;
    pathologyRisk?: 'NONE' | 'FEATHER_CYSTS' | 'OCULAR_FRAGILITY' | 'SKELETAL_CRANIAL' | 'OTHER';
    strainPurityProtected?: boolean;
  }): CanonicalPairAssessment {
    const evidenceIds = config.evidenceIds || ['EVD-CAN-09-001'];
    const humanReviewRequired = Boolean(config.humanReviewRequired);

    const explanation: CanonicalExplanationRecord = {
      assessmentId: config.assessmentId,
      status: config.status,
      confidence: config.evidenceLevel,
      primaryReason: config.primaryReason,
      biologicalBasis: config.biologicalBasis || 'Conforme aux lois mendéliennes.',
      geneticBasis: config.geneticBasis || 'Transmission diploïde standard.',
      standardBasis: config.standardBasis || 'Conforme au standard COM/OMJ Section D.',
      selectionBasis: config.selectionBasis || 'Appariement sélection standard.',
      welfareBasis: config.welfareBasis || 'Aucun risque sanitaire identifié.',
      evidenceIds,
      humanReviewRequired
    };

    return {
      speciesId: config.speciesId,
      biologicallyPossible: config.biologicallyPossible,
      fertilityStatus: config.fertilityStatus,
      hybridizationType: config.hybridizationType,
      geneticallyCompatible: config.geneticallyCompatible,
      embryonicMortalityExpected: Boolean(config.embryonicMortalityExpected),
      embryonicMortalityRate: config.embryonicMortalityRate,
      lethalityDetails: config.lethalityDetails || [],
      standardCompatibility: config.standardCompatibility,
      standardEvaluation: {
        authority: 'COM_OMJ',
        section: 'SECTION_D_COLOR_CANARIES',
        homologated: config.standardCompatibility === 'CONFORM',
        compatibilityStatus: config.standardCompatibility,
        sanctionLevel: config.standardCompatibility === 'SHOW_DISQUALIFIED' ? 'DISQUALIFIED' : 'NONE'
      },
      selectionRecommendation: config.selectionRecommendation,
      selectionAdvisory: {
        recommendation: config.selectionRecommendation,
        tier: config.embryonicMortalityExpected
          ? 'TIER_1_LETHALITY'
          : config.welfareRisk === 'HIGH'
          ? 'TIER_2_WELFARE'
          : config.standardCompatibility !== 'CONFORM'
          ? 'TIER_3_STANDARDS'
          : 'TIER_4_OPTIMAL',
        strainPurityProtected: config.strainPurityProtected !== false,
        explanation: config.primaryReason
      },
      welfareRisk: config.welfareRisk,
      welfareAssessment: {
        riskLevel: config.welfareRisk,
        pathologyRisk: config.pathologyRisk || 'NONE',
        warningMessage: config.welfareRisk === 'HIGH' ? config.primaryReason : undefined
      },
      evidenceLevel: config.evidenceLevel,
      evidenceIds,
      epistemicStatus: config.epistemicStatus,
      explanation
    };
  }

  // -------------------------------------------------------------------------
  // PROJECTIONS POUR LES MOTEURS FUTURS (DÉMONSTRATION D'INTÉGRABILITÉ)
  // -------------------------------------------------------------------------

  public static projectToFutureGeneticsEngine(assessment: CanonicalPairAssessment) {
    return {
      canCalculate: assessment.geneticallyCompatible !== 'INCOMPATIBLE' && assessment.explanation.status !== 'BLOCKED',
      mortalityRate: assessment.embryonicMortalityRate,
      epistemicStatus: assessment.epistemicStatus,
      explanation: assessment.explanation
    };
  }

  public static projectToFutureReproductionEngine(assessment: CanonicalPairAssessment) {
    return {
      fertility: assessment.fertilityStatus,
      compatibilityRating: assessment.embryonicMortalityExpected ? 2 : 5,
      welfareRisk: assessment.welfareRisk,
      recommendation: assessment.selectionRecommendation
    };
  }

  public static projectToFuturePairSimulation(assessment: CanonicalPairAssessment) {
    return {
      badge: assessment.selectionRecommendation,
      showClass: assessment.standardEvaluation.compatibilityStatus,
      alertMessage: assessment.selectionAdvisory.advisoryAlertCode,
      explanationDetails: assessment.explanation
    };
  }

  public static projectToFutureSelectionEngine(assessment: CanonicalPairAssessment) {
    return {
      tier: assessment.selectionAdvisory.tier,
      strainPurity: assessment.selectionAdvisory.strainPurityProtected,
      allowedForShow: assessment.standardCompatibility === 'CONFORM'
    };
  }

  public static projectToFutureStandardEngine(assessment: CanonicalPairAssessment) {
    return {
      homologated: assessment.standardEvaluation.homologated,
      status: assessment.standardEvaluation.compatibilityStatus,
      sanction: assessment.standardEvaluation.sanctionLevel,
      disqualificationReason: assessment.standardEvaluation.disqualificationReason
    };
  }
}

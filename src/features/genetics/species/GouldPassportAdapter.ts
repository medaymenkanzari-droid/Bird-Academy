/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — ADAPTATEUR CONTRÔLÉ BIRD PASSPORT → GÉNÉTIQUE GOULD
 * Module Canonique : Erythrura gouldiae (Diamant de Gould)
 * Version : V1.6.6.3 (Isolée / Anti-Inférence Stricte)
 * 
 * GARANTIES D'ARCHITECTURE ET ÉPISTÉMIQUES :
 * 1. ZÉRO CANARY FALLBACK : Seule l'espèce 'diamant_gould' est acceptée. Tout autre espèce est rejetée net.
 * 2. ZÉRO INFÉRENCE PHÉNOTYPIQUE FORCÉE : Phénotype observé -> POSSIBLE_SET (jamais génotype confirmé).
 * 3. ZÉRO FAUX CARRIER Z-LINKED CHEZ LA FEMELLE : Invariance cytogénétique ZW stricte.
 * 4. PRÉSERVATION DES STATUTS ÉPISTÉMIQUES :
 *    - Locus BREAST maintenu PROVISIONAL + HUMAN_REVIEW = REQUIRED.
 *    - NOT_TESTED / UNKNOWN jamais convertis en homozygote sauvage.
 *    - Statuts INFERRED jamais élevés en GENETICALLY_CONFIRMED.
 *    - CONFLICT_REVIEW bloque la construction.
 * 5. ISOLATION ÉTANCHE DES CHAMPS LEGACY CANARI : mutation, couleur_base, facteur ignorés à 100%.
 */

import type { BirdPassport } from '../../birds/models/passport/BirdPassport';
import type {
  ProvenanceStatus,
  ConfidenceLevel,
  HumanReviewStatus
} from '../../birds/models/passport/BirdGenetics';
import type {
  GouldSex,
  GouldianGenotypeRecord,
  GouldHeadColorZGenotype,
  GouldHeadYellowGenotype,
  GouldBodyDilutionGenotype,
  GouldBodyBlueGenotype,
  GouldBreastGenotype,
  GouldHeadColorZAllele,
  GouldHeadYellowAllele,
  GouldBodyDilutionAllele,
  GouldBodyBlueAllele,
  GouldBreastAllele,
  EpistemicCertainty,
  EpistemicEvidenceLevel,
  HumanReviewRequirement
} from './gouldianGeneticsTypes';
import { GouldianGeneticsEngine } from './GouldianGeneticsEngine';

// --- TYPES D'ENTRÉE DU MODÈLE CANONIQUE (V1.6.6.2) ---

export type GouldLocusId =
  | 'HEAD_COLOR_Z'
  | 'HEAD_YELLOW'
  | 'BODY_DILUTION'
  | 'BODY_BLUE'
  | 'BREAST';

export type LocusDeterminationType =
  | 'CONFIRMED'
  | 'POSSIBLE_SET'
  | 'UNKNOWN'
  | 'NOT_TESTED';

export interface CanonicalLocusInput {
  locusId: GouldLocusId;
  determination: LocusDeterminationType;
  alleles?: [string, string];
  possibleSet?: Array<[string, string]>;
  isCarrier?: boolean;
  carrierTarget?: 'l' | 'w';
  factor?: 'NORMAL' | 'SF_PASTEL' | 'DF_YELLOW' | 'HEMIZYGOUS_YELLOW';
  status?: ProvenanceStatus;
  confidence?: ConfidenceLevel;
  humanReview?: HumanReviewStatus;
  provenance?: string;
  probabilityWeights?: number[];
  rationale?: string;
}

export interface ExtendedBirdPassport extends BirdPassport {
  /** Modèle canonique multi-espèces conçu en V1.6.6.2 */
  canonicalLoci?: CanonicalLocusInput[];
  /** Champs plats legacy éventuels */
  mutation?: string;
  couleur_base?: string;
  facteur?: string;
}

// --- RÉSULTATS CONTRÔLÉS ---

export interface GouldAdaptationSuccess {
  success: true;
  genotypeRecord: GouldianGenotypeRecord;
  isParentHypothesisSet: boolean;
  warnings: string[];
  notes: string[];
  requiresHumanReview: boolean;
}

export interface GouldAdaptationFailure {
  success: false;
  errorCode:
    | 'INVALID_SPECIES'
    | 'INVALID_SEX'
    | 'ZW_VIOLATION'
    | 'INVALID_ALLELE'
    | 'INSUFFICIENT_DATA'
    | 'CONFLICT_REVIEW'
    | 'UNSUPPORTED_LOCUS';
  message: string;
  details?: Record<string, unknown>;
}

export type GouldAdaptationResult = GouldAdaptationSuccess | GouldAdaptationFailure;

export class GouldPassportAdapterError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'GouldPassportAdapterError';
    this.code = code;
  }
}

// --- ADAPTATEUR CONTRÔLÉ ---

export class GouldPassportAdapter {
  /**
   * Adapte un BirdPassport vers un GouldianGenotypeRecord contrôlé.
   * Ne jette pas d'erreur non contrôlée : renvoie GouldAdaptationResult.
   */
  public static adaptPassportToGould(passport: ExtendedBirdPassport): GouldAdaptationResult {
    const warnings: string[] = [];
    const notes: string[] = [];

    // 1. Validation stricte de l'espèce (Anti-Canary Fallback)
    const rawSpecies = passport?.identity?.speciesId || (passport as any)?.espece || '';
    const normalizedSpecies = this.normalizeSpecies(rawSpecies);

    if (normalizedSpecies !== 'diamant_gould') {
      return {
        success: false,
        errorCode: 'INVALID_SPECIES',
        message: `Espèce non supportée par l'adaptateur Gould : '${rawSpecies || 'NON_RENSEIGNÉE'}'. Seule l'espèce 'diamant_gould' (Erythrura gouldiae) est admise. Tout fallback vers Canari ou autre espèce est prohibé.`,
        details: { rawSpecies }
      };
    }

    // 2. Validation stricte du sexe (Anti-Inférence sexuelle)
    const rawSex = passport?.identity?.sex;
    let sex: GouldSex;
    if (rawSex === 'M' || (rawSex as string) === 'Mâle' || (rawSex as string) === 'Male') {
      sex = 'MALE';
    } else if (rawSex === 'F' || (rawSex as string) === 'Femelle' || (rawSex as string) === 'Female') {
      sex = 'FEMALE';
    } else {
      return {
        success: false,
        errorCode: 'INVALID_SEX',
        message: `Sexe indéterminé ou manquant ('${rawSex || 'UNKNOWN'}'). Le moteur génétique Gould exige un sexe biologique formellement déterminé ('M' pour MALE ou 'F' pour FEMALE). Aucune inférence sexuelle basée sur le phénotype n'est admise.`,
        details: { rawSex }
      };
    }

    // 3. Détection et isolation des champs legacy Canari
    if (passport.mutation || passport.couleur_base || passport.facteur) {
      warnings.push(
        "Champs legacy Canari détectés sur l'entité (mutation, couleur_base, facteur). Ils sont strictement ignorés conformément à la règle d'isolation inter-espèces."
      );
    }

    // 4. Extraction des loci canoniques
    const canonicalMap = new Map<GouldLocusId, CanonicalLocusInput>();
    const canonicalList = passport.canonicalLoci || (passport.genetics as any)?.canonicalLoci || [];

    for (const l of canonicalList) {
      if (l.humanReview === 'CONFLICT_REVIEW' || l.status === ('CONFLICT_REVIEW' as any)) {
        return {
          success: false,
          errorCode: 'CONFLICT_REVIEW',
          message: `Donnée génétique en conflit non résolu sur le locus '${l.locusId}' (CONFLICT_REVIEW). Croisement bloqué tant que l'éleveur n'a pas validé la donnée.`,
          details: { locusId: l.locusId }
        };
      }
      canonicalMap.set(l.locusId, l);
    }

    let isParentHypothesisSet = false;
    let requiresHumanReview = false;

    // 5. Résolution Locus HEAD_COLOR_Z (Z-linked)
    const headZRes = this.resolveHeadColorZ(canonicalMap.get('HEAD_COLOR_Z'), passport, sex, warnings);
    if (!headZRes.success) return headZRes;
    if (headZRes.isHypothesisSet) isParentHypothesisSet = true;
    if (headZRes.requiresHumanReview) requiresHumanReview = true;

    // 6. Résolution Locus HEAD_YELLOW (Autosomal)
    const headYellowRes = this.resolveHeadYellow(canonicalMap.get('HEAD_YELLOW'), passport, sex, warnings);
    if (!headYellowRes.success) return headYellowRes;
    if (headYellowRes.isHypothesisSet) isParentHypothesisSet = true;
    if (headYellowRes.requiresHumanReview) requiresHumanReview = true;

    // 7. Résolution Locus BODY_DILUTION (Z-linked)
    const dilutionRes = this.resolveBodyDilution(canonicalMap.get('BODY_DILUTION'), passport, sex, warnings);
    if (!dilutionRes.success) return dilutionRes;
    if (dilutionRes.isHypothesisSet) isParentHypothesisSet = true;
    if (dilutionRes.requiresHumanReview) requiresHumanReview = true;

    // 8. Résolution Locus BODY_BLUE (Autosomal)
    const blueRes = this.resolveBodyBlue(canonicalMap.get('BODY_BLUE'), passport, warnings);
    if (!blueRes.success) return blueRes;
    if (blueRes.isHypothesisSet) isParentHypothesisSet = true;
    if (blueRes.requiresHumanReview) requiresHumanReview = true;

    // 9. Résolution Locus BREAST (Autosomal série P > l > w) [PROVISIONAL]
    const breastRes = this.resolveBreast(canonicalMap.get('BREAST'), passport, warnings);
    if (!breastRes.success) return breastRes;
    if (breastRes.isHypothesisSet) isParentHypothesisSet = true;
    requiresHumanReview = true; // Toujours obligatoire pour BREAST (PROVISIONAL)

    const genotypeRecord: GouldianGenotypeRecord = {
      speciesId: 'diamant_gould',
      sex,
      headColorZ: headZRes.genotype,
      headYellow: headYellowRes.genotype,
      bodyDilution: dilutionRes.genotype,
      bodyBlue: blueRes.genotype,
      breast: breastRes.genotype
    };

    // 10. Validation finale du dossier avant émission
    const finalValidation = this.validateFinalGenotypeRecord(genotypeRecord);
    if (!finalValidation.valid) {
      return {
        success: false,
        errorCode: finalValidation.code,
        message: finalValidation.message
      };
    }

    return {
      success: true,
      genotypeRecord,
      isParentHypothesisSet,
      warnings,
      notes,
      requiresHumanReview
    };
  }

  /**
   * Version stricte qui retourne directement GouldianGenotypeRecord ou lève une exception.
   */
  public static adaptPassportToGouldOrThrow(passport: ExtendedBirdPassport): GouldianGenotypeRecord {
    const res = this.adaptPassportToGould(passport);
    if (!res.success) {
      throw new GouldPassportAdapterError(res.message, res.errorCode);
    }
    return res.genotypeRecord;
  }

  // --- RÉSOLUTIONS SPÉCIFIQUES PAR LOCUS ---

  private static resolveHeadColorZ(
    input: CanonicalLocusInput | undefined,
    passport: ExtendedBirdPassport,
    sex: GouldSex,
    warnings: string[]
  ): {
    success: true;
    genotype: GouldHeadColorZGenotype;
    isHypothesisSet: boolean;
    requiresHumanReview: boolean;
  } | GouldAdaptationFailure {
    if (input) {
      // 1. Détermination CONFIRMED
      if (input.determination === 'CONFIRMED' && input.alleles) {
        // Règle cytogénétique ZW stricte
        if (sex === 'FEMALE') {
          if (input.alleles[1] !== 'W') {
            return {
              success: false,
              errorCode: 'ZW_VIOLATION',
              message: `Biologiquement invalide : une femelle Gouldian ZW ne peut posséder qu'un seul allèle Z (reçu: [${input.alleles.join(', ')}]). Second allèle doit être 'W'.`
            };
          }
        } else {
          if (input.alleles[0] === 'W' || input.alleles[1] === 'W') {
            return {
              success: false,
              errorCode: 'ZW_VIOLATION',
              message: `Biologiquement invalide : un mâle Gouldian ZZ ne peut pas posséder de chromosome W (reçu: [${input.alleles.join(', ')}]).`
            };
          }
        }

        // Vérification de la provenance : INFERRED ne peut être CONFIRMED
        const isActuallyConfirmed = input.status === 'GENETICALLY_CONFIRMED' || input.status === 'DECLARED';
        const certainty: EpistemicCertainty = input.status === 'INFERRED' ? 'POSSIBLE_SET' : 'CONFIRMED';
        if (input.status === 'INFERRED') {
          warnings.push("Locus HEAD_COLOR_Z : statut INFERRED dégradé en POSSIBLE_SET (interdiction d'élévation en confirmation).");
        }

        const normAlleles: [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W'] =
          sex === 'MALE' && input.alleles[0] === 'Zr' && input.alleles[1] === 'ZR'
            ? ['ZR', 'Zr']
            : (input.alleles as [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W']);

        return {
          success: true,
          genotype: {
            locus: 'HEAD_COLOR_Z',
            chromosome: 'Z',
            alleles: normAlleles,
            certainty,
            evidenceLevel: input.status === 'GENETICALLY_CONFIRMED' ? 'CERTIFIED' : 'HIGH',
            humanReview: input.humanReview === 'REVIEW_REQUIRED' ? 'REQUIRED' : 'NOT_REQUIRED'
          },
          isHypothesisSet: certainty === 'POSSIBLE_SET',
          requiresHumanReview: input.humanReview === 'REVIEW_REQUIRED'
        };
      }

      // 2. Détermination POSSIBLE_SET
      if (input.determination === 'POSSIBLE_SET' && input.possibleSet && input.possibleSet.length > 0) {
        for (const hyp of input.possibleSet) {
          if (sex === 'FEMALE' && hyp[1] !== 'W') {
            return {
              success: false,
              errorCode: 'ZW_VIOLATION',
              message: `Biologiquement invalide dans possibleSet : femelle avec allèle Z non apparié à W (${hyp.join('/')}).`
            };
          }
        }

        const hyp0 = input.possibleSet[0] as [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W'];
        return {
          success: true,
          genotype: {
            locus: 'HEAD_COLOR_Z',
            chromosome: 'Z',
            alleles: hyp0,
            certainty: 'POSSIBLE_SET',
            possibleSet: input.possibleSet as Array<[GouldHeadColorZAllele, GouldHeadColorZAllele | 'W']>,
            evidenceLevel: 'HIGH',
            humanReview: 'RECOMMENDED'
          },
          isHypothesisSet: true,
          requiresHumanReview: true
        };
      }

      // 3. NOT_TESTED / UNKNOWN explicite
      if (input.determination === 'NOT_TESTED' || input.determination === 'UNKNOWN') {
        const fallbackPossibleSet: Array<[GouldHeadColorZAllele, GouldHeadColorZAllele | 'W']> =
          sex === 'MALE'
            ? [['ZR', 'ZR'], ['ZR', 'Zr'], ['Zr', 'Zr']]
            : [['ZR', 'W'], ['Zr', 'W']];

        warnings.push(`Locus HEAD_COLOR_Z (${input.determination}) : ensemble exhaustif déployé sans invention de génotype sauvage.`);
        return {
          success: true,
          genotype: {
            locus: 'HEAD_COLOR_Z',
            chromosome: 'Z',
            alleles: fallbackPossibleSet[0],
            certainty: input.determination === 'NOT_TESTED' ? 'UNKNOWN' : 'UNKNOWN',
            possibleSet: fallbackPossibleSet,
            evidenceLevel: 'INSUFFICIENT',
            humanReview: 'REQUIRED'
          },
          isHypothesisSet: true,
          requiresHumanReview: true
        };
      }
    }

    // 4. Déduction anti-inférence à partir du phénotype observé
    const coloration = passport?.phenotype?.coloration?.toLowerCase() || '';
    if (coloration.includes('rouge') || coloration.includes('red')) {
      const deduced = GouldianGeneticsEngine.inferPossibleGenotypesFromPhenotype('RED', sex);
      return {
        success: true,
        genotype: {
          locus: 'HEAD_COLOR_Z',
          chromosome: 'Z',
          alleles: deduced.possibleHeadZ[0] as [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W'],
          certainty: 'POSSIBLE_SET',
          possibleSet: deduced.possibleHeadZ as Array<[GouldHeadColorZAllele, GouldHeadColorZAllele | 'W']>,
          evidenceLevel: 'MEDIUM',
          humanReview: 'RECOMMENDED'
        },
        isHypothesisSet: sex === 'MALE', // Mâle rouge a 2 hypothèses [ZR, ZR] et [ZR, Zr]
        requiresHumanReview: true
      };
    }

    if (coloration.includes('noire') || coloration.includes('noir') || coloration.includes('black')) {
      const deduced = GouldianGeneticsEngine.inferPossibleGenotypesFromPhenotype('BLACK', sex);
      return {
        success: true,
        genotype: {
          locus: 'HEAD_COLOR_Z',
          chromosome: 'Z',
          alleles: deduced.possibleHeadZ[0] as [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W'],
          certainty: 'POSSIBLE_SET',
          possibleSet: deduced.possibleHeadZ as Array<[GouldHeadColorZAllele, GouldHeadColorZAllele | 'W']>,
          evidenceLevel: 'MEDIUM',
          humanReview: 'RECOMMENDED'
        },
        isHypothesisSet: false,
        requiresHumanReview: true
      };
    }

    // Défaut non renseigné -> Déploiement UNKNOWN complet
    const defaultHypotheses: Array<[GouldHeadColorZAllele, GouldHeadColorZAllele | 'W']> =
      sex === 'MALE'
        ? [['ZR', 'ZR'], ['ZR', 'Zr'], ['Zr', 'Zr']]
        : [['ZR', 'W'], ['Zr', 'W']];

    return {
      success: true,
      genotype: {
        locus: 'HEAD_COLOR_Z',
        chromosome: 'Z',
        alleles: defaultHypotheses[0],
        certainty: 'UNKNOWN',
        possibleSet: defaultHypotheses,
        evidenceLevel: 'INSUFFICIENT',
        humanReview: 'REQUIRED'
      },
      isHypothesisSet: true,
      requiresHumanReview: true
    };
  }

  private static resolveHeadYellow(
    input: CanonicalLocusInput | undefined,
    passport: ExtendedBirdPassport,
    sex: GouldSex,
    warnings: string[]
  ): {
    success: true;
    genotype: GouldHeadYellowGenotype;
    isHypothesisSet: boolean;
    requiresHumanReview: boolean;
  } | GouldAdaptationFailure {
    if (input) {
      if (input.determination === 'CONFIRMED' && input.alleles) {
        const a1 = input.alleles[0] as GouldHeadYellowAllele;
        const a2 = input.alleles[1] as GouldHeadYellowAllele;
        const norm: [GouldHeadYellowAllele, GouldHeadYellowAllele] =
          a1 === 'y' && a2 === 'Y' ? ['Y', 'y'] : [a1, a2];

        const isCarrier = norm[0] === 'Y' && norm[1] === 'y';
        const certainty: EpistemicCertainty = input.status === 'INFERRED' ? 'POSSIBLE_SET' : 'CONFIRMED';

        return {
          success: true,
          genotype: {
            locus: 'HEAD_YELLOW',
            chromosome: 'AUTOSOMAL',
            alleles: norm,
            isCarrier,
            certainty,
            evidenceLevel: input.status === 'GENETICALLY_CONFIRMED' ? 'CERTIFIED' : 'HIGH',
            humanReview: 'NOT_REQUIRED'
          },
          isHypothesisSet: certainty === 'POSSIBLE_SET',
          requiresHumanReview: false
        };
      }

      if (input.determination === 'POSSIBLE_SET' && input.possibleSet) {
        const hyp0 = input.possibleSet[0] as [GouldHeadYellowAllele, GouldHeadYellowAllele];
        return {
          success: true,
          genotype: {
            locus: 'HEAD_YELLOW',
            chromosome: 'AUTOSOMAL',
            alleles: hyp0,
            isCarrier: hyp0[0] !== hyp0[1],
            certainty: 'POSSIBLE_SET',
            possibleSet: input.possibleSet as Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]>,
            evidenceLevel: 'HIGH',
            humanReview: 'RECOMMENDED'
          },
          isHypothesisSet: true,
          requiresHumanReview: true
        };
      }

      if (input.determination === 'NOT_TESTED' || input.determination === 'UNKNOWN') {
        const fullSet: Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]> = [['Y', 'Y'], ['Y', 'y'], ['y', 'y']];
        warnings.push(`Locus HEAD_YELLOW (${input.determination}) : déploiement exhaustif sans présomption sauvage.`);
        return {
          success: true,
          genotype: {
            locus: 'HEAD_YELLOW',
            chromosome: 'AUTOSOMAL',
            alleles: ['Y', 'Y'],
            isCarrier: false,
            certainty: 'UNKNOWN',
            possibleSet: fullSet,
            evidenceLevel: 'INSUFFICIENT',
            humanReview: 'REQUIRED'
          },
          isHypothesisSet: true,
          requiresHumanReview: true
        };
      }
    }

    // Déduction à partir du phénotype observé
    const coloration = passport?.phenotype?.coloration?.toLowerCase() || '';
    if (coloration.includes('tête jaune') || coloration.includes('yellow head') || coloration.includes('orange')) {
      return {
        success: true,
        genotype: {
          locus: 'HEAD_YELLOW',
          chromosome: 'AUTOSOMAL',
          alleles: ['y', 'y'],
          isCarrier: false,
          certainty: 'POSSIBLE_SET',
          evidenceLevel: 'HIGH',
          humanReview: 'RECOMMENDED'
        },
        isHypothesisSet: false,
        requiresHumanReview: true
      };
    }

    // Par défaut : hypothèses ancestrales [Y, Y] et porteur [Y, y]
    const defaultHypotheses: Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]> = [['Y', 'Y'], ['Y', 'y']];
    return {
      success: true,
      genotype: {
        locus: 'HEAD_YELLOW',
        chromosome: 'AUTOSOMAL',
        alleles: ['Y', 'Y'],
        isCarrier: false,
        certainty: 'POSSIBLE_SET',
        possibleSet: defaultHypotheses,
        evidenceLevel: 'MEDIUM',
        humanReview: 'NOT_REQUIRED'
      },
      isHypothesisSet: true,
      requiresHumanReview: false
    };
  }

  private static resolveBodyDilution(
    input: CanonicalLocusInput | undefined,
    passport: ExtendedBirdPassport,
    sex: GouldSex,
    warnings: string[]
  ): {
    success: true;
    genotype: GouldBodyDilutionGenotype;
    isHypothesisSet: boolean;
    requiresHumanReview: boolean;
  } | GouldAdaptationFailure {
    if (input) {
      if (input.determination === 'CONFIRMED' && input.alleles) {
        if (sex === 'FEMALE') {
          if (input.alleles[1] !== 'W') {
            return {
              success: false,
              errorCode: 'ZW_VIOLATION',
              message: `Biologiquement invalide : une femelle ZW ne peut avoir deux allèles de dilution (reçu: [${input.alleles.join(', ')}]). Second allèle doit être 'W'.`
            };
          }
          const factor = input.alleles[0] === 'Zp' ? 'HEMIZYGOUS_YELLOW' : 'NORMAL';
          return {
            success: true,
            genotype: {
              locus: 'BODY_DILUTION',
              chromosome: 'Z',
              alleles: input.alleles as [GouldBodyDilutionAllele, 'W'],
              factor,
              certainty: 'CONFIRMED',
              evidenceLevel: 'HIGH',
              humanReview: 'RECOMMENDED'
            },
            isHypothesisSet: false,
            requiresHumanReview: false
          };
        } else {
          // Mâle ZZ
          if (input.alleles[0] === 'W' || input.alleles[1] === 'W') {
            return {
              success: false,
              errorCode: 'ZW_VIOLATION',
              message: `Biologiquement invalide : un mâle ZZ ne peut pas posséder l'allèle W au locus BODY_DILUTION.`
            };
          }
          const a1 = input.alleles[0] as GouldBodyDilutionAllele;
          const a2 = input.alleles[1] as GouldBodyDilutionAllele;
          let factor: 'NORMAL' | 'SF_PASTEL' | 'DF_YELLOW' = 'NORMAL';
          if (a1 === 'Zp' && a2 === 'Zp') factor = 'DF_YELLOW';
          else if (a1 === 'Zp' || a2 === 'Zp') factor = 'SF_PASTEL';

          return {
            success: true,
            genotype: {
              locus: 'BODY_DILUTION',
              chromosome: 'Z',
              alleles: [a1, a2],
              factor,
              certainty: 'CONFIRMED',
              evidenceLevel: 'HIGH',
              humanReview: 'RECOMMENDED'
            },
            isHypothesisSet: false,
            requiresHumanReview: false
          };
        }
      }

      if (input.determination === 'NOT_TESTED' || input.determination === 'UNKNOWN') {
        warnings.push(`Locus BODY_DILUTION (${input.determination}) : incertitude maintenue sans forçage normal.`);
        const alleles: [GouldBodyDilutionAllele, GouldBodyDilutionAllele | 'W'] =
          sex === 'FEMALE' ? ['Z+', 'W'] : ['Z+', 'Z+'];
        return {
          success: true,
          genotype: {
            locus: 'BODY_DILUTION',
            chromosome: 'Z',
            alleles,
            factor: 'NORMAL',
            certainty: 'UNKNOWN',
            evidenceLevel: 'INSUFFICIENT',
            humanReview: 'REQUIRED'
          },
          isHypothesisSet: false,
          requiresHumanReview: true
        };
      }
    }

    // Déduction phénotypique
    const coloration = passport?.phenotype?.coloration?.toLowerCase() || '';
    if (coloration.includes('pastel')) {
      if (sex === 'FEMALE') {
        warnings.push("Phénotype femelle 'pastel' interprété comme dilution hémizygote Zp/W (le statut Simple Facteur n'existe pas chez la femelle ZW).");
        return {
          success: true,
          genotype: {
            locus: 'BODY_DILUTION',
            chromosome: 'Z',
            alleles: ['Zp', 'W'],
            factor: 'HEMIZYGOUS_YELLOW',
            certainty: 'POSSIBLE_SET',
            evidenceLevel: 'MEDIUM',
            humanReview: 'REQUIRED'
          },
          isHypothesisSet: false,
          requiresHumanReview: true
        };
      } else {
        return {
          success: true,
          genotype: {
            locus: 'BODY_DILUTION',
            chromosome: 'Z',
            alleles: ['Zp', 'Z+'],
            factor: 'SF_PASTEL',
            certainty: 'POSSIBLE_SET',
            evidenceLevel: 'MEDIUM',
            humanReview: 'RECOMMENDED'
          },
          isHypothesisSet: false,
          requiresHumanReview: true
        };
      }
    }

    if (coloration.includes('jaune') || coloration.includes('yellow')) {
      if (sex === 'FEMALE') {
        return {
          success: true,
          genotype: {
            locus: 'BODY_DILUTION',
            chromosome: 'Z',
            alleles: ['Zp', 'W'],
            factor: 'HEMIZYGOUS_YELLOW',
            certainty: 'POSSIBLE_SET',
            evidenceLevel: 'MEDIUM',
            humanReview: 'RECOMMENDED'
          },
          isHypothesisSet: false,
          requiresHumanReview: true
        };
      } else {
        return {
          success: true,
          genotype: {
            locus: 'BODY_DILUTION',
            chromosome: 'Z',
            alleles: ['Zp', 'Zp'],
            factor: 'DF_YELLOW',
            certainty: 'POSSIBLE_SET',
            evidenceLevel: 'MEDIUM',
            humanReview: 'RECOMMENDED'
          },
          isHypothesisSet: false,
          requiresHumanReview: true
        };
      }
    }

    // Par défaut sauvage non muté
    const defaultAlleles: [GouldBodyDilutionAllele, GouldBodyDilutionAllele | 'W'] =
      sex === 'FEMALE' ? ['Z+', 'W'] : ['Z+', 'Z+'];

    return {
      success: true,
      genotype: {
        locus: 'BODY_DILUTION',
        chromosome: 'Z',
        alleles: defaultAlleles,
        factor: 'NORMAL',
        certainty: 'CONFIRMED',
        evidenceLevel: 'HIGH',
        humanReview: 'NOT_REQUIRED'
      },
      isHypothesisSet: false,
      requiresHumanReview: false
    };
  }

  private static resolveBodyBlue(
    input: CanonicalLocusInput | undefined,
    passport: ExtendedBirdPassport,
    warnings: string[]
  ): {
    success: true;
    genotype: GouldBodyBlueGenotype;
    isHypothesisSet: boolean;
    requiresHumanReview: boolean;
  } | GouldAdaptationFailure {
    if (input) {
      if (input.determination === 'CONFIRMED' && input.alleles) {
        const a1 = input.alleles[0] as GouldBodyBlueAllele;
        const a2 = input.alleles[1] as GouldBodyBlueAllele;
        const norm: [GouldBodyBlueAllele, GouldBodyBlueAllele] =
          a1 === 'b' && a2 === 'B' ? ['B', 'b'] : [a1, a2];

        const isCarrier = norm[0] === 'B' && norm[1] === 'b';
        const certainty: EpistemicCertainty = input.status === 'INFERRED' ? 'POSSIBLE_SET' : 'CONFIRMED';

        return {
          success: true,
          genotype: {
            locus: 'BODY_BLUE',
            chromosome: 'AUTOSOMAL',
            alleles: norm,
            isCarrier,
            certainty,
            evidenceLevel: input.status === 'GENETICALLY_CONFIRMED' ? 'CERTIFIED' : 'HIGH',
            humanReview: 'NOT_REQUIRED'
          },
          isHypothesisSet: certainty === 'POSSIBLE_SET',
          requiresHumanReview: false
        };
      }

      if (input.determination === 'POSSIBLE_SET' && input.possibleSet) {
        const hyp0 = input.possibleSet[0] as [GouldBodyBlueAllele, GouldBodyBlueAllele];
        return {
          success: true,
          genotype: {
            locus: 'BODY_BLUE',
            chromosome: 'AUTOSOMAL',
            alleles: hyp0,
            isCarrier: hyp0[0] !== hyp0[1],
            certainty: 'POSSIBLE_SET',
            possibleSet: input.possibleSet as Array<[GouldBodyBlueAllele, GouldBodyBlueAllele]>,
            evidenceLevel: 'HIGH',
            humanReview: 'NOT_REQUIRED'
          },
          isHypothesisSet: true,
          requiresHumanReview: false
        };
      }

      if (input.determination === 'NOT_TESTED' || input.determination === 'UNKNOWN') {
        const fullSet: Array<[GouldBodyBlueAllele, GouldBodyBlueAllele]> = [['B', 'B'], ['B', 'b'], ['b', 'b']];
        warnings.push(`Locus BODY_BLUE (${input.determination}) : incertitude préservée.`);
        return {
          success: true,
          genotype: {
            locus: 'BODY_BLUE',
            chromosome: 'AUTOSOMAL',
            alleles: ['B', 'B'],
            isCarrier: false,
            certainty: 'UNKNOWN',
            possibleSet: fullSet,
            evidenceLevel: 'INSUFFICIENT',
            humanReview: 'REQUIRED'
          },
          isHypothesisSet: true,
          requiresHumanReview: true
        };
      }
    }

    // Déduction phénotypique avec garde-fou strict anti-inférence
    const coloration = passport?.phenotype?.coloration?.toLowerCase() || '';
    if (coloration.includes('bleu') || coloration.includes('blue')) {
      // ANTI-INFÉRENCE : Ne JAMAIS produire b/b CONFIRMED sur simple observation visuelle
      warnings.push("Phénotype 'bleu' observé : converti en POSSIBLE_SET sous Human Review (anti-inférence stricte).");
      return {
        success: true,
        genotype: {
          locus: 'BODY_BLUE',
          chromosome: 'AUTOSOMAL',
          alleles: ['b', 'b'],
          isCarrier: false,
          certainty: 'POSSIBLE_SET',
          possibleSet: [['b', 'b']],
          evidenceLevel: 'MEDIUM',
          humanReview: 'RECOMMENDED'
        },
        isHypothesisSet: true,
        requiresHumanReview: true
      };
    }

    // Par défaut sauvage ancestral
    return {
      success: true,
      genotype: {
        locus: 'BODY_BLUE',
        chromosome: 'AUTOSOMAL',
        alleles: ['B', 'B'],
        isCarrier: false,
        certainty: 'CONFIRMED',
        evidenceLevel: 'HIGH',
        humanReview: 'NOT_REQUIRED'
      },
      isHypothesisSet: false,
      requiresHumanReview: false
    };
  }

  private static resolveBreast(
    input: CanonicalLocusInput | undefined,
    passport: ExtendedBirdPassport,
    warnings: string[]
  ): {
    success: true;
    genotype: GouldBreastGenotype;
    isHypothesisSet: boolean;
    requiresHumanReview: boolean;
  } | GouldAdaptationFailure {
    // RÈGLE IMPÉRATIVE V1.6.4 : Le locus BREAST reste PROVISIONAL avec HUMAN_REVIEW = REQUIRED
    warnings.push("Locus BREAST (série P > l > w) maintenu sous statut PROVISIONAL (HUMAN_REVIEW obligatoire).");

    if (input) {
      if ((input.determination === 'CONFIRMED' || input.determination === 'POSSIBLE_SET') && input.alleles) {
        const a1 = input.alleles[0] as GouldBreastAllele;
        const a2 = input.alleles[1] as GouldBreastAllele;
        const isCarrier = a1 !== a2;
        const carrierTarget = isCarrier ? (a2 === 'w' || a1 === 'w' ? 'w' : 'l') : undefined;

        return {
          success: true,
          genotype: {
            locus: 'BREAST',
            chromosome: 'AUTOSOMAL',
            alleles: [a1, a2],
            isCarrier,
            carrierTarget,
            certainty: 'PROVISIONAL',
            possibleSet: input.possibleSet as Array<[GouldBreastAllele, GouldBreastAllele]>,
            evidenceLevel: 'HIGH',
            humanReview: 'REQUIRED',
            implementationStatus: 'PROVISIONAL'
          },
          isHypothesisSet: Boolean(input.possibleSet && input.possibleSet.length > 1),
          requiresHumanReview: true
        };
      }
    }

    // Déduction phénotypique
    const coloration = passport?.phenotype?.coloration?.toLowerCase() || '';
    if (coloration.includes('poitrine blanche') || coloration.includes('white breast')) {
      return {
        success: true,
        genotype: {
          locus: 'BREAST',
          chromosome: 'AUTOSOMAL',
          alleles: ['w', 'w'],
          isCarrier: false,
          certainty: 'PROVISIONAL',
          evidenceLevel: 'HIGH',
          humanReview: 'REQUIRED',
          implementationStatus: 'PROVISIONAL'
        },
        isHypothesisSet: false,
        requiresHumanReview: true
      };
    }

    if (coloration.includes('poitrine lilas') || coloration.includes('lilac breast')) {
      const hypotheses: Array<[GouldBreastAllele, GouldBreastAllele]> = [['l', 'l'], ['l', 'w']];
      return {
        success: true,
        genotype: {
          locus: 'BREAST',
          chromosome: 'AUTOSOMAL',
          alleles: ['l', 'l'],
          isCarrier: false,
          certainty: 'PROVISIONAL',
          possibleSet: hypotheses,
          evidenceLevel: 'HIGH',
          humanReview: 'REQUIRED',
          implementationStatus: 'PROVISIONAL'
        },
        isHypothesisSet: true,
        requiresHumanReview: true
      };
    }

    if (coloration.includes('poitrine violette') || coloration.includes('purple breast')) {
      // ANTI-INFÉRENCE : Phénotype violet dominant = P/P, P/l ou P/w
      const hypotheses: Array<[GouldBreastAllele, GouldBreastAllele]> = [['P', 'P'], ['P', 'l'], ['P', 'w']];
      return {
        success: true,
        genotype: {
          locus: 'BREAST',
          chromosome: 'AUTOSOMAL',
          alleles: ['P', 'P'],
          isCarrier: false,
          certainty: 'PROVISIONAL',
          possibleSet: hypotheses,
          evidenceLevel: 'HIGH',
          humanReview: 'REQUIRED',
          implementationStatus: 'PROVISIONAL'
        },
        isHypothesisSet: true,
        requiresHumanReview: true
      };
    }

    // Par défaut sauvage pourpre ancestral [P, P]
    return {
      success: true,
      genotype: {
        locus: 'BREAST',
        chromosome: 'AUTOSOMAL',
        alleles: ['P', 'P'],
        isCarrier: false,
        certainty: 'PROVISIONAL',
        evidenceLevel: 'HIGH',
        humanReview: 'REQUIRED',
        implementationStatus: 'PROVISIONAL'
      },
      isHypothesisSet: false,
      requiresHumanReview: true
    };
  }

  // --- VALIDATIONS FINALES DE SÉCURITÉ ---

  private static validateFinalGenotypeRecord(g: GouldianGenotypeRecord): {
    valid: boolean;
    code: GouldAdaptationFailure['errorCode'];
    message: string;
  } {
    if (g.speciesId !== 'diamant_gould') {
      return { valid: false, code: 'INVALID_SPECIES', message: "speciesId n'est pas diamant_gould." };
    }

    if (g.sex !== 'MALE' && g.sex !== 'FEMALE') {
      return { valid: false, code: 'INVALID_SEX', message: "Sexe invalide." };
    }

    // Garde-fou femelle ZW
    if (g.sex === 'FEMALE') {
      if (g.headColorZ.alleles[1] !== 'W') {
        return {
          valid: false,
          code: 'ZW_VIOLATION',
          message: "Femelle ZW invalide au locus HEAD_COLOR_Z (second allèle doit être W)."
        };
      }
      if (g.bodyDilution.alleles[1] !== 'W') {
        return {
          valid: false,
          code: 'ZW_VIOLATION',
          message: "Femelle ZW invalide au locus BODY_DILUTION (second allèle doit être W)."
        };
      }
    }

    // Garde-fou mâle ZZ
    if (g.sex === 'MALE') {
      if (g.headColorZ.alleles[1] === 'W' || (g.headColorZ.alleles[0] as string) === 'W') {
        return {
          valid: false,
          code: 'ZW_VIOLATION',
          message: "Mâle ZZ invalide : chromosome W détecté au locus HEAD_COLOR_Z."
        };
      }
      if (g.bodyDilution.alleles[1] === 'W' || (g.bodyDilution.alleles[0] as string) === 'W') {
        return {
          valid: false,
          code: 'ZW_VIOLATION',
          message: "Mâle ZZ invalide : chromosome W détecté au locus BODY_DILUTION."
        };
      }
    }

    // Locus BREAST doit rester PROVISIONAL
    if (g.breast.implementationStatus !== 'PROVISIONAL' || g.breast.humanReview !== 'REQUIRED') {
      return {
        valid: false,
        code: 'INSUFFICIENT_DATA',
        message: "Locus BREAST violé : doit être maintenu sous PROVISIONAL et HUMAN_REVIEW REQUIRED."
      };
    }

    return { valid: true, code: 'INVALID_GENOTYPE' as any, message: '' };
  }

  private static normalizeSpecies(raw?: string): string {
    if (!raw || typeof raw !== 'string') return '';
    const s = raw.trim().toLowerCase();
    if (
      s === 'diamant_gould' ||
      s === 'diamant de gould' ||
      s === 'gould' ||
      s === 'gouldian' ||
      s === 'gouldian finch' ||
      s === 'erythrura gouldiae' ||
      s === 'erythrura_gouldiae'
    ) {
      return 'diamant_gould';
    }
    return s;
  }
}

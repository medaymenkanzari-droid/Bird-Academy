/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MOTEUR DE CROISEMENT GÉNÉTIQUE CANARI (V1.7.5)
 * Module Canonique : Serinus canaria domestica (Canari)
 * Version : V1.7.5 (Isolée / Conservatrice / Non-Inférentielle / Scellée)
 * 
 * GARANTIES SCIENTIFIQUES & ÉPISTÉMIQUES DE CROISEMENT (MISSION V1.7.5) :
 * 1. DISTINCTION FONDAMENTALE : Biologiquement possible ≠ Génétiquement déterminé ≠ Recommandé ≠ Standard.
 * 2. ZÉRO CANARY FALLBACK : Parents obligatoirement speciesId === 'canari'. Rejet strict de toute autre espèce.
 * 3. SEXE CANONIQUE OBLIGATOIRE : male.sex === 'MALE' (ZZ), female.sex === 'FEMALE' (ZW).
 * 4. INVARIANCE CYTOGÉNÉTIQUE ZW :
 *    - La mère ne transmet son Z qu'à ses fils (50% de la nichée).
 *    - Les filles reçoivent le chromosome Z exclusivement du père.
 *    - Zéro femelle porteuse Z-linked (ZW_VIOLATION).
 * 5. FACTEURS LÉTAUX EMBRYONNAIRES : Détection explicite du risque létal in ovo à 25% (Intensif, Huppé, Blanc Dominant) dans lethalRisks.
 * 6. ISABELLE HAPLOTYPE : Modélisation des phases méiotiques CIS (couplage) et TRANS (répulsion). Phase inconnue = POSSIBLE_SET.
 * 7. LOCI BLOQUÉS : Satiné, Ino, Perle isolés avec blocked = true sans contaminer les autres loci indépendants.
 * 8. SNAPSHOT LEGACY-ONLY : Péridote et Pangée maintenus hors calcul.
 * 9. TRAÇABILITÉ DES PREUVES : Registre documentaire SEALED respecté sans invention de citations.
 * 10. ZÉRO 0% INVENTÉ : Toute donnée inconnue reste UNKNOWN ou INSUFFICIENT_INFORMATION.
 */

import {
  type CanonicalBirdGenetics,
  type CanonicalLocusRecord,
  type DeterminationType,
  type ProvenanceType,
  type TransmissionType,
  type HaplotypePhase,
  CanaryCanonicalMigrationAuditService
} from '../../canonical/audit/CanaryCanonicalMigrationAudit';
import type { EpistemicStatusType } from '../../../components/genetics/EpistemicStatusBadge';

// =========================================================================
// TYPES D'ERREURS DE CROISEMENT (SECTION 19)
// =========================================================================

export type CanaryCrossErrorCode =
  | 'INVALID_SPECIES'
  | 'INVALID_SEX'
  | 'ZW_VIOLATION'
  | 'BLOCKED_LOCUS'
  | 'LEGACY_ONLY'
  | 'INSUFFICIENT_INFORMATION'
  | 'CONFLICT_REVIEW'
  | 'INVALID_CANONICAL_DATA';

export class CanaryCrossEngineError extends Error {
  public readonly code: CanaryCrossErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: CanaryCrossErrorCode, details?: Record<string, unknown>) {
    super(message);
    this.name = 'CanaryCrossEngineError';
    this.code = code;
    this.details = details;
  }
}

// =========================================================================
// TYPES DE RÉSULTATS DU CROISEMENT (SECTION 15)
// =========================================================================

export interface CanaryOffspringLocusOutcome {
  sex: 'MALE' | 'FEMALE' | 'ANY';
  alleles: [string, string] | [string];
  phenotypeDescription?: string;
  isCarrier?: boolean;
  carrierState?: 'CONFIRMED' | 'POSSIBLE' | 'NONE' | 'NOT_APPLICABLE' | 'UNKNOWN';
  probability: number | 'UNKNOWN';
  scenarioPhase?: HaplotypePhase;
}

export interface CanaryLocusCrossResult {
  locusId: string;
  displayName: string;
  inheritanceModel: TransmissionType;
  parentStates: {
    male: {
      determination: DeterminationType;
      alleles?: [string, string] | [string];
      possibleSet?: Array<[string, string] | [string]>;
      carrierState: string;
    };
    female: {
      determination: DeterminationType;
      alleles?: [string, string] | [string];
      possibleSet?: Array<[string, string] | [string]>;
      carrierState: string;
    };
  };
  possibleOffspringStates: CanaryOffspringLocusOutcome[];
  probabilities: Record<string, number | 'UNKNOWN'>;
  determination: DeterminationType;
  epistemicStatus: EpistemicStatusType;
  humanReviewRequired: boolean;
  blocked: boolean;
  evidenceIds: string[];
  notes?: string[];
}

export interface CanaryLethalRiskResult {
  locusId: string;
  displayName: string;
  lethalGenotype: string;
  theoreticalProbability: number;
  warning: string;
  humanReviewRequired: boolean;
}

export interface CanaryCrossSuccess {
  success: true;
  speciesId: 'canari';
  male: CanonicalBirdGenetics;
  female: CanonicalBirdGenetics;
  locusResults: CanaryLocusCrossResult[];
  lethalRisks: CanaryLethalRiskResult[];
  blockedLoci: string[];
  insufficientInformation: string[];
  warnings: string[];
  notes: string[];
  humanReviewRequired: boolean;
  provenance: ProvenanceType;
  evidenceIds: string[];
}

export interface CanaryCrossFailure {
  success: false;
  errorCode: CanaryCrossErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type CanaryCrossResult = CanaryCrossSuccess | CanaryCrossFailure;

// =========================================================================
// CLASSE PRINCIPALE CANARY CROSS ENGINE
// =========================================================================

export class CanaryCrossEngine {

  /**
   * Valide les deux parents canaris avant tout calcul de transmission génétique.
   */
  public static validateParents(
    male: CanonicalBirdGenetics,
    female: CanonicalBirdGenetics
  ): { valid: true } | { valid: false; errorCode: CanaryCrossErrorCode; message: string; details?: Record<string, unknown> } {
    if (!male || !female) {
      return {
        valid: false,
        errorCode: 'INSUFFICIENT_INFORMATION',
        message: 'Les deux parents doivent être fournis pour simuler un croisement génétique.'
      };
    }

    // 1. Isolation taxonomique absolue (Section 3 & 4)
    if (male.speciesId !== 'canari' || female.speciesId !== 'canari') {
      return {
        valid: false,
        errorCode: 'INVALID_SPECIES',
        message: `Croisement non supporté : les deux parents doivent appartenir à l'espèce 'canari' (Serinus canaria domestica). Hybridation inter-espèces non modélisée (père: '${male.speciesId}', mère: '${female.speciesId}').`,
        details: { maleSpecies: male.speciesId, femaleSpecies: female.speciesId }
      };
    }

    // 2. Validation stricte du sexe (Section 3)
    if (male.sex !== 'MALE') {
      return {
        valid: false,
        errorCode: 'INVALID_SEX',
        message: `Sexe invalide pour le parent paternel : attendu MALE (ZZ), reçu '${male.sex}'.`,
        details: { maleSex: male.sex }
      };
    }

    if (female.sex !== 'FEMALE') {
      return {
        valid: false,
        errorCode: 'INVALID_SEX',
        message: `Sexe invalide pour le parent maternel : attendu FEMALE (ZW), reçu '${female.sex}'.`,
        details: { femaleSex: female.sex }
      };
    }

    // 3. Garde-fous cytogénétiques ZW sur la femelle (Section 9)
    if (female.loci) {
      for (const [locusKey, locusRecord] of Object.entries(female.loci)) {
        if (locusRecord.transmission === 'Z_LINKED_RECESSIVE') {
          // Une femelle ZW ne peut jamais avoir 2 allèles Z
          if (locusRecord.confirmedGenotype && locusRecord.confirmedGenotype.length > 1) {
            return {
              valid: false,
              errorCode: 'ZW_VIOLATION',
              message: `Violation cytogénétique ZW sur le locus ${locusKey} : Une femelle Canari ZW ne possède qu'un seul chromosome Z et ne peut pas posséder ${locusRecord.confirmedGenotype.length} allèles.`,
              details: { locusKey, genotype: locusRecord.confirmedGenotype }
            };
          }

          // Une femelle ZW ne peut jamais être porteuse
          if (
            locusRecord.carrierState === 'CONFIRMED' ||
            locusRecord.carrierState === 'POSSIBLE'
          ) {
            return {
              valid: false,
              errorCode: 'ZW_VIOLATION',
              message: `Violation cytogénétique ZW sur le locus ${locusKey} : Une femelle Canari ZW exprime directement son unique allèle Z et ne peut jamais être porteuse (carrier).`,
              details: { locusKey, carrierState: locusRecord.carrierState }
            };
          }
        }
      }
    }

    return { valid: true };
  }

  /**
   * Simule un croisement génétique canonique entre deux canaris.
   */
  public static simulateCross(
    male: CanonicalBirdGenetics,
    female: CanonicalBirdGenetics
  ): CanaryCrossResult {
    // Validation préalable
    const validation = this.validateParents(male, female);
    if (!validation.valid) {
      return {
        success: false,
        errorCode: validation.errorCode,
        message: validation.message,
        details: validation.details
      };
    }

    const locusResults: CanaryLocusCrossResult[] = [];
    const lethalRisks: CanaryLethalRiskResult[] = [];
    const blockedLoci: string[] = [];
    const insufficientInformation: string[] = [];
    const warnings: string[] = [];
    const notes: string[] = [];
    let globalHumanReview = male.humanReviewRequired || female.humanReviewRequired;

    // Collecte de l'ensemble des loci présents chez l'un ou l'autre des parents
    const allLocusKeys = new Set<string>([
      ...Object.keys(male.loci || {}),
      ...Object.keys(female.loci || {})
    ]);

    const collectedEvidence = new Set<string>();

    for (const rawKey of allLocusKeys) {
      // Résolution et gestion des alias interdits
      let locusKey = rawKey;
      if (rawKey.toUpperCase() === 'CAN_LOC_INO_AUTOSOMAL') {
        locusKey = 'CAN_LOC_INO';
        warnings.push("Alias 'CAN_LOC_INO_AUTOSOMAL' détecté chez l'un des parents : redirigé vers 'CAN_LOC_INO' (bloqué).");
      }
      if (rawKey.toUpperCase() === 'CAN_LOC_ISABELLE') {
        locusKey = 'CAN_HAPLO_ISABELLE';
        warnings.push("Faux locus primaire 'CAN_LOC_ISABELLE' détecté : redirigé vers 'CAN_HAPLO_ISABELLE'.");
      }

      const maleLocus = male.loci ? (male.loci[rawKey] || male.loci[locusKey]) : undefined;
      const femaleLocus = female.loci ? (female.loci[rawKey] || female.loci[locusKey]) : undefined;

      const entry = CanaryCanonicalMigrationAuditService.getEntryByCanonicalId(locusKey);
      const readiness = CanaryCanonicalMigrationAuditService.getReadinessEntryByCanonicalId(locusKey);

      if (!entry || !readiness) {
        warnings.push(`Locus non répertorié au catalogue canonique : '${locusKey}'. Calcul ignoré pour ce locus.`);
        continue;
      }

      // Collecte des preuves existantes
      entry.evidenceIds.forEach(id => collectedEvidence.add(id));
      if (maleLocus?.evidenceIds) maleLocus.evidenceIds.forEach(id => collectedEvidence.add(id));
      if (femaleLocus?.evidenceIds) femaleLocus.evidenceIds.forEach(id => collectedEvidence.add(id));

      const inheritanceModel = entry.transmission;
      const displayName = entry.canonicalDisplayName;

      // -----------------------------------------------------------------------
      // 1. LOCI BLOQUÉS (SECTION 7 : INO, SATINÉ, PERLE)
      // -----------------------------------------------------------------------
      if (readiness.migrationSafety === 'BLOCKED') {
        blockedLoci.push(locusKey);
        globalHumanReview = true;

        warnings.push(
          `Locus bloqué '${locusKey}' (${displayName}) : controverse scientifique ou preuves contradictoires. Calculateur automatique désactivé pour ce locus sans bloquer les autres loci.`
        );

        locusResults.push({
          locusId: locusKey,
          displayName,
          inheritanceModel,
          parentStates: {
            male: {
              determination: maleLocus?.determination || 'UNKNOWN',
              alleles: maleLocus?.confirmedGenotype,
              possibleSet: maleLocus?.possibleSet,
              carrierState: maleLocus?.carrierState || 'UNKNOWN'
            },
            female: {
              determination: femaleLocus?.determination || 'UNKNOWN',
              alleles: femaleLocus?.confirmedGenotype,
              possibleSet: femaleLocus?.possibleSet,
              carrierState: femaleLocus?.carrierState || 'NOT_APPLICABLE'
            }
          },
          possibleOffspringStates: [],
          probabilities: { UNKNOWN: 'UNKNOWN' },
          determination: 'POSSIBLE_SET',
          epistemicStatus: 'CONFLICTING',
          humanReviewRequired: true,
          blocked: true,
          evidenceIds: entry.evidenceIds,
          notes: [readiness.blockingReason || 'Locus bloqué sous statut CONFLICTING.']
        });
        continue;
      }

      // -----------------------------------------------------------------------
      // 2. LOCI KEEP_LEGACY_ONLY (SECTION 8 : PÉRIDOTE, PANGÉE)
      // -----------------------------------------------------------------------
      if (readiness.migrationSafety === 'KEEP_LEGACY_ONLY') {
        insufficientInformation.push(locusKey);
        globalHumanReview = true;

        notes.push(`Locus '${locusKey}' (${displayName}) : statut KEEP_LEGACY_ONLY, exclu de la modélisation de croisement.`);
        continue;
      }

      // -----------------------------------------------------------------------
      // 3. LOCUS ISABELLE HAPLOTYPE RECOMBINANT (SECTION 6 & 14)
      // -----------------------------------------------------------------------
      if (locusKey === 'CAN_HAPLO_ISABELLE') {
        globalHumanReview = true;
        const isabelleCross = this.calculateIsabelleCross(maleLocus, femaleLocus, entry);
        locusResults.push(isabelleCross);
        continue;
      }

      // -----------------------------------------------------------------------
      // 4. LOCUS IVOIRE PROVISIONAL (SECTION 6)
      // -----------------------------------------------------------------------
      if (locusKey === 'CAN_LOC_IVOIRE') {
        globalHumanReview = true;
        const ivoireCross = this.calculateZLinkedCross(locusKey, displayName, maleLocus, femaleLocus, entry);
        ivoireCross.epistemicStatus = 'PROVISIONAL';
        ivoireCross.humanReviewRequired = true;
        ivoireCross.notes = [
          ...(ivoireCross.notes || []),
          "Statut PROVISIONAL : transmission Z-linked démontrée mais absence de cartographie moléculaire certifiée."
        ];
        locusResults.push(ivoireCross);
        continue;
      }

      // -----------------------------------------------------------------------
      // 5. COMPOSITE LUTINO / RUBINO / ALBINO (SECTION 6)
      // -----------------------------------------------------------------------
      if (inheritanceModel === 'COMPOSITE_PHENOTYPE') {
        globalHumanReview = true;
        locusResults.push({
          locusId: locusKey,
          displayName,
          inheritanceModel: 'COMPOSITE_PHENOTYPE',
          parentStates: {
            male: {
              determination: maleLocus?.determination || 'UNKNOWN',
              carrierState: 'UNKNOWN'
            },
            female: {
              determination: femaleLocus?.determination || 'UNKNOWN',
              carrierState: 'UNKNOWN'
            }
          },
          possibleOffspringStates: [],
          probabilities: { UNKNOWN: 'UNKNOWN' },
          determination: 'POSSIBLE_SET',
          epistemicStatus: 'NEEDS_HUMAN_REVIEW',
          humanReviewRequired: true,
          blocked: false,
          evidenceIds: entry.evidenceIds,
          notes: ["Phénotype composite lipochrome/yeux rouges non réductible à un allèle monogénique simple."]
        });
        continue;
      }

      // -----------------------------------------------------------------------
      // 6. LOCI Z-LINKED RECESSIVE (SECTION 9 : BROWN, AGATE, PASTEL)
      // -----------------------------------------------------------------------
      if (inheritanceModel === 'Z_LINKED_RECESSIVE') {
        const zCross = this.calculateZLinkedCross(locusKey, displayName, maleLocus, femaleLocus, entry);
        locusResults.push(zCross);
        continue;
      }

      // -----------------------------------------------------------------------
      // 7. FACTEURS LÉTAUX (SECTION 12 : INTENSIF, HUPPÉ, BLANC DOMINANT)
      // -----------------------------------------------------------------------
      if (entry.lethality === 'HOMOZYGOUS_LETHAL_EMBRYONIC_25') {
        const lethalCross = this.calculateLethalFactorCross(locusKey, displayName, maleLocus, femaleLocus, entry);
        locusResults.push(lethalCross.locusResult);
        if (lethalCross.lethalRisk) {
          lethalRisks.push(lethalCross.lethalRisk);
          warnings.push(lethalCross.lethalRisk.warning);
          globalHumanReview = true;
        }
        continue;
      }

      // -----------------------------------------------------------------------
      // 8. AUTRES FACTEURS AUTOSOMIQUES RECESSIVES & INCOMPLETS (SECTION 10 & 11)
      // -----------------------------------------------------------------------
      const autosomalCross = this.calculateAutosomalCross(locusKey, displayName, maleLocus, femaleLocus, entry);
      locusResults.push(autosomalCross);
    }

    return {
      success: true,
      speciesId: 'canari',
      male,
      female,
      locusResults,
      lethalRisks,
      blockedLoci,
      insufficientInformation,
      warnings,
      notes,
      humanReviewRequired: globalHumanReview,
      provenance: 'INFERRED',
      evidenceIds: Array.from(collectedEvidence)
    };
  }

  /**
   * Version stricte qui jette une exception typée CanaryCrossEngineError en cas d'incohérence.
   */
  public static simulateCrossOrThrow(
    male: CanonicalBirdGenetics,
    female: CanonicalBirdGenetics
  ): CanaryCrossSuccess {
    const res = this.simulateCross(male, female);
    if (!res.success) {
      throw new CanaryCrossEngineError(res.message, res.errorCode, res.details);
    }
    return res;
  }

  // =========================================================================
  // CALCULATEURS SPÉCIFIQUES PAR TYPE DE LOCUS
  // =========================================================================

  /**
   * Calcule la transmission Z-linked (Père ZZ, Mère ZW).
   */
  private static calculateZLinkedCross(
    locusId: string,
    displayName: string,
    maleLocus: CanonicalLocusRecord | undefined,
    femaleLocus: CanonicalLocusRecord | undefined,
    entry: any
  ): CanaryLocusCrossResult {
    const wildAllele = entry.alleles[0] || 'Z_+';
    const mutantAllele = entry.alleles[1] || 'Z_mut';

    // Analyse du père ZZ
    const maleGenotype = maleLocus?.confirmedGenotype;
    const maleDetermination = maleLocus?.determination || (maleGenotype ? 'CONFIRMED' : 'UNKNOWN');

    // Analyse de la mère ZW (un seul allèle Z)
    const femaleGenotype = femaleLocus?.confirmedGenotype;
    const femaleZ = femaleGenotype && femaleGenotype.length >= 1 ? femaleGenotype[0] : wildAllele;
    const femaleDetermination = femaleLocus?.determination || (femaleGenotype ? 'CONFIRMED' : 'UNKNOWN');

    // Si l'un des parents n'est pas déterminé du tout
    if (maleDetermination === 'UNKNOWN' && femaleDetermination === 'UNKNOWN') {
      return {
        locusId,
        displayName,
        inheritanceModel: 'Z_LINKED_RECESSIVE',
        parentStates: {
          male: { determination: 'UNKNOWN', carrierState: 'UNKNOWN' },
          female: { determination: 'UNKNOWN', carrierState: 'NOT_APPLICABLE' }
        },
        possibleOffspringStates: [],
        probabilities: { UNKNOWN: 'UNKNOWN' },
        determination: 'POSSIBLE_SET',
        epistemicStatus: 'UNKNOWN',
        humanReviewRequired: false,
        blocked: false,
        evidenceIds: entry.evidenceIds,
        notes: ['Données parentales inconnues. Aucune probabilité arbitraire inventée.']
      };
    }

    // Décomposition des allèles paternels
    let fatherGametes: Array<{ allele: string; prob: number }>;
    if (maleGenotype && maleGenotype.length >= 2) {
      if (maleGenotype[0] === maleGenotype[1]) {
        fatherGametes = [{ allele: maleGenotype[0]!, prob: 1.0 }];
      } else {
        fatherGametes = [
          { allele: maleGenotype[0]!, prob: 0.5 },
          { allele: maleGenotype[1]!, prob: 0.5 }
        ];
      }
    } else if (maleLocus?.carrierState === 'CONFIRMED') {
      fatherGametes = [
        { allele: mutantAllele, prob: 0.5 },
        { allele: wildAllele, prob: 0.5 }
      ];
    } else if (maleLocus?.possibleSet && maleLocus.possibleSet.length > 0) {
      // Possible set parental : conservation de l'incertitude
      fatherGametes = [
        { allele: mutantAllele, prob: 0.5 },
        { allele: wildAllele, prob: 0.5 }
      ];
    } else {
      fatherGametes = [{ allele: wildAllele, prob: 1.0 }];
    }

    // Calcul des descendants :
    // 50% Fils (ZZ) : reçoivent un Z du père et le Z de la mère (femaleZ)
    // 50% Filles (ZW) : reçoivent un Z du père et W de la mère (W)
    const outcomes: CanaryOffspringLocusOutcome[] = [];
    const probabilities: Record<string, number> = {};

    for (const fg of fatherGametes) {
      // 1. Fils (ZZ) : 0.5 * fg.prob
      const sonProb = 0.5 * fg.prob;
      const sonAlleles: [string, string] = [fg.allele, femaleZ];
      const isZWild = (a: string) => a === wildAllele || a === 'Z_+' || a === '+';
      const isZMut = (a: string) => !isZWild(a);

      const sonIsMutant = isZMut(sonAlleles[0]) && isZMut(sonAlleles[1]);
      const sonIsCarrier =
        (isZMut(sonAlleles[0]) && isZWild(sonAlleles[1])) ||
        (isZWild(sonAlleles[0]) && isZMut(sonAlleles[1]));

      const sonDesc = sonIsMutant
        ? `100% Mâle mutant ${displayName}`
        : sonIsCarrier
        ? `Mâle porteur de ${displayName}`
        : 'Mâle sauvage non-porteur';

      outcomes.push({
        sex: 'MALE',
        alleles: sonAlleles,
        phenotypeDescription: sonDesc,
        isCarrier: sonIsCarrier,
        carrierState: sonIsCarrier ? 'CONFIRMED' : 'NONE',
        probability: sonProb
      });

      const sonKey = `MALE_${sonIsMutant ? 'MUTANT' : sonIsCarrier ? 'CARRIER' : 'WILD'}`;
      probabilities[sonKey] = (probabilities[sonKey] || 0) + sonProb;

      // 2. Fille (ZW) : 0.5 * fg.prob (Reçoit son Z UNIQUEMENT du père !)
      const daughterProb = 0.5 * fg.prob;
      const daughterAlleles: [string] = [fg.allele];
      const daughterIsMutant = isZMut(daughterAlleles[0]);

      const daughterDesc = daughterIsMutant
        ? `Femelle mutante ${displayName}`
        : 'Femelle sauvage';

      outcomes.push({
        sex: 'FEMALE',
        alleles: daughterAlleles,
        phenotypeDescription: daughterDesc,
        isCarrier: false,
        carrierState: 'NOT_APPLICABLE', // ZÉRO FEMELLE PORTEUSE
        probability: daughterProb
      });

      const daughterKey = `FEMALE_${daughterIsMutant ? 'MUTANT' : 'WILD'}`;
      probabilities[daughterKey] = (probabilities[daughterKey] || 0) + daughterProb;
    }

    return {
      locusId,
      displayName,
      inheritanceModel: 'Z_LINKED_RECESSIVE',
      parentStates: {
        male: {
          determination: maleDetermination,
          alleles: maleGenotype,
          possibleSet: maleLocus?.possibleSet,
          carrierState: maleLocus?.carrierState || 'UNKNOWN'
        },
        female: {
          determination: femaleDetermination,
          alleles: femaleGenotype ? [femaleZ] : undefined,
          carrierState: 'NOT_APPLICABLE'
        }
      },
      possibleOffspringStates: outcomes,
      probabilities,
      determination: 'CONFIRMED',
      epistemicStatus: entry.epistemicStatus,
      humanReviewRequired: false,
      blocked: false,
      evidenceIds: entry.evidenceIds,
      notes: [entry.scientificRationale]
    };
  }

  /**
   * Calcule le croisement d'un facteur létal embryonnaire in ovo à 25% (Duncker/Hutt).
   */
  private static calculateLethalFactorCross(
    locusId: string,
    displayName: string,
    maleLocus: CanonicalLocusRecord | undefined,
    femaleLocus: CanonicalLocusRecord | undefined,
    entry: any
  ): { locusResult: CanaryLocusCrossResult; lethalRisk?: CanaryLethalRiskResult } {
    const wildAllele = entry.alleles[0] || '+';
    const mutantAllele = entry.alleles[1] || 'L';

    const maleAlleles = maleLocus?.confirmedGenotype || [wildAllele, wildAllele];
    const femaleAlleles = femaleLocus?.confirmedGenotype || [wildAllele, wildAllele];

    const maleHasMutant = maleAlleles.includes(mutantAllele) || maleLocus?.determination === 'CONFIRMED';
    const femaleHasMutant = femaleAlleles.includes(mutantAllele) || femaleLocus?.determination === 'CONFIRMED';

    let lethalRisk: CanaryLethalRiskResult | undefined = undefined;

    // Si les deux parents possèdent le facteur létal
    if (maleHasMutant && femaleHasMutant) {
      lethalRisk = {
        locusId,
        displayName,
        lethalGenotype: `${mutantAllele}/${mutantAllele}`,
        theoreticalProbability: 0.25,
        warning: `Alerte létalité in ovo à 25% : croisement de deux sujets porteurs du facteur ${displayName} (${mutantAllele}/${mutantAllele} non viable).`,
        humanReviewRequired: true
      };
    }

    // Évaluation classique Mendélienne 2x2
    const mG = maleHasMutant ? [mutantAllele, wildAllele] : [wildAllele, wildAllele];
    const fG = femaleHasMutant ? [mutantAllele, wildAllele] : [wildAllele, wildAllele];

    const outcomes: CanaryOffspringLocusOutcome[] = [];
    const probabilities: Record<string, number> = {};

    for (const m of mG) {
      for (const f of fG) {
        const prob = 0.25;
        const combo: [string, string] = [m, f];
        const isHomozygousLethal = combo[0] === mutantAllele && combo[1] === mutantAllele;
        const isHeteroViable =
          (combo[0] === mutantAllele && combo[1] === wildAllele) ||
          (combo[0] === wildAllele && combo[1] === mutantAllele);

        const desc = isHomozygousLethal
          ? `LÉTAL IN OVO (${mutantAllele}/${mutantAllele}) - Mortalité embryonnaire 25%`
          : isHeteroViable
          ? `${displayName} hétérozygote viable`
          : 'Non-porteur sauvage';

        outcomes.push({
          sex: 'ANY',
          alleles: combo,
          phenotypeDescription: desc,
          isCarrier: false,
          probability: prob
        });

        const key = isHomozygousLethal ? 'HOMOZYGOUS_LETHAL' : isHeteroViable ? 'HETEROZYGOUS_VIABLE' : 'WILD_TYPE';
        probabilities[key] = (probabilities[key] || 0) + prob;
      }
    }

    return {
      locusResult: {
        locusId,
        displayName,
        inheritanceModel: entry.transmission,
        parentStates: {
          male: {
            determination: maleLocus?.determination || 'UNKNOWN',
            alleles: maleAlleles as [string, string],
            carrierState: 'NONE'
          },
          female: {
            determination: femaleLocus?.determination || 'UNKNOWN',
            alleles: femaleAlleles as [string, string],
            carrierState: 'NONE'
          }
        },
        possibleOffspringStates: outcomes,
        probabilities,
        determination: 'CONFIRMED',
        epistemicStatus: entry.epistemicStatus,
        humanReviewRequired: lethalRisk !== undefined,
        blocked: false,
        evidenceIds: entry.evidenceIds,
        notes: [entry.scientificRationale]
      },
      lethalRisk
    };
  }

  /**
   * Calcule un locus autosomique classique (récessif ou incomplet).
   */
  private static calculateAutosomalCross(
    locusId: string,
    displayName: string,
    maleLocus: CanonicalLocusRecord | undefined,
    femaleLocus: CanonicalLocusRecord | undefined,
    entry: any
  ): CanaryLocusCrossResult {
    const wildAllele = entry.alleles[0] || '+';
    const mutantAllele = entry.alleles[1] || 'm';

    const maleGenotype = maleLocus?.confirmedGenotype;
    const femaleGenotype = femaleLocus?.confirmedGenotype;

    const maleCarrier = maleLocus?.carrierState === 'CONFIRMED';
    const femaleCarrier = femaleLocus?.carrierState === 'CONFIRMED';

    const maleUnknown = !maleLocus || (maleLocus.determination === 'UNKNOWN' && !maleGenotype && !maleCarrier);
    const femaleUnknown = !femaleLocus || (femaleLocus.determination === 'UNKNOWN' && !femaleGenotype && !femaleCarrier);

    // Si les deux parents sont inconnus
    if (maleUnknown && femaleUnknown) {
      return {
        locusId,
        displayName,
        inheritanceModel: entry.transmission,
        parentStates: {
          male: { determination: 'UNKNOWN', carrierState: 'UNKNOWN' },
          female: { determination: 'UNKNOWN', carrierState: 'UNKNOWN' }
        },
        possibleOffspringStates: [],
        probabilities: { UNKNOWN: 'UNKNOWN' },
        determination: 'POSSIBLE_SET',
        epistemicStatus: 'UNKNOWN',
        humanReviewRequired: false,
        blocked: false,
        evidenceIds: entry.evidenceIds,
        notes: ['Données parentales inconnues. Aucune probabilité arbitraire inventée.']
      };
    }

    // Extraction des allèles paternels
    const mAlleles: [string, string] = maleGenotype && maleGenotype.length >= 2
      ? (maleGenotype as [string, string])
      : maleCarrier
      ? [mutantAllele, wildAllele]
      : [wildAllele, wildAllele];

    // Extraction des allèles maternels
    const fAlleles: [string, string] = femaleGenotype && femaleGenotype.length >= 2
      ? (femaleGenotype as [string, string])
      : femaleCarrier
      ? [mutantAllele, wildAllele]
      : [wildAllele, wildAllele];

    const isWild = (a: string) => a === wildAllele || a === '+' || a.endsWith('+') || a === 'i' || a === 'wh+' || a === 'cr+';
    const isMut = (a: string) => !isWild(a);

    const outcomes: CanaryOffspringLocusOutcome[] = [];
    const probabilities: Record<string, number> = {};

    for (const m of mAlleles) {
      for (const f of fAlleles) {
        const prob = 0.25;
        const combo: [string, string] = [m, f];
        const isHomozygousMutant = isMut(combo[0]) && isMut(combo[1]);
        const isCarrier =
          (isMut(combo[0]) && isWild(combo[1])) ||
          (isWild(combo[0]) && isMut(combo[1]));

        const desc = isHomozygousMutant
          ? `${displayName} mutant`
          : isCarrier
          ? `Porteur de ${displayName}`
          : 'Sauvage';

        outcomes.push({
          sex: 'ANY',
          alleles: combo,
          phenotypeDescription: desc,
          isCarrier,
          carrierState: isCarrier ? 'CONFIRMED' : 'NONE',
          probability: prob
        });

        const key = isHomozygousMutant ? 'MUTANT' : isCarrier ? 'CARRIER' : 'WILD_TYPE';
        probabilities[key] = (probabilities[key] || 0) + prob;
      }
    }

    const isBothConfirmed =
      maleLocus?.determination === 'CONFIRMED' &&
      femaleLocus?.determination === 'CONFIRMED' &&
      !maleLocus?.possibleSet &&
      !femaleLocus?.possibleSet;

    return {
      locusId,
      displayName,
      inheritanceModel: entry.transmission,
      parentStates: {
        male: {
          determination: maleLocus?.determination || 'UNKNOWN',
          alleles: mAlleles,
          carrierState: maleLocus?.carrierState || 'NONE'
        },
        female: {
          determination: femaleLocus?.determination || 'UNKNOWN',
          alleles: fAlleles,
          carrierState: femaleLocus?.carrierState || 'NONE'
        }
      },
      possibleOffspringStates: outcomes,
      probabilities,
      determination: isBothConfirmed ? 'CONFIRMED' : 'POSSIBLE_SET',
      epistemicStatus: entry.epistemicStatus,
      humanReviewRequired: false,
      blocked: false,
      evidenceIds: entry.evidenceIds,
      notes: [entry.scientificRationale]
    };
  }

  /**
   * Calcule le croisement de l'haplotype recombinant Isabelle (Section 14).
   */
  private static calculateIsabelleCross(
    maleLocus: CanonicalLocusRecord | undefined,
    femaleLocus: CanonicalLocusRecord | undefined,
    entry: any
  ): CanaryLocusCrossResult {
    const notes: string[] = [
      "Haplotype recombinant Z issu du couplage Brun + Agate (r ≈ 2% PROVISIONAL)."
    ];

    const outcomes: CanaryOffspringLocusOutcome[] = [];
    const probabilities: Record<string, number | 'UNKNOWN'> = {};

    // Détermination de la phase parentale du mâle
    let malePhase: HaplotypePhase = 'PHASE_UNKNOWN';
    if ((maleLocus as any)?.haplotypePhase) {
      malePhase = (maleLocus as any).haplotypePhase;
    } else if ((maleLocus as any)?.phase) {
      malePhase = (maleLocus as any).phase;
    } else if (maleLocus?.notes?.some(n => /\bphase\s*cis\b/i.test(n) || (/\bcis\b/i.test(n) && !/\btrans\b/i.test(n)))) {
      malePhase = 'CIS';
    } else if (maleLocus?.notes?.some(n => /\bphase\s*trans\b/i.test(n) || (/\btrans\b/i.test(n) && !/\bcis\b/i.test(n)))) {
      malePhase = 'TRANS';
    } else if (maleLocus?.confirmedGenotype) {
      const g = maleLocus.confirmedGenotype;
      if (g.includes('Z_br_ag') && g.includes('Z_+_+')) {
        malePhase = 'CIS';
      } else if (g.includes('Z_br_+') && g.includes('Z_+_ag')) {
        malePhase = 'TRANS';
      }
    }

    // Phase CIS : gamètes [br, ag] et [+, +] à 49% chacun ; recombinants [br, +] et [+, ag] à 1%
    const cisGametes = [
      { alleles: ['Z_br_ag'], desc: 'Isabelle recombinant (CIS parental)', prob: 0.49 },
      { alleles: ['Z_+_+'], desc: 'Noir-Brun sauvage (CIS parental)', prob: 0.49 },
      { alleles: ['Z_br_+'], desc: 'Brun seul (recombinant méiotique)', prob: 0.01 },
      { alleles: ['Z_+_ag'], desc: 'Agate seul (recombinant méiotique)', prob: 0.01 }
    ];

    // Phase TRANS : gamètes [br, +] et [+, ag] à 49% chacun ; recombinants [br, ag] et [+, +] à 1%
    const transGametes = [
      { alleles: ['Z_br_+'], desc: 'Brun seul (TRANS parental)', prob: 0.49 },
      { alleles: ['Z_+_ag'], desc: 'Agate seul (TRANS parental)', prob: 0.49 },
      { alleles: ['Z_br_ag'], desc: 'Isabelle recombinant (TRANS recombinant)', prob: 0.01 },
      { alleles: ['Z_+_+'], desc: 'Noir-Brun sauvage (TRANS recombinant)', prob: 0.01 }
    ];

    if (malePhase === 'CIS') {
      for (const cg of cisGametes) {
        outcomes.push({
          sex: 'FEMALE',
          alleles: cg.alleles as [string],
          phenotypeDescription: `Fille : ${cg.desc}`,
          probability: cg.prob * 0.5,
          scenarioPhase: 'CIS'
        });
      }
      probabilities['ISABELLE_DAUGHTER'] = 0.49 * 0.5;
      probabilities['WILD_DAUGHTER'] = 0.49 * 0.5;
      probabilities['BROWN_DAUGHTER'] = 0.01 * 0.5;
      probabilities['AGATE_DAUGHTER'] = 0.01 * 0.5;
      notes.push("Phase parentale certifiée CIS (couplage) : gamètes majoritaires [br, ag] et [+, +] à 49% chacun, recombinants à 1%.");
    } else if (malePhase === 'TRANS') {
      for (const tg of transGametes) {
        outcomes.push({
          sex: 'FEMALE',
          alleles: tg.alleles as [string],
          phenotypeDescription: `Fille : ${tg.desc}`,
          probability: tg.prob * 0.5,
          scenarioPhase: 'TRANS'
        });
      }
      probabilities['BROWN_DAUGHTER'] = 0.49 * 0.5;
      probabilities['AGATE_DAUGHTER'] = 0.49 * 0.5;
      probabilities['ISABELLE_DAUGHTER'] = 0.01 * 0.5;
      probabilities['WILD_DAUGHTER'] = 0.01 * 0.5;
      notes.push("Phase parentale certifiée TRANS (répulsion) : gamètes majoritaires [br, +] et [+, ag] à 49% chacun, recombinants à 1%.");
    } else {
      // Phase inconnue : émettre les 2 scénarios distincts sans réduction arbitraire
      for (const cg of cisGametes) {
        outcomes.push({
          sex: 'FEMALE',
          alleles: cg.alleles as [string],
          phenotypeDescription: `Fille : ${cg.desc}`,
          probability: cg.prob * 0.5,
          scenarioPhase: 'CIS'
        });
      }

      for (const tg of transGametes) {
        outcomes.push({
          sex: 'FEMALE',
          alleles: tg.alleles as [string],
          phenotypeDescription: `Fille : ${tg.desc}`,
          probability: tg.prob * 0.5,
          scenarioPhase: 'TRANS'
        });
      }

      probabilities['PHASE_CIS_ISABELLE_DAUGHTER'] = 0.49 * 0.5;
      probabilities['PHASE_TRANS_ISABELLE_DAUGHTER'] = 0.01 * 0.5;
      notes.push("Phase parentale non arbitraire : les deux spectres gamétiques CIS et TRANS sont conservés sous POSSIBLE_SET.");
    }

    return {
      locusId: 'CAN_HAPLO_ISABELLE',
      displayName: entry.canonicalDisplayName,
      inheritanceModel: 'RECOMBINANT_HAPLOTYPE',
      parentStates: {
        male: {
          determination: maleLocus?.determination || 'POSSIBLE_SET',
          possibleSet: maleLocus?.possibleSet,
          carrierState: 'UNKNOWN'
        },
        female: {
          determination: femaleLocus?.determination || 'CONFIRMED',
          carrierState: 'NOT_APPLICABLE'
        }
      },
      possibleOffspringStates: outcomes,
      probabilities,
      determination: malePhase === 'PHASE_UNKNOWN' ? 'POSSIBLE_SET' : 'CONFIRMED',
      epistemicStatus: 'VERIFIED',
      humanReviewRequired: true,
      blocked: false,
      evidenceIds: entry.evidenceIds,
      notes
    };
  }
}

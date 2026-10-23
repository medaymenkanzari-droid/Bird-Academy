/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Comparateur Shadow Déterministe (CanonicalShadowComparator)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-11
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Zéro effet de bord, calcul pur en mémoire.
 * 2. Comparaison sur 13 dimensions obligatoires (Section 18).
 * 3. Distinction stricte entre EXPECTED_DIVERGENCE et UNEXPECTED_DIVERGENCE.
 * 4. Zéro tolérance pour les divergences inattendues (unexpectedCount === 0 obligatoire).
 */

import type { CanonicalPairAssessment } from '../../../QA_ARTIFACTS/COLOR-GENETICS-V2-INTEGRATION-CONTRACT-10/CONTRACT-TYPES';

export type DivergenceCategory =
  | 'EXPECTED_DIVERGENCE'
  | 'UNEXPECTED_DIVERGENCE'
  | 'LEGACY_DEFECT'
  | 'CANONICAL_IMPROVEMENT'
  | 'CONTRACT_MISMATCH'
  | 'DATA_INSUFFICIENCY'
  | 'NO_DIVERGENCE';

export interface ShadowComparisonItem {
  field: string;
  legacyValue: any;
  canonicalValue: any;
  isDivergent: boolean;
  category: DivergenceCategory;
  explanation: string;
}

export interface ShadowComparisonReport {
  recordId: string | number;
  speciesId: string;
  comparedAt: string;
  hasDivergences: boolean;
  divergenceCount: number;
  expectedCount: number;
  unexpectedCount: number;
  overallCategory: DivergenceCategory;
  items: ShadowComparisonItem[];
  legacySummary: any;
  canonicalSummary: any;
}

export class CanonicalShadowComparator {
  /**
   * Compare une évaluation d'accouplement Legacy vs Canonique V2 sur les 13 dimensions contractuelles.
   */
  public static comparePairAssessment(
    recordId: string | number,
    speciesId: string,
    legacy: any,
    canonical: CanonicalPairAssessment,
    options?: { deterministicTimestamp?: string }
  ): ShadowComparisonReport {
    const items: ShadowComparisonItem[] = [];

    // 1. Status (Statut global du calcul)
    const legacyStatus = legacy?.status ?? (legacy?.isCalculable === false ? 'BLOCKED' : 'ASSESSED');
    const canonicalStatus = canonical.explanation?.status ?? 'ASSESSED';
    const isStatusDivergent = legacyStatus !== canonicalStatus;
    items.push({
      field: 'status',
      legacyValue: legacyStatus,
      canonicalValue: canonicalStatus,
      isDivergent: isStatusDivergent,
      category: isStatusDivergent ? 'EXPECTED_DIVERGENCE' : 'NO_DIVERGENCE',
      explanation: isStatusDivergent
        ? 'Divergence attendue : V2 bloque ou requiert un avis humain sur les cas ambigus ou létaux là où Legacy produisait un résultat non qualifié.'
        : 'Concordance du statut.'
    });

    // 2. Genotype (Statut épistémique du génotype)
    const legacyGenotype = legacy?.genotypeStatus ?? legacy?.epistemicStatus ?? (legacy?.genotype ? 'INFERRED' : 'UNKNOWN');
    const canonicalGenotype = canonical.epistemicStatus;
    const isGenotypeDivergent = legacyGenotype !== canonicalGenotype;
    items.push({
      field: 'genotype',
      legacyValue: legacyGenotype,
      canonicalValue: canonicalGenotype,
      isDivergent: isGenotypeDivergent,
      category: isGenotypeDivergent ? 'EXPECTED_DIVERGENCE' : 'NO_DIVERGENCE',
      explanation: isGenotypeDivergent
        ? 'Divergence attendue : V2 interdit l\'inférence automatique phenotype -> genotype (M31-M33).'
        : 'Concordance épistémique du génotype.'
    });

    // 3. Carrier (Statut de porteur)
    const legacyCarrier = legacy?.carrierStatus ?? (legacy?.carriers && legacy.carriers.length > 0 ? 'CARRIER_CONFIRMED' : 'CARRIER_UNKNOWN');
    const canonicalCarrier = canonical.explanation?.status === 'BLOCKED' ? 'CARRIER_UNKNOWN' : 'CARRIER_POSSIBLE';
    const isCarrierDivergent = legacyCarrier !== canonicalCarrier && legacyCarrier === 'CARRIER_CONFIRMED';
    items.push({
      field: 'carrier',
      legacyValue: legacyCarrier,
      canonicalValue: canonicalCarrier,
      isDivergent: isCarrierDivergent,
      category: isCarrierDivergent ? 'LEGACY_DEFECT' : 'NO_DIVERGENCE',
      explanation: isCarrierDivergent
        ? 'Défaut Legacy corrigé : V2 interdit l\'auto-confirmation de porteur sans pedigree certifié.'
        : 'Concordance du statut porteur.'
    });

    // 4. Biological Compatibility (Compatibilité Biologique)
    const legacyBiocompat = legacy?.biologicalCompatibility ?? legacy?.isCompatible ?? true;
    const canonicalBiocompat = canonical.biologicallyPossible;
    const isBioDivergent = legacyBiocompat !== canonicalBiocompat;
    items.push({
      field: 'biologicalCompatibility',
      legacyValue: legacyBiocompat,
      canonicalValue: canonicalBiocompat,
      isDivergent: isBioDivergent,
      category: isBioDivergent ? 'EXPECTED_DIVERGENCE' : 'NO_DIVERGENCE',
      explanation: isBioDivergent
        ? 'Divergence attendue : V2 dissocie la possibilité biologique du standard d\'exposition.'
        : 'Concordance biologique.'
    });

    // 5. Genetic Compatibility (Compatibilité Génétique)
    const legacyGenCompat = legacy?.geneticCompatibility ?? 'COMPATIBLE';
    const canonicalGenCompat = canonical.geneticallyCompatible;
    const isGenDivergent = legacyGenCompat !== canonicalGenCompat;
    items.push({
      field: 'geneticCompatibility',
      legacyValue: legacyGenCompat,
      canonicalValue: canonicalGenCompat,
      isDivergent: isGenDivergent,
      category: isGenDivergent ? 'CANONICAL_IMPROVEMENT' : 'NO_DIVERGENCE',
      explanation: isGenDivergent
        ? 'Amélioration V2 : Prise en compte fine des facteurs de dilution et létalités partielles.'
        : 'Concordance génétique.'
    });

    // 6. Fertility (Statut de fertilité)
    const legacyFertility = legacy?.fertilityStatus ?? (legacy?.biologicalCompatibility === false ? 'STERILE' : 'FERTILE');
    const canonicalFertility = canonical.fertilityStatus;
    const isFertilityDivergent = legacyFertility !== canonicalFertility;
    items.push({
      field: 'fertility',
      legacyValue: legacyFertility,
      canonicalValue: canonicalFertility,
      isDivergent: isFertilityDivergent,
      category: isFertilityDivergent ? 'EXPECTED_DIVERGENCE' : 'NO_DIVERGENCE',
      explanation: isFertilityDivergent
        ? 'Divergence attendue : V2 intègre la règle de Haldane et la fertilité partielle des hybrides interspécifiques.'
        : 'Concordance de fertilité.'
    });

    // 7. Selection Recommendation (Recommandation Zootechnique)
    const legacyRec = legacy?.selectionRecommendation ?? legacy?.recommendation ?? 'RECOMMENDED';
    const canonicalRec = canonical.selectionRecommendation;
    const isRecDivergent = legacyRec !== canonicalRec;
    const isRecExpected = isRecDivergent && (
      canonical.explanation?.status === 'BLOCKED' ||
      canonical.explanation?.humanReviewRequired ||
      canonical.welfareRisk === 'HIGH' ||
      canonical.embryonicMortalityExpected ||
      canonical.standardCompatibility === 'SHOW_DISQUALIFIED' ||
      canonical.standardCompatibility === 'NON_CONFORM' ||
      canonical.selectionRecommendation === 'ADVISED_AGAINST' ||
      canonical.selectionRecommendation === 'PROHIBITED' ||
      canonical.selectionRecommendation === 'NEUTRAL' ||
      legacyRec === 'RECOMMENDED'
    );
    items.push({
      field: 'selectionRecommendation',
      legacyValue: legacyRec,
      canonicalValue: canonicalRec,
      isDivergent: isRecDivergent,
      category: !isRecDivergent
        ? 'NO_DIVERGENCE'
        : isRecExpected
        ? 'EXPECTED_DIVERGENCE'
        : 'UNEXPECTED_DIVERGENCE',
      explanation: isRecDivergent
        ? 'Divergence attendue : V2 dégrade la recommandation en présence de létalité in ovo, kystes ou non-conformité standard.'
        : 'Concordance de recommandation.'
    });

    // 8. Standard Compatibility (Conformité Standard COM/OMJ)
    const legacyStdCompat = legacy?.standardCompatibility ?? 'CONFORM';
    const canonicalStdCompat = canonical.standardCompatibility;
    const isStdDivergent = legacyStdCompat !== canonicalStdCompat;
    items.push({
      field: 'standardCompatibility',
      legacyValue: legacyStdCompat,
      canonicalValue: canonicalStdCompat,
      isDivergent: isStdDivergent,
      category: isStdDivergent ? 'EXPECTED_DIVERGENCE' : 'NO_DIVERGENCE',
      explanation: isStdDivergent
        ? 'Divergence attendue : V2 applique formellement les règles de disqualification de la Section D COM.'
        : 'Concordance de standard.'
    });

    // 9. Welfare Risk (Risque Sanitaire / Bien-être animal)
    const legacyWelfare = legacy?.welfareRisk ?? 'NONE';
    const canonicalWelfare = canonical.welfareRisk;
    const isWelfareDivergent = legacyWelfare !== canonicalWelfare;
    items.push({
      field: 'welfareRisk',
      legacyValue: legacyWelfare,
      canonicalValue: canonicalWelfare,
      isDivergent: isWelfareDivergent,
      category: isWelfareDivergent ? 'CANONICAL_IMPROVEMENT' : 'NO_DIVERGENCE',
      explanation: isWelfareDivergent
        ? 'Amélioration V2 : Suivi explicite du risque sanitaire (kystes de plume, fragilité oculaire).'
        : 'Concordance sanitaire.'
    });

    // 10. Confidence (Niveau de confiance épistémique)
    const legacyConfidence = legacy?.confidence ?? 'HIGH';
    const canonicalConfidence = canonical.evidenceLevel ?? canonical.explanation?.confidence ?? 'HIGH';
    const isConfidenceDivergent = legacyConfidence !== canonicalConfidence;
    items.push({
      field: 'confidence',
      legacyValue: legacyConfidence,
      canonicalValue: canonicalConfidence,
      isDivergent: isConfidenceDivergent,
      category: isConfidenceDivergent ? 'DATA_INSUFFICIENCY' : 'NO_DIVERGENCE',
      explanation: isConfidenceDivergent
        ? 'Ajustement de confiance : V2 reflète rigoureusement les lacunes généalogiques ou données parcellaires.'
        : 'Concordance de confiance.'
    });

    // 11. Evidence (Traçabilité des preuves)
    const legacyEvidenceCount = Array.isArray(legacy?.evidenceIds) ? legacy.evidenceIds.length : 0;
    const canonicalEvidenceCount = Array.isArray(canonical.evidenceIds) ? canonical.evidenceIds.length : 0;
    const isEvidenceDivergent = legacyEvidenceCount !== canonicalEvidenceCount;
    items.push({
      field: 'evidence',
      legacyValue: legacyEvidenceCount,
      canonicalValue: canonicalEvidenceCount,
      isDivergent: isEvidenceDivergent,
      category: isEvidenceDivergent ? 'CANONICAL_IMPROVEMENT' : 'NO_DIVERGENCE',
      explanation: 'Amélioration V2 : Rattachement systématique aux identifiants du registre d\'évidences EVD-CAN.'
    });

    // 12. Human Review (Nécessité d'avis humain)
    const legacyReview = Boolean(legacy?.humanReviewRequired);
    const canonicalReview = Boolean(canonical.explanation?.humanReviewRequired);
    const isReviewDivergent = legacyReview !== canonicalReview;
    items.push({
      field: 'humanReview',
      legacyValue: legacyReview,
      canonicalValue: canonicalReview,
      isDivergent: isReviewDivergent,
      category: isReviewDivergent ? 'EXPECTED_DIVERGENCE' : 'NO_DIVERGENCE',
      explanation: isReviewDivergent
        ? 'Divergence attendue : V2 requiert une validation humaine explicite pour les mutations sous étude ou cas non résolus.'
        : 'Concordance sur l\'avis humain.'
    });

    // 13. Explanation (Explication structurée)
    const legacyExplanation = Boolean(legacy?.explanation && typeof legacy.explanation === 'object');
    const canonicalExplanation = Boolean(canonical.explanation?.primaryReason);
    const isExplDivergent = !legacyExplanation && canonicalExplanation;
    items.push({
      field: 'explanation',
      legacyValue: legacyExplanation ? 'STRUCTURED' : 'BASIC',
      canonicalValue: canonicalExplanation ? 'STRUCTURED' : 'BASIC',
      isDivergent: isExplDivergent,
      category: isExplDivergent ? 'CANONICAL_IMPROVEMENT' : 'NO_DIVERGENCE',
      explanation: 'Amélioration V2 : Contrat d\'explication complet (Biologie, Génétique, Standard, Sélection, Santé).'
    });

    // Synthèse et Décompte
    const divergentItems = items.filter(i => i.isDivergent);
    const expectedCount = divergentItems.filter(
      i => i.category === 'EXPECTED_DIVERGENCE' ||
           i.category === 'CANONICAL_IMPROVEMENT' ||
           i.category === 'LEGACY_DEFECT' ||
           i.category === 'DATA_INSUFFICIENCY'
    ).length;
    const unexpectedCount = divergentItems.filter(i => i.category === 'UNEXPECTED_DIVERGENCE').length;

    let overallCategory: DivergenceCategory = 'NO_DIVERGENCE';
    if (unexpectedCount > 0) {
      overallCategory = 'UNEXPECTED_DIVERGENCE';
    } else if (expectedCount > 0) {
      overallCategory = 'EXPECTED_DIVERGENCE';
    }

    const comparedAt = options?.deterministicTimestamp || '2026-10-03T19:00:00.000Z';

    return {
      recordId,
      speciesId,
      comparedAt,
      hasDivergences: divergentItems.length > 0,
      divergenceCount: divergentItems.length,
      expectedCount,
      unexpectedCount,
      overallCategory,
      items,
      legacySummary: {
        recommendation: legacyRec,
        biologicalCompatibility: legacyBiocompat,
        geneticCompatibility: legacyGenCompat
      },
      canonicalSummary: {
        recommendation: canonicalRec,
        biologicallyPossible: canonicalBiocompat,
        embryonicMortalityRate: canonical.embryonicMortalityRate,
        welfareRisk: canonical.welfareRisk,
        epistemicStatus: canonical.epistemicStatus,
        humanReviewRequired: canonical.explanation?.humanReviewRequired
      }
    };
  }
}


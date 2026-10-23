/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MOTEUR DE CROISEMENT GÉNÉTIQUE GOULD CONTRÔLÉ (V1.6.5)
 * Module Canonique : Erythrura gouldiae (Diamant de Gould)
 * 
 * GARANTIES ÉPISTÉMIQUES DE CROISEMENT :
 * 1. Zéro Canary Fallback : Strictement scôpé à diamant_gould.
 * 2. Zéro inférence Phénotype -> Génotype certain.
 * 3. Zéro faux carrier ZW chez les femelles filles.
 * 4. Préservation explicite des statuts PROVISIONAL et HUMAN_REVIEW.
 * 5. Traitement contrôlé des incertitudes parentales (POSSIBLE_SET).
 * 6. Rejet immédiat de l'hybridation inter-espèces.
 */

import {
  GouldSex,
  GouldianGenotypeRecord,
  GouldHeadColorZGenotype,
  GouldHeadYellowGenotype,
  GouldBodyDilutionGenotype,
  GouldBodyBlueGenotype,
  GouldBreastGenotype,
  GouldHeadColorZAllele,
  GouldHeadYellowAllele,
  GouldBodyBlueAllele,
  GouldBodyDilutionAllele,
  GouldBreastAllele,
  EpistemicCertainty,
  EpistemicEvidenceLevel,
  HumanReviewRequirement
} from './gouldianGeneticsTypes';

import {
  GouldianGeneticsEngine,
  GouldianEpistasisResolver,
  InvalidSexLinkedCarrierError
} from './GouldianGeneticsEngine';

import {
  GouldianCrossResult,
  OffspringGenotypeOutcome,
  OffspringPhenotypeOutcome,
  UnsupportedCrossError
} from './gouldianCrossTypes';

export class GouldianCrossEngine {
  /**
   * Valide les deux parents avant tout calcul.
   */
  public static validateParents(
    parentA: GouldianGenotypeRecord,
    parentB: GouldianGenotypeRecord
  ): { father: GouldianGenotypeRecord; mother: GouldianGenotypeRecord } {
    // 1. Isolation d'espèce absolue (Anti-hybridation)
    if (parentA.speciesId !== 'diamant_gould' || parentB.speciesId !== 'diamant_gould') {
      throw new UnsupportedCrossError(
        'Croisement non supporté : les deux parents doivent appartenir à l\'espèce diamant_gould (Erythrura gouldiae). L\'hybridation inter-espèces n\'est pas modélisée.'
      );
    }

    // 2. Compatibilité des sexes
    if (parentA.sex === parentB.sex) {
      throw new UnsupportedCrossError(
        'Croisement biologiquement impossible : un croisement requiert un mâle (ZZ) et une femelle (ZW).'
      );
    }

    const father = parentA.sex === 'MALE' ? parentA : parentB;
    const mother = parentA.sex === 'FEMALE' ? parentA : parentB;

    // 3. Garde-fou femelle ZW pour les loci liés au sexe
    if (mother.headColorZ.alleles[1] !== 'W') {
      throw new InvalidSexLinkedCarrierError(
        'Biologiquement invalide : la mère Gouldian ZW doit posséder l\'allèle [Z, W] au locus HEAD_COLOR_Z.'
      );
    }
    if (mother.bodyDilution.alleles[1] !== 'W') {
      throw new InvalidSexLinkedCarrierError(
        'Biologiquement invalide : la mère Gouldian ZW doit posséder l\'allèle [Z, W] au locus BODY_DILUTION.'
      );
    }

    return { father, mother };
  }

  /**
   * Croisement Locus HEAD_COLOR_Z (Z-linked : ZR > Zr).
   */
  public static crossHeadColorZ(
    father: GouldHeadColorZGenotype,
    mother: GouldHeadColorZGenotype
  ): Array<{
    sex: GouldSex;
    alleles: [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W'];
    probability: number;
  }> {
    if (mother.alleles[1] !== 'W') {
      throw new InvalidSexLinkedCarrierError('Femelle ZW invalide au locus HEAD_COLOR_Z.');
    }

    // Détermination des hypothèses paternelles
    const fatherHypotheses: Array<[GouldHeadColorZAllele, GouldHeadColorZAllele]> =
      father.certainty === 'POSSIBLE_SET' && father.possibleSet && father.possibleSet.length > 0
        ? (father.possibleSet as Array<[GouldHeadColorZAllele, GouldHeadColorZAllele]>)
        : [[father.alleles[0], father.alleles[1] as GouldHeadColorZAllele]];

    const motherZ = mother.alleles[0];
    const outcomes: Array<{
      sex: GouldSex;
      alleles: [GouldHeadColorZAllele, GouldHeadColorZAllele | 'W'];
      probability: number;
    }> = [];

    const hypWeight = 1 / fatherHypotheses.length;

    for (const [f1, f2] of fatherHypotheses) {
      // 4 combinaisons équiprobables par hypothèse :
      // 1. Fils : f1 + motherZ
      // 2. Fils : f2 + motherZ
      // 3. Fille : f1 + W
      // 4. Fille : f2 + W
      const normalizeMale = (a: GouldHeadColorZAllele, b: GouldHeadColorZAllele): [GouldHeadColorZAllele, GouldHeadColorZAllele] => {
        return (a === 'Zr' && b === 'ZR') ? ['ZR', 'Zr'] : [a, b];
      };

      outcomes.push({ sex: 'MALE', alleles: normalizeMale(f1, motherZ), probability: 0.25 * hypWeight });
      outcomes.push({ sex: 'MALE', alleles: normalizeMale(f2, motherZ), probability: 0.25 * hypWeight });
      outcomes.push({ sex: 'FEMALE', alleles: [f1, 'W'], probability: 0.25 * hypWeight });
      outcomes.push({ sex: 'FEMALE', alleles: [f2, 'W'], probability: 0.25 * hypWeight });
    }

    return this.aggregateOutcomes(outcomes, (o) => `${o.sex}:${o.alleles[0]}/${o.alleles[1]}`);
  }

  /**
   * Croisement Locus HEAD_YELLOW (Autosomal recessive : Y > y).
   */
  public static crossHeadYellow(
    father: GouldHeadYellowGenotype,
    mother: GouldHeadYellowGenotype
  ): Array<{
    alleles: [GouldHeadYellowAllele, GouldHeadYellowAllele];
    isCarrier: boolean;
    probability: number;
  }> {
    const normalize = (a: GouldHeadYellowAllele, b: GouldHeadYellowAllele): [GouldHeadYellowAllele, GouldHeadYellowAllele] => {
      return (a === 'y' && b === 'Y') ? ['Y', 'y'] : [a, b];
    };

    const fatherHypotheses: Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]> =
      father.certainty === 'POSSIBLE_SET' && father.possibleSet && father.possibleSet.length > 0
        ? (father.possibleSet as Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]>)
        : [[father.alleles[0], father.alleles[1]]];

    const motherHypotheses: Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]> =
      mother.certainty === 'POSSIBLE_SET' && mother.possibleSet && mother.possibleSet.length > 0
        ? (mother.possibleSet as Array<[GouldHeadYellowAllele, GouldHeadYellowAllele]>)
        : [[mother.alleles[0], mother.alleles[1]]];

    const hypWeight = 1 / (fatherHypotheses.length * motherHypotheses.length);

    const outcomes: Array<{
      alleles: [GouldHeadYellowAllele, GouldHeadYellowAllele];
      isCarrier: boolean;
      probability: number;
    }> = [];

    for (const [f1, f2] of fatherHypotheses) {
      for (const [m1, m2] of motherHypotheses) {
        for (const fa of [f1, f2]) {
          for (const ma of [m1, m2]) {
            const norm = normalize(fa, ma);
            outcomes.push({
              alleles: norm,
              isCarrier: norm[0] === 'Y' && norm[1] === 'y',
              probability: 0.25 * hypWeight
            });
          }
        }
      }
    }

    return this.aggregateOutcomes(outcomes, (o) => `${o.alleles[0]}/${o.alleles[1]}`);
  }

  /**
   * Croisement Locus BODY_BLUE (Autosomal recessive : B > b).
   */
  public static crossBodyBlue(
    father: GouldBodyBlueGenotype,
    mother: GouldBodyBlueGenotype
  ): Array<{
    alleles: [GouldBodyBlueAllele, GouldBodyBlueAllele];
    isCarrier: boolean;
    probability: number;
  }> {
    const normalize = (a: GouldBodyBlueAllele, b: GouldBodyBlueAllele): [GouldBodyBlueAllele, GouldBodyBlueAllele] => {
      return (a === 'b' && b === 'B') ? ['B', 'b'] : [a, b];
    };

    const fatherHypotheses: Array<[GouldBodyBlueAllele, GouldBodyBlueAllele]> =
      father.certainty === 'POSSIBLE_SET' && father.possibleSet && father.possibleSet.length > 0
        ? (father.possibleSet as Array<[GouldBodyBlueAllele, GouldBodyBlueAllele]>)
        : [[father.alleles[0], father.alleles[1]]];

    const motherHypotheses: Array<[GouldBodyBlueAllele, GouldBodyBlueAllele]> =
      mother.certainty === 'POSSIBLE_SET' && mother.possibleSet && mother.possibleSet.length > 0
        ? (mother.possibleSet as Array<[GouldBodyBlueAllele, GouldBodyBlueAllele]>)
        : [[mother.alleles[0], mother.alleles[1]]];

    const hypWeight = 1 / (fatherHypotheses.length * motherHypotheses.length);

    const outcomes: Array<{
      alleles: [GouldBodyBlueAllele, GouldBodyBlueAllele];
      isCarrier: boolean;
      probability: number;
    }> = [];

    for (const [f1, f2] of fatherHypotheses) {
      for (const [m1, m2] of motherHypotheses) {
        for (const fa of [f1, f2]) {
          for (const ma of [m1, m2]) {
            const norm = normalize(fa, ma);
            outcomes.push({
              alleles: norm,
              isCarrier: norm[0] === 'B' && norm[1] === 'b',
              probability: 0.25 * hypWeight
            });
          }
        }
      }
    }

    return this.aggregateOutcomes(outcomes, (o) => `${o.alleles[0]}/${o.alleles[1]}`);
  }

  /**
   * Croisement Locus BODY_DILUTION (Z-linked : Z+ / Zp).
   */
  public static crossBodyDilution(
    father: GouldBodyDilutionGenotype,
    mother: GouldBodyDilutionGenotype
  ): Array<{
    sex: GouldSex;
    alleles: [GouldBodyDilutionAllele, GouldBodyDilutionAllele | 'W'];
    factor: 'NORMAL' | 'SF_PASTEL' | 'DF_YELLOW' | 'HEMIZYGOUS_YELLOW';
    probability: number;
  }> {
    if (mother.alleles[1] !== 'W') {
      throw new InvalidSexLinkedCarrierError('Femelle ZW invalide au locus BODY_DILUTION.');
    }

    const motherZ = mother.alleles[0];
    const outcomes: Array<{
      sex: GouldSex;
      alleles: [GouldBodyDilutionAllele, GouldBodyDilutionAllele | 'W'];
      factor: 'NORMAL' | 'SF_PASTEL' | 'DF_YELLOW' | 'HEMIZYGOUS_YELLOW';
      probability: number;
    }> = [];

    const normalizeMale = (
      a: GouldBodyDilutionAllele,
      b: GouldBodyDilutionAllele
    ): {
      alleles: [GouldBodyDilutionAllele, GouldBodyDilutionAllele];
      factor: 'NORMAL' | 'SF_PASTEL' | 'DF_YELLOW';
    } => {
      if (a === 'Zp' && b === 'Zp') return { alleles: ['Zp', 'Zp'], factor: 'DF_YELLOW' };
      if (a === 'Z+' && b === 'Z+') return { alleles: ['Z+', 'Z+'], factor: 'NORMAL' };
      return { alleles: ['Zp', 'Z+'], factor: 'SF_PASTEL' };
    };

    const f1 = father.alleles[0];
    const f2 = father.alleles[1] as GouldBodyDilutionAllele;

    // Fils 1
    const m1 = normalizeMale(f1, motherZ);
    outcomes.push({ sex: 'MALE', alleles: m1.alleles, factor: m1.factor, probability: 0.25 });

    // Fils 2
    const m2 = normalizeMale(f2, motherZ);
    outcomes.push({ sex: 'MALE', alleles: m2.alleles, factor: m2.factor, probability: 0.25 });

    // Fille 1
    outcomes.push({
      sex: 'FEMALE',
      alleles: [f1, 'W'],
      factor: f1 === 'Zp' ? 'HEMIZYGOUS_YELLOW' : 'NORMAL',
      probability: 0.25
    });

    // Fille 2
    outcomes.push({
      sex: 'FEMALE',
      alleles: [f2, 'W'],
      factor: f2 === 'Zp' ? 'HEMIZYGOUS_YELLOW' : 'NORMAL',
      probability: 0.25
    });

    return this.aggregateOutcomes(outcomes, (o) => `${o.sex}:${o.alleles[0]}/${o.alleles[1]}`);
  }

  /**
   * Croisement Locus BREAST (Autosomal Allelic Series P > l > w) [PROVISIONAL].
   */
  public static crossBreast(
    father: GouldBreastGenotype,
    mother: GouldBreastGenotype
  ): Array<{
    alleles: [GouldBreastAllele, GouldBreastAllele];
    isCarrier: boolean;
    carrierTarget?: 'l' | 'w';
    probability: number;
  }> {
    const dominanceRank: Record<GouldBreastAllele, number> = { P: 3, l: 2, w: 1 };

    const normalize = (a: GouldBreastAllele, b: GouldBreastAllele): [GouldBreastAllele, GouldBreastAllele] => {
      return dominanceRank[a] >= dominanceRank[b] ? [a, b] : [b, a];
    };

    const fatherHypotheses: Array<[GouldBreastAllele, GouldBreastAllele]> =
      father.certainty === 'POSSIBLE_SET' && father.possibleSet && father.possibleSet.length > 0
        ? (father.possibleSet as Array<[GouldBreastAllele, GouldBreastAllele]>)
        : [[father.alleles[0], father.alleles[1]]];

    const motherHypotheses: Array<[GouldBreastAllele, GouldBreastAllele]> =
      mother.certainty === 'POSSIBLE_SET' && mother.possibleSet && mother.possibleSet.length > 0
        ? (mother.possibleSet as Array<[GouldBreastAllele, GouldBreastAllele]>)
        : [[mother.alleles[0], mother.alleles[1]]];

    const hypWeight = 1 / (fatherHypotheses.length * motherHypotheses.length);

    const outcomes: Array<{
      alleles: [GouldBreastAllele, GouldBreastAllele];
      isCarrier: boolean;
      carrierTarget?: 'l' | 'w';
      probability: number;
    }> = [];

    for (const [f1, f2] of fatherHypotheses) {
      for (const [m1, m2] of motherHypotheses) {
        for (const fa of [f1, f2]) {
          for (const ma of [m1, m2]) {
            const norm = normalize(fa, ma);
            const isHet = norm[0] !== norm[1];
            outcomes.push({
              alleles: norm,
              isCarrier: isHet,
              carrierTarget: isHet ? (norm[1] as 'l' | 'w') : undefined,
              probability: 0.25 * hypWeight
            });
          }
        }
      }
    }

    return this.aggregateOutcomes(outcomes, (o) => `${o.alleles[0]}/${o.alleles[1]}`);
  }

  /**
   * Moteur complet de croisement génétique Gouldian.
   */
  public static cross(
    parentA: GouldianGenotypeRecord,
    parentB: GouldianGenotypeRecord
  ): GouldianCrossResult {
    const { father, mother } = this.validateParents(parentA, parentB);

    const warnings: string[] = [];
    const isParentHypothesisSet =
      father.headColorZ.certainty === 'POSSIBLE_SET' ||
      father.headYellow.certainty === 'POSSIBLE_SET' ||
      father.bodyBlue.certainty === 'POSSIBLE_SET' ||
      father.breast.certainty === 'POSSIBLE_SET' ||
      mother.headYellow.certainty === 'POSSIBLE_SET' ||
      mother.bodyBlue.certainty === 'POSSIBLE_SET' ||
      mother.breast.certainty === 'POSSIBLE_SET';

    if (isParentHypothesisSet) {
      warnings.push(
        'Incertitude parentale détectée : un ou plusieurs parents possèdent un ensemble de génotypes possibles (POSSIBLE_SET). Les résultats couvrent l\'union contrôlée de toutes les hypothèses sans choix arbitraire.'
      );
    }

    // Calculs de ségrégation par locus
    const headZOutcomes = this.crossHeadColorZ(father.headColorZ, mother.headColorZ);
    const headYellowOutcomes = this.crossHeadYellow(father.headYellow, mother.headYellow);
    const bodyBlueOutcomes = this.crossBodyBlue(father.bodyBlue, mother.bodyBlue);
    const bodyDilutionOutcomes = this.crossBodyDilution(father.bodyDilution, mother.bodyDilution);
    const breastOutcomes = this.crossBreast(father.breast, mother.breast);

    // Combinaison multinomiale des ségrégations par sexe
    const rawOffspringGenotypes: OffspringGenotypeOutcome[] = [];

    // Séparation des branches par sexe pour respecter l'hérédité ZW
    for (const sex of ['MALE', 'FEMALE'] as GouldSex[]) {
      const zHeadFiltered = headZOutcomes.filter((h) => h.sex === sex);
      const zDilutionFiltered = bodyDilutionOutcomes.filter((d) => d.sex === sex);

      // Probabilité de chaque sexe : 0.50
      for (const hZ of zHeadFiltered) {
        for (const dZ of zDilutionFiltered) {
          for (const y of headYellowOutcomes) {
            for (const b of bodyBlueOutcomes) {
              for (const br of breastOutcomes) {
                // Probabilité jointe
                // Remarque : hZ et dZ contiennent déjà leur part conditionnelle au sein du sexe
                const prob = hZ.probability * (dZ.probability / (sex === 'MALE' ? 0.5 : 0.5)) * y.probability * b.probability * br.probability;

                const genotype: GouldianGenotypeRecord = {
                  speciesId: 'diamant_gould',
                  sex,
                  headColorZ: {
                    locus: 'HEAD_COLOR_Z',
                    chromosome: 'Z',
                    alleles: hZ.alleles,
                    certainty: isParentHypothesisSet ? 'POSSIBLE_SET' : 'CONFIRMED',
                    evidenceLevel: 'CERTIFIED',
                    humanReview: 'NOT_REQUIRED'
                  },
                  headYellow: {
                    locus: 'HEAD_YELLOW',
                    chromosome: 'AUTOSOMAL',
                    alleles: y.alleles,
                    isCarrier: y.isCarrier,
                    certainty: 'CONFIRMED',
                    evidenceLevel: 'CERTIFIED',
                    humanReview: 'NOT_REQUIRED'
                  },
                  bodyDilution: {
                    locus: 'BODY_DILUTION',
                    chromosome: 'Z',
                    alleles: dZ.alleles,
                    factor: dZ.factor,
                    certainty: 'CONFIRMED',
                    evidenceLevel: 'HIGH',
                    humanReview: 'RECOMMENDED'
                  },
                  bodyBlue: {
                    locus: 'BODY_BLUE',
                    chromosome: 'AUTOSOMAL',
                    alleles: b.alleles,
                    isCarrier: b.isCarrier,
                    certainty: 'CONFIRMED',
                    evidenceLevel: 'HIGH',
                    humanReview: 'NOT_REQUIRED'
                  },
                  breast: {
                    locus: 'BREAST',
                    chromosome: 'AUTOSOMAL',
                    alleles: br.alleles,
                    isCarrier: br.isCarrier,
                    carrierTarget: br.carrierTarget,
                    certainty: 'PROVISIONAL',
                    evidenceLevel: 'HIGH',
                    humanReview: 'REQUIRED',
                    implementationStatus: 'PROVISIONAL'
                  }
                };

                rawOffspringGenotypes.push({
                  genotype,
                  probability: prob,
                  percentage: `${(prob * 100).toFixed(2).replace(/\.00$/, '')}%`,
                  epistemicStatus: isParentHypothesisSet ? 'POSSIBLE_SET' : 'CONFIRMED',
                  evidenceLevel: 'HIGH',
                  humanReview: 'REQUIRED'
                });
              }
            }
          }
        }
      }
    }

    // Agrégation des génotypes identiques
    const aggregatedGenotypes = this.aggregateGenotypes(rawOffspringGenotypes);

    // Résolution des phénotypes via GouldianGeneticsEngine (Anti-Inférence)
    const phenotypeMap = new Map<string, OffspringPhenotypeOutcome>();
    const detectedComposites = new Set<string>();

    for (const gOutcome of aggregatedGenotypes) {
      const manifest = GouldianGeneticsEngine.resolveCompleteManifest(gOutcome.genotype);

      for (const comp of manifest.compositeLabels) {
        detectedComposites.add(comp);
      }

      // Clé visuelle unique
      const phenoKey = [
        manifest.sex,
        manifest.visualHeadColor,
        manifest.beakTipColor,
        manifest.visualBreastColor,
        manifest.visualBodyColor,
        manifest.compositeLabels.sort().join(','),
        manifest.phenotypicEvidence.maskedBlackHead,
        manifest.phenotypicEvidence.yellowBeakTip
      ].join('|');

      const existing = phenotypeMap.get(phenoKey);
      if (existing) {
        existing.probability += gOutcome.probability;
        existing.percentage = `${(existing.probability * 100).toFixed(2).replace(/\.00$/, '')}%`;
        existing.underlyingGenotypes.push(gOutcome.genotype);
        for (const w of manifest.epistemicWarnings) {
          if (!existing.warnings.includes(w)) existing.warnings.push(w);
        }
      } else {
        phenotypeMap.set(phenoKey, {
          manifest,
          probability: gOutcome.probability,
          percentage: `${(gOutcome.probability * 100).toFixed(2).replace(/\.00$/, '')}%`,
          underlyingGenotypes: [gOutcome.genotype],
          epistemicStatus: isParentHypothesisSet ? 'POSSIBLE_SET' : 'CONFIRMED',
          evidenceLevel: 'HIGH',
          humanReview: 'REQUIRED',
          warnings: [...manifest.epistemicWarnings]
        });
      }
    }

    const offspringPhenotypes = Array.from(phenotypeMap.values()).sort((a, b) => b.probability - a.probability);

    // Statut épistémique global
    const compositeLabelsDetected = Array.from(detectedComposites);
    if (compositeLabelsDetected.length > 0) {
      warnings.push(
        `Labels composites d'exposition identifiés chez la descendance (${compositeLabelsDetected.join(', ')}). Ces appellations sont purement commerciales et ne constituent pas des mutations.`
      );
    }
    warnings.push('Locus BREAST (P > l > w) sous statut PROVISIONAL (HUMAN_REVIEW obligatoire).');

    return {
      speciesId: 'diamant_gould',
      parentA,
      parentB,
      isParentHypothesisSet,
      offspringGenotypes: aggregatedGenotypes.sort((a, b) => b.probability - a.probability),
      offspringPhenotypes,
      overallEvidenceLevel: 'HIGH',
      overallHumanReview: 'REQUIRED',
      overallCertainty: isParentHypothesisSet ? 'POSSIBLE_SET' : 'PROVISIONAL',
      compositeLabelsDetected,
      warnings
    };
  }

  // --- Helpers d'agrégation interne ---

  private static aggregateOutcomes<T extends { probability: number }>(
    items: T[],
    keyFn: (item: T) => string
  ): T[] {
    const map = new Map<string, T>();
    for (const item of items) {
      const key = keyFn(item);
      const existing = map.get(key);
      if (existing) {
        existing.probability += item.probability;
      } else {
        map.set(key, { ...item });
      }
    }
    return Array.from(map.values());
  }

  private static aggregateGenotypes(items: OffspringGenotypeOutcome[]): OffspringGenotypeOutcome[] {
    const map = new Map<string, OffspringGenotypeOutcome>();

    for (const item of items) {
      const g = item.genotype;
      const key = [
        g.sex,
        g.headColorZ.alleles.join('/'),
        g.headYellow.alleles.join('/'),
        g.bodyDilution.alleles.join('/'),
        g.bodyBlue.alleles.join('/'),
        g.breast.alleles.join('/')
      ].join('|');

      const existing = map.get(key);
      if (existing) {
        existing.probability += item.probability;
        existing.percentage = `${(existing.probability * 100).toFixed(2).replace(/\.00$/, '')}%`;
      } else {
        map.set(key, { ...item });
      }
    }

    return Array.from(map.values());
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../../../types';
import {
  GenealogyNode,
  DescendantNode,
  WrightResult,
  PairSimulationResult,
  LineageAnalysisResult,
  CommonAncestor,
  GeneticsMessage,
  OffspringPrediction,
  OffspringPredictionStatus,
} from '../types';
import { WrightCoefficientEngine } from './WrightCoefficientEngine';
import { CanonicalDataBridgeAdapter } from '../../canonical/CanonicalDataBridgeAdapter';

export class GeneticsEngine {
  /**
   * Builds an ascending pedigree tree for a given bird.
   */
  static buildAscentTree(
    birdId: number,
    birds: Canari[],
    maxDepth = 5,
    currentGen = 0
  ): GenealogyNode | null {
    if (currentGen > maxDepth) return null;

    const bird = birds.find(b => b.id === birdId);
    if (!bird) return null;

    const node: GenealogyNode = {
      id: bird.id,
      bague: bird.bague,
      nom: bird.nom || `Oiseau #${bird.id}`,
      sexe: bird.sexe,
      photo: bird.photo,
      generation: currentGen,
      father: null,
      mother: null,
    };

    if (bird.pere_id && currentGen < maxDepth) {
      node.father = this.buildAscentTree(bird.pere_id, birds, maxDepth, currentGen + 1);
    }
    if (bird.mere_id && currentGen < maxDepth) {
      node.mother = this.buildAscentTree(bird.mere_id, birds, maxDepth, currentGen + 1);
    }

    return node;
  }

  /**
   * Builds a descending pedigree tree for a given bird.
   */
  static buildDescentTree(
    birdId: number,
    birds: Canari[],
    maxDepth = 5,
    currentGen = 0
  ): DescendantNode | null {
    if (currentGen > maxDepth) return null;

    const bird = birds.find(b => b.id === birdId);
    if (!bird) return null;

    const node: DescendantNode = {
      id: bird.id,
      bague: bird.bague,
      nom: bird.nom || `Oiseau #${bird.id}`,
      sexe: bird.sexe,
      photo: bird.photo,
      generation: currentGen,
      children: [],
    };

    if (currentGen < maxDepth) {
      // Find all birds whose pere_id or mere_id is this bird's id
      const childrenBirds = birds.filter(
        b => b.pere_id === birdId || b.mere_id === birdId
      );

      for (const child of childrenBirds) {
        const childNode = this.buildDescentTree(child.id, birds, maxDepth, currentGen + 1);
        if (childNode) {
          node.children.push(childNode);
        }
      }
    }

    return node;
  }

  /**
   * Finds all siblings (frères et sœurs) and half-siblings (demi-frères et sœurs) of a bird.
   */
  static getSiblings(
    birdId: number,
    birds: Canari[]
  ): { siblings: Canari[]; halfSiblings: Canari[] } {
    const target = birds.find(b => b.id === birdId);
    if (!target) return { siblings: [], halfSiblings: [] };

    const resultSiblings: Canari[] = [];
    const resultHalfSiblings: Canari[] = [];

    // If both parents are null/undefined, we cannot verify siblings from pedigree
    if (!target.pere_id && !target.mere_id) {
      return { siblings: [], halfSiblings: [] };
    }

    for (const bird of birds) {
      if (bird.id === birdId) continue;

      const shareFather = target.pere_id && bird.pere_id === target.pere_id;
      const shareMother = target.mere_id && bird.mere_id === target.mere_id;

      if (shareFather && shareMother) {
        resultSiblings.push(bird);
      } else if (shareFather || shareMother) {
        resultHalfSiblings.push(bird);
      }
    }

    return {
      siblings: resultSiblings,
      halfSiblings: resultHalfSiblings,
    };
  }

  /**
   * Calculates the pedigree completeness index up to a certain generation depth.
   * Compares the number of known ancestors against the maximum possible (e.g. 2, 6, 14, 30 for depth 1, 2, 3, 4).
   * Returns a score between 0 and 100.
   */
  static calculatePedigreeCompleteness(
    birdId: number,
    birds: Canari[],
    maxDepth = 4
  ): number {
    const bird = birds.find(b => b.id === birdId);
    if (!bird) return 0;

    let knownCount = 0;
    let possibleCount = 0;

    // Helper function to count known ancestors
    const countAncestors = (id: number, currentDepth: number) => {
      if (currentDepth > maxDepth) return;

      const b = birds.find(x => x.id === id);
      possibleCount++;

      if (b) {
        knownCount++;
        if (b.pere_id) countAncestors(b.pere_id, currentDepth + 1);
        if (b.mere_id) countAncestors(b.mere_id, currentDepth + 1);
      }
    };

    if (bird.pere_id) countAncestors(bird.pere_id, 1);
    if (bird.mere_id) countAncestors(bird.mere_id, 1);

    // Sum of geometric progression for possible ancestors: 2^1 + 2^2 + ... + 2^maxDepth
    let totalPossible = 0;
    for (let d = 1; d <= maxDepth; d++) {
      totalPossible += Math.pow(2, d);
    }

    if (totalPossible === 0) return 0;
    return parseFloat(((knownCount / totalPossible) * 100).toFixed(2));
  }

  /**
   * Performs an analysis of the lineage (lignée) of a bird.
   */
  static getLineageAnalysis(
    birdId: number,
    birds: Canari[],
    lineageDepth = 5
  ): LineageAnalysisResult {
    const bird = birds.find(b => b.id === birdId);
    if (!bird) {
      return {
        birdId,
        birdName: "Inconnu",
        birdRing: "Inconnu",
        generationCount: 0,
        ancestorCount: 0,
        founderCount: 0,
        mainBranches: [],
        lostBranches: [],
        diversityIndex: 0,
        renewalIndex: 0,
        pedigreeCompleteness: 0,
        explanationCode: 'bird_not_found',
      };
    }

    const ancestors = new Set<number>();
    const founders = new Set<number>();
    const birdsMap = new Map<number, Canari>(birds.map(b => [b.id, b]));

    // Traversal to collect ancestors and detect founders (ancestors with no parents recorded)
    const traverse = (id: number, depth: number) => {
      if (depth > lineageDepth) return;
      const b = birdsMap.get(id);
      if (!b) return;

      ancestors.add(id);

      if (!b.pere_id && !b.mere_id) {
        founders.add(id);
      }

      if (b.pere_id) traverse(b.pere_id, depth + 1);
      if (b.mere_id) traverse(b.mere_id, depth + 1);
    };

    if (bird.pere_id) traverse(bird.pere_id, 1);
    if (bird.mere_id) traverse(bird.mere_id, 1);

    const totalAncestorsCount = ancestors.size;
    const founderCount = founders.size;

    // Detect branches
    const mainBranches: string[] = [];
    if (bird.pere_id) {
      const p = birdsMap.get(bird.pere_id);
      if (p) mainBranches.push(p.nom || p.bague);
    }
    if (bird.mere_id) {
      const m = birdsMap.get(bird.mere_id);
      if (m) mainBranches.push(m.nom || m.bague);
    }

    // Heuristic: Diversity index is based on the ratio of unique ancestors to total possible nodes, adjusted by F.
    const completeness = this.calculatePedigreeCompleteness(birdId, birds, lineageDepth);
    const individualF = WrightCoefficientEngine.getOrComputeIndividualF(birdId, birds, lineageDepth);
    const diversityIndex = Math.max(0, Math.min(100, parseFloat((completeness * (1 - individualF / 100)).toFixed(2))));

    // Renewal index: proportion of founders that represent non-consanguineous entries
    const renewalIndex = totalAncestorsCount > 0 
      ? parseFloat(((founderCount / totalAncestorsCount) * 100).toFixed(2)) 
      : 0;

    // Identify branches that have no other offspring (lost branches)
    const lostBranches: string[] = [];
    ancestors.forEach(ancId => {
      const anc = birdsMap.get(ancId);
      if (anc) {
        const offspring = birds.filter(x => x.pere_id === ancId || x.mere_id === ancId);
        // If offspring only exists within our target ancestry tree, it's a closed/narrow branch
        if (offspring.length <= 1) {
          lostBranches.push(anc.nom || anc.bague || `#${anc.id}`);
        }
      }
    });

    return {
      birdId,
      birdName: bird.nom || "Inconnu",
      birdRing: bird.bague,
      generationCount: lineageDepth,
      ancestorCount: totalAncestorsCount,
      founderCount,
      mainBranches,
      lostBranches: lostBranches.slice(0, 3), // Limit to top 3
      diversityIndex,
      renewalIndex,
      pedigreeCompleteness: completeness,
      explanationCode: completeness === 0 ? 'insufficient_pedigree' : 'recorded_pedigree_summary',
    };
  }

  /**
   * Simulates a breeding pair and evaluates genetic parameters, risks, advantages, and coefficients.
   */
  static simulatePairing(
    maleId: number,
    femaleId: number,
    birds: Canari[]
  ): PairSimulationResult {
    const male = birds.find(b => b.id === maleId);
    const female = birds.find(b => b.id === femaleId);

    if (!male || !female) {
      return {
        maleId,
        femaleId,
        wrightResult: {
          coefficient: null,
          level: 'unknown',
          commonAncestors: [],
          isCalculable: false,
          pedigreeCoverage: 0,
          explanationCode: 'missing_parents',
          pedigreeDepth: 0,
        },
        diversityLevel: 'unknown',
        risks: [{ code: 'genetics.message.selectionImpossible' }],
        advantages: [],
        summary: { code: 'genetics.message.pairNotFound' },
      };
    }

    const wrightResult = WrightCoefficientEngine.calculateInbreeding(maleId, femaleId, birds);
    const F = wrightResult.coefficient;

    let diversityLevel: PairSimulationResult['diversityLevel'] = 'unknown';
    if (F === 0 && wrightResult.isCalculable) {
      diversityLevel = 'excellent';
    } else if (F !== null && F < 2) {
      diversityLevel = 'good';
    } else if (F !== null && F < 6.25) {
      diversityLevel = 'medium';
    } else if (F !== null) {
      diversityLevel = 'poor';
    }

    const risks: PairSimulationResult['risks'] = [];
    const advantages: PairSimulationResult['advantages'] = [];

    const maleRawSpecies = male.espece || (male as any).speciesId;
    const femaleRawSpecies = female.espece || (female as any).speciesId;
    const maleSpNorm = CanonicalDataBridgeAdapter.normalizeSpeciesId(maleRawSpecies);
    const femaleSpNorm = CanonicalDataBridgeAdapter.normalizeSpeciesId(femaleRawSpecies);

    const speciesKnown = Boolean(
      maleRawSpecies &&
      femaleRawSpecies &&
      maleSpNorm !== 'UNKNOWN' &&
      maleSpNorm !== 'agapornis' &&
      femaleSpNorm !== 'UNKNOWN' &&
      femaleSpNorm !== 'agapornis' &&
      CanonicalDataBridgeAdapter.isRecognizedSpecies(maleSpNorm) &&
      CanonicalDataBridgeAdapter.isRecognizedSpecies(femaleSpNorm)
    );

    const sameSpecies = Boolean(speciesKnown && maleSpNorm === femaleSpNorm);

    if (!speciesKnown) {
      risks.push({ code: 'genetics.message.insufficientSpeciesData' });
    } else if (!sameSpecies) {
      risks.push({ code: 'genetics.message.differentSpecies' });
      risks.push({ code: 'genetics.message.hybridCrossUnsupported' });
    } else {
      advantages.push({ code: 'genetics.message.sameSpecies' });
    }

    // STRICT ISOLATION GAP-09 : Ne comparer les mutations parentales QUE si les deux oiseaux sont de la même espèce !
    if (sameSpecies && male.mutation && female.mutation) {
      if (male.mutation === female.mutation) {
        risks.push({
          code: 'genetics.message.sameMutationUnknownInheritance',
          variables: { mutation: male.mutation },
        });
      } else {
        advantages.push({
          code: 'genetics.message.differentDeclaredMutations',
          variables: { maleMutation: male.mutation, femaleMutation: female.mutation },
        });
      }
    }

    if (F === null) {
      risks.push({ code: 'genetics.message.insufficientPedigree' });
    } else if (F === 0) {
      advantages.push({ code: 'genetics.message.noCommonAncestorRecorded' });
    } else if (F < 6.25) {
      risks.push({ code: 'genetics.message.lowRecordedRelatedness', variables: { coefficient: F } });
    } else if (F < 12.5) {
      risks.push({ code: 'genetics.message.elevatedRecordedRelatedness', variables: { coefficient: F } });
    } else {
      risks.push({ code: 'genetics.message.highRecordedRelatedness', variables: { coefficient: F } });
    }

    let summary: GeneticsMessage;
    if (!speciesKnown) {
      summary = { code: 'genetics.message.speciesIndeterminate' };
    } else if (!sameSpecies) {
      summary = { code: 'genetics.message.hybridCrossUnsupported' };
    } else if (F === null) {
      summary = { code: 'genetics.message.summaryInsufficient', variables: { male: male.nom || male.bague, female: female.nom || female.bague } };
    } else if (F < 6.25) {
      summary = { code: 'genetics.message.summaryMeasured', variables: { coefficient: F, coverage: wrightResult.pedigreeCoverage } };
    } else {
      summary = { code: 'genetics.message.summaryReview', variables: { coefficient: F, coverage: wrightResult.pedigreeCoverage } };
    }

    const predictions = this.predictOffspringOutcomes(male, female);

    return {
      maleId,
      femaleId,
      wrightResult,
      diversityLevel,
      risks,
      advantages,
      summary,
      predictions,
    };
  }

  /**
   * Simulates inheritance for a given pair (alias for predictOffspringOutcomes with inter-species isolation).
   * GAP-09 specification method.
   */
  static simulatePairInheritance(
    male: Canari,
    female: Canari
  ): OffspringPrediction {
    return this.predictOffspringOutcomes(male, female);
  }

  /**
   * Predicts potential offspring outcomes (phenotypes and carrier genotypes) based on parental traits and mutations.
   * Enforces strict 6-tier epistemic validation & cross-species isolation (GAP-09).
   */
  static predictOffspringOutcomes(
    male: Canari,
    female: Canari
  ): OffspringPrediction {
    const phenotypes: OffspringPrediction['phenotypes'] = [];
    const carriers: OffspringPrediction['carriers'] = [];
    const summaryNotes: string[] = [];

    const maleRawSpecies = male?.espece || (male as any)?.speciesId;
    const femaleRawSpecies = female?.espece || (female as any)?.speciesId;

    // TIER 1 — Espèces présentes ?
    if (
      !maleRawSpecies ||
      typeof maleRawSpecies !== 'string' ||
      !maleRawSpecies.trim() ||
      !femaleRawSpecies ||
      typeof femaleRawSpecies !== 'string' ||
      !femaleRawSpecies.trim()
    ) {
      return {
        status: 'INSUFFICIENT_INFORMATION',
        reason: 'Espèce non renseignée pour au moins un des partenaires. Simulation génétique impossible sans identité taxonomique.',
        phenotypes,
        carriers,
        summaryNotes: [
          '[INSUFFICIENT_INFORMATION] Espèce non renseignée pour au moins un des partenaires. Simulation génétique impossible sans identité taxonomique.'
        ]
      };
    }

    const maleSpNorm = CanonicalDataBridgeAdapter.normalizeSpeciesId(maleRawSpecies);
    const femaleSpNorm = CanonicalDataBridgeAdapter.normalizeSpeciesId(femaleRawSpecies);

    // TIER 2 — Espèces canoniques et reconnues ?
    if (
      maleSpNorm === 'UNKNOWN' ||
      femaleSpNorm === 'UNKNOWN' ||
      !CanonicalDataBridgeAdapter.isRecognizedSpecies(maleSpNorm) ||
      !CanonicalDataBridgeAdapter.isRecognizedSpecies(femaleSpNorm)
    ) {
      return {
        status: 'INSUFFICIENT_INFORMATION',
        reason: 'Espèce indéterminée ou non reconnue dans le référentiel canonique. Simulation génétique impossible.',
        phenotypes,
        carriers,
        summaryNotes: [
          '[INSUFFICIENT_INFORMATION] Espèce indéterminée ou non reconnue dans le référentiel canonique. Simulation génétique impossible.'
        ]
      };
    }

    // Cas espèce générique ambiguë legacy (ex: 'agapornis' - Neutralisation stricte GAP-08)
    if (maleSpNorm === 'agapornis' || femaleSpNorm === 'agapornis') {
      return {
        status: 'INSUFFICIENT_INFORMATION',
        reason: 'Espèce générique agapornis ambiguë (LEGACY_SPECIES_AMBIGUITY). Préciser agapornis_roseicollis, agapornis_fischeri ou agapornis_personatus pour toute simulation génétique.',
        phenotypes,
        carriers,
        summaryNotes: [
          '[INSUFFICIENT_INFORMATION] Espèce générique agapornis ambiguë (LEGACY_SPECIES_AMBIGUITY). Préciser agapornis_roseicollis, agapornis_fischeri ou agapornis_personatus pour toute simulation génétique.'
        ]
      };
    }

    // Cas hors périmètre V1 (Test C : Passer domesticus)
    if (maleSpNorm === 'passer_domesticus' || femaleSpNorm === 'passer_domesticus') {
      return {
        status: 'OUT_OF_SCOPE',
        reason: 'Espèce hors périmètre d\'élevage standard V1 (Passer domesticus). Calculateur de transmission génétique désactivé.',
        phenotypes,
        carriers,
        summaryNotes: [
          '[OUT_OF_SCOPE] Espèce hors périmètre d\'élevage standard V1 (Passer domesticus). Calculateur de transmission génétique désactivé.'
        ]
      };
    }

    // TIER 3 — Espèces identiques ? (Barrière stricte d'hybridation GAP-09)
    if (maleSpNorm !== femaleSpNorm) {
      return {
        status: 'HYBRID_CROSS_UNSUPPORTED',
        reason: 'Croisement inter-espèces non pris en charge par le référentiel génétique actuel.',
        phenotypes,
        carriers,
        summaryNotes: [
          `[HYBRID_CROSS_UNSUPPORTED] Croisement inter-espèces (${maleSpNorm} × ${femaleSpNorm}) non pris en charge par le référentiel génétique actuel. Aucune prédiction ou probabilité d'hybridation non homologuée.`
        ]
      };
    }

    // TIER 4 — Catalogue génétique disponible pour cette espèce ?
    const speciesId = maleSpNorm;

    // Cas Agapornis fischeri : Catalogue non encore homologué (GAP-08)
    if (speciesId === 'agapornis_fischeri') {
      return {
        status: 'OUT_OF_SCOPE',
        reason: 'Catalogue génétique pour agapornis_fischeri non encore homologué (réservé à GAP-08 / HUMAN_REVIEW_REQUIRED). Aucun fallback sur Roseicollis.',
        phenotypes,
        carriers,
        summaryNotes: [
          '[OUT_OF_SCOPE] Catalogue génétique pour agapornis_fischeri non encore homologué (réservé à GAP-08 / HUMAN_REVIEW_REQUIRED). Aucun fallback sur Roseicollis. Calculateur désactivé.'
        ]
      };
    }

    const maleMutation = (male.mutation || '').trim();
    const femaleMutation = (female.mutation || '').trim();
    const maleColor = (male.couleur || '').trim();
    const femaleColor = (female.couleur || '').trim();

    const isClassic = (m: string) => !m || m.toLowerCase() === 'classique' || m.toLowerCase() === 'standard' || m.toLowerCase() === 'sauvage';
    const effectiveMaleMutation = isClassic(maleMutation) ? '' : maleMutation;
    const effectiveFemaleMutation = isClassic(femaleMutation) ? '' : femaleMutation;

    // Résolution canonique scopée par speciesId (AUDIT-31-02 & GAP-08)
    const maleRes = effectiveMaleMutation ? CanonicalDataBridgeAdapter.resolveMutation(speciesId, effectiveMaleMutation) : null;
    const femaleRes = effectiveFemaleMutation ? CanonicalDataBridgeAdapter.resolveMutation(speciesId, effectiveFemaleMutation) : null;

    // TIER 5 — Mutations reconnues ?
    // Cas OUT_OF_SCOPE spécifique (ex: mutation non répertoriée dans le catalogue minimal agapornis_personatus)
    if (maleRes?.status === 'OUT_OF_SCOPE' || femaleRes?.status === 'OUT_OF_SCOPE') {
      const outScopeReason = maleRes?.status === 'OUT_OF_SCOPE' ? maleRes.reason : femaleRes?.reason;
      return {
        status: 'OUT_OF_SCOPE',
        reason: outScopeReason || 'Mutation hors du catalogue homologué pour cette espèce.',
        phenotypes,
        carriers,
        summaryNotes: [
          `[OUT_OF_SCOPE] ${outScopeReason || 'Mutation hors catalogue homologué pour cette espèce. Calculateur désactivé.'}`
        ]
      };
    }

    // Protection épistémique : mutation non résolue = UNKNOWN (AUDIT-31-01, Test A & Test B)
    if (maleRes && !maleRes.resolved) {
      summaryNotes.push(`Mutation père "${effectiveMaleMutation}" non répertoriée ou sans hérédité confirmée pour l'espèce (${speciesId}). Statut : ${maleRes.status}. Aucun porteur ni transmission inventé.`);
    }
    if (femaleRes && !femaleRes.resolved) {
      summaryNotes.push(`Mutation mère "${effectiveFemaleMutation}" non répertoriée ou sans hérédité confirmée pour l'espèce (${speciesId}). Statut : ${femaleRes.status}. Aucun porteur ni transmission inventé.`);
    }

    const hasUnresolvedMutation = Boolean((maleRes && !maleRes.resolved) || (femaleRes && !femaleRes.resolved));

    let status: OffspringPredictionStatus = 'SUCCESS';
    if (hasUnresolvedMutation) {
      status = 'UNKNOWN';
    } else if (maleRes?.status === 'HUMAN_REVIEW_REQUIRED' || femaleRes?.status === 'HUMAN_REVIEW_REQUIRED') {
      summaryNotes.push('Accouplement impliquant une mutation sous statut HUMAN_REVIEW_REQUIRED (en attente d\'homologation bibliographique formelle).');
    }

    // TIER 6 — Application de la logique génétique intra-spécifique existante
    // 1. Color / Phenotype Predictions
    if (
      effectiveMaleMutation &&
      effectiveFemaleMutation &&
      maleRes?.resolved &&
      femaleRes?.resolved &&
      maleRes.mutationId === femaleRes.mutationId
    ) {
      // Both parents express identical verified visual mutation
      phenotypes.push({
        id: 'pheno-homo-mutation',
        name: `${effectiveMaleMutation} (100%)`,
        probability: 100,
        type: 'phenotype',
        sexCondition: 'both',
        description: `100% des jeunes (mâles et femelles) exprimeront visuellement la mutation ${effectiveMaleMutation}.`,
        badgeColor: 'indigo',
      });
      summaryNotes.push(`Fixation de la mutation ${effectiveMaleMutation} à 100% dans la descendance.`);
    } else if (maleRes?.resolved && maleRes.inheritance === 'SEX_LINKED_RECESSIVE' && (!femaleRes?.resolved || femaleRes.inheritance !== 'SEX_LINKED_RECESSIVE')) {
      // Sex-linked mutation in Sire (Father mutated, Mother standard/other)
      phenotypes.push({
        id: 'pheno-sl-daughters',
        name: `Femelles : ${effectiveMaleMutation}`,
        probability: 50,
        type: 'phenotype',
        sexCondition: 'female',
        description: `100% des femelles nées seront visuellement ${effectiveMaleMutation} (hérédité liée au sexe).`,
        badgeColor: 'pink',
      });
      phenotypes.push({
        id: 'pheno-sl-sons-classic',
        name: `Mâles : Phénotype ${femaleColor || 'Classique'}`,
        probability: 50,
        type: 'phenotype',
        sexCondition: 'male',
        description: `100% des mâles nés auront l'apparence classique/maternelle mais seront porteurs.`,
        badgeColor: 'blue',
      });
      carriers.push({
        id: 'carrier-sl-sons',
        name: `Mâles porteurs / / ${effectiveMaleMutation}`,
        probability: 50,
        type: 'carrier',
        sexCondition: 'male',
        description: `100% des mâles seront génotypiquement porteurs (split) de la mutation ${effectiveMaleMutation}.`,
        carrierDetails: `Porteur / ${effectiveMaleMutation}`,
        badgeColor: 'amber',
      });
      summaryNotes.push(`Accouplement autosexable : distinction visuelle immédiate du sexe des jeunes par la mutation ${effectiveMaleMutation}.`);
    } else if (femaleRes?.resolved && femaleRes.inheritance === 'SEX_LINKED_RECESSIVE' && (!maleRes?.resolved || maleRes.inheritance !== 'SEX_LINKED_RECESSIVE')) {
      // Sex-linked mutation in Dam (Mother mutated, Father standard/other)
      phenotypes.push({
        id: 'pheno-sl-dam-all',
        name: `Descendance de type ${maleColor || 'Classique'} (100%)`,
        probability: 100,
        type: 'phenotype',
        sexCondition: 'both',
        description: `Tous les jeunes seront visuellement du type du père.`,
        badgeColor: 'blue',
      });
      carriers.push({
        id: 'carrier-sl-dam-sons',
        name: `Mâles porteurs / / ${effectiveFemaleMutation}`,
        probability: 50,
        type: 'carrier',
        sexCondition: 'male',
        description: `100% des mâles seront porteurs (split) de la mutation maternelle ${effectiveFemaleMutation}.`,
        carrierDetails: `Porteur / ${effectiveFemaleMutation}`,
        badgeColor: 'amber',
      });
      summaryNotes.push(`Transmission de la mutation liée au sexe ${effectiveFemaleMutation} sous forme portée chez les fils uniquement.`);
    } else if ((maleRes?.resolved && maleRes.inheritance === 'AUTOSOMAL_DOMINANT') || (femaleRes?.resolved && femaleRes.inheritance === 'AUTOSOMAL_DOMINANT')) {
      const domMut = (maleRes?.resolved && maleRes.inheritance === 'AUTOSOMAL_DOMINANT') ? effectiveMaleMutation : effectiveFemaleMutation;
      phenotypes.push({
        id: 'pheno-dom-50',
        name: `${domMut} (50%)`,
        probability: 50,
        type: 'phenotype',
        sexCondition: 'both',
        description: `50% des jeunes hériteront de la mutation dominante ${domMut} en simple dilution.`,
        badgeColor: 'indigo',
      });
      phenotypes.push({
        id: 'pheno-dom-classic-50',
        name: `Classique non muté (50%)`,
        probability: 50,
        type: 'phenotype',
        sexCondition: 'both',
        description: `50% des jeunes seront de phénotype classique.`,
        badgeColor: 'slate',
      });
      summaryNotes.push(`Mutation dominante ${domMut} : répartition mendélienne 1/2 mutés et 1/2 classiques.`);
    } else if ((maleRes?.resolved && maleRes.inheritance === 'AUTOSOMAL_RECESSIVE') || (femaleRes?.resolved && femaleRes.inheritance === 'AUTOSOMAL_RECESSIVE')) {
      // Autosomal recessive mutation single parent (UNIQUEMENT SI CONFIRMÉE CANONIQUEMENT - ZERO FALLBACK INVENTÉ)
      const recMut = (maleRes?.resolved && maleRes.inheritance === 'AUTOSOMAL_RECESSIVE') ? effectiveMaleMutation : effectiveFemaleMutation;
      phenotypes.push({
        id: 'pheno-rec-all-classic',
        name: `Classique / Phénotype standard (100%)`,
        probability: 100,
        type: 'phenotype',
        sexCondition: 'both',
        description: `100% des jeunes auront un phénotype classique car la mutation ${recMut} est récessive.`,
        badgeColor: 'slate',
      });
      carriers.push({
        id: 'carrier-rec-all',
        name: `Tous les jeunes porteurs / / ${recMut} (100%)`,
        probability: 100,
        type: 'carrier',
        sexCondition: 'both',
        description: `100% de la nichée (mâles et femelles) sera hétérozygote porteuse de ${recMut}.`,
        carrierDetails: `Porteur / ${recMut}`,
        badgeColor: 'amber',
      });
      summaryNotes.push(`Génération F1 porteuse à 100% de la mutation récessive autosomique ${recMut}.`);
    } else if (hasUnresolvedMutation) {
      // Si une mutation non résolue est présente et qu'aucun mécanisme connu ne s'applique, ne pas inventer de phénotype
    } else if (maleColor && femaleColor) {
      if (maleColor.toLowerCase() === femaleColor.toLowerCase()) {
        phenotypes.push({
          id: 'pheno-color-homo',
          name: `${maleColor} Pur (100%)`,
          probability: 100,
          type: 'phenotype',
          sexCondition: 'both',
          description: `Descendance 100% homogène en couleur ${maleColor}.`,
          badgeColor: 'emerald',
        });
        summaryNotes.push(`Homogénéité de couleur (${maleColor}).`);
      } else {
        phenotypes.push({
          id: 'pheno-color-p1',
          name: `Type ${maleColor} (50%)`,
          probability: 50,
          type: 'phenotype',
          sexCondition: 'both',
          description: `50% des jeunes orientés vers la robe ${maleColor}.`,
          badgeColor: 'blue',
        });
        phenotypes.push({
          id: 'pheno-color-p2',
          name: `Type ${femaleColor} / Intermédiaire (50%)`,
          probability: 50,
          type: 'phenotype',
          sexCondition: 'both',
          description: `50% des jeunes orientés vers la robe ${femaleColor} ou panachée.`,
          badgeColor: 'pink',
        });
        summaryNotes.push(`Croisement de deux coloris : ${maleColor} × ${femaleColor}.`);
      }
    } else {
      phenotypes.push({
        id: 'pheno-standard-100',
        name: 'Phénotype Standard de la Race (100%)',
        probability: 100,
        type: 'phenotype',
        sexCondition: 'both',
        description: `Descendance conforme aux standards morphologiques parentaux.`,
        badgeColor: 'emerald',
      });
      summaryNotes.push('Données génétiques parentales standards sans mutations spécifiques renseignées.');
    }

    return {
      status,
      phenotypes: phenotypes.sort((a, b) => b.probability - a.probability),
      carriers: carriers.sort((a, b) => b.probability - a.probability),
      summaryNotes,
    };
  }
}


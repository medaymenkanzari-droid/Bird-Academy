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
} from '../types';
import { WrightCoefficientEngine } from './WrightCoefficientEngine';

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
        founderCount: 0,
        mainBranches: [],
        lostBranches: [],
        diversityIndex: 0,
        renewalIndex: 0,
        explanation: "Oiseau introuvable.",
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
      if (p) mainBranches.push(`Lignée Paternelle: ${p.nom || p.bague}`);
    }
    if (bird.mere_id) {
      const m = birdsMap.get(bird.mere_id);
      if (m) mainBranches.push(`Lignée Maternelle: ${m.nom || m.bague}`);
    }

    // Heuristic: Diversity index is based on the ratio of unique ancestors to total possible nodes, adjusted by F.
    const completeness = this.calculatePedigreeCompleteness(birdId, birds, lineageDepth);
    const individualF = WrightCoefficientEngine.getOrComputeIndividualF(birdId, birds, lineageDepth);
    const diversityIndex = Math.max(0, Math.min(100, parseFloat((completeness * (1 - individualF / 100)).toFixed(2))));

    // Renewal index: proportion of founders that represent non-consanguineous entries
    const renewalIndex = totalAncestorsCount > 0 
      ? parseFloat(((founderCount / totalAncestorsCount) * 100).toFixed(2)) 
      : 100;

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

    const explanation = `La lignée de ${bird.nom || bird.bague} s'étend sur ${lineageDepth} générations analysées avec ${totalAncestorsCount} ancêtres enregistrés. ` +
      `Le vivier de fondateurs d'origine comprend ${founderCount} oiseaux. Un indice de diversité de ${diversityIndex}% indique ` +
      `${diversityIndex > 75 ? "une excellente richesse génétique." : diversityIndex > 40 ? "une diversité modérée, vigilance requise." : "une consanguinité élevée ou un pedigree très incomplet."}`;

    return {
      birdId,
      birdName: bird.nom || "Inconnu",
      birdRing: bird.bague,
      generationCount: lineageDepth,
      founderCount,
      mainBranches,
      lostBranches: lostBranches.slice(0, 3), // Limit to top 3
      diversityIndex,
      renewalIndex,
      explanation,
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
          coefficient: 0,
          level: 'none',
          commonAncestors: [],
          explanation: "Simulation impossible : mâle ou femelle introuvable.",
          pedigreeDepth: 0,
        },
        diversityLevel: 'poor',
        risks: ["Sélection impossible"],
        advantages: [],
        summary: "Le mâle ou la femelle n'a pas pu être identifié dans la base de données.",
      };
    }

    const wrightResult = WrightCoefficientEngine.calculateInbreeding(maleId, femaleId, birds);
    const F = wrightResult.coefficient;

    // Determine diversity level based on coefficient of Wright
    let diversityLevel: 'excellent' | 'good' | 'medium' | 'poor' = 'excellent';
    if (F === 0) {
      diversityLevel = 'excellent';
    } else if (F < 2) {
      diversityLevel = 'good';
    } else if (F < 6.25) {
      diversityLevel = 'medium';
    } else {
      diversityLevel = 'poor';
    }

    const risks: string[] = [];
    const advantages: string[] = [];

    // Evaluate species compatibility
    const sameSpecies = male.espece === female.espece;
    if (!sameSpecies && male.espece && female.espece) {
      risks.push("Hybridation inter-espèces détectée (risque de stérilité des descendants, ex: Canari x Chardonneret).");
    } else {
      advantages.push("Pureté de la race préservée (accouplement au sein de la même espèce).");
    }

    // Evaluate mutations
    if (male.mutation && female.mutation) {
      if (male.mutation === female.mutation) {
        advantages.push(`Fixation de la mutation homozygote "${male.mutation}" chez les descendants.`);
        risks.push(`Risque d'intensification de tares récessives liées à la mutation commune "${male.mutation}".`);
      } else {
        advantages.push(`Potentiel d'introduction de porteurs sains de mutations croisées (${male.mutation} x ${female.mutation}).`);
      }
    }

    // Evaluate coefficient of Wright risks and benefits
    if (F === 0) {
      advantages.push("Vigueur hybride (hétérosis) maximale, aucun risque consanguin.");
    } else if (F < 6.25) {
      advantages.push("Consanguinité de travail légère permettant de stabiliser des caractères morphologiques ou de chant sans risque biologique excessif.");
      risks.push("Augmentation légère de l'homozygotie globale.");
    } else if (F < 12.5) {
      risks.push("Risque modéré de dépression consanguine (mortalité embryonnaire dans l'œuf accrue, système immunitaire plus faible).");
      advantages.push("Sélection en lignée serrée (line-breeding) utile uniquement pour les éleveurs de concours chevronnés voulant fixer un phénotype d'exception.");
    } else {
      risks.push("Consanguinité TRÈS ÉLEVÉE ! Risque majeur de malformations physiques (pattes écartées, bec dévié), baisse dramatique de la fertilité et mortalité des oisillons.");
      risks.push("Épuisement génétique à court terme de cette branche familiale.");
    }

    // Summarize pairing
    let summary = "";
    if (F === 0) {
      summary = `Cet accouplement entre ${male.nom || male.bague} et ${female.nom || female.bague} est idéal du point de vue de la diversité génétique (consanguinité nulle). Il est fortement recommandé pour renouveler le sang de l'élevage.`;
    } else if (F < 6.25) {
      summary = `Accouplement à consanguinité modérée (${F}%). Cette union est acceptable s'il s'agit de fixer un caractère esthétique exceptionnel, mais le prochain accouplement de la descendance devra impérativement se faire avec un sujet non apparenté.`;
    } else {
      summary = `⚠️ ACCUUPLEMENT FORTEMENT DÉCONSEILLÉ (Consanguinité de ${F}%). Le niveau de consanguinité dépasse les seuils de sécurité de l'élevage et présente des risques pathologiques immédiats pour les futurs poussins.`;
    }

    return {
      maleId,
      femaleId,
      wrightResult,
      diversityLevel,
      risks,
      advantages,
      summary,
    };
  }
}

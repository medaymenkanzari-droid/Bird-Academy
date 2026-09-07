/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../../../types';
import { WrightResult, CommonAncestor } from '../types';

export class WrightCoefficientEngine {
  /**
   * Calculates Wright's Inbreeding Coefficient (F) for an offspring of a proposed or existing pair.
   * F is expressed as a percentage between 0 and 100.
   */
  static calculateInbreeding(
    maleId: number | null | undefined,
    femaleId: number | null | undefined,
    birds: Canari[],
    maxDepth = 6,
    memo = new Map<number, number>()
  ): WrightResult {
    if (!maleId || !femaleId) {
      return {
        coefficient: 0,
        level: 'none',
        commonAncestors: [],
        explanation: "Inbreeding is 0% because one or both parents are unknown.",
        pedigreeDepth: 0,
      };
    }

    const birdsMap = new Map<number, Canari>(birds.map(b => [b.id, b]));

    // Find all paths from Male to ancestors
    const pathsM = this.findPathsToAncestors(maleId, birdsMap, maxDepth);
    // Find all paths from Female to ancestors
    const pathsF = this.findPathsToAncestors(femaleId, birdsMap, maxDepth);

    const commonAncestorsMap = new Map<number, CommonAncestor>();
    let totalF = 0;

    // Find common ancestors (exist in both paths lists)
    const commonIds = Array.from(pathsM.keys()).filter(id => pathsF.has(id));

    for (const ancId of commonIds) {
      const ancestor = birdsMap.get(ancId);
      if (!ancestor) continue;

      const pMList = pathsM.get(ancId) || [];
      const pFList = pathsF.get(ancId) || [];

      // Calculate the ancestor's own inbreeding coefficient (F_A)
      const ancestorF = this.getOrComputeIndividualF(ancId, birds, maxDepth, memo);

      let ancContribution = 0;
      const pathsDescriptions: string[] = [];

      for (const pM of pMList) {
        for (const pF of pFList) {
          // Verify that paths are independent (they only intersect at the common ancestor)
          // pM: [maleId, ..., ancId], pF: [femaleId, ..., ancId]
          const intersection = pM.filter(id => pF.includes(id));
          if (intersection.length === 1 && intersection[0] === ancId) {
            // Valid independent loop
            const n1 = pM.length - 1; // generations from Male to ancestor
            const n2 = pF.length - 1; // generations from Female to ancestor
            const exponent = n1 + n2 + 1;
            const loopContribution = Math.pow(0.5, exponent) * (1 + ancestorF / 100);
            ancContribution += loopContribution;

            // Generate a readable path trace
            // E.g. "Père -> Grand-père [Ancêtre] <- Grand-mère <- Mère"
            const malePathStr = pM
              .map(id => birdsMap.get(id)?.nom || birdsMap.get(id)?.bague || `#${id}`)
              .join(' → ');
            const femalePathStr = [...pF]
              .reverse()
              .map(id => birdsMap.get(id)?.nom || birdsMap.get(id)?.bague || `#${id}`)
              .join(' ← ');
            pathsDescriptions.push(`${malePathStr} ── (Ancêtre Commun) ── ${femalePathStr}`);
          }
        }
      }

      if (ancContribution > 0) {
        totalF += ancContribution;
        commonAncestorsMap.set(ancId, {
          id: ancId,
          nom: ancestor.nom || `Oiseau #${ancestor.id}`,
          bague: ancestor.bague || "Sans bague",
          contribution: parseFloat((ancContribution * 100).toFixed(4)),
          paths: pathsDescriptions,
        });
      }
    }

    const coefficientPct = parseFloat((totalF * 100).toFixed(4));
    let level: 'none' | 'low' | 'moderate' | 'high' | 'critical' = 'none';

    if (coefficientPct === 0) {
      level = 'none';
    } else if (coefficientPct < 1.5) {
      level = 'low';
    } else if (coefficientPct < 6.25) {
      level = 'moderate';
    } else if (coefficientPct < 12.5) {
      level = 'high';
    } else {
      level = 'critical';
    }

    // Pedigree depth is the max generations we could trace
    const maxDepthM = Array.from(pathsM.values()).reduce((max, paths) => Math.max(max, ...paths.map(p => p.length - 1)), 0);
    const maxDepthF = Array.from(pathsF.values()).reduce((max, paths) => Math.max(max, ...paths.map(p => p.length - 1)), 0);
    const pedigreeDepth = Math.max(maxDepthM, maxDepthF);

    const explanation = this.generateExplanation(coefficientPct, commonAncestorsMap.size, pedigreeDepth);

    return {
      coefficient: coefficientPct,
      level,
      commonAncestors: Array.from(commonAncestorsMap.values()),
      explanation,
      pedigreeDepth,
    };
  }

  /**
   * Helper to find all paths from a starting bird to its ancestors.
   * Returns a Map of AncestorId -> Array of paths, where each path is an array of Bird IDs.
   */
  private static findPathsToAncestors(
    startId: number,
    birdsMap: Map<number, Canari>,
    maxDepth = 6
  ): Map<number, number[][]> {
    const result = new Map<number, number[][]>();

    function dfs(currentId: number, currentPath: number[]) {
      if (currentPath.length > maxDepth) return;

      const bird = birdsMap.get(currentId);
      if (!bird) return;

      // Add this path if it's not the start node
      if (currentId !== startId) {
        if (!result.has(currentId)) {
          result.set(currentId, []);
        }
        result.get(currentId)!.push([...currentPath]);
      }

      // Recurse to father
      if (bird.pere_id && !currentPath.includes(bird.pere_id)) {
        dfs(bird.pere_id, [...currentPath, bird.pere_id]);
      }
      // Recurse to mother
      if (bird.mere_id && !currentPath.includes(bird.mere_id)) {
        dfs(bird.mere_id, [...currentPath, bird.mere_id]);
      }
    }

    dfs(startId, [startId]);
    return result;
  }

  /**
   * Gets or computes individual inbreeding coefficient (F) of a bird, memoizing the results.
   */
  static getOrComputeIndividualF(
    birdId: number,
    birds: Canari[],
    maxDepth = 6,
    memo = new Map<number, number>()
  ): number {
    if (memo.has(birdId)) {
      return memo.get(birdId)!;
    }

    // Set a guard to prevent infinite recursion in case of cycle loops
    memo.set(birdId, 0);

    const bird = birds.find(b => b.id === birdId);
    if (!bird || !bird.pere_id || !bird.mere_id) {
      return 0;
    }

    const res = this.calculateInbreeding(bird.pere_id, bird.mere_id, birds, maxDepth, memo);
    memo.set(birdId, res.coefficient);
    return res.coefficient;
  }

  private static generateExplanation(coefficient: number, ancestorCount: number, depth: number): string {
    if (coefficient === 0) {
      if (depth === 0) {
        return "Pas de consanguinité détectée car les parents sont inconnus ou non enregistrés.";
      }
      return `Aucun ancêtre commun trouvé sur une profondeur généalogique de ${depth} générations. Accouplement génétiquement sain.`;
    }

    let severity = "";
    if (coefficient < 1.5) {
      severity = "très faible, négligeable pour l'élevage.";
    } else if (coefficient < 6.25) {
      severity = "modérée. Peut être tolérée pour fixer des mutations spécifiques, mais nécessite une diversification au prochain accouplement.";
    } else if (coefficient < 12.5) {
      severity = "élevée. Risque significatif de dépression de consanguinité (baisse de fertilité, ponte faible, fragilité immunitaire). À surveiller de près.";
    } else {
      severity = "critique ! Accouplement fortement déconseillé en raison d'un risque extrême de tares génétiques, mortalité embryonnaire élevée et faiblesse générale.";
    }

    return `Coefficient de consanguinité de Wright de ${coefficient}% calculé sur ${depth} générations à partir de ${ancestorCount} ancêtre(s) commun(s). Cette consanguinité est ${severity}`;
  }
}

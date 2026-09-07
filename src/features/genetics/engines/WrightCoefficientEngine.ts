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
        coefficient: null,
        level: 'unknown',
        commonAncestors: [],
        isCalculable: false,
        pedigreeCoverage: 0,
        explanationCode: 'missing_parents',
        pedigreeDepth: 0,
      };
    }

    const birdsMap = new Map<number, Canari>(birds.map(b => [b.id, b]));
    const male = birdsMap.get(maleId);
    const female = birdsMap.get(femaleId);
    if (!male || !female) {
      return {
        coefficient: null,
        level: 'unknown',
        commonAncestors: [],
        isCalculable: false,
        pedigreeCoverage: 0,
        explanationCode: 'missing_parents',
        pedigreeDepth: 0,
      };
    }

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

    const pedigreeCoverage = this.calculatePairPedigreeCoverage(male, female, birdsMap, maxDepth);
    const isCalculable = pathsM.size > 0 && pathsF.size > 0;

    return {
      coefficient: isCalculable ? coefficientPct : null,
      level: isCalculable ? level : 'unknown',
      commonAncestors: Array.from(commonAncestorsMap.values()),
      isCalculable,
      pedigreeCoverage,
      explanationCode: !isCalculable
        ? 'insufficient_pedigree'
        : commonAncestorsMap.size === 0
          ? 'no_common_ancestor'
          : 'common_ancestors_found',
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
    const coefficient = res.coefficient ?? 0;
    memo.set(birdId, coefficient);
    return coefficient;
  }

  private static calculatePairPedigreeCoverage(
    male: Canari,
    female: Canari,
    birdsMap: Map<number, Canari>,
    maxDepth: number,
  ): number {
    const totalPossiblePerBird = Math.pow(2, maxDepth + 1) - 2;
    if (totalPossiblePerBird <= 0) return 0;

    const countKnown = (bird: Canari): number => {
      const visited = new Set<number>();
      const visit = (id: number | null | undefined, depth: number) => {
        if (!id || depth > maxDepth || visited.has(id)) return;
        const ancestor = birdsMap.get(id);
        if (!ancestor) return;
        visited.add(id);
        visit(ancestor.pere_id, depth + 1);
        visit(ancestor.mere_id, depth + 1);
      };
      visit(bird.pere_id, 1);
      visit(bird.mere_id, 1);
      return visited.size;
    };

    const known = countKnown(male) + countKnown(female);
    return Number(((known / (totalPossiblePerBird * 2)) * 100).toFixed(2));
  }
}

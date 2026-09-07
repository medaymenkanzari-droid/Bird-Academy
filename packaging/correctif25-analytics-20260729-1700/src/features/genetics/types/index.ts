/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GenealogyNode {
  id: number;
  bague: string;
  nom: string;
  sexe: 'Mâle' | 'Femelle' | 'Indéterminé';
  photo?: string;
  father?: GenealogyNode | null;
  mother?: GenealogyNode | null;
  generation: number;
}

export interface DescendantNode {
  id: number;
  bague: string;
  nom: string;
  sexe: 'Mâle' | 'Femelle' | 'Indéterminé';
  photo?: string;
  generation: number;
  children: DescendantNode[];
}

export interface CommonAncestor {
  id: number;
  nom: string;
  bague: string;
  contribution: number; // contribution to the Wright coefficient (e.g. 0.125)
  paths: string[];      // human-readable list of paths, e.g., ["Mâle -> Père -> Ancêtre <- Mère"]
}

export interface WrightResult {
  coefficient: number; // 0 to 100 (%)
  level: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  commonAncestors: CommonAncestor[];
  explanation: string;
  pedigreeDepth: number;
}

export interface PairSimulationResult {
  maleId: number;
  femaleId: number;
  wrightResult: WrightResult;
  diversityLevel: 'excellent' | 'good' | 'medium' | 'poor';
  risks: string[];
  advantages: string[];
  summary: string;
}

export interface LineageAnalysisResult {
  birdId: number;
  birdName: string;
  birdRing: string;
  generationCount: number;
  founderCount: number;
  mainBranches: string[];
  lostBranches: string[];
  diversityIndex: number; // 0 to 100
  renewalIndex: number;   // 0 to 100
  explanation: string;
}

export interface GeneticsParameters {
  minimumGenerations: number;              // default 3
  maximumRecommendedCoefficient: number;    // default 6.25 (%)
  criticalCoefficient: number;              // default 12.5 (%)
  minimumFounderCount: number;              // default 4
  lineageDepth: number;                     // default 5
}

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
  coefficient: number | null; // 0 to 100 (%), null when the recorded pedigree is insufficient
  level: 'unknown' | 'none' | 'low' | 'moderate' | 'high' | 'critical';
  commonAncestors: CommonAncestor[];
  isCalculable: boolean;
  pedigreeCoverage: number; // 0 to 100 (%) across both proposed parents
  explanationCode: 'missing_parents' | 'insufficient_pedigree' | 'no_common_ancestor' | 'common_ancestors_found';
  pedigreeDepth: number;
}

export interface GeneticsMessage {
  code: string;
  variables?: Record<string, string | number>;
}

export interface OffspringOutcome {
  id: string;
  name: string;
  probability: number; // 0 to 100 (%)
  type: 'phenotype' | 'carrier' | 'genotype';
  sexCondition?: 'male' | 'female' | 'both';
  description?: string;
  carrierDetails?: string;
  badgeColor?: string;
}

export interface OffspringPrediction {
  phenotypes: OffspringOutcome[];
  carriers: OffspringOutcome[];
  summaryNotes: string[];
}

export interface PairSimulationResult {
  maleId: number;
  femaleId: number;
  wrightResult: WrightResult;
  diversityLevel: 'unknown' | 'excellent' | 'good' | 'medium' | 'poor';
  risks: GeneticsMessage[];
  advantages: GeneticsMessage[];
  summary: GeneticsMessage;
  predictions?: OffspringPrediction;
}

export interface LineageAnalysisResult {
  birdId: number;
  birdName: string;
  birdRing: string;
  generationCount: number;
  ancestorCount: number;
  founderCount: number;
  mainBranches: string[];
  lostBranches: string[];
  diversityIndex: number; // 0 to 100
  renewalIndex: number;   // 0 to 100
  pedigreeCompleteness: number;
  explanationCode: 'bird_not_found' | 'insufficient_pedigree' | 'recorded_pedigree_summary';
}

export interface GeneticsParameters {
  minimumGenerations: number;              // default 3
  maximumRecommendedCoefficient: number;    // default 6.25 (%)
  criticalCoefficient: number;              // default 12.5 (%)
  minimumFounderCount: number;              // default 4
  lineageDepth: number;                     // default 5
}

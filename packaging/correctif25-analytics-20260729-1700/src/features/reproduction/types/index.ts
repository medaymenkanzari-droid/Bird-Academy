/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PairStatus = 'active' | 'separated' | 'inactive' | 'archived';

export interface PairStatistics {
  pairId: string;
  reproductionsCount: number; // Number of cycles (reproduction sessions)
  totalEggs: number;
  fertileEggs: number;
  hatchedEggs: number;
  weanedChicks: number;
  successRate: number; // (weanedChicks / totalEggs) * 100 or similar
}

export interface BreedingPair {
  id: string;
  maleId: number; // Canari.id is number
  femaleId: number; // Canari.id is number
  name?: string; // Optional custom name
  dateCreated: string; // YYYY-MM-DD
  dateSeparated?: string; // YYYY-MM-DD
  status: PairStatus;
  seasonId?: string; // Link to a breeding season
  archived?: boolean;
  notes?: string;
  statistics: PairStatistics;
}

export type PairHistoryType = 'creation' | 'modification' | 'separation' | 'reactivation' | 'archived' | 'restored';

export interface PairHistory {
  id: string;
  pairId: string;
  timestamp: string; // ISO String
  type: PairHistoryType;
  description: string;
  operator?: string;
  details?: Record<string, any>;
}

export type ValidationSeverity = 'info' | 'warning' | 'risk' | 'recommendation';

export interface ScientificValidation {
  type: ValidationSeverity;
  rule: string;
  passed: boolean;
  message: string;
}

export interface CompatibilityResult {
  score: number; // 1 to 5 stars
  validations: ScientificValidation[];
  recommendations: string[];
}

export interface BreedingSeason {
  id: string;
  name: string; // e.g. "Saison 2026"
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: 'active' | 'closed';
  notes?: string;
}

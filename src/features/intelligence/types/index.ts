/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Canari, HabitatCage, Sante } from '../../../types';
import type { BreedingPair } from '../../reproduction/types';

export interface IntelligenceScore {
  score: number; // 0 to 100
  label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical';
  summary: string;
  explanation: string;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface IntelligenceClutch {
  id: string;
  pairId: string;
  startDate: string;
  status: 'active' | 'completed' | 'abandoned';
  eggCount: number;
  fertilizedCount: number | null;
  hatchedCount: number | null;
  weanedCount: number | null;
}

export interface IntelligenceRuleData {
  birds: Canari[];
  pairs: BreedingPair[];
  clutches: IntelligenceClutch[];
  cages: HabitatCage[];
  healthRecords: Sante[];
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  condition: (data: IntelligenceRuleData) => boolean;
  explanation: string;
  recommendation: string;
  category: 'reproduction' | 'health' | 'habitat' | 'finance' | 'data_quality' | 'genetics';
}

export interface RuleResult {
  ruleId: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  triggered: boolean;
  explanation: string;
  recommendation: string;
  category: 'reproduction' | 'health' | 'habitat' | 'finance' | 'data_quality' | 'genetics';
}

export interface DataQualityIssue {
  id: string;
  birdId?: number;
  birdName?: string;
  birdRing?: string;
  type: 'missing_field' | 'missing_photo' | 'missing_ring' | 'unknown_parents' | 'inconsistent_dates' | 'contradiction';
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface DataQualityResult {
  score: number;
  issues: DataQualityIssue[];
  checkedCount: number;
}

export interface TopPerformer {
  birdId?: number;
  pairId?: string;
  name: string;
  type: 'bird' | 'pair' | 'foster';
  score: number;
  reason: string;
}

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  reproductionRate: number | null; // known hatch percentage, null when unavailable
  salesAmount: number;
  expensesAmount: number;
}

export interface IntelligenceBirdFinding {
  key: string;
  variables?: Record<string, string | number>;
}

export interface BirdIntelligenceFiche {
  score: number;
  ageMonths: number | null;
  breedingCount: number;
  offspringCount: number;
  healthRecordCount: number;
  dataCompleteness: number;
  reliability: 'high' | 'medium' | 'low';
  strengths: IntelligenceBirdFinding[];
  weaknesses: IntelligenceBirdFinding[];
  recommendations: IntelligenceBirdFinding[];
}

export interface IntelligenceReport {
  id: string;
  title: string;
  date: string;
  type: 'monthly' | 'annual' | 'reproduction' | 'finance' | 'global';
  sections: {
    title: string;
    content: string;
    metrics?: { label: string; value: string | number }[];
  }[];
}

// =========================================================================
// MISSION V1.9.2 — BIRD INTELLIGENCE : ASSISTANCE À LA DÉCISION (DSS)
// =========================================================================

/**
 * Niveaux d'assistance obligatoires (Section 5)
 */
export type AssistanceLevel =
  | 'INFORMATION'     // "Voici ce que les données indiquent."
  | 'INTERPRETATION'  // "Voici comment comprendre ce résultat."
  | 'VIGILANCE'       // "Cette information mérite une vérification."
  | 'MISSING_DATA'    // "Il manque telle information pour aller plus loin."
  | 'USER_ACTION';    // "Vous pouvez vérifier / compléter / consulter telle donnée."

/**
 * États épistémiques stricts (Section 4)
 */
export type EpistemicStatus =
  | 'UNKNOWN'
  | 'NOT_TESTED'
  | 'OBSERVED'
  | 'DECLARED'
  | 'INFERRED'
  | 'GENETICALLY_CONFIRMED'
  | 'PROVISIONAL'
  | 'BLOCKED'
  | 'POSSIBLE_SET'
  | 'CONFIRMED'
  | 'NEEDS_HUMAN_REVIEW'
  | 'CONFLICTING'
  | 'INSUFFICIENT_INFORMATION';

/**
 * Traçabilité de la source de vérité (Section 3)
 */
export interface DecisionSupportSource {
  domain: 'genetics' | 'cross' | 'canonical' | 'genealogy' | 'reproduction' | 'health' | 'habitat' | 'data_quality';
  engineOrTable: string;
  evidenceIds?: string[];
  referenceKey?: string;
}

/**
 * Structure normalisée d'assistance à la décision (Section 6)
 */
export interface DecisionSupportItem {
  id: string;
  title: string;
  level: AssistanceLevel;
  source: DecisionSupportSource;
  epistemicStatus?: EpistemicStatus;
  situation: string;           // SITUATION : ce qui est actuellement connu
  result: string;              // RÉSULTAT : résultat officiel déjà calculé
  meaning: string;             // CE QUE CELA SIGNIFIE : explication simple
  vigilancePoints: string[];   // POINTS DE VIGILANCE : limites / incertitudes
  missingData: string[];       // INFORMATIONS MANQUANTES : données nécessaires
  nextVerification: string;    // PROCHAINE VÉRIFICATION POSSIBLE : action utilisateur non destructive
}

/**
 * Détection et qualification de donnée manquante (Section 11)
 */
export interface MissingDataItem {
  id: string;
  entityType: 'bird' | 'pair' | 'clutch' | 'cage' | 'locus';
  entityId: string | number;
  entityLabel: string;
  missingField: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestedAction: string;
}

/**
 * Synthèse globale d'aide à la décision
 */
export interface DecisionSupportSummary {
  flockScore: number;
  items: DecisionSupportItem[];
  missingDataItems: MissingDataItem[];
  totalAlerts: number;
  generatedAt: string;
}


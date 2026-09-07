/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IntelligenceScore {
  score: number; // 0 to 100
  label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical';
  summary: string;
  explanation: string;
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  condition: (data: any) => boolean;
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
  reproductionRate: number; // success percentage
  salesAmount: number;
  expensesAmount: number;
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

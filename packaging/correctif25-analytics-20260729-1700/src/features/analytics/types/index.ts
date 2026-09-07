/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnalyticsPeriod = 'all' | 'year' | 'quarter' | 'month' | 'custom';

export interface AnalyticsFilters {
  species?: string;
  breed?: string;
  mutation?: string;
  installation?: string;
  zone?: string;
  aviary?: string;
  cage?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  sex?: 'Mâle' | 'Femelle' | 'Indéterminé';
  status?: string;
  origin?: 'internal' | 'external' | 'all';
}

export interface AnalyticsSettings {
  defaultPeriod: AnalyticsPeriod;
  currency: string;
  numberFormat: 'fr' | 'en';
  dateFormat: string;
  fertilityTarget: number; // e.g. 85 %
  hatchingTarget: number;  // e.g. 80 %
  weaningTarget: number;   // e.g. 75 %
  revenueTarget: number;   // e.g. 2000 €
  survivalTarget: number;  // e.g. 90 %
}

export interface KPIDefinition {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number; // percentage change vs previous
  category: 'population' | 'reproduction' | 'habitat' | 'finance' | 'health' | 'genetics' | 'data_quality';
  description: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export interface AnalyticsSnapshot {
  id: string;
  timestamp: string; // YYYY-MM-DDTHH:mm:ssZ
  label: string;
  kpis: Record<string, number | string>;
  scores: {
    reproduction: number;
    habitat: number;
    finance: number;
    health: number;
    genetics: number;
    dataQuality: number;
  };
}

export interface ChartDataPoint {
  name: string; // label (month, category, breed, etc.)
  value: number;
  value2?: number; // for comparative charts
  color?: string;
  [key: string]: any;
}

export interface ExecutiveSummary {
  period: string;
  totalBirds: number;
  activePairs: number;
  globalFertility: number;
  netCashFlow: number;
  healthMortalityRate: number;
  geneticInbreedingAvg: number;
  dataQualityScore: number;
  recommendations: string[];
  alertsCount: number;
}

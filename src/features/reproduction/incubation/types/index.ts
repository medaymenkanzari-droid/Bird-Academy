/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IncubationMode = 'Naturelle' | 'Assistée' | 'Artificielle';

export interface Incubation {
  id: string;
  clutchId: string; // Reference to Clutch.id
  startDate: string; // YYYY-MM-DD
  theoreticalDuration: number; // in days, default 13 or 14
  realDuration?: number; // actual days if completed
  mode: IncubationMode;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

export type IncubationEventType =
  | 'start'
  | 'candling' // Mirage
  | 'control'
  | 'hatch_expected'
  | 'hatch_actual'
  | 'abandon'
  | 'failure'
  | 'manual_note';

export interface IncubationEvent {
  id: string;
  incubationId: string;
  timestamp: string; // ISO string
  type: IncubationEventType;
  title: string;
  description: string;
  operator?: string;
  notes?: string;
}

export interface IncubationBiologicalCalendar {
  startDate: string; // YYYY-MM-DD
  candlingDate: string; // Mirage date: YYYY-MM-DD
  controlDate: string; // Control date: YYYY-MM-DD
  expectedHatchDate: string; // expected hatch date: YYYY-MM-DD
  endIncubationDate: string; // end incubation date: YYYY-MM-DD
  daysRemaining: number;
  delayDays: number; // difference in days if overdue
  progressPercent: number; // percentage of duration completed
}

export interface IncubationStatistics {
  incubationId: string;
  clutchId: string;
  totalEggsIncubating: number;
  expectedHatchCount: number;
  hatchedCount: number;
  failedCount: number;
  progressPercent: number;
}

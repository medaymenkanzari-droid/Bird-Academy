/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GrowthRecord {
  id: string; // UUID permanent
  chickId: string;
  date: string; // YYYY-MM-DD
  weight: number; // in grams
  eyesOpened: boolean;
  feathersOut: boolean;
  leftNest: boolean;
  autonomousFeeding: boolean;
  developmentStatus: 'normal' | 'slow' | 'abnormal';
  observations: string;
  createdAt: string;
}

export interface WeightRecord {
  id: string; // UUID permanent
  chickId: string;
  date: string; // YYYY-MM-DD
  weight: number; // in grams
  notes?: string;
}

export interface FeedingRecord {
  id: string; // UUID permanent
  chickId: string;
  date: string; // YYYY-MM-DD
  type: 'parents' | 'eam' | 'mixte'; // EAM is Hand feeding
  formula?: string; // Type of paste
  frequency?: number; // feeds per day
  quantity?: string; // e.g. "2ml"
  notes?: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClutchStatus = 'active' | 'completed' | 'abandoned';

export interface Clutch {
  id: string;
  pairId: string; // ID of the breeding pair (BreedingPair.id)
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  observations: string;
  status: ClutchStatus;
  
  // Stat counters (automatically calculated)
  eggCount: number;
  fertilizedCount: number;
  clearCount: number;
  hatchedCount: number;
  lostCount: number;
  
  // Metadata & timeline
  createdAt: string;
  updatedAt: string;
}

export interface ClutchStatistics {
  clutchId: string;
  fertilityRate: number; // percentage
  hatchRate: number; // percentage of fertile eggs
  failureRate: number; // percentage of total eggs lost/dead
  totalEggs: number;
  fertileEggs: number;
  clearEggs: number;
  hatchedEggs: number;
  lostEggs: number;
}

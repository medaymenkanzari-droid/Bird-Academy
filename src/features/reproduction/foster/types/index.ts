/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO
  type: string;
  description: string;
  operator?: string;
  notes?: string;
}

export interface FosterParents {
  id: string; // UUID
  pairId: string; // BreedingPair.id
  status: 'available' | 'active' | 'resting';
  capacity: number; // Nest capacity
  currentFosterCount: number;
  notes?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TransferRecord {
  id: string; // UUID
  chickId: string; // Chick.id
  sourceClutchId: string;
  sourcePairId: string;
  destinationPairId: string; // Foster parents BreedingPair.id
  transferDate: string; // YYYY-MM-DD
  reason: string;
  status: 'active' | 'returned' | 'completed';
  returnDate?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

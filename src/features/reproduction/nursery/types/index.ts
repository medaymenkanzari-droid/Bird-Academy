/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineEvent } from '../../foster/types';

export interface NurseryRecord {
  id: string; // UUID
  chickId: string; // Chick.id
  status: 'active' | 'graduated' | 'deceased';
  entryDate: string; // YYYY-MM-DD
  exitDate?: string; // YYYY-MM-DD
  mode: 'biological_parents' | 'foster_parents' | 'hand_feeding' | 'mixed';
  fosterPairId?: string; // BreedingPair.id if foster_parents or mixed
  currentProtocolId?: string; // FeedingProtocol.id if hand_feeding or mixed
  notes?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface NurseryStatistics {
  biologicalCount: number;
  adoptedCount: number;
  handFedCount: number;
  overloadedNestsCount: number;
  activeFosterParentsCount: number;
  alertsCount: number;
  todaySessionsCount: number;
  averageGrowthRate: number; // g/day
  survivalRate: number; // %
  averageWeaningAge: number; // days
  averageNestLoad: number; // chicks per active nest
  protocolPerformance: Record<string, number>; // protocolId -> success rate %
}

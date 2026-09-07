/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineEvent } from '../../foster/types';

export interface FeedingSchedule {
  id: string; // UUID
  minAgeDays: number;
  maxAgeDays: number;
  frequencyPerDay: number; // e.g. 6 times per day
  suggestedVolumeMl: number; // ml
  suggestedTempC: number; // mash temp in °C
  formulaType?: string;
  notes?: string;
}

export interface FeedingProtocol {
  id: string; // UUID
  species: string; // e.g. "Canari" or "Perruche"
  name: string; // e.g. "Canary Standard"
  isActive: boolean;
  schedules: FeedingSchedule[];
  remarks?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

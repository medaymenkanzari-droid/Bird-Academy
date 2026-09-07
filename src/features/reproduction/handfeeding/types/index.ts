/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineEvent } from '../../foster/types';

export interface Formula {
  id: string; // UUID
  name: string; // e.g. "A21 NutriBird", "Kaytee Exact"
  brand: string;
  dilutionRatio: string; // water-to-powder ratio e.g. "3:1"
  targetTemperature: number; // e.g. 39.5 degrees C
  notes?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type CropStatus = 'empty' | 'medium' | 'full' | 'stagnant' | 'acidic';

export interface CropInspection {
  id: string; // UUID
  chickId: string;
  timestamp: string;
  statusBefore: CropStatus;
  statusAfter: CropStatus;
  fluidity: 'normal' | 'thick' | 'watery';
  notes?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface HandFeedingSession {
  id: string; // UUID
  chickId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  formulaId: string; // Formula ID
  volumeMl: number; // volume distributed in ml
  temperatureC: number; // temperature of mash in °C
  cropBefore: CropStatus;
  cropAfter: CropStatus;
  observations: string;
  operator?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

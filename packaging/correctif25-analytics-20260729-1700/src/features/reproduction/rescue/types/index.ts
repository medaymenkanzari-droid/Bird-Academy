/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TimelineEvent } from '../../foster/types';

export interface RescueCase {
  id: string; // UUID
  chickId: string; // Chick.id
  admissionDate: string; // YYYY-MM-DD
  admissionWeight: number; // grams
  reason: 'abandon' | 'injury' | 'orphaned' | 'illness' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'recovered' | 'deceased' | 'transferred';
  temperatureMaintained: boolean;
  humidityLevel: number; // percentage
  treatmentNotes?: string;
  resolvedDate?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

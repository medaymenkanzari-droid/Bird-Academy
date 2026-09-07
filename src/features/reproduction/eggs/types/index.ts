/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EggStatus =
  | 'Pondu'
  | 'En incubation'
  | 'Miré'
  | 'Fécondé'
  | 'Clair'
  | 'Arrêt de développement'
  | 'Cassé'
  | 'Mort'
  | 'Éclos'
  | 'Retiré';

export interface EggTimelineEvent {
  id: string;
  eggId: string;
  timestamp: string; // ISO string
  type: 'laying' | 'inspection' | 'status_change' | 'incubation_start' | 'hatch' | 'removal' | 'other';
  statusBefore?: EggStatus;
  statusAfter?: EggStatus;
  description: string;
  notes?: string;
  operator?: string;
}

export interface Egg {
  id: string;
  clutchId: string; // reference to Clutch.id
  number: number; // e.g. Egg #1, Egg #2, etc.
  layingDate: string; // YYYY-MM-DD
  position: string; // e.g., "Nid 1", "Nid 2" or position index
  weight?: number; // optional weight in grams
  status: EggStatus;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

export interface EggInspection {
  id: string;
  eggId: string;
  inspectionDate: string; // YYYY-MM-DD
  observedWeight?: number;
  candlingResult?: 'fertile' | 'clear' | 'uncertain';
  airCellSize?: string; // small, normal, large
  statusAfter: EggStatus;
  notes?: string;
  inspector?: string;
}

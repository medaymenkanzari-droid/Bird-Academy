/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ChickStatus =
  | 'hatching'      // En éclosion
  | 'growth'        // En croissance
  | 'weaning'       // En sevrage
  | 'weaned'        // Sevré (prêt à devenir oiseau)
  | 'deceased'      // Décédé
  | 'independent';  // Oiseau indépendant créé

export interface Chick {
  id: string; // UUID permanent
  eggId: string; // reference to Egg.id
  clutchId: string; // reference to Clutch.id
  pairId: string; // reference to BreedingPair.id
  name: string; // temporary modifiable name
  provisionalNumber: string; // provisional ring/number
  hatchDate: string; // YYYY-MM-DD
  birthWeight: number; // in grams
  status: ChickStatus;
  gender: 'Indéterminé' | 'Mâle' | 'Femelle';
  observations: string;
  incubatorPairId?: string; // Optional parent incubator couple ID
  fosterPairId?: string; // Optional parent foster couple ID
  parentHistory?: {
    timestamp: string;
    type: 'biological' | 'incubator' | 'foster';
    pairId: string;
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface GrowthStatistics {
  chickId: string;
  ageDays: number;
  growthRate: number; // average gain in grams/day
  weightTrend: 'up' | 'flat' | 'down';
  expectedWeightForAge: number;
  deviationPercent: number; // percentage difference from ideal curve
}

export interface LifeCycleEvent {
  id: string;
  chickId: string;
  timestamp: string; // ISO String
  type: 
    | 'hatch' 
    | 'weight' 
    | 'growth' 
    | 'feeding' 
    | 'nest_exit' 
    | 'weaning_start' 
    | 'weaning_complete' 
    | 'bird_creation' 
    | 'death';
  description: string;
  notes?: string;
  operator?: string;
}

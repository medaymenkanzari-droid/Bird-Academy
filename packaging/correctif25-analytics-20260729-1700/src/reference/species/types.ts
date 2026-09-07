/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../../utils/translations';

export interface MultilingualText {
  fr: string;
  en: string;
  ar: string;
  es: string;
  it: string;
}

export interface MultilingualList {
  fr: string[];
  en: string[];
  ar: string[];
  es: string[];
  it: string[];
}

export interface SpeciesIdentity {
  id: string; // unique stable identifier (e.g. 'canari', 'chardonneret_elegant')
  code: string; // short unique code
  scientificName: string;
  names: MultilingualText;
  family: string;
  genus: string;
  origin: MultilingualText;
  status: 'domestique' | 'sauvage' | 'hybride';
}

export interface SpeciesBiology {
  lifespan: number; // in years
  averageLength: number; // in cm
  minWeight: number; // in grams
  maxWeight: number; // in grams
  sexualDimorphism: MultilingualText;
  sexualMaturity: MultilingualText;
  minAgeReproduction: number; // in months
  recommendedAgeReproduction: number; // in months
  maxAgeReproduction: number; // in months
}

export interface SpeciesReproduction {
  breedingSeason: MultilingualText;
  incubationPeriod: number; // in days
  avgEggsPerClutch: number;
  maxEggsPerClutch: number;
  avgClutchesPerYear: number;
  feedingPeriod: number; // in days
  bandingAge: number; // in days
  weaningAge: number; // in days
}

export interface SpeciesBreeding {
  bandSize: string; // in mm
  minIdealTemp: number; // in °C
  maxIdealTemp: number; // in °C
  minHumidity: number; // in %
  maxHumidity: number; // in %
  minCageSize: MultilingualText;
  nestType: MultilingualText;
  difficultyLevel: 'facile' | 'moyen' | 'difficile' | 'expert';
}

export interface SpeciesNutrition {
  mainDiet: MultilingualText;
  recommendedSupplements: MultilingualText;
  vitaminFrequency: MultilingualText;
  specificNeeds: MultilingualText;
}

export interface SpeciesHealth {
  frequentDiseases: MultilingualList;
  frequentParasites: MultilingualList;
  sensitiveToCold: boolean;
  sensitiveToHeat: boolean;
  preventionRecommendations: MultilingualText;
}

export interface SpeciesManagement {
  hybridizationPossible: boolean;
  compatibleSpecies: string[]; // list of species IDs
  regulatoryStatus: MultilingualText;
  breedingTips: MultilingualText;
}

export interface BiologicalSpeciesProfile {
  identity: SpeciesIdentity;
  biology: SpeciesBiology;
  reproduction: SpeciesReproduction;
  breeding: SpeciesBreeding;
  nutrition: SpeciesNutrition;
  health: SpeciesHealth;
  management: SpeciesManagement;
}

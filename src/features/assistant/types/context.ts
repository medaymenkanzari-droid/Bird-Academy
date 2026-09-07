/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalSpeciesProfile } from '../../../reference/species/types';
import { IntelligenceScore, RuleResult, DataQualityResult, TopPerformer, BirdIntelligenceFiche, IntelligenceReport } from '../../intelligence/types';
import { Language } from '../../../utils/translations';
import { AssistantCapability, AssistantTier } from './permissions';
import { KnowledgeSource } from './knowledge';

export interface BiologicalContext {
  speciesId: string;
  scientificName: string;
  commonName: string;
  incubationPeriodDays: number;
  bandingAgeDays: number;
  weaningAgeDays: number;
  avgEggsPerClutch: number;
  maxEggsPerClutch: number;
  avgClutchesPerYear: number;
  idealTempRange: { min: number; max: number };
  idealHumidityRange: { min: number; max: number };
  bandSize: string;
  validationStatus: 'verified' | 'unverified';
  profile?: BiologicalSpeciesProfile;
}

export interface BirdContext {
  id: number;
  nom: string;
  bague: string;
  sexe: 'Mâle' | 'Femelle' | 'Indéterminé';
  espece?: string;
  race?: string;
  couleur?: string;
  dateNaissance?: string;
  ageMonths?: number;
  statutSante?: string;
  cageId?: string | number | null;
  cageNom?: string;
  pereId?: number | null;
  mereId?: number | null;
  archived?: boolean;
}

export interface BreedingPairContext {
  id: string | number;
  maleId: number;
  maleNom?: string;
  maleBague?: string;
  femelleId: number;
  femelleNom?: string;
  femelleBague?: string;
  dateCreation: string;
  statut: string;
  activeClutchesCount?: number;
  totalEggsLaid?: number;
  totalChicksHatched?: number;
}

export interface BreedingContext {
  pair?: BreedingPairContext;
  activeClutches?: {
    id: string;
    startDate: string;
    status: string;
    eggCount: number;
    fertilizedCount: number | null;
    hatchedCount: number | null;
    weanedCount: number | null;
  }[];
  totalActivePairs?: number;
  totalEggsInIncubation?: number;
}

export interface HealthRecordSummary {
  id: number;
  birdId: number;
  date: string;
  traitement: string;
  categorie: 'Traitement' | 'Vaccin' | 'Visite Vétérinaire' | 'Symptôme';
  description?: string;
  statut?: 'En attente' | 'Terminé';
}

export interface HealthContext {
  birdId?: number;
  records: HealthRecordSummary[];
  activeTreatmentsCount: number;
  quarantineCount: number;
  recentObservations?: string[];
}

export interface FeedingContext {
  speciesId?: string;
  mainDiet?: string;
  recommendedSupplements?: string;
  vitaminFrequency?: string;
  specificNeeds?: string;
  activeFeedRations?: {
    name: string;
    composition: string;
    targetGroup: string;
  }[];
}

export interface HabitatContext {
  cageId?: string | number;
  cageNom?: string;
  type?: string;
  dimensions?: { length?: number; width?: number; height?: number };
  capaciteMax?: number;
  currentOccupancy?: number;
  isOvercrowded?: boolean;
  totalCagesCount?: number;
}

export interface GenealogyContext {
  birdId: number;
  nom: string;
  bague: string;
  pere?: { id: number; nom: string; bague: string };
  mere?: { id: number; nom: string; bague: string };
  grandPerePaternel?: { id: number; nom: string; bague: string };
  grandMerePaternelle?: { id: number; nom: string; bague: string };
  grandPereMaternel?: { id: number; nom: string; bague: string };
  grandMereMaternelle?: { id: number; nom: string; bague: string };
  inbreedingCoefficient?: number;
}

export interface FinanceContext {
  totalRevenue?: number;
  totalExpenses?: number;
  netBalance?: number;
  currency?: string;
  recentExpensesCount?: number;
  recentSalesCount?: number;
}

export interface IntelligenceContext {
  scores?: {
    reproductionScore?: IntelligenceScore;
    habitatScore?: IntelligenceScore;
    financeScore?: IntelligenceScore;
    healthScore?: IntelligenceScore;
    geneticScore?: IntelligenceScore;
  };
  dataQuality?: DataQualityResult;
  alerts?: RuleResult[];
  topPerformers?: TopPerformer[];
  birdFiche?: BirdIntelligenceFiche | null;
  report?: IntelligenceReport | null;
}

export interface LanguageContextSummary {
  language: Language;
  isRtl: boolean;
  locale: string;
}

export interface PermissionContext {
  tier: AssistantTier;
  allowedCapabilities: AssistantCapability[];
  isQuotaEnforced: boolean;
  hasAccessToUserData: boolean;
  hasAccessToIntelligence: boolean;
}

export interface AssistantContextSummary {
  hasBiologicalContext: boolean;
  hasBirdContext: boolean;
  hasBreedingContext: boolean;
  hasHealthContext: boolean;
  hasFeedingContext: boolean;
  hasHabitatContext: boolean;
  hasGenealogyContext: boolean;
  hasFinanceContext: boolean;
  hasIntelligenceContext: boolean;
  loadedSources: KnowledgeSource[];
  loadedEntityIds: {
    speciesId?: string;
    birdId?: number;
    pairId?: string;
    cageId?: string | number;
  };
}

export interface AssistantContext {
  query: string;
  language: LanguageContextSummary;
  permissions: PermissionContext;
  biological?: BiologicalContext;
  bird?: BirdContext;
  breeding?: BreedingContext;
  health?: HealthContext;
  feeding?: FeedingContext;
  habitat?: HabitatContext;
  genealogy?: GenealogyContext;
  finance?: FinanceContext;
  intelligence?: IntelligenceContext;
  summary: AssistantContextSummary;
}

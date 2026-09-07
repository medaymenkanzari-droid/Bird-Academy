/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../../../utils/translations';
import { AssistantContextSummary } from './context';
import { KnowledgeSource } from './knowledge';
import { AssistantTier } from './permissions';

export type AssistantConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type AssistantResponseType =
  | 'GENERAL_INFORMATION'
  | 'FARM_INFORMATION'
  | 'ANALYSIS'
  | 'RECOMMENDATION'
  | 'WARNING'
  | 'ERROR'
  | 'UNAVAILABLE';

export type AssistantEngineStatus =
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'INITIALIZING'
  | 'ERROR';

export type QuestionCategory =
  | 'GENERAL_BIOLOGY'
  | 'GENERAL_BREEDING'
  | 'GENERAL_HEALTH'
  | 'GENERAL_FEEDING'
  | 'GENERAL_HABITAT'
  | 'USER_FARM'
  | 'USER_BIRD'
  | 'USER_BREEDING'
  | 'USER_HEALTH'
  | 'USER_FEEDING'
  | 'USER_HABITAT'
  | 'USER_FINANCE'
  | 'USER_GENEALOGY'
  | 'INTELLIGENCE_EXPLANATION'
  | 'REPORT_EXPLANATION'
  | 'UNKNOWN';

export interface AssistantRequestOptions {
  temperature?: number;
  maxTokens?: number;
  deterministicOnly?: boolean;
}

export interface AssistantRequest {
  query: string;
  language: Language;
  birdId?: number;
  pairId?: string;
  cageId?: string | number;
  speciesId?: string;
  clutchId?: string;
  reportType?: 'monthly' | 'annual' | 'reproduction' | 'finance' | 'global';
  tier?: AssistantTier;
  includeIntelligence?: boolean;
  options?: AssistantRequestOptions;
}

export interface AssistantResponse {
  answer: string;
  language: Language;
  confidence: AssistantConfidence;
  sources: KnowledgeSource[];
  contextUsed: AssistantContextSummary;
  warnings: string[];
  generatedAt: string;
  responseType: AssistantResponseType;
  status: AssistantEngineStatus;
  isRtl: boolean;
}

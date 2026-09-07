/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AssistantTier = 'FREE' | 'PREMIUM' | 'PRO';

export type AssistantCapability =
  | 'GENERAL_KNOWLEDGE'
  | 'BIOLOGICAL_KNOWLEDGE'
  | 'BIRD_CONTEXT'
  | 'BREEDING_ANALYSIS'
  | 'HEALTH_ANALYSIS'
  | 'INTELLIGENCE_EXPLANATION'
  | 'ADVANCED_ANALYSIS'
  | 'REPORT_ASSISTANCE';

export interface TierPermissionConfig {
  tier: AssistantTier;
  capabilities: AssistantCapability[];
  maxQueriesPerDay: number | null; // null = unlimited
  allowUserDataAccess: boolean;
  allowIntelligenceAccess: boolean;
  allowAdvancedAnalysis: boolean;
}

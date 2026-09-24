/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION & CAPABILITY TYPES
 * Core definitions for the commercial matrix (FREE / PREMIUM / PRO)
 * linked to the offline LMSE licensing engine.
 */

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PRO';

export type SubscriptionCapability =
  // 1. Oiseaux
  | 'BIRD_VIEW'
  | 'BIRD_CREATE_EDIT'
  | 'BIRD_UNLIMITED'
  | 'BIRD_ADVANCED_RECORD'
  | 'BIRD_QR_EXPORT'

  // 2. Cages & Habitat
  | 'HABITAT_VIEW'
  | 'HABITAT_MANAGE'
  | 'HABITAT_ADVANCED'

  // 3. Couples
  | 'COUPLE_VIEW'
  | 'COUPLE_MANAGE'
  | 'COUPLE_COMPATIBILITY_GENETICS'

  // 4. Reproduction
  | 'BREEDING_VIEW'
  | 'BREEDING_RECORD'
  | 'BREEDING_ADVANCED_TRACKING'
  | 'BREEDING_PREDICTIVE_ANALYTICS'

  // 5. Santé & Soins
  | 'HEALTH_VIEW'
  | 'HEALTH_RECORD'
  | 'HEALTH_BATCH_TREATMENTS'
  | 'HEALTH_INTELLIGENCE_ALERTS'

  // 6. Alimentation
  | 'FEEDING_VIEW'
  | 'FEEDING_MANAGE'

  // 7. Calendrier
  | 'CALENDAR_VIEW'
  | 'CALENDAR_FULL_SYNC'

  // 8. Référentiel Biologique
  | 'BIO_REFERENCE_ACCESS'

  // 9. Finances
  | 'FINANCE_VIEW'
  | 'FINANCE_MANAGE'
  | 'FINANCE_ADVANCED_REPORTS'

  // 10. Statistiques
  | 'ANALYTICS_BASIC'
  | 'ANALYTICS_ADVANCED'
  | 'ANALYTICS_PRO_EXPORT'

  // 11. Génétique
  | 'GENETICS_BASIC'
  | 'GENETICS_WRIGHT_INBREEDING'
  | 'GENETICS_ADVANCED_TREE'

  // 12. Bird Intelligence
  | 'INTELLIGENCE_VIEW_BASIC'
  | 'INTELLIGENCE_DIAGNOSTIC_FICHES'
  | 'INTELLIGENCE_FULL_ENGINE'

  // 13. Assistant IA
  | 'AI_ASSISTANT_GENERAL_BIO'
  | 'AI_ASSISTANT_FARM_CONTEXT'
  | 'AI_ASSISTANT_INTELLIGENCE_GENEALOGY'
  | 'AI_ASSISTANT_QUOTA_10'
  | 'AI_ASSISTANT_QUOTA_100'
  | 'AI_ASSISTANT_QUOTA_UNLIMITED'

  // 14. Démonstration & Sandbox
  | 'DEMO_GENERATOR_ACCESS';

export interface FeatureAccess {
  isAccessible: boolean;
  isLimited: boolean;
  isLocked: boolean;
  requiredTier: SubscriptionTier | null;
  reason?: string;
  missingCapabilities?: SubscriptionCapability[];
}

export interface TierDefinition {
  tier: SubscriptionTier;
  label: string;
  badgeStyle: string;
  maxDailyAiQueries: number | null; // null = unlimited
  capabilities: SubscriptionCapability[];
}

export interface TierLimits {
  maxBirds: number;
  demoGeneratorAvailable: boolean;
}

export type PlanLimits = Record<SubscriptionTier, TierLimits>;

export interface TierDiagnosticInfo {
  activeTier: SubscriptionTier;
  effectiveTier: SubscriptionTier;
  licenseStatus: string;
  hasLicense: boolean;
  licenseKey?: string;
  isTestEnv: boolean;
  isTestOverrideActive: boolean;
  effectiveBirdLimit: number;
  effectiveLimit: number;
  limitSource: 'PLAN_CONFIG_FREE' | 'PLAN_CONFIG_PREMIUM' | 'PLAN_CONFIG_PRO' | 'TEST_OVERRIDE' | string;
}

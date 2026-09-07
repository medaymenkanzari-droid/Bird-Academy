/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssistantCapability, AssistantTier, TierPermissionConfig } from '../../types/permissions';
import { PermissionContext } from '../../types/context';

export const TIER_CONFIGURATIONS: Record<AssistantTier, TierPermissionConfig> = {
  FREE: {
    tier: 'FREE',
    capabilities: [
      'GENERAL_KNOWLEDGE',
      'BIOLOGICAL_KNOWLEDGE'
    ],
    maxQueriesPerDay: 10,
    allowUserDataAccess: false,
    allowIntelligenceAccess: false,
    allowAdvancedAnalysis: false
  },
  PREMIUM: {
    tier: 'PREMIUM',
    capabilities: [
      'GENERAL_KNOWLEDGE',
      'BIOLOGICAL_KNOWLEDGE',
      'BIRD_CONTEXT',
      'BREEDING_ANALYSIS',
      'HEALTH_ANALYSIS'
    ],
    maxQueriesPerDay: 100,
    allowUserDataAccess: true,
    allowIntelligenceAccess: false,
    allowAdvancedAnalysis: false
  },
  PRO: {
    tier: 'PRO',
    capabilities: [
      'GENERAL_KNOWLEDGE',
      'BIOLOGICAL_KNOWLEDGE',
      'BIRD_CONTEXT',
      'BREEDING_ANALYSIS',
      'HEALTH_ANALYSIS',
      'INTELLIGENCE_EXPLANATION',
      'ADVANCED_ANALYSIS',
      'REPORT_ASSISTANCE'
    ],
    maxQueriesPerDay: null,
    allowUserDataAccess: true,
    allowIntelligenceAccess: true,
    allowAdvancedAnalysis: true
  }
};

export class AssistantPermissionProvider {
  /**
   * Retrieves tier configuration.
   */
  static getTierConfig(tier: AssistantTier = 'FREE'): TierPermissionConfig {
    return TIER_CONFIGURATIONS[tier] || TIER_CONFIGURATIONS.FREE;
  }

  /**
   * Checks if a tier possesses a specific capability.
   */
  static hasCapability(tier: AssistantTier, capability: AssistantCapability): boolean {
    const config = this.getTierConfig(tier);
    return config.capabilities.includes(capability);
  }

  /**
   * Builds PermissionContext for request processing.
   */
  static getPermissionContext(tier: AssistantTier = 'FREE'): PermissionContext {
    const config = this.getTierConfig(tier);
    return {
      tier: config.tier,
      allowedCapabilities: [...config.capabilities],
      isQuotaEnforced: config.maxQueriesPerDay !== null,
      hasAccessToUserData: config.allowUserDataAccess,
      hasAccessToIntelligence: config.allowIntelligenceAccess
    };
  }

  /**
   * Returns list of allowed capabilities for a tier.
   */
  static getCapabilitiesForTier(tier: AssistantTier): AssistantCapability[] {
    return [...this.getTierConfig(tier).capabilities];
  }
}

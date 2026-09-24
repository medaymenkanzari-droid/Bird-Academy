/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — CAPABILITY RESOLVER
 * Centralized capability engine enforcing the commercial matrix.
 */

import { SubscriptionTier, SubscriptionCapability, FeatureAccess, PlanLimits } from '../types/subscription';
import { SubscriptionTierResolver } from './SubscriptionTierResolver';
import { appStorage } from '../../../storage';

export const PLAN_LIMITS: PlanLimits = {
  FREE: { maxBirds: 20, demoGeneratorAvailable: false },
  PREMIUM: { maxBirds: Infinity, demoGeneratorAvailable: true },
  PRO: { maxBirds: Infinity, demoGeneratorAvailable: true }
};

export const TIER_CAPABILITIES: Record<SubscriptionTier, SubscriptionCapability[]> = {
  FREE: [
    // Oiseaux
    'BIRD_VIEW',
    'BIRD_CREATE_EDIT',

    // Cages & Habitat
    'HABITAT_VIEW',
    'HABITAT_MANAGE',

    // Couples
    'COUPLE_VIEW',
    'COUPLE_MANAGE',

    // Reproduction
    'BREEDING_VIEW',
    'BREEDING_RECORD',

    // Santé
    'HEALTH_VIEW',
    'HEALTH_RECORD',

    // Alimentation
    'FEEDING_VIEW',
    'FEEDING_MANAGE',

    // Calendrier
    'CALENDAR_VIEW',

    // Référentiel Biologique
    'BIO_REFERENCE_ACCESS',

    // Finances
    'FINANCE_VIEW',
    'FINANCE_MANAGE',

    // Statistiques
    'ANALYTICS_BASIC',

    // Génétique
    'GENETICS_BASIC',

    // Intelligence
    'INTELLIGENCE_VIEW_BASIC',

    // Assistant IA
    'AI_ASSISTANT_GENERAL_BIO',
    'AI_ASSISTANT_QUOTA_10'
  ],

  PREMIUM: [
    // All FREE
    'BIRD_VIEW',
    'BIRD_CREATE_EDIT',
    'HABITAT_VIEW',
    'HABITAT_MANAGE',
    'COUPLE_VIEW',
    'COUPLE_MANAGE',
    'BREEDING_VIEW',
    'BREEDING_RECORD',
    'HEALTH_VIEW',
    'HEALTH_RECORD',
    'FEEDING_VIEW',
    'FEEDING_MANAGE',
    'CALENDAR_VIEW',
    'BIO_REFERENCE_ACCESS',
    'FINANCE_VIEW',
    'FINANCE_MANAGE',
    'ANALYTICS_BASIC',
    'GENETICS_BASIC',
    'INTELLIGENCE_VIEW_BASIC',
    'AI_ASSISTANT_GENERAL_BIO',

    // PREMIUM Specifics
    'BIRD_UNLIMITED',
    'BIRD_ADVANCED_RECORD',
    'BIRD_QR_EXPORT',
    'HABITAT_ADVANCED',
    'COUPLE_COMPATIBILITY_GENETICS',
    'BREEDING_ADVANCED_TRACKING',
    'HEALTH_BATCH_TREATMENTS',
    'CALENDAR_FULL_SYNC',
    'FINANCE_ADVANCED_REPORTS',
    'ANALYTICS_ADVANCED',
    'GENETICS_WRIGHT_INBREEDING',
    'INTELLIGENCE_DIAGNOSTIC_FICHES',
    'AI_ASSISTANT_FARM_CONTEXT',
    'AI_ASSISTANT_QUOTA_100',
    'DEMO_GENERATOR_ACCESS'
  ],

  PRO: [
    // All FREE & PREMIUM
    'BIRD_VIEW',
    'BIRD_CREATE_EDIT',
    'HABITAT_VIEW',
    'HABITAT_MANAGE',
    'COUPLE_VIEW',
    'COUPLE_MANAGE',
    'BREEDING_VIEW',
    'BREEDING_RECORD',
    'HEALTH_VIEW',
    'HEALTH_RECORD',
    'FEEDING_VIEW',
    'FEEDING_MANAGE',
    'CALENDAR_VIEW',
    'BIO_REFERENCE_ACCESS',
    'FINANCE_VIEW',
    'FINANCE_MANAGE',
    'ANALYTICS_BASIC',
    'GENETICS_BASIC',
    'INTELLIGENCE_VIEW_BASIC',
    'AI_ASSISTANT_GENERAL_BIO',
    'BIRD_UNLIMITED',
    'BIRD_ADVANCED_RECORD',
    'BIRD_QR_EXPORT',
    'HABITAT_ADVANCED',
    'COUPLE_COMPATIBILITY_GENETICS',
    'BREEDING_ADVANCED_TRACKING',
    'HEALTH_BATCH_TREATMENTS',
    'CALENDAR_FULL_SYNC',
    'FINANCE_ADVANCED_REPORTS',
    'ANALYTICS_ADVANCED',
    'GENETICS_WRIGHT_INBREEDING',
    'INTELLIGENCE_DIAGNOSTIC_FICHES',
    'AI_ASSISTANT_FARM_CONTEXT',

    // PRO Exclusive
    'BREEDING_PREDICTIVE_ANALYTICS',
    'HEALTH_INTELLIGENCE_ALERTS',
    'ANALYTICS_PRO_EXPORT',
    'GENETICS_ADVANCED_TREE',
    'INTELLIGENCE_FULL_ENGINE',
    'AI_ASSISTANT_INTELLIGENCE_GENEALOGY',
    'AI_ASSISTANT_QUOTA_UNLIMITED',
    'DEMO_GENERATOR_ACCESS'
  ]
};

export class CapabilityResolver {
  /**
   * Returns all capabilities granted to a subscription tier.
   */
  static getCapabilitiesForTier(tier: SubscriptionTier): SubscriptionCapability[] {
    return TIER_CAPABILITIES[tier] || TIER_CAPABILITIES.FREE;
  }

  /**
   * Alias method for resolving capabilities from a tier.
   */
  static resolve(tier: SubscriptionTier): SubscriptionCapability[] {
    return this.getCapabilitiesForTier(tier);
  }

  /**
   * Checks if a tier possesses a specific capability.
   */
  static hasCapability(tier: SubscriptionTier, capability: SubscriptionCapability): boolean {
    const caps = this.getCapabilitiesForTier(tier);
    return caps.includes(capability);
  }

  /**
   * Checks access requirements for an action.
   */
  static checkActionAccess(
    tier: SubscriptionTier,
    requiredCapability: SubscriptionCapability
  ): FeatureAccess {
    const hasCap = this.hasCapability(tier, requiredCapability);
    if (hasCap) {
      return {
        isAccessible: true,
        isLimited: false,
        isLocked: false,
        requiredTier: null
      };
    }

    // Determine the minimum required tier for this capability
    let requiredTier: SubscriptionTier = 'PRO';
    if (TIER_CAPABILITIES.PREMIUM.includes(requiredCapability)) {
      requiredTier = 'PREMIUM';
    }

    return {
      isAccessible: false,
      isLimited: true,
      isLocked: true,
      requiredTier,
      missingCapabilities: [requiredCapability],
      reason: `Cette fonctionnalité nécessite le ${requiredTier === 'PRO' ? 'Plan PRO' : 'Plan PREMIUM'}.`
    };
  }

  /**
   * Evaluates access permissions for a specific module ID.
   */
  static checkModuleAccess(tier: SubscriptionTier, moduleId: string): FeatureAccess {
    switch (moduleId) {
      case 'intelligence': {
        if (tier === 'PRO') {
          return { isAccessible: true, isLimited: false, isLocked: false, requiredTier: null };
        }
        if (tier === 'PREMIUM') {
          return { isAccessible: true, isLimited: true, isLocked: false, requiredTier: 'PRO', reason: 'Accès limité aux fiches diagnostiques. Le moteur complet nécessite PRO.' };
        }
        return { isAccessible: false, isLimited: true, isLocked: true, requiredTier: 'PRO', reason: 'Bird Intelligence nécessite le plan PRO.' };
      }

      case 'genetics': {
        if (tier === 'PRO') {
          return { isAccessible: true, isLimited: false, isLocked: false, requiredTier: null };
        }
        if (tier === 'PREMIUM') {
          return { isAccessible: true, isLimited: false, isLocked: false, requiredTier: null };
        }
        return { isAccessible: true, isLimited: true, isLocked: false, requiredTier: 'PREMIUM', reason: 'Fonctions de croisement de base. La consanguinité Wright nécessite PREMIUM ou PRO.' };
      }

      case 'statistiques': {
        if (tier === 'PRO' || tier === 'PREMIUM') {
          return { isAccessible: true, isLimited: false, isLocked: false, requiredTier: null };
        }
        return { isAccessible: true, isLimited: true, isLocked: false, requiredTier: 'PREMIUM', reason: 'Statistiques fondamentales. Les graphiques avancés nécessitent PREMIUM ou PRO.' };
      }

      default:
        return { isAccessible: true, isLimited: false, isLocked: false, requiredTier: null };
    }
  }

  /**
   * Returns the maximum bird limit for a specified tier.
   */
  static getBirdLimit(tier: SubscriptionTier): number {
    return PLAN_LIMITS[tier]?.maxBirds ?? 20;
  }

  /**
   * Returns the maximum bird limit for the currently active plan.
   */
  static getBirdLimitForCurrentPlan(): number {
    const tier = SubscriptionTierResolver.getCurrentTierSync();
    return this.getBirdLimit(tier);
  }

  /**
   * Checks if additional birds can be created without exceeding the current plan quota.
   * If currentBirdCount is omitted, counts active (non-archived) birds directly from storage.
   */
  static canCreateBird(currentBirdCount?: number, additionalCount: number = 1): boolean {
    const limit = this.getBirdLimitForCurrentPlan();
    if (limit === Infinity) return true;

    let count: number;
    if (typeof currentBirdCount === 'number') {
      count = currentBirdCount;
    } else {
      const stored = appStorage.getItem<Array<{ archived?: boolean }>>('canaris', []);
      count = Array.isArray(stored) ? stored.filter(b => !b.archived).length : 0;
    }

    return (count + additionalCount) <= limit;
  }

  /**
   * Checks if a batch of birds can be created without exceeding the current plan quota.
   */
  static canCreateBirds(currentBirdCount: number, batchCount: number): boolean {
    return this.canCreateBird(currentBirdCount, batchCount);
  }

  /**
   * Returns the currently active subscription tier synchronously.
   */
  static getCurrentTierSync(): SubscriptionTier {
    return SubscriptionTierResolver.getCurrentTierSync();
  }

  /**
   * Sets mock tier override (strictly for controlled testing).
   */
  static setMockTierOverride(tier: SubscriptionTier | null): void {
    SubscriptionTierResolver.setMockTierOverride(tier);
  }

  /**
   * Checks if the demo generator can be used for the given or current tier.
   * FREE tier has demo generator disabled.
   */
  static canUseDemoGenerator(tier?: SubscriptionTier): boolean {
    const activeTier = tier || this.getCurrentTierSync();
    return PLAN_LIMITS[activeTier]?.demoGeneratorAvailable ?? false;
  }

  /**
   * Enforces capacity limit centrally across creation, duplication, import, and restore operations.
   */
  static enforceCapacityLimit(currentCount: number, additional: number = 1): { allowed: boolean; remaining: number; limit: number } {
    const limit = this.getBirdLimitForCurrentPlan();
    if (limit === Infinity) {
      return { allowed: true, remaining: Infinity, limit: Infinity };
    }
    const allowed = (currentCount + additional) <= limit;
    const remaining = Math.max(0, limit - currentCount);
    return { allowed, remaining, limit };
  }
}


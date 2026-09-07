/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION TIER RESOLVER
 * Maps LMSE licenses, policy features, and validation results
 * to the official commercial tier (FREE / PREMIUM / PRO).
 */

import { License, LicenseValidationResult } from '../../licensing/types/licensing';
import { SubscriptionTier } from '../types/subscription';
import { isDevEnvironment } from '../../../config/appMode';

export class SubscriptionTierResolver {
  /**
   * Resolves the active commercial tier from the license and validation state.
   */
  static resolve(
    license: License | null,
    validation?: LicenseValidationResult | null
  ): SubscriptionTier {
    // 1. Check for manual test/sandbox override in local storage (Strictly Dev/QA Sandbox Only)
    if (isDevEnvironment() && typeof window !== 'undefined' && window.localStorage) {
      try {
        const override = localStorage.getItem('bird_academy_subscription_tier_override') ||
                         localStorage.getItem('bird_academy_assistant_tier_override');
        if (override === 'FREE' || override === 'PREMIUM' || override === 'PRO') {
          return override as SubscriptionTier;
        }
      } catch (e) {
        // Ignore localStorage error
      }
    }

    // 2. If no license or license is invalid/expired/revoked -> Default to FREE
    if (!license || (validation && !validation.isValid)) {
      return 'FREE';
    }

    // 3. Check explicit metadata commercialTier or tier tags in policy features
    if (license.metadata?.commercialTier === 'FREE') {
      return 'FREE';
    }
    if (license.metadata?.commercialTier === 'PRO') {
      return 'PRO';
    }
    if (license.metadata?.commercialTier === 'PREMIUM') {
      return 'PREMIUM';
    }

    const features = license.policy?.features || [];
    if (features.includes('tier:pro') || features.includes('pro') || features.includes('enterprise')) {
      return 'PRO';
    }
    if (features.includes('tier:premium') || features.includes('premium')) {
      return 'PREMIUM';
    }
    if (features.includes('tier:free') || features.includes('free')) {
      return 'FREE';
    }

    // 4. Map license types
    switch (license.type) {
      case 'enterprise':
      case 'beta':
      case 'association':
      case 'veterinary':
        return 'PRO';

      case 'commercial':
        return 'PREMIUM';

      case 'permanent':
        return features.includes('intelligence') || features.includes('pedigree') ? 'PRO' : 'PREMIUM';

      case 'temporary':
        return features.includes('pro') ? 'PRO' : 'PREMIUM';

      default:
        return 'FREE';
    }
  }

  /**
   * Returns a display name for the tier.
   */
  static getTierLabel(tier: SubscriptionTier): string {
    switch (tier) {
      case 'PRO': return 'Plan PRO';
      case 'PREMIUM': return 'Plan PREMIUM';
      case 'FREE':
      default:
        return 'Plan GRATUIT';
    }
  }
}

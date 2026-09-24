/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION TIER RESOLVER
 * Maps LMSE licenses, policy features, and validation results
 * to the official commercial tier (FREE / PREMIUM / PRO).
 */

import { License, LicenseValidationResult } from '../../licensing/types/licensing';
import { SubscriptionTier, TierDiagnosticInfo } from '../types/subscription';
import { isDevEnvironment } from '../../../config/appMode';
import { LicensingService } from '../../licensing/services/LicensingService';

export class SubscriptionTierResolver {
  private static mockTierOverride: SubscriptionTier | null = null;

  /**
   * Sets a test-only mock tier override.
   * This is strictly for controlled unit testing and must never be active by default in production.
   */
  static setMockTierOverride(tier: SubscriptionTier | null): void {
    this.mockTierOverride = tier;
  }

  /**
   * Cleans any legacy test/QA override stored in localStorage without touching any breeding data.
   */
  static clearLegacyTestState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('bird_academy_subscription_tier_override');
        localStorage.removeItem('bird_academy_assistant_tier_override');
        localStorage.removeItem('bird_academy_qa_mode');
        localStorage.removeItem('bird_academy_test_license');
        localStorage.removeItem('bird_academy_lmse_active_license');
        localStorage.removeItem('bird_academy_lmse_all_licenses');
      } catch (e) {
        // Ignore
      }
    }
  }

  /**
   * Synchronously determines the current active subscription tier.
   */
  static getCurrentTierSync(): SubscriptionTier {
    // 1. Mock override for automated tests
    if (this.mockTierOverride) {
      return this.mockTierOverride;
    }

    // 2. Dev / QA sandbox manual override check
    const isTestOrDev = isDevEnvironment() || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');
    if (isTestOrDev && typeof window !== 'undefined' && window.localStorage) {
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

    // 3. Inspect active LMSE license from storage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('bird_academy_lmse_active_license');
        if (raw) {
          const license = JSON.parse(raw) as License;
          // Check for legacy test license (WINDOWS-FREE-FIX-002)
          if (LicensingService.isLegacyTestLicenseKey(license.key, license)) {
            return 'FREE';
          }
          // Check expiration or revocation
          const invalidStatuses = ['revoked', 'expired', 'replaced', 'suspended'];
          if (license.status && invalidStatuses.includes(license.status.toLowerCase())) {
            return 'FREE';
          }
          if (license.expiresAt) {
            const exp = new Date(license.expiresAt).getTime();
            if (!isNaN(exp) && exp < Date.now()) {
              return 'FREE';
            }
          }
          return this.resolve(license);
        }
      } catch (e) {
        // Ignore
      }
    }

    return 'FREE';
  }

  /**
   * Returns deterministic diagnostic information regarding the active tier and license status.
   */
  static getDiagnostics(): TierDiagnosticInfo {
    const isTestOrDev = isDevEnvironment() || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');
    let hasOverride = false;
    let overrideValue: string | null = null;

    if (this.mockTierOverride) {
      hasOverride = true;
      overrideValue = this.mockTierOverride;
    } else if (isTestOrDev && typeof window !== 'undefined' && window.localStorage) {
      try {
        overrideValue = localStorage.getItem('bird_academy_subscription_tier_override') ||
                        localStorage.getItem('bird_academy_assistant_tier_override');
        if (overrideValue === 'FREE' || overrideValue === 'PREMIUM' || overrideValue === 'PRO') {
          hasOverride = true;
        }
      } catch (e) {
        // Ignore
      }
    }

    let license: License | null = null;
    let licenseStatus = 'NO_LICENSE';
    let licenseKey: string | undefined;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem('bird_academy_lmse_active_license');
        if (raw) {
          license = JSON.parse(raw);
          licenseStatus = license?.status || 'UNKNOWN';
          licenseKey = license?.key;
        }
      } catch (e) {
        // Ignore
      }
    }

    const activeTier = this.getCurrentTierSync();
    const effectiveLimit = activeTier === 'FREE' ? 20 : Infinity;
    const limitSource = hasOverride
      ? 'TEST_OVERRIDE'
      : activeTier === 'PRO'
      ? 'PLAN_CONFIG_PRO'
      : activeTier === 'PREMIUM'
      ? 'PLAN_CONFIG_PREMIUM'
      : 'PLAN_CONFIG_FREE';

    return {
      activeTier,
      effectiveTier: activeTier,
      licenseStatus,
      hasLicense: !!license,
      licenseKey,
      isTestEnv: isTestOrDev,
      isTestOverrideActive: hasOverride,
      effectiveBirdLimit: effectiveLimit,
      effectiveLimit,
      limitSource
    };
  }

  /**
   * Offline-First Invariant: Cloud sync is strictly inactive.
   */
  static isCloudSyncActive(): boolean {
    return false;
  }

  /**
   * Resolves the active commercial tier from the license and validation state.
   */
  static resolve(
    license: License | null,
    validation?: LicenseValidationResult | null
  ): SubscriptionTier {
    // 1. Check for manual test/sandbox override in local storage (Strictly Dev/QA Sandbox Only)
    const isTestOrDev = isDevEnvironment() || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');
    if (isTestOrDev && typeof window !== 'undefined' && window.localStorage) {
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

    // 2. If no license or license is invalid/expired/revoked or legacy test -> Default to FREE
    const invalidStatuses = ['revoked', 'expired', 'replaced', 'suspended'];
    if (!license || LicensingService.isLegacyTestLicenseKey(license.key, license) || (validation && !validation.isValid) || (license.status && invalidStatuses.includes(license.status.toLowerCase()))) {
      return 'FREE';
    }

    // Check expiration if present
    if (license.expiresAt) {
      const exp = new Date(license.expiresAt).getTime();
      if (!isNaN(exp) && exp < Date.now()) {
        return 'FREE';
      }
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

      case 'test':
        return (license.metadata?.tier || 'PRO') as SubscriptionTier;

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


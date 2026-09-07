/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION CONTEXT
 * Provides application-wide reactive subscription state, active capabilities,
 * and permission checking utilities.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useLicensing } from '../../licensing/hooks/useLicensing';
import { SubscriptionTier, SubscriptionCapability, FeatureAccess } from '../types/subscription';
import { SubscriptionTierResolver } from '../services/SubscriptionTierResolver';
import { CapabilityResolver } from '../services/CapabilityResolver';
import { isDevEnvironment } from '../../../config/appMode';

export interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  capabilities: Set<SubscriptionCapability>;
  hasCapability: (capability: SubscriptionCapability) => boolean;
  canAccessModule: (moduleId: string) => FeatureAccess;
  canAccessAction: (requiredCapability: SubscriptionCapability) => FeatureAccess;
  setTierOverride: (tier: SubscriptionTier | null) => void;
  isFree: boolean;
  isPremium: boolean;
  isPro: boolean;
  tierLabel: string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { activeLicense, validation } = useLicensing();
  const [tierOverride, setTierOverrideState] = useState<SubscriptionTier | null>(() => {
    if (isDevEnvironment() && typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('bird_academy_subscription_tier_override') ||
                      localStorage.getItem('bird_academy_assistant_tier_override');
        if (saved === 'FREE' || saved === 'PREMIUM' || saved === 'PRO') {
          return saved as SubscriptionTier;
        }
      } catch (e) {
        // Ignore
      }
    }
    return null;
  });

  const setTierOverride = (newTier: SubscriptionTier | null) => {
    if (!isDevEnvironment()) {
      console.warn('[SECURITY] Tier override is strictly disabled in production environments.');
      return;
    }
    setTierOverrideState(newTier);
    try {
      if (newTier) {
        localStorage.setItem('bird_academy_subscription_tier_override', newTier);
        localStorage.setItem('bird_academy_assistant_tier_override', newTier);
      } else {
        localStorage.removeItem('bird_academy_subscription_tier_override');
        localStorage.removeItem('bird_academy_assistant_tier_override');
      }
    } catch (e) {
      // Ignore
    }
  };

  const currentTier: SubscriptionTier = useMemo(() => {
    if (tierOverride) return tierOverride;
    return SubscriptionTierResolver.resolve(activeLicense, validation);
  }, [tierOverride, activeLicense, validation]);

  const capabilities = useMemo(() => {
    const caps = CapabilityResolver.getCapabilitiesForTier(currentTier);
    return new Set<SubscriptionCapability>(caps);
  }, [currentTier]);

  const hasCapability = (cap: SubscriptionCapability): boolean => {
    return capabilities.has(cap);
  };

  const canAccessModule = (moduleId: string): FeatureAccess => {
    return CapabilityResolver.checkModuleAccess(currentTier, moduleId);
  };

  const canAccessAction = (requiredCapability: SubscriptionCapability): FeatureAccess => {
    return CapabilityResolver.checkActionAccess(currentTier, requiredCapability);
  };

  const value: SubscriptionContextType = {
    currentTier,
    capabilities,
    hasCapability,
    canAccessModule,
    canAccessAction,
    setTierOverride,
    isFree: currentTier === 'FREE',
    isPremium: currentTier === 'PREMIUM',
    isPro: currentTier === 'PRO',
    tierLabel: SubscriptionTierResolver.getTierLabel(currentTier),
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

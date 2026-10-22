/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUBSCRIPTION CONTEXT
 * Provides application-wide reactive subscription state, active capabilities,
 * and permission checking utilities derived exclusively from the verified LMSE license.
 */

import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useLicensing } from '../../licensing/hooks/useLicensing';
import { SubscriptionTier, SubscriptionCapability, FeatureAccess } from '../types/subscription';
import { SubscriptionTierResolver } from '../services/SubscriptionTierResolver';
import { CapabilityResolver } from '../services/CapabilityResolver';

export interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  capabilities: Set<SubscriptionCapability>;
  hasCapability: (capability: SubscriptionCapability) => boolean;
  canAccessModule: (moduleId: string) => FeatureAccess;
  canAccessAction: (requiredCapability: SubscriptionCapability) => FeatureAccess;
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

  // Purge any legacy manual test overrides from storage on startup
  useEffect(() => {
    SubscriptionTierResolver.clearLegacyTestState();
  }, []);

  const currentTier: SubscriptionTier = useMemo(() => {
    return SubscriptionTierResolver.resolve(activeLicense, validation);
  }, [activeLicense, validation]);

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

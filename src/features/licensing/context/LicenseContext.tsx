/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - UNIFIED LICENSE CONTEXT & SINGLETON STATE MACHINE
 * Provides a single source of truth for licensing state across the entire React application tree.
 * Prevents multiple un-synchronized instances of license state machines.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { License, LicenseValidationResult } from '../types/licensing';
import { LicensingService } from '../services/LicensingService';
import { BUILD_ID, isDevEnvironment, isQaMode } from '../../../config/appMode';

export type LicenseState = 'INITIALIZING' | 'LICENSE_CHECKING' | 'LICENSE_REQUIRED' | 'LICENSE_VALID' | 'LICENSE_INVALID';

export interface LicenseContextType {
  activeLicense: License | null;
  validation: LicenseValidationResult | null;
  loading: boolean;
  licenseState: LicenseState;
  refresh: () => Promise<void>;
  activateKey: (key: string, holderName: string) => Promise<LicenseValidationResult>;
  importOfflineBetaLicense: (fileContent: string) => Promise<LicenseValidationResult>;
  resetLicenseForQA: () => Promise<void>;
  isFeatureAllowed: (featureKey: string) => boolean;
  isTrial: boolean;
  isBeta: boolean;
  isEnterprise: boolean;
  remainingDays: number | null;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export interface LicenseProviderProps {
  children: ReactNode;
}

export const LicenseProvider: React.FC<LicenseProviderProps> = ({ children }) => {
  const [activeLicense, setActiveLicense] = useState<License | null>(null);
  const [validation, setValidation] = useState<LicenseValidationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    console.log(`[BOOT-02] LicenseProvider mounted: BUILD_ID=${BUILD_ID} | time=${new Date().toISOString()}`);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    console.log(`[BOOT-05] license initialization started: BUILD_ID=${BUILD_ID} | time=${new Date().toISOString()}`);
    try {
      const service = LicensingService.getInstance();
      const valResult = await service.initialize();
      console.log(`[BOOT-06] license initialization completed: BUILD_ID=${BUILD_ID} | isValid=${valResult.isValid} | code=${valResult.code || 'NONE'}`);
      setValidation(valResult);
      setActiveLicense(valResult.license);
    } catch (e) {
      console.error(`[BOOT-06] license initialization failed with error: BUILD_ID=${BUILD_ID}`, e);
      setValidation(null);
      setActiveLicense(null);
    } finally {
      setLoading(false);
      setIsHydrated(true);
    }
  }, []);

  const resetLicenseForQA = useCallback(async (): Promise<void> => {
    const service = LicensingService.getInstance();
    await service.resetLocalLicenseStateForQA();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    if ((isDevEnvironment() || isQaMode()) && typeof window !== 'undefined') {
      const runQaReset = async () => {
        console.log('[QA DEV TOOLS] Resetting local client license & test overrides (QA-FREE-CLEAN-001)...');
        await resetLicenseForQA();
        console.log('[QA DEV TOOLS] Test environment reset completed! Active license is null, native FREE mode active.');
      };
      (window as any).__QA_RESET_LICENSE__ = runQaReset;
      (window as any).__QA_RESET_TEST_ENVIRONMENT__ = runQaReset;

      if (window.location.search.includes('qa_reset_license=true') || window.location.search.includes('reset_license=1')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('qa_reset_license');
        url.searchParams.delete('reset_license');
        window.history.replaceState({}, '', url.toString());
        resetLicenseForQA();
        return;
      }
    }
    refresh();
  }, [refresh, resetLicenseForQA]);

  let licenseState: LicenseState = 'INITIALIZING';

  if (!isHydrated || loading) {
    licenseState = isHydrated ? 'LICENSE_CHECKING' : 'INITIALIZING';
  } else if (validation?.isValid && activeLicense) {
    licenseState = 'LICENSE_VALID';
  } else if (!activeLicense && (validation?.code === 'NO_LICENSE' || !validation)) {
    // FIX-FREE-001: Native FREE mode when no license is installed on clean install
    licenseState = 'LICENSE_VALID';
  } else if (validation?.code === 'EXPIRED') {
    // MISSION 013: Expiration of 30-day TEST license reverts to native FREE tier without blocking app (Zero Deletion)
    licenseState = 'LICENSE_VALID';
  } else if (validation?.code === 'NO_LICENSE' || validation?.status === 'pending_activation') {
    licenseState = 'LICENSE_REQUIRED';
  } else {
    licenseState = 'LICENSE_INVALID';
  }

  console.log(`[BOOT-07] license state = ${licenseState} | BUILD_ID=${BUILD_ID} | isHydrated=${isHydrated} | loading=${loading}`);

  const activateKey = async (key: string, holderName: string): Promise<LicenseValidationResult> => {
    const service = LicensingService.getInstance();
    const result = await service.activateKey(key, holderName);
    await refresh();
    return result;
  };

  const importOfflineBetaLicense = async (fileContent: string): Promise<LicenseValidationResult> => {
    const service = LicensingService.getInstance();
    const result = await service.importOfflineBetaLicense(fileContent);
    await refresh();
    return result;
  };

  const isFeatureAllowed = (featureKey: string): boolean => {
    if (licenseState !== 'LICENSE_VALID' || !activeLicense) {
      return featureKey === 'core';
    }
    if (activeLicense.status === 'revoked') return false;
    if (activeLicense.type === 'permanent' || activeLicense.type === 'enterprise') return true;
    return activeLicense.policy?.features?.includes(featureKey) ?? true;
  };

  const value: LicenseContextType = {
    activeLicense,
    validation,
    loading,
    licenseState,
    refresh,
    activateKey,
    importOfflineBetaLicense,
    resetLicenseForQA,
    isFeatureAllowed,
    isTrial: activeLicense?.status === 'trial',
    isBeta: activeLicense?.type === 'beta',
    isEnterprise: activeLicense?.type === 'enterprise',
    remainingDays: validation?.remainingDays ?? null,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};

export function useLicensing(): LicenseContextType {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicensing must be used within a LicenseProvider');
  }
  return context;
}

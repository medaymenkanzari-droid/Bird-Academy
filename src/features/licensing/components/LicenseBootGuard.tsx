/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - LICENSE BOOT GUARD
 * Root-level strict render guard that prevents App.tsx and any business code/repositories
 * from mounting unless licenseState === 'LICENSE_VALID'.
 */

import React, { ReactNode } from 'react';
import { useLicensing } from '../hooks/useLicensing';
import { FirstLaunchActivationScreen } from './FirstLaunchActivationScreen';
import { BrandLogoIcon } from '../../../components/design-system';
import { BUILD_ID } from '../../../config/appMode';
import { CommercialWebsiteApp } from '../../commercial-website/CommercialWebsiteApp';

export interface LicenseBootGuardProps {
  children: ReactNode;
}

export const LicenseBootGuard: React.FC<LicenseBootGuardProps> = ({ children }) => {
  const { licenseState, loading, validation, activeLicense, refresh } = useLicensing();
  const timestamp = new Date().toISOString();
  const isLicensed = licenseState === 'LICENSE_VALID';

  // Check if user explicitly asked for the Breeding Application
  const isExplicitAppView = typeof window !== 'undefined' && (
    window.location.search.includes('view=app') ||
    window.location.search.includes('mode=app') ||
    window.location.hash === '#app'
  );

  // If not explicitly viewing the application, default to Commercial Website
  if (!isExplicitAppView) {
    return (
      <CommercialWebsiteApp 
        onOpenApp={() => {
          if (typeof window !== 'undefined') {
            window.location.search = '?view=app';
          }
        }} 
      />
    );
  }

  console.log(`[BOOT-08] LicenseBootGuard render: BUILD_ID=${BUILD_ID} | time=${timestamp} | licenseState=${licenseState} | isLicensed=${isLicensed} | loading=${loading} | valCode=${validation?.code || 'NONE'}`);

  // 1. Initializing or Checking state -> minimal splash screen
  if (licenseState === 'INITIALIZING' || licenseState === 'LICENSE_CHECKING') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 space-y-4 font-mono">
        <img src="/assets/images/logo-icon.png" alt="Bird Academy" className="w-16 h-16 animate-pulse object-contain" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Vérification de la licence en cours...
        </span>
        <span className="text-[10px] text-slate-600">
          {BUILD_ID}
        </span>
      </div>
    );
  }

  // 2. Unlicensed / Required / Invalid state -> ONLY FirstLaunchActivationScreen (App is NOT mounted)
  if (licenseState !== 'LICENSE_VALID') {
    console.log(`[BOOT-10] FirstLaunchActivationScreen render: BUILD_ID=${BUILD_ID} | licenseState=${licenseState}`);
    return (
      <FirstLaunchActivationScreen
        onActivationSuccess={() => {
          refresh();
        }}
      />
    );
  }

  // 3. ONLY when licenseState === 'LICENSE_VALID' do we mount <App />!
  console.log(`[BOOT-03] App mounting allowed: BUILD_ID=${BUILD_ID} | licenseState=${licenseState}`);
  return <>{children}</>;
};


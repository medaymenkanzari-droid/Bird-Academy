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
import { brandAssets } from '../../../config/brandAssets';

export interface LicenseBootGuardProps {
  children: ReactNode;
}

/**
 * Deterministic check for installed native application runtime (Android Capacitor APK / Desktop Electron / Tauri).
 * STRICT POLICY (ANDROID-FREE-001 Directive #1):
 * Under NO circumstances should an Android browser user-agent alone qualify as native.
 * Chrome/Firefox/Safari on Android MUST remain recognized as WEB and render the Commercial Website.
 */
export function isNativeRuntime(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Capacitor native app runtime check (Official Capacitor Bridge)
  const cap = (window as any).Capacitor;
  if (cap && typeof cap === 'object') {
    // Check if running on native device platform (android/ios, NOT 'web')
    if (typeof cap.isNativePlatform === 'function' && cap.isNativePlatform() === true) {
      return true;
    }
    if (typeof cap.getPlatform === 'function') {
      const platform = cap.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        return true;
      }
    }
  }

  // 2. Capacitor custom scheme protocol check (Capacitor Android WebViews load under capacitor://localhost)
  if (typeof window.location !== 'undefined' && window.location.protocol === 'capacitor:') {
    return true;
  }

  // 3. Native injected Android JavaScript bridge if present
  if (typeof (window as any).Android === 'object' && (window as any).Android !== null) {
    return true;
  }

  // 4. Desktop packaged runtime check (Electron context bridge / Tauri)
  const electronBridge = (window as any).electron;
  if (electronBridge && (typeof electronBridge === 'object' || electronBridge === true)) {
    return true;
  }
  if (Boolean((window as any).__TAURI__)) {
    return true;
  }

  // Default: Pure Web browser (including Chrome Android, Safari iOS, desktop browsers) -> FALSE
  return false;
}

export const LicenseBootGuard: React.FC<LicenseBootGuardProps> = ({ children }) => {
  const { licenseState, loading, validation, activeLicense, refresh } = useLicensing();
  const timestamp = new Date().toISOString();
  const isLicensed = licenseState === 'LICENSE_VALID';

  // Check if running inside installed native app OR user explicitly asked for the Breeding Application
  const isNative = isNativeRuntime();
  const isExplicitAppView = isNative || (typeof window !== 'undefined' && (
    window.location.search.includes('view=app') ||
    window.location.search.includes('mode=app') ||
    window.location.hash === '#app'
  ));

  // If not explicitly viewing the application and not in a native app, default to Commercial Website
  if (!isExplicitAppView) {
    return <CommercialWebsiteApp />;
  }

  console.log(`[BOOT-08] LicenseBootGuard render: BUILD_ID=${BUILD_ID} | time=${timestamp} | licenseState=${licenseState} | isLicensed=${isLicensed} | loading=${loading} | valCode=${validation?.code || 'NONE'}`);

  // 1. Initializing or Checking state -> minimal splash screen
  if (licenseState === 'INITIALIZING' || licenseState === 'LICENSE_CHECKING') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 space-y-4 font-mono">
        <img src={brandAssets.logoIcon} alt="Bird Academy" className="w-16 h-16 animate-pulse object-contain" />
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


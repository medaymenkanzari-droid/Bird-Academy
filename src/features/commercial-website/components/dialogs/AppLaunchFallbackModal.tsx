/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — NATIVE APP LAUNCH FALLBACK MODAL
 * 
 * Clean, user-friendly, non-technical modal proposed when native application
 * cannot be automatically launched via protocol handler.
 * Fully internationalized (FR, EN, ES, IT, AR) with native RTL support.
 */

import React, { useEffect } from 'react';
import { ClientPlatform } from '../../services/AppLaunchService';
import { useWebLanguage } from '../../i18n';
import { Monitor, Smartphone, Download, X, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

export interface AppLaunchFallbackModalProps {
  isOpen: boolean;
  platform: ClientPlatform;
  downloadUrl: string;
  filename: string;
  onClose: () => void;
  onContinueWeb: () => void;
  onNavigateToDownloads: () => void;
}

export const AppLaunchFallbackModal: React.FC<AppLaunchFallbackModalProps> = ({
  isOpen,
  platform,
  downloadUrl,
  filename,
  onClose,
  onContinueWeb,
  onNavigateToDownloads,
}) => {
  const { t, isRtl } = useWebLanguage();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWindows = platform === 'windows';
  const isAndroid = platform === 'android';

  const title = isWindows
    ? t('appLaunch.titleWinNotDetected')
    : isAndroid
    ? t('appLaunch.titleAndroidNotDetected')
    : t('appLaunch.titleGeneric');

  const description = isWindows
    ? t('appLaunch.descWin')
    : isAndroid
    ? t('appLaunch.descAndroid')
    : t('appLaunch.descGeneric');

  const downloadLabel = isWindows
    ? t('appLaunch.downloadWinSetup')
    : isAndroid
    ? t('appLaunch.downloadAndroidApk')
    : t('appLaunch.downloadGeneric');

  const PlatformIcon = isWindows ? Monitor : isAndroid ? Smartphone : Shield;
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleDownloadClick = () => {
    if (downloadUrl.startsWith('#')) {
      onNavigateToDownloads();
      onClose();
      return;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-launch-fallback-title"
      data-testid="app-launch-fallback-modal"
    >
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-start"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer`}
          aria-label={t('appLaunch.closeDialog')}
          data-testid="fallback-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <PlatformIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3
              id="app-launch-fallback-title"
              className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug"
            >
              {title}
            </h3>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              {t('appLaunch.recommendedBadge')}
            </span>
          </div>
        </div>

        {/* Informative message */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Highlights banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-medium">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>{t('appLaunch.nativeBenefitsTitle')}</span>
          </div>
          <ul className={`list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 ${isRtl ? 'mr-1' : 'ml-1'}`}>
            <li>{t('appLaunch.benefitOffline')}</li>
            <li>{t('appLaunch.benefitStorage')}</li>
            <li>{t('appLaunch.benefitPerformance')}</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary: Download recommended binary */}
          <button
            type="button"
            onClick={handleDownloadClick}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            data-testid="fallback-modal-btn-download"
          >
            <Download className="w-4 h-4" />
            <span>{downloadLabel}</span>
          </button>

          {/* Secondary: Continue with Web version */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onContinueWeb();
            }}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            data-testid="fallback-modal-btn-web"
          >
            <span>{t('appLaunch.continueWeb')}</span>
            <ArrowIcon className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Tertiary: Go to download center */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToDownloads();
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              data-testid="fallback-modal-btn-all-downloads"
            >
              {t('appLaunch.viewAllDownloads')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

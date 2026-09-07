/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — LICENSE GUIDE PAGE
 */

import React from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { 
  Key, FileCode, QrCode, ShieldCheck, CheckCircle2, 
  ArrowRight, ArrowLeft, RefreshCw, Layers, Lock, HardDrive 
} from 'lucide-react';

export interface WebLicenseGuidePageProps {
  onNavigate: (route: WebRoute) => void;
}

export const WebLicenseGuidePage: React.FC<WebLicenseGuidePageProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16"
      data-testid="web-license-guide-page"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          Technologie Souveraine LMSE
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('licenseGuide.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          {t('licenseGuide.subtitle')}
        </p>
      </div>

      {/* What is LMSE */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('licenseGuide.whatIsTitle')}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t('licenseGuide.whatIsText')}
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono">
          Chaîne d'Autorité Déterministe : LMSE LICENSE → VALIDATION LOCALE → STATUT → CAPACITÉS → INTERFACE
        </div>
      </div>

      {/* 3 Activation Methods */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white text-center">
          Les 3 Méthodes d'Activation dans Bird Academy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Method 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('licenseGuide.method1Title')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('licenseGuide.method1Text')}
            </p>
          </div>

          {/* Method 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('licenseGuide.method2Title')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('licenseGuide.method2Text')}
            </p>
          </div>

          {/* Method 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('licenseGuide.method3Title')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('licenseGuide.method3Text')}
            </p>
          </div>

        </div>
      </div>

      {/* Upgrades & Lifecycle */}
      <div className="p-8 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('licenseGuide.lifecycleTitle')}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {t('licenseGuide.upgradeText')}
        </p>
      </div>

      {/* CTA to Pricing */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={() => onNavigate('pricing')}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Choisir une Édition Commerciale</span>
          <ArrowIcon className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

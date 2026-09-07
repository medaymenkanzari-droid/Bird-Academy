/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — OFFLINE GUARANTEE SECTION
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { HardDrive, Cpu, WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineGuaranteeSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  return (
    <section 
      className="py-16 sm:py-24 bg-slate-950 text-white border-b border-slate-800 transition-colors"
      data-testid="offline-guarantee-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            {t('offline.badge')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('offline.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-normal">
            {t('offline.subtitle')}
          </p>
        </div>

        {/* 3 Offline Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Pillar 1 */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('offline.card1Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t('offline.card1Desc')}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('offline.card2Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t('offline.card2Desc')}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('offline.card3Title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t('offline.card3Desc')}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

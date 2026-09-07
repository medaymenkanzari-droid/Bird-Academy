/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — BIRD INTELLIGENCE SECTION
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { BrainCircuit, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';

export const BirdIntelligenceSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  return (
    <section 
      className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="bird-intelligence-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text Description */}
          <div className="space-y-6">
            <span className="text-xs font-black tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
              {t('intelligence.badge')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {t('intelligence.title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('intelligence.desc')}
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>{t('intelligence.point1')}</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>{t('intelligence.point2')}</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>{t('intelligence.point3')}</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>{t('intelligence.point4')}</span>
              </li>
            </ul>
          </div>

          {/* Right: Technical Diagram Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white">Moteur Analytique Déterministe</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Zero Cloud Sync
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Score de Fertilité Prédictif</span>
                  <span className="font-bold text-white text-base">94.8% — Excellent</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Coefficient de Consanguinité</span>
                  <span className="font-bold text-cyan-400 text-base">F = 0.0156 (Sécurisé)</span>
                </div>
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Diagnostic Biologique</span>
                  <span className="font-bold text-emerald-400 text-base">0 anomalie détectée</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

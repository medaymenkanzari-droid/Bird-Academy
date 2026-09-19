/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — CORE ENGINES GRID SECTION
 * The 4 Pillar Technological Engines (Wright, Reproduction, Banding, Offline).
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { Dna, CalendarCheck, Award, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export const CoreEnginesGridSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  const engines = [
    {
      id: 'wright',
      icon: Dna,
      titleKey: 'coreEngines.engine1Title',
      descKey: 'coreEngines.engine1Desc',
      metricKey: 'coreEngines.engine1Metric',
      color: 'indigo',
      accentColor: '#2e3a8c',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-[#2e3a8c] dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    },
    {
      id: 'breeding',
      icon: CalendarCheck,
      titleKey: 'coreEngines.engine2Title',
      descKey: 'coreEngines.engine2Desc',
      metricKey: 'coreEngines.engine2Metric',
      color: 'amber',
      accentColor: '#ffc107',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    },
    {
      id: 'banding',
      icon: Award,
      titleKey: 'coreEngines.engine3Title',
      descKey: 'coreEngines.engine3Desc',
      metricKey: 'coreEngines.engine3Metric',
      color: 'emerald',
      accentColor: '#10b981',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'offline',
      icon: ShieldCheck,
      titleKey: 'coreEngines.engine4Title',
      descKey: 'coreEngines.engine4Desc',
      metricKey: 'coreEngines.engine4Metric',
      color: 'slate',
      accentColor: '#2e3a8c',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    },
  ];

  return (
    <section 
      className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="core-engines-grid-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#2e3a8c] dark:text-indigo-400" />
            <span>{t('coreEngines.tag')}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('coreEngines.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal">
            {t('coreEngines.subtitle')}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {engines.map((engine) => {
            const Icon = engine.icon;

            return (
              <div
                key={engine.id}
                className="relative rounded-3xl p-6 sm:p-7 bg-[#f7f9fb] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                data-testid={`core-engine-card-${engine.id}`}
              >
                <div className="space-y-4">
                  {/* Top Bar with Icon and Metric Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#2e3a8c] dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${engine.badgeBg}`}>
                      {t(engine.metricKey)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#2e3a8c] dark:group-hover:text-indigo-400 transition-colors">
                      {t(engine.titleKey)}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {t(engine.descKey)}
                    </p>
                  </div>
                </div>

                {/* Card Footer Pill */}
                <div className="pt-5 mt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Moteur Déterministe</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

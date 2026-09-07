/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — FEATURES GRID SECTION
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { 
  Bird, Grid, Heart, Activity, Dna, BrainCircuit, Sparkles, DollarSign 
} from 'lucide-react';

export const FeaturesGridSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  const features = [
    {
      icon: Bird,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      titleKey: 'features.birdsTitle',
      descKey: 'features.birdsDesc',
    },
    {
      icon: Grid,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      titleKey: 'features.habitatTitle',
      descKey: 'features.habitatDesc',
    },
    {
      icon: Heart,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      titleKey: 'features.breedingTitle',
      descKey: 'features.breedingDesc',
    },
    {
      icon: Activity,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      titleKey: 'features.healthTitle',
      descKey: 'features.healthDesc',
    },
    {
      icon: Dna,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      titleKey: 'features.geneticsTitle',
      descKey: 'features.geneticsDesc',
    },
    {
      icon: BrainCircuit,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
      titleKey: 'features.intelligenceTitle',
      descKey: 'features.intelligenceDesc',
    },
    {
      icon: Sparkles,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
      titleKey: 'features.assistantTitle',
      descKey: 'features.assistantDesc',
    },
    {
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      titleKey: 'features.financeTitle',
      descKey: 'features.financeDesc',
    },
  ];

  return (
    <section 
      id="features" 
      className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="features-grid-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
            {t('features.badge')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('features.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t('features.subtitle')}
          </p>
        </div>

        {/* 4x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t(feat.titleKey)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(feat.descKey)}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

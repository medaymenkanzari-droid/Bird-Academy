/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — PUBLIC TEST & FIELD RECEPTION SECTION
 * Neutral, factual presentation of Bird Academy in its public testing phase.
 * Zero fictitious testimonials or unverified social proof.
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { ShieldCheck, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export const ExpertTestimonialSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  return (
    <section 
      className="py-16 sm:py-24 bg-[#f7f9fb] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors"
      data-testid="expert-testimonial-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2e3a8c] dark:text-indigo-400" />
            <span>{t('expertTestimonial.tag')}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('expertTestimonial.title')}
          </h2>
        </div>

        {/* Presentation Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left: Aviary Setting Photo Frame (5 cols on desktop) */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[340px] overflow-hidden">
              <img 
                src="./assets/images/expert-aviary.jpg" 
                alt="Environnement de volière moderne et suivi d'élevage" 
                className="w-full h-full object-cover object-center"
                loading="lazy"
                data-testid="expert-aviary-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/40" />

              {/* Floating Badge on Photo */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/60 dark:border-slate-700 shadow-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{t('expertTestimonial.badgeAviary')}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-[#2e3a8c] dark:text-indigo-300 font-bold">
                  {t('expertTestimonial.badgePhase')}
                </span>
              </div>
            </div>

            {/* Right: Neutral, Honest Presentation of Application in Test Phase (7 cols on desktop) */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-6">
              
              {/* Status Pill */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('expertTestimonial.statusBadge')}</span>
                </div>
                <Layers className="w-6 h-6 text-indigo-200 dark:text-indigo-900/60 shrink-0" />
              </div>

              {/* Factual Description */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                  {t('expertTestimonial.text1')}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t('expertTestimonial.text2')}
                </p>
              </div>

              {/* Test Phase Collaboration Callout */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t('expertTestimonial.cardFooter')}
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                  <span>BUILD_ID : BA-V1.3.6</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

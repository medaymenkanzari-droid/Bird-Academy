/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — EXPERT TESTIMONIAL SECTION
 * Immersive aviary setting featuring COM International Judge Jean-Marc Valenti.
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { Star, Award, ShieldCheck, Quote, CheckCircle2 } from 'lucide-react';

export const ExpertTestimonialSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  return (
    <section 
      className="py-16 sm:py-24 bg-[#f7f9fb] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors"
      data-testid="expert-testimonial-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-amber-200/20 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs font-black tracking-widest text-[#ffc107] uppercase bg-amber-50 dark:bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#ffc107]" />
            <span>{t('expertTestimonial.tag')}</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('expertTestimonial.title')}
          </h2>
        </div>

        {/* Immersive Testimonial Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left: Professional Aviary Photo Frame (5 cols on desktop) */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[340px] overflow-hidden">
              <img 
                src="./assets/images/expert-aviary.jpg" 
                alt="Jean-Marc Valenti dans une volière moderne d'élevage d'élite" 
                className="w-full h-full object-cover object-center"
                loading="lazy"
                data-testid="expert-aviary-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/40" />

              {/* Floating Badge on Photo */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/60 dark:border-slate-700 shadow-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ffc107]" />
                  <span className="font-bold text-slate-900 dark:text-white">{t('expertTestimonial.badgeCom')}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                  35 Ans d'Expérience
                </span>
              </div>
            </div>

            {/* Right: Expert Quote & Credentials (7 cols on desktop) */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-6">
              
              {/* Quote Icon & 5 Stars */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#ffc107]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 fill-[#ffc107]" />
                  ))}
                  <span className="ml-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {t('expertTestimonial.ratingText')}
                  </span>
                </div>
                <Quote className="w-8 h-8 text-indigo-200 dark:text-indigo-900/60 shrink-0" />
              </div>

              {/* Official Quote */}
              <blockquote className="text-base sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic">
                {t('expertTestimonial.quote')}
              </blockquote>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-[#2e3a8c] dark:text-indigo-400">
                    {t('expertTestimonial.author')}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {t('expertTestimonial.role')}
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-[#2e3a8c] dark:text-indigo-300 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Protocole Élite Validé</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

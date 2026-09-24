/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — HERO SECTION (AVIAN PRECISION IMMERSIVE)
 * Split-screen showcase featuring champion show canary visual with glassmorphic badges.
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { 
  Download, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, 
  Award, Sparkles, Lock, Cpu, HeartPulse, Activity
} from 'lucide-react';

export interface HeroSectionProps {
  onNavigate: (route: WebRoute) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section 
      className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-[#f7f9fb] dark:bg-slate-950 transition-colors"
      data-testid="hero-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-200/25 dark:bg-amber-900/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & Metrics (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            
            {/* Sovereign Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 dark:bg-indigo-950/60 text-[#2e3a8c] dark:text-indigo-300 border border-slate-200 dark:border-indigo-800/80 shadow-xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#ffc107] animate-pulse" />
              <span>{t('hero.badge')}</span>
              <Lock className="w-3.5 h-3.5 text-[#2e3a8c] dark:text-indigo-300 ml-0.5" />
            </div>

            {/* Elite H1 Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              {t('hero.title')}
            </h1>

            {/* Subtitle / Descriptive Paragraph */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* 3 Key Metrics of Excellence */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 pb-2 max-w-lg mx-auto lg:mx-0">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-sm text-center">
                <div className="text-xl sm:text-2xl font-black text-[#2e3a8c] dark:text-indigo-400">
                  {t('hero.breedersCount')}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                  {t('hero.breedersLabel')}
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-sm text-center">
                <div className="text-xl sm:text-2xl font-black text-[#ffc107]">
                  {t('hero.birdsCount')}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                  {t('hero.birdsLabel')}
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-sm text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {t('hero.wrightCount')}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                  {t('hero.wrightLabel')}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('download')}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#2e3a8c] hover:bg-[#1e265c] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-indigo-950/20 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                data-testid="hero-cta-download"
              >
                <Download className="w-5 h-5 text-[#ffc107]" />
                <span>{t('hero.ctaDownload')}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('pricing')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm sm:text-base rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                data-testid="hero-cta-pricing"
              >
                <span>{t('hero.ctaPricing')}</span>
                <ArrowIcon className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400" />
              </button>
            </div>

            {/* Trust Signals */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400" />
                <span>{t('hero.trustNoCard')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400" />
                <span>{t('hero.trustOffline')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400" />
                <span>{t('hero.trustLocalDb')}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Prestige Photographic Showcase (5 cols on desktop) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Photo Frame with Outer Glow */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
                <img 
                  src="./assets/images/champion-canary.jpg" 
                  alt="Canari Lipochrome Jaune Mosaïque - Exemple illustratif de fiche sujet" 
                  className="w-full h-auto aspect-square object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  data-testid="hero-champion-canary-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Photo Caption */}
                <div className="absolute bottom-3 inset-x-3 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/40 dark:border-slate-700/60 shadow-lg text-slate-900 dark:text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#ffc107]" />
                    <div>
                      <div className="text-xs font-black tracking-tight leading-none">
                        Canari Lipochrome Jaune Mosaïque
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                        Exemple Illustratif • Fiche Sujet
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#ffc107]/20 text-amber-900 dark:text-amber-300 border border-[#ffc107]/40">
                    Critères COM
                  </span>
                </div>
              </div>

              {/* Overlaid Badge 1: Top-Left (Champion de Posture • Bague FFO-2024-892) */}
              <div className="absolute -top-4 -left-2 sm:-left-4 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-2.5 transform -rotate-1 hover:rotate-0 transition-transform max-w-[260px]">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-[#ffc107]" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {t('hero.badgeRing')}
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    {t('hero.badgeRingSub')}
                  </div>
                </div>
              </div>

              {/* Overlaid Badge 2: Top-Right (Standard scoring example) */}
              <div className="absolute top-8 -right-2 sm:-right-4 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-2 transform rotate-2 hover:rotate-0 transition-transform">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-[#ffc107]" />
                </div>
                <div className="text-end">
                  <div className="text-xs font-black text-slate-900 dark:text-white leading-none">
                    {t('hero.badgeScore')}
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    {t('hero.badgeScoreSub')}
                  </div>
                </div>
              </div>

              {/* Overlaid Badge 3: Middle-Left (Wright (F) = 0.8% • Accouplement recommandé) */}
              <div className="hidden sm:flex absolute bottom-24 -left-6 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl items-center gap-2.5 transform rotate-1 hover:rotate-0 transition-transform max-w-[270px]">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>{t('hero.badgeWright')}</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {t('hero.badgeWrightSub')}
                  </div>
                </div>
              </div>

              {/* Overlaid Badge 4: Bottom-Right (AES-256 Scellé) */}
              <div className="absolute -bottom-4 -right-2 sm:-right-4 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md border border-slate-700 shadow-2xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2e3a8c] text-white flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-[#ffc107]" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold tracking-wider text-[#ffc107]">
                    {t('hero.badgeSecurity')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t('hero.badgeSecuritySub')}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

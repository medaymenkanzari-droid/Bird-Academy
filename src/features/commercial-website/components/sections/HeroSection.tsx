/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — HERO SECTION (AVIAN PRECISION)
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { Download, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Database, Brain, Sparkles, Microchip } from 'lucide-react';

export interface HeroSectionProps {
  onNavigate: (route: WebRoute) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section 
      className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-[#f7f9fb] to-[#f7f9fb] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      data-testid="hero-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-7">
          
          {/* Sovereign Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#f0f3fa] dark:bg-indigo-950/60 text-[#2e3a8c] dark:text-indigo-300 border border-[#c2d0f0] dark:border-indigo-800 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Strong Value Proposition Headline (Centered) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            {t('hero.title')}
          </h1>

          {/* Crisp Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTA Button Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('download')}
              className="px-8 py-4 bg-[#2e3a8c] hover:bg-[#1e265c] text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-950/20 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              data-testid="hero-cta-download"
            >
              <Download className="w-5 h-5 text-[#ffc107]" />
              <span>{t('hero.ctaDownload')}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              data-testid="hero-cta-pricing"
            >
              <span>{t('hero.ctaPricing')}</span>
              <ArrowIcon className="w-4 h-4 text-[#2e3a8c]" />
            </button>
          </div>

          {/* Trust Signals */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2e3a8c]" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2e3a8c]" />
              <span>100% Hors-Ligne</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2e3a8c]" />
              <span>Données locales chiffrées</span>
            </div>
          </div>

          {/* Modern Dashboard Preview Showcase */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-start">
              
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#ffc107] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 font-mono">Bird Academy Enterprise — Avian Precision Core</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f0f3fa] dark:bg-indigo-950 text-[#2e3a8c] dark:text-indigo-300 border border-[#c2d0f0] dark:border-indigo-800">
                  <span className="w-2 h-2 rounded-full bg-[#2e3a8c] animate-pulse"></span>
                  Mode Autonome Actif (SQLite)
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cheptel Actif</div>
                  <div className="text-2xl font-black mt-1">48 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Oiseaux</span></div>
                  <div className="text-[11px] font-bold text-[#2e3a8c] dark:text-indigo-400 mt-1">✓ 100% Bagués</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Couples en Ponte</div>
                  <div className="text-2xl font-black mt-1">12 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Couples</span></div>
                  <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">● 96% Fertilité</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Consanguinité Wright</div>
                  <div className="text-2xl font-black text-[#2e3a8c] dark:text-indigo-400 mt-1">0.00%</div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">Sécurité Optimale</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#f7f9fb] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Licence LMSE</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">Scellée</div>
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">Signatures ECDSA</div>
                </div>
              </div>

              {/* Insight Box */}
              <div className="p-4 rounded-2xl bg-[#f0f3fa] dark:bg-indigo-950/30 border border-[#c2d0f0] dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#2e3a8c] text-white flex items-center justify-center font-bold">
                    <Microchip className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#2e3a8c] dark:text-indigo-300 block font-bold">Bird Intelligence Index (94%)</strong>
                    <span className="text-slate-700 dark:text-slate-300">Prochaine ponte Cage B-04 dans 48h. Mirage 6 œufs certifiés fécondés.</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-[#2e3a8c] dark:text-indigo-300 font-bold border border-[#c2d0f0] dark:border-indigo-800 text-[11px] shrink-0">
                  Calculateur Déterministe
                </span>
              </div>

              {/* Sovereign Storage Footer */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <Database className="w-4 h-4 text-[#ffc107]" />
                  Base Locale SQLite Souveraine Scellée
                </span>
                <span className="text-[11px] font-mono text-slate-400">Zéro Serveur Cloud</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

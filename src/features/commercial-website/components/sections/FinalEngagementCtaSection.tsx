/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — FINAL ENGAGEMENT CTA SECTION
 * Enveloping deep indigo banner with dual action for 30-day evaluation & lifetime license.
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { Download, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Laptop, Smartphone, Globe } from 'lucide-react';

export interface FinalEngagementCtaSectionProps {
  onNavigate: (route: WebRoute) => void;
}

export const FinalEngagementCtaSection: React.FC<FinalEngagementCtaSectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section 
      className="py-16 sm:py-24 bg-[#f7f9fb] dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors"
      data-testid="final-engagement-cta-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Indigo Banner Card */}
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#2e3a8c] via-[#242e70] to-[#1a2152] text-white shadow-2xl border border-indigo-500/20 overflow-hidden">
          
          {/* Background Ambient Circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-[#ffc107] shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#ffc107]" />
              <span>{t('finalCta.badge')}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {t('finalCta.title')}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-indigo-100 font-normal leading-relaxed max-w-2xl mx-auto">
              {t('finalCta.subtitle')}
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('download')}
                className="w-full sm:w-auto px-8 py-4 bg-[#ffc107] hover:bg-[#ffb300] text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5"
                data-testid="final-cta-download"
              >
                <Download className="w-5 h-5" />
                <span>{t('finalCta.ctaDownload')}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('pricing')}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base rounded-2xl border border-white/30 backdrop-blur-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                data-testid="final-cta-pricing"
              >
                <ShieldCheck className="w-5 h-5 text-[#ffc107]" />
                <span>{t('finalCta.ctaBuy')}</span>
                <ArrowIcon className="w-4 h-4 text-white ml-1" />
              </button>
            </div>

            {/* Reassurance & OS Compatibility */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-indigo-200">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#ffc107]" />
                <Smartphone className="w-4 h-4 text-[#ffc107]" />
                <span>{t('finalCta.platformsNote')}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-amber-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t('finalCta.trialGuarantee')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

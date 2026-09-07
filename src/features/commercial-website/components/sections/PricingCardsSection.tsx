import React from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { useLocalizedOffers } from '../../hooks/useLocalizedOffers';
import { Check, ArrowRight, ArrowLeft, Star, Infinity, Minus } from 'lucide-react';

export interface PricingCardsSectionProps {
  onNavigate: (route: WebRoute, offerId?: string) => void;
}

export const PricingCardsSection: React.FC<PricingCardsSectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const { offers } = useLocalizedOffers();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleSelectOffer = (offerId: string) => {
    if (offerId === 'OFFER-FREE-COMMUNITY') {
      onNavigate('download');
    } else {
      onNavigate('checkout', offerId);
    }
  };

  const freeOffer = offers.find(o => o.id === 'OFFER-FREE-COMMUNITY') || offers[0];
  const premOffer = offers.find(o => o.id === 'OFFER-PREMIUM-ANNUAL-2026') || offers[1];
  const proAnnualOffer = offers.find(o => o.id === 'OFFER-PRO-ENTERPRISE-ANNUAL-2026') || offers[2];
  const proLifeOffer = offers.find(o => o.id === 'OFFER-PRO-ENTERPRISE-LIFETIME') || offers[3];

  return (
    <section 
      id="pricing" 
      className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="pricing-cards-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-[#f0f3fa] dark:bg-indigo-950 px-3.5 py-1 rounded-full">
            {t('pricing.badge')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('pricing.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* 1. FREE Community */}
          {freeOffer && (
            <div className="p-7 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-6 shadow-sm" data-testid="pricing-card-free">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{freeOffer.name}</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{freeOffer.priceFormatted}</div>
                  <div className="text-xs text-[#2e3a8c] dark:text-indigo-400 font-bold">{freeOffer.period}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">{freeOffer.description}</p>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                  {freeOffer.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectOffer(freeOffer.id)}
                className="w-full py-3 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                data-testid="pricing-btn-free"
              >
                {freeOffer.ctaLabel}
              </button>
            </div>
          )}

          {/* 2. PREMIUM Passion (FEATURED & HIGHLIGHTED) */}
          {premOffer && (
            <div className="relative transform lg:scale-105 z-10 p-7 rounded-3xl bg-white dark:bg-slate-800 border-2 border-[#2e3a8c] dark:border-indigo-500 flex flex-col justify-between space-y-6 shadow-xl shadow-indigo-950/15" data-testid="pricing-card-premium">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ffc107] text-[#0f172a] shadow-md flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3 h-3 fill-current text-[#0f172a]" />
                <span>{premOffer.badge.toUpperCase()}</span>
              </div>
              
              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2e3a8c] dark:text-indigo-400">{premOffer.name}</div>
                  <div className="text-3xl sm:text-4xl font-black text-[#2e3a8c] dark:text-indigo-400">{premOffer.priceFormatted}</div>
                  <div className="text-xs text-[#2e3a8c] dark:text-indigo-300 font-bold">{premOffer.period}</div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 pt-1 leading-relaxed font-medium">{premOffer.description}</p>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-indigo-100 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium">
                  {premOffer.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-medium">
                      <Check className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectOffer(premOffer.id)}
                className="w-full py-3.5 bg-[#2e3a8c] hover:bg-[#1e265c] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-950/25 transition cursor-pointer"
                data-testid="pricing-btn-premium"
              >
                {premOffer.ctaLabel}
              </button>
            </div>
          )}

          {/* 3. PRO Enterprise (Annual) */}
          {proAnnualOffer && (
            <div className="p-7 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-6 shadow-sm" data-testid="pricing-card-pro">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{proAnnualOffer.name}</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{proAnnualOffer.priceFormatted}</div>
                  <div className="text-xs text-[#2e3a8c] dark:text-indigo-400 font-bold">{proAnnualOffer.period}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">{proAnnualOffer.description}</p>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                  {proAnnualOffer.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectOffer(proAnnualOffer.id)}
                className="w-full py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition cursor-pointer"
                data-testid="pricing-btn-pro"
              >
                {proAnnualOffer.ctaLabel}
              </button>
            </div>
          )}

          {/* 4. PRO Lifetime */}
          {proLifeOffer && (
            <div className="p-7 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-6 shadow-sm" data-testid="pricing-card-lifetime">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    <Infinity className="w-3 h-3" />
                    <span>{proLifeOffer.badge}</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{proLifeOffer.priceFormatted}</div>
                  <div className="text-xs text-[#2e3a8c] dark:text-indigo-400 font-bold">{proLifeOffer.period}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">{proLifeOffer.description}</p>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                  {proLifeOffer.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectOffer(proLifeOffer.id)}
                className="w-full py-3 bg-[#2e3a8c] hover:bg-[#1e265c] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                data-testid="pricing-btn-lifetime"
              >
                {proLifeOffer.ctaLabel}
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

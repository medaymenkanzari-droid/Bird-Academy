/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — PRODUCT DETAIL PAGE (FREE, PREMIUM, PRO)
 */

import React from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { useLocalizedOffers } from '../hooks/useLocalizedOffers';
import { 
  Shield, Zap, Crown, Check, ArrowRight, ArrowLeft, Download, ShoppingBag, Cpu 
} from 'lucide-react';

export interface WebProductDetailPageProps {
  tier: 'FREE' | 'PREMIUM' | 'PRO';
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebProductDetailPage: React.FC<WebProductDetailPageProps> = ({ tier, onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const { offers } = useLocalizedOffers();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const matchingOffer = offers.find(o => o.tier === tier && !o.isLifetime) || 
                        offers.find(o => o.tier === tier) || 
                        offers[0];

  const lifetimeOffer = tier === 'PRO' ? offers.find(o => o.isLifetime) : null;

  const Icon = matchingOffer.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12" data-testid={`product-detail-page-${tier}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="hover:text-indigo-600 cursor-pointer"
        >
          {t('nav.products')}
        </button>
        <span>/</span>
        <span className="text-indigo-600 dark:text-indigo-400">{matchingOffer.name}</span>
      </div>

      {/* Hero Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
              <Icon className="w-4 h-4" />
              <span>{matchingOffer.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {matchingOffer.name}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{matchingOffer.priceFormatted}</div>
            <div className="text-xs text-slate-500">{matchingOffer.period}</div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {matchingOffer.description}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => onNavigate(matchingOffer.ctaRoute, matchingOffer.id)}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            data-testid="product-detail-primary-cta"
          >
            {tier === 'FREE' ? <Download className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            <span>{matchingOffer.ctaLabel}</span>
          </button>

          {lifetimeOffer && (
            <button
              type="button"
              onClick={() => onNavigate('checkout', lifetimeOffer.id)}
              className="px-6 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              data-testid="product-detail-lifetime-cta"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{lifetimeOffer.ctaLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('pricing')}
            className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-200 transition cursor-pointer text-center"
          >
            {t('pricing.comparisonTitle')}
          </button>
        </div>
      </div>

      {/* 2-Column Details: Advantages & Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Advantages */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-500" />
            <span>{t('products.advantagesHeading')}</span>
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {matchingOffer.advantages.map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limits & Scope */}
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t('products.limitsHeading')}
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {matchingOffer.limits.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2"></span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Hardware Compatibility */}
      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <Cpu className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            {t('products.compatHeading')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('products.compatText')}
          </p>
        </div>
      </div>

    </div>
  );
};

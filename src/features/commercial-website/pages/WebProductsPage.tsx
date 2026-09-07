/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — PRODUCTS PAGE
 */

import React from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { useLocalizedOffers } from '../hooks/useLocalizedOffers';
import { Check, ArrowRight, ArrowLeft, Download, ShoppingBag } from 'lucide-react';

export interface WebProductsPageProps {
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebProductsPage: React.FC<WebProductsPageProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const { offers } = useLocalizedOffers();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16" data-testid="web-products-page" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          {t('products.title')}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('products.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          {t('products.subtitle')}
        </p>
      </div>

      {/* 4 Detailed Edition Rows */}
      <div className="space-y-8">
        {offers.map((card) => {
          const Icon = card.icon;
          const cardKey = card.isLifetime ? 'PRO_LIFETIME' : card.tier;
          return (
            <div
              key={card.id}
              className={`p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 border transition grid grid-cols-1 lg:grid-cols-3 gap-8 items-center ${
                card.isPopular
                  ? 'border-2 border-indigo-600 dark:border-indigo-500 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
              }`}
              data-testid={`product-tier-card-${cardKey}`}
            >
              {/* Left Column: Title & Overview */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                  <Icon className="w-4 h-4" />
                  <span>{card.badge}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {card.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.description}
                </p>
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {card.priceFormatted}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {card.period}
                  </div>
                </div>
              </div>

              {/* Middle Column: Features List */}
              <div className="space-y-2 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-slate-700/80 py-4 lg:py-0 lg:px-8">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block mb-3">
                  {t('products.advantagesHeading')} :
                </span>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {card.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Actions */}
              <div className="space-y-3 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => onNavigate(card.ctaRoute, card.id)}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  data-testid={`product-cta-btn-${cardKey}`}
                >
                  {card.ctaRoute === 'download' ? <Download className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{card.ctaLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate(card.detailsRoute, card.id)}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  data-testid={`product-details-btn-${cardKey}`}
                >
                  <span>{t('products.viewDetails')}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — PRICING & COMPARISON PAGE
 */

import React from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { PricingCardsSection } from '../components/sections/PricingCardsSection';
import { ComparisonTableSection } from '../components/sections/ComparisonTableSection';
import { FAQAccordionSection } from '../components/sections/FAQAccordionSection';
import { CurrencySelector } from '../components/layout/CurrencySelector';
import { Coins, HelpCircle } from 'lucide-react';

export interface WebPricingPageProps {
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebPricingPage: React.FC<WebPricingPageProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();

  return (
    <div className="space-y-0" data-testid="web-pricing-page" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Banner with Currency Selector */}
      <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
            <Coins className="w-4 h-4 text-indigo-500" />
            <span>Tous les tarifs indiqués sont fermes et sans frais cachés.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Devise :</span>
            <CurrencySelector />
          </div>
        </div>
      </div>

      {/* Main Pricing Cards */}
      <PricingCardsSection onNavigate={onNavigate} />

      {/* Full Comparison Table Matrix */}
      <ComparisonTableSection />

      {/* Pricing-specific FAQ */}
      <FAQAccordionSection onNavigate={onNavigate} />

    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — COMPARISON TABLE SECTION (AVIAN PRECISION)
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { Check, Minus } from 'lucide-react';

export const ComparisonTableSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  const rows = [
    {
      feature: t('pricing.rowBirdsQuota'),
      free: '50 max',
      premium: 'Illimité',
      pro: 'Illimité',
      lifetime: 'Illimité',
      highlight: true,
    },
    {
      feature: t('pricing.rowWright'),
      free: null,
      premium: 'Inclus',
      pro: 'Avancé',
      lifetime: 'Avancé',
    },
    {
      feature: 'Moteur Bird Intelligence (Alertes & Scores)',
      free: null,
      premium: null,
      pro: 'Complet',
      lifetime: 'Complet',
    },
    {
      feature: t('pricing.rowAIQuota'),
      free: '10 req/j',
      premium: '100 req/j',
      pro: 'Illimité',
      lifetime: 'Illimité',
    },
    {
      feature: t('pricing.rowDevices'),
      free: '1 poste',
      premium: '3 postes',
      pro: '5 postes',
      lifetime: '5 postes',
    },
    {
      feature: 'Passeports Biologiques & Rapports PDF',
      free: null,
      premium: 'Standard',
      pro: 'Illimité',
      lifetime: 'Illimité',
    },
    {
      feature: t('pricing.rowOffline'),
      free: '100% Hors-ligne',
      premium: '100% Hors-ligne',
      pro: '100% Hors-ligne',
      lifetime: '100% Hors-ligne',
      highlight: true,
    },
    {
      feature: t('pricing.rowSupport'),
      free: 'Standard',
      premium: 'Standard',
      pro: 'Prioritaire',
      lifetime: 'VIP < 24h',
    },
  ];

  return (
    <section 
      className="py-16 sm:py-24 bg-[#f7f9fb] dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="comparison-table-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('pricing.comparisonTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t('pricing.comparisonSubtitle')}
          </p>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300 w-2/5">
                  {t('pricing.colFeature')}
                </th>
                <th className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 text-center w-[15%]">
                  {t('pricing.colFree')}
                </th>
                <th className="py-4 px-4 font-bold text-[#2e3a8c] dark:text-indigo-400 text-center w-[15%] bg-[#f0f3fa] dark:bg-indigo-950/30">
                  {t('pricing.colPremium')}
                </th>
                <th className="py-4 px-4 font-bold text-slate-900 dark:text-white text-center w-[15%]">
                  {t('pricing.colPro')}
                </th>
                <th className="py-4 px-4 font-bold text-amber-800 dark:text-amber-400 text-center w-[15%]">
                  Lifetime
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {rows.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition ${
                    row.highlight ? 'bg-slate-50/40 dark:bg-slate-800/20 font-semibold' : ''
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-400">
                    {row.free === null ? <Minus className="w-4 h-4 text-slate-300 mx-auto" /> : row.free}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-[#2e3a8c] dark:text-indigo-400 bg-[#f0f3fa]/50 dark:bg-indigo-950/20">
                    {row.premium === null ? <Minus className="w-4 h-4 text-slate-300 mx-auto" /> : row.premium}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-900 dark:text-white">
                    {row.pro === null ? <Minus className="w-4 h-4 text-slate-300 mx-auto" /> : row.pro}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-amber-700 dark:text-amber-400">
                    {row.lifetime === null ? <Minus className="w-4 h-4 text-slate-300 mx-auto" /> : row.lifetime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
};

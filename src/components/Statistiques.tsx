/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Percent, Egg, Award, Sparkles, HeartPulse, PieChart } from 'lucide-react';
import { Canari, Ponte, Depense, Vente } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { StatisticsEngine } from '../business/StatisticsEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { AnalyticsSettingsRepository } from '../features/analytics/repositories/AnalyticsSettingsRepository';
import { printDocument, exportDocumentAsPDF } from '../utils/printUtils';

interface StatistiquesProps {
  canaris: Canari[];
  pontes: Ponte[];
  depenses: Depense[];
  ventes: Vente[];
}

export default function Statistiques({
  canaris,
  pontes,
  depenses,
  ventes
}: StatistiquesProps) {
  const { t, currentLanguage, isRtl } = useLanguage();
  const userCurrency = AnalyticsSettingsRepository.getSettings().currency || 'TND';
  const snapshot = StatisticsEngine.calculate(canaris, pontes, depenses, ventes);
  const {
    fertilizedEggs: totalFecondes,
    knownFertilityEggs,
    knownHatchFertilizedEggs,
    hatchedEggs: totalEclosions,
    knownSurvivalHatchedEggs,
    weanedChicks: totalSevrages,
    fertilityRate: rateFecondation,
    hatchRate: rateEclosion,
    survivalRate: rateSurvie,
    totalExpenses,
    totalSales,
    netProfit,
    activeBirdCount,
    breedCounts,
    colorCounts,
  } = snapshot;

  const topBreeds = Object.entries(breedCounts).sort((a,b) => b[1] - a[1]);
  const topColors = Object.entries(colorCounts).sort((a,b) => b[1] - a[1]);

  const [pdfAlert, setPdfAlert] = React.useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  const handlePrint = async () => {
    setPdfAlert(null);
    try {
      printDocument('printable-area');
      const result = await exportDocumentAsPDF({
        title: t('performStatsTitle'),
        subtitle: t('performStatsSub'),
        language: currentLanguage,
        isRtl,
        sections: [
          {
            title: 'Synthèse Financière',
            metrics: [
              { label: t('statisticsRevenue'), value: `+${formatCurrency(totalSales, userCurrency, true, currentLanguage)}` },
              { label: t('globalCharges'), value: `-${formatCurrency(totalExpenses, userCurrency, true, currentLanguage)}` },
              { label: t('netMargin'), value: `${formatCurrency(netProfit, userCurrency, true, currentLanguage)}` },
            ],
          },
          {
            title: 'Taux de Reproduction & Survie',
            metrics: [
              { label: t('fecondationRate'), value: `${rateFecondation.toFixed(1)}%` },
              { label: t('hatchingRate'), value: `${rateEclosion.toFixed(1)}%` },
              { label: t('survieRate'), value: `${rateSurvie.toFixed(1)}%` },
            ],
          }
        ],
      });

      if (result.success) {
        setPdfAlert({ type: 'success', message: result.message });
      } else {
        console.error('[PDF-STAT-04] PDF export failed:', result.message);
        setPdfAlert({ type: 'danger', message: `[PDF-STAT-04] ${result.message}` });
      }
    } catch (err: any) {
      console.error('[PDF-STAT-01] PDF generation exception:', err);
      setPdfAlert({ type: 'danger', message: `[PDF-STAT-01] ${err?.message || 'Erreur d\'export PDF'}` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Print Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('performStatsTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('performStatsSub')}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs font-sans shrink-0 print:hidden"
        >
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          {currentLanguage === 'fr' ? 'Imprimer / Exporter le Rapport' : currentLanguage === 'es' ? 'Imprimir / Exportar Reporte' : currentLanguage === 'it' ? 'Stampa / Esporta Rapporto' : currentLanguage === 'ar' ? 'طباعة / تصدير التقرير' : 'Print / Export Report'}
        </button>
      </div>

      <div id="printable-area" className="space-y-6">

      {/* Financial Bento Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sales */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t('statisticsRevenue')}</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">+{formatCurrency(totalSales, userCurrency, true, currentLanguage)}</div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t('globalCharges')}</span>
            <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">-{formatCurrency(totalExpenses, userCurrency, true, currentLanguage)}</div>
          </div>
        </div>

        {/* Profit */}
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-xs flex items-center gap-4 ${
          netProfit >= 0 ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/20'
        }`}>
          <div className={`p-3 rounded-xl shrink-0 ${
            netProfit >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
          }`}>
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t('netMargin')}</span>
            <div className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {formatCurrency(netProfit, userCurrency, true, currentLanguage)}
            </div>
          </div>
        </div>
      </div>

      {/* Biological Gauges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Taux de Fécondation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Egg className="w-5 h-5" />
            </div>
            <Percent className="w-4 h-4 text-slate-300" />
          </div>
          
          <div>
            <span className="text-xs text-slate-400 font-medium block">{t('fecondationRate')}</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">{rateFecondation.toFixed(1)} %</div>
            <span className="text-[10px] text-slate-400 block mt-1">{t('fecondationStats', { fecondes: totalFecondes, total: knownFertilityEggs })}</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${rateFecondation}%` }}></div>
          </div>
        </div>

        {/* Taux d'Éclosion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <Percent className="w-4 h-4 text-slate-300" />
          </div>
          
          <div>
            <span className="text-xs text-slate-400 font-medium block">{t('hatchingRate')}</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">{rateEclosion.toFixed(1)} %</div>
            <span className="text-[10px] text-slate-400 block mt-1">{t('hatchingStats', { eclosions: totalEclosions, fecondes: knownHatchFertilizedEggs })}</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rateEclosion}%` }}></div>
          </div>
        </div>

        {/* Taux de Survie des jeunes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
              <HeartPulse className="w-5 h-5" />
            </div>
            <Percent className="w-4 h-4 text-slate-300" />
          </div>
          
          <div>
            <span className="text-xs text-slate-400 font-medium block">{t('survieRate')}</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">{rateSurvie.toFixed(1)} %</div>
            <span className="text-[10px] text-slate-400 block mt-1">{t('survieStats', { sevrages: totalSevrages, eclosions: knownSurvivalHatchedEggs })}</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${rateSurvie}%` }}></div>
          </div>
        </div>
      </div>

      {/* Demographics distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Races */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-amber-500" />
            {t('raceDistribution')}
          </h3>

          <div className="space-y-3.5">
            {topBreeds.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('noBirdRegistered')}</p>
            ) : (
              topBreeds.map(([breed, count]) => {
                const percentage = activeBirdCount > 0 ? (count / activeBirdCount) * 100 : 0;
                return (
                  <div key={breed} className="text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">{breed}</span>
                      <span className="font-bold text-slate-900">{t('birdCountLabel', { count, plural: count > 1 ? (currentLanguage === 'fr' ? 'x' : 's') : '' })} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Couleurs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 text-blue-500" />
            {t('colorMutationDistribution')}
          </h3>

          <div className="space-y-3.5">
            {topColors.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('noBirdRegistered')}</p>
            ) : (
              topColors.slice(0, 5).map(([color, count]) => {
                const percentage = activeBirdCount > 0 ? (count / activeBirdCount) * 100 : 0;
                return (
                  <div key={color} className="text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">{color}</span>
                      <span className="font-bold text-slate-900">{t('birdCountLabel', { count, plural: count > 1 ? 's' : '' })} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

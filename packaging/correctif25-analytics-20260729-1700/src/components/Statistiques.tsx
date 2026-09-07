/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Percent, Egg, Award, Sparkles, HeartPulse, PieChart } from 'lucide-react';
import { Canari, Ponte, Depense, Vente } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { StatisticsEngine } from '../business/StatisticsEngine';

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
  const { t, currentLanguage } = useLanguage();
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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t('performStatsTitle')}</h2>
        <p className="text-xs text-slate-500">
          {t('performStatsSub')}
        </p>
      </div>

      {/* Financial Bento Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t('statisticsRevenue')}</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">+{totalSales.toFixed(3)} DT</div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t('globalCharges')}</span>
            <div className="text-xl font-bold text-indigo-700 mt-1">-{totalExpenses.toFixed(3)} DT</div>
          </div>
        </div>

        {/* Profit */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center gap-4 ${
          netProfit >= 0 ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
        }`}>
          <div className={`p-3 rounded-xl shrink-0 ${
            netProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{t('netMargin')}</span>
            <div className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netProfit.toFixed(3)} DT
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
  );
}

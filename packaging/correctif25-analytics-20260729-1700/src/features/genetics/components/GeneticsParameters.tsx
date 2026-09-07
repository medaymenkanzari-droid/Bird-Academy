/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GeneticsRepository } from '../repositories/GeneticsRepository';
import { GeneticsParameters as ParamType } from '../types';
import { Settings, Save, CheckCircle2, RotateCcw, Info } from 'lucide-react';

export const GeneticsParameters: React.FC = () => {
  const [params, setParams] = useState<ParamType | null>(null);
  const [saved, setSaved] = useState(false);

  // Load params on mount
  useEffect(() => {
    const loaded = GeneticsRepository.getParameters();
    setParams(loaded);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!params) return;

    GeneticsRepository.saveParameters(params);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    const defaultParams: ParamType = {
      minimumGenerations: 3,
      maximumRecommendedCoefficient: 6.25,
      criticalCoefficient: 12.5,
      minimumFounderCount: 4,
      lineageDepth: 5
    };
    setParams(defaultParams);
    GeneticsRepository.saveParameters(defaultParams);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!params) return null;

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Paramètres Génétiques Expert
            </h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser par défaut</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Minimum pedigree generations depth for complete analysis */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Générations minimales requises
              </label>
              <input
                type="number"
                min={2}
                max={6}
                value={params.minimumGenerations}
                onChange={(e) => setParams({ ...params, minimumGenerations: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Le nombre de générations de parents à exiger avant d'accorder un label de traçabilité complet à l'arbre généalogique.
              </p>
            </div>

            {/* Lineage Analysis depth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Profondeur de l'analyse de lignée
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={params.lineageDepth}
                onChange={(e) => setParams({ ...params, lineageDepth: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Le nombre maximum de générations ascendantes à explorer lors de la recherche des fondateurs de lignée.
              </p>
            </div>

            {/* Max recommended F */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Coefficient maximal recommandé (%)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={25}
                value={params.maximumRecommendedCoefficient}
                onChange={(e) => setParams({ ...params, maximumRecommendedCoefficient: parseFloat(e.target.value) || 6.25 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Seuil de Wright maximal recommandé (ex: 6.25% correspondant à un accouplement cousins germains). Au-delà, le DSS émet un avertissement d'attention.
              </p>
            </div>

            {/* Critical F */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Coefficient critique de consanguinité (%)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={50}
                value={params.criticalCoefficient}
                onChange={(e) => setParams({ ...params, criticalCoefficient: parseFloat(e.target.value) || 12.5 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Seuil critique de Wright (ex: 12.5% correspondant à un accouplement demi-frère x demi-sœur). Au-delà, l'accouplement est considéré à haut risque.
              </p>
            </div>

            {/* Minimum Founder Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Vivier de fondateurs requis
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={params.minimumFounderCount}
                onChange={(e) => setParams({ ...params, minimumFounderCount: parseInt(e.target.value) || 4 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Le nombre minimum de fondateurs d'origine requis par oiseau pour valider la richesse génétique d'une lignée.
              </p>
            </div>

          </div>

          <div className="flex gap-2.5 items-center bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
            <p className="leading-relaxed">
              Ces variables gouvernent directement les calculs déterministes et la levée d'anomalies automatiques du module **Bird Intelligence**. Toute modification est enregistrée localement et appliquée en temps réel.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            {saved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Modifications appliquées !</span>
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

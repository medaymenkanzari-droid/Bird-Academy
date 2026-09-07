/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { PerformanceEngine } from '../engines/PerformanceEngine';
import { PerformanceMetric } from '../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { ActivityLogger } from '../../../storage/ActivityLogger';
import { Activity, ShieldAlert, Cpu, CheckCircle2, ChevronRight, Play } from 'lucide-react';

export const DiagnosticsTab: React.FC = () => {
  const { language } = useLanguage();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(() => PerformanceEngine.getMetrics());
  const [isRunning, setIsRunning] = useState(false);

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  const birdsCount = BirdRepository.getAll().length;
  const logsCount = ActivityLogger.getLogs().length;

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      PerformanceEngine.runBenchmark();
      setMetrics(PerformanceEngine.getMetrics());
      setIsRunning(false);
    }, 800);
  };

  const recommendations = PerformanceEngine.getRecommendations(birdsCount, logsCount);

  // System telemetry info
  const telemetry = [
    { label: 'Mode Navigateur', val: navigator.onLine ? 'Connecté (Hors-ligne prêt)' : 'Hors-ligne actif', ok: true },
    { label: 'Version de l\'App', val: 'Bird Academy v1.2 Enterprise', ok: true },
    { label: 'Type de Stockage', val: 'HTML5 LocalStorage (Synchrone)', ok: true },
    { label: 'Validation Cache', val: 'Prêt pour l\'exécution', ok: true },
    { label: 'Cookies Navigateur', val: navigator.cookieEnabled ? 'Activés' : 'Désactivés', ok: navigator.cookieEnabled },
    { label: 'Langue Détectée', val: navigator.language, ok: true }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. TELEMETRY GRID */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          Télémétrie & Diagnostics Système
        </h3>
        <p className="text-xs text-slate-500">
          État en temps réel de votre environnement client d'exécution de Bird Academy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {telemetry.map((t, idx) => (
            <div key={idx} className="p-3 bg-slate-50/50 border border-slate-50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">{t.label}</span>
              <span className="font-bold text-slate-800">{t.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SPEED BENCHMARKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Speed chart panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-slate-400" />
                Indicateurs de Performance (Latence)
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Plus la valeur en millisecondes est basse, plus l'application est réactive.</p>
            </div>

            <button
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Mesure...' : 'Lancer le test'}</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {metrics.slice(0, 6).map(m => (
              <div key={m.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-semibold">{m.name}</span>
                  <span className="font-bold text-slate-800 font-mono">{m.durationMs} ms</span>
                </div>
                {/* Latency gauge */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      m.durationMs > 100 ? 'bg-red-500' : m.durationMs > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (m.durationMs / 150) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable recommendations */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col space-y-4">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-slate-400" />
            Conseils de Performance
          </h4>
          <p className="text-[10px] text-slate-500">Analyses intelligentes adaptées au volume de votre cheptel local.</p>

          <div className="flex-1 space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-slate-50/50 rounded-xl border border-slate-50 text-[10px] text-slate-600 flex items-start gap-2 leading-relaxed">
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

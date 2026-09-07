/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getQualityTranslation } from '../utils/translations';
import { GlobalErrorEngine } from '../errors/GlobalErrorEngine';
import { CapturedError } from '../types';
import { Bug, Trash2, ShieldAlert, PlusCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const ErrorCenterTab: React.FC = () => {
  const { language } = useLanguage();
  const [errors, setErrors] = useState<CapturedError[]>(() => GlobalErrorEngine.getErrors());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const t = (key: string) => getQualityTranslation(language, key);

  const triggerMockCrash = () => {
    try {
      // Simulate throwing a null pointer or biological exception to trigger capture
      const num = Math.random();
      if (num < 0.3) {
        throw new TypeError("Cannot read properties of undefined (reading 'couples_limit_exceeded')");
      } else if (num < 0.6) {
        throw new Error("Quota d'écriture LocalStorage saturé : espace disque restant insuffisant.");
      } else {
        throw new RangeError("Le montant de la transaction de vente est négatif (-45.00 €).");
      }
    } catch (err) {
      GlobalErrorEngine.capture(
        'Reproduction / Finance',
        err instanceof Error ? err.message : "Erreur fatale d'exécution",
        err
      );
      setErrors(GlobalErrorEngine.getErrors());
    }
  };

  const clearLogs = () => {
    GlobalErrorEngine.clear();
    setErrors([]);
    setExpandedId(null);
  };

  const removeSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    GlobalErrorEngine.removeError(id);
    setErrors(GlobalErrorEngine.getErrors());
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200';
    }
  };

  return (
    <div className="space-y-6" id="error-center-tab">
      {/* Top action cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {t('errStatus')}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-3.5 h-3.5 rounded-full ${errors.length === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-bounce'}`} />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {errors.length === 0 ? t('errStable') : t('errUnstable')}
              </h4>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            {errors.length} exceptions répertoriées dans le cache.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="text-indigo-500 w-5 h-5 animate-pulse" />
              Mode Sandbox & Diagnostics
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vous pouvez provoquer artificiellement des exceptions d'exécution pour tester la résistance du noyau de Bird Academy aux corruptions de données.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={triggerMockCrash}
              id="btn-trigger-crash"
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs py-2.5 px-3.5 rounded-xl transition duration-150 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {t('errMockTrigger')}
            </button>
            <button
              onClick={clearLogs}
              id="btn-clear-bugs"
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-xs py-2.5 px-3.5 rounded-xl transition duration-150 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {t('errClear')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bug className="text-gray-400 w-5 h-5" />
            Journal d'Audit des Anomalies Logicielles
          </h3>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
            Filtre : SÉCURISÉ / EN-MÉMOIRE
          </span>
        </div>

        {errors.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <CheckCircle className="text-emerald-500 w-12 h-12 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {t('errEmpty')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {errors.map(err => {
              const isOpen = expandedId === err.id;
              return (
                <div 
                  key={err.id} 
                  onClick={() => toggleExpand(err.id)}
                  className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition duration-150 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider h-fit mt-0.5 ${getSeverityBadge(err.severity)}`}>
                        {err.severity}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {err.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                          <span><strong>{t('errClass')} : </strong>{err.classification}</span>
                          <span>•</span>
                          <span><strong>{t('errModule')} : </strong>{err.module}</span>
                          <span>•</span>
                          <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={(e) => removeSingle(err.id, e)}
                        className="p-1 text-gray-400 hover:text-rose-500 rounded transition duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded view (Stack / Suggestions) */}
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 bg-gray-50/50 dark:bg-gray-900/40 p-4 rounded-xl text-xs" onClick={e => e.stopPropagation()}>
                      <div>
                        <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-1">
                          🛠️ {t('errSuggestion')} :
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {err.suggestion}
                        </p>
                      </div>
                      
                      {err.stack && (
                        <div>
                          <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-1">
                            💻 {t('errStack')} :
                          </h5>
                          <pre className="font-mono text-xxs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 overflow-x-auto max-h-40 whitespace-pre-wrap leading-relaxed">
                            {err.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

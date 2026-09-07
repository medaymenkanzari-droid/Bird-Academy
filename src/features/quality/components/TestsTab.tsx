/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getQualityTranslation } from '../utils/translations';
import { TestRunnerEngine } from '../tests/TestRunnerEngine';
import { TestSuiteResult, TestResult } from '../types';
import { Play, CheckCircle2, XCircle, ShieldCheck, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export const TestsTab: React.FC = () => {
  const { language } = useLanguage();
  const [suiteResult, setSuiteResult] = useState<TestSuiteResult | null>(() => TestRunnerEngine.runAllSuites());
  const [running, setRunning] = useState(false);
  const [expandedSuiteId, setExpandedSuiteId] = useState<string | null>(null);

  const t = (key: string) => getQualityTranslation(language, key);

  const runAllTests = () => {
    setRunning(true);
    // Simulate minor delay for realistic feedback
    setTimeout(() => {
      const results = TestRunnerEngine.runAllSuites();
      setSuiteResult(results);
      setRunning(false);
    }, 600);
  };

  const toggleExpand = (id: string) => {
    setExpandedSuiteId(expandedSuiteId === id ? null : id);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'unit': return 'Unit (Unitaire)';
      case 'integration': return 'Integration';
      case 'business_rule': return 'Business Rule (Métier)';
      case 'repository': return 'Repository (Dépôt)';
      case 'engine': return 'Engine (Moteur)';
      case 'snapshot': return 'Snapshot';
      case 'ui': return 'UI / Accessibilité';
      case 'e2e': return 'Parcours E2E Navigateur';
      default: return cat;
    }
  };

  if (!suiteResult) return null;

  const totalTests = suiteResult.passedCount + suiteResult.failedCount;

  return (
    <div className="space-y-6" id="tests-tab">
      {/* Top statistics summary panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {t('testCoverage')}
          </span>
          <div className="mt-2 space-y-2">
            <h4 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {suiteResult.coverage}%
            </h4>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${suiteResult.coverage}%` }} 
              />
            </div>
          </div>
          <p className="text-xxs text-gray-400 mt-2">
            Objectif RC1 : &gt;90% sur tous les moteurs
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white font-mono">{suiteResult.passedCount}</span>
            <span className="text-xs text-gray-400 font-medium">{t('testPassed')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center text-rose-500 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white font-mono">{suiteResult.failedCount}</span>
            <span className="text-xs text-gray-400 font-medium">{t('testFailed')}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <button
            onClick={runAllTests}
            disabled={running}
            id="btn-run-all-tests"
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs py-3 px-4 rounded-xl transition duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm h-full"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Exécution...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {t('testRunAll')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tests hierarchy lists */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-indigo-500 w-5 h-5" />
            Registre d'Exécution des Suites de Tests (Sprint 10)
          </h3>
          <span className="text-xs font-mono text-gray-400">
            {totalTests} Suites exécutées
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {suiteResult.results.map((suite) => {
            const isSuiteOpen = expandedSuiteId === suite.id;
            return (
              <div 
                key={suite.id} 
                onClick={() => toggleExpand(suite.id)}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition duration-150 cursor-pointer"
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xxs px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {getCategoryLabel(suite.category)}
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {suite.durationMs}ms
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {suite.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide ${suite.passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                      {suite.passed ? t('testResultPassed') : t('testResultFailed')}
                    </span>
                    {isSuiteOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {isSuiteOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 space-y-3" onClick={e => e.stopPropagation()}>
                    <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('testAssertions')} ({suite.assertions.length})
                    </h5>
                    
                    <div className="space-y-2">
                      {suite.assertions.map((ast, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-950 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                          {ast.passed ? (
                            <CheckCircle2 className="text-emerald-500 w-4 h-4 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="text-rose-500 w-4 h-4 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 text-xs">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {ast.description}
                            </p>
                            {ast.expected && (
                              <div className="font-mono text-xxs text-gray-400 flex gap-x-4 flex-wrap">
                                <span>Expected: <strong className="text-gray-600 dark:text-gray-400">{ast.expected}</strong></span>
                                <span>Actual: <strong className={ast.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>{ast.actual}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

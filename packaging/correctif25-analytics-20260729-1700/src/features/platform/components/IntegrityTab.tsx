/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { IntegrityEngine } from '../engines/IntegrityEngine';
import { IntegrityReport, IntegrityIssue } from '../types';
import { CheckCircle2, ShieldAlert, AlertTriangle, AlertCircle, RefreshCw, Wrench } from 'lucide-react';

export const IntegrityTab: React.FC = () => {
  const { language } = useLanguage();
  const [report, setReport] = useState<IntegrityReport>(() => IntegrityEngine.runCheckup());
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [fixSuccessId, setFixSuccessId] = useState<string | null>(null);

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  const handleRunCheckup = () => {
    const rep = IntegrityEngine.runCheckup();
    setReport(rep);
  };

  const handleApplyFix = (issueId: string) => {
    const success = IntegrityEngine.applyFix(issueId);
    if (success) {
      setFixSuccessId(issueId);
      setTimeout(() => setFixSuccessId(null), 1500);
      
      // Re-run checking to refresh lists
      const refreshedReport = IntegrityEngine.runCheckup();
      setReport(refreshedReport);
    }
  };

  const filteredIssues = report.issues.filter(iss => {
    if (filterSeverity === 'critical') return iss.severity === 'critical';
    if (filterSeverity === 'warning') return iss.severity === 'warning';
    return true;
  });

  const getSeverityIcon = (sev: string) => {
    if (sev === 'critical') return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
    if (sev === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    return <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      
      {/* SCORE HEADER */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 shrink-0">
            <span className={`text-2xl font-black ${getScoreColor(report.score)}`}>
              {report.score}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              {tPlat('integrityTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {report.score === 100 
                ? 'Félicitations, aucune anomalie ou référence cassée détectée.' 
                : 'Des liaisons cassées ou des incohérences de statistiques ont été détectées.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunCheckup}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Vérifier à nouveau</span>
        </button>
      </div>

      {/* OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider">Critiques</span>
            <span className="text-2xl font-black text-red-600 mt-1 block">{report.issuesCount.critical}</span>
          </div>
          <AlertCircle className="w-6 h-6 text-red-500/40" />
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-amber-500 uppercase tracking-wider">Avertissements</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{report.issuesCount.warning}</span>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500/40" />
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-wider">Incohérences mineures</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{report.issuesCount.info}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-blue-500/40" />
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filterSeverity === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tous ({report.issues.length})
        </button>
        <button
          onClick={() => setFilterSeverity('critical')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filterSeverity === 'critical' ? 'bg-red-500 text-white' : 'bg-slate-100 text-red-600 hover:bg-slate-200'
          }`}
        >
          Critiques ({report.issuesCount.critical})
        </button>
        <button
          onClick={() => setFilterSeverity('warning')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filterSeverity === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-amber-600 hover:bg-slate-200'
          }`}
        >
          Avertissements ({report.issuesCount.warning})
        </button>
      </div>

      {/* ISSUES LIST */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-8 text-center flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700">Aucune anomalie à afficher</span>
            <span className="text-[10px] text-slate-400">Toutes les liaisons relationnelles de votre cheptel sont saines et cohérentes.</span>
          </div>
        ) : (
          filteredIssues.map(iss => (
            <div
              key={iss.id}
              className={`bg-white rounded-2xl border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                iss.severity === 'critical' ? 'border-red-100 bg-red-50/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {getSeverityIcon(iss.severity)}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">{iss.description}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{iss.details}</p>
                  
                  {/* Suggested fix */}
                  <div className="mt-2 text-[10px] text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50 p-1.5 px-2 rounded-lg inline-flex">
                    <Wrench className="w-3.5 h-3.5" />
                    <span><strong>Action conseillée :</strong> {iss.suggestedFix}</span>
                  </div>
                </div>
              </div>

              {/* Fix button */}
              {iss.canFixAuto && (
                <button
                  onClick={() => handleApplyFix(iss.id)}
                  disabled={fixSuccessId === iss.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    fixSuccessId === iss.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {fixSuccessId === iss.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Appliqué</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{tPlat('integrityFixBtn')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

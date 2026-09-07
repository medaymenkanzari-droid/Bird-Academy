/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IntelligenceService } from '../services/IntelligenceService';
import { IntelligenceReport } from '../types';
import { AppButton } from '../../../components/design-system';
import { FileText, Printer, CheckCircle, HelpCircle, FileCheck, Calendar, ArrowRight } from 'lucide-react';

export const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState<'monthly' | 'annual' | 'reproduction' | 'finance' | 'global'>('monthly');
  const [generatedReport, setGeneratedReport] = useState<IntelligenceReport | null>(null);

  const handleGenerate = () => {
    const rep = IntelligenceService.generateReport(reportType);
    setGeneratedReport(rep);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Row */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Générateur de Rapports DSS</h3>
          <p className="text-[11px] text-slate-500">Produisez instantanément des bilans complets et justifiés, sans dépendance externe.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-[200px]"
          >
            <option value="monthly">Résumé Mensuel d'Élevage</option>
            <option value="annual">Bilan Annuel d'Activité</option>
            <option value="reproduction">Rapport Analytique Repro</option>
            <option value="finance">Audit d'Exploitation Financière</option>
            <option value="global">Audit Décisionnel Global</option>
          </select>
          <AppButton size="sm" variant="success" onClick={handleGenerate} className="flex items-center justify-center gap-1.5 cursor-pointer">
            <FileText className="w-4 h-4" />
            <span>Générer le rapport</span>
          </AppButton>
        </div>
      </div>

      {generatedReport ? (
        <div className="space-y-4">
          
          {/* Action header */}
          <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Rapport compilé localement
            </span>
            <AppButton size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1 cursor-pointer">
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </AppButton>
          </div>

          {/* Printable Report Card */}
          <div id="printable-area" className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6 text-slate-800 dark:text-slate-200">
            
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">Bird Intelligence DSS v1.0</span>
                <h2 className="text-lg font-black mt-1 text-slate-900 dark:text-white">{generatedReport.title}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Calculé localement par le moteur décisionnel autonome</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date: {generatedReport.date}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 rounded-full text-[9px] font-bold">
                  Document Officiel d'Élevage
                </span>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {generatedReport.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white border-l-2 border-amber-500 pl-2">
                    {section.title}
                  </h3>
                  
                  {/* Content */}
                  <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-semibold whitespace-pre-line">
                    {section.content}
                  </div>

                  {/* Metrics if present */}
                  {section.metrics && section.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {section.metrics.map((metric, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</div>
                          <div className="text-base font-black text-slate-800 dark:text-white mt-1">{metric.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 text-[10px] text-slate-400 leading-relaxed">
              * Ce document a été compilé à 100% de manière déterministe par l'application locale. Aucun modèle d'intelligence artificielle hébergé sur le cloud n'a été impliqué, garantissant la protection de vos données d'élevage et la conformité stricte au règlement de sécurité biologique.
            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Aucun rapport compilé</h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm">Choisissez un type de bilan et cliquez sur le bouton de génération pour afficher l'analyse d'aide à la décision imprimable.</p>
        </div>
      )}
    </div>
  );
};

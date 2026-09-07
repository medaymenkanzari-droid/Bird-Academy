/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { IntelligenceService } from '../services/IntelligenceService';
import { IntelligenceReport } from '../types';
import { AppButton } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';
import { FileText, Printer, FileCheck, Calendar } from 'lucide-react';

export const ReportGenerator: React.FC = () => {
  const { t, language, isRtl } = useLanguage();
  type ReportType = 'monthly' | 'annual' | 'reproduction' | 'finance' | 'global';
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [generatedReport, setGeneratedReport] = useState<IntelligenceReport | null>(null);

  useEffect(() => {
    setGeneratedReport(null);
  }, [language]);

  const handleGenerate = () => {
    const rep = IntelligenceService.generateReport(reportType, language);
    setGeneratedReport(rep);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Row */}
      <div className="print:hidden p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('intelReportTitle')}</h3>
          <p className="text-[11px] text-slate-500">{t('intelReportGeneratorDescription')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:min-w-[200px]"
          >
            <option value="monthly">{t('intelReportMonthly')}</option>
            <option value="annual">{t('intelReportAnnual')}</option>
            <option value="reproduction">{t('intelReportRepro')}</option>
            <option value="finance">{t('intelReportFinance')}</option>
            <option value="global">{t('intelReportGlobal')}</option>
          </select>
          <AppButton size="sm" variant="success" onClick={handleGenerate} className="flex items-center justify-center gap-1.5 cursor-pointer">
            <FileText className="w-4 h-4" />
            <span>{t('intelGenerate')}</span>
          </AppButton>
        </div>
      </div>

      {generatedReport ? (
        <div className="space-y-4">
          
          {/* Action header */}
          <div className="print:hidden flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              {t('intelReportCompiled')}
            </span>
            <AppButton size="sm" variant="outline" onClick={handlePrint} className="flex items-center gap-1 cursor-pointer">
              <Printer className="w-4 h-4" />
              <span>{t('intelPrintReport')}</span>
            </AppButton>
          </div>

          {/* Printable Report Card */}
          <div id="printable-area" dir={isRtl ? 'rtl' : 'ltr'} className="p-5 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-6 text-slate-800 dark:text-slate-200">
            
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">Bird Intelligence DSS v1.0</span>
                <h2 className="text-lg font-black mt-1 text-slate-900 dark:text-white">{generatedReport.title}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('intelReportLocalEngine')}</p>
              </div>
              <div className={isRtl ? 'text-left' : 'text-right'}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('intelDateLabel')}: {generatedReport.date}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 rounded-full text-[9px] font-bold">
                  {t('intelOfficialDocument')}
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
              * {t('intelReportDisclaimer')}
            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('intelNoCompiledReport')}</h4>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm">{t('intelNoCompiledReportHelp')}</p>
        </div>
      )}
    </div>
  );
};

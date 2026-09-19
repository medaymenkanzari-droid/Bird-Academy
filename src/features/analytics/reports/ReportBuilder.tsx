/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - STATISTICS REPORT BUILDER (V1.3.0 ROOT FIX)
 * Generates autonomous, cross-platform PDF reports (application/pdf) with zero canvas dependency.
 */

import React, { useState, useMemo } from 'react';
import { useAnalyticsTranslation } from '../hooks/useAnalyticsTranslation';
import { AnalyticsService } from '../services/AnalyticsService';
import { AnalyticsFilters } from '../types';
import { 
  InsightCard, ExecutiveTile 
} from '../widgets/AnalyticsWidgets';
import { 
  AnalyticsBarChart, AnalyticsPieChart, AnalyticsRadarChart 
} from '../charts/GraphEngine';
import { 
  FileText, Calendar, Printer, Sparkles, CheckCircle2, PenTool, Download, AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../../utils/currencyFormatter';
import { printDocument, exportDocumentAsPDF } from '../../../utils/printUtils';
import { AppAlert, AppLoader } from '../../../components/design-system';
import { BUILD_ID } from '../../../config/appMode';
import { AnalyticsSettingsRepository } from '../repositories/AnalyticsSettingsRepository';

interface ReportBuilderProps {
  filters: AnalyticsFilters;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ filters }) => {
  const { at, language, isRtl } = useAnalyticsTranslation();
  
  const [reportType, setReportType] = useState<
    'exec' | 'breeding' | 'health' | 'finance' | 'habitat' | 'genetics' | 'nursery' | 'dqi'
  >('exec');
  
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isGenerated, setIsGenerated] = useState(false);
  const [version] = useState('1.4.2');

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfAlert, setPdfAlert] = useState<{ type: 'success' | 'danger' | 'warning'; title: string; message: string } | null>(null);

  const kpis = useMemo(() => {
    return AnalyticsService.getKPIs(filters);
  }, [filters]);

  const handleGenerate = () => {
    setIsGenerated(true);
    setPdfAlert(null);
  };

  // Generate dynamic expert DSS advices based on real-time KPIs
  const dssRecommendations = useMemo(() => {
    const list: string[] = [];
    const coi = Number(kpis.average_inbreeding?.value || 0);
    const dqi = Number(kpis.data_quality_index?.value || 0);
    const fert = Number(kpis.fertility_rate?.value || 0);
    const cash = Number(kpis.net_cashflow?.value || 0);
    const density = Number(kpis.overoccupied_cages?.value || 0);

    if (coi > 6.25) {
      list.push("Le coefficient moyen de consanguinité de Wright dépasse 6.25% (équivalent cousins germains). Privilégiez des accouplements de lignes éloignées au prochain cycle.");
    } else {
      list.push("Excellent contrôle génétique : La consanguinité moyenne reste en-dessous du seuil d'alerte biologique de 6.25%.");
    }

    if (dqi < 85) {
      list.push(`L'indice de qualité des données (DQI) de ${dqi}% est améliorable. Complétez les numéros de bague et photos manquantes pour sécuriser la traçabilité.`);
    }

    if (fert < 80 && fert > 0) {
      list.push("Le taux de fertilité est inférieur à l'objectif de 80%. Évaluez la préparation nutritionnelle des reproducteurs (vitamine E) et l'âge des mâles.");
    }

    if (density > 0) {
      list.push(`Alerte surpopulation : ${density} cages dépassent la capacité d'accueil maximale. Répartissez les oisillons pour éviter le picage.`);
    }

    if (cash < 0) {
      list.push("Le cash-flow net consolidé est négatif. Optimisez le coût d'achat des graines en lot et limitez les acquisitions d'oiseaux d'élevage externes temporairement.");
    }

    if (list.length === 0) {
      list.push("Tous les indicateurs clés de performance de votre élevage sont au vert. Continuez à appliquer le protocole de nursery standard.");
    }

    return list;
  }, [kpis]);

  // Map structured data for tables and PDF export (independent of canvas)
  const chartData = useMemo(() => {
    if (reportType === 'finance') {
      return [
        { name: 'Alimentation', value: Number(kpis.feed_cost?.value || 120) },
        { name: 'Santé & Soins', value: Number(kpis.total_expenses?.value || 300) * 0.15 },
        { name: 'Cages & Box', value: Number(kpis.total_expenses?.value || 300) * 0.25 },
        { name: 'Autres charges', value: Number(kpis.total_expenses?.value || 300) * 0.1 }
      ];
    } else if (reportType === 'breeding') {
      return [
        { name: 'T1', value: 80, value2: 70 },
        { name: 'T2', value: 85, value2: 75 },
        { name: 'T3', value: 78, value2: 72 },
        { name: 'T4', value: 82, value2: 80 }
      ];
    } else if (reportType === 'genetics') {
      return [
        { name: 'Ligne A', value: 3.1 },
        { name: 'Ligne B', value: 5.4 },
        { name: 'Ligne C', value: 1.8 },
        { name: 'Ligne D', value: 7.2 }
      ];
    } else {
      return [
        { name: 'Repro', value: Number(kpis.fertility_rate?.value || 80) },
        { name: 'Habitat', value: Number(kpis.occupancy_rate?.value || 70) },
        { name: 'Finances', value: Math.max(30, Number(kpis.profit_margin?.value || 50)) },
        { name: 'Santé', value: Number(kpis.recovery_rate?.value || 90) },
        { name: 'DQI', value: Number(kpis.data_quality_index?.value || 85) }
      ];
    }
  }, [reportType, kpis]);

  // Export PDF Handler using the unified printUtils PDF engine
  const handleExportPDF = async () => {
    setPdfLoading(true);
    setPdfAlert(null);

    try {
      const reportTitle = reportType === 'exec' ? at('reportExec')
        : reportType === 'breeding' ? at('reportBreeding')
        : reportType === 'health' ? at('reportHealth')
        : reportType === 'finance' ? at('reportFinancial')
        : reportType === 'habitat' ? at('reportHabitat')
        : reportType === 'genetics' ? at('reportGenetics')
        : reportType === 'nursery' ? at('reportNursery')
        : at('reportDQI');

      const PDF_TRANSLATIONS: Record<string, {
        subtitle: (freq: string) => string;
        kpiSection: string;
        dataSection: string;
        dssSection: string;
        headers: [string, string, string];
      }> = {
        fr: {
          subtitle: (freq) => `Rapport d'audit ${freq.toUpperCase()} - Bird Academy Enterprise`,
          kpiSection: 'Indicateurs Clés de Performance (KPI)',
          dataSection: 'Synthèse des Données & Répartition',
          dssSection: 'Conseils Vétérinaires & Recommandations DSS',
          headers: ['Catégorie / Axe', 'Valeur Actuelle', 'Référence N-1'],
        },
        en: {
          subtitle: (freq) => `Audit Report ${freq.toUpperCase()} - Bird Academy Enterprise`,
          kpiSection: 'Key Performance Indicators (KPI)',
          dataSection: 'Data Summary & Breakdown',
          dssSection: 'Veterinary Advice & DSS Recommendations',
          headers: ['Category / Axis', 'Current Value', 'Reference N-1'],
        },
        ar: {
          subtitle: (freq) => `تقرير التقييم ${freq.toUpperCase()} - بيرد أكاديمي`,
          kpiSection: 'مؤشرات الأداء الرئيسية',
          dataSection: 'ملخص البيانات والتوزيع',
          dssSection: 'النصائح البيطرية والتوصيات',
          headers: ['الفئة / المحور', 'القيمة الحالية', 'المرجع N-1'],
        },
        es: {
          subtitle: (freq) => `Informe de auditoría ${freq.toUpperCase()} - Bird Academy Enterprise`,
          kpiSection: 'Indicadores Clave de Rendimiento (KPI)',
          dataSection: 'Resumen de Datos y Distribución',
          dssSection: 'Consejos Veterinarios y Recomendaciones DSS',
          headers: ['Categoría / Eje', 'Valor Actual', 'Referencia N-1'],
        },
        it: {
          subtitle: (freq) => `Rapporto di audit ${freq.toUpperCase()} - Bird Academy Enterprise`,
          kpiSection: 'Indicatori Chiave di Prestazione (KPI)',
          dataSection: 'Sintesi dei Dati e Distribuzione',
          dssSection: 'Consigli Veterinari e Raccomandazioni DSS',
          headers: ['Categoria / Asse', 'Valore Attuale', 'Riferimento N-1'],
        },
      };

      const pdfTrans = PDF_TRANSLATIONS[language] || PDF_TRANSLATIONS['fr'];
      const settings = AnalyticsSettingsRepository.getSettings();
      const subtitle = pdfTrans.subtitle(frequency);

      let metrics: { label: string; value: string }[] = [];
      if (reportType === 'finance') {
        metrics = [
          { label: at('kpiTotalRevenue'), value: formatCurrency(kpis.total_revenue?.value || 0, settings.currency, true, language) },
          { label: at('kpiTotalExpenses'), value: formatCurrency(kpis.total_expenses?.value || 0, settings.currency, true, language) },
          { label: at('kpiNetCashFlow'), value: formatCurrency(kpis.net_cashflow?.value || 0, settings.currency, true, language) },
          { label: at('kpiProfitMargin'), value: `${kpis.profit_margin?.value || 0}%` },
        ];
      } else if (reportType === 'breeding') {
        metrics = [
          { label: at('kpiFertility'), value: `${kpis.fertility_rate?.value || 0}%` },
          { label: at('kpiHatching'), value: `${kpis.hatching_rate?.value || 0}%` },
          { label: at('kpiWeaning'), value: `${kpis.weaning_rate?.value || 0}%` },
          { label: at('kpiClutchesCount'), value: String(kpis.clutches_count?.value || 0) },
        ];
      } else if (reportType === 'genetics') {
        metrics = [
          { label: at('kpiInbreedingAvg'), value: `${kpis.average_inbreeding?.value || 0}%` },
          { label: at('kpiGeneticDiversity'), value: `${kpis.genetic_diversity?.value || 0}%` },
          { label: at('kpiFoundersCount'), value: String(kpis.unique_founders?.value || 0) },
          { label: at('kpiActiveBranches'), value: String(kpis.active_branches?.value || 0) },
        ];
      } else {
        metrics = [
          { label: at('kpiTotalBirds'), value: String(kpis.total_birds?.value || 0) },
          { label: at('kpiFertility'), value: `${kpis.fertility_rate?.value || 0}%` },
          { label: at('kpiNetCashFlow'), value: formatCurrency(kpis.net_cashflow?.value || 0, settings.currency, true, language) },
          { label: at('kpiDataQualityIndex'), value: `${kpis.data_quality_index?.value || 0}%` },
        ];
      }

      const tableRows = chartData.map((d: any) => [
        d.name || '',
        String(d.value ?? '-'),
        d.value2 !== undefined ? String(d.value2) : '-',
      ]);

      const pdfReportData = {
        title: reportTitle,
        subtitle,
        dateStr: new Date().toLocaleDateString(language === 'ar' ? 'ar-TN' : language),
        language,
        isRtl,
        sections: [
          {
            title: pdfTrans.kpiSection,
            metrics,
          },
          {
            title: pdfTrans.dataSection,
            table: {
              headers: pdfTrans.headers,
              rows: tableRows,
            },
          },
          {
            title: pdfTrans.dssSection,
            textLines: dssRecommendations,
          },
        ],
      };

      // Trigger printable area layout preparation
      printDocument('printable-area');

      // Generate & Export PDF File via native Share / Blob
      const result = await exportDocumentAsPDF(pdfReportData);

      if (result.success) {
        setPdfAlert({
          type: 'success',
          title: 'Export PDF Réussi',
          message: result.message || 'Rapport PDF généré avec succès !',
        });
      } else {
        console.error('[PDF-STAT-04] PDF Export failed:', result.message);
        setPdfAlert({
          type: 'danger',
          title: 'Erreur d\'Export PDF (PDF-STAT-04)',
          message: result.message || 'Erreur lors de la génération du PDF.',
        });
      }
    } catch (err: any) {
      console.error('[PDF-STAT-01] PDF generation exception:', err);
      setPdfAlert({
        type: 'danger',
        title: 'Erreur PDF (PDF-STAT-01)',
        message: err?.message || 'Erreur imprévue lors de la compilation PDF.',
      });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Parameter selection panel */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4 print:hidden">
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50 dark:border-slate-800">
          <FileText className="w-4.5 h-4.5 text-indigo-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {at('reportBuilder')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wide text-slate-500 block">{at('reportType')}</label>
            <select
              value={reportType}
              onChange={(e: any) => {
                setReportType(e.target.value);
                setIsGenerated(false);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="exec">{at('reportExec')}</option>
              <option value="breeding">{at('reportBreeding')}</option>
              <option value="health">{at('reportHealth')}</option>
              <option value="finance">{at('reportFinancial')}</option>
              <option value="habitat">{at('reportHabitat')}</option>
              <option value="genetics">{at('reportGenetics')}</option>
              <option value="nursery">{at('reportNursery')}</option>
              <option value="dqi">{at('reportDQI')}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wide text-slate-500 block">{at('reportFreq')}</label>
            <select
              value={frequency}
              onChange={(e: any) => {
                setFrequency(e.target.value);
                setIsGenerated(false);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="daily">{at('reportDaily')}</option>
              <option value="weekly">{at('reportWeekly')}</option>
              <option value="monthly">{at('reportMonthly')}</option>
              <option value="quarterly">{at('reportQuarterly')}</option>
              <option value="annual">{at('reportAnnual')}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
            >
              {at('reportGenerateBtn')}
            </button>
          </div>
        </div>
      </div>

      {pdfAlert && (
        <AppAlert type={pdfAlert.type} title={pdfAlert.title}>
          {pdfAlert.message}
        </AppAlert>
      )}

      {/* Generated Report Sheet */}
      {isGenerated ? (
        <div id="printable-area" className="p-4 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none animate-fade-in min-w-0 max-w-full overflow-hidden">
          
          {/* Export PDF & Print controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden min-w-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs text-slate-500 font-bold">Rapport d'audit compilé en local</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={pdfLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {pdfLoading ? <AppLoader /> : <Download className="w-4 h-4" />}
                <span>{pdfLoading ? 'Génération PDF...' : 'Exporter PDF (Fichier Natif)'}</span>
              </button>

              <button
                type="button"
                onClick={() => printDocument('printable-area')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>

          {/* Report Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-850 dark:text-white uppercase tracking-tight">
                {reportType === 'exec' && at('reportExec')}
                {reportType === 'breeding' && at('reportBreeding')}
                {reportType === 'health' && at('reportHealth')}
                {reportType === 'finance' && at('reportFinancial')}
                {reportType === 'habitat' && at('reportHabitat')}
                {reportType === 'genetics' && at('reportGenetics')}
                {reportType === 'nursery' && at('reportNursery')}
                {reportType === 'dqi' && at('reportDQI')}
              </h2>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{at('reportGeneratedOn')} : {new Date().toLocaleDateString(language === 'ar' ? 'ar-TN' : language)}</span>
                <span>• {at('reportFreq')} : {frequency.toUpperCase()}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black text-indigo-500 block uppercase tracking-wider">Bird Academy ERP Audit</span>
              <span className="text-xs text-slate-400 font-mono font-bold">v{version} ({BUILD_ID})</span>
            </div>
          </div>

          {/* Core Executive Summary block */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>Synthèse de Gestion consolidée</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-semibold">
              {reportType === 'exec' && "Ce rapport présente le bilan holistique de votre élevage de canaris. L'activité d'élevage globale conserve des constantes stables, soutenue par un indice de qualité des données optimal."}
              {reportType === 'breeding' && "Audit approfondi des couvées actives. Le taux d'éclosion et le rythme de sevrage témoignent de la bonne viabilité phénotypique des couples."}
              {reportType === 'health' && "Analyse sanitaire du troupeau. Les quarantaines sont gérées efficacement, et le taux de guérison suite aux protocoles vétérinaires reste optimal."}
              {reportType === 'finance' && "Bilan comptable local. L'équilibre entre dépenses d'alimentation et cessions d'oiseaux permet de maintenir un cash-flow positif."}
              {reportType === 'habitat' && "État d'occupation de l'habitat. L'affectation géographique des cages et la gestion du surpeuplement respectent les normes d'espace par canari."}
              {reportType === 'genetics' && "Rapport d'intégrité généalogique. Le coefficient de Wright moyen est calculé de manière déterministe pour guider vos accouplements sans dérive consanguine."}
              {reportType === 'nursery' && "Suivi de croissance des oisillons nés de l'année. Les taux de sevrage biologique attestent de la rigueur nutritionnelle appliquée."}
              {reportType === 'dqi' && "Audit de la complétude du registre d'élevage. Les champs recommandés (bagues, filiations, photos) garantissent la traçabilité."}
            </p>
          </div>

          {/* Grid of high density KPIs based on report type */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportType === 'finance' ? (
              <>
                <ExecutiveTile title={at('kpiTotalRevenue')} value={formatCurrency(kpis.total_revenue?.value || 0, kpis.total_revenue?.unit || 'TND', true, language)} />
                <ExecutiveTile title={at('kpiTotalExpenses')} value={formatCurrency(kpis.total_expenses?.value || 0, kpis.total_expenses?.unit || 'TND', true, language)} />
                <ExecutiveTile title={at('kpiNetCashFlow')} value={formatCurrency(kpis.net_cashflow?.value || 0, kpis.net_cashflow?.unit || 'TND', true, language)} color="text-emerald-500" />
                <ExecutiveTile title={at('kpiProfitMargin')} value={`${kpis.profit_margin?.value}%`} />
              </>
            ) : reportType === 'breeding' ? (
              <>
                <ExecutiveTile title={at('kpiFertility')} value={`${kpis.fertility_rate?.value}%`} />
                <ExecutiveTile title={at('kpiHatching')} value={`${kpis.hatching_rate?.value}%`} />
                <ExecutiveTile title={at('kpiWeaning')} value={`${kpis.weaning_rate?.value}%`} />
                <ExecutiveTile title={at('kpiClutchesCount')} value={String(kpis.clutches_count?.value)} />
              </>
            ) : reportType === 'genetics' ? (
              <>
                <ExecutiveTile title={at('kpiInbreedingAvg')} value={`${kpis.average_inbreeding?.value}%`} color="text-indigo-500" />
                <ExecutiveTile title={at('kpiGeneticDiversity')} value={`${kpis.genetic_diversity?.value}%`} />
                <ExecutiveTile title={at('kpiFoundersCount')} value={String(kpis.unique_founders?.value)} />
                <ExecutiveTile title={at('kpiActiveBranches')} value={String(kpis.active_branches?.value)} />
              </>
            ) : (
              <>
                <ExecutiveTile title={at('kpiTotalBirds')} value={String(kpis.total_birds?.value)} />
                <ExecutiveTile title={at('kpiFertility')} value={`${kpis.fertility_rate?.value}%`} />
                <ExecutiveTile title={at('kpiNetCashFlow')} value={formatCurrency(kpis.net_cashflow?.value || 0, kpis.net_cashflow?.unit || 'TND', true, language)} />
                <ExecutiveTile title={at('kpiDataQualityIndex')} value={`${kpis.data_quality_index?.value}%`} color="text-indigo-500" />
              </>
            )}
          </div>

          {/* Graphics representation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl h-64 flex flex-col justify-between">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Répartition des charges & indicateurs</h5>
              {reportType === 'finance' ? (
                <AnalyticsPieChart data={chartData} />
              ) : reportType === 'breeding' ? (
                <AnalyticsBarChart data={chartData} />
              ) : (
                <AnalyticsRadarChart data={chartData} />
              )}
            </div>

            {/* Expert DSS Advice section */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{at('reportRecommendations')}</h5>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {dssRecommendations.map((rec, i) => (
                  <InsightCard key={i} title="Conseil vétérinaire DSS" type={i === 0 && Number(kpis.average_inbreeding?.value || 0) > 6.25 ? 'warning' : 'info'} message={rec} />
                ))}
              </div>
            </div>
          </div>

          {/* Signature segment */}
          <div className="flex justify-between items-end pt-12 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Certifié conforme par</p>
              <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5" />
                <span>Direction Bird Academy</span>
              </h5>
            </div>
            <div className="text-right border-b border-dashed border-slate-300 w-44 pb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">{at('reportSignature')}</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-2 h-80">
          <FileText className="w-12 h-12 text-slate-300 animate-pulse" />
          <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">{at('reportBuilder')}</h4>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Veuillez choisir le type d'audit, la fréquence temporelle, puis cliquez sur le bouton ci-dessus pour compiler votre rapport d'élevage professionnel.
          </p>
        </div>
      )}
    </div>
  );
};

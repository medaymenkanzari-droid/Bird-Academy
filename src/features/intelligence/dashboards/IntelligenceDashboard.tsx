/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/IntelligenceService';
import { ScoreCard, AlertCard, RecommendationCard } from '../widgets/Widgets';
import { IntelligenceFiche } from '../components/IntelligenceFiche';
import { ReportGenerator } from '../components/ReportGenerator';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { 
  ShieldAlert, Award, FileText, Activity, Heart, Grid, TrendingUp, Sparkles, BrainCircuit,
  LayoutDashboard, UserCheck
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { HorizontalScrollContainer } from '../../../components/ui/HorizontalScrollContainer';

export const IntelligenceDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'fiche' | 'reports'>('overview');
  const [scoreboard, setScoreboard] = useState<ReturnType<typeof IntelligenceService.getGeneralScoreboard> | null>(null);

  useEffect(() => {
    const data = IntelligenceService.getGeneralScoreboard();
    setScoreboard(data);
  }, []);

  if (!scoreboard) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
        <BrainCircuit className="w-6 h-6 animate-pulse text-amber-500" />
        <span>{t('intelLoading')}</span>
      </div>
    );
  }

  const { reproductionScore, habitatScore, financeScore, healthScore, geneticScore, dataQualityScore, alerts, topPerformers, trends } = scoreboard;
  const confidenceLabels = {
    high: t('intelHighConfidence'),
    medium: t('intelMediumConfidence'),
    low: t('intelLowConfidence'),
  };
  const evidenceSummary = (value: string) => language === 'fr' ? value : t('intelEvidenceSummary');
  const evidenceExplanation = (value: string) => language === 'fr' ? value : t('intelEvidenceExplanation');

  return (
    <div className="space-y-6 min-w-0 w-full max-w-full">
      
      {/* Premium header bar */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-slate-800 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        
        {/* Background decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-0.5 bg-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{t('intelLocalDss')}</span>
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 mt-1">
            <BrainCircuit className="w-6 h-6 text-amber-400" />
            <span>{t('intelligence')}</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {t('intelligenceSub')}
          </p>
        </div>

        {/* Aggregate KPI */}
        <div className="flex items-center justify-around sm:justify-start gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl h-fit z-10 w-full sm:w-auto">
          <div className="text-center">
            <div className="text-2xl font-black text-amber-400">{dataQualityScore.score}%</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('intelDataQuality')}</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">{alerts.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('intelActiveAlerts')}</div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <HorizontalScrollContainer innerClassName="overflow-x-auto touch-pan-x min-w-0 border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`shrink-0 px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'overview' 
              ? 'border-amber-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{t('intelOverview')}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('fiche')}
          className={`shrink-0 px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'fiche' 
              ? 'border-amber-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{t('intelFicheTitle')}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`shrink-0 px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'reports' 
              ? 'border-amber-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{t('intelReportTitle')}</span>
        </button>
      </HorizontalScrollContainer>

      {/* Tab Switcher Content */}
      <div className="space-y-6 min-w-0 max-w-full w-full">
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Domain Scorecards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <ScoreCard
                title={t('intelReproScore')}
                score={reproductionScore.score}
                summary={evidenceSummary(reproductionScore.summary)}
                explanation={evidenceExplanation(reproductionScore.explanation)}
                icon={Heart}
                color="rose"
                confidence={reproductionScore.confidence}
                confidenceLabels={confidenceLabels}
              />
              <ScoreCard
                title={t('intelHealthScore')}
                score={healthScore.score}
                summary={evidenceSummary(healthScore.summary)}
                explanation={evidenceExplanation(healthScore.explanation)}
                icon={Activity}
                color="emerald"
                confidence={healthScore.confidence}
                confidenceLabels={confidenceLabels}
              />
              <ScoreCard
                title={t('intelGeneticScore')}
                score={geneticScore.score}
                summary={evidenceSummary(geneticScore.summary)}
                explanation={evidenceExplanation(geneticScore.explanation)}
                icon={BrainCircuit}
                color="amber"
                confidence={geneticScore.confidence}
                confidenceLabels={confidenceLabels}
              />
              <ScoreCard
                title={t('intelHabitatScore')}
                score={habitatScore.score}
                summary={evidenceSummary(habitatScore.summary)}
                explanation={evidenceExplanation(habitatScore.explanation)}
                icon={Grid}
                color="indigo"
                confidence={habitatScore.confidence}
                confidenceLabels={confidenceLabels}
              />
              <ScoreCard
                title={t('intelFinanceScore')}
                score={financeScore.score}
                summary={evidenceSummary(financeScore.summary)}
                explanation={evidenceExplanation(financeScore.explanation)}
                icon={TrendingUp}
                color="amber"
                confidence={financeScore.confidence}
                confidenceLabels={confidenceLabels}
              />
            </div>

            {/* Middle Section: Alerts and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Alerts List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('intelAlerts')}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded text-[10px] font-extrabold">
                    {t('intelTriggeredCount', { count: alerts.length })}
                  </span>
                </div>

                {alerts.length > 0 ? (
                  <div className="space-y-3.5">
                    {alerts.map(alert => (
                      <AlertCard
                        key={alert.ruleId}
                        title={language === 'fr' ? alert.name : t('intelRuleDetected')}
                        priority={alert.priority}
                        explanation={language === 'fr' ? alert.explanation : t('intelRuleEvidence')}
                        recommendation={language === 'fr' ? alert.recommendation : t('intelReviewSourceData')}
                        criticalLabel={t('intelCritical')}
                        attentionLabel={t('intelAttention')}
                        actionLabel={t('intelActions')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500">{t('intelNoActiveAlerts')}</p>
                  </div>
                )}
              </div>

              {/* Top Performers and Weaknesses */}
              <div className="space-y-6">
                
                {/* Top Performers */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-2">
                    <Award className="w-4.5 h-4.5 text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{t('intelTopPerformers')}</h4>
                  </div>
                  
                  {topPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {topPerformers.map(performer => (
                        <div key={performer.pairId ?? performer.birdId ?? performer.name} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-800/50 pb-2.5 last:border-0 last:pb-0">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{performer.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{language === 'fr' ? performer.reason : t('intelPerformerEvidence')}</div>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 rounded text-[10px] font-black h-fit">
                            {performer.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">{t('intelNoPerformer')}</p>
                  )}
                </div>

                {/* Points faibles / vigilance */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-xs space-y-4 border border-slate-800">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">{t('intelWeaknesses')}</h4>
                  </div>
                  <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                    {alerts.filter(a => a.priority === 'high').slice(0, 3).map(a => (
                      <div key={a.ruleId} className="flex gap-2 items-start border-b border-slate-800/40 pb-2 last:border-0">
                        <span className="text-rose-500 font-bold">•</span>
                        <div>
                          <strong className="text-white text-[11px] font-black">{language === 'fr' ? a.name : t('intelRuleDetected')}</strong>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{language === 'fr' ? a.recommendation : t('intelReviewSourceData')}</p>
                        </div>
                      </div>
                    ))}
                    {alerts.filter(a => a.priority === 'high').length === 0 && (
                      <p className="text-[11px] text-slate-400">{t('intelNoCritical')}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4 min-w-0 max-w-full overflow-hidden">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('intelMonthlyEvolution')}</h3>
              <p className="text-[11px] text-slate-500">{t('intelMonthlyEvolutionSub')}</p>
              
              <div className="h-64 w-full min-w-0 max-w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="reproductionRate" name={t('intelHatchRate')} stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="salesAmount" name={t('intelSalesDt')} stroke="#10b981" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="expensesAmount" name={t('intelExpensesDt')} stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {activeSubTab === 'fiche' && (
          <div className="animate-fade-in">
            <IntelligenceFiche />
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="animate-fade-in">
            <ReportGenerator />
          </div>
        )}
      </div>

    </div>
  );
};

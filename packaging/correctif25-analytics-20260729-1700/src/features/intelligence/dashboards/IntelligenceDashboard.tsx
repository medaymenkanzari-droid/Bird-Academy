/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { IntelligenceService } from '../services/IntelligenceService';
import { ScoreCard, AlertCard, RecommendationCard } from '../widgets/Widgets';
import { GeneticScoreCard } from '../../genetics/widgets/GeneticsWidgets';
import { IntelligenceFiche } from '../components/IntelligenceFiche';
import { ReportGenerator } from '../components/ReportGenerator';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { 
  ShieldAlert, Award, FileText, Activity, Heart, Grid, TrendingUp, Sparkles, BrainCircuit,
  Settings, HelpCircle, LayoutDashboard, UserCheck
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const IntelligenceDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'fiche' | 'reports'>('overview');
  const [scoreboard, setScoreboard] = useState<any>(null);

  useEffect(() => {
    const data = IntelligenceService.getGeneralScoreboard();
    setScoreboard(data);
  }, []);

  if (!scoreboard) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold flex items-center justify-center gap-2">
        <BrainCircuit className="w-6 h-6 animate-pulse text-amber-500" />
        <span>Chargement des moteurs analytiques locaux...</span>
      </div>
    );
  }

  const { reproductionScore, habitatScore, financeScore, healthScore, geneticScore, dataQualityScore, alerts, topPerformers, trends } = scoreboard;

  return (
    <div className="space-y-6">
      
      {/* Premium header bar */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-slate-800 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        
        {/* Background decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-0.5 bg-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Offline DSS v1.0</span>
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 mt-1">
            <BrainCircuit className="w-6 h-6 text-amber-400" />
            <span>Bird Intelligence V1</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Système d'aide à la décision d'élevage autonome. Le moteur compile et évalue de façon déterministe les performances, l'état sanitaire et la consanguinité directement depuis vos données locales, en garantissant 100% de confidentialité hors ligne.
          </p>
        </div>

        {/* Aggregate KPI */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl h-fit z-10">
          <div className="text-center">
            <div className="text-2xl font-black text-amber-400">{dataQualityScore.score}%</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Qualité Données</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">{alerts.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Alerte(s) Active(s)</div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'overview' 
              ? 'border-amber-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Vue Générale & Moteur de Règles</span>
        </button>
        <button
          onClick={() => setActiveSubTab('fiche')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'fiche' 
              ? 'border-amber-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Fiche Individuelle</span>
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'reports' 
              ? 'border-amber-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Générateur de Rapports</span>
        </button>
      </div>

      {/* Tab Switcher Content */}
      <div className="space-y-6">
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Domain Scorecards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <ScoreCard
                title="Performance Repro"
                score={reproductionScore.score}
                summary={reproductionScore.summary}
                explanation={reproductionScore.explanation}
                icon={Heart}
                color="rose"
                confidence={reproductionScore.confidence}
              />
              <ScoreCard
                title="Santé Clinique"
                score={healthScore.score}
                summary={healthScore.summary}
                explanation={healthScore.explanation}
                icon={Activity}
                color="emerald"
                confidence={healthScore.confidence}
              />
              <GeneticScoreCard
                score={geneticScore?.score || 100}
                label={geneticScore?.label || 'excellent'}
                summary={geneticScore?.summary || ''}
                explanation={geneticScore?.explanation || ''}
                confidence={geneticScore?.confidence || 'high'}
              />
              <ScoreCard
                title="Optimisation Habitat"
                score={habitatScore.score}
                summary={habitatScore.summary}
                explanation={habitatScore.explanation}
                icon={Grid}
                color="indigo"
                confidence={habitatScore.confidence}
              />
              <ScoreCard
                title="Rentabilité Financière"
                score={financeScore.score}
                summary={financeScore.summary}
                explanation={financeScore.explanation}
                icon={TrendingUp}
                color="amber"
                confidence={financeScore.confidence}
              />
            </div>

            {/* Middle Section: Alerts and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Alerts List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Alertes DSS & Anomalies Actives</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded text-[10px] font-extrabold">
                    {alerts.length} déclenchées
                  </span>
                </div>

                {alerts.length > 0 ? (
                  <div className="space-y-3.5">
                    {alerts.map((alert: any) => (
                      <AlertCard
                        key={alert.ruleId}
                        title={alert.name}
                        priority={alert.priority}
                        explanation={alert.explanation}
                        recommendation={alert.recommendation}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500">Aucune anomalie ou alerte de risque identifiée. Votre élevage est parfaitement équilibré.</p>
                  </div>
                )}
              </div>

              {/* Top Performers and Weaknesses */}
              <div className="space-y-6">
                
                {/* Top Performers */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-2">
                    <Award className="w-4.5 h-4.5 text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Sujets Elite / Top Performers</h4>
                  </div>
                  
                  {topPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {topPerformers.map((performer: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-800/50 pb-2.5 last:border-0 last:pb-0">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{performer.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{performer.reason}</div>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 rounded text-[10px] font-black h-fit">
                            {performer.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">Pas assez de données pour classer les performeurs d'exception.</p>
                  )}
                </div>

                {/* Points faibles / vigilance */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-xs space-y-4 border border-slate-800">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Points critiques identifiés</h4>
                  </div>
                  <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                    {alerts.filter(a => a.priority === 'high').slice(0, 3).map((a: any) => (
                      <div key={a.ruleId} className="flex gap-2 items-start border-b border-slate-800/40 pb-2 last:border-0">
                        <span className="text-rose-500 font-bold">•</span>
                        <div>
                          <strong className="text-white text-[11px] font-black">{a.name}</strong>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{a.recommendation}</p>
                        </div>
                      </div>
                    ))}
                    {alerts.filter(a => a.priority === 'high').length === 0 && (
                      <p className="text-[11px] text-slate-400">Aucun point d'échec critique détecté par le DSS.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Évolution de l'Activité & Rendements (6 derniers mois)</h3>
              <p className="text-[11px] text-slate-500">Analyse croisée temporelle de l'activité financière par rapport aux réussites de nichées calculées mensuellement.</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="reproductionRate" name="Taux Réussite (%)" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="salesAmount" name="Ventes (€)" stroke="#10b981" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="expensesAmount" name="Dépenses (€)" stroke="#6366f1" strokeWidth={2} />
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

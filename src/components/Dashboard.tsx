/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bird, Heart, Egg, Grid, Activity, Calendar, TrendingDown, TrendingUp, BarChart3, Plus, Clock, Info, Check, CheckCircle, AlertTriangle } from 'lucide-react';
import { Canari, Couple, Reproduction, Ponte, Sante, Depense, Vente, Cage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppButton, AppCard, AppBadge, AppKpiCard } from './design-system';
import { HorizontalScrollContainer } from './ui/HorizontalScrollContainer';

interface DashboardProps {
  canaris: Canari[];
  cages: Cage[];
  couples: Couple[];
  reproductions: Reproduction[];
  pontes: Ponte[];
  sante: Sante[];
  depenses: Depense[];
  ventes: Vente[];
  setCurrentTab: (tab: string) => void;
  onCompleteSanteRecord?: (id: number) => void;
  onQuickAddCanari: () => void;
  onQuickAddDepense: () => void;
  onQuickAddCouple: () => void;
}

export default function Dashboard({
  canaris,
  cages,
  couples,
  reproductions,
  pontes,
  sante,
  depenses,
  ventes,
  setCurrentTab,
  onCompleteSanteRecord,
  onQuickAddCanari,
  onQuickAddDepense,
  onQuickAddCouple
}: DashboardProps) {
  const { t } = useLanguage();
  
  // Calculate stats
  const totalBirds = canaris.length;
  const males = canaris.filter(c => c.sexe === 'Mâle').length;
  const females = canaris.filter(c => c.sexe === 'Femelle').length;
  const indet = canaris.filter(c => c.sexe === 'Indéterminé').length;
  
  const activeCouples = couples.filter(c => c.statut === 'Actif').length;
  const activeRepros = reproductions.filter(r => r.statut === 'En cours').length;
  
  // Active egg counts
  const activeReprosIds = reproductions.filter(r => r.statut === 'En cours').map(r => r.id);
  const activePontes = pontes.filter(p => activeReprosIds.includes(p.reproduction_id));
  const totalActiveEggs = activePontes.reduce((acc, p) => acc + (p.oeufs - (p.eclosions || 0)), 0);

  const totalExpenses = depenses.reduce((acc, d) => acc + d.montant, 0);
  const totalSales = ventes.reduce((acc, v) => acc + v.prix, 0);
  const solde = totalSales - totalExpenses;

  // Dynamic alerts state and calculations based on today's date
  const todayStr = "2026-07-08";
  const today = new Date(todayStr);

  const [alertFilter, setAlertFilter] = useState<'all' | 'repro' | 'sante'>('all');

  const alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    date: string;
    category: 'repro' | 'sante' | 'system';
    actionLabel?: string;
    tabTarget?: string;
    santeId?: number;
  }> = [];

  // 1. Egg hatching alert (Standard incubation: 13 days)
  activePontes.forEach(ponte => {
    const ponteDate = new Date(ponte.date);
    const hatchDate = new Date(ponteDate);
    hatchDate.setDate(ponteDate.getDate() + 13);
    
    const diffTime = hatchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const repro = reproductions.find(r => r.id === ponte.reproduction_id);
    const couple = repro ? couples.find(c => c.id === repro.couple_id) : null;
    const maleBird = couple ? canaris.find(c => c.id === couple.male_id) : null;
    const femaleBird = couple ? canaris.find(c => c.id === couple.femelle_id) : null;
    const pairName = (maleBird && femaleBird) ? `${maleBird.nom} x ${femaleBird.nom}` : `Couple #${repro?.couple_id}`;

    if (diffDays >= -3 && diffDays <= 4) {
      const formattedDate = hatchDate.toISOString().split('T')[0];
      if (diffDays < 0) {
        alerts.push({
          id: `hatch-late-${ponte.id}`,
          type: 'warning',
          title: t('hatchLateTitle'),
          description: t('hatchLateDesc', { date: ponte.date, pairName, hatchDate: formattedDate }),
          date: formattedDate,
          category: 'repro',
          actionLabel: t('declareBirths'),
          tabTarget: "reproduction"
        });
      } else if (diffDays === 0) {
        alerts.push({
          id: `hatch-today-${ponte.id}`,
          type: 'warning',
          title: t('hatchTodayTitle'),
          description: t('hatchTodayDesc', { pairName, eggs: ponte.oeufs }),
          date: formattedDate,
          category: 'repro',
          actionLabel: t('declareBirths'),
          tabTarget: "reproduction"
        });
      } else {
        alerts.push({
          id: `hatch-soon-${ponte.id}`,
          type: 'info',
          title: t('hatchSoonTitle', { days: diffDays }),
          description: t('hatchSoonDesc', { pairName, eggs: ponte.oeufs, hatchDate: formattedDate }),
          date: formattedDate,
          category: 'repro',
          actionLabel: t('viewBreeding'),
          tabTarget: "reproduction"
        });
      }
    }
  });

  // 2. Health Treatments Reminder & follow-ups
  sante.forEach(record => {
    const bird = canaris.find(c => c.id === record.canari_id);
    const recordDate = new Date(record.date);
    const diffTime = recordDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const birdLabel = bird ? `${bird.nom} (${bird.bague})` : t('canaris');

    if (record.statut === 'En attente') {
      const formattedDate = record.date;
      if (diffDays < 0) {
        alerts.push({
          id: `sante-late-${record.id}`,
          type: 'warning',
          title: t('santeLateTitle', { treatment: record.traitement }),
          description: `${t('santeLateDesc', { date: formattedDate, days: Math.abs(diffDays), birdName: birdLabel })} ${record.description ? `(Note: ${record.description})` : ''}`,
          date: formattedDate,
          category: 'sante',
          actionLabel: t('viewMedicalRecords'),
          tabTarget: "sante",
          santeId: record.id
        });
      } else if (diffDays === 0) {
        alerts.push({
          id: `sante-today-${record.id}`,
          type: 'warning',
          title: t('santeTodayTitle', { treatment: record.traitement }),
          description: `${t('santeTodayDesc', { birdName: birdLabel })} ${record.description ? `(Note: ${record.description})` : ''}`,
          date: formattedDate,
          category: 'sante',
          actionLabel: t('viewMedicalRecords'),
          tabTarget: "sante",
          santeId: record.id
        });
      } else if (diffDays <= 10) {
        alerts.push({
          id: `sante-soon-${record.id}`,
          type: 'info',
          title: t('santeSoonTitle', { treatment: record.traitement }),
          description: `${t('santeSoonDesc', { date: formattedDate, days: diffDays, birdName: birdLabel })} ${record.description ? `(Note: ${record.description})` : ''}`,
          date: formattedDate,
          category: 'sante',
          actionLabel: t('viewMedicalRecords'),
          tabTarget: "sante",
          santeId: record.id
        });
      }
    }
  });

  // Calculate counts for filters
  const reproAlertsCount = alerts.filter(a => a.category === 'repro').length;
  const santeAlertsCount = alerts.filter(a => a.category === 'sante').length;
  const allAlertsCount = reproAlertsCount + santeAlertsCount;

  // Filter the alerts for rendering
  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'repro') return alert.category === 'repro';
    if (alertFilter === 'sante') return alert.category === 'sante';
    return alert.category !== 'system';
  });

  // Default alert if empty
  if (filteredAlerts.length === 0) {
    let emptyTitle = t('everythingFine');
    let emptyDesc = t('noUrgentEvents');
    
    if (alertFilter === 'repro') {
      emptyTitle = t('noReproAlerts');
      emptyDesc = t('noReproAlertsDesc');
    } else if (alertFilter === 'sante') {
      emptyTitle = t('noSanteAlerts');
      emptyDesc = t('noSanteAlertsDesc');
    }

    filteredAlerts.push({
      id: "no-alerts",
      type: 'success',
      title: emptyTitle,
      description: emptyDesc,
      date: todayStr,
      category: 'system'
    });
  }

  // Quick module shortcuts
  const modules = [
    { id: 'canaris', label: t('canaris'), icon: Bird, count: totalBirds, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { id: 'couples', label: t('couples'), icon: Heart, count: activeCouples, color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
    { id: 'reproduction', label: t('reproduction'), icon: Egg, count: activeRepros, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    { id: 'cages', label: t('cages'), icon: Grid, count: cages.length, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    { id: 'sante', label: t('sante'), icon: Activity, count: sante.length, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
    { id: 'calendrier', label: t('calendrier'), icon: Calendar, count: null, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { id: 'statistiques', label: t('statistiques'), icon: BarChart3, count: null, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Standard Breeding KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppKpiCard
          title={t('totalEffectif')}
          value={totalBirds}
          subtitle={`♂ ${males} | ♀ ${females} | ? ${indet}`}
          icon={Bird}
          variant="primary"
          onClick={() => setCurrentTab('canaris')}
        />

        <AppKpiCard
          title={t('activeCouples')}
          value={activeCouples}
          subtitle={t('readyForRepro')}
          icon={Heart}
          variant="warning"
          onClick={() => setCurrentTab('couples')}
        />

        <AppKpiCard
          title={t('ongoingPontes')}
          value={activeRepros}
          subtitle={`${totalActiveEggs} œufs en incubation`}
          icon={Egg}
          variant="info"
          onClick={() => setCurrentTab('reproduction')}
        />

        <AppKpiCard
          title={t('financialBalance')}
          value={`${solde >= 0 ? '+' : ''}${solde.toFixed(2)} DT`}
          subtitle={`Ventes: ${totalSales.toFixed(2)} | Dépenses: ${totalExpenses.toFixed(2)}`}
          icon={solde >= 0 ? TrendingUp : TrendingDown}
          variant={solde >= 0 ? "success" : "danger"}
          onClick={() => setCurrentTab('statistiques')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts section */}
        <div className="lg:col-span-2 space-y-4">
          <AppCard padding="lg" className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('alertsTitle')}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl self-start sm:self-auto font-semibold">
                {t('todayLabel')} : 08/07/2026
              </span>
            </div>

            {/* Segmented controls */}
            <HorizontalScrollContainer innerClassName="grid grid-cols-3 sm:flex sm:overflow-x-auto touch-pan-x border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAlertFilter('all')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer text-center leading-tight whitespace-normal sm:whitespace-nowrap min-h-[38px] ${
                  alertFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('allAlertsCount', { count: allAlertsCount })}
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('repro')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center leading-tight whitespace-normal sm:whitespace-nowrap min-h-[38px] ${
                  alertFilter === 'repro'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('reproAlertsCount', { count: reproAlertsCount })}
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('sante')}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center leading-tight whitespace-normal sm:whitespace-nowrap min-h-[38px] ${
                  alertFilter === 'sante'
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('santeAlertsCount', { count: santeAlertsCount })}
              </button>
            </HorizontalScrollContainer>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    alert.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                      : alert.type === 'info'
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {alert.type === 'warning' ? (
                      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    ) : alert.type === 'info' ? (
                      <Info className="w-5 h-5 text-blue-500 shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">{alert.title}</h4>
                    <p className="text-xs opacity-90 mt-1 leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{alert.description}</p>
                    <div className="flex items-center justify-between gap-4 mt-2.5">
                      {alert.actionLabel && alert.tabTarget && (
                        <button
                           onClick={() => setCurrentTab(alert.tabTarget!)}
                           className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                           {alert.actionLabel} &rarr;
                        </button>
                      )}
                      {alert.santeId && onCompleteSanteRecord && (
                        <button
                          onClick={() => {
                            onCompleteSanteRecord!(alert.santeId!);
                          }}
                          className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          title={t('validateSoin')}
                        >
                          <Check className="w-3.5 h-3.5" /> {t('validateSoin')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AppCard>
        </div>

        {/* Quick Add Form Section */}
        <div className="space-y-4">
          <AppCard
            padding="lg"
            className="h-full flex flex-col justify-between"
            title={t('quickActions')}
            subtitle={t('quickActionsDesc')}
          >
            <div className="space-y-3 mt-4">
              <button
                onClick={onQuickAddCanari}
                data-testid="dashboard-quick-add-bird-btn"
                className="w-full flex items-center justify-between p-3.5 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold rounded-xl border border-blue-100 dark:border-slate-700 transition-colors text-left cursor-pointer min-h-[48px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Bird className="w-4.5 h-4.5" />
                  </div>
                  <span data-testid="dashboard-quick-add-bird-label" className="text-sm font-bold">{t('addBird')}</span>
                </div>
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>

              <button
                onClick={onQuickAddCouple}
                className="w-full flex items-center justify-between p-3.5 bg-rose-50/80 hover:bg-rose-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold rounded-xl border border-rose-100 dark:border-slate-700 transition-colors text-left cursor-pointer min-h-[48px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
                    <Heart className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-sm font-bold">{t('formCouple')}</span>
                </div>
                <Plus className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </button>

              <button
                onClick={onQuickAddDepense}
                className="w-full flex items-center justify-between p-3.5 bg-indigo-50/80 hover:bg-indigo-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold rounded-xl border border-indigo-100 dark:border-slate-700 transition-colors text-left cursor-pointer min-h-[48px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <TrendingDown className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-sm font-bold">{t('addExpense')}</span>
                </div>
                <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono font-medium">{t('offlineActive')}</span>
            </div>
          </AppCard>
        </div>
      </div>

      {/* Grid of Modules */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-4">{t('functionalModules')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentTab(m.id)}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-center cursor-pointer group min-h-[100px]"
              >
                <div className={`p-3 rounded-xl mb-2.5 border transition-transform group-hover:scale-105 ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight block">{m.label}</span>
                {m.count !== null && (
                  <span className="mt-1.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                    {m.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

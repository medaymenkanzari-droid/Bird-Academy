/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home, Bird, Heart, Egg, Grid, Activity, Calendar, TrendingDown, TrendingUp, BarChart3, Settings, Plus, AlertCircle, CheckCircle, Clock, Info, Check } from 'lucide-react';
import { Canari, Couple, Reproduction, Ponte, Sante, Depense, Vente, Cage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppButton, AppCard, AppBadge, AppAlert } from './design-system';

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

  // Dynamic alerts state and calculations based on today's date (2026-07-08 as of metadata context)
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
          title: "Éclosion en retard / à déclarer",
          description: `La ponte du ${ponte.date} (${pairName}) devait éclore vers le ${formattedDate}. Veuillez déclarer les naissances.`,
          date: formattedDate,
          category: 'repro',
          actionLabel: "Déclarer naissances",
          tabTarget: "reproduction"
        });
      } else if (diffDays === 0) {
        alerts.push({
          id: `hatch-today-${ponte.id}`,
          type: 'warning',
          title: "Éclosion prévue AUJOURD'HUI !",
          description: `Vérifiez le nid de la ponte de ${pairName} (${ponte.oeufs} œufs).`,
          date: formattedDate,
          category: 'repro',
          actionLabel: "Déclarer naissances",
          tabTarget: "reproduction"
        });
      } else {
        alerts.push({
          id: `hatch-soon-${ponte.id}`,
          type: 'info',
          title: "Éclosion imminente",
          description: `Éclosion prévue le ${formattedDate} (${diffDays} jours restants) pour ${pairName}.`,
          date: formattedDate,
          category: 'repro',
          tabTarget: "reproduction"
        });
      }
    }
  });

  // 2. Weaning Alert (Sevrage: 30 days after birth)
  // Let's look for young canaries with date_naissance close to 30 days ago (around June 8th, 2026)
  canaris.forEach(bird => {
    if (bird.pere_id && bird.mere_id) {
      const birthDate = new Date(bird.date_naissance);
      const weaningDate = new Date(birthDate);
      weaningDate.setDate(birthDate.getDate() + 30);
      
      const diffTime = weaningDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If bird is young (born in last 45 days) and currently registered in breeding cage, recommend weaning
      if (diffDays >= -10 && diffDays <= 5 && bird.cage_id === 1) { // in parents cage
        const formattedDate = weaningDate.toISOString().split('T')[0];
        alerts.push({
          id: `wean-${bird.id}`,
          type: 'info',
          title: `Sevrage conseillé : ${bird.nom}`,
          description: `Né le ${bird.date_naissance}, ce jeune canari approche des 30 jours et devrait être transféré dans la volière des jeunes.`,
          date: formattedDate,
          category: 'repro',
          actionLabel: "Gérer cages",
          tabTarget: "cages"
        });
      }
    }
  });

  // 3. Health Treatments Reminder & follow-ups
  sante.forEach(record => {
    const bird = canaris.find(c => c.id === record.canari_id);
    const recordDate = new Date(record.date);
    const diffTime = recordDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (record.statut === 'En attente') {
      const formattedDate = record.date;
      if (diffDays < 0) {
        alerts.push({
          id: `sante-late-${record.id}`,
          type: 'warning',
          title: `⚠️ Traitement en retard : ${record.traitement}`,
          description: `Devait être administré le ${formattedDate} (retard de ${Math.abs(diffDays)} jours) pour ${bird ? `${bird.nom} (${bird.bague})` : 'le canari'}. ${record.description ? `Note: ${record.description}` : ''}`,
          date: formattedDate,
          category: 'sante',
          actionLabel: "Voir fiches",
          tabTarget: "sante",
          santeId: record.id
        });
      } else if (diffDays === 0) {
        alerts.push({
          id: `sante-today-${record.id}`,
          type: 'warning',
          title: `🚨 SOIN À FAIRE AUJOURD'HUI : ${record.traitement}`,
          description: `Soin ou vaccin requis aujourd'hui pour ${bird ? `${bird.nom} (${bird.bague})` : 'le canari'}. ${record.description ? `Note: ${record.description}` : ''}`,
          date: formattedDate,
          category: 'sante',
          actionLabel: "Voir fiches",
          tabTarget: "sante",
          santeId: record.id
        });
      } else if (diffDays <= 10) { // Show upcoming health treatments up to 10 days in advance
        alerts.push({
          id: `sante-soon-${record.id}`,
          type: 'info',
          title: `🩺 Traitement programmé : ${record.traitement}`,
          description: `Prévu le ${formattedDate} (dans ${diffDays} jours) pour ${bird ? `${bird.nom} (${bird.bague})` : 'le canari'}. ${record.description ? `Note: ${record.description}` : ''}`,
          date: formattedDate,
          category: 'sante',
          actionLabel: "Voir fiches",
          tabTarget: "sante",
          santeId: record.id
        });
      }
    } else if (record.categorie === 'Symptôme') {
      // Follow-up on symptoms recorded in the last 7 days
      const daysSinceSymptom = -diffDays;
      if (daysSinceSymptom >= 0 && daysSinceSymptom <= 7) {
        alerts.push({
          id: `sante-symptome-follow-${record.id}`,
          type: 'info',
          title: `🩺 Suivi Symptôme : ${record.traitement}`,
          description: `Symptôme signalé il y a ${daysSinceSymptom} jour(s) (${record.date}) pour ${bird ? `${bird.nom} (${bird.bague})` : 'le canari'}. Veuillez vérifier si le canari se rétablit correctement.`,
          date: record.date,
          category: 'sante',
          actionLabel: "Fiche santé",
          tabTarget: "sante"
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
    return alert.category !== 'system'; // 'all' displays both 'repro' and 'sante'
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
    { id: 'canaris', label: t('canaris'), icon: Bird, count: totalBirds, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'couples', label: t('couples'), icon: Heart, count: activeCouples, color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { id: 'reproduction', label: t('reproduction'), icon: Egg, count: activeRepros, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { id: 'cages', label: t('cages'), icon: Grid, count: cages.length, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'sante', label: t('sante'), icon: Activity, count: sante.length, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'calendrier', label: t('calendrier'), icon: Calendar, count: null, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { id: 'statistiques', label: t('statistiques'), icon: BarChart3, count: null, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header section with status overview */}
      <AppCard padding="lg" title={t('breedingOverview')} borderColor="border-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm font-medium text-slate-500">{t('totalEffectif')}</div>
            <div className="text-3xl font-bold text-slate-800 mt-1 flex items-baseline gap-1">
              {totalBirds}
              <span className="text-xs font-normal text-slate-500">{t('canariesLabel')}</span>
            </div>
            <div className="text-xs text-slate-400 mt-2 flex gap-2">
              <span className="text-blue-500 font-semibold">♂ {males}</span>
              <span className="text-rose-500 font-semibold">♀ {females}</span>
              <span className="text-slate-500">? {indet}</span>
            </div>
          </div>
 
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm font-medium text-slate-500">{t('activeCouples')}</div>
            <div className="text-3xl font-bold text-slate-800 mt-1">
              {activeCouples}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {t('readyForRepro')}
            </div>
          </div>
 
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm font-medium text-slate-500 font-semibold text-yellow-600">{t('ongoingPontes')}</div>
            <div className="text-3xl font-bold text-slate-800 mt-1 flex items-baseline gap-1">
              {activeRepros}
              <span className="text-xs font-normal text-slate-500">{t('reproCycles')}</span>
            </div>
            <div className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
              <Egg className="w-3.5 h-3.5" /> {t('activeEggs', { eggs: totalActiveEggs })}
            </div>
          </div>
 
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-sm font-medium text-slate-500">{t('financialBalance')}</div>
            {(() => {
              const totalExpenses = depenses.reduce((acc, d) => acc + d.montant, 0);
              const totalSales = ventes.reduce((acc, v) => acc + v.prix, 0);
              const solde = totalSales - totalExpenses;
              return (
                <>
                  <div className={`text-2xl font-bold mt-1 ${solde >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {solde >= 0 ? '+' : ''}{solde.toFixed(3)} DT
                  </div>
                  <div className="text-xs text-slate-400 mt-2 flex justify-between gap-1">
                    <span>{t('expensesShort')}: {totalExpenses.toFixed(3)} DT</span>
                    <span>{t('salesShort')}: {totalSales.toFixed(3)} DT</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </AppCard>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts section */}
        <div className="lg:col-span-2 space-y-4">
          <AppCard padding="lg" className="h-full flex flex-col" borderColor="border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">{t('alertsTitle')}</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded self-start sm:self-auto">
                {t('todayLabel')} : 08/07/2026
              </span>
            </div>

            {/* Segmented controls */}
            <div className="grid grid-cols-3 sm:flex border-b border-slate-100 pb-3 mb-4 gap-2 text-xs font-semibold sm:overflow-x-auto">
              <button
                type="button"
                onClick={() => setAlertFilter('all')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center leading-tight whitespace-normal sm:whitespace-nowrap ${
                  alertFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t('allAlertsCount', { count: allAlertsCount })}
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('repro')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center leading-tight whitespace-normal sm:whitespace-nowrap ${
                  alertFilter === 'repro'
                    ? 'bg-rose-50 text-rose-700 border border-rose-100 font-bold'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t('reproAlertsCount', { count: reproAlertsCount })}
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('sante')}
                className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center leading-tight whitespace-normal sm:whitespace-nowrap ${
                  alertFilter === 'sante'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 font-bold'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t('santeAlertsCount', { count: santeAlertsCount })}
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : alert.type === 'info'
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
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
                    <h4 className="font-semibold text-sm leading-tight">{alert.title}</h4>
                    <p className="text-xs opacity-90 mt-1 leading-relaxed">{alert.description}</p>
                    <div className="flex items-center justify-between gap-4 mt-2.5">
                      {alert.actionLabel && alert.tabTarget && (
                        <button
                           onClick={() => setCurrentTab(alert.tabTarget!)}
                           className="text-xs font-semibold underline hover:opacity-85 flex items-center gap-1 cursor-pointer"
                        >
                           {alert.actionLabel} &rarr;
                        </button>
                      )}
                      {alert.santeId && onCompleteSanteRecord && (
                        <button
                          onClick={() => {
                            onCompleteSanteRecord!(alert.santeId!);
                          }}
                          className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                          title={t('validateSoin', 'Valider ce soin')}
                        >
                          <Check className="w-3.5 h-3.5" /> {t('validateSoin', 'Valider Soin')}
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
            borderColor="border-slate-100"
            title={t('quickActions')}
            subtitle={t('quickActionsDesc')}
          >
            <div className="space-y-3 mt-4">
              <button
                onClick={onQuickAddCanari}
                className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-medium rounded-xl border border-amber-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-200 text-amber-800 rounded-lg">
                    <Bird className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">{t('addCanary')}</span>
                </div>
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={onQuickAddCouple}
                className="w-full flex items-center justify-between p-3 bg-rose-50 hover:bg-rose-100 text-rose-950 font-medium rounded-xl border border-rose-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-rose-200 text-rose-800 rounded-lg">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">{t('formCouple')}</span>
                </div>
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={onQuickAddDepense}
                className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-medium rounded-xl border border-indigo-200 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-200 text-indigo-800 rounded-lg">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">{t('addExpense')}</span>
                </div>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-mono">{t('offlineActive')}</span>
            </div>
          </AppCard>
        </div>
      </div>

      {/* Grid of Modules */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('functionalModules')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentTab(m.id)}
                className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-center cursor-pointer group"
              >
                <div className={`p-3 rounded-xl mb-3 border transition-transform group-hover:scale-105 ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight block">{m.label}</span>
                {m.count !== null && (
                  <span className="mt-1 text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full">
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

// Minimal placeholder fallback icon
function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

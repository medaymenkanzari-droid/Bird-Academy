/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Egg, Calendar, AlertTriangle, Search, Filter, ArrowUpDown, CheckCircle, 
  TrendingUp, Activity 
} from 'lucide-react';
import { ClutchService } from '../clutches/services/ClutchService';
import { EggService } from '../eggs/services/EggService';
import { IncubationService } from '../incubation/services/IncubationService';
import { ReproductionEngine } from '../engines/ReproductionEngine';
import { ReproductionService } from '../services/ReproductionService';
import { useLanguage } from '../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../utils/bioTranslations';
import { AppCard, AppBadge, AppSelect, AppAlert, AppEmptyState, AppTable } from '../../../components/design-system';
import { ReproductionAnalyticsService, ReproductionDashboardItem } from '../services/ReproductionAnalyticsService';
import { getBreedingPairDisplayName } from '../utils/pairDisplay';

interface ReproductionDashboardProps {
  onSelectCouple: (pairId: string) => void;
}

export default function ReproductionDashboard({ onSelectCouple }: ReproductionDashboardProps) {
  const { language } = useLanguage();

  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const dict = BIO_TRANSLATIONS[language] || BIO_TRANSLATIONS['fr'];
    let text = dict[key] || BIO_TRANSLATIONS['fr'][key] || String(key);
    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(val));
      });
    }
    return text;
  }, [language]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'abandoned'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'eggs' | 'fertility'>('date');

  // Compute overall KPI aggregates via ReproductionAnalyticsService snapshot
  const snapshot = useMemo(() => {
    return ReproductionAnalyticsService.getSnapshot();
  }, []);

  const kpis = snapshot.metrics;

  // Compute daily biological alerts (Only applicable for active V2 clutches/eggs)
  const alerts = useMemo(() => {
    const list: Array<{ id: string; type: 'candling' | 'overdue'; message: string; pairId: string }> = [];
    if (snapshot.selectedSource !== 'v2') return list;

    const allClutches = ClutchService.getClutches();

    allClutches.forEach(c => {
      if (c.status !== 'active') return;

      // 1. Egg candling alerts (egg age is 6 days and not yet candled/inspected)
      const eggs = EggService.getEggsByClutch(c.id);
      eggs.forEach(e => {
        if (e.status === 'En incubation' || e.status === 'Pondu') {
          const age = ReproductionEngine.calculateEggAgeInDays(e.layingDate);
          if (age >= 6) {
            list.push({
              id: `candling-${e.id}`,
              type: 'candling',
              message: t('alertCandlingDue', { number: e.number, clutch: c.id.split('-')[1] || c.id }),
              pairId: c.pairId
            });
          }
        }
      });

      // 2. Overdue hatching alerts
      const incubation = IncubationService.getIncubationByClutch(c.id);
      if (incubation) {
        const cal = ReproductionEngine.calculateIncubationCalendar(incubation.startDate);
        if (cal.delayDays > 0) {
          list.push({
            id: `overdue-${incubation.id}`,
            type: 'overdue',
            message: t('alertOverdueHatch', { clutch: c.id.split('-')[1] || c.id, days: cal.delayDays }),
            pairId: c.pairId
          });
        }
      }
    });

    return list;
  }, [snapshot.selectedSource, t]);

  // Items List with filter & search
  const filteredItems = useMemo(() => {
    const all = snapshot.items;
    
    return all.filter(c => {
      const couple = ReproductionService.getPairById(c.pairId);
      const coupleName = getBreedingPairDisplayName(couple, '').toLowerCase();
      const matchSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || coupleName.includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'eggs') return b.eggCount - a.eggCount;
      if (sortBy === 'fertility') {
        const rateA = (a.eggCount > 0 && a.fertilizedCount !== null) ? (a.fertilizedCount / a.eggCount) : 0;
        const rateB = (b.eggCount > 0 && b.fertilizedCount !== null) ? (b.fertilizedCount / b.eggCount) : 0;
        return rateB - rateA;
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [snapshot.items, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Warning/Conflict Alert */}
      {snapshot.warnings.map((warning, idx) => (
        <div key={idx} className="mb-4">
          <AppAlert type="warning" title={t('attention')}>
            {t(warning)}
          </AppAlert>
        </div>
      ))}

      {/* KPIs Grid Rows */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-500">
            <Egg className="w-5 h-5 fill-amber-100" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">{t('kpiClutches')}</span>
            <span className="block text-lg font-extrabold text-slate-800">{kpis.clutchesCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-500">
            <Egg className="w-5 h-5 fill-blue-100" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">{t('kpiEggs')}</span>
            <span className="block text-lg font-extrabold text-slate-800">{kpis.totalEggs}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">{t('kpiFertility')}</span>
            <span className="block text-lg font-extrabold text-slate-800">
              {kpis.fertilityRate !== null ? `${kpis.fertilityRate}%` : t('notSpecified')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-lg text-purple-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">{t('kpiHatched')}</span>
            <span className="block text-lg font-extrabold text-slate-800">
              {kpis.hatchRate !== null ? `${kpis.hatchRate}%` : t('notSpecified')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">{t('kpiActiveIncubations')}</span>
            <span className="block text-lg font-extrabold text-slate-800">
              {kpis.activeIncubations !== null ? kpis.activeIncubations : t('notSpecified')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${alerts.length > 0 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">{t('kpiBiologicalAlerts')}</span>
            <span className="block text-lg font-extrabold text-slate-800">{alerts.length}</span>
          </div>
        </div>

      </div>

      {/* Biological Alerts Section */}
      <AppCard title={t('kpiBiologicalAlerts')} padding="md" className="border-red-100">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="text-xs font-bold text-slate-600">{t('alertNoAlerts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((al) => (
              <div 
                key={al.id}
                onClick={() => onSelectCouple(al.pairId)}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all hover:bg-slate-50 ${
                  al.type === 'overdue' 
                    ? 'border-red-100 bg-red-50/20 text-red-800' 
                    : 'border-amber-100 bg-amber-50/20 text-amber-800'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${al.type === 'overdue' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-relaxed">{al.message}</p>
                  <span className="text-[10px] opacity-60 block mt-1">{t('clickPourAcceder')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppCard>

      {/* Clutches List with Filters */}
      <AppCard padding="md" title={t('clutchGeneralRegistry')}>
        <div className="flex flex-wrap gap-3 items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('recherchePlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <AppSelect
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed' | 'abandoned')}
                options={[
                  { value: 'all', label: t('tousLesStatuts') },
                  { value: 'active', label: t('toutesEnCours') },
                  { value: 'completed', label: t('toutesTerminees') },
                  { value: 'abandoned', label: t('toutesAbandonnees') },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <AppSelect
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'date' | 'eggs' | 'fertility')}
              options={[
                { value: 'date', label: t('trierParDate') },
                { value: 'eggs', label: t('trierParNbOeufs') },
                { value: 'fertility', label: t('trierParFertilite') },
              ]}
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <AppEmptyState
            title={t('aucunePonteCorrespondante')}
            description={t('modifierCriteres')}
            className="py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <AppTable
              data={filteredItems}
              keyExtractor={(p: ReproductionDashboardItem) => p.id}
              columns={[
                { 
                  key: 'reproduction', 
                  header: t('reproductionLabel'), 
                  render: (p: ReproductionDashboardItem) => {
                    const couple = ReproductionService.getPairById(p.pairId);
                    const coupleName = getBreedingPairDisplayName(
                      couple,
                      t('coupleLabel', { id: p.pairId }),
                    );
                    return (
                      <div>
                        <span className="font-bold text-slate-700 block">
                          {coupleName}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {p.source === 'legacy' ? t('idPonteHistorique', { id: p.sourceId }) : t('idPonteV2', { id: p.sourceId })}
                        </span>
                      </div>
                    );
                  } 
                },
                { 
                  key: 'date', 
                  header: t('dateLabel'), 
                  render: (p: ReproductionDashboardItem) => <span>{p.startDate}</span> 
                },
                { 
                  key: 'status', 
                  header: t('statutLabel'), 
                  render: (p: ReproductionDashboardItem) => {
                    const variant = p.status === 'active' ? 'success' : p.status === 'abandoned' ? 'danger' : 'outline';
                    const label = p.status === 'active' ? t('enCours') : p.status === 'abandoned' ? t('abandonnee') : t('terminee');
                    return <AppBadge variant={variant}>{label}</AppBadge>;
                  }
                },
                { 
                  key: 'oeufs', 
                  header: t('oeufsLabel'), 
                  render: (p: ReproductionDashboardItem) => <span>{p.eggCount}</span> 
                },
                { 
                  key: 'oeufs_fecondes', 
                  header: t('oeufsFecondesLabel'), 
                  render: (p: ReproductionDashboardItem) => (
                    <span>{p.fertilizedCount !== null ? p.fertilizedCount : t('notSpecified')}</span>
                  ) 
                },
                { 
                  key: 'eclosions', 
                  header: t('eclosionsLabel'), 
                  render: (p: ReproductionDashboardItem) => (
                    <span>{p.hatchedCount !== null ? p.hatchedCount : t('notSpecified')}</span>
                  ) 
                },
                { 
                  key: 'lost', 
                  header: t('pertesLabel'), 
                  render: (p: ReproductionDashboardItem) => (
                    <span>{p.lostCount !== null ? p.lostCount : t('notSpecified')}</span>
                  ) 
                }
              ]}
            />
          </div>
        )}
      </AppCard>

    </div>
  );
}

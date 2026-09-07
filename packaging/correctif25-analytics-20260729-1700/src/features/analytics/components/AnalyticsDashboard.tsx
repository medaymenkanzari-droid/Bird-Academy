/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAnalyticsTranslation } from '../hooks/useAnalyticsTranslation';
import { AnalyticsService } from '../services/AnalyticsService';
import { AnalyticsFilters, AnalyticsSettings, KPIDefinition, AnalyticsSnapshot } from '../types';
import { AnalyticsSettingsRepository } from '../repositories/AnalyticsSettingsRepository';
import { CalendarEngine } from '../../../business/CalendarEngine';

import { 
  MetricCard, BigNumber, TrendCard, KPIBadge, VariationChip, ChartCard, InsightCard, ProgressRing, ExecutiveTile 
} from '../widgets/AnalyticsWidgets';

import { 
  AnalyticsLineChart, AnalyticsBarChart, AnalyticsPieChart, AnalyticsRadarChart, AnalyticsHeatMap, AnalyticsTimeline 
} from '../charts/GraphEngine';

import { ReportBuilder } from '../reports/ReportBuilder';
import { ExportCenter } from '../exports/ExportCenter';

import { 
  BarChart3, ShieldAlert, Sparkles, SlidersHorizontal, Settings, RefreshCw, Layers, History, HelpCircle, 
  TrendingUp, Calendar, Info, CheckCircle, Save, Trash2, ArrowUpRight, ArrowDownRight, Users, Heart, Egg, Home, Activity, FileText 
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { at, language, isRtl } = useAnalyticsTranslation();
  
  // Tabs: executive, reports, exports, comparisons, snapshots, settings
  const [activeTab, setActiveTab] = useState<'executive' | 'reports' | 'exports' | 'comparisons' | 'snapshots' | 'settings'>('executive');
  
  // Settings & Objectives State
  const [settings, setSettings] = useState(() => AnalyticsSettingsRepository.getSettings());
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<AnalyticsFilters>({
    species: '',
    breed: '',
    mutation: '',
    installation: '',
    zone: '',
    aviary: '',
    cage: '',
    startDate: '',
    endDate: '',
    sex: undefined,
    status: '',
    origin: 'all'
  });

  // Load raw data to populate filter options dynamically
  const rawData = useMemo(() => {
    return AnalyticsService.getAggregateData();
  }, []);

  // Extract dynamic distinct options currently active in the database
  const filterOptions = useMemo(() => {
    const speciesSet = new Set<string>();
    const breedsSet = new Set<string>();
    const mutationsSet = new Set<string>();
    const zonesSet = new Set<string>();
    const aviariesSet = new Set<string>();
    const cagesSet = new Set<string>();

    rawData.birds.forEach(b => {
      if (b.espece) speciesSet.add(b.espece);
      if (b.race) breedsSet.add(b.race);
      if (b.mutation) mutationsSet.add(b.mutation);
      if (b.zone) zonesSet.add(b.zone);
      if (b.voliere) aviariesSet.add(b.voliere);
      if (b.cage_id) cagesSet.add(String(b.cage_id));
    });

    return {
      species: Array.from(speciesSet),
      breeds: Array.from(breedsSet),
      mutations: Array.from(mutationsSet),
      zones: Array.from(zonesSet),
      aviaries: Array.from(aviariesSet),
      cages: Array.from(cagesSet)
    };
  }, [rawData]);

  // Handle Quick Date Period shortcuts
  const handlePeriodShortcut = (period: 'all' | 'year' | 'quarter' | 'month') => {
    const now = new Date();
    const format = (d: Date) => d.toISOString().slice(0, 10);
    
    if (period === 'all') {
      setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
    } else if (period === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      setFilters(prev => ({ ...prev, startDate: format(start), endDate: format(now) }));
    } else if (period === 'quarter') {
      const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), qStartMonth, 1);
      setFilters(prev => ({ ...prev, startDate: format(start), endDate: format(now) }));
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setFilters(prev => ({ ...prev, startDate: format(start), endDate: format(now) }));
    }
  };

  // Re-compute all KPIs dynamically when filters or settings update
  const kpis = useMemo(() => {
    return AnalyticsService.getKPIs(filters);
  }, [filters, settings]);

  // Year-over-Year comparison data
  const yoyComparison = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return AnalyticsService.getYearlyComparison(currentYear);
  }, [settings]);

  // Snapshots State
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [snapshotCreatedMsg, setSnapshotCreatedMsg] = useState(false);

  useEffect(() => {
    setSnapshots(AnalyticsService.getSnapshots());
  }, []);

  const handleCaptureSnapshot = () => {
    if (!newSnapshotLabel.trim()) return;
    AnalyticsService.captureSnapshot(newSnapshotLabel.trim(), filters);
    setSnapshots(AnalyticsService.getSnapshots());
    setNewSnapshotLabel('');
    setSnapshotCreatedMsg(true);
    setTimeout(() => setSnapshotCreatedMsg(false), 3000);
  };

  const handleDeleteSnapshot = (id: string) => {
    const filtered = snapshots.filter(s => s.id !== id);
    setSnapshots(filtered);
    // Sync with storage
    localStorage.setItem('bird_academy_analytics_snapshots', JSON.stringify(filtered));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    AnalyticsSettingsRepository.saveSettings(settings);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // 30-day statistical forecasting simulation (fully local and deterministic)
  const forecastProjections = useMemo(() => {
    const fertile = Number(kpis.fertility_rate?.value || 0);
    const totalClutches = Number(kpis.clutches_count?.value || 0);

    // A forecast is only shown when a real clutch sample exists.
    const predictedNewEggs = Math.round(totalClutches > 0 ? (totalClutches * 4.2 * (fertile / 100)) : 0);
    const predictedWeanings = Math.round(predictedNewEggs * 0.72);
    const expectedDQIProgress = Math.min(100, Math.round(Number(kpis.data_quality_index?.value || 0) * 1.05));

    return {
      eggs: predictedNewEggs,
      weaned: predictedWeanings,
      dqi: expectedDQIProgress
    };
  }, [kpis]);

  // Dynamic biological warnings
  const activeAlerts = useMemo(() => {
    const alerts: { title: string; message: string; type: 'warning' | 'danger' }[] = [];
    
    const coi = Number(kpis.average_inbreeding?.value || 0);
    const dqi = Number(kpis.data_quality_index?.value || 0);
    const density = Number(kpis.overoccupied_cages?.value || 0);

    if (coi >= 12.5) {
      alerts.push({
        title: at('alertHighCoiTitle'),
        message: at('alertHighCoiMessage', { coi }),
        type: 'danger'
      });
    } else if (coi > 6.25) {
      alerts.push({
        title: at('alertModerateCoiTitle'),
        message: at('alertModerateCoiMessage', { coi }),
        type: 'warning'
      });
    }

    if (density > 0) {
      alerts.push({
        title: at('alertOvercrowdingTitle'),
        message: at('alertOvercrowdingMessage', { density }),
        type: 'danger'
      });
    }

    if (dqi < 80) {
      alerts.push({
        title: at('alertLowDqiTitle'),
        message: at('alertLowDqiMessage', { dqi }),
        type: 'warning'
      });
    }

    return alerts;
  }, [kpis, language]);

  // Actual birth distribution for the current and previous year.
  const trendChartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const locale = language === 'ar' ? 'ar-TN' : language;
    return Array.from({ length: 12 }, (_, month) => {
      const countFor = (year: number) => rawData.birds.filter(bird => {
        const parsed = CalendarEngine.parseDate(bird.date_naissance);
        return parsed?.year === year && parsed.month === month;
      }).length;
      return {
        name: new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(currentYear, month, 1)),
        value: countFor(currentYear),
        value2: countFor(currentYear - 1),
      };
    });
  }, [rawData, language]);

  // Dynamic distribution lists for local charts
  const breedChartData = useMemo(() => {
    const map: Record<string, number> = {};
    rawData.birds.forEach(b => {
      const key = b.race || 'Classique';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [rawData]);

  const activityDates = useMemo(() => {
    const today = CalendarEngine.getTodayParts();
    const todayKey = `${today.year}-${String(today.month + 1).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    return Array.from({ length: 5 }, (_, index) => CalendarEngine.addDays(todayKey, index - 4) ?? todayKey);
  }, []);

  const activityDateLabels = useMemo(() => {
    const locale = language === 'ar' ? 'ar-TN' : language;
    return activityDates.map(date => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(`${date}T12:00:00`)));
  }, [activityDates, language]);

  const heatmapData = useMemo(() => [
    { label: at('activityLayings'), values: activityDates.map(date => rawData.clutches.filter(item => item.date === date).length) },
    { label: at('activityHatches'), values: activityDates.map(date => rawData.clutches.filter(item => CalendarEngine.addDays(item.date, 13) === date).length) },
    { label: at('activityWeanings'), values: activityDates.map(date => rawData.clutches.filter(item => item.sevrages !== undefined && item.sevrages > 0 && item.date === date).length) },
    { label: at('activityTreatments'), values: activityDates.map(date => rawData.healthRecords.filter(item => item.date === date).length) },
  ], [activityDates, rawData, language]);

  const recentActivityItems = useMemo(() => {
    const clutchItems = rawData.clutches.map(item => ({
      title: at('activityClutchTitle', { eggs: item.oeufs }),
      date: item.date,
      tag: at('activityReproductionTag'),
    }));
    const healthItems = rawData.healthRecords.map(item => ({
      title: at('activityHealthTitle', { treatment: item.traitement }),
      date: item.date,
      tag: at('activityHealthTag'),
    }));
    return [...clutchItems, ...healthItems]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  }, [rawData, language]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* Header section with Premium visual identity */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-indigo-100 dark:shadow-none">
              <BarChart3 className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-slate-850 dark:text-white">
                {at('dashboardTitle')}
              </h1>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {at('dashboardSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Quick-actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Refresh state
              window.location.reload();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
            title={at('refreshKpis')}
            aria-label={at('refreshKpis')}
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          
          <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {at('offlineBadge')}
          </span>
        </div>
      </div>

      {/* Global Filters Panel */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-slate-200">
              {at('filterTitle')}
            </h3>
          </div>
          <div className="flex gap-1.5">
            <button 
              onClick={() => handlePeriodShortcut('all')}
              className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              {at('periodAllShort')}
            </button>
            <button 
              onClick={() => handlePeriodShortcut('year')}
              className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              {at('periodYearShort')}
            </button>
            <button 
              onClick={() => handlePeriodShortcut('quarter')}
              className="px-2.5 py-1 text-[9px] font-black uppercase rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              {at('periodQuarterShort')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          
          {/* Species */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">{at('filterSpecies')}</label>
            <select
              value={filters.species || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
            >
              <option value="">{at('allSpecies')}</option>
              {filterOptions.species.map(sp => (
                <option key={sp} value={sp}>{sp === 'canari' ? 'Canari' : sp}</option>
              ))}
            </select>
          </div>

          {/* Breed */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">{at('filterBreed')}</label>
            <select
              value={filters.breed || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
            >
              <option value="">{at('allBreeds')}</option>
              {filterOptions.breeds.map(br => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Mutation */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">{at('filterMutation')}</label>
            <select
              value={filters.mutation || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, mutation: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
            >
              <option value="">{at('allMutations')}</option>
              {filterOptions.mutations.map(mt => (
                <option key={mt} value={mt}>{mt}</option>
              ))}
            </select>
          </div>

          {/* Zone */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">{at('filterZone')}</label>
            <select
              value={filters.zone || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
            >
              <option value="">{at('allZones')}</option>
              {filterOptions.zones.map(zn => (
                <option key={zn} value={zn}>{zn}</option>
              ))}
            </select>
          </div>

          {/* Cage */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">{at('filterCage')}</label>
            <select
              value={filters.cage || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, cage: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
            >
              <option value="">{at('allCages')}</option>
              {filterOptions.cages.map(cg => (
                <option key={cg} value={cg}>Cage #{cg}</option>
              ))}
            </select>
          </div>

          {/* Origin */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">{at('filterOrigin')}</label>
            <select
              value={filters.origin || 'all'}
              onChange={(e) => setFilters(prev => ({ ...prev, origin: e.target.value as AnalyticsFilters['origin'] }))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none"
            >
              <option value="all">{at('allOrigins')}</option>
              <option value="internal">{at('originInternal')}</option>
              <option value="external">{at('originExternal')}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 gap-1 overflow-x-auto pb-1">
        {[
          { id: 'executive', label: at('tabExecutive'), icon: Layers },
          { id: 'reports', label: at('tabReports'), icon: FileText },
          { id: 'exports', label: at('tabExports'), icon: RefreshCw },
          { id: 'comparisons', label: at('tabComparisons'), icon: TrendingUp },
          { id: 'snapshots', label: at('tabSnapshots'), icon: History },
          { id: 'settings', label: at('tabSettings'), icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Workspace Render */}
      <div>
        
        {/* EXECUTIVE DASHBOARD */}
        {activeTab === 'executive' && (
          <div className="space-y-6">
            
            {/* Visual Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard 
                title={at('kpiTotalBirds')} 
                value={String(kpis.total_birds?.value || 0)} 
                icon={Users} 
                description={at('metricPopulationDesc')}
                status="success"
              />
              <MetricCard 
                title={at('kpiFertility')} 
                value={String(kpis.fertility_rate?.value || 0)} 
                unit="%"
                icon={Heart} 
                description={at('metricFertilityDesc')}
                status={Number(kpis.fertility_rate?.value || 0) >= settings.fertilityTarget ? 'success' : 'warning'}
              />
              <MetricCard 
                title={at('kpiWeaning')} 
                value={String(kpis.weaning_rate?.value || 0)} 
                unit="%"
                icon={Egg} 
                description={at('metricWeaningDesc')}
                status={Number(kpis.weaning_rate?.value || 0) >= settings.weaningTarget ? 'success' : 'warning'}
              />
              <MetricCard 
                title={at('kpiNetCashFlow')} 
                value={String(kpis.net_cashflow?.value || 0)} 
                unit={settings.currency}
                icon={TrendingUp} 
                description={at('metricCashflowDesc')}
                status={Number(kpis.net_cashflow?.value || 0) >= 0 ? 'success' : 'danger'}
              />
              <MetricCard 
                title={at('kpiInbreedingAvg')} 
                value={String(kpis.average_inbreeding?.value || 0)} 
                unit="%"
                icon={History} 
                description={at('metricCoiDesc')}
                status={Number(kpis.average_inbreeding?.value || 0) < 6.25 ? 'success' : 'danger'}
              />
              <MetricCard 
                title={at('kpiDataQualityIndex')} 
                value={String(kpis.data_quality_index?.value || 0)} 
                unit="%"
                icon={Activity} 
                description={at('metricDqiDesc')}
                status={kpis.data_quality_index?.status}
              />
            </div>

            {/* Main Graphs & Statistics charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Primary Line Chart comparing current year vs last year */}
              <div className="lg:col-span-2">
                <ChartCard 
                  title={at('birthTrendTitle')}
                  subtitle={at('birthTrendSubtitle')}
                >
                  <AnalyticsLineChart data={trendChartData} yKey2="value2" currentLabel={at('currentYearLegend')} previousLabel={at('previousYearLegend')} />
                </ChartCard>
              </div>

              {/* Pie Chart of breed distribution */}
              <div>
                <ChartCard 
                  title={at('breedDistributionTitle')}
                  subtitle={at('breedDistributionSubtitle')}
                >
                  <AnalyticsPieChart data={breedChartData} />
                </ChartCard>
              </div>

            </div>

            {/* Alerts, Projections & Timeline Events */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Dynamic expert system warnings */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>{at('criticalAlerts')} ({activeAlerts.length})</span>
                </h4>
                <div className="space-y-3">
                  {activeAlerts.length > 0 ? (
                    activeAlerts.map((alt, idx) => (
                      <InsightCard key={idx} title={alt.title} type={alt.type} message={alt.message} />
                    ))
                  ) : (
                    <InsightCard title={at('noAnomalyTitle')} type="success" message={at('noAnomalyMessage')} />
                  )}
                </div>
              </div>

              {/* 30-day statistical forecasts */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>{at('performanceForecasts')}</span>
                </h4>
                
                <div className="p-5 bg-indigo-600 rounded-2xl text-white space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 font-black text-6xl select-none translate-x-3 -translate-y-3">30D</div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-80">{at('forecastLabel')}</span>
                    <h5 className="text-sm font-black uppercase">{at('forecastModelTitle')}</h5>
                  </div>
                  
                  <div className="space-y-3 pt-2 border-t border-indigo-500/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="opacity-90">{at('forecastFertileEggs')}</span>
                      <span className="font-mono font-black">+{forecastProjections.eggs}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="opacity-90">{at('forecastWeanings')}</span>
                      <span className="font-mono font-black">+{forecastProjections.weaned}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="opacity-90">{at('forecastDqi')}</span>
                      <span className="font-mono font-black">{forecastProjections.dqi}%</span>
                    </div>
                  </div>
                </div>

                <ProgressRing value={forecastProjections.dqi} targetValue={98} label={at('dqiProgress')} targetLabel={at('targetLabel')} />
              </div>

              {/* Recent activity & Timeline heatmap events */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{at('recentActivity')}</span>
                </h4>
                
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
                  <AnalyticsHeatMap gridData={heatmapData} columnLabels={activityDateLabels} eventLabel={at('eventsLabel')} />
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                    {recentActivityItems.length > 0
                      ? <AnalyticsTimeline items={recentActivityItems} />
                      : <p className="text-[10px] text-slate-400 text-center py-3">{at('noRecentActivity')}</p>}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* REPORT BUILDER TAB */}
        {activeTab === 'reports' && (
          <ReportBuilder filters={filters} />
        )}

        {/* EXPORT CENTER TAB */}
        {activeTab === 'exports' && (
          <ExportCenter filters={filters} />
        )}

        {/* ANALYTICAL COMPARISONS */}
        {activeTab === 'comparisons' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {at('comparisonTitle')}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Comparez les performances consolidées de l'exercice en cours contre l'année précédente (N-1).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <TrendCard 
                title="Sujets Totaux enregistrés" 
                currentValue={yoyComparison.total_birds?.current || 0}
                pastValue={yoyComparison.total_birds?.past || 0}
                changePct={yoyComparison.total_birds?.changePct || 0}
                unit=" oiseaux"
              />
              
              <TrendCard 
                title="Taux de Fertilité global" 
                currentValue={yoyComparison.fertility_rate?.current || 0}
                pastValue={yoyComparison.fertility_rate?.past || 0}
                changePct={yoyComparison.fertility_rate?.changePct || 0}
                unit="%"
              />

              <TrendCard 
                title="Taux de Sevrage des jeunes" 
                currentValue={yoyComparison.weaning_rate?.current || 0}
                pastValue={yoyComparison.weaning_rate?.past || 0}
                changePct={yoyComparison.weaning_rate?.changePct || 0}
                unit="%"
              />

              <TrendCard 
                title="Trésorerie / Cash-Flow net" 
                currentValue={yoyComparison.net_cashflow?.current || 0}
                pastValue={yoyComparison.net_cashflow?.past || 0}
                changePct={yoyComparison.net_cashflow?.changePct || 0}
                unit={` ${settings.currency}`}
              />

              <TrendCard 
                title="Coefficient de consanguinité Wright" 
                currentValue={yoyComparison.average_inbreeding?.current || 0}
                pastValue={yoyComparison.average_inbreeding?.past || 0}
                changePct={yoyComparison.average_inbreeding?.changePct || 0}
                unit="%"
                invertTrendColor
              />

              <TrendCard 
                title="Indice de traçabilité (DQI)" 
                currentValue={yoyComparison.data_quality_index?.current || 0}
                pastValue={yoyComparison.data_quality_index?.past || 0}
                changePct={yoyComparison.data_quality_index?.changePct || 0}
                unit="%"
              />

            </div>
          </div>
        )}

        {/* SNAPSHOTS CAPTURE & HISTORIC BACKUPS */}
        {activeTab === 'snapshots' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {at('snapshotTitle')}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Figez les indicateurs clés de votre élevage dans le temps pour analyser l'évolution saisonnière ou trimestrielle de votre cheptel.
              </p>
            </div>

            {/* Input field to trigger snapshot capture */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Figer l'état actuel de l'aviary</h4>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Ex : Fin de saison reproduction 2026, T3 2026..."
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                />
                <button
                  onClick={handleCaptureSnapshot}
                  disabled={!newSnapshotLabel.trim()}
                  className={`px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer ${
                    !newSnapshotLabel.trim() ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {at('snapshotBtn')}
                </button>
              </div>

              {snapshotCreatedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 w-fit">
                  <CheckCircle className="w-4 h-4" />
                  <span>{at('snapshotCreated')}</span>
                </div>
              )}
            </div>

            {/* List of captured snapshots */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Archives de Snapshots sauvegardés</h4>
              {snapshots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {snapshots.map(snap => (
                    <div key={snap.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-1.5">
                          <History className="w-4 h-4 text-indigo-500 shrink-0" />
                          <h5 className="text-xs font-black text-slate-800 dark:text-slate-200">{snap.label}</h5>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">Date : {new Date(snap.timestamp).toLocaleString()}</p>
                        
                        <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-semibold text-slate-500 border-t border-slate-50 dark:border-slate-800">
                          <div>Sujets : <span className="font-mono text-slate-800 dark:text-slate-200">{snap.kpis.total_birds || 0}</span></div>
                          <div>Fertilité : <span className="font-mono text-slate-800 dark:text-slate-200">{snap.kpis.fertility_rate || 0}%</span></div>
                          <div>DQI : <span className="font-mono text-slate-800 dark:text-slate-200">{snap.kpis.data_quality_index || 0}%</span></div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                        title={at('snapshotDelete')}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic font-medium">{at('snapshotEmpty')}</p>
              )}
            </div>

          </div>
        )}

        {/* SETUP GOALS & THRESHOLDS PARAMETERS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50 dark:border-slate-800">
              <Settings className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-slate-200">
                {at('settingsTitle')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wide text-slate-550 block">{at('settingsCurrency')}</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="DZD">Dinar (DZD)</option>
                  <option value="GBP">Livre Sterling (£)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wide text-slate-550 block">{at('settingsNumberFormat')}</label>
                <select
                  value={settings.numberFormat}
                  onChange={(e) => setSettings(prev => ({ ...prev, numberFormat: e.target.value as AnalyticsSettings['numberFormat'] }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none"
                >
                  <option value="fr">Format français (1 234,56)</option>
                  <option value="en">Format anglais (1,234.56)</option>
                </select>
              </div>

            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {at('settingsTargets')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-550 block">{at('settingsTargetFertility')}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.fertilityTarget}
                    onChange={(e) => setSettings(prev => ({ ...prev, fertilityTarget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-550 block">{at('settingsTargetHatching')}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.hatchingTarget}
                    onChange={(e) => setSettings(prev => ({ ...prev, hatchingTarget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-550 block">{at('settingsTargetWeaning')}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.weaningTarget}
                    onChange={(e) => setSettings(prev => ({ ...prev, weaningTarget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-550 block">{at('settingsTargetRevenue')}</label>
                  <input
                    type="number"
                    min={0}
                    value={settings.revenueTarget}
                    onChange={(e) => setSettings(prev => ({ ...prev, revenueTarget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-550 block">{at('settingsTargetSurvival')}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.survivalTarget}
                    onChange={(e) => setSettings(prev => ({ ...prev, survivalTarget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none font-mono"
                  />
                </div>

              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
              {settingsSavedMsg ? (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">
                  <CheckCircle className="w-4 h-4" />
                  <span>{at('settingsSaved')}</span>
                </div>
              ) : <span />}

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{at('settingsSave')}</span>
              </button>
            </div>
          </form>
        )}

      </div>

    </div>
  );
};
export default AnalyticsDashboard;

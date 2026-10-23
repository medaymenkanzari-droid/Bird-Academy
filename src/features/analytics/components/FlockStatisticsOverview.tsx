/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION V1.9.7
 * FLOCK STATISTICS OVERVIEW (COMPOSANT TABLEAU DE BORD & STATISTIQUES FACTUELLES)
 */

import React, { useState, useMemo } from 'react';
import { 
  Bird, Heart, Egg, Grid, Activity, Calendar, Info, AlertTriangle, 
  Layers, ShieldAlert, Sparkles, HelpCircle, CheckCircle, Clock, ChevronRight
} from 'lucide-react';
import { Canari, Couple, Ponte, Sante, Cage } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { DashboardStatisticsService, FlockStatisticsSnapshot } from '../services/DashboardStatisticsService';
import { LocalTextAssistantEngine } from '../../assistant/services/LocalTextAssistantEngine';
import { AppCard, AppButton, AppBadge, AppKpiCard } from '../../../components/design-system';

export interface FlockStatisticsOverviewProps {
  canaris?: Canari[];
  cages?: Cage[];
  couples?: Couple[];
  pontes?: Ponte[];
  sante?: Sante[];
  onNavigateTab?: (tab: string) => void;
}

export const FlockStatisticsOverview: React.FC<FlockStatisticsOverviewProps> = ({
  canaris,
  cages,
  couples,
  pontes,
  sante,
  onNavigateTab
}) => {
  const { t, language, isRtl } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'reproduction' | 'habitat' | 'timeline' | 'quality'>('overview');
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [assistantExplanation, setAssistantExplanation] = useState<string | null>(null);

  // Snapshot déterministe 100% lecture seule
  const snapshot: FlockStatisticsSnapshot = useMemo(() => {
    return DashboardStatisticsService.computeSnapshot(canaris, pontes, couples, sante, language as any);
  }, [canaris, pontes, couples, sante, language]);

  const { demographics, reproduction, habitat, recentEvents, missingDataAudits, intelligenceSummary } = snapshot;

  const getFieldLabel = (): string => {
    const map: Record<string, string> = {
      fr: 'Date de naissance',
      en: 'Birth date',
      ar: 'تاريخ الميلاد',
      es: 'Fecha de nacimiento',
      it: 'Data di nascita'
    };
    return map[language] || map.fr;
  };

  // Actions de l'Assistant IA
  const handleAskAssistant = (action: 'summary' | 'simplify' | 'events' | 'incomplete') => {
    let result = '';
    if (action === 'summary') {
      result = LocalTextAssistantEngine.summarizeFlock(
        demographics.totalBirds,
        reproduction.activePairs,
        reproduction.totalEggs,
        habitat.occupiedCagesCount,
        language as any
      );
    } else if (action === 'simplify') {
      result = LocalTextAssistantEngine.simplifyDashboard(
        demographics.totalBirds,
        reproduction.activePairs,
        habitat.totalCages,
        language as any
      );
    } else if (action === 'events') {
      result = LocalTextAssistantEngine.summarizeRecentEvents(
        recentEvents.length,
        language as any
      );
    } else if (action === 'incomplete') {
      result = LocalTextAssistantEngine.explainIncompleteStatistic(
        getFieldLabel(),
        demographics.ageDistribution.knownCount,
        demographics.totalBirds,
        language as any
      );
    }
    setAssistantExplanation(result);
    setAssistantModalOpen(true);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'} data-testid="flock-statistics-overview">
      
      {/* 1. CARTE BIRD INTELLIGENCE : SYNTHÈSE DESCRIPTIVE FACTUELLE */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-500/5 to-transparent border border-amber-500/20 text-slate-800 dark:text-slate-100 shadow-xs">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                {t('intelligenceTitle') || 'Bird Intelligence : Analyse Descriptive de l\'Élevage'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {intelligenceSummary.statusSummary}
              </p>
            </div>
          </div>

          {/* Boutons d'aide pédagogique Assistant */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              data-testid="btn-assistant-summary"
              onClick={() => handleAskAssistant('summary')}
              className="text-xs px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold rounded-lg border border-amber-500/30 transition-colors cursor-pointer"
            >
              {t('assistantSummaryBtn') || 'Résumer mon élevage'}
            </button>
            <button
              type="button"
              data-testid="btn-assistant-simplify"
              onClick={() => handleAskAssistant('simplify')}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {t('assistantSimplifyBtn') || 'Simplifier le tableau'}
            </button>
          </div>
        </div>

        {/* Faits clés & alertes de complétude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-amber-500/10 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'ar' ? 'نقاط مرجعية موثقة' : language === 'en' ? 'Documented Key Facts' : language === 'es' ? 'Hechos clave documentados' : language === 'it' ? 'Fatti chiave documentati' : 'Faits Clés Documentés'}
            </span>
            {intelligenceSummary.highlights.map((h, i) => (
              <p key={i} className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{h}</span>
              </p>
            ))}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'ar' ? 'تنبيهات اكتمال السجلات' : language === 'en' ? 'Transparency & Missing Data' : language === 'es' ? 'Transparencia y Datos incompletos' : language === 'it' ? 'Trasparenza e Dati incompleti' : 'Transparence & Données Incomplètes'}
            </span>
            {intelligenceSummary.missingDataNotices.length > 0 ? (
              intelligenceSummary.missingDataNotices.map((m, i) => (
                <p key={i} className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{m}</span>
                </p>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">
                {language === 'ar' ? 'جميع السجلات الأساسية مكتملة وموثقة.' : language === 'en' ? 'All essential records contain documented data.' : language === 'es' ? 'Todas las fichas esenciales disponen de datos documentados.' : language === 'it' ? 'Tutte le schede essenziali dispongono di dati documentati.' : 'Toutes les fiches essentielles disposent de données documentées.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. ONGLETS DE NAVIGATION THÉMATIQUE */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto gap-4 text-xs font-bold pb-1">
        <button
          type="button"
          data-testid="tab-stats-overview"
          onClick={() => setActiveSubTab('overview')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeSubTab === 'overview' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          {t('tabOverview') || 'Vue Générale du Cheptel'}
        </button>
        <button
          type="button"
          data-testid="tab-stats-reproduction"
          onClick={() => setActiveSubTab('reproduction')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeSubTab === 'reproduction' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          {t('tabReproduction') || 'Reproduction & Pontes'}
        </button>
        <button
          type="button"
          data-testid="tab-stats-habitat"
          onClick={() => setActiveSubTab('habitat')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeSubTab === 'habitat' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          {t('tabHabitat') || 'Habitat & Logement'}
        </button>
        <button
          type="button"
          data-testid="tab-stats-timeline"
          onClick={() => setActiveSubTab('timeline')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeSubTab === 'timeline' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          {t('tabTimeline') || 'Chronologie des Événements'}
        </button>
        <button
          type="button"
          data-testid="tab-stats-quality"
          onClick={() => setActiveSubTab('quality')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeSubTab === 'quality' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          {t('tabQuality') || 'Audit des Données Manquantes'}
        </button>
      </div>

      {/* 3. SOUS-VUE : VUE GÉNÉRALE & DÉMOGRAPHIE */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {/* 4 Cartes KPI Standard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AppKpiCard
              title={t('flockTotalLabel') || 'Total Effectif'}
              value={demographics.totalBirds}
              subtitle={`♂ ${demographics.malesCount} | ♀ ${demographics.femalesCount} | ? ${demographics.unknownSexCount}`}
            />
            <AppKpiCard
              title={t('activePairsLabel') || 'Couples Actifs'}
              value={reproduction.activePairs}
              subtitle={`${reproduction.totalPairs} ${language === 'ar' ? 'أزواج مسجلة' : language === 'en' ? 'bonded pairs' : language === 'es' ? 'parejas formadas' : language === 'it' ? 'coppie formate' : 'couples formés'}`}
            />
            <AppKpiCard
              title={t('occupiedCagesLabel') || 'Cages Occupées'}
              value={`${habitat.occupiedCagesCount} / ${habitat.totalCages}`}
              subtitle={`${habitat.emptyCagesCount} ${language === 'ar' ? 'أقفاص فارغة' : language === 'en' ? 'free cages' : language === 'es' ? 'jaulas libres' : language === 'it' ? 'gabbie libere' : 'cages libres'}`}
            />
            <AppKpiCard
              title={t('quarantineLabel') || 'Quarantaine'}
              value={demographics.quarantineCount}
              subtitle={language === 'ar' ? 'عزل وقائي مستقل' : language === 'en' ? 'Sanitary isolation' : language === 'es' ? 'Aislamiento sanitario' : language === 'it' ? 'Isolamento sanitario' : 'Isolement sanitaire distinct'}
            />
          </div>

          {/* Répartition par Sexe & Espèce (Graphiques simples barres/donut CSS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Répartition par sexe */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                  {language === 'ar' ? 'توزيع الجنس' : language === 'en' ? 'Sex Distribution' : language === 'es' ? 'Distribución por sexo' : language === 'it' ? 'Distribuzione per sesso' : 'Répartition par Sexe'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {language === 'ar' ? 'يشمل غير المحدد (UNKNOWN)' : language === 'en' ? 'Undetermined (UNKNOWN) preserved' : language === 'es' ? 'Indeterminado (UNKNOWN) preservado' : language === 'it' ? 'Indeterminato (UNKNOWN) preservato' : 'Indéterminé (UNKNOWN) préservé'}
                </span>
              </div>

              {demographics.totalBirds === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  {language === 'ar' ? 'لا توجد بيانات متاحة.' : language === 'en' ? 'No data available.' : language === 'es' ? 'No hay datos disponibles.' : language === 'it' ? 'Nessun dato disponibile.' : 'Aucune donnée disponible.'}
                </p>
              ) : (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-blue-600 dark:text-blue-400">♂ {language === 'ar' ? 'ذكور' : language === 'en' ? 'Males' : language === 'es' ? 'Machos' : language === 'it' ? 'Maschi' : 'Mâles'}</span>
                      <span>{demographics.malesCount} ({Math.round((demographics.malesCount / demographics.totalBirds) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${(demographics.malesCount / demographics.totalBirds) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-rose-600 dark:text-rose-400">♀ {language === 'ar' ? 'إناث' : language === 'en' ? 'Females' : language === 'es' ? 'Hembras' : language === 'it' ? 'Femmine' : 'Femelles'}</span>
                      <span>{demographics.femalesCount} ({Math.round((demographics.femalesCount / demographics.totalBirds) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${(demographics.femalesCount / demographics.totalBirds) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-600 dark:text-amber-400">? {language === 'ar' ? 'غير محدد (UNKNOWN)' : language === 'en' ? 'Undetermined (UNKNOWN)' : language === 'es' ? 'Indeterminado (UNKNOWN)' : language === 'it' ? 'Indeterminato (UNKNOWN)' : 'Sexe Indéterminé (UNKNOWN)'}</span>
                      <span>{demographics.unknownSexCount} ({Math.round((demographics.unknownSexCount / demographics.totalBirds) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${(demographics.unknownSexCount / demographics.totalBirds) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Répartition par âge (avec mention des dates inconnues) */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                  {language === 'ar' ? 'الهيكل العمري' : language === 'en' ? 'Age Distribution' : language === 'es' ? 'Distribución por edad' : language === 'it' ? 'Distribuzione per età' : 'Distribution par Âge'}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  {demographics.ageDistribution.knownCount} {language === 'ar' ? 'طائر بتاريخ معروف' : language === 'en' ? 'bird(s) with known birth date' : language === 'es' ? 'ave(s) con fecha conocida' : language === 'it' ? 'volatile/i con data nota' : 'oiseau(x) avec date connue'}
                </span>
              </div>

              {demographics.ageDistribution.knownCount === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 italic space-y-1">
                  <p>{language === 'ar' ? 'لا توجد تواريخ ميلاد مسجلة.' : language === 'en' ? 'No birth date recorded.' : language === 'es' ? 'Sin fechas de nacimiento registradas.' : language === 'it' ? 'Nessuna data di nascita registrata.' : 'Aucune date de naissance enregistrée.'}</p>
                  <p className="text-[10px] text-amber-600 font-medium">{language === 'ar' ? 'المعلومة غير مسجلة: يلزم التحقق البشري.' : language === 'en' ? 'Information not documented: human review required.' : language === 'es' ? 'Información no documentada: verificación humana requerida.' : language === 'it' ? 'Informazione non inserita: verifica umana richiesta.' : 'Information non renseignée : vérification humaine nécessaire.'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{language === 'ar' ? 'أقل من سنة (شباب)' : language === 'en' ? '< 1 year (Young)' : language === 'es' ? '< 1 año (Jóvenes)' : language === 'it' ? '< 1 anno (Giovani)' : '< 1 an (Jeunes)'}</span>
                      <span>{demographics.ageDistribution.youngUnder1Year}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(demographics.ageDistribution.youngUnder1Year / demographics.ageDistribution.knownCount) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{language === 'ar' ? '1 إلى 4 سنوات (بالغون)' : language === 'en' ? '1 to 4 years (Adults)' : language === 'es' ? '1 a 4 años (Adultos)' : language === 'it' ? '1 a 4 anni (Adulti)' : '1 à 4 ans (Adultes)'}</span>
                      <span>{demographics.ageDistribution.adult1To4Years}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${(demographics.ageDistribution.adult1To4Years / demographics.ageDistribution.knownCount) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{language === 'ar' ? 'أكثر من 4 سنوات (كبار)' : language === 'en' ? '> 4 years (Seniors)' : language === 'es' ? '> 4 años (Adultos mayores)' : language === 'it' ? '> 4 anni (Senior)' : '> 4 ans (Séniors)'}</span>
                      <span>{demographics.ageDistribution.seniorOver4Years}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: `${(demographics.ageDistribution.seniorOver4Years / demographics.ageDistribution.knownCount) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {demographics.ageDistribution.missingCount > 0 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-800">
                  ⚠️ {demographics.ageDistribution.missingCount} {language === 'ar' ? 'طائر بدون تاريخ ميلاد (لا يتم استقراؤها اعتباطياً).' : language === 'en' ? 'bird(s) without birth date (no arbitrary extrapolation).' : language === 'es' ? 'ave(s) sin fecha de nacimiento (sin extrapolación arbitraria).' : language === 'it' ? 'volatile/i senza data di nascita (nessuna estrapolazione arbitraria).' : 'oiseau(x) sans date de naissance (aucune extrapolation arbitraire).'}
                </p>
              )}
            </div>

          </div>

          {/* Répartition par espèce */}
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider block">
              {language === 'ar' ? 'التوزيع حسب الأنواع' : language === 'en' ? 'Species Distribution' : language === 'es' ? 'Distribución por especie' : language === 'it' ? 'Distribuzione per specie' : 'Répartition par Espèce'}
            </span>

            {demographics.speciesDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                {language === 'ar' ? 'لا توجد بيانات متاحة.' : language === 'en' ? 'No data available.' : language === 'es' ? 'No hay datos disponibles.' : language === 'it' ? 'Nessun dato disponibile.' : 'Aucune donnée disponible.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {demographics.speciesDistribution.map((sp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-100 block">
                      {sp.species}
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-extrabold text-amber-600">{sp.count}</span>
                      <span className="text-[10px] text-slate-400">({sp.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. SOUS-VUE : REPRODUCTION & ÉLEVAGE */}
      {activeSubTab === 'reproduction' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AppKpiCard
              title={language === 'ar' ? 'إجمالي البيض' : language === 'en' ? 'Total Eggs' : language === 'es' ? 'Total de huevos' : language === 'it' ? 'Totale uova' : 'Total des Œufs'}
              value={reproduction.totalEggs}
              subtitle={`${reproduction.totalClutches} ${language === 'ar' ? 'محضنة مسجلة' : language === 'en' ? 'clutches recorded' : language === 'es' ? 'puestas registradas' : language === 'it' ? 'cove registrate' : 'pontes enregistrées'}`}
            />
            <AppKpiCard
              title={language === 'ar' ? 'البيض المخصب' : language === 'en' ? 'Fertilized Eggs' : language === 'es' ? 'Huevos fecundados' : language === 'it' ? 'Uova fecondate' : 'Œufs Fécondés'}
              value={reproduction.fertilizedEggs}
              subtitle={reproduction.fertilityRate !== null ? `${reproduction.fertilityRate.toFixed(1)}% (${language === 'ar' ? 'خصوبة' : language === 'en' ? 'fertility' : language === 'es' ? 'fertilidad' : language === 'it' ? 'fertilità' : 'fécondité'})` : (language === 'ar' ? 'لم يتم الفحص' : language === 'en' ? 'Not candled' : language === 'es' ? 'Sin mirar' : language === 'it' ? 'Non sperato' : 'Non miré')}
            />
            <AppKpiCard
              title={language === 'ar' ? 'التفقيس الفعلي' : language === 'en' ? 'Actual Hatches' : language === 'es' ? 'Eclosiones reales' : language === 'it' ? 'Schiuse effettive' : 'Éclosions Réelles'}
              value={reproduction.hatchedEggs}
              subtitle={reproduction.hatchRate !== null ? `${reproduction.hatchRate.toFixed(1)}% (${language === 'ar' ? 'المعدل الفعلي' : language === 'en' ? 'actual rate' : language === 'es' ? 'tasa real' : language === 'it' ? 'tasso effettivo' : 'taux réel'})` : (language === 'ar' ? 'قيد الحضانة' : language === 'en' ? 'In incubation' : language === 'es' ? 'En incubación' : language === 'it' ? 'In incubazione' : 'En incubation')}
            />
            <AppKpiCard
              title={language === 'ar' ? 'الطيور المفطومة' : language === 'en' ? 'Weaned Chicks' : language === 'es' ? 'Pichones destetados' : language === 'it' ? 'Giovani svezzati' : 'Jeunes Sevrés'}
              value={reproduction.weanedChicks}
              subtitle={`${reproduction.nurseryCount} ${language === 'ar' ? 'في الحضانة / EAM' : language === 'en' ? 'in nursery / hand-reared' : language === 'es' ? 'en guardería / EAM' : language === 'it' ? 'in nursery / EAM' : 'en nursery / EAM'}`}
            />
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider block">
              {language === 'ar' ? 'المعايير المعتمدة للإنتاج' : language === 'en' ? 'Reproduction Rates Traceability' : language === 'es' ? 'Trazabilidad de tasas de reproducción' : language === 'it' ? 'Tracciabilità dei tassi di riproduzione' : 'Traçabilité des Taux de Reproduction'}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? 'الحسابات مبنية حصرياً على المحاضن المفحوصة فعلياً دون افتراضات مسبقة. في حالة غياب الفحص، لا يتم استقراء أي خصوبة اعتباطية.'
                : language === 'en'
                ? 'Percentages are strictly calculated from clutches that underwent actual candling or inspection. Without candling, no arbitrary fertility is extrapolated.'
                : language === 'es'
                ? 'Los porcentajes se calculan estrictamente sobre puestas examinadas. Sin ovoscopia, no se extrapola fertilidad arbitraria.'
                : language === 'it'
                ? 'Le percentuali sono calcolate rigorosamente sulle cove effettivamente sperate. In assenza di speratura, nessuna fertilità viene estrapolata.'
                : 'Les pourcentages sont strictement calculés sur les pontes ayant fait l\'objet d\'un mirage ou contrôle effectif. En l\'absence de mirage, aucune fertilité arbitraire n\'est extrapolée.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. SOUS-VUE : HABITAT & LOGEMENT */}
      {activeSubTab === 'habitat' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AppKpiCard
              title={language === 'ar' ? 'المناطق' : language === 'en' ? 'Zones' : language === 'es' ? 'Zonas' : language === 'it' ? 'Zone' : 'Zones'}
              value={habitat.totalZones}
              subtitle={`${habitat.totalAviaries} ${language === 'ar' ? 'سلاكات' : language === 'en' ? 'aviaries' : language === 'es' ? 'aviarios' : language === 'it' ? 'voliere' : 'volières'}`}
            />
            <AppKpiCard
              title={language === 'ar' ? 'الأقفاص' : language === 'en' ? 'Total Cages' : language === 'es' ? 'Total jaulas' : language === 'it' ? 'Totale gabbie' : 'Total Cages'}
              value={habitat.totalCages}
              subtitle={`${habitat.occupiedCagesCount} ${language === 'ar' ? 'مشغولة' : language === 'en' ? 'occupied' : language === 'es' ? 'ocupada(s)' : language === 'it' ? 'occupata/e' : 'occupée(s)'}`}
            />
            <AppKpiCard
              title={language === 'ar' ? 'الأقفاص الشاغرة' : language === 'en' ? 'Free Cages' : language === 'es' ? 'Jaulas libres' : language === 'it' ? 'Gabbie libere' : 'Cages Libres'}
              value={habitat.emptyCagesCount}
              subtitle={language === 'ar' ? 'جاهزة للاستقبال' : language === 'en' ? 'Available for housing' : language === 'es' ? 'Disponibles para alojamiento' : language === 'it' ? 'Disponibili per alloggio' : 'Disponibles pour hébergement'}
            />
            <AppKpiCard
              title={language === 'ar' ? 'طيور غير معينة' : language === 'en' ? 'Unassigned Birds' : language === 'es' ? 'Aves no asignadas' : language === 'it' ? 'Volatili non assegnati' : 'Oiseaux Non Assignés'}
              value={habitat.unassignedBirdsCount}
              subtitle={language === 'ar' ? 'تتطلب تعييناً' : language === 'en' ? 'Without assigned cage' : language === 'es' ? 'Sin jaula asignada' : language === 'it' ? 'Senza gabbia assegnata' : 'Sans cage attribuée'}
            />
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider block">
              {language === 'ar' ? 'هيكل الإيواء V1.9.6 : منطقة ← سلاكة ← قفص' : language === 'en' ? 'Housing Hierarchy V1.9.6: Zone → Aviary → Cage' : language === 'es' ? 'Jerarquía de Alojamiento V1.9.6: Zona → Aviario → Jaula' : language === 'it' ? 'Gerarchia di Alloggio V1.9.6: Zona → Voliera → Gabbia' : 'Hiérarchie d\'Hébergement V1.9.6 : Zone → Volière → Cage'}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? 'جميع نسب الإشغال مستخرجة بدقة بناءً على الطيور المسكنة فعلياً. لا يتم إنشاء أي تقييم اعتباطي لـ "جودة القفص".'
                : language === 'en'
                ? 'Occupancy is strictly calculated from physically housed birds. No arbitrary cage quality scores are generated.'
                : language === 'es'
                ? 'La ocupación se calcula estrictamente a partir de aves alojadas físicamente. No se generan puntuaciones arbitrarias.'
                : language === 'it'
                ? 'L\'occupazione è calcolata rigorosamente a partire dai volatili effettivamente alloggiati. Nessun punteggio arbitrario viene generato.'
                : 'L\'occupation est strictement calculée à partir des oiseaux physiquement affectés. Aucun score subjectif d\'habitat ou label "cage optimale" n\'est généré.'}
            </p>
          </div>
        </div>
      )}

      {/* 6. SOUS-VUE : CHRONOLOGIE DES ÉVÉNEMENTS RÉELS */}
      {activeSubTab === 'timeline' && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
              {language === 'ar' ? 'سجل الأحداث الأخيرة (تواريخ حقيقية فقط)' : language === 'en' ? 'Recent Timeline (Real Dates Only)' : language === 'es' ? 'Cronología reciente (solo fechas reales)' : language === 'it' ? 'Cronologia recente (solo date reali)' : 'Chronologie Récente (Dates Réelles Uniquement)'}
            </span>
            <span className="text-[10px] text-slate-400">
              {recentEvents.length} {language === 'ar' ? 'أحداث موثقة' : language === 'en' ? 'documented event(s)' : language === 'es' ? 'evento(s) documentado(s)' : language === 'it' ? 'evento/i documentato/i' : 'événement(s) documenté(s)'}
            </span>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              {language === 'ar' ? 'لا توجد أحداث مسجلة حديثاً.' : language === 'en' ? 'No recent events recorded.' : language === 'es' ? 'No hay eventos recientes registrados.' : language === 'it' ? 'Nessun evento recente registrato.' : 'Aucun événement récent enregistré.'}
            </p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map(evt => (
                <div key={evt.id} className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100 block">{evt.title}</span>
                      <span className="text-[10px] text-slate-400 block">{evt.description}</span>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="text-[10px] font-mono font-bold text-slate-500 block">{evt.date}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600 font-semibold">{evt.badgeText}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. SOUS-VUE : AUDIT DES DONNÉES MANQUANTES */}
      {activeSubTab === 'quality' && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
              {language === 'ar' ? 'كشف البيانات غير المكتملة' : language === 'en' ? 'Integrity Check & Missing Data' : language === 'es' ? 'Control de integridad y datos incompletos' : language === 'it' ? 'Controllo di integrità e dati mancanti' : 'Contrôle d\'Intégrité & Données Manquantes'}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {missingDataAudits.length} {language === 'ar' ? 'تنبيهات تدقيق' : language === 'en' ? 'active audit(s)' : language === 'es' ? 'auditoría(s) activa(s)' : language === 'it' ? 'audit attivo/i' : 'audit(s) actif(s)'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'مبدأ الشفافية الإبستيمولوجية: لا يقوم النظام بتخمين الحقول المفقودة. يتم الإبقاء على القيم غير محددة مع إشعار صريح.'
              : language === 'en'
              ? 'Absolute transparency: missing data is never converted into favorable guesswork. Every gap is explicitly flagged.'
              : language === 'es'
              ? 'Transparencia absoluta: la ausencia de datos no se convierte en estimaciones favorables. Cada falta se señala explícitamente.'
              : language === 'it'
              ? 'Trasparenza assoluta: l\'assenza di dati non viene trasformata in stime arbitrarie. Ogni lacuna è segnalata esplicitamente.'
              : 'Transparence absolue : aucune absence de donnée n\'est transformée en estimation favorable. Chaque lacune fait l\'objet d\'un signalement explicite.'}
          </p>

          {missingDataAudits.length === 0 ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'ar' ? 'سجلات المأوى مكتملة بالكامل.' : language === 'en' ? 'All flock records contain the required information.' : language === 'es' ? 'Todas las fichas del aviario disponen de la información requerida.' : language === 'it' ? 'Tutte le schede dell\'allevamento dispongono delle informazioni richieste.' : 'Toutes les fiches de l\'élevage disposent des informations requises.'}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {missingDataAudits.map(audit => (
                <div key={audit.id} className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-200 block">{audit.message}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block">{language === 'ar' ? 'حقل: ' : language === 'en' ? 'Field: ' : language === 'es' ? 'Campo: ' : language === 'it' ? 'Campo: ' : 'Champ : '}{audit.field}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                    {audit.affectedCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALE EXPLICATION ASSISTANT */}
      {assistantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setAssistantModalOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {language === 'ar' ? 'المساعد التعليمي الذكي (قراءة فقط)' : language === 'en' ? 'Pedagogical Assistant (Read-Only)' : language === 'es' ? 'Asistente pedagógico (Solo lectura)' : language === 'it' ? 'Assistente pedagogico (Sola lettura)' : 'Assistant Pédagogique (Lecture Seule)'}
              </h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600">
              {assistantExplanation}
            </p>
            <div className="flex justify-end">
              <AppButton size="sm" variant="secondary" onClick={() => setAssistantModalOpen(false)}>
                {language === 'ar' ? 'إغلاق' : language === 'en' ? 'Close' : language === 'es' ? 'Cerrar' : language === 'it' ? 'Chiudi' : 'Fermer'}
              </AppButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default FlockStatisticsOverview;

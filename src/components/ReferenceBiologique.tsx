/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BIOLOGICAL_SPECIES_REGISTRY, 
  BiologicalSpeciesProfile,
  getBiologicalTraceability 
} from '../reference/species';
import { SPECIES_REGISTRY } from '../data/speciesRegistry';
import { SpeciesProfileService } from '../features/species/services/SpeciesProfileService';
import { HorizontalScrollContainer } from './ui/HorizontalScrollContainer';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bird, FileText, Heart, Egg, Grid, Thermometer, Droplets, 
  Wheat, Info, Scale, ShieldAlert, Sparkles, BookOpen, 
  Search, CheckCircle2, AlertCircle, Compass, HelpCircle, ShieldCheck, Globe
} from 'lucide-react';

export default function ReferenceBiologique() {
  const { t, language, isRtl } = useLanguage();
  const [showAllCatalog, setShowAllCatalog] = useState<boolean>(false);
  const activeSpeciesIds = SpeciesProfileService.getActiveSpeciesIds();
  const scopedProfiles = SpeciesProfileService.getScopedBiologicalProfiles();

  const displayedProfiles = showAllCatalog ? BIOLOGICAL_SPECIES_REGISTRY : scopedProfiles;

  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(() => {
    return activeSpeciesIds[0] || 'canari';
  });
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'bio' | 'repro' | 'breeding' | 'nutrition' | 'health'>('all');

  const selectedProfile = displayedProfiles.find(
    s => s.identity.id === selectedSpeciesId
  ) || displayedProfiles[0] || BIOLOGICAL_SPECIES_REGISTRY[0];

  const traceability = getBiologicalTraceability(selectedProfile.identity.id);

  const { identity, biology, reproduction, breeding, nutrition, health, management } = selectedProfile;

  // Localized difficulty badge styling
  const getDifficultyBadge = (lvl: string) => {
    switch (lvl) {
      case 'facile':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {language === 'fr' ? 'Facile' : language === 'es' ? 'Fácil' : language === 'it' ? 'Facile' : language === 'ar' ? 'سهل' : 'Easy'}
          </span>
        );
      case 'moyen':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            {language === 'fr' ? 'Moyen' : language === 'es' ? 'Medio' : language === 'it' ? 'Medio' : language === 'ar' ? 'متوسط' : 'Medium'}
          </span>
        );
      case 'difficile':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            {language === 'fr' ? 'Difficile' : language === 'es' ? 'Difícil' : language === 'it' ? 'Difficile' : language === 'ar' ? 'صعب' : 'Difficult'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" />
            {lvl.toUpperCase()}
          </span>
        );
    }
  };

  const textDirClass = isRtl ? 'text-end' : 'text-start';

  return (
    <div className={`space-y-6 max-w-full min-w-0 w-full ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page Header with Species Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="w-full md:w-auto">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-500" />
            {t('bioReference')}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {t('bioRefSub') || (language === 'ar' ? 'تصفح البطاقات العلمية والأدلة البيولوجية المفصلة لطيورك.' : 'Consultez les fiches scientifiques et guides biologiques détaillés de votre élevage.')}
          </p>

          {/* Mobile & Tablet Dropdown Species Selector (<1024px) */}
          <div className="mt-4 block lg:hidden w-full">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="bio-species-selector" className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                {t('bioRefSpeciesLabel')}
              </label>
              <button
                type="button"
                onClick={() => setShowAllCatalog(prev => !prev)}
                className="text-[10px] text-amber-600 dark:text-amber-400 font-bold underline cursor-pointer"
              >
                {showAllCatalog ? t('bioRefShowActiveProfile') : t('bioRefViewFullCatalog')}
              </button>
            </div>
            <select
              id="bio-species-selector"
              data-testid="bio-race-selector"
              value={selectedSpeciesId}
              onChange={(e) => setSelectedSpeciesId(e.target.value)}
              aria-label={t('selectRace')}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              {displayedProfiles.map((species) => (
                <option key={species.identity.id} value={species.identity.id}>
                  🐦 {species.identity.names[language]} ({species.identity.scientificName}) {activeSpeciesIds.includes(species.identity.id) ? '★' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Species Selector Buttons (>=1024px) */}
        <div className="hidden lg:flex items-center gap-2">
          <HorizontalScrollContainer className="w-full lg:w-auto" innerClassName="overflow-x-auto touch-pan-x min-w-0 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            {displayedProfiles.map((species) => {
              const isSelected = selectedSpeciesId === species.identity.id;
              const isActiveInProfile = activeSpeciesIds.includes(species.identity.id);
              return (
                <button
                  key={species.identity.id}
                  onClick={() => setSelectedSpeciesId(species.identity.id)}
                  className={`flex-1 shrink-0 min-w-[100px] sm:min-w-[120px] lg:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Bird className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{species.identity.names[language]}</span>
                  {isActiveInProfile && <span className="text-[10px] text-emerald-400 font-extrabold">•</span>}
                </button>
              );
            })}
          </HorizontalScrollContainer>
          <button
            type="button"
            onClick={() => setShowAllCatalog(prev => !prev)}
            title={showAllCatalog ? 'Restreindre au profil actif' : 'Afficher tout le catalogue mondial'}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              showAllCatalog
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Header for Selected Species */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden min-w-0 max-w-full">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 min-w-0 max-w-full">
          <div className="space-y-3 min-w-0 max-w-full">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-slate-900 uppercase tracking-widest">
              {identity.code}
            </div>
            <div className="min-w-0 max-w-full">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">{identity.names[language]}</h1>
              <p className="text-amber-400 font-mono text-xs italic mt-1 font-medium truncate">{identity.scientificName}</p>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-300 text-xs pt-2 min-w-0 max-w-full">
              <div>
                <span className="text-slate-500 font-medium">{t('bioRefFamily')}</span> <span className="font-semibold text-slate-200">{identity.family}</span>
              </div>
              <div className="text-slate-600 hidden sm:inline">•</div>
              <div>
                <span className="text-slate-500 font-medium">{t('bioRefGenus')}</span> <span className="font-semibold text-slate-200">{identity.genus}</span>
              </div>
              <div className="text-slate-600 hidden sm:inline">•</div>
              <div>
                <span className="text-slate-500 font-medium">{t('bioRefStatus')}</span> <span className="font-semibold text-slate-200 capitalize">
                  {identity.status === 'domestique' ? t('statusDomestique') : identity.status === 'sauvage' ? (language === 'ar' ? 'نوع بري' : 'Espèce Sauvage') : (language === 'ar' ? 'هجين' : 'Hybride')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-between gap-4 border-t border-slate-700/50 md:border-t-0 pt-4 md:pt-0 shrink-0">
            <div className="flex flex-col md:items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('bioRefBreedingDifficulty')}</span>
              <div className="mt-1.5">{getDifficultyBadge(breeding.difficultyLevel)}</div>
            </div>

            <div className="text-xs text-slate-300">
              <span className="text-slate-500">{t('bioRefOrigin')}</span> <span className="font-semibold">{identity.origin[language]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Biological Traceability & Disclaimer Panel (Correctif 29) */}
      <div className={`p-4 rounded-2xl border min-w-0 max-w-full ${
        traceability.validationStatus === 'verified' 
          ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950' 
          : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 min-w-0 max-w-full">
          <div className="flex items-center gap-3 min-w-0 max-w-full">
            {traceability.validationStatus === 'verified' ? (
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 max-w-full">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wide truncate">
                  {t('bioRefTraceabilityTitle')}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                  traceability.validationStatus === 'verified'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}>
                  {traceability.validationStatus === 'verified' ? t('bioRefStatusVerified') : t('bioRefStatusUnverified')}
                </span>
              </div>
              <div className="text-xs opacity-90 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span><span className="font-semibold">{t('bioRefSource')}</span> {traceability.source || 'N/A'}</span>
                {traceability.revisionDate && (
                  <span>
                    <span className="font-semibold">{t('bioRefRevision')}</span> {traceability.revisionDate}
                  </span>
                )}
                {traceability.author && (
                  <span>
                    <span className="font-semibold">{t('bioRefAuthor')}</span> {traceability.author}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {traceability.disclaimer && (
          <div className="mt-3 pt-3 border-t border-current/10 text-xs opacity-80 italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{traceability.disclaimer[language] || traceability.disclaimer['fr']}</span>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <HorizontalScrollContainer innerClassName="gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { id: 'all', label: t('bioRefTabOverview'), icon: Info },
          { id: 'bio', label: t('bioRefTabBiology'), icon: Heart },
          { id: 'repro', label: t('bioRefTabRepro'), icon: Egg },
          { id: 'breeding', label: t('bioRefTabHousing'), icon: Grid },
          { id: 'nutrition', label: t('bioRefTabNutrition'), icon: Wheat },
          { id: 'health', label: t('bioRefTabHealth'), icon: ShieldAlert },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs shrink-0 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </HorizontalScrollContainer>

      {/* Active Tab Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Detail Cards based on active tab */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: BIOLOGY & MATURITY */}
          {(activeSubTab === 'all' || activeSubTab === 'bio') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                {t('bioRefTraits')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('bioRefLifespan')}</span>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{biology.lifespan} {t('bioRefYears')} <span className="text-xs font-normal text-slate-400">{t('bioRefAverage')}</span></p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('bioRefDimensions')}</span>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{biology.averageLength} cm <span className="text-xs font-normal text-slate-400">({biology.minWeight}g - {biology.maxWeight}g)</span></p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('bioRefSexualDimorphism')}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{biology.sexualDimorphism[language]}</p>
                </div>
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('bioRefSexualMaturity')}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{biology.sexualMaturity[language]}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: REPRODUCTION */}
          {(activeSubTab === 'all' || activeSubTab === 'repro') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Egg className="w-4 h-4 text-amber-500" />
                {t('bioRefReproSpecs')}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('bioRefIncubation')}</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{reproduction.incubationPeriod} {t('bioRefDays')}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('bioRefClutchSize')}</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{reproduction.avgEggsPerClutch} {t('bioRefTo')} {reproduction.maxEggsPerClutch} {t('bioRefEggs')}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('bioRefBanding')}</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Jour {reproduction.bandingAge}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('bioRefWeaning')}</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">~{reproduction.weaningAge} {t('bioRefDays')}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Saison de reproduction idéale</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{reproduction.breedingSeason[language]}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-amber-50/40 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">Nourrissage au nid</span>
                    <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">{reproduction.feedingPeriod} jours sous la tutelle parentale.</span>
                  </div>
                  <div className="p-3 bg-amber-50/40 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60 text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">Couvées annuelles max</span>
                    <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">Recommandé : {reproduction.avgClutchesPerYear} couvées max pour préserver la femelle.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: BREEDING & ENVIRONMENT */}
          {(activeSubTab === 'all' || activeSubTab === 'breeding') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-500" />
                {language === 'fr' ? 'Normes d\'Élevage & Environnement' : 'Breeding Standards & Housing'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-center space-y-1">
                  <Thermometer className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('bioRefIdealTemp')}</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">{breeding.minIdealTemp}°C {t('bioRefTo')} {breeding.maxIdealTemp}°C</span>
                </div>
                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-center space-y-1">
                  <Droplets className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('bioRefIdealHumidity')}</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">{breeding.minHumidity}% {t('bioRefTo')} {breeding.maxHumidity}%</span>
                </div>
                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-center space-y-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block pt-1">Ø Bague</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{t('bioRefBanding')}</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">{breeding.bandSize} mm</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Type de Nid recommandé</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{breeding.nestType[language]}</p>
                </div>
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('bioRefMinCage')}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{breeding.minCageSize[language]}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: NUTRITION */}
          {(activeSubTab === 'all' || activeSubTab === 'nutrition') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {t('bioRefDietTitle')}
              </h3>

              <div className="space-y-3">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Régime principal de base</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{nutrition.mainDiet[language]}</p>
                </div>
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Compléments & Vitamines d'élevage</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{nutrition.recommendedSupplements[language]}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Fréquence des Vitamines</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{nutrition.vitaminFrequency[language]}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Besoins Spécifiques</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{nutrition.specificNeeds[language]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: HEALTH & PREVENTION */}
          {(activeSubTab === 'all' || activeSubTab === 'health') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                {t('bioRefHealthTitle')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50/40 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">{t('bioRefCommonDiseases')}</span>
                  <ul className="list-disc list-inside text-xs text-rose-900/90 dark:text-rose-200 space-y-1">
                    {health.frequentDiseases[language].map((dis, idx) => (
                      <li key={idx}>{dis}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/40 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">Parasites courants</span>
                  <ul className="list-disc list-inside text-xs text-amber-900/90 dark:text-amber-200 space-y-1">
                    {health.frequentParasites[language].map((par, idx) => (
                      <li key={idx}>{par}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border text-center text-xs font-bold ${
                  health.sensitiveToCold 
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {language === 'fr' ? 'Sensible au froid' : language === 'ar' ? 'حساس للبرد' : 'Sensitive to cold'} : {health.sensitiveToCold ? t('bioRefYes') : t('bioRefNo')}
                </div>
                <div className={`p-3 rounded-xl border text-center text-xs font-bold ${
                  health.sensitiveToHeat 
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {language === 'fr' ? 'Sensible à la chaleur' : language === 'ar' ? 'حساس للحرارة' : 'Sensitive to heat'} : {health.sensitiveToHeat ? t('bioRefYes') : t('bioRefNo')}
                </div>
              </div>

              <div className={textDirClass}>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Recommandations sanitaires & préventives</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50/70 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">{health.preventionRecommendations[language]}</p>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Quick Reference & Regulatory Tips */}
        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">{language === 'fr' ? 'Aperçu Express' : language === 'ar' ? 'نظرة سريعة' : 'Quick Overview'}</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Âge minimum repro</span>
                <span className="font-bold text-slate-200">{biology.minAgeReproduction} mois</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Âge idéal conseillé</span>
                <span className="font-bold text-slate-200">{biology.recommendedAgeReproduction} mois</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Âge maximal limite</span>
                <span className="font-bold text-slate-200">{Math.round(biology.maxAgeReproduction / 12)} {t('bioRefYears')}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Possibilité hybridation</span>
                <span className={`font-bold ${management.hybridizationPossible ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {management.hybridizationPossible ? t('bioRefYes') : t('bioRefNo')}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Espèces d'hybridation compatibles</span>
              <div className="flex flex-wrap gap-1.5">
                {management.compatibleSpecies.map((id, idx) => {
                  const compSpec = BIOLOGICAL_SPECIES_REGISTRY.find(s => s.identity.id === id);
                  const dispName = compSpec ? compSpec.identity.names[language] : id.replace('_', ' ');
                  return (
                    <span key={idx} className="px-2 py-1 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700 capitalize">
                      {dispName}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Regulatory Frame */}
          <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Scale className="w-4 h-4 text-amber-600" />
              {t('bioRefLegalStatus')}
            </h4>
            <p className="text-xs text-amber-900/80 leading-relaxed">{management.regulatoryStatus[language]}</p>
          </div>

          {/* Expert Breeding Tips */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t('bioRefExpertTips')}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">{management.breedingTips[language]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

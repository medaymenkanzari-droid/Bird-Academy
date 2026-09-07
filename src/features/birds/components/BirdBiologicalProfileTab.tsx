/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Heart, Egg, Grid, Wheat, ShieldAlert, Sparkles, 
  Info, ShieldCheck, AlertCircle, Scale, Calendar, Dna, 
  Thermometer, Droplets, Compass, CheckCircle2, Award, Clock
} from 'lucide-react';
import { Canari } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  getBiologicalProfileById, 
  getBiologicalTraceability,
  BiologicalSpeciesProfile 
} from '../../../reference/species/index';
import { BirdEngine } from '../../../business/BirdEngine';
import { PassportDataService } from '../services/PassportDataService';
import { SpeciesBadge } from '../../../components/design-system';

export interface BirdBiologicalProfileTabProps {
  bird: Canari;
}

export const BirdBiologicalProfileTab: React.FC<BirdBiologicalProfileTabProps> = ({ bird }) => {
  const { t, language, isRtl } = useLanguage();

  // Resolve species identifier without blindly falling back to canary
  const resolvedSpeciesId = bird.espece || (bird as any).speciesId || (bird as any).species;
  const profile: BiologicalSpeciesProfile | undefined = resolvedSpeciesId 
    ? getBiologicalProfileById(resolvedSpeciesId) 
    : undefined;

  // Real bird calculated biological metrics
  const ageObj = BirdEngine.calculateAge(bird.date_naissance);
  const weightLogs = PassportDataService.getWeightLogsForBird(bird.id, bird);
  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weightGrams : undefined;

  // Text direction helpers
  const textDirClass = isRtl ? 'text-right' : 'text-left';

  // If no species profile exists or species is unknown, display explicit translated notice
  if (!profile) {
    return (
      <div className={`p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 ${isRtl ? 'rtl' : 'ltr'}`}>
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-base font-bold text-white">
            {t('biologicalTraits')}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('biologicalDataUnavailable')}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
          <span>ID: {resolvedSpeciesId || 'unknown'}</span>
          {bird.race && <span>• {bird.race}</span>}
        </div>
      </div>
    );
  }

  const { identity, biology, reproduction, breeding, nutrition, health, management } = profile;
  const traceability = getBiologicalTraceability(identity.id);

  // Calculate maturity status compared to species biology
  const minReproAgeMonths = biology.minAgeReproduction || 10;
  const currentMonths = (ageObj && typeof ageObj.months === 'number') ? ageObj.months : 0;
  const isSexuallyMature = currentMonths >= minReproAgeMonths;

  // Localized difficulty badge
  const renderDifficultyBadge = (lvl: string) => {
    switch (lvl) {
      case 'facile':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('difficultyEasy')}
          </span>
        );
      case 'moyen':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            {t('difficultyMedium')}
          </span>
        );
      case 'difficile':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            {t('difficultyHard')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            {t('difficultyExpert')}
          </span>
        );
    }
  };

  // Resolve localized text from MultilingualText object with graceful fallback
  const getLocalizedText = (field: any, defaultKey?: string): string => {
    if (!field) return defaultKey ? t(defaultKey) : '';
    if (typeof field === 'string') return field;
    return field[language] || field.fr || field.en || '';
  };

  // Resolve localized list from MultilingualList object
  const getLocalizedList = (field: any): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    const list = field[language] || field.fr || field.en || [];
    return Array.isArray(list) ? list : [];
  };

  return (
    <div className={`space-y-6 text-slate-100 animate-fadeIn ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. Scientific Taxonomy & Origin Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-2xs font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Compass className="w-3 h-3" />
                {identity.code}
              </span>
              <span className="text-3xs font-mono text-slate-400">
                {identity.status === 'domestique' ? t('statusDomestic') : t('statusWild')}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {getLocalizedText(identity.names)}
              </h2>
              <p className="text-sm font-mono text-amber-400 italic mt-0.5">
                {identity.scientificName}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <div>
                <span className="text-slate-500 font-medium">{t('family')} :</span>{' '}
                <span className="font-semibold text-slate-200">{identity.family}</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <div>
                <span className="text-slate-500 font-medium">{t('genus')} :</span>{' '}
                <span className="font-semibold text-slate-200">{identity.genus}</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <div>
                <span className="text-slate-500 font-medium">{t('origin')} :</span>{' '}
                <span className="font-semibold text-slate-200">{getLocalizedText(identity.origin)}</span>
              </div>
            </div>
          </div>

          {/* Difficulty & Species Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-3xs text-slate-500 uppercase tracking-widest font-bold block mb-1">
                {t('difficultyLevel')}
              </span>
              {renderDifficultyBadge(breeding.difficultyLevel)}
            </div>
            <SpeciesBadge speciesId={identity.id} size="md" />
          </div>
        </div>
      </div>

      {/* 2. Scientific Traceability & Certification Banner */}
      <div className={`p-4 rounded-2xl border ${
        traceability.validationStatus === 'verified'
          ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
          : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              traceability.validationStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {traceability.validationStatus === 'verified' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider">
                  {t('scientificTraceability')}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-3xs font-extrabold uppercase tracking-wider ${
                  traceability.validationStatus === 'verified' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {traceability.validationStatus === 'verified' ? t('certifiedVerified') : t('unverifiedDraft')}
                </span>
              </div>
              <div className="text-2xs opacity-80 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono">
                {traceability.source && <span>{t('source')} : {traceability.source}</span>}
                {traceability.revisionDate && <span>{t('revision')} : {traceability.revisionDate}</span>}
                {traceability.author && <span>{t('author')} : {traceability.author}</span>}
              </div>
            </div>
          </div>
        </div>

        {traceability.disclaimer && (
          <div className="mt-2.5 pt-2.5 border-t border-current/10 text-2xs opacity-90 italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{getLocalizedText(traceability.disclaimer)}</span>
          </div>
        )}
      </div>

      {/* 3. Real Bird vs Biological Reference Comparison Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {t('individualData')} vs {t('referenceData')}
            </h3>
          </div>
          <span className="text-3xs text-slate-400 font-mono">
            {bird.bague || 'SANS-BAGUE'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* A. Weight comparison */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-400 uppercase font-bold tracking-wider block">
              {t('realWeight')}
            </span>
            <div className="text-lg font-black text-white flex items-baseline gap-1.5">
              <span>{latestWeight !== undefined ? `${latestWeight} g` : 'N/A'}</span>
              <span className="text-2xs text-slate-400 font-normal">
                (Réf: {biology.minWeight}-{biology.maxWeight} g)
              </span>
            </div>
            <div className="text-3xs text-emerald-400 font-medium">
              {latestWeight !== undefined && latestWeight >= biology.minWeight && latestWeight <= biology.maxWeight
                ? '✓ Conforme au gabarit standard'
                : latestWeight !== undefined
                  ? '• Pesée individuelle enregistrée'
                  : 'Pesée de contrôle conseillée'}
            </div>
          </div>

          {/* B. Age & Maturity comparison */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-400 uppercase font-bold tracking-wider block">
              {t('realAge')}
            </span>
            <div className="text-lg font-black text-white flex items-baseline gap-1.5">
              <span>{ageObj.stringVal}</span>
            </div>
            <div className={`text-3xs font-bold flex items-center gap-1 ${
              isSexuallyMature ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <span>{isSexuallyMature ? `✓ ${t('maturityReached')}` : `⏳ ${t('maturityNotReached')}`}</span>
            </div>
          </div>

          {/* C. Band size comparison */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-400 uppercase font-bold tracking-wider block">
              {t('ringDiameter')}
            </span>
            <div className="text-lg font-black text-amber-400 font-mono">
              {breeding.bandSize || 'Standard'}
            </div>
            <div className="text-3xs text-slate-400 font-mono">
              Bague oiseau : {bird.bague || 'Non bagué'}
            </div>
          </div>

          {/* D. Incubation & Clutches */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-400 uppercase font-bold tracking-wider block">
              {t('incubationDays')}
            </span>
            <div className="text-lg font-black text-white flex items-baseline gap-1">
              <span>{reproduction.incubationPeriod}</span>
              <span className="text-xs text-slate-400 font-normal">jours</span>
            </div>
            <div className="text-3xs text-slate-400">
              Ponte : {reproduction.avgEggsPerClutch}-{reproduction.maxEggsPerClutch} œufs / couvée
            </div>
          </div>

        </div>
      </div>

      {/* 4. Biological Characteristics & Reproduction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card Left: Biology & Morphology */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {t('biologicalTraits')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('lifespanYears')}</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{biology.lifespan} ans <span className="text-2xs text-slate-400 font-normal">(moyenne)</span></span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('physicalDimensions')}</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{biology.averageLength} cm <span className="text-2xs text-slate-400 font-normal">({biology.minWeight}-{biology.maxWeight}g)</span></span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className={textDirClass}>
              <h4 className="text-xs font-bold text-slate-300">{t('sexualDimorphism')}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {getLocalizedText(biology.sexualDimorphism)}
              </p>
            </div>
            <div className={textDirClass}>
              <h4 className="text-xs font-bold text-slate-300">{t('sexualMaturity')}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {getLocalizedText(biology.sexualMaturity)}
              </p>
            </div>
          </div>
        </div>

        {/* Card Right: Reproduction & Breeding Cycle */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Egg className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {t('reproductionSeason')}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('incubationDays')}</span>
              <span className="text-xs font-black text-amber-400 mt-0.5 block">{reproduction.incubationPeriod} j</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('clutchSize')}</span>
              <span className="text-xs font-black text-white mt-0.5 block">{reproduction.avgEggsPerClutch}-{reproduction.maxEggsPerClutch}</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('bandingDay')}</span>
              <span className="text-xs font-black text-emerald-400 mt-0.5 block">J+{reproduction.bandingAge}</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('weaningDays')}</span>
              <span className="text-xs font-black text-indigo-400 mt-0.5 block">~{reproduction.weaningAge} j</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className={textDirClass}>
              <h4 className="text-xs font-bold text-slate-300">{t('reproductionSeason')}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {getLocalizedText(reproduction.breedingSeason)}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-400">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-white font-bold block">Nourrissage au nid :</span>
                <span>{reproduction.feedingPeriod} jours sous soins parentaux.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-white font-bold block">Couvées annuelles :</span>
                <span>Recommandé : {reproduction.avgClutchesPerYear} max / an.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Breeding Environment & Housing Standards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Grid className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            {t('breedingNorms')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Thermometer className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('idealTempRange')}</span>
              <span className="text-sm font-bold text-white">{breeding.minIdealTemp}°C à {breeding.maxIdealTemp}°C</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Droplets className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <span className="text-3xs text-slate-400 uppercase font-bold block">{t('idealHumidityRange')}</span>
              <span className="text-sm font-bold text-white">{breeding.minHumidity}% à {breeding.maxHumidity}%</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-3xs text-slate-400 uppercase font-bold block">{t('nestType')}</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">{getLocalizedText(breeding.nestType)}</span>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-3xs text-slate-400 uppercase font-bold block">{t('minCageSize')}</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">{getLocalizedText(breeding.minCageSize)}</span>
          </div>
        </div>
      </div>

      {/* 6. Nutrition & Health Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Nutrition */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wheat className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {t('nutritionTitle')}
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-0.5">{t('recommendedDiet')} :</span>
              <p className="text-slate-300 leading-relaxed">{getLocalizedText(nutrition.mainDiet)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-0.5">{t('supplements')} :</span>
              <p className="text-slate-400 leading-relaxed">{getLocalizedText(nutrition.recommendedSupplements)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-0.5">{t('vitamins')} :</span>
              <p className="text-slate-400 leading-relaxed">{getLocalizedText(nutrition.vitaminFrequency)}</p>
            </div>
          </div>
        </div>

        {/* Right: Health & Diseases */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {t('healthTitle')}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-rose-400 block mb-1">{t('commonDiseases')} :</span>
              {getLocalizedList(health.frequentDiseases).length > 0 ? (
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-2xs">
                  {getLocalizedList(health.frequentDiseases).map((disease, idx) => (
                    <li key={idx}>{disease}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-500 italic text-2xs">Données à compléter</span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-0.5">{t('prevention')} :</span>
              <p className="text-slate-400 leading-relaxed">{getLocalizedText(health.preventionRecommendations)}</p>
            </div>

            {management && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 block">{t('regulatoryTitle')} :</span>
                <p className="text-slate-400 text-2xs">{getLocalizedText(management.regulatoryStatus)}</p>
                <div className="pt-1 flex items-center gap-2 text-2xs">
                  <span className="font-semibold text-slate-300">{t('hybridizationPossible')} :</span>
                  <span className={management.hybridizationPossible ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {management.hybridizationPossible ? t('hybridizationYes') : t('hybridizationNo')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default BirdBiologicalProfileTab;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BIOLOGICAL_SPECIES_REGISTRY, 
  BiologicalSpeciesProfile 
} from '../reference/species';
import { useLanguage } from '../context/LanguageContext';
import { 
  Bird, FileText, Heart, Egg, Grid, Thermometer, Droplets, 
  Wheat, Info, Scale, ShieldAlert, Sparkles, BookOpen, 
  Search, CheckCircle2, AlertCircle, Compass, HelpCircle
} from 'lucide-react';

export default function ReferenceBiologique() {
  const { t, language, isRtl } = useLanguage();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('canari');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'bio' | 'repro' | 'breeding' | 'nutrition' | 'health'>('all');

  const selectedProfile = BIOLOGICAL_SPECIES_REGISTRY.find(
    s => s.identity.id === selectedSpeciesId
  ) || BIOLOGICAL_SPECIES_REGISTRY[0];

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

  const textDirClass = isRtl ? 'text-right' : 'text-left';

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-500" />
            {t('bioReference')}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {language === 'fr' 
              ? 'Consultez les fiches scientifiques et guides biologiques détaillés de votre élevage.' 
              : language === 'es'
              ? 'Consulte las fichas científicas y guías biológicas detalladas de su criadero.'
              : language === 'it'
              ? 'Consulta le schede scientifiche e le guide biologiche dettagliate del tuo allevamento.'
              : language === 'ar'
              ? 'تصفح البطاقات العلمية والأدلة البيولوجية المفصلة لطيورك.'
              : 'Consult the scientific sheets and detailed biological guides for your aviary.'}
          </p>
        </div>

        {/* Species Selector buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {BIOLOGICAL_SPECIES_REGISTRY.map((species) => {
            const isSelected = selectedSpeciesId === species.identity.id;
            return (
              <button
                key={species.identity.id}
                onClick={() => setSelectedSpeciesId(species.identity.id)}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bird className="w-4 h-4" />
                {species.identity.names[language]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Header for Selected Species */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-slate-900 uppercase tracking-widest">
              {identity.code}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{identity.names[language]}</h1>
              <p className="text-amber-400 font-mono text-xs italic mt-1 font-medium">{identity.scientificName}</p>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-300 text-xs pt-2">
              <div>
                <span className="text-slate-500 font-medium">Famille :</span> <span className="font-semibold text-slate-200">{identity.family}</span>
              </div>
              <div className="text-slate-600 hidden sm:inline">•</div>
              <div>
                <span className="text-slate-500 font-medium">Genre :</span> <span className="font-semibold text-slate-200">{identity.genus}</span>
              </div>
              <div className="text-slate-600 hidden sm:inline">•</div>
              <div>
                <span className="text-slate-500 font-medium">Statut :</span> <span className="font-semibold text-slate-200 capitalize">{identity.status}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-between gap-4 border-t border-slate-700/50 md:border-t-0 pt-4 md:pt-0">
            <div className="flex flex-col md:items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Difficulté d'élevage</span>
              <div className="mt-1.5">{getDifficultyBadge(breeding.difficultyLevel)}</div>
            </div>

            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Origine :</span> <span className="font-semibold">{identity.origin[language]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-1 scrollbar-thin">
        {[
          { id: 'all', label: language === 'fr' ? 'Vue Générale' : 'General View', icon: Info },
          { id: 'bio', label: language === 'fr' ? 'Biologie & Cycle' : 'Biology', icon: Heart },
          { id: 'repro', label: language === 'fr' ? 'Reproduction' : 'Reproduction', icon: Egg },
          { id: 'breeding', label: language === 'fr' ? 'Élevage & Cage' : 'Breeding', icon: Grid },
          { id: 'nutrition', label: language === 'fr' ? 'Alimentation' : 'Nutrition', icon: Wheat },
          { id: 'health', label: language === 'fr' ? 'Santé & Prévention' : 'Health', icon: ShieldAlert },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs shrink-0 transition-all ${
                isActive 
                  ? 'border-amber-500 text-amber-600 bg-amber-50/20' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Detail Cards based on active tab */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: BIOLOGY & MATURITY */}
          {(activeSubTab === 'all' || activeSubTab === 'bio') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                {language === 'fr' ? 'Caractéristiques Biologiques' : 'Biological Traits'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Espérance de vie</span>
                  <p className="text-sm font-extrabold text-slate-700">{biology.lifespan} ans <span className="text-xs font-normal text-slate-400">(en moyenne)</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dimensions physiques</span>
                  <p className="text-sm font-extrabold text-slate-700">{biology.averageLength} cm <span className="text-xs font-normal text-slate-400">({biology.minWeight}g - {biology.maxWeight}g)</span></p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-600">Dimorphisme Sexuel</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{biology.sexualDimorphism[language]}</p>
                </div>
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-600">Maturité Sexuelle</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{biology.sexualMaturity[language]}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: REPRODUCTION */}
          {(activeSubTab === 'all' || activeSubTab === 'repro') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Egg className="w-4 h-4 text-amber-500" />
                {language === 'fr' ? 'Données de Reproduction' : 'Reproduction Specifications'}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 border border-slate-100 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Incubation</span>
                  <span className="text-sm font-extrabold text-slate-700">{reproduction.incubationPeriod} jours</span>
                </div>
                <div className="p-3 border border-slate-100 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taille de ponte</span>
                  <span className="text-sm font-extrabold text-slate-700">{reproduction.avgEggsPerClutch} à {reproduction.maxEggsPerClutch} œufs</span>
                </div>
                <div className="p-3 border border-slate-100 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Baguage</span>
                  <span className="text-sm font-extrabold text-slate-700">Jour {reproduction.bandingAge}</span>
                </div>
                <div className="p-3 border border-slate-100 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sevrage</span>
                  <span className="text-sm font-extrabold text-slate-700">~{reproduction.weaningAge} jours</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-600">Saison de reproduction idéale</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{reproduction.breedingSeason[language]}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/50 text-xs">
                    <span className="font-bold text-amber-800 block">Nourrissage au nid</span>
                    <span className="text-slate-500 mt-0.5 block">{reproduction.feedingPeriod} jours sous la tutelle parentale.</span>
                  </div>
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/50 text-xs">
                    <span className="font-bold text-amber-800 block">Couvées annuelles max</span>
                    <span className="text-slate-500 mt-0.5 block">Recommandé : {reproduction.avgClutchesPerYear} couvées max pour préserver la femelle.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: BREEDING & ENVIRONMENT */}
          {(activeSubTab === 'all' || activeSubTab === 'breeding') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-500" />
                {language === 'fr' ? 'Normes d\'Élevage & Environnement' : 'Breeding Standards & Housing'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50 text-center space-y-1">
                  <Thermometer className="w-4.5 h-4.5 text-emerald-600 mx-auto" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Températures</span>
                  <span className="text-xs font-extrabold text-slate-700 block">{breeding.minIdealTemp}°C à {breeding.maxIdealTemp}°C</span>
                </div>
                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50 text-center space-y-1">
                  <Droplets className="w-4.5 h-4.5 text-emerald-600 mx-auto" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Humidité idéale</span>
                  <span className="text-xs font-extrabold text-slate-700 block">{breeding.minHumidity}% à {breeding.maxHumidity}%</span>
                </div>
                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50 text-center space-y-1">
                  <span className="text-xs font-bold text-emerald-700 block pt-1">Ø Bague</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Standard</span>
                  <span className="text-xs font-extrabold text-slate-700 block">{breeding.bandSize} mm</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-600">Type de Nid recommandé</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{breeding.nestType[language]}</p>
                </div>
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-600">Espace minimal de logement</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{breeding.minCageSize[language]}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: NUTRITION */}
          {(activeSubTab === 'all' || activeSubTab === 'nutrition') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                {language === 'fr' ? 'Nutrition & Régimes recommandés' : 'Nutrition & Recommended Diet'}
              </h3>

              <div className="space-y-3">
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-600">Régime principal de base</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{nutrition.mainDiet[language]}</p>
                </div>
                <div className={textDirClass}>
                  <h4 className="text-xs font-bold text-slate-600">Compléments & Vitamines d'élevage</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{nutrition.recommendedSupplements[language]}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Fréquence des Vitamines</span>
                    <p className="text-slate-500 leading-relaxed">{nutrition.vitaminFrequency[language]}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Besoins Spécifiques</span>
                    <p className="text-slate-500 leading-relaxed">{nutrition.specificNeeds[language]}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: HEALTH & PREVENTION */}
          {(activeSubTab === 'all' || activeSubTab === 'health') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                {language === 'fr' ? 'Santé, Pathologies & Prévention' : 'Health, Diseases & Biosecurity'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50/30 border border-rose-100/50 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Maladies les plus fréquentes</span>
                  <ul className="list-disc list-inside text-xs text-rose-900/80 space-y-1">
                    {health.frequentDiseases[language].map((dis, idx) => (
                      <li key={idx}>{dis}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/30 border border-amber-100/50 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Parasites courants</span>
                  <ul className="list-disc list-inside text-xs text-amber-900/80 space-y-1">
                    {health.frequentParasites[language].map((par, idx) => (
                      <li key={idx}>{par}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border text-center text-xs font-bold ${
                  health.sensitiveToCold 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  {language === 'fr' ? 'Sensible au froid' : 'Sensitive to cold'} : {health.sensitiveToCold ? 'OUI' : 'NON'}
                </div>
                <div className={`p-3 rounded-xl border text-center text-xs font-bold ${
                  health.sensitiveToHeat 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  {language === 'fr' ? 'Sensible à la chaleur' : 'Sensitive to heat'} : {health.sensitiveToHeat ? 'OUI' : 'NON'}
                </div>
              </div>

              <div className={textDirClass}>
                <h4 className="text-xs font-bold text-slate-600">Recommandations sanitaires & préventives</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">{health.preventionRecommendations[language]}</p>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Quick Reference & Regulatory Tips */}
        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Aperçu Express</h3>
            
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
                <span className="font-bold text-slate-200">{Math.round(biology.maxAgeReproduction / 12)} ans</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Possibilité hybridation</span>
                <span className={`font-bold ${management.hybridizationPossible ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {management.hybridizationPossible ? 'OUI' : 'NON'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Espèces d\'hybridation compatibles</span>
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
              Statut réglementaire
            </h4>
            <p className="text-xs text-amber-900/80 leading-relaxed">{management.regulatoryStatus[language]}</p>
          </div>

          {/* Expert Breeding Tips */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Conseils d'éleveur expert
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">{management.breedingTips[language]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

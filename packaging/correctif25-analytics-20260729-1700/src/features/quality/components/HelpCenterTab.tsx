/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getQualityTranslation } from '../utils/translations';
import { FAQ_ITEMS, HELP_ARTICLES, ONBOARDING_STEPS } from '../help/HelpCenterData';
import { HelpCircle, Sparkles, BookOpen, ToggleLeft, ToggleRight, Search, ChevronRight, ChevronLeft, Check, HelpCircle as HelpIcon } from 'lucide-react';

export const HelpCenterTab: React.FC = () => {
  const { language } = useLanguage();
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingActive, setOnboardingActive] = useState(() => localStorage.getItem('help_onboarding_dismissed') !== 'true');
  const [discoverMode, setDiscoverMode] = useState(() => localStorage.getItem('help_discovery_mode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaqCat, setSelectedFaqCat] = useState<'all' | 'general' | 'breeding' | 'genetics' | 'data'>('all');

  const t = (key: string) => getQualityTranslation(language, key);

  // Load datasets based on language
  const localizedFaq = FAQ_ITEMS[language] || FAQ_ITEMS['fr'];
  const localizedArticles = HELP_ARTICLES[language] || HELP_ARTICLES['fr'] || [];
  const localizedSteps = ONBOARDING_STEPS[language] || ONBOARDING_STEPS['fr'];

  // Handlers
  const handleNextStep = () => {
    if (onboardingStep < localizedSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setOnboardingActive(false);
      localStorage.setItem('help_onboarding_dismissed', 'true');
    }
  };

  const handlePrevStep = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const skipOnboarding = () => {
    setOnboardingActive(false);
    localStorage.setItem('help_onboarding_dismissed', 'true');
  };

  const restartOnboarding = () => {
    setOnboardingStep(0);
    setOnboardingActive(true);
    localStorage.removeItem('help_onboarding_dismissed');
  };

  const toggleDiscovery = () => {
    const nextVal = !discoverMode;
    setDiscoverMode(nextVal);
    localStorage.setItem('help_discovery_mode', String(nextVal));
  };

  const disableAllHelp = () => {
    setDiscoverMode(false);
    setOnboardingActive(false);
    localStorage.setItem('help_discovery_mode', 'false');
    localStorage.setItem('help_onboarding_dismissed', 'true');
  };

  // Filters
  const filteredFaq = localizedFaq.filter(item => {
    const matchesCat = selectedFaqCat === 'all' || item.category === selectedFaqCat;
    const matchesQuery = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6" id="help-center-tab">
      {/* Onboarding Wizard Frame */}
      {onboardingActive && localizedSteps.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden" id="onboarding-card">
          {/* Abstract floating circles for premium visual */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -left-10 -bottom-10 w-42 h-42 bg-indigo-500/20 rounded-full blur-2xl" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xxs font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wider">
                GUIDE DE DÉCOUVERTE • ÉTAPE {onboardingStep + 1} SUR {localizedSteps.length}
              </span>
              <button
                onClick={skipOnboarding}
                id="btn-skip-onboarding"
                className="text-xs hover:text-indigo-200 transition duration-150 cursor-pointer"
              >
                Passer l'introduction ✕
              </button>
            </div>

            <div className="space-y-1.5 md:max-w-2xl">
              <h3 className="text-xl font-extrabold tracking-tight">
                {localizedSteps[onboardingStep].title}
              </h3>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                {localizedSteps[onboardingStep].content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-1">
                {localizedSteps.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${idx === onboardingStep ? 'w-6 bg-white' : 'w-2 bg-white/30'}`} 
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {onboardingStep > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 px-3 rounded-xl transition duration-150 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    {t('helpPrevStep')}
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  id="btn-next-onboarding"
                  className="bg-white text-indigo-900 font-extrabold text-xs py-2 px-4 rounded-xl hover:bg-indigo-50 transition duration-150 inline-flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  {onboardingStep === localizedSteps.length - 1 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Terminer
                    </>
                  ) : (
                    <>
                      {t('helpNextStep')}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Mode & Controls Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              {t('helpDiscoverMode')}
            </h4>
            <p className="text-xxs text-gray-400">
              Active des infobulles et des guides d'accompagnement contextuels sur l'ensemble des modules d'accouplements et de finances.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {discoverMode ? "Activé" : "Désactivé"}
            </span>
            <button
              onClick={toggleDiscovery}
              id="btn-toggle-discovery"
              className="text-indigo-600 hover:text-indigo-700 transition duration-150 cursor-pointer"
            >
              {discoverMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              Configuration des Guides d'Aide
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vous pouvez réinitialiser tous les guides interactifs de premier démarrage ou suspendre toutes les aides de l'application si vous êtes un éleveur aguerri.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={restartOnboarding}
              id="btn-restart-onboarding"
              className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs py-2.5 px-3.5 rounded-xl transition duration-150 cursor-pointer"
            >
              {t('helpWizard')}
            </button>
            <button
              onClick={disableAllHelp}
              id="btn-disable-all-help"
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs py-2.5 px-3.5 rounded-xl transition duration-150 cursor-pointer"
            >
              {t('helpDismisAll')}
            </button>
          </div>
        </div>
      </div>

      {/* Local FAQ offline segment */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-indigo-500 w-5 h-5" />
            {t('helpFaq')}
          </h3>

          {/* Search box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher une réponse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="faq-search-input"
              className="w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Categories select tabs */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/10 border-b border-gray-100 dark:border-gray-700 flex gap-1.5 overflow-x-auto whitespace-nowrap">
          {(['all', 'general', 'breeding', 'genetics', 'data'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFaqCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase transition duration-150 cursor-pointer ${selectedFaqCat === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
            >
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>

        {filteredFaq.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-500">
            Aucun article FAQ ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 p-2">
            {filteredFaq.map(item => (
              <div key={item.id} className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  {item.question}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-50 dark:border-gray-850">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contextual knowledge articles */}
      {localizedArticles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-md">
            📖 Fiches Pratiques & Guides Biologiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localizedArticles.map(art => (
              <div key={art.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {art.title}
                  </h4>
                  <span className="text-xxs font-bold text-indigo-500 uppercase bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {art.content}
                </p>
                <div className="flex gap-1 flex-wrap pt-1">
                  {art.tags.map((tag, i) => (
                    <span key={i} className="text-xxs text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

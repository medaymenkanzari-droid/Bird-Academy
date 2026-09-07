/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { BirdService } from '../../birds/services/BirdService';
import { BirdEngine, BirdValidationError } from '../../../business/BirdEngine';
import { AnalyticsSettingsRepository } from '../../analytics/repositories/AnalyticsSettingsRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { SPECIES_REGISTRY, getSpeciesById } from '../../../data/speciesRegistry';
import { SpeciesProfileService } from '../../species/services/SpeciesProfileService';
import { Facility, Zone, HabitatCage, Canari } from '../../../types';
import { 
  Sparkles, Languages, Clipboard, Target, Bird, 
  Check, ArrowRight, ArrowLeft, Coins, Home, Grid,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { AppIcon, AppLogo } from '../../../components/design-system';

interface WelcomeWizardProps {
  isOpen?: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const WelcomeWizard: React.FC<WelcomeWizardProps> = ({ onClose, onComplete }) => {
  console.log(`[BOOT-13] WelcomeWizard render: time=${new Date().toISOString()}`);
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const stepsCount = 7;

  // Step 3: Aviary Identity
  const [aviaryName, setAviaryName] = useState<string>(() => {
    return localStorage.getItem('bird_academy_aviary_name') || '';
  });
  const [breederName, setBreederName] = useState<string>(() => {
    return localStorage.getItem('bird_academy_breeder_name') || '';
  });

  // Step 2: Currency
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    return AnalyticsSettingsRepository.getSettings().currency || localStorage.getItem('bird_academy_currency') || 'TND';
  });

  // Step 4: Species (Defaults cleanly to canari for first-launch onboarding)
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(['canari']);

  // Step 5: Facility & Zone state
  const [facilityName, setFacilityName] = useState<string>('Élevage Principal');
  const [zoneName, setZoneName] = useState<string>('Zone Principale');
  const [activeFacilityId, setActiveFacilityId] = useState<string>('fac_default');
  const [activeZoneId, setActiveZoneId] = useState<string>('zone_default');
  const [facilityCreated, setFacilityCreated] = useState<boolean>(false);

  // Step 6: Cage creation state
  const [cageName, setCageName] = useState<string>('Cage 01');
  const [cageCapacity, setCageCapacity] = useState<number>(4);
  const [cageDescription, setCageDescription] = useState<string>('Cage standard d\'élevage');
  const [cageCreatedSuccess, setCageCreatedSuccess] = useState<boolean>(false);
  const [availableCages, setAvailableCages] = useState<HabitatCage[]>([]);

  // Step 7: Founder Bird state
  const [birdRing, setBirdRing] = useState<string>('');
  const [birdName, setBirdName] = useState<string>('');
  const [birdSpecies, setBirdSpecies] = useState<string>('canari');
  const [birdCategory, setBirdCategory] = useState<string>('canari_posture');
  const [birdRace, setBirdRace] = useState<string>('Gloster Fancy');
  const [birdSex, setBirdSex] = useState<'Mâle' | 'Femelle' | 'Indéterminé'>('Mâle');
  const [birdColor, setBirdColor] = useState<string>('Jaune');
  const [birdBirthDate, setBirdBirthDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedCageId, setSelectedCageId] = useState<string>('');
  const [birdErrors, setBirdErrors] = useState<Record<string, string>>({});
  const [birdSuccess, setBirdSuccess] = useState<boolean>(false);

  // Load existing facilities, zones, and cages on mount or step change
  const refreshHabitatData = useCallback(() => {
    HabitatRepository.migrate();
    const facilities = HabitatRepository.getAll<Facility>('facility');
    if (facilities.length > 0) {
      setActiveFacilityId(facilities[0].id);
      setFacilityName(facilities[0].nom);
    }
    const zones = HabitatRepository.getAll<Zone>('zone');
    if (zones.length > 0) {
      setActiveZoneId(zones[0].id);
      setZoneName(zones[0].nom);
    }
    const cages = HabitatRepository.getAll<HabitatCage>('cage').filter(c => !c.isArchived);
    setAvailableCages(cages);
    if (cages.length > 0 && !selectedCageId) {
      setSelectedCageId(cages[0].id);
    }
  }, [selectedCageId]);

  useEffect(() => {
    refreshHabitatData();
  }, [refreshHabitatData, step]);

  const handleLanguageChange = (lang: 'fr' | 'en' | 'ar' | 'es' | 'it') => {
    setLanguage(lang);
  };

  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    const settings = AnalyticsSettingsRepository.getSettings();
    AnalyticsSettingsRepository.saveSettings({ ...settings, currency: curr });
    localStorage.setItem('bird_academy_currency', curr);
    window.dispatchEvent(new CustomEvent('bird_academy_currency_changed', { detail: { currency: curr } }));
  };

  const toggleSpeciesGroup = (speciesIds: string[]) => {
    const isAllSelected = speciesIds.every(id => selectedSpecies.includes(id));
    if (isAllSelected) {
      const remaining = selectedSpecies.filter(id => !speciesIds.includes(id));
      if (remaining.length > 0) {
        setSelectedSpecies(remaining);
      }
    } else {
      setSelectedSpecies(Array.from(new Set([...selectedSpecies, ...speciesIds])));
    }
  };

  // Step 5: Ensure Facility & Zone are created/saved
  const handleSaveFacility = () => {
    try {
      let currentFac = HabitatRepository.getById<Facility>('facility', activeFacilityId);
      if (!currentFac) {
        currentFac = HabitatRepository.create<Facility>('facility', {
          id: activeFacilityId,
          nom: facilityName || 'Élevage Principal',
          description: 'Installation principale créée pendant l\'onboarding',
          statut: 'Actif'
        });
      } else {
        currentFac.nom = facilityName || 'Élevage Principal';
        HabitatRepository.update('facility', currentFac);
      }

      let currentZone = HabitatRepository.getById<Zone>('zone', activeZoneId);
      if (!currentZone) {
        currentZone = HabitatRepository.create<Zone>('zone', {
          id: activeZoneId,
          facilityId: currentFac.id,
          nom: zoneName || 'Zone Principale',
          description: 'Secteur principal créé pendant l\'onboarding',
          statut: 'Actif'
        });
      } else {
        currentZone.nom = zoneName || 'Zone Principale';
        currentZone.facilityId = currentFac.id;
        HabitatRepository.update('zone', currentZone);
      }

      setFacilityCreated(true);
      refreshHabitatData();
      setStep(6);
    } catch (e) {
      console.error('Failed to create facility/zone in wizard:', e);
      setStep(6);
    }
  };

  // Step 6: Create cage
  const handleCreateCage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cageName.trim()) return;

    try {
      const createdCage = HabitatRepository.create<HabitatCage>('cage', {
        nom: cageName.trim(),
        zoneId: activeZoneId || 'zone_default',
        capacite_max: cageCapacity || 4,
        description: cageDescription || '',
        statut: 'Actif'
      });

      setCageCreatedSuccess(true);
      refreshHabitatData();
      setSelectedCageId(createdCage.id);
      setTimeout(() => {
        setCageCreatedSuccess(false);
        setStep(7);
      }, 700);
    } catch (err) {
      console.error('Failed to create cage in onboarding:', err);
    }
  };

  // Scoped species options for Step 7 matching user profile selection from Step 4
  const wizardSpeciesList = useMemo(() => {
    const activeSet = new Set(selectedSpecies);
    const list = SPECIES_REGISTRY.filter(spec => activeSet.has(spec.id));
    return list.length > 0 ? list : SPECIES_REGISTRY.slice(0, 1);
  }, [selectedSpecies]);

  // Keep birdSpecies synchronized with selectedSpecies
  useEffect(() => {
    if (selectedSpecies.length > 0 && !selectedSpecies.includes(birdSpecies)) {
      const newSpecies = selectedSpecies[0];
      setBirdSpecies(newSpecies);
      const spec = getSpeciesById(newSpecies);
      const firstCat = spec?.categories[0]?.id || '';
      const firstBreed = spec?.categories[0]?.breeds[0]?.id || '';
      setBirdCategory(firstCat);
      setBirdRace(firstBreed);
    }
  }, [selectedSpecies, birdSpecies]);

  // Dynamic species/category/breed resolution for Step 7
  const currentSpeciesData = useMemo(() => {
    return getSpeciesById(birdSpecies) || wizardSpeciesList[0] || SPECIES_REGISTRY[0];
  }, [birdSpecies, wizardSpeciesList]);

  const currentCategories = useMemo(() => {
    return currentSpeciesData.categories || [];
  }, [currentSpeciesData]);

  const currentCategoryData = useMemo(() => {
    return currentCategories.find(c => c.id === birdCategory) || currentCategories[0];
  }, [currentCategories, birdCategory]);

  const currentBreeds = useMemo(() => {
    return currentCategoryData?.breeds || [];
  }, [currentCategoryData]);

  const handleSpeciesSelect = (specId: string) => {
    setBirdSpecies(specId);
    const spec = getSpeciesById(specId);
    const firstCat = spec?.categories[0]?.id || '';
    const firstBreed = spec?.categories[0]?.breeds[0]?.id || '';
    setBirdCategory(firstCat);
    setBirdRace(firstBreed);
  };

  const handleCategorySelect = (catId: string) => {
    setBirdCategory(catId);
    const cat = currentCategories.find(c => c.id === catId);
    const firstBreed = cat?.breeds[0]?.id || '';
    setBirdRace(firstBreed);
  };

  // Step 7: Create founder bird
  const handleCreateFirstBird = (e: React.FormEvent) => {
    e.preventDefault();
    setBirdErrors({});

    if (availableCages.length === 0) {
      setBirdErrors({ cage_id: t('wizardNoCageWarning') });
      return;
    }

    const cageIdNum = parseInt(selectedCageId, 10);
    const candidateBird: Omit<Canari, 'id'> = {
      bague: birdRing.trim().toUpperCase(),
      nom: birdName.trim() || t('unknown'),
      sexe: birdSex,
      espece: birdSpecies,
      categorie: birdCategory,
      race: birdRace,
      mutation: 'Classique',
      couleur_base: birdColor.trim() || 'Jaune',
      facteur: 'Intensif',
      couleur: birdColor.trim() || 'Jaune',
      date_naissance: birdBirthDate,
      cage_id: !isNaN(cageIdNum) ? cageIdNum : undefined,
      cageId: selectedCageId || String(availableCages[0]?.id || ''),
      zoneId: activeZoneId || 'zone_default',
      facilityId: activeFacilityId || 'fac_default',
      pere_id: null,
      mere_id: null,
      archived: false,
      photos: [],
      documents: [],
      statut_sante: 'Actif',
      acquisition: false
    };

    // Strict validation via BirdEngine
    const existingBirds = BirdService.getAll(true);
    const validation = BirdEngine.validateBird(candidateBird, existingBirds);

    if (!validation.isValid) {
      const errMap: Record<string, string> = {};
      validation.errors.forEach((err: BirdValidationError) => {
        errMap[err.field] = err.message;
      });
      setBirdErrors(errMap);
      return;
    }

    // Create via BirdService
    const result = BirdService.create(candidateBird);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      if (result.errors) {
        result.errors.forEach((err: BirdValidationError) => {
          errMap[err.field] = err.message;
        });
      } else {
        errMap.general = result.message || 'Erreur lors de la création.';
      }
      setBirdErrors(errMap);
      return;
    }

    setBirdSuccess(true);
    setTimeout(() => {
      handleFinish();
    }, 1200);
  };

  const handleFinish = () => {
    localStorage.setItem('bird_academy_wizard_completed', 'true');
    localStorage.setItem('bird_academy_aviary_name', aviaryName || 'Mon Élevage');
    if (breederName) {
      localStorage.setItem('bird_academy_breeder_name', breederName);
    }
    localStorage.setItem('bird_academy_currency', selectedCurrency);
    const settings = AnalyticsSettingsRepository.getSettings();
    AnalyticsSettingsRepository.saveSettings({ ...settings, currency: selectedCurrency });

    // Persist species profile before completing the wizard
    const validSpecies = selectedSpecies.length > 0 ? selectedSpecies : ['canari'];
    SpeciesProfileService.setProfile(validSpecies);

    onComplete();
    onClose();
  };

  const handleSkip = () => {
    handleFinish();
  };

  // RTL icons logic: in RTL, ArrowRight points backwards, ArrowLeft points forwards
  const NextArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const PrevArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans" 
      id="welcome-wizard-overlay"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header / Step Progress */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                {t('helpWizard')}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {t('wizardStep', { current: step, total: stepsCount })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
              {step} / {stepsCount}
            </span>
            <button 
              type="button"
              onClick={handleSkip} 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
            >
              {t('wizardSkip')}
            </button>
          </div>
        </div>

        {/* Wizard Track Progress Indicator */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-1.5 transition-all duration-300 rounded-r-full" 
            style={{ width: `${(step / stepsCount) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 min-h-[380px]">
          
          {/* STEP 1: Bienvenue & Sélecteur Rapide de Langue */}
          {step === 1 && (
            <div className="space-y-6 text-center py-2" id="wizard-step-1">
              <div className="flex justify-center mx-auto mb-2">
                <AppIcon className="w-20 h-20 drop-shadow-xl" variant="glow" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('wizardStep1Title')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {t('wizardStep1Subtitle')}
                </p>
              </div>

              {/* Immediate language switch on Step 1 */}
              <div className="pt-2 max-w-md mx-auto space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-indigo-500" />
                  {t('wizardQuickLang')}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { code: 'fr', name: 'Français', flag: '🇫🇷' },
                    { code: 'en', name: 'English', flag: '🇬🇧' },
                    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' },
                    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
                  ].map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => handleLanguageChange(l.code as any)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        language === l.code
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-indigo-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className="text-[10px]">{l.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('wizardStartBtn')}</span>
                  <NextArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Langue & Devise */}
          {step === 2 && (
            <div className="space-y-6" id="wizard-step-2">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Languages className="text-indigo-500 w-5 h-5" />
                  {t('wizardStep2Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('wizardStep2Desc')}
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('wizardLangLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { code: 'fr', name: 'Français', flag: '🇫🇷' },
                    { code: 'en', name: 'English', flag: '🇬🇧' },
                    { code: 'ar', name: 'العربية (RTL)', flag: '🇸🇦' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' },
                    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code as any)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                        language === lang.code 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-500 dark:text-indigo-400 font-bold shadow-2xs' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {language === lang.code && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-indigo-500" />
                  {t('wizardCurrencyLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { code: 'TND', label: 'TND (DT)', desc: 'Dinar Tunisien' },
                    { code: 'EUR', label: 'EUR (€)', desc: 'Euro' },
                    { code: 'USD', label: 'USD ($)', desc: 'Dollar US' },
                    { code: 'DZD', label: 'DZD (DA)', desc: 'Dinar Algérien' },
                    { code: 'MAD', label: 'MAD (DH)', desc: 'Dirham Marocain' },
                    { code: 'GBP', label: 'GBP (£)', desc: 'Livre Sterling' },
                  ].map(curr => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`flex flex-col text-start p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedCurrency === curr.code 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-500 dark:text-indigo-400 font-bold shadow-2xs' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{curr.label}</span>
                      <span className="text-[10px] text-slate-400">{curr.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Identité de l'Élevage */}
          {step === 3 && (
            <div className="space-y-6" id="wizard-step-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clipboard className="text-indigo-500 w-5 h-5" />
                  {t('wizardStep3Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('wizardStep3Desc')}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('wizardAviaryNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={aviaryName}
                    onChange={(e) => setAviaryName(e.target.value)}
                    placeholder={t('wizardAviaryNamePlaceholder')}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('wizardBreederNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={breederName}
                    onChange={(e) => setBreederName(e.target.value)}
                    placeholder={t('wizardBreederNamePlaceholder')}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Espèces Élevées */}
          {step === 4 && (
            <div className="space-y-6" id="wizard-step-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bird className="text-indigo-500 w-5 h-5" />
                  {t('wizardStep4Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('wizardStep4Desc')}
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('wizardSpeciesLabel')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'canari', speciesIds: ['canari'], name: t('wizardSpeciesCanari'), desc: t('wizardSpeciesCanariDesc') },
                      { id: 'chardonneret_elegant', speciesIds: ['chardonneret_elegant'], name: t('wizardSpeciesChardonneret'), desc: t('wizardSpeciesChardonneretDesc') },
                      { id: 'exotique', speciesIds: ['diamant_mandarin', 'diamant_gould'], name: t('wizardSpeciesExotique'), desc: t('wizardSpeciesExotiqueDesc') },
                      { id: 'perruche', speciesIds: ['perruche_ondulee', 'agapornis', 'calopsitte'], name: t('wizardSpeciesCrochu'), desc: t('wizardSpeciesCrochuDesc') }
                    ].map(spec => {
                      const isSel = spec.speciesIds.some(id => selectedSpecies.includes(id));
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => toggleSpeciesGroup(spec.speciesIds)}
                          className={`flex flex-col text-start p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSel 
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-500 dark:text-indigo-400 font-bold' 
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xs font-bold">{spec.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{spec.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Première Installation & Zone */}
          {step === 5 && (
            <div className="space-y-6" id="wizard-step-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Home className="text-indigo-500 w-5 h-5" />
                  {t('wizardStep5Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('wizardStep5Desc')}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('wizardFacilityNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder={t('wizardFacilityPlaceholder')}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('wizardZoneNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder={t('wizardZonePlaceholder')}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveFacility}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('save')} & {t('wizardNext')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Création de la Première Cage */}
          {step === 6 && (
            <div className="space-y-6" id="wizard-step-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Grid className="text-indigo-500 w-5 h-5" />
                  {t('wizardStep6Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('wizardStep6Desc')}
                </p>
              </div>

              {cageCreatedSuccess ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-center space-y-1 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm">{t('wizardCageSuccess')}</span>
                  <span className="text-slate-500">{t('wizardStep7Title')}...</span>
                </div>
              ) : (
                <form onSubmit={handleCreateCage} className="space-y-4 pt-1 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('wizardCageNameLabel')}
                    </label>
                    <input
                      type="text"
                      required
                      value={cageName}
                      onChange={(e) => setCageName(e.target.value)}
                      placeholder={t('wizardCageNamePlaceholder')}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('wizardCageCapacityLabel')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={cageCapacity}
                        onChange={(e) => setCageCapacity(parseInt(e.target.value, 10) || 1)}
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('wizardCageTypeLabel')}
                      </label>
                      <input
                        type="text"
                        value={cageDescription}
                        onChange={(e) => setCageDescription(e.target.value)}
                        placeholder="Ex: Cage individuelle, Volière"
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{t('wizardSaveCageBtn')}</span>
                      <NextArrowIcon className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 7: Premier Oiseau Fondateur */}
          {step === 7 && (
            <div className="space-y-6" id="wizard-step-7">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bird className="text-indigo-500 w-5 h-5 animate-pulse" />
                  {t('wizardStep7Title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('wizardStep7Desc')}
                </p>
              </div>

              {availableCages.length === 0 ? (
                /* NO CAGE BLOCKER: Must create cage first */
                <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl text-center space-y-3 text-xs">
                  <div className="flex items-center justify-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{t('wizardNoCageWarning')}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {t('wizardStep6Desc')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Grid className="w-4 h-4" />
                    <span>{t('wizardCreateCageBtn')}</span>
                  </button>
                </div>
              ) : birdSuccess ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-center space-y-2 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-sm">{t('wizardBirdSuccess')}</span>
                  <span className="text-slate-500">{t('wizardFinish')}...</span>
                </div>
              ) : (
                <form onSubmit={handleCreateFirstBird} className="space-y-4 pt-1 text-xs">
                  {Object.keys(birdErrors).length > 0 && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-xs space-y-1">
                      {Object.values(birdErrors).map((msg, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{String(msg)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelRing')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={birdRing}
                        onChange={(e) => setBirdRing(e.target.value)}
                        placeholder="Ex: BE-2026-001"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelName')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={birdName}
                        onChange={(e) => setBirdName(e.target.value)}
                        placeholder="Ex: Phoenix"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelSpecies')} *
                      </label>
                      <select
                        value={birdSpecies}
                        onChange={(e) => handleSpeciesSelect(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      >
                        {wizardSpeciesList.map(spec => (
                          <option key={spec.id} value={spec.id}>{spec.defaultLabel}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelCategory')} *
                      </label>
                      <select
                        value={birdCategory}
                        onChange={(e) => handleCategorySelect(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      >
                        {currentCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.defaultLabel}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelBreed')} *
                      </label>
                      <select
                        value={birdRace}
                        onChange={(e) => setBirdRace(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      >
                        {currentBreeds.map(br => (
                          <option key={br.id} value={br.id}>{br.defaultLabel}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelGender')} *
                      </label>
                      <select
                        value={birdSex}
                        onChange={(e) => setBirdSex(e.target.value as any)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      >
                        <option value="Mâle">{t('male')}</option>
                        <option value="Femelle">{t('female')}</option>
                        <option value="Indéterminé">{t('undetermined')}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelColor')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={birdColor}
                        onChange={(e) => setBirdColor(e.target.value)}
                        placeholder="Ex: Jaune Shimmel"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('labelBirthDate')} *
                      </label>
                      <input
                        type="date"
                        required
                        value={birdBirthDate}
                        onChange={(e) => setBirdBirthDate(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('wizardCageSelectLabel')}
                    </label>
                    <select
                      required
                      value={selectedCageId}
                      onChange={(e) => setSelectedCageId(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                    >
                      {availableCages.length === 0 && (
                        <option value="">{t('wizardSelectCagePlaceholder')}</option>
                      )}
                      {availableCages.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nom} (Capacité: {c.capacite_max || 4})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('wizardBirdSaveBtn')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50/80 dark:bg-slate-900/60">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
          >
            <PrevArrowIcon className="w-4 h-4" />
            <span>{t('wizardPrev')}</span>
          </button>

          {step < stepsCount ? (
            <button
              type="button"
              onClick={() => {
                if (step === 5) {
                  handleSaveFacility();
                } else {
                  setStep(step + 1);
                }
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition shadow-sm"
            >
              <span>{t('wizardNext')}</span>
              <NextArrowIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm"
            >
              <span>{t('wizardFinish')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

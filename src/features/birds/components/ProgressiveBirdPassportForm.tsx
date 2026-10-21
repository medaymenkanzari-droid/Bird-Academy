/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PROGRESSIVE BIRD PASSPORT FORM
 * Saisie progressive en 4 niveaux, intelligente, adaptée à l'espèce, avec suggestions confirmables.
 * Version : V1.9.3 (Bird Passport — Expérience Utilisateur Avancée)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, X, Sparkles, HelpCircle, Dna, Eye, ShieldCheck, 
  AlertTriangle, ChevronRight, ChevronLeft, Save, User, 
  Calendar, MapPin, Award, FileText, ArrowRight, Layers,
  Info, ShieldAlert, CheckCircle2, RotateCcw
} from 'lucide-react';
import { Canari, Cage } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { SPECIES_REGISTRY, getSpeciesById } from '../../../data/speciesRegistry';
import { BirdPhotoUploader } from '../../../components/ui/BirdPhotoUploader';
import { AppInput, AppSelect, AppButton, AppBadge, AppAlert, SpeciesBadge } from '../../../components/design-system';
import { 
  PassportSuggestionService, 
  PassportSuggestion,
  SuggestionStatus 
} from '../services/PassportSuggestionService';
import { AssistantPassportDrawer } from '../../assistant/components/AssistantPassportDrawer';
import { SpeciesProfileService } from '../../species/services/SpeciesProfileService';

export interface ProgressiveBirdPassportFormProps {
  initialBird?: Partial<Canari> | null;
  onSave: (birdData: Canari) => void;
  onCancel: () => void;
  allBirds?: Canari[];
  cages?: Cage[];
  isModal?: boolean;
}

export const ProgressiveBirdPassportForm: React.FC<ProgressiveBirdPassportFormProps> = ({
  initialBird,
  onSave,
  onCancel,
  allBirds = [],
  cages = [],
  isModal = false
}) => {
  const { t, language, isRtl } = useLanguage();

  // Niveau actif (1 à 4)
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3 | 4>(1);

  // Espèce initiale : si initialBird a une espèce, ou s'il n'y a qu'une seule espèce active dans l'élevage (zéro fallback implicite Canary)
  const activeSpecies = SpeciesProfileService.getActiveSpeciesIds();
  const defaultSpecies = initialBird?.espece || (activeSpecies.length === 1 ? activeSpecies[0] : '');
  const defaultSpecData = defaultSpecies ? getSpeciesById(defaultSpecies) : null;
  const defaultCategory = initialBird?.categorie || defaultSpecData?.categories[0]?.id || '';
  const defaultBreed = initialBird?.race || defaultSpecData?.categories[0]?.breeds[0]?.id || '';

  // État du formulaire
  const [formData, setFormData] = useState<Partial<Canari>>({
    id: initialBird?.id,
    nom: initialBird?.nom || '',
    bague: initialBird?.bague || '',
    sexe: initialBird?.sexe || 'Mâle',
    espece: defaultSpecies,
    categorie: defaultCategory,
    race: defaultBreed,
    mutation: initialBird?.mutation || '',
    couleur_base: initialBird?.couleur_base || (defaultSpecies === 'canari' ? 'Jaune' : ''),
    facteur: initialBird?.facteur || (defaultSpecies === 'canari' ? 'Intensif' : ''),
    couleur: initialBird?.couleur || (defaultSpecies === 'canari' ? 'Jaune Intensif' : ''),
    date_naissance: initialBird?.date_naissance || new Date().toISOString().split('T')[0],
    statut_sante: initialBird?.statut_sante || 'Actif',
    cage_id: initialBird?.cage_id !== undefined ? initialBird.cage_id : (cages.length > 0 && cages[0].id ? Number(cages[0].id) : undefined),
    pere_id: initialBird?.pere_id,
    mere_id: initialBird?.mere_id,
    parent_pere_nourricier_id: initialBird?.parent_pere_nourricier_id,
    parent_mere_nourriciere_id: initialBird?.parent_mere_nourriciere_id,
    observations: initialBird?.observations || '',
    acquisition: !!initialBird?.acquisition,
    eleveur_origine: initialBird?.eleveur_origine || '',
    quarantaine: initialBird?.quarantaine,
    photo: initialBird?.photo || '',
    photos: initialBird?.photos || (initialBird?.photo ? [initialBird.photo] : []),
    documents: initialBird?.documents || [],
    passport: initialBird?.passport || {
      identity: {
        birdId: initialBird?.id || 0,
        name: initialBird?.nom || '',
        speciesId: defaultSpecies,
        breedId: defaultBreed,
        sex: initialBird?.sexe === 'Femelle' ? 'F' : initialBird?.sexe === 'Mâle' ? 'M' : 'UNKNOWN',
        birthDate: initialBird?.date_naissance
      }
    }
  });

  // Options Inconnu / Non renseigné pour Niveau 1
  const [isBirthDateUnknown, setIsBirthDateUnknown] = useState<boolean>(!initialBird?.date_naissance);
  const [isRingUnassigned, setIsRingUnassigned] = useState<boolean>(!initialBird?.bague);

  // Erreurs locales
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Assistant IA contextuel tiroir
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [assistantExplanationContext, setAssistantExplanationContext] = useState<any>(null);

  // Suggestions intelligentes
  const [suggestions, setSuggestions] = useState<PassportSuggestion[]>([]);

  // Espèce et catégories dynamiques
  const currentSpeciesId = formData.espece || defaultSpecies;
  const currentSpeciesMeta = useMemo(() => getSpeciesById(currentSpeciesId), [currentSpeciesId]);
  const availableCategories = useMemo(() => currentSpeciesMeta?.categories || [], [currentSpeciesMeta]);

  const currentCategoryObj = useMemo(() => {
    return availableCategories.find(c => c.id === formData.categorie) || availableCategories[0];
  }, [availableCategories, formData.categorie]);

  const availableBreeds = useMemo(() => currentCategoryObj?.breeds || [], [currentCategoryObj]);

  // Parents potentiels filtrés par sexe
  const potentialFathers = useMemo(() => {
    return allBirds.filter(b => b.sexe === 'Mâle' && b.id !== formData.id);
  }, [allBirds, formData.id]);

  const potentialMothers = useMemo(() => {
    return allBirds.filter(b => b.sexe === 'Femelle' && b.id !== formData.id);
  }, [allBirds, formData.id]);

  // Père et Mère actuels sélectionnés
  const selectedFather = useMemo(() => {
    return allBirds.find(b => b.id === formData.pere_id) || null;
  }, [allBirds, formData.pere_id]);

  const selectedMother = useMemo(() => {
    return allBirds.find(b => b.id === formData.mere_id) || null;
  }, [allBirds, formData.mere_id]);

  // Détection des suggestions lorsque les parents ou l'espèce changent
  useEffect(() => {
    if (selectedFather || selectedMother) {
      const generated = PassportSuggestionService.generateSuggestions({
        bird: formData,
        speciesId: formData.espece,
        sex: formData.sexe,
        father: selectedFather,
        mother: selectedMother,
        allBirds
      });
      setSuggestions(generated);
    } else {
      setSuggestions([]);
    }
  }, [formData.pere_id, formData.mere_id, formData.espece, formData.sexe, selectedFather, selectedMother]);

  // Changement de champ générique
  const handleFieldChange = (field: keyof Canari, val: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Changement d'espèce (adaptation dynamique des catégories et races)
  const handleSpeciesChange = (newSpeciesId: string) => {
    const meta = getSpeciesById(newSpeciesId);
    const firstCat = meta?.categories[0]?.id || 'classique';
    const firstBreed = meta?.categories[0]?.breeds[0]?.id || 'Classique';

    setFormData(prev => ({
      ...prev,
      espece: newSpeciesId,
      categorie: firstCat,
      race: firstBreed,
      mutation: 'Classique',
      couleur_base: newSpeciesId === 'canari' ? 'Jaune' : 'Sauvage / Standard',
      facteur: newSpeciesId === 'canari' ? 'Intensif' : 'Standard'
    }));
  };

  // Traitement d'une suggestion
  const handleSuggestionAction = (
    suggestion: PassportSuggestion,
    action: 'ACCEPT' | 'MODIFY' | 'REJECT' | 'UNKNOWN' | 'NOT_TESTED',
    customVal?: any
  ) => {
    const { updatedFields, resolvedSuggestion } = PassportSuggestionService.resolveSuggestion(
      suggestion,
      action,
      customVal
    );

    setFormData(prev => ({
      ...prev,
      ...updatedFields
    }));

    setSuggestions(prev => prev.map(s => s.id === suggestion.id ? resolvedSuggestion : s));
  };

  // Validation Niveau 1 (Essentiel)
  const validateLevel1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.nom || formData.nom.trim().length === 0) {
      errs.nom = "Le nom usuel est requis.";
    }
    if (!isRingUnassigned && (!formData.bague || formData.bague.trim().length === 0)) {
      errs.bague = "Le numéro de bague est requis (ou cochez Non bagué).";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Soumission finale de l'oiseau
  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateLevel1()) {
      setCurrentLevel(1);
      return;
    }

    // Préparation de l'oiseau pour persistance
    const effectiveBague = isRingUnassigned || !formData.bague?.trim()
      ? `TEMP-${Date.now().toString().slice(-6)}`
      : formData.bague.trim();

    const effectiveBirthDate = isBirthDateUnknown || !formData.date_naissance
      ? new Date().toISOString().split('T')[0]
      : formData.date_naissance;

    const effectiveCageId = formData.cage_id || (cages.length > 0 && cages[0].id ? Number(cages[0].id) : 1);

    const fullBird: Canari = {
      id: formData.id || Date.now(),
      nom: formData.nom!.trim(),
      bague: effectiveBague,
      sexe: formData.sexe || 'Indéterminé',
      espece: formData.espece || defaultSpecies,
      categorie: formData.categorie || defaultCategory,
      race: formData.race || defaultBreed,
      mutation: formData.mutation || 'Classique',
      couleur_base: formData.couleur_base || 'Standard',
      facteur: formData.facteur || 'Standard',
      couleur: `${formData.couleur_base || 'Standard'} ${formData.facteur || ''}`.trim(),
      date_naissance: effectiveBirthDate,
      statut_sante: formData.statut_sante || 'Actif',
      cage_id: effectiveCageId,
      cageId: String(effectiveCageId),
      pere_id: formData.pere_id || null,
      mere_id: formData.mere_id || null,
      parent_pere_nourricier_id: formData.parent_pere_nourricier_id || null,
      parent_mere_nourriciere_id: formData.parent_mere_nourriciere_id || null,
      observations: formData.observations || '',
      acquisition: !!formData.acquisition,
      eleveur_origine: formData.eleveur_origine || '',
      quarantaine: formData.quarantaine,
      photo: formData.photo || '',
      photos: formData.photos || [],
      documents: formData.documents || [],
      passport: {
        ...(formData.passport || {}),
        identity: {
          birdId: formData.id || Date.now(),
          name: formData.nom!.trim(),
          speciesId: formData.espece || defaultSpecies,
          breedId: formData.race || defaultBreed,
          sex: formData.sexe === 'Femelle' ? 'F' : formData.sexe === 'Mâle' ? 'M' : 'UNKNOWN',
          birthDate: isBirthDateUnknown ? undefined : effectiveBirthDate,
          status: formData.statut_sante
        },
        phenotype: {
          coloration: formData.couleur_base,
          plumage: formData.facteur,
          visibleFactors: formData.mutation ? [formData.mutation] : []
        }
      } as any
    };

    onSave(fullBird);
  };

  // Assistant contextuel
  const openAssistantForTopic = (topic: string, rationale?: string) => {
    setAssistantExplanationContext({ topic, rationale, bird: formData });
    setIsAssistantOpen(true);
  };

  return (
    <div className={`space-y-6 animate-fadeIn ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* En-tête avec progression par niveaux */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                V1.9.3 Homologuée
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {t('passportProgressStatus', { level: currentLevel })}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Dna className="w-6 h-6 text-emerald-400" />
              <span>{t('progressivePassportTitle')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {t('progressivePassportSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AppButton
              variant="outline"
              size="sm"
              onClick={onCancel}
              startIcon={<X className="w-4 h-4" />}
              className="border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white"
            >
              {t('cancel')}
            </AppButton>
            <AppButton
              variant="primary"
              size="sm"
              onClick={handleFinalSubmit}
              data-testid="passport-save-button"
              startIcon={<Save className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40"
            >
              {t('saveBirdNow')}
            </AppButton>
          </div>
        </div>

        {/* Stepper des 4 niveaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-5">
          {[
            { lvl: 1, title: t('level1Title'), sub: "Identifiant, nom, espèce", active: currentLevel === 1, done: currentLevel > 1 },
            { lvl: 2, title: t('level2Title'), sub: "Catégorie, race, parents", active: currentLevel === 2, done: currentLevel > 2 },
            { lvl: 3, title: t('level3Title'), sub: "Phénotype, génotype, porteur", active: currentLevel === 3, done: currentLevel > 3 },
            { lvl: 4, title: t('level4Title'), sub: "Biométrie, standard, docs", active: currentLevel === 4, done: false }
          ].map((step) => (
            <button
              key={step.lvl}
              type="button"
              onClick={() => {
                if (step.lvl === 1 || validateLevel1()) {
                  setCurrentLevel(step.lvl as any);
                }
              }}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                step.active
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/30'
                  : step.done
                    ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                  step.active
                    ? 'bg-emerald-500 text-slate-950'
                    : step.done
                      ? 'bg-slate-700 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {step.done ? <Check className="w-3.5 h-3.5" /> : step.lvl}
                </span>
                {step.active && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <p className="text-xs font-bold text-white tracking-tight line-clamp-1">{step.title}</p>
              <p className="text-3xs text-slate-400 mt-0.5 line-clamp-1">{step.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NIVEAU 1 — IDENTITÉ ESSENTIELLE */}
      {/* ========================================================================= */}
      {currentLevel === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                {t('level1Title')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t('level1Subtitle')}</p>
            </div>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => openAssistantForTopic("identity", "Pourquoi ces informations d'identité sont-elles nécessaires ?")}
              startIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
              className="border-slate-800 bg-slate-800/40 text-slate-300 text-xs"
            >
              {t('askAssistantEducational')}
            </AppButton>
          </div>

          {/* Photo uploader */}
          <div className="pb-4 border-b border-slate-800">
            <BirdPhotoUploader
              photo={formData.photo}
              onChange={(newPhoto) => {
                handleFieldChange('photo', newPhoto || '');
                handleFieldChange('photos', newPhoto ? [newPhoto] : []);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom usuel */}
            <AppInput
              label="Nom usuel / Surnom *"
              value={formData.nom || ''}
              onChange={(e) => handleFieldChange('nom', e.target.value)}
              error={errors.nom}
              placeholder="ex. Rubis, Étoile, Flash..."
            />

            {/* Bague avec option non bagué */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Numéro de bague (Identifiant) *
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRingUnassigned}
                    onChange={(e) => {
                      setIsRingUnassigned(e.target.checked);
                      if (e.target.checked) handleFieldChange('bague', '');
                    }}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>{t('ringNotSet')}</span>
                </label>
              </div>
              <AppInput
                value={isRingUnassigned ? '' : (formData.bague || '')}
                onChange={(e) => handleFieldChange('bague', e.target.value)}
                disabled={isRingUnassigned}
                error={errors.bague}
                placeholder={isRingUnassigned ? "(Identifiant temporaire auto-généré)" : "ex. FR-2026-908"}
              />
            </div>

            {/* Sélecteur d'Espèce */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Espèce de l'oiseau *
                </label>
                <SpeciesBadge speciesId={currentSpeciesId} size="sm" />
              </div>
              <AppSelect
                value={formData.espece || defaultSpecies}
                onChange={(e) => handleSpeciesChange(e.target.value)}
                options={[
                  ...(!formData.espece && !defaultSpecies ? [{ value: '', label: '— Sélectionner une espèce —' }] : []),
                  ...SPECIES_REGISTRY.map(s => ({
                    value: s.id,
                    label: s.defaultLabel
                  }))
                ]}
              />
            </div>

            {/* Sexe avec option Inconnu */}
            <AppSelect
              label="Sexe biologique *"
              value={formData.sexe || 'Mâle'}
              onChange={(e) => handleFieldChange('sexe', e.target.value)}
              options={[
                { value: 'Mâle', label: "♂ Mâle" },
                { value: 'Femelle', label: "♀ Femelle" },
                { value: 'Indéterminé', label: `❓ ${t('leaveUnknown')} (UNKNOWN)` }
              ]}
            />

            {/* Date de naissance avec option Inconnue */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Date de naissance / éclosion
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBirthDateUnknown}
                    onChange={(e) => {
                      setIsBirthDateUnknown(e.target.checked);
                      if (e.target.checked) handleFieldChange('date_naissance', '');
                    }}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>{t('birthDateUnknown')}</span>
                </label>
              </div>
              <AppInput
                type="date"
                value={isBirthDateUnknown ? '' : (formData.date_naissance || '')}
                onChange={(e) => handleFieldChange('date_naissance', e.target.value)}
                disabled={isBirthDateUnknown}
              />
            </div>

            {/* Origine initiale */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="acquisition_cb"
                checked={!!formData.acquisition}
                onChange={(e) => handleFieldChange('acquisition', e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
              <label htmlFor="acquisition_cb" className="text-xs font-bold text-slate-300 cursor-pointer">
                Oiseau issu d'une acquisition extérieure (autre élevage)
              </label>
            </div>
          </div>

          {/* Boutons de bas de page Niveau 1 */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-800">
            <AppButton
              variant="outline"
              onClick={onCancel}
            >
              {t('cancel')}
            </AppButton>
            <div className="flex items-center gap-3">
              <AppButton
                variant="outline"
                onClick={handleFinalSubmit}
                startIcon={<Save className="w-4 h-4" />}
                className="border-emerald-600/40 text-emerald-400 hover:bg-emerald-950/20"
              >
                {t('saveBirdNow')}
              </AppButton>
              <AppButton
                variant="primary"
                onClick={() => {
                  if (validateLevel1()) setCurrentLevel(2);
                }}
                endIcon={<ChevronRight className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {t('saveAndContinue')}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NIVEAU 2 — CONTEXTE ESPÈCE & ASCENDANCE */}
      {/* ========================================================================= */}
      {currentLevel === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                {t('level2Title')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t('level2Subtitle')}</p>
            </div>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => openAssistantForTopic("context", "Comment le contexte de l'espèce est-il pris en compte ?")}
              startIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
              className="border-slate-800 bg-slate-800/40 text-slate-300 text-xs"
            >
              {t('askAssistantEducational')}
            </AppButton>
          </div>

          {/* Panneau des suggestions héritées si parents sélectionnés */}
          {suggestions.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-200">
                      {t('suggestionsDetected', { count: suggestions.length })}
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      Valeurs héritées des parents proposées comme suggestions modifiables.
                    </p>
                  </div>
                </div>
                <AppBadge variant="warning" className="text-2xs uppercase">
                  {t('suggestionBadge')}
                </AppBadge>
              </div>

              <div className="space-y-3 pt-2">
                {suggestions.map((sug) => (
                  <div 
                    key={sug.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{sug.defaultLabel} :</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                          {String(sug.suggestedValue)}
                        </span>
                        <span className="text-3xs text-slate-400 font-mono">({sug.sourceDescription})</span>
                      </div>
                      <p className="text-xs text-slate-300/80">{sug.rationale}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSuggestionAction(sug, 'ACCEPT')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('acceptSuggestion')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionAction(sug, 'REJECT')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                      >
                        {t('rejectSuggestion')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSuggestionAction(sug, 'UNKNOWN')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
                        title={t('leaveUnknown')}
                      >
                        {t('leaveUnknown')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Catégorie d'élevage selon l'espèce */}
            <AppSelect
              label={`Catégorie (${currentSpeciesMeta?.defaultLabel || 'Espèce'}) *`}
              value={formData.categorie || ''}
              onChange={(e) => handleFieldChange('categorie', e.target.value)}
              options={availableCategories.map(c => ({
                value: c.id,
                label: c.defaultLabel
              }))}
            />

            {/* Race / Variété selon l'espèce et catégorie */}
            <AppSelect
              label={`Race / Variété (${currentCategoryObj?.defaultLabel || 'Standard'}) *`}
              value={formData.race || ''}
              onChange={(e) => handleFieldChange('race', e.target.value)}
              options={availableBreeds.map(b => ({
                value: b.id,
                label: b.defaultLabel
              }))}
            />

            {/* Cage d'affectation */}
            <AppSelect
              label="Cage d'affectation"
              value={formData.cage_id !== undefined && formData.cage_id !== null ? String(formData.cage_id) : ''}
              onChange={(e) => handleFieldChange('cage_id', e.target.value ? Number(e.target.value) : undefined)}
              options={[
                { value: '', label: "Assigner plus tard / Non assigné" },
                ...cages.map(c => ({ value: String(c.id), label: `${c.nom} (Capacité ${c.capacite_max})` }))
              ]}
            />

            {/* Statut actuel de l'oiseau */}
            <AppSelect
              label="Statut d'élevage actuel"
              value={formData.statut_sante || 'Actif'}
              onChange={(e) => handleFieldChange('statut_sante', e.target.value)}
              options={[
                { value: 'Actif', label: "Actif / En élevage" },
                { value: 'Quarantaine', label: "En quarantaine" },
                { value: 'Malade', label: "En traitement / Soin" },
                { value: 'Reproduction', label: "En cours de reproduction" },
                { value: 'Repos', label: "En repos" },
                { value: 'Vendu', label: "Vendu" },
                { value: 'Décédé', label: "Décédé" }
              ]}
            />

            {/* Père Biologique */}
            <AppSelect
              label="Père Biologique (♂)"
              value={formData.pere_id ? String(formData.pere_id) : ''}
              onChange={(e) => handleFieldChange('pere_id', e.target.value ? Number(e.target.value) : null)}
              options={[
                { value: '', label: `-- ${t('leaveUnknown')} / ${t('leaveUnspecified')} --` },
                ...potentialFathers.map(f => ({
                  value: String(f.id),
                  label: `${f.nom} (${f.bague}) • ${f.race || f.espece}`
                }))
              ]}
            />

            {/* Mère Biologique */}
            <AppSelect
              label="Mère Biologique (♀)"
              value={formData.mere_id ? String(formData.mere_id) : ''}
              onChange={(e) => handleFieldChange('mere_id', e.target.value ? Number(e.target.value) : null)}
              options={[
                { value: '', label: `-- ${t('leaveUnknown')} / ${t('leaveUnspecified')} --` },
                ...potentialMothers.map(m => ({
                  value: String(m.id),
                  label: `${m.nom} (${m.bague}) • ${m.race || m.espece}`
                }))
              ]}
            />
          </div>

          {/* Boutons de navigation Niveau 2 */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-800">
            <AppButton
              variant="outline"
              onClick={() => setCurrentLevel(1)}
              startIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {t('prevStep')}
            </AppButton>
            <div className="flex items-center gap-3">
              <AppButton
                variant="outline"
                onClick={handleFinalSubmit}
                startIcon={<Save className="w-4 h-4" />}
                className="border-emerald-600/40 text-emerald-400 hover:bg-emerald-950/20"
              >
                {t('saveBirdNow')}
              </AppButton>
              <AppButton
                variant="primary"
                onClick={() => setCurrentLevel(3)}
                endIcon={<ChevronRight className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {t('saveAndContinue')}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NIVEAU 3 — GÉNÉTIQUE & PHÉNOTYPE (SÉPARATION STRICTE) */}
      {/* ========================================================================= */}
      {currentLevel === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                {t('level3Title')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t('level3Subtitle')}</p>
            </div>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => openAssistantForTopic("genetics_separation", "Quelle est la différence fondamentale entre phénotype observé, génotype connu et statut porteur ?")}
              startIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
              className="border-slate-800 bg-slate-800/40 text-slate-300 text-xs"
            >
              {t('askAssistantEducational')}
            </AppButton>
          </div>

          {/* Section 1 : Phénotype Observé */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{t('observedPhenotype')}</h4>
              <span className="text-3xs text-slate-400">({t('observedPhenotypeDesc')})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label="Couleur de base ou Masque observé"
                value={formData.couleur_base || ''}
                onChange={(e) => handleFieldChange('couleur_base', e.target.value)}
                placeholder="ex. Jaune, Tête Rouge, Gris Sauvage..."
              />
              <AppInput
                label="Structure ou Facteur de plumage"
                value={formData.facteur || ''}
                onChange={(e) => handleFieldChange('facteur', e.target.value)}
                placeholder="ex. Intensif, Schimmel, Mosaïque, Normal..."
              />
            </div>
          </div>

          {/* Section 2 : Génotype Connu */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{t('knownGenotype')}</h4>
              <span className="text-3xs text-slate-400">({t('knownGenotypeDesc')})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label="Formule allélique / Génotype confirmé"
                value={formData.mutation === 'Classique' ? '' : (formData.mutation || '')}
                onChange={(e) => handleFieldChange('mutation', e.target.value)}
                placeholder="ex. Z+/Z+, b/b, ou laisser vide si indéterminé"
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleFieldChange('mutation', 'UNKNOWN')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer w-full"
                >
                  {t('genotypeUndetermined')}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3 : Statut Porteur (Carrier) */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{t('carrierStatus')}</h4>
              <span className="text-3xs text-slate-400">({t('carrierStatusDesc')})</span>
            </div>

            {formData.sexe === 'Femelle' && (
              <AppAlert type="warning">
                {t('zwFemaleCarrierWarning')}
              </AppAlert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label="Mutations récessives portées (ex. /brun, /blanc)"
                value={(formData.passport?.genetics as any)?.carrierStatuses?.[0] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    passport: {
                      ...(prev.passport || {}),
                      genetics: {
                        ...(prev.passport?.genetics || {}),
                        carrierStatuses: val ? [val] : []
                      }
                    } as any
                  }));
                }}
                placeholder="ex. Porteur Brun, Porteur Blanc..."
              />
              <div className="flex items-center gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      passport: {
                        ...(prev.passport || {}),
                        genetics: {
                          ...(prev.passport?.genetics || {}),
                          carrierStatuses: ['NOT_TESTED']
                        }
                      } as any
                    }));
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 cursor-pointer flex-1"
                >
                  {t('leaveNotTested')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      passport: {
                        ...(prev.passport || {}),
                        genetics: {
                          ...(prev.passport?.genetics || {}),
                          carrierStatuses: []
                        }
                      } as any
                    }));
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 cursor-pointer flex-1"
                >
                  {t('noCarrierSuspected')}
                </button>
              </div>
            </div>
          </div>

          {/* Section 4 : Qualification Épistémique */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{t('epistemicQualification')}</h4>
              <span className="text-3xs text-slate-400">({t('epistemicQualificationDesc')})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppSelect
                label="Provenance de la qualification"
                value="OBSERVED"
                onChange={() => {}}
                options={[
                  { value: 'OBSERVED', label: t('provenanceObserved') },
                  { value: 'DECLARED', label: t('provenanceDeclared') },
                  { value: 'DNA_TEST', label: t('provenanceDna') },
                  { value: 'INFERRED', label: t('provenanceInferred') },
                  { value: 'UNKNOWN', label: t('leaveUnknown') }
                ]}
              />
              <AppSelect
                label="Niveau de confiance scientifique"
                value="HIGH"
                onChange={() => {}}
                options={[
                  { value: 'HIGH', label: t('confidenceHigh') },
                  { value: 'MEDIUM', label: t('confidenceMedium') },
                  { value: 'LOW', label: t('confidenceLow') },
                  { value: 'UNKNOWN', label: t('confidenceUnknown') }
                ]}
              />
            </div>
          </div>

          {/* Boutons de navigation Niveau 3 */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-800">
            <AppButton
              variant="outline"
              onClick={() => setCurrentLevel(2)}
              startIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {t('prevStep')}
            </AppButton>
            <div className="flex items-center gap-3">
              <AppButton
                variant="outline"
                onClick={handleFinalSubmit}
                startIcon={<Save className="w-4 h-4" />}
                className="border-emerald-600/40 text-emerald-400 hover:bg-emerald-950/20"
              >
                {t('saveBirdNow')}
              </AppButton>
              <AppButton
                variant="primary"
                onClick={() => setCurrentLevel(4)}
                endIcon={<ChevronRight className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {t('saveAndContinue')}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NIVEAU 4 — INFORMATIONS AVANCÉES */}
      {/* ========================================================================= */}
      {currentLevel === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                {t('level4Title')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t('level4Subtitle')}</p>
            </div>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => openAssistantForTopic("advanced", "Pourquoi ces informations avancées restent-elles optionnelles ?")}
              startIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
              className="border-slate-800 bg-slate-800/40 text-slate-300 text-xs"
            >
              {t('askAssistantEducational')}
            </AppButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lignée d'adoption / Parents nourriciers */}
            <AppSelect
              label="Père Nourricier (Adoption)"
              value={formData.parent_pere_nourricier_id ? String(formData.parent_pere_nourricier_id) : ''}
              onChange={(e) => handleFieldChange('parent_pere_nourricier_id', e.target.value ? Number(e.target.value) : null)}
              options={[
                { value: '', label: "-- Aucun parent adoptif --" },
                ...potentialFathers.map(f => ({ value: String(f.id), label: `${f.nom} (${f.bague})` }))
              ]}
            />

            <AppSelect
              label="Mère Nourricière (Adoption)"
              value={formData.parent_mere_nourriciere_id ? String(formData.parent_mere_nourriciere_id) : ''}
              onChange={(e) => handleFieldChange('parent_mere_nourriciere_id', e.target.value ? Number(e.target.value) : null)}
              options={[
                { value: '', label: "-- Aucune parente adoptive --" },
                ...potentialMothers.map(m => ({ value: String(m.id), label: `${m.nom} (${m.bague})` }))
              ]}
            />

            {/* Éleveur d'origine si acquisition */}
            {formData.acquisition && (
              <AppInput
                label="Éleveur d'origine / Source"
                value={formData.eleveur_origine || ''}
                onChange={(e) => handleFieldChange('eleveur_origine', e.target.value)}
                placeholder="Nom de l'éleveur cédant"
              />
            )}
          </div>

          {/* Observations libres */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Observations, comportement & notes libres
            </label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => handleFieldChange('observations', e.target.value)}
              className="w-full h-28 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Notes sur la fertilité, le chant, le comportement ou les soins..."
            />
          </div>

          {/* Boutons de navigation Niveau 4 */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-800">
            <AppButton
              variant="outline"
              onClick={() => setCurrentLevel(3)}
              startIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {t('prevStep')}
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleFinalSubmit}
              startIcon={<Save className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-950/40"
            >
              {t('saveBirdNow')}
            </AppButton>
          </div>
        </div>
      )}

      {/* Tiroir Assistant IA explicatif (V1.9.0/V1.9.2 réutilisé, lecture seule) */}
      <AssistantPassportDrawer
        open={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        bird={formData as Canari}
      />
    </div>
  );
};

export default ProgressiveBirdPassportForm;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { 
  Sparkles, Languages, Clipboard, Target, HelpCircle, Bird, 
  Check, ArrowRight, ArrowLeft, X, RefreshCw 
} from 'lucide-react';

interface WelcomeWizardProps {
  onClose: () => void;
  onComplete: () => void;
}

export const WelcomeWizard: React.FC<WelcomeWizardProps> = ({ onClose, onComplete }) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [step, setStep] = useState<number>(1);
  const [aviaryName, setAviaryName] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(['canari']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['loisir']);
  
  // First bird form state
  const [ring, setRing] = useState<string>('');
  const [birdName, setBirdName] = useState<string>('');
  const [sex, setSex] = useState<'Mâle' | 'Femelle' | 'Indéterminé'>('Indéterminé');
  const [race, setRace] = useState<string>('');
  const [color, setColor] = useState<string>('');

  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const stepsCount = 7;

  const handleLanguageChange = (lang: 'fr' | 'en' | 'ar' | 'es' | 'it') => {
    setLanguage(lang);
  };

  const toggleSpecies = (id: string) => {
    if (selectedSpecies.includes(id)) {
      setSelectedSpecies(selectedSpecies.filter(x => x !== id));
    } else {
      setSelectedSpecies([...selectedSpecies, id]);
    }
  };

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(x => x !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleCreateFirstBird = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ring.trim()) return;

    try {
      BirdRepository.create({
        bague: ring,
        nom: birdName || t('unknown'),
        sexe: sex,
        categorie: 'Posture',
        race: race || 'Gloster Fancy',
        mutation: 'Classique',
        couleur_base: color || 'Jaune',
        facteur: 'Intensif',
        couleur: color || 'Jaune Shimmel',
        date_naissance: new Date().toISOString().split('T')[0],
        cage_id: 1,
        pere_id: null,
        mere_id: null,
        archived: false,
        photos: [],
        documents: []
      });
      setIsSuccess(true);
      setTimeout(() => {
        handleFinish();
      }, 1500);
    } catch (e) {
      console.error("Failed to create first onboarding bird", e);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('bird_academy_wizard_completed', 'true');
    localStorage.setItem('bird_academy_aviary_name', aviaryName || 'Mon Élevage');
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans" id="welcome-wizard-overlay">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header / Step Progress */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-500 w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
              {t('helpWizard')}
            </h3>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {step} / {stepsCount}
            </span>
            <button 
              onClick={handleSkip} 
              className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              Passer (Skip)
            </button>
          </div>
        </div>

        {/* Wizard Track Indicator */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1">
          <div 
            className="bg-indigo-600 h-1 transition-all duration-300" 
            style={{ width: `${(step / stepsCount) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto flex-1 min-h-[350px]">
          {step === 1 && (
            <div className="space-y-6 text-center py-4" id="wizard-step-1">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Bienvenue dans Bird Academy !
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  L'écosystème professionnel pour administrer votre cheptel, optimiser les accouplements génétiques, et suivre la croissance de vos oisillons.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  Commencer la Configuration <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6" id="wizard-step-2">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Languages className="text-indigo-500 w-5 h-5" />
                  Langue de l'Élevage
                </h3>
                <p className="text-xs text-gray-400">
                  Choisissez la langue d'affichage globale de l'application.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { code: 'fr', name: 'Français', flag: '🇫🇷' },
                  { code: 'en', name: 'English', flag: '🇬🇧' },
                  { code: 'ar', name: 'العربية (RTL)', flag: '🇩🇿' },
                  { code: 'es', name: 'Español', flag: '🇪🇸' },
                  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as any)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-semibold cursor-pointer transition ${language === lang.code ? 'border-indigo-600 bg-indigo-50/40 text-indigo-600 dark:bg-indigo-950/10 dark:text-indigo-400' : 'border-gray-100 dark:border-gray-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <span>{lang.flag} {lang.name}</span>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6" id="wizard-step-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clipboard className="text-indigo-500 w-5 h-5" />
                  Identité de votre Élevage
                </h3>
                <p className="text-xs text-gray-400">
                  Attribuez un nom à votre structure ou aviaire locale.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">
                  Nom de l'Élevage
                </label>
                <input
                  type="text"
                  value={aviaryName}
                  onChange={(e) => setAviaryName(e.target.value)}
                  placeholder="Ex: Les Volières d'Azur"
                  className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6" id="wizard-step-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bird className="text-indigo-500 w-5 h-5" />
                  Espèces Élevées
                </h3>
                <p className="text-xs text-gray-400">
                  Sélectionnez les espèces d'oiseaux domestiques présentes chez vous.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'canari', name: 'Canari Domestique', desc: 'Posture, Chant, Couleur' },
                  { id: 'chardonneret_elegant', name: 'Chardonneret Élégant', desc: 'Indigène sauvage & mutations' },
                  { id: 'exotique', name: 'Exotique Bec Droit', desc: 'Diamant de Gould, Mandarin' },
                  { id: 'perruche', name: 'Crochu / Perruches', desc: 'Ondulées, Inséparables' }
                ].map(spec => {
                  const isSel = selectedSpecies.includes(spec.id);
                  return (
                    <button
                      key={spec.id}
                      onClick={() => toggleSpecies(spec.id)}
                      className={`flex flex-col text-left p-4 rounded-2xl border cursor-pointer transition ${isSel ? 'border-indigo-600 bg-indigo-50/40 text-indigo-600 dark:bg-indigo-950/10 dark:text-indigo-400' : 'border-gray-100 dark:border-gray-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span className="text-xs font-bold">{spec.name}</span>
                      <span className="text-xxs text-gray-400 dark:text-gray-500 mt-1">{spec.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6" id="wizard-step-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="text-indigo-500 w-5 h-5" />
                  Objectifs d'Élevage
                </h3>
                <p className="text-xs text-gray-400">
                  Ciblez vos objectifs pour que nous adaptions les recommandations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'concours', name: 'Championnats & Concours', desc: 'Baguage rigide et sélection standard COM' },
                  { id: 'loisir', name: 'Loisir & Passion', desc: 'Élevage amateur, confort et biodiversité' },
                  { id: 'preservation', name: 'Préservation Spécifique', desc: 'Conservation génétique et génotypage strict' },
                  { id: 'hybridation', name: 'Hybridation / Métissage', desc: 'Recherche de ramages et ramages mulets' }
                ].map(goal => {
                  const isSel = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`flex flex-col text-left p-4 rounded-2xl border cursor-pointer transition ${isSel ? 'border-indigo-600 bg-indigo-50/40 text-indigo-600 dark:bg-indigo-950/10 dark:text-indigo-400' : 'border-gray-100 dark:border-gray-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span className="text-xs font-bold">{goal.name}</span>
                      <span className="text-xxs text-gray-400 dark:text-gray-500 mt-1">{goal.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6" id="wizard-step-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="text-indigo-500 w-5 h-5" />
                  Tutoriel Rapide & Principes clés
                </h3>
                <p className="text-xs text-gray-400">
                  Prenez connaissance des routines d'utilisation.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold font-mono">1</div>
                  <p><strong>100% Local :</strong> Toutes vos données de reproduction, oiseaux et finances restent privées et stockées dans votre navigateur.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold font-mono">2</div>
                  <p><strong>Offline-First :</strong> L'application fonctionne sans aucune connexion Internet. Pratique pour l'utilisation directe au fond de la volière.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold font-mono">3</div>
                  <p><strong>Wright & Consanguinité :</strong> Avant chaque accouplement, simulez le couple pour estimer le taux de Wright et éviter les liaisons mortelles.</p>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6" id="wizard-step-7">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bird className="text-indigo-500 w-5 h-5 animate-pulse" />
                  Votre premier Oiseau
                </h3>
                <p className="text-xs text-gray-400">
                  Enregistrez votre tout premier oiseau fondateur pour déverrouiller le cheptel.
                </p>
              </div>

              {isSuccess ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl text-center space-y-2 text-xs">
                  <span className="text-emerald-600 font-bold block">✓ Oiseau créé avec succès !</span>
                  <span className="text-gray-500">Initialisation de l'avancement...</span>
                </div>
              ) : (
                <form onSubmit={handleCreateFirstBird} className="space-y-4 pt-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">Bague d'identification (Requis)</label>
                      <input
                        type="text"
                        required
                        value={ring}
                        onChange={(e) => setRing(e.target.value)}
                        placeholder="Ex: BE-2026-904"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">Nom / Surnom</label>
                      <input
                        type="text"
                        value={birdName}
                        onChange={(e) => setBirdName(e.target.value)}
                        placeholder="Ex: Phoenix"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">Sexe</label>
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value as any)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
                      >
                        <option value="Indéterminé">Indéterminé</option>
                        <option value="Mâle">Mâle</option>
                        <option value="Femelle">Femelle</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">Race / Phénotype</label>
                      <input
                        type="text"
                        value={race}
                        onChange={(e) => setRace(e.target.value)}
                        placeholder="Ex: Gloster Fancy"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider">Couleur Dominante</label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="Ex: Lipochrome Jaune"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition shadow-md"
                    >
                      Enregistrer et Terminer
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-gray-50 dark:bg-gray-900/50">
          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold inline-flex items-center gap-1 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Précédent
          </button>

          {step < stepsCount ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 hover:bg-indigo-700 cursor-pointer"
            >
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
            >
              Terminer (Finish)
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

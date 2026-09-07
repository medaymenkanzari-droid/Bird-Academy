/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { DemoDataGenerator } from '../utils/demoGenerator';
import { 
  Play, Power, RefreshCw, Trash2, Database, ShieldAlert, 
  Check, Info, Sparkles, Server, ChevronRight, Activity, Calendar, Award
} from 'lucide-react';

export const DemoModeTab: React.FC = () => {
  const { t, language } = useLanguage();
  const [isActive, setIsActive] = useState<boolean>(() => DemoDataGenerator.isDemoActive());
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('small');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  
  const [stats, setStats] = useState<{
    canaris: number;
    cages: number;
    couples: number;
    jeunes: number;
    depenses: number;
    ventes: number;
  }>({ canaris: 0, cages: 0, couples: 0, jeunes: 0, depenses: 0, ventes: 0 });

  const loadStats = () => {
    try {
      const isDemo = localStorage.getItem('bird_academy_demo_active') === 'true';
      const prefix = isDemo ? 'demo_' : '';
      
      const birds = JSON.parse(localStorage.getItem(`${prefix}canaris`) || '[]');
      const cages = JSON.parse(localStorage.getItem(`${prefix}cages`) || '[]');
      const couples = JSON.parse(localStorage.getItem(`${prefix}couples`) || '[]');
      const jeunes = JSON.parse(localStorage.getItem(`${prefix}jeunes`) || '[]');
      const depenses = JSON.parse(localStorage.getItem(`${prefix}depenses`) || '[]');
      const ventes = JSON.parse(localStorage.getItem(`${prefix}ventes`) || '[]');

      setStats({
        canaris: birds.length,
        cages: cages.length,
        couples: couples.length,
        jeunes: jeunes.length,
        depenses: depenses.length,
        ventes: ventes.length
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
  }, [isActive]);

  const handleToggle = () => {
    const nextState = !isActive;
    if (nextState) {
      // Toggle on small by default if no seed is found
      handleGenerate('small');
    } else {
      DemoDataGenerator.toggleDemo(false);
      setIsActive(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleGenerate = async (size: 'small' | 'medium' | 'large') => {
    setIsGenerating(true);
    setGenerationSteps([]);
    setSelectedSize(size);

    const steps = [
      "Initialisation de la structure d'habitats (2 Établissements, 4 Zones, Volières)...",
      "Génération des oiseaux fondateurs de première génération (Grand-parents)...",
      "Génération de la deuxième génération d'éleveurs accouplés...",
      "Calcul et établissement des arbres généalogiques et d'hérédité génétique...",
      "Seeding des examens de santé et des traitements vétérinaires...",
      "Injection de l'historique financier complet (Ventes & Dépenses sur 2026)...",
      "Planification des tâches du calendrier et des notifications système..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setGenerationSteps(prev => [...prev, steps[i]]);
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Seed and activate
    DemoDataGenerator.toggleDemo(true, size);
    setIsActive(true);
    setIsGenerating(false);
    
    loadStats();
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleResetDemo = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la base de démonstration ? Toutes vos modifications locales de démo seront écrasées.")) {
      handleGenerate(selectedSize);
    }
  };

  // Preview data for presets
  const presets = [
    {
      id: 'small' as const,
      title: 'Petit Élevage',
      subtitle: 'Idéal pour une exploration rapide',
      birds: '~50 oiseaux',
      males: '18 mâles',
      females: '18 femelles',
      young: '8 jeunes / 6 oisillons',
      cages: '5 cages & boxes',
      couples: '10 couples',
      finance: '15 dépenses / 10 ventes',
      complexity: 'Basse (Indexation instantanée)'
    },
    {
      id: 'medium' as const,
      title: 'Élevage Professionnel',
      subtitle: 'Idéal pour valider les analyses',
      birds: '~300 oiseaux',
      males: '110 mâles',
      females: '110 femelles',
      young: '50 jeunes / 30 oisillons',
      cages: '25 cages & boxes',
      couples: '60 couples',
      finance: '60 dépenses / 40 ventes',
      complexity: 'Moyenne (Stress-test léger)'
    },
    {
      id: 'large' as const,
      title: 'Très Grand Élevage',
      subtitle: 'stress-test de performances',
      birds: '1 200 oiseaux',
      males: '450 mâles',
      females: '450 femelles',
      young: '200 jeunes / 100 oisillons',
      cages: '100 cages & boxes',
      couples: '250 couples',
      finance: '200 dépenses / 150 ventes',
      complexity: 'Maximale ( stress-test & filtres)'
    }
  ];

  return (
    <div className="space-y-6 font-sans text-gray-800 dark:text-gray-200" id="demo-mode-tab">
      
      {/* Visual Header Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
              Mode Démonstration Isolé
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Explorez et testez l'application avec un élevage de démonstration entièrement simulé de manière isolée.
            </p>
          </div>

          <button
            onClick={handleToggle}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-sm self-start sm:self-center ${isActive ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            <Power className="w-4 h-4" />
            {isActive ? 'Désactiver la Démo' : 'Activer la Démo'}
          </button>
        </div>

        {/* Status Line */}
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${isActive ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400' : 'bg-gray-50 border-gray-100 text-gray-500 dark:bg-gray-900/40 dark:border-gray-800 dark:text-gray-400'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'}`} />
          <span>
            {isActive 
              ? "Le mode Démo est ACTIF. Vous naviguez dans la base d'évaluation isolée. Vos vraies données ne sont pas modifiées." 
              : "Le mode Démo est INACTIF. Vous consultez vos données d'élevage personnelles."
            }
          </span>
        </div>
      </div>

      {/* Generator Configuration Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-indigo-500 w-4 h-4" />
            Générateur d'Élevage de Démo Multi-Générationnel
          </h4>
          <p className="text-xs text-gray-400">
            Choisissez l'un des trois profils d'élevage ci-dessous pour tester l'application sous différentes charges de données.
          </p>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => {
            const isSelected = selectedSize === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedSize(preset.id)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer relative overflow-hidden ${isSelected ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <span className="block text-xs font-bold text-gray-900 dark:text-white">{preset.title}</span>
                    <span className="block text-xxs text-gray-400 dark:text-gray-500">{preset.subtitle}</span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-xxs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Oiseaux :</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{preset.birds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Couples :</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{preset.couples}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cages/Habitats :</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{preset.cages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Finances :</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{preset.finance}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xxs">
                  <span className="text-gray-400">Performance :</span>
                  <span className={`font-semibold ${preset.id === 'large' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {preset.complexity}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Generate Trigger Button */}
        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => handleGenerate(selectedSize)}
            disabled={isGenerating}
            className={`px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-sm ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isGenerating ? 'Génération en cours...' : `Générer le jeu de données (${presets.find(p => p.id === selectedSize)?.title})`}
          </button>
        </div>

        {/* Worker Output Log */}
        {isGenerating && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xxs font-bold text-gray-400 uppercase tracking-wider">
              <span>Console de Simulation d'Élevage</span>
              <span className="text-indigo-500 animate-pulse">Running Background Seeder</span>
            </div>
            <div className="space-y-1 text-xxs font-mono text-indigo-600 dark:text-indigo-400 leading-relaxed">
              {generationSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{step}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-gray-400 animate-pulse">
                <span>&gt;</span>
                <span>Calcul des indicateurs génétiques en cours de finalisation...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Stats Summary */}
      {isActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Statistiques Courantes du Sandbox</h4>
            <span className="px-2 py-0.5 rounded-full text-xxs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Active Session
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Oiseaux simulés', val: stats.canaris, color: 'text-indigo-600 dark:text-indigo-400', icon: Server },
              { label: 'Cages & Volières', val: stats.cages, color: 'text-emerald-600 dark:text-emerald-400', icon: Activity },
              { label: 'Couples reproducteurs', val: stats.couples, color: 'text-pink-600 dark:text-pink-400', icon: Award },
              { label: 'Oisillons & Jeunes', val: stats.jeunes, color: 'text-cyan-600 dark:text-cyan-400', icon: Calendar },
              { label: 'Dépenses enregistrées', val: stats.depenses + ' €', color: 'text-rose-600 dark:text-rose-400', icon: Info },
              { label: 'Ventes effectuées', val: stats.ventes + ' €', color: 'text-teal-600 dark:text-teal-400', icon: Info }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                    <Icon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                  <span className={`text-2xl font-extrabold font-mono ${item.color}`}>{item.val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Block */}
      {isActive && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Réinitialisation des données</h4>
            <p className="text-xxs text-gray-400">Restaurez l'état initial simulé si vous avez apporté des modifications locales au cours de vos tests.</p>
          </div>
          
          <button
            onClick={handleResetDemo}
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-rose-500 inline-flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" /> Réinitialiser le bac à sable
          </button>
        </div>
      )}

    </div>
  );
};

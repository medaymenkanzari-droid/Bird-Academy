/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — VISUAL DISCOVERY SECTION
 * Modern visual walkthrough: Ce qu'est Bird Academy → À qui il s'adresse → Ce qu'il permet de faire → Où le télécharger
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { 
  Users, Award, Building2, LayoutDashboard, Bird, Egg, Bot, 
  Download, ArrowRight, ArrowLeft, ShieldCheck, Check, Sparkles, Monitor, Smartphone
} from 'lucide-react';

export interface VisualDiscoverySectionProps {
  onNavigate: (route: WebRoute) => void;
}

export const VisualDiscoverySection: React.FC<VisualDiscoverySectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'bird' | 'breeding'>('dashboard');

  const screenshots = {
    dashboard: {
      title: "Tableau de Bord de Volière",
      subtitle: "Vision synthétique de l'effectif, alertes sanitaires et indicateurs de fertilité.",
      image: "./assets/images/app-previews/dashboard-preview.png",
      tag: "Pilotage en Temps Réel",
      badges: ["Effectif par espèce", "Alertes couvées", "Statistiques locales"]
    },
    bird: {
      title: "Fiche Oiseau & Pédigrée Individuel",
      subtitle: "Bague officielle, phénotype, ascendance généalogique et caractéristiques morphologiques.",
      image: "./assets/images/app-previews/bird-detail-preview.png",
      tag: "Traçabilité & Standard",
      badges: ["Identification bague", "Arbre généalogique", "Morphologie & Loci"]
    },
    breeding: {
      title: "Suivi de Reproduction & Baguage",
      subtitle: "Gestion des cycles de ponte, mirage des œufs, dates d'éclosion et baguage des jeunes.",
      image: "./assets/images/app-previews/breeding-preview.png",
      tag: "Cycle de Reproduction",
      badges: ["Couvées & Nids", "Calcul de Wright", "Alertes baguage"]
    }
  };

  const currentShot = screenshots[activeTab];

  return (
    <section 
      className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="visual-discovery-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 1. Header: Ce qu'est Bird Academy en résumé visuel */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-[#ffc107]" />
            <span>Découverte Visuelle Rapide</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprendre Bird Academy en un coup d'œil
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
            La solution logicielle complète pour gérer votre élevage, maîtriser vos lignées génétiques et suivre vos oiseaux en toute souveraineté, 100% hors-ligne.
          </p>
        </div>

        {/* 2. À qui s'adresse Bird Academy (3 profils visuels) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Users className="w-5 h-5 text-[#2e3a8c] dark:text-indigo-400" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              À qui s'adresse Bird Academy ?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Profil 1: Éleveurs Amateurs & Passionnés */}
            <div className="p-6 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center">
                  <Bird className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Éleveurs Passionnés
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pour les amateurs désireux de quitter le carnet papier : fiches de bagues, dates d'éclosion et suivi sanitaire simplifié.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-[#2e3a8c] dark:text-indigo-400">
                <span>Canaris & Exotiques</span>
                <span className="font-mono bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">Édition FREE & Passion</span>
              </div>
            </div>

            {/* Profil 2: Compétiteurs & Sélectionneurs */}
            <div className="p-6 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/60 border-2 border-[#2e3a8c] dark:border-indigo-600 shadow-md flex flex-col justify-between space-y-4 relative">
              <div className="absolute -top-3 right-6 bg-[#2e3a8c] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Sélection COM
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#ffc107]" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Compétiteurs & Clubs
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Calculateur de consanguinité de Wright, standard morphologique officiel et simulation des accouplements de concours.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-amber-400">
                <span>Génétique & Posture</span>
                <span className="font-mono bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">Édition Pro</span>
              </div>
            </div>

            {/* Profil 3: Élevages Professionnels & Parcs */}
            <div className="p-6 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Grands Élevages & Volières
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gestion multi-volières, historique sanitaire par lot, comptabilité intégrée et passeports biologiques certifiés.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                <span>Volume & Sécurité</span>
                <span className="font-mono bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">Mono-appareil 100% local</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Ce qu'il permet de faire : Vitrine visuelle des captures réelles */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#2e3a8c] dark:text-indigo-400" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Ce qu'il permet de faire (Captures Réelles)
              </h3>
            </div>

            {/* Interactive Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start sm:self-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-900 text-[#2e3a8c] dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1. Tableau de bord
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bird')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'bird'
                    ? 'bg-white dark:bg-slate-900 text-[#2e3a8c] dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                2. Fiche oiseau
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('breeding')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'breeding'
                    ? 'bg-white dark:bg-slate-900 text-[#2e3a8c] dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                3. Reproduction
              </button>
            </div>
          </div>

          {/* Screenshot Showcase Card */}
          <div className="rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-5 p-6 sm:p-10 space-y-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 uppercase tracking-wider">
                  {currentShot.tag}
                </span>
                <h4 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentShot.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentShot.subtitle}
                </p>

                <div className="space-y-2 pt-2">
                  {currentShot.badges.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigate('download')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Découvrir dans l'application</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Image */}
              <div className="lg:col-span-7 bg-slate-900 p-4 sm:p-6 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-800">
                <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl max-h-[440px] w-full flex items-center justify-center bg-black">
                  <img
                    src={currentShot.image}
                    alt={currentShot.title}
                    className="w-full h-auto object-contain max-h-[420px]"
                    loading="lazy"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4. Où télécharger : Passerelle directe */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#2e3a8c] to-[#1e265c] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-start">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffc107]">
              Distribution Officielle V2.0.0-RC1
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Où télécharger l'application Bird Academy ?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              Téléchargez directement l'installateur Windows 64-bit, la version portable sans installation, ou l'APK de test pour Android.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onNavigate('download')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-[#2e3a8c] hover:bg-slate-100 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              data-testid="discovery-cta-download"
            >
              <Download className="w-4 h-4 text-[#ffc107]" />
              <span>Accéder aux Téléchargements</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

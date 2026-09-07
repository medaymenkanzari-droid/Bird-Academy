/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smartphone, Eye, CheckCircle2, Award, FileText, 
  Settings, RefreshCw, AlertCircle, Sparkles, Laptop, Globe, ShieldCheck
} from 'lucide-react';

export const StoreDeploymentTab: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'pwa' | 'desktop'>('android');

  // Core SPRINT 24 store checklists
  const checklists = {
    android: [
      'Génération du fichier AAB (Android App Bundle)',
      'Signature avec la clé de production Google Play Console',
      'Intégration des icônes adaptatives vectorielles',
      'Splash Screen natif Android 12+',
      'Vérification de la compatibilité API level 34+'
    ],
    ios: [
      'Création du bundle d\'application iOS (.ipa)',
      'Provisioning profile de distribution App Store',
      'Splash screen Storyboard unifié Apple',
      'Optimisation des icônes iPad et iPhone retina',
      'Validation du cryptage de transport HTTPS (ATS)'
    ],
    pwa: [
      'Service Worker avec stratégie Network-First cache',
      'Web App Manifest validé (PWA Criteria met)',
      'Offline fallback page d\'élevage fonctionnelle',
      'Prise en charge de l\'installation bureau et mobile',
      'Enregistrement de la signature SHA-256 locale'
    ],
    desktop: [
      'Package Electron / Tauri pour Windows et MacOS',
      'Signature de code pour contourner SmartScreen/Gatekeeper',
      'Gestionnaire d\'installation autonome local',
      'Raccourcis clavier d\'application unifiés',
      'Vérification d\'accès fichiers pour sauvegardes cryptées'
    ]
  };

  return (
    <div className="space-y-6" id="store-deployment-panel">
      {/* 1. Header Hero Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-750 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-indigo-100/30">
                SPRINT 24
              </span>
              <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                STORES PREPARED 100%
              </span>
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
              <Smartphone className="text-indigo-500 w-5 h-5 shrink-0" />
              Store Deployment Center
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Fiches de publication pour Google Play Store, Apple App Store, et configuration d'application web progressive (PWA).
            </p>
          </div>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 overflow-x-auto">
        {[
          { id: 'android', label: 'Android Checklist', icon: Smartphone },
          { id: 'ios', label: 'iOS Checklist', icon: Smartphone },
          { id: 'pwa', label: 'PWA Checklist', icon: Globe },
          { id: 'desktop', label: 'Desktop Checklist', icon: Laptop },
        ].map((platform) => {
          const Icon = platform.icon;
          const isActive = activePlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xxs font-black uppercase tracking-wider rounded-xl transition shrink-0 cursor-pointer ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-gray-300'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {platform.label}
            </button>
          );
        })}
      </div>

      {/* Checklist Grid & Metadata Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Checklist */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
          <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Contrôles de distribution d'application</span>
          
          <div className="space-y-2.5 text-xs">
            {checklists[activePlatform].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 border border-gray-100/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-bold text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          {/* Privacy & GDPR checklist */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <span className="block text-[9px] font-black uppercase text-rose-500 tracking-wider">Privacy & GDPR Checklist</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Politique RGPD à jour</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Consentement de Cookie</span>
              </div>
            </div>
          </div>
        </div>

        {/* Store Metadata (Auto-generated Descriptions & Keywords) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
          <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Métadonnées de publication générées</span>
          
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <span className="block text-[9px] font-black uppercase text-indigo-500 leading-none">Description courte (Short Description)</span>
              <p className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-gray-100/30 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Bird Academy Enterprise - Gestion professionnelle d'élevage de canaris de posture et couleur. Calculateur génétique Wright et Mendélien.
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] font-black uppercase text-indigo-500 leading-none">Description longue (Long Description)</span>
              <p className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-gray-100/30 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 max-h-[100px] overflow-y-auto">
                L'application professionnelle de référence pour tous les éleveurs de canaris exigeants. Gérez rigoureusement votre cheptel, planifiez de façon optimale vos couples reproducteurs, et évitez tout risque de consanguinité grâce au moteur de calcul de coefficient de Wright exclusif. L'intégrité de vos données d'élevage est assurée par un chiffrement local inviolable.
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] font-black uppercase text-indigo-500 leading-none">Mots-clés (Keywords)</span>
              <p className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-gray-100/30 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                élevage, canaris, génétique, consanguinité, Wright, accouplement, bague, pedigree, oiseaux
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

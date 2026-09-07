/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — SECURITY ARCHITECTURE SECTION (AVIAN PRECISION)
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { HardDrive, Lock, CloudOff, ShieldCheck } from 'lucide-react';

export const SecurityArchitectureSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  return (
    <section 
      id="security"
      className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="security-architecture-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-[#f0f3fa] dark:bg-indigo-950 px-3.5 py-1 rounded-full">
            Architecture & Souveraineté
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sécurité & Technologie : Votre Élevage en Toute Souveraineté
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Une architecture 100% hors-ligne qui garantit la confidentialité absolue de votre savoir-faire sans aucune dépendance au cloud.
          </p>
        </div>

        {/* 3 Columns Security Grid (Avian Precision Specification) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 1. 100% Offline */}
          <div className="p-8 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e0e7f7] dark:bg-indigo-950/60 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center">
              <HardDrive className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">100% Hors-Ligne</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Base de données SQLite locale scellée sur votre disque dur. Aucune connexion Internet requise pour le suivi quotidien.
            </p>
          </div>

          {/* 2. Chiffrement Local */}
          <div className="p-8 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chiffrement Local & LMSE</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Validation cryptographique modulaire par signatures numériques ECDSA. Intégrité logicielle inviolable.
            </p>
          </div>

          {/* 3. Indépendance Cloud */}
          <div className="p-8 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center">
              <CloudOff className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Indépendance Cloud Totale</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Zéro télémétrie, zéro serveur tiers. Votre patrimoine avicole et vos fiches généalogiques vous appartiennent exclusivement.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

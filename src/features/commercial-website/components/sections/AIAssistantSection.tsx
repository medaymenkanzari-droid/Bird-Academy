/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — AI ASSISTANT SECTION
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { Sparkles, MessageSquare, Shield, Lock, Bot } from 'lucide-react';

export const AIAssistantSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  return (
    <section 
      className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="ai-assistant-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Chat Simulator Preview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 order-2 lg:order-1">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Assistant IA Bird Academy</span>
                  <span className="text-[10px] text-emerald-500 font-medium">● Raisonnement 100% Local</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                Quota: 100/100
              </span>
            </div>

            {/* Chat Bubble 1 (User) */}
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs max-w-sm space-y-1">
                <p>Quel est le risque de consanguinité si j'accouple le mâle bague 2024-042 avec la femelle 2025-118 ?</p>
                <span className="text-[9px] text-indigo-200 block text-right">14:32</span>
              </div>
            </div>

            {/* Chat Bubble 2 (Assistant) */}
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 p-3.5 rounded-2xl rounded-tl-none text-xs max-w-md space-y-2">
                <p>
                  Selon l'analyse de l'arbre généalogique local, ces deux sujets partagent un grand-père commun (Bague 2021-003).
                </p>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium text-[11px]">
                  📊 Coefficient de Wright calculé : <strong>F = 6.25%</strong> (Risque Modéré). L'accouplement est viable avec surveillance.
                </div>
                <span className="text-[9px] text-slate-400 block">14:32 — Traité localement en 120ms</span>
              </div>
            </div>

          </div>

          {/* Right: Explanatory Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              Assistant Conversationnel Expert
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Un expert en ornithologie disponible 24h/24 dans votre volière
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              L'Assistant IA de Bird Academy analyse instantanément vos fiches d'élevage locales sans jamais envoyer une seule donnée personnelle sur des serveurs tiers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Confidentialité Absolue</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Aucune donnée n'est utilisée pour entraîner des modèles publics.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Conseils Contextualisés</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Réponses adaptées aux espèces, mutations et cycles réels de votre volière.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

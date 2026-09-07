/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, ShieldCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const AssistantUnavailableState: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div 
      data-testid="assistant-unavailable-state"
      className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 my-3 text-xs leading-relaxed"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
            {t('assistantUnavailableNotice') || "Le moteur IA local n'est pas disponible sur cet appareil."}
          </h4>
          <p className="text-amber-800/90 dark:text-amber-300/80">
            {t('assistantUnavailableExplanation') || 
              "L'application fonctionne à 100% hors-ligne. Le référentiel biologique certifié et les outils de calculs restent pleinement opérationnels pour répondre à vos questions."}
          </p>

          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Référentiel biologique certifié</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>100% Hors-ligne</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

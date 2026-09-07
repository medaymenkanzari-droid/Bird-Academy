/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AssistantTier } from '../types/permissions';

export interface AssistantUpgradePromptProps {
  currentTier: AssistantTier;
  recommendedTier?: AssistantTier;
  onUpgrade: (targetTier: AssistantTier) => void;
  onClose?: () => void;
}

export const AssistantUpgradePrompt: React.FC<AssistantUpgradePromptProps> = ({
  currentTier,
  recommendedTier = 'PRO',
  onUpgrade,
  onClose
}) => {
  const { t, isRtl } = useLanguage();

  const isFree = currentTier === 'FREE';

  return (
    <div 
      data-testid="assistant-upgrade-prompt"
      className="my-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/90 to-purple-900/90 text-white border border-purple-500/30 shadow-lg relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{t('assistantUpgradeTitle') || 'Fonctionnalité réservée'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 font-mono">
                {recommendedTier}
              </span>
            </h4>
            <p className="text-xs text-purple-200/90 mt-1 leading-relaxed">
              {isFree 
                ? (t('assistantUpgradePromptFree') || "L'accès aux données de votre élevage nécessite le plan PREMIUM ou PRO.")
                : (t('assistantUpgradePromptPremium') || "L'explication Bird Intelligence et les rapports avancés sont réservés au plan PRO.")
              }
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                data-testid="assistant-upgrade-action-btn"
                onClick={() => onUpgrade(recommendedTier)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('assistantUpgradeButton') || 'Passer à'} {recommendedTier}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/40 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

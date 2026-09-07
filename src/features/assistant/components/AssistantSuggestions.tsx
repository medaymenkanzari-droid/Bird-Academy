/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lightbulb, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AssistantTier } from '../types/permissions';

export interface AssistantSuggestionsProps {
  tier: AssistantTier;
  onSelectSuggestion: (query: string) => void;
  disabled?: boolean;
}

export const AssistantSuggestions: React.FC<AssistantSuggestionsProps> = ({
  tier,
  onSelectSuggestion,
  disabled = false
}) => {
  const { t } = useLanguage();

  const getSuggestionsForTier = (currentTier: AssistantTier): { key: string; text: string }[] => {
    const freeList = [
      { key: 'sug_incubation_canary', text: t('sug_incubation_canary') || "Quelle est la durée d'incubation du canari ?" },
      { key: 'sug_weight_canary', text: t('sug_weight_canary') || "Quel est le poids normal d'un canari ?" },
      { key: 'sug_incubation_goldfinch', text: t('sug_incubation_goldfinch') || "Quelle est la durée d'incubation du chardonneret ?" },
      { key: 'sug_nest_prep', text: t('sug_nest_prep') || "Comment préparer un nid ?" },
    ];

    const premiumList = [
      ...freeList,
      { key: 'sug_breeding_cycle', text: t('sug_breeding_cycle') || "Analyse mon dernier cycle de reproduction" },
      { key: 'sug_bird_status', text: t('sug_bird_status') || "Quel est l'état de cet oiseau ?" },
    ];

    const proList = [
      ...premiumList,
      { key: 'sug_bird_intelligence', text: t('sug_bird_intelligence') || "Analyse les alertes Bird Intelligence" },
      { key: 'sug_genealogy', text: t('sug_genealogy') || "Analyse la généalogie de cet oiseau" },
      { key: 'sug_monthly_summary', text: t('sug_monthly_summary') || "Prépare une synthèse mensuelle" },
    ];

    switch (currentTier) {
      case 'PRO': return proList;
      case 'PREMIUM': return premiumList;
      case 'FREE':
      default:
        return freeList;
    }
  };

  const suggestions = getSuggestionsForTier(tier);

  return (
    <div data-testid="assistant-suggestions" className="my-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 px-1">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span>{t('assistantSuggestionsTitle') || 'Suggestions contextuelles'}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            data-testid={`suggestion-chip-${item.key}`}
            disabled={disabled}
            onClick={() => onSelectSuggestion(item.text)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <span className="line-clamp-1">{item.text}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

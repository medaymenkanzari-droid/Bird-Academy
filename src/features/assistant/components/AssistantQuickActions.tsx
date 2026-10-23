/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Minimize2, FileText, RefreshCw, HelpCircle, AlertCircle, ListFilter } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AssistantActionType } from '../types/assistant';
import { AssistantTier } from '../types/permissions';

export interface AssistantQuickActionsProps {
  onSelectAction: (action: AssistantActionType, promptText?: string) => void;
  disabled?: boolean;
  tier?: AssistantTier;
}

export const AssistantQuickActions: React.FC<AssistantQuickActionsProps> = ({
  onSelectAction,
  disabled = false,
  tier
}) => {
  const { t } = useLanguage();

  const actions: Array<{
    type: AssistantActionType;
    key: string;
    label: string;
    icon: React.ReactNode;
    promptTemplate: string;
    requiredTier?: AssistantTier;
  }> = [
    {
      type: 'SIMPLIFY',
      key: 'simplify',
      label: t('actionSimplify') || 'Simplifier ce texte',
      icon: <Minimize2 className="w-3.5 h-3.5 text-blue-500" />,
      promptTemplate: "Simplifier ce texte : "
    },
    {
      type: 'SUMMARIZE',
      key: 'summarize',
      label: t('actionSummarize') || 'Résumer',
      icon: <FileText className="w-3.5 h-3.5 text-emerald-500" />,
      promptTemplate: "Résumer ce texte : "
    },
    {
      type: 'REPHRASE',
      key: 'rephrase',
      label: t('actionRephrase') || 'Reformuler',
      icon: <RefreshCw className="w-3.5 h-3.5 text-purple-500" />,
      promptTemplate: "Reformuler ce texte : "
    },
    {
      type: 'EXPLAIN',
      key: 'explain',
      label: t('actionExplain') || 'Expliquer',
      icon: <HelpCircle className="w-3.5 h-3.5 text-amber-500" />,
      promptTemplate: "Expliquer : "
    },
    {
      type: 'EXPLAIN_STATUS',
      key: 'status',
      label: t('actionExplainStatus') || 'Que signifie ce statut ?',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
      promptTemplate: "Que signifie le statut UNKNOWN ?",
      requiredTier: 'PREMIUM'
    },
    {
      type: 'STRUCTURE_NOTE',
      key: 'structure-note',
      label: t('actionStructureNote') || 'Structurer la note',
      icon: <ListFilter className="w-3.5 h-3.5 text-teal-500" />,
      promptTemplate: "Structurer la note : "
    }
  ];

  return (
    <div data-testid="assistant-quick-actions" className="my-2">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {actions.map((act) => {
          const isRestrictedForFree = tier === 'FREE' && act.requiredTier === 'PREMIUM';
          return (
            <button
              key={act.key}
              type="button"
              data-testid={`assistant-quick-action-${act.type}`}
              data-action-key={act.key}
              disabled={disabled}
              onClick={() => onSelectAction(act.type, act.promptTemplate)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all shadow-2xs active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {act.icon}
              <span>{act.label}</span>
              {isRestrictedForFree && (
                <span 
                  data-testid={`quick-action-badge-${act.type}`}
                  className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 uppercase tracking-tight"
                >
                  PREMIUM
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Sparkles, BookOpen, Shield, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AssistantMessage, ChatMessageItem } from './AssistantMessage';
import { AssistantUnavailableState } from './AssistantUnavailableState';
import { AssistantSuggestions } from './AssistantSuggestions';
import { AssistantTier } from '../types/permissions';
import { AssistantEngineStatus } from '../types/assistant';

export interface AssistantConversationProps {
  messages: ChatMessageItem[];
  tier: AssistantTier;
  engineStatus: AssistantEngineStatus;
  onSelectSuggestion: (query: string) => void;
  isLoading: boolean;
}

export const AssistantConversation: React.FC<AssistantConversationProps> = ({
  messages,
  tier,
  engineStatus,
  onSelectSuggestion,
  isLoading
}) => {
  const { t } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div 
      data-testid="assistant-conversation"
      className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2 scrollbar-thin"
    >
      {/* Engine Status Banner if unavailable */}
      {engineStatus === 'UNAVAILABLE' && (
        <AssistantUnavailableState />
      )}

      {/* Empty State */}
      {messages.length === 0 ? (
        <div 
          data-testid="assistant-empty-state"
          className="flex flex-col items-center justify-center text-center p-6 sm:p-10 my-4 max-w-xl mx-auto"
        >
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {t('assistantEmptyStateTitle') || 'Comment puis-je vous aider aujourd\'hui ?'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            {t('assistantEmptyStateSubtitle') || 
              'Interrogez le référentiel biologique certifié, examinez les paramètres de reproduction ou analysez vos données d\'élevage en toute confidentialité.'}
          </p>

          {/* Contextual Suggestions in Empty State */}
          <div className="w-full text-left">
            <AssistantSuggestions 
              tier={tier} 
              onSelectSuggestion={onSelectSuggestion} 
              disabled={isLoading}
            />
          </div>
        </div>
      ) : (
        /* Messages List */
        <div className="space-y-2">
          {messages.map((msg) => (
            <AssistantMessage key={msg.id} message={msg} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div 
              data-testid="assistant-loading-indicator"
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
              <span>{t('assistantSending') || 'Traitement local en cours...'}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

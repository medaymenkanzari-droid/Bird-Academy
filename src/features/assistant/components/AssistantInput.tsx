/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface AssistantInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isQuotaExceeded: boolean;
  disabled?: boolean;
}

export const AssistantInput: React.FC<AssistantInputProps> = ({
  onSendMessage,
  isLoading,
  isQuotaExceeded,
  disabled = false
}) => {
  const { t, isRtl } = useLanguage();
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading || isQuotaExceeded || disabled) return;

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const canSubmit = inputText.trim().length > 0 && !isLoading && !isQuotaExceeded && !disabled;

  return (
    <form 
      data-testid="assistant-input-form"
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all"
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          data-testid="assistant-query-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isQuotaExceeded}
          placeholder={
            isQuotaExceeded 
              ? (t('assistantQuotaReachedTitle') || 'Quota journalier atteint')
              : (t('assistantInputPlaceholder') || "Posez votre question...")
          }
          className="flex-1 max-h-32 min-h-[38px] bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none resize-none px-2 py-1.5 leading-relaxed"
          aria-label={t('assistantInputPlaceholder') || 'Message input'}
        />

        <button
          type="submit"
          data-testid="assistant-send-btn"
          disabled={!canSubmit}
          className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
            canSubmit
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 active:scale-95'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
          aria-label={t('assistantSend') || 'Envoyer'}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">{t('assistantSending') || 'Traitement...'}</span>
            </>
          ) : (
            <>
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              <span className="hidden sm:inline">{t('assistantSend') || 'Envoyer'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — ASSISTANT VIEW (MAIN PRO/PREMIUM/FREE CONTAINER)
 * 100% Offline AI Assistant interface with certified biological registry lookup,
 * commercial tier permission gating, daily quota tracking, and multi-language RTL support.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useLicensing } from '../../licensing/hooks/useLicensing';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import { AssistantHeader } from './AssistantHeader';
import { AssistantConversation } from './AssistantConversation';
import { AssistantInput } from './AssistantInput';
import { AssistantSuggestions } from './AssistantSuggestions';
import { AssistantUpgradePrompt } from './AssistantUpgradePrompt';
import { ChatMessageItem } from './AssistantMessage';
import { AssistantService } from '../services/AssistantService';
import { AssistantTier } from '../types/permissions';
import { QuotaManager, QuotaUsageInfo } from '../services/QuotaManager';
import { AssistantEngineStatus } from '../types/assistant';

const HISTORY_STORAGE_KEY = 'bird_academy_assistant_history';

export const AssistantView: React.FC = () => {
  const { language, t, isRtl } = useLanguage();
  const { currentTier, setTierOverride } = useSubscription();
  const assistantService = AssistantService.getInstance();

  const [engineStatus, setEngineStatus] = useState<AssistantEngineStatus>(() => assistantService.getStatus());
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsageInfo>(() => QuotaManager.getUsage(currentTier));
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      // Fallback
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState<boolean>(false);
  const [recommendedTier, setRecommendedTier] = useState<AssistantTier>('PRO');

  // Sync quota usage when tier or messages change
  const refreshQuota = useCallback(() => {
    setQuotaUsage(QuotaManager.getUsage(currentTier));
  }, [currentTier]);

  useEffect(() => {
    refreshQuota();
    setEngineStatus(assistantService.getStatus());
  }, [currentTier, refreshQuota, assistantService]);

  // Persist conversation history
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      // Safe fallback
    }
  }, [messages]);

  const handleTierChange = (newTier: AssistantTier) => {
    setTierOverride(newTier);
  };

  const handleClearChat = () => {
    const confirmText = t('assistantClearConfirm') || 'Voulez-vous effacer l\'historique de cette conversation ?';
    if (window.confirm ? window.confirm(confirmText) : true) {
      setMessages([]);
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch (e) {
        // Ignore
      }
      setShowUpgradePrompt(false);
    }
  };

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await assistantService.ask({
        query: queryText,
        language,
        tier: currentTier
      });

      const assistantMessage: ChatMessageItem = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: response.generatedAt || new Date().toISOString(),
        responseMetadata: response
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if permission denied was returned
      if (response.warnings.includes('PERMISSION_DENIED')) {
        setShowUpgradePrompt(true);
        const reqTier = currentTier === 'FREE' ? 'PREMIUM' : 'PRO';
        setRecommendedTier(reqTier);
      } else if (response.warnings.includes('QUOTA_EXCEEDED')) {
        setShowUpgradePrompt(true);
        setRecommendedTier('PRO');
      } else {
        setShowUpgradePrompt(false);
      }

    } catch (err: any) {
      const errorMessage: ChatMessageItem = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "Une erreur locale inattendue est survenue lors du traitement.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      refreshQuota();
    }
  };

  const handleUpgrade = (targetTier: AssistantTier) => {
    handleTierChange(targetTier);
    setShowUpgradePrompt(false);
  };

  return (
    <div 
      data-testid="assistant-view"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] max-w-5xl mx-auto w-full p-2 sm:p-4 overflow-hidden"
    >
      {/* Header */}
      <AssistantHeader
        tier={currentTier}
        onTierChange={handleTierChange}
        engineStatus={engineStatus}
        quotaUsage={quotaUsage}
        onClearChat={handleClearChat}
        hasMessages={messages.length > 0}
      />

      {/* Upgrade Banner if permission was rejected */}
      {showUpgradePrompt && (
        <AssistantUpgradePrompt
          currentTier={currentTier}
          recommendedTier={recommendedTier}
          onUpgrade={handleUpgrade}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}

      {/* Conversation Thread */}
      <AssistantConversation
        messages={messages}
        tier={currentTier}
        engineStatus={engineStatus}
        onSelectSuggestion={handleSendMessage}
        isLoading={isLoading}
      />

      {/* Suggestions Row (shown when conversation already has messages) */}
      {messages.length > 0 && (
        <AssistantSuggestions
          tier={currentTier}
          onSelectSuggestion={handleSendMessage}
          disabled={isLoading}
        />
      )}

      {/* Input Form */}
      <div className="pt-2 shrink-0">
        <AssistantInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isQuotaExceeded={quotaUsage.isExceeded}
        />
      </div>
    </div>
  );
};

export default AssistantView;

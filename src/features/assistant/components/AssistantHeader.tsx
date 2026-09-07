/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Shield, Cpu, Zap, RotateCcw, Award } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AssistantTier } from '../types/permissions';
import { AssistantEngineStatus } from '../types/assistant';
import { QuotaUsageInfo } from '../services/QuotaManager';

export interface AssistantHeaderProps {
  tier: AssistantTier;
  onTierChange: (newTier: AssistantTier) => void;
  engineStatus: AssistantEngineStatus;
  quotaUsage: QuotaUsageInfo;
  onClearChat: () => void;
  hasMessages: boolean;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  tier,
  onTierChange,
  engineStatus,
  quotaUsage,
  onClearChat,
  hasMessages
}) => {
  const { t, isRtl } = useLanguage();

  const getTierBadgeStyle = (tVal: AssistantTier) => {
    switch (tVal) {
      case 'PRO':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20 border-purple-400/30';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm shadow-blue-500/20 border-blue-400/30';
      case 'FREE':
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600';
    }
  };

  const getTierLabel = (tVal: AssistantTier) => {
    switch (tVal) {
      case 'PRO': return t('assistantTierPro') || 'Plan PRO';
      case 'PREMIUM': return t('assistantTierPremium') || 'Plan PREMIUM';
      case 'FREE': return t('assistantTierFree') || 'Plan GRATUIT';
    }
  };

  return (
    <div 
      data-testid="assistant-header"
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      {/* Title & Description */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {t('assistantTitle') || 'Assistant IA Bird Academy'}
            </h1>
            <span 
              data-testid="assistant-tier-badge"
              className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${getTierBadgeStyle(tier)}`}
            >
              {getTierLabel(tier)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {t('assistantSub') || "Assistant d'élevage 100% hors-ligne & expert aviaire"}
          </p>
        </div>
      </div>

      {/* Badges, Quota & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto justify-start md:justify-end">
        {/* Engine Status Badge */}
        <div 
          data-testid="assistant-engine-status-badge"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300"
          title={engineStatus === 'AVAILABLE' ? t('assistantEngineAvailable') : t('assistantUnavailableNotice')}
        >
          <Cpu className={`w-3.5 h-3.5 ${engineStatus === 'AVAILABLE' ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="truncate max-w-[120px] sm:max-w-none">
            {engineStatus === 'AVAILABLE' ? t('assistantEngineAvailable') : t('assistantEngineUnavailable')}
          </span>
        </div>

        {/* Quota Badge */}
        <div 
          data-testid="assistant-quota-badge"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {quotaUsage.limit === null 
              ? (t('assistantQuotaUnlimited') || 'Illimité') 
              : `${quotaUsage.remaining} / ${quotaUsage.limit}`}
          </span>
        </div>

        {/* Privacy Offline Badge */}
        <div 
          data-testid="assistant-privacy-badge"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
          title={t('assistantPrivacyDesc') || '100% Hors-ligne'}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>100% Offline</span>
        </div>

        {/* Plan Switcher for Live Testing / Demo */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
          {(['FREE', 'PREMIUM', 'PRO'] as AssistantTier[]).map((tOpt) => (
            <button
              key={tOpt}
              type="button"
              data-testid={`tier-switch-${tOpt.toLowerCase()}`}
              onClick={() => onTierChange(tOpt)}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                tier === tOpt 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tOpt}
            </button>
          ))}
        </div>

        {/* Clear Chat Button */}
        {hasMessages && (
          <button
            type="button"
            data-testid="assistant-clear-chat-btn"
            onClick={onClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title={t('assistantClearChat') || 'Effacer la discussion'}
            aria-label={t('assistantClearChat') || 'Effacer la discussion'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

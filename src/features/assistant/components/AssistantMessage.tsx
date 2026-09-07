/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Sparkles, AlertTriangle, ShieldAlert, CheckCircle2, Info, BookOpen, Database, BrainCircuit, Activity } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AssistantResponse, AssistantConfidence } from '../types/assistant';
import { KnowledgeSource } from '../types/knowledge';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  responseMetadata?: AssistantResponse;
}

export interface AssistantMessageProps {
  message: ChatMessageItem;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ message }) => {
  const { t, isRtl } = useLanguage();
  const isUser = message.sender === 'user';
  const meta = message.responseMetadata;

  const getSourceIcon = (source: KnowledgeSource) => {
    switch (source) {
      case 'BIOLOGICAL_SPECIES_REGISTRY': return <BookOpen className="w-3.5 h-3.5 text-blue-500" />;
      case 'BIRD_INTELLIGENCE': return <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />;
      case 'HEALTH_DATA': return <Activity className="w-3.5 h-3.5 text-rose-500" />;
      case 'USER_DATA':
      case 'BREEDING_DATA':
      case 'CALCULATED_DATA':
      default:
        return <Database className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getSourceLabel = (source: KnowledgeSource): string => {
    switch (source) {
      case 'BIOLOGICAL_SPECIES_REGISTRY': return t('assistantSourceRegistry') || 'Référentiel biologique';
      case 'BIRD_INTELLIGENCE': return t('assistantSourceIntelligence') || 'Bird Intelligence';
      case 'USER_DATA': return t('assistantSourceUserData') || 'Données élevage';
      case 'BREEDING_DATA': return t('assistantSourceBreeding') || 'Registre reproduction';
      case 'HEALTH_DATA': return t('assistantSourceHealth') || 'Dossier sanitaire';
      case 'CALCULATED_DATA': return t('assistantSourceCalculated') || 'Calcul déterministe';
      case 'AI_GENERATED_EXPLANATION': return t('assistantSourceAi') || 'Moteur IA Local';
      default: return source;
    }
  };

  const getConfidenceBadge = (confidence?: AssistantConfidence) => {
    if (!confidence) return null;
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            {t('assistantConfidenceHigh') || 'Certifiée'}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
            <Info className="w-3 h-3" />
            {t('assistantConfidenceMedium') || 'Calculée'}
          </span>
        );
      case 'LOW':
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Info className="w-3 h-3" />
            {t('assistantConfidenceUnknown') || 'Indicative'}
          </span>
        );
    }
  };

  return (
    <div
      data-testid={`assistant-message-${message.id}`}
      className={`flex items-start gap-3 my-3 w-full ${isUser ? (isRtl ? 'flex-row' : 'flex-row-reverse') : (isRtl ? 'flex-row-reverse' : 'flex-row')}`}
    >
      {/* Sender Avatar */}
      <div 
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? (isRtl ? 'items-start' : 'items-end') : (isRtl ? 'items-end' : 'items-start')}`}>
        <div
          data-testid={`message-bubble-${message.id}`}
          className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-xs'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
          }`}
        >
          {message.text}
        </div>

        {/* Assistant Metadata (Sources, Confidence, Warnings) */}
        {!isUser && meta && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2 px-1 text-[11px]">
            {/* Confidence Badge */}
            {getConfidenceBadge(meta.confidence)}

            {/* Sources Badges */}
            {meta.sources && meta.sources.map((src, idx) => (
              <span
                key={idx}
                data-testid={`source-badge-${src.toLowerCase()}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-medium"
              >
                {getSourceIcon(src)}
                <span>{getSourceLabel(src)}</span>
              </span>
            ))}

            {/* Warnings Badges */}
            {meta.warnings && meta.warnings.map((w, idx) => {
              if (w === 'AI_ENGINE_UNAVAILABLE') {
                return (
                  <span
                    key={idx}
                    data-testid="warning-badge-ai-engine-unavailable"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-[10px] font-bold"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Mode Déterministe</span>
                  </span>
                );
              }
              if (w === 'PERMISSION_DENIED') {
                return (
                  <span
                    key={idx}
                    data-testid="warning-badge-permission-denied"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-[10px] font-bold"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Accès Restreint</span>
                  </span>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — ASSISTANT PASSPORT DRAWER
 * Interface d'assistance IA contextuelle dédiée au Bird Passport.
 * 
 * GARANTIES ÉPISTÉMIQUES :
 * 1. Zéro modification directe du Bird Passport.
 * 2. Contexte minimal transmis (locusId, statut, provenance, confidence, review).
 * 3. Respect absolu des statuts UNKNOWN, NOT_TESTED, PROVISIONAL, BLOCKED, POSSIBLE_SET.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Send, Loader2, ShieldCheck, HelpCircle, Dna, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Language } from '../../../utils/translations';
import { Canari } from '../../../types';
import { CanonicalLocusItem } from '../../../components/genetics/CanonicalGeneticsSummaryCard';
import { AssistantService } from '../services/AssistantService';
import { AssistantActionType, AssistantResponse } from '../types/assistant';
import { AssistantQuickActions } from './AssistantQuickActions';
import { SubscriptionTierResolver } from '../../subscription/services/SubscriptionTierResolver';

export interface AssistantPassportDrawerProps {
  open: boolean;
  onClose: () => void;
  bird?: Canari | null;
  locus?: CanonicalLocusItem | null;
  'data-testid'?: string;
}

interface DrawerMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  metadata?: AssistantResponse;
}

export const AssistantPassportDrawer: React.FC<AssistantPassportDrawerProps> = ({
  open,
  onClose,
  bird,
  locus,
  'data-testid': testId = 'assistant-passport-drawer'
}) => {
  let t = (k: string) => k;
  let language: Language = 'fr';
  let isRtl = false;
  try {
    const langCtx = useLanguage();
    t = langCtx.t;
    language = langCtx.language;
    isRtl = langCtx.isRtl;
  } catch {
    // Fallback for isolated SSR or test runs without LanguageProvider
  }
  const assistantService = AssistantService.getInstance();
  const currentTier = SubscriptionTierResolver.getCurrentTierSync();

  const [messages, setMessages] = useState<DrawerMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialisation ou explication contextuelle automatique à l'ouverture
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInputText('');
      return;
    }

    const initContextualExplanation = async () => {
      setIsLoading(true);
      try {
        if (locus) {
          const locusStatus = locus.epistemic?.status || locus.epistemicStatus || locus.status || locus.determination || 'UNKNOWN';
          const locusName = locus.displayName || locus.locus || locus.locusId || 'Locus';
          const res = await assistantService.explainEpistemicStatus(locusStatus, locusName, { language });
          setMessages([
            {
              id: `msg_init_${Date.now()}`,
              sender: 'assistant',
              text: res.answer,
              timestamp: res.generatedAt || new Date().toISOString(),
              metadata: res
            }
          ]);
        } else if (bird) {
          const loci = (bird.passport as { canonicalLoci?: CanonicalLocusItem[] } | undefined)?.canonicalLoci || [];
          const res = await assistantService.explainBirdPassport(
            {
              birdId: bird.id,
              birdNom: bird.nom,
              bague: bird.bague,
              espece: bird.espece,
              canonicalLociCount: loci.length
            },
            { language }
          );
          setMessages([
            {
              id: `msg_init_${Date.now()}`,
              sender: 'assistant',
              text: res.answer,
              timestamp: res.generatedAt || new Date().toISOString(),
              metadata: res
            }
          ]);
        } else {
          setMessages([
            {
              id: `msg_init_${Date.now()}`,
              sender: 'assistant',
              text: "Bonjour. Comment puis-je vous aider à comprendre les données du Bird Passport ?",
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (_err) {
        setMessages([
          {
            id: `msg_err_${Date.now()}`,
            sender: 'assistant',
            text: "L'assistant n'a pas pu charger l'explication contextuelle.",
            timestamp: new Date().toISOString()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initContextualExplanation();
  }, [open, locus, bird, language]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Échap pour fermer
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSendMessage = async (queryText?: string, actionType?: AssistantActionType) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: DrawerMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const locusStatus = locus?.epistemic?.status || locus?.epistemicStatus || locus?.status || locus?.determination;
      const res = await assistantService.ask({
        query: textToSend,
        action: actionType,
        targetText: textToSend,
        language,
        locusContext: locus ? {
          locusId: locus.locusId || locus.locus || 'locus',
          locusName: locus.displayName || locus.locus,
          epistemicStatus: locusStatus,
          provenance: locus.provenance || locus.epistemic?.provenance,
          confidence: typeof locus.confidence === 'number' ? locus.confidence : undefined,
          humanReviewRequired: locus.humanReviewRequired || locus.epistemic?.humanReviewRequired
        } : undefined
      });

      const asstMsg: DrawerMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        timestamp: res.generatedAt || new Date().toISOString(),
        metadata: res
      };
      setMessages(prev => [...prev, asstMsg]);
    } catch (_err) {
      const errMsg: DrawerMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "Une erreur est survenue lors du traitement.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuickAction = (action: AssistantActionType, template?: string) => {
    if (inputText.trim()) {
      handleSendMessage(`${template || ''}${inputText.trim()}`, action);
    } else if (locus) {
      const locusName = locus.displayName || locus.locus || 'locus';
      const locusStatus = locus.epistemic?.status || locus.epistemicStatus || locus.status || locus.determination || 'UNKNOWN';
      if (action === 'EXPLAIN_STATUS') {
        handleSendMessage(`Que signifie le statut ${locusStatus} pour ${locusName} ?`, 'EXPLAIN_STATUS');
      } else if (action === 'SIMPLIFY') {
        handleSendMessage(`Simplifier : statut ${locusStatus} sur le locus ${locusName}`, 'SIMPLIFY');
      } else if (action === 'SUMMARIZE') {
        handleSendMessage(`Résumer : statut ${locusStatus} sur le locus ${locusName}`, 'SUMMARIZE');
      } else if (action === 'REPHRASE') {
        handleSendMessage(`Reformuler : statut ${locusStatus} sur le locus ${locusName}`, 'REPHRASE');
      } else {
        handleSendMessage(`Expliquer : locus ${locusName} avec statut ${locusStatus}`, 'EXPLAIN');
      }
    } else {
      setInputText(template || '');
    }
  };

  const locusStatus = locus?.epistemic?.status || locus?.epistemicStatus || locus?.status || locus?.determination;

  const content = (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity"
      data-testid={testId}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slideLeft"
        role="dialog"
        aria-modal="true"
        aria-label={t('assistantPassportTitle') || 'Assistant IA — Bird Passport'}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('assistantPassportTitle') || 'Assistant IA — Bird Passport'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {locus?.displayName || locus?.locus || bird?.nom || bird?.bague || 'Assistance documentaire'}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="assistant-passport-drawer-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only guarantee banner */}
        <div 
          data-testid="assistant-passport-readonly-notice"
          className="px-4 py-2 bg-blue-50/80 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300 font-medium"
        >
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>{t('assistantEpistemicReadOnlyNotice') || "Mode consultation pure : l'assistant n'altère aucune donnée du Bird Passport."}</span>
        </div>

        {/* Locus context header badge if present */}
        {locus && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-blue-500" />
              <span>{locus.displayName || locus.locus || locus.locusId}</span>
            </span>
            <span 
              data-testid="assistant-passport-locus-status"
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 uppercase"
            >
              {locusStatus || 'UNKNOWN'}
            </span>
          </div>
        )}

        {/* Quick action chips */}
        <div className="px-4 pt-2 shrink-0">
          <AssistantQuickActions 
            tier={currentTier}
            onSelectAction={handleSelectQuickAction}
            disabled={isLoading}
          />
        </div>

        {/* Conversation list */}
        <div 
          data-testid="assistant-passport-messages"
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin"
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={m.id}
                data-testid={isUser ? 'passport-message-user' : 'assistant-message-assistant'}
                data-message-id={m.id}
              >
                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[88%] whitespace-pre-line shadow-2xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>

                {/* Metadata warnings if any */}
                {!isUser && m.metadata?.warnings && m.metadata.warnings.includes('PERMISSION_DENIED') && (
                  <div 
                    data-testid="assistant-passport-permission-denied"
                    className="mt-1 flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-bold"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Plan {m.metadata.warnings.find(w => w.startsWith('REQUIRED_'))?.replace('REQUIRED_', '') || 'PREMIUM'} requis</span>
                  </div>
                )}
                {!isUser && m.metadata?.warnings && m.metadata.warnings.includes('AI_ENGINE_UNAVAILABLE') && (
                  <div 
                    data-testid="assistant-passport-unavailable"
                    className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>IA indisponible</span>
                  </div>
                )}
                {!isUser && m.metadata?.status === 'ERROR' && (
                  <div 
                    data-testid="assistant-passport-error"
                    className="mt-1 flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Erreur contrôlée</span>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div 
              data-testid="assistant-passport-loading"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs w-fit animate-pulse"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              <span>Traitement local...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form 
            data-testid="assistant-passport-input-form"
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              data-testid="assistant-passport-query-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={t('assistantInputPlaceholder') || "Poser une question sur ce statut..."}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              data-testid="assistant-passport-send-btn"
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              aria-label="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }
  return content;
};

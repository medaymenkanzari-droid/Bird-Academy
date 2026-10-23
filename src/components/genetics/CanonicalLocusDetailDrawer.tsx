/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT CanonicalLocusDetailDrawer
 * Tiroir d'inspection détaillée, honnête et non-inférentielle d'un locus génétique canonique.
 * 
 * GARANTIES ÉPISTÉMIQUES & CONTRAT UX :
 * 1. Zéro modification ou validation de données (lecture seule pure).
 * 2. Zéro probabilité inventée : affichée uniquement si fournie dans la donnée.
 * 3. Zéro hypothèse choisie arbitrairement comme vérité en mode POSSIBLE_SET.
 * 4. Zéro carrier Z-linked inventé pour les femelles.
 * 5. Respect strict de isProvisional (sans aucun hardcoding sur BREAST).
 * 6. NOT_TESTED distinct de l'absence de mutation.
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Dna, Layers, AlertTriangle, ShieldAlert, HelpCircle, Clock, Info, BookOpen, Sparkles } from 'lucide-react';
import { AppAlert } from '../design-system/AppAlert';
import { BibliographicTraceabilityDrawer, resolveEvidenceForLocus } from './BibliographicTraceabilityDrawer';
import { AssistantPassportDrawer } from '../../features/assistant/components/AssistantPassportDrawer';
import type { Language } from '../../utils/translations';
import { CanonicalLocusBadge } from './CanonicalLocusBadge';
import { EpistemicStatusBadge, EpistemicStatusType } from './EpistemicStatusBadge';
import { EpistemicSourceBadge, EpistemicSourceType } from './EpistemicSourceBadge';
import { EpistemicConfidenceBadge, EpistemicConfidenceType } from './EpistemicConfidenceBadge';
import { HumanReviewBadge, HumanReviewStatusType } from './HumanReviewBadge';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';
import { LocusPedagogicalQuestionsCard } from './LocusPedagogicalQuestionsCard';
import type { CanonicalLocusItem } from './CanonicalGeneticsSummaryCard';

export interface CanonicalLocusDetailDrawerProps {
  locus: CanonicalLocusItem | null;
  open: boolean;
  onClose: () => void;
  language?: Language;
  'data-testid'?: string;
}

export function CanonicalLocusDetailDrawer({
  locus,
  open,
  onClose,
  language: explicitLanguage,
  'data-testid': testId,
}: CanonicalLocusDetailDrawerProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Résolution documentaire des preuves bibliographiques
  const evidenceRecords = resolveEvidenceForLocus(locus);
  const totalSourcesCount = evidenceRecords.reduce((acc, r) => acc + r.citations.length, 0);
  const conflictingSourcesCount = evidenceRecords.reduce(
    (acc, r) => acc + r.citations.filter(c => c.concordance === 'CONFLICTING').length,
    0
  );

  // Gestion du scroll du body et de la touche Échap
  useEffect(() => {
    if (!open) return;

    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isTraceabilityOpen) {
          // Si le drawer enfant de traçabilité est ouvert, il gère lui-même sa fermeture
          return;
        }
        onClose();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = '';
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [open, onClose, isTraceabilityOpen]);

  // Si fermé ou sans locus fourni, ne rien afficher
  if (!open || !locus) {
    return null;
  }

  const locusKey = locus.locusId || locus.locus || 'LOCUS';
  const locusTitle = locus.displayName || locusKey;

  const epistemicStatus: EpistemicStatusType =
    locus.epistemic?.status ||
    locus.status ||
    (locus.determination === 'CONFIRMED'
      ? 'GENETICALLY_CONFIRMED'
      : locus.determination === 'POSSIBLE_SET'
      ? 'POSSIBLE_SET'
      : (locus.determination as EpistemicStatusType) || 'UNKNOWN');

  const epistemicSource: EpistemicSourceType | undefined =
    (typeof locus.epistemic?.provenance === 'string'
      ? (locus.epistemic.provenance as EpistemicSourceType)
      : undefined) ||
    locus.source ||
    (locus.provenance as EpistemicSourceType);

  const epistemicConfidence: EpistemicConfidenceType | undefined =
    locus.epistemic?.confidence || locus.confidence;

  const requiresReview = Boolean(
    locus.epistemic?.humanReviewRequired ??
    locus.humanReviewRequired ??
    (locus.humanReview === 'REQUIRED' || locus.humanReview === 'REVIEW_REQUIRED')
  );

  const isConfirmed =
    locus.determination === 'CONFIRMED' || epistemicStatus === 'GENETICALLY_CONFIRMED';

  const isPossibleSet =
    locus.determination === 'POSSIBLE_SET' ||
    epistemicStatus === 'POSSIBLE_SET' ||
    Boolean(locus.possibleSet && locus.possibleSet.length > 0) ||
    Boolean(locus.hypotheses && locus.hypotheses.length > 0);

  const isConflict =
    epistemicStatus === 'CONFLICT_REVIEW' ||
    locus.determination === 'CONFLICT_REVIEW' ||
    (locus.epistemic as any)?.conflictDetected === true;

  // Hypothèses normalisées (sans jamais inventer de données)
  const hypothesesList: Array<{
    alleles: string[];
    probability?: number;
    rationale?: string;
  }> = [];

  if (locus.hypotheses && locus.hypotheses.length > 0) {
    locus.hypotheses.forEach((h: any) => {
      const alls = h.alleles
        ? h.alleles
        : h.genotype
        ? [h.genotype]
        : [];
      hypothesesList.push({
        alleles: alls,
        probability: typeof h.probability === 'number' ? h.probability : undefined,
        rationale: h.rationale,
      });
    });
  } else if (locus.possibleSet && locus.possibleSet.length > 0) {
    locus.possibleSet.forEach((set: any, idx: number) => {
      const weight = (locus as any).probabilityWeights?.[idx];
      hypothesesList.push({
        alleles: Array.isArray(set) ? set : [String(set)],
        probability: typeof weight === 'number' ? Math.round(weight * 100) : undefined,
        rationale: idx === 0 && locus.rationale ? locus.rationale : undefined,
      });
    });
  }

  // Libellé de transmission
  let transmissionLabel: string = locus.transmission || translateEpistemic(language, 'transmission.AUTOSOMAL');
  if (locus.transmission === 'Z_LINKED') {
    transmissionLabel = translateEpistemic(language, 'transmission.Z_LINKED');
  } else if (locus.transmission === 'AUTOSOMAL') {
    transmissionLabel = translateEpistemic(language, 'transmission.AUTOSOMAL');
  } else if (locus.transmission === 'CO_DOMINANT') {
    transmissionLabel = translateEpistemic(language, 'transmission.CO_DOMINANT');
  }

  // Libellé carrier state (sans jamais recalculer)
  let carrierLabel = translateEpistemic(language, 'drawer.not_applicable');
  if (locus.carrierState === 'CONFIRMED_CARRIER' || locus.isCarrier) {
    carrierLabel = translateEpistemic(language, 'carrier.CONFIRMED_CARRIER');
  } else if (locus.carrierState === 'POSSIBLE_CARRIER') {
    carrierLabel = translateEpistemic(language, 'carrier.POSSIBLE_CARRIER');
  } else if (locus.carrierState === 'NONE') {
    carrierLabel = translateEpistemic(language, 'drawer.carrier_none');
  } else if (locus.carrierState === 'NOT_APPLICABLE') {
    carrierLabel = translateEpistemic(language, 'drawer.not_applicable');
  }

  const drawerContent = (
    <div
      className={`fixed inset-0 z-[9999] flex ${isRtl ? 'justify-start' : 'justify-end'} overflow-hidden font-sans`}
      role="dialog"
      aria-modal="true"
      aria-label={locusTitle}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid={testId || 'canonical-locus-detail-drawer'}
      data-drawer-open="true"
      data-locus-id={locusKey}
    >
      {/* Overlay Backdrop sombre */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
        data-testid="drawer-backdrop"
      />

      {/* Panneau latéral du Drawer */}
      <aside
        className={`relative w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl z-10 border-slate-200 dark:border-slate-800 ${
          isRtl ? 'border-r' : 'border-l'
        } overflow-hidden`}
        data-testid="drawer-panel"
      >
        {/* EN-TÊTE DU DRAWER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Dna className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight" data-testid="drawer-title">
                {locusTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translateEpistemic(language, 'drawer.title')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label={translateEpistemic(language, 'drawer.close')}
            data-testid="drawer-close-button"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* CORPS SCROLLABLE DU DRAWER */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* BADGES RÉSUMÉS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-1.5" data-testid="drawer-summary-badges">
            <CanonicalLocusBadge
              locusId={locusKey}
              displayName={locus.displayName}
              transmission={locus.transmission}
              status={epistemicStatus}
              isProvisional={locus.isProvisional ?? false}
              carrierState={locus.carrierState}
              humanReviewRequired={requiresReview}
              humanReviewStatus={locus.humanReview}
              language={language}
              size="md"
            />
          </div>

          {/* SECTION 1 : STATUT ET QUALIFICATION ÉPISTÉMIQUE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {translateEpistemic(language, 'drawer.status_section')}
            </h4>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Statut :</span>
                <EpistemicStatusBadge status={epistemicStatus} size="sm" language={language} />
              </div>
              {epistemicSource && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Source :</span>
                  <EpistemicSourceBadge source={epistemicSource} size="sm" language={language} />
                </div>
              )}
              {epistemicConfidence && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Confiance :</span>
                  <EpistemicConfidenceBadge confidence={epistemicConfidence} size="sm" language={language} />
                </div>
              )}
              {requiresReview && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Revue humaine :</span>
                  <HumanReviewBadge required={true} status={locus.humanReview} size="sm" language={language} />
                </div>
              )}
            </div>

            {/* BLOC CONSULTATION SOURCES SCIENTIFIQUES (V1.6.6.21) */}
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2" data-testid="locus-traceability-summary-box">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span className="font-semibold text-xs text-indigo-950 dark:text-indigo-200">
                    {translateEpistemic(language, 'biblio.section_title')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssistantOpen(true)}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    data-testid="locus-drawer-ai-explain-btn"
                  >
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{language === 'ar' ? "شرح بالذكاء الاصطناعي" : language === 'en' ? "Explain with AI" : "Expliquer avec l'IA"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTraceabilityOpen(true)}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                    data-testid="open-traceability-drawer-button"
                  >
                    {translateEpistemic(language, 'biblio.button_consult')}
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                <span data-testid="biblio-sources-count-badge">
                  {translateEpistemic(language, 'biblio.sources_count', { count: totalSourcesCount })}
                </span>
                {conflictingSourcesCount > 0 && (
                  <span className="text-amber-700 dark:text-amber-400 font-medium" data-testid="biblio-conflicting-sources-badge">
                    {translateEpistemic(language, 'biblio.conflicting_sources_count', { count: conflictingSourcesCount })}
                  </span>
                )}
              </div>
              {locus.evidenceIds && locus.evidenceIds.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-indigo-200/50 dark:border-indigo-900/40" data-testid="drawer-evidence-ids-list">
                  {locus.evidenceIds.map(eid => (
                    <span key={eid} className="font-mono text-3xs px-2 py-0.5 rounded bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                      {eid}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ALERTE EN CAS DE CONFLIT */}
          {isConflict && (
            <AppAlert type="danger" title={translateEpistemic(language, 'drawer.conflict_title')}>
              <p className="text-xs">
                {(locus as any).conflictMessage ||
                  (locus as any).conflictSummary?.[0] ||
                  translateEpistemic(language, 'status.CONFLICT_REVIEW')}
              </p>
            </AppAlert>
          )}

          {/* SECTION 2 : DÉTERMINATION GÉNÉTIQUE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {translateEpistemic(language, 'drawer.determination_section')}
            </h4>

            {/* Cas A : Génotype Confirmé */}
            {isConfirmed && locus.alleles && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-1.5" data-testid="drawer-confirmed-box">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {translateEpistemic(language, 'drawer.confirmed_genotype')}
                </span>
                <div className="font-mono text-base font-bold text-emerald-900 dark:text-emerald-200" data-testid="drawer-confirmed-alleles">
                  {Array.isArray(locus.alleles) ? locus.alleles.filter(Boolean).join(' / ') : String(locus.alleles)}
                </div>
              </div>
            )}

            {/* Cas B : Ensemble d'Hypothèses (POSSIBLE_SET) */}
            {isPossibleSet && !isConfirmed && (
              <div className="space-y-2.5" data-testid="drawer-possible-set-box">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    {translateEpistemic(language, 'drawer.possible_hypotheses')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {translateEpistemic(language, 'card.combinations_count', {
                      count: hypothesesList.length || 2,
                    })}
                  </span>
                </div>

                <div className="space-y-2">
                  {hypothesesList.map((hyp, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-1.5"
                      data-testid={`drawer-hypothesis-${index}`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-amber-900 dark:text-amber-200">
                          {translateEpistemic(language, 'drawer.hypothesis_item', {
                            index: index + 1,
                          })}
                        </span>
                        {/* Probabilité affichée UNIQUEMENT si explicitement fournie */}
                        {hyp.probability !== undefined && (
                          <span className="font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[11px]" data-testid={`hypothesis-probability-${index}`}>
                            {`${hyp.probability} %`}
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100" data-testid={`hypothesis-alleles-${index}`}>
                        {hyp.alleles.filter(Boolean).join(' / ')}
                      </div>

                      {/* Rationale de l'hypothèse si renseignée */}
                      {hyp.rationale && (
                        <div className="pt-1 border-t border-amber-200/60 dark:border-amber-800/40 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-amber-800 dark:text-amber-300 block mb-0.5">
                            {translateEpistemic(language, 'drawer.why_hypothesis')}
                          </span>
                          <p>{hyp.rationale}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cas C : UNKNOWN */}
            {epistemicStatus === 'UNKNOWN' && !isPossibleSet && !isConfirmed && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5" data-testid="drawer-unknown-box">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p>{translateEpistemic(language, 'drawer.unknown_description')}</p>
              </div>
            )}

            {/* Cas D : NOT_TESTED */}
            {epistemicStatus === 'NOT_TESTED' && !isPossibleSet && !isConfirmed && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5" data-testid="drawer-not-tested-box">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p>{translateEpistemic(language, 'drawer.not_tested_description')}</p>
              </div>
            )}
          </div>

          {/* SECTION 3 : MODE DE TRANSMISSION & CARRIER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Transmission */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="text-xs text-slate-400 block font-medium">
                {translateEpistemic(language, 'drawer.transmission_section')}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm" data-testid="drawer-transmission-value">
                {transmissionLabel}
              </span>
            </div>

            {/* Statut porteur (Carrier) */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="text-xs text-slate-400 block font-medium">
                {translateEpistemic(language, 'drawer.carrier_section')}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm" data-testid="drawer-carrier-value">
                {carrierLabel}
              </span>
            </div>
          </div>

          {/* SECTION 4 : RATIONALE GLOBALE DU LOCUS (Si fournie) */}
          {locus.rationale && !hypothesesList.some(h => h.rationale === locus.rationale) && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-1" data-testid="drawer-rationale-box">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {translateEpistemic(language, 'drawer.why_hypothesis')}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {locus.rationale}
              </p>
            </div>
          )}

          {/* SECTION 5 : AVERTISSEMENT PROVISOIRE (isProvisional === true) */}
          {locus.isProvisional && (
            <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs space-y-1 flex items-start gap-2.5" data-testid="drawer-provisional-warning">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold block">
                  {translateEpistemic(language, 'drawer.provisional_notice')}
                </span>
                <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                  {translateEpistemic(language, 'locus.provisional_warning')}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 6 : AVERTISSEMENT BLOCAGE SCIENTIFIQUE (isBlocked === true) */}
          {(locus.isBlocked || locus.blocked || epistemicStatus === 'BLOCKED') && (
            <div className="p-3.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 text-xs space-y-1 flex items-start gap-2.5" data-testid="drawer-blocked-notice">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold block">
                  {translateEpistemic(language, 'status.BLOCKED')}
                </span>
                <p className="text-red-800 dark:text-red-300 mt-0.5">
                  {(locus as any).blockedRationale || locus.rationale || "Ce locus fait l'objet d'une controverse scientifique active dans la littérature avicole (ex: Martin vs Pomarède). Calculs et certitudes bloqués sans arbitrage unilatéral."}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 7 : NOTICES CAS SCIENTIFIQUES SENSIBLES V1.9.4 */}
          {/* A. Cas ZW femelle sur locus lié au sexe */}
          {locus.transmission === 'Z_LINKED' && locus.carrierState === 'NOT_APPLICABLE' && (
            <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 text-xs text-purple-900 dark:text-purple-300" data-testid="drawer-zw-notice">
              <p>{translateEpistemic(language, 'pedagogy.zw_female_notice')}</p>
            </div>
          )}

          {/* B. Cas Isabelle haplotype recombinant */}
          {locusKey === 'CAN_HAPLO_ISABELLE' && (
            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300 space-y-1" data-testid="drawer-isabelle-phase-notice">
              <span className="font-bold block">Haplotype recombinant Brun + Agate</span>
              <p>Haplotype [Z_br, Z_ag]. Chez le mâle, la phase (CIS / TRANS / inconnue) doit être qualifiée sans inférence unilatérale.</p>
            </div>
          )}

          {/* C. Facteurs létaux à 25% in ovo */}
          {(locusKey === 'CAN_LOC_INTENSIVE' || locusKey === 'CAN_LOC_CREST' || locusKey === 'CAN_LOC_WHITE_DOMINANT') && (
            <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-300 space-y-1" data-testid="drawer-lethal-factor-notice">
              <span className="font-bold block">Facteur dominant à risque létal homozygote (25% in ovo)</span>
              <p>L'homozygote est non viable. Présentation descriptive pure sans note de conformité ni conseil d'accouplement.</p>
            </div>
          )}

          {/* SECTION 8 : LES 8 QUESTIONS PÉDAGOGIQUES (Étape 2) */}
          <LocusPedagogicalQuestionsCard
            locus={locus}
            language={language}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            data-testid="drawer-pedagogical-questions"
          />
        </div>

        {/* TIROIR DE CONSULTATION BIBLIOGRAPHIQUE CANONIQUE */}
        <BibliographicTraceabilityDrawer
          open={isTraceabilityOpen}
          onClose={() => setIsTraceabilityOpen(false)}
          locus={locus}
          evidenceRecords={evidenceRecords}
          language={language}
          data-testid="locus-traceability-drawer"
        />

        {/* TIROIR D'ASSISTANCE IA CANONIQUE */}
        {isAssistantOpen && (
          <AssistantPassportDrawer
            open={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            locus={locus}
            data-testid="locus-assistant-drawer"
          />
        )}
      </aside>
    </div>
  );

  // Rendu par Portal côté client dans le navigateur, ou direct en SSR/Tests Node
  const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (isClient && document.body) {
    return createPortal(drawerContent, document.body);
  }

  return drawerContent;
}

export default CanonicalLocusDetailDrawer;

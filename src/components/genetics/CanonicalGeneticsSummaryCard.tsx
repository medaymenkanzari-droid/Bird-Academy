/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT CanonicalGeneticsSummaryCard
 * Synthèse claire, honnête et non-inférentielle des données génétiques canoniques.
 * 
 * GARANTIES ÉPISTÉMIQUES & CONTRAT UX :
 * 1. Zéro score génétique ou pourcentage de notation inventé.
 * 2. Zéro recommandation d'accouplement dans cette carte.
 * 3. Zéro inférence Phénotype -> Génotype certain.
 * 4. Zéro carrier Z-linked inventé pour les femelles.
 * 5. Respect strict de isProvisional (sans aucun hardcoding sur BREAST).
 * 6. POSSIBLE_SET présenté exclusivement comme ensemble d'hypothèses alternatives.
 */

import React from 'react';
import { Dna, ShieldAlert, Layers, Plus, FileDown, Sparkles } from 'lucide-react';
import { AppCard } from '../design-system/AppCard';
import { AppAlert } from '../design-system/AppAlert';
import type { Language } from '../../utils/translations';
import { CanonicalLocusBadge } from './CanonicalLocusBadge';
import { EpistemicStatusBadge, EpistemicStatusType } from './EpistemicStatusBadge';
import { EpistemicSourceBadge, EpistemicSourceType } from './EpistemicSourceBadge';
import { EpistemicConfidenceBadge, EpistemicConfidenceType } from './EpistemicConfidenceBadge';
import { HumanReviewBadge, HumanReviewStatusType } from './HumanReviewBadge';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';
import { GeneticsPedagogicalBanner } from './GeneticsPedagogicalBanner';

export interface CanonicalLocusItem {
  locusId?: string;
  locus?: string;
  displayName?: string;
  transmission?: string;
  determination?: 'CONFIRMED' | 'POSSIBLE_SET' | 'UNKNOWN' | 'NOT_TESTED' | string;
  alleles?: [string, string] | string[];
  possibleSet?: Array<[string, string]> | any[];
  hypotheses?: Array<{ genotype?: string; probability?: number; rationale?: string }> | any[];
  isCarrier?: boolean;
  carrierState?: string;
  status?: EpistemicStatusType;
  epistemicStatus?: EpistemicStatusType;
  confidence?: EpistemicConfidenceType;
  humanReview?: HumanReviewStatusType;
  humanReviewRequired?: boolean;
  isProvisional?: boolean;
  isBlocked?: boolean;
  blocked?: boolean;
  phase?: string;
  evidenceIds?: string[];
  provenance?: string;
  source?: EpistemicSourceType;
  rationale?: string;
  probabilityWeights?: number[];
  epistemic?: {
    status?: EpistemicStatusType;
    confidence?: EpistemicConfidenceType;
    provenance?: any;
    humanReviewRequired?: boolean;
  };
}

export interface CanonicalGeneticsRecord {
  schemaVersion?: string;
  speciesId?: string;
  sex?: 'MALE' | 'FEMALE' | 'UNKNOWN' | 'M' | 'F' | string;
  loci?: Record<string, CanonicalLocusItem> | CanonicalLocusItem[];
  globalConfidence?: EpistemicConfidenceType;
  overallEpistemicStatus?: EpistemicStatusType;
  humanReviewRequired?: boolean;
  conflictSummary?: string[];
}

export interface CanonicalGeneticsSummaryCardProps {
  genetics?: CanonicalGeneticsRecord | null;
  canonicalLoci?: CanonicalLocusItem[];
  size?: 'compact' | 'default';
  className?: string;
  language?: Language;
  speciesId?: string;
  sex?: string;
  showPedagogicalBanner?: boolean;
  'data-testid'?: string;
  onAddInfo?: () => void;
  onSelectLocus?: (locus: CanonicalLocusItem) => void;
  onExportPdf?: () => void;
  onOpenAssistant?: () => void;
}

export function CanonicalGeneticsSummaryCard({
  genetics,
  canonicalLoci: fallbackLoci,
  size = 'default',
  className = '',
  language: explicitLanguage,
  speciesId: explicitSpeciesId,
  sex: explicitSex,
  showPedagogicalBanner = false,
  'data-testid': testId,
  onAddInfo,
  onSelectLocus,
  onExportPdf,
  onOpenAssistant,
}: CanonicalGeneticsSummaryCardProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  const resolvedSpeciesId = explicitSpeciesId || genetics?.speciesId;
  const resolvedSex = explicitSex || genetics?.sex;

  // Normalisation de la liste des loci
  const rawLoci = genetics?.loci || fallbackLoci || [];
  const lociList: CanonicalLocusItem[] = Array.isArray(rawLoci)
    ? rawLoci
    : Object.entries(rawLoci).map(([key, item]) => ({
        locusId: item.locusId || item.locus || key,
        ...item,
      }));

  const hasLoci = lociList.length > 0;

  // Calcul du résumé comptable purement structurel (ZÉRO score ou notation)
  const totalCount = lociList.length;
  const toReviewCount = lociList.filter((item) => {
    return (
      item.humanReviewRequired ||
      item.epistemic?.humanReviewRequired ||
      item.humanReview === 'REQUIRED' ||
      item.humanReview === 'REVIEW_REQUIRED' ||
      item.status === 'CONFLICT_REVIEW' ||
      item.determination === 'CONFLICT_REVIEW' ||
      item.isProvisional === true
    );
  }).length + (genetics?.humanReviewRequired ? 1 : 0);

  const unknownCount = lociList.filter((item) => {
    const st = item.epistemic?.status || item.status || item.determination;
    return st === 'UNKNOWN' || st === 'NOT_TESTED';
  }).length;

  const footerText = translateEpistemic(language, 'card.summary_footer', {
    total: totalCount,
    toReview: toReviewCount,
    unknown: unknownCount,
  });

  return (
    <AppCard
      className={`${isRtl ? 'text-right' : 'text-left'} ${className}`}
      padding={size === 'compact' ? 'sm' : 'md'}
      data-testid={testId || 'canonical-genetics-summary-card'}
      role="region"
      aria-label={translateEpistemic(language, 'card.title')}
    >
      <div className={`space-y-4 ${isRtl ? 'dir-rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* EN-TÊTE DE LA CARTE */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Dna className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{translateEpistemic(language, 'card.title')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translateEpistemic(language, 'card.subtitle')}
              </p>
            </div>
          </div>

          {/* BADGES GLOBAUX */}
          <div className={`flex flex-wrap items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {onAddInfo && (
              <button
                type="button"
                onClick={onAddInfo}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                data-testid="summary-card-add-button"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{translateEpistemic(language, 'editor.add_info')}</span>
              </button>
            )}

            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                data-testid="export-passport-pdf-btn"
                title={translateEpistemic(language, 'card.export_pdf')}
              >
                <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{translateEpistemic(language, 'card.export_pdf')}</span>
              </button>
            )}

            {onOpenAssistant && (
              <button
                type="button"
                onClick={onOpenAssistant}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all active:scale-[0.98] cursor-pointer"
                data-testid="passport-open-ai-assistant-btn"
                title="Consulter l'Assistant IA pour le Bird Passport"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Assistant IA</span>
              </button>
            )}

            {genetics?.overallEpistemicStatus && (
              <EpistemicStatusBadge
                status={genetics.overallEpistemicStatus}
                size="sm"
                language={language}
                data-testid="summary-card-overall-status"
              />
            )}

            {genetics?.globalConfidence && (
              <EpistemicConfidenceBadge
                confidence={genetics.globalConfidence}
                size="sm"
                language={language}
                data-testid="summary-card-global-confidence"
              />
            )}

            {genetics?.humanReviewRequired && (
              <HumanReviewBadge
                required={true}
                size="sm"
                language={language}
                data-testid="summary-card-global-review"
              />
            )}
          </div>
        </div>

        {/* BANNIÈRE PÉDAGOGIQUE OPTIONNELLE (Phénotype / Génotype / Porteur V1.9.4) */}
        {showPedagogicalBanner && (
          <GeneticsPedagogicalBanner
            language={language}
            speciesId={resolvedSpeciesId}
            sex={resolvedSex}
            onOpenAssistant={onOpenAssistant}
            className="mb-1"
          />
        )}

        {/* ALERTE DE CONFLIT GLOBAL (Si détecté dans le modèle) */}
        {genetics?.conflictSummary && genetics.conflictSummary.length > 0 && (
          <AppAlert
            type="danger"
            title={translateEpistemic(language, 'card.conflict_alert_title')}
            className="text-xs"
          >
            <ul className="list-disc list-inside space-y-0.5 mt-1">
              {genetics.conflictSummary.map((conflict, idx) => (
                <li key={idx}>{conflict}</li>
              ))}
            </ul>
          </AppAlert>
        )}

        {/* CONTENU PRINCIPAL : LISTE DES LOCI OU ÉTAT VIDE */}
        {!hasLoci ? (
          <div
            className="py-6 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs space-y-3"
            data-testid="summary-card-empty-state"
          >
            <p>{translateEpistemic(language, 'card.empty')}</p>
            {onAddInfo && (
              <button
                type="button"
                onClick={onAddInfo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-[0.98]"
                data-testid="summary-card-empty-add-button"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{translateEpistemic(language, 'editor.add_info')}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5" data-testid="summary-card-loci-list">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              {translateEpistemic(language, 'card.loci_section')}
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/50">
              {lociList.map((locusItem, index) => {
                const locusKey = locusItem.locusId || locusItem.locus || `locus-${index}`;
                const epistemicStatus =
                  locusItem.epistemic?.status ||
                  locusItem.status ||
                  (locusItem.determination === 'CONFIRMED'
                    ? 'GENETICALLY_CONFIRMED'
                    : locusItem.determination === 'POSSIBLE_SET'
                    ? 'POSSIBLE_SET'
                    : locusItem.determination);

                const epistemicSource =
                  (typeof locusItem.epistemic?.provenance === 'string'
                    ? locusItem.epistemic.provenance
                    : undefined) ||
                  locusItem.source ||
                  locusItem.provenance;

                const epistemicConfidence =
                  locusItem.epistemic?.confidence || locusItem.confidence;

                const requiresReview =
                  locusItem.epistemic?.humanReviewRequired ??
                  locusItem.humanReviewRequired ??
                  (locusItem.humanReview === 'REQUIRED' || locusItem.humanReview === 'REVIEW_REQUIRED');

                const isPossibleSet =
                  locusItem.determination === 'POSSIBLE_SET' ||
                  epistemicStatus === 'POSSIBLE_SET' ||
                  Boolean(locusItem.possibleSet && locusItem.possibleSet.length > 0) ||
                  Boolean(locusItem.hypotheses && locusItem.hypotheses.length > 0);

                const combinationsCount =
                  locusItem.possibleSet?.length || locusItem.hypotheses?.length || 2;

                const isConfirmed =
                  locusItem.determination === 'CONFIRMED' ||
                  epistemicStatus === 'GENETICALLY_CONFIRMED';

                return (
                  <div
                    key={locusKey}
                    onClick={() => onSelectLocus && onSelectLocus(locusItem)}
                    className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                      onSelectLocus ? 'cursor-pointer hover:bg-blue-50/20 dark:hover:bg-blue-950/20' : ''
                    }`}
                    data-testid={`locus-row-${locusKey}`}
                  >
                    {/* Identification du Locus & Transmission */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CanonicalLocusBadge
                        locusId={locusKey}
                        displayName={locusItem.displayName}
                        transmission={locusItem.transmission}
                        status={epistemicStatus}
                        isProvisional={locusItem.isProvisional ?? false}
                        carrierState={locusItem.carrierState || (locusItem.isCarrier ? 'CONFIRMED_CARRIER' : undefined)}
                        humanReviewRequired={requiresReview}
                        humanReviewStatus={locusItem.humanReview}
                        size="sm"
                        language={language}
                      />
                    </div>

                    {/* Preuves, Sources, Hypothèses ou Génotype Confirmé */}
                    <div className={`flex flex-wrap items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      {/* Cas A : Génotype Confirmé (Purement fourni, jamais inventé) */}
                      {isConfirmed && locusItem.alleles && (
                        <span
                          className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          data-testid={`confirmed-alleles-${locusKey}`}
                        >
                          {Array.isArray(locusItem.alleles)
                            ? locusItem.alleles.filter(Boolean).join(' / ')
                            : String(locusItem.alleles)}
                        </span>
                      )}

                      {/* Cas B : POSSIBLE_SET (Toujours présenté comme ensemble d'hypothèses) */}
                      {isPossibleSet && !isConfirmed && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800"
                          data-testid={`possible-set-pill-${locusKey}`}
                        >
                          <Layers className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                          <span>
                            {translateEpistemic(language, 'card.combinations_count', {
                              count: combinationsCount,
                            })}
                          </span>
                        </span>
                      )}

                      {/* Source / Provenance */}
                      {epistemicSource && (
                        <EpistemicSourceBadge
                          source={epistemicSource}
                          size="sm"
                          language={language}
                          data-testid={`locus-source-${locusKey}`}
                        />
                      )}

                      {/* Confiance */}
                      {epistemicConfidence && (
                        <EpistemicConfidenceBadge
                          confidence={epistemicConfidence}
                          size="sm"
                          language={language}
                          data-testid={`locus-confidence-${locusKey}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PIED DE CARTE STRUCTUREL (Comptabilité pure sans score ni notation) */}
        {hasLoci && (
          <div
            className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium"
            data-testid="summary-card-footer"
          >
            <span>{footerText}</span>
          </div>
        )}
      </div>
    </AppCard>
  );
}

export default CanonicalGeneticsSummaryCard;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT BibliographicTraceabilityDrawer
 * Tiroir de consultation documentaire et de traçabilité scientifique (Lecture Seule Pure).
 * Mission V1.6.6.21
 * 
 * GARANTIES ÉPISTÉMIQUES & CONTRAT UX :
 * 1. Zéro arbitrage automatique : les hypothèses concurrentes et sources contradictoires (ex: Satiné) sont présentées à égalité.
 * 2. Dissociation stricte : SourceLevel (P0/P1/P2) !== Certification biologique.
 * 3. Aucune altération des données (Lecture seule pure).
 * 4. Présentation des citations précises (page, chapitre, section, paragraphe, citation textuelle).
 * 5. Préservation des sources historiques (OUTDATED) et non vérifiées (NOT_VERIFIED).
 * 6. Accessibilité WCAG, fermeture Escape, focus et support complet RTL Arabe.
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  Bookmark,
  ExternalLink,
  AlertTriangle,
  Info,
  Clock,
  HelpCircle,
  FileText,
  ShieldAlert,
  Calendar,
  Layers,
  Quote,
} from 'lucide-react';
import type { Language } from '../../utils/translations';
import { useEpistemicLanguage } from './useEpistemicLanguage';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { EpistemicStatusBadge, EpistemicStatusType } from './EpistemicStatusBadge';
import { HumanReviewBadge } from './HumanReviewBadge';
import {
  BibliographicSource,
  EvidenceCitation,
  EvidenceRecord,
  getBibliographicSource,
  getEvidenceRecord,
  getEvidenceRecordsForRule,
} from '../../reference/bibliography';
import type { CanonicalLocusItem } from './CanonicalGeneticsSummaryCard';

export interface BibliographicTraceabilityDrawerProps {
  open: boolean;
  onClose: () => void;
  evidenceRecord?: EvidenceRecord | null;
  evidenceRecords?: EvidenceRecord[];
  evidenceId?: string;
  ruleId?: string;
  locus?: CanonicalLocusItem | null;
  speciesId?: string;
  language?: Language;
  'data-testid'?: string;
}

/**
 * Résout les EvidenceRecords associés à un locus canonique ou un identifiant de règle.
 */
export function resolveEvidenceForLocus(
  locus: CanonicalLocusItem | null | undefined,
  fallbackSpeciesId?: string
): EvidenceRecord[] {
  if (!locus) return [];

  const records: EvidenceRecord[] = [];
  const addedIds = new Set<string>();

  // 1. Identifiants de preuves explicites déclarés sur le locus
  const explicitEvidenceIds = (locus as any).evidenceIds || (locus.epistemic as any)?.evidenceIds;
  if (Array.isArray(explicitEvidenceIds)) {
    for (const eid of explicitEvidenceIds) {
      if (typeof eid === 'string') {
        const rec = getEvidenceRecord(eid);
        if (rec && !addedIds.has(rec.evidenceId)) {
          records.push(rec);
          addedIds.add(rec.evidenceId);
        }
      }
    }
  }

  // 2. Recherche par identifiant de règle / locus direct
  const locusKey = locus.locusId || locus.locus || '';
  if (locusKey) {
    const directRecords = getEvidenceRecordsForRule(locusKey);
    for (const rec of directRecords) {
      if (!addedIds.has(rec.evidenceId)) {
        records.push(rec);
        addedIds.add(rec.evidenceId);
      }
    }

    // 3. Préfixes taxonomiques canoniques
    const prefixes = ['GOU_LOC_', 'CAN_LOC_', 'CAL_LOC_', 'AGA_LOC_', 'MAN_LOC_', 'CAN_RULE_', 'BUD_LOC_'];
    for (const p of prefixes) {
      const prefixedKey = `${p}${locusKey}`;
      const prefixedRecords = getEvidenceRecordsForRule(prefixedKey);
      for (const rec of prefixedRecords) {
        if (!addedIds.has(rec.evidenceId)) {
          records.push(rec);
          addedIds.add(rec.evidenceId);
        }
      }
    }

    // 4. Mappages sémantiques canoniques reconnus
    const keyLower = locusKey.toLowerCase();
    if (keyLower.includes('satine') || keyLower.includes('satiné')) {
      const satRec = getEvidenceRecord('EVD-CAN-09-SAT-01');
      if (satRec && !addedIds.has(satRec.evidenceId)) {
        records.push(satRec);
        addedIds.add(satRec.evidenceId);
      }
    } else if (keyLower === 'breast' || keyLower === 'poitrine') {
      const breastRec = getEvidenceRecord('EVD-GOU-01-002');
      if (breastRec && !addedIds.has(breastRec.evidenceId)) {
        records.push(breastRec);
        addedIds.add(breastRec.evidenceId);
      }
    } else if (keyLower.includes('head_color') || keyLower === 'zr') {
      const headRec = getEvidenceRecord('EVD-GOU-01-001');
      if (headRec && !addedIds.has(headRec.evidenceId)) {
        records.push(headRec);
        addedIds.add(headRec.evidenceId);
      }
    }
  }

  return records;
}

export function BibliographicTraceabilityDrawer({
  open,
  onClose,
  evidenceRecord,
  evidenceRecords: explicitRecords,
  evidenceId,
  ruleId,
  locus,
  speciesId: explicitSpeciesId,
  language: explicitLanguage,
  'data-testid': testId,
}: BibliographicTraceabilityDrawerProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  // Gestion du scroll du body et fermeture Escape
  useEffect(() => {
    if (!open) return;

    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = '';
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown, true);
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  // Résolution de la liste des EvidenceRecords à afficher
  let resolvedRecords: EvidenceRecord[] = [];

  if (explicitRecords && explicitRecords.length > 0) {
    resolvedRecords = explicitRecords;
  } else if (evidenceRecord) {
    resolvedRecords = [evidenceRecord];
  } else if (evidenceId) {
    const single = getEvidenceRecord(evidenceId);
    if (single) resolvedRecords = [single];
  } else if (ruleId) {
    resolvedRecords = getEvidenceRecordsForRule(ruleId);
  } else if (locus) {
    resolvedRecords = resolveEvidenceForLocus(locus, explicitSpeciesId);
  }

  const effectiveSpeciesId =
    explicitSpeciesId ||
    (resolvedRecords[0] ? resolvedRecords[0].speciesId : (locus as any)?.speciesId) ||
    '';

  const locusKey = locus?.locusId || locus?.locus || ruleId || (resolvedRecords[0] ? resolvedRecords[0].ruleId : 'RÈGLE');
  const locusDisplayName = locus?.displayName || locusKey;

  const drawerContent = (
    <div
      className={`fixed inset-0 z-[10000] flex ${isRtl ? 'justify-start' : 'justify-end'} overflow-hidden font-sans`}
      role="dialog"
      aria-modal="true"
      aria-label={translateEpistemic(language, 'biblio.drawer_title')}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid={testId || 'bibliographic-traceability-drawer'}
      data-drawer-open="true"
    >
      {/* Backdrop sombre avec fermeture au clic */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
        data-testid="traceability-drawer-backdrop"
      />

      {/* Panneau latéral du Drawer */}
      <aside
        className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl z-10 border-slate-200 dark:border-slate-800 ${
          isRtl ? 'border-r' : 'border-l'
        } overflow-hidden`}
        data-testid="traceability-drawer-panel"
      >
        {/* EN-TÊTE DU DRAWER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight" data-testid="traceability-drawer-title">
                {translateEpistemic(language, 'biblio.drawer_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translateEpistemic(language, 'biblio.drawer_subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label={translateEpistemic(language, 'biblio.close')}
            data-testid="traceability-drawer-close-button"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* CORPS SCROLLABLE DU DRAWER */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-sm" data-testid="traceability-drawer-content">
          {/* A. CONTEXTE DE LA RÈGLE */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/40 space-y-3" data-testid="rule-context-section">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {translateEpistemic(language, 'biblio.rule_context')}
              </span>
              {effectiveSpeciesId && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300" data-testid="context-species-id">
                  {effectiveSpeciesId}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-900 dark:text-white text-base" data-testid="context-locus-name">
                {locusDisplayName}
              </div>
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400" data-testid="context-rule-id">
                {locusKey}
              </div>
            </div>

            {/* Statut épistémique & Revue humaine */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              {locus?.status && (
                <EpistemicStatusBadge status={locus.status} size="sm" language={language} data-testid="context-epistemic-badge" />
              )}
              {locus && (
                <HumanReviewBadge
                  required={Boolean(locus.humanReviewRequired ?? locus.epistemic?.humanReviewRequired)}
                  status={locus.humanReview}
                  size="sm"
                  language={language}
                  data-testid="context-human-review-badge"
                />
              )}
            </div>

            {/* Avertissement méthodologique P1/P0 !== VERIFIED */}
            <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p>{translateEpistemic(language, 'biblio.warning_p1_not_verified')}</p>
            </div>
          </div>

          {/* B. DOSSIERS DE PREUVES (EVIDENCE RECORDS) */}
          {resolvedRecords.length === 0 ? (
            <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-center space-y-2" data-testid="no-sources-fallback">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {translateEpistemic(language, 'biblio.no_sources_available')}
              </p>
            </div>
          ) : (
            <div className="space-y-6" data-testid="evidence-records-container">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {translateEpistemic(language, 'biblio.evidence_records_title')}
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  {resolvedRecords.length} {resolvedRecords.length > 1 ? 'dossiers' : 'dossier'}
                </span>
              </div>

              {resolvedRecords.map((record, recIdx) => {
                const hasConflictingCitation = record.citations.some(c => c.concordance === 'CONFLICTING');
                const isUnderStudyOrUnknown = record.epistemicStatus === 'UNKNOWN' || record.epistemicStatus === 'INSUFFICIENT_EVIDENCE';

                return (
                  <div
                    key={record.evidenceId || recIdx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
                    data-testid={`evidence-record-card-${record.evidenceId}`}
                  >
                    {/* En-tête de l'EvidenceRecord */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400" data-testid="evidence-id-label">
                          {record.evidenceId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700" data-testid="record-epistemic-status-raw">
                          {record.epistemicStatus}
                        </span>
                        <EpistemicStatusBadge status={record.epistemicStatus} size="sm" language={language} data-testid="record-epistemic-status" />
                        {record.humanReviewRequired && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" data-testid="record-human-review-flag">
                            {translateEpistemic(language, 'biblio.human_review_required')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Affirmation (Claim) */}
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium block">
                        {translateEpistemic(language, 'biblio.claim_label')}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed" data-testid="evidence-claim-text">
                        {record.claim}
                      </p>
                    </div>

                    {/* Limitations scientifiques si définies */}
                    {record.limitations && (
                      <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs space-y-1" data-testid="evidence-limitations-box">
                        <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          {translateEpistemic(language, 'biblio.limitations_label')}
                        </span>
                        <p className="leading-relaxed">{record.limitations}</p>
                      </div>
                    )}

                    {/* Alerte si controverse / sources contradictoires (ex: Satiné) */}
                    {hasConflictingCitation && (
                      <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2" data-testid="conflicting-warning-alert">
                        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <span className="font-bold block">
                            {translateEpistemic(language, 'biblio.warning_no_auto_winner')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* C. CITATIONS ET SOURCES ASSOCIÉES */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          {translateEpistemic(language, 'biblio.citations_title')}
                        </span>
                        <span className="text-xs text-slate-400" data-testid="citations-count-label">
                          {translateEpistemic(language, 'biblio.citations_count', { count: record.citations.length })}
                        </span>
                      </div>

                      {record.citations.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          {translateEpistemic(language, 'biblio.no_sources_available')}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {record.citations.map((citation, citIdx) => {
                            const source = getBibliographicSource(citation.sourceId);

                            return (
                              <div
                                key={citation.citationId || citIdx}
                                className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/60 space-y-3"
                                data-testid={`citation-item-${citation.citationId || citIdx}`}
                              >
                                {/* Statuts de la citation */}
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                  <span className="font-mono text-[11px] font-semibold text-slate-500">
                                    {citation.citationId}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {/* Concordance */}
                                    <span
                                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                        citation.concordance === 'CONFLICTING'
                                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                          : citation.concordance === 'CONCORDANT'
                                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                          : citation.concordance === 'OUTDATED'
                                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                      }`}
                                      data-testid={`citation-concordance-${citIdx}`}
                                    >
                                      {citation.concordance}
                                    </span>
                                    {/* Rôle épistémique */}
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                      {citation.epistemicRole}
                                    </span>
                                  </div>
                                </div>

                                {/* Rationale de la citation si fournie */}
                                {citation.rationale && (
                                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800" data-testid="citation-rationale">
                                    « {citation.rationale} »
                                  </p>
                                )}

                                {/* Localisation précise (page, chapitre, quote) */}
                                {citation.preciseLocation && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 pt-1 font-mono" data-testid="precise-location-block">
                                    {citation.preciseLocation.page && <span>p. {citation.preciseLocation.page}</span>}
                                    {citation.preciseLocation.chapter && <span>chap. {citation.preciseLocation.chapter}</span>}
                                    {citation.preciseLocation.section && <span>sec. {citation.preciseLocation.section}</span>}
                                    {citation.preciseLocation.figure && <span>fig. {citation.preciseLocation.figure}</span>}
                                    {citation.preciseLocation.quote && (
                                      <span className="block w-full text-slate-600 dark:text-slate-300 font-sans italic pt-1">
                                        « {citation.preciseLocation.quote} »
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* D. SOURCE BIBLIOGRAPHIQUE LIÉE */}
                                {source ? (
                                  <div className="mt-2 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 space-y-2 bg-white dark:bg-slate-900 p-3 rounded-lg border" data-testid={`bibliographic-source-box-${source.sourceId}`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {source.sourceId}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {/* Niveau P0/P1/P2 neutre */}
                                        <span
                                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                            source.sourceLevel === 'P0'
                                              ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                              : source.sourceLevel === 'P1'
                                              ? 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                              : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                          }`}
                                          data-testid={`source-level-badge-${source.sourceId}`}
                                        >
                                          {source.sourceLevel}
                                        </span>
                                        {/* Statut de vérification documentaire */}
                                        <span
                                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                            source.verificationStatus === 'VERIFIED'
                                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                                              : source.verificationStatus === 'OUTDATED'
                                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                          }`}
                                          data-testid={`source-verification-status-${source.sourceId}`}
                                        >
                                          {source.verificationStatus}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Titre & Auteurs */}
                                    <div>
                                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white" data-testid="source-title-text">
                                        {source.title}
                                      </h5>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5" data-testid="source-authors-text">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                          {translateEpistemic(language, 'biblio.authors')}:{' '}
                                        </span>
                                        {source.authors.join(', ')} ({source.year})
                                        {source.organization ? ` — ${source.organization}` : ''}
                                      </p>
                                    </div>

                                    {/* Métadonnées détaillées (journal, volume, éditeur, etc.) */}
                                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                                      {source.journal && (
                                        <p>
                                          <span className="font-medium text-slate-700 dark:text-slate-300">Journal: </span>
                                          {source.journal} {source.volume ? `vol. ${source.volume}` : ''}{source.issue ? `(${source.issue})` : ''}{source.pages ? ` pp. ${source.pages}` : ''}
                                        </p>
                                      )}
                                      {source.publisher && (
                                        <p>
                                          <span className="font-medium text-slate-700 dark:text-slate-300">Éditeur: </span>
                                          {source.publisher}
                                        </p>
                                      )}
                                      {source.isbn && (
                                        <p className="font-mono">
                                          <span className="font-sans font-medium text-slate-700 dark:text-slate-300">ISBN: </span>
                                          {source.isbn}
                                        </p>
                                      )}
                                      {source.doi && (
                                        <p className="font-mono">
                                          <span className="font-sans font-medium text-slate-700 dark:text-slate-300">DOI: </span>
                                          <a
                                            href={`https://doi.org/${source.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                            data-testid="source-doi-link"
                                          >
                                            {source.doi}
                                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                          </a>
                                        </p>
                                      )}
                                      {source.consultedAt && (
                                        <p className="text-[11px] text-slate-400 pt-0.5">
                                          {translateEpistemic(language, 'biblio.source_consulted_at', { date: source.consultedAt })}
                                        </p>
                                      )}
                                      {source.notes && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                                          {source.notes}
                                        </p>
                                      )}
                                    </div>

                                    {/* Lien externe si URL présente */}
                                    {source.url && (
                                      <div className="pt-2">
                                        <a
                                          href={source.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                                          data-testid="source-url-link"
                                        >
                                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                          {translateEpistemic(language, 'biblio.url')}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">
                                    Source référencée ({citation.sourceId}) non détaillée dans le catalogue local.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );

  // Rendu client par Portal ou SSR / tests direct
  const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';
  if (isClient && document.body) {
    return createPortal(drawerContent, document.body);
  }

  return drawerContent;
}

export default BibliographicTraceabilityDrawer;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT GouldCrossResultCard
 * Mission V1.6.6.11 : Résultat détaillé et qualification épistémique du croisement Gould.
 * 
 * GARANTIES D'ARCHITECTURE ET ÉPISTÉMIQUES :
 * 1. Zéro calcul génétique dans le composant : présentation pure d'un GouldianCrossResult.
 * 2. Zéro modification mathématique des probabilités fournies par le moteur.
 * 3. Séparation nette : Certitude vs Hypothèses parentales vs Revue humaine.
 * 4. Détection générique des référentiels provisoires (aucun hardcoding 'BREAST').
 * 5. Silver présenté strictement comme phénotype composite (jamais mutation unitaire).
 * 6. Zéro score de couple, zéro recommandation d'accouplement, zéro valeur commerciale.
 * 7. Support complet i18n (FR, EN, AR, ES, IT) et RTL.
 */

import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle,
  Layers, Dna, Info, X, ChevronDown, ChevronUp, Eye, ShieldAlert
} from 'lucide-react';
import { AppAlert } from '../design-system/AppAlert';
import type { Language } from '../../utils/translations';
import { EpistemicStatusBadge } from './EpistemicStatusBadge';
import { EpistemicConfidenceBadge } from './EpistemicConfidenceBadge';
import { HumanReviewBadge } from './HumanReviewBadge';
import { CanonicalLocusBadge } from './CanonicalLocusBadge';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';
import type {
  GouldianCrossResult,
  OffspringGenotypeOutcome,
  OffspringPhenotypeOutcome,
  GouldianGenotypeRecord
} from '../../features/genetics/species/gouldianCrossTypes';
import type { Canari } from '../../types';

export interface GouldCrossResultCardProps {
  result: GouldianCrossResult;
  father: GouldianGenotypeRecord;
  mother: GouldianGenotypeRecord;
  parentABird?: Canari | null;
  parentBBird?: Canari | null;
  language?: Language;
  'data-testid'?: string;
}

function mapEpistemicCertaintyToStatus(certainty?: string): any {
  if (!certainty) return 'UNKNOWN';
  if (certainty === 'CERTAIN') return 'GENETICALLY_CONFIRMED';
  if (certainty === 'HYPOTHETICAL') return 'POSSIBLE_SET';
  return certainty;
}

export function GouldCrossResultCard({
  result,
  father,
  mother,
  parentABird,
  parentBBird,
  language: explicitLanguage,
  'data-testid': testId = 'cross-result-card'
}: GouldCrossResultCardProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  const [showGenotypesList, setShowGenotypesList] = useState<boolean>(true);
  const [selectedGenotypeDetail, setSelectedGenotypeDetail] = useState<OffspringGenotypeOutcome | null>(null);

  // 1. Calcul du nombre d'hypothèses parentales
  const getParentHypothesesCount = (record: GouldianGenotypeRecord): number => {
    if (!record) return 1;
    const hZ = record.headColorZ?.possibleSet?.length || 1;
    const hY = record.headYellow?.possibleSet?.length || 1;
    const bD = (record.bodyDilution as any)?.possibleSet?.length || 1;
    const bB = record.bodyBlue?.possibleSet?.length || 1;
    const br = record.breast?.possibleSet?.length || 1;
    return hZ * hY * bD * bB * br;
  };

  const fatherHypothesesCount = getParentHypothesesCount(father);
  const motherHypothesesCount = getParentHypothesesCount(mother);
  const hasParentHypotheses = result.isParentHypothesisSet || fatherHypothesesCount > 1 || motherHypothesesCount > 1;

  // 2. Détection générique du cadre provisoire (sans hardcoder BREAST)
  const isProvisionalFramework = Boolean(
    result.warnings?.some((w) => w.toUpperCase().includes('PROVISIONAL') || w.toLowerCase().includes('provisoire')) ||
    (father.breast as any)?.implementationStatus === 'PROVISIONAL' ||
    (mother.breast as any)?.implementationStatus === 'PROVISIONAL' ||
    result.offspringGenotypes.some((g) => (g.genotype.breast as any)?.implementationStatus === 'PROVISIONAL')
  );

  // 3. Détection du besoin de revue humaine
  const requiresHumanReview = Boolean(
    result.overallHumanReview === 'REQUIRED' ||
    isProvisionalFramework ||
    result.warnings?.length > 0
  );

  // 4. Somme de couverture des probabilités
  const totalPhenotypeProbability = result.offspringPhenotypes.reduce((acc, p) => acc + (p.probability || 0), 0);
  const probabilityCoveragePercent = Math.round(totalPhenotypeProbability * 100);

  // 5. Titre épistémique
  const getResultTitle = () => {
    if (requiresHumanReview && isProvisionalFramework) {
      return translateEpistemic(language, 'cross.result_review_required');
    }
    if (hasParentHypotheses) {
      return translateEpistemic(language, 'cross.result_hypothetical');
    }
    return translateEpistemic(language, 'cross.result_confirmed');
  };

  return (
    <div
      className="space-y-6"
      data-testid={testId}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. RÉSUMÉ DE CERTITUDE */}
      <div
        className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 shadow-sm space-y-4"
        data-testid="cross-certainty-summary"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h3
                className="text-sm font-bold text-slate-900 dark:text-white"
                data-testid="cross-result-title"
              >
                {getResultTitle()}
              </h3>
            </div>
            <p className="text-3xs text-slate-500 dark:text-slate-400 mt-1 pl-7">
              {translateEpistemic(language, 'card.subtitle')} · GouldianCrossEngine
            </p>
          </div>

          {/* Badges épistémiques */}
          <div className="flex flex-wrap items-center gap-1.5 pl-7 sm:pl-0">
            <EpistemicStatusBadge
              status={hasParentHypotheses ? 'POSSIBLE_SET' : 'GENETICALLY_CONFIRMED'}
              size="sm"
              language={language}
              data-testid="cross-result-status-badge"
            />
            {hasParentHypotheses && (
              <span
                className="text-3xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                data-testid="cross-result-hypothesis-badge"
              >
                {translateEpistemic(language, 'status.POSSIBLE_SET')}
              </span>
            )}
            <EpistemicConfidenceBadge
              confidence={hasParentHypotheses ? 'MEDIUM' : 'VERY_HIGH'}
              size="sm"
              language={language}
            />
            <HumanReviewBadge
              required={requiresHumanReview}
              size="sm"
              language={language}
              data-testid="cross-result-human-review-badge"
            />
          </div>
        </div>

        {/* Indicateur de Mode (Déterministe vs Hypothèses) */}
        <div className="pt-2 border-t border-indigo-100/60 dark:border-indigo-900/40">
          <div
            className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"
            data-testid="cross-mode-indicator"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>
              {hasParentHypotheses
                ? translateEpistemic(language, 'cross.mode_hypothetical')
                : translateEpistemic(language, 'cross.mode_confirmed')}
            </span>
          </div>
          {hasParentHypotheses && (
            <p
              className="text-3xs text-slate-600 dark:text-slate-400 mt-1 pl-4"
              data-testid="cross-mode-desc"
            >
              {translateEpistemic(language, 'cross.mode_hypothetical_desc')}
            </p>
          )}
        </div>
      </div>

      {/* 2. PARENTS UTILISÉS */}
      <div className="space-y-2.5" data-testid="cross-parents-summary">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Dna className="w-3.5 h-3.5" />
          <span>{translateEpistemic(language, 'cross.parents_used')}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Parent A (Père) */}
          <div
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1.5"
            data-testid="cross-parent-a-summary-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {translateEpistemic(language, 'cross.parent_a')} (♂)
              </span>
              <span className="text-3xs font-mono text-slate-500 dark:text-slate-400">
                {parentABird?.bague || 'Bague non renseignée'}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {parentABird?.nom || (father.sex === 'MALE' ? 'Père Gould' : 'Parent A')}
            </div>
            <div className="text-3xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div><span className="font-semibold">Espèce :</span> {result.speciesId}</div>
              <div><span className="font-semibold">Sexe :</span> {father.sex === 'MALE' ? 'Mâle' : 'Femelle'}</div>
              <div data-testid="cross-father-hypotheses-count">
                <span className="font-semibold">Hypothèses :</span>{' '}
                {translateEpistemic(language, 'cross.parent_hypotheses_count', { count: fatherHypothesesCount })}
              </div>
            </div>
          </div>

          {/* Parent B (Mère) */}
          <div
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-1.5"
            data-testid="cross-parent-b-summary-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {translateEpistemic(language, 'cross.parent_b')} (♀)
              </span>
              <span className="text-3xs font-mono text-slate-500 dark:text-slate-400">
                {parentBBird?.bague || 'Bague non renseignée'}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {parentBBird?.nom || (mother.sex === 'FEMALE' ? 'Mère Gould' : 'Parent B')}
            </div>
            <div className="text-3xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div><span className="font-semibold">Espèce :</span> {result.speciesId}</div>
              <div><span className="font-semibold">Sexe :</span> {mother.sex === 'FEMALE' ? 'Femelle' : 'Mâle'}</div>
              <div data-testid="cross-mother-hypotheses-count">
                <span className="font-semibold">Hypothèses :</span>{' '}
                {translateEpistemic(language, 'cross.parent_hypotheses_count', { count: motherHypothesesCount })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. COUVERTURE DES PROBABILITÉS (Section 11) */}
      {probabilityCoveragePercent > 0 && (
        <div
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-3xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          data-testid="cross-probability-coverage"
        >
          <span>
            {translateEpistemic(language, 'cross.probability_coverage', { coverage: probabilityCoveragePercent })}
          </span>
          <span className="text-slate-400">
            Total normalisé par GouldianCrossEngine
          </span>
        </div>
      )}

      {/* 4. RÉSULTATS PHÉNOTYPIQUES (Section 9 & 13) */}
      <div className="space-y-2.5" data-testid="cross-phenotypes-section">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {translateEpistemic(language, 'cross.phenotypes_section')} ({result.offspringPhenotypes.length})
          </h4>
          <span className="text-3xs text-slate-400 font-mono">
            {translateEpistemic(language, 'cross.probability_label')}
          </span>
        </div>

        <div
          className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/60"
          data-testid="cross-phenotypes-list"
        >
          {result.offspringPhenotypes.map((outcome: OffspringPhenotypeOutcome, idx: number) => {
            const manifest = outcome.manifest;
            const isMale = manifest.sex === 'MALE';
            return (
              <div
                key={`pheno-${idx}`}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                data-testid={`cross-phenotype-row-${idx}`}
              >
                {/* Visual features */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isMale
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    }`}
                  >
                    {isMale ? '♂' : '♀'}
                  </div>
                  <div>
                    <div
                      className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2"
                      data-testid="cross-phenotype-item"
                    >
                      <span>
                        {manifest.visualHeadColor} · {manifest.visualBreastColor} · {manifest.visualBodyColor}
                      </span>
                    </div>
                    <div className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5 space-x-1">
                      <span>{isMale ? 'Mâle' : 'Femelle'} · Bec : {manifest.beakTipColor}</span>
                      {/* Section 13: Silver composite display */}
                      {manifest.compositeLabels && manifest.compositeLabels.length > 0 && (
                        <span
                          className="font-semibold text-purple-600 dark:text-purple-400 ml-1"
                          data-testid="cross-composite-label"
                        >
                          {`· ${translateEpistemic(language, 'cross.composite_phenotype')} : ${manifest.compositeLabels.join(', ')} (${translateEpistemic(language, 'cross.composite_label_notice')})`}
                        </span>
                      )}
                    </div>
                    {/* Underlying genotypes count */}
                    <div
                      className="text-3xs text-slate-400 dark:text-slate-500 mt-0.5"
                      data-testid={`cross-phenotype-underlying-${idx}`}
                    >
                      {translateEpistemic(language, 'cross.underlying_genotypes_count', {
                        count: outcome.underlyingGenotypes?.length || 1
                      })}
                    </div>
                  </div>
                </div>

                {/* Probabilité exacte fournie par le moteur */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    data-testid={`cross-phenotype-prob-${idx}`}
                  >
                    {outcome.percentage}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RÉSULTATS GÉNÉTIQUES DÉTAILLÉS (Section 8 & 19) */}
      <div className="space-y-2.5" data-testid="cross-genotypes-section">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowGenotypesList(!showGenotypesList)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            data-testid="toggle-genotypes-btn"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{translateEpistemic(language, 'cross.genotypes_section')} ({result.offspringGenotypes.length})</span>
            {showGenotypesList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-3xs text-slate-400">
            Détail par locus et génotype complet
          </span>
        </div>

        {showGenotypesList && (
          <div
            className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/60 font-mono text-xs"
            data-testid="cross-genotypes-list"
          >
            {result.offspringGenotypes.map((gOutcome: OffspringGenotypeOutcome, gIdx: number) => {
              const g = gOutcome.genotype;
              return (
                <div
                  key={`geno-${gIdx}`}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                  data-testid={`cross-genotype-row-${gIdx}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {g.sex === 'MALE' ? '♂ Mâle' : '♀ Femelle'}
                      </span>
                      <EpistemicStatusBadge
                        status={mapEpistemicCertaintyToStatus(gOutcome.epistemicStatus || g.headColorZ?.certainty)}
                        size="sm"
                        language={language}
                      />
                    </div>
                    <div className="text-3xs text-slate-600 dark:text-slate-300">
                      HEAD_COLOR_Z: {g.headColorZ?.alleles?.join('/')} · 
                      HEAD_YELLOW: {g.headYellow?.alleles?.join('/')} · 
                      BODY_DILUTION: {g.bodyDilution?.alleles?.join('/')} · 
                      BODY_BLUE: {g.bodyBlue?.alleles?.join('/')} · 
                      BREAST: {g.breast?.alleles?.join('/')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className="font-bold text-slate-800 dark:text-slate-200 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
                      data-testid={`cross-genotype-prob-${gIdx}`}
                    >
                      {gOutcome.percentage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedGenotypeDetail(gOutcome)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      title={translateEpistemic(language, 'cross.detail_title')}
                      data-testid={`cross-genotype-detail-btn-${gIdx}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. MODALE DÉTAIL D'UN GÉNOTYPE RÉSULTAT (Section 19) */}
      {selectedGenotypeDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label={translateEpistemic(language, 'cross.detail_title')}
          data-testid="cross-genotype-detail-modal"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Dna className="w-4 h-4 text-indigo-500" />
                <span>{translateEpistemic(language, 'cross.detail_title')}</span>
              </h5>
              <button
                type="button"
                onClick={() => setSelectedGenotypeDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                data-testid="cross-genotype-detail-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="font-semibold">{translateEpistemic(language, 'cross.probability_label')} :</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedGenotypeDetail.percentage}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'HEAD_COLOR_Z' as const, rec: selectedGenotypeDetail.genotype.headColorZ, trans: 'Z_LINKED' as const },
                  { id: 'HEAD_YELLOW' as const, rec: selectedGenotypeDetail.genotype.headYellow, trans: 'AUTOSOMAL' as const },
                  { id: 'BODY_DILUTION' as const, rec: selectedGenotypeDetail.genotype.bodyDilution, trans: 'Z_LINKED' as const },
                  { id: 'BODY_BLUE' as const, rec: selectedGenotypeDetail.genotype.bodyBlue, trans: 'AUTOSOMAL' as const },
                  { id: 'BREAST' as const, rec: selectedGenotypeDetail.genotype.breast, trans: 'AUTOSOMAL' as const }
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1"
                    data-testid={`cross-detail-locus-${item.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <CanonicalLocusBadge locusId={item.id} size="sm" />
                      <span className="text-3xs text-slate-500">
                        {translateEpistemic(language, `transmission.${item.trans}`)}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 pt-1">
                      {translateEpistemic(language, 'cross.alleles_label')} : {item.rec?.alleles?.join(' / ')}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <EpistemicStatusBadge
                        status={item.rec?.certainty || 'GENETICALLY_CONFIRMED'}
                        size="sm"
                        language={language}
                      />
                      {(item.rec as any)?.implementationStatus === 'PROVISIONAL' && (
                        <span className="text-3xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                          {translateEpistemic(language, 'locus.provisional')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedGenotypeDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {translateEpistemic(language, 'drawer.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ALERTES / REVUE HUMAINE & RÉFÉRENTIEL PROVISOIRE (Sections 12 & 14) */}
      <div className="space-y-3">
        {/* Alerte Référentiel provisoire (générique) */}
        {isProvisionalFramework && (
          <div data-testid="cross-provisional-alert">
            <AppAlert
              type="warning"
              title={translateEpistemic(language, 'cross.provisional_framework')}
              className="text-xs"
            >
              <p>{translateEpistemic(language, 'cross.human_review_recommended')}</p>
              <p className="mt-0.5 text-3xs text-amber-700 dark:text-amber-300">
                {translateEpistemic(language, 'locus.provisional_warning')}
              </p>
            </AppAlert>
          </div>
        )}

        {/* Alerte Revue humaine requise */}
        {requiresHumanReview && (
          <div data-testid="cross-human-review-alert">
            <AppAlert
              type="info"
              title={translateEpistemic(language, 'cross.human_review_required')}
              className="text-xs"
            >
              <p>{translateEpistemic(language, 'cross.result_needs_human_review')}</p>
            </AppAlert>
          </div>
        )}

        {/* Avertissements du moteur */}
        {result.warnings && result.warnings.length > 0 && (
          <div
            className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-3xs text-amber-900 dark:text-amber-300 space-y-1"
            data-testid="cross-warnings-panel"
          >
            <div className="font-bold flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Garanties épistémiques et avertissements du moteur</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {result.warnings.map((w: string, wIdx: number) => (
                <li key={`warn-${wIdx}`}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* RAPPEL DÉONTOLOGIQUE ET LIMITES DU CALCUL (Étape 8) */}
        <div
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-3xs text-slate-600 dark:text-slate-400 space-y-1"
          data-testid="cross-pedagogical-notice"
        >
          <div className="font-bold text-slate-700 dark:text-slate-300">
            Limites du calcul et restitution déontologique
          </div>
          <p>
            Modèle mendélien déterministe standard. Les résultats constituent des probabilités théoriques de fécondation, sans prise en compte des facteurs de viabilité embryonnaire ou environnementale.
          </p>
          <p className="italic text-slate-500">
            Zéro score de couple, zéro recommandation d'accouplement (« meilleur accouplement » proscrit). Restitution purement informative.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GouldCrossResultCard;

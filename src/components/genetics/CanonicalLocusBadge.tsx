/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT ATOMIQUE CanonicalLocusBadge
 * Présentation modulaire et fortement typée d'un locus canonique.
 * - Ne déduit JAMAIS le génotype à partir du phénotype ou du statut.
 * - Respecte strictement isProvisional (SANS hardcoder de règle 'BREAST').
 * - Respecte strictement carrierState (masqué si NOT_APPLICABLE ou NONE).
 * - Ne prend aucune décision biologique Z/W.
 */

import React from 'react';
import { AlertCircle, Dna } from 'lucide-react';
import { AppBadge } from '../design-system/AppBadge';
import type { Language } from '../../utils/translations';
import { EpistemicStatusBadge, EpistemicStatusType } from './EpistemicStatusBadge';
import { HumanReviewBadge, HumanReviewStatusType } from './HumanReviewBadge';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';

export type TransmissionModeType =
  | 'Z_LINKED'
  | 'AUTOSOMAL'
  | 'CO_DOMINANT'
  | 'RECESSIVE'
  | 'DOMINANT'
  | 'MULTI_FACTORIAL'
  | string;

export type CarrierStateType =
  | 'NONE'
  | 'POSSIBLE_CARRIER'
  | 'CONFIRMED_CARRIER'
  | 'NOT_APPLICABLE'
  | 'POSSIBLE'
  | 'CONFIRMED'
  | string;

export interface CanonicalLocusBadgeProps {
  locusId: string;
  displayName?: string;
  transmission?: TransmissionModeType;
  status?: EpistemicStatusType;
  humanReviewRequired?: boolean;
  humanReviewStatus?: HumanReviewStatusType;
  isProvisional?: boolean;
  carrierState?: CarrierStateType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  language?: Language;
  showDetails?: boolean;
  'data-testid'?: string;
}

export function CanonicalLocusBadge({
  locusId,
  displayName,
  transmission,
  status,
  humanReviewRequired = false,
  humanReviewStatus,
  isProvisional = false,
  carrierState,
  size = 'md',
  className = '',
  language: explicitLanguage,
  showDetails = true,
  'data-testid': testId,
}: CanonicalLocusBadgeProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  const title = displayName || locusId;

  // Libellé de transmission si fourni
  let transmissionLabel: string | null = null;
  if (transmission === 'Z_LINKED') {
    transmissionLabel = translateEpistemic(language, 'transmission.Z_LINKED');
  } else if (transmission === 'AUTOSOMAL') {
    transmissionLabel = translateEpistemic(language, 'transmission.AUTOSOMAL');
  } else if (transmission === 'CO_DOMINANT') {
    transmissionLabel = translateEpistemic(language, 'transmission.CO_DOMINANT');
  } else if (transmission) {
    transmissionLabel = transmission;
  }

  // Carrier badge condition
  const isConfirmedCarrier = carrierState === 'CONFIRMED_CARRIER' || carrierState === 'CONFIRMED';
  const isPossibleCarrier = carrierState === 'POSSIBLE_CARRIER' || carrierState === 'POSSIBLE';
  const showCarrier = isConfirmedCarrier || isPossibleCarrier;

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''} ${className}`}
      data-testid={testId || `canonical-locus-${locusId}`}
      data-locus-id={locusId}
      data-is-provisional={String(isProvisional)}
    >
      {/* Badge Titre / Identifiant du Locus */}
      <AppBadge
        variant="primary"
        size={size}
        icon={<Dna className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
        data-testid={`locus-name-${locusId}`}
      >
        <span dir={isRtl ? 'rtl' : 'ltr'} className="font-semibold">{title}</span>
      </AppBadge>

      {/* Mode de transmission si renseigné */}
      {transmissionLabel && (
        <AppBadge
          variant="outline"
          size={size === 'lg' ? 'md' : 'sm'}
          className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
          data-testid={`locus-transmission-${locusId}`}
        >
          <span dir={isRtl ? 'rtl' : 'ltr'}>{transmissionLabel}</span>
        </AppBadge>
      )}

      {/* Indicateur de Référentiel Provisoire (ex: BREAST ou tout locus avec isProvisional=true) */}
      {isProvisional && (
        <AppBadge
          variant="warning"
          size={size === 'lg' ? 'md' : 'sm'}
          icon={<AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />}
          className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
          title={translateEpistemic(language, 'locus.provisional_warning')}
          data-testid={`locus-provisional-${locusId}`}
        >
          <span dir={isRtl ? 'rtl' : 'ltr'}>{translateEpistemic(language, 'locus.provisional')}</span>
        </AppBadge>
      )}

      {/* Statut Épistémique */}
      {showDetails && status && (
        <EpistemicStatusBadge
          status={status}
          size={size === 'lg' ? 'md' : 'sm'}
          language={language}
          data-testid={`locus-status-${locusId}`}
        />
      )}

      {/* Badge Porteur si applicable (JAMAIS affiché si NONE ou NOT_APPLICABLE) */}
      {showDetails && showCarrier && (
        <AppBadge
          variant={isConfirmedCarrier ? 'success' : 'outline'}
          size={size === 'lg' ? 'md' : 'sm'}
          data-testid={`locus-carrier-${locusId}`}
        >
          <span dir={isRtl ? 'rtl' : 'ltr'}>
            {translateEpistemic(
              language,
              isConfirmedCarrier ? 'carrier.CONFIRMED_CARRIER' : 'carrier.POSSIBLE_CARRIER'
            )}
          </span>
        </AppBadge>
      )}

      {/* Badge Revue Humaine */}
      {showDetails && (humanReviewRequired || humanReviewStatus) && (
        <HumanReviewBadge
          required={humanReviewRequired}
          status={humanReviewStatus}
          size={size === 'lg' ? 'md' : 'sm'}
          language={language}
          data-testid={`locus-review-${locusId}`}
        />
      )}
    </div>
  );
}

export default CanonicalLocusBadge;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT ATOMIQUE HumanReviewBadge
 * Signalement visuel clair de la nécessité d'une intervention ou validation humaine.
 * Présente les données sans décider lui-même de la règle métier.
 */

import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AppBadge } from '../design-system/AppBadge';
import type { Language } from '../../utils/translations';
import { translateEpistemic, EpistemicTranslationKey } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';

export type HumanReviewStatusType =
  | 'NOT_REVIEWED'
  | 'REVIEW_REQUIRED'
  | 'REVIEWED'
  | 'CONFLICT_REVIEW'
  | 'NOT_REQUIRED'
  | 'RECOMMENDED'
  | 'REQUIRED'
  | string;

export interface HumanReviewBadgeProps {
  required?: boolean;
  status?: HumanReviewStatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  language?: Language;
  'data-testid'?: string;
}

export function HumanReviewBadge({
  required = false,
  status,
  size = 'md',
  className = '',
  showIcon = true,
  language: explicitLanguage,
  'data-testid': testId,
}: HumanReviewBadgeProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  // Détermination de la pertinence de l'affichage
  const isConflict = status === 'CONFLICT_REVIEW';
  const isMandatory = required || status === 'REVIEW_REQUIRED' || status === 'REQUIRED';
  const isRecommended = status === 'RECOMMENDED';
  const isReviewed = status === 'REVIEWED';

  // Si aucune revue n'est requise ni recommandée ni en conflit, ne rien afficher par défaut
  if (!isConflict && !isMandatory && !isRecommended && !isReviewed) {
    return null;
  }

  let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' = 'warning';
  let icon: React.ReactNode = null;
  let translationKey: EpistemicTranslationKey = 'review.REQUIRED';

  if (isConflict) {
    variant = 'danger';
    icon = <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    translationKey = 'review.CONFLICT_REVIEW';
  } else if (isMandatory) {
    variant = 'warning';
    icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    translationKey = 'review.REQUIRED';
  } else if (isRecommended) {
    variant = 'outline';
    icon = <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    translationKey = 'review.RECOMMENDED';
  } else if (isReviewed) {
    variant = 'success';
    icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    translationKey = 'review.REVIEWED';
  }

  const label = translateEpistemic(language, translationKey);

  return (
    <AppBadge
      variant={variant}
      size={size}
      icon={showIcon ? icon : undefined}
      className={`${isRtl ? 'flex-row-reverse' : ''} ${className}`}
      data-testid={testId || 'human-review-badge'}
      data-human-review-required={String(required || isMandatory || isConflict)}
      data-human-review-status={status || (required ? 'REQUIRED' : 'NOT_REQUIRED')}
      title={label}
    >
      <span dir={isRtl ? 'rtl' : 'ltr'}>{label}</span>
    </AppBadge>
  );
}

export default HumanReviewBadge;

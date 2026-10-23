/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT ATOMIQUE EpistemicConfidenceBadge
 * Affichage du degré de confiance épistémique d'une information.
 * Une confiance élevée dans une observation n'est jamais synonyme de confirmation génétique.
 */

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { AppBadge } from '../design-system/AppBadge';
import type { Language } from '../../utils/translations';
import { translateEpistemic, EpistemicTranslationKey } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';

export type EpistemicConfidenceType =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'VERY_LOW'
  | 'UNKNOWN'
  | string;

export interface EpistemicConfidenceBadgeProps {
  confidence?: EpistemicConfidenceType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  language?: Language;
  'data-testid'?: string;
}

export function EpistemicConfidenceBadge({
  confidence = 'UNKNOWN',
  size = 'md',
  className = '',
  showIcon = true,
  language: explicitLanguage,
  'data-testid': testId,
}: EpistemicConfidenceBadgeProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' = 'outline';
  let icon: React.ReactNode = null;
  let translationKey: EpistemicTranslationKey = 'confidence.UNKNOWN';

  switch (confidence) {
    case 'VERY_HIGH':
      variant = 'success';
      icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'confidence.VERY_HIGH';
      break;
    case 'HIGH':
      variant = 'success';
      icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'confidence.HIGH';
      break;
    case 'MEDIUM':
      variant = 'warning';
      icon = <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'confidence.MEDIUM';
      break;
    case 'LOW':
      variant = 'warning';
      icon = <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'confidence.LOW';
      break;
    case 'VERY_LOW':
      variant = 'danger';
      icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'confidence.VERY_LOW';
      break;
    case 'UNKNOWN':
    default:
      variant = 'outline';
      icon = <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'confidence.UNKNOWN';
      break;
  }

  const label = translateEpistemic(language, translationKey);

  return (
    <AppBadge
      variant={variant}
      size={size}
      icon={showIcon ? icon : undefined}
      className={`${isRtl ? 'flex-row-reverse' : ''} ${className}`}
      data-testid={testId || `epistemic-confidence-${confidence}`}
      data-epistemic-confidence={confidence}
      title={label}
    >
      <span dir={isRtl ? 'rtl' : 'ltr'}>{label}</span>
    </AppBadge>
  );
}

export default EpistemicConfidenceBadge;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT ATOMIQUE EpistemicStatusBadge
 * Affichage honnête et non-inférentiel du statut épistémique d'un phénotype/génotype.
 */

import React from 'react';
import {
  Dna,
  Eye,
  User,
  Brain,
  HelpCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { AppBadge } from '../design-system/AppBadge';
import type { Language } from '../../utils/translations';
import {
  translateEpistemic,
  EpistemicTranslationKey,
  getEpistemicStatusPresentation
} from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';

export type EpistemicStatusType =
  | 'GENETICALLY_CONFIRMED'
  | 'CONFIRMED'
  | 'OBSERVED'
  | 'DECLARED'
  | 'INFERRED'
  | 'UNKNOWN'
  | 'NOT_TESTED'
  | 'CONFLICT_REVIEW'
  | 'CONFLICTING'
  | 'REVIEW_REQUIRED'
  | 'NEEDS_HUMAN_REVIEW'
  | 'POSSIBLE_SET'
  | 'PROVISIONAL'
  | 'BLOCKED'
  | 'INSUFFICIENT_INFORMATION'
  | string;

export interface EpistemicStatusBadgeProps {
  status?: EpistemicStatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  language?: Language;
  'data-testid'?: string;
}

export function EpistemicStatusBadge({
  status = 'UNKNOWN',
  size = 'md',
  className = '',
  showIcon = true,
  language: explicitLanguage,
  'data-testid': testId,
}: EpistemicStatusBadgeProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);
  const presentation = getEpistemicStatusPresentation(status, language);

  let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' = presentation.variant;
  let icon: React.ReactNode = null;
  let translationKey: EpistemicTranslationKey = 'status.UNKNOWN';

  switch (status) {
    case 'GENETICALLY_CONFIRMED':
      variant = 'success';
      icon = <Dna className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.GENETICALLY_CONFIRMED';
      break;
    case 'CONFIRMED':
      variant = 'success';
      icon = <Dna className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.CONFIRMED';
      break;
    case 'OBSERVED':
      variant = 'warning';
      icon = <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.OBSERVED';
      break;
    case 'DECLARED':
      variant = 'secondary';
      icon = <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.DECLARED';
      break;
    case 'INFERRED':
      variant = 'accent';
      icon = <Brain className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.INFERRED';
      break;
    case 'NOT_TESTED':
      variant = 'outline';
      icon = <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.NOT_TESTED';
      break;
    case 'CONFLICT_REVIEW':
    case 'CONFLICTING':
      variant = 'danger';
      icon = <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = status === 'CONFLICTING' ? 'status.CONFLICTING' : 'status.CONFLICT_REVIEW';
      break;
    case 'REVIEW_REQUIRED':
    case 'NEEDS_HUMAN_REVIEW':
      variant = 'warning';
      icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = status === 'NEEDS_HUMAN_REVIEW' ? 'status.NEEDS_HUMAN_REVIEW' : 'status.REVIEW_REQUIRED';
      break;
    case 'POSSIBLE_SET':
      variant = 'warning';
      icon = <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.POSSIBLE_SET';
      break;
    case 'PROVISIONAL':
      variant = 'warning';
      icon = <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.PROVISIONAL';
      break;
    case 'BLOCKED':
      variant = 'danger';
      icon = <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.BLOCKED';
      break;
    case 'INSUFFICIENT_INFORMATION':
      variant = 'outline';
      icon = <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.INSUFFICIENT_INFORMATION';
      break;
    case 'UNKNOWN':
    default:
      variant = 'outline';
      icon = <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'status.UNKNOWN';
      break;
  }

  const label = translateEpistemic(language, translationKey);
  const isConfirmed = status === 'GENETICALLY_CONFIRMED' || status === 'CONFIRMED';

  return (
    <AppBadge
      variant={variant}
      size={size}
      icon={showIcon ? icon : undefined}
      className={`${isRtl ? 'flex-row-reverse' : ''} ${className}`}
      data-testid={testId || `epistemic-status-${status}`}
      data-epistemic-status={status}
      data-canonical-status={presentation.canonicalText}
      data-is-confirmed={isConfirmed ? 'true' : 'false'}
      title={`${presentation.canonicalText} — ${presentation.description}`}
      aria-label={`${presentation.canonicalText}: ${presentation.description}`}
    >
      <span dir={isRtl ? 'rtl' : 'ltr'}>{label}</span>
    </AppBadge>
  );
}

export default EpistemicStatusBadge;

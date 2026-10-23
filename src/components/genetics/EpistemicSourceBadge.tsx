/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT ATOMIQUE EpistemicSourceBadge
 * Affichage de la provenance et de la source de preuve d'une donnée génétique.
 * Ne convertit jamais une observation ou déclaration en niveau de certitude.
 */

import React from 'react';
import {
  Dna,
  GitFork,
  Network,
  Eye,
  User,
  Brain,
  History,
  FileQuestion,
} from 'lucide-react';
import { AppBadge } from '../design-system/AppBadge';
import type { Language } from '../../utils/translations';
import { translateEpistemic, EpistemicTranslationKey } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';

export type EpistemicSourceType =
  | 'DNA_TEST'
  | 'PROGENY_TEST_CROSS'
  | 'PARENTAL_PEDIGREE'
  | 'PHENOTYPIC_OBSERVATION'
  | 'USER_DECLARATION'
  | 'SYSTEM_INFERENCE'
  | 'LEGACY_MIGRATION'
  | string;

export interface EpistemicSourceBadgeProps {
  source?: EpistemicSourceType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  language?: Language;
  'data-testid'?: string;
}

export function EpistemicSourceBadge({
  source = 'PHENOTYPIC_OBSERVATION',
  size = 'md',
  className = '',
  showIcon = true,
  language: explicitLanguage,
  'data-testid': testId,
}: EpistemicSourceBadgeProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' = 'outline';
  let icon: React.ReactNode = null;
  let translationKey: EpistemicTranslationKey = 'source.PHENOTYPIC_OBSERVATION';

  switch (source) {
    case 'DNA_TEST':
      variant = 'success';
      icon = <Dna className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.DNA_TEST';
      break;
    case 'PROGENY_TEST_CROSS':
      variant = 'accent';
      icon = <GitFork className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.PROGENY_TEST_CROSS';
      break;
    case 'PARENTAL_PEDIGREE':
      variant = 'outline';
      icon = <Network className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.PARENTAL_PEDIGREE';
      break;
    case 'PHENOTYPIC_OBSERVATION':
      variant = 'warning';
      icon = <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.PHENOTYPIC_OBSERVATION';
      break;
    case 'USER_DECLARATION':
      variant = 'secondary';
      icon = <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.USER_DECLARATION';
      break;
    case 'SYSTEM_INFERENCE':
      variant = 'outline';
      icon = <Brain className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.SYSTEM_INFERENCE';
      break;
    case 'LEGACY_MIGRATION':
      variant = 'outline';
      icon = <History className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.LEGACY_MIGRATION';
      break;
    default:
      variant = 'outline';
      icon = <FileQuestion className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      translationKey = 'source.PHENOTYPIC_OBSERVATION';
      break;
  }

  const label = translateEpistemic(language, translationKey);

  return (
    <AppBadge
      variant={variant}
      size={size}
      icon={showIcon ? icon : undefined}
      className={`${isRtl ? 'flex-row-reverse' : ''} ${className}`}
      data-testid={testId || `epistemic-source-${source}`}
      data-epistemic-source={source}
      title={label}
    >
      <span dir={isRtl ? 'rtl' : 'ltr'}>{label}</span>
    </AppBadge>
  );
}

export default EpistemicSourceBadge;

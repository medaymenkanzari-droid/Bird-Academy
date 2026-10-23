/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Language } from '../../utils/translations';
import { useLanguage } from '../../context/LanguageContext';

export function useEpistemicLanguage(explicitLanguage?: Language): { language: Language; isRtl: boolean } {
  let contextLanguage: Language | undefined;
  let contextIsRtl: boolean | undefined;

  if (!explicitLanguage) {
    try {
      const ctx = useLanguage();
      contextLanguage = ctx.language;
      contextIsRtl = ctx.isRtl;
    } catch {
      // Fallback for unit tests or standalone rendering without LanguageProvider
    }
  }

  const language = explicitLanguage || contextLanguage || 'fr';
  const isRtl = explicitLanguage ? explicitLanguage === 'ar' : (contextIsRtl ?? (language === 'ar'));

  return { language, isRtl };
}

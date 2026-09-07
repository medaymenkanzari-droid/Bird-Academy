/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL WEBSITE I18N CONFIG
 */

import { WebLocale } from '../types';

export const SUPPORTED_LOCALES: WebLocale[] = ['fr', 'en', 'ar', 'es', 'it'];

export const DEFAULT_LOCALE: WebLocale = 'fr';

export const LOCALE_LABELS: Record<WebLocale, { label: string; flag: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  fr: { label: 'Français', flag: '🇫🇷', nativeName: 'Français', dir: 'ltr' },
  en: { label: 'English', flag: '🇬🇧', nativeName: 'English', dir: 'ltr' },
  ar: { label: 'العربية', flag: '🇸🇦', nativeName: 'العربية', dir: 'rtl' },
  es: { label: 'Español', flag: '🇪🇸', nativeName: 'Español', dir: 'ltr' },
  it: { label: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano', dir: 'ltr' },
};

export const LOCALE_METADATA = LOCALE_LABELS;

export function isRtlLocale(locale: WebLocale): boolean {
  return locale === 'ar';
}

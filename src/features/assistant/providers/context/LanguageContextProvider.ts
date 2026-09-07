/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../../../../utils/translations';
import { LanguageContextSummary } from '../../types/context';

const SUPPORTED_LANGUAGES: Language[] = ['fr', 'en', 'ar', 'es', 'it'];

const LOCALE_MAP: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-TN',
  es: 'es-ES',
  it: 'it-IT'
};

export class LanguageContextProvider {
  /**
   * Retrieves active saved language or falls back to French ('fr').
   */
  static getActiveLanguage(): Language {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('bird_academy_language');
        if (saved && (SUPPORTED_LANGUAGES as string[]).includes(saved)) {
          return saved as Language;
        }
      } catch {
        // Fallback to default
      }
    }
    return 'fr';
  }

  /**
   * Determines if the given language is right-to-left.
   */
  static isRtl(language: Language): boolean {
    return language === 'ar';
  }

  /**
   * Builds a LanguageContextSummary structure.
   */
  static getLanguageContext(language?: Language): LanguageContextSummary {
    const lang = language && SUPPORTED_LANGUAGES.includes(language) ? language : this.getActiveLanguage();
    return {
      language: lang,
      isRtl: this.isRtl(lang),
      locale: LOCALE_MAP[lang] || 'fr-FR'
    };
  }

  /**
   * Validates if a language string is supported.
   */
  static isSupported(lang: string): lang is Language {
    return (SUPPORTED_LANGUAGES as string[]).includes(lang);
  }

  /**
   * List of all supported languages.
   */
  static getSupportedLanguages(): Language[] {
    return [...SUPPORTED_LANGUAGES];
  }
}

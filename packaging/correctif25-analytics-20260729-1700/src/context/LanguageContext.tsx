/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, TranslationDict } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bird_academy_language');
    if (saved && ['fr', 'en', 'ar', 'es', 'it'].includes(saved)) {
      return saved as Language;
    }
    return 'fr'; // default
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bird_academy_language', lang);
  };

  const isRtl = language === 'ar';

  // Apply document-level updates for RTL and language support
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  // Translation lookup with variable interpolation
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language];
    let text = dict[key] || TRANSLATIONS['fr'][key] || String(key);

    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.split(`{${k}}`).join(String(val));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, currentLanguage: language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

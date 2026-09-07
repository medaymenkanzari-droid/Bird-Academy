/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — I18N MODULE
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebLocale } from '../types';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isRtlLocale } from './config';
import { fr } from './locales/fr';
import { en } from './locales/en';
import { ar } from './locales/ar';
import { es } from './locales/es';
import { it } from './locales/it';

export const DICTIONARIES: Record<WebLocale, any> = {
  fr,
  en,
  ar,
  es,
  it,
};

export interface WebLanguageContextType {
  locale: WebLocale;
  setLocale: (locale: WebLocale) => void;
  isRtl: boolean;
  t: (path: string, params?: Record<string, string | number>) => string;
  dict: any;
}

const WebLanguageContext = createContext<WebLanguageContextType | null>(null);

export function resolveTranslation(dict: any, path: string, fallbackDict?: any): any {
  const parts = path.split('.');
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }

  if (current !== undefined) return current;

  // Fallback to default dictionary (French) if missing
  if (fallbackDict) {
    let fallback: any = fallbackDict;
    for (const part of parts) {
      if (fallback && typeof fallback === 'object' && part in fallback) {
        fallback = fallback[part];
      } else {
        fallback = undefined;
        break;
      }
    }
    if (fallback !== undefined) return fallback;
  }

  return path;
}

export const WebLanguageProvider: React.FC<{ children: ReactNode; initialLocale?: WebLocale }> = ({
  children,
  initialLocale = DEFAULT_LOCALE,
}) => {
  const [locale, setLocaleState] = useState<WebLocale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bird_academy_web_locale') as WebLocale;
      if (stored && SUPPORTED_LOCALES.includes(stored)) {
        return stored;
      }
      const appLang = localStorage.getItem('bird_academy_language') as WebLocale;
      if (appLang && SUPPORTED_LOCALES.includes(appLang)) {
        return appLang;
      }
    }
    return initialLocale;
  });

  const isRtl = isRtlLocale(locale);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
      if (isRtl) {
        document.documentElement.classList.add('font-arabic');
      } else {
        document.documentElement.classList.remove('font-arabic');
      }
    }
  }, [locale, isRtl]);

  const setLocale = (newLocale: WebLocale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bird_academy_web_locale', newLocale);
    }
  };

  const dict = DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
  const fallbackDict = DICTIONARIES[DEFAULT_LOCALE];

  const t = (path: string, params?: Record<string, string | number>): any => {
    let text = resolveTranslation(dict, path, fallbackDict);
    if (typeof text === 'string' && params) {
      Object.entries(params).forEach(([key, val]) => {
        text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
      });
    }
    return text;
  };

  return (
    <WebLanguageContext.Provider value={{ locale, setLocale, isRtl, t, dict }}>
      {children}
    </WebLanguageContext.Provider>
  );
};

export function useWebLanguage(): WebLanguageContextType {
  const context = useContext(WebLanguageContext);
  if (!context) {
    const dict = DICTIONARIES[DEFAULT_LOCALE];
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      isRtl: false,
      t: (path: string) => resolveTranslation(dict, path),
      dict,
    };
  }
  return context;
}

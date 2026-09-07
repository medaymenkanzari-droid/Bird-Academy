/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — LANGUAGE SELECTOR
 */

import React, { useState, useRef, useEffect } from 'react';
import { useWebLanguage } from '../../i18n';
import { SUPPORTED_LOCALES, LOCALE_LABELS } from '../../i18n/config';
import { WebLocale } from '../../types';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSelector: React.FC<{ variant?: 'header' | 'footer' | 'pill' }> = ({ variant = 'header' }) => {
  const { locale, setLocale, isRtl } = useWebLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentInfo = LOCALE_LABELS[locale] || LOCALE_LABELS.fr;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} data-testid="web-language-selector">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as WebLocale)}
        className="sr-only"
        data-testid="language-selector"
        aria-label="Language Selector"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]?.nativeName || loc}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
          variant === 'footer'
            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
        aria-expanded={isOpen}
        aria-label="Select Language"
        data-testid="language-selector-btn"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="text-sm">{currentInfo.flag}</span>
        <span className="hidden sm:inline">{currentInfo.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            isRtl ? 'left-0' : 'right-0'
          } mt-2 w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1.5 focus:outline-none`}
          role="menu"
          data-testid="language-dropdown-menu"
        >
          {SUPPORTED_LOCALES.map((loc) => {
            const info = LOCALE_LABELS[loc];
            const isSelected = loc === locale;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
                role="menuitem"
                data-testid={`select-lang-${loc}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{info.flag}</span>
                  <span>{info.nativeName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

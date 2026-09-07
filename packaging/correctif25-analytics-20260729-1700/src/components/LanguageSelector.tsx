/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../utils/translations';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dark';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'compact' }) => {
  const { language, setLanguage, isRtl } = useLanguage();

  const options: { value: Language; label: string; flag: string }[] = [
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' }
  ];

  if (variant === 'dark') {
    return (
      <div className="flex items-center gap-2 bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/50 rounded-xl px-2.5 py-1.5 transition-colors">
        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer w-full pr-1 font-sans"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200 text-xs font-sans">
              {opt.flag} &nbsp; {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 transition-all shadow-2xs">
      <Globe className="w-4 h-4 text-slate-500 shrink-0" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent text-slate-700 text-xs font-bold focus:outline-hidden cursor-pointer font-sans"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-800 text-xs font-sans">
            {opt.flag} &nbsp; {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

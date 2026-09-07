/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Coins, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AnalyticsSettingsRepository } from '../features/analytics/repositories/AnalyticsSettingsRepository';

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  name: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'TND', symbol: 'DT', label: 'TND (DT)', name: 'Dinar Tunisien', decimals: 3 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', name: 'Euro', decimals: 2 },
  { code: 'USD', symbol: '$', label: 'USD ($)', name: 'Dollar US', decimals: 2 },
  { code: 'DZD', symbol: 'DA', label: 'DZD (DA)', name: 'Dinar Algérien', decimals: 2 },
  { code: 'MAD', symbol: 'DH', label: 'MAD (DH)', name: 'Dirham Marocain', decimals: 2 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', name: 'Livre Sterling', decimals: 2 },
];

interface CurrencySelectorProps {
  onCurrencyChange?: (newCurrency: string) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ onCurrencyChange }) => {
  const { t } = useLanguage();
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    return AnalyticsSettingsRepository.getSettings().currency || localStorage.getItem('bird_academy_currency') || 'TND';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const current = AnalyticsSettingsRepository.getSettings().currency || 'TND';
      setSelectedCurrency(current);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bird_academy_currency_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bird_academy_currency_changed', handleStorageChange);
    };
  }, []);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    const settings = AnalyticsSettingsRepository.getSettings();
    AnalyticsSettingsRepository.saveSettings({ ...settings, currency: code });
    localStorage.setItem('bird_academy_currency', code);
    window.dispatchEvent(new CustomEvent('bird_academy_currency_changed', { detail: { currency: code } }));
    if (onCurrencyChange) {
      onCurrencyChange(code);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {t('settingsCurrencyTitle')}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t('settingsCurrencySub')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
        {SUPPORTED_CURRENCIES.map((curr) => {
          const isSelected = selectedCurrency === curr.code;
          return (
            <button
              key={curr.code}
              type="button"
              onClick={() => handleSelect(curr.code)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-500 dark:text-indigo-400 font-bold shadow-2xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex flex-col text-start">
                <span className="font-bold text-slate-900 dark:text-white">{curr.label}</span>
                <span className="text-[10px] text-slate-400 font-normal">{curr.name}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

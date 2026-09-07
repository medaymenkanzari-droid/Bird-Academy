/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — CURRENCY SELECTOR
 */

import React, { useState, useRef, useEffect } from 'react';
import { Coins, ChevronDown, Check } from 'lucide-react';

import { useWebCurrency, COMMERCIAL_CURRENCIES } from '../../context/CommercialCurrencyContext';

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyOption[] = Object.values(COMMERCIAL_CURRENCIES).map((c) => ({
  code: c.code,
  symbol: c.symbol,
  label: c.label,
}));

export const CurrencySelector: React.FC<{
  currentCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}> = ({ currentCurrency, onCurrencyChange }) => {
  const { currency, setCurrency, availableCurrencies } = useWebCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentCurrency && currentCurrency !== currency) {
      setCurrency(currentCurrency);
    }
  }, [currentCurrency]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setCurrency(code);
    if (onCurrencyChange) {
      onCurrencyChange(code);
    }
    setIsOpen(false);
  };

  const selectedOpt = availableCurrencies.find((c) => c.code === currency) || availableCurrencies[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} data-testid="web-currency-selector">
      <select
        value={currency}
        onChange={(e) => handleSelect(e.target.value)}
        className="sr-only"
        data-testid="currency-selector"
        aria-label="Currency Selector"
      >
        {CURRENCIES.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        aria-expanded={isOpen}
        aria-label="Select Currency"
        data-testid="currency-selector-btn"
      >
        <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>{selectedOpt.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1.5 focus:outline-none"
          role="menu"
          data-testid="currency-dropdown-menu"
        >
          {CURRENCIES.map((curr) => {
            const isSelected = curr.code === currency;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => handleSelect(curr.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
                role="menuitem"
                data-testid={`select-currency-${curr.code}`}
              >
                <span>{curr.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

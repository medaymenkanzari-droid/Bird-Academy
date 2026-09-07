/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL CURRENCY CONTEXT
 * Centralized reactive currency state and commercial conversion rates.
 */

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { formatCurrency } from '../../../utils/currencyFormatter';
import { useWebLanguage } from '../i18n';

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  rateFromEur: number;
  decimals: number;
}

export const COMMERCIAL_CURRENCIES: Record<string, CurrencyOption> = {
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (EUR €)', rateFromEur: 1.0, decimals: 2 },
  TND: { code: 'TND', symbol: 'DT', label: 'Dinar Tunisien (TND DT)', rateFromEur: 3.35, decimals: 3 },
  USD: { code: 'USD', symbol: '$', label: 'Dollar US (USD $)', rateFromEur: 1.08, decimals: 2 },
  DZD: { code: 'DZD', symbol: 'DA', label: 'Dinar Algérien (DZD DA)', rateFromEur: 145.0, decimals: 2 },
  MAD: { code: 'MAD', symbol: 'DH', label: 'Dirham Marocain (MAD DH)', rateFromEur: 10.8, decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', label: 'Livre Sterling (GBP £)', rateFromEur: 0.85, decimals: 2 },
};

export interface CommercialCurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  currencyConfig: CurrencyOption;
  availableCurrencies: CurrencyOption[];
  convertPrice: (amountInEur: number) => number;
  formatPrice: (amountInEur: number, showSymbol?: boolean) => string;
}

const CommercialCurrencyContext = createContext<CommercialCurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'bird_academy_web_currency';

export const WebCurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { locale } = useWebLanguage();
  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && COMMERCIAL_CURRENCIES[saved.toUpperCase()]) {
        return saved.toUpperCase();
      }
    }
    return 'EUR';
  });

  const setCurrency = (code: string) => {
    const validCode = COMMERCIAL_CURRENCIES[code.toUpperCase()] ? code.toUpperCase() : 'EUR';
    setCurrencyState(validCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, validCode);
    }
  };

  const currencyConfig = useMemo(() => {
    return COMMERCIAL_CURRENCIES[currency] || COMMERCIAL_CURRENCIES.EUR;
  }, [currency]);

  const availableCurrencies = useMemo(() => {
    return Object.values(COMMERCIAL_CURRENCIES);
  }, []);

  const convertPrice = (amountInEur: number): number => {
    if (amountInEur === 0) return 0;
    const rate = currencyConfig.rateFromEur;
    const converted = amountInEur * rate;
    const factor = Math.pow(10, currencyConfig.decimals);
    return Math.round(converted * factor) / factor;
  };

  const formatPrice = (amountInEur: number, showSymbol: boolean = true): string => {
    if (amountInEur === 0) {
      return formatCurrency(0, currency, showSymbol, locale);
    }
    const converted = convertPrice(amountInEur);
    return formatCurrency(converted, currency, showSymbol, locale);
  };

  const contextValue: CommercialCurrencyContextType = {
    currency,
    setCurrency,
    currencyConfig,
    availableCurrencies,
    convertPrice,
    formatPrice,
  };

  return (
    <CommercialCurrencyContext.Provider value={contextValue}>
      {children}
    </CommercialCurrencyContext.Provider>
  );
};

export function useWebCurrency(): CommercialCurrencyContextType {
  const context = useContext(CommercialCurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider
    const defaultConfig = COMMERCIAL_CURRENCIES.EUR;
    return {
      currency: 'EUR',
      setCurrency: () => {},
      currencyConfig: defaultConfig,
      availableCurrencies: Object.values(COMMERCIAL_CURRENCIES),
      convertPrice: (amt) => amt,
      formatPrice: (amt, showSymbol = true) => formatCurrency(amt, 'EUR', showSymbol, 'fr'),
    };
  }
  return context;
}

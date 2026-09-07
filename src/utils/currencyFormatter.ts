/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Currency Formatting System for Bird Academy Enterprise.
 */

export interface CurrencyConfig {
  code: string;
  decimals: number;
  symbol: string;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  TND: { code: 'TND', decimals: 3, symbol: 'DT' },
  DT: { code: 'TND', decimals: 3, symbol: 'DT' },
  EUR: { code: 'EUR', decimals: 2, symbol: '€' },
  USD: { code: 'USD', decimals: 2, symbol: '$' },
  GBP: { code: 'GBP', decimals: 2, symbol: '£' },
  CAD: { code: 'CAD', decimals: 2, symbol: '$' },
  SAR: { code: 'SAR', decimals: 2, symbol: 'SR' },
  AED: { code: 'AED', decimals: 2, symbol: 'AED' },
  DZD: { code: 'DZD', decimals: 2, symbol: 'DA' },
  MAD: { code: 'MAD', decimals: 2, symbol: 'DH' },
};

/**
 * Map language codes (fr, en, ar, es, it) to BCP 47 locales.
 */
export const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-TN',
  es: 'es-ES',
  it: 'it-IT',
};

/**
 * Gets the configured decimal places for a currency code.
 */
export function getCurrencyDecimals(currencyCode?: string): number {
  const code = (currencyCode || 'TND').toUpperCase().trim();
  return CURRENCY_CONFIGS[code]?.decimals ?? (code === 'TND' || code === 'DT' ? 3 : 2);
}

/**
 * Formats a monetary amount according to currency decimal rules and optional locale.
 * 
 * @param amount Number to format
 * @param currencyCode Currency code (default TND)
 * @param showSymbol Whether to append currency symbol (default true)
 * @param locale Language code (fr, en, ar, es, it) or BCP 47 locale tag
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string, 
  currencyCode: string = 'TND', 
  showSymbol: boolean = true,
  locale?: string
): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  const validNum = isNaN(num) ? 0 : num;
  
  const code = (currencyCode || 'TND').toUpperCase().trim();
  const config = CURRENCY_CONFIGS[code] || { code, decimals: code === 'TND' || code === 'DT' ? 3 : 2, symbol: code };
  
  if (locale) {
    const targetLocale = LOCALE_MAP[locale] || locale;
    const isoCodeMap: Record<string, string> = {
      DT: 'TND',
      TND: 'TND',
      EUR: 'EUR',
      USD: 'USD',
      GBP: 'GBP',
      CAD: 'CAD',
      SAR: 'SAR',
      AED: 'AED',
      DZD: 'DZD',
      MAD: 'MAD',
    };

    const isoCode = isoCodeMap[code] || code;

    try {
      const formatter = new Intl.NumberFormat(targetLocale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: isoCode,
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals,
      });
      return formatter.format(validNum);
    } catch {
      const formattedNum = validNum.toLocaleString(targetLocale, {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals,
      });
      return showSymbol ? `${formattedNum} ${config.symbol}` : formattedNum;
    }
  }

  const formatted = validNum.toFixed(config.decimals);
  return showSymbol ? `${formatted} ${config.symbol}` : formatted;
}


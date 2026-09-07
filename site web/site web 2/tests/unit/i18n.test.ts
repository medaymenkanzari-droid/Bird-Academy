import { describe, it, expect } from 'vitest';
import fr from '@/i18n/locales/fr.json';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import es from '@/i18n/locales/es.json';
import itLocale from '@/i18n/locales/it.json';

const dictionaries: Record<string, Record<string, unknown>> = { fr, en, ar, es, it: itLocale };

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getAllKeys(val as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('Audit Qualité & Intégrité Multilingue (i18n)', () => {
  const referenceKeys = getAllKeys(fr);

  Object.entries(dictionaries).forEach(([lang, dict]) => {
    it(`[${lang.toUpperCase()}] doit contenir exactement toutes les clés de référence (FR)`, () => {
      const currentKeys = getAllKeys(dict);
      const missingKeys = referenceKeys.filter((k) => !currentKeys.includes(k));
      expect(missingKeys).toHaveLength(0);
    });

    it(`[${lang.toUpperCase()}] aucune clé ne doit être vide`, () => {
      const checkEmpty = (o: Record<string, unknown>) => {
        for (const [_, val] of Object.entries(o)) {
          if (typeof val === 'string') {
            expect(val.trim().length).toBeGreaterThan(0);
          } else if (typeof val === 'object' && val !== null) {
            checkEmpty(val as Record<string, unknown>);
          }
        }
      };
      checkEmpty(dict);
    });
  });

  it('Les tarifs non définis doivent respecter strictement [À DÉFINIR]', () => {
    ['fr', 'en', 'ar', 'es', 'it'].forEach((lang) => {
      const dict = dictionaries[lang] as any;
      expect(dict.pricingPage.tiers.premium.price).toBe('À DÉFINIR');
      expect(dict.pricingPage.tiers.pro.price).toBe('À DÉFINIR');
    });
  });
});

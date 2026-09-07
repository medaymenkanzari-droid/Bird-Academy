import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS } from '../src/utils/translations';

describe('MISSION V1.3.4 — I18N DETAILS TRANSLATIONS COVERAGE', () => {
  const supportedLangs = ['fr', 'en', 'ar', 'es', 'it'] as const;

  it('I18N-01: Expenses categories and detail keys exist in all 5 languages', () => {
    const requiredKeys = [
      'depenses',
      'statistiques',
      'chiffreAffaires'
    ];

    supportedLangs.forEach(lang => {
      requiredKeys.forEach(key => {
        assert.ok(TRANSLATIONS[lang][key], `Missing key '${key}' in language '${lang}'`);
      });
    });
  });

  it('I18N-02: Sales buyer and sales ledger keys exist in all 5 languages', () => {
    const requiredKeys = [
      'ventes',
      'registreVentes',
      'enregistrerVente',
      'chiffreAffaires'
    ];

    supportedLangs.forEach(lang => {
      requiredKeys.forEach(key => {
        assert.ok(TRANSLATIONS[lang][key], `Missing key '${key}' in language '${lang}'`);
      });
    });
  });

  it('I18N-03: Health treatment and record keys exist in all 5 languages', () => {
    const requiredKeys = [
      'sante',
      'santeTitle',
      'registerSoin'
    ];

    supportedLangs.forEach(lang => {
      requiredKeys.forEach(key => {
        assert.ok(TRANSLATIONS[lang][key], `Missing key '${key}' in language '${lang}'`);
      });
    });
  });

  it('I18N-04 & I18N-05: Arabic RTL translations contain proper Arabic text', () => {
    assert.strictEqual(TRANSLATIONS.ar.depenses, 'المصاريف');
    assert.strictEqual(TRANSLATIONS.ar.ventes, 'المبيعات');
    assert.strictEqual(TRANSLATIONS.ar.sante, 'السجل الطبي');
    assert.strictEqual(TRANSLATIONS.ar.parametres, 'الإعدادات');
  });
});

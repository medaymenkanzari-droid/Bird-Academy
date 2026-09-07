/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * V1.3.3 MOBILE QA ROOT FIX - TEST SUITE 07
 * Financial & Health I18n Details Translation Test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS } from '../src/utils/translations.ts';

describe('V1.3.3 - BUG-10, 11, 12 Financial & Health I18n Details Translation', () => {
  const supportedLangs = ['fr', 'en', 'ar', 'es', 'it'] as const;

  it('should contain expense category translation keys across all 5 languages', () => {
    const expenseKeys = [
      'expense.categories.food',
      'expense.categories.health',
      'expense.categories.equipment',
      'expense.categories.cages',
      'expense.categories.other',
    ];

    supportedLangs.forEach(lang => {
      const dict = TRANSLATIONS[lang] as any;
      assert.ok(dict !== undefined);
      expenseKeys.forEach(key => {
        assert.ok(dict[key] !== undefined);
        assert.strictEqual(typeof dict[key], 'string');
      });
    });
  });

  it('should contain sale category translation keys across all 5 languages', () => {
    const saleKeys = [
      'sales.categories.amateur',
      'sales.categories.store',
      'sales.categories.exhibition',
      'sales.categories.other',
    ];

    supportedLangs.forEach(lang => {
      const dict = TRANSLATIONS[lang] as any;
      assert.ok(dict !== undefined);
      saleKeys.forEach(key => {
        assert.ok(dict[key] !== undefined);
        assert.strictEqual(typeof dict[key], 'string');
      });
    });
  });

  it('should contain health treatment & status translation keys across all 5 languages', () => {
    const healthKeys = [
      'health.treatments.vitamins',
      'health.treatments.dewormer',
      'health.treatments.coccidiosis',
      'health.treatments.mites',
      'health.treatments.antibiotics',
      'health.treatments.preventive',
      'health.status.pending',
      'health.status.completed',
      'health.actions.validate',
      'health.actions.delete',
    ];

    supportedLangs.forEach(lang => {
      const dict = TRANSLATIONS[lang] as any;
      assert.ok(dict !== undefined);
      healthKeys.forEach(key => {
        assert.ok(dict[key] !== undefined);
        assert.strictEqual(typeof dict[key], 'string');
      });
    });
  });
});

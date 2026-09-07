/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * V1.3.3 MOBILE QA ROOT FIX - TEST SUITE 06
 * Nutrition Module Offline Default Plans Test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INITIAL_ALIMENTATION } from '../src/data/defaultData.ts';

describe('V1.3.3 - BUG-09 Nutrition Module Offline Initial Data', () => {
  it('should guarantee INITIAL_ALIMENTATION provides default feed plans for all 3 breeding periods', () => {
    assert.strictEqual(INITIAL_ALIMENTATION.length, 3);
    const periods = INITIAL_ALIMENTATION.map(a => a.periode);
    assert.ok(periods.includes('Reproduction'));
    assert.ok(periods.includes('Mue'));
    assert.ok(periods.includes('Repos'));
  });

  it('should ensure each default feed plan has valid stock and distribution details', () => {
    INITIAL_ALIMENTATION.forEach(plan => {
      assert.ok(plan.id > 0);
      assert.ok(plan.type_aliment.length > 5);
      assert.ok(plan.stock_actuel_kg > 0);
    });
  });
});

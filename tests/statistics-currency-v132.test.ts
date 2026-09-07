import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatCurrency } from '../src/utils/currencyFormatter';

describe('V1.3.2 Extended - Financial Monetary Formatting (BUG-02)', () => {
  it('formats TND / DT with 3 decimal places', () => {
    assert.strictEqual(formatCurrency(125, 'TND'), '125.000 DT');
    assert.strictEqual(formatCurrency(125.5, 'TND'), '125.500 DT');
  });

  it('formats EUR with 2 decimal places and symbol', () => {
    assert.strictEqual(formatCurrency(125, 'EUR'), '125.00 €');
  });

  it('formats USD with 2 decimal places and symbol', () => {
    assert.strictEqual(formatCurrency(125, 'USD'), '125.00 $');
  });
});

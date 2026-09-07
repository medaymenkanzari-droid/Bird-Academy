import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('V1.3.2 Extended - Multilingual Content Localization (BUG-07, 08, 09, 10, 12)', () => {
  it('verifies Health module has localized treatment mapping', () => {
    const santePath = path.join(process.cwd(), 'src/components/Sante.tsx');
    const content = fs.readFileSync(santePath, 'utf-8');
    assert.ok(content.includes('TREATMENT_NAMES'));
  });

  it('verifies Nutrition module has localized food type mapping', () => {
    const alimPath = path.join(process.cwd(), 'src/components/Alimentation.tsx');
    const content = fs.readFileSync(alimPath, 'utf-8');
    assert.ok(content.includes('FOOD_LABEL_MAP'));
  });

  it('verifies Depenses module has localized expense descriptions', () => {
    const depPath = path.join(process.cwd(), 'src/components/Depenses.tsx');
    const content = fs.readFileSync(depPath, 'utf-8');
    assert.ok(content.includes('EXPENSE_DESC_MAP'));
  });

  it('verifies Ventes module has localized buyer names', () => {
    const ventPath = path.join(process.cwd(), 'src/components/Ventes.tsx');
    const content = fs.readFileSync(ventPath, 'utf-8');
    assert.ok(content.includes('BUYER_NAME_MAP'));
  });
});

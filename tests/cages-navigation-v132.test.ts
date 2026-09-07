import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('V1.3.2 Extended - Cages Back Navigation Fix (BUG-01)', () => {
  it('verifies Cages component handles history state and popstate for Android physical back button', () => {
    const filePath = path.join(process.cwd(), 'src/components/Cages.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes("window.history.pushState({ cageDetail: cage.id }, '')"));
    assert.ok(content.includes("window.addEventListener('popstate', handlePopState)"));
    assert.ok(content.includes('setSelectedCageId(null)'));
  });
});

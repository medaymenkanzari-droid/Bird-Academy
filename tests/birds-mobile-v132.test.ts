import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('V1.3.2 Extended - Birds Module Title V2, Dark Mode & Modal (BUG-04, 05, 06)', () => {
  it('verifies V2 suffix is removed from Canaris titles across languages', () => {
    const filePath = path.join(process.cwd(), 'src/components/Canaris.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.strictEqual(content.includes('Oiseaux V2'), false);
    assert.strictEqual(content.includes('Birds V2'), false);
    assert.strictEqual(content.includes('الطيور V2'), false);
  });

  it('verifies selected bird details card is presented inside AppModal / BirdDetailModal', () => {
    const filePath = path.join(process.cwd(), 'src/components/Canaris.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('<BirdDetailModal') || content.includes('<AppModal'));
    assert.ok(content.includes('bird={selectedBird}') || content.includes('isOpen={selectedBird !== null}'));
    assert.ok(content.includes('onClose={() => setSelectedBird(null)}'));
  });
});

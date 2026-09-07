import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('MISSION V1.3.4 — MOBILE OVERFLOW CONTAINERS AUDIT', () => {
  const filePaths = [
    'src/features/analytics/components/AnalyticsDashboard.tsx',
    'src/features/genetics/components/GeneticsDashboard.tsx',
    'src/components/ReferenceBiologique.tsx',
    'src/features/intelligence/dashboards/IntelligenceDashboard.tsx'
  ];

  it('OVERFLOW-01..04: Verify all target dashboards contain local horizontal scroll container with min-w-0 and overflow-x-auto', () => {
    filePaths.forEach((relPath) => {
      const fullPath = path.resolve(relPath);
      const content = fs.readFileSync(fullPath, 'utf8');

      assert.ok(content.includes('overflow-x-auto'), `File ${relPath} missing overflow-x-auto`);
      assert.ok(content.includes('min-w-0'), `File ${relPath} missing min-w-0 container rule`);
      assert.ok(content.includes('flex-nowrap') || content.includes('shrink-0'), `File ${relPath} missing shrink-0 or flex-nowrap rule`);
    });
  });
});

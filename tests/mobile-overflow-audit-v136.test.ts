import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('MISSION BUG-04 & BUG-05 — MOBILE OVERFLOW ROOT FIX AUDIT', () => {
  const analyticsFile = fs.readFileSync(path.join(process.cwd(), 'src/features/analytics/components/AnalyticsDashboard.tsx'), 'utf-8');
  const reportFile = fs.readFileSync(path.join(process.cwd(), 'src/features/analytics/reports/ReportBuilder.tsx'), 'utf-8');
  const graphEngineFile = fs.readFileSync(path.join(process.cwd(), 'src/features/analytics/charts/GraphEngine.tsx'), 'utf-8');
  const geneticsFile = fs.readFileSync(path.join(process.cwd(), 'src/features/genetics/components/GeneticsDashboard.tsx'), 'utf-8');
  const referenceFile = fs.readFileSync(path.join(process.cwd(), 'src/components/ReferenceBiologique.tsx'), 'utf-8');
  const intelFile = fs.readFileSync(path.join(process.cwd(), 'src/features/intelligence/dashboards/IntelligenceDashboard.tsx'), 'utf-8');
  const indexCss = fs.readFileSync(path.join(process.cwd(), 'src/index.css'), 'utf-8');

  it('OVR-01: No global body overflow-x-hidden mask in CSS', () => {
    assert.strictEqual(indexCss.includes('body { overflow-x: hidden }'), false, 'Body overflow-x-hidden mask must NOT be present');
    assert.strictEqual(indexCss.includes('html { overflow-x: hidden }'), false, 'Html overflow-x-hidden mask must NOT be present');
  });

  it('OVR-02: AnalyticsDashboard tab bar & filter panel header use min-w-0 max-w-full touch-pan-x', () => {
    assert.strictEqual(analyticsFile.includes('touch-pan-x'), true, 'Analytics tab bar must include touch-pan-x');
    assert.strictEqual(analyticsFile.includes('flex flex-wrap items-center justify-between gap-2'), true, 'Filter panel header must use flex-wrap on mobile');
    assert.strictEqual(analyticsFile.includes('min-w-0 max-w-full'), true, 'Grid containers must enforce min-w-0 max-w-full');
  });

  it('OVR-03: ReportBuilder uses responsive p-4 sm:p-8 and flex-wrap controls', () => {
    assert.strictEqual(reportFile.includes('p-4 sm:p-8'), true, 'Report sheet padding must adapt to mobile viewports');
    assert.strictEqual(reportFile.includes('flex flex-wrap items-center gap-2 min-w-0'), true, 'Export buttons must wrap on mobile');
  });

  it('OVR-04: GraphEngine enforces w-full max-w-full min-w-0 overflow-hidden on all chart wrappers', () => {
    assert.strictEqual(graphEngineFile.includes('w-full max-w-full min-w-0 overflow-hidden'), true, 'GraphEngine chart wrappers must enforce max-w-full min-w-0 overflow-hidden');
  });

  it('OVR-05: GeneticsDashboard uses touch-pan-x for local tab scrolling', () => {
    assert.strictEqual(geneticsFile.includes('touch-pan-x'), true, 'Genetics tabs bar must include touch-pan-x');
  });

  it('OVR-06: ReferenceBiologique uses touch-pan-x and flex-wrap metadata badges', () => {
    assert.strictEqual(referenceFile.includes('touch-pan-x'), true, 'ReferenceBiologique tabs must include touch-pan-x');
    assert.strictEqual(referenceFile.includes('flex flex-wrap gap-x-3 gap-y-1'), true, 'Scientific traceability metadata must flex-wrap on mobile');
  });

  it('OVR-07: IntelligenceDashboard uses responsive hero KPI card and touch-pan-x', () => {
    assert.strictEqual(intelFile.includes('w-full sm:w-auto'), true, 'Hero KPI card must wrap to w-full on mobile');
    assert.strictEqual(intelFile.includes('touch-pan-x'), true, 'Intelligence tabs must include touch-pan-x');
  });
});

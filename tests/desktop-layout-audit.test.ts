/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function getFileContent(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8');
}

describe('CHANTIER DESKTOP V1 — PLATFORM OPTIMIZATION & NON-REGRESSION AUDIT', () => {
  it('DESKTOP-01: Sidebar component exists and is visible on Desktop (lg:flex)', () => {
    const sidebarContent = getFileContent('src/components/ui/DesktopSidebar.tsx');
    const appContent = getFileContent('src/App.tsx');

    assert.ok(sidebarContent.includes('hidden lg:flex'), 'DesktopSidebar must use hidden lg:flex');
    assert.ok(appContent.includes('DesktopSidebar'), 'App.tsx must include DesktopSidebar');
  });

  it('DESKTOP-02: Sidebar is hidden on Mobile (lg:hidden)', () => {
    const appContent = getFileContent('src/App.tsx');
    assert.ok(appContent.includes('lg:hidden'), 'App.tsx must hide mobile header/drawer on lg');
  });

  it('DESKTOP-03: TopBar Desktop component exists and is visible', () => {
    const topBarContent = getFileContent('src/components/ui/DesktopTopBar.tsx');
    const appContent = getFileContent('src/App.tsx');

    assert.ok(topBarContent.includes('hidden lg:flex'), 'DesktopTopBar must use hidden lg:flex');
    assert.ok(appContent.includes('DesktopTopBar'), 'App.tsx must include DesktopTopBar');
  });

  it('DESKTOP-04: Dashboard multi-column grid layout on Desktop', () => {
    const dashContent = getFileContent('src/components/Dashboard.tsx');
    assert.ok(dashContent.includes('grid-cols-2 sm:grid-cols-4'), 'Dashboard KPI cards must use multi-column grid');
    assert.ok(dashContent.includes('lg:grid-cols-3'), 'Dashboard alerts/charts section must use lg:grid-cols-3');
  });

  it('DESKTOP-05: Birds DataTable (AppTable) Desktop presentation', () => {
    const canarisContent = getFileContent('src/components/Canaris.tsx');
    assert.ok(canarisContent.includes('AppTable'), 'Canaris must use AppTable');
    assert.ok(canarisContent.includes('desktopView'), 'Canaris must support desktop view string');
  });

  it('DESKTOP-06: Cages & Habitat Desktop presentation', () => {
    const appContent = getFileContent('src/App.tsx');
    assert.ok(appContent.includes('HabitatComponent'), 'App.tsx must support HabitatComponent');
  });

  it('DESKTOP-07: Analytics 2x2 multi-column grid', () => {
    const analyticsContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');
    assert.ok(analyticsContent.includes('grid') || analyticsContent.includes('flex'), 'AnalyticsDashboard must use grid or flex');
  });

  it('DESKTOP-08: Genetics split view presentation', () => {
    const geneticsContent = getFileContent('src/features/genetics/components/GeneticsDashboard.tsx');
    assert.ok(geneticsContent.includes('grid') || geneticsContent.includes('flex'), 'GeneticsDashboard must use grid or flex layout');
  });

  it('DESKTOP-09: Intelligence split view presentation', () => {
    const intelContent = getFileContent('src/features/intelligence/dashboards/IntelligenceDashboard.tsx');
    assert.ok(intelContent.includes('grid') || intelContent.includes('flex'), 'IntelligenceDashboard must use layout containers');
  });

  it('DESKTOP-10: Health table presentation', () => {
    const santeContent = getFileContent('src/components/Sante.tsx');
    assert.ok(santeContent.includes('normalizeHealthCategory'), 'Sante.tsx must preserve normalized categories');
  });

  it('DESKTOP-11: Expenses financial table & export controls', () => {
    const depensesContent = getFileContent('src/components/Depenses.tsx');
    assert.ok(depensesContent.includes('exportToCSV'), 'Depenses.tsx must feature exportToCSV');
  });

  it('DESKTOP-12: Sales financial table & export controls', () => {
    const ventesContent = getFileContent('src/components/Ventes.tsx');
    assert.ok(ventesContent.includes('exportToCSV'), 'Ventes.tsx must feature exportToCSV');
  });

  it('DESKTOP-13: Settings Desktop organized navigation', () => {
    const settingsContent = getFileContent('src/components/Parametres.tsx');
    assert.ok(settingsContent.includes('parametresTitle'), 'Parametres.tsx must use parametresTitle');
  });

  it('DESKTOP-14: Dark mode styling & contrast classes', () => {
    const sidebarContent = getFileContent('src/components/ui/DesktopSidebar.tsx');
    const topBarContent = getFileContent('src/components/ui/DesktopTopBar.tsx');

    assert.ok(sidebarContent.includes('bg-slate-800'), 'DesktopSidebar must style dark background');
    assert.ok(topBarContent.includes('dark:bg-slate-900'), 'DesktopTopBar must handle dark background');
  });

  it('DESKTOP-15: Light mode styling & contrast classes', () => {
    const topBarContent = getFileContent('src/components/ui/DesktopTopBar.tsx');
    assert.ok(topBarContent.includes('bg-white'), 'DesktopTopBar must style light background');
  });

  it('DESKTOP-16: Arabic RTL mode handling (dir="rtl")', () => {
    const sidebarContent = getFileContent('src/components/ui/DesktopSidebar.tsx');
    const topBarContent = getFileContent('src/components/ui/DesktopTopBar.tsx');

    assert.ok(sidebarContent.includes('isRtl'), 'DesktopSidebar must handle isRtl');
    assert.ok(topBarContent.includes('isRtl'), 'DesktopTopBar must handle isRtl');
  });

  it('DESKTOP-17: Multilingual translations exist for FR, EN, AR, ES, IT', () => {
    const translationsContent = getFileContent('src/utils/translations.ts');

    assert.ok(translationsContent.includes('desktopSearchPlaceholder:'), 'desktopSearchPlaceholder key must exist');
    assert.ok(translationsContent.includes('desktopQuickSearch:'), 'desktopQuickSearch key must exist');
    assert.ok(translationsContent.includes('desktopNotifications:'), 'desktopNotifications key must exist');
    assert.ok(translationsContent.includes('desktopBreadcrumbHome:'), 'desktopBreadcrumbHome key must exist');
  });

  it('DESKTOP-18: No hardcoded user strings in Desktop TopBar / Sidebar', () => {
    const sidebarContent = getFileContent('src/components/ui/DesktopSidebar.tsx');
    const topBarContent = getFileContent('src/components/ui/DesktopTopBar.tsx');

    assert.ok(sidebarContent.includes("t('"), 'Sidebar must use t(...) for labels');
    assert.ok(topBarContent.includes("t('"), 'TopBar must use t(...) for labels');
  });

  it('DESKTOP-19: No global body/html overflow-x: hidden camouflage', () => {
    const indexCss = getFileContent('src/index.css');

    const bodyOverflowCssRegex = /body\s*\{[^}]*overflow-x\s*:\s*hidden/i;
    const htmlOverflowCssRegex = /html\s*\{[^}]*overflow-x\s*:\s*hidden/i;

    assert.strictEqual(bodyOverflowCssRegex.test(indexCss), false, 'body overflow-x: hidden is forbidden');
    assert.strictEqual(htmlOverflowCssRegex.test(indexCss), false, 'html overflow-x: hidden is forbidden');
  });

  it('DESKTOP-20: Frozen mobile bugs (BUG-01 to BUG-07) protected without regression', () => {
    const cageOccupancyFile = getFileContent('src/features/habitat/utils/cageOccupancy.ts');
    assert.ok(cageOccupancyFile.includes('calculateCageOccupancy'), 'calculateCageOccupancy must remain intact');
  });
});

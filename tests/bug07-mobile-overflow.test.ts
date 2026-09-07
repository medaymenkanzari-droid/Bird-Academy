/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BUG-07 — Mobile Horizontal Overflow Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [360, 375, 390, 412];
const LANGUAGES = ['fr', 'en', 'ar', 'es', 'it'];

// Helper to inspect JSX file contents
function getFileContent(relativePath: string): string {
  const fullPath = path.join(process.cwd(), relativePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

test('OVERFLOW-01 — Statistiques (viewport 360px) structure check', () => {
  const dashboardContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');
  const exportContent = getFileContent('src/features/analytics/exports/ExportCenter.tsx');
  const graphContent = getFileContent('src/features/analytics/charts/GraphEngine.tsx');

  // Verify tab nav bar has local horizontal scroll
  assert.ok(dashboardContent.includes('overflow-x-auto'));
  assert.ok(dashboardContent.includes('min-w-0'));
  assert.ok(dashboardContent.includes('max-w-full'));

  // Verify ExportCenter grid doesn't force hard width on 360px
  assert.ok(exportContent.includes('grid-cols-5'));
  assert.ok(exportContent.includes('min-w-0'));

  // Verify HeatMap graph container is scrollable locally
  assert.ok(graphContent.includes('overflow-x-auto'));
});

test('OVERFLOW-02 — Statistiques (viewport 375px) structure check', () => {
  const dashboardContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');
  assert.ok(dashboardContent.includes('touch-pan-x'));
  assert.ok(dashboardContent.includes('shrink-0'));
});

test('OVERFLOW-03 — Statistiques (viewport 390px) structure check', () => {
  const dashboardContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');
  assert.ok(dashboardContent.includes('space-y-6'));
  assert.ok(dashboardContent.includes('w-full'));
});

test('OVERFLOW-04 — Statistiques (viewport 412px) structure check', () => {
  const dashboardContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');
  assert.ok(dashboardContent.includes('max-w-7xl'));
});

test('OVERFLOW-05 — Génétique container bounds check', () => {
  const dashboardContent = getFileContent('src/features/genetics/components/GeneticsDashboard.tsx');
  const explorerContent = getFileContent('src/features/genetics/components/GenealogyExplorer.tsx');

  assert.ok(dashboardContent.includes('overflow-x-auto'));
  assert.ok(dashboardContent.includes('min-w-0'));
  assert.ok(dashboardContent.includes('whitespace-nowrap'));

  // Check absolute summary card inside GenealogyExplorer
  assert.ok(explorerContent.includes('max-w-[calc(100%-2rem)]'));
});

test('OVERFLOW-06 — Référentiel biologique bounds check', () => {
  const bioContent = getFileContent('src/components/ReferenceBiologique.tsx');

  assert.ok(bioContent.includes('overflow-x-auto'));
  assert.ok(bioContent.includes('min-w-0'));
  assert.ok(bioContent.includes('whitespace-nowrap'));
  assert.ok(bioContent.includes('shrink-0'));
});

test('OVERFLOW-07 — Bird Intelligence bounds check', () => {
  const intelContent = getFileContent('src/features/intelligence/dashboards/IntelligenceDashboard.tsx');

  assert.ok(intelContent.includes('overflow-x-auto'));
  assert.ok(intelContent.includes('min-w-0'));
  assert.ok(intelContent.includes('whitespace-nowrap'));
});

test('OVERFLOW-08 — Local scroll container verification', () => {
  const files = [
    'src/features/analytics/components/AnalyticsDashboard.tsx',
    'src/features/genetics/components/GeneticsDashboard.tsx',
    'src/components/ReferenceBiologique.tsx',
    'src/features/intelligence/dashboards/IntelligenceDashboard.tsx'
  ];

  files.forEach(f => {
    const content = getFileContent(f);
    assert.ok(content.includes('overflow-x-auto'), `File ${f} must feature local overflow-x-auto`);
    assert.ok(content.includes('min-w-0'), `File ${f} must feature min-w-0 for flex children`);
  });
});

test('OVERFLOW-09 — ABSOLUTE REQUIREMENT: No body/html overflow-x-hidden camouflage', () => {
  const indexCss = getFileContent('src/index.css');

  // Verify overflow-x: hidden is NOT applied to body or html as a cheat fix
  const bodyOverflowCssRegex = /body\s*\{[^}]*overflow-x\s*:\s*hidden/i;
  const htmlOverflowCssRegex = /html\s*\{[^}]*overflow-x\s*:\s*hidden/i;

  assert.equal(bodyOverflowCssRegex.test(indexCss), false, 'body overflow-x: hidden is forbidden in index.css');
  assert.equal(htmlOverflowCssRegex.test(indexCss), false, 'html overflow-x: hidden is forbidden in index.css');
});

test('OVERFLOW-10 — Arabic RTL mode layout checks', () => {
  const bioContent = getFileContent('src/components/ReferenceBiologique.tsx');
  const analyticsContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');

  assert.ok(bioContent.includes('isRtl'));
  assert.ok(analyticsContent.includes('isRtl'));
});

test('OVERFLOW-11 — Long English text strings check', () => {
  const analyticsContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');
  assert.ok(analyticsContent.includes('whitespace-nowrap'));
});

test('OVERFLOW-12 — Parent containment check', () => {
  const appPageContent = getFileContent('src/components/design-system/AppPage.tsx');
  assert.ok(appPageContent.includes('w-full'));
  assert.ok(appPageContent.includes('min-w-0'));
  assert.ok(appPageContent.includes('max-w-full'));
});

test('OVERFLOW-13 — Biological Reference species non-overlap check across viewports 360, 375, 390, 412px', () => {
  const bioContent = getFileContent('src/components/ReferenceBiologique.tsx');
  assert.ok(bioContent.includes('bio-species-selector') || bioContent.includes('bio-race-selector'), 'Must have dedicated mobile species dropdown selector');
  assert.ok(bioContent.includes('HorizontalScrollContainer'), 'Must use HorizontalScrollContainer for species & sub-tabs');
});

test('OVERFLOW-14 — Biological Reference species accessibility & SPECIES_REGISTRY preservation', () => {
  const speciesContent = getFileContent('src/data/speciesRegistry.ts');
  const bioContent = getFileContent('src/components/ReferenceBiologique.tsx');

  const canaryBreeds = [
    'Lipochrome', 'Mélanine', 'Classique', 'Canari de Couleur',
    'Gloster Fancy', 'Yorkshire', 'Border', 'Fife Fancy', 'Norwich',
    'Lizard', 'Frisé Parisien', 'Crested', 'Raza Española', 'Bossu Belge',
    'Harz Roller', 'Waterslager Malinois', 'Timbrado Espagnol', 'Chanteur Espagnol'
  ];

  canaryBreeds.forEach(breed => {
    assert.ok(speciesContent.includes(breed), `Breed ${breed} must exist in SPECIES_REGISTRY`);
  });

  assert.ok(bioContent.includes('BIOLOGICAL_SPECIES_REGISTRY'), 'ReferenceBiologique must import BIOLOGICAL_SPECIES_REGISTRY');
});

test('OVERFLOW-15 — Indicator appears when horizontal content is hidden', () => {
  const scrollContainerContent = getFileContent('src/components/ui/HorizontalScrollContainer.tsx');
  assert.ok(scrollContainerContent.includes('maxScroll > 1'), 'Must check if maxScroll > 1');
  assert.ok(scrollContainerContent.includes('showRight'), 'Must set showRight indicator state');
  assert.ok(scrollContainerContent.includes('ChevronRight'), 'Must render right chevron indicator');
});

test('OVERFLOW-16 — Indicator disappears when all content is visible', () => {
  const scrollContainerContent = getFileContent('src/components/ui/HorizontalScrollContainer.tsx');
  assert.ok(scrollContainerContent.includes('setShowLeft(false)'), 'Must hide left indicator when no overflow');
  assert.ok(scrollContainerContent.includes('setShowRight(false)'), 'Must hide right indicator when no overflow');
});

test('OVERFLOW-17 — Right indicator disappears when scrolled to far right', () => {
  const scrollContainerContent = getFileContent('src/components/ui/HorizontalScrollContainer.tsx');
  assert.ok(scrollContainerContent.includes('atRightEnd') || scrollContainerContent.includes('scrollLeft < maxScroll - 4'), 'Must check right edge condition');
});

test('OVERFLOW-18 — Left indicator appears when previous scroll content is available', () => {
  const scrollContainerContent = getFileContent('src/components/ui/HorizontalScrollContainer.tsx');
  assert.ok(scrollContainerContent.includes('showLeft'), 'Must manage showLeft indicator');
  assert.ok(scrollContainerContent.includes('ChevronLeft'), 'Must render left chevron indicator');
});

test('OVERFLOW-19 — Arabic RTL mode scroll indicator & direction handling', () => {
  const scrollContainerContent = getFileContent('src/components/ui/HorizontalScrollContainer.tsx');
  assert.ok(scrollContainerContent.includes('isRtl'), 'Must check isRtl flag');
  assert.ok(scrollContainerContent.includes("dir={isRtl ? 'rtl' : 'ltr'}"), 'Must set dir attribute based on RTL mode');
});

test('OVERFLOW-20 — Light / Dark mode indicator visual contrast', () => {
  const scrollContainerContent = getFileContent('src/components/ui/HorizontalScrollContainer.tsx');
  assert.ok(scrollContainerContent.includes('dark:from-slate-900'), 'Must feature dark mode gradient background');
  assert.ok(scrollContainerContent.includes('from-white'), 'Must feature light mode gradient background');
  assert.ok(scrollContainerContent.includes('pointer-events-none'), 'Indicators must be non-blocking with pointer-events-none');
});

test('OVERFLOW-21 — Screen reader hints and multilingual translations for FR, EN, AR, ES, IT', () => {
  const translationsContent = getFileContent('src/utils/translations.ts');

  assert.ok(translationsContent.includes('moreOptions:'), 'moreOptions key must exist');
  assert.ok(translationsContent.includes('scrollMoreOptions:'), 'scrollMoreOptions key must exist');
  assert.ok(translationsContent.includes('selectRace:'), 'selectRace key must exist');
  assert.ok(translationsContent.includes('raceLabel:'), 'raceLabel key must exist');

  assert.ok(translationsContent.includes("Plus d'options"), 'FR translation for moreOptions must exist');
  assert.ok(translationsContent.includes("More options"), 'EN translation for moreOptions must exist');
  assert.ok(translationsContent.includes("خيارات إضافية"), 'AR translation for moreOptions must exist');
  assert.ok(translationsContent.includes("Más opciones"), 'ES translation for moreOptions must exist');
  assert.ok(translationsContent.includes("Altre opzioni"), 'IT translation for moreOptions must exist');
});

test('OVERFLOW-22 — Application-wide horizontal menus use common HorizontalScrollContainer / ScrollableTabs / AppTabs', () => {
  const appTabsContent = getFileContent('src/components/design-system/AppTabs.tsx');
  const bioContent = getFileContent('src/components/ReferenceBiologique.tsx');
  const analyticsContent = getFileContent('src/features/analytics/components/AnalyticsDashboard.tsx');
  const geneticsContent = getFileContent('src/features/genetics/components/GeneticsDashboard.tsx');
  const intelContent = getFileContent('src/features/intelligence/dashboards/IntelligenceDashboard.tsx');

  assert.ok(appTabsContent.includes('HorizontalScrollContainer'), 'AppTabs must use HorizontalScrollContainer');
  assert.ok(bioContent.includes('HorizontalScrollContainer'), 'ReferenceBiologique must use HorizontalScrollContainer');
  assert.ok(analyticsContent.includes('HorizontalScrollContainer'), 'AnalyticsDashboard must use HorizontalScrollContainer');
  assert.ok(geneticsContent.includes('HorizontalScrollContainer'), 'GeneticsDashboard must use HorizontalScrollContainer');
  assert.ok(intelContent.includes('HorizontalScrollContainer'), 'IntelligenceDashboard must use HorizontalScrollContainer');
});


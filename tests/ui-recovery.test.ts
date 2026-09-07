import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { TRANSLATIONS } from '../src/utils/translations';
import { LOCAL_I18N } from '../src/components/Canaris';

const source = (relativePath: string): string =>
  readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf8');

test('a stale lazy-loaded module has one guarded recovery and a visible fallback', () => {
  const boundary = source('src/components/ChunkLoadErrorBoundary.tsx');
  const app = source('src/App.tsx');

  assert.match(boundary, /CHUNK_ERROR/);
  assert.match(boundary, /RECOVERY_COOLDOWN_MS/);
  assert.match(boundary, /registration\?\.update\(\)/);
  assert.match(boundary, /role="alert"/);
  assert.match(app, /<ChunkLoadErrorBoundary/);
});

test('main navigation exposes keyboard, focus and RTL drawer contracts', () => {
  const app = source('src/App.tsx');
  const animations = source('src/theme/animations.ts');

  assert.match(app, /href="#main-content"/);
  assert.match(app, /id="main-content"/);
  assert.match(app, /aria-controls="mobile-navigation-drawer"/);
  assert.match(app, /aria-modal="true"/);
  assert.match(app, /event\.key === 'Escape'/);
  assert.match(app, /aria-current=\{isActive \? 'page'/);
  assert.match(animations, /drawerRight:/);
});

test('recovery and navigation labels exist in all supported languages', () => {
  const keys = [
    'navigation', 'openMenu', 'closeMenu', 'demoSandbox', 'administration',
    'qualityAssurance', 'appUpdateRequired', 'appUpdateMessage',
    'reloadApplication', 'skipToContent', 'appTagline',
  ];

  (['fr', 'en', 'ar', 'es', 'it'] as const).forEach(language => {
    keys.forEach(key => assert.ok(TRANSLATIONS[language][key]?.trim(), `${language}.${key}`));
  });
});

test('bird gender badges never reuse status labels or untranslated keys', () => {
  const birdsSource = source('src/components/Canaris.tsx');
  assert.doesNotMatch(birdsSource, /localT\('statusActive'\)\.split/);
  (['fr', 'en', 'ar', 'es', 'it'] as const).forEach(language => {
    ['male', 'female', 'undetermined'].forEach(key => {
      assert.ok(LOCAL_I18N[language][key]?.trim(), `${language}.${key}`);
    });
  });
});

test('mobile screens start with bird cards and keep dashboard alert filters inside the viewport', () => {
  const birdsSource = source('src/components/Canaris.tsx');
  const dashboardSource = source('src/components/Dashboard.tsx');

  assert.match(birdsSource, /matchMedia\?\.\('\(max-width: 767px\)'\)\.matches/);
  assert.match(dashboardSource, /grid grid-cols-3 sm:flex/);
  assert.match(dashboardSource, /whitespace-normal sm:whitespace-nowrap/);
});

test('bird creation keeps origin and quarantine labels localized in every language', () => {
  const birdsSource = source('src/components/Canaris.tsx');
  const keys = [
    'quarantineProtocol', 'quarantineCage', 'quarantineAssignLater',
    'quarantineEntryDate', 'quarantineDuration', 'quarantineDays',
    'sectionBiologicalAncestry', 'sectionFosterLineage',
  ];

  (['fr', 'en', 'ar', 'es', 'it'] as const).forEach(language => {
    keys.forEach(key => assert.ok(LOCAL_I18N[language][key]?.trim(), `${language}.${key}`));
  });

  assert.match(birdsSource, /localT\('sectionBiologicalAncestry'\)/);
  assert.match(birdsSource, /localT\('sectionFosterLineage'\)/);
  [7, 14, 21, 30].forEach(days => {
    assert.match(birdsSource, new RegExp(`localT\\('quarantineDays', \\{ count: ${days} \\}\\)`));
  });
});

test('all four bird form steps remain visible on mobile without horizontal discovery', () => {
  const birdsSource = source('src/components/Canaris.tsx');

  assert.match(birdsSource, /grid grid-cols-2 sm:flex/);
  assert.match(birdsSource, /overflow-x-visible sm:overflow-x-auto/);
  assert.match(birdsSource, /w-full sm:w-auto/);
});

test('language context keeps the legacy currentLanguage alias synchronized', () => {
  const context = source('src/context/LanguageContext.tsx');
  assert.match(context, /currentLanguage:\s*language/);
});

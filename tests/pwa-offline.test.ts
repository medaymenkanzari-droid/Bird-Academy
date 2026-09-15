import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectFile = (relativePath: string): string =>
  fileURLToPath(new URL(`../${relativePath}`, import.meta.url));

test('VitePWA remains the only manifest and service-worker generator', () => {
  assert.equal(existsSync(projectFile('public/manifest.webmanifest')), false);
  assert.equal(existsSync(projectFile('public/sw.js')), false);

  const config = readFileSync(projectFile('vite.config.ts'), 'utf8');
  assert.match(config, /VitePWA\(/);
  assert.match(config, /cleanupOutdatedCaches:\s*true/);
  assert.match(config, /navigateFallback:\s*['"]\/index\.html['"]/);
  assert.match(config, /maximumFileSizeToCacheInBytes:\s*3\s*\*\s*1024\s*\*\s*1024/);
});

test('all mandatory install and demo assets are packaged locally', () => {
  [
    'assets/images/public_assets_images_bird_academy/logo-icon.svg',
    'assets/images/public_assets_images_bird_academy/apple-touch-icon.png',
    'assets/images/public_assets_images_bird_academy/icon.png',
    'demo-bird.svg'
  ].forEach(asset => {
    assert.equal(existsSync(projectFile(`public/${asset}`)), true, asset);
  });

  const config = readFileSync(projectFile('vite.config.ts'), 'utf8');
  assert.match(config, /purpose:\s*['"]any maskable['"]/);
  assert.match(config, /includeAssets:/);
});

test('offline screens do not depend on Google Fonts or remote demo photos', () => {
  const css = readFileSync(projectFile('src/index.css'), 'utf8');
  const generator = readFileSync(
    projectFile('src/features/quality/utils/demoGenerator.ts'),
    'utf8',
  );

  assert.doesNotMatch(css, /fonts\.googleapis\.com/i);
  assert.doesNotMatch(generator, /https?:\/\//i);
  assert.match(generator, /\/demo-bird\.svg/);
});

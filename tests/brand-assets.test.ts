/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppIcon } from '../src/components/design-system/AppIcon';
import { AppLogo } from '../src/components/design-system/AppLogo';
import { brandAssets } from '../src/config/brandAssets';

test('brandAssets - all 12 official brand assets are correctly exposed', () => {
  const expectedKeys = [
    'logo', 'logoSvg', 'logoFull', 'logoFullSvg', 'logoFullDark', 'logoFullDarkSvg',
    'logoIcon', 'logoIconSvg', 'icon', 'iconIco', 'favicon', 'appleTouchIcon'
  ] as const;

  for (const key of expectedKeys) {
    assert.ok(brandAssets[key], `brandAssets.${key} must be defined`);
    assert.ok(
      brandAssets[key].includes('public_assets_images_bird_academy'),
      `brandAssets.${key} must resolve to official brand directory`
    );
  }
});

test('AppIcon - renders official brand logo-icon mark correctly', () => {
  const html = renderToStaticMarkup(React.createElement(AppIcon, {
    className: 'w-10 h-10',
    variant: 'default'
  }));

  // Assert img tag and src attribute
  assert.ok(html.includes('<img'), 'Should contain img tag');
  assert.ok(html.includes(`src="${brandAssets.logoIcon}"`), `Should point to brandAssets.logoIcon (${brandAssets.logoIcon})`);
  assert.ok(html.includes('alt="Bird Academy"'), 'Should have accessible alt text');
});

test('AppLogo - renders brand header lockup with official logo-icon and title/subline', () => {
  const html = renderToStaticMarkup(React.createElement(AppLogo, {
    size: 'lg',
    variant: 'dark',
    sublineText: 'AVIAN ERP • SUITE PROFESSIONNELLE'
  }));

  assert.ok(html.includes('<img'), 'Should contain img tag');
  assert.ok(html.includes(`src="${brandAssets.logoIcon}"`), `Should point to brandAssets.logoIcon (${brandAssets.logoIcon})`);
  assert.ok(html.includes('alt="Bird Academy"'), 'Should have accessible alt text');
  assert.ok(html.includes('Bird Academy'), 'Should render brand name');
  assert.ok(html.includes('AVIAN ERP • SUITE PROFESSIONNELLE'), 'Should render subline');
});

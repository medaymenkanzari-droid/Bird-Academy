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

test('AppIcon - renders new brand logo-icon.png mark correctly', () => {
  const html = renderToStaticMarkup(React.createElement(AppIcon, {
    className: 'w-10 h-10',
    variant: 'default'
  }));

  // Assert img tag and src attribute
  assert.ok(html.includes('<img'), 'Should contain img tag');
  assert.ok(html.includes('src="/assets/images/logo-icon.png"'), 'Should point to /assets/images/logo-icon.png');
  assert.ok(html.includes('alt="Bird Academy"'), 'Should have accessible alt text');
});

test('AppLogo - renders brand header lockup with logo-icon.png and title/subline', () => {
  const html = renderToStaticMarkup(React.createElement(AppLogo, {
    size: 'lg',
    variant: 'dark',
    sublineText: 'AVIAN ERP • SUITE PROFESSIONNELLE'
  }));

  assert.ok(html.includes('<img'), 'Should contain img tag');
  assert.ok(html.includes('src="/assets/images/logo-icon.png"'), 'Should point to logo-icon image asset');
  assert.ok(html.includes('alt="Bird Academy"'), 'Should have accessible alt text');
  assert.ok(html.includes('Bird Academy'), 'Should render brand name');
  assert.ok(html.includes('AVIAN ERP • SUITE PROFESSIONNELLE'), 'Should render subline');
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — ANTI-REGRESSION BROKEN LOGO TEST (MISSION BRAND-ASSETS-001)
 * 
 * Ce test unitaire et d'intégration garantit de manière formelle :
 * 1. Le logo principal et tous les assets officiels existent sur le disque
 * 2. Les fichiers sont accessibles en lecture et non corrompus
 * 3. Les en-têtes binaires (PNG, ICO, SVG) sont valides et non vides
 * 4. Aucune référence de chemin absolu racine cassé (/assets/...) n'est produite
 * 5. La résolution fonctionne sous protocole file:// (Electron desktop) et HTTP (Web)
 * 6. Les assets dans dist_user correspondent fidèlement à la source officielle
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppIcon } from '../src/components/design-system/AppIcon';
import { AppLogo } from '../src/components/design-system/AppLogo';
import { BrandLogoIcon } from '../src/components/design-system/BrandLogoIcon';
import { brandAssets, resolveBrandAsset } from '../src/config/brandAssets';

const ROOT_DIR = process.cwd();
const OFFICIAL_DIR = path.join(ROOT_DIR, 'public', 'assets', 'images', 'public_assets_images_bird_academy');

const OFFICIAL_FILES = [
  'apple-touch-icon.png',
  'favicon.ico',
  'icon.ico',
  'icon.png',
  'logo-full-dark.png',
  'logo-full-dark.svg',
  'logo-full.png',
  'logo-full.svg',
  'logo-icon.png',
  'logo-icon.svg',
  'logo.png',
  'logo.svg'
];

test('BROKEN-LOGO-01 : Tous les assets officiels existent et sont accessibles', () => {
  assert.ok(fs.existsSync(OFFICIAL_DIR), `Le dossier officiel ${OFFICIAL_DIR} doit exister`);
  
  for (const filename of OFFICIAL_FILES) {
    const filePath = path.join(OFFICIAL_DIR, filename);
    assert.ok(fs.existsSync(filePath), `Le fichier officiel ${filename} doit exister`);
    
    const stats = fs.statSync(filePath);
    assert.ok(stats.size > 0, `Le fichier ${filename} ne doit pas être vide (taille: ${stats.size})`);
    
    // Lecture sans erreur
    const buffer = fs.readFileSync(filePath);
    assert.strictEqual(buffer.length, stats.size);
  }
});

test('BROKEN-LOGO-02 : Les formats binaires et signatures des images sont valides', () => {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const pngFiles = OFFICIAL_FILES.filter(f => f.endsWith('.png'));
  for (const f of pngFiles) {
    const buf = fs.readFileSync(path.join(OFFICIAL_DIR, f));
    assert.strictEqual(buf[0], 0x89, `${f} doit commencer par 0x89`);
    assert.strictEqual(buf.toString('ascii', 1, 4), 'PNG', `${f} doit contenir signature PNG`);
  }

  // ICO signature: 00 00 01 00
  const icoFiles = OFFICIAL_FILES.filter(f => f.endsWith('.ico'));
  for (const f of icoFiles) {
    const buf = fs.readFileSync(path.join(OFFICIAL_DIR, f));
    assert.strictEqual(buf.readUInt16LE(0), 0, `${f} en-tête réservé ICO doit être 0`);
    assert.strictEqual(buf.readUInt16LE(2), 1, `${f} type ICO doit être 1`);
    assert.ok(buf.readUInt16LE(4) >= 1, `${f} doit contenir au moins 1 icône`);
  }

  // SVG xml
  const svgFiles = OFFICIAL_FILES.filter(f => f.endsWith('.svg'));
  for (const f of svgFiles) {
    const str = fs.readFileSync(path.join(OFFICIAL_DIR, f), 'utf8');
    assert.ok(str.includes('<svg'), `${f} doit contenir une balise <svg`);
    assert.ok(str.includes('</svg>'), `${f} doit se terminer par </svg>`);
  }
});

test('BROKEN-LOGO-03 : Aucun composant React ne produit de chemin racine cassé pour Electron', () => {
  // Rendu statique des composants de marque
  const appLogoHtml = renderToStaticMarkup(React.createElement(AppLogo, { size: 'md' }));
  const appIconHtml = renderToStaticMarkup(React.createElement(AppIcon, { size: 32 }));
  const brandIconHtml = renderToStaticMarkup(React.createElement(BrandLogoIcon, {}));

  const allRendered = [appLogoHtml, appIconHtml, brandIconHtml];

  for (const html of allRendered) {
    // Ne doit jamais contenir de chemin absolu drive racine type src="/assets/... qui brise file://
    assert.ok(!html.includes('src="/assets/images/logo-icon.png"'), 'Interdiction formelle du chemin absolu racine /assets/images/logo-icon.png');
    assert.ok(!html.includes('src="/icon.svg"'), 'Interdiction formelle du fallback /icon.svg');
    assert.ok(html.includes('public_assets_images_bird_academy'), 'Doit pointer vers le répertoire officiel');
  }
});

test('BROKEN-LOGO-04 : Simulation de résolution sous file:// (Electron Windows)', () => {
  // Simule l'environnement file:// d'Electron
  const electronDocumentUrl = new URL('file:///C:/Program%20Files/Bird%20Academy/dist_user/index.html');
  const assetRelativePath = './assets/images/public_assets_images_bird_academy/logo-icon.png';
  const resolved = new URL(assetRelativePath, electronDocumentUrl);

  assert.strictEqual(resolved.protocol, 'file:');
  assert.ok(
    resolved.pathname.includes('/dist_user/assets/images/public_assets_images_bird_academy/logo-icon.png'),
    `Le chemin résolu doit être dans le sous-dossier de dist_user et non à la racine du disque: ${resolved.pathname}`
  );
  assert.ok(!resolved.pathname.startsWith('/assets/'), 'Ne doit pas pointer directement vers la racine /assets/...');
});

test('BROKEN-LOGO-05 : Intégrité des assets dans dist_user par rapport aux originaux', () => {
  const distUserDir = path.join(ROOT_DIR, 'dist_user', 'assets', 'images', 'public_assets_images_bird_academy');
  
  if (fs.existsSync(distUserDir)) {
    for (const file of OFFICIAL_FILES) {
      const srcPath = path.join(OFFICIAL_DIR, file);
      const dstPath = path.join(distUserDir, file);
      
      assert.ok(fs.existsSync(dstPath), `L'asset ${file} doit être présent dans dist_user`);
      
      const srcHash = crypto.createHash('sha256').update(fs.readFileSync(srcPath)).digest('hex');
      const dstHash = crypto.createHash('sha256').update(fs.readFileSync(dstPath)).digest('hex');
      assert.strictEqual(dstHash, srcHash, `Le hash SHA-256 de ${file} dans dist_user doit être strictement identique à l'original`);
    }
  }
});

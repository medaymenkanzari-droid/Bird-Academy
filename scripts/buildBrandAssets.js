/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — OFFICIAL BRAND ASSET GENERATOR
 * Generates vector SVGs, raster PNGs, and multi-resolution ICO files for Web, Desktop (Electron, Tauri), and PWA.
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const ROOT_DIR = process.cwd();

// Directories
const PUBLIC_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'assets', 'images');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const BUILD_ICONS_DIR = path.join(ROOT_DIR, 'build', 'icons');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const TAURI_ICONS_DIR = path.join(ROOT_DIR, 'src-tauri', 'icons');

[PUBLIC_IMAGES_DIR, BUILD_ICONS_DIR, TAURI_ICONS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 1. Icon-only SVG (100x100 ViewBox)
const ICON_SVG = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" id="bird-academy-icon">
  <defs>
    <linearGradient id="shieldBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1F2E3D"/>
      <stop offset="60%" stop-color="#141E28"/>
      <stop offset="100%" stop-color="#0B1117"/>
    </linearGradient>
    <linearGradient id="shieldBorder" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#5C6BC0"/>
      <stop offset="50%" stop-color="#3F51B5"/>
      <stop offset="100%" stop-color="#1F2E3D"/>
    </linearGradient>
    <linearGradient id="birdGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="40%" stop-color="#FFB300"/>
      <stop offset="100%" stop-color="#FF8F00"/>
    </linearGradient>
    <linearGradient id="wingGrad" x1="35" y1="35" x2="75" y2="75" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7986CB"/>
      <stop offset="100%" stop-color="#3F51B5"/>
    </linearGradient>
    <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#FFB300" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Hexagonal Aviary Shield -->
  <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="url(#shieldBg)" stroke="url(#shieldBorder)" stroke-width="3" stroke-linejoin="round"/>
  
  <!-- Digital Aviary Grid Lines -->
  <path d="M50,4 L50,96 M8,26 L92,74 M8,74 L92,26" stroke="#3F51B5" stroke-width="0.75" stroke-opacity="0.35" stroke-dasharray="2 2"/>
  
  <!-- Inner Precision Ring -->
  <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" fill="none" stroke="#5C6BC0" stroke-width="1" stroke-opacity="0.3"/>
  
  <!-- Stylized Songbird Silhouette -->
  <!-- Body & Head -->
  <path d="M32,58 C30,50 34,36 44,30 C49,27 57,25 64,28 C68,30 73,35 72,40 C71,44 67,46 64,48 C58,52 52,58 48,68 C42,66 36,63 32,58 Z" fill="url(#birdGrad)" filter="url(#goldGlow)"/>
  
  <!-- Wing Layer -->
  <path d="M44,42 C52,38 66,42 74,52 C70,58 60,63 50,60 C46,55 44,48 44,42 Z" fill="url(#wingGrad)" opacity="0.95"/>
  
  <!-- Beak -->
  <polygon points="72,36 83,39 72,42" fill="#FFB300"/>
  
  <!-- Eye -->
  <circle cx="63" cy="33" r="2" fill="#1F2E3D"/>
  <circle cx="63.5" cy="32.5" r="0.6" fill="#FFFFFF"/>
  
  <!-- Bague / Genetic Band -->
  <rect x="43" y="68" width="6" height="4" rx="1" fill="#3F51B5" stroke="#FFB300" stroke-width="0.6"/>
  
  <!-- Data Baseline / Perch -->
  <line x1="24" y1="72" x2="76" y2="72" stroke="#5C6BC0" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

// 2. Full Horizontal Logo SVG (400x100 ViewBox)
const FULL_LOGO_SVG = `<svg viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg" id="bird-academy-full-logo">
  <defs>
    <linearGradient id="flShieldBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1F2E3D"/>
      <stop offset="100%" stop-color="#0B1117"/>
    </linearGradient>
    <linearGradient id="flShieldBorder" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#5C6BC0"/>
      <stop offset="50%" stop-color="#3F51B5"/>
      <stop offset="100%" stop-color="#1F2E3D"/>
    </linearGradient>
    <linearGradient id="flBirdGrad" x1="16" y1="16" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="40%" stop-color="#FFB300"/>
      <stop offset="100%" stop-color="#FF8F00"/>
    </linearGradient>
    <linearGradient id="flWingGrad" x1="28" y1="28" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7986CB"/>
      <stop offset="100%" stop-color="#3F51B5"/>
    </linearGradient>
  </defs>

  <!-- Left Icon Mark (scaled & placed at x=10, y=10) -->
  <g transform="translate(10, 10) scale(0.8)">
    <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="url(#flShieldBg)" stroke="url(#flShieldBorder)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50,4 L50,96 M8,26 L92,74 M8,74 L92,26" stroke="#3F51B5" stroke-width="0.75" stroke-opacity="0.35" stroke-dasharray="2 2"/>
    <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" fill="none" stroke="#5C6BC0" stroke-width="1" stroke-opacity="0.3"/>
    
    <path d="M32,58 C30,50 34,36 44,30 C49,27 57,25 64,28 C68,30 73,35 72,40 C71,44 67,46 64,48 C58,52 52,58 48,68 C42,66 36,63 32,58 Z" fill="url(#flBirdGrad)"/>
    <path d="M44,42 C52,38 66,42 74,52 C70,58 60,63 50,60 C46,55 44,48 44,42 Z" fill="url(#flWingGrad)" opacity="0.95"/>
    <polygon points="72,36 83,39 72,42" fill="#FFB300"/>
    <circle cx="63" cy="33" r="2" fill="#1F2E3D"/>
    <circle cx="63.5" cy="32.5" r="0.6" fill="#FFFFFF"/>
    <rect x="43" y="68" width="6" height="4" rx="1" fill="#3F51B5" stroke="#FFB300" stroke-width="0.6"/>
    <line x1="24" y1="72" x2="76" y2="72" stroke="#5C6BC0" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- Typography Block -->
  <g transform="translate(100, 0)">
    <!-- Primary Title -->
    <text x="0" y="46" font-family="system-ui, -apple-system, 'Segoe UI', Inter, Roboto, sans-serif" font-size="29" font-weight="900" letter-spacing="-0.5" fill="#1F2E3D">BIRD ACADEMY</text>
    
    <!-- Accent Badge / Subtitle -->
    <rect x="0" y="58" width="8" height="8" rx="2" fill="#FFB300"/>
    <text x="14" y="66" font-family="'JetBrains Mono', 'SF Mono', Consolas, monospace" font-size="10.5" font-weight="700" letter-spacing="2" fill="#3F51B5">AVIAN PRECISION • BREEDING ERP</text>
  </g>
</svg>`;

// 3. Full Horizontal Logo for Dark Backgrounds (400x100 ViewBox)
const FULL_LOGO_DARK_SVG = `<svg viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg" id="bird-academy-full-logo-dark">
  <defs>
    <linearGradient id="fldShieldBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1F2E3D"/>
      <stop offset="100%" stop-color="#0B1117"/>
    </linearGradient>
    <linearGradient id="fldShieldBorder" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#5C6BC0"/>
      <stop offset="50%" stop-color="#3F51B5"/>
      <stop offset="100%" stop-color="#1F2E3D"/>
    </linearGradient>
    <linearGradient id="fldBirdGrad" x1="16" y1="16" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="40%" stop-color="#FFB300"/>
      <stop offset="100%" stop-color="#FF8F00"/>
    </linearGradient>
    <linearGradient id="fldWingGrad" x1="28" y1="28" x2="60" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#7986CB"/>
      <stop offset="100%" stop-color="#3F51B5"/>
    </linearGradient>
  </defs>

  <g transform="translate(10, 10) scale(0.8)">
    <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="url(#fldShieldBg)" stroke="url(#fldShieldBorder)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50,4 L50,96 M8,26 L92,74 M8,74 L92,26" stroke="#3F51B5" stroke-width="0.75" stroke-opacity="0.35" stroke-dasharray="2 2"/>
    <polygon points="50,14 84,32 84,68 50,86 16,68 16,32" fill="none" stroke="#5C6BC0" stroke-width="1" stroke-opacity="0.3"/>
    
    <path d="M32,58 C30,50 34,36 44,30 C49,27 57,25 64,28 C68,30 73,35 72,40 C71,44 67,46 64,48 C58,52 52,58 48,68 C42,66 36,63 32,58 Z" fill="url(#fldBirdGrad)"/>
    <path d="M44,42 C52,38 66,42 74,52 C70,58 60,63 50,60 C46,55 44,48 44,42 Z" fill="url(#fldWingGrad)" opacity="0.95"/>
    <polygon points="72,36 83,39 72,42" fill="#FFB300"/>
    <circle cx="63" cy="33" r="2" fill="#1F2E3D"/>
    <circle cx="63.5" cy="32.5" r="0.6" fill="#FFFFFF"/>
    <rect x="43" y="68" width="6" height="4" rx="1" fill="#3F51B5" stroke="#FFB300" stroke-width="0.6"/>
    <line x1="24" y1="72" x2="76" y2="72" stroke="#5C6BC0" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <g transform="translate(100, 0)">
    <text x="0" y="46" font-family="system-ui, -apple-system, 'Segoe UI', Inter, Roboto, sans-serif" font-size="29" font-weight="900" letter-spacing="-0.5" fill="#FFFFFF">BIRD ACADEMY</text>
    <rect x="0" y="58" width="8" height="8" rx="2" fill="#FFB300"/>
    <text x="14" y="66" font-family="'JetBrains Mono', 'SF Mono', Consolas, monospace" font-size="10.5" font-weight="700" letter-spacing="2" fill="#7986CB">AVIAN PRECISION • BREEDING ERP</text>
  </g>
</svg>`;

// Helper function: Multi-size ICO binary creator
function createIcoFromPngBuffers(pngEntries) {
  const count = pngEntries.length;
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + count * entrySize;

  let currentOffset = directorySize;
  const entriesBuffer = Buffer.alloc(count * entrySize);
  const dataBuffers = [];

  pngEntries.forEach((entry, idx) => {
    const { width, height, buffer } = entry;
    const size = buffer.length;

    const entryOffset = idx * entrySize;
    entriesBuffer.writeUInt8(width === 256 ? 0 : width, entryOffset + 0);
    entriesBuffer.writeUInt8(height === 256 ? 0 : height, entryOffset + 1);
    entriesBuffer.writeUInt8(0, entryOffset + 2);
    entriesBuffer.writeUInt8(0, entryOffset + 3);
    entriesBuffer.writeUInt16LE(1, entryOffset + 4);
    entriesBuffer.writeUInt16LE(32, entryOffset + 6);
    entriesBuffer.writeUInt32LE(size, entryOffset + 8);
    entriesBuffer.writeUInt32LE(currentOffset, entryOffset + 12);

    currentOffset += size;
    dataBuffers.push(buffer);
  });

  const headerBuffer = Buffer.alloc(6);
  headerBuffer.writeUInt16LE(0, 0);
  headerBuffer.writeUInt16LE(1, 2);
  headerBuffer.writeUInt16LE(count, 4);

  return Buffer.concat([headerBuffer, entriesBuffer, ...dataBuffers]);
}

async function renderSvgToPng(browser, svgContent, width, height, transparent = true) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100%; 
      background: ${transparent ? 'transparent' : '#ffffff'}; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      overflow: hidden;
    }
    svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'load' });
  const buffer = await page.screenshot({ omitBackground: transparent, type: 'png' });
  await page.close();
  return buffer;
}

async function main() {
  console.log('================================================================');
  console.log(' BIRD ACADEMY — GENERATION INTEGRALE DES ASSETS DE MARQUE       ');
  console.log('================================================================');

  // Save SVGs
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo-icon.svg'), ICON_SVG, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo.svg'), ICON_SVG, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo-full.svg'), FULL_LOGO_SVG, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo-full-dark.svg'), FULL_LOGO_DARK_SVG, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon.svg'), ICON_SVG, 'utf8');
  fs.writeFileSync(path.join(BUILD_ICONS_DIR, 'icon-user.svg'), ICON_SVG, 'utf8');

  console.log('✅ SVGs vectoriels enregistrés.');

  // Launch browser for rasterization
  const browser = await chromium.launch();

  console.log('⏳ Génération des dérivés raster PNG...');

  // 1. Icon resolutions (512, 256, 192, 180, 128, 64, 48, 32, 16)
  const icon512 = await renderSvgToPng(browser, ICON_SVG, 512, 512);
  const icon256 = await renderSvgToPng(browser, ICON_SVG, 256, 256);
  const icon192 = await renderSvgToPng(browser, ICON_SVG, 192, 192);
  const icon180 = await renderSvgToPng(browser, ICON_SVG, 180, 180);
  const icon128 = await renderSvgToPng(browser, ICON_SVG, 128, 128);
  const icon64 = await renderSvgToPng(browser, ICON_SVG, 64, 64);
  const icon48 = await renderSvgToPng(browser, ICON_SVG, 48, 48);
  const icon32 = await renderSvgToPng(browser, ICON_SVG, 32, 32);
  const icon16 = await renderSvgToPng(browser, ICON_SVG, 16, 16);

  // 2. Full Horizontal Logo (800x200 @2x, 400x100 @1x)
  const logoFullPng = await renderSvgToPng(browser, FULL_LOGO_SVG, 800, 200);
  const logoFullDarkPng = await renderSvgToPng(browser, FULL_LOGO_DARK_SVG, 800, 200);
  const logoIconPng = await renderSvgToPng(browser, ICON_SVG, 256, 256);

  // Write PNG files to target directories
  // Web Assets: public/assets/images/
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo-full.png'), logoFullPng);
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo-full-dark.png'), logoFullDarkPng);
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo-icon.png'), logoIconPng);
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'logo.png'), logoFullPng);
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'icon.png'), icon512);
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'apple-touch-icon.png'), icon180);

  // Public root icons (PWA & favicons)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), icon512);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-192.png'), icon192);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), icon180);

  // Tauri icons: src-tauri/icons/
  fs.writeFileSync(path.join(TAURI_ICONS_DIR, '32x32.png'), icon32);
  fs.writeFileSync(path.join(TAURI_ICONS_DIR, '128x128.png'), icon128);
  fs.writeFileSync(path.join(TAURI_ICONS_DIR, '128x128@2x.png'), icon256);
  fs.writeFileSync(path.join(TAURI_ICONS_DIR, 'icon.png'), icon512);

  const squareSizes = [30, 44, 71, 89, 107, 142, 150, 284, 310];
  for (const s of squareSizes) {
    const buf = await renderSvgToPng(browser, ICON_SVG, s, s);
    fs.writeFileSync(path.join(TAURI_ICONS_DIR, `Square${s}x${s}Logo.png`), buf);
  }
  const storeLogoBuf = await renderSvgToPng(browser, ICON_SVG, 50, 50);
  fs.writeFileSync(path.join(TAURI_ICONS_DIR, 'StoreLogo.png'), storeLogoBuf);

  // Build / Electron icons: build/icons/
  fs.writeFileSync(path.join(BUILD_ICONS_DIR, 'icon-user.png'), icon512);

  // Build Multi-resolution ICOs
  const icoEntries = [
    { width: 256, height: 256, buffer: icon256 },
    { width: 128, height: 128, buffer: icon128 },
    { width: 64, height: 64, buffer: icon64 },
    { width: 48, height: 48, buffer: icon48 },
    { width: 32, height: 32, buffer: icon32 },
    { width: 16, height: 16, buffer: icon16 }
  ];

  const icoBuffer = createIcoFromPngBuffers(icoEntries);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(PUBLIC_IMAGES_DIR, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(BUILD_ICONS_DIR, 'icon-user.ico'), icoBuffer);
  fs.writeFileSync(path.join(BUILD_DIR, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(TAURI_ICONS_DIR, 'icon.ico'), icoBuffer);

  await browser.close();

  console.log('✅ Tous les dérivés PNG & ICO générés avec succès !');
  console.log(`- logo-full.png (${(logoFullPng.length / 1024).toFixed(1)} KB)`);
  console.log(`- logo-icon.png (${(logoIconPng.length / 1024).toFixed(1)} KB)`);
  console.log(`- favicon.ico (${(icoBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`- apple-touch-icon.png (${(icon180.length / 1024).toFixed(1)} KB)`);
  console.log(`- icon.ico & icon.png (${(icon512.length / 1024).toFixed(1)} KB)`);
}

main().catch(err => {
  console.error('❌ Erreur génération assets:', err);
  process.exit(1);
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — AUTOMATED ANTI-OLD-ASSETS AUDIT (MISSION BRAND-ASSETS-001)
 * 
 * Ce test audite de façon exhaustive tous les fichiers de code source et de configuration :
 * - src/ (tous les composants TSX et services TS)
 * - electron-main.cjs, electron-builder-*.json
 * - index.html, admin.html
 * - vite.config.ts
 * - site web/
 * 
 * Objectif strict imposé par le mandat :
 * OLD_BIRD_ACADEMY_ASSETS_FOUND = 0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Motifs des anciens assets strictement interdits dans l'application active
const FORBIDDEN_PATTERNS = [
  // 1. Anciens fichiers d'icônes obsolètes
  { id: 'OLD_LOGO_PNG', pattern: /(?:^|[\/\'\"\`])bird-academy-logo\.png/ },
  { id: 'OLD_ICON_SVG', pattern: /(?:^|[\/\'\"\`])icon\.svg(?:[\'\"\`\s]|$)/ },
  { id: 'OLD_ICON_192', pattern: /(?:^|[\/\'\"\`])icon-192\.png/ },
  { id: 'OLD_ICON_512', pattern: /(?:^|[\/\'\"\`])icon-512\.png/ },

  // 2. Chemins absolus racines cassés en environnement file:// (Electron desktop)
  { id: 'BROKEN_ROOT_LOGO_ICON', pattern: /src\s*=\s*[\"\']\/assets\/images\/logo-icon\.png[\"\']/ },
  { id: 'BROKEN_ROOT_LOGO_FULL', pattern: /src\s*=\s*[\"\']\/assets\/images\/logo-full\.png[\"\']/ },
  { id: 'BROKEN_ROOT_LOGO_DARK', pattern: /src\s*=\s*[\"\']\/assets\/images\/logo-full-dark\.png[\"\']/ },
  { id: 'BROKEN_ROOT_FALLBACK_SVG', pattern: /src\s*=\s*[\"\']\/icon\.svg[\"\']/ }
];

function scanFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === 'dist_user' ||
      entry.name === 'dist_admin' ||
      entry.name === 'Release' ||
      entry.name.startsWith('RELEASE_ARCHIVE') ||
      entry.name === '.next' ||
      entry.name === 'scratch'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      scanFiles(fullPath, fileList);
    } else if (
      entry.name.endsWith('.tsx') ||
      entry.name.endsWith('.ts') ||
      entry.name.endsWith('.html') ||
      entry.name.endsWith('.cjs') ||
      (entry.name.startsWith('electron-builder') && entry.name.endsWith('.json'))
    ) {
      // Exclure les fichiers de test d'audit eux-mêmes
      if (entry.name.includes('anti-old-assets') || entry.name.includes('brand-broken-logo')) {
        continue;
      }
      fileList.push(fullPath);
    }
  }

  return fileList;
}

test('ANTI-OLD-ASSETS-01 : Zéro référence restante vers les anciens assets ou chemins racines cassés', () => {
  const targetFiles: string[] = [];
  
  // Scanne src, root html, electron, site web
  scanFiles(path.join(ROOT_DIR, 'src'), targetFiles);
  targetFiles.push(path.join(ROOT_DIR, 'index.html'));
  targetFiles.push(path.join(ROOT_DIR, 'admin.html'));
  targetFiles.push(path.join(ROOT_DIR, 'electron-main.cjs'));
  targetFiles.push(path.join(ROOT_DIR, 'electron-builder-user.json'));
  targetFiles.push(path.join(ROOT_DIR, 'electron-builder-admin.json'));
  targetFiles.push(path.join(ROOT_DIR, 'vite.config.ts'));
  if (fs.existsSync(path.join(ROOT_DIR, 'site web', 'site-bird-academy.html'))) {
    targetFiles.push(path.join(ROOT_DIR, 'site web', 'site-bird-academy.html'));
  }

  const violations: Array<{ file: string; line: number; patternId: string; snippet: string }> = [];

  for (const file of targetFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIdx) => {
      for (const rule of FORBIDDEN_PATTERNS) {
        if (rule.pattern.test(line)) {
          violations.push({
            file: path.relative(ROOT_DIR, file),
            line: lineIdx + 1,
            patternId: rule.id,
            snippet: line.trim().substring(0, 100)
          });
        }
      }
    });
  }

  const OLD_BIRD_ACADEMY_ASSETS_FOUND = violations.length;

  if (OLD_BIRD_ACADEMY_ASSETS_FOUND > 0) {
    console.error('❌ Des références aux anciens assets ont été trouvées :', violations);
  }

  console.log(`\n======================================================`);
  console.log(` AUDIT ANTI-ANCIENS-ASSETS BIRD ACADEMY               `);
  console.log(` Fichiers scannés : ${targetFiles.length}             `);
  console.log(` OLD_BIRD_ACADEMY_ASSETS_FOUND = ${OLD_BIRD_ACADEMY_ASSETS_FOUND} `);
  console.log(`======================================================\n`);

  assert.strictEqual(
    OLD_BIRD_ACADEMY_ASSETS_FOUND,
    0,
    `L'audit doit trouver 0 ancien asset, mais ${OLD_BIRD_ACADEMY_ASSETS_FOUND} ont été trouvés`
  );
});

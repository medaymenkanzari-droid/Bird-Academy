/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: WEB-TESTER-KIT-002
 * Generate authentic A4 printable PDF documents for Android Field Tester Kit.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const rootDir = path.resolve(__dirname, '..');
const downloadsDir = path.join(rootDir, 'public', 'downloads');

const kitDocuments = [
  'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
  'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
  'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
  'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
  'QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md',
  'QA_ANDROID_FIELD_HANDOFF_001_PACK.md',
  'QA_ANDROID_FIELD_HANDOFF_001_README.md',
  'QA_ANDROID_FIELD_EXECUTION_001_REPORT.md',
  'QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md',
  'QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md',
  'QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md',
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdownToPrintHtml(mdText, filename) {
  const lines = mdText.split('\n');
  let html = '';
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    // Code block
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++;
      html += `<pre class="code-block"><code>${codeLines.join('\n')}</code></pre>\n`;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      html += `<h1>${formatInline(line.slice(2))}</h1>\n`;
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2>${formatInline(line.slice(3))}</h2>\n`;
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3>${formatInline(line.slice(4))}</h3>\n`;
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      html += `<h4>${formatInline(line.slice(5))}</h4>\n`;
      i++;
      continue;
    }

    // HR
    if (line.trim() === '---' || line.trim() === '***') {
      html += `<hr />\n`;
      i++;
      continue;
    }

    // Blockquote / Alert
    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const first = quoteLines[0] || '';
      let alertClass = 'alert-note';
      let alertTitle = 'Note';
      if (first.includes('[!WARNING]')) { alertClass = 'alert-warning'; alertTitle = 'Avertissement'; }
      else if (first.includes('[!IMPORTANT]')) { alertClass = 'alert-important'; alertTitle = 'Important'; }
      else if (first.includes('[!TIP]')) { alertClass = 'alert-tip'; alertTitle = 'Conseil'; }
      else if (first.includes('[!CAUTION]')) { alertClass = 'alert-caution'; alertTitle = 'Attention'; }

      const body = first.includes('[!') ? quoteLines.slice(1) : quoteLines;
      html += `<div class="alert ${alertClass}"><strong>${alertTitle}</strong><br/>${body.map(l => formatInline(l)).join('<br/>')}</div>\n`;
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.includes('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
        const rows = tableLines.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
        html += `<table class="print-table"><thead><tr>`;
        headers.forEach(h => html += `<th>${formatInline(h)}</th>`);
        html += `</tr></thead><tbody>`;
        rows.forEach(r => {
          html += `<tr>`;
          r.forEach(c => html += `<td>${formatInline(c)}</td>`);
          html += `</tr>`;
        });
        html += `</tbody></table>\n`;
        continue;
      }
    }

    // Checklist
    const chkMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
    if (chkMatch) {
      const isChecked = chkMatch[2].toLowerCase() === 'x';
      html += `<div class="checklist-item"><span class="chkbox ${isChecked ? 'checked' : ''}">${isChecked ? '✓' : ''}</span> <span>${formatInline(chkMatch[3])}</span></div>\n`;
      i++;
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (ulMatch) {
      html += `<div class="list-item"><span class="bullet">•</span> <span>${formatInline(ulMatch[2])}</span></div>\n`;
      i++;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (olMatch) {
      html += `<div class="list-item"><span class="num">${olMatch[2]}.</span> <span>${formatInline(olMatch[3])}</span></div>\n`;
      i++;
      continue;
    }

    // Blank
    if (!line.trim()) {
      i++;
      continue;
    }

    html += `<p>${formatInline(line)}</p>\n`;
    i++;
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(filename)} — Bird Academy Enterprise v1.3.6</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 18mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #1e293b;
      margin: 0;
      padding: 0;
    }
    .header-band {
      border-bottom: 2px solid #4338ca;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title {
      font-size: 8pt;
      font-weight: bold;
      color: #4338ca;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-meta {
      font-size: 8pt;
      color: #64748b;
      font-family: monospace;
    }
    h1 {
      font-size: 16pt;
      color: #0f172a;
      margin: 12px 0 6px 0;
      line-height: 1.25;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    h2 {
      font-size: 12pt;
      color: #1e293b;
      margin: 12px 0 4px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
    }
    h3 {
      font-size: 10.5pt;
      color: #334155;
      margin: 10px 0 3px 0;
    }
    h4 {
      font-size: 9.5pt;
      color: #475569;
      margin: 8px 0 2px 0;
    }
    p {
      margin: 4px 0;
    }
    hr {
      border: 0;
      border-top: 1px solid #cbd5e1;
      margin: 12px 0;
    }
    .print-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 10px 0;
      page-break-inside: auto;
    }
    .print-table th, .print-table td {
      border: 1px solid #cbd5e1;
      padding: 4.5px 6px;
      text-align: left;
      vertical-align: top;
    }
    .print-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
    }
    .print-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .checklist-item {
      display: flex;
      align-items: flex-start;
      margin: 3px 0;
      font-size: 9pt;
    }
    .chkbox {
      display: inline-block;
      width: 11px;
      height: 11px;
      border: 1px solid #475569;
      margin-right: 6px;
      margin-top: 2px;
      font-size: 8pt;
      line-height: 11px;
      text-align: center;
      font-weight: bold;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .chkbox.checked {
      background-color: #059669;
      color: white;
      border-color: #059669;
    }
    .list-item {
      display: flex;
      align-items: flex-start;
      margin: 2.5px 0;
      font-size: 9pt;
    }
    .bullet, .num {
      margin-right: 6px;
      font-weight: bold;
      color: #4338ca;
      flex-shrink: 0;
    }
    .alert {
      border: 1px solid #cbd5e1;
      border-left: 4px solid #4338ca;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 4px;
      background-color: #f8fafc;
      font-size: 8.5pt;
    }
    .alert-warning {
      border-left-color: #d97706;
      background-color: #fffbeb;
      color: #78350f;
    }
    .alert-important {
      border-left-color: #7c3aed;
      background-color: #f5f3ff;
      color: #4c1d95;
    }
    .badge {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: bold;
      border: 1px solid transparent;
    }
    .badge-pass { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
    .badge-fail { background-color: #ffe4e6; color: #9f1239; border-color: #fecdd3; }
    .badge-blocked { background-color: #fef3c7; color: #92400e; border-color: #fde68a; }
    .badge-not-tested { background-color: #f1f5f9; color: #334155; border-color: #cbd5e1; }
    .badge-confirm { background-color: #e0f2fe; color: #0369a1; border-color: #bae6fd; font-family: monospace; }
    .code-block {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 8px;
      border-radius: 4px;
      font-size: 8pt;
      overflow-x: hidden;
      white-space: pre-wrap;
      word-break: break-all;
    }
    code {
      font-family: Consolas, Monaco, "Andale Mono", monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      padding: 1px 3px;
      border-radius: 3px;
      color: #4338ca;
    }
  </style>
</head>
<body>
  <div class="header-band">
    <div class="header-title">Bird Academy Enterprise — Kit de Recette Terrain Android</div>
    <div class="header-meta">v1.3.6 • BUILD_ID BA-V1.3.6 • ${escapeHtml(filename)}</div>
  </div>
  ${html}
</body>
</html>`;
}

function formatInline(str) {
  let s = escapeHtml(str);
  // Bold
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Code
  s = s.replace(/`(.*?)`/g, '<code>$1</code>');
  // Badges
  s = s.replace(/\bPASS\b/g, '<span class="badge badge-pass">PASS</span>');
  s = s.replace(/\bFAIL\b/g, '<span class="badge badge-fail">FAIL</span>');
  s = s.replace(/\bBLOCKED\b/g, '<span class="badge badge-blocked">BLOCKED</span>');
  s = s.replace(/\bNOT TESTED\b/g, '<span class="badge badge-not-tested">NOT TESTED</span>');
  s = s.replace(/\bCONFORME\b/g, '<span class="badge badge-pass">CONFORME</span>');
  s = s.replace(/\[A_CONFIRMER\]/g, '<span class="badge badge-confirm">[A_CONFIRMER]</span>');
  // Inline boxes [ ], [x], [X]
  s = s.replace(/\[ \]/g, '<span class="chkbox"></span>');
  s = s.replace(/\[[xX]\]/g, '<span class="chkbox checked">✓</span>');
  return s;
}

async function generateAll() {
  console.log('=== GÉNÉRATION DES VRAIS FICHIERS PDF A4 POUR LE KIT TESTEUR ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const doc of kitDocuments) {
    const mdPath = path.join(downloadsDir, doc);
    if (!fs.existsSync(mdPath)) {
      console.warn(`[SKIP] Fichier source absent: ${doc}`);
      continue;
    }

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const htmlContent = parseMarkdownToPrintHtml(mdContent, doc);
    const pdfFilename = doc.replace(/\.md$/, '.pdf');
    const pdfPath = path.join(downloadsDir, pdfFilename);

    await page.setContent(htmlContent, { waitUntil: 'load' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '18mm',
        left: '15mm',
        right: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 7.5pt; color: #94a3b8; width: 100%; padding: 0 15mm; display: flex; justify-content: space-between; font-family: sans-serif;">
          <span>Bird Academy Enterprise v1.3.6 — Document Officiel de Recette</span>
          <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
        </div>
      `,
    });

    const stat = fs.statSync(pdfPath);
    const headerBuf = Buffer.alloc(10);
    const fd = fs.openSync(pdfPath, 'r');
    fs.readSync(fd, headerBuf, 0, 10, 0);
    fs.closeSync(fd);
    const isRealPdf = headerBuf.toString('ascii').startsWith('%PDF-');

    console.log(`✓ ${pdfFilename} généré : ${stat.size} octets, Format réel : ${isRealPdf ? 'OUI (%PDF-)' : 'NON'}`);
  }

  await browser.close();
  console.log('=== FIN DE LA GÉNÉRATION DES PDF A4 ===');
}

generateAll().catch(err => {
  console.error('Erreur lors de la génération PDF:', err);
  process.exit(1);
});

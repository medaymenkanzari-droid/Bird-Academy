/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - STATISTICS PDF TEST SUITE (V1.3.0)
 * Automated tests for Statistics PDF generation, binary validation (%PDF-1.4, %%EOF),
 * multi-language support (FR, EN, AR, ES, IT), Arabic RTL, error codes PDF-STAT-01..04,
 * and non-regression across Dépenses, Ventes, Calendrier & Généalogie.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { generateRealPdfBinary, PDFReportData } from '../src/utils/pdfDocumentGenerator';
import { validateRealPdfBinary, exportDocumentAsPDF } from '../src/utils/printUtils';

test('STAT-PDF-01: PDF generator compiles valid %PDF-1.4 binary for all 8 report types', () => {
  const reportTypes = ['exec', 'breeding', 'health', 'finance', 'habitat', 'genetics', 'nursery', 'dqi'] as const;

  for (const reportType of reportTypes) {
    const reportData: PDFReportData = {
      title: `Rapport Statistiques - ${reportType.toUpperCase()}`,
      subtitle: 'Audit automatisé v1.3.0',
      dateStr: '2026-08-11',
      language: 'fr',
      isRtl: false,
      sections: [
        {
          title: 'Synthèse des Indicateurs',
          metrics: [
            { label: 'Indicateur A', value: '100%' },
            { label: 'Indicateur B', value: '42' },
          ],
        },
        {
          title: 'Tableau de Données',
          table: {
            headers: ['Axe', 'Valeur', 'Réf'],
            rows: [
              ['Ligne 1', '10', '12'],
              ['Ligne 2', '20', '22'],
            ],
          },
        },
      ],
    };

    const bytes = generateRealPdfBinary(reportData);
    assert.ok(bytes instanceof Uint8Array, `Report ${reportType} must return Uint8Array`);
    assert.ok(bytes.length > 0, `Report ${reportType} must have non-zero bytes`);

    const validation = validateRealPdfBinary(bytes);
    assert.equal(validation.isValid, true, `Report ${reportType} PDF validation failed: ${validation.error}`);
  }
});

test('STAT-PDF-02 & STAT-PDF-03: PDF magic header (%PDF-1.4) validation', () => {
  const data: PDFReportData = {
    title: 'Test Header PDF',
    language: 'fr',
    sections: [{ title: 'Section 1', metrics: [{ label: 'Metric', value: '1' }] }],
  };

  const bytes = generateRealPdfBinary(data);
  let header = '';
  for (let i = 0; i < 5; i++) {
    header += String.fromCharCode(bytes[i]);
  }

  assert.equal(header, '%PDF-', 'PDF file must start with %PDF- header');
});

test('STAT-PDF-04: PDF trailer (%%EOF) marker validation', () => {
  const data: PDFReportData = {
    title: 'Test Trailer PDF',
    language: 'fr',
    sections: [{ title: 'Section 1', textLines: ['Line 1'] }],
  };

  const bytes = generateRealPdfBinary(data);
  let tail = '';
  for (let i = bytes.length - 20; i < bytes.length; i++) {
    tail += String.fromCharCode(bytes[i]);
  }

  assert.ok(tail.includes('%%EOF'), 'PDF file must end with %%EOF trailer');
});

test('STAT-PDF-05 & STAT-PDF-06: Multi-language (FR, EN, AR, ES, IT) & Arabic RTL support', () => {
  const languages = ['fr', 'en', 'ar', 'es', 'it'] as const;

  for (const lang of languages) {
    const isRtl = lang === 'ar';
    const data: PDFReportData = {
      title: lang === 'ar' ? 'تقرير الإحصائيات' : `Statistics Report ${lang.toUpperCase()}`,
      language: lang,
      isRtl,
      sections: [
        {
          title: lang === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary',
          metrics: [{ label: 'KPI', value: '95%' }],
        },
      ],
    };

    const bytes = generateRealPdfBinary(data);
    const validation = validateRealPdfBinary(bytes);
    assert.equal(validation.isValid, true, `Language ${lang} PDF output must be valid PDF`);
  }
});

test('STAT-PDF-07: Error codes PDF-STAT-02 & PDF-STAT-03 properly catch corrupted PDF binary', () => {
  const emptyBytes = new Uint8Array(0);
  const emptyVal = validateRealPdfBinary(emptyBytes);
  assert.equal(emptyVal.isValid, false);
  assert.ok(emptyVal.error?.includes('empty'));

  const invalidHeaderBytes = new Uint8Array([65, 66, 67, 68, 69]); // "ABCDE"
  const headerVal = validateRealPdfBinary(invalidHeaderBytes);
  assert.equal(headerVal.isValid, false);
  assert.ok(headerVal.error?.includes('Invalid PDF magic header'));

  const invalidTailBytes = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]); // "%PDF-1.4" without %%EOF
  const tailVal = validateRealPdfBinary(invalidTailBytes);
  assert.equal(tailVal.isValid, false);
  assert.ok(tailVal.error?.includes('%%EOF'));
});

test('STAT-PDF-08: Non-regression check on Dépenses, Ventes, Calendrier & Généalogie PDF exports', async () => {
  const modules = [
    { title: 'Dépenses d\'Élevage', subtitle: 'Gestion financière' },
    { title: 'Ventes & Cessions', subtitle: 'Registres des ventes' },
    { title: 'Calendrier de Nidation', subtitle: 'Planification' },
    { title: 'Arbre Généalogique', subtitle: 'Filiation génétique' },
  ];

  for (const mod of modules) {
    const data: PDFReportData = {
      title: mod.title,
      subtitle: mod.subtitle,
      language: 'fr',
      isRtl: false,
      sections: [
        {
          title: 'Synthèse',
          metrics: [{ label: 'Total', value: '100' }],
        },
      ],
    };

    const bytes = generateRealPdfBinary(data);
    const validation = validateRealPdfBinary(bytes);
    assert.equal(validation.isValid, true, `Non-regression module ${mod.title} must produce valid PDF`);
  }
});

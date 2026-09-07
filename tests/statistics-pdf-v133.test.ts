/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * V1.3.3 MOBILE QA ROOT FIX - TEST SUITE 04
 * Real PDF Binary Generator Byte Offset & Structure Test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateRealPdfBinary, PDFReportData } from '../src/utils/pdfDocumentGenerator.ts';
import { validateRealPdfBinary } from '../src/utils/printUtils.ts';

describe('V1.3.3 - BUG-04 Statistics PDF Generator (PDF-STAT-01 Fix)', () => {
  const sampleReport: PDFReportData = {
    title: 'RAPPORT DE PERFORMANCE ÉLEVAGE 2026',
    subtitle: 'Statistiques consolidées de la volière',
    dateStr: '12/08/2026',
    language: 'fr',
    isRtl: false,
    sections: [
      {
        title: 'KPI Financiers & Productivité',
        metrics: [
          { label: 'Chiffre d\'Affaires', value: '1500 TND' },
          { label: 'Total Charges', value: '450 TND' },
        ],
        table: {
          headers: ['Mois', 'Naissances', 'Mortalité', 'Taux Fertilité'],
          rows: [
            ['Janvier', '12', '0', '92%'],
            ['Février', '18', '1', '88%'],
          ]
        }
      }
    ]
  };

  it('should generate a binary Uint8Array starting with %PDF-1.4 header', () => {
    const pdfBytes = generateRealPdfBinary(sampleReport);
    assert.ok(pdfBytes instanceof Uint8Array);
    assert.ok(pdfBytes.length > 500);

    const header = new TextDecoder('ascii').decode(pdfBytes.subarray(0, 8));
    assert.strictEqual(header, '%PDF-1.4');
  });

  it('should pass validateRealPdfBinary strictly verifying xref offsets & EOF trailer', () => {
    const pdfBytes = generateRealPdfBinary(sampleReport);
    const result = validateRealPdfBinary(pdfBytes);
    assert.strictEqual(result.isValid, true);
  });

  it('should work seamlessly across all 5 languages and RTL mode', () => {
    const languages = ['fr', 'en', 'ar', 'es', 'it'];
    languages.forEach((lang) => {
      const data: PDFReportData = { ...sampleReport, language: lang, isRtl: lang === 'ar' };
      const bytes = generateRealPdfBinary(data);
      const result = validateRealPdfBinary(bytes);
      assert.strictEqual(result.isValid, true);
    });
  });
});

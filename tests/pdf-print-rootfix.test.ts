/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - REAL PDF & PRINT SYSTEM SUITE
 * Verifies real %PDF-1.4 binary file generation, magic headers, trailer markers, and multi-language RTL support.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRealPdfBinary, PDFReportData } from '../src/utils/pdfDocumentGenerator';
import { validateRealPdfBinary, exportDocumentAsPDF } from '../src/utils/printUtils';

test('Real PDF & Print Root Cause System Suite', async (t) => {

  await t.test('PRINT-01 to PRINT-04: Genuine %PDF-1.4 Binary Generation & Validation', () => {
    const reportData: PDFReportData = {
      title: 'Rapport Statistiques D\'Élevage',
      subtitle: 'Performances globales de la volière',
      language: 'fr',
      sections: [
        {
          title: 'Synthèse Financière',
          metrics: [
            { label: 'Revenus Total', value: '+1450 €' },
            { label: 'Dépenses Total', value: '-320 €' },
            { label: 'Marge Nette', value: '+1130 €' },
          ],
          table: {
            headers: ['Mois', 'Revenus', 'Charges', 'Bénéfice'],
            rows: [
              ['Janvier', '450 €', '100 €', '+350 €'],
              ['Février', '500 €', '120 €', '+380 €'],
              ['Mars', '500 €', '100 €', '+400 €'],
            ],
          },
        },
      ],
    };

    const pdfBytes = generateRealPdfBinary(reportData);

    // 1. Non-zero byte size
    assert.ok(pdfBytes && pdfBytes.length > 200, `PDF size should be > 200 bytes, got ${pdfBytes?.length}`);

    // 2. Binary magic header starts with %PDF-
    let headerStr = '';
    for (let i = 0; i < 5; i++) {
      headerStr += String.fromCharCode(pdfBytes[i]);
    }
    assert.equal(headerStr, '%PDF-');

    // 3. Trailer contains %%EOF
    let fullStr = '';
    for (let i = 0; i < pdfBytes.length; i++) {
      fullStr += String.fromCharCode(pdfBytes[i]);
    }
    assert.ok(fullStr.includes('%%EOF'));
    assert.ok(fullStr.includes('/Catalog'));
    assert.ok(fullStr.includes('/Pages'));

    // 4. Validate through printUtils helper
    const check = validateRealPdfBinary(pdfBytes);
    assert.equal(check.isValid, true, `Validation failed: ${check.error}`);
  });

  await t.test('PRINT-05 to PRINT-08: PDF Generation for all 4 Core Modules (Statistiques, Dépenses, Ventes, Calendrier)', () => {
    const modules: PDFReportData[] = [
      {
        title: 'Statistiques & Élevage',
        language: 'fr',
        sections: [{ title: 'Indicateurs', metrics: [{ label: 'Taux Éclosion', value: '85%' }] }],
      },
      {
        title: 'Rapport Dépenses',
        language: 'fr',
        sections: [{ title: 'Achats Graines', metrics: [{ label: 'Montant', value: '45 €' }] }],
      },
      {
        title: 'Rapport Ventes',
        language: 'fr',
        sections: [{ title: 'Cessions Canaris', metrics: [{ label: 'Total', value: '350 €' }] }],
      },
      {
        title: 'Calendrier de Reproduction',
        language: 'fr',
        sections: [{ title: 'Naissances Prévues', metrics: [{ label: 'Couvées', value: '4' }] }],
      },
    ];

    modules.forEach((mod) => {
      const pdfBytes = generateRealPdfBinary(mod);
      const val = validateRealPdfBinary(pdfBytes);
      assert.equal(val.isValid, true, `Module ${mod.title} failed PDF validation`);
    });
  });

  await t.test('PRINT-09 to PRINT-15: Multi-language (FR, EN, AR, ES, IT) & Arabic RTL PDF layout', () => {
    const languages = [
      { lang: 'fr', isRtl: false, title: 'Rapport de Volière' },
      { lang: 'en', isRtl: false, title: 'Aviary Report' },
      { lang: 'ar', isRtl: true, title: 'تقرير إدارة الطيور' },
      { lang: 'es', isRtl: false, title: 'Reporte de Aviario' },
      { lang: 'it', isRtl: false, title: 'Rapporto di Allevamento' },
    ];

    languages.forEach((item) => {
      const report: PDFReportData = {
        title: item.title,
        language: item.lang,
        isRtl: item.isRtl,
        sections: [
          {
            title: item.lang === 'ar' ? 'ملخص عام' : 'General Summary',
            metrics: [{ label: item.lang === 'ar' ? 'عدد الطيور' : 'Bird Count', value: '42' }],
          },
        ],
      };

      const bytes = generateRealPdfBinary(report);
      const val = validateRealPdfBinary(bytes);
      assert.equal(val.isValid, true, `Language ${item.lang} failed PDF check`);
    });
  });

  await t.test('PRINT-16 to PRINT-17: Export function handles download & fallback cleanly', async () => {
    // Setup window/navigator/document mocks for Node environment testing
    if (typeof globalThis.window === 'undefined') {
      (globalThis as any).window = {
        URL: {
          createObjectURL: () => 'blob:http://localhost/mock-pdf-url',
          revokeObjectURL: () => {},
        },
      };
    }
    if (typeof globalThis.document === 'undefined') {
      (globalThis as any).document = {
        createElement: () => ({
          setAttribute: () => {},
          style: {},
          click: () => {},
        }),
        body: {
          appendChild: () => {},
          removeChild: () => {},
        },
      };
    }

    const report: PDFReportData = {
      title: 'Export Test Report',
      language: 'fr',
      sections: [{ title: 'Test Section', metrics: [{ label: 'Status', value: 'OK' }] }],
    };

    const res = await exportDocumentAsPDF(report);
    assert.equal(res.success, true);
    assert.ok(res.method === 'download' || res.method === 'share');
  });
});

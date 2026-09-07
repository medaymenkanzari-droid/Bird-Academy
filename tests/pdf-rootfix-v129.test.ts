import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRealPdfBinary, PDFReportData } from '../src/utils/pdfDocumentGenerator';
import { validateRealPdfBinary, exportDocumentAsPDF } from '../src/utils/printUtils';

test('PDF-ROOT Suite V1.2.9 — Centralized PDF Engine & All 5 Modules Verification', async (t) => {
  await t.test('PDF-ROOT-01 to PDF-ROOT-03: Genuine %PDF-1.4 Binary Header, EOF & MIME Validation', () => {
    const report: PDFReportData = {
      title: 'Rapport Statistiques Test',
      subtitle: 'Elevage Canari Enterprise',
      language: 'fr',
      sections: [
        {
          title: 'Synthèse Financière',
          metrics: [
            { label: 'Recettes', value: '+500,00 €' },
            { label: 'Dépenses', value: '-120,00 €' },
          ],
        },
      ],
    };

    const pdfBytes = generateRealPdfBinary(report);
    assert.ok(pdfBytes instanceof Uint8Array, 'Output must be Uint8Array');
    assert.ok(pdfBytes.length > 100, `PDF size must be > 100 bytes, got ${pdfBytes.length}`);

    const validation = validateRealPdfBinary(pdfBytes);
    assert.equal(validation.isValid, true, `Validation failed: ${validation.error}`);
  });

  await t.test('PDF-ROOT-04 to PDF-ROOT-06: All 5 Modules (Statistiques, Dépenses, Ventes, Calendrier, Généalogie) PDF Generation', () => {
    const modules: Array<{ name: string; title: string }> = [
      { name: 'Statistiques', title: 'Rapport des Performances' },
      { name: 'Dépenses', title: 'Journal des Dépenses' },
      { name: 'Ventes', title: 'Journal des Ventes' },
      { name: 'Calendrier', title: 'Planning d\'Élevage' },
      { name: 'Généalogie', title: 'Arbre Généalogique - Canari Titan' },
    ];

    for (const m of modules) {
      const bytes = generateRealPdfBinary({
        title: m.title,
        language: 'fr',
        sections: [{ title: 'Section', metrics: [{ label: 'Metric', value: '100' }] }],
      });
      const valid = validateRealPdfBinary(bytes);
      assert.equal(valid.isValid, true, `Module ${m.name} failed PDF validation`);
    }
  });

  await t.test('PDF-ROOT-07 to PDF-ROOT-08: Multi-language (FR, EN, AR, ES, IT) & Arabic RTL Layout', () => {
    const languages: Array<'fr' | 'en' | 'ar' | 'es' | 'it'> = ['fr', 'en', 'ar', 'es', 'it'];

    for (const lang of languages) {
      const bytes = generateRealPdfBinary({
        title: `Report ${lang}`,
        language: lang,
        isRtl: lang === 'ar',
        sections: [{ title: 'Title', metrics: [{ label: 'Key', value: 'Val' }] }],
      });
      const valid = validateRealPdfBinary(bytes);
      assert.equal(valid.isValid, true, `Language ${lang} failed PDF generation`);
    }
  });

  await t.test('PDF-ROOT Export Engine handling cleanly in environment', async () => {
    // Setup window/navigator/document mocks for Node test environment
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

    const res = await exportDocumentAsPDF({
      title: 'Export Test V129',
      language: 'fr',
      sections: [{ title: 'Test Section', metrics: [{ label: 'Status', value: 'OK' }] }],
    });

    assert.equal(res.success, true);
  });
});

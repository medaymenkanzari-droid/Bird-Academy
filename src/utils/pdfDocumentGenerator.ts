/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE - PURE TS REAL PDF 1.4 MULTI-PAGE GENERATOR
 * Generates genuine binary %PDF-1.4 documents (application/pdf) with valid xref, trailer, and multiple page streams.
 * 100% offline, zero-dependency, cross-platform (Web, Android Capacitor, Desktop).
 */

export interface PDFMetric {
  label: string;
  value: string;
}

export interface PDFTable {
  headers: string[];
  rows: string[][];
}

export interface PDFReportSection {
  title: string;
  metrics?: PDFMetric[];
  table?: PDFTable;
  textLines?: string[];
}

export interface PDFReportData {
  title: string;
  subtitle?: string;
  dateStr?: string;
  language: string;
  isRtl?: boolean;
  sections: PDFReportSection[];
}

export type PDFDocumentDefinition = PDFReportData;

/**
 * System text encoder helper ensuring browser / Node compatibility
 */
const SystemTextEncoder = {
  encode(str: string): Uint8Array {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str);
    }
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i) & 0xff;
    }
    return buf;
  }
};

/**
 * Escapes characters for PDF literal string format (WinAnsi encoding)
 * Converts non-ASCII to octal escapes so all returned text is 7-bit ASCII.
 */
function escapePdfText(text: string): string {
  if (!text) return '';
  const sanitized = text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\r\n]+/g, ' ');

  let result = '';
  for (let i = 0; i < sanitized.length; i++) {
    const code = sanitized.charCodeAt(i);
    if (code >= 32 && code <= 126) {
      result += sanitized[i];
    } else if (code >= 128 && code <= 255) {
      // Latin-1 / WinAnsi code (e.g. é, è, à, ç, ñ)
      result += `\\${code.toString(8).padStart(3, '0')}`;
    } else if (code === 8364) {
      // Euro symbol €
      result += '\\240';
    } else {
      // Safe fallback for other Unicode characters
      result += '?';
    }
  }
  return result;
}

interface GeneratedPage {
  pageNumber: number;
  commands: string[];
}

/**
 * Generates a valid %PDF-1.4 Uint8Array binary document using byte-exact offsets
 * with full dynamic multi-page pagination support.
 */
export function generateRealPdfBinary(data: PDFReportData): Uint8Array {
  const isRtl = Boolean(data.isRtl || data.language === 'ar');
  const pageWidth = 595.28;  // A4 Portrait width in points (72 DPI)
  const pageHeight = 841.89; // A4 Portrait height in points
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const footerY = 30;
  const minY = 60; // Minimum usable content Y above footer

  const pages: GeneratedPage[] = [];
  let currentCommands: string[] = [];
  let currentPageNumber = 1;
  let y = pageHeight - margin;

  // Helper to append PDF graphic/text operations to current page
  const addText = (text: string, x: number, fontY: number, size: number, bold = false, colorHex = '111827') => {
    const font = bold ? '/F2' : '/F1';
    const r = (parseInt(colorHex.slice(0, 2), 16) || 0) / 255;
    const g = (parseInt(colorHex.slice(2, 4), 16) || 0) / 255;
    const b = (parseInt(colorHex.slice(4, 6), 16) || 0) / 255;

    let posX = x;
    if (isRtl) {
      const estimatedWidth = text.length * size * 0.5;
      posX = Math.max(margin, pageWidth - x - estimatedWidth);
    }

    currentCommands.push(
      `BT ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg ${font} ${size} Tf ${posX.toFixed(2)} ${fontY.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`
    );
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, colorHex = 'E5E7EB', strokeWidth = 1) => {
    const r = (parseInt(colorHex.slice(0, 2), 16) || 0) / 255;
    const g = (parseInt(colorHex.slice(2, 4), 16) || 0) / 255;
    const b = (parseInt(colorHex.slice(4, 6), 16) || 0) / 255;

    currentCommands.push(
      `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} RG ${strokeWidth} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    );
  };

  const addRect = (x: number, rectY: number, w: number, h: number, fillColorHex = 'F9FAFB') => {
    const r = (parseInt(fillColorHex.slice(0, 2), 16) || 0) / 255;
    const g = (parseInt(fillColorHex.slice(2, 4), 16) || 0) / 255;
    const b = (parseInt(fillColorHex.slice(4, 6), 16) || 0) / 255;

    currentCommands.push(
      `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg ${x.toFixed(2)} ${rectY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
  };

  const startNewPage = () => {
    pages.push({ pageNumber: currentPageNumber, commands: [...currentCommands] });
    currentPageNumber++;
    currentCommands = [];
    y = pageHeight - margin;

    // Continuation Header on pages > 1
    addRect(margin, y - 28, contentWidth, 28, '4F46E5');
    addText('BIRD ACADEMY ENTERPRISE', margin + 12, y - 18, 11, true, 'FFFFFF');
    addText(`${data.title}`, margin + 180, y - 18, 9, false, 'EEF2FF');
    addText(data.dateStr || new Date().toLocaleDateString(), pageWidth - margin - 100, y - 18, 8, false, 'EEF2FF');
    y -= 42;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight < minY) {
      startNewPage();
    }
  };

  // --- PAGE 1: PRIMARY HEADER SECTION ---
  addRect(margin, y - 45, contentWidth, 45, '4F46E5');
  addText('BIRD ACADEMY ENTERPRISE', margin + 15, y - 28, 14, true, 'FFFFFF');
  addText(data.dateStr || new Date().toLocaleDateString(), pageWidth - margin - 120, y - 28, 10, false, 'EEF2FF');
  y -= 60;

  // Document Title & Subtitle
  addText(data.title, margin, y, 18, true, '111827');
  y -= 22;

  if (data.subtitle) {
    addText(data.subtitle, margin, y, 11, false, '4B5563');
    y -= 18;
  }

  addLine(margin, y, pageWidth - margin, y, 'CBD5E1', 1.5);
  y -= 20;

  // --- SECTIONS ---
  (data.sections || []).forEach((section) => {
    ensureSpace(45);

    // Section Title
    addRect(margin, y - 18, contentWidth, 22, 'F1F5F9');
    addText(section.title, margin + 8, y - 14, 12, true, '1E293B');
    y -= 30;

    // Metrics Grid
    if (section.metrics && section.metrics.length > 0) {
      ensureSpace(55);
      const colWidth = (contentWidth - (section.metrics.length - 1) * 10) / Math.min(section.metrics.length, 4);
      section.metrics.forEach((metric, index) => {
        const colX = margin + index * (colWidth + 10);
        addRect(colX, y - 40, colWidth, 40, 'F8FAFC');
        addLine(colX, y - 40, colX + colWidth, y - 40, 'E2E8F0', 1);
        addText(metric.label, colX + 8, y - 15, 9, false, '64748B');
        addText(metric.value, colX + 8, y - 32, 12, true, '4F46E5');
      });
      y -= 52;
    }

    // Text lines
    if (section.textLines && section.textLines.length > 0) {
      section.textLines.forEach((line) => {
        ensureSpace(18);
        addText(line, margin + 5, y, 10, false, '374151');
        y -= 16;
      });
      y -= 10;
    }

    // Table
    if (section.table && section.table.headers.length > 0) {
      const headers = section.table.headers;
      const numCols = headers.length;
      const colW = contentWidth / numCols;

      const drawTableHeader = () => {
        addRect(margin, y - 20, contentWidth, 20, 'E0E7FF');
        headers.forEach((hdr, colIdx) => {
          addText(hdr, margin + colIdx * colW + 6, y - 14, 10, true, '3730A3');
        });
        y -= 22;
      };

      // Table Header Row for initial section
      ensureSpace(42);
      drawTableHeader();

      // Table Data Rows - DYNAMIC MULTI-PAGE
      section.table.rows.forEach((row, rowIdx) => {
        // If row doesn't fit in remaining page height, break to new page
        if (y - 20 < minY) {
          startNewPage();
          drawTableHeader();
        }

        const bg = rowIdx % 2 === 0 ? 'FFFFFF' : 'F9FAFB';
        addRect(margin, y - 18, contentWidth, 18, bg);
        addLine(margin, y - 18, pageWidth - margin, y - 18, 'F1F5F9', 0.5);

        row.forEach((cellText, cellIdx) => {
          addText(cellText, margin + cellIdx * colW + 6, y - 13, 9, false, '1F2937');
        });
        y -= 20;
      });
      y -= 15;
    }
  });

  // Finalize the last page
  pages.push({ pageNumber: currentPageNumber, commands: [...currentCommands] });
  const totalPages = pages.length;

  // --- ADD ACCURATE DYNAMIC FOOTERS TO ALL PAGES ---
  pages.forEach((p) => {
    const rL = (parseInt('E5E7EB'.slice(0, 2), 16) || 0) / 255;
    const gL = (parseInt('E5E7EB'.slice(2, 4), 16) || 0) / 255;
    const bL = (parseInt('E5E7EB'.slice(4, 6), 16) || 0) / 255;
    p.commands.push(
      `${rL.toFixed(2)} ${gL.toFixed(2)} ${bL.toFixed(2)} RG 1 w ${margin.toFixed(2)} ${(footerY + 12).toFixed(2)} m ${(pageWidth - margin).toFixed(2)} ${(footerY + 12).toFixed(2)} l S`
    );

    const brandText = 'Bird Academy Enterprise - Volière Manager (Offline Engine)';
    const rT = (parseInt('9CA3AF'.slice(0, 2), 16) || 0) / 255;
    const gT = (parseInt('9CA3AF'.slice(2, 4), 16) || 0) / 255;
    const bT = (parseInt('9CA3AF'.slice(4, 6), 16) || 0) / 255;
    p.commands.push(
      `BT ${rT.toFixed(2)} ${gT.toFixed(2)} ${bT.toFixed(2)} rg /F1 8 Tf ${margin.toFixed(2)} ${footerY.toFixed(2)} Td (${escapePdfText(brandText)}) Tj ET`
    );

    const pageLabel = `Page ${p.pageNumber} / ${totalPages}`;
    const pageX = pageWidth - margin - 50;
    p.commands.push(
      `BT ${rT.toFixed(2)} ${gT.toFixed(2)} ${bT.toFixed(2)} rg /F1 8 Tf ${pageX.toFixed(2)} ${footerY.toFixed(2)} Td (${escapePdfText(pageLabel)}) Tj ET`
    );
  });

  // --- PDF 1.4 OBJECT COMPILATION (BYTE-EXACT) ---
  // Object IDs:
  // 1: Catalog
  // 2: Pages root
  // 3: Font F1
  // 4: Font F2
  // For page i (0 to totalPages - 1):
  //   pageObjId = 5 + i * 2
  //   contentsObjId = 6 + i * 2
  const totalObjects = 4 + totalPages * 2;
  const kidsList = pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ');

  const objects: { id: number; text: string }[] = [];
  objects.push({ id: 1, text: `1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n` });
  objects.push({ id: 2, text: `2 0 obj\n<</Type /Pages /Count ${totalPages} /Kids [${kidsList}]>>\nendobj\n` });
  objects.push({ id: 3, text: `3 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>\nendobj\n` });
  objects.push({ id: 4, text: `4 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding>>\nendobj\n` });

  pages.forEach((p, i) => {
    const pageObjId = 5 + i * 2;
    const contentsObjId = 6 + i * 2;
    const pageStreamText = p.commands.join('\n');
    const streamBytes = SystemTextEncoder.encode(pageStreamText);

    objects.push({
      id: pageObjId,
      text: `${pageObjId} 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources <</Font <</F1 3 0 R /F2 4 0 R>>>> /Contents ${contentsObjId} 0 R>>\nendobj\n`
    });

    objects.push({
      id: contentsObjId,
      text: `${contentsObjId} 0 obj\n<</Length ${streamBytes.length}>>\nstream\n${pageStreamText}\nendstream\nendobj\n`
    });
  });

  // Sort objects by ID ascending
  objects.sort((a, b) => a.id - b.id);

  const chunks: Uint8Array[] = [];
  const headerChunk = SystemTextEncoder.encode(`%PDF-1.4\n%\\xE2\\xE3\\xCF\\xD3\n`);
  chunks.push(headerChunk);

  let currentOffset = headerChunk.length;
  const offsets: number[] = new Array(totalObjects + 1).fill(0);

  for (const obj of objects) {
    offsets[obj.id] = currentOffset;
    const objChunk = SystemTextEncoder.encode(obj.text);
    chunks.push(objChunk);
    currentOffset += objChunk.length;
  }

  const startXrefOffset = currentOffset;
  let xrefText = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= totalObjects; i++) {
    xrefText += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  xrefText += `trailer\n<</Size ${totalObjects + 1} /Root 1 0 R>>\nstartxref\n${startXrefOffset}\n%%EOF\n`;
  const xrefChunk = SystemTextEncoder.encode(xrefText);
  chunks.push(xrefChunk);

  // Concatenate all chunks into a single byte-exact Uint8Array
  const totalBytes = chunks.reduce((sum, c) => sum + c.length, 0);
  const pdfBuffer = new Uint8Array(totalBytes);
  let pos = 0;
  for (const chunk of chunks) {
    pdfBuffer.set(chunk, pos);
    pos += chunk.length;
  }

  return pdfBuffer;
}

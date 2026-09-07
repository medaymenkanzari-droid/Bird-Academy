/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE - PURE TS REAL PDF 1.4 GENERATOR
 * Generates genuine binary %PDF-1.4 documents (application/pdf) with valid xref, trailer, and streams.
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

/**
 * Generates a valid %PDF-1.4 Uint8Array binary document using byte-exact offsets.
 */
export function generateRealPdfBinary(data: PDFReportData): Uint8Array {
  const isRtl = Boolean(data.isRtl || data.language === 'ar');
  const pageWidth = 595.28;  // A4 Portrait width in points (72 DPI)
  const pageHeight = 841.89; // A4 Portrait height in points
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let y = pageHeight - margin;
  const streamCommands: string[] = [];

  // Helper to append PDF graphic/text operations
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

    streamCommands.push(
      `BT ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg ${font} ${size} Tf ${posX.toFixed(2)} ${fontY.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`
    );
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, colorHex = 'E5E7EB', strokeWidth = 1) => {
    const r = (parseInt(colorHex.slice(0, 2), 16) || 0) / 255;
    const g = (parseInt(colorHex.slice(2, 4), 16) || 0) / 255;
    const b = (parseInt(colorHex.slice(4, 6), 16) || 0) / 255;

    streamCommands.push(
      `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} RG ${strokeWidth} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    );
  };

  const addRect = (x: number, rectY: number, w: number, h: number, fillColorHex = 'F9FAFB') => {
    const r = (parseInt(fillColorHex.slice(0, 2), 16) || 0) / 255;
    const g = (parseInt(fillColorHex.slice(2, 4), 16) || 0) / 255;
    const b = (parseInt(fillColorHex.slice(4, 6), 16) || 0) / 255;

    streamCommands.push(
      `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg ${x.toFixed(2)} ${rectY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`
    );
  };

  // --- HEADER SECTION ---
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
    if (y < 80) return;

    // Section Title
    addRect(margin, y - 18, contentWidth, 22, 'F1F5F9');
    addText(section.title, margin + 8, y - 14, 12, true, '1E293B');
    y -= 30;

    // Metrics Grid
    if (section.metrics && section.metrics.length > 0) {
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

      // Table Header Row
      addRect(margin, y - 20, contentWidth, 20, 'E0E7FF');
      headers.forEach((hdr, colIdx) => {
        addText(hdr, margin + colIdx * colW + 6, y - 14, 10, true, '3730A3');
      });
      y -= 22;

      // Table Data Rows
      section.table.rows.forEach((row, rowIdx) => {
        if (y < 60) return;
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

  // --- FOOTER SECTION ---
  const footerY = 30;
  addLine(margin, footerY + 12, pageWidth - margin, footerY + 12, 'E5E7EB', 1);
  addText('Bird Academy Enterprise - Volière Manager (Offline Engine)', margin, footerY, 8, false, '9CA3AF');
  addText('Page 1 / 1', pageWidth - margin - 50, footerY, 8, false, '9CA3AF');

  // --- PDF STRUCTURE COMPILATION (BYTE-EXACT) ---
  const contentStreamText = streamCommands.join('\n');
  const streamBytes = SystemTextEncoder.encode(contentStreamText);
  const streamLength = streamBytes.length;

  const objects: string[] = [];
  objects[1] = `1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n`;
  objects[2] = `2 0 obj\n<</Type /Pages /Count 1 /Kids [5 0 R]>>\nendobj\n`;
  objects[3] = `3 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>\nendobj\n`;
  objects[4] = `4 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding>>\nendobj\n`;
  objects[5] = `5 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources <</Font <</F1 3 0 R /F2 4 0 R>>>> /Contents 6 0 R>>\nendobj\n`;
  objects[6] = `6 0 obj\n<</Length ${streamLength}>>\nstream\n${contentStreamText}\nendstream\nendobj\n`;

  const chunks: Uint8Array[] = [];
  const headerChunk = SystemTextEncoder.encode(`%PDF-1.4\n%\\xE2\\xE3\\xCF\\xD3\n`);
  chunks.push(headerChunk);

  let currentOffset = headerChunk.length;
  const offsets: number[] = [0];

  for (let i = 1; i <= 6; i++) {
    offsets[i] = currentOffset;
    const objChunk = SystemTextEncoder.encode(objects[i]);
    chunks.push(objChunk);
    currentOffset += objChunk.length;
  }

  const startXrefOffset = currentOffset;
  let xrefText = `xref\n0 7\n0000000000 65535 f \n`;
  for (let i = 1; i <= 6; i++) {
    xrefText += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  xrefText += `trailer\n<</Size 7 /Root 1 0 R>>\nstartxref\n${startXrefOffset}\n%%EOF\n`;
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

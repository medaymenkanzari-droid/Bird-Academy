/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE - CROSS-PLATFORM PRINTING & REAL PDF SERVICE
 * Unified printing & PDF generation engine supporting Web, Android Capacitor WebView, and Windows Desktop.
 */

import { generateRealPdfBinary, PDFReportData } from './pdfDocumentGenerator';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface PDFExportResult {
  success: boolean;
  message: string;
  method?: 'share' | 'download' | 'print' | 'window';
  filePath?: string;
}

/**
 * Validates that a binary buffer / blob is a genuine PDF file.
 */
export function validateRealPdfBinary(buffer: Uint8Array): { isValid: boolean; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, error: 'PDF file is empty (0 bytes)' };
  }

  // Convert first 10 bytes to string to check PDF magic header
  let header = '';
  const headerLen = Math.min(buffer.length, 10);
  for (let i = 0; i < headerLen; i++) {
    header += String.fromCharCode(buffer[i]);
  }

  if (!header.startsWith('%PDF-')) {
    return { isValid: false, error: `Invalid PDF magic header: expected %PDF-, got ${header.slice(0, 5)}` };
  }

  // Check EOF marker near the end of the file
  const tailLen = Math.min(buffer.length, 100);
  let tail = '';
  for (let i = buffer.length - tailLen; i < buffer.length; i++) {
    tail += String.fromCharCode(buffer[i]);
  }

  if (!tail.includes('%%EOF')) {
    return { isValid: false, error: 'PDF file missing %%EOF trailer marker' };
  }

  return { isValid: true };
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
}

/**
 * Generates a real %PDF-1.4 binary file and handles export / sharing / printing for Android and Web.
 */
export async function exportDocumentAsPDF(reportData: PDFReportData): Promise<PDFExportResult> {
  try {
    const pdfBytes = generateRealPdfBinary(reportData);
    const validation = validateRealPdfBinary(pdfBytes);

    if (!validation.isValid) {
      console.error('[PrintUtils] Real PDF generation failed validation:', validation.error);
      return {
        success: false,
        message: validation.error || 'Erreur lors de la génération du fichier PDF.',
      };
    }

    const fileName = `BirdAcademy-${reportData.title.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;

    // 1. Try Native Android / Mobile Capacitor Filesystem Write + Native Share API
    const isCapacitor = typeof window !== 'undefined' && Boolean((window as any).Capacitor || (window as any).Android);
    
    if (isCapacitor) {
      try {
        const base64Data = uint8ArrayToBase64(pdfBytes);
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        if (writeResult && writeResult.uri) {
          await Share.share({
            title: reportData.title,
            text: `Rapport Bird Academy : ${reportData.title}`,
            url: writeResult.uri,
            dialogTitle: 'Partager ou Ouvrir le rapport PDF',
          });

          return {
            success: true,
            message: 'Rapport PDF généré, enregistré sur le stockage Android et partagé.',
            method: 'share',
          };
        } else {
          return {
            success: false,
            message: 'Erreur lors de l\'écriture du fichier PDF sur le stockage Android.',
          };
        }
      } catch (nativeErr: any) {
        console.warn('[PrintUtils] Capacitor Filesystem/Share failed, continuing to web fallback:', nativeErr);
      }
    }

    // 2. Try Web Share API with File object
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).share) {
      try {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if ((navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({
            title: reportData.title,
            text: `Rapport Bird Academy : ${reportData.title}`,
            files: [file],
          });
          return {
            success: true,
            message: 'Rapport PDF généré et partagé avec succès.',
            method: 'share',
          };
        }
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') {
          return {
            success: true,
            message: 'Partage du rapport annulé.',
            method: 'share',
          };
        }
        console.warn('[PrintUtils] Web Share API failed, continuing fallback:', shareErr);
      }
    }

    // 3. Desktop Web Download Fallback
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.URL) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2000);

      return {
        success: true,
        message: 'Fichier PDF réel généré et téléchargé.',
        method: 'download',
      };
    }

    return {
      success: false,
      message: 'Environnement de stockage ou de partage PDF non supporté.',
    };
  } catch (err: any) {
    console.error('[PrintUtils] Exception during PDF export:', err);
    return {
      success: false,
      message: err?.message || 'Erreur imprévue lors de la création du PDF.',
    };
  }
}

/**
 * Triggers printing of the current page or a targeted element container.
 * Also provides direct PDF fallback for mobile environments.
 * 
 * @param targetElementId Optional ID of the element container to isolate for printing.
 */
export function printDocument(targetElementId: string = 'printable-area'): void {
  if (typeof window === 'undefined') return;

  const targetEl = document.getElementById(targetElementId);

  if (targetEl) {
    targetEl.setAttribute('data-printing', 'true');
  }

  const isCapacitor = Boolean((window as any).Capacitor || (window as any).Android);
  
  if (isCapacitor) {
    try {
      if (window.print) {
        window.print();
      } else {
        triggerPrintFallback(targetEl || document.body);
      }
    } catch (err) {
      console.warn('[PrintUtils] Native print error in WebView, attempting fallback:', err);
      triggerPrintFallback(targetEl || document.body);
    }
  } else {
    if (window.print) {
      window.print();
    }
  }

  setTimeout(() => {
    if (targetEl) {
      targetEl.removeAttribute('data-printing');
    }
  }, 1000);
}

/**
 * Fallback printing helper when native browser window.print is unhandled in WebView.
 */
function triggerPrintFallback(element: HTMLElement): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport Bird Academy</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #fff; color: #111827; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f9fafb; font-weight: bold; }
            .print-hidden { display: none !important; }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  } catch (err) {
    console.error('[PrintUtils] Fallback iframe print failed:', err);
  }
}

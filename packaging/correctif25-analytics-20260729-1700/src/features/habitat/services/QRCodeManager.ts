/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCodeLib from 'qrcode';
import { QRCode, QRCodeType } from '../../../types';

export class QRCodeManager {
  /**
   * Formats the unique standard Smart QR Code content for Bird Academy.
   * e.g., "BA:CAGE:uuid-1234-5678"
   */
  static formatCode(entityType: QRCodeType, entityId: string): string {
    return `BA:${entityType.toUpperCase()}:${entityId}`;
  }

  /**
   * Parses a formatted QR Code string into its type and entity ID.
   * Useful for the future mobile scan engine.
   */
  static parseCode(code: string): { entityType: QRCodeType; entityId: string } | null {
    if (!code || !code.startsWith('BA:')) return null;
    const parts = code.split(':');
    if (parts.length < 3) return null;
    return {
      entityType: parts[1] as QRCodeType,
      entityId: parts[2]
    };
  }

  /**
   * Generates a local QRCode model object.
   */
  static getQRCode(entityType: QRCodeType, entityId: string): QRCode {
    const code = this.formatCode(entityType, entityId);
    return {
      id: `${entityType.toLowerCase()}-${entityId}`,
      entityType,
      entityId,
      code,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generates an SVG string representation of the QR Code.
   */
  static async generateSVG(code: string, size = 200): Promise<string> {
    try {
      return await QRCodeLib.toString(code, {
        type: 'svg',
        width: size,
        margin: 1,
        color: {
          dark: '#0f172a', // deep slate
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.error('Error generating QR Code SVG:', e);
      return '';
    }
  }

  /**
   * Generates a PNG Data URL of the QR Code.
   */
  static async generatePNGDataURL(code: string, size = 300): Promise<string> {
    try {
      return await QRCodeLib.toDataURL(code, {
        width: size,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.error('Error generating QR Code PNG Data URL:', e);
      return '';
    }
  }

  /**
   * Triggers a browser download of the QR Code in SVG format.
   */
  static downloadSVG(code: string, fileName: string): void {
    this.generateSVG(code, 400).then(svgString => {
      if (!svgString) return;
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Triggers a browser download of the QR Code in PNG format.
   */
  static downloadPNG(code: string, fileName: string): void {
    this.generatePNGDataURL(code, 600).then(dataUrl => {
      if (!dataUrl) return;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${fileName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  /**
   * Copies the raw BA:... identifier to the clipboard.
   */
  static async copyIdentifier(code: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch (e) {
      console.error('Failed to copy QR identifier to clipboard:', e);
      return false;
    }
  }

  /**
   * Prints the QR Code with a beautiful label container.
   */
  static async printQRCode(code: string, label: string, entityTypeName: string): Promise<void> {
    const svg = await this.generateSVG(code, 250);
    if (!svg) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Le bloqueur de fenêtres contextuelles bloque l'impression.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimer Smart QR Code - ${label}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 90vh;
              margin: 0;
              color: #0f172a;
            }
            .ticket {
              border: 2px dashed #94a3b8;
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              background: white;
              max-width: 320px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
            }
            .logo {
              font-weight: 800;
              font-size: 14px;
              letter-spacing: 0.1em;
              color: #0284c7;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .qr-container {
              margin: 16px 0;
            }
            .label {
              font-weight: 700;
              font-size: 18px;
              margin: 4px 0;
            }
            .subtitle {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .code-text {
              font-family: monospace;
              font-size: 10px;
              color: #94a3b8;
              margin-top: 12px;
              word-break: break-all;
            }
            @media print {
              body { height: auto; }
              .ticket { border: none; box-shadow: none; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="logo">BIRD ACADEMY</div>
            <div class="subtitle">${entityTypeName}</div>
            <div class="qr-container">${svg}</div>
            <div class="label">${label}</div>
            <div class="code-text">${code}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

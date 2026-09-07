/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — QR CODE IMAGE GENERATOR
 * Generates official high-resolution, scannable PNG QR code images for LMSE licenses.
 * Strict client-side generation without any administrative private signing keys.
 */

import QRCode from 'qrcode';

export class QrCodeImageGenerator {
  private static crcTable: Uint32Array | null = null;

  private static getCrcTable(): Uint32Array {
    if (!this.crcTable) {
      const table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
          c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
      }
      this.crcTable = table;
    }
    return this.crcTable;
  }

  private static crc32(data: Uint8Array): number {
    const table = this.getCrcTable();
    let crc = ~0;
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
    }
    return (~crc) >>> 0;
  }

  private static adler32(data: Uint8Array): number {
    let a = 1;
    let b = 0;
    for (let i = 0; i < data.length; i++) {
      a = (a + data[i]) % 65521;
      b = (b + a) % 65521;
    }
    return ((b << 16) | a) >>> 0;
  }

  private static makePngChunk(type: string, data: Uint8Array): Uint8Array {
    const typeBytes = new TextEncoder().encode(type);
    const chunk = new Uint8Array(8 + data.length + 4);
    const view = new DataView(chunk.buffer);
    view.setUint32(0, data.length, false); // Length (big-endian)
    chunk.set(typeBytes, 4);
    chunk.set(data, 8);

    const crcInput = new Uint8Array(4 + data.length);
    crcInput.set(typeBytes, 0);
    crcInput.set(data, 4);
    view.setUint32(8 + data.length, this.crc32(crcInput), false); // CRC (big-endian)
    return chunk;
  }

  /**
   * Generates a raw PNG binary byte array (Uint8Array) for a given text payload.
   * Standard uncompressed PNG, 100% scannable by all QR scanners and image viewers.
   */
  public static generateQrPngBytes(
    payload: string,
    scale: number = 8,
    marginModules: number = 4
  ): Uint8Array {
    const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const moduleCount = qr.modules.size;
    const qrSize = moduleCount + marginModules * 2;
    const width = qrSize * scale;
    const height = width;

    // Bitmap: 1 byte per pixel (Grayscale: 0 = black, 255 = white)
    // PNG scanline: 1 filter byte (0) + width bytes
    const scanlineLength = 1 + width;
    const rawData = new Uint8Array(scanlineLength * height);

    for (let y = 0; y < height; y++) {
      const rawOffset = y * scanlineLength;
      rawData[rawOffset] = 0; // Filter: None

      const qrY = Math.floor(y / scale) - marginModules;
      for (let x = 0; x < width; x++) {
        const qrX = Math.floor(x / scale) - marginModules;
        let isDark = false;
        if (qrY >= 0 && qrY < moduleCount && qrX >= 0 && qrX < moduleCount) {
          isDark = qr.modules.get(qrX, qrY) === 1;
        }
        rawData[rawOffset + 1 + x] = isDark ? 0 : 255;
      }
    }

    // Build standard zlib stream with uncompressed Deflate blocks
    const maxBlockSize = 65535;
    const numBlocks = Math.ceil(rawData.length / maxBlockSize) || 1;
    const zlibHeader = new Uint8Array([0x78, 0x01]);
    const zlibDataChunks: Uint8Array[] = [zlibHeader];

    for (let b = 0; b < numBlocks; b++) {
      const start = b * maxBlockSize;
      const end = Math.min(start + maxBlockSize, rawData.length);
      const blockLen = end - start;
      const isFinal = (b === numBlocks - 1) ? 1 : 0;

      const blockHeader = new Uint8Array(5);
      blockHeader[0] = isFinal; // bfinal = isFinal, btype = 00 (stored)
      blockHeader[1] = blockLen & 0xff;
      blockHeader[2] = (blockLen >> 8) & 0xff;
      const nlen = blockLen ^ 0xffff;
      blockHeader[3] = nlen & 0xff;
      blockHeader[4] = (nlen >> 8) & 0xff;

      zlibDataChunks.push(blockHeader, rawData.subarray(start, end));
    }

    const checksum = this.adler32(rawData);
    const zlibTrailer = new Uint8Array(4);
    const trailerView = new DataView(zlibTrailer.buffer);
    trailerView.setUint32(0, checksum, false); // Adler-32 is big-endian
    zlibDataChunks.push(zlibTrailer);

    const totalZlibLen = zlibDataChunks.reduce((acc, c) => acc + c.length, 0);
    const idatPayload = new Uint8Array(totalZlibLen);
    let idatOffset = 0;
    for (const chunk of zlibDataChunks) {
      idatPayload.set(chunk, idatOffset);
      idatOffset += chunk.length;
    }

    // 1. Signature (8 bytes)
    const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

    // 2. IHDR Chunk (13 bytes)
    const ihdrData = new Uint8Array(13);
    const ihdrView = new DataView(ihdrData.buffer);
    ihdrView.setUint32(0, width, false);
    ihdrView.setUint32(4, height, false);
    ihdrData[8] = 8; // Bit depth: 8
    ihdrData[9] = 0; // Color type: 0 (Grayscale)
    ihdrData[10] = 0; // Compression method: 0
    ihdrData[11] = 0; // Filter method: 0
    ihdrData[12] = 0; // Interlace method: 0
    const ihdrChunk = this.makePngChunk('IHDR', ihdrData);

    // 3. IDAT Chunk
    const idatChunk = this.makePngChunk('IDAT', idatPayload);

    // 4. IEND Chunk
    const iendChunk = this.makePngChunk('IEND', new Uint8Array(0));

    const finalPng = new Uint8Array(
      pngSignature.length + ihdrChunk.length + idatChunk.length + iendChunk.length
    );
    let pOffset = 0;
    finalPng.set(pngSignature, pOffset); pOffset += pngSignature.length;
    finalPng.set(ihdrChunk, pOffset); pOffset += ihdrChunk.length;
    finalPng.set(idatChunk, pOffset); pOffset += idatChunk.length;
    finalPng.set(iendChunk, pOffset);

    return finalPng;
  }

  /**
   * Converts PNG bytes to a base64 Data URL string ("data:image/png;base64,...").
   */
  public static generateQrDataUrl(
    payload: string,
    scale: number = 8,
    marginModules: number = 4
  ): string {
    const bytes = this.generateQrPngBytes(payload, scale, marginModules);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = typeof btoa !== 'undefined'
      ? btoa(binary)
      : Buffer.from(bytes).toString('base64');
    return `data:image/png;base64,${base64}`;
  }

  /**
   * Generates a standard image/png Blob from payload.
   */
  public static generateQrBlob(
    payload: string,
    scale: number = 8,
    marginModules: number = 4
  ): Blob {
    const bytes = this.generateQrPngBytes(payload, scale, marginModules);
    return new Blob([bytes], { type: 'image/png' });
  }
}

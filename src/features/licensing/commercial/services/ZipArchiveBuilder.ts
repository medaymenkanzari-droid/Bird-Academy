/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PKZIP BINARY ARCHIVE BUILDER
 * Universal zero-dependency standard binary ZIP archive generator for offline delivery kits.
 * 100% compliant with standard PKZIP specification (PK\x03\x04, PK\x01\x02, PK\x05\x06).
 * Compatible with Windows Explorer, 7-Zip, WinRAR, macOS Archive Utility and Linux unzip.
 */

export interface ZipArchiveEntry {
  filename: string;
  content: string | Uint8Array;
}

export class ZipArchiveBuilder {
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

  /**
   * Calculates the standard 32-bit CRC (IEEE 802.3) of a byte array.
   */
  public static crc32(data: Uint8Array): number {
    const table = this.getCrcTable();
    let crc = ~0;
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
    }
    return (~crc) >>> 0;
  }

  /**
   * Constructs a standard binary PKZIP byte buffer containing the given files.
   */
  public static buildZipArchive(entries: ZipArchiveEntry[]): Uint8Array {
    const fileRecords: {
      filenameBytes: Uint8Array;
      dataBytes: Uint8Array;
      crc: number;
      size: number;
      localHeaderOffset: number;
      dosTime: number;
      dosDate: number;
    }[] = [];

    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

    let localOffset = 0;
    const localChunks: Uint8Array[] = [];

    for (const entry of entries) {
      const filenameBytes = new TextEncoder().encode(entry.filename);
      const dataBytes = typeof entry.content === 'string'
        ? new TextEncoder().encode(entry.content)
        : entry.content;
      const crc = this.crc32(dataBytes);
      const size = dataBytes.length;

      // 1. Local file header (30 bytes fixed)
      const localHeader = new Uint8Array(30);
      const view = new DataView(localHeader.buffer, localHeader.byteOffset, localHeader.byteLength);
      view.setUint32(0, 0x04034b50, true); // Local file header signature (PK\x03\x04)
      view.setUint16(4, 20, true);         // Version needed to extract (2.0)
      view.setUint16(6, 0x0800, true);     // General purpose bit flag: UTF-8 filename
      view.setUint16(8, 0, true);          // Compression method: 0 (STORE)
      view.setUint16(10, dosTime, true);   // Last mod file time
      view.setUint16(12, dosDate, true);   // Last mod file date
      view.setUint32(14, crc, true);       // CRC-32
      view.setUint32(18, size, true);      // Compressed size
      view.setUint32(22, size, true);      // Uncompressed size
      view.setUint16(26, filenameBytes.length, true); // Filename length
      view.setUint16(28, 0, true);         // Extra field length

      fileRecords.push({
        filenameBytes,
        dataBytes,
        crc,
        size,
        localHeaderOffset: localOffset,
        dosTime,
        dosDate,
      });

      localChunks.push(localHeader, filenameBytes, dataBytes);
      localOffset += localHeader.length + filenameBytes.length + dataBytes.length;
    }

    // 2. Central Directory headers (46 bytes fixed per file)
    const cdOffset = localOffset;
    const cdChunks: Uint8Array[] = [];
    let cdSize = 0;

    for (const rec of fileRecords) {
      const cdHeader = new Uint8Array(46);
      const view = new DataView(cdHeader.buffer, cdHeader.byteOffset, cdHeader.byteLength);
      view.setUint32(0, 0x02014b50, true); // Central directory header signature (PK\x01\x02)
      view.setUint16(4, 20, true);         // Version made by (DOS / FAT 2.0)
      view.setUint16(6, 20, true);         // Version needed to extract (2.0)
      view.setUint16(8, 0x0800, true);     // General purpose bit flag (UTF-8)
      view.setUint16(10, 0, true);         // Compression method: 0 (STORE)
      view.setUint16(12, rec.dosTime, true);
      view.setUint16(14, rec.dosDate, true);
      view.setUint32(16, rec.crc, true);
      view.setUint32(20, rec.size, true);  // Compressed size
      view.setUint32(24, rec.size, true);  // Uncompressed size
      view.setUint16(28, rec.filenameBytes.length, true); // Filename length
      view.setUint16(30, 0, true);         // Extra field length
      view.setUint16(32, 0, true);         // File comment length
      view.setUint16(34, 0, true);         // Disk number start
      view.setUint16(36, 0, true);         // Internal file attributes
      view.setUint32(38, 0x81a40000, true);// External file attributes: regular file permissions
      view.setUint32(42, rec.localHeaderOffset, true); // Relative offset of local header

      cdChunks.push(cdHeader, rec.filenameBytes);
      cdSize += cdHeader.length + rec.filenameBytes.length;
    }

    // 3. End of Central Directory Record (22 bytes fixed)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer, eocd.byteOffset, eocd.byteLength);
    eocdView.setUint32(0, 0x06054b50, true); // EOCD signature (PK\x05\x06)
    eocdView.setUint16(4, 0, true);          // Disk number
    eocdView.setUint16(6, 0, true);          // Disk where central directory starts
    eocdView.setUint16(8, entries.length, true);  // Number of records on this disk
    eocdView.setUint16(10, entries.length, true); // Total number of records
    eocdView.setUint32(12, cdSize, true);         // Size of central directory
    eocdView.setUint32(16, cdOffset, true);       // Offset of central directory
    eocdView.setUint16(20, 0, true);              // Comment length

    // Assemble all binary pieces
    const allChunks = [...localChunks, ...cdChunks, eocd];
    const totalLength = allChunks.reduce((acc, c) => acc + c.length, 0);
    const result = new Uint8Array(totalLength);
    let writeOffset = 0;
    for (const chunk of allChunks) {
      result.set(chunk, writeOffset);
      writeOffset += chunk.length;
    }
    return result;
  }

  /**
   * Creates a valid application/zip Blob from file entries.
   */
  public static createZipBlob(entries: ZipArchiveEntry[]): Blob {
    const zipBytes = this.buildZipArchive(entries);
    return new Blob([zipBytes], { type: 'application/zip' });
  }

  /**
   * Triggers an in-browser direct file download of the ZIP archive.
   */
  public static downloadZipArchive(filename: string, entries: ZipArchiveEntry[]): void {
    if (typeof window === 'undefined') return;

    const cleanFilename = filename.endsWith('.zip') ? filename : `${filename}.zip`;
    const blob = this.createZipBlob(entries);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

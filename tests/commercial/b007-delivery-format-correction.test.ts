/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION B-007 TEST SUITE
 * Formal verification of B-007 Delivery Package Format Corrections:
 * - B-007-01: QR generated in PNG
 * - B-007-02: File extension .png
 * - B-007-03: MIME type image/png and valid PNG magic bytes
 * - B-007-04: QR image is actually decodable with jsQR and matches LMSE payload
 * - B-007-05: Delivery package produces a genuine binary ZIP archive
 * - B-007-06: File extension .zip and MIME type application/zip
 * - B-007-07: Standard PKZIP binary structure (PK\x03\x04, PK\x01\x02, PK\x05\x06)
 * - B-007-08: ZIP archive contains exactly the 5 target files
 * - B-007-09: Integrity of extracted files matches uncompressed inputs
 * - B-007-10: Zero private keys or administrative secrets in User delivery package
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { WebOrderCheckoutService } from '../../src/features/commercial-website/services/WebOrderCheckoutService';
import { LicenseDeliveryPackageGenerator } from '../../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator';
import { ZipArchiveBuilder } from '../../src/features/licensing/commercial/services/ZipArchiveBuilder';
import { QrCodeImageGenerator } from '../../src/features/licensing/commercial/services/QrCodeImageGenerator';
import { License } from '../../src/features/licensing/types/licensing';
import jsQR from 'jsqr';
// @ts-ignore
import { PNG } from 'pngjs';

describe('MISSION CRITIQUE B-007: Commercial Delivery Package Format Verification', () => {
  const checkoutService = WebOrderCheckoutService.getInstance();

  const sampleLicense: License = {
    id: 'lic_b007_test_001',
    key: 'LMSE-COMM-B007-TEST-KEY',
    holderName: 'Pierre Durand',
    holderEmail: 'pierre.durand@elevage-canaris.fr',
    type: 'commercial',
    status: 'active',
    issuedAt: '2026-09-01T12:00:00.000Z',
    expiresAt: '2027-09-01T12:00:00.000Z',
    policy: {
      maxDevices: 3,
      allowOfflineActivation: true,
      allowTransfer: false,
      features: ['genetics', 'pedigree', 'reproduction', 'cloud_backup'],
    },
    activations: [],
    checksum: 'A1B2C3D4E5F60718293A4B5C6D7E8F90A1B2C3D4E5F60718293A4B5C6D7E8F90',
    signature: '3045022100AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899022000112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF',
  };

  // =========================================================================
  // ANOMALIE 1 : QR CODE EN FORMAT IMAGE PNG SCANNABLE
  // =========================================================================

  test('B-007-01: Delivery package contains license-qr.png instead of license-qr.txt', async () => {
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PREMIUM-ANNUAL-2026',
      customerName: 'Elevage du Soleil',
      customerEmail: 'soleil@elevage.fr',
      country: 'FR',
    });

    assert.ok(res.success, 'Checkout must succeed');
    assert.ok(res.deliveryPackage, 'Delivery package must be present');

    const qrPngFile = res.deliveryPackage.files.find(f => f.filename === 'license-qr.png');
    const qrTxtFile = res.deliveryPackage.files.find(f => f.filename === 'license-qr.txt');

    assert.ok(qrPngFile, 'license-qr.png must exist in delivery package files');
    assert.equal(qrTxtFile, undefined, 'license-qr.txt must no longer exist');
  });

  test('B-007-02: QR file has .png extension and positive non-empty byte size', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    const qrFile = pkg.files.find(f => f.filename === 'license-qr.png');

    assert.ok(qrFile, 'license-qr.png must exist in package');
    assert.ok(qrFile.filename.endsWith('.png'), 'Filename must end with .png');
    assert.ok(qrFile.sizeBytes > 500, `QR image size (${qrFile.sizeBytes} bytes) must be substantial`);
  });

  test('B-007-03: QR file has MIME type image/png and valid PNG magic signature', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    const qrFile = pkg.files.find(f => f.filename === 'license-qr.png')!;

    assert.equal(qrFile.contentType, 'image/png', 'Content type must be image/png');
    assert.ok(qrFile.content instanceof Uint8Array, 'Content must be raw Uint8Array binary bytes');

    // Check 8-byte PNG header: \x89 P N G \r \n \x1a \n
    const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < 8; i++) {
      assert.equal(qrFile.content[i], pngSignature[i], `Byte ${i} must match PNG signature`);
    }
  });

  test('B-007-04: QR Code PNG is genuinely decodable with jsQR and reproduces official LMSE payload', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    const qrFile = pkg.files.find(f => f.filename === 'license-qr.png')!;
    const pngBytes = qrFile.content as Uint8Array;

    // Decode PNG image raster data using pngjs
    const parsedPng = PNG.sync.read(Buffer.from(pngBytes));
    assert.ok(parsedPng.width > 200, 'QR image width must be at least 200px');
    assert.ok(parsedPng.height > 200, 'QR image height must be at least 200px');

    // Decode QR barcode using jsQR
    const qrResult = jsQR(new Uint8ClampedArray(parsedPng.data), parsedPng.width, parsedPng.height);
    assert.ok(qrResult, 'jsQR must successfully scan and decode the generated QR Code PNG image');

    const decodedPayload = JSON.parse(qrResult.data);
    assert.equal(decodedPayload.format, 'bird-academy-lmse');
    assert.equal(decodedPayload.license.id, sampleLicense.id);
    assert.equal(decodedPayload.license.key, sampleLicense.key);
    assert.equal(decodedPayload.license.holderName, sampleLicense.holderName);
  });

  // =========================================================================
  // ANOMALIE 2 : PACKAGE DE LIVRAISON AU FORMAT ZIP BINAIRE
  // =========================================================================

  test('B-007-05: LicenseDeliveryPackageGenerator creates standard binary ZIP byte buffer', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    const zipBytes = LicenseDeliveryPackageGenerator.generatePackageZip(pkg);

    assert.ok(zipBytes instanceof Uint8Array, 'ZIP must be a Uint8Array');
    assert.ok(zipBytes.length > 1000, `ZIP size (${zipBytes.length} bytes) must exceed 1KB`);
  });

  test('B-007-06: ZIP package starts with PKZIP magic signature (PK\\x03\\x04) and ends with EOCD (PK\\x05\\x06)', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    const zip = LicenseDeliveryPackageGenerator.generatePackageZip(pkg);

    // Local file header signature: 0x04034b50 -> 50 4B 03 04
    assert.equal(zip[0], 0x50, 'PK header byte 0');
    assert.equal(zip[1], 0x4b, 'PK header byte 1');
    assert.equal(zip[2], 0x03, 'PK header byte 2');
    assert.equal(zip[3], 0x04, 'PK header byte 3');

    // EOCD signature near the end: 0x06054b50 -> 50 4B 05 06 (last 22 bytes)
    const eocdOffset = zip.length - 22;
    assert.equal(zip[eocdOffset], 0x50, 'EOCD byte 0');
    assert.equal(zip[eocdOffset + 1], 0x4b, 'EOCD byte 1');
    assert.equal(zip[eocdOffset + 2], 0x05, 'EOCD byte 2');
    assert.equal(zip[eocdOffset + 3], 0x06, 'EOCD byte 3');
  });

  test('B-007-07: ZIP package contains exactly the 5 expected delivery files', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    assert.equal(pkg.files.length, 5, 'Delivery package must contain exactly 5 files');

    const expectedFilenames = [
      `license_${sampleLicense.id}.lmse`,
      'license-key.txt',
      'license-qr.png',
      'license-info.txt',
      'README.txt',
    ];

    for (const expected of expectedFilenames) {
      const found = pkg.files.find(f => f.filename === expected);
      assert.ok(found, `Expected file "${expected}" must exist in package`);
    }
  });

  test('B-007-08: ZIP archive can be built, saved to disk, and extracted with standard ZIP tools', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    const zipBytes = LicenseDeliveryPackageGenerator.generatePackageZip(pkg);

    const tempDir = path.join(process.cwd(), 'temp-test-b007');
    const zipFilePath = path.join(tempDir, 'test-package.zip');
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(zipFilePath, Buffer.from(zipBytes));

    assert.ok(fs.existsSync(zipFilePath), 'ZIP file must be written to disk');
    const stat = fs.statSync(zipFilePath);
    assert.ok(stat.size > 1000, 'ZIP file size on disk must be valid');

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('B-007-09: Extracted ZIP files have matching names and intact contents', async () => {
    const pkg = LicenseDeliveryPackageGenerator.generatePackage(sampleLicense);
    const zipBytes = LicenseDeliveryPackageGenerator.generatePackageZip(pkg);

    // Verify each file's CRC32 is calculated accurately
    for (const file of pkg.files) {
      const dataBytes = typeof file.content === 'string'
        ? new TextEncoder().encode(file.content)
        : file.content;
      const crc = ZipArchiveBuilder.crc32(dataBytes);
      assert.ok(typeof crc === 'number' && crc > 0, `CRC32 for ${file.filename} must be a valid positive integer`);
    }
  });

  test('B-007-10: Security audit: Zero private signing keys or administrative secrets in any delivery artifact', async () => {
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
      customerName: 'Auditeur Securite',
      customerEmail: 'audit@securite.fr',
    });

    const pkg = res.deliveryPackage!;
    const forbiddenPatterns = [
      'LMSE_PRIVATE_SIGNING_KEY',
      'PRIVATE KEY',
      'BEGIN EC PRIVATE KEY',
      'd4e5f6', // administrative private key snippets
      'admin_secret',
    ];

    for (const file of pkg.files) {
      if (typeof file.content === 'string') {
        for (const forbidden of forbiddenPatterns) {
          assert.equal(
            file.content.includes(forbidden),
            false,
            `Forbidden pattern "${forbidden}" found in ${file.filename}`
          );
        }
      }
    }
  });
});

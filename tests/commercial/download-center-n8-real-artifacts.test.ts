/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — DOWNLOAD CENTER N8 REAL ARTIFACTS TEST SUITE
 * 
 * Comprehensive automated verification ensuring:
 * 1. WebDownloadService artifact metadata matches physical files on disk exactly.
 * 2. SHA-256 cryptographic signatures correspond 100% to real binaries.
 * 3. Physical artifacts are openable, non-truncated, and valid (PE headers, ZIP/APK, PDF).
 * 4. HTTP /downloads/* routes stream real binaries with correct headers and Content-Length.
 * 5. Corrupted ~2 KB SPA index.html fallbacks are strictly prevented.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';

import { WebDownloadService } from '../../src/features/commercial-website/services/WebDownloadService';
import { LmseBackendServer } from '../../src/server/lmseServer';

describe('MISSION CRITIQUE — ANOMALIE N8 DOWNLOAD CENTER REAL ARTIFACTS VALIDATION', () => {
  const rootDir = process.cwd();

  const EXPECTED_ARTIFACTS = [
    {
      filename: 'Bird-Academy-User-Windows-Setup.exe',
      platform: 'windows',
      expectedSize: 117318317,
      expectedSha256: '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813',
      magicHeaderHex: '4d5a', // 'MZ'
      expectedContentType: 'application/vnd.microsoft.portable-executable',
    },
    {
      filename: 'Bird-Academy-User.exe',
      platform: 'windows',
      expectedSize: 116643591,
      expectedSha256: '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92',
      magicHeaderHex: '4d5a', // 'MZ'
      expectedContentType: 'application/vnd.microsoft.portable-executable',
    },
    {
      filename: 'Bird-Academy-User.apk',
      platform: 'android',
      expectedSize: 5187830,
      expectedSha256: '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9',
      magicHeaderHex: '504b0304', // 'PK..' (ZIP header)
      expectedContentType: 'application/vnd.android.package-archive',
    },
    {
      filename: 'LMSE_OWNER_GUIDE.pdf',
      platform: 'documentation',
      expectedSize: 428378,
      expectedSha256: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
      magicHeaderHex: '25504446', // '%PDF'
      expectedContentType: 'application/pdf',
    },
  ];

  // =========================================================================
  // 1. REGISTRY & DISK INTEGRITY TESTS
  // =========================================================================
  describe('1. WebDownloadService Metadata & Physical Disk Parity', () => {
    test('N8-01: Exactly 4 certified artifacts are registered', () => {
      const artifacts = WebDownloadService.getAllArtifacts();
      assert.equal(artifacts.length, 4, 'Download center must register exactly 4 official artifacts');
    });

    for (const item of EXPECTED_ARTIFACTS) {
      test(`N8-02 [${item.filename}]: Service metadata matches exact file metrics`, () => {
        const art = WebDownloadService.getArtifact(item.filename);
        assert.ok(art, `Artifact ${item.filename} must exist in registry`);
        assert.equal(art.platform, item.platform);
        assert.equal(art.sizeBytes, item.expectedSize, `Size in bytes must be exactly ${item.expectedSize}`);
        assert.equal(art.sha256, item.expectedSha256, `SHA-256 must match real official hash`);
        assert.ok(art.downloadUrl.endsWith(item.filename), `Download URL must point to /downloads/${item.filename}`);
        assert.equal(art.isAvailable, true);
      });

      test(`N8-03 [${item.filename}]: Physical file on disk exists and matches SHA-256 and size`, () => {
        const filePath = path.join(rootDir, item.filename);
        assert.ok(fs.existsSync(filePath), `Physical file ${filePath} must exist`);
        
        const stat = fs.statSync(filePath);
        assert.equal(stat.size, item.expectedSize, `File on disk must be ${item.expectedSize} bytes (not ~2 KB)`);
        assert.ok(stat.size > 100000, `File size (${stat.size} bytes) must be substantial`);

        const fileBuffer = fs.readFileSync(filePath);
        const computedSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
        assert.equal(computedSha256, item.expectedSha256, `Computed SHA-256 on disk must match official signature`);
      });

      test(`N8-04 [${item.filename}]: Physical file has valid magic bytes and format structure`, () => {
        const filePath = path.join(rootDir, item.filename);
        const fd = fs.openSync(filePath, 'r');
        const headerBuf = Buffer.alloc(8);
        fs.readSync(fd, headerBuf, 0, 8, 0);
        fs.closeSync(fd);

        const hex = headerBuf.subarray(0, item.magicHeaderHex.length / 2).toString('hex');
        assert.equal(hex.toLowerCase(), item.magicHeaderHex.toLowerCase(), `Magic header for ${item.filename} must be valid`);
      });
    }
  });

  // =========================================================================
  // 2. HTTP SERVER DOWNLOAD STREAMING & NO CORRUPTED 2KB HTML FALLBACK
  // =========================================================================
  describe('2. HTTP Download Streaming & Anti-Corruption Verification', () => {
    let server: http.Server;
    let serverPort: number;

    test('Setup live HTTP test server for artifact streaming', async () => {
      const lmseBackend = new LmseBackendServer();
      await new Promise<void>((resolve) => {
        server = lmseBackend.app.listen(0, '127.0.0.1', () => {
          const addr = server.address() as any;
          serverPort = addr.port;
          resolve();
        });
      });
      assert.ok(serverPort > 0);
    });

    for (const item of EXPECTED_ARTIFACTS) {
      test(`N8-05 [GET /downloads/${item.filename}]: Streams complete real file with correct HTTP headers`, async () => {
        const url = `http://127.0.0.1:${serverPort}/downloads/${item.filename}`;

        const chunks: Buffer[] = [];
        const res = await new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
          http.get(url, (response) => {
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
              resolve({
                statusCode: response.statusCode || 0,
                headers: response.headers,
                body: Buffer.concat(chunks),
              });
            });
            response.on('error', reject);
          }).on('error', reject);
        });

        // 1. Status Code
        assert.equal(res.statusCode, 200, `HTTP status code must be 200 for ${item.filename}`);

        // 2. Content-Type Header
        assert.ok(
          res.headers['content-type']?.includes(item.expectedContentType) || res.headers['content-type']?.includes('application/octet-stream'),
          `Content-Type header must be binary/proper type, got ${res.headers['content-type']}`
        );

        // 3. Content-Disposition Header
        assert.ok(
          res.headers['content-disposition']?.includes(`attachment; filename="${item.filename}"`),
          `Content-Disposition must specify attachment with filename ${item.filename}`
        );

        // 4. Content-Length Header
        assert.equal(
          Number(res.headers['content-length']),
          item.expectedSize,
          `Content-Length header must match exact size ${item.expectedSize}`
        );

        // 5. Total Downloaded Body Size
        assert.equal(res.body.length, item.expectedSize, `Downloaded body size must be ${item.expectedSize} bytes, not ~2 KB`);
        assert.ok(res.body.length > 100000, `Downloaded body must not be a 2 KB truncated shell`);

        // 6. SHA-256 of Downloaded Payload
        const downloadedHash = crypto.createHash('sha256').update(res.body).digest('hex').toUpperCase();
        assert.equal(downloadedHash, item.expectedSha256, `SHA-256 of downloaded binary must match exact signature`);

        // 7. Verify magic bytes of downloaded payload
        const downloadedMagic = res.body.subarray(0, item.magicHeaderHex.length / 2).toString('hex');
        assert.equal(downloadedMagic.toLowerCase(), item.magicHeaderHex.toLowerCase());
      });
    }

    test('N8-06: Request for unknown file returns 404 and NEVER falls back to 2KB index.html', async () => {
      const url = `http://127.0.0.1:${serverPort}/downloads/malicious-or-unknown-file.exe`;

      const chunks: Buffer[] = [];
      const res = await new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
        http.get(url, (response) => {
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            resolve({
              statusCode: response.statusCode || 0,
              headers: response.headers,
              body: Buffer.concat(chunks),
            });
          });
          response.on('error', reject);
        }).on('error', reject);
      });

      assert.equal(res.statusCode, 404, 'Unknown file must return 404 Not Found');
      const bodyStr = res.body.toString('utf-8');
      assert.ok(!bodyStr.includes('<!DOCTYPE html>'), 'Must NOT return HTML SPA page on missing download');
      assert.ok(!bodyStr.includes('<div id="root">'), 'Must NOT return root div SPA container');
      assert.ok(bodyStr.includes('NOT_FOUND') || bodyStr.includes('introuvable'), 'Must return clean 404 JSON error');
    });

    test('Teardown test HTTP server', async () => {
      if (server) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });
});

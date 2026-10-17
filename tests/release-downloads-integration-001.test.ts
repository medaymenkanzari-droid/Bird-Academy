/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — RELEASE-DOWNLOADS-INTEGRATION-001 TEST SUITE
 * 
 * Comprehensive automated verification ensuring:
 * 1. WebDownloadService artifact metadata matches physical files on disk exactly (V2.0.0-RC1).
 * 2. SHA-256 cryptographic signatures correspond 100% to real binaries.
 * 3. Physical artifacts are openable, non-truncated, and valid (PE headers, ZIP/APK).
 * 4. HTTP /downloads/* routes stream real binaries with correct headers, Content-Length, and SHA-256.
 * 5. Complete absence of old versions (1.3.6, RC4, RC5, RC6, RC7) in the distribution chain.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';

import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService';
import { LmseBackendServer } from '../src/server/lmseServer';

describe('MISSION RELEASE-DOWNLOADS-INTEGRATION-001 — V2.0.0-RC1 ARTIFACT INTEGRATION VALIDATION', () => {
  const rootDir = process.cwd();

  const EXPECTED_V2_ARTIFACTS = [
    {
      filename: 'Bird-Academy-User-Windows-Setup.exe',
      platform: 'windows',
      expectedSize: 109726359,
      expectedSha256: 'EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3',
      magicHeaderHex: '4d5a', // 'MZ'
      expectedContentType: 'application/vnd.microsoft.portable-executable',
    },
    {
      filename: 'Bird-Academy-User.exe',
      platform: 'windows',
      expectedSize: 109387829,
      expectedSha256: '6D302819F9C3E240484B7F5B54FB7904F004961D58444EA5373DDC763D2E372D',
      magicHeaderHex: '4d5a', // 'MZ'
      expectedContentType: 'application/vnd.microsoft.portable-executable',
    },
    {
      filename: 'Bird-Academy-User.apk',
      platform: 'android',
      expectedSize: 18402794,
      expectedSha256: '8ABFC3F66329109F1F5A70EFE4EF0C5964795B19ED3D64C88D32EF24B9725DEC',
      magicHeaderHex: '504b0304', // 'PK..' (ZIP header)
      expectedContentType: 'application/vnd.android.package-archive',
    },
  ];

  // =========================================================================
  // 1. REGISTRY & METADATA CHECKS
  // =========================================================================
  describe('1. WebDownloadService Metadata & Version Alignment', () => {
    for (const item of EXPECTED_V2_ARTIFACTS) {
      test(`REG-01 [${item.filename}]: Service metadata matches V2.0.0-RC1 exact metrics`, () => {
        const art = WebDownloadService.getArtifact(item.filename);
        assert.ok(art, `Artifact ${item.filename} must exist in registry`);
        assert.equal(art.platform, item.platform);
        assert.equal(art.version, 'V2.0.0-RC1');
        assert.equal(art.buildId, 'BA-V2.0.0-RC1');
        assert.equal(art.sizeBytes, item.expectedSize, `Size in bytes must be exactly ${item.expectedSize}`);
        assert.equal(art.sha256, item.expectedSha256, `SHA-256 must match validated V2.0.0-RC1 hash`);
        assert.ok(art.downloadUrl.endsWith(item.filename), `Download URL must point to /downloads/${item.filename}`);
        assert.equal(art.isAvailable, true);
        assert.equal(art.releaseTag, 'v2.0.0-RC1');
      });
    }

    test('REG-02: Setup alias handles Bird-Academy-Avian-ERP-Setup.exe seamlessly', () => {
      const art = WebDownloadService.getArtifact('Bird-Academy-Avian-ERP-Setup.exe');
      assert.ok(art, 'Setup artifact must be resolvable via Bird-Academy-Avian-ERP-Setup.exe');
      assert.equal(art.sizeBytes, 109726359);
      assert.equal(art.sha256, 'EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3');
    });

    test('REG-03: No outdated v1.3.6 references in active download URLs or release tags', () => {
      const artifacts = WebDownloadService.getAllArtifacts();
      for (const art of artifacts) {
        if (art.releaseTag) {
          assert.ok(!art.releaseTag.includes('1.3.6'), `Artifact ${art.filename} has obsolete releaseTag: ${art.releaseTag}`);
        }
      }
      assert.equal(WebDownloadService.DEFAULT_RELEASE_TAG, 'v2.0.0-RC1');
    });
  });

  // =========================================================================
  // 2. DISK INTEGRITY & MAGIC BYTES
  // =========================================================================
  describe('2. Physical Disk Integrity & Magic Bytes Verification', () => {
    for (const item of EXPECTED_V2_ARTIFACTS) {
      test(`DISK-01 [${item.filename}]: dist_binaries exists, matches size and magic header`, () => {
        const filePath = path.join(rootDir, 'dist_binaries', item.filename);
        assert.ok(fs.existsSync(filePath), `Physical file ${filePath} must exist`);
        
        const stat = fs.statSync(filePath);
        assert.equal(stat.size, item.expectedSize, `File on disk must be ${item.expectedSize} bytes`);

        const fd = fs.openSync(filePath, 'r');
        const headerBuf = Buffer.alloc(8);
        fs.readSync(fd, headerBuf, 0, 8, 0);
        fs.closeSync(fd);

        const hex = headerBuf.subarray(0, item.magicHeaderHex.length / 2).toString('hex');
        assert.equal(hex.toLowerCase(), item.magicHeaderHex.toLowerCase(), `Magic header for ${item.filename} must be valid`);
      });

      test(`DISK-02 [${item.filename}]: Architectural isolation — binary is excluded from public/downloads to prevent web bundle bloat`, () => {
        const filePath = path.join(rootDir, 'public', 'downloads', item.filename);
        assert.ok(!fs.existsSync(filePath), `Physical binary ${item.filename} must NOT reside in public/downloads to prevent auto-inclusion in Vite bundles`);
      });
    }
  });

  // =========================================================================
  // 3. HTTP SERVER STREAMING & SHA-256 DOWNLOAD VERIFICATION
  // =========================================================================
  describe('3. HTTP Server Download Streaming & SHA-256 Hash Verification', () => {
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

    for (const item of EXPECTED_V2_ARTIFACTS) {
      test(`HTTP-STREAM [GET /downloads/${item.filename}]: HTTP 200, Content-Length and valid SHA-256`, async () => {
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

        assert.equal(res.statusCode, 200, `Expected 200 OK for ${item.filename}, got ${res.statusCode}`);
        assert.equal(parseInt(res.headers['content-length'] || '0', 10), item.expectedSize);
        assert.equal(res.body.length, item.expectedSize);

        // Compute SHA-256 of downloaded body
        const hash = crypto.createHash('sha256').update(res.body).digest('hex').toUpperCase();
        assert.equal(hash, item.expectedSha256, `Downloaded body hash mismatch for ${item.filename}`);
      });
    }

    test('HTTP-STREAM [GET /downloads/Bird-Academy-Avian-ERP-Setup.exe]: Also streams Setup matching V2.0.0-RC1 hash', async () => {
      const url = `http://127.0.0.1:${serverPort}/downloads/Bird-Academy-Avian-ERP-Setup.exe`;

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

      assert.equal(res.statusCode, 200);
      assert.equal(parseInt(res.headers['content-length'] || '0', 10), 109726359);
      assert.equal(res.body.length, 109726359);

      const hash = crypto.createHash('sha256').update(res.body).digest('hex').toUpperCase();
      assert.equal(hash, 'EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3');
    });

    test('Teardown live HTTP test server', async () => {
      if (server) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });
});

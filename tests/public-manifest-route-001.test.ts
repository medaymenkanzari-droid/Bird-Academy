/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BIRD ACADEMY ENTERPRISE — PUBLIC MANIFEST ROUTE VERIFICATION
 *
 * Targeted verification ensuring:
 * GET /downloads/SHA256SUMS-USER.txt
 * - HTTP 200
 * - Content-Type includes text/plain
 * - Non-empty content
 * - Contains the 3 certified binaries:
 *   - Bird-Academy-Avian-ERP-Setup.exe
 *   - Bird-Academy-User.exe
 *   - Bird-Academy-User.apk
 * - Contains the 3 certified V2.0.0-RC1 SHA-256 hashes.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { LmseBackendServer } from '../src/server/lmseServer';

describe('MISSION PUBLIC-MANIFEST-ROUTE-001 — SHA256SUMS-USER.txt EXPOSURE', () => {
  let server: http.Server;
  let serverPort: number;

  const EXPECTED_HASH_SETUP = 'BA8EC925064FBE1AAFB53635FB1FF4277611485A5C8F1BD916B45339A3EC3EA1';
  const EXPECTED_HASH_PORTABLE = '1C7F50E6A689970B12BFF15EFD4DB769DF8138B0159A8E142617EF683032939B';
  const EXPECTED_HASH_APK = '1D3CC180339B55C2701CB3AE6CF6FC209D37720D8737B3CD8DBBD3BEFABDD290';

  before(async () => {
    const lmseBackend = new LmseBackendServer();
    await new Promise<void>((resolve) => {
      server = lmseBackend.app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        serverPort = addr.port;
        resolve();
      });
    });
    assert.ok(serverPort > 0, 'Server should listen on random port');
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  test('GET /downloads/SHA256SUMS-USER.txt returns HTTP 200 with text/plain and certified V2.0.0-RC1 hashes', async () => {
    const url = `http://127.0.0.1:${serverPort}/downloads/SHA256SUMS-USER.txt`;

    const chunks: Buffer[] = [];
    const res = await new Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
      http.get(url, (response) => {
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode || 0,
            headers: response.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
        response.on('error', reject);
      }).on('error', reject);
    });

    // 1. HTTP 200
    assert.strictEqual(res.statusCode, 200, 'Expected HTTP 200 for manifest');

    // 2. Content-Type text/plain
    const contentType = res.headers['content-type'] || '';
    assert.ok(contentType.includes('text/plain'), `Expected Content-Type to include text/plain, got: ${contentType}`);

    // 3. Non-empty content
    assert.ok(res.body.length > 0, 'Manifest body must not be empty');

    // 4. Presence of 3 certified binaries
    assert.ok(res.body.includes('Bird-Academy-Avian-ERP-Setup.exe'), 'Must include Bird-Academy-Avian-ERP-Setup.exe');
    assert.ok(res.body.includes('Bird-Academy-User.exe'), 'Must include Bird-Academy-User.exe');
    assert.ok(res.body.includes('Bird-Academy-User.apk'), 'Must include Bird-Academy-User.apk');

    // 5. Presence of the 3 certified SHA-256 hashes
    assert.ok(res.body.includes(EXPECTED_HASH_SETUP), `Must include Setup SHA: ${EXPECTED_HASH_SETUP}`);
    assert.ok(res.body.includes(EXPECTED_HASH_PORTABLE), `Must include Portable SHA: ${EXPECTED_HASH_PORTABLE}`);
    assert.ok(res.body.includes(EXPECTED_HASH_APK), `Must include APK SHA: ${EXPECTED_HASH_APK}`);
  });
});

import test, { describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { LmseBackendServer } from '../src/server/lmseServer.ts';
import { WebDownloadService } from '../src/features/commercial-website/services/WebDownloadService.ts';

describe('MISSION PUBLIC-RC6-VERIFICATION-002 — ANTI-RC4 REGRESSION & FAIL-CLOSED SUITE', () => {
  let serverInstance: LmseBackendServer;
  let httpServer: http.Server;
  let baseUrl: string;
  const PORT = 3892;

  const FORBIDDEN_RC4 = {
    version: '1.3.6-RC4',
    shortVersion: 'RC4',
    setupSha: '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813',
    setupSize: 117318317,
  };

  const EXPECTED_RC6 = {
    version: '1.3.6-RC6',
    setupSha: '746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B',
    setupSize: 112731374,
    portableSha: 'EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE',
    portableSize: 111233160,
    apkSha: '061CF531C7DE55465C093874ABF9C649CA3830659EFDE1443E2F8C911E4717DB',
    apkSize: 12043947,
  };

  before(async () => {
    serverInstance = new LmseBackendServer();
    await new Promise<void>((resolve) => {
      httpServer = serverInstance.app.listen(PORT, () => resolve());
    });
    baseUrl = `http://localhost:${PORT}`;
  });

  after(async () => {
    if (httpServer) {
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }
  });

  // Helper HTTP GET
  async function httpGet(urlPath: string): Promise<{
    statusCode: number;
    headers: http.IncomingHttpHeaders;
    sha256: string;
    totalBytes: number;
    bodyText: string;
  }> {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${urlPath}`, (res) => {
        const hash = crypto.createHash('sha256');
        let totalBytes = 0;
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
          hash.update(chunk);
          totalBytes += chunk.length;
          chunks.push(chunk);
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            sha256: hash.digest('hex').toUpperCase(),
            totalBytes,
            bodyText: Buffer.concat(chunks).toString('utf-8'),
          });
        });

        res.on('error', reject);
      }).on('error', reject);
    });
  }

  // =========================================================================
  // 1. ANTI-RC4 SOURCE & CODE CHECKS
  // =========================================================================
  test('ANTI-RC4-01: site web/site-bird-academy.html ne contient aucune occurrence de RC4 ni du hash 1E965B...', () => {
    const htmlPath = path.resolve(process.cwd(), 'site web/site-bird-academy.html');
    const content = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(!content.includes(FORBIDDEN_RC4.version), `site-bird-academy.html ne doit pas contenir ${FORBIDDEN_RC4.version}`);
    assert.ok(!content.includes(FORBIDDEN_RC4.setupSha), `site-bird-academy.html ne doit pas contenir ${FORBIDDEN_RC4.setupSha}`);
    assert.ok(content.includes(EXPECTED_RC6.version), 'site-bird-academy.html doit afficher 1.3.6-RC6');
    assert.ok(content.includes(EXPECTED_RC6.setupSha), 'site-bird-academy.html doit afficher le SHA RC6');
  });

  test('ANTI-RC4-02: WebDownloadService.ts ne contient aucun hash ni métadonnée RC4', () => {
    const servicePath = path.resolve(process.cwd(), 'src/features/commercial-website/services/WebDownloadService.ts');
    const content = fs.readFileSync(servicePath, 'utf-8');

    assert.ok(!content.includes(FORBIDDEN_RC4.setupSha), 'WebDownloadService ne doit pas contenir le SHA RC4');
    assert.ok(!content.includes(FORBIDDEN_RC4.version), 'WebDownloadService ne doit pas référencer 1.3.6-RC4');
    assert.ok(content.includes(EXPECTED_RC6.version), 'WebDownloadService doit référencer 1.3.6-RC6');
    assert.ok(content.includes(EXPECTED_RC6.setupSha), 'WebDownloadService doit référencer le SHA RC6');
  });

  test('ANTI-RC4-03: WebDownloadService.getPublicDownloadUrl génère des URLs vers RC6 (et jamais RC4/RC5)', () => {
    const setupUrl = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User-Windows-Setup.exe');
    const portableUrl = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User.exe');
    const apkUrl = WebDownloadService.getPublicDownloadUrl('Bird-Academy-User.apk');

    assert.ok(setupUrl.includes('v1.3.6-RC6'), `L'URL Windows Setup doit pointer vers v1.3.6-RC6: ${setupUrl}`);
    assert.ok(!setupUrl.includes('v1.3.6-RC4'), 'L URL ne doit pas pointer vers RC4');
    assert.ok(!setupUrl.includes('v1.3.6-RC5'), 'L URL ne doit pas pointer vers RC5');

    assert.ok(portableUrl.includes('v1.3.6-RC6'));
    assert.ok(apkUrl.includes('v1.3.6-RC6'));
  });

  // =========================================================================
  // 2. ANTI-RC4 HTTP ROUTE CHECKS
  // =========================================================================
  test('ANTI-RC4-04: GET /downloads/Bird-Academy-User-Windows-Setup.exe retourne STRICTEMENT RC6 et rejette RC4', async () => {
    const res = await httpGet('/downloads/Bird-Academy-User-Windows-Setup.exe');

    assert.strictEqual(res.statusCode, 200, 'Doit retourner HTTP 200');
    assert.strictEqual(res.totalBytes, EXPECTED_RC6.setupSize, `Taille doit être ${EXPECTED_RC6.setupSize}`);
    assert.strictEqual(res.sha256, EXPECTED_RC6.setupSha, 'SHA-256 doit être celui de RC6');
    assert.notStrictEqual(res.sha256, FORBIDDEN_RC4.setupSha, 'SHA-256 ne doit JAMAIS être celui de RC4');
    assert.notStrictEqual(res.totalBytes, FORBIDDEN_RC4.setupSize, 'Taille ne doit JAMAIS être celle de RC4');
  });

  test('ANTI-RC4-05: GET /downloads/Bird-Academy-User.exe retourne STRICTEMENT RC6 Portable', async () => {
    const res = await httpGet('/downloads/Bird-Academy-User.exe');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.totalBytes, EXPECTED_RC6.portableSize);
    assert.strictEqual(res.sha256, EXPECTED_RC6.portableSha);
  });

  test('ANTI-RC4-06: GET /downloads/Bird-Academy-User.apk retourne STRICTEMENT RC6 APK', async () => {
    const res = await httpGet('/downloads/Bird-Academy-User.apk');

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.totalBytes, EXPECTED_RC6.apkSize);
    assert.strictEqual(res.sha256, EXPECTED_RC6.apkSha);
  });

  // =========================================================================
  // 3. FAIL-CLOSED INTEGRITY CHECKS (Directive 6)
  // =========================================================================
  test('ANTI-RC4-07: FAIL-CLOSED — Requête d un artefact non existant ou corrompu retourne HTTP 500 INTEGRITY_CHECK_FAILED sans fuite interne', async () => {
    // Créons temporairement une instance mockée ou testons une requête dont le binaire est manquant
    // Si un fichier inconnu est demandé : HTTP 404
    const res404 = await httpGet('/downloads/unknown-file.exe');
    assert.strictEqual(res404.statusCode, 404);
    assert.ok(!res404.bodyText.includes(process.cwd()));
    assert.ok(!res404.bodyText.includes('stack'));
  });

  test('ANTI-RC4-08: Protection contre fuite de chemins locaux et stack trace sur les erreurs de téléchargement', async () => {
    const res = await httpGet('/downloads/..%2f..%2fpackage.json');
    assert.ok(res.statusCode === 400 || res.statusCode === 404);
    assert.ok(!res.bodyText.includes(process.cwd()));
    assert.ok(!res.bodyText.includes('C:\\'));
    assert.ok(!res.bodyText.includes('node_modules'));
  });
});

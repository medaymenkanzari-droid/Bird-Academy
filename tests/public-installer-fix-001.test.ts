import test, { describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { LmseBackendServer } from '../src/server/lmseServer.js';

describe('MISSION PUBLIC-INSTALLER-FIX-001 — Validation Distribution Publique RC6', () => {
  let serverInstance: LmseBackendServer;
  let httpServer: http.Server;
  let baseUrl: string;
  const PORT = 3889;

  const OFFICIAL_RC6_ARTIFACTS = {
    setup: {
      filename: 'Bird-Academy-User-Windows-Setup.exe',
      expectedSha256: '746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B',
      expectedSize: 112731374,
      forbiddenRc4Sha: '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813',
    },
    portable: {
      filename: 'Bird-Academy-User.exe',
      expectedSha256: 'EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE',
      expectedSize: 111233160,
    },
    apk: {
      filename: 'Bird-Academy-User.apk',
      expectedSha256: '061CF531C7DE55465C093874ABF9C649CA3830659EFDE1443E2F8C911E4717DB',
      expectedSize: 12043947,
    },
    guide: {
      filename: 'LMSE_OWNER_GUIDE.pdf',
      expectedSha256: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
      expectedSize: 428378,
    },
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

  // Helper pour télécharger et calculer SHA-256 via stream HTTP
  async function downloadAndHash(urlPath: string): Promise<{
    statusCode: number;
    headers: http.IncomingHttpHeaders;
    sha256: string;
    totalBytes: number;
    rawBodyText?: string;
  }> {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${urlPath}`, (res) => {
        const hash = crypto.createHash('sha256');
        let totalBytes = 0;
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
          hash.update(chunk);
          totalBytes += chunk.length;
          if (res.statusCode && res.statusCode >= 400) {
            chunks.push(chunk);
          }
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            sha256: hash.digest('hex').toUpperCase(),
            totalBytes,
            rawBodyText: chunks.length ? Buffer.concat(chunks).toString('utf-8') : undefined,
          });
        });

        res.on('error', reject);
      }).on('error', reject);
    });
  }

  // =========================================================================
  // 1. NON-REGRESSION INITIAL ISSUE: ROOT RC4 vs DIST_BINARIES RC6
  // =========================================================================
  test('FIX-001-01: L installateur servi est strictement RC6 et non l ancien RC4 présent à la racine', async () => {
    // Vérifions d'abord la présence du vieux fichier RC4 à la racine pour prouver la non-régression
    const rootRc4Path = path.join(process.cwd(), 'Bird-Academy-User-Windows-Setup.exe');
    assert.ok(fs.existsSync(rootRc4Path), 'Le fichier racine historique doit exister pour certifier le test de non-régression');

    const res = await downloadAndHash(`/downloads/${OFFICIAL_RC6_ARTIFACTS.setup.filename}`);

    assert.strictEqual(res.statusCode, 200, 'Le serveur doit répondre avec un code 200');
    assert.strictEqual(res.totalBytes, OFFICIAL_RC6_ARTIFACTS.setup.expectedSize, 'La taille reçue doit être exactement 112 731 374 octets (RC6)');
    assert.strictEqual(res.sha256, OFFICIAL_RC6_ARTIFACTS.setup.expectedSha256, 'Le hash SHA-256 doit être celui certifié de RC6');
    assert.notStrictEqual(res.sha256, OFFICIAL_RC6_ARTIFACTS.setup.forbiddenRc4Sha, 'Le hash SHA-256 ne doit JAMAIS être celui de RC4');
    assert.strictEqual(res.headers['content-disposition'], `attachment; filename="${OFFICIAL_RC6_ARTIFACTS.setup.filename}"`);
    assert.strictEqual(res.headers['etag'], `"${OFFICIAL_RC6_ARTIFACTS.setup.expectedSha256}"`);
  });

  // =========================================================================
  // 2. HTTP DOWNLOAD OF ALL RC6 ARTIFACTS
  // =========================================================================
  test('FIX-001-02: Téléchargement HTTP Windows Portable certifié RC6', async () => {
    const res = await downloadAndHash(`/downloads/${OFFICIAL_RC6_ARTIFACTS.portable.filename}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.totalBytes, OFFICIAL_RC6_ARTIFACTS.portable.expectedSize);
    assert.strictEqual(res.sha256, OFFICIAL_RC6_ARTIFACTS.portable.expectedSha256);
    assert.strictEqual(res.headers['etag'], `"${OFFICIAL_RC6_ARTIFACTS.portable.expectedSha256}"`);
  });

  test('FIX-001-03: Téléchargement HTTP Android APK certifié RC6', async () => {
    const res = await downloadAndHash(`/downloads/${OFFICIAL_RC6_ARTIFACTS.apk.filename}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.totalBytes, OFFICIAL_RC6_ARTIFACTS.apk.expectedSize);
    assert.strictEqual(res.sha256, OFFICIAL_RC6_ARTIFACTS.apk.expectedSha256);
    assert.strictEqual(res.headers['etag'], `"${OFFICIAL_RC6_ARTIFACTS.apk.expectedSha256}"`);
  });

  test('FIX-001-04: Téléchargement HTTP LMSE Owner Guide PDF', async () => {
    const res = await downloadAndHash(`/downloads/${OFFICIAL_RC6_ARTIFACTS.guide.filename}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.totalBytes, OFFICIAL_RC6_ARTIFACTS.guide.expectedSize);
    assert.strictEqual(res.sha256, OFFICIAL_RC6_ARTIFACTS.guide.expectedSha256);
  });

  // =========================================================================
  // 3. FAIL-CLOSED SECURITY & NO INTERNAL INFORMATION LEAK (Directive 2)
  // =========================================================================
  test('FIX-001-05: Fichier inconnu retourne 404 sans fuite d informations internes', async () => {
    const res = await downloadAndHash('/downloads/malicious-or-unknown.exe');

    assert.strictEqual(res.statusCode, 404);
    assert.ok(res.rawBodyText);
    const body = JSON.parse(res.rawBodyText);
    assert.strictEqual(body.error, 'NOT_FOUND');
    assert.strictEqual(body.message, 'Artefact introuvable.');

    // Contrôle strict de non-fuite d'informations
    assert.ok(!res.rawBodyText.includes(process.cwd()), 'La réponse ne doit pas contenir rootDir');
    assert.ok(!res.rawBodyText.includes('\\'), 'La réponse ne doit pas contenir de séparateur de chemin Windows');
    assert.ok(!res.rawBodyText.includes('/'), 'La réponse ne doit pas contenir de chemin POSIX interne');
    assert.ok(!res.rawBodyText.includes('stack'), 'La réponse ne doit pas contenir de stack trace');
  });

  test('FIX-001-06: Tentative d injection de chemin (directory traversal) rejetée en 400', async () => {
    const res = await downloadAndHash('/downloads/..%2Fpackage.json');

    assert.ok(res.statusCode === 400 || res.statusCode === 404);
    assert.ok(res.rawBodyText);
    // Vérification qu'aucune info sensible n'est renvoyée
    assert.ok(!res.rawBodyText.includes(process.cwd()));
  });
});

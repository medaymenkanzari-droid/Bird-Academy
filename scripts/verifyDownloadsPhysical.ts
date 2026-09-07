/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PHYSICAL ARTIFACT DOWNLOAD VERIFIER (N8)
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { LmseBackendServer } from '../src/server/lmseServer.ts';

async function run() {
  console.log('\n=============================================================');
  console.log('  BIRD ACADEMY — VÉRIFICATION PHYSIQUE DES TÉLÉCHARGEMENTS (N8)');
  console.log('=============================================================\n');

  const lmseBackend = new LmseBackendServer();
  const server = http.createServer(lmseBackend.app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const port = (server.address() as any).port;
  console.log(`[SERVEUR LOCAL ACTIF] http://127.0.0.1:${port}\n`);

  const scratchDir = path.join(process.cwd(), 'scratch', 'n8_manual_downloads');
  if (fs.existsSync(scratchDir)) fs.rmSync(scratchDir, { recursive: true, force: true });
  fs.mkdirSync(scratchDir, { recursive: true });

  const artifacts = [
    {
      name: 'Bird-Academy-User-Windows-Setup.exe',
      label: 'Installateur Windows Setup (.exe)',
      expectedBytes: 117318317,
      expectedSha256: '1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813',
      magicExpected: '4d5a', // MZ
    },
    {
      name: 'Bird-Academy-User.exe',
      label: 'Exécutable Windows Portable (.exe)',
      expectedBytes: 116643591,
      expectedSha256: '1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92',
      magicExpected: '4d5a', // MZ
    },
    {
      name: 'Bird-Academy-User.apk',
      label: 'Package Android APK (.apk)',
      expectedBytes: 5187830,
      expectedSha256: '8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9',
      magicExpected: '504b0304', // PK..
    },
    {
      name: 'LMSE_OWNER_GUIDE.pdf',
      label: 'Manuel Utilisateur & Guide LMSE (.pdf)',
      expectedBytes: 428378,
      expectedSha256: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
      magicExpected: '25504446', // %PDF
    },
  ];

  for (const item of artifacts) {
    console.log(`[TEST EN COURS] ${item.label}`);
    console.log(`  -> Requête HTTP: GET /downloads/${item.name}`);
    const destFile = path.join(scratchDir, item.name);
    const start = Date.now();

    await new Promise<void>((resolve, reject) => {
      const out = fs.createWriteStream(destFile);
      http.get(`http://127.0.0.1:${port}/downloads/${item.name}`, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP Status ${res.statusCode}`));
          return;
        }
        res.pipe(out);
        out.on('finish', () => {
          out.close();
          resolve();
        });
      }).on('error', reject);
    });

    const elapsed = Date.now() - start;
    const buf = fs.readFileSync(destFile);
    const sha = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
    const magic = buf.subarray(0, item.magicExpected.length / 2).toString('hex').toLowerCase();

    console.log(`  -> Taille réelle téléchargée : ${buf.length.toLocaleString('fr-FR')} octets (${(buf.length / 1024 / 1024).toFixed(2)} Mo) [${elapsed}ms]`);
    console.log(`  -> Empreinte SHA-256 calculée : ${sha}`);
    console.log(`  -> Empreinte SHA-256 officielle: ${item.expectedSha256}`);
    console.log(`  -> Octets magiques (Header)  : 0x${magic} (Attendu: 0x${item.magicExpected})`);

    const isSizeOk = buf.length === item.expectedBytes;
    const isShaOk = sha === item.expectedSha256;
    const isMagicOk = magic === item.magicExpected;

    if (isSizeOk && isShaOk && isMagicOk) {
      console.log(`  -> RÉSULTAT : [VALIDE ET EXÉCUTABLE/OUVRABLE]\n`);
    } else {
      console.error(`  -> RÉSULTAT : [ANOMALIE DÉTECTÉE]\n`);
      process.exit(1);
    }
  }

  server.close();
  console.log('=============================================================');
  console.log('  BILAN : 4 TÉLÉCHARGEMENTS SUR 4 SONT PARFAITEMENT VALIDES');
  console.log('=============================================================\n');
}

run().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});

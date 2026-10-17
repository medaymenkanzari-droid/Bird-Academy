/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — V2.0.0-RC1 OFFICIAL RELEASE PUBLICATION SCRIPT
 * Creates the v2.0.0-RC1 release on GitHub and uploads verified release artifacts.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const REPO = 'medaymenkanzari-droid/Bird-Academy';
const TAG_NAME = 'v2.0.0-RC1';

const ROOT_DIR = path.resolve(__dirname, '..');

const assetsToUpload = [
  {
    name: 'Bird-Academy-User-Windows-Setup.exe',
    filePath: path.join(ROOT_DIR, 'release', 'Bird-Academy-User-Windows-Setup.exe'),
    contentType: 'application/x-msdownload',
    expectedSize: 109726359,
    expectedSha256: 'EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3'
  },
  {
    name: 'Bird-Academy-Avian-ERP-Setup.exe',
    filePath: path.join(ROOT_DIR, 'release', 'Bird-Academy-Avian-ERP-Setup.exe'),
    contentType: 'application/x-msdownload',
    expectedSize: 109726359,
    expectedSha256: 'EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3'
  },
  {
    name: 'Bird-Academy-User.exe',
    filePath: path.join(ROOT_DIR, 'release', 'Bird-Academy-User.exe'),
    contentType: 'application/x-msdownload',
    expectedSize: 109387829,
    expectedSha256: '6D302819F9C3E240484B7F5B54FB7904F004961D58444EA5373DDC763D2E372D'
  },
  {
    name: 'Bird-Academy-User.apk',
    filePath: path.join(ROOT_DIR, 'release', 'Bird-Academy-User.apk'),
    contentType: 'application/vnd.android.package-archive',
    expectedSize: 18402794,
    expectedSha256: '8ABFC3F66329109F1F5A70EFE4EF0C5964795B19ED3D64C88D32EF24B9725DEC'
  }
];

async function hashFile(p) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(p);
    stream.on('data', d => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex').toUpperCase()));
    stream.on('error', reject);
  });
}

function githubRequest(method, endpoint, data = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: method,
      headers: {
        'User-Agent': 'Bird-Academy-Release-Publisher',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    };

    if (data) {
      options.headers['Content-Type'] = contentType;
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        } else if (res.statusCode === 404) {
          resolve({ statusCode: 404, data: null });
        } else {
          reject(new Error(`GitHub API ${method} ${endpoint} returned ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function uploadAsset(releaseId, asset) {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(asset.filePath);
    console.log(`[UPLOAD START] Uploading ${asset.name} (${stats.size.toLocaleString()} bytes)...`);

    const options = {
      hostname: 'uploads.github.com',
      path: `/repos/${REPO}/releases/${releaseId}/assets?name=${encodeURIComponent(asset.name)}`,
      method: 'POST',
      headers: {
        'User-Agent': 'Bird-Academy-Release-Publisher',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': asset.contentType,
        'Content-Length': stats.size,
        'Accept': 'application/vnd.github+json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const json = JSON.parse(body);
          console.log(`[UPLOAD SUCCESS] ${asset.name} (Asset ID: ${json.id}, Size: ${json.size})`);
          resolve(json);
        } else {
          reject(new Error(`Failed to upload ${asset.name}: HTTP ${res.statusCode} - ${body}`));
        }
      });
    });

    req.on('error', reject);

    let uploadedBytes = 0;
    const stream = fs.createReadStream(asset.filePath);
    let lastLog = Date.now();

    stream.on('data', chunk => {
      uploadedBytes += chunk.length;
      const now = Date.now();
      if (now - lastLog > 5000) {
        const percent = ((uploadedBytes / stats.size) * 100).toFixed(1);
        console.log(`  [PROGRESS ${asset.name}] ${(uploadedBytes / 1024 / 1024).toFixed(1)} MB / ${(stats.size / 1024 / 1024).toFixed(1)} MB (${percent}%)`);
        lastLog = now;
      }
    });

    stream.pipe(req);
  });
}

async function main() {
  console.log('==================================================================');
  console.log(` PUBLICATION OFFICIELLE GITHUB RELEASE V2.0.0-RC1 (${TAG_NAME})`);
  console.log('==================================================================');

  // Step 1: Strict integrity check of physical files
  console.log('[1/4] Contrôle d\'intégrité strict des artefacts locaux...');
  for (const asset of assetsToUpload) {
    if (!fs.existsSync(asset.filePath)) {
      throw new Error(`Artefact manquant: ${asset.filePath}`);
    }
    const stat = fs.statSync(asset.filePath);
    if (stat.size !== asset.expectedSize) {
      throw new Error(`Taille invalide pour ${asset.name}: ${stat.size} !== ${asset.expectedSize}`);
    }
    const hash = await hashFile(asset.filePath);
    if (hash !== asset.expectedSha256) {
      throw new Error(`SHA-256 invalide pour ${asset.name}: ${hash} !== ${asset.expectedSha256}`);
    }
    console.log(`  PASS: ${asset.name} (Taille: ${stat.size}, Hash: ${hash})`);
  }

  // Step 2: Check or create release
  console.log(`[2/4] Vérification de la release ${TAG_NAME} sur ${REPO}...`);
  let release = null;
  const releaseBody = `## Bird Academy Enterprise — Volière Manager v2.0.0-RC1 (Official Release Candidate)

### Distribution Officielle de Qualification V2.0.0-RC1
- **Windows Setup** : \`Bird-Academy-User-Windows-Setup.exe\` (et alias \`Bird-Academy-Avian-ERP-Setup.exe\`)
- **Windows Portable** : \`Bird-Academy-User.exe\`
- **Android APK** : \`Bird-Academy-User.apk\`

### Empreintes Numériques SHA-256 Scellées
| Artefact | Taille | SHA-256 |
|---|---:|---|
| **Bird-Academy-User-Windows-Setup.exe** | 109 726 359 octets | \`EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3\` |
| **Bird-Academy-Avian-ERP-Setup.exe** | 109 726 359 octets | \`EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3\` |
| **Bird-Academy-User.exe** | 109 387 829 octets | \`6D302819F9C3E240484B7F5B54FB7904F004961D58444EA5373DDC763D2E372D\` |
| **Bird-Academy-User.apk** | 18 402 794 octets | \`8ABFC3F66329109F1F5A70EFE4EF0C5964795B19ED3D64C88D32EF24B9725DEC\` |

---
*Authentifié par l'autorité cryptographique Bird Academy Enterprise — BUILD_ID: BA-V2.0.0-RC1*`;

  const existingRes = await githubRequest('GET', `/repos/${REPO}/releases/tags/${TAG_NAME}`);
  if (existingRes.statusCode === 200 && existingRes.data) {
    console.log(`  Release existante trouvée: ID ${existingRes.data.id}`);
    release = existingRes.data;
    // Update release description
    await githubRequest('PATCH', `/repos/${REPO}/releases/${release.id}`, JSON.stringify({ body: releaseBody }));
    console.log(`  Description de la release mise à jour.`);
  } else {
    console.log(`  Création de la release ${TAG_NAME}...`);
    const payload = JSON.stringify({
      tag_name: TAG_NAME,
      name: `Bird Academy Enterprise — Volière Manager ${TAG_NAME}`,
      body: releaseBody,
      draft: false,
      prerelease: true
    });

    const createRes = await githubRequest('POST', `/repos/${REPO}/releases`, payload);
    release = createRes.data;
    console.log(`  Release ${TAG_NAME} créée avec succès: ID ${release.id}`);
  }

  // Step 3: Inspect existing assets
  console.log(`[3/4] Inspection des assets attachés à la release ID ${release.id}...`);
  const assetsRes = await githubRequest('GET', `/repos/${REPO}/releases/${release.id}/assets`);
  const existingAssets = Array.isArray(assetsRes.data) ? assetsRes.data : [];
  console.log(`  ${existingAssets.length} asset(s) déjà présent(s).`);

  // Step 4: Upload missing assets
  console.log(`[4/4] Téléversement des artefacts officiels V2.0.0-RC1...`);
  for (const asset of assetsToUpload) {
    const existing = existingAssets.find(a => a.name === asset.name);
    if (existing && existing.size === asset.expectedSize) {
      console.log(`  Asset déjà présent et complet: ${asset.name} (${existing.size} octets) - ignoré.`);
    } else {
      if (existing) {
        console.log(`  Suppression de l'asset incomplet/ancien ${asset.name} (ID: ${existing.id})...`);
        await githubRequest('DELETE', `/repos/${REPO}/releases/assets/${existing.id}`);
      }
      await uploadAsset(release.id, asset);
    }
  }

  // Step 5: Verification of final release assets
  console.log('--- Vérification finale des assets en ligne ---');
  const finalAssetsRes = await githubRequest('GET', `/repos/${REPO}/releases/${release.id}/assets`);
  const finalAssets = finalAssetsRes.data;
  console.log(`Total assets en ligne: ${finalAssets.length}`);
  for (const a of finalAssets) {
    console.log(`  - ${a.name}: ${a.size} octets (download_url: ${a.browser_download_url})`);
  }

  console.log('==================================================================');
  console.log(' PUBLICATION GITHUB V2.0.0-RC1 TERMINÉE AVEC SUCCÈS !');
  console.log(` URL Release: ${release.html_url}`);
  console.log('==================================================================');
}

main().catch(err => {
  console.error('Erreur fatale publication GitHub V2:', err);
  process.exit(1);
});

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const BIN_DIR = path.join(process.cwd(), 'dist_binaries');
const files = ['Bird-Academy-User-Windows-Setup.exe', 'Bird-Academy-User.exe', 'Bird-Academy-User.apk'];

console.log('=== DETAILED BINARY AUDIT ===\n');

for (const filename of files) {
  const full = path.join(BIN_DIR, filename);
  if (!fs.existsSync(full)) {
    console.error(`File NOT found: ${filename}`);
    continue;
  }
  const stat = fs.statSync(full);
  const buf = fs.readFileSync(full);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();

  console.log(`[FILE] ${filename}`);
  console.log(`  Size: ${stat.size} bytes (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`  SHA-256: ${sha256}`);
  console.log(`  Last Modified: ${stat.mtime.toISOString()}`);

  if (filename.endsWith('.exe')) {
    const magic = buf.toString('ascii', 0, 2);
    const peOffset = buf.readUInt32LE(0x3C);
    const peHeader = buf.toString('ascii', peOffset, peOffset + 4);
    const machine = buf.readUInt16LE(peOffset + 4);
    let arch = 'unknown';
    if (machine === 0x8664) arch = 'x64 (AMD64)';
    else if (machine === 0x014c) arch = 'x86 (i386)';
    else if (machine === 0xaa64) arch = 'ARM64';

    console.log(`  Format: PE executable (Magic: ${magic})`);
    console.log(`  PE Signature: ${peHeader.replace(/\0/g, '')}`);
    console.log(`  Architecture: ${arch} (Machine: 0x${machine.toString(16)})`);

    const s = buf.toString('latin1', 0, 5000000);
    const isNsis = s.includes('NullsoftInst');
    console.log(`  Installer Type: ${isNsis ? 'NSIS (Nullsoft Scriptable Install System)' : 'Standalone Portable'}`);
  }

  if (filename.endsWith('.apk')) {
    console.log(`  Format: Android Package (ZIP archive)`);
    const listing = execSync(`tar -tf "${full}"`, { encoding: 'utf8' }).split('\n');
    const hasManifest = listing.some(l => l.includes('AndroidManifest.xml'));
    const hasDex = listing.some(l => l.includes('classes.dex'));
    const hasMeta = listing.some(l => l.includes('META-INF'));
    console.log(`  Structure: AndroidManifest.xml=${hasManifest}, classes.dex=${hasDex}, META-INF=${hasMeta}`);
    console.log(`  Total ZIP Entries: ${listing.filter(Boolean).length}`);

    // Read manifest strings
    const manifestBuf = execSync(`tar -xOf "${full}" AndroidManifest.xml`);
    const str = manifestBuf.toString('latin1');
    const tokens = (str.match(/[a-zA-Z0-9_.-]{4,}/g) || []).filter(t => 
      t.includes('com.') || t.includes('bird') || t.includes('1.3') || t.includes('app')
    );
    console.log(`  Manifest Identifiers:`, [...new Set(tokens)].slice(0, 10));
  }
  console.log('');
}

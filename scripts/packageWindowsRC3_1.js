import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'Release', 'Windows-RC3.1');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

// Candidates for build outputs from electron-builder
const candidateDirs = [
  path.join(rootDir, 'release-user-rc3.1'),
  path.join(rootDir, 'release-user-rc31'),
  path.join(rootDir, 'release-user-temp'),
  path.join(rootDir, 'release-user'),
  path.join(rootDir, 'release-electron')
];

let srcSetup = null;
let srcPortable = null;

for (const dir of candidateDirs) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (file.endsWith('.exe')) {
        if (file.toLowerCase().includes('setup') && !srcSetup) {
          srcSetup = fullPath;
        } else if (!file.toLowerCase().includes('setup') && !srcPortable && !file.toLowerCase().includes('uninstaller')) {
          srcPortable = fullPath;
        }
      }
    }
    if (srcSetup && srcPortable) break;
  }
}

if (!srcSetup || !srcPortable) {
  console.error('❌ Error: Could not locate both Setup and Portable executables in candidate build directories.');
  console.error(`Found Setup: ${srcSetup}`);
  console.error(`Found Portable: ${srcPortable}`);
  process.exit(1);
}

const destSetup = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-Setup.exe');
const destPortable = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1.exe');

console.log(`Copying Setup installer from: ${srcSetup}`);
fs.copyFileSync(srcSetup, destSetup);

console.log(`Copying Portable executable from: ${srcPortable}`);
fs.copyFileSync(srcPortable, destPortable);

function getSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
}

const hashSetup = getSha256(destSetup);
const sizeSetup = fs.statSync(destSetup).size;
const sizeSetupMB = (sizeSetup / (1024 * 1024)).toFixed(2);

const hashPortable = getSha256(destPortable);
const sizePortable = fs.statSync(destPortable).size;
const sizePortableMB = (sizePortable / (1024 * 1024)).toFixed(2);

const shaContent = [
  `${hashSetup}  Bird-Academy-User-Windows-RC3.1-Setup.exe (${sizeSetupMB} MB)`,
  `${hashPortable}  Bird-Academy-User-Windows-RC3.1.exe (${sizePortableMB} MB)`
].join('\n') + '\n';

fs.writeFileSync(path.join(releaseDir, 'SHA256SUMS.txt'), shaContent, 'utf8');

console.log('\n==================================================');
console.log(' RELEASE WINDOWS RC3.1 GENERATED SUCCESSFULLY');
console.log('==================================================');
console.log(`Setup    : ${destSetup}`);
console.log(`           Size: ${sizeSetup} bytes (${sizeSetupMB} MB)`);
console.log(`           SHA256: ${hashSetup}`);
console.log(`Portable : ${destPortable}`);
console.log(`           Size: ${sizePortable} bytes (${sizePortableMB} MB)`);
console.log(`           SHA256: ${hashPortable}`);
console.log(`Checksums: ${path.join(releaseDir, 'SHA256SUMS.txt')}`);
console.log('==================================================\n');

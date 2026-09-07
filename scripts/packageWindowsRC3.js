import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'Release', 'Windows-RC3');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const srcSetup = path.join(rootDir, 'release-user-rc3', 'Bird Academy User RC3 Setup 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');
const srcPortable = path.join(rootDir, 'release-user-rc3', 'Bird Academy User RC3 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');

const destSetup = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3-Setup.exe');
const destPortable = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.exe');

console.log('Copying Setup installer...');
fs.copyFileSync(srcSetup, destSetup);

console.log('Copying Portable executable...');
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
  `${hashSetup}  Bird-Academy-User-Windows-RC3-Setup.exe (${sizeSetupMB} MB)`,
  `${hashPortable}  Bird-Academy-User-Windows-RC3.exe (${sizePortableMB} MB)`
].join('\n') + '\n';

fs.writeFileSync(path.join(releaseDir, 'SHA256SUMS.txt'), shaContent, 'utf8');

console.log('\n==================================================');
console.log(' RELEASE WINDOWS RC3 GENERATED SUCCESSFULLY');
console.log('==================================================');
console.log(`Setup    : ${destSetup}`);
console.log(`           Size: ${sizeSetup} bytes (${sizeSetupMB} MB)`);
console.log(`           SHA256: ${hashSetup}`);
console.log(`Portable : ${destPortable}`);
console.log(`           Size: ${sizePortable} bytes (${sizePortableMB} MB)`);
console.log(`           SHA256: ${hashPortable}`);
console.log(`Checksums: ${path.join(releaseDir, 'SHA256SUMS.txt')}`);
console.log('==================================================\n');

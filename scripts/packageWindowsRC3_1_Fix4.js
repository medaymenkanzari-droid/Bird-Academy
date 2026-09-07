import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'Release', 'Windows-RC3.1');
const srcDir = path.join(rootDir, 'release-user-rc3.1-fix4');

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const srcSetup = path.join(srcDir, 'Bird Academy Enterprise Setup 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');
const srcPortable = path.join(srcDir, 'Bird Academy Enterprise 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');

if (!fs.existsSync(srcSetup) || !fs.existsSync(srcPortable)) {
  console.error('❌ Error: Could not locate Fix4 build outputs in release-user-rc3.1-fix4');
  process.exit(1);
}

const destSetupFix4 = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-FIX4-Setup.exe');
const destPortableFix4 = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-FIX4.exe');
const destSetupStandard = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-Setup.exe');
const destPortableStandard = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1.exe');

fs.copyFileSync(srcSetup, destSetupFix4);
fs.copyFileSync(srcPortable, destPortableFix4);
fs.copyFileSync(srcSetup, destSetupStandard);
fs.copyFileSync(srcPortable, destPortableStandard);

function getSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
}

const hashSetupFix4 = getSha256(destSetupFix4);
const sizeSetupFix4 = fs.statSync(destSetupFix4).size;
const sizeSetupFix4MB = (sizeSetupFix4 / (1024 * 1024)).toFixed(2);

const hashPortableFix4 = getSha256(destPortableFix4);
const sizePortableFix4 = fs.statSync(destPortableFix4).size;
const sizePortableFix4MB = (sizePortableFix4 / (1024 * 1024)).toFixed(2);

// Read existing SHA256SUMS.txt if present
let existingSums = '';
const shaFilePath = path.join(releaseDir, 'SHA256SUMS.txt');
if (fs.existsSync(shaFilePath)) {
  existingSums = fs.readFileSync(shaFilePath, 'utf8');
}

const lines = existingSums.split('\n').filter(l => l.trim() && !l.includes('FIX4') && !l.includes('RC3.1-Setup.exe') && !l.includes('RC3.1.exe'));

const newLines = [
  `${hashSetupFix4}  Bird-Academy-User-Windows-RC3.1-FIX4-Setup.exe (${sizeSetupFix4MB} MB)`,
  `${hashPortableFix4}  Bird-Academy-User-Windows-RC3.1-FIX4.exe (${sizePortableFix4MB} MB)`,
  `${hashSetupFix4}  Bird-Academy-User-Windows-RC3.1-Setup.exe (${sizeSetupFix4MB} MB)`,
  `${hashPortableFix4}  Bird-Academy-User-Windows-RC3.1.exe (${sizePortableFix4MB} MB)`,
  ...lines
];

fs.writeFileSync(shaFilePath, newLines.join('\n') + '\n', 'utf8');

console.log('\n==================================================');
console.log(' RELEASE WINDOWS RC3.1 FIX4 GENERATED SUCCESSFULLY');
console.log('==================================================');
console.log(`Setup FIX4    : ${destSetupFix4}`);
console.log(`                Size: ${sizeSetupFix4} bytes (${sizeSetupFix4MB} MB)`);
console.log(`                SHA256: ${hashSetupFix4}`);
console.log(`Portable FIX4 : ${destPortableFix4}`);
console.log(`                Size: ${sizePortableFix4} bytes (${sizePortableFix4MB} MB)`);
console.log(`                SHA256: ${hashPortableFix4}`);
console.log(`Checksums     : ${shaFilePath}`);
console.log('==================================================\n');

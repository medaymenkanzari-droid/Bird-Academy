import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'Release', 'Windows-RC3.1');
const srcDir = path.join(rootDir, 'release-user-rc3.1-fix2');

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const srcSetup = path.join(srcDir, 'Bird Academy Enterprise Setup 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');
const srcPortable = path.join(srcDir, 'Bird Academy Enterprise 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');

if (!fs.existsSync(srcSetup) || !fs.existsSync(srcPortable)) {
  console.error('❌ Error: Could not locate Fix2 build outputs in release-user-rc3.1-fix2');
  process.exit(1);
}

const destSetupFix2 = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-FIX2-Setup.exe');
const destPortableFix2 = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-FIX2.exe');
const destSetupStandard = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-Setup.exe');
const destPortableStandard = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1.exe');

fs.copyFileSync(srcSetup, destSetupFix2);
fs.copyFileSync(srcPortable, destPortableFix2);
fs.copyFileSync(srcSetup, destSetupStandard);
fs.copyFileSync(srcPortable, destPortableStandard);

function getSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
}

const hashSetupFix2 = getSha256(destSetupFix2);
const sizeSetupFix2 = fs.statSync(destSetupFix2).size;
const sizeSetupFix2MB = (sizeSetupFix2 / (1024 * 1024)).toFixed(2);

const hashPortableFix2 = getSha256(destPortableFix2);
const sizePortableFix2 = fs.statSync(destPortableFix2).size;
const sizePortableFix2MB = (sizePortableFix2 / (1024 * 1024)).toFixed(2);

const shaContent = [
  `${hashSetupFix2}  Bird-Academy-User-Windows-RC3.1-FIX2-Setup.exe (${sizeSetupFix2MB} MB)`,
  `${hashPortableFix2}  Bird-Academy-User-Windows-RC3.1-FIX2.exe (${sizePortableFix2MB} MB)`,
  `${hashSetupFix2}  Bird-Academy-User-Windows-RC3.1-Setup.exe (${sizeSetupFix2MB} MB)`,
  `${hashPortableFix2}  Bird-Academy-User-Windows-RC3.1.exe (${sizePortableFix2MB} MB)`
].join('\n') + '\n';

fs.writeFileSync(path.join(releaseDir, 'SHA256SUMS.txt'), shaContent, 'utf8');

console.log('\n==================================================');
console.log(' RELEASE WINDOWS RC3.1 FIX2 GENERATED SUCCESSFULLY');
console.log('==================================================');
console.log(`Setup FIX2    : ${destSetupFix2}`);
console.log(`                Size: ${sizeSetupFix2} bytes (${sizeSetupFix2MB} MB)`);
console.log(`                SHA256: ${hashSetupFix2}`);
console.log(`Portable FIX2 : ${destPortableFix2}`);
console.log(`                Size: ${sizePortableFix2} bytes (${sizePortableFix2MB} MB)`);
console.log(`                SHA256: ${hashPortableFix2}`);
console.log(`Checksums     : ${path.join(releaseDir, 'SHA256SUMS.txt')}`);
console.log('==================================================\n');

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'Release', 'Windows-RC3.1');
const srcDir = path.join(rootDir, 'release-user-rc3.1-fix3');

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const srcSetup = path.join(srcDir, 'Bird Academy Enterprise Setup 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');
const srcPortable = path.join(srcDir, 'Bird Academy Enterprise 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe');

if (!fs.existsSync(srcSetup) || !fs.existsSync(srcPortable)) {
  console.error('❌ Error: Could not locate Fix3 build outputs in release-user-rc3.1-fix3');
  process.exit(1);
}

const destSetupFix3 = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-FIX3-Setup.exe');
const destPortableFix3 = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-FIX3.exe');
const destSetupStandard = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1-Setup.exe');
const destPortableStandard = path.join(releaseDir, 'Bird-Academy-User-Windows-RC3.1.exe');

fs.copyFileSync(srcSetup, destSetupFix3);
fs.copyFileSync(srcPortable, destPortableFix3);
fs.copyFileSync(srcSetup, destSetupStandard);
fs.copyFileSync(srcPortable, destPortableStandard);

function getSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
}

const hashSetupFix3 = getSha256(destSetupFix3);
const sizeSetupFix3 = fs.statSync(destSetupFix3).size;
const sizeSetupFix3MB = (sizeSetupFix3 / (1024 * 1024)).toFixed(2);

const hashPortableFix3 = getSha256(destPortableFix3);
const sizePortableFix3 = fs.statSync(destPortableFix3).size;
const sizePortableFix3MB = (sizePortableFix3 / (1024 * 1024)).toFixed(2);

const shaContent = [
  `${hashSetupFix3}  Bird-Academy-User-Windows-RC3.1-FIX3-Setup.exe (${sizeSetupFix3MB} MB)`,
  `${hashPortableFix3}  Bird-Academy-User-Windows-RC3.1-FIX3.exe (${sizePortableFix3MB} MB)`,
  `${hashSetupFix3}  Bird-Academy-User-Windows-RC3.1-Setup.exe (${sizeSetupFix3MB} MB)`,
  `${hashPortableFix3}  Bird-Academy-User-Windows-RC3.1.exe (${sizePortableFix3MB} MB)`
].join('\n') + '\n';

fs.writeFileSync(path.join(releaseDir, 'SHA256SUMS.txt'), shaContent, 'utf8');

console.log('\n==================================================');
console.log(' RELEASE WINDOWS RC3.1 FIX3 GENERATED SUCCESSFULLY');
console.log('==================================================');
console.log(`Setup FIX3    : ${destSetupFix3}`);
console.log(`                Size: ${sizeSetupFix3} bytes (${sizeSetupFix3MB} MB)`);
console.log(`                SHA256: ${hashSetupFix3}`);
console.log(`Portable FIX3 : ${destPortableFix3}`);
console.log(`                Size: ${sizePortableFix3} bytes (${sizePortableFix3MB} MB)`);
console.log(`                SHA256: ${hashPortableFix3}`);
console.log(`Checksums     : ${path.join(releaseDir, 'SHA256SUMS.txt')}`);
console.log('==================================================\n');

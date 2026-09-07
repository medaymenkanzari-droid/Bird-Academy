import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function calculateSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function backupLmseStorage() {
  const dataDir = path.join(process.cwd(), 'data');
  const backupsDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(backupsDir, `lmse-backup-${timestamp}`);

  fs.mkdirSync(backupFolder, { recursive: true });

  const targetFiles = [
    'licenses.json',
    'revocations.json',
    'license-state.json',
    'license-audit-logs.json',
    'admin-users.json',
  ];

  const manifestFiles = [];

  console.log(`[LMSE BACKUP] Starting LMSE data backup into: ${backupFolder}`);

  for (const fileName of targetFiles) {
    const srcPath = path.join(dataDir, fileName);
    const destPath = path.join(backupFolder, fileName);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      const hash = calculateSha256(destPath);
      const stats = fs.statSync(destPath);
      manifestFiles.push({ fileName, hash, sizeBytes: stats.size });
      console.log(`  ✔ Copied ${fileName} (${stats.size} bytes, sha256: ${hash.substring(0, 12)}...)`);
    } else {
      console.log(`  ℹ File ${fileName} does not exist in data/ (skipped)`);
    }
  }

  const manifest = {
    timestamp: new Date().toISOString(),
    backupFolderName: path.basename(backupFolder),
    filesCount: manifestFiles.length,
    files: manifestFiles,
  };

  fs.writeFileSync(path.join(backupFolder, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`[LMSE BACKUP SUCCESS] Backup completed with manifest.json (${manifestFiles.length} files backed up).`);
  return { backupFolder, manifest };
}

if (process.argv[1] && (process.argv[1].endsWith('backupLmse.js') || process.argv[1].endsWith('backupLmse.ts'))) {
  backupLmseStorage();
}

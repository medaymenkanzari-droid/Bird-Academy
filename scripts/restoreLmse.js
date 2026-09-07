import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function calculateSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function restoreLmseStorage(specificBackupFolder) {
  const backupsDir = path.join(process.cwd(), 'backups');
  const dataDir = path.join(process.cwd(), 'data');

  let targetBackupFolder = specificBackupFolder;

  if (!targetBackupFolder) {
    if (!fs.existsSync(backupsDir)) {
      throw new Error('[LMSE RESTORE ERROR] No backups/ directory found.');
    }
    const entries = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('lmse-backup-'))
      .sort()
      .reverse();

    if (entries.length === 0) {
      throw new Error('[LMSE RESTORE ERROR] No backup folders found in backups/.');
    }
    targetBackupFolder = path.join(backupsDir, entries[0]);
  }

  console.log(`[LMSE RESTORE] Restoring LMSE storage from: ${targetBackupFolder}`);

  const manifestPath = path.join(targetBackupFolder, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`[LMSE RESTORE ERROR] manifest.json missing in ${targetBackupFolder}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  for (const item of manifest.files) {
    const backupFilePath = path.join(targetBackupFolder, item.fileName);
    const destFilePath = path.join(dataDir, item.fileName);

    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`[LMSE RESTORE ERROR] Backup file ${item.fileName} is missing in ${targetBackupFolder}`);
    }

    const currentHash = calculateSha256(backupFilePath);
    if (currentHash !== item.hash) {
      throw new Error(`[LMSE RESTORE CORRUPTION DETECTED] SHA-256 checksum mismatch for ${item.fileName}! Backup file has been tampered with.`);
    }

    fs.copyFileSync(backupFilePath, destFilePath);
    console.log(`  ✔ Restored ${item.fileName} (integrity verified: ${currentHash.substring(0, 12)}...)`);
  }

  console.log(`[LMSE RESTORE SUCCESS] Storage restored successfully from ${path.basename(targetBackupFolder)}.`);
  return { restoredFolder: targetBackupFolder, filesCount: manifest.files.length };
}

if (process.argv[1] && (process.argv[1].endsWith('restoreLmse.js') || process.argv[1].endsWith('restoreLmse.ts'))) {
  const target = process.argv[2];
  restoreLmseStorage(target);
}

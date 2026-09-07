import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

const { BackupRestoreService } = await import(
  '../src/features/platform/services/BackupRestoreService'
);
const { SecurityEngine } = await import('../src/features/platform/engines/SecurityEngine');
const { appStorage } = await import('../src/storage');

function seed(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function read<T>(key: string): T {
  const value = localStorage.getItem(key);
  assert.notEqual(value, null, `La clé ${key} doit exister`);
  return JSON.parse(value as string) as T;
}

beforeEach(() => {
  localStorage.clear();
  seed('canaris', []);
  seed('bird_academy_cages', []);
  seed('couples', []);
  seed('reproductions', []);
  seed('pontes', []);
  seed('jeunes', []);
  seed('health_logs', []);
  seed('hand_feeding_records', []);
  seed('depenses', []);
  seed('ventes', []);
});

test('signs a payload deterministically with SHA-256 and rejects altered data', async () => {
  const envelope = await SecurityEngine.signPayload({ canaris: [{ id: 1 }], cages: [] });

  assert.equal(envelope.security.algorithm, 'SHA-256');
  assert.match(envelope.security.checksum, /^[a-f0-9]{64}$/);
  assert.equal((await SecurityEngine.verifyPayloadSignature(envelope)).isValid, true);

  const altered = structuredClone(envelope);
  altered.payload.canaris[0].id = 999;
  const verification = await SecurityEngine.verifyPayloadSignature(altered);

  assert.equal(verification.isValid, false);
  assert.match(verification.reason ?? '', /checksum/i);
});

test('continues to verify historical cyrb53-signed backups', async () => {
  const legacyEnvelope = {
    payload: { canaris: [{ id: 77 }], cages: [] },
    security: {
      checksum: '37cf7aad07333bd7',
      signature: '52b8e4b3a8484ddf',
      signedAt: '2026-07-18T18:58:20.559Z',
      version: '1.2',
    },
  };

  const verification = await SecurityEngine.verifyPayloadSignature(legacyEnvelope);
  assert.equal(verification.isValid, true);
});

test('rejects a signed backup that declares an unsupported algorithm', async () => {
  const envelope = await SecurityEngine.signPayload({ canaris: [], cages: [] });
  envelope.security.algorithm = 'MD5';

  const verification = await SecurityEngine.verifyPayloadSignature(envelope);
  assert.equal(verification.isValid, false);
  assert.match(verification.reason ?? '', /unsupported security algorithm/i);
});

test('creates a full backup whose simulation reports the real core counts', async () => {
  seed('canaris', [
    { id: 1, nom: 'A', bague: 'BA-1', archived: false },
    { id: 2, nom: 'B', bague: 'BA-2', archived: false },
  ]);
  seed('bird_academy_cages', [{ id: 4, nom: 'Cage 4', capacite_max: 10 }]);
  seed('couples', [{ id: 7, male_id: 1, femelle_id: 2, statut: 'Actif' }]);

  const backup = await BackupRestoreService.createBackup('test automatique');
  assert.equal(backup.success, true);
  assert.ok(backup.data);

  const simulation = await BackupRestoreService.simulateRestore(backup.data as string);
  assert.equal(simulation.isValid, true);
  assert.equal(simulation.isCompatible, true);
  assert.equal(simulation.counts.birds, 2);
  assert.equal(simulation.counts.cages, 1);
  assert.equal(simulation.counts.couples, 1);
});

test('preserves archived birds required by pedigree history', async () => {
  seed('canaris', [
    { id: 1, nom: 'Actif', bague: 'ACTIVE-1', archived: false },
    { id: 2, nom: 'Parent archivé', bague: 'ARCHIVED-2', archived: true },
  ]);

  const backup = await BackupRestoreService.createBackup('oiseaux archivés');
  assert.ok(backup.data);

  seed('canaris', []);
  const result = await BackupRestoreService.executeRestore(backup.data as string);

  assert.equal(result.success, true, result.error);
  assert.deepEqual(read<Array<{ id: number }>>('canaris').map(item => item.id), [1, 2]);
});

test('rejects a backup whose signed payload was modified', async () => {
  const backup = await BackupRestoreService.createBackup('test altération');
  assert.ok(backup.data);

  const parsed = JSON.parse(backup.data as string) as {
    payload: { canaris: unknown[] };
  };
  parsed.payload.canaris.push({ id: 42 });

  const simulation = await BackupRestoreService.simulateRestore(JSON.stringify(parsed));
  assert.equal(simulation.isValid, false);
  assert.equal(simulation.isCompatible, false);
  assert.ok(simulation.compatibilityIssues.some(issue => /signature|checksum/i.test(issue)));
});

test('restores the core collections from a valid full backup', async () => {
  seed('canaris', [{ id: 1, nom: 'Original', bague: 'BA-1', archived: false }]);
  seed('couples', [{ id: 2, male_id: 1, femelle_id: 3, statut: 'Actif' }]);
  seed('reproductions', [{ id: 3, couple_id: 2, statut: 'En cours' }]);
  seed('pontes', [{ id: 4, reproduction_id: 3, oeufs: 5 }]);
  seed('depenses', [{ id: 5, montant: 120 }]);

  const backup = await BackupRestoreService.createBackup('restauration complète');
  assert.ok(backup.data);

  seed('canaris', [{ id: 99, nom: 'À remplacer', bague: 'TMP', archived: false }]);
  seed('couples', []);
  seed('reproductions', []);
  seed('pontes', []);
  seed('depenses', []);

  const result = await BackupRestoreService.executeRestore(backup.data as string);

  assert.equal(result.success, true);
  assert.deepEqual(read<Array<{ id: number }>>('canaris').map(item => item.id), [1]);
  assert.deepEqual(read<Array<{ id: number }>>('couples').map(item => item.id), [2]);
  assert.deepEqual(read<Array<{ id: number }>>('reproductions').map(item => item.id), [3]);
  assert.deepEqual(read<Array<{ id: number }>>('pontes').map(item => item.id), [4]);
  assert.deepEqual(read<Array<{ id: number }>>('depenses').map(item => item.id), [5]);
});

test('rolls back every modified collection when a restore write fails midway', async () => {
  seed('canaris', [{ id: 1, nom: 'Dans la sauvegarde', bague: 'BACKUP-1', archived: false }]);
  seed('couples', [{ id: 2, male_id: 1, femelle_id: 3, statut: 'Actif' }]);
  seed('reproductions', [{ id: 3, couple_id: 2, statut: 'En cours' }]);
  seed('pontes', [{ id: 4, reproduction_id: 3, oeufs: 5 }]);
  const backup = await BackupRestoreService.createBackup('test transactionnel');
  assert.ok(backup.data);

  seed('canaris', [{ id: 91, nom: 'État courant', bague: 'CURRENT-91', archived: false }]);
  seed('couples', [{ id: 92, male_id: 91, femelle_id: 93, statut: 'Actif' }]);
  seed('reproductions', [{ id: 93, couple_id: 92, statut: 'Terminée' }]);
  seed('pontes', [{ id: 94, reproduction_id: 93, oeufs: 2 }]);

  const originalSetItem = appStorage.setItem.bind(appStorage) as typeof appStorage.setItem;
  let failureInjected = false;
  appStorage.setItem = (<T>(key: string, value: T): void => {
    if (key === 'pontes' && !failureInjected) {
      failureInjected = true;
      throw new Error('Panne d’écriture simulée');
    }
    originalSetItem(key, value);
  }) as typeof appStorage.setItem;

  let result: Awaited<ReturnType<typeof BackupRestoreService.executeRestore>>;
  try {
    result = await BackupRestoreService.executeRestore(backup.data as string);
  } finally {
    appStorage.setItem = originalSetItem;
  }

  assert.equal(result.success, false);
  assert.match(result.error ?? '', /données précédentes.*restaurées/i);
  assert.deepEqual(read<Array<{ id: number }>>('canaris').map(item => item.id), [91]);
  assert.deepEqual(read<Array<{ id: number }>>('couples').map(item => item.id), [92]);
  assert.deepEqual(read<Array<{ id: number }>>('reproductions').map(item => item.id), [93]);
  assert.deepEqual(read<Array<{ id: number }>>('pontes').map(item => item.id), [94]);
});

test('a selective finance restore never erases unselected birds or habitats', async () => {
  seed('canaris', [{ id: 1, nom: 'Protégé', bague: 'BA-1', archived: false }]);
  seed('bird_academy_cages', [{ id: 2, nom: 'Cage protégée', capacite_max: 10 }]);
  seed('depenses', [{ id: 3, montant: 45 }]);

  const backup = await BackupRestoreService.createBackup(
    'finance uniquement',
    'selective',
    ['finance'],
  );
  assert.ok(backup.data);

  seed('canaris', [{ id: 10, nom: 'À conserver', bague: 'KEEP', archived: false }]);
  seed('bird_academy_cages', [{ id: 20, nom: 'Habitat à conserver', capacite_max: 8 }]);
  seed('depenses', []);

  const result = await BackupRestoreService.executeRestore(backup.data as string);

  assert.equal(result.success, true);
  assert.deepEqual(read<Array<{ id: number }>>('canaris').map(item => item.id), [10]);
  assert.deepEqual(read<Array<{ id: number }>>('bird_academy_cages').map(item => item.id), [20]);
  assert.deepEqual(read<Array<{ id: number }>>('depenses').map(item => item.id), [3]);
});

test('encrypts a backup with AES-GCM without exposing its records in plaintext', async () => {
  seed('canaris', [
    { id: 1, nom: 'Oiseau Secret', bague: 'SECRET-001', archived: false },
  ]);

  const backup = await BackupRestoreService.createBackup(
    'sauvegarde chiffrée',
    'full',
    [],
    { encrypt: true, password: 'MotDePasse-Solide-2026' },
  );

  assert.equal(backup.success, true);
  assert.ok(backup.data);
  assert.equal((backup.data as string).includes('Oiseau Secret'), false);
  assert.equal((backup.data as string).includes('SECRET-001'), false);

  const envelope = JSON.parse(backup.data as string) as {
    format: string;
    encryption: { algorithm: string; keyDerivation: string };
  };
  assert.equal(envelope.format, 'bird-academy-encrypted-backup');
  assert.equal(envelope.encryption.algorithm, 'AES-256-GCM');
  assert.equal(envelope.encryption.keyDerivation, 'PBKDF2-SHA-256');
});

test('requires the password and rejects a wrong password for an encrypted backup', async () => {
  const backup = await BackupRestoreService.createBackup(
    'protégée',
    'full',
    [],
    { encrypt: true, password: 'Correct-Password-2026' },
  );
  assert.ok(backup.data);

  const withoutPassword = await BackupRestoreService.simulateRestore(backup.data as string);
  assert.equal(withoutPassword.isValid, false);
  assert.equal(withoutPassword.isEncrypted, true);
  assert.equal(withoutPassword.requiresPassword, true);

  const wrongPassword = await BackupRestoreService.simulateRestore(
    backup.data as string,
    'Wrong-Password-2026',
  );
  assert.equal(wrongPassword.isValid, false);
  assert.equal(wrongPassword.isEncrypted, true);
  assert.match(wrongPassword.error ?? '', /incorrect|endommagée/i);
});

test('decrypts and restores an encrypted backup only with the correct password', async () => {
  seed('canaris', [{ id: 5, nom: 'À restaurer', bague: 'BA-5', archived: false }]);
  const password = 'Restore-Password-2026';
  const backup = await BackupRestoreService.createBackup(
    'restauration AES',
    'full',
    [],
    { encrypt: true, password },
  );
  assert.ok(backup.data);

  seed('canaris', [{ id: 99, nom: 'Temporaire', bague: 'TMP', archived: false }]);

  const simulation = await BackupRestoreService.simulateRestore(backup.data as string, password);
  assert.equal(simulation.isValid, true);
  assert.equal(simulation.isEncrypted, true);
  assert.equal(simulation.counts.birds, 1);

  const result = await BackupRestoreService.executeRestore(backup.data as string, password);
  assert.equal(result.success, true);
  assert.deepEqual(read<Array<{ id: number }>>('canaris').map(item => item.id), [5]);
});

test('uses a fresh random salt and IV for every encrypted backup', async () => {
  const options = { encrypt: true, password: 'Unique-Randomness-2026' } as const;
  const first = await BackupRestoreService.createBackup('première', 'full', [], options);
  const second = await BackupRestoreService.createBackup('seconde', 'full', [], options);

  assert.ok(first.data);
  assert.ok(second.data);
  const firstEnvelope = JSON.parse(first.data as string);
  const secondEnvelope = JSON.parse(second.data as string);

  assert.notEqual(firstEnvelope.encryption.salt, secondEnvelope.encryption.salt);
  assert.notEqual(firstEnvelope.encryption.iv, secondEnvelope.encryption.iv);
  assert.notEqual(firstEnvelope.encryption.ciphertext, secondEnvelope.encryption.ciphertext);
});

test('refuses to create an encrypted backup with a short password', async () => {
  const backup = await BackupRestoreService.createBackup(
    'mot de passe faible',
    'full',
    [],
    { encrypt: true, password: '1234' },
  );

  assert.equal(backup.success, false);
  assert.match(backup.error ?? '', /au moins 8 caractères/i);
});

test('creates a real gzip-compressed backup that is smaller for repetitive data', async () => {
  seed('canaris', Array.from({ length: 150 }, (_, index) => ({
    id: index + 1,
    nom: `Oiseau ${index + 1}`,
    bague: `BA-${String(index + 1).padStart(4, '0')}`,
    archived: false,
    observations: 'Observation répétitive destinée à valider la compression gzip. '.repeat(8),
  })));

  const plain = await BackupRestoreService.createBackup(
    'sans compression',
    'full',
    [],
    { compress: false },
  );
  const compressed = await BackupRestoreService.createBackup(
    'avec compression',
    'full',
    [],
    { compress: true },
  );

  assert.equal(compressed.success, true);
  assert.ok(plain.data);
  assert.ok(compressed.data);
  assert.ok((compressed.data as string).length < (plain.data as string).length);

  const envelope = JSON.parse(compressed.data as string) as {
    format: string;
    compression: { algorithm: string; originalSize: number; data: string };
  };
  assert.equal(envelope.format, 'bird-academy-compressed-backup');
  assert.equal(envelope.compression.algorithm, 'gzip');
  assert.ok(envelope.compression.originalSize > 0);
  assert.ok(envelope.compression.data.length > 0);
});

test('simulates and restores a gzip-compressed backup', async () => {
  seed('canaris', [
    { id: 21, nom: 'Comprimé', bague: 'GZIP-021', archived: false },
    { id: 22, nom: 'Restaurable', bague: 'GZIP-022', archived: false },
  ]);
  const backup = await BackupRestoreService.createBackup(
    'restauration gzip',
    'full',
    [],
    { compress: true },
  );
  assert.ok(backup.data);

  const simulation = await BackupRestoreService.simulateRestore(backup.data as string);
  assert.equal(simulation.isValid, true);
  assert.equal(simulation.isCompatible, true);
  assert.equal(simulation.counts.birds, 2);

  seed('canaris', [{ id: 99, nom: 'Temporaire', bague: 'TMP', archived: false }]);
  const result = await BackupRestoreService.executeRestore(backup.data as string);
  assert.equal(result.success, true);
  assert.deepEqual(read<Array<{ id: number }>>('canaris').map(item => item.id), [21, 22]);
});

test('combines gzip compression and AES encryption without exposing plaintext', async () => {
  seed('canaris', [
    { id: 31, nom: 'Secret compressé', bague: 'SECRET-GZIP', archived: false },
  ]);
  const password = 'Compression-AES-2026';
  const backup = await BackupRestoreService.createBackup(
    'gzip et AES',
    'full',
    [],
    { compress: true, encrypt: true, password },
  );
  assert.ok(backup.data);
  assert.equal((backup.data as string).includes('Secret compressé'), false);

  const envelope = JSON.parse(backup.data as string) as { format: string };
  assert.equal(envelope.format, 'bird-academy-encrypted-backup');

  const withoutPassword = await BackupRestoreService.simulateRestore(backup.data as string);
  assert.equal(withoutPassword.requiresPassword, true);

  const simulation = await BackupRestoreService.simulateRestore(backup.data as string, password);
  assert.equal(simulation.isValid, true);
  assert.equal(simulation.counts.birds, 1);

  seed('canaris', []);
  const result = await BackupRestoreService.executeRestore(backup.data as string, password);
  assert.equal(result.success, true);
  assert.deepEqual(read<Array<{ id: number }>>('canaris').map(item => item.id), [31]);
});

test('rejects a corrupted gzip-compressed backup', async () => {
  const backup = await BackupRestoreService.createBackup(
    'gzip endommagé',
    'full',
    [],
    { compress: true },
  );
  assert.ok(backup.data);

  const envelope = JSON.parse(backup.data as string) as {
    compression: { data: string };
  };
  envelope.compression.data = envelope.compression.data.slice(0, -12) + 'AAAAAAAAAAAA';

  const simulation = await BackupRestoreService.simulateRestore(JSON.stringify(envelope));
  assert.equal(simulation.isValid, false);
  assert.equal(simulation.isCompatible, false);
  assert.match(simulation.error ?? '', /compress|endommag/i);
});

test('a full backup restores modern V2 reproduction, habitat and platform collections', async () => {
  seed('canaris', [{
    id: 1,
    nom: 'Avec pièces jointes',
    photos: ['photo-1', 'photo-2'],
    documents: [{ id: 'doc-1' }],
  }]);
  seed('ba_breeding_pairs', [{ id: 'pair-v2-1' }]);
  seed('ba_clutches', [{ id: 'clutch-v2-1', pairId: 'pair-v2-1', eggCount: 3 }]);
  seed('ba_eggs', [{ id: 'egg-v2-1', clutchId: 'clutch-v2-1', number: 1 }]);
  seed('ba_incubations', [{ id: 'inc-v2-1', clutchId: 'clutch-v2-1' }]);
  seed('ba_cages_v2', [{ id: 'cage-v2-1', name: 'Volière moderne' }]);
  seed('platform_custom_calendar_events', [{ id: 'event-v2-1', title: 'Contrôle' }]);

  const backup = await BackupRestoreService.createBackup('couverture V2 complète');
  assert.ok(backup.data);

  const simulation = await BackupRestoreService.simulateRestore(backup.data as string);
  assert.equal(simulation.counts.couples, 1);
  assert.equal(simulation.counts.cages, 1);
  assert.equal(simulation.counts.documents, 1);
  assert.equal(simulation.counts.photos, 2);

  seed('ba_clutches', []);
  seed('ba_eggs', []);
  seed('ba_incubations', []);
  seed('ba_cages_v2', []);
  seed('platform_custom_calendar_events', []);

  const result = await BackupRestoreService.executeRestore(backup.data as string);
  assert.equal(result.success, true);
  assert.deepEqual(read<Array<{ id: string }>>('ba_clutches').map(item => item.id), ['clutch-v2-1']);
  assert.deepEqual(read<Array<{ id: string }>>('ba_eggs').map(item => item.id), ['egg-v2-1']);
  assert.deepEqual(read<Array<{ id: string }>>('ba_incubations').map(item => item.id), ['inc-v2-1']);
  assert.deepEqual(read<Array<{ id: string }>>('ba_cages_v2').map(item => item.id), ['cage-v2-1']);
  assert.deepEqual(
    read<Array<{ id: string }>>('platform_custom_calendar_events').map(item => item.id),
    ['event-v2-1'],
  );
});

test('a selective reproduction restore preserves unselected V2 habitat data', async () => {
  seed('ba_clutches', [{ id: 'clutch-to-restore' }]);
  seed('ba_cages_v2', [{ id: 'cage-at-export' }]);

  const backup = await BackupRestoreService.createBackup(
    'reproduction V2 uniquement',
    'selective',
    ['repro'],
  );
  assert.ok(backup.data);

  seed('ba_clutches', [{ id: 'clutch-temporary' }]);
  seed('ba_cages_v2', [{ id: 'cage-must-stay' }]);

  const result = await BackupRestoreService.executeRestore(backup.data as string);
  assert.equal(result.success, true);
  assert.deepEqual(read<Array<{ id: string }>>('ba_clutches').map(item => item.id), ['clutch-to-restore']);
  assert.deepEqual(read<Array<{ id: string }>>('ba_cages_v2').map(item => item.id), ['cage-must-stay']);
});

test('extended restore ignores storage keys outside the central allow-list', async () => {
  seed('theme', 'light');
  const envelope = await SecurityEngine.signPayload({
    __backup: {
      schema: 'bird-academy-backup',
      type: 'full',
      includedTables: ['birds', 'cages'],
      extendedStorageKeys: ['theme', 'foreign_application_data', 'ba_eggs'],
    },
    __extendedStorage: {
      theme: 'attacker-theme',
      foreign_application_data: 'must-not-be-written',
      ba_eggs: [{ id: 'allowed-egg' }],
    },
    canaris: [],
    cages: [],
  });

  const result = await BackupRestoreService.executeRestore(JSON.stringify(envelope));
  assert.equal(result.success, true);
  assert.equal(read<string>('theme'), 'light');
  assert.equal(localStorage.getItem('foreign_application_data'), null);
  assert.deepEqual(read<Array<{ id: string }>>('ba_eggs').map(item => item.id), ['allowed-egg']);
});

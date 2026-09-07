/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { BackupHistoryEntry, RestoreSimulation } from '../types';
import { SecurityEngine } from '../engines/SecurityEngine';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { HandFeedingRepository } from '../../hand-feeding/repositories/HandFeedingRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { BackupEncryptionError, BackupEncryptionService } from './BackupEncryptionService';
import { BackupCompressionService } from './BackupCompressionService';
import { BackupDataRegistry, ExtendedBackupData } from './BackupDataRegistry';

interface RestoreSnapshot {
  birds: ReturnType<typeof BirdRepository.getAll>;
  cages: Parameters<typeof HabitatRepository.saveAll>[0];
  couples: ReturnType<typeof BreedingRepository.getCouples>;
  reproductions: ReturnType<typeof BreedingRepository.getReproductions>;
  pontes: ReturnType<typeof BreedingRepository.getPontes>;
  jeunes: ReturnType<typeof BreedingRepository.getJeunes>;
  health: ReturnType<typeof HealthRepository.getAll>;
  feeding: ReturnType<typeof HandFeedingRepository.getAll>;
  expenses: ReturnType<typeof FinanceRepository.getExpenses>;
  sales: ReturnType<typeof FinanceRepository.getSales>;
  extended: ExtendedBackupData;
}

export class BackupRestoreService {
  private static HISTORY_KEY = 'platform_backup_history';
  private static APP_VERSION = '1.2';

  static getBackupHistory(): BackupHistoryEntry[] {
    return appStorage.getItem<BackupHistoryEntry[]>(this.HISTORY_KEY, []);
  }

  /**
   * Generates a signed, schema-compliant JSON backup string
   */
  static async createBackup(
    comments: string, 
    type: 'full' | 'selective' = 'full', 
    selectedTables: string[] = [], 
    options: { encrypt?: boolean; compress?: boolean; password?: string } = {}
  ): Promise<{ success: boolean; data?: string; filename?: string; entry?: BackupHistoryEntry; error?: string }> {
    try {
      // 1. Gather relevant data from repositories
      const rawDb: Record<string, any> = {};

      const exportAll = type === 'full';
      rawDb.__backup = {
        schema: 'bird-academy-backup',
        type,
        includedTables: exportAll
          ? ['birds', 'cages', 'couples', 'repro', 'sante', 'alim', 'finance']
          : [...selectedTables],
      };
      
      if (exportAll || selectedTables.includes('birds')) rawDb.canaris = BirdRepository.getAll(true);
      if (exportAll || selectedTables.includes('cages')) rawDb.cages = HabitatRepository.getAll();
      if (exportAll || selectedTables.includes('couples')) rawDb.couples = BreedingRepository.getCouples();
      if (exportAll || selectedTables.includes('repro')) rawDb.reproductions = BreedingRepository.getReproductions();
      if (exportAll || selectedTables.includes('repro')) rawDb.pontes = BreedingRepository.getPontes();
      if (exportAll || selectedTables.includes('repro')) rawDb.jeunes = BreedingRepository.getJeunes();
      if (exportAll || selectedTables.includes('sante')) rawDb.sante = HealthRepository.getAll();
      if (exportAll || selectedTables.includes('alim')) rawDb.alimentation = HandFeedingRepository.getAll();
      if (exportAll || selectedTables.includes('finance')) {
        rawDb.depenses = FinanceRepository.getExpenses();
        rawDb.ventes = FinanceRepository.getSales();
      }

      // Repositories may complete a storage migration while being read. Capture
      // modern collections only after those reads so the backup has one state.
      const extendedData = BackupDataRegistry.exportData(type, selectedTables);
      rawDb.__backup.extendedStorageKeys = extendedData.includedKeys;
      rawDb.__extendedStorage = extendedData.values;

      // 2. Wrap data in signed security envelope
      const signedEnvelope = await SecurityEngine.signPayload(rawDb);

      let finalString = JSON.stringify(signedEnvelope, null, 2);

      if (options.compress) {
        finalString = await BackupCompressionService.compress(finalString);
      }
      
      // Authenticated encryption. The password is never persisted.
      if (options.encrypt) {
        finalString = await BackupEncryptionService.encrypt(finalString, options.password ?? '');
      }

      const size = new Blob([finalString], { type: 'application/json' }).size;
      const checksum = signedEnvelope.security.checksum;
      const filename = `elevage_backup_${type}_${new Date().toISOString().split('T')[0]}.json`;

      const historyEntry: BackupHistoryEntry = {
        id: `bp-${Math.random().toString(36).substring(2, 9)}`,
        date: new Date().toISOString(),
        filename,
        size,
        checksum,
        comments: comments || (type === 'full' ? 'Sauvegarde totale manuelle' : 'Sauvegarde sélective'),
        version: this.APP_VERSION,
        type,
        tables: exportAll ? ['all'] : selectedTables,
        isEncrypted: !!options.encrypt,
        isCompressed: !!options.compress,
        status: 'success'
      };

      // Save history
      const history = this.getBackupHistory();
      history.unshift(historyEntry);
      appStorage.setItem(this.HISTORY_KEY, history);

      ActivityLogger.log(
        EventType.DB_IMPORT, 
        `Création d'une sauvegarde ${type === 'full' ? 'complète' : 'sélective'} (${(size / 1024).toFixed(1)} Ko)`,
        { id: historyEntry.id }
      );

      return {
        success: true,
        data: finalString,
        filename,
        entry: historyEntry
      };
    } catch (e) {
      return {
        success: false,
        error: (e as Error).message
      };
    }
  }

  /**
   * Pre-restoration DRY RUN simulation to preview counts and compatibility
   */
  static async simulateRestore(backupString: string, password?: string): Promise<RestoreSimulation> {
    const issues: string[] = [];
    let isCompatible = true;
    let isValid = false;
    let parsed: any = null;

    try {
      const encrypted = this.isEncryptedBackup(backupString);
      const decodedStr = await this.decodeBackup(backupString, password);

      // Check physical corruption
      const corruptionCheck = SecurityEngine.detectCorruption(decodedStr);
      if (corruptionCheck.isCorrupted) {
        return {
          isValid: false,
          error: `Contenu corrompu détecté : ${corruptionCheck.anomalies.join(', ')}`,
          version: 'unknown',
          checksum: 'unknown',
          isCompatible: false,
          counts: { birds: 0, couples: 0, cages: 0, documents: 0, photos: 0, reports: 0 },
          compatibilityIssues: corruptionCheck.anomalies
        };
      }

      // Parse JSON and run structural verification
      const jsonCheck = SecurityEngine.validateJsonBackup(decodedStr);
      if (!jsonCheck.isValid || !jsonCheck.parsedData) {
        return {
          isValid: false,
          error: jsonCheck.error || "Fichier JSON non conforme.",
          version: 'unknown',
          checksum: 'unknown',
          isCompatible: false,
          counts: { birds: 0, couples: 0, cages: 0, documents: 0, photos: 0, reports: 0 },
          compatibilityIssues: [jsonCheck.error || "Format non conforme"]
        };
      }

      parsed = jsonCheck.parsedData;
      isValid = true;

      // Extract payload and signature
      const hasSignature = !!parsed.security && !!parsed.payload;
      const payload = hasSignature ? parsed.payload : parsed;
      const fileVersion = hasSignature ? parsed.security.version : '1.0';
      const checksum = hasSignature
        ? parsed.security.checksum
        : await SecurityEngine.generateChecksum(decodedStr);

      // Verify cryptographic signature if present
      if (hasSignature) {
        const signatureCheck = await SecurityEngine.verifyPayloadSignature(parsed);
        if (!signatureCheck.isValid) {
          issues.push(`Signature de sécurité non valide : ${signatureCheck.reason}`);
          isCompatible = false;
        }
      } else {
        issues.push("Avertissement : Fichier de sauvegarde de génération précédente non signé.");
      }

      // Check version compatibility
      if (fileVersion !== this.APP_VERSION) {
        issues.push(`Version divergente : fichier v${fileVersion} importé vers plateforme v${this.APP_VERSION}.`);
        if (parseFloat(fileVersion) > parseFloat(this.APP_VERSION)) {
          isCompatible = false;
          issues.push("Incompatibilité critique : Impossible d'importer une sauvegarde d'une version ultérieure.");
        }
      }

      const birds = Array.isArray(payload.canaris)
        ? payload.canaris as Array<{ photo?: unknown; photos?: unknown[]; documents?: unknown[] }>
        : [];
      const extendedStorage = payload.__extendedStorage && typeof payload.__extendedStorage === 'object'
        ? payload.__extendedStorage as Record<string, unknown>
        : {};
      const legacyCouples = Array.isArray(payload.couples) ? payload.couples : [];
      const modernCouples = Array.isArray(extendedStorage.ba_breeding_pairs)
        ? extendedStorage.ba_breeding_pairs
        : [];
      const legacyCages = Array.isArray(payload.cages) ? payload.cages : [];
      const modernCages = Array.isArray(extendedStorage.ba_cages_v2)
        ? extendedStorage.ba_cages_v2
        : [];
      const birdsCount = birds.length;
      const couplesCount = legacyCouples.length > 0 ? legacyCouples.length : modernCouples.length;
      const cagesCount = legacyCages.length > 0 ? legacyCages.length : modernCages.length;
      const docCount = birds.reduce(
        (total, bird) => total + (Array.isArray(bird.documents) ? bird.documents.length : 0),
        0,
      );
      const photoCount = birds.reduce(
        (total, bird) => total + (
          Array.isArray(bird.photos) ? bird.photos.length : bird.photo ? 1 : 0
        ),
        0,
      );

      return {
        isValid: isCompatible,
        isEncrypted: encrypted,
        requiresPassword: false,
        version: fileVersion,
        checksum,
        isCompatible,
        counts: {
          birds: birdsCount,
          couples: couplesCount,
          cages: cagesCount,
          documents: docCount,
          photos: photoCount,
          reports: 0
        },
        compatibilityIssues: issues
      };

    } catch (e) {
      const encryptionError = e instanceof BackupEncryptionError ? e : null;
      return {
        isValid: false,
        error: (e as Error).message,
        isEncrypted: encryptionError !== null || this.isEncryptedBackup(backupString),
        requiresPassword: encryptionError?.code === 'PASSWORD_REQUIRED',
        version: 'unknown',
        checksum: 'unknown',
        isCompatible: false,
        counts: { birds: 0, couples: 0, cages: 0, documents: 0, photos: 0, reports: 0 },
        compatibilityIssues: [(e as Error).message]
      };
    }
  }

  /**
   * Executes the actual database replacement (requires user confirmation in UI)
   */
  static async executeRestore(backupString: string, password?: string): Promise<{ success: boolean; error?: string }> {
    let snapshot: RestoreSnapshot | null = null;
    try {
      const simulation = await this.simulateRestore(backupString, password);
      if (!simulation.isCompatible) {
        return {
          success: false,
          error: simulation.error || "Restauration annulée pour cause d'incompatibilité de fichier."
        };
      }

      const decodedStr = await this.decodeBackup(backupString, password);

      const parsed = JSON.parse(decodedStr);
      const payload = parsed.payload || parsed;
      const manifest = payload.__backup;
      const shouldRestore = (table: string): boolean => {
        if (!manifest || manifest.schema !== 'bird-academy-backup') {
          return true;
        }
        return manifest.type === 'full' || manifest.includedTables?.includes(table);
      };

      snapshot = {
        birds: BirdRepository.getAll(true),
        cages: HabitatRepository.getAll(),
        couples: BreedingRepository.getCouples(),
        reproductions: BreedingRepository.getReproductions(),
        pontes: BreedingRepository.getPontes(),
        jeunes: BreedingRepository.getJeunes(),
        health: HealthRepository.getAll(),
        feeding: HandFeedingRepository.getAll(),
        expenses: FinanceRepository.getExpenses(),
        sales: FinanceRepository.getSales(),
        extended: BackupDataRegistry.captureData(manifest?.extendedStorageKeys),
      };

      // Overwrite all databases safely
      if (shouldRestore('birds') && Array.isArray(payload.canaris)) BirdRepository.saveAll(payload.canaris);
      if (shouldRestore('cages') && Array.isArray(payload.cages)) HabitatRepository.saveAll(payload.cages);
      if (shouldRestore('couples') && Array.isArray(payload.couples)) BreedingRepository.saveCouples(payload.couples);
      if (shouldRestore('repro') && Array.isArray(payload.reproductions)) BreedingRepository.saveReproductions(payload.reproductions);
      if (shouldRestore('repro') && Array.isArray(payload.pontes)) BreedingRepository.savePontes(payload.pontes);
      if (shouldRestore('repro') && Array.isArray(payload.jeunes)) BreedingRepository.saveJeunes(payload.jeunes);
      if (shouldRestore('sante') && Array.isArray(payload.sante)) HealthRepository.saveAll(payload.sante);
      if (shouldRestore('alim') && Array.isArray(payload.alimentation)) HandFeedingRepository.saveAll(payload.alimentation);
      if (shouldRestore('finance') && Array.isArray(payload.depenses)) FinanceRepository.saveExpenses(payload.depenses);
      if (shouldRestore('finance') && Array.isArray(payload.ventes)) FinanceRepository.saveSales(payload.ventes);

      BackupDataRegistry.restoreData(
        payload.__extendedStorage,
        manifest?.extendedStorageKeys,
      );

      const assertWritten = (label: string, expected: unknown, actual: unknown): void => {
        if (JSON.stringify(expected) !== JSON.stringify(actual)) {
          throw new Error(`Échec de vérification après écriture : ${label}.`);
        }
      };
      if (shouldRestore('birds') && Array.isArray(payload.canaris)) {
        assertWritten('oiseaux', payload.canaris, BirdRepository.getAll(true));
      }
      if (shouldRestore('cages') && Array.isArray(payload.cages)) {
        assertWritten('cages', payload.cages, HabitatRepository.getAll());
      }
      if (shouldRestore('couples') && Array.isArray(payload.couples)) {
        assertWritten('couples', payload.couples, BreedingRepository.getCouples());
      }
      if (shouldRestore('repro') && Array.isArray(payload.reproductions)) {
        assertWritten('reproductions', payload.reproductions, BreedingRepository.getReproductions());
      }
      if (shouldRestore('repro') && Array.isArray(payload.pontes)) {
        assertWritten('pontes', payload.pontes, BreedingRepository.getPontes());
      }
      if (shouldRestore('repro') && Array.isArray(payload.jeunes)) {
        assertWritten('jeunes', payload.jeunes, BreedingRepository.getJeunes());
      }
      if (shouldRestore('sante') && Array.isArray(payload.sante)) {
        assertWritten('santé', payload.sante, HealthRepository.getAll());
      }
      if (shouldRestore('alim') && Array.isArray(payload.alimentation)) {
        assertWritten('alimentation', payload.alimentation, HandFeedingRepository.getAll());
      }
      if (shouldRestore('finance') && Array.isArray(payload.depenses)) {
        assertWritten('dépenses', payload.depenses, FinanceRepository.getExpenses());
      }
      if (shouldRestore('finance') && Array.isArray(payload.ventes)) {
        assertWritten('ventes', payload.ventes, FinanceRepository.getSales());
      }
      const extendedMismatch = BackupDataRegistry.findMismatch(
        payload.__extendedStorage,
        manifest?.extendedStorageKeys,
      );
      if (extendedMismatch) {
        throw new Error(`Échec de vérification après écriture des collections V2 : ${extendedMismatch}.`);
      }

      ActivityLogger.log(
        EventType.DB_IMPORT, 
        `Restauration complète effectuée de ${simulation.counts.birds} canaris, ${simulation.counts.cages} cages.`
      );

      return { success: true };
    } catch (e) {
      let rollbackFailed = false;
      if (snapshot) {
        try {
          BirdRepository.saveAll(snapshot.birds);
          HabitatRepository.saveAll(snapshot.cages);
          BreedingRepository.saveCouples(snapshot.couples);
          BreedingRepository.saveReproductions(snapshot.reproductions);
          BreedingRepository.savePontes(snapshot.pontes);
          BreedingRepository.saveJeunes(snapshot.jeunes);
          HealthRepository.saveAll(snapshot.health);
          HandFeedingRepository.saveAll(snapshot.feeding);
          FinanceRepository.saveExpenses(snapshot.expenses);
          FinanceRepository.saveSales(snapshot.sales);
          BackupDataRegistry.restoreData(snapshot.extended.values, snapshot.extended.includedKeys);
        } catch {
          rollbackFailed = true;
        }
      }
      const suffix = snapshot
        ? rollbackFailed
          ? ' Le retour arrière automatique a également échoué.'
          : ' Les données précédentes ont été restaurées automatiquement.'
        : '';
      return { success: false, error: `${(e as Error).message}${suffix}` };
    }
  }

  static deleteBackup(id: string): void {
    const history = this.getBackupHistory();
    const updated = history.filter(b => b.id !== id);
    appStorage.setItem(this.HISTORY_KEY, updated);
  }

  private static isEncryptedBackup(backupString: string): boolean {
    try {
      return BackupEncryptionService.isEncryptedEnvelope(JSON.parse(backupString.trim()));
    } catch {
      return false;
    }
  }

  private static async decodeBackup(backupString: string, password?: string): Promise<string> {
    const trimmed = backupString.trim();
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      if (BackupEncryptionService.isEncryptedEnvelope(parsed)) {
        const decrypted = await BackupEncryptionService.decrypt(parsed, password);
        return this.decodeBackup(decrypted);
      }
      if (BackupCompressionService.isCompressedEnvelope(parsed)) {
        const decompressed = await BackupCompressionService.decompress(parsed);
        return this.decodeBackup(decompressed);
      }
      return trimmed;
    }

    // Backward compatibility with backups previously stored as Base64.
    try {
      return this.decodeBackup(decodeURIComponent(atob(trimmed)), password);
    } catch {
      throw new Error('Fichier illisible ou format de sauvegarde non supporté.');
    }
  }
}

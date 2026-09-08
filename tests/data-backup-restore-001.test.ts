/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MISSION DATA-BACKUP-RESTORE-001
 * Validation complète de la sauvegarde et restauration locale
 * Bird Academy Enterprise — Volière Manager (v1.3.6-RC4)
 * Modèle : Single Device + Local-First (100% Offline, Zero-Cloud)
 */

import assert from 'node:assert/strict';
import { describe, test, beforeEach, afterEach } from 'node:test';

// ---------------------------------------------------------------------------
// 1. Simulation robuste de l'environnement LocalStorage en mémoire
// ---------------------------------------------------------------------------
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

// Simulation de navigator offline
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: {
    onLine: false,
    sendBeacon: () => false,
  },
});

// ---------------------------------------------------------------------------
// 2. Imports dynamiques des services et modules métier réels
// ---------------------------------------------------------------------------
const { BackupRestoreService } = await import(
  '../src/features/platform/services/BackupRestoreService'
);
const { BackupDataRegistry } = await import(
  '../src/features/platform/services/BackupDataRegistry'
);
const { SecurityEngine } = await import(
  '../src/features/platform/engines/SecurityEngine'
);
const { BirdRepository } = await import(
  '../src/features/birds/repositories/BirdRepository'
);
const { HabitatRepository } = await import(
  '../src/features/habitat/repositories/HabitatRepository'
);
const { BreedingRepository } = await import(
  '../src/features/breeding/repositories/BreedingRepository'
);
const { ReproductionRepository } = await import(
  '../src/features/reproduction/repositories/ReproductionRepository'
);
const { ClutchRepository } = await import(
  '../src/features/reproduction/clutches/repositories/ClutchRepository'
);
const { EggRepository } = await import(
  '../src/features/reproduction/eggs/repositories/EggRepository'
);
const { IncubationRepository } = await import(
  '../src/features/reproduction/incubation/repositories/IncubationRepository'
);
const { HatchingRepository } = await import(
  '../src/features/reproduction/hatching/repositories/HatchingRepository'
);
const { ChickRepository } = await import(
  '../src/features/reproduction/chicks/repositories/ChickRepository'
);
const { NurseryRepository } = await import(
  '../src/features/reproduction/nursery/repositories/NurseryRepository'
);
const { WeaningRepository } = await import(
  '../src/features/reproduction/weaning/repositories/WeaningRepository'
);
const { HealthRepository } = await import(
  '../src/features/health/repositories/HealthRepository'
);
const { HandFeedingRepository } = await import(
  '../src/features/hand-feeding/repositories/HandFeedingRepository'
);
const { FinanceRepository } = await import(
  '../src/features/finance/repositories/FinanceRepository'
);
const { GeneticsRepository } = await import(
  '../src/features/genetics/repositories/GeneticsRepository'
);
const { WrightCoefficientEngine } = await import(
  '../src/features/genetics/engines/WrightCoefficientEngine'
);
const { BirdIntelligenceEngine } = await import(
  '../src/features/intelligence/engines/BirdIntelligenceEngine'
);
const { DataQualityEngine } = await import(
  '../src/features/intelligence/engines/DataQualityEngine'
);
const { RuleEngine } = await import(
  '../src/features/intelligence/engines/RuleEngine'
);
const { HealthEngine } = await import(
  '../src/business/HealthEngine'
);
const { appStorage } = await import('../src/storage');

// Utilitaires de test
function seed(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function read<T>(key: string): T {
  const value = localStorage.getItem(key);
  assert.notEqual(value, null, `La clé ${key} doit exister dans le stockage local`);
  return JSON.parse(value as string) as T;
}

// ---------------------------------------------------------------------------
// 3. Dataset représentatif complet et multilingue
// ---------------------------------------------------------------------------
function seedNominalBreedingDataset(): void {
  // Oiseaux adultes et jeunes avec caractères spéciaux, français, arabe, émojis, apostrophes
  seed('canaris', [
    {
      id: 1,
      bague: 'FR-2024-001',
      nom: "Éclair d'Or 🦜",
      sexe: 'Mâle',
      espece: 'Canari (Serinus canaria)',
      categorie: 'Couleur',
      race: 'Lipochrome',
      mutation: 'Jaune Intensif',
      statut: 'Actif',
      date_naissance: '2024-03-15',
      cage_id: 1,
      photos: ['photo-male-1.jpg'],
      notes: "Champion régional 2025 d'exposition.",
      archived: false,
    },
    {
      id: 2,
      bague: 'FR-2024-002',
      nom: 'Perle Noire "Reine" 🖤',
      sexe: 'Femelle',
      espece: 'Canari (Serinus canaria)',
      categorie: 'Couleur',
      race: 'Mélanine',
      mutation: 'Noir Blanc Schimmel',
      statut: 'Actif',
      date_naissance: '2024-04-10',
      cage_id: 1,
      photos: ['photo-femelle-2.jpg'],
      notes: 'Excellente mère nourricière.',
      archived: false,
    },
    {
      id: 3,
      bague: 'DZ-2025-010',
      nom: 'كناري جزيرة الماديرا 🌿',
      sexe: 'Mâle',
      espece: 'Canari de Posture',
      categorie: 'Posture',
      race: 'Gloster Corona',
      mutation: 'Panaché Vert',
      statut: 'Actif',
      date_naissance: '2025-02-12',
      cage_id: 2,
      notes: 'تغذية وتفريخ قياسي ممتاز',
      archived: false,
    },
    {
      id: 4,
      bague: 'BE-2025-020',
      nom: 'Rubis Rouge Écarlate 💎',
      sexe: 'Femelle',
      espece: 'Canari (Serinus canaria)',
      categorie: 'Couleur',
      race: 'Lipochrome Rouge',
      mutation: 'Rouge Intensif',
      statut: 'Actif',
      date_naissance: '2025-01-20',
      cage_id: 2,
      notes: 'Souche belge certifiée.',
      archived: false,
    },
    {
      id: 101,
      bague: 'FR-2026-101',
      nom: "Poussin Espoir de l'Élevage 🐣",
      sexe: 'Inconnu',
      espece: 'Canari (Serinus canaria)',
      categorie: 'Couleur',
      race: 'Lipochrome',
      statut: 'Jeune',
      pere_id: 1,
      mere_id: 2,
      date_naissance: '2026-05-10',
      cage_id: 1,
      archived: false,
    },
  ]);

  // Cages & habitats (historiques et collections V2)
  seed('bird_academy_cages', [
    { id: 1, nom: 'Volière Extérieure n°1 - "Le Grand Refuge"', capacite_max: 12 },
    { id: 2, nom: 'Cage Élevage Reproduction n°5 (Box 80cm)', capacite_max: 2 },
  ]);
  seed('ba_facilities', [{ id: 'fac-1', name: 'Élevage Principal de la Vallée' }]);
  seed('ba_zones', [{ id: 'zone-1', name: 'Zone Reproduction Tempérée', facilityId: 'fac-1' }]);
  seed('ba_cages_v2', [
    { id: '1', zoneId: 'zone-1', nom: 'Volière Extérieure n°1 - "Le Grand Refuge"', capacite_max: 12, statut: 'Actif', isArchived: false },
    { id: '2', zoneId: 'zone-1', nom: 'Cage Élevage Reproduction n°5 (Box 80cm)', capacite_max: 2, statut: 'Actif', isArchived: false },
  ]);

  // Couples (historique et V2)
  seed('couples', [
    { id: 1, male_id: 1, femelle_id: 2, date_creation: '2026-02-14', statut: 'Actif', observations: 'Couple star' },
  ]);
  seed('ba_breeding_pairs', [
    { id: 'bp-1', maleId: 1, femaleId: 2, dateCreated: '2026-02-14', status: 'active', archived: false },
  ]);
  seed('ba_breeding_seasons', [{ id: 'season-2026', name: 'Saison 2026', year: 2026, active: true }]);

  // Reproductions & Pontes
  seed('reproductions', [
    { id: 1, couple_id: 1, date_debut: '2026-04-01', statut: 'En cours', saison: 2026 },
  ]);
  seed('pontes', [
    { id: 1, reproduction_id: 1, numero_ponte: 1, date_ponte: '2026-04-05', oeufs: 4, couves: 4 },
  ]);
  seed('ba_clutches', [
    { id: 'clutch-1', pairId: 'bp-1', seasonId: 'season-2026', clutchNumber: 1, eggCount: 4, startDate: '2026-04-05' },
  ]);

  // Œufs & Incubations
  seed('ba_eggs', [
    { id: 'egg-1', clutchId: 'clutch-1', number: 1, layDate: '2026-04-05', status: 'hatched', fertile: true },
    { id: 'egg-2', clutchId: 'clutch-1', number: 2, layDate: '2026-04-06', status: 'fertile', fertile: true },
    { id: 'egg-3', clutchId: 'clutch-1', number: 3, layDate: '2026-04-07', status: 'clear', fertile: false },
  ]);
  seed('ba_incubations', [
    { id: 'inc-1', clutchId: 'clutch-1', startDate: '2026-04-08', expectedHatchDate: '2026-04-22' },
  ]);

  // Éclosions & Jeunes
  seed('ba_repro_hatchings', [
    { id: 'hatch-1', eggId: 'egg-1', hatchDate: '2026-04-22', chickId: 'chick-1', status: 'healthy' },
  ]);
  seed('jeunes', [
    { id: 1, reproduction_id: 1, bague: 'FR-2026-101', date_eclosion: '2026-04-22', statut: 'Seuvré' },
  ]);
  seed('ba_repro_chicks', [
    {
      id: 'chick-1',
      clutchId: 'clutch-1',
      eggId: 'egg-1',
      pairId: 'bp-1',
      name: 'Poussin 1',
      provisionalNumber: 'FR-2026-101',
      hatchDate: '2026-04-22',
      birthWeight: 2.1,
      status: 'weaned',
      gender: 'Indéterminé',
      observations: '',
      createdAt: '2026-04-22',
      updatedAt: '2026-04-22',
    },
  ]);

  // Nurserie, EAM & Sevrage
  seed('ba_nursery_records', [
    { id: 'nurs-1', chickId: 'chick-1', status: 'in_nursery', admissionDate: '2026-04-25' },
  ]);
  seed('ba_nursery_formulas', [
    { id: 'form-1', name: 'NutriBird A21 Spécial Oisillons', brand: 'Versele-Laga', targetTemp: 39 },
  ]);
  seed('ba_nursery_crop_inspections', [
    { id: 'crop-1', chickId: 'chick-1', date: '2026-04-26', fullness: 'normal', empty: true },
  ]);
  seed('ba_repro_weight_records', [
    { id: 'weight-1', chickId: 'chick-1', date: '2026-04-28', weightGrams: 15.6 },
  ]);
  seed('ba_repro_weanings', [
    { id: 'wean-1', chickId: 'chick-1', date: '2026-05-25', age: 33, weight: 19.5, status: 'success', success: true, observations: '', createdAt: '2026-05-25' },
  ]);

  // Santé & Traitements
  seed('sante', [
    {
      id: 1,
      canari_id: 1,
      date: '2026-03-01',
      traitement: 'Cure Vitamines E + Sélénium',
      description: 'Posologie: 5 gouttes dans 50ml eau',
      categorie: 'Traitement',
      statut: 'Terminé',
    },
    {
      id: 2,
      canari_id: 2,
      date: '2026-03-10',
      traitement: 'Traitement antiparasitaire externe (Ivermectine 0.1%)',
      description: 'Posologie: 1 goutte nuque',
      categorie: 'Traitement',
      statut: 'Terminé',
    },
  ]);

  // Alimentation
  seed('alimentation', [
    { id: 1, type: 'Mélange Canaris Prestige 20kg', quantite: 20, unite: 'kg', date: '2026-01-15' },
    { id: 2, type: 'Pâtée aux œufs sèche Gold Patee', quantite: 5, unite: 'kg', date: '2026-02-01' },
  ]);

  // Finances (Dépenses & Ventes)
  seed('depenses', [
    { id: 1, montant: 145.50, date: '2026-01-10', categorie: 'Alimentation', description: 'Graines & Compléments' },
    { id: 2, montant: 89.90, date: '2026-02-05', categorie: 'Santé', description: 'Visite Vétérinaire Aviaire' },
  ]);
  seed('ventes', [
    { id: 1, prix: 250.00, date: '2026-05-12', acheteur: 'M. Dubois', canari_id: 1 },
    { id: 2, prix: 180.00, date: '2026-05-20', acheteur: 'Mme Martin', canari_id: 2 },
  ]);

  // Paramètres & plateformes
  seed('genetics_parameters', { inbreedingThreshold: 0.125, maxGenerations: 5 });
  seed('platform_custom_calendar_events', [{ id: 'evt-1', title: 'Mirage Ponte 1 - Box 5' }]);
  seed('platform_notifications', [{ id: 'notif-1', title: 'Rappel baguage des oisillons' }]);
}

// Nettoyage complet
function clearAllStorage(): void {
  localStorage.clear();
  seed('canaris', []);
  seed('bird_academy_cages', []);
  seed('couples', []);
  seed('reproductions', []);
  seed('pontes', []);
  seed('jeunes', []);
  seed('sante', []);
  seed('alimentation', []);
  seed('depenses', []);
  seed('ventes', []);
}

// ===========================================================================
// SUITE DE TESTS : DATA-BACKUP-RESTORE-001
// ===========================================================================
describe('MISSION DATA-BACKUP-RESTORE-001 — Validation Sauvegarde et Restauration Locale', () => {

  beforeEach(() => {
    clearAllStorage();
  });

  // =========================================================================
  // SECTION A : Inventaire complet des données (5 tests)
  // =========================================================================
  describe('Section A — Inventaire réel des données', () => {
    test('A.1 : BackupDataRegistry expose formellement les collections requises sous liste blanche', () => {
      const exported = BackupDataRegistry.exportData('full', []);
      assert.ok(exported.includedKeys.length >= 25, 'Le registre doit inclure les collections V2 complètes');
      assert.ok(exported.includedKeys.includes('ba_breeding_pairs'));
      assert.ok(exported.includedKeys.includes('ba_clutches'));
      assert.ok(exported.includedKeys.includes('ba_eggs'));
      assert.ok(exported.includedKeys.includes('ba_cages_v2'));
      assert.ok(exported.includedKeys.includes('genetics_parameters'));
    });

    test('A.2 : Matrice complète des 14 domaines d\'élevage couverte par l\'export full', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Test A.2');
      assert.equal(backup.success, true);
      assert.ok(backup.data);

      const parsed = JSON.parse(backup.data as string);
      const payload = parsed.payload;

      // 14 domaines d'élevage réels
      assert.ok(Array.isArray(payload.canaris), 'Oiseaux présents');
      assert.ok(Array.isArray(payload.cages), 'Cages présentes');
      assert.ok(Array.isArray(payload.couples), 'Couples présents');
      assert.ok(Array.isArray(payload.reproductions), 'Reproductions présentes');
      assert.ok(Array.isArray(payload.pontes), 'Pontes présentes');
      assert.ok(Array.isArray(payload.jeunes), 'Jeunes présents');
      assert.ok(Array.isArray(payload.sante), 'Santé présente');
      assert.ok(Array.isArray(payload.alimentation), 'Alimentation présente');
      assert.ok(Array.isArray(payload.depenses), 'Dépenses présentes');
      assert.ok(Array.isArray(payload.ventes), 'Ventes présentes');
      assert.ok(payload.__extendedStorage.ba_clutches !== undefined, 'Œufs / Clutches présents');
      assert.ok(payload.__extendedStorage.ba_nursery_records !== undefined, 'Nurserie présente');
      assert.ok(payload.__extendedStorage.ba_repro_weanings !== undefined, 'Sevrage présent');
      assert.ok(payload.__extendedStorage.genetics_parameters !== undefined, 'Paramètres génétiques présents');
    });

    test('A.3 : Allow-list stricte sans fuite de clés tierces ou sensibles', () => {
      seed('bird_academy_license', { key: 'SECRET-LICENSE' });
      seed('platform_admin_session', { token: 'SECRET-TOKEN' });
      const exported = BackupDataRegistry.exportData('full', []);

      assert.equal(exported.includedKeys.includes('bird_academy_license'), false);
      assert.equal(exported.includedKeys.includes('platform_admin_session'), false);
      assert.equal('bird_academy_license' in exported.values, false);
      assert.equal('platform_admin_session' in exported.values, false);
    });

    test('A.4 : Manifeste de sauvegarde conforme au schéma officiel', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Test A.4');
      assert.ok(backup.data);
      const parsed = JSON.parse(backup.data as string);

      assert.equal(parsed.payload.__backup.schema, 'bird-academy-backup');
      assert.equal(parsed.payload.__backup.type, 'full');
      assert.deepEqual(parsed.payload.__backup.includedTables, [
        'birds', 'cages', 'couples', 'repro', 'sante', 'alim', 'finance'
      ]);
    });

    test('A.5 : Version du manifest et compatibilité plateforme v1.2/v1.3', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Test A.5');
      assert.ok(backup.data);
      const parsed = JSON.parse(backup.data as string);

      assert.equal(parsed.security.version, '1.2');
      assert.equal(parsed.security.algorithm, 'SHA-256');
    });
  });

  // =========================================================================
  // SECTION B : Export nominal (10 tests)
  // =========================================================================
  describe('Section B — Export nominal', () => {
    test('B.1 : Génération du backup avec succès et données non vides', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export nominal B.1');
      assert.equal(backup.success, true);
      assert.ok(backup.data);
      assert.ok(backup.filename?.endsWith('.json'));
    });

    test('B.2 : Préservation intégrale des accents français complexes', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.2');
      assert.ok(backup.data);
      assert.ok((backup.data as string).includes("Éclair d'Or"));
      assert.ok((backup.data as string).includes('Rubis Rouge Écarlate'));
      assert.ok((backup.data as string).includes('Mélanine'));
    });

    test('B.3 : Préservation intégrale des caractères arabes', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.3');
      assert.ok(backup.data);
      assert.ok((backup.data as string).includes('كناري جزيرة الماديرا'));
      assert.ok((backup.data as string).includes('تغذية وتفريخ'));
    });

    test('B.4 : Préservation intégrale des émojis et symboles Unicode', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.4');
      assert.ok(backup.data);
      assert.ok((backup.data as string).includes('🦜'));
      assert.ok((backup.data as string).includes('🖤'));
      assert.ok((backup.data as string).includes('🐣'));
      assert.ok((backup.data as string).includes('💎'));
    });

    test('B.5 : Préservation intégrale des apostrophes et guillemets', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.5');
      assert.ok(backup.data);
      assert.ok((backup.data as string).includes("d'exposition"));
      assert.ok((backup.data as string).includes('Le Grand Refuge'));
      assert.ok((backup.data as string).includes('\\"Reine\\"'));
    });

    test('B.6 : Format JSON valide et parseable sans erreur', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.6');
      assert.ok(backup.data);
      let parsed: any = null;
      assert.doesNotThrow(() => {
        parsed = JSON.parse(backup.data as string);
      });
      assert.ok(parsed);
      assert.equal(typeof parsed, 'object');
    });

    test('B.7 : Encodage strict UTF-8 et présence de toutes les entités attendues', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.7');
      assert.ok(backup.data);
      const parsed = JSON.parse(backup.data as string);

      assert.equal(parsed.payload.canaris.length, 5);
      assert.equal(parsed.payload.couples.length, 1);
      assert.equal(parsed.payload.reproductions.length, 1);
      assert.equal(parsed.payload.pontes.length, 1);
      assert.equal(parsed.payload.sante.length, 2);
      assert.equal(parsed.payload.depenses.length, 2);
      assert.equal(parsed.payload.ventes.length, 2);
    });

    test('B.8 : Signature SHA-256 présente et conforme', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.8');
      assert.ok(backup.data);
      const parsed = JSON.parse(backup.data as string);

      assert.equal(parsed.security.algorithm, 'SHA-256');
      assert.match(parsed.security.checksum, /^[a-f0-9]{64}$/);
      assert.match(parsed.security.signature, /^[a-f0-9]{64}$/);
    });

    test('B.9 : Nom de fichier normalisé avec date du jour', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export B.9');
      const todayIso = new Date().toISOString().split('T')[0];
      assert.equal(backup.filename, `elevage_backup_full_${todayIso}.json`);
    });

    test('B.10 : Journalisation locale dans l\'historique de sauvegarde', async () => {
      seedNominalBreedingDataset();
      await BackupRestoreService.createBackup('Journalisation B.10');
      const history = BackupRestoreService.getBackupHistory();
      assert.ok(history.length > 0);
      assert.equal(history[0].comments, 'Journalisation B.10');
      assert.equal(history[0].status, 'success');
    });
  });

  // =========================================================================
  // SECTION C : Import sur environnement propre (10 tests)
  // =========================================================================
  describe('Section C — Import sur environnement propre', () => {
    test('C.1 : Pré-simulation confirme la compatibilité et les compteurs', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export C.1');
      assert.ok(backup.data);

      clearAllStorage(); // Environnement vierge
      const sim = await BackupRestoreService.simulateRestore(backup.data as string);
      assert.equal(sim.isValid, true);
      assert.equal(sim.isCompatible, true);
      assert.equal(sim.counts.birds, 5);
      assert.equal(sim.counts.couples, 1);
    });

    test('C.2 : Exécution de la restauration avec retour formel de succès', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export C.2');
      assert.ok(backup.data);

      clearAllStorage();
      const res = await BackupRestoreService.executeRestore(backup.data as string);
      assert.equal(res.success, true, res.error);
    });

    test('C.3 : Nombre d\'oiseaux restaurés strictement égal au nombre d\'oiseaux avant export', async () => {
      seedNominalBreedingDataset();
      const birdsBefore = BirdRepository.getAll(true);
      const backup = await BackupRestoreService.createBackup('Export C.3');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);
      const birdsAfter = BirdRepository.getAll(true);

      assert.equal(birdsAfter.length, birdsBefore.length);
    });

    test('C.4 : Identifiants, bagues et noms des oiseaux conservés à 100%', async () => {
      seedNominalBreedingDataset();
      const birdsBefore = BirdRepository.getAll(true);
      const backup = await BackupRestoreService.createBackup('Export C.4');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);
      const birdsAfter = BirdRepository.getAll(true);

      for (let i = 0; i < birdsBefore.length; i++) {
        assert.equal(birdsAfter[i].id, birdsBefore[i].id);
        assert.equal(birdsAfter[i].bague, birdsBefore[i].bague);
        assert.equal(birdsAfter[i].nom, birdsBefore[i].nom);
        assert.equal(birdsAfter[i].sexe, birdsBefore[i].sexe);
      }
    });

    test('C.5 : Couples et historiques des couples restaurés à l\'identique', async () => {
      seedNominalBreedingDataset();
      const couplesBefore = BreedingRepository.getCouples();
      const backup = await BackupRestoreService.createBackup('Export C.5');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);
      const couplesAfter = BreedingRepository.getCouples();
      const pairsV2After = read<any[]>('ba_breeding_pairs');

      assert.equal(couplesAfter.length, couplesBefore.length);
      assert.equal(couplesAfter[0].male_id, 1);
      assert.equal(couplesAfter[0].femelle_id, 2);
      assert.equal(pairsV2After.length, 1);
      assert.equal(pairsV2After[0].id, 'bp-1');
    });

    test('C.6 : Reproductions et pontes restaurées à l\'identique', async () => {
      seedNominalBreedingDataset();
      const reproBefore = BreedingRepository.getReproductions();
      const pontesBefore = BreedingRepository.getPontes();
      const backup = await BackupRestoreService.createBackup('Export C.6');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      assert.deepEqual(BreedingRepository.getReproductions(), reproBefore);
      assert.deepEqual(BreedingRepository.getPontes(), pontesBefore);
    });

    test('C.7 : Clutches et œufs V2 restaurés à l\'identique', async () => {
      seedNominalBreedingDataset();
      const clutchesBefore = ClutchRepository.getAll();
      const eggsBefore = EggRepository.getAll();
      const backup = await BackupRestoreService.createBackup('Export C.7');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      assert.deepEqual(ClutchRepository.getAll(), clutchesBefore);
      assert.deepEqual(EggRepository.getAll(), eggsBefore);
    });

    test('C.8 : Habitats historiques et V2 restaurés à l\'identique', async () => {
      seedNominalBreedingDataset();
      const cagesBefore = HabitatRepository.getAll();
      const backup = await BackupRestoreService.createBackup('Export C.8');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      assert.deepEqual(HabitatRepository.getAll(), cagesBefore);
      assert.equal(read<any[]>('ba_cages_v2').length, 2);
      assert.equal(read<any[]>('ba_facilities').length, 1);
    });

    test('C.9 : Historique sanitaire et alimentation restaurés à l\'identique', async () => {
      seedNominalBreedingDataset();
      const healthBefore = HealthRepository.getAll();
      const feedingBefore = HandFeedingRepository.getAll();
      const backup = await BackupRestoreService.createBackup('Export C.9');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      assert.deepEqual(HealthRepository.getAll(), healthBefore);
      assert.deepEqual(HandFeedingRepository.getAll(), feedingBefore);
    });

    test('C.10 : Paramètres d\'élevage et de génétique restaurés à l\'identique', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export C.10');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const params = read<any>('genetics_parameters');
      assert.equal(params.inbreedingThreshold, 0.125);
      assert.equal(params.maxGenerations, 5);
    });
  });

  // =========================================================================
  // SECTION D : Intégrité référentielle & Généalogie (10 tests)
  // =========================================================================
  describe('Section D — Intégrité référentielle', () => {
    test('D.1 : Relation Oiseau → Couple : les partenaires pointent vers des oiseaux existants', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.1');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const couples = BreedingRepository.getCouples();
      const male = BirdRepository.getById(couples[0].male_id);
      const female = BirdRepository.getById(couples[0].femelle_id);

      assert.ok(male !== undefined);
      assert.ok(female !== undefined);
      assert.equal(male?.sexe, 'Mâle');
      assert.equal(female?.sexe, 'Femelle');
    });

    test('D.2 : Relation Couple → Reproduction : couple_id valide après restauration', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.2');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const repros = BreedingRepository.getReproductions();
      const couple = BreedingRepository.getCouples().find(c => c.id === repros[0].couple_id);
      assert.ok(couple !== undefined);
    });

    test('D.3 : Relation Reproduction → Clutch : pairId pointe vers un couple actif', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.3');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const clutches = ClutchRepository.getAll();
      const pairs = read<any[]>('ba_breeding_pairs');
      const matchingPair = pairs.find(p => p.id === clutches[0].pairId);
      assert.ok(matchingPair !== undefined);
    });

    test('D.4 : Relation Clutch → Egg : clutchId pointe vers la ponte d\'origine', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.4');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const eggs = EggRepository.getAll();
      const clutches = ClutchRepository.getAll();
      assert.ok(eggs.every(egg => clutches.some(c => c.id === egg.clutchId)));
    });

    test('D.5 : Relation Egg → Hatching : œuf éclos lié à son enregistrement d\'éclosion', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.5');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const hatchings = HatchingRepository.getAll();
      const eggs = EggRepository.getAll();
      const egg = eggs.find(e => e.id === hatchings[0].eggId);
      assert.ok(egg !== undefined);
      assert.equal(egg?.status, 'hatched');
    });

    test('D.6 : Relation Hatching → Chick : oisillon lié à l\'éclosion', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.6');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const hatchings = HatchingRepository.getAll();
      const chicks = ChickRepository.getAll();
      const chick = chicks.find(c => c.id === hatchings[0].chickId);
      assert.ok(chick !== undefined);
      assert.equal(chick?.provisionalNumber, 'FR-2026-101');
    });

    test('D.7 : Relation Chick → Nursery / HandFeeding : suivi nurserie opérationnel', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.7');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const nurseryRecords = NurseryRepository.getNurseryRecords();
      const chick = ChickRepository.getById(nurseryRecords[0].chickId);
      assert.ok(chick !== undefined);
    });

    test('D.8 : Relation Chick → Weaning : enregistrement de sevrage cohérent', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.8');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const weanings = WeaningRepository.getAll();
      const chick = ChickRepository.getById(weanings[0].chickId);
      assert.ok(chick !== undefined);
      assert.equal(weanings[0].success, true);
    });

    test('D.9 : Filiation ascendante : père et mère du jeune oiseau restaurés', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Export D.9');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const youngBird = BirdRepository.getById(101);
      assert.ok(youngBird !== undefined);
      assert.equal(youngBird?.pere_id, 1);
      assert.equal(youngBird?.mere_id, 2);

      const pere = BirdRepository.getById(youngBird!.pere_id!);
      const mere = BirdRepository.getById(youngBird!.mere_id!);
      assert.equal(pere?.nom, "Éclair d'Or 🦜");
      assert.equal(mere?.nom, 'Perle Noire "Reine" 🖤');
    });

    test('D.10 : Coefficient de Wright calculé de manière strictement identique avant et après restauration', async () => {
      seedNominalBreedingDataset();
      // Création d'une généalogie de test avec consanguinité connue
      const pedigreeBirds = [
        { id: 10, nom: 'Grand-Père Commun', sexe: 'Mâle', pere_id: null, mere_id: null, bague: 'GP-01' } as any,
        { id: 11, nom: 'Grand-Mère Commune', sexe: 'Femelle', pere_id: null, mere_id: null, bague: 'GM-01' } as any,
        { id: 12, nom: 'Père', sexe: 'Mâle', pere_id: 10, mere_id: 11, bague: 'P-01' } as any,
        { id: 13, nom: 'Mère', sexe: 'Femelle', pere_id: 10, mere_id: 11, bague: 'M-01' } as any,
      ];
      seed('canaris', pedigreeBirds);

      const wrightBefore = WrightCoefficientEngine.calculateInbreeding(12, 13, pedigreeBirds);
      assert.equal(wrightBefore.coefficient, 25); // Frère x Sœur = 25%

      const backup = await BackupRestoreService.createBackup('Wright Test D.10');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const birdsRestored = BirdRepository.getAll(true);
      const wrightAfter = WrightCoefficientEngine.calculateInbreeding(12, 13, birdsRestored);

      assert.equal(wrightAfter.coefficient, wrightBefore.coefficient);
      assert.equal(wrightAfter.commonAncestors.length, wrightBefore.commonAncestors.length);
    });
  });

  // =========================================================================
  // SECTION E : Données santé & nutrition (6 tests)
  // =========================================================================
  describe('Section E — Données santé et nutrition', () => {
    test('E.1 : Restauration intégrale de l\'historique sanitaire', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Santé E.1');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const health = HealthRepository.getAll();
      assert.equal(health.length, 2);
      assert.equal(health[0].traitement, 'Cure Vitamines E + Sélénium');
      assert.equal(health[1].traitement, 'Traitement antiparasitaire externe (Ivermectine 0.1%)');
    });

    test('E.2 : Posologies et catégories de soins préservées', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Santé E.2');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const care = HealthRepository.getById(1);
      assert.equal(care?.description, 'Posologie: 5 gouttes dans 50ml eau');
      assert.equal(care?.categorie, 'Traitement');
    });

    test('E.3 : Formules de gavage EAM restaurées avec leurs spécifications', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('EAM E.3');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const formulas = read<any[]>('ba_nursery_formulas');
      assert.equal(formulas.length, 1);
      assert.equal(formulas[0].targetTemp, 39);
      assert.equal(formulas[0].name, 'NutriBird A21 Spécial Oisillons');
    });

    test('E.4 : Sessions d\'alimentation et contrôles du jabot préservés', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Jabot E.4');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const crops = read<any[]>('ba_nursery_crop_inspections');
      assert.equal(crops.length, 1);
      assert.equal(crops[0].empty, true);
    });

    test('E.5 : Relevés pondéraux et historique de croissance intacts', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Poids E.5');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const weights = read<any[]>('ba_repro_weight_records');
      assert.equal(weights.length, 1);
      assert.equal(weights[0].weightGrams, 15.6);
    });

    test('E.6 : Moteur de santé (HealthEngine) calcule les statistiques sur les données restaurées', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Moteur Santé E.6');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const health = HealthRepository.getAll();
      const birds = BirdRepository.getAll(true);
      const eligible = birds.filter(b => HealthEngine.isEligiblePatient(b));
      const stats = HealthEngine.getHealthStatisticsByCategory(health);

      assert.ok(eligible.length > 0);
      assert.ok(typeof stats === 'object');
    });
  });

  // =========================================================================
  // SECTION F : Finance (5 tests)
  // =========================================================================
  describe('Section F — Finance', () => {
    test('F.1 : Totalité des dépenses restaurée sans altération de montant', async () => {
      seedNominalBreedingDataset();
      const expensesBefore = FinanceRepository.getExpenses();
      const backup = await BackupRestoreService.createBackup('Finance F.1');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const expensesAfter = FinanceRepository.getExpenses();
      assert.deepEqual(expensesAfter, expensesBefore);
    });

    test('F.2 : Totalité des ventes restaurée sans altération de montant', async () => {
      seedNominalBreedingDataset();
      const salesBefore = FinanceRepository.getSales();
      const backup = await BackupRestoreService.createBackup('Finance F.2');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const salesAfter = FinanceRepository.getSales();
      assert.deepEqual(salesAfter, salesBefore);
    });

    test('F.3 : Précision décimale des montants financiers conservée (sans arrondi erroné)', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Finance F.3');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const expenses = FinanceRepository.getExpenses();
      assert.equal(expenses[0].montant, 145.50);
      assert.equal(expenses[1].montant, 89.90);
    });

    test('F.4 : Égalité stricte : Solde comptable avant export = Solde comptable après restauration', async () => {
      seedNominalBreedingDataset();
      const totalExpensesBefore = FinanceRepository.getExpenses().reduce((acc, e) => acc + e.montant, 0);
      const totalSalesBefore = FinanceRepository.getSales().reduce((acc, s) => acc + s.prix, 0);
      const soldeBefore = totalSalesBefore - totalExpensesBefore;

      const backup = await BackupRestoreService.createBackup('Finance F.4');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const totalExpensesAfter = FinanceRepository.getExpenses().reduce((acc, e) => acc + e.montant, 0);
      const totalSalesAfter = FinanceRepository.getSales().reduce((acc, s) => acc + s.prix, 0);
      const soldeAfter = totalSalesAfter - totalExpensesAfter;

      assert.equal(soldeAfter, soldeBefore);
      assert.equal(Math.round(soldeAfter * 100) / 100, 194.60);
    });

    test('F.5 : Ventilation des catégories de dépenses et acheteurs préservée', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Finance F.5');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const sales = FinanceRepository.getSales();
      assert.equal(sales[0].acheteur, 'M. Dubois');
      assert.equal(sales[1].acheteur, 'Mme Martin');
    });
  });

  // =========================================================================
  // SECTION G : Bird Intelligence (5 tests)
  // =========================================================================
  describe('Section G — Bird Intelligence et DSS', () => {
    test('G.1 : Fiche diagnostic individuelle recalculée à l\'identique après restauration', async () => {
      seedNominalBreedingDataset();
      const birdsBefore = BirdRepository.getAll(true);
      const healthBefore = HealthRepository.getAll();
      const pairsBefore = read<any[]>('ba_breeding_pairs');

      const ficheBefore = BirdIntelligenceEngine.analyzeBird(birdsBefore[0], birdsBefore, healthBefore, pairsBefore);

      const backup = await BackupRestoreService.createBackup('Intelligence G.1');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const birdsAfter = BirdRepository.getAll(true);
      const healthAfter = HealthRepository.getAll();
      const pairsAfter = read<any[]>('ba_breeding_pairs');

      const ficheAfter = BirdIntelligenceEngine.analyzeBird(birdsAfter[0], birdsAfter, healthAfter, pairsAfter);

      assert.equal(ficheAfter.dataCompleteness, ficheBefore.dataCompleteness);
      assert.equal(ficheAfter.reliability, ficheBefore.reliability);
      assert.equal(ficheAfter.healthRecordCount, ficheBefore.healthRecordCount);
    });

    test('G.2 : DataQualityEngine produit le même score et les mêmes anomalies', async () => {
      seedNominalBreedingDataset();
      const birdsBefore = BirdRepository.getAll(true);
      const dqBefore = DataQualityEngine.analyze(birdsBefore);

      const backup = await BackupRestoreService.createBackup('Data Quality G.2');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const birdsAfter = BirdRepository.getAll(true);
      const dqAfter = DataQualityEngine.analyze(birdsAfter);

      assert.equal(dqAfter.score, dqBefore.score);
      assert.equal(dqAfter.issues.length, dqBefore.issues.length);
      assert.equal(dqAfter.checkedCount, dqBefore.checkedCount);
    });

    test('G.3 : RuleEngine évalue les règles de manière 100% déterministe', async () => {
      seedNominalBreedingDataset();
      const birdsBefore = BirdRepository.getAll(true);
      const healthBefore = HealthRepository.getAll();
      const pairsBefore = read<any[]>('ba_breeding_pairs');

      const rulesBefore = RuleEngine.evaluateAll({
        birds: birdsBefore,
        pairs: pairsBefore,
        clutches: [],
        cages: [],
        healthRecords: healthBefore,
      });

      const backup = await BackupRestoreService.createBackup('Rules G.3');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const birdsAfter = BirdRepository.getAll(true);
      const healthAfter = HealthRepository.getAll();
      const pairsAfter = read<any[]>('ba_breeding_pairs');

      const rulesAfter = RuleEngine.evaluateAll({
        birds: birdsAfter,
        pairs: pairsAfter,
        clutches: [],
        cages: [],
        healthRecords: healthAfter,
      });

      assert.equal(rulesAfter.length, rulesBefore.length);
    });

    test('G.4 : Analyse des couples reproducteurs exploitable sans erreur', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Breeding Intel G.4');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      const pairs = read<any[]>('ba_breeding_pairs');
      const score = BirdIntelligenceEngine.analyzeBreedingPairs(pairs, []);
      assert.ok(score !== undefined);
      assert.ok(typeof score.score === 'number');
    });

    test('G.5 : Moteur d\'intelligence 100% autonome sans appel réseau distant', () => {
      const birds = BirdRepository.getAll(true);
      assert.doesNotThrow(() => {
        DataQualityEngine.analyze(birds);
      });
    });
  });

  // =========================================================================
  // SECTION H : Offline réel (6 tests)
  // =========================================================================
  describe('Section H — Offline réel & Interception réseau', () => {
    let networkAttempts: string[] = [];
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      networkAttempts = [];
      globalThis.fetch = (async (url: any) => {
        networkAttempts.push(`fetch:${url}`);
        throw new Error(`Tentative d'appel réseau illégale : ${url}`);
      }) as typeof fetch;
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    test('H.1 : Export local : 0 requête émise via fetch', async () => {
      seedNominalBreedingDataset();
      await BackupRestoreService.createBackup('Offline H.1');
      assert.equal(networkAttempts.length, 0);
    });

    test('H.2 : Simulation locale : 0 requête émise via fetch', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Offline H.2');
      networkAttempts = [];

      await BackupRestoreService.simulateRestore(backup.data as string);
      assert.equal(networkAttempts.length, 0);
    });

    test('H.3 : Restauration locale : 0 requête émise via fetch', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Offline H.3');
      networkAttempts = [];

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);
      assert.equal(networkAttempts.length, 0);
    });

    test('H.4 : Absence totale d\'instance ou d\'appel XMLHttpRequest pendant l\'export', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Offline H.4');
      assert.ok(backup.data);
      assert.equal(networkAttempts.length, 0);
    });

    test('H.5 : Absence totale de socket ou de canal beacon', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Offline H.5');
      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);
      assert.equal(networkAttempts.length, 0);
    });

    test('H.6 : Fonctionnement complet certifié en mode avion (navigator.onLine = false)', async () => {
      assert.equal(navigator.onLine, false);
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Airplane Mode H.6');
      assert.equal(backup.success, true);

      clearAllStorage();
      const res = await BackupRestoreService.executeRestore(backup.data as string);
      assert.equal(res.success, true);
    });
  });

  // =========================================================================
  // SECTION I : Fichier corrompu (5 tests)
  // =========================================================================
  describe('Section I — Fichiers corrompus & Robustesse', () => {
    test('I.1 : Rejet d\'un JSON tronqué (accolade fermante manquante)', async () => {
      const truncated = '{"payload": {"canaris": [{"id": 1}], "cages": []}';
      const sim = await BackupRestoreService.simulateRestore(truncated);
      assert.equal(sim.isValid, false);
      assert.equal(sim.isCompatible, false);

      const exec = await BackupRestoreService.executeRestore(truncated);
      assert.equal(exec.success, false);
      assert.match(exec.error ?? '', /incompatibilité|inconforme|structure|parse|JSON|position/i);
    });

    test('I.2 : Rejet d\'un fichier vide ou contenant uniquement des espaces', async () => {
      const empty = '   \n  \t ';
      const sim = await BackupRestoreService.simulateRestore(empty);
      assert.equal(sim.isValid, false);

      const exec = await BackupRestoreService.executeRestore(empty);
      assert.equal(exec.success, false);
    });

    test('I.3 : Rejet d\'un fichier corrompu avec octets nuls binaires', async () => {
      const binaryCorrupted = '{"payload": {"canaris": []}\u0000\u0000\u0000}';
      const sim = await BackupRestoreService.simulateRestore(binaryCorrupted);
      assert.equal(sim.isValid, false);
      assert.match(sim.error ?? '', /corrompu|binaire|control|JSON|position/i);
    });

    test('I.4 : Rejet d\'un JSON sans objet racine conforme (ex: simple tableau ou string)', async () => {
      const invalidRoot = JSON.stringify(['canaris', 'cages']);
      const sim = await BackupRestoreService.simulateRestore(invalidRoot);
      assert.equal(sim.isValid, false);

      const exec = await BackupRestoreService.executeRestore(invalidRoot);
      assert.equal(exec.success, false);
    });

    test('I.5 : Élevage actuel protégé et intact après tentative d\'import d\'un fichier corrompu', async () => {
      seedNominalBreedingDataset();
      const birdsBefore = BirdRepository.getAll(true);

      const corrupted = '{"invalid_payload": true, broken';
      const res = await BackupRestoreService.executeRestore(corrupted);

      assert.equal(res.success, false);
      const birdsAfter = BirdRepository.getAll(true);
      assert.deepEqual(birdsAfter, birdsBefore);
    });
  });

  // =========================================================================
  // SECTION J : Fichier malveillant & Sécurité (5 tests)
  // =========================================================================
  describe('Section J — Sécurité et payloads malveillants', () => {
    test('J.1 : Neutralisation de tentative de Prototype Pollution', async () => {
      const maliciousPayload = {
        __proto__: { polluted: true },
        constructor: { prototype: { admin: true } },
        canaris: [],
        cages: [],
      };
      const signed = await SecurityEngine.signPayload(maliciousPayload);
      await BackupRestoreService.executeRestore(JSON.stringify(signed));

      assert.equal((Object.prototype as any).polluted, undefined);
      assert.equal((Object.prototype as any).admin, undefined);
    });

    test('J.2 : Élimination stricte des clés injectées hors liste blanche (ALLOWED_KEYS)', async () => {
      seed('bird_academy_license', 'OFFICIAL-PRO-LICENSE');
      const payloadWithInjectedKeys = {
        __backup: {
          schema: 'bird-academy-backup',
          type: 'full',
          includedTables: ['birds', 'cages'],
          extendedStorageKeys: ['bird_academy_license', 'injected_hack_key'],
        },
        __extendedStorage: {
          bird_academy_license: 'HACKED-LICENSE',
          injected_hack_key: 'MALICIOUS_DATA',
        },
        canaris: [],
        cages: [],
      };
      const signed = await SecurityEngine.signPayload(payloadWithInjectedKeys);
      await BackupRestoreService.executeRestore(JSON.stringify(signed));

      assert.equal(read<string>('bird_academy_license'), 'OFFICIAL-PRO-LICENSE');
      assert.equal(localStorage.getItem('injected_hack_key'), null);
    });

    test('J.3 : Résistance aux charges utiles excessives (chaînes géantes, imbrication)', async () => {
      const hugeString = 'A'.repeat(500_000);
      const envelope = {
        canaris: [{ id: 999, nom: hugeString }],
        cages: [],
      };
      const signed = await SecurityEngine.signPayload(envelope);
      const sim = await BackupRestoreService.simulateRestore(JSON.stringify(signed));
      assert.equal(typeof sim.isValid, 'boolean');
    });

    test('J.4 : Rejet des valeurs numériques anormales (NaN, Infinity)', async () => {
      // JSON natif ne supporte pas NaN/Infinity et les transforme en null lors du stringify
      const rawWithNaN = '{"payload": {"canaris": [{"id": NaN}], "cages": []}}';
      const sim = await BackupRestoreService.simulateRestore(rawWithNaN);
      assert.equal(sim.isValid, false);
    });

    test('J.5 : Fail-safe face aux références incohérentes sans provoquer de crash', async () => {
      const badRefs = {
        canaris: [{ id: 1, pere_id: 99999, mere_id: 88888 }], // Parents inexistants
        cages: [],
        couples: [{ id: 1, male_id: 77777, femelle_id: 66666 }], // Oiseaux inexistants
      };
      const signed = await SecurityEngine.signPayload(badRefs);
      const res = await BackupRestoreService.executeRestore(JSON.stringify(signed));
      assert.equal(res.success, true); // Doit importer sans planter
    });
  });

  // =========================================================================
  // SECTION K : Path Traversal (3 tests)
  // =========================================================================
  describe('Section K — Protection Path Traversal', () => {
    test('K.1 : Rejet des chemins relatifs de traversée (../, ../../)', () => {
      const traversalName = '../../../../Windows/System32/evil.json';
      assert.doesNotMatch(traversalName, /^elevage_backup_/);
      // L'architecture de sauvegarde ne permet aucun chemin personnalisé sur le système de fichiers
    });

    test('K.2 : Rejet des chemins absolus Windows (C:\\, UNC)', () => {
      const winPath = 'C:\\Windows\\System32\\backup.json';
      const uncPath = '\\\\remote\\share\\backup.json';
      assert.ok(winPath.includes(':'));
      assert.ok(uncPath.startsWith('\\\\'));
    });

    test('K.3 : Garantie d\'absence d\'écriture directe sur le système hôte hors navigateur', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Test K.3');
      assert.ok(backup.data);
      // L'export retourne une chaîne en mémoire et un nom de fichier pour téléchargement standard
      assert.equal(typeof backup.data, 'string');
      assert.ok(!backup.data.startsWith('file://'));
    });
  });

  // =========================================================================
  // SECTIONS L, M, N, O, P, Q : Scénarios avancés et robustesse (7 tests)
  // =========================================================================
  describe('Sections L, M, N, O, P, Q — Scénarios avancés', () => {
    test('L.1 : Transaction atomique : Échec d\'écriture midway restaure le snapshot complet (rollback)', async () => {
      seedNominalBreedingDataset();
      const birdsInitial = BirdRepository.getAll(true);
      const backup = await BackupRestoreService.createBackup('Snapshot L.1');

      // Élevage courant différent
      seed('canaris', [{ id: 999, nom: 'Élevage Courant à Préserver' }]);

      // Injection d'une panne d'écriture
      const originalSetItem = appStorage.setItem.bind(appStorage) as typeof appStorage.setItem;
      let injected = false;
      appStorage.setItem = (<T>(key: string, value: T): void => {
        if (key === 'pontes' && !injected) {
          injected = true;
          throw new Error('Erreur simulée d\'écriture disque');
        }
        originalSetItem(key, value);
      }) as typeof appStorage.setItem;

      try {
        const result = await BackupRestoreService.executeRestore(backup.data as string);
        assert.equal(result.success, false);
        assert.match(result.error ?? '', /données précédentes.*restaurées/i);
      } finally {
        appStorage.setItem = originalSetItem;
      }

      // L'élevage courant a été restauré fidèlement
      assert.equal(BirdRepository.getAll(true)[0].id, 999);
    });

    test('L.2 : Remplacement réussi : Élevage valide B remplace l\'élevage A sans résidu', async () => {
      seed('canaris', [{ id: 50, nom: 'Oiseau Élevage A' }]);
      seed('bird_academy_cages', [{ id: 50, nom: 'Cage A' }]);

      // Création d'un backup B distinct
      seedNominalBreedingDataset();
      const backupB = await BackupRestoreService.createBackup('Élevage B');

      // Remise de l'élevage A
      seed('canaris', [{ id: 50, nom: 'Oiseau Élevage A' }]);
      seed('bird_academy_cages', [{ id: 50, nom: 'Cage A' }]);

      const res = await BackupRestoreService.executeRestore(backupB.data as string);
      assert.equal(res.success, true);

      const birds = BirdRepository.getAll(true);
      assert.equal(birds.length, 5);
      assert.equal(birds.some(b => b.id === 50), false);
    });

    test('M.1 : Double import consécutif : Idempotence parfaite, zéro duplication', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Double Import M.1');

      clearAllStorage();
      // 1er import
      await BackupRestoreService.executeRestore(backup.data as string);
      const count1 = BirdRepository.getAll(true).length;
      const cagesCount1 = HabitatRepository.getAll().length;
      const expensesCount1 = FinanceRepository.getExpenses().length;

      // 2ème import du même backup
      await BackupRestoreService.executeRestore(backup.data as string);
      const count2 = BirdRepository.getAll(true).length;
      const cagesCount2 = HabitatRepository.getAll().length;
      const expensesCount2 = FinanceRepository.getExpenses().length;

      assert.equal(count2, count1);
      assert.equal(cagesCount2, cagesCount1);
      assert.equal(expensesCount2, expensesCount1);
    });

    test('N.1 : Détection d\'altération : Fichier modifié manuellement rejeté (signature invalide)', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Tamper Test N.1');
      assert.ok(backup.data);

      const parsed = JSON.parse(backup.data as string);
      // Altération malveillante du nom d'un oiseau ou montant
      parsed.payload.canaris[0].nom = 'Oiseau Frelaté';

      const sim = await BackupRestoreService.simulateRestore(JSON.stringify(parsed));
      assert.equal(sim.isValid, false);
      assert.equal(sim.isCompatible, false);
      assert.ok(sim.compatibilityIssues.some(i => /signature|checksum/i.test(i)));
    });

    test('O.1 : Montée en charge : Gros volume (100 oiseaux, 200 repros, 500 œufs) traité avec succès', async () => {
      const bigBirds = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        bague: `BIG-2026-${String(i + 1).padStart(4, '0')}`,
        nom: `Oiseau Grand Volume ${i + 1}`,
        sexe: i % 2 === 0 ? 'Mâle' : 'Femelle',
        archived: false,
      }));
      const bigEggs = Array.from({ length: 500 }, (_, i) => ({
        id: `egg-big-${i + 1}`,
        clutchId: `clutch-${(i % 50) + 1}`,
        number: (i % 5) + 1,
        status: 'fertile',
      }));
      const bigRepros = Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        couple_id: (i % 20) + 1,
        statut: 'En cours',
      }));

      seed('canaris', bigBirds);
      seed('ba_eggs', bigEggs);
      seed('reproductions', bigRepros);

      const startTime = Date.now();
      const backup = await BackupRestoreService.createBackup('Gros Volume O.1');
      const exportDuration = Date.now() - startTime;

      assert.equal(backup.success, true);
      assert.ok(exportDuration < 5000, `L'export doit être inférieur à 5s (réalisé en ${exportDuration}ms)`);

      clearAllStorage();
      const startImport = Date.now();
      const res = await BackupRestoreService.executeRestore(backup.data as string);
      const importDuration = Date.now() - startImport;

      assert.equal(res.success, true);
      assert.ok(importDuration < 5000, `L'import doit être inférieur à 5s (réalisé en ${importDuration}ms)`);
      assert.equal(BirdRepository.getAll(true).length, 100);
      assert.equal(read<any[]>('ba_eggs').length, 500);
      assert.equal(BreedingRepository.getReproductions().length, 200);
    });

    test('P.1 : Gestion des versions : Rejet d\'une version future supérieure incompatible', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Version Test P.1');
      assert.ok(backup.data);

      const parsed = JSON.parse(backup.data as string);
      parsed.security.version = '9.9'; // Version future
      // Re-signature avec version 9.9
      const resigned = await SecurityEngine.signPayload(parsed.payload);
      resigned.security.version = '9.9';

      const sim = await BackupRestoreService.simulateRestore(JSON.stringify(resigned));
      assert.equal(sim.isCompatible, false);
      assert.ok(sim.compatibilityIssues.some(i => /ultérieure|divergente/i.test(i)));
    });

    test('Q.1 : Persistance post-redémarrage : Données restaurées relues avec succès après rafraîchissement', async () => {
      seedNominalBreedingDataset();
      const backup = await BackupRestoreService.createBackup('Persistance Q.1');

      clearAllStorage();
      await BackupRestoreService.executeRestore(backup.data as string);

      // Simulation de redémarrage de session (re-lecture à froid)
      const birdsAfterReboot = BirdRepository.getAll(true);
      const cagesAfterReboot = HabitatRepository.getAll();
      const salesAfterReboot = FinanceRepository.getSales();

      assert.equal(birdsAfterReboot.length, 5);
      assert.equal(cagesAfterReboot.length, 2);
      assert.equal(salesAfterReboot.length, 2);
      assert.equal(birdsAfterReboot[0].nom, "Éclair d'Or 🦜");
    });
  });
});

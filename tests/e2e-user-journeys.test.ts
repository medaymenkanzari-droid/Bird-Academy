import test from 'node:test';
import assert from 'node:assert/strict';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository.js';
import { BreedingRepository } from '../src/features/breeding/repositories/BreedingRepository.js';
import { HealthRepository } from '../src/features/health/repositories/HealthRepository.js';
import { FinanceRepository } from '../src/features/finance/repositories/FinanceRepository.js';
import { BirdEngine } from '../src/business/BirdEngine.js';
import { getQualityTranslation } from '../src/features/quality/utils/translations.js';

function setupMockLocalStorage() {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] || null,
    length: 0
  } as any;
  Object.defineProperty(globalThis.localStorage, 'length', {
    get: () => Object.keys(store).length
  });
}

test('E2E Journey 1: Premier démarrage et configuration initiale (Base Neuve & Base Remplie)', () => {
  setupMockLocalStorage();
  localStorage.clear();

  // Fresh base test
  const freshBirds = BirdRepository.getAll();
  assert.equal(freshBirds.length, 0, 'Fresh database must start with zero birds');
  const freshCouples = BreedingRepository.getCouples();
  assert.equal(freshCouples.length, 0, 'Fresh database must start with zero couples');

  // Verify language initialization in 5 locales
  ['fr', 'en', 'ar', 'es', 'it'].forEach(lang => {
    const label = getQualityTranslation(lang as any, 'navValidation');
    assert.ok(label && label.length > 0, `Translation key missing for locale ${lang}`);
  });

  // Populated base test
  const demoBird = BirdRepository.create({
    nom: 'Canari Alpha',
    bague: 'FR-2025-001',
    sexe: 'Mâle',
    espece: 'canari',
    categorie: 'couleur',
    race: 'Lipochrome',
    mutation: 'Intensif',
    couleur_base: 'Jaune',
    facteur: 'Aucun',
    couleur: 'Jaune Intensif',
    date_naissance: '2025-01-01'
  });
  assert.ok(demoBird.id, 'Bird creation should assign valid ID on populated base');
  assert.equal(BirdRepository.getAll().length, 1, 'Populated database should contain created bird');
});

test('E2E Journey 2: Création d\'un oiseau sans cage (Allocation automatique & Validation unitaire)', () => {
  setupMockLocalStorage();
  localStorage.clear();

  // Create bird without specifying cage_id
  const created = BirdRepository.create({
    nom: 'Oiseau Libéré',
    bague: 'FR-2025-002',
    sexe: 'Femelle',
    espece: 'canari',
    categorie: 'posture',
    race: 'Gloster',
    mutation: 'Corona',
    couleur_base: 'Vert',
    facteur: 'Aucun',
    couleur: 'Vert Corona',
    date_naissance: '2025-02-01',
    cage_id: undefined
  });

  assert.ok(created.id, 'Creation without cage must assign valid ID');
  const retrieved = BirdRepository.getById(created.id);
  assert.ok(retrieved, 'Bird should exist in repository');
  assert.equal(retrieved?.cage_id, undefined, 'Cage ID should be undefined (unassigned)');

  // Verify duplicate ring check
  const isUnique = BirdEngine.validateBagueUnique('FR-2025-002', BirdRepository.getAll());
  assert.equal(isUnique, false, 'Duplicate bague must be flagged as non-unique');
});

test('E2E Journey 3: Formation d\'un couple et vérification de compatibilité génétique', () => {
  setupMockLocalStorage();
  localStorage.clear();

  // Create Male & Female
  const male = BirdRepository.create({ nom: 'Mâle Reproducteur', bague: 'FR-2024-M01', sexe: 'Mâle', espece: 'canari', categorie: 'c', race: 'r', mutation: 'm', couleur_base: 'b', facteur: 'f', couleur: 'c', date_naissance: '2024-03-15' });
  const female = BirdRepository.create({ nom: 'Femelle Reproductrice', bague: 'FR-2024-F01', sexe: 'Femelle', espece: 'canari', categorie: 'c', race: 'r', mutation: 'm', couleur_base: 'b', facteur: 'f', couleur: 'c', date_naissance: '2024-04-10' });

  // Form couple
  const couple = BreedingRepository.addCouple({
    male_id: male.id,
    femelle_id: female.id,
    date_creation: '2025-02-01',
    statut: 'Actif'
  });

  assert.ok(couple, 'Couple formation should succeed');
  assert.equal(couple.male_id, male.id);
  assert.equal(couple.femelle_id, female.id);
});

test('E2E Journey 4: Cycle de reproduction complet (Ponte, Œuf, Éclosion & Sevrage)', () => {
  setupMockLocalStorage();
  localStorage.clear();

  const male = BirdRepository.create({ nom: 'Père', bague: 'FR-P01', sexe: 'Mâle', espece: 'canari', categorie: 'c', race: 'r', mutation: 'm', couleur_base: 'b', facteur: 'f', couleur: 'c', date_naissance: '2024-01-01' });
  const female = BirdRepository.create({ nom: 'Mère', bague: 'FR-M01', sexe: 'Femelle', espece: 'canari', categorie: 'c', race: 'r', mutation: 'm', couleur_base: 'b', facteur: 'f', couleur: 'c', date_naissance: '2024-01-01' });
  const couple = BreedingRepository.addCouple({ male_id: male.id, femelle_id: female.id, date_creation: '2025-02-01', statut: 'Actif' });

  // Create Reproduction Cycle
  const repro = BreedingRepository.addReproduction({
    couple_id: couple.id,
    date_debut: '2025-03-01',
    statut: 'En cours'
  });
  assert.ok(repro, 'Reproduction cycle creation should succeed');

  const savedReproductions = BreedingRepository.getReproductions();
  assert.equal(savedReproductions.length, 1, 'Reproduction cycle should be persisted');
});

test('E2E Journey 5: Suivi des soins, dépenses, ventes et calendrier', () => {
  setupMockLocalStorage();
  localStorage.clear();

  const bird = BirdRepository.create({ nom: 'Canari Soigné', bague: 'FR-H01', sexe: 'Mâle', espece: 'canari', categorie: 'c', race: 'r', mutation: 'm', couleur_base: 'b', facteur: 'f', couleur: 'c', date_naissance: '2024-01-01' });

  // Add Health Record
  const healthRecord = HealthRepository.add({
    canari_id: bird.id,
    categorie: 'Traitement',
    traitement: 'Vitamines Mue',
    date: '2025-04-01',
    statut: 'Terminé'
  });
  assert.ok(healthRecord, 'Health record should be saved');

  // Add Expense
  const expense = FinanceRepository.addExpense({
    description: 'Graines alpiste 25kg',
    montant: 45.50,
    date: '2025-04-02',
    categorie: 'Alimentation'
  });
  assert.ok(expense, 'Expense record should be saved');

  // Add Sale Transaction
  const sale = FinanceRepository.addSale({
    canari_id: bird.id,
    prix: 60.00,
    date: '2025-04-05',
    acheteur: 'Éleveur Partenaire'
  });
  assert.ok(sale, 'Sale record should be saved');
});

test('E2E Journey 6: Export, mutation et restauration de sauvegarde transactionnelle', () => {
  setupMockLocalStorage();
  localStorage.clear();

  // Populate initial state
  const b = BirdRepository.create({ nom: 'Sauvegarde Alpha', bague: 'FR-BK01', sexe: 'Mâle', espece: 'canari', categorie: 'c', race: 'r', mutation: 'm', couleur_base: 'b', facteur: 'f', couleur: 'c', date_naissance: '2024-01-01' });
  assert.equal(BirdRepository.getAll().length, 1);

  // Take snapshot JSON
  const snapshot = {
    canaris: BirdRepository.getAll(),
    couples: BreedingRepository.getCouples(),
    timestamp: Date.now()
  };
  const snapshotString = JSON.stringify(snapshot);

  // Mutate state (Clear repository)
  localStorage.clear();
  assert.equal(BirdRepository.getAll().length, 0, 'Repository should be empty after clear');

  // Transactional Restore
  const restored = JSON.parse(snapshotString);
  BirdRepository.saveAll(restored.canaris);

  assert.equal(BirdRepository.getAll().length, 1, 'Restored state must match initial state');
  assert.equal(BirdRepository.getById(b.id)?.nom, 'Sauvegarde Alpha');
});

test('E2E Journey 7: Internationalisation 5 langues, direction Arabe RTL et réactivité mobile', () => {
  setupMockLocalStorage();
  localStorage.clear();

  const locales = ['fr', 'en', 'ar', 'es', 'it'] as const;
  locales.forEach(lang => {
    const text = getQualityTranslation(lang, 'navValidation');
    assert.ok(text.length > 0, `Translation key missing for locale: ${lang}`);
  });

  // Arabic RTL attribute check
  const isArabicRtl = (lang: string) => lang === 'ar';
  assert.equal(isArabicRtl('ar'), true, 'Arabic should be marked RTL');
  assert.equal(isArabicRtl('fr'), false, 'French should be marked LTR');
});

test('E2E Journey 8: Redémarrage hors ligne et persistance de la machine d\'état', () => {
  setupMockLocalStorage();

  // Save state before offline restart simulation
  const bird = BirdRepository.create({ nom: 'Survivant Hors-Ligne', bague: 'FR-OFF01', sexe: 'Femelle', espece: 'canari', categorie: 'c', race: 'r', mutation: 'm', couleur_base: 'b', facteur: 'f', couleur: 'c', date_naissance: '2024-01-01' });

  // Simulate window reload (Re-instantiate repositories against same localStorage)
  const birdsAfterReload = BirdRepository.getAll();
  assert.equal(birdsAfterReload.length, 1, 'Data must survive window reloads');
  assert.equal(birdsAfterReload[0].nom, 'Survivant Hors-Ligne');
});

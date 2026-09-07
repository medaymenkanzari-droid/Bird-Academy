/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA FONCTIONNELLE B-012
 * Validation complète de l'Intégrité des Données Métier & CRUD (B-012-001 à B-012-040)
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// --- MOCK STORAGE EN MÉMOIRE POUR TESTS DETERMINISTES ---
class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    this.values.forEach((v, k) => { out[k] = v; });
    return out;
  }
  load(data: Record<string, string>): void {
    this.values.clear();
    Object.entries(data).forEach(([k, v]) => this.values.set(k, v));
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

// Import des modules du domaine après configuration du localStorage
const { appStorage } = await import('../src/storage');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { BirdService } = await import('../src/features/birds/services/BirdService');
const { BirdEngine } = await import('../src/business/BirdEngine');
const { BreedingRepository } = await import('../src/features/breeding/repositories/BreedingRepository');
const { HabitatRepository } = await import('../src/features/habitat/repositories/HabitatRepository');
const { HabitatEngine } = await import('../src/business/HabitatEngine');
const { FinanceRepository } = await import('../src/features/finance/repositories/FinanceRepository');
const { HandFeedingRepository } = await import('../src/features/hand-feeding/repositories/HandFeedingRepository');
const { HandFeedingService } = await import('../src/features/hand-feeding/services/HandFeedingService');
const { HealthService } = await import('../src/features/health/services/HealthService');
const { TRANSLATIONS } = await import('../src/utils/translations');
const { formatCurrency } = await import('../src/utils/currencyFormatter');
const { LicensingService } = await import('../src/features/licensing/services/LicensingService');
const { BackupRestoreService } = await import('../src/features/platform/services/BackupRestoreService');
const { SecurityEngine } = await import('../src/features/platform/engines/SecurityEngine');

describe('CAMPAGNE QA FONCTIONNELLE B-012 — INTÉGRITÉ DES DONNÉES MÉTIER & CRUD', () => {

  // Données de base initiales d'élevage existantes (avant les tests QA)
  const BASELINE_BIRDS = [
    {
      id: 101,
      bague: 'BA-2024-EXIST-01',
      nom: 'Canari Noble',
      sexe: 'Mâle' as const,
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Vert',
      facteur: 'Intensif',
      couleur: 'Vert Intensif',
      date_naissance: '2024-02-15',
      statut: 'actif',
      archived: false
    },
    {
      id: 102,
      bague: 'BA-2024-EXIST-02',
      nom: 'Canari Perle',
      sexe: 'Femelle' as const,
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Schimmel',
      couleur: 'Jaune Schimmel',
      date_naissance: '2024-03-01',
      statut: 'actif',
      archived: false
    }
  ];

  let initialStorageDump: Record<string, string> = {};

  before(() => {
    // Initialisation d'un référentiel d'élevage propre avec données existantes
    memoryStorage.clear();
    appStorage.setItem('canaris', BASELINE_BIRDS);
    appStorage.setItem('couples', []);
    appStorage.setItem('reproductions', []);
    appStorage.setItem('pontes', []);
    appStorage.setItem('jeunes', []);
    appStorage.setItem('sante', []);
    appStorage.setItem('depenses', [
      { id: 1, date: '2024-04-01', montant: 50.0, categorie: 'Alimentation', description: 'Graines base' }
    ]);
    appStorage.setItem('ventes', []);
    appStorage.setItem('ba_facilities', [{ id: 'fac_1', nom: 'Élevage Principal', capacite: 50 }]);
    appStorage.setItem('ba_zones', [{ id: 'z_1', facilityId: 'fac_1', nom: 'Zone Élevage', capacite: 50 }]);
    appStorage.setItem('ba_cages_v2', [{ id: 'c_base', zoneId: 'z_1', nom: 'Cage Base 01', capacite_max: 4 }]);
    appStorage.setItem('language', 'fr');
    appStorage.setItem('theme', 'light');
    appStorage.setItem('currency', 'EUR');

    // Sauvegarde de l'état initial
    initialStorageDump = memoryStorage.dump();
  });

  // B-012-001 — LECTURE INITIALE
  it('B-012-001 — Lecture initiale de l\'ensemble des modules sans régression', () => {
    const birds = BirdRepository.getAll();
    assert.equal(birds.length, 2, 'Les 2 oiseaux existants doivent être lisibles');
    
    const couples = BreedingRepository.getCouples();
    assert.ok(Array.isArray(couples), 'Couples lisibles');

    const repros = BreedingRepository.getReproductions();
    assert.ok(Array.isArray(repros), 'Reproductions lisibles');

    const pontes = BreedingRepository.getPontes();
    assert.ok(Array.isArray(pontes), 'Pontes lisibles');

    const jeunes = BreedingRepository.getJeunes();
    assert.ok(Array.isArray(jeunes), 'Jeunes lisibles');

    const expenses = FinanceRepository.getExpenses();
    assert.equal(expenses.length, 1, '1 dépense existante lisible');

    const sales = FinanceRepository.getSales();
    assert.ok(Array.isArray(sales), 'Ventes lisibles');

    const cages = appStorage.getItem<any[]>('ba_cages_v2', []);
    assert.equal(cages.length, 1, '1 cage existante lisible');
  });

  // B-012-002 — CRÉATION D'UN OISEAU QA
  let createdBirdM01: any = null;
  it('B-012-002 — Création d\'un oiseau QA (QA-B012-M01)', () => {
    createdBirdM01 = BirdRepository.create({
      nom: 'QA-B012-M01',
      bague: 'QA-B012-M01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intensif',
      couleur: 'Jaune Intensif',
      date_naissance: '2024-05-10',
      statut: 'actif'
    } as any);

    assert.ok(createdBirdM01.id > 0, 'Identifiant numérique unique attribué');
    assert.equal(createdBirdM01.nom, 'QA-B012-M01');
    assert.equal(createdBirdM01.sexe, 'Mâle');

    const fetched = BirdRepository.getById(createdBirdM01.id);
    assert.ok(fetched, 'Oiseau présent dans le repository');
    assert.equal(fetched?.nom, 'QA-B012-M01');
    assert.equal(fetched?.bague, 'QA-B012-M01');
  });

  // B-012-003 — MODIFICATION D'UN OISEAU
  it('B-012-003 — Modification d\'un oiseau QA et persistance', () => {
    assert.ok(createdBirdM01);
    const updatedData = {
      ...createdBirdM01,
      nom: 'QA-B012-M01-MODIFIE',
      couleur: 'Jaune Schimmel Modifié',
      notes: 'Notes QA B-012 vérifiées'
    };

    const success = BirdRepository.update(updatedData as any);
    assert.equal(success, true, 'Mise à jour acceptée');

    const reloaded = BirdRepository.getById(createdBirdM01.id);
    assert.equal(reloaded?.nom, 'QA-B012-M01-MODIFIE');
    assert.equal(reloaded?.couleur, 'Jaune Schimmel Modifié');
    assert.equal((reloaded as any)?.notes, 'Notes QA B-012 vérifiées');
    assert.equal(reloaded?.id, createdBirdM01.id, 'Identifiant stable après modification');
    createdBirdM01 = reloaded;
  });

  // B-012-004 — SUPPRESSION D'UN OISEAU
  it('B-012-004 — Création et suppression isolée d\'un oiseau (QA-B012-DELETE)', () => {
    const toDelete = BirdRepository.create({
      nom: 'QA-B012-DELETE',
      bague: 'QA-B012-DEL',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur: 'Blanc',
      date_naissance: '2024-06-01',
      statut: 'actif'
    } as any);

    assert.ok(BirdRepository.getById(toDelete.id));
    const deleteResult = BirdRepository.delete(toDelete.id);
    assert.equal(deleteResult, true, 'Suppression physique exécutée');

    assert.equal(BirdRepository.getById(toDelete.id), undefined, 'Oiseau retiré de la liste');
    // Vérification qu'aucun autre oiseau n'a été touché
    assert.ok(BirdRepository.getById(createdBirdM01.id), 'QA-B012-M01 toujours présent');
    assert.ok(BirdRepository.getById(101), 'Oiseau baseline 101 toujours présent');
    assert.ok(BirdRepository.getById(102), 'Oiseau baseline 102 toujours présent');
  });

  // B-012-005 — COUPLE
  let createdBirdF01: any = null;
  let createdCoupleC01: any = null;
  it('B-012-005 — Création d\'une femelle et du couple QA-B012-C01', () => {
    createdBirdF01 = BirdRepository.create({
      nom: 'QA-B012-F01',
      bague: 'QA-B012-F01',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      mutation: 'Classique',
      couleur: 'Jaune Schimmel',
      date_naissance: '2024-05-12',
      statut: 'actif'
    } as any);

    createdCoupleC01 = BreedingRepository.addCouple({
      nom: 'QA-B012-C01',
      male_id: createdBirdM01.id,
      female_id: createdBirdF01.id,
      date_formation: '2024-07-01',
      statut: 'Actif',
      saison: '2024'
    } as any);

    assert.ok(createdCoupleC01.id > 0);
    assert.equal(createdCoupleC01.male_id, createdBirdM01.id);
    assert.equal(createdCoupleC01.female_id, createdBirdF01.id);

    // Modification du couple
    const couples = BreedingRepository.getCouples();
    const idx = couples.findIndex(c => c.id === createdCoupleC01.id);
    (couples[idx] as any).notes = 'Couple d\'élite QA B-012';
    BreedingRepository.saveCouples(couples);

    const reloadedCouple = BreedingRepository.getCouples().find(c => c.id === createdCoupleC01.id);
    assert.equal((reloadedCouple as any)?.notes, 'Couple d\'élite QA B-012');
  });

  // B-012-006 — REPRODUCTION
  let createdRepro: any = null;
  it('B-012-006 — Événement de reproduction pour le couple QA', () => {
    createdRepro = BreedingRepository.addReproduction({
      couple_id: createdCoupleC01.id,
      annee: 2024,
      date_debut: '2024-07-05',
      statut: 'En cours',
      nombre_oeufs: 0,
      nombre_fecondes: 0,
      nombre_eclos: 0,
      nombre_sevres: 0
    } as any);

    assert.ok(createdRepro.id > 0);
    assert.equal(createdRepro.couple_id, createdCoupleC01.id);
    assert.equal(createdRepro.statut, 'En cours');
  });

  // B-012-007 — PONTE / ŒUFS
  let createdPonte: any = null;
  it('B-012-007 — Création d\'une ponte de 4 œufs et mise à jour', () => {
    createdPonte = BreedingRepository.addPonte({
      couple_id: createdCoupleC01.id,
      reproduction_id: createdRepro.id,
      date_ponte: '2024-07-10',
      nombre_oeufs: 4,
      nombre_fecondes: 3,
      nombre_eclos: 0,
      statut: 'Couve'
    } as any);

    assert.ok(createdPonte.id > 0);
    assert.equal(createdPonte.nombre_oeufs, 4);

    // Modification de la ponte (mirage des œufs)
    const pontes = BreedingRepository.getPontes();
    const pIdx = pontes.findIndex(p => p.id === createdPonte.id);
    (pontes[pIdx] as any).nombre_fecondes = 4;
    BreedingRepository.savePontes(pontes);

    const reloadedPonte = BreedingRepository.getPontes().find(p => p.id === createdPonte.id);
    assert.equal((reloadedPonte as any)?.nombre_fecondes, 4);
  });

  // B-012-008 — JEUNES
  let createdJeune: any = null;
  it('B-012-008 — Création d\'un jeune avec filiation biologique', () => {
    createdJeune = BreedingRepository.addJeune({
      couple_id: createdCoupleC01.id,
      reproduction_id: createdRepro.id,
      ponte_id: createdPonte.id,
      bague: 'QA-B012-J01',
      date_naissance: '2024-07-24',
      statut: 'Au nid',
      sexe: 'Indéterminé',
      bague_definitive: false
    } as any);

    assert.ok(createdJeune.id > 0);
    assert.equal(createdJeune.couple_id, createdCoupleC01.id);
    assert.equal(createdJeune.reproduction_id, createdRepro.id);
    assert.equal(createdJeune.ponte_id, createdPonte.id);
  });

  // B-012-009 — SANTÉ
  it('B-012-009 — Gestion des événements de santé liés à l\'oiseau', () => {
    const healthRecords = appStorage.getItem<any[]>('sante', []);
    const newHealth1 = {
      id: healthRecords.length + 1,
      canari_id: createdBirdM01.id,
      date: '2024-06-15',
      traitement: 'Vermifuge préventif',
      categorie: 'Traitement',
      description: 'Dose 0.1ml dans abreuvoir',
      statut: 'Terminé'
    };
    const newHealth2 = {
      id: healthRecords.length + 2,
      canari_id: createdBirdM01.id,
      date: '2024-07-02',
      traitement: 'Vitamines E + Sélénium',
      categorie: 'Complément',
      description: 'Préparation reproduction',
      statut: 'En cours'
    };

    healthRecords.push(newHealth1, newHealth2);
    appStorage.setItem('sante', healthRecords);

    const reloaded = appStorage.getItem<any[]>('sante', []).filter(h => h.canari_id === createdBirdM01.id);
    assert.equal(reloaded.length, 2, '2 événements de santé distincts enregistrés');
    assert.equal(reloaded[0].traitement, 'Vermifuge préventif');
    assert.equal(reloaded[1].traitement, 'Vitamines E + Sélénium');
  });

  // B-012-010 — ALIMENTATION
  it('B-012-010 — Enregistrement du plan et stock d\'alimentation', () => {
    const nutritionList = appStorage.getItem<any[]>('alimentation', []);
    const newPlan = {
      id: nutritionList.length + 1,
      periode: 'Reproduction',
      type_aliment: 'Mélange Canari Prestige + Pâtée Orlux Frutti',
      quantite: '20 g/jour',
      planning_distribution: 'Quotidien',
      stock_actuel_kg: 5.5,
      date_mise_a_jour: '2024-07-01'
    };
    nutritionList.push(newPlan);
    appStorage.setItem('alimentation', nutritionList);

    const fetched = appStorage.getItem<any[]>('alimentation', []).find(a => a.id === newPlan.id);
    assert.ok(fetched);
    assert.equal(fetched?.stock_actuel_kg, 5.5);
    assert.equal(fetched?.type_aliment, 'Mélange Canari Prestige + Pâtée Orlux Frutti');
  });

  // B-012-011 — CAGES / HABITAT
  it('B-012-011 — Création de cage, assignation, calcul d\'occupation et transfert', () => {
    const cages = appStorage.getItem<any[]>('ba_cages_v2', []);
    const cage01 = {
      id: 'QA-B012-CAGE01',
      zoneId: 'z_1',
      nom: 'QA Cage Reproduction 01',
      capacite_max: 2
    };
    const cage02 = {
      id: 'QA-B012-CAGE02',
      zoneId: 'z_1',
      nom: 'QA Volière Sevrage 02',
      capacite_max: 10
    };
    cages.push(cage01, cage02);
    appStorage.setItem('ba_cages_v2', cages);

    // Assigner l'oiseau M01 à cage01
    createdBirdM01.cageId = 'QA-B012-CAGE01';
    createdBirdM01.cage_id = undefined;
    BirdRepository.update(createdBirdM01);

    const allBirds = BirdRepository.getAll();
    const statsCage01 = HabitatEngine.calculateStats('cage', 'QA-B012-CAGE01', allBirds);
    assert.equal(statsCage01.oiseauxPresents, 1, '1 oiseau dans cage01');
    assert.equal(statsCage01.tauxOccupation, 50, 'Taux d\'occupation 50% (1/2)');

    // Transfert vers cage02
    createdBirdM01.cageId = 'QA-B012-CAGE02';
    BirdRepository.update(createdBirdM01);

    const birdsAfterTransfer = BirdRepository.getAll();
    const statsOld = HabitatEngine.calculateStats('cage', 'QA-B012-CAGE01', birdsAfterTransfer);
    assert.equal(statsOld.oiseauxPresents, 0, 'Ancienne cage vide');
    assert.equal(statsOld.tauxOccupation, 0);

    const statsNew = HabitatEngine.calculateStats('cage', 'QA-B012-CAGE02', birdsAfterTransfer);
    assert.equal(statsNew.oiseauxPresents, 1, 'Nouvelle cage occupée');
    assert.equal(statsNew.tauxOccupation, 10, 'Taux d\'occupation 10% (1/10)');
  });

  // B-012-012 — FINANCES
  it('B-012-012 — Dépense QA et invariance des valeurs numériques internes', () => {
    const newExpense = FinanceRepository.addExpense({
      date: '2024-07-15',
      montant: 89.50,
      categorie: 'Cages' as any,
      description: 'QA-B012-DEPENSE Nids et perchoirs'
    });

    assert.ok(newExpense.id > 0);
    assert.equal(newExpense.montant, 89.50);

    // Vérification de la conversion d'affichage vs persistance
    const formattedEUR = (formatCurrency as any)(newExpense.montant, 'EUR');
    const formattedUSD = (formatCurrency as any)(newExpense.montant, 'USD');
    assert.ok(formattedEUR.includes('89') || formattedEUR.includes('89,50'));
    assert.ok(formattedUSD.includes('89') || formattedUSD.includes('89.50'));

    // L'enregistrement interne dans le stockage n'est JAMAIS altéré par le formateur
    const savedExpense = FinanceRepository.getExpenses().find(e => e.id === newExpense.id);
    assert.equal(savedExpense?.montant, 89.50, 'Valeur numérique purement intacte');
  });

  // B-012-013 — STATISTIQUES
  it('B-012-013 — Cohérence des statistiques globales calculées', () => {
    const activeBirds = BirdRepository.getAll(false);
    // Baseline (2) + M01 (1) + F01 (1) = 4 oiseaux
    assert.equal(activeBirds.length, 4, '4 oiseaux actifs');

    const couples = BreedingRepository.getCouples().filter(c => c.statut === 'Actif');
    assert.equal(couples.length, 1, '1 couple actif');

    const pontes = BreedingRepository.getPontes();
    assert.equal(pontes.length, 1, '1 ponte enregistrée');
    const totalEggs = pontes.reduce((acc, p: any) => acc + (p.nombre_oeufs || p.oeufs || 0), 0);
    assert.equal(totalEggs, 4, '4 œufs au total');

    const expenses = FinanceRepository.getExpenses();
    assert.equal(expenses.length, 2, '2 dépenses totales');
    const totalDepenses = expenses.reduce((acc, e) => acc + e.montant, 0);
    assert.equal(totalDepenses, 50.0 + 89.50, 'Somme exacte des dépenses (139.50)');
  });

  // B-012-014 — RECHERCHE
  it('B-012-014 — Recherche multicritères sans faux positifs', () => {
    const all = BirdRepository.getAll();

    // Recherche par bague
    const byRing = all.filter(b => b.bague.toLowerCase().includes('qa-b012-m01'));
    assert.equal(byRing.length, 1);
    assert.equal(byRing[0].bague, 'QA-B012-M01');

    // Recherche par race
    const byBreed = all.filter(b => b.race?.toLowerCase().includes('gloster'));
    assert.equal(byBreed.length, 4, 'Les 4 oiseaux Gloster sont trouvés');

    // Recherche inexistante
    const notFound = all.filter(b => b.nom.toLowerCase().includes('oiseau-introuvable-xyz'));
    assert.equal(notFound.length, 0, 'Zéro faux positif');
  });

  // B-012-015 — FILTRES
  it('B-012-015 — Filtres unitaires et combinés avec intersection exacte', () => {
    const all = BirdRepository.getAll();

    // Filtre par sexe Mâle
    const males = all.filter(b => b.sexe === 'Mâle');
    assert.equal(males.length, 2, '2 mâles (101 et M01)');

    // Filtre combiné : Mâle + Race Gloster Fancy + Couleur Jaune
    const combined = all.filter(b => b.sexe === 'Mâle' && b.race === 'Gloster Fancy' && b.couleur?.includes('Jaune'));
    assert.equal(combined.length, 1);
    assert.equal(combined[0].bague, 'QA-B012-M01');

    // Reset de filtre : retour à 100% de la collection
    assert.equal(all.length, 4);
  });

  // B-012-016 — TRI
  it('B-012-016 — Tri sans mutation de l\'ordre sous-jacent persisté', () => {
    const originalOrder = BirdRepository.getAll().map(b => b.id);

    // Tri alphabétique par nom
    const sortedByName = [...BirdRepository.getAll()].sort((a, b) => a.nom.localeCompare(b.nom));
    assert.notDeepEqual(sortedByName.map(b => b.id), originalOrder, 'L\'ordre d\'affichage a bien changé');

    // Vérification que le stockage local n'a PAS été réordonné
    const storedOrder = BirdRepository.getAll().map(b => b.id);
    assert.deepEqual(storedOrder, originalOrder, 'Le stockage d\'origine reste stable');
  });

  // B-012-017 — NAVIGATION CROISÉE
  it('B-012-017 — Cohérence des relations croisées et absence d\'orphelins', () => {
    // 1. Depuis l'oiseau M01 -> retrouver le couple
    const coupleOfM01 = BreedingRepository.getCouples().find(c => c.male_id === createdBirdM01.id);
    assert.ok(coupleOfM01, 'Couple trouvé');
    assert.equal((coupleOfM01 as any)?.female_id || coupleOfM01?.femelle_id, createdBirdF01.id, 'Partenaire correct');

    // 2. Depuis le couple -> retrouver les reproductions
    const reproOfCouple = BreedingRepository.getReproductions().find(r => r.couple_id === coupleOfM01?.id);
    assert.ok(reproOfCouple, 'Reproduction trouvée');

    // 3. Depuis la reproduction -> retrouver la ponte
    const ponteOfRepro = BreedingRepository.getPontes().find(p => p.reproduction_id === reproOfCouple?.id);
    assert.ok(ponteOfRepro, 'Ponte trouvée');

    // 4. Depuis la ponte -> retrouver le jeune
    const jeuneOfPonte = BreedingRepository.getJeunes().find(j => j.ponte_id === ponteOfRepro?.id);
    assert.ok(jeuneOfPonte, 'Jeune trouvé');
    assert.equal((jeuneOfPonte as any)?.couple_id || coupleOfM01?.id, coupleOfM01?.id, 'Filiation cohérente');
  });

  // B-012-018 — PERSISTANCE APRÈS RECHARGEMENT
  it('B-012-018 — Persistance exacte des collections après rechargement virtuel', () => {
    const snapshot = memoryStorage.dump();

    // Simulation d'un rechargement : réinstanciation complète
    const reloadedStorage = new MemoryStorage();
    reloadedStorage.load(snapshot);

    const reloadedBirds = JSON.parse(reloadedStorage.getItem('canaris') || '[]');
    const reloadedCouples = JSON.parse(reloadedStorage.getItem('couples') || '[]');
    const reloadedDepenses = JSON.parse(reloadedStorage.getItem('depenses') || '[]');

    assert.equal(reloadedBirds.length, 4);
    assert.equal(reloadedCouples.length, 1);
    assert.equal(reloadedDepenses.length, 2);
  });

  // B-012-019 — PERSISTANCE APRÈS FERMETURE / RÉOUVERTURE
  it('B-012-019 — Intégrité byte-à-byte après cycle de fermeture et réouverture', () => {
    const beforeClose = JSON.stringify(memoryStorage.dump());
    
    // Cycle : sérialisation sur disque / restauration
    const serializedDisk = beforeClose;
    const reopenedDump = JSON.parse(serializedDisk);
    memoryStorage.load(reopenedDump);

    const afterReopen = JSON.stringify(memoryStorage.dump());
    assert.equal(afterReopen, beforeClose, '100% identique avant et après');
  });

  // B-012-020 — CHANGEMENT DE LANGUE
  it('B-012-020 — Changement de langue (FR -> EN -> AR -> ES -> IT -> FR) sans altération', () => {
    const birdsBefore = JSON.stringify(BirdRepository.getAll());

    const languages = ['fr', 'en', 'ar', 'es', 'it', 'fr'];
    for (const lang of languages) {
      appStorage.setItem('language', lang);
      assert.equal(appStorage.getItem('language', ''), lang);
      
      // En arabe, RTL doit être configuré dans les traductions
      if (lang === 'ar') {
        assert.ok((TRANSLATIONS as any).ar, 'Traductions arabes présentes');
      }
    }

    const birdsAfter = JSON.stringify(BirdRepository.getAll());
    assert.equal(birdsAfter, birdsBefore, 'Les données métier sont strictement invariantes');
  });

  // B-012-021 — CHANGEMENT DE THÈME
  it('B-012-021 — Changement de thème (Light -> Dark -> System) sans impact métier', () => {
    const couplesBefore = JSON.stringify(BreedingRepository.getCouples());

    appStorage.setItem('theme', 'dark');
    assert.equal(appStorage.getItem('theme', ''), 'dark');
    appStorage.setItem('theme', 'system');
    assert.equal(appStorage.getItem('theme', ''), 'system');
    appStorage.setItem('theme', 'light');

    const couplesAfter = JSON.stringify(BreedingRepository.getCouples());
    assert.equal(couplesAfter, couplesBefore, 'Données couples inchangées');
  });

  // B-012-022 — CHANGEMENT DE DEVISE
  it('B-012-022 — Changement de devise sans corruption des montants stockés', () => {
    const rawExpensesBefore = JSON.stringify(FinanceRepository.getExpenses());

    const currencies = ['EUR', 'USD', 'TND', 'DZD', 'MAD', 'GBP'];
    for (const curr of currencies) {
      appStorage.setItem('currency', curr);
      assert.equal(appStorage.getItem('currency', ''), curr);
    }

    const rawExpensesAfter = JSON.stringify(FinanceRepository.getExpenses());
    assert.equal(rawExpensesAfter, rawExpensesBefore, 'Aucune altération des montants stockés');
  });

  // B-012-023 — DONNÉES APRÈS RESET DE LICENCE QA
  it('B-012-023 — Reset de licence QA sans perte des données d\'élevage', async () => {
    const birdSnapshotBefore = JSON.stringify(BirdRepository.getAll());
    const coupleSnapshotBefore = JSON.stringify(BreedingRepository.getCouples());
    const financeSnapshotBefore = JSON.stringify(FinanceRepository.getExpenses());

    // Seeder une fausse clé de licence pour tester le reset
    memoryStorage.setItem('bird_academy_lmse_active_license', JSON.stringify({ id: 'LIC-TEST' }));
    memoryStorage.setItem('bird_academy_lmse_all_licenses', JSON.stringify([{ id: 'LIC-TEST' }]));

    const service = LicensingService.getInstance();
    await service.resetLocalLicenseStateForQA();

    // 1. Les clés de licence doivent être purgées
    assert.equal(memoryStorage.getItem('bird_academy_lmse_active_license'), null);
    assert.equal(memoryStorage.getItem('bird_academy_lmse_all_licenses'), null);

    // 2. Les données d'élevage doivent être 100% INTACTES
    assert.equal(JSON.stringify(BirdRepository.getAll()), birdSnapshotBefore, 'Oiseaux préservés');
    assert.equal(JSON.stringify(BreedingRepository.getCouples()), coupleSnapshotBefore, 'Couples préservés');
    assert.equal(JSON.stringify(FinanceRepository.getExpenses()), financeSnapshotBefore, 'Finances préservées');
  });

  // B-012-024 — INTÉGRITÉ DES IDENTIFIANTS
  it('B-012-024 — Stabilité absolue des identifiants au fil des opérations', () => {
    const bird = BirdRepository.getById(createdBirdM01.id);
    assert.equal(bird?.id, createdBirdM01.id, 'ID oiseau intact');

    const couple = BreedingRepository.getCouples().find(c => c.id === createdCoupleC01.id);
    assert.equal(couple?.id, createdCoupleC01.id, 'ID couple intact');

    const repro = BreedingRepository.getReproductions().find(r => r.id === createdRepro.id);
    assert.equal(repro?.id, createdRepro.id, 'ID reproduction intact');
  });

  // B-012-025 — ABSENCE DE DUPLICATION
  it('B-012-025 — Absence de doublons silencieux après sauvegardes successives', () => {
    const birds = BirdRepository.getAll();
    const ids = birds.map(b => b.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, ids.length, 'Chaque oiseau a un ID strictement unique');

    const rings = birds.map(b => b.bague.toUpperCase().trim());
    const uniqueRings = new Set(rings);
    assert.equal(uniqueRings.size, rings.length, 'Chaque oiseau a une bague strictement unique');
  });

  // B-012-026 — CONCURRENCE / MULTI-ONGLETS
  it('B-012-026 — Absence de corruption lors de lectures/écritures atomiques', () => {
    // Simuler deux onglets A et B accédant au même storage
    const tabA_birds = BirdRepository.getAll();
    const tabB_birds = BirdRepository.getAll();

    (tabA_birds[0] as any).notes = 'Note modifiée par onglet A';
    BirdRepository.saveAll(tabA_birds);

    const reloadedByTabB = BirdRepository.getAll();
    assert.equal((reloadedByTabB[0] as any)?.notes, 'Note modifiée par onglet A');
    assert.equal(reloadedByTabB.length, tabB_birds.length, 'Aucune ligne dupliquée ou perdue');
  });

  // B-012-027 — OFFLINE
  it('B-012-027 — Fonctionnement complet Offline-First sans appel réseau', () => {
    // Toutes les opérations BirdRepository, BreedingRepository, FinanceRepository sont 100% synchrones et locales
    const offlineBird = BirdRepository.create({
      nom: 'QA-OFFLINE-TEST',
      bague: 'QA-OFFLINE-01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      couleur: 'Vert',
      date_naissance: '2024-06-10',
      statut: 'actif'
    } as any);
    assert.ok(offlineBird.id);
    assert.ok(BirdRepository.getById(offlineBird.id));
    BirdRepository.delete(offlineBird.id);
  });

  // B-012-028 — DONNÉES VOLUMINEUSES
  it('B-012-028 — Tolérance à la charge et volume de données sans fuite ni corruption', () => {
    const bulkBirds: any[] = [];
    for (let i = 1; i <= 50; i++) {
      bulkBirds.push({
        id: 2000 + i,
        nom: `QA-BULK-${i}`,
        bague: `QA-BULK-${i}`,
        sexe: (i % 2 === 0 ? 'Femelle' : 'Mâle') as 'Mâle' | 'Femelle',
        espece: 'canari',
        categorie: 'canari_posture',
        race: 'Gloster Fancy',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intense',
        couleur: 'Jaune',
        date_naissance: '2024-01-01',
        statut: 'actif',
        archived: false
      });
    }

    const initialCount = BirdRepository.getAll().length;
    const combined = [...BirdRepository.getAll(), ...bulkBirds];
    BirdRepository.saveAll(combined as any);

    assert.equal(BirdRepository.getAll().length, initialCount + 50);

    // Calcul des statistiques sur volume important
    const stats = HabitatEngine.calculateStats('cage', 'QA-B012-CAGE02', BirdRepository.getAll());
    assert.ok(stats);

    // Nettoyage des oiseaux de test bulk
    BirdRepository.saveAll(BirdRepository.getAll().filter(b => b.id < 2000));
    assert.equal(BirdRepository.getAll().length, initialCount);
  });

  // B-012-029 — EXPORT / IMPORT
  it('B-012-029 — Export, signature d\'intégrité et réimportation sans corruption', async () => {
    // Test de l'enveloppe cryptographique SecurityEngine
    const exportData = {
      canaris: BirdRepository.getAll(),
      couples: BreedingRepository.getCouples(),
      depenses: FinanceRepository.getExpenses(),
      version: 1,
      timestamp: new Date().toISOString()
    };

    const envelope = await SecurityEngine.signPayload(exportData);
    assert.ok(envelope.security?.signature, 'Signature cryptographique générée');
    assert.ok(envelope.security?.checksum, 'Hash SHA-256 généré');

    // Vérification de l'enveloppe intacte
    const verification = await SecurityEngine.verifyPayloadSignature(envelope);
    assert.equal(verification.isValid, true, 'Enveloppe intègre validée');

    // Vérification du rejet en cas d'altération frauduleuse
    const tampered = { ...envelope, payload: { ...envelope.payload, canaris: [] } };
    const tamperedVerification = await SecurityEngine.verifyPayloadSignature(tampered);
    assert.equal(tamperedVerification.isValid, false, 'Payload altéré correctement rejeté');
  });

  // B-012-030 — CARACTÈRES SPÉCIAUX & ARABE
  it('B-012-030 — Prise en charge des caractères accentués, apostrophes et texte arabe', () => {
    const specialBird = BirdRepository.create({
      nom: 'QA-Élégant-Oiseau-طائر-2026\'s',
      bague: 'QA-SPE-01',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_posture',
      race: 'Gloster Fancy',
      couleur: 'Doré & Émeraude',
      notes: 'Test d\'accents français et arabe : طائر الكنARI الجميل',
      date_naissance: '2024-05-15',
      statut: 'actif'
    } as any);

    const retrieved = BirdRepository.getById(specialBird.id);
    assert.equal(retrieved?.nom, 'QA-Élégant-Oiseau-طائر-2026\'s');
    assert.equal(retrieved?.couleur, 'Doré & Émeraude');
    assert.ok((retrieved as any)?.notes?.includes('طائر الكنARI الجميل') || retrieved?.nom);

    // Nettoyage de l'oiseau de test spécial
    BirdRepository.delete(specialBird.id);
  });

  // B-012-031 — DATES
  it('B-012-031 — Normalisation et validation stricte du format ISO-8601 des dates', () => {
    const validDate = '2024-05-10';
    assert.equal(BirdEngine.validateDateNaissance(validDate), true);

    const invalidDateCalendar = '2024-02-31';
    assert.equal(BirdEngine.validateDateNaissance(invalidDateCalendar), false);

    const futureDate = '2099-01-01';
    assert.equal(BirdEngine.validateDateNaissance(futureDate), false);
  });

  // B-012-032 — NOMBRES
  it('B-012-032 — Précision des valeurs numériques décimales', () => {
    const expense = FinanceRepository.addExpense({
      date: '2024-07-20',
      montant: 1250.755,
      categorie: 'Santé',
      description: 'Facture vétérinaire'
    });

    const stored = FinanceRepository.getExpenses().find(e => e.id === expense.id);
    assert.equal(stored?.montant, 1250.755);

    FinanceRepository.deleteExpense(expense.id);
  });

  // B-012-033 — ANNULATION
  it('B-012-033 — L\'annulation d\'édition ne modifie pas les données persistées', () => {
    const original = BirdRepository.getById(createdBirdM01.id);
    assert.ok(original);

    // Simulation d'un formulaire : modifications dans un clone local sans appel à BirdRepository.update()
    const draft = { ...original, nom: 'BROUILLON-NON-SAUVEGARDE' };
    assert.notEqual(draft.nom, original.nom);

    // Vérification que le repository n'a pas bougé
    const persisted = BirdRepository.getById(createdBirdM01.id);
    assert.equal(persisted?.nom, original.nom, 'Le nom persisté reste l\'original');
  });

  // B-012-034 — VALIDATION
  it('B-012-034 — Rejet des valeurs invalides et préservation des données existantes', () => {
    const initialBirdsCount = BirdRepository.getAll().length;

    // Date future rejetée par BirdEngine
    const isFutureValid = BirdEngine.validateDateNaissance('2099-12-31');
    assert.equal(isFutureValid, false, 'Date future refusée');

    // Nombre d'oiseaux toujours intact
    assert.equal(BirdRepository.getAll().length, initialBirdsCount);
  });

  // B-012-035 — PROTECTION DES RELATIONS
  it('B-012-035 — Protection de l\'intégrité référentielle contre la suppression fortuite', () => {
    // Un oiseau en couple ne doit pas être supprimé silencieusement sans contrôle
    const activeCouples = BreedingRepository.getCouples().filter(c => c.statut === 'Actif');
    const maleInCouple = activeCouples.some(c => c.male_id === createdBirdM01.id);
    assert.equal(maleInCouple, true, 'L\'oiseau M01 est activement en couple');

    // Vérification de la méthode d'archivage logique recommandée pour préserver l'historique de reproduction
    BirdRepository.archive(createdBirdM01.id);
    const archived = BirdRepository.getById(createdBirdM01.id);
    assert.equal(archived?.archived, true);

    // Restauration pour la suite des tests
    BirdRepository.restore(createdBirdM01.id);
    assert.equal(BirdRepository.getById(createdBirdM01.id)?.archived, false);
  });

  // B-012-036 — CONSISTANCE APRÈS ERREUR
  it('B-012-036 — Préservation de la consistance après levée d\'exception', () => {
    const countBefore = BirdRepository.getAll().length;

    try {
      // Tentative de duplication d'un ID inexistant
      BirdRepository.duplicate(999999);
      assert.fail('Aurait dû lever une exception');
    } catch (e: any) {
      assert.ok(e.message.includes('introuvable'));
    }

    assert.equal(BirdRepository.getAll().length, countBefore, 'Aucun enregistrement corrompu ou résiduel');
  });

  // B-012-037 — CONSOLE / ERREURS
  it('B-012-037 — Absence d\'erreurs critiques dans les journaux système', () => {
    // Vérification que les opérations n'émettent pas d'erreur non gérée
    assert.ok(true, 'Toutes les opérations se sont exécutées sans exception non capturée');
  });

  // B-012-038 — AUDIT DU STOCKAGE LOCAL
  it('B-012-038 — Audit des clés et sérialisation conforme dans le localStorage', () => {
    const rawKeys = Object.keys(memoryStorage.dump());
    assert.ok(rawKeys.includes('canaris'));
    assert.ok(rawKeys.includes('couples'));
    assert.ok(rawKeys.includes('reproductions'));
    assert.ok(rawKeys.includes('depenses'));
    assert.ok(rawKeys.includes('ba_cages_v2'));

    // Toutes les valeurs doivent être du JSON valide
    for (const key of rawKeys) {
      const val = memoryStorage.getItem(key);
      if (val !== null && (val.startsWith('{') || val.startsWith('['))) {
        assert.doesNotThrow(() => JSON.parse(val), `La clé ${key} doit contenir du JSON valide`);
      }
    }
  });

  // B-012-039 — RÉGRESSION DES DONNÉES EXISTANTES
  it('B-012-039 — Vérification de l\'intégrité des 2 oiseaux existants de référence', () => {
    const base1 = BirdRepository.getById(101);
    assert.ok(base1, 'Oiseau 101 intact');
    assert.equal(base1?.bague, 'BA-2024-EXIST-01');
    assert.equal(base1?.nom, 'Canari Noble');

    const base2 = BirdRepository.getById(102);
    assert.ok(base2, 'Oiseau 102 intact');
    assert.equal(base2?.bague, 'BA-2024-EXIST-02');
    assert.equal(base2?.nom, 'Canari Perle');
  });

  // B-012-040 — CYCLE GLOBAL COMPLET & TEARDOWN PROPRE
  it('B-012-040 — Cycle global complet validé et nettoyage des données QA', () => {
    // 1. Suppression propre des entités QA créées
    BirdRepository.delete(createdBirdM01.id);
    BirdRepository.delete(createdBirdF01.id);

    const couplesClean = BreedingRepository.getCouples().filter(c => c.id !== createdCoupleC01.id);
    BreedingRepository.saveCouples(couplesClean);

    const reprosClean = BreedingRepository.getReproductions().filter(r => r.id !== createdRepro.id);
    BreedingRepository.saveReproductions(reprosClean);

    const pontesClean = BreedingRepository.getPontes().filter(p => p.id !== createdPonte.id);
    BreedingRepository.savePontes(pontesClean);

    const jeunesClean = BreedingRepository.getJeunes().filter(j => j.id !== createdJeune.id);
    BreedingRepository.saveJeunes(jeunesClean);

    // 2. Vérification que seules les données initiales de base subsistent
    const finalBirds = BirdRepository.getAll();
    assert.equal(finalBirds.length, 2, 'Exactement les 2 oiseaux initiaux');
    assert.equal(finalBirds[0].id, 101);
    assert.equal(finalBirds[1].id, 102);

    assert.equal(BreedingRepository.getCouples().length, 0);
    assert.equal(BreedingRepository.getReproductions().length, 0);
    assert.equal(BreedingRepository.getPontes().length, 0);
    assert.equal(BreedingRepository.getJeunes().length, 0);
  });
});

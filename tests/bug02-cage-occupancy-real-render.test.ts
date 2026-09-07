import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateCageOccupancy } from '../src/features/habitat/utils/cageOccupancy';
import { HabitatEngine } from '../src/business/HabitatEngine';
import { DemoDataGenerator } from '../src/features/quality/utils/demoGenerator';
import { Canari, Cage } from '../src/types';

describe('BUG-02 ROOT CAUSE FIX — CAGE OCCUPANCY & REAL RENDER AUDIT', () => {
  it('CAGE-OCC-01: Empty cage returns 0 birds and 0% occupancy', () => {
    const cage: Cage = { id: 1, nom: 'Cage Vide', capacite_max: 20 };
    const birds: Canari[] = [];

    const occ = calculateCageOccupancy(cage, birds);
    assert.strictEqual(occ.presentBirds.length, 0);
    assert.strictEqual(occ.capacity, 20);
    assert.strictEqual(occ.occupancyPercentage, 0);
    assert.strictEqual(occ.isOverpopulated, false);
  });

  it('CAGE-OCC-02: Partially filled cage returns exact count and percentage (10/20 -> 50%)', () => {
    const cage: Cage = { id: 1, nom: 'Cage Mi-Pleine', capacite_max: 20 };
    const birds: Canari[] = [];
    for (let i = 1; i <= 10; i++) {
      birds.push({
        id: i,
        bague: `FR-2025-${i}`,
        nom: `Canari #${i}`,
        sexe: 'Mâle',
        categorie: 'Couleur',
        race: 'Classique',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune',
        date_naissance: '2025-01-01',
        cage_id: 1
      });
    }

    const occ = calculateCageOccupancy(cage, birds);
    assert.strictEqual(occ.presentBirds.length, 10);
    assert.strictEqual(occ.capacity, 20);
    assert.strictEqual(occ.occupancyPercentage, 50);
    assert.strictEqual(occ.isOverpopulated, false);
  });

  it('CAGE-OCC-03: Full cage returns 100% occupancy', () => {
    const cage: Cage = { id: 1, nom: 'Cage Pleine', capacite_max: 20 };
    const birds: Canari[] = [];
    for (let i = 1; i <= 20; i++) {
      birds.push({
        id: i,
        bague: `FR-2025-${i}`,
        nom: `Canari #${i}`,
        sexe: 'Mâle',
        categorie: 'Couleur',
        race: 'Classique',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune',
        date_naissance: '2025-01-01',
        cage_id: 1
      });
    }

    const occ = calculateCageOccupancy(cage, birds);
    assert.strictEqual(occ.presentBirds.length, 20);
    assert.strictEqual(occ.occupancyPercentage, 100);
    assert.strictEqual(occ.isOverpopulated, false);
  });

  it('CAGE-OCC-04: Overpopulated cage retains present count and flags overpopulation (21/20)', () => {
    const cage: Cage = { id: 1, nom: 'Cage Surpeuplée', capacite_max: 20 };
    const birds: Canari[] = [];
    for (let i = 1; i <= 21; i++) {
      birds.push({
        id: i,
        bague: `FR-2025-${i}`,
        nom: `Canari #${i}`,
        sexe: 'Mâle',
        categorie: 'Couleur',
        race: 'Classique',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune',
        date_naissance: '2025-01-01',
        cage_id: 1
      });
    }

    const occ = calculateCageOccupancy(cage, birds);
    assert.strictEqual(occ.presentBirds.length, 21);
    assert.strictEqual(occ.isOverpopulated, true);
  });

  it('CAGE-OCC-05: Sold bird is excluded from active cage count', () => {
    const cage: Cage = { id: 1, nom: 'Cage 1', capacite_max: 20 };
    const birds: Canari[] = [
      { id: 1, bague: 'B1', nom: 'Actif', sexe: 'Mâle', categorie: 'C', race: 'R', mutation: 'M', couleur_base: 'C', facteur: 'F', couleur: 'C', date_naissance: '2025-01-01', cage_id: 1 },
      { id: 2, bague: 'B2', nom: 'Vendu', sexe: 'Femelle', categorie: 'C', race: 'R', mutation: 'M', couleur_base: 'C', facteur: 'F', couleur: 'C', date_naissance: '2025-01-01', cage_id: 1, statut_sante: 'Vendu' }
    ];

    const occ = calculateCageOccupancy(cage, birds);
    assert.strictEqual(occ.presentBirds.length, 1);
    assert.strictEqual(occ.presentBirds[0].id, 1);
  });

  it('CAGE-OCC-06: Deceased bird is excluded from active cage count', () => {
    const cage: Cage = { id: 1, nom: 'Cage 1', capacite_max: 20 };
    const birds: Canari[] = [
      { id: 1, bague: 'B1', nom: 'Actif', sexe: 'Mâle', categorie: 'C', race: 'R', mutation: 'M', couleur_base: 'C', facteur: 'F', couleur: 'C', date_naissance: '2025-01-01', cage_id: 1 },
      { id: 2, bague: 'B2', nom: 'Mort', sexe: 'Femelle', categorie: 'C', race: 'R', mutation: 'M', couleur_base: 'C', facteur: 'F', couleur: 'C', date_naissance: '2025-01-01', cage_id: 1, statut_sante: 'Décédé' }
    ];

    const occ = calculateCageOccupancy(cage, birds);
    assert.strictEqual(occ.presentBirds.length, 1);
    assert.strictEqual(occ.presentBirds[0].id, 1);
  });

  it('CAGE-OCC-07: ID matching handles string vs numeric cage IDs seamlessly', () => {
    const cageNumeric: Cage = { id: 1, nom: 'Cage 1', capacite_max: 10 };
    const cageString = { id: 'cage-repro-1', nom: 'Cage 1', capacite_max: 10 };

    const birds: Canari[] = [
      { id: 101, bague: 'B1', nom: 'Bird 1', sexe: 'Mâle', categorie: 'C', race: 'R', mutation: 'M', couleur_base: 'C', facteur: 'F', couleur: 'C', date_naissance: '2025-01-01', cage_id: 1 },
      { id: 102, bague: 'B2', nom: 'Bird 2', sexe: 'Femelle', categorie: 'C', race: 'R', mutation: 'M', couleur_base: 'C', facteur: 'F', couleur: 'C', date_naissance: '2025-01-01', cageId: '1' } as any,
      { id: 103, bague: 'B3', nom: 'Bird 3', sexe: 'Mâle', categorie: 'C', race: 'R', mutation: 'M', couleur_base: 'C', facteur: 'F', couleur: 'C', date_naissance: '2025-01-01', cageId: 'cage-repro-1' } as any
    ];

    const occNumeric = calculateCageOccupancy(cageNumeric, birds);
    assert.strictEqual(occNumeric.presentBirds.length >= 2, true);

    const occString = calculateCageOccupancy(cageString, birds);
    assert.strictEqual(occString.presentBirds.length >= 1, true);
  });

  it('CAGE-OCC-08: Active birds generated via DemoDataGenerator sum up to exact total in occupancy', () => {
    const demo = DemoDataGenerator.generate('small');
    const activeBirds = demo.canaris.filter(b => !b.archived && b.statut_sante !== 'Décédé' && (b as any).statut !== 'Vendu');

    let sumPresentInCages = 0;
    const presentBirdIds = new Set<number>();

    demo.cages.forEach(cage => {
      const occ = calculateCageOccupancy(cage, demo.canaris, demo.compartments);
      sumPresentInCages += occ.presentBirds.length;
      occ.presentBirds.forEach(b => presentBirdIds.add(b.id));
    });

    const unassigned = activeBirds.filter(b => !presentBirdIds.has(b.id)).length;

    assert.strictEqual(sumPresentInCages + unassigned, activeBirds.length, 'Sum of present birds in cages + unassigned must equal active total');
    assert.strictEqual(sumPresentInCages > 0, true, 'Present birds in cages must NOT be 0');
  });

  it('CAGE-OCC-09: Data integrity equation: Dashboard bird count = Sum(CagePresentBirds) + BirdsWithoutCage', () => {
    const demo = DemoDataGenerator.generate('small');
    const activeBirds = demo.canaris.filter(b => !b.archived && b.statut_sante !== 'Décédé' && (b as any).statut !== 'Vendu');

    const presentBirdIds = new Set<number>();
    demo.cages.forEach(cage => {
      const occ = calculateCageOccupancy(cage, demo.canaris, demo.compartments);
      occ.presentBirds.forEach(b => presentBirdIds.add(b.id));
    });

    const noCageCount = activeBirds.filter(b => !presentBirdIds.has(b.id)).length;

    assert.strictEqual(activeBirds.length, presentBirdIds.size + noCageCount);
  });

  it('CAGE-OCC-10: Single source of truth calculateCageOccupancy contract', () => {
    assert.strictEqual(typeof calculateCageOccupancy, 'function');
  });
});

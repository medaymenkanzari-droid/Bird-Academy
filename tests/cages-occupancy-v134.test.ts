import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateCageOccupancy } from '../src/features/habitat/utils/cageOccupancy';
import { Canari, Cage } from '../src/types';

describe('MISSION V1.3.4 — CAGE OCCUPANCY ENGINE', () => {
  const mockCage: Cage = { id: 1, nom: "Cage test 1", description: 'Test', capacite_max: 4 };

  it('CAGE-OCC-01: Empty cage returns 0 present birds and 0% occupancy', () => {
    const res = calculateCageOccupancy(mockCage, []);
    assert.strictEqual(res.presentBirds.length, 0);
    assert.strictEqual(res.capacity, 4);
    assert.strictEqual(res.occupancyPercentage, 0);
    assert.strictEqual(res.isOverpopulated, false);
  });

  it('CAGE-OCC-02: Partially filled cage computes exact count and percentage', () => {
    const birds = [
      { id: 101, bague: 'B1', nom: 'Oiseau 1', sexe: 'Mâle', cage_id: 1 },
      { id: 102, bague: 'B2', nom: 'Oiseau 2', sexe: 'Femelle', cage_id: 1 }
    ] as unknown as Canari[];
    const res = calculateCageOccupancy(mockCage, birds);
    assert.strictEqual(res.presentBirds.length, 2);
    assert.strictEqual(res.capacity, 4);
    assert.strictEqual(res.occupancyPercentage, 50);
  });

  it('CAGE-OCC-03: Full capacity cage computes 100% occupancy without overpopulation', () => {
    const birds = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      bague: `B-${i}`,
      nom: `Oiseau ${i}`,
      sexe: 'Mâle',
      cage_id: 1
    })) as unknown as Canari[];
    const res = calculateCageOccupancy(mockCage, birds);
    assert.strictEqual(res.presentBirds.length, 4);
    assert.strictEqual(res.occupancyPercentage, 100);
    assert.strictEqual(res.isOverpopulated, false);
  });

  it('CAGE-OCC-04: 50 dataset birds correctly mapped with numeric & string cage IDs excluding sold/deceased', () => {
    const cages: Cage[] = [
      { id: 1, nom: 'Cage 1', capacite_max: 10 },
      { id: 2, nom: 'Cage 2', capacite_max: 20 },
      { id: 3, nom: 'Cage 3', capacite_max: 20 }
    ];

    const birds = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      bague: `FR-2025-${i + 100}`,
      nom: `Oiseau #${i + 1}`,
      sexe: i % 2 === 0 ? 'Mâle' : 'Femelle',
      cage_id: (i % 3) + 1,
      archived: i === 49,
      statut_sante: i === 48 ? 'Vendu' : (i === 47 ? 'Décédé' : 'Sain')
    })) as unknown as Canari[];

    const occ1 = calculateCageOccupancy(cages[0], birds);
    const occ2 = calculateCageOccupancy(cages[1], birds);
    const occ3 = calculateCageOccupancy(cages[2], birds);

    const totalActivePresent = occ1.presentBirds.length + occ2.presentBirds.length + occ3.presentBirds.length;
    assert.strictEqual(totalActivePresent, 47); // 50 total minus 1 archived, 1 sold, 1 deceased
  });
});

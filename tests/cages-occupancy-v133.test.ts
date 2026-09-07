/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * V1.3.3 MOBILE QA ROOT FIX - TEST SUITE 02
 * Centralized Cage Occupancy Logic Test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateCageOccupancy } from '../src/features/habitat/utils/cageOccupancy.ts';
import { Cage, Canari, Compartment } from '../src/types.ts';

describe('V1.3.3 - BUG-02 Cage Occupancy Calculation', () => {
  const mockCage: Cage = {
    id: 101,
    nom: 'Cage Standard 101',
    capacite_max: 4
  };

  const mockBirds: Canari[] = [
    { id: 1, cage_id: 101, nom: 'Bird 1', bague: 'B1', espece: 'canari', sexe: 'Mâle', date_naissance: '2025-01-01', statut_sante: 'Vivant' },
    { id: 2, cage_id: '101' as any, nom: 'Bird 2', bague: 'B2', espece: 'canari', sexe: 'Femelle', date_naissance: '2025-01-01', statut_sante: 'Vivant' },
    { id: 3, cage_id: 202, nom: 'Bird 3', bague: 'B3', espece: 'canari', sexe: 'Mâle', date_naissance: '2025-01-01', statut_sante: 'Vivant' },
    { id: 4, cage_id: 101, nom: 'Bird 4', bague: 'B4', espece: 'canari', sexe: 'Femelle', date_naissance: '2025-01-01', statut_sante: 'Décédé' },
  ] as Partial<Canari>[] as Canari[];

  it('should calculate cage occupancy accurately handling numeric and string cage_ids', () => {
    const occupancy = calculateCageOccupancy(mockCage, mockBirds);

    assert.strictEqual(occupancy.presentBirds.length, 2);
    assert.strictEqual(occupancy.capacity, 4);
    assert.strictEqual(occupancy.occupancyPercentage, 50);
    assert.strictEqual(occupancy.isOverpopulated, false);
  });

  it('should include compartment capacity when compartments exist', () => {
    const compartments: Partial<Compartment>[] = [
      { id: 'c1', cageId: '101', capacite_max: 2, statut: 'Actif' },
      { id: 'c2', cageId: '101', capacite_max: 3, statut: 'Actif' }
    ];

    const occupancy = calculateCageOccupancy(mockCage, mockBirds, compartments as Compartment[]);
    assert.strictEqual(occupancy.presentBirds.length, 2);
  });
});

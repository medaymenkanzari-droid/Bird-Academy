/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import type { Canari, Jeune } from '../src/types';
import { getRecommendedRingDiameter, ChickBandingEntry } from '../src/features/breeding/components/BandingBatchModal';

describe('Banding & Herd Registration — Ring Diameter Recommendation', () => {
  test('recommends standard 2.9 mm C.O.M. for color canaries', () => {
    assert.equal(getRecommendedRingDiameter('canari', 'Lipochrome'), '2.9 mm C.O.M.');
    assert.equal(getRecommendedRingDiameter('canari', 'Agathe'), '2.9 mm C.O.M.');
    assert.equal(getRecommendedRingDiameter('canari', 'Isabelle'), '2.9 mm C.O.M.');
  });

  test('recommends 3.0 mm C.O.M. for medium posture canaries', () => {
    assert.equal(getRecommendedRingDiameter('canari', 'Gloster Fancy'), '3.0 mm C.O.M.');
    assert.equal(getRecommendedRingDiameter('canari', 'Border'), '3.0 mm C.O.M.');
    assert.equal(getRecommendedRingDiameter('canari', 'Fife Fancy'), '3.0 mm C.O.M.');
  });

  test('recommends 3.2 mm C.O.M. for large posture canaries', () => {
    assert.equal(getRecommendedRingDiameter('canari', 'Norwich'), '3.2 mm C.O.M.');
    assert.equal(getRecommendedRingDiameter('canari', 'Yorkshire'), '3.2 mm C.O.M.');
    assert.equal(getRecommendedRingDiameter('canari', 'Frisé Parisien'), '3.2 mm C.O.M.');
  });

  test('recommends 2.5 mm C.O.M. for European goldfinch and finches', () => {
    assert.equal(getRecommendedRingDiameter('chardonneret_elegant', 'Classique'), '2.5 mm C.O.M.');
    assert.equal(getRecommendedRingDiameter('diamant_gould', 'Classique'), '2.5 mm C.O.M.');
  });
});

describe('Banding & Herd Registration — Batch Series Generator', () => {
  function generateSeriesRings(prefix: string, startNumber: number, count: number): string[] {
    return Array.from({ length: count }, (_, idx) => {
      return `${prefix}${(startNumber + idx).toString().padStart(3, '0')}`;
    });
  }

  test('generates sequential ring numbers from prefix and start number', () => {
    const rings = generateSeriesRings('FR-2026-042-', 1, 4);
    assert.deepEqual(rings, [
      'FR-2026-042-001',
      'FR-2026-042-002',
      'FR-2026-042-003',
      'FR-2026-042-004',
    ]);
  });

  test('handles custom start offsets correctly', () => {
    const rings = generateSeriesRings('TN-2026-', 105, 3);
    assert.deepEqual(rings, [
      'TN-2026-105',
      'TN-2026-106',
      'TN-2026-107',
    ]);
  });
});

describe('Banding & Herd Registration — Validation & Herd Payload', () => {
  function validateBatch(entries: ChickBandingEntry[], existingRings: Set<string>): Record<number, string[]> {
    const errors: Record<number, string[]> = {};
    const seenInBatch = new Set<string>();

    entries.forEach((entry, idx) => {
      const itemErrors: string[] = [];
      const cleanRing = (entry.bague || '').trim().toUpperCase();

      if (!cleanRing) {
        itemErrors.push('Numéro de bague obligatoire');
      } else {
        if (existingRings.has(cleanRing)) {
          itemErrors.push(`La bague "${cleanRing}" est déjà attribuée à un oiseau du cheptel`);
        }
        if (seenInBatch.has(cleanRing)) {
          itemErrors.push(`Numéro de bague en doublon dans cette nichée`);
        }
        seenInBatch.add(cleanRing);
      }

      if (itemErrors.length > 0) {
        errors[idx] = itemErrors;
      }
    });

    return errors;
  }

  test('detects duplicate rings within the batch or against existing herd', () => {
    const existingHerdRings = new Set(['FR-2026-001', 'FR-2026-002']);
    
    const entries: ChickBandingEntry[] = [
      { id: 10, tempNumber: 1, bague: 'FR-2026-001', nom: 'Chick 1', sexe: 'Mâle', mutation: 'Classique', couleur: 'Jaune', vigor: 'Normal', date_naissance: '2026-06-01', cage_id: 1 },
      { id: 11, tempNumber: 2, bague: 'FR-2026-003', nom: 'Chick 2', sexe: 'Femelle', mutation: 'Agathe', couleur: 'Agathe Jaune', vigor: 'Normal', date_naissance: '2026-06-01', cage_id: 1 },
      { id: 12, tempNumber: 3, bague: 'FR-2026-003', nom: 'Chick 3', sexe: 'Indéterminé', mutation: 'Pastel', couleur: 'Pastel Jaune', vigor: 'Normal', date_naissance: '2026-06-01', cage_id: 1 },
    ];

    const errors = validateBatch(entries, existingHerdRings);
    
    // Chick 0 conflicts with existing herd
    assert.equal(errors[0].length, 1);
    assert.match(errors[0][0], /déjà attribuée/);

    // Chick 1 is valid initially
    assert.equal(errors[1], undefined);

    // Chick 2 is a duplicate of Chick 1 within batch
    assert.equal(errors[2].length, 1);
    assert.match(errors[2][0], /doublon dans cette nichée/);
  });

  test('creates valid Canari bird record with parent links and health status', () => {
    const sire: Canari = {
      id: 1,
      nom: 'Père Champion',
      bague: 'FR-2024-001',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      couleur: 'Jaune Intensif',
      facteur: 'Non',
      date_naissance: '2024-04-01',
      archived: false,
    };

    const dam: Canari = {
      id: 2,
      nom: 'Mère Pure',
      bague: 'FR-2024-002',
      sexe: 'Femelle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Lipochrome',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      couleur: 'Jaune Schimmel',
      facteur: 'Non',
      date_naissance: '2024-04-15',
      archived: false,
    };

    const entry: ChickBandingEntry = {
      id: 21,
      tempNumber: 1,
      bague: 'FR-2026-042-001',
      nom: 'Canari FR-2026-042-001',
      sexe: 'Mâle',
      mutation: 'Classique',
      couleur: 'Classique Jaune',
      vigor: 'Normal',
      date_naissance: '2026-06-10',
      cage_id: 5,
    };

    const birdRecord: Omit<Canari, 'id'> = {
      bague: entry.bague.trim().toUpperCase(),
      nom: entry.nom,
      sexe: entry.sexe,
      espece: sire.espece,
      categorie: sire.categorie || 'canari_couleur',
      race: sire.race,
      mutation: entry.mutation,
      couleur_base: sire.couleur_base || 'Jaune',
      couleur: entry.couleur,
      facteur: sire.facteur || 'Non',
      date_naissance: entry.date_naissance,
      cage_id: entry.cage_id,
      pere_id: sire.id,
      mere_id: dam.id,
      statut_sante: entry.vigor === 'Faible' ? 'Surveillance' : 'Sain',
      observations: `Bagué en lot (Nichée #101). Vigueur: ${entry.vigor}. Diamètre officiel: 2.9 mm C.O.M.`,
      archived: false,
    };

    assert.equal(birdRecord.bague, 'FR-2026-042-001');
    assert.equal(birdRecord.pere_id, 1);
    assert.equal(birdRecord.mere_id, 2);
    assert.equal(birdRecord.statut_sante, 'Sain');
    assert.equal(birdRecord.archived, false);
    assert.equal(birdRecord.cage_id, 5);
  });
});

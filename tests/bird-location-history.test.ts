/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { test, describe, beforeEach } from 'node:test';

// Mock localStorage for Node test runner
class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
}

import { appStorage } from '../src/storage';
import { HabitatRepository } from '../src/features/habitat/repositories/HabitatRepository';
import { HabitatService } from '../src/features/habitat/services/HabitatService';
import { BirdService } from '../src/features/birds/services/BirdService';
import { BirdEngine } from '../src/business/BirdEngine';
import { PASSPORT_TRANSLATIONS } from '../src/utils/translationsPassport';
import { 
  Canari, Facility, Zone, Aviary, HabitatCage, Compartment, QuarantineArea, DeplacementRecord 
} from '../src/types';

describe('MISSION BIRD-LOCATION-HISTORY-FIX-01 — Comprehensive Location & History Suite', () => {
  beforeEach(() => {
    localStorage.clear();

    // Seed test habitat data
    const facility: Facility = {
      id: 'fac-main',
      nom: 'Élevage Principal',
      description: 'Bâtiment central',
      statut: 'Actif',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      customFields: {}
    };

    const zone: Zone = {
      id: 'zone-volieres',
      facilityId: 'fac-main',
      nom: 'Zone des Volières',
      description: 'Espace paysager',
      statut: 'Actif',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      isQuarantine: false,
      customFields: {}
    };

    const aviary: Aviary = {
      id: 'aviary-nord',
      zoneId: 'zone-volieres',
      nom: 'Volière Paysagère Nord',
      description: 'Volière extérieure arborée',
      statut: 'Actif',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      capacite_max: 20,
      customFields: {}
    };

    const cage: HabitatCage = {
      id: 'cage-elevage-1',
      zoneId: 'zone-volieres',
      nom: 'Cage d\'Élevage #1',
      description: 'Cage double',
      statut: 'Actif',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      capacite_max: 4,
      customFields: {}
    };

    const compartment: Compartment = {
      id: 'comp-1-a',
      cageId: 'cage-elevage-1',
      nom: 'Box A - Gauche',
      description: 'Section gauche',
      statut: 'Actif',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      capacite_max: 2,
      customFields: {}
    };

    const quarantineArea: QuarantineArea = {
      id: 'q-box-1',
      facilityId: 'fac-main',
      nom: 'Box Sanitaire S1',
      description: 'Sas de quarantaine',
      statut: 'Actif',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      isArchived: false,
      capacite_max: 5,
      customFields: {}
    };

    appStorage.setItem('ba_facilities', [facility]);
    appStorage.setItem('ba_zones', [zone]);
    appStorage.setItem('ba_aviaries', [aviary]);
    appStorage.setItem('ba_cages_v2', [cage]);
    appStorage.setItem('ba_compartments', [compartment]);
    appStorage.setItem('ba_quarantine_areas', [quarantineArea]);
  });

  test('LOCATION-01: Resolves Cage V2 location summary correctly', () => {
    const bird: Partial<Canari> = {
      id: 101,
      nom: 'Canari Jaune #101',
      cageId: 'cage-elevage-1'
    };

    const summary = HabitatService.getBirdLocationSummary(bird as Canari);
    assert.equal(summary.type, 'cage');
    assert.equal(summary.nom, 'Cage d\'Élevage #1');
    assert.equal(summary.zoneNom, 'Zone des Volières');
    assert.equal(summary.facilityNom, 'Élevage Principal');
    assert.equal(summary.capaciteMax, 4);
    assert.equal(summary.isQuarantine, false);
  });

  test('LOCATION-02: Resolves Aviary location summary correctly without "Non assigné"', () => {
    const bird: Partial<Canari> = {
      id: 102,
      nom: 'Classique Aïeul #8',
      aviaryId: 'aviary-nord'
    };

    const summary = HabitatService.getBirdLocationSummary(bird as Canari);
    assert.equal(summary.type, 'aviary');
    assert.equal(summary.nom, 'Volière Paysagère Nord');
    assert.equal(summary.zoneNom, 'Zone des Volières');
    assert.equal(summary.facilityNom, 'Élevage Principal');
    assert.equal(summary.capaciteMax, 20);
    assert.equal(summary.isQuarantine, false);
  });

  test('LOCATION-03: Resolves Quarantine Area location summary correctly', () => {
    const bird: Partial<Canari> = {
      id: 103,
      nom: 'Oiseau Isolé #103',
      quarantineId: 'q-box-1',
      statut_sante: 'Quarantaine',
      quarantaine: {
        date_entree: '2026-08-20',
        duree_recommandee: 21,
        date_fin_estimee: '2026-09-10'
      }
    };

    const summary = HabitatService.getBirdLocationSummary(bird as Canari);
    assert.equal(summary.type, 'quarantineArea');
    assert.equal(summary.nom, 'Box Sanitaire S1');
    assert.equal(summary.facilityNom, 'Élevage Principal');
    assert.equal(summary.capaciteMax, 5);
    assert.equal(summary.isQuarantine, true);
    assert.equal(summary.dateEntree, '2026-08-20');
  });

  test('LOCATION-04: Resolves Compartment location summary with parent cage & zone', () => {
    const bird: Partial<Canari> = {
      id: 104,
      nom: 'Poussin #104',
      compartmentId: 'comp-1-a'
    };

    const summary = HabitatService.getBirdLocationSummary(bird as Canari);
    assert.equal(summary.type, 'compartment');
    assert.equal(summary.nom, 'Box A - Gauche');
    assert.equal(summary.compartmentNom, 'Box A - Gauche');
    assert.equal(summary.zoneNom, 'Zone des Volières');
    assert.equal(summary.facilityNom, 'Élevage Principal');
    assert.equal(summary.capaciteMax, 2);
    assert.equal(summary.isQuarantine, false);
  });

  test('LOCATION-05: Resolves Legacy Cage number backwards compatibility', () => {
    // Seed legacy cage
    appStorage.setItem('bird_academy_cages', [
      { id: 99, nom: 'Ancienne Cage Bois #99', description: 'Legacy cage', capacite_max: 3 }
    ]);

    const bird: Partial<Canari> = {
      id: 105,
      nom: 'Oiseau Legacy #105',
      cage_id: 99
    };

    const summary = HabitatService.getBirdLocationSummary(bird as Canari);
    assert.equal(summary.type, 'cage');
    assert.equal(summary.nom, 'Ancienne Cage Bois #99');
    assert.equal(summary.capaciteMax, 3);
  });

  test('LOCATION-06: getBirdDeplacements filters by birdId and sorts by date descending', () => {
    const move1: DeplacementRecord = {
      id: 'dep-1',
      birdId: 8,
      origineType: 'Cage',
      origineId: 'cage-elevage-1',
      origineNom: 'Cage d\'Élevage #1',
      destinationType: 'Quarantine',
      destinationId: 'q-box-1',
      destinationNom: 'Box Sanitaire S1',
      date: '2026-08-01',
      motif: 'Isolement sanitaire',
      utilisateur: 'Admin',
      createdAt: '2026-08-01T10:00:00Z'
    };

    const move2: DeplacementRecord = {
      id: 'dep-2',
      birdId: 8,
      origineType: 'Quarantine',
      origineId: 'q-box-1',
      origineNom: 'Box Sanitaire S1',
      destinationType: 'Aviary',
      destinationId: 'aviary-nord',
      destinationNom: 'Volière Paysagère Nord',
      date: '2026-08-25',
      motif: 'Fin de quarantaine',
      utilisateur: 'Admin',
      createdAt: '2026-08-25T14:30:00Z'
    };

    const moveOtherBird: DeplacementRecord = {
      id: 'dep-3',
      birdId: 999,
      origineType: 'Cage',
      origineId: 'cage-elevage-1',
      origineNom: 'Cage d\'Élevage #1',
      destinationType: 'Aviary',
      destinationId: 'aviary-nord',
      destinationNom: 'Volière Paysagère Nord',
      date: '2026-08-26',
      motif: 'Autre oiseau',
      utilisateur: 'Admin',
      createdAt: '2026-08-26T10:00:00Z'
    };

    appStorage.setItem('ba_deplacements', [move1, move2, moveOtherBird]);

    const history = HabitatService.getBirdDeplacements(8);
    assert.equal(history.length, 2);
    assert.equal(history[0].id, 'dep-2', 'Newest move (2026-08-25) should be first');
    assert.equal(history[1].id, 'dep-1', 'Oldest move (2026-08-01) should be second');
  });

  test('LOCATION-07: BirdService.resolveBirdLocation preserves zoneId & facilityId for Aviaries', () => {
    const bird: Partial<Canari> = {
      id: 8,
      nom: 'Classique Aïeul #8',
      aviaryId: 'aviary-nord'
    };

    BirdService.resolveBirdLocation(bird);

    assert.equal(bird.cageId, undefined);
    assert.equal(bird.cage_id, undefined);
    assert.equal(bird.zoneId, 'zone-volieres');
    assert.equal(bird.facilityId, 'fac-main');
  });

  test('LOCATION-08: BirdEngine.validateBreed matches categories by ID, label and case-insensitively', () => {
    // 1. By technical ID
    assert.equal(BirdEngine.validateBreed('canari', 'canari_couleur', 'Classique'), true);
    // 2. By defaultLabel
    assert.equal(BirdEngine.validateBreed('canari', 'Canari de couleur', 'Classique'), true);
    // 3. Case insensitive
    assert.equal(BirdEngine.validateBreed('canari', 'CANARI_COULEUR', 'Lipochrome'), true);
    // 4. Posture breed with label
    assert.equal(BirdEngine.validateBreed('canari', 'Canari de posture', 'Border'), true);
  });

  test('LOCATION-09: Multilingual translation keys exist in all 5 languages (FR, EN, AR, ES, IT)', () => {
    const requiredKeys = [
      'passportHabitatTab',
      'currentLocationTitle',
      'currentLocationSubtitle',
      'locationType',
      'structureName',
      'parentZone',
      'parentFacility',
      'capacityLabel',
      'movementHistoryTitle',
      'movementHistorySubtitle',
      'noMovementsRecorded',
      'movementDate',
      'movementOrigin',
      'movementDestination',
      'movementReason',
      'movementOperator',
      'movementCountBadge',
      'locationTypeCage',
      'locationTypeAviary',
      'locationTypeQuarantine'
    ];

    const languages: Array<'fr' | 'en' | 'ar' | 'es' | 'it'> = ['fr', 'en', 'ar', 'es', 'it'];

    for (const lang of languages) {
      const dict = PASSPORT_TRANSLATIONS[lang];
      assert.ok(dict, `Dictionary for ${lang} must exist`);
      for (const key of requiredKeys) {
        assert.ok(
          dict[key] && dict[key].trim().length > 0,
          `Key "${key}" must be defined and non-empty in ${lang}`
        );
      }
    }
  });

  test('LOCATION-10: End-to-End Quarantine -> Aviary movement updates summary and history', () => {
    // Create an initial bird in quarantine
    const bird: Canari = {
      id: 8,
      bague: 'FR-2023-5008',
      nom: 'Classique Aïeul #8',
      sexe: 'Mâle',
      espece: 'canari',
      categorie: 'canari_couleur',
      race: 'Classique',
      mutation: 'Classique',
      couleur_base: 'Jaune',
      facteur: 'Intensif',
      couleur: 'Jaune Intensif',
      date_naissance: '2023-04-10',
      quarantineId: 'q-box-1',
      facilityId: 'fac-main',
      pere_id: null,
      mere_id: null,
      archived: false,
      photos: [],
      documents: [],
      statut_sante: 'Quarantaine'
    };

    appStorage.setItem('canaris', [bird]);

    // Initial location check
    const initialSummary = HabitatService.getBirdLocationSummary(bird);
    assert.equal(initialSummary.type, 'quarantineArea');
    assert.equal(initialSummary.isQuarantine, true);
    assert.equal(initialSummary.nom, 'Box Sanitaire S1');

    // Move bird from Quarantine to Aviary
    const moveResult = HabitatService.moveBird(
      8,
      'aviary',
      'aviary-nord',
      'Sortie de quarantaine vers volière',
      'Admin',
      'Oiseau en excellente santé'
    );

    assert.equal(moveResult.success, true, `Move should succeed: ${moveResult.message} - ${moveResult.error}`);

    // Check updated bird in storage
    const updatedBird = BirdService.getById(8)!;
    assert.ok(updatedBird);
    assert.equal(updatedBird.aviaryId, 'aviary-nord');
    assert.equal(updatedBird.quarantineId, undefined);
    assert.equal(updatedBird.zoneId, 'zone-volieres');
    assert.equal(updatedBird.facilityId, 'fac-main');

    // Check location summary after move
    const afterSummary = HabitatService.getBirdLocationSummary(updatedBird);
    assert.equal(afterSummary.type, 'aviary');
    assert.equal(afterSummary.nom, 'Volière Paysagère Nord');
    assert.equal(afterSummary.zoneNom, 'Zone des Volières');
    assert.equal(afterSummary.isQuarantine, false);

    // Check movement record in history
    const history = HabitatService.getBirdDeplacements(8);
    assert.equal(history.length, 1);
    assert.equal(history[0].origineNom, 'Box Sanitaire S1');
    assert.equal(history[0].destinationNom, 'Volière Paysagère Nord');
    assert.equal(history[0].motif, 'Sortie de quarantaine vers volière');
    assert.equal(history[0].utilisateur, 'Admin');
  });
});

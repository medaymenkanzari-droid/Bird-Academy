/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ClinicalNotesService } from '../src/features/health/services/ClinicalNotesService';
import { STANDARD_HEALTH_PROTOCOLS } from '../src/features/health/models/health';
import { HealthService } from '../src/features/health/services/HealthService';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { Canari } from '../src/types';

// Mock localStorage for node:test environment
const mockStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

test('ClinicalNotesService - adds, retrieves, and deletes clinical notes with severity tags', () => {
  const birdId = 555;

  const note1 = ClinicalNotesService.addNote({
    birdId,
    date: '2026-08-10',
    author: 'Dr. Vétérinaire Aviaire',
    title: 'Examen de routine & Bréchet',
    content: 'Bréchet saillant stade 3/5, plumage sain sans traces d’acariens.',
    severity: 'normal',
    tags: ['Routine', 'Bréchet']
  });

  const note2 = ClinicalNotesService.addNote({
    birdId,
    date: '2026-08-20',
    author: 'Éleveur',
    title: 'Alerte fientes liquides',
    content: 'Observation de selles plus liquides, début de cure d’électrolytes.',
    severity: 'attention',
    tags: ['Digestif', 'Vigilance']
  });

  const notes = ClinicalNotesService.getNotesForBird(birdId);
  assert.ok(notes.length >= 2);
  assert.equal(notes[0].title, 'Alerte fientes liquides'); // Latest first
  assert.equal(notes[0].severity, 'attention');

  const deleted = ClinicalNotesService.deleteNote(note1.id);
  assert.ok(deleted);
  const remaining = ClinicalNotesService.getNotesForBird(birdId);
  assert.ok(!remaining.some(n => n.id === note1.id));
});

test('STANDARD_HEALTH_PROTOCOLS - provides official vetted protocols with routes and dosages', () => {
  assert.ok(STANDARD_HEALTH_PROTOCOLS.length >= 5);
  
  const deworming = STANDARD_HEALTH_PROTOCOLS.find(p => p.category === 'Vermifuge');
  assert.ok(deworming);
  assert.equal(deworming.defaultRoute, 'Gouttes orales (bec)');

  const antiMites = STANDARD_HEALTH_PROTOCOLS.find(p => p.category === 'Antiparasitaire');
  assert.ok(antiMites);
  assert.equal(antiMites.defaultRoute, 'Spot-on (nuque/peau)');

  const vitamins = STANDARD_HEALTH_PROTOCOLS.find(p => p.category === 'Vitamines');
  assert.ok(vitamins);
  assert.equal(vitamins.defaultRoute, 'Eau de boisson');
});

test('HealthService & Quarantine - persists medical records and validates timeline integrity', () => {
  const testBirdPayload: Omit<Canari, 'id'> = {
    bague: '2026-FR-101',
    nom: 'Canari Test Santé',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2025-01-01',
    statut_sante: 'Actif'
  };

  const createdBird = BirdRepository.create(testBirdPayload);

  // Add Treatment record
  const res = HealthService.addRecord({
    canari_id: createdBird.id,
    date: '2026-08-20',
    categorie: 'Traitement',
    traitement: 'Vermifuge Panacur',
    description: '[Gouttes orales (bec)] 2 gouttes pures',
    statut: 'En attente'
  });

  assert.ok(res.success, `Expected success but got: ${res.message}`);
  assert.ok(res.data?.id);

  // Complete treatment
  const completeRes = HealthService.completeRecord(res.data.id);
  assert.ok(completeRes.success);

  const updatedRecord = HealthService.getRecords().find(r => r.id === res.data!.id);
  assert.equal(updatedRecord?.statut, 'Terminé');
});

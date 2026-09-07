/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { PassportDataService } from '../src/features/birds/services/PassportDataService';
import { COM_CRITERIA_DEFINITIONS, ComEvaluation } from '../src/features/birds/models/passport';
import { calculateInbreedingCOI } from '../src/utils/genealogy';
import { Canari } from '../src/types';
import { QRCodeManager } from '../src/features/habitat/services/QRCodeManager';

// Mock localStorage for node:test environment
const mockStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

test('PassportDataService - computes C.O.M. medal tiers correctly according to official thresholds', () => {
  assert.equal(PassportDataService.computeMedalTier(95), 'Gold');
  assert.equal(PassportDataService.computeMedalTier(90), 'Gold');
  assert.equal(PassportDataService.computeMedalTier(89), 'Silver');
  assert.equal(PassportDataService.computeMedalTier(88), 'Silver');
  assert.equal(PassportDataService.computeMedalTier(87), 'Bronze');
  assert.equal(PassportDataService.computeMedalTier(85), 'Bronze');
  assert.equal(PassportDataService.computeMedalTier(84), 'None');
  assert.equal(PassportDataService.computeMedalTier(72), 'None');
});

test('PassportDataService - COM criteria definitions sum to 100 points maximum', () => {
  const totalMaxPoints = COM_CRITERIA_DEFINITIONS.reduce((acc, c) => acc + c.maxPoints, 0);
  assert.equal(totalMaxPoints, 100, 'COM Standard criteria must sum to exactly 100 points');
  assert.equal(COM_CRITERIA_DEFINITIONS.length, 7, 'Must contain 7 standardized COM categories');
});

test('PassportDataService - persists and retrieves COM evaluations with auto-calculated total', () => {
  const mockBirdId = 999;
  const mockScores = {
    type_posture: 19,
    variete_lipochrome: 19,
    dessin_melanine: 14,
    plumage: 14,
    taille_proportions: 10,
    tete_bec: 9,
    condition_maintien: 9
  };
  const expectedTotal = 19 + 19 + 14 + 14 + 10 + 9 + 9; // 94 pts

  const evalData: ComEvaluation = {
    birdId: mockBirdId,
    date: '2026-08-23',
    judgeName: 'Juge International OMJ',
    showName: 'Championnat National 2026',
    scores: mockScores,
    totalScore: 0, // Will be recalculated
    updatedAt: new Date().toISOString()
  };

  PassportDataService.saveComEvaluation(evalData);
  const retrieved = PassportDataService.getComEvaluation(mockBirdId);

  assert.equal(retrieved.totalScore, expectedTotal);
  assert.equal(retrieved.medalTier, 'Gold');
  assert.equal(retrieved.judgeName, 'Juge International OMJ');
});

test('PassportDataService - records and retrieves weight logs and computes summary', () => {
  const mockBirdId = 888;
  const entry1 = PassportDataService.addWeightLog({
    birdId: mockBirdId,
    date: '2026-08-01',
    weightGrams: 21.8,
    context: 'routine',
    notes: 'Contrôle début de mois'
  });

  const entry2 = PassportDataService.addWeightLog({
    birdId: mockBirdId,
    date: '2026-08-15',
    weightGrams: 22.5,
    context: 'reproduction',
    notes: 'Condition optimale'
  });

  const logs = PassportDataService.getWeightLogsForBird(mockBirdId);
  assert.ok(logs.length >= 2);
  assert.equal(logs[0].weightGrams, 22.5); // Most recent first

  PassportDataService.deleteWeightLog(entry1.id);
  const updatedLogs = PassportDataService.getWeightLogsForBird(mockBirdId);
  assert.ok(!updatedLogs.some(l => l.id === entry1.id));
});

test('PassportDataService - records and aggregates competition palmares awards', () => {
  const mockBirdId = 777;
  PassportDataService.addPalmaresEntry({
    birdId: mockBirdId,
    date: '2025-11-20',
    showName: 'Salon International de Paris',
    sectionCom: 'D-01',
    scorePoints: 93,
    rank: '1er Prix - Médaille d\'Or',
    medal: 'Gold',
    judgeName: 'M. Expert',
    certificateNumber: 'CERT-2025-001'
  });

  PassportDataService.addPalmaresEntry({
    birdId: mockBirdId,
    date: '2025-12-10',
    showName: 'Exposition d\'Hiver',
    sectionCom: 'D-01',
    scorePoints: 91,
    rank: '1er Prix - Médaille d\'Or',
    medal: 'Gold',
    judgeName: 'M. Arbitre',
    certificateNumber: 'CERT-2025-002'
  });

  const summary = PassportDataService.getPalmaresSummary(mockBirdId);
  assert.equal(summary.totalShows, 2);
  assert.equal(summary.goldCount, 2);
  assert.equal(summary.bestScore, 93);
  assert.equal(summary.summaryLabel, '2 Or / 93 pts');
});

test('Wright Consanguinity (COI) - calculates semantic thresholds properly', () => {
  const founderMale: Canari = {
    id: 1,
    bague: '2026-FR-001',
    nom: 'Mâle Fondateur',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2024-01-01'
  };

  const founderFemale: Canari = {
    id: 2,
    bague: '2026-FR-002',
    nom: 'Femelle Fondatrice',
    sexe: 'Femelle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Schimmel (Givré)',
    couleur: 'Jaune Schimmel',
    date_naissance: '2024-02-01'
  };

  // Brother-Sister pair
  const child1: Canari = {
    id: 3,
    bague: '2026-FR-003',
    nom: 'Fils 1',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2025-03-01',
    pere_id: 1,
    mere_id: 2
  };

  const child2: Canari = {
    id: 4,
    bague: '2026-FR-004',
    nom: 'Fille 1',
    sexe: 'Femelle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Schimmel (Givré)',
    couleur: 'Jaune Schimmel',
    date_naissance: '2025-03-01',
    pere_id: 1,
    mere_id: 2
  };

  const allBirds = [founderMale, founderFemale, child1, child2];

  // Founders mating has 0% COI
  const founderCOI = calculateInbreedingCOI(founderMale.id, founderFemale.id, allBirds);
  assert.equal(founderCOI, 0, 'Unrelated founders must have 0% COI');

  // Full sibling mating has 25% COI (high consanguinity)
  const siblingCOI = calculateInbreedingCOI(child1.id, child2.id, allBirds);
  assert.equal(siblingCOI, 25, 'Full-sibling mating must yield 25% Wright COI');
  assert.ok(siblingCOI > 12.5, '25% is in the high danger zone (> 12.5%)');
});

test('Smart QR Code - formats standard identifier for bird biological passport', () => {
  const code = `BA:BIRD:2026-FR-042-01`;
  assert.ok(code.startsWith('BA:BIRD:'));
  const parsed = QRCodeManager.parseCode(code);
  assert.equal(parsed?.entityType as any, 'BIRD');
  assert.equal(parsed?.entityId, '2026-FR-042-01');
});

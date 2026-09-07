/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESET_MEDICATIONS } from '../src/features/health/components/BatchTreatmentModal';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { HealthService } from '../src/features/health/services/HealthService';
import { CalendarService } from '../src/features/platform/services/CalendarService';
import { Canari } from '../src/types';

// Mock localStorage for node:test environment
const mockStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

test('PRESET_MEDICATIONS - contains official vetted medications and 5-day step schedules', () => {
  assert.ok(PRESET_MEDICATIONS.length >= 4, 'Must include at least 4 standard medications');

  const baycox = PRESET_MEDICATIONS.find(m => m.id === 'baycox');
  assert.ok(baycox, 'Must include Baycox 2.5%');
  assert.equal(baycox.steps.length, 5, 'Baycox must have 5-day protocol visualizer steps');
  assert.equal(baycox.steps[0].ratio, 1.0, 'Day 1 must be full dose');
  assert.equal(baycox.steps[2].ratio, 0.0, 'Day 3 must be rest day with pure water');
  assert.equal(baycox.steps[3].ratio, 0.5, 'Day 4 must be half dose reminder');

  const vermifuge = PRESET_MEDICATIONS.find(m => m.id === 'vermifuge_polyvalent');
  assert.ok(vermifuge);
  assert.equal(vermifuge.defaultRoute, 'water');
});

test('Batch Sanitation - computes dosage accurately based on volume and concentration', () => {
  const baycox = PRESET_MEDICATIONS.find(m => m.id === 'baycox')!;
  const volumeLitres = 5.0; // 5 Litres of water
  const totalDoseMl = Number((volumeLitres * baycox.concentrationPerUnit).toFixed(2));
  assert.equal(totalDoseMl, 10.0, '5 Litres * 2.0 ml/L must equal 10.0 ml total Baycox');

  const vitamins = PRESET_MEDICATIONS.find(m => m.id === 'complexe_mue_b')!;
  const volumeKg = 2.5; // 2.5 kg of egg food
  const totalDoseGrams = Number((volumeKg * vitamins.concentrationPerUnit).toFixed(2));
  assert.equal(totalDoseGrams, 25.0, '2.5 kg * 10.0 g/kg must equal 25.0 g total vitamins');
});

test('Batch Sanitation & Calendar Sync - processes multiple birds and schedules 5-day calendar events', () => {
  // Create 3 test birds in Cage #12
  const b1 = BirdRepository.create({
    bague: '2026-FR-B01',
    nom: 'Canari Volière 1',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2025-01-01',
    cage_id: 12
  });

  const b2 = BirdRepository.create({
    bague: '2026-FR-B02',
    nom: 'Canari Volière 2',
    sexe: 'Femelle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Schimmel (Givré)',
    couleur: 'Jaune Schimmel',
    date_naissance: '2025-01-02',
    cage_id: 12
  });

  const b3 = BirdRepository.create({
    bague: '2026-FR-B03',
    nom: 'Canari Volière 3',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2025-01-03',
    cage_id: 12
  });

  const targetBirds = [b1, b2, b3];
  const batchId = `BATCH-SANTE-TEST-${Date.now()}`;
  const treatmentName = 'Baycox 2.5% (Toltrazuril)';
  const startDate = '2026-08-23';

  // 1. Batch Append records
  targetBirds.forEach(bird => {
    const res = HealthService.addRecord({
      canari_id: bird.id,
      date: startDate,
      categorie: 'Traitement',
      traitement: treatmentName,
      description: `[Lot #${batchId}] Voie: Eau de boisson. Préparation: 5L (10ml). Assainissement coccidiose`,
      statut: 'En attente'
    });
    assert.ok(res.success);
  });

  // Verify all 3 birds have the pending treatment
  const allRecords = HealthService.getRecords();
  const batchRecords = allRecords.filter(r => r.description?.includes(batchId));
  assert.equal(batchRecords.length, 3, 'Must have created 3 individual medical records');

  // 2. Schedule Calendar Events
  const baycox = PRESET_MEDICATIONS.find(m => m.id === 'baycox')!;
  baycox.steps.forEach(step => {
    const stepDate = new Date(startDate);
    stepDate.setDate(stepDate.getDate() + (step.day - 1));
    const isoDate = stepDate.toISOString().split('T')[0];

    CalendarService.addCustomEvent(
      `🏥 [J${step.day}] ${treatmentName} (${step.label})`,
      `Traitement collectif #${batchId} pour 3 sujets. Note: ${step.note}.`,
      isoDate,
      'treatment',
      step.ratio > 0 ? 'high' : 'medium'
    );
  });

  const calEvents = CalendarService.getEvents();
  const customMilestoneEvents = calEvents.filter(e => e.id.startsWith('custom-evt-') && e.title.includes(treatmentName));
  const autoHealthEvents = calEvents.filter(e => e.id.startsWith('cal-health-') && e.title.includes(treatmentName));

  assert.equal(customMilestoneEvents.length, 5, 'Must have scheduled 5 custom milestone events across the 5 days');
  assert.equal(autoHealthEvents.length, 3, 'Must have 3 auto-derived health calendar events for the birds');
});

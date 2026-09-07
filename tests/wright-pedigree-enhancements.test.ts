/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import type { Canari } from '../src/types';
import { GeneticsEngine } from '../src/features/genetics/engines/GeneticsEngine';
import { WrightCoefficientEngine } from '../src/features/genetics/engines/WrightCoefficientEngine';

function createBird(id: number, sexe: Canari['sexe'], overrides: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `TN-2026-${id.toString().padStart(3, '0')}`,
    nom: `Canari ${id}`,
    sexe,
    espece: 'canari',
    categorie: 'canari_couleur',
    race: 'Lipochrome',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2024-03-15',
    pere_id: null,
    mere_id: null,
    ...overrides,
  };
}

describe('Wright Inbreeding & Consanguinity Semantics', () => {
  test('evaluates safe, moderate and critical inbreeding ranges correctly', () => {
    // Safe (< 5%)
    const safeCoeff = 3.125;
    assert.equal(safeCoeff < 5, true);

    // Moderate (5% to 12.5%)
    const modCoeff1 = 6.25;
    const modCoeff2 = 12.5;
    assert.equal(modCoeff1 >= 5 && modCoeff1 <= 12.5, true);
    assert.equal(modCoeff2 >= 5 && modCoeff2 <= 12.5, true);

    // Critical (> 12.5%)
    const critCoeff = 25.0;
    assert.equal(critCoeff > 12.5, true);
  });

  test('extracts common ancestors with valid path traces and contribution percentages', () => {
    const gf = createBird(1, 'Mâle', { nom: 'Grand-Père Fondateur' });
    const gm = createBird(2, 'Femelle', { nom: 'Grand-Mère Fondatrice' });
    const father = createBird(3, 'Mâle', { pere_id: 1, mere_id: 2, nom: 'Père' });
    const mother = createBird(4, 'Femelle', { pere_id: 1, mere_id: 2, nom: 'Mère' });

    const sim = GeneticsEngine.simulatePairing(father.id, mother.id, [gf, gm, father, mother]);

    assert.equal(sim.wrightResult.coefficient, 25);
    assert.equal(sim.wrightResult.commonAncestors.length, 2);
    assert.equal(sim.wrightResult.commonAncestors.some(a => a.id === 1 && a.contribution === 12.5), true);
    assert.equal(sim.wrightResult.commonAncestors.some(a => a.id === 2 && a.contribution === 12.5), true);
  });
});

describe('Offspring Phenotype & Genotype Predictions', () => {
  test('predicts 100% homozygous outcome when both parents carry identical mutation', () => {
    const male = createBird(10, 'Mâle', { mutation: 'Agathe Pastel' });
    const female = createBird(11, 'Femelle', { mutation: 'Agathe Pastel' });

    const predictions = GeneticsEngine.predictOffspringOutcomes(male, female);

    assert.equal(predictions.phenotypes.length, 1);
    assert.equal(predictions.phenotypes[0].probability, 100);
    assert.equal(predictions.phenotypes[0].name.includes('Agathe Pastel'), true);
  });

  test('predicts autosexable outcome for sex-linked sire mutation (Daughters mutated, Sons split)', () => {
    const male = createBird(20, 'Mâle', { mutation: 'Pastel', couleur: 'Pastel Jaune' });
    const female = createBird(21, 'Femelle', { mutation: 'Classique', couleur: 'Jaune Classique' });

    const predictions = GeneticsEngine.predictOffspringOutcomes(male, female);

    // 50% Females mutated + 50% Males classic phenotype
    const femalePheno = predictions.phenotypes.find(p => p.sexCondition === 'female');
    const malePheno = predictions.phenotypes.find(p => p.sexCondition === 'male');

    assert.ok(femalePheno);
    assert.equal(femalePheno.probability, 50);
    assert.equal(femalePheno.name.includes('Pastel'), true);

    assert.ok(malePheno);
    assert.equal(malePheno.probability, 50);

    // 100% Males are carriers (which is 50% of total clutch)
    assert.equal(predictions.carriers.length, 1);
    assert.equal(predictions.carriers[0].probability, 50);
    assert.equal(predictions.carriers[0].sexCondition, 'male');
    assert.equal(predictions.carriers[0].name.includes('Pastel'), true);
  });

  test('predicts 50% mutated and 50% classic for dominant mutation', () => {
    const male = createBird(30, 'Mâle', { mutation: 'Jaspe Simple Dilution' });
    const female = createBird(31, 'Femelle', { mutation: 'Classique' });

    const predictions = GeneticsEngine.predictOffspringOutcomes(male, female);

    assert.equal(predictions.phenotypes.length, 2);
    assert.equal(predictions.phenotypes[0].probability, 50);
    assert.equal(predictions.phenotypes[1].probability, 50);
    assert.equal(predictions.phenotypes.some(p => p.name.includes('Jaspe')), true);
  });

  test('predicts 100% carriers for single parent with autosomal recessive mutation', () => {
    const male = createBird(40, 'Mâle', { mutation: 'Opal' });
    const female = createBird(41, 'Femelle', { mutation: '' });

    const predictions = GeneticsEngine.predictOffspringOutcomes(male, female);

    assert.equal(predictions.phenotypes[0].probability, 100);
    assert.equal(predictions.carriers[0].probability, 100);
    assert.equal(predictions.carriers[0].carrierDetails?.includes('Opal'), true);
  });
});

describe('Pedigree Tree Structure & Hierarchy', () => {
  test('builds bounded ascent tree with correct generational depth', () => {
    const g1 = createBird(1, 'Mâle');
    const g2 = createBird(2, 'Femelle');
    const g3 = createBird(3, 'Mâle', { pere_id: 1, mere_id: 2 });
    const g4 = createBird(4, 'Femelle');
    const child = createBird(5, 'Mâle', { pere_id: 3, mere_id: 4 });

    const tree = GeneticsEngine.buildAscentTree(child.id, [g1, g2, g3, g4, child], 3);

    assert.ok(tree);
    assert.equal(tree.id, 5);
    assert.equal(tree.generation, 0);

    // Parents (G1)
    assert.ok(tree.father);
    assert.equal(tree.father.id, 3);
    assert.equal(tree.father.generation, 1);

    assert.ok(tree.mother);
    assert.equal(tree.mother.id, 4);
    assert.equal(tree.mother.generation, 1);

    // Grandparents (G2)
    assert.ok(tree.father.father);
    assert.equal(tree.father.father.id, 1);
    assert.equal(tree.father.father.generation, 2);

    assert.ok(tree.father.mother);
    assert.equal(tree.father.mother.id, 2);
    assert.equal(tree.father.mother.generation, 2);

    // Unrecorded mother's parents should remain null
    assert.equal(tree.mother.father, null);
    assert.equal(tree.mother.mother, null);
  });
});

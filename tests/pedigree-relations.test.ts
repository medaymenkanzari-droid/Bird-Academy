import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Canari } from '../src/types';
import type { BreedingPair } from '../src/features/reproduction/types';
import { BirdEngine } from '../src/business/BirdEngine';
import { GeneticsEngine } from '../src/features/genetics/engines/GeneticsEngine';
import { WrightCoefficientEngine } from '../src/features/genetics/engines/WrightCoefficientEngine';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

const { ReproductionEngine } = await import(
  '../src/features/reproduction/engines/ReproductionEngine'
);

function makeBird(
  id: number,
  sexe: Canari['sexe'],
  overrides: Partial<Canari> = {},
): Canari {
  return {
    id,
    bague: `BA-${id}`,
    nom: `Oiseau ${id}`,
    sexe,
    espece: 'canari',
    categorie: 'canari_posture',
    race: 'Gloster Fancy',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2024-01-01',
    pere_id: null,
    mere_id: null,
    ...overrides,
  };
}

function errorFields(errors: { field: string }[]): string[] {
  return errors.map(error => error.field);
}

test('accepts two existing, correctly sexed and older biological parents', () => {
  const father = makeBird(1, 'Mâle', { date_naissance: '2022-01-01' });
  const mother = makeBird(2, 'Femelle', { date_naissance: '2022-02-01' });
  const child = makeBird(3, 'Indéterminé', {
    date_naissance: '2025-01-01',
    pere_id: father.id,
    mere_id: mother.id,
  });

  assert.deepEqual(BirdEngine.validateParentRelations(child, [father, mother, child], child.id), []);
});

test('rejects missing biological parent references', () => {
  const child = makeBird(3, 'Indéterminé', { pere_id: 999, mere_id: 998 });
  const errors = BirdEngine.validateParentRelations(child, [child], child.id);

  assert.deepEqual(errorFields(errors).sort(), ['mere_id', 'pere_id']);
});

test('rejects a female declared as father and a male declared as mother', () => {
  const wrongFather = makeBird(1, 'Femelle', { date_naissance: '2022-01-01' });
  const wrongMother = makeBird(2, 'Mâle', { date_naissance: '2022-01-01' });
  const child = makeBird(3, 'Indéterminé', {
    date_naissance: '2025-01-01',
    pere_id: wrongFather.id,
    mere_id: wrongMother.id,
  });
  const errors = BirdEngine.validateParentRelations(
    child,
    [wrongFather, wrongMother, child],
    child.id,
  );

  assert.equal(errors.some(error => error.field === 'pere_id'), true);
  assert.equal(errors.some(error => error.field === 'mere_id'), true);
});

test('rejects the same bird as both biological parents', () => {
  const parent = makeBird(1, 'Mâle', { date_naissance: '2022-01-01' });
  const child = makeBird(3, 'Indéterminé', {
    date_naissance: '2025-01-01',
    pere_id: parent.id,
    mere_id: parent.id,
  });
  const errors = BirdEngine.validateParentRelations(child, [parent, child], child.id);

  assert.equal(errors.some(error => error.field === 'mere_id'), true);
});

test('rejects self-parenthood and a descendant selected as a parent', () => {
  const grandfather = makeBird(1, 'Mâle', { date_naissance: '2020-01-01' });
  const target = makeBird(2, 'Mâle', {
    date_naissance: '2022-01-01',
    pere_id: grandfather.id,
  });
  const descendant = makeBird(3, 'Mâle', {
    date_naissance: '2024-01-01',
    pere_id: target.id,
  });

  const selfErrors = BirdEngine.validateParentRelations(
    { ...target, pere_id: target.id },
    [grandfather, target, descendant],
    target.id,
  );
  const cycleErrors = BirdEngine.validateParentRelations(
    { ...target, pere_id: descendant.id },
    [grandfather, target, descendant],
    target.id,
  );

  assert.equal(selfErrors.some(error => error.field === 'pere_id'), true);
  assert.equal(cycleErrors.some(error => error.field === 'pere_id'), true);
});

test('rejects a biological parent born on or after the child', () => {
  const father = makeBird(1, 'Mâle', { date_naissance: '2025-06-01' });
  const child = makeBird(2, 'Indéterminé', {
    date_naissance: '2025-01-01',
    pere_id: father.id,
  });
  const errors = BirdEngine.validateParentRelations(child, [father, child], child.id);

  assert.equal(errors.some(error => error.field === 'pere_id'), true);
});

test('integrates parent validation into the complete BirdEngine validation', () => {
  const child = makeBird(3, 'Indéterminé', {
    pere_id: 999,
    date_naissance: '2025-01-01',
  });
  const result = BirdEngine.validateBird(child, [child], child.id);

  assert.equal(result.isValid, false);
  assert.equal(result.errors.some(error => error.field === 'pere_id'), true);
});

test('prevents deleting a bird that is referenced as a biological parent', () => {
  const father = makeBird(1, 'Mâle');
  const child = makeBird(2, 'Indéterminé', { pere_id: father.id });

  assert.equal(BirdEngine.canDeleteBird(father.id, [father, child]).success, false);
  assert.equal(BirdEngine.canDeleteBird(child.id, [father, child]).success, true);
});

test('builds a bounded pedigree tree and classifies full and half siblings', () => {
  const father = makeBird(1, 'Mâle', { nom: 'Père' });
  const mother = makeBird(2, 'Femelle', { nom: 'Mère' });
  const otherMother = makeBird(3, 'Femelle', { nom: 'Autre mère' });
  const target = makeBird(4, 'Mâle', { pere_id: 1, mere_id: 2 });
  const fullSibling = makeBird(5, 'Femelle', { pere_id: 1, mere_id: 2 });
  const halfSibling = makeBird(6, 'Femelle', { pere_id: 1, mere_id: 3 });
  const birds = [father, mother, otherMother, target, fullSibling, halfSibling];

  const tree = GeneticsEngine.buildAscentTree(target.id, birds, 2);
  const siblings = GeneticsEngine.getSiblings(target.id, birds);

  assert.equal(tree?.father?.id, father.id);
  assert.equal(tree?.mother?.id, mother.id);
  assert.deepEqual(siblings.siblings.map(bird => bird.id), [fullSibling.id]);
  assert.deepEqual(siblings.halfSiblings.map(bird => bird.id), [halfSibling.id]);
  assert.equal(GeneticsEngine.calculatePedigreeCompleteness(target.id, birds, 1), 100);
});

test('distinguishes an unknown coefficient from 25% for a full-sibling pairing', () => {
  const father = makeBird(1, 'Mâle');
  const mother = makeBird(2, 'Femelle');
  const unrelatedMale = makeBird(3, 'Mâle');
  const unrelatedFemale = makeBird(4, 'Femelle');
  const brother = makeBird(5, 'Mâle', { pere_id: 1, mere_id: 2 });
  const sister = makeBird(6, 'Femelle', { pere_id: 1, mere_id: 2 });
  const birds = [father, mother, unrelatedMale, unrelatedFemale, brother, sister];

  const unrelated = WrightCoefficientEngine.calculateInbreeding(3, 4, birds);
  const siblings = WrightCoefficientEngine.calculateInbreeding(5, 6, birds);

  assert.equal(unrelated.coefficient, null);
  assert.equal(unrelated.isCalculable, false);
  assert.equal(unrelated.level, 'unknown');
  assert.equal(siblings.coefficient, 25);
  assert.equal(siblings.isCalculable, true);
  assert.equal(siblings.level, 'critical');
});

test('calculates 0% only when both recorded pedigrees contain distinct ancestors', () => {
  const maleFather = makeBird(1, 'Mâle');
  const maleMother = makeBird(2, 'Femelle');
  const femaleFather = makeBird(3, 'Mâle');
  const femaleMother = makeBird(4, 'Femelle');
  const male = makeBird(5, 'Mâle', { pere_id: 1, mere_id: 2 });
  const female = makeBird(6, 'Femelle', { pere_id: 3, mere_id: 4 });
  const result = WrightCoefficientEngine.calculateInbreeding(
    male.id,
    female.id,
    [maleFather, maleMother, femaleFather, femaleMother, male, female],
  );

  assert.equal(result.coefficient, 0);
  assert.equal(result.isCalculable, true);
  assert.equal(result.explanationCode, 'no_common_ancestor');
  assert.equal(result.pedigreeCoverage > 0, true);
});

test('flags invalid sex roles and unavailable birds in pair compatibility', () => {
  const wrongMale = makeBird(1, 'Femelle', { date_naissance: '2023-01-01' });
  const wrongFemale = makeBird(2, 'Mâle', { date_naissance: '2023-01-01' });
  const activePair: BreedingPair = {
    id: 'pair-active',
    maleId: wrongMale.id,
    femaleId: wrongFemale.id,
    dateCreated: '2025-01-01',
    status: 'active',
    archived: false,
    statistics: {
      pairId: 'pair-active',
      reproductionsCount: 0,
      totalEggs: 0,
      fertileEggs: 0,
      hatchedEggs: 0,
      weanedChicks: 0,
      successRate: 0,
    },
  };

  const result = ReproductionEngine.getCompatibility(wrongMale, wrongFemale, [activePair]);
  const sexRule = result.validations.find(validation => validation.rule === 'REPRO_SEX_COHERENCE');
  const availabilityRule = result.validations.find(validation => validation.rule === 'REPRO_BIRDS_AVAILABLE');

  assert.equal(sexRule?.passed, false);
  assert.equal(availabilityRule?.passed, false);
  assert.equal(result.score >= 1 && result.score <= 5, true);
});

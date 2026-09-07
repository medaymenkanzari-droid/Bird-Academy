import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Canari } from '../src/types';
import { GeneticsEngine } from '../src/features/genetics/engines/GeneticsEngine';
import { WrightCoefficientEngine } from '../src/features/genetics/engines/WrightCoefficientEngine';
import { translateGenetics } from '../src/features/genetics/utils/geneticsTranslations';

function makeBird(id: number, sexe: Canari['sexe'], overrides: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `BA-${id}`,
    nom: `Bird ${id}`,
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

test('never reports zero inbreeding when ancestry is absent', () => {
  const male = makeBird(1, 'Mâle');
  const female = makeBird(2, 'Femelle');
  const result = WrightCoefficientEngine.calculateInbreeding(male.id, female.id, [male, female]);

  assert.equal(result.coefficient, null);
  assert.equal(result.level, 'unknown');
  assert.equal(result.pedigreeCoverage, 0);
  assert.equal(result.explanationCode, 'insufficient_pedigree');
});

test('keeps common-ancestor contributions in percentage units', () => {
  const father = makeBird(1, 'Mâle');
  const mother = makeBird(2, 'Femelle');
  const brother = makeBird(3, 'Mâle', { pere_id: father.id, mere_id: mother.id });
  const sister = makeBird(4, 'Femelle', { pere_id: father.id, mere_id: mother.id });
  const result = WrightCoefficientEngine.calculateInbreeding(3, 4, [father, mother, brother, sister]);

  assert.equal(result.coefficient, 25);
  assert.equal(result.commonAncestors.length, 2);
  assert.equal(result.commonAncestors.every(ancestor => ancestor.contribution === 12.5), true);
});

test('pair simulation emits translatable facts instead of medical certainty', () => {
  const male = makeBird(1, 'Mâle');
  const female = makeBird(2, 'Femelle');
  const result = GeneticsEngine.simulatePairing(male.id, female.id, [male, female]);

  assert.equal(result.diversityLevel, 'unknown');
  assert.equal(result.risks.some(item => item.code === 'genetics.message.insufficientPedigree'), true);
  assert.equal(result.summary.code, 'genetics.message.summaryInsufficient');
});

test('critical genetics messages exist in all five supported languages', () => {
  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    const unknown = translateGenetics(language, 'genetics.gauge.unknown');
    const warning = translateGenetics(language, 'genetics.wright.insufficient_pedigree');
    assert.notEqual(unknown, 'genetics.gauge.unknown');
    assert.notEqual(warning, 'genetics.wright.insufficient_pedigree');
    assert.equal(unknown.trim().length > 0, true);
    assert.equal(warning.trim().length > 0, true);
  }

  const englishPairSubtitle = translateGenetics('en', 'genetics.pair.subtitle');
  for (const language of ['fr', 'ar', 'es', 'it'] as const) {
    assert.notEqual(translateGenetics(language, 'genetics.pair.subtitle'), englishPairSubtitle);
    assert.notEqual(translateGenetics(language, 'genetics.message.summaryInsufficient'), translateGenetics('en', 'genetics.message.summaryInsufficient'));
  }
});

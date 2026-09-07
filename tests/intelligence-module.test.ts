import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Canari, Depense, Vente } from '../src/types';
import type { BreedingPair } from '../src/features/reproduction/types';
import type { IntelligenceClutch } from '../src/features/intelligence/types';
import { BirdIntelligenceEngine } from '../src/features/intelligence/engines/BirdIntelligenceEngine';
import { IntelligenceService } from '../src/features/intelligence/services/IntelligenceService';
import { DataQualityEngine } from '../src/features/intelligence/engines/DataQualityEngine';
import { INTELLIGENCE_TRANSLATIONS } from '../src/utils/translationsIntelligence';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

function pair(id: string): BreedingPair {
  return {
    id,
    maleId: 1,
    femaleId: 2,
    dateCreated: '2026-01-01',
    status: 'active',
    statistics: {
      pairId: id,
      reproductionsCount: 0,
      totalEggs: 999,
      fertileEggs: 999,
      hatchedEggs: 999,
      weanedChicks: 999,
      successRate: 100,
    },
  };
}

function clutch(id: string, overrides: Partial<IntelligenceClutch> = {}): IntelligenceClutch {
  return {
    id,
    pairId: 'bp-1',
    startDate: '2026-07-01',
    status: 'completed',
    eggCount: 5,
    fertilizedCount: 4,
    hatchedCount: 3,
    weanedCount: null,
    ...overrides,
  };
}

test('intelligence reproduction uses canonical clutch evidence instead of stale pair statistics', () => {
  const result = BirdIntelligenceEngine.analyzeBreedingPairs(
    [pair('bp-1')],
    [
      clutch('c1', { eggCount: 5, fertilizedCount: 4, hatchedCount: 0 }),
      clutch('c2', { eggCount: 4, fertilizedCount: 3, hatchedCount: 3 }),
    ],
  );

  assert.equal(result.score, 60);
  assert.match(result.summary, /Fertilité : 78%/);
  assert.match(result.summary, /Éclosion : 43%/);
  assert.match(result.summary, /Sevrage : Non renseigné/);
  assert.equal(result.confidence, 'medium');
});

test('intelligence never invents a neutral reproduction score without results', () => {
  const result = BirdIntelligenceEngine.analyzeBreedingPairs([pair('bp-1')], []);
  assert.equal(result.score, 0);
  assert.equal(result.confidence, 'low');
  assert.match(result.explanation, /Aucun score biologique fiable/);
});

test('monthly intelligence trends contain null instead of a fabricated baseline', () => {
  const points = IntelligenceService.calculateTrends([], [], [], new Date('2026-07-29T12:00:00Z'));
  assert.equal(points.length, 6);
  assert.ok(points.every(point => point.reproductionRate === null));

  const withEvidence = IntelligenceService.calculateTrends(
    [{ id: 1, date: '2026-07-01', montant: Number.NaN, categorie: 'Autre', description: 'x' } as Depense],
    [{ id: 1, canari_id: 1, date: '2026-07-01', prix: 20, acheteur: 'Club' } as Vente],
    [clutch('c1', { startDate: '2026-07-01', fertilizedCount: 4, hatchedCount: 3 })],
    new Date('2026-07-29T12:00:00Z'),
  );
  const july = withEvidence.find(point => point.month === '2026-07');
  assert.equal(july?.reproductionRate, 75);
  assert.equal(july?.expensesAmount, 0);
  assert.equal(july?.salesAmount, 20);
});

test('financial intelligence uses DT and refuses to score an empty ledger', () => {
  const empty = BirdIntelligenceEngine.analyzeFinance([], []);
  assert.equal(empty.score, 0);
  assert.equal(empty.confidence, 'low');

  const result = BirdIntelligenceEngine.analyzeFinance(
    [{ id: 1, date: '2026-01-01', montant: 100, categorie: 'Autre', description: 'x' } as Depense],
    [{ id: 1, canari_id: 1, date: '2026-01-02', prix: 60, acheteur: 'Club' } as Vente],
  );
  assert.match(result.summary, /DT/);
  assert.doesNotMatch(result.summary, /€/);
});

test('health and genetics return no-data scores instead of perfect scores', () => {
  assert.equal(BirdIntelligenceEngine.analyzeHealth([], []).score, 0);
  assert.equal(BirdIntelligenceEngine.analyzeGenetics([], []).score, 0);
});

test('data quality has no perfect score when there is no record to inspect', () => {
  assert.equal(DataQualityEngine.analyze([]).score, 0);

  const completeBird = {
    id: 1,
    bague: 'INT-001',
    nom: 'Rubis',
    sexe: 'Mâle',
    espece: 'canari',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune',
    date_naissance: '2025-01-01',
    photo: 'data:image/png;base64,AA==',
    acquisition: true,
  } as Canari;
  assert.equal(DataQualityEngine.analyze([completeBird]).score, 100);
});

test('active intelligence sources contain no fabricated baseline or euro currency', async () => {
  const { readFile } = await import('node:fs/promises');
  const service = await readFile(new URL('../src/features/intelligence/services/IntelligenceService.ts', import.meta.url), 'utf8');
  const engine = await readFile(new URL('../src/features/intelligence/engines/BirdIntelligenceEngine.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(service, /rate:\s*80/);
  assert.doesNotMatch(service, /successRate\s*\|\|\s*75/);
  assert.doesNotMatch(service, /Math\.random/);
  assert.doesNotMatch(`${service}\n${engine}`, /€/);
});

test('intelligence overview labels exist in all five supported languages', () => {
  const keys = [
    'intelLoading', 'intelLocalDss', 'intelGeneticScore', 'intelEvidenceSummary',
    'intelEvidenceExplanation', 'intelTriggeredCount', 'intelRuleDetected',
    'intelRuleEvidence', 'intelReviewSourceData', 'intelAttention',
    'intelNoActiveAlerts', 'intelPerformerEvidence', 'intelNoPerformer',
    'intelNoCritical', 'intelMonthlyEvolutionSub', 'intelHatchRate',
    'intelSalesDt', 'intelExpensesDt'
  ];

  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    for (const key of keys) {
      assert.ok(INTELLIGENCE_TRANSLATIONS[language][key]?.trim(), `${language}.${key} must be translated`);
    }
  }
});

test('individual intelligence exposes facts instead of a fabricated biological score', () => {
  const bird = {
    id: 1,
    bague: 'INT-IND-001',
    nom: 'Rubis',
    sexe: 'Mâle',
    date_naissance: 'date-invalide',
  } as Canari;
  const analysis = BirdIntelligenceEngine.analyzeBird(bird, [bird], [], []);

  assert.equal(analysis.ageMonths, null);
  assert.equal(analysis.score, analysis.dataCompleteness);
  assert.equal(analysis.reliability, 'low');
  assert.ok(analysis.weaknesses.some(finding => finding.key === 'intelBirdIncompleteRecord'));
  assert.ok(analysis.recommendations.every(finding => finding.key.startsWith('intelBird')));
});

test('individual intelligence source contains no base score or generic species-age prescription', async () => {
  const { readFile } = await import('node:fs/promises');
  const engine = await readFile(new URL('../src/features/intelligence/engines/BirdIntelligenceEngine.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(engine, /let score = 75/);
  assert.doesNotMatch(engine, /tranche d'âge optimale/);
  assert.doesNotMatch(engine, /retraite dorée/);
});

test('generated intelligence reports are localized and keep the DT currency', () => {
  localStorage.clear();
  const english = IntelligenceService.generateReport('finance', 'en');
  assert.equal(english.title, INTELLIGENCE_TRANSLATIONS.en.intelReportFinance);
  assert.equal(english.sections[0].title, INTELLIGENCE_TRANSLATIONS.en.intelReportFinanceSection);
  assert.match(english.sections[0].content, /DT/);
  assert.doesNotMatch(JSON.stringify(english), /Exploitation|Élevage|Revenus Ventes/);

  const arabic = IntelligenceService.generateReport('global', 'ar');
  assert.equal(arabic.title, INTELLIGENCE_TRANSLATIONS.ar.intelReportGlobal);
  assert.equal(arabic.sections[0].title, INTELLIGENCE_TRANSLATIONS.ar.intelReportScoresSection);
  assert.ok(arabic.sections.every(section => section.title.trim().length > 0 && section.content.trim().length > 0));
});

test('individual file and report translations exist in all supported languages', () => {
  const keys = [
    'intelFicheHeading', 'intelFicheDescription', 'intelChooseBird', 'intelCalculatedAge',
    'intelNotProvided', 'intelBirdEvidenceProfile', 'intelDocumentedFacts',
    'intelDssSupportPlan', 'intelBirdOffspringRecorded', 'intelBirdHealthRecommendation',
    'intelBirdIncompleteRecord', 'intelBirdNoSpecificAction', 'intelReportGeneratorDescription',
    'intelReportCompiled', 'intelReportLocalEngine', 'intelOfficialDocument',
    'intelReportDisclaimer', 'intelReportScoresSection', 'intelReportAlertsSection',
    'intelReportReproductionSection', 'intelReportFinanceSection', 'intelReportAnnualSection'
  ];

  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    for (const key of keys) {
      assert.ok(INTELLIGENCE_TRANSLATIONS[language][key]?.trim(), `${language}.${key} must be translated`);
    }
  }
});

test('print stylesheet isolates the generated report', async () => {
  const { readFile } = await import('node:fs/promises');
  const stylesheet = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(stylesheet, /@media print/);
  assert.match(stylesheet, /body \*\s*\{\s*visibility:\s*hidden/);
  assert.match(stylesheet, /#printable-area,\s*#printable-area \*\s*\{\s*visibility:\s*visible/);
});

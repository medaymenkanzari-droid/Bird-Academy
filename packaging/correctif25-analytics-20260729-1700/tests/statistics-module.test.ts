import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Canari, Depense, Ponte, Vente } from '../src/types';
import { StatisticsEngine } from '../src/business/StatisticsEngine';
import { TRANSLATIONS } from '../src/utils/translations';
import { AnalyticsEngine } from '../src/features/analytics/engines/AnalyticsEngine';
import type { AnalyticsFilters, AnalyticsSettings } from '../src/features/analytics/types';
import { ANALYTICS_TRANSLATIONS } from '../src/features/analytics/utils/translations';

function bird(id: number, overrides: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `STAT-${id}`,
    nom: `Oiseau ${id}`,
    sexe: 'Mâle',
    espece: 'canari',
    categorie: 'canari_posture',
    race: 'Gloster Fancy',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune',
    date_naissance: '2024-01-01',
    archived: false,
    ...overrides,
  };
}

test('statistics rates use known biological samples only', () => {
  const clutches: Ponte[] = [
    { id: 1, reproduction_id: 1, date: '2026-01-01', oeufs: 5, oeufs_fecondes: 4 },
    { id: 2, reproduction_id: 1, date: '2026-02-01', oeufs: 4, oeufs_fecondes: 3, eclosions: 3, sevrages: 2 },
    { id: 3, reproduction_id: 2, date: '2026-03-01', oeufs: 10 },
  ];

  const result = StatisticsEngine.calculate([], clutches, [], []);
  assert.equal(result.totalEggs, 19);
  assert.equal(result.knownFertilityEggs, 9);
  assert.equal(result.fertilizedEggs, 7);
  assert.equal(Math.round(result.fertilityRate), 78);
  assert.equal(result.knownHatchFertilizedEggs, 3);
  assert.equal(result.hatchRate, 100);
  assert.equal(Math.round(result.survivalRate), 67);
});

test('statistics clamp impossible counts and ignore invalid financial values', () => {
  const clutches: Ponte[] = [
    { id: 1, reproduction_id: 1, date: '2026-01-01', oeufs: 2, oeufs_fecondes: 5, eclosions: 8, sevrages: 9 },
  ];
  const expenses = [{ id: 1, date: '2026-01-01', montant: Number.NaN, categorie: 'Autre', description: 'x' }] as Depense[];
  const sales = [{ id: 1, canari_id: 1, prix: Number.POSITIVE_INFINITY, date: '2026-01-01', acheteur: 'x' }] as Vente[];
  const result = StatisticsEngine.calculate([], clutches, expenses, sales);

  assert.equal(result.fertilizedEggs, 2);
  assert.equal(result.hatchedEggs, 2);
  assert.equal(result.weanedChicks, 2);
  assert.equal(result.fertilityRate, 100);
  assert.equal(result.totalExpenses, 0);
  assert.equal(result.totalSales, 0);
});

test('statistics demographics exclude archived, deceased and sold birds', () => {
  const result = StatisticsEngine.calculate([
    bird(1),
    bird(2, { archived: true }),
    bird(3, { statut_sante: 'Décédé' }),
    bird(4, { statut_sante: 'Vendu' }),
  ], [], [], []);

  assert.equal(result.activeBirdCount, 1);
  assert.equal(result.breedCounts['Gloster Fancy'], 1);
});

test('statistics screens remain translated in all five supported languages', () => {
  const keys = [
    'performStatsTitle', 'performStatsSub', 'statisticsRevenue', 'globalCharges',
    'netMargin', 'fecondationRate', 'hatchingRate', 'survieRate', 'fecondationStats',
    'hatchingStats', 'survieStats', 'raceDistribution', 'colorMutationDistribution',
    'noBirdRegistered', 'birdCountLabel'
  ] as const;

  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    for (const key of keys) {
      assert.ok(TRANSLATIONS[language][key]?.trim(), `${language}.${key} must be translated`);
    }
  }
});

test('active analytics never invent perfect reproduction rates without data', () => {
  const settings: AnalyticsSettings = {
    defaultPeriod: 'all', currency: 'DT', numberFormat: 'fr', dateFormat: 'YYYY-MM-DD',
    fertilityTarget: 80, hatchingTarget: 75, weaningTarget: 70, revenueTarget: 1000, survivalTarget: 90,
  };
  const filters: AnalyticsFilters = { origin: 'all' };
  const empty = AnalyticsEngine.computeAllKPIs([], [], [], [], [], [], [], settings, filters);
  assert.equal(empty.fertility_rate.value, 0);
  assert.equal(empty.hatching_rate.value, 0);
  assert.equal(empty.weaning_rate.value, 0);

  const clutches: Ponte[] = [
    { id: 1, reproduction_id: 1, date: '2026-01-01', oeufs: 5, oeufs_fecondes: 4, eclosions: 0 },
    { id: 2, reproduction_id: 1, date: '2026-02-01', oeufs: 4, oeufs_fecondes: 3, eclosions: 3 },
  ];
  const demo = AnalyticsEngine.computeAllKPIs([], [], [], clutches, [], [], [], settings, filters);
  assert.equal(Math.round(Number(demo.fertility_rate.value)), 78);
  assert.equal(Math.round(Number(demo.hatching_rate.value)), 43);
  assert.equal(demo.weaning_rate.value, 0);
});

test('active analytics exclude sold and deceased birds from the active population', () => {
  const settings: AnalyticsSettings = {
    defaultPeriod: 'all', currency: 'DT', numberFormat: 'fr', dateFormat: 'YYYY-MM-DD',
    fertilityTarget: 80, hatchingTarget: 75, weaningTarget: 70, revenueTarget: 1000, survivalTarget: 90,
  };
  const birds = [bird(1), bird(2, { statut_sante: 'Décédé' }), bird(3)];
  const sales = [{ id: 1, canari_id: 3, prix: 20, date: '2026-01-01', acheteur: 'Club' }] as Vente[];
  const result = AnalyticsEngine.computeAllKPIs(birds, [], [], [], [], [], sales, settings, { origin: 'all' });

  assert.equal(result.total_birds.value, 3);
  assert.equal(result.active_birds.value, 1);
  assert.equal(result.sold_birds.value, 1);
  assert.equal(result.deceased_birds.value, 1);
});

test('active analytics executive dashboard is translated in all five languages', () => {
  const keys = [
    'refreshKpis', 'offlineBadge', 'periodQuarterShort', 'periodYearShort', 'periodAllShort',
    'metricPopulationDesc', 'metricFertilityDesc', 'metricWeaningDesc',
    'metricCashflowDesc', 'birthTrendTitle', 'currentYearLegend', 'previousYearLegend',
    'breedDistributionTitle', 'noAnomalyTitle', 'forecastFertileEggs', 'forecastWeanings',
    'forecastDqi', 'targetLabel', 'recentActivity', 'noRecentActivity', 'eventsLabel'
  ];

  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    for (const key of keys) {
      assert.ok(ANALYTICS_TRANSLATIONS[language][key]?.trim(), `${language}.${key} must be translated`);
    }
  }
});

test('active analytics sources contain no random or hardcoded demo trends', async () => {
  const { readFile } = await import('node:fs/promises');
  const service = await readFile(new URL('../src/features/analytics/services/AnalyticsService.ts', import.meta.url), 'utf8');
  const dashboard = await readFile(new URL('../src/features/analytics/components/AnalyticsDashboard.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(service, /Math\.random/);
  assert.doesNotMatch(dashboard, /change=\{(?:4\.2|8\.5|-2\.1|12\.4)\}/);
  assert.doesNotMatch(dashboard, /totalBirds \* 0\.35/);
});

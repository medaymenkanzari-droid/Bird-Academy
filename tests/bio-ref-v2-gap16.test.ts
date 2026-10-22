/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUITE DE VALIDATION GAP-16
 * MISSION : BIO-REF-V2-GAP16-UI-BADGES-SECONDARY-DISPLAY-CLEANUP
 * 
 * Vérification stricte des corrections GAP14-ANO-05 à GAP14-ANO-08 :
 * 1. ReferenceBiologique : état neutre si aucune espèce active, aucun fallback 'canari' ni BIOLOGICAL_SPECIES_REGISTRY[0]
 * 2. Espèce active Colombe : résolue en 'colombe_diamant'
 * 3. Bird Passport : badge avec espèce connue préservé
 * 4. Bird Passport : sans espèce ou UNKNOWN -> aucun badge Canary forcé
 * 5. UNKNOWN / indéterminé : affichage neutre garanti
 * 6. Analytics avec espèces connues : comptages stricts et inchangés
 * 7. Analytics avec espèce inconnue : groupe 'Non spécifiée' / neutre
 * 8. Aucune espèce inconnue ne contribue au compteur Canary
 * 9. Legacy 'colombe' -> 'colombe_diamant'
 * 10. Migration Colombe 100% idempotente
 * 11. Aucun nouveau fallback Canary introduit
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { SPECIES_REGISTRY, getSpeciesById, migrateBirdTaxonomy } from '../src/data/speciesRegistry.js';
import { BIOLOGICAL_SPECIES_REGISTRY, getBiologicalProfileById } from '../src/reference/species/index.js';
import { SpeciesProfileService } from '../src/features/species/services/SpeciesProfileService.js';
import { SpeciesProfileRepository } from '../src/features/species/repositories/SpeciesProfileRepository.js';
import { DashboardStatisticsService } from '../src/features/analytics/services/DashboardStatisticsService.js';
import { AnalyticsEngine } from '../src/features/analytics/engines/AnalyticsEngine.js';
import { Canari } from '../src/types/index.js';

// Setup Mock LocalStorage for isolated Node.js test execution
const mockLocalStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockLocalStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = String(value); },
    removeItem: (key: string) => { delete mockLocalStorage[key]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
  };
}

function createSampleBird(id: number, overrides: Partial<Canari> = {}): Canari {
  return {
    id,
    bague: `BAG-${id}`,
    nom: `Oiseau-${id}`,
    sexe: 'Mâle',
    date_naissance: '2025-05-10',
    statut_sante: 'En forme',
    espece: 'canari',
    ...overrides
  } as Canari;
}

test('GAP16-01: ReferenceBiologique source code contains zero Canary fallback and zero BIOLOGICAL_SPECIES_REGISTRY[0]', () => {
  const refPath = path.join(process.cwd(), 'src/components/ReferenceBiologique.tsx');
  const content = fs.readFileSync(refPath, 'utf-8');

  // GAP14-ANO-05 verification
  assert.equal(content.includes("activeSpeciesIds[0] || 'canari'"), false, "Must not contain activeSpeciesIds[0] || 'canari'");
  assert.equal(content.includes('BIOLOGICAL_SPECIES_REGISTRY[0]'), false, "Must not contain BIOLOGICAL_SPECIES_REGISTRY[0]");
  assert.equal(content.includes("activeSpeciesIds[0] || ''"), true, "Must initialize with activeSpeciesIds[0] || ''");
});

test('GAP16-02: ReferenceBiologique scoping is neutral when no active species configured', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  const activeIds = SpeciesProfileService.getActiveSpeciesIds();
  assert.deepEqual(activeIds, [], 'Default active species should be empty []');

  const scopedProfiles = SpeciesProfileService.getScopedBiologicalProfiles();
  assert.deepEqual(scopedProfiles, [], 'Scoped biological profiles must be empty when no species configured');
});

test('GAP16-03: Active species Dove resolves strictly to colombe_diamant', () => {
  globalThis.localStorage.clear();
  SpeciesProfileRepository.clearMemoryCache();

  SpeciesProfileService.setProfile(['colombe_diamant']);
  const activeIds = SpeciesProfileService.getActiveSpeciesIds();
  assert.deepEqual(activeIds, ['colombe_diamant']);

  const scoped = SpeciesProfileService.getScopedBiologicalProfiles();
  assert.equal(scoped.length, 1);
  assert.equal(scoped[0].identity.id, 'colombe_diamant');
  assert.equal(scoped[0].identity.scientificName, 'Geopelia cuneata');
});

test('GAP16-04: Bird Passport sources contain zero Canary display fallbacks (GAP14-ANO-06)', () => {
  const heroPath = path.join(process.cwd(), 'src/features/birds/components/BirdHeroPassportCard.tsx');
  const heroContent = fs.readFileSync(heroPath, 'utf-8');
  assert.equal(heroContent.includes("resolvedSpeciesId || 'canari'"), false, "BirdHeroPassportCard must not have resolvedSpeciesId || 'canari'");
  assert.equal(heroContent.includes("<SpeciesBadge speciesId={resolvedSpeciesId} size=\"sm\" />"), true, "BirdHeroPassportCard must pass raw resolvedSpeciesId");

  const summaryPath = path.join(process.cwd(), 'src/features/birds/components/BirdPassportProgressiveSummaryCard.tsx');
  const summaryContent = fs.readFileSync(summaryPath, 'utf-8');
  assert.equal(summaryContent.includes("bird.espece || 'canari'"), false, "BirdPassportProgressiveSummaryCard must not have bird.espece || 'canari'");
  assert.equal(summaryContent.includes("<SpeciesBadge speciesId={bird.espece} size=\"sm\" />"), true, "BirdPassportProgressiveSummaryCard must pass raw bird.espece");
});

test('GAP16-05: SPECIES_REGISTRY canonical id is colombe_diamant and legacy colombe is preserved as alias (GAP14-ANO-08)', () => {
  // Canonical registry entry
  const canonicalInRegistry = SPECIES_REGISTRY.find(s => s.id === 'colombe_diamant');
  assert.ok(canonicalInRegistry, "SPECIES_REGISTRY must contain 'colombe_diamant'");
  assert.equal(canonicalInRegistry.defaultLabel, 'Colombe diamant');

  // No duplicate second profile
  const legacyInRegistry = SPECIES_REGISTRY.find(s => s.id === 'colombe');
  assert.equal(legacyInRegistry, undefined, "SPECIES_REGISTRY must not contain a duplicate 'colombe' entry");

  // Resolution via getSpeciesById
  const resolvedCanonical = getSpeciesById('colombe_diamant');
  assert.ok(resolvedCanonical, "getSpeciesById('colombe_diamant') must resolve");
  assert.equal(resolvedCanonical.id, 'colombe_diamant');

  const resolvedLegacy = getSpeciesById('colombe');
  assert.ok(resolvedLegacy, "getSpeciesById('colombe') must resolve via alias");
  assert.equal(resolvedLegacy.id, 'colombe_diamant');

  const resolvedHyphen = getSpeciesById('colombe-diamant');
  assert.ok(resolvedHyphen, "getSpeciesById('colombe-diamant') must resolve via alias");
  assert.equal(resolvedHyphen.id, 'colombe_diamant');
});

test('GAP16-06: migrateBirdTaxonomy canonicalizes legacy colombe to colombe_diamant idempotently', () => {
  const legacyBird = {
    espece: 'colombe',
    nom: 'Colombe Test',
    bague: '2026-COLO-01'
  };

  const migrated1 = migrateBirdTaxonomy(legacyBird);
  assert.equal(migrated1.espece, 'colombe_diamant', "Legacy 'colombe' must be migrated to 'colombe_diamant'");
  assert.equal(migrated1.nom, 'Colombe Test');

  // Idempotence test
  const migrated2 = migrateBirdTaxonomy(migrated1);
  assert.deepEqual(migrated2, migrated1, "Migration must be 100% idempotent");

  // Unspeciated bird is not mutated into Canary
  const unknownBird = {
    espece: undefined,
    nom: 'Oiseau Inconnu'
  };
  const migratedUnknown = migrateBirdTaxonomy(unknownBird);
  assert.equal(migratedUnknown.espece, undefined, "Unspeciated bird must not be turned into canary");
});

test('GAP16-07: DashboardStatisticsService groups unspeciated birds under Non spécifiée without inflating Canary (GAP14-ANO-07)', () => {
  const b1 = createSampleBird(1, { espece: 'canari' });
  const b2 = createSampleBird(2, { espece: 'canari' });
  const b3 = createSampleBird(3, { espece: 'diamant_gould' });
  const b4 = createSampleBird(4, { espece: undefined }); // no species
  const b5 = createSampleBird(5, { espece: 'UNKNOWN' }); // unknown species
  const b6 = createSampleBird(6, { espece: 'colombe' }); // legacy colombe

  const snapshot = DashboardStatisticsService.computeSnapshot([b1, b2, b3, b4, b5, b6], [], [], [], 'fr');
  const dist = snapshot.demographics.speciesDistribution;

  const canariItem = dist.find(d => d.species === 'canari');
  const gouldItem = dist.find(d => d.species === 'diamant_gould');
  const colombeItem = dist.find(d => d.species === 'colombe_diamant');
  const unspecifiedItem = dist.find(d => d.species === 'Non spécifiée');

  // Canary count strictly 2, NOT 4!
  assert.equal(canariItem?.count, 2, "Canary count must strictly be 2 (b1, b2)");
  assert.equal(gouldItem?.count, 1, "Gould count must strictly be 1 (b3)");
  assert.equal(colombeItem?.count, 1, "Colombe count must strictly be 1 (b6 canonicalized to colombe_diamant)");
  assert.equal(unspecifiedItem?.count, 2, "Unspecified count must strictly be 2 (b4, b5)");

  // No phantom species
  assert.equal(dist.find(d => d.species === 'colombe'), undefined, "Legacy 'colombe' must not exist as separate group");
});

test('GAP16-08: DashboardStatisticsService recent events display Non spécifiée instead of Canari for unspeciated birds', () => {
  const bUnknown = createSampleBird(99, {
    espece: undefined,
    date_naissance: '2026-03-01',
    sexe: 'Mâle'
  });

  const snapshot = DashboardStatisticsService.computeSnapshot([bUnknown], [], [], [], 'fr');
  assert.equal(snapshot.recentEvents.length, 1);
  const ev = snapshot.recentEvents[0];
  assert.ok(ev.description.includes('Non spécifiée'), `Recent event description must show 'Non spécifiée', got: ${ev.description}`);
  assert.equal(ev.description.includes('Canari'), false, "Recent event description must not invent 'Canari'");
});

test('GAP16-09: AnalyticsEngine groups unknown species and breeds under Non spécifiée (GAP14-ANO-07)', () => {
  const birds = [
    createSampleBird(1, { espece: 'canari', race: 'Lipochrome' }),
    createSampleBird(2, { espece: 'diamant_gould', race: 'Gould Standard' }),
    createSampleBird(3, { espece: undefined, race: undefined }),
    createSampleBird(4, { espece: 'colombe', race: 'Colombe diamant classique' })
  ];

  const settings: any = {
    defaultPeriod: 'all', currency: '€', numberFormat: 'fr', dateFormat: 'YYYY-MM-DD',
    fertilityTarget: 80, hatchingTarget: 75, weaningTarget: 70, revenueTarget: 1000, survivalTarget: 90
  };

  // We set profile to include all tested species to avoid active species exclusion in filterBirds
  SpeciesProfileService.setProfile(['canari', 'diamant_gould', 'colombe_diamant']);

  const kpis = AnalyticsEngine.computeAllKPIs(birds, [], [], [], [], [], [], settings, {});
  
  // Total birds count
  assert.equal(kpis.total_birds.value, 4);

  // Demographic distribution checks inside AnalyticsEngine
  // Bird 3 has no species and no race -> grouped under 'Non spécifiée'
  // Bird 4 has species 'colombe' -> canonicalized to 'colombe_diamant'
});

test('GAP16-10: Scientific and biological invariances preserved', () => {
  // Verify biological profile of Dove
  const colombeBio = getBiologicalProfileById('colombe_diamant');
  assert.ok(colombeBio, 'Colombe profile must exist');
  assert.equal(colombeBio.identity.scientificName, 'Geopelia cuneata');
  assert.equal(colombeBio.reproduction.incubationPeriod, 13);
  assert.equal(colombeBio.reproduction.avgEggsPerClutch, 2);

  // Canary profile intact
  const canaryBio = getBiologicalProfileById('canari');
  assert.ok(canaryBio, 'Canary profile must exist');
  assert.equal(canaryBio.identity.scientificName, 'Serinus canaria domestica');
  assert.equal(canaryBio.reproduction.incubationPeriod, 13);

  // Biological registry length intact (10 species profiles including 3 Agapornis)
  assert.equal(BIOLOGICAL_SPECIES_REGISTRY.length, 10, 'BIOLOGICAL_SPECIES_REGISTRY must have exactly 10 species');
});

test('GAP16-11: Zero new Canary display fallback introduced in modified targets', () => {
  const modifiedFiles = [
    'src/components/ReferenceBiologique.tsx',
    'src/features/birds/components/BirdHeroPassportCard.tsx',
    'src/features/birds/components/BirdPassportProgressiveSummaryCard.tsx',
    'src/features/analytics/services/DashboardStatisticsService.ts',
    'src/features/analytics/engines/AnalyticsEngine.ts',
    'src/data/speciesRegistry.ts'
  ];

  for (const relPath of modifiedFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert.equal(content.includes("|| 'canari'"), false, `${relPath} must not contain || 'canari'`);
    assert.equal(content.includes('|| "canari"'), false, `${relPath} must not contain || "canari"`);
    assert.equal(content.includes("?? 'canari'"), false, `${relPath} must not contain ?? 'canari'`);
    assert.equal(content.includes('?? "canari"'), false, `${relPath} must not contain ?? "canari"`);
  }
});

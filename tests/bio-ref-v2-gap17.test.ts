/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUITE DE VALIDATION GAP-17
 * MISSION : BIO-REF-V2-GAP17-EVIDENCE-REGISTRY-FORMALIZATION
 * 
 * Vérification stricte des 12 points de contrôle GAP-17 :
 * 1. Chaque nouvel EvidenceId est unique
 * 2. Chaque sourceId utilisé existe dans BIBLIOGRAPHIC_SOURCES
 * 3. Aucune référence orpheline
 * 4. Colombe possède désormais les EvidenceRecord attendus (2 œufs, 13j, in situ 23-37g, ex situ 35-45g, bagues 3.5/3.8, nid soucoupe, hybride stérile)
 * 5. Personatus possède la traçabilité de ap_blue (blue1, bl, autosomique récessif, bl/bl)
 * 6. Fischer possède uniquement les preuves biologiques réellement documentées (bec, 4-6 œufs, 22j, bague 4.0)
 * 7. ap_blue reste CANONICAL
 * 8. blue2/bl2/turquoise/sapphire restent HRR / non canoniques
 * 9. Aucune mutation Fischer n'est activée (catalogue OUT_OF_SCOPE)
 * 10. Aucune modification de la chaîne Canary
 * 11. Aucune rupture de la chaîne Profile -> Evidence -> Citation -> Source
 * 12. Les 11 sources non rattachées de GAP-14 sont explicitement classifiées
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BIBLIOGRAPHIC_SOURCES,
  EVIDENCE_REGISTRY,
  getBibliographicSource,
  getEvidenceRecord,
  getEvidenceCitations,
  getSourcesForEvidence,
  getEvidenceForSource,
  hasBibliographicSource,
  hasEvidenceRecord,
  getAllBibliographicSources,
  getAllEvidenceRecords,
  getEvidenceRecordsForSpecies,
  getEvidenceRecordsForRule
} from '../src/reference/bibliography/index.js';

import {
  getBiologicalProfileById,
  BIOLOGICAL_SPECIES_REGISTRY
} from '../src/reference/species/index.js';

import { CanonicalDataBridgeAdapter } from '../src/features/canonical/CanonicalDataBridgeAdapter.js';

test('GAP17-01: Chaque EvidenceId est unique et suit les conventions de nommage', () => {
  const allRecords = getAllEvidenceRecords();
  assert.strictEqual(allRecords.length, 39, 'Le registre doit contenir exactement 39 EvidenceRecords (28 initiaux + 11 formalisés GAP-17)');

  const idSet = new Set<string>();
  for (const record of allRecords) {
    assert.ok(!idSet.has(record.evidenceId), `Doublon d'EvidenceId détecté : ${record.evidenceId}`);
    idSet.add(record.evidenceId);
    assert.strictEqual(record.evidenceId, record.evidenceId.trim());
    assert.ok(record.evidenceId.startsWith('EVD-'), `Format invalide : ${record.evidenceId}`);
  }

  // Vérifier l'existence explicite des 11 nouveaux IDs
  const expectedNewIds = [
    'EVD-COL-01-TAXON',
    'EVD-COL-01-REPRO',
    'EVD-COL-01-WEIGHT',
    'EVD-COL-01-RINGS',
    'EVD-COL-01-NEST',
    'EVD-COL-01-HYB',
    'EVD-AGAP-PERS-BLUE',
    'EVD-AGAP-PERS-ETHOL',
    'EVD-AGAP-PERS-REPRO',
    'EVD-AGAP-FISC-ETHOL',
    'EVD-AGAP-FISC-REPRO'
  ];

  for (const id of expectedNewIds) {
    assert.ok(hasEvidenceRecord(id), `Le nouvel EvidenceRecord ${id} doit exister dans le registre`);
  }
});

test('GAP17-02: Chaque sourceId référencé dans les citations existe réellement dans BIBLIOGRAPHIC_SOURCES', () => {
  const allRecords = getAllEvidenceRecords();
  const allCitations = allRecords.flatMap(r => r.citations);

  assert.ok(allCitations.length > 0);

  for (const citation of allCitations) {
    assert.ok(citation.sourceId, `Citation sans sourceId : ${citation.citationId}`);
    assert.ok(
      hasBibliographicSource(citation.sourceId),
      `Source introuvable dans sources.ts : ${citation.sourceId} pour la citation ${citation.citationId}`
    );
    const source = getBibliographicSource(citation.sourceId);
    assert.ok(source, `La source ${citation.sourceId} doit être résolue`);
    assert.strictEqual(source.sourceId, citation.sourceId);
  }
});

test('GAP17-03: Intégrité des citations et absence de référence orpheline', () => {
  const allRecords = getAllEvidenceRecords();
  const citationIds = new Set<string>();

  for (const record of allRecords) {
    assert.ok(record.citations.length > 0, `L'EvidenceRecord ${record.evidenceId} n'a aucune citation`);
    for (const citation of record.citations) {
      assert.ok(!citationIds.has(citation.citationId), `Doublon de citationId détecté : ${citation.citationId}`);
      citationIds.add(citation.citationId);

      // Vérifier que getSourcesForEvidence résout bien toutes les sources associées
      const resolvedSources = getSourcesForEvidence(record.evidenceId);
      assert.ok(resolvedSources.length > 0);
      assert.ok(resolvedSources.some(s => s.sourceId === citation.sourceId));
    }
  }
});

test('GAP17-04: Colombe diamant possède tous les EvidenceRecords canoniques attendus', () => {
  const colombeRecords = getEvidenceRecordsForSpecies('colombe_diamant');
  assert.strictEqual(colombeRecords.length, 6, 'Colombe diamant doit posséder exactement 6 EvidenceRecords canoniques');

  const recordMap = new Map(colombeRecords.map(r => [r.evidenceId, r]));

  // 1. Taxon & morphométrie
  const taxonRec = recordMap.get('EVD-COL-01-TAXON');
  assert.ok(taxonRec);
  assert.strictEqual(taxonRec.ruleId, 'COL_TAXON_IDENTITY');
  assert.strictEqual(taxonRec.epistemicStatus, 'VERIFIED');
  assert.strictEqual(taxonRec.humanReviewRequired, false);

  // 2. Ponte de 2 œufs et incubation de 13j
  const reproRec = recordMap.get('EVD-COL-01-REPRO');
  assert.ok(reproRec);
  assert.strictEqual(reproRec.ruleId, 'COL_REPRO_CLUTCH_INCUBATION');
  assert.ok(reproRec.claim.includes('2 œufs'));
  assert.ok(reproRec.claim.includes('13 jours'));
  assert.strictEqual(reproRec.epistemicStatus, 'VERIFIED');

  // 3. Poids in situ 23-37g et ex situ 35-45g strictement séparés
  const weightRec = recordMap.get('EVD-COL-01-WEIGHT');
  assert.ok(weightRec);
  assert.strictEqual(weightRec.ruleId, 'COL_BIOL_WEIGHT_CONTEXTS');
  assert.ok(weightRec.claim.includes('23–37 g'));
  assert.ok(weightRec.claim.includes('35–45 g'));
  assert.ok(weightRec.claim.includes('aucune fusion de plages'));
  assert.ok(weightRec.limitations?.includes('GAP-12'));

  // 4. Bagues 3.5 mm UOF/COM et 3.8 mm CDE/Aviornis
  const ringRec = recordMap.get('EVD-COL-01-RINGS');
  assert.ok(ringRec);
  assert.strictEqual(ringRec.ruleId, 'COL_BREED_RING_STANDARDS');
  assert.ok(ringRec.claim.includes('3.5 mm'));
  assert.ok(ringRec.claim.includes('3.8 mm'));
  assert.ok(!ringRec.claim.includes('4.0 mm'));

  // 5. Nid soucoupe
  const nestRec = recordMap.get('EVD-COL-01-NEST');
  assert.ok(nestRec);
  assert.strictEqual(nestRec.ruleId, 'COL_BREED_NEST_TYPE');
  assert.ok(nestRec.claim.includes('soucoupe'));

  // 6. Hybridation stérile Geopelia
  const hybRec = recordMap.get('EVD-COL-01-HYB');
  assert.ok(hybRec);
  assert.strictEqual(hybRec.ruleId, 'COL_MGMT_HYBRID_STERILITY');
  assert.ok(hybRec.claim.includes('stériles'));

  // Support de l'alias legacy 'colombe'
  const legacyColombeRecords = getEvidenceRecordsForSpecies('colombe');
  assert.strictEqual(legacyColombeRecords.length, 6, 'getEvidenceRecordsForSpecies(colombe) doit résoudre les mêmes enregistrements');
});

test('GAP17-05: Agapornis personatus possède la traçabilité canonique de ap_blue et de sa biologie', () => {
  const personatusRecords = getEvidenceRecordsForSpecies('agapornis_personatus');
  assert.strictEqual(personatusRecords.length, 3, 'Personatus doit posséder exactement 3 EvidenceRecords');

  const recordMap = new Map(personatusRecords.map(r => [r.evidenceId, r]));

  // ap_blue
  const blueRec = recordMap.get('EVD-AGAP-PERS-BLUE');
  assert.ok(blueRec);
  assert.strictEqual(blueRec.ruleId, 'ap_blue');
  assert.strictEqual(blueRec.epistemicStatus, 'VERIFIED');
  assert.strictEqual(blueRec.humanReviewRequired, false);
  assert.ok(blueRec.claim.includes('blue1'));
  assert.ok(blueRec.claim.includes('bl'));
  assert.ok(blueRec.claim.includes('autosomique récessive'));
  assert.ok(blueRec.claim.includes('bl/bl'));
  assert.ok(blueRec.limitations?.includes('blue2'));
  assert.ok(blueRec.limitations?.includes('turquoise'));

  // Transport au bec
  const etholRec = recordMap.get('EVD-AGAP-PERS-ETHOL');
  assert.ok(etholRec);
  assert.strictEqual(etholRec.ruleId, 'AGAP_PERS_ETHOL_NESTING');
  assert.ok(etholRec.claim.includes('bec'));
  assert.ok(etholRec.claim.includes('jamais'));

  // Reproduction & bague 4.0 mm
  const reproRec = recordMap.get('EVD-AGAP-PERS-REPRO');
  assert.ok(reproRec);
  assert.strictEqual(reproRec.ruleId, 'AGAP_PERS_REPRO_PARAMS');
  assert.ok(reproRec.claim.includes('4.0 mm'));
  assert.ok(reproRec.claim.includes('22 jours'));
  assert.ok(reproRec.claim.includes('4–6 œufs'));
});

test('GAP17-06: Agapornis fischeri possède uniquement les preuves biologiques documentées', () => {
  const fischeriRecords = getEvidenceRecordsForSpecies('agapornis_fischeri');
  assert.strictEqual(fischeriRecords.length, 2, 'Fischeri doit posséder exactement 2 EvidenceRecords (biologiques uniquement)');

  const recordMap = new Map(fischeriRecords.map(r => [r.evidenceId, r]));

  // Transport au bec
  const etholRec = recordMap.get('EVD-AGAP-FISC-ETHOL');
  assert.ok(etholRec);
  assert.strictEqual(etholRec.ruleId, 'AGAP_FISC_ETHOL_NESTING');
  assert.ok(etholRec.claim.includes('bec'));

  // Reproduction & bague 4.0 mm
  const reproRec = recordMap.get('EVD-AGAP-FISC-REPRO');
  assert.ok(reproRec);
  assert.strictEqual(reproRec.ruleId, 'AGAP_FISC_REPRO_PARAMS');
  assert.ok(reproRec.claim.includes('4.0 mm'));
  assert.ok(reproRec.claim.includes('22 jours'));
  assert.ok(reproRec.claim.includes('OUT_OF_SCOPE'));
  assert.ok(reproRec.limitations?.includes('OUT_OF_SCOPE'));
});

test('GAP17-07: ap_blue reste CANONICAL dans le catalogue génétique Personatus', () => {
  const resolution = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ap_blue');
  assert.ok(resolution, 'ap_blue doit être résolu');
  assert.strictEqual(resolution.status, 'CANONICAL');
  assert.strictEqual(resolution.inheritance, 'AUTOSOMAL_RECESSIVE');
  assert.strictEqual(resolution.nomenclature, 'blue1');
  assert.strictEqual(resolution.symbol, 'bl');
  assert.strictEqual(resolution.homozygousState, 'bl/bl');
});

test('GAP17-08: Allèles complexes Personatus (blue2, bl2, turquoise, sapphire) restent non-canoniques / HRR', () => {
  // blue2, bl2, sapphire, turquoise doivent être sous statut HUMAN_REVIEW_REQUIRED (non résolus, non canoniques)
  const blue2Res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'blue2');
  assert.strictEqual(blue2Res.status, 'HUMAN_REVIEW_REQUIRED');
  assert.strictEqual(blue2Res.resolved, false);

  const bl2Res = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'bl2');
  assert.strictEqual(bl2Res.status, 'HUMAN_REVIEW_REQUIRED');
  assert.strictEqual(bl2Res.resolved, false);

  const sapphireRes = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'sapphire');
  assert.strictEqual(sapphireRes.status, 'HUMAN_REVIEW_REQUIRED');
  assert.strictEqual(sapphireRes.resolved, false);

  const turqPers = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'turquoise');
  assert.strictEqual(turqPers.status, 'HUMAN_REVIEW_REQUIRED');
  assert.strictEqual(turqPers.resolved, false);

  // ar_turquoise sur roseicollis reste également HUMAN_REVIEW_REQUIRED
  const turqRosei = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ar_turquoise');
  assert.strictEqual(turqRosei.status, 'HUMAN_REVIEW_REQUIRED');
});

test('GAP17-09: Aucune mutation Fischer n\'est activée (catalogue strictement OUT_OF_SCOPE)', () => {
  const afBlue = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'ap_blue');
  assert.strictEqual(afBlue.status, 'OUT_OF_SCOPE');

  const afIno = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'af_ino');
  assert.strictEqual(afIno.status, 'OUT_OF_SCOPE');

  const afLutino = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'lutino');
  assert.strictEqual(afLutino.status, 'OUT_OF_SCOPE');
});

test('GAP17-10: Aucune modification de la chaîne Canary (intégrité 100%)', () => {
  const canaryRecords = getEvidenceRecordsForSpecies('canari');
  assert.strictEqual(canaryRecords.length, 8, 'Canari doit conserver exactement ses 8 EvidenceRecords canoniques d\'origine');

  const canaryExpectedIds = [
    'EVD-CAN-09-001',
    'EVD-CAN-09-ISA-01',
    'EVD-CAN-09-SAT-01',
    'EVD-CAN-09-IV-01',
    'EVD-CAN-08-004',
    'EVD-CAN-08-007',
    'EVD-CAN-08-001',
    'EVD-CAN-07-003'
  ];

  for (const id of canaryExpectedIds) {
    const rec = getEvidenceRecord(id);
    assert.ok(rec, `L'EvidenceRecord Canary ${id} doit exister`);
    assert.strictEqual(rec.speciesId, 'canari');
  }
});

test('GAP17-11: Chaîne complète Profile -> Evidence -> Citation -> Source', () => {
  // Testons la chaîne pour Colombe diamant
  const colProfile = getBiologicalProfileById('colombe_diamant');
  assert.ok(colProfile);
  assert.strictEqual(colProfile.identity.id, 'colombe_diamant');

  const colEvidences = getEvidenceRecordsForSpecies(colProfile.identity.id);
  assert.ok(colEvidences.length >= 6);

  for (const ev of colEvidences) {
    const citations = getEvidenceCitations(ev.evidenceId);
    assert.ok(citations.length > 0);
    for (const cit of citations) {
      const src = getBibliographicSource(cit.sourceId);
      assert.ok(src, `Source ${cit.sourceId} non résolue`);
      assert.ok(src.title.length > 0);
      assert.ok(src.authors.length > 0);
    }
  }

  // Testons la chaîne pour Personatus
  const persProfile = getBiologicalProfileById('agapornis_personatus');
  assert.ok(persProfile);
  const persEvidences = getEvidenceRecordsForSpecies(persProfile.identity.id);
  assert.strictEqual(persEvidences.length, 3);

  // Testons la chaîne pour Fischeri
  const fiscProfile = getBiologicalProfileById('agapornis_fischeri');
  assert.ok(fiscProfile);
  const fiscEvidences = getEvidenceRecordsForSpecies(fiscProfile.identity.id);
  assert.strictEqual(fiscEvidences.length, 2);

  // Test de résolution par règle/alias
  const blueMatches = getEvidenceRecordsForRule('ap_blue');
  assert.ok(blueMatches.length > 0);
  assert.strictEqual(blueMatches[0].evidenceId, 'EVD-AGAP-PERS-BLUE');

  const ringMatches = getEvidenceRecordsForRule('col_breed_ring_standards');
  assert.ok(ringMatches.length > 0);
  assert.strictEqual(ringMatches[0].evidenceId, 'EVD-COL-01-RINGS');
});

test('GAP17-12: Classification explicite des 11 sources non rattachées de GAP-14', () => {
  // Les 11 sources identifiées dans GAP-14
  const auditMatrix = [
    { sourceId: 'SRC-FRITH-1982', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-GIBBS-2001', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-GOODWIN-1983', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-HANZAB-1996', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-MCCARTHY-2006', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-DILGER-1960', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-MOREAU-1948', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-FRY-1988', expectedClass: 'LINKED_TO_CANONICAL_CLAIM' },
    { sourceId: 'SRC-COM-PSIT-2023', expectedClass: 'STANDARD_REFERENCE' },
    { sourceId: 'SRC-UOF-BAGUES-2024', expectedClass: 'STANDARD_REFERENCE' },
    { sourceId: 'SRC-COPELLO-1978', expectedClass: 'GENERAL_REFERENCE' }
  ];

  for (const item of auditMatrix) {
    assert.ok(hasBibliographicSource(item.sourceId), `La source ${item.sourceId} doit exister`);
    const source = getBibliographicSource(item.sourceId);
    assert.ok(source);

    const linkedRecords = getEvidenceForSource(item.sourceId);

    if (item.expectedClass === 'LINKED_TO_CANONICAL_CLAIM') {
      assert.ok(linkedRecords.length > 0, `${item.sourceId} doit avoir au moins 1 EvidenceRecord rattaché`);
    } else if (item.expectedClass === 'STANDARD_REFERENCE') {
      assert.ok(linkedRecords.length > 0, `${item.sourceId} doit être rattaché comme standard de référence`);
    } else if (item.expectedClass === 'GENERAL_REFERENCE') {
      assert.strictEqual(linkedRecords.length, 0, `${item.sourceId} (Copello 1978) est une référence générale et ne doit pas avoir d'EVD fictif`);
    }
  }

  // Vérifier le total global : 26 sources au total dans sources.ts
  const allSources = getAllBibliographicSources();
  assert.strictEqual(allSources.length, 26, 'BIBLIOGRAPHIC_SOURCES doit contenir exactement 26 sources');

  // Exactement 25 sources sont liées à au moins un EvidenceRecord (15 antérieures + 10 GAP-17)
  const linkedSourcesCount = allSources.filter(s => getEvidenceForSource(s.sourceId).length > 0).length;
  assert.strictEqual(linkedSourcesCount, 25, 'Exactement 25 sources doivent être liées à un ou plusieurs EvidenceRecords');

  // Exactement 1 source reste GENERAL_REFERENCE (Copello 1978) sans EVD artificiel
  const unlinkedSources = allSources.filter(s => getEvidenceForSource(s.sourceId).length === 0);
  assert.strictEqual(unlinkedSources.length, 1);
  assert.strictEqual(unlinkedSources[0].sourceId, 'SRC-COPELLO-1978');
});

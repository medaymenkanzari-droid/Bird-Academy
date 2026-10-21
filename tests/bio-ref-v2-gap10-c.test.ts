/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SUITE DE VALIDATION SCIENTIFIQUE GAP-10-C
 * Mission : Homologation Documentaire Scientifique Contrôlée
 * 
 * Vérifie les invariants épistémiques et techniques scellés lors de GAP-10-C :
 * 1. Préservation des statuts HUMAN_REVIEW_REQUIRED sans promotion abusive.
 * 2. Zéro invention de sources (SRC-*) ou de preuves (EVD-*) fictives.
 * 3. Cloisonnement strict des profils Agapornis (Roseicollis ≠ Fischeri ≠ Personatus).
 * 4. Préservation de l'identité canonique et de l'alias legacy de Colombe diamant.
 * 5. Maintien strict de l'état d'alerte HYBRID_CROSS_UNSUPPORTED dans le moteur génétique.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIOLOGICAL_SPECIES_REGISTRY,
  getBiologicalProfileById,
  isSpeciesDocumented,
  getBiologicalTraceability
} from '../src/reference/species/index.js';
import {
  EVIDENCE_REGISTRY,
  hasEvidenceRecord,
  hasBibliographicSource
} from '../src/reference/bibliography/evidenceRegistry.js';
import { CanonicalDataBridgeAdapter } from '../src/features/canonical/CanonicalDataBridgeAdapter.js';
import { GeneticsEngine } from '../src/features/genetics/engines/GeneticsEngine.js';
import type { Canari } from '../src/types/index.js';

test('GAP10C-01: Colombe diamant - Statut documentaire draft et données biologiques préservées', () => {
  const profile = getBiologicalProfileById('colombe_diamant');
  assert.ok(profile, 'Le profil canonique colombe_diamant doit exister');

  // Alias legacy
  const legacyProfile = getBiologicalProfileById('colombe');
  assert.strictEqual(profile, legacyProfile, 'L\'alias legacy colombe doit pointer de façon idempotente vers colombe_diamant');

  // Statut scientifique draft / HUMAN_REVIEW_REQUIRED (non clôturé unilatéralement)
  assert.equal(profile.traceability?.validationStatus, 'draft');
  assert.equal(isSpeciesDocumented('colombe_diamant'), false, 'Une espèce en draft ne doit pas être certifiée sans revue');
  assert.ok(profile.traceability?.disclaimer?.fr.includes('HUMAN_REVIEW_REQUIRED'));

  // Invariants biologiques stricts
  assert.equal(profile.reproduction.avgEggsPerClutch, 2);
  assert.equal(profile.reproduction.maxEggsPerClutch, 2);
  assert.equal(profile.reproduction.incubationPeriod, 13);
  assert.equal(profile.breeding.bandSize, '3.5 mm');
  assert.equal(profile.biology.minWeight, 35);
  assert.equal(profile.biology.maxWeight, 45);
  assert.equal(profile.management.hybridizationPossible, false);
});

test('GAP10C-02: Absence stricte d\'identifiants de sources ou de preuves inventés', () => {
  // Règle 6 : Interdiction de créer des identifiants non documentés formellement
  const forbiddenEvidencePrefixes = [
    'EVD-COL-',
    'EVD-AGA-FISC-',
    'EVD-AGA-PERS-',
    'EVD-AGAP-GEN-'
  ];

  for (const evidenceId of Object.keys(EVIDENCE_REGISTRY)) {
    for (const forbidden of forbiddenEvidencePrefixes) {
      assert.ok(
        !evidenceId.startsWith(forbidden),
        `L'identifiant de preuve interdit ${evidenceId} ne doit pas exister dans EVIDENCE_REGISTRY`
      );
    }
  }

  // Interdiction de la fausse source générale
  assert.equal(hasBibliographicSource('SRC-COM-COLUMBIDAE'), false, 'SRC-COM-COLUMBIDAE ne doit pas exister');
});

test('GAP10C-03: Agapornis - Cloisonnement comportemental et morphométrique absolu', () => {
  const roseicollis = getBiologicalProfileById('agapornis_roseicollis');
  const fischeri = getBiologicalProfileById('agapornis_fischeri');
  const personatus = getBiologicalProfileById('agapornis_personatus');

  assert.ok(roseicollis && fischeri && personatus, 'Les 3 profils Agapornis doivent exister séparément');

  // Transport des matériaux
  const roseicollisNest = roseicollis.breeding.nestType.fr.toLowerCase();
  assert.ok(roseicollisNest.includes('croupion'), 'Roseicollis transporte les matériaux dans son croupion');

  const fischeriNest = fischeri.breeding.nestType.fr.toLowerCase();
  assert.ok(fischeriNest.includes('bec') && fischeriNest.includes('croupion'), 'Fischeri transporte exclusivement au bec');

  const personatusNest = personatus.breeding.nestType.fr.toLowerCase();
  assert.ok(personatusNest.includes('bec') && personatusNest.includes('croupion'), 'Personatus transporte exclusivement au bec');

  // Diamètre de baguage
  assert.equal(roseicollis.breeding.bandSize, '4.5 mm');
  assert.equal(fischeri.breeding.bandSize, '4.0 mm');
  assert.equal(personatus.breeding.bandSize, '4.0 mm');

  // Durée d'incubation
  assert.equal(roseicollis.reproduction.incubationPeriod, 23);
  assert.equal(fischeri.reproduction.incubationPeriod, 22);
  assert.equal(personatus.reproduction.incubationPeriod, 22);
});

test('GAP10C-04: Mutation ap_blue - Statut HUMAN_REVIEW_REQUIRED maintenu sans promotion prématurée', () => {
  const resolution = CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ap_blue');
  assert.ok(resolution, 'ap_blue doit être résolu pour agapornis_personatus');
  assert.equal(resolution.status, 'HUMAN_REVIEW_REQUIRED', 'ap_blue doit rester sous HUMAN_REVIEW_REQUIRED');

  // Vérifier qu'aucun EVD-AGA-PERS n'a été inséré artificiellement
  assert.equal(hasEvidenceRecord('EVD-AGA-PERS-001'), false);
  assert.equal(hasEvidenceRecord('EVD-AGA-PERS-BLU'), false);

  // Zéro contamination croisée vers Roseicollis ou Fischeri
  const roseicollisBlue = CanonicalDataBridgeAdapter.resolveMutation('agapornis_roseicollis', 'ap_blue');
  assert.equal(roseicollisBlue.status, 'UNKNOWN', 'ap_blue ne doit pas être reconnu par Roseicollis');

  const fischeriBlue = CanonicalDataBridgeAdapter.resolveMutation('agapornis_fischeri', 'ap_blue');
  assert.equal(fischeriBlue.status, 'OUT_OF_SCOPE', 'ap_blue ne doit pas fuiter vers Fischeri');
});

test('GAP10C-05: Isolation du moteur d\'hybridation - Refus déterministe HYBRID_CROSS_UNSUPPORTED', () => {
  // Test interspécifique Agapornis : Roseicollis × Personatus
  const interAgapornis = GeneticsEngine.predictOffspringOutcomes(
    { id: 1, sexe: 'Mâle', espece: 'agapornis_roseicollis', mutation: 'ar_opaline' } as unknown as Canari,
    { id: 2, sexe: 'Femelle', espece: 'agapornis_personatus', mutation: 'ar_opaline' } as unknown as Canari
  );
  assert.equal(interAgapornis.status, 'HYBRID_CROSS_UNSUPPORTED');

  // Test interspécifique Agapornis : Fischeri × Personatus
  const fischeriPersonatus = GeneticsEngine.predictOffspringOutcomes(
    { id: 3, sexe: 'Mâle', espece: 'agapornis_fischeri', mutation: 'wild' } as unknown as Canari,
    { id: 4, sexe: 'Femelle', espece: 'agapornis_personatus', mutation: 'wild' } as unknown as Canari
  );
  assert.equal(fischeriPersonatus.status, 'HYBRID_CROSS_UNSUPPORTED');

  // Test Colombe × Canari
  const colombeCanari = GeneticsEngine.predictOffspringOutcomes(
    { id: 5, sexe: 'Mâle', espece: 'colombe_diamant', mutation: 'wild' } as unknown as Canari,
    { id: 6, sexe: 'Femelle', espece: 'canari', mutation: 'wild' } as unknown as Canari
  );
  assert.equal(colombeCanari.status, 'HYBRID_CROSS_UNSUPPORTED');
});

test('GAP10C1-01: Traçabilité fermée - 100% des sources citées dans GAP-10-C sont enregistrées dans sources.ts', () => {
  const requiredSourceIds = [
    'SRC-FRITH-1982',
    'SRC-GIBBS-2001',
    'SRC-GOODWIN-1983',
    'SRC-HANZAB-1996',
    'SRC-MCCARTHY-2006',
    'SRC-DILGER-1960',
    'SRC-MOREAU-1948',
    'SRC-FRY-1988',
    'SRC-COM-PSIT-2023',
    'SRC-UOF-BAGUES-2024',
    'SRC-MARTIN-2002',
    'SRC-VAN-DEN-ABEELE-2007'
  ];

  for (const sourceId of requiredSourceIds) {
    assert.ok(hasBibliographicSource(sourceId), `La source canonique ${sourceId} doit exister dans sources.ts`);
  }
});

test('GAP10C1-02: Vérification stricte des 4 sources prioritaires (Goodwin, HANZAB, McCarthy, Martin)', () => {
  // 1. Derek Goodwin (1983)
  assert.ok(hasBibliographicSource('SRC-GOODWIN-1983'));
  // 2. HANZAB Vol. 3 (1996)
  assert.ok(hasBibliographicSource('SRC-HANZAB-1996'));
  // 3. Eugene M. McCarthy (2006)
  assert.ok(hasBibliographicSource('SRC-MCCARTHY-2006'));
  // 4. Terry Martin (2002)
  assert.ok(hasBibliographicSource('SRC-MARTIN-2002'));
});

test('GAP10C1-03: Zéro référence orpheline dans evidenceRegistry.ts', () => {
  // Pour chaque enregistrement d'évidence existant, 100% des citations doivent pointer vers une source existante
  for (const [evidenceId, record] of Object.entries(EVIDENCE_REGISTRY)) {
    assert.ok(record.citations.length > 0, `L'evidence ${evidenceId} doit avoir au moins une citation`);
    for (const citation of record.citations) {
      assert.ok(
        hasBibliographicSource(citation.sourceId),
        `L'evidence ${evidenceId} cite une source introuvable : ${citation.sourceId}`
      );
    }
  }
});


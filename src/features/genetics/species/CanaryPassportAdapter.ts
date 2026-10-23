/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — ADAPTATEUR CONTRÔLÉ BIRD PASSPORT → GÉNÉTIQUE CANARI
 * Module Canonique : Serinus canaria domestica (Canari)
 * Version : V1.7.4 (Isolée / Anti-Inférence Stricte / Scellée)
 * 
 * GARANTIES D'ARCHITECTURE ET ÉPISTÉMIQUES (MISSION V1.7.4) :
 * 1. ZÉRO CANARY FALLBACK : Seule l'espèce 'canari' est admise. Tout fallback vers une autre espèce ou déduction purement nominative est proscrit.
 * 2. ZÉRO INFÉRENCE PHÉNOTYPIQUE FORCÉE : Phénotype observé -> POSSIBLE_SET (jamais confirmedGenotype homozygote sans preuve).
 * 3. ZÉRO FAUX CARRIER Z-LINKED CHEZ LA FEMELLE : Invariance cytogénétique ZW absolue (femelle uniallélique Z, carrierState = NOT_APPLICABLE, rejet strict des ZW_VIOLATION).
 * 4. ISABELLE NON-PRIMAIRE : Haplotype recombinant Z sensible à la phase parentale CIS/TRANS. Phase inconnue = POSSIBLE_SET.
 * 5. CONSERVATION DES CONTROVERSES & BLOCAGES : Satiné, Ino et Perle strictement sous statut CONFLICTING / BLOCKED (humanReviewRequired = true).
 * 6. PROVISOIRE ASSUMÉ : Ivoire maintenu en PROVISIONAL sans certitude de cartographie moléculaire.
 * 7. LÉTHALITÉ EMBRYONNAIRE : Facteurs létaux in ovo à 25% (Intensif, Huppé, Blanc Dominant) formellement découplés de la dominance simple.
 * 8. SNAPSHOT LEGACY-ONLY : Péridote et Pangée conservés hors du catalogue canonique actif.
 * 9. PRIORITÉ STRICTE DES DONNÉES : Canonical Data > Structured Passport Data > Legacy Compatibility Strings.
 * 10. SCELLEMENT DOCUMENTAIRE : Lecture seule du registre bibliographique existant. Zéro falsification d'EvidenceRecord.
 */

import type { BirdPassport } from '../../birds/models/passport/BirdPassport';
import {
  CANARY_MIGRATION_TABLE,
  CANARY_MIGRATION_READINESS_MATRIX,
  CanaryCanonicalMigrationAuditService,
  type CanonicalBirdGenetics,
  type CanonicalLocusRecord,
  type DeterminationType,
  type ProvenanceType,
  type TransmissionType,
  type SexConstraintType,
  type LethalityStatus,
  type HaplotypePhase,
  type CanaryMigrationEntry,
  type CanaryMigrationReadinessRecord,
  type MigrationClassification,
  type MigrationSafetyType
} from '../../canonical/audit/CanaryCanonicalMigrationAudit';
import type { EpistemicStatusType } from '../../../components/genetics/EpistemicStatusBadge';
import type { EpistemicConfidenceType } from '../../../components/genetics/EpistemicConfidenceBadge';
import type { HumanReviewStatusType } from '../../../components/genetics/HumanReviewBadge';
import { getEvidenceRecord } from '../../../reference/bibliography';

// =========================================================================
// TYPES D'ERREURS ET CODES DE RETOUR CONTRÔLÉS (SECTION 16)
// =========================================================================

export type CanaryAdapterErrorCode =
  | 'INVALID_SPECIES'
  | 'INVALID_SEX'
  | 'ZW_VIOLATION'
  | 'INVALID_ALLELE'
  | 'UNSUPPORTED_LOCUS'
  | 'BLOCKED_LOCUS'
  | 'INSUFFICIENT_DATA'
  | 'CONFLICT_REVIEW'
  | 'LEGACY_ONLY'
  | 'INVALID_CANONICAL_ALIAS';

export class CanaryPassportAdapterError extends Error {
  public readonly code: CanaryAdapterErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: CanaryAdapterErrorCode, details?: Record<string, unknown>) {
    super(message);
    this.name = 'CanaryPassportAdapterError';
    this.code = code;
    this.details = details;
  }
}

// =========================================================================
// TYPES DE DIAGNOSTIC ET RÉSULTATS D'ADAPTATION (SECTION 1)
// =========================================================================

export interface CanaryMigrationDiagnostic {
  locusId: string;
  category: MigrationSafetyType;
  action: 'MIGRATED' | 'MIGRATED_WITH_REVIEW' | 'BLOCKED_FROM_CROSS' | 'PRESERVED_LEGACY_ONLY' | 'REJECTED';
  rationale: string;
}

export interface CanaryLegacySnapshot {
  legacyId: string;
  legacyName: string;
  originalValue: string;
  epistemicStatus: string;
  humanReviewRequired: boolean;
  notes: string;
}

export interface CanaryAdaptationSuccess {
  success: true;
  genetics: CanonicalBirdGenetics;
  warnings: string[];
  notes: string[];
  humanReviewRequired: boolean;
  blockedLoci: string[];
  migrationDiagnostics: CanaryMigrationDiagnostic[];
  preservedLegacySnapshot: CanaryLegacySnapshot[];
}

export interface CanaryAdaptationFailure {
  success: false;
  errorCode: CanaryAdapterErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type CanaryAdaptationResult = CanaryAdaptationSuccess | CanaryAdaptationFailure;

// =========================================================================
// TYPES D'ENTRÉE TOLÉRANTS POUR LE PASSPORT CANARI
// =========================================================================

export interface CanonicalLocusInput {
  locusId?: string;
  locus?: string;
  displayName?: string;
  transmission?: TransmissionType | string;
  determination?: DeterminationType | string;
  alleles?: [string, string] | [string] | string[];
  possibleSet?: Array<[string, string] | [string]>;
  isCarrier?: boolean;
  carrierState?: string;
  status?: EpistemicStatusType | string;
  confidence?: EpistemicConfidenceType | string;
  humanReview?: HumanReviewStatusType | boolean;
  humanReviewRequired?: boolean;
  isProvisional?: boolean;
  conflictDetected?: boolean;
  provenance?: ProvenanceType | string;
  evidenceIds?: string[];
  notes?: string[];
  phase?: HaplotypePhase | string;
  hypotheses?: Array<{ genotype?: string; probability?: number; rationale?: string }>;
}

export interface CanaryPassportInput {
  identity?: {
    speciesId?: string;
    sex?: string;
    name?: string;
    bandNumber?: string;
    [key: string]: any;
  };
  canonicalLoci?: CanonicalLocusInput[];
  genetics?: {
    canonicalLoci?: CanonicalLocusInput[];
    knownMutations?: any[];
    loci?: Record<string, any> | any[];
    [key: string]: any;
  };
  passport?: {
    canonicalLoci?: CanonicalLocusInput[];
    [key: string]: any;
  };
  // Champs plats legacy de compatibilité
  id?: string | number;
  nom?: string;
  bague?: string;
  espece?: string;
  speciesId?: string;
  sexe?: string;
  sex?: string;
  mutation?: string;
  couleur?: string;
  couleur_base?: string;
  facteur?: string;
  [key: string]: any;
}

export interface CanaryAdaptOptions {
  strictValidation?: boolean;
}

// =========================================================================
// CLASSE CANARY PASSPORT ADAPTER
// =========================================================================

export class CanaryPassportAdapter {

  /**
   * Normalise l'identifiant d'espèce en garantissant l'étanchéité taxonomique.
   */
  public static normalizeSpecies(rawSpecies?: string): string {
    if (!rawSpecies || typeof rawSpecies !== 'string') return '';
    const s = rawSpecies.toLowerCase().trim();
    if (
      s === 'canari' ||
      s === 'canary' ||
      s === 'serinus_canaria' ||
      s === 'serinus_canaria_domestica' ||
      s === 'serinus canaria' ||
      s === 'canari couleur' ||
      s === 'canari posture' ||
      s === 'canari chant'
    ) {
      return 'canari';
    }
    return s;
  }

  /**
   * Normalise le sexe selon le modèle cytogénétique aviaire (ZZ = Mâle, ZW = Femelle).
   */
  public static normalizeSex(rawSex?: string): 'MALE' | 'FEMALE' | 'UNKNOWN' {
    if (!rawSex || typeof rawSex !== 'string') return 'UNKNOWN';
    const s = rawSex.toUpperCase().trim();
    if (s === 'M' || s === 'MÂLE' || s === 'MALE' || s === 'ZZ') return 'MALE';
    if (s === 'F' || s === 'FEMELLE' || s === 'FEMALE' || s === 'ZW') return 'FEMALE';
    return 'UNKNOWN';
  }

  /**
   * Résout une clé de locus (canonique, alias ou legacy) vers l'enregistrement de migration.
   */
  public static resolveLocusKey(key: string): {
    canonicalId: string;
    isAlias: boolean;
    isDeprecatedAutosomalIno: boolean;
    isProhibitedPrimaryIsabelle: boolean;
    entry?: CanaryMigrationEntry;
    readiness?: CanaryMigrationReadinessRecord;
  } {
    const cleanKey = key.trim();
    const upperKey = cleanKey.toUpperCase();

    // 1. Détection de l'alias interdit CAN_LOC_INO_AUTOSOMAL
    if (upperKey === 'CAN_LOC_INO_AUTOSOMAL') {
      const entry = CanaryCanonicalMigrationAuditService.getEntryByCanonicalId('CAN_LOC_INO');
      const readiness = CanaryCanonicalMigrationAuditService.getReadinessEntryByCanonicalId('CAN_LOC_INO');
      return {
        canonicalId: 'CAN_LOC_INO',
        isAlias: true,
        isDeprecatedAutosomalIno: true,
        isProhibitedPrimaryIsabelle: false,
        entry,
        readiness
      };
    }

    // 2. Détection du faux locus primaire CAN_LOC_ISABELLE
    if (upperKey === 'CAN_LOC_ISABELLE') {
      const entry = CanaryCanonicalMigrationAuditService.getEntryByCanonicalId('CAN_HAPLO_ISABELLE');
      const readiness = CanaryCanonicalMigrationAuditService.getReadinessEntryByCanonicalId('CAN_HAPLO_ISABELLE');
      return {
        canonicalId: 'CAN_HAPLO_ISABELLE',
        isAlias: true,
        isDeprecatedAutosomalIno: false,
        isProhibitedPrimaryIsabelle: true,
        entry,
        readiness
      };
    }

    // 3. Recherche canonique directe
    let entry = CanaryCanonicalMigrationAuditService.getEntryByCanonicalId(cleanKey);
    let readiness = CanaryCanonicalMigrationAuditService.getReadinessEntryByCanonicalId(cleanKey);

    // 4. Recherche par legacyId si non trouvé
    if (!entry) {
      entry = CanaryCanonicalMigrationAuditService.getEntryByLegacyId(cleanKey);
      if (entry) {
        readiness = CanaryCanonicalMigrationAuditService.getReadinessEntryByCanonicalId(entry.canonicalLocusId);
      }
    }

    return {
      canonicalId: entry ? entry.canonicalLocusId : cleanKey,
      isAlias: false,
      isDeprecatedAutosomalIno: false,
      isProhibitedPrimaryIsabelle: false,
      entry,
      readiness
    };
  }

  /**
   * Adapte un BirdPassport Canari vers le modèle CanonicalBirdGenetics (Contrat d'entrée / sortie déterministe).
   */
  public static adaptPassportToCanary(
    passport: CanaryPassportInput,
    options: CanaryAdaptOptions = {}
  ): CanaryAdaptationResult {
    const warnings: string[] = [];
    const notes: string[] = [];
    const blockedLoci: string[] = [];
    const migrationDiagnostics: CanaryMigrationDiagnostic[] = [];
    const preservedLegacySnapshot: CanaryLegacySnapshot[] = [];

    // =========================================================================
    // 1. VALIDATION STRICTE DE L'ESPÈCE (SECTION 2 — ANTI-CANARY FALLBACK)
    // =========================================================================
    const rawSpecies =
      passport?.identity?.speciesId ||
      passport?.espece ||
      passport?.speciesId ||
      '';

    if (!rawSpecies || typeof rawSpecies !== 'string' || rawSpecies.trim() === '') {
      return {
        success: false,
        errorCode: 'INSUFFICIENT_DATA',
        message: "Espèce non renseignée dans le BirdPassport. Seule l'espèce 'canari' (Serinus canaria domestica) est admise. Tout fallback automatique est interdit.",
        details: { rawSpecies }
      };
    }

    const normalizedSpecies = this.normalizeSpecies(rawSpecies);
    if (normalizedSpecies !== 'canari') {
      return {
        success: false,
        errorCode: 'INVALID_SPECIES',
        message: `Espèce non supportée par l'adaptateur Canari : '${rawSpecies}'. Seule l'espèce 'canari' est admise. Tout fallback vers Gould ou une autre espèce est interdit.`,
        details: { rawSpecies, normalizedSpecies }
      };
    }

    // =========================================================================
    // 2. VALIDATION STRICTE DU SEXE (SECTION 3 — ZZ / ZW)
    // =========================================================================
    const rawSex =
      passport?.identity?.sex ||
      passport?.sexe ||
      passport?.sex ||
      '';

    const sex = this.normalizeSex(rawSex);

    // =========================================================================
    // 3. EXTRACTION DES DONNÉES SELON ORDRE DE PRIORITÉ (SECTION 4)
    // CANONICAL DATA > STRUCTURED PASSPORT DATA > LEGACY DATA
    // =========================================================================
    const rawCanonicalList =
      passport?.canonicalLoci ||
      passport?.genetics?.canonicalLoci ||
      passport?.passport?.canonicalLoci ||
      (Array.isArray(passport?.genetics?.loci) ? passport.genetics.loci : undefined);

    const lociMap: Record<string, CanonicalLocusRecord> = {};
    let globalHumanReview = false;
    let globalConflict = false;
    let globalProvisional = false;

    if (rawCanonicalList && Array.isArray(rawCanonicalList) && rawCanonicalList.length > 0) {
      // -----------------------------------------------------------------------
      // MODE CANONIQUE PRIORITAIRE
      // -----------------------------------------------------------------------
      notes.push('Données canoniques explicites détectées et chargées en priorité absolue.');

      for (const rawLocus of rawCanonicalList) {
        const key = rawLocus.locusId || rawLocus.locus || '';
        if (!key) continue;

        const resolution = this.resolveLocusKey(key);
        const { canonicalId, entry, readiness } = resolution;

        if (resolution.isDeprecatedAutosomalIno) {
          warnings.push("Alias 'CAN_LOC_INO_AUTOSOMAL' détecté : redirigé vers 'CAN_LOC_INO' sous statut CONFLICTING / BLOCKED.");
        }
        if (resolution.isProhibitedPrimaryIsabelle) {
          warnings.push("Locus primaire interdit 'CAN_LOC_ISABELLE' détecté : redirigé vers l'haplotype recombinant 'CAN_HAPLO_ISABELLE'.");
        }

        if (!entry || !readiness) {
          warnings.push(`Locus non répertorié '${key}' ignoré par le catalogue canonique.`);
          continue;
        }

        // --- GESTION DU CHROMOSOME Z & RÈGLES CYTOGÉNÉTIQUES ZW ---
        const isZLinked = entry.transmission === 'Z_LINKED_RECESSIVE';
        const inputAlleles = rawLocus.alleles
          ? (Array.isArray(rawLocus.alleles) ? rawLocus.alleles : [rawLocus.alleles])
          : undefined;

        if (isZLinked && sex === 'FEMALE') {
          // Règle ZW 1 : Une femelle ZW ne peut jamais avoir 2 allèles Z
          if (inputAlleles && inputAlleles.length > 1) {
            return {
              success: false,
              errorCode: 'ZW_VIOLATION',
              message: `Violation cytogénétique ZW sur le locus ${canonicalId} : Une femelle Canari ZW ne possède qu'un seul chromosome Z et ne peut pas être diploïde pour un locus Z-linked.`,
              details: { canonicalId, sex, alleles: inputAlleles }
            };
          }

          // Règle ZW 2 : Une femelle ZW ne peut jamais être porteuse d'un locus Z-linked
          const isCarrierInput =
            rawLocus.isCarrier === true ||
            rawLocus.carrierState === 'CONFIRMED' ||
            rawLocus.carrierState === 'CONFIRMED_CARRIER' ||
            rawLocus.carrierState === 'POSSIBLE';

          if (isCarrierInput) {
            return {
              success: false,
              errorCode: 'ZW_VIOLATION',
              message: `Violation cytogénétique ZW sur le locus ${canonicalId} : Une femelle Canari ZW exprime obligatoirement son unique allèle Z et ne peut jamais être porteuse (carrier).`,
              details: { canonicalId, sex, carrierState: rawLocus.carrierState }
            };
          }
        }

        // --- DÉTERMINATION & ÉPISTÉMOLOGIE ---
        let determination: DeterminationType = 'UNKNOWN';
        let confirmedGenotype: [string, string] | [string] | undefined = undefined;
        let possibleSet: Array<[string, string] | [string]> | undefined = rawLocus.possibleSet;

        const rawProvenance: ProvenanceType =
          rawLocus.provenance === 'GENETICALLY_CONFIRMED' ||
          rawLocus.status === 'GENETICALLY_CONFIRMED'
            ? 'GENETICALLY_CONFIRMED'
            : rawLocus.provenance === 'OBSERVED' || rawLocus.status === 'OBSERVED'
            ? 'OBSERVED'
            : rawLocus.provenance === 'INFERRED' || rawLocus.status === 'INFERRED'
            ? 'INFERRED'
            : 'DECLARED';

        // Statut de revue humaine
        const locusReviewRequired =
          rawLocus.humanReviewRequired === true ||
          rawLocus.humanReview === true ||
          rawLocus.humanReview === 'REVIEW_REQUIRED' ||
          rawLocus.humanReview === 'CONFLICT_REVIEW' ||
          readiness.humanReviewRequired;

        const locusConflict =
          rawLocus.conflictDetected === true ||
          rawLocus.humanReview === 'CONFLICT_REVIEW' ||
          readiness.migrationSafety === 'BLOCKED' ||
          readiness.epistemicStatus === 'CONFLICTING';

        const locusProvisional =
          rawLocus.isProvisional === true ||
          readiness.epistemicStatus === 'PROVISIONAL';

        // --- TRAITEMENT SELON LA CATÉGORIE DU CATALOGUE ---
        if (readiness.migrationSafety === 'BLOCKED') {
          // 1. BLOCKED (Satiné, Ino, Perle)
          blockedLoci.push(canonicalId);
          globalHumanReview = true;
          globalConflict = true;

          determination = rawLocus.possibleSet ? 'POSSIBLE_SET' : 'UNKNOWN';
          confirmedGenotype = undefined; // Jamais de certification pour les loci bloqués

          lociMap[canonicalId] = {
            locusId: canonicalId,
            displayName: entry.canonicalDisplayName,
            transmission: entry.transmission,
            determination,
            possibleSet: rawLocus.possibleSet,
            carrierState: isZLinked && sex === 'FEMALE' ? 'NOT_APPLICABLE' : 'UNKNOWN',
            epistemic: {
              status: 'CONFLICTING',
              confidence: 'MEDIUM',
              provenance: rawProvenance,
              humanReviewRequired: true,
              conflictDetected: true,
              isProvisional: false
            },
            evidenceIds: entry.evidenceIds,
            notes: [readiness.blockingReason || entry.scientificRationale],
            blocked: true
          };

          migrationDiagnostics.push({
            locusId: canonicalId,
            category: 'BLOCKED',
            action: 'BLOCKED_FROM_CROSS',
            rationale: readiness.blockingReason || entry.scientificRationale
          });

        } else if (readiness.migrationSafety === 'KEEP_LEGACY_ONLY') {
          // 2. KEEP_LEGACY_ONLY (Péridote, Pangée)
          preservedLegacySnapshot.push({
            legacyId: readiness.legacyId,
            legacyName: readiness.legacyName,
            originalValue: key,
            epistemicStatus: readiness.epistemicStatus,
            humanReviewRequired: true,
            notes: readiness.blockingReason || 'Conservé en snapshot legacy-only.'
          });

          migrationDiagnostics.push({
            locusId: canonicalId,
            category: 'KEEP_LEGACY_ONLY',
            action: 'PRESERVED_LEGACY_ONLY',
            rationale: readiness.blockingReason || 'Données scientifiques insuffisantes.'
          });

        } else if (readiness.migrationSafety === 'MIGRATE_WITH_REVIEW') {
          // 3. MIGRATE_WITH_REVIEW (Isabelle, Ivoire, Composite)
          globalHumanReview = true;
          if (locusProvisional) globalProvisional = true;

          if (canonicalId === 'CAN_HAPLO_ISABELLE') {
            // Isabelle Recombinant Haplotype
            const phaseInput = (rawLocus.phase as HaplotypePhase) || 'PHASE_UNKNOWN';
            const isabelleModel = CanaryCanonicalMigrationAuditService.resolveIsabelleModel(phaseInput);

            determination = phaseInput === 'PHASE_UNKNOWN' ? 'POSSIBLE_SET' : 'CONFIRMED';
            possibleSet = isabelleModel.possibleSet
              ? [
                  ['Z_br_ag', 'Z_+_+'],
                  ['Z_br_+', 'Z_+_ag']
                ]
              : undefined;

            lociMap[canonicalId] = {
              locusId: canonicalId,
              displayName: entry.canonicalDisplayName,
              transmission: 'RECOMBINANT_HAPLOTYPE',
              determination,
              confirmedGenotype: phaseInput !== 'PHASE_UNKNOWN' && inputAlleles
                ? (inputAlleles as [string, string])
                : undefined,
              possibleSet,
              carrierState: sex === 'FEMALE' ? 'NOT_APPLICABLE' : 'UNKNOWN',
              epistemic: {
                status: 'VERIFIED',
                confidence: phaseInput === 'PHASE_UNKNOWN' ? 'MEDIUM' : 'HIGH',
                provenance: rawProvenance,
                humanReviewRequired: true,
                conflictDetected: false,
                isProvisional: true // Taux r ≈ 2% est PROVISIONAL
              },
              evidenceIds: entry.evidenceIds,
              notes: [entry.scientificRationale]
            };

          } else if (canonicalId === 'CAN_LOC_IVOIRE') {
            // Ivoire
            let ivCarrier: 'NOT_APPLICABLE' | 'NONE' | 'POSSIBLE' | 'CONFIRMED' | 'UNKNOWN' =
              sex === 'FEMALE' ? 'NOT_APPLICABLE' : 'UNKNOWN';

            if (sex === 'MALE' && rawLocus.carrierState) {
              ivCarrier = rawLocus.carrierState === 'CONFIRMED' ? 'CONFIRMED' : 'POSSIBLE';
            }

            lociMap[canonicalId] = {
              locusId: canonicalId,
              displayName: entry.canonicalDisplayName,
              transmission: entry.transmission,
              determination: rawProvenance === 'GENETICALLY_CONFIRMED' && inputAlleles ? 'CONFIRMED' : 'POSSIBLE_SET',
              confirmedGenotype: rawProvenance === 'GENETICALLY_CONFIRMED' && inputAlleles
                ? (sex === 'FEMALE' ? [inputAlleles[0]] : (inputAlleles as [string, string]))
                : (sex === 'FEMALE' && inputAlleles ? [inputAlleles[0]] : undefined),
              possibleSet: sex === 'MALE' && !inputAlleles ? [['Z_+', 'Z_+'], ['Z_iv', 'Z_+']] : undefined,
              carrierState: ivCarrier,
              epistemic: {
                status: 'PROVISIONAL',
                confidence: 'MEDIUM',
                provenance: rawProvenance,
                humanReviewRequired: true,
                conflictDetected: false,
                isProvisional: true
              },
              evidenceIds: entry.evidenceIds,
              notes: [entry.scientificRationale]
            };

          } else {
            // Composite Lutino / Rubino / Albino
            lociMap[canonicalId] = {
              locusId: canonicalId,
              displayName: entry.canonicalDisplayName,
              transmission: 'COMPOSITE_PHENOTYPE',
              determination: 'POSSIBLE_SET',
              carrierState: 'UNKNOWN',
              epistemic: {
                status: 'NEEDS_HUMAN_REVIEW',
                confidence: 'LOW',
                provenance: rawProvenance,
                humanReviewRequired: true,
                conflictDetected: false,
                isProvisional: false
              },
              evidenceIds: entry.evidenceIds,
              notes: [entry.scientificRationale]
            };
          }

          migrationDiagnostics.push({
            locusId: canonicalId,
            category: 'MIGRATE_WITH_REVIEW',
            action: 'MIGRATED_WITH_REVIEW',
            rationale: readiness.blockingReason || entry.scientificRationale
          });

        } else {
          // 4. SAFE_TO_MIGRATE (17 loci)
          let carrier: 'NOT_APPLICABLE' | 'NONE' | 'POSSIBLE' | 'CONFIRMED' | 'UNKNOWN' = 'NONE';

          if (isZLinked && sex === 'FEMALE') {
            carrier = 'NOT_APPLICABLE';
          } else if (rawLocus.carrierState === 'CONFIRMED' || rawLocus.isCarrier === true) {
            carrier = 'CONFIRMED';
          } else if (rawLocus.carrierState === 'POSSIBLE') {
            carrier = 'POSSIBLE';
          } else {
            carrier = 'UNKNOWN';
          }

          // Règle Section 9 : Phénotype observé ne devient jamais génotype confirmé homozygote pour un mâle/autosome
          if (rawProvenance === 'GENETICALLY_CONFIRMED' && inputAlleles) {
            determination = 'CONFIRMED';
            confirmedGenotype = sex === 'FEMALE' && isZLinked
              ? [inputAlleles[0]]
              : (inputAlleles as [string, string]);
          } else if (rawProvenance === 'OBSERVED' && inputAlleles) {
            if (sex === 'FEMALE' && isZLinked) {
              determination = 'CONFIRMED'; // Hémizygote ZW mathématiquement uniallélique
              confirmedGenotype = [inputAlleles[0]];
            } else {
              determination = 'POSSIBLE_SET';
              confirmedGenotype = undefined;
              possibleSet = [
                [inputAlleles[0], inputAlleles[0]],
                [inputAlleles[0], entry.alleles[0] || '+']
              ];
            }
          } else {
            determination = (rawLocus.determination as DeterminationType) || 'POSSIBLE_SET';
            possibleSet = rawLocus.possibleSet;
          }

          // Facteur létal
          if (entry.lethality === 'HOMOZYGOUS_LETHAL_EMBRYONIC_25') {
            if (confirmedGenotype && confirmedGenotype[0] === entry.alleles[1] && confirmedGenotype[1] === entry.alleles[1]) {
              warnings.push(`Alerte létalité in ovo : Le génotype homozygote muté sur ${canonicalId} est létal embryonnaire à 25%.`);
            }
          }

          lociMap[canonicalId] = {
            locusId: canonicalId,
            displayName: entry.canonicalDisplayName,
            transmission: entry.transmission,
            determination,
            confirmedGenotype,
            possibleSet,
            carrierState: carrier,
            epistemic: {
              status: entry.epistemicStatus,
              confidence: rawProvenance === 'GENETICALLY_CONFIRMED' ? 'VERY_HIGH' : 'MEDIUM',
              provenance: rawProvenance,
              humanReviewRequired: false,
              conflictDetected: false,
              isProvisional: false
            },
            evidenceIds: entry.evidenceIds,
            notes: entry.scientificRationale ? [entry.scientificRationale] : []
          };

          migrationDiagnostics.push({
            locusId: canonicalId,
            category: 'SAFE_TO_MIGRATE',
            action: 'MIGRATED',
            rationale: 'Modèle canonique structurel validé.'
          });
        }
      }

    } else {
      // -----------------------------------------------------------------------
      // MODE LEGACY FALLBACK CONTRÔLÉ (SECTION 15)
      // -----------------------------------------------------------------------
      const legacyMutation = (passport.mutation || '').trim().toLowerCase();
      const legacyCouleur = (passport.couleur || '').trim().toLowerCase();
      const fullLegacyText = `${legacyMutation} ${legacyCouleur}`.trim();

      if (fullLegacyText) {
        notes.push('Données legacy détectées : conversion contrôlée sans inférence homozygote certaine.');

        // Analyse par mots-clés
        const checkAndAddLegacy = (keyword: string, legacyKey: string) => {
          if (fullLegacyText.includes(keyword)) {
            const resolution = this.resolveLocusKey(legacyKey);
            const { canonicalId, entry, readiness } = resolution;

            if (entry && readiness) {
              if (readiness.migrationSafety === 'BLOCKED') {
                blockedLoci.push(canonicalId);
                globalHumanReview = true;
                globalConflict = true;

                lociMap[canonicalId] = {
                  locusId: canonicalId,
                  displayName: entry.canonicalDisplayName,
                  transmission: entry.transmission,
                  determination: 'UNKNOWN',
                  carrierState: entry.transmission === 'Z_LINKED_RECESSIVE' && sex === 'FEMALE' ? 'NOT_APPLICABLE' : 'UNKNOWN',
                  epistemic: {
                    status: 'CONFLICTING',
                    confidence: 'LOW',
                    provenance: 'DECLARED',
                    humanReviewRequired: true,
                    conflictDetected: true,
                    isProvisional: false
                  },
                  evidenceIds: entry.evidenceIds,
                  notes: [readiness.blockingReason || entry.scientificRationale],
                  blocked: true
                };

                migrationDiagnostics.push({
                  locusId: canonicalId,
                  category: 'BLOCKED',
                  action: 'BLOCKED_FROM_CROSS',
                  rationale: readiness.blockingReason || entry.scientificRationale
                });

              } else if (readiness.migrationSafety === 'KEEP_LEGACY_ONLY') {
                preservedLegacySnapshot.push({
                  legacyId: readiness.legacyId,
                  legacyName: readiness.legacyName,
                  originalValue: fullLegacyText,
                  epistemicStatus: 'INSUFFICIENT_EVIDENCE',
                  humanReviewRequired: true,
                  notes: readiness.blockingReason || 'Conservé en snapshot legacy-only.'
                });

                migrationDiagnostics.push({
                  locusId: canonicalId,
                  category: 'KEEP_LEGACY_ONLY',
                  action: 'PRESERVED_LEGACY_ONLY',
                  rationale: 'Données scientifiques insuffisantes.'
                });

              } else if (readiness.migrationSafety === 'MIGRATE_WITH_REVIEW') {
                globalHumanReview = true;
                if (canonicalId === 'CAN_HAPLO_ISABELLE') {
                  lociMap[canonicalId] = {
                    locusId: canonicalId,
                    displayName: entry.canonicalDisplayName,
                    transmission: 'RECOMBINANT_HAPLOTYPE',
                    determination: 'POSSIBLE_SET',
                    possibleSet: [
                      ['Z_br_ag', 'Z_+_+'],
                      ['Z_br_+', 'Z_+_ag']
                    ],
                    carrierState: sex === 'FEMALE' ? 'NOT_APPLICABLE' : 'UNKNOWN',
                    epistemic: {
                      status: 'VERIFIED',
                      confidence: 'LOW',
                      provenance: 'DECLARED',
                      humanReviewRequired: true,
                      conflictDetected: false,
                      isProvisional: true
                    },
                    evidenceIds: entry.evidenceIds,
                    notes: [entry.scientificRationale]
                  };
                } else {
                  lociMap[canonicalId] = {
                    locusId: canonicalId,
                    displayName: entry.canonicalDisplayName,
                    transmission: entry.transmission,
                    determination: 'POSSIBLE_SET',
                    carrierState: entry.transmission === 'Z_LINKED_RECESSIVE' && sex === 'FEMALE' ? 'NOT_APPLICABLE' : 'UNKNOWN',
                    epistemic: {
                      status: entry.epistemicStatus,
                      confidence: 'LOW',
                      provenance: 'DECLARED',
                      humanReviewRequired: true,
                      conflictDetected: false,
                      isProvisional: readiness.epistemicStatus === 'PROVISIONAL'
                    },
                    evidenceIds: entry.evidenceIds,
                    notes: [entry.scientificRationale]
                  };
                }

                migrationDiagnostics.push({
                  locusId: canonicalId,
                  category: 'MIGRATE_WITH_REVIEW',
                  action: 'MIGRATED_WITH_REVIEW',
                  rationale: readiness.blockingReason || entry.scientificRationale
                });

              } else {
                // SAFE_TO_MIGRATE
                // Règle Section 15 : JAMAIS confirmedGenotype = Z_br/Z_br
                const isZ = entry.transmission === 'Z_LINKED_RECESSIVE';
                lociMap[canonicalId] = {
                  locusId: canonicalId,
                  displayName: entry.canonicalDisplayName,
                  transmission: entry.transmission,
                  determination: sex === 'FEMALE' && isZ ? 'CONFIRMED' : 'POSSIBLE_SET',
                  confirmedGenotype: sex === 'FEMALE' && isZ ? [entry.alleles[1]] : undefined,
                  possibleSet: sex === 'MALE' || !isZ
                    ? [
                        [entry.alleles[1], entry.alleles[1]],
                        [entry.alleles[1], entry.alleles[0]]
                      ]
                    : undefined,
                  carrierState: isZ && sex === 'FEMALE' ? 'NOT_APPLICABLE' : 'UNKNOWN',
                  epistemic: {
                    status: entry.epistemicStatus,
                    confidence: 'LOW',
                    provenance: 'DECLARED',
                    humanReviewRequired: false,
                    conflictDetected: false,
                    isProvisional: false
                  },
                  evidenceIds: entry.evidenceIds,
                  notes: [entry.scientificRationale]
                };

                migrationDiagnostics.push({
                  locusId: canonicalId,
                  category: 'SAFE_TO_MIGRATE',
                  action: 'MIGRATED',
                  rationale: 'Déduction déclarative legacy avec conservation du possibleSet.'
                });
              }
            }
          }
        };

        // Cartographie legacy
        checkAndAddLegacy('brun', 'can_br');
        checkAndAddLegacy('agate', 'can_ag');
        checkAndAddLegacy('pastel', 'can_pa');
        checkAndAddLegacy('ivoire', 'can_iv');
        checkAndAddLegacy('isabelle', 'can_is');
        checkAndAddLegacy('satiné', 'can_sa');
        checkAndAddLegacy('satine', 'can_sa');
        checkAndAddLegacy('ino', 'can_ino');
        checkAndAddLegacy('perle', 'can_var_perle');
        checkAndAddLegacy('péridote', 'can_peri');
        checkAndAddLegacy('peridote', 'can_peri');
        checkAndAddLegacy('pangée', 'can_pangea');
        checkAndAddLegacy('pangea', 'can_pangea');
        checkAndAddLegacy('intensif', 'can_in');
        checkAndAddLegacy('huppé', 'can_cr');
        checkAndAddLegacy('huppe', 'can_cr');
        checkAndAddLegacy('blanc dominant', 'can_wh_dom');
        checkAndAddLegacy('blanc récessif', 'can_wh_rec');
        checkAndAddLegacy('blanc recessif', 'can_wh_rec');
        checkAndAddLegacy('opale', 'can_op');
        checkAndAddLegacy('phaéo', 'can_ph');
        checkAndAddLegacy('phaeo', 'can_ph');
        checkAndAddLegacy('topaze', 'can_to');
        checkAndAddLegacy('eumo', 'can_eu');
        checkAndAddLegacy('onyx', 'can_on');
        checkAndAddLegacy('cobalt', 'can_co');
        checkAndAddLegacy('jaspe', 'can_ja');
        checkAndAddLegacy('mogno', 'can_mo');
        checkAndAddLegacy('urucum', 'can_ur');
        checkAndAddLegacy('mosaïque', 'can_mos');
        checkAndAddLegacy('mosaique', 'can_mos');
        checkAndAddLegacy('lutino', 'can_lutino');
        checkAndAddLegacy('rubino', 'can_lutino');
        checkAndAddLegacy('albinos', 'can_lutino');
      }
    }

    // =========================================================================
    // 4. ASSEMBLAGE DE CANONICAL BIRD GENETICS
    // =========================================================================
    const genetics: CanonicalBirdGenetics = {
      speciesId: 'canari',
      sex,
      loci: lociMap,
      provenance: rawCanonicalList && rawCanonicalList.length > 0 ? 'GENETICALLY_CONFIRMED' : 'DECLARED',
      confidence: globalConflict ? 'LOW' : globalProvisional ? 'MEDIUM' : 'HIGH',
      humanReviewRequired: globalHumanReview,
      conflictDetected: globalConflict,
      isProvisional: globalProvisional
    };

    return {
      success: true,
      genetics,
      warnings,
      notes,
      humanReviewRequired: globalHumanReview,
      blockedLoci,
      migrationDiagnostics,
      preservedLegacySnapshot
    };
  }

  /**
   * Adapte un BirdPassport Canari ou jette une exception typée CanaryPassportAdapterError.
   */
  public static adaptPassportToCanaryOrThrow(
    passport: CanaryPassportInput,
    options: CanaryAdaptOptions = {}
  ): CanaryAdaptationSuccess {
    const result = this.adaptPassportToCanary(passport, options);
    if (!result.success) {
      throw new CanaryPassportAdapterError(result.message, result.errorCode, result.details);
    }
    return result;
  }
}

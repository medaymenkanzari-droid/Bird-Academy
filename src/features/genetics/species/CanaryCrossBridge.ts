/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PONT DE CROISEMENT GÉNÉTIQUE CANARI (V1.7.6)
 * Module Canonique : Serinus canaria domestica (Canari)
 * Version : V1.7.6 (Couche d'Orchestration / Lecture Seule / Scellée)
 * 
 * GARANTIES D'ARCHITECTURE ET ÉPISTÉMIQUES (MISSION V1.7.6) :
 * 1. PIPELINE STRICT OBLIGATOIRE :
 *    BirdPassport (mâle/femelle) -> CanaryPassportAdapter -> CanonicalBirdGenetics -> CanaryCrossEngine -> BridgeResult.
 *    Aucune étape ne contourne l'adaptateur ni le moteur de croisement.
 * 2. ZÉRO CANARY FALLBACK / ZÉRO GOULD FALLBACK :
 *    Les deux parents doivent obligatoirement être de l'espèce 'canari'. Rejet strict de toute autre espèce.
 * 3. ZÉRO ÉCRITURE / LECTURE SEULE STRICTE :
 *    Ne modifie aucun BirdPassport, aucun oiseau, aucune généalogie. N'écrit JAMAIS dans localStorage.
 * 4. ZÉRO RECOMMANDATION / ZÉRO SCORE :
 *    Aucun système d'étoiles, aucun score d'accouplement ("bon/mauvais couple", "à privilégier/à éviter" proscrits).
 * 5. PRÉSERVATION INTÉGRALE DES STATUTS SCIENTIFIQUES :
 *    - Loci bloqués (Ino, Satiné, Perle) isolés avec statut CONFLICTING et humanReviewRequired, sans bloquer les loci indépendants.
 *    - Facteurs létaux (Intensif, Crest, Blanc Dominant) exposés dans lethalRisks avec risque théorique in ovo à 25%.
 *    - Haplotype Isabelle : transmission des phases CIS, TRANS et POSSIBLE_SET sans sélection arbitraire.
 *    - Ivoire : maintien du statut PROVISIONAL et humanReviewRequired.
 *    - Mutations émergentes (Péridote, Pangée) : isolées en KEEP_LEGACY_ONLY sans probabilité mendélienne inventée.
 * 6. SCELLEMENT DOCUMENTAIRE :
 *    Registre bibliographique SEALED intact (lecture seule, zéro nouveau EvidenceRecord ou citation).
 */

import {
  CanaryPassportAdapter,
  type CanaryPassportInput,
  type CanaryAdaptationResult,
  type CanaryAdaptationSuccess,
  type CanaryMigrationDiagnostic
} from './CanaryPassportAdapter';

import {
  CanaryCrossEngine,
  type CanaryCrossResult,
  type CanaryCrossSuccess,
  type CanaryLocusCrossResult,
  type CanaryLethalRiskResult,
  type CanaryCrossErrorCode
} from './CanaryCrossEngine';

import type {
  CanonicalBirdGenetics,
  ProvenanceType
} from '../../canonical/audit/CanaryCanonicalMigrationAudit';

import { BirdRepository } from '../../birds/repositories/BirdRepository';
import type { Canari } from '../../../types';

// =========================================================================
// TYPES DE RÉSULTAT DU CANARY CROSS BRIDGE
// =========================================================================

export type CanaryBridgeStatus =
  | 'SUCCESS'
  | 'WARNING'
  | 'BLOCKED'
  | 'INSUFFICIENT_INFORMATION'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'ERROR';

export interface CanaryCrossBridgeSuccess {
  success: true;
  status: CanaryBridgeStatus;
  speciesId: 'canari';
  maleBirdId?: string | number;
  femaleBirdId?: string | number;
  geneticsResult: CanaryCrossSuccess;
  locusResults: CanaryLocusCrossResult[];
  lethalRisks: CanaryLethalRiskResult[];
  blockedLoci: string[];
  insufficientInformation: string[];
  warnings: string[];
  notes: string[];
  humanReviewRequired: boolean;
  evidenceIds: string[];
  provenance: ProvenanceType;
  adaptationDiagnostics: {
    male: CanaryMigrationDiagnostic[];
    female: CanaryMigrationDiagnostic[];
  };
  maleCanonical: CanonicalBirdGenetics;
  femaleCanonical: CanonicalBirdGenetics;
}

export interface CanaryCrossBridgeBlocked {
  success: false;
  status: 'BLOCKED' | 'ERROR';
  errorCode:
    | 'INVALID_SPECIES'
    | 'INVALID_SEX'
    | 'ZW_VIOLATION'
    | 'BLOCKED_LOCUS'
    | 'LEGACY_ONLY'
    | 'INSUFFICIENT_DATA'
    | 'INSUFFICIENT_INFORMATION'
    | 'CONFLICT_REVIEW'
    | 'INVALID_ALLELE'
    | 'UNSUPPORTED_LOCUS'
    | 'INVALID_CANONICAL_ALIAS'
    | 'INVALID_CANONICAL_DATA'
    | 'ENGINE_ERROR';
  message: string;
  faultyParent?: 'parentA' | 'parentB' | 'both';
  details?: Record<string, unknown>;
  warnings?: string[];
  humanReviewRequired?: boolean;
}

export type CanaryCrossBridgeResult = CanaryCrossBridgeSuccess | CanaryCrossBridgeBlocked;

// =========================================================================
// CLASSE PRINCIPALE CANARY CROSS BRIDGE
// =========================================================================

export class CanaryCrossBridge {

  /**
   * Normalise un oiseau Canari ou un objet passeport en CanaryPassportInput canonique sans effet de bord.
   */
  public static toCanaryPassportInput(bird: Canari | CanaryPassportInput | null | undefined): CanaryPassportInput {
    if (!bird) return {};

    const rawSpecies =
      (bird as any)?.identity?.speciesId ||
      (bird as any)?.espece ||
      (bird as any)?.speciesId ||
      '';

    const rawSex =
      (bird as any)?.identity?.sex ||
      (bird as any)?.sexe ||
      (bird as any)?.sex ||
      '';

    const canonicalLoci =
      (bird as any)?.canonicalLoci ||
      (bird as any)?.passport?.canonicalLoci ||
      (bird as any)?.genetics?.canonicalLoci;

    return {
      id: (bird as any)?.id || (bird as any)?.identity?.birdId,
      identity: {
        birdId: (bird as any)?.id || (bird as any)?.identity?.birdId,
        name: (bird as any)?.identity?.name || (bird as any)?.nom || (bird as any)?.bague || 'Canari',
        speciesId: rawSpecies,
        sex: rawSex,
      },
      canonicalLoci,
      genetics: (bird as any)?.genetics,
      passport: (bird as any)?.passport,
      espece: rawSpecies,
      sexe: rawSex,
      mutation: (bird as any)?.mutation,
      couleur: (bird as any)?.couleur,
      couleur_base: (bird as any)?.couleur_base,
      facteur: (bird as any)?.facteur
    };
  }

  /**
   * Pipeline strict 1 : Simulation à partir de deux passeports explicites (mâle et femelle).
   */
  public static simulateFromPassports(
    malePassport: Canari | CanaryPassportInput | null | undefined,
    femalePassport: Canari | CanaryPassportInput | null | undefined
  ): CanaryCrossBridgeResult {
    if (!malePassport || !femalePassport) {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INSUFFICIENT_DATA',
        message: 'Les deux parents doivent être fournis pour simuler un croisement.',
        faultyParent: !malePassport && !femalePassport ? 'both' : !malePassport ? 'parentA' : 'parentB'
      };
    }

    const inputMale = this.toCanaryPassportInput(malePassport);
    const inputFemale = this.toCanaryPassportInput(femalePassport);

    // 1. Validation de l'espèce
    const speciesMale = CanaryPassportAdapter.normalizeSpecies(inputMale.identity?.speciesId || inputMale.espece);
    const speciesFemale = CanaryPassportAdapter.normalizeSpecies(inputFemale.identity?.speciesId || inputFemale.espece);

    if (speciesMale !== 'canari' && speciesFemale !== 'canari') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'both',
        message: "Croisement impossible : les deux sujets doivent appartenir à l'espèce 'canari' (Serinus canaria domestica). Aucun simulateur disponible pour cette hybridation."
      };
    }

    if (speciesMale !== 'canari') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'parentA',
        message: `Espèce incompatible pour le mâle ('${inputMale.identity?.speciesId || inputMale.espece}'). Seule l'espèce 'canari' est admise.`
      };
    }

    if (speciesFemale !== 'canari') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'parentB',
        message: `Espèce incompatible pour la femelle ('${inputFemale.identity?.speciesId || inputFemale.espece}'). Seule l'espèce 'canari' est admise.`
      };
    }

    // 2. Validation du dimorphisme sexuel
    const sexMale = CanaryPassportAdapter.normalizeSex(inputMale.identity?.sex || inputMale.sexe);
    const sexFemale = CanaryPassportAdapter.normalizeSex(inputFemale.identity?.sex || inputFemale.sexe);

    if (sexMale !== 'MALE' && sexFemale !== 'FEMALE') {
      // Inversion ou indétermination
      if (sexMale === 'FEMALE' && sexFemale === 'MALE') {
        // Rediriger vers l'exécution avec orientation corrigée
        return this.executeCross(malePassport, femalePassport);
      }
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SEX',
        faultyParent: 'both',
        message: "Croisement biologiquement impossible : un croisement requiert un mâle (ZZ) et une femelle (ZW)."
      };
    }

    if (sexMale !== 'MALE') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SEX',
        faultyParent: 'parentA',
        message: `Le parent mâle doit posséder un sexe déterminé MALE (ZZ). Reçu : '${inputMale.identity?.sex || inputMale.sexe}'.`
      };
    }

    if (sexFemale !== 'FEMALE') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SEX',
        faultyParent: 'parentB',
        message: `Le parent femelle doit posséder un sexe déterminé FEMALE (ZW). Reçu : '${inputFemale.identity?.sex || inputFemale.sexe}'.`
      };
    }

    // 3. Adaptation du mâle via CanaryPassportAdapter
    const adaptMale = CanaryPassportAdapter.adaptPassportToCanary(inputMale);
    if (!adaptMale.success) {
      return {
        success: false,
        status: 'BLOCKED',
        errorCode: adaptMale.errorCode,
        faultyParent: 'parentA',
        message: adaptMale.message,
        details: adaptMale.details,
        humanReviewRequired: true
      };
    }

    // 4. Adaptation de la femelle via CanaryPassportAdapter
    const adaptFemale = CanaryPassportAdapter.adaptPassportToCanary(inputFemale);
    if (!adaptFemale.success) {
      return {
        success: false,
        status: 'BLOCKED',
        errorCode: adaptFemale.errorCode,
        faultyParent: 'parentB',
        message: adaptFemale.message,
        details: adaptFemale.details,
        humanReviewRequired: true
      };
    }

    // 5. Exécution du croisement via CanaryCrossEngine
    const crossResult = CanaryCrossEngine.simulateCross(adaptMale.genetics, adaptFemale.genetics);
    if (!crossResult.success) {
      return {
        success: false,
        status: 'BLOCKED',
        errorCode: crossResult.errorCode,
        message: crossResult.message,
        details: crossResult.details,
        humanReviewRequired: true
      };
    }

    // 6. Qualification globale du statut UI (Section 16)
    let uiStatus: CanaryBridgeStatus = 'SUCCESS';
    if (crossResult.blockedLoci.length > 0) {
      uiStatus = 'BLOCKED';
    } else if (crossResult.lethalRisks.length > 0) {
      uiStatus = 'WARNING';
    } else if (crossResult.insufficientInformation.length > 0) {
      uiStatus = 'INSUFFICIENT_INFORMATION';
    } else if (crossResult.humanReviewRequired) {
      uiStatus = 'HUMAN_REVIEW_REQUIRED';
    } else if (crossResult.warnings.length > 0) {
      uiStatus = 'WARNING';
    }

    const combinedWarnings = Array.from(new Set([
      ...adaptMale.warnings,
      ...adaptFemale.warnings,
      ...crossResult.warnings
    ]));

    const combinedNotes = Array.from(new Set([
      ...adaptMale.notes,
      ...adaptFemale.notes,
      ...crossResult.notes
    ]));

    return {
      success: true,
      status: uiStatus,
      speciesId: 'canari',
      maleBirdId: inputMale.id,
      femaleBirdId: inputFemale.id,
      geneticsResult: crossResult,
      locusResults: crossResult.locusResults,
      lethalRisks: crossResult.lethalRisks,
      blockedLoci: crossResult.blockedLoci,
      insufficientInformation: crossResult.insufficientInformation,
      warnings: combinedWarnings,
      notes: combinedNotes,
      humanReviewRequired: crossResult.humanReviewRequired || adaptMale.humanReviewRequired || adaptFemale.humanReviewRequired,
      evidenceIds: crossResult.evidenceIds,
      provenance: crossResult.provenance,
      adaptationDiagnostics: {
        male: adaptMale.migrationDiagnostics,
        female: adaptFemale.migrationDiagnostics
      },
      maleCanonical: adaptMale.genetics,
      femaleCanonical: adaptFemale.genetics
    };
  }

  /**
   * Pipeline strict 2 : Simulation à partir des identifiants d'oiseaux dans le repository ou un pool local.
   */
  public static simulateFromBirdIds(
    maleBirdId: string | number,
    femaleBirdId: string | number,
    birdsPool?: Canari[]
  ): CanaryCrossBridgeResult {
    let pool = birdsPool;
    if (!pool || pool.length === 0) {
      try {
        pool = BirdRepository.getAll();
      } catch {
        pool = [];
      }
    }

    const male = pool.find(b => String(b.id) === String(maleBirdId));
    const female = pool.find(b => String(b.id) === String(femaleBirdId));

    if (!male && !female) {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INSUFFICIENT_DATA',
        faultyParent: 'both',
        message: `Les deux oiseaux (IDs: ${maleBirdId}, ${femaleBirdId}) sont introuvables.`
      };
    }

    if (!male) {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INSUFFICIENT_DATA',
        faultyParent: 'parentA',
        message: `L'oiseau mâle (ID: ${maleBirdId}) est introuvable dans le répertoire.`
      };
    }

    if (!female) {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INSUFFICIENT_DATA',
        faultyParent: 'parentB',
        message: `L'oiseau femelle (ID: ${femaleBirdId}) est introuvable dans le répertoire.`
      };
    }

    return this.executeCross(male, female);
  }

  /**
   * Point d'entrée universel : Exécute le calcul de croisement entre deux parents (Canari ou Passport).
   * Identifie dynamiquement qui est le mâle (ZZ) et qui est la femelle (ZW).
   */
  public static executeCross(
    parentA: Canari | CanaryPassportInput | null | undefined,
    parentB: Canari | CanaryPassportInput | null | undefined
  ): CanaryCrossBridgeResult {
    if (!parentA || !parentB) {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INSUFFICIENT_DATA',
        faultyParent: !parentA && !parentB ? 'both' : !parentA ? 'parentA' : 'parentB',
        message: 'Les deux parents doivent être renseignés pour simuler un croisement.'
      };
    }

    const pA = this.toCanaryPassportInput(parentA);
    const pB = this.toCanaryPassportInput(parentB);

    // 1. Validation taxonomique stricte
    const spA = CanaryPassportAdapter.normalizeSpecies(pA.identity?.speciesId || pA.espece);
    const spB = CanaryPassportAdapter.normalizeSpecies(pB.identity?.speciesId || pB.espece);

    if (spA !== 'canari' && spB !== 'canari') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'both',
        message: 'Aucun croisement Canari disponible pour ces espèces. Les deux parents doivent appartenir à Serinus canaria domestica.'
      };
    }

    if (spA !== 'canari') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'parentA',
        message: `Espèce incompatible pour le Parent A ('${pA.identity?.speciesId || pA.espece}'). Seule l'espèce 'canari' est admise.`
      };
    }

    if (spB !== 'canari') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'parentB',
        message: `Espèce incompatible pour le Parent B ('${pB.identity?.speciesId || pB.espece}'). Seule l'espèce 'canari' est admise.`
      };
    }

    // 2. Validation du sexe
    const sexA = CanaryPassportAdapter.normalizeSex(pA.identity?.sex || pA.sexe);
    const sexB = CanaryPassportAdapter.normalizeSex(pB.identity?.sex || pB.sexe);

    if (sexA !== 'MALE' && sexA !== 'FEMALE') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SEX',
        faultyParent: 'parentA',
        message: 'Le sexe du Parent A doit être connu (Mâle ZZ ou Femelle ZW) pour effectuer ce croisement.'
      };
    }

    if (sexB !== 'MALE' && sexB !== 'FEMALE') {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SEX',
        faultyParent: 'parentB',
        message: 'Le sexe du Parent B doit être connu (Mâle ZZ ou Femelle ZW) pour effectuer ce croisement.'
      };
    }

    if (sexA === sexB) {
      return {
        success: false,
        status: 'ERROR',
        errorCode: 'INVALID_SEX',
        faultyParent: 'both',
        message: 'Croisement biologiquement impossible : un croisement requiert un mâle (ZZ) et une femelle (ZW).'
      };
    }

    // 3. Attribution des rôles cytogénétiques
    const malePassport = sexA === 'MALE' ? pA : pB;
    const femalePassport = sexA === 'FEMALE' ? pA : pB;

    return this.simulateFromPassports(malePassport, femalePassport);
  }
}

export default CanaryCrossBridge;

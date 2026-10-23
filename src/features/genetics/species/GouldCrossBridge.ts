/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PONT CONTRÔLÉ BIRD PASSPORT → GOULD CROSS ENGINE
 * Mission V1.6.6.10 : Connexion étanche entre le Bird Passport et GouldianCrossEngine.
 * 
 * GARANTIES D'ARCHITECTURE ET ÉPISTÉMIQUES :
 * 1. Zéro Canary Fallback : Rejet absolu si un parent n'est pas 'diamant_gould'.
 * 2. Zéro Inférence de Sexe : Le sexe doit être explicitement MALE ou FEMALE.
 * 3. Zéro Inférence Phénotype -> Génotype certain.
 * 4. Adaptateur obligatoire : GouldPassportAdapter est l'unique point d'entrée.
 * 5. CONFLICT_REVIEW bloque immédiatement le calcul.
 * 6. Zéro modification des probabilités : fidélité intégrale au CrossEngine.
 * 7. Zéro score de couple, zéro recommandation d'accouplement.
 */

import {
  GouldPassportAdapter,
  GouldAdaptationResult,
  GouldAdaptationSuccess,
  ExtendedBirdPassport
} from './GouldPassportAdapter';
import {
  GouldianCrossEngine
} from './GouldianCrossEngine';
import {
  GouldianGenotypeRecord,
  GouldSex
} from './gouldianGeneticsTypes';
import {
  GouldianCrossResult
} from './gouldianCrossTypes';
import type { Canari } from '../../../types';

export interface GouldCrossExecutionSuccess {
  success: true;
  result: GouldianCrossResult;
  father: GouldianGenotypeRecord;
  mother: GouldianGenotypeRecord;
  fatherAdaptation: GouldAdaptationSuccess;
  motherAdaptation: GouldAdaptationSuccess;
  isParentHypothesisSet: boolean;
  warnings: string[];
}

export interface GouldCrossExecutionBlocked {
  success: false;
  errorCode:
    | 'INVALID_SPECIES'
    | 'INVALID_SEX'
    | 'ZW_VIOLATION'
    | 'CONFLICT_REVIEW'
    | 'INSUFFICIENT_DATA'
    | 'INVALID_ALLELE'
    | 'UNSUPPORTED_LOCUS'
    | 'ENGINE_ERROR';
  message: string;
  details?: Record<string, unknown>;
  faultyParent?: 'parentA' | 'parentB' | 'both';
}

export type GouldCrossExecutionResult = GouldCrossExecutionSuccess | GouldCrossExecutionBlocked;

export class GouldCrossBridge {
  /**
   * Normalise un oiseau Canari ou un ExtendedBirdPassport en ExtendedBirdPassport canonique.
   */
  public static toExtendedPassport(bird: Canari | ExtendedBirdPassport): ExtendedBirdPassport {
    if (!bird) {
      return {
        identity: {
          birdId: 0,
          name: '',
          speciesId: '',
          sex: 'UNKNOWN' as any,
          birthDate: '',
          status: 'inactive'
        }
      } as ExtendedBirdPassport;
    }

    const rawSpecies = (bird as any)?.identity?.speciesId || (bird as any)?.espece || (bird as any)?.speciesId || '';
    
    // Résolution du sexe sans devinette
    const rawSex = (bird as any)?.identity?.sex || (bird as any)?.sexe;
    let sexNorm: 'M' | 'F' | 'UNKNOWN' = 'UNKNOWN';
    if (rawSex === 'M' || rawSex === 'Mâle' || rawSex === 'Male' || rawSex === 'MALE') {
      sexNorm = 'M';
    } else if (rawSex === 'F' || rawSex === 'Femelle' || rawSex === 'Female' || rawSex === 'FEMALE') {
      sexNorm = 'F';
    }

    const canonicalLoci =
      (bird as any)?.canonicalLoci ||
      (bird as any)?.passport?.canonicalLoci ||
      (bird as any)?.genetics?.canonicalLoci ||
      [];

    return {
      identity: {
        birdId: (bird as any)?.identity?.birdId || (bird as any)?.id || 0,
        name: (bird as any)?.identity?.name || (bird as any)?.nom || (bird as any)?.bague || 'Oiseau',
        speciesId: rawSpecies,
        sex: sexNorm as any,
        birthDate: (bird as any)?.identity?.birthDate || (bird as any)?.date_naissance || '',
        status: (bird as any)?.identity?.status || 'active'
      },
      phenotype: {
        coloration: (bird as any)?.phenotype?.coloration || (bird as any)?.couleur || ''
      },
      canonicalLoci,
      mutation: (bird as any)?.mutation,
      couleur_base: (bird as any)?.couleur_base,
      facteur: (bird as any)?.facteur
    } as ExtendedBirdPassport;
  }

  /**
   * Exécute le calcul de croisement entre deux oiseaux du Bird Passport.
   * Valide les espèces, les sexes, adapte les passeports et invoque GouldianCrossEngine.
   */
  public static executeCross(
    parentA: Canari | ExtendedBirdPassport | null | undefined,
    parentB: Canari | ExtendedBirdPassport | null | undefined
  ): GouldCrossExecutionResult {
    if (!parentA || !parentB) {
      return {
        success: false,
        errorCode: 'INSUFFICIENT_DATA',
        message: 'Les deux parents doivent être renseignés pour simuler un croisement.'
      };
    }

    const passportA = this.toExtendedPassport(parentA);
    const passportB = this.toExtendedPassport(parentB);

    // 1. Validation de l'espèce (Zéro Canary Fallback)
    const speciesA = passportA.identity?.speciesId?.toLowerCase() || '';
    const speciesB = passportB.identity?.speciesId?.toLowerCase() || '';

    if (speciesA !== 'diamant_gould' && speciesB !== 'diamant_gould') {
      return {
        success: false,
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'both',
        message: 'Aucun croisement Gould disponible pour cette espèce.'
      };
    }

    if (speciesA !== 'diamant_gould') {
      return {
        success: false,
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'parentA',
        message: `Espèce incompatible pour le Parent A ('${passportA.identity?.speciesId}'). Aucun croisement Gould disponible pour cette espèce.`
      };
    }

    if (speciesB !== 'diamant_gould') {
      return {
        success: false,
        errorCode: 'INVALID_SPECIES',
        faultyParent: 'parentB',
        message: `Espèce incompatible pour le Parent B ('${passportB.identity?.speciesId}'). Aucun croisement Gould disponible pour cette espèce.`
      };
    }

    // 2. Validation du sexe (Zéro devinette)
    const sexA = passportA.identity?.sex;
    const sexB = passportB.identity?.sex;

    if (sexA !== 'M' && sexA !== 'F') {
      return {
        success: false,
        errorCode: 'INVALID_SEX',
        faultyParent: 'parentA',
        message: 'Le sexe du parent doit être connu pour effectuer ce croisement.'
      };
    }

    if (sexB !== 'M' && sexB !== 'F') {
      return {
        success: false,
        errorCode: 'INVALID_SEX',
        faultyParent: 'parentB',
        message: 'Le sexe du parent doit être connu pour effectuer ce croisement.'
      };
    }

    if (sexA === sexB) {
      return {
        success: false,
        errorCode: 'INVALID_SEX',
        faultyParent: 'both',
        message: 'Croisement biologiquement impossible : un croisement requiert un mâle (ZZ) et une femelle (ZW).'
      };
    }

    // 3. Adaptation du Parent A via GouldPassportAdapter
    const adaptA = GouldPassportAdapter.adaptPassportToGould(passportA);
    if (!adaptA.success) {
      if (adaptA.errorCode === 'CONFLICT_REVIEW') {
        return {
          success: false,
          errorCode: 'CONFLICT_REVIEW',
          faultyParent: 'parentA',
          message: 'Croisement bloqué : les données génétiques d\'un parent nécessitent une vérification humaine.',
          details: adaptA.details
        };
      }
      return {
        success: false,
        errorCode: adaptA.errorCode,
        faultyParent: 'parentA',
        message: adaptA.message,
        details: adaptA.details
      };
    }

    // 4. Adaptation du Parent B via GouldPassportAdapter
    const adaptB = GouldPassportAdapter.adaptPassportToGould(passportB);
    if (!adaptB.success) {
      if (adaptB.errorCode === 'CONFLICT_REVIEW') {
        return {
          success: false,
          errorCode: 'CONFLICT_REVIEW',
          faultyParent: 'parentB',
          message: 'Croisement bloqué : les données génétiques d\'un parent nécessitent une vérification humaine.',
          details: adaptB.details
        };
      }
      return {
        success: false,
        errorCode: adaptB.errorCode,
        faultyParent: 'parentB',
        message: adaptB.message,
        details: adaptB.details
      };
    }

    // 5. Identification formelle du père (MALE) et de la mère (FEMALE)
    const fatherRecord = adaptA.genotypeRecord.sex === 'MALE' ? adaptA.genotypeRecord : adaptB.genotypeRecord;
    const motherRecord = adaptA.genotypeRecord.sex === 'FEMALE' ? adaptA.genotypeRecord : adaptB.genotypeRecord;
    const fatherAdaptation = adaptA.genotypeRecord.sex === 'MALE' ? adaptA : adaptB;
    const motherAdaptation = adaptA.genotypeRecord.sex === 'FEMALE' ? adaptA : adaptB;

    // 6. Calcul via GouldianCrossEngine
    try {
      const crossResult = GouldianCrossEngine.cross(fatherRecord, motherRecord);
      const isParentHypothesisSet = adaptA.isParentHypothesisSet || adaptB.isParentHypothesisSet || crossResult.isParentHypothesisSet;

      const combinedWarnings = [
        ...adaptA.warnings,
        ...adaptB.warnings,
        ...crossResult.warnings
      ].filter((w, idx, arr) => arr.indexOf(w) === idx);

      return {
        success: true,
        result: crossResult,
        father: fatherRecord,
        mother: motherRecord,
        fatherAdaptation,
        motherAdaptation,
        isParentHypothesisSet,
        warnings: combinedWarnings
      };
    } catch (err: any) {
      return {
        success: false,
        errorCode: 'ENGINE_ERROR',
        message: err?.message || 'Erreur lors du calcul du croisement.'
      };
    }
  }
}

export default GouldCrossBridge;

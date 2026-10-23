/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MOTEUR GÉNÉTIQUE GOULD CONTRÔLÉ (V1.6.4)
 * GouldianEpistasisResolver & GouldianGeneticsEngine
 * 
 * RÈGLES DE VALIDATION ÉPISTÉMIQUE :
 * 1. ZW Carrier Guard : refus catégorique de portage lié au sexe chez la femelle.
 * 2. Épistasie Céphalique : masquage de la tête jaune sous tête noire (pointe du bec témoin).
 * 3. Anti-Inférence : Phénotype -> PossibleSet (jamais de génotype certain forcé).
 * 4. Préservation explicite de HUMAN_REVIEW pour BREAST et SILVER.
 */

import {
  GouldSex,
  GouldianGenotypeRecord,
  GouldianPhenotypeManifest,
  GouldHeadColorZGenotype,
  GouldHeadYellowGenotype,
  GouldBodyDilutionGenotype,
  GouldBodyBlueGenotype,
  GouldBreastGenotype,
  GouldCompositePhenotype
} from './gouldianGeneticsTypes';

export class InvalidSexLinkedCarrierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSexLinkedCarrierError';
  }
}

export class GouldianEpistasisResolver {
  /**
   * Résout l'interaction épistatique entre HEAD_COLOR_Z et HEAD_YELLOW.
   */
  public static resolveHeadPhenotype(
    headZ: GouldHeadColorZGenotype,
    headYellow: GouldHeadYellowGenotype,
    sex: GouldSex
  ): {
    visualHeadColor: 'RED' | 'BLACK' | 'YELLOW' | 'UNKNOWN';
    beakTipColor: 'RED' | 'YELLOW_ORANGE';
    maskedBlackHead: boolean;
  } {
    // 1. Contrôle de validité ZW
    if (sex === 'FEMALE') {
      if (headZ.alleles[1] !== 'W') {
        throw new InvalidSexLinkedCarrierError(
          'Biologiquement invalide : une femelle Gouldian ZW doit posséder l\'allèle [Z, W] au locus HEAD_COLOR_Z.'
        );
      }
    }

    const isZRed = headZ.alleles[0] === 'ZR' || (sex === 'MALE' && headZ.alleles[1] === 'ZR');
    const isZBlackHomoz =
      (sex === 'MALE' && headZ.alleles[0] === 'Zr' && headZ.alleles[1] === 'Zr') ||
      (sex === 'FEMALE' && headZ.alleles[0] === 'Zr');

    const isYellowMutantHomoz = headYellow.alleles[0] === 'y' && headYellow.alleles[1] === 'y';

    // Interaction Épistatique Pryke & Griffith :
    if (isYellowMutantHomoz) {
      if (isZRed) {
        // Tête rouge génétique + absence de conversion rouge -> Tête Jaune/Orange
        return {
          visualHeadColor: 'YELLOW',
          beakTipColor: 'YELLOW_ORANGE',
          maskedBlackHead: false
        };
      } else if (isZBlackHomoz) {
        // Tête noire génétique + absence de conversion rouge -> Masque Noir dominant sur barbes, pointe du bec jaune/orange
        return {
          visualHeadColor: 'BLACK',
          beakTipColor: 'YELLOW_ORANGE',
          maskedBlackHead: true
        };
      }
    }

    // Phénotypes réguliers sans mutation y/y homozygote
    if (isZRed) {
      return {
        visualHeadColor: 'RED',
        beakTipColor: 'RED',
        maskedBlackHead: false
      };
    } else if (isZBlackHomoz) {
      return {
        visualHeadColor: 'BLACK',
        beakTipColor: 'RED',
        maskedBlackHead: false
      };
    }

    return {
      visualHeadColor: 'UNKNOWN',
      beakTipColor: 'RED',
      maskedBlackHead: false
    };
  }

  /**
   * Résout la dilution corporelle liée au sexe (Z+, Zp) avec garde-fou strict ZW.
   */
  public static resolveBodyDilution(
    dilution: GouldBodyDilutionGenotype,
    sex: GouldSex
  ): 'GREEN' | 'PASTEL_SF' | 'YELLOW' | 'UNKNOWN' {
    if (sex === 'FEMALE') {
      if (dilution.alleles[1] !== 'W') {
        throw new InvalidSexLinkedCarrierError(
          'Biologiquement invalide : une femelle Gouldian ZW doit avoir la constitution [Z, W].'
        );
      }
      if (dilution.alleles[0] === 'Zp') {
        return 'YELLOW'; // Hémizygote exprime directement l'équivalent du DF
      }
      return 'GREEN';
    }

    // Mâle ZZ
    const a1 = dilution.alleles[0];
    const a2 = dilution.alleles[1];

    if (a1 === 'Zp' && a2 === 'Zp') {
      return 'YELLOW'; // Double Facteur
    }
    if ((a1 === 'Zp' && a2 === 'Z+') || (a1 === 'Z+' && a2 === 'Zp')) {
      return 'PASTEL_SF'; // Simple Facteur
    }
    if (a1 === 'Z+' && a2 === 'Z+') {
      return 'GREEN';
    }

    return 'UNKNOWN';
  }

  /**
   * Évalue le label d'exposition composite Silver sans en faire une mutation.
   */
  public static evaluateCompositeLabels(
    bodyBlue: GouldBodyBlueGenotype,
    breast: GouldBreastGenotype,
    bodyDilution: GouldBodyDilutionGenotype,
    sex: GouldSex
  ): GouldCompositePhenotype {
    const isBlueHomoz = bodyBlue.alleles[0] === 'b' && bodyBlue.alleles[1] === 'b';
    const isWhiteBreastHomoz = breast.alleles[0] === 'w' && breast.alleles[1] === 'w';

    const isYellowExpressed =
      (sex === 'MALE' && bodyDilution.alleles[0] === 'Zp' && bodyDilution.alleles[1] === 'Zp') ||
      (sex === 'FEMALE' && bodyDilution.alleles[0] === 'Zp' && bodyDilution.alleles[1] === 'W');

    const isPastelSfExpressed =
      sex === 'MALE' &&
      ((bodyDilution.alleles[0] === 'Zp' && bodyDilution.alleles[1] === 'Z+') ||
        (bodyDilution.alleles[0] === 'Z+' && bodyDilution.alleles[1] === 'Zp'));

    const isSilver = isBlueHomoz && isWhiteBreastHomoz && isYellowExpressed;
    const isPastelBlue = isBlueHomoz && isWhiteBreastHomoz && isPastelSfExpressed;

    const notes: string[] = [];
    if (isSilver) {
      notes.push('Label commercial "Argenté / Silver" résultant de la triade Blue (b/b) + White Breast (w/w) + Pastel Dilution.');
    }
    if (isPastelBlue) {
      notes.push('Label d\'exposition "Pastel Bleu poitrine blanche" (mâle Simple Facteur).');
    }

    return {
      isSilverComposite: isSilver,
      isPastelBlueComposite: isPastelBlue,
      notes,
      evidenceLevel: 'HIGH',
      humanReview: 'REQUIRED'
    };
  }
}

export class GouldianGeneticsEngine {
  /**
   * Convertit un phénotype observé en ensemble de génotypes possibles (Anti-Inférence).
   */
  public static inferPossibleGenotypesFromPhenotype(
    observedHeadColor: 'RED' | 'BLACK' | 'YELLOW',
    sex: GouldSex
  ): {
    possibleHeadZ: Array<[string, string]>;
    possibleHeadYellow: Array<[string, string]>;
    epistemicStatus: 'POSSIBLE_SET';
  } {
    if (observedHeadColor === 'RED') {
      if (sex === 'MALE') {
        return {
          possibleHeadZ: [
            ['ZR', 'ZR'], // homozygote pur
            ['ZR', 'Zr']  // hétérozygote porteur de noir
          ],
          possibleHeadYellow: [
            ['Y', 'Y'],
            ['Y', 'y']
          ],
          epistemicStatus: 'POSSIBLE_SET'
        };
      } else {
        return {
          possibleHeadZ: [['ZR', 'W']],
          possibleHeadYellow: [
            ['Y', 'Y'],
            ['Y', 'y']
          ],
          epistemicStatus: 'POSSIBLE_SET'
        };
      }
    }

    if (observedHeadColor === 'BLACK') {
      if (sex === 'MALE') {
        return {
          possibleHeadZ: [['Zr', 'Zr']],
          possibleHeadYellow: [
            ['Y', 'Y'],
            ['Y', 'y'],
            ['y', 'y'] // Épistasique possible si pointe de bec jaune
          ],
          epistemicStatus: 'POSSIBLE_SET'
        };
      } else {
        return {
          possibleHeadZ: [['Zr', 'W']],
          possibleHeadYellow: [
            ['Y', 'Y'],
            ['Y', 'y'],
            ['y', 'y']
          ],
          epistemicStatus: 'POSSIBLE_SET'
        };
      }
    }

    // Tête Jaune / Orange
    if (sex === 'MALE') {
      return {
        possibleHeadZ: [
          ['ZR', 'ZR'],
          ['ZR', 'Zr']
        ],
        possibleHeadYellow: [['y', 'y']],
        epistemicStatus: 'POSSIBLE_SET'
      };
    } else {
      return {
        possibleHeadZ: [['ZR', 'W']],
        possibleHeadYellow: [['y', 'y']],
        epistemicStatus: 'POSSIBLE_SET'
      };
    }
  }

  /**
   * Évalue le manifest phénotypique complet d'un dossier génotypique Gouldian.
   */
  public static resolveCompleteManifest(record: GouldianGenotypeRecord): GouldianPhenotypeManifest {
    const headRes = GouldianEpistasisResolver.resolveHeadPhenotype(
      record.headColorZ,
      record.headYellow,
      record.sex
    );

    let visualBody: 'GREEN' | 'PASTEL_SF' | 'YELLOW' | 'BLUE' | 'UNKNOWN' = 'GREEN';
    const isBlue = record.bodyBlue.alleles[0] === 'b' && record.bodyBlue.alleles[1] === 'b';
    const dilutionRes = GouldianEpistasisResolver.resolveBodyDilution(record.bodyDilution, record.sex);

    if (isBlue) {
      visualBody = 'BLUE';
    } else if (dilutionRes === 'YELLOW') {
      visualBody = 'YELLOW';
    } else if (dilutionRes === 'PASTEL_SF') {
      visualBody = 'PASTEL_SF';
    } else {
      visualBody = 'GREEN';
    }

    // Locus BREAST (Provisional P > l > w)
    let visualBreast: 'PURPLE' | 'LILAC' | 'WHITE' | 'UNKNOWN' = 'PURPLE';
    const b1 = record.breast.alleles[0];
    const b2 = record.breast.alleles[1];

    if (b1 === 'P' || b2 === 'P') {
      visualBreast = 'PURPLE';
    } else if (b1 === 'l' || b2 === 'l') {
      visualBreast = 'LILAC';
    } else if (b1 === 'w' && b2 === 'w') {
      visualBreast = 'WHITE';
    }

    const composite = GouldianEpistasisResolver.evaluateCompositeLabels(
      record.bodyBlue,
      record.breast,
      record.bodyDilution,
      record.sex
    );

    const compositeLabels: string[] = [];
    if (composite.isSilverComposite) compositeLabels.push('Silver / Argenté');
    if (composite.isPastelBlueComposite) compositeLabels.push('Pastel Bleu');

    const epistemicWarnings: string[] = [];
    if (record.breast.implementationStatus === 'PROVISIONAL') {
      epistemicWarnings.push('Locus BREAST (P > l > w) sous statut PROVISIONAL (HUMAN_REVIEW obligatoire).');
    }
    if (compositeLabels.length > 0) {
      epistemicWarnings.push('Labels composites d\'exposition déduits dynamiquement, aucune mutation unitaire attribuée.');
    }

    return {
      speciesId: 'diamant_gould',
      sex: record.sex,
      visualHeadColor: headRes.visualHeadColor,
      beakTipColor: headRes.beakTipColor,
      visualBreastColor: visualBreast,
      visualBodyColor: visualBody,
      compositeLabels,
      phenotypicEvidence: {
        yellowBeakTip: headRes.beakTipColor === 'YELLOW_ORANGE',
        maskedBlackHead: headRes.maskedBlackHead
      },
      epistemicWarnings
    };
  }
}

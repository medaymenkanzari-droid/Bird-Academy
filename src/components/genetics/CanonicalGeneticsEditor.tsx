/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT CanonicalGeneticsEditor
 * Saisie progressive et qualification épistémique des données génétiques canoniques.
 * 
 * GARANTIES ÉPISTÉMIQUES & CONTRAT SCIENTIFIQUE :
 * 1. Zéro Canary Fallback : Strictement scôpé sur speciesId ('diamant_gould').
 * 2. Zéro Inférence Hâtive : Phénotype observé ≠ Génotype confirmé.
 * 3. OBSERVED + VERY_HIGH ≠ GENETICALLY_CONFIRMED.
 * 4. DECLARED ≠ GENETICALLY_CONFIRMED.
 * 5. INFERRED ≠ GENETICALLY_CONFIRMED.
 * 6. DNA_TEST requiert complétude stricte et compatibilité cytogénétique Z/W.
 * 7. POSSIBLE_SET préserve toutes les hypothèses, aucune sélection arbitraire comme vérité.
 * 8. NOT_TESTED distinct de l'absence de mutation.
 * 9. CONFLICT_REVIEW bloque la confirmation et exige une validation humaine.
 * 10. Zéro carrier Z-linked chez la femelle (carrierState = NOT_APPLICABLE).
 * 11. Respect strict de isProvisional (sans aucun hardcoding sur BREAST).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Dna, CheckCircle2, AlertTriangle, ShieldAlert, 
  Layers, Eye, Award, FileQuestion, HelpCircle, Save,
  Sparkles, Lightbulb, Check, Ban
} from 'lucide-react';
import { AppAlert } from '../design-system/AppAlert';
import type { Language } from '../../utils/translations';
import { CanonicalLocusBadge } from './CanonicalLocusBadge';
import { EpistemicStatusBadge, EpistemicStatusType } from './EpistemicStatusBadge';
import { EpistemicSourceBadge, EpistemicSourceType } from './EpistemicSourceBadge';
import { EpistemicConfidenceBadge, EpistemicConfidenceType } from './EpistemicConfidenceBadge';
import { HumanReviewBadge, HumanReviewStatusType } from './HumanReviewBadge';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';
import { GeneticsPedagogicalBanner } from './GeneticsPedagogicalBanner';
import { PassportSuggestionService, type PassportSuggestion } from '../../features/birds/services/PassportSuggestionService';
import type { CanonicalLocusItem } from './CanonicalGeneticsSummaryCard';
import type { Canari } from '../../types';

// --- TYPES DE SAISIE & MODES ---

export type QualificationMode =
  | 'OBSERVED'
  | 'DECLARED'
  | 'DNA_TEST'
  | 'POSSIBLE_SET'
  | 'UNKNOWN'
  | 'NOT_TESTED';

export interface CanonicalLocusDefinition {
  locusId: string;
  displayName: string;
  transmission: 'Z_LINKED' | 'AUTOSOMAL';
  isProvisional: boolean;
  isBlocked?: boolean;
  blockedRationale?: string;
  evidenceIds?: string[];
  alleles: string[];
  observations: Array<{
    id: string;
    label: string;
    maleHypotheses: Array<[string, string]>;
    femaleHypotheses: Array<[string, string]>;
    maleDetermination: 'CONFIRMED' | 'POSSIBLE_SET';
    femaleDetermination: 'CONFIRMED' | 'POSSIBLE_SET';
    rationale?: string;
  }>;
  allHypotheses: (isFemale: boolean) => Array<[string, string]>;
}

// --- RÉFÉRENTIEL CANONIQUE GOULD (Strictement scôpé 'diamant_gould') ---

export const GOULDIAN_LOCI_CATALOG: CanonicalLocusDefinition[] = [
  {
    locusId: 'HEAD_COLOR_Z',
    displayName: 'Couleur de tête (Z)',
    transmission: 'Z_LINKED',
    isProvisional: false,
    alleles: ['ZR', 'Zr'],
    observations: [
      {
        id: 'RED_HEAD',
        label: 'Tête rouge (masque rouge)',
        maleHypotheses: [['ZR', 'ZR'], ['ZR', 'Zr']],
        femaleHypotheses: [['ZR', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Masque rouge : homozygote ou hétérozygote chez le mâle, hémizygote chez la femelle.'
      },
      {
        id: 'BLACK_HEAD',
        label: 'Tête noire (masque noir)',
        maleHypotheses: [['Zr', 'Zr']],
        femaleHypotheses: [['Zr', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Masque noir récessif lié au sexe : homozygote chez le mâle, hémizygote chez la femelle.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['ZR', 'W'], ['Zr', 'W']]
      : [['ZR', 'ZR'], ['ZR', 'Zr'], ['Zr', 'Zr']]
  },
  {
    locusId: 'HEAD_YELLOW',
    displayName: 'Masque jaune/orange',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['Y', 'y'],
    observations: [
      {
        id: 'WILD_HEAD',
        label: 'Masque normal (non jaune / pointe rouge/noire)',
        maleHypotheses: [['Y', 'Y'], ['Y', 'y']],
        femaleHypotheses: [['Y', 'Y'], ['Y', 'y']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Allèle sauvage dominant Y : peut masquer le portage de l\'allèle orange/jaune y.'
      },
      {
        id: 'YELLOW_HEAD',
        label: 'Masque jaune / pointe orange (y/y)',
        maleHypotheses: [['y', 'y']],
        femaleHypotheses: [['y', 'y']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Mutation autosomique récessive exprimée uniquement à l\'état homozygote y/y.'
      }
    ],
    allHypotheses: () => [['Y', 'Y'], ['Y', 'y'], ['y', 'y']]
  },
  {
    locusId: 'BODY_DILUTION',
    displayName: 'Dilution du corps (Z)',
    transmission: 'Z_LINKED',
    isProvisional: false,
    alleles: ['Z+', 'Zp'],
    observations: [
      {
        id: 'NORMAL_BODY',
        label: 'Corps sauvage non dilué (Vert)',
        maleHypotheses: [['Z+', 'Z+']],
        femaleHypotheses: [['Z+', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Allèle sauvage dominant non dilué Z+.'
      },
      {
        id: 'SF_PASTEL',
        label: 'Pastel simple facteur (mâle uniquement)',
        maleHypotheses: [['Zp', 'Z+']],
        femaleHypotheses: [],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Codominance Z+/Zp chez le mâle. Inapplicable chez la femelle.'
      },
      {
        id: 'YELLOW_DF',
        label: 'Jaune double facteur / Hémizygote femelle',
        maleHypotheses: [['Zp', 'Zp']],
        femaleHypotheses: [['Zp', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Mutation diluée liée au sexe : double facteur chez le mâle, hémizygote chez la femelle.'
      }
    ],
    allHypotheses: (isFemale) => isFemale
      ? [['Z+', 'W'], ['Zp', 'W']]
      : [['Z+', 'Z+'], ['Zp', 'Z+'], ['Zp', 'Zp']]
  },
  {
    locusId: 'BODY_BLUE',
    displayName: 'Corps bleu (Autosomique)',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['B', 'b'],
    observations: [
      {
        id: 'GREEN_WILD',
        label: 'Corps vert / sauvage (B/-)',
        maleHypotheses: [['B', 'B'], ['B', 'b']],
        femaleHypotheses: [['B', 'B'], ['B', 'b']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Phénotype vert dominant : porteur bleu ou homozygote non porteur.'
      },
      {
        id: 'BLUE_BODY',
        label: 'Corps bleu (b/b)',
        maleHypotheses: [['b', 'b']],
        femaleHypotheses: [['b', 'b']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Mutation récessive autosomique exprimée en homozygote b/b.'
      }
    ],
    allHypotheses: () => [['B', 'B'], ['B', 'b'], ['b', 'b']]
  },
  {
    locusId: 'BREAST',
    displayName: 'Couleur de poitrine',
    transmission: 'AUTOSOMAL',
    isProvisional: true, // STRICTEMENT PROVISOIRE
    alleles: ['P', 'l', 'w'],
    observations: [
      {
        id: 'PURPLE_BREAST',
        label: 'Poitrine violette sauvage (P/-)',
        maleHypotheses: [['P', 'P'], ['P', 'l'], ['P', 'w']],
        femaleHypotheses: [['P', 'P'], ['P', 'l'], ['P', 'w']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Série allélique autosomique avec dominance de P sur lilas (l) et blanc (w).'
      },
      {
        id: 'LILAC_BREAST',
        label: 'Poitrine lilas (l/-)',
        maleHypotheses: [['l', 'l'], ['l', 'w']],
        femaleHypotheses: [['l', 'l'], ['l', 'w']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Allèle lilas dominant sur blanc (w), récessif face au violet (P).'
      },
      {
        id: 'WHITE_BREAST',
        label: 'Poitrine blanche (w/w)',
        maleHypotheses: [['w', 'w']],
        femaleHypotheses: [['w', 'w']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Mutation récessive autosomique homozygote w/w.'
      }
    ],
    allHypotheses: () => [['P', 'P'], ['P', 'l'], ['P', 'w'], ['l', 'l'], ['l', 'w'], ['w', 'w']]
  }
];

// --- RÉFÉRENTIEL CANONIQUE CANARI (Strictement scôpé 'canari' / V1.7.3 lock) ---

export const CANARY_LEGACY_ONLY_LOCI: string[] = [
  'CAN_LOC_PERIDOTE',
  'CAN_LOC_PANGEA'
];

export const CANARY_LOCI_CATALOG: CanonicalLocusDefinition[] = [
  // 1. Brun (Brown) — Z-linked récessif
  {
    locusId: 'CAN_LOC_BROWN',
    displayName: 'Brun (Brown)',
    transmission: 'Z_LINKED',
    isProvisional: false,
    alleles: ['Z_+', 'Z_br'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'BROWN_PHENOTYPE',
        label: 'Brun classique (eumélanine brune)',
        maleHypotheses: [['Z_br', 'Z_br']],
        femaleHypotheses: [['Z_br', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Eumélanine brune exprimée : homozygote chez le mâle, hémizygote chez la femelle.'
      },
      {
        id: 'BLACK_WILD',
        label: 'Noir-Jaune classique (non-brun)',
        maleHypotheses: [['Z_+', 'Z_+'], ['Z_+', 'Z_br']],
        femaleHypotheses: [['Z_+', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Eumélanine noire sauvage dominante : le mâle peut être porteur sain de brun.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['Z_+', 'W'], ['Z_br', 'W']] 
      : [['Z_+', 'Z_+'], ['Z_+', 'Z_br'], ['Z_br', 'Z_br']]
  },

  // 2. Agate — Z-linked récessif
  {
    locusId: 'CAN_LOC_AGATE',
    displayName: 'Agate',
    transmission: 'Z_LINKED',
    isProvisional: false,
    alleles: ['Z_+', 'Z_ag'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'AGATE_PHENOTYPE',
        label: 'Agate (réduction eumélanique)',
        maleHypotheses: [['Z_ag', 'Z_ag']],
        femaleHypotheses: [['Z_ag', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Mutation Agate liée au sexe récessive.'
      },
      {
        id: 'NON_AGATE',
        label: 'Non-Agate (sauvage)',
        maleHypotheses: [['Z_+', 'Z_+'], ['Z_+', 'Z_ag']],
        femaleHypotheses: [['Z_+', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Phénotype non-agate : mâle potentiellement porteur d\'agate.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['Z_+', 'W'], ['Z_ag', 'W']] 
      : [['Z_+', 'Z_+'], ['Z_+', 'Z_ag'], ['Z_ag', 'Z_ag']]
  },

  // 3. Pastel — Z-linked récessif
  {
    locusId: 'CAN_LOC_PASTEL',
    displayName: 'Pastel',
    transmission: 'Z_LINKED',
    isProvisional: false,
    alleles: ['Z_+', 'Z_pa'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'PASTEL_PHENOTYPE',
        label: 'Pastel (dilution mélanique liée au sexe)',
        maleHypotheses: [['Z_pa', 'Z_pa']],
        femaleHypotheses: [['Z_pa', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Pastel liée au sexe récessive.'
      },
      {
        id: 'NON_PASTEL',
        label: 'Non-Pastel',
        maleHypotheses: [['Z_+', 'Z_+'], ['Z_+', 'Z_pa']],
        femaleHypotheses: [['Z_+', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Non-pastel : mâle potentiellement porteur de pastel.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['Z_+', 'W'], ['Z_pa', 'W']] 
      : [['Z_+', 'Z_+'], ['Z_+', 'Z_pa'], ['Z_pa', 'Z_pa']]
  },

  // 4. Ivoire — Z-linked récessif (STRICTEMENT PROVISIONAL)
  {
    locusId: 'CAN_LOC_IVOIRE',
    displayName: 'Ivoire',
    transmission: 'Z_LINKED',
    isProvisional: true, // STRICTEMENT PROVISOIRE
    alleles: ['Z_+', 'Z_iv'],
    evidenceIds: ['EVD-CAN-09-IV-01'],
    observations: [
      {
        id: 'IVOIRE_PHENOTYPE',
        label: 'Ivoire (dilution du lipochrome)',
        maleHypotheses: [['Z_iv', 'Z_iv']],
        femaleHypotheses: [['Z_iv', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Ivoire liée au sexe récessive (statut PROVISIONAL, cartographie physique non certifiée).'
      },
      {
        id: 'NON_IVOIRE',
        label: 'Non-Ivoire',
        maleHypotheses: [['Z_+', 'Z_+'], ['Z_+', 'Z_iv']],
        femaleHypotheses: [['Z_+', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Non-ivoire : mâle potentiellement porteur d\'ivoire.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['Z_+', 'W'], ['Z_iv', 'W']] 
      : [['Z_+', 'Z_+'], ['Z_+', 'Z_iv'], ['Z_iv', 'Z_iv']]
  },

  // 5. Isabelle — Haplotype recombinant Z (Recombinant Brun + Agate)
  {
    locusId: 'CAN_HAPLO_ISABELLE',
    displayName: 'Isabelle (Recombinant Brun + Agate)',
    transmission: 'Z_LINKED',
    isProvisional: false,
    alleles: ['Z_+_+', 'Z_br_ag'],
    evidenceIds: ['EVD-CAN-09-ISA-01', 'EVD-CAN-09-001'],
    observations: [
      {
        id: 'ISABELLE_PHENOTYPE',
        label: 'Isabelle (recombinant Brun + Agate)',
        maleHypotheses: [['Z_br_ag', 'Z_br_ag']],
        femaleHypotheses: [['Z_br_ag', 'W']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Haplotype recombinant [Z_br, Z_ag]. Chez le mâle, la phase (CIS/TRANS/UNKNOWN) doit être qualifiée.'
      },
      {
        id: 'NON_ISABELLE',
        label: 'Non-Isabelle',
        maleHypotheses: [['Z_+_+', 'Z_+_+'], ['Z_+_+', 'Z_br_ag']],
        femaleHypotheses: [['Z_+_+', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Non-isabelle : porteur possible de l\'haplotype.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['Z_+_+', 'W'], ['Z_br_ag', 'W']] 
      : [['Z_+_+', 'Z_+_+'], ['Z_+_+', 'Z_br_ag'], ['Z_br_ag', 'Z_br_ag']]
  },

  // 6. Intensif / Schimmel — Autosomique à dominance incomplète (Létal I/I)
  {
    locusId: 'CAN_LOC_INTENSIVE',
    displayName: 'Intensif / Schimmel',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['i', 'I'],
    evidenceIds: ['EVD-CAN-08-004'],
    observations: [
      {
        id: 'SCHIMMEL',
        label: 'Schimmel (non-intensif i/i)',
        maleHypotheses: [['i', 'i']],
        femaleHypotheses: [['i', 'i']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Plumage schimmel récessif non-létal homozygote i/i.'
      },
      {
        id: 'INTENSIVE',
        label: 'Intensif (I/i - homozygote I/I létal in ovo)',
        maleHypotheses: [['I', 'i']],
        femaleHypotheses: [['I', 'i']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Facteur dominant incomplet. L\'homozygote I/I est létal in ovo à 25%.'
      }
    ],
    allHypotheses: () => [['i', 'i'], ['I', 'i']]
  },

  // 7. Huppé (Crest) — Autosomique dominant (Létal Cr/Cr)
  {
    locusId: 'CAN_LOC_CREST',
    displayName: 'Huppé (Crest)',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['cr+', 'Cr'],
    evidenceIds: ['EVD-CAN-08-007'],
    observations: [
      {
        id: 'NON_CREST',
        label: 'Non-Huppé / Tête lisse (cr+/cr+)',
        maleHypotheses: [['cr+', 'cr+']],
        femaleHypotheses: [['cr+', 'cr+']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Sauvage récessif cr+/cr+.'
      },
      {
        id: 'CREST',
        label: 'Huppé (Cr/cr+ - homozygote Cr/Cr létal)',
        maleHypotheses: [['Cr', 'cr+']],
        femaleHypotheses: [['Cr', 'cr+']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Facteur dominant. L\'homozygote Cr/Cr est létal (hernie cérébrale).'
      }
    ],
    allHypotheses: () => [['cr+', 'cr+'], ['Cr', 'cr+']]
  },

  // 8. Blanc Dominant — Autosomique dominant (Létal Wh/Wh)
  {
    locusId: 'CAN_LOC_WHITE_DOMINANT',
    displayName: 'Blanc Dominant',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['wh+', 'Wh'],
    evidenceIds: ['EVD-CAN-08-004'],
    observations: [
      {
        id: 'NON_WHITE_DOM',
        label: 'Lipochrome normal (wh+/wh+)',
        maleHypotheses: [['wh+', 'wh+']],
        femaleHypotheses: [['wh+', 'wh+']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Sauvage non porteur wh+/wh+.'
      },
      {
        id: 'WHITE_DOM',
        label: 'Blanc dominant (Wh/wh+ - homozygote Wh/Wh létal)',
        maleHypotheses: [['Wh', 'wh+']],
        femaleHypotheses: [['Wh', 'wh+']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Inhibition partielle de lipochrome. Homozygote Wh/Wh létal in ovo à 25%.'
      }
    ],
    allHypotheses: () => [['wh+', 'wh+'], ['Wh', 'wh+']]
  },

  // 9. Blanc Récessif — Autosomique récessif
  {
    locusId: 'CAN_LOC_WHITE_RECESSIVE',
    displayName: 'Blanc Récessif',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'wh_rec'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'WILD_LIPO',
        label: 'Lipochrome normal visible (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'wh_rec']],
        femaleHypotheses: [['+', '+'], ['+', 'wh_rec']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Lipochrome normal dominant (+), porteur possible de blanc récessif.'
      },
      {
        id: 'WHITE_REC',
        label: 'Blanc récessif (wh_rec/wh_rec)',
        maleHypotheses: [['wh_rec', 'wh_rec']],
        femaleHypotheses: [['wh_rec', 'wh_rec']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Incapacité d\'assimilation des caroténoïdes. Autosomique récessif classique.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'wh_rec'], ['wh_rec', 'wh_rec']]
  },

  // 10. Opale — Autosomique récessif
  {
    locusId: 'CAN_LOC_OPAL',
    displayName: 'Opale',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'op'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_OPAL',
        label: 'Non-Opale (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'op']],
        femaleHypotheses: [['+', '+'], ['+', 'op']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Phénotype non-opale, portage possible.'
      },
      {
        id: 'OPAL',
        label: 'Opale (op/op)',
        maleHypotheses: [['op', 'op']],
        femaleHypotheses: [['op', 'op']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Inversion de pigmentation sous la plume.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'op'], ['op', 'op']]
  },

  // 11. Phaéo — Autosomique récessif
  {
    locusId: 'CAN_LOC_PHAEO',
    displayName: 'Phaéo',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'ph'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_PHAEO',
        label: 'Non-Phaéo (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'ph']],
        femaleHypotheses: [['+', '+'], ['+', 'ph']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Phénotype non-phaéo.'
      },
      {
        id: 'PHAEO',
        label: 'Phaéo (ph/ph)',
        maleHypotheses: [['ph', 'ph']],
        femaleHypotheses: [['ph', 'ph']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Suppression d\'eumélanine avec rétention de phaéomélanine.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'ph'], ['ph', 'ph']]
  },

  // 12. Topaze — Autosomique récessif
  {
    locusId: 'CAN_LOC_TOPAZ',
    displayName: 'Topaze',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'to'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_TOPAZ',
        label: 'Non-Topaze (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'to']],
        femaleHypotheses: [['+', '+'], ['+', 'to']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Non-topaze sauvage.'
      },
      {
        id: 'TOPAZ',
        label: 'Topaze (to/to)',
        maleHypotheses: [['to', 'to']],
        femaleHypotheses: [['to', 'to']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Concentration médullaire de la mélanine.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'to'], ['to', 'to']]
  },

  // 13. Eumo — Autosomique récessif
  {
    locusId: 'CAN_LOC_EUMO',
    displayName: 'Eumo',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'eu'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_EUMO',
        label: 'Non-Eumo (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'eu']],
        femaleHypotheses: [['+', '+'], ['+', 'eu']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Non-eumo sauvage.'
      },
      {
        id: 'EUMO',
        label: 'Eumo (eu/eu)',
        maleHypotheses: [['eu', 'eu']],
        femaleHypotheses: [['eu', 'eu']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Réduction eumélanique et yeux rubis.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'eu'], ['eu', 'eu']]
  },

  // 14. Onyx — Autosomique récessif
  {
    locusId: 'CAN_LOC_ONYX',
    displayName: 'Onyx',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'on'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_ONYX',
        label: 'Non-Onyx (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'on']],
        femaleHypotheses: [['+', '+'], ['+', 'on']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Non-onyx sauvage.'
      },
      {
        id: 'ONYX',
        label: 'Onyx (on/on)',
        maleHypotheses: [['on', 'on']],
        femaleHypotheses: [['on', 'on']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Hypermélanisation mate.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'on'], ['on', 'on']]
  },

  // 15. Cobalt — Autosomique récessif
  {
    locusId: 'CAN_LOC_COBALT',
    displayName: 'Cobalt',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'co'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_COBALT',
        label: 'Non-Cobalt (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'co']],
        femaleHypotheses: [['+', '+'], ['+', 'co']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Non-cobalt sauvage.'
      },
      {
        id: 'COBALT',
        label: 'Cobalt (co/co)',
        maleHypotheses: [['co', 'co']],
        femaleHypotheses: [['co', 'co']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Diffusion d\'eumélanine jusqu\'à l\'extrémité des barbes.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'co'], ['co', 'co']]
  },

  // 16. Jaspe — Autosomique à dominance incomplète
  {
    locusId: 'CAN_LOC_JASPE',
    displayName: 'Jaspe',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'Ja'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_JASPE',
        label: 'Non-Jaspe (+/+)',
        maleHypotheses: [['+', '+']],
        femaleHypotheses: [['+', '+']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Sauvage non-jaspe.'
      },
      {
        id: 'JASPE_SF',
        label: 'Jaspe Simple Facteur (Ja/+)',
        maleHypotheses: [['Ja', '+']],
        femaleHypotheses: [['Ja', '+']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Incomplètement dominant en simple facteur.'
      },
      {
        id: 'JASPE_DF',
        label: 'Jaspe Double Facteur (Ja/Ja)',
        maleHypotheses: [['Ja', 'Ja']],
        femaleHypotheses: [['Ja', 'Ja']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Double facteur viable non létal.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['Ja', '+'], ['Ja', 'Ja']]
  },

  // 17. Mogno — Autosomique récessif
  {
    locusId: 'CAN_LOC_MOGNO',
    displayName: 'Mogno',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'mo'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_MOGNO',
        label: 'Non-Mogno (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'mo']],
        femaleHypotheses: [['+', '+'], ['+', 'mo']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Sauvage non-mogno.'
      },
      {
        id: 'MOGNO',
        label: 'Mogno (mo/mo)',
        maleHypotheses: [['mo', 'mo']],
        femaleHypotheses: [['mo', 'mo']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Brun acajou caractéristique.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'mo'], ['mo', 'mo']]
  },

  // 18. Urucum — Autosomique récessif
  {
    locusId: 'CAN_LOC_URUCUM',
    displayName: 'Urucum',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'ur'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_URUCUM',
        label: 'Non-Urucum (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'ur']],
        femaleHypotheses: [['+', '+'], ['+', 'ur']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Bec et pattes clairs normaux.'
      },
      {
        id: 'URUCUM',
        label: 'Urucum (ur/ur)',
        maleHypotheses: [['ur', 'ur']],
        femaleHypotheses: [['ur', 'ur']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Bec et pattes rouges.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'ur'], ['ur', 'ur']]
  },

  // 19. Mosaïque — Autosomique récessif
  {
    locusId: 'CAN_LOC_MOSAIC',
    displayName: 'Mosaïque',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    alleles: ['+', 'mos'],
    evidenceIds: ['EVD-CAN-09-001'],
    observations: [
      {
        id: 'NON_MOSAIC',
        label: 'Non-Mosaïque (+/-)',
        maleHypotheses: [['+', '+'], ['+', 'mos']],
        femaleHypotheses: [['+', '+'], ['+', 'mos']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Non-mosaïque.'
      },
      {
        id: 'MOSAIC',
        label: 'Mosaïque (mos/mos)',
        maleHypotheses: [['mos', 'mos']],
        femaleHypotheses: [['mos', 'mos']],
        maleDetermination: 'CONFIRMED',
        femaleDetermination: 'CONFIRMED',
        rationale: 'Dimorphisme sexuel caroténoïde.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['+', 'mos'], ['mos', 'mos']]
  },

  // 20. Ino — Z-linked (STRICTEMENT BLOQUÉ / CONFLICTING)
  {
    locusId: 'CAN_LOC_INO',
    displayName: 'Ino (Controverse allélisme Z)',
    transmission: 'Z_LINKED',
    isProvisional: false,
    isBlocked: true,
    blockedRationale: 'Conflit scientifique majeur (Martin 2002 vs Pomarède 1989) : allèle Z vs composite phénotypique. Calculs et certitudes bloqués.',
    alleles: ['ino+', 'ino_ag', 'ino_sat'],
    evidenceIds: ['EVD-CAN-09-SAT-01'],
    observations: [
      {
        id: 'INO_OBS',
        label: 'Ino (observation visuelle yeux rouges)',
        maleHypotheses: [['ino_ag', 'ino_ag']],
        femaleHypotheses: [['ino_ag', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Locus bloqué : aucune confirmation génétique autorisée.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['ino+', 'W'], ['ino_ag', 'W'], ['ino_sat', 'W']] 
      : [['ino+', 'ino+'], ['ino+', 'ino_ag'], ['ino_ag', 'ino_ag']]
  },

  // 21. Satiné — Z-linked (STRICTEMENT BLOQUÉ / CONFLICTING)
  {
    locusId: 'CAN_LOC_SATINE',
    displayName: 'Satiné (Controverse scientifique)',
    transmission: 'Z_LINKED',
    isProvisional: false,
    isBlocked: true,
    blockedRationale: 'Controverse Modèle A (locus lié Z) vs Modèle B (allèle Ino Z). Zéro arbitrage automatique.',
    alleles: ['Z_+', 'Z_sa'],
    evidenceIds: ['EVD-CAN-09-SAT-01'],
    observations: [
      {
        id: 'SATINE_OBS',
        label: 'Satiné (observation visuelle sous-plumage beige yeux rouges)',
        maleHypotheses: [['Z_sa', 'Z_sa']],
        femaleHypotheses: [['Z_sa', 'W']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Locus sous controverse active : calculs et certitudes bloqués.'
      }
    ],
    allHypotheses: (isFemale) => isFemale 
      ? [['Z_+', 'W'], ['Z_sa', 'W']] 
      : [['Z_+', 'Z_+'], ['Z_+', 'Z_sa'], ['Z_sa', 'Z_sa']]
  },

  // 22. Perle — Autosomique sous étude (STRICTEMENT BLOQUÉ / CONFLICTING)
  {
    locusId: 'CAN_LOC_PERLE',
    displayName: 'Perle (Sous étude)',
    transmission: 'AUTOSOMAL',
    isProvisional: false,
    isBlocked: true,
    blockedRationale: 'Contradictions dans la littérature avicole quant au mode de transmission. Calculateur désactivé.',
    alleles: ['+', 'perle'],
    evidenceIds: [],
    observations: [
      {
        id: 'PERLE_OBS',
        label: 'Perle (observation visuelle)',
        maleHypotheses: [['perle', '+']],
        femaleHypotheses: [['perle', '+']],
        maleDetermination: 'POSSIBLE_SET',
        femaleDetermination: 'POSSIBLE_SET',
        rationale: 'Transmission non élucidée en peer-reviewed.'
      }
    ],
    allHypotheses: () => [['+', '+'], ['perle', '+'], ['perle', 'perle']]
  }
];

// --- PROPS DU COMPOSANT ---

export interface CanonicalGeneticsEditorProps {
  bird: Canari | null;
  open: boolean;
  onClose: () => void;
  onSave?: (updatedLoci: CanonicalLocusItem[]) => void;
  language?: Language;
  initialLocusId?: string;
  allBirds?: Canari[];
  'data-testid'?: string;
}

export function CanonicalGeneticsEditor({
  bird,
  open,
  onClose,
  onSave,
  language: explicitLanguage,
  initialLocusId,
  allBirds = [],
  'data-testid': testId = 'canonical-genetics-editor'
}: CanonicalGeneticsEditorProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  // Espèce et sexe du sujet
  const speciesId = bird?.espece || (bird as any)?.speciesId || (bird as any)?.species || '';
  const normalizedSpecies = speciesId.toLowerCase().trim();
  const isGouldian = normalizedSpecies === 'diamant_gould' || normalizedSpecies === 'gouldian' || normalizedSpecies === 'chloebia_gouldiae';
  const isCanary = ['canari', 'canary', 'serinus_canaria', 'serinus_canaria_domestica'].includes(normalizedSpecies);
  const isFemale = bird?.sexe === 'Femelle' || (bird?.sexe as any) === 'F' || (bird?.sexe as any) === 'FEMALE';

  // Résolution parentale pour suggestions génétiques
  const father = useMemo(() => {
    if (!bird?.pere_id || allBirds.length === 0) return null;
    return allBirds.find(b => String(b.id) === String(bird.pere_id) || (b.bague && b.bague === String(bird.pere_id))) || null;
  }, [bird?.pere_id, allBirds]);

  const mother = useMemo(() => {
    if (!bird?.mere_id || allBirds.length === 0) return null;
    return allBirds.find(b => String(b.id) === String(bird.mere_id) || (b.bague && b.bague === String(bird.mere_id))) || null;
  }, [bird?.mere_id, allBirds]);

  // Loci disponibles selon l'espèce (Zéro Canary Fallback / Zéro Cross-Species Fallback)
  const availableLoci: CanonicalLocusDefinition[] = useMemo(() => {
    if (isGouldian) return GOULDIAN_LOCI_CATALOG;
    if (isCanary) return CANARY_LOCI_CATALOG;
    return [];
  }, [isGouldian, isCanary]);

  // État local du formulaire
  const [selectedLocusId, setSelectedLocusId] = useState<string>(
    initialLocusId || availableLoci[0]?.locusId || ''
  );
  const [mode, setMode] = useState<QualificationMode>('OBSERVED');
  const [selectedObservationId, setSelectedObservationId] = useState<string>('');
  const [allele1, setAllele1] = useState<string>('');
  const [allele2, setAllele2] = useState<string>('');
  const [selectedHypotheses, setSelectedHypotheses] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<EpistemicSourceType>('PHENOTYPIC_OBSERVATION');
  const [selectedConfidence, setSelectedConfidence] = useState<EpistemicConfidenceType>('HIGH');
  const [humanReviewStatus, setHumanReviewStatus] = useState<HumanReviewStatusType>('NOT_REVIEWED');
  const [isabellePhase, setIsabellePhase] = useState<'CIS' | 'TRANS' | 'PHASE_UNKNOWN'>('PHASE_UNKNOWN');
  const [provenanceNote, setProvenanceNote] = useState<string>('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const [showGuidedQuestions, setShowGuidedQuestions] = useState<boolean>(false);

  // Suggestions génétiques déduites des parents (Étape 6)
  const suggestions: PassportSuggestion[] = useMemo(() => {
    if (!open || (!father && !mother)) return [];
    try {
      const generated = PassportSuggestionService.generateSuggestions({
        bird: bird || undefined,
        speciesId,
        sex: isFemale ? 'Femelle' : 'Mâle',
        father,
        mother,
        allBirds
      });
      return generated.filter(s => s.isGenetics && !dismissedSuggestionIds.includes(s.id));
    } catch {
      return [];
    }
  }, [open, bird, speciesId, isFemale, father, mother, allBirds, dismissedSuggestionIds]);

  // Actions de suggestions (5 actions obligatoires Étape 6)
  const handleAcceptSuggestion = (suggestion: PassportSuggestion) => {
    // RÈGLE ABSOLUE : Attribue OBSERVED ou DECLARED selon la nature, JAMAIS GENETICALLY_CONFIRMED
    setMode('DECLARED');
    setSelectedSource('PARENTAL_PEDIGREE');
    setSelectedConfidence(suggestion.confidence === 'HIGH' ? 'HIGH' : 'MEDIUM');
    setProvenanceNote(`Suggestion parentale acceptée : ${suggestion.sourceDescription}`);
    setDismissedSuggestionIds(prev => [...prev, suggestion.id]);
  };

  const handleModifySuggestion = (suggestion: PassportSuggestion) => {
    setMode('DECLARED');
    setSelectedSource('USER_DECLARATION');
    setSelectedConfidence('MEDIUM');
    setProvenanceNote(`Suggestion parentale modifiée : ${suggestion.sourceDescription}`);
    setDismissedSuggestionIds(prev => [...prev, suggestion.id]);
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setDismissedSuggestionIds(prev => [...prev, suggestionId]);
  };

  const handleKeepUnknownSuggestion = (suggestionId: string) => {
    setMode('UNKNOWN');
    setSelectedConfidence('UNKNOWN');
    setDismissedSuggestionIds(prev => [...prev, suggestionId]);
  };

  const handleKeepNotTestedSuggestion = (suggestionId: string) => {
    setMode('NOT_TESTED');
    setSelectedConfidence('UNKNOWN');
    setDismissedSuggestionIds(prev => [...prev, suggestionId]);
  };

  // Synchronisation lors de l'ouverture ou du changement de locus initial
  useEffect(() => {
    if (open && availableLoci.length > 0) {
      const initial = initialLocusId && availableLoci.some(l => l.locusId === initialLocusId)
        ? initialLocusId
        : availableLoci[0].locusId;
      setSelectedLocusId(initial);
      resetFormForLocus(initial);
    }
  }, [open, initialLocusId, availableLoci]);

  const currentLocusDef = useMemo(() => {
    return availableLoci.find(l => l.locusId === selectedLocusId);
  }, [availableLoci, selectedLocusId]);

  const resetFormForLocus = (locusId: string) => {
    const locus = availableLoci.find(l => l.locusId === locusId);
    if (!locus) return;

    setMode('OBSERVED');
    const firstObs = locus.observations[0];
    setSelectedObservationId(firstObs ? firstObs.id : '');
    setSelectedSource('PHENOTYPIC_OBSERVATION');
    setSelectedConfidence('HIGH');
    setProvenanceNote('');
    setConflictWarning(locus.isBlocked ? (locus.blockedRationale || "Ce locus fait l'objet d'un blocage scientifique ou d'une controverse non résolue.") : null);
    setIsabellePhase('PHASE_UNKNOWN');

    // Initialiser les allèles par défaut
    if (locus.transmission === 'Z_LINKED' && isFemale) {
      setAllele1(locus.alleles[0] || '');
      setAllele2('W');
    } else {
      setAllele1(locus.alleles[0] || '');
      setAllele2(locus.alleles[0] || '');
    }

    // Initialiser les hypothèses possibles
    const hypotheses = locus.allHypotheses(isFemale);
    setSelectedHypotheses(hypotheses.map(h => `${h[0]}/${h[1]}`));

    // Règle provisoire ou bloquée : revue humaine requise
    if (locus.isProvisional || locus.isBlocked) {
      setHumanReviewStatus('REQUIRED');
    } else {
      setHumanReviewStatus('NOT_REVIEWED');
    }
  };

  const handleLocusChange = (newLocusId: string) => {
    setSelectedLocusId(newLocusId);
    resetFormForLocus(newLocusId);
  };

  const handleModeChange = (newMode: QualificationMode) => {
    setMode(newMode);
    setConflictWarning(null);

    if (newMode === 'OBSERVED') {
      setSelectedSource('PHENOTYPIC_OBSERVATION');
      setSelectedConfidence('HIGH');
    } else if (newMode === 'DECLARED') {
      setSelectedSource('USER_DECLARATION');
      setSelectedConfidence('MEDIUM');
    } else if (newMode === 'DNA_TEST') {
      setSelectedSource('DNA_TEST');
      setSelectedConfidence('VERY_HIGH');
    } else if (newMode === 'POSSIBLE_SET') {
      setSelectedSource('SYSTEM_INFERENCE');
      setSelectedConfidence('MEDIUM');
    } else if (newMode === 'UNKNOWN') {
      setSelectedConfidence('UNKNOWN');
    } else if (newMode === 'NOT_TESTED') {
      setSelectedConfidence('UNKNOWN');
    }
  };

  // Fermeture par la touche Échap
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Si non ouvert, ne rien afficher
  if (!open) return null;

  // Si l'espèce n'a pas de catalogue canonique (Zero Canary Fallback / Zero Cross-Species Fallback)
  if ((!isGouldian && !isCanary) || availableLoci.length === 0) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={translateEpistemic(language, 'editor.title')}
        data-testid={testId}
      >
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {translateEpistemic(language, 'editor.title')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {translateEpistemic(language, 'editor.no_catalogue')}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              {translateEpistemic(language, 'editor.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CALCUL ÉPISTÉMIQUE QUALIFIÉ DU LOCUS EN COURS ---

  const computeLocusRecord = (): { record: CanonicalLocusItem; error?: string } => {
    if (!currentLocusDef) {
      return { record: { locusId: selectedLocusId }, error: 'Locus indéfini' };
    }

    const isProvisional = currentLocusDef.isProvisional;
    const isBlocked = Boolean(currentLocusDef.isBlocked);
    const isZLinked = currentLocusDef.transmission === 'Z_LINKED';
    const isIsabelle = currentLocusDef.locusId === 'CAN_HAPLO_ISABELLE';

    // Règle cytogénétique : pas de porteur Z-linked chez la femelle ZW
    const femaleZLinked = isZLinked && isFemale;

    // Détermination de l'état porteur
    let isCarrier = false;
    let carrierState: string = femaleZLinked ? 'NOT_APPLICABLE' : 'NON_CARRIER';

    const baseEvidence = currentLocusDef.evidenceIds || [];

    // CAS 1 : UNKNOWN
    if (mode === 'UNKNOWN') {
      return {
        record: {
          locusId: currentLocusDef.locusId,
          displayName: currentLocusDef.displayName,
          transmission: currentLocusDef.transmission,
          determination: 'UNKNOWN',
          status: 'UNKNOWN',
          confidence: 'UNKNOWN',
          humanReview: humanReviewStatus,
          humanReviewRequired: isProvisional || isBlocked || humanReviewStatus === 'REQUIRED' || humanReviewStatus === 'CONFLICT_REVIEW',
          isProvisional,
          isBlocked,
          blocked: isBlocked,
          isCarrier: false,
          carrierState: femaleZLinked ? 'NOT_APPLICABLE' : undefined,
          source: selectedSource,
          evidenceIds: baseEvidence,
          phase: isIsabelle ? isabellePhase : undefined
        }
      };
    }

    // CAS 2 : NOT_TESTED
    if (mode === 'NOT_TESTED') {
      return {
        record: {
          locusId: currentLocusDef.locusId,
          displayName: currentLocusDef.displayName,
          transmission: currentLocusDef.transmission,
          determination: 'NOT_TESTED',
          status: 'NOT_TESTED',
          confidence: 'UNKNOWN',
          humanReview: humanReviewStatus,
          humanReviewRequired: isProvisional || isBlocked || humanReviewStatus === 'REQUIRED' || humanReviewStatus === 'CONFLICT_REVIEW',
          isProvisional,
          isBlocked,
          blocked: isBlocked,
          isCarrier: false,
          carrierState: femaleZLinked ? 'NOT_APPLICABLE' : undefined,
          source: selectedSource,
          evidenceIds: baseEvidence,
          phase: isIsabelle ? isabellePhase : undefined
        }
      };
    }

    // CAS 3 : CONFLICT_REVIEW actif
    if (humanReviewStatus === 'CONFLICT_REVIEW' || isBlocked) {
      if (mode === 'DNA_TEST' && isBlocked) {
        return {
          record: {
            locusId: currentLocusDef.locusId,
            displayName: currentLocusDef.displayName,
            transmission: currentLocusDef.transmission,
            determination: 'POSSIBLE_SET',
            status: 'CONFLICT_REVIEW',
            confidence: 'MEDIUM',
            humanReview: 'CONFLICT_REVIEW',
            humanReviewRequired: true,
            isProvisional,
            isBlocked: true,
            blocked: true,
            isCarrier: false,
            carrierState: femaleZLinked ? 'NOT_APPLICABLE' : undefined,
            source: 'DNA_TEST',
            evidenceIds: baseEvidence,
            rationale: currentLocusDef.blockedRationale || 'Locus bloqué scientifiquement : confirmation génétique proscrite.'
          },
          error: 'Locus bloqué scientifiquement : levée du blocage et confirmation génétique interdites.'
        };
      }
    }

    // CAS 4 : OBSERVED
    if (mode === 'OBSERVED') {
      const obs = currentLocusDef.observations.find(o => o.id === selectedObservationId) || currentLocusDef.observations[0];
      const hypotheses = isFemale ? obs.femaleHypotheses : obs.maleHypotheses;
      const determination = isFemale ? obs.femaleDetermination : obs.maleDetermination;

      // Anti-Inférence Stricte : status = OBSERVED, JAMAIS GENETICALLY_CONFIRMED ni VERIFIED
      let isPossible = determination === 'POSSIBLE_SET' || hypotheses.length > 1;

      // Isabelle Haplotype : si phase inconnue, forcer POSSIBLE_SET
      let finalPossibleSet = isPossible ? hypotheses : undefined;
      let finalAlleles: [string, string] | undefined = !isPossible && hypotheses[0] ? hypotheses[0] : undefined;

      if (isIsabelle) {
        if (isabellePhase === 'PHASE_UNKNOWN') {
          isPossible = true;
          finalPossibleSet = isFemale ? [['Z_br_ag', 'W'], ['Z_+_+', 'W']] : [['Z_br_ag', 'Z_+_+'], ['Z_br_+', 'Z_+_ag']];
          finalAlleles = undefined;
        } else if (isabellePhase === 'CIS') {
          finalAlleles = isFemale ? ['Z_br_ag', 'W'] : ['Z_br_ag', 'Z_+_+'];
        } else if (isabellePhase === 'TRANS') {
          finalAlleles = isFemale ? ['Z_br_ag', 'W'] : ['Z_br_+', 'Z_+_ag'];
        }
      }

      return {
        record: {
          locusId: currentLocusDef.locusId,
          displayName: currentLocusDef.displayName,
          transmission: currentLocusDef.transmission,
          determination: isPossible ? 'POSSIBLE_SET' : 'CONFIRMED',
          status: 'OBSERVED', // RÈGLE ABSOLUE : Statut OBSERVED
          source: 'PHENOTYPIC_OBSERVATION',
          confidence: selectedConfidence,
          humanReview: isBlocked ? 'REQUIRED' : humanReviewStatus,
          humanReviewRequired: isProvisional || isBlocked || isIsabelle || humanReviewStatus === 'REQUIRED',
          isProvisional,
          isBlocked,
          blocked: isBlocked,
          alleles: finalAlleles,
          possibleSet: finalPossibleSet,
          isCarrier: false,
          carrierState: femaleZLinked ? 'NOT_APPLICABLE' : undefined,
          phase: isIsabelle ? isabellePhase : undefined,
          evidenceIds: baseEvidence,
          rationale: obs.rationale || provenanceNote || (isBlocked ? currentLocusDef.blockedRationale : undefined)
        }
      };
    }

    // CAS 5 : DECLARED
    if (mode === 'DECLARED') {
      // Rejet des configurations cytogénétiques impossibles pour les femelles ZW
      if (femaleZLinked && allele2 && allele2 !== 'W') {
        return {
          record: {
            locusId: currentLocusDef.locusId,
            displayName: currentLocusDef.displayName,
            transmission: currentLocusDef.transmission,
            determination: 'POSSIBLE_SET',
            status: 'CONFLICT_REVIEW',
            confidence: 'UNKNOWN',
            humanReview: 'CONFLICT_REVIEW',
            humanReviewRequired: true,
            isProvisional
          },
          error: 'ZW_VIOLATION : Une femelle ZW ne peut posséder qu\'un seul allèle Z (second chromosome strictement W).'
        };
      }

      // Déclaration éleveur : status = DECLARED, JAMAIS GENETICALLY_CONFIRMED
      const effectiveAlleles: [string, string] = femaleZLinked 
        ? [allele1, 'W'] 
        : [allele1, allele2];

      if (!femaleZLinked && effectiveAlleles[0] !== effectiveAlleles[1]) {
        isCarrier = true;
        carrierState = 'CONFIRMED_CARRIER';
      }

      let declaredDetermination: 'CONFIRMED' | 'POSSIBLE_SET' = 'CONFIRMED';
      let declaredPossibleSet: Array<[string, string]> | undefined = undefined;

      if (isIsabelle && isabellePhase === 'PHASE_UNKNOWN') {
        declaredDetermination = 'POSSIBLE_SET';
        declaredPossibleSet = isFemale ? [['Z_br_ag', 'W'], ['Z_+_+', 'W']] : [['Z_br_ag', 'Z_+_+'], ['Z_br_+', 'Z_+_ag']];
      }

      return {
        record: {
          locusId: currentLocusDef.locusId,
          displayName: currentLocusDef.displayName,
          transmission: currentLocusDef.transmission,
          determination: declaredDetermination,
          status: 'DECLARED', // RÈGLE ABSOLUE : Déclaration éleveur
          source: 'USER_DECLARATION',
          confidence: selectedConfidence,
          humanReview: isBlocked ? 'REQUIRED' : humanReviewStatus,
          humanReviewRequired: isProvisional || isBlocked || isIsabelle || humanReviewStatus === 'REQUIRED',
          isProvisional,
          isBlocked,
          blocked: isBlocked,
          alleles: declaredDetermination === 'CONFIRMED' ? effectiveAlleles : undefined,
          possibleSet: declaredPossibleSet,
          isCarrier: femaleZLinked ? false : isCarrier,
          carrierState: femaleZLinked ? 'NOT_APPLICABLE' : carrierState,
          phase: isIsabelle ? isabellePhase : undefined,
          evidenceIds: baseEvidence,
          rationale: provenanceNote || (isBlocked ? currentLocusDef.blockedRationale : 'Information déclarée par l\'éleveur.')
        }
      };
    }

    // CAS 6 : DNA_TEST
    if (mode === 'DNA_TEST') {
      // Si locus bloqué : interdiction stricte de confirmation génétique
      if (isBlocked) {
        return {
          record: {
            locusId: currentLocusDef.locusId,
            displayName: currentLocusDef.displayName,
            transmission: currentLocusDef.transmission,
            determination: 'POSSIBLE_SET',
            status: 'CONFLICT_REVIEW',
            confidence: 'MEDIUM',
            humanReview: 'CONFLICT_REVIEW',
            humanReviewRequired: true,
            isProvisional,
            isBlocked: true,
            blocked: true,
            isCarrier: false,
            carrierState: femaleZLinked ? 'NOT_APPLICABLE' : undefined,
            source: 'DNA_TEST',
            evidenceIds: baseEvidence,
            rationale: currentLocusDef.blockedRationale || 'Locus bloqué scientifiquement : confirmation génétique proscrite.'
          },
          error: 'Locus bloqué scientifiquement : levée du blocage et confirmation génétique interdites.'
        };
      }

      // Rejet des configurations cytogénétiques impossibles pour les femelles ZW
      if (femaleZLinked && allele2 && allele2 !== 'W') {
        return {
          record: {
            locusId: currentLocusDef.locusId,
            displayName: currentLocusDef.displayName,
            transmission: currentLocusDef.transmission,
            determination: 'POSSIBLE_SET',
            status: 'CONFLICT_REVIEW',
            confidence: 'UNKNOWN',
            humanReview: 'CONFLICT_REVIEW',
            humanReviewRequired: true,
            isProvisional
          },
          error: 'ZW_VIOLATION : Une femelle ZW ne peut posséder qu\'un seul allèle Z (second chromosome strictement W).'
        };
      }

      const effectiveAlleles: [string, string] = femaleZLinked 
        ? [allele1, 'W'] 
        : [allele1, allele2];

      // Vérification de la complétude du test ADN
      const a1Valid = Boolean(allele1 && currentLocusDef.alleles.includes(allele1));
      const a2Valid = femaleZLinked ? true : Boolean(allele2 && currentLocusDef.alleles.includes(allele2));

      if (!a1Valid || !a2Valid) {
        return {
          record: {
            locusId: currentLocusDef.locusId,
            displayName: currentLocusDef.displayName,
            transmission: currentLocusDef.transmission,
            determination: 'NOT_TESTED',
            status: 'NOT_TESTED',
            confidence: 'UNKNOWN',
            humanReview: 'REQUIRED',
            humanReviewRequired: true,
            isProvisional,
            evidenceIds: baseEvidence
          },
          error: 'Test ADN incomplet : allèles manquants ou invalides.'
        };
      }

      if (!femaleZLinked && effectiveAlleles[0] !== effectiveAlleles[1]) {
        isCarrier = true;
        carrierState = 'CONFIRMED_CARRIER';
      }

      let dnaDetermination: 'CONFIRMED' | 'POSSIBLE_SET' = 'CONFIRMED';
      let dnaPossibleSet: Array<[string, string]> | undefined = undefined;

      // Isabelle : Si phase inconnue, impossible de confirmer CIS ou TRANS de manière certaine
      if (isIsabelle && isabellePhase === 'PHASE_UNKNOWN') {
        dnaDetermination = 'POSSIBLE_SET';
        dnaPossibleSet = isFemale ? [['Z_br_ag', 'W'], ['Z_+_+', 'W']] : [['Z_br_ag', 'Z_+_+'], ['Z_br_+', 'Z_+_ag']];
      }

      // Complétude validée -> GENETICALLY_CONFIRMED (sauf Isabelle phase inconnue)
      return {
        record: {
          locusId: currentLocusDef.locusId,
          displayName: currentLocusDef.displayName,
          transmission: currentLocusDef.transmission,
          determination: dnaDetermination,
          status: dnaDetermination === 'CONFIRMED' ? 'GENETICALLY_CONFIRMED' : 'INFERRED',
          source: 'DNA_TEST',
          confidence: selectedConfidence || 'VERY_HIGH',
          humanReview: humanReviewStatus,
          humanReviewRequired: isProvisional || isIsabelle || humanReviewStatus === 'REQUIRED',
          isProvisional,
          isBlocked: false,
          blocked: false,
          alleles: dnaDetermination === 'CONFIRMED' ? effectiveAlleles : undefined,
          possibleSet: dnaPossibleSet,
          isCarrier: femaleZLinked ? false : isCarrier,
          carrierState: femaleZLinked ? 'NOT_APPLICABLE' : carrierState,
          phase: isIsabelle ? isabellePhase : undefined,
          evidenceIds: baseEvidence,
          provenance: provenanceNote,
          rationale: provenanceNote || 'Test ADN certifié conforme.'
        }
      };
    }

    // CAS 7 : POSSIBLE_SET
    if (mode === 'POSSIBLE_SET') {
      if (selectedHypotheses.length === 0) {
        return {
          record: {
            locusId: currentLocusDef.locusId,
            displayName: currentLocusDef.displayName,
            transmission: currentLocusDef.transmission,
            determination: 'POSSIBLE_SET',
            status: 'INFERRED',
            confidence: selectedConfidence,
            humanReview: 'REQUIRED',
            humanReviewRequired: true,
            isProvisional,
            evidenceIds: baseEvidence
          },
          error: 'Veuillez sélectionner au moins une hypothèse.'
        };
      }

      const parsedHypotheses: Array<[string, string]> = selectedHypotheses.map(h => {
        const parts = h.split('/');
        return [parts[0], parts[1] || 'W'] as [string, string];
      });

      return {
        record: {
          locusId: currentLocusDef.locusId,
          displayName: currentLocusDef.displayName,
          transmission: currentLocusDef.transmission,
          determination: 'POSSIBLE_SET',
          status: selectedSource === 'USER_DECLARATION' ? 'DECLARED' : 'INFERRED',
          source: selectedSource,
          confidence: selectedConfidence,
          humanReview: isBlocked ? 'REQUIRED' : humanReviewStatus,
          humanReviewRequired: isProvisional || isBlocked || isIsabelle || humanReviewStatus === 'REQUIRED',
          isProvisional,
          isBlocked,
          blocked: isBlocked,
          possibleSet: parsedHypotheses,
          isCarrier: false,
          carrierState: femaleZLinked ? 'NOT_APPLICABLE' : undefined,
          phase: isIsabelle ? isabellePhase : undefined,
          evidenceIds: baseEvidence,
          rationale: provenanceNote || (isBlocked ? currentLocusDef.blockedRationale : 'Ensemble d\'hypothèses génétiques compatibles.')
        }
      };
    }

    return {
      record: {
        locusId: currentLocusDef.locusId,
        displayName: currentLocusDef.displayName,
        transmission: currentLocusDef.transmission,
        determination: 'UNKNOWN',
        status: 'UNKNOWN',
        confidence: 'UNKNOWN',
        isProvisional,
        evidenceIds: baseEvidence
      }
    };
  };

  const { record: previewRecord, error: validationError } = computeLocusRecord();

  const handleSave = () => {
    if (validationError) {
      setConflictWarning(validationError);
      return;
    }

    if (onSave) {
      // Fusionner dans les loci existants du passeport en conservant evidenceIds
      const existingLoci: CanonicalLocusItem[] = (bird?.passport as any)?.canonicalLoci || [];
      const existingItem = existingLoci.find(l => (l.locusId || l.locus) === previewRecord.locusId);
      if (existingItem?.evidenceIds) {
        previewRecord.evidenceIds = Array.from(new Set([...(previewRecord.evidenceIds || []), ...existingItem.evidenceIds]));
      }
      const updated = existingLoci.filter(l => (l.locusId || l.locus) !== previewRecord.locusId);
      updated.push(previewRecord);
      onSave(updated);
    }

    onClose();
  };

  const toggleHypothesis = (hypothesisStr: string) => {
    if (selectedHypotheses.includes(hypothesisStr)) {
      setSelectedHypotheses(selectedHypotheses.filter(h => h !== hypothesisStr));
    } else {
      setSelectedHypotheses([...selectedHypotheses, hypothesisStr]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={translateEpistemic(language, 'editor.title')}
      data-testid={testId}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        
        {/* EN-TÊTE MODALE */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Dna className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {translateEpistemic(language, 'editor.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {bird?.nom || bird?.bague || 'Oiseau'} · {isFemale ? 'Femelle (ZW)' : 'Mâle (ZZ)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={translateEpistemic(language, 'editor.cancel')}
            data-testid="editor-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPS DU FORMULAIRE */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* ALERTE CONFLIT OU ERREUR */}
          {(conflictWarning || validationError) && (
            <AppAlert
              type="danger"
              title="Avertissement épistémique"
              className="text-xs"
              data-testid="editor-conflict-alert"
            >
              <p>{conflictWarning || validationError}</p>
            </AppAlert>
          )}

          {/* ÉTAPE 1 : CHOIX DU LOCUS */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {translateEpistemic(language, 'editor.choose_locus')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="editor-locus-selector">
              {availableLoci.map((loc) => {
                const isSelected = loc.locusId === selectedLocusId;
                return (
                  <button
                    key={loc.locusId}
                    type="button"
                    onClick={() => handleLocusChange(loc.locusId)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                    data-testid={`locus-option-${loc.locusId}`}
                  >
                    <div className="font-bold">{loc.displayName}</div>
                    <div className="text-3xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {loc.transmission === 'Z_LINKED' ? 'Lié au sexe (Z)' : 'Autosomique'}
                      {loc.isProvisional && ' · Provisoire'}
                      {loc.isBlocked && ' · Bloqué'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AVERTISSEMENT LOCUS BLOQUÉ */}
          {currentLocusDef?.isBlocked && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-1" data-testid="blocked-locus-banner">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Locus bloqué scientifiquement (Controverse non résolue)</span>
              </div>
              <p className="text-3xs text-rose-600 dark:text-rose-400">
                {currentLocusDef.blockedRationale || "Ce locus est verrouillé en raison d'un conflit scientifique. Aucune confirmation génétique ou levée de blocage n'est permise."}
              </p>
            </div>
          )}

          {/* SÉLECTEUR DE PHASE ISABELLE (HAPLOTYPE RECOMBINANT Z) */}
          {selectedLocusId === 'CAN_HAPLO_ISABELLE' && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3" data-testid="isabelle-phase-panel">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Phase d'accouplement parental (Haplotype recombinant Z)
                </label>
                <span className="text-3xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  r ≈ 2%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2" data-testid="isabelle-phase-selector">
                {[
                  { phase: 'PHASE_UNKNOWN', label: 'Phase inconnue', desc: 'Hypothèses multiples (POSSIBLE_SET)' },
                  { phase: 'CIS', label: 'CIS', desc: 'Couplage [Z_br_ag / Z_+_+]' },
                  { phase: 'TRANS', label: 'TRANS', desc: 'Répulsion [Z_br_+ / Z_+_ag]' },
                ].map(({ phase, label, desc }) => (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => setIsabellePhase(phase as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isabellePhase === phase
                        ? 'border-indigo-600 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-indigo-200/60 dark:border-indigo-900/40 bg-white/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                    }`}
                    data-testid={`phase-option-${phase}`}
                  >
                    <div className="text-xs font-bold">{label}</div>
                    <div className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
              {isabellePhase === 'PHASE_UNKNOWN' && (
                <p className="text-3xs text-indigo-700 dark:text-indigo-300 font-medium">
                  Phase inconnue : aucune hypothèse n'est choisie arbitrairement. L'ensemble des configurations compatibles reste possible (POSSIBLE_SET).
                </p>
              )}
            </div>
          )}

          {/* NOTICES DE CAS SCIENTIFIQUES SENSIBLES (Étape 7) */}
          {/* A. Cas ZW femelle sur locus lié au sexe */}
          {currentLocusDef?.transmission === 'Z_LINKED' && isFemale && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-1 text-xs text-purple-900 dark:text-purple-300" data-testid="editor-zw-notice">
              <div className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span>Règle cytogénétique femelle (ZW)</span>
              </div>
              <p className="text-3xs text-purple-700 dark:text-purple-400">
                La femelle oiseau possède un chromosome Z unique (hémizygote ZW). Elle exprime obligatoirement tout allèle mutant Z et ne peut jamais être porteuse récessive d'une mutation liée au sexe (carrierState = NOT_APPLICABLE).
              </p>
            </div>
          )}

          {/* B. Facteur létal homozygote (25% mortalité embryonnaire in ovo) */}
          {currentLocusDef && (currentLocusDef.locusId.includes('CREST') || currentLocusDef.locusId.includes('INTENSIVE') || currentLocusDef.locusId.includes('HUPPE') || currentLocusDef.locusId.includes('INTENSIF')) && (
            <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-1 text-xs text-rose-900 dark:text-rose-200" data-testid="editor-lethal-notice">
              <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 animate-pulse" />
                <span>Facteur létal (25% de mortalité embryonnaire in ovo)</span>
              </div>
              <p className="text-3xs text-rose-700 dark:text-rose-300">
                L'accouplement de deux sujets exprimant cette mutation dominante entraîne une mortalité in ovo de 25% chez les embryons homozygotes (Duncker / Hutt).
              </p>
            </div>
          )}

          {/* SUGGESTIONS PARENTALES INTELLIGENTES ET CONFIRMABLES (Étape 6) */}
          {suggestions.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3" data-testid="editor-suggestions-panel">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                    Suggestions parentales confirmables ({suggestions.length})
                  </span>
                </div>
                <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Hypothèse non intrusive
                </span>
              </div>
              <p className="text-3xs text-blue-800 dark:text-blue-300 italic">
                « Une suggestion acceptée ne devient pas un génotype confirmé. »
              </p>
              <div className="space-y-2">
                {suggestions.map((sug) => (
                  <div key={sug.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 space-y-2 text-xs" data-testid={`suggestion-card-${sug.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{sug.defaultLabel}</span>
                        <span className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                          Source : {sug.sourceDescription} • {sug.rationale}
                        </span>
                      </div>
                      <span className="text-3xs px-2 py-0.5 rounded font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                        {String(sug.suggestedValue)}
                      </span>
                    </div>

                    {/* 5 ACTIONS OBLIGATOIRES (Étape 6) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleAcceptSuggestion(sug)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-3xs transition-colors"
                        data-testid={`sug-accept-${sug.id}`}
                      >
                        Accepter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModifySuggestion(sug)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-3xs transition-colors"
                        data-testid={`sug-modify-${sug.id}`}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectSuggestion(sug.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 font-semibold text-3xs transition-colors"
                        data-testid={`sug-reject-${sug.id}`}
                      >
                        Refuser
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeepUnknownSuggestion(sug.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-3xs transition-colors"
                        data-testid={`sug-keep-unknown-${sug.id}`}
                      >
                        Conserver Inconnu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeepNotTestedSuggestion(sug.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 font-medium text-3xs transition-colors"
                        data-testid={`sug-keep-not-tested-${sug.id}`}
                      >
                        Conserver Non testé
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARCOURS GUIDÉ EN 3 QUESTIONS (Étape 5) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2" data-testid="guided-questions-card">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowGuidedQuestions(!showGuidedQuestions)}>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Guide de qualification en 3 questions
                </span>
              </div>
              <button
                type="button"
                className="text-3xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                {showGuidedQuestions ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {showGuidedQuestions && (
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-3xs text-slate-600 dark:text-slate-400">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">1. Que voyez-vous ?</span>
                  <span>Si vous constatez la couleur à l'œil nu sans connaître les allèles récessifs portés, sélectionnez <strong>Observation visuelle</strong>.</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">2. D'où vient cette information ?</span>
                  <span>Si l'information provient d'un vendeur ou d'une déclaration libre sans test officiel, choisissez <strong>Déclaration éleveur</strong>. Si vous disposez d'un rapport de laboratoire, choisissez <strong>Analyse ADN</strong>.</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">3. Y a-t-il un doute ?</span>
                  <span>S'il existe plusieurs génotypes plausibles, conservez <strong>Hypothèses multiples (POSSIBLE_SET)</strong>. Si aucune observation n'a été réalisée, choisissez <strong>Inconnu</strong> ou <strong>Non testé</strong>.</span>
                </div>
              </div>
            )}
          </div>

          {/* ÉTAPE 2 : NATURE DE L'INFORMATION (QUALIFICATION ÉPISTÉMIQUE) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {translateEpistemic(language, 'editor.what_i_know')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="editor-mode-selector">
              {[
                { key: 'OBSERVED' as QualificationMode, label: translateEpistemic(language, 'editor.mode_observed'), icon: Eye },
                { key: 'DECLARED' as QualificationMode, label: translateEpistemic(language, 'editor.mode_declared'), icon: Award },
                { key: 'DNA_TEST' as QualificationMode, label: translateEpistemic(language, 'editor.mode_dna'), icon: CheckCircle2 },
                { key: 'POSSIBLE_SET' as QualificationMode, label: translateEpistemic(language, 'editor.mode_possible_set'), icon: Layers },
                { key: 'UNKNOWN' as QualificationMode, label: translateEpistemic(language, 'editor.mode_unknown'), icon: HelpCircle },
                { key: 'NOT_TESTED' as QualificationMode, label: translateEpistemic(language, 'editor.mode_not_tested'), icon: FileQuestion },
              ].map(({ key, label, icon: Icon }) => {
                const isSelected = mode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleModeChange(key)}
                    className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                    data-testid={`mode-option-${key}`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="text-left">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ÉTAPE 3 : SPÉCIFICATION SELON LE MODE */}
          
          {/* Mode OBSERVED : Choix du phénotype visuel */}
          {mode === 'OBSERVED' && currentLocusDef && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3" data-testid="observed-panel">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {translateEpistemic(language, 'editor.observation_label')}
              </label>
              <div className="space-y-2">
                {currentLocusDef.observations.map((obs) => {
                  const isSelected = obs.id === selectedObservationId;
                  return (
                    <label
                      key={obs.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                      }`}
                      data-testid={`obs-option-${obs.id}`}
                    >
                      <input
                        type="radio"
                        name="observation"
                        value={obs.id}
                        checked={isSelected}
                        onChange={() => setSelectedObservationId(obs.id)}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="space-y-1">
                        <div className="text-xs font-bold">{obs.label}</div>
                        {obs.rationale && (
                          <div className="text-3xs text-slate-500 dark:text-slate-400">{obs.rationale}</div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode DNA_TEST ou DECLARED : Choix des allèles */}
          {(mode === 'DNA_TEST' || mode === 'DECLARED') && currentLocusDef && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3" data-testid="alleles-panel">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {translateEpistemic(language, 'editor.alleles_label')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs text-slate-400 mb-1">Allèle 1</label>
                  <select
                    value={allele1}
                    onChange={(e) => setAllele1(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    data-testid="allele-select-1"
                  >
                    {currentLocusDef.alleles.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-3xs text-slate-400 mb-1">Allèle 2</label>
                  {currentLocusDef.transmission === 'Z_LINKED' && isFemale ? (
                    <div className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500">
                      W (Hémizygote femelle)
                    </div>
                  ) : (
                    <select
                      value={allele2}
                      onChange={(e) => setAllele2(e.target.value)}
                      className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      data-testid="allele-select-2"
                    >
                      {currentLocusDef.alleles.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode POSSIBLE_SET : Sélection d'hypothèses multiples */}
          {mode === 'POSSIBLE_SET' && currentLocusDef && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3" data-testid="possible-set-panel">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {translateEpistemic(language, 'editor.hypotheses_selection')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {currentLocusDef.allHypotheses(isFemale).map((pair) => {
                  const pairStr = `${pair[0]}/${pair[1]}`;
                  const isChecked = selectedHypotheses.includes(pairStr);
                  return (
                    <label
                      key={pairStr}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                      data-testid={`hypothesis-check-${pairStr}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleHypothesis(pairStr)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-mono text-xs">{pairStr}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode UNKNOWN : Message clair et non stigmatisant */}
          {mode === 'UNKNOWN' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-3" data-testid="unknown-panel">
              <HelpCircle className="w-5 h-5 shrink-0 text-slate-400" />
              <div>
                <span className="font-bold block">Information non renseignée / inconnue</span>
                <span className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Aucun génotype n'est présumé par défaut. L'application conserve ce statut sans extrapoler de données non vérifiées.
                </span>
              </div>
            </div>
          )}

          {/* Mode NOT_TESTED : Message clair */}
          {mode === 'NOT_TESTED' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3" data-testid="not-tested-panel">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{translateEpistemic(language, 'editor.not_tested_warning')}</span>
            </div>
          )}

          {/* ÉTAPE 4 : QUALIFICATION DE LA SOURCE & CONFIANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {translateEpistemic(language, 'editor.source_label')}
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as EpistemicSourceType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="editor-source-select"
              >
                <option value="PHENOTYPIC_OBSERVATION">{translateEpistemic(language, 'source.PHENOTYPIC_OBSERVATION')}</option>
                <option value="USER_DECLARATION">{translateEpistemic(language, 'source.USER_DECLARATION')}</option>
                <option value="DNA_TEST">{translateEpistemic(language, 'source.DNA_TEST')}</option>
                <option value="PARENTAL_PEDIGREE">{translateEpistemic(language, 'source.PARENTAL_PEDIGREE')}</option>
                <option value="PROGENY_TEST_CROSS">{translateEpistemic(language, 'source.PROGENY_TEST_CROSS')}</option>
                <option value="SYSTEM_INFERENCE">{translateEpistemic(language, 'source.SYSTEM_INFERENCE')}</option>
                <option value="LEGACY_MIGRATION">{translateEpistemic(language, 'source.LEGACY_MIGRATION')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {translateEpistemic(language, 'editor.confidence_label')}
              </label>
              <select
                value={selectedConfidence}
                onChange={(e) => setSelectedConfidence(e.target.value as EpistemicConfidenceType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="editor-confidence-select"
              >
                <option value="VERY_HIGH">{translateEpistemic(language, 'confidence.VERY_HIGH')}</option>
                <option value="HIGH">{translateEpistemic(language, 'confidence.HIGH')}</option>
                <option value="MEDIUM">{translateEpistemic(language, 'confidence.MEDIUM')}</option>
                <option value="LOW">{translateEpistemic(language, 'confidence.LOW')}</option>
                <option value="VERY_LOW">{translateEpistemic(language, 'confidence.VERY_LOW')}</option>
                <option value="UNKNOWN">{translateEpistemic(language, 'confidence.UNKNOWN')}</option>
              </select>
              <p className="text-3xs text-slate-400">
                {translateEpistemic(language, 'editor.confidence_hint')}
              </p>
            </div>
          </div>

          {/* REVUE HUMAINE & CONFLIT */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Statut de revue
              </span>
              <select
                value={humanReviewStatus}
                onChange={(e) => setHumanReviewStatus(e.target.value as HumanReviewStatusType)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                data-testid="editor-review-select"
              >
                <option value="NOT_REVIEWED">Non vérifié</option>
                <option value="REQUIRED">À vérifier par l'éleveur</option>
                <option value="REVIEWED">Validé par l'éleveur</option>
                <option value="CONFLICT_REVIEW">Conflit à résoudre</option>
              </select>
            </div>
            {currentLocusDef?.isProvisional && (
              <p className="text-3xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{translateEpistemic(language, 'locus.provisional_warning')}</span>
              </p>
            )}
          </div>

          {/* NOTE / PROVENANCE LIBRE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Note explicative / Laboratoire
            </label>
            <input
              type="text"
              value={provenanceNote}
              onChange={(e) => setProvenanceNote(e.target.value)}
              placeholder="Ex : Réf labo, observation visuelle lors de la mue..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              data-testid="editor-notes-input"
            />
          </div>

          {/* ÉTAPE 5 : RÉSUMÉ AVANT ENREGISTREMENT */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3" data-testid="editor-summary-preview">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {translateEpistemic(language, 'editor.summary_title')}
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              <CanonicalLocusBadge
                locusId={previewRecord.locusId || 'LOCUS'}
                displayName={previewRecord.displayName}
                transmission={previewRecord.transmission}
                status={previewRecord.status}
                isProvisional={previewRecord.isProvisional ?? false}
                carrierState={previewRecord.carrierState}
                humanReviewRequired={previewRecord.humanReviewRequired}
                humanReviewStatus={previewRecord.humanReview}
                size="sm"
                language={language}
              />
              {previewRecord.status && (
                <EpistemicStatusBadge
                  status={previewRecord.status}
                  size="sm"
                  language={language}
                  data-testid="summary-preview-status-badge"
                />
              )}
              {previewRecord.source && (
                <EpistemicSourceBadge
                  source={previewRecord.source}
                  size="sm"
                  language={language}
                  data-testid="summary-preview-source-badge"
                />
              )}
              {previewRecord.confidence && (
                <EpistemicConfidenceBadge
                  confidence={previewRecord.confidence}
                  size="sm"
                  language={language}
                  data-testid="summary-preview-confidence-badge"
                />
              )}
              {previewRecord.humanReviewRequired && (
                <HumanReviewBadge
                  required={true}
                  status={previewRecord.humanReview}
                  size="sm"
                  language={language}
                  data-testid="summary-preview-review-badge"
                />
              )}
              {previewRecord.phase && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-3xs font-bold font-mono" data-testid="summary-preview-phase-badge">
                  Phase : {previewRecord.phase}
                </span>
              )}
              {previewRecord.isBlocked && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-3xs font-bold font-mono" data-testid="summary-preview-blocked-badge">
                  BLOQUÉ
                </span>
              )}
            </div>

            {/* Détails du génotype ou des hypothèses */}
            <div className="text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
              {previewRecord.alleles && (
                <div>
                  <span className="font-sans font-semibold text-slate-500">Génotype : </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                    {previewRecord.alleles[0]} / {previewRecord.alleles[1]}
                  </span>
                </div>
              )}
              {previewRecord.possibleSet && previewRecord.possibleSet.length > 0 && (
                <div>
                  <span className="font-sans font-semibold text-slate-500">Hypothèses ({previewRecord.possibleSet.length}) : </span>
                  <span>{previewRecord.possibleSet.map(h => `${h[0]}/${h[1]}`).join(', ')}</span>
                </div>
              )}
              {previewRecord.determination === 'UNKNOWN' && (
                <div className="font-sans text-slate-500 italic">Information non renseignée / inconnue.</div>
              )}
              {previewRecord.determination === 'NOT_TESTED' && (
                <div className="font-sans text-amber-600 dark:text-amber-400">Non testé (ne signifie pas absence de mutation).</div>
              )}
            </div>
          </div>

        </div>

        {/* PIED DE MODALE : ACTIONS */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            data-testid="editor-cancel-btn"
          >
            {translateEpistemic(language, 'editor.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            data-testid="editor-save-btn"
          >
            <Save className="w-4 h-4" />
            <span>{translateEpistemic(language, 'editor.save')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default CanonicalGeneticsEditor;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — REGISTRE CANONIQUE DES PREUVES BIBLIOGRAPHIQUES
 * Mission V1.6.6.20 — Registre Bibliographique Canonique (Lecture Seule)
 * 
 * Résolution canonique :
 * evidenceId → EvidenceRecord → EvidenceCitation → BibliographicSource
 * 
 * Invariants de sécurité épistémique :
 * 1. Déterministe, local, typé, lecture seule.
 * 2. Zéro appel réseau, zéro génération IA, zéro fallback automatique.
 * 3. SOURCE_LEVEL !== EPISTEMIC_STATUS.
 * 4. P2 seul ne confère JAMAIS le statut VERIFIED.
 * 5. Une source NOT_VERIFIED ne certifie aucune règle.
 * 6. Les sources contradictoires et hypothèses concurrentes sont intégralement conservées (ex: Satiné).
 * 7. OUTDATED reste accessible pour traçabilité historique.
 * 8. UNKNOWN reste UNKNOWN.
 * 9. Isolation stricte par speciesId : aucun fallback Canari vers une autre espèce.
 * 10. Le registre ne contient aucun calcul génétique ni recommandation de croisement.
 */

import { BibliographicSource, EvidenceCitation, EvidenceRecord } from './types';
import { BIBLIOGRAPHIC_SOURCES } from './sources';

export const EVIDENCE_REGISTRY: Readonly<Record<string, EvidenceRecord>> = Object.freeze({
  // =========================================================================
  // CANARI (Serinus canaria domestica)
  // =========================================================================
  'EVD-CAN-09-001': Object.freeze({
    evidenceId: 'EVD-CAN-09-001',
    speciesId: 'canari',
    ruleId: 'CAN_LOC_CLASSICAL_MELANINS',
    claim: 'Loci mélaniques classiques (Brun, Agate) liés au chromosome Z avec crossing-over estimé à ~2%.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-09-001-POMAREDE',
        sourceId: 'SRC-POMAREDE-1977',
        preciseLocation: Object.freeze({ page: '58-74', chapter: 'IV' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Description du linkage Z et de la recombinaison méiotique Brun/Agate.'
      }),
      Object.freeze({
        citationId: 'CIT-CAN-09-001-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '84-86' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Hérédité récessive liée au sexe Z des mélanines classiques aviaires.'
      }),
      Object.freeze({
        citationId: 'CIT-CAN-09-001-COM',
        sourceId: 'SRC-COM-2023',
        preciseLocation: Object.freeze({ section: 'Canaris classiques mélaniques' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Standard mondial des 4 séries classiques (Noir, Brun, Agate, Isabelle).'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false,
    limitations: 'Taux de recombinaison estimé empiriquement par élevage (non encore borné par séquençage physique du chromosome Z).'
  }),

  'EVD-CAN-09-ISA-01': Object.freeze({
    evidenceId: 'EVD-CAN-09-ISA-01',
    speciesId: 'canari',
    ruleId: 'CAN_LOC_ISABELLE',
    claim: 'Isabelle correspond au recombinant [br, ag] issu d\'un crossing-over entre Brun et Agate.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-ISA-COM',
        sourceId: 'SRC-COM-2023',
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Classification du phénotype Isabelle comme combinaison de Brun et d\'Agate.'
      }),
      Object.freeze({
        citationId: 'CIT-CAN-ISA-POMAREDE',
        sourceId: 'SRC-POMAREDE-1977',
        preciseLocation: Object.freeze({ page: '68-72' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Démonstration génétique de l\'obtention par recombinaison méiotique mâle.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-CAN-09-SAT-01': Object.freeze({
    evidenceId: 'EVD-CAN-09-SAT-01',
    speciesId: 'canari',
    ruleId: 'CAN_LOC_SATINE',
    claim: 'Déterminisme génétique du Satiné : controverse entre Modèle A (3 loci indépendants liés Z) et Modèle B (série allélique Ino).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-SAT-POMAREDE',
        sourceId: 'SRC-POMAREDE-1989',
        preciseLocation: Object.freeze({ page: '88-92' }),
        concordance: 'CONFLICTING',
        epistemicRole: 'HISTORICAL',
        rationale: 'Modèle A : locus Satiné distinct sur le chromosome Z avec crossing-over rare (~3%).'
      }),
      Object.freeze({
        citationId: 'CIT-CAN-SAT-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '87-89' }),
        concordance: 'CONFLICTING',
        epistemicRole: 'CHALLENGED',
        rationale: 'Modèle B : série allélique Ino liée au sexe (ino+ > ino_ag > ino_sat) sans crossing-over avec Agate.'
      })
    ]),
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    humanReviewRequired: true,
    limitations: 'Absence de séquençage génomique moléculaire discriminant en peer-reviewed entre Modèle A et Modèle B.'
  }),

  'EVD-CAN-09-IV-01': Object.freeze({
    evidenceId: 'EVD-CAN-09-IV-01',
    speciesId: 'canari',
    ruleId: 'CAN_LOC_IVOIRE',
    claim: 'Ivoire : mutation récessive liée au chromosome Z modifiant la tonalité du lipochrome.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-IV-POMAREDE',
        sourceId: 'SRC-POMAREDE-1989',
        preciseLocation: Object.freeze({ page: '94-96' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Hérédité récessive liée au sexe démontrée pour la dilution du jaune.'
      })
    ]),
    epistemicStatus: 'PROVISIONAL',
    humanReviewRequired: true,
    limitations: 'Absence d\'étude publiée confirmant la cartographie physique de la distance génétique avec les loci mélaniques Z.'
  }),

  'EVD-CAN-08-004': Object.freeze({
    evidenceId: 'EVD-CAN-08-004',
    speciesId: 'canari',
    ruleId: 'CAN_RULE_LETHAL_INTENSIVE',
    claim: 'Facteur Intensif létal à l\'état homozygote in ovo (I/I).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-08-004-POMAREDE',
        sourceId: 'SRC-POMAREDE-1977',
        preciseLocation: Object.freeze({ page: '62-65' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Confirmation moderne du déterminisme létal homozygote du facteur Intensif (I/I).'
      }),
      Object.freeze({
        citationId: 'CIT-CAN-08-004-DUNCKER',
        sourceId: 'SRC-DUNCKER-1928',
        concordance: 'OUTDATED',
        epistemicRole: 'HISTORICAL',
        rationale: 'Première documentation empirique de la réduction de 25% des éclosions en croisement intensif x intensif.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false,
    limitations: 'Données historiques complétées par la pratique zootechnique moderne.'
  }),

  'EVD-CAN-08-007': Object.freeze({
    evidenceId: 'EVD-CAN-08-007',
    speciesId: 'canari',
    ruleId: 'CAN_RULE_LETHAL_CRESTED',
    claim: 'Facteur Huppé létal à l\'état homozygote (anomalies crâniennes létales).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-08-007-HUTT',
        sourceId: 'SRC-HUTT-1949',
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Preuve génétique de la létalité homozygote de la crête / huppe chez les oiseaux.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-CAN-08-001': Object.freeze({
    evidenceId: 'EVD-CAN-08-001',
    speciesId: 'canari',
    ruleId: 'CAN_FACT_REFRACTION',
    claim: 'Facteur Optique de Réfraction : diffusion structurelle de la lumière (diffusion cohérente de type Rayleigh).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-08-001-PRUM',
        sourceId: 'SRC-PRUM-1998',
        preciseLocation: Object.freeze({ page: '28-29' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Démonstration biophysique de l\'origine structurelle de l\'effet bleu/réfraction dans les plumes.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-CAN-07-003': Object.freeze({
    evidenceId: 'EVD-CAN-07-003',
    speciesId: 'canari',
    ruleId: 'CAN_GEN_CAROTENOID_RED',
    claim: 'Facteur Rouge dépendant du gène de la cétocaroténoïdase CYP2J19.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAN-07-003-LOPES',
        sourceId: 'SRC-LOPES-2016',
        preciseLocation: Object.freeze({ page: '1427-1434' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Clonage et identification moléculaire du cytochrome P450 CYP2J19 chez le Chardonneret rouge et le Canari rouge.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  // =========================================================================
  // DIAMANT DE GOULD (Chloebia gouldiae)
  // =========================================================================
  'EVD-GOU-01-001': Object.freeze({
    evidenceId: 'EVD-GOU-01-001',
    speciesId: 'diamant_gould',
    ruleId: 'GOU_LOC_HEAD_COLOR_Z',
    claim: 'Couleur de tête liée au chromosome Z : allèle Rouge (ZR) dominant sur allèle Noir (Zr).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-GOU-01-001-PRYKE',
        sourceId: 'SRC-PRYKE-2009',
        preciseLocation: Object.freeze({ page: '1605-1607', figure: 'Figure 2' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Confirmation expérimentale et analyse de descendance du locus de tête lié au chromosome Z.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-GOU-01-002': Object.freeze({
    evidenceId: 'EVD-GOU-01-002',
    speciesId: 'diamant_gould',
    ruleId: 'GOU_LOC_BREAST',
    claim: 'Couleur de poitrine : modèle avicole à 3 allèles (Pourpre dominant sur Lilas dominant sur Blanc).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-GOU-01-002-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '88-89' }),
        concordance: 'INSUFFICIENT',
        epistemicRole: 'PRIMARY',
        rationale: 'Hypothèse basée sur les observations d\'élevage sans caractérisation moléculaire du locus.'
      })
    ]),
    epistemicStatus: 'PROVISIONAL',
    humanReviewRequired: true,
    limitations: 'Absence d\'étude génomique peer-reviewed validant l\'architecture multi-allélique exacte de la poitrine du Gould.'
  }),

  // =========================================================================
  // DIAMANT MANDARIN (Taeniopygia guttata)
  // =========================================================================
  'EVD-MAN-01-001': Object.freeze({
    evidenceId: 'EVD-MAN-01-001',
    speciesId: 'diamant_mandarin',
    ruleId: 'MAN_LOC_MUTATIONS',
    claim: 'Transmission génétique formalisée : Brun lié au chromosome Z récessif, Joues Noires autosomique récessif.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-MAN-01-001-ZANN',
        sourceId: 'SRC-ZANN-1996',
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Synthèse scientifique des modes d\'hérédité des mutations du Diamant mandarin.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-MAN-01-002': Object.freeze({
    evidenceId: 'EVD-MAN-01-002',
    speciesId: 'diamant_mandarin',
    ruleId: 'MAN_LOC_BROWN',
    claim: 'Mutation Brun (Fawn) : transmission récessive liée au chromosome Z avec réduction de l\'eumélanine noire.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-MAN-01-002-ZANN',
        sourceId: 'SRC-ZANN-1996',
        preciseLocation: Object.freeze({ page: '310-312', chapter: '13' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Preuve généalogique du linkage au chromosome Z de la mutation Fawn chez Taeniopygia guttata.'
      }),
      Object.freeze({
        citationId: 'CIT-MAN-01-002-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '92-94' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Confirmation avicole de la récessivité liée au sexe du Brun mandarin.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-MAN-01-003': Object.freeze({
    evidenceId: 'EVD-MAN-01-003',
    speciesId: 'diamant_mandarin',
    ruleId: 'MAN_LOC_BLACK_CHEEK',
    claim: 'Mutation Joues Noires (Black Cheek) : transmission autosomique récessive affectant la distribution faciale de l\'eumélanine chez les deux sexes.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-MAN-01-003-ZANN',
        sourceId: 'SRC-ZANN-1996',
        preciseLocation: Object.freeze({ page: '312-315', chapter: '13' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Rapports de croisements mendéliens conformes au ratio monogénique autosomique récessif 3:1.'
      }),
      Object.freeze({
        citationId: 'CIT-MAN-01-003-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '96' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Maintien de l\'expression autosomique indépendante du sexe.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  // =========================================================================
  // CALOPSITTE ÉLÉGANTE (Nymphicus hollandicus)
  // =========================================================================
  'EVD-CAL-01-001': Object.freeze({
    evidenceId: 'EVD-CAL-01-001',
    speciesId: 'calopsitte',
    ruleId: 'CAL_LOC_SEX_LINKED',
    claim: 'Mutations récessives liées au chromosome Z chez la calopsitte : Lutino (Ino), Cinnamon, Perlé (Opaline).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAL-01-001-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ chapter: 'Cockatiels', pages: '84-87' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Documentation vétérinaire et génétique de la liaison Z chez Nymphicus hollandicus.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-CAL-01-002': Object.freeze({
    evidenceId: 'EVD-CAL-01-002',
    speciesId: 'calopsitte',
    ruleId: 'CAL_LOC_YELLOW_CHEEK',
    claim: 'Mutation Joues Jaunes (Yellow Cheek) : existence d\'une forme autosomique dominante et d\'une forme récessive liée au sexe.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAL-01-002-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        concordance: 'CONFLICTING',
        epistemicRole: 'CHALLENGED',
        rationale: 'Transmission contestée en élevage nécessitant une revue humaine.'
      })
    ]),
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    humanReviewRequired: true,
    limitations: 'Confusion d\'appellation entre deux mutations distinctes produisant un phénotype convergent.'
  }),

  'EVD-CAL-01-LUT': Object.freeze({
    evidenceId: 'EVD-CAL-01-LUT',
    speciesId: 'calopsitte',
    ruleId: 'CAL_LOC_LUTINO',
    claim: 'Mutation Lutino (Ino) : transmission récessive liée au chromosome Z provoquant l\'absence totale d\'eumélanine avec conservation des psittacines lipochromes.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAL-LUT-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '84' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Locus Ino lié au sexe Z chez Nymphicus hollandicus.'
      }),
      Object.freeze({
        citationId: 'CIT-CAL-LUT-TAYLOR',
        sourceId: 'SRC-TAYLOR-WARNER-1986',
        preciseLocation: Object.freeze({ page: '32-36' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Données statistiques de croisements avicoles confirmant le mode lié au sexe.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-CAL-01-CIN': Object.freeze({
    evidenceId: 'EVD-CAL-01-CIN',
    speciesId: 'calopsitte',
    ruleId: 'CAL_LOC_CINNAMON',
    claim: 'Mutation Cinnamon : transmission récessive liée au chromosome Z affectant l\'oxydation mélanique vers un brun chaud.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAL-CIN-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '85' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Caractérisation du locus Cinnamon lié au chromosome Z.'
      }),
      Object.freeze({
        citationId: 'CIT-CAL-CIN-TAYLOR',
        sourceId: 'SRC-TAYLOR-WARNER-1986',
        preciseLocation: Object.freeze({ page: '38-42' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Étude de liaison et crossing-over avec Lutino et Perlé.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-CAL-01-PRL': Object.freeze({
    evidenceId: 'EVD-CAL-01-PRL',
    speciesId: 'calopsitte',
    ruleId: 'CAL_LOC_PEARL',
    claim: 'Mutation Perlé (Opaline / Pearl) : transmission récessive liée au chromosome Z avec motif festonné dépendant de l\'état hormonal chez le mâle adulte.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAL-PRL-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '86' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Locus lié au sexe Z avec régression phénotypique post-mue chez le mâle adulte.'
      }),
      Object.freeze({
        citationId: 'CIT-CAL-PRL-TAYLOR',
        sourceId: 'SRC-TAYLOR-WARNER-1986',
        preciseLocation: Object.freeze({ page: '44-48' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Hérédité Z et dimorphisme secondaire de plumage.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  // =========================================================================
  // INSEPARABLE ROSEICOLLIS (Agapornis roseicollis)
  // =========================================================================
  'EVD-AGA-01-001': Object.freeze({
    evidenceId: 'EVD-AGA-01-001',
    speciesId: 'agapornis_roseicollis',
    ruleId: 'AGA_LOC_SEX_LINKED',
    claim: 'Mutations récessives liées au chromosome Z chez Roseicollis : Lutino, Cinnamon, Opaline.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-AGA-01-001-VAN-DEN-ABEELE',
        sourceId: 'SRC-VAN-DEN-ABEELE-2007',
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Hérédité liée au chromosome Z établie chez Agapornis roseicollis.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-AGA-01-002': Object.freeze({
    evidenceId: 'EVD-AGA-01-002',
    speciesId: 'agapornis_roseicollis',
    ruleId: 'AGA_LOC_PARBLUE',
    claim: 'Série Blue / Parblue (Aqua, Turquoise) : allélisme incomplet et réduction psittacine.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-AGA-01-002-VAN-DEN-ABEELE',
        sourceId: 'SRC-VAN-DEN-ABEELE-2007',
        concordance: 'INSUFFICIENT',
        epistemicRole: 'PRIMARY',
        rationale: 'Documentation avicole des allèles de réduction caroténoïde/psittacine.'
      })
    ]),
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    humanReviewRequired: true,
    limitations: 'Données avicoles solides mais absence de séquençage génomique discriminant des transporteurs de psittacine.'
  }),

  'EVD-AGA-01-LUT': Object.freeze({
    evidenceId: 'EVD-AGA-01-LUT',
    speciesId: 'agapornis_roseicollis',
    ruleId: 'AGA_LOC_LUTINO',
    claim: 'Mutation Lutino (Ino) : transmission récessive liée au chromosome Z supprimant l\'eumélanine chez Agapornis roseicollis.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-AGA-LUT-VAN-DEN-ABEELE',
        sourceId: 'SRC-VAN-DEN-ABEELE-2007',
        preciseLocation: Object.freeze({ page: '112-118' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Génétique formelle de l\'Ino lié au sexe Z chez Agapornis roseicollis.'
      }),
      Object.freeze({
        citationId: 'CIT-AGA-LUT-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '104' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'CORROBORATIVE',
        rationale: 'Confirmation du mode Z chez les psittacidés africains.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-AGA-01-CIN': Object.freeze({
    evidenceId: 'EVD-AGA-01-CIN',
    speciesId: 'agapornis_roseicollis',
    ruleId: 'AGA_LOC_CINNAMON',
    claim: 'Mutation Cinnamon : transmission récessive liée au chromosome Z avec oxydation incomplète de l\'eumélanine.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-AGA-CIN-VAN-DEN-ABEELE',
        sourceId: 'SRC-VAN-DEN-ABEELE-2007',
        preciseLocation: Object.freeze({ page: '124-128' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Locus Cinnamon lié au sexe Z et taux de crossing-over mesurés avec Ino.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-AGA-01-OPL': Object.freeze({
    evidenceId: 'EVD-AGA-01-OPL',
    speciesId: 'agapornis_roseicollis',
    ruleId: 'AGA_LOC_OPALINE',
    claim: 'Mutation Opaline : transmission récessive liée au chromosome Z modifiant la distribution du masque facial psittacine.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-AGA-OPL-VAN-DEN-ABEELE',
        sourceId: 'SRC-VAN-DEN-ABEELE-2007',
        preciseLocation: Object.freeze({ page: '136-142' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Monographie détaillée du locus Opaline Z chez Roseicollis.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-AGA-01-BLU': Object.freeze({
    evidenceId: 'EVD-AGA-01-BLU',
    speciesId: 'agapornis_roseicollis',
    ruleId: 'AGA_LOC_BLUE',
    claim: 'Appellation "Bleu" chez Roseicollis : absence de véritable bleu génomique ; réduction psittacine partielle correspondant aux allèles Aqua et Turquoise (Parblue).',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-AGA-BLU-VAN-DEN-ABEELE',
        sourceId: 'SRC-VAN-DEN-ABEELE-2007',
        preciseLocation: Object.freeze({ page: '148-154' }),
        concordance: 'CONFLICTING',
        epistemicRole: 'CHALLENGED',
        rationale: 'Divergence terminologique : les éleveurs utilisent le mot bleu alors que la structure génétique est un allèle Parblue sans neutralisation totale de psittacine.'
      })
    ]),
    epistemicStatus: 'NEEDS_HUMAN_REVIEW',
    humanReviewRequired: true,
    limitations: 'Zone à risque documentaire : ne pas homologuer comme mutation bleue autosomique classique de type Agapornis personatus.'
  }),

  // =========================================================================
  // PERRUCHE ONDULÉE (Melopsittacus undulatus)
  // =========================================================================
  'EVD-BUD-01-001': Object.freeze({
    evidenceId: 'EVD-BUD-01-001',
    speciesId: 'perruche_ondulee',
    ruleId: 'BUD_LOC_PASTEL',
    claim: 'Facteur Pastel / Dilution : transmission autosomique récessive réduisant la densité mélanique sans altérer la psittacine jaune.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-BUD-01-001-MARTIN',
        sourceId: 'SRC-MARTIN-2002',
        preciseLocation: Object.freeze({ page: '78-80' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Documentation avicole de la transmission autosomique récessive du facteur pastel chez Melopsittacus undulatus.'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-BUD-01-002': Object.freeze({
    evidenceId: 'EVD-BUD-01-002',
    speciesId: 'perruche_ondulee',
    ruleId: 'BUD_LOC_BLUE',
    claim: 'Mutation Bleue : transmission autosomique récessive causée par une substitution d\'acide aminé dans le domaine catalytique du gène MuPKS abolissant la synthèse de psittacine jaune.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-BUD-01-002-COOKE',
        sourceId: 'SRC-COOKE-2017',
        preciseLocation: Object.freeze({ page: '427-439', figure: 'Figures 1-4' }),
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Preuve génomique peer-reviewed par séquençage et cartographie fine du locus bleu (MuPKS R644W).'
      })
    ]),
    epistemicStatus: 'VERIFIED',
    humanReviewRequired: false
  }),

  'EVD-BUD-01-003': Object.freeze({
    evidenceId: 'EVD-BUD-01-003',
    speciesId: 'perruche_ondulee',
    ruleId: 'BUD_LOC_HYPOTHETICAL',
    claim: 'Variante mélanique complexe sous étude : hypothèses empiriques d\'élevage sans validation moléculaire ni descendance contrôlée.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-BUD-01-003-FORUM',
        sourceId: 'SRC-BREEDER-FORUM-2015',
        concordance: 'NOT_VERIFIED',
        epistemicRole: 'CHALLENGED',
        rationale: 'Témoignage d\'élevage non documenté scientifiquement.'
      })
    ]),
    epistemicStatus: 'UNKNOWN',
    humanReviewRequired: true,
    limitations: 'Données empiriques insuffisantes ; aucune certification scientifique possible.'
  }),

  // =========================================================================
  // CHARDONNERET ÉLÉGANT (Carduelis carduelis)
  // =========================================================================
  'EVD-CAR-01-001': Object.freeze({
    evidenceId: 'EVD-CAR-01-001',
    speciesId: 'chardonneret_elegant',
    ruleId: 'CAR_REGULATORY_PROTECTION',
    claim: 'Statut biologique réglementaire de l\'espèce indigène : protection stricte (Annexe II Convention de Berne) ; absence de catalogue génétique formel certifié dans le référentiel de base.',
    citations: Object.freeze([
      Object.freeze({
        citationId: 'CIT-CAR-01-001-BERNE',
        sourceId: 'SRC-BERNE-1979',
        concordance: 'CONCORDANT',
        epistemicRole: 'PRIMARY',
        rationale: 'Inscription à l\'Annexe II (faune strictement protégée).'
      })
    ]),
    epistemicStatus: 'UNKNOWN',
    humanReviewRequired: true,
    limitations: 'Aucune mutation domestique certifiée dans le profil génétique canonique de base du Chardonneret.'
  })
});

// ===========================================================================
// FONCTIONS DE CONSULTATION DU REGISTRE CANONIQUE (LECTURE SEULE STRICTE)
// ===========================================================================

/**
 * Résout une source bibliographique à partir de son identifiant unique.
 * @param sourceId Identifiant de la source (ex: 'SRC-PRYKE-2009')
 * @returns La source bibliographique immuable ou undefined si introuvable.
 */
export function getBibliographicSource(sourceId: string): BibliographicSource | undefined {
  if (!sourceId || typeof sourceId !== 'string') return undefined;
  return BIBLIOGRAPHIC_SOURCES[sourceId];
}

/**
 * Résout un enregistrement de preuve à partir de son identifiant unique.
 * @param evidenceId Identifiant de la preuve (ex: 'EVD-CAN-09-001')
 * @returns L'enregistrement de preuve immuable ou undefined si introuvable.
 */
export function getEvidenceRecord(evidenceId: string): EvidenceRecord | undefined {
  if (!evidenceId || typeof evidenceId !== 'string') return undefined;
  return EVIDENCE_REGISTRY[evidenceId];
}

/**
 * Retourne la liste des citations associées à un enregistrement de preuve.
 * @param evidenceId Identifiant de la preuve
 * @returns Tableau des citations (vide si la preuve n'existe pas).
 */
export function getEvidenceCitations(evidenceId: string): readonly EvidenceCitation[] {
  const record = getEvidenceRecord(evidenceId);
  return record ? record.citations : [];
}

/**
 * Résout toutes les sources bibliographiques complètes rattachées à un evidenceId.
 * @param evidenceId Identifiant de la preuve
 * @returns Tableau des sources bibliographiques résolues.
 */
export function getSourcesForEvidence(evidenceId: string): BibliographicSource[] {
  const record = getEvidenceRecord(evidenceId);
  if (!record) return [];

  const sources: BibliographicSource[] = [];
  for (const citation of record.citations) {
    const source = getBibliographicSource(citation.sourceId);
    if (source && !sources.some(s => s.sourceId === source.sourceId)) {
      sources.push(source);
    }
  }
  return sources;
}

/**
 * Résout tous les enregistrements de preuves soutenus par une source bibliographique donnée (1 -> N).
 * @param sourceId Identifiant de la source
 * @returns Tableau des enregistrements de preuves exploitant cette source.
 */
export function getEvidenceForSource(sourceId: string): EvidenceRecord[] {
  if (!sourceId || typeof sourceId !== 'string') return [];
  return Object.values(EVIDENCE_REGISTRY).filter(record =>
    record.citations.some(c => c.sourceId === sourceId)
  );
}

/**
 * Vérifie l'existence d'une source bibliographique dans le registre canonique.
 */
export function hasBibliographicSource(sourceId: string): boolean {
  if (!sourceId || typeof sourceId !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(BIBLIOGRAPHIC_SOURCES, sourceId);
}

/**
 * Vérifie l'existence d'un enregistrement de preuve dans le registre canonique.
 */
export function hasEvidenceRecord(evidenceId: string): boolean {
  if (!evidenceId || typeof evidenceId !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(EVIDENCE_REGISTRY, evidenceId);
}

/**
 * Retourne l'ensemble de toutes les sources bibliographiques enregistrées.
 */
export function getAllBibliographicSources(): BibliographicSource[] {
  return Object.values(BIBLIOGRAPHIC_SOURCES);
}

/**
 * Retourne l'ensemble de tous les enregistrements de preuves canoniques.
 */
export function getAllEvidenceRecords(): EvidenceRecord[] {
  return Object.values(EVIDENCE_REGISTRY);
}

/**
 * Filtre les enregistrements de preuves pour une espèce biologique donnée.
 * Isole strictement les preuves et interdit tout fallback interspécifique.
 */
export function getEvidenceRecordsForSpecies(speciesId: string): EvidenceRecord[] {
  if (!speciesId || typeof speciesId !== 'string') return [];
  const normalized = speciesId === 'serinus_canaria' ? 'canari' : speciesId;
  return Object.values(EVIDENCE_REGISTRY).filter(record => record.speciesId === normalized);
}

/**
 * Filtre les enregistrements de preuves associés à une règle spécifique.
 * Gère le matching direct ainsi que le mappage sémantique des identifiants et alias de loci du catalogue.
 */
export function getEvidenceRecordsForRule(ruleId: string): EvidenceRecord[] {
  if (!ruleId || typeof ruleId !== 'string') return [];
  const normalized = ruleId.trim();
  const lower = normalized.toLowerCase();

  // 1. Match direct sur ruleId
  const directMatches = Object.values(EVIDENCE_REGISTRY).filter(record => record.ruleId === normalized);
  if (directMatches.length > 0) return directMatches;

  // 2. Mappage sémantique des identifiants et alias de loci du catalogue
  const aliasMap: Record<string, string[]> = {
    // Canari
    'can_loc_satine': ['EVD-CAN-09-SAT-01'],
    'satine': ['EVD-CAN-09-SAT-01'],
    'satiné': ['EVD-CAN-09-SAT-01'],
    'can_loc_isabelle': ['EVD-CAN-09-ISA-01'],
    'isabelle': ['EVD-CAN-09-ISA-01'],
    'can_loc_ivoire': ['EVD-CAN-09-IV-01'],
    'ivoire': ['EVD-CAN-09-IV-01'],
    'can_rule_lethal_intensive': ['EVD-CAN-08-004'],
    'can_rule_lethal_crested': ['EVD-CAN-08-007'],
    // Gould
    'gou_loc_head_color_z': ['EVD-GOU-01-001'],
    'head_color_z': ['EVD-GOU-01-001'],
    'gou_loc_breast': ['EVD-GOU-01-002'],
    'breast': ['EVD-GOU-01-002'],
    'poitrine': ['EVD-GOU-01-002'],
    // Mandarin
    'mand_brun': ['EVD-MAN-01-002'],
    'man_loc_brown': ['EVD-MAN-01-002'],
    'mand_joues_noires': ['EVD-MAN-01-003'],
    'man_loc_black_cheek': ['EVD-MAN-01-003'],
    // Calopsitte
    'calo_lutino': ['EVD-CAL-01-LUT'],
    'cal_loc_lutino': ['EVD-CAL-01-LUT'],
    'calo_cinnamon': ['EVD-CAL-01-CIN'],
    'cal_loc_cinnamon': ['EVD-CAL-01-CIN'],
    'calo_perle': ['EVD-CAL-01-PRL'],
    'cal_loc_pearl': ['EVD-CAL-01-PRL'],
    'nh_syc': ['EVD-CAL-01-002'],
    'nh_dyc': ['EVD-CAL-01-002'],
    'loc_calo_syc': ['EVD-CAL-01-002'],
    'loc_calo_dyc': ['EVD-CAL-01-002'],
    'cal_loc_yellow_cheek': ['EVD-CAL-01-002'],
    // Roseicollis
    'agap_lutino': ['EVD-AGA-01-LUT'],
    'aga_loc_lutino': ['EVD-AGA-01-LUT'],
    'agap_cinnamon': ['EVD-AGA-01-CIN'],
    'aga_loc_cinnamon': ['EVD-AGA-01-CIN'],
    'agap_opaline': ['EVD-AGA-01-OPL'],
    'aga_loc_opaline': ['EVD-AGA-01-OPL'],
    'agap_bleu': ['EVD-AGA-01-BLU'],
    'aga_loc_blue': ['EVD-AGA-01-BLU'],
    // Perruche
    'budgie_pa': ['EVD-BUD-01-001'],
    'loc_budgie_pa': ['EVD-BUD-01-001'],
    'bud_loc_pastel': ['EVD-BUD-01-001'],
    'budgie_blue': ['EVD-BUD-01-002'],
    'bud_loc_blue': ['EVD-BUD-01-002'],
    'bud_loc_hypothetical': ['EVD-BUD-01-003'],
  };

  const mappedIds = aliasMap[lower];
  if (mappedIds) {
    return mappedIds.map(id => EVIDENCE_REGISTRY[id]).filter((rec): rec is EvidenceRecord => Boolean(rec));
  }

  return [];
}

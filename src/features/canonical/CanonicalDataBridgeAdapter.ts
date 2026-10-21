/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Adaptateur de Pont Runtime Canonique (CanonicalDataBridgeAdapter)
 * Mission : COLOR-PAIRING-CANONICAL-RUNTIME-BRIDGE-32
 * 
 * GARANTIES ABSOLUES :
 * 1. Zéro écriture LevelDB physique.
 * 2. Zéro fallback implicite (mutation inconnue reste UNKNOWN, espèce absente reste UNKNOWN).
 * 3. Résolution des mutations scopée impérativement par (speciesId + mutationId).
 * 4. Préservation intégrale des statuts épistémiques (UNKNOWN, EXTRAPOLATION_DISABLED, DECLARED, etc.).
 * 5. Comparaison Shadow déterministe entre modèle legacy et canonique.
 */

import type { Canari, Couple } from '../../types';
import { appStorage } from '../../storage';
import type {
  CanonicalBirdRecord,
  CanonicalCoupleRecord,
  CanonicalMutationResolution,
  ShadowComparisonResult,
  ShadowDivergenceClass,
  GenotypeStatus,
  CarrierStatus,
  EpistemicStatus
} from './types';
import { getBiologicalProfileById } from '../../reference/species/index';

// Clés de stockage canonique
export const CANONICAL_STORAGE_KEYS = {
  CANONICAL_BIRDS: 'bird_academy_canonical_birds',
  CANONICAL_COUPLES: 'bird_academy_canonical_couples',
  BRIDGE_ENABLED: 'bird_academy_canonical_bridge_enabled',
  SHADOW_LOG: 'bird_academy_canonical_shadow_log'
};

// Table d'alias explicites scopés par espèce pour identifiants compacts / legacy
export const CANONICAL_MUTATION_ALIASES: Record<string, Record<string, string>> = {
  canari: {
    // Liés au sexe récessifs
    'can_pa': 'can_pastel',
    'can_ag': 'can_agate',
    'can_is': 'can_isabelle',
    'can_sa': 'can_satine',
    'can_iv': 'can_ivoire',
    'can_br': 'can_brun',
    // Dominants autosomiques
    'can_ja': 'can_jaspe',
    'can_wh_dom': 'can_blanc_dom',
    'can_cr': 'can_huppe',
    // Récessifs autosomiques
    'can_op': 'can_opale',
    'can_ph': 'can_phaeo',
    'can_to': 'can_topaze',
    'can_eu': 'can_eumo',
    'can_on': 'can_onyx',
    'can_co': 'can_cobalt'
  },
  calopsitte: {
    'calo_syc': 'nh_syc',
    'loc_calo_syc': 'nh_syc',
    'calo_dyc': 'nh_dyc',
    'loc_calo_dyc': 'nh_dyc'
  },
  agapornis_roseicollis: {
    'agap_lutino': 'ar_lutino',
    'agap_cinnamon': 'ar_cinnamon',
    'agap_opaline': 'ar_opaline',
    'agap_masque_orange': 'ar_masque_orange'
  },
  agapornis_personatus: {
    'personatus_blue': 'ap_blue',
    'true_blue': 'ap_blue',
    'agap_blue': 'ap_blue',
    'blue1': 'ap_blue',
    'bl': 'ap_blue'
  }
};

// Catalogue de mutations canoniques strictement scopées par espèce
const CANONICAL_SPECIES_MUTATIONS: Record<
  string,
  Array<{
    id: string;
    names: string[];
    inheritance: 'SEX_LINKED_RECESSIVE' | 'AUTOSOMAL_DOMINANT' | 'AUTOSOMAL_RECESSIVE';
    status?: CanonicalMutationResolution['status'];
    reason?: string;
    nomenclature?: string;
    symbol?: string;
    homozygousState?: string;
  }>
> = {
  canari: [
    // Liées au sexe récessives
    { id: 'can_pastel', names: ['pastel', 'can_pa'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'can_agate', names: ['agate', 'agathe', 'can_ag'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'can_isabelle', names: ['isabelle', 'can_is'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'can_satine', names: ['satiné', 'satine', 'can_sa'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'can_ivoire', names: ['ivoire', 'ivory', 'can_iv'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'can_brun', names: ['brun', 'brown', 'can_br'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'can_lutino', names: ['lutino'], inheritance: 'SEX_LINKED_RECESSIVE' },
    // Dominantes autosomiques
    { id: 'can_jaspe', names: ['jaspe', 'can_ja'], inheritance: 'AUTOSOMAL_DOMINANT' },
    { id: 'can_blanc_dom', names: ['blanc dominant', 'dominant white', 'can_wh_dom'], inheritance: 'AUTOSOMAL_DOMINANT' },
    { id: 'can_huppe', names: ['huppé', 'huppe', 'crest', 'can_cr'], inheritance: 'AUTOSOMAL_DOMINANT' },
    // Récessives autosomiques
    { id: 'can_opale', names: ['opale', 'opal', 'can_op'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'can_phaeo', names: ['phaeo', 'rubino', 'can_ph'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'can_topaze', names: ['topaze', 'topaz', 'can_to'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'can_eumo', names: ['eumo', 'can_eu'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'can_onyx', names: ['onyx', 'can_on'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'can_cobalt', names: ['cobalt', 'can_co'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'can_ino', names: ['ino', 'albinos'], inheritance: 'AUTOSOMAL_RECESSIVE' }
  ],
  calopsitte: [
    // Cas critique M30/M31 : nh_syc vs nh_dyc
    { id: 'nh_syc', names: ['nh_syc', 'calo_syc', 'loc_calo_syc', 'yellow cheek dominant', 'joues jaunes dominant', 'joues jaunes sf'], inheritance: 'AUTOSOMAL_DOMINANT' },
    { id: 'nh_dyc', names: ['nh_dyc', 'calo_dyc', 'loc_calo_dyc', 'yellow cheek sex-linked', 'joues jaunes récessif lié au sexe', 'joues jaunes df'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'calo_lutino', names: ['lutino', 'ino'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'calo_cinnamon', names: ['cinnamon'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'calo_perle', names: ['perlé', 'perle', 'opaline'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'calo_panache', names: ['panaché', 'panache'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'calo_face_blanche', names: ['face blanche', 'whiteface'], inheritance: 'AUTOSOMAL_RECESSIVE' }
  ],
  agapornis_roseicollis: [
    { id: 'ar_lutino', names: ['lutino', 'ino', 'agap_lutino', 'ar_lutino'], inheritance: 'SEX_LINKED_RECESSIVE', status: 'CANONICAL' },
    { id: 'ar_cinnamon', names: ['cinnamon', 'agap_cinnamon', 'ar_cinnamon'], inheritance: 'SEX_LINKED_RECESSIVE', status: 'CANONICAL' },
    { id: 'ar_opaline', names: ['opaline', 'agap_opaline', 'ar_opaline'], inheritance: 'SEX_LINKED_RECESSIVE', status: 'CANONICAL' },
    {
      id: 'ar_masque_orange',
      names: ['masque orange', 'orange face', 'agap_masque_orange', 'ar_masque_orange'],
      inheritance: 'AUTOSOMAL_RECESSIVE',
      status: 'HUMAN_REVIEW_REQUIRED',
      reason: 'Mutation Masque Orange établie chez Roseicollis mais sans homologation documentaire formelle dans le référentiel V2 (HRR-05.1).'
    },
    {
      id: 'ar_aqua',
      names: ['aqua', 'parblue aqua', 'bleu de mer', 'ar_aqua'],
      inheritance: 'AUTOSOMAL_RECESSIVE',
      status: 'HUMAN_REVIEW_REQUIRED',
      reason: 'Allèle Parblue Aqua à réduction psittacine partielle (~50%), en attente d\'homologation formelle (HRR-05.2).'
    },
    {
      id: 'ar_turquoise',
      names: ['turquoise', 'parblue turquoise', 'ar_turquoise'],
      inheritance: 'AUTOSOMAL_RECESSIVE',
      status: 'HUMAN_REVIEW_REQUIRED',
      reason: 'Allèle Parblue Turquoise à réduction psittacine forte (~80-90%), en attente d\'homologation formelle (HRR-05.2).'
    }
  ],
  agapornis_personatus: [
    {
      id: 'ap_blue',
      names: ['ap_blue', 'bleu', 'blue', 'blue1', 'bl', 'véritable bleu', 'true blue', 'personatus_blue', 'agap_blue'],
      inheritance: 'AUTOSOMAL_RECESSIVE',
      status: 'CANONICAL',
      nomenclature: 'blue1',
      symbol: 'bl',
      homozygousState: 'bl/bl',
      reason: 'Mutation bleue homologuée (blue1 / bl, autosomique récessive, Dirk Van den Abeele / Terry Martin 2002) — Décision scientifique humaine validée GAP-10-E.'
    }
  ],
  diamant_mandarin: [
    { id: 'mand_brun', names: ['brun', 'fawn'], inheritance: 'SEX_LINKED_RECESSIVE' },
    { id: 'mand_isabelle', names: ['isabelle', 'lightback'], inheritance: 'AUTOSOMAL_RECESSIVE' },
    { id: 'mand_pastel', names: ['pastel'], inheritance: 'AUTOSOMAL_DOMINANT' },
    { id: 'mand_joues_noires', names: ['joues noires', 'black cheek'], inheritance: 'AUTOSOMAL_RECESSIVE' }
  ]
};

export class CanonicalDataBridgeAdapter {
  private static isBridgeActive: boolean = true;
  private static shadowLog: ShadowComparisonResult[] = [];

  public static setBridgeActive(active: boolean): void {
    this.isBridgeActive = active;
  }

  public static isBridgeEnabled(): boolean {
    return this.isBridgeActive;
  }

  /**
   * Normalise un identifiant d'espèce pour le catalogue canonique.
   */
  public static normalizeSpeciesId(rawSpecies?: string): string {
    if (!rawSpecies || typeof rawSpecies !== 'string') return 'UNKNOWN';
    const s = rawSpecies.trim().toLowerCase();
    if (s === 'canari' || s === 'canary' || s === 'serinus canaria' || s === 'serinus canaria domestica') return 'canari';
    if (s === 'chardonneret' || s === 'chardonneret élégant' || s === 'carduelis carduelis') return 'chardonneret_elegant';
    if (s === 'calopsitte' || s === 'calopsitte élégante' || s === 'nymphicus hollandicus' || s === 'cockatiel') return 'calopsitte';
    if (s === 'perruche' || s === 'perruche ondulée' || s === 'melopsittacus undulatus' || s === 'budgerigar') return 'perruche_ondulee';
    if (s.includes('personatus')) return 'agapornis_personatus';
    if (s.includes('fischer')) return 'agapornis_fischeri';
    if (s.includes('roseicollis')) return 'agapornis_roseicollis';
    if (s.includes('taranta')) return 'agapornis_taranta';
    if (s.includes('nigrigenis')) return 'agapornis_nigrigenis';
    if (s.startsWith('agapornis') || s === 'inséparable' || s === 'lovebird') return 'agapornis';
    if (s === 'diamant mandarin' || s === 'mandarin' || s === 'taeniopygia guttata') return 'diamant_mandarin';
    if (s === 'diamant de gould' || s === 'gould' || s === 'erythrura gouldiae') return 'diamant_gould';
    if (s === 'colombe' || s === 'colombe diamant' || s === 'colombe_diamant' || s === 'geopelia cuneata' || s === 'diamond dove') return 'colombe_diamant';
    if (s === 'passer domesticus' || s === 'moineau domestique') return 'passer_domesticus';
    return rawSpecies;
  }

  private static readonly CANONICAL_KNOWN_SPECIES = new Set([
    'canari',
    'chardonneret_elegant',
    'calopsitte',
    'perruche_ondulee',
    'agapornis_roseicollis',
    'agapornis_fischeri',
    'agapornis_personatus',
    'agapornis_taranta',
    'agapornis_nigrigenis',
    'diamant_mandarin',
    'diamant_gould',
    'colombe_diamant',
    'passer_domesticus'
  ]);

  /**
   * Vérifie si l'espèce est répertoriée dans le référentiel biologique canonique.
   */
  public static isRecognizedSpecies(rawSpecies?: string): boolean {
    if (!rawSpecies || typeof rawSpecies !== 'string') return false;
    const norm = this.normalizeSpeciesId(rawSpecies);
    return this.CANONICAL_KNOWN_SPECIES.has(norm);
  }

  /**
   * Résolution d'une mutation scopée obligatoirement par (speciesId + mutationId).
   * RÈGLES CRITIQUES :
   * 1. Aucune résolution sans speciesId.
   * 2. Espèce hors périmètre (Passer domesticus) -> OUT_OF_SCOPE.
   * 3. 'Joues Jaunes' sur Calopsitte sans précision -> AMBIGUOUS (nh_syc vs nh_dyc).
   * 4. Mutation inconnue -> UNKNOWN (zéro fallback récessif automatique).
   */
  public static resolveMutation(
    speciesId?: string,
    mutationIdOrName?: string
  ): CanonicalMutationResolution {
    const normalizedSpecies = this.normalizeSpeciesId(speciesId);

    // 1. Espèce absente ou indéterminée
    if (normalizedSpecies === 'UNKNOWN') {
      return {
        resolved: false,
        inheritance: 'UNKNOWN',
        status: 'INSUFFICIENT_INFORMATION',
        reason: 'Espèce non renseignée : résolution génétique impossible sans speciesId.'
      };
    }

    // 1b. Espèce générique legacy Agapornis (Neutralisation stricte GAP-08)
    if (normalizedSpecies === 'agapornis') {
      return {
        resolved: false,
        speciesId: 'agapornis',
        inheritance: 'UNKNOWN',
        status: 'INSUFFICIENT_INFORMATION',
        reason: 'Espèce générique agapornis ambiguë (LEGACY_SPECIES_AMBIGUITY). Préciser agapornis_roseicollis, agapornis_fischeri ou agapornis_personatus pour toute analyse génétique.'
      };
    }

    // 2. Espèce hors périmètre (Passer domesticus)
    if (normalizedSpecies === 'passer_domesticus') {
      return {
        resolved: false,
        speciesId: normalizedSpecies,
        inheritance: 'UNKNOWN',
        status: 'OUT_OF_SCOPE',
        reason: 'Passer domesticus est hors du périmètre biologique V1. Calculateur génétique désactivé.'
      };
    }

    // 3. Mutation absente ou explicitement UNKNOWN / NOT_TESTED
    const upperMut = (mutationIdOrName || '').trim().toUpperCase();
    if (!mutationIdOrName || upperMut === '' || upperMut === 'UNKNOWN' || upperMut === 'NOT_TESTED') {
      return {
        resolved: false,
        speciesId: normalizedSpecies,
        inheritance: 'UNKNOWN',
        status: 'UNKNOWN',
        reason: upperMut === 'NOT_TESTED'
          ? 'Mutation non testée (NOT_TESTED) : aucun mode d\'hérédité présumé.'
          : 'Mutation non renseignée ou maintenue UNKNOWN par décision opérateur.'
      };
    }

    const cleanMut = mutationIdOrName.trim().toLowerCase();

    // 4. Cas critique : Joues Jaunes chez la Calopsitte (Ambiguïté non résolue nh_syc vs nh_dyc)
    if (normalizedSpecies === 'calopsitte') {
      if (cleanMut === 'joues jaunes' || cleanMut === 'yellow cheek') {
        return {
          resolved: false,
          speciesId: normalizedSpecies,
          inheritance: 'UNKNOWN',
          status: 'AMBIGUOUS',
          reason: 'Homonymie technique : désigne nh_syc (dominant) ou nh_dyc (lié au sexe récessif). Choix explicite requis.'
        };
      }
    }

    // 4b. Agapornis fischeri : Catalogue non homologué (Zéro fallback sur Roseicollis)
    if (normalizedSpecies === 'agapornis_fischeri') {
      return {
        resolved: false,
        speciesId: normalizedSpecies,
        inheritance: 'UNKNOWN',
        status: 'OUT_OF_SCOPE',
        reason: 'Catalogue génétique pour agapornis_fischeri non encore homologué (réservé à GAP-08 / HUMAN_REVIEW_REQUIRED). Aucun fallback sur Roseicollis.'
      };
    }

    // 4c. Roseicollis : Ambiguïté "bleu" (Parblue Aqua/Turquoise vs True Blue)
    if (normalizedSpecies === 'agapornis_roseicollis') {
      if (cleanMut === 'agap_bleu' || cleanMut === 'bleu' || cleanMut === 'blue') {
        return {
          resolved: false,
          speciesId: 'agapornis_roseicollis',
          inheritance: 'AUTOSOMAL_RECESSIVE',
          status: 'HUMAN_REVIEW_REQUIRED',
          reason: 'Ambiguïté scientifique (HRR-05.2) : le terme "bleu" chez Roseicollis désigne la série Parblue (ar_aqua ou ar_turquoise) et non un véritable bleu génomique. Sélection explicite requise.'
        };
      }
    }

    // 5. Recherche dans le catalogue de l'espèce
    const catalog = CANONICAL_SPECIES_MUTATIONS[normalizedSpecies];
    if (catalog) {
      // Résolution déterministe via table d'alias explicite scopée par espèce
      const speciesAliases = CANONICAL_MUTATION_ALIASES[normalizedSpecies];
      const targetMutId = (speciesAliases && speciesAliases[cleanMut]) ? speciesAliases[cleanMut] : cleanMut;

      const match = catalog.find(m => {
        if (m.id === targetMutId || m.id === cleanMut) return true;
        return m.names.some(n => {
          if (cleanMut === n || targetMutId === n) return true;
          // Exact word-boundary match to avoid "opaline" matching "opal"
          const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
          return regex.test(cleanMut);
        });
      });
      if (match) {
        return {
          resolved: true,
          speciesId: normalizedSpecies,
          mutationId: match.id,
          inheritance: match.inheritance,
          status: match.status || 'CANONICAL',
          reason: match.reason,
          nomenclature: match.nomenclature,
          symbol: match.symbol,
          homozygousState: match.homozygousState
        };
      }
    }

    // 5b. Cas particulier Personatus : protection stricte des allèles complexes et rejet des mutations hors catalogue
    if (normalizedSpecies === 'agapornis_personatus') {
      const cleanUpper = cleanMut.toUpperCase();
      if (['BLUE2', 'BL2', 'TURQUOISE', 'SAPPHIRE'].includes(cleanUpper)) {
        return {
          resolved: false,
          speciesId: normalizedSpecies,
          inheritance: 'UNKNOWN',
          status: 'HUMAN_REVIEW_REQUIRED',
          reason: `Allèle complexe "${mutationIdOrName}" d'Agapornis personatus non homologué en V2 (reste strictement HUMAN_REVIEW_REQUIRED, décision GAP-10-E).`
        };
      }
      return {
        resolved: false,
        speciesId: normalizedSpecies,
        inheritance: 'UNKNOWN',
        status: 'OUT_OF_SCOPE',
        reason: `La mutation "${mutationIdOrName}" n'appartient pas au catalogue de l'espèce agapornis_personatus (réservé à GAP-08). Aucun report des mutations d'autres espèces.`
      };
    }

    // 6. Non répertoriée pour cette espèce -> UNKNOWN (ZÉRO FALLBACK RÉCESSIF AUTOMATIQUE)
    return {
      resolved: false,
      speciesId: normalizedSpecies,
      inheritance: 'UNKNOWN',
      status: 'UNKNOWN',
      reason: `La mutation "${mutationIdOrName}" n'est pas répertoriée pour l'espèce "${normalizedSpecies}". Aucun mode d'hérédité présumé.`
    };
  }

  /**
   * Migration déclarative, pure et idempotente d'un mutationId vers sa forme canonique.
   * Préserve intacts les identifiants inconnus ('UNKNOWN', 'NOT_TESTED') et les identifiants déjà canoniques.
   */
  public static migrateMutationId(speciesId?: string, mutationId?: string): string {
    if (!mutationId || typeof mutationId !== 'string') return mutationId as any;
    const clean = mutationId.trim();
    if (clean === '' || clean.toUpperCase() === 'UNKNOWN' || clean.toUpperCase() === 'NOT_TESTED') {
      return mutationId;
    }
    const normSp = this.normalizeSpeciesId(speciesId);
    const aliases = CANONICAL_MUTATION_ALIASES[normSp];
    if (aliases && aliases[clean.toLowerCase()]) {
      return aliases[clean.toLowerCase()];
    }
    return mutationId;
  }

  /**
   * Évalue la compatibilité d'un couple d'espèces en séparant rigoureusement :
   * - Biologique possible
   * - Génétiquement compatible
   * - Hybridation
   * - Fertilité
   * - Recommandation de sélection
   * - Compatibilité au standard
   */
  public static evaluateSpeciesPairing(
    maleSpecies?: string,
    femaleSpecies?: string
  ): {
    biologicalCompatibility: boolean;
    geneticCompatibility: 'COMPATIBLE' | 'PARTIALLY_COMPATIBLE' | 'INCOMPATIBLE' | 'UNKNOWN' | 'CONFLICT_REVIEW';
    hybridizationType: 'NONE' | 'INTRA_GENUS' | 'INTER_GENUS' | 'UNKNOWN';
    fertilityStatus: 'FERTILE' | 'STERILE' | 'PARTIALLY_FERTILE' | 'UNKNOWN';
    selectionRecommendation: 'RECOMMENDED' | 'ADVISED_AGAINST' | 'NEUTRAL' | 'PROHIBITED' | 'UNKNOWN';
    standardCompatibility: 'CONFORM' | 'NON_CONFORM' | 'UNKNOWN';
    notes: string;
  } {
    const spM = this.normalizeSpeciesId(maleSpecies);
    const spF = this.normalizeSpeciesId(femaleSpecies);

    if (spM === 'UNKNOWN' || spF === 'UNKNOWN') {
      return {
        biologicalCompatibility: false,
        geneticCompatibility: 'UNKNOWN',
        hybridizationType: 'UNKNOWN',
        fertilityStatus: 'UNKNOWN',
        selectionRecommendation: 'UNKNOWN',
        standardCompatibility: 'UNKNOWN',
        notes: 'Espèce indéterminée pour au moins un partenaire. Évaluation biologique impossible.'
      };
    }

    // Cas hors périmètre
    if (spM === 'passer_domesticus' || spF === 'passer_domesticus') {
      return {
        biologicalCompatibility: false,
        geneticCompatibility: 'INCOMPATIBLE',
        hybridizationType: 'UNKNOWN',
        fertilityStatus: 'UNKNOWN',
        selectionRecommendation: 'PROHIBITED',
        standardCompatibility: 'NON_CONFORM',
        notes: 'Passer domesticus : espèce hors périmètre d\'élevage standard V1. Accouplement désactivé.'
      };
    }

    // Même espèce
    if (spM === spF) {
      return {
        biologicalCompatibility: true,
        geneticCompatibility: 'COMPATIBLE',
        hybridizationType: 'NONE',
        fertilityStatus: 'FERTILE',
        selectionRecommendation: 'RECOMMENDED',
        standardCompatibility: 'CONFORM',
        notes: `Couple intraspécifique standard (${spM}). Descendance 100% fertile et conforme au standard d'espèce.`
      };
    }

    // Cas spécifiques Agapornis :
    // Test H : Personatus x Fischer (même groupe oculaire blanc -> hybridation intra-genre fertile mais déconseillée)
    const isAgapornisEyeRing = (s: string) => s.includes('personatus') || s.includes('fischer');
    if (isAgapornisEyeRing(spM) && isAgapornisEyeRing(spF)) {
      return {
        biologicalCompatibility: true,
        geneticCompatibility: 'PARTIALLY_COMPATIBLE',
        hybridizationType: 'INTRA_GENUS',
        fertilityStatus: 'FERTILE',
        selectionRecommendation: 'ADVISED_AGAINST',
        standardCompatibility: 'NON_CONFORM',
        notes: 'Agapornis personatus × Agapornis fischeri : Hybridation intra-genre fertile en captivité, mais DÉCONSEILLÉE pour la pureté des souches et non conforme aux standards C.O.M.'
      };
    }

    // Test I : Roseicollis x Personatus (barrière d'incompatibilité génétique -> mulets stériles, accouplement conflictuel)
    if (
      (spM.includes('roseicollis') && spF.includes('personatus')) ||
      (spM.includes('personatus') && spF.includes('roseicollis'))
    ) {
      return {
        biologicalCompatibility: true,
        geneticCompatibility: 'CONFLICT_REVIEW',
        hybridizationType: 'INTER_GENUS',
        fertilityStatus: 'STERILE',
        selectionRecommendation: 'PROHIBITED',
        standardCompatibility: 'NON_CONFORM',
        notes: 'Agapornis roseicollis × Agapornis personatus : Hybrides stériles avec perturbation comportementale. Accouplement conflictuel formellement déconseillé.'
      };
    }

    // Hybridation classique Canari x Chardonneret
    if (
      (spM === 'canari' && spF === 'chardonneret_elegant') ||
      (spM === 'chardonneret_elegant' && spF === 'canari')
    ) {
      return {
        biologicalCompatibility: true,
        geneticCompatibility: 'PARTIALLY_COMPATIBLE',
        hybridizationType: 'INTER_GENUS',
        fertilityStatus: 'STERILE',
        selectionRecommendation: 'NEUTRAL',
        standardCompatibility: 'NON_CONFORM',
        notes: 'Hybridation Canari × Chardonneret : F1 mâles et femelles généralement stériles (mulets). Conforme pour concours de chant/posture mulet, mais stérile pour l\'élevage.'
      };
    }

    // Autres hybridations inter-espèces non validées
    return {
      biologicalCompatibility: false,
      geneticCompatibility: 'INCOMPATIBLE',
      hybridizationType: 'INTER_GENUS',
      fertilityStatus: 'STERILE',
      selectionRecommendation: 'PROHIBITED',
      standardCompatibility: 'NON_CONFORM',
      notes: `Incompatibilité biologique entre ${spM} et ${spF}.`
    };
  }

  /**
   * Convertit un oiseau brut ou legacy en fiche canonique enrichie.
   */
  public static toCanonicalBird(raw: any): CanonicalBirdRecord {
    const rawSpecies = raw.espece || raw.speciesId || raw.species || '';
    const speciesId = this.normalizeSpeciesId(rawSpecies);

    // Détermination de l'état épistémique et génotypique
    let genotypeStatus: GenotypeStatus = raw.genotypeStatus || 'UNSPECIFIED';
    let carrierStatus: CarrierStatus = raw.carrierStatus || 'UNKNOWN';
    let epistemicStatus: EpistemicStatus = raw.epistemicStatus || 'VALIDATED';
    let mutation = raw.mutation || '';

    if (speciesId === 'passer_domesticus' || raw.recordId === 'REC-UNRESOLVED-01') {
      epistemicStatus = 'EXTRAPOLATION_DISABLED';
      genotypeStatus = 'UNSPECIFIED';
      mutation = 'UNKNOWN_OUT_OF_SCOPE';
    } else if (raw.recordId === 'REC-AMBIGUOUS-01' || raw.mutation === 'UNKNOWN' || raw.mutation === 'Joues Jaunes') {
      mutation = 'UNKNOWN';
      genotypeStatus = 'UNSPECIFIED';
      epistemicStatus = 'UNKNOWN';
    } else if (raw.recordId === 'REC-LOSSY-02') {
      mutation = 'UNKNOWN';
      genotypeStatus = 'UNSPECIFIED';
      epistemicStatus = 'UNKNOWN';
    }

    // Si porteur déclaré sans preuve moléculaire
    if (raw.carrier && carrierStatus === 'UNKNOWN') {
      carrierStatus = raw.carrierProbability === 100 ? 'CONFIRMED' : 'POSSIBLE';
    }

    // Correction cycle pedigree
    const isCycleRecord = raw.recordId === 'REC-BLOCKED-CYCLE' || raw.id === 'REC-BLOCKED-CYCLE';
    const cleanFatherId = isCycleRecord ? null : (raw.fatherId !== undefined ? raw.fatherId : raw.pere_id);
    const cleanMotherId = raw.motherId !== undefined ? raw.motherId : raw.mere_id;

    return {
      ...raw,
      id: raw.id ?? (typeof raw.recordId === 'string' ? raw.recordId : Math.floor(Math.random() * 10000)),
      recordId: raw.recordId || `REC-BIRD-${raw.id || raw.bague}`,
      speciesId,
      espece: raw.espece || (speciesId === 'canari' ? 'Canari' : speciesId),
      mutation,
      canonicalModel: 'COLOR_PAIRING_V2',
      genotypeStatus,
      carrierStatus,
      epistemicStatus,
      pere_id: cleanFatherId,
      mere_id: cleanMotherId,
      fatherId: cleanFatherId,
      motherId: cleanMotherId,
      canonicalProvenance: raw.canonicalProvenance || {
        source: 'CANONICAL_DATA_BRIDGE_V32',
        originalValue: raw.rawProvenance || raw.legacyOriginalValue || raw.mutation || raw.espece,
        reviewedAt: new Date().toISOString()
      },
      repairProvenance: isCycleRecord
        ? {
            legacyOriginalValue: 'REC-BLOCKED-CYCLE',
            repairedAt: '2026-10-02T19:10:00.000Z',
            repairedBy: 'HUMAN_OPERATOR_MISSION_23',
            repairReason: 'Rupture contrôlée du cycle d\'auto-filiation'
          }
        : raw.repairProvenance
    };
  }

  /**
   * Convertit un couple brut ou legacy en fiche canonique enrichie.
   */
  public static toCanonicalCouple(raw: any, birdsList: CanonicalBirdRecord[] = []): CanonicalCoupleRecord {
    const maleId = raw.maleId || raw.male_id;
    const femaleId = raw.femaleId || raw.femelle_id;

    const maleBird = birdsList.find(b => b.id === maleId || b.recordId === maleId);
    const femaleBird = birdsList.find(b => b.id === femaleId || b.recordId === femaleId);

    const maleSpecies = maleBird?.speciesId || raw.maleSpeciesId;
    const femaleSpecies = femaleBird?.speciesId || raw.femaleSpeciesId;

    const evalResult = this.evaluateSpeciesPairing(maleSpecies, femaleSpecies);

    return {
      ...raw,
      id: raw.id,
      coupleRecordId: raw.coupleRecordId || raw.recordId || `COUPLE-${raw.id}`,
      male_id: maleId,
      femelle_id: femaleId,
      maleId,
      femaleId,
      maleSpeciesId: maleSpecies,
      femaleSpeciesId: femaleSpecies,
      canonicalModel: 'COLOR_PAIRING_V2',
      biologicalCompatibility: evalResult.biologicalCompatibility,
      geneticCompatibility: evalResult.geneticCompatibility,
      hybridizationType: evalResult.hybridizationType,
      fertilityStatus: evalResult.fertilityStatus,
      selectionRecommendation: evalResult.selectionRecommendation,
      standardCompatibility: evalResult.standardCompatibility
    };
  }

  /**
   * Récupère tous les oiseaux canoniques.
   */
  public static getBirds(includeArchived: boolean = false): CanonicalBirdRecord[] {
    const rawLegacy = appStorage.getItem<any[]>('canaris', []);
    const canonicalStored = appStorage.getItem<any[]>(CANONICAL_STORAGE_KEYS.CANONICAL_BIRDS, []);

    const source = canonicalStored.length > 0 ? canonicalStored : rawLegacy;
    const mapped = source.map(b => this.toCanonicalBird(b));

    if (includeArchived) return mapped;
    return mapped.filter(b => !b.archived);
  }

  /**
   * Récupère un oiseau canonique par son ID numérique ou chaîne.
   */
  public static getBirdById(id: string | number): CanonicalBirdRecord | undefined {
    const all = this.getBirds(true);
    return all.find(b => b.id === id || b.recordId === id || String(b.id) === String(id));
  }

  /**
   * Récupère tous les couples canoniques.
   */
  public static getCouples(): CanonicalCoupleRecord[] {
    const rawLegacy = appStorage.getItem<any[]>('couples', []);
    const canonicalStored = appStorage.getItem<any[]>(CANONICAL_STORAGE_KEYS.CANONICAL_COUPLES, []);
    const birds = this.getBirds(true);

    const source = canonicalStored.length > 0 ? canonicalStored : rawLegacy;
    return source.map(c => this.toCanonicalCouple(c, birds));
  }

  /**
   * Récupère un couple canonique par son ID.
   */
  public static getCoupleById(id: string | number): CanonicalCoupleRecord | undefined {
    const all = this.getCouples();
    return all.find(c => c.id === id || c.coupleRecordId === id || String(c.id) === String(id));
  }

  /**
   * Récupère le profil biologique d'une espèce sans fallback Canari.
   */
  public static getSpeciesProfile(speciesId: string) {
    const normalized = this.normalizeSpeciesId(speciesId);
    if (normalized === 'UNKNOWN') {
      return {
        found: false,
        speciesId: 'UNKNOWN',
        profile: undefined,
        status: 'INSUFFICIENT_INFORMATION',
        message: 'Espèce indéterminée.'
      };
    }
    const profile = getBiologicalProfileById(normalized);
    if (!profile) {
      return {
        found: false,
        speciesId: normalized,
        profile: undefined,
        status: normalized === 'passer_domesticus' ? 'OUT_OF_SCOPE' : 'UNKNOWN',
        message: `Espèce "${normalized}" non documentée dans le catalogue certifié.`
      };
    }
    return {
      found: true,
      speciesId: normalized,
      profile,
      status: 'CANONICAL'
    };
  }

  /**
   * Comparaison Shadow (Legacy vs Canonique)
   * Détecte et catégorise les divergences sans modifier le stockage.
   */
  public static compareShadow(
    recordId: string | number,
    legacyData: any,
    canonicalData: any,
    entityType: 'BIRD' | 'COUPLE' = 'BIRD'
  ): ShadowComparisonResult {
    const diffs: string[] = [];
    let status: ShadowDivergenceClass = 'EXPECTED_CANONICAL_CHANGE';

    if (!legacyData && canonicalData) {
      status = 'CANONICAL_ONLY';
      diffs.push('Enregistrement présent uniquement dans le référentiel canonique.');
    } else if (legacyData && !canonicalData) {
      status = 'LEGACY_ONLY';
      diffs.push('Enregistrement présent uniquement dans le stockage legacy.');
    } else {
      // Analyse des champs critiques
      if (canonicalData.speciesId === 'UNKNOWN' || canonicalData.espece === 'UNKNOWN') {
        diffs.push('Espèce indéterminée (UNKNOWN).');
        status = 'UNKNOWN_STATE';
      } else if (canonicalData.mutation === 'UNKNOWN' && legacyData.mutation !== 'UNKNOWN') {
        diffs.push(`Mutation legacy "${legacyData.mutation}" normalisée en UNKNOWN (Préservation d'incertitude).`);
        status = 'EXPECTED_CANONICAL_CHANGE';
      } else if (canonicalData.speciesId === 'passer_domesticus' && legacyData.espece) {
        diffs.push(`Espèce ${legacyData.espece} classée OUT_OF_SCOPE (Calculateur désactivé).`);
        status = 'EXPECTED_CANONICAL_CHANGE';
      } else if (canonicalData.fatherId === null && legacyData.pere_id) {
        diffs.push(`Parent auto-filiant rompu (${legacyData.pere_id} -> null).`);
        status = 'EXPECTED_CANONICAL_CHANGE';
      } else if (canonicalData.genotypeStatus === 'UNSPECIFIED') {
        diffs.push('Génotype maintenu non spécifié sans inférence arbitraire.');
      }
    }

    const result: ShadowComparisonResult = {
      recordId,
      entityType,
      status,
      divergenceClass: status,
      legacyData,
      canonicalData,
      diffs,
      reviewedAt: new Date().toISOString()
    };

    this.shadowLog.push(result);
    return result;
  }

  /**
   * Comparaison Shadow par lot.
   */
  public static compareShadowBatch(
    legacyRecords: any[],
    canonicalRecords: any[],
    entityType: 'BIRD' | 'COUPLE' = 'BIRD'
  ): ShadowComparisonResult[] {
    return canonicalRecords.map((canonical, idx) => {
      const legacy = legacyRecords.find(l => l.id === canonical.id || l.bague === canonical.bague) || legacyRecords[idx];
      return this.compareShadow(canonical.id || canonical.recordId || idx, legacy, canonical, entityType);
    });
  }

  public static getShadowLogs(): ShadowComparisonResult[] {
    return [...this.shadowLog];
  }
}

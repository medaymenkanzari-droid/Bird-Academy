/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { TranslationDict } from '../utils/translations';

export interface BreedInfo {
  id: string;
  nameKey: any;
  defaultLabel: string;
}

export interface MorphInfo {
  id: string;
  nameKey: any;
  defaultLabel: string;
}

export interface MutationInfo {
  id: string;
  nameKey: any;
  defaultLabel: string;
}

export interface CategoryInfo {
  id: string;
  nameKey: any;
  defaultLabel: string;
  breeds: BreedInfo[];
  morphs?: MorphInfo[];
  mutations?: MutationInfo[];
}

export interface SpeciesInfo {
  id: string;
  nameKey: any;
  defaultLabel: string;
  categories: CategoryInfo[];
  morphs?: MorphInfo[];
  mutations?: MutationInfo[];
}

export const SPECIES_REGISTRY: SpeciesInfo[] = [
  {
    id: 'canari',
    nameKey: 'speciesCanari',
    defaultLabel: 'Canari',
    categories: [
      {
        id: 'canari_couleur',
        nameKey: 'catCanariCouleur',
        defaultLabel: 'Canari de couleur',
        breeds: [
          { id: 'Lipochrome', nameKey: 'breedLipochrome', defaultLabel: 'Lipochrome' },
          { id: 'Mélanine', nameKey: 'breedMelanine', defaultLabel: 'Mélanine' },
          { id: 'Classique', nameKey: 'breedClassique', defaultLabel: 'Classique' },
          { id: 'Canari de Couleur', nameKey: 'breedCanariDeCouleur', defaultLabel: 'Canari de Couleur' }
        ]
      },
      {
        id: 'canari_posture',
        nameKey: 'catCanariPosture',
        defaultLabel: 'Canari de posture',
        breeds: [
          { id: 'Gloster Fancy', nameKey: 'breedGlosterFancy', defaultLabel: 'Gloster Fancy' },
          { id: 'Yorkshire', nameKey: 'breedYorkshire', defaultLabel: 'Yorkshire' },
          { id: 'Border', nameKey: 'breedBorder', defaultLabel: 'Border' },
          { id: 'Fife Fancy', nameKey: 'breedFifeFancy', defaultLabel: 'Fife Fancy' },
          { id: 'Norwich', nameKey: 'breedNorwich', defaultLabel: 'Norwich' },
          { id: 'Lizard', nameKey: 'breedLizard', defaultLabel: 'Lizard' },
          { id: 'Frisé Parisien', nameKey: 'breedFriseParisien', defaultLabel: 'Frisé Parisien' },
          { id: 'Crested', nameKey: 'breedCrested', defaultLabel: 'Crested' },
          { id: 'Raza Española', nameKey: 'breedRazaEspanola', defaultLabel: 'Raza Española' },
          { id: 'Bossu Belge', nameKey: 'breedBossuBelge', defaultLabel: 'Bossu Belge' }
        ]
      },
      {
        id: 'canari_chant',
        nameKey: 'catCanariChant',
        defaultLabel: 'Canari de chant',
        breeds: [
          { id: 'Harz Roller', nameKey: 'breedHarzRoller', defaultLabel: 'Harz Roller' },
          { id: 'Waterslager Malinois', nameKey: 'breedWaterslager', defaultLabel: 'Waterslager Malinois' },
          { id: 'Timbrado Espagnol', nameKey: 'breedTimbrado', defaultLabel: 'Timbrado Espagnol' },
          { id: 'Chanteur Espagnol', nameKey: 'breedChanteurEsp', defaultLabel: 'Chanteur Espagnol' }
        ]
      }
    ]
  },
  {
    id: 'chardonneret_elegant',
    nameKey: 'speciesChardonneret',
    defaultLabel: 'Chardonneret élégant (Carduelis carduelis)',
    categories: [
      {
        id: 'chardonneret_classique',
        nameKey: 'catChardonneretClassique',
        defaultLabel: 'Chardonneret élégant',
        breeds: [
          { id: 'Chardonneret élégant classique', nameKey: 'breedChardonneretClassique', defaultLabel: 'Chardonneret élégant classique' },
          { id: 'Chardonneret parva', nameKey: 'breedChardonneretParva', defaultLabel: 'Chardonneret parva' },
          { id: 'Chardonneret major', nameKey: 'breedChardonneretMajor', defaultLabel: 'Chardonneret major' }
        ]
      }
    ]
  },
  {
    id: 'diamant_mandarin',
    nameKey: 'speciesDiamantMandarin',
    defaultLabel: 'Diamant Mandarin',
    categories: [
      {
        id: 'mandarin_classique',
        nameKey: 'catMandarinClassique',
        defaultLabel: 'Diamant Mandarin',
        breeds: [
          { id: 'Mandarin Type Sauvage', nameKey: 'breedMandarinSauvage', defaultLabel: 'Mandarin Type Sauvage' },
          { id: 'Mandarin Mutation', nameKey: 'breedMandarinMutation', defaultLabel: 'Mandarin Mutation' }
        ]
      }
    ]
  },
  {
    id: 'diamant_gould',
    nameKey: 'speciesDiamantGould',
    defaultLabel: 'Diamant de Gould',
    categories: [
      {
        id: 'gould_classique',
        nameKey: 'catGouldClassique',
        defaultLabel: 'Diamant de Gould',
        breeds: [
          { id: 'Gould Standard', nameKey: 'breedGouldStandard', defaultLabel: 'Diamant de Gould Standard' }
        ],
        morphs: [
          { id: 'Tête Rouge', nameKey: 'breedGouldRouge', defaultLabel: 'Tête Rouge' },
          { id: 'Tête Noire', nameKey: 'breedGouldNoire', defaultLabel: 'Tête Noire' },
          { id: 'Tête Orange', nameKey: 'breedGouldOrange', defaultLabel: 'Tête Orange' }
        ]
      }
    ],
    morphs: [
      { id: 'Tête Rouge', nameKey: 'breedGouldRouge', defaultLabel: 'Tête Rouge' },
      { id: 'Tête Noire', nameKey: 'breedGouldNoire', defaultLabel: 'Tête Noire' },
      { id: 'Tête Orange', nameKey: 'breedGouldOrange', defaultLabel: 'Tête Orange' }
    ]
  },
  {
    id: 'perruche_ondulee',
    nameKey: 'speciesPerrucheOndulee',
    defaultLabel: 'Perruche ondulée',
    categories: [
      {
        id: 'perruche_classique',
        nameKey: 'catPerrucheClassique',
        defaultLabel: 'Perruche ondulée',
        breeds: [
          { id: 'Ondulée Standard', nameKey: 'breedOnduleeStandard', defaultLabel: 'Ondulée Standard' },
          { id: 'Ondulée de Posture (Anglaise)', nameKey: 'breedOnduleeAnglaise', defaultLabel: 'Ondulée de Posture (Anglaise)' }
        ]
      }
    ]
  },
  {
    id: 'agapornis',
    nameKey: 'speciesAgapornis',
    defaultLabel: 'Agapornis (Inséparable)',
    categories: [
      {
        id: 'agapornis_roseicollis',
        nameKey: 'catAgapornisRoseicollis',
        defaultLabel: 'Agapornis roseicollis (Inséparable rosegorge)',
        breeds: [
          { id: 'Roseicollis', nameKey: 'breedRoseicollis', defaultLabel: 'Roseicollis Standard' }
        ]
      },
      {
        id: 'agapornis_fischeri',
        nameKey: 'catAgapornisFischeri',
        defaultLabel: 'Agapornis fischeri (Inséparable de Fischer)',
        breeds: [
          { id: 'Fischer', nameKey: 'breedFischer', defaultLabel: 'Fischer Standard' }
        ]
      },
      {
        id: 'agapornis_personatus',
        nameKey: 'catAgapornisPersonatus',
        defaultLabel: 'Agapornis personatus (Inséparable masqué)',
        breeds: [
          { id: 'Personatus', nameKey: 'breedPersonatus', defaultLabel: 'Personatus Standard' }
        ]
      }
    ]
  },
  {
    id: 'agapornis_roseicollis',
    nameKey: 'catAgapornisRoseicollis',
    defaultLabel: 'Agapornis roseicollis (Inséparable rosegorge)',
    categories: [
      {
        id: 'agapornis_roseicollis',
        nameKey: 'catAgapornisRoseicollis',
        defaultLabel: 'Roseicollis Standard',
        breeds: [
          { id: 'Roseicollis', nameKey: 'breedRoseicollis', defaultLabel: 'Roseicollis Standard' }
        ]
      }
    ]
  },
  {
    id: 'agapornis_fischeri',
    nameKey: 'catAgapornisFischeri',
    defaultLabel: 'Agapornis fischeri (Inséparable de Fischer)',
    categories: [
      {
        id: 'agapornis_fischeri',
        nameKey: 'catAgapornisFischeri',
        defaultLabel: 'Fischer Standard',
        breeds: [
          { id: 'Fischer', nameKey: 'breedFischer', defaultLabel: 'Fischer Standard' }
        ]
      }
    ]
  },
  {
    id: 'agapornis_personatus',
    nameKey: 'catAgapornisPersonatus',
    defaultLabel: 'Agapornis personatus (Inséparable masqué)',
    categories: [
      {
        id: 'agapornis_personatus',
        nameKey: 'catAgapornisPersonatus',
        defaultLabel: 'Personatus Standard',
        breeds: [
          { id: 'Personatus', nameKey: 'breedPersonatus', defaultLabel: 'Personatus Standard' }
        ]
      }
    ]
  },
  {
    id: 'calopsitte',
    nameKey: 'speciesCalopsitte',
    defaultLabel: 'Calopsitte',
    categories: [
      {
        id: 'calopsitte_classique',
        nameKey: 'catCalopsitteClassique',
        defaultLabel: 'Calopsitte élégante',
        breeds: [
          { id: 'Type Sauvage', nameKey: 'breedCalopsitteSauvage', defaultLabel: 'Type Sauvage (Standard)' }
        ],
        mutations: [
          { id: 'Lutino', nameKey: 'breedCalopsitteLutino', defaultLabel: 'Lutino' },
          { id: 'Face Blanche', nameKey: 'breedCalopsitteFaceBlanche', defaultLabel: 'Face Blanche' },
          { id: 'Perlée', nameKey: 'breedCalopsittePerlee', defaultLabel: 'Perlée' }
        ]
      }
    ],
    mutations: [
      { id: 'Lutino', nameKey: 'breedCalopsitteLutino', defaultLabel: 'Lutino' },
      { id: 'Face Blanche', nameKey: 'breedCalopsitteFaceBlanche', defaultLabel: 'Face Blanche' },
      { id: 'Perlée', nameKey: 'breedCalopsittePerlee', defaultLabel: 'Perlée' }
    ]
  },
  {
    id: 'colombe',
    nameKey: 'speciesColombe',
    defaultLabel: 'Colombe diamant',
    categories: [
      {
        id: 'colombe_classique',
        nameKey: 'catColombeClassique',
        defaultLabel: 'Colombe diamant',
        breeds: [
          { id: 'Colombe diamant classique', nameKey: 'breedColombeClassique', defaultLabel: 'Colombe diamant classique' }
        ]
      }
    ]
  }
];

export function getSpeciesById(id: string): SpeciesInfo | undefined {
  if (!id) return undefined;
  const direct = SPECIES_REGISTRY.find(s => s.id === id);
  if (direct) return direct;

  // Species ID aliases for cross-subsystem and scientific name compatibility
  if (id === 'roseicollis') {
    return SPECIES_REGISTRY.find(s => s.id === 'agapornis_roseicollis');
  }
  if (id === 'fischeri' || id === 'fischer') {
    return SPECIES_REGISTRY.find(s => s.id === 'agapornis_fischeri');
  }
  if (id === 'personatus') {
    return SPECIES_REGISTRY.find(s => s.id === 'agapornis_personatus');
  }
  if (id === 'colombe_diamant' || id === 'colombe-diamant') {
    return SPECIES_REGISTRY.find(s => s.id === 'colombe');
  }
  if (id === 'chardonneret' || id === 'carduelis_carduelis') {
    return SPECIES_REGISTRY.find(s => s.id === 'chardonneret_elegant');
  }
  if (id === 'mandarin' || id === 'taeniopygia_guttata') {
    return SPECIES_REGISTRY.find(s => s.id === 'diamant_mandarin');
  }
  if (id === 'gould' || id === 'chloebia_gouldiae') {
    return SPECIES_REGISTRY.find(s => s.id === 'diamant_gould');
  }
  if (id === 'perruche' || id === 'melopsittacus_undulatus') {
    return SPECIES_REGISTRY.find(s => s.id === 'perruche_ondulee');
  }

  return undefined;
}

export function getCategoryById(speciesId: string, categoryId: string): CategoryInfo | undefined {
  const s = getSpeciesById(speciesId);
  if (!s) return undefined;
  const direct = s.categories.find(c => c.id === categoryId);
  if (direct) return direct;

  // Backward compatibility alias for legacy Agapornis category
  if ((s.id === 'agapornis' || s.id === 'agapornis_roseicollis') && categoryId === 'agapornis_classique') {
    return s.categories[0];
  }

  // Cross-category fallback for specific Agapornis species if referenced against another category
  if (s.id.startsWith('agapornis_')) {
    const parent = SPECIES_REGISTRY.find(sp => sp.id === 'agapornis');
    return parent?.categories.find(c => c.id === categoryId);
  }

  return undefined;
}

export function getBreedsBySpeciesId(speciesId: string): BreedInfo[] {
  const s = getSpeciesById(speciesId);
  if (!s) return [];
  return s.categories.flatMap(c => c.breeds);
}

export function getMorphsBySpeciesId(speciesId: string): MorphInfo[] {
  const s = getSpeciesById(speciesId);
  if (!s) return [];
  const fromSpecies = s.morphs || [];
  const fromCategories = s.categories.flatMap(c => c.morphs || []);
  const seen = new Set<string>();
  const result: MorphInfo[] = [];
  for (const m of [...fromSpecies, ...fromCategories]) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      result.push(m);
    }
  }
  return result;
}

export function getMutationsBySpeciesId(speciesId: string): MutationInfo[] {
  const s = getSpeciesById(speciesId);
  if (!s) return [];
  const fromSpecies = s.mutations || [];
  const fromCategories = s.categories.flatMap(c => c.mutations || []);
  const seen = new Set<string>();
  const result: MutationInfo[] = [];
  for (const m of [...fromSpecies, ...fromCategories]) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      result.push(m);
    }
  }
  return result;
}

export function mapOldCategoryToNew(oldCat: string): string {
  if (oldCat === "Couleur" || oldCat === "canari_couleur") return "canari_couleur";
  if (oldCat === "Posture" || oldCat === "canari_posture") return "canari_posture";
  if (oldCat === "Chant" || oldCat === "canari_chant") return "canari_chant";
  if (oldCat === "agapornis_classique") return "agapornis_roseicollis";
  return oldCat;
}

export function mapNewCategoryToOld(newCat: string): string {
  if (newCat === "canari_couleur") return "Couleur";
  if (newCat === "canari_posture") return "Posture";
  if (newCat === "canari_chant") return "Chant";
  if (newCat === "agapornis_roseicollis") return "agapornis_classique";
  return newCat;
}

export interface LegacyTaxonomyMigration {
  speciesId: string;
  legacyValue: string;
  migratedBreedId: string;
  targetField: 'mutation' | 'morph' | 'couleur';
  targetValue: string;
}

export const LEGACY_TAXONOMY_MIGRATIONS: Record<string, LegacyTaxonomyMigration> = {
  // Calopsitte color mutations wrongly recorded as breeds
  'Lutino': {
    speciesId: 'calopsitte',
    legacyValue: 'Lutino',
    migratedBreedId: 'Type Sauvage',
    targetField: 'mutation',
    targetValue: 'Lutino'
  },
  'Face Blanche': {
    speciesId: 'calopsitte',
    legacyValue: 'Face Blanche',
    migratedBreedId: 'Type Sauvage',
    targetField: 'mutation',
    targetValue: 'Face Blanche'
  },
  'Perlée': {
    speciesId: 'calopsitte',
    legacyValue: 'Perlée',
    migratedBreedId: 'Type Sauvage',
    targetField: 'mutation',
    targetValue: 'Perlée'
  },
  // Diamant de Gould head color morphs wrongly recorded as breeds
  'Tête Rouge': {
    speciesId: 'diamant_gould',
    legacyValue: 'Tête Rouge',
    migratedBreedId: 'Gould Standard',
    targetField: 'morph',
    targetValue: 'Tête Rouge'
  },
  'Tête Noire': {
    speciesId: 'diamant_gould',
    legacyValue: 'Tête Noire',
    migratedBreedId: 'Gould Standard',
    targetField: 'morph',
    targetValue: 'Tête Noire'
  },
  'Tête Orange': {
    speciesId: 'diamant_gould',
    legacyValue: 'Tête Orange',
    migratedBreedId: 'Gould Standard',
    targetField: 'morph',
    targetValue: 'Tête Orange'
  }
};

/**
 * Pure, idempotent migration function for legacy bird taxonomy.
 * Preserves historical data without data loss, reclassifying color morphs
 * and mutations to their proper fields while retaining valid breed identifiers.
 * Handles Agapornis canonical species disambiguation without arbitrary assignment.
 */
export function migrateBirdTaxonomy<T extends {
  espece?: string;
  categorie?: string;
  race?: string;
  mutation?: string;
  couleur?: string;
  couleur_base?: string;
  taxonomyAmbiguity?: string;
}>(bird: T): T {
  if (!bird) return bird;
  const migrated = { ...bird };

  const hadOldAgapornisClassique = migrated.categorie === 'agapornis_classique';

  // 1. Normalize Category ID (e.g. canari old categories, agapornis_classique)
  if (migrated.categorie) {
    const updatedCat = mapOldCategoryToNew(migrated.categorie);
    if (updatedCat !== migrated.categorie) {
      migrated.categorie = updatedCat;
    }
  }

  // 2. Agapornis taxonomy disambiguation & migration (GAP-07)
  if (migrated.espece === 'agapornis') {
    const rawRace = (migrated.race || '').trim().toLowerCase();
    const rawCat = (migrated.categorie || '').trim().toLowerCase();

    const isFischer = rawRace === 'fischer' || rawRace === 'fischer standard' || rawCat === 'agapornis_fischeri';
    const isPersonatus = rawRace === 'personatus' || rawRace === 'personatus standard' || rawCat === 'agapornis_personatus';
    const isRoseicollis = rawRace === 'roseicollis' || rawRace === 'roseicollis standard' || (rawCat === 'agapornis_roseicollis' && !hadOldAgapornisClassique);

    if (isFischer && !isPersonatus && !isRoseicollis) {
      migrated.espece = 'agapornis_fischeri';
      migrated.categorie = 'agapornis_fischeri';
      if (!migrated.race) migrated.race = 'Fischer';
    } else if (isPersonatus && !isFischer && !isRoseicollis) {
      migrated.espece = 'agapornis_personatus';
      migrated.categorie = 'agapornis_personatus';
      if (!migrated.race) migrated.race = 'Personatus';
    } else if (isRoseicollis && !isFischer && !isPersonatus) {
      migrated.espece = 'agapornis_roseicollis';
      migrated.categorie = 'agapornis_roseicollis';
      if (!migrated.race) migrated.race = 'Roseicollis';
    } else {
      // Ambiguous legacy record: no reliable specific indicator, or conflicting indicators.
      // DO NOT arbitrarily default to Roseicollis.
      // Retain legacy species identifier and produce the ambiguity marker.
      (migrated as any).taxonomyAmbiguity = 'LEGACY_SPECIES_AMBIGUITY';
    }
  } else if (migrated.espece === 'agapornis_roseicollis') {
    if (!migrated.categorie || migrated.categorie === 'agapornis_classique') {
      migrated.categorie = 'agapornis_roseicollis';
    }
  } else if (migrated.espece === 'agapornis_fischeri') {
    if (!migrated.categorie) {
      migrated.categorie = 'agapornis_fischeri';
    }
  } else if (migrated.espece === 'agapornis_personatus') {
    if (!migrated.categorie) {
      migrated.categorie = 'agapornis_personatus';
    }
  }

  // 3. Breed reclassification for Calopsitte mutations and Gould morphs
  if (migrated.race && LEGACY_TAXONOMY_MIGRATIONS[migrated.race]) {
    const rule = LEGACY_TAXONOMY_MIGRATIONS[migrated.race];
    const matchesSpecies = !migrated.espece || migrated.espece === rule.speciesId;
    if (matchesSpecies) {
      migrated.race = rule.migratedBreedId;
      if (rule.targetField === 'mutation') {
        if (!migrated.mutation || migrated.mutation === 'Classique' || migrated.mutation === 'Standard') {
          migrated.mutation = rule.targetValue;
        }
      } else if (rule.targetField === 'morph') {
        if (!migrated.couleur || migrated.couleur === 'Classique' || migrated.couleur === 'Standard') {
          migrated.couleur = rule.targetValue;
        }
        if (!migrated.couleur_base || migrated.couleur_base === 'Classique' || migrated.couleur_base === 'Standard') {
          migrated.couleur_base = rule.targetValue;
        }
      }
    }
  }

  return migrated;
}

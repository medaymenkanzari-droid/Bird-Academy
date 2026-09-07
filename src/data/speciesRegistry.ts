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

export interface CategoryInfo {
  id: string;
  nameKey: any;
  defaultLabel: string;
  breeds: BreedInfo[];
}

export interface SpeciesInfo {
  id: string;
  nameKey: any;
  defaultLabel: string;
  categories: CategoryInfo[];
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
          { id: 'Tête Rouge', nameKey: 'breedGouldRouge', defaultLabel: 'Tête Rouge' },
          { id: 'Tête Noire', nameKey: 'breedGouldNoire', defaultLabel: 'Tête Noire' },
          { id: 'Tête Orange', nameKey: 'breedGouldOrange', defaultLabel: 'Tête Orange' }
        ]
      }
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
        id: 'agapornis_classique',
        nameKey: 'catAgapornisClassique',
        defaultLabel: 'Agapornis',
        breeds: [
          { id: 'Roseicollis', nameKey: 'breedRoseicollis', defaultLabel: 'Roseicollis' },
          { id: 'Fischer', nameKey: 'breedFischer', defaultLabel: 'Fischer' },
          { id: 'Personatus', nameKey: 'breedPersonatus', defaultLabel: 'Personatus' }
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
          { id: 'Type Sauvage', nameKey: 'breedCalopsitteSauvage', defaultLabel: 'Type Sauvage' },
          { id: 'Lutino', nameKey: 'breedCalopsitteLutino', defaultLabel: 'Lutino' },
          { id: 'Face Blanche', nameKey: 'breedCalopsitteFaceBlanche', defaultLabel: 'Face Blanche' },
          { id: 'Perlée', nameKey: 'breedCalopsittePerlee', defaultLabel: 'Perlée' }
        ]
      }
    ]
  }
];

export function getSpeciesById(id: string): SpeciesInfo | undefined {
  return SPECIES_REGISTRY.find(s => s.id === id);
}

export function getCategoryById(speciesId: string, categoryId: string): CategoryInfo | undefined {
  const s = getSpeciesById(speciesId);
  return s?.categories.find(c => c.id === categoryId);
}

export function getBreedsBySpeciesId(speciesId: string): BreedInfo[] {
  const s = getSpeciesById(speciesId);
  if (!s) return [];
  return s.categories.flatMap(c => c.breeds);
}

export function mapOldCategoryToNew(oldCat: string): string {
  if (oldCat === "Couleur" || oldCat === "canari_couleur") return "canari_couleur";
  if (oldCat === "Posture" || oldCat === "canari_posture") return "canari_posture";
  if (oldCat === "Chant" || oldCat === "canari_chant") return "canari_chant";
  return oldCat;
}

export function mapNewCategoryToOld(newCat: string): string {
  if (newCat === "canari_couleur") return "Couleur";
  if (newCat === "canari_posture") return "Posture";
  if (newCat === "canari_chant") return "Chant";
  return newCat;
}

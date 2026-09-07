/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CANARI_PROFILE } from './canari';
import { CHARDONNERET_PROFILE } from './chardonneret';
import { BiologicalSpeciesProfile } from './types';

export * from './types';

function createUnverifiedProfile(
  id: string,
  code: string,
  scientificName: string,
  family: string,
  genus: string,
  names: { fr: string; en: string; ar: string; es: string; it: string }
): BiologicalSpeciesProfile {
  return {
    identity: {
      id,
      code,
      scientificName,
      names,
      family,
      genus,
      origin: { fr: 'Monde', en: 'Worldwide', ar: 'العالم', es: 'Mundial', it: 'Mondiale' },
      status: 'domestique'
    },
    biology: {
      lifespan: 8,
      averageLength: 12,
      minWeight: 15,
      maxWeight: 25,
      sexualDimorphism: { fr: 'Données à compléter', en: 'Data pending', ar: 'قيد التثبت', es: 'A completar', it: 'Da completare' },
      sexualMaturity: { fr: 'Données à compléter', en: 'Data pending', ar: 'قيد التثبت', es: 'A completar', it: 'Da completare' },
      minAgeReproduction: 10,
      recommendedAgeReproduction: 12,
      maxAgeReproduction: 72
    },
    reproduction: {
      breedingSeason: { fr: 'Printemps', en: 'Spring', ar: 'الربيع', es: 'Primavera', it: 'Primavera' },
      incubationPeriod: 14,
      avgEggsPerClutch: 4,
      maxEggsPerClutch: 6,
      avgClutchesPerYear: 2,
      feedingPeriod: 21,
      bandingAge: 6,
      weaningAge: 30
    },
    breeding: {
      bandSize: '3.0 mm',
      minIdealTemp: 15,
      maxIdealTemp: 24,
      minHumidity: 50,
      maxHumidity: 70,
      minCageSize: { fr: 'Cage standard 60cm', en: 'Standard cage 60cm', ar: 'قفص قياسي 60 سم', es: 'Jaula estándar 60cm', it: 'Gabbia standard 60cm' },
      nestType: { fr: 'Nid ouvert', en: 'Open nest', ar: 'عش مفتوح', es: 'Nido abierto', it: 'Nido aperto' },
      difficultyLevel: 'moyen'
    },
    nutrition: {
      mainDiet: { fr: 'Mélange graines', en: 'Seed mix', ar: 'خليط البذور', es: 'Mezcla semillas', it: 'Miscela semi' },
      recommendedSupplements: { fr: 'Pâtée', en: 'Eggfood', ar: 'باتيه', es: 'Pasta', it: 'Pastoncino' },
      vitaminFrequency: { fr: 'Hebdomadaire', en: 'Weekly', ar: 'أسبوعي', es: 'Semanal', it: 'Settimanale' },
      specificNeeds: { fr: 'Données à compléter', en: 'Data pending', ar: 'قيد التثبت', es: 'A completar', it: 'Da completare' }
    },
    health: {
      frequentDiseases: { fr: [], en: [], ar: [], es: [], it: [] },
      frequentParasites: { fr: [], en: [], ar: [], es: [], it: [] },
      sensitiveToCold: true,
      sensitiveToHeat: true,
      preventionRecommendations: { fr: 'Hygiène de la cage', en: 'Cage hygiene', ar: 'نظافة القفص', es: 'Higiene jaula', it: 'Igiene gabbia' }
    },
    management: {
      hybridizationPossible: false,
      compatibleSpecies: [],
      regulatoryStatus: { fr: 'Statut libre', en: 'Unrestricted', ar: 'غير مقيد', es: 'Libre', it: 'Libero' },
      breedingTips: { fr: 'Données à compléter / non validées', en: 'Data pending validation', ar: 'بيانات قيد التثبت', es: 'Datos a completar', it: 'Dati da completare' }
    },
    traceability: {
      validationStatus: 'unverified',
      source: 'Données à compléter / non validées',
      disclaimer: {
        fr: 'Données à compléter / non validées : Profil en cours de structuration scientifique.',
        en: 'Data pending scientific validation.',
        ar: 'بيانات قيد الإكمال والتثبت العلمي.',
        es: 'Datos a completar / no validados científicamente.',
        it: 'Dati da completare / non validati scientificamente.'
      }
    }
  };
}

export const PERRUCHE_PROFILE = createUnverifiedProfile(
  'perruche_ondulee', 'PERR-OND', 'Melopsittacus undulatus', 'Psittaculidae', 'Melopsittacus',
  { fr: 'Perruche Ondulée', en: 'Budgerigar', ar: 'درة استرالية', es: 'Periquito común', it: 'Pappagallino ondulato' }
);

export const AGAPORNIS_PROFILE = createUnverifiedProfile(
  'agapornis', 'AGAP-ROSE', 'Agapornis roseicollis', 'Psittaculidae', 'Agapornis',
  { fr: 'Inséparable / Agapornis', en: 'Lovebird', ar: 'طائر الحب', es: 'Inseparable', it: 'Inseparabile' }
);

export const DIAMANT_MANDARIN_PROFILE = createUnverifiedProfile(
  'diamant_mandarin', 'DIAM-MAN', 'Taeniopygia guttata', 'Estrildidae', 'Taeniopygia',
  { fr: 'Diamant Mandarin', en: 'Zebra Finch', ar: 'زيبرا', es: 'Diamante mandarín', it: 'Diamante mandarino' }
);

export const DIAMANT_GOULD_PROFILE = createUnverifiedProfile(
  'diamant_gould', 'DIAM-GOU', 'Erythrura gouldiae', 'Estrildidae', 'Erythrura',
  { fr: 'Diamant de Gould', en: 'Gouldian Finch', ar: 'حسون กูลเดียน', es: 'Diamante de Gould', it: 'Diamante di Gould' }
);

export const CALOPSITTE_PROFILE = createUnverifiedProfile(
  'calopsitte', 'CALO-ELE', 'Nymphicus hollandicus', 'Cacatuidae', 'Nymphicus',
  { fr: 'Calopsitte Élégante', en: 'Cockatiel', ar: 'كوكاتيل', es: 'Ninfa', it: 'Calopsitta' }
);

export const COLOMBE_PROFILE = createUnverifiedProfile(
  'colombe', 'COLO-DIA', 'Geopelia cuneata', 'Columbidae', 'Geopelia',
  { fr: 'Colombe Diamant', en: 'Diamond Dove', ar: 'حمامة الماس', es: 'Tortolita diamante', it: 'Colombina diamante' }
);

export const BIOLOGICAL_SPECIES_REGISTRY: BiologicalSpeciesProfile[] = [
  CANARI_PROFILE,
  CHARDONNERET_PROFILE,
  PERRUCHE_PROFILE,
  AGAPORNIS_PROFILE,
  DIAMANT_MANDARIN_PROFILE,
  DIAMANT_GOULD_PROFILE,
  CALOPSITTE_PROFILE,
  COLOMBE_PROFILE
];

export function getBiologicalProfileById(id: string): BiologicalSpeciesProfile | undefined {
  return BIOLOGICAL_SPECIES_REGISTRY.find(profile => profile.identity.id === id);
}

export function getBiologicalProfileByCode(code: string): BiologicalSpeciesProfile | undefined {
  return BIOLOGICAL_SPECIES_REGISTRY.find(profile => profile.identity.code === code);
}

export function isSpeciesDocumented(id: string): boolean {
  const profile = getBiologicalProfileById(id);
  return !!profile && profile.traceability?.validationStatus === 'verified';
}

export function getBiologicalTraceability(id: string) {
  const profile = getBiologicalProfileById(id);
  if (profile && profile.traceability) {
    return profile.traceability;
  }
  return {
    validationStatus: 'unverified' as const,
    source: 'Non renseignée',
    revisionDate: undefined,
    author: undefined,
    disclaimer: {
      fr: 'Attention : Espèce non encore documentée dans le référentiel scientifique certifié.',
      en: 'Warning: Species not yet documented in the certified scientific repository.',
      ar: 'تحذير: هذا الفصيل غير موثق بعد في المرجع العلمي المعتمد.',
      es: 'Atención: Especie no documentada aún en el repositorio certificado.',
      it: 'Attenzione: Specie non ancora documentata nel registro certificato.'
    }
  };
}

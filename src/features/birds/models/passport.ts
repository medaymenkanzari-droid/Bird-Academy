/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComCriteriaDefinition {
  id: string;
  name: string;
  maxPoints: number;
  description: string;
}

export const COM_CRITERIA_DEFINITIONS: ComCriteriaDefinition[] = [
  {
    id: 'type_posture',
    name: 'Type & Posture / Morphologie',
    maxPoints: 20,
    description: 'Allure générale, maintien sur le perchoir, angle à 45°, volume corporel équilibré.'
  },
  {
    id: 'variete_lipochrome',
    name: 'Variété & Couleur / Lipochrome',
    maxPoints: 20,
    description: 'Pureté du lipochrome (jaune, rouge, blanc), saturation, absence de reflets indésirables.'
  },
  {
    id: 'dessin_melanine',
    name: 'Dessin / Mélanines & Stries',
    maxPoints: 15,
    description: 'Netteté des stries dorsales, alignement des flancs, pureté du sous-plumage.'
  },
  {
    id: 'plumage',
    name: 'Plumage & Finition',
    maxPoints: 15,
    description: 'Plumage lisse, serré, brillant, exempt de plumes cassées ou ébouriffées.'
  },
  {
    id: 'taille_proportions',
    name: 'Taille & Proportions',
    maxPoints: 10,
    description: 'Conformité à la taille standard de la race (ex. 13-14 cm pour canari couleur).'
  },
  {
    id: 'tete_bec',
    name: 'Tête, Calotte & Bec',
    maxPoints: 10,
    description: 'Forme de la tête, position des yeux vifs, bec court et conique régulier.'
  },
  {
    id: 'condition_maintien',
    name: 'Condition générale & Santé',
    maxPoints: 10,
    description: 'Propreté des pattes et des ongles, vigueur, vivacité et propreté de la cage de concours.'
  }
];

export interface ComEvaluation {
  birdId: number;
  date: string;
  judgeName?: string;
  showName?: string;
  scores: Record<string, number>;
  totalScore: number;
  medalTier?: 'Gold' | 'Silver' | 'Bronze' | 'None';
  comments?: string;
  updatedAt: string;
}

export interface WeightLogEntry {
  id: string;
  birdId: number;
  date: string;
  weightGrams: number;
  notes?: string;
  context?: 'routine' | 'mue' | 'reproduction' | 'maladie' | 'sevrage';
}

export interface BirdPalmaresEntry {
  id: string;
  birdId: number;
  date: string;
  showName: string;
  location?: string;
  sectionCom: string; // e.g. "D-01 (Canaris Lipochromes)"
  scorePoints: number; // out of 100
  rank?: string; // e.g. "1er / Médaille d'Or", "2ème", "Best in Show"
  medal?: 'Gold' | 'Silver' | 'Bronze' | 'Honorable';
  judgeName?: string;
  certificateNumber?: string;
  notes?: string;
}

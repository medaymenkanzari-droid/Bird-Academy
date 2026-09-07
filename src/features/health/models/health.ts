/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sante } from '../../../types';

export type MedicalStatus = 'Scheduled' | 'In Progress' | 'Completed';

export type AdministrationRoute = 
  | 'Gouttes orales (bec)'
  | 'Eau de boisson'
  | 'Pâtée / Aliment'
  | 'Spot-on (nuque/peau)'
  | 'Nébulisation / Spray'
  | 'Injection sous-cutanée'
  | 'Application locale';

export interface MedicalTreatmentItem {
  id: number;
  birdId: number;
  name: string;
  category: Sante['categorie'];
  protocol: string; // e.g. "2 gouttes / bec - 3 jours"
  route: AdministrationRoute | string;
  date: string;
  dueDate?: string;
  status: MedicalStatus;
  notes?: string;
  dosage?: string;
  prescriber?: string;
}

export interface ClinicalNote {
  id: string;
  birdId: number;
  date: string;
  author: string;
  title: string;
  content: string;
  severity: 'normal' | 'attention' | 'critical';
  photoUrl?: string;
  tags?: string[];
  createdAt: string;
}

export interface StandardHealthProtocol {
  id: string;
  title: string;
  category: 'Vermifuge' | 'Antiparasitaire' | 'Vitamines' | 'Mue' | 'Quarantaine' | 'Urgence';
  description: string;
  defaultDosage: string;
  defaultRoute: AdministrationRoute;
  recommendedFrequency: string;
  iconName?: string;
}

export const STANDARD_HEALTH_PROTOCOLS: StandardHealthProtocol[] = [
  {
    id: 'deworming_routine',
    title: 'Protocole Vermifuge Semestriel',
    category: 'Vermifuge',
    description: 'Traitement curatif et préventif contre les vers ronds et nématodes digestifs.',
    defaultDosage: '2 gouttes pures dans le bec (matin) ou 5ml/L d’eau',
    defaultRoute: 'Gouttes orales (bec)',
    recommendedFrequency: 'Printemps & Automne (2 fois par an)'
  },
  {
    id: 'anti_mites_spoton',
    title: 'Traitement Poux Rouges & Acariens',
    category: 'Antiparasitaire',
    description: 'Protection active contre Dermanyssus gallinae et acariens respiratoires.',
    defaultDosage: '1 goutte sur la peau dénudée de la nuque (spot-on)',
    defaultRoute: 'Spot-on (nuque/peau)',
    recommendedFrequency: 'Tous les 3 à 4 mois'
  },
  {
    id: 'vitamins_e_selenium',
    title: 'Cure Fertilité Vitamine E + Sélénium',
    category: 'Vitamines',
    description: 'Stimulation de la spermatogenèse et préparation à la ponte.',
    defaultDosage: '15 gouttes pour 50ml d’eau pendant 10 jours',
    defaultRoute: 'Eau de boisson',
    recommendedFrequency: '4 semaines avant la mise en couple'
  },
  {
    id: 'probiotics_digest',
    title: 'Complexe Probiotiques & Flore',
    category: 'Mue',
    description: 'Régénération du microbiote intestinal post-traitement ou pendant la mue.',
    defaultDosage: '5g par kilo de pâtée aux œufs',
    defaultRoute: 'Pâtée / Aliment',
    recommendedFrequency: '2 fois par semaine en période de mue'
  },
  {
    id: 'quarantine_entry',
    title: 'Protocole Entrée en Quarantaine',
    category: 'Quarantaine',
    description: 'Bilan d’accueil complet pour tout nouvel oiseau acquis à l’extérieur.',
    defaultDosage: 'Isolement 30 jours, contrôle fientes, pesée J0-J15-J30',
    defaultRoute: 'Application locale',
    recommendedFrequency: 'Systématique à l’acquisition'
  }
];

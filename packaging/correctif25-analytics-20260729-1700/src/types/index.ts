/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Canari {
  id: number;
  bague: string; // Unique, required
  nom: string;
  sexe: 'Mâle' | 'Femelle' | 'Indéterminé';
  espece?: string; // Species ID (e.g. 'canari', 'chardonneret_elegant')
  categorie: string; // Category ID or value
  race: string;
  mutation: string;
  couleur_base: string;
  facteur: string;
  couleur: string; // Backwards compatibility / display color summary
  date_naissance: string; // YYYY-MM-DD
  cage_id: number; // Foreign Key to Cage
  pere_id?: number | null; // Foreign Key to Canari (father)
  mere_id?: number | null; // Foreign Key to Canari (mother)
  photo?: string; // Optional base64 or URL
}

export interface Cage {
  id: number;
  nom: string;
  description?: string;
  capacite_max: number; // To check for over-occupation
}

export interface Couple {
  id: number;
  male_id: number; // Foreign Key to Canari
  femelle_id: number; // Foreign Key to Canari
  date_creation: string;
  statut: 'Actif' | 'Dissous';
}

export interface Reproduction {
  id: number;
  couple_id: number; // Foreign Key to Couple
  date_debut: string; // YYYY-MM-DD
  statut: 'En cours' | 'Clôturé';
}

export interface Ponte {
  id: number;
  reproduction_id: number; // Foreign Key to Reproduction
  date: string; // YYYY-MM-DD
  oeufs: number; // number of eggs
  oeufs_fecondes?: number; // for stats
  eclosions?: number; // actual hatchings (for stats & declarations)
  sevrages?: number; // actual weanings
}

export interface Jeune {
  id: number;
  ponte_id: number; // Foreign key to Ponte
  bague?: string; // assigned ring number
  statut: 'En sevrage' | 'Sevré' | 'Décédé';
  date_naissance: string;
}

export interface Sante {
  id: number;
  canari_id: number; // Foreign Key to Canari
  date: string; // YYYY-MM-DD
  traitement: string; // Name of treatment or symptom
  categorie: 'Traitement' | 'Vaccin' | 'Visite Vétérinaire' | 'Symptôme';
  description?: string;
  statut?: 'En attente' | 'Terminé';
}

export interface Alimentation {
  id: number;
  periode: 'Mue' | 'Reproduction' | 'Repos';
  type_aliment: string;
  quantite: string;
  planning_distribution: string; // e.g., "Quotidien", "2 fois par semaine"
  stock_actuel_kg: number;
}

export interface Depense {
  id: number;
  date: string; // YYYY-MM-DD
  montant: number;
  categorie: 'Alimentation' | 'Santé' | 'Matériel' | 'Cages' | 'Autre';
  description: string;
}

export interface Vente {
  id: number;
  canari_id: number; // Foreign Key to Canari
  prix: number;
  date: string; // YYYY-MM-DD
  acheteur: string;
  description?: string;
}

export interface ElevageEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'eclosion' | 'sevrage' | 'sante' | 'alimentation' | 'autre';
  referenceId: number;
  completed: boolean;
}

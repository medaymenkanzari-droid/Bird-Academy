/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Cage, Couple, Reproduction, Ponte, Jeune, Sante, Alimentation, Depense, Vente } from '../types';

export const INITIAL_CAGES: Cage[] = [
  { id: 1, nom: "Cage d'Élevage 01", description: "Cage individuelle standard double compartiment", capacite_max: 4 },
  { id: 2, nom: "Cage d'Élevage 02", description: "Cage individuelle standard double compartiment", capacite_max: 4 },
  { id: 3, nom: "Grande Volière Intérieure", description: "Volière pour jeunes et repos", capacite_max: 20 },
  { id: 4, nom: "Cage de Quarantaine", description: "Petite cage pour nouveaux canaris", capacite_max: 2 }
];

export const INITIAL_CANARIS: Canari[] = [
  {
    id: 1,
    bague: "FR-2025-092",
    nom: "Plume d'Or",
    sexe: "Mâle",
    categorie: "Posture",
    race: "Gloster Fancy",
    mutation: "Classique",
    couleur_base: "Jaune",
    facteur: "Schimmel",
    couleur: "Jaune Shimmel",
    date_naissance: "2025-04-12",
    cage_id: 1,
    pere_id: null,
    mere_id: null,
    isDemo: true
  },
  {
    id: 2,
    bague: "FR-2025-104",
    nom: "Seringat",
    sexe: "Femelle",
    categorie: "Posture",
    race: "Gloster Fancy",
    mutation: "Classique",
    couleur_base: "Vert",
    facteur: "Intensif",
    couleur: "Vert Consort",
    date_naissance: "2025-05-18",
    cage_id: 1,
    pere_id: null,
    mere_id: null,
    isDemo: true
  },
  {
    id: 3,
    bague: "FR-2025-301",
    nom: "Rubis",
    sexe: "Mâle",
    categorie: "Couleur",
    race: "Canari de Couleur",
    mutation: "Classique",
    couleur_base: "Rouge",
    facteur: "Intensif",
    couleur: "Rouge Intensif",
    date_naissance: "2025-03-22",
    cage_id: 2,
    pere_id: null,
    mere_id: null,
    isDemo: true
  },
  {
    id: 4,
    bague: "FR-2025-305",
    nom: "Aurore",
    sexe: "Femelle",
    categorie: "Couleur",
    race: "Canari de Couleur",
    mutation: "Classique",
    couleur_base: "Rouge",
    facteur: "Schimmel",
    couleur: "Rouge Schimmel",
    date_naissance: "2025-03-29",
    cage_id: 2,
    pere_id: null,
    mere_id: null,
    isDemo: true
  },
  {
    id: 5,
    bague: "FR-2026-001",
    nom: "Junior",
    sexe: "Indéterminé",
    categorie: "Posture",
    race: "Gloster Fancy",
    mutation: "Classique",
    couleur_base: "Jaune-Vert",
    facteur: "Mosaïque",
    couleur: "Panaché Vert/Jaune",
    date_naissance: "2026-05-10",
    cage_id: 3,
    pere_id: 1,
    mere_id: 2,
    isDemo: true
  },
  {
    id: 6,
    bague: "FR-2024-512",
    nom: "L'Ancien",
    sexe: "Mâle",
    categorie: "Posture",
    race: "Yorkshire",
    mutation: "Classique",
    couleur_base: "Blanc",
    facteur: "Non applicable",
    couleur: "Blanc Pur",
    date_naissance: "2024-06-15",
    cage_id: 3,
    pere_id: null,
    mere_id: null,
    isDemo: true
  },
  {
    id: 7,
    bague: "FR-2025-777",
    nom: "Chardonneret d'Or",
    sexe: "Mâle",
    espece: "chardonneret_elegant",
    categorie: "chardonneret_classique",
    race: "Chardonneret élégant classique",
    mutation: "Classique",
    couleur_base: "Cannelle",
    facteur: "Non applicable",
    couleur: "Masque Rouge / Dos cannelle",
    date_naissance: "2025-06-10",
    cage_id: 3,
    pere_id: null,
    mere_id: null,
    isDemo: true
  },
  {
    id: 8,
    bague: "FR-2026-111",
    nom: "Classic Jaune",
    sexe: "Femelle",
    espece: "canari",
    categorie: "canari_couleur",
    race: "Classique",
    mutation: "Classique",
    couleur_base: "Jaune",
    facteur: "Intensif",
    couleur: "Jaune Classique",
    date_naissance: "2026-02-15",
    cage_id: 3,
    pere_id: null,
    mere_id: null,
    isDemo: true
  }
];

export const INITIAL_COUPLES: Couple[] = [
  {
    id: 1,
    male_id: 1, // Plume d'Or
    femelle_id: 2, // Seringat
    date_creation: "2026-03-10",
    statut: "Actif"
  },
  {
    id: 2,
    male_id: 3, // Rubis
    femelle_id: 4, // Aurore
    date_creation: "2026-03-15",
    statut: "Actif"
  }
];

export const INITIAL_REPRODUCTIONS: Reproduction[] = [
  {
    id: 1,
    couple_id: 1, // Plume d'Or & Seringat
    date_debut: "2026-05-01",
    statut: "Clôturé"
  },
  {
    id: 2,
    couple_id: 2, // Rubis & Aurore
    date_debut: "2026-07-01",
    statut: "En cours"
  }
];

export const INITIAL_PONTES: Ponte[] = [
  {
    id: 1,
    reproduction_id: 1,
    date: "2026-05-05",
    oeufs: 4,
    oeufs_fecondes: 3,
    eclosions: 3,
    sevrages: 1 // Junior est le survivant
  },
  {
    id: 2,
    reproduction_id: 2,
    date: "2026-07-02", // Laying on July 2nd
    oeufs: 5,
    oeufs_fecondes: 4,
    eclosions: 0,
    sevrages: 0
  }
];

export const INITIAL_JEUNES: Jeune[] = [
  {
    id: 1,
    ponte_id: 1,
    bague: "FR-2026-001", // Junior
    statut: "Sevré",
    date_naissance: "2026-05-18"
  },
  {
    id: 2,
    ponte_id: 1,
    bague: undefined,
    statut: "Décédé",
    date_naissance: "2026-05-18"
  }
];

export const INITIAL_SANTE: Sante[] = [
  {
    id: 1,
    canari_id: 1,
    date: "2026-04-05",
    traitement: "Anti-parasitaire d'automne",
    categorie: "Traitement",
    description: "Application d'une goutte d'Ivomec sur la nuque.",
    statut: "Terminé"
  },
  {
    id: 2,
    canari_id: 3,
    date: "2026-06-12",
    traitement: "Cure de Vitamines E",
    categorie: "Vaccin",
    description: "Préparation à l'accouplement pendant 10 jours.",
    statut: "Terminé"
  },
  {
    id: 3,
    canari_id: 2,
    date: "2026-07-20", // Planned
    traitement: "Rappel vermifuge d'été",
    categorie: "Traitement",
    description: "Administration de vermifuge liquide dans l'eau de boisson.",
    statut: "En attente"
  },
  {
    id: 4,
    canari_id: 4,
    date: "2026-07-07", // Overdue!
    traitement: "Traitement anti-poux",
    categorie: "Traitement",
    description: "Vaporisation des nids et perchoirs pour éliminer les acariens.",
    statut: "En attente"
  },
  {
    id: 5,
    canari_id: 1,
    date: "2026-07-10", // Coming up in 2 days
    traitement: "Visite de contrôle plumes",
    categorie: "Visite Vétérinaire",
    description: "Vérifier la bonne repousse des rémiges après la mue partielle.",
    statut: "En attente"
  }
];

export const INITIAL_ALIMENTATION: Alimentation[] = [
  {
    id: 1,
    periode: "Reproduction",
    type_aliment: "Pâtée d'élevage + Graines enrichies + Brocoli",
    quantite: "Pâtée à volonté renouvelée tous les jours",
    planning_distribution: "Quotidien",
    stock_actuel_kg: 4.5
  },
  {
    id: 2,
    periode: "Mue",
    type_aliment: "Mélange de graines spécial mue + Concombre + Vitamines",
    quantite: "15g par canari par jour",
    planning_distribution: "Quotidien",
    stock_actuel_kg: 10.0
  },
  {
    id: 3,
    periode: "Repos",
    type_aliment: "Graines alpiste + Pomme (2 fois/semaine) + Bloc minéral",
    quantite: "12g par canari",
    planning_distribution: "Tous les 2 jours",
    stock_actuel_kg: 15.0
  }
];

export const INITIAL_DEPENSES: Depense[] = [
  {
    id: 1,
    date: "2026-03-01",
    montant: 45.0,
    categorie: "Alimentation",
    description: "Sac de 20kg de graines d'élevage"
  },
  {
    id: 2,
    date: "2026-03-12",
    montant: 120.0,
    categorie: "Cages",
    description: "Achat d'une cage double d'élevage démontable"
  },
  {
    id: 3,
    date: "2026-05-15",
    montant: 18.5,
    categorie: "Santé",
    description: "Flacon de complexe vitaminé et vermifuge"
  },
  {
    id: 4,
    date: "2026-06-25",
    montant: 25.0,
    categorie: "Matériel",
    description: "Baignoires externes, abreuvoirs et nids en plastique"
  }
];

export const INITIAL_VENTES: Vente[] = [
  {
    id: 1,
    canari_id: 6, // L'Ancien is registered as sold or we can sell another canari
    prix: 60.0,
    date: "2026-07-05",
    acheteur: "Jean-Pierre Durand (Éleveur amateur)",
    description: "Cession d'un mâle Yorkshire blanc de 2024"
  }
];

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Facility {
  id: string; // UUID
  nom: string;
  description?: string;
  statut: 'Actif' | 'Inactif' | 'En maintenance' | string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  customFields: Record<string, any>;
}

export interface Zone {
  id: string; // UUID
  facilityId: string; // Parent Facility
  nom: string;
  description?: string;
  statut: 'Actif' | 'Inactif' | string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isQuarantine?: boolean;
  customFields: Record<string, any>;
}

export interface Aviary {
  id: string; // UUID
  zoneId: string; // Parent Zone
  nom: string;
  description?: string;
  statut: 'Actif' | 'Inactif' | string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  capacite_max: number;
  customFields: Record<string, any>;
}

export interface HabitatCage {
  id: string; // UUID
  zoneId: string; // Parent Zone
  aviaryId?: string; // Optional Parent Aviary (if Cage is inside an Aviary)
  nom: string;
  description?: string;
  statut: 'Actif' | 'Inactif' | 'Nettoyage' | string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  capacite_max: number;
  customFields: Record<string, any>;
}

export interface Compartment {
  id: string; // UUID
  cageId: string; // Parent Cage
  nom: string;
  description?: string;
  statut: 'Actif' | 'Inactif' | string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  capacite_max: number;
  customFields: Record<string, any>;
}

export interface QuarantineArea {
  id: string; // UUID
  facilityId: string; // Parent Facility
  nom: string;
  description?: string;
  statut: 'Actif' | 'Inactif' | string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  capacite_max: number;
  customFields: Record<string, any>;
}

export interface QuarantineRecord {
  id: string; // UUID
  birdId: number; // Linked Canari ID
  quarantineAreaId: string; // Linked QuarantineArea
  dateEntree: string; // YYYY-MM-DD
  dureePrevue: number; // in days
  dateSortieEstimee: string; // YYYY-MM-DD
  dateSortieReelle?: string; // YYYY-MM-DD
  raison: string;
  traitements: string; // treatment list
  observations: string;
  statut: 'En cours' | 'Terminé' | 'Prolongé';
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface DeplacementRecord {
  id: string; // UUID
  birdId: number; // Linked Canari ID
  origineType: 'Facility' | 'Zone' | 'Aviary' | 'Cage' | 'Compartment' | 'Quarantine' | 'Inconnu';
  origineId: string; // ID or 'Inconnu'
  origineNom: string;
  destinationType: 'Facility' | 'Zone' | 'Aviary' | 'Cage' | 'Compartment' | 'Quarantine';
  destinationId: string;
  destinationNom: string;
  date: string; // YYYY-MM-DD
  motif: string;
  utilisateur: string; // e.g., "Admin", "Éleveur"
  commentaire?: string;
  createdAt: string;
}

// Smart QR Code Models
export type QRCodeType = 'FACILITY' | 'ZONE' | 'AVIARY' | 'CAGE' | 'COMPARTMENT' | 'QUARANTINE';

export interface QRCode {
  id: string; // UUID
  entityType: QRCodeType;
  entityId: string;
  code: string; // BA:CAGE:UUID format
  createdAt: string;
}

export interface QRPrintTemplate {
  id: string;
  nom: string;
  size: 'small' | 'medium' | 'large';
  showLabel: boolean;
  showLogo: boolean;
}

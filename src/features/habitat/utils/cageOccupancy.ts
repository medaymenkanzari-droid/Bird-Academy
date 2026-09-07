/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - CENTRALIZED CAGE OCCUPANCY ENGINE
 * Computes exact real-time cage capacity, bird count, and occupancy percentage.
 * Single source of truth across all components (Cages.tsx, HabitatComponent.tsx, HabitatEngine.ts).
 */

import { Cage, Canari, Compartment } from '../../../types';

export interface CageOccupancyResult {
  presentBirds: Canari[];
  capacity: number;
  occupancyPercentage: number;
  isOverpopulated: boolean;
}

/**
 * Centralized function to compute real cage occupancy across all ID representations.
 * Handles numeric `cage_id`, string `cageId`, compartment assignments, and unassigned state.
 */
export function calculateCageOccupancy(
  cage: Cage | { id: number | string; capacite_max?: number; maxCapacity?: number },
  birds: Canari[],
  compartments: Compartment[] = []
): CageOccupancyResult {
  if (!cage) {
    return { presentBirds: [], capacity: 0, occupancyPercentage: 0, isOverpopulated: false };
  }

  const cageIdRaw = cage.id;
  const cageIdStr = String(cage.id).trim().toLowerCase();

  // Find all compartment IDs belonging to this cage
  const compIds = (compartments || [])
    .filter(cp => String(cp.cageId).trim().toLowerCase() === cageIdStr)
    .map(cp => cp.id);

  const activeBirds = (birds || []).filter(b => {
    if (!b) return false;
    // Exclude archived, deceased, or sold birds
    if (b.archived || b.statut_sante === 'Décédé' || b.statut_sante === 'Vendu' || (b as any).statut === 'Décédé' || (b as any).statut === 'Vendu') return false;

    const bCageId = b.cageId !== undefined && b.cageId !== null ? String(b.cageId).trim().toLowerCase() : undefined;
    const bCage_id = b.cage_id !== undefined && b.cage_id !== null ? String(b.cage_id).trim().toLowerCase() : undefined;

    // 1. Direct string / primitive ID match
    const directMatch = 
      bCageId === cageIdStr || 
      bCage_id === cageIdStr ||
      (typeof cageIdRaw === 'number' && (b.cage_id === cageIdRaw || (b.cageId as any) === cageIdRaw));

    // 2. Exact string match fallback if cageIdStr matches bCage_id / bCageId
    let exactMatch = false;
    if (!directMatch) {
      if (bCage_id !== undefined && (bCage_id === cageIdStr || cageIdStr === `cage-${bCage_id}`)) {
        exactMatch = true;
      } else if (bCageId !== undefined && (bCageId === cageIdStr || cageIdStr === `cage-${bCageId}`)) {
        exactMatch = true;
      }
    }

    // 3. Compartment match
    const matchesCompartment = b.compartmentId ? compIds.includes(b.compartmentId) : false;

    return directMatch || exactMatch || matchesCompartment;
  });

  const count = activeBirds.length;
  const rawCapacity = (cage as any).capacite_max ?? (cage as any).maxCapacity ?? 0;
  const capacity = Math.max(0, rawCapacity);

  let occupancyPercentage = 0;
  if (capacity > 0) {
    occupancyPercentage = Math.round((count / capacity) * 100);
  } else if (count > 0) {
    occupancyPercentage = 100;
  }

  const isOverpopulated = capacity > 0 ? count > capacity : false;

  if (process.env.DEBUG_HABITAT) {
    console.log(`[CAGE-DATA-06] calculateCageOccupancy for cageId=${cage.id}: capacity=${capacity}, presentBirds=${count}, occupancyPercentage=${occupancyPercentage}%`);
  }

  return {
    presentBirds: activeBirds,
    capacity,
    occupancyPercentage,
    isOverpopulated
  };
}

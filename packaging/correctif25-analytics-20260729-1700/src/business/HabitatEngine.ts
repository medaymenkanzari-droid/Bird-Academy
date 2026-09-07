/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Facility, Zone, Aviary, HabitatCage, Compartment, QuarantineArea, Canari 
} from '../types';
import { HabitatRepository } from '../features/habitat/repositories/HabitatRepository';

export interface HabitatStats {
  capaciteTotale: number;
  oiseauxPresents: number;
  placesDisponibles: number;
  tauxOccupation: number; // percentage (e.g., 85)
  isOverloaded: boolean;
}

export interface HabitatValidationError {
  field: string;
  message: string;
}

export class HabitatEngine {
  /**
   * Calculates statistics for a given habitat entity.
   */
  static calculateStats(
    entityType: 'facility' | 'zone' | 'aviary' | 'cage' | 'compartment' | 'quarantineArea',
    entityId: string,
    birds: Canari[]
  ): HabitatStats {
    birds = birds.filter(bird => !bird.archived && bird.statut_sante !== 'Décédé');
    let capaciteTotale = 0;
    let oiseauxPresents = 0;

    const facilities = HabitatRepository.getAll<Facility>('facility');
    const zones = HabitatRepository.getAll<Zone>('zone');
    const aviaries = HabitatRepository.getAll<Aviary>('aviary');
    const cages = HabitatRepository.getAll<HabitatCage>('cage');
    const compartments = HabitatRepository.getAll<Compartment>('compartment');
    const quarantineAreas = HabitatRepository.getAll<QuarantineArea>('quarantineArea');

    // Helper: find all child IDs
    const getZoneIds = (facId: string) => zones.filter(z => z.facilityId === facId).map(z => z.id);
    const getAviaryIdsInZone = (zId: string) => aviaries.filter(a => a.zoneId === zId).map(a => a.id);
    const getCageIdsInZone = (zId: string) => cages.filter(c => c.zoneId === zId).map(c => c.id);
    const getQuarantineAreaIdsInZone = (zId: string) => quarantineAreas.filter(q => q.facilityId === entityId).map(q => q.id); // Quarantine areas belong to Facility/Zone

    if (entityType === 'compartment') {
      const comp = compartments.find(c => c.id === entityId);
      capaciteTotale = comp ? Math.max(0, comp.capacite_max) : 0;
      oiseauxPresents = birds.filter(b => b.compartmentId === entityId).length;

    } else if (entityType === 'cage') {
      const cage = cages.find(c => c.id === entityId);
      capaciteTotale = cage ? Math.max(0, cage.capacite_max) : 0;
      
      // Birds in cage directly + birds in its compartments
      const compIds = compartments.filter(cp => cp.cageId === entityId).map(cp => cp.id);
      oiseauxPresents = birds.filter(b => 
        String(b.cageId) === entityId || 
        String(b.cage_id) === entityId || 
        (b.compartmentId && compIds.includes(b.compartmentId))
      ).length;

    } else if (entityType === 'aviary') {
      const aviary = aviaries.find(a => a.id === entityId);
      capaciteTotale = aviary ? Math.max(0, aviary.capacite_max) : 0;
      
      // Birds in aviary directly + birds in cages inside this aviary
      const cageIds = cages.filter(c => c.aviaryId === entityId).map(c => c.id);
      oiseauxPresents = birds.filter(b => 
        b.aviaryId === entityId || 
        (b.cageId && cageIds.includes(String(b.cageId)))
      ).length;

    } else if (entityType === 'quarantineArea') {
      const qArea = quarantineAreas.find(q => q.id === entityId);
      capaciteTotale = qArea ? Math.max(0, qArea.capacite_max) : 0;
      // A health status alone does not identify a physical quarantine area.
      // Counting it here would duplicate an unassigned bird in every area.
      oiseauxPresents = birds.filter(b => b.quarantineId === entityId).length;

    } else if (entityType === 'zone') {
      const zone = zones.find(z => z.id === entityId);
      if (zone) {
        // Capacity is the sum of all aviaries and cages inside this zone (that are not inside an aviary to avoid double counting)
        const zoneAviaries = aviaries.filter(a => a.zoneId === entityId && !a.isArchived);
        const zoneCages = cages.filter(c => c.zoneId === entityId && !c.aviaryId && !c.isArchived);
        
        const aviaryCap = zoneAviaries.reduce((sum, a) => sum + Math.max(0, a.capacite_max), 0);
        const cageCap = zoneCages.reduce((sum, c) => sum + Math.max(0, c.capacite_max), 0);
        
        capaciteTotale = aviaryCap + cageCap;
        
        // Birds inside this zone or its children
        const aviaryIds = zoneAviaries.map(a => a.id);
        const cageIds = cages.filter(c => c.zoneId === entityId).map(c => c.id);
        
        oiseauxPresents = birds.filter(b => 
          b.zoneId === entityId || 
          (b.aviaryId && aviaryIds.includes(b.aviaryId)) ||
          (b.cageId && cageIds.includes(String(b.cageId))) ||
          (b.cage_id && cageIds.includes(String(b.cage_id)))
        ).length;
      }

    } else if (entityType === 'facility') {
      const fac = facilities.find(f => f.id === entityId);
      if (fac) {
        const facZones = zones.filter(z => z.facilityId === entityId && !z.isArchived);
        facZones.forEach(z => {
          const zoneStats = this.calculateStats('zone', z.id, birds);
          capaciteTotale += zoneStats.capaciteTotale;
        });

        // Add any separate Quarantine Areas in this facility
        const facQAreas = quarantineAreas.filter(q => q.facilityId === entityId && !q.isArchived);
        capaciteTotale += facQAreas.reduce((sum, q) => sum + Math.max(0, q.capacite_max), 0);

        const zoneIds = facZones.map(z => z.id);
        const qAreaIds = facQAreas.map(q => q.id);

        oiseauxPresents = birds.filter(b => 
          b.facilityId === entityId ||
          (b.zoneId && zoneIds.includes(b.zoneId)) ||
          (b.quarantineId && qAreaIds.includes(b.quarantineId))
        ).length;
      }
    }

    const placesDisponibles = Math.max(0, capaciteTotale - oiseauxPresents);
    const tauxOccupation = capaciteTotale > 0 ? Math.round((oiseauxPresents / capaciteTotale) * 100) : 0;
    const isOverloaded = oiseauxPresents > capaciteTotale;

    return {
      capaciteTotale,
      oiseauxPresents,
      placesDisponibles,
      tauxOccupation,
      isOverloaded
    };
  }

  /**
   * Validates capacity (must be non-negative)
   */
  static validateCapacity(capacite: number): HabitatValidationError[] {
    const errors: HabitatValidationError[] = [];
    if (capacite < 0) {
      errors.push({
        field: 'capacite_max',
        message: 'La capacité maximale ne peut pas être négative.'
      });
    }
    return errors;
  }

  /**
   * Validates structural relationships to prevent cycles and invalid parenting.
   */
  static validateStructure(
    entityType: 'facility' | 'zone' | 'aviary' | 'cage' | 'compartment' | 'quarantineArea',
    data: any
  ): HabitatValidationError[] {
    const errors: HabitatValidationError[] = [];

    // Capacity check
    if (data.capacite_max !== undefined) {
      errors.push(...this.validateCapacity(data.capacite_max));
    }

    // Name check
    if (!data.nom || data.nom.trim() === '') {
      errors.push({
        field: 'nom',
        message: 'Le nom est obligatoire.'
      });
    }

    // Hierarchical consistency checks
    if (entityType === 'zone') {
      if (!data.facilityId) {
        errors.push({
          field: 'facilityId',
          message: 'Une zone doit appartenir à un élevage (facilityId).'
        });
      } else {
        const fac = HabitatRepository.getById<Facility>('facility', data.facilityId);
        if (!fac) {
          errors.push({
            field: 'facilityId',
            message: "L'élevage parent spécifié n'existe pas."
          });
        }
      }
    }

    if (entityType === 'aviary') {
      if (!data.zoneId) {
        errors.push({
          field: 'zoneId',
          message: 'Une volière doit appartenir à une zone (zoneId).'
        });
      } else {
        const zone = HabitatRepository.getById<Zone>('zone', data.zoneId);
        if (!zone) {
          errors.push({
            field: 'zoneId',
            message: "La zone parente spécifiée n'existe pas."
          });
        }
      }
    }

    if (entityType === 'cage') {
      if (!data.zoneId) {
        errors.push({
          field: 'zoneId',
          message: 'Une cage doit appartenir à une zone (zoneId).'
        });
      } else {
        const zone = HabitatRepository.getById<Zone>('zone', data.zoneId);
        if (!zone) {
          errors.push({
            field: 'zoneId',
            message: "La zone parente spécifiée n'existe pas."
          });
        }
      }

      // If in an Aviary, the Aviary must belong to the same zone as the cage.
      if (data.aviaryId) {
        const aviary = HabitatRepository.getById<Aviary>('aviary', data.aviaryId);
        if (!aviary) {
          errors.push({
            field: 'aviaryId',
            message: "La volière parente spécifiée n'existe pas."
          });
        } else if (aviary.zoneId !== data.zoneId) {
          errors.push({
            field: 'aviaryId',
            message: "La volière doit appartenir à la même zone que la cage."
          });
        }
      }
    }

    if (entityType === 'compartment') {
      if (!data.cageId) {
        errors.push({
          field: 'cageId',
          message: 'Un compartiment doit appartenir à une cage (cageId).'
        });
      } else {
        const cage = HabitatRepository.getById<HabitatCage>('cage', data.cageId);
        if (!cage) {
          errors.push({
            field: 'cageId',
            message: "La cage parente spécifiée n'existe pas."
          });
        }
      }
    }

    if (entityType === 'quarantineArea') {
      if (!data.facilityId) {
        errors.push({
          field: 'facilityId',
          message: 'Une zone de quarantaine doit être rattachée à un élevage.'
        });
      } else {
        const fac = HabitatRepository.getById<Facility>('facility', data.facilityId);
        if (!fac) {
          errors.push({
            field: 'facilityId',
            message: "L'élevage spécifié n'existe pas."
          });
        }
      }
    }

    return errors;
  }

  /**
   * Prevents invalid bird assignments (e.g. overcapacity or archived habitats).
   */
  static validateBirdAssignment(
    bird: Canari,
    targetType: 'facility' | 'zone' | 'aviary' | 'cage' | 'compartment' | 'quarantineArea',
    targetId: string,
    birds: Canari[]
  ): HabitatValidationError[] {
    const errors: HabitatValidationError[] = [];

    if (bird.archived || bird.statut_sante === 'Décédé') {
      errors.push({
        field: 'birdId',
        message: "Impossible d'affecter un oiseau archivé ou décédé à un habitat."
      });
      return errors;
    }

    if (targetType === 'facility') {
      const facility = HabitatRepository.getById<Facility>('facility', targetId);
      if (!facility) {
        errors.push({ field: 'facilityId', message: "L'élevage spécifié n'existe pas." });
      } else if (facility.isArchived) {
        errors.push({ field: 'facilityId', message: "Impossible d'affecter un oiseau à un élevage archivé." });
      }

    } else if (targetType === 'zone') {
      const zone = HabitatRepository.getById<Zone>('zone', targetId);
      if (!zone) {
        errors.push({ field: 'zoneId', message: "La zone spécifiée n'existe pas." });
      } else if (zone.isArchived) {
        errors.push({ field: 'zoneId', message: "Impossible d'affecter un oiseau à une zone archivée." });
      }

    } else if (targetType === 'compartment') {
      const comp = HabitatRepository.getById<Compartment>('compartment', targetId);
      if (!comp) {
        errors.push({ field: 'compartmentId', message: "Le compartiment spécifié n'existe pas." });
      } else {
        if (comp.isArchived) {
          errors.push({ field: 'compartmentId', message: "Impossible d'affecter un oiseau à un compartiment archivé." });
        }
        const stats = this.calculateStats('compartment', targetId, birds);
        if (stats.placesDisponibles <= 0 && bird.compartmentId !== targetId) {
          errors.push({ field: 'compartmentId', message: "Le compartiment a atteint sa capacité maximale." });
        }
      }

    } else if (targetType === 'cage') {
      const cage = HabitatRepository.getById<HabitatCage>('cage', targetId);
      if (!cage) {
        errors.push({ field: 'cageId', message: "La cage spécifiée n'existe pas." });
      } else {
        if (cage.isArchived) {
          errors.push({ field: 'cageId', message: "Impossible d'affecter un oiseau à une cage archivée." });
        }
        const stats = this.calculateStats('cage', targetId, birds);
        const isCurrentCage = String(bird.cageId) === targetId || String(bird.cage_id) === targetId;
        if (stats.placesDisponibles <= 0 && !isCurrentCage) {
          errors.push({ field: 'cageId', message: "La cage a atteint sa capacité maximale." });
        }
      }

    } else if (targetType === 'aviary') {
      const aviary = HabitatRepository.getById<Aviary>('aviary', targetId);
      if (!aviary) {
        errors.push({ field: 'aviaryId', message: "La volière spécifiée n'existe pas." });
      } else {
        if (aviary.isArchived) {
          errors.push({ field: 'aviaryId', message: "Impossible d'affecter un oiseau à une volière archivée." });
        }
        const stats = this.calculateStats('aviary', targetId, birds);
        if (stats.placesDisponibles <= 0 && bird.aviaryId !== targetId) {
          errors.push({ field: 'aviaryId', message: "La volière a atteint sa capacité maximale." });
        }
      }

    } else if (targetType === 'quarantineArea') {
      const qArea = HabitatRepository.getById<QuarantineArea>('quarantineArea', targetId);
      if (!qArea) {
        errors.push({ field: 'quarantineId', message: "La zone de quarantaine spécifiée n'existe pas." });
      } else {
        if (qArea.isArchived) {
          errors.push({ field: 'quarantineId', message: "La zone de quarantaine spécifiée est archivée." });
        }
        const stats = this.calculateStats('quarantineArea', targetId, birds);
        if (stats.placesDisponibles <= 0 && bird.quarantineId !== targetId) {
          errors.push({ field: 'quarantineId', message: "La zone de quarantaine a atteint sa capacité maximale." });
        }
      }
    }

    return errors;
  }
}

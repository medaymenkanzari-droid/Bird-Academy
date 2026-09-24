/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirdRepository, BirdFilterCriteria } from '../repositories/BirdRepository';
import { BirdEngine, BirdValidationError } from '../../../business/BirdEngine';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { ReproductionRepository } from '../../reproduction/repositories/ReproductionRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { 
  Canari, DeplacementRecord, QuarantineRecord, HabitatCage, Zone, 
  Aviary, QuarantineArea, Compartment, Facility 
} from '../../../types';
import { CapabilityResolver } from '../../subscription/services/CapabilityResolver';

export interface BirdServiceResponse<T = any> {
  success: boolean;
  message?: string;
  errors?: BirdValidationError[];
  data?: T;
}

export class BirdService {
  /**
   * Resolves and normalizes bird location attributes (cage_id, cageId, zoneId, facilityId).
   */
  public static resolveBirdLocation(bird: Partial<Canari>): void {
    const cageIdRaw = bird.cageId !== undefined && bird.cageId !== null && bird.cageId !== '' ? String(bird.cageId) : undefined;
    const cageNumId = bird.cage_id !== undefined && bird.cage_id !== null && (bird.cage_id as any) !== '' ? Number(bird.cage_id) : undefined;

    // 1. If bird is in a Quarantine area
    if (bird.quarantineId) {
      bird.cageId = undefined;
      bird.cage_id = undefined;
      const qArea = HabitatRepository.getById<QuarantineArea>('quarantineArea', bird.quarantineId);
      if (qArea?.facilityId) {
        bird.facilityId = qArea.facilityId;
      }
      return;
    }

    // 2. If bird is in an Aviary
    if (bird.aviaryId) {
      bird.cageId = undefined;
      bird.cage_id = undefined;
      const aviary = HabitatRepository.getById<Aviary>('aviary', bird.aviaryId);
      if (aviary?.zoneId) {
        bird.zoneId = aviary.zoneId;
        const zone = HabitatRepository.getById<Zone>('zone', aviary.zoneId);
        if (zone?.facilityId) {
          bird.facilityId = zone.facilityId;
        }
      }
      return;
    }

    // 3. If bird is in a Compartment
    if (bird.compartmentId) {
      const comp = HabitatRepository.getById<Compartment>('compartment', bird.compartmentId);
      if (comp?.cageId) {
        bird.cageId = comp.cageId;
        const numId = parseInt(comp.cageId, 10);
        bird.cage_id = !isNaN(numId) ? numId : bird.cage_id;
        const cage = HabitatRepository.getById<HabitatCage>('cage', comp.cageId);
        if (cage?.zoneId) {
          bird.zoneId = cage.zoneId;
          const zone = HabitatRepository.getById<Zone>('zone', cage.zoneId);
          if (zone?.facilityId) bird.facilityId = zone.facilityId;
        }
      }
      return;
    }

    // 4. If no cage specified
    if (!cageIdRaw && (cageNumId === undefined || isNaN(cageNumId))) {
      bird.cageId = undefined;
      bird.cage_id = undefined;
      if (bird.zoneId) {
        const zone = HabitatRepository.getById<Zone>('zone', bird.zoneId);
        if (zone?.facilityId) bird.facilityId = zone.facilityId;
      } else {
        bird.zoneId = undefined;
        bird.facilityId = undefined;
      }
      return;
    }

    // 5. Standard Cage matching (V2 + Legacy)
    const v2Cages = HabitatRepository.getAll<HabitatCage>('cage');
    let matchedCage = v2Cages.find(c => 
      (cageIdRaw && (c.id === cageIdRaw || c.id.toLowerCase() === cageIdRaw.toLowerCase())) ||
      (cageNumId !== undefined && (c.id === String(cageNumId) || parseInt(c.id, 10) === cageNumId))
    );

    if (!matchedCage && cageNumId !== undefined) {
      const legacyCages = HabitatRepository.getAllLegacy();
      const legacyCage = legacyCages.find(c => c.id === cageNumId);
      if (legacyCage) {
        matchedCage = v2Cages.find(c => c.id === String(legacyCage.id));
      }
    }

    if (matchedCage) {
      bird.cageId = matchedCage.id;
      const numId = parseInt(matchedCage.id, 10);
      bird.cage_id = !isNaN(numId) ? numId : cageNumId;
      bird.zoneId = matchedCage.zoneId || 'zone_default';

      if (bird.zoneId) {
        const zone = HabitatRepository.getById<Zone>('zone', bird.zoneId);
        if (zone) {
          bird.facilityId = zone.facilityId || 'fac_default';
        } else {
          bird.facilityId = 'fac_default';
        }
      }
    } else {
      if (cageIdRaw) {
        bird.cageId = cageIdRaw;
        const numId = parseInt(cageIdRaw, 10);
        if (!isNaN(numId)) bird.cage_id = numId;
        bird.zoneId = 'zone_default';
        bird.facilityId = 'fac_default';
      } else if (cageNumId !== undefined && !isNaN(cageNumId)) {
        bird.cage_id = cageNumId;
        bird.cageId = String(cageNumId);
        bird.zoneId = 'zone_default';
        bird.facilityId = 'fac_default';
      }
    }
  }

  /**
   * Retrieves all birds.
   */
  static getAll(includeArchived = false): Canari[] {
    return BirdRepository.getAll(includeArchived);
  }

  static getBirds(includeArchived = false): Canari[] {
    return this.getAll(includeArchived);
  }

  /**
   * Retrieves a bird by ID.
   */
  static getById(id: number): Canari | undefined {
    return BirdRepository.getById(id);
  }

  /**
   * Creates a new bird with validation and activity logging.
   */
  static create(bird: Omit<Canari, 'id'>): BirdServiceResponse<Canari> {
    if (!CapabilityResolver.canCreateBird()) {
      const limit = CapabilityResolver.getBirdLimitForCurrentPlan();
      return {
        success: false,
        message: `Limite d'oiseaux atteinte pour le plan actuel (${limit} oiseaux en plan FREE). Passez au plan supérieur.`
      };
    }

    const preparedBird = BirdEngine.prepareForCreation(bird);
    this.resolveBirdLocation(preparedBird);
    console.log(`[BUG08-RUNTIME-03] Resolved cage: cageId=${preparedBird.cageId}, cage_id=${preparedBird.cage_id}`);
    console.log(`[BUG08-RUNTIME-04] Resolved zone: zoneId=${preparedBird.zoneId}`);
    console.log(`[BUG08-RUNTIME-05] Resolved facility: facilityId=${preparedBird.facilityId}`);

    const existing = BirdRepository.getAll(true);
    const validation = BirdEngine.validateBird(preparedBird, existing);
    if (!validation.isValid) {
      return {
        success: false,
        message: "Échec de la validation de l'oiseau.",
        errors: validation.errors
      };
    }

    let added: Canari;
    try {
      added = BirdRepository.create(preparedBird);
    } catch (e: any) {
      return {
        success: false,
        message: e.message || "Erreur lors de la création de l'oiseau."
      };
    }
    console.log(`[BUG08-RUNTIME-01] Bird saved: id=${added.id}, bague=${added.bague}`);
    
    // Log birth or acquisition event
    const eventType = preparedBird.acquisition
      ? EventType.BIRD_ACQUISITION
      : EventType.BIRD_ADD;

    ActivityLogger.log(
      eventType,
      `Ajout d'un nouvel oiseau : ${added.nom} (${added.bague}) - Espèce : ${added.espece}, Race : ${added.race}`,
      { id: added.id, bague: added.bague }
    );

    return { success: true, data: added };
  }

  // Backwards compatibility with addBird
  static addBird(bird: Omit<Canari, 'id'>): BirdServiceResponse<Canari> {
    return this.create(bird);
  }

  /**
   * Updates an existing bird with validation and activity logging.
   */
  static update(bird: Canari): BirdServiceResponse<Canari> {
    if (!BirdRepository.getById(bird.id)) {
      return { success: false, message: "Oiseau introuvable lors de la modification." };
    }
    this.resolveBirdLocation(bird);
    console.log(`[BUG08-RUNTIME-03] Resolved cage for edit: cageId=${bird.cageId}, cage_id=${bird.cage_id}`);
    console.log(`[BUG08-RUNTIME-04] Resolved zone for edit: zoneId=${bird.zoneId}`);
    console.log(`[BUG08-RUNTIME-05] Resolved facility for edit: facilityId=${bird.facilityId}`);

    const existing = BirdRepository.getAll(true);
    const validation = BirdEngine.validateBird(bird, existing, bird.id);
    if (!validation.isValid) {
      return {
        success: false,
        message: "Échec de la validation de l'oiseau.",
        errors: validation.errors
      };
    }

    const original = BirdRepository.getById(bird.id);
    const updated = BirdRepository.update(bird);
    if (!updated) {
      return { success: false, message: "Échec de la modification de l'oiseau." };
    }

    console.log(`[BUG08-RUNTIME-01] Bird updated: id=${bird.id}, bague=${bird.bague}`);

    // If cage changed, log cage change
    if (original && original.cage_id !== bird.cage_id) {
      ActivityLogger.log(
        EventType.BIRD_CAGE_CHANGE,
        `Changement de cage pour ${bird.nom} (${bird.bague}) : Cage #${original.cage_id} ➔ Cage #${bird.cage_id}`,
        { id: bird.id, bague: bird.bague, oldCage: original.cage_id, newCage: bird.cage_id }
      );
    }

    ActivityLogger.log(
      EventType.BIRD_EDIT,
      `Modification de l'oiseau : ${bird.nom} (${bird.bague})`,
      { id: bird.id, bague: bird.bague }
    );

    return { success: true, data: bird };
  }

  // Backwards compatibility with editBird
  static editBird(bird: Canari): BirdServiceResponse<Canari> {
    return this.update(bird);
  }

  /**
   * Archives a bird logically and logs the event.
   */
  static archive(id: number): BirdServiceResponse<null> {
    const target = BirdRepository.getById(id);
    if (!target) {
      return { success: false, message: "Oiseau introuvable pour l'archivage." };
    }

    BirdRepository.archive(id);
    ActivityLogger.log(
      EventType.BIRD_ARCHIVE,
      `Archivage de l'oiseau : ${target.nom} (${target.bague})`,
      { id, bague: target.bague }
    );

    return { success: true };
  }

  /**
   * Restores an archived bird logically and logs the event.
   */
  static restore(id: number): BirdServiceResponse<null> {
    const target = BirdRepository.getById(id);
    if (!target) {
      return { success: false, message: "Oiseau introuvable pour la restauration." };
    }

    try {
      BirdRepository.restore(id);
      ActivityLogger.log(
        EventType.BIRD_RESTORE,
        `Restauration de l'oiseau : ${target.nom} (${target.bague})`,
        { id, bague: target.bague }
      );
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || "Impossible de restaurer l'oiseau." };
    }
  }

  /**
   * Deletes a bird logically (sets archived = true).
   */
  static deleteLogically(id: number): BirdServiceResponse<null> {
    return this.archive(id);
  }

  /**
   * Deletes a bird physically from storage (only if permitted by BirdEngine).
   */
  static delete(id: number): BirdServiceResponse<null> {
    const existing = BirdRepository.getAll(true);
    const legacyPairs = BreedingRepository.getCouples();
    const modernPairs = ReproductionRepository.getAll();
    const references = [
      { type: 'couples', count: legacyPairs.filter(pair => pair.male_id === id || pair.femelle_id === id).length },
      { type: 'couples V2', count: modernPairs.filter(pair => pair.maleId === id || pair.femaleId === id).length },
      { type: 'dossiers de santé', count: HealthRepository.getAll().filter(record => record.canari_id === id).length },
      { type: 'ventes', count: FinanceRepository.getSales().filter(sale => sale.canari_id === id).length },
      { type: 'quarantaines', count: HabitatRepository.getAll<QuarantineRecord>('quarantineRecord').filter(record => record.birdId === id).length },
      { type: 'déplacements', count: HabitatRepository.getAll<DeplacementRecord>('deplacementRecord').filter(record => record.birdId === id).length }
    ];
    const validation = BirdEngine.canDeleteBird(id, existing, references);
    if (!validation.success) {
      return { success: false, message: validation.message };
    }

    const target = BirdRepository.getById(id);
    if (!target) {
      return { success: false, message: "Oiseau introuvable lors de la suppression." };
    }

    const success = BirdRepository.delete(id);
    if (success) {
      ActivityLogger.log(
        EventType.BIRD_DELETE,
        `Suppression définitive de l'oiseau : ${target.nom} (${target.bague})`,
        { id, bague: target.bague }
      );
      return { success: true };
    }

    return { success: false, message: "Échec de la suppression définitive." };
  }

  // Backwards compatibility with deleteBird
  static deleteBird(id: number): BirdServiceResponse<null> {
    return this.delete(id);
  }

  /**
   * Duplicates a bird (clones phenotype etc.) and logs the event.
   */
  static duplicate(id: number): BirdServiceResponse<Canari> {
    try {
      const copy = BirdRepository.duplicate(id);
      ActivityLogger.log(
        EventType.BIRD_ADD,
        `Duplication de l'oiseau #${id} : Création de ${copy.nom} (${copy.bague})`,
        { id: copy.id, parentId: id, bague: copy.bague }
      );
      return { success: true, data: copy };
    } catch (e: any) {
      return { success: false, message: e.message || 'Erreur lors de la duplication.' };
    }
  }

  /**
   * Performs an instant search.
   */
  static search(query: string, includeArchived = false): Canari[] {
    return BirdRepository.search(query, includeArchived);
  }

  // Backwards compatibility with searchBirds
  static searchBirds(query: string): Canari[] {
    return this.search(query);
  }

  /**
   * Performs combined filtering.
   */
  static filter(criteria: BirdFilterCriteria, includeArchived = false): Canari[] {
    return BirdRepository.filter(criteria, includeArchived);
  }
}

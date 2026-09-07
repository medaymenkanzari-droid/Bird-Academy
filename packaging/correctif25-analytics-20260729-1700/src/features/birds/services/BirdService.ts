/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../../../types';
import { BirdRepository, BirdFilterCriteria } from '../repositories/BirdRepository';
import { BirdEngine, BirdValidationError } from '../../../business/BirdEngine';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { ReproductionRepository } from '../../reproduction/repositories/ReproductionRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import type { DeplacementRecord, QuarantineRecord } from '../../../types';

export interface BirdServiceResponse<T = any> {
  success: boolean;
  message?: string;
  errors?: BirdValidationError[];
  data?: T;
}

export class BirdService {
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
    const preparedBird = BirdEngine.prepareForCreation(bird);
    const existing = BirdRepository.getAll(true);
    const validation = BirdEngine.validateBird(preparedBird, existing);
    if (!validation.isValid) {
      return {
        success: false,
        message: "Échec de la validation de l'oiseau.",
        errors: validation.errors
      };
    }

    const added = BirdRepository.create(preparedBird);
    
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

    BirdRepository.restore(id);
    ActivityLogger.log(
      EventType.BIRD_RESTORE,
      `Restauration de l'oiseau : ${target.nom} (${target.bague})`,
      { id, bague: target.bague }
    );

    return { success: true };
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

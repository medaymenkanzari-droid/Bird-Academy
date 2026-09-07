/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EggRepository } from '../repositories/EggRepository';
import { ClutchService } from '../../clutches/services/ClutchService';
import { Egg, EggStatus, EggTimelineEvent, EggInspection } from '../types';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';
import { ClutchRepository } from '../../clutches/repositories/ClutchRepository';
import { ReproductionEngine } from '../../engines/ReproductionEngine';

export class EggService {
  /**
   * Get all eggs in a clutch
   */
  static getEggsByClutch(clutchId: string): Egg[] {
    return EggRepository.getByClutchId(clutchId);
  }

  /**
   * Get egg by ID
   */
  static getEggById(id: string): Egg | undefined {
    return EggRepository.getById(id);
  }

  /**
   * Register a new egg laid
   */
  static addEgg(clutchId: string, layingDate: string, position: string = 'Nid', weight?: number, observations: string = ''): Egg {
    const clutch = ClutchRepository.getById(clutchId);
    if (!clutch || clutch.status !== 'active') {
      throw new Error('Impossible d’ajouter un œuf : la ponte doit exister et être active.');
    }
    if (!ReproductionEngine.isValidHistoricalDate(layingDate) || layingDate < clutch.startDate) {
      throw new Error('La date de ponte doit être valide, non future et postérieure au début du cycle.');
    }
    if (weight !== undefined && (!Number.isFinite(weight) || weight <= 0)) {
      throw new Error('Le poids de l’œuf doit être un nombre strictement positif.');
    }

    const existing = EggRepository.getByClutchId(clutchId);
    const eggNumber = existing.length + 1;

    const egg = EggRepository.create({
      clutchId,
      number: eggNumber,
      layingDate,
      position,
      weight,
      status: 'Pondu',
      observations,
    });

    // Update parent clutch statistics automatically
    ClutchService.syncClutchStats(clutchId);

    ActivityLogger.log(
      EventType.PONTE_UPDATE,
      `Ponte enregistrée : Œuf n°${eggNumber} pour la ponte [${clutchId}] le ${layingDate}`
    );

    return egg;
  }

  /**
   * Update individual egg status
   */
  static updateEggStatus(id: string, newStatus: EggStatus, notes: string = '', operator?: string): Egg {
    const egg = EggRepository.getById(id);
    if (!egg) throw new Error(`Egg with ID ${id} not found.`);

    const statusBefore = egg.status;
    if (!ReproductionEngine.canTransitionEggStatus(statusBefore, newStatus)) {
      throw new Error(`Transition biologique impossible : « ${statusBefore} » vers « ${newStatus} ».`);
    }
    egg.status = newStatus;
    egg.observations = notes || egg.observations;

    const updated = EggRepository.update(egg);

    // Record timeline event
    EggRepository.createTimelineEvent({
      eggId: id,
      type: 'status_change',
      statusBefore,
      statusAfter: newStatus,
      description: `Statut modifié de "${statusBefore}" à "${newStatus}".`,
      notes,
      operator,
    });

    // Sync parent clutch statistics
    ClutchService.syncClutchStats(egg.clutchId);

    ActivityLogger.log(
      EventType.PONTE_UPDATE,
      `Œuf n°${egg.number} de la ponte [${egg.clutchId}] : Statut mis à jour à "${newStatus}"`
    );

    return updated;
  }

  /**
   * Perform a physical inspection/candling on an egg
   */
  static inspectEgg(
    id: string,
    inspectionDate: string,
    observedWeight?: number,
    candlingResult?: 'fertile' | 'clear' | 'uncertain',
    airCellSize?: 'small' | 'normal' | 'large',
    notes: string = '',
    inspector?: string
  ): EggInspection {
    const egg = EggRepository.getById(id);
    if (!egg) throw new Error(`Egg with ID ${id} not found.`);
    if (!ReproductionEngine.isValidHistoricalDate(inspectionDate) || inspectionDate < egg.layingDate) {
      throw new Error('La date d’inspection doit être valide, non future et postérieure à la ponte.');
    }
    if (observedWeight !== undefined && (!Number.isFinite(observedWeight) || observedWeight <= 0)) {
      throw new Error('Le poids observé doit être un nombre strictement positif.');
    }
    if (egg.status === 'Éclos' || egg.status === 'Retiré') {
      throw new Error('Un œuf éclos ou retiré ne peut plus être inspecté.');
    }

    // Determine status after based on candling result
    let statusAfter: EggStatus = egg.status;
    if (candlingResult === 'fertile') {
      statusAfter = 'Fécondé';
    } else if (candlingResult === 'clear') {
      statusAfter = 'Clair';
    }

    const inspection = EggRepository.createInspection({
      eggId: id,
      inspectionDate,
      observedWeight,
      candlingResult,
      airCellSize,
      statusAfter,
      notes,
      inspector,
    });

    // Record timeline event
    EggRepository.createTimelineEvent({
      eggId: id,
      type: 'inspection',
      statusBefore: egg.status,
      statusAfter,
      description: `Mirage et inspection réalisés le ${inspectionDate}. Résultat: ${
        candlingResult === 'fertile'
          ? 'Fécond (Fécondé)'
          : candlingResult === 'clear'
          ? 'Clair'
          : 'Indéterminé'
      }.`,
      notes,
      operator: inspector,
    });

    // Apply the status change to the egg itself
    if (statusAfter !== egg.status || observedWeight !== undefined) {
      egg.status = statusAfter;
      if (observedWeight !== undefined) {
        egg.weight = observedWeight;
      }
      EggRepository.update(egg);
      ClutchService.syncClutchStats(egg.clutchId);
    }

    ActivityLogger.log(
      EventType.PONTE_UPDATE,
      `Œuf n°${egg.number} inspecté/miré le ${inspectionDate} : ${candlingResult || 'poids vérifié'}`
    );

    return inspection;
  }

  /**
   * Get historical events of an egg
   */
  static getEggTimeline(id: string): EggTimelineEvent[] {
    return EggRepository.getTimelineEventsByEggId(id);
  }

  /**
   * Remove an egg (soft delete or logical removal)
   */
  static removeEgg(id: string, reason: string = 'Retiré'): boolean {
    const egg = EggRepository.getById(id);
    if (!egg) return false;

    // Log removal in egg timeline before deleting, or change its status to 'Retiré' / 'Mort'
    this.updateEggStatus(id, 'Retiré', `Retiré du nid. Motif: ${reason}`);
    
    // We do a status change rather than hard delete to preserve history (as requested: "Prévoir les évolutions futures")
    // This maintains historical integrity.
    return true;
  }
}

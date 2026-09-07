/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncubationRepository } from '../repositories/IncubationRepository';
import { EggRepository } from '../../eggs/repositories/EggRepository';
import { Incubation, IncubationEvent, IncubationMode, IncubationBiologicalCalendar, IncubationStatistics } from '../types';
import { ReproductionEngine } from '../../engines/ReproductionEngine';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';
import { ClutchRepository } from '../../clutches/repositories/ClutchRepository';

export class IncubationService {
  /**
   * Get incubation records
   */
  static getAllIncubations(): Incubation[] {
    return IncubationRepository.getAll();
  }

  /**
   * Get incubation by Clutch ID
   */
  static getIncubationByClutch(clutchId: string): Incubation | undefined {
    return IncubationRepository.getByClutchId(clutchId);
  }

  /**
   * Start a new incubation period for a clutch
   */
  static startIncubation(
    clutchId: string,
    startDate: string,
    mode: IncubationMode = 'Naturelle',
    theoreticalDuration: number = 13,
    observations: string = ''
  ): Incubation {
    const clutch = ClutchRepository.getById(clutchId);
    if (!clutch || clutch.status !== 'active') {
      throw new Error('Impossible de démarrer l’incubation : la ponte doit exister et être active.');
    }
    if (!ReproductionEngine.isValidHistoricalDate(startDate) || startDate < clutch.startDate) {
      throw new Error('La date d’incubation doit être valide, non future et postérieure au début de la ponte.');
    }
    if (!Number.isInteger(theoreticalDuration) || theoreticalDuration < 1 || theoreticalDuration > 90) {
      throw new Error('La durée théorique d’incubation doit être comprise entre 1 et 90 jours.');
    }
    if (EggRepository.getByClutchId(clutchId).length === 0) {
      throw new Error('Impossible de démarrer l’incubation : aucun œuf n’est enregistré dans cette ponte.');
    }

    const existing = IncubationRepository.getByClutchId(clutchId);
    if (existing) {
      return existing; // Already incubating
    }

    const incubation = IncubationRepository.create({
      clutchId,
      startDate,
      mode,
      theoreticalDuration,
      observations,
    });

    // Update statuses of all eggs in this clutch to 'En incubation' if they are currently 'Pondu'
    const eggs = EggRepository.getByClutchId(clutchId);
    eggs.forEach(e => {
      if (e.status === 'Pondu') {
        e.status = 'En incubation';
        EggRepository.update(e);
        
        EggRepository.createTimelineEvent({
          eggId: e.id,
          type: 'incubation_start',
          statusBefore: 'Pondu',
          statusAfter: 'En incubation',
          description: `Début de l'incubation (${mode}) le ${startDate}.`,
        });
      }
    });

    ActivityLogger.log(
      EventType.PONTE_UPDATE,
      `Incubation démarrée pour la ponte [${clutchId}] (${mode}) le ${startDate}`
    );

    return incubation;
  }

  /**
   * Get the biological milestones calendar for an incubation
   */
  static getBiologicalCalendar(incubationId: string): IncubationBiologicalCalendar | null {
    const incubation = IncubationRepository.getById(incubationId);
    if (!incubation) return null;

    return ReproductionEngine.calculateIncubationCalendar(
      incubation.startDate,
      incubation.theoreticalDuration
    );
  }

  /**
   * Log a milestone action or manual event for this incubation
   */
  static addIncubationEvent(
    incubationId: string,
    type: IncubationEvent['type'],
    title: string,
    description: string,
    notes: string = '',
    operator?: string
  ): IncubationEvent {
    if (!IncubationRepository.getById(incubationId)) {
      throw new Error('Impossible d’ajouter un événement : incubation introuvable.');
    }
    const event = IncubationRepository.createEvent({
      incubationId,
      type,
      title,
      description,
      notes,
      operator,
    });

    return event;
  }

  /**
   * Get events for an incubation
   */
  static getIncubationEvents(incubationId: string): IncubationEvent[] {
    return IncubationRepository.getEventsByIncubationId(incubationId);
  }

  /**
   * Retrieve statistics for an active incubation
   */
  static getIncubationStatistics(incubationId: string): IncubationStatistics | null {
    const incubation = IncubationRepository.getById(incubationId);
    if (!incubation) return null;

    const eggs = EggRepository.getByClutchId(incubation.clutchId);
    const totalEggsIncubating = eggs.length;

    const calendar = this.getBiologicalCalendar(incubationId);
    const progressPercent = calendar ? calendar.progressPercent : 0;

    const expectedHatchCount = eggs.filter(
      e => e.status === 'Fécondé' || e.status === 'Miré' || e.status === 'En incubation' || e.status === 'Pondu'
    ).length;

    const hatchedCount = eggs.filter(e => e.status === 'Éclos').length;
    
    const failedCount = eggs.filter(
      e => e.status === 'Clair' || e.status === 'Cassé' || e.status === 'Mort' || e.status === 'Arrêt de développement' || e.status === 'Retiré'
    ).length;

    return {
      incubationId,
      clutchId: incubation.clutchId,
      totalEggsIncubating,
      expectedHatchCount,
      hatchedCount,
      failedCount,
      progressPercent,
    };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GrowthRepository } from '../repositories/GrowthRepository';
import { GrowthRecord, WeightRecord, FeedingRecord } from '../types';
import { ChickService } from '../../chicks/services/ChickService';
import { ChickRepository } from '../../chicks/repositories/ChickRepository';

export class GrowthService {
  static getGrowthRecords(chickId?: string): GrowthRecord[] {
    return GrowthRepository.getGrowthRecords(chickId);
  }

  static getWeightRecords(chickId?: string): WeightRecord[] {
    return GrowthRepository.getWeightRecords(chickId);
  }

  static getFeedingRecords(chickId?: string): FeedingRecord[] {
    return GrowthRepository.getFeedingRecords(chickId);
  }

  /**
   * Adds an independent weight record
   */
  static addWeight(chickId: string, date: string, weight: number, notes?: string): WeightRecord {
    const record = GrowthRepository.addWeightRecord({
      chickId,
      date,
      weight,
      notes,
    });

    ChickService.addEvent(
      chickId,
      'weight',
      `Pesée : ${weight}g.`,
      notes
    );

    // Update chick updated date
    const chick = ChickRepository.getById(chickId);
    if (chick) {
      ChickRepository.update(chick); // Automatically bumps updatedAt
    }

    return record;
  }

  /**
   * Adds an independent hand-feeding or diet record
   */
  static addFeeding(
    chickId: string,
    date: string,
    type: FeedingRecord['type'],
    formula?: string,
    frequency?: number,
    quantity?: string,
    notes?: string
  ): FeedingRecord {
    const record = GrowthRepository.addFeedingRecord({
      chickId,
      date,
      type,
      formula,
      frequency,
      quantity,
      notes,
    });

    const feedingTypeLabel = 
      type === 'parents' ? 'Nourrissage par les parents' :
      type === 'eam' ? 'Élevage assisté à la main (EAM)' : 'Nourrissage mixte';

    ChickService.addEvent(
      chickId,
      'feeding',
      `${feedingTypeLabel}.${formula ? ` Pâtée : ${formula}.` : ''}${frequency ? ` Fréquence : ${frequency}x/jour.` : ''}${quantity ? ` Quantité : ${quantity}.` : ''}`,
      notes
    );

    return record;
  }

  /**
   * Adds a comprehensive GrowthRecord, detecting new milestones
   */
  static addGrowthRecord(
    chickId: string,
    date: string,
    weight: number,
    eyesOpened: boolean,
    feathersOut: boolean,
    leftNest: boolean,
    autonomousFeeding: boolean,
    observations: string,
    developmentStatus: 'normal' | 'slow' | 'abnormal' = 'normal'
  ): GrowthRecord {
    const existing = GrowthRepository.getGrowthRecords(chickId).sort((a, b) => b.date.localeCompare(a.date));
    const previous = existing[0]; // last inspection

    // Add record
    const record = GrowthRepository.addGrowthRecord({
      chickId,
      date,
      weight,
      eyesOpened,
      feathersOut,
      leftNest,
      autonomousFeeding,
      observations,
      developmentStatus,
    });

    // Also add to weight history
    GrowthRepository.addWeightRecord({
      chickId,
      date,
      weight,
      notes: `Pesée effectuée lors du bilan de croissance. État : ${developmentStatus}`,
    });

    // Detect and log milestones compared to previous record
    const hasPrevious = !!previous;

    if (eyesOpened && (!hasPrevious || !previous.eyesOpened)) {
      ChickService.addEvent(chickId, 'growth', "Étape de croissance : Ouverture des yeux constatée !");
    }
    if (feathersOut && (!hasPrevious || !previous.feathersOut)) {
      ChickService.addEvent(chickId, 'growth', "Étape de croissance : Sortie des premières plumes !");
    }
    if (leftNest && (!hasPrevious || !previous.leftNest)) {
      ChickService.addEvent(chickId, 'growth', "Étape de croissance : Premier envol / Sortie du nid !");
      // Bump status to weaning or update chick state
      const chick = ChickRepository.getById(chickId);
      if (chick && chick.status === 'growth') {
        ChickService.updateStatus(chickId, 'weaning', "Sortie du nid constatée.");
      }
    }
    if (autonomousFeeding && (!hasPrevious || !previous.autonomousFeeding)) {
      ChickService.addEvent(chickId, 'growth', "Étape de croissance : Début de l'alimentation autonome !");
    }

    // Standard growth evaluation log
    ChickService.addEvent(
      chickId,
      'growth',
      `Bilan de croissance à J+${ChickService.calculateAgeInDays(ChickRepository.getById(chickId)!.hatchDate)}. Poids : ${weight}g. État de développement : ${developmentStatus}.`,
      observations
    );

    // Update chick updated timestamp
    const chick = ChickRepository.getById(chickId);
    if (chick) {
      ChickRepository.update(chick);
    }

    return record;
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClutchRepository } from '../repositories/ClutchRepository';
import { EggRepository } from '../../eggs/repositories/EggRepository';
import { Clutch, ClutchStatistics, ClutchStatus } from '../types';
import { ReproductionEngine } from '../../engines/ReproductionEngine';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';
import { ReproductionRepository } from '../../repositories/ReproductionRepository';

export class ClutchService {
  /**
   * Get all clutches
   */
  static getClutches(): Clutch[] {
    return ClutchRepository.getAll();
  }

  /**
   * Get clutches by breeding pair ID
   */
  static getClutchesByPair(pairId: string): Clutch[] {
    return ClutchRepository.getByPairId(pairId);
  }

  /**
   * Find clutch by ID
   */
  static getClutchById(id: string): Clutch | undefined {
    return ClutchRepository.getById(id);
  }

  /**
   * Create a new clutch for a pair
   */
  static createClutch(pairId: string, startDate: string, observations: string = ''): Clutch {
    const pair = ReproductionRepository.getById(pairId);
    if (!pair || pair.archived || pair.status !== 'active') {
      throw new Error('Impossible de créer une ponte : le couple doit exister et être actif.');
    }
    if (!ReproductionEngine.isValidHistoricalDate(startDate)) {
      throw new Error('La date de début de ponte est invalide ou située dans le futur.');
    }
    if (ClutchRepository.getByPairId(pairId).some(clutch => clutch.status === 'active')) {
      throw new Error('Ce couple possède déjà une ponte active. Terminez-la avant d’en ouvrir une autre.');
    }

    const clutch = ClutchRepository.create({
      pairId,
      startDate,
      observations,
      status: 'active',
      eggCount: 0,
      fertilizedCount: 0,
      clearCount: 0,
      hatchedCount: 0,
      lostCount: 0,
    });

    ActivityLogger.log(
      EventType.PONTE_ADD,
      `Création d'une nouvelle ponte pour le couple [${pairId}] le ${startDate}`
    );

    return clutch;
  }

  /**
   * Recompute stats for a Clutch and update it
   */
  static syncClutchStats(clutchId: string): Clutch {
    const clutch = ClutchRepository.getById(clutchId);
    if (!clutch) throw new Error(`Clutch not found: ${clutchId}`);

    const eggs = EggRepository.getByClutchId(clutchId);

    clutch.eggCount = eggs.length;
    clutch.fertilizedCount = eggs.filter(e => e.status === 'Fécondé' || e.status === 'Miré' || e.status === 'Éclos').length;
    clutch.clearCount = eggs.filter(e => e.status === 'Clair').length;
    clutch.hatchedCount = eggs.filter(e => e.status === 'Éclos').length;
    clutch.lostCount = eggs.filter(e => e.status === 'Cassé' || e.status === 'Mort' || e.status === 'Arrêt de développement' || e.status === 'Retiré').length;

    const updated = ClutchRepository.update(clutch);
    return updated;
  }

  /**
   * Complete or finish a clutch cycle
   */
  static updateClutchStatus(id: string, status: ClutchStatus, endDate?: string): Clutch {
    const clutch = ClutchRepository.getById(id);
    if (!clutch) throw new Error(`Clutch not found: ${id}`);

    if (endDate && (!ReproductionEngine.isValidHistoricalDate(endDate) || endDate < clutch.startDate)) {
      throw new Error('La date de fin doit être valide, non future et postérieure au début de la ponte.');
    }

    clutch.status = status;
    if (status === 'active') {
      delete clutch.endDate;
    } else if (endDate) {
      clutch.endDate = endDate;
    } else {
      clutch.endDate = new Date().toISOString().split('T')[0];
    }

    const updated = ClutchRepository.update(clutch);

    ActivityLogger.log(
      EventType.PONTE_UPDATE,
      `Mise à jour du statut de la ponte [${id}] à "${status}"`
    );

    return updated;
  }

  /**
   * Get advanced stats for a clutch
   */
  static getClutchStatistics(clutchId: string): ClutchStatistics | null {
    const clutch = ClutchRepository.getById(clutchId);
    if (!clutch) return null;

    const total = clutch.eggCount;
    const fertile = clutch.fertilizedCount;
    const clear = clutch.clearCount;
    const hatched = clutch.hatchedCount;
    const lost = clutch.lostCount;

    const fertilityRate = ReproductionEngine.calculateFertilityRate(total, fertile);
    
    // Hatch rate of fertile eggs
    const hatchRate = fertile > 0 ? Math.round((hatched / fertile) * 100) : 0;
    
    // overall failure rate
    const failureRate = ReproductionEngine.calculateFailureRate(total, clear, lost, 0);

    return {
      clutchId,
      fertilityRate,
      hatchRate,
      failureRate,
      totalEggs: total,
      fertileEggs: fertile,
      clearEggs: clear,
      hatchedEggs: hatched,
      lostEggs: lost,
    };
  }
}

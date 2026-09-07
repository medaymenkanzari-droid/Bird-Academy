/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Alimentation } from '../../../types';
import { HandFeedingRepository } from '../repositories/HandFeedingRepository';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';

export class HandFeedingService {
  static getAllPlans(): Alimentation[] {
    return HandFeedingRepository.getAll();
  }

  static getOrInitializeDefaultPlans(defaultPlans: readonly Alimentation[]): Alimentation[] {
    const existingPlans = HandFeedingRepository.getAll();
    if (existingPlans.length > 0) {
      return existingPlans;
    }

    const initializedPlans = defaultPlans.map(plan => ({ ...plan }));
    HandFeedingRepository.saveAll(initializedPlans);
    return initializedPlans;
  }

  static updatePlan(id: number, typeAliment: string, quantite: string, planning: string, stock: number): void {
    const original = HandFeedingRepository.getById(id);
    const updatedPlan: Alimentation = {
      id,
      periode: original ? original.periode : 'Repos',
      type_aliment: typeAliment,
      quantite,
      planning_distribution: planning,
      stock_actuel_kg: stock
    };
    
    HandFeedingRepository.update(updatedPlan);

    ActivityLogger.log(
      EventType.ALIM_UPDATE,
      `Plan d'alimentation mis à jour pour la période ${updatedPlan.periode} : ${typeAliment}`,
      { id, stock }
    );
  }
}

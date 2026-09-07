/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChickRepository } from '../repositories/ChickRepository';
import { Chick, ChickStatus, LifeCycleEvent, GrowthStatistics } from '../types';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';
import { GrowthRepository } from '../../growth/repositories/GrowthRepository';

export class ChickService {
  static getChicks(): Chick[] {
    return ChickRepository.getAll();
  }

  static getChickById(id: string): Chick | undefined {
    return ChickRepository.getById(id);
  }

  static getChicksByClutch(clutchId: string): Chick[] {
    return ChickRepository.getByClutch(clutchId);
  }

  static getChicksByPair(pairId: string): Chick[] {
    return ChickRepository.getByPair(pairId);
  }

  static updateChick(chick: Chick): Chick {
    const original = ChickRepository.getById(chick.id);
    if (!original) {
      throw new Error(`Poussin introuvable : ${chick.id}`);
    }

    const updated = ChickRepository.update(chick);

    // Log if properties changed significantly
    if (original.name !== chick.name) {
      ActivityLogger.log(
        EventType.JEUNE_ADD,
        `Poussin [${chick.provisionalNumber}] renommé en "${chick.name}"`
      );
      this.addEvent(chick.id, 'growth', `Poussin renommé de "${original.name}" à "${chick.name}"`);
    }

    if (original.gender !== chick.gender) {
      ActivityLogger.log(
        EventType.JEUNE_ADD,
        `Sexe du poussin "${chick.name}" mis à jour : ${chick.gender}`
      );
      this.addEvent(chick.id, 'growth', `Sexe déterminé : ${chick.gender}`);
    }

    return updated;
  }

  static updateStatus(id: string, newStatus: ChickStatus, reason: string): Chick {
    const chick = this.getChickById(id);
    if (!chick) throw new Error(`Poussin introuvable : ${id}`);

    const oldStatus = chick.status;
    chick.status = newStatus;
    const updated = ChickRepository.update(chick);

    ActivityLogger.log(
      EventType.JEUNE_ADD,
      `Statut du poussin "${chick.name}" mis à jour de "${oldStatus}" à "${newStatus}" (${reason})`
    );

    return updated;
  }

  // --- TIMELINE ---

  static getTimeline(chickId: string): LifeCycleEvent[] {
    return ChickRepository.getEvents(chickId);
  }

  static addEvent(
    chickId: string, 
    type: LifeCycleEvent['type'], 
    description: string, 
    notes?: string, 
    operator?: string
  ): LifeCycleEvent {
    return ChickRepository.addEvent({
      chickId,
      type,
      description,
      notes,
      operator,
    });
  }

  // --- STATS & BIOLOGICAL CALCULATIONS ---

  static calculateAgeInDays(hatchDate: string): number {
    const start = new Date(hatchDate);
    const today = new Date();
    // Zero out times
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Scientific canary growth curve
   * Day 0: ~1.5g
   * Day 5: ~5g
   * Day 10: ~12g
   * Day 15: ~16g
   * Day 20: ~18g
   * Day 30: ~20g
   */
  static getExpectedWeightByAge(ageDays: number): number {
    if (ageDays <= 0) return 1.5;
    if (ageDays <= 5) return 1.5 + ageDays * 0.7; // Linear up to 5g
    if (ageDays <= 10) return 5.0 + (ageDays - 5) * 1.4; // Faster growth up to 12g
    if (ageDays <= 15) return 12.0 + (ageDays - 10) * 0.8; // Slows down up to 16g
    if (ageDays <= 20) return 16.0 + (ageDays - 15) * 0.4; // Stabilizes up to 18g
    if (ageDays <= 30) return 18.0 + (ageDays - 20) * 0.2; // Adult weight limit around 20g
    return 20.0;
  }

  static getStatistics(chickId: string): GrowthStatistics | null {
    const chick = this.getChickById(chickId);
    if (!chick) return null;

    const weights = GrowthRepository.getWeightRecords(chickId);
    const ageDays = this.calculateAgeInDays(chick.hatchDate);

    let growthRate = 0;
    let weightTrend: 'up' | 'flat' | 'down' = 'flat';
    let currentWeight = chick.birthWeight;

    if (weights.length > 0) {
      const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
      currentWeight = sorted[sorted.length - 1].weight;

      if (sorted.length >= 2) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const dayDiff = Math.max(1, this.calculateAgeInDays(first.date) - this.calculateAgeInDays(last.date)); // wait, day calculation between dates
        const dateFirst = new Date(first.date).getTime();
        const dateLast = new Date(last.date).getTime();
        const days = Math.max(1, Math.round(Math.abs(dateLast - dateFirst) / (1000 * 60 * 60 * 24)));
        growthRate = Math.round(((last.weight - first.weight) / days) * 100) / 100;

        const recent = sorted.slice(-3);
        if (recent.length >= 2) {
          const wDiff = recent[recent.length - 1].weight - recent[0].weight;
          if (wDiff > 0.2) weightTrend = 'up';
          else if (wDiff < -0.2) weightTrend = 'down';
          else weightTrend = 'flat';
        }
      } else {
        // One weigh-in
        const dayDiff = Math.max(1, ageDays);
        growthRate = Math.round(((currentWeight - chick.birthWeight) / dayDiff) * 100) / 100;
        if (currentWeight > chick.birthWeight) weightTrend = 'up';
        else if (currentWeight < chick.birthWeight) weightTrend = 'down';
      }
    }

    const expectedWeight = this.getExpectedWeightByAge(ageDays);
    const deviationPercent = Math.round(((currentWeight - expectedWeight) / expectedWeight) * 100);

    return {
      chickId,
      ageDays,
      growthRate,
      weightTrend,
      expectedWeightForAge: expectedWeight,
      deviationPercent,
    };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Depense, Ponte, Vente } from '../types';
import { HealthEngine } from './HealthEngine';

export interface StatisticsSnapshot {
  totalEggs: number;
  knownFertilityEggs: number;
  fertilizedEggs: number;
  knownHatchFertilizedEggs: number;
  hatchedEggs: number;
  knownSurvivalHatchedEggs: number;
  weanedChicks: number;
  fertilityRate: number;
  hatchRate: number;
  survivalRate: number;
  totalExpenses: number;
  totalSales: number;
  netProfit: number;
  activeBirdCount: number;
  breedCounts: Record<string, number>;
  colorCounts: Record<string, number>;
}

export class StatisticsEngine {
  private static validCount(value: number | undefined): number | null {
    return value !== undefined && Number.isFinite(value) && value >= 0
      ? Math.floor(value)
      : null;
  }

  private static rate(numerator: number, denominator: number): number {
    if (denominator <= 0) return 0;
    return Math.min(100, Math.max(0, (numerator / denominator) * 100));
  }

  private static validAmount(value: number): number {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  static calculate(
    birds: Canari[],
    clutches: Ponte[],
    expenses: Depense[],
    sales: Vente[]
  ): StatisticsSnapshot {
    let totalEggs = 0;
    let knownFertilityEggs = 0;
    let fertilizedEggs = 0;
    let knownHatchFertilizedEggs = 0;
    let hatchedEggs = 0;
    let knownSurvivalHatchedEggs = 0;
    let weanedChicks = 0;

    for (const clutch of clutches) {
      const eggs = this.validCount(clutch.oeufs) ?? 0;
      totalEggs += eggs;

      const fertileRaw = this.validCount(clutch.oeufs_fecondes);
      if (fertileRaw === null) continue;
      const fertile = Math.min(fertileRaw, eggs);
      knownFertilityEggs += eggs;
      fertilizedEggs += fertile;

      const hatchedRaw = this.validCount(clutch.eclosions);
      if (hatchedRaw === null) continue;
      const hatched = Math.min(hatchedRaw, fertile);
      knownHatchFertilizedEggs += fertile;
      hatchedEggs += hatched;

      const weanedRaw = this.validCount(clutch.sevrages);
      if (weanedRaw === null) continue;
      knownSurvivalHatchedEggs += hatched;
      weanedChicks += Math.min(weanedRaw, hatched);
    }

    const totalExpenses = expenses.reduce((sum, item) => sum + this.validAmount(item.montant), 0);
    const totalSales = sales.reduce((sum, item) => sum + this.validAmount(item.prix), 0);
    const activeBirds = birds.filter(bird => HealthEngine.isEligiblePatient(bird));
    const breedCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};

    for (const bird of activeBirds) {
      if (bird.race) breedCounts[bird.race] = (breedCounts[bird.race] ?? 0) + 1;
      if (bird.couleur) colorCounts[bird.couleur] = (colorCounts[bird.couleur] ?? 0) + 1;
    }

    return {
      totalEggs,
      knownFertilityEggs,
      fertilizedEggs,
      knownHatchFertilizedEggs,
      hatchedEggs,
      knownSurvivalHatchedEggs,
      weanedChicks,
      fertilityRate: this.rate(fertilizedEggs, knownFertilityEggs),
      hatchRate: this.rate(hatchedEggs, knownHatchFertilizedEggs),
      survivalRate: this.rate(weanedChicks, knownSurvivalHatchedEggs),
      totalExpenses,
      totalSales,
      netProfit: totalSales - totalExpenses,
      activeBirdCount: activeBirds.length,
      breedCounts,
      colorCounts,
    };
  }
}

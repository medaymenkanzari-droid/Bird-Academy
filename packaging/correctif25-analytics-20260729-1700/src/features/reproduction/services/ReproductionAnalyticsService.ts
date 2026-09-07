/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { ClutchRepository } from '../clutches/repositories/ClutchRepository';
import { IncubationService } from '../incubation/services/IncubationService';

export type MetricValue = number | null;

export interface ReproductionDashboardItem {
  id: string;
  source: 'legacy' | 'v2';
  sourceId: string | number;
  pairId: string;
  startDate: string;
  status: 'active' | 'completed' | 'abandoned';
  eggCount: number;
  fertilizedCount: MetricValue;
  hatchedCount: MetricValue;
  lostCount: MetricValue;
}

export interface ReproductionDashboardSnapshot {
  selectedSource: 'legacy' | 'v2' | 'empty';
  hasSourceConflict: boolean;
  warnings: string[];
  items: ReproductionDashboardItem[];
  metrics: {
    clutchesCount: number;
    totalEggs: number;
    fertilityRate: MetricValue;
    hatchRate: MetricValue;
    activeIncubations: MetricValue;
  };
}

export class ReproductionAnalyticsService {
  static getSnapshot(): ReproductionDashboardSnapshot {
    // 1. Fetch data from repositories
    const legacyReproductions = BreedingRepository.getReproductions();
    const legacyPontes = BreedingRepository.getPontes();
    const v2Clutches = ClutchRepository.getAll();

    const hasLegacyData = legacyReproductions.length > 0 || legacyPontes.length > 0;
    const hasV2Data = v2Clutches.length > 0;

    let selectedSource: 'legacy' | 'v2' | 'empty' = 'empty';
    let hasSourceConflict = false;
    const warnings: string[] = [];

    // 2. Rule of source selection
    if (hasLegacyData && hasV2Data) {
      selectedSource = 'legacy';
      hasSourceConflict = true;
      warnings.push("sourceConflictWarning");
    } else if (hasLegacyData) {
      selectedSource = 'legacy';
    } else if (hasV2Data) {
      selectedSource = 'v2';
    } else {
      selectedSource = 'empty';
    }

    // 3. Build snapshot based on selected source
    const items: ReproductionDashboardItem[] = [];
    let clutchesCount = 0;
    let totalEggs = 0;
    let fertilityRate: MetricValue = null;
    let hatchRate: MetricValue = null;
    let activeIncubations = 0;

    if (selectedSource === 'legacy') {
      clutchesCount = legacyPontes.length;
      
      // Map legacy pontes to items
      legacyPontes.forEach(ponte => {
        const repro = legacyReproductions.find(r => r.id === ponte.reproduction_id);
        const pairId = repro ? `bp-${repro.couple_id}` : '';
        const status = repro && repro.statut === 'En cours' ? 'active' : 'completed';
        
        items.push({
          id: `legacy-ponte-${ponte.id}`,
          source: 'legacy',
          sourceId: ponte.id,
          pairId,
          startDate: ponte.date,
          status,
          eggCount: ponte.oeufs,
          fertilizedCount: (ponte.oeufs_fecondes !== undefined && ponte.oeufs_fecondes !== null) ? ponte.oeufs_fecondes : null,
          hatchedCount: (ponte.eclosions !== undefined && ponte.eclosions !== null) ? ponte.eclosions : null,
          lostCount: null
        });

        totalEggs += ponte.oeufs;
      });

      // Calculate rates
      let sumFertile = 0;
      let knownFertilityEggs = 0;
      let knownHatchFertileEggs = 0;
      let knownHatchedEggs = 0;

      legacyPontes.forEach(ponte => {
        if (ponte.oeufs_fecondes !== undefined && ponte.oeufs_fecondes !== null) {
          sumFertile += ponte.oeufs_fecondes;
          knownFertilityEggs += ponte.oeufs;
        }
        if (
          ponte.oeufs_fecondes !== undefined && ponte.oeufs_fecondes !== null &&
          ponte.eclosions !== undefined && ponte.eclosions !== null
        ) {
          knownHatchFertileEggs += ponte.oeufs_fecondes;
          knownHatchedEggs += ponte.eclosions;
        }
      });

      if (knownFertilityEggs > 0) {
        fertilityRate = Math.round((sumFertile / knownFertilityEggs) * 100);
      } else {
        fertilityRate = null;
      }

      if (knownHatchFertileEggs > 0) {
        hatchRate = Math.round((knownHatchedEggs / knownHatchFertileEggs) * 100);
      } else {
        hatchRate = null;
      }

      // Calculate active incubations
      const activeRepros = legacyReproductions.filter(r => r.statut === 'En cours');
      const activeReproIds = activeRepros.map(r => r.id);
      const activeIncubatingReproIds = new Set<number>();

      const activePontes = legacyPontes.filter(p => activeReproIds.includes(p.reproduction_id));
      activePontes.forEach(p => {
        if (p.oeufs > (p.eclosions || 0)) {
          activeIncubatingReproIds.add(p.reproduction_id);
        }
      });
      activeIncubations = activeIncubatingReproIds.size;

    } else if (selectedSource === 'v2') {
      clutchesCount = v2Clutches.length;

      // Map v2 clutches to items
      v2Clutches.forEach(clutch => {
        items.push({
          id: clutch.id,
          source: 'v2',
          sourceId: clutch.id,
          pairId: clutch.pairId,
          startDate: clutch.startDate,
          status: clutch.status,
          eggCount: clutch.eggCount,
          fertilizedCount: clutch.fertilizedCount,
          hatchedCount: clutch.hatchedCount,
          lostCount: clutch.lostCount
        });

        totalEggs += clutch.eggCount;
      });

      // Calculate rates
      let sumFertile = 0;
      let knownFertilityEggs = 0;
      let knownHatchFertileEggs = 0;
      let knownHatchedEggs = 0;

      v2Clutches.forEach(clutch => {
        if (clutch.fertilizedCount !== undefined && clutch.fertilizedCount !== null) {
          sumFertile += clutch.fertilizedCount;
          knownFertilityEggs += clutch.eggCount;
        }
        if (
          clutch.fertilizedCount !== undefined && clutch.fertilizedCount !== null &&
          clutch.hatchedCount !== undefined && clutch.hatchedCount !== null
        ) {
          knownHatchFertileEggs += clutch.fertilizedCount;
          knownHatchedEggs += clutch.hatchedCount;
        }
      });

      if (knownFertilityEggs > 0) {
        fertilityRate = Math.round((sumFertile / knownFertilityEggs) * 100);
      } else {
        fertilityRate = null;
      }

      if (knownHatchFertileEggs > 0) {
        hatchRate = Math.round((knownHatchedEggs / knownHatchFertileEggs) * 100);
      } else {
        hatchRate = null;
      }

      const activeClutchIds = new Set(
        v2Clutches
          .filter(clutch => clutch.status === 'active')
          .map(clutch => clutch.id)
      );

      activeIncubations = IncubationService.getAllIncubations()
        .filter(incubation => activeClutchIds.has(incubation.clutchId))
        .length;
    }

    return {
      selectedSource,
      hasSourceConflict,
      warnings,
      items,
      metrics: {
        clutchesCount,
        totalEggs,
        fertilityRate,
        hatchRate,
        activeIncubations: selectedSource === 'empty' ? null : activeIncubations
      }
    };
  }
}

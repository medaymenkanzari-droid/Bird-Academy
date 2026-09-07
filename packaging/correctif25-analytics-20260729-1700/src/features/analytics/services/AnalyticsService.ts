/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { ReproductionRepository } from '../../reproduction/repositories/ReproductionRepository';
import { ReproductionAnalyticsService } from '../../reproduction/services/ReproductionAnalyticsService';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';

import { AnalyticsEngine } from '../engines/AnalyticsEngine';
import { AnalyticsSettingsRepository } from '../repositories/AnalyticsSettingsRepository';
import { AnalyticsSnapshotRepository } from '../repositories/AnalyticsSnapshotRepository';
import { AnalyticsFilters, AnalyticsSettings, KPIDefinition, AnalyticsSnapshot } from '../types';
import { Cage, HabitatCage, Couple, Ponte } from '../../../types';

export class AnalyticsService {
  
  /**
   * Aggregate all database inputs in read-only mode
   */
  static getAggregateData() {
    const birds = BirdRepository.getAll();
    const rawPairs = ReproductionRepository.getAll();
    const pairs: Couple[] = rawPairs.map((p, idx) => ({
      id: typeof p.id === 'number' ? p.id : (parseInt(p.id.replace('bp-', '')) || (idx + 1)),
      male_id: p.maleId,
      femelle_id: p.femaleId,
      date_creation: p.dateCreated,
      statut: p.status === 'active' ? 'Actif' : 'Dissous'
    }));
    const reproductionSnapshot = ReproductionAnalyticsService.getSnapshot();
    const clutches: Ponte[] = reproductionSnapshot.items.map((c, idx) => ({
      id: idx + 1,
      reproduction_id: typeof c.pairId === 'number' ? c.pairId : (parseInt(c.pairId.replace('bp-', '')) || (idx + 1)),
      date: c.startDate,
      oeufs: c.eggCount,
      oeufs_fecondes: c.fertilizedCount ?? undefined,
      eclosions: c.hatchedCount ?? undefined,
      sevrages: undefined
    }));
    
    // Retrieve v2 habitat cages
    const rawCages = HabitatRepository.getAll<HabitatCage>('cage');
    // Map HabitatCage back to standard Cage type for compatibility
    const cages: Cage[] = rawCages.map((c, index) => ({
      id: Number(c.id) || (index + 1),
      nom: c.nom,
      description: c.description,
      capacite_max: c.capacite_max || 4
    }));

    const healthRecords = HealthRepository.getAll();
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();
    const settings = AnalyticsSettingsRepository.getSettings();

    return {
      birds,
      pairs,
      clutches,
      cages,
      healthRecords,
      expenses,
      sales,
      settings,
      reproductionSource: reproductionSnapshot.selectedSource,
      reproductionSourceConflict: reproductionSnapshot.hasSourceConflict,
    };
  }

  /**
   * Compute filtered KPIs based on active filters
   */
  static getKPIs(filters: AnalyticsFilters): Record<string, KPIDefinition> {
    const data = this.getAggregateData();
    return AnalyticsEngine.computeAllKPIs(
      data.birds,
      data.cages,
      data.pairs,
      data.clutches,
      data.healthRecords,
      data.expenses,
      data.sales,
      data.settings,
      filters
    );
  }

  /**
   * Save a snapshot of current KPIs
   */
  static captureSnapshot(label: string, filters: AnalyticsFilters): AnalyticsSnapshot {
    const kpis = this.getKPIs(filters);
    const data = this.getAggregateData();

    // Map KPI objects to primitive key-value dictionary
    const kpiValues: Record<string, number | string> = {};
    Object.entries(kpis).forEach(([key, kpi]) => {
      kpiValues[key] = kpi.value;
    });

    // Capture standard domain scores
    const scores = {
      reproduction: Number(kpis.fertility_rate?.value || 80),
      habitat: Number(kpis.occupancy_rate?.value || 70),
      finance: Number(kpis.profit_margin?.value || 50),
      health: Number(kpis.recovery_rate?.value || 90),
      genetics: Number(kpis.genetic_diversity?.value || 80),
      dataQuality: Number(kpis.data_quality_index?.value || 85),
    };

    return AnalyticsSnapshotRepository.createSnapshot(label, kpiValues, scores);
  }

  /**
   * Get all local snapshots
   */
  static getSnapshots(): AnalyticsSnapshot[] {
    return AnalyticsSnapshotRepository.getAll();
  }

  /**
   * Perform Year-over-Year comparison (Year N vs Year N-1)
   */
  static getYearlyComparison(currentYear: number) {
    const snapshots = this.getSnapshots();
    
    // Find representative snapshots or synthesize them based on raw inputs
    const currentSnap = snapshots.find(s => s.timestamp.startsWith(String(currentYear))) || snapshots[snapshots.length - 1];
    const pastSnap = snapshots.find(s => s.timestamp.startsWith(String(currentYear - 1))) || snapshots[0];

    const keys = ['total_birds', 'active_birds', 'fertility_rate', 'weaning_rate', 'net_cashflow', 'data_quality_index', 'average_inbreeding'];
    const comparison: Record<string, { current: number; past: number; changePct: number; trend: 'up' | 'down' | 'stable' }> = {};

    keys.forEach(key => {
      const curVal = currentSnap ? Number(currentSnap.kpis[key]) || 0 : 0;
      const pastVal = pastSnap ? Number(pastSnap.kpis[key]) || 0 : 0;
      
      let change = 0;
      if (pastVal !== 0) {
        change = Number((((curVal - pastVal) / Math.abs(pastVal)) * 100).toFixed(1));
      } else if (curVal > 0) {
        change = 100;
      }

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (change > 0.5) trend = 'up';
      else if (change < -0.5) trend = 'down';

      comparison[key] = {
        current: curVal,
        past: pastVal,
        changePct: change,
        trend
      };
    });

    return comparison;
  }
}

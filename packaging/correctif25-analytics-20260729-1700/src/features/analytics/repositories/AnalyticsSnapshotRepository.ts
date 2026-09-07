/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnalyticsSnapshot } from '../types';

const STORAGE_KEY = 'bird_academy_analytics_snapshots';

// Generating high-quality historic snapshots representing the past year (by seasons/quarters)
const INITIAL_SNAPSHOTS: AnalyticsSnapshot[] = [
  {
    id: 'snap-2025-q1',
    timestamp: '2025-03-31T23:59:59Z',
    label: 'T1 2025',
    kpis: {
      total_birds: 45,
      active_birds: 40,
      active_pairs: 12,
      fertility_rate: 76.5,
      hatching_rate: 72.0,
      weaning_rate: 65.4,
      eggs_count: 52,
      chicks_count: 32,
      weaned_count: 22,
      occupancy_rate: 68,
      cash_flow: 350,
      mortality_rate: 4.5,
      average_inbreeding: 3.12,
      data_quality_index: 85,
    },
    scores: {
      reproduction: 75,
      habitat: 80,
      finance: 70,
      health: 85,
      genetics: 88,
      dataQuality: 85,
    }
  },
  {
    id: 'snap-2025-q2',
    timestamp: '2025-06-30T23:59:59Z',
    label: 'T2 2025',
    kpis: {
      total_birds: 68,
      active_birds: 64,
      active_pairs: 18,
      fertility_rate: 81.2,
      hatching_rate: 78.5,
      weaning_rate: 72.8,
      eggs_count: 84,
      chicks_count: 56,
      weaned_count: 42,
      occupancy_rate: 85,
      cash_flow: 850,
      mortality_rate: 3.2,
      average_inbreeding: 3.45,
      data_quality_index: 88,
    },
    scores: {
      reproduction: 82,
      habitat: 85,
      finance: 80,
      health: 90,
      genetics: 86,
      dataQuality: 88,
    }
  },
  {
    id: 'snap-2025-q3',
    timestamp: '2025-09-30T23:59:59Z',
    label: 'T3 2025',
    kpis: {
      total_birds: 82,
      active_birds: 75,
      active_pairs: 8,
      fertility_rate: 79.0,
      hatching_rate: 74.2,
      weaning_rate: 70.1,
      eggs_count: 32,
      chicks_count: 22,
      weaned_count: 16,
      occupancy_rate: 74,
      cash_flow: -120, // non-breeding upkeep season
      mortality_rate: 2.8,
      average_inbreeding: 3.82,
      data_quality_index: 91,
    },
    scores: {
      reproduction: 78,
      habitat: 78,
      finance: 60,
      health: 92,
      genetics: 84,
      dataQuality: 91,
    }
  },
  {
    id: 'snap-2025-q4',
    timestamp: '2025-12-31T23:59:59Z',
    label: 'T4 2025',
    kpis: {
      total_birds: 78,
      active_birds: 72,
      active_pairs: 2,
      fertility_rate: 83.3,
      hatching_rate: 80.0,
      weaning_rate: 78.4,
      eggs_count: 12,
      chicks_count: 8,
      weaned_count: 6,
      occupancy_rate: 62,
      cash_flow: -450, // winter maintenance expenses
      mortality_rate: 2.1,
      average_inbreeding: 3.90,
      data_quality_index: 94,
    },
    scores: {
      reproduction: 85,
      habitat: 70,
      finance: 50,
      health: 94,
      genetics: 84,
      dataQuality: 94,
    }
  }
];

export class AnalyticsSnapshotRepository {
  static getAll(): AnalyticsSnapshot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SNAPSHOTS));
        return INITIAL_SNAPSHOTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load snapshots', e);
      return INITIAL_SNAPSHOTS;
    }
  }

  static saveAll(snapshots: AnalyticsSnapshot[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.error('Failed to save snapshots', e);
    }
  }

  static createSnapshot(label: string, kpis: Record<string, number | string>, scores: any): AnalyticsSnapshot {
    const snapshots = this.getAll();
    const newSnapshot: AnalyticsSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label,
      kpis,
      scores,
    };
    
    const updated = [...snapshots, newSnapshot];
    this.saveAll(updated);
    return newSnapshot;
  }

  static deleteSnapshot(id: string): void {
    const snapshots = this.getAll();
    const filtered = snapshots.filter(s => s.id !== id);
    this.saveAll(filtered);
  }
}

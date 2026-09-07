/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { GrowthRecord, WeightRecord, FeedingRecord } from '../types';

export class GrowthRepository {
  private static GROWTH_KEY = 'ba_repro_growth_records';
  private static WEIGHT_KEY = 'ba_repro_weight_records';
  private static FEEDING_KEY = 'ba_repro_feeding_records';

  // --- GROWTH RECORDS ---

  static getGrowthRecords(chickId?: string): GrowthRecord[] {
    const list = appStorage.getItem<GrowthRecord[]>(this.GROWTH_KEY, []);
    if (chickId) {
      return list.filter(r => r.chickId === chickId).sort((a, b) => a.date.localeCompare(b.date));
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }

  static addGrowthRecord(record: Omit<GrowthRecord, 'id' | 'createdAt'>): GrowthRecord {
    const list = appStorage.getItem<GrowthRecord[]>(this.GROWTH_KEY, []);
    const id = `grow-${Math.random().toString(36).substring(2, 11)}`;
    const newRecord: GrowthRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString(),
    };
    list.push(newRecord);
    appStorage.setItem(this.GROWTH_KEY, list);
    return newRecord;
  }

  // --- WEIGHT RECORDS ---

  static getWeightRecords(chickId?: string): WeightRecord[] {
    const list = appStorage.getItem<WeightRecord[]>(this.WEIGHT_KEY, []);
    if (chickId) {
      return list.filter(r => r.chickId === chickId).sort((a, b) => a.date.localeCompare(b.date));
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }

  static addWeightRecord(record: Omit<WeightRecord, 'id'>): WeightRecord {
    const list = appStorage.getItem<WeightRecord[]>(this.WEIGHT_KEY, []);
    const id = `wt-${Math.random().toString(36).substring(2, 11)}`;
    const newRecord: WeightRecord = {
      ...record,
      id,
    };
    list.push(newRecord);
    appStorage.setItem(this.WEIGHT_KEY, list);
    return newRecord;
  }

  // --- FEEDING RECORDS ---

  static getFeedingRecords(chickId?: string): FeedingRecord[] {
    const list = appStorage.getItem<FeedingRecord[]>(this.FEEDING_KEY, []);
    if (chickId) {
      return list.filter(r => r.chickId === chickId).sort((a, b) => a.date.localeCompare(b.date));
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }

  static addFeedingRecord(record: Omit<FeedingRecord, 'id'>): FeedingRecord {
    const list = appStorage.getItem<FeedingRecord[]>(this.FEEDING_KEY, []);
    const id = `feed-${Math.random().toString(36).substring(2, 11)}`;
    const newRecord: FeedingRecord = {
      ...record,
      id,
    };
    list.push(newRecord);
    appStorage.setItem(this.FEEDING_KEY, list);
    return newRecord;
  }
}

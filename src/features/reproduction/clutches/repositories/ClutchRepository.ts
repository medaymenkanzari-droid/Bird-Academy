/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { Clutch } from '../types';

export class ClutchRepository {
  private static STORAGE_KEY = 'ba_clutches';

  static getAll(): Clutch[] {
    return appStorage.getItem<Clutch[]>(this.STORAGE_KEY, []);
  }

  static getById(id: string): Clutch | undefined {
    return this.getAll().find(c => c.id === id);
  }

  static getByPairId(pairId: string): Clutch[] {
    return this.getAll().filter(c => c.pairId === pairId);
  }

  static create(clutch: Omit<Clutch, 'id' | 'createdAt' | 'updatedAt'>): Clutch {
    const list = this.getAll();
    const id = `clutch-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newClutch: Clutch = {
      ...clutch,
      id,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newClutch);
    appStorage.setItem(this.STORAGE_KEY, list);
    return newClutch;
  }

  static update(clutch: Clutch): Clutch {
    const list = this.getAll();
    const index = list.findIndex(c => c.id === clutch.id);
    if (index !== -1) {
      clutch.updatedAt = new Date().toISOString();
      list[index] = clutch;
      appStorage.setItem(this.STORAGE_KEY, list);
      return clutch;
    }
    throw new Error(`Clutch with ID ${clutch.id} not found.`);
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length !== list.length) {
      appStorage.setItem(this.STORAGE_KEY, filtered);
      return true;
    }
    return false;
  }
}

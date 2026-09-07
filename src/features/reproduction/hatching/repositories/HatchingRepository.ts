/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { Hatching } from '../types';

export class HatchingRepository {
  private static HATCHINGS_KEY = 'ba_repro_hatchings';

  static getAll(): Hatching[] {
    return appStorage.getItem<Hatching[]>(this.HATCHINGS_KEY, []);
  }

  static getById(id: string): Hatching | undefined {
    return this.getAll().find(h => h.id === id);
  }

  static getByEgg(eggId: string): Hatching | undefined {
    return this.getAll().find(h => h.eggId === eggId);
  }

  static create(hatching: Omit<Hatching, 'id' | 'createdAt'>): Hatching {
    const list = this.getAll();
    const id = `hatch-${Math.random().toString(36).substring(2, 11)}`;
    const newHatching: Hatching = {
      ...hatching,
      id,
      createdAt: new Date().toISOString(),
    };
    list.push(newHatching);
    appStorage.setItem(this.HATCHINGS_KEY, list);
    return newHatching;
  }

  static update(hatching: Hatching): Hatching {
    const list = this.getAll();
    const index = list.findIndex(h => h.id === hatching.id);
    if (index !== -1) {
      list[index] = hatching;
      appStorage.setItem(this.HATCHINGS_KEY, list);
      return hatching;
    }
    throw new Error(`Hatching with ID ${hatching.id} not found.`);
  }
}

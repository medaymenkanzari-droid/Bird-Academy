/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { Weaning } from '../types';

export class WeaningRepository {
  private static WEANINGS_KEY = 'ba_repro_weanings';

  static getAll(): Weaning[] {
    return appStorage.getItem<Weaning[]>(this.WEANINGS_KEY, []);
  }

  static getById(id: string): Weaning | undefined {
    return this.getAll().find(w => w.id === id);
  }

  static getByChick(chickId: string): Weaning | undefined {
    return this.getAll().find(w => w.chickId === chickId);
  }

  static create(weaning: Omit<Weaning, 'id' | 'createdAt'>): Weaning {
    const list = this.getAll();
    const id = `wean-${Math.random().toString(36).substring(2, 11)}`;
    const newWeaning: Weaning = {
      ...weaning,
      id,
      createdAt: new Date().toISOString(),
    };
    list.push(newWeaning);
    appStorage.setItem(this.WEANINGS_KEY, list);
    return newWeaning;
  }

  static update(weaning: Weaning): Weaning {
    const list = this.getAll();
    const index = list.findIndex(w => w.id === weaning.id);
    if (index !== -1) {
      list[index] = weaning;
      appStorage.setItem(this.WEANINGS_KEY, list);
      return weaning;
    }
    throw new Error(`Weaning record with ID ${weaning.id} not found.`);
  }
}

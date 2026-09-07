/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Alimentation } from '../../../types';
import { appStorage } from '../../../storage';

export class HandFeedingRepository {
  private static KEY = 'alimentation';

  static getAll(): Alimentation[] {
    return appStorage.getItem<Alimentation[]>(this.KEY, []);
  }

  static saveAll(plans: Alimentation[]): void {
    appStorage.setItem(this.KEY, plans);
  }

  static getById(id: number): Alimentation | undefined {
    return this.getAll().find(p => p.id === id);
  }

  static add(plan: Omit<Alimentation, 'id'>): Alimentation {
    const list = this.getAll();
    const nextId = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;
    const newPlan = { ...plan, id: nextId };
    list.push(newPlan);
    this.saveAll(list);
    return newPlan;
  }

  static update(updatedPlan: Alimentation): void {
    const list = this.getAll();
    const idx = list.findIndex(p => p.id === updatedPlan.id);
    if (idx !== -1) {
      list[idx] = updatedPlan;
      this.saveAll(list);
    }
  }

  static delete(id: number): boolean {
    const list = this.getAll();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length !== list.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  }

  static search(query: string): Alimentation[] {
    const list = this.getAll();
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(p => 
      p.type_aliment.toLowerCase().includes(q) || 
      p.periode.toLowerCase().includes(q)
    );
  }

  static migrate(): void {
    if (!appStorage.getItem(this.KEY, null)) {
      appStorage.setItem(this.KEY, []);
    }
  }
}

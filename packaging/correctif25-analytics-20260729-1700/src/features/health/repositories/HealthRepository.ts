/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sante } from '../../../types';
import { appStorage } from '../../../storage';

export class HealthRepository {
  private static KEY = 'sante';

  static getAll(): Sante[] {
    return appStorage.getItem<Sante[]>(this.KEY, []);
  }

  static saveAll(records: Sante[]): void {
    appStorage.setItem(this.KEY, records);
  }

  static getById(id: number): Sante | undefined {
    return this.getAll().find(r => r.id === id);
  }

  static add(record: Omit<Sante, 'id'>): Sante {
    const list = this.getAll();
    const nextId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const newRecord = { ...record, id: nextId };
    list.push(newRecord);
    this.saveAll(list);
    return newRecord;
  }

  static update(updatedRecord: Sante): boolean {
    const list = this.getAll();
    const idx = list.findIndex(r => r.id === updatedRecord.id);
    if (idx !== -1) {
      list[idx] = updatedRecord;
      this.saveAll(list);
      return true;
    }
    return false;
  }

  static delete(id: number): boolean {
    const list = this.getAll();
    const filtered = list.filter(r => r.id !== id);
    if (filtered.length !== list.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  }

  static search(query: string): Sante[] {
    const list = this.getAll();
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(r => 
      r.traitement.toLowerCase().includes(q) || 
      r.categorie.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  }

  static migrate(): void {
    if (!appStorage.getItem(this.KEY, null)) {
      appStorage.setItem(this.KEY, []);
    }
  }
}

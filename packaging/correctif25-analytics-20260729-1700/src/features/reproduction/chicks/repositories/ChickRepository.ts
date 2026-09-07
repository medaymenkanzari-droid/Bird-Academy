/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { Chick, LifeCycleEvent } from '../types';

export class ChickRepository {
  private static CHICKS_KEY = 'ba_repro_chicks';
  private static EVENTS_KEY = 'ba_repro_lifecycle_events';

  static getAll(): Chick[] {
    return appStorage.getItem<Chick[]>(this.CHICKS_KEY, []);
  }

  static getById(id: string): Chick | undefined {
    return this.getAll().find(c => c.id === id);
  }

  static getByClutch(clutchId: string): Chick[] {
    return this.getAll().filter(c => c.clutchId === clutchId);
  }

  static getByPair(pairId: string): Chick[] {
    return this.getAll().filter(c => c.pairId === pairId);
  }

  static create(chick: Omit<Chick, 'id' | 'createdAt' | 'updatedAt'>): Chick {
    const list = this.getAll();
    const id = `chick-${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();
    const newChick: Chick = {
      ...chick,
      id,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newChick);
    appStorage.setItem(this.CHICKS_KEY, list);
    return newChick;
  }

  static update(chick: Chick): Chick {
    const list = this.getAll();
    const index = list.findIndex(c => c.id === chick.id);
    if (index !== -1) {
      const now = new Date().toISOString();
      const updated: Chick = {
        ...chick,
        updatedAt: now,
      };
      list[index] = updated;
      appStorage.setItem(this.CHICKS_KEY, list);
      return updated;
    }
    throw new Error(`Chick with ID ${chick.id} not found.`);
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length !== list.length) {
      appStorage.setItem(this.CHICKS_KEY, filtered);
      return true;
    }
    return false;
  }

  // --- TIMELINE EVENTS ---

  static getEvents(chickId?: string): LifeCycleEvent[] {
    const list = appStorage.getItem<LifeCycleEvent[]>(this.EVENTS_KEY, []);
    if (chickId) {
      return list.filter(e => e.chickId === chickId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  static addEvent(event: Omit<LifeCycleEvent, 'id' | 'timestamp'>): LifeCycleEvent {
    const list = appStorage.getItem<LifeCycleEvent[]>(this.EVENTS_KEY, []);
    const id = `ev-${Math.random().toString(36).substring(2, 11)}`;
    const newEvent: LifeCycleEvent = {
      ...event,
      id,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEvent);
    appStorage.setItem(this.EVENTS_KEY, list);
    return newEvent;
  }
}

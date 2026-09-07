/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { Egg, EggTimelineEvent, EggInspection } from '../types';

export class EggRepository {
  private static EGGS_KEY = 'ba_eggs';
  private static TIMELINE_KEY = 'ba_egg_timeline';
  private static INSPECTIONS_KEY = 'ba_egg_inspections';

  // --- EGGS ---

  static getAll(): Egg[] {
    return appStorage.getItem<Egg[]>(this.EGGS_KEY, []);
  }

  static getById(id: string): Egg | undefined {
    return this.getAll().find(e => e.id === id);
  }

  static getByClutchId(clutchId: string): Egg[] {
    return this.getAll().filter(e => e.clutchId === clutchId);
  }

  static create(egg: Omit<Egg, 'id' | 'createdAt' | 'updatedAt'>): Egg {
    const list = this.getAll();
    const id = `egg-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newEgg: Egg = {
      ...egg,
      id,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newEgg);
    appStorage.setItem(this.EGGS_KEY, list);
    
    // Auto-create initial laying event
    this.createTimelineEvent({
      eggId: id,
      type: 'laying',
      statusAfter: egg.status,
      description: `Œuf n°${egg.number} pondu le ${egg.layingDate} à la position ${egg.position || 'Nid'}.`,
    });

    return newEgg;
  }

  static update(egg: Egg): Egg {
    const list = this.getAll();
    const index = list.findIndex(e => e.id === egg.id);
    if (index !== -1) {
      egg.updatedAt = new Date().toISOString();
      list[index] = egg;
      appStorage.setItem(this.EGGS_KEY, list);
      return egg;
    }
    throw new Error(`Egg with ID ${egg.id} not found.`);
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(e => e.id !== id);
    if (filtered.length !== list.length) {
      appStorage.setItem(this.EGGS_KEY, filtered);
      
      // Delete child data
      const timeline = this.getTimelineEventsByEggId(id);
      const allTimeline = appStorage.getItem<EggTimelineEvent[]>(this.TIMELINE_KEY, []);
      appStorage.setItem(this.TIMELINE_KEY, allTimeline.filter(t => t.eggId !== id));

      const allInspections = appStorage.getItem<EggInspection[]>(this.INSPECTIONS_KEY, []);
      appStorage.setItem(this.INSPECTIONS_KEY, allInspections.filter(i => i.eggId !== id));

      return true;
    }
    return false;
  }

  // --- TIMELINE EVENTS ---

  static getTimelineEvents(): EggTimelineEvent[] {
    return appStorage.getItem<EggTimelineEvent[]>(this.TIMELINE_KEY, []);
  }

  static getTimelineEventsByEggId(eggId: string): EggTimelineEvent[] {
    return this.getTimelineEvents()
      .filter(e => e.eggId === eggId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  static createTimelineEvent(event: Omit<EggTimelineEvent, 'id' | 'timestamp'>): EggTimelineEvent {
    const list = this.getTimelineEvents();
    const id = `egg-evt-${Math.random().toString(36).substring(2, 9)}`;
    const newEvent: EggTimelineEvent = {
      ...event,
      id,
      timestamp: new Date().toISOString(),
    };
    list.push(newEvent);
    appStorage.setItem(this.TIMELINE_KEY, list);
    return newEvent;
  }

  // --- INSPECTIONS ---

  static getInspections(): EggInspection[] {
    return appStorage.getItem<EggInspection[]>(this.INSPECTIONS_KEY, []);
  }

  static getInspectionsByEggId(eggId: string): EggInspection[] {
    return this.getInspections().filter(i => i.eggId === eggId);
  }

  static createInspection(inspection: Omit<EggInspection, 'id'>): EggInspection {
    const list = this.getInspections();
    const id = `egg-insp-${Math.random().toString(36).substring(2, 9)}`;
    const newInspection: EggInspection = {
      ...inspection,
      id,
    };
    list.push(newInspection);
    appStorage.setItem(this.INSPECTIONS_KEY, list);
    return newInspection;
  }
}

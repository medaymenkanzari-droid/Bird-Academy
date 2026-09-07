/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { Incubation, IncubationEvent } from '../types';

export class IncubationRepository {
  private static INCUBATIONS_KEY = 'ba_incubations';
  private static EVENTS_KEY = 'ba_incubation_events';

  // --- INCUBATIONS ---

  static getAll(): Incubation[] {
    return appStorage.getItem<Incubation[]>(this.INCUBATIONS_KEY, []);
  }

  static getById(id: string): Incubation | undefined {
    return this.getAll().find(i => i.id === id);
  }

  static getByClutchId(clutchId: string): Incubation | undefined {
    return this.getAll().find(i => i.clutchId === clutchId);
  }

  static create(incubation: Omit<Incubation, 'id' | 'createdAt' | 'updatedAt'>): Incubation {
    const list = this.getAll();
    const id = `incubation-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newIncubation: Incubation = {
      ...incubation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    list.push(newIncubation);
    appStorage.setItem(this.INCUBATIONS_KEY, list);

    // Auto-create initial event
    this.createEvent({
      incubationId: id,
      type: 'start',
      title: 'Début de l\'incubation',
      description: `Mise en incubation sous mode "${incubation.mode}" le ${incubation.startDate}.`,
      notes: incubation.observations,
    });

    return newIncubation;
  }

  static update(incubation: Incubation): Incubation {
    const list = this.getAll();
    const index = list.findIndex(i => i.id === incubation.id);
    if (index !== -1) {
      incubation.updatedAt = new Date().toISOString();
      list[index] = incubation;
      appStorage.setItem(this.INCUBATIONS_KEY, list);
      return incubation;
    }
    throw new Error(`Incubation with ID ${incubation.id} not found.`);
  }

  static delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter(i => i.id !== id);
    if (filtered.length !== list.length) {
      appStorage.setItem(this.INCUBATIONS_KEY, filtered);

      // Clean events
      const allEvents = appStorage.getItem<IncubationEvent[]>(this.EVENTS_KEY, []);
      appStorage.setItem(this.EVENTS_KEY, allEvents.filter(e => e.incubationId !== id));

      return true;
    }
    return false;
  }

  // --- EVENTS ---

  static getEvents(): IncubationEvent[] {
    return appStorage.getItem<IncubationEvent[]>(this.EVENTS_KEY, []);
  }

  static getEventsByIncubationId(incubationId: string): IncubationEvent[] {
    return this.getEvents()
      .filter(e => e.incubationId === incubationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  static createEvent(event: Omit<IncubationEvent, 'id' | 'timestamp'>): IncubationEvent {
    const list = this.getEvents();
    const id = `incub-evt-${Math.random().toString(36).substring(2, 9)}`;
    const newEvent: IncubationEvent = {
      ...event,
      id,
      timestamp: new Date().toISOString(),
    };
    list.push(newEvent);
    appStorage.setItem(this.EVENTS_KEY, list);
    return newEvent;
  }
}

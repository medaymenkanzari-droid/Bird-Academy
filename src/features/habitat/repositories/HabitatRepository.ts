/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { 
  Facility, Zone, Aviary, HabitatCage, Compartment, QuarantineArea, 
  QuarantineRecord, DeplacementRecord, Cage 
} from '../../../types';

export type HabitatEntityType = 
  | 'facility' 
  | 'zone' 
  | 'aviary' 
  | 'cage' 
  | 'compartment' 
  | 'quarantineArea' 
  | 'quarantineRecord' 
  | 'deplacementRecord';

export class HabitatRepository {
  private static KEYS: Record<HabitatEntityType, string> = {
    facility: 'ba_facilities',
    zone: 'ba_zones',
    aviary: 'ba_aviaries',
    cage: 'ba_cages_v2',
    compartment: 'ba_compartments',
    quarantineArea: 'ba_quarantine_areas',
    quarantineRecord: 'ba_quarantine_records',
    deplacementRecord: 'ba_deplacements'
  };

  private static generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'ba-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Performs migration from legacy 'cages' to the new 'ba_cages_v2' schema.
   */
  static migrate(): void {
    const migrationDoneKey = 'ba_habitat_migration_done';
    const existing = appStorage.getItem<any[]>(this.KEYS.cage, []);
    if (existing.length > 0 && appStorage.getItem<boolean>(migrationDoneKey, false)) {
      return;
    }

    try {
      const oldCages = appStorage.getItem<Cage[]>('bird_academy_cages', []);
      
      let facilities = appStorage.getItem<Facility[]>(this.KEYS.facility, []);
      if (facilities.length === 0) {
        const defaultFacility: Facility = {
          id: 'fac_default',
          nom: 'Élevage Principal',
          description: 'Élevage par défaut (issu de la migration)',
          statut: 'Actif',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false,
          customFields: {}
        };
        facilities = [defaultFacility];
        appStorage.setItem(this.KEYS.facility, facilities);
      }

      let zones = appStorage.getItem<Zone[]>(this.KEYS.zone, []);
      if (zones.length === 0) {
        const defaultZone: Zone = {
          id: 'zone_default',
          facilityId: 'fac_default',
          nom: 'Zone Principale',
          description: 'Zone par défaut (issue de la migration)',
          statut: 'Actif',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false,
          isQuarantine: false,
          customFields: {}
        };
        zones = [defaultZone];
        appStorage.setItem(this.KEYS.zone, zones);
      }

      const migratedCages: HabitatCage[] = appStorage.getItem<HabitatCage[]>(this.KEYS.cage, []);
      
      oldCages.forEach(oldCage => {
        const alreadyMigrated = migratedCages.some(c => c.id === String(oldCage.id));
        if (!alreadyMigrated) {
          migratedCages.push({
            id: String(oldCage.id),
            zoneId: 'zone_default',
            nom: oldCage.nom,
            description: oldCage.description,
            statut: 'Actif',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isArchived: false,
            capacite_max: oldCage.capacite_max || 10,
            customFields: { migrated: true }
          });
        }
      });

      appStorage.setItem(this.KEYS.cage, migratedCages);
      appStorage.setItem(migrationDoneKey, true);
      
      this.syncLegacyCages();
    } catch (e) {
      console.error('Error during Habitat V2 migration:', e);
    }
  }

  /**
   * Syncs new cages to the legacy 'cages' key to preserve backwards compatibility.
   */
  private static syncLegacyCages(): void {
    try {
      const activeCages = appStorage.getItem<HabitatCage[]>(this.KEYS.cage, []).filter(c => !c.isArchived);
      const legacyCages: Cage[] = activeCages.map(c => {
        let numericId = parseInt(c.id, 10);
        if (isNaN(numericId)) {
          let hash = 0;
          for (let i = 0; i < c.id.length; i++) {
            hash = c.id.charCodeAt(i) + ((hash << 5) - hash);
          }
          numericId = Math.abs(hash % 100000) + 1000;
        }
        return {
          id: numericId,
          nom: c.nom,
          description: c.description,
          capacite_max: c.capacite_max
        };
      });
      appStorage.setItem('bird_academy_cages', legacyCages);
    } catch (e) {
      console.error('Failed to sync legacy cages:', e);
    }
  }

  static getAllLegacy(): Cage[] {
    this.migrate();
    return appStorage.getItem<Cage[]>('bird_academy_cages', []);
  }

  /**
   * CRUD: Create
   */
  static create<T extends { id: string }>(
    type: HabitatEntityType, 
    data: any
  ): T {
    this.migrate();
    const list = this.getAll<T>(type);
    const newId = data.id || this.generateUUID();
    const now = new Date().toISOString();
    
    const newItem = {
      isArchived: false,
      ...data,
      id: newId,
      createdAt: data.createdAt || now,
      updatedAt: now
    } as unknown as T;

    list.push(newItem);
    appStorage.setItem(this.KEYS[type], list);

    if (type === 'cage') {
      this.syncLegacyCages();
    }

    return newItem;
  }

  /**
   * CRUD: Retrieve All (Overloaded for Legacy Compatibility)
   */
  static getAll(): Cage[];
  static getAll<T>(type: HabitatEntityType): T[];
  static getAll<T>(type?: HabitatEntityType): any {
    this.migrate();
    if (!type) {
      return this.getAllLegacy();
    }
    return appStorage.getItem<T[]>(this.KEYS[type], []);
  }

  /**
   * CRUD: Retrieve by ID (Overloaded for Legacy Compatibility)
   */
  static getById(id: number): Cage | undefined;
  static getById<T extends { id: string }>(type: HabitatEntityType, id: string): T | undefined;
  static getById<T>(first: any, second?: any): any {
    this.migrate();
    if (typeof first === 'number') {
      return this.getAllLegacy().find(c => c.id === first);
    }
    const type = first as HabitatEntityType;
    const id = second as string;
    return this.getAll<any>(type).find(item => item.id === id);
  }

  /**
   * CRUD: Update (Overloaded for Legacy Compatibility)
   */
  static update(updatedCage: Cage): void;
  static update<T extends { id: string; updatedAt: string }>(type: HabitatEntityType, updatedItem: T): void;
  static update(first: any, second?: any): void {
    this.migrate();
    if (typeof first === 'object' && second === undefined) {
      const legacyCage = first as Cage;
      const list_v2 = this.getAll<HabitatCage>('cage');
      const idx = list_v2.findIndex(c => c.id === String(legacyCage.id));
      if (idx !== -1) {
        list_v2[idx] = {
          ...list_v2[idx],
          nom: legacyCage.nom,
          description: legacyCage.description,
          capacite_max: legacyCage.capacite_max,
          updatedAt: new Date().toISOString()
        };
        appStorage.setItem(this.KEYS.cage, list_v2);
        this.syncLegacyCages();
      }
      return;
    }

    const type = first as HabitatEntityType;
    const updatedItem = second;
    const list = this.getAll<any>(type);
    const idx = list.findIndex(item => item.id === updatedItem.id);
    if (idx !== -1) {
      const now = new Date().toISOString();
      list[idx] = {
        ...updatedItem,
        updatedAt: now
      };
      appStorage.setItem(this.KEYS[type], list);
      
      if (type === 'cage') {
        this.syncLegacyCages();
      }
    }
  }

  /**
   * Legacy SaveAll Helper
   */
  static saveAll(cages: Cage[]): void {
    this.migrate();
    appStorage.setItem('bird_academy_cages', cages);
    
    // Sync into v2
    const list_v2 = this.getAll<HabitatCage>('cage');
    cages.forEach(c => {
      const idx = list_v2.findIndex(v2 => v2.id === String(c.id));
      if (idx !== -1) {
        list_v2[idx] = {
          ...list_v2[idx],
          nom: c.nom,
          description: c.description,
          capacite_max: c.capacite_max,
          updatedAt: new Date().toISOString()
        };
      } else {
        list_v2.push({
          id: String(c.id),
          zoneId: 'zone_default',
          nom: c.nom,
          description: c.description || '',
          capacite_max: c.capacite_max || 10,
          statut: 'Actif',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false,
          customFields: {}
        });
      }
    });

    // Keep active
    const filtered_v2 = list_v2.filter(v2 => cages.some(c => String(c.id) === v2.id));
    appStorage.setItem(this.KEYS.cage, filtered_v2);
  }

  /**
   * Legacy Add Helper
   */
  static add(cage: Omit<Cage, 'id'>): Cage {
    this.migrate();
    const list = this.getAllLegacy();
    const nextId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newCage = { ...cage, id: nextId };
    list.push(newCage);
    this.saveAll(list);
    return newCage;
  }

  /**
   * Delete: supports legacy (number id) and modern (type, string id)
   */
  static delete(id: number): boolean;
  static delete(type: HabitatEntityType, id: string): boolean;
  static delete(first: any, second?: any): boolean {
    this.migrate();
    if (typeof first === 'number' && second === undefined) {
      const id = first;
      const list = this.getAllLegacy();
      const filtered = list.filter(c => c.id !== id);
      if (filtered.length !== list.length) {
        this.saveAll(filtered);
        return true;
      }
      return false;
    }

    const type = first as HabitatEntityType;
    const id = second as string;
    const list = this.getAll<any>(type);
    const filtered = list.filter(item => item.id !== id);
    if (filtered.length !== list.length) {
      appStorage.setItem(this.KEYS[type], filtered);
      if (type === 'cage') {
        this.syncLegacyCages();
      }
      return true;
    }
    return false;
  }

  /**
   * Archive
   */
  static archive(type: HabitatEntityType, id: string): void {
    const item = this.getById<any>(type, id);
    if (item) {
      item.isArchived = true;
      this.update(type, item);
    }
  }

  /**
   * Restore
   */
  static restore(type: HabitatEntityType, id: string): void {
    const item = this.getById<any>(type, id);
    if (item) {
      item.isArchived = false;
      this.update(type, item);
    }
  }

  /**
   * Duplicate
   */
  static duplicate<T extends { id: string; nom: string; createdAt: string; updatedAt: string; isArchived: boolean }>(
    type: HabitatEntityType, 
    id: string
  ): T {
    const item = this.getById<T>(type, id);
    if (!item) {
      throw new Error(`Entity of type ${type} with ID ${id} not found.`);
    }

    const { id: _, createdAt: _c, updatedAt: _u, isArchived: _a, ...rest } = item;
    const duplicatedData = {
      ...rest,
      nom: `${item.nom} (Copie)`
    };

    return this.create<T>(type, duplicatedData as any);
  }

  /**
   * Logical Delete
   */
  static deleteLogically(type: HabitatEntityType, id: string): void {
    const item = this.getById<any>(type, id);
    if (item) {
      item.isArchived = true;
      if (!item.customFields) item.customFields = {};
      item.customFields.isDeleted = true;
      this.update(type, item);
    }
  }

  /**
   * Search
   */
  static search<T extends { nom?: string; description?: string }>(type: HabitatEntityType, query: string): T[] {
    const list = this.getAll<T>(type);
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(item => 
      (item.nom && item.nom.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  }

  /**
   * Filter
   */
  static filter<T>(type: HabitatEntityType, predicate: (item: T) => boolean): T[] {
    return this.getAll<T>(type).filter(predicate);
  }
}

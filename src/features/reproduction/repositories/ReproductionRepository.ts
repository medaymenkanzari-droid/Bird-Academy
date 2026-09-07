/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { BreedingPair, PairHistory, BreedingSeason, PairStatus } from '../types';
import { Couple } from '../../../types';

export class ReproductionRepository {
  private static PAIRS_KEY = 'ba_breeding_pairs';
  private static HISTORY_KEY = 'ba_pair_history';
  private static SEASONS_KEY = 'ba_breeding_seasons';
  private static LEGACY_COUPLES_KEY = 'couples';

  private static generateUniqueId(existingPairs: BreedingPair[]): string {
    let id: string;
    do {
      const token = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      id = `bp-${token}`;
    } while (existingPairs.some(pair => pair.id === id));
    return id;
  }

  /**
   * Run automatic migration from legacy couples to modern BreedingPairs
   */
  static migrate(): void {
    const existingPairs = appStorage.getItem<any[] | null>(this.PAIRS_KEY, null);
    const hasPairs = existingPairs !== null && existingPairs.length > 0;
    if (!hasPairs) {
      const legacyCouples = appStorage.getItem<Couple[]>(this.LEGACY_COUPLES_KEY, []);
      if (legacyCouples.length > 0) {
        const migrated: BreedingPair[] = legacyCouples.map(lc => {
          const idStr = `bp-${lc.id}`;
          return {
            id: idStr,
            maleId: lc.male_id,
            femaleId: lc.femelle_id,
            dateCreated: lc.date_creation,
            status: lc.statut === 'Actif' ? 'active' : 'separated',
            archived: false,
            statistics: {
              pairId: idStr,
              reproductionsCount: 0,
              totalEggs: 0,
              fertileEggs: 0,
              hatchedEggs: 0,
              weanedChicks: 0,
              successRate: 0,
            }
          };
        });
        appStorage.setItem(this.PAIRS_KEY, migrated);
      } else {
        // Initialize empty array
        appStorage.setItem(this.PAIRS_KEY, []);
      }
    }

    // Initialize seasons if not present
    const hasSeasons = appStorage.getItem<any[] | null>(this.SEASONS_KEY, null) !== null;
    if (!hasSeasons) {
      const defaultSeason: BreedingSeason = {
        id: 'season-2026',
        name: 'Saison 2026',
        startDate: '2026-01-01',
        status: 'active',
        notes: 'Saison par défaut créée automatiquement'
      };
      appStorage.setItem(this.SEASONS_KEY, [defaultSeason]);
    }

    // Initialize history if not present
    const hasHistory = appStorage.getItem<any[] | null>(this.HISTORY_KEY, null) !== null;
    if (!hasHistory) {
      appStorage.setItem(this.HISTORY_KEY, []);
    }
  }

  /**
   * Sync active and separated modern pairs back to legacy couples key for backwards compatibility
   */
  private static syncToLegacy(pairs: BreedingPair[]): void {
    const reservedLegacyIds = new Set(
      pairs
        .map(pair => pair.id.match(/^bp-(\d+)$/)?.[1])
        .filter((id): id is string => Boolean(id))
        .map(Number)
    );
    const usedIds = new Set<number>();
    const legacyList: Couple[] = pairs
      .filter(p => !p.archived)
      .map(p => {
        // Extract numeric ID if possible, otherwise generate a numeric hash or use index
        let numericId = 1;
        if (p.id.startsWith('bp-')) {
          const parsed = parseInt(p.id.replace('bp-', ''), 10);
          if (!isNaN(parsed)) numericId = parsed;
        } else {
          const parsed = parseInt(p.id, 10);
          if (!isNaN(parsed)) {
            numericId = parsed;
          } else {
            // simple string hash
            let hash = 0;
            for (let i = 0; i < p.id.length; i++) {
              hash = p.id.charCodeAt(i) + ((hash << 5) - hash);
            }
            numericId = Math.abs(hash % 100000) + 1;
          }
        }

        const hasCanonicalNumericId = /^bp-\d+$/.test(p.id);
        while (usedIds.has(numericId) || (!hasCanonicalNumericId && reservedLegacyIds.has(numericId))) {
          numericId += 1;
        }
        usedIds.add(numericId);

        return {
          id: numericId,
          male_id: p.maleId,
          femelle_id: p.femaleId,
          date_creation: p.dateCreated,
          statut: p.status === 'active' ? 'Actif' : 'Dissous'
        };
      });

    appStorage.setItem(this.LEGACY_COUPLES_KEY, legacyList);
  }

  // --- BREEDING PAIRS ---

  static getAll(): BreedingPair[] {
    this.migrate();
    return appStorage.getItem<BreedingPair[]>(this.PAIRS_KEY, []);
  }

  static getById(id: string): BreedingPair | undefined {
    const list = this.getAll();
    return list.find(p => p.id === id);
  }

  static create(pair: Omit<BreedingPair, 'id'>): BreedingPair {
    this.migrate();
    const list = this.getAll();
    const id = this.generateUniqueId(list);
    const newPair: BreedingPair = { ...pair, id };
    
    list.push(newPair);
    appStorage.setItem(this.PAIRS_KEY, list);
    this.syncToLegacy(list);
    return newPair;
  }

  static update(pair: BreedingPair): BreedingPair {
    this.migrate();
    const list = this.getAll();
    const index = list.findIndex(p => p.id === pair.id);
    if (index !== -1) {
      list[index] = pair;
      appStorage.setItem(this.PAIRS_KEY, list);
      this.syncToLegacy(list);
      return pair;
    }
    throw new Error(`BreedingPair with ID ${pair.id} not found.`);
  }

  static archive(id: string): boolean {
    this.migrate();
    const list = this.getAll();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index].archived = true;
      appStorage.setItem(this.PAIRS_KEY, list);
      this.syncToLegacy(list);
      return true;
    }
    return false;
  }

  static restore(id: string): boolean {
    this.migrate();
    const list = this.getAll();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index].archived = false;
      appStorage.setItem(this.PAIRS_KEY, list);
      this.syncToLegacy(list);
      return true;
    }
    return false;
  }

  static search(query: string): BreedingPair[] {
    const list = this.getAll();
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(p => {
      const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
      const statusMatch = p.status.toLowerCase().includes(q);
      const idMatch = p.id.toLowerCase().includes(q);
      return nameMatch || statusMatch || idMatch;
    });
  }

  static filter(criteria: {
    status?: PairStatus;
    seasonId?: string;
    maleId?: number;
    femaleId?: number;
    archived?: boolean;
  }): BreedingPair[] {
    let list = this.getAll();
    
    if (criteria.status !== undefined) {
      list = list.filter(p => p.status === criteria.status);
    }
    if (criteria.seasonId !== undefined) {
      list = list.filter(p => p.seasonId === criteria.seasonId);
    }
    if (criteria.maleId !== undefined) {
      list = list.filter(p => p.maleId === criteria.maleId);
    }
    if (criteria.femaleId !== undefined) {
      list = list.filter(p => p.femaleId === criteria.femaleId);
    }
    if (criteria.archived !== undefined) {
      list = list.filter(p => !!p.archived === criteria.archived);
    } else {
      // By default, only non-archived unless requested
      list = list.filter(p => !p.archived);
    }
    
    return list;
  }

  // --- PAIR HISTORIES ---

  static getHistory(pairId?: string): PairHistory[] {
    this.migrate();
    const list = appStorage.getItem<PairHistory[]>(this.HISTORY_KEY, []);
    if (pairId) {
      return list.filter(h => h.pairId === pairId);
    }
    return list;
  }

  static addHistory(history: Omit<PairHistory, 'id' | 'timestamp'>): PairHistory {
    this.migrate();
    const list = appStorage.getItem<PairHistory[]>(this.HISTORY_KEY, []);
    const id = `ph-${Math.random().toString(36).substring(2, 9)}`;
    const newHistory: PairHistory = {
      ...history,
      id,
      timestamp: new Date().toISOString()
    };
    list.unshift(newHistory); // Newest first
    appStorage.setItem(this.HISTORY_KEY, list);
    return newHistory;
  }

  // --- BREEDING SEASONS ---

  static getSeasons(): BreedingSeason[] {
    this.migrate();
    return appStorage.getItem<BreedingSeason[]>(this.SEASONS_KEY, []);
  }

  static getSeasonById(id: string): BreedingSeason | undefined {
    return this.getSeasons().find(s => s.id === id);
  }

  static createSeason(season: Omit<BreedingSeason, 'id'>): BreedingSeason {
    this.migrate();
    const list = this.getSeasons();
    const id = `season-${Math.random().toString(36).substring(2, 9)}`;
    const newSeason: BreedingSeason = { ...season, id };
    list.push(newSeason);
    appStorage.setItem(this.SEASONS_KEY, list);
    return newSeason;
  }
}

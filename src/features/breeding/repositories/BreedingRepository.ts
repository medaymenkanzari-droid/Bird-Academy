/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Couple, Reproduction, Ponte, Jeune } from '../../../types';
import { appStorage } from '../../../storage';

export class BreedingRepository {
  private static COUPLES_KEY = 'couples';
  private static REPRODUCTIONS_KEY = 'reproductions';
  private static PONTES_KEY = 'pontes';
  private static JEUNES_KEY = 'jeunes';

  // --- COUPLES ---
  static getCouples(): Couple[] {
    return appStorage.getItem<Couple[]>(this.COUPLES_KEY, []);
  }

  static saveCouples(couples: Couple[]): void {
    appStorage.setItem(this.COUPLES_KEY, couples);
  }

  static addCouple(couple: Omit<Couple, 'id'>): Couple {
    const list = this.getCouples();
    const nextId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newCouple = { ...couple, id: nextId };
    list.push(newCouple);
    this.saveCouples(list);
    return newCouple;
  }

  // --- REPRODUCTIONS ---
  static getReproductions(): Reproduction[] {
    return appStorage.getItem<Reproduction[]>(this.REPRODUCTIONS_KEY, []);
  }

  static saveReproductions(reproductions: Reproduction[]): void {
    appStorage.setItem(this.REPRODUCTIONS_KEY, reproductions);
  }

  static addReproduction(repro: Omit<Reproduction, 'id'>): Reproduction {
    const list = this.getReproductions();
    const nextId = list.length > 0 ? Math.max(...list.map(r => r.id)) + 1 : 1;
    const newRepro = { ...repro, id: nextId };
    list.push(newRepro);
    this.saveReproductions(list);
    return newRepro;
  }

  // --- PONTES ---
  static getPontes(): Ponte[] {
    return appStorage.getItem<Ponte[]>(this.PONTES_KEY, []);
  }

  static savePontes(pontes: Ponte[]): void {
    appStorage.setItem(this.PONTES_KEY, pontes);
  }

  static addPonte(ponte: Omit<Ponte, 'id'>): Ponte {
    const list = this.getPontes();
    const nextId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    const newPonte = { ...ponte, id: nextId };
    list.push(newPonte);
    this.savePontes(list);
    return newPonte;
  }

  // --- JEUNES ---
  static getJeunes(): Jeune[] {
    return appStorage.getItem<Jeune[]>(this.JEUNES_KEY, []);
  }

  static saveJeunes(jeunes: Jeune[]): void {
    appStorage.setItem(this.JEUNES_KEY, jeunes);
  }

  static addJeune(jeune: Omit<Jeune, 'id'>): Jeune {
    const list = this.getJeunes();
    const nextId = list.length > 0 ? Math.max(...list.map(j => j.id)) + 1 : 1;
    const newJeune = { ...jeune, id: nextId };
    list.push(newJeune);
    this.saveJeunes(list);
    return newJeune;
  }

  // --- GENERIC ---
  static searchCouples(query: string): Couple[] {
    // Return all for simplicity or filter by active status if queried
    const list = this.getCouples();
    if (query.toLowerCase() === 'actif') {
      return list.filter(c => c.statut === 'Actif');
    }
    if (query.toLowerCase() === 'dissous') {
      return list.filter(c => c.statut === 'Dissous');
    }
    return list;
  }

  static migrate(): void {
    // Ensures basic arrays exist
    if (!appStorage.getItem(this.COUPLES_KEY, null)) {
      appStorage.setItem(this.COUPLES_KEY, []);
    }
    if (!appStorage.getItem(this.REPRODUCTIONS_KEY, null)) {
      appStorage.setItem(this.REPRODUCTIONS_KEY, []);
    }
    if (!appStorage.getItem(this.PONTES_KEY, null)) {
      appStorage.setItem(this.PONTES_KEY, []);
    }
    if (!appStorage.getItem(this.JEUNES_KEY, null)) {
      appStorage.setItem(this.JEUNES_KEY, []);
    }
  }
}

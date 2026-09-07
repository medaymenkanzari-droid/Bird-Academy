/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Couple, Reproduction, Ponte } from '../types';

export class BreedingEngine {
  static validateCoupleFormation(
    maleId: number, 
    femelleId: number, 
    birds: Canari[], 
    couples: Couple[]
  ): { success: boolean; message?: string } {
    const male = birds.find(b => b.id === maleId);
    const female = birds.find(b => b.id === femelleId);

    if (!male || !female) {
      return { success: false, message: "Canaris introuvables." };
    }

    if (male.sexe !== 'Mâle' || female.sexe !== 'Femelle') {
      return { 
        success: false, 
        message: "Un couple doit être composé obligatoirement d'un mâle et d'une femelle (Règles de gestion)." 
      };
    }

    const maleCoupled = couples.some(c => c.statut === 'Actif' && (c.male_id === maleId || c.femelle_id === maleId));
    const femaleCoupled = couples.some(c => c.statut === 'Actif' && (c.male_id === femelleId || c.femelle_id === femelleId));

    if (maleCoupled || femaleCoupled) {
      return { 
        success: false, 
        message: "L'un des canaris fait déjà partie d'un couple actif. Dissolvez le couple précédent d'abord." 
      };
    }

    return { success: true };
  }

  static getActiveCycles(reproductions: Reproduction[]): Reproduction[] {
    return reproductions.filter(r => r.statut === 'En cours');
  }

  static calculateStats(pontes: Ponte[]): { totalEggs: number; fertileEggs: number; hatched: number; weaned: number } {
    let totalEggs = 0;
    let fertileEggs = 0;
    let hatched = 0;
    let weaned = 0;

    pontes.forEach(p => {
      totalEggs += p.oeufs || 0;
      fertileEggs += p.oeufs_fecondes || 0;
      hatched += p.eclosions || 0;
      weaned += p.sevrages || 0;
    });

    return { totalEggs, fertileEggs, hatched, weaned };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Sante } from '../types';

export class HealthEngine {
  static isEligiblePatient(bird: Canari): boolean {
    const healthStatus = bird.statut_sante?.trim().toLocaleLowerCase('fr') ?? '';
    return !bird.archived && !['décédé', 'mort', 'vendu'].includes(healthStatus);
  }

  static getPendingRecordsCount(records: Sante[]): number {
    return records.filter(r => r.statut === 'En attente').length;
  }

  static getHealthStatisticsByCategory(records: Sante[]): Record<string, number> {
    const stats: Record<string, number> = {
      'Traitement': 0,
      'Vaccin': 0,
      'Visite Vétérinaire': 0,
      'Symptôme': 0
    };

    records.forEach(r => {
      if (stats[r.categorie] !== undefined) {
        stats[r.categorie]++;
      }
    });

    return stats;
  }

  static generateEnvironmentalWarnings(currentTemp: number, isSensitiveToCold: boolean, isSensitiveToHeat: boolean): string[] {
    const warnings: string[] = [];
    if (isSensitiveToCold && currentTemp < 15) {
      warnings.push("Température basse : attention à cette espèce qui est sensible au froid.");
    }
    if (isSensitiveToHeat && currentTemp > 28) {
      warnings.push("Température élevée : veillez à bien hydrater et ventiler cette espèce sensible à la chaleur.");
    }
    return warnings;
  }
}

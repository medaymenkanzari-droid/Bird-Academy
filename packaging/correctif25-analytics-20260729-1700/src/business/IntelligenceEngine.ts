/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Cage, Reproduction, Sante } from '../types';
import { HealthEngine } from './HealthEngine';

export interface AviaryInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

export class IntelligenceEngine {
  static generateInsights(
    birds: Canari[],
    cages: Cage[],
    reproductions: Reproduction[],
    healthRecords: Sante[]
  ): AviaryInsight[] {
    const insights: AviaryInsight[] = [];

    // 1. Cage over-capacity check
    cages.forEach(cage => {
      const occupants = birds.filter(b => b.cage_id === cage.id).length;
      if (occupants > cage.capacite_max) {
        insights.push({
          type: 'warning',
          title: `Surcharge Cage: ${cage.nom}`,
          description: `Cette cage dépasse sa capacité recommandée (${occupants}/${cage.capacite_max} oiseaux).`
        });
      }
    });

    // 2. Pending health actions
    const pendingHealth = HealthEngine.getPendingRecordsCount(healthRecords);
    if (pendingHealth > 0) {
      insights.push({
        type: 'warning',
        title: "Suivi Sanitaire",
        description: `Vous avez ${pendingHealth} traitement(s) ou soin(s) en attente.`
      });
    }

    // 3. Active breedings info
    const activeBreedingCount = reproductions.filter(r => r.statut === 'En cours').length;
    if (activeBreedingCount > 0) {
      insights.push({
        type: 'info',
        title: "Saison de Reproduction",
        description: `Il y a actuellement ${activeBreedingCount} cycle(s) de reproduction actifs.`
      });
    } else {
      insights.push({
        type: 'success',
        title: "Elevage Stable",
        description: "Aucun cycle actif en cours. Repos optimal des couples reproducteurs."
      });
    }

    return insights;
  }
}

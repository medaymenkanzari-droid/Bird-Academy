/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Alimentation } from '../types';

export class HandFeedingEngine {
  static checkStockLevels(alimentationPlans: Alimentation[], thresholdKg: number = 2.0): {
    lowStock: boolean;
    items: string[];
  } {
    const items: string[] = [];
    alimentationPlans.forEach(plan => {
      if (plan.stock_actuel_kg <= thresholdKg) {
        items.push(`${plan.type_aliment} (${plan.stock_actuel_kg} kg restants)`);
      }
    });

    return {
      lowStock: items.length > 0,
      items
    };
  }

  static getRecommendedDietForPhase(phase: 'Mue' | 'Reproduction' | 'Repos'): {
    baseDiet: string;
    proteinRequirement: string;
    supplements: string[];
  } {
    switch (phase) {
      case 'Mue':
        return {
          baseDiet: "Mélange de graines riche en lin et navette, pâtée aux œufs",
          proteinRequirement: "Élevée (acides aminés soufrés pour la plume)",
          supplements: ["Vitamines Mue", "Calcium", "Acides aminés"]
        };
      case 'Reproduction':
        return {
          baseDiet: "Graines standard, pâtée d'élevage humide, germations",
          proteinRequirement: "Très élevée (croissance des oisillons)",
          supplements: ["Vitamine E", "Calcium soluble", "Pâtée d'élevage"]
        };
      case 'Repos':
        return {
          baseDiet: "Mélange léger de graines (faible teneur en navette/colza), verdure fraîche",
          proteinRequirement: "Modérée",
          supplements: ["Vitamines générales (1x/semaine)", "Grit/Sable", "Os de seiche"]
        };
    }
  }
}

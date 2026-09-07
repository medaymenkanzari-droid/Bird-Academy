/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class WeaningEngine {
  /**
   * Weaning canary standard parameters
   * Recommended age: 28 to 35 days
   */
  static isWeaningAgeRecommended(ageDays: number): { recommended: boolean; message: string } {
    if (ageDays < 25) {
      return { 
        recommended: false, 
        message: "Trop tôt : L'âge recommandé pour commencer le sevrage est de 28-30 jours." 
      };
    }
    if (ageDays > 45) {
      return { 
        recommended: true, 
        message: "Sevrage tardif : Le sevrage est généralement terminé avant 35-40 jours." 
      };
    }
    return { 
      recommended: true, 
      message: "Âge idéal pour finaliser le sevrage." 
    };
  }

  /**
   * Evaluates if a weaning weight is safe (canaries should be around 17-22g at weaning)
   */
  static isWeaningWeightSafe(weight: number): boolean {
    return weight >= 16.5;
  }
}

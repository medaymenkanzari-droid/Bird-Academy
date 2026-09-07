/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class GrowthEngine {
  /**
   * Evaluates the developmental status based on age and weight.
   */
  static evaluateDevelopment(ageDays: number, weight: number): 'normal' | 'slow' | 'abnormal' {
    if (ageDays <= 2) {
      if (weight < 1.0) return 'abnormal';
      if (weight < 1.3) return 'slow';
      return 'normal';
    }
    if (ageDays <= 5) {
      if (weight < 3.0) return 'abnormal';
      if (weight < 4.0) return 'slow';
      return 'normal';
    }
    if (ageDays <= 10) {
      if (weight < 7.0) return 'abnormal';
      if (weight < 9.5) return 'slow';
      return 'normal';
    }
    if (ageDays <= 20) {
      if (weight < 12.0) return 'abnormal';
      if (weight < 15.0) return 'slow';
      return 'normal';
    }
    if (weight < 14.0) return 'abnormal';
    if (weight < 17.5) return 'slow';
    return 'normal';
  }

  /**
   * Estimates daily weight gain rate
   */
  static calculateDailyGain(startWeight: number, endWeight: number, days: number): number {
    if (days <= 0) return 0;
    return Math.round(((endWeight - startWeight) / days) * 100) / 100;
  }
}

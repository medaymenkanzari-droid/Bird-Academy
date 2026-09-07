/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class HatchingEngine {
  /**
   * Evaluates if an egg is biologically ready for hatching.
   * Canary incubation is typically 13 to 14 days.
   */
  static isReadyForHatching(layingDate: string, daysIncubated: number): { ready: boolean; daysRemaining: number } {
    const targetDays = 13;
    const remaining = Math.max(0, targetDays - daysIncubated);
    return {
      ready: daysIncubated >= targetDays,
      daysRemaining: remaining
    };
  }
}

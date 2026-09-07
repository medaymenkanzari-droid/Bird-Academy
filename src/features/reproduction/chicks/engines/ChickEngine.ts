/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chick } from '../types';

export class ChickEngine {
  /**
   * Generates a scientific temporary identifier for a newly hatched chick.
   */
  static generateProvisionalIdentifier(clutchId: string, eggNumber: number): string {
    const cleanId = clutchId.replace('clutch-', '').slice(0, 5).toUpperCase();
    return `PROV-${cleanId}-${eggNumber}`;
  }

  /**
   * Validates if a chick is eligible for gender definition (typically done when feathers are fully formed).
   */
  static isEligibleForGenderDefinition(ageDays: number): boolean {
    return ageDays >= 20; // 20 days is a standard threshold
  }
}

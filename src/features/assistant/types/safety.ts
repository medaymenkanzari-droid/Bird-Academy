/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MedicalAdviceType =
  | 'GENERAL_INFORMATION'
  | 'FARM_OBSERVATION'
  | 'ALERT'
  | 'VETERINARY_RECOMMENDATION';

export interface SafetyNotice {
  type: MedicalAdviceType;
  disclaimer: string;
  isMandatory: boolean;
}

export interface SafetyGuardResult {
  isSafe: boolean;
  requiresVeterinaryNotice: boolean;
  warnings: string[];
  disclaimers: string[];
}

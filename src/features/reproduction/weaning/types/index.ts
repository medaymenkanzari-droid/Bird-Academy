/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Weaning {
  id: string; // UUID permanent
  chickId: string;
  date: string; // YYYY-MM-DD
  age: number; // age in days at weaning
  weight: number; // in grams
  status: 'success' | 'abandoned' | 'failed';
  success: boolean;
  observations: string;
  finalBirdId?: number; // link to main Canari.id
  createdAt: string;
}

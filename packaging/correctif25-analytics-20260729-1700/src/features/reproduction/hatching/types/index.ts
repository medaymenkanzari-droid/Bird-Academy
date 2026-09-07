/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Hatching {
  id: string; // UUID permanent
  eggId: string;
  chickId?: string; // Created chick ID (if success)
  clutchId: string;
  pairId: string;
  hatchDate: string; // YYYY-MM-DD
  weight: number; // in grams
  assistance: 'none' | 'light' | 'full';
  status: 'success' | 'failed';
  observations: string;
  createdAt: string;
}

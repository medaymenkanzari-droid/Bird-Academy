/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Couple, Reproduction, Ponte } from '../types';

export class BreedingModel {
  static getHatchingForecastDate(layingDateStr: string, incubationPeriod: number = 13): string {
    if (!layingDateStr) return '';
    const date = new Date(layingDateStr);
    date.setDate(date.getDate() + incubationPeriod);
    return date.toISOString().split('T')[0];
  }

  static getWeaningForecastDate(hatchingDateStr: string, weaningPeriod: number = 30): string {
    if (!hatchingDateStr) return '';
    const date = new Date(hatchingDateStr);
    date.setDate(date.getDate() + weaningPeriod);
    return date.toISOString().split('T')[0];
  }

  static isCoupleActive(couple: Couple): boolean {
    return couple.statut === 'Actif';
  }

  static isReproductionActive(repro: Reproduction): boolean {
    return repro.statut === 'En cours';
  }
}

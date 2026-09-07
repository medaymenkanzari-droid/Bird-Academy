/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../types';

export class BirdModel {
  static getAgeInMonths(birthDateStr: string): number {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    if (Number.isNaN(birthDate.getTime())) return 0;
    const now = new Date();
    const yearsDiff = now.getFullYear() - birthDate.getFullYear();
    const monthsDiff = now.getMonth() - birthDate.getMonth();
    const incompleteMonth = now.getDate() < birthDate.getDate() ? 1 : 0;
    const totalMonths = yearsDiff * 12 + monthsDiff - incompleteMonth;
    return totalMonths < 0 ? 0 : totalMonths;
  }

  static isValidRing(ring: string): boolean {
    return ring && ring.trim().length > 3;
  }

  static canBreed(bird: Canari): boolean {
    const age = this.getAgeInMonths(bird.date_naissance);
    return age >= 10; // At least 10 months is recommended
  }
}

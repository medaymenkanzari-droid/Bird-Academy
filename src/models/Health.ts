/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sante } from '../types';

export class HealthModel {
  static needsFollowUp(record: Sante): boolean {
    return record.statut === 'En attente';
  }

  static getCategories(): string[] {
    return ['Traitement', 'Vaccin', 'Visite Vétérinaire', 'Symptôme'];
  }
}

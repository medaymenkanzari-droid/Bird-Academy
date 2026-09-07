/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { Formula, CropInspection, HandFeedingSession } from '../types';

export class HandFeedingRepository {
  private static FORMULA_KEY = 'ba_nursery_formulas';
  private static INSPECTION_KEY = 'ba_nursery_crop_inspections';
  private static SESSION_KEY = 'ba_nursery_feeding_sessions';

  // Formulas
  static getFormulas(): Formula[] {
    const list = appStorage.getItem<Formula[]>(this.FORMULA_KEY, []);
    // Populate default formulas if none exist
    if (list.length === 0) {
      const defaults: Formula[] = [
        {
          id: 'formula-a21',
          name: 'NutriBird A21',
          brand: 'Versele-Laga',
          dilutionRatio: '1:3 (Poudre:Eau)',
          targetTemperature: 39.5,
          notes: 'Pâtée d\'élevage standard pour oisillons granivores.',
          timeline: [
            {
              id: 'init-1',
              timestamp: new Date().toISOString(),
              type: 'system',
              description: 'Création de la formule standard par défaut.'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'formula-exact',
          name: 'Exact Hand Feeding',
          brand: 'Kaytee',
          dilutionRatio: '1:4 (Poudre:Eau)',
          targetTemperature: 39.0,
          notes: 'Haute digestibilité, excellente pour canaris et perruches.',
          timeline: [
            {
              id: 'init-2',
              timestamp: new Date().toISOString(),
              type: 'system',
              description: 'Création de la formule alternative par défaut.'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      appStorage.setItem(this.FORMULA_KEY, defaults);
      return defaults;
    }
    return list;
  }

  static getFormulaById(id: string): Formula | undefined {
    return this.getFormulas().find(f => f.id === id);
  }

  static saveFormula(record: Formula): Formula {
    const list = this.getFormulas();
    const index = list.findIndex(f => f.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.FORMULA_KEY, list);
    return record;
  }

  // Crop Inspections
  static getInspections(): CropInspection[] {
    return appStorage.getItem<CropInspection[]>(this.INSPECTION_KEY, []);
  }

  static getInspectionsByChick(chickId: string): CropInspection[] {
    return this.getInspections().filter(i => i.chickId === chickId);
  }

  static saveInspection(record: CropInspection): CropInspection {
    const list = this.getInspections();
    const index = list.findIndex(i => i.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.INSPECTION_KEY, list);
    return record;
  }

  // Feeding Sessions
  static getSessions(): HandFeedingSession[] {
    return appStorage.getItem<HandFeedingSession[]>(this.SESSION_KEY, []);
  }

  static getSessionsByChick(chickId: string): HandFeedingSession[] {
    return this.getSessions().filter(s => s.chickId === chickId);
  }

  static saveSession(record: HandFeedingSession): HandFeedingSession {
    const list = this.getSessions();
    const index = list.findIndex(s => s.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.SESSION_KEY, list);
    return record;
  }
}

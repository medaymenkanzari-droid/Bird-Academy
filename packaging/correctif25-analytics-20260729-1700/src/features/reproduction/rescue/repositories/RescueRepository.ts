/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { RescueCase } from '../types';

export class RescueRepository {
  private static RESCUE_KEY = 'ba_nursery_rescue_cases';

  static getRescueCases(): RescueCase[] {
    return appStorage.getItem<RescueCase[]>(this.RESCUE_KEY, []);
  }

  static getRescueCaseById(id: string): RescueCase | undefined {
    return this.getRescueCases().find(r => r.id === id);
  }

  static getRescueCaseByChick(chickId: string): RescueCase | undefined {
    return this.getRescueCases().find(r => r.chickId === chickId && r.status === 'active');
  }

  static saveRescueCase(record: RescueCase): RescueCase {
    const list = this.getRescueCases();
    const index = list.findIndex(r => r.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.RESCUE_KEY, list);
    return record;
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { NurseryRecord } from '../types';

export class NurseryRepository {
  private static NURSERY_KEY = 'ba_nursery_records';

  static getNurseryRecords(): NurseryRecord[] {
    return appStorage.getItem<NurseryRecord[]>(this.NURSERY_KEY, []);
  }

  static getNurseryRecordById(id: string): NurseryRecord | undefined {
    return this.getNurseryRecords().find(n => n.id === id);
  }

  static getNurseryRecordByChick(chickId: string): NurseryRecord | undefined {
    return this.getNurseryRecords().find(n => n.chickId === chickId);
  }

  static saveNurseryRecord(record: NurseryRecord): NurseryRecord {
    const list = this.getNurseryRecords();
    const index = list.findIndex(n => n.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.NURSERY_KEY, list);
    return record;
  }
}

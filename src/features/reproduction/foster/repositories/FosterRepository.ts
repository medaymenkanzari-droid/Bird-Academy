/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { FosterParents, TransferRecord } from '../types';

export class FosterRepository {
  private static FOSTER_KEY = 'ba_nursery_foster_parents';
  private static TRANSFER_KEY = 'ba_nursery_transfers';

  static getFosterParents(): FosterParents[] {
    return appStorage.getItem<FosterParents[]>(this.FOSTER_KEY, []);
  }

  static getFosterParentsById(id: string): FosterParents | undefined {
    return this.getFosterParents().find(f => f.id === id);
  }

  static getFosterParentsByPair(pairId: string): FosterParents | undefined {
    return this.getFosterParents().find(f => f.pairId === pairId);
  }

  static saveFosterParents(record: FosterParents): FosterParents {
    const list = this.getFosterParents();
    const index = list.findIndex(f => f.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.FOSTER_KEY, list);
    return record;
  }

  static getTransfers(): TransferRecord[] {
    return appStorage.getItem<TransferRecord[]>(this.TRANSFER_KEY, []);
  }

  static getTransfersByChick(chickId: string): TransferRecord[] {
    return this.getTransfers().filter(t => t.chickId === chickId);
  }

  static saveTransfer(record: TransferRecord): TransferRecord {
    const list = this.getTransfers();
    const index = list.findIndex(t => t.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.TRANSFER_KEY, list);
    return record;
  }
}

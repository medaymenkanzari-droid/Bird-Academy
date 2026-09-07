/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivationRecord, License } from '../types/licensing';

export class ActivationHistoryEngine {
  /**
   * Retrieves all device activations for a license ordered by most recent activity
   */
  static getActivationHistory(license: License): ActivationRecord[] {
    return [...license.activations].sort(
      (a, b) => new Date(b.lastVerifiedAt).getTime() - new Date(a.lastVerifiedAt).getTime()
    );
  }

  /**
   * Formats device history item into human readable summary
   */
  static formatRecordSummary(record: ActivationRecord): string {
    const date = new Date(record.activatedAt).toLocaleDateString();
    return `${record.fingerprint.os} (${record.fingerprint.deviceId}) - Activé le ${date} ${record.isOffline ? '[Hors Ligne]' : ''}`;
  }
}

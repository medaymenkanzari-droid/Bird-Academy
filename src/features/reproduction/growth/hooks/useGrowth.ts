/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GrowthRecord } from '../types';
import { GrowthService } from '../services/GrowthService';

export function useGrowth(chickId?: string) {
  const [records, setRecords] = useState<GrowthRecord[]>([]);

  useEffect(() => {
    setRecords(GrowthService.getGrowthRecords(chickId));
  }, [chickId]);

  return { records, reload: () => setRecords(GrowthService.getGrowthRecords(chickId)) };
}

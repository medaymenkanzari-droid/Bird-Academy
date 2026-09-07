/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Chick } from '../types';
import { ChickService } from '../services/ChickService';

export function useChicks(clutchId?: string) {
  const [chicks, setChicks] = useState<Chick[]>([]);

  useEffect(() => {
    if (clutchId) {
      setChicks(ChickService.getChicksByClutch(clutchId));
    } else {
      setChicks(ChickService.getChicks());
    }
  }, [clutchId]);

  return { chicks, reload: () => setChicks(clutchId ? ChickService.getChicksByClutch(clutchId) : ChickService.getChicks()) };
}

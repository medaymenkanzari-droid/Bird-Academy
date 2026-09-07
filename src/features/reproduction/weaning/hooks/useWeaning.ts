/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Weaning } from '../types';
import { WeaningService } from '../services/WeaningService';

export function useWeaning() {
  const [weanings, setWeanings] = useState<Weaning[]>([]);

  useEffect(() => {
    setWeanings(WeaningService.getWeanings());
  }, []);

  return { weanings, reload: () => setWeanings(WeaningService.getWeanings()) };
}

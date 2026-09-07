/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Hatching } from '../types';
import { HatchingService } from '../services/HatchingService';

export function useHatchings() {
  const [hatchings, setHatchings] = useState<Hatching[]>([]);

  useEffect(() => {
    setHatchings(HatchingService.getHatchings());
  }, []);

  return { hatchings, reload: () => setHatchings(HatchingService.getHatchings()) };
}

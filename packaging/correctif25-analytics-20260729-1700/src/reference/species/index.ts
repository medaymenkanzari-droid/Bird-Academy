/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CANARI_PROFILE } from './canari';
import { CHARDONNERET_PROFILE } from './chardonneret';
import { BiologicalSpeciesProfile } from './types';

export * from './types';

export const BIOLOGICAL_SPECIES_REGISTRY: BiologicalSpeciesProfile[] = [
  CANARI_PROFILE,
  CHARDONNERET_PROFILE
];

export function getBiologicalProfileById(id: string): BiologicalSpeciesProfile | undefined {
  return BIOLOGICAL_SPECIES_REGISTRY.find(profile => profile.identity.id === id);
}

export function getBiologicalProfileByCode(code: string): BiologicalSpeciesProfile | undefined {
  return BIOLOGICAL_SPECIES_REGISTRY.find(profile => profile.identity.code === code);
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserSpeciesProfile {
  activeSpeciesIds: string[];
  activeBreedIds?: Record<string, string[]>; // speciesId -> breedIds
  updatedAt: string;
}

export const DEFAULT_SPECIES_PROFILE: UserSpeciesProfile = {
  activeSpeciesIds: ['canari'],
  activeBreedIds: {},
  updatedAt: new Date().toISOString()
};

export const SPECIES_PROFILE_STORAGE_KEY = 'bird_academy_species_profile';

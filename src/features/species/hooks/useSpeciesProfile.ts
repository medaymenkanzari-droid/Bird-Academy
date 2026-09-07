/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { SpeciesProfileService } from '../services/SpeciesProfileService';
import { SpeciesInfo, BreedInfo } from '../../../data/speciesRegistry';
import { UserSpeciesProfile } from '../models/SpeciesProfile';

export function useSpeciesProfile() {
  const [profile, setProfile] = useState<UserSpeciesProfile>(() => SpeciesProfileService.getProfile());
  const [activeSpeciesIds, setActiveSpeciesIds] = useState<string[]>(() => SpeciesProfileService.getActiveSpeciesIds());
  const [activeSpecies, setActiveSpecies] = useState<SpeciesInfo[]>(() => SpeciesProfileService.getActiveSpecies());

  useEffect(() => {
    // Initial sync
    setProfile(SpeciesProfileService.getProfile());
    setActiveSpeciesIds(SpeciesProfileService.getActiveSpeciesIds());
    setActiveSpecies(SpeciesProfileService.getActiveSpecies());

    // Subscribe to service changes
    const unsubscribe = SpeciesProfileService.subscribe((updatedProfile) => {
      setProfile(updatedProfile);
      setActiveSpeciesIds(SpeciesProfileService.getActiveSpeciesIds());
      setActiveSpecies(SpeciesProfileService.getActiveSpecies());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isSpeciesActive = useCallback((speciesId: string) => {
    return SpeciesProfileService.isSpeciesActive(speciesId);
  }, []);

  const getActiveBreeds = useCallback((speciesId?: string): BreedInfo[] => {
    return SpeciesProfileService.getActiveBreeds(speciesId);
  }, []);

  return {
    profile,
    activeSpeciesIds,
    activeSpecies,
    isSpeciesActive,
    getActiveBreeds,
    setProfile: SpeciesProfileService.setProfile.bind(SpeciesProfileService),
    addSpecies: SpeciesProfileService.addSpecies.bind(SpeciesProfileService),
    removeSpecies: SpeciesProfileService.removeSpecies.bind(SpeciesProfileService),
    resetToDefault: SpeciesProfileService.resetToDefault.bind(SpeciesProfileService),
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSpeciesProfile, DEFAULT_SPECIES_PROFILE, SPECIES_PROFILE_STORAGE_KEY } from '../models/SpeciesProfile';

export class SpeciesProfileRepository {
  private static memoryFallback: UserSpeciesProfile | null = null;

  static getProfile(): UserSpeciesProfile {
    try {
      if (typeof localStorage === 'undefined') {
        return this.memoryFallback ? { ...this.memoryFallback } : { ...DEFAULT_SPECIES_PROFILE };
      }

      const raw = localStorage.getItem(SPECIES_PROFILE_STORAGE_KEY);
      if (!raw) {
        // Auto-migration check: if existing birds exist in localStorage, extract their species
        const existingBirdsRaw = localStorage.getItem('canaris');
        if (existingBirdsRaw) {
          try {
            const birds = JSON.parse(existingBirdsRaw);
            if (Array.isArray(birds) && birds.length > 0) {
              const detectedSpecies = Array.from(
                new Set(
                  birds
                    .map((b: any) => b.espece)
                    .filter((sp: any) => typeof sp === 'string' && sp.trim().length > 0)
                )
              );
              if (detectedSpecies.length > 0) {
                const migratedProfile: UserSpeciesProfile = {
                  activeSpeciesIds: detectedSpecies,
                  activeBreedIds: {},
                  updatedAt: new Date().toISOString()
                };
                this.saveProfile(migratedProfile);
                return migratedProfile;
              }
            }
          } catch {
            // Ignore parse errors on legacy data
          }
        }
        return { ...DEFAULT_SPECIES_PROFILE };
      }

      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.activeSpeciesIds) || parsed.activeSpeciesIds.length === 0) {
        return { ...DEFAULT_SPECIES_PROFILE };
      }

      return {
        activeSpeciesIds: parsed.activeSpeciesIds,
        activeBreedIds: parsed.activeBreedIds || {},
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    } catch (e) {
      console.error('[SpeciesProfileRepository] Failed to read profile from storage:', e);
      return { ...DEFAULT_SPECIES_PROFILE };
    }
  }

  static saveProfile(profile: UserSpeciesProfile): void {
    try {
      const sanitized: UserSpeciesProfile = {
        activeSpeciesIds: Array.from(new Set(profile.activeSpeciesIds.filter(id => Boolean(id && typeof id === 'string')))),
        activeBreedIds: profile.activeBreedIds || {},
        updatedAt: new Date().toISOString()
      };

      if (sanitized.activeSpeciesIds.length === 0) {
        sanitized.activeSpeciesIds = ['canari'];
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SPECIES_PROFILE_STORAGE_KEY, JSON.stringify(sanitized));
      } else {
        this.memoryFallback = sanitized;
      }
    } catch (e) {
      console.error('[SpeciesProfileRepository] Failed to save profile to storage:', e);
      this.memoryFallback = profile;
    }
  }

  static resetProfile(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(SPECIES_PROFILE_STORAGE_KEY);
      }
      this.memoryFallback = null;
    } catch (e) {
      console.error('[SpeciesProfileRepository] Failed to reset profile:', e);
    }
  }

  static clearMemoryCache(): void {
    this.memoryFallback = null;
  }
}

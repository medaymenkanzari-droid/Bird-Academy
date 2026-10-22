/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSpeciesProfile } from '../models/SpeciesProfile';
import { SpeciesProfileRepository } from '../repositories/SpeciesProfileRepository';
import { 
  SPECIES_REGISTRY, 
  SpeciesInfo, 
  BreedInfo, 
  getSpeciesById, 
  getBreedsBySpeciesId 
} from '../../../data/speciesRegistry';
import { 
  BIOLOGICAL_SPECIES_REGISTRY, 
  BiologicalSpeciesProfile, 
  getBiologicalProfileById 
} from '../../../reference/species/index';

export class SpeciesProfileService {
  private static listeners: Set<(profile: UserSpeciesProfile) => void> = new Set();

  /**
   * Subscribe to profile changes.
   */
  static subscribe(listener: (profile: UserSpeciesProfile) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const profile = this.getProfile();
    this.listeners.forEach(listener => {
      try {
        listener(profile);
      } catch (err) {
        console.error('[SpeciesProfileService] Error in listener callback:', err);
      }
    });
  }

  /**
   * Get the current active user species profile.
   */
  static getProfile(): UserSpeciesProfile {
    return SpeciesProfileRepository.getProfile();
  }

  /**
   * Overwrite and save the user species profile.
   */
  static setProfile(speciesIds: string[], breedIds?: Record<string, string[]>): void {
    const validSpeciesIds = speciesIds.filter(id => Boolean(id && typeof id === 'string'));
    const sanitizedIds = validSpeciesIds;

    const newProfile: UserSpeciesProfile = {
      activeSpeciesIds: Array.from(new Set(sanitizedIds)),
      activeBreedIds: breedIds || {},
      updatedAt: new Date().toISOString()
    };

    SpeciesProfileRepository.saveProfile(newProfile);
    this.notifyListeners();
  }

  /**
   * Retrieve active species IDs as an array of strings (e.g. ['canari', 'chardonneret_elegant']).
   * RÈGLE CRITIQUE : Zéro fallback sur 'canari' si la liste est vide.
   */
  static getActiveSpeciesIds(): string[] {
    const profile = this.getProfile();
    return Array.isArray(profile.activeSpeciesIds)
      ? profile.activeSpeciesIds
      : [];
  }

  /**
   * Statut épistémique du profil d'espèces.
   */
  static getProfileStatus(): 'CONFIGURED' | 'UNKNOWN' | 'INSUFFICIENT_INFORMATION' {
    const active = this.getActiveSpeciesIds();
    return active.length > 0 ? 'CONFIGURED' : 'INSUFFICIENT_INFORMATION';
  }

  /**
   * Retrieve full SpeciesInfo metadata for all active species.
   * Preserves full master registry while returning only active items.
   */
  static getActiveSpecies(): SpeciesInfo[] {
    const activeIds = new Set(this.getActiveSpeciesIds());
    return SPECIES_REGISTRY.filter(species => activeIds.has(species.id));
  }

  /**
   * Check if a specific species ID is active in the user's profile.
   */
  static isSpeciesActive(speciesId: string): boolean {
    if (!speciesId) return false;
    const activeIds = this.getActiveSpeciesIds();
    const normalizedId = (speciesId === 'colombe' || speciesId === 'colombe-diamant') ? 'colombe_diamant' : speciesId;
    return activeIds.includes(normalizedId) || activeIds.includes(speciesId);
  }

  /**
   * Retrieve active breeds for a given species or across all active species.
   */
  static getActiveBreeds(speciesId?: string): BreedInfo[] {
    if (speciesId) {
      return getBreedsBySpeciesId(speciesId);
    }
    const activeSpecies = this.getActiveSpecies();
    return activeSpecies.flatMap(s => s.categories.flatMap(c => c.breeds));
  }

  /**
   * Retrieve biological species profiles matching the active user profile.
   */
  static getScopedBiologicalProfiles(): BiologicalSpeciesProfile[] {
    const activeIds = new Set(this.getActiveSpeciesIds());
    return BIOLOGICAL_SPECIES_REGISTRY.filter(profile => activeIds.has(profile.identity.id));
  }

  /**
   * Resolve incubation duration in days for a specific bird species.
   * Returns undefined if speciesId is absent or not recognized (Zero Canary Fallback).
   */
  static getIncubationDays(speciesId?: string): number | undefined {
    if (!speciesId) return undefined;
    // Check certified biological profile first
    const profile = getBiologicalProfileById(speciesId);
    if (profile && profile.reproduction?.incubationPeriod) {
      return profile.reproduction.incubationPeriod;
    }

    // Species-specific biological defaults (with canonical speciesIds)
    switch (speciesId) {
      case 'agapornis_roseicollis':
      case 'roseicollis':
        return 23;
      case 'agapornis_fischeri':
      case 'fischeri':
      case 'fischer':
      case 'agapornis_personatus':
      case 'personatus':
        return 22;
      case 'chardonneret_elegant':
        return 12;
      case 'diamant_gould':
        return 14;
      case 'diamant_mandarin':
      case 'mandarin':
        return 13;
      case 'perruche_ondulee':
        return 18;
      case 'calopsitte':
      case 'calopsitte_elegante':
        return 19;
      case 'colombe':
      case 'colombe_diamant':
        return 13;
      case 'canari':
        return 13;
      default:
        return undefined;
    }
  }

  /**
   * Add a species to the user's active profile.
   */
  static addSpecies(speciesId: string): void {
    if (!speciesId) return;
    const current = this.getActiveSpeciesIds();
    if (!current.includes(speciesId)) {
      const updated = [...current, speciesId];
      this.setProfile(updated, this.getProfile().activeBreedIds);
    }
  }

  /**
   * Remove / deactivate a species from the user's active profile.
   * Safety rule: Preserves minimum 1 active species.
   * Rule 8: Historical data (birds, couples, health, etc.) is NEVER deleted;
   * it simply moves outside the active scope and is preserved for future reactivation.
   */
  static removeSpecies(speciesId: string): { success: boolean; message?: string } {
    if (!speciesId) {
      return { success: false, message: "Identifiant d'espèce invalide." };
    }
    const current = this.getActiveSpeciesIds();
    if (!current.includes(speciesId)) {
      return { success: true };
    }
    if (current.length <= 1) {
      return {
        success: false,
        message: "L'élevage doit contenir au moins une espèce active."
      };
    }

    const updated = current.filter(id => id !== speciesId);
    this.setProfile(updated, this.getProfile().activeBreedIds);
    return { success: true };
  }

  /**
   * Reset profile to defaults.
   */
  static resetToDefault(): void {
    SpeciesProfileRepository.resetProfile();
    this.notifyListeners();
  }
}

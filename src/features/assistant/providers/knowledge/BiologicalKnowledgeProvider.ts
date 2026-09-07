/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  BIOLOGICAL_SPECIES_REGISTRY, 
  BiologicalSpeciesProfile, 
  getBiologicalProfileById, 
  getBiologicalProfileByCode, 
  isSpeciesDocumented, 
  getBiologicalTraceability 
} from '../../../../reference/species/index';
import { SpeciesProfileService } from '../../../species/services/SpeciesProfileService';
import { BiologicalContext } from '../../types/context';
import { Language } from '../../../../utils/translations';

export class BiologicalKnowledgeProvider {
  /**
   * Returns the central biological profile by species id without duplication.
   */
  static getSpeciesProfile(speciesId: string): BiologicalSpeciesProfile | undefined {
    if (!speciesId) return undefined;
    return getBiologicalProfileById(speciesId);
  }

  /**
   * Returns the central biological profile by species code.
   */
  static getSpeciesProfileByCode(code: string): BiologicalSpeciesProfile | undefined {
    if (!code) return undefined;
    return getBiologicalProfileByCode(code);
  }

  /**
   * Retrieves all available biological profiles directly from the central registry.
   */
  static getAllSpeciesProfiles(): BiologicalSpeciesProfile[] {
    return BIOLOGICAL_SPECIES_REGISTRY;
  }

  /**
   * Retrieves biological profiles scoped to the user's active species list.
   */
  static getActiveScopedProfiles(): BiologicalSpeciesProfile[] {
    return SpeciesProfileService.getScopedBiologicalProfiles();
  }

  /**
   * Builds a structured BiologicalContext for assistant reasoning.
   */
  static getBiologicalContext(speciesId: string, language: Language = 'fr'): BiologicalContext | null {
    const profile = this.getSpeciesProfile(speciesId);
    if (!profile) return null;

    const commonName = profile.identity.names[language] || profile.identity.names.fr || profile.identity.id;

    return {
      speciesId: profile.identity.id,
      scientificName: profile.identity.scientificName,
      commonName,
      incubationPeriodDays: profile.reproduction.incubationPeriod,
      bandingAgeDays: profile.reproduction.bandingAge,
      weaningAgeDays: profile.reproduction.weaningAge,
      avgEggsPerClutch: profile.reproduction.avgEggsPerClutch,
      maxEggsPerClutch: profile.reproduction.maxEggsPerClutch,
      avgClutchesPerYear: profile.reproduction.avgClutchesPerYear,
      idealTempRange: {
        min: profile.breeding.minIdealTemp,
        max: profile.breeding.maxIdealTemp
      },
      idealHumidityRange: {
        min: profile.breeding.minHumidity,
        max: profile.breeding.maxHumidity
      },
      bandSize: profile.breeding.bandSize,
      validationStatus: profile.traceability?.validationStatus === 'verified' ? 'verified' : 'unverified',
      profile
    };
  }

  /**
   * Checks whether a species has verified biological documentation.
   */
  static isDocumented(speciesId: string): boolean {
    return isSpeciesDocumented(speciesId);
  }

  /**
   * Returns scientific traceability metadata.
   */
  static getTraceability(speciesId: string) {
    return getBiologicalTraceability(speciesId);
  }

  /**
   * Matches species by name across supported languages (FR, EN, AR, ES, IT) or scientific name.
   */
  static matchSpeciesByName(query: string): BiologicalSpeciesProfile | undefined {
    if (!query) return undefined;
    const normalized = query.trim().toLowerCase();

    return BIOLOGICAL_SPECIES_REGISTRY.find(profile => {
      if (profile.identity.id.toLowerCase() === normalized) return true;
      if (profile.identity.code.toLowerCase() === normalized) return true;
      if (profile.identity.scientificName.toLowerCase().includes(normalized)) return true;

      const names = Object.values(profile.identity.names);
      return names.some(name => name.toLowerCase().includes(normalized) || normalized.includes(name.toLowerCase()));
    });
  }
}

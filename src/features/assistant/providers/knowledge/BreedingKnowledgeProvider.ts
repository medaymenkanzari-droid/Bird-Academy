/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiologicalKnowledgeProvider } from './BiologicalKnowledgeProvider';
import { SpeciesProfileService } from '../../../species/services/SpeciesProfileService';
import { Language } from '../../../../utils/translations';

export interface BreedingParameters {
  speciesId: string;
  incubationDays: number;
  bandingAgeDays: number;
  weaningAgeDays: number;
  clutchSize: { avg: number; max: number };
  nestType: string;
  minCageSize: string;
}

export class BreedingKnowledgeProvider {
  /**
   * Resolves exact incubation duration for a given species.
   */
  static getIncubationDuration(speciesId?: string): number {
    return SpeciesProfileService.getIncubationDays(speciesId);
  }

  /**
   * Retrieves structured breeding parameters from the central biological profile.
   */
  static getBreedingParameters(speciesId: string, language: Language = 'fr'): BreedingParameters | null {
    const profile = BiologicalKnowledgeProvider.getSpeciesProfile(speciesId);
    if (!profile) {
      return {
        speciesId: speciesId || 'canari',
        incubationDays: this.getIncubationDuration(speciesId),
        bandingAgeDays: 6,
        weaningAgeDays: 30,
        clutchSize: { avg: 4, max: 6 },
        nestType: 'Nid standard',
        minCageSize: 'Cage 60cm'
      };
    }

    return {
      speciesId: profile.identity.id,
      incubationDays: profile.reproduction.incubationPeriod,
      bandingAgeDays: profile.reproduction.bandingAge,
      weaningAgeDays: profile.reproduction.weaningAge,
      clutchSize: {
        avg: profile.reproduction.avgEggsPerClutch,
        max: profile.reproduction.maxEggsPerClutch
      },
      nestType: profile.breeding.nestType[language] || profile.breeding.nestType.fr,
      minCageSize: profile.breeding.minCageSize[language] || profile.breeding.minCageSize.fr
    };
  }
}

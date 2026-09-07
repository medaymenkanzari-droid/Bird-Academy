/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Species {
  id: string;
  scientificName: string;
  commonName: {
    fr: string;
    en: string;
    es: string;
    it: string;
    ar: string;
  };
  family: string;
  genus: string;
}

export class SpeciesModel {
  static getDisplayName(species: Species, lang: string): string {
    return (species.commonName as any)[lang] || species.commonName.fr || species.scientificName;
  }
}

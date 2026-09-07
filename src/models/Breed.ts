/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Breed {
  id: string;
  name: string;
  speciesId: string;
  origin?: string;
  description?: string;
}

export class BreedModel {
  static getStandardBreeds(speciesId: string): string[] {
    if (speciesId === 'canari') {
      return ['Canari de Couleur', 'Canari Posture', 'Canari de Chant'];
    }
    if (speciesId === 'chardonneret_elegant') {
      return ['Chardonneret élégant major', 'Chardonneret élégant parva'];
    }
    return ['Standard'];
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Mutation {
  id: string;
  name: string;
  inheritance: 'dominant' | 'recessif' | 'sexe-lie' | 'codominant';
  description?: string;
}

export class MutationModel {
  static getMutations(): string[] {
    return [
      'Classique',
      'Lipochrome Jaune',
      'Lipochrome Rouge',
      'Lipochrome Blanc',
      'Mélanine Noir',
      'Mélanine Brun',
      'Agate',
      'Isabelle',
      'Pastel',
      'Opale',
      'Satiné',
      'Eumo',
      'Topaze',
      'Jaspe'
    ];
  }
}

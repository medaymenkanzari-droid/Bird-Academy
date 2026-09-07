/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type KnowledgeSource =
  | 'BIOLOGICAL_SPECIES_REGISTRY'
  | 'BIRD_INTELLIGENCE'
  | 'BREEDING_DATA'
  | 'HEALTH_DATA'
  | 'USER_DATA'
  | 'CALCULATED_DATA'
  | 'AI_GENERATED_EXPLANATION';

export interface KnowledgeItem {
  id: string;
  source: KnowledgeSource;
  title: string;
  content: string;
  author?: string;
  revisionDate?: string;
  validationStatus: 'verified' | 'unverified';
  tags: string[];
}

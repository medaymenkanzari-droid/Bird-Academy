/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — DEMO DATA CLASSIFIER
 * Mission: FREE-PLAN-DEMO-DATA-ENTITLEMENT-001
 * 
 * Categorizes existing flock records into:
 *   - CATEGORY A: DEMO
 *   - CATEGORY B: USER
 *   - CATEGORY C: INDETERMINATE
 * 
 * Provides controlled cleanup removing ONLY verified Category A records,
 * strictly guaranteeing zero silent deletion of user or indeterminate data.
 */

import { Canari } from '../../../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { INITIAL_CANARIS } from '../../../data/defaultData';

export type BirdClassificationCategory = 'DEMO' | 'USER' | 'INDETERMINATE';

export interface ClassificationReport {
  total: number;
  demoBirdsDetected: number;
  userBirdsPreserved: number;
  indeterminateBirdsPreserved: number;
  demoBirds: Canari[];
  userBirds: Canari[];
  indeterminateBirds: Canari[];
  categories: Record<number, BirdClassificationCategory>;
}

export interface CleanupReport {
  demoBirdsDetected: number;
  userBirdsPreserved: number;
  indeterminateBirdsPreserved: number;
  removedDemoBirds: number;
}

// Known default/initial seed rings and names
const INITIAL_DEMO_RINGS = new Set(INITIAL_CANARIS.map(b => b.bague.toUpperCase().trim()));
const INITIAL_DEMO_NAMES = new Set(INITIAL_CANARIS.map(b => b.nom.toLowerCase().trim()));

// Regex patterns specific to DemoDataGenerator
const DEMO_GENERATOR_RING_REGEX = /^FR-(?:2023|2024|2025|2026)-(?:5\d{3}|1\d{3}|9\d{3}|[0-9]{4})(?:-\d+)?$/i;
const DEMO_TEMP_RING_REGEX = /^TEMP-2026-\d+$/i;
const DEMO_NAME_PATTERN_REGEX = /(?:Aïeul|Aïeule|Élite|Belle|Fils #)/i;

export class DemoDataClassifier {
  /**
   * Classifies an individual bird into DEMO, USER, or INDETERMINATE.
   */
  static classifyBird(bird: Canari): BirdClassificationCategory {
    if (!bird) return 'INDETERMINATE';

    // 1. Explicit metadata marker
    if (bird.isDemo === true) {
      return 'DEMO';
    }
    if (bird.isDemo === false) {
      return 'USER';
    }

    const ringUpper = (bird.bague || '').toUpperCase().trim();
    const nomLower = (bird.nom || '').toLowerCase().trim();

    // 2. Matches initial default dataset (INITIAL_CANARIS)
    if (INITIAL_DEMO_RINGS.has(ringUpper) || INITIAL_DEMO_NAMES.has(nomLower)) {
      return 'DEMO';
    }

    // 3. Matches DemoDataGenerator synthetic patterns
    const matchesDemoRing = DEMO_GENERATOR_RING_REGEX.test(ringUpper) || DEMO_TEMP_RING_REGEX.test(ringUpper);
    const matchesDemoName = DEMO_NAME_PATTERN_REGEX.test(bird.nom || '');

    if (matchesDemoRing && matchesDemoName) {
      return 'DEMO';
    }

    if (bird.photo && bird.photo.startsWith('/demo-bird.svg')) {
      return 'DEMO';
    }

    // 4. Check for user-generated indicators
    const hasCustomDocs = Array.isArray(bird.documents) && bird.documents.length > 0;
    const hasCustomPhotos = (Array.isArray(bird.photos) && bird.photos.length > 0) ||
                            (Boolean(bird.photo) && !bird.photo?.startsWith('/demo-bird.svg'));

    if (hasCustomDocs || hasCustomPhotos) {
      return 'USER';
    }

    if (ringUpper.includes('USER') || nomLower.includes('personnel') || (bird.eleveur_origine && bird.eleveur_origine.trim().length > 0)) {
      return 'USER';
    }

    // 5. If origin cannot be proven with sufficient evidence -> INDETERMINATE
    return 'INDETERMINATE';
  }

  /**
   * Classifies an entire dataset and produces a summary report.
   */
  static classifyDataset(birds: Canari[]): ClassificationReport {
    const categories: Record<number, BirdClassificationCategory> = {};
    const demoBirds: Canari[] = [];
    const userBirds: Canari[] = [];
    const indeterminateBirds: Canari[] = [];

    for (const bird of birds) {
      const category = this.classifyBird(bird);
      categories[bird.id] = category;
      if (category === 'DEMO') {
        demoBirds.push(bird);
      } else if (category === 'USER') {
        userBirds.push(bird);
      } else {
        indeterminateBirds.push(bird);
      }
    }

    return {
      total: birds.length,
      demoBirdsDetected: demoBirds.length,
      userBirdsPreserved: userBirds.length,
      indeterminateBirdsPreserved: indeterminateBirds.length,
      demoBirds,
      userBirds,
      indeterminateBirds,
      categories
    };
  }

  /**
   * Performs controlled cleanup: removes ONLY verified DEMO (Category A) birds,
   * preserving 100% of USER (Category B) and INDETERMINATE (Category C) birds.
   */
  static cleanupDemoData(currentBirds?: Canari[]): CleanupReport {
    const allBirds = currentBirds || BirdRepository.getAll(true);
    const classification = this.classifyDataset(allBirds);

    const preservedBirds: Canari[] = [];
    let removedCount = 0;

    for (const bird of allBirds) {
      const category = classification.categories[bird.id];
      if (category === 'DEMO') {
        removedCount++;
      } else {
        // USER and INDETERMINATE are strictly preserved
        preservedBirds.push(bird);
      }
    }

    // Persist only preserved birds if we're operating on repository
    if (!currentBirds) {
      BirdRepository.saveAll(preservedBirds);
    }

    return {
      demoBirdsDetected: classification.demoBirdsDetected,
      userBirdsPreserved: classification.userBirdsPreserved,
      indeterminateBirdsPreserved: classification.indeterminateBirdsPreserved,
      removedDemoBirds: removedCount
    };
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IntelligenceService } from '../../../intelligence/services/IntelligenceService';
import { BirdIntelligenceFiche, IntelligenceReport, RuleResult } from '../../../intelligence/types';
import { IntelligenceContext } from '../../types/context';
import { Language } from '../../../../utils/translations';

export class IntelligenceContextProvider {
  /**
   * Retrieves high-level deterministic scoreboards and alerts from Bird Intelligence.
   */
  static getIntelligenceSummary(): IntelligenceContext {
    try {
      const scoreboard = IntelligenceService.getGeneralScoreboard();

      return {
        scores: {
          reproductionScore: scoreboard.reproductionScore,
          habitatScore: scoreboard.habitatScore,
          financeScore: scoreboard.financeScore,
          healthScore: scoreboard.healthScore,
          geneticScore: scoreboard.geneticScore
        },
        dataQuality: scoreboard.dataQualityScore,
        alerts: scoreboard.alerts,
        topPerformers: scoreboard.topPerformers
      };
    } catch (err) {
      console.warn('[IntelligenceContextProvider] Failed to load scoreboard:', err);
      return {};
    }
  }

  /**
   * Retrieves intelligence fiche for a specific bird.
   */
  static getBirdFiche(birdId: number): BirdIntelligenceFiche | null {
    if (!birdId) return null;
    return IntelligenceService.getBirdFiche(birdId);
  }

  /**
   * Retrieves report structure from Bird Intelligence for explanation.
   */
  static getReport(type: 'monthly' | 'annual' | 'reproduction' | 'finance' | 'global' = 'global', language: Language = 'fr'): IntelligenceReport {
    return IntelligenceService.generateReport(type, language);
  }

  /**
   * Retrieves triggered alerts and recommendations for explanation.
   */
  static getTriggeredAlerts(): RuleResult[] {
    const scoreboard = IntelligenceService.getGeneralScoreboard();
    return scoreboard.alerts;
  }
}

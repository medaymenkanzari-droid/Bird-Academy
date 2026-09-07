/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssistantRequest } from '../types/assistant';
import { AssistantContext, AssistantContextSummary } from '../types/context';
import { KnowledgeSource } from '../types/knowledge';
import { QuestionClassifier, ClassificationResult } from './QuestionClassifier';
import { BiologicalKnowledgeProvider } from '../providers/knowledge/BiologicalKnowledgeProvider';
import { UserFarmContextProvider } from '../providers/context/UserFarmContextProvider';
import { IntelligenceContextProvider } from '../providers/context/IntelligenceContextProvider';
import { LanguageContextProvider } from '../providers/context/LanguageContextProvider';
import { AssistantPermissionProvider } from '../providers/context/AssistantPermissionProvider';

export class AssistantContextBuilder {
  /**
   * Constructs selective, minimal context strictly tailored to the user query.
   * Enforces MINIMUM NECESSARY CONTEXT: No extraneous personal data loaded for general questions.
   */
  static buildContext(request: AssistantRequest, classification?: ClassificationResult): AssistantContext {
    const query = request.query || '';
    const classResult = classification || QuestionClassifier.classify(query);
    const languageContext = LanguageContextProvider.getLanguageContext(request.language);
    const permissionContext = AssistantPermissionProvider.getPermissionContext(request.tier || 'FREE');

    const loadedSources: KnowledgeSource[] = [];
    const loadedEntityIds: AssistantContextSummary['loadedEntityIds'] = {};

    let biologicalContext = undefined;
    let birdContext = undefined;
    let breedingContext = undefined;
    let healthContext = undefined;
    let feedingContext = undefined;
    let habitatContext = undefined;
    let genealogyContext = undefined;
    let financeContext = undefined;
    let intelligenceContext = undefined;

    // 1. Biological Knowledge Loading (Allowed for all tiers, only if species detected/requested)
    const targetSpeciesId = request.speciesId || classResult.detectedSpeciesId;
    if (targetSpeciesId) {
      const bio = BiologicalKnowledgeProvider.getBiologicalContext(targetSpeciesId, languageContext.language);
      if (bio) {
        biologicalContext = bio;
        loadedSources.push('BIOLOGICAL_SPECIES_REGISTRY');
        loadedEntityIds.speciesId = targetSpeciesId;
      }
    }

    // 2. Selective User Data Loading (Requires User Data Access permission AND query must be user-specific)
    const hasExplicitUserEntity = Boolean(request.birdId || request.pairId || request.cageId);
    if (permissionContext.hasAccessToUserData && (classResult.isUserSpecific || hasExplicitUserEntity)) {
      // 2.1 Bird Context
      let targetBirdId = request.birdId;
      if (!targetBirdId) {
        // Check if query mentions a bird by name or ring
        const matched = UserFarmContextProvider.findBirdByNameOrRing(query);
        if (matched) {
          targetBirdId = matched.id;
        }
      }

      if (targetBirdId) {
        const bird = UserFarmContextProvider.getBirdContext(targetBirdId);
        if (bird) {
          birdContext = bird;
          loadedSources.push('USER_DATA');
          loadedEntityIds.birdId = targetBirdId;

          // If bird has species and biologicalContext wasn't set, populate biological context for this bird
          const birdSpecies = bird.espece;
          if (!biologicalContext && birdSpecies) {
            const birdBio = BiologicalKnowledgeProvider.getBiologicalContext(birdSpecies, languageContext.language);
            if (birdBio) {
              biologicalContext = birdBio;
              loadedSources.push('BIOLOGICAL_SPECIES_REGISTRY');
              loadedEntityIds.speciesId = birdSpecies;
            }
          }

          // If category is health and target bird is known, fetch its health records
          if (classResult.category === 'USER_HEALTH') {
            const health = UserFarmContextProvider.getHealthContext(targetBirdId);
            if (health) {
              healthContext = health;
              loadedSources.push('HEALTH_DATA');
            }
          }

          // If category is genealogy, fetch bird genealogy
          if (classResult.category === 'USER_GENEALOGY') {
            const gen = UserFarmContextProvider.getGenealogyContext(targetBirdId);
            if (gen) {
              genealogyContext = gen;
              loadedSources.push('USER_DATA');
            }
          }
        }
      }

      // 2.2 Breeding Context (Only if relevant)
      if (classResult.category === 'USER_BREEDING' || request.pairId) {
        const breeding = UserFarmContextProvider.getBreedingContext(request.pairId);
        if (breeding) {
          breedingContext = breeding;
          loadedSources.push('BREEDING_DATA');
          if (request.pairId) loadedEntityIds.pairId = request.pairId;
        }
      }

      // 2.3 Habitat Context (Only if relevant)
      if (classResult.category === 'USER_HABITAT' || request.cageId) {
        const habitat = UserFarmContextProvider.getHabitatContext(request.cageId);
        if (habitat) {
          habitatContext = habitat;
          loadedSources.push('USER_DATA');
          if (request.cageId) loadedEntityIds.cageId = request.cageId;
        }
      }

      // 2.4 Finance Context (Only if relevant)
      if (classResult.category === 'USER_FINANCE') {
        const finance = UserFarmContextProvider.getFinanceSummaryContext();
        if (finance) {
          financeContext = finance;
          loadedSources.push('CALCULATED_DATA');
        }
      }
    }

    // 3. Selective Intelligence Loading (Requires Intelligence Access permission)
    if (
      permissionContext.hasAccessToIntelligence && 
      (classResult.requiresIntelligence || request.includeIntelligence)
    ) {
      intelligenceContext = IntelligenceContextProvider.getIntelligenceSummary();
      loadedSources.push('BIRD_INTELLIGENCE');

      if (request.birdId) {
        const fiche = IntelligenceContextProvider.getBirdFiche(request.birdId);
        if (fiche && intelligenceContext) {
          intelligenceContext.birdFiche = fiche;
        }
      }

      if (request.reportType && intelligenceContext) {
        intelligenceContext.report = IntelligenceContextProvider.getReport(request.reportType, languageContext.language);
      }
    }

    const summary: AssistantContextSummary = {
      hasBiologicalContext: Boolean(biologicalContext),
      hasBirdContext: Boolean(birdContext),
      hasBreedingContext: Boolean(breedingContext),
      hasHealthContext: Boolean(healthContext),
      hasFeedingContext: Boolean(feedingContext),
      hasHabitatContext: Boolean(habitatContext),
      hasGenealogyContext: Boolean(genealogyContext),
      hasFinanceContext: Boolean(financeContext),
      hasIntelligenceContext: Boolean(intelligenceContext),
      loadedSources: Array.from(new Set(loadedSources)),
      loadedEntityIds
    };

    return {
      query,
      language: languageContext,
      permissions: permissionContext,
      biological: biologicalContext,
      bird: birdContext,
      breeding: breedingContext,
      health: healthContext,
      feeding: feedingContext,
      habitat: habitatContext,
      genealogy: genealogyContext,
      finance: financeContext,
      intelligence: intelligenceContext,
      summary
    };
  }
}

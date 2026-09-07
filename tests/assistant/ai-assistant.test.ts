/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — ASSISTANT IA UNIT & INTEGRATION TEST SUITE
 * Complete validation of the 100% Offline AI Assistant subsystem.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  AssistantService,
  AssistantOrchestrator,
  QuestionClassifier,
  AssistantContextBuilder,
  AssistantPermissionService,
  AssistantPermissionProvider,
  BiologicalKnowledgeProvider,
  SafetyGuardService,
  LocalAIProvider,
  QuotaManager,
  LanguageContextProvider,
  UserFarmContextProvider,
  TIER_CONFIGURATIONS
} from '../../src/features/assistant';
import { BIOLOGICAL_SPECIES_REGISTRY } from '../../src/reference/species';

describe('AI Assistant Pro Offline — Comprehensive Test Suite', () => {
  beforeEach(() => {
    QuotaManager.reset();
  });

  // 1. QUESTION CLASSIFIER
  describe('1. QuestionClassifier', () => {
    test('classifies general biological question without user context', () => {
      const result = QuestionClassifier.classify("Quelle est la durée d'incubation du canari ?");
      assert.ok(['GENERAL_BIOLOGY', 'GENERAL_BREEDING'].includes(result.category));
      assert.equal(result.isUserSpecific, false);
      assert.equal(result.detectedSpeciesId, 'canari');
      assert.equal(result.requiresIntelligence, false);
    });

    test('classifies goldfinch general biology query', () => {
      const result = QuestionClassifier.classify("Quelle est la durée d'incubation du chardonneret ?");
      assert.ok(['GENERAL_BIOLOGY', 'GENERAL_BREEDING'].includes(result.category));
      assert.equal(result.isUserSpecific, false);
      assert.equal(result.detectedSpeciesId, 'chardonneret_elegant');
    });

    test('classifies personal bird query with user cues', () => {
      const result = QuestionClassifier.classify("Pourquoi mon canari Titan a un score faible ?");
      assert.equal(result.isUserSpecific, true);
      assert.equal(result.category, 'INTELLIGENCE_EXPLANATION');
      assert.equal(result.requiresIntelligence, true);
    });

    test('classifies personal breeding query', () => {
      const result = QuestionClassifier.classify("Analyse mon dernier cycle de reproduction pour mon couple");
      assert.equal(result.isUserSpecific, true);
      assert.equal(result.category, 'USER_BREEDING');
    });

    test('classifies personal health query', () => {
      const result = QuestionClassifier.classify("Mon oiseau semble malade et respire mal");
      assert.equal(result.isUserSpecific, true);
      assert.equal(result.category, 'USER_HEALTH');
    });

    test('classifies general health query', () => {
      const result = QuestionClassifier.classify("Quels sont les symptômes de la variole aviaire ?");
      assert.equal(result.isUserSpecific, false);
      assert.equal(result.category, 'GENERAL_HEALTH');
    });

    test('classifies multilingual queries (AR, EN, ES, IT)', () => {
      const arResult = QuestionClassifier.classify("ما هي فترة حضانة الكناري؟");
      assert.ok(['GENERAL_BIOLOGY', 'GENERAL_BREEDING'].includes(arResult.category));
      assert.equal(arResult.detectedSpeciesId, 'canari');

      const enResult = QuestionClassifier.classify("Analyze my bird breeding cycle");
      assert.equal(enResult.isUserSpecific, true);
      assert.equal(enResult.category, 'USER_BREEDING');

      const esResult = QuestionClassifier.classify("¿Cuál es el período de incubación del canario?");
      assert.ok(['GENERAL_BIOLOGY', 'GENERAL_BREEDING'].includes(esResult.category));

      const itResult = QuestionClassifier.classify("Analizza il mio allevamento");
      assert.equal(itResult.isUserSpecific, true);
    });
  });

  // 2. BIOLOGICAL KNOWLEDGE PROVIDER & REGISTRY
  describe('2. BiologicalKnowledgeProvider & Registry', () => {
    test('retrieves certified canary profile with exact 13 days incubation', () => {
      const profile = BiologicalKnowledgeProvider.getSpeciesProfile('canari');
      assert.ok(profile);
      assert.equal(profile.identity.id, 'canari');
      assert.equal(profile.reproduction.incubationPeriod, 13);
      assert.equal(profile.reproduction.bandingAge, 6);
      assert.equal(profile.traceability?.validationStatus, 'verified');
    });

    test('retrieves certified goldfinch profile with exact 12 days incubation', () => {
      const profile = BiologicalKnowledgeProvider.getSpeciesProfile('chardonneret_elegant');
      assert.ok(profile);
      assert.equal(profile.identity.id, 'chardonneret_elegant');
      assert.equal(profile.reproduction.incubationPeriod, 12);
      assert.equal(profile.reproduction.bandingAge, 5);
      assert.equal(profile.traceability?.validationStatus, 'verified');
    });

    test('returns undefined for unknown species ID without falling back to canary', () => {
      const profile = BiologicalKnowledgeProvider.getSpeciesProfile('inconnu_xyz');
      assert.equal(profile, undefined);
    });

    test('matches species by name across languages', () => {
      const matchedFr = BiologicalKnowledgeProvider.matchSpeciesByName('canari');
      assert.equal(matchedFr?.identity.id, 'canari');

      const matchedAr = BiologicalKnowledgeProvider.matchSpeciesByName('حسون');
      assert.equal(matchedAr?.identity.id, 'chardonneret_elegant');
    });
  });

  // 3. MINIMUM NECESSARY CONTEXT
  describe('3. Minimum Necessary Context Builder', () => {
    test('general query does NOT load personal user data (Privacy by Design)', () => {
      const context = AssistantContextBuilder.buildContext({
        query: "Quelle est la durée d'incubation du canari ?",
        language: 'fr',
        tier: 'FREE'
      });

      assert.ok(context.biological);
      assert.equal(context.biological.speciesId, 'canari');
      assert.equal(context.bird, undefined);
      assert.equal(context.breeding, undefined);
      assert.equal(context.health, undefined);
      assert.equal(context.finance, undefined);
      assert.equal(context.intelligence, undefined);
      assert.equal(context.summary.hasBirdContext, false);
      assert.equal(context.summary.hasFinanceContext, false);
      assert.ok(context.summary.loadedSources.includes('BIOLOGICAL_SPECIES_REGISTRY'));
      assert.ok(!context.summary.loadedSources.includes('USER_DATA'));
    });

    test('FREE tier asking personal question does NOT load personal data', () => {
      const context = AssistantContextBuilder.buildContext({
        query: "Pourquoi mon canari Titan a un problème ?",
        language: 'fr',
        tier: 'FREE'
      });

      assert.equal(context.permissions.hasAccessToUserData, false);
      assert.equal(context.bird, undefined);
      assert.equal(context.summary.hasBirdContext, false);
    });

    test('unknown species does not load fallback canary', () => {
      const context = AssistantContextBuilder.buildContext({
        query: "Informations sur l'espèce inconnue",
        language: 'fr',
        speciesId: 'inconnu_xyz',
        tier: 'PRO'
      });

      assert.equal(context.biological, undefined);
      assert.equal(context.summary.hasBiologicalContext, false);
    });
  });

  // 4. QUOTA MANAGER
  describe('4. QuotaManager', () => {
    test('FREE tier has 10 queries per day', () => {
      const usage = QuotaManager.getUsage('FREE');
      assert.equal(usage.limit, 10);
      assert.equal(usage.used, 0);
      assert.equal(usage.remaining, 10);
      assert.equal(usage.isExceeded, false);
      assert.equal(QuotaManager.canAsk('FREE'), true);
    });

    test('PREMIUM tier has 100 queries per day', () => {
      const usage = QuotaManager.getUsage('PREMIUM');
      assert.equal(usage.limit, 100);
      assert.equal(usage.used, 0);
      assert.equal(usage.remaining, 100);
      assert.equal(usage.isExceeded, false);
    });

    test('PRO tier has unlimited queries', () => {
      const usage = QuotaManager.getUsage('PRO');
      assert.equal(usage.limit, null);
      assert.equal(usage.remaining, null);
      assert.equal(usage.isExceeded, false);
      assert.equal(QuotaManager.canAsk('PRO'), true);
    });

    test('consuming FREE quota stops at limit 10', () => {
      for (let i = 0; i < 10; i++) {
        const ok = QuotaManager.consume('FREE');
        assert.equal(ok, true);
      }

      const usageAfter10 = QuotaManager.getUsage('FREE');
      assert.equal(usageAfter10.used, 10);
      assert.equal(usageAfter10.remaining, 0);
      assert.equal(usageAfter10.isExceeded, true);
      assert.equal(QuotaManager.canAsk('FREE'), false);

      // 11th request is denied
      const ok11 = QuotaManager.consume('FREE');
      assert.equal(ok11, false);
    });

    test('resetting restores quota counts', () => {
      QuotaManager.consume('FREE');
      QuotaManager.consume('FREE');
      assert.equal(QuotaManager.getUsage('FREE').used, 2);

      QuotaManager.reset('FREE');
      assert.equal(QuotaManager.getUsage('FREE').used, 0);
      assert.equal(QuotaManager.canAsk('FREE'), true);
    });
  });

  // 5. PERMISSIONS & COMMERCIAL MATRIX
  describe('5. AssistantPermissionService & AssistantPermissionProvider', () => {
    test('FREE tier authorizes general biology and general knowledge', () => {
      const bioAuth = AssistantPermissionService.checkAuthorization('FREE', 'GENERAL_BIOLOGY');
      assert.equal(bioAuth.isAuthorized, true);

      const breedAuth = AssistantPermissionService.checkAuthorization('FREE', 'GENERAL_BREEDING');
      assert.equal(breedAuth.isAuthorized, true);

      const healthAuth = AssistantPermissionService.checkAuthorization('FREE', 'GENERAL_HEALTH');
      assert.equal(healthAuth.isAuthorized, true);
    });

    test('FREE tier rejects personal user queries and advises upgrade', () => {
      const birdAuth = AssistantPermissionService.checkAuthorization('FREE', 'USER_BIRD');
      assert.equal(birdAuth.isAuthorized, false);
      assert.equal(birdAuth.recommendedTier, 'PREMIUM');
      assert.ok(birdAuth.reason?.includes('PREMIUM'));

      const intelAuth = AssistantPermissionService.checkAuthorization('FREE', 'INTELLIGENCE_EXPLANATION');
      assert.equal(intelAuth.isAuthorized, false);
      assert.equal(intelAuth.recommendedTier, 'PRO');
    });

    test('PREMIUM tier authorizes bird context & breeding but rejects Bird Intelligence and advanced reports', () => {
      const birdAuth = AssistantPermissionService.checkAuthorization('PREMIUM', 'USER_BIRD');
      assert.equal(birdAuth.isAuthorized, true);

      const breedAuth = AssistantPermissionService.checkAuthorization('PREMIUM', 'USER_BREEDING');
      assert.equal(breedAuth.isAuthorized, true);

      const healthAuth = AssistantPermissionService.checkAuthorization('PREMIUM', 'USER_HEALTH');
      assert.equal(healthAuth.isAuthorized, true);

      const intelAuth = AssistantPermissionService.checkAuthorization('PREMIUM', 'INTELLIGENCE_EXPLANATION');
      assert.equal(intelAuth.isAuthorized, false);
      assert.equal(intelAuth.recommendedTier, 'PRO');

      const reportAuth = AssistantPermissionService.checkAuthorization('PREMIUM', 'REPORT_EXPLANATION');
      assert.equal(reportAuth.isAuthorized, false);
      assert.equal(reportAuth.recommendedTier, 'PRO');
    });

    test('PRO tier authorizes all capabilities with zero restrictions', () => {
      const categories = [
        'GENERAL_BIOLOGY', 'GENERAL_BREEDING', 'GENERAL_HEALTH', 'GENERAL_FEEDING', 'GENERAL_HABITAT',
        'USER_BIRD', 'USER_BREEDING', 'USER_HEALTH', 'USER_FEEDING', 'USER_HABITAT',
        'USER_FINANCE', 'USER_GENEALOGY', 'INTELLIGENCE_EXPLANATION', 'REPORT_EXPLANATION'
      ] as const;

      for (const cat of categories) {
        const auth = AssistantPermissionService.checkAuthorization('PRO', cat);
        assert.equal(auth.isAuthorized, true, `PRO should authorize category ${cat}`);
      }
    });
  });

  // 6. SAFETY GUARD
  describe('6. SafetyGuardService', () => {
    test('attaches veterinary disclaimer for health-related queries', () => {
      const frGuard = SafetyGuardService.evaluateSafety('GENERAL_HEALTH', 'Quels sont les traitements pour la gale ?', 'fr');
      assert.equal(frGuard.requiresVeterinaryNotice, true);
      assert.ok(frGuard.disclaimers.length > 0);
      assert.ok(frGuard.disclaimers[0].includes('vétérinaire'));

      const enGuard = SafetyGuardService.evaluateSafety('USER_HEALTH', 'My bird is sick', 'en');
      assert.equal(enGuard.requiresVeterinaryNotice, true);
      assert.ok(enGuard.disclaimers[0].includes('veterinarian'));

      const arGuard = SafetyGuardService.evaluateSafety('GENERAL_HEALTH', 'طائري مريض', 'ar');
      assert.equal(arGuard.requiresVeterinaryNotice, true);
      assert.ok(arGuard.disclaimers[0].includes('بيطري'));
    });

    test('does not attach veterinary disclaimer for breeding or biology questions', () => {
      const bioGuard = SafetyGuardService.evaluateSafety('GENERAL_BIOLOGY', 'Quelle est la durée d incubation ?', 'fr');
      assert.equal(bioGuard.requiresVeterinaryNotice, false);
      assert.equal(bioGuard.disclaimers.length, 0);
    });
  });

  // 7. LOCAL AI PROVIDER & ORCHESTRATOR
  describe('7. LocalAIProvider & AssistantOrchestrator Pipeline', () => {
    test('orchestrator answers canary incubation deterministically from registry', async () => {
      const orchestrator = new AssistantOrchestrator();
      const response = await orchestrator.process({
        query: "Quelle est la durée d'incubation du canari ?",
        language: 'fr',
        tier: 'FREE'
      });

      assert.ok(response.answer.includes('13 jours'));
      assert.ok(response.sources.includes('BIOLOGICAL_SPECIES_REGISTRY'));
      assert.equal(response.confidence, 'HIGH');
      assert.equal(response.isRtl, false);
    });

    test('orchestrator answers goldfinch incubation deterministically from registry', async () => {
      const orchestrator = new AssistantOrchestrator();
      const response = await orchestrator.process({
        query: "Quelle est la durée d'incubation du chardonneret ?",
        language: 'fr',
        tier: 'FREE'
      });

      assert.ok(response.answer.includes('12 jours'));
      assert.ok(response.sources.includes('BIOLOGICAL_SPECIES_REGISTRY'));
      assert.equal(response.confidence, 'HIGH');
    });

    test('orchestrator handles unknown species cleanly with localized message', async () => {
      const orchestrator = new AssistantOrchestrator();
      const response = await orchestrator.process({
        query: "Informations pour inconnu_xyz",
        speciesId: 'inconnu_xyz',
        language: 'fr',
        tier: 'PRO'
      });

      assert.equal(response.answer, "Informations biologiques non disponibles pour cette espèce.");
      assert.ok(response.warnings.includes('SPECIES_NOT_DOCUMENTED'));
    });

    test('orchestrator enforces Arabic RTL', async () => {
      const orchestrator = new AssistantOrchestrator();
      const response = await orchestrator.process({
        query: "ما هي فترة حضانة الكناري؟",
        language: 'ar',
        tier: 'FREE'
      });

      assert.equal(response.isRtl, true);
      assert.ok(response.answer.includes('13'));
      assert.ok(response.sources.includes('BIOLOGICAL_SPECIES_REGISTRY'));
    });

    test('orchestrator blocks requests when quota is exceeded', async () => {
      const orchestrator = new AssistantOrchestrator();

      // Consume full quota
      for (let i = 0; i < 10; i++) {
        QuotaManager.consume('FREE');
      }

      const response = await orchestrator.process({
        query: "Quelle est la durée d'incubation du canari ?",
        language: 'fr',
        tier: 'FREE'
      });

      assert.equal(response.responseType, 'WARNING');
      assert.ok(response.warnings.includes('QUOTA_EXCEEDED'));
      assert.ok(response.answer.includes('quota'));
    });

    test('orchestrator reports UNAVAILABLE engine honestly for unresolvable general query', async () => {
      const orchestrator = new AssistantOrchestrator();
      const response = await orchestrator.process({
        query: "Raconte-moi une histoire drôle sur les oiseaux",
        language: 'fr',
        tier: 'PRO'
      });

      assert.equal(response.responseType, 'UNAVAILABLE');
      assert.ok(response.warnings.includes('AI_ENGINE_UNAVAILABLE'));
      assert.ok(response.answer.includes("n'est pas disponible sur cet appareil"));
    });
  });

  // 8. ASSISTANT SERVICE SINGLETON
  describe('8. AssistantService Facade', () => {
    test('provides singleton access and quota helpers', async () => {
      const service = AssistantService.getInstance();
      assert.ok(service);
      assert.equal(service.isOffline(), true);

      const usage = service.getQuotaUsage('FREE');
      assert.equal(usage.limit, 10);
      assert.equal(service.canAsk('FREE'), true);

      const response = await service.ask({
        query: "Quelle est la durée d'incubation du canari ?",
        language: 'fr',
        tier: 'PRO'
      });

      assert.ok(response.answer.includes('13 jours'));
    });
  });
});

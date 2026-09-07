/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { test, describe, beforeEach } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage for node test runner before imports
class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
}

// Import assistant subsystem
import { 
  AssistantService,
  AssistantOrchestrator,
  LocalAIProvider,
  AIProvider,
  BiologicalKnowledgeProvider,
  BreedingKnowledgeProvider,
  UserFarmContextProvider,
  IntelligenceContextProvider,
  LanguageContextProvider,
  AssistantPermissionProvider,
  QuestionClassifier,
  AssistantContextBuilder,
  AssistantPermissionService,
  SafetyGuardService,
  AssistantRequest,
  AssistantResponse,
  AssistantContext
} from '../src/features/assistant/index';

// Import existing central repositories & biological registry
import { BIOLOGICAL_SPECIES_REGISTRY, getBiologicalProfileById } from '../src/reference/species/index';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { appStorage } from '../src/storage';

describe('MISSION — AI-ASSISTANT-FOUNDATION-ARCH-01 ARCHITECTURE FOUNDATION', () => {
  const rootDir = process.cwd();

  beforeEach(() => {
    // Setup test storage state with one mock bird
    appStorage.setItem('canaris', [
      {
        id: 101,
        nom: 'Titan',
        bague: '2026-FR-101',
        sexe: 'Mâle',
        espece: 'canari',
        race: 'Gloster',
        couleur: 'Vert schimmel',
        date_naissance: '2025-05-15',
        archived: false
      }
    ]);
  });

  test('AI-ARCH-01 : AssistantService exists and provides public interface', () => {
    assert.ok(AssistantService, 'AssistantService class must exist');
    const service = AssistantService.getInstance();
    assert.ok(service, 'AssistantService.getInstance() must return an instance');
    assert.strictEqual(typeof service.ask, 'function', 'ask() method must be a function');
    assert.strictEqual(typeof service.getStatus, 'function', 'getStatus() method must be a function');
    assert.strictEqual(typeof service.isOffline, 'function', 'isOffline() method must be a function');
    assert.strictEqual(typeof service.setAIProvider, 'function', 'setAIProvider() method must be a function');
  });

  test('AI-ARCH-02 : AIProvider abstraction exists with required contract', () => {
    const localProvider = new LocalAIProvider();
    assert.ok(localProvider, 'LocalAIProvider instance must be constructible');
    assert.strictEqual(typeof localProvider.generateResponse, 'function', 'generateResponse must exist');
    assert.strictEqual(typeof localProvider.getStatus, 'function', 'getStatus must exist');
    assert.strictEqual(typeof localProvider.isOffline, 'function', 'isOffline must exist');
    assert.strictEqual(typeof localProvider.getProviderId, 'function', 'getProviderId must exist');
    assert.strictEqual(localProvider.isOffline(), true, 'LocalAIProvider must operate offline');
  });

  test('AI-ARCH-03 : AssistantService does not depend on a concrete AI vendor and can swap providers', async () => {
    class CustomMockProvider implements AIProvider {
      generateResponse(request: AssistantRequest, context: AssistantContext): AssistantResponse {
        return {
          answer: `Custom answer for ${request.query}`,
          language: request.language,
          confidence: 'HIGH',
          sources: ['AI_GENERATED_EXPLANATION'],
          contextUsed: context.summary,
          warnings: [],
          generatedAt: new Date().toISOString(),
          responseType: 'GENERAL_INFORMATION',
          status: 'AVAILABLE',
          isRtl: context.language.isRtl
        };
      }
      getStatus() { return 'AVAILABLE' as const; }
      isOffline() { return true; }
      getProviderId() { return 'custom-mock-ai'; }
    }

    const service = new AssistantService(new AssistantOrchestrator(new CustomMockProvider()));
    const response = await service.ask({
      query: "Quelle est la durée d'incubation du canari ?",
      language: 'fr',
      tier: 'FREE'
    });

    assert.ok(response.answer.includes("Custom answer for Quelle est la durée d'incubation du canari ?"));
    assert.strictEqual(service.getAIProvider().getProviderId(), 'custom-mock-ai');
  });

  test('AI-ARCH-04 : No network calls are performed (offline-first execution)', async () => {
    const service = new AssistantService();
    const response = await service.ask({
      query: "Quelle est la durée d'incubation d'un diamant mandarin ?",
      language: 'fr',
      tier: 'FREE'
    });

    assert.ok(response, 'Response must be returned synchronously/locally');
    assert.strictEqual(service.isOffline(), true, 'Service must report offline mode true');
    assert.ok(['AVAILABLE', 'UNAVAILABLE'].includes(response.status), 'Valid engine status');
  });

  test('AI-ARCH-05 : Central biological registry is used as source by BiologicalKnowledgeProvider', () => {
    const profile = BiologicalKnowledgeProvider.getSpeciesProfile('canari');
    assert.ok(profile, 'Canari biological profile must be retrievable');
    assert.strictEqual(profile?.identity.scientificName, 'Serinus canaria domestica');
    assert.strictEqual(profile?.reproduction.incubationPeriod, 13);

    const goldfinch = BiologicalKnowledgeProvider.getSpeciesProfile('chardonneret_elegant');
    assert.ok(goldfinch, 'Goldfinch profile must be retrievable');
    assert.strictEqual(goldfinch?.identity.scientificName, 'Carduelis carduelis');
  });

  test('AI-ARCH-06 : No second biological registry is created', () => {
    const allProfiles = BiologicalKnowledgeProvider.getAllSpeciesProfiles();
    assert.strictEqual(allProfiles, BIOLOGICAL_SPECIES_REGISTRY, 'Must point to the exact same array reference');
  });

  test('AI-ARCH-07 : User context is selective (fetches only the target bird)', () => {
    const request: AssistantRequest = {
      query: "Quel est l'âge de Titan ?",
      language: 'fr',
      birdId: 101,
      tier: 'PREMIUM'
    };

    const context = AssistantContextBuilder.buildContext(request);
    assert.ok(context.bird, 'BirdContext must be loaded');
    assert.strictEqual(context.bird?.nom, 'Titan');
    assert.strictEqual(context.bird?.id, 101);
    assert.strictEqual(context.summary.hasBirdContext, true);
    assert.strictEqual(context.summary.hasFinanceContext, false, 'Finance context must NOT be loaded');
    assert.strictEqual(context.summary.hasHabitatContext, false, 'Habitat context must NOT be loaded');
  });

  test('AI-ARCH-08 : General question does not load personal user farm data', () => {
    const request: AssistantRequest = {
      query: "Quelle est la durée d'incubation du canari ?",
      language: 'fr',
      tier: 'FREE'
    };

    const context = AssistantContextBuilder.buildContext(request);
    assert.strictEqual(context.summary.hasBirdContext, false, 'General question must not load bird context');
    assert.strictEqual(context.summary.hasBreedingContext, false, 'General question must not load breeding context');
    assert.strictEqual(context.summary.hasFinanceContext, false, 'General question must not load finance context');
    assert.strictEqual(context.summary.hasHealthContext, false, 'General question must not load health context');
    assert.strictEqual(context.summary.hasBiologicalContext, true, 'General question loads biological knowledge');
    assert.strictEqual(context.biological?.speciesId, 'canari');
  });

  test('AI-ARCH-09 : Bird Intelligence is exposed as structured context without replacing rule engine', () => {
    const summary = IntelligenceContextProvider.getIntelligenceSummary();
    assert.ok(summary, 'Intelligence summary must be retrievable');
    assert.ok(summary.scores !== undefined, 'Scores must be defined');

    const request: AssistantRequest = {
      query: "Pourquoi cette alerte de consanguinité apparaît ?",
      language: 'fr',
      tier: 'PREMIUM'
    };
    const context = AssistantContextBuilder.buildContext(request);
    assert.strictEqual(context.summary.hasIntelligenceContext, true);
  });

  test('AI-ARCH-10 : Active language is retrievable via LanguageContextProvider', () => {
    const langCtx = LanguageContextProvider.getLanguageContext('fr');
    assert.strictEqual(langCtx.language, 'fr');
    assert.strictEqual(langCtx.isRtl, false);
    assert.strictEqual(langCtx.locale, 'fr-FR');
  });

  test('AI-ARCH-11 : FR supported', () => {
    const ctx = LanguageContextProvider.getLanguageContext('fr');
    assert.strictEqual(ctx.language, 'fr');
    assert.strictEqual(ctx.isRtl, false);
  });

  test('AI-ARCH-12 : EN supported', () => {
    const ctx = LanguageContextProvider.getLanguageContext('en');
    assert.strictEqual(ctx.language, 'en');
    assert.strictEqual(ctx.isRtl, false);
  });

  test('AI-ARCH-13 : AR supported', () => {
    const ctx = LanguageContextProvider.getLanguageContext('ar');
    assert.strictEqual(ctx.language, 'ar');
    assert.strictEqual(ctx.isRtl, true);
  });

  test('AI-ARCH-14 : ES supported', () => {
    const ctx = LanguageContextProvider.getLanguageContext('es');
    assert.strictEqual(ctx.language, 'es');
    assert.strictEqual(ctx.isRtl, false);
  });

  test('AI-ARCH-15 : IT supported', () => {
    const ctx = LanguageContextProvider.getLanguageContext('it');
    assert.strictEqual(ctx.language, 'it');
    assert.strictEqual(ctx.isRtl, false);
  });

  test('AI-ARCH-16 : Arabic RTL is correctly represented in requests and responses', async () => {
    const service = new AssistantService();
    const response = await service.ask({
      query: "كم مدة حضانة بيض الكناري؟",
      language: 'ar',
      tier: 'FREE'
    });

    assert.strictEqual(response.language, 'ar');
    assert.strictEqual(response.isRtl, true);
  });

  test('AI-ARCH-17 : FREE tier recognized and limits to general/biological knowledge', () => {
    const capabilities = AssistantPermissionProvider.getCapabilitiesForTier('FREE');
    assert.ok(capabilities.includes('GENERAL_KNOWLEDGE'));
    assert.ok(capabilities.includes('BIOLOGICAL_KNOWLEDGE'));
    assert.ok(!capabilities.includes('BIRD_CONTEXT'));
    assert.ok(!capabilities.includes('INTELLIGENCE_EXPLANATION'));

    const auth = AssistantPermissionService.checkAuthorization('FREE', 'USER_BIRD');
    assert.strictEqual(auth.isAuthorized, false, 'FREE tier cannot access USER_BIRD');
  });

  test('AI-ARCH-18 : PREMIUM tier recognized and unlocks farm context and intelligence', () => {
    const capabilities = AssistantPermissionProvider.getCapabilitiesForTier('PREMIUM');
    assert.ok(capabilities.includes('BIRD_CONTEXT'));
    assert.ok(capabilities.includes('BREEDING_ANALYSIS'));
    assert.ok(capabilities.includes('HEALTH_ANALYSIS'));
    assert.ok(capabilities.includes('INTELLIGENCE_EXPLANATION'));
    assert.ok(!capabilities.includes('ADVANCED_ANALYSIS'));

    const auth = AssistantPermissionService.checkAuthorization('PREMIUM', 'USER_BIRD');
    assert.strictEqual(auth.isAuthorized, true, 'PREMIUM tier can access USER_BIRD');
  });

  test('AI-ARCH-19 : PRO tier recognized and unlocks all advanced capabilities', () => {
    const capabilities = AssistantPermissionProvider.getCapabilitiesForTier('PRO');
    assert.ok(capabilities.includes('ADVANCED_ANALYSIS'));
    assert.ok(capabilities.includes('REPORT_ASSISTANCE'));

    const auth = AssistantPermissionService.checkAuthorization('PRO', 'USER_GENEALOGY');
    assert.strictEqual(auth.isAuthorized, true, 'PRO tier can access USER_GENEALOGY');
  });

  test('AI-ARCH-20 : Absence of AI engine handled gracefully (AI_ENGINE_UNAVAILABLE / UNAVAILABLE)', async () => {
    const defaultLocalProvider = new LocalAIProvider({ engineInstalled: false, isMockEnabled: false });
    const service = new AssistantService(new AssistantOrchestrator(defaultLocalProvider));

    const response = await service.ask({
      query: "Comment optimiser la reproduction ?",
      language: 'fr',
      tier: 'FREE'
    });

    assert.strictEqual(response.status, 'UNAVAILABLE');
    assert.strictEqual(response.responseType, 'UNAVAILABLE');
    assert.ok(response.warnings.includes('AI_ENGINE_UNAVAILABLE'));
    assert.ok(response.answer.length > 0, 'Must return informative non-crashing answer');
  });

  test('AI-ARCH-21 : Strict TypeScript types with 0 unjustified any in assistant module', () => {
    const assistantDir = path.join(rootDir, 'src', 'features', 'assistant');
    
    function scanDirForAny(dir: string): string[] {
      const violations: string[] = [];
      const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
      
      for (const f of files) {
        if (f.isFile() && f.name.endsWith('.ts')) {
          const filePath = path.join(f.parentPath || dir, f.name);
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if ((line.includes(': any') || line.includes('<any>') || line.includes('as any')) && !line.includes('// intentional-any')) {
              violations.push(`${f.name}:${idx + 1}: ${line.trim()}`);
            }
          });
        }
      }
      return violations;
    }

    const anyViolations = scanDirForAny(assistantDir);
    assert.strictEqual(anyViolations.length, 0, `Unjustified any found in assistant: ${JSON.stringify(anyViolations)}`);
  });

  test('AI-ARCH-22 : Biological registry is not modified', () => {
    const canary = getBiologicalProfileById('canari');
    assert.strictEqual(canary?.identity.id, 'canari');
    assert.strictEqual(canary?.reproduction.incubationPeriod, 13);
    assert.strictEqual(canary?.reproduction.avgEggsPerClutch, 4);
  });

  test('AI-ARCH-23 : User data is not modified during assistant operations', async () => {
    const birdsBefore = BirdRepository.getAll();
    const countBefore = birdsBefore.length;

    const service = new AssistantService();
    await service.ask({
      query: "Quel est l'âge de Titan ?",
      language: 'fr',
      birdId: 101,
      tier: 'PREMIUM'
    });

    const birdsAfter = BirdRepository.getAll();
    assert.strictEqual(birdsAfter.length, countBefore, 'Bird count must remain unchanged');
    assert.strictEqual(birdsAfter[0].nom, 'Titan');
  });

  test('AI-ARCH-24 : No chatbot UI components added to source tree', () => {
    const componentsDir = path.join(rootDir, 'src', 'components');
    const files = fs.readdirSync(componentsDir, { recursive: true, withFileTypes: true });
    
    for (const f of files) {
      if (f.isFile()) {
        const name = f.name.toLowerCase();
        assert.ok(!name.includes('chatbot'), `Chatbot component found: ${f.name}`);
        assert.ok(!name.includes('chatbubble'), `ChatBubble component found: ${f.name}`);
        assert.ok(!name.includes('chatwidget'), `ChatWidget component found: ${f.name}`);
        assert.ok(!name.includes('assistantmodal'), `AssistantModal component found: ${f.name}`);
      }
    }
  });

  test('AI-ARCH-25 : Architecture is compatible with future local AI engine integration', async () => {
    // Simulate a future local ONNX / WebLLM lightweight provider
    class FutureLocalEngineProvider implements AIProvider {
      getProviderId() { return 'future-webllm-local'; }
      getStatus() { return 'AVAILABLE' as const; }
      isOffline() { return true; }

      generateResponse(request: AssistantRequest, context: AssistantContext): AssistantResponse {
        let answer = '';
        if (context.biological) {
          answer = `Selon le registre biologique, ${context.biological.commonName} a une durée d'incubation de ${context.biological.incubationPeriodDays} jours.`;
        } else {
          answer = `Réponse générée localement par le moteur IA embarqué.`;
        }

        return {
          answer,
          language: request.language,
          confidence: 'HIGH',
          sources: context.summary.loadedSources,
          contextUsed: context.summary,
          warnings: [],
          generatedAt: new Date().toISOString(),
          responseType: 'GENERAL_INFORMATION',
          status: 'AVAILABLE',
          isRtl: context.language.isRtl
        };
      }
    }

    const service = new AssistantService(new AssistantOrchestrator(new FutureLocalEngineProvider()));
    const response = await service.ask({
      query: "Combien de jours dure l'incubation du canari ?",
      language: 'fr',
      speciesId: 'canari',
      tier: 'FREE'
    });

    assert.strictEqual(response.status, 'AVAILABLE');
    assert.ok(response.answer.includes("13 jours"));
    assert.strictEqual(response.sources.includes('BIOLOGICAL_SPECIES_REGISTRY'), true);
  });
});

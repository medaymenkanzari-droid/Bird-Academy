/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../providers/ai/AIProvider';
import { LocalAIProvider } from '../providers/ai/LocalAIProvider';
import { AssistantRequest, AssistantResponse } from '../types/assistant';
import { QuestionClassifier } from './QuestionClassifier';
import { AssistantPermissionService } from './AssistantPermissionService';
import { AssistantContextBuilder } from './AssistantContextBuilder';
import { SafetyGuardService } from './SafetyGuardService';
import { QuotaManager } from './QuotaManager';
import { Language } from '../../../utils/translations';

const QUOTA_EXCEEDED_MESSAGES: Record<Language, (limit: number) => string> = {
  fr: (limit) => `Vous avez atteint votre quota journalier de ${limit} requêtes pour votre plan. Passez au niveau PRO pour bénéficier de requêtes illimitées.`,
  en: (limit) => `You have reached your daily quota of ${limit} requests for your tier. Upgrade to PRO for unlimited requests.`,
  ar: (limit) => `لقد وصلت إلى الحد اليومي البالغ ${limit} استفساراً لباقتك. قم بالترقية إلى باقة PRO للاستمتاع باستفسارات غير محدودة.`,
  es: (limit) => `Ha alcanzado su cuota diaria de ${limit} consultas para su plan. Actualice a PRO para consultas ilimitadas.`,
  it: (limit) => `Hai raggiunto la tua quota giornaliera di ${limit} richieste per il tuo piano. Passa a PRO per richieste illimitate.`
};

export class AssistantOrchestrator {
  private aiProvider: AIProvider;

  constructor(aiProvider?: AIProvider) {
    this.aiProvider = aiProvider || new LocalAIProvider();
  }

  /**
   * Replaces or configures the active AI Provider implementation.
   */
  setAIProvider(provider: AIProvider): void {
    this.aiProvider = provider;
  }

  /**
   * Returns the active AI Provider instance.
   */
  getAIProvider(): AIProvider {
    return this.aiProvider;
  }

  /**
   * Processes an incoming assistant request through the complete foundation pipeline.
   */
  async process(request: AssistantRequest): Promise<AssistantResponse> {
    const tier = request.tier || 'FREE';
    const lang = request.language || 'fr';
    const isRtl = lang === 'ar';

    // 1. Quota Check
    if (!QuotaManager.canAsk(tier)) {
      const usage = QuotaManager.getUsage(tier);
      const limit = usage.limit || 10;
      const formatter = QUOTA_EXCEEDED_MESSAGES[lang] || QUOTA_EXCEEDED_MESSAGES.fr;

      return {
        answer: formatter(limit),
        language: lang,
        confidence: 'HIGH',
        sources: [],
        contextUsed: {
          hasBiologicalContext: false,
          hasBirdContext: false,
          hasBreedingContext: false,
          hasHealthContext: false,
          hasFeedingContext: false,
          hasHabitatContext: false,
          hasGenealogyContext: false,
          hasFinanceContext: false,
          hasIntelligenceContext: false,
          loadedSources: [],
          loadedEntityIds: {}
        },
        warnings: ['QUOTA_EXCEEDED'],
        generatedAt: new Date().toISOString(),
        responseType: 'WARNING',
        status: 'AVAILABLE',
        isRtl
      };
    }

    const classification = QuestionClassifier.classify(request.query);

    // 2. Permission Check
    const auth = AssistantPermissionService.checkAuthorization(tier, classification.category, lang);
    if (!auth.isAuthorized) {
      return {
        answer: auth.reason || "Fonctionnalité non autorisée pour votre niveau d'abonnement.",
        language: lang,
        confidence: 'HIGH',
        sources: [],
        contextUsed: {
          hasBiologicalContext: false,
          hasBirdContext: false,
          hasBreedingContext: false,
          hasHealthContext: false,
          hasFeedingContext: false,
          hasHabitatContext: false,
          hasGenealogyContext: false,
          hasFinanceContext: false,
          hasIntelligenceContext: false,
          loadedSources: [],
          loadedEntityIds: {}
        },
        warnings: ['PERMISSION_DENIED', `REQUIRED_${auth.requiredCapability}`],
        generatedAt: new Date().toISOString(),
        responseType: 'WARNING',
        status: 'AVAILABLE',
        isRtl
      };
    }

    // 3. Build Minimal Context
    const context = AssistantContextBuilder.buildContext(request, classification);

    // 4. Safety Evaluation
    const safetyResult = SafetyGuardService.evaluateSafety(classification.category, request.query, lang);

    // 5. Provider Generation
    const rawResponse = await this.aiProvider.generateResponse(request, context);

    // 6. Consume quota once processed
    QuotaManager.consume(tier);

    // 7. Append Safety Disclaimers & Warnings
    const combinedWarnings = Array.from(new Set([...rawResponse.warnings, ...safetyResult.warnings]));
    let finalAnswer = rawResponse.answer;

    if (safetyResult.disclaimers.length > 0) {
      finalAnswer = `${finalAnswer}\n\n${safetyResult.disclaimers.join('\n')}`;
    }

    return {
      ...rawResponse,
      answer: finalAnswer,
      warnings: combinedWarnings,
      isRtl: context.language.isRtl
    };
  }
}

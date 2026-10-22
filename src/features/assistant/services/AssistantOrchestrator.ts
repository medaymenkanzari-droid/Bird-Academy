/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../providers/ai/AIProvider';
import { LocalAIProvider } from '../providers/ai/LocalAIProvider';
import { AssistantRequest, AssistantResponse, QuestionCategory } from '../types/assistant';
import { AssistantTier } from '../types/permissions';
import { QuestionClassifier } from './QuestionClassifier';
import { AssistantPermissionService } from './AssistantPermissionService';
import { AssistantContextBuilder } from './AssistantContextBuilder';
import { SafetyGuardService } from './SafetyGuardService';
import { QuotaManager } from './QuotaManager';
import { Language } from '../../../utils/translations';
import { SubscriptionTierResolver } from '../../subscription/services/SubscriptionTierResolver';

const TIER_RANK: Record<AssistantTier, number> = {
  FREE: 0,
  PREMIUM: 1,
  PRO: 2
};

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
    // 0. Resolve Effective Tier with Security Clamping (Prevent privilege escalation)
    const activeTier = SubscriptionTierResolver.getCurrentTierSync();
    let tier: AssistantTier = activeTier;
    if (request.tier) {
      const reqRank = TIER_RANK[request.tier] ?? 0;
      const activeRank = TIER_RANK[activeTier] ?? 0;
      tier = reqRank <= activeRank ? request.tier : activeTier;
    }

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
    let effectiveCategory: QuestionCategory = classification.category;

    // Enforce contextual category requirements based on explicit action or context payload
    if (request.action === 'EXPLAIN_STATUS' || request.locusContext || request.passportContext) {
      effectiveCategory = 'EPISTEMIC_STATUS_EXPLANATION';
    } else if (request.action === 'EXPLAIN_RESULT' || request.crossResultContext) {
      effectiveCategory = 'CROSS_RESULT_EXPLANATION';
    } else if (request.action === 'SIMPLIFY') {
      effectiveCategory = 'TEXT_SIMPLIFICATION';
    } else if (request.action === 'SUMMARIZE') {
      effectiveCategory = 'TEXT_SUMMARIZATION';
    } else if (request.action === 'REPHRASE') {
      effectiveCategory = 'TEXT_REPHRASING';
    } else if (request.action === 'STRUCTURE_NOTE') {
      effectiveCategory = 'NOTE_STRUCTURING';
    }

    // 2. Permission Check
    const auth = AssistantPermissionService.checkAuthorization(tier, effectiveCategory, lang);
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
    let rawResponse: AssistantResponse;
    try {
      if (!this.aiProvider) {
        throw new Error('AI_PROVIDER_NULL');
      }
      rawResponse = await this.aiProvider.generateResponse(request, context);
    } catch (_err: unknown) {
      const errorMsgs: Record<Language, string> = {
        fr: "Une erreur est survenue lors de l'exécution du fournisseur IA. Vos données restent sécurisées.",
        en: "An error occurred during AI provider execution. Your data remains secure.",
        ar: "حدث خطأ أثناء تشغيل مزود الذكاء الاصطناعي. تظل بياناتك آمنة.",
        es: "Ocurrió un error durante la ejecución del proveedor IA. Sus datos permanecen seguros.",
        it: "Si è verificato un errore durante l'esecuzione del provider IA. I tuoi dati rimangono sicuri."
      };
      return {
        answer: errorMsgs[lang] || errorMsgs.fr,
        language: lang,
        confidence: 'UNKNOWN',
        sources: [],
        contextUsed: context.summary,
        warnings: ['PROVIDER_ERROR'],
        generatedAt: new Date().toISOString(),
        responseType: 'ERROR',
        status: 'ERROR',
        isRtl
      };
    }

    // 6. Consume quota once processed (only if not an engine error/unavailable)
    if (rawResponse.status === 'AVAILABLE') {
      QuotaManager.consume(tier);
    }

    // 7. Append Safety Disclaimers & Warnings
    const combinedWarnings = Array.from(new Set([...rawResponse.warnings, ...safetyResult.warnings]));
    let finalAnswer = rawResponse.answer;

    if (safetyResult.disclaimers.length > 0 && rawResponse.status !== 'UNAVAILABLE' && rawResponse.status !== 'ERROR') {
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

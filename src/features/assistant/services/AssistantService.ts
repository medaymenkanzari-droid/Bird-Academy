/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssistantOrchestrator } from './AssistantOrchestrator';
import { AIProvider } from '../providers/ai/AIProvider';
import { 
  AssistantEngineStatus, 
  AssistantRequest, 
  AssistantResponse,
  MinimalLocusContext,
  MinimalPassportContext,
  MinimalCrossResultContext
} from '../types/assistant';
import { AssistantCapability, AssistantTier } from '../types/permissions';
import { AssistantPermissionProvider } from '../providers/context/AssistantPermissionProvider';
import { QuestionClassifier, ClassificationResult } from './QuestionClassifier';
import { AssistantContextBuilder } from './AssistantContextBuilder';
import { AssistantContext } from '../types/context';
import { QuotaManager, QuotaUsageInfo } from './QuotaManager';
import { Language } from '../../../utils/translations';
import { SubscriptionTierResolver } from '../../subscription/services/SubscriptionTierResolver';

export class AssistantService {
  private static instance: AssistantService;
  private orchestrator: AssistantOrchestrator;

  constructor(orchestrator?: AssistantOrchestrator) {
    this.orchestrator = orchestrator || new AssistantOrchestrator();
  }

  /**
   * Singleton accessor for application-wide usage.
   */
  static getInstance(): AssistantService {
    if (!AssistantService.instance) {
      AssistantService.instance = new AssistantService();
    }
    return AssistantService.instance;
  }

  /**
   * Primary entry point for querying the assistant.
   */
  async ask(request: AssistantRequest): Promise<AssistantResponse> {
    return this.orchestrator.process(request);
  }

  /**
   * Simplifie un texte utilisateur (supprime fioritures et redondances en préservant tous les faits).
   */
  async simplify(text: string, options?: { language?: Language; tier?: AssistantTier }): Promise<AssistantResponse> {
    return this.ask({
      query: `Simplifier ce texte : ${text}`,
      action: 'SIMPLIFY',
      targetText: text,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Résume un texte long en une synthèse concise fidèle aux chiffres, dates et noms.
   */
  async summarize(text: string, options?: { language?: Language; tier?: AssistantTier }): Promise<AssistantResponse> {
    return this.ask({
      query: `Résumer ce texte : ${text}`,
      action: 'SUMMARIZE',
      targetText: text,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Reformule un texte en syntaxe avicole claire et professionnelle.
   */
  async rephrase(text: string, options?: { language?: Language; tier?: AssistantTier }): Promise<AssistantResponse> {
    return this.ask({
      query: `Reformuler ce texte : ${text}`,
      action: 'REPHRASE',
      targetText: text,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Explique simplement un concept ou un terme avicole.
   */
  async explain(
    textOrTopic: string, 
    options?: { language?: Language; tier?: AssistantTier; locusContext?: MinimalLocusContext }
  ): Promise<AssistantResponse> {
    return this.ask({
      query: `Expliquer : ${textOrTopic}`,
      action: 'EXPLAIN',
      targetText: textOrTopic,
      locusContext: options?.locusContext,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Structure une observation libre en note avicole formelle sans diagnostic vétérinaire.
   */
  async structureNote(rawNote: string, options?: { language?: Language; tier?: AssistantTier }): Promise<AssistantResponse> {
    return this.ask({
      query: `Structurer la note : ${rawNote}`,
      action: 'STRUCTURE_NOTE',
      targetText: rawNote,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Explique un statut épistémique (UNKNOWN, NOT_TESTED, PROVISIONAL, BLOCKED, POSSIBLE_SET, CONFIRMED).
   */
  async explainEpistemicStatus(
    status: string, 
    locusName?: string, 
    options?: { language?: Language; tier?: AssistantTier }
  ): Promise<AssistantResponse> {
    return this.ask({
      query: `Que signifie le statut ${status} ?`,
      action: 'EXPLAIN_STATUS',
      locusContext: {
        locusId: locusName || 'locus',
        locusName,
        epistemicStatus: status
      },
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Explique la composition documentaire d'un Bird Passport (lecture seule pure).
   */
  async explainBirdPassport(
    passport: MinimalPassportContext, 
    options?: { language?: Language; tier?: AssistantTier }
  ): Promise<AssistantResponse> {
    return this.ask({
      query: `Expliquer le Bird Passport de ${passport.birdNom || passport.bague || 'l\'oiseau'}`,
      action: 'EXPLAIN',
      passportContext: passport,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Explique le résultat officiel d'un croisement sans recalculer ni créer de moteur parallèle.
   */
  async explainCrossResult(
    cross: MinimalCrossResultContext, 
    options?: { language?: Language; tier?: AssistantTier }
  ): Promise<AssistantResponse> {
    return this.ask({
      query: `Expliquer le résultat de croisement officiel`,
      action: 'EXPLAIN_RESULT',
      crossResultContext: cross,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * MISSION V1.9.2: Explique un élément d'aide à la décision issu de Bird Intelligence.
   * Fournit la formulation sans créer aucune conclusion biologique concurrente.
   */
  async explainDecisionSupport(
    item: { title: string; situation: string; result: string; meaning: string; vigilancePoints?: string[]; missingData?: string[]; nextVerification?: string },
    options?: { language?: Language; tier?: AssistantTier }
  ): Promise<AssistantResponse> {
    const summaryText = `${item.title} — ${item.situation} — ${item.result} — ${item.meaning}` +
      (item.vigilancePoints && item.vigilancePoints.length > 0 ? ` — Vigilance : ${item.vigilancePoints.join(', ')}` : '') +
      (item.nextVerification ? ` — Action recommandée : ${item.nextVerification}` : '');

    return this.ask({
      query: `Expliquer l'aide à la décision : ${item.title}`,
      action: 'EXPLAIN',
      targetText: summaryText,
      language: options?.language || 'fr',
      tier: options?.tier || SubscriptionTierResolver.getCurrentTierSync()
    });
  }

  /**
   * Retrieves the current engine readiness status.
   */
  getStatus(): AssistantEngineStatus {
    return this.orchestrator.getAIProvider().getStatus();
  }

  /**
   * Confirms whether the assistant subsystem is running in offline mode.
   */
  isOffline(): boolean {
    return this.orchestrator.getAIProvider().isOffline();
  }

  /**
   * Configures or swaps the underlying AIProvider (e.g. LocalAIProvider or future engines).
   */
  setAIProvider(provider: AIProvider): void {
    this.orchestrator.setAIProvider(provider);
  }

  /**
   * Gets the active AIProvider.
   */
  getAIProvider(): AIProvider {
    return this.orchestrator.getAIProvider();
  }

  /**
   * Returns available capabilities for a commercial tier.
   */
  getAvailableCapabilities(tier: AssistantTier = 'FREE'): AssistantCapability[] {
    return AssistantPermissionProvider.getCapabilitiesForTier(tier);
  }

  /**
   * Returns quota usage info for a tier.
   */
  getQuotaUsage(tier: AssistantTier = 'FREE'): QuotaUsageInfo {
    return QuotaManager.getUsage(tier);
  }

  /**
   * Checks if user has remaining quota to ask a question.
   */
  canAsk(tier: AssistantTier = 'FREE'): boolean {
    return QuotaManager.canAsk(tier);
  }

  /**
   * Resets quota state.
   */
  resetQuota(tier?: AssistantTier): void {
    QuotaManager.reset(tier);
  }

  /**
   * Classifies a user query without dispatching inference.
   */
  classifyQuery(query: string): ClassificationResult {
    return QuestionClassifier.classify(query);
  }

  /**
   * Previews minimal necessary context for a request.
   */
  previewContext(request: AssistantRequest): AssistantContext {
    return AssistantContextBuilder.buildContext(request);
  }
}

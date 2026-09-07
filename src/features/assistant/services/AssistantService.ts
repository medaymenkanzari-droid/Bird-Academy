/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssistantOrchestrator } from './AssistantOrchestrator';
import { AIProvider } from '../providers/ai/AIProvider';
import { AssistantEngineStatus, AssistantRequest, AssistantResponse } from '../types/assistant';
import { AssistantCapability, AssistantTier } from '../types/permissions';
import { AssistantPermissionProvider } from '../providers/context/AssistantPermissionProvider';
import { QuestionClassifier, ClassificationResult } from './QuestionClassifier';
import { AssistantContextBuilder } from './AssistantContextBuilder';
import { AssistantContext } from '../types/context';
import { QuotaManager, QuotaUsageInfo } from './QuotaManager';

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

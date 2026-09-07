/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssistantEngineStatus, AssistantRequest, AssistantResponse } from '../../types/assistant';
import { AssistantContext } from '../../types/context';

export interface AIProvider {
  /**
   * Generates a structured response based on request and contextual data.
   */
  generateResponse(request: AssistantRequest, context: AssistantContext): Promise<AssistantResponse> | AssistantResponse;

  /**
   * Retrieves the current readiness status of the AI provider.
   */
  getStatus(): AssistantEngineStatus;

  /**
   * Indicates whether this provider operates in offline-first mode without remote network calls.
   */
  isOffline(): boolean;

  /**
   * Unique identifier for the provider implementation.
   */
  getProviderId(): string;
}

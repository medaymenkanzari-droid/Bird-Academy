/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssistantCapability, AssistantTier } from '../types/permissions';
import { AssistantPermissionProvider } from '../providers/context/AssistantPermissionProvider';
import { QuestionCategory } from '../types/assistant';
import { Language } from '../../../utils/translations';

export interface AuthorizationCheckResult {
  isAuthorized: boolean;
  requiredCapability: AssistantCapability;
  tier: AssistantTier;
  recommendedTier: AssistantTier;
  reason?: string;
}

const PERMISSION_DENIED_MESSAGES: Record<Language, (reqTier: AssistantTier) => string> = {
  fr: (tier) => `Cette fonctionnalité nécessite le niveau d'abonnement ${tier}. Veuillez mettre à niveau votre plan pour y accéder.`,
  en: (tier) => `This feature requires the ${tier} subscription tier. Please upgrade your plan to access it.`,
  ar: (tier) => `تتطلب هذه الميزة مستوى الاشتراك ${tier}. يرجى ترقية باقتك للوصول إليها.`,
  es: (tier) => `Esta función requiere el nivel de suscripción ${tier}. Actualice su plan para acceder.`,
  it: (tier) => `Questa funzionalità richiede il piano ${tier}. Aggiorna il tuo piano per accedervi.`
};

export class AssistantPermissionService {
  /**
   * Maps a question category to the minimum required capability.
   */
  static getRequiredCapability(category: QuestionCategory): AssistantCapability {
    switch (category) {
      case 'GENERAL_BIOLOGY':
        return 'BIOLOGICAL_KNOWLEDGE';
      case 'GENERAL_BREEDING':
      case 'GENERAL_FEEDING':
      case 'GENERAL_HABITAT':
      case 'GENERAL_HEALTH':
        return 'GENERAL_KNOWLEDGE';
      case 'USER_BIRD':
      case 'USER_FARM':
      case 'USER_HABITAT':
      case 'USER_FEEDING':
        return 'BIRD_CONTEXT';
      case 'USER_BREEDING':
        return 'BREEDING_ANALYSIS';
      case 'USER_HEALTH':
        return 'HEALTH_ANALYSIS';
      case 'USER_GENEALOGY':
      case 'USER_FINANCE':
        return 'ADVANCED_ANALYSIS';
      case 'INTELLIGENCE_EXPLANATION':
        return 'INTELLIGENCE_EXPLANATION';
      case 'REPORT_EXPLANATION':
        return 'REPORT_ASSISTANCE';
      case 'UNKNOWN':
      default:
        return 'GENERAL_KNOWLEDGE';
    }
  }

  /**
   * Evaluates if the current tier authorizes the query category.
   */
  static checkAuthorization(
    tier: AssistantTier = 'FREE', 
    category: QuestionCategory, 
    language: Language = 'fr'
  ): AuthorizationCheckResult {
    const requiredCapability = this.getRequiredCapability(category);
    const isAuthorized = AssistantPermissionProvider.hasCapability(tier, requiredCapability);
    const recommendedTier = this.getRecommendedTier(requiredCapability);

    const formatter = PERMISSION_DENIED_MESSAGES[language] || PERMISSION_DENIED_MESSAGES.fr;
    const reason = isAuthorized ? undefined : formatter(recommendedTier);

    return {
      isAuthorized,
      requiredCapability,
      tier,
      recommendedTier,
      reason
    };
  }

  static getRecommendedTier(capability: AssistantCapability): AssistantTier {
    if (
      capability === 'ADVANCED_ANALYSIS' || 
      capability === 'REPORT_ASSISTANCE' || 
      capability === 'INTELLIGENCE_EXPLANATION'
    ) {
      return 'PRO';
    }
    if (
      capability === 'BIRD_CONTEXT' || 
      capability === 'BREEDING_ANALYSIS' || 
      capability === 'HEALTH_ANALYSIS'
    ) {
      return 'PREMIUM';
    }
    return 'FREE';
  }
}

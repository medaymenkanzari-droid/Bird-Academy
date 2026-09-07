/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../../../utils/translations';
import { MedicalAdviceType, SafetyGuardResult } from '../types/safety';
import { QuestionCategory } from '../types/assistant';

const VETERINARY_DISCLAIMERS: Record<Language, string> = {
  fr: "Rappel de sécurité : Les observations fournies sont indicatives et ne constituent en aucun cas un diagnostic vétérinaire. Consultez un médecin vétérinaire spécialisé pour toute décision médicale.",
  en: "Safety reminder: The provided observations are informational and do not constitute a veterinary diagnosis. Consult a qualified avian veterinarian for medical decisions.",
  ar: "تنبيه أمان: الملاحظات المقدمة استرشادية ولا تشكل بأي حال تشخيصاً بيطرياً. يرجى استشارة طبيب بيطري مختص لأي قرار علاجي.",
  es: "Aviso de seguridad: Las observaciones proporcionadas son orientativas y no constituyen un diagnóstico veterinario. Consulte a un veterinario especialista para decisiones médicas.",
  it: "Promemoria di sicurezza: Le osservazioni fornite sono indicative e non costituiscono una diagnosi veterinaria. Consultare un medico veterinario specializzato per qualsiasi decisione medica."
};

export class SafetyGuardService {
  /**
   * Evaluates medical safety boundaries and attaches disclaimers when appropriate.
   */
  static evaluateSafety(category: QuestionCategory, query: string, language: Language = 'fr'): SafetyGuardResult {
    const isHealthRelated = category === 'GENERAL_HEALTH' || category === 'USER_HEALTH';
    const text = query.toLowerCase();

    const requiresVetNotice = isHealthRelated || 
      text.includes('malade') || 
      text.includes('symptôme') || 
      text.includes('traitement') || 
      text.includes('antibiotique') ||
      text.includes('sick') ||
      text.includes('disease') ||
      text.includes('مرض') ||
      text.includes('علاج');

    const disclaimers: string[] = [];
    const warnings: string[] = [];

    if (requiresVetNotice) {
      disclaimers.push(VETERINARY_DISCLAIMERS[language] || VETERINARY_DISCLAIMERS.fr);
      warnings.push('VETERINARY_SAFETY_BOUNDARY_APPLIED');
    }

    return {
      isSafe: true,
      requiresVeterinaryNotice: requiresVetNotice,
      warnings,
      disclaimers
    };
  }

  /**
   * Formats the medical advice type.
   */
  static classifyAdviceType(category: QuestionCategory, isSpecificBird: boolean): MedicalAdviceType {
    if (category === 'GENERAL_HEALTH') return 'GENERAL_INFORMATION';
    if (category === 'USER_HEALTH') return isSpecificBird ? 'FARM_OBSERVATION' : 'ALERT';
    return 'GENERAL_INFORMATION';
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from './AIProvider';
import { 
  AssistantEngineStatus, 
  AssistantRequest, 
  AssistantResponse, 
  AssistantResponseType, 
  AssistantConfidence 
} from '../../types/assistant';
import { AssistantContext } from '../../types/context';
import { KnowledgeSource } from '../../types/knowledge';
import { Language } from '../../../../utils/translations';
import { LocalTextAssistantEngine } from '../../services/LocalTextAssistantEngine';
import { QuestionClassifier } from '../../services/QuestionClassifier';

export interface LocalAIProviderConfig {
  engineInstalled?: boolean;
  modelName?: string;
  version?: string;
  isMockEnabled?: boolean;
  textEngineEnabled?: boolean;
  statusOverride?: AssistantEngineStatus;
}

const UNKNOWN_SPECIES_MESSAGES: Record<Language, string> = {
  fr: "Informations biologiques non disponibles pour cette espèce.",
  en: "Biological information not available for this species.",
  ar: "المعلومات البيولوجية غير متوفرة لهذا الفصيل.",
  es: "Información biológica no disponible para esta especie.",
  it: "Informazioni biologiche non disponibili per questa specie."
};

const UNAVAILABLE_ENGINE_MESSAGES: Record<Language, string> = {
  fr: "L'assistant local n'est pas disponible sur cet appareil.",
  en: "The local assistant is not available on this device.",
  ar: "المساعد المحلي غير متوفر على هذا الجهاز.",
  es: "El asistente local no está disponible en este dispositivo.",
  it: "L'assistente locale non è disponibile su questo dispositivo."
};

export class LocalAIProvider implements AIProvider {
  private engineInstalled: boolean;
  private modelName: string;
  private version: string;
  private isMockEnabled: boolean;
  private textEngineEnabled: boolean;
  private statusOverride?: AssistantEngineStatus;

  constructor(config: LocalAIProviderConfig = {}) {
    this.engineInstalled = config.engineInstalled ?? false;
    this.modelName = config.modelName ?? 'BirdAcademy-Local-Tiny';
    this.version = config.version ?? '1.9.0-assistant';
    this.isMockEnabled = config.isMockEnabled ?? false;
    this.textEngineEnabled = config.textEngineEnabled ?? true;
    this.statusOverride = config.statusOverride;
  }

  getProviderId(): string {
    return 'local-offline-ai-provider';
  }

  isOffline(): boolean {
    return true;
  }

  getStatus(): AssistantEngineStatus {
    if (this.statusOverride) {
      return this.statusOverride;
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('bird_academy_assistant_engine_status');
        if (stored === 'UNAVAILABLE' || stored === 'AVAILABLE' || stored === 'ERROR') {
          return stored as AssistantEngineStatus;
        }
      } catch {
        // Ignore storage access issues
      }
    }
    return 'AVAILABLE';
  }

  setEngineInstalled(installed: boolean): void {
    this.engineInstalled = installed;
  }

  setMockEnabled(enabled: boolean): void {
    this.isMockEnabled = enabled;
  }

  setStatus(status: AssistantEngineStatus): void {
    this.statusOverride = status;
  }

  setStatusOverride(status?: AssistantEngineStatus): void {
    this.statusOverride = status;
  }

  setTextEngineEnabled(enabled: boolean): void {
    this.textEngineEnabled = enabled;
  }

  generateResponse(request: AssistantRequest, context: AssistantContext): AssistantResponse {
    const isRtl = context.language.isRtl;
    const lang = request.language || 'fr';
    const sources: KnowledgeSource[] = [...context.summary.loadedSources];

    // 1. Strict override or engine disabled check
    const isUnavailable = this.statusOverride === 'UNAVAILABLE' || (
      typeof localStorage !== 'undefined' && 
      localStorage.getItem('bird_academy_assistant_engine_status') === 'UNAVAILABLE'
    );
    if (isUnavailable) {
      return this.buildUnavailableResponse(request, context, isRtl, sources);
    }

    // 2. Text Assistance & Epistemic/Passport/Cross actions (Priority V1.9.0)
    const classifiedCategory = QuestionClassifier.classify(request.query || '').category;
    const isTextAction = [
      'TEXT_SIMPLIFICATION',
      'TEXT_SUMMARIZATION',
      'TEXT_REPHRASING',
      'TEXT_EXPLANATION',
      'NOTE_STRUCTURING',
      'EPISTEMIC_STATUS_EXPLANATION',
      'CROSS_RESULT_EXPLANATION'
    ].includes(classifiedCategory) ||
    Boolean(request.action && request.action !== 'GENERAL_QUERY') ||
    Boolean(request.locusContext) ||
    Boolean(request.passportContext) ||
    Boolean(request.crossResultContext) ||
    Boolean(context.textContext) ||
    /^(?:simplifi|résum|resum|reformul|expliqu|que signifie|structur)/i.test(request.query || '');

    if (isTextAction) {
      if (!this.textEngineEnabled) {
        return this.buildUnavailableResponse(request, context, isRtl, sources);
      }
      return this.buildTextAssistanceResponse(request, context, isRtl, sources);
    }

    // 3. Check for explicit unknown species query
    const queryLower = (request.query || '').toLowerCase();
    if (
      request.speciesId?.startsWith('inconnu') || 
      queryLower.includes('inconnu') || 
      queryLower.includes('unknown') ||
      (request.speciesId && !context.biological)
    ) {
      const answer = UNKNOWN_SPECIES_MESSAGES[lang] || UNKNOWN_SPECIES_MESSAGES.fr;
      return {
        answer,
        language: lang,
        confidence: 'HIGH',
        sources: [],
        contextUsed: context.summary,
        warnings: ['SPECIES_NOT_DOCUMENTED'],
        generatedAt: new Date().toISOString(),
        responseType: 'GENERAL_INFORMATION',
        status: this.getStatus(),
        isRtl
      };
    }

    // 4. Deterministic Registry Resolution for Biological inquiries
    if (context.biological) {
      return this.buildBiologicalDeterministicResponse(request, context, isRtl, sources);
    }

    // 5. Deterministic Resolution for User Bird / Farm inquiries
    if (context.bird || context.intelligence || context.breeding || context.habitat || context.finance) {
      return this.buildUserDataDeterministicResponse(request, context, isRtl, sources);
    }

    // 6. If a local LLM runtime is installed or mock is enabled, process locally
    if (this.engineInstalled || this.isMockEnabled) {
      return this.buildStandardResponse(request, context, isRtl, sources);
    }

    // 7. When query cannot be resolved deterministically (e.g. general off-topic question without engine)
    return this.buildUnavailableResponse(request, context, isRtl, sources);
  }

  private buildTextAssistanceResponse(
    request: AssistantRequest,
    context: AssistantContext,
    isRtl: boolean,
    sources: KnowledgeSource[]
  ): AssistantResponse {
    const lang = request.language || 'fr';
    let action = request.action || context.textContext?.action;
    if (!action) {
      const q = (request.query || '').toLowerCase().trim();
      if (q.startsWith('simplifi')) action = 'SIMPLIFY';
      else if (q.startsWith('résum') || q.startsWith('resum')) action = 'SUMMARIZE';
      else if (q.startsWith('reformul')) action = 'REPHRASE';
      else if (q.startsWith('expliqu')) action = 'EXPLAIN';
      else if (q.startsWith('structur')) action = 'STRUCTURE_NOTE';
      else if (q.includes('statut') || q.includes('status')) action = 'EXPLAIN_STATUS';
    }
    const targetText = request.targetText || context.textContext?.targetText || request.query;

    let answer = '';
    let responseType: AssistantResponseType = 'GENERAL_INFORMATION';

    if (action === 'SIMPLIFY') {
      answer = LocalTextAssistantEngine.simplify(targetText, lang);
      sources.push('AI_GENERATED_EXPLANATION');
    } else if (action === 'SUMMARIZE') {
      answer = LocalTextAssistantEngine.summarize(targetText, lang);
      sources.push('AI_GENERATED_EXPLANATION');
    } else if (action === 'REPHRASE') {
      answer = LocalTextAssistantEngine.rephrase(targetText, lang);
      sources.push('AI_GENERATED_EXPLANATION');
    } else if (action === 'STRUCTURE_NOTE') {
      answer = LocalTextAssistantEngine.structureNote(targetText, lang);
      sources.push('AI_GENERATED_EXPLANATION');
      responseType = 'RECOMMENDATION';
    } else if (action === 'EXPLAIN_STATUS' || request.locusContext) {
      const locus = request.locusContext;
      const status = locus?.epistemicStatus || request.query;
      answer = LocalTextAssistantEngine.explainStatus(status, locus?.locusName || locus?.locusId, lang);
      sources.push('CANONICAL_GENETICS_REGISTRY');
    } else if (action === 'EXPLAIN_RESULT' || request.crossResultContext) {
      answer = LocalTextAssistantEngine.explainCrossResult(request.crossResultContext || {}, lang);
      sources.push('CALCULATED_DATA');
    } else if (request.passportContext) {
      answer = LocalTextAssistantEngine.explainPassport(request.passportContext, lang);
      sources.push('BIRD_PASSPORT_CONTEXT');
    } else {
      // EXPLAIN
      answer = LocalTextAssistantEngine.explain(targetText, lang, request.locusContext);
      sources.push('AI_GENERATED_EXPLANATION');
    }

    return {
      answer,
      language: lang,
      confidence: 'HIGH',
      sources: Array.from(new Set(sources)),
      contextUsed: context.summary,
      warnings: [],
      generatedAt: new Date().toISOString(),
      responseType,
      status: 'AVAILABLE',
      isRtl
    };
  }

  private buildBiologicalDeterministicResponse(
    request: AssistantRequest,
    context: AssistantContext,
    isRtl: boolean,
    sources: KnowledgeSource[]
  ): AssistantResponse {
    const lang = request.language || 'fr';
    const bio = context.biological!;
    sources.push('BIOLOGICAL_SPECIES_REGISTRY');

    const text = (request.query || '').toLowerCase();
    let answer = '';

    const isIncubationQuery = text.includes('incubation') || text.includes('couvaison') || text.includes('حضانة') || text.includes('cova');
    const isBandingQuery = text.includes('bague') || text.includes('baguage') || text.includes('ring') || text.includes('banding') || text.includes('تحجيل') || text.includes('anillado');
    const isWeightQuery = text.includes('poids') || text.includes('weight') || text.includes('وزن') || text.includes('peso');

    if (isIncubationQuery) {
      const templates: Record<Language, string> = {
        fr: `Selon le référentiel biologique Bird Academy, la durée d'incubation du ${bio.commonName} (${bio.scientificName}) est de ${bio.incubationPeriodDays} jours.`,
        en: `According to the Bird Academy biological repository, the incubation period for the ${bio.commonName} (${bio.scientificName}) is ${bio.incubationPeriodDays} days.`,
        ar: `وفقاً للمرجع البيولوجي لـ Bird Academy، فإن فترة حضانة ${bio.commonName} (${bio.scientificName}) هي ${bio.incubationPeriodDays} يوماً.`,
        es: `Según el repositorio biológico de Bird Academy, el período de incubación del ${bio.commonName} (${bio.scientificName}) es de ${bio.incubationPeriodDays} días.`,
        it: `Secondo il registro biologico di Bird Academy, il periodo di incubazione del ${bio.commonName} (${bio.scientificName}) è di ${bio.incubationPeriodDays} giorni.`
      };
      answer = templates[lang] || templates.fr;
    } else if (isBandingQuery) {
      const templates: Record<Language, string> = {
        fr: `Selon le référentiel biologique Bird Academy, l'âge de baguage pour le ${bio.commonName} est de ${bio.bandingAgeDays} jours (diamètre recommandé : ${bio.bandSize || 'standard'}).`,
        en: `According to the Bird Academy biological repository, the banding age for the ${bio.commonName} is ${bio.bandingAgeDays} days (recommended band size: ${bio.bandSize || 'standard'}).`,
        ar: `وفقاً للمرجع البيولوجي لـ Bird Academy، فإن سن التحجيل لـ ${bio.commonName} هو ${bio.bandingAgeDays} أيام (قطر الحلقة الموصى به: ${bio.bandSize || 'قياسي'}).`,
        es: `Según el repositorio biológico de Bird Academy, la edad de anillado para el ${bio.commonName} es de ${bio.bandingAgeDays} días (diámetro recomendado: ${bio.bandSize || 'estándar'}).`,
        it: `Secondo il registro biologico di Bird Academy, l'età di inanellamento per il ${bio.commonName} è di ${bio.bandingAgeDays} giorni (diametro consigliato: ${bio.bandSize || 'standard'}).`
      };
      answer = templates[lang] || templates.fr;
    } else if (isWeightQuery) {
      const minW = bio.profile?.biology?.minWeight || 15;
      const maxW = bio.profile?.biology?.maxWeight || 30;
      const templates: Record<Language, string> = {
        fr: `Selon le référentiel biologique Bird Academy, le poids normal pour le ${bio.commonName} se situe entre ${minW}g et ${maxW}g.`,
        en: `According to the Bird Academy biological repository, the normal weight for the ${bio.commonName} is between ${minW}g and ${maxW}g.`,
        ar: `وفقاً للمرجع البيولوجي لـ Bird Academy، يتراوح الوزن الطبيعي لـ ${bio.commonName} بين ${minW}غ و ${maxW}غ.`,
        es: `Según el repositorio biológico de Bird Academy, el peso normal para el ${bio.commonName} está entre ${minW}g y ${maxW}g.`,
        it: `Secondo il registro biologico di Bird Academy, il peso normale per il ${bio.commonName} è compreso tra ${minW}g e ${maxW}g.`
      };
      answer = templates[lang] || templates.fr;
    } else {
      const templates: Record<Language, string> = {
        fr: `Fiche biologique certifiée : ${bio.commonName} (${bio.scientificName}). Incubation : ${bio.incubationPeriodDays} jours, baguage : ${bio.bandingAgeDays} jours, sevrage : ${bio.weaningAgeDays} jours, moyenne de ${bio.avgEggsPerClutch} œufs par ponte.`,
        en: `Certified biological profile: ${bio.commonName} (${bio.scientificName}). Incubation: ${bio.incubationPeriodDays} days, banding: ${bio.bandingAgeDays} days, weaning: ${bio.weaningAgeDays} days, average of ${bio.avgEggsPerClutch} eggs per clutch.`,
        ar: `بطاقة بيولوجية معتمدة: ${bio.commonName} (${bio.scientificName}). الحضانة: ${bio.incubationPeriodDays} يوماً، التحجيل: ${bio.bandingAgeDays} أيام، الفطام: ${bio.weaningAgeDays} يوماً، معدل ${bio.avgEggsPerClutch} بيضات لكل عش.`,
        es: `Ficha biológica certificada: ${bio.commonName} (${bio.scientificName}). Incubación: ${bio.incubationPeriodDays} días, anillado: ${bio.bandingAgeDays} días, destete: ${bio.weaningAgeDays} días, promedio de ${bio.avgEggsPerClutch} huevos por puesta.`,
        it: `Scheda biologica certificata: ${bio.commonName} (${bio.scientificName}). Incubazione: ${bio.incubationPeriodDays} giorni, inanellamento: ${bio.bandingAgeDays} giorni, svezzamento: ${bio.weaningAgeDays} giorni, media di ${bio.avgEggsPerClutch} uova per cova.`
      };
      answer = templates[lang] || templates.fr;
    }

    return {
      answer,
      language: lang,
      confidence: 'HIGH',
      sources: Array.from(new Set(sources)),
      contextUsed: context.summary,
      warnings: [],
      generatedAt: new Date().toISOString(),
      responseType: 'GENERAL_INFORMATION',
      status: this.getStatus(),
      isRtl
    };
  }

  private buildUserDataDeterministicResponse(
    request: AssistantRequest,
    context: AssistantContext,
    isRtl: boolean,
    sources: KnowledgeSource[]
  ): AssistantResponse {
    const lang = request.language || 'fr';
    let answer = '';
    let responseType: AssistantResponseType = 'FARM_INFORMATION';

    if (context.intelligence?.birdFiche) {
      sources.push('BIRD_INTELLIGENCE');
      const fiche = context.intelligence.birdFiche;
      answer = `Analyse Bird Intelligence pour l'oiseau (Score: ${fiche.score}/100, Fiabilité: ${fiche.reliability}). Données: ${fiche.dataCompleteness}%, Descendance: ${fiche.offspringCount}, Portées: ${fiche.breedingCount}.`;
      responseType = 'ANALYSIS';
    } else if (context.bird) {
      sources.push('USER_DATA');
      const b = context.bird;
      answer = `Données de l'oiseau : ${b.nom || 'Sans nom'} (Bague: ${b.bague || 'N/A'}) - Sexe: ${b.sexe}, Espèce: ${b.espece || 'Non renseignée'}, Statut santé: ${b.statutSante || 'Normal'}.`;
    } else if (context.breeding?.pair) {
      sources.push('BREEDING_DATA');
      const p = context.breeding.pair;
      answer = `Données du couple : Mâle ${p.maleNom || p.maleBague || 'N/A'} x Femelle ${p.femelleNom || p.femelleBague || 'N/A'} (Statut: ${p.statut}, Œufs: ${p.totalEggsLaid || 0}, Jeunes: ${p.totalChicksHatched || 0}).`;
    } else if (context.finance) {
      sources.push('CALCULATED_DATA');
      const f = context.finance;
      answer = `Bilan financier : Revenus: ${f.totalRevenue} ${f.currency}, Dépenses: ${f.totalExpenses} ${f.currency}, Solde net: ${f.netBalance} ${f.currency}.`;
      responseType = 'ANALYSIS';
    } else {
      answer = `Données d'élevage traitées localement en toute confidentialité.`;
    }

    return {
      answer,
      language: lang,
      confidence: 'HIGH',
      sources: Array.from(new Set(sources)),
      contextUsed: context.summary,
      warnings: [],
      generatedAt: new Date().toISOString(),
      responseType,
      status: this.getStatus(),
      isRtl
    };
  }

  private buildUnavailableResponse(
    request: AssistantRequest,
    context: AssistantContext,
    isRtl: boolean,
    sources: KnowledgeSource[]
  ): AssistantResponse {
    const lang = request.language || 'fr';
    const answer = UNAVAILABLE_ENGINE_MESSAGES[lang] || UNAVAILABLE_ENGINE_MESSAGES.fr;

    return {
      answer,
      language: lang,
      confidence: 'UNKNOWN',
      sources,
      contextUsed: context.summary,
      warnings: ['AI_ENGINE_UNAVAILABLE'],
      generatedAt: new Date().toISOString(),
      responseType: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      isRtl
    };
  }

  private buildStandardResponse(
    request: AssistantRequest,
    context: AssistantContext,
    isRtl: boolean,
    sources: KnowledgeSource[]
  ): AssistantResponse {
    const lang = request.language || 'fr';
    const answer = `[${this.modelName} v${this.version}] Requête traitée localement en mode hors-ligne pour la langue ${lang}.`;
    
    return {
      answer,
      language: lang,
      confidence: 'MEDIUM',
      sources: Array.from(new Set(sources)),
      contextUsed: context.summary,
      warnings: [],
      generatedAt: new Date().toISOString(),
      responseType: 'GENERAL_INFORMATION',
      status: 'AVAILABLE',
      isRtl
    };
  }
}

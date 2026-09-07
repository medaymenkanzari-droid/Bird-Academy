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

export interface LocalAIProviderConfig {
  engineInstalled?: boolean;
  modelName?: string;
  version?: string;
  isMockEnabled?: boolean;
}

const UNKNOWN_SPECIES_MESSAGES: Record<Language, string> = {
  fr: "Informations biologiques non disponibles pour cette espèce.",
  en: "Biological information not available for this species.",
  ar: "المعلومات البيولوجية غير متوفرة لهذا الفصيل.",
  es: "Información biológica no disponible para esta especie.",
  it: "Informazioni biologiche non disponibili per questa specie."
};

const UNAVAILABLE_ENGINE_MESSAGES: Record<Language, string> = {
  fr: "Le moteur IA local n'est pas disponible sur cet appareil.",
  en: "The local AI engine is not available on this device.",
  ar: "محرك الذكاء الاصطناعي المحلي غير متوفر على هذا الجهاز.",
  es: "El motor de IA local no está disponible en este dispositivo.",
  it: "Il motore IA locale non è disponibile su questo dispositivo."
};

export class LocalAIProvider implements AIProvider {
  private engineInstalled: boolean;
  private modelName: string;
  private version: string;
  private isMockEnabled: boolean;

  constructor(config: LocalAIProviderConfig = {}) {
    this.engineInstalled = config.engineInstalled ?? false;
    this.modelName = config.modelName ?? 'BirdAcademy-Local-Tiny';
    this.version = config.version ?? '0.1.0-foundation';
    this.isMockEnabled = config.isMockEnabled ?? false;
  }

  getProviderId(): string {
    return 'local-offline-ai-provider';
  }

  isOffline(): boolean {
    return true;
  }

  getStatus(): AssistantEngineStatus {
    if (!this.engineInstalled && !this.isMockEnabled) {
      return 'UNAVAILABLE';
    }
    return 'AVAILABLE';
  }

  setEngineInstalled(installed: boolean): void {
    this.engineInstalled = installed;
  }

  generateResponse(request: AssistantRequest, context: AssistantContext): AssistantResponse {
    const isRtl = context.language.isRtl;
    const lang = request.language || 'fr';
    const sources: KnowledgeSource[] = [...context.summary.loadedSources];

    // Check for explicit unknown species query
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

    // Deterministic Registry Resolution for Biological inquiries
    if (context.biological) {
      return this.buildBiologicalDeterministicResponse(request, context, isRtl, sources);
    }

    // Deterministic Resolution for User Bird / Farm inquiries
    if (context.bird || context.intelligence || context.breeding || context.habitat || context.finance) {
      return this.buildUserDataDeterministicResponse(request, context, isRtl, sources);
    }

    // If a local LLM runtime is installed or mock is enabled, process locally
    if (this.engineInstalled || this.isMockEnabled) {
      return this.buildStandardResponse(request, context, isRtl, sources);
    }

    // When no local LLM runtime is installed and query cannot be resolved deterministically
    return this.buildUnavailableResponse(request, context, isRtl, sources);
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
    const isClutchQuery = text.includes('ponte') || text.includes('œuf') || text.includes('oeuf') || text.includes('egg') || text.includes('clutch') || text.includes('بيض') || text.includes('puesta');
    const isTempQuery = text.includes('température') || text.includes('temperature') || text.includes('حرارة') || text.includes('temperatura');

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
    let answer = `[${this.modelName} v${this.version}] Requête traitée localement en mode hors-ligne pour la langue ${lang}.`;
    
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

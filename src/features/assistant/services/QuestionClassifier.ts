/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionCategory } from '../types/assistant';

export interface ClassificationResult {
  category: QuestionCategory;
  confidence: number;
  detectedSpeciesId?: string;
  detectedBirdName?: string;
  isUserSpecific: boolean;
  requiresIntelligence: boolean;
}

export class QuestionClassifier {
  /**
   * Classifies a user query to determine domain category and selective data requirements.
   */
  static classify(query: string): ClassificationResult {
    if (!query || typeof query !== 'string') {
      return {
        category: 'UNKNOWN',
        confidence: 0,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    const text = query.trim().toLowerCase();

    // 1. Detect personal / user-specific cues (safe against accented letters like symptômes)
    const userPatterns = [
      /(?:^|[^a-zA-Z\u00C0-\u017F0-9])(mon|ma|mes|my|mi|mis|mio|mia|miei)\s+/i,
      /(?:^|[^a-zA-Z\u00C0-\u017F0-9])(mon oiseau|mon élevage|mon elevage|mes oiseaux|mon couple|mon mâle|mon male|ma femelle|mon nid|mon œuf|mon oeuf|mes pontes)(?:$|[^a-zA-Z\u00C0-\u017F0-9])/i,
      /(?:^|[^a-zA-Z\u00C0-\u017F0-9])(âge de mon|age de mon|l'âge de mon|l'age de mon|cet oiseau|ce couple|cette cage|mon palmarès|mon palmares|mes dépenses|mes depenses|mes ventes|mon bilan|mon cheptel)(?:$|[^a-zA-Z\u00C0-\u017F0-9])/i,
      /(?:^|[^a-zA-Z\u00C0-\u017F0-9])(bague\s+\w+|titan)(?:$|[^a-zA-Z\u00C0-\u017F0-9])/i,
      /(?:^|[^a-zA-Z\u00C0-\u017F0-9])(my bird|my flock|my pair|my clutch|this bird|this pair)(?:$|[^a-zA-Z\u00C0-\u017F0-9])/i,
      /طيوري|طائري|قفصي|عشي|إنتاجي|بيضتي|هذا الطائر|هذا الزوج/,
      /(?:^|[^a-zA-Z\u00C0-\u017F0-9])(mi pájaro|mi pajaro|mi criadero|este pájaro|este pajaro|esta pareja)(?:$|[^a-zA-Z\u00C0-\u017F0-9])/i,
      /(?:^|[^a-zA-Z\u00C0-\u017F0-9])(il mio uccello|il mio allevamento|questo uccello)(?:$|[^a-zA-Z\u00C0-\u017F0-9])/i
    ];
    const isUserSpecific = userPatterns.some(pattern => pattern.test(text));

    // 2. Detect species references
    const detectedSpeciesId = this.detectSpecies(text);

    // 3. Detect Intelligence & Explanation cues
    const intelligenceCues = [
      'bird intelligence', 'intelligence', 'pourquoi cette alerte', 'alerte', 'score',
      'pourquoi ce risque', 'explication alerte', 'recommandation', 'qualité des données',
      'why this alert', 'intelligence score', 'risk factor', 'data quality',
      'لماذا هذا التنبيه', 'تقييم الذكاء', 'مؤشر الخطر', 'جودة البيانات', 'تنبيه',
      'por qué esta alerta', 'puntuación inteligencia', 'alerta',
      'perché questo avviso', 'punteggio intelligenza', 'avviso'
    ];
    if (intelligenceCues.some(cue => text.includes(cue))) {
      return {
        category: 'INTELLIGENCE_EXPLANATION',
        confidence: 0.95,
        detectedSpeciesId,
        isUserSpecific: true,
        requiresIntelligence: true
      };
    }

    // 4. Report queries
    const reportCues = ['rapport', 'bilan annuel', 'bilan mensuel', 'report', 'annual summary', 'synthèse', 'synthese', 'تقرير', 'informe', 'resoconto'];
    if (reportCues.some(cue => text.includes(cue))) {
      return {
        category: 'REPORT_EXPLANATION',
        confidence: 0.9,
        detectedSpeciesId,
        isUserSpecific: true,
        requiresIntelligence: true
      };
    }

    // 5. Finance queries
    const financeCues = ['dépense', 'depense', 'vente', 'coût', 'cout', 'recette', 'bénéfice', 'benefice', 'finance', 'expense', 'revenue', 'profit', 'مصاريف', 'مبيعات', 'أرباح', 'gastos', 'ingresos', 'spese', 'guadagni'];
    if (financeCues.some(cue => text.includes(cue))) {
      return {
        category: isUserSpecific ? 'USER_FINANCE' : 'UNKNOWN',
        confidence: 0.85,
        detectedSpeciesId,
        isUserSpecific,
        requiresIntelligence: false
      };
    }

    // 6. Genealogy / Pedigree queries
    const genealogyCues = ['père', 'pere', 'mère', 'mere', 'parents', 'généalogie', 'genealogie', 'consanguinité', 'consanguinite', 'pedigree', 'lineage', 'father', 'mother', 'inbreeding', 'شجرة النسب', 'الأب', 'الأم', 'قرابة', 'pedigrí', 'ascendenza'];
    if (genealogyCues.some(cue => text.includes(cue))) {
      return {
        category: isUserSpecific ? 'USER_GENEALOGY' : 'GENERAL_BIOLOGY',
        confidence: 0.85,
        detectedSpeciesId,
        isUserSpecific,
        requiresIntelligence: false
      };
    }

    // 7. Health queries
    const healthCues = ['maladie', 'symptôme', 'symptome', 'traitement', 'vaccin', 'vétérinaire', 'veterinaire', 'respiration', 'diarrhée', 'diarrhee', 'malade', 'disease', 'symptom', 'treatment', 'sick', 'vet', 'variole', 'gale', 'coccidiose', 'مرض', 'علاج', 'بيطري', 'أعراض', 'enfermedad', 'tratamiento', 'sintomo', 'malattia', 'cura'];
    if (healthCues.some(cue => text.includes(cue))) {
      return {
        category: isUserSpecific ? 'USER_HEALTH' : 'GENERAL_HEALTH',
        confidence: 0.85,
        detectedSpeciesId,
        isUserSpecific,
        requiresIntelligence: false
      };
    }

    // 8. Breeding & Incubation queries
    const breedingCues = ['incubation', 'ponte', 'éclosion', 'eclosion', 'sevrage', 'baguage', 'nid', 'reproduction', 'œuf', 'oeuf', 'clutch', 'hatch', 'weaning', 'breeding', 'nest', 'egg', 'حضانة', 'تفقيس', 'فطام', 'تزاوج', 'بيض', 'incubación', 'cria', 'nidada', 'cova', 'svezzamento'];
    if (breedingCues.some(cue => text.includes(cue))) {
      return {
        category: isUserSpecific ? 'USER_BREEDING' : 'GENERAL_BREEDING',
        confidence: 0.9,
        detectedSpeciesId,
        isUserSpecific,
        requiresIntelligence: false
      };
    }

    // 9. Feeding queries
    const feedingCues = ['alimentation', 'graine', 'pâtée', 'patee', 'vitamine', 'régime', 'regime', 'nourriture', 'feed', 'diet', 'seed', 'supplement', 'غذاء', 'بذور', 'فيتامين', 'alimentación', 'alimentazione', 'semi'];
    if (feedingCues.some(cue => text.includes(cue))) {
      return {
        category: isUserSpecific ? 'USER_FEEDING' : 'GENERAL_FEEDING',
        confidence: 0.85,
        detectedSpeciesId,
        isUserSpecific,
        requiresIntelligence: false
      };
    }

    // 10. Habitat queries
    const habitatCues = ['cage', 'volière', 'voliere', 'dimensions', 'température', 'temperature', 'humidite', 'humidité', 'aviary', 'humidity', 'قفص', 'سلاكة', 'حرارة', 'رطوبة', 'jaula', 'gabbia'];
    if (habitatCues.some(cue => text.includes(cue))) {
      return {
        category: isUserSpecific ? 'USER_HABITAT' : 'GENERAL_HABITAT',
        confidence: 0.85,
        detectedSpeciesId,
        isUserSpecific,
        requiresIntelligence: false
      };
    }

    // 11. General biology / Species questions
    if (detectedSpeciesId || text.includes('durée') || text.includes('duree') || text.includes('taille') || text.includes('poids') || text.includes('duración') || text.includes('lifespan') || text.includes('عمر') || text.includes('espèce') || text.includes('espece')) {
      return {
        category: isUserSpecific ? 'USER_BIRD' : 'GENERAL_BIOLOGY',
        confidence: 0.8,
        detectedSpeciesId,
        isUserSpecific,
        requiresIntelligence: false
      };
    }

    // 12. User bird / Farm general question
    if (isUserSpecific) {
      return {
        category: 'USER_FARM',
        confidence: 0.75,
        detectedSpeciesId,
        isUserSpecific: true,
        requiresIntelligence: false
      };
    }

    return {
      category: 'UNKNOWN',
      confidence: 0.5,
      detectedSpeciesId,
      isUserSpecific: false,
      requiresIntelligence: false
    };
  }

  private static detectSpecies(text: string): string | undefined {
    if (text.includes('canari') || text.includes('canary') || text.includes('كناري') || text.includes('canario')) {
      return 'canari';
    }
    if (text.includes('chardonneret') || text.includes('goldfinch') || text.includes('حسون') || text.includes('jilguero') || text.includes('cardellino')) {
      return 'chardonneret_elegant';
    }
    if (text.includes('perruche') || text.includes('budgie') || text.includes('درة') || text.includes('periquito') || text.includes('ondulato')) {
      return 'perruche_ondulee';
    }
    if (text.includes('agapornis') || text.includes('inséparable') || text.includes('inseparable') || text.includes('lovebird') || text.includes('طائر الحب')) {
      return 'agapornis';
    }
    if (text.includes('mandarin') || text.includes('zebra finch') || text.includes('زيبرا')) {
      return 'diamant_mandarin';
    }
    if (text.includes('gould') || text.includes('gouldian')) {
      return 'diamant_gould';
    }
    if (text.includes('calopsitte') || text.includes('cockatiel') || text.includes('كوكاتيل') || text.includes('ninfa')) {
      return 'calopsitte';
    }
    if (text.includes('colombe') || text.includes('dove') || text.includes('حمامة') || text.includes('tortolita')) {
      return 'colombe';
    }
    return undefined;
  }
}

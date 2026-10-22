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
    const detectedSpeciesId = this.detectSpecies(text);

    // 1. Detect text assistance and epistemic status actions (Priority V1.9.0)
    // 1.1 Simplification
    const simplifyCues = [
      'simplifier', 'simplifie', 'rendre plus simple', 'raccourcir',
      'simplify', 'make simpler', 'shorten',
      'بسط', 'تبسيط', 'اختصر',
      'simplificar', 'simplifica', 'acortar',
      'semplificare', 'semplifica', 'accorciare'
    ];
    if (simplifyCues.some(c => text.includes(c))) {
      return {
        category: 'TEXT_SIMPLIFICATION',
        confidence: 0.98,
        detectedSpeciesId,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    // 1.2 Résumé / Summarize
    const summarizeCues = [
      'résumer', 'résume', 'synthetiser', 'synthétiser',
      'summarize', 'summary',
      'لخص', 'تلخيص', 'موجز',
      'resumir', 'resumen',
      'riassumere', 'riassunto', 'riassumi'
    ];
    if (summarizeCues.some(c => text.includes(c))) {
      return {
        category: 'TEXT_SUMMARIZATION',
        confidence: 0.98,
        detectedSpeciesId,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    // 1.3 Reformulation / Rephrase
    const rephraseCues = [
      'reformuler', 'reformule', 'réécrire', 'reecrire',
      'rephrase', 'paraphrase', 'rewrite',
      'أعد صياغة', 'إعادة صياغة',
      'reformular', 'reescribir',
      'riformulare', 'riformula'
    ];
    if (rephraseCues.some(c => text.includes(c))) {
      return {
        category: 'TEXT_REPHRASING',
        confidence: 0.98,
        detectedSpeciesId,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    // 1.4 Structuration de note / Assistance à la saisie
    const noteCues = [
      'structurer', 'structure note', 'aider à remplir', 'formater note',
      'transformer en note', 'format note', 'observation :',
      'تنظيم الملاحظة', 'صياغة الملاحظة', 'ملاحظة :',
      'estructurar nota', 'struttura nota'
    ];
    if (noteCues.some(c => text.includes(c))) {
      return {
        category: 'NOTE_STRUCTURING',
        confidence: 0.98,
        detectedSpeciesId,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    // 1.5 Explication de statut épistémique
    const statusCues = [
      'statut unknown', 'statut not_tested', 'statut provisional',
      'statut blocked', 'statut possible_set', 'statut confirmed',
      'que signifie ce statut', 'que signifie le statut',
      'what does this status mean', 'status unknown', 'status provisional',
      'status blocked', 'status not_tested', 'epistemic status',
      'ماذا تعني هذه الحالة', 'حالة unknown', 'حالة provisional', 'حالة blocked',
      'qué significa este estado', 'cosa significa questo stato'
    ];
    if (statusCues.some(c => text.includes(c))) {
      return {
        category: 'EPISTEMIC_STATUS_EXPLANATION',
        confidence: 0.98,
        detectedSpeciesId,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    // 1.6 Explication de résultat de croisement
    const crossResultCues = [
      'résultat de croisement', 'resultat de croisement', 'expliquer le croisement',
      'cross result', 'expliquer le résultat', 'explication croisement',
      'نتيجة التزاوج', 'resultado del cruce', 'risultato dell\'incrocio'
    ];
    if (crossResultCues.some(c => text.includes(c))) {
      return {
        category: 'CROSS_RESULT_EXPLANATION',
        confidence: 0.95,
        detectedSpeciesId,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    // 1.7 Explication générale (uniquement si non couvert par un domaine biologique spécifique)
    const explainCues = [
      'expliquer', 'explique', 'explain', 'c\'est quoi', 'qu\'est-ce que',
      'explicar', 'spiega', 'اشرح'
    ];
    const isDomainQuery = [
      'incubation', 'couvaison', 'حضانة', 'bague', 'baguage', 'poids',
      'maladie', 'généalogie', 'cage', 'alimentation', 'canari', 'chardonneret',
      'intelligence', 'alerte', 'score', 'rapport'
    ].some(d => text.includes(d));

    if (!isDomainQuery && explainCues.some(c => text.startsWith(c) || text.includes(` ${c} `))) {
      return {
        category: 'TEXT_EXPLANATION',
        confidence: 0.90,
        detectedSpeciesId,
        isUserSpecific: false,
        requiresIntelligence: false
      };
    }

    // 2. Detect personal / user-specific cues (safe against accented letters like symptômes)
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



    // 4. Detect Intelligence & Explanation cues
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

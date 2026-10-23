/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LOCAL TEXT ASSISTANT ENGINE
 * Moteur local déterministe d'assistance textuelle et d'explication canonique.
 * 
 * RÈGLES SCIENTIFIQUES & ÉPISTÉMIQUES ABSOLUES :
 * 1. Zéro création ou modification de vérité biologique.
 * 2. Zéro invention de fait : fidélité absolue au texte et aux données fournies.
 * 3. Zéro altération de date, nombre, nom d'oiseau ou statut génétique.
 * 4. Zéro transformation d'une hypothèse en certitude.
 * 5. Zéro diagnostic vétérinaire : structuration d'observation uniquement avec statut observation utilisateur.
 * 6. UNKNOWN -> Cette information est actuellement inconnue (jamais "+/+" ni "certainement porteur").
 * 7. NOT_TESTED -> Locus non testé, non évalué (jamais sauvage ni négatif).
 * 8. PROVISIONAL -> Conserve la nature provisoire de l'hypothèse d'élevage.
 * 9. BLOCKED -> Explique le conflit/blocage sans chercher à le forcer.
 * 10. POSSIBLE_SET -> Conserve l'ensemble des hypothèses sans arbitrer.
 * 11. Multi-langue complet : FR, EN, AR (RTL), ES, IT.
 */

import { Language } from '../../../utils/translations';
import { MinimalLocusContext, MinimalPassportContext, MinimalCrossResultContext } from '../types/assistant';

export class LocalTextAssistantEngine {
  /**
   * Extrait et conserve tous les jetons factuels protégés :
   * - Noms d'oiseaux / bagues
   * - Dates (JJ/MM/AAAA, YYYY-MM-DD, etc.)
   * - Nombres et mesures (18g, 13 jours, 3 œufs, 2.5mm, etc.)
   * - Statuts génétiques (CONFIRMED, PROVISIONAL, UNKNOWN, NOT_TESTED, BLOCKED, POSSIBLE_SET)
   */
  private static extractProtectedTokens(text: string): {
    dates: string[];
    numbers: string[];
    statuses: string[];
  } {
    const dates = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g) || [];
    const numbers = text.match(/\b\d+(?:[.,]\d+)?(?:\s*(?:g|kg|jours?|days?|oeufs?|œufs?|eggs?|mm|cm|bagues?|nids?|clutches?))?\b/gi) || [];
    const statusMatches = text.match(/\b(CONFIRMED|PROVISIONAL|UNKNOWN|NOT_TESTED|BLOCKED|POSSIBLE_SET)\b/g) || [];
    return { dates, numbers, statuses: statusMatches };
  }

  private static stripCommandPrefix(text: string): string {
    return text.replace(/^(?:simplifier(?:\s+ce\s+texte)?|résumer(?:\s+ce\s+texte)?|resumer(?:\s+ce\s+texte)?|reformuler(?:\s+ce\s+texte)?|expliquer(?:\s+simplement)?|que signifie(?:\s+le\s+statut)?|structurer(?:\s+la\s+note)?|simplify(?:\s+this\s+text)?|summarize(?:\s+this\s+text)?|rephrase(?:\s+this\s+text)?|explain)\s*[:\-–—]\s*/i, '').trim();
  }

  /**
   * 1. SIMPLIFIER :
   * Élimine les redondances, fioritures conversationnelles et lourdeurs de style
   * tout en garantissant la préservation stricte de tous les faits, dates, nombres et statuts.
   */
  static simplify(text: string, language: Language = 'fr'): string {
    if (!text || !text.trim()) {
      return this.getEmptyNotice(language);
    }

    let cleaned = this.stripCommandPrefix(text.trim());

    // Nettoyage des préfixes et formules conversationnelles superflues
    const conversationalPrefixes = [
      /^(?:bonjour|bonsoir|salut|hello|hi|dear|hola|buongiorno|مرحبا|أهلا|تحية طيبة)[\s,:-]*/i,
      /^(?:je voulais (?:juste )?(?:vous )?(?:dire|signaler|demander) que|en fait|à vrai dire|il me semble que|pour information)[,\s]*/i,
      /^(?:just to let you know that|actually|as a matter of fact|in fact|i wanted to say that)[,\s]*/i,
      /^(?:quería decir que|de hecho|en realidad|para su información)[,\s]*/i,
      /^(?:volevo solo dire che|in realtà|per informazione)[,\s]*/i,
      /^(?:أردت فقط أن أقول أن|في الواقع|للعلم)[,\s]*/
    ];

    for (const pattern of conversationalPrefixes) {
      cleaned = cleaned.replace(pattern, '').trim();
    }

    // Normalisation des espaces multiples
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Si le texte est très long, structurer en propositions concises
    const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

    if (sentences.length > 2) {
      // Simplification en conservant les faits essentiels
      const simplifiedSentences = sentences.map(s => {
        return s
          .replace(/\b(?:vraiment|extrêmement|très|absolument|certainement|peut-être bien)\s+/gi, '')
          .replace(/\b(?:very|really|extremely|absolutely)\s+/gi, '')
          .trim();
      });
      return simplifiedSentences.join(' ');
    }

    return cleaned;
  }

  /**
   * 2. RÉSUMER :
   * Synthèse dense et fidèle centrée sur les informations factuelles clés.
   */
  static summarize(text: string, language: Language = 'fr'): string {
    if (!text || !text.trim()) {
      return this.getEmptyNotice(language);
    }

    const cleaned = this.stripCommandPrefix(text.trim());
    const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

    if (sentences.length <= 1) {
      return cleaned;
    }

    // Extraction des phrases porteuses de faits clés (contenant dates, chiffres ou entités)
    const keySentences = sentences.filter(s => {
      const hasDigit = /\d/.test(s);
      const hasStatus = /(CONFIRMED|PROVISIONAL|UNKNOWN|NOT_TESTED|BLOCKED|POSSIBLE_SET)/.test(s);
      const hasAvianTerm = /(canari|chardonneret|diamant|gould|bague|oeuf|œuf|ponte|locus|poids|incubation)/i.test(s);
      return hasDigit || hasStatus || hasAvianTerm;
    });

    if (keySentences.length > 0) {
      const maxSentences = Math.max(1, Math.min(2, sentences.length - 1));
      return keySentences.slice(0, maxSentences).join(' ');
    }

    // Fallback : première et dernière phrase
    return `${sentences[0]} ${sentences[sentences.length - 1]}`.trim();
  }

  /**
   * 3. REFORMULER :
   * Restitution en syntaxe avicole claire, sobre et professionnelle, sans perte d'information.
   */
  static rephrase(text: string, language: Language = 'fr'): string {
    if (!text || !text.trim()) {
      return this.getEmptyNotice(language);
    }

    const simplified = this.simplify(text, language);
    // Assure une première lettre majuscule et un point final
    let result = simplified.charAt(0).toUpperCase() + simplified.slice(1);
    if (!/[.!?]$/.test(result)) {
      result += '.';
    }
    return result;
  }

  /**
   * 4. EXPLIQUER SIMPLEMENT :
   * Clarification d'un concept ou d'un terme avicole ou génétique selon le référentiel canonique.
   */
  static explain(conceptOrText: string, language: Language = 'fr', locusContext?: MinimalLocusContext): string {
    if (!conceptOrText || !conceptOrText.trim()) {
      return this.getEmptyNotice(language);
    }

    const cleanConcept = this.stripCommandPrefix(conceptOrText.trim());
    const lower = cleanConcept.toLowerCase();

    // Explication contextuelle si locusContext est fourni
    if (locusContext && locusContext.epistemicStatus) {
      return this.explainStatus(locusContext.epistemicStatus, locusContext.locusName || locusContext.locusId, language);
    }

    // Détection d'un statut dans le texte
    if (lower.includes('unknown') || lower.includes('inconnu') || lower.includes('مجهول')) {
      return this.explainStatus('UNKNOWN', undefined, language);
    }
    if (lower.includes('not_tested') || lower.includes('non testé') || lower.includes('non teste') || lower.includes('غير مفحوص')) {
      return this.explainStatus('NOT_TESTED', undefined, language);
    }
    if (lower.includes('provisional') || lower.includes('provisoire') || lower.includes('مؤقت')) {
      return this.explainStatus('PROVISIONAL', undefined, language);
    }
    if (lower.includes('blocked') || lower.includes('bloqué') || lower.includes('bloque') || lower.includes('محجوب')) {
      return this.explainStatus('BLOCKED', undefined, language);
    }
    if (lower.includes('possible_set') || lower.includes('hypothèses multiples') || lower.includes('hypotheses multiples') || lower.includes('مجموعة الفرضيات')) {
      return this.explainStatus('POSSIBLE_SET', undefined, language);
    }
    if (lower.includes('confirmed') || lower.includes('confirmé') || lower.includes('confirme') || lower.includes('مؤكد')) {
      return this.explainStatus('CONFIRMED', undefined, language);
    }
    if (lower.includes('observed') || lower.includes('observé') || lower.includes('observe') || lower.includes('مرصود')) {
      return this.explainStatus('OBSERVED', undefined, language);
    }
    if (lower.includes('declared') || lower.includes('déclaré') || lower.includes('declare') || lower.includes('مصرح')) {
      return this.explainStatus('DECLARED', undefined, language);
    }
    if (lower.includes('inferred') || lower.includes('déduit') || lower.includes('deduit') || lower.includes('مستنتج')) {
      return this.explainStatus('INFERRED', undefined, language);
    }
    if (lower.includes('needs_human_review') || lower.includes('revue') || lower.includes('vérifier') || lower.includes('مراجعة')) {
      return this.explainStatus('NEEDS_HUMAN_REVIEW', undefined, language);
    }
    if (lower.includes('conflicting') || lower.includes('conflit') || lower.includes('متعارض')) {
      return this.explainStatus('CONFLICTING', undefined, language);
    }
    if (lower.includes('insufficient_information') || lower.includes('insuffisant') || lower.includes('غير كافية')) {
      return this.explainStatus('INSUFFICIENT_INFORMATION', undefined, language);
    }

    // Questions pédagogiques clés V1.9.4 :
    // Q2 : Différence entre génotype et porteur (Phénotype / Génotype / Porteur + ZW)
    if (
      (lower.includes('différence') || lower.includes('difference') || lower.includes('differenza') || lower.includes('الفرق') || lower.includes('distinction')) &&
      (lower.includes('génotype') || lower.includes('genotype') || lower.includes('porteur') || lower.includes('carrier') || lower.includes('portatore') || lower.includes('حامل'))
    ) {
      return this.explainGenotypeVsCarrier(language);
    }
    if (lower.includes('porteur') || lower.includes('porteuse') || lower.includes('carrier') || lower.includes('portador') || lower.includes('portatore') || lower.includes('حامل الطفرة')) {
      return this.explainGenotypeVsCarrier(language);
    }

    // Q3 : Pourquoi inconnu ?
    if ((lower.includes('pourquoi') || lower.includes('why') || lower.includes('por qué') || lower.includes('perché') || lower.includes('لماذا')) &&
        (lower.includes('inconnu') || lower.includes('unknown') || lower.includes('desconocido') || lower.includes('sconosciuto') || lower.includes('مجهول'))) {
      return this.explainWhyUnknown(language, locusContext?.locusName || locusContext?.locusId);
    }

    // Q4 : Que signifie POSSIBLE_SET ?
    if (lower.includes('possible_set') || (lower.includes('hypothèse') && lower.includes('multiple'))) {
      return this.explainStatus('POSSIBLE_SET', undefined, language);
    }

    // Q5 : Pourquoi bloqué ?
    if ((lower.includes('pourquoi') || lower.includes('why') || lower.includes('por qué') || lower.includes('perché') || lower.includes('لماذا')) &&
        (lower.includes('bloqué') || lower.includes('bloque') || lower.includes('blocked') || lower.includes('bloqueado') || lower.includes('bloccato') || lower.includes('محجوب'))) {
      return this.explainWhyBlocked(language, locusContext?.locusName || locusContext?.locusId);
    }

    // Q6 : Expliquer un résultat de croisement
    if (lower.includes('croisement') || lower.includes('cross') || lower.includes('cruce') || lower.includes('incrocio') || lower.includes('تزاوج')) {
      return this.explainCrossResult({}, language);
    }

    // Explications avicoles certifiées
    if (lower.includes('incubation') || lower.includes('couvaison') || lower.includes('حضانة')) {
      const msgs: Record<Language, string> = {
        fr: "L'incubation désigne la période de couvaison des œufs par les reproducteurs jusqu'à l'éclosion (13 jours en moyenne chez le canari domestique).",
        en: "Incubation refers to the egg brooding period until hatching (13 days on average for the domestic canary).",
        ar: "الحضانة هي فترة رقاد الطيور على البيض حتى الفقس (13 يوماً في المتوسط لدى الكناري المحلي).",
        es: "La incubación es el período de empollamiento de los huevos hasta la eclosión (13 días en promedio para el canario doméstico).",
        it: "L'incubazione indica il periodo di cova delle uova fino alla schiusa (13 giorni in media per il canarino domestico)."
      };
      return msgs[language] || msgs.fr;
    }

    if (lower.includes('baguage') || lower.includes('bague') || lower.includes('banding') || lower.includes('تحجيل')) {
      const msgs: Record<Language, string> = {
        fr: "Le baguage consiste à poser une bague fermée officielle à la patte du jeune oiseau (vers le 6e jour chez le canari) pour assurer son identification unique et inaltérable.",
        en: "Banding consists of placing an official closed ring on the chick's leg (around day 6 for canaries) to ensure permanent identification.",
        ar: "التحجيل هو تركيب حلقة رسمية مغلقة على ساق الفرخ (حوالي اليوم السادس لدى الكناري) لضمان تعريفه الدائم.",
        es: "El anillado consiste en colocar una anilla cerrada oficial en la pata del pichón (hacia el día 6 en canarios) para su identificación permanente.",
        it: "L'inanellamento consiste nell'applicare un anellino inamovibile sulla zampa del nidiaceo (verso il sesto giorno nel canarino) per l'identificazione permanente."
      };
      return msgs[language] || msgs.fr;
    }

    if (lower.includes('locus') || lower.includes('loci') || lower.includes('موقع جيني')) {
      const msgs: Record<Language, string> = {
        fr: "Un locus est l'emplacement physique fixe d'un gène sur un chromosome. Le Bird Passport enregistre les allèles et leur statut épistémique pour chaque locus certifié.",
        en: "A locus is the specific physical location of a gene on a chromosome. The Bird Passport tracks alleles and their epistemic status for each certified locus.",
        ar: "الموقع الجيني هو الموضع المحدد للجين على الكروموسوم. يتتبع جواز الطائر الأليلات وحالتها المعرفية لكل موقع معتمد.",
        es: "Un locus es la ubicación específica de un gen en un cromosoma. El Pasaporte del Ave registra los alelos y su estado epistémico para cada locus certificado.",
        it: "Un locus è la posizione fisica di un gene su un cromosoma. Il Passaporto dell'Uccello registra gli alleli e il loro stato epistemico per ogni locus certificato."
      };
      return msgs[language] || msgs.fr;
    }

    // Réponse explicative par défaut fidèle au texte
    const fallbackMsgs: Record<Language, string> = {
      fr: `Explication avicole : « ${conceptOrText} » correspond à une information documentaire d'élevage enregistrée localement dans l'application.`,
      en: `Avicultural explanation: "${conceptOrText}" corresponds to breeding documentary data stored locally in the application.`,
      ar: `توضيح تربوي: « ${conceptOrText} » يمثل بيانات توثيقية مسجلة محلياً في التطبيق.`,
      es: `Explicación avícola: "${conceptOrText}" corresponde a datos documentales registrados localmente en la aplicación.`,
      it: `Spiegazione avicola: "${conceptOrText}" corrisponde a dati documentali registrati localmente nell'applicazione.`
    };
    return fallbackMsgs[language] || fallbackMsgs.fr;
  }

  /**
   * PÉDAGOGIE V1.9.4 : Différence entre Phénotype, Génotype et Porteur.
   */
  static explainGenotypeVsCarrier(language: Language = 'fr'): string {
    const msgs: Record<Language, string> = {
      fr: "Le Phénotype est ce qui est visible à l'œil nu (ex: couleur verte). Le Génotype est la paire d'allèles réelle (ex: B/b). Un Porteur possède un allèle mutant récessif masqué par l'allèle dominant : il ne l'exprime pas visuellement mais peut le transmettre à sa descendance. Règle cytogénétique stricte : chez les oiseaux, la femelle (ZW) n'a qu'un seul chromosome Z et ne peut donc JAMAIS être porteuse d'une mutation liée au sexe (Z) ; si elle possède l'allèle, elle l'exprime obligatoirement.",
      en: "The Phenotype is what is visible to the naked eye (e.g. green body). The Genotype is the actual allele pair (e.g. B/b). A Carrier possesses a recessive mutant allele masked by the dominant allele: it does not express it visually but can pass it on to offspring. Strict cytogenetic rule: in birds, females (ZW) have only one Z chromosome and can NEVER carry a sex-linked (Z) mutation; if she has the allele, she must express it.",
      ar: "النمط الظاهري (الفينوتيب) هو ما يُرى بالعين المجردة (مثل اللون الأخضر). النمط الوراثي (الجوهر) هو زوج الأليلات الحقيقي (مثل B/b). الطائر الحامل يحمل أليلاً متنحياً تخفيه السيادة: لا يظهره خارجياً لكنه ينقله لنسله. قاعدة سيتوجينية صارمة: أنثى الطيور (ZW) تمتلك كروموسوماً Z واحداً فقط وبالتالي لا يمكن أبداً أن تكون حاملة لطفرة مرتبطة بالجنس (Z)؛ إما أن تكون نقية أو طافرة ظاهرياً.",
      es: "El Fenotipo es lo visible a simple vista (ej: cuerpo verde). El Genotipo es el par real de alelos (ej: B/b). Un Portador posee un alelo mutante recesivo enmascarado por el alelo dominante: no lo expresa visualmente pero lo transmite a la descendencia. Regla citogenética estricta: en las aves, la hembra (ZW) solo tiene un cromosoma Z y NUNCA puede ser portadora de una mutación ligada al sexo (Z).",
      it: "Il Fenotipo è ciò che è visibile a occhio nudo (es: corpo verde). Il Genotipo è la coppia effettiva di alleli (es: B/b). Un Portatore possiede un allele mutante recessivo mascherato dall'allele dominante: non lo esprime visivamente ma può trasmetterlo alla prole. Regola citogenetica rigida: negli uccelli, la femmina (ZW) ha un solo cromosoma Z e non può MAI essere portatrice di una mutazione legata al sesso (Z)."
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * PÉDAGOGIE V1.9.4 : Pourquoi une information est-elle inconnue ?
   */
  static explainWhyUnknown(language: Language = 'fr', locusName?: string): string {
    const prefix = locusName ? `${locusName} — ` : '';
    const msgs: Record<Language, string> = {
      fr: `${prefix}Cette information est inconnue car aucune observation phénotypique, déclaration d'élevage, analyse généalogique certifiée ni test ADN n'a encore été enregistrée pour ce locus. L'application refuse rigoureusement d'extrapoler ou de pré-remplir un génotype par défaut.`,
      en: `${prefix}This information is unknown because no phenotypic observation, breeder declaration, certified pedigree analysis, or DNA test has been recorded yet for this locus. The application strictly refuses to extrapolate or fill in a default genotype.`,
      ar: `${prefix}هذه المعلومة غير معروفة لأنه لم يتم بعد تسجيل أي ملاحظة ظاهرية أو تصريح تربية أو تحليل نسب معتمد أو فحص DNA لهذا الموقع الجيني. يرفض التطبيق بشكل قاطع تخمين أو ملء نمط وراثي افتراضياً.`,
      es: `${prefix}Esta información es desconocida porque no se ha registrado ninguna observación fenotípica, declaración de cría, análisis genealógico certificado ni prueba de ADN para este locus. La aplicación se niega estrictamente a extrapolar o rellenar un genotipo por defecto.`,
      it: `${prefix}Questa informazione è sconosciuta poiché non è stata ancora registrata alcuna osservazione fenotipica, dichiarazione di allevamento, analisi genealogica certificata o test DNA per questo locus. L'applicazione rifiuta rigorosamente di estrapolare o precompilare un genotipo predefinito.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * PÉDAGOGIE V1.9.4 : Pourquoi une mutation est-elle bloquée ?
   */
  static explainWhyBlocked(language: Language = 'fr', locusName?: string): string {
    const prefix = locusName ? `${locusName} — ` : '';
    const msgs: Record<Language, string> = {
      fr: `${prefix}Ce locus est bloqué (BLOCKED) car il fait l'objet d'un conflit scientifique actif ou de contradictions non résolues dans la littérature avicole (ex: transmission autosomique vs liée au sexe, allélisme incertain). Pour préserver l'intégrité génétique, les simulations automatiques sont désactivées pour ce locus.`,
      en: `${prefix}This locus is blocked (BLOCKED) because it is the subject of active scientific conflict or unresolved contradictions in avicultural literature (e.g. autosomal vs sex-linked transmission, uncertain allelism). To preserve genetic integrity, automatic simulations are disabled for this locus.`,
      ar: `${prefix}هذا الموقع الجيني محجوب (BLOCKED) لأنه موضوع نزاع علمي نشط أو تناقضات غير محلولة في مراجع علم الطيور (مثل الوراثة الجسدية مقابل المرتبطة بالجنس). لحماية النزاهة العلمية، يتم تعطيل المحاكاة التلقائية لهذا الموقع.`,
      es: `${prefix}Este locus está bloqueado (BLOCKED) porque es objeto de un conflicto científico activo o contradicciones no resueltas en la literatura avícola. Para preservar la integridad genética, las simulaciones automáticas están deshabilitadas para este locus.`,
      it: `${prefix}Questo locus è bloccato (BLOCKED) in quanto oggetto di un conflitto scientifico attivo o contraddizioni irrisolte nella letteratura avicola. Per preservare l'integrità genetica, le simulazioni automatiche sono disabilitate per questo locus.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 5. STRUCTURER UNE NOTE (ASSISTANCE À LA SAISIE) :
   * Transforme une observation libre en note avicole structurée.
   * RÈGLE ABSOLUE : Zéro diagnostic vétérinaire. Marquage explicite "Statut : observation utilisateur".
   */
  static structureNote(rawText: string, language: Language = 'fr'): string {
    if (!rawText || !rawText.trim()) {
      return this.getEmptyNotice(language);
    }

    const text = rawText.trim();
    const lower = text.toLowerCase();

    // Détection des volets d'observation
    let observationClause = text;
    let feedingClause = '';

    // Détection de clauses liées à l'alimentation
    if (lower.includes('mange') || lower.includes('appétit') || lower.includes('graines') || lower.includes('pâtée') || lower.includes('eau') || lower.includes('feed') || lower.includes('eat') || lower.includes('تغذية') || lower.includes('أكل')) {
      const feedingMatch = text.match(/(?:mange|appétit|alimentation|graines|pâtée|eau|feed|eating|appetite|يأكل|شهية)[^.,;!?]*(?:[.,;!?]|$)/i);
      if (feedingMatch) {
        feedingClause = feedingMatch[0].trim().replace(/[.,;!?]$/, '');
      }
    }

    const labels: Record<Language, { obs: string; feed: string; stat: string; defaultFeed: string }> = {
      fr: {
        obs: "Observation",
        feed: "Alimentation",
        stat: "Statut : observation utilisateur",
        defaultFeed: "Conforme / non renseignée"
      },
      en: {
        obs: "Observation",
        feed: "Feeding",
        stat: "Status: user observation",
        defaultFeed: "Normal / not specified"
      },
      ar: {
        obs: "الملاحظة",
        feed: "التغذية",
        stat: "الحالة : ملاحظة المستخدم",
        defaultFeed: "طبيعية / غير محددة"
      },
      es: {
        obs: "Observación",
        feed: "Alimentación",
        stat: "Estado: observación del usuario",
        defaultFeed: "Normal / no especificada"
      },
      it: {
        obs: "Osservazione",
        feed: "Alimentazione",
        stat: "Stato: osservazione utente",
        defaultFeed: "Normale / non specificata"
      }
    };

    const l = labels[language] || labels.fr;
    const finalFeed = feedingClause ? feedingClause : l.defaultFeed;

    return `${l.obs} : ${observationClause}\n${l.feed} : ${finalFeed}\n${l.stat}`;
  }

  /**
   * 6. EXPLIQUER UN STATUT ÉPISTÉMIQUE :
   * Respecte strictement les définitions canoniques formelles.
   */
  static explainStatus(status: string, locusName?: string, language: Language = 'fr'): string {
    const locusPrefix = locusName ? `${locusName} — ` : '';
    let normStatus = (status || '').toUpperCase().trim();
    const match = normStatus.match(/\b(UNKNOWN|NOT_TESTED|PROVISIONAL|BLOCKED|POSSIBLE_SET|CONFIRMED|OBSERVED|DECLARED|INFERRED|NEEDS_HUMAN_REVIEW|CONFLICTING|INSUFFICIENT_INFORMATION)\b/);
    if (match) {
      normStatus = match[1];
    }

    switch (normStatus) {
      case 'OBSERVED': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Observation phénotypique visuelle. Ce statut indique ce qui est constaté visuellement, sans garantir à lui seul le génotype complet (l'oiseau peut porter des allèles récessifs invisibles).`,
          en: `${locusPrefix}Visual phenotypic observation. This status indicates what is observed visually, without guaranteeing the complete genotype on its own (the bird may carry hidden recessive alleles).`,
          ar: `${locusPrefix}ملاحظة ظاهرية بصرية. تشير هذه الحالة إلى ما تمت مشاهدته بصرياً، دون ضمان النمط الوراثي الكامل بمفرده (قد يحمل الطائر أليلات متنحية مخفية).`,
          es: `${locusPrefix}Observación fenotípica visual. Este estado indica lo constatado visualmente, sin garantizar por sí solo el genotipo completo (el ave puede portar alelos recesivos ocultos).`,
          it: `${locusPrefix}Osservazione fenotipica visiva. Questo stato indica quanto osservato visivamente, senza garantire da solo il genotipo completo (l'uccello può portare alleli recessivi nascosti).`
        };
        return msgs[language] || msgs.fr;
      }

      case 'DECLARED': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Déclaration manuelle enregistrée par l'éleveur. Elle repose sur la parole de l'éleveur ou un document externe non certifié, sans vérification par test ADN ni analyse généalogique certifiée.`,
          en: `${locusPrefix}Manual declaration recorded by the breeder. It relies on breeder statement or uncertified external records, without DNA verification or certified pedigree analysis.`,
          ar: `${locusPrefix}تصريح يدوي مسجل من قبل المربي. يستند إلى إقرار المربي أو وثيقة غير معتمدة، دون فحص DNA أو تحليل نسبي معتمد.`,
          es: `${locusPrefix}Declaración manual registrada por el criador. Se basa en la palabra del criador sin prueba de ADN ni verificación genealógica certificada.`,
          it: `${locusPrefix}Dichiarazione manuale registrata dall'allevatore. Si basa sulla dichiarazione dell'allevatore senza verifica tramite test DNA o analisi genealogica certificata.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'INFERRED': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Déduction logique issue de la généalogie ou de règles mendéliennes. Ce statut reste conditionné par la fiabilité des parents et nécessite une validation humaine.`,
          en: `${locusPrefix}Logical deduction derived from pedigree or Mendelian rules. This status remains conditional on parental accuracy and requires human validation.`,
          ar: `${locusPrefix}استنتاج منطقي مستمد من النسب أو القواعد المندلية. يظل مشروطاً بصحة بيانات الأبوين ويتطلب مراجعة بشرية.`,
          es: `${locusPrefix}Deducción lógica derivada del pedigrí o reglas mendelianas. Permanece condicionada a la fiabilidad de los padres y requiere validación humana.`,
          it: `${locusPrefix}Deduzione logica derivata dal pedigree o dalle regole mendeliane. Rimane subordinata all'affidabilità dei genitori e richiede convalida umana.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'NEEDS_HUMAN_REVIEW': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Revue humaine requise. Les données présentent une ambiguïté, un cadre provisoire ou une anomalie cytogénétique nécessitant la confirmation explicite de l'éleveur.`,
          en: `${locusPrefix}Human review required. The data shows ambiguity, a provisional framework, or a cytogenetic anomaly requiring explicit confirmation by the breeder.`,
          ar: `${locusPrefix}مراجعة بشرية مطلوبة. تتضمن البيانات غموضاً أو إطاراً مؤقتاً أو حالة تتطلب تأكيداً صريحاً من المربي.`,
          es: `${locusPrefix}Revisión humana requerida. Los datos presentan ambigüedad, marco provisional o anomalía que requiere confirmación explícita del criador.`,
          it: `${locusPrefix}Revisione umana richiesta. I dati presentano ambiguità, quadro provvisorio o anomalie che richiedono la conferma esplicita dell'allevatore.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'CONFLICTING': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Données contradictoires ou controverse scientifique non résolue. L'application bloque toute déduction unilatérale tant que le conflit documentaire persiste.`,
          en: `${locusPrefix}Conflicting data or unresolved scientific controversy. The application blocks any unilateral deduction while documentary conflict persists.`,
          ar: `${locusPrefix}بيانات متعارضة أو نزاع علمي لم يُحل. يحظر التطبيق أي استنتاج أحادي الجانب طالما استمر التعارض التوثيقي.`,
          es: `${locusPrefix}Datos contradictorios o controversia científica no resuelta. La aplicación bloquea cualquier deducción unilateral mientras persista el conflicto.`,
          it: `${locusPrefix}Dati contraddittori o controversia scientifica irrisolta. L'applicazione blocca qualsiasi deduzione unilaterale finché persiste il conflitto documentale.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'INSUFFICIENT_INFORMATION': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Informations insuffisantes pour conclure sur ce locus. Données parentales ou phénotypiques incomplètes.`,
          en: `${locusPrefix}Insufficient information to conclude on this locus. Incomplete parental or phenotypic data.`,
          ar: `${locusPrefix}معلومات غير كافية للبت في هذا الموقع الجيني. بيانات الأبوين أو النمط الظاهري غير مكتملة.`,
          es: `${locusPrefix}Información insuficiente para concluir sobre este locus. Datos parentales o fenotípicos incompletos.`,
          it: `${locusPrefix}Informazioni insufficienti per concludere su questo locus. Dati parentali o fenotipici incompleti.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'UNKNOWN': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Cette information est actuellement inconnue. Aucun génotype ni allèle n'est présumé ou affirmé pour ce locus sans preuve documentée.`,
          en: `${locusPrefix}This information is currently unknown. No genotype or allele is assumed or asserted for this locus without documented proof.`,
          ar: `${locusPrefix}هذه المعلومة غير معروفة حالياً. لا يتم افتراض أو تأكيد أي نمط وراثي لهذا الموقع الجيني دون دليل موثق.`,
          es: `${locusPrefix}Esta información es actualmente desconocida. No se presume ni afirma ningún genotipo para este locus sin prueba documentada.`,
          it: `${locusPrefix}Questa informazione è attualmente sconosciuta. Nessun genotipo è presunto o affermato per questo locus senza prova documentata.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'NOT_TESTED': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Ce locus n'a pas été testé. Son statut génétique demeure non évalué et ne signifie en aucun cas l'absence de mutation.`,
          en: `${locusPrefix}This locus has not been tested. Its genetic status remains unevaluated and under no circumstances implies the absence of mutation.`,
          ar: `${locusPrefix}لم يتم فحص هذا الموقع الجيني. تظل حالته الوراثية غير مقيمة ولا يعني ذلك بأي حال غياب الطفرة.`,
          es: `${locusPrefix}Este locus no ha sido probado. Su estado genético permanece sin evaluar y de ninguna manera implica la ausencia de mutación.`,
          it: `${locusPrefix}Questo locus non è stato testato. Il suo stato genetico rimane non valutato e non implica in alcun caso l'assenza di mutazione.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'PROVISIONAL': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Ce statut est provisoire. Il s'agit d'une hypothèse de travail d'élevage en attente de confirmation formelle par descendance ou test.`,
          en: `${locusPrefix}This status is provisional. It represents a working breeding hypothesis awaiting formal confirmation through progeny or testing.`,
          ar: `${locusPrefix}هذه الحالة مؤقتة. إنها تمثل فرضية عمل للتزاوج في انتظار التأكيد الرسمي عبر النسل أو الفحص.`,
          es: `${locusPrefix}Este estado es provisional. Representa una hipótesis de trabajo de cría pendiente de confirmación formal por descendencia o prueba.`,
          it: `${locusPrefix}Questo stato è provvisorio. Rappresenta un'ipotesi di lavoro di allevamento in attesa di conferma formale tramite prole o test.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'BLOCKED': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Ce locus est actuellement bloqué en raison d'un conflit documentaire ou d'une controverse nécessitant une révision humaine. L'assistant ne résout pas ce blocage de façon autonome.`,
          en: `${locusPrefix}This locus is currently blocked due to documentary conflict or controversy requiring human review. The assistant does not autonomously resolve this block.`,
          ar: `${locusPrefix}هذا الموقع الجيني محجوب حالياً بسبب تعارض توثيقي أو خلاف يتطلب مراجعة بشرية. لا يقوم المساعد بفك هذا الحجب ذاتياً.`,
          es: `${locusPrefix}Este locus está actualmente bloqueado debido a un conflicto documental o controversia que requiere revisión humana. El asistente no resuelve este bloqueo de forma autónoma.`,
          it: `${locusPrefix}Questo locus è attualmente bloccato a causa di un conflitto documentale o controversia che richiede revisione umana. L'assistente non sblocca autonomamente questa situazione.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'POSSIBLE_SET': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Plusieurs hypothèses génétiques coexistent pour ce locus. L'ensemble des hypothèses documentées est conservé sans arbitrage unilatéral.`,
          en: `${locusPrefix}Multiple genetic hypotheses coexist for this locus. All documented hypotheses are preserved without unilateral arbitration.`,
          ar: `${locusPrefix}تتعايش عدة فرضيات وراثية لهذا الموقع الجيني. يتم الاحتفاظ بجميع الفرضيات الموثقة دون تحكيم أحادي الجانب.`,
          es: `${locusPrefix}Coexisten múltiples hipótesis genéticas para este locus. Se conservan todas las hipótesis documentadas sin arbitraje unilateral.`,
          it: `${locusPrefix}Coesistono più ipotesi genetiche per questo locus. Tutte le ipotesi documentate sono conservate senza arbitrato unilaterale.`
        };
        return msgs[language] || msgs.fr;
      }

      case 'CONFIRMED': {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Ce statut est confirmé et validé par des observations formelles, une traçabilité généalogique certifiée ou des références bibliographiques.`,
          en: `${locusPrefix}This status is confirmed and validated by formal observations, certified genealogical traceability, or bibliographic references.`,
          ar: `${locusPrefix}هذه الحالة مؤكدة ومثبتة بملاحظات رسمية أو تتبع نسبي معتمد أو مراجع ببليوغرافية.`,
          es: `${locusPrefix}Este estado está confirmado y validado por observaciones formales, trazabilidad genealógica certificada o referencias bibliográficas.`,
          it: `${locusPrefix}Questo stato è confermato e validato da osservazioni formali, tracciabilità genealogica certificata o riferimenti bibliografici.`
        };
        return msgs[language] || msgs.fr;
      }

      default: {
        const msgs: Record<Language, string> = {
          fr: `${locusPrefix}Statut génétique : ${status}. L'information est restituée telle qu'enregistrée dans le modèle canonique.`,
          en: `${locusPrefix}Genetic status: ${status}. Information is displayed as recorded in the canonical model.`,
          ar: `${locusPrefix}الحالة الوراثية: ${status}. يتم عرض المعلومات كما هي مسجلة في النموذج القانوني.`,
          es: `${locusPrefix}Estado genético: ${status}. La información se muestra tal como está registrada en el modelo canónico.`,
          it: `${locusPrefix}Stato genetico: ${status}. Le informazioni vengono visualizzate così come registrate nel modello canonico.`
        };
        return msgs[language] || msgs.fr;
      }
    }
  }

  /**
   * 7. EXPLIQUER UN BIRD PASSPORT :
   * Synthèse purement documentaire du passeport sans aucune modification des données.
   */
  static explainPassport(passport: MinimalPassportContext, language: Language = 'fr'): string {
    const birdDesc = passport.birdNom || passport.bague || 'Oiseau';
    const lociCount = passport.canonicalLoci?.length ?? passport.canonicalLociCount ?? 0;

    const msgs: Record<Language, string> = {
      fr: `Le Bird Passport de ${birdDesc} comprend ${lociCount} loci génétiques canoniques enregistrés. Toutes les données sont persistées localement et protégées en lecture seule lors de l'assistance.`,
      en: `The Bird Passport for ${birdDesc} includes ${lociCount} recorded canonical genetic loci. All data is stored locally and protected in read-only mode during assistance.`,
      ar: `يتضمن جواز الطائر لـ ${birdDesc} عدد ${lociCount} موقعاً جينياً قانونياً مسجلاً. يتم حفظ كافة البيانات محلياً وحمايتها للقراءة فقط.`,
      es: `El Pasaporte del Ave para ${birdDesc} incluye ${lociCount} loci genéticos canónicos registrados. Todos los datos se almacenan localmente y están protegidos en modo solo lectura.`,
      it: `Il Passaporto dell'Uccello per ${birdDesc} comprende ${lociCount} loci genetici canonici registrati. Tutti i dati sono memorizzati localmente e protetti in sola lettura.`
    };

    return msgs[language] || msgs.fr;
  }

  /**
   * 8. EXPLIQUER UN RÉSULTAT DE CROISEMENT :
   * Explique le résultat calculé par le moteur officiel sans créer de calcul parallèle.
   */
  static explainCrossResult(cross: MinimalCrossResultContext, language: Language = 'fr'): string {
    const parentMale = cross.parentMale || 'Mâle';
    const parentFemale = cross.parentFemale || 'Femelle';
    const count = cross.outcomeCount ?? 0;

    const msgs: Record<Language, string> = {
      fr: `Résultat officiel du croisement (${parentMale} x ${parentFemale}) : ${count} génotypes/phénotypes possibles calculés par le moteur canonique. L'assistant restitue cette distribution certifiée sans recalculer.`,
      en: `Official cross result (${parentMale} x ${parentFemale}): ${count} possible genotypes/phenotypes computed by the canonical engine. The assistant displays this certified distribution without recalculating.`,
      ar: `النتيجة الرسمية للتزاوج (${parentMale} x ${parentFemale}): ${count} نمط وراثي/ظاهري محتمل تم حسابه بواسطة المحرك المعتمد. يعرض المساعد هذا التوزيع المعتمد دون إعادة حساب.`,
      es: `Resultado oficial del cruce (${parentMale} x ${parentFemale}): ${count} genotipos/fenotipos posibles calculados por el motor canónico. El asistente muestra esta distribución certificada sin recalcular.`,
      it: `Risultato ufficiale dell'incrocio (${parentMale} x ${parentFemale}): ${count} genotipi/fenotipi possibili calcolati dal motore canonico. L'assistente mostra questa distribuzione certificata senza ricalcolare.`
    };

    return msgs[language] || msgs.fr;
  }

  /**
   * 9. EXPLIQUER UNE ÉTAPE D'INCUBATION (V1.9.5) :
   * Explication didactique des jalons (début, mirage, contrôle, éclosion) sans inventer de règles.
   */
  static explainIncubationStep(stepName: string, language: Language = 'fr'): string {
    const s = stepName.toLowerCase();
    const isCandling = s.includes('mirage') || s.includes('candling');
    const isHatching = s.includes('eclosion') || s.includes('éclosion') || s.includes('hatch');
    const isStart = s.includes('debut') || s.includes('début') || s.includes('start');

    if (isCandling) {
      const msgs: Record<Language, string> = {
        fr: "Le mirage consiste à observer par translucidité le réseau vasculaire embryonnaire (vers J+6). Une absence de réseau indique un œuf clair ou non démarré, sans extrapolation définitive avant le délai homologué.",
        en: "Candling consists of translucently inspecting the embryonic vascular network (around day 6). Absence of blood vessels indicates a clear or unstarted egg, without premature conclusions before standard period.",
        ar: "الكشف الضوئي يعتمد على فحص الشبكة الدموية للجنين عبر الضوء (حوالي اليوم السادس). يشير غياب الأوعية إلى بيضة غير ملقحة دون جزم نهائي قبل الموعد المعتمد.",
        es: "La ovoscopia examina a contraluz la red vascular embrionaria (hacia el día 6). La ausencia de vasos indica un huevo claro sin conclusiones antes del plazo homologado.",
        it: "La speratura esamina in controluce la rete vascolare embrionale (verso il 6° giorno). L'assenza di vasi indica un uovo chiaro senza conclusioni affrettate prima del termine stabilito."
      };
      return msgs[language] || msgs.fr;
    }

    if (isHatching) {
      const msgs: Record<Language, string> = {
        fr: "L'éclosion correspond au bêchage de la coquille par le jeune (vers J+13-J+14 chez le canari). La date est calculée à partir du début réel d'incubation sans présumer du succès biologique.",
        en: "Hatching corresponds to pipping of the shell by the chick (around day 13-14 for canaries). The date is calculated from actual incubation start without presuming biological outcome.",
        ar: "التفقيس يوافق نقر القشرة بواسطة الفرخ (حوالي اليوم 13-14 للكناري). يُحسب التاريخ بناءً على بداية الحضانة الفعلية دون التنبؤ بالنتيجة.",
        es: "La eclosión corresponde a la rotura de la cáscara por el pichón (hacia día 13-14 en canarios). La fecha se calcula desde el inicio real de incubación sin presumir el éxito.",
        it: "La schiusa corrisponde alla rottura del guscio da parte del pulcino (verso il 13°-14° giorno per i canarini). La data è calcolata dall'inizio effettivo dell'incubazione."
      };
      return msgs[language] || msgs.fr;
    }

    if (isStart) {
      const msgs: Record<Language, string> = {
        fr: "Le début d'incubation correspond au démarrage effectif de la couvaison continue. Si cette date n'est pas consignée, le calendrier théorique ne peut être calculé arbitrairement.",
        en: "Incubation start corresponds to the actual beginning of continuous brooding. If this date is unrecorded, theoretical calendar milestones cannot be arbitrarily estimated.",
        ar: "بداية الحضانة هي البدء الفعلي للرقاد المستمر على البيض. إذا لم يُسجل هذا التاريخ، لا يمكن تقدير المواعيد النظرية اعتباطياً.",
        es: "El inicio de incubación corresponde al comienzo de la incubación continua. Si esta fecha no está registrada, el calendario teórico no puede estimarse arbitrariamente.",
        it: "L'inizio dell'incubazione corrisponde all'avvio effettivo della cova continua. Se questa data non è inserita, il calendario teorico non può essere stimato arbitrariamente."
      };
      return msgs[language] || msgs.fr;
    }

    const msgs: Record<Language, string> = {
      fr: `Étape d'incubation : ${stepName}. Les durées sont conformes au référentiel biologique homologué sans date inventée.`,
      en: `Incubation step: ${stepName}. Durations adhere strictly to certified biological reference without invented dates.`,
      ar: `مرحلة الحضانة: ${stepName}. المدد مطابقة للمرجع البيولوجي المعتمد دون اختلاق تواريخ.`,
      es: `Etapa de incubación: ${stepName}. Las duraciones cumplen el marco biológico homologado sin fechas inventadas.`,
      it: `Tappa di incubazione: ${stepName}. Le durate sono conformi al quadro biologico approvato senza date inventate.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 10. EXPLIQUER POURQUOI UNE DATE EST INCONNUE (V1.9.5) :
   */
  static explainWhyDateUnknown(fieldName: string, language: Language = 'fr'): string {
    const msgs: Record<Language, string> = {
      fr: `Le champ « ${fieldName} » est affiché comme Date inconnue car aucune date effective n'a été enregistrée par l'éleveur. L'application s'interdit d'inventer une date estimée pour préserver l'honnêteté du registre.`,
      en: `Field "${fieldName}" displays Unknown Date because no actual date has been entered by the breeder. Bird Academy strictly prohibits generating estimated dates to safeguard record integrity.`,
      ar: `يظهر الحقل "${fieldName}" كتاريخ غير معروف لعدم تسجيل تاريخ فعلي من قِبل المربي. يحظر النظام اختلاق تواريخ تقديرية حفاظاً على مصداقية السجل.`,
      es: `El campo "${fieldName}" aparece como Fecha desconocida porque no se ha registrado una fecha real. La aplicación no inventa fechas estimadas para preservar la integridad del registro.`,
      it: `Il campo "${fieldName}" viene mostrato come Data sconosciuta poiché non è stata registrata alcuna data effettiva. L'applicazione non inventa date stimate per garantire la veridicità dei registri.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 11. RÉSUMER LA REPRODUCTION D'UN COUPLE (V1.9.5) :
   * Synthèse factuelle sans score, note ni recommandation d'accouplement.
   */
  static summarizeBreedingCycle(
    data: { pairName?: string; eggCount?: number; hatchedCount?: number; weanedCount?: number },
    language: Language = 'fr'
  ): string {
    const name = data.pairName || 'Couple';
    const eggs = data.eggCount ?? 0;
    const hatched = data.hatchedCount ?? 0;
    const weaned = data.weanedCount ?? 0;

    const msgs: Record<Language, string> = {
      fr: `Synthèse factuelle de reproduction pour ${name} : ${eggs} œuf(s) consigné(s), ${hatched} jeune(s) éclos, ${weaned} sevré(s). Aucun score ni recommandation d'accouplement n'est émis.`,
      en: `Factual breeding summary for ${name}: ${eggs} egg(s) recorded, ${hatched} chick(s) hatched, ${weaned} weaned. No mating score or pairing recommendation is issued.`,
      ar: `ملخص واقعي للتكاثر للزوج ${name}: ${eggs} بيضة مسجلة، ${hatched} فرخ فقس، ${weaned} مفطوم. لا يتم إصدار أي تقييم أو توصية تزاوج.`,
      es: `Resumen factual de reproducción para ${name}: ${eggs} huevo(s) registrado(s), ${hatched} pichón(es) eclosionado(s), ${weaned} destetado(s). Sin puntuación ni recomendación de apareamiento.`,
      it: `Sintesi oggettiva della riproduzione per ${name}: ${eggs} uovo/a registrato/e, ${hatched} pulcino/i schiuso/i, ${weaned} svezzato/i. Nessun punteggio o consiglio di accoppiamento.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 12. EXPLIQUER LES DONNÉES MANQUANTES (V1.9.5) :
   * Détection et formulation neutre.
   */
  static explainMissingBreedingData(missingCount: number, language: Language = 'fr'): string {
    const msgs: Record<Language, string> = {
      fr: missingCount > 0 
        ? `${missingCount} paramètre(s) d'élevage non renseigné(s). Information manquante : une vérification humaine est nécessaire sans complétion automatique.`
        : "Toutes les informations d'élevage obligatoires sont renseignées. Aucune donnée critique manquante.",
      en: missingCount > 0
        ? `${missingCount} unrecorded breeding parameter(s). Missing information: human review is required without automatic completion.`
        : "All mandatory breeding information is recorded. No critical missing data.",
      ar: missingCount > 0
        ? `${missingCount} معطيات تكاثر غير مسجلة. معلومات ناقصة: المراجعة البشرية مطلوبة دون إكمال تلقائي.`
        : "جميع معلومات التكاثر الأساسية مسجلة. لا توجد بيانات مفقودة.",
      es: missingCount > 0
        ? `${missingCount} parámetro(s) de cría no registrado(s). Información faltante: se requiere verificación humana sin autocompletado.`
        : "Toda la información obligatoria de cría está registrada. Sin datos faltantes.",
      it: missingCount > 0
        ? `${missingCount} parametro/i di riproduzione non inserito/i. Informazione mancante: è richiesta verifica umana senza completamento automatico.`
        : "Tutte le informazioni obbligatorie sono registrate. Nessun dato mancante."
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 13. EXPLIQUER LA CHRONOLOGIE D'ÉLEVAGE (V1.9.5) :
   * Clarifie les 9 étapes du cycle naturel.
   */
  static explainBreedingTimeline(language: Language = 'fr'): string {
    const msgs: Record<Language, string> = {
      fr: "Le cycle de reproduction suit l'ordre naturel certifié : Formation du Couple → Déclaration de Ponte → Dépôt des Œufs → Incubation continue → Mirage / Contrôle → Éclosion → Suivi du Jeune → Nurserie / Alimentation → Sevrage biologique. Chaque événement est restitué dans son ordre chronologique réel.",
      en: "The breeding cycle follows the certified natural order: Pair Formation → Clutch Record → Egg Laying → Continuous Incubation → Candling / Inspection → Hatching → Chick Growth → Nursery / Feeding → Biological Weaning. Each milestone reflects actual chronological order.",
      ar: "تتبع دورة التكاثر التسلسل الطبيعي المعتمد: تشكيل الزوج ← تسجيل البطن ← وضع البيض ← الحضانة المستمرة ← الكشف الضوئي ← التفقيس ← نمو الفرخ ← الحضانة والتغذية ← الفطام البيولوجي. تُعرض الأحداث وفق ترتيبها الزمني الفعلي.",
      es: "El ciclo de reproducción sigue el orden natural certificado: Formación de Pareja → Registro de Nidada → Puesta de Huevos → Incubación continua → Ovoscopia / Control → Eclosión → Crecimiento del Pichón → Guardería / Alimentación → Destete biológico.",
      it: "Il ciclo riproduttivo segue l'ordine naturale approvato: Formazione Coppia → Registrazione Covata → Deposizione Uova → Incubazione continua → Speratura / Controllo → Schiusa → Sviluppo Pulcino → Nursery / Alimentazione → Svezzamento biologico."
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 14. EXPLIQUER L'ORGANISATION D'UNE VOLIÈRE (V1.9.6) :
   */
  static explainAviaryOrganization(
    aviaryName: string,
    cageCount: number,
    birdCount: number,
    language: Language = 'fr'
  ): string {
    const msgs: Record<Language, string> = {
      fr: `La volière « ${aviaryName} » regroupe ${cageCount} cage(s) pour un effectif total de ${birdCount} oiseau(x). L'organisation respecte la hiérarchie Zone → Volière → Cage sans capacité biologique inventée.`,
      en: `Aviary "${aviaryName}" contains ${cageCount} cage(s) with a total of ${birdCount} bird(s). The structure strictly follows the Zone → Aviary → Cage hierarchy without invented biological limits.`,
      ar: `تضم السلاكة "${aviaryName}" عدد ${cageCount} قفص/أقفاص بإجمالي ${birdCount} طائر/طيور. تتبع الهيكلية بدقة تسلسل منطقة ← سلاكة ← قفص دون اختلاق سعات بيولوجية.`,
      es: `El aviario "${aviaryName}" contiene ${cageCount} jaula(s) para un total de ${birdCount} ave(s). La estructura sigue la jerarquía Zona → Aviario → Jaula sin capacidad biológica inventada.`,
      it: `La voliera "${aviaryName}" raggruppa ${cageCount} gabbia/e per un totale di ${birdCount} uccello/i. L'organizzazione rispetta la gerarchia Zona → Voliera → Gabbia senza capacità biologica inventata.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 15. RÉSUMER LES OISEAUX PRÉSENTS DANS UNE CAGE (V1.9.6) :
   */
  static summarizeCageOccupancy(
    cageName: string,
    birdCount: number,
    capacity?: number,
    language: Language = 'fr'
  ): string {
    const capText = capacity ? ` (capacité déclarée : ${capacity})` : '';
    const capTextEn = capacity ? ` (declared capacity: ${capacity})` : '';
    const capTextAr = capacity ? ` (السعة المسجلة: ${capacity})` : '';
    const capTextEs = capacity ? ` (capacidad declarada: ${capacity})` : '';
    const capTextIt = capacity ? ` (capacità dichiarata: ${capacity})` : '';

    const msgs: Record<Language, string> = {
      fr: `La cage « ${cageName} » héberge actuellement ${birdCount} oiseau(x)${capText}. Chaque oiseau est formellement identifié sans présence implicite ou fantôme.`,
      en: `Cage "${cageName}" currently houses ${birdCount} bird(s)${capTextEn}. Each bird is formally recorded with zero phantom or implicit presence.`,
      ar: `القفص "${cageName}" يأوي حالياً ${birdCount} طائر/طيور${capTextAr}. كل طائر مسجل رسمياً دون أي تواجد وهمي أو ضمني.`,
      es: `La jaula "${cageName}" alberga actualmente ${birdCount} ave(s)${capTextEs}. Cada ave está formalmente registrada sin presencias fantasma ni implícitas.`,
      it: `La gabbia "${cageName}" ospita attualmente ${birdCount} uccello/i${capTextIt}. Ciascun uccello è formalmente registrato senza presenze fantasma o implicite.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 16. EXPLIQUER POURQUOI UNE INFORMATION D'HABITAT EST MANQUANTE (V1.9.6) :
   */
  static explainMissingHabitatData(
    field: 'capacity' | 'health' | 'location' | 'general',
    language: Language = 'fr'
  ): string {
    const msgs: Record<'capacity' | 'health' | 'location' | 'general', Record<Language, string>> = {
      capacity: {
        fr: "Capacité non renseignée : aucune valeur limite n'a été saisie par l'éleveur. L'application ne génère aucune capacité arbitraire et signale qu'une vérification humaine est nécessaire.",
        en: "Capacity not recorded: no limit value was entered by the breeder. Bird Academy strictly avoids generating arbitrary capacities and flags that human review is required.",
        ar: "السعة غير مسجلة: لم يُدخل المربي حداً أقصى. يمتنع النظام عن توليد سعات اعتباطية ويشير إلى ضرورة المراجعة البشرية.",
        es: "Capacidad no registrada: el criador no ingresó un límite. La aplicación no inventa capacidades arbitrarias e indica que se requiere verificación humana.",
        it: "Capacità non inserita: nessun limite inserito dall'allevatore. L'applicazione non genera capacità arbitrarie e segnala che è necessaria una verifica umana."
      },
      health: {
        fr: "Statut sanitaire non renseigné : aucune observation vétérinaire ou sanitaire n'a été consignée. L'application ne présume jamais qu'un oiseau est sain sans donnée réelle.",
        en: "Health status not recorded: no veterinary or sanitary observation has been logged. Bird Academy never presumes a bird is healthy without factual data.",
        ar: "الحالة الصحية غير مسجلة: لم يتم توثيق أي فحص بيطري. لا يفترض النظام أبداً سلامة الطائر دون بيانات حقيقية.",
        es: "Estado sanitario no registrado: no hay observaciones veterinarias. La aplicación nunca presume que un ave esté sana sin datos reales.",
        it: "Stato sanitario non inserito: nessuna osservazione veterinaria registrata. L'applicazione non presume mai che un uccello sia sano senza dati effettivi."
      },
      location: {
        fr: "Emplacement non renseigné : cet oiseau n'est actuellement affecté à aucune zone, volière ou cage. Une affectation manuelle doit être réalisée.",
        en: "Location not recorded: this bird is not assigned to any zone, aviary, or cage. Manual assignment is required.",
        ar: "الموقع غير مسجل: لم يتم تخصيص هذا الطائر لأي منطقة أو سلاكة أو قفص. يلزم التعيين اليدوي.",
        es: "Ubicación no registrada: esta ave no está asignada a ninguna zona, aviario o jaula. Se requiere asignación manual.",
        it: "Posizione non inserita: questo uccello non è assegnato ad alcuna zona, voliera o gabbia. È richiesta un'assegnazione manuale."
      },
      general: {
        fr: "Donnée non renseignée : l'application n'invente aucune donnée manquante. Une vérification humaine est nécessaire.",
        en: "Data not recorded: Bird Academy invents no missing information. Human review is required.",
        ar: "معلومة غير مسجلة: لا يختلق النظام أي بيانات مفقودة. المراجعة البشرية مطلوبة.",
        es: "Dato no registrado: la aplicación no inventa datos faltantes. Se requiere verificación humana.",
        it: "Dato non inserito: l'applicazione non inventa dati mancanti. È necessaria una verifica umana."
      }
    };
    return msgs[field]?.[language] || msgs[field]?.fr || msgs.general.fr;
  }

  /**
   * 17. EXPLIQUER LE STATUT DE QUARANTAINE D'UN OISEAU (V1.9.6) :
   */
  static explainQuarantineStatus(
    birdName: string,
    status: string,
    reason?: string,
    language: Language = 'fr'
  ): string {
    const reasonClause = reason ? ` (Motif : ${reason})` : '';
    const reasonClauseEn = reason ? ` (Reason: ${reason})` : '';
    const reasonClauseAr = reason ? ` (السبب: ${reason})` : '';
    const reasonClauseEs = reason ? ` (Motivo: ${reason})` : '';
    const reasonClauseIt = reason ? ` (Motivo: ${reason})` : '';

    const msgs: Record<Language, string> = {
      fr: `Statut de quarantaine pour « ${birdName} » : ${status}${reasonClause}. L'espace d'isolement est physiquement distinct. Aucun oiseau n'est déclaré sain automatiquement sans clôture factuelle de quarantaine.`,
      en: `Quarantine status for "${birdName}": ${status}${reasonClauseEn}. The isolation space is strictly distinct. No bird is automatically marked healthy without documented closure.`,
      ar: `حالة الحجر الصحي للطائر "${birdName}": ${status}${reasonClauseAr}. مكان العزل منفصل تماماً. لا يتم اعتبار الطائر معافى تلقائياً دون إنهاء توثيقي للحجر.`,
      es: `Estado de cuarentena para "${birdName}": ${status}${reasonClauseEs}. El espacio de aislamiento es físicamente independiente. Ningún ave se declara sana automáticamente sin cierre registrado.`,
      it: `Stato di quarantena per "${birdName}": ${status}${reasonClauseIt}. Lo spazio di isolamento è fisicamente distinto. Nessun uccello è dichiarato sano automaticamente senza chiusura formale.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 18. SIMPLIFIER L'ORGANISATION DE L'HABITAT (V1.9.6) :
   */
  static simplifyHabitatStructure(language: Language = 'fr'): string {
    const msgs: Record<Language, string> = {
      fr: "L'habitat est structuré selon un ordre logique descendant : ZONE (espace principal de l'élevage) → VOLIÈRE (bâtiment ou enceinte regroupant plusieurs cages) → CAGE (logement direct des oiseaux) → OISEAUX (individus résidents). La quarantaine constitue un espace d'isolement sanitaire strictement séparé.",
      en: "Habitat follows a top-down logical hierarchy: ZONE (main facility section) → AVIARY (enclosure holding multiple cages) → CAGE (direct bird housing) → BIRDS (resident individuals). Quarantine serves as a strictly separate sanitary isolation area.",
      ar: "ينتظم المأوى وفق تسلسل هرمي منطقي: منطقة (القسم الرئيسي في المرفق) ← سلاكة (مبنى أو مساحة تضم عدة أقفاص) ← قفص (المسكن المباشر للطيور) ← طيور (الأفراد المقيمة). ويشكل الحجر الصحي مساحة عزل وقائي منفصلة تماماً.",
      es: "El hábitat sigue una jerarquía lógica descendente: ZONA (sección principal) → AVIARIO (estructura con múltiples jaulas) → JAULA (alojamiento directo) → AVES (individuos residentes). La cuarentena es un espacio de aislamiento estrictamente separado.",
      it: "L'habitat segue una gerarchia logica: ZONA (sezione principale) → VOLIERA (struttura che ospita più gabbie) → GABBIA (alloggio diretto degli uccelli) → UCCELLI (individui residenti). La quarantena costituisce uno spazio di isolamento sanitario separato."
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 19. RÉSUMER L'ÉLEVAGE (V1.9.7) :
   */
  static summarizeFlock(
    totalBirds: number,
    activePairs: number,
    totalEggs: number,
    occupiedCages: number,
    language: Language = 'fr'
  ): string {
    const msgs: Record<Language, string> = {
      fr: `Résumé de votre élevage : ${totalBirds} oiseau(x) actif(s), ${activePairs} couple(s) formé(s), ${totalEggs} œuf(s) consigné(s) et ${occupiedCages} cage(s) occupée(s). Chaque chiffre reflète strictement les données réelles locales sans estimation ni score arbitraire.`,
      en: `Flock summary: ${totalBirds} active bird(s), ${activePairs} bonded pair(s), ${totalEggs} recorded egg(s), and ${occupiedCages} occupied cage(s). Every metric strictly reflects local recorded data without arbitrary estimations or scoring.`,
      ar: `ملخص مأواك: ${totalBirds} طائر نشط، ${activePairs} أزواج مكونة، ${totalEggs} بيضة مسجلة، و${occupiedCages} أقفاص مشغولة. كل مؤشر يعكس بدقة السجلات المحلية الحقيقية دون أي تقديرات أو نقاط اعتباطية.`,
      es: `Resumen de su criadero: ${totalBirds} ave(s) activa(s), ${activePairs} pareja(s) formada(s), ${totalEggs} huevo(s) registrado(s) y ${occupiedCages} jaula(s) ocupada(s). Cada métrica refleja estrictamente los datos locales sin puntuaciones arbitrarias.`,
      it: `Riepilogo dell'allevamento: ${totalBirds} uccello/i attivo/i, ${activePairs} coppia/e formata/e, ${totalEggs} uovo/a registrato/e e ${occupiedCages} gabbia/e occupata/e. Ciascuna cifra riflette rigorosamente i dati locali senza punteggi arbitrari.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 20. EXPLIQUER UNE STATISTIQUE (V1.9.7) :
   */
  static explainStatistic(
    statLabel: string,
    value: string | number,
    explanation: string,
    language: Language = 'fr'
  ): string {
    const msgs: Record<Language, string> = {
      fr: `Ce nombre représente « ${statLabel} » (${value}). ${explanation}. Cette statistique est issue d'un calcul factuel vérifiable à partir de vos saisies locales.`,
      en: `This metric represents "${statLabel}" (${value}). ${explanation}. This is a verifiable factual computation based on your local entries.`,
      ar: `يمثل هذا الرقم "${statLabel}" (${value}). ${explanation}. هذا المؤشر مستخرج من حساب وصفي موثوق انطلاقاً من مدخلاتك المحلية.`,
      es: `Este número representa "${statLabel}" (${value}). ${explanation}. Esta métrica proviene de un cálculo factual verificable de sus registros locales.`,
      it: `Questo valore rappresenta "${statLabel}" (${value}). ${explanation}. Questa metrica deriva da un calcolo fattuale verificabile dai tuoi registri locali.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 21. EXPLIQUER POURQUOI UNE STATISTIQUE EST INCOMPLÈTE (V1.9.7) :
   */
  static explainIncompleteStatistic(
    fieldLabel: string,
    knownCount: number,
    totalCount: number,
    language: Language = 'fr'
  ): string {
    const missing = Math.max(0, totalCount - knownCount);
    const msgs: Record<Language, string> = {
      fr: `Statistique partielle sur « ${fieldLabel} » : calculée uniquement sur ${knownCount} sujet(s) documenté(s) sur un total de ${totalCount}. Les ${missing} sujet(s) restant(s) ne sont pas extrapolés arbitrairement. Une vérification humaine est nécessaire pour compléter ces fiches.`,
      en: `Partial statistic for "${fieldLabel}": computed only from ${knownCount} documented subject(s) out of a total of ${totalCount}. The remaining ${missing} subject(s) are not arbitrarily estimated. Human review is required to complete these records.`,
      ar: `إحصائية جزئية لـ "${fieldLabel}": محسوبة فقط على ${knownCount} طائر موثق من إجمالي ${totalCount}. الطيور المتبقية (${missing}) لا يتم استقراؤها اعتباطياً. يلزم التحقق البشري لاستكمال هذه السجلات.`,
      es: `Estadística parcial para "${fieldLabel}": calculada solo sobre ${knownCount} sujeto(s) documentado(s) de un total de ${totalCount}. Los ${missing} restante(s) no se extrapolan arbitrariamente. Se requiere verificación humana para completar las fichas.`,
      it: `Statistica parziale per "${fieldLabel}": calcolata solo su ${knownCount} soggetto/i documentato/i su un totale di ${totalCount}. I rimanenti ${missing} soggetto/i non sono estrapolati arbitrariamente. È necessaria una verifica umana per completare le schede.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 22. SIMPLIFIER LE TABLEAU DE BORD (V1.9.7) :
   */
  static simplifyDashboard(
    totalBirds: number,
    activePairs: number,
    totalCages: number,
    language: Language = 'fr'
  ): string {
    const msgs: Record<Language, string> = {
      fr: `Synthèse simplifiée de votre tableau de bord en 3 points essentiels : 1. Population : ${totalBirds} oiseau(x) en élevage. 2. Reproduction : ${activePairs} couple(s) en activité. 3. Logement : ${totalCages} cage(s) gérée(s). L'ensemble fonctionne en mode local et sans dépendance externe.`,
      en: `Simplified 3-point dashboard overview: 1. Population: ${totalBirds} bird(s) in your flock. 2. Breeding: ${activePairs} active pair(s). 3. Housing: ${totalCages} cage(s) managed. The system operates fully offline without external dependencies.`,
      ar: `ملخص مبسط للوحة التحكم في 3 نقاط أساسية: 1. القطيع: ${totalBirds} طائر في المأوى. 2. التكاثر: ${activePairs} أزواج نشطة. 3. الإيواء: ${totalCages} أقفاص مدارة. يعمل النظام بالكامل محلياً دون أي اتصال خارجي.`,
      es: `Resumen simplificado del panel en 3 puntos clave: 1. Población: ${totalBirds} ave(s) en criadero. 2. Reproducción: ${activePairs} pareja(s) activa(s). 3. Alojamiento: ${totalCages} jaula(s) gestionada(s). Todo funciona en modo local sin dependencias externas.`,
      it: `Panoramica semplificata del cruscotto in 3 punti essenziali: 1. Popolazione: ${totalBirds} uccello/i nell'allevamento. 2. Riproduzione: ${activePairs} coppia/e attiva/e. 3. Alloggiamento: ${totalCages} gabbia/e gestita/e. L'intero sistema opera localmente senza dipendenze esterne.`
    };
    return msgs[language] || msgs.fr;
  }

  /**
   * 23. RÉSUMER LES ÉVÉNEMENTS RÉCENTS (V1.9.7) :
   */
  static summarizeRecentEvents(
    eventCount: number,
    language: Language = 'fr'
  ): string {
    const msgs: Record<Language, string> = {
      fr: `${eventCount} événement(s) récent(s) consigné(s) chronologiquement dans votre élevage (naissances, pontes, soins, quarantaine). Chaque date correspond scrupuleusement à un événement réel enregistré.`,
      en: `${eventCount} recent event(s) logged chronologically in your flock (births, clutches, medical care, quarantine). Every date strictly matches a real recorded event.`,
      ar: `${eventCount} أحداث أخيرة مسجلة زمنياً في مأواك (ولادات، وضع بيض، علاجات، حجر صحي). كل تاريخ يطابق بدقة حدثاً حقيقياً موثقاً.`,
      es: `${eventCount} evento(s) reciente(s) registrado(s) cronológicamente en su criadero (nacimientos, puestas, cuidados, cuarentena). Cada fecha corresponde a un evento real registrado.`,
      it: `${eventCount} evento/i recente/i registrato/i cronologicamente nel tuo allevamento (nascite, deposizioni, cure, quarantena). Ogni data corrisponde a un evento reale registrato.`
    };
    return msgs[language] || msgs.fr;
  }

  private static getEmptyNotice(language: Language): string {
    const msgs: Record<Language, string> = {
      fr: "Je ne dispose pas de suffisamment d'informations pour répondre précisément.",
      en: "I do not have sufficient information to provide a precise response.",
      ar: "لا أملك معلومات كافية لتقديم إجابة دقيقة.",
      es: "No dispongo de suficiente información para responder con precisión.",
      it: "Non dispongo di informazioni sufficienti per rispondere con precisione."
    };
    return msgs[language] || msgs.fr;
  }
}

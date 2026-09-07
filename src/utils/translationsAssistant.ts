/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — ASSISTANT TRANSLATION DICTIONARY
 * Complete multilingual support (FR, EN, AR with RTL, ES, IT) for the AI Assistant subsystem.
 */

import { Language } from './translations';

export const ASSISTANT_TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    assistant: "Assistant IA",
    assistantTitle: "Assistant IA Bird Academy",
    assistantSub: "Assistant d'élevage 100% hors-ligne & expert aviaire",
    assistantTagline: "Vos données restent strictement sur cet appareil (100% Hors-ligne)",
    
    // Status & Badges
    assistantEngineAvailable: "Moteur IA Disponible",
    assistantEngineUnavailable: "Moteur IA Indisponible",
    assistantEngineLocal: "Local (Hors-ligne)",
    assistantQuota: "Quota",
    assistantQuotaRemaining: "{remaining} / {limit} requêtes restantes aujourd'hui",
    assistantQuotaUnlimited: "Requêtes illimitées",
    assistantTier: "Niveau",
    assistantTierFree: "Plan GRATUIT",
    assistantTierPremium: "Plan PREMIUM",
    assistantTierPro: "Plan PRO",
    assistantPrivacy: "Confidentialité 100% Locale",
    assistantPrivacyDesc: "Aucune requête réseau vers des serveurs distants ou le cloud.",
    
    // Conversation Controls
    assistantNewChat: "Nouvelle conversation",
    assistantClearChat: "Effacer la discussion",
    assistantInputPlaceholder: "Posez votre question (ex: durée d'incubation du canari, analyse de mon oiseau)...",
    assistantSend: "Envoyer",
    assistantSending: "Traitement local...",
    assistantClearConfirm: "Voulez-vous effacer l'historique de cette conversation ?",
    
    // Message Metadata
    assistantSuggestionsTitle: "Suggestions contextuelles",
    assistantConfidence: "Niveau de confiance",
    assistantConfidenceHigh: "Élevée (Donnée Certifiée)",
    assistantConfidenceMedium: "Moyenne (Calculée)",
    assistantConfidenceLow: "Faible",
    assistantConfidenceUnknown: "Inconnue",
    assistantSource: "Source",
    assistantSourceRegistry: "Référentiel biologique Bird Academy",
    assistantSourceIntelligence: "Bird Intelligence Engine",
    assistantSourceUserData: "Données de l'élevage (Local)",
    assistantSourceBreeding: "Registre de reproduction",
    assistantSourceHealth: "Dossier sanitaire",
    assistantSourceCalculated: "Calcul déterministe",
    assistantSourceAi: "Moteur IA Local",
    assistantContextUsed: "Contexte utilisé",
    assistantWarning: "Avertissement",
    assistantDisclaimer: "Rappel Vétérinaire",
    
    // Engine Unavailable & Disclaimers
    assistantUnavailableNotice: "Le moteur IA local n'est pas disponible sur cet appareil.",
    assistantUnavailableExplanation: "L'application fonctionne à 100% hors-ligne. Le référentiel biologique certifié et les outils d'analyse déterministes restent pleinement opérationnels pour répondre à vos questions.",
    assistantSpeciesNotFound: "Informations biologiques non disponibles pour cette espèce.",
    
    // Upgrades & Permissions
    assistantUpgradeTitle: "Fonctionnalité réservée",
    assistantUpgradeButton: "Mettre à niveau",
    assistantUpgradePromptFree: "L'accès aux données personnelles d'élevage nécessite le plan PREMIUM ou PRO.",
    assistantUpgradePromptPremium: "L'explication Bird Intelligence, la généalogie avancée et l'assistance aux rapports sont réservées au plan PRO.",
    assistantQuotaReachedTitle: "Quota journalier atteint",
    assistantQuotaReachedDesc: "Vous avez utilisé toutes vos requêtes journalières. Passez au plan PRO pour un usage illimité.",
    
    // Empty State
    assistantEmptyStateTitle: "Comment puis-je vous aider aujourd'hui ?",
    assistantEmptyStateSubtitle: "Interrogez le référentiel biologique certifié, examinez les paramètres de reproduction ou analysez vos données d'élevage.",
    
    // Suggestions
    sug_incubation_canary: "Quelle est la durée d'incubation du canari ?",
    sug_weight_canary: "Quel est le poids normal d'un canari ?",
    sug_nest_prep: "Comment préparer un nid ?",
    sug_incubation_goldfinch: "Quelle est la durée d'incubation du chardonneret ?",
    sug_breeding_cycle: "Analyse mon dernier cycle de reproduction",
    sug_bird_status: "Quel est l'état de cet oiseau ?",
    sug_bird_intelligence: "Analyse les alertes Bird Intelligence",
    sug_genealogy: "Analyse la généalogie de cet oiseau",
    sug_monthly_summary: "Prépare une synthèse mensuelle"
  },
  en: {
    assistant: "AI Assistant",
    assistantTitle: "Bird Academy AI Assistant",
    assistantSub: "100% Offline breeding assistant & avian expert",
    assistantTagline: "Your data strictly stays on this device (100% Offline)",
    
    // Status & Badges
    assistantEngineAvailable: "AI Engine Available",
    assistantEngineUnavailable: "AI Engine Unavailable",
    assistantEngineLocal: "Local (Offline)",
    assistantQuota: "Quota",
    assistantQuotaRemaining: "{remaining} / {limit} requests remaining today",
    assistantQuotaUnlimited: "Unlimited requests",
    assistantTier: "Tier",
    assistantTierFree: "FREE Plan",
    assistantTierPremium: "PREMIUM Plan",
    assistantTierPro: "PRO Plan",
    assistantPrivacy: "100% Local Privacy",
    assistantPrivacyDesc: "No network requests to remote servers or cloud.",
    
    // Conversation Controls
    assistantNewChat: "New conversation",
    assistantClearChat: "Clear chat",
    assistantInputPlaceholder: "Ask a question (e.g. canary incubation period, my bird analysis)...",
    assistantSend: "Send",
    assistantSending: "Processing locally...",
    assistantClearConfirm: "Do you want to clear this conversation history?",
    
    // Message Metadata
    assistantSuggestionsTitle: "Contextual Suggestions",
    assistantConfidence: "Confidence level",
    assistantConfidenceHigh: "High (Certified Data)",
    assistantConfidenceMedium: "Medium (Calculated)",
    assistantConfidenceLow: "Low",
    assistantConfidenceUnknown: "Unknown",
    assistantSource: "Source",
    assistantSourceRegistry: "Bird Academy Biological Registry",
    assistantSourceIntelligence: "Bird Intelligence Engine",
    assistantSourceUserData: "Farm Data (Local)",
    assistantSourceBreeding: "Breeding Registry",
    assistantSourceHealth: "Health Records",
    assistantSourceCalculated: "Deterministic Calculation",
    assistantSourceAi: "Local AI Engine",
    assistantContextUsed: "Context used",
    assistantWarning: "Warning",
    assistantDisclaimer: "Veterinary Reminder",
    
    // Engine Unavailable & Disclaimers
    assistantUnavailableNotice: "The local AI engine is not available on this device.",
    assistantUnavailableExplanation: "The application runs 100% offline. The certified biological registry and deterministic tools remain fully operational for scientific and breeding inquiries.",
    assistantSpeciesNotFound: "Biological information not available for this species.",
    
    // Upgrades & Permissions
    assistantUpgradeTitle: "Reserved Feature",
    assistantUpgradeButton: "Upgrade Plan",
    assistantUpgradePromptFree: "Access to personal breeding data requires the PREMIUM or PRO plan.",
    assistantUpgradePromptPremium: "Bird Intelligence explanations, advanced genealogy, and report assistance are reserved for the PRO plan.",
    assistantQuotaReachedTitle: "Daily Quota Reached",
    assistantQuotaReachedDesc: "You have used all your daily queries. Upgrade to PRO for unlimited requests.",
    
    // Empty State
    assistantEmptyStateTitle: "How can I help you today?",
    assistantEmptyStateSubtitle: "Query the certified biological registry, explore breeding parameters, or analyze your farm data.",
    
    // Suggestions
    sug_incubation_canary: "What is the incubation period of the canary?",
    sug_weight_canary: "What is the normal weight of a canary?",
    sug_nest_prep: "How to prepare a nest?",
    sug_incubation_goldfinch: "What is the incubation period of the goldfinch?",
    sug_breeding_cycle: "Analyze my latest breeding cycle",
    sug_bird_status: "What is the status of this bird?",
    sug_bird_intelligence: "Analyze Bird Intelligence alerts",
    sug_genealogy: "Analyze the genealogy of this bird",
    sug_monthly_summary: "Prepare a monthly summary"
  },
  ar: {
    assistant: "المساعد الذكي",
    assistantTitle: "مساعد Bird Academy الذكي",
    assistantSub: "مساعد تربية الطيور بدون إنترنت 100% وخبير علمي",
    assistantTagline: "تبقى بياناتك حصرياً على هذا الجهاز (100% بدون إنترنت)",
    
    // Status & Badges
    assistantEngineAvailable: "محرك الذكاء الاصطناعي متاح",
    assistantEngineUnavailable: "محرك الذكاء الاصطناعي غير متوفر",
    assistantEngineLocal: "محلي (بدون إنترنت)",
    assistantQuota: "الحصة اليومية",
    assistantQuotaRemaining: "{remaining} / {limit} استفسارات متبقية اليوم",
    assistantQuotaUnlimited: "استفسارات غير محدودة",
    assistantTier: "الباقة",
    assistantTierFree: "الباقة المجانية",
    assistantTierPremium: "باقة PREMIUM",
    assistantTierPro: "باقة PRO",
    assistantPrivacy: "خصوصية محلية 100%",
    assistantPrivacyDesc: "لا توجد أي اتصالات عبر الشبكة أو خوادم سحابية.",
    
    // Conversation Controls
    assistantNewChat: "محادثة جديدة",
    assistantClearChat: "مسح المحادثة",
    assistantInputPlaceholder: "اطرح سؤالك (مثال: فترة حضانة الكناري، تحليل طائري)...",
    assistantSend: "إرسال",
    assistantSending: "معالجة محلية...",
    assistantClearConfirm: "هل ترغب في مسح سجل هذه المحادثة؟",
    
    // Message Metadata
    assistantSuggestionsTitle: "اقتراحات سياقية",
    assistantConfidence: "مستوى الثقة",
    assistantConfidenceHigh: "عالية (بيانات معتمدة)",
    assistantConfidenceMedium: "متوسطة (محسوبة)",
    assistantConfidenceLow: "منخفضة",
    assistantConfidenceUnknown: "غير محددة",
    assistantSource: "المصدر",
    assistantSourceRegistry: "المرجع البيولوجي لـ Bird Academy",
    assistantSourceIntelligence: "محرك ذكاء الطيور (Bird Intelligence)",
    assistantSourceUserData: "بيانات المزرعة (محلي)",
    assistantSourceBreeding: "سجل التزاوج",
    assistantSourceHealth: "الملف الصحي",
    assistantSourceCalculated: "حساب حتمي محلي",
    assistantSourceAi: "محرك الذكاء الاصطناعي المحلي",
    assistantContextUsed: "السياق المستخدم",
    assistantWarning: "تنبيه",
    assistantDisclaimer: "تنبيه بيطري",
    
    // Engine Unavailable & Disclaimers
    assistantUnavailableNotice: "محرك الذكاء الاصطناعي المحلي غير متوفر على هذا الجهاز.",
    assistantUnavailableExplanation: "يعمل التطبيق بنسبة 100% بدون إنترنت. يظل المرجع البيولوجي المعتمد وأدوات التحليل الحسابية تعمل بكامل طاقتها للإجابة على استفساراتك.",
    assistantSpeciesNotFound: "المعلومات البيولوجية غير متوفرة لهذا الفصيل.",
    
    // Upgrades & Permissions
    assistantUpgradeTitle: "ميزة مقيدة",
    assistantUpgradeButton: "ترقية الخطة",
    assistantUpgradePromptFree: "يتطلب الوصول إلى البيانات الشخصية لتربية الطيور باقة PREMIUM أو PRO.",
    assistantUpgradePromptPremium: "تفسيرات ذكاء الطيور، شجرة النسب المتقدمة والمساعدة في التقارير مخصصة لباقة PRO.",
    assistantQuotaReachedTitle: "تم استنفاد الحصة اليومية",
    assistantQuotaReachedDesc: "لقد استهلكت كامل استفساراتك اليومية. قم بالترقية إلى PRO لاستخدام غير محدود.",
    
    // Empty State
    assistantEmptyStateTitle: "كيف يمكنني مساعدتك اليوم؟",
    assistantEmptyStateSubtitle: "استعلم من المرجع البيولوجي المعتمد، استكشف مؤشرات التزاوج، أو حلل بيانات مزرعتك.",
    
    // Suggestions
    sug_incubation_canary: "ما هي فترة حضانة الكناري؟",
    sug_weight_canary: "ما هو الوزن الطبيعي للكناري؟",
    sug_nest_prep: "كيفية إعداد العش؟",
    sug_incubation_goldfinch: "ما هي فترة حضانة الحسون؟",
    sug_breeding_cycle: "حلل دورة التزاوج الأخيرة لدي",
    sug_bird_status: "ما هي حالة هذا الطائر؟",
    sug_bird_intelligence: "حلل تنبيهات ذكاء الطيور",
    sug_genealogy: "حلل شجرة نسب هذا الطائر",
    sug_monthly_summary: "أعد تقريراً شهرياً موجزاً"
  },
  es: {
    assistant: "Asistente IA",
    assistantTitle: "Asistente IA Bird Academy",
    assistantSub: "Asistente de cría 100% offline y experto aviar",
    assistantTagline: "Sus datos permanecen estrictamente en este dispositivo (100% Sin conexión)",
    
    // Status & Badges
    assistantEngineAvailable: "Motor IA Disponible",
    assistantEngineUnavailable: "Motor IA No Disponible",
    assistantEngineLocal: "Local (Sin conexión)",
    assistantQuota: "Cuota",
    assistantQuotaRemaining: "{remaining} / {limit} consultas restantes hoy",
    assistantQuotaUnlimited: "Consultas ilimitadas",
    assistantTier: "Nivel",
    assistantTierFree: "Plan GRATIS",
    assistantTierPremium: "Plan PREMIUM",
    assistantTierPro: "Plan PRO",
    assistantPrivacy: "Privacidad 100% Local",
    assistantPrivacyDesc: "Sin peticiones de red a servidores remotos ni a la nube.",
    
    // Conversation Controls
    assistantNewChat: "Nueva conversación",
    assistantClearChat: "Borrar chat",
    assistantInputPlaceholder: "Haga su pregunta (ej: período de incubación del canario, análisis de mi ave)...",
    assistantSend: "Enviar",
    assistantSending: "Procesando localmente...",
    assistantClearConfirm: "¿Desea borrar el historial de esta conversación?",
    
    // Message Metadata
    assistantSuggestionsTitle: "Sugerencias contextuales",
    assistantConfidence: "Nivel de confianza",
    assistantConfidenceHigh: "Alta (Dato Certificado)",
    assistantConfidenceMedium: "Media (Calculada)",
    assistantConfidenceLow: "Baja",
    assistantConfidenceUnknown: "Desconocida",
    assistantSource: "Fuente",
    assistantSourceRegistry: "Repositorio biológico Bird Academy",
    assistantSourceIntelligence: "Motor Bird Intelligence",
    assistantSourceUserData: "Datos del criadero (Local)",
    assistantSourceBreeding: "Registro de cría",
    assistantSourceHealth: "Historial sanitario",
    assistantSourceCalculated: "Cálculo determinista",
    assistantSourceAi: "Motor IA Local",
    assistantContextUsed: "Contexto utilizado",
    assistantWarning: "Advertencia",
    assistantDisclaimer: "Aviso Veterinario",
    
    // Engine Unavailable & Disclaimers
    assistantUnavailableNotice: "El motor de IA local no está disponible en este dispositivo.",
    assistantUnavailableExplanation: "La aplicación funciona 100% sin conexión. El repositorio biológico certificado y las herramientas de cálculo siguen totalmente operativas.",
    assistantSpeciesNotFound: "Información biológica no disponible para esta especie.",
    
    // Upgrades & Permissions
    assistantUpgradeTitle: "Función reservada",
    assistantUpgradeButton: "Mejorar Plan",
    assistantUpgradePromptFree: "El acceso a los datos personales de cría requiere el plan PREMIUM o PRO.",
    assistantUpgradePromptPremium: "Las explicaciones de Bird Intelligence, genealogía avanzada y asistencia de informes están reservadas para PRO.",
    assistantQuotaReachedTitle: "Cuota diaria alcanzada",
    assistantQuotaReachedDesc: "Ha agotado sus consultas diarias. Actualice a PRO para consultas ilimitadas.",
    
    // Empty State
    assistantEmptyStateTitle: "¿Cómo puedo ayudarle hoy?",
    assistantEmptyStateSubtitle: "Consulte el repositorio biológico certificado, explore parámetros de cría o analice sus datos de aves.",
    
    // Suggestions
    sug_incubation_canary: "¿Cuál es el período de incubación del canario?",
    sug_weight_canary: "¿Cuál es el peso normal de un canario?",
    sug_nest_prep: "¿Cómo preparar un nido?",
    sug_incubation_goldfinch: "¿Cuál es el período de incubación del jilguero?",
    sug_breeding_cycle: "Analiza mi último ciclo de reproducción",
    sug_bird_status: "¿Cuál es el estado de este pájaro?",
    sug_bird_intelligence: "Analiza las alertas de Bird Intelligence",
    sug_genealogy: "Analiza la genealogía de este pájaro",
    sug_monthly_summary: "Prepara una síntesis mensual"
  },
  it: {
    assistant: "Assistente IA",
    assistantTitle: "Assistente IA Bird Academy",
    assistantSub: "Assistente all'allevamento 100% offline ed esperto aviario",
    assistantTagline: "I tuoi dati rimangono rigorosamente su questo dispositivo (100% Offline)",
    
    // Status & Badges
    assistantEngineAvailable: "Motore IA Disponibile",
    assistantEngineUnavailable: "Motore IA Non Disponibile",
    assistantEngineLocal: "Locale (Offline)",
    assistantQuota: "Quota",
    assistantQuotaRemaining: "{remaining} / {limit} richieste rimanenti oggi",
    assistantQuotaUnlimited: "Richieste illimitate",
    assistantTier: "Livello",
    assistantTierFree: "Piano GRATUITO",
    assistantTierPremium: "Piano PREMIUM",
    assistantTierPro: "Piano PRO",
    assistantPrivacy: "Privacy 100% Locale",
    assistantPrivacyDesc: "Nessuna richiesta di rete a server remoti o cloud.",
    
    // Conversation Controls
    assistantNewChat: "Nuova conversazione",
    assistantClearChat: "Cancella chat",
    assistantInputPlaceholder: "Fai una domanda (es: durata dell'incubazione del canarino, analisi del mio uccello)...",
    assistantSend: "Invia",
    assistantSending: "Elaborazione locale...",
    assistantClearConfirm: "Vuoi cancellare la cronologia di questa conversazione?",
    
    // Message Metadata
    assistantSuggestionsTitle: "Suggerimenti contestuali",
    assistantConfidence: "Livello di confidenza",
    assistantConfidenceHigh: "Alta (Dato Certificato)",
    assistantConfidenceMedium: "Media (Calcolata)",
    assistantConfidenceLow: "Bassa",
    assistantConfidenceUnknown: "Sconosciuta",
    assistantSource: "Fonte",
    assistantSourceRegistry: "Registro biologico Bird Academy",
    assistantSourceIntelligence: "Motore Bird Intelligence",
    assistantSourceUserData: "Dati dell'allevamento (Locale)",
    assistantSourceBreeding: "Registro di riproduzione",
    assistantSourceHealth: "Cartella sanitaria",
    assistantSourceCalculated: "Calcolo deterministico",
    assistantSourceAi: "Motore IA Locale",
    assistantContextUsed: "Contesto utilizzato",
    assistantWarning: "Avviso",
    assistantDisclaimer: "Promemoria Veterinario",
    
    // Engine Unavailable & Disclaimers
    assistantUnavailableNotice: "Il motore IA locale non è disponibile su questo dispositivo.",
    assistantUnavailableExplanation: "L'applicazione funziona al 100% offline. Il registro biologico certificato e gli strumenti di calcolo rimangono pienamente operativi.",
    assistantSpeciesNotFound: "Informazioni biologiche non disponibili per questa specie.",
    
    // Upgrades & Permissions
    assistantUpgradeTitle: "Funzionalità riservata",
    assistantUpgradeButton: "Aggiorna Piano",
    assistantUpgradePromptFree: "L'accesso ai dati personali dell'allevamento richiede il piano PREMIUM o PRO.",
    assistantUpgradePromptPremium: "Le spiegazioni di Bird Intelligence, la genealogia avanzata e l'assistenza ai report sono riservate a PRO.",
    assistantQuotaReachedTitle: "Quota giornaliera raggiunta",
    assistantQuotaReachedDesc: "Hai utilizzato tutte le richieste giornaliere. Passa a PRO per richieste illimitate.",
    
    // Empty State
    assistantEmptyStateTitle: "Come posso aiutarti oggi?",
    assistantEmptyStateSubtitle: "Consulta il registro biologico certificato, esplora i parametri di riproduzione o analizza i dati dell'allevamento.",
    
    // Suggestions
    sug_incubation_canary: "Qual è il periodo di incubazione del canarino?",
    sug_weight_canary: "Qual è il peso normale di un canarino?",
    sug_nest_prep: "Come preparare un nido?",
    sug_incubation_goldfinch: "Qual è il periodo di incubazione del cardellino?",
    sug_breeding_cycle: "Analizza il mio ultimo ciclo di riproduzione",
    sug_bird_status: "Qual è lo stato di questo uccello?",
    sug_bird_intelligence: "Analizza gli avvisi di Bird Intelligence",
    sug_genealogy: "Analizza la genealogia di questo uccello",
    sug_monthly_summary: "Prepara una sintesi mensile"
  }
};

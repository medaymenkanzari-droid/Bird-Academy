/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../../../utils/translations';

export const QUALITY_TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    // Nav
    qaTitle: "Centre d'Assurance Qualité (Sprint 10)",
    qaDesc: "Rapport de validation, diagnostics de bugs, tests d'intégration, benchmarks de performance et préparation de la Release Candidate.",
    tabValidation: "Moteur de Validation",
    tabErrors: "Centre de Bugs",
    tabTests: "Suites de Tests",
    tabBenchmarks: "Performances & Optimisation",
    tabAccessibility: "Paramètres d'Accessibilité",
    tabMonitoring: "Supervision Technique",
    tabRelease: "Release Manager",
    tabHelp: "Centre d'Aide & Onboarding",

    // Validation Engine
    valOverallScore: "Score Global de Conformité",
    valExcellent: "Excellent - Conforme aux standards de production",
    valWarning: "Avertissement - Quelques ajustements conseillés",
    valError: "Critique - Problèmes de cohérence détectés",
    valRulesChecked: "Règles analysées",
    valErrorsFound: "Erreurs",
    valWarningsFound: "Avertissements",
    valRunCheck: "Lancer le Moteur de Validation",
    valLastCheck: "Dernière analyse :",
    valFilterAll: "Toutes les anomalies",
    valFilterErrors: "Erreurs uniquement",
    valFilterWarnings: "Avertissements uniquement",
    valEmptyIssues: "Félicitations ! Votre élevage respecte 100% des règles d'intégrité biologique.",

    // Error Center
    errDashboardTitle: "Console Globale de Diagnostic & Bugs",
    errDashboardDesc: "Capture, catégorisation et résolution en temps réel des exceptions logicielles locales.",
    errStatus: "État de stabilité du système",
    errStable: "Stable - 0 exception non gérée",
    errUnstable: "Instable - Erreurs critiques en attente",
    errClass: "Classification",
    errSeverity: "Gravité",
    errModule: "Module Source",
    errSuggestion: "Résolution conseillée",
    errMockTrigger: "Simuler une exception inattendue",
    errClear: "Vider le journal d'erreurs",
    errEmpty: "Aucune exception capturée. Les routines d'interception de crash sont au repos.",
    errStack: "Pile d'exécution (Stack Trace)",

    // Simulated Tests
    testSuiteTitle: "Rapport d'Exécution des Tests Automatisés",
    testSuiteDesc: "Suites unitaires, d'intégration, de règles biologiques, de repository et d'UI.",
    testRunAll: "Exécuter les suites de tests",
    testPassed: "Tests réussis",
    testFailed: "Échecs",
    testCoverage: "Couverture de code estimée",
    testResultPassed: "RÉUSSI",
    testResultFailed: "ÉCHEC",
    testAssertions: "Assertions vérifiées",

    // Benchmarks
    benchTitle: "Analyseur de Latence & Benchmarks",
    benchDesc: "Mesure de la réactivité des algorithmes lourds sur d'importants volumes de données.",
    benchRun: "Lancer le Banc de Test de Performance",
    benchOpening: "Temps d'ouverture de l'application",
    benchKpi: "Calcul des KPIs d'élevage",
    benchWright: "Calcul des coefficients de Wright",
    benchAnalytics: "Rendu des graphiques d'analyse",
    benchBackup: "Compression & chiffrement sauvegarde",
    benchRestore: "Simulation & import de données",
    benchSearch: "Indexation & recherche canaris",
    benchCompare: "Comparatif avec les limites acceptables (RC1)",
    benchGrade: "Note globale d'efficience locale",

    // Accessibility
    accTitle: "Configuration de l'Accessibilité (WCAG)",
    accDesc: "Paramétrage des aides technologiques, contrastes élevés et repères pour lecteurs d'écran.",
    accFocusStyle: "Indicateur de focus hautement visible",
    accAriaLabeling: "Activer les descriptions vocales étendues (ARIA)",
    accKeyboardNav: "Mode de navigation au clavier strict",
    accScreenReader: "Synthétiseur d'annonces d'état",
    accScreenReaderLabel: "Dernière annonce lue par le lecteur d'écran :",
    accTactileMin: "Agrandir les zones tactiles d'action (min 44px)",
    accHighContrast: "Activer le thème à haut contraste",
    accLogicalOrder: "Forcer l'ordre de tabulation séquentiel logique",

    // Monitoring
    monTitle: "Moniteur Développeur & Renders",
    monDesc: "Télémétrie de rendu des composants React, taux d'atteinte des caches et quotas de stockage.",
    monRenders: "Compteur de rafraîchissements React",
    monRenderTime: "Temps de rendering moyen",
    monCacheHits: "Hits sur les caches locaux (Wright/Géné)",
    monMemoHits: "Optimisation React.memo",
    monStorage: "Quota de stockage LocalStorage utilisé",
    monStorageWarn: "Attention : Proche de la limite du quota navigateur",
    monGraphNodes: "Complexité du graphe de consanguinité (nœuds)",

    // Release Manager
    relTitle: "Registre de Release & Versioning",
    relDesc: "Suivi des builds, versions de schémas de base de données locales et notes de mise à jour.",
    relRcStatus: "Statut du binaire",
    relActiveModules: "Modules de production chargés",
    relDbSchema: "Version du schéma relationnel local",
    relNotes: "Notes de mise à jour (Release Notes)",

    // Help Center & Onboarding
    helpTitle: "Centre d'Aide & FAQ Intégrée",
    helpDesc: "Documentation d'élevage, FAQ locale pour l'utilisation hors-ligne et mode découverte.",
    helpWizard: "Lancer l'assistant de bienvenue (Premier démarrage)",
    helpFaq: "Foire Aux Questions locale",
    helpContextual: "Conseils contextuels d'élevage",
    helpDiscoverMode: "Mode Découverte interactif",
    helpDismisAll: "Désactiver toutes les infobulles d'aide",
    helpRestoreAll: "Réactiver les guides visuels",
    helpPrevStep: "Précédent",
    helpNextStep: "Suivant",
    helpClose: "Fermer",
    helpCompleted: "Onboarding complété !"
  },
  en: {
    // Nav
    qaTitle: "Quality Assurance Center (Sprint 10)",
    qaDesc: "Validation reporting, bug diagnostics, integration tests, performance benchmarks, and Release Candidate preparation.",
    tabValidation: "Validation Engine",
    tabErrors: "Bug Console",
    tabTests: "Test Suites",
    tabBenchmarks: "Performance & Tuning",
    tabAccessibility: "Accessibility Settings",
    tabMonitoring: "Technical Monitoring",
    tabRelease: "Release Manager",
    tabHelp: "Help Center & Onboarding",

    // Validation Engine
    valOverallScore: "Overall Compliance Score",
    valExcellent: "Excellent - Production grade standards met",
    valWarning: "Warning - Minor adjustments recommended",
    valError: "Critical - Inconsistency issues detected",
    valRulesChecked: "Rules verified",
    valErrorsFound: "Errors",
    valWarningsFound: "Warnings",
    valRunCheck: "Run Validation Engine",
    valLastCheck: "Last check:",
    valFilterAll: "All anomalies",
    valFilterErrors: "Errors only",
    valFilterWarnings: "Warnings only",
    valEmptyIssues: "Congratulations! Your biological database is 100% compliant.",

    // Error Center
    errDashboardTitle: "Global Bug & Crash Console",
    errDashboardDesc: "Real-time capture, classification, and self-repair recommendations of local exceptions.",
    errStatus: "System stability status",
    errStable: "Stable - 0 unhandled exceptions",
    errUnstable: "Unstable - Critical exceptions waiting",
    errClass: "Classification",
    errSeverity: "Severity",
    errModule: "Source Module",
    errSuggestion: "Recommended fix",
    errMockTrigger: "Simulate unexpected crash",
    errClear: "Clear bug ledger",
    errEmpty: "No exceptions captured. Interception routines are currently sleeping.",
    errStack: "Stack Trace",

    // Simulated Tests
    testSuiteTitle: "Automated Tests Execution Report",
    testSuiteDesc: "Unit, integration, biological business rules, repository, and UI suites.",
    testRunAll: "Run automated test suites",
    testPassed: "Tests passed",
    testFailed: "Failed",
    testCoverage: "Estimated code coverage",
    testResultPassed: "PASSED",
    testResultFailed: "FAILED",
    testAssertions: "Verified assertions",

    // Benchmarks
    benchTitle: "Latency Analyzer & Benchmarks",
    benchDesc: "Measuring reactivity of resource-heavy algorithms over large volumes of local data.",
    benchRun: "Launch performance bench tests",
    benchOpening: "Application boot-up time",
    benchKpi: "Flock KPIs calculations",
    benchWright: "Wright inbreeding coefficients",
    benchAnalytics: "Analytical charts rendering",
    benchBackup: "Backup encryption & packing",
    benchRestore: "Restore pre-simulation & import",
    benchSearch: "Canary indexing & fast search",
    benchCompare: "Comparison against target limits (RC1)",
    benchGrade: "Overall Efficiency Grade",

    // Accessibility
    accTitle: "Accessibility Settings (WCAG)",
    accDesc: "Configuring screen-readers hooks, keyboard outline selectors, and logical tab sequences.",
    accFocusStyle: "Highly visible focus outline",
    accAriaLabeling: "Enable extended spoken labels (ARIA)",
    accKeyboardNav: "Strict Keyboard Navigation mode",
    accScreenReader: "Screen Reader announcer speech",
    accScreenReaderLabel: "Last spoken status announcement:",
    accTactileMin: "Enlarge tactile action elements (min 44px)",
    accHighContrast: "Enable high contrast color theme",
    accLogicalOrder: "Force logical sequence in sequential tab order",

    // Monitoring
    monTitle: "Developer Renders & Telemetry",
    monDesc: "Tracking React component updates, cache hit ratios, and storage limits.",
    monRenders: "React Component Refresh Count",
    monRenderTime: "Average Rendering Time",
    monCacheHits: "Local Cache Hit Ratio (Wright/Geno)",
    monMemoHits: "React.memo Optimization Saves",
    monStorage: "LocalStorage Storage Used",
    monStorageWarn: "Warning: Approaching browser local limit",
    monGraphNodes: "Inbreeding graph complexity (nodes)",

    // Release Manager
    relTitle: "Release Registry & Versioning",
    relDesc: "Monitoring binary builds, relational database schema states, and release notes.",
    relRcStatus: "Binary health state",
    relActiveModules: "Loaded production modules",
    relDbSchema: "Local relational schema version",
    relNotes: "Release Notes",

    // Help Center & Onboarding
    helpTitle: "Help Desk & Offline FAQ",
    helpDesc: "Offline-first guides, localized FAQ, and custom interactive onboarding modules.",
    helpWizard: "Launch Welcome Onboarding (First Boot)",
    helpFaq: "Local Frequently Asked Questions",
    helpContextual: "Contextual tips",
    helpDiscoverMode: "Interactive Discovery Mode",
    helpDismisAll: "Disable all help bubbles",
    helpRestoreAll: "Restore visual help guides",
    helpPrevStep: "Previous",
    helpNextStep: "Next",
    helpClose: "Close",
    helpCompleted: "Onboarding completed!"
  },
  ar: {
    // Nav
    qaTitle: "مركز ضمان الجودة والتحقق (Sprint 10)",
    qaDesc: "تقارير التحقق، تشخيص الأخطاء والبرمجيات، اختبارات التكامل، قياسات الأداء والسرعة، والتحضير للإصدار النهائي.",
    tabValidation: "محرك التدقيق والتحقق",
    tabErrors: "مركز إدارة الأخطاء",
    tabTests: "مجموعات الاختبارات",
    tabBenchmarks: "السرعة والأداء والتحسين",
    tabAccessibility: "خيارات إمكانية الوصول",
    tabMonitoring: "مراقبة الأداء والتحليلات",
    tabRelease: "مدير النسخة والإصدار",
    tabHelp: "مركز المساعدة والتوجيه التفاعلي",

    // Validation Engine
    valOverallScore: "مؤشر التوافق والجودة العام",
    valExcellent: "ممتاز - قاعدة البيانات متطابقة تماماً مع المعايير البرمجية",
    valWarning: "تنبيه - يُقترح مراجعة بعض البيانات",
    valError: "حرج - تم اكتشاف تعارض في البيانات",
    valRulesChecked: "القواعد التي تم فحصها",
    valErrorsFound: "أخطاء حيوية",
    valWarningsFound: "تنبيهات",
    valRunCheck: "تشغيل محرك التحقق والتدقيق",
    valLastCheck: "آخر فحص للبيانات:",
    valFilterAll: "كل الأخطاء والتعارضات",
    valFilterErrors: "الأخطاء الحيوية فقط",
    valFilterWarnings: "التنبيهات والتحذيرات فقط",
    valEmptyIssues: "تهانينا! قاعدة البيانات متوافقة ومطابقة للمعايير بنسبة 100%.",

    // Error Center
    errDashboardTitle: "لوحة تشخيص الأعطال والأخطاء البرمجية",
    errDashboardDesc: "الالتقاط التلقائي وتصنيف الأخطاء البرمجية واقتراح حلول تصحيح فورية.",
    errStatus: "حالة استقرار التطبيق والشيفرة",
    errStable: "مستقر - لا توجد أخطاء برمجية غير معالجة",
    errUnstable: "غير مستقر - أخطاء حرجة تتطلب تدخلاً",
    errClass: "تصنيف الخطأ",
    errSeverity: "مستوى الخطورة",
    errModule: "القسم البرمجي المتأثر",
    errSuggestion: "الإصلاح المقترح",
    errMockTrigger: "محاكاة خطأ برمجي مفاجئ",
    errClear: "مسح سجل الأخطاء والتحذيرات",
    errEmpty: "سجل الأخطاء نظيف تماماً. لم يتم التقاط أي أعطال.",
    errStack: "تتبع مسار الخطأ (Stack Trace)",

    // Simulated Tests
    testSuiteTitle: "تقرير اختبارات البرمجيات التلقائية",
    testSuiteDesc: "الاختبارات الأحادية، اختبارات التكامل، اختبارات قواعد العمل، وتجربة المستخدم.",
    testRunAll: "تشغيل كافة الاختبارات البرمجية",
    testPassed: "اختبارات ناجحة",
    testFailed: "اختبارات فشلت",
    testCoverage: "نسبة تغطية الشيفرة بالتحليل",
    testResultPassed: "ناجح",
    testResultFailed: "فشل",
    testAssertions: "التحققات الدقيقة المنجزة",

    // Benchmarks
    benchTitle: "محلل الاستجابة والقياسات المعيارية",
    benchDesc: "قياس سرعة استجابة الخوارزميات الحسابية الكبيرة على كميات بيانات ضخمة.",
    benchRun: "تشغيل اختبارات الأداء والسرعة",
    benchOpening: "وقت فتح وتشغيل التطبيق",
    benchKpi: "حساب مؤشرات الأداء والإنتاج",
    benchWright: "حساب معاملات Wright للقرابة والنسب",
    benchAnalytics: "توليد وعرض الرسوم البيانية للتحليل",
    benchBackup: "ضغط وتشفير النسخ الاحتياطية",
    benchRestore: "محاكاة وفك تشفير استيراد البيانات",
    benchSearch: "فهرسة وتصفية محركات البحث السريع",
    benchCompare: "مقارنة السرعة مع المعايير المستهدفة (RC1)",
    benchGrade: "مؤشر الكفاءة والسرعة العام",

    // Accessibility
    accTitle: "إعدادات إمكانية الوصول والتسهيلات (WCAG)",
    accDesc: "تهيئة خصائص التنقل اللوحي، ومؤشرات التركيز، ودعم قارئ الشاشة الصوتي.",
    accFocusStyle: "مؤشر تركيز فائق الوضوح (Focus)",
    accAriaLabeling: "تفعيل التسميات الصوتية الموسعة (ARIA)",
    accKeyboardNav: "التنقل الصارم باستخدام لوحة المفاتيح",
    accScreenReader: "جهاز النطق والتنبيهات الصوتية",
    accScreenReaderLabel: "آخر تنبيه منطوق لقارئ الشاشة:",
    accTactileMin: "تكبير مساحة الأزرار والعناصر التفاعلية (أقلها 44 بكسل)",
    accHighContrast: "تفعيل نمط تباين الألوان العالي",
    accLogicalOrder: "فرض الترتيب المنطقي المتتابع للتنقل اللوحي (Tab)",

    // Monitoring
    monTitle: "شاشة المراقبة الفنية والمطورين",
    monDesc: "مراقبة عمليات إعادة تحديث المكونات (Renders)، استهلاك الذاكرة وحفظ كاش Wright.",
    monRenders: "عدد مرات تحديث الشاشة التلقائي",
    monRenderTime: "متوسط وقت التحديث والعرض",
    monCacheHits: "معدل استخدام كاشWright والنسب",
    monMemoHits: "تحسينات الذاكرة التلقائية (React.memo)",
    monStorage: "مساحة التخزين المحلي المستخدمة",
    monStorageWarn: "تحذير: اقتراب استهلاك الحد المسموح به للمتصفح",
    monGraphNodes: "درجة تعقيد شجرة القرابة والنسب (العقد)",

    // Release Manager
    relTitle: "إدارة الإصدارات والبيانات الفنية",
    relDesc: "مراقبة البناء البرمجي الحالي، وهياكل قاعدة البيانات المحلية، والتقارير الفنية للنسخة.",
    relRcStatus: "حالة سلامة البناء",
    relActiveModules: "الوحدات البرمجية النشطة والجاهزة",
    relDbSchema: "إصدار هيكلية قاعدة البيانات المحلية",
    relNotes: "ملاحظات وتفاصيل الإصدار الحالية",

    // Help Center & Onboarding
    helpTitle: "مركز المساعدة والأسئلة الشائعة دون إنترنت",
    helpDesc: "أدلة المساعدة الحيوية لتربية الكناري، الأسئلة الشائعة لجميع الأقسام، والمساعدة التفاعلية.",
    helpWizard: "تشغيل دليل الترحيب التفاعلي (أول تشغيل)",
    helpFaq: "الأسئلة الشائعة والاستجابة الذاتية",
    helpContextual: "نصائح وإرشادات context ذكية",
    helpDiscoverMode: "نمط استكشاف التطبيق التفاعلي",
    helpDismisAll: "تعطيل كافة التنبيهات المساعدة والفقاعات",
    helpRestoreAll: "إعادة تفعيل أدلة المساعدة المرئية",
    helpPrevStep: "السابق",
    helpNextStep: "التالي",
    helpClose: "إغلاق",
    helpCompleted: "تم إكمال دليل التعلم بنجاح!"
  },
  es: {
    // Nav
    qaTitle: "Aseguramiento de Calidad (Sprint 10)",
    qaDesc: "Informe de validación, diagnóstico de errores, pruebas automatizadas, benchmarks de rendimiento y preparación de la Release Candidate.",
    tabValidation: "Motor de Validación",
    tabErrors: "Consola de Bugs",
    tabTests: "Suites de Pruebas",
    tabBenchmarks: "Rendimiento y Benchmarks",
    tabAccessibility: "Accesibilidad (WCAG)",
    tabMonitoring: "Monitoreo Técnico",
    tabRelease: "Release Manager",
    tabHelp: "Ayuda y Onboarding",

    // Validation Engine
    valOverallScore: "Puntaje de Conformidad Global",
    valExcellent: "Excelente - Cumple con los estándares de producción",
    valWarning: "Advertencia - Ajustes menores aconsejados",
    valError: "Crítico - Conflictos de coherencia biológica detectados",
    valRulesChecked: "Reglas analizadas",
    valErrorsFound: "Errores",
    valWarningsFound: "Advertencias",
    valRunCheck: "Ejecutar Motor de Validación",
    valLastCheck: "Último análisis:",
    valFilterAll: "Todas las anomalías",
    valFilterErrors: "Errores solamente",
    valFilterWarnings: "Advertencias solamente",
    valEmptyIssues: "¡Felicidades! Su base de datos cumple al 100% las reglas de coherencia.",

    // Error Center
    errDashboardTitle: "Consola de Diagnóstico de Errores y Crashes",
    errDashboardDesc: "Captura de excepciones en tiempo real, categorización automática y recomendaciones de reparación.",
    errStatus: "Estabilidad del sistema",
    errStable: "Estable - 0 excepciones activas",
    errUnstable: "Inestable - Errores críticos pendientes",
    errClass: "Clasificación",
    errSeverity: "Gravedad",
    errModule: "Módulo de Origen",
    errSuggestion: "Solución propuesta",
    errMockTrigger: "Simular crash inesperado",
    errClear: "Limpiar historial de errores",
    errEmpty: "No hay excepciones capturadas. El interceptor está listo y en espera.",
    errStack: "Seguimiento de pila (Stack Trace)",

    // Simulated Tests
    testSuiteTitle: "Informe de Ejecución de Pruebas Automatizadas",
    testSuiteDesc: "Suites de pruebas unitarias, de integración, reglas de negocio biológico y UI.",
    testRunAll: "Ejecutar todas las suites de pruebas",
    testPassed: "Pruebas superadas",
    testFailed: "Pruebas fallidas",
    testCoverage: "Cobertura de código estimada",
    testResultPassed: "APROBADO",
    testResultFailed: "FALLÓ",
    testAssertions: "Aseveraciones verificadas",

    // Benchmarks
    benchTitle: "Analizador de Latencia y Rendimiento",
    benchDesc: "Medición de velocidad en algoritmos sobre grandes volúmenes de datos locales.",
    benchRun: "Iniciar banco de pruebas de rendimiento",
    benchOpening: "Tiempo de inicio de la aplicación",
    benchKpi: "Cálculo de KPIs de cría",
    benchWright: "Cálculo de consanguinidad Wright",
    benchAnalytics: "Generación de gráficos de análisis",
    benchBackup: "Cifrado y compresión de copia de seguridad",
    benchRestore: "Restauración e importación simulada",
    benchSearch: "Indexación y búsqueda rápida de canarios",
    benchCompare: "Comparación con los límites objetivo (RC1)",
    benchGrade: "Calificación de eficiencia local",

    // Accessibility
    accTitle: "Configuración de Accesibilidad (WCAG)",
    accDesc: "Configuración de lectores de pantalla, contornos visibles y secuencias lógicas de tabulación.",
    accFocusStyle: "Contorno de foco de alta visibilidad",
    accAriaLabeling: "Habilitar etiquetas de audio extendidas (ARIA)",
    accKeyboardNav: "Modo de navegación estricta por teclado",
    accScreenReader: "Anunciador hablado de estado",
    accScreenReaderLabel: "Último mensaje hablado por lector de pantalla:",
    accTactileMin: "Agrandar tamaño de áreas táctiles de acción (mín 44px)",
    accHighContrast: "Activer tema de alto contraste",
    accLogicalOrder: "Forzar orden lógico en navegación de tabulador",

    // Monitoring
    monTitle: "Monitoreo del Desarrollador y Telemetría",
    monDesc: "Seguimiento de renders React, tasas de acierto de memoria caché y cuotas de almacenamiento.",
    monRenders: "Contador de renders en pantalla",
    monRenderTime: "Tiempo promedio de actualización",
    monCacheHits: "Tasa de acierto de caché Wright/Genes",
    monMemoHits: "Optimizaciones de React.memo aplicadas",
    monStorage: "Cuota de almacenamiento local utilizada",
    monStorageWarn: "Advertencia: Al límite del almacenamiento disponible",
    monGraphNodes: "Nodos del grafo de genealogía",

    // Release Manager
    relTitle: "Release Manager & Versiones",
    relDesc: "Control de compilación, versiones de esquema de base de datos local y notas de versión.",
    relRcStatus: "Salud del binarío",
    relActiveModules: "Módulos de producción activos",
    relDbSchema: "Versión de esquema relacional",
    relNotes: "Notas de la versión (Release Notes)",

    // Help Center & Onboarding
    helpTitle: "Centro de Ayuda y FAQ sin Conexión",
    helpDesc: "Documentación local de cría de canarios, preguntas frecuentes y modo descubrimiento interactivo.",
    helpWizard: "Iniciar asistente de bienvenida (Primer inicio)",
    helpFaq: "Preguntas Frecuentes de la base de conocimiento",
    helpContextual: "Consejos de cría contextuales",
    helpDiscoverMode: "Modo de Descubrimiento interactivo",
    helpDismisAll: "Desactivar infobulles de ayuda",
    helpRestoreAll: "Reestablecer ayudas visuales",
    helpPrevStep: "Anterior",
    helpNextStep: "Siguiente",
    helpClose: "Cerrar",
    helpCompleted: "¡Onboarding completado con éxito!"
  },
  it: {
    // Nav
    qaTitle: "Centro di Assicurazione Qualità (Sprint 10)",
    qaDesc: "Rapporto di validazione, diagnostica bug, test di integrazione automatizzati, benchmark prestazionali e preparazione della Release Candidate.",
    tabValidation: "Motore di Validazione",
    tabErrors: "Console dei Bug",
    tabTests: "Suite di Test",
    tabBenchmarks: "Prestazioni & Benchmark",
    tabAccessibility: "Parametri di Accessibilità",
    tabMonitoring: "Monitoraggio Tecnico",
    tabRelease: "Release Manager",
    tabHelp: "Centro Assistenza & Onboarding",

    // Validation Engine
    valOverallScore: "Punteggio di Conformità Globale",
    valExcellent: "Eccellente - Conforme agli standard di produzione",
    valWarning: "Avviso - Consigliati piccoli aggiustamenti",
    valError: "Critico - Rilevati problemi di coerenza",
    valRulesChecked: "Regole verificate",
    valErrorsFound: "Errori",
    valWarningsFound: "Avvertimenti",
    valRunCheck: "Avvia il Motore di Validazione",
    valLastCheck: "Ultima analisi:",
    valFilterAll: "Tutte le anomalie",
    valFilterErrors: "Solo errori",
    valFilterWarnings: "Solo avvertimenti",
    valEmptyIssues: "Congratulazioni! Il database dell'allevamento è conforme al 100%.",

    // Error Center
    errDashboardTitle: "Console Globale di Diagnostica Errori & Crash",
    errDashboardDesc: "Cattura, categorizzazione e raccomandazioni di risoluzione in tempo reale per eccezioni locali.",
    errStatus: "Stabilità del sistema",
    errStable: "Stabile - 0 eccezioni non gestite",
    errUnstable: "Instabile - Rilevati crash critici pendenti",
    errClass: "Classificazione",
    errSeverity: "Gravità",
    errModule: "Modulo di Origine",
    errSuggestion: "Soluzione consigliata",
    errMockTrigger: "Simula un crash inatteso",
    errClear: "Svuota registro errori",
    errEmpty: "Nessun errore catturato. I motori di intercettazione crash sono inattivi.",
    errStack: "Segnale della pila (Stack Trace)",

    // Simulated Tests
    testSuiteTitle: "Rapporto sull'Esecuzione di Test Automatizzati",
    testSuiteDesc: "Suite di test unitari, di integrazione, regole biologiche e d'interfaccia utente.",
    testRunAll: "Esegui tutte le suite di test",
    testPassed: "Test superati",
    testFailed: "Test falliti",
    testCoverage: "Copertura del codice stimata",
    testResultPassed: "SUPERATO",
    testResultFailed: "FALLITO",
    testAssertions: "Asserzioni verificate",

    // Benchmarks
    benchTitle: "Analizzatore di Latenza e Benchmarks",
    benchDesc: "Misura della velocità di calcolo degli algoritmi pesanti su grandi volumi di dati.",
    benchRun: "Avvia prove di prestazioni del sistema",
    benchOpening: "Tempo di caricamento dell'app",
    benchKpi: "Calcolo dei KPI di allevamento",
    benchWright: "Calcolo dei coefficienti Wright",
    benchAnalytics: "Rendering dei grafici analitici",
    benchBackup: "Compressione e cifratura dei salvataggi",
    benchRestore: "Simulazione e importazione dati",
    benchSearch: "Indicizzazione e ricerca rapida canarini",
    benchCompare: "Confronto con i limiti target (RC1)",
    benchGrade: "Valutazione dell'efficienza locale",

    // Accessibility
    accTitle: "Impostazioni di Accessibilità (WCAG)",
    accDesc: "Configurazione dei lettori di schermo, bordi di messa a fuoco visibili e navigazione a schede.",
    accFocusStyle: "Contorno di focus ad alta visibilità",
    accAriaLabeling: "Abilita etichette audio estese (ARIA)",
    accKeyboardNav: "Navigazione rigorosa tramite tastiera",
    accScreenReader: "Annunciatore parlato dello stato",
    accScreenReaderLabel: "Ultimo annuncio vocale inviato al lettore di schermo:",
    accTactileMin: "Ingrandisci le aree di tocco d'azione (min 44px)",
    accHighContrast: "Attiva il tema ad alto contrasto",
    accLogicalOrder: "Forza l'ordine sequenziale logico nel tasto Tab",

    // Monitoring
    monTitle: "Monitoraggio dello Sviluppatore e Telemetria",
    monDesc: "Monitoraggio dei rendering dei componenti React, tassi di successo della cache e quote di memorizzazione.",
    monRenders: "Conteggio aggiornamenti dello schermo",
    monRenderTime: "Tempo medio di aggiornamento",
    monCacheHits: "Tasso di successo cache Wright/Geni",
    monMemoHits: "Ottimizzazioni React.memo applicate",
    monStorage: "Quota LocalStorage utilizzata",
    monStorageWarn: "Avviso: Spazio di memorizzazione vicino al limite",
    monGraphNodes: "Nodi nel grafo genealogico",

    // Release Manager
    relTitle: "Release Manager & Versionamento",
    relDesc: "Monitoraggio build, versioni dello schema del database locale e note di rilascio.",
    relRcStatus: "Salute del binarío",
    relActiveModules: "Moduli di produzione caricati",
    relDbSchema: "Versione del database locale relazionale",
    relNotes: "Note di rilascio (Release Notes)",

    // Help Center & Onboarding
    helpTitle: "Centro Assistenza & FAQ Offline",
    helpDesc: "Documentazione per l'allevamento, FAQ locali per uso offline e guida all'onboarding.",
    helpWizard: "Avvia l'assistente di benvenuto (Primo avvio)",
    helpFaq: "Domande Frequenti dal database della conoscenza",
    helpContextual: "Suggerimenti d'allevamento contestuali",
    helpDiscoverMode: "Modalità di Scoperta interattiva",
    helpDismisAll: "Disattiva tutti i fumetti di aiuto",
    helpRestoreAll: "Riabilita le guide visive d'aiuto",
    helpPrevStep: "Precedente",
    helpNextStep: "Successivo",
    helpClose: "Chiudi",
    helpCompleted: "Onboarding completato con successo!"
  }
};

export const getQualityTranslation = (lang: Language, key: string, variables?: Record<string, string | number>): string => {
  const dict = QUALITY_TRANSLATIONS[lang] || QUALITY_TRANSLATIONS['fr'];
  let text = dict[key] || QUALITY_TRANSLATIONS['fr'][key] || String(key);

  if (variables) {
    Object.entries(variables).forEach(([k, val]) => {
      text = text.split(`{${k}}`).join(String(val));
    });
  }

  return text;
};

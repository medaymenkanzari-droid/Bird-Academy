/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — V2.0.0-RC1
 * Script de génération du Formulaire Officiel de Rapport de Testeur V2.0.0-RC1 (PDF A4)
 * Support complet multilingue : FR, EN, ES, IT, AR (avec RTL)
 * Fichier : scripts/generateTestReportPdf.cjs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'public', 'downloads');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Translations dictionary for the 5 supported languages
const LOCALES = {
  fr: {
    lang: 'fr',
    dir: 'ltr',
    brand: 'BIRD ACADEMY',
    tagline: 'ÉLEVAGE & GESTION AVICOLE',
    title: 'RAPPORT DE TEST — À REMPLIR PAR LE TESTEUR',
    subtitle: 'Bird Academy — V2.0.0-RC1 (BUILD_ID: BA-V2.0.0-RC1)',
    intro: 'Ce document est un formulaire d\'évaluation terrain destiné au testeur pour noter ses observations après utilisation de l\'application Bird Academy. Suivez votre parcours de test, notez vos constats, signalez les éventuels problèmes rencontrés et partagez votre avis d\'éleveur pour nous aider à améliorer l\'expérience.',
    secA_title: 'SECTION A — INFORMATIONS DU TESTEUR',
    name_label: 'Nom / pseudonyme :',
    date_label: 'Date du test :',
    country_label: 'Pays / ville (facultatif) :',
    device_label: 'Type d\'appareil (PC, tablette, marque/modèle de smartphone) :',
    system_label: 'Système utilisé :',
    sys_win: 'Windows 10 / 11',
    sys_android: 'Android (Smartphone / Tablette)',
    version_label: 'Version de l\'application :',
    version_val: 'V2.0.0-RC1 (BA-V2.0.0-RC1)',
    duration_label: 'Temps approximatif de test :',
    secB_title: 'SECTION B — INSTALLATION ET PREMIÈRE UTILISATION',
    chk_install: 'Installation réussie',
    chk_start: 'Application démarrée correctement',
    chk_first_use: 'Première utilisation comprise facilement',
    chk_nav: 'Navigation comprise facilement',
    first_impression: 'Première impression générale :',
    secC_title: 'SECTION C — TESTS FONCTIONNELS',
    secC_desc: 'Cochez les tests effectués et notez le résultat constaté pour chaque fonctionnalité présente dans l\'application.',
    col_feature: 'Fonctionnalité',
    col_tested: 'Test effectué',
    col_result: 'Résultat observé',
    col_notes: 'Problème / observation',
    opt_yes: 'Oui',
    opt_no: 'Non',
    res_works: 'Fonctionne',
    res_works_issue: 'Fonctionne avec problème',
    res_fails: 'Ne fonctionne pas',
    res_untested: 'Non testé',
    features: [
      { name: 'Gestion des oiseaux', desc: 'Ajout d\'un oiseau, saisie de la bague, statut, inventaire' },
      { name: 'Fiche oiseau', desc: 'Passeport biologique, généalogie, ascendance, détails' },
      { name: 'Recherche & Filtres', desc: 'Recherche par numéro de bague, espèce, statut, sexe' },
      { name: 'Reproduction', desc: 'Gestion du cycle de ponte, planification, historique' },
      { name: 'Couples', desc: 'Formation de couples, vérification de compatibilité' },
      { name: 'Œufs & Incubation', desc: 'Suivi des pontes, mirage, éclosions et nids' },
      { name: 'Élevage manuel / EAM', desc: 'Plans de nourrissage, pesées, baguage des oisillons' },
      { name: 'Habitat & Cages', desc: 'Attribution des cages/volières, transferts, occupation' },
      { name: 'Santé & Soins', desc: 'Enregistrement de soins, traitements, observations sanitaires' },
      { name: 'Scanner & Codes QR', desc: 'Scan et génération de QR codes d\'identification' },
      { name: 'Intelligence & Analyses', desc: 'Statistiques d\'élevage, assistant local zootechnique' },
      { name: 'Sauvegarde locale & Téléchargements', desc: 'Sauvegarde hors-ligne, restauration, export de données' },
    ],
    secD_title: 'SECTION D — SIGNALER UN PROBLÈME',
    secD_desc: 'J\'AI RENCONTRÉ UN PROBLÈME — Décrivez chaque anomalie avec les étapes précises pour la reproduire.',
    prob_num: 'N° du problème :',
    prob_feat: 'Fonctionnalité concernée :',
    prob_what: 'Que s\'est-il passé ?',
    prob_steps: 'Étapes pour reproduire le problème :',
    prob_expected: 'Résultat attendu :',
    prob_obtained: 'Résultat obtenu :',
    prob_severity: 'Gravité ressentie :',
    sev_blocker: 'Bloquant',
    sev_major: 'Important',
    sev_annoying: 'Gênant',
    sev_minor: 'Mineur',
    screenshot_label: 'Capture d\'écran disponible :',
    secE_title: 'SECTION E — EXPÉRIENCE UTILISATEUR',
    secE_desc: 'Évaluez la facilité d\'utilisation des différents aspects de l\'application.',
    lvl_very_easy: 'Très facile',
    lvl_easy: 'Facile',
    lvl_medium: 'Moyen',
    lvl_hard: 'Difficile',
    lvl_very_hard: 'Très difficile',
    ux_items: [
      'Comprendre l\'application',
      'Ajouter un oiseau',
      'Retrouver un oiseau',
      'Naviguer dans l\'application',
      'Comprendre les informations affichées',
      'Utiliser les fonctions de reproduction',
      'Comprendre les résultats / analyses',
      'Utiliser les fonctions QR',
      'Trouver les actions importantes',
    ],
    liked_label: 'Ce que j\'ai particulièrement apprécié :',
    confusing_label: 'Ce qui m\'a semblé difficile ou confus :',
    secF_title: 'SECTION F — SUGGESTIONS DU TESTEUR',
    prio_improve: 'Quelle fonctionnalité faudrait-il améliorer en priorité ?',
    feature_add: 'Quelle fonctionnalité aimeriez-vous voir ajoutée ?',
    other_sugg: 'Autres suggestions :',
    secG_title: 'SECTION G — ÉVALUATION GÉNÉRALE',
    rate_ease: 'Facilité d\'utilisation :',
    rate_utility: 'Utilité pour un éleveur :',
    rate_clarity: 'Clarté :',
    rate_overall: 'Satisfaction générale :',
    recommend_q: 'Après ce test, recommanderiez-vous Bird Academy à un autre éleveur ?',
    rec_yes: 'Oui',
    rec_maybe: 'Peut-être',
    rec_no: 'Non',
    why_label: 'Pourquoi ?',
    secH_title: 'SECTION H — COMMENTAIRES DU TESTEUR',
    secH_desc: 'Espace réservé à vos remarques libres, notes zootechniques ou commentaires complémentaires.',
    thanks: 'Merci pour votre contribution essentielle au programme de test Bird Academy !',
    footer_text: 'Bird Academy — V2.0.0-RC1 (BA-V2.0.0-RC1) • Rapport de testeur',
    page_label: 'Page',
  },
  en: {
    lang: 'en',
    dir: 'ltr',
    brand: 'BIRD ACADEMY',
    tagline: 'AVIAN BREEDING & ERP MANAGEMENT',
    title: 'TESTER REPORT — TO BE COMPLETED BY TESTER',
    subtitle: 'Bird Academy — V2.0.0-RC1 (BUILD_ID: BA-V2.0.0-RC1)',
    intro: 'This document is a field evaluation form designed for testers to record observations while using Bird Academy. Follow your testing journey, note down your findings, report any issues encountered, and share your breeder feedback to help us refine the application.',
    secA_title: 'SECTION A — TESTER INFORMATION',
    name_label: 'Name / username:',
    date_label: 'Test date:',
    country_label: 'Country / city (optional):',
    device_label: 'Device type (PC, tablet, smartphone brand/model):',
    system_label: 'Operating system used:',
    sys_win: 'Windows 10 / 11',
    sys_android: 'Android (Smartphone / Tablet)',
    version_label: 'Application version:',
    version_val: 'V2.0.0-RC1 (BA-V2.0.0-RC1)',
    duration_label: 'Approximate testing time:',
    secB_title: 'SECTION B — INSTALLATION AND FIRST LAUNCH',
    chk_install: 'Installation succeeded',
    chk_start: 'Application started properly',
    chk_first_use: 'First use easily understood',
    chk_nav: 'Navigation easily understood',
    first_impression: 'First overall impression:',
    secC_title: 'SECTION C — FUNCTIONAL TESTING',
    secC_desc: 'Check tested features and record your observed outcome for each actual feature in the application.',
    col_feature: 'Feature',
    col_tested: 'Tested?',
    col_result: 'Observed outcome',
    col_notes: 'Issue / observation',
    opt_yes: 'Yes',
    opt_no: 'No',
    res_works: 'Works fine',
    res_works_issue: 'Works with issue',
    res_fails: 'Does not work',
    res_untested: 'Not tested',
    features: [
      { name: 'Bird management', desc: 'Add bird, ring number entry, status, inventory' },
      { name: 'Bird card / passport', desc: 'Biological passport, pedigree, ancestry, details' },
      { name: 'Search & filters', desc: 'Search by ring number, species, status, sex' },
      { name: 'Breeding cycle', desc: 'Breeding season tracking, clutch history' },
      { name: 'Pairs', desc: 'Pair formation, compatibility check, history' },
      { name: 'Eggs & incubation', desc: 'Laying dates, candling, hatching, nest logs' },
      { name: 'Hand-feeding / EAM', desc: 'Feeding schedules, weight tracking, chick banding' },
      { name: 'Housing & cages', desc: 'Cage/aviary allocation, transfers, occupancy' },
      { name: 'Health & care', desc: 'Care records, medication, veterinary observations' },
      { name: 'Scanner & QR codes', desc: 'QR code scanning & rapid bird identification' },
      { name: 'Intelligence & analytics', desc: 'Breeding statistics, local zootechnical assistant' },
      { name: 'Local backup & downloads', desc: '100% offline backup, restore, data export' },
    ],
    secD_title: 'SECTION D — REPORT AN ISSUE',
    secD_desc: 'I ENCOUNTERED AN ISSUE — Describe each issue with precise reproduction steps.',
    prob_num: 'Issue #:',
    prob_feat: 'Concerned feature:',
    prob_what: 'What happened?',
    prob_steps: 'Steps to reproduce the issue:',
    prob_expected: 'Expected outcome:',
    prob_obtained: 'Actual outcome:',
    prob_severity: 'Perceived severity:',
    sev_blocker: 'Blocker',
    sev_major: 'Major',
    sev_annoying: 'Annoying',
    sev_minor: 'Minor',
    screenshot_label: 'Screenshot available:',
    secE_title: 'SECTION E — USER EXPERIENCE',
    secE_desc: 'Rate the ease of use across key aspects of the application.',
    lvl_very_easy: 'Very easy',
    lvl_easy: 'Easy',
    lvl_medium: 'Moderate',
    lvl_hard: 'Difficult',
    lvl_very_hard: 'Very difficult',
    ux_items: [
      'Understanding the application',
      'Adding a bird',
      'Finding a bird',
      'Navigating the application',
      'Understanding displayed information',
      'Using breeding features',
      'Understanding results / analytics',
      'Using QR functions',
      'Finding important actions',
    ],
    liked_label: 'What I particularly appreciated:',
    confusing_label: 'What felt difficult or confusing:',
    secF_title: 'SECTION F — TESTER SUGGESTIONS',
    prio_improve: 'Which feature should be improved as a priority?',
    feature_add: 'Which feature would you like to see added?',
    other_sugg: 'Other suggestions:',
    secG_title: 'SECTION G — GENERAL EVALUATION',
    rate_ease: 'Ease of use:',
    rate_utility: 'Utility for a bird breeder:',
    rate_clarity: 'Clarity:',
    rate_overall: 'Overall satisfaction:',
    recommend_q: 'After this test, would you recommend Bird Academy to another breeder?',
    rec_yes: 'Yes',
    rec_maybe: 'Maybe',
    rec_no: 'No',
    why_label: 'Why?',
    secH_title: 'SECTION H — TESTER COMMENTS',
    secH_desc: 'Free space for personal remarks, zootechnical observations, or additional notes.',
    thanks: 'Thank you for your valuable contribution to the Bird Academy testing program!',
    footer_text: 'Bird Academy — V2.0.0-RC1 (BA-V2.0.0-RC1) • Tester Report',
    page_label: 'Page',
  },
  es: {
    lang: 'es',
    dir: 'ltr',
    brand: 'BIRD ACADEMY',
    tagline: 'GESTIÓN AVÍCOLA Y CRÍA PROFESIONAL',
    title: 'INFORME DE TEST — A RELLENAR POR EL TESTER',
    subtitle: 'Bird Academy — V2.0.0-RC1 (BUILD_ID: BA-V2.0.0-RC1)',
    intro: 'Este documento es un formulario de evaluación de campo destinado al probador para registrar sus observaciones tras utilizar la aplicación Bird Academy. Siga su sesión de prueba, anote sus hallazgos, señale cualquier problema detectado y comparta su opinión de criador.',
    secA_title: 'SECCIÓN A — INFORMACIÓN DEL PROBADOR',
    name_label: 'Nombre / seudónimo:',
    date_label: 'Fecha de la prueba:',
    country_label: 'País / ciudad (opcional):',
    device_label: 'Tipo de dispositivo (PC, tableta, marca/modelo de smartphone):',
    system_label: 'Sistema operativo utilizado:',
    sys_win: 'Windows 10 / 11',
    sys_android: 'Android (Smartphone / Tableta)',
    version_label: 'Versión de la aplicación:',
    version_val: 'V2.0.0-RC1 (BA-V2.0.0-RC1)',
    duration_label: 'Tiempo aproximado de prueba:',
    secB_title: 'SECCIÓN B — INSTALACIÓN Y PRIMER USO',
    chk_install: 'Instalación completada con éxito',
    chk_start: 'Aplicación iniciada correctamente',
    chk_first_use: 'Primer uso comprendido con facilidad',
    chk_nav: 'Navegación comprendida con facilidad',
    first_impression: 'Primera impresión general:',
    secC_title: 'SECCIÓN C — PRUEBAS FUNCIONALES',
    secC_desc: 'Marque las pruebas realizadas y anote el resultado observado para cada funcionalidad real.',
    col_feature: 'Funcionalidad',
    col_tested: 'Probado',
    col_result: 'Resultado observado',
    col_notes: 'Problema / observación',
    opt_yes: 'Sí',
    opt_no: 'No',
    res_works: 'Funciona',
    res_works_issue: 'Funciona con problema',
    res_fails: 'No funciona',
    res_untested: 'No probado',
    features: [
      { name: 'Gestión de aves', desc: 'Añadir ave, número de anilla, estado, inventario' },
      { name: 'Ficha del ave', desc: 'Pasaporte biológico, genealogía, ascendencia, detalles' },
      { name: 'Búsqueda y filtros', desc: 'Búsqueda por anilla, especie, estado, sexo' },
      { name: 'Reproducción', desc: 'Ciclo de puesta, temporadas, seguimiento' },
      { name: 'Parejas', desc: 'Creación de parejas, compatibilidad, historial' },
      { name: 'Huevos e incubación', desc: 'Puestas, ovoscopía, eclosiones y nidos' },
      { name: 'Cría manual / EAM', desc: 'Planes de alimentación, control de peso, anillamiento' },
      { name: 'Hábitat y jaulas', desc: 'Asignación de jaulas/voladeras, traslados, ocupación' },
      { name: 'Salud y cuidados', desc: 'Registro de tratamientos, vacunas, observaciones' },
      { name: 'Escáner y códigos QR', desc: 'Identificación rápida mediante códigos QR' },
      { name: 'Inteligencia y análisis', desc: 'Estadísticas del criadero, asistente zootécnico' },
      { name: 'Copia de seguridad local y descargas', desc: 'Copia 100% fuera de línea, restauración, exportación' },
    ],
    secD_title: 'SECCIÓN D — REPORTAR UN PROBLEMA',
    secD_desc: 'HE ENCONTRADO UN PROBLEMA — Describa cada anomalía con pasos precisos de reproducción.',
    prob_num: 'N.º de problema:',
    prob_feat: 'Funcionalidad afectada:',
    prob_what: '¿Qué ha sucedido?',
    prob_steps: 'Pasos para reproducir el problema:',
    prob_expected: 'Resultado esperado:',
    prob_obtained: 'Resultado obtenido:',
    prob_severity: 'Gravedad percibida:',
    sev_blocker: 'Bloqueante',
    sev_major: 'Importante',
    sev_annoying: 'Molesto',
    sev_minor: 'Menor',
    screenshot_label: 'Captura de pantalla disponible:',
    secE_title: 'SECCIÓN E — EXPERIENCIA DE USUARIO',
    secE_desc: 'Valore la facilidad de uso de los diferentes aspectos de la aplicación.',
    lvl_very_easy: 'Muy fácil',
    lvl_easy: 'Fácil',
    lvl_medium: 'Medio',
    lvl_hard: 'Difícil',
    lvl_very_hard: 'Muy difícil',
    ux_items: [
      'Comprender la aplicación',
      'Añadir un ave',
      'Localizar un ave',
      'Navegar por la aplicación',
      'Comprender la información mostrada',
      'Utilizar las funciones de reproducción',
      'Comprender los resultados / análisis',
      'Utilizar las funciones QR',
      'Encontrar las acciones importantes',
    ],
    liked_label: 'Lo que más me ha gustado:',
    confusing_label: 'Lo que me ha parecido difícil o confuso:',
    secF_title: 'SECCIÓN F — SUGERENCIAS DEL PROBADOR',
    prio_improve: '¿Qué funcionalidad debería mejorarse con prioridad?',
    feature_add: '¿Qué funcionalidad le gustaría que se añadiera?',
    other_sugg: 'Otras sugerencias:',
    secG_title: 'SECCIÓN G — EVALUACIÓN GENERAL',
    rate_ease: 'Facilidad de uso:',
    rate_utility: 'Utilidad para un criador:',
    rate_clarity: 'Claridad:',
    rate_overall: 'Satisfacción general:',
    recommend_q: 'Tras esta prueba, ¿recomendaría Bird Academy a otro criador?',
    rec_yes: 'Sí',
    rec_maybe: 'Quizás',
    rec_no: 'No',
    why_label: '¿Por qué?',
    secH_title: 'SECCIÓN H — COMENTARIOS DEL PROBADOR',
    secH_desc: 'Espacio libre para comentarios personales, observaciones zootécnicas o notas adicionales.',
    thanks: '¡Gracias por su valiosa colaboración en el programa de pruebas de Bird Academy!',
    footer_text: 'Bird Academy — V2.0.0-RC1 (BA-V2.0.0-RC1) • Informe de probador',
    page_label: 'Página',
  },
  it: {
    lang: 'it',
    dir: 'ltr',
    brand: 'BIRD ACADEMY',
    tagline: 'ALLEVAMENTO & GESTIONE AVICOLA',
    title: 'RAPPORTO DI TEST — DA COMPILARE A CURA DEL TESTER',
    subtitle: 'Bird Academy — V2.0.0-RC1 (BUILD_ID: BA-V2.0.0-RC1)',
    intro: 'Questo documento è un modulo di valutazione sul campo destinato al tester per annotare le proprie osservazioni durante l\'utilizzo di Bird Academy. Segui la sessione di test, registra i tuoi riscontri, segnala eventuali problemi e condividi la tua opinione di allevatore.',
    secA_title: 'SEZIONE A — INFORMAZIONI SUL TESTER',
    name_label: 'Nome / pseudonimo:',
    date_label: 'Data del test:',
    country_label: 'Paese / città (facoltativo):',
    device_label: 'Tipo di dispositivo (PC, tablet, marca/modello smartphone):',
    system_label: 'Sistema operativo utilizzato:',
    sys_win: 'Windows 10 / 11',
    sys_android: 'Android (Smartphone / Tablet)',
    version_label: 'Versione dell\'applicazione:',
    version_val: 'V2.0.0-RC1 (BA-V2.0.0-RC1)',
    duration_label: 'Tempo approssimativo di test:',
    secB_title: 'SEZIONE B — INSTALLAZIONE E PRIMO UTILIZZO',
    chk_install: 'Installazione riuscita',
    chk_start: 'Applicazione avviata correttamente',
    chk_first_use: 'Primo utilizzo compreso facilmente',
    chk_nav: 'Navigazione compresa facilmente',
    first_impression: 'Prima impressione generale:',
    secC_title: 'SEZIONE C — TEST FUNZIONALI',
    secC_desc: 'Seleziona i test eseguiti e annota il risultato osservato per ciascuna funzionalità reale.',
    col_feature: 'Funzionalità',
    col_tested: 'Test eseguito',
    col_result: 'Risultato osservato',
    col_notes: 'Problema / osservazione',
    opt_yes: 'Sì',
    opt_no: 'No',
    res_works: 'Funziona',
    res_works_issue: 'Funziona con problema',
    res_fails: 'Non funziona',
    res_untested: 'Non testato',
    features: [
      { name: 'Gestione volatili', desc: 'Aggiunta volatile, numero anello, stato, inventario' },
      { name: 'Scheda volatile', desc: 'Passaporto biologico, genealogia, ascendenza, dettagli' },
      { name: 'Ricerca e filtri', desc: 'Ricerca per anello, specie, stato, sesso' },
      { name: 'Riproduzione', desc: 'Ciclo di deposizione, pianificazione, storico' },
      { name: 'Coppie', desc: 'Formazione coppie, verifica compatibilità' },
      { name: 'Uova e incubazione', desc: 'Deposizione, speratura, schiusa e nidi' },
      { name: 'Allevamento a mano / EAM', desc: 'Piani di alimentazione, controllo peso, inanellamento' },
      { name: 'Habitat e gabbie', desc: 'Assegnazione gabbie/voliere, trasferimenti, capienza' },
      { name: 'Salute e cure', desc: 'Registrazione cure, trattamenti, osservazioni sanitarie' },
      { name: 'Scanner e codici QR', desc: 'Identificazione rapida tramite codici QR' },
      { name: 'Intelligenza e analisi', desc: 'Statistiche allevamento, assistente zootecnico' },
      { name: 'Backup locale e download', desc: 'Backup 100% offline, ripristino, esportazione dati' },
    ],
    secD_title: 'SEZIONE D — SEGNALARE UN PROBLEMA',
    secD_desc: 'HO RISCONTRATO UN PROBLEMA — Descrivi ogni anomalia con i passaggi precisi di riproduzione.',
    prob_num: 'N. problema:',
    prob_feat: 'Funzionalità interessata:',
    prob_what: 'Cosa è successo?',
    prob_steps: 'Passaggi per riprodurre il problema:',
    prob_expected: 'Risultato atteso:',
    prob_obtained: 'Risultato ottenuto:',
    prob_severity: 'Gravità percepita:',
    sev_blocker: 'Bloccante',
    sev_major: 'Importante',
    sev_annoying: 'Fastidioso',
    sev_minor: 'Minore',
    screenshot_label: 'Screenshot disponibile:',
    secE_title: 'SEZIONE E — ESPERIENZA UTENTE',
    secE_desc: 'Valuta la facilità d\'uso dei diversi aspetti dell\'applicazione.',
    lvl_very_easy: 'Molto facile',
    lvl_easy: 'Facile',
    lvl_medium: 'Medio',
    lvl_hard: 'Difficile',
    lvl_very_hard: 'Molto difficile',
    ux_items: [
      'Comprendere l\'applicazione',
      'Aggiungere un volatile',
      'Trovare un volatile',
      'Navigare nell\'applicazione',
      'Comprendere le informazioni mostrate',
      'Utilizzare le funzioni di riproduzione',
      'Comprendere i risultati / analisi',
      'Utilizzare le funzioni QR',
      'Trovare le azioni importanti',
    ],
    liked_label: 'Cosa ho apprezzato particolarmente:',
    confusing_label: 'Cosa è sembrato difficile o confuso:',
    secF_title: 'SEZIONE F — SUGGERIMENTI DEL TESTER',
    prio_improve: 'Quale funzionalità andrebbe migliorata prioritariamente?',
    feature_add: 'Quale funzionalità vorresti vedere aggiunta?',
    other_sugg: 'Altri suggerimenti:',
    secG_title: 'SEZIONE G — VALUTAZIONE GENERALE',
    rate_ease: 'Facilità d\'uso:',
    rate_utility: 'Utilità per un allevatore:',
    rate_clarity: 'Chiarezza:',
    rate_overall: 'Soddisfazione generale:',
    recommend_q: 'Dopo questo test, raccomanderesti Bird Academy a un altro allevatore?',
    rec_yes: 'Sì',
    rec_maybe: 'Forse',
    rec_no: 'No',
    why_label: 'Perché?',
    secH_title: 'SEZIONE H — COMMENTI DEL TESTER',
    secH_desc: 'Spazio libero per osservazioni personali, note zootecniche o commenti aggiuntivi.',
    thanks: 'Grazie per il tuo prezioso contributo al programma di test di Bird Academy!',
    footer_text: 'Bird Academy — V2.0.0-RC1 (BA-V2.0.0-RC1) • Rapporto del tester',
    page_label: 'Pagina',
  },
  ar: {
    lang: 'ar',
    dir: 'rtl',
    brand: 'أكاديمية الطيور — BIRD ACADEMY',
    tagline: 'إدارة وتربية الطيور الاحترافية',
    title: 'تقرير واستمارة الاختبار — للتعبئة من قبل المختبر',
    subtitle: 'Bird Academy — V2.0.0-RC1 (BUILD_ID: BA-V2.0.0-RC1)',
    intro: 'هذه الوثيقة عبارة عن استمارة تقييم ميدانية مخصصة للمختبر لتدوين ملاحظاته بعد استخدام تطبيق Bird Academy. اتبع خطوات تجربتك، وسجل ملاحظاتك، وأبلغ عن أية مشاكل تواجهها، وشاركنا رأيك كمربي لمساعدتنا في تحسين التطبيق.',
    secA_title: 'القسم أ — معلومات المختبر',
    name_label: 'الاسم / الاسم المستعار:',
    date_label: 'تاريخ الاختبار:',
    country_label: 'البلد / المدينة (اختياري):',
    device_label: 'نوع الجهاز (حاسوب، جهاز لوحي، نوع/طراز الهاتف):',
    system_label: 'النظام المستخدم:',
    sys_win: 'ويندوز 10 / 11 (Windows)',
    sys_android: 'أندرويد (هاتف ذكي / لوحي)',
    version_label: 'إصدار التطبيق:',
    version_val: 'V2.0.0-RC1 (BA-V2.0.0-RC1)',
    duration_label: 'المدة التقريبية للاختبار:',
    secB_title: 'القسم ب — التثبيت وبدء الاستخدام الأول',
    chk_install: 'تم التثبيت بنجاح',
    chk_start: 'بدأ تشغيل التطبيق بشكل سليم',
    chk_first_use: 'تم فهم الاستخدام الأول بسهولة',
    chk_nav: 'تم استيعاب التنقل داخل التطبيق بسهولة',
    first_impression: 'الانطباع العام الأول:',
    secC_title: 'القسم ج — الاختبارات الوظيفية',
    secC_desc: 'حدد الاختبارات التي قمت بها وسجل النتيجة الملاحظة لكل وظيفة متاحة فعلياً بالتطبيق.',
    col_feature: 'الوظيفة / الميزة',
    col_tested: 'تم الاختبار؟',
    col_result: 'النتيجة الملاحظة',
    col_notes: 'الملاحظة أو المشكلة',
    opt_yes: 'نعم',
    opt_no: 'لا',
    res_works: 'يعمل بشكل سليم',
    res_works_issue: 'يعمل مع وجود مشكلة',
    res_fails: 'لا يعمل',
    res_untested: 'لم يتم اختباره',
    features: [
      { name: 'إدارة الطيور', desc: 'إضافة طائر، إدخال رقم الحِجْل، الحالة، الجرد' },
      { name: 'بطاقة الطائر', desc: 'جواز السفر الحيوي، شجرة النسب، السلالة، التفاصيل' },
      { name: 'البحث والتصفية', desc: 'البحث برقم الحِجْل، النوع، الحالة، الجنس' },
      { name: 'دورة التزاوج والتكاثر', desc: 'متابعة موسم التزاوج، التسجيلات السابقة' },
      { name: 'الأزواج', desc: 'تكوين الأزواج، التحقق من التوافق الوراثي' },
      { name: 'البيض والحضانة', desc: 'مواعيد وضع البيض، الفحص الضوئي، التفقيس والأعشاش' },
      { name: 'الإطعام اليدوي (EAM)', desc: 'جداول التغذية، متابعة الوزن، تحجيل الفراخ' },
      { name: 'المسكن والأقفاص', desc: 'تخصيص الأقفاص/السلاكات، التحويلات، السعة' },
      { name: 'الصحة والرعاية', desc: 'سجل العلاجات، التحصينات، الملاحظات البيطرية' },
      { name: 'الماسح الضوئي ورموز QR', desc: 'المسح وتوليد رموز QR للتعريف السريع' },
      { name: 'الذكاء والتحليلات', desc: 'إحصائيات التربية، المساعد المحلي المتخصص' },
      { name: 'النسخ الاحتياطي المحلي والتنزيل', desc: 'نسخ محلي 100% دون إنترنت، الاستعادة، تصدير البيانات' },
    ],
    secD_title: 'القسم د — الإبلاغ عن مشكلة',
    secD_desc: 'واجهتُ مشكلة — صف كل خلل مع تحديد الخطوات الدقيقة لإعادة تكراره.',
    prob_num: 'رقم المشكلة:',
    prob_feat: 'الوظيفة المعنية:',
    prob_what: 'ماذا حدث تحديداً؟',
    prob_steps: 'خطوات تكرار المشكلة:',
    prob_expected: 'النتيجة المتوقعة:',
    prob_obtained: 'النتيجة الفعلية الحاصلة:',
    prob_severity: 'درجة الخطورة حسب تقديرك:',
    sev_blocker: 'معطّل للتطبيق',
    sev_major: 'مهم وكبير',
    sev_annoying: 'مزعج',
    sev_minor: 'بسيط / طفيف',
    screenshot_label: 'هل تتوفر لقطة شاشة؟',
    secE_title: 'القسم هـ — تجربة المستخدم',
    secE_desc: 'قيّم سهولة استخدام الجوانب المختلفة للتطبيق.',
    lvl_very_easy: 'سهل جداً',
    lvl_easy: 'سهل',
    lvl_medium: 'متوسط',
    lvl_hard: 'صعب',
    lvl_very_hard: 'صعب جداً',
    ux_items: [
      'فهم التطبيق وآلية عمله',
      'إضافة طائر جديد',
      'العثور على طائر والبحث عنه',
      'التنقل بين أقسام التطبيق',
      'فهم المعلومات المعروضة',
      'استخدام وظائف التكاثر والتزاوج',
      'فهم النتائج والتحليلات الإحصائية',
      'استخدام ميزات رمز الاستجابة السريعة QR',
      'العثور على الإجراءات الهامة بسهولة',
    ],
    liked_label: 'ما نال إعجابي بشكل خاص:',
    confusing_label: 'ما وجدته صعباً أو غير واضح:',
    secF_title: 'القسم و — مقترحات المختبر',
    prio_improve: 'ما هي الوظيفة التي ينبغي تحسينها كأولوية قصوى؟',
    feature_add: 'ما هي الميزة الجديدة التي ترغب في إضافتها؟',
    other_sugg: 'مقترحات وملاحظات أخرى:',
    secG_title: 'القسم ز — التقييم العام',
    rate_ease: 'سهولة الاستخدام:',
    rate_utility: 'الفائدة لمربي الطيور:',
    rate_clarity: 'الوضوح وسهولة القراءة:',
    rate_overall: 'الرضا العام عن التطبيق:',
    recommend_q: 'بعد هذا الاختبار، هل توصي بتطبيق Bird Academy لمربين آخرين؟',
    rec_yes: 'نعم',
    rec_maybe: 'ربما',
    rec_no: 'لا',
    why_label: 'لماذا؟',
    secH_title: 'القسم ح — تعليقات وملاحظات حرة',
    secH_desc: 'مساحة مخصصة لملاحظاتكم الحرة، أو آراء بيولوجية وزووتقنية إضافية.',
    thanks: 'شكراً جزيلاً لمساهمتكم القيمة في برنامج اختبار وتطوير Bird Academy!',
    footer_text: 'أكاديمية الطيور — V2.0.0-RC1 (BA-V2.0.0-RC1) • تقرير واستمارة المختبر',
    page_label: 'صفحة',
  }
};

function buildHtml(l) {
  const isRtl = l.dir === 'rtl';
  const alignLeft = isRtl ? 'right' : 'left';
  const alignRight = isRtl ? 'left' : 'right';

  return `<!DOCTYPE html>
<html lang="${l.lang}" dir="${l.dir}">
<head>
  <meta charset="UTF-8">
  <title>${l.title} — ${l.subtitle}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: ${isRtl ? "'Segoe UI', Tahoma, Arial, sans-serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"};
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      line-height: 1.35;
      direction: ${l.dir};
      text-align: ${alignLeft};
    }

    /* Page container: exactly 5 clean pages */
    .page {
      page-break-after: always;
      break-after: page;
      min-height: 270mm;
      max-height: 275mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Headers & Brand */
    .header-bar {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 15pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: ${isRtl ? '0' : '0.5px'};
      margin: 0;
    }
    .doc-main-title {
      font-size: 11pt;
      font-weight: 800;
      color: #2563eb;
      margin: 2px 0 0 0;
      text-transform: uppercase;
    }
    .doc-meta {
      text-align: ${alignRight};
      font-size: 7.5pt;
      color: #64748b;
      font-family: monospace;
      line-height: 1.4;
    }
    .badge-tag {
      display: inline-block;
      padding: 2px 6px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      color: #1d4ed8;
      font-weight: 700;
      font-size: 7pt;
    }

    /* Section Titles */
    .section-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #1e293b;
      background: #f1f5f9;
      border-${alignLeft}: 4px solid #2563eb;
      padding: 4px 8px;
      margin-top: 10px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .section-desc {
      font-size: 7.5pt;
      color: #475569;
      margin: 2px 0 6px 0;
      line-height: 1.3;
    }

    /* Cards & Containers */
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      background: #ffffff;
      margin-bottom: 8px;
    }
    .intro-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 8pt;
      color: #334155;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    /* Form Fields Grid */
    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      margin-bottom: 6px;
    }
    .field-full {
      grid-column: 1 / -1;
    }
    .field-label {
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
      margin-bottom: 2px;
    }
    .input-line {
      border-bottom: 1px solid #94a3b8;
      height: 18px;
      margin-top: 2px;
    }
    .prefilled-val {
      font-weight: 600;
      color: #0f172a;
      font-family: monospace;
      font-size: 8pt;
    }

    /* Checkboxes */
    .chk {
      display: inline-block;
      width: 11px;
      height: 11px;
      border: 1.5px solid #475569;
      border-radius: 2px;
      margin-${alignRight}: 5px;
      vertical-align: middle;
      background: #fff;
    }
    .chk-inline {
      display: inline-flex;
      align-items: center;
      margin-${alignRight}: 14px;
      font-size: 8pt;
      color: #1e293b;
    }

    /* Writing Lines */
    .lines-area {
      margin-top: 4px;
      width: 100%;
    }
    .line {
      border-bottom: 1px dashed #cbd5e1;
      height: 20px;
      width: 100%;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      margin-top: 4px;
      margin-bottom: 4px;
    }
    th {
      background: #e2e8f0;
      color: #1e293b;
      font-weight: 700;
      padding: 4px 6px;
      border: 1px solid #cbd5e1;
      text-align: ${alignLeft};
    }
    td {
      padding: 3.5px 6px;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .table-chk {
      display: inline-flex;
      align-items: center;
      margin-${alignRight}: 6px;
      font-size: 7pt;
      white-space: nowrap;
    }

    /* Scale Row */
    .scale-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 6px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 8pt;
    }
    .scale-options {
      display: flex;
      gap: 12px;
    }

    /* Footer */
    .page-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 6px;
      font-size: 7pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1 ================= -->
  <div class="page">
    <div>
      <div class="header-bar">
        <div>
          <div class="brand-title">${l.brand}</div>
          <div class="doc-main-title">${l.title}</div>
        </div>
        <div class="doc-meta">
          <div><span class="badge-tag">${l.tagline}</span></div>
          <div style="margin-top:3px;">Version : <strong>V2.0.0-RC1</strong></div>
          <div>BUILD_ID : <strong>BA-V2.0.0-RC1</strong></div>
        </div>
      </div>

      <div class="intro-card">
        <strong>${l.subtitle}</strong><br>
        ${l.intro}
      </div>

      <!-- SECTION A -->
      <div class="section-title">${l.secA_title}</div>
      <div class="card">
        <div class="field-grid">
          <div>
            <div class="field-label">${l.name_label}</div>
            <div class="input-line"></div>
          </div>
          <div>
            <div class="field-label">${l.date_label}</div>
            <div class="input-line"></div>
          </div>
          <div>
            <div class="field-label">${l.country_label}</div>
            <div class="input-line"></div>
          </div>
          <div>
            <div class="field-label">${l.device_label}</div>
            <div class="input-line"></div>
          </div>
          <div>
            <div class="field-label">${l.system_label}</div>
            <div style="margin-top: 4px;">
              <span class="chk-inline"><span class="chk"></span>${l.sys_win}</span>
              <span class="chk-inline"><span class="chk"></span>${l.sys_android}</span>
            </div>
          </div>
          <div>
            <div class="field-label">${l.duration_label}</div>
            <div class="input-line"></div>
          </div>
          <div class="field-full">
            <div class="field-label">${l.version_label} <span class="prefilled-val">${l.version_val}</span></div>
          </div>
        </div>
      </div>

      <!-- SECTION B -->
      <div class="section-title">${l.secB_title}</div>
      <div class="card">
        <div style="display: flex; flex-wrap: wrap; gap: 8px 18px; margin-bottom: 8px;">
          <span class="chk-inline"><span class="chk"></span>${l.chk_install}</span>
          <span class="chk-inline"><span class="chk"></span>${l.chk_start}</span>
          <span class="chk-inline"><span class="chk"></span>${l.chk_first_use}</span>
          <span class="chk-inline"><span class="chk"></span>${l.chk_nav}</span>
        </div>

        <div class="field-label" style="margin-top: 6px;">${l.first_impression}</div>
        <div class="lines-area">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>${l.footer_text}</div>
      <div>${l.page_label} 1 / 5</div>
    </div>
  </div>

  <!-- ================= PAGE 2 ================= -->
  <div class="page">
    <div>
      <div class="header-bar" style="margin-bottom: 6px; padding-bottom: 4px;">
        <div style="font-weight: 800; font-size: 10pt; color: #0f172a;">${l.title} — ${l.subtitle}</div>
        <div class="doc-meta">V2.0.0-RC1</div>
      </div>

      <!-- SECTION C -->
      <div class="section-title" style="margin-top: 4px;">${l.secC_title}</div>
      <div class="section-desc">${l.secC_desc}</div>

      <table>
        <thead>
          <tr>
            <th style="width: 28%;">${l.col_feature}</th>
            <th style="width: 14%;">${l.col_tested}</th>
            <th style="width: 32%;">${l.col_result}</th>
            <th style="width: 26%;">${l.col_notes}</th>
          </tr>
        </thead>
        <tbody>
          ${l.features.map(f => `
          <tr>
            <td>
              <strong style="color: #0f172a;">${f.name}</strong><br>
              <span style="font-size: 6.5pt; color: #64748b;">${f.desc}</span>
            </td>
            <td>
              <span class="table-chk"><span class="chk"></span>${l.opt_yes}</span>
              <span class="table-chk"><span class="chk"></span>${l.opt_no}</span>
            </td>
            <td>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
                <span class="table-chk"><span class="chk"></span>${l.res_works}</span>
                <span class="table-chk"><span class="chk"></span>${l.res_works_issue}</span>
                <span class="table-chk"><span class="chk"></span>${l.res_fails}</span>
                <span class="table-chk"><span class="chk"></span>${l.res_untested}</span>
              </div>
            </td>
            <td>
              <div class="line" style="height: 14px;"></div>
            </td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <div>${l.footer_text}</div>
      <div>${l.page_label} 2 / 5</div>
    </div>
  </div>

  <!-- ================= PAGE 3 ================= -->
  <div class="page">
    <div>
      <div class="header-bar" style="margin-bottom: 6px; padding-bottom: 4px;">
        <div style="font-weight: 800; font-size: 10pt; color: #0f172a;">${l.title} — ${l.subtitle}</div>
        <div class="doc-meta">V2.0.0-RC1</div>
      </div>

      <!-- SECTION D -->
      <div class="section-title" style="margin-top: 4px;">${l.secD_title}</div>
      <div class="section-desc">${l.secD_desc}</div>

      <!-- Incident Form #1 -->
      <div class="card" style="margin-bottom: 10px; border-color: #f59e0b;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #fed7aa; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: #b45309; font-size: 8.5pt;">${l.prob_num} 1</strong>
          <div style="width: 70%; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 7.5pt; font-weight: 700; color: #475569;">${l.prob_feat}</span>
            <div class="input-line" style="flex: 1; height: 14px;"></div>
          </div>
        </div>

        <div class="field-label">${l.prob_what}</div>
        <div class="lines-area">
          <div class="line" style="height: 18px;"></div>
          <div class="line" style="height: 18px;"></div>
        </div>

        <div class="field-label" style="margin-top: 6px;">${l.prob_steps}</div>
        <div style="font-size: 7.5pt; margin-top: 2px;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <span>1.</span><div class="input-line" style="flex:1; height:15px;"></div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <span>2.</span><div class="input-line" style="flex:1; height:15px;"></div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <span>3.</span><div class="input-line" style="flex:1; height:15px;"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
          <div>
            <div class="field-label">${l.prob_expected}</div>
            <div class="input-line" style="height: 16px;"></div>
          </div>
          <div>
            <div class="field-label">${l.prob_obtained}</div>
            <div class="input-line" style="height: 16px;"></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 4px; border-top: 1px dotted #e2e8f0; font-size: 7.5pt;">
          <div>
            <strong>${l.prob_severity}</strong> &nbsp;
            <span class="chk-inline"><span class="chk"></span>${l.sev_blocker}</span>
            <span class="chk-inline"><span class="chk"></span>${l.sev_major}</span>
            <span class="chk-inline"><span class="chk"></span>${l.sev_annoying}</span>
            <span class="chk-inline"><span class="chk"></span>${l.sev_minor}</span>
          </div>
          <div>
            <strong>${l.screenshot_label}</strong> &nbsp;
            <span class="chk-inline"><span class="chk"></span>${l.opt_yes}</span>
            <span class="chk-inline"><span class="chk"></span>${l.opt_no}</span>
          </div>
        </div>
      </div>

      <!-- Incident Form #2 -->
      <div class="card" style="border-color: #cbd5e1;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: #475569; font-size: 8.5pt;">${l.prob_num} 2</strong>
          <div style="width: 70%; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 7.5pt; font-weight: 700; color: #475569;">${l.prob_feat}</span>
            <div class="input-line" style="flex: 1; height: 14px;"></div>
          </div>
        </div>

        <div class="field-label">${l.prob_what}</div>
        <div class="lines-area">
          <div class="line" style="height: 18px;"></div>
          <div class="line" style="height: 18px;"></div>
        </div>

        <div class="field-label" style="margin-top: 6px;">${l.prob_steps}</div>
        <div style="font-size: 7.5pt; margin-top: 2px;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <span>1.</span><div class="input-line" style="flex:1; height:15px;"></div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <span>2.</span><div class="input-line" style="flex:1; height:15px;"></div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <span>3.</span><div class="input-line" style="flex:1; height:15px;"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
          <div>
            <div class="field-label">${l.prob_expected}</div>
            <div class="input-line" style="height: 16px;"></div>
          </div>
          <div>
            <div class="field-label">${l.prob_obtained}</div>
            <div class="input-line" style="height: 16px;"></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 4px; border-top: 1px dotted #e2e8f0; font-size: 7.5pt;">
          <div>
            <strong>${l.prob_severity}</strong> &nbsp;
            <span class="chk-inline"><span class="chk"></span>${l.sev_blocker}</span>
            <span class="chk-inline"><span class="chk"></span>${l.sev_major}</span>
            <span class="chk-inline"><span class="chk"></span>${l.sev_annoying}</span>
            <span class="chk-inline"><span class="chk"></span>${l.sev_minor}</span>
          </div>
          <div>
            <strong>${l.screenshot_label}</strong> &nbsp;
            <span class="chk-inline"><span class="chk"></span>${l.opt_yes}</span>
            <span class="chk-inline"><span class="chk"></span>${l.opt_no}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>${l.footer_text}</div>
      <div>${l.page_label} 3 / 5</div>
    </div>
  </div>

  <!-- ================= PAGE 4 ================= -->
  <div class="page">
    <div>
      <div class="header-bar" style="margin-bottom: 6px; padding-bottom: 4px;">
        <div style="font-weight: 800; font-size: 10pt; color: #0f172a;">${l.title} — ${l.subtitle}</div>
        <div class="doc-meta">V2.0.0-RC1</div>
      </div>

      <!-- SECTION E -->
      <div class="section-title" style="margin-top: 4px;">${l.secE_title}</div>
      <div class="section-desc">${l.secE_desc}</div>

      <table>
        <thead>
          <tr>
            <th style="width: 42%;">${l.col_feature}</th>
            <th style="text-align: center;">${l.lvl_very_easy}</th>
            <th style="text-align: center;">${l.lvl_easy}</th>
            <th style="text-align: center;">${l.lvl_medium}</th>
            <th style="text-align: center;">${l.lvl_hard}</th>
            <th style="text-align: center;">${l.lvl_very_hard}</th>
          </tr>
        </thead>
        <tbody>
          ${l.ux_items.map(item => `
          <tr>
            <td><strong>${item}</strong></td>
            <td style="text-align: center;"><span class="chk"></span></td>
            <td style="text-align: center;"><span class="chk"></span></td>
            <td style="text-align: center;"><span class="chk"></span></td>
            <td style="text-align: center;"><span class="chk"></span></td>
            <td style="text-align: center;"><span class="chk"></span></td>
          </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
        <div class="card">
          <div class="field-label" style="color: #166534;">${l.liked_label}</div>
          <div class="lines-area">
            <div class="line" style="height: 18px;"></div>
            <div class="line" style="height: 18px;"></div>
            <div class="line" style="height: 18px;"></div>
          </div>
        </div>
        <div class="card">
          <div class="field-label" style="color: #991b1b;">${l.confusing_label}</div>
          <div class="lines-area">
            <div class="line" style="height: 18px;"></div>
            <div class="line" style="height: 18px;"></div>
            <div class="line" style="height: 18px;"></div>
          </div>
        </div>
      </div>

      <!-- SECTION F -->
      <div class="section-title" style="margin-top: 10px;">${l.secF_title}</div>
      <div class="card">
        <div class="field-label">${l.prio_improve}</div>
        <div class="lines-area" style="margin-bottom: 6px;">
          <div class="line" style="height: 17px;"></div>
          <div class="line" style="height: 17px;"></div>
        </div>

        <div class="field-label">${l.feature_add}</div>
        <div class="lines-area" style="margin-bottom: 6px;">
          <div class="line" style="height: 17px;"></div>
          <div class="line" style="height: 17px;"></div>
        </div>

        <div class="field-label">${l.other_sugg}</div>
        <div class="lines-area">
          <div class="line" style="height: 17px;"></div>
          <div class="line" style="height: 17px;"></div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>${l.footer_text}</div>
      <div>${l.page_label} 4 / 5</div>
    </div>
  </div>

  <!-- ================= PAGE 5 ================= -->
  <div class="page">
    <div>
      <div class="header-bar" style="margin-bottom: 6px; padding-bottom: 4px;">
        <div style="font-weight: 800; font-size: 10pt; color: #0f172a;">${l.title} — ${l.subtitle}</div>
        <div class="doc-meta">V2.0.0-RC1</div>
      </div>

      <!-- SECTION G -->
      <div class="section-title" style="margin-top: 4px;">${l.secG_title}</div>
      <div class="card" style="margin-bottom: 8px;">
        <div class="scale-row">
          <span><strong>${l.rate_ease}</strong></span>
          <div class="scale-options">
            <span><span class="chk"></span>1</span>
            <span><span class="chk"></span>2</span>
            <span><span class="chk"></span>3</span>
            <span><span class="chk"></span>4</span>
            <span><span class="chk"></span>5</span>
          </div>
        </div>
        <div class="scale-row">
          <span><strong>${l.rate_utility}</strong></span>
          <div class="scale-options">
            <span><span class="chk"></span>1</span>
            <span><span class="chk"></span>2</span>
            <span><span class="chk"></span>3</span>
            <span><span class="chk"></span>4</span>
            <span><span class="chk"></span>5</span>
          </div>
        </div>
        <div class="scale-row">
          <span><strong>${l.rate_clarity}</strong></span>
          <div class="scale-options">
            <span><span class="chk"></span>1</span>
            <span><span class="chk"></span>2</span>
            <span><span class="chk"></span>3</span>
            <span><span class="chk"></span>4</span>
            <span><span class="chk"></span>5</span>
          </div>
        </div>
        <div class="scale-row" style="border-bottom: none;">
          <span><strong>${l.rate_overall}</strong></span>
          <div class="scale-options">
            <span><span class="chk"></span>1</span>
            <span><span class="chk"></span>2</span>
            <span><span class="chk"></span>3</span>
            <span><span class="chk"></span>4</span>
            <span><span class="chk"></span>5</span>
          </div>
        </div>

        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dotted #cbd5e1;">
          <div class="field-label">${l.recommend_q}</div>
          <div style="margin: 4px 0 6px 0;">
            <span class="chk-inline"><span class="chk"></span>${l.rec_yes}</span>
            <span class="chk-inline"><span class="chk"></span>${l.rec_maybe}</span>
            <span class="chk-inline"><span class="chk"></span>${l.rec_no}</span>
          </div>
          <div class="field-label">${l.why_label}</div>
          <div class="lines-area">
            <div class="line" style="height: 18px;"></div>
            <div class="line" style="height: 18px;"></div>
          </div>
        </div>
      </div>

      <!-- SECTION H -->
      <div class="section-title" style="margin-top: 8px;">${l.secH_title}</div>
      <div class="section-desc">${l.secH_desc}</div>
      <div class="card" style="padding: 10px 12px;">
        <div class="lines-area">
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
          <div class="line" style="height: 22px;"></div>
        </div>
      </div>

      <div style="margin-top: 10px; padding: 8px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; text-align: center; color: #065f46; font-weight: 700; font-size: 8pt;">
        ${l.thanks}
      </div>
    </div>

    <div class="page-footer">
      <div>${l.footer_text}</div>
      <div>${l.page_label} 5 / 5</div>
    </div>
  </div>

</body>
</html>`;
}

async function generateAllPdfs() {
  console.log('[GEN-PDF] Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const results = {};

  try {
    for (const [code, localeData] of Object.entries(LOCALES)) {
      const page = await browser.newPage();
      const html = buildHtml(localeData);
      await page.setContent(html, { waitUntil: 'load' });

      // Output files:
      // FR is both the default 'Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf' AND 'Rapport-de-test-Bird-Academy-V2.0.0-RC1-fr.pdf'
      const filenames = code === 'fr'
        ? [
            'Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur.pdf',
            'Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur-fr.pdf',
            'Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf',
            'Rapport-de-test-Bird-Academy-V2.0.0-RC1-fr.pdf'
          ]
        : [
            `Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur-${code}.pdf`,
            `Rapport-de-test-Bird-Academy-V2.0.0-RC1-${code}.pdf`
          ];

      for (const fn of filenames) {
        const filePath = path.join(outputDir, fn);
        console.log(`[GEN-PDF] Rendering ${code.toUpperCase()} PDF (${localeData.dir}) to ${fn}...`);
        
        await page.pdf({
          path: filePath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '8mm',
            bottom: '8mm',
            left: '10mm',
            right: '10mm'
          }
        });

        const stat = fs.statSync(filePath);
        const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').toUpperCase();

        results[fn] = {
          code,
          dir: localeData.dir,
          size: stat.size,
          sizeFormatted: `${stat.size.toLocaleString('fr-FR')} octets (${(stat.size / 1024).toFixed(2)} Ko)`,
          sha256: hash
        };

        // Mirror to dist_binaries and dist/downloads if they exist
        const distBinDir = path.join(rootDir, 'dist_binaries');
        const distDlDir = path.join(rootDir, 'dist', 'downloads');
        if (fs.existsSync(distBinDir)) {
          fs.copyFileSync(filePath, path.join(distBinDir, fn));
        }
        if (fs.existsSync(distDlDir)) {
          fs.copyFileSync(filePath, path.join(distDlDir, fn));
        }

        console.log(`- Path: ${filePath}`);
        console.log(`- Size: ${stat.size} bytes (${(stat.size / 1024).toFixed(2)} KB)`);
        console.log(`- SHA-256: ${hash}`);
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log('\n[GEN-PDF] All PDFs generated successfully:');
  console.log(JSON.stringify(results, null, 2));
  return results;
}

if (require.main === module) {
  generateAllPdfs().catch(err => {
    console.error('[GEN-PDF] Error:', err);
    process.exit(1);
  });
}

module.exports = { generateAllPdfs, LOCALES, buildHtml };

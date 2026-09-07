/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FaqItem, HelpArticle, OnboardingStep } from '../types';

export const FAQ_ITEMS: Record<string, FaqItem[]> = {
  fr: [
    {
      id: 'faq-1',
      category: 'general',
      question: "Bird Academy fonctionne-t-elle hors-ligne ?",
      answer: "Oui, l'application est conçue selon une philosophie Offline-First. Toutes vos données d'élevage, généalogies et transactions financières sont stockées localement sur votre appareil. Vous pouvez l'utiliser à 100% dans des sous-sols ou volières isolées sans connexion internet."
    },
    {
      id: 'faq-2',
      category: 'breeding',
      question: "Comment fonctionne le calcul du sevrage des jeunes ?",
      answer: "Une alerte de sevrage est automatiquement planifiée 30 jours après la date de naissance enregistrée de l'oisillon. Cette alerte apparaît dans votre tableau de bord de supervision et votre calendrier pour vous indiquer qu'il est temps d'isoler le jeune ou de lui présenter de la pâtée sèche."
    },
    {
      id: 'faq-3',
      category: 'genetics',
      question: "Comment puis-je éviter la consanguinité lors des accouplements ?",
      answer: "L'outil calcule les coefficients de parenté de Wright à partir de l'arbre généalogique. Lors de la création d'un couple, s'ils partagent des ancêtres communs sur 4 générations, un message d'alerte s'affiche pour vous indiquer le risque d'apparition de tares génétiques récessives."
    },
    {
      id: 'faq-4',
      category: 'data',
      question: "Mes données d'élevage sont-elles sécurisées ?",
      answer: "Oui. Vos données ne quittent jamais votre navigateur. Les sauvegardes générées sont signées cryptographiquement à l'aide d'une clé d'intégrité locale afin d'éviter toute corruption lors des imports/exports."
    }
  ],
  en: [
    {
      id: 'faq-1',
      category: 'general',
      question: "Does Bird Academy work offline?",
      answer: "Yes, the app is built on an Offline-First philosophy. All your breeding data, genealogies, and financials are saved locally. You can use it in remote aviaries without internet."
    },
    {
      id: 'faq-2',
      category: 'breeding',
      question: "How is the chick weaning date computed?",
      answer: "A weaning reminder is automatically scheduled 30 days after the registered hatch date. It will pop up in your notification panel and calendar."
    },
    {
      id: 'faq-3',
      category: 'genetics',
      question: "How do I prevent inbreeding in mating pairs?",
      answer: "The platform calculates Wright's inbreeding coefficients based on the pedigree tree up to 4 generations. A warning displays if they share common ancestors."
    }
  ],
  ar: [
    {
      id: 'faq-1',
      category: 'general',
      question: "هل يعمل تطبيق Bird Academy دون اتصال بالإنترنت؟",
      answer: "نعم، تم تصميم التطبيق ليعمل دون الحاجة للإنترنت بشكل كامل. يتم حفظ جميع بيانات الطيور والنسب والمالية محلياً على جهازك لسهولة الاستخدام في المزارع والأماكن المعزولة."
    }
  ],
  es: [
    {
      id: 'faq-1',
      category: 'general',
      question: "¿Funciona Bird Academy sin conexión?",
      answer: "Sí, la aplicación se almacena localmente de forma nativa. Toda la información de cría está protegida en su navegador."
    }
  ],
  it: [
    {
      id: 'faq-1',
      category: 'general',
      question: "Bird Academy funziona offline?",
      answer: "Sì, l'applicazione è progettata per funzionare offline in modo nativo, salvando i dati sul tuo dispositivo."
    }
  ]
};

export const HELP_ARTICLES: Record<string, HelpArticle[]> = {
  fr: [
    {
      id: 'art-nesting',
      title: "Préparation de la saison d'élevage",
      category: "breeding",
      content: "Une préparation méticuleuse est la clé d'une reproduction réussie. Veillez à isoler les reproducteurs pendant la période hivernale. Introduisez des vitamines E et du calcium 15 jours avant la formation des couples. L'installation des nids doit s'accompagner d'une charpie de coton propre et dépoussiérée.",
      tags: ["reproduction", "nid", "vitamines"]
    },
    {
      id: 'art-quarantine',
      title: "Règles strictes de biosécurité (Quarantaine)",
      category: "health",
      content: "Tout nouvel oiseau introduit dans l'élevage doit obligatoirement subir une période d'isolement de 30 jours dans une pièce séparée. Cela prévient l'introduction de poux rouges, de gale des pattes ou d'infections respiratoires au sein de votre cheptel sain.",
      tags: ["biosécurité", "maladie", "isolement"]
    }
  ],
  en: [
    {
      id: 'art-nesting',
      title: "Preparing for the Breeding Season",
      category: "breeding",
      content: "Meticulous preparation is key. Isolate breeders during winter. Introduce Vitamin E and calcium 15 days before forming couples. Nest boxes must be clean and supplied with dust-free nesting material.",
      tags: ["reproduction", "nests", "vitamins"]
    }
  ]
};

export const ONBOARDING_STEPS: Record<string, OnboardingStep[]> = {
  fr: [
    {
      id: 'step-welcome',
      title: "Bienvenue sur Bird Academy Enterprise !",
      content: "Découvrez la console de pilotage d'élevage de canaris la plus avancée du marché. Ce parcours d'intégration rapide va vous guider à travers les fonctionnalités phares du Sprint 10."
    },
    {
      id: 'step-validation',
      title: "Moteur de Validation Biologique",
      content: "Notre moteur exclusif scrute en continu votre base locale pour s'assurer qu'aucun couple invalide, aucun œuf surnuméraire et aucune incohérence de date ne perturbe vos statistiques."
    },
    {
      id: 'step-benchmarks',
      title: "Contrôles de Latence",
      content: "Grâce au Benchmark Engine, vous pouvez mesurer en millisecondes le temps de réponse de vos calculs, garantissant une fluidité parfaite même avec un cheptel de 10 000 oiseaux."
    },
    {
      id: 'step-help',
      title: "Prêt pour la production !",
      content: "Vous êtes désormais équipé pour piloter votre élevage comme un professionnel. N'hésitez pas à consulter la FAQ locale en cas de doute hors-ligne !"
    }
  ],
  en: [
    {
      id: 'step-welcome',
      title: "Welcome to Bird Academy Enterprise !",
      content: "Discover the most advanced canary breeding management console. This quick tour will guide you through Sprint 10 features."
    },
    {
      id: 'step-validation',
      title: "Biological Validation Engine",
      content: "Our exclusive engine scans your database to prevent gender mismatches, egg surpluses, or weird timeline inconsistencies."
    },
    {
      id: 'step-help',
      title: "Production Ready !",
      content: "You are now equipped to manage your flock like a pro. Feel free to use the offline FAQ anytime!"
    }
  ],
  ar: [
    {
      id: 'step-welcome',
      title: "مرحباً بكم في Bird Academy !",
      content: "اكتشف لوحة تحكم التربية الأكثر تقدماً للتكاثر، والتحكم بالجينات وتدقيق البيانات."
    }
  ],
  es: [
    {
      id: 'step-welcome',
      title: "¡Bienvenido a Bird Academy!",
      content: "Descubra la consola de gestión de canarios más avanzada para el control de cría y genética."
    }
  ],
  it: [
    {
      id: 'step-welcome',
      title: "Benvenuto su Bird Academy !",
      content: "Scopri la console di gestione allevamento canarini più avanzata del mercato."
    }
  ]
};

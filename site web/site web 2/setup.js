const fs = require('fs');
const path = require('path');

console.log('🚀 Initialisation du projet officiel Bird Academy Web...');

// Définition de l'arborescence et des fichiers
const files = {
  // 1. Configuration Racine
  'package.json': JSON.stringify({
    name: "bird-academy-web",
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      "test:unit": "vitest run",
      "test:e2e": "playwright test"
    },
    dependencies: {
      next: "^14.2.5",
      react: "^18.3.1",
      "react-dom": "^18.3.1"
    },
    devDependencies: {
      "@playwright/test": "^1.46.0",
      "@types/node": "^20.14.12",
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      autoprefixer: "^10.4.19",
      eslint: "^8.57.0",
      "eslint-config-next": "14.2.5",
      postcss: "^8.4.40",
      tailwindcss: "^3.4.7",
      typescript: "^5.5.4",
      vitest: "^2.0.5"
    }
  }, null, 2),

  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: {
        "@/*": ["./src/*"]
      }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }, null, 2),

  'tailwind.config.ts': `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: "#2E7D32",
            dark: "#1B5E20",
            light: "#4CAF50",
          },
          secondary: {
            DEFAULT: "#81C784",
            light: "#A5D6A7",
            dark: "#66BB6A",
          },
          accent: {
            DEFAULT: "#FBC02D",
            light: "#FDD835",
            dark: "#F57F17",
          },
          dark: "#263238",
          muted: "#757575",
          surface: "#F8F9FA",
          card: "#FFFFFF",
          border: "#E0E0E0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
`,

  'postcss.config.mjs': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

  'next.config.mjs': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
export default nextConfig;
`,

  'vitest.config.ts': `import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`,

  'playwright.config.ts': `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
`,

  // 2. Styles
  'src/styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #2E7D32;
  --color-secondary: #81C784;
  --color-accent: #FBC02D;
  --color-dark: #263238;
  --color-muted: #757575;
  --color-surface: #F8F9FA;
}

body {
  background-color: var(--color-surface);
  color: var(--color-dark);
  overflow-x: hidden;
  min-height: 100vh;
}

[dir="rtl"] {
  text-align: right;
  direction: rtl;
}

[dir="ltr"] {
  text-align: left;
  direction: ltr;
}

.container-custom {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  max-width: 1280px;
}

@media (min-width: 640px) {
  .container-custom { padding-left: 1.5rem; padding-right: 1.5rem; }
}

@media (min-width: 1024px) {
  .container-custom { padding-left: 2rem; padding-right: 2rem; }
}
`,

  // 3. Configuration i18n
  'src/i18n/config.ts': `export const i18n = {
  defaultLocale: "fr",
  locales: ["fr", "en", "ar", "es", "it"],
  localeDirections: {
    fr: "ltr",
    en: "ltr",
    ar: "rtl",
    es: "ltr",
    it: "ltr",
  },
  localeNames: {
    fr: "Français",
    en: "English",
    ar: "العربية",
    es: "Español",
    it: "Italiano",
  },
} as const;

export type Locale = (typeof i18n)["locales"][number];
`,

  'src/i18n/get-dictionary.ts': `import type { Locale } from "./config";

const dictionaries = {
  fr: () => import("./locales/fr.json").then((m) => m.default),
  en: () => import("./locales/en.json").then((m) => m.default),
  ar: () => import("./locales/ar.json").then((m) => m.default),
  es: () => import("./locales/es.json").then((m) => m.default),
  it: () => import("./locales/it.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  const loadDict = dictionaries[locale] || dictionaries.fr;
  return loadDict();
};
`,

  // 4. Dictionnaires
  'src/i18n/locales/fr.json': JSON.stringify({
    nav: {
      features: "Fonctionnalités",
      pricing: "Éditions & Tarifs",
      assistant: "Assistant IA",
      intelligence: "Bird Intelligence",
      licenses: "Licences LMSE",
      download: "Téléchargement",
      documentation: "Documentation",
      faq: "FAQ"
    },
    home: {
      hero: {
        badge: "Solution Logicielle d'Élevage Professionnel",
        title: "Maîtrisez votre élevage. Suivez chaque oiseau. Décidez avec précision.",
        subtitle: "La plateforme logicielle conçue pour les éleveurs de canaris et d'oiseaux de race. Gestion complète, génétique mendélienne, suivi sanitaire et intelligence déterministe.",
        ctaDownload: "Télécharger Bird Academy",
        ctaFeatures: "Découvrir les fonctionnalités",
        offlineGuarantee: "100 % Autonome & Hors Ligne — Vos données restent strictement sur votre appareil."
      },
      offline: {
        badge: "Confidentialité & Résilience",
        title: "Une architecture 100 % hors ligne par conception",
        subtitle: "Aucun serveur cloud intermédiaire n'est requis pour la gestion quotidienne de votre élevage.",
        cards: [
          { title: "Données locales & souveraines", description: "Vos registres restent sur votre terminal." },
          { title: "Disponibilité totale en volière", description: "Travaillez directement sans connexion requise." },
          { title: "Usage ponctuel d'Internet", description: "Uniquement pour le binaire et la licence LMSE." }
        ]
      },
      featuresGrid: {
        badge: "Modules Intégrés",
        title: "Des outils spécialisés pour chaque dimension de l'élevage",
        subtitle: "Un environnement professionnel conçu pour les éleveurs exigeants.",
        items: [
          { slug: "birds", title: "Gestion des Oiseaux", desc: "Fiches individuelles détaillées, bagues, cages et statut biologique." },
          { slug: "breeding", title: "Reproduction & Couvées", desc: "Suivi des couples, pontes, mirage, éclosions et sevrage." },
          { slug: "health", title: "Suivi Sanitaire & Soins", desc: "Traitements, observations, carnet vaccinal et quarantaine." },
          { slug: "genetics", title: "Génétique Mendélienne", desc: "Calcul de mutations, consanguinité et conformité COM." },
          { slug: "intelligence", title: "Bird Intelligence", desc: "Moteur analytique déterministe, alertes et scores d'élevage." },
          { slug: "assistant", title: "Assistant IA Local", desc: "Raisonnement hors ligne contextualisé sans exfiltration de données." }
        ]
      }
    },
    pricingPage: {
      header: {
        badge: "Modèle & Éditions",
        title: "Choisissez l'édition adaptée à votre élevage",
        subtitle: "Une licence claire gérée localement par LMSE.",
        disclaimer: "Les tarifs officiels seront fixés lors de l'ouverture commerciale."
      },
      tiers: {
        free: { name: "FREE", target: "Débutants", price: "Gratuit", period: "Illimité", cta: "Télécharger" },
        premium: { name: "PREMIUM", target: "Éleveurs confirmés", price: "À DÉFINIR", period: "Licence annuelle", cta: "Demander une licence" },
        pro: { name: "PRO", target: "Compétiteurs & Clubs", price: "À DÉFINIR", period: "Licence annuelle", cta: "Contacter pour PRO" }
      }
    },
    footer: {
      rights: "Tous droits réservés.",
      privacy: "Confidentialité",
      terms: "Conditions"
    }
  }, null, 2),

  'src/i18n/locales/en.json': JSON.stringify({
    nav: {
      features: "Features",
      pricing: "Editions & Pricing",
      assistant: "AI Assistant",
      intelligence: "Bird Intelligence",
      licenses: "LMSE Licenses",
      download: "Download",
      documentation: "Documentation",
      faq: "FAQ"
    },
    home: {
      hero: {
        badge: "Professional Avian Management Software",
        title: "Master your breeding. Track every bird. Decide with precision.",
        subtitle: "The offline-first desktop platform for canary and show-bird breeders. Rigorous records, Mendelian genetics, and deterministic intelligence.",
        ctaDownload: "Download Bird Academy",
        ctaFeatures: "Explore Features",
        offlineGuarantee: "100% Autonomous & Offline — Your breeding data strictly stays on your device."
      },
      offline: {
        badge: "Privacy & Resilience",
        title: "100% Offline-first Architecture by Design",
        subtitle: "No intermediate cloud server is required for daily breeding management.",
        cards: [
          { title: "Sovereign Local Data", description: "Breeding profiles remain on your computer." },
          { title: "Total Aviary Availability", description: "Work directly inside facilities without internet." },
          { title: "Strictly Scoped Internet Use", description: "Used solely for binary download and LMSE verification." }
        ]
      },
      featuresGrid: {
        badge: "Integrated Modules",
        title: "Specialized tools for every stage of breeding",
        subtitle: "A complete professional workspace engineered for dedicated aviculturists.",
        items: [
          { slug: "birds", title: "Bird Records Management", desc: "Detailed profiles, official bands, cage locations, and biological traits." },
          { slug: "breeding", title: "Breeding & Clutches", desc: "Pairing tracking, egg-laying, candling, and weaning control." },
          { slug: "health", title: "Health & Care Journal", desc: "Medical treatments, daily observations, and quarantine protocols." },
          { slug: "genetics", title: "Mendelian Genetics", desc: "Accurate mutation modeling and lineage inbreeding control." },
          { slug: "intelligence", title: "Bird Intelligence", desc: "Deterministic analytical engine providing health alerts and clutch scores." },
          { slug: "assistant", title: "Local AI Assistant", desc: "Offline-first AI reasoning contextualized with your aviary records." }
        ]
      }
    },
    pricingPage: {
      header: {
        badge: "Editions & Licensing",
        title: "Choose the edition adapted to your aviary",
        subtitle: "Clear licensing powered locally by LMSE.",
        disclaimer: "Official pricing will be finalized at commercial launch."
      },
      tiers: {
        free: { name: "FREE", target: "Beginners", price: "Free", period: "Lifetime", cta: "Download Free" },
        premium: { name: "PREMIUM", target: "Active Breeders", price: "À DÉFINIR", period: "Annual license", cta: "Get a License" },
        pro: { name: "PRO", target: "Show Competitors", price: "À DÉFINIR", period: "Annual license", cta: "Contact for PRO" }
      }
    },
    footer: {
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    }
  }, null, 2),

  'src/i18n/locales/ar.json': JSON.stringify({
    nav: {
      features: "الميزات",
      pricing: "الإصدارات والأسعار",
      assistant: "المساعد الذكي",
      intelligence: "ذكاء الطيور",
      licenses: "تراخيص LMSE",
      download: "التحميل",
      documentation: "التوثيق",
      faq: "الأسئلة الشائعة"
    },
    home: {
      hero: {
        badge: "حل برمجي احترافي لتربية الطيور",
        title: "تحكّم في تربية طيورك. تتبّع كل طائر. اتخذ قراراتك بدقة.",
        subtitle: "المنصة المستقلة المخصصة لمربي الكناري والطيور الأصيلة. إدارة دقيقة للأقفاص، تتبع بيولوجي، والوراثة المندلية.",
        ctaDownload: "تحميل Bird Academy",
        ctaFeatures: "استعراض الميزات",
        offlineGuarantee: "مستقل ويعمل محلياً 100% — بياناتك تبقى بأمان تام على جهازك الخاص."
      },
      offline: {
        badge: "الخصوصية والاستقلالية",
        title: "بنية معمارية محلية بالكامل دون اتصال بالإنترنت",
        subtitle: "لا يتطلب عملك اليومي أي اتصال بسحابة أو خوادم خارجية.",
        cards: [
          { title: "بيانات محلية ذات سيادة", description: "تظل سجلات الطيور على حاسوبك فقط دون تسريب." },
          { title: "جاهزية تامة في غرف الطيور", description: "سجل الملاحظات مباشرة داخل غرف التربية دون شبكة." },
          { title: "استخدام محدد للإنترنت", description: "فقط لتحميل البرنامج وتأكيد ترخيص LMSE المعتمد." }
        ]
      },
      featuresGrid: {
        badge: "الوحدات المتكاملة",
        title: "أدوات متخصصة لكل مراحل إدارة التربية",
        subtitle: "بيئة عمل رقمية تلبي الاحتياجات الميدانية الدقيقة للمربين المحترفين.",
        items: [
          { slug: "birds", title: "إدارة بطاقات الطيور", desc: "بطاقات تعريفية، أرقام الحلقات الرسمية ومواقع الأقفاص." },
          { slug: "breeding", title: "التفريخ والحضانات", desc: "متابعة التزاوج، تواريخ وضع البيض، ومواعيد التحجيل والفطام." },
          { slug: "health", title: "السجل الصحي والعلاجي", desc: "تتبع الجرعات، الملاحظات البيطرية وإجراءات الحجر الصحي." },
          { slug: "genetics", title: "علم الوراثة المندلية", desc: "نمذجة الطفرات وتوقع مخرجات التزاوج وحساب القرابة." },
          { slug: "intelligence", title: "ذكاء الطيور (Bird Intelligence)", desc: "محرك تحليلي قطعي يولد تنبيهات صحية ومؤشرات نجاح." },
          { slug: "assistant", title: "المساعد الذكي المحلي", desc: "ذكاء اصطناعي يعمل محلياً بالكامل وموجّه بسياق طيورك." }
        ]
      }
    },
    pricingPage: {
      header: {
        badge: "الإصدارات والتراخيص",
        title: "اختر الإصدار المناسب لاحتياجات غرف طيورك",
        subtitle: "نظام ترخيص واضح ومدار محلياً عبر تقنية LMSE.",
        disclaimer: "سيتم تحديد الأسعار الرسمية عند الإطلاق التجاري الرسمي."
      },
      tiers: {
        free: { name: "FREE", target: "للمبتدئين", price: "مجاني", period: "دائم", cta: "تحميل مجاني" },
        premium: { name: "PREMIUM", target: "للمربين النشطين", price: "À DÉFINIR", period: "ترخيص سنوي", cta: "طلب ترخيص" },
        pro: { name: "PRO", target: "لأبطال المسابقات والنوادي", price: "À DÉFINIR", period: "ترخيص سنوي", cta: "طلب نسخة PRO" }
      }
    },
    footer: {
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "الشروط والأحكام"
    }
  }, null, 2),

  'src/i18n/locales/es.json': JSON.stringify({
    nav: {
      features: "Características",
      pricing: "Planes y Precios",
      assistant: "Asistente IA",
      intelligence: "Bird Intelligence",
      licenses: "Licencias LMSE",
      download: "Descargar",
      documentation: "Documentación",
      faq: "Preguntas Frecuentes"
    },
    home: {
      hero: {
        badge: "Solución Profesional para Criadores",
        title: "Domine su criadero. Rastree cada ave. Decida con precisión.",
        subtitle: "La plataforma de software especializada para la cría de canarios y aves. Gestión completa, genética mendeliana y seguimiento sanitario.",
        ctaDownload: "Descargar Bird Academy",
        ctaFeatures: "Descubrir características",
        offlineGuarantee: "100% Autónomo y Sin Conexión — Sus datos permanecen estrictamente en su dispositivo."
      },
      offline: {
        badge: "Privacidad y Resiliencia",
        title: "Arquitectura 100% local y sin conexión",
        subtitle: "No se requiere servidor remoto en el día a día para gestionar su criadero.",
        cards: [
          { title: "Datos soberanos", description: "Sus registros permanecen en su equipo." },
          { title: "Disponibilidad en aviario", description: "Trabaje directamente sin depender de la red." },
          { title: "Uso específico de internet", description: "Solo para la descarga inicial y activación LMSE." }
        ]
      },
      featuresGrid: {
        badge: "Módulos Integrados",
        title: "Herramientas especializadas para cada dimensión",
        subtitle: "Un entorno profesional diseñado para criadores rigurosos.",
        items: [
          { slug: "birds", title: "Gestión de Aves", desc: "Fichas individuales, anillas, ubicación en jaulas y estado." },
          { slug: "breeding", title: "Reproducción y Nidadas", desc: "Seguimiento de parejas, puestas, ovoscopia y destete." },
          { slug: "health", title: "Registro Sanitario", desc: "Tratamientos, historial médico y gestión de cuarentena." },
          { slug: "genetics", title: "Genética Mendeliana", desc: "Cálculo de mutaciones, consanguinidad y estándares COM." },
          { slug: "intelligence", title: "Bird Intelligence", desc: "Motor analítico determinista con alertas y puntuaciones." },
          { slug: "assistant", title: "Asistente IA Local", desc: "Razonamiento local contextualizado sin fuga de datos." }
        ]
      }
    },
    pricingPage: {
      header: {
        badge: "Planes y Licencias",
        title: "Elija la edición adecuada para su criadero",
        subtitle: "Licenciamiento transparente y gestionado localmente por LMSE.",
        disclaimer: "Los precios oficiales se confirmarán en el lanzamiento comercial."
      },
      tiers: {
        free: { name: "FREE", target: "Principiantes", price: "Gratis", period: "Ilimitado", cta: "Descargar Gratis" },
        premium: { name: "PREMIUM", target: "Criadores activos", price: "À DÉFINIR", period: "Licencia anual", cta: "Solicitar licencia" },
        pro: { name: "PRO", target: "Competición y Clubes", price: "À DÉFINIR", period: "Licencia anual", cta: "Contactar para PRO" }
      }
    },
    footer: {
      rights: "Todos los derechos reservados.",
      privacy: "Privacidad",
      terms: "Términos"
    }
  }, null, 2),

  'src/i18n/locales/it.json': JSON.stringify({
    nav: {
      features: "Funzionalità",
      pricing: "Piani e Prezzi",
      assistant: "Assistente IA",
      intelligence: "Bird Intelligence",
      licenses: "Licenze LMSE",
      download: "Download",
      documentation: "Documentazione",
      faq: "Domande Frequenti"
    },
    home: {
      hero: {
        badge: "Soluzione Professionale per Allevatori",
        title: "Controlla il tuo allevamento. Segui ogni esemplare. Decidi con precisione.",
        subtitle: "La piattaforma software progettata per gli allevatori di canarini. Gestione completa, genetica mendeliana e cartella sanitaria.",
        ctaDownload: "Scarica Bird Academy",
        ctaFeatures: "Scopri le funzionalità",
        offlineGuarantee: "100% Autonomo e Offline — I tuoi dati rimangono esclusivamente sul tuo dispositivo."
      },
      offline: {
        badge: "Riservatezza e Resilienza",
        title: "Architettura 100% locale e offline-first",
        subtitle: "Nessun server remoto necessario per l'attività quotidiana dell'allevamento.",
        cards: [
          { title: "Dati locali sovrani", description: "Le schede rimangono sul tuo computer." },
          { title: "Disponibilità in voliera", description: "Lavora ovunque senza dipendere da una connessione." },
          { title: "Utilizzo mirato di internet", description: "Solo per il download e la licenza LMSE." }
        ]
      },
      featuresGrid: {
        badge: "Moduli Integrati",
        title: "Strumenti dedicati a ogni fase dell'allevamento",
        subtitle: "Un ambiente professionale studiato per allevatori esigenti.",
        items: [
          { slug: "birds", title: "Gestione Esemplari", desc: "Schede individuali, anellini, gabbie e stato biologico." },
          { slug: "breeding", title: "Riproduzione e Cove", desc: "Controllo coppie, deposizione uova, speratura e svezzamento." },
          { slug: "health", title: "Registro Sanitario", desc: "Trattamenti terapeutici, osservazioni e quarantena." },
          { slug: "genetics", title: "Genetica Mendeliana", desc: "Calcolo mutazioni, consanguineità e standard COM." },
          { slug: "intelligence", title: "Bird Intelligence", desc: "Motore analitico deterministico con punteggi e allarmi." },
          { slug: "assistant", title: "Assistente IA Locale", desc: "Ragionamento locale contestualizzato senza fuga di dati." }
        ]
      }
    },
    pricingPage: {
      header: {
        badge: "Piani e Licenze",
        title: "Scegli l'edizione più adatta al tuo allevamento",
        subtitle: "Licenza chiara e gestita localmente tramite LMSE.",
        disclaimer: "I prezzi ufficiali saranno confermati al lancio commerciale."
      },
      tiers: {
        free: { name: "FREE", target: "Principianti", price: "Gratis", period: "Illimitato", cta: "Scarica Gratis" },
        premium: { name: "PREMIUM", target: "Allevatori attivi", price: "À DÉFINIR", period: "Licenza annuale", cta: "Richiedi licenza" },
        pro: { name: "PRO", target: "Competizioni e Club", price: "À DÉFINIR", period: "Licenza annuale", cta: "Contatta per PRO" }
      }
    },
    footer: {
      rights: "Tutti i diritti riservati.",
      privacy: "Privacy",
      terms: "Termini"
    }
  }, null, 2),

  // 5. Composants Layout
  'src/components/layout/Header.tsx': `import Link from "next/link";
import { type Locale } from "@/i18n/config";
import LanguageSelector from "./LanguageSelector";

interface HeaderProps {
  lang: Locale;
  dict: any;
}

export default function Header({ lang, dict }: HeaderProps) {
  const navItems = [
    { href: \`/\${lang}/#features\`, label: dict.nav.features },
    { href: \`/\${lang}/pricing\`, label: dict.nav.pricing },
    { href: \`/\${lang}/#assistant\`, label: dict.nav.assistant },
    { href: \`/\${lang}/#intelligence\`, label: dict.nav.intelligence },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="container-custom flex items-center justify-between h-16">
        <Link href={\`/\${lang}\`} className="flex items-center gap-3 font-bold text-xl text-brand-dark">
          <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white font-extrabold shadow-sm">
            BA
          </div>
          <span>Bird Academy</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-dark">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSelector currentLang={lang} />
          <Link
            href={\`/\${lang}/#download\`}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark rounded-lg shadow-sm transition-all"
          >
            {dict.nav.download}
          </Link>
        </div>
      </div>
    </header>
  );
}
`,

  'src/components/layout/LanguageSelector.tsx': `"use client";

import { usePathname, useRouter } from "next/navigation";
import { type Locale, i18n } from "@/i18n/config";

export default function LanguageSelector({ currentLang }: { currentLang: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Locale;
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLang;
    router.push(segments.join("/"));
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="appearance-none bg-brand-surface border border-brand-border text-brand-dark text-xs font-semibold py-1.5 px-3 pe-6 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        {i18n.locales.map((loc) => (
          <option key={loc} value={loc}>
            {i18n.localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
`,

  'src/components/layout/Footer.tsx': `import { type Locale } from "@/i18n/config";

export default function Footer({ dict }: { lang: Locale; dict: any }) {
  return (
    <footer className="border-t border-brand-border bg-white py-8 text-xs text-brand-muted">
      <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 Bird Academy. {dict.footer.rights}</div>
        <div className="flex gap-6">
          <span className="hover:text-brand-dark cursor-pointer">{dict.footer.privacy}</span>
          <span className="hover:text-brand-dark cursor-pointer">{dict.footer.terms}</span>
        </div>
      </div>
    </footer>
  );
}
`,

  // 6. App Root Layout & Pages
  'src/app/[lang]/layout.tsx': `import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { i18n, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@/styles/globals.css";

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return {
    title: \`Bird Academy — \${dict.home.hero.title}\`,
    description: dict.home.hero.subtitle,
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const { lang } = params;
  if (!i18n.locales.includes(lang)) notFound();

  const dict = await getDictionary(lang);
  const direction = i18n.localeDirections[lang] || "ltr";

  return (
    <html lang={lang} dir={direction}>
      <body className="flex flex-col min-h-screen bg-brand-surface text-brand-dark antialiased">
        <Header lang={lang} dict={dict} />
        <main className="flex-grow">{children}</main>
        <Footer lang={lang} dict={dict} />
      </body>
    </html>
  );
}
`,

  'src/app/[lang]/page.tsx': `import { type Locale, i18n } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Link from "next/link";

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function HomePage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  const { hero, offline, featuresGrid } = dict.home;

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 border-b border-brand-border bg-gradient-to-b from-white to-brand-surface pb-16">
        <div className="container-custom space-y-6 max-w-4xl text-center mx-auto">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            {hero.badge}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-dark leading-tight">
            {hero.title}
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a
              href="#download"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-md transition-all text-sm text-center"
            >
              {hero.ctaDownload}
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-brand-dark bg-white hover:bg-gray-50 border border-brand-border shadow-sm transition-all text-sm text-center"
            >
              {hero.ctaFeatures}
            </a>
          </div>
          <div className="pt-4 text-xs font-medium text-brand-muted">
            🛡️ {hero.offlineGuarantee}
          </div>
        </div>
      </section>

      {/* 100% Offline Section */}
      <section className="container-custom">
        <div className="bg-brand-dark text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold text-brand-secondary uppercase">{offline.badge}</span>
            <h2 className="text-2xl sm:text-3xl font-bold">{offline.title}</h2>
            <p className="text-sm text-gray-300">{offline.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offline.cards.map((card: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-xs">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-white text-base">{card.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container-custom space-y-8">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase text-brand-primary">{featuresGrid.badge}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{featuresGrid.title}</h2>
          <p className="text-sm text-brand-muted">{featuresGrid.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresGrid.items.map((it: any) => (
            <div key={it.slug} className="p-6 rounded-2xl bg-white border border-brand-border shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center font-bold text-brand-primary text-sm">
                ✦
              </div>
              <h3 className="text-base font-bold text-brand-dark">{it.title}</h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Download Anchors */}
      <section id="download" className="container-custom">
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Téléchargement Multiplateforme</h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            Package binaire officiel testé et distribué avec intégrité SHA-256 garantie.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button className="px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold shadow-sm">
              Windows (.exe / Setup)
            </button>
            <button className="px-5 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-dark text-xs font-semibold">
              Android (.apk)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
`,

  'src/app/[lang]/pricing/page.tsx': `import { type Locale, i18n } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function PricingPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  const { header, tiers } = dict.pricingPage;

  return (
    <div className="py-16 container-custom space-y-12">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
          {header.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">{header.title}</h1>
        <p className="text-sm text-brand-muted">{header.subtitle}</p>
        <p className="text-xs text-brand-muted italic">* {header.disclaimer}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(tiers).map(([key, t]: [string, any]) => (
          <div key={key} className="bg-white rounded-2xl border border-brand-border p-8 flex flex-col justify-between shadow-sm space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">{t.target}</span>
              <h2 className="text-2xl font-bold text-brand-dark">{t.name}</h2>
              <div className="text-3xl font-extrabold text-brand-dark">{t.price}</div>
              <div className="text-xs text-brand-muted">{t.period}</div>
            </div>
            <button className="w-full py-3 rounded-xl font-semibold text-xs bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors">
              {t.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
`,

  // 7. Redirection Racine
  'src/app/page.tsx': `import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/fr');
}
`,

  // 8. Tests Unitaires (Vitest)
  'tests/unit/i18n.test.ts': `import { describe, it, expect } from 'vitest';
import fr from '@/i18n/locales/fr.json';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';
import es from '@/i18n/locales/es.json';
import itLocale from '@/i18n/locales/it.json';

const dictionaries: Record<string, Record<string, unknown>> = { fr, en, ar, es, it: itLocale };

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? \`\${prefix}.\${key}\` : key;
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getAllKeys(val as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('Audit Qualité & Intégrité Multilingue (i18n)', () => {
  const referenceKeys = getAllKeys(fr);

  Object.entries(dictionaries).forEach(([lang, dict]) => {
    it(\`[\${lang.toUpperCase()}] doit contenir exactement toutes les clés de référence (FR)\`, () => {
      const currentKeys = getAllKeys(dict);
      const missingKeys = referenceKeys.filter((k) => !currentKeys.includes(k));
      expect(missingKeys).toHaveLength(0);
    });

    it(\`[\${lang.toUpperCase()}] aucune clé ne doit être vide\`, () => {
      const checkEmpty = (o: Record<string, unknown>) => {
        for (const [_, val] of Object.entries(o)) {
          if (typeof val === 'string') {
            expect(val.trim().length).toBeGreaterThan(0);
          } else if (typeof val === 'object' && val !== null) {
            checkEmpty(val as Record<string, unknown>);
          }
        }
      };
      checkEmpty(dict);
    });
  });

  it('Les tarifs non définis doivent respecter strictement [À DÉFINIR]', () => {
    ['fr', 'en', 'ar', 'es', 'it'].forEach((lang) => {
      const dict = dictionaries[lang] as any;
      expect(dict.pricingPage.tiers.premium.price).toBe('À DÉFINIR');
      expect(dict.pricingPage.tiers.pro.price).toBe('À DÉFINIR');
    });
  });
});
`,

  // 9. Tests E2E (Playwright)
  'tests/e2e/website-functional.spec.ts': `import { test, expect } from '@playwright/test';

test.describe('Vérification Fonctionnelle & Responsive', () => {
  test('TC-WEB-001: Accueil accessible et titre valide', async ({ page }) => {
    await page.goto('/fr');
    await expect(page).toHaveTitle(/Bird Academy/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('TC-WEB-013: Support strict du mode RTL pour la langue Arabe (/ar)', async ({ page }) => {
    await page.goto('/ar');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });

  test('TC-WEB-005: Page Tarifs avec éditions FREE, PREMIUM et PRO', async ({ page }) => {
    await page.goto('/fr/pricing');
    await expect(page.locator('text=FREE')).toBeVisible();
    await expect(page.locator('text=PREMIUM')).toBeVisible();
    await expect(page.locator('text=PRO')).toBeVisible();
  });
});
`
};

// Écriture physique de tous les fichiers
Object.entries(files).forEach(([relPath, content]) => {
  const fullPath = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(` ✅ Créé : ${relPath}`);
});

console.log('\n✨ Projet initialisé avec succès !');
console.log('👉 Vous pouvez maintenant lancer :');
console.log('   npm install');
console.log('   npm run dev      (pour lancer le site)');
console.log('   npm run test:unit (pour tester les dictionnaires i18n)');
console.log('   npm run test:e2e  (pour lancer Playwright)\n');
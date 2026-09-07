# Architecture du Projet - CanariGestion v1.2.0

Ce document spécifie les standards, l'organisation structurelle et les règles architecturales de l'application **CanariGestion** (Bird Academy).

---

## 1. Organisation des Dossiers

L'arborescence du projet suit une structure modulaire stricte, séparant l'infrastructure globale, les composants d'interface utilisateur, la gestion d'état et le système de design :

```text
/
├── public/                 # Ressources statiques (images, logos)
├── src/
│   ├── components/         # Composants React modulaires (Vues et widgets réutilisables)
│   │   ├── design-system/  # Éléments structuraux communs du Design System
│   │   ├── Canaris.tsx     # Gestion du cheptel et de l'arbre généalogique
│   │   ├── Couples.tsx     # Formation et suivi des accouplements
│   │   ├── Dashboard.tsx   # Tableau de bord analytique et moteur d'alertes
│   │   └── ...             # Autres vues fonctionnelles du projet
│   ├── context/            # Fournisseurs de contexte globaux (Thème, Langue)
│   │   ├── LanguageContext.tsx  # Contexte de traduction et de direction RTL
│   │   └── ThemeContext.tsx     # Contexte de thème (Light, Dark, System)
│   ├── data/               # Données de graine (Seeds) et d'initialisation locale
│   ├── theme/              # Fichiers de configuration des Design Tokens
│   │   ├── colors.ts       # Palette chromatique & couleurs sémantiques (Light/Dark)
│   │   ├── spacing.ts      # Espacements standardisés & dimensions de boutons/icônes
│   │   ├── typography.ts   # Échelles de polices & styles de textes
│   │   ├── radius.ts       # Arrondis standardisés de bordures
│   │   ├── shadows.ts      # Élévations & ombres
│   │   ├── animations.ts   # Catalogue des animations communes
│   │   └── index.ts        # Point d'entrée de centralisation des Tokens
│   ├── utils/              # Fonctions d'assistance & dictionnaires de traduction
│   │   ├── genealogy.ts    # Algorithmes de calcul du COI (Consanguinité)
│   │   └── translations.ts # Base de connaissances de traduction globale (FR, EN, AR, ES, IT)
│   ├── App.tsx             # Coordinateur d'état de l'application & routage
│   ├── index.css           # Feuille de style globale (Tailwind v4 & animations)
│   ├── main.tsx            # Point d'entrée de l'arbre de rendu DOM React
│   └── types.ts            # Déclarations de types & interfaces TypeScript partagées
├── ARCHITECTURE.md         # Ce document de référence architecture
└── CONTRIBUTING.md         # Guide de contribution et d'ajout de fonctionnalités
```

---

## 2. Responsabilités des Composants

*   **`App.tsx` (Le Cœur d'État) :**
    *   Coordonne l'ensemble de l'état de l'application (Cheptel, cages, transactions, diagnostics santé, pontes).
    *   Gère la persistance synchrone avec le `localStorage` du navigateur.
    *   Sert de routeur interne en commutant les onglets de navigation actifs.
    *   Fournit les modificateurs d'état validant les règles d'élevage.
*   **`Dashboard.tsx` (Moteur d'Alertes Biologiques) :**
    *   Calcule dynamiquement les prévisions d'éclosion des œufs (J+13 après ponte) et génère des alarmes.
    *   Analyse le calendrier des sevrages requis (30 jours de vie des oisillons).
    *   Affiche des métriques financières et de santé agrégées.
*   **`Canaris.tsx` (Fiches & Généalogie) :**
    *   Permet l'ajout, la modification et le classement des fiches d'oiseaux.
    *   Intègre le visualiseur interactif de l'arbre généalogique sur 3 générations.
    *   Affiche dynamiquement le coefficient de consanguinité (COI).
*   **`ThemeSelector.tsx` & `LanguageSelector.tsx` :**
    *   Interagissent respectivement avec `useTheme` et `useLanguage` pour piloter les états système généraux.

---

## 3. Organisation du Design System

Le Design System de CanariGestion repose sur des **Design Tokens** centralisés sous `src/theme/`. Aucun composant ne doit déclarer de valeurs de style en dur (comme des codes hexadécimaux ou des valeurs de marge) lorsque celles-ci peuvent être centralisées.

### Composants des Tokens :
1.  **Colors (`colors.ts`) :** Fournit les couleurs système (`COLORS`) et la palette de classes sémantiques (`SEMANTIC_COLORS`) avec support complet du mode sombre (`dark:bg-*`, `dark:text-*`).
2.  **Spacing (`spacing.ts`) :** Définit les espacements fluides et standardisés sous forme d'une carte (`SPACING_MAP`), ainsi que les dimensions uniformes d'icônes et de boutons.
3.  **Typography (`typography.ts`) :** Déclare les ensembles de classes applicables aux titres (`h1`, `h2`, `h3`, `h4`), corps de texte (`body`) et libellés (`label`).
4.  **Radius (`radius.ts`) :** Contient les arrondis autorisés des conteneurs et boutons.
5.  **Shadows (`shadows.ts`) :** Configure les niveaux d'élévation et d'ombres ainsi que les priorités d'affichage (`Z_INDEX`).
6.  **Animations (`animations.ts`) :** Centralise les classes d'animations communes s'appuyant sur les définitions de keyframes du projet.

---

## 4. Architecture d'Internationalisation (i18n) & Support RTL

L'internationalisation repose sur un système robuste de traduction locale géré par le contexte `LanguageProvider` :

*   **Hook `useLanguage` :** Expose la langue active, la fonction d'interpolation de variables `t(key, variables)` et l'indicateur directionnel `isRtl`.
*   **Interpolation dynamique :** Permet d'injecter des données au sein des chaînes traduites (ex: `t('coiWarning', { coi: 12.5 })`).
*   **Gestion RTL (Arabe) :**
    *   L'infrastructure applique dynamiquement l'attribut `dir="rtl"` sur l'élément racine du document `html` lorsque la langue sélectionnée est l'Arabe (`ar`).
    *   Les grilles, alignements de texte (`text-left` / `text-right` devenant sémantiques ou gérés par l'alignement flex standard) et l'inversion d'icônes de navigation s'adaptent naturellement.

---

## 5. Règles de Développement & Conventions de Nommage

### Conventions de Nommage :
*   **Composants React :** Toujours au format `PascalCase` (ex: `ThemeSelector.tsx`, `LanguageSelector.tsx`).
*   **Hooks et Utilitaires :** Toujours au format `camelCase` (ex: `useTheme.ts`, `genealogy.ts`).
*   **Design Tokens & Constantes :** Toujours au format `UPPER_SNAKE_CASE` (ex: `SEMANTIC_COLORS`, `BORDER_RADIUS`).

### Règles d'or du Code :
1.  **Pas de Rendus Infinis :** Ne jamais mettre à jour un état directement dans le corps d'un composant React. Les effets (`useEffect`) doivent être stabilisés en limitant les dépendances aux valeurs primitives.
2.  **Sécurité Généalogique :** Ne jamais permettre la suppression d'un oiseau s'il possède une descendance enregistrée dans le système afin de préserver l'intégrité des calculs génétiques.
3.  **Traitement d'Unicité :** L'identifiant national (numéro de bague) d'un canari doit être unique dans l'ensemble de la base de données locale.

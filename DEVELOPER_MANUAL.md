# MANUEL DÉVELOPPEUR & ARCHITECTURE — BIRD ACADEMY ENTERPRISE (v1.0)

**Version :** 1.0.0 Enterprise  
**Destinataires :** Équipe de Développement, Architètes Logiciels, Maintainers Codebase  
**Stack Tech :** TypeScript 5.8, React 19.0, Vite 6.2, TailwindCSS 4.1, Motion 12.23, Electron 43.3, Capacitor 8.5

---

## 1. Structure du Repository & Organisation des Dossiers

```
d:\app canaris\28+\
├── src/
│   ├── business/                # Moteurs Métier pures (BirdEngine, BreedingEngine, etc.)
│   ├── components/              # Vue composants principaux (Canaris.tsx, Reproduction.tsx)
│   │   └── design-system/       # Composants Primitives du Design System (AppTable, AppCard, etc.)
│   ├── context/                 # LanguageContext (i18n & RTL) & ThemeContext (Light/Dark)
│   ├── data/                    # Baseline default data & species registry
│   ├── features/                # Modules Fonctionnels Decouplés (Domain Driven)
│   │   ├── administration/      # Back Office Enterprise (Store, Services, Components)
│   │   ├── analytics/           # Matrix analytics & graphics
│   │   ├── birds/               # Repositories & Services Oiseaux
│   │   ├── breeding/            # Repositories & Services Reproduction & Pontes
│   │   ├── finance/             # Ledger Dépenses & Ventes
│   │   ├── genetics/            # Wright Graph Engine & Punnett Squares
│   │   ├── habitat/             # Volières, Bâtiments & Cages
│   │   ├── health/              # Soins & Registre Vétérinaire
│   │   ├── licensing/           # Moteur de Licences LMSE & Validators
│   │   ├── platform/            # Diagnostics & Telemetry
│   │   ├── quality/             # QA Validation Engine & Benchmarks
│   │   └── reproduction/        # Lifecycle Manager, Nursery, Hatching, Chicks
│   ├── storage/                 # LocalStorageProvider avec isolation de clés
│   ├── theme/                   # Tokens graphiques, couleurs HSL et styles
│   └── utils/                   # Dictionnaires de traduction i18n
├── tests/                       # 27 Fichiers de Tests Automatisés (Node Test Runner)
├── dist/                        # Bundle de Production Web Vite & Assets PWA
├── release-electron/            # Exécutables Windows (.exe)
└── android/                     # Projet Gradle Android (.apk)
```

---

## 2. Rôles et Architecture des Moteurs Principaux

### 🏛️ 1. Pattern Repository & Storage Isolation (`src/storage/`)
- Tous les accès au stockage local sont encapsulés par `LocalStorageProvider`.
- **Isolation des clés :** Chaque clé est préfixée automatiquement (`bird_academy_*`), évitant toute collision avec d'autres applications web sur la même origine.
- **Support Fallback :** En cas d'inaccessibilité de `localStorage` dans l'environnement de test Node.js, un dictionnaire en mémoire prend le relais sans faire crasher l'application.

### 🔑 2. Moteur de Licences LMSE (`src/features/licensing/`)
- **Structure des clés :** Format `LMSE-XXXX-XXXX-XXXX-XXXX`.
- **Validation hors-ligne :** `LicenseValidator` et `LMSEValidator` vérifient cryptographiquement la validité de la clé, la date d'expiration, les flags de tier et le nombre de postes autorisés.
- **Empreinte Matérielle :** `DeviceFingerprintEngine` calcule le hash unique de la machine pour l'association et la dissociation d'appareils.

### 🧬 3. Moteur Génologique & Coefficient de Wright (`src/features/genetics/`)
- `PedigreeRelations.ts` implémente l'algorithme récursif de Wright pour calculer le coefficient de consanguinité (COI) en analysant les chemins d'ancêtres communs sur un graphe orienté acyclique (DAG).
- L'analyse est mémorisée avec invalitadation automatique lors de la modification d'un oiseau.

### 🛡️ 4. Centre d'Administration Enterprise (`src/features/administration/`)
- **`AdminAuditService` :** Service singleton de journalisation d'audit enregistrant chaque action administrative avec horodatage ISO, ID de l'intervenant, rôle, catégorie et résultat.
- **`AdminUserStore`, `AdminOrgStore`, `SupportTicketStore` :** Stores d'administration légers utilisant la persistance isolée `bird_academy_admin_*`.

---

## 3. Standard Design System

Tous les composants graphiques doivent **exclusivement** consommer les primitives du Design System situées dans `src/components/design-system/` :
- `AppTable` : Tableaux de données avec tri, pagination et support état vide.
- `AppCard` : Conteneurs de cartes avec bordures et ombres standardisées.
- `AppButton` : Boutons d'action avec gestion d'état de chargement et variantes (`primary`, `secondary`, `outline`, `danger`, `success`).
- `AppModal` : Fenêtres modales accessibles avec piège à focus et fermeture par touche `Échap`.
- `AppTabs` : Barres d'onglets réactives avec animations Motion.
- `AppBadge` : Badges de statut et d'étiquettes.
- `AppAlert` : Bannières d'alerte sémantiques (`info`, `success`, `warning`, `danger`).
- `AppInput` & `AppSelect` : Champs de saisie formulaires avec focus rings accessibles et gestion des erreurs.

---

## 4. Stratégie de Test et Validation

### Commande de Linting TypeScript :
```bash
npm run lint
```
Vérifie la conformité TypeScript stricte (`tsc --noEmit`).

### Commande d'Exécution de l'Ensemble des Tests Unitaires & d'Intégration :
```bash
npm test
```
Exécute les 203 assertions sur les 27 fichiers de test via le runner natif de Node.js (`node --import tsx --test`).

### Commande de Compilation Production :
```bash
npm run build
```
Compile le bundle optimisé Web/PWA via Vite (`vite build`).

### Commande de Compilation des Fichiers Exécutables Windows & Android :
```bash
powershell -ExecutionPolicy Bypass -File .\build-all-executables.ps1
```
Génère les installateurs Windows `.exe` dans `release-electron/` et le package Android `.apk` dans `android/app/build/outputs/apk/debug/app-debug.apk`.

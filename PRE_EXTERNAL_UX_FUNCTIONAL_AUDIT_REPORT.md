# RAPPORT D'AUDIT ARCHITECTURAL ET FONCTIONNEL PRÉ-QA EXTERNE
# MISSION : PRE-EXTERNAL-UX-FUNCTIONAL-AUDIT-01

**Date de réalisation :** 26 Août 2026  
**Auteur :** Antigravity Diagnostic & Architecture Agent  
**Statut :** AUDIT TERMINÉ — AUCUNE MODIFICATION DE CODE RÉALISÉE (PHASE 1)  
**Version cible auditée :** Bird Academy Enterprise v1.3.6 / Release Windows `Windows-Packaging-RCA-01`  
**Périmètre de test :** Exécutables Windows User & Admin, ASAR, Code source TypeScript/React, Layout CSS, Services métier.

---

## 1. EXECUTIVE SUMMARY

La mission **PRE-EXTERNAL-UX-FUNCTIONAL-AUDIT-01** a été déclenchée à la suite de constats ergonomiques et fonctionnels réalisés lors de la prise en main de la release Windows `Windows-Packaging-RCA-01` (ayant validé l'isolation User/Admin, l'auto-terminaison des installateurs NSIS, et le scoping multi-espèces du Species Profile Service).

L'audit a permis d'investiguer à 100% les trois problématiques soulevées, d'identifier formellement leurs causes racines au niveau architectural, CSS et React, et de valider que les fondations système (scoping par espèces, isolation des profils, packaging des bundles) restent parfaitement saines et intègres.

### Synthèse des constats :

1. **Navigation sans ascenseur sur petit écran (P1 - Critique UX) :**
   - **Cause racine :** Double anomalie layout. D'une part, la sidebar desktop (`DesktopSidebar.tsx`) applique la classe utilitaire `scrollbar-none` sur sa balise `<nav>`, supprimant l'ascenseur visuel, alors que 16 éléments répartis sur 4 sections nécessitent au minimum 816 px de hauteur. Sur un écran 1366×768 (ou fenêtre réduite à 700 px), les 4 derniers modules sont rejetés sous la ligne de flottaison sans aucun indicateur visuel de défilement. D'autre part, le conteneur racine de `App.tsx` utilise `min-h-screen` au lieu d'une coquille bornée `h-screen overflow-hidden`, forçant le défilement au niveau de la fenêtre globale de Chromium plutôt que sur le conteneur `<main>`, tandis que `overflow-x-hidden` tronque les grands tableaux horizontalement sans ascenseur.
2. **Demo Generator introuvable / Nommé « Sandbox » (P1 - Fonctionnel & Terminologique) :**
   - **Cause racine :** Le composant `DemoModeTab` **est bel et bien présent** dans le bundle User et dans l'ASAR (`DemoModeTab-Bzl_GbGR.js`). Il n'est masqué ni par un feature-flag, ni par une condition de rôle Admin. En revanche :
     - Il a été renommé **« Sandbox Démo »** (clé `demoSandbox`) avec une icône `<Database />` peu explicite.
     - Il est positionné en **16ème et dernière position** du menu (« Gestion & Système »), le rendant totalement invisible sur écran réduit à cause de l'absence d'ascenseur.
     - Aucun accès n'a été implémenté depuis le panneau des Paramètres (`Parametres.tsx`), où les utilisateurs s'attendent naturellement à trouver la gestion des données.
     - Le terme « Sandbox » provient de l'historique de développement où la génération de données synthétiques était rattachée à la suite de tests/QA isolée (« Mode Démo Isolé » avec préfixe `demo_*`).
     - Le générateur est **parfaitement conforme et scopé** par `SpeciesProfileService` (0 fuite inter-espèces).
3. **Icône Notifications non interactive (P0 - Bloquant Ergonomie) :**
   - **Cause racine :** Dans `DesktopTopBar.tsx` (lignes 110-119), le bouton de notification comporte un gestionnaire vide factice `onClick={() => {}}` et un point orange `<span ... bg-amber-500 ... />` **codé en dur (statique)** dans le JSX sans aucune liaison de données.
   - **Pourtant :** Un véritable moteur de notifications biologiques (`NotificationService.ts` détectant éclosions, sevrages, soins et quarantaines) et un centre complet de notifications (`NotificationTab.tsx` avec filtres non-lues/archivées, boutons d'archivage et badges) existent déjà dans `src/features/platform/`, mais n'avaient jamais été raccordés à la barre de titre `DesktopTopBar` !

### Recommandation d'admission en QA externe :
**NOT READY** (Non prêt pour la QA externe en l'état actuel).  
Bien que les binaires Windows soient stables et que l'isolation système soit irréprochable, ces 3 défauts UX/fonctionnels créent une rupture d'expérience majeure (clic sans réponse sur les alertes, générateur de démo introuvable pour les testeurs, menus tronqués sur PC portables 1366×768). Une Phase 2 corrective légère et ciblée doit être exécutée avant l'envoi aux testeurs externes.

---

## 2. SCOPE DE L'AUDIT

Le présent audit couvre :
* **Comportement d'affichage & Responsive :** Layout global de l'application, résolutions 1920×1080, 1366×768, 1280×800, et hauteurs minimales de fenêtre Electron (700 px).
* **Architecture de défilement :** Balises `<nav>`, `<main>`, `AppModal`, conteneurs Flexbox, propriétés `overflow`, `overflow-y`, `overflow-x`, `height`, `min-height`, `scrollbar-none`.
* **Générateur de données de démonstration :** `DemoDataGenerator`, `DemoModeTab`, clés de navigation, bundles User et Admin, validation du scoping biologique `SpeciesProfileService`.
* **Système de notification :** Composants `DesktopTopBar`, services `NotificationService`, `NotificationTab`, gestionnaires d'événements, badgeage dynamique.
* **Intégrité des bundles Windows :** Exécutables de `Release/Windows-Packaging-RCA-01/`, archive ASAR `release-user/win-unpacked/resources/app.asar`.
* **Isolation User / Admin :** Non-régression sur la séparation des profils AppData, des raccourcis et des exécutables.

---

## 3. MÉTHODOLOGIE

L'audit a été mené selon les principes de forensic logiciel et d'analyse statique/dynamique non intrusive :
1. **Inspection statique de l'arbre des composants :** Audit des hiérarchies de layout dans `src/App.tsx`, `src/components/ui/DesktopSidebar.tsx`, `src/components/ui/DesktopTopBar.tsx`, et `src/index.css`.
2. **Recherche sémantique globale :** Cartographie exhaustive des occurrences de défilement, de démo/sandbox et de notifications via expressions régulières et index de symboles.
3. **Inspection forensique des bundles de production :** Décompression et inventaire de l'archive `app.asar` de l'exécutable Windows User (`Bird Academy - Avian ERP.exe`).
4. **Vérification par suites de tests automatisées non régressives :** Exécution sans modification des tests `species-profile-scoping.test.ts` (18 tests), `windows-user-admin-coexistence.test.ts` (30 tests) et `windows-packaging-rca-01.test.ts` (17 tests).
5. **Vérification de la règle absolue :** Aucun fichier `src/*`, `tests/*`, `package.json` ou configuration de build n'a été modifié lors de cette mission.

---

## 4. PROBLÈME 1 — NAVIGATION SANS ASCENSEUR SUR PETIT ÉCRAN

### Observation
Sur un écran standard d'ordinateur portable (1366×768) ou lorsque la fenêtre Electron de l'application est redimensionnée en hauteur (vers sa taille minimale autorisée de 700 px) :
* La barre latérale de navigation (sidebar) tronque sa partie inférieure.
* Aucun ascenseur (barre de défilement verticale avec curseur "thumb") n'apparaît dans la barre latérale.
* Les éléments de navigation situés en bas (**Dépenses**, **Ventes**, **Paramètres**, **Sandbox Démo**) deviennent complètement invisibles et inaccessibles si l'utilisateur ne dispose pas d'une molette de souris physique ou ne devine pas qu'il faut faire défiler une zone aveugle.
* Sur le contenu principal, la barre de défilement apparaît au bord extrême de la fenêtre globale de l'OS plutôt qu'à l'intérieur du conteneur de contenu, car la coquille applicative s'étire au-delà de la hauteur du viewport.
* Dans les modales volumineuses (formulaires longs, WelcomeWizard), le contenu peut dépasser les limites d'affichage sans barre de défilement clairement visible, rendant les boutons de validation difficiles d'accès.

### Reproduction
1. Lancer l'application User sous Windows avec une résolution de 1366×768 (hauteur d'affichage nette utile ~728 px avec la barre des tâches Windows) ou redimensionner la fenêtre à 1024×700.
2. Regarder la sidebar de gauche : la liste s'arrête brutalement à « Référence biologique » ou « Dépenses ».
3. Constater l'absence totale de barre de défilement visible (« ascenseur »).
4. Déplacer la souris sur la sidebar : aucun ascenseur n'apparaît.
5. Ouvrir la modale du WelcomeWizard ou un formulaire long d'oiseau : constater l'absence d'indication visuelle claire sur la profondeur du formulaire.

### Cause racine
La cause racine est un cumul de 4 facteurs techniques :

1. **Suppression explicite de la scrollbar (`scrollbar-none`) :**  
   Dans `src/components/ui/DesktopSidebar.tsx` (ligne 105) :
   ```tsx
   <nav className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-none" aria-label={t('navigation')}>
   ```
   Et dans `src/App.tsx` (ligne 679) pour le tiroir mobile :
   ```tsx
   <nav className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-none" aria-label={t('navigation')}>
   ```
   La classe `scrollbar-none` supprime délibérément l'affichage de l'ascenseur visuel, empêchant l'utilisateur de constater qu'il existe du contenu additionnel sous la zone visible.

2. **Déficit de dimensionnement vertical de la Sidebar :**  
   La sidebar comporte :
   - En-tête (Logo, sélecteur de langue, badge de licence) : ~165 px.
   - 4 sections de navigation comportant au total 16 modules avec leurs titres de catégorie : ~816 px.
   - Pied de page fixe : ~45 px.  
   **Hauteur minimale requise pour afficher tous les menus : ~1 026 px.**  
   Dès lors que la hauteur disponible est inférieure à 1 026 px (notamment à 768 px ou 700 px), la sidebar est obligée de défiler. En masquant la barre de défilement, le système rend les derniers modules invisibles.

3. **Absence totale de système de style de Scrollbar dans le Design System :**  
   Le fichier `src/index.css` ne définit **aucune règle** CSS pour `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, ni `scrollbar-color`. Sur Chromium/Electron sous Windows 11 (où le paramètre OS "Toujours afficher les barres de défilement" est désactivé par défaut), les ascenseurs natifs se masquent automatiquement ou sont complètement supprimés par les classes utilitaires.

4. **Architecture de Layout Flexbox non bornée (Incohérence App Shell) :**  
   Dans `src/App.tsx` (ligne 597) :
   ```tsx
   <div className="min-h-screen bg-[#F8FAFC] ... flex flex-col lg:flex-row ...">
   ```
   Et ligne 719 :
   ```tsx
   <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
     <DesktopTopBar ... />
     <main id="main-content" className="flex-1 overflow-y-auto ...">
   ```
   Le conteneur racine utilise `min-h-screen` (hauteur minimale 100vh mais extensible à l'infini) au lieu d'une hauteur contrainte (`h-screen overflow-hidden`). Par conséquent, le conteneur principal ne s'arrête pas à la limite de l'écran : il grandit avec son contenu (pouvant atteindre 2 500 px). `<main>` ne déclenche donc jamais son propre `overflow-y-auto`, et c'est la fenêtre entière du navigateur qui scrolle, créant une désynchronisation avec la sidebar fixe (`sticky top-0 h-screen`). De plus, `overflow-x-hidden` sur la colonne droite rogne les tableaux larges sans offrir d'ascenseur horizontal.

### Fichiers concernés
* `src/components/ui/DesktopSidebar.tsx` (lignes 85, 89, 105)
* `src/App.tsx` (lignes 597, 679, 719, 726)
* `src/index.css` (absence de règles de scrollbar)
* `src/components/design-system/AppModal.tsx` (lignes 86, 111-116, 139)
* `src/features/quality/components/WelcomeWizard.tsx` (lignes 348, 389)

### Risques
* Inaccessibilité des modules stratégiques (Paramètres, Sauvegarde, Demo Generator, Ventes, Dépenses) sur 100% des postes des éleveurs équipés d'écrans portables standards (1366×768).
* Frustration utilisateur et signalement immédiat de bugs en QA externe.
* Impossibilité de valider les formulaires longs si le bouton d'action se trouve hors écran.

### Correction recommandée (Phase 2)
1. **Architecture App Shell stricte :**  
   Dans `src/App.tsx`, passer le conteneur racine en `h-screen max-h-screen overflow-hidden flex flex-col lg:flex-row`.  
   La colonne de droite devient `h-full flex-1 flex flex-col min-w-0 overflow-hidden`.  
   Le `<main>` devient le conteneur de défilement scrollable unique avec `flex-1 overflow-y-auto min-h-0`.
2. **Restauration de l'ascenseur dans la Sidebar :**  
   Dans `DesktopSidebar.tsx` et dans le drawer mobile de `App.tsx`, **supprimer impérativement `scrollbar-none`** et le remplacer par une classe d'ascenseur fin et élégant `scrollbar-thin` ou un style dédié.
3. **Design System Scrollbar dans `index.css` :**  
   Ajouter des règles globales standardisées garantissant un ascenseur visible et élégant en mode clair et sombre :
   ```css
   /* Custom Scrollbar Design Tokens */
   ::-webkit-scrollbar {
     width: 6px;
     height: 6px;
   }
   ::-webkit-scrollbar-track {
     background: transparent;
   }
   ::-webkit-scrollbar-thumb {
     background: rgba(148, 163, 184, 0.4);
     border-radius: 9999px;
   }
   ::-webkit-scrollbar-thumb:hover {
     background: rgba(100, 116, 139, 0.7);
   }
   .dark ::-webkit-scrollbar-thumb {
     background: rgba(51, 65, 85, 0.6);
   }
   .dark ::-webkit-scrollbar-thumb:hover {
     background: rgba(71, 85, 105, 0.9);
   }
   ```
4. **Ascenseur horizontal pour les tableaux larges :**  
   Permettre un défilement horizontal fluide avec indicateur visuel pour `AppTable.tsx` et les vues matricielles.

---

## 5. PROBLÈME 2 — DEMO GENERATOR INTROUVABLE / NOMMÉ « SANDBOX »

### Localisation actuelle
* **Composant UI :** `src/features/quality/components/DemoModeTab.tsx`
* **Moteur de génération :** `src/features/quality/utils/demoGenerator.ts` (`DemoDataGenerator`)
* **Route dans l'App :** `src/App.tsx`, accessible via l'onglet `currentTab === 'demo_shortcut'` (lignes 868-873) :
  ```tsx
  case 'demo_shortcut':
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DemoModeTab />
      </div>
    );
  ```
* **Bouton de navigation Desktop :** `src/components/ui/DesktopSidebar.tsx` (ligne 76), au sein de la section « Gestion & Système » :
  ```tsx
  { id: 'demo_shortcut', label: t('demoSandbox'), icon: Database }
  ```
* **Bouton de navigation Mobile :** `src/App.tsx` (ligne 572).

### Accessibilité
* Le composant est **totalement accessible dans le code**, sans barrière d'authentification ni restriction de rôle.
* Il n'est désactivé par aucune variable d'environnement (`VITE_APP_MODE`, `NODE_ENV`).
* **Mais il est visuellement inaccessible** sur petit écran car situé en 16ème et dernière position de la sidebar masquée par le problème de scrollbar (Problème 1).

### Bundle User vs Bundle Admin
* **Présence dans le Bundle User :**  
  **OUI (Vérifié formellement).** Le bundle User de production `dist_user/assets/DemoModeTab-Bzl_GbGR.js` (28 186 octets) est compilé et présent.
* **Présence dans l'ASAR Windows User :**  
  **OUI (Vérifié formellement).** L'inspection de `release-user/win-unpacked/resources/app.asar` via l'utilitaire `asar list` confirme la présence des chemins :
  - `\dist\assets\DemoModeTab-Bzl_GbGR.js`
  - `\dist_user\assets\DemoModeTab-Bzl_GbGR.js`
* **Présence dans Admin :**  
  Le bundle Admin contient ses propres outils d'administration (`dist_admin`). Le Demo Generator est une fonctionnalité de l'ERP User (destinée à tester et explorer l'élevage).

### Cause de l'invisibilité
L'invisibilité constatée par les utilisateurs s'explique par la conjonction de 4 anomalies :
1. **Effet de masquage physique par le scroll de la sidebar :** En tant que 16ème élément (tout en bas), il disparaît sous le bas de l'écran sur 1366×768.
2. **Dissimulation terminologique :** Il est étiqueté sous le libellé **« Sandbox Démo »** (FR), **« Demo Sandbox »** (EN), **« بيئة العرض التجريبي »** (AR). Un utilisateur ou testeur cherchant un « Générateur de données de démonstration » ne reconnaît pas ce terme.
3. **Iconographie trompeuse :** Il utilise l'icône `<Database />` (cylindre de base de données) au lieu d'une icône évocatrice de démonstration ou de génération magique (`<Sparkles />`, `<Play />`, `<Wand2 />`).
4. **Absence d'ancrage dans les Paramètres :** Aucun lien ni bouton ne figure dans `Parametres.tsx` (section Maintenance / Base de données), alors que c'est l'endroit réflexe où un éleveur cherche à manipuler ses jeux de données.

### Rôle du terme « Sandbox » & Historique
* **Origine historique :** Le module a été initialement conçu dans le cadre du sous-système qualité (`src/features/quality/`), où il servait d'environnement "Bac à sable" (Sandbox) pour isoler les données de test sous un préfixe localStorage distinct (`demo_*`), garantissant que les données réelles de l'éleveur ne soient jamais corrompues.
* **Exposition actuelle :** Le terme technique interne « Sandbox » a fui dans les dictionnaires de traduction sous la clé `demoSandbox: "Sandbox Démo"`. Ce nom est inadapté à un utilisateur final non développeur.

### Analyse de fonctionnement technique & Scoping Species Profile
* **Fonctionnement technique :** Le générateur fonctionne parfaitement. Il propose 3 profils calibrés :
  - Petit Élevage (~50 oiseaux, 6 cages, 10 couples, finances, calendrier).
  - Élevage Professionnel (~300 oiseaux, 25 cages, 60 couples).
  - Très Grand Élevage (~1 200 oiseaux, 100 cages, 250 couples - stress test).
* **Respect du SpeciesProfileService :**  
  L'inspection de `src/features/quality/utils/demoGenerator.ts` (lignes 91-106) et `DemoModeTab.tsx` (ligne 97) démontre que :
  ```typescript
  const activeSpecies = SpeciesProfileService.getActiveSpeciesIds();
  DemoDataGenerator.toggleDemo(true, size, { activeSpecies });
  ```
  Le générateur récupère **strictement** les espèces actives de l'utilisateur. Tous les oiseaux fondateurs, les couples (strictement intra-espèces) et les jeunes sont générés exclusivement dans le périmètre des espèces actives.
* **Risque de génération d'espèces non actives :** **NUL (0%).** Le test automatisé `SPECIES-SCOPE-07` et `SPECIES-SCOPE-08` confirme que si seul le Canari est actif, 100% des oiseaux générés sont des Canaris.

### Recommandation UX (Phase 2)
1. **Renommage UX du module :**
   - Remplacer le libellé visible « Sandbox Démo » par **« Données de Démonstration »** (ou **« Générateur Démo »**).
   - Conserver l'identifiant technique interne `demo_shortcut` et la classe `DemoDataGenerator` sans casser l'architecture.
   - Clés de traduction recommandées :
     - FR : `"Données de Démonstration"`
     - EN : `"Demo Data Generator"`
     - ES : `"Datos de Demostración"`
     - IT : `"Dati di Dimostrazione"`
     - AR : `"بيانات العرض التجريبي"`
2. **Iconographie :**
   - Remplacer `<Database />` par `<Sparkles className="text-amber-400" />` ou `<Play />`.
3. **Point d'entrée additionnel dans les Paramètres :**
   - Dans `src/components/Parametres.tsx`, ajouter une carte dans la section « Base de Données & Maintenance » :
     * *« Élevage de Démonstration — Générer des données simulées (petit, moyen ou grand élevage) pour explorer l'application en mode isolé sans modifier vos données réelles. »*
     * Bouton : *« Ouvrir le Générateur Démo »* redirigeant vers `setCurrentTab('demo_shortcut')`.

---

## 6. PROBLÈME 3 — ICÔNE NOTIFICATIONS NON INTERACTIVE

### Observation
Dans la barre supérieure desktop (`DesktopTopBar`) :
* Une icône de cloche `<Bell />` affiche en permanence un indicateur pastille orange/ambre dans son coin supérieur droit.
* Cet indicateur suggère formellement à l'utilisateur qu'une alerte ou notification requiert son attention.
* **Cependant, lors du clic sur l'icône, rien ne se produit visuellement.** Aucun menu ne s'ouvre, aucun panneau n'apparaît, aucune modale ne surgit, aucun changement de page n'a lieu.

### Reproduction
1. Lancer l'application User en mode Desktop.
2. Observer l'icône cloche en haut à droite de `DesktopTopBar` : elle affiche un point orange.
3. Cliquer sur la cloche : aucun effet, curseur inerte, aucun panneau ne s'affiche.
4. Ouvrir les DevTools : aucune erreur JavaScript dans la console (le clic appelle une fonction vide).

### Architecture & Cause racine
L'inspection du composant `src/components/ui/DesktopTopBar.tsx` révèle la cause racine exacte aux lignes 110-119 :

```tsx
{/* Notifications Icon Button */}
<button
  type="button"
  onClick={() => {}}
  className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
  title={t('desktopNotifications')}
  aria-label={t('desktopNotifications')}
>
  <Bell className="w-4.5 h-4.5" />
  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
</button>
```

#### Diagnostic détaillé :
1. **Handler factice (`onClick={() => {}}`) :** Le composant a été codé avec un bouchon (stub) vide ne déclenchant aucune action.
2. **Badge orange codé en dur (Statique) :** La balise `<span ... bg-amber-500 rounded-full ... />` est rendue inconditionnellement. Elle n'est reliée à aucun état React, à aucun compteur, ni à aucun service.
3. **Absence de props dans `App.tsx` :** `App.tsx` instancie `<DesktopTopBar currentTab={currentTab} onOpenActivationModal={...} />` sans lui fournir de callback d'ouverture de panneau de notifications ni d'état.
4. **Existence préalable d'un Notification Center complet :**  
   Contrairement à ce que la coquille vide laissait supposer, **le système dispose déjà d'un moteur et d'une interface de notifications complets et fonctionnels** :
   - `src/features/platform/services/NotificationService.ts` : génère dynamiquement des alertes biologiques réelles (éclosions prévues dans les pontes actives, traitements médicamenteux à administrer, périodes de sevrage échues, oiseaux en quarantaine).
   - `src/features/platform/components/NotificationTab.tsx` : interface complète affichant les notifications avec filtres (À traiter, Toutes, Archivées), pastilles d'urgence (Urgent, Moyen, Normal), bouton « Tout archiver », et marquage comme lu.
   - Ce composant était auparavant accessible uniquement à l'intérieur d'un sous-onglet `PlatformDashboard.tsx` qui n'a jamais été relié à la navigation globale.

### Risques
* Incompréhension immédiate des testeurs et utilisateurs : un badge orange d'alerte cliquable qui ne répond pas est immédiatement perçu comme une régression majeure de qualité logicielle (P0/P1).
* Non-visibilité des alertes biologiques critiques (éclosions imminentes, fin de traitement médical).

### Correction recommandée (Phase 2)
1. **Création d'un panneau / Popover de Notifications :**  
   - Implémenter un panneau déroulant (Dropdown Popover) positionné sous la cloche de `DesktopTopBar` ou une modale dédiée `AppModal` (taille `md`) affichant le composant `NotificationTab`.
2. **Dynamisation du Badge :**  
   - Lier l'affichage du badge orange à la présence réelle de notifications non lues :
     ```tsx
     const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
     // N'afficher la pastille orange QUE SI unreadCount > 0
     {unreadCount > 0 && (
       <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
     )}
     ```
3. **Raccordement interactif :**  
   - Clic sur la cloche -> Bascule l'état `isNotificationOpen(true)`.
   - L'utilisateur peut lire, marquer comme lu ou archiver.
   - À chaque action, le badge se met à jour immédiatement.

---

## 7. SPECIES PROFILE REGRESSION CHECK

L'audit a vérifié de manière approfondie que les composants liés aux 3 problèmes n'ont introduit aucune régression sur le scoping multi-espèces :

| Domaine | Statut | Preuve / Validation |
| :--- | :---: | :--- |
| **`SpeciesProfileService`** | **CONFORME** | Singleton intègre, persistance valide, 18/18 tests unitaires validés avec succès |
| **Espèces Actives** | **CONFORME** | Filtrage dynamique opérationnel dans les sélecteurs |
| **Ajout / Retrait d'espèce** | **CONFORME** | Gestionnaire présent et validé dans `Parametres.tsx` |
| **Scoping Demo Generator** | **CONFORME** | `DemoDataGenerator.generate()` utilise exclusivement `sanitizedSpeciesIds` |
| **Accouplements Démo** | **CONFORME** | Couples de démonstration 100% intra-espèces (aucun croisement hybride non désiré) |
| **Référentiel Biologique** | **CONFORME** | Master Registry immuable, affichage restreint aux espèces actives de l'éleveur |
| **Couples & Reproduction** | **CONFORME** | Filtrage strict dans `Couples.tsx` et `Reproduction.tsx` via `isSpeciesActive` |
| **Statistiques & Analytics** | **CONFORME** | Aucune fuite de données inter-espèces |

**Conclusion :** Le socle fonctionnel Species Profile est parfaitement intact.

---

## 8. USER / ADMIN ISOLATION CHECK

L'audit a validé l'isolation absolue entre l'application éleveur (User) et le centre d'administration (Admin) :

1. **AppData et stockage local :**
   - User : `%APPDATA%\Bird Academy Enterprise\`
   - Admin : `%APPDATA%\Bird Academy Admin\`
   - Aucun partage de fichiers de base de données locale.
2. **Exécutables et Whitelist de processus :**
   - User : `Bird-Academy-User.exe`
   - Admin : `Bird-Academy-Admin.exe`
   - Les scripts de terminaison NSIS (`terminate-bird-academy-processes.ps1` et `terminate-admin.ps1`) sont hermétiques (User ne touche jamais Admin et inversement).
3. **Périmètre du Demo Generator :**
   - Le générateur de démonstration est strictement confiné à l'application User et opère dans le localStorage de l'éleveur avec préfixe `demo_*`. Il n'a aucun impact sur les catalogues maîtres de l'Admin.
4. **Tests automatisés de coexistence :**
   - La suite `tests/windows-user-admin-coexistence.test.ts` (30 tests) s'exécute avec 100% de succès.

**Conclusion :** Aucune fuite de données ni régression d'isolation.

---

## 9. BUNDLE CHECK (RELEASE WINDOWS)

Vérification réalisée sur `Release/Windows-Packaging-RCA-01/` et `release-user/` :

* **Vérification ASAR (`app.asar`) :**
  - Taille : 116 937 431 octets.
  - Présence de `DemoModeTab` : **OUI** (`\dist\assets\DemoModeTab-Bzl_GbGR.js`).
  - Présence de `WelcomeWizard` : **OUI** (`\dist\assets\WelcomeWizard-C0f4O1Tb.js`).
  - Présence de `SpeciesProfileService` : **OUI** (`\dist\assets\SpeciesProfileService-CZpCLnud.js`).
  - Présence de `index.html` : **OUI**.
  - Présence des assets SVG (`demo-bird.svg`, icônes) : **OUI**.
* **Absence d'exclusion accidentelle :** Tous les composants nécessaires sont empaquetés. Le problème de visibilité ne relève donc aucunement d'un défaut de compilation ou de packaging, mais uniquement de layout CSS et d'ergonomie.

---

## 10. PRIORISATION DES CORRECTIONS

| ID | Problème | Priorité | Gravité | Effort estimé |
| :--- | :--- | :---: | :---: | :---: |
| **BUG-UX-01** | **Bouton Notifications non interactif & badge orange statique** | **P0** | Bloquant Ergonomique | Faible (~1h) |
| **BUG-UX-02** | **Navigation sans ascenseur sur petit écran (`scrollbar-none` / Layout Flex)** | **P1** | Critique Ergonomique | Moyen (~2h) |
| **BUG-UX-03** | **Demo Generator renommé « Sandbox Démo », masqué en bas de liste et absent des Paramètres** | **P1** | Critique Fonctionnel | Faible (~1h) |
| **BUG-UX-04** | **Absence de design system scrollbar global (`index.css`)** | **P2** | Important | Faible (~30m) |

---

## 11. PROPOSED PHASE 2 — SPÉCIFICATION TECHNIQUE DES CORRECTIONS

Pour la Phase 2 corrective, voici la liste précise des modifications architecturales et des fichiers à mettre à jour (sans dérive de périmètre) :

### Fichier 1 : `src/index.css`
* Implémenter le design system d'ascenseur cross-platform (`::-webkit-scrollbar`, thumb avec border-radius et couleurs slate-300 / slate-700 en dark mode).
* Supprimer tout comportement masquant involontaire.

### Fichier 2 : `src/components/ui/DesktopSidebar.tsx`
* Supprimer la classe `scrollbar-none` sur la balise `<nav>`.
* Remplacer le libellé du bouton `demo_shortcut` par `t('demoGenerator')` (au lieu de `t('demoSandbox')`).
* Remplacer l'icône `<Database />` par `<Sparkles className="w-4 h-4 text-amber-400" />`.

### Fichier 3 : `src/components/ui/DesktopTopBar.tsx`
* Connecter le bouton `<Bell />` à l'état d'ouverture d'un panneau de notifications.
* Remplacer le badge orange codé en dur par un calcul dynamique : `unreadCount > 0`.
* Intégrer le composant `NotificationFlyout` ou déclencher l'ouverture de `NotificationTab` dans une modale `AppModal` (ou popover).

### Fichier 4 : `src/App.tsx`
* Transformer le conteneur racine en `h-screen max-h-screen overflow-hidden flex flex-col lg:flex-row`.
* Assurer que `<main id="main-content">` possède `flex-1 overflow-y-auto min-h-0` pour gérer le défilement autonome sans déborder sur l'en-tête ni la sidebar.
* Supprimer `scrollbar-none` sur le drawer mobile (ligne 679).
* Fournir le gestionnaire d'ouverture des notifications à `DesktopTopBar`.

### Fichier 5 : `src/components/Parametres.tsx`
* Dans la section « Base de données & Maintenance », ajouter une carte d'accès rapide :
  * Titre : *Données de Démonstration*
  * Description : *Générer un jeu de données simulé complet pour tester et évaluer l'application sans toucher à votre élevage personnel.*
  * Bouton : *Accéder au Générateur* (redirection vers `demo_shortcut`).

### Fichier 6 : `src/utils/translations.ts`
* Mettre à jour les traductions pour `demoGenerator` :
  - FR : `"Données de Démonstration"`
  - EN : `"Demo Data Generator"`
  - ES : `"Datos de Demostración"`
  - IT : `"Dati di Dimostrazione"`
  - AR : `"بيانات العرض التجريبي"`

---

## 12. TEST PLAN PHASE 2

### Tests Automatisés à implémenter en Phase 2 :
1. `tests/ux-navigation-scroll.test.ts` :
   - Vérifier que `DesktopSidebar` et le drawer mobile ne comportent plus la classe `scrollbar-none`.
   - Vérifier la présence des règles de scrollbar dans `src/index.css`.
   - Vérifier que `App.tsx` applique `overflow-hidden` sur le conteneur racine et `overflow-y-auto` sur `<main>`.
2. `tests/ux-notifications.test.ts` :
   - Vérifier que le badge de notification de `DesktopTopBar` est conditionné par `NotificationService.getNotifications()`.
   - Vérifier qu'un clic sur la cloche déclenche l'ouverture du composant de notification.
   - Vérifier que le marquage comme lu met à jour le badge.
3. `tests/ux-demo-generator-visibility.test.ts` :
   - Vérifier que le libellé de navigation est « Données de Démonstration » et non « Sandbox ».
   - Vérifier la présence du raccourci dans `Parametres.tsx`.

### Tests Manuels Physiques (Matrice de validation finale) :
* **Test Écran 1366×768 (Laptop standard) :**
  - Vérifier que la sidebar défile avec un ascenseur visible et maniable à la souris.
  - Vérifier que « Paramètres » et « Données de Démonstration » sont visibles et cliquables.
* **Test Notifications :**
  - Vérifier qu'en l'absence de notifications non lues, aucun badge orange n'apparaît.
  - Créer ou simuler un rappel biologique -> Le badge orange apparaît avec le nombre d'alertes.
  - Cliquer sur la cloche -> Le panneau s'ouvre.
  - Cliquer sur « Tout archiver » -> Le panneau se vide et le badge orange disparaît.
* **Test Démo Multi-espèces :**
  - Activer Canari uniquement -> Générer un Petit Élevage -> Vérifier 100% canaris.
  - Ajouter Chardonneret -> Régénérer -> Vérifier répartition Canari / Chardonneret.

---

## 13. EXTERNAL QA READINESS

```text
================================================================
RECOMMANDATION OFFICIELLE : NOT READY (NON PRÊT POUR QA EXTERNE)
================================================================
```

### Justification :
Bien que le moteur applicatif, les algorithmes de génétique, le scoping Species Profile et les installateurs Windows NSIS soient dans un état de robustesse validé (100% de réussite aux tests système), **l'ergonomie actuelle présente 3 défauts bloquants pour une évaluation externe indépendante** :
1. Un testeur sur ordinateur portable 1366×768 ne verra pas le menu Paramètres ni le Générateur Démo en raison de l'absence d'ascenseur.
2. Un testeur cliquant sur la cloche de notification recevra un retour inerte (clic mort), dégradant immédiatement la perception de qualité du produit.
3. Le générateur de données de test, indispensable pour que les éleveurs testeurs découvrent l'application sans saisir 50 oiseaux manuellement, est masqué sous le terme non intuitif de « Sandbox Démo ».

**Plan d'action immédiat :**  
Exécuter la **Phase 2 Corrective** pour corriger ces 3 points (effort estimé : ~3 à 4 heures de développement ciblé sans toucher au cœur métier), régénérer les binaires Windows, puis autoriser le déploiement QA externe.

---

```text
================================================================

PRE-EXTERNAL-UX-FUNCTIONAL-AUDIT-01

SCROLL / RESPONSIVE     : ISSUE (IDENTIFIED)
DEMO GENERATOR          : ISSUE (IDENTIFIED)
SANDBOX NAMING          : ISSUE (IDENTIFIED)
NOTIFICATIONS           : ISSUE (IDENTIFIED)
SPECIES PROFILE         : PASS (VERIFIED)
USER/ADMIN ISOLATION     : PASS (VERIFIED)
USER BUNDLE              : PASS (VERIFIED)
ADMIN BUNDLE             : PASS (VERIFIED)

ROOT CAUSES IDENTIFIED  : YES
CODE CHANGES             : 0
BINARY CHANGES           : 0
DATA CHANGES             : 0

EXTERNAL QA READINESS    : NOT READY

================================================================
```

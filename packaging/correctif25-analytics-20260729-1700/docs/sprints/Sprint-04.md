# Bird Academy - Sprint 4 Documentation
## Module Oiseaux V2 - Refonte Complète & Architecture Native

### 1. Synthèse du Sprint
Le Sprint 4 introduit une refonte fonctionnelle complète et une modernisation profonde du module **Oiseaux (V2)** de Bird Academy, s'appuyant rigoureusement sur l'architecture robuste et propre posée lors du Sprint 3 ( Feature Modules, Repository Pattern, Business Engine, Services et Storage Layer ).

Chaque composant a été conçu dans l'excellence pour servir de **modèle architectural de référence** pour les modules suivants (Habitats, Reproduction, Santé, Élevage manuel, etc.).

---

### 2. Architecture Technique Interne

Le module Oiseaux a été scindé en couches d'abstractions claires avec séparation stricte des responsabilités :

```
[UI Layer: Canaris.tsx] 
       │
       ▼
[Service Layer: BirdService.ts] ──> [ActivityLogger.ts] (Events timeline tracking)
       │
       ├──> [Business Layer: BirdEngine.ts] (Pure validation, COI, automatic age)
       │
       ▼
[Repository Layer: BirdRepository.ts] (Logical archiving, migrations, data retrieval)
       │
       ▼
[Storage Layer: appStorage.ts] (Safe LocalStorage wrappers)
```

1. **Couche UI (`Canaris.tsx`)** : Consomme uniquement `BirdService`. Gère un état local fluide et ergonomique pour l'affichage de la table, le panneau des filtres combinés, le formulaire V2 et la gestion des galeries et documents d'élevage.
2. **Service Layer (`BirdService`)** : Point d'entrée unique de la logique pour la vue. Orchestre le `BirdEngine` et le `BirdRepository`. Écrit automatiquement des événements d'historique dans `ActivityLogger`.
3. **Business Layer (`BirdEngine`)** : Moteur de calcul pur, isolé de tout stockage. Calcule le taux de consanguinité (COI), l'âge biologique précis, et procède à la validation stricte des formulaires (ex. unicité de la bague, intégrité des liens de parenté, disponibilité de reproduction).
4. **Repository Layer (`BirdRepository`)** : Accède aux primitives de stockage via des interfaces typées. Intègre une migration transparente des anciennes données et gère l'archivage logique (`archived: boolean`) à la place de la suppression physique destructrice.

---

### 3. Fonctionnalités Modernisées (V2)

#### Partie 1 — Tableau professionnel (`AppTable`)
- Intégration de `AppTable` avec colonnes dynamiques : Photo, Bague (badge typé), Nom, Espèce, Race, Sexe (badges de couleur), Âge formaté, Localisation (gabbia) et Statut.
- Tri dynamique sur toutes les colonnes cliquables (ascendant / descendant).
- Pagination propre et performante gérée dynamiquement.
- Sélection multiple par cases à cocher avec barre d'actions groupées (Archivage, Duplication, Suppression groupée).
- Ergonomie réactive s'adaptant instantanément sur mobile sous forme de fiches d'identité esthétiques avec boutons tactiles de plus de 44px de hauteur.

#### Partie 2 — Recherche avancée & Filtres combinables
- Panel de filtres rétractable pour ne pas encombrer l'écran.
- Filtres combinables multiples : Nom, Espèce, Catégorie, Race, Sexe, Cage, Disponibilité de reproduction et inclusion/exclusion des oiseaux archivés.

#### Partie 3 — Formulaire Oiseau V2
- Formulaire organisé en 4 sous-onglets logiques pour éviter la surcharge cognitive :
  1. **Identité** : Nom, bague unique, espèce, catégorie, race, mutation, couleur, sexe, date de naissance.
  2. **Origine** : Statut d'acquisition, éleveur d'origine, ancêtres biologiques et nourriciers.
  3. **Localisation** : Établissement, zone, volière, cage, compartiment.
  4. **État & Observations** : Statut sanitaire/reproduction et notes libres.
- Validation en direct à la soumission : bloque l'enregistrement si des contraintes métier sont violées, avec messages d'erreurs clairs positionnés sous les entrées concernées.
- Calculateur d'âge dynamique affiché en temps réel au changement de la date de naissance.

#### Partie 4 — Analyse de consanguinité (COI)
- Intégration du calculateur d'inbreeding dans l'onglet Origine du formulaire de croisement.
- Évaluation automatique du coefficient de consanguinité (COI) entre le père et la mère sélectionnés.
- Message informatif visuel (Vert pour croisement sûr, Orange/Rouge pour consanguinité élevée) sans bloquer la flexibilité de l'éleveur.

#### Partie 7 — Historique & Chronologie d'activité
- Timeline interactive listant tous les événements historiques d'un oiseau (Naissance, Acquisition, Changements de cages, Mises en couple, etc.).
- Les données proviennent directement d'un filtrage intelligent des logs d'événements de `ActivityLogger`.

#### Partie 8 — Galerie Photos
- Album d'images local avec sélection de l'image de couverture principale.
- Les nouvelles photos sont encodées localement en Base64 et étiquetées avec la mention "☁️ Local / Prêt Cloud" pour faciliter les futures synchronisations.
- Possibilité d'opérer une suppression logique d'image ou d'ajuster l'image principale en un clic.

#### Partie 9 — Documents Associés
- Association de pièces jointes (Certificats, Analyses vétérinaires, Factures, Documents libres).
- Modèle de données extensible persistant au sein de l'objet oiseau (`documents: []`) avec boutons de retrait sécurisés.

#### Parties 11-13 — Performance & Accessibilité
- Utilisation optimisée de `useMemo`, `useCallback` et du découpage de composants pour prévenir les re-rendus inutiles.
- Multilinguisme intégré pour le français, l'anglais, l'arabe, l'espagnol et l'italien, incluant le support du mode RTL pour l'arabe.
- Contraste de texte, espacements de design system et conformité aux exigences d'accessibilité.

---

### 4. Dette Technique & Décisions d'Architecture

- **Archivage Logique** : Pour garantir la traçabilité des données d'élevage, la suppression physique d'un oiseau a été remplacée par un archivage logique via la propriété `archived: true` dans la majorité des flux. Les données historiques de généalogie restent ainsi intactes.
- **Stockage Base64 des Images** : Les photos sont stockées sous format Base64 pour le stockage local. À terme, cette architecture devra migrer vers un stockage par adresses URI (Firebase Storage ou Cloud Storage) pour ne pas saturer l'espace alloué au LocalStorage.
- **Lazy Initialization des Services** : Les dépendances vers le stockage et les journaux de bord sont résolues de manière paresseuse, protégeant l'application contre les plantages au démarrage si des variables sont absentes.

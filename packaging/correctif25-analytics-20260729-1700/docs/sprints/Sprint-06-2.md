# Sprint 6.2: Module Reproduction Intelligence — Ponte & Incubation

Ce document décrit les aspects techniques, fonctionnels, et l'architecture mis en œuvre au cours du Sprint 6.2 pour construire le cycle biologique complet de la ponte et de l'incubation dans Bird Academy.

---

## 1. Vision Fonctionnelle (Cycle Biologique du Canari)
Le cycle biologique de la reproduction a été modélisé en respectant rigoureusement les contraintes scientifiques de la canariculture :
* **Ponte (Clutch) :** Enregistrement de la date de début de ponte, calcul à la volée du nombre d'œufs et des taux statistiques.
* **Gestion Individuelle des Œufs :** Chaque œuf est une entité métier indépendante possédant son propre statut (`Pondu`, `En incubation`, `Miré`, `Fécondé`, `Clair`, `Cassé`, `Mort`, `Éclos`, etc.), sa bague/position, son poids, ses observations et son journal d'inspections.
* **Incubation & Calendrier Biologique :** Calcul automatique des jalons biologiques à partir du démarrage de l'incubation :
  * **J+6 (Mirage conseillé) :** Pour confirmer la fertilité de l'œuf (Changement de statut vers `Fécondé` ou `Clair`).
  * **J+10 (Contrôle d'incubation) :** Validation intermédiaire.
  * **J+13 (Éclosion théorique) :** Détecteur d'overdue (alerte de retard si $J > 13$ et non éclos).
  * **J+15 (Sécurité biologique) :** Fin maximale d'incubation.

---

## 2. Architecture Modulaire
Les nouveaux sous-domaines ont été placés dans `/src/features/reproduction/` :

```
/src/features/reproduction/
├── clutches/                # Gestion des Pontes
│   ├── components/          # ClutchList, ClutchWizard, BiologicalLifecycleManager
│   ├── repositories/        # ClutchRepository (Local Storage via appStorage)
│   ├── services/            # ClutchService (Gestion métier des pontes)
│   └── types/               # Modèles et Enums des Pontes
├── eggs/                    # Gestion Individuelle des Œufs
│   ├── components/          # EggGrid
│   ├── repositories/        # EggRepository
│   ├── services/            # EggService (Inspections, mirages, historique individuel)
│   └── types/               # Egg, EggTimelineEvent, EggInspection
├── incubation/              # Gestion de l'Incubation
│   ├── components/          # IncubationCalendarView
│   ├── repositories/        # IncubationRepository
│   ├── services/            # IncubationService (Milestones, calendriers biologiques)
│   └── types/               # Incubation, IncubationBiologicalCalendar
├── components/              # ReproductionDashboard (KPIs, Alertes Biologiques)
└── utils/                   # bioTranslations.ts (Support linguistique complet)
```

---

## 3. Repositories et Persistance (`appStorage`)
Pour éviter toute perte de données, tous les repositories utilisent le wrapper central d'accès sécurisé `appStorage` :
* `ClutchRepository` persiste la liste sous la clé `reproduction_clutches`.
* `EggRepository` persiste les œufs et leur historique d'inspection sous les clés `reproduction_eggs` et `reproduction_egg_timeline`.
* `IncubationRepository` persiste les sessions d'incubation actives sous la clé `reproduction_incubations`.

---

## 4. Performance & Tableau de Bord (Partie 10)
Un écran d'accueil global a été intégré à l'onglet **Performance & Alertes** :
* **KPIs Temps Réel :** Calcul dynamique du taux de fertilité (%), taux d'éclosion prévisionnel (%), taux d'échec global (%), nombre de pontes actives et d'œufs totaux.
* **Alertes Biologiques :** Détection automatique et affichage des mirages attendus (œufs d'âge $\ge 6$ jours non mirés) ou des éclosions en retard (incubations dépassées).
* **Recherche & Filtrage :** Filtre par statut de ponte, tri par date, nombre d'œufs ou fertilité, et moteur de recherche unifié.

---

## 5. Rétrocompatibilité & Audit (Activity Logger)
Toutes les actions majeures de ponte, d'ajout d'œufs, de mirage et de démarrage d'incubation sont auditées de façon sécurisée via l' `ActivityLogger` global en utilisant des codes d'événements officiels comme `PONTE_ADD` et `PONTE_UPDATE`.
Les anciens couples reproducteurs créés lors des Sprints précédents sont entièrement préservés et peuvent être sélectionnés pour démarrer un nouveau cycle à tout moment.

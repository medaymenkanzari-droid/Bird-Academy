# Sprint 5 — Module Habitat V2 & Smart QR Foundation
## Contexte & Objectifs
En tant que Lead Software Engineer de Bird Academy, l'objectif du Sprint 5 était de moderniser en profondeur la gestion des cages et des espaces d'hébergement via l'introduction du **Module Habitat V2** et d'initier la fondation des **Smart QR Codes** pour l'inventaire physique et le futur scan mobile.

Ce sprint a été réalisé dans le respect le plus strict des règles d'architecture existantes (Repository Pattern, Business Engines, Storage Layer, ActivityLogger) tout en assurant une rétrocompatibilité complète (sans aucune perte de données pour les élevages utilisant l'ancien format `cages` numérique).

## Réalisations Techniques

### 1. Modélisation Domaine & Données (`/src/types/habitat.ts`)
- Mise en œuvre de l'arbre structurel complet :
  `Breeding Facility ➔ Zones ➔ (Aviaries | Cages) ➔ Compartments` et `QuarantineArea` autonome.
- Modélisation des entités `DeplacementRecord` (mouvement contrôlé) et `QuarantineRecord` (fiches sanitaires).
- Intégration de l'interface `Canari` avec des clés étrangères optionnelles vers chaque niveau structurel.

### 2. Couche Stockage & Rétrocompatibilité (`HabitatRepository.ts`)
- Isolation via le préfixe unique `ba_`.
- Implémentation du système de **migration automatique à la demande** : transfert instantané des anciennes cages vers le format V2 sans régression ni duplication.
- Système de **synchronisation bidirectionnelle** : toute modification appliquée à une Cage V2 est automatiquement rétro-propagée vers le stockage des anciennes cages numériques, garantissant qu'aucune autre partie de l'application (Couples, Reproduction) ne soit brisée.
- Support du multi-signature / méthode overloading pour préserver l'API héritée (`number` ID) tout en exposant l'API V2 (UUID).

### 3. Moteur Métier & Règles de Validation (`HabitatEngine.ts`)
- Validation stricte des capacités maximales autorisées.
- Validation de l'arbre de cohérence hiérarchique (pas de boucles cycliques, assignations cohérentes).
- Calculs agrégés des capacités physiques réelles et de l'occupation à chaque niveau de l'arborescence.
- Détection visuelle et logique de la surcharge (overload) en temps réel.

### 4. Systèmes Applicatifs (Mouvements & Quarantaines)
- **Système de déplacements contrôlés :** Chaque mouvement d'oiseau génère un enregistrement pérenne (`DeplacementRecord`) avec origine, destination, motif, auteur et date, et émet un événement `HABITAT_MOVE` dans l'historique d'activité globale.
- **Système de quarantaine professionnel :** Prise en charge complète des périodes d'isolement préventif/curatif, calcul des dates de sortie estimées, enregistrement des traitements associés, prolongations de durée de rétention et retour contrôlé en cages saines.

### 5. Smart QR Foundation
- Intégration de la librairie standard et type-safe `qrcode`.
- Création d'un manager découplé `QRCodeManager` pour formater l'identifiant unique `BA:TYPE:UUID` sans pollution par les données métier volatiles.
- Prise en charge des actions de téléchargement haute-définition (SVG, PNG) et d'impression d'étiquettes à code-barres personnalisées.

### 6. Interface Utilisateur & Design System
- Unification totale dans l'onglet **Cages / Habitats**.
- Vue d'arborescence hiérarchique dynamique avec indicateurs de capacité.
- Tableau professionnel doté de tris multicritères, recherche instantanée, et filtres combinables.
- Formulaires d'ajouts rapides gérés via des boîtes modales harmonisées au Design System existant.
- Traduction intégrale de toutes les interfaces dans les 5 langues officielles (FR, EN, AR RTL, ES, IT).

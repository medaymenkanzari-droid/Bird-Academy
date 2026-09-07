# BIRD ACADEMY - SPRINT 6.3 REPORT
## CYCLE DE VIE : ÉCLOSION, POUSSINS, CROISSANCE & SEVRAGE

### 1. Objectifs du Sprint
Le Sprint 6.3 implémente la modélisation complète du cycle de vie biologique du canari :
*   **Éclosion** : Transition de l'œuf fécondé en un poussin viable via un assistant d'éclosion dédié.
*   **Suivi de Croissance** : Enregistrement régulier des courbes de poids, des jalons anatomiques (yeux ouverts, plumes visibles, sortie du nid, alimentation autonome) et des modes de nourrissage.
*   **Sevrage** : Parcours critique de transition alimentaire vers l'autonomie à J+30.
*   **Promotion Automatique** : Inscription du poussin sevré dans le registre principal des oiseaux (`Canari`) sans double saisie, en héritant de la génétique et de la filiation des parents biologiques.

### 2. Architecture Technique
Le module respecte le principe de haute cohésion et de faible couplage en divisant le domaine de la reproduction en sous-domaines indépendants :
*   `hatching/` : Processus d'éclosion assistée ou naturelle.
*   `chicks/` : Gestion de l'identité, des caractéristiques provisoires, et du statut biologique.
*   `growth/` : Logs pondéraux et d'étapes de développement.
*   `weaning/` : Dossier de sevrage et promotion.

Chacun de ces domaines contient sa propre structure propre conforme au patron architectural imposé :
*   `types/` : Contrats de données stricts en TypeScript.
*   `repositories/` : Abstraction de persistance via le stockage central `appStorage`.
*   `services/` : Moteurs de règles d'affaires et de calculs biologiques.
*   `engines/` : Fonctions pures de prévision et d'analyse.
*   `components/` : Éléments d'interface utilisateur stylisés avec Tailwind CSS et Recharts.

### 3. Gestion de l'Unicité et Évitement des Doublons
*   Aucune double saisie n'est requise.
*   Le poussin utilise une bague provisoire calculée à partir de la ponte et de l'œuf (`PROV-CLUTCH-EGG_NUM`).
*   Lors de la promotion vers le registre des adultes, le poussin est marqué comme `independent` et l'oiseau officiel est instancié avec une bague définitive unique via le `BirdService` central, garantissant l'intégrité de la base de données.

### 4. Journalisation des Activités (Activity Logger)
Toutes les actions majeures sont enregistrées au niveau de l'audit de l'académie :
*   `EventType.JEUNE_ADD` : Enregistrement de l'éclosion et création du poussin.
*   `EventType.JEUNE_WEAN` : Clôture réussie du sevrage.
*   `EventType.BIRD_ADD` : Promotion et transfert vers l'inventaire principal.

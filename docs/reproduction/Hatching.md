# ASSISTANT D'ÉCLOSION (HATCHING PROCESS)

L'assistant de éclosion fournit une interface unifiée pour documenter la transition de l'œuf à l'organisme vivant.

### 1. Intégration Visuelle
L'assistant est accessible directement depuis le panneau individuel de contrôle d'un œuf dans l'onglet **Pontes & Œufs** (`EggGrid`).
Dès qu'un œuf est sélectionné, si son statut le qualifie, une bannière dynamique invite l'utilisateur à déclarer son éclosion :
*   **Formulaire de Naissance** :
    *   *Date de éclosion* : Recommandée à J+13 de la ponte.
    *   *Poids de naissance* : Saisie scientifique (médiane à 1.5g pour un canari).
    *   *Mode d'assistance* : `none` (naturelle), `light` (coquille percée/aidée), `full` (extraction manuelle complète en cas de détresse respiratoire ou faiblesse).
    *   *Observations* : Remarques sur la vigueur, l'hydratation ou la présence de résidus de sac vitellin.

### 2. Flux de Traitement Biologique (`HatchingService.hatchEgg`)
Lors de la soumission du formulaire, les opérations transactionnelles suivantes sont exécutées :
1.  **Mise à jour de l'œuf** : Le statut de l'œuf passe à `Éclos`. Sa chronologie individuelle enregistre l'éclosion.
2.  **Création du dossier de éclosion** : Persistance du record de éclosion dans `HatchingRepository`.
3.  **Instanciation automatique du poussin** :
    *   Génération de la bague provisoire `PROV-XXXX-Y`.
    *   Création de l'identité du poussin (`Chick`) à l'état `growth` (En Croissance).
4.  **Log de poids initial** : Ajout d'un record de poids à la naissance dans `GrowthRepository`.
5.  **Événement de cycle de vie** : Enregistrement de l'événement d'éclosion dans la timeline du poussin.
6.  **Filiation** : Le poussin hérite instantanément du couple reproducteur d'origine (`pairId`).
7.  **Audit global** : Journalisation de l'événement dans le journal général de l'élevage.

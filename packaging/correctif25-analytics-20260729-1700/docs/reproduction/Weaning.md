# SEVRAGE ET PROMOTION (WEANING & INDEPENDENCE)

Le sevrage est l'étape ultime de transition biologique qui qualifie le poussin à devenir un individu autonome de l'élevage.

### 1. Finalisation du Sevrage (`WeaningService.finalizeWeaning`)
Dès que le poussin pèse au moins 16.5g et montre des aptitudes à se nourrir de graines sèches, le bouton **Finaliser le sevrage** devient accessible :
*   *Formulaire de Sevrage* :
    *   Date de fin de sevrage (médiane vers J+30).
    *   Poids final mesuré au sevrage.
    *   Statut : `success` (réussi), `abandoned` (prolongation), `failed` (décès accidentel tardif).
    *   Observations : Évaluation comportementale, intégration sociale.
*   En cas de succès, le statut du poussin devient `weaned`.

### 2. Promotion en Oiseau Indépendant (`WeaningService.promoteToIndependentBird`)
Un poussin marqué comme `weaned` peut être promu au statut de `independent` (Oiseau Adulte complet). Le formulaire de promotion requiert :
*   *Nom définitif* (par défaut hérité du poussin).
*   *Numéro de bague officiel unique* (bague métallique inviolable de l'année en cours).
*   *Cage de volière* d'affectation pour les jeunes sevrés.

### 3. Héritage Génétique et Traçabilité Sans Saisie
Pendant la promotion, le `WeaningService` instancie un oiseau dans le registre principal de l'académie en récupérant automatiquement toutes ses données généalogiques et phénotypiques :
*   **Filiation directe** : Liaison des champs biologiques `pere_id` et `mere_id` aux parents du couple reproducteur.
*   **Hérédité phénotypique** : L'oiseau hérite de manière innée des attributs dominants de ses parents :
    *   *Espèce* (ex: Canari).
    *   *Race* (ex: Couleur, Posture, Chant).
    *   *Mutation* (ex: Classique, Opal, Ino).
    *   *Couleur de base* & *Facteur*.
*   **Origine** : Le champ d'observations de l'oiseau de l'inventaire principal garde l'historique complet, liant son éclosion d'œuf à son couple fondateur pour une traçabilité totale sur plusieurs générations.

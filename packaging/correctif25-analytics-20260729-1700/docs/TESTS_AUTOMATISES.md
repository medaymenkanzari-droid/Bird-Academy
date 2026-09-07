# Tests automatisés anti-régression

## Commande principale

```bash
npm test
```

Les suites protègent le service analytique de reproduction et le moteur central des habitats.

### Reproduction

- rupture de la base de démonstration `2 pontes / 9 œufs / 78 % / 43 % / 1 cycle actif` ;
- calcul incorrect sur des données partielles ;
- double comptage d'un cycle historique possédant plusieurs pontes ;
- fusion accidentelle des sources V1 et V2 ;
- mauvaise sélection de la source canonique ;
- comptage d'une incubation V2 terminée comme active ;
- écriture ou migration silencieuse pendant une lecture analytique.
- écran blanc provoqué par un couple historique migré sans nom personnalisé.

### Habitats

- calcul de capacité, occupation, places disponibles et surcharge ;
- compatibilité des identifiants de cage historiques et modernes ;
- absence de double comptage d'un même oiseau ;
- agrégation des cages et volières d'une zone ;
- isolement des différentes zones de quarantaine ;
- refus d'une affectation vers une cage pleine, archivée ou introuvable ;
- validation des capacités négatives et des relations structurelles invalides.

### Parents, couples et pedigree

- existence et sexe biologique des parents ;
- interdiction de l'auto-parenté, d'un parent commun aux deux rôles et des cycles généalogiques ;
- cohérence chronologique entre la naissance du parent et celle du descendant ;
- protection contre la suppression d'un parent référencé ;
- construction du pedigree et classification des frères, sœurs et demi-fratries ;
- coefficients de Wright pour oiseaux non apparentés et frère/sœur ;
- cohérence des sexes et disponibilité des partenaires d'un couple.

## Validation complète avant livraison

```bash
npm test
npm run lint
npm run build
```

Un changement ne doit être accepté que si ces trois commandes réussissent.

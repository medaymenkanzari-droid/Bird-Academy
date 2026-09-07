# ADR-008: Decision Support System (DSS) - Bird Intelligence

## Statut
Accepté

## Contexte
L'élevage d'oiseaux de race nécessite des choix complexes (formation de couples de reproducteurs compatibles, prévention des épidémies cliniques, respect des capacités d'accueil des volières, gestion saine de la trésorerie). 
Plutôt que d'intégrer des services cloud d'intelligence artificielle externes payants qui poseraient des problèmes de souveraineté des données, de coûts de maintenance et de connectivité intermittente, nous concevons un système d'aide à la décision autonome.

## Décisions de Conception

### 1. Garantie 100% Locale et Hors Ligne (No-AI Guarantee)
Le système DSS fonctionne intégralement sur le navigateur de l'utilisateur. Aucune donnée d'élevage (fiches de canaris, transactions financières, diagnostics médicaux) n'est transmise à l'extérieur.

### 2. Moteur Déterministe et Scientifique
Toutes les règles métiers sont formalisées de façon explicite dans le code sous forme de fonctions pures (règles biologiques SI-ALORS). Les scores s'appuient sur des données réelles compilées depuis les différents dépôts (Repositories).

### 3. Modèles Multi-critères (Fiches et Rapports)
Le système offre :
- Une vue analytique des performances par couple.
- Un module de notation de complétude des fiches individuelles (Data Quality Index).
- Un générateur de rapports DSS d'élevage prêt pour l'impression physique ou l'export PDF via la fonction de mise en page d'impression standard.

## Conséquences
- **Avantages** : Zéro coût d'exploitation, temps de réponse quasi-instantané, confidentialité absolue, fiabilité scientifique déterministe.
- **Inconvénients** : Nécessite que l'éleveur tienne son registre à jour avec rigueur pour que le système DSS puisse lui suggérer des préconisations pertinentes.

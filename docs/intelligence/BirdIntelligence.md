# Moteur Bird Intelligence (DSS)

## Philosophie
Bird Intelligence repose sur une logique d'aide à la décision (Decision Support System) déterministe et scientifique. Le système fonctionne de manière autonome et hors ligne pour garantir le respect de la vie privée et la souveraineté des données de l'éleveur.

## Architecture
Le service interroge en temps réel les données issues du système de stockage (`appStorage`) via les patrons de dépôts (Repositories) suivants :
- `BirdRepository` : Identification, phénotypes et parenté des canaris.
- `ReproductionRepository` : Cycles de pontes, réussite de couvées, accouplements actifs.
- `HabitatRepository` : Cages et volières (capacités, assignations).
- `HealthRepository` : Dossiers de soins, traitements actifs, campagnes de vaccins.
- `FinanceRepository` : Bilan des transactions d'élevage (achats de graines, compléments, ventes de sujets).

## Tranches de confiance du DSS
Chaque recommandation est pondérée par un indice de représentativité statistique (Fiabilité) :
- **Faible** : Volume de données insuffisant pour garantir la robustesse des conclusions.
- **Moyenne** : Échantillon statistique convenable mais des incertitudes subsistent.
- **Élevée** : Données matures et complètes sur plusieurs générations, offrant une aide à la décision hautement fiable.

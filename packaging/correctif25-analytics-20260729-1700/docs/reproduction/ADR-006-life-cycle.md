# ARCHITECTURAL DECISION RECORD (ADR)
## ADR-006: MODÉLISATION DU CYCLE DE VIE BIOLOGIQUE (ÉCLOSION, POUSSINS & SEVRAGE)

### 1. Contexte
La reproduction au sein de Bird Academy nécessitait l'implémentation du cycle de vie complet de l'œuf jusqu'à l'indépendance de l'oiseau. Le défi résidait dans l'évitement rigoureux de la duplication d'informations, la traçabilité continue de la filiation (généalogie), et la synchronisation entre le module de reproduction temporaire et l'inventaire permanent des oiseaux (`Canari`) géré par le `BirdService`.

### 2. Décisions
Nous avons arrêté les choix d'architecture logicielle suivants :

*   **Séparation stricte par domaine cohérent** :
    Division de l'espace de noms `reproduction` en quatre nouveaux modules hautement cohésifs : `hatching/`, `chicks/`, `growth/`, `weaning/`. Chacun gère son propre sous-état de persistance localisé et découple les préoccupations fonctionnelles.

*   **Couplage par ID de référence (Filiation indirecte)** :
    Le `Chick` conserve des relations univoques vers ses racines biologiques en stockant `eggId`, `clutchId`, et `pairId`. Ces liens ne sont jamais cassés lors des transitions d'états.

*   **Diffèrement de l'instanciation dans le registre principal (`BirdService`)** :
    L'oiseau n'est **jamais** créé dans le registre principal tant que le sevrage n'est pas validé avec succès. Pendant sa croissance, l'individu vit uniquement sous forme de `Chick` doté d'une bague de marquage temporaire calculée dynamiquement, évitant de polluer l'inventaire principal des oiseaux adultes actifs par des embryons ou poussins non viables à court terme.

*   **Généalogie et Héritage Phénotypique Automatique** :
    Pendant l'action de promotion, le service de sevrage interroge les parents biologiques via le registre central des oiseaux et injecte leurs caractères phénotypiques (espèce, race, mutation, couleur, facteur) à l'oiseau nouveau-né. La filiation directe (`pere_id` et `mere_id`) est configurée automatiquement, consolidant l'arbre généalogique dynamique de Bird Academy.

*   **Persistance découplée via appStorage** :
    Tous les dépôts de données d'inspection et d'évolution utilisent des clés isolées de type `ba_repro_chicks`, `ba_repro_growth_records`, `ba_repro_weanings`, offrant une indépendance de lecture/écriture performante.

### 3. Conséquences
*   **Bénéfices** :
    *   **Zéro doublon** : Pas de saisie répétitive de la part de l'utilisateur.
    *   **Généalogie irréprochable** : Filiation automatisée assurant la viabilité des calculs de consanguinité ultérieurs.
    *   **Intégrité de l'inventaire** : L'inventaire général n'est pas encombré par les poussins non parvenus à maturité.
    *   **Haute fidélité scientifique** : Suivi précis par courbes de croissance comparatives et alertes biologiques dynamiques.

*   **Inconvénients** :
    *   Nécessite la conservation d'une table d'association entre l'ID de sevrage et l'ID de l'oiseau promu final pour l'audit historique. Choix résolu en stockant `finalBirdId` dans le record de sevrage.

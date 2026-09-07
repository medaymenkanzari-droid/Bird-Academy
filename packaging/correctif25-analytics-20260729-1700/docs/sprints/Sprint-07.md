# Sprint 7 : Bird Intelligence V1 – Decision Support System (DSS)

## Description du Sprint
Le Sprint 7 dote Bird Academy d'un moteur décisionnel autonome local d'aide à la décision (DSS - Decision Support System). Ce module se distingue par l'absence totale de "boîte noire" d'intelligence artificielle cloud : aucun service de type LLM ou API tierce payante n'est mobilisé. Les analyses, calculs de score et alertes s'exécutent entièrement en local sur le navigateur de l'éleveur.

## Objectifs de Livraison
1. **Moteur d'analyse déterministe** : Interroger les dépôts (Repositories) et agréger les indicateurs clés.
2. **Moteur de Règles (SI-ALORS)** : Modéliser les risques sanitaires, les saturations de cage, et les alertes consanguines.
3. **Moteur de Qualité des Données** : Détecter et lister les informations incomplètes (bagues absentes, photos manquantes, incohérences).
4. **Calcul d'indices de confiance** : Évaluer la représentativité statistique (faible, moyenne, forte).
5. **Tableau de bord interactif** : Widgets, listes d'alertes prioritaires, top-performeurs et graphes de tendances d'activité.
6. **Fiche de diagnostic individuel** : Analyse d'un sujet sélectionné.
7. **Générateur de rapports PDF** : Permettre d'imprimer ou de sauvegarder les bilans de performance.

## Livrables
- `/src/features/intelligence/types/index.ts` : Modèles de données DSS.
- `/src/features/intelligence/engines/DataQualityEngine.ts` : Moteur de conformité des fiches.
- `/src/features/intelligence/engines/RuleEngine.ts` : Moteur de règles biologiques et de sécurité.
- `/src/features/intelligence/engines/BirdIntelligenceEngine.ts` : Moteur de notation et d'analyse.
- `/src/features/intelligence/services/IntelligenceService.ts` : Coordinateur des dépôts.
- `/src/features/intelligence/widgets/Widgets.tsx` : Composants graphiques et widgets.
- `/src/features/intelligence/components/IntelligenceFiche.tsx` : Analyse individuelle oiseau.
- `/src/features/intelligence/components/ReportGenerator.tsx` : Module d'impression de bilans.
- `/src/features/intelligence/dashboards/IntelligenceDashboard.tsx` : Tableau de bord de pilotage.
- `/src/utils/translationsIntelligence.ts` : Internationalisation du module.

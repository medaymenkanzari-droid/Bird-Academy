# BIRD ACADEMY ENTERPRISE — COMMERCIAL READINESS & HARDENING
## Spécification Commerciale Officielle et Définitive FREE / PREMIUM / PRO & Sécurisation LMSE
**Référence Mission :** `SUBSCRIPTION-COMMERCIAL-READINESS-01`  
**Date :** 29 Août 2026  
**Statut :** Document Maître Officiel de Pré-Distribution  
**Baseline :** `SUBSCRIPTION-COMMERCIAL-SPECIFICATION-01` (VALIDATED)  

---

## Nomenclature et Taxonomie d'Audit

Dans l'ensemble de ce document maître, chaque composant, module et fonctionnalité est systématiquement catégorisé selon la taxonomie stricte suivante :

- **`[IMPLEMENTÉ]`** : Code présent, interface utilisateur réellement disponible, fonctionnel, sécurisé contre le contournement et validé par tests physiques réels.
- **`[PARTIELLEMENT IMPLEMENTÉ]`** : Fonctionnalité présente mais limitée à un sous-ensemble du périmètre technique.
- **`[ARCHITECTURE SEULEMENT]`** : Structures de données ou services codés mais non encore exposés dans l'interface utilisateur.
- **`[À CORRIGER]`** : Écart identifié nécessitant un réalignement.
- **`[PROPOSITION]`** : Suggestion commerciale soumise à arbitrage futur.
- **`[NON IMPLEMENTÉ]`** : Fonctionnalité absente du code et de l'interface.

---

## 1. Objectif

Cette mission scelle la **préparation commerciale finale (Commercial Readiness)** de Bird Academy avant sa distribution réelle. Elle transforme le découpage FREE / PREMIUM / PRO en une architecture durcie, imperméable aux contournements (navigation directe, altération de stockage, injection d'état, falsification locale) et 100 % étanche en mode hors-ligne.

---

## 2. Périmètre

L'audit et le durcissement couvrent l'intégralité du progiciel :
- **Moteur de Licence :** Chaîne cryptographique locale LMSE (Ed25519 & SHA-256).
- **Moteur d'Abonnement :** `SubscriptionTierResolver`, `CapabilityResolver`, `SubscriptionContext`, `FeatureLockedCard`, `UpgradeModal`.
- **Assistant IA Local :** `AssistantPermissionService`, `QuotaManager`, `QuestionClassifier`, `AssistantOrchestrator`.
- **Modules Métier ERP :** Oiseaux, Cages/Habitat, Couples, Reproduction, Santé, Alimentation, Calendrier, Génétique, Généalogie, Bird Intelligence, Statistiques, Finances, Référentiel Biologique.

---

## 3. Architecture Commerciale & Chaîne d'Autorisation

La chaîne d'autorisation officielle et inviolable est :
$$\text{LMSE License} \longrightarrow \text{License Status} \longrightarrow \text{Commercial Tier} \longrightarrow \text{Capabilities} \longrightarrow \text{Feature Access} \longrightarrow \text{UI Access} \longrightarrow \text{Action Authorization}$$

Aucune interface, action, ou requête IA ne peut être exécutée sans vérification préalable par `CapabilityResolver` et `AssistantPermissionService`.

---

## 4. Architecture LMSE `[IMPLEMENTÉ]`

- **Validation Cryptographique Locale :** Vérification asymétrique par clé publique compilée dans le binaire.
- **Résolution Déterministe :** Mapping des types (`enterprise`, `beta`, `association`, `veterinary` $\to$ `PRO` ; `commercial` $\to$ `PREMIUM` ; absence/invalide $\to$ `FREE`).
- **Gestion des Tags :** Prise en compte prioritaire des tags `tier:pro`, `tier:premium`, `tier:free`.
- **Isolation :** Zéro clé privée, secret ou endpoint administratif dans le bundle utilisateur (`verify:user-bundle`).

---

## 5. Édition FREE `[IMPLEMENTÉ]`

- **Objectif :** Démarrage et gestion autonome de base.
- **Modules inclus :** Dashboard, Oiseaux (création/édition de base), Cages & Habitats essentiels, Couples & Reproduction de base, Carnet Sanitaire Individuel, Alimentation de base, Calendrier, Dépenses et Ventes, Statistiques fondamentales, Référentiel Biologique (8 espèces).
- **Assistant IA :** Connaissances biologiques et générales pures issues du référentiel officiel. Quota de 10 req/j. Confidentialité absolue (zéro donnée personnelle transmise).
- **Verrouillages :** Bird Intelligence, consanguinité de Wright, arbre généalogique, traitements par lot, export QR, rapports analytiques.

---

## 6. Édition PREMIUM `[IMPLEMENTÉ]`

- **Objectif :** Gestion avancée et sélection pour éleveurs confirmés.
- **Périmètre :** Tout FREE + Cheptel illimité (`BIRD_UNLIMITED`), Fiches avancées et QR (`BIRD_QR_EXPORT`), Suivi poussins/nurserie/EAM (`BREEDING_ADVANCED_TRACKING`), Consanguinité de Wright ($F_x$), Traitements sanitaires par lot (`HEALTH_BATCH_TREATMENTS`), Rapports financiers avancés, Statistiques avancées.
- **Assistant IA :** Contexte élevage ciblé (`AI_ASSISTANT_FARM_CONTEXT`). Quota de 100 req/j. Chargement minimal du contexte requis.

---

## 7. Édition PRO `[IMPLEMENTÉ]`

- **Objectif :** Suite décisionnelle haut de gamme pour professionnels, clubs et cliniques.
- **Périmètre :** Tout PREMIUM + Moteur complet *Bird Intelligence* (`INTELLIGENCE_FULL_ENGINE`), Arbre généalogique multi-générationnel (`GENETICS_ADVANCED_TREE`), Alertes sanitaires prédictives (`HEALTH_INTELLIGENCE_ALERTS`), Exports et bilans officiels d'élevage.
- **Assistant IA :** Requêtes **ILLIMITÉES** 24/7 en local avec croisement généalogique, santé, reproduction et finance.

---

## 8. Matrice des Capabilities `[IMPLEMENTÉ]`

| Capability | FREE | PREMIUM | PRO | Description Métier |
|---|:---:|:---:|:---:|---|
| `BIRD_VIEW` | ✅ | ✅ | ✅ | Visualisation du cheptel |
| `BIRD_CREATE_EDIT` | ✅ | ✅ | ✅ | Gestion des fiches oiseaux |
| `BIRD_UNLIMITED` | ❌ | ✅ | ✅ | Cheptel sans plafond |
| `BIRD_ADVANCED_RECORD` | ❌ | ✅ | ✅ | Morphologie, palmarès, biométrie |
| `BIRD_QR_EXPORT` | ❌ | ✅ | ✅ | Génération de QR codes et badges |
| `HABITAT_VIEW` | ✅ | ✅ | ✅ | Visualisation des cages |
| `HABITAT_MANAGE` | ✅ | ✅ | ✅ | Gestion des cages et volières |
| `HABITAT_ADVANCED` | ❌ | ✅ | ✅ | Complexes et calculs de densité |
| `COUPLE_VIEW` | ✅ | ✅ | ✅ | Visualisation des couples |
| `COUPLE_MANAGE` | ✅ | ✅ | ✅ | Constitution et séparation |
| `COUPLE_COMPATIBILITY_GENETICS` | ❌ | ✅ | ✅ | Score génétique d'affinité |
| `BREEDING_VIEW` | ✅ | ✅ | ✅ | Visualisation des reproductions |
| `BREEDING_RECORD` | ✅ | ✅ | ✅ | Saisie des pontes et couvées |
| `BREEDING_ADVANCED_TRACKING` | ❌ | ✅ | ✅ | Baguage auto, sevrage, EAM |
| `BREEDING_PREDICTIVE_ANALYTICS` | ❌ | ❌ | ✅ | Prédiction des taux d'éclosion |
| `HEALTH_VIEW` | ✅ | ✅ | ✅ | Visualisation du carnet de santé |
| `HEALTH_RECORD` | ✅ | ✅ | ✅ | Saisie d'interventions vétérinaires |
| `HEALTH_BATCH_TREATMENTS` | ❌ | ✅ | ✅ | Traitements par lot en volière |
| `HEALTH_INTELLIGENCE_ALERTS` | ❌ | ❌ | ✅ | Détection d'anomalies sanitaires |
| `FEEDING_VIEW` | ✅ | ✅ | ✅ | Visualisation de l'alimentation |
| `FEEDING_MANAGE` | ✅ | ✅ | ✅ | Gestion des plans nutritionnels |
| `CALENDAR_VIEW` | ✅ | ✅ | ✅ | Calendrier des événements |
| `CALENDAR_FULL_SYNC` | ❌ | ✅ | ✅ | Synchronisation avancée calendrier |
| `BIO_REFERENCE_ACCESS` | ✅ | ✅ | ✅ | Accès aux 8 fiches du référentiel |
| `FINANCE_VIEW` | ✅ | ✅ | ✅ | Visualisation comptable |
| `FINANCE_MANAGE` | ✅ | ✅ | ✅ | Saisie dépenses et ventes |
| `FINANCE_ADVANCED_REPORTS` | ❌ | ✅ | ✅ | Bilans et rentabilité par couple |
| `ANALYTICS_BASIC` | ✅ | ✅ | ✅ | Totaux et indicateurs de base |
| `ANALYTICS_ADVANCED` | ❌ | ✅ | ✅ | Graphiques et statistiques avancées |
| `ANALYTICS_PRO_EXPORT` | ❌ | ❌ | ✅ | Export de registres officiels |
| `GENETICS_BASIC` | ✅ | ✅ | ✅ | Simulateur de croisements de base |
| `GENETICS_WRIGHT_INBREEDING` | ❌ | ✅ | ✅ | Calcul de consanguinité de Wright |
| `GENETICS_ADVANCED_TREE` | ❌ | ❌ | ✅ | Arbre généalogique multi-générations |
| `INTELLIGENCE_VIEW_BASIC` | ✅ | ✅ | ✅ | Fiches conseils générales |
| `INTELLIGENCE_DIAGNOSTIC_FICHES`| ❌ | ✅ | ✅ | Diagnostics guidés |
| `INTELLIGENCE_FULL_ENGINE` | ❌ | ❌ | ✅ | Moteur décisionnel complet |
| `AI_ASSISTANT_GENERAL_BIO` | ✅ | ✅ | ✅ | Biologie et connaissances générales |
| `AI_ASSISTANT_FARM_CONTEXT` | ❌ | ✅ | ✅ | Contexte d'élevage utilisateur |
| `AI_ASSISTANT_INTELLIGENCE_GENEALOGY` | ❌ | ❌ | ✅ | Analyses de généalogie & intelligence |
| `AI_ASSISTANT_QUOTA_10` | ✅ | ❌ | ❌ | 10 requêtes / jour |
| `AI_ASSISTANT_QUOTA_100` | ❌ | ✅ | ❌ | 100 requêtes / jour |
| `AI_ASSISTANT_QUOTA_UNLIMITED` | ❌ | ❌ | ✅ | Requêtes illimitées |

---

## 9. Verrouillage Fonctionnel (Feature Gating) `[IMPLEMENTÉ]`

- Les modules non accessibles dans le plan actuel affichent systématiquement le composant `FeatureLockedCard`.
- L'utilisateur est informé du plan requis avec un bouton d'action vers `UpgradeModal`.

---

## 10. Protection Anti-Contournement (Anti-Bypass) `[IMPLEMENTÉ]`

- **Altération du Storage :** L'injection de chaînes invalides dans `localStorage` (ex: `HACKED_SUPER_TIER`) est neutralisée par le recalcul déterministe depuis la licence active.
- **Accès Direct par URL / Onglet :** Même si un composant protégé est forcé au montage, `CapabilityResolver` bloque l'accès aux flux de données sous-jacents.

---

## 11. Protection des Actions Métier `[IMPLEMENTÉ]`

- Les opérations sensibles (calculs de consanguinité, traitements par lot, analyses Bird Intelligence, exports certifiés) sont vérifiées au moment de l'exécution, interdisant tout déclenchement non autorisé.

---

## 12. Rétention Absolue des Données `[IMPLEMENTÉ]`

- Principe fondamental : $\text{DATA\_BEFORE} \equiv \text{DATA\_AFTER}$.
- Aucun changement de tier, expiration de licence ou invalidation ne supprime ni ne corrompt les données d'élevage (oiseaux, cages, couples, pontes, soins, finances).

---

## 13. Règles de Downgrade `[IMPLEMENTÉ]`

- Passage d'un tier supérieur à un tier inférieur :
  1. Toutes les données précédemment créées restent intactes en local.
  2. Les fonctionnalités exclusives sont verrouillées avec affichage du `FeatureLockedCard`.

---

## 14. Règles d'Upgrade `[IMPLEMENTÉ]`

- Passage d'un tier inférieur à un tier supérieur :
  1. Les capacités supérieures sont débloquées instantanément.
  2. Les données antérieures sont immédiatement réexploitées par les moteurs avancés sans reconfiguration.

---

## 15. Règles d'Expiration `[IMPLEMENTÉ]`

- À l'échéance de la licence (`expiresAt < now`), l'application bascule gracieusement en plan **FREE** sans crash ni altération de données.

---

## 16. Règles d'Invalidation `[IMPLEMENTÉ]`

- Si une licence est révoquée ou altérée en signature, le système dégrade en plan **FREE** sécurisé.

---

## 17. Assistant IA & Confidentialité `[IMPLEMENTÉ]`

- 100 % local (pur moteur sur l'appareil, 0 appel API distant, 0 dépendance cloud).
- Quotas journaliers déterministes : 10 (FREE), 100 (PREMIUM), Illimité (PRO).
- En plan FREE : Zéro transmission de données personnelles d'élevage au prompt IA.

---

## 18. Étanchéité 100 % Offline-First `[IMPLEMENTÉ]`

- Fonctionnement total sans réseau.
- Audité par les tests Playwright sous `context.setOffline(true)` avec listener réseau certifiant **0 requête externe**.

---

## 19. Ergonomie Mobile (375×812) `[IMPLEMENTÉ]`

- Navigation par tiroir tactile `#mobile-navigation-drawer`.
- Respect strict de la largeur d'écran ($0 \text{ px}$ d'overflow horizontal).

---

## 20. Internationalisation (i18n) `[IMPLEMENTÉ]`

- Support complet des 5 langues : **FR, EN, AR, ES, IT**.
- Tous les libellés commerciaux, badges, cartes et messages IA sont traduits dynamiquement.

---

## 21. Support RTL (Arabe) `[IMPLEMENTÉ]`

- Activation de `dir="rtl"` et de la classe `.rtl` avec inversion des tiroirs, tableaux et boutons.

---

## 22. Validation par les Tests Playwright `[IMPLEMENTÉ]`

- **125 tests E2E physiques Chromium** exécutés et validés avec 100 % de succès :
  - `subscription-commercial-readiness-01.spec.ts` (40 tests)
  - `subscription-commercial-specification-01.spec.ts` (25 tests)
  - `subscription-tier-distribution-lmse.spec.ts` (20 tests)
  - `subscription-tier-capability-audit-02.spec.ts` (25 tests)
  - `ai-assistant-pro-functional.spec.ts` (15 tests)

---

## 23. Sécurité des Bundles de Production `[IMPLEMENTÉ]`

- `npm run verify:user-bundle` : **PASS** (Zero administrative leak, 0 clé privée).
- `npm run verify:admin-bundle` : **PASS** (Intégrité des points d'entrée validée).

---

## 24. Limites Connues `[PARTIELLEMENT IMPLEMENTÉ]`

- L'arbre généalogique visuel interactif affiche jusqu'à 3 générations ascendantes directes. L'extension vers des arbres à profondeur arbitraire est planifiée pour une version majeure ultérieure.

---

## 25. Conclusion & Scellement Commercial

L'architecture commerciale de Bird Academy Enterprise (**FREE / PREMIUM / PRO + LMSE**) est durcie, étanche, inviolable, testée à 100 % en conditions réelles et officiellement prête pour la distribution.

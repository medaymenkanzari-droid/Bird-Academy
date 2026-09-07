# MATRICE OFFICIELLE DE RÉPARTITION COMMERCIALE — BIRD ACADEMY ENTERPRISE
## Éditions FREE / PREMIUM / PRO & Intégration LMSE
**Référence :** `SUBSCRIPTION-TIER-DISTRIBUTION-LMSE-01`  
**Statut :** VALIDÉ ET EN PRODUCTION  
**Architecture :** 100 % Hors-Ligne (Zero Cloud, Zero Telemetry)

---

## 1. Chaîne d'Autorité & Architecture

Le système de distribution commerciale de Bird Academy repose sur une chaîne d'autorité stricte et découplée :

```text
LICENCE LMSE (Cryptographique asymétrique locale)
    ↓
STATUT DE LICENCE (Active / Expired / Revoked / Unlicensed)
    ↓
PLAN COMMERCIAL (SubscriptionTier: FREE / PREMIUM / PRO)
    ↓
CAPABILITIES CENTRALISÉES (Set<SubscriptionCapability>)
    ↓
FONCTIONNALITÉS / MODULES / ACTIONS (Vérification par hasCapability)
```

---

## 2. Matrice Comparative des Capacités Commerciales

| Domaine / Module | Fonctionnalité Réelle | FREE | PREMIUM | PRO | Capability Technique |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Oiseaux** | Consultation de la liste, recherche & filtres | ✅ Inclus | ✅ Inclus | ✅ Inclus | `BIRD_VIEW` |
| | Création, modification & fiche de base | ✅ Inclus | ✅ Inclus | ✅ Inclus | `BIRD_CREATE_EDIT` |
| | Gestion de cheptel illimité | 🔒 Limité (25) | ✅ Illimité | ✅ Illimité | `BIRD_UNLIMITED` |
| | Historique complet, palmarès & transferts | 🔒 Limité | ✅ Inclus | ✅ Inclus | `BIRD_ADVANCED_RECORD` |
| | Export fiche & QR Code d'identification | 🔒 Limité | ✅ Inclus | ✅ Inclus | `BIRD_QR_EXPORT` |
| **Cages & Habitat** | Consultation des cages & volières | ✅ Inclus | ✅ Inclus | ✅ Inclus | `HABITAT_VIEW` |
| | Création & affectation aux cages | ✅ Inclus | ✅ Inclus | ✅ Inclus | `HABITAT_MANAGE` |
| | Quarantaine, infirmerie & désinfections | 🔒 Limité | ✅ Inclus | ✅ Inclus | `HABITAT_ADVANCED` |
| **Couples** | Consultation & formation de couples | ✅ Inclus | ✅ Inclus | ✅ Inclus | `COUPLE_VIEW`, `COUPLE_MANAGE` |
| | Compatibilité génétique & consanguinité | 🔒 Verrouillé | ✅ Inclus | ✅ Inclus | `COUPLE_COMPATIBILITY_GENETICS` |
| **Reproduction** | Suivi des pontes, mirage & éclosions | ✅ Inclus | ✅ Inclus | ✅ Inclus | `BREEDING_VIEW`, `BREEDING_RECORD` |
| | Poussins, pesées, baguage auto & EAM | 🔒 Limité | ✅ Inclus | ✅ Inclus | `BREEDING_ADVANCED_TRACKING` |
| | Analyses prédictives des cycles & risques | 🔒 Verrouillé | 🔒 Verrouillé | ✅ Inclus | `BREEDING_PREDICTIVE_ANALYTICS` |
| **Santé & Soins** | Carnet sanitaire & soins individuels | ✅ Inclus | ✅ Inclus | ✅ Inclus | `HEALTH_VIEW`, `HEALTH_RECORD` |
| | Traitements par lot & rappels vaccinaux | 🔒 Verrouillé | ✅ Inclus | ✅ Inclus | `HEALTH_BATCH_TREATMENTS` |
| | Alertes sanitaires intelligentes | 🔒 Verrouillé | 🔒 Verrouillé | ✅ Inclus | `HEALTH_INTELLIGENCE_ALERTS` |
| **Alimentation** | Programmes alimentaires & mélanges | ✅ Inclus | ✅ Inclus | ✅ Inclus | `FEEDING_VIEW`, `FEEDING_MANAGE` |
| **Calendrier** | Calendrier d'élevage de base | ✅ Inclus | ✅ Inclus | ✅ Inclus | `CALENDAR_VIEW` |
| | Synchronisation croisée & rappels | 🔒 Limité | ✅ Inclus | ✅ Inclus | `CALENDAR_FULL_SYNC` |
| **Référentiel Bio** | 8 espèces certifiées du registre biologique | ✅ Inclus | ✅ Inclus | ✅ Inclus | `BIO_REFERENCE_ACCESS` |
| **Finances** | Saisie des dépenses & ventes de base | ✅ Inclus | ✅ Inclus | ✅ Inclus | `FINANCE_VIEW`, `FINANCE_MANAGE` |
| | Bilans détaillés & rentabilité par couple | 🔒 Limité | ✅ Inclus | ✅ Inclus | `FINANCE_ADVANCED_REPORTS` |
| **Statistiques** | Indicateurs fondamentaux du cheptel | ✅ Inclus | ✅ Inclus | ✅ Inclus | `ANALYTICS_BASIC` |
| | Graphiques d'évolution, fécondité, mortalité | 🔒 Verrouillé | ✅ Inclus | ✅ Inclus | `ANALYTICS_ADVANCED` |
| | Exportations analytiques complètes | 🔒 Verrouillé | 🔒 Verrouillé | ✅ Inclus | `ANALYTICS_PRO_EXPORT` |
| **Génétique** | Simulateur de croisement de base | ✅ Inclus | ✅ Inclus | ✅ Inclus | `GENETICS_BASIC` |
| | Consanguinité de Wright & ancêtres communs | 🔒 Verrouillé | ✅ Inclus | ✅ Inclus | `GENETICS_WRIGHT_INBREEDING` |
| | Arbre généalogique ascendant multi-générations | 🔒 Verrouillé | 🔒 Verrouillé | ✅ Inclus | `GENETICS_ADVANCED_TREE` |
| **Bird Intelligence** | Consultation générale & présentation | ✅ Inclus | ✅ Inclus | ✅ Inclus | `INTELLIGENCE_VIEW_BASIC` |
| | Diagnostic de complétude des données | 🔒 Verrouillé | ✅ Inclus | ✅ Inclus | `INTELLIGENCE_DIAGNOSTIC_FICHES` |
| | Moteur complet, règles, alertes & rapports | 🔒 Verrouillé | 🔒 Verrouillé | ✅ Inclus | `INTELLIGENCE_FULL_ENGINE` |
| **Assistant IA** | Biologie générale & référentiel (10 req/j) | ✅ Inclus | ✅ Inclus | ✅ Inclus | `AI_ASSISTANT_GENERAL_BIO`, `AI_ASSISTANT_QUOTA_10` |
| | Contexte élevage & cheptel (100 req/j) | 🔒 Verrouillé | ✅ Inclus | ✅ Inclus | `AI_ASSISTANT_FARM_CONTEXT`, `AI_ASSISTANT_QUOTA_100` |
| | Intelligence, généalogie & rapports (Illimité) | 🔒 Verrouillé | 🔒 Verrouillé | ✅ Inclus | `AI_ASSISTANT_INTELLIGENCE_GENEALOGY`, `AI_ASSISTANT_QUOTA_UNLIMITED` |

---

## 3. Correspondance Licences LMSE ↔ Plans Commerciaux

| Type de Licence LMSE | Policy Features par Défaut | Plan Résolu | Droits & Accès |
| :--- | :--- | :---: | :--- |
| **Sans Licence / Unlicensed** | Aucune | `UNLICENSED` | Accès bloqué jusqu'à activation (`FirstLaunchActivationScreen`) |
| **Licence Starter / Essai** | `core`, `tier:free` | `FREE` | 14 modules essentiels, 10 req IA/j, pas d'intelligence poussée |
| **Licence Commercial** | `core`, `unlimited_birds`, `pedigree`, `tier:premium` | `PREMIUM` | Gestion complète illimitée, Wright, 100 req IA/j |
| **Licence Enterprise / Beta** | `core`, `unlimited_birds`, `pedigree`, `statistics`, `tier:pro` | `PRO` | Moteur complet Bird Intelligence, arbre généalogique, IA illimitée |
| **Licence Association / Véto** | `core`, `all_features`, `tier:pro` | `PRO` | Accès PRO institutionnel complet |

---

## 4. Internationalisation des Niveaux & Textes UI

| Clé de Traduction | Français (FR) | English (EN) | Arabe (AR - RTL) | Espagnol (ES) | Italien (IT) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `tierFree` | Plan GRATUIT | FREE Plan | الباقة المجانية | Plan GRATIS | Piano GRATUITO |
| `tierPremium` | Plan PREMIUM | PREMIUM Plan | باقة PREMIUM | Plan PREMIUM | Piano PREMIUM |
| `tierPro` | Plan PRO | PRO Plan | باقة PRO | Plan PRO | Piano PRO |
| `upgradeOrActivate` | Mettre à niveau ou Activer | Upgrade or Activate | ترقية الباقة أو تفعيل ترخيص | Mejorar Plan o Activar | Aggiorna Piano o Attiva |

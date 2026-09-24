# Tableau de Bord Opérationnel de la Campagne Publique
**Projet :** Bird Academy Enterprise — Volière Manager  
**Version Officielle :** `v1.3.6`  
**BUILD_ID :** `BA-V1.3.6`  
**Date d'ouverture opérationnelle :** 21 Septembre 2026  
**Supervision :** QA & Campaign Operations Management  

---

## 1. Indicateurs Opérationnels en Temps Réel

Les métriques présentées ci-dessous proviennent exclusivement des registres de campagne officiels. Aucun chiffre n'est interpolé ou simulé.

| Indicateur Opérationnel | Valeur Réelle | Statut d'Audit | Source / Registre |
| :--- | :---: | :---: | :--- |
| **Participants Réels Inscrits** | **0** | En attente de testeurs réels | `QA_TESTER_PARTICIPANT_REGISTRY.json` |
| **Appareils Réels Enregistrés** | **0** | En attente de terminaux réels | `QA_TEST_DEVICE_REGISTRY.json` |
| **Sessions Terrain Exécutées** | **0** | Aucune session déclarée | `QA_TEST_SESSION_LOG_REGISTRY.json` |
| **Scénarios Physiques Exécutés** | **0 / 25** | En attente d'exécution humaine | Matrice H-W01 à H-W25 |
| **Scénarios PASS** | **0** | Aucune observation humaine PASS | `campaign-matrix.json` |
| **Scénarios FAIL** | **0** | Aucun échec constaté | `campaign-matrix.json` |
| **Scénarios BLOCKED** | **0** | Aucun scénario bloqué | `campaign-matrix.json` |
| **Incidents Terrain Ouverts** | **0** | Aucun bug réel rapporté | `QA_TEST_INCIDENT_REGISTRY.json` |
| **Incidents Critiques / Bloquants** | **0** | Zéro anomalie majeure | `QA_TEST_INCIDENT_REGISTRY.json` |
| **Preuves Réelles Archivées** | **0** | Aucune preuve synthétique tolérée | `QA_TEST_EVIDENCE_REGISTRY.json` |

---

## 2. État des Portes de Contrôle

```
===============================================================
CAMPAIGN OPERATIONS LIVE STATUS
===============================================================

CAMPAIGN GATE             = OPEN FOR REAL ENROLLMENT
SOFTWARE READINESS        = PASS (Automated & Build Verified)
PHYSICAL VALIDATION       = NOT EXECUTED
ACTION PENDING            = ACT-P1-02 (OPEN)

DEVICES TESTED            = 0
PARTICIPANTS TESTED       = 0
SESSIONS EXECUTED         = 0
PHYSICAL CONTROLS         = 0

HUMAN EXECUTION REQUIRED  = YES
===============================================================
```

---

## 3. Répartition des Scénarios selon la Matrice (20 Catégories)

| Catégorie | Scénarios Assignés | Couverture Automatisée | Statut Terrain |
| :--- | :---: | :---: | :---: |
| **A. Installation** | H-W01, H-W09 | Couverte (Binaire & Setup) | `READY_FOR_HUMAN_EXECUTION` |
| **B. Premier démarrage** | H-W02 | Couverte (Onboarding clean) | `READY_FOR_HUMAN_EXECUTION` |
| **C. Gestion des oiseaux** | H-W03, H-W04, H-W05, H-W13, H-W14 | Couverte (Entitlement 20 max) | `READY_FOR_HUMAN_EXECUTION` |
| **D. Habitat / cages** | H-W21 | Couverte (CRUD Cages & B012) | `READY_FOR_HUMAN_EXECUTION` |
| **E. Reproduction** | H-W21 | Couverte (Couples & Cycles) | `READY_FOR_HUMAN_EXECUTION` |
| **F. Santé** | H-W21 | Couverte (Soins & B014) | `READY_FOR_HUMAN_EXECUTION` |
| **G. Alimentation** | H-W21 | Couverte (Rations & Stocks) | `READY_FOR_HUMAN_EXECUTION` |
| **H. Finances** | H-W21 | Couverte (Dépenses & Recettes) | `READY_FOR_HUMAN_EXECUTION` |
| **I. Intelligence** | H-W21 | Couverte (Assistant & B015) | `READY_FOR_HUMAN_EXECUTION` |
| **J. Offline** | H-W15 | Couverte (Offline Playwright) | `READY_FOR_HUMAN_EXECUTION` |
| **K. Multilingue** | H-W16, H-W17, H-W18, H-W19 | Couverte (FR, EN, ES, IT, AR) | `READY_FOR_HUMAN_EXECUTION` |
| **L. Arabe / RTL** | H-W20 | Couverte (dir="rtl", graphie) | `READY_FOR_HUMAN_EXECUTION` |
| **M. FREE entitlement** | H-W10, H-W11 | Couverte (OVER_ENTITLEMENT) | `READY_FOR_HUMAN_EXECUTION` |
| **N. Persistance Windows** | H-W08 | Couverte (IndexedDB / State) | `READY_FOR_HUMAN_EXECUTION` |
| **O. Import / Export** | H-W06 | Couverte (Rejet dépassement) | `READY_FOR_HUMAN_EXECUTION` |
| **P. Backup / Restore** | H-W07 | Couverte (Restauration atomique) | `READY_FOR_HUMAN_EXECUTION` |
| **Q. Démonstration** | H-W12 | Couverte (Purge sélective DEMO) | `READY_FOR_HUMAN_EXECUTION` |
| **R. PDF / rapports** | H-W22 | Couverte (Génération %PDF-1.4) | `READY_FOR_HUMAN_EXECUTION` |
| **S. Ergonomie** | H-W21, H-W23 | Couverte (Responsive & Nav) | `READY_FOR_HUMAN_EXECUTION` |
| **T. Incidents / récupération** | H-W24, H-W25 | En attente de cas réel | `READY_FOR_HUMAN_EXECUTION` |

---

## 4. Consignes pour la Mise à Jour du Tableau de Bord

1. **Aucun incrément sans pièce justificative :** Tout incrément de participant, appareil ou session doit pointer vers une entrée valide dans son registre respectif.
2. **Revue QA obligatoire :** Seul le Senior QA Engineer ou le Public Test Campaign Operations Manager est habilité à consolider ce tableau de bord.
3. **Maintien du gel release :** Aucun correctif applicatif ne peut être poussé sans respecter le protocole d'escalade et de non-régression.

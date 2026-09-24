# Tableau de Contrôle d'Exécution & Monitoring de Campagne — Bird Academy Enterprise
**Version Cible :** `v1.3.6`  
**BUILD_ID :** `BA-V1.3.6`  
**Mission :** `PUBLIC-TEST-CAMPAIGN-EXECUTION-CONTROL-003`  
**Date :** 21 Septembre 2026  
**Autorité :** Senior QA Engineer & Public Test Campaign Operations Manager  

---

## 1. VUE D'ENSEMBLE DES PILIERS DE VALIDATION

Le tableau de bord ci-dessous formalise la frontière stricte et infranchissable entre les validations logicielles automatisées en laboratoire et les validations physiques réelles sur le terrain.

```
===============================================================
CAMPAIGN EXECUTION CONTROL SUMMARY
===============================================================

AUTOMATED VALIDATION      = PASS (100% CI / Tests / Build / Typecheck)
HUMAN EXECUTION           = PENDING (En attente du premier éleveur réel)
PHYSICAL VALIDATION       = NOT EXECUTED
CAMPAIGN STATUS           = HUMAN_EXECUTION_PENDING

ACTION SUIVIE             = ACT-P1-02 (OPEN)

===============================================================
```

---

## 2. PILIER 1 : AUTOMATED VALIDATION (VALIDATION AUTOMATISÉE)

| Composant Vérifié | Méthode d'Audit | Statut | Résultat |
| :--- | :--- | :---: | :--- |
| **Typecheck TypeScript** | `npx tsc --noEmit` | **PASS** | 0 erreur statique |
| **Build de Production** | `npm run build` | **PASS** | 5.65s (Vite + Service Worker PWA) |
| **Intégrité Binaire APK** | SHA-256 + Byte count | **PASS** | 9 916 814 octets / Digest certifié |
| **Binaires Windows** | Setup & Portable .exe | **PASS** | 106.8 Mo / 106.4 Mo |
| **Entitlement FREE** | Moteur de quotas | **PASS** | Limite 20 oiseaux, OVER_ENTITLEMENT actif |
| **Protection des Données** | Classifier démographique | **PASS** | 100% USER et INDETERMINATE protégés |
| **Intégrité Offline** | Mode déconnecté local | **PASS** | Zéro dépendance cloud bloquante |
| **Multilingue & RTL** | Dictionnaires FR/EN/ES/IT/AR | **PASS** | Direction `rtl` et graphie native arabe |
| **Scan Commercial** | Ripgrep sur prix obsolètes | **PASS** | 0 occurrence de grilles tarifaires obsolètes |
| **Suites E2E Playwright** | Desktop Chromium | **PASS** | Zéro régression console ou navigation |

---

## 3. PILIER 2 : HUMAN EXECUTION (EXÉCUTION HUMAINE TERRAIN)

> **Règle absolue :** Aucun scénario physique ne peut être qualifié de PASS sans réalisation humaine réelle constatée, datée et documentée.

### Compteurs Opérationnels de Scénarios
- **Total Scénarios :** `25`
- **Ready for Human Execution :** `25 READY_FOR_HUMAN_EXECUTION`
- **Human Executed :** `0 HUMAN EXECUTED`
- **Human Passed :** `0`
- **Human Failed :** `0`
- **Blocked :** `0`
- **Abandoned :** `0`

### Matrice des 25 Scénarios Physiques (H-W01 à H-W25)
| ID | Catégorie | Objectif | Type de Contrôle | Statut Opérationnel |
| :--- | :--- | :--- | :---: | :---: |
| **H-W01** | A. Installation | Installation Windows propre | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W02** | B. Premier démarrage | Premier lancement profil vide | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W03** | C. Gestion oiseaux | Saisie oiseaux 0 à 20 | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W04** | C. Gestion oiseaux | Tentative 21e oiseau (blocage) | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W05** | C. Gestion oiseaux | Duplication au-delà quota | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W06** | O. Import / Export | Import dépassant la limite | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W07** | P. Backup / Restore | Restore dépassant la limite | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W08** | N. Persistance | Redémarrage après fermeture | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W09** | A. Installation | Réinstallation sur profil existant | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W10** | M. FREE entitlement | Profil historique 297 oiseaux | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W11** | M. FREE entitlement | Conservation données historiques | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W12** | Q. Démonstration | Purge contrôlée DEMO seule | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W13** | C. Gestion oiseaux | Non-suppression données USER | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W14** | C. Gestion oiseaux | Non-suppression INDETERMINATE | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W15** | J. Offline | Fonctionnement 100% hors-ligne | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W16** | K. Multilingue | Bascule FR → EN | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W17** | K. Multilingue | Bascule FR → ES | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W18** | K. Multilingue | Bascule FR → IT | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W19** | K. Multilingue | Bascule FR → AR | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W20** | L. Arabe / RTL | Rendu et direction RTL arabe | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W21** | S. Ergonomie | Navigation complète des onglets | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W22** | R. PDF / rapports | Export et consultation PDF | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W23** | S. Ergonomie | Test libre par un éleveur réel | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W24** | T. Incidents | Déclaration d'incident réel | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |
| **H-W25** | T. Incidents | Archivage de preuve réelle | Humain Requis | `READY_FOR_HUMAN_EXECUTION` |

---

## 4. PILIER 3 : PHYSICAL VALIDATION (REGISTRES PHYSIQUES EN TEMPS RÉEL)

| Registre Officiel | Compteur Actuel | État d'Intégrité | Fichier Source |
| :--- | :---: | :---: | :--- |
| **Participants Réels** | **0** | Vierge (zéro testeur fictif) | `QA_TESTER_PARTICIPANT_REGISTRY.json` |
| **Appareils Réels** | **0** | Vierge (zéro appareil fictif) | `QA_TEST_DEVICE_REGISTRY.json` |
| **Sessions Exécutées** | **0** | Vierge (zéro session fictive) | `QA_TEST_SESSION_LOG_REGISTRY.json` |
| **Incidents Rapportés** | **0** | Vierge (zéro faux bug) | `QA_TEST_INCIDENT_REGISTRY.json` |
| **Preuves Collectées** | **0** | Vierge (zéro preuve synthétique) | `QA_TEST_EVIDENCE_REGISTRY.json` |
| **Contrôles Physiques** | **0** | Non exécuté | Suivi de porte ACT-P1-02 |

---

## 5. PILIER 4 : CAMPAIGN STATUS (MODÈLE D'ÉTAT DE CAMPAGNE)

Le modèle d'état officiel distingue 6 phases :
1. `SOFTWARE_READY` : Socle logiciel et binaire qualifiés en laboratoire.
2. `CAMPAIGN_READY` : Infrastructure de registre, documentation et onboarding prêtes.
3. `HUMAN_EXECUTION_PENDING` : **ÉTAT ACTUEL DE LA CAMPAGNE** (infrastructure prête, en attente de la première session réelle).
4. `HUMAN_EXECUTION_IN_PROGRESS` : Au moins une session réelle en cours d'exécution.
5. `HUMAN_EXECUTION_COMPLETED` : Les 25 scénarios ont été exécutés par des testeurs réels.
6. `CAMPAIGN_BLOCKED` : Suspension immédiate suite à incident de sévérité `BLOCKER`.

---

## 6. INSTRUCTIONS AUX OPÉRATEURS QA

1. **Ne jamais modifier les compteurs manuellement :** Tout incrément de session ou de participant doit résulter de l'adjonction d'une fiche d'enregistrement réelle.
2. **Ne jamais qualifier une session sans pièces tangibles :** Une preuve doit correspondre à une capture native, photo réelle ou sauvegarde JSON vérifiée.
3. **Maintien du gel release :** Le code de production sous `src/` reste strictement intouché.

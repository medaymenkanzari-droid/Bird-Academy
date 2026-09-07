# BIRD ACADEMY ENTERPRISE — RAPPORT FINAL DE TEST QA
## MISSION QA-WIN-FIRST-LAUNCH-01 : VALIDATION DU WIZARD ET PREMIER DÉMARRAGE

**Date :** 21 Août 2026  
**Auteur :** Antigravity AI — Architecture & QA Engineering  
**Statut Analyse & Tests Automatisés :** ✅ **AUTOMATED FIRST-LAUNCH ANALYSIS = PASS (646/646 tests)**  
**Statut Validation Réelle Windows 11 :** ⏳ **REAL FIRST-LAUNCH VALIDATION = PENDING (EN ATTENTE DE VOTRE TEST PHYSIQUE)**  

---

## 1. ÉTAT INITIAL (AVANT RESET)

Fichier témoin : `WINDOWS_FIRST_LAUNCH_BEFORE.txt`

* **Profil Canonique :** `%APPDATA%\Bird Academy Enterprise` (Présent — LocalStorage LevelDB avec licence et élevage)
* **Profil Legacy :** `%APPDATA%\react-example` (Présent — Ancien profil hérité)
* **Processus actifs :** 0 processus en cours
* **Comportement constaté :** En présence de ces dossiers, le lancement normal de l'application réalise une reprise de session (ou une migration automatique), ouvrant directement le Dashboard avec les données existantes.

---

## 2. CONDITIONS FORMELLES DU PREMIER DÉMARRAGE

```text
                               ┌───────────────────────────┐
                               │ Lancement de l'exécutable │
                               └─────────────┬─────────────┘
                                             │
                          ┌──────────────────▼──────────────────┐
                          │ Vérification de la Licence LMSE     │
                          └──────────────────┬──────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      │                                             │
             [Licence ABSENTE/INVALIDE]                     [Licence VALIDE]
                      │                                             │
         ┌────────────▼──────────────┐                              │
         │ FirstLaunchActivationScreen│                              │
         └────────────┬──────────────┘                              │
                      │ (Saisie / Import / Scan)                    │
                      └──────────────────────┬──────────────────────┘
                                             │
                                  ┌──────────▼──────────┐
                                  │ wizard_completed ?  │
                                  └──────────┬──────────┘
                                             │
                               ┌─────────────┴─────────────┐
                               │                           │
                           [False]                       [True]
                               │                           │
                   ┌───────────▼───────────┐   ┌───────────▼───────────┐
                   │     WelcomeWizard     │   │  Dashboard Principal  │
                   │   (7 étapes guidées)  │   │  (Accès direct normal)│
                   └───────────┬───────────┘   └───────────────────────┘
                               │ (handleFinish)
                               ▼
                   ┌───────────────────────┐
                   │  Dashboard Principal  │
                   │ (Base vierge/fondateur│
                   └───────────────────────┘
```

---

## 3. PROCÉDURE EXACTE POUR EFFECTUER LE TEST SUR VOTRE MACHINE

### Étape 1 : Réinitialiser les données utilisateur pour simuler un Premier Démarrage
Ouvrez votre terminal PowerShell à la racine du projet et exécutez la commande officielle :

```powershell
npm run qa:reset-first-launch
```
*(ou : `powershell -ExecutionPolicy Bypass -File .\scripts\windows\reset-first-launch-qa.ps1`)*

> **Ce que fait ce script :**
> 1. Ferme tout processus Bird Academy résiduel.
> 2. Effectue une **sauvegarde automatique de sécurité** de vos données actuelles dans `%TEMP%\BirdAcademy_QA_Backup_<date>`.
> 3. Supprime uniquement les profils `%APPDATA%\Bird Academy Enterprise`, `%APPDATA%\react-example` et `%APPDATA%\Bird Academy`.
> 4. Génère le fichier de contrôle `WINDOWS_FIRST_LAUNCH_AFTER.txt`.
> 5. **Ne touche à aucun fichier du projet, aucun code source, aucun moteur métier, aucun binaire de Release.**

---

### Étape 2 : Lancer le binaire FIX4 déjà compilé

Double-cliquez sur :
`Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1-FIX4-Setup.exe`  
*(ou lancez la version portable : `Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1-FIX4.exe`)*

---

### Étape 3 : Dérouler le scénario de test étape par étape

| ID Test | Écran / Action | Comportement Attendu |
| :--- | :--- | :--- |
| **FIRST-LAUNCH-01** | Lancement initial | L'écran **`FirstLaunchActivationScreen`** s'affiche immédiatement. L'accès au Dashboard est verrouillé. |
| **FIRST-LAUNCH-02** | Test saisie erronée | Saisir une clé invalide -> Message d'erreur clair, l'application reste bloquée. |
| **FIRST-LAUNCH-03** | Activation de la licence | Saisir ou importer une licence valide -> L'activation réussit immédiatement. |
| **FIRST-LAUNCH-04** | Transition Onboarding | Le modal **`WelcomeWizard`** s'ouvre automatiquement en Étape 1. |
| **FIRST-LAUNCH-05** | Étape 1 : Langue | Tester le changement de langue (FR, EN, AR avec bascule RTL immédiate, ES, IT). Cliquer sur *Suivant*. |
| **FIRST-LAUNCH-06** | Étape 2 : Devise | Sélectionner une devise (ex: TND, EUR, USD). Cliquer sur *Suivant*. |
| **FIRST-LAUNCH-07** | Étape 3 : Élevage | Saisir le nom de l'élevage et de l'éleveur. |
| **FIRST-LAUNCH-08** | Étape 4 : Espèces | Sélectionner l'espèce principale et les objectifs d'élevage. |
| **FIRST-LAUNCH-09** | Étape 5 & 6 : Bâtiment & Cage | Créer le bâtiment/zone et la première cage d'élevage. |
| **FIRST-LAUNCH-10** | Étape 7 : Premier Oiseau | Saisir la bague et les informations du premier oiseau fondateur. Enregistrer et Terminer. |
| **FIRST-LAUNCH-11** | Accès au Dashboard | Le Dashboard s'ouvre avec la base initialisée propre (la cage et l'oiseau créés sont bien présents). |
| **FIRST-LAUNCH-12** | Test de Redémarrage | Fermer l'application et la relancer -> L'application s'ouvre **directement sur le Dashboard** (ni l'activation ni le Wizard ne réapparaissent). |

---

## 4. BILAN DE L'OUTILLAGE ET DES FICHIERS

### Fichiers Créés / Modifiés pour l'outillage QA
* [scripts/windows/reset-first-launch-qa.ps1](file:///d:/app%20canaris/28+/scripts/windows/reset-first-launch-qa.ps1) : Script dédié avec sauvegarde préventive et purge exhaustive.
* [tests/windows-first-launch-qa.test.ts](file:///d:/app%20canaris/28+/tests/windows-first-launch-qa.test.ts) : Suite automatisée 10/10 tests validant toutes les conditions de cycle de vie.
* [WINDOWS_FIRST_LAUNCH_FORENSIC_REPORT.md](file:///d:/app%20canaris/28+/WINDOWS_FIRST_LAUNCH_FORENSIC_REPORT.md) : Rapport forensique des conditions exactes du code source.
* [WINDOWS_FIRST_LAUNCH_BEFORE.txt](file:///d:/app%20canaris/28+/WINDOWS_FIRST_LAUNCH_BEFORE.txt) : Snapshot initial d'AppData.
* [package.json](file:///d:/app%20canaris/28+/package.json) : Ajout du script `"qa:reset-first-launch"`.

### Fichiers Métier et Production Strictement Non Modifiés
* `electron-main.cjs` : Intact (migration de production préservée).
* `src/features/licensing/` : Intact (moteur LMSE inchangé).
* `src/business/` : Intact (moteurs biologiques et génétiques inchangés).
* `src/reference/` & `src/utils/translations.ts` : Intacts.
* Binaires FIX4 dans `Release/Windows-RC3.1/` : Intacts et conservés sans altération.

---

## 5. STATUT ACTUEL

```text
======================================================================
  AUTOMATED FIRST-LAUNCH ANALYSIS : PASS (646/646 tests)
  TYPESCRIPT TYPECHECK            : PASS (0 erreurs)
  REAL FIRST-LAUNCH VALIDATION    : PENDING (Prêt pour votre test)
======================================================================
```

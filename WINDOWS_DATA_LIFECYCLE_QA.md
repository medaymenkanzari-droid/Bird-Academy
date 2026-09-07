# BIRD ACADEMY ENTERPRISE — PROTOCOLE QA & CYCLE DE VIE DES DONNÉES WINDOWS (RC3.1)

**Document ID :** `WINDOWS_DATA_LIFECYCLE_QA`  
**Version :** Release Candidate 3.1 (RC3.1)  
**Plateforme :** Windows 10 / Windows 11 x64  
**Date :** 20 août 2026  

---

## 1. Principes Fondamentaux de la Persistance Windows

Sous Windows, la désinstallation standard d'une application via l'installateur NSIS (`deleteAppDataOnUninstall: false`) supprime les fichiers exécutables du programme (`%LOCALAPPDATA%\Programs\...`), mais **préserve délibérément le dossier de profil utilisateur (`%APPDATA%`)**.

Ce comportement est le standard de sécurité de l'industrie (partagé par VS Code, Slack, Discord, Chrome, Spotify, etc.) afin de protéger les éleveurs contre toute perte accidentelle de leur élevage, de leur historique ou de leur licence lors d'une mise à jour logicielle.

---

## 2. Emplacements des Données & Migration

| Type de Données | Emplacement Windows | Rôle |
| :--- | :--- | :--- |
| **Profil Utilisateur Canonique (RC3.1+)** | `%APPDATA%\Bird Academy Enterprise` | Stockage principal Chromium LevelDB (`Local Storage/leveldb`), préférences et session |
| **Profil Utilisateur Legacy (RC2 / RC3)** | `%APPDATA%\react-example` | Ancien dossier de stockage conservé pour migration non destructive |
| **Fichiers Binaires Installés** | `%LOCALAPPDATA%\Programs\Bird Academy Enterprise` | Exécutable principal, runtime Electron, ressources applicatives |

### Migration Automatique Non Destructive
Au démarrage de RC3.1 :
1. Electron vérifie si `%APPDATA%\Bird Academy Enterprise` existe.
2. Si le dossier n'existe pas et qu'un dossier `%APPDATA%\react-example` est présent, Electron copie intégralement le profil existant vers `%APPDATA%\Bird Academy Enterprise`.
3. Le dossier legacy est conservé intact comme sauvegarde de sécurité.
4. L'utilisateur retrouve immédiatement son élevage et sa licence sans aucune manipulation.

---

## 3. Protocoles de Test QA

### Protocole A — Test de Mise à Jour (Upgrade Test)
**Objectif :** Valider qu'un éleveur passant de RC2 ou RC3 à RC3.1 conserve l'intégralité de ses données.

1. **Pré-requis :** Une version antérieure (RC2 ou RC3) est installée avec une licence active, un élevage configuré (oiseaux, cages, couples, finances) et le wizard complété.
2. **Action :** Désinstaller l'ancienne version via *Paramètres Windows > Applications installées > Désinstaller*, puis installer `Bird-Academy-User-Windows-RC3.1-Setup.exe` (ou installer directement par-dessus).
3. **Premier lancement :** Lancer Bird Academy RC3.1.
4. **Critères de succès obligatoires :**
   - Aucune demande de licence (licence LMSE immédiatement reconnue et valide) ;
   - Aucun affichage du `WelcomeWizard` ;
   - Le Dashboard s'ouvre directement ;
   - Tous les oiseaux, cages, couples, pontes, dépenses et ventes sont intacts ;
   - La devise, la langue et le thème configurés sont conservés.

---

### Protocole B — Test d'Installation Propre (Clean Install Test)
**Objectif :** Valider le parcours complet d'un nouvel éleveur sur une machine vierge.

1. **Action préliminaire :** Exécuter le reset QA sur la machine de test :
   ```powershell
   npm run qa:reset-windows-user
   ```
2. **Action :** Lancer `Bird-Academy-User-Windows-RC3.1-Setup.exe` (ou la version portable `Bird-Academy-User-Windows-RC3.1.exe`).
3. **Premier lancement :**
   - `FirstLaunchActivationScreen` s'affiche immédiatement ;
   - Saisir une clé de licence valide ou importer un fichier de licence Beta offline ;
   - Après activation réussie, le `WelcomeWizard` s'ouvre automatiquement ;
   - Compléter les 7 étapes du Wizard (Langue $\rightarrow$ Devise $\rightarrow$ Identité $\rightarrow$ Espèces $\rightarrow$ Installation/Zone $\rightarrow$ Première cage $\rightarrow$ Premier oiseau) ;
   - Cliquer sur « Terminer la configuration ».
4. **Critères de succès obligatoires :**
   - Base métier vierge au départ (0 oiseaux, 0 couples, 0 dépenses) ;
   - Référentiels biologiques statiques 100% disponibles (Canaris, Exotiques, Faune, Perruches, etc.) ;
   - 5 langues disponibles (FR, EN, AR, ES, IT) avec prise en charge du mode RTL pour l'arabe ;
   - Après complétion du wizard, l'application est prête à l'emploi.

---

### Protocole C — Test de Réinitialisation Usine QA (Factory Reset QA)
**Objectif :** Permettre aux équipes QA de réinitialiser l'application sur le même PC sans supprimer manuellement des répertoires système.

1. **Commande QA :**
   ```powershell
   npm run qa:reset-windows-user
   ```
   *Ou via PowerShell direct :*
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\reset-windows-user-qa.ps1
   ```
2. **Comportement du script :**
   - Détecte et ferme tout processus Bird Academy actif ;
   - Purge `%APPDATA%\Bird Academy Enterprise` ;
   - Purge `%APPDATA%\react-example` ;
   - Affiche les confirmations `[OK] Processus fermé`, `[OK] Profil Bird Academy Enterprise supprimé`, `[OK] Profil legacy react-example supprimé`, `[OK] Reset QA terminé` ;
   - **Ne supprime aucun fichier du projet** (sources, dist, node_modules, exécutables restent 100% intacts).
3. **Vérification post-reset :** Relancer l'application $\rightarrow$ s'ouvre directement sur `FirstLaunchActivationScreen`.

---

## 4. Matrice des Résultats Attendus (Expected Results Matrix)

| Réf Test | Scénario | Comportement Attendu | Statut QA |
| :--- | :--- | :--- | :---: |
| **WIN-DATA-LIFE-01** | Upgrade | Licence active conservée sans ressaisie | **VALIDÉ** |
| **WIN-DATA-LIFE-02** | Upgrade | `bird_academy_wizard_completed` conservé (Wizard sauté) | **VALIDÉ** |
| **WIN-DATA-LIFE-03** | Upgrade | Liste complète des oiseaux conservée | **VALIDÉ** |
| **WIN-DATA-LIFE-04** | Upgrade | Liste complète des cages et habitat conservée | **VALIDÉ** |
| **WIN-DATA-LIFE-05** | Upgrade | Couples et historique de reproduction conservés | **VALIDÉ** |
| **WIN-DATA-LIFE-06** | Upgrade | Devise, langue et thème conservés | **VALIDÉ** |
| **WIN-DATA-LIFE-07** | Clean Install | Absence de licence $\rightarrow$ `FirstLaunchActivationScreen` | **VALIDÉ** |
| **WIN-DATA-LIFE-08** | Clean Install | Après activation $\rightarrow$ `WelcomeWizard` affiché | **VALIDÉ** |
| **WIN-DATA-LIFE-09** | Clean Install | 0 oiseaux dans la base utilisateur initiale | **VALIDÉ** |
| **WIN-DATA-LIFE-10** | Clean Install | 0 cages superflues dans la base utilisateur initiale | **VALIDÉ** |
| **WIN-DATA-LIFE-11** | Clean Install | 0 couples dans la base utilisateur initiale | **VALIDÉ** |
| **WIN-DATA-LIFE-12** | Clean Install | 0 dépenses et 0 ventes dans la base utilisateur initiale | **VALIDÉ** |
| **WIN-DATA-LIFE-13** | Référentiel | `SPECIES_REGISTRY` complet et disponible | **VALIDÉ** |
| **WIN-DATA-LIFE-14** | i18n | Dictionnaires FR, EN, AR, ES, IT complets et réactifs | **VALIDÉ** |
| **WIN-DATA-LIFE-15** | Reset QA | Purge complète des données de profil utilisateur | **VALIDÉ** |
| **WIN-DATA-LIFE-16** | Reset QA | Aucun référentiel statique supprimé | **VALIDÉ** |
| **WIN-DATA-LIFE-17** | Reset QA | Aucun fichier source / build / module altéré | **VALIDÉ** |
| **WIN-DATA-LIFE-18** | Stabilité | Démarrage normal sans effacement automatique de données | **VALIDÉ** |
| **WIN-DATA-LIFE-19** | Migration | Copie transparente non destructive depuis `react-example` | **VALIDÉ** |
| **WIN-DATA-LIFE-20** | Conformité | Cycle de vie des données Windows RC3.1 100% conforme | **VALIDÉ** |

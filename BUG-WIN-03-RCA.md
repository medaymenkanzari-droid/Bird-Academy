# BIRD ACADEMY ENTERPRISE — RAPPORT D'ANALYSE DE CAUSE RACINE (RCA)
## BUG-WIN-03 : PERSISTANCE DES DONNÉES RC2 APRÈS DÉSINSTALLATION / RÉINSTALLATION SOUS WINDOWS

**Date :** 20 août 2026  
**Document ID :** `BUG-WIN-03-RCA`  
**Statut :** AUDIT COMPLET & ANALYSE DÉTAILLÉE  
**Plateforme :** Windows 11 (Desktop x64)  
**Versions concernées :** Release Candidate 2 (RC2) & Release Candidate 3 (RC3)

---

## 1. Observation Terrain

Sur une machine Windows 11 réelle :
1. Bird Academy User Windows RC2 était installé et configuré (licence activée, Wizard complété, données métier présentes).
2. RC2 a été désinstallé via le panneau standard de Windows (« Applications installées » / « Désinstaller »).
3. Bird Academy User Windows RC3 a été installé via `Bird-Academy-User-Windows-RC3-Setup.exe`.
4. Au premier lancement de RC3 :
   - L'application s'est ouverte directement sur le Dashboard principal ;
   - Aucun écran d'activation de licence (`FirstLaunchActivationScreen`) n'a été affiché ;
   - Aucun assistant d'intégration (`WelcomeWizard`) n'a été déclenché ;
   - Les informations de licence et l'état applicatif de RC2 ont été automatiquement retrouvés.

---

## 2. Root Cause (Cause Racine)

La cause racine repose sur la combinaison de **deux mécanismes normaux et standards de l'écosystème Windows / Electron / NSIS** :

1. **Persistance standard du profil utilisateur lors de la désinstallation Windows (NSIS) :**
   - Par défaut, l'installateur/désinstallateur NSIS généré par `electron-builder` (`deleteAppDataOnUninstall: false`) supprime les fichiers binaires du programme (`%LOCALAPPDATA%\Programs\<app>`), les raccourcis et les clés de registre Windows, mais **ne supprime pas le dossier de profil utilisateur (`%APPDATA%`)**.
   - Ce comportement est le standard absolu sous Windows (partagé par VS Code, Discord, Slack, Chrome, Spotify, etc.) afin d'éviter la destruction irrémédiable des bases de données et des licences des utilisateurs lors d'une simple réinstallation, réparation ou mise à jour.

2. **Identité de stockage partagée (Origine `file://` & `userData` identique) :**
   - RC2 et RC3 s'exécutent tous deux dans l'environnement Electron avec la même configuration d'origine Chromium (`file://`) et le même chemin de stockage `userData` (`%APPDATA%\react-example`).
   - Le moteur `localStorage` (stocké sous forme de base LevelDB dans `%APPDATA%\react-example\Local Storage\leveldb`) est donc resté présent sur le disque après la désinstallation de RC2.
   - Au démarrage de RC3, Electron a réouvert ce même dossier `userData` et a chargé la base LevelDB existante contenant :
     - La clé `bird_academy_lmse_active_license` (licence LMSE valide et signée) ;
     - La clé `bird_academy_wizard_completed = "true"` ;
     - Les tables de données métier (`canaris`, `cages`, `couples`, `pontes`, etc.).

---

## 3. Contributing Factors (Facteurs Secondaires)

1. **Nom de package par défaut dans `package.json` (`"name": "react-example"`) :**
   - `electron-main.cjs` ne définit pas explicitement `app.name` ni `app.setPath('userData', ...)`.
   - Electron utilise donc le champ `"name"` de `package.json` (`react-example`) comme nom de dossier sous `%APPDATA%`, au lieu d'un nom explicite tel que `Bird Academy Enterprise`.
2. **Absence d'option de suppression des données lors de la désinstallation NSIS :**
   - L'installateur NSIS est configuré en mode `oneClick: true` sans invite de désinstallation demandant à l'utilisateur s'il souhaite supprimer ou conserver ses données personnelles et sa licence.
3. **Absence de distinction de cycle de vie entre "Upgrade applicatif" et "Installation propre (Clean Install)" :**
   - Sur le plan métier et produit, la persistance des données lors d'un passage RC2 → RC3 est le comportement attendu pour un utilisateur final (conservation de son élevage et de sa licence).
   - Cependant, pour un testeur QA effectuant un test d'installation propre (Clean Install), les données doivent être préalablement purgées pour simuler un poste vierge.

---

## 4. Matrice des Scénarios & Comportement Constaté vs Attendu

| Scénario | Contexte | Comportement Actuel | Comportement Attendu | Conforme Produit ? |
| :--- | :--- | :--- | :--- | :---: |
| **Scénario A : Mise à jour (Upgrade RC2 → RC3)** | Installation de RC3 par-dessus RC2 (ou après désinstallation sans purge) | Récupère licence et données, saute le Wizard | Conserver la licence, conserver les données, ouvrir directement | **OUI (Comportement normal)** |
| **Scénario B : Réinstallation standard** | RC2 désinstallé, données `%APPDATA%` conservées, RC3 installé | Récupère licence et données | Conserver la licence et les données (sécurité utilisateur) | **OUI (Comportement normal)** |
| **Scénario C : Installation propre (Clean Install)** | Données `%APPDATA%` purgées manuellement ou poste vierge | Bloque sur `FirstLaunchActivationScreen`, puis lance `WelcomeWizard`, base vierge (0 oiseaux) | Bloquer sur `FirstLaunchActivationScreen`, puis lancer `WelcomeWizard`, base vierge | **OUI (Vérifié)** |
| **Scénario D : Machine Windows neuve** | Aucun historique Bird Academy | Bloque sur `FirstLaunchActivationScreen`, puis `WelcomeWizard` | Bloquer sur `FirstLaunchActivationScreen`, puis `WelcomeWizard` | **OUI (Vérifié)** |

---

## 5. Audit Détaillé par Composant

### 5.1 Identité Applicative & Stockage
- **AppId :** `com.birdacademy.app`
- **ProductName :** `Bird Academy User RC3` / `Bird Academy Enterprise`
- **Package Name :** `react-example`
- **Dossier d'installation :** `C:\Users\<User>\AppData\Local\Programs\react-example`
- **Dossier de données (`userData`) :** `C:\Users\<User>\AppData\Roaming\react-example`
- **Moteur de stockage :** Chromium LocalStorage (LevelDB dans `Local Storage/leveldb`)
- **Origine Web :** `file://`

### 5.2 Moteur de Licence (LMSE)
- **Clé principale :** `bird_academy_lmse_active_license`
- **Repository :** `LocalStorageLicenseRepository`
- **Empreinte matérielle :** `DeviceFingerprintEngine` (générée de manière stable à partir des caractéristiques matérielles Windows, écran, timezone, OS).
- **Validation :** Lors du démarrage de RC3 sur la même machine, l'empreinte matérielle correspond rigoureusement à la signature de la licence enregistrée sous RC2. LMSE valide donc légitimement la licence.

### 5.3 Moteur de Premier Démarrage (First Launch & Wizard)
- **Clé de complétion :** `bird_academy_wizard_completed` (valeur `"true"`)
- **Logique dans `App.tsx` :**
  ```typescript
  if (licenseState !== 'LICENSE_VALID') return;
  const isCompleted = localStorage.getItem('bird_academy_wizard_completed') === 'true';
  if (!isCompleted) {
    setShowWizard(true);
  }
  ```
- Dès lors que `bird_academy_wizard_completed` est `"true"`, `showWizard` reste `false`.

### 5.4 Base de Données Métier
- Les clés `canaris`, `cages`, `couples`, `pontes`, `sante`, `alimentation`, `depenses`, `ventes` sont stockées dans le même `localStorage`.
- En l'absence de purge explicite de `%APPDATA%`, ces données persistent naturellement entre les builds.

---

## 6. Recommandations Produit & Solutions Envisagées

### Option 1 : Définir clairement le protocole de test QA (Recommandé)
- Distinguer formellement les tests de **Mise à Jour (Upgrade Test)** des tests d'**Installation Propre (Clean Install Test)** :
  - **Pour un test Upgrade :** Installer RC3 sur RC2 existant (vérifier que l'éleveur ne perd ni sa licence ni ses oiseaux).
  - **Pour un test Clean Install :** Supprimer le dossier `%APPDATA%\react-example` (ou `%APPDATA%\Bird Academy Enterprise`) avant d'installer RC3, ou utiliser la fonction intégrée « Réinitialisation Usine » (`Parametres -> Réinitialiser`).

### Option 2 : Option de désinstallation interactive NSIS (Optionnel pour la production finale)
- Configurer NSIS (`electron-builder`) pour demander poliment lors de la désinstallation :
  *« Souhaitez-vous supprimer définitivement vos données d'élevage et votre licence ? »*
  - Si l'utilisateur clique **Oui** : suppression de `%APPDATA%\<app>`.
  - Si l'utilisateur clique **Non** : conservation des données pour réinstallation future.

### Option 3 : Normalisation du nom de profil `userData` (Recommandé pour la clarté)
- Aligner `package.json` et `electron-main.cjs` pour nommer explicitement le dossier de données `Bird Academy Enterprise` plutôt que `react-example`.

---

## 7. Fichiers et Périmètres

### Fichiers Protégés (AUCUNE MODIFICATION NÉCESSAIRE)
- `src/features/licensing/**` (Le moteur LMSE, `LicenseValidator`, `DeviceFingerprintEngine` et `LocalStorageLicenseRepository` fonctionnent exactement selon les spécifications de sécurité).
- `src/features/quality/components/WelcomeWizard.tsx` (Le composant respecte les règles d'onboarding).
- `src/storage/**` (Le moteur de persistance applicative est intègre).
- `src/business/**` (Tous les moteurs métier restent intacts).

### Fichiers Potentiellement Concernés (pour normalisation ou packaging futur)
- `package.json` (Normalisation du champ `"name"` si souhaité).
- `electron-main.cjs` (Définition explicite de `app.name`).
- Documentation QA / Protocole de validation Windows.

---

## 8. Conclusion

Le constat du terrain **n'est pas une anomalie de code applicatif ni un bug de sécurité LMSE**, mais le comportement standard de préservation des données de profil Windows (`%APPDATA%`) lors d'une désinstallation NSIS.

La licence et les données de RC2 ont été conservées parce que Windows ne détruit pas les données personnelles de l'utilisateur lors d'une désinstallation standard, ce qui protège les utilisateurs contre la perte accidentelle de leur travail lors d'un cycle de mise à jour.

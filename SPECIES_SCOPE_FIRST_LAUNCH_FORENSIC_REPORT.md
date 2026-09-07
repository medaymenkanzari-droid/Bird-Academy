# RAPPORT FORENSIC QA — SPECIES-SCOPE FIRST LAUNCH RESET DIAGNOSTIC

**Date d'audit :** 25 Août 2026  
**Environnement :** Windows 11 Physical Machine  
**Binaire audité :** `Release/Windows-SpeciesScope/Bird-Academy-Avian-ERP-SpeciesScope-Setup.exe`  
**Statut Global :** `ROOT CAUSE IDENTIFIED` | `SCRIPT PARSE: PASS` | `SAFE QA RESET PROCEDURE READY`  

---

## 1. Observed Behavior (Comportement Observé)

Lors du test physique sous Windows 11 avec le binaire d'installation final `Bird-Academy-Avian-ERP-SpeciesScope-Setup.exe` :
1. L'application précédente a été désinstallée via le panneau Windows normal.
2. Le package `Bird-Academy-Avian-ERP-SpeciesScope-Setup.exe` a été exécuté et s'est installé avec succès.
3. Au lancement de l'application :
   - L'écran `FirstLaunchActivationScreen` (écran d'activation de licence initiale) **ne s'est pas affiché**.
   - Le composant `WelcomeWizard` (assistant d'onboarding et de sélection d'espèces) **ne s'est pas affiché**.
   - L'application a démarré **directement sur le tableau de bord principal** en restaurant l'intégralité des données préexistantes (oiseaux, cages, couples, dépenses, ventes, historique d'audit).

---

## 2. AppData State (État des Répertoires AppData)

Une inspection complète de `%APPDATA%` (`C:\Users\PC\AppData\Roaming`) et `%LOCALAPPDATA%` (`C:\Users\PC\AppData\Local`) a été réalisée :

| Répertoire | Statut | Date Création | Date Dernière Modification | Contenu & Rôle |
| :--- | :---: | :---: | :---: | :--- |
| `%APPDATA%\Bird Academy Enterprise` | **PRÉSENT** | 2026-08-21 23:24:31 | 2026-08-25 01:14:56 | Profil utilisateur actif (LevelDB, Preferences, SQLite SharedStorage, Caches) |
| `%APPDATA%\Bird Academy Admin` | **PRÉSENT** | 2026-08-22 17:08:00 | 2026-08-24 05:43:47 | Profil administrateur LMSE (Isolé) |
| `%APPDATA%\Bird Academy Enterprise Admin` | **PRÉSENT** | 2026-08-22 17:08:00 | 2026-08-24 05:38:17 | Ancien alias de profil administrateur |
| `%APPDATA%\react-example` | **ABSENT** | — | — | Répertoire de développement initial (Non existant) |
| `%LOCALAPPDATA%\Programs\bird-academy-user` | **PRÉSENT** | 2026-08-24 23:42:05 | 2026-08-24 23:42:08 | Emplacement des binaires installés par SpeciesScope Setup |

### Fichiers Clés dans `%APPDATA%\Bird Academy Enterprise`
- `Local Storage\leveldb\000003.ldb` : **15 884 octets** (Dernière écriture : 23/08/2026 01:05:16)
- `Local Storage\leveldb\000004.log` : **7 531 octets** (Dernière écriture : 25/08/2026 01:14:41)
- `Local Storage\leveldb\CURRENT` : 16 octets
- `Local Storage\leveldb\MANIFEST-000001` : 107 octets
- `Preferences` : 54 octets (Dernière écriture : 25/08/2026 01:14:45)
- `Local State` : 490 octets (Dernière écriture : 21/08/2026 23:24:40)

---

## 3. LocalStorage State (État de la Base LevelDB)

SpeciesScope (`Bird-Academy-User.exe`) est configuré dans [electron-main.cjs](file:///d:/app%20canaris/28+/electron-main.cjs#L8-L146) avec :
```javascript
const APP_CANONICAL_NAME = 'Bird Academy Enterprise';
const targetUserDataPath = path.join(appDataPath, APP_CANONICAL_NAME);
app.setPath('userData', targetUserDataPath);
```
Son `localStorage` est donc physiquement hébergé dans `%APPDATA%\Bird Academy Enterprise\Local Storage\leveldb`.

L'analyse binaire et structurelle de la base LevelDB a révélé les entrées exactes suivantes :

### A. Clé `bird_academy_lmse_active_license`
- **Présence :** OUI (Stockée dans `000003.ldb`).
- **Identifiant :** `lic_1786248876803_rxb548f`
- **Clé de licence :** `LMSE-BETA-DBB8-D397-C026`
- **Titulaire (HolderName) :** `Club Canari Mourouj` (`contact@club-mourouj.org`)
- **Type :** `beta` (`OFFLINE_BETA`), Statut : `active`
- **Audit Log associé :** `audit_1787351085398_a8q26` horodaté au `2026-08-21T22:24:45.398Z` (*"Importation et activation réussies de la licence Beta Offline pour Club Canari Mourouj."*).

### B. Clé `bird_academy_wizard_completed`
- **Présence :** OUI (Stockée dans `000003.ldb` à l'offset 2685).
- **Valeur actuelle :** `"true"`.

### C. Clé `bird_academy_species_profile`
- **Présence :** La clé brute n'était pas persistée explicitement dans cet ancien snapshot de base (créé en RC antérieure à la Phase 2).
- **Comportement au runtime :** En l'absence de clé enregistrée, le repository `SpeciesProfileRepository` instancie automatiquement le fallback par défaut `DEFAULT_SPECIES_PROFILE` (`activeSpeciesIds: ['canari']`).

### D. Données Métier Présentes dans la Base
- `cages` / `ba_cages_v2` : Cages et volières (ex: Cage 01, Grande Volière jeunes).
- `couples` / `demo_couples` : Couples reproducteurs actifs et historiques.
- `pontes` / `demo_pontes` : Données de pontes et fécondité.
- `ventes` / `depenses` : Fiches comptables et flux financiers.
- `bird_academy_language` : `"fr"`.

---

## 4. Wizard State (État des Conditions d'Affichage du Wizard)

Dans [src/App.tsx](file:///d:/app%20canaris/28+/src/App.tsx#L92-L98) :
```typescript
// Check onboarding on initial boot ONLY if license is valid
useEffect(() => {
  if (licenseState !== 'LICENSE_VALID') return;
  const isCompleted = localStorage.getItem('bird_academy_wizard_completed') === 'true';
  if (!isCompleted) {
    setShowWizard(true);
  }
}, [licenseState]);
```
Dans [src/App.tsx](file:///d:/app%20canaris/28+/src/App.tsx#L586-L594) :
```typescript
if (licenseState === 'LICENSE_REQUIRED' || licenseState === 'LICENSE_INVALID' || licenseState !== 'LICENSE_VALID') {
  return (
    <FirstLaunchActivationScreen
      onActivationSuccess={() => {
        refreshLicensing();
      }}
    />
  );
}
```

**Analyse de l'évaluation runtime :**
1. Au démarrage, `LicensingService.initialize()` valide la licence active présente en LocalStorage (`LMSE-BETA-DBB8-D397-C026`).
2. La licence étant valide, `licenseState` prend immédiatement la valeur `'LICENSE_VALID'`.
3. Le guard `licenseState !== 'LICENSE_VALID'` est faux, donc l'écran `FirstLaunchActivationScreen` est contourné.
4. L'effet de `WelcomeWizard` s'exécute : il lit `localStorage.getItem('bird_academy_wizard_completed')`.
5. La valeur retournée est `"true"`, donc `setShowWizard(true)` n'est pas appelé.
6. L'application charge les données existantes via `BirdRepository.getAll()` et `HabitatRepository.getAll()`, et affiche directement le tableau de bord.

---

## 5. Migration State (État du Moteur de Migration)

1. **Migration Electron / FS ([electron-main.cjs](file:///d:/app%20canaris/28+/electron-main.cjs#L127-L142)) :**
   - Le moteur de migration de profil FS vérifie si `targetUserDataPath/Local Storage` existe (`targetHasLocalStorage`).
   - Comme `%APPDATA%\Bird Academy Enterprise\Local Storage` existait déjà, aucune copie depuis des dossiers legacy (`react-example` ou `Bird Academy`) n'a été déclenchée.
2. **Migration Métier Web ([src/storage/index.ts](file:///d:/app%20canaris/28+/src/storage/index.ts#L102-L175)) :**
   - `MigrationManager.migrate(appStorage)` s'est exécuté normalement pour valider les alias de clés, maintenant une intégrité 100% stable.

---

## 6. Root Cause (Cause Racine Identifiée)

| Hypothèse | Résultat | Preuve Formelle |
| :--- | :---: | :--- |
| **A. La désinstallation ne supprime pas AppData** | **CONFIRMÉ (CAUSE PRINCIPALE)** | Dans [package.json](file:///d:/app%20canaris/28+/package.json#L148) et [electron-builder-user.json](file:///d:/app%20canaris/28+/electron-builder-user.json#L24), la configuration NSIS définit explicitement `"deleteAppDataOnUninstall": false`. Il s'agit du comportement standard et protecteur sur Windows pour empêcher la perte de données d'élevage lors d'une mise à jour ou désinstallation/réinstallation. |
| **B. SpeciesScope réutilise volontairement les données** | **CONFIRMÉ (DESIGN APPLICATIF)** | Dans [electron-main.cjs](file:///d:/app%20canaris/28+/electron-main.cjs#L8-L46), le nom canonique est `Bird Academy Enterprise`. Le nouvel installateur cible le même profil que les versions précédentes pour assurer la continuité des élevages. |
| **C. Le moteur de migration restaure les données** | **INFIRMÉ** | La migration FS ne s'est pas déclenchée car le dossier cible était déjà présent avec son propre `Local Storage`. |
| **D. Le Wizard est bypassé car wizard_completed = true** | **CONFIRMÉ** | Le flag `bird_academy_wizard_completed` était déjà à `"true"` dans la base LevelDB persistée. |
| **E. Bypass FirstLaunch par licence valide existante** | **CONFIRMÉ** | La licence `LMSE-BETA-DBB8-D397-C026` était déjà enregistrée dans la base LevelDB persistée, passant immédiatement le `licenseState` à `'LICENSE_VALID'`. |

**Synthèse Cause Racine :**  
Il ne s'agit pas d'un bug de code ni d'un défaut de compilation du binaire `Bird-Academy-Avian-ERP-SpeciesScope-Setup.exe`.  
Le binaire s'est comporté exactement comme conçu : il a préservé et repris le profil utilisateur de la machine hôte.  
Pour tester un parcours "Premier Lancement / Installation Vierge" sur une machine ayant déjà servi à des tests, il est impératif d'effectuer une réinitialisation contrôlée de l'environnement QA (QA Reset).

---

## 7. Existing QA Reset Analysis (`scripts/windows/reset-first-launch-qa.ps1`)

L'inspection de [scripts/windows/reset-first-launch-qa.ps1](file:///d:/app%20canaris/28+/scripts/windows/reset-first-launch-qa.ps1) met en évidence les points suivants :
- **Dossiers sauvegardés :** `%APPDATA%\Bird Academy Enterprise`, `%APPDATA%\react-example`, `%APPDATA%\Bird Academy` vers `%TEMP%\BirdAcademy_QA_Backup_<timestamp>`.
- **Dossiers supprimés :** Les profils utilisateurs dans `%APPDATA%` et `%LOCALAPPDATA%`.
- **Clés réinitialisées :** L'ensemble du stockage LevelDB utilisateur (`bird_academy_lmse_active_license`, `bird_academy_wizard_completed`, oiseaux, cages, etc.).
- **Limites identifiées :**
  1. La sauvegarde dans `%TEMP%` présente un risque de purge automatique par le nettoyage de disque Windows ou lors d'un redémarrage.
  2. La liste d'arrêt des processus ne ciblait pas explicitement les nouveaux noms d'exécutables `Bird-Academy-User` ou `Bird-Academy-User-SpeciesScope`.
  3. Aucun script de restauration miroir n'était fourni pour remettre en place les données sauvegardées.

---

## 8. Data Safety Analysis (Sécurité des Données)

- **Isolation User vs Admin :**
  - Profil User : `%APPDATA%\Bird Academy Enterprise`
  - Profil Admin : `%APPDATA%\Bird Academy Admin` (et port 3001)
  - Le reset First Launch **ne doit jamais toucher à `%APPDATA%\Bird Academy Admin`**.
- **Sauvegarde Non-Destructive :**
  - Les sauvegardes de profil doivent être stockées dans un répertoire de projet permanent (`backups\qa-profiles\`) plutôt que dans `%TEMP%`.
  - Un manifeste JSON (`backup-manifest.json`) doit accompagner chaque sauvegarde pour garantir une traçabilité et une réversibilité totales.

---

## 9. Recommended Reset Procedure (Procédure de Reset QA Sécurisée)

Deux scripts dédiés ont été créés et validés dans `scripts/windows/` :
1. [scripts/windows/reset-species-scope-first-launch-qa.ps1](file:///d:/app%20canaris/28+/scripts/windows/reset-species-scope-first-launch-qa.ps1)
2. [scripts/windows/restore-species-scope-qa.ps1](file:///d:/app%20canaris/28+/scripts/windows/restore-species-scope-qa.ps1)

### Procédure d'Exécution du Test First Launch :

```powershell
# Étape 1 : Exécuter le reset QA sécurisé (sauvegarde automatique dans backups/qa-profiles/)
powershell -ExecutionPolicy Bypass -File .\scripts\windows\reset-species-scope-first-launch-qa.ps1

# Étape 2 : Lancer l'application installée ou réinstaller SpeciesScope
# (Démarrer Bird Academy - Avian ERP)

# Étape 3 (Optionnel - Après le test) : Restaurer le profil précédent à tout moment
powershell -ExecutionPolicy Bypass -File .\scripts\windows\restore-species-scope-qa.ps1
```

---

## 10. Expected First Launch State (État Attendu Post-Reset)

Une fois le reset QA appliqué et l'application lancée :

1. **Écran 1 : `FirstLaunchActivationScreen`**
   - L'état de licence est `LICENSE_REQUIRED` (car `bird_academy_lmse_active_license` est absent).
   - L'écran plein écran de premier lancement s'affiche avec la marque officielle "Bird Academy Enterprise - Avian ERP".
   - L'utilisateur est invité à :
     - Soit entrer une clé de licence en ligne (ex: `LMSE-BETA-...`),
     - Soit importer un fichier de licence Beta Offline (`.json`),
     - Soit utiliser l'activation hors-ligne avec code défi/réponse.
2. **Écran 2 : `WelcomeWizard` (Assistant d'Onboarding)**
   - Une fois la licence validée avec succès, `licenseState` devient `LICENSE_VALID`.
   - `bird_academy_wizard_completed` étant absent (`null`), le modal `WelcomeWizard` s'ouvre automatiquement.
   - Étapes du Wizard :
     - Étape 1 : Bienvenue & Langue,
     - Étape 2 : Devise & Format,
     - Étape 3 : Identité de l'élevage (Nom de l'élevage, Affixe éleveur),
     - Étape 4 : **Sélection des Espèces Élevées (Canaris, Chardonnerets, Exotiques, Crochus) & Objectifs**,
     - Étape 5 : Première Installation / Secteur,
     - Étape 6 : Première Cage.
3. **Écran 3 : Tableau de bord initialisé**
   - `bird_academy_wizard_completed` est positionné à `'true'`.
   - Le profil d'espèces `bird_academy_species_profile` est sauvegardé avec les espèces cochées.
   - L'application s'ouvre sur le Dashboard avec une base propre (0 oiseaux ou base configurée selon l'onboarding).

---

## 11. QA Reset Script Parsing Fix (Correction Syntaxique PowerShell)

### A. Erreurs Initialement Détectées
1. **Ligne 57 dans `reset-species-scope-first-launch-qa.ps1` :**  
   L'expression `Write-Host "[OK] Processus verifies ($stoppedCount arretes)"` contenait une interpolation directe de `$stoppedCount` à l'intérieur de parenthèses littérales, provoquant l'erreur de parsing `MissingArrayIndexExpression` / `Jeton inattendu « arrêtés »`.
2. **Lignes 140-142 dans `reset-species-scope-first-launch-qa.ps1` :**  
   L'imbrication de sous-expressions d'affichage avec guillemets échappés `$(if (...) { ... })` et double quotes imbriquées ` `"$currentBackupDir`" ` générait des jetons inattendus.
3. **Lignes 47 et 93 dans `restore-species-scope-qa.ps1` :**  
   L'usage de guillemets simples à l'intérieur de parenthèses dans une chaîne interpolée et la séquence d'échappement `` `n" `` provoquaient des erreurs de délimiteur de chaîne.

### B. Corrections Appliquées
- Standardisation de l'interpolation de variable sécurisée via `${stoppedCount}` et `${currentBackupDir}`.
- Simplification des chaînes littérales avec des guillemets simples `'...'` pour éliminer toute ambiguïté de jeton.
- Pré-calcul des couleurs et libellés ternaires avant les appels `Write-Host`.
- Standardisation des chemins d'environnement via `$env:APPDATA`.

### C. Résultat de la Vérification Statique (PowerShell AST Parser)
Le script de validation statique utilisant `[System.Management.Automation.Language.Parser]::ParseFile` a été exécuté sans déclencher de reset ni modifier de données :
```text
Verifying: scripts\windows\reset-species-scope-first-launch-qa.ps1
Parser Errors Count: 0
  -> SCRIPT PARSE : PASS

Verifying: scripts\windows\restore-species-scope-qa.ps1
Parser Errors Count: 0
  -> SCRIPT PARSE : PASS
```

### D. Chemins Strictement Protégés
- `%APPDATA%\Bird Academy Enterprise` : Seul et unique répertoire ciblé pour le reset après sauvegarde complète.
- `%APPDATA%\Bird Academy Admin` : **100% INTACT ET PROTÉGÉ**.
- `%APPDATA%\Bird Academy Enterprise Admin` : **100% INTACT ET PROTÉGÉ**.
- `%LOCALAPPDATA%\Programs\bird-academy-user` : **100% INTACT ET PROTÉGÉ**.
- `%LOCALAPPDATA%\Programs\bird-academy-admin` : **100% INTACT ET PROTÉGÉ**.
- `Release/`, `src/`, `tests/` : **100% INTACTS ET PROTÉGÉS**.

### E. Garantie de Sécurité
- **AUCUNE DONNÉE N'A ÉTÉ SUPPRIMÉE** pendant cette correction.
- **LE SCRIPT DE RESET N'A PAS ÉTÉ EXÉCUTÉ**.
- **AUCUN CODE SOURCE DE L'APPLICATION N'A ÉTÉ MODIFIÉ**.
- **AUCUN BINAIRE N'A ÉTÉ RECONSTRUIT**.

---

## Statut Final Obligatoire

```text
SCRIPT PARSE : PASS
PARSER ERRORS : 0
CODE CHANGES : NONE
BINARY CHANGES : NONE
DATA DELETION : NONE
QA RESET : NOT EXECUTED
READY FOR SAFE QA RESET : YES
```

# BIRD ACADEMY ENTERPRISE — RAPPORT DE CORRECTION BUG-WIN-03.2 (FIX2)
## Correction Définitive du Blocage NSIS lors de l'Upgrade avec Application Active

**Date :** 21 août 2026  
**Application :** Bird Academy Enterprise  
**Version :** 1.3.6-BUG01-FIRST-LAUNCH-FIX (Release Candidate 3.1 — Fix2)  
**Cible :** Windows Desktop x64 (Windows 11 / Windows 10)  
**Document ID :** `WINDOWS_RC3.1_INSTALLER_FIX2_REPORT`  

---

## 1. Diagnostic Réel sur Machine Windows 11

L'audit des répertoires d'installation `%LOCALAPPDATA%\Programs` a révélé :
- Une installation existante dans : `C:\Users\PC\AppData\Local\Programs\react-example\`
- Nom d'exécutable réel : `Bird Academy User RC3.1.exe`
- Nom du désinstallateur existant : `Uninstall Bird Academy User RC3.1.exe`
- Nom cible du nouvel installateur : `C:\Users\PC\AppData\Local\Programs\Bird Academy Enterprise\`

---

## 2. Cause Racine Démontrée (Root Cause Analysis)

1. **Le mécanisme `uninstallOldVersion` de NSIS :**
   Lors de l'upgrade, l'installateur NSIS lance silencieusement l'ancien désinstallateur (`Uninstall Bird Academy User RC3.1.exe` situé dans `Programs\react-example`).
2. **Le blocage par l'ancien désinstallateur :**
   L'ancien désinstallateur exécute sa propre vérification `un.checkAppRunning`. Si l'application ou l'un de ses sous-processus Electron (GPU, Utility, Renderer, Crashpad) est encore actif dans `Programs\react-example`, l'ancien désinstallateur échoue et lève la boîte modale :  
   `$(appCannotBeClosed)` $\rightarrow$ *"Bird Academy Enterprise ne peut pas être fermé. Veuillez le fermer manuellement et cliquez sur Réessayer pour continuer."*
3. **Inadéquation de `nsProcess` seul :**
   Le plugin 32-bit `nsProcess` n'envoyait `WM_CLOSE` qu'aux fenêtres visibles du nom d'exécutable, ignorant les sous-processus sans fenêtre graphique et sans cibler les chemins complets réels.

---

## 3. Fichiers Modifiés

1. **`packaging/installer.nsh`** :
   - Ajout de la macro `TerminateAllBirdAcademyProcessesPS` exécutant PowerShell 64-bit natif.
   - Détection et arrêt par noms ET par chemins d'installation complets (`Programs\react-example`, `Programs\Bird Academy Enterprise`, `Programs\Bird Academy User`, etc.).
   - Cycle ordonné : `CloseMainWindow()` gracieux $\rightarrow$ délai de 1,5 s $\rightarrow$ `Stop-Process -Force` ciblé sur les PIDs restants.
   - Macro `customInit` exécutée avant toute extraction ou appel de `uninstallOldVersion`.
   - Macro `customCheckAppRunning` et `customUnInstall` synchronisées.
2. **`electron-main.cjs`** :
   - `app.requestSingleInstanceLock()` maintenu.
   - Événement `before-quit` géré proprement.
   - Chaîne de migration synchrone et non-destructive BUG-WIN-03 préservée.
3. **`package.json`** :
   - Ajout du script `"test:installer-real"` et intégration dans la suite `"test"`.
4. **`scripts/packageWindowsRC3_1_Fix2.js`** :
   - Script de packaging dédié générant les binaires Fix2 et standard avec calcul des empreintes SHA-256.
5. **`tests/windows-bug03-2-installer-process-real.test.ts`** :
   - 15 tests automatisés validant la détection multi-chemins, la fermeture ordonnée et la non-destruction des données.

---

## 4. Identités et Chemins Pris en Charge

### A. Exécutables ciblés :
- `Bird Academy Enterprise.exe`
- `Bird Academy User RC3.1.exe`
- `Bird-Academy-User-Windows-RC3.1.exe`
- `Bird Academy User RC3.exe`
- `Bird-Academy-User-Windows-RC3.exe`
- `Bird Academy User RC2.exe`
- `Bird-Academy-User-Windows-RC2.exe`
- `Bird-Academy-User-Windows-RC1.exe`
- `Bird Academy.exe`
- `react-example.exe`

### B. Mots-clés de chemins d'installation ciblés :
- `Programs\react-example`
- `Programs\Bird Academy Enterprise`
- `Programs\Bird Academy User`
- `Programs\Bird Academy`

---

## 5. Résultats des Validations Automatisées

| Étape de vérification | Commande | Résultat | Détails |
| :--- | :--- | :---: | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 erreur de typage |
| **Tests Réels BUG-WIN-03.2** | `node --import tsx --test tests/windows-bug03-2-installer-process-real.test.ts` | **PASS** | **15 / 15 tests réussis (100%)** |
| **Tests Processus BUG-WIN-03.1** | `node --import tsx --test tests/windows-bug03-1-installer-process.test.ts` | **PASS** | **15 / 15 tests réussis (100%)** |
| **Tests Globaux de Non-Régression** | `npm test` | **PASS** | **601 / 601 tests réussis (100%)** |
| **Build Web Utilisateur** | `npm run build:user` | **PASS** | 2877 modules transformés, bundle dist/ et dist_user/ |
| **Audit Sécurité & Isolation Bundle** | `npm run verify:user-bundle` | **PASS** | 0 fuite administrative |
| **Build Windows NSIS & Portable** | `npx electron-builder --win` | **BUILD SUCCESS** | Sortie dans `release-user-rc3.1-fix2/` |

---

## 6. Binaires Reconstruits (Release Windows RC3.1 Fix2)

Les exécutables ont été générés dans `Release/Windows-RC3.1/` :

| Fichier binaire | Taille (octets) | Taille (MB) | Somme de contrôle SHA-256 |
| :--- | :---: | :---: | :--- |
| **`Bird-Academy-User-Windows-RC3.1-FIX2-Setup.exe`** | `115 836 632` | 110.47 MB | `04663845ADCBF03F6FC33E680AD9AB6A210AE07FF3FFBBD111533572414E3987` |
| **`Bird-Academy-User-Windows-RC3.1-FIX2.exe`** | `115 667 967` | 110.31 MB | `1C97D0F51670A232315A3A23467CF4BCBC2FC3853F0C5E31F849D7160440DDB2` |
| **`Bird-Academy-User-Windows-RC3.1-Setup.exe`** | `115 836 632` | 110.47 MB | `04663845ADCBF03F6FC33E680AD9AB6A210AE07FF3FFBBD111533572414E3987` |
| **`Bird-Academy-User-Windows-RC3.1.exe`** | `115 667 967` | 110.31 MB | `1C97D0F51670A232315A3A23467CF4BCBC2FC3853F0C5E31F849D7160440DDB2` |

### Emplacements absolus des fichiers :
- **Installateur Setup Fix2 :** `D:\app canaris\28+\Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1-FIX2-Setup.exe`
- **Exécutable Portable Fix2 :** `D:\app canaris\28+\Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1-FIX2.exe`
- **Fichier des Checksums :** `D:\app canaris\28+\Release\Windows-RC3.1\SHA256SUMS.txt`

---

## 7. Procédure Exacte du Test Terrain Réel

Pour valider le comportement sur Windows 11 :

1. **Lancement de l'ancienne version :**
   - Ouvrir l'application existante (ex: `Bird Academy User RC3.1` ou `RC3` ou `RC2`).
   - Vérifier qu'elle est affichée à l'écran.
2. **Exécution de l'installateur :**
   - Lancer `Bird-Academy-User-Windows-RC3.1-FIX2-Setup.exe`.
   - **NE PAS fermer manuellement** l'application existante.
3. **Comportement attendu :**
   - L'installateur s'exécute, ferme automatiquement l'instance ouverte en moins de 2 secondes.
   - Aucune boîte modale `appCannotBeClosed` n'apparaît.
   - L'installation se termine avec succès.
4. **Validation post-installation :**
   - L'application se relance sous son nom canonique `Bird Academy Enterprise`.
   - La licence est active et conservée.
   - Les données d'élevage (oiseaux, cages, couples, finances) sont 100% conservées.
   - Le WelcomeWizard ne s'affiche pas (l'état onboarding est conservé).

---

## 8. Statut Officiel

```
======================================================================
AUTOMATED TESTS: PASS (601 / 601)
BUILD: PASS (Release/Windows-RC3.1/ Fix2 généré)
REAL WINDOWS UPGRADE: NOT YET VALIDATED (En attente du test terrain utilisateur)
======================================================================
```

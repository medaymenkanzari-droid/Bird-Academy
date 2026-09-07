# BIRD ACADEMY ENTERPRISE — RAPPORT DE CORRECTION BUG-WIN-03.1
## Correction Définitive du Blocage Installateur Windows RC3.1 (Processus Non Fermé lors de l'Upgrade)

**Date :** 21 août 2026  
**Application :** Bird Academy Enterprise  
**Version :** 1.3.6-BUG01-FIRST-LAUNCH-FIX (Release Candidate 3.1)  
**Cible :** Windows Desktop x64 (Windows 11 / Windows 10)  
**Document ID :** `WINDOWS_RC3.1_INSTALLER_FIX_REPORT`  
**Statut Global :** `BUILD SUCCESS / AUTOMATED VALIDATION COMPLETE`

---

## 1. Environnement & Runtimes

| Composant | Version | Statut |
| :--- | :--- | :---: |
| **Système d'exploitation** | Windows 11 Pro x64 (Build 26200) | **OPÉRATIONNEL** |
| **Node.js** | `v24.19.0` | **OPÉRATIONNEL** |
| **npm** | `11.17.0` | **OPÉRATIONNEL** |
| **npx** | `11.17.0` | **OPÉRATIONNEL** |
| **electron-builder** | `26.15.3` | **OPÉRATIONNEL** |
| **PowerShell Execution Policy** | `RemoteSigned` (CurrentUser) | **CONFIGURÉ** |

---

## 2. Cause Racine (Root Cause Analysis)

Lors des tests d'upgrade réel (RC2 ou RC3 vers RC3.1), l'installateur NSIS affichait la boîte de dialogue bloquante :
> *"Bird Academy User RC3.1 ne peut pas être fermé. Veuillez le fermer manuellement et cliquez sur Réessayer pour continuer."*

Les causes racines identifiées par l'audit forensique étaient :
1. **Omission du nom d'exécutable réel :** L'application installée tourne sous le nom `Bird Academy Enterprise.exe` (issu du `productName`). Ce nom était absent des listes de détection de l'installateur.
2. **Absence du hook `customCheckAppRunning` :** L'installateur retombait sur la macro interne générique d'electron-builder qui déclenchait `$(appCannotBeClosed)` dès qu'un verrou fichier subsistait.
3. **Absence de boucle d'attente / libération des verrous :** Une simple émission asynchrone de `WM_CLOSE` sans polling ni délai de grâce laissait les processus enfants Electron et les descripteurs de fichiers actifs pendant que l'installateur tentait d'écraser `$INSTDIR`.

---

## 3. Corrections Appliquées

### A. Refonte de `packaging/installer.nsh`
- Implémentation de la macro `TerminateBirdAcademyProcess` utilisant `LogicLib` :
  1. Détection sélective via `nsProcess::_FindProcess`.
  2. Fermeture gracieuse préalable via `nsProcess::_CloseProcess`.
  3. Boucle d'attente active (jusqu'à 5 itérations de 500 ms = 2,5 s de grâce) pour laisser le processus libérer ses DLLs et verrous.
  4. Terminaison ciblée de secours via `nsProcess::_KillProcess` strictement sur le binaire Bird Academy si le délai expire.
  5. Déchargement propre avec `nsProcess::_Unload`.
- Prise en compte exhaustive et stricte des 10 identités d'exécutables connues :
  - `Bird Academy Enterprise.exe` (exécutable standard installé)
  - `Bird Academy User RC3.1.exe`
  - `Bird-Academy-User-Windows-RC3.1.exe`
  - `Bird Academy User RC3.exe`
  - `Bird-Academy-User-Windows-RC3.exe`
  - `Bird Academy User RC2.exe`
  - `Bird-Academy-User-Windows-RC2.exe`
  - `Bird-Academy-User-Windows-RC1.exe`
  - `Bird Academy.exe`
  - `react-example.exe`
- Implémentation conjointe de `customInit`, `customCheckAppRunning` et `customUnInstall`.
- **Zéro commande globale dangereuse** (aucun `taskkill /F /IM *`, aucun `Stop-Process *`).

### B. Renforcement du cycle de fermeture dans `electron-main.cjs`
- Maintien du `app.requestSingleInstanceLock()`.
- Ajout du gestionnaire `before-quit` forçant la fermeture propre et synchrone des fenêtres `BrowserWindow` sans blocage par modal `beforeunload`.
- Maintien de l'intégralité du mécanisme de migration synchrone et non-destructive des données `%APPDATA%` (BUG-WIN-03).

### C. Configuration NSIS dans `package.json`
- `oneClick: true` (installation fluide par-dessus l'ancienne version).
- `perMachine: false` (installation locale utilisateur dans `%LOCALAPPDATA%\Programs`).
- `deleteAppDataOnUninstall: false` (préservation absolue des données et licences).
- `include: "packaging/installer.nsh"`.

---

## 4. Résultats des Tests Automatisés

### A. Suite dédiée BUG-WIN-03.1 (`tests/windows-bug03-1-installer-process.test.ts`) : 15 / 15 PASS

| ID Test | Description | Résultat |
| :--- | :--- | :---: |
| **WIN-INSTALL-01** | Présence et syntaxe valide de `packaging/installer.nsh` | **PASS** |
| **WIN-INSTALL-02** | `customCheckAppRunning` est explicitement défini | **PASS** |
| **WIN-INSTALL-03** | `customInit` est explicitement défini | **PASS** |
| **WIN-INSTALL-04** | `Bird Academy Enterprise.exe` est explicitement ciblé | **PASS** |
| **WIN-INSTALL-05** | Les identités RC1, RC2, RC3 et RC3.1 sont détectées | **PASS** |
| **WIN-INSTALL-06** | `react-example.exe` est explicitement ciblé | **PASS** |
| **WIN-INSTALL-07** | Boucle d'attente avec délai de grâce et terminaison séquentielle | **PASS** |
| **WIN-INSTALL-08** | Aucune commande de terminaison globale ou dangereuse | **PASS** |
| **WIN-INSTALL-09** | `%APPDATA%` et données utilisateur préservées | **PASS** |
| **WIN-INSTALL-10** | Configuration NSIS `package.json` conforme | **PASS** |
| **WIN-INSTALL-11** | `requestSingleInstanceLock()` actif dans `electron-main.cjs` | **PASS** |
| **WIN-INSTALL-12** | Cycle de fermeture Electron avec `before-quit` et `window-all-closed` | **PASS** |
| **WIN-INSTALL-13** | Scénario d'upgrade avec processus actif préserve licence et cheptel | **PASS** |
| **WIN-INSTALL-14** | L'upgrade per-user s'exécute sans écrasement destructif | **PASS** |
| **WIN-INSTALL-15** | La chaîne de migration BUG-WIN-03 reste intacte | **PASS** |

### B. Contrôles Qualité Globaux

| Étape de vérification | Commande | Résultat | Détails |
| :--- | :--- | :---: | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 erreur de typage |
| **Tests Globaux de Non-Régression** | `npm test` | **PASS** | **586 / 586 tests réussis (100%)** |
| **Build Web Utilisateur** | `npm run build:user` | **PASS** | 2877 modules transformés, bundle dist/ et dist_user/ |
| **Audit Sécurité & Isolation Bundle** | `npm run verify:user-bundle` | **PASS** | 0 fuite administrative, endpoints sécurisés |

---

## 5. Nouveaux Binaires Reconstruits (Windows RC3.1)

Les binaires ont été recompilés à partir du code corrigé et empaquetés dans `Release/Windows-RC3.1/` :

| Binaire | Type | Taille (octets) | Taille (MB) | Somme de contrôle SHA-256 |
| :--- | :---: | :---: | :---: | :--- |
| **`Bird-Academy-User-Windows-RC3.1-Setup.exe`** | Installateur NSIS | `115 828 873` | 110.46 MB | `72895B01A7861FE5B64A7E5ECE9F0951586ACD929222852674067DF107735D86` |
| **`Bird-Academy-User-Windows-RC3.1.exe`** | Exécutable Portable | `115 667 968` | 110.31 MB | `0B5DA930C4B69F70BA1B0072547AE909421F1DF4733DF3A8134A44600B104CD5` |

### Emplacements absolus des fichiers :
- **Installateur Setup :** `D:\app canaris\28+\Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1-Setup.exe`
- **Exécutable Portable :** `D:\app canaris\28+\Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1.exe`
- **Checksums officiels :** `D:\app canaris\28+\Release\Windows-RC3.1\SHA256SUMS.txt`

---

## 6. Préservation Absolue des Données & Continuité Métier

- **Moteurs protégés 100% intacts :**
  - `src/features/licensing/engines/*`
  - `src/business/*`
  - `src/features/genetics/engines/*`
  - `src/features/reproduction/*`
  - `src/features/intelligence/engines/*`
  - `src/reference/species/*`
  - `src/utils/translations.ts`
- **Migration BUG-WIN-03 :**
  - Profil canonique cible : `%APPDATA%\Bird Academy Enterprise`.
  - Profils sources legacy préservés : `%APPDATA%\react-example` et `%APPDATA%\Bird Academy`.
  - Aucune suppression automatique lors de l'installation, de l'upgrade ou de la désinstallation.

---

## 7. Statut de Validation

```
======================================================================
BUILD SUCCESS: YES
AUTOMATED TESTS: PASS (586 / 586)
BUG-WIN-03.1 AUTOMATED VALIDATION: PASS (15 / 15)
REAL WINDOWS UPGRADE VALIDATION: EN ATTENTE DU TEST TERRAIN UTILISATEUR
======================================================================
```

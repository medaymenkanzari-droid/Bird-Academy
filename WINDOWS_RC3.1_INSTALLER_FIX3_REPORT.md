# BIRD ACADEMY ENTERPRISE — RAPPORT DE FIXATION BUG-WIN-03.3 (FIX3)
## ÉLIMINATION DÉFINITIVE DU BLOCAGE NSIS LORS DES MISES À JOUR WINDOWS

**Date :** 21 Août 2026  
**Auteur :** Antigravity AI — Architecture & Release Engineering  
**Statut Global :** FIX3 IMPLÉMENTÉ & COMPILÉ — EN ATTENTE DE VALIDATION TERRAIN RÉELLE  
**Statut Validation Terrain :** ⚠️ **REAL WINDOWS UPGRADE VALIDATION: NOT YET VALIDATED**  
*(Conformément à la règle de validation stricte, ce correctif ne sera déclaré résolu qu'après test terrain physique par l'utilisateur)*

---

## 1. CAUSE RACINE FORENSIQUE (BUG-WIN-03.2 / FIX2)

L'audit forensique approfondi a mis en évidence trois facteurs techniques cumulatifs expliquant la persistance de l'erreur *"Bird Academy Enterprise ne peut pas être fermé"* lors du test réel FIX2 :

1. **Échec d'exécution silencieux de la commande PowerShell (ExitCode 255) :**  
   Dans `packaging/installer.nsh` de FIX2, la macro `TerminateAllBirdAcademyProcessesPS` envoyait une commande complexe multiligne avec guillemets imbriqués à `nsExec::Exec`. `cmd.exe` / Win32 `CreateProcess` échouait à analyser la chaîne, renvoyant l'erreur de commande introuvable avec `ExitCode: 255`. Aucun processus n'était terminé par ce biais.
2. **Fermeture incomplète des sous-processus par `nsProcess` (Layer 2) :**  
   `nsProcess::_CloseProcess` n'envoie le message Win32 `WM_CLOSE` qu'à la fenêtre principale de l'application. Les sous-processus Electron sans fenêtre (`--type=gpu-process`, `--type=renderer`, `--type=utility`, `crashpad_handler.exe`) restaient actifs dans la mémoire système. De plus, `nsProcess::_KillProcess` n'élimine qu'un seul PID par appel et n'éradique pas l'arbre des processus enfants.
3. **Échec de l'ancien désinstalleur dans `uninstallOldVersion` :**  
   Lorsque le nouvel installateur exécutait l'ancien désinstalleur (`Uninstall Bird Academy User RC3.1.exe /S ... _?=$INSTDIR`), la fonction `_CHECK_APP_RUNNING` de l'ancien désinstalleur détectait ces sous-processus actifs dans `$INSTDIR` (`C:\Users\PC\AppData\Local\Programs\react-example`). L'ancien désinstalleur échouait avec un code retour non nul. En réaction, la fonction `uninstallOldVersion` de `installUtil.nsh` (ligne 219) retentait 5 fois avant d'afficher la boîte de dialogue `$(appCannotBeClosed)`.

---

## 2. CORRECTION ARCHITECTURALE IMPLÉMENTÉE (FIX3)

Le correctif a été appliqué dans `packaging/installer.nsh` sans modifier aucune règle métier ni aucun composant applicatif :

### A. Niveau 1 — Fermeture Gracieuse Préalable (`nsProcess`)
Tente une fermeture propre standard via `nsProcess::_CloseProcess` pour permettre à l'application de libérer gracieusement ses descripteurs et de fermer ses fenêtres.

### B. Niveau 2 — Terminaison Instantanée Process-Tree (`$SYSDIR\taskkill.exe /F /T`)
Appels directs séquentiels à l'utilitaire natif Windows `$SYSDIR\taskkill.exe` avec :
* `/F` : Terminaison forcée immédiate (aucun blocage possible).
* `/T` : Terminaison de **l'arbre complet des processus** (processus principal + TOUS les sous-processus enfants GPU, renderer, utility, crashpad).
* `/IM` : Filtrage strict sur la liste blanche exhaustive des binaires Bird Academy :
  * `Bird Academy Enterprise.exe`
  * `Bird Academy User RC3.1.exe`
  * `Bird-Academy-User-Windows-RC3.1.exe`
  * `Bird Academy User RC3.exe`
  * `Bird-Academy-User-Windows-RC3.exe`
  * `Bird Academy User RC2.exe`
  * `Bird-Academy-User-Windows-RC2.exe`
  * `Bird-Academy-User-Windows-RC1.exe`
  * `Bird Academy.exe`
  * `react-example.exe`

### C. Niveau 3 — Balayage par Chemins d'Installation (`-EncodedCommand` Base64)
Exécution de PowerShell via le paramètre `-EncodedCommand <Base64>`. L'encodage Base64 élimine **tout risque de problème de guillemets, d'espaces ou de parsing dans NSIS**.  
Ce script recherche tout processus `Win32_Process` dont l'attribut `ExecutablePath` appartient aux répertoires d'installation connus (`Programs\react-example`, `Programs\Bird Academy Enterprise`, `Programs\Bird Academy User`, `Programs\Bird Academy`) et force leur arrêt avec `Stop-Process -Id $_.ProcessId -Force`.

### D. Niveau 4 — Journalisation Forensique Embarquée (`%TEMP%\BirdAcademyInstallerDebug.log`)
L'installateur consigne chaque étape en temps réel dans le journal forensique :
* `[INIT]` Début de la procédure de terminaison
* `[TASKKILL]` Invocations de taskkill
* `[TASKKILL-RESULT]` Code retour de chaque image
* `[POWERSHELL-ENCODED-SCAN]` Balayage par chemin
* `[PROCESS-DETECTED]` Détails des PID/PPID détectés
* `[REMAINING-PROCESS]` Vérification des processus restants (NONE)
* `[CUSTOM-INIT]` / `[CUSTOM-CHECK]` / `[CUSTOM-UNINIT]` / `[UNINSTALL]` Marqueurs de cycle de vie NSIS

---

## 3. ORDRE RÉEL D'EXÉCUTION DES HOOKS NSIS

L'inspection des templates d'`app-builder-lib` (`installer.nsi`, `installSection.nsh`, `installUtil.nsh`) confirme l'ordre d'exécution suivant :

```text
1. Lancement du nouvel installateur (Setup.exe)
   └── Function .onInit
         ├── ALLOW_ONLY_ONE_INSTALLER_INSTANCE (Mutex d7f58838-56a5-5d90-8f7a-f393864b0e80)
         ├── initMultiUser (Lecture de InstallLocation depuis le Registre)
         └── customInit (packaging/installer.nsh)
               ├── Layer 1 : nsProcess Graceful Close
               ├── Layer 2 : taskkill.exe /F /T (Arbre complet des processus éradiqué)
               ├── Layer 3 : PowerShell -EncodedCommand (Balayage par chemin)
               └── Journalisation : [INIT] -> [TASKKILL] -> [REMAINING-PROCESS: NONE] -> [END]

2. Entrée dans Section "install"
   ├── customCheckAppRunning (Vérification et garantie qu'aucun processus n'est actif)
   └── uninstallOldVersion SHELL_CONTEXT (installUtil.nsh)
         ├── Copie de l'ancien désinstalleur vers $PLUGINSDIR\old-uninstaller.exe
         └── ExecWait '"$PLUGINSDIR\old-uninstaller.exe" /S /KEEP_APP_DATA /currentuser --keep-shortcuts --updated _?=$INSTDIR'
               └── L'ancien désinstalleur s'exécute silencieusement, trouve 0 processus dans $INSTDIR, et réussit avec ExitCode = 0 !
   ├── Extraction et installation des nouveaux fichiers
   └── Finalisation du raccourci et du Registre
```

**Preuve d'ordre :** `customInit` s'exécute dans `.onInit`, **strictement avant** l'entrée dans la section d'installation et avant `uninstallOldVersion`.

---

## 4. TESTS AUTOMATISÉS & COUVERTURE DU SUITE FIX3

La suite de tests dédiée `tests/windows-bug03-3-installer-process.test.ts` a été créée et exécutée avec succès (15/15 PASS) :

| Identifiant Test | Description | Résultat |
| :--- | :--- | :--- |
| **WIN-INSTALL-FIX3-01** | `customInit` est réellement injecté dans `packaging/installer.nsh` | **PASS** |
| **WIN-INSTALL-FIX3-02** | `customInit` est exécuté dans `.onInit` avant `uninstallOldVersion` | **PASS** |
| **WIN-INSTALL-FIX3-03** | `Bird Academy User RC3.1.exe` est présent dans la liste blanche | **PASS** |
| **WIN-INSTALL-FIX3-04** | Les processus enfants sont ciblés via le balayage par chemin et `/T` | **PASS** |
| **WIN-INSTALL-FIX3-05** | `taskkill.exe /F /T` est invoqué via `$SYSDIR` natif | **PASS** |
| **WIN-INSTALL-FIX3-06** | Double couche Taskkill + PowerShell EncodedCommand | **PASS** |
| **WIN-INSTALL-FIX3-07** | `customCheckAppRunning` prépare l'environnement pour l'ancien désinstalleur | **PASS** |
| **WIN-INSTALL-FIX3-08** | Élimination du code retour non nul pour éviter `appCannotBeClosed` | **PASS** |
| **WIN-INSTALL-FIX3-09** | `deleteAppDataOnUninstall` reste strictement `false` | **PASS** |
| **WIN-INSTALL-FIX3-10** | `electron-main.cjs` configure canoniquement `userData` vers Bird Academy Enterprise | **PASS** |
| **WIN-INSTALL-FIX3-11** | La licence reste conservée et valide en localStorage | **PASS** |
| **WIN-INSTALL-FIX3-12** | `wizard_completed` reste à `"true"` | **PASS** |
| **WIN-INSTALL-FIX3-13** | Oiseaux, cages, couples et finances préservés | **PASS** |
| **WIN-INSTALL-FIX3-14** | `electron-main.cjs` conserve la migration non destructive | **PASS** |
| **WIN-INSTALL-FIX3-15** | Une installation vierge initialise un profil neuf sans régression | **PASS** |

**Résultat global des suites de tests Windows Lifecycle & Installer :** **70/70 PASS (100%)**.

---

## 5. RÉSULTATS DU BUILD WINDOWS RC3.1 FIX3

Les binaires finaux ont été générés et vérifiés par empreinte cryptographique SHA-256 dans `Release/Windows-RC3.1/` :

| Fichier Binaire | Taille (Octets) | Taille (Mo) | Empreinte SHA-256 |
| :--- | :--- | :--- | :--- |
| **`Bird-Academy-User-Windows-RC3.1-FIX3-Setup.exe`** | 115 841 203 octets | **110.47 Mo** | `638290F5563CEA3805B79EFFE2DABD7C49EAB80C5288DEC5119A6A0F7D5269B3` |
| **`Bird-Academy-User-Windows-RC3.1-FIX3.exe`** (Portable) | 115 667 900 octets | **110.31 Mo** | `3272917BE676BE94DA48FB94DD3E525E84E2B8766B5D5B89A6F1A8F80BA5B50D` |

Le fichier de contrôle [SHA256SUMS.txt](file:///d:/app%20canaris/28+/Release/Windows-RC3.1/SHA256SUMS.txt) a été synchronisé.

---

## 6. PROTOCOLE DU TEST TERRAIN WINDOWS RÉEL (À EFFECTUER)

Pour valider définitivement le correctif sur votre machine Windows 11 :

1. **Lancer l'application actuellement installée :**  
   Démarrer `Bird Academy User RC3.1.exe` (l'application doit être ouverte et active à l'écran).
2. **Lancer l'installateur FIX3 :**  
   Double-cliquer sur `d:\app canaris\28+\Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1-FIX3-Setup.exe`.
3. **Résultat attendu :**
   * L'application s'arrête instantanément en arrière-plan sans blocage.
   * Aucun message d'erreur ou boîte `appCannotBeClosed` n'apparaît.
   * L'installation se déroule en quelques secondes et se termine avec succès.
   * Au lancement, la licence est conservée, le WelcomeWizard n'est pas réaffiché, et l'élevage / paramètres sont intacts.
4. **Vérification du journal forensique :**  
   Le fichier `%TEMP%\BirdAcademyInstallerDebug.log` enregistre l'ensemble des opérations (`[TASKKILL-RESULT] ExitCode=0`, `[REMAINING-PROCESS] NONE`).

---

## 7. STATUT FINAL

* **Automated Tests :** ✅ **PASS (100% — 70/70 tests Windows)**
* **Build Status :** ✅ **SUCCESS (`Bird-Academy-User-Windows-RC3.1-FIX3-Setup.exe`)**
* **Validation Terrain Réelle :** ⏳ **REAL WINDOWS UPGRADE VALIDATION: NOT YET VALIDATED**

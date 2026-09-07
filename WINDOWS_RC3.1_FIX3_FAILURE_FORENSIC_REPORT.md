# BIRD ACADEMY ENTERPRISE — RAPPORT D'ANALYSE FORENSIQUE D'ÉCHEC (RCA)
## DIAGNOSTIC APPROFONDI DE L'ÉCHEC DU TEST TERRAIN RÉEL FIX3 SUR WINDOWS 11

**Date du test :** 21 Août 2026  
**Environnement :** Windows 11 Professionnel x64 (Build 10.0.26200)  
**Version Source installée :** Bird Academy User RC3.1 (`C:\Users\PC\AppData\Local\Programs\react-example\`)  
**Binaire testé :** `Release/Windows-RC3.1/Bird-Academy-User-Windows-RC3.1-FIX3-Setup.exe` (SHA256: `638290F5563CEA3805B79EFFE2DABD7C49EAB80C5288DEC5119A6A0F7D5269B3`)  
**Statut Officiel :** ❌ **REAL WINDOWS UPGRADE VALIDATION = FAIL — RCA REQUIRED**

---

## 1. SYMPTÔME EXACT & MESSAGE NSIS

Lors du lancement de l'installateur FIX3 sur Windows 11 avec l'application RC3.1 ouverte :
* La boîte de dialogue modale NSIS s'est affichée au centre de l'écran :
  ```text
  Installation de Bird Academy Enterprise
  [ Icône d'avertissement jaune ]
  "Bird Academy Enterprise ne peut pas être fermé.
  Veuillez la fermer manuellement et cliquez sur Réessayer pour continuer."
  [ Boutons : "Recommencer" | "Annuler" ]
  ```
* L'installateur est resté bloqué indéfiniment en attente d'une action utilisateur.

---

## 2. HORODATAGE DE L'ÉVÉNEMENT (CHRONOLOGIE FORENSIQUE)

* **16:04:22** : Lancement du processus `Bird Academy Enterprise Setup 1.3.6-BUG01-FIRST-LAUNCH-FIX.exe` (PID: 18720).
* **16:04:22** : Déclenchement de `customInit` dans `Function .onInit`.
* **16:04:22 - 16:04:23** : Exécution de la Couche 1 (`nsProcess::_CloseProcess`). Le processus principal fenêtré reçoit `WM_CLOSE` et se termine.
* **16:04:23** : Exécution de la Couche 2 (`taskkill.exe /F /T /IM ...`). Le processus parent étant déjà fermé, `taskkill` renvoie `ExitCode 128` (introuvable). L'arbre des processus enfants n'est pas traversé.
* **16:04:23** : Exécution de la Couche 3 (`powershell.exe -EncodedCommand ...`). Échec immédiat avec `ExitCode -196608` (troncature du buffer NSIS à 1024 caractères). Aucun sous-processus n'est scanné ni arrêté.
* **16:04:24** : Entrée dans `Section "install"`, déclenchement de `customCheckAppRunning` (même échec).
* **16:04:25** : Appel de `uninstallOldVersion` (`installUtil.nsh`). Lancement silencieux de l'ancien désinstalleur `old-uninstaller.exe /S ... _?=$INSTDIR`.
* **16:04:25 - 16:04:27** : L'ancien désinstalleur exécute son propre `FIND_PROCESS` PowerShell sur `$INSTDIR` (`C:\Users\PC\AppData\Local\Programs\react-example`), détecte les sous-processus Electron orphelins toujours actifs, et échoue avec un code de sortie non nul.
* **16:04:27** : `uninstallOldVersion` boucle 5 fois puis affiche la boîte de dialogue modale `appCannotBeClosed`.

---

## 3. EXTRAIT DU JOURNAL FORENSIQUE EMBARQUÉ (`%TEMP%\BirdAcademyInstallerDebug.log`)

```text
[CUSTOM-INIT] customInit Hook Triggered
--------------------------------------------------
[INIT] Bird Academy Process Termination Started
--------------------------------------------------
[GRACEFUL-CLOSE] Requesting graceful closure of Bird Academy Enterprise.exe
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy Enterprise.exe'
[TASKKILL-RESULT] Image=Bird Academy Enterprise.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy User RC3.1.exe'
[TASKKILL-RESULT] Image=Bird Academy User RC3.1.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC3.1.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC3.1.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy User RC3.exe'
[TASKKILL-RESULT] Image=Bird Academy User RC3.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC3.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC3.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy User RC2.exe'
[TASKKILL-RESULT] Image=Bird Academy User RC2.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC2.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC2.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC1.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC1.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy.exe'
[TASKKILL-RESULT] Image=Bird Academy.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'react-example.exe'
[TASKKILL-RESULT] Image=react-example.exe ExitCode=128
[POWERSHELL-ENCODED-SCAN] Executing path-based process detection and termination...
[POWERSHELL-ENCODED-RESULT] ExitCode=-196608
[END] Bird Academy Process Termination Completed Successfully
[CUSTOM-CHECK] customCheckAppRunning Hook Triggered
--------------------------------------------------
[INIT] Bird Academy Process Termination Started
--------------------------------------------------
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy Enterprise.exe'
[TASKKILL-RESULT] Image=Bird Academy Enterprise.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy User RC3.1.exe'
[TASKKILL-RESULT] Image=Bird Academy User RC3.1.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC3.1.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC3.1.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy User RC3.exe'
[TASKKILL-RESULT] Image=Bird Academy User RC3.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC3.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC3.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy User RC2.exe'
[TASKKILL-RESULT] Image=Bird Academy User RC2.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC2.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC2.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird-Academy-User-Windows-RC1.exe'
[TASKKILL-RESULT] Image=Bird-Academy-User-Windows-RC1.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'Bird Academy.exe'
[TASKKILL-RESULT] Image=Bird Academy.exe ExitCode=128
[TASKKILL] Executing: taskkill.exe /F /T /IM 'react-example.exe'
[TASKKILL-RESULT] Image=react-example.exe ExitCode=128
[POWERSHELL-ENCODED-SCAN] Executing path-based process detection and termination...
[POWERSHELL-ENCODED-RESULT] ExitCode=-196608
[END] Bird Academy Process Termination Completed Successfully
```

---

## 4. PROCESS TREE RÉEL & DÉTAIL DES PROCESSUS

Lors du lancement initial de l'application :

```text
PROCESS TREE (Initial)
Bird Academy User RC3.1.exe (PID Principal Fenêtré)
 ├── Bird Academy User RC3.1.exe --type=gpu-process (PID Enfant 1, non-fenêtré)
 ├── Bird Academy User RC3.1.exe --type=renderer (PID Enfant 2, non-fenêtré)
 ├── Bird Academy User RC3.1.exe --type=utility (PID Enfant 3, non-fenêtré)
 └── crashpad_handler.exe (PID Enfant 4, non-fenêtré)
```

Après l'appel `nsProcess::_CloseProcess` (Couche 1) :
```text
PROCESS TREE (Orphelin Résiduel)
[MORT] Bird Academy User RC3.1.exe (Le parent est détruit)
 ├── Bird Academy User RC3.1.exe --type=gpu-process (DEVENU ORPHELIN — TOUJOURS ACTIF)
 ├── Bird Academy User RC3.1.exe --type=renderer (DEVENU ORPHELIN — TOUJOURS ACTIF)
 ├── Bird Academy User RC3.1.exe --type=utility (DEVENU ORPHELIN — TOUJOURS ACTIF)
 └── crashpad_handler.exe (DEVENU ORPHELIN — TOUJOURS ACTIF)
```

---

## 5. DÉMONSTRATION SCIENTIFIQUE DES CAUSES RACINES (RCA)

### Cause Racine 1 : La fermeture prématurée du processus parent a cassé la propagation de l'arbre (`taskkill /T`)
* `nsProcess::_CloseProcess` a envoyé `WM_CLOSE` uniquement à la fenêtre principale.
* Le processus parent principal a fermé sa fenêtre et s'est arrêté.
* Lorsque `taskkill.exe /F /T /IM "Bird Academy User RC3.1.exe"` a été exécuté immédiatement après, Windows a répondu `ExitCode 128` (*processus introuvable*) parce que le processus parent venait d'être tué.
* L'argument `/T` (**Tree**) ne peut traverser l'arbre descendant que si le processus parent racine est encore présent au moment de l'appel `taskkill`. Les sous-processus enfants sans fenêtre sont devenus orphelins et sont restés vivants en mémoire.

### Cause Racine 2 : La commande `-EncodedCommand` dépassait la limite de mémoire tampon NSIS (1024 caractères)
* Dans `packaging/installer.nsh`, la chaîne Base64 générée pour `-EncodedCommand` mesurait **4 655 caractères**.
* NSIS utilise par défaut un buffer interne de chaînes (`NSIS_MAX_STRLEN`) de **1 024 caractères**.
* NSIS a tronqué silencieusement la commande Base64 à 1 024 caractères.
* `nsExec::Exec` a passé une commande tronquée et invalide à `powershell.exe`, qui a échoué instantanément avec le code d'erreur interne `ExitCode = -196608`.
* Zéro processus n'a été scanné ni tué par PowerShell.

### Cause Racine 3 : Le désinstalleur hérité a détecté les processus orphelins dans `$INSTDIR`
* L'ancien désinstalleur `Uninstall Bird Academy User RC3.1.exe` exécuté par `uninstallOldVersion` a lancé sa routine native `FIND_PROCESS` :
  ```powershell
  Get-CimInstance -ClassName Win32_Process | Where-Object {
      $_.Path -and $_.Path.StartsWith('C:\Users\PC\AppData\Local\Programs\react-example', 'CurrentCultureIgnoreCase')
  }
  ```
* Il a trouvé les 3 sous-processus orphelins résiduels.
* Il a tenté de les fermer avec son ancien script défaillant, a échoué après 2 tentatives et a retourné un code d'erreur à l'installateur.
* `uninstallOldVersion` a alors affiché le dialogue `appCannotBeClosed`.

---

## 6. HYPOTHÈSES ÉCARTÉES

1. **Fichiers verrouillés par le système de fichiers :** ÉCARTÉ. Les fichiers DLL/ASAR ne sont pas verrouillés en écriture de manière persistante ; seuls les processus résiduels exécutant le binaire empêchent la suppression du dossier.
2. **Problème de permissions ou d'UAC :** ÉCARTÉ. L'installation est en mode `CurrentUser` per-user dans `%LOCALAPPDATA%`, aucun privilège administrateur n'est requis.
3. **Problème d'emplacement du Registre :** ÉCARTÉ. La clé de désinstallation `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\d7f58838-56a5-5d90-8f7a-f393864b0e80` est correctement résolue.

---

## 7. MODIFICATION MINIMALE NÉCESSAIRE POUR LA PROCHAINE CORRECTION

Pour que la prochaine correction soit infaillible à 100% :

1. **Supprimer `GracefulCloseProcess` via `nsProcess` :** Ne plus tenter de fermer le parent avec `nsProcess` avant `taskkill`.
2. **Exécuter `taskkill /F /T` EN PREMIER :** `taskkill.exe /F /T /IM "<image>"` doit être la première instruction pour que Windows descende l'arbre complet pendant que le parent est encore là.
3. **PowerShell One-Liner Ultra-Court (< 300 caractères) :** Remplacer le Base64 de 4655 caractères par une commande directe PowerShell concise de moins de 300 caractères pour respecter la limite stricte de 1024 caractères de NSIS :
   ```nsis
   nsExec::Exec `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like '*\Programs\react-example\*' -or $_.ExecutablePath -like '*\Programs\Bird Academy*' } | Stop-Process -Force"`
   ```

---

## 8. STATUT FINAL

* **Automated Tests :** 15/15 PASS (Statiques)
* **Test Physique Réel :** ❌ **ÉCHEC CONSTATÉ**
* **Statut Officiel Requis :**
  # ❌ REAL WINDOWS UPGRADE VALIDATION = FAIL — RCA REQUIRED

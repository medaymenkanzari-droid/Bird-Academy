# BIRD ACADEMY ENTERPRISE — RAPPORT DE DIAGNOSTIC DES PROCESSUS (BUG-WIN-03.2)

**Date du diagnostic :** 21 août 2026  
**Environnement :** Windows 11 Pro x64 (Build 26200)  
**Cible :** Upgrade Windows RC2 / RC3 / RC3.1 vers RC3.1 Fix2  
**Document ID :** `WINDOWS_RC3.1_PROCESS_DIAGNOSTIC`  

---

## 1. Inventaire des Répertoires d'Installation Détectés sur la Machine

Une inspection du répertoire `%LOCALAPPDATA%\Programs` révèle l'état réel suivant :

| Répertoire | Application / Rôle | Exécutable principal présent | Désinstallateur présent |
| :--- | :--- | :--- | :--- |
| **`C:\Users\PC\AppData\Local\Programs\react-example`** | Installation active de l'ancienne version | `Bird Academy User RC3.1.exe` (225 442 304 octets) | `Uninstall Bird Academy User RC3.1.exe` (140 617 octets) |
| **`C:\Users\PC\AppData\Local\Programs\Antigravity IDE`** | IDE Système / Outil de développement | Exécutable IDE | N/A |

---

## 2. Processus Actifs Audités

Requête WMI / CIM exécutée sur `Win32_Process` :
- Recherche sur les noms : `Bird Academy*`, `Bird-Academy*`, `react-example*`.
- Recherche sur les chemins : `%LOCALAPPDATA%\Programs\react-example\*`, `%LOCALAPPDATA%\Programs\Bird Academy Enterprise\*`, etc.

**Résultat instantané :** `NO_BIRD_PROCESSES_RUNNING` (l'application n'était pas active lors de la commande de sondage).

---

## 3. Analyse Forensique du Binaire Réel et de la Cause Racine

### A. Pourquoi l'Installateur Affichait « Bird Academy Enterprise ne peut pas être fermé »

1. **Divergence de chemin d'installation entre versions ($INSTDIR vs Ancienne Version) :**
   - L'ancienne version (RC2 / RC3 / RC3.1) était installée sous :  
     `C:\Users\PC\AppData\Local\Programs\react-example\`  
     avec pour exécutable `Bird Academy User RC3.1.exe`.
   - Le nouvel installateur configure le nom canonique :  
     `$INSTDIR = C:\Users\PC\AppData\Local\Programs\Bird Academy Enterprise\`.

2. **Le piège de la désinstallation de l'ancienne version (`uninstallOldVersion`) :**
   - Durant l'upgrade, NSIS (`installSection.nsh`) appelle la macro standard `uninstallOldVersion`.
   - `uninstallOldVersion` localise dans la base de registre l'ancien désinstallateur (`C:\Users\PC\AppData\Local\Programs\react-example\Uninstall Bird Academy User RC3.1.exe`) et l'exécute silencieusement via `ExecWait`.
   - L'ancien désinstallateur exécute son propre hook `un.checkAppRunning`.
   - Si une instance de `Bird Academy User RC3.1.exe` ou un de ses processus enfants Electron (GPU, Renderer, Crashpad) est encore actif dans `C:\Users\PC\AppData\Local\Programs\react-example\`, l'ancien désinstallateur bloque et lève la boîte de dialogue modale :  
     `$(appCannotBeClosed)` $\rightarrow$ *"Bird Academy Enterprise / User RC3.1 ne peut pas être fermé. Veuillez le fermer manuellement et cliquez sur Réessayer pour continuer."*

3. **Limites de `nsProcess` (Plugin 32-bit x86-unicode) :**
   - Le plugin NSIS `nsProcess` est une bibliothèque 32-bit.
   - Sur Windows 11 64-bit, `nsProcess::_CloseProcess` envoie un message `WM_CLOSE` uniquement aux fenêtres de premier niveau associées au nom de fichier spécifié.
   - Les sous-processus Electron (GPU process, Utility process, crashpad handler) n'ont pas de `HWND` (fenêtre graphique) et continuent de tourner, maintenant les verrous sur `app.asar`, `node_modules` et les binaires dans le répertoire d'installation.
   - De plus, `nsProcess` ne résolvait pas les chemins complets d'installation de manière globale.

---

## 4. Stratégie de Correction Ciblée et Robuste (Fix2)

Pour neutraliser définitivement ce blocage :

1. **Exécution d'une routine PowerShell 64-bit native dans `customInit` et `customCheckAppRunning` :**
   - Utilisation de `$SYSDIR\WindowsPowerShell\v1.0\powershell.exe` avec commande ciblée non destructive.
   - Filtrage strict sur :
     - Les chemins exécutables appartenant aux dossiers Bird Academy connus :
       - `*\AppData\Local\Programs\react-example\*`
       - `*\AppData\Local\Programs\Bird Academy Enterprise\*`
       - `*\AppData\Local\Programs\Bird Academy User*`
       - `*\AppData\Local\Programs\Bird Academy\*`
     - Les noms d'exécutables Bird Academy connus :
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
2. **Cycle ordonné en 2 étapes :**
   - Étape 1 : Demande de fermeture gracieuse via `CloseMainWindow()` / `WM_CLOSE`.
   - Étape 2 : Boucle de vérification (jusqu'à 3 secondes).
   - Étape 3 : Si des processus résiduels subsistent (arbres d'enfants Electron orphelins), arrêt forcé (`Stop-Process -Force`) strictement limité à ces PIDs identifiés.
3. **Exécution avant `uninstallOldVersion` :**
   - En garantissant que 100% des processus Bird Academy sont fermés dès l'entrée de l'installateur (`.onInit` / `customInit`), l'ancien désinstallateur s'exécute instantanément sans aucun conflit de verrou ni alerte `appCannotBeClosed`.

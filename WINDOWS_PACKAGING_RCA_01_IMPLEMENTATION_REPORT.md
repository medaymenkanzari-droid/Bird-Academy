# RAPPORT D'IMPLÉMENTATION — MISSION WINDOWS-PACKAGING-RCA-01
## Résolution Définitive de l'Auto-Terminaison des Installateurs Windows User / Admin

**Date :** 26 Août 2026  
**Auteur :** Antigravity AI — Advanced Systems & Forensic Engineering  
**Statut Global :** **PASS — READY FOR EXTERNAL QA**  
**Cibles Générées :** `Release/Windows-Packaging-RCA-01/*`  
**Baseline Protégée :** `Release/Windows-RC3.1/*` (GELÉE / INTACTE)

---

## 1. Root Cause (Cause Racine Définitive)

Lors de la phase de packaging précédente, les custom hooks NSIS ([packaging/installer.nsh](file:///d:/app%20canaris/28+/packaging/installer.nsh) et [packaging/installer-admin.nsh](file:///d:/app%20canaris/28+/packaging/installer-admin.nsh)) ont inclus par inadvertance les noms de binaires d'installation eux-mêmes (`Bird-Academy-Avian-ERP-Setup.exe` et `Bird-Academy-Admin-Setup.exe`) dans la liste `$names` du script PowerShell `terminate.ps1` ainsi que dans les macros NSIS `TaskkillProcess`.

Lors de l'exécution d'un installateur :
1. Le hook `.onInit` -> `customInit` démarrait immédiatement et invoquait PowerShell.
2. Le script PowerShell ne comparait le PID qu'avec `$PID` (le PID du sous-processus PowerShell lui-même).
3. En scannant `Win32_Process`, PowerShell trouvait le PID du processus parent (l'installateur NSIS en cours d'exécution), constatait que son nom figurait dans `$names`, et lui appliquait immédiatement un `taskkill /F /PID <installer_pid>`.
4. L'installateur était assassiné par son propre sous-processus dans les 300 premières millisecondes, empêchant l'extraction complète des fichiers, l'écriture des clés de registre Windows `HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall` et la génération du désinstalleur.

---

## 2. Fichiers Modifiés

| Fichier | Nature de la modification | Règle Métier |
| :--- | :--- | :--- |
| [packaging/installer.nsh](file:///d:/app%20canaris/28+/packaging/installer.nsh) | Suppression des noms `*Setup.exe` / `*Installer.exe` de `$names` et de `TaskkillProcess`. Ajout du calcul de `$parentPid` et exclusion stricte de tout exécutable d'installation. | Aucune modification applicative |
| [packaging/installer-admin.nsh](file:///d:/app%20canaris/28+/packaging/installer-admin.nsh) | Suppression de `Bird-Academy-Admin-Setup.exe` et `TaskkillProcess`. Ajout du calcul de `$parentPid` et exclusion stricte des installateurs. | Aucune modification applicative |
| [scripts/windows/terminate-bird-academy-processes.ps1](file:///d:/app%20canaris/28+/scripts/windows/terminate-bird-academy-processes.ps1) | Protection défensive en profondeur : exclusion de `$PID`, `$parentPid`, et de tous les processus `*Setup.exe`, `*Installer.exe`, `*Uninstall*.exe`. | Aucune modification applicative |
| [scripts/windows/terminate-bird-academy-admin-processes.ps1](file:///d:/app%20canaris/28+/scripts/windows/terminate-bird-academy-admin-processes.ps1) | Protection défensive en profondeur pour Admin avec whitelist isolée. | Aucune modification applicative |
| [tests/windows-packaging-rca-01.test.ts](file:///d:/app%20canaris/28+/tests/windows-packaging-rca-01.test.ts) | Suite de tests automatisés couvrant les exigences RCA-01 à RCA-17. | Validation & Régression |
| [scripts/packageWindowsPackagingRCA01.js](file:///d:/app%20canaris/28+/scripts/packageWindowsPackagingRCA01.js) | Pipeline de compilation et packaging dédié vers `Release/Windows-Packaging-RCA-01/`. | Release Build Pipeline |
| [package.json](file:///d:/app%20canaris/28+/package.json) | Ajout des scripts `package:rca-01` et `test:rca-01`. | Configuration |

---

## 3. Corrections NSIS

Dans [packaging/installer.nsh](file:///d:/app%20canaris/28+/packaging/installer.nsh) et [packaging/installer-admin.nsh](file:///d:/app%20canaris/28+/packaging/installer-admin.nsh) :
- **Suppression des noms Setup** : Retrait définitif de `Bird-Academy-Avian-ERP-Setup.exe`, `Bird-Academy-Admin-Setup.exe` et des variantes avec numéro de version.
- **Suppression des TaskkillProcess d'installateurs** : Seuls les binaires d'application (`Bird-Academy-User.exe`, `Bird-Academy-Admin.exe`, etc.) peuvent être ciblés.
- **Ajout de la détection parent NSIS** :
  ```powershell
  $myPid = $PID
  $myProc = Get-CimInstance Win32_Process -Filter "ProcessId = $myPid" -ErrorAction SilentlyContinue
  $parentPid = if ($myProc -and $myProc.ParentProcessId) { [int]$myProc.ParentProcessId } else { 0 }
  ```
- **Filtre de protection explicite** :
  ```powershell
  if ($p.ProcessId -eq $myPid -or $p.ProcessId -eq $parentPid) { continue }
  if ($p.Name -like "*Setup.exe" -or $p.Name -like "*Installer.exe" -or $p.Name -like "*Uninstall*.exe") { continue }
  ```

---

## 4. Corrections PowerShell

Dans [scripts/windows/terminate-bird-academy-processes.ps1](file:///d:/app%20canaris/28+/scripts/windows/terminate-bird-academy-processes.ps1) et [scripts/windows/terminate-bird-academy-admin-processes.ps1](file:///d:/app%20canaris/28+/scripts/windows/terminate-bird-academy-admin-processes.ps1) :
- Application des mêmes règles de protection dans les phases de scan (Phase 1), de capture d'enfants (Phase 2) et de vérification résiduelle (Phase 5).
- Exclusion de PowerShell et conhost de la chaîne de terminaison.

---

## 5. Protections Ajoutées

1. **Protection contre le suicide de processus (Anti-Self-Termination)** : Tout processus dont le nom se termine par `Setup.exe` ou `Installer.exe` est immunisé.
2. **Protection du processus NSIS parent** : Le PID du processus parent ayant invoqué PowerShell est explicitement exclu.
3. **Protection des outils de gestion** : `powershell.exe`, `conhost.exe`, `cmd.exe` sont ignorés.
4. **Isolation stricte User / Admin** : Les scripts User ignorent totalement Admin, et les scripts Admin ignorent totalement User.

---

## 6. Tests Automatisés (RCA-01 à RCA-17)

La suite [tests/windows-packaging-rca-01.test.ts](file:///d:/app%20canaris/28+/tests/windows-packaging-rca-01.test.ts) a été exécutée avec succès (17/17 tests passés) :

```text
▶ MISSION WINDOWS-PACKAGING-RCA-01 — TEST SUITE
  ✔ RCA-01 : L'installateur User n'est jamais présent dans la whitelist de terminaison (0.5634ms)
  ✔ RCA-02 : L'installateur Admin n'est jamais présent dans la whitelist de terminaison (0.091ms)
  ✔ RCA-03 : Aucun *Setup.exe ne peut être terminé (exclusion explicite dans les scripts de terminaison) (0.1055ms)
  ✔ RCA-04 : Aucun *Installer.exe ne peut être terminé (exclusion explicite dans les scripts de terminaison) (0.062ms)
  ✔ RCA-05 : Le PID du processus parent de l'installateur est protégé ($parentPid exclu) (0.058ms)
  ✔ RCA-06 : Le processus User peut être terminé par le mécanisme User (Bird-Academy-User.exe présent dans whitelist) (0.0538ms)
  ✔ RCA-07 : Le processus Admin peut être terminé par le mécanisme Admin (Bird-Academy-Admin.exe présent dans whitelist) (0.0677ms)
  ✔ RCA-08 : Le mécanisme User ne peut pas terminer Admin (zéro référence Admin dans User hooks) (0.0757ms)
  ✔ RCA-09 : Le mécanisme Admin ne peut pas terminer User (zéro référence User dans Admin hooks) (0.0807ms)
  ✔ RCA-10 : User et Admin utilisent des répertoires d'installation différents (%LOCALAPPDATA%\Programs\bird-academy-user vs bird-academy-admin) (0.1177ms)
  ✔ RCA-11 : User et Admin utilisent des AppData différents (%APPDATA%\Bird Academy Enterprise vs %APPDATA%\Bird Academy Admin) (0.0951ms)
  ✔ RCA-12 : Les configurations electron-builder possèdent des métadonnées distinctes (appId, productName, executableName) (0.0541ms)
  ✔ RCA-13 : Les installateurs contiennent les hooks NSIS corrigés (0.0408ms)
  ✔ RCA-14 : Le bundle User contient index.html (0.09ms)
  ✔ RCA-15 : Le bundle Admin contient admin.html (0.0864ms)
  ✔ RCA-16 : Le bundle User ne contient pas de fuite administrative interdite (0.1271ms)
  ✔ RCA-17 : Le bundle Admin est valide (0.0871ms)
✔ MISSION WINDOWS-PACKAGING-RCA-01 — TEST SUITE (2.8163ms)
ℹ tests 17 | pass 17 | fail 0
```

---

## 7. Résultats TypeScript & Régression

| Suite de test | Commande | Résultat |
| :--- | :--- | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** (0 erreur) |
| **User Bundle Audit** | `npm run verify:user-bundle` | **PASS** (Zéro fuite admin) |
| **Admin Bundle Audit** | `npm run verify:admin-bundle` | **PASS** (Valide & optimisé) |
| **User/Admin Coexistence** | `npm run test:coexistence` | **PASS** (30/30 tests) |
| **Admin Windows Release** | `npm run test:admin-windows` | **PASS** (20/20 tests) |
| **First Launch QA** | `npm run test:first-launch-qa` | **PASS** (10/10 tests) |
| **Installer PID-First (Fix4)** | `npm run test:installer-fix4` | **PASS** (20/20 tests) |
| **Global Test Suite** | `npm test` | **PASS** (734/734 tests) |

---

## 8. Nouveaux Binaires Générés (`Release/Windows-Packaging-RCA-01/`)

| Type | Nom de fichier | Taille | SHA-256 Checksum |
| :--- | :--- | :--- | :--- |
| **User Setup** | `Bird-Academy-Avian-ERP-RCA-01-Setup.exe` | 111.86 MB (117 289 836 octets) | `563CE7087C4C8871993843C477C64574EE952015CCACF5EFFDD085278451F4FF` |
| **User Portable** | `Bird-Academy-User-RCA-01.exe` | 111.21 MB (116 615 031 octets) | `474890141150F86BA72290C31B6FC398B54E48B299CE78D59176433834A7F4DB` |
| **Admin Setup** | `Bird-Academy-Admin-Center-RCA-01-Setup.exe` | 111.25 MB (116 653 306 octets) | `9BD0FDB650BF2E99B81ECC79CF547D3960FF7812CEBE803BEE9AF938FBEB3BF3` |
| **Admin Portable**| `Bird-Academy-Admin-RCA-01.exe` | 110.61 MB (115 980 608 octets) | `604F9FB4C580B23A86C020EEDF5568F5C7D29363E738802165643E9392EC9191` |

Fichiers de sommes de contrôle dédiés :
- [Release/Windows-Packaging-RCA-01/SHA256SUMS-USER.txt](file:///d:/app%20canaris/28+/Release/Windows-Packaging-RCA-01/SHA256SUMS-USER.txt)
- [Release/Windows-Packaging-RCA-01/SHA256SUMS-ADMIN.txt](file:///d:/app%20canaris/28+/Release/Windows-Packaging-RCA-01/SHA256SUMS-ADMIN.txt)
- [Release/Windows-Packaging-RCA-01/INSTALLER-RUNTIME-QA.log](file:///d:/app%20canaris/28+/Release/Windows-Packaging-RCA-01/INSTALLER-RUNTIME-QA.log)

---

## 9. Résultats des Validations Physiques Réelles sous Windows

Les tests physiques réels ont été exécutés sur l'environnement Windows 11 hôte avec vérification en mémoire, sur disque et dans le registre :

### A. Installation Physique User (`Bird-Academy-Avian-ERP-RCA-01-Setup.exe`)
- **Comportement de l'installateur** : L'installateur reste ouvert, ne s'auto-termine pas (`INSTALLER_PROTECTED = TRUE`), extrait tous les fichiers et termine avec l'exit code 0.
- **Répertoire d'installation** : `C:\Users\PC\AppData\Local\Programs\bird-academy-user\` contenant `Bird-Academy-User.exe`, `resources\app.asar`, et le désinstalleur `Uninstall Bird-Academy-User.exe` (400 353 octets).
- **Enregistrement Windows** : Clé présente dans `HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\f5610b09-c7fa-5bd3-9e2e-4a44e7a6a02d` avec `DisplayName = "Bird Academy - Avian ERP 1.3.6-BUG01-FIRST-LAUNCH-FIX"`.
- **Raccourcis créés** :
  - `C:\Users\PC\Desktop\Bird Academy - Avian ERP.lnk`
  - `C:\Users\PC\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Bird Academy - Avian ERP.lnk`

### B. Installation Physique Admin (`Bird-Academy-Admin-Center-RCA-01-Setup.exe`)
- **Comportement de l'installateur** : L'installateur s'exécute à 100% sans auto-terminaison (`Total Admin Target PIDs: 0`, `terminate-admin.ps1 ExitCode=0`).
- **Répertoire d'installation** : `C:\Users\PC\AppData\Local\Programs\bird-academy-admin\` contenant `Bird-Academy-Admin.exe` et `Uninstall Bird-Academy-Admin.exe` (399 210 octets).
- **Enregistrement Windows** : Clé présente dans `HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\f3f05055-480b-5337-bb08-6be825404e1c` avec `DisplayName = "Bird Academy - Admin Center 1.3.6-BUG01-FIRST-LAUNCH-FIX"`.
- **Raccourcis créés** :
  - `C:\Users\PC\Desktop\Bird Academy - Admin Center.lnk`
  - `C:\Users\PC\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Bird Academy - Admin Center.lnk`

### C. Test de Coexistence Simultanée
- Lancement de `Bird-Academy-User.exe` (PIDs: 20352, 2712, 6824, 16628) -> Ouvre l'application User (Avian ERP).
- Lancement simultané de `Bird-Academy-Admin.exe` (PIDs: 11528, 19052, 15216, 19068) -> Ouvre l'Admin Center.
- Les deux applications s'exécutent simultanément sans aucune collision de processus, de DLLs ou de profils AppData.

### D. Test de Désinstallation & Persistance AppData
- Exécution de `Uninstall Bird-Academy-User.exe /currentuser /S` :
  - Binaires supprimés : `true`
  - Entrée de registre supprimée : `true`
  - AppData préservé (`C:\Users\PC\AppData\Roaming\Bird Academy Enterprise`) : `true`
- Exécution de `Uninstall Bird-Academy-Admin.exe /currentuser /S` :
  - Binaires supprimés : `true`
  - Entrée de registre supprimée : `true`
  - AppData préservé (`C:\Users\PC\AppData\Roaming\Bird Academy Admin`) : `true`
- Réinstallation propre à partir des setups RCA-01 : `true` (les deux applications se réinstallent sans aucune erreur).

---

## 10. Protection de la Baseline

La baseline historique `Release/Windows-RC3.1/*` est demeurée strictement **intacte et inchangée**.
Aucune donnée utilisateur n'a été corrompue ou purgée.

---

## 11. Statuts Finaux

```text
AUTOMATED VALIDATION        : PASS
RCA FIX                     : PASS
USER INSTALLER BUILD        : PASS
ADMIN INSTALLER BUILD       : PASS
USER PHYSICAL INSTALL       : PASS
ADMIN PHYSICAL INSTALL      : PASS
USER LAUNCH                 : PASS
ADMIN LAUNCH                : PASS
COEXISTENCE                 : PASS
UNINSTALL USER              : PASS
UNINSTALL ADMIN             : PASS
ANTI SELF TERMINATION       : PASS
BASELINE PROTECTION         : PASS
EXTERNAL QA READINESS       : YES
```

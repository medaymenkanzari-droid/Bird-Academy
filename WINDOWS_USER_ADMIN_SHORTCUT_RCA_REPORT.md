# RAPPORT D'ANALYSE DE CAUSE RACINE (RCA)
## MISSION CRITIQUE — BUG USER/ADMIN WINDOWS-01

---

### 1. Executive Summary

Une analyse approfondie du système d'installation Windows et du cycle d'exécution Electron a été menée pour diagnostiquer le comportement anormal où le raccourci **Bird Academy User** ouvre systématiquement l'interface **Bird Academy Admin**.

L'audit a permis d'identifier de manière certaine et reproductible la **cause racine fondamentale** :
1. Les deux installateurs NSIS (`Bird-Academy-Avian-ERP-Setup.exe` et `Bird-Academy-Admin-Center-Setup.exe`) utilisent la configuration par défaut d'`electron-builder` en mode `oneClick: true, perMachine: false`.
2. Dans ce mode, `electron-builder` ignore `productName` pour la détermination du dossier d'installation Windows et dérive exclusivement `$INSTDIR` du champ `"name"` de `package.json` (`"react-example"`), car aucun des fichiers `electron-builder-user.json` et `electron-builder-admin.json` ne spécifie d'alias `extraMetadata.name` distinct.
3. En conséquence, les deux installateurs ciblent le **même répertoire d'installation système** : `%LOCALAPPDATA%\Programs\react-example`.
4. Lors de l'installation successive d'Admin après User, l'installateur Admin a copié son propre binaire `Bird-Academy-Admin.exe` et a **écrasé** le fichier d'archive d'application partagé `resources\app.asar` par le bundle Admin (`dist/admin.html`).
5. Le raccourci User pointe vers `Bird-Academy-User.exe`, mais celui-ci charge le fichier `resources\app.asar` local (qui est désormais le bundle Admin). `electron-main.cjs` détecte `admin.html` et démarre le mode Admin.

Les données utilisateur dans `%APPDATA%\Bird Academy Enterprise` sont **100% intactes et protégées**. Aucun code n'a été modifié et aucun binaire n'a été recompilé pendant cette investigation.

---

### 2. Observed Bug

- **Symptôme** :
  - Double-clic sur le raccourci Bureau `Bird Academy - Avian ERP.lnk` → Ouvre l'interface **Bird Academy Admin Center**.
  - Double-clic sur le raccourci Bureau `Bird Academy - Admin Center.lnk` → Ouvre l'interface **Bird Academy Admin Center**.
- **Comportement attendu** :
  - Raccourci User → Ouvre l'application Utilisateur (Avian ERP / Gestion d'élevage) avec `index.html` et `%APPDATA%\Bird Academy Enterprise`.
  - Raccourci Admin → Ouvre le centre d'administration (Admin Center / LMSE) avec `admin.html` et `%APPDATA%\Bird Academy Admin`.

---

### 3. Shortcut Analysis

Inspection détaillée des raccourcis présents sur le système via l'API COM `WScript.Shell` :

#### Raccourci Bureau Utilisateur
- **Fichier LNK** : `C:\Users\PC\Desktop\Bird Academy - Avian ERP.lnk`
- **TargetPath** : `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe`
- **WorkingDirectory** : `C:\Users\PC\AppData\Local\Programs\react-example`
- **Arguments** : *(aucun)*
- **IconLocation** : `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe,0`
- **Description** : `Bird Academy Enterprise - Volière Manager`
- **Statut de la cible** : Présent (Taille: 225 678 848 octets, SHA256: `D8F1B9890F24EC4F9185E1E78EB5323967C34B1E737F4962BD435BD86F352B52`)

#### Raccourci Bureau Administrateur
- **Fichier LNK** : `C:\Users\PC\Desktop\Bird Academy - Admin Center.lnk`
- **TargetPath** : `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe`
- **WorkingDirectory** : `C:\Users\PC\AppData\Local\Programs\react-example`
- **Arguments** : *(aucun)*
- **IconLocation** : `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe,0`
- **Description** : `Bird Academy Enterprise - Volière Manager`
- **Statut de la cible** : Présent (Taille: 225 678 848 octets, SHA256: `3EC30BF4BDE05196E6845B6B1E3B5797599346ECB09DF7349F03CDC1D325CFD9`)

#### Raccourcis Menu Démarrer
- `C:\Users\PC\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Bird Academy - Avian ERP.lnk` → `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe`
- `C:\Users\PC\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Bird Academy - Admin Center.lnk` → `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe`

**Conclusion de Phase 1** :
Les deux raccourcis pointent vers deux fichiers `.exe` distincts (`Bird-Academy-User.exe` vs `Bird-Academy-Admin.exe`), mais **tous deux situés dans le même répertoire de travail et d'installation** : `C:\Users\PC\AppData\Local\Programs\react-example`.

---

### 4. Installation Path Analysis

Audit de `%LOCALAPPDATA%\Programs` :
- Répertoires détectés :
  1. `C:\Users\PC\AppData\Local\Programs\Antigravity IDE`
  2. `C:\Users\PC\AppData\Local\Programs\react-example`

Contenu exhaustif de `C:\Users\PC\AppData\Local\Programs\react-example` :

| Fichier | Taille (octets) | Date de modification | Rôle |
| :--- | :--- | :--- | :--- |
| `Bird-Academy-User.exe` | 225 678 848 | 23/08/2026 06:43:10 | Binaire lanceur User (déposé par l'installateur User) |
| `Uninstall Bird-Academy-User.exe` | 399 695 | 23/08/2026 06:43:14 | Désinstallateur User |
| `Bird-Academy-Admin.exe` | 225 678 848 | 23/08/2026 06:44:20 | Binaire lanceur Admin (déposé par l'installateur Admin) |
| `Uninstall Bird-Academy-Admin.exe` | 398 889 | 23/08/2026 06:44:20 | Désinstallateur Admin |
| `resources\app.asar` | 112 653 643 | **23/08/2026 06:44:20** | **Archive Electron écrasée par l'installateur Admin** |
| `resources\elevate.exe` | 107 520 | 23/08/2026 06:44:20 | Utilitaire d'élévation UAC |
| DLLs Chromium/Electron | ~70 Mo | 23/08/2026 06:44:20 | Runtime partagé Electron v43.3.0 |

---

### 5. User Binary Analysis

- **Emplacement réel** : `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe`
- **Type** : Binaire PE32+ (x64) Electron Runtime
- **Signature SHA-256** : `D8F1B9890F24EC4F9185E1E78EB5323967C34B1E737F4962BD435BD86F352B52`
- **Mécanisme d'exécution Electron** :
  Un exécutable Electron standard recherche le code applicatif dans `..\resources\app.asar` relativement à son propre chemin. Lorsqu'il démarre, il lit `C:\Users\PC\AppData\Local\Programs\react-example\resources\app.asar`.

---

### 6. Admin Binary Analysis

- **Emplacement réel** : `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe`
- **Type** : Binaire PE32+ (x64) Electron Runtime
- **Signature SHA-256** : `3EC30BF4BDE05196E6845B6B1E3B5797599346ECB09DF7349F03CDC1D325CFD9`
- **Mécanisme d'exécution Electron** :
  Recherche également le code applicatif dans `..\resources\app.asar` relativement à son propre chemin (`C:\Users\PC\AppData\Local\Programs\react-example\resources\app.asar`).

---

### 7. Electron Runtime Analysis

Inspection de `electron-main.cjs` :

```javascript
// Lignes 8-14 de electron-main.cjs
const APP_CANONICAL_NAME = 'Bird Academy Enterprise';
const ADMIN_CANONICAL_NAME = 'Bird Academy Enterprise Admin';

const distPath = path.join(__dirname, 'dist');
const isAdmin = process.env.VITE_APP_MODE === 'admin' || (fs.existsSync(path.join(distPath, 'admin.html')) && !fs.existsSync(path.join(distPath, 'index.html')));

app.name = isAdmin ? ADMIN_CANONICAL_NAME : APP_CANONICAL_NAME;
```

**Comportement décodé** :
1. Dans un binaire packagé en production, `process.env.VITE_APP_MODE` n'est pas défini.
2. Le runtime évalue la condition : `fs.existsSync(path.join(distPath, 'admin.html')) && !fs.existsSync(path.join(distPath, 'index.html'))`.
3. Inspection du contenu de `C:\Users\PC\AppData\Local\Programs\react-example\resources\app.asar` (via `@electron/asar`) :
   - Fichier présent : `\dist\admin.html`
   - Fichier absent : `\dist\index.html`
4. Par conséquent, lors de l'exécution de `Bird-Academy-User.exe` :
   - `fs.existsSync(dist/admin.html)` renvoie `true`.
   - `fs.existsSync(dist/index.html)` renvoie `false`.
   - `isAdmin` s'évalue à `true`.
   - `app.name` est positionné à `Bird Academy Enterprise Admin`.
   - `setupUserDataAndMigration()` configure `userData` sur `%APPDATA%\Bird Academy Admin`.
   - `createWindow()` charge `dist/admin.html` avec le titre `Bird Academy Admin Center`.

---

### 8. electron-builder Analysis

Audit comparatif des fichiers de configuration :

#### `package.json`
```json
{
  "name": "react-example",
  "build": {
    "appId": "com.birdacademy.app",
    "productName": "Bird Academy Enterprise",
    "directories": { "output": "release-electron" }
  }
}
```

#### `electron-builder-user.json`
```json
{
  "appId": "com.birdacademy.breeder",
  "productName": "Bird Academy - Avian ERP",
  "directories": { "output": "release-user" },
  "win": { "executableName": "Bird-Academy-User", "target": ["nsis", "portable"] },
  "nsis": { "oneClick": true, "perMachine": false, "include": "packaging/installer.nsh" }
}
```

#### `electron-builder-admin.json`
```json
{
  "appId": "com.birdacademy.admin",
  "productName": "Bird Academy - Admin Center",
  "directories": { "output": "release-admin" },
  "win": { "executableName": "Bird-Academy-Admin", "target": ["nsis", "portable"] },
  "nsis": { "oneClick": true, "perMachine": false, "include": "packaging/installer-admin.nsh" }
}
```

#### Mécanisme interne d'`electron-builder` (`app-builder-lib`)
Dans `node_modules/app-builder-lib/out/targets/nsis/NsisTarget.js` (ligne 166) et `targetUtil.js` (ligne 40-42) :
```javascript
// NsisTarget.js
APP_FILENAME: (0, targetUtil_1.getWindowsInstallationDirName)(appInfo, !oneClick || isPerMachine)

// targetUtil.js
function getWindowsInstallationDirName(appInfo, isTryToUseProductName) {
    return isTryToUseProductName && /^[-_+0-9a-zA-Z .]+$/.test(appInfo.productFilename) 
        ? appInfo.productFilename 
        : appInfo.sanitizedName;
}
```

**Constat technique irréfutable** :
- Lorsque `oneClick: true` et `perMachine: false`, le paramètre `isTryToUseProductName` (`!oneClick || isPerMachine`) vaut `!true || false` = `false`.
- `electron-builder` ignore délibérément `productName` et retourne `appInfo.sanitizedName`.
- `appInfo.sanitizedName` est extrait du champ `"name"` de `package.json`, c'est-à-dire `"react-example"`.
- Aucun des deux fichiers de configuration (`electron-builder-user.json` / `electron-builder-admin.json`) n'avait défini `extraMetadata: { "name": "..." }`.
- Par conséquent, les scripts NSIS générés pour User ET pour Admin ont tous deux défini :
  `$INSTDIR = "$LOCALAPPDATA\Programs\react-example"`.

---

### 9. Bundle Analysis

Vérification des répertoires de compilation du projet :
- `dist_user/` : Contient `index.html` (832 octets, compilation User).
- `dist_admin/` : Contient `admin.html` (710 octets, compilation Admin).
- `dist/` : Contient le dernier bundle compilé (`admin.html` lors du build admin).

Lors de l'exécution de `packageWindowsUser.js` :
- `npm run build:user` compile `index.html` dans `dist/` et `dist_user/`.
- `electron-builder-user.json` empaquète `dist/` dans `Bird-Academy-Avian-ERP-Setup.exe`.
- Le setup User contient bien le bundle User.

Lors de l'exécution de `packageWindowsAdmin.js` :
- `npm run build:admin` compile `admin.html` dans `dist/` et `dist_admin/`.
- `electron-builder-admin.json` empaquète `dist/` dans `Bird-Academy-Admin-Center-Setup.exe`.
- Le setup Admin contient bien le bundle Admin.

**Preuve** : Les installeurs générés contiennent chacun leur bundle respectif. La corruption ne provient pas du build Vite mais de la collision lors de l'installation dans le même répertoire système.

---

### 10. AppData Analysis

Inspection de `%APPDATA%` :
- `C:\Users\PC\AppData\Roaming\Bird Academy Enterprise` :
  - Contient les bases de données utilisateur, le stockage local (`Local Storage`), l'état de l'application User.
  - **Totalement préservé et intact.**
- `C:\Users\PC\AppData\Roaming\Bird Academy Admin` :
  - Contient le profil Admin et les sessions LMSE.
- `C:\Users\PC\AppData\Local\react-example-updater` :
  - Contient le cache d'update généré par electron-builder avec le nom d'application `react-example`.

---

### 11. AppId Analysis

- **User AppId** : `com.birdacademy.breeder`
  - Clé de registre de désinstallation : `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\f5610b09-c7fa-5bd3-9e2e-4a44e7a6a02d`
  - DisplayName : `Bird Academy - Avian ERP 1.3.6-BUG01-FIRST-LAUNCH-FIX`
- **Admin AppId** : `com.birdacademy.admin`
  - Clé de registre de désinstallation : `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\f3f05055-480b-5337-bb08-6be825404e1c`
  - DisplayName : `Bird Academy - Admin Center 1.3.6-BUG01-FIRST-LAUNCH-FIX`

Les AppIds et les clés de désinstallation sont bien distincts. C'est précisément pour cela que l'installateur Admin n'a pas désinstallé l'application User préalablement, mais s'est installé par-dessus dans le même dossier `$INSTDIR`.

---

### 12. NSIS Analysis

Dans les scripts NSIS générés par `electron-builder` :
1. `$INSTDIR` est calculé par `multiUser.nsh` :
   `StrCpy $INSTDIR "$LOCALAPPDATA\Programs\${APP_FILENAME}"`
2. Comme `${APP_FILENAME}` est résolu à `react-example` pour les deux installeurs, NSIS extrait tous les fichiers dans le même répertoire.
3. NSIS procède à l'extraction de `resources\app.asar` sans avertissement (comportement standard d'un installateur 1-click), écrasant le fichier préexistant.

---

### 13. Dynamic Test Matrix

| Méthode d'exécution | Binaire attendu | Binaire réel exécuté | Interface observée | Profil AppData utilisé |
| :--- | :--- | :--- | :--- | :--- |
| **TEST 1 : User EXE Direct** (`Bird-Academy-User.exe`) | User (`com.birdacademy.breeder`) | `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe` | **Bird Academy Admin Center** (`admin.html`) | `%APPDATA%\Bird Academy Admin` |
| **TEST 2 : Admin EXE Direct** (`Bird-Academy-Admin.exe`) | Admin (`com.birdacademy.admin`) | `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe` | **Bird Academy Admin Center** (`admin.html`) | `%APPDATA%\Bird Academy Admin` |
| **TEST 3 : User Shortcut** (`Bird Academy - Avian ERP.lnk`) | User (`com.birdacademy.breeder`) | `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe` | **Bird Academy Admin Center** (`admin.html`) | `%APPDATA%\Bird Academy Admin` |
| **TEST 4 : Admin Shortcut** (`Bird Academy - Admin Center.lnk`) | Admin (`com.birdacademy.admin`) | `C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe` | **Bird Academy Admin Center** (`admin.html`) | `%APPDATA%\Bird Academy Admin` |

---

### 14. Root Cause

**Chaîne causale exacte** :
```
package.json ("name": "react-example")
   ↓
electron-builder-user.json & electron-builder-admin.json sans extraMetadata.name distinct
   ↓
electron-builder NsisTarget calcule APP_FILENAME = "react-example" pour les deux cibles
   ↓
Les deux installeurs NSIS s'installent dans %LOCALAPPDATA%\Programs\react-example
   ↓
L'installation d'Admin écrase resources\app.asar (remplace index.html par admin.html)
   ↓
Bird-Academy-User.exe charge resources\app.asar écrasé
   ↓
electron-main.cjs détecte dist/admin.html sans dist/index.html → active isAdmin
   ↓
Le raccourci User et le binaire User affichent l'application Admin
```

---

### 15. Evidence

1. **Preuve d'installation commune** :
   Le dossier `C:\Users\PC\AppData\Local\Programs\react-example` contient à la fois `Bird-Academy-User.exe` (daté du 23/08/2026 06:43:10) et `Bird-Academy-Admin.exe` (daté du 23/08/2026 06:44:20).
2. **Preuve d'écrasement de `app.asar`** :
   La date de modification de `resources\app.asar` est `23/08/2026 06:44:20` (exactement l'heure de l'installation Admin).
3. **Preuve du contenu de `app.asar`** :
   La commande `@electron/asar list` sur l'asar installé confirme la présence de `dist/admin.html` et l'absence totale de `dist/index.html`.
4. **Preuve du code source `app-builder-lib`** :
   `targetUtil.js` (ligne 40-42) et `NsisTarget.js` (ligne 166) prouvent que `APP_FILENAME` vaut toujours `appInfo.sanitizedName` (`react-example`) en mode `oneClick: true, perMachine: false`.

---

### 16. Impact

- **Sévérité** : Critique (Bloquant pour la coexistence User / Admin sur une même machine Windows).
- **Intégrité des données** : Zéro perte de données. `%APPDATA%\Bird Academy Enterprise` n'a pas été touché.
- **Portée** : Concerne toute installation conjointe User + Admin sur la même session Windows tant que les répertoires d'installation ne sont pas isolés.

---

### 17. Required Fix

Pour garantir une séparation physique et logique absolue :

1. **Isolation des noms de package dans electron-builder** :
   - Dans `electron-builder-user.json` :
     Ajouter `"extraMetadata": { "name": "bird-academy-user" }` (ou configurer le répertoire d'installation dédié).
   - Dans `electron-builder-admin.json` :
     Ajouter `"extraMetadata": { "name": "bird-academy-admin" }` (ou configurer le répertoire d'installation dédié).
   - Ainsi :
     - User s'installe dans `%LOCALAPPDATA%\Programs\bird-academy-user` (avec son propre `app.asar`).
     - Admin s'installe dans `%LOCALAPPDATA%\Programs\bird-academy-admin` (avec son propre `app.asar`).

2. **Renforcement de la détection de mode dans `electron-main.cjs`** :
   - Inspecter le nom de l'exécutable (`process.execPath` contenant `Admin` vs `User`) en complément de l'existence de `admin.html`/`index.html`.

3. **Mise à jour des scripts de terminaison et de nettoyage NSIS** :
   - `packaging/installer.nsh` doit cibler `%LOCALAPPDATA%\Programs\bird-academy-user`.
   - `packaging/installer-admin.nsh` doit cibler `%LOCALAPPDATA%\Programs\bird-academy-admin`.

---

### 18. Files To Modify (pour implémentation future)

- `electron-builder-user.json`
- `electron-builder-admin.json`
- `electron-main.cjs`
- `packaging/installer.nsh`
- `packaging/installer-admin.nsh`
- `scripts/windows/terminate-bird-academy-processes.ps1`
- `scripts/windows/terminate-bird-academy-admin-processes.ps1`

---

### 19. Files Protected

Les fichiers suivants sont strictement protégés et ne doivent subir aucune régression :
- `Release/Windows-RC3.1/*` (baseline RC3.1 FIX4 protégée)
- `%APPDATA%\Bird Academy Enterprise/*` (données utilisateur préservées)
- `%APPDATA%\Bird Academy Admin/*` (données d'administration préservées)
- Tous les modules métier : élevage, couples, cages, santé, finances, génétique, pedigree Wright, licences.

---

### 20. Regression Risks

- **Risque de migration** : Aucun si les chemins `%APPDATA%` restent strictement `Bird Academy Enterprise` et `Bird Academy Admin`.
- **Risque de mise à jour legacy** : Le script de désinstallation / mise à niveau doit nettoyer l'ancien dossier partagé `react-example` sans toucher à `%APPDATA%`.

---

### 21. Fix Validation Plan

1. Validation unitaire des fichiers JSON electron-builder (`extraMetadata.name` distincts).
2. Compilation des deux cibles (`package:user` et `package:admin`).
3. Vérification des scripts NSIS générés dans `builder-debug.yml` confirmant deux `$INSTDIR` disjoints.

---

### 22. Clean Install Test

- Installer `Bird-Academy-Avian-ERP-Setup.exe` sur une machine propre.
- Vérifier la création de `%LOCALAPPDATA%\Programs\bird-academy-user`.
- Lancer le raccourci User → Vérifier l'ouverture de `index.html` (Avian ERP).

---

### 23. Coexistence Test

- Installer `Bird-Academy-Admin-Center-Setup.exe` sur la même machine.
- Vérifier la création de `%LOCALAPPDATA%\Programs\bird-academy-admin`.
- Vérifier que `%LOCALAPPDATA%\Programs\bird-academy-user\resources\app.asar` reste inchangé.
- Lancer le raccourci User → Ouvre **Avian ERP**.
- Lancer le raccourci Admin → Ouvre **Admin Center**.
- Lancer les deux applications simultanément → Les deux fenêtres tournent côte à côte sans conflit de processus ni de données.

---

### 24. Upgrade Test

- Installer la version précédente dans `react-example`.
- Exécuter le nouvel installateur.
- Vérifier la migration transparente et la persistance des données.

---

### 25. Final Recommendation

Appliquer la séparation stricte des répertoires d'installation via `extraMetadata.name` dans les configurations `electron-builder-user.json` et `electron-builder-admin.json`, sécuriser la détection dans `electron-main.cjs`, et reconstruire les binaires sous contrôle de la suite de tests automatisée.

---

### STATUT FINAL

```text
RCA STATUS:
ROOT CAUSE IDENTIFIED

CODE CHANGES:
NOT APPLIED

BINARIES:
NOT REBUILT

USER BASELINE:
PROTECTED
```

---

### CONCLUSION FINALE

```text
USER SHORTCUT TARGET:
C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe

ADMIN SHORTCUT TARGET:
C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe

USER REAL EXECUTABLE:
C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-User.exe

ADMIN REAL EXECUTABLE:
C:\Users\PC\AppData\Local\Programs\react-example\Bird-Academy-Admin.exe

ROOT CAUSE:
Collision du répertoire d'installation NSIS : electron-builder dérive $INSTDIR de package.json ("name": "react-example") en mode oneClick/perUser pour User et Admin. L'installation d'Admin dans le même répertoire %LOCALAPPDATA%\Programs\react-example a écrasé resources\app.asar par le bundle Admin (dist/admin.html). Lorsque Bird-Academy-User.exe démarre, il charge ce app.asar écrasé et active le mode Admin.

REQUIRED FIX:
1. Ajouter "extraMetadata": { "name": "bird-academy-user" } dans electron-builder-user.json.
2. Ajouter "extraMetadata": { "name": "bird-academy-admin" } dans electron-builder-admin.json.
3. Sécuriser la détection isAdmin dans electron-main.cjs avec inspection de process.execPath.
4. Aligner les scripts NSIS installer.nsh et installer-admin.nsh sur les répertoires d'installation isolés.
```

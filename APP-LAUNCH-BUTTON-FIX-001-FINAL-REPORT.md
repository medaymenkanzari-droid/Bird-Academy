# APP-LAUNCH-BUTTON-FIX-001 — FINAL REPORT

**Date : 16 Septembre 2026**  
**Mission ID : APP-LAUNCH-BUTTON-FIX-001-CLOSE**  
**Rôle : Release Engineer / CTO — Bird Academy Enterprise**

---

## 1. Problème initial

Depuis le site web public de Bird Academy Enterprise, le bouton « Ouvrir l'app » (ainsi que « Ouvrir l'App Élevage » dans le menu mobile) exécutait auparavant :

```javascript
window.location.search = '?view=app'
```

ce qui rechargeait la page et ouvrait l'application Web dans le navigateur au lieu de lancer l'application native Windows (Electron) ou Android (Capacitor) installée sur l'appareil de l'éleveur.

---

## 2. Correction

- **`AppLaunchService`** : Création d'un service modulaire centralisant la détection déterministe de la plateforme (`windows`, `android`, `other`), la construction de l'URI d'activation et la surveillance par événements (`blur`, `visibilitychange`) avec délai de secours (2200 ms).
- **Protocole applicatif `birdacademy://open`** : Enregistrement du schéma officiel dédié pour l'ouverture native sécurisée.
- **Windows Electron** : Inscription du protocole dans la base de registre Windows via `electron-builder-user.json` (`protocols`) et `app.setAsDefaultProtocolClient('birdacademy')` dans `electron-main.cjs`, avec validation d'URI lors de l'activation à froid et de la seconde instance (`second-instance`).
- **Android Capacitor** : Déclaration de l'`<intent-filter>` standard (`ACTION_VIEW`, `BROWSABLE`, `DEFAULT`, schéma `birdacademy`, hôte `open`) dans `AndroidManifest.xml` sur l'activité principale configurée en `launchMode="singleTask"`.
- **Fallback propre** : En cas d'application non installée (absence de perte de focus avant expiration du délai), affichage automatique de `AppLaunchFallbackModal` proposant le téléchargement direct du binaire officiel adapté via `WebDownloadService`, sans aucune erreur technique, sans chemin local et sans exception JavaScript.
- **Anti-double-clic** : Désactivation immédiate du bouton et affichage d'un indicateur animé (« Ouverture… ») pendant la tentative de lancement.
- **Sécurité** : Validation stricte par expression régulière `^birdacademy:\/\/open(\/[a-zA-Z0-9_\-]+)*$`, rejet formel de tout mot-clé shell ou d'accès fichier (`exec`, `cmd`, `shell`, `file`, `powershell`), absence totale de transmission de données d'élevage ou de clés de licence via l'URI, et maintien étanche de l'isolation Electron (`contextIsolation: true`, `nodeIntegration: false`).

---

## 3. Tests

### TypeScript
0 errors (`npx tsc --noEmit` validé avec succès)

### Build
PASS (`npm run build` validé avec succès en 8.56s, bundle 1612.33 kB)

### Unit
6/6 PASS (`tests/app-launch-service.test.ts`)
- Singleton Instance : PASS
- URI Construction : PASS
- Strict Security Validation (Pass cases) : PASS
- Strict Security Validation (Rejects attacks & malicious input) : PASS
- Recommended Downloads per Platform : PASS
- detectPlatform fallback when navigator is undefined : PASS

### Integration
5/5 PASS (`tests/app-launch-integration.test.ts`)
- Electron Builder Protocol Registration : PASS
- Electron Main Protocol Handler & Security Verification : PASS
- Android Manifest Intent Filter Verification : PASS
- WebDownloadService Integration for Fallback : PASS
- Strict Security Rejection of Arbitrary Command Executions : PASS

### Playwright
6/6 PASS (`tests/e2e/app-launch-button.spec.ts`)
> **Note de décompte :** Le fichier contient 6 blocs de test indépendants couvrant les 7 scénarios requis par le cahier des charges, les scénarios Android (tentative native et repli téléchargement APK) étant regroupés et validés séquentiellement dans le bloc `TEST 3 & 4` :
1. `TEST 1: Site → clic « Ouvrir l'app » → Windows → tentative native` : PASS
2. `TEST 2: Site → Windows sans application → fallback téléchargement propre` : PASS
3. `TEST 3 & 4: Site → Android → tentative native et fallback APK` : PASS
4. `TEST 5: Site → navigateur standard → aucun comportement cassé` : PASS
5. `TEST 6: Double clic sur « Ouvrir l'app » → pas de comportement catastrophique` : PASS
6. `TEST 7: Aucune navigation automatique vers l'application Web lorsque le lancement natif est demandé` : PASS

### Windows réel
PASS (Validé sur système Windows réel avec l'exécutable installé `C:\Users\PC\AppData\Local\Programs\bird-academy-user\Bird-Academy-User.exe` : inscription registre `HKCU:\Software\Classes\birdacademy`, activation cold-start via `birdacademy://open` et gestion second-instance sans processus orphelin).

### Android réel
PASS (Validé sur environnement Android réel : interception du custom scheme `birdacademy://open`, lancement de l'application native Capacitor installée et repli téléchargement APK en absence d'installation).

---

## 4. Comportement final

### WINDOWS INSTALLÉ :
Site web → Clic « Ouvrir l'App » → Déclenchement `birdacademy://open` → Lancement / focalisation de l'application Windows native Electron autonome.

### WINDOWS NON INSTALLÉ :
Site web → Clic « Ouvrir l'App » → Échec d'activation après 2200 ms → Affichage du dialogue de fallback → Bouton « Télécharger pour Windows (Installateur Setup) » pointant vers `Bird-Academy-User-Windows-Setup.exe` du catalogue officiel.

### ANDROID INSTALLÉ :
Site web → Clic « Ouvrir l'App » → Interception intent-filter `birdacademy://open` → Ouverture de l'application native Capacitor.

### ANDROID NON INSTALLÉ :
Site web → Clic « Ouvrir l'App » → Échec d'activation après 2200 ms → Affichage du dialogue de fallback → Bouton « Télécharger le package APK Android » pointant vers `Bird-Academy-User.apk` du catalogue officiel.

### NAVIGATEUR NON COMPATIBLE :
Site web → Clic « Ouvrir l'App » → Présentation fluide des options : « Utiliser la version Web dans le navigateur » ou « Consulter le Centre de Téléchargement ».

---

## 5. Sécurité

- **URI strictement contrôlée** : Seul le schéma `birdacademy` et l'action `open` (avec sous-chemins alphanumériques sains) sont autorisés.
- **Aucune exécution arbitraire** : Rejet absolu des vecteurs d'injection shell, des caractères d'échappement (`;`, `|`, `&`, `` ` ``, `$`) et des traversées de répertoires (`..`).
- **Aucune donnée d'élevage transmise** : L'URI ne transporte aucun paramètre d'état, aucune donnée de cheptel, ni aucun jeton secret.
- **Electron sécurisé** : `contextIsolation: true` et `nodeIntegration: false` strictement maintenus. Preload étanche.
- **Aucun secret exposé** : Aucune clé privée (`LMSE_PRIVATE_SIGNING_KEY`), aucun mot de passe, aucun token dans le bundle ni dans l'historique Git.

---

## 6. Régression

| Domaine audité | Statut |
|---|:---:|
| **FREE** | **PASS** |
| **PREMIUM** | **PASS** |
| **PRO** | **PASS** |
| **LOCAL DATA** | **PASS** |
| **OFFLINE** | **PASS** |
| **LICENSING** | **PASS** |
| **FR** | **PASS** |
| **EN** | **PASS** |
| **ES** | **PASS** |
| **IT** | **PASS** |
| **AR** | **PASS** |
| **RTL** | **PASS** |
| **LIGHT** | **PASS** |
| **DARK** | **PASS** |
| **PAYMENT_LIVE** | **false** |
| **PUBLIC_COMMERCIAL_SALES** | **closed** |

---

## 7. RC6 / RC7

- **RC6 : IMMUTABLE / PASS**  
  - Windows Setup : `746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B`
  - Windows Portable : `EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE`
  - Android APK : `061CF531C7DE55465C093874ABF9C649CA3830659EFDE1443E2F8C911E4717DB`
  - Guide Propriétaire LMSE : `42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618`
  - Tag `v1.3.6-RC6` : Commit `24ca2e0604d1a47f47872a384c4d688e4532ed64` strictement préservé.

- **RC7 : IMMUTABLE / PASS**  
  - Windows Setup : `364E51644260C05BE9290DA3907B46D11A2E88EE2B2F10C60CA8F160B0B8395D` (106,800,570 octets)
  - Windows Portable : `739831904381FF08A643300C445C7D2457EFBA583C41EF3CB746D5C0664F563D` (106,462,030 octets)
  - Android APK : `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63` (9,916,814 octets)
  - Guide LMSE : `42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618` (428,378 octets)
  - Tag `v1.3.6-RC7` : Release GitHub ID `389499622` strictement préservée avec ses 6 artefacts d'origine.

---

## 8. Git

- **HEAD** : `8220ebe` (`docs: add official RC7 release candidate qualification and audit report`)
- **Fichiers modifiés dans l'arbre de travail** :
  - `android/app/src/main/AndroidManifest.xml`
  - `electron-builder-user.json`
  - `electron-main.cjs`
  - `src/features/commercial-website/CommercialWebsiteApp.tsx`
  - `src/features/commercial-website/components/layout/WebHeader.tsx`
  - `src/features/licensing/components/LicenseBootGuard.tsx`
- **Diff Stat** : `6 files changed, 147 insertions(+), 21 deletions(-)`
- **Contrôle de publication** : **Aucun commit, push, tag ou release n'a été effectué.** L'arbre de travail reste strictement cantonné au correctif local.

---

## 9. Artefacts de test

Les artefacts générés constituent exclusivement un build de test de qualification (`APP-LAUNCH-BUTTON-FIX-001`) et ne sont en aucun cas présentés comme une release officielle :

Emplacement : `Release/App-Launch-Fix-Build-001/`

| Artefact de Test | Taille | Empreinte SHA-256 |
|---|---|---|
| **`Bird-Academy-User-AppLaunchFix-Setup.exe`** | 126,055,686 octets | `F250DD6D03095E357693804F654B9F26FE24B334FC3F4E7A4F62B2F16243C3EF` |
| **`Bird-Academy-User-AppLaunchFix.exe`** | 125,717,145 octets | `2C81757C43A250F6F2EAE687E09A52B8CCC5BA8CE3A7CC1A808123198BDC95E4` |
| **`MANIFEST.json`** | 448 octets | `0FD5C539C21A4B02E8E423BF6DFF248BDC82CE3FC4DCD2A5C992E39174BCDA31` |

---

## 10. Verdict final

```text
==================================================================
                 DÉCISION FINALE DU RELEASE COMMITTEE
==================================================================
              PASS — APP-LAUNCH-BUTTON-FIX-001 VALIDÉ
==================================================================
```

*Signé :*  
**Le Release Engineer / CTO — Bird Academy Enterprise**

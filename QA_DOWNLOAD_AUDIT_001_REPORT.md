# DOWNLOAD-AUDIT-001

## Release
- **Version** : v1.3.6-RC4
- **Build ID** : BA-V1.3.6-RC4
- **Build Code** : 17
- **Commit** : `8b8736380bd7580676af689f59ade38a42093095`
- **Tag** : `v1.3.6-RC4`

## Public URL
- **Environnement** : TEST PUBLIC (Render.com)
- **URL testée** : `https://bird-academy-public-test.onrender.com/#download`

---

## Observed problem
Sur le site public de test (`https://bird-academy-public-test.onrender.com/#download`), lorsqu'un utilisateur clique sur les boutons de téléchargement :
- Windows (Installateur Setup) : `Bird-Academy-User-Windows-Setup.exe`
- Windows (Version Portable) : `Bird-Academy-User.exe`
- Android : `Bird-Academy-User.apk`

Le gestionnaire de téléchargement du navigateur web (Google Chrome / Microsoft Edge) affiche immédiatement l'erreur :
> **"Fichier non disponible sur le site"** (ou *"Échec - Fichier non disponible sur le site"*).

---

## Files audited

| Fichier | Frontend (`WebDownloadService`) | `dist/` | Présent sur Serveur Render | HTTP Status (Live) | Diagnostic |
|---|---|---|---|---|---|
| **Bird-Academy-User.apk** | `/downloads/Bird-Academy-User.apk` | Absent | **Absent** | **404 Not Found** | Absent de Git & du conteneur Render |
| **Bird-Academy-User.exe** | `/downloads/Bird-Academy-User.exe` | Absent | **Absent** | **404 Not Found** | Absent de Git & du conteneur Render |
| **Bird-Academy-User-Windows-Setup.exe** | `/downloads/Bird-Academy-User-Windows-Setup.exe` | Absent | **Absent** | **404 Not Found** | Absent de Git & du conteneur Render |
| **Bird-Academy-User-Windows-Setup (1).exe** | Non référencé (suffixe doublon navigateur) | Absent | **Absent** | **404 Not Found** | Renommage local par le navigateur lors de retéléchargements |
| **LMSE_OWNER_GUIDE.pdf** | `/downloads/LMSE_OWNER_GUIDE.pdf` | Absent | **Présent** (racine Git) | **200 OK** | Tracké dans Git à la racine, servi avec succès |

---

## URL generated
Reconstruction exacte des requêtes émises par le frontend (`src/features/commercial-website/pages/WebDownloadCenterPage.tsx`) :

1. `https://bird-academy-public-test.onrender.com/downloads/Bird-Academy-User-Windows-Setup.exe`
2. `https://bird-academy-public-test.onrender.com/downloads/Bird-Academy-User.exe`
3. `https://bird-academy-public-test.onrender.com/downloads/Bird-Academy-User.apk`
4. `https://bird-academy-public-test.onrender.com/downloads/LMSE_OWNER_GUIDE.pdf`
5. Variante avec encodage testée : `https://bird-academy-public-test.onrender.com/downloads/Bird-Academy-User-Windows-Setup%20(1).exe`

---

## Local build
- **`dist/`** : Contient uniquement les bundles JavaScript/CSS compilés de l'application web Single Page Application (SPA). Aucun binaire `.exe` ou `.apk`, aucun répertoire `/downloads/`.
- **`dist_commercial/`** : Absent (non existant).
- **`public/`** : Contient les icônes, logos et assets statiques web. Ne contient aucun sous-dossier `downloads/`.
- **`Release/` (local)** : Contient les binaires volumineux compilés en local :
  - `Release/Release-2026-Multilingual/Bird-Academy-User.apk` (5.18 MB)
  - `Release/Release-2026-Multilingual/Bird-Academy-User.exe` (116.64 MB)
  - `Release/Bird-Academy-Avian-ERP-Setup.exe` (117.31 MB)

---

## Server configuration
- **Fichier audité** : `scripts/startTestServer.js` & `src/server/lmseServer.ts`
- **Mécanisme de routage** :
  - Le serveur Express monte la route `GET /downloads/:filename`.
  - Le middleware SPA de `scripts/startTestServer.js` (lignes 59-62) exclut explicitement `/downloads/*` de la redirection vers `index.html` :
    ```javascript
    if (req.path.startsWith('/api/') || req.path.startsWith('/downloads/')) {
      return next();
    }
    ```
  - Dans `lmseServer.ts` (lignes 664-703), la route recherche le fichier dans les répertoires candidats :
    ```typescript
    const candidates = [
      path.join(rootDir, filename),
      path.join(rootDir, 'Release', 'Release-2026-Multilingual', filename),
      path.join(rootDir, 'Release', filename),
      path.join(rootDir, 'public', 'downloads', filename),
    ];
    ```
  - Si le fichier n'existe sur le disque dans aucun de ces chemins, le serveur renvoie :
    ```json
    HTTP 404 Not Found
    {"error": "NOT_FOUND", "message": "Artefact <filename> introuvable."}
    ```
  - **Constat** : Le code serveur de gestion des téléchargements est parfaitement fonctionnel et configuré. La preuve formelle est que `/downloads/LMSE_OWNER_GUIDE.pdf` retourne bien un statut **HTTP 200 OK** avec les en-têtes corrects (`application/pdf`, `Content-Length: 428378`).

---

## Render configuration
- **Fichier audité** : `render.yaml`
- **Spécifications Render** :
  - `buildCommand: npm ci --include=dev && npm run build`
  - `startCommand: npm run serve:test`
  - Environnement : Conteneur Linux Node.js éphémère (Free Tier, 512 MB RAM, sans Wine ni SDK Android/Windows).
- **Fonctionnement du déploiement** :
  - Render effectue un `git clone` depuis GitHub (`medaymenkanzari-droid/Bird-Academy`).
  - Il exécute uniquement `npm run build` (`vite build --configLoader runner`).
  - Aucun fichier `.exe` ou `.apk` n'est compilé sur Render (les outils de packaging Windows et Android nécessitent des environnements dédiés).
  - Render ne dispose pas de volume persistant configuré (`no persistent disk`).

---

## Git / package
- **Fichier `.gitignore`** (lignes 19-28) :
  ```gitignore
  # Packaging & Release Artifacts
  /Release/
  /release*/
  *.exe
  *.msi
  *.zip
  *.7z
  *.apk
  *.aab
  *.ipa
  ```
- **Vérification `git ls-files`** :
  - `git ls-files | grep -E "\.(exe|apk)$"` : **0 résultat** (aucun binaire tracké dans Git).
  - `LMSE_OWNER_GUIDE.pdf` est tracké dans Git à la racine du projet, ce qui explique pourquoi il est présent sur Render.
- **Archive de release officielle `Bird-Academy-Enterprise-v1.3.6-RC4.zip`** :
  - SHA-256 calculé : `7296D222303649A9F60DE6E8064B52904124814BD4DC38A892528FE3B3324248` (Vérifié 100% conforme).
  - Contenu archivé : `01-APPLICATION/`, `02-DOCUMENTATION/`, `03-QA/`, `04-RELEASE-METADATA/`.
  - L'archive zip est le livrable applicatif web et documentaire de la release (7.39 MB) ; elle ne contient aucun installateur lourd Windows ou Android.

---

## Root cause
### Classification :
**B — Fichier absent du repository** (Cause Principale)  
**A — Fichier absent du build Render** (Cause Secondaire Directe)

### Explication technique complète :
1. Les fichiers d'installation (`Bird-Academy-User-Windows-Setup.exe` : 117.3 MB, `Bird-Academy-User.exe` : 116.6 MB, `Bird-Academy-User.apk` : 5.18 MB) sont ignorés par Git via `.gitignore` pour respecter les bonnes pratiques et les quotas de taille de dépôt Git (GitHub limite les fichiers à 100 Mo).
2. L'instance Render compile l'application exclusivement à partir des fichiers présents dans le dépôt Git distant via `git clone`.
3. Par conséquent, les dossiers `/Release/` et les fichiers `.exe` / `.apk` n'existent pas sur le disque du serveur Render.
4. Lors d'un clic de téléchargement sur le site web public, le navigateur effectue une requête HTTP GET vers `/downloads/Bird-Academy-User.apk` (ou `.exe`).
5. Le serveur Express sur Render inspecte son système de fichiers local, ne trouve pas l'artefact, et répond avec :
   `HTTP/1.1 404 Not Found`
   `{"error":"NOT_FOUND","message":"Artefact Bird-Academy-User... introuvable."}`
6. Le navigateur Chromium / Edge, recevant un code HTTP 404 sur un lien balisé `download`, affiche son message d'erreur utilisateur natif :
   **"Fichier non disponible sur le site"**.
7. Le nom mentionnant `(1)` (`Bird-Academy-User-Windows-Setup (1).exe`) provient du comportement normal de Windows/Chrome qui incrémente automatiquement le nom dans le dossier `Téléchargements` lorsque l'utilisateur effectue plusieurs tentatives de téléchargement consécutives.

---

## Scope
- **[X] seulement TEST & Stratégie d'hébergement des binaires** :
  - L'application web et le backend LMSE fonctionnent parfaitement sur l'environnement TEST public.
  - Le problème de téléchargement n'est pas un bug de code ou de routing frontend/backend : c'est l'absence physique des gros fichiers binaires sur le serveur web Render.
  - Pour la future mise en production (PROD), les binaires d'installation Windows et Android (dépassant 100 Mo) ne doivent pas être hébergés directement sur le serveur d'application Node.js stateless de Render, mais sur une infrastructure de distribution de fichiers statiques (CDN / Object Storage ou GitHub Releases).

---

## Recommended correction
*(Note : Audit STRICTEMENT READ-ONLY — Aucune correction appliquée lors de cette mission)*

1. **Option A (Recommandée pour PROD & CDN) : Stockage d'artefacts externe (GitHub Releases / Cloudflare R2 / AWS S3)**
   - Publier les binaires officiels signés de la release (v1.3.6-RC4) sur les **GitHub Releases** du dépôt ou sur un bucket Cloudflare R2 / S3.
   - Dans `WebDownloadService.ts` (ou via une variable d'environnement `DOWNLOAD_BASE_URL`), faire pointer les liens de téléchargement vers les URLs directes du CDN/Release (ou configurer une redirection 302 dans `lmseServer.ts` vers le bucket public).

2. **Option B (Alternative légère pour l'environnement TEST uniquement)**
   - Si les binaires doivent impérativement être servis par le serveur Render en environnement TEST :
     - Utiliser un script de pré-déploiement / build (`scripts/fetchTestBinaries.sh`) dans la commande Render pour télécharger les binaires depuis une release GitHub ou un bucket vers `public/downloads/`.
     - Ou attacher un disque Render persistant monté sur `/downloads`.

3. **Option C (Information claire en environnement TEST)**
   - Si l'environnement TEST est uniquement destiné à valider la navigation et le flux LMSE sans distribuer les installateurs réels de 117 Mo, documenter clairement dans le bandeau de test ou sur la page de téléchargement que les installeurs Windows/Android sont réservés à la production ou accessibles via les artefacts de build CI.

---

## Files modified
**NONE** (Mission exécutée en lecture seule stricte, `git status` 100% intègre).

---

## Final verdict

**AUDIT COMPLETE — CORRECTION REQUIRED**

Le diagnostic est formellement établi, prouvé par requête HTTP en direct et vérifié au niveau du code, de Git, de l'archive de release et de l'environnement Render. Les binaires d'installation Windows et Android ne sont pas présents sur le serveur Render car ils sont exclus de Git (`.gitignore`). La route serveur et le routage frontend sont quant à eux parfaitement fonctionnels.

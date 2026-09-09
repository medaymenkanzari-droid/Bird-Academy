# PRODUCTION DOWNLOADS CONFIGURATION
**Stratégie d'Hébergement et Distribution Publique des Installateurs**

**Plateforme :** Bird Academy Enterprise — Volière Manager  
**Release :** v1.3.6-RC4 (Build ID: `BA-V1.3.6-RC4`, Code: `17`)  
**Git Commit :** `8b8736380bd7580676af689f59ade38a42093095`  
**Git Tag :** `v1.3.6-RC4`  

---

## 1. Contexte & Problématique Résolue

Lors des audits précédents (`DOWNLOAD-AUDIT-001` et `FINAL-COMMERCIAL-GATE-001`), le constat suivant a été établi :
1. Les fichiers d'installation lourds Windows (`.exe` ~117 Mo) et Android (`.apk` ~5,2 Mo) sont générés localement dans `dist_binaries/` (et archivés dans `Release/`).
2. Ces fichiers sont exclus du dépôt Git via `.gitignore` pour éviter le gonflement excessif de l'historique de version et respecter le plafond de 100 Mo par fichier imposé par GitHub.
3. L'environnement de test actuel (`https://bird-academy-public-test.onrender.com`) clone exclusivement l'arbre Git pour son build stateless. Par conséquent, les requêtes vers `/downloads/*.exe` ou `/downloads/*.apk` aboutissent à une réponse HTTP `404 Not Found` côté Render.
4. Seul `LMSE_OWNER_GUIDE.pdf` (428 Ko), tracké dans Git, est servi avec succès (HTTP `200 OK`).

**Règle d'or de production :**
Il est formellement proscrit de pousser des fichiers d'installation binaires volumineux (> 100 Mo) dans l'image conteneur ou le slug de build de l'application web Render. Cela saturerait la mémoire, ralentirait drastiquement les déploiements et risquerait de provoquer des dépassements de quotas.

La distribution des gros installateurs doit être **déportée sur une infrastructure de stockage / CDN dédiée**.

---

## 2. Comparatif des Solutions de Stockage & Distribution

| Critère | Solution 1 : GitHub Releases (Recommandé) | Solution 2 : Cloudflare R2 / AWS S3 | Solution 3 : Render Web Server |
|---|---|---|---|
| **Coût** | **0,00 € (Totalement gratuit)** | Gratuit jusqu'à 10 Go, puis facturé | Inclus dans le plan, mais pénalisant |
| **Plafond par fichier** | **Jusqu'à 2 Go par asset** | Plusieurs Go | Déconseillé > 50 Mo |
| **Réseau CDN & Vitesse** | Réseau mondial Fastly / Azure CDN | Cloudflare Global Edge / CloudFront | Bande passante serveur limitée |
| **HTTPS Natif** | **Oui (Automatique, certificat GitHub)** | Oui (Certificat Cloudflare / AWS) | Oui (Certificat Render) |
| **URLs Directes Stables** | **Oui (Format prédictible et versionné)** | Oui (Nom de domaine personnalisé) | Oui (Chemin `/downloads/*`) |
| **Carte Bancaire Requise** | **NON** | Oui (requis à l'inscription R2 / AWS) | Dépend du plan Render |
| **Impact sur le Build Web** | **NUL (0 octet ajouté au repo/build)** | **NUL** | Négatif (+230 Mo dans le slug de build) |
| **Conservation & Historique** | Immuable par tag Git | Bucket persistant | Éphémère / redéployé |

### Décision d'Architecture :
La solution officielle retenue pour la distribution publique est **GitHub Releases** (adossée au dépôt officiel `medaymenkanzari-droid/Bird-Academy`). En cas de besoin ultérieur d'un domaine personnalisé dédié aux téléchargements (`downloads.bird-academy.com`), un bucket **Cloudflare R2** pourra être branché en miroir transparent.

---

## 3. Matrice Officielle des Binaires de Distribution

| Fichier | Plateforme | Rôle & Public Cible | Taille (octets) | Taille (Mo) | SHA-256 |
|---|---|---|---|---|---|
| **`Bird-Academy-User-Windows-Setup.exe`** | Windows x64 | **Installateur officiel complet** (Assistant d'installation, raccourci bureau, désinstallateur standard, intégration registre) | 117 318 317 | 111,88 Mo | `1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813` |
| **`Bird-Academy-User.exe`** | Windows x64 | **Édition Portable** (Exécution directe sans droits administrateur, compatible clé USB nomade) | 116 643 591 | 111,24 Mo | `1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92` |
| **`Bird-Academy-User.apk`** | Android | **Package autonome APK** (Installation directe Android 10+, sans dépendance obligatoire au Google Play Store) | 5 187 830 | 4,95 Mo | `8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9` |
| **`LMSE_OWNER_GUIDE.pdf`** | Documentation | **Guide d'Activation & Manuel Propriétaire** (PDF universel) | 428 378 | 0,41 Mo | `42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618` |

---

## 4. URLs de Téléchargement & Mapping Environnement

### A. Environnement TEST Public Actuel (`bird-academy-public-test.onrender.com`)
Le serveur de test actuel répond localement via son endpoint Express `/downloads/:filename` :
- `https://bird-academy-public-test.onrender.com/downloads/LMSE_OWNER_GUIDE.pdf` → **HTTP 200 OK** (servi).
- `https://bird-academy-public-test.onrender.com/downloads/Bird-Academy-User-Windows-Setup.exe` → **404** (attendu tant que les assets ne sont pas sur CDN).
- `https://bird-academy-public-test.onrender.com/downloads/Bird-Academy-User.exe` → **404** (attendu tant que les assets ne sont pas sur CDN).
- `https://bird-academy-public-test.onrender.com/downloads/Bird-Academy-User.apk` → **404** (attendu tant que les assets ne sont pas sur CDN).

### B. URLs de Production Cibles (GitHub Releases CDN)
Ces URLs directes, publiques et sécurisées en HTTPS sont générées dès l'attachement des assets à la Release GitHub `v1.3.6-RC4` :

| Binaire | URL Publique Directe (Production) | Statut Réseau |
|---|---|---|
| **Windows Setup** | `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/Bird-Academy-User-Windows-Setup.exe` | `PENDING UPLOAD` |
| **Windows Portable** | `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/Bird-Academy-User.exe` | `PENDING UPLOAD` |
| **Android APK** | `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/Bird-Academy-User.apk` | `PENDING UPLOAD` |
| **Guide PDF** | `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/LMSE_OWNER_GUIDE.pdf` | `PENDING UPLOAD` |

---

## 5. Procédure Opérationnelle de Mise à Disposition (Workflow)

Pour publier les binaires sur GitHub Releases sans toucher au code applicatif :

### Étape 1 : Vérification d'intégrité locale préalable
Avant tout envoi, vérifier l'empreinte des fichiers dans `dist_binaries/` :
```powershell
Get-FileHash -Path dist_binaries\* -Algorithm SHA256
```
Confirmer l'égalité stricte avec les sommes de contrôle du fichier `RELEASE_BINARY_MANIFEST_v1.3.6-RC4.json`.

### Étape 2 : Publication des Assets sur la Release GitHub
Via l'interface Web GitHub ou la CLI `gh` :
```bash
# Exemple via GitHub CLI :
gh release upload v1.3.6-RC4 \
  dist_binaries/Bird-Academy-User-Windows-Setup.exe \
  dist_binaries/Bird-Academy-User.exe \
  dist_binaries/Bird-Academy-User.apk \
  LMSE_OWNER_GUIDE.pdf \
  --repo medaymenkanzari-droid/Bird-Academy
```
*Alternative Web :* Se rendre sur `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/edit/v1.3.6-RC4` et glisser-déposer les fichiers présents dans `dist_binaries/`.

### Étape 3 : Validation de Disponibilité Immédiate
Tester le téléchargement direct via `curl` ou PowerShell :
```powershell
Invoke-WebRequest -Uri "https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6-RC4/Bird-Academy-User-Windows-Setup.exe" -Method Head
# Résultat attendu : HTTP 302 Found (redirection vers le CDN objects.githubusercontent.com) suivi de HTTP 200 OK.
```

---

## 6. Stratégie de Versionnement et Évolutions Futures

Pour les futures versions (`v1.3.7`, `v1.4.0`), la politique de nommage et de distribution préserve l'intégrité de l'historique :
1. **URLs Immuables par Version :**
   Les liens de la forme `.../releases/download/<tag>/<filename>` garantissent qu'un client téléchargeant une version spécifique obtient toujours le binaire certifié de cette version.
2. **Lien de Redirection de la Dernière Version (Latest) :**
   GitHub fournit automatiquement l'alias permanent :
   `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/latest/download/Bird-Academy-User-Windows-Setup.exe`
   Cet alias pointera en permanence vers le setup de la version stable la plus récente, simplifiant la maintenance des liens sans modifier le frontend.
3. **Séparation Stricte :**
   L'application Web SPA et le backend LMSE restent 100% légers et indépendants du volume des installateurs desktop.

---

## 7. Instructions pour les Utilisateurs Finaux (Contrôle d'Intégrité)

Chaque utilisateur peut vérifier l'authenticité de son fichier téléchargé grâce aux instructions fournies sur le site (`WebDownloadService.getSha256VerificationInstructions`) :

- **Sous Windows (PowerShell) :**
  ```powershell
  Get-FileHash -Path .\Bird-Academy-User-Windows-Setup.exe -Algorithm SHA256
  # Empreinte attendue : 1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813
  ```
- **Sous Linux / macOS :**
  ```bash
  sha256sum Bird-Academy-User.apk
  # Empreinte attendue : 8c2ace49fa73191ab90b26615bbdd2ce591d67d16051496fe995abc668498ac9
  ```

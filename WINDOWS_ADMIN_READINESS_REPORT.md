# BIRD ACADEMY ENTERPRISE — WINDOWS ADMIN READINESS REPORT
**Mission : ADMIN-WINDOWS-01 — Audit d'Architecture, Isolation & Préparation Build Windows Administrateur**  
**Date :** 22 Août 2026  
**Statut Global :** `READY WITH REQUIRED CHANGES`  
**Référence Validée :** User RC3.1 FIX4 (Build `1.3.6-BUG01-FIRST-LAUNCH-FIX`)

---

## 1. Executive Summary

Le présent audit a été réalisé conformément aux directives de la mission **ADMIN-WINDOWS-01**. Il a pour objectif d'évaluer la faisabilité technique, les garanties d'isolation, la sécurité cryptographique et la compatibilité Windows pour la création et la distribution de la **Version Administrateur Windows** de *Bird Academy Enterprise*, sans introduire la moindre régression sur la version **User RC3.1 FIX4** (récemment validée en conditions réelles sur Windows 11 avec les correctifs de processus BUG-WIN-03.4 / FIX4).

### Synthèse de l'Audit :
1. **Séparation Web & Moteur LMSE : DÉJÀ IMPLÉMENTÉE ET VALIDÉE.**  
   L'architecture applicative sépare déjà physiquement les points d'entrée (`index.html` / `src/main.tsx` pour l'utilisateur, `admin.html` / `src/adminMain.tsx` pour l'administrateur), les dossiers de compilation (`dist_user/` vs `dist_admin/`), et interdit tout accès aux clés privées ou aux routes d'administration depuis le bundle utilisateur (`scripts/verifyUserBundle.js` validé à 100%).
2. **Backend LMSE & Authentification : OPÉRATIONNELS.**  
   L'autorité centrale de licence (`src/server/lmseServer.ts`), les référentiels de comptes Super Admin (`AdminUserRepository.ts`), les signatures SHA-256 / Salt (`CryptoService.ts`) et les scripts de bootstrap (`scripts/bootstrapAdmin.js`) sont testés et fonctionnels.
3. **Packaging Windows & Electron : ADAPTATION REQUISE (RISQUE DE COLLISION APPDATA & NSIS).**  
   L'exécutable Electron unique actuel (`electron-main.cjs`) et la configuration `package.json` ciblent par défaut `appId: "com.birdacademy.app"` et `userData: "%APPDATA%\Bird Academy Enterprise"`. Si l'application Admin est empaquetée sans configuration dédiée, elle partagerait le même répertoire de données, les mêmes clés de registre de désinstallation et le même mutex que l'application Utilisateur.
4. **Process Lifecycle FIX4 : PORTABILITÉ DÉMONTRÉE AVEC WHITELIST DÉDIÉE.**  
   La solution PID-first FIX4 (`terminate-bird-academy-processes.ps1` + `installer.nsh`) est robuste et doit être instanciée pour l'application Admin avec sa propre liste d'exécutables (`Bird Academy Enterprise Admin.exe`) afin d'éviter toute fermeture intempestive de l'application User lors d'une installation ou mise à jour Admin.

---

## 2. Current Architecture

Le projet est structuré selon un modèle d'architecture découplée au sein d'un monorepo TypeScript / React 19 / Vite 6 / TailwindCSS 4 / Electron 43 :

```
                                  ┌──────────────────────────────────────────────────┐
                                  │            AUTORITÉ CENTRALE LMSE                │
                                  │             src/server/lmseServer.ts             │
                                  │       (Signature SHA-256, RBAC, Sessions)        │
                                  └─────────────────────────┬────────────────────────┘
                                                            │
                                  ┌─────────────────────────┴────────────────────────┐
                                  ▼                                                  ▼
                 ┌──────────────────────────────────┐               ┌──────────────────────────────────┐
                 │     APPLICATION UTILISATEUR      │               │     APPLICATION ADMINISTRATEUR   │
                 │      (Bird Academy Enterprise)   │               │     (Bird Academy Admin Center)  │
                 ├──────────────────────────────────┤               ├──────────────────────────────────┤
                 │ • Point d'entrée : index.html    │               │ • Point d'entrée : admin.html    │
                 │ • Racine React : src/main.tsx    │               │ • Racine React : src/adminMain   │
                 │ • App : src/App.tsx              │               │ • App : src/AdminApp.tsx         │
                 │ • Build : dist_user/             │               │ • Build : dist_admin/            │
                 │ • Runtime : Mode 100% Offline    │               │ • Runtime : Console Back-Office  │
                 │ • LMSE : Validation seule        │               │ • LMSE : Création & Révocation   │
                 │ • Clé Privée : AUCUNE (0%)       │               │ • Clé Privée : Protégée Serveur  │
                 │ • Données : Cages/Oiseaux/Santé  │               │ • Données : Comptes/Orgs/Licences│
                 └──────────────────────────────────┘               └──────────────────────────────────┘
```

---

## 3. User / Admin Separation

La séparation repose sur un dispositif étanche multi-couches :

| Couche d'Isolation | Mécanisme Utilisateur (`user`) | Mécanisme Administrateur (`admin`) | Statut d'Isolation |
|---|---|---|---|
| **Point d'entrée HTML** | `index.html` (charge `/src/main.tsx`) | `admin.html` (charge `/src/adminMain.tsx`) | **Strictement Séparé** |
| **Point d'entrée React** | `src/App.tsx` (0 import admin) | `src/AdminApp.tsx` (Conteneur console Admin) | **Strictement Séparé** |
| **Profil de Build Vite** | `npm run build:user` (`outDir: dist_user`) | `npm run build:admin` (`outDir: dist_admin`) | **Strictement Séparé** |
| **Garde de Contexte** | `isUserBuild() === true` | `isAdminBuild() === true` | **Strictement Séparé** |
| **Garde Runtime** | `assertAdminContext()` -> Lève `SECURITY_ERROR` | `assertAdminContext()` -> Autorisé si rôle valide | **Strictement Séparé** |
| **Contrôle RBAC** | Rôles métier : `breeder`, `vet`, `beta_tester` | Rôles admin : `super_admin`, `admin`, `support` | **Strictement Séparé** |
| **Clé Privée de Signature** | `CryptoService.getMasterSalt()` -> Lève `SECURITY_ERROR` | Accessible uniquement en contexte serveur / Admin | **Strictement Séparé** |
| **Validation du Bundle** | `scripts/verifyUserBundle.js` (Scan 0 fuite admin) | Audit des chunks admin (`dist_admin/`) | **Validé (PASS)** |

---

## 4. Admin Components Detected

L'audit approfondi du code source a identifié les composants administratifs réels suivants :

### A. Composants d'Interface d'Administration (`src/features/administration/components/`)
1. `AdminCenterView.tsx` : Conteneur principal à onglets pour l'ensemble des modules d'administration.
2. `AdminExecutiveDashboard.tsx` : Tableau de bord exécutif avec indicateurs clés (utilisateurs, licences actives, organisations, santé système) et journal d'audit filtrable.
3. `AdminUserDirectory.tsx` : Répertoire de gestion des utilisateurs, assignation des rôles RBAC, suspension et activation des comptes.
4. `AdminOrganizations.tsx` : Gestion des clubs, fédérations et structures associatives partenaires.
5. `AdminBiologicalRegistry.tsx` : Référentiel taxonomique et catalogue de certification des mutations génétiques.
6. `AdminSecurityQa.tsx` : Console de surveillance de sécurité, statut de chiffrement et matrice des suites de tests QA.
7. `AdminSupportReporting.tsx` : Gestionnaire de tickets de support et d'assistance aux éleveurs.
8. `AdminGlobalSettings.tsx` : Paramètres globaux (langue par défaut, fréquence de sauvegarde, configuration endpoints).
9. `AdminLmseCenter.tsx` : Intégration du centre de gestion des licences dans la console d'administration.

### B. Composants de Licensing Administrateur (`src/features/licensing/components/`)
1. `LicenseAdminCenter.tsx` : Console officielle LMSE permettant la génération de clés, l'export de fichiers `.lmse`, la génération de QR codes d'activation hors-ligne et l'export de fiches testeurs en Markdown.
2. `LicenseCreationModal.tsx` : Boîte de dialogue de paramétrage de licence (type, titulaire, durée, quotas d'appareils, fonctionnalités).

### C. Services & Stores Métier Administrateur (`src/features/administration/services/`)
1. `AdminAuditService.ts` : Moteur de journalisation persistante des actions administratives (`localStorage` / audit log).
2. `AdminUserStore.ts` : Gestionnaire de profils administrateurs locaux.
3. `AdminOrgStore.ts` : Gestionnaire des organisations partenaires.
4. `SupportTicketStore.ts` : Gestionnaire de tickets de support client.

### D. Moteur Backend & Authentification (`src/server/`)
1. `lmseServer.ts` : Serveur API Express autonome (`/api/admin/*` et `/api/license/*`).
2. `AdminUserRepository.ts` : Repository persistant (`data/admin-users.json`) avec hachage scrypt et sel cryptographique.
3. `adminAuth.ts` : Gestionnaire de sessions avec jetons préfixés `lmse_adm_`, expiration et vérification RBAC.
4. `rateLimiter.ts` : Protection anti-brute force sur les endpoints de connexion (5 requêtes/min).
5. `passwordCrypto.ts` : Utilitaire de hachage de mot de passe sécurisé.

---

## 5. Licensing Analysis (LMSE)

Le moteur LMSE (`src/features/licensing/engines/`) est structuré pour fonctionner de manière asymétrique entre l'Autorité (Admin) et le Client (User) :

```
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 ADMIN / SERVEUR LMSE                        │
                  │  • LicenseGenerator.generateLicense()                       │
                  │  • CryptoService.generateSignature() [Clé Privée / Salt]    │
                  │  • OfflineActivationEngine.generateActivationCode()         │
                  │  • OfflineBetaExporter.exportLicenseJson()                  │
                  └──────────────────────────────┬──────────────────────────────┘
                                                 │ Clé formatée (LMSE-TYPE-S1-S2-S3)
                                                 │ Fichier signé (.lmse)
                                                 │ QR Code Payload
                                                 ▼
                  ┌─────────────────────────────────────────────────────────────┐
                  │                 USER CLIENT (BIRD ACADEMY)                  │
                  │  • LicenseValidator.validateLicense()                       │
                  │  • CryptoService.verifySignature() [Clé Publique]           │
                  │  • OfflineBetaValidator.validateFile()                      │
                  │  • QrCodeScannerModal (Lecture optique caméra)              │
                  │  • DeviceFingerprintEngine (Hardware binding)               │
                  │  • IntegrityVerificationEngine (Anti-Rollback Horloge)      │
                  └─────────────────────────────────────────────────────────────┘
```

### Constat d'Audit :
- **Génération & Signature :** Strictement protégées par `assertAdminContext()` et `getMasterSalt()`.
- **Validation Client :** 100% autonome et sécurisée sans accès à la clé privée.
- **Support Hors-Ligne :** Trois modes opérationnels (clé texte, fichier importé `.lmse`, scan QR Code).
- **Règle absolue :** Les moteurs de licence dans `src/features/licensing/engines/` sont stabilisés et protégés. Aucune modification de leur logique interne n'est requise.

---

## 6. Windows Data Paths

L'audit des chemins de données révèle une distinction critique à formaliser pour éviter toute collision entre les installations User et Admin sur un même poste Windows :

| Élément | Chemin Actuel User (RC3.1 FIX4) | Chemin Actuel Admin (Code Source Actuel) | Statut & Recommandation |
|---|---|---|---|
| **Identifiant Produit** | `Bird Academy Enterprise` | `Bird Academy Enterprise` *(hardcodé dans electron-main.cjs)* | ⚠️ **COLLISION DÉTECTÉE** -> Isoler Admin en `Bird Academy Enterprise Admin` |
| **UserData (`%APPDATA%`)** | `%APPDATA%\Bird Academy Enterprise` | `%APPDATA%\Bird Academy Enterprise` *(identique)* | ⚠️ **COLLISION DÉTECTÉE** -> Isoler Admin en `%APPDATA%\Bird Academy Admin` |
| **Local Storage** | `%APPDATA%\Bird Academy Enterprise\Local Storage` | Partagé si non séparé | ⚠️ **RISQUE D'ÉCRASEMENT** -> Séparation obligatoire |
| **Install Directory** | `%LOCALAPPDATA%\Programs\Bird Academy Enterprise` | `%LOCALAPPDATA%\Programs\Bird Academy Enterprise` | ⚠️ **RISQUE D'ÉCRASEMENT** -> Isoler en `Programs\Bird Academy Enterprise Admin` |
| **Clé de Désinstallation Registre** | `HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\d7f58838...` | Identique si même `appId` | ⚠️ **RISQUE DE CONFLIT REGISTRE** -> Définir un `appId` distinct (`com.birdacademy.admin`) |
| **Données Serveur LMSE** | N/A (Client User) | `./data/licenses.json`, `./data/admin-users.json` | Sécuriser l'emplacement persistant en mode Desktop Admin |

---

## 7. Electron Configuration

### État Actuel dans le Code (`electron-main.cjs` & `package.json`) :
1. `package.json` :
   - `appId` : `"com.birdacademy.app"`
   - `productName` : `"Bird Academy Enterprise"`
   - `directories.output` : `"release-electron"`
   - `files` : `["dist/**/*", "electron-main.cjs"]`
   - `nsis.include` : `"packaging/installer.nsh"`
2. `electron-main.cjs` :
   - Détecte dynamiquement si `dist/admin.html` existe pour modifier le titre de fenêtre ("Bird Academy Admin Center") et charger `admin.html`.
   - **Goulot d'étranglement identifié :** La configuration `APP_CANONICAL_NAME = 'Bird Academy Enterprise'` et l'appel `app.setPath('userData', targetUserDataPath)` s'exécutent **avant** la détection du mode Admin, assignant systématiquement le dossier utilisateur à l'Admin.

### Configuration Cible Recommandée :
- **Application User :**
  - `appId` : `com.birdacademy.app`
  - `productName` : `Bird Academy Enterprise`
  - `executableName` : `Bird Academy Enterprise.exe`
  - `userData` : `%APPDATA%\Bird Academy Enterprise`
- **Application Admin :**
  - `appId` : `com.birdacademy.admin`
  - `productName` : `Bird Academy Enterprise Admin`
  - `executableName` : `Bird Academy Enterprise Admin.exe`
  - `userData` : `%APPDATA%\Bird Academy Admin`

---

## 8. Existing Build Pipeline

L'analyse des scripts dans `package.json` et `scripts/` montre une infrastructure solide qui nécessite simplement d'être complétée :

### Scripts Existants :
- `npm run build:user` : Compile le frontend utilisateur vers `dist/` et `dist_user/`.
- `npm run verify:user-bundle` : Vérifie l'absence absolue de code admin dans `dist_user/`.
- `npm run build:admin` : Compile le frontend administrateur vers `dist/` et `dist_admin/`.
- `npm run admin:bootstrap` : Initialise le compte Super Admin via terminal sécurisé.
- `npm run admin:serve` : Lance le serveur de production local Admin sur le port 3001.
- `npm run package:windows:rc3.1:fix4` : Package l'exécutable User RC3.1 FIX4 vers `Release/Windows-RC3.1/`.

### Nouveaux Scripts Recommandés (Cohérents avec la nomenclature existante) :
- `npm run verify:admin-bundle` : Vérifie l'intégrité du bundle Admin (`dist_admin/`) et la présence de `admin.html`.
- `npm run package:windows:admin` : Construit et empaquète l'installateur Windows Admin (`Release/Windows-Admin/`).

---

## 9. Existing NSIS Configuration

Le fichier `packaging/installer.nsh` implémente actuellement la solution FIX4 validée :
- Macro `WriteTerminateScript` génère dynamiquement `$PLUGINSDIR\terminate.ps1`.
- Macro `RunPIDFirstTermination` exécute PowerShell en ligne courte (< 150 caractères, zéro dépassement de buffer 1024 octets).
- Macro `CloseAllBirdAcademyInstances` applique le nettoyage multi-couches.
- Hooks NSIS branchés : `customInit`, `customCheckAppRunning`, `customUnInstallCheck`, `customUnInit`, `customUnInstall`.
- Protection des données : `deleteAppDataOnUninstall: false`.

---

## 10. FIX4 Compatibility Analysis

La logique PID-First FIX4 est **100% transposable et réutilisable** pour l'application Admin, sous réserve d'une adaptation indispensable : **L'isolation des processus ciblés.**

### Problématique :
Si l'installateur Admin utilisait tel quel `packaging/installer.nsh`, son hook `terminate.ps1` fermerait de force l'application `Bird Academy Enterprise.exe` (User) lors de l'installation de l'Admin.

### Solution Conforme :
Créer une variante dédiée de hook d'installation pour Admin (`packaging/installer-admin.nsh` ou paramétrage conditionnel) qui cible exclusivement :
- `Bird Academy Enterprise Admin.exe`
- `Bird Academy Admin.exe`
- `Bird-Academy-Admin-Windows.exe`
- Processus descendants liés au dossier `Programs\Bird Academy Enterprise Admin` ou `Programs\Bird Academy Admin`.

---

## 11. First Launch Analysis

Le comportement au premier démarrage de l'application Admin se distingue radicalement de l'application User :

| Caractéristique | First Launch User (VALIDÉ) | First Launch Admin (Attendu) |
|---|---|---|
| **Écran Initial** | `FirstLaunchActivationScreen` (si aucune licence) | Écran de Connexion Administrateur (`AdminApp.tsx`) |
| **Pré-requis Initial** | Saisie ou scan d'une clé de licence | Compte Super Admin initialisé (`npm run admin:bootstrap`) |
| **Assistant de Configuration** | `WelcomeWizard` (Volière, Cage fondatrice, Oiseau fondateur) | **Aucun Wizard Élevage** (Accès direct au Dashboard Admin) |
| **Persistance de Session** | `bird_academy_lmse_active_license` dans `localStorage` | `lmse_admin_session` (Jeton avec expiration) dans `localStorage` |
| **Données Métier** | Initialisation à 0 oiseaux / 0 cages / 0 couples | Initialisation à 0 organisations / 0 tickets / Registre C.O.M. pré-chargé |

---

## 12. Security Audit

L'audit de sécurité a évalué les 12 risques critiques formulés dans le cahier des charges :

| ID Risque | Risque Audité | Sévérité Initiale | Constat dans le Code Source | Sévérité Résiduelle | Recommandation |
|---|---|---|---|---|---|
| **SEC-01** | Accès Admin depuis l'application User | CRITICAL | Bloqué par l'absence d'imports dans `App.tsx` et gardes `assertAdminContext()` | **LOW (Résolu)** | Conserver les gardes actifs |
| **SEC-02** | Exposition de code Admin dans le bundle User | HIGH | Bloqué par `npm run build:user` (`dist_user/`) et vérifié par `verifyUserBundle.js` | **LOW (Résolu)** | Maintenir le contrôle automatisé dans le pipeline |
| **SEC-03** | IPC Electron non protégé | HIGH | `nodeIntegration: false`, `contextIsolation: true`, `webSecurity: true` actifs | **LOW (Résolu)** | Maintenir l'isolation contextuelle Electron |
| **SEC-04** | Preload Electron trop permissif | MEDIUM | Aucun preload vulnérable n'expose de primitives Node non sécurisées | **LOW (Résolu)** | Conserver l'absence de preload invasif |
| **SEC-05** | Chemins filesystem accessibles depuis le client | HIGH | Le renderer n'a aucun accès direct aux APIs Node `fs` | **LOW (Résolu)** | Maintenir la frontière renderer/main |
| **SEC-06** | Modification / falsification de licence | CRITICAL | Protégé par signature SHA-256 + Sel, Checksum et marqueur anti-rollback temporel | **LOW (Résolu)** | Moteurs LMSE intègres et protégés |
| **SEC-07** | Élévation de privilèges via `localStorage` | HIGH | La modification du `user_role` dans le client User ne débloque aucun code admin | **LOW (Résolu)** | Contrôle serveur strict sur chaque endpoint |
| **SEC-08** | Variables d'environnement fuyant dans le bundle | MEDIUM | `VITE_APP_MODE` et `VITE_LMSE_ENV` sont gérés à la compilation sans secrets | **LOW (Résolu)** | Valider avec `validateLmseBuildConfig.js` |
| **SEC-09** | Secrets de signature embarqués côté client | CRITICAL | `LMSE_PRIVATE_SIGNING_KEY` lève une exception immédiate si appelée en mode User | **LOW (Résolu)** | Conserver la séparation serveur / client |
| **SEC-10** | Routes cachées accessibles directement | HIGH | Aucune route admin n'est enregistrée dans le routeur de `App.tsx` | **LOW (Résolu)** | Maintenir l'étanchéité des routes |
| **SEC-11** | Dépendances Admin importées inutilement dans User | MEDIUM | Seuls les utilitaires partagés (`translations`, `speciesRegistry`) sont importés | **LOW (Résolu)** | Audité et conforme |
| **SEC-12** | Collision des répertoires AppData User et Admin | HIGH | `electron-main.cjs` utilise le même `APP_CANONICAL_NAME` pour User et Admin | **HIGH (Action Requise)** | **Séparer `userData` dans Electron selon le mode User / Admin** |

---

## 13. Required Changes

Pour rendre la version Administrateur Windows totalement opérationnelle, autonome et isolée :

1. **Différenciation de l'identité Electron :**  
   Permettre à `electron-main.cjs` d'identifier son mode d'exécution au démarrage (`user` vs `admin`) pour configurer :
   - `app.name` : `'Bird Academy Enterprise Admin'` (en mode Admin) vs `'Bird Academy Enterprise'` (en mode User).
   - `userData` : `%APPDATA%\Bird Academy Admin` (Admin) vs `%APPDATA%\Bird Academy Enterprise` (User).
2. **Script de Packaging Dédié Admin :**  
   Créer `scripts/packageWindowsAdmin.js` et configurer l'empaquetage Electron Builder pour l'Admin avec :
   - `appId: "com.birdacademy.admin"`
   - `productName: "Bird Academy Enterprise Admin"`
   - `directories.output: "release-admin"`
3. **Hook NSIS Dédié Admin :**  
   Créer `packaging/installer-admin.nsh` appliquant la logique FIX4 exclusivement aux exécutables et dossiers Admin.
4. **Script d'Audit Bundle Admin :**  
   Créer `scripts/verifyAdminBundle.js` pour s'assurer que `dist_admin/admin.html` et les composants de gestion sont présents et intègres.
5. **Suite de Tests Automatisés Admin Windows :**  
   Créer `tests/windows-admin-release.test.ts` pour couvrir l'ensemble des scénarios d'isolation, d'installation et de non-régression.

---

## 14. Files To Modify

*(Note : Aucune modification n'a été effectuée pendant cet audit. Cette liste définit les fichiers concernés pour la phase d'implémentation ultérieure).*

1. `electron-main.cjs` : Adapter la sélection de `APP_CANONICAL_NAME` et `app.setPath('userData')` pour distinguer le mode Admin du mode User.
2. `package.json` : Ajouter les scripts `verify:admin-bundle`, `package:windows:admin` et `test:admin-windows`.

---

## 15. Files To Create

1. `scripts/verifyAdminBundle.js` : Script de contrôle statique du bundle de compilation Admin.
2. `scripts/packageWindowsAdmin.js` : Pipeline d'empaquetage Windows NSIS / Portable Admin avec génération de hash SHA-256.
3. `packaging/installer-admin.nsh` : Hook NSIS FIX4 dédié à l'exécutable Admin.
4. `scripts/windows/terminate-bird-academy-admin-processes.ps1` : Script PowerShell de fermeture propre des processus Admin.
5. `scripts/windows/reset-admin-qa.ps1` : Script de réinitialisation sécurisée de l'environnement de test Admin (`%APPDATA%\Bird Academy Admin`).
6. `tests/windows-admin-release.test.ts` : Suite de tests automatisés validant la conformité Windows Admin.

---

## 16. Files Protected / Must Not Modify

Les fichiers suivants constituent le cœur validé de la version User RC3.1 FIX4 et **ne doivent en aucun cas être modifiés** :

- `src/App.tsx` (Application principale User validée)
- `src/main.tsx` & `index.html` (Points d'entrée User)
- `src/components/*` (Tous les modules métier d'élevage : `Dashboard`, `Canaris`, `Couples`, `Reproduction`, `Sante`, `Alimentation`, `Cages`)
- `src/business/*` (`BirdEngine.ts`, `HabitatEngine.ts`, `BreedingEngine.ts`, `HealthEngine.ts`, `FinanceEngine.ts`, etc.)
- `src/features/licensing/engines/*` (Tous les moteurs cryptographiques LMSE validés)
- `scripts/packageWindowsRC3_1_Fix4.js` (Script de release User RC3.1 FIX4)
- `packaging/installer.nsh` (Hook NSIS FIX4 User validé)
- `scripts/windows/terminate-bird-academy-processes.ps1` (Script PowerShell User FIX4 validé)
- `tests/windows-bug03-4-installer-process-real.test.ts` & `tests/windows-first-launch-qa.test.ts` (Suites de tests de référence User)

---

## 17. Test Strategy

Une suite de tests dédiée (`ADMIN-WIN-01` à `ADMIN-WIN-20`) sera implémentée dans `tests/windows-admin-release.test.ts` :

| ID Test | Objectif du Test | Type de Validation |
|---|---|---|
| **ADMIN-WIN-01** | Vérification de la présence de `dist_admin/admin.html` après `build:admin` | Compilation & Fichiers |
| **ADMIN-WIN-02** | Absence de `index.html` ou de routes utilisateur dans le bundle Admin autonome | Isolation Frontend |
| **ADMIN-WIN-03** | Vérification de l'`appId` distinct (`com.birdacademy.admin`) pour Windows | Configuration Electron |
| **ADMIN-WIN-04** | Vérification de l'isolation du chemin `userData` (`%APPDATA%\Bird Academy Admin`) | Persistance Données |
| **ADMIN-WIN-05** | Protection des données User : aucune écriture dans `%APPDATA%\Bird Academy Enterprise` | Non-Régression User |
| **ADMIN-WIN-06** | Authentification Super Admin : connexion réussie avec mot de passe valide | Sécurité & Auth |
| **ADMIN-WIN-07** | Rejet des connexions avec mauvais mot de passe (401 Unauthorized) | Sécurité & Auth |
| **ADMIN-WIN-08** | Création de licence LMSE : génération de clé signée avec master salt | Moteur LMSE Admin |
| **ADMIN-WIN-09** | Révocation de licence LMSE : mise à jour de la liste de révocation | Moteur LMSE Admin |
| **ADMIN-WIN-10** | Export fichier `.lmse` : payload JSON signé conforme pour validation hors-ligne | Interopérabilité |
| **ADMIN-WIN-11** | Export QR Code : payload chaîne formatée compatible avec scanner User | Interopérabilité |
| **ADMIN-WIN-12** | Hook NSIS Admin FIX4 : présence de la terminaison PID-first des processus Admin | Process Lifecycle |
| **ADMIN-WIN-13** | NSIS Admin n'arrête pas les processus User (`Bird Academy Enterprise.exe`) | Coexistence |
| **ADMIN-WIN-14** | NSIS User n'arrête pas les processus Admin (`Bird Academy Enterprise Admin.exe`) | Coexistence |
| **ADMIN-WIN-15** | Désinstallation Admin préserve les licences créées (`deleteAppDataOnUninstall: false`) | Préservation Données |
| **ADMIN-WIN-16** | Démarrage propre en Clean Install (aucun bug de process résiduel) | Cycle de Vie |
| **ADMIN-WIN-17** | Mise à jour Admin (Upgrade) : conservation de la session et des comptes administrateurs | Cycle de Vie |
| **ADMIN-WIN-18** | Coexistence simultanée des deux applications sur la même machine | Stabilité Système |
| **ADMIN-WIN-19** | Audit log : traçabilité de toutes les actions administratives exécutées | Conformité & Audit |
| **ADMIN-WIN-20** | Non-régression totale : exécution avec succès des 66 tests User de référence | Contrôle Qualité |

---

## 18. Build Strategy

Le pipeline de compilation Administrateur suivra le flux standardisé :

```bash
# 1. Compilation du bundle Web Admin
npm run build:admin

# 2. Vérification statique de l'intégrité du bundle Admin
npm run verify:admin-bundle

# 3. Empaquetage de l'exécutable Windows Admin avec electron-builder
npm run package:windows:admin
```

---

## 19. Packaging Strategy

L'empaquetage utilisera `electron-builder` avec des paramètres surchargés pour isoler l'identité Windows :

- **Product Name :** `Bird Academy Enterprise Admin`
- **App ID :** `com.birdacademy.admin`
- **Executable Name :** `Bird Academy Enterprise Admin.exe`
- **Output Directory :** `release-admin/`
- **Destination Finale :** `Release/Windows-Admin/`
- **Fichiers Générés :**
  - `Bird-Academy-Admin-Windows-Setup.exe` (Installateur NSIS)
  - `Bird-Academy-Admin-Windows.exe` (Version Portable autonome)
  - `SHA256SUMS.txt` (Empreintes cryptographiques d'intégrité)

---

## 20. Clean Install Scenario (Scénario A)

1. Poste Windows vierge (aucune installation préalable).
2. Exécution de `Bird-Academy-Admin-Windows-Setup.exe`.
3. L'installateur NSIS extrait les fichiers dans `%LOCALAPPDATA%\Programs\Bird Academy Enterprise Admin`.
4. Création des raccourcis Bureau et Menu Démarrer : "Bird Academy Enterprise Admin".
5. Lancement de l'application.
6. `electron-main.cjs` initialise `%APPDATA%\Bird Academy Admin`.
7. Si premier démarrage : notification de création du compte Super Admin (`npm run admin:bootstrap`).
8. Authentification Super Admin -> Accès complet à la console de gestion.

---

## 21. Upgrade Scenario (Scénario B)

1. Version Admin v1.0 déjà installée avec comptes créés et licences émises.
2. Exécution du nouvel installateur Admin v1.1.
3. Le hook NSIS FIX4 Admin détecte et ferme proprement les anciens processus `Bird Academy Enterprise Admin.exe` sans bloquer l'installateur.
4. Remplacement des binaires dans `%LOCALAPPDATA%\Programs\Bird Academy Enterprise Admin`.
5. Le dossier `%APPDATA%\Bird Academy Admin` reste **100% intact** (`deleteAppDataOnUninstall: false`).
6. Lancement de la nouvelle version : les comptes, sessions et historiques sont immédiatement reconnus.

---

## 22. User / Admin Coexistence Scenario (Scénarios C, D, E)

### Scénario C — Coexistence Simultanée :
- `Bird Academy Enterprise` (User) et `Bird Academy Enterprise Admin` (Admin) sont tous deux installés sur la même machine Windows.
- Les deux applications peuvent s'exécuter en même temps sans conflit grâce à :
  - Deux mutex `requestSingleInstanceLock` distincts.
  - Deux répertoires `userData` étanches (`%APPDATA%\Bird Academy Enterprise` vs `%APPDATA%\Bird Academy Admin`).
  - Deux clés de désinstallation dans le Registre Windows.

### Scénario D — Mise à Jour User après installation Admin :
- L'installateur User RC3.1 FIX4 ne cible et ne ferme que les processus User. L'application Admin reste intacte et ses données ne sont pas modifiées.

### Scénario E — Mise à Jour Admin après installation User :
- L'installateur Admin FIX4 ne cible et ne ferme que les processus Admin. L'application User, ses oiseaux, cages, couples et licences restent strictement intègres.

---

## 23. Rollback Strategy

En cas d'anomalie détectée lors des tests du build Admin :
1. Les fichiers User RC3.1 FIX4 étant strictement protégés dans `Release/Windows-RC3.1/`, aucune action de restauration User n'est nécessaire.
2. L'environnement Admin peut être totalement remis à zéro via le script `scripts/windows/reset-admin-qa.ps1`.
3. Le dossier de release temporaire `release-admin/` peut être supprimé sans aucun impact sur le projet principal.

---

## 24. Risk Matrix

| Risque Identifié | Probabilité | Impact | Mitigation Validée |
|---|---|---|---|
| Collision des dossiers de données `%APPDATA%` | Élevée (sans changement) | Critique | Surcharger `APP_CANONICAL_NAME` et `userData` dans Electron pour le mode Admin. |
| Fermeture accidentelle de l'application User par l'installateur Admin | Moyenne | Élevé | Créer `installer-admin.nsh` avec une whitelist d'images strictement limitée à l'Admin. |
| Fuite de clé privée de signature vers le bundle User | Nulle | Critique | Garde `CryptoService.getMasterSalt()` + validation `verifyUserBundle.js` (0 fuite). |
| Conflit de registre de désinstallation Windows | Élevée (sans changement) | Modéré | Définir un `appId` unique `com.birdacademy.admin`. |
| Régression sur le WelcomeWizard ou First Launch User | Nulle | Critique | Fichiers User strictement protégés et vérifiés par les 66 tests automatisés. |

---

## 25. Acceptance Criteria

Pour déclarer la version Windows Administrateur officiellement prête et validée :

- [x] Audit complet d'architecture réalisé sans modification prématurée du code.
- [ ] `npm run build:admin` s'exécute sans erreur et produit `dist_admin/admin.html`.
- [ ] `npm run verify:admin-bundle` valide la conformité du bundle Admin.
- [ ] `npm run package:windows:admin` génère l'installateur et le portable avec leurs checksums SHA-256.
- [ ] L'application Admin s'installe et s'exécute dans `%APPDATA%\Bird Academy Admin`.
- [ ] L'application User RC3.1 FIX4 fonctionne sans aucune altération de ses données ou licences.
- [ ] Les deux applications coexistent parfaitement sur la même session Windows.
- [ ] Tous les tests de la suite `tests/windows-admin-release.test.ts` (ADMIN-WIN-01 à ADMIN-WIN-20) passent à 100%.

---

## 26. Recommended Implementation Plan

Pour la mission d'implémentation suivante :

1. **Phase 1 — Configuration Electron & Scripts :**
   - Mettre à jour `electron-main.cjs` pour isoler `app.name` et `userData` en mode Admin.
   - Créer `scripts/verifyAdminBundle.js`.
   - Créer `scripts/packageWindowsAdmin.js`.
2. **Phase 2 — Packaging & Hooks NSIS FIX4 :**
   - Créer `packaging/installer-admin.nsh` et le script PowerShell associé.
   - Configurer les raccourcis et métadonnées d'installation.
3. **Phase 3 — Suite de Tests & Validation Automatisée :**
   - Créer `tests/windows-admin-release.test.ts`.
   - Exécuter la suite complète (Tests User + Tests Admin).
4. **Phase 4 — Compilation & Certification Finale :**
   - Générer les binaires finaux dans `Release/Windows-Admin/`.
   - Rédiger le rapport de certification finale.

---

## 27. Final Readiness Status

### **READY WITH REQUIRED CHANGES**

**Justification Technique :**  
L'architecture de séparation physique, les composants frontend d'administration, les pages de gestion, le serveur backend LMSE et les moteurs cryptographiques sont d'ores et déjà développés, testés et opérationnels.  
La version Administrateur Windows est techniquement prête à être construite dès l'application des ajustements mineurs et ciblés d'isolation Electron / NSIS détaillés dans ce rapport, **sans aucun risque d'altération ou de régression sur la version User RC3.1 FIX4 de référence.**

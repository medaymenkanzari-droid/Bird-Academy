# BIRD ACADEMY ENTERPRISE — RAPPORT DE BUILD WINDOWS RC3.1
## Correction BUG-WIN-03 : Gestion Définitive du Cycle de Vie des Données Windows

**Date de compilation :** 20 août 2026  
**Version de l'application :** 1.3.6-BUG01-FIRST-LAUNCH-FIX (Release Candidate 3.1)  
**Cible :** Windows Desktop (x64)  
**Document ID :** `WINDOWS_RC3.1_BUILD_REPORT`  
**Statut Global :** `BUILD SUCCESS`

---

## 1. Environnement & Runtimes

| Composant | Version | Statut |
| :--- | :--- | :--- |
| **Système d'exploitation** | Windows 11 Pro x64 (Build 26200) | **OPÉRATIONNEL** |
| **Node.js** | `v24.19.0` | **OPÉRATIONNEL** |
| **npm** | `11.17.0` | **OPÉRATIONNEL** |
| **npx** | `11.17.0` | **OPÉRATIONNEL** |
| **PowerShell Execution Policy** | `RemoteSigned` (CurrentUser) | **CONFIGURÉ** |

---

## 2. Validation de la Qualité & Tests

| Étape de vérification | Commande | Résultat | Détails |
| :--- | :--- | :---: | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 erreur de typage |
| **Tests Cycle de Vie BUG-WIN-03** | `node --import tsx --test tests/windows-bug03-data-lifecycle.test.ts` | **PASS** | 20 / 20 tests réussis (100%) |
| **Tests Globaux de Non-Régression** | `npm test` | **PASS** | 566 / 566 tests réussis (100%) |
| **Build Web Utilisateur** | `npm run build:user` | **PASS** | Bundle dist/ et dist_user/ généré (2877 modules) |
| **Audit Sécurité & Isolation Bundle** | `npm run verify:user-bundle` | **PASS** | 0 fuite administrative, isolation stricte |

---

## 3. Binaires Générés (Windows RC3.1)

Les exécutables ont été empaquetés avec `electron-builder` et placés dans `Release/Windows-RC3.1/` :

| Binaire | Généré | Taille (octets) | Taille (MB) | Somme de contrôle SHA-256 |
| :--- | :---: | :---: | :---: | :--- |
| **`Bird-Academy-User-Windows-RC3.1-Setup.exe`** (Installateur NSIS) | **OUI** | `115 835 483` | 110.47 MB | `9EAC5AA804C9D293E8DB1E882FDF5146A570741F2770017004FC6C449033C908` |
| **`Bird-Academy-User-Windows-RC3.1.exe`** (Portable Autonome) | **OUI** | `115 667 589` | 110.31 MB | `F1A74F69CF26F1792C7F713AE717C9E25F532909DAEF3C45F4FDAB35118B3318` |

### Emplacements absolus des fichiers :
- **Setup :** `D:\app canaris\28+\Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1-Setup.exe`
- **Portable :** `D:\app canaris\28+\Release\Windows-RC3.1\Bird-Academy-User-Windows-RC3.1.exe`
- **Checksums :** `D:\app canaris\28+\Release\Windows-RC3.1\SHA256SUMS.txt`

---

## 4. Modifications Effectuées

1. **`electron-main.cjs`** :
   - Définition explicite du nom canonique : `app.name = 'Bird Academy Enterprise'`.
   - Définition du chemin `userData` standard : `%APPDATA%\Bird Academy Enterprise`.
   - Implémentation d'une migration automatique non destructive et synchrone depuis les dossiers legacy (`%APPDATA%\react-example` et `%APPDATA%\Bird Academy`) vers `%APPDATA%\Bird Academy Enterprise`.
   - Conservation du profil legacy comme sauvegarde de sécurité.
2. **`scripts/reset-windows-user-qa.ps1`** :
   - Script PowerShell de réinitialisation usine QA fermant les processus actifs et purgeant les profils utilisateur sans altérer aucun fichier de code ni dépendances.
3. **`scripts/packageWindowsRC3_1.js`** :
   - Script de packaging automatisé pour RC3.1 avec calcul des empreintes SHA-256.
4. **`package.json`** :
   - Ajout des scripts `"qa:reset-windows-user"`, `"package:windows:rc3.1"`, `"test:data-lifecycle"`.
   - Intégration de la suite BUG-WIN-03 dans `"test"`.
5. **`tests/windows-bug03-data-lifecycle.test.ts`** :
   - 20 tests unitaires et d'intégration validant les 3 scénarios (Upgrade, Clean Install, Factory Reset QA).
6. **`WINDOWS_DATA_LIFECYCLE_QA.md`** :
   - Protocole complet de validation QA pour Windows 11.

---

## 5. Fichiers Protégés Intacts (Non Modifiés)

- `src/features/licensing/engines/*` (Moteurs LMSE et signatures 100% intacts)
- `src/business/*` (Règles biologiques et validation métier 100% intactes)
- `src/features/genetics/engines/*`
- `src/features/reproduction/*`
- `src/features/intelligence/engines/*`
- `src/reference/species/*`
- `src/utils/translations.ts`
- `src/components/ui/HorizontalScrollContainer.tsx`
- `src/components/ui/ScrollableTabs.tsx`

---

## 6. Synthèse des Protocoles Fonctionnels

### Protocole A — Upgrade (RC2 / RC3 → RC3.1)
- L'utilisateur installe RC3.1 par-dessus RC2/RC3 ou après une désinstallation standard NSIS.
- **Résultat :** Licence conservée, données d'élevage (oiseaux, cages, couples, dépenses, ventes) conservées, devise, langue et thème conservés, Wizard non réaffiché.

### Protocole B — Clean Install
- Sur un PC vierge ou après exécution de `npm run qa:reset-windows-user`.
- **Résultat :** `FirstLaunchActivationScreen` s'affiche $\rightarrow$ Saisie/import de licence $\rightarrow$ `WelcomeWizard` $\rightarrow$ Base d'élevage vierge initiale (0 oiseaux, 0 couples, 0 dépenses). Référentiels biologiques et 5 langues opérationnels.

### Protocole C — Factory Reset QA
- Commande : `npm run qa:reset-windows-user`.
- **Résultat :** Arrêt propre des processus, purge des profils `%APPDATA%`, préservation intégrale du code et des binaires, application prête pour un Clean Install.

---

## 7. Conservation des Releases Antérieures

Toutes les releases et binaires antérieurs sont conservés intacts :
- `Release/Windows-RC1/`
- `Release/RC2.5/`
- `Release/Windows-RC3/`
- `Release/Windows-RC3.1/`

---

## 8. Statut Final

```
==================================================
STATUS: BUILD SUCCESS
VERSION: Windows RC3.1 (1.3.6-BUG01-FIRST-LAUNCH-FIX)
ALL TESTS: PASS (566 / 566)
BINARY INTEGRITY: SHA-256 VERIFIED
==================================================
```

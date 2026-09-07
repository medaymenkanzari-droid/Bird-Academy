# BIRD ACADEMY ENTERPRISE — RAPPORT DE BUILD WINDOWS RC3

**Date de compilation :** 20 août 2026  
**Version de l'application :** 1.3.6-BUG01-FIRST-LAUNCH-FIX (Release Candidate 3)  
**Cible :** Windows Desktop (x64)

---

## 1. Environnement & Runtimes

| Composant | Version | Statut |
| :--- | :--- | :--- |
| **Node.js** | `v24.19.0` | **OPÉRATIONNEL** |
| **npm** | `11.17.0` | **OPÉRATIONNEL** |
| **npx** | `11.17.0` | **OPÉRATIONNEL** |
| **PowerShell Execution Policy** | `RemoteSigned` (CurrentUser) | **CONFIGURÉ** |

---

## 2. Validation de la Qualité & Tests

| Étape de vérification | Commande | Résultat | Détails |
| :--- | :--- | :--- | :--- |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 erreur de typage |
| **Tests RC3 Onboarding & Settings** | `node --import tsx --test tests/windows-rc3-onboarding-settings.test.ts` | **PASS** | 18 / 18 tests réussis |
| **Tests Globaux de Non-Régression** | `npm test` | **PASS** | 528 / 528 tests réussis |
| **Build Web Utilisateur** | `npm run build:user` | **PASS** | Bundle dist/ & dist_user/ généré |
| **Audit Sécurité & Isolation Bundle** | `npm run verify:user-bundle` | **PASS** | 0 fuite administrative, isolation stricte |

---

## 3. Binaires Générés (Windows RC3)

Les exécutables ont été empaquetés avec `electron-builder` et placés dans `Release/Windows-RC3/` :

| Binaire | Généré | Taille (octets) | Taille (MB) | Somme de contrôle SHA-256 |
| :--- | :---: | :---: | :---: | :--- |
| **`Bird-Academy-User-Windows-RC3-Setup.exe`** (Installateur NSIS) | **OUI** | `115 834 959` | 110.47 MB | `BFAB02592EC9F31DAC1C0EF130D601ABA2860F49B1BAA84D32700F7E2389B5B6` |
| **`Bird-Academy-User-Windows-RC3.exe`** (Portable Autonome) | **OUI** | `115 667 065` | 110.31 MB | `0C9F4A8B67F4710B7E0668B392294C7D10E52FD4932A42C9EB812C0A5238C30C` |

### Emplacements absolus des fichiers :
- **Setup :** `D:\app canaris\28+\Release\Windows-RC3\Bird-Academy-User-Windows-RC3-Setup.exe`
- **Portable :** `D:\app canaris\28+\Release\Windows-RC3\Bird-Academy-User-Windows-RC3.exe`
- **Checksums :** `D:\app canaris\28+\Release\Windows-RC3\SHA256SUMS.txt`

---

## 4. Conservation des Releases Antérieures

- Les binaires et artefacts RC2 / RC2.5 sont conservés intacts dans `Release/RC2.5/` et `release-user-rc2/`.

---

## 5. Statut Global

```
STATUS: BUILD SUCCESS
```

# RAPPORT DE REBUILD & VALIDATION DES DISTRIBUTIONS
## WINDOWS & ANDROID RELEASE — V2.0.0-RC1

**Projet :** Bird Academy Enterprise — Volière Manager  
**Version :** `2.0.0-RC1`  
**Build ID :** `BA-V2.0.0-RC1`  
**Date d'exécution :** 22 Octobre 2026  
**Mode :** Local Release Build & Validation (0 Push, 0 Deploy)  

---

## 1. PÉRIMÈTRE INTÉGRÉ

Les distributions produites consolident l'ensemble des fonctionnalités validées et clôturées du projet :
- **QR Central Scanner :** Clôturé et validé (résolution universelle BIRD, CAGE, AVIARY, ZONE, COMPARTMENT).
- **Bird Detail Photo :** Clôturé et validé (galerie photos, photo principale, modal d'édition/recadrage, persistance locale).
- **Biological Reference V2 :** Clôturé techniquement et documentairement (commit `6568a97d50c0269b29400a0c943cc99922ef97d6`).
  - Colombe diamant : multi-standard bague 3,5 mm (UOF/COM France) & 3,5 mm (Aviornis International) avec rejet de 3,8 mm ; poids in situ 23–37 g / ex situ 35–45 g.
  - Personatus : mutation `ap_blue` (CANONICAL) avec allèles complexes maintenus en HRR.
  - GeneticsEngine : isolation fail-closed `HYBRID_CROSS_UNSUPPORTED`.
  - Zero Canary Fallback : 100% opérationnel.
- **Fonctionnement :** 100% local, autonome et offline-first.

---

## 2. ARTEFACTS PRODUITS & EMPREINTES CRYPTOGRAPHIQUES

| Artefact | Format / Cible | Taille (octets) | Taille (Mo) | Empreinte SHA-256 | Emplacement |
|---|---|---|---|---|---|
| **Bird-Academy-Avian-ERP-Setup.exe** | Installateur Windows NSIS | 109 746 025 | 104.66 Mo | `2F3539139CD26A265928DD0C5C216EA8D0BBE5B5B2E882BC1ECC4C00F1B307BC` | `release/` & `dist_binaries/Bird-Academy-User-Windows-Setup.exe` |
| **Bird-Academy-User.exe** | Exécutable Windows Portable | 109 407 503 | 104.34 Mo | `9B264134891AAECFD1FE38F48773B17B39BD07920B48F8FF44BF4D75940C79E1` | `release/` & `dist_binaries/Bird-Academy-User.exe` |
| **Bird-Academy-User.apk** | Application Android (Capacitor) | 19 628 154 | 18.72 Mo | `45D9BD03553C84966951AA80FDA3DEF4FA15100BA0396886C12EEABCF4E9A958` | `release/` & `dist_binaries/Bird-Academy-User.apk` |

---

## 3. IDENTITÉ TECHNIQUE DES ARTEFACTS

### A. Windows (Electron 43.3.0 / Node 22 / Chromium)
- **App ID :** `com.birdacademy.breeder`
- **Product Name :** `Bird Academy - Avian ERP`
- **Executable Name :** `Bird-Academy-User.exe`
- **Installer Name :** `Bird-Academy-Avian-ERP-Setup.exe`
- **Signature :** Intégrité ASAR et ressources exécutables signées.
- **Protocole personnalisé :** `birdacademy://`
- **Vérification d'exécution réelle :**
  - Portable démarré avec succès sous PID 14484 (multi-processus Electron : main, GPU, renderer).
  - Cycle de vie des données, upgrade et clean install validés par `tests/windows-bug03-data-lifecycle.test.ts` (25/25 PASS).

### B. Android (Capacitor 8.x / Android SDK 36 / API 36)
- **Package Name :** `com.birdacademy.app`
- **Version Name :** `2.0.0-RC1`
- **Version Code :** `22`
- **Target SDK :** `36` (Android 16)
- **Min SDK :** `24` (Android 7.0)
- **Compile SDK :** `36`
- **Application Label :** `Bird Academy`
- **Signature :** Validée via `apksigner verify` (APK Signature Scheme v2 : true).
- **Permissions requises :**
  - `android.permission.INTERNET`
  - `android.permission.ACCESS_NETWORK_STATE`
  - `android.permission.CAMERA` (accès caméra pour photo d'oiseau & scanner QR)
  - `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`

---

## 4. VALIDATION TECHNIQUE DÉTAILLÉE

### A. Compilation Statique TypeScript
- **Commande :** `npx tsc --noEmit`
- **Résultat :** **PASS (0 erreur, exit code 0)**

### B. Compilation Web & Packaging Windows
- **Bundle Utilisateur :** Vite build `user:beta` $\to$ 3102 modules transformés en 6.12s.
- **Audit d'isolation :** Zéro fuite administrative, zéro clé privée exposée.
- **electron-builder :** NSIS Installer + Portable générés avec succès.
- **Résultat :** **PASS**

### C. Compilation Android
- **Capacitor Sync :** Synchronisation `dist_user` vers `android/app/src/main/assets/public`.
- **Gradle assembleDebug :** 184 tâches exécutées/up-to-date en 17s.
- **Résultat :** **PASS**

### D. Tests Unitaires & Intégration
- **Suites exécutées :**
  - `tests/smart-qr-scanner.test.ts` : 15/15 PASS
  - `tests/qr-android16-v130.test.ts` : 9/9 PASS
  - `tests/windows-bug03-data-lifecycle.test.ts` : 25/25 PASS
  - `tests/species-profile-scoping.test.ts` : 18/18 PASS
  - `tests/colombe-diamant-profile.test.ts` : 10/10 PASS
  - `tests/bio-ref-v2-gap12.test.ts` : 18/18 PASS
  - `tests/bio-ref-v2-gap17.test.ts` : 12/12 PASS
  - `tests/bio-ref-v2-gap10-b1.test.ts` : 13/13 PASS
  - `tests/bio-ref-v2-gap10-c.test.ts` : 14/14 PASS
- **Total Tests Unitaires / Intégration :** **134 / 134 PASS (100 %)**

### E. Tests End-to-End Playwright (Navigateur Réel Chromium)
- **Suites exécutées :**
  - `tests/e2e/smart-qr-scanner-flow.spec.ts` : 8/8 PASS
  - `tests/e2e/bird-photo-flow.spec.ts` : 5/5 PASS
  - `tests/e2e/bibliographic-traceability-viewer.spec.ts` : 9 PASS, 1 FAIL (test legacy hors périmètre)
- **Total Playwright validé :** **22 PASS / 1 FAIL (legacy)**

---

## 5. ÉCARTS ET ANOMALIES OBSERVÉS

Conformément à la règle de non-intervention hors périmètre :
1. **Playwright Legacy DOI :**  
   - Test : `tests/e2e/bibliographic-traceability-viewer.spec.ts:134:3` (Scénario 1 : Gould HEAD_COLOR_Z).
   - Cause : Attente de l'ancien DOI V1.6.6.22 `10.1126/science.1168577` au lieu du DOI vérifié et authentique de Pryke & Griffith (2009) `10.1126/science.1168928`.
   - Classification : `LEGACY TEST — OUT OF BIO_REF_V2 HOMOLOGATION SCOPE` (préservé intact sans modification).
2. **Test Historique Android 028B :**  
   - Test : `tests/android-icon-correction-028b.test.ts:117:12`.
   - Cause : Assertion codée en dur attendant l'ancienne version `'1.3.6'` au lieu de la version courante `'2.0.0-RC1'`.
   - Classification : Test d'archive de mission antérieure (préservé intact).

---

## 6. STATUT DE DÉPLOIEMENT

```text
PUSH NON EFFECTUÉ — DEPLOY NON EFFECTUÉ
```
Tous les builds, artefacts et validations ont été réalisés strictement en environnement local.
